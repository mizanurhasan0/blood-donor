import "server-only";
import { ObjectId, type Filter } from "mongodb";
import { collections, type CommentDoc } from "@/lib/db/collections";

export async function insertComment(doc: Omit<CommentDoc, "_id">): Promise<CommentDoc> {
  const { comments } = await collections();
  const _id = new ObjectId();
  await comments.insertOne({ _id, ...doc });
  return { _id, ...doc };
}

export async function findCommentById(id: ObjectId): Promise<CommentDoc | null> {
  const { comments } = await collections();
  return comments.findOne({ _id: id });
}

/**
 * Top-level comments newest first, paginated by an ObjectId cursor so pages
 * stay stable while new comments arrive.
 */
export async function listTopLevel(requestId: ObjectId, limit: number, cursor?: ObjectId) {
  const { comments } = await collections();
  const query: Filter<CommentDoc> = { requestId, parentId: null };
  if (cursor) query._id = { $lt: cursor };
  return comments
    .find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .toArray();
}

/** All replies for a set of parents in one query (no N+1). */
export async function listReplies(parentIds: ObjectId[]) {
  if (parentIds.length === 0) return [];
  const { comments } = await collections();
  return comments
    .find({ parentId: { $in: parentIds } })
    .sort({ createdAt: 1 })
    .limit(parentIds.length * 50)
    .toArray();
}

export async function hasRecentDuplicate(authorId: ObjectId, requestId: ObjectId, content: string) {
  const { comments } = await collections();
  const since = new Date(Date.now() - 10 * 60_000);
  const match = await comments.findOne(
    { authorId, requestId, content, createdAt: { $gte: since }, deletedAt: null },
    { projection: { _id: 1 } },
  );
  return match !== null;
}

export async function softDeleteComment(id: ObjectId): Promise<boolean> {
  const { comments } = await collections();
  const result = await comments.updateOne(
    { _id: id, deletedAt: null },
    { $set: { deletedAt: new Date(), content: "", updatedAt: new Date() } },
  );
  return result.modifiedCount === 1;
}

export async function addCommentReport(id: ObjectId, userId: ObjectId): Promise<boolean> {
  const { comments } = await collections();
  const result = await comments.updateOne(
    { _id: id, reportedBy: { $ne: userId }, deletedAt: null },
    { $addToSet: { reportedBy: userId }, $inc: { reportCount: 1 } },
  );
  return result.modifiedCount === 1;
}

export async function clearCommentReports(id: ObjectId): Promise<void> {
  const { comments } = await collections();
  await comments.updateOne({ _id: id }, { $set: { reportedBy: [], reportCount: 0 } });
}

export async function listReportedComments(limit = 50) {
  const { comments } = await collections();
  return comments
    .find({ reportCount: { $gt: 0 }, deletedAt: null })
    .sort({ reportCount: -1 })
    .limit(limit)
    .toArray();
}

/** Account deletion: blank out a user's comments on other people's requests. */
export async function softDeleteCommentsByAuthor(authorId: ObjectId): Promise<void> {
  const { comments, requests } = await collections();
  const perRequest = await comments
    .aggregate<{ _id: ObjectId; count: number }>([
      { $match: { authorId, deletedAt: null } },
      { $group: { _id: "$requestId", count: { $sum: 1 } } },
    ])
    .toArray();
  if (perRequest.length) {
    await requests.bulkWrite(
      perRequest.map((r) => ({
        updateOne: { filter: { _id: r._id }, update: { $inc: { commentCount: -r.count } } },
      })),
    );
  }
  await comments.updateMany(
    { authorId, deletedAt: null },
    { $set: { deletedAt: new Date(), content: "", updatedAt: new Date() } },
  );
}

export async function deleteCommentsForRequests(requestIds: ObjectId[]): Promise<void> {
  if (requestIds.length === 0) return;
  const { comments } = await collections();
  await comments.deleteMany({ requestId: { $in: requestIds } });
}
