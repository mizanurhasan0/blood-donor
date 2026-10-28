"use server";

import { ObjectId } from "mongodb";
import { z } from "zod";
import { runAction } from "@/lib/utils/action";
import { objectIdSchema } from "@/lib/validators/common";
import { requireAdmin } from "@/features/auth/viewer";
import { clearCommentReports } from "@/features/comments/comment.repository";
import { invalidateRequests } from "@/features/requests/cache";
import { approveRequest, dismissRequestReports, rejectRequest } from "@/features/requests/request.service";

export async function approveRequestAction(requestId: string) {
  return runAction(async () => {
    const admin = await requireAdmin();
    const id = objectIdSchema.parse(requestId);
    const queued = await approveRequest(admin, id);
    invalidateRequests([id], "immediate");
    return queued;
  }, "Published. Notifications are queued.");
}

export async function rejectRequestAction(requestId: string, note: string) {
  return runAction(async () => {
    const admin = await requireAdmin();
    const id = objectIdSchema.parse(requestId);
    await rejectRequest(admin, id, z.string().trim().max(300).parse(note));
    invalidateRequests([id], "immediate");
  }, "Request rejected.");
}

export async function dismissReportsAction(kind: "request" | "comment", targetId: string) {
  return runAction(async () => {
    const admin = await requireAdmin();
    const id = objectIdSchema.parse(targetId);
    if (kind === "request") await dismissRequestReports(admin, id);
    else await clearCommentReports(new ObjectId(id));
    invalidateRequests([], "immediate");
  }, "Reports dismissed.");
}
