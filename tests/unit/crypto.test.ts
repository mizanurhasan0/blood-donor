import { randomBytes } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const KEY = randomBytes(32).toString("base64");

// env() caches each group per module instance, so every test gets fresh modules.
async function loadCrypto(key: string | null = KEY) {
  vi.resetModules();
  vi.stubEnv("DATA_ENCRYPTION_KEY", key ?? undefined);
  return import("@/lib/security/crypto");
}

describe("encrypt / decrypt", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips phone numbers and unicode text", async () => {
    const { encrypt, decrypt } = await loadCrypto();
    for (const plain of ["01712345678", "রহিম উদ্দিন · ০১৭১২", ""]) {
      expect(decrypt(encrypt(plain))).toBe(plain);
    }
  });

  it("produces iv.tag.ciphertext in base64url without leaking the plaintext", async () => {
    const { encrypt } = await loadCrypto();
    const payload = encrypt("01712345678");
    expect(payload).toMatch(/^[\w-]{16}\.[\w-]{22}\.[\w-]+$/);
    expect(payload).not.toContain("01712345678");
  });

  it("uses a fresh IV for every encryption", async () => {
    const { encrypt } = await loadCrypto();
    expect(encrypt("01712345678")).not.toBe(encrypt("01712345678"));
  });

  it("rejects tampered ciphertext", async () => {
    const { encrypt, decrypt } = await loadCrypto();
    const [iv, tag, data] = encrypt("01712345678").split(".");
    const flipped = Buffer.from(data, "base64url");
    flipped[0] ^= 0xff;
    expect(() => decrypt([iv, tag, flipped.toString("base64url")].join("."))).toThrow();
  });

  it("cannot decrypt with a different key", async () => {
    const payload = (await loadCrypto()).encrypt("01712345678");
    const other = await loadCrypto(randomBytes(32).toString("base64"));
    expect(() => other.decrypt(payload)).toThrow();
  });

  it.each([null, "", "c2hvcnQ=", randomBytes(16).toString("base64")])(
    "refuses to run with the invalid key %j",
    async (key) => {
      const { encrypt } = await loadCrypto(key);
      expect(() => encrypt("01712345678")).toThrow(/Missing or invalid encryption configuration/);
    },
  );
});

describe("hashing helpers", () => {
  it("computes SHA-256 hex digests", async () => {
    const { sha256 } = await loadCrypto();
    expect(sha256("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("creates URL-safe random tokens of the requested size", async () => {
    const { randomToken } = await loadCrypto();
    const token = randomToken(24);
    expect(token).toMatch(/^[\w-]{32}$/);
    expect(randomToken(24)).not.toBe(token);
  });
});
