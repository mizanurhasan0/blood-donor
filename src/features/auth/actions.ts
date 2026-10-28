"use server";

import { signIn, signOut } from "./auth";

/** Only same-site relative paths are accepted as post-login destinations. */
function safeRedirect(target: FormDataEntryValue | null): string {
  const value = typeof target === "string" ? target : "";
  // "//host" and "/\host" are both treated as protocol-relative URLs by browsers.
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/account";
}

export async function signInWithGoogle(formData: FormData) {
  await signIn("google", { redirectTo: safeRedirect(formData.get("callbackUrl")) });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
