import "server-only";
import { revalidateTag, updateTag } from "next/cache";
import { TAGS } from "@/lib/constants/site";

/**
 * Invalidates cached public request data.
 * - "immediate": Server Actions that need read-your-writes (updateTag).
 * - "background": Route Handlers and low-priority changes (stale-while-revalidate).
 */
export function invalidateRequests(ids: string[], mode: "immediate" | "background") {
  const tags = [TAGS.requests, TAGS.stats, ...ids.map(TAGS.request)];
  for (const tag of tags) {
    if (mode === "immediate") updateTag(tag);
    else revalidateTag(tag, "max");
  }
}
