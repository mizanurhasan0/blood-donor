import "server-only";
import { z } from "zod";

/**
 * Server environment, validated lazily per integration so the app can boot
 * (and build) with only the parts that are configured. Each getter throws a
 * clear error naming the missing variables when its integration is used.
 */

const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const schemas = {
  database: z.object({
    MONGODB_URI: z.string().min(1),
    MONGODB_DB: z.string().min(1).default("bloodlink"),
  }),
  encryption: z.object({
    DATA_ENCRYPTION_KEY: z
      .string()
      .refine((v) => Buffer.from(v, "base64").length === 32, "must be 32 bytes, base64-encoded"),
  }),
  email: z.object({
    BREVO_API_KEY: z.string().min(1),
    BREVO_SENDER_EMAIL: z.email(),
    BREVO_SENDER_NAME: z.string().default("BloodLink"),
    EMAIL_DAILY_LIMIT: z.coerce.number().int().positive().default(280),
    EMAIL_MAX_RECIPIENTS_PER_REQUEST: z.coerce.number().int().positive().default(40),
  }),
  telegram: z.object({
    TELEGRAM_BOT_TOKEN: z.string().min(1),
    TELEGRAM_CHANNEL_ID: z.string().min(1),
    TELEGRAM_WEBHOOK_SECRET: z.string().regex(/^[A-Za-z0-9_-]{16,256}$/),
  }),
  telegramPublic: z.object({
    TELEGRAM_BOT_USERNAME: optional,
    TELEGRAM_CHANNEL_INVITE_LINK: optional,
  }),
  storage: z.object({
    STORAGE_ENDPOINT: z.url(),
    STORAGE_ACCESS_KEY: z.string().min(1),
    STORAGE_SECRET_KEY: z.string().min(1),
    STORAGE_BUCKET: z.string().min(1),
    STORAGE_REGION: z.string().default("auto"),
  }),
  cron: z.object({
    NOTIFICATION_CRON_SECRET: z.string().min(24),
  }),
  admin: z.object({
    ADMIN_EMAILS: z
      .string()
      .default("")
      .transform((v) =>
        v
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean),
      ),
  }),
  auth: z.object({
    AUTH_SECRET: z.string().min(32),
  }),
  contact: z.object({
    CONTACT_EMAIL: optional,
  }),
} as const;

type Schemas = typeof schemas;
type EnvGroup = keyof Schemas;

const cache = new Map<EnvGroup, unknown>();

export class MissingConfigError extends Error {
  constructor(group: string, issues: string) {
    super(`Missing or invalid ${group} configuration: ${issues}`);
    this.name = "MissingConfigError";
  }
}

export function env<G extends EnvGroup>(group: G): z.infer<Schemas[G]> {
  if (!cache.has(group)) {
    const result = schemas[group].safeParse(process.env);
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join(".")} (${i.message})`).join(", ");
      throw new MissingConfigError(group, issues);
    }
    cache.set(group, result.data);
  }
  return cache.get(group) as z.infer<Schemas[G]>;
}

/** True when every variable of an integration is present and valid. */
export function isConfigured(group: EnvGroup): boolean {
  try {
    env(group);
    return true;
  } catch {
    return false;
  }
}
