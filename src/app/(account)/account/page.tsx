import { ChevronRight, HeartHandshake, LogOut, Plus } from "lucide-react";
import type { ObjectId } from "mongodb";
import type { Metadata } from "next";
import Link from "next/link";
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
import { TelegramJoinCard, TelegramJoinCardSkeleton } from "@/features/donors/components/telegram-join-card";
import { getProfileFormValues } from "@/features/donors/donor.service";
import { BloodGroupBadge, RequestStatusBadge } from "@/features/requests/components/badges";
import { listRequestsByCreator } from "@/features/requests/request.repository";
import type { RequestSummary } from "@/features/requests/types";
import { formatDate, formatRelative } from "@/lib/utils/dates";

// Guests get a real redirect to /login, so this page blocks on the session.
export const instant = false;

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

async function ProfileSection({ viewer }: { viewer: Viewer }) {
  const values = viewer.donor ? await getProfileFormValues(viewer) : null;
  if (!viewer.donor || !values) {
    return (
      <Card className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-bright">
          <HeartHandshake className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <h2 id="profile-heading" className="text-lg font-semibold">
            You&apos;re not registered as a donor yet
          </h2>
          <p className="text-sm text-muted">
            Add your blood group and district to get alerts when someone nearby needs help.
          </p>
        </div>
        <ButtonLink href="/become-donor">Become a donor</ButtonLink>
      </Card>
    );
  }
  return <DonorProfileEditor card={<DonorProfileCard donor={viewer.donor} />} initialValues={values} />;
}

function RequestRow({ request }: { request: RequestSummary }) {
  return (
    <Link
      href={`/requests/${request.id}`}
      className="group flex items-center gap-4 rounded-card border border-outline/70 bg-card p-4 transition-colors hover:border-muted/50"
    >
      <BloodGroupBadge group={request.bloodGroup} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">
            {request.units} {request.units === 1 ? "unit" : "units"} needed
          </span>
          <RequestStatusBadge status={request.status} />
        </div>
        <p className="truncate text-sm text-muted">
          {request.hospitalName}, {request.district}
        </p>
        <p className="text-xs text-muted">
          Needed by {formatDate(request.neededAt)} · Posted{" "}
          <time dateTime={request.createdAt}>{formatRelative(request.createdAt)}</time>
        </p>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-muted transition-colors group-hover:text-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}

async function MyRequests({ creatorId }: { creatorId: ObjectId }) {
  const requests = await listRequestsByCreator(creatorId);
  if (requests.length === 0) {
    return (
      <EmptyState
        title="No requests yet"
        description="When you post a blood request, you can follow its review here and mark it fulfilled once you have donors."
      />
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {requests.map((request) => (
        <li key={request.id}>
          <RequestRow request={request} />
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

function SignOutForm() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="secondary">
        <LogOut className="size-4" aria-hidden="true" />
        Sign out
      </Button>
    </form>
  );
}

export default async function AccountPage() {
  const viewer = await requireViewerOrRedirect("/account");
  const { donor } = viewer;

  return (
    <PageContainer
      narrow
      title="My account"
      description={
        <>
          Signed in as <span className="text-foreground">{viewer.email}</span>
        </>
      }
      action={<SignOutForm />}
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
            Notifications
          </h2>
          {donor ? (
            <NotificationPreferences
              available={donor.available}
              emailNotifications={donor.emailNotifications}
            />
          ) : (
            <p className="text-sm text-muted">
              Register as a donor to choose how we alert you about nearby requests.
            </p>
          )}
        </section>

        <Suspense fallback={<TelegramJoinCardSkeleton />}>
          <TelegramJoinCard linked={donor?.telegramLinked ?? false} isDonor={donor !== null} />
        </Suspense>

        <section aria-labelledby="my-requests-heading" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="my-requests-heading" className="text-xl font-semibold">
                My blood requests
              </h2>
              <p className="text-sm text-muted">Open a request to see its progress or mark it fulfilled.</p>
            </div>
            <ButtonLink href="/request/new">
              <Plus className="size-4" aria-hidden="true" />
              Post a request
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
