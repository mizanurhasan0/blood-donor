import "server-only";
import type { AnyBulkWriteOperation, ObjectId } from "mongodb";
import {
  collections,
  type JobStatus,
  type NotificationChannel,
  type NotificationJobDoc,
} from "@/lib/db/collections";

export type NewJob = Pick<NotificationJobDoc, "requestId" | "recipientId" | "channel" | "dedupeKey">;

/** Inserts jobs idempotently: an existing dedupe key is never duplicated or reset. */
export async function insertJobs(jobs: NewJob[], now = new Date()): Promise<number> {
  if (jobs.length === 0) return 0;
  const { jobs: col } = await collections();
  const ops: AnyBulkWriteOperation<NotificationJobDoc>[] = jobs.map((job) => ({
    updateOne: {
      filter: { dedupeKey: job.dedupeKey },
      update: {
        $setOnInsert: {
          ...job,
          status: "pending",
          attempts: 0,
          nextAttemptAt: now,
          createdAt: now,
          updatedAt: now,
        },
      },
      upsert: true,
    },
  }));
  await col.bulkWrite(ops, { ordered: false });
  // A request that was rejected and later re-approved gets its cancelled jobs back.
  // Sent jobs are left alone, so nobody is notified twice.
  await col.updateMany(
    { dedupeKey: { $in: jobs.map((j) => j.dedupeKey) }, status: "cancelled" },
    {
      $set: { status: "pending", attempts: 0, nextAttemptAt: now, updatedAt: now },
      $unset: { lastError: "" },
    },
  );
  return col.countDocuments({ dedupeKey: { $in: jobs.map((j) => j.dedupeKey) }, status: "pending" });
}

/**
 * Atomically claims due jobs for one channel. Jobs stuck in "processing"
 * (e.g. the worker crashed) become claimable again once their lock expires.
 */
export async function claimDueJobs(
  channel: NotificationChannel,
  limit: number,
  now = new Date(),
  lockMs = 5 * 60_000,
): Promise<NotificationJobDoc[]> {
  const { jobs } = await collections();
  const claimed: NotificationJobDoc[] = [];
  const lockedUntil = new Date(now.getTime() + lockMs);
  while (claimed.length < limit) {
    const job = await jobs.findOneAndUpdate(
      {
        channel,
        $or: [
          { status: "pending", nextAttemptAt: { $lte: now } },
          { status: "processing", lockedUntil: { $lt: now } },
        ],
      },
      { $set: { status: "processing", lockedUntil, updatedAt: now } },
      { sort: { nextAttemptAt: 1 }, returnDocument: "after" },
    );
    if (!job) break;
    claimed.push(job);
  }
  return claimed;
}

export async function completeJob(
  id: ObjectId,
  update: {
    status: JobStatus;
    attempts?: number;
    nextAttemptAt?: Date;
    lastError?: string;
    providerMessageId?: string;
  },
  now = new Date(),
): Promise<void> {
  const { jobs } = await collections();
  await jobs.updateOne(
    { _id: id },
    {
      $set: { ...update, updatedAt: now, ...(update.status === "sent" ? { sentAt: now } : {}) },
      $unset: { lockedUntil: "" },
    },
  );
}

/** Stops future delivery for requests that are fulfilled, expired, rejected or deleted. */
export async function cancelPendingJobs(requestIds: ObjectId[], reason: string): Promise<number> {
  if (requestIds.length === 0) return 0;
  const { jobs } = await collections();
  const result = await jobs.updateMany(
    { requestId: { $in: requestIds }, status: { $in: ["pending", "processing"] } },
    { $set: { status: "cancelled", lastError: reason, updatedAt: new Date() }, $unset: { lockedUntil: "" } },
  );
  return result.modifiedCount;
}

export async function deleteJobsForRequests(requestIds: ObjectId[]): Promise<void> {
  if (requestIds.length === 0) return;
  const { jobs } = await collections();
  await jobs.deleteMany({ requestId: { $in: requestIds } });
}

export async function countJobsByStatus(): Promise<Record<JobStatus, number>> {
  const { jobs } = await collections();
  const rows = await jobs
    .aggregate<{ _id: JobStatus; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();
  const counts: Record<JobStatus, number> = { pending: 0, processing: 0, sent: 0, failed: 0, cancelled: 0 };
  for (const row of rows) counts[row._id] = row.count;
  return counts;
}

export async function listFailedJobs(limit = 10) {
  const { jobs } = await collections();
  return jobs
    .find(
      { status: "failed" },
      { projection: { channel: 1, lastError: 1, attempts: 1, updatedAt: 1, requestId: 1 } },
    )
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray();
}
