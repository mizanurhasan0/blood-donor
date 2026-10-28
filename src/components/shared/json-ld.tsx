import { SITE } from "@/lib/constants/site";
import { getDictionary, getLocale } from "@/lib/i18n/server";

/**
 * Organization + WebSite structured data for the homepage. The description and tagline follow the
 * current language; the brand name stays "BloodLink" in every language.
 */
export async function SiteJsonLd() {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        url: SITE.url,
        description: t.common.siteDescription,
        slogan: t.common.tagline,
        logo: `${SITE.url}/apple-icon`,
        areaServed: { "@type": "Country", name: "Bangladesh" },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        name: SITE.name,
        url: SITE.url,
        description: t.common.siteDescription,
        inLanguage: lang,
        publisher: { "@id": `${SITE.url}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Escaping "<" keeps the payload from closing the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
