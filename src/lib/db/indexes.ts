import "server-only";
import type { Collections } from "./collections";

/**
 * Every index the app relies on. createIndexes is idempotent, so this runs
 * once per process on first database use.
 */
export async function ensureIndexes(c: Collections): Promise<void> {
  await Promise.all([
    c.users.createIndexes([
      { key: { googleId: 1 }, unique: true },
      // Donor matching and donor stats.
      {
        key: { "donorProfile.bloodGroup": 1, "donorProfile.district": 1 },
        partialFilterExpression: { "donorProfile.bloodGroup": { $exists: true } },
        name: "donor_match",
      },
      {
        key: { "donorProfile.telegramUserId": 1 },
        unique: true,
        partialFilterExpression: { "donorProfile.telegramUserId": { $exists: true } },
      },
    ]),
    c.requests.createIndexes([
      { key: { status: 1, createdAt: -1 } },
      { key: { status: 1, bloodGroup: 1, district: 1, createdAt: -1 } },
      { key: { status: 1, neededAt: 1 } },
      { key: { creatorId: 1, createdAt: -1 } },
      { key: { reportCount: -1 }, partialFilterExpression: { reportCount: { $gt: 0 } } },
      { key: { hospitalName: "text", district: "text" }, name: "request_search" },
    ]),
    c.comments.createIndexes([
      { key: { requestId: 1, parentId: 1, _id: -1 } },
      { key: { parentId: 1, createdAt: 1 } },
      { key: { authorId: 1, createdAt: -1 } },
      { key: { reportCount: -1 }, partialFilterExpression: { reportCount: { $gt: 0 } } },
    ]),
    c.jobs.createIndexes([
      { key: { dedupeKey: 1 }, unique: true },
      { key: { status: 1, nextAttemptAt: 1 } },
      { key: { requestId: 1, status: 1 } },
    ]),
    c.telegramLinks.createIndexes([
      { key: { tokenHash: 1 }, unique: true },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
    ]),
    c.revealLogs.createIndexes([
      { key: { requestId: 1, userId: 1 } },
      { key: { createdAt: 1 }, expireAfterSeconds: 60 * 60 * 24 * 180 },
    ]),
    c.rateLimits.createIndexes([{ key: { expiresAt: 1 }, expireAfterSeconds: 0 }]),
  ]);
}
