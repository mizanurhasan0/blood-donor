/** Uniform return shape for Server Actions consumed by client forms. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function ok<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function fail(error: string, fieldErrors?: Record<string, string[]>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/** Error thrown by services for expected, user-facing failures. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly code:
      | "UNAUTHENTICATED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "INVALID"
      | "RATE_LIMITED"
      | "CONFLICT"
      | "UNAVAILABLE" = "INVALID",
  ) {
    super(message);
    this.name = "AppError";
  }
}
