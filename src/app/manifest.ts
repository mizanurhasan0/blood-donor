import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants/site";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { messages } from "@/lib/i18n/messages";

/** The manifest can't use CSS variables; this mirrors --color-background in globals.css. */
const BACKGROUND = "#06121d";

/**
 * One manifest serves every language and sits outside the [lang] segment, so it uses the
 * default language's strings and opens the default-language home page.
 */
export default function manifest(): MetadataRoute.Manifest {
  const t = messages[DEFAULT_LOCALE].common;
  return {
    name: `${SITE.name} — ${t.tagline}`,
    short_name: SITE.name,
    description: t.siteDescription,
    start_url: `/${DEFAULT_LOCALE}`,
    scope: "/",
    display: "standalone",
    lang: DEFAULT_LOCALE,
    background_color: BACKGROUND,
    theme_color: BACKGROUND,
    categories: ["health", "social"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
