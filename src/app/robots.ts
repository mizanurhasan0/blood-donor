import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account", "/admin/", "/request/new", "/login", "/unsubscribe"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
