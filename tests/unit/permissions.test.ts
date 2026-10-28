import { describe, expect, it } from "vitest";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/constants/site";
import {
  canDeleteComment,
  canManageRequest,
  canMarkFulfilled,
  canRevealPhone,
  canTransition,
  canViewDocument,
  isNotifiable,
  isOwner,
  type Actor,
  type RequestAccessInfo,
} from "@/features/requests/permissions";

const owner: Actor = { id: "owner", isAdmin: false, isDonor: false };
const admin: Actor = { id: "admin", isAdmin: true, isDonor: false };
const donor: Actor = { id: "donor", isAdmin: false, isDonor: true };
const member: Actor = { id: "member", isAdmin: false, isDonor: false };

function request(overrides: Partial<RequestAccessInfo> = {}): RequestAccessInfo {
  return {
    creatorId: "owner",
    status: "published",
    allowPhoneReveal: true,
    shareDocumentWithDonors: true,
    hasDocument: true,
    ...overrides,
  };
}

describe("ownership and management", () => {
  it("recognises only the creator as owner", () => {
    expect(isOwner(owner, request())).toBe(true);
    expect(isOwner(member, request())).toBe(false);
    expect(isOwner(null, request())).toBe(false);
  });

  it("lets owners and admins manage a request", () => {
    expect(canManageRequest(owner, request())).toBe(true);
    expect(canManageRequest(admin, request())).toBe(true);
    expect(canManageRequest(donor, request())).toBe(false);
    expect(canManageRequest(null, request())).toBe(false);
  });

  it("allows marking fulfilled only while published", () => {
    expect(canMarkFulfilled(owner, request())).toBe(true);
    expect(canMarkFulfilled(admin, request())).toBe(true);
    expect(canMarkFulfilled(donor, request())).toBe(false);
    for (const status of ["pending", "fulfilled", "expired", "rejected"] as const) {
      expect(canMarkFulfilled(owner, request({ status }))).toBe(false);
    }
  });
});

describe("canRevealPhone", () => {
  it("requires a donor, the requester's consent and a live request", () => {
    expect(canRevealPhone(donor, request())).toBe(true);
    expect(canRevealPhone(donor, request({ allowPhoneReveal: false }))).toBe(false);
    expect(canRevealPhone(member, request())).toBe(false);
    expect(canRevealPhone(null, request())).toBe(false);
    for (const status of ["pending", "fulfilled", "expired", "rejected"] as const) {
      expect(canRevealPhone(donor, request({ status }))).toBe(false);
    }
  });

  it("always lets the owner and admins see the number", () => {
    const hidden = request({ allowPhoneReveal: false, status: "pending" });
    expect(canRevealPhone(owner, hidden)).toBe(true);
    expect(canRevealPhone(admin, hidden)).toBe(true);
  });
});

describe("canViewDocument", () => {
  it("never grants access when there is no document", () => {
    expect(canViewDocument(owner, request({ hasDocument: false }))).toBe(false);
    expect(canViewDocument(admin, request({ hasDocument: false }))).toBe(false);
  });

  it("shares with donors only when allowed and published", () => {
    expect(canViewDocument(donor, request())).toBe(true);
    expect(canViewDocument(donor, request({ shareDocumentWithDonors: false }))).toBe(false);
    expect(canViewDocument(donor, request({ status: "expired" }))).toBe(false);
    expect(canViewDocument(member, request())).toBe(false);
    expect(canViewDocument(null, request())).toBe(false);
  });

  it("lets the owner and admins view it in any status", () => {
    const privateDoc = request({ shareDocumentWithDonors: false, status: "pending" });
    expect(canViewDocument(owner, privateDoc)).toBe(true);
    expect(canViewDocument(admin, privateDoc)).toBe(true);
  });
});

describe("canDeleteComment", () => {
  it("allows the author and admins only", () => {
    expect(canDeleteComment(member, { authorId: "member" })).toBe(true);
    expect(canDeleteComment(admin, { authorId: "member" })).toBe(true);
    expect(canDeleteComment(donor, { authorId: "member" })).toBe(false);
    expect(canDeleteComment(null, { authorId: "member" })).toBe(false);
  });
});

describe("canTransition", () => {
  const allowed = new Set([
    "pending>published",
    "pending>rejected",
    "pending>expired",
    "published>fulfilled",
    "published>rejected",
    "published>expired",
    "rejected>published",
  ]);
  const pairs = REQUEST_STATUSES.flatMap((from) => REQUEST_STATUSES.map((to) => [from, to] as const));

  it.each(pairs)("%s -> %s", (from: RequestStatus, to: RequestStatus) => {
    expect(canTransition(from, to)).toBe(allowed.has(`${from}>${to}`));
  });
});

describe("isNotifiable", () => {
  const now = new Date("2026-03-10T12:00:00Z");

  it("is true only for published requests whose needed time is still ahead", () => {
    expect(isNotifiable({ status: "published", neededAt: new Date("2026-03-10T12:00:01Z") }, now)).toBe(true);
    expect(isNotifiable({ status: "published", neededAt: now }, now)).toBe(false);
    expect(isNotifiable({ status: "published", neededAt: new Date("2026-03-09T00:00:00Z") }, now)).toBe(
      false,
    );
    for (const status of ["pending", "fulfilled", "expired", "rejected"] as const) {
      expect(isNotifiable({ status, neededAt: new Date("2026-04-01T00:00:00Z") }, now)).toBe(false);
    }
  });

  it("accepts serialised dates", () => {
    expect(isNotifiable({ status: "published", neededAt: "2026-03-11T17:59:59.999Z" }, now)).toBe(true);
  });
});
