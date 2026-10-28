import type { RequestStatus } from "@/lib/constants/site";

/** Pure authorization rules, shared by services and UI so they never drift. */

export interface Actor {
  id: string;
  isAdmin: boolean;
  isDonor: boolean;
}

export interface RequestAccessInfo {
  creatorId: string;
  status: RequestStatus;
  allowPhoneReveal: boolean;
  shareDocumentWithDonors: boolean;
  hasDocument: boolean;
}

export function isOwner(actor: Actor | null, request: Pick<RequestAccessInfo, "creatorId">): boolean {
  return Boolean(actor && actor.id === request.creatorId);
}

export function canManageRequest(actor: Actor | null, request: RequestAccessInfo): boolean {
  return Boolean(actor && (actor.isAdmin || isOwner(actor, request)));
}

export function canMarkFulfilled(actor: Actor | null, request: RequestAccessInfo): boolean {
  return canManageRequest(actor, request) && request.status === "published";
}

export function canRevealPhone(actor: Actor | null, request: RequestAccessInfo): boolean {
  if (!actor) return false;
  if (canManageRequest(actor, request)) return true;
  return actor.isDonor && request.allowPhoneReveal && request.status === "published";
}

export function canViewDocument(actor: Actor | null, request: RequestAccessInfo): boolean {
  if (!actor || !request.hasDocument) return false;
  if (canManageRequest(actor, request)) return true;
  return actor.isDonor && request.shareDocumentWithDonors && request.status === "published";
}

export function canDeleteComment(actor: Actor | null, comment: { authorId: string }): boolean {
  return Boolean(actor && (actor.isAdmin || actor.id === comment.authorId));
}

/** Allowed moderation/fulfilment transitions. */
export const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  pending: ["published", "rejected", "expired"],
  published: ["fulfilled", "rejected", "expired"],
  rejected: ["published"],
  fulfilled: [],
  expired: [],
};

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Notifications only go out for live requests whose needed date hasn't passed. */
export function isNotifiable(request: { status: RequestStatus; neededAt: Date | string }, now = new Date()) {
  return request.status === "published" && new Date(request.neededAt).getTime() > now.getTime();
}
