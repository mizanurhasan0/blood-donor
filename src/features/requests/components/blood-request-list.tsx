import { connection } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { LIMITS } from "@/lib/constants/site";
import { parseRequestFilters, type RequestFilters } from "@/lib/validators/request";
import { searchRequests } from "../request.queries";
import type { RequestPage } from "../types";
import { BloodRequestCard, BloodRequestCardSkeleton, RequestGrid } from "./blood-request-card";
import { Pagination } from "./pagination";

/** Filters as URL params, omitting defaults, so links stay short and canonical. */
function filterParams(filters: RequestFilters): Record<string, string | undefined> {
  return {
    bloodGroup: filters.bloodGroup,
    district: filters.district,
    urgency: filters.urgency,
    status: filters.status === "published" ? undefined : filters.status,
    needed: filters.needed,
    q: filters.q,
  };
}

function hasActiveFilters(filters: RequestFilters) {
  return Object.values(filterParams(filters)).some(Boolean);
}

/**
 * Resolves the URL filters, then keys the inner boundary on them so a fresh
 * skeleton shows while each new result set loads.
 */
export async function BloodRequestResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseRequestFilters(await searchParams);
  return (
    <Suspense key={JSON.stringify(filters)} fallback={<BloodRequestListSkeleton />}>
      <BloodRequestList filters={filters} />
    </Suspense>
  );
}

async function BloodRequestList({ filters }: { filters: RequestFilters }) {
  await connection();
  let result: RequestPage;
  try {
    result = await searchRequests(filters);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[requests] search failed", error);
    return (
      <ErrorState
        title="We couldn't load requests"
        description="Something went wrong on our side. Please try again in a moment."
        action={
          <ButtonLink href="/requests" variant="secondary" size="sm">
            Reload requests
          </ButtonLink>
        }
      />
    );
  }

  const { items, total, page, pageCount } = result;
  if (items.length === 0) return <NoResults filters={filters} />;

  const from = (page - 1) * LIMITS.requestsPerPage + 1;
  const to = from + items.length - 1;

  return (
    <section
      aria-labelledby="results-heading"
      className="flex flex-col gap-6 transition-opacity group-has-data-pending/requests:opacity-60"
    >
      <h2 id="results-heading" className="sr-only">
        Results
      </h2>
      <p role="status" className="text-sm text-muted">
        Showing{" "}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-foreground">{total}</span> {total === 1 ? "request" : "requests"}
      </p>
      <RequestGrid>
        {items.map((request) => (
          <BloodRequestCard key={request.id} request={request} />
        ))}
      </RequestGrid>
      <Pagination page={page} pageCount={pageCount} basePath="/requests" params={filterParams(filters)} />
    </section>
  );
}

function NoResults({ filters }: { filters: RequestFilters }) {
  if (hasActiveFilters(filters) || filters.page > 1) {
    return (
      <EmptyState
        title="No requests match your filters"
        description="Try another blood group, a nearby district or a wider date range."
        action={
          <ButtonLink href="/requests" variant="secondary" size="sm">
            Clear filters
          </ButtonLink>
        }
      />
    );
  }
  return (
    <EmptyState
      title="No active requests right now"
      description="New requests appear here after a quick review. Need blood? Post a request and it will be shared with matching donors once approved."
      action={
        <ButtonLink href="/request/new" size="sm">
          Post Request
        </ButtonLink>
      }
    />
  );
}

export function BloodRequestListSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only" role="status">
        Loading requests…
      </span>
      <div aria-hidden="true" className="h-5 w-48 animate-pulse rounded bg-elevated" />
      <RequestGrid>
        {Array.from({ length: 8 }, (_, i) => (
          <BloodRequestCardSkeleton key={i} />
        ))}
      </RequestGrid>
    </div>
  );
}
