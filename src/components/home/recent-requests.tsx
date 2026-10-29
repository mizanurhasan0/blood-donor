import { ArrowRight } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/container";
import { EmptyState, ErrorState } from "@/components/ui/states";
import {
  BloodRequestCard,
  BloodRequestCardSkeleton,
  RequestGrid,
} from "@/features/requests/components/blood-request-card";
import { getRecentRequests } from "@/features/requests/request.queries";
import type { RequestSummary } from "@/features/requests/types";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { getDictionary } from "@/lib/i18n/server";

export async function RecentRequestsSection({ children }: { children: ReactNode }) {
  const { home: t } = await getDictionary();
  return (
    <Container className="flex flex-col gap-6 py-14 sm:py-16">
      <SectionHeading
        id="recent-requests"
        title={t.recentTitle}
        action={
          <LocalizedLink
            href="/requests"
            className="group inline-flex min-h-11 items-center gap-2 font-medium text-foreground transition-colors hover:text-brand-bright"
          >
            {t.viewAll}
            <ArrowRight
              className="size-5 text-brand-bright transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </LocalizedLink>
        }
      />
      {children}
    </Container>
  );
}

export async function RecentRequests() {
  await connection();
  const { home: t } = await getDictionary();
  let requests: RequestSummary[];
  try {
    requests = await getRecentRequests(4);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[home] recent requests unavailable", error);
    return <ErrorState title={t.recentErrorTitle} description={t.recentErrorBody} />;
  }
  if (requests.length === 0) {
    return (
      <EmptyState
        title={t.recentEmptyTitle}
        description={t.recentEmptyBody}
        action={<ButtonLink href="/request/new">{t.postBloodRequest}</ButtonLink>}
      />
    );
  }
  return (
    <RequestGrid columns={2}>
      {requests.map((request) => (
        <BloodRequestCard key={request.id} request={request} />
      ))}
    </RequestGrid>
  );
}

export function RecentRequestsSkeleton() {
  return (
    <RequestGrid columns={2}>
      {Array.from({ length: 4 }, (_, i) => (
        <BloodRequestCardSkeleton key={i} />
      ))}
    </RequestGrid>
  );
}
