import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { TAGS } from "@/lib/constants/site";
import type { RequestFilters } from "@/lib/validators/request";
import { countDonorDistricts, countDonors } from "@/features/users/user.repository";
import {
  countRequestsWithStatus,
  findRequestById,
  listPublicRequests,
  listRecentPublished,
  toDetail,
} from "./request.repository";
import type { CommunityStats, RequestDetail, RequestPage, RequestSummary } from "./types";

/*
 * Cached public reads. Callers must render these behind `await connection()`
 * inside <Suspense> so they run at request time (never during `next build`),
 * then stay in the in-memory cache until a mutation invalidates their tag.
 */

export async function getRecentRequests(limit = 4): Promise<RequestSummary[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.requests);
  return listRecentPublished(limit);
}

export async function searchRequests(filters: RequestFilters): Promise<RequestPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.requests);
  return listPublicRequests(filters);
}

/** Public detail, or null when the request doesn't exist or isn't public. */
export async function getPublicRequest(id: string): Promise<RequestDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.request(id));
  const doc = await findRequestById(id);
  if (!doc || doc.status === "pending" || doc.status === "rejected") return null;
  return toDetail(doc);
}

export async function getCommunityStats(): Promise<CommunityStats> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.stats);
  const [donors, districts, activeRequests, fulfilledRequests] = await Promise.all([
    countDonors(),
    countDonorDistricts(),
    countRequestsWithStatus("published"),
    countRequestsWithStatus("fulfilled"),
  ]);
  return { donors, districts, activeRequests, fulfilledRequests };
}
