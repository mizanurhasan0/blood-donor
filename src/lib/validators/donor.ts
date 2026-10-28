import { z } from "zod";
import { normalizeBdPhone } from "@/lib/utils/phone";
import { bloodGroupSchema, cleanText, districtSchema } from "./common";

// Messages are feedback keys (see lib/i18n/messages/feedback.ts), translated on screen.
export const donorProfileSchema = z.object({
  fullName: z
    .string({ error: "fullNameRequired" })
    .transform(cleanText)
    .pipe(z.string().min(2, "fullNameRequired").max(80, "fullNameTooLong")),
  bloodGroup: bloodGroupSchema,
  district: districtSchema,
  area: z
    .string({ error: "This field is required" })
    .transform(cleanText)
    .pipe(z.string().max(80, "areaTooLong")),
  phone: z
    .string({ error: "This field is required" })
    .trim()
    .refine((v) => v === "" || normalizeBdPhone(v) !== null, "phoneInvalid")
    .transform((v) => (v === "" ? "" : normalizeBdPhone(v)!)),
  available: z.boolean({ error: "This field is required" }),
  emailNotifications: z.boolean({ error: "This field is required" }),
});

export type DonorProfileInput = z.input<typeof donorProfileSchema>;
export type DonorProfileValues = z.output<typeof donorProfileSchema>;

export const preferencesSchema = donorProfileSchema.pick({
  available: true,
  emailNotifications: true,
});

export type PreferencesValues = z.output<typeof preferencesSchema>;
