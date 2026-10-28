import { ObjectId } from "mongodb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { collections, type UserDoc } from "@/lib/db/collections";
import { bumpDailyCounter, readDailyCounter } from "@/lib/security/rate-limit";
import {
  EmailNotificationService,
  verifyUnsubscribeToken,
  type EmailMessage,
  type EmailProvider,
} from "@/features/notifications/email.service";
import {
  enqueueRequestNotifications,
  processNotificationJobs,
} from "@/features/notifications/notification.service";
import { MAX_ATTEMPTS, ProviderError } from "@/features/notifications/retry";
import { updateDonorFlags } from "@/features/users/user.repository";
import { createDonor, createUser, ids, insertRequest, jobsFor } from "./support/fixtures";

const DAILY_LIMIT = 5; // EMAIL_DAILY_LIMIT in setup.ts

function fakeProvider(fail?: (message: EmailMessage) => Error | undefined) {
  const sent: EmailMessage[] = [];
  const provider: EmailProvider = {
    send: vi.fn(async (message: EmailMessage) => {
      const error = fail?.(message);
      if (error) throw error;
      sent.push(message);
      return { messageId: `brevo-${sent.length}` };
    }),
  };
  return { provider, sent };
}

async function emailJobs(requestId: ObjectId) {
  return (await jobsFor(requestId)).filter((j) => j.channel === "email");
}

async function recipientsOf(requestId: ObjectId) {
  return (await emailJobs(requestId)).map((j) => j.recipientId!.toHexString()).sort();
}

describe("enqueueRequestNotifications", () => {
  it("creates one Telegram job and one email job per matching donor, idempotently", async () => {
    const request = await insertRequest(await createUser());
    await createDonor();
    await createDonor();

    await expect(enqueueRequestNotifications(request, 10)).resolves.toEqual({ email: 2, telegram: 1 });
    await enqueueRequestNotifications(request, 10);

    const jobs = await jobsFor(request._id);
    expect(jobs).toHaveLength(3);
    expect(new Set(jobs.map((j) => j.dedupeKey)).size).toBe(3);
  });

  it("never resets a job that already exists", async () => {
    const request = await insertRequest(await createUser());
    await createDonor();
    await enqueueRequestNotifications(request, 10);
    const { jobs } = await collections();
    await jobs.updateMany({ requestId: request._id }, { $set: { status: "sent", attempts: 1 } });

    await enqueueRequestNotifications(request, 10);

    expect((await jobsFor(request._id)).map((j) => j.status)).toEqual(["sent", "sent"]);
  });

  describe("donor matching", () => {
    let creator: UserDoc;
    let sameDistrict: UserDoc[];
    let sameDivision: UserDoc[];

    beforeEach(async () => {
      // The creator is a matching donor too, but must never be notified about their own request.
      creator = await createDonor({ bloodGroup: "B+", district: "Dhaka" });
      sameDistrict = [await createDonor({ district: "Dhaka" }), await createDonor({ district: "Dhaka" })];
      sameDivision = [
        await createDonor({ district: "Gazipur" }),
        await createDonor({ district: "Narayanganj" }),
      ];
      await createDonor({ district: "Chattogram" }); // other division
      await createDonor({ district: "Dhaka", bloodGroup: "A+" }); // other blood group
      await createDonor({ district: "Dhaka", emailNotifications: false }); // opted out
      await createDonor({ district: "Dhaka", available: false }); // marked unavailable
      await createUser(); // not a donor
    });

    it("includes only available, opted-in donors with the same group in the division", async () => {
      const request = await insertRequest(creator);
      await expect(enqueueRequestNotifications(request, 10)).resolves.toEqual({ email: 4, telegram: 1 });
      expect(await recipientsOf(request._id)).toEqual(ids([...sameDistrict, ...sameDivision]));
    });

    it("fills the recipient cap from the same district before the rest of the division", async () => {
      const request = await insertRequest(creator);
      await enqueueRequestNotifications(request, 3);

      const recipients = await recipientsOf(request._id);
      expect(recipients).toHaveLength(3);
      expect(recipients).toEqual(expect.arrayContaining(ids(sameDistrict)));
      expect(ids(sameDivision)).toEqual(
        expect.arrayContaining(recipients.filter((r) => !ids(sameDistrict).includes(r))),
      );
    });

    it("uses only the same district when it alone fills the cap", async () => {
      const request = await insertRequest(creator);
      await enqueueRequestNotifications(request, 2);
      expect(await recipientsOf(request._id)).toEqual(ids(sameDistrict));
    });
  });

  it.each([
    ["pending", { status: "pending" as const }],
    ["past its needed date", { neededAt: new Date(Date.now() - 1_000) }],
  ])("queues nothing for a request that is %s", async (_label, overrides) => {
    const request = await insertRequest(await createUser(), overrides);
    await createDonor();
    await expect(enqueueRequestNotifications(request, 10)).resolves.toEqual({ email: 0, telegram: 0 });
    expect(await jobsFor(request._id)).toHaveLength(0);
  });

  // Regression: MongoDB treats limit(0) as "no limit", so a zero cap must queue no emails.
  it("queues no email jobs when the recipient cap is 0 (email not configured)", async () => {
    const request = await insertRequest(await createUser());
    await createDonor();
    await createDonor();
    await expect(enqueueRequestNotifications(request, 0)).resolves.toEqual({ email: 0, telegram: 1 });
  });
});

describe("processNotificationJobs", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  async function queued(donorCount: number, overrides: Parameters<typeof insertRequest>[1] = {}) {
    const request = await insertRequest(await createUser(), { urgency: "urgent", ...overrides });
    const donors: UserDoc[] = [];
    for (let i = 0; i < donorCount; i++) donors.push(await createDonor());
    await enqueueRequestNotifications(request, 10);
    return { request, donors };
  }

  it("emails each donor individually, records the result and counts the daily quota", async () => {
    const { request, donors } = await queued(2);
    const { provider, sent } = fakeProvider();

    const summary = await processNotificationJobs({ emailProvider: provider });

    expect(summary).toEqual({
      sent: 2,
      retrying: 0,
      failed: 0,
      cancelled: 0,
      emailQuotaRemaining: DAILY_LIMIT - 2,
      skippedChannels: ["telegram"],
    });
    expect(sent.map((m) => m.to.email).sort()).toEqual(donors.map((d) => d.email).sort());
    for (const message of sent) {
      expect(message.subject).toBe("Urgent: Blood Needed: B+ in Dhaka");
      expect(message.html).toContain(`https://bloodlink.test/requests/${request._id.toHexString()}`);
      const unsubscribe = new URL(message.headers!["List-Unsubscribe"].slice(1, -1));
      const donor = donors.find((d) => d.email === message.to.email)!;
      expect(unsubscribe.searchParams.get("u")).toBe(donor._id.toHexString());
      expect(verifyUnsubscribeToken(donor._id.toHexString(), unsubscribe.searchParams.get("t")!)).toBe(true);
    }

    const jobs = await jobsFor(request._id);
    for (const job of jobs.filter((j) => j.channel === "email")) {
      expect(job).toMatchObject({
        status: "sent",
        attempts: 1,
        providerMessageId: expect.stringMatching(/^brevo-/),
      });
      expect(job.sentAt).toBeInstanceOf(Date);
      expect(job.lockedUntil).toBeUndefined();
    }
    // Telegram isn't configured in tests: its job waits instead of being dropped.
    expect(jobs.find((j) => j.channel === "telegram")).toMatchObject({ status: "pending", attempts: 0 });
    expect(await readDailyCounter("quota:email")).toBe(2);
  });

  it("does not send a job twice", async () => {
    await queued(1);
    const { provider } = fakeProvider();
    await processNotificationJobs({ emailProvider: provider });

    const second = await processNotificationJobs({ emailProvider: provider });

    expect(second.sent).toBe(0);
    expect(provider.send).toHaveBeenCalledTimes(1);
  });

  it("reschedules retryable failures with backoff and doesn't count them against the quota", async () => {
    const { request } = await queued(1);
    const { provider } = fakeProvider(() => new ProviderError("Brevo 503: busy", true));
    const before = Date.now();

    const summary = await processNotificationJobs({ emailProvider: provider });

    expect(summary).toMatchObject({ sent: 0, retrying: 1, failed: 0 });
    const [job] = await emailJobs(request._id);
    expect(job).toMatchObject({ status: "pending", attempts: 1, lastError: "Brevo 503: busy" });
    expect(job.nextAttemptAt.getTime()).toBeGreaterThanOrEqual(before + 60_000);
    expect(job.nextAttemptAt.getTime()).toBeLessThanOrEqual(Date.now() + 60_000);
    expect(await readDailyCounter("quota:email")).toBe(0);

    // Not due yet, so an immediate second run leaves it alone.
    await processNotificationJobs({ emailProvider: provider });
    expect(provider.send).toHaveBeenCalledTimes(1);
  });

  it("treats unexpected errors as retryable", async () => {
    const { request } = await queued(1);
    const { provider } = fakeProvider(() => new Error("socket hang up"));
    await processNotificationJobs({ emailProvider: provider });
    expect(await emailJobs(request._id)).toMatchObject([
      { status: "pending", attempts: 1, lastError: "socket hang up" },
    ]);
  });

  it("fails permanently on a non-retryable provider error", async () => {
    const { request } = await queued(1);
    const { provider } = fakeProvider(() => ProviderError.fromStatus("Brevo", 400, "invalid email"));

    const summary = await processNotificationJobs({ emailProvider: provider });

    expect(summary).toMatchObject({ failed: 1, retrying: 0 });
    expect(await emailJobs(request._id)).toMatchObject([
      { status: "failed", lastError: "Brevo 400: invalid email" },
    ]);
  });

  it(`gives up after ${MAX_ATTEMPTS} attempts`, async () => {
    const { request } = await queued(1);
    const { jobs } = await collections();
    await jobs.updateMany(
      { requestId: request._id, channel: "email" },
      { $set: { attempts: MAX_ATTEMPTS - 1, nextAttemptAt: new Date(Date.now() - 1_000) } },
    );
    const { provider } = fakeProvider(() => new ProviderError("Brevo 502: bad gateway", true));

    await processNotificationJobs({ emailProvider: provider });

    expect(await emailJobs(request._id)).toMatchObject([{ status: "failed", attempts: MAX_ATTEMPTS }]);
  });

  it("leaves every job pending once the daily quota is used up", async () => {
    const { request } = await queued(2);
    for (let i = 0; i < DAILY_LIMIT; i++) await bumpDailyCounter("quota:email");
    const { provider } = fakeProvider();

    const summary = await processNotificationJobs({ emailProvider: provider });

    expect(provider.send).not.toHaveBeenCalled();
    expect(summary.emailQuotaRemaining).toBe(0);
    expect((await emailJobs(request._id)).map((j) => j.status)).toEqual(["pending", "pending"]);
  });

  it("sends only as many emails as the remaining quota allows", async () => {
    const { request } = await queued(3);
    for (let i = 0; i < DAILY_LIMIT - 2; i++) await bumpDailyCounter("quota:email");
    const { provider } = fakeProvider();

    const summary = await processNotificationJobs({ emailProvider: provider });

    expect(summary).toMatchObject({ sent: 2, emailQuotaRemaining: 0 });
    expect((await emailJobs(request._id)).map((j) => j.status).sort()).toEqual(["pending", "sent", "sent"]);
  });

  it("cancels jobs for a request that was closed before delivery", async () => {
    const { request } = await queued(2);
    const { requests } = await collections();
    await requests.updateOne({ _id: request._id }, { $set: { status: "fulfilled" } });
    const { provider } = fakeProvider();

    const summary = await processNotificationJobs({ emailProvider: provider });

    expect(provider.send).not.toHaveBeenCalled();
    expect(summary.cancelled).toBe(2);
    expect((await emailJobs(request._id)).map((j) => j.status)).toEqual(["cancelled", "cancelled"]);
  });

  it("cancels the job of a donor who opted out after it was queued", async () => {
    const { request, donors } = await queued(2);
    await updateDonorFlags(donors[0]._id, { emailNotifications: false });
    const { provider, sent } = fakeProvider();

    await processNotificationJobs({ emailProvider: provider });

    expect(sent.map((m) => m.to.email)).toEqual([donors[1].email]);
    const jobs = await emailJobs(request._id);
    expect(jobs.find((j) => j.recipientId!.equals(donors[0]._id))!.status).toBe("cancelled");
  });

  it("reclaims jobs left processing by a crashed worker once their lock expires", async () => {
    const { request } = await queued(1);
    const { jobs } = await collections();
    await jobs.updateMany(
      { requestId: request._id, channel: "email" },
      { $set: { status: "processing", lockedUntil: new Date(Date.now() - 1_000) } },
    );
    const { provider } = fakeProvider();

    await processNotificationJobs({ emailProvider: provider });

    expect(await emailJobs(request._id)).toMatchObject([{ status: "sent" }]);
  });

  it("leaves jobs locked by a running worker alone", async () => {
    const { request } = await queued(1);
    const { jobs } = await collections();
    await jobs.updateMany(
      { requestId: request._id, channel: "email" },
      { $set: { status: "processing", lockedUntil: new Date(Date.now() + 60_000) } },
    );
    const { provider } = fakeProvider();

    await processNotificationJobs({ emailProvider: provider });

    expect(provider.send).not.toHaveBeenCalled();
  });
});

describe("unsubscribe headers", () => {
  it("advertise RFC 8058 one-click unsubscribe via POST /api/unsubscribe", () => {
    const message = EmailNotificationService.build(
      {
        id: new ObjectId().toHexString(),
        bloodGroup: "B+",
        units: 1,
        hospitalName: "Dhaka Medical College Hospital",
        district: "Dhaka",
        neededAt: new Date(),
        urgency: "normal",
        description: "",
      },
      { id: new ObjectId().toHexString(), email: "donor@example.test", name: "Donor" },
    );
    expect(message.headers).toMatchObject({
      "List-Unsubscribe": expect.stringContaining("https://bloodlink.test/api/unsubscribe?u="),
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });
  });
});
