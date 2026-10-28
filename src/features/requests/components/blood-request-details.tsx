import {
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock,
  Droplet,
  Hospital,
  Hourglass,
  MapPin,
  Phone,
} from "lucide-react";
import { Suspense, type ComponentType, type ReactNode } from "react";
import { SafetyNotice } from "@/components/shared/safety-notice";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, formatNumber, formatRelative, interpolate } from "@/lib/i18n/format";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils/cn";
import { isPastNeededDate, todayInBangladesh } from "@/lib/utils/dates";
import type { RequestDetail } from "../types";
import { BloodGroupBadge, RequestStatusBadge, UrgencyBadge } from "./badges";
import { ViewerActions, ViewerContact, ViewerContactSkeleton } from "./request-viewer-panel";

/**
 * Full request view. Uses the current time (relative dates, "today"), so
 * render it only at request time. `children` goes under the description
 * (the comment section).
 */
export async function BloodRequestDetails({
  request,
  children,
}: {
  request: RequestDetail;
  children?: ReactNode;
}) {
  const t = await getDictionary();
  return (
    <div className="flex flex-col gap-6">
      <StatusBanner request={request} />
      {/* Mobile: summary → contact → details. Desktop: sticky side panel spanning both rows. */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-8">
        <SummaryCard request={request} />
        <aside
          aria-label={t.requests.detail.aside}
          className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <ContactCard request={request} />
          <Suspense>
            <ViewerActions request={request} />
          </Suspense>
        </aside>
        <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-2">
          {request.description && (
            <Card className="p-5 sm:p-7">
              <h2 className="text-lg font-semibold">{t.requests.detail.about}</h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line text-foreground/90">
                {request.description}
              </p>
            </Card>
          )}
          <SafetyNotice />
          {children}
        </div>
      </div>
    </div>
  );
}

async function SummaryCard({ request }: { request: RequestDetail }) {
  const t = await getDictionary();
  const lang = await getLocale();
  const headingLabel = request.units === 1 ? t.requests.detail.headingOne : t.requests.detail.headingOther;
  const unitsLabel =
    request.units === 1 ? t.requests.detail.unitsValueOne : t.requests.detail.unitsValueOther;
  const count = formatNumber(request.units, lang);
  return (
    <Card className="relative overflow-hidden p-5 sm:p-7 lg:col-start-1 lg:row-start-1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-28 size-72 rounded-full bg-brand/10 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <BloodGroupBadge group={request.bloodGroup} size="lg" />
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <RequestStatusBadge status={request.status} />
            {request.status === "published" && <UrgencyBadge urgency={request.urgency} />}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {interpolate(headingLabel, { count, bloodGroup: request.bloodGroup })}
          </h1>
          <p className="flex items-start gap-2 text-muted">
            <Hospital className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words text-foreground/90">{request.hospitalName}</span>
          </p>
        </div>
      </div>
      <dl className="relative mt-6 grid gap-px overflow-hidden rounded-button border border-outline/60 bg-outline/60 sm:grid-cols-2">
        <Fact icon={CalendarDays} label={t.requests.neededBy}>
          <NeededDate request={request} />
        </Fact>
        <Fact icon={MapPin} label={t.requests.detail.location}>
          {interpolate(t.requests.detail.locationValue, {
            district: t.geo.districts[request.district],
            division: t.geo.divisions[request.division],
          })}
        </Fact>
        <Fact icon={Droplet} label={t.requests.detail.unitsRequired}>
          {interpolate(unitsLabel, { count, bloodGroup: request.bloodGroup })}
        </Fact>
        <Fact icon={Clock} label={t.requests.posted}>
          <time dateTime={request.publishedAt ?? request.createdAt}>
            {formatRelative(request.publishedAt ?? request.createdAt, lang)}
          </time>
        </Fact>
      </dl>
    </Card>
  );
}

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}) {
  return (
    // A <dl> may only contain <div>s wrapping dt/dd directly, so the icon lives inside the <dt>.
    <div className="min-w-0 bg-card p-4">
      <dt className="flex items-center gap-2 text-xs tracking-wide text-muted uppercase">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 pl-6 font-medium">{children}</dd>
    </div>
  );
}

async function NeededDate({ request }: { request: RequestDetail }) {
  const t = await getDictionary();
  const lang = await getLocale();
  const isToday = todayInBangladesh(new Date(request.neededAt)) === todayInBangladesh();
  const passed = request.status === "published" && !isToday && isPastNeededDate(request.neededAt);
  return (
    <span className="flex flex-wrap items-center gap-2">
      <time
        dateTime={request.neededAt}
        className={cn(isToday && request.status === "published" && "text-brand-bright")}
      >
        {formatDate(request.neededAt, lang, "long")}
      </time>
      {isToday && request.status === "published" && <Badge tone="brand">{t.requests.today}</Badge>}
      {passed && <Badge tone="neutral">{t.requests.detail.datePassed}</Badge>}
    </span>
  );
}

async function ContactCard({ request }: { request: RequestDetail }) {
  const t = await getDictionary();
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{t.requests.contact.title}</h2>
        <p className="flex items-center gap-2 text-lg font-medium tracking-wider text-foreground/80">
          <Phone className="size-4 text-muted" aria-hidden="true" />
          <span aria-hidden="true">{request.contactPhoneMasked}</span>
          <span className="sr-only">{t.requests.contact.phoneHidden}</span>
        </p>
      </div>
      <Suspense fallback={<ViewerContactSkeleton />}>
        <ViewerContact request={request} />
      </Suspense>
    </Card>
  );
}

const BANNERS = {
  pending: {
    tone: "border-warning/30 bg-warning/5",
    icon: <Hourglass className="size-5 shrink-0 text-warning" aria-hidden="true" />,
  },
  rejected: {
    tone: "border-brand/30 bg-brand/5",
    icon: <CircleX className="size-5 shrink-0 text-brand-bright" aria-hidden="true" />,
  },
  fulfilled: {
    tone: "border-info/30 bg-info/5",
    icon: <CircleCheck className="size-5 shrink-0 text-info" aria-hidden="true" />,
  },
  expired: {
    tone: "border-outline bg-surface",
    icon: <Clock className="size-5 shrink-0 text-muted" aria-hidden="true" />,
  },
} as const;

async function StatusBanner({ request }: { request: RequestDetail }) {
  if (request.status === "published") return null;
  const t = await getDictionary();
  const banner = BANNERS[request.status];
  const copy = t.requests.detail.banners[request.status];
  // A rejected request shows the moderator's note only when there is one.
  const body =
    request.status === "rejected"
      ? request.moderationNote && interpolate(copy.body, { note: request.moderationNote })
      : copy.body;
  return (
    <div className={cn("flex gap-3 rounded-card border p-4 text-sm", banner.tone)}>
      {banner.icon}
      <div className="flex flex-col gap-1">
        <p className="font-medium text-foreground">{copy.title}</p>
        {body && <p className="text-muted">{body}</p>}
      </div>
    </div>
  );
}
