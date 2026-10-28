import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it } from "vitest";
import { LIMITS } from "@/lib/constants/site";
import { collections, type BloodRequestDoc, type CommentDoc, type UserDoc } from "@/lib/db/collections";
import type { Viewer } from "@/features/auth/viewer";
import { createComment, deleteComment, getCommentPage } from "@/features/comments/comment.service";
import {
  createAdmin,
  createDonor,
  createUser,
  findRequest,
  insertRequest,
  viewerFor,
} from "./support/fixtures";

let request: BloodRequestDoc;
let author: UserDoc;
let viewer: Viewer;
let requestId: string;

beforeEach(async () => {
  request = await insertRequest(await createUser());
  requestId = request._id.toHexString();
  author = await createDonor({ fullName: "Karim Ahmed" });
  viewer = await viewerFor(author);
});

const commentCount = async () => (await findRequest(request._id))!.commentCount;

describe("createComment", () => {
  it("posts a top-level comment and bumps the request's comment count", async () => {
    const view = await createComment(viewer, { requestId, content: "I can donate this evening." });

    expect(view).toMatchObject({
      parentId: null,
      authorId: author._id.toHexString(),
      authorName: "Karim Ahmed",
      content: "I can donate this evening.",
      replies: [],
    });
    expect(ObjectId.isValid(view.id)).toBe(true);
    expect(await commentCount()).toBe(1);
  });

  it.each(["pending", "rejected", "expired"] as const)("is closed on %s requests", async (status) => {
    const closed = await insertRequest(await createUser(), { status });
    await expect(
      createComment(viewer, { requestId: closed._id.toHexString(), content: "Hello there" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN", message: "Comments are closed for this request." });
  });

  it("stays open on fulfilled requests so people can say thanks", async () => {
    const fulfilled = await insertRequest(await createUser(), { status: "fulfilled" });
    await expect(
      createComment(viewer, { requestId: fulfilled._id.toHexString(), content: "Glad it worked out!" }),
    ).resolves.toMatchObject({ content: "Glad it worked out!" });
  });

  it("allows one level of replies only", async () => {
    const top = await createComment(viewer, { requestId, content: "Which ward is the patient in?" });
    const replier = await viewerFor(await createUser());

    const reply = await createComment(replier, { requestId, parentId: top.id, content: "Ward 5, bed 12." });
    expect(reply.parentId).toBe(top.id);

    await expect(
      createComment(viewer, { requestId, parentId: reply.id, content: "Thanks, on my way." }),
    ).rejects.toMatchObject({ code: "INVALID", message: "You can't reply to this comment." });
    expect(await commentCount()).toBe(2);
  });

  it("rejects replies to comments on another request or to deleted comments", async () => {
    const other = await insertRequest(await createUser());
    const foreign = await createComment(viewer, { requestId: other._id.toHexString(), content: "Elsewhere" });
    const deleted = await createComment(viewer, { requestId, content: "Removed soon" });
    await deleteComment(viewer, deleted.id);

    for (const parentId of [foreign.id, deleted.id, new ObjectId().toHexString()]) {
      await expect(createComment(viewer, { requestId, parentId, content: "Reply" })).rejects.toMatchObject({
        code: "INVALID",
      });
    }
  });

  it("rejects the same comment posted twice by the same person", async () => {
    await createComment(viewer, { requestId, content: "I can donate." });

    await expect(createComment(viewer, { requestId, content: "I can donate." })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "You already posted this comment.",
    });
    // Someone else saying the same thing is fine.
    await createComment(await viewerFor(await createUser()), { requestId, content: "I can donate." });
    expect(await commentCount()).toBe(2);
  });
});

describe("deleteComment", () => {
  it("lets the author delete their comment and keeps the count in sync", async () => {
    const first = await createComment(viewer, { requestId, content: "First" });
    await createComment(viewer, { requestId, content: "Second" });
    await createComment(viewer, { requestId, content: "Third" });

    await expect(deleteComment(viewer, first.id)).resolves.toEqual({ requestId });

    expect(await commentCount()).toBe(2);
    const { comments } = await collections();
    const stored = await comments.findOne({ _id: new ObjectId(first.id) });
    expect(stored).toMatchObject({ content: "" });
    expect(stored!.deletedAt).toBeInstanceOf(Date);
    await expect(deleteComment(viewer, first.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(await commentCount()).toBe(2);
  });

  it("forbids deleting someone else's comment", async () => {
    const comment = await createComment(viewer, { requestId, content: "Mine" });
    await expect(deleteComment(await viewerFor(await createDonor()), comment.id)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(await commentCount()).toBe(1);
  });

  it("lets an admin delete any comment", async () => {
    const comment = await createComment(viewer, { requestId, content: "Spam link" });
    await deleteComment(await viewerFor(await createAdmin()), comment.id);
    expect(await commentCount()).toBe(0);
  });
});

describe("getCommentPage", () => {
  async function insertTopLevel(count: number): Promise<CommentDoc[]> {
    const { comments } = await collections();
    const docs: CommentDoc[] = Array.from({ length: count }, (_, i) => ({
      _id: new ObjectId(),
      requestId: request._id,
      authorId: author._id,
      parentId: null,
      content: `Comment ${i + 1}`,
      createdAt: new Date(Date.now() + i),
      updatedAt: new Date(Date.now() + i),
      deletedAt: null,
    }));
    await comments.insertMany(docs);
    return docs;
  }

  it("pages top-level comments newest first with a stable cursor", async () => {
    const docs = await insertTopLevel(LIMITS.commentsPerPage + 5);
    const newestFirst = docs.map((d) => d._id.toHexString()).reverse();

    const first = await getCommentPage(requestId);
    expect(first.comments.map((c) => c.id)).toEqual(newestFirst.slice(0, LIMITS.commentsPerPage));
    expect(first.nextCursor).toBe(newestFirst[LIMITS.commentsPerPage - 1]);

    // A comment arriving between page loads doesn't shift the next page.
    await createComment(viewer, { requestId, content: "Brand new" });

    const second = await getCommentPage(requestId, first.nextCursor!);
    expect(second.comments.map((c) => c.id)).toEqual(newestFirst.slice(LIMITS.commentsPerPage));
    expect(second.nextCursor).toBeNull();
  });

  it("returns no cursor when everything fits on one page", async () => {
    await insertTopLevel(LIMITS.commentsPerPage);
    expect((await getCommentPage(requestId)).nextCursor).toBeNull();
  });

  it("nests replies in order and keeps deleted parents only as placeholders", async () => {
    const replier = await viewerFor(await createUser({ name: "Nusrat" }));
    const withReplies = await createComment(viewer, { requestId, content: "Parent" });
    const lonely = await createComment(viewer, { requestId, content: "Will be deleted" });
    const r1 = await createComment(replier, { requestId, parentId: withReplies.id, content: "Reply one" });
    const r2 = await createComment(viewer, { requestId, parentId: withReplies.id, content: "Reply two" });
    const r3 = await createComment(replier, { requestId, parentId: withReplies.id, content: "Reply three" });
    await deleteComment(replier, r3.id);
    await deleteComment(viewer, withReplies.id);
    await deleteComment(viewer, lonely.id);

    const page = await getCommentPage(requestId);

    expect(page.comments).toHaveLength(1);
    const [placeholder] = page.comments;
    expect(placeholder).toMatchObject({ id: withReplies.id, content: null });
    expect(placeholder.replies.map((r) => [r.id, r.authorName, r.content])).toEqual([
      [r1.id, "Nusrat", "Reply one"],
      [r2.id, "Karim Ahmed", "Reply two"],
    ]);
    expect(await commentCount()).toBe(2);
  });

  it("returns an empty page for unknown or malformed request ids", async () => {
    await expect(getCommentPage("not-an-id")).resolves.toEqual({ comments: [], nextCursor: null });
    await expect(getCommentPage(new ObjectId().toHexString())).resolves.toEqual({
      comments: [],
      nextCursor: null,
    });
  });
});
