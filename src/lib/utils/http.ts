import "server-only";
import { timingSafeEqual } from "node:crypto";
import { unstable_rethrow } from "next/navigation";
import { AppError } from "./result";

const STATUS: Record<AppError["code"], number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INVALID: 400,
  RATE_LIMITED: 429,
  CONFLICT: 409,
  UNAVAILABLE: 503,
};

export function jsonError(error: unknown): Response {
  // Let Next.js control-flow errors (prerender bail-outs, redirects) propagate.
  unstable_rethrow(error);
  if (error instanceof AppError) {
    // error.message is a feedback key; the client translates it.
    return Response.json({ error: error.message }, { status: STATUS[error.code] });
  }
  console.error("[route] unexpected error", error);
  return Response.json({ error: "somethingWentWrong" }, { status: 500 });
}

/** Constant-time comparison of a bearer token against the expected secret. */
export function hasBearer(request: Request, secret: string): boolean {
  const header = request.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
