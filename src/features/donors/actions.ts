"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { runAction } from "@/lib/utils/action";
import { AppError } from "@/lib/utils/result";
import { donorProfileSchema, preferencesSchema } from "@/lib/validators/donor";
import { signOut } from "@/features/auth/auth";
import { requireViewer } from "@/features/auth/viewer";
import { verifyUnsubscribeToken } from "@/features/notifications/email.service";
import { invalidateRequests } from "@/features/requests/cache";
import {
  createTelegramLink,
  deleteAccount,
  saveProfile,
  unsubscribeUser,
  updatePreferences,
} from "./donor.service";

export async function saveDonorProfileAction(input: unknown) {
  return runAction(async () => {
    const viewer = await requireViewer();
    const isNew = viewer.donor === null;
    await saveProfile(viewer, donorProfileSchema.parse(input));
    if (isNew) invalidateRequests([], "background");
    refresh();
    return { isNew };
  }, "Your donor profile is saved.");
}

export async function updatePreferencesAction(input: unknown) {
  return runAction(async () => {
    const viewer = await requireViewer();
    await updatePreferences(viewer, preferencesSchema.partial().parse(input));
    refresh();
  }, "Preferences saved.");
}

export async function createTelegramLinkAction() {
  return runAction(async () => {
    const viewer = await requireViewer();
    const botUsername = env("telegramPublic").TELEGRAM_BOT_USERNAME;
    if (!botUsername) throw new AppError("Telegram linking isn't set up yet.", "UNAVAILABLE");
    const token = await createTelegramLink(viewer);
    return { url: `https://t.me/${botUsername}?start=${token}` };
  });
}

export async function deleteAccountAction() {
  const result = await runAction(async () => {
    const viewer = await requireViewer();
    await deleteAccount(viewer);
    invalidateRequests([], "background");
  });
  if (!result.ok) return result;
  await signOut({ redirect: false });
  redirect("/?deleted=1");
}

export async function unsubscribeAction(userId: string, token: string) {
  return runAction(async () => {
    if (!verifyUnsubscribeToken(userId, token))
      throw new AppError("This unsubscribe link is invalid.", "INVALID");
    await unsubscribeUser(userId);
  }, "You won't receive blood request emails any more.");
}
