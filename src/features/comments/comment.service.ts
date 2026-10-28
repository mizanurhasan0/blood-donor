import "server-only";
import { ObjectId } from "mongodb";
import { LIMITS } from "@/lib/constants/site";
import type { CommentDoc } from "@/lib/db/collections";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { AppError } from "@/lib/utils/result";
import type { CommentValues } from "@/lib/validators/comment";
import type { Viewer } from "@/features/auth/viewer";
import { canDeleteComment } from "@/features/requests/permissions";
import { findRequestById, incrementCommentCount } from "@/features/requests/request.repository";
import { toActor } from "@/features/requests/request.service";
import { findUsersByIds } from "@/features/users/user.repository";
import {
  addCommentReport,
  findCommentById,
  hasRecentDuplicate,
  insertComment,
  listReplies,
  listTopLevel,
  softDeleteComment,
} from "./comment.repository";
import type { CommentPage, CommentView } from "./types";

type Author = { name: string; avatar: string | null };

async function loadAuthors(docs: CommentDoc[]): Promise<Map<string, Author>> {
  const ids = [...new Map(docs.map((d) => [d.authorId.toHexString(), d.authorId])).values()];
  const users = await findUsersByIds(ids);
  return new Map(
    users.map((u) => [
      u._id.toHexString(),
      { name: u.donorProfile?.fullName ?? u.name, avatar: u.avatar ?? null },
    ]),
  );
}

function toView(doc: CommentDoc, authors: Map<string, Author>, replies: CommentView[] = []): CommentView {
  const author = authors.get(doc.authorId.toHexString());
  return {
    id: doc._id.toHexString(),
    parentId: doc.parentId?.toHexString() ?? null,
    authorId: doc.authorId.toHexString(),
    authorName: author?.name ?? "formerMember",
    authorAvatar: author?.avatar ?? null,
    content: doc.deletedAt ? null : doc.content,
    createdAt: doc.createdAt.toISOString(),
    replies,
  };
}

/** One page of threads: top-level comments plus their replies, in three queries total. */
export async function getCommentPage(requestId: string, cursor?: string): Promise<CommentPage> {
  if (!ObjectId.isValid(requestId)) return { comments: [], nextCursor: null };
  const limit = LIMITS.commentsPerPage;
  const top = await listTopLevel(
    new ObjectId(requestId),
    limit,
    cursor && ObjectId.isValid(cursor) ? new ObjectId(cursor) : undefined,
  );
  const page = top.slice(0, limit);
  const replies = await listReplies(page.map((c) => c._id));
  const authors = await loadAuthors([...page, ...replies]);

  const repliesByParent = new Map<string, CommentView[]>();
  for (const reply of replies) {
    if (reply.deletedAt) continue;
    const key = reply.parentId!.toHexString();
    repliesByParent.set(key, [...(repliesByParent.get(key) ?? []), toView(reply, authors)]);
  }

  const comments = page
    .map((c) => toView(c, authors, repliesByParent.get(c._id.toHexString()) ?? []))
    // A deleted comment stays only as a placeholder for its replies.
    .filter((c) => c.content !== null || c.replies.length > 0);

  return {
    comments,
    nextCursor: top.length > limit ? page[page.length - 1]._id.toHexString() : null,
  };
}

export async function createComment(viewer: Viewer, values: CommentValues): Promise<CommentView> {
  const request = await findRequestById(values.requestId);
  if (!request || !["published", "fulfilled"].includes(request.status)) {
    throw new AppError("Comments are closed for this request.", "FORBIDDEN");
  }

  let parentId: ObjectId | null = null;
  if (values.parentId) {
    const parent = await findCommentById(new ObjectId(values.parentId));
    // One level of replies only: a reply's parent must be a live top-level comment on this request.
    if (!parent || parent.parentId !== null || parent.deletedAt || !parent.requestId.equals(request._id)) {
      throw new AppError("You can't reply to this comment.", "INVALID");
    }
    parentId = parent._id;
  }

  const limit = await enforceRateLimit("comment", viewer.id);
  if (!limit.ok) throw new AppError("You're commenting too quickly. Please wait a moment.", "RATE_LIMITED");
  if (await hasRecentDuplicate(viewer.objectId, request._id, values.content)) {
    throw new AppError("You already posted this comment.", "CONFLICT");
  }

  const now = new Date();
  const doc = await insertComment({
    requestId: request._id,
    authorId: viewer.objectId,
    parentId,
    content: values.content,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  });
  await incrementCommentCount(request._id, 1);
  return toView(doc, new Map([[viewer.id, { name: viewer.name, avatar: viewer.avatar ?? null }]]));
}

export async function deleteComment(viewer: Viewer, commentId: string): Promise<{ requestId: string }> {
  const comment = ObjectId.isValid(commentId) ? await findCommentById(new ObjectId(commentId)) : null;
  if (!comment || comment.deletedAt) throw new AppError("This comment no longer exists.", "NOT_FOUND");
  if (!canDeleteComment(toActor(viewer), { authorId: comment.authorId.toHexString() })) {
    throw new AppError("You can only delete your own comments.", "FORBIDDEN");
  }
  if (await softDeleteComment(comment._id)) await incrementCommentCount(comment.requestId, -1);
  return { requestId: comment.requestId.toHexString() };
}

export async function reportComment(viewer: Viewer, commentId: string): Promise<void> {
  const limit = await enforceRateLimit("report", viewer.id);
  if (!limit.ok) throw new AppError("You've sent many reports today.", "RATE_LIMITED");
  if (!ObjectId.isValid(commentId)) throw new AppError("This comment no longer exists.", "NOT_FOUND");
  await addCommentReport(new ObjectId(commentId), viewer.objectId);
}
