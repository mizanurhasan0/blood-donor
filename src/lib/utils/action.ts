import "server-only";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { MissingConfigError } from "@/lib/env";
import { AppError, fail, ok, type ActionResult } from "./result";

/**
 * Runs Server Action logic and converts expected failures into an
 * ActionResult the client can display. Unexpected errors are logged and
 * reported generically so internals never leak to the browser.
 */
export async function runAction<T>(fn: () => Promise<T>, successMessage?: string): Promise<ActionResult<T>> {
  try {
    return ok(await fn(), successMessage);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof AppError) return fail(error.message);
    if (error instanceof z.ZodError) {
      return fail(
        "Please check the highlighted fields.",
        z.flattenError(error).fieldErrors as Record<string, string[]>,
      );
    }
    if (error instanceof MissingConfigError) {
      console.error(error.message);
      return fail("This feature isn't configured yet. Please contact the site admin.");
    }
    console.error("[action] unexpected error", error);
    return fail("Something went wrong. Please try again.");
  }
}
