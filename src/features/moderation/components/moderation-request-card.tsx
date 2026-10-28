import { CalendarDays, Clock, FileText, Flag, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelative } from "@/lib/utils/dates";
import { BloodGroupBadge, RequestStatusBadge, UrgencyBadge } from "@/features/requests/components/badges";
import type { ModerationItem } from "@/features/requests/types";
import { RequestActions } from "./request-actions";

export type ModerationRequest = ModerationItem;

/** Request-time only: renders relative dates from the current time. */
export function ModerationRequestCard({ request }: { request: ModerationRequest }) {
  const units = `${request.units} ${request.units === 1 ? "unit" : "units"}`;
  return (
    <article className="flex flex-col gap-4 rounded-card border border-outline/70 bg-card p-5 shadow-card">
      <div className="flex items-start gap-4">
        <BloodGroupBadge group={request.bloodGroup} size="sm" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <RequestStatusBadge status={request.status} />
            <UrgencyBadge urgency={request.urgency} />
            {request.reportCount > 0 && (
              <Badge tone="warning">
                <Flag className="size-3" aria-hidden="true" />
                {request.reportCount} {request.reportCount === 1 ? "report" : "reports"}
              </Badge>
            )}
          </div>
          <h3 className="leading-snug font-semibold">
            {units} · <span className="break-words">{request.hospitalName}</span>
          </h3>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {request.district}, {request.division}
            </li>
            <li className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
              Needed {formatDate(request.neededAt)}
            </li>
            <li className="flex items-center gap-1.5">
              <Clock className="size-4 shrink-0" aria-hidden="true" />
              Posted <time dateTime={request.createdAt}>{formatRelative(request.createdAt)}</time>
            </li>
            <li className="flex items-center gap-1.5">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              <span className="tabular-nums">{request.contactPhoneMasked}</span>
              <span className="text-xs">
                ({request.allowPhoneReveal ? "donors may reveal" : "hidden from donors"})
              </span>
            </li>
          </ul>
        </div>
      </div>

      {request.description && (
        <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
          {request.description}
        </p>
      )}

      {request.hasDocument && (
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <a
            href={`/api/documents/${request.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 font-medium text-info underline-offset-4 hover:underline"
          >
            <FileText className="size-4" aria-hidden="true" />
            View document
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <Badge>{request.shareDocumentWithDonors ? "Shared with donors" : "Private"}</Badge>
        </p>
      )}

      {request.moderationNote && (
        <p className="rounded-button border border-outline/70 bg-surface px-3 py-2 text-sm text-muted">
          <span className="font-medium text-foreground">Moderator note:</span> {request.moderationNote}
        </p>
      )}

      <div className="border-t border-outline/60 pt-4">
        <RequestActions requestId={request.id} status={request.status} reportCount={request.reportCount} />
      </div>
    </article>
  );
}
