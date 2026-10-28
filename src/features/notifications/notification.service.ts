import "server-only";
import type { ObjectId } from "mongodb";
import { collections, type BloodRequestDoc, type NotificationJobDoc } from "@/lib/db/collections";
import { isConfigured } from "@/lib/env";
import { findMatchingDonors } from "@/features/users/user.repository";
import { setTelegramMessageId } from "@/features/requests/request.repository";
import { isNotifiable } from "@/features/requests/permissions";
import { EmailNotificationService, type EmailProvider } from "./email.service";
import {
  cancelPendingJobs,
  claimDueJobs,
  completeJob,
  insertJobs,
  type NewJob,
} from "./notification.repository";
import { dedupeKeys, planFailure, ProviderError } from "./retry";
import { TelegramService } from "./telegram.service";
import type { NotifiableRequest } from "./templates";

function toNotifiable(doc: BloodRequestDoc): NotifiableRequest {
  return {
    id: doc._id.toHexString(),
    bloodGroup: doc.bloodGroup,
    units: doc.units,
    hospitalName: doc.hospitalName,
    district: doc.district,
    neededAt: doc.neededAt,
    urgency: doc.urgency,
    description: doc.description,
  };
}

/**
 * Creates durable jobs for a newly published request and returns at once —
 * delivery happens later in processNotificationJobs. Safe to call twice.
 */
export async function enqueueRequestNotifications(request: BloodRequestDoc, maxRecipients: number) {
  if (!isNotifiable(request)) return { email: 0, telegram: 0 };
  const requestId = request._id.toHexString();
  const donors = await findMatchingDonors({
    bloodGroup: request.bloodGroup,
    district: request.district,
    division: request.division,
    excludeUserId: request.creatorId,
    limit: maxRecipients,
  });
  const jobs: NewJob[] = [
    {
      requestId: request._id,
      recipientId: null,
      channel: "telegram",
      dedupeKey: dedupeKeys.telegram(requestId),
    },
    ...donors.map((donor) => ({
      requestId: request._id,
      recipientId: donor._id,
      channel: "email" as const,
      dedupeKey: dedupeKeys.email(requestId, donor._id.toHexString()),
    })),
  ];
  await insertJobs(jobs);
  return { email: donors.length, telegram: 1 };
}

export function cancelRequestNotifications(requestIds: ObjectId[], reason: string) {
  return cancelPendingJobs(requestIds, reason);
}

export interface ProcessSummary {
  sent: number;
  retrying: number;
  failed: number;
  cancelled: number;
  emailQuotaRemaining: number | null;
  skippedChannels: string[];
}

async function loadRequests(jobs: NotificationJobDoc[]) {
  const ids = [...new Set(jobs.map((j) => j.requestId.toHexString()))];
  if (ids.length === 0) return new Map<string, BloodRequestDoc>();
  const { requests } = await collections();
  const docs = await requests.find({ _id: { $in: jobs.map((j) => j.requestId) } }).toArray();
  return new Map(docs.map((d) => [d._id.toHexString(), d]));
}

async function loadRecipients(jobs: NotificationJobDoc[]) {
  const ids = jobs.map((j) => j.recipientId).filter((id): id is ObjectId => id !== null);
  if (ids.length === 0) return new Map();
  const { users } = await collections();
  const docs = await users
    .find({ _id: { $in: ids } }, { projection: { _id: 1, email: 1, name: 1, donorProfile: 1 } })
    .toArray();
  return new Map(docs.map((d) => [d._id.toHexString(), d]));
}

async function recordFailure(job: NotificationJobDoc, error: unknown, summary: ProcessSummary) {
  const providerError =
    error instanceof ProviderError
      ? error
      : new ProviderError(error instanceof Error ? error.message : String(error), true);
  const plan = planFailure(job.attempts, providerError);
  await completeJob(job._id, { ...plan, lastError: providerError.message });
  if (plan.status === "failed") {
    summary.failed++;
    console.error(
      `[notifications] ${job.channel} job ${job._id} failed permanently: ${providerError.message}`,
    );
  } else {
    summary.retrying++;
  }
}

async function processTelegram(jobs: NotificationJobDoc[], summary: ProcessSummary) {
  const requests = await loadRequests(jobs);
  for (const job of jobs) {
    const request = requests.get(job.requestId.toHexString());
    if (!request || !isNotifiable(request)) {
      await completeJob(job._id, { status: "cancelled", lastError: "Request no longer active" });
      summary.cancelled++;
      continue;
    }
    // Never post the same request twice, even if a previous run crashed mid-way.
    if (request.telegramMessageId) {
      await completeJob(job._id, { status: "sent", providerMessageId: String(request.telegramMessageId) });
      continue;
    }
    try {
      const messageId = await TelegramService.postRequest(toNotifiable(request));
      await setTelegramMessageId(request._id, messageId);
      await completeJob(job._id, {
        status: "sent",
        attempts: job.attempts + 1,
        providerMessageId: String(messageId),
      });
      summary.sent++;
    } catch (error) {
      await recordFailure(job, error, summary);
    }
  }
}

async function processEmail(jobs: NotificationJobDoc[], summary: ProcessSummary, provider?: EmailProvider) {
  const [requests, recipients] = await Promise.all([loadRequests(jobs), loadRecipients(jobs)]);
  for (const job of jobs) {
    const request = requests.get(job.requestId.toHexString());
    const recipient = job.recipientId ? recipients.get(job.recipientId.toHexString()) : undefined;
    const optedIn = recipient?.donorProfile?.emailNotifications && recipient.donorProfile.available;
    if (!request || !isNotifiable(request) || !recipient || !optedIn) {
      await completeJob(job._id, {
        status: "cancelled",
        lastError: "Request inactive or recipient opted out",
      });
      summary.cancelled++;
      continue;
    }
    try {
      const message = EmailNotificationService.build(toNotifiable(request), {
        id: recipient._id.toHexString(),
        email: recipient.email,
        name: recipient.donorProfile?.fullName ?? recipient.name,
      });
      const { messageId } = await EmailNotificationService.send(message, provider);
      await completeJob(job._id, {
        status: "sent",
        attempts: job.attempts + 1,
        providerMessageId: messageId,
      });
      summary.sent++;
    } catch (error) {
      await recordFailure(job, error, summary);
    }
  }
}

/**
 * Background worker entry point, invoked by the protected cron route.
 * Unconfigured channels are skipped (jobs stay pending, never dropped), and
 * email stops at the provider's daily quota — the rest wait for tomorrow.
 */
export async function processNotificationJobs(
  options: { batchSize?: number; emailProvider?: EmailProvider } = {},
): Promise<ProcessSummary> {
  const batchSize = options.batchSize ?? 25;
  const summary: ProcessSummary = {
    sent: 0,
    retrying: 0,
    failed: 0,
    cancelled: 0,
    emailQuotaRemaining: null,
    skippedChannels: [],
  };

  if (isConfigured("telegram")) {
    await processTelegram(await claimDueJobs("telegram", 10), summary);
  } else {
    summary.skippedChannels.push("telegram");
  }

  if (options.emailProvider || isConfigured("email")) {
    const remaining = await EmailNotificationService.remainingQuota();
    if (remaining > 0) {
      await processEmail(
        await claimDueJobs("email", Math.min(batchSize, remaining)),
        summary,
        options.emailProvider,
      );
    }
    summary.emailQuotaRemaining = await EmailNotificationService.remainingQuota();
  } else {
    summary.skippedChannels.push("email");
  }

  return summary;
}
