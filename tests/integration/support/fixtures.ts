import { ObjectId, type Collection, type Document } from "mongodb";
import { divisionOf, type District } from "@/lib/constants/locations";
import {
  collections,
  type BloodRequestDoc,
  type DonorProfileDoc,
  type Role,
  type UserDoc,
} from "@/lib/db/collections";
import { encrypt } from "@/lib/security/crypto";
import { addDays, endOfBangladeshDay, todayInBangladesh } from "@/lib/utils/dates";
import { maskPhone } from "@/lib/utils/phone";
import type { BloodRequestValues } from "@/lib/validators/request";
import { getViewer, type Viewer } from "@/features/auth/viewer";
import { currentSession, setRawSession, signInAs } from "./session";

export const PHONE = "01712345678";

export async function resetDatabase(): Promise<void> {
  const cols = await collections();
  await Promise.all(Object.values(cols).map((c: Collection<Document>) => c.deleteMany({})));
}

let sequence = 0;

type DonorOptions = Partial<Omit<DonorProfileDoc, "division" | "district">> & { district?: District };

export interface UserOptions {
  role?: Role;
  name?: string;
  email?: string;
  donor?: DonorOptions;
}

/** Inserts a user the way a Google sign-in (plus optional donor registration) would. */
export async function createUser(options: UserOptions = {}): Promise<UserDoc> {
  sequence += 1;
  const now = new Date();
  const _id = new ObjectId();
  const user: UserDoc = {
    _id,
    googleId: `google-${_id.toHexString()}`,
    name: options.name ?? `Member ${sequence}`,
    email: options.email ?? `member${sequence}@example.test`,
    role: options.role ?? "user",
    createdAt: now,
    updatedAt: now,
  };
  if (options.donor) {
    const district = options.donor.district ?? "Dhaka";
    user.donorProfile = {
      fullName: `Donor ${sequence}`,
      bloodGroup: "B+",
      available: true,
      emailNotifications: true,
      telegramLinked: false,
      createdAt: now,
      updatedAt: now,
      ...options.donor,
      district,
      division: divisionOf(district),
    };
  }
  const { users } = await collections();
  await users.insertOne(user);
  return user;
}

export function createDonor(donor: DonorOptions = {}, options: Omit<UserOptions, "donor"> = {}) {
  return createUser({ ...options, donor });
}

export function createAdmin() {
  return createUser({ role: "admin", email: "admin@bloodlink.test", name: "Admin" });
}

/** The Viewer the app would build for this user, via the real getViewer(). */
export async function viewerFor(user: UserDoc): Promise<Viewer> {
  const previous = currentSession();
  signInAs(user);
  try {
    const viewer = await getViewer();
    if (!viewer) throw new Error(`No viewer for ${user._id.toHexString()}`);
    return viewer;
  } finally {
    setRawSession(previous);
  }
}

/** Already-validated create-request values (as bloodRequestSchema would output). */
export function requestValues(overrides: Partial<BloodRequestValues> = {}): BloodRequestValues {
  return {
    bloodGroup: "B+",
    units: 2,
    hospitalName: "Dhaka Medical College Hospital",
    district: "Dhaka",
    neededDate: addDays(todayInBangladesh(), 2),
    contactPhone: PHONE,
    description: "Surgery tomorrow morning.",
    urgency: "urgent",
    allowPhoneReveal: true,
    shareDocumentWithDonors: false,
    ...overrides,
  };
}

/** Inserts a request directly, bypassing moderation, for tests that need a given status. */
export async function insertRequest(
  creator: Pick<UserDoc, "_id">,
  overrides: Partial<BloodRequestDoc> = {},
): Promise<BloodRequestDoc> {
  const now = new Date();
  const district = overrides.district ?? "Dhaka";
  const doc: BloodRequestDoc = {
    _id: new ObjectId(),
    creatorId: creator._id,
    bloodGroup: "B+",
    units: 2,
    hospitalName: "Dhaka Medical College Hospital",
    division: divisionOf(district),
    district,
    neededAt: endOfBangladeshDay(addDays(todayInBangladesh(), 3)),
    contactPhone: encrypt(PHONE),
    contactPhoneMasked: maskPhone(PHONE),
    allowPhoneReveal: true,
    shareDocumentWithDonors: false,
    description: "Needed for surgery.",
    urgency: "normal",
    status: "published",
    commentCount: 0,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  const { requests } = await collections();
  await requests.insertOne(doc);
  return doc;
}

export async function findRequest(id: string | ObjectId) {
  const { requests } = await collections();
  return requests.findOne({ _id: new ObjectId(id) });
}

export async function jobsFor(requestId: string | ObjectId) {
  const { jobs } = await collections();
  return jobs
    .find({ requestId: new ObjectId(requestId) })
    .sort({ _id: 1 })
    .toArray();
}

export const ids = (docs: { _id: ObjectId }[]) => docs.map((d) => d._id.toHexString()).sort();
