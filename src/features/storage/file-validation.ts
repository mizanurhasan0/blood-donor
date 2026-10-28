import { LIMITS } from "@/lib/constants/site";

export const ALLOWED_DOCUMENT_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
} as const;

export type AllowedDocumentType = keyof typeof ALLOWED_DOCUMENT_TYPES;

export const ACCEPT_ATTRIBUTE = Object.keys(ALLOWED_DOCUMENT_TYPES).join(",");

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((byte, i) => bytes[offset + i] === byte);

/** Detects the real file type from its leading bytes, ignoring the client's claim. */
export function sniffDocumentType(bytes: Uint8Array): AllowedDocumentType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return "image/webp";
  }
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  return null;
}

export type DocumentValidation =
  { ok: true; contentType: AllowedDocumentType; extension: string } | { ok: false; error: string };

export function validateDocument(bytes: Uint8Array, declaredType: string): DocumentValidation {
  if (bytes.byteLength === 0) return { ok: false, error: "The file is empty." };
  if (bytes.byteLength > LIMITS.documentMaxBytes) {
    return { ok: false, error: "The file is larger than 5 MB." };
  }
  const detected = sniffDocumentType(bytes);
  if (!detected) return { ok: false, error: "Upload a JPG, PNG, WEBP or PDF file." };
  // Allow an empty declared type (some Android browsers omit it), but never a mismatch.
  if (declaredType && declaredType !== detected) {
    return { ok: false, error: "The file type does not match its contents." };
  }
  return { ok: true, contentType: detected, extension: ALLOWED_DOCUMENT_TYPES[detected] };
}

/** A display-only filename: no paths, no control characters, bounded length. */
export function safeDisplayName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "document";
  const cleaned = base.replace(/[\u0000-\u001F\u007F<>:"|?*]/g, "").trim();
  return cleaned.slice(-80) || "document";
}
