import { CalendarDays, ChevronUp, Clock, MapPin, MessageSquare } from "lucide-react";
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
        "group relative isolate flex min-h-[20rem] flex-col overflow-hidden rounded-[1.25rem] border bg-[#001e30] shadow-card @container transition-[border-color,box-shadow] duration-300 hover:shadow-popover",
        urgent ? "border-brand/65 hover:border-brand/90" : "border-[#00bded]/80 hover:border-[#44d9ff]",
      )}
      style={{ backgroundImage: "radial-gradient(ellipse at 15% 0%, #002b42 0%, #001e30 65%, #00263b 100%)" }}
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <DistrictMap
          district={request.district}
          className="absolute inset-y-[-18%] right-[-8%] h-[136%] w-[64%] opacity-85 drop-shadow-[0_0_14px_rgb(47_178_235_/_0.16)] transition-opacity duration-500 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#001e30]/85 via-[#001e30]/35 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-[#001e30]/45 via-transparent to-[#001e30]/15" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-5 pb-10 sm:p-6 sm:pb-10">
        <div className="flex items-center gap-3 sm:gap-6">
          <BloodDrop id={request.id} group={request.bloodGroup} label={`${t.requests.bloodGroup} ${request.bloodGroup}`} />
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
            <Heading className="text-xl leading-tight font-semibold sm:text-[clamp(1.5rem,5.25cqw,3.75rem)]">
              {interpolate(unitsLabel, { count: formatNumber(request.units, lang) })}
            </Heading>
            {request.status === "published" ? (
              <UrgencyBadge
                urgency={request.urgency}
                className={cn(
                  "px-4 py-1 text-[clamp(0.875rem,2.6cqw,1.875rem)] text-white",
                  !urgent && "border border-[#0084b6]/75 bg-[#004268]/60 ring-0",
                )}
              />
            ) : (
              <RequestStatusBadge status={request.status} className="px-3 text-sm" />
            )}
          </div>
        </div>

        <div className="mt-4 mb-4 max-w-[82%] space-y-2.5">
          <p className="line-clamp-2 text-[clamp(1.5rem,5.6cqw,4rem)] leading-[1.12] font-bold tracking-tight text-white drop-shadow-[0_2px_2px_rgb(0_0_0_/_0.3)]">
            {request.hospitalName}
          </p>
          <p className="flex items-center gap-3 text-[clamp(1.125rem,3.7cqw,2.75rem)] leading-tight text-white">
            <MapPin className="size-[1.35em] shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>{districtName}</span>
          </p>
        </div>

        <div className="mt-auto grid grid-cols-3 items-center gap-1.5 border-t border-info/35 pt-3.5 text-[0.68rem] text-muted sm:gap-2 sm:pt-4 sm:text-base">
          <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
            <CalendarDays className="size-3.5 shrink-0 sm:size-5" aria-hidden="true" />
            <span>
              <span className="sr-only">{t.requests.neededBy} </span>
              {formatDate(request.neededAt, lang)}
            </span>
          </span>
          <span className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap border-x border-info/35 px-1">
            <MessageSquare className="size-3.5 shrink-0 sm:size-5" aria-hidden="true" />
            <span>{interpolate(commentsLabel, { count: formatNumber(request.commentCount, lang) })}</span>
          </span>
          <span className="flex min-w-0 items-center justify-end gap-1.5 whitespace-nowrap">
            <Clock className="size-3.5 shrink-0 sm:size-5" aria-hidden="true" />
            <time dateTime={request.createdAt}>
              {formatRelative(request.createdAt, lang, undefined, "short")}
            </time>
          </span>
        </div>
      </div>

      <CardDetailsEdge id={request.id} label={`${t.requests.card.view} ${t.requests.card.details}`} />

      <LocalizedLink
        href={`/requests/${request.id}`}
        aria-label={linkLabel}
        className="absolute inset-0 z-20 cursor-pointer rounded-card focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand"
      />
    </article>
  );
}

function CardDetailsEdge({ id, label }: { id: string; label: string }) {
  const clipId = `request-details-clip-${id}`;
  const rimId = `request-details-rim-${id}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[clamp(1.75rem,4.4cqw,3.5rem)]"
    >
      <svg className="absolute size-full" viewBox="0 0 1000 50" preserveAspectRatio="none">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d="M0 1H.24C.282 1 .282 .02 .335 .02H.665C.718 .02 .718 1 .76 1H1V1H0Z" />
          </clipPath>
          <linearGradient id={rimId} x1="0" x2="1" y1="0" y2="0" gradientUnits="objectBoundingBox">
            <stop stopColor="#25caff" stopOpacity="0.15" />
            <stop offset="0.33" stopColor="#a5ceff" stopOpacity="0.7" />
            <stop offset="0.6" stopColor="#f3c2eb" stopOpacity="0.85" />
            <stop offset="0.76" stopColor="#ff7baf" stopOpacity="0.45" />
            <stop offset="1" stopColor="#25caff" stopOpacity="0.15" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className="absolute inset-0 backdrop-blur-xl"
        style={{
          clipPath: `url(#${clipId})`,
          background: "radial-gradient(ellipse at 57% 0%, rgb(225 75 132 / 0.36), transparent 65%), linear-gradient(180deg, rgb(160 194 255 / 0.3), rgb(85 134 195 / 0.12))",
        }}
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_20%,rgb(255_139_195_/_0.6),rgb(73_170_255_/_0.3)_60%,transparent)] opacity-0 group-hover:opacity-100"
        style={{ clipPath: `url(#${clipId})` }}
      />
      <svg className="absolute size-full" viewBox="0 0 1000 50" preserveAspectRatio="none">
        <path
          d="M240 49C282 49 282 1 335 1H665C718 1 718 49 760 49"
          fill="none"
          stroke={`url(#${rimId})`}
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center gap-3 pt-1 text-[clamp(0.8125rem,2.2cqw,1.5rem)] font-semibold text-white">
        <ChevronUp className="size-[1.5em] group-hover:animate-[request-chevron-bounce_750ms_ease-in-out_infinite] motion-reduce:group-hover:animate-none" strokeWidth={2.5} />
        {label}
      </span>
    </div>
  );
}

function BloodDrop({ id, group, label }: { id: string; group: string; label: string }) {
  const gradientId = `request-blood-drop-${id}`;
  return (
    <span
      className="relative block h-[clamp(4.25rem,12.2cqw,8rem)] w-[clamp(3rem,9cqw,6rem)] shrink-0 drop-shadow-[0_3px_3px_rgb(0_0_0_/_0.4)]"
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 72 96" className="absolute inset-0 size-full" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0.7" y1="0" y2="1">
            <stop stopColor="#63021d" />
            <stop offset="0.55" stopColor="#a90029" />
            <stop offset="1" stopColor="#e00033" />
          </linearGradient>
        </defs>
        <path
          d="M36 5C29 16 7 44 7 62a29 29 0 0 0 58 0C65 44 43 16 36 5Z"
          fill={`url(#${gradientId})`}
          stroke="#fafafa"
          strokeWidth="4.5"
        />
        <text x="36" y="65" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="38" fontWeight="700" letterSpacing="-1">{group}</text>
      </svg>
    </span>
  );
}

export function BloodRequestCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="relative flex min-h-[20rem] flex-col overflow-hidden rounded-[1.25rem] border border-outline/70 bg-card p-5 sm:p-6"
    >
      <div className="flex gap-4">
        <div className="h-[4.5rem] w-[3.75rem] animate-pulse rounded-full bg-elevated" />
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

/** Responsive landscape cards, matching the wide request-card layout. */
export function RequestGrid({
  children,
  className,
  columns = 2,
}: {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", columns === 3 ? "xl:grid-cols-3" : "xl:grid-cols-2", className)}>
      {children}
    </div>
  );
}
