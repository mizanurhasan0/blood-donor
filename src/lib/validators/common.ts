import { z } from "zod";
import { BLOOD_GROUPS } from "@/lib/constants/blood-groups";
import { DISTRICT_NAMES } from "@/lib/constants/locations";
import { normalizeBdPhone } from "@/lib/utils/phone";

// Messages are feedback keys (see lib/i18n/messages/feedback.ts), translated on screen.
export const objectIdSchema = z.string({ error: "Invalid id" }).regex(/^[a-f\d]{24}$/i, "Invalid id");

export const bloodGroupSchema = z.enum(BLOOD_GROUPS, { error: "bloodGroupRequired" });

export const districtSchema = z.enum(DISTRICT_NAMES, { error: "districtRequired" });

export const bdPhoneSchema = z
  .string({ error: "This field is required" })
  .trim()
  .refine((v) => normalizeBdPhone(v) !== null, "bdPhoneInvalid")
  .transform((v) => normalizeBdPhone(v)!);

/** Strips control characters (except newlines/tabs) from free text. */
export function cleanText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}
