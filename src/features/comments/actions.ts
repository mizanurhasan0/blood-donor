"use server";

import { runAction } from "@/lib/utils/action";
import { commentSchema } from "@/lib/validators/comment";
import { objectIdSchema } from "@/lib/validators/common";
import { requireViewer } from "@/features/auth/viewer";
import { invalidateRequests } from "@/features/requests/cache";
import { createComment, deleteComment, getCommentPage, reportComment } from "./comment.service";

export async function addCommentAction(input: unknown) {
  return runAction(async () => {
    const viewer = await requireViewer();
    const values = commentSchema.parse(input);
    const comment = await createComment(viewer, values);
    // Comment counts on cards can refresh in the background.
    invalidateRequests([values.requestId], "background");
    return comment;
  }, "Comment posted.");
}

export async function deleteCommentAction(commentId: string) {
  return runAction(async () => {
    const viewer = await requireViewer();
    const { requestId } = await deleteComment(viewer, objectIdSchema.parse(commentId));
    invalidateRequests([requestId], "background");
  }, "Comment deleted.");
}

export async function loadMoreCommentsAction(requestId: string, cursor: string) {
  return runAction(() => getCommentPage(objectIdSchema.parse(requestId), objectIdSchema.parse(cursor)));
}

export async function reportCommentAction(commentId: string) {
  return runAction(async () => {
    const viewer = await requireViewer();
    await reportComment(viewer, objectIdSchema.parse(commentId));
  }, "Thanks — a moderator will take a look.");
}
