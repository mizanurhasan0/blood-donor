/** Bangladeshi mobile numbers: 01XXXXXXXXX, optionally prefixed with +88 / 88. */
const BD_MOBILE = /^(?:\+?88)?(01[3-9]\d{8})$/;

/** Normalises to the 11-digit local form, or returns null if invalid. */
export function normalizeBdPhone(input: string): string | null {
  const compact = input.replace(/[\s()-]/g, "");
  const match = BD_MOBILE.exec(compact);
  return match ? match[1] : null;
}

/** "01712345678" → "017•••••678" */
export function maskPhone(phone: string): string {
  return `${phone.slice(0, 3)}${"•".repeat(Math.max(0, phone.length - 6))}${phone.slice(-3)}`;
}
