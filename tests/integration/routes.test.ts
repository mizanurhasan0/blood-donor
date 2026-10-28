import { ObjectId } from "mongodb";
import { describe, expect, it, vi } from "vitest";
import { collections } from "@/lib/db/collections";
import { bloodRequestSchema, DOCUMENT_KEY_PATTERN } from "@/lib/validators/request";
import { unsubscribeLink } from "@/features/notifications/email.service";
import { createBloodRequest } from "@/features/requests/request.service";
import { getObject, putObject } from "@/features/storage/file-storage.service";
import { GET as getDocument } from "@/app/api/documents/[requestId]/route";
import { POST as processNotifications } from "@/app/api/internal/process-notifications/route";
import { POST as unsubscribe } from "@/app/api/unsubscribe/route";
import { POST as upload } from "@/app/api/uploads/prescription/route";
import {
  createDonor,
  createUser,
  findRequest,
  insertRequest,
  requestValues,
  viewerFor,
} from "./support/fixtures";
import { signInAs } from "./support/session";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);

describe("POST /api/internal/process-notifications", () => {
  const call = (authorization?: string) =>
    processNotifications(
      new Request("https://bloodlink.test/api/internal/process-notifications", {
        method: "POST",
        headers: authorization ? { authorization } : {},
      }),
    );

  it.each([undefined, "Bearer wrong", `Basic ${process.env.NOTIFICATION_CRON_SECRET}`])(
    "rejects the authorization %j",
    async (authorization) => {
      expect((await call(authorization)).status).toBe(401);
    },
  );

  it("expires outdated requests and runs the worker for the cron container", async () => {
    const outdated = await insertRequest(await createUser(), { neededAt: new Date(Date.now() - 1_000) });

    const response = await call(`Bearer ${process.env.NOTIFICATION_CRON_SECRET}`);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      expired: 1,
      sent: 0,
      failed: 0,
      skippedChannels: ["telegram"],
    });
    expect((await findRequest(outdated._id))!.status).toBe("expired");
  });
});

describe("POST /api/uploads/prescription", () => {
  function post(file: File | null, headers: Record<string, string> = {}) {
    const body = new FormData();
    if (file) body.set("file", file);
    return upload(
      new Request("https://bloodlink.test/api/uploads/prescription", { method: "POST", body, headers }),
    );
  }

  it("requires a signed-in user", async () => {
    const response = await post(new File([PNG], "scan.png", { type: "image/png" }));
    expect(response.status).toBe(401);
    expect(putObject).not.toHaveBeenCalled();
  });

  it("stores a valid file privately under the user's prefix and returns a key the request form accepts", async () => {
    const user = await createUser();
    signInAs(user);

    const response = await post(new File([PNG], "../My Scan<1>.png", { type: "image/png" }));

    expect(response.status).toBe(200);
    const body = (await response.json()) as { key: string; name: string; size: number; contentType: string };
    expect(body).toMatchObject({ name: "My Scan1.png", size: PNG.byteLength, contentType: "image/png" });
    expect(body.key).toMatch(DOCUMENT_KEY_PATTERN);
    expect(body.key.startsWith(`prescriptions/${user._id.toHexString()}/`)).toBe(true);
    expect(putObject).toHaveBeenCalledWith(body.key, expect.any(Uint8Array), "image/png");

    // The key round-trips through validation and the ownership check on submit.
    const values = bloodRequestSchema.parse({ ...requestValues(), documentKey: body.key });
    const id = await createBloodRequest(await viewerFor(user), values);
    expect((await findRequest(id))!.prescription?.key).toBe(body.key);
  });

  it.each([
    ["a file whose contents don't match its type", new File([PNG], "x.jpg", { type: "image/jpeg" })],
    ["a non-document file", new File(["<svg></svg>"], "x.svg", { type: "image/svg+xml" })],
    ["no file at all", null],
  ])("rejects %s", async (_label, file) => {
    signInAs(await createUser());
    const response = await post(file);
    expect(response.status).toBe(400);
    expect(putObject).not.toHaveBeenCalled();
  });

  it("refuses oversized bodies before reading them", async () => {
    signInAs(await createUser());
    const response = await post(new File([PNG], "x.png", { type: "image/png" }), {
      "content-length": String(6 * 1024 * 1024),
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "The file is larger than 5 MB." });
  });
});

describe("GET /api/documents/[requestId]", () => {
  async function setup(shareDocumentWithDonors: boolean) {
    const owner = await createUser();
    const request = await insertRequest(owner, {
      shareDocumentWithDonors,
      prescription: {
        key: `prescriptions/${owner._id.toHexString()}/AbCdEfGh_ijkl-MNOP1234.png`,
        contentType: "image/png",
        size: PNG.byteLength,
      },
    });
    vi.mocked(getObject).mockResolvedValue(new Response(PNG));
    const get = () =>
      getDocument(new Request(`https://bloodlink.test/api/documents/${request._id.toHexString()}`), {
        params: Promise.resolve({ requestId: request._id.toHexString() }),
      });
    return { owner, get };
  }

  it("requires sign-in", async () => {
    const { get } = await setup(true);
    expect((await get()).status).toBe(401);
  });

  it("hides documents the requester did not share", async () => {
    const { get } = await setup(false);
    signInAs(await createDonor());
    expect((await get()).status).toBe(404);
    expect(getObject).not.toHaveBeenCalled();
  });

  it("streams the document to the owner with private, sandboxed headers", async () => {
    const { owner, get } = await setup(false);
    signInAs(owner);

    const response = await get();

    expect(response.status).toBe(200);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(PNG);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-disposition")).toBe('inline; filename="bloodlink-document.png"');
    expect(response.headers.get("content-security-policy")).toContain("sandbox");
  });
});

describe("POST /api/unsubscribe", () => {
  const post = (url: string) => unsubscribe(new Request(url, { method: "POST" }));

  it("turns off emails for the signed link's user only", async () => {
    const donor = await createDonor();
    const other = await createDonor();

    const response = await post(unsubscribeLink(donor._id.toHexString()));

    expect(response.status).toBe(200);
    const { users } = await collections();
    expect((await users.findOne({ _id: donor._id }))!.donorProfile!.emailNotifications).toBe(false);
    expect((await users.findOne({ _id: other._id }))!.donorProfile!.emailNotifications).toBe(true);
  });

  it("rejects forged or mismatched links", async () => {
    const donor = await createDonor();
    const victim = await createDonor();
    const link = new URL(unsubscribeLink(donor._id.toHexString()));
    link.searchParams.set("u", victim._id.toHexString());

    expect((await post(link.toString())).status).toBe(400);
    expect(
      (await post(`https://bloodlink.test/api/unsubscribe?u=${new ObjectId().toHexString()}&t=x`)).status,
    ).toBe(400);
    const { users } = await collections();
    expect((await users.findOne({ _id: victim._id }))!.donorProfile!.emailNotifications).toBe(true);
  });
});
