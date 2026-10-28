"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
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
  }, "donorProfileSaved");
}

export async function updatePreferencesAction(input: unknown) {
  return runAction(async () => {
    const viewer = await requireViewer();
    await updatePreferences(viewer, preferencesSchema.partial().parse(input));
    refresh();
  }, "preferencesSaved");
}

export async function createTelegramLinkAction() {
  return runAction(async () => {
    const viewer = await requireViewer();
    const botUsername = env("telegramPublic").TELEGRAM_BOT_USERNAME;
    if (!botUsername) throw new AppError("telegramNotConfigured", "UNAVAILABLE");
    const token = await createTelegramLink(viewer);
    return { url: `https://t.me/${botUsername}?start=${token}` };
  });
}

/** `lang` is the language the visitor deleted from; they land on that language's home page. */
export async function deleteAccountAction(lang?: string) {
  const result = await runAction(async () => {
    const viewer = await requireViewer();
    await deleteAccount(viewer);
    invalidateRequests([], "background");
  });
  if (!result.ok) return result;
  await signOut({ redirect: false });
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  redirect(`/${locale}?deleted=1`);
}

export async function unsubscribeAction(userId: string, token: string) {
  return runAction(async () => {
    if (!verifyUnsubscribeToken(userId, token)) throw new AppError("unsubscribeInvalid", "INVALID");
    await unsubscribeUser(userId);
  }, "unsubscribed");
}
