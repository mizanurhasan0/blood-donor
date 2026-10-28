import { z } from "zod";
import { BLOOD_GROUPS } from "@/lib/constants/blood-groups";
import { findDistrict } from "@/lib/constants/locations";
import { LIMITS, PUBLIC_STATUSES, URGENCIES } from "@/lib/constants/site";
import { addDays, todayInBangladesh } from "@/lib/utils/dates";
import { bdPhoneSchema, bloodGroupSchema, cleanText, districtSchema } from "./common";

export const DOCUMENT_KEY_PATTERN = /^prescriptions\/[a-f\d]{24}\/[A-Za-z0-9_-]{16,64}\.(jpg|png|webp|pdf)$/;

export const bloodRequestSchema = z.object({
  bloodGroup: bloodGroupSchema,
  units: z.coerce
    .number({ error: "Enter the number of units" })
    .int()
    .min(1, "At least 1 unit")
    .max(LIMITS.maxUnits, `At most ${LIMITS.maxUnits} units`),
  hospitalName: z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(3, "Enter the hospital or institute name").max(120, "Keep it under 120 characters")),
  district: districtSchema,
  neededDate: z.iso
    .date({ error: "Choose the date blood is needed" })
    .refine((d) => d >= todayInBangladesh(), "The date cannot be in the past")
    .refine(
      (d) => d <= addDays(todayInBangladesh(), LIMITS.maxDaysAhead),
      `Choose a date within the next ${LIMITS.maxDaysAhead} days`,
    ),
  contactPhone: bdPhoneSchema,
  description: z
    .string()
    .transform(cleanText)
    .pipe(
      z.string().max(LIMITS.descriptionMaxLength, `Keep it under ${LIMITS.descriptionMaxLength} characters`),
    ),
  urgency: z.enum(URGENCIES),
  allowPhoneReveal: z.boolean(),
  shareDocumentWithDonors: z.boolean(),
  documentKey: z.string().regex(DOCUMENT_KEY_PATTERN, "Upload the document again").optional(),
});

export type BloodRequestInput = z.input<typeof bloodRequestSchema>;
export type BloodRequestValues = z.output<typeof bloodRequestSchema>;

export const NEEDED_WINDOWS = { today: 0, "3d": 3, "7d": 7 } as const;
export type NeededWindow = keyof typeof NEEDED_WINDOWS;

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values).optional().catch(undefined);

/** Parses untrusted URL search params into a safe, typed filter object. */
export const requestFiltersSchema = z.object({
  bloodGroup: optionalEnum(BLOOD_GROUPS),
  district: z
    .string()
    .optional()
    .transform((v) => findDistrict(v))
    .catch(undefined),
  urgency: optionalEnum(URGENCIES),
  status: z.enum(PUBLIC_STATUSES).catch("published").default("published"),
  needed: optionalEnum(["today", "3d", "7d"] as const),
  q: z
    .string()
    .optional()
    .transform((v) => (v ? cleanText(v).slice(0, 60) || undefined : undefined))
    .catch(undefined),
  page: z.coerce.number().int().min(1).max(500).catch(1).default(1),
});

export type RequestFilters = z.output<typeof requestFiltersSchema>;

/** Accepts Next's searchParams record, taking the first value of repeated keys. */
export function parseRequestFilters(params: Record<string, string | string[] | undefined>): RequestFilters {
  const flat = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  return requestFiltersSchema.parse(flat);
}
