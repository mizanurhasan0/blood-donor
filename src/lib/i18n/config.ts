export const LOCALES = ["bn", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Bangla is the default; visitors can switch to English from the header. */
export const DEFAULT_LOCALE: Locale = "bn";

/** Remembers the visitor's language choice, used when they open a URL without a prefix. */
export const LOCALE_COOKIE = "bloodlink-locale";

/** BCP 47 tags for Intl formatting (Bangla digits and month names come from "bn-BD"). */
export const LOCALE_TAG: Record<Locale, string> = { bn: "bn-BD", en: "en-GB" };

/** Each language's own name, shown in the switcher. */
export const LOCALE_NAME: Record<Locale, string> = { bn: "বাংলা", en: "English" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
