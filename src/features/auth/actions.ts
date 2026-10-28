"use server";

import { signIn, signOut } from "./auth";

/** Only same-site relative paths are accepted as redirect destinations; anything else uses the fallback. */
function safeRedirect(target: FormDataEntryValue | null | undefined, fallback: string): string {
  const value = typeof target === "string" ? target : "";
  // "//host" and "/\host" are both treated as protocol-relative URLs by browsers. Browsers also strip
  // tabs and newlines from URLs, so "/\t/host" would become "//host": reject control characters too.
  const isSameSite =
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\u0000-\u001F\u007F]/.test(value);
  return isSameSite ? value : fallback;
}

export async function signInWithGoogle(formData: FormData) {
  await signIn("google", { redirectTo: safeRedirect(formData.get("callbackUrl"), "/account") });
}

/** Optional hidden "redirectTo" field: the page to land on after sign-out (home by default). */
export async function signOutAction(formData?: FormData) {
  await signOut({ redirectTo: safeRedirect(formData?.get("redirectTo"), "/") });
}
