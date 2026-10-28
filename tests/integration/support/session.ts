import type { Session } from "next-auth";

let session: Session | null = null;

/** Controls what the mocked `auth()` returns. Pass null to sign out. */
export function signInAs(user: { _id: { toHexString(): string }; email: string; name: string } | null) {
  session = user
    ? {
        user: { id: user._id.toHexString(), email: user.email, name: user.name },
        expires: new Date(Date.now() + 3_600_000).toISOString(),
      }
    : null;
}

/** For tests of a forged or stale token whose user id is not in the database. */
export function setRawSession(value: Session | null) {
  session = value;
}

export function currentSession(): Session | null {
  return session;
}
