"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useEffectEvent, useId, useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Field, Input, Select } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/use-debounce";
import { BLOOD_GROUPS } from "@/lib/constants/blood-groups";
import { DISTRICTS } from "@/lib/constants/locations";
import { cn } from "@/lib/utils/cn";
import { useRequestFilters } from "../hooks/use-request-filters";

const DISTRICT_OPTIONS = DISTRICTS.map((d) => ({ value: d.name, label: d.name, hint: d.division }));

const chipClasses =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill border px-3.5 text-sm font-semibold transition-colors";

/**
 * URL-driven filters for /requests. Must render under <Suspense> because it
 * reads search params. Sets `data-pending` while results load so the list
 * (inside the same `group/requests`) can dim itself with pure CSS.
 */
export function BloodRequestFilters() {
  const { filters, activeCount, hasFilters, isPending, setFilter, clear } = useRequestFilters();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const applied = activeCount + (filters.q ? 1 : 0);

  return (
    <section
      aria-label="Filter blood requests"
      data-pending={isPending || undefined}
      className="rounded-card border border-outline/70 bg-card/60 p-4 shadow-card sm:p-5"
    >
      <div className="flex items-center gap-3">
        <SearchBox value={filters.q ?? ""} onSearch={(q) => setFilter("q", q)} />
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-button border border-outline px-3.5 text-sm font-medium transition-colors hover:border-muted lg:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="grid min-w-5 place-items-center rounded-pill bg-brand-strong px-1.5 text-xs leading-5 font-semibold">
              {activeCount}
              <span className="sr-only"> active</span>
            </span>
          )}
        </button>
      </div>

      <div id={panelId} className={cn(open ? "flex" : "hidden", "mt-4 flex-col gap-4 lg:flex")}>
        <BloodGroupChips value={filters.bloodGroup} onChange={(v) => setFilter("bloodGroup", v)} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field id="filter-district" label="District">
            <Combobox
              id="filter-district"
              value={filters.district ?? ""}
              onChange={(v) => setFilter("district", v)}
              options={DISTRICT_OPTIONS}
              placeholder="Any district"
              clearable
            />
          </Field>
          <Field id="filter-urgency" label="Urgency">
            <Select
              id="filter-urgency"
              value={filters.urgency ?? ""}
              onChange={(e) => setFilter("urgency", e.target.value)}
            >
              <option value="">Any urgency</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
            </Select>
          </Field>
          <Field id="filter-status" label="Status">
            <Select
              id="filter-status"
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value)}
            >
              <option value="published">Active</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="expired">Expired</option>
            </Select>
          </Field>
          <Field id="filter-needed" label="Needed by">
            <Select
              id="filter-needed"
              value={filters.needed ?? ""}
              onChange={(e) => setFilter("needed", e.target.value)}
            >
              <option value="">Any date</option>
              <option value="today">Today</option>
              <option value="3d">Next 3 days</option>
              <option value="7d">Next 7 days</option>
            </Select>
          </Field>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {isPending ? "Updating results" : ""}
      </p>
      {(hasFilters || isPending) && (
        <div className="mt-4 flex min-h-11 items-center justify-between gap-3 border-t border-outline/60 pt-3">
          <span className="flex items-center gap-2 text-sm text-muted">
            {isPending && <Spinner className="size-4 text-brand-bright" />}
            {isPending ? "Updating…" : `${applied} ${applied === 1 ? "filter" : "filters"} applied`}
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function SearchBox({ value, onSearch }: { value: string; onSearch: (q: string) => void }) {
  const [text, setText] = useState(value);
  const [synced, setSynced] = useState(value);
  const debounced = useDebounce(text, 350);

  // Follow URL changes made elsewhere (back/forward, links) without clobbering typing.
  if (value !== synced) {
    setSynced(value);
    if (value !== debounced.trim()) setText(value);
  }

  const search = useEffectEvent((next: string) => {
    if (next !== value) onSearch(next);
  });
  useEffect(() => {
    search(debounced.trim());
  }, [debounced]);

  return (
    <form
      role="search"
      className="relative min-w-0 flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim() !== value) onSearch(text.trim());
      }}
    >
      <label htmlFor="filter-search" className="sr-only">
        Search by hospital or district
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <Input
        id="filter-search"
        type="search"
        value={text}
        maxLength={60}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search hospital or district"
        autoComplete="off"
        enterKeyHint="search"
        className="pl-10"
      />
    </form>
  );
}

function BloodGroupChips({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Blood group</legend>
      <div className="flex flex-wrap gap-2">
        {["", ...BLOOD_GROUPS].map((group) => {
          const active = (value ?? "") === group;
          return (
            <button
              key={group || "any"}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : group)}
              className={cn(
                chipClasses,
                active
                  ? "border-brand-strong bg-brand-strong text-foreground"
                  : "border-outline text-muted hover:border-muted hover:text-foreground",
              )}
            >
              {group || "Any"}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function BloodRequestFiltersSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-card border border-outline/70 bg-card/60 p-4 sm:p-5">
      <div className="flex gap-3">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-28 lg:hidden" />
      </div>
      <div className="mt-4 hidden flex-col gap-4 lg:flex">
        <div className="flex gap-2">
          {Array.from({ length: 9 }, (_, i) => (
            <Skeleton key={i} className="size-11 rounded-pill" />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[4.25rem]" />
          ))}
        </div>
      </div>
    </div>
  );
}
