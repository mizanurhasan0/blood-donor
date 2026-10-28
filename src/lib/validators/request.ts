import { z } from "zod";
import { BLOOD_GROUPS } from "@/lib/constants/blood-groups";
import { findDistrict } from "@/lib/constants/locations";
import { LIMITS, PUBLIC_STATUSES, URGENCIES } from "@/lib/constants/site";
import { addDays, todayInBangladesh } from "@/lib/utils/dates";
import { bdPhoneSchema, bloodGroupSchema, cleanText, districtSchema } from "./common";

export const DOCUMENT_KEY_PATTERN = /^prescriptions\/[a-f\d]{24}\/[A-Za-z0-9_-]{16,64}\.(jpg|png|webp|pdf)$/;

// Messages are feedback keys (see lib/i18n/messages/feedback.ts), translated on screen.
export const bloodRequestSchema = z.object({
  bloodGroup: bloodGroupSchema,
  units: z.coerce
    .number({ error: "unitsRequired" })
    .int("unitsWhole")
    .min(1, "unitsTooFew")
    .max(LIMITS.maxUnits, "unitsTooMany"),
  hospitalName: z
    .string({ error: "hospitalRequired" })
    .transform(cleanText)
    .pipe(z.string().min(3, "hospitalRequired").max(120, "hospitalTooLong")),
  district: districtSchema,
  neededDate: z.iso
    .date({ error: "neededDateRequired" })
    .refine((d) => d >= todayInBangladesh(), "neededDatePast")
    .refine((d) => d <= addDays(todayInBangladesh(), LIMITS.maxDaysAhead), "neededDateTooFar"),
  contactPhone: bdPhoneSchema,
  description: z
    .string({ error: "This field is required" })
    .transform(cleanText)
    .pipe(z.string().max(LIMITS.descriptionMaxLength, "descriptionTooLong")),
  urgency: z.enum(URGENCIES, { error: "This field is required" }),
  allowPhoneReveal: z.boolean({ error: "This field is required" }),
  shareDocumentWithDonors: z.boolean({ error: "This field is required" }),
  documentKey: z
    .string({ error: "documentKeyInvalid" })
    .regex(DOCUMENT_KEY_PATTERN, "documentKeyInvalid")
    .optional(),
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
