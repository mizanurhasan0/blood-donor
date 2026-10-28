import type { MetadataRoute } from "next";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { SITE } from "@/lib/constants/site";
import { getSitemapRequests } from "@/features/requests/sitemap.queries";

const STATIC_ROUTES: {
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
}[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/requests", changeFrequency: "daily", priority: 0.9 },
  { path: "/become-donor", changeFrequency: "monthly", priority: 0.8 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, ...rest }) => ({
    url: `${SITE.url}${path}`,
    ...rest,
  }));
  try {
    // Request time only: the database isn't available during `next build`.
    await connection();
    const requests = await getSitemapRequests();
    return [
      ...pages,
      ...requests.map((r) => ({
        url: `${SITE.url}/requests/${r.id}`,
        lastModified: r.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
    ];
  } catch (error) {
    unstable_rethrow(error);
    console.error("[sitemap] could not load requests; serving static routes only", error);
    return pages;
  }
}
