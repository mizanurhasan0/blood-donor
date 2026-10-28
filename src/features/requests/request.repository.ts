import "server-only";
import { ObjectId, type Filter, type Sort } from "mongodb";
import { LIMITS, type RequestStatus } from "@/lib/constants/site";
import { collections, type BloodRequestDoc } from "@/lib/db/collections";
import { NEEDED_WINDOWS, type RequestFilters } from "@/lib/validators/request";
import { addDays, endOfBangladeshDay, todayInBangladesh } from "@/lib/utils/dates";
import type { ModerationItem, RequestDetail, RequestPage, RequestSummary } from "./types";

const summaryProjection = {
  _id: 1,
  bloodGroup: 1,
  units: 1,
  hospitalName: 1,
  district: 1,
  neededAt: 1,
  urgency: 1,
  status: 1,
  commentCount: 1,
  createdAt: 1,
} as const;

type SummaryDoc = Pick<BloodRequestDoc, keyof typeof summaryProjection>;

export function toSummary(doc: SummaryDoc): RequestSummary {
  return {
    id: doc._id.toHexString(),
    bloodGroup: doc.bloodGroup,
    units: doc.units,
    hospitalName: doc.hospitalName,
    district: doc.district,
    neededAt: doc.neededAt.toISOString(),
    urgency: doc.urgency,
    status: doc.status,
    commentCount: doc.commentCount,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function toDetail(doc: BloodRequestDoc): RequestDetail {
  return {
    ...toSummary(doc),
    creatorId: doc.creatorId.toHexString(),
    division: doc.division,
    description: doc.description,
    contactPhoneMasked: doc.contactPhoneMasked,
    allowPhoneReveal: doc.allowPhoneReveal,
    hasDocument: Boolean(doc.prescription),
    shareDocumentWithDonors: doc.shareDocumentWithDonors,
    publishedAt: doc.publishedAt?.toISOString() ?? null,
    moderationNote: doc.moderationNote ?? null,
  };
}

function toObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export async function insertRequest(doc: Omit<BloodRequestDoc, "_id">): Promise<ObjectId> {
  const { requests } = await collections();
  const result = await requests.insertOne(doc as BloodRequestDoc);
  return result.insertedId;
}

export async function findRequestById(id: string): Promise<BloodRequestDoc | null> {
  const _id = toObjectId(id);
  if (!_id) return null;
  const { requests } = await collections();
  return requests.findOne({ _id });
}

export function buildPublicFilter(filters: RequestFilters, now = new Date()): Filter<BloodRequestDoc> {
  const query: Filter<BloodRequestDoc> = { status: filters.status };
  if (filters.bloodGroup) query.bloodGroup = filters.bloodGroup;
  if (filters.district) query.district = filters.district;
  if (filters.urgency) query.urgency = filters.urgency;
  if (filters.needed) {
    const lastDay = addDays(todayInBangladesh(now), NEEDED_WINDOWS[filters.needed]);
    query.neededAt = { $lte: endOfBangladeshDay(lastDay) };
  }
  if (filters.q) query.$text = { $search: filters.q };
  return query;
}

export async function listPublicRequests(filters: RequestFilters): Promise<RequestPage> {
  const { requests } = await collections();
  const query = buildPublicFilter(filters);
  const perPage = LIMITS.requestsPerPage;
  const [docs, total] = await Promise.all([
    requests
      .find(query, { projection: summaryProjection })
      .sort({ createdAt: -1 })
      .skip((filters.page - 1) * perPage)
      .limit(perPage)
      .toArray(),
    requests.countDocuments(query),
  ]);
  return {
    items: docs.map(toSummary),
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function listRecentPublished(limit: number): Promise<RequestSummary[]> {
  const { requests } = await collections();
  const docs = await requests
    .find({ status: "published" }, { projection: summaryProjection })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(toSummary);
}

export async function listRequestsByCreator(creatorId: ObjectId, limit = 20): Promise<RequestSummary[]> {
  const { requests } = await collections();
  const docs = await requests
    .find({ creatorId }, { projection: summaryProjection })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(toSummary);
}

export async function listForModeration(view: "pending" | "reported" | "recent"): Promise<ModerationItem[]> {
  const { requests } = await collections();
  const query: Filter<BloodRequestDoc> =
    view === "pending" ? { status: "pending" } : view === "reported" ? { reportCount: { $gt: 0 } } : {};
  const sort: Sort = view === "reported" ? { reportCount: -1 } : { createdAt: view === "pending" ? 1 : -1 };
  const docs = await requests.find(query).sort(sort).limit(50).toArray();
  return docs.map((doc) => ({ ...toDetail(doc), reportCount: doc.reportCount ?? 0 }));
}

/**
 * Atomic status transition: only succeeds when the current status is one of
 * `from`, so concurrent moderators or owners can't double-apply a change.
 */
export async function transitionStatus(
  id: ObjectId,
  from: RequestStatus[],
  to: RequestStatus,
  extra: Partial<BloodRequestDoc> = {},
  ownerId?: ObjectId,
): Promise<BloodRequestDoc | null> {
  const { requests } = await collections();
  return requests.findOneAndUpdate(
    { _id: id, status: { $in: from }, ...(ownerId ? { creatorId: ownerId } : {}) },
    { $set: { ...extra, status: to, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
}

export async function incrementCommentCount(id: ObjectId, delta: number): Promise<void> {
  const { requests } = await collections();
  await requests.updateOne({ _id: id }, { $inc: { commentCount: delta } });
}

export async function addRequestReport(id: ObjectId, userId: ObjectId): Promise<boolean> {
  const { requests } = await collections();
  const result = await requests.updateOne(
    { _id: id, reportedBy: { $ne: userId } },
    { $addToSet: { reportedBy: userId }, $inc: { reportCount: 1 } },
  );
  return result.modifiedCount === 1;
}

export async function clearRequestReports(id: ObjectId): Promise<void> {
  const { requests } = await collections();
  await requests.updateOne({ _id: id }, { $set: { reportedBy: [], reportCount: 0 } });
}

/** Marks published requests whose needed date has passed as expired. Returns their ids. */
export async function expireOutdated(now = new Date()): Promise<ObjectId[]> {
  const { requests } = await collections();
  const outdated = await requests
    .find({ status: { $in: ["published", "pending"] }, neededAt: { $lt: now } }, { projection: { _id: 1 } })
    .limit(500)
    .toArray();
  const ids = outdated.map((d) => d._id);
  if (ids.length) {
    await requests.updateMany(
      { _id: { $in: ids }, status: { $in: ["published", "pending"] } },
      { $set: { status: "expired", updatedAt: now } },
    );
  }
  return ids;
}

export async function countByCreatorSince(creatorId: ObjectId, since: Date): Promise<number> {
  const { requests } = await collections();
  return requests.countDocuments({ creatorId, createdAt: { $gte: since } });
}

export async function countPendingByCreator(creatorId: ObjectId): Promise<number> {
  const { requests } = await collections();
  return requests.countDocuments({ creatorId, status: "pending" });
}

export async function countRequestsWithStatus(status: RequestStatus): Promise<number> {
  const { requests } = await collections();
  return requests.countDocuments({ status });
}

export async function setTelegramMessageId(id: ObjectId, messageId: number): Promise<void> {
  const { requests } = await collections();
  await requests.updateOne({ _id: id }, { $set: { telegramMessageId: messageId } });
}

export async function findRequestsByCreator(creatorId: ObjectId) {
  const { requests } = await collections();
  return requests.find({ creatorId }, { projection: { _id: 1, prescription: 1 } }).toArray();
}

export async function deleteRequests(ids: ObjectId[]): Promise<void> {
  if (ids.length === 0) return;
  const { requests } = await collections();
  await requests.deleteMany({ _id: { $in: ids } });
}
