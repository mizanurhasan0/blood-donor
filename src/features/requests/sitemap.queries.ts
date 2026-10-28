import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { TAGS } from "@/lib/constants/site";
import { collections } from "@/lib/db/collections";

export interface SitemapRequest {
  id: string;
  updatedAt: string;
}

/** Published request URLs for the sitemap. Call after `connection()` so it never runs at build time. */
export async function getSitemapRequests(): Promise<SitemapRequest[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.requests);
  const { requests } = await collections();
  const docs = await requests
    .find({ status: "published" }, { projection: { _id: 1, updatedAt: 1 } })
    .sort({ updatedAt: -1 })
    .limit(5000)
    .toArray();
  return docs.map((doc) => ({
    id: doc._id.toHexString(),
    updatedAt: doc.updatedAt.toISOString(),
  }));
}
