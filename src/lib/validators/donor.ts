import { z } from "zod";
import { normalizeBdPhone } from "@/lib/utils/phone";
import { bloodGroupSchema, cleanText, districtSchema } from "./common";

export const donorProfileSchema = z.object({
  fullName: z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(2, "Enter your full name").max(80, "Keep it under 80 characters")),
  bloodGroup: bloodGroupSchema,
  district: districtSchema,
  area: z.string().transform(cleanText).pipe(z.string().max(80, "Keep it under 80 characters")),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || normalizeBdPhone(v) !== null, "Enter a valid Bangladeshi mobile number")
    .transform((v) => (v === "" ? "" : normalizeBdPhone(v)!)),
  available: z.boolean(),
  emailNotifications: z.boolean(),
});

export type DonorProfileInput = z.input<typeof donorProfileSchema>;
export type DonorProfileValues = z.output<typeof donorProfileSchema>;

export const preferencesSchema = donorProfileSchema.pick({
  available: true,
  emailNotifications: true,
});

export type PreferencesValues = z.output<typeof preferencesSchema>;
