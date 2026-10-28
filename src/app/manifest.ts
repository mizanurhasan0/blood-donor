import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants/site";

/** The manifest can't use CSS variables; this mirrors --color-background in globals.css. */
const BACKGROUND = "#06121d";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "en",
    background_color: BACKGROUND,
    theme_color: BACKGROUND,
    categories: ["health", "social"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
