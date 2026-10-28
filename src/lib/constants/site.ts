export const SITE = {
  name: "BloodLink",
  tagline: "United for Lives Across Bangladesh",
  title: "BloodLink | Blood Donation Community Bangladesh",
  description:
    "Share blood requests, connect with voluntary blood donors, and support people in need across Bangladesh.",
  locale: "en_BD",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
} as const;

export const REQUEST_STATUSES = ["pending", "published", "fulfilled", "expired", "rejected"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** Statuses a visitor may browse on the public listing. */
export const PUBLIC_STATUSES = ["published", "fulfilled", "expired"] as const;
export type PublicStatus = (typeof PUBLIC_STATUSES)[number];

export const URGENCIES = ["urgent", "normal"] as const;
export type Urgency = (typeof URGENCIES)[number];

export const LIMITS = {
  requestsPerPage: 12,
  commentsPerPage: 20,
  commentMaxLength: 1000,
  descriptionMaxLength: 600,
  maxUnits: 10,
  maxDaysAhead: 60,
  documentMaxBytes: 5 * 1024 * 1024,
} as const;

/** Cache tags shared by cached reads and the mutations that invalidate them. */
export const TAGS = {
  requests: "requests",
  request: (id: string) => `request:${id}`,
  stats: "stats",
} as const;
