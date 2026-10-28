import { LOCALE_TAG, type Locale } from "./config";

/** Bangladesh Standard Time: all dates shown to users are Dhaka dates. */
const TIME_ZONE = "Asia/Dhaka";

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 86_400_000],
  ["month", 30 * 86_400_000],
  ["week", 7 * 86_400_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

/** Numbers in the active language's digits (Bangla digits for "bn"). */
export function formatNumber(value: number, lang: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[lang]).format(value);
}

export function formatDate(value: string | Date, lang: Locale, style: "short" | "long" = "short"): string {
  return new Intl.DateTimeFormat(LOCALE_TAG[lang], {
    day: style === "long" ? "numeric" : "2-digit",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

/** "3 minutes ago" / "৩ মিনিট আগে". Within a minute it reads "now" / "এখন". */
export function formatRelative(
  value: string | Date,
  lang: Locale,
  now = new Date(),
  style: "long" | "short" = "long",
): string {
  const diff = new Date(value).getTime() - now.getTime();
  const formatter = new Intl.RelativeTimeFormat(LOCALE_TAG[lang], { numeric: "auto", style });
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) return formatter.format(Math.round(diff / ms), unit);
  }
  return formatter.format(Math.round(diff / 1000), "second");
}

/** Fills {name}-style placeholders: interpolate("{count} units", { count: "২" }). */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
}

/**
 * Turns a message key from a Server Action or validator into text. Keys live in
 * the `feedback` namespace; unknown keys are shown as-is so nothing is hidden.
 */
export function translate(feedback: Record<string, string>, key: string): string {
  return feedback[key] ?? key;
}
