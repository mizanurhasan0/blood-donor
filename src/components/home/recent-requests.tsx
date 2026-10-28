import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
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

export function RecentRequestsSection({ children }: { children: React.ReactNode }) {
  return (
    <Container className="flex flex-col gap-6 py-14 sm:py-16">
      <SectionHeading
        id="recent-requests"
        title="Recent Blood Requests"
        action={
          <Link
            href="/requests"
            className="group inline-flex min-h-11 items-center gap-2 font-medium text-foreground transition-colors hover:text-brand-bright"
          >
            View All
            <ArrowRight
              className="size-5 text-brand-bright transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        }
      />
      {children}
    </Container>
  );
}

export async function RecentRequests() {
  await connection();
  let requests: RequestSummary[];
  try {
    requests = await getRecentRequests(4);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[home] recent requests unavailable", error);
    return (
      <ErrorState title="Requests are temporarily unavailable" description="Please try again in a moment." />
    );
  }
  if (requests.length === 0) {
    return (
      <EmptyState
        title="No active requests right now"
        description="When someone needs blood, their approved request will appear here."
        action={<ButtonLink href="/request/new">Post Blood Request</ButtonLink>}
      />
    );
  }
  return (
    <RequestGrid>
      {requests.map((request) => (
        <BloodRequestCard key={request.id} request={request} />
      ))}
    </RequestGrid>
  );
}

export function RecentRequestsSkeleton() {
  return (
    <RequestGrid>
      {Array.from({ length: 4 }, (_, i) => (
        <BloodRequestCardSkeleton key={i} />
      ))}
    </RequestGrid>
  );
}
