import { ObjectId } from "mongodb";
import { describe, expect, it, vi } from "vitest";
import { collections } from "@/lib/db/collections";
import { decrypt } from "@/lib/security/crypto";
import { endOfBangladeshDay } from "@/lib/utils/dates";
import { insertJobs } from "@/features/notifications/notification.repository";
import { dedupeKeys } from "@/features/notifications/retry";
import {
  approveRequest,
  createBloodRequest,
  expireOutdatedRequests,
  getDocumentForViewer,
  markRequestFulfilled,
  rejectRequest,
  revealContactPhone,
} from "@/features/requests/request.service";
import { headObject } from "@/features/storage/file-storage.service";
import {
  createAdmin,
  createDonor,
  createUser,
  findRequest,
  insertRequest,
  jobsFor,
  PHONE,
  requestValues,
  viewerFor,
} from "./support/fixtures";

const token = "AbCdEfGh_ijkl-MNOP1234";

async function setStatus(id: string, status: "published" | "fulfilled") {
  const { requests } = await collections();
  await requests.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
}

describe("createBloodRequest", () => {
  it("stores a pending request with an encrypted contact number and a masked copy", async () => {
    const user = await createUser();
    const values = requestValues({ district: "Gazipur", contactPhone: "01812345678" });

    const id = await createBloodRequest(await viewerFor(user), values);

    const doc = await findRequest(id);
    expect(doc).toMatchObject({
      status: "pending",
      creatorId: user._id,
      district: "Gazipur",
      division: "Dhaka",
      commentCount: 0,
      neededAt: endOfBangladeshDay(values.neededDate),
      contactPhoneMasked: "018•••••678",
      shareDocumentWithDonors: false,
    });
    expect(doc!.contactPhone).not.toContain("01812345678");
    expect(decrypt(doc!.contactPhone)).toBe("01812345678");
    expect(doc!.prescription ?? null).toBeNull();
  });

  it("attaches a verified document and keeps the sharing choice", async () => {
    const user = await createUser();
    vi.mocked(headObject).mockResolvedValueOnce({ contentType: "application/pdf", size: 4096 });
    const documentKey = `prescriptions/${user._id.toHexString()}/${token}.pdf`;

    const id = await createBloodRequest(
      await viewerFor(user),
      requestValues({ documentKey, shareDocumentWithDonors: true }),
    );

    expect(headObject).toHaveBeenCalledWith(documentKey);
    expect(await findRequest(id)).toMatchObject({
      prescription: { key: documentKey, contentType: "application/pdf", size: 4096 },
      shareDocumentWithDonors: true,
    });
  });

  it("never shares a document that was not uploaded", async () => {
    const user = await createUser();
    const id = await createBloodRequest(
      await viewerFor(user),
      requestValues({ shareDocumentWithDonors: true }),
    );
    expect((await findRequest(id))!.shareDocumentWithDonors).toBe(false);
  });

  it("rejects a document key that belongs to another user", async () => {
    const user = await createUser();
    const other = await createUser();
    const documentKey = `prescriptions/${other._id.toHexString()}/${token}.png`;

    await expect(
      createBloodRequest(await viewerFor(user), requestValues({ documentKey })),
    ).rejects.toMatchObject({
      code: "INVALID",
      message: "Upload the document again.",
    });
    expect(headObject).not.toHaveBeenCalled();
    const { requests } = await collections();
    expect(await requests.countDocuments()).toBe(0);
  });

  it.each([
    ["missing from storage", null],
    ["stored with a disallowed type", { contentType: "text/html", size: 10 }],
  ])("rejects a document %s", async (_label, head) => {
    const user = await createUser();
    vi.mocked(headObject).mockResolvedValueOnce(head);
    const documentKey = `prescriptions/${user._id.toHexString()}/${token}.png`;

    await expect(
      createBloodRequest(await viewerFor(user), requestValues({ documentKey })),
    ).rejects.toMatchObject({
      code: "INVALID",
    });
  });

  it("allows at most two requests waiting for review per user", async () => {
    const viewer = await viewerFor(await createUser());
    await createBloodRequest(viewer, requestValues());
    await createBloodRequest(viewer, requestValues());

    await expect(createBloodRequest(viewer, requestValues())).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("limits each user to three new requests per day", async () => {
    const viewer = await viewerFor(await createUser());
    for (let i = 0; i < 3; i++) {
      // Published requests don't count towards the pending cap, only the daily limit.
      await setStatus(await createBloodRequest(viewer, requestValues()), "published");
    }

    await expect(createBloodRequest(viewer, requestValues())).rejects.toMatchObject({ code: "RATE_LIMITED" });
    // Other users are unaffected.
    await expect(createBloodRequest(await viewerFor(await createUser()), requestValues())).resolves.toEqual(
      expect.any(String),
    );
  });
});

describe("moderation", () => {
  async function pendingRequestWithDonors() {
    const owner = await createUser();
    const donors = [await createDonor(), await createDonor()];
    const id = await createBloodRequest(await viewerFor(owner), requestValues());
    const admin = await viewerFor(await createAdmin());
    return { owner, donors, id, admin };
  }

  it("approving publishes the request and queues durable notification jobs", async () => {
    const { donors, id, admin } = await pendingRequestWithDonors();

    await expect(approveRequest(admin, id)).resolves.toEqual({ email: 2, telegram: 1 });

    const doc = await findRequest(id);
    expect(doc).toMatchObject({ status: "published", reviewedBy: admin.objectId });
    expect(doc!.publishedAt).toBeInstanceOf(Date);
    const jobs = await jobsFor(id);
    expect(jobs).toHaveLength(3);
    expect(jobs.every((j) => j.status === "pending" && j.attempts === 0)).toBe(true);
    expect(jobs.filter((j) => j.channel === "telegram").map((j) => j.recipientId)).toEqual([null]);
    expect(
      jobs
        .filter((j) => j.channel === "email")
        .map((j) => j.recipientId!.toHexString())
        .sort(),
    ).toEqual(donors.map((d) => d._id.toHexString()).sort());
  });

  it("approving twice is a conflict and does not duplicate jobs", async () => {
    const { id, admin } = await pendingRequestWithDonors();
    await approveRequest(admin, id);

    await expect(approveRequest(admin, id)).rejects.toMatchObject({ code: "CONFLICT" });
    expect(await jobsFor(id)).toHaveLength(3);
  });

  it("rejecting a published request cancels its queued notifications", async () => {
    const { id, admin } = await pendingRequestWithDonors();
    await approveRequest(admin, id);

    await rejectRequest(admin, id, "Duplicate of an earlier request");

    expect(await findRequest(id)).toMatchObject({
      status: "rejected",
      moderationNote: "Duplicate of an earlier request",
    });
    const jobs = await jobsFor(id);
    expect(jobs.map((j) => [j.status, j.lastError])).toEqual(
      jobs.map(() => ["cancelled", "Request rejected"]),
    );
    await expect(rejectRequest(admin, id, "")).rejects.toMatchObject({ code: "CONFLICT" });
  });

  // Regression: jobs cancelled by a rejection are re-activated when the request is approved again.
  it("re-approving a rejected request queues its notifications again", async () => {
    const { id, admin } = await pendingRequestWithDonors();
    await approveRequest(admin, id);
    await rejectRequest(admin, id, "Checking details");

    await approveRequest(admin, id);

    expect((await jobsFor(id)).map((j) => j.status)).toEqual(["pending", "pending", "pending"]);
  });
});

describe("markRequestFulfilled", () => {
  it("lets the owner close a published request and stops its notifications", async () => {
    const owner = await createUser();
    await createDonor();
    const id = await createBloodRequest(await viewerFor(owner), requestValues());
    await approveRequest(await viewerFor(await createAdmin()), id);

    await markRequestFulfilled(await viewerFor(owner), id);

    const doc = await findRequest(id);
    expect(doc!.status).toBe("fulfilled");
    expect(doc!.fulfilledAt).toBeInstanceOf(Date);
    expect((await jobsFor(id)).map((j) => j.status)).toEqual(["cancelled", "cancelled"]);
  });

  it("forbids anyone else, including donors", async () => {
    const request = await insertRequest(await createUser());
    for (const stranger of [await createUser(), await createDonor()]) {
      await expect(
        markRequestFulfilled(await viewerFor(stranger), request._id.toHexString()),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    }
    expect((await findRequest(request._id))!.status).toBe("published");
  });

  it("only applies to published requests", async () => {
    const owner = await createUser();
    const pending = await insertRequest(owner, { status: "pending" });
    await expect(
      markRequestFulfilled(await viewerFor(owner), pending._id.toHexString()),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(
      markRequestFulfilled(await viewerFor(owner), new ObjectId().toHexString()),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("expireOutdatedRequests", () => {
  it("expires live requests whose needed time has passed and cancels their jobs", async () => {
    const owner = await createUser();
    const past = new Date(Date.now() - 60_000);
    const outdated = await insertRequest(owner, { neededAt: past });
    const outdatedPending = await insertRequest(owner, { neededAt: past, status: "pending" });
    const alreadyFulfilled = await insertRequest(owner, { neededAt: past, status: "fulfilled" });
    const upcoming = await insertRequest(owner);
    await insertJobs(
      [outdated, upcoming].map((r) => ({
        requestId: r._id,
        recipientId: null,
        channel: "telegram" as const,
        dedupeKey: dedupeKeys.telegram(r._id.toHexString()),
      })),
    );

    const expired = await expireOutdatedRequests();

    expect(expired.sort()).toEqual([outdated._id.toHexString(), outdatedPending._id.toHexString()].sort());
    expect((await findRequest(outdated._id))!.status).toBe("expired");
    expect((await findRequest(outdatedPending._id))!.status).toBe("expired");
    expect((await findRequest(alreadyFulfilled._id))!.status).toBe("fulfilled");
    expect((await findRequest(upcoming._id))!.status).toBe("published");
    expect(await jobsFor(outdated._id)).toMatchObject([
      { status: "cancelled", lastError: "Request expired" },
    ]);
    expect(await jobsFor(upcoming._id)).toMatchObject([{ status: "pending" }]);
    await expect(expireOutdatedRequests()).resolves.toEqual([]);
  });
});

describe("revealContactPhone", () => {
  it("shows the number to a donor when the requester consented, and logs the reveal", async () => {
    const request = await insertRequest(await createUser());
    const donor = await createDonor();

    await expect(revealContactPhone(await viewerFor(donor), request._id.toHexString())).resolves.toBe(PHONE);

    const { revealLogs } = await collections();
    expect(await revealLogs.find({}, { projection: { _id: 0, requestId: 1, userId: 1 } }).toArray()).toEqual([
      { requestId: request._id, userId: donor._id },
    ]);
  });

  it("refuses members who are not registered donors", async () => {
    const request = await insertRequest(await createUser());
    await expect(
      revealContactPhone(await viewerFor(await createUser()), request._id.toHexString()),
    ).rejects.toMatchObject({ code: "FORBIDDEN", message: "Register as a donor to see contact numbers." });
    const { revealLogs } = await collections();
    expect(await revealLogs.countDocuments()).toBe(0);
  });

  it("refuses donors when the requester did not consent", async () => {
    const request = await insertRequest(await createUser(), { allowPhoneReveal: false });
    await expect(
      revealContactPhone(await viewerFor(await createDonor()), request._id.toHexString()),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "The requester hasn't shared their number.",
    });
  });

  it("refuses donors once the request is no longer live", async () => {
    const request = await insertRequest(await createUser(), { status: "fulfilled" });
    await expect(
      revealContactPhone(await viewerFor(await createDonor()), request._id.toHexString()),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("always shows the owner their own number", async () => {
    const owner = await createUser();
    const request = await insertRequest(owner, { allowPhoneReveal: false, status: "pending" });
    await expect(revealContactPhone(await viewerFor(owner), request._id.toHexString())).resolves.toBe(PHONE);
  });

  it("rate limits reveals per donor", async () => {
    const request = await insertRequest(await createUser());
    const viewer = await viewerFor(await createDonor());
    for (let i = 0; i < 10; i++) await revealContactPhone(viewer, request._id.toHexString());
    await expect(revealContactPhone(viewer, request._id.toHexString())).rejects.toMatchObject({
      code: "RATE_LIMITED",
    });
  });
});

describe("getDocumentForViewer", () => {
  it("shares the document with donors only when the requester allowed it", async () => {
    const owner = await createUser();
    const prescription = {
      key: `prescriptions/${owner._id.toHexString()}/${token}.png`,
      contentType: "image/png",
      size: 1,
    };
    const shared = await insertRequest(owner, { prescription, shareDocumentWithDonors: true });
    const privateDoc = await insertRequest(owner, { prescription, shareDocumentWithDonors: false });
    const donor = await viewerFor(await createDonor());

    await expect(getDocumentForViewer(donor, shared._id.toHexString())).resolves.toEqual(prescription);
    await expect(getDocumentForViewer(donor, privateDoc._id.toHexString())).resolves.toBeNull();
    await expect(getDocumentForViewer(null, shared._id.toHexString())).resolves.toBeNull();
    await expect(getDocumentForViewer(await viewerFor(owner), privateDoc._id.toHexString())).resolves.toEqual(
      prescription,
    );
  });
});
