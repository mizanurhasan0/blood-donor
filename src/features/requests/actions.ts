"use server";

import { runAction } from "@/lib/utils/action";
import { objectIdSchema } from "@/lib/validators/common";
import { bloodRequestSchema } from "@/lib/validators/request";
import { requireViewer } from "@/features/auth/viewer";
import { invalidateRequests } from "./cache";
import {
  createBloodRequest,
  markRequestFulfilled,
  reportRequest,
  revealContactPhone,
} from "./request.service";

export async function createRequestAction(input: unknown) {
  return runAction(async () => {
    const viewer = await requireViewer();
    const values = bloodRequestSchema.parse(input);
    const id = await createBloodRequest(viewer, values);
    return { id };
  }, "Your request was submitted and is waiting for a quick review.");
}

export async function markFulfilledAction(requestId: string) {
  return runAction(async () => {
    const viewer = await requireViewer();
    const id = objectIdSchema.parse(requestId);
    await markRequestFulfilled(viewer, id);
    invalidateRequests([id], "immediate");
  }, "Marked as fulfilled. Thank you for letting the community know.");
}

export async function revealPhoneAction(requestId: string) {
  return runAction(async () => {
    const viewer = await requireViewer();
    return revealContactPhone(viewer, objectIdSchema.parse(requestId));
  });
}

export async function reportRequestAction(requestId: string) {
  return runAction(async () => {
    const viewer = await requireViewer();
    await reportRequest(viewer, objectIdSchema.parse(requestId));
  }, "Thanks — a moderator will take a look.");
}
