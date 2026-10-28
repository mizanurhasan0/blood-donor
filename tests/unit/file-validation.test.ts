import { describe, expect, it } from "vitest";
import { safeDisplayName, sniffDocumentType, validateDocument } from "@/features/storage/file-validation";

const ascii = (text: string) => Array.from(text, (c) => c.charCodeAt(0));
const file = (header: number[], size = 64) => {
  const bytes = new Uint8Array(Math.max(size, header.length));
  bytes.set(header);
  return bytes;
};

const JPG = [0xff, 0xd8, 0xff, 0xe0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP = [...ascii("RIFF"), 0x24, 0x00, 0x00, 0x00, ...ascii("WEBP")];
const PDF = ascii("%PDF-1.7");
const FIVE_MB = 5 * 1024 * 1024;

describe("validateDocument", () => {
  it.each([
    ["image/jpeg", JPG, "jpg"],
    ["image/png", PNG, "png"],
    ["image/webp", WEBP, "webp"],
    ["application/pdf", PDF, "pdf"],
  ])("detects %s from its magic bytes", (type, header, extension) => {
    expect(validateDocument(file(header), type)).toEqual({ ok: true, contentType: type, extension });
  });

  it("trusts the bytes when the browser sends no type", () => {
    expect(validateDocument(file(PDF), "")).toMatchObject({ ok: true, contentType: "application/pdf" });
  });

  it("rejects a declared type that does not match the contents", () => {
    expect(validateDocument(file(PNG), "image/jpeg")).toEqual({
      ok: false,
      error: "The file type does not match its contents.",
    });
    expect(validateDocument(file(PDF), "image/png").ok).toBe(false);
  });

  it.each([
    ["an SVG disguised as PNG", ascii("<svg xmlns='http://www.w3.org/2000/svg'>"), "image/png"],
    ["HTML", ascii("<!doctype html><script>"), "application/pdf"],
    ["a RIFF file that is not WEBP", [...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WAVE")], "image/webp"],
    ["a truncated PNG signature", PNG.slice(0, 4), "image/png"],
  ])("rejects %s", (_label, header, type) => {
    expect(validateDocument(file(header), type)).toEqual({
      ok: false,
      error: "Upload a JPG, PNG, WEBP or PDF file.",
    });
  });

  it("rejects empty files", () => {
    expect(validateDocument(new Uint8Array(0), "image/png")).toEqual({
      ok: false,
      error: "The file is empty.",
    });
  });

  it("allows exactly 5 MB and rejects anything larger", () => {
    expect(validateDocument(file(PNG, FIVE_MB), "image/png").ok).toBe(true);
    expect(validateDocument(file(PNG, FIVE_MB + 1), "image/png")).toEqual({
      ok: false,
      error: "The file is larger than 5 MB.",
    });
  });
});

describe("sniffDocumentType", () => {
  it("returns null for unknown or too-short input", () => {
    expect(sniffDocumentType(new Uint8Array([0xff, 0xd8]))).toBeNull();
    expect(sniffDocumentType(new Uint8Array(ascii("GIF89a")))).toBeNull();
  });
});

describe("safeDisplayName", () => {
  it.each([
    ["C:\\Users\\rahim\\scan.pdf", "scan.pdf"],
    ["../../etc/passwd", "passwd"],
    ['re<po>rt:"1"|?*.png', "report1.png"],
    ["pre\u0000scrip\u001ftion.jpg", "prescription.jpg"],
    ["  spaced name.webp  ", "spaced name.webp"],
    ["", "document"],
    ["folder/", "document"],
    ["<>:", "document"],
  ])("turns %j into %j", (input, expected) => {
    expect(safeDisplayName(input)).toBe(expected);
  });

  it("keeps the end of very long names so the extension survives", () => {
    const name = safeDisplayName(`${"a".repeat(200)}.pdf`);
    expect(name).toHaveLength(80);
    expect(name.endsWith(".pdf")).toBe(true);
  });
});
