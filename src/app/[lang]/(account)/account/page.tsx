import { ChevronRight, HeartHandshake, LogOut, Plus } from "lucide-react";
import type { ObjectId } from "mongodb";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { signOutAction } from "@/features/auth/actions";
import { requireViewerOrRedirect, type Viewer } from "@/features/auth/viewer";
import { DeleteAccountCard } from "@/features/donors/components/delete-account-card";
import { DonorProfileCard } from "@/features/donors/components/donor-profile-card";
import { DonorProfileEditor } from "@/features/donors/components/donor-registration-form";
import { NotificationPreferences } from "@/features/donors/components/notification-preferences";
import { Rich } from "@/features/donors/components/rich-text";
import { TelegramJoinCard, TelegramJoinCardSkeleton } from "@/features/donors/components/telegram-join-card";
import { getProfileFormValues } from "@/features/donors/donor.service";
import { BloodGroupBadge, RequestStatusBadge } from "@/features/requests/components/badges";
import { listRequestsByCreator } from "@/features/requests/request.repository";
import type { RequestSummary } from "@/features/requests/types";
import type { Locale } from "@/lib/i18n/config";
import { formatDate, formatNumber, formatRelative, interpolate } from "@/lib/i18n/format";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import type { Dictionary } from "@/lib/i18n/messages";
import { localeAlternates, localizedPath } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";

// Guests get a real redirect to /login, so this page blocks on the session.
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  const lang = await getLocale();
  return {
    title: t.account.metaTitle,
    alternates: localeAlternates(lang, "/account"),
    robots: { index: false, follow: false },
  };
}

async function ProfileSection({ viewer }: { viewer: Viewer }) {
  const t = await getDictionary();
  const copy = t.account;
  const values = viewer.donor ? await getProfileFormValues(viewer) : null;
  if (!viewer.donor || !values) {
    return (
      <Card className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-bright">
          <HeartHandshake className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <h2 id="profile-heading" className="text-lg font-semibold">
            {copy.notRegisteredTitle}
          </h2>
          <p className="text-sm text-muted">{copy.notRegisteredText}</p>
        </div>
        <ButtonLink href="/become-donor">{copy.becomeDonor}</ButtonLink>
      </Card>
    );
  }
  return <DonorProfileEditor card={<DonorProfileCard donor={viewer.donor} />} initialValues={values} />;
}

function RequestRow({ request, lang, t }: { request: RequestSummary; lang: Locale; t: Dictionary }) {
  const copy = t.account;
  return (
    <LocalizedLink
      href={`/requests/${request.id}`}
      className="group flex items-center gap-4 rounded-card border border-outline/70 bg-card p-4 transition-colors hover:border-muted/50"
    >
      <BloodGroupBadge group={request.bloodGroup} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">
            {interpolate(request.units === 1 ? copy.unit : copy.units, {
              count: formatNumber(request.units, lang),
            })}
          </span>
          <RequestStatusBadge status={request.status} />
        </div>
        <p className="truncate text-sm text-muted">
          {request.hospitalName}, {t.geo.districts[request.district]}
        </p>
        <p className="text-xs text-muted">
          <Rich
            text={copy.neededByPosted}
            values={{
              date: formatDate(request.neededAt, lang),
              time: <time dateTime={request.createdAt}>{formatRelative(request.createdAt, lang)}</time>,
            }}
          />
        </p>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-muted transition-colors group-hover:text-foreground"
        aria-hidden="true"
      />
    </LocalizedLink>
  );
}

async function MyRequests({ creatorId }: { creatorId: ObjectId }) {
  const t = await getDictionary();
  const lang = await getLocale();
  const requests = await listRequestsByCreator(creatorId);
  if (requests.length === 0) {
    return <EmptyState title={t.account.noRequestsTitle} description={t.account.noRequestsText} />;
  }
  return (
    <ul className="flex flex-col gap-3">
      {requests.map((request) => (
        <li key={request.id}>
          <RequestRow request={request} lang={lang} t={t} />
        </li>
      ))}
    </ul>
  );
}

function ListSkeleton({ rows, className }: { rows: number; className: string }) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}

function SignOutForm({ label, redirectTo }: { label: string; redirectTo: string }) {
  return (
    <form action={signOutAction}>
      {/* Language-prefixed home page to return to after signing out. */}
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <Button type="submit" variant="secondary">
        <LogOut className="size-4" aria-hidden="true" />
        {label}
      </Button>
    </form>
  );
}

export default async function AccountPage() {
  const viewer = await requireViewerOrRedirect("/account");
  const { donor } = viewer;
  const t = await getDictionary();
  const lang = await getLocale();
  const copy = t.account;

  return (
    <PageContainer
      narrow
      title={copy.title}
      description={
        <Rich
          text={copy.signedInAs}
          values={{ email: <span className="text-foreground">{viewer.email}</span> }}
        />
      }
      action={<SignOutForm label={copy.signOut} redirectTo={localizedPath(lang, "/")} />}
    >
      <div className="flex flex-col gap-12">
        <section aria-labelledby="profile-heading">
          <Suspense fallback={<ListSkeleton rows={1} className="h-64 rounded-card" />}>
            <ProfileSection viewer={viewer} />
          </Suspense>
        </section>

        <section
          id="notifications"
          aria-labelledby="notifications-heading"
          className="flex scroll-mt-28 flex-col gap-4"
        >
          <h2 id="notifications-heading" className="text-xl font-semibold">
            {copy.notifications}
          </h2>
          {donor ? (
            <NotificationPreferences
              available={donor.available}
              emailNotifications={donor.emailNotifications}
            />
          ) : (
            <p className="text-sm text-muted">{copy.registerForAlerts}</p>
          )}
        </section>

        <Suspense fallback={<TelegramJoinCardSkeleton />}>
          <TelegramJoinCard linked={donor?.telegramLinked ?? false} isDonor={donor !== null} />
        </Suspense>

        <section aria-labelledby="my-requests-heading" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="my-requests-heading" className="text-xl font-semibold">
                {copy.myRequests}
              </h2>
              <p className="text-sm text-muted">{copy.myRequestsHint}</p>
            </div>
            <ButtonLink href="/request/new">
              <Plus className="size-4" aria-hidden="true" />
              {copy.postRequest}
            </ButtonLink>
          </div>
          <Suspense fallback={<ListSkeleton rows={3} className="h-24 rounded-card" />}>
            <MyRequests creatorId={viewer.objectId} />
          </Suspense>
        </section>

        <DeleteAccountCard />
      </div>
    </PageContainer>
  );
}
