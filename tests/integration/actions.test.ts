import { ObjectId } from "mongodb";
import { revalidateTag, updateTag } from "next/cache";
import { describe, expect, it } from "vitest";
import { collections } from "@/lib/db/collections";
import { addDays, todayInBangladesh } from "@/lib/utils/dates";
import { addCommentAction, loadMoreCommentsAction } from "@/features/comments/actions";
import { approveRequestAction } from "@/features/moderation/actions";
import { createRequestAction, markFulfilledAction, revealPhoneAction } from "@/features/requests/actions";
import { createAdmin, createDonor, createUser, findRequest, insertRequest, PHONE } from "./support/fixtures";
import { setRawSession, signInAs } from "./support/session";

const SIGNED_OUT = { ok: false, error: "Please sign in to continue." };

/** What the create-request form posts (pre-validation, as the browser sends it). */
function formInput(overrides: Record<string, unknown> = {}) {
  return {
    bloodGroup: "O+",
    units: "1",
    hospitalName: "Chattogram Medical College Hospital",
    district: "Chattogram",
    neededDate: addDays(todayInBangladesh(), 1),
    contactPhone: "+8801712345678",
    description: "",
    urgency: "normal",
    allowPhoneReveal: true,
    shareDocumentWithDonors: false,
    ...overrides,
  };
}

async function requestCount() {
  const { requests } = await collections();
  return requests.countDocuments();
}

describe("authentication is enforced on the server", () => {
  it("rejects guests on every mutating action without touching the database", async () => {
    const request = await insertRequest(await createUser());
    const id = request._id.toHexString();

    await expect(createRequestAction(formInput())).resolves.toEqual(SIGNED_OUT);
    await expect(addCommentAction({ requestId: id, content: "Hello there" })).resolves.toEqual(SIGNED_OUT);
    await expect(revealPhoneAction(id)).resolves.toEqual(SIGNED_OUT);
    await expect(markFulfilledAction(id)).resolves.toEqual(SIGNED_OUT);
    await expect(approveRequestAction(id)).resolves.toEqual(SIGNED_OUT);

    expect(await requestCount()).toBe(1);
    const { comments } = await collections();
    expect(await comments.countDocuments()).toBe(0);
  });

  it("treats a session whose user no longer exists as signed out", async () => {
    setRawSession({
      user: { id: new ObjectId().toHexString() },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });
    await expect(createRequestAction(formInput())).resolves.toEqual(SIGNED_OUT);
  });

  it("checks the admin role from the database, not the client", async () => {
    const request = await insertRequest(await createUser(), { status: "pending" });
    signInAs(await createDonor());

    await expect(approveRequestAction(request._id.toHexString())).resolves.toEqual({
      ok: false,
      error: "You do not have permission to do that.",
    });
    expect((await findRequest(request._id))!.status).toBe("pending");
  });
});

describe("createRequestAction", () => {
  it("returns field errors for invalid input and stores nothing", async () => {
    signInAs(await createUser());

    const result = await createRequestAction(
      formInput({ bloodGroup: "X", contactPhone: "123", neededDate: "2000-01-01", units: "0" }),
    );

    expect(result).toMatchObject({ ok: false, error: "Please check the highlighted fields." });
    expect(result.ok ? {} : Object.keys(result.fieldErrors ?? {}).sort()).toEqual(
      ["bloodGroup", "contactPhone", "neededDate", "units"].sort(),
    );
    expect(await requestCount()).toBe(0);
  });

  it("creates a pending request for the signed-in user", async () => {
    const user = await createUser();
    signInAs(user);

    const result = await createRequestAction(formInput());

    expect(result).toMatchObject({
      ok: true,
      message: expect.stringContaining("waiting for a quick review"),
    });
    const id = result.ok ? result.data.id : "";
    expect(await findRequest(id)).toMatchObject({
      status: "pending",
      creatorId: user._id,
      division: "Chattogram",
      contactPhoneMasked: "017•••••678",
    });
  });
});

describe("addCommentAction", () => {
  it("returns field errors for invalid input", async () => {
    signInAs(await createUser());
    const result = await addCommentAction({ requestId: "nope", content: " x " });
    expect(result).toMatchObject({
      ok: false,
      fieldErrors: { requestId: ["Invalid id"], content: ["Write a little more"] },
    });
  });

  it("posts the comment and refreshes cached request data in the background", async () => {
    const request = await insertRequest(await createUser());
    const id = request._id.toHexString();
    signInAs(await createUser({ name: "Selina" }));

    const result = await addCommentAction({ requestId: id, content: "  Sharing with my office group.  " });

    expect(result).toMatchObject({
      ok: true,
      message: "Comment posted.",
      data: { authorName: "Selina", content: "Sharing with my office group." },
    });
    expect(revalidateTag).toHaveBeenCalledWith("requests", "max");
    expect(revalidateTag).toHaveBeenCalledWith("stats", "max");
    expect(revalidateTag).toHaveBeenCalledWith(`request:${id}`, "max");
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("surfaces service errors as a readable message", async () => {
    const pending = await insertRequest(await createUser(), { status: "pending" });
    signInAs(await createUser());
    await expect(
      addCommentAction({ requestId: pending._id.toHexString(), content: "Hello" }),
    ).resolves.toEqual({
      ok: false,
      error: "Comments are closed for this request.",
    });
  });
});

describe("other request actions", () => {
  it("approves as an admin and invalidates the cache immediately", async () => {
    const request = await insertRequest(await createUser(), { status: "pending" });
    await createDonor();
    signInAs(await createAdmin());

    const result = await approveRequestAction(request._id.toHexString());

    expect(result).toEqual({
      ok: true,
      data: { email: 1, telegram: 1 },
      message: "Published. Notifications are queued.",
    });
    expect(updateTag).toHaveBeenCalledWith("requests");
    expect(updateTag).toHaveBeenCalledWith(`request:${request._id.toHexString()}`);
  });

  it("reveals the phone to an eligible donor", async () => {
    const request = await insertRequest(await createUser());
    signInAs(await createDonor());
    await expect(revealPhoneAction(request._id.toHexString())).resolves.toMatchObject({
      ok: true,
      data: PHONE,
    });
  });

  it("refuses to mark someone else's request fulfilled", async () => {
    const request = await insertRequest(await createUser());
    signInAs(await createUser());
    await expect(markFulfilledAction(request._id.toHexString())).resolves.toEqual({
      ok: false,
      error: "Only the person who posted this request can mark it fulfilled.",
    });
  });

  it("validates ids passed to actions", async () => {
    signInAs(await createUser());
    await expect(markFulfilledAction("../../etc")).resolves.toMatchObject({ ok: false });
    await expect(loadMoreCommentsAction(new ObjectId().toHexString(), "bad-cursor")).resolves.toMatchObject({
      ok: false,
    });
  });
});
