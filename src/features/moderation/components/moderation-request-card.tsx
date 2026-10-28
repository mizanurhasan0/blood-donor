import { CalendarDays, Clock, FileText, Flag, MapPin, Phone } from "lucide-react";
import { Rich } from "@/components/shared/rich-text";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber, formatRelative, interpolate } from "@/lib/i18n/format";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { BloodGroupBadge, RequestStatusBadge, UrgencyBadge } from "@/features/requests/components/badges";
import type { ModerationItem } from "@/features/requests/types";
import { RequestActions } from "./request-actions";

export type ModerationRequest = ModerationItem;

/** Request-time only: renders relative dates from the current time. */
export async function ModerationRequestCard({ request }: { request: ModerationRequest }) {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  const m = t.moderation;
  const units = interpolate(request.units === 1 ? m.card.unitsOne : m.card.unitsOther, {
    count: formatNumber(request.units, lang),
  });
  const reports = interpolate(request.reportCount === 1 ? m.card.reportOne : m.card.reportOther, {
    count: formatNumber(request.reportCount, lang),
  });
  // Stored values stay English (database keys); show the name in the current language.
  const districtName = (t.geo.districts as Record<string, string>)[request.district] ?? request.district;
  const divisionName = (t.geo.divisions as Record<string, string>)[request.division] ?? request.division;

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
                {reports}
              </Badge>
            )}
          </div>
          <h3 className="leading-snug font-semibold">
            {units} · <span className="break-words">{request.hospitalName}</span>
          </h3>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {districtName}, {divisionName}
            </li>
            <li className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
              {interpolate(m.card.neededAt, { date: formatDate(request.neededAt, lang) })}
            </li>
            <li className="flex items-center gap-1.5">
              <Clock className="size-4 shrink-0" aria-hidden="true" />
              <Rich
                text={m.card.posted}
                values={{
                  time: <time dateTime={request.createdAt}>{formatRelative(request.createdAt, lang)}</time>,
                }}
              />
            </li>
            <li className="flex items-center gap-1.5">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              <span className="tabular-nums">{request.contactPhoneMasked}</span>
              <span className="text-xs">
                ({request.allowPhoneReveal ? m.card.revealAllowed : m.card.revealHidden})
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
            {m.card.viewDocument}
            <span className="sr-only">{m.card.newTab}</span>
          </a>
          <Badge>{request.shareDocumentWithDonors ? m.card.sharedWithDonors : m.card.private}</Badge>
        </p>
      )}

      {request.moderationNote && (
        <p className="rounded-button border border-outline/70 bg-surface px-3 py-2 text-sm text-muted">
          <span className="font-medium text-foreground">{m.card.moderatorNote}</span> {request.moderationNote}
        </p>
      )}

      <div className="border-t border-outline/60 pt-4">
        <RequestActions requestId={request.id} status={request.status} reportCount={request.reportCount} />
      </div>
    </article>
  );
}
