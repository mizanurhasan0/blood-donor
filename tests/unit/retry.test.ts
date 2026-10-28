import { describe, expect, it } from "vitest";
import {
  dedupeKeys,
  MAX_ATTEMPTS,
  planFailure,
  ProviderError,
  retryDelayMs,
} from "@/features/notifications/retry";

const MINUTE = 60_000;
const now = new Date("2026-03-10T12:00:00Z");
const at = (ms: number) => new Date(now.getTime() + ms);

describe("retryDelayMs", () => {
  it("doubles from one minute and caps at six hours", () => {
    expect([0, 1, 2, 3, 4].map(retryDelayMs)).toEqual([MINUTE, MINUTE, 2 * MINUTE, 4 * MINUTE, 8 * MINUTE]);
    expect(retryDelayMs(9)).toBe(256 * MINUTE);
    expect(retryDelayMs(10)).toBe(6 * 60 * MINUTE);
    expect(retryDelayMs(50)).toBe(6 * 60 * MINUTE);
  });
});

describe("planFailure", () => {
  it("schedules a retryable failure with exponential backoff", () => {
    expect(planFailure(0, { retryable: true }, now)).toEqual({
      status: "pending",
      attempts: 1,
      nextAttemptAt: at(MINUTE),
    });
    expect(planFailure(3, { retryable: true }, now)).toEqual({
      status: "pending",
      attempts: 4,
      nextAttemptAt: at(8 * MINUTE),
    });
  });

  it(`gives up after ${MAX_ATTEMPTS} attempts`, () => {
    expect(planFailure(MAX_ATTEMPTS - 2, { retryable: true }, now).status).toBe("pending");
    expect(planFailure(MAX_ATTEMPTS - 1, { retryable: true }, now)).toMatchObject({
      status: "failed",
      attempts: MAX_ATTEMPTS,
    });
  });

  it("fails non-retryable errors immediately", () => {
    expect(planFailure(0, { retryable: false }, now)).toMatchObject({ status: "failed", attempts: 1 });
  });

  it("honours a provider's Retry-After when it is longer than the backoff", () => {
    expect(planFailure(0, { retryable: true, retryAfterMs: 10 * MINUTE }, now).nextAttemptAt).toEqual(
      at(10 * MINUTE),
    );
    expect(planFailure(3, { retryable: true, retryAfterMs: 1_000 }, now).nextAttemptAt).toEqual(
      at(8 * MINUTE),
    );
  });
});

describe("ProviderError.fromStatus", () => {
  it.each([429, 500, 502, 503])("treats %d as transient", (status) => {
    expect(ProviderError.fromStatus("Brevo", status, "busy").retryable).toBe(true);
  });

  it.each([400, 401, 403, 404, 422])("treats %d as permanent", (status) => {
    expect(ProviderError.fromStatus("Brevo", status, "bad request").retryable).toBe(false);
  });

  it("keeps the provider, status and retry hint but bounds the message", () => {
    const error = ProviderError.fromStatus("Telegram", 429, "x".repeat(1_000), 30_000);
    expect(error.message.startsWith("Telegram 429: ")).toBe(true);
    expect(error.message).toHaveLength(300);
    expect(error.retryAfterMs).toBe(30_000);
    expect(error).toBeInstanceOf(Error);
  });
});

describe("dedupeKeys", () => {
  it("is unique per channel, request and recipient", () => {
    expect(dedupeKeys.email("r1", "u1")).toBe("email:r1:u1");
    expect(dedupeKeys.telegram("r1")).toBe("telegram:r1");
    const keys = new Set([
      dedupeKeys.email("r1", "u1"),
      dedupeKeys.email("r1", "u2"),
      dedupeKeys.email("r2", "u1"),
      dedupeKeys.telegram("r1"),
      dedupeKeys.telegram("r2"),
    ]);
    expect(keys.size).toBe(5);
  });
});
