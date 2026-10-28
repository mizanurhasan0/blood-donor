import { createCipheriv, randomBytes } from "node:crypto";
import { test as base, type BrowserContext } from "@playwright/test";
import { encode } from "next-auth/jwt";
import { MongoClient, ObjectId } from "mongodb";

export const E2E = {
  mongoUri: process.env.E2E_MONGODB_URI ?? "mongodb://127.0.0.1:27018",
  db: "bloodlink_e2e",
  authSecret: process.env.E2E_AUTH_SECRET ?? "e2e-secret-e2e-secret-e2e-secret-e2e-secret",
  dataKey: process.env.E2E_DATA_KEY ?? "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
};

/** Fixed ids so specs can reference seeded documents directly. */
export const IDS = {
  donor: new ObjectId("64b000000000000000000001"),
  patient: new ObjectId("64b000000000000000000002"),
  newcomer: new ObjectId("64b000000000000000000003"),
  admin: new ObjectId("64b000000000000000000004"),
  requestDhaka: new ObjectId("64c000000000000000000001"),
  requestChattogram: new ObjectId("64c000000000000000000002"),
  requestPending: new ObjectId("64c000000000000000000003"),
};

/** Mirrors src/lib/security/crypto.ts (that module is server-only). */
export function encryptForApp(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(E2E.dataKey, "base64"), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export async function withDb<T>(fn: (db: ReturnType<MongoClient["db"]>) => Promise<T>): Promise<T> {
  const client = await MongoClient.connect(E2E.mongoUri);
  try {
    return await fn(client.db(E2E.db));
  } finally {
    await client.close();
  }
}

/** Signs in a seeded user by setting a genuine Auth.js session cookie. */
export async function signInAs(context: BrowserContext, userId: ObjectId, baseURL: string) {
  const cookieName = "authjs.session-token";
  const value = await encode({
    token: { uid: userId.toHexString(), sub: userId.toHexString(), name: "E2E User" },
    secret: E2E.authSecret,
    salt: cookieName,
  });
  await context.addCookies([{ name: cookieName, value, url: baseURL, httpOnly: true, sameSite: "Lax" }]);
}

export const test = base.extend<{ signIn: (userId: ObjectId) => Promise<void> }>({
  // Playwright's fixture callback is conventionally named `use`; renamed so the React hooks lint rule stays quiet.
  signIn: async ({ context, baseURL }, provide) => {
    await provide((userId) => signInAs(context, userId, baseURL!));
  },
});

export { expect } from "@playwright/test";
