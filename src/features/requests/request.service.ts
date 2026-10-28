import "server-only";
import { ObjectId } from "mongodb";
import { divisionOf } from "@/lib/constants/locations";
import type { BloodRequestDoc, StoredDocument } from "@/lib/db/collections";
import { isConfigured } from "@/lib/env";
import { decrypt, encrypt } from "@/lib/security/crypto";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { endOfBangladeshDay } from "@/lib/utils/dates";
import { maskPhone } from "@/lib/utils/phone";
import { AppError } from "@/lib/utils/result";
import type { BloodRequestValues } from "@/lib/validators/request";
import type { Viewer } from "@/features/auth/viewer";
import { collections } from "@/lib/db/collections";
import { headObject } from "@/features/storage/file-storage.service";
import { ALLOWED_DOCUMENT_TYPES } from "@/features/storage/file-validation";
import { EmailNotificationService } from "@/features/notifications/email.service";
import {
  cancelRequestNotifications,
  enqueueRequestNotifications,
} from "@/features/notifications/notification.service";
import {
  addRequestReport,
  clearRequestReports,
  countPendingByCreator,
  expireOutdated,
  findRequestById,
  insertRequest,
  toDetail,
  transitionStatus,
} from "./request.repository";
import {
  canManageRequest,
  canMarkFulfilled,
  canRevealPhone,
  canViewDocument,
  type Actor,
  type RequestAccessInfo,
} from "./permissions";
import type { RequestDetail } from "./types";

const MAX_PENDING_PER_USER = 2;

export function toActor(viewer: Viewer | null): Actor | null {
  return viewer ? { id: viewer.id, isAdmin: viewer.isAdmin, isDonor: viewer.donor !== null } : null;
}

function accessInfo(doc: BloodRequestDoc): RequestAccessInfo {
  return {
    creatorId: doc.creatorId.toHexString(),
    status: doc.status,
    allowPhoneReveal: doc.allowPhoneReveal,
    shareDocumentWithDonors: doc.shareDocumentWithDonors,
    hasDocument: Boolean(doc.prescription),
  };
}

async function loadOrThrow(id: string): Promise<BloodRequestDoc> {
  const doc = await findRequestById(id);
  if (!doc) throw new AppError("This request no longer exists.", "NOT_FOUND");
  return doc;
}

/** Checks an uploaded document really belongs to this user and is an allowed type. */
async function verifyDocument(viewer: Viewer, key: string): Promise<StoredDocument> {
  if (!key.startsWith(`prescriptions/${viewer.id}/`)) {
    throw new AppError("Upload the document again.", "INVALID");
  }
  const meta = await headObject(key);
  if (!meta || !(meta.contentType in ALLOWED_DOCUMENT_TYPES)) {
    throw new AppError("We couldn't find your uploaded document. Please upload it again.", "INVALID");
  }
  return { key, contentType: meta.contentType, size: meta.size };
}

export async function createBloodRequest(viewer: Viewer, values: BloodRequestValues): Promise<string> {
  const limit = await enforceRateLimit("requestCreate", viewer.id);
  if (!limit.ok)
    throw new AppError("You've posted several requests today. Please try again tomorrow.", "RATE_LIMITED");
  if ((await countPendingByCreator(viewer.objectId)) >= MAX_PENDING_PER_USER) {
    throw new AppError(
      "You already have requests waiting for review. Please wait for them to be checked.",
      "CONFLICT",
    );
  }

  const prescription = values.documentKey ? await verifyDocument(viewer, values.documentKey) : undefined;
  const now = new Date();
  const id = await insertRequest({
    creatorId: viewer.objectId,
    bloodGroup: values.bloodGroup,
    units: values.units,
    hospitalName: values.hospitalName,
    division: divisionOf(values.district),
    district: values.district,
    neededAt: endOfBangladeshDay(values.neededDate),
    contactPhone: encrypt(values.contactPhone),
    contactPhoneMasked: maskPhone(values.contactPhone),
    allowPhoneReveal: values.allowPhoneReveal,
    shareDocumentWithDonors: prescription ? values.shareDocumentWithDonors : false,
    prescription,
    description: values.description,
    urgency: values.urgency,
    status: "pending",
    commentCount: 0,
    createdAt: now,
    updatedAt: now,
  });
  return id.toHexString();
}

/** Detail for the owner or an admin, including non-public statuses. */
export async function getManagedRequest(viewer: Viewer | null, id: string): Promise<RequestDetail | null> {
  const doc = await findRequestById(id);
  if (!doc || !canManageRequest(toActor(viewer), accessInfo(doc))) return null;
  return toDetail(doc);
}

export async function approveRequest(admin: Viewer, id: string) {
  const doc = await transitionStatus(new ObjectId(id), ["pending", "rejected"], "published", {
    publishedAt: new Date(),
    reviewedBy: admin.objectId,
    reviewedAt: new Date(),
    moderationNote: undefined,
  });
  if (!doc) throw new AppError("This request was already reviewed.", "CONFLICT");
  const maxRecipients = isConfigured("email") ? EmailNotificationService.maxRecipientsPerRequest() : 0;
  return enqueueRequestNotifications(doc, maxRecipients);
}

export async function rejectRequest(admin: Viewer, id: string, note: string) {
  const doc = await transitionStatus(new ObjectId(id), ["pending", "published"], "rejected", {
    reviewedBy: admin.objectId,
    reviewedAt: new Date(),
    moderationNote: note || undefined,
  });
  if (!doc) throw new AppError("This request can no longer be rejected.", "CONFLICT");
  await cancelRequestNotifications([doc._id], "Request rejected");
}

export async function markRequestFulfilled(viewer: Viewer, id: string) {
  const doc = await loadOrThrow(id);
  if (!canMarkFulfilled(toActor(viewer), accessInfo(doc))) {
    throw new AppError("Only the person who posted this request can mark it fulfilled.", "FORBIDDEN");
  }
  const updated = await transitionStatus(doc._id, ["published"], "fulfilled", { fulfilledAt: new Date() });
  if (!updated) throw new AppError("This request is no longer active.", "CONFLICT");
  await cancelRequestNotifications([doc._id], "Request fulfilled");
}

/** Reveals the requester's number to an eligible donor, logged and rate limited. */
export async function revealContactPhone(viewer: Viewer, id: string): Promise<string> {
  const doc = await loadOrThrow(id);
  if (!canRevealPhone(toActor(viewer), accessInfo(doc))) {
    throw new AppError(
      viewer.donor
        ? "The requester hasn't shared their number."
        : "Register as a donor to see contact numbers.",
      "FORBIDDEN",
    );
  }
  const limit = await enforceRateLimit("phoneReveal", viewer.id);
  if (!limit.ok)
    throw new AppError("You've viewed many numbers recently. Please try again later.", "RATE_LIMITED");
  const { revealLogs } = await collections();
  await revealLogs.insertOne({
    _id: new ObjectId(),
    requestId: doc._id,
    userId: viewer.objectId,
    createdAt: new Date(),
  });
  return decrypt(doc.contactPhone);
}

export async function getDocumentForViewer(
  viewer: Viewer | null,
  id: string,
): Promise<StoredDocument | null> {
  const doc = await findRequestById(id);
  if (!doc?.prescription || !canViewDocument(toActor(viewer), accessInfo(doc))) return null;
  return doc.prescription;
}

export async function reportRequest(viewer: Viewer, id: string): Promise<void> {
  const limit = await enforceRateLimit("report", viewer.id);
  if (!limit.ok) throw new AppError("You've sent many reports today.", "RATE_LIMITED");
  const doc = await loadOrThrow(id);
  await addRequestReport(doc._id, viewer.objectId);
}

export async function dismissRequestReports(_admin: Viewer, id: string): Promise<void> {
  await clearRequestReports(new ObjectId(id));
}

/** Expires requests whose needed date has passed and stops their notifications. */
export async function expireOutdatedRequests(): Promise<string[]> {
  const ids = await expireOutdated();
  await cancelRequestNotifications(ids, "Request expired");
  return ids.map((id) => id.toHexString());
}
