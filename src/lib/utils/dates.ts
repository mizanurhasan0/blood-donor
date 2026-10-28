/** Bangladesh Standard Time is a fixed UTC+6 offset (no daylight saving). */
const BD_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Today's date in Bangladesh as YYYY-MM-DD. */
export function todayInBangladesh(now = new Date()): string {
  return new Date(now.getTime() + BD_OFFSET_MS).toISOString().slice(0, 10);
}

/** Adds whole days to a YYYY-MM-DD string. */
export function addDays(isoDate: string, days: number): string {
  return new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** The last moment of a Bangladesh calendar day, as a UTC Date. */
export function endOfBangladeshDay(isoDate: string): Date {
  return new Date(Date.parse(`${isoDate}T23:59:59.999Z`) - BD_OFFSET_MS);
}

/** The Bangladesh calendar date (YYYY-MM-DD) a UTC instant falls on. */
export function toBangladeshDate(date: Date): string {
  return todayInBangladesh(date);
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
});

const longDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Dhaka",
});

export function formatDate(value: string | Date): string {
  return dateFormatter.format(new Date(value));
}

export function formatLongDate(value: string | Date): string {
  return longDateFormatter.format(new Date(value));
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * DAY_MS],
  ["month", 30 * DAY_MS],
  ["week", 7 * DAY_MS],
  ["day", DAY_MS],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

const relativeFormatters = {
  long: new Intl.RelativeTimeFormat("en", { numeric: "auto" }),
  short: new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" }),
};

export function formatRelative(
  value: string | Date,
  now = new Date(),
  style: "long" | "short" = "long",
): string {
  const diff = new Date(value).getTime() - now.getTime();
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) return relativeFormatters[style].format(Math.round(diff / ms), unit);
  }
  return "just now";
}

/** Whether a request's needed-by moment has already passed. */
export function isPastNeededDate(neededAt: string | Date, now = new Date()): boolean {
  return new Date(neededAt).getTime() < now.getTime();
}
