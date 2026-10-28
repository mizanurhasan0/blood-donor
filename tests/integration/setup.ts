import { randomBytes } from "node:crypto";
import type { MongoClient } from "mongodb";
import { afterAll, beforeEach, inject, vi } from "vitest";

/*
 * Runs before every integration test file, in the test worker and before any
 * src/ module is imported, so lazily-validated env() groups see these values.
 */
const TEST_DB = `bloodlink_test_${randomBytes(4).toString("hex")}`;

Object.assign(process.env, {
  MONGODB_URI: inject("mongoUri"),
  MONGODB_DB: TEST_DB,
  DATA_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
  AUTH_SECRET: randomBytes(32).toString("base64url"),
  ADMIN_EMAILS: "admin@bloodlink.test",
  NEXT_PUBLIC_SITE_URL: "https://bloodlink.test",
  NOTIFICATION_CRON_SECRET: randomBytes(24).toString("base64url"),
  // Email counts as configured so quotas and recipient caps apply. Tests always
  // pass a fake EmailProvider, and fetch is stubbed below, so Brevo is never called.
  BREVO_API_KEY: "test-key-never-sent",
  BREVO_SENDER_EMAIL: "noreply@bloodlink.test",
  BREVO_SENDER_NAME: "BloodLink Test",
  EMAIL_DAILY_LIMIT: "5",
  EMAIL_MAX_RECIPIENTS_PER_REQUEST: "3",
});

// Telegram and storage stay unconfigured: the worker skips Telegram, and storage is mocked.
for (const name of [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHANNEL_ID",
  "TELEGRAM_WEBHOOK_SECRET",
  "TELEGRAM_BOT_USERNAME",
  "TELEGRAM_CHANNEL_INVITE_LINK",
  "STORAGE_ENDPOINT",
  "STORAGE_ACCESS_KEY",
  "STORAGE_SECRET_KEY",
  "STORAGE_BUCKET",
]) {
  delete process.env[name];
}

// Next.js cache APIs only work inside a Next.js request; here they are inert spies.
vi.mock("next/cache", () => ({
  updateTag: vi.fn(),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  refresh: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

// connection() throws outside a Next.js request scope; tests are always "at request time".
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: vi.fn(async () => undefined),
}));

// next/root-params only exists inside the Next.js compiler. Tests run the Bangla dictionary.
vi.mock("@/lib/i18n/server", async () => {
  const { messages } = await import("@/lib/i18n/messages");
  return {
    getLocale: vi.fn(async () => "bn"),
    getDictionary: vi.fn(async () => messages.bn),
  };
});

// auth() returns whatever session the test set with signInAs().
vi.mock("@/features/auth/auth", async () => {
  const { currentSession } = await import("./support/session");
  return {
    auth: vi.fn(async () => currentSession()),
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: { GET: vi.fn(), POST: vi.fn() },
  };
});

vi.mock("@/features/storage/file-storage.service", () => ({
  headObject: vi.fn(),
  putObject: vi.fn(),
  getObject: vi.fn(),
  deleteObject: vi.fn(),
}));

// Safety net: no test may reach Brevo, Telegram or any other real service.
vi.stubGlobal(
  "fetch",
  vi.fn(async (input: unknown) => {
    throw new Error(`Unexpected network request during tests: ${String(input)}`);
  }),
);

beforeEach(async () => {
  vi.clearAllMocks();
  const storage = await import("@/features/storage/file-storage.service");
  vi.mocked(storage.headObject).mockReset().mockResolvedValue({ contentType: "image/png", size: 2048 });
  vi.mocked(storage.getObject).mockReset().mockResolvedValue(null);
  vi.mocked(storage.putObject).mockReset().mockResolvedValue(undefined);
  vi.mocked(storage.deleteObject).mockReset().mockResolvedValue(undefined);
  const { signInAs } = await import("./support/session");
  signInAs(null);
  const { resetDatabase } = await import("./support/fixtures");
  await resetDatabase();
});

afterAll(async () => {
  const holder = globalThis as { mongoClient?: Promise<MongoClient> };
  const client = await holder.mongoClient?.catch(() => undefined);
  if (client) {
    await client.db(TEST_DB).dropDatabase();
    await client.close();
  }
  holder.mongoClient = undefined;
});
