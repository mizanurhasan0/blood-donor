"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useEffectEvent, useId, useMemo, useState, type ReactNode } from "react";
import { BloodDropShape } from "@/components/layout/logo";
import { Combobox } from "@/components/ui/combobox";
import { Field, Input } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectMenu } from "@/components/ui/select-menu";
import { useDebounce } from "@/hooks/use-debounce";
import { BLOOD_GROUPS } from "@/lib/constants/blood-groups";
import { DISTRICTS } from "@/lib/constants/locations";
import { formatNumber } from "@/lib/i18n/format";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils/cn";
import { useRequestFilters } from "../hooks/use-request-filters";

const tileClasses =
  "relative flex min-h-16 items-center justify-center rounded-button border px-2 py-2 transition-colors";

/**
 * URL-driven filters for /requests. Must render under <Suspense> because it
 * reads search params. Sets `data-pending` while results load so the list
 * (inside the same `group/requests`) can dim itself with pure CSS.
 */
export function BloodRequestFilters({ action }: { action?: ReactNode }) {
  const t = useT();
  const { lang } = useLocale();
  const f = t.requests.filters;
  const { filters, activeCount, isPending, setFilter } = useRequestFilters();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const districtOptions = useMemo(
    () =>
      DISTRICTS.map((d) => ({
        value: d.name,
        label: t.geo.districts[d.name],
        hint: t.geo.divisions[d.division],
      })),
    [t],
  );

  return (
    <section
      aria-label={f.label}
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
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-button border border-outline px-3 text-sm font-medium transition-colors hover:border-muted lg:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{f.button}</span>
          {activeCount > 0 && (
            <span className="grid min-w-5 place-items-center rounded-pill bg-brand-strong px-1.5 text-xs leading-5 font-semibold">
              {formatNumber(activeCount, lang)}
              <span className="sr-only"> {f.activeSr}</span>
            </span>
          )}
        </button>
        {action}
      </div>

      <div id={panelId} className={cn(open ? "flex" : "hidden", "mt-4 flex-col gap-4 lg:flex")}>
        <BloodGroupPicker value={filters.bloodGroup} onChange={(v) => setFilter("bloodGroup", v)} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field id="filter-district" label={f.district}>
            <Combobox
              id="filter-district"
              value={filters.district ?? ""}
              onChange={(v) => setFilter("district", v)}
              options={districtOptions}
              placeholder={f.anyDistrict}
              clearable
            />
          </Field>
          <Field id="filter-urgency" label={f.urgency}>
            <SelectMenu
              id="filter-urgency"
              value={filters.urgency ?? ""}
              onValueChange={(value) => setFilter("urgency", value)}
              options={[
                { value: "", label: f.anyUrgency },
                { value: "urgent", label: t.requests.urgency.urgent },
                { value: "normal", label: t.requests.urgency.normal },
              ]}
            />
          </Field>
          <Field id="filter-status" label={f.status}>
            <SelectMenu
              id="filter-status"
              value={filters.status}
              onValueChange={(value) => setFilter("status", value)}
              options={[
                { value: "published", label: t.requests.status.published },
                { value: "fulfilled", label: t.requests.status.fulfilled },
                { value: "expired", label: t.requests.status.expired },
              ]}
            />
          </Field>
          <Field id="filter-needed" label={t.requests.neededBy}>
            <SelectMenu
              id="filter-needed"
              value={filters.needed ?? ""}
              onValueChange={(value) => setFilter("needed", value)}
              options={[
                { value: "", label: f.anyDate },
                { value: "today", label: t.requests.today },
                { value: "3d", label: f.nextThreeDays },
                { value: "7d", label: f.nextSevenDays },
              ]}
            />
          </Field>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {isPending ? f.updatingResults : ""}
      </p>
    </section>
  );
}

function SearchBox({ value, onSearch }: { value: string; onSearch: (q: string) => void }) {
  const t = useT();
  const f = t.requests.filters;
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
        {f.search}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      {/* Responsive hint: a short phrase fits on phones, where the full one would be cut off. */}
      {!text && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-10 -translate-y-1/2 truncate text-muted/60"
        >
          <span className="sm:hidden">{f.searchShort}</span>
          <span className="hidden sm:inline">{f.searchHint}</span>
        </span>
      )}
      <Input
        id="filter-search"
        type="search"
        value={text}
        maxLength={60}
        onChange={(e) => setText(e.target.value)}
        placeholder=""
        autoComplete="off"
        enterKeyHint="search"
        className="pl-10"
      />
    </form>
  );
}

/** Blood group tiles with a drop icon each; tapping the selected tile clears the filter. */
function BloodGroupPicker({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const t = useT();
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{t.requests.bloodGroup}</legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {["", ...BLOOD_GROUPS].map((group) => {
          const active = (value ?? "") === group;
          return (
            <button
              key={group || "any"}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : group)}
              className={cn(
                tileClasses,
                active
                  ? "border-brand-strong bg-brand-strong/10"
                  : "border-outline bg-surface hover:border-muted",
              )}
            >
              {group ? (
                /* The group letters sit inside the drop, so the drop is the visual tile. */
                <span className="relative inline-flex h-14">
                  <BloodDropShape
                    className={cn("h-full w-auto", active ? "text-foreground" : "text-brand-strong")}
                  />
                  <span
                    className={cn(
                      "absolute inset-x-0 bottom-3 text-center text-base leading-none font-bold",
                      active ? "text-background" : "text-foreground",
                    )}
                  >
                    {group}
                  </span>
                </span>
              ) : (
                <span className={cn("text-base font-bold", active ? "text-brand-bright" : "text-muted")}>
                  {t.requests.filters.any}
                </span>
              )}
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
        <Skeleton className="h-11 w-11 shrink-0 lg:hidden" />
        <Skeleton className="h-11 w-24 shrink-0 sm:w-36" />
      </div>
      <div className="mt-4 hidden flex-col gap-4 lg:flex">
        <div className="grid grid-cols-9 gap-2">
          {Array.from({ length: 9 }, (_, i) => (
            <Skeleton key={i} className="h-14" />
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
