import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

/**
 * Adds the language prefix to an internal path ("/requests" → "/bn/requests").
 * External links and paths that already carry a prefix are returned unchanged.
 */
export function localizedPath(lang: Locale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//") || startsWithLocale(href)) return href;
  if (href === "/") return `/${lang}`;
  if (href.startsWith("/?") || href.startsWith("/#")) return `/${lang}${href.slice(1)}`;
  return `/${lang}${href}`;
}

export function startsWithLocale(path: string): boolean {
  return isLocale(path.split(/[/?#]/)[1]);
}

/** The same page in another language, keeping the query string and hash. */
export function switchLocalePath(path: string, to: Locale): string {
  const match = /^\/(?:bn|en)(?=[/?#]|$)(.*)$/.exec(path);
  const rest = match ? match[1] : path;
  return localizedPath(to, rest.startsWith("/") ? rest || "/" : `/${rest}`);
}

/** Canonical and hreflang alternates for a page, in every language. */
export function localeAlternates(lang: Locale, path: string) {
  return {
    canonical: localizedPath(lang, path),
    languages: {
      bn: localizedPath("bn", path),
      en: localizedPath("en", path),
      "x-default": localizedPath(DEFAULT_LOCALE, path),
    },
  };
}
