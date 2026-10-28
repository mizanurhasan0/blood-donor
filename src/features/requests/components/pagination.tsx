import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  page: number;
  pageCount: number;
  basePath: string;
  /** Current query params to keep on every page link (without `page`). */
  params: Record<string, string | undefined>;
}

const itemClasses =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-button px-3 text-sm font-medium transition-colors";

function hrefFor(basePath: string, params: PaginationProps["params"], page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** 1 … 4 5 6 … 12 — first, last and the current page's neighbours. */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["gap" as const, p] : [p]));
}

export function Pagination({ page, pageCount, basePath, params }: PaginationProps) {
  if (pageCount <= 1) return null;
  const href = (p: number) => hrefFor(basePath, params, p);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-2 sm:justify-center">
      <StepLink href={page > 1 ? href(page - 1) : null} direction="prev" />
      <p className="text-sm text-muted sm:hidden">
        Page {page} of {pageCount}
      </p>
      <ul className="hidden items-center gap-1 sm:flex">
        {pageWindow(page, pageCount).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={href(p)}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  itemClasses,
                  p === page
                    ? "bg-brand-strong text-foreground"
                    : "text-muted hover:bg-surface hover:text-foreground",
                )}
              >
                <span className="sr-only">Page </span>
                {p}
              </Link>
            </li>
          ),
        )}
      </ul>
      <StepLink href={page < pageCount ? href(page + 1) : null} direction="next" />
    </nav>
  );
}

function StepLink({ href, direction }: { href: string | null; direction: "prev" | "next" }) {
  const label = direction === "prev" ? "Previous" : "Next";
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const content = (
    <>
      {direction === "prev" && <Icon className="size-4" aria-hidden="true" />}
      {label}
      <span className="sr-only"> page</span>
      {direction === "next" && <Icon className="size-4" aria-hidden="true" />}
    </>
  );

  if (!href) {
    return (
      <span aria-disabled="true" className={cn(itemClasses, "border border-outline/50 text-muted/50")}>
        {content}
      </span>
    );
  }
  return (
    <Link
      href={href}
      rel={direction}
      className={cn(itemClasses, "border border-outline hover:border-muted hover:bg-surface")}
    >
      {content}
    </Link>
  );
}
