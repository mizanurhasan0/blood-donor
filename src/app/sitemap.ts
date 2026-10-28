import type { MetadataRoute } from "next";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { SITE } from "@/lib/constants/site";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/paths";
import { getSitemapRequests } from "@/features/requests/sitemap.queries";

const STATIC_ROUTES: {
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/requests", changeFrequency: "daily", priority: 0.9 },
  { path: "/become-donor", changeFrequency: "monthly", priority: 0.8 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.3 },
];

type EntryExtras = Pick<MetadataRoute.Sitemap[number], "lastModified" | "changeFrequency" | "priority">;

/** Absolute hreflang alternates for one page, e.g. { bn: "https://…/bn/requests", en: "…/en/requests" }. */
function absoluteAlternates(path: string) {
  const { languages } = localeAlternates(DEFAULT_LOCALE, path);
  return Object.fromEntries(Object.entries(languages).map(([lang, href]) => [lang, `${SITE.url}${href}`]));
}

/** One sitemap entry per language for the same page, each pointing at the others as alternates. */
function localizedEntries(path: string, extras: EntryExtras): MetadataRoute.Sitemap {
  return LOCALES.map((lang) => ({
    url: `${SITE.url}${localeAlternates(lang, path).canonical}`,
    alternates: { languages: absoluteAlternates(path) },
    ...extras,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = STATIC_ROUTES.flatMap(({ path, ...rest }) => localizedEntries(path, rest));
  try {
    // Request time only: the database isn't available during `next build`.
    await connection();
    const requests = await getSitemapRequests();
    return [
      ...pages,
      ...requests.flatMap((r) =>
        localizedEntries(`/requests/${r.id}`, {
          lastModified: r.updatedAt,
          changeFrequency: "daily",
          priority: 0.7,
        }),
      ),
    ];
  } catch (error) {
    unstable_rethrow(error);
    console.error("[sitemap] could not load requests; serving static routes only", error);
    return pages;
  }
}
