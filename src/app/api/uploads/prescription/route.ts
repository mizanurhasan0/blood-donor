import { LIMITS } from "@/lib/constants/site";
import { randomToken } from "@/lib/security/crypto";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { jsonError } from "@/lib/utils/http";
import { AppError } from "@/lib/utils/result";
import { requireViewer } from "@/features/auth/viewer";
import { putObject } from "@/features/storage/file-storage.service";
import { safeDisplayName, validateDocument } from "@/features/storage/file-validation";

/**
 * Authenticated upload of a prescription/hospital document into private
 * storage. A Route Handler (rather than a Server Action) so the browser can
 * report real upload progress. Returns only the opaque storage key.
 */
export async function POST(request: Request) {
  try {
    const viewer = await requireViewer();
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > LIMITS.documentMaxBytes + 64 * 1024) {
      throw new AppError("The file is larger than 5 MB.", "INVALID");
    }
    const limit = await enforceRateLimit("upload", viewer.id);
    if (!limit.ok) throw new AppError("Too many uploads. Please try again later.", "RATE_LIMITED");

    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) throw new AppError("Choose a file to upload.", "INVALID");

    const bytes = new Uint8Array(await file.arrayBuffer());
    const check = validateDocument(bytes, file.type);
    if (!check.ok) throw new AppError(check.error, "INVALID");

    const key = `prescriptions/${viewer.id}/${randomToken(18)}.${check.extension}`;
    await putObject(key, bytes, check.contentType);

    return Response.json({
      key,
      name: safeDisplayName(file.name),
      size: bytes.byteLength,
      contentType: check.contentType,
    });
  } catch (error) {
    return jsonError(error);
  }
}
