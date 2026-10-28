import "server-only";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import type { BloodGroup } from "@/lib/constants/blood-groups";
import type { District, Division } from "@/lib/constants/locations";
import type { Role } from "@/lib/db/collections";
import { getLocale } from "@/lib/i18n/server";
import { localizedPath } from "@/lib/i18n/paths";
import { AppError } from "@/lib/utils/result";
import { findUserById } from "@/features/users/user.repository";
import { auth } from "./auth";

export interface Viewer {
  id: string;
  objectId: ObjectId;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  isAdmin: boolean;
  donor: {
    fullName: string;
    bloodGroup: BloodGroup;
    district: District;
    division: Division;
    available: boolean;
    emailNotifications: boolean;
    telegramLinked: boolean;
  } | null;
}

/**
 * The signed-in user, verified against the database once per request.
 * Roles and donor status always come from the database, never the token.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  // The MongoDB driver generates random session ids, so keep its queries out of
  // prerenders (including prefetch-time ones) and run them only for real requests.
  await connection();
  const session = await auth();
  const id = session?.user?.id;
  if (!id || !ObjectId.isValid(id)) return null;
  const user = await findUserById(id);
  if (!user) return null;
  const donor = user.donorProfile;
  return {
    id: user._id.toHexString(),
    objectId: user._id,
    name: donor?.fullName ?? user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    isAdmin: user.role === "admin",
    donor: donor
      ? {
          fullName: donor.fullName,
          bloodGroup: donor.bloodGroup,
          district: donor.district,
          division: donor.division,
          available: donor.available,
          emailNotifications: donor.emailNotifications,
          telegramLinked: donor.telegramLinked,
        }
      : null,
  };
});

/** For Server Actions and Route Handlers: throws instead of redirecting. */
export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) throw new AppError("Please sign in to continue.", "UNAUTHENTICATED");
  return viewer;
}

export async function requireAdmin(): Promise<Viewer> {
  const viewer = await requireViewer();
  if (!viewer.isAdmin) throw new AppError("You do not have permission to do that.", "FORBIDDEN");
  return viewer;
}

/** For pages: sends guests to the sign-in page and back again afterwards, in the same language. */
export async function requireViewerOrRedirect(returnTo: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) {
    const lang = await getLocale();
    const callback = localizedPath(lang, returnTo);
    redirect(`${localizedPath(lang, "/login")}?callbackUrl=${encodeURIComponent(callback)}`);
  }
  return viewer;
}
