type ClassValue = string | false | null | undefined;

/** Joins truthy class names. Kept tiny on purpose — no runtime dependency needed. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
