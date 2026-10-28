import "server-only";
import { collections } from "@/lib/db/collections";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Fixed-window limiter backed by MongoDB, so limits survive restarts and are
 * shared by every app instance. Expired windows are removed by a TTL index.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  now = Date.now(),
): Promise<RateLimitResult> {
  const windowStart = Math.floor(now / 1000 / windowSeconds) * windowSeconds;
  const expiresAt = new Date((windowStart + windowSeconds) * 1000);
  const { rateLimits } = await collections();
  const doc = await rateLimits.findOneAndUpdate(
    { _id: `${key}:${windowStart}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, returnDocument: "after" },
  );
  const count = doc?.count ?? 1;
  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
  };
}

/** Named policies so limits live in one place. */
export const RATE_LIMITS = {
  comment: { limit: 6, windowSeconds: 60 },
  requestCreate: { limit: 3, windowSeconds: 60 * 60 * 24 },
  upload: { limit: 10, windowSeconds: 60 * 60 },
  phoneReveal: { limit: 10, windowSeconds: 60 * 60 },
  report: { limit: 20, windowSeconds: 60 * 60 * 24 },
  telegramLink: { limit: 5, windowSeconds: 60 * 60 },
} as const;

export async function enforceRateLimit(
  policy: keyof typeof RATE_LIMITS,
  subject: string,
): Promise<RateLimitResult> {
  const { limit, windowSeconds } = RATE_LIMITS[policy];
  return rateLimit(`${policy}:${subject}`, limit, windowSeconds);
}

/** Reads a daily counter (e.g. an email provider quota) without incrementing it. */
export async function readDailyCounter(name: string, now = new Date()): Promise<number> {
  const { rateLimits } = await collections();
  const doc = await rateLimits.findOne({ _id: `${name}:${now.toISOString().slice(0, 10)}` });
  return doc?.count ?? 0;
}

export async function bumpDailyCounter(name: string, now = new Date()): Promise<void> {
  const day = now.toISOString().slice(0, 10);
  const { rateLimits } = await collections();
  await rateLimits.updateOne(
    { _id: `${name}:${day}` },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date(Date.parse(`${day}T00:00:00Z`) + 2 * 86_400_000) },
    },
    { upsert: true },
  );
}
