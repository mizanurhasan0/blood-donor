import { CalendarDays, Clock, MapPin, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { formatDate, formatNumber, formatRelative, interpolate } from "@/lib/i18n/format";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils/cn";
import type { RequestSummary } from "../types";
import { DistrictMap } from "./district-map";
import { RequestStatusBadge, UrgencyBadge } from "./badges";

/**
 * Request summary card. The district map is rendered from district boundaries,
 * so each request highlights its own district. Relative dates stay request-time
 * data and this component must not run inside a cached scope.
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
  const districtName = t.geo.districts[request.district];
  const linkLabel = `${interpolate(unitsLabel, { count: formatNumber(request.units, lang) })} · ${districtName} · ${t.requests.card.view} ${t.requests.card.details}`;

  return (
    <article
      className={cn(
        "group relative isolate flex min-h-[22rem] flex-col overflow-hidden rounded-card border bg-card shadow-card transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-popover",
        urgent ? "border-brand/45 hover:border-brand/80" : "border-outline/70 hover:border-brand/55",
      )}
    >
      <div className="pointer-events-none absolute inset-y-5 right-4 z-0 w-[32%] opacity-75 transition duration-500 group-hover:scale-[1.035] group-hover:opacity-100 sm:right-7 sm:w-[36%]">
        <div className="absolute inset-[-12%] rounded-full bg-radial from-info/15 via-info/5 to-transparent to-70% blur-xl" />
        <DistrictMap district={request.district} className="relative size-full drop-shadow-[0_0_14px_rgb(47_178_235_/_0.16)]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-7">
        <div className="flex max-w-[74%] items-center gap-3 sm:gap-4">
          <BloodDrop group={request.bloodGroup} label={`${t.requests.bloodGroup} ${request.bloodGroup}`} />
          <div className="min-w-0">
            <Heading className="text-xl leading-tight font-semibold sm:text-2xl">
              {interpolate(unitsLabel, { count: formatNumber(request.units, lang) })}
            </Heading>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {request.status === "published" ? (
                <UrgencyBadge urgency={request.urgency} />
              ) : (
                <RequestStatusBadge status={request.status} />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 max-w-[67%] space-y-2.5 sm:mt-8">
          <p className="flex items-start gap-2 text-sm text-foreground/90 sm:text-base">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted sm:size-[1.125rem]" aria-hidden="true" />
            <span className="line-clamp-2">{request.hospitalName}</span>
          </p>
          <p className="pl-6 text-sm text-muted sm:pl-7 sm:text-base">{districtName}</p>
        </div>

        <div className="mt-auto grid grid-cols-3 items-center gap-2 border-t border-outline/70 pt-4 text-[0.7rem] text-muted sm:gap-3 sm:pt-5 sm:text-sm">
          <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
            <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
            <span>
              <span className="sr-only">{t.requests.neededBy} </span>
              {formatDate(request.neededAt, lang)}
            </span>
          </span>
          <span className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap border-x border-outline/70 px-1">
            <MessageSquare className="size-4 shrink-0" aria-hidden="true" />
            <span>{interpolate(commentsLabel, { count: formatNumber(request.commentCount, lang) })}</span>
          </span>
          <span className="flex min-w-0 items-center justify-end gap-1.5 whitespace-nowrap">
            <Clock className="size-4 shrink-0" aria-hidden="true" />
            <time dateTime={request.createdAt}>
              {formatRelative(request.createdAt, lang, undefined, "short")}
            </time>
          </span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-[4.75rem] translate-y-full items-center justify-center border-t border-white/15 bg-surface/65 text-sm font-semibold text-foreground opacity-0 shadow-popover backdrop-blur-xl transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 sm:text-base"
      >
        <span className="flex items-center gap-2">
          {t.requests.card.view} {t.requests.card.details}
          <span aria-hidden="true">↗</span>
        </span>
      </div>

      <LocalizedLink
        href={`/requests/${request.id}`}
        aria-label={linkLabel}
        className="absolute inset-0 z-20 cursor-pointer rounded-card focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand"
      />
    </article>
  );
}

function BloodDrop({ group, label }: { group: string; label: string }) {
  return (
    <span
      className="relative grid size-[3.5rem] shrink-0 place-items-center sm:size-[4.75rem]"
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 72 88" className="absolute inset-0 size-full" aria-hidden="true" focusable="false">
        <path
          d="M36 3C29 16 9 38 9 55a27 27 0 0 0 54 0C63 38 43 16 36 3Z"
          className="fill-brand-strong stroke-brand-bright/80"
          strokeWidth="2"
        />
        <path
          d="M20 55c0-8 6-17 11-24"
          className="fill-none stroke-white/45"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <span className="relative z-10 text-lg font-bold tracking-tight text-white sm:text-2xl">{group}</span>
    </span>
  );
}

export function BloodRequestCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="relative flex min-h-[22rem] flex-col overflow-hidden rounded-card border border-outline/70 bg-card p-5 sm:p-7"
    >
      <div className="flex gap-4">
        <div className="size-[3.5rem] animate-pulse rounded-full bg-elevated sm:size-[4.75rem]" />
        <div className="flex flex-1 flex-col gap-2.5 pt-1">
          <div className="h-6 w-36 animate-pulse rounded bg-elevated" />
          <div className="h-4 w-16 animate-pulse rounded bg-elevated" />
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-2.5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-elevated" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-elevated" />
      </div>
      <div className="mt-auto h-10 animate-pulse rounded bg-elevated/70" />
    </div>
  );
}

/** Responsive landscape cards: single column on phones, two columns on larger screens. */
export function RequestGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 lg:grid-cols-2", className)}>{children}</div>;
}
