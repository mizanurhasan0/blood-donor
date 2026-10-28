import { refresh } from "next/cache";
import { describe, expect, it } from "vitest";
import { collections } from "@/lib/db/collections";
import { createComment } from "@/features/comments/comment.service";
import { saveDonorProfileAction, updatePreferencesAction } from "@/features/donors/actions";
import { deleteAccount, getProfileFormValues } from "@/features/donors/donor.service";
import { enqueueRequestNotifications } from "@/features/notifications/notification.service";
import { TelegramService } from "@/features/notifications/telegram.service";
import { revealContactPhone } from "@/features/requests/request.service";
import { deleteObject } from "@/features/storage/file-storage.service";
import { createDonor, createUser, findRequest, insertRequest, jobsFor, viewerFor } from "./support/fixtures";
import { signInAs } from "./support/session";

const profile = {
  fullName: "Rahim Uddin",
  bloodGroup: "A-",
  district: "Cox's Bazar",
  area: "Kolatoli",
  phone: "+8801912345678",
  available: true,
  emailNotifications: true,
};

describe("donor profile", () => {
  it("registers a donor with a derived division and an encrypted phone", async () => {
    const user = await createUser();
    signInAs(user);

    await expect(saveDonorProfileAction(profile)).resolves.toMatchObject({ ok: true, data: { isNew: true } });
    expect(refresh).toHaveBeenCalled();

    const { users } = await collections();
    const stored = (await users.findOne({ _id: user._id }))!.donorProfile!;
    expect(stored).toMatchObject({
      bloodGroup: "A-",
      district: "Cox's Bazar",
      division: "Chattogram",
      telegramLinked: false,
    });
    expect(stored.phone).not.toContain("1912345678");
    // Only the owner gets the decrypted number back, for the edit form.
    expect((await getProfileFormValues(await viewerFor(user)))!.phone).toBe("01912345678");
  });

  it("keeps the Telegram link and creation date when the profile is edited", async () => {
    const donor = await createDonor({ telegramLinked: true, telegramUserId: 4242 });
    signInAs(donor);

    await expect(saveDonorProfileAction({ ...profile, phone: "" })).resolves.toMatchObject({
      data: { isNew: false },
    });

    const { users } = await collections();
    const stored = (await users.findOne({ _id: donor._id }))!.donorProfile!;
    expect(stored).toMatchObject({ fullName: "Rahim Uddin", telegramLinked: true, telegramUserId: 4242 });
    expect(stored.createdAt).toEqual(donor.donorProfile!.createdAt);
    expect(stored.phone ?? null).toBeNull();
  });

  it("only updates the availability and email flags", async () => {
    signInAs(await createUser());
    await expect(updatePreferencesAction({ available: false })).resolves.toEqual({
      ok: false,
      error: "Complete your donor profile first.",
    });

    const donor = await createDonor();
    signInAs(donor);
    await updatePreferencesAction({ available: false, role: "admin", bloodGroup: "O-" });

    const { users } = await collections();
    const stored = (await users.findOne({ _id: donor._id }))!;
    expect(stored.role).toBe("user");
    expect(stored.donorProfile).toMatchObject({
      available: false,
      emailNotifications: true,
      bloodGroup: "B+",
    });
  });
});

describe("deleteAccount", () => {
  it("removes the user's requests, documents, jobs, links and logs, and blanks their other comments", async () => {
    const leaver = await createDonor();
    const key = `prescriptions/${leaver._id.toHexString()}/AbCdEfGh_ijkl-MNOP1234.pdf`;
    const own = await insertRequest(leaver, {
      prescription: { key, contentType: "application/pdf", size: 10 },
    });
    await createDonor({ district: "Dhaka" });
    await enqueueRequestNotifications(own, 10);
    await createComment(await viewerFor(await createUser()), {
      requestId: own._id.toHexString(),
      content: "On my way",
    });

    const elsewhere = await insertRequest(await createUser());
    const viewer = await viewerFor(leaver);
    await createComment(viewer, { requestId: elsewhere._id.toHexString(), content: "Shared on Facebook" });
    await revealContactPhone(viewer, elsewhere._id.toHexString());
    await TelegramService.createLinkToken(leaver._id);

    await deleteAccount(viewer);

    const { users, comments, revealLogs, telegramLinks } = await collections();
    expect(await users.findOne({ _id: leaver._id })).toBeNull();
    expect(await findRequest(own._id)).toBeNull();
    expect(deleteObject).toHaveBeenCalledWith(key);
    expect(await jobsFor(own._id)).toHaveLength(0);
    expect(await comments.countDocuments({ requestId: own._id })).toBe(0);
    expect(await comments.find({ authorId: leaver._id }).toArray()).toMatchObject([
      { content: "", deletedAt: expect.any(Date) },
    ]);
    expect(await revealLogs.countDocuments({ userId: leaver._id })).toBe(0);
    expect(await telegramLinks.countDocuments({ userId: leaver._id })).toBe(0);
  });

  // Regression: blanking a leaver's comments must also decrement those requests' commentCount.
  it("keeps comment counts on other requests in sync", async () => {
    const elsewhere = await insertRequest(await createUser());
    const leaver = await createUser();
    const viewer = await viewerFor(leaver);
    await createComment(viewer, {
      requestId: elsewhere._id.toHexString(),
      content: "Praying for the patient",
    });

    await deleteAccount(viewer);

    expect((await findRequest(elsewhere._id))!.commentCount).toBe(0);
  });
});
