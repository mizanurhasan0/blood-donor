import { connection } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { Fragment, Suspense, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { formatNumber } from "@/lib/i18n/format";
import { getDictionary, getLocale } from "@/lib/i18n/server";
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

/** Fills {name} placeholders with React nodes, so styled numbers can sit inside a translated sentence. */
function fillNodes(template: string, values: Record<string, ReactNode>): ReactNode[] {
  return template.split(/(\{\w+\})/).map((part, i) => {
    const name = /^\{(\w+)\}$/.exec(part)?.[1];
    return name && name in values ? <Fragment key={i}>{values[name]}</Fragment> : part;
  });
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
  const t = await getDictionary();
  const filters = parseRequestFilters(await searchParams);
  return (
    <Suspense
      key={JSON.stringify(filters)}
      fallback={<BloodRequestListSkeleton label={t.requests.list.loading} />}
    >
      <BloodRequestList filters={filters} />
    </Suspense>
  );
}

async function BloodRequestList({ filters }: { filters: RequestFilters }) {
  await connection();
  const t = await getDictionary();
  const lang = await getLocale();
  let result: RequestPage;
  try {
    result = await searchRequests(filters);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[requests] search failed", error);
    return (
      <ErrorState
        title={t.requests.list.errorTitle}
        description={t.requests.list.errorBody}
        action={
          <ButtonLink href="/requests" variant="secondary" size="sm">
            {t.requests.list.reload}
          </ButtonLink>
        }
      />
    );
  }

  const { items, total, page, pageCount } = result;
  if (items.length === 0) return <NoResults filters={filters} />;

  const from = (page - 1) * LIMITS.requestsPerPage + 1;
  const to = from + items.length - 1;
  const resultsTemplate = total === 1 ? t.requests.list.resultsOne : t.requests.list.resultsOther;

  return (
    <section
      aria-labelledby="results-heading"
      className="flex flex-col gap-6 transition-opacity group-has-data-pending/requests:opacity-60"
    >
      <h2 id="results-heading" className="sr-only">
        {t.requests.list.resultsHeading}
      </h2>
      <p role="status" className="text-sm text-muted">
        {fillNodes(resultsTemplate, {
          range: (
            <span className="font-medium text-foreground">
              {formatNumber(from, lang)}–{formatNumber(to, lang)}
            </span>
          ),
          total: <span className="font-medium text-foreground">{formatNumber(total, lang)}</span>,
        })}
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

async function NoResults({ filters }: { filters: RequestFilters }) {
  const t = await getDictionary();
  const l = t.requests.list;
  if (hasActiveFilters(filters) || filters.page > 1) {
    return (
      <EmptyState
        title={l.noMatchTitle}
        description={l.noMatchBody}
        action={
          <ButtonLink href="/requests" variant="secondary" size="sm">
            {t.requests.filters.clear}
          </ButtonLink>
        }
      />
    );
  }
  return (
    <EmptyState
      title={l.emptyTitle}
      description={l.emptyBody}
      action={
        <ButtonLink href="/request/new" size="sm">
          {t.common.postRequest}
        </ButtonLink>
      }
    />
  );
}

export function BloodRequestListSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only" role="status">
        {label}
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
