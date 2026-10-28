import { CalendarDays, ChevronRight, Clock, MapPin, MessageSquare } from "lucide-react";
import { formatDate, formatNumber, formatRelative, interpolate } from "@/lib/i18n/format";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils/cn";
import type { RequestSummary } from "../types";
import { BloodGroupBadge, RequestStatusBadge, UrgencyBadge } from "./badges";

/**
 * Request summary card. Uses the current time for relative dates, so render
 * it only in request-time (dynamic) components, never in a cached scope.
 */
export async function BloodRequestCard({
  request,
  headingLevel = "h3",
}: {
  request: RequestSummary;
  headingLevel?: "h2" | "h3";
}) {
  const t = await getDictionary();
  const lang = await getLocale();
  const Heading = headingLevel;
  const unitsLabel = request.units === 1 ? t.requests.card.unitsNeededOne : t.requests.card.unitsNeededOther;
  const commentsLabel =
    request.commentCount === 1 ? t.requests.card.commentsOne : t.requests.card.commentsOther;
  const urgent = request.urgency === "urgent" && request.status === "published";
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-4 rounded-card border bg-card p-5 shadow-card transition-[border-color,transform] hover:-translate-y-0.5",
        urgent ? "border-brand/40 hover:border-brand/70" : "border-outline/70 hover:border-muted/50",
      )}
    >
      <div className="flex items-start gap-4">
        <BloodGroupBadge group={request.bloodGroup} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {request.status === "published" ? (
              <UrgencyBadge urgency={request.urgency} />
            ) : (
              <RequestStatusBadge status={request.status} />
            )}
          </div>
          <Heading className="text-lg leading-snug font-semibold">
            <LocalizedLink
              href={`/requests/${request.id}`}
              className="after:absolute after:inset-0 after:rounded-card"
            >
              {interpolate(unitsLabel, { count: formatNumber(request.units, lang) })}
            </LocalizedLink>
          </Heading>
          <p className="flex items-start gap-1.5 text-sm text-muted">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0">
              <span className="line-clamp-2 text-foreground/90">{request.hospitalName}</span>
              <span className="block">{t.geo.districts[request.district]}</span>
            </span>
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
            <span>
              <span className="sr-only">{t.requests.neededBy} </span>
              {formatDate(request.neededAt, lang)}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-outline/60 pt-3.5 text-[0.8125rem] whitespace-nowrap text-muted">
        <span className="flex items-center gap-1.5">
          <MessageSquare className="size-4" aria-hidden="true" />
          {interpolate(commentsLabel, { count: formatNumber(request.commentCount, lang) })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden="true" />
          <time dateTime={request.createdAt}>
            {formatRelative(request.createdAt, lang, undefined, "short")}
          </time>
        </span>
        <span className="flex items-center gap-0.5 font-medium text-foreground transition-colors group-hover:text-brand-bright">
          {t.requests.card.view}
          <span className="sr-only"> {t.requests.card.details}</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

export function BloodRequestCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col gap-4 rounded-card border border-outline/70 bg-card p-5"
    >
      <div className="flex gap-4">
        <div className="size-[4.5rem] animate-pulse rounded-card bg-elevated" />
        <div className="flex flex-1 flex-col gap-2.5 pt-1">
          <div className="h-4 w-16 animate-pulse rounded bg-elevated" />
          <div className="h-5 w-32 animate-pulse rounded bg-elevated" />
          <div className="h-4 w-40 animate-pulse rounded bg-elevated" />
          <div className="h-4 w-24 animate-pulse rounded bg-elevated" />
        </div>
      </div>
      <div className="mt-auto h-5 animate-pulse rounded bg-elevated/70" />
    </div>
  );
}

/** Responsive grid: 1 column on phones, 2 on tablets, up to 4 on wide screens. */
export function RequestGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>;
}
