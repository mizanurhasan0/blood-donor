import { z } from "zod";
import { BLOOD_GROUPS } from "@/lib/constants/blood-groups";
import { DISTRICT_NAMES } from "@/lib/constants/locations";
import { normalizeBdPhone } from "@/lib/utils/phone";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const bloodGroupSchema = z.enum(BLOOD_GROUPS, { error: "Select a blood group" });

export const districtSchema = z.enum(DISTRICT_NAMES, { error: "Select a district" });

export const bdPhoneSchema = z
  .string()
  .trim()
  .refine((v) => normalizeBdPhone(v) !== null, "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)")
  .transform((v) => normalizeBdPhone(v)!);

/** Strips control characters (except newlines/tabs) from free text. */
export function cleanText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}
