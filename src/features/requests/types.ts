import type { BloodGroup } from "@/lib/constants/blood-groups";
import type { District, Division } from "@/lib/constants/locations";
import type { RequestStatus, Urgency } from "@/lib/constants/site";

/** Serializable request summary used by cards and lists. Never contains contact data. */
export interface RequestSummary {
  id: string;
  bloodGroup: BloodGroup;
  units: number;
  hospitalName: string;
  district: District;
  neededAt: string;
  urgency: Urgency;
  status: RequestStatus;
  commentCount: number;
  createdAt: string;
}

/** Everything the public detail page may show. The phone is masked. */
export interface RequestDetail extends RequestSummary {
  creatorId: string;
  division: Division;
  description: string;
  contactPhoneMasked: string;
  allowPhoneReveal: boolean;
  hasDocument: boolean;
  shareDocumentWithDonors: boolean;
  publishedAt: string | null;
  moderationNote: string | null;
}

/** Moderator view of a request, including open report count. */
export interface ModerationItem extends RequestDetail {
  reportCount: number;
}

export interface RequestPage {
  items: RequestSummary[];
  total: number;
  page: number;
  pageCount: number;
}

export interface CommunityStats {
  donors: number;
  activeRequests: number;
  fulfilledRequests: number;
  districts: number;
}
