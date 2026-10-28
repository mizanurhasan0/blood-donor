import "server-only";
import type { Collection, Db, ObjectId } from "mongodb";
import type { BloodGroup } from "@/lib/constants/blood-groups";
import type { District, Division } from "@/lib/constants/locations";
import type { RequestStatus, Urgency } from "@/lib/constants/site";
import { getDb } from "./client";
import { ensureIndexes } from "./indexes";

export type Role = "user" | "admin";

export interface DonorProfileDoc {
  fullName: string;
  bloodGroup: BloodGroup;
  division: Division;
  district: District;
  area?: string;
  /** AES-GCM encrypted; never sent to other users. */
  phone?: string;
  available: boolean;
  emailNotifications: boolean;
  telegramLinked: boolean;
  telegramUserId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDoc {
  _id: ObjectId;
  googleId: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  donorProfile?: DonorProfileDoc;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredDocument {
  key: string;
  contentType: string;
  size: number;
}

export interface BloodRequestDoc {
  _id: ObjectId;
  creatorId: ObjectId;
  bloodGroup: BloodGroup;
  units: number;
  hospitalName: string;
  division: Division;
  district: District;
  /** End of the needed day in Bangladesh time; drives expiry. */
  neededAt: Date;
  /** AES-GCM encrypted contact number. */
  contactPhone: string;
  /** Pre-computed masked form for public display, e.g. "017•••••42". */
  contactPhoneMasked: string;
  allowPhoneReveal: boolean;
  shareDocumentWithDonors: boolean;
  prescription?: StoredDocument;
  description: string;
  urgency: Urgency;
  status: RequestStatus;
  commentCount: number;
  reportedBy?: ObjectId[];
  reportCount?: number;
  moderationNote?: string;
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
  publishedAt?: Date;
  fulfilledAt?: Date;
  telegramMessageId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentDoc {
  _id: ObjectId;
  requestId: ObjectId;
  authorId: ObjectId;
  parentId: ObjectId | null;
  content: string;
  reportedBy?: ObjectId[];
  reportCount?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type NotificationChannel = "email" | "telegram";
export type JobStatus = "pending" | "processing" | "sent" | "failed" | "cancelled";

export interface NotificationJobDoc {
  _id: ObjectId;
  requestId: ObjectId;
  recipientId: ObjectId | null;
  channel: NotificationChannel;
  status: JobStatus;
  attempts: number;
  nextAttemptAt: Date;
  lockedUntil?: Date;
  dedupeKey: string;
  lastError?: string;
  providerMessageId?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TelegramLinkDoc {
  _id: ObjectId;
  tokenHash: string;
  userId: ObjectId;
  expiresAt: Date;
}

export interface ContactRevealLogDoc {
  _id: ObjectId;
  requestId: ObjectId;
  userId: ObjectId;
  createdAt: Date;
}

export interface RateLimitDoc {
  _id: string;
  count: number;
  expiresAt: Date;
}

export interface Collections {
  users: Collection<UserDoc>;
  requests: Collection<BloodRequestDoc>;
  comments: Collection<CommentDoc>;
  jobs: Collection<NotificationJobDoc>;
  telegramLinks: Collection<TelegramLinkDoc>;
  revealLogs: Collection<ContactRevealLogDoc>;
  rateLimits: Collection<RateLimitDoc>;
}

function bind(db: Db): Collections {
  return {
    users: db.collection<UserDoc>("users"),
    requests: db.collection<BloodRequestDoc>("blood_requests"),
    comments: db.collection<CommentDoc>("comments"),
    jobs: db.collection<NotificationJobDoc>("notification_jobs"),
    telegramLinks: db.collection<TelegramLinkDoc>("telegram_links"),
    revealLogs: db.collection<ContactRevealLogDoc>("contact_reveal_logs"),
    rateLimits: db.collection<RateLimitDoc>("rate_limits"),
  };
}

let ready: Promise<Collections> | undefined;

/** Typed collections, with indexes ensured once per process. */
export function collections(): Promise<Collections> {
  ready ??= getDb()
    .then(async (db) => {
      const cols = bind(db);
      await ensureIndexes(cols);
      return cols;
    })
    .catch((error: unknown) => {
      ready = undefined;
      throw error;
    });
  return ready;
}
