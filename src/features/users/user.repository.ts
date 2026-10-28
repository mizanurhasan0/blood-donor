import "server-only";
import { ObjectId } from "mongodb";
import type { BloodGroup } from "@/lib/constants/blood-groups";
import type { District, Division } from "@/lib/constants/locations";
import { collections, type DonorProfileDoc, type Role, type UserDoc } from "@/lib/db/collections";

export async function upsertGoogleUser(input: {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
}): Promise<UserDoc> {
  const { users } = await collections();
  const now = new Date();
  const user = await users.findOneAndUpdate(
    { googleId: input.googleId },
    {
      $set: { email: input.email, name: input.name, avatar: input.avatar, role: input.role, updatedAt: now },
      $setOnInsert: { googleId: input.googleId, createdAt: now },
    },
    { upsert: true, returnDocument: "after" },
  );
  return user!;
}

export async function findUserById(id: string | ObjectId): Promise<UserDoc | null> {
  if (typeof id === "string" && !ObjectId.isValid(id)) return null;
  const { users } = await collections();
  return users.findOne({ _id: new ObjectId(id) });
}

export async function saveDonorProfile(
  userId: ObjectId,
  profile: Omit<DonorProfileDoc, "createdAt" | "updatedAt" | "telegramLinked" | "telegramUserId">,
): Promise<void> {
  const { users } = await collections();
  const now = new Date();
  const user = await users.findOne({ _id: userId }, { projection: { donorProfile: 1 } });
  const existing = user?.donorProfile;
  await users.updateOne(
    { _id: userId },
    {
      $set: {
        donorProfile: {
          ...profile,
          telegramLinked: existing?.telegramLinked ?? false,
          ...(existing?.telegramUserId ? { telegramUserId: existing.telegramUserId } : {}),
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        },
        updatedAt: now,
      },
    },
  );
}

export async function updateDonorFlags(
  userId: ObjectId,
  flags: Partial<Pick<DonorProfileDoc, "available" | "emailNotifications">>,
): Promise<boolean> {
  const { users } = await collections();
  const $set: Record<string, unknown> = { updatedAt: new Date(), "donorProfile.updatedAt": new Date() };
  for (const [key, value] of Object.entries(flags)) $set[`donorProfile.${key}`] = value;
  const result = await users.updateOne({ _id: userId, donorProfile: { $exists: true } }, { $set });
  return result.matchedCount === 1;
}

export interface DonorRecipient {
  _id: ObjectId;
  email: string;
  name: string;
}

/**
 * Opted-in, available donors with the requested blood group: same district
 * first, then the rest of the division until `limit` is reached.
 */
export async function findMatchingDonors(criteria: {
  bloodGroup: BloodGroup;
  district: District;
  division: Division;
  excludeUserId: ObjectId;
  limit: number;
}): Promise<DonorRecipient[]> {
  // MongoDB treats limit(0) as "no limit", so a zero cap must short-circuit.
  if (criteria.limit <= 0) return [];
  const { users } = await collections();
  const base = {
    "donorProfile.bloodGroup": criteria.bloodGroup,
    "donorProfile.available": true,
    "donorProfile.emailNotifications": true,
    _id: { $ne: criteria.excludeUserId },
  };
  const projection = { _id: 1, email: 1, name: 1 } as const;
  const local = await users
    .find({ ...base, "donorProfile.district": criteria.district }, { projection })
    .limit(criteria.limit)
    .toArray();
  if (local.length >= criteria.limit) return local;
  const nearby = await users
    .find(
      {
        ...base,
        "donorProfile.division": criteria.division,
        "donorProfile.district": { $ne: criteria.district },
      },
      { projection },
    )
    .limit(criteria.limit - local.length)
    .toArray();
  return [...local, ...nearby];
}

export async function findUsersByIds(ids: ObjectId[]) {
  if (ids.length === 0) return [];
  const { users } = await collections();
  return users
    .find({ _id: { $in: ids } }, { projection: { _id: 1, name: 1, avatar: 1, "donorProfile.fullName": 1 } })
    .toArray();
}

export async function countDonors(): Promise<number> {
  const { users } = await collections();
  return users.countDocuments({ "donorProfile.bloodGroup": { $exists: true } });
}

export async function countDonorDistricts(): Promise<number> {
  const { users } = await collections();
  const districts = await users.distinct("donorProfile.district", {
    "donorProfile.bloodGroup": { $exists: true },
  });
  return districts.length;
}

export async function linkTelegramAccount(userId: ObjectId, telegramUserId: number): Promise<void> {
  const { users } = await collections();
  // A Telegram account can belong to one BloodLink account only.
  await users.updateMany(
    { "donorProfile.telegramUserId": telegramUserId, _id: { $ne: userId } },
    { $set: { "donorProfile.telegramLinked": false }, $unset: { "donorProfile.telegramUserId": "" } },
  );
  await users.updateOne(
    { _id: userId, donorProfile: { $exists: true } },
    {
      $set: {
        "donorProfile.telegramLinked": true,
        "donorProfile.telegramUserId": telegramUserId,
        updatedAt: new Date(),
      },
    },
  );
}

export async function findDonorByTelegramId(telegramUserId: number) {
  const { users } = await collections();
  return users.findOne(
    { "donorProfile.telegramUserId": telegramUserId },
    { projection: { _id: 1, donorProfile: 1 } },
  );
}

export async function deleteUser(userId: ObjectId): Promise<void> {
  const { users } = await collections();
  await users.deleteOne({ _id: userId });
}
