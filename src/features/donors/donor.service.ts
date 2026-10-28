import "server-only";
import { ObjectId } from "mongodb";
import { divisionOf } from "@/lib/constants/locations";
import { collections } from "@/lib/db/collections";
import { decrypt, encrypt } from "@/lib/security/crypto";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { AppError } from "@/lib/utils/result";
import type { DonorProfileInput, DonorProfileValues, PreferencesValues } from "@/lib/validators/donor";
import type { Viewer } from "@/features/auth/viewer";
import {
  deleteCommentsForRequests,
  softDeleteCommentsByAuthor,
} from "@/features/comments/comment.repository";
import { deleteJobsForRequests } from "@/features/notifications/notification.repository";
import { TelegramService } from "@/features/notifications/telegram.service";
import { deleteRequests, findRequestsByCreator } from "@/features/requests/request.repository";
import { deleteObject } from "@/features/storage/file-storage.service";
import {
  deleteUser,
  findUserById,
  saveDonorProfile,
  updateDonorFlags,
} from "@/features/users/user.repository";

export async function saveProfile(viewer: Viewer, values: DonorProfileValues): Promise<void> {
  await saveDonorProfile(viewer.objectId, {
    fullName: values.fullName,
    bloodGroup: values.bloodGroup,
    division: divisionOf(values.district),
    district: values.district,
    area: values.area || undefined,
    phone: values.phone ? encrypt(values.phone) : undefined,
    available: values.available,
    emailNotifications: values.emailNotifications,
  });
}

/** Form defaults for editing, with the stored phone decrypted for its owner only. */
export async function getProfileFormValues(viewer: Viewer): Promise<DonorProfileInput | null> {
  const user = await findUserById(viewer.objectId);
  const profile = user?.donorProfile;
  if (!profile) return null;
  return {
    fullName: profile.fullName,
    bloodGroup: profile.bloodGroup,
    district: profile.district,
    area: profile.area ?? "",
    phone: profile.phone ? decrypt(profile.phone) : "",
    available: profile.available,
    emailNotifications: profile.emailNotifications,
  };
}

export async function updatePreferences(viewer: Viewer, values: Partial<PreferencesValues>): Promise<void> {
  if (!(await updateDonorFlags(viewer.objectId, values))) {
    throw new AppError("donorProfileRequired", "INVALID");
  }
}

export async function unsubscribeUser(userId: string): Promise<void> {
  if (!ObjectId.isValid(userId)) return;
  await updateDonorFlags(new ObjectId(userId), { emailNotifications: false });
}

export async function createTelegramLink(viewer: Viewer): Promise<string> {
  if (!viewer.donor) throw new AppError("donorProfileRequired", "INVALID");
  const limit = await enforceRateLimit("telegramLink", viewer.id);
  if (!limit.ok) throw new AppError("telegramLinkRateLimited", "RATE_LIMITED");
  return TelegramService.createLinkToken(viewer.objectId);
}

/**
 * Permanently removes the account: the user's own requests (with their
 * documents, comments and jobs) are deleted, and comments they left on other
 * requests are blanked so conversations keep their shape.
 */
export async function deleteAccount(viewer: Viewer): Promise<void> {
  const own = await findRequestsByCreator(viewer.objectId);
  const ids = own.map((r) => r._id);
  await Promise.all(
    own.flatMap((r) => (r.prescription ? [deleteObject(r.prescription.key).catch(() => undefined)] : [])),
  );
  await Promise.all([deleteCommentsForRequests(ids), deleteJobsForRequests(ids)]);
  await deleteRequests(ids);
  await softDeleteCommentsByAuthor(viewer.objectId);
  const { telegramLinks, revealLogs } = await collections();
  await Promise.all([
    telegramLinks.deleteMany({ userId: viewer.objectId }),
    revealLogs.deleteMany({ userId: viewer.objectId }),
  ]);
  await deleteUser(viewer.objectId);
}
