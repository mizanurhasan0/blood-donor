import type { JobStatus } from "@/lib/db/collections";

export const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 60_000;
const MAX_DELAY_MS = 6 * 60 * 60 * 1000;

/** 1m, 2m, 4m, 8m… capped at 6h. `attempts` counts the failure just recorded. */
export function retryDelayMs(attempts: number): number {
  return Math.min(BASE_DELAY_MS * 2 ** Math.max(0, attempts - 1), MAX_DELAY_MS);
}

export interface FailurePlan {
  status: Extract<JobStatus, "pending" | "failed">;
  attempts: number;
  nextAttemptAt: Date;
}

export function planFailure(
  previousAttempts: number,
  options: { retryable: boolean; retryAfterMs?: number },
  now = new Date(),
): FailurePlan {
  const attempts = previousAttempts + 1;
  const giveUp = !options.retryable || attempts >= MAX_ATTEMPTS;
  const delay = Math.max(options.retryAfterMs ?? 0, retryDelayMs(attempts));
  return {
    status: giveUp ? "failed" : "pending",
    attempts,
    nextAttemptAt: new Date(now.getTime() + delay),
  };
}

export const dedupeKeys = {
  email: (requestId: string, recipientId: string) => `email:${requestId}:${recipientId}`,
  telegram: (requestId: string) => `telegram:${requestId}`,
};

/** Error raised by a notification provider, classified for the retry policy. */
export class ProviderError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }

  /** 429 and 5xx are transient; other 4xx mean the request itself is wrong. */
  static fromStatus(provider: string, status: number, detail: string, retryAfterMs?: number) {
    const retryable = status === 429 || status >= 500;
    return new ProviderError(`${provider} ${status}: ${detail}`.slice(0, 300), retryable, retryAfterMs);
  }
}
