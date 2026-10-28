"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useT } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils/cn";
import { controlClasses } from "./field";

export interface ComboboxOption {
  value: string;
  label: string;
  hint?: string;
}

interface ComboboxProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly ComboboxOption[];
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  clearable?: boolean;
  onBlur?: () => void;
}

/** Searchable select following the WAI-ARIA combobox pattern. */
export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder,
  invalid,
  describedBy,
  clearable = false,
  onBlur,
}: ComboboxProps) {
  const t = useT();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    // Rank exact label, then label prefix, then label substring, then hint-only matches,
    // so typing "Khulna" offers the Khulna district before other districts in Khulna division.
    const rank = (o: ComboboxOption) => {
      const label = o.label.toLowerCase();
      if (label === q) return 0;
      if (label.startsWith(q)) return 1;
      if (label.includes(q)) return 2;
      return o.hint?.toLowerCase().includes(q) ? 3 : -1;
    };
    return options
      .map((option) => ({ option, score: rank(option) }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => a.score - b.score)
      .map((r) => r.option);
  }, [options, query]);

  function choose(option: ComboboxOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (filtered.length ? (i + step + filtered.length) % filtered.length : 0));
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      const option = filtered[active];
      if (option) choose(option);
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  const activeId = open && filtered[active] ? `${listId}-${active}` : undefined;

  return (
    <div className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        className={cn(controlClasses, "pr-16")}
        placeholder={selected ? selected.label : (placeholder ?? t.common.search)}
        value={open ? query : (selected?.label ?? "")}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          setQuery("");
          onBlur?.();
        }}
        onKeyDown={onKeyDown}
      />
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1 text-muted">
        {clearable && value && (
          <button
            type="button"
            className="pointer-events-auto grid size-7 place-items-center rounded-full hover:bg-elevated hover:text-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange("")}
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">{t.common.clearSelection}</span>
          </button>
        )}
        <ChevronDown className="size-4" aria-hidden="true" />
      </div>
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-64 w-full animate-slide-in overflow-auto rounded-button border border-outline bg-surface p-1 shadow-popover"
        >
          {filtered.length === 0 && <li className="px-3 py-2.5 text-sm text-muted">{t.common.noMatches}</li>}
          {filtered.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(option)}
              className={cn(
                "flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-[calc(var(--radius-button)-4px)] px-3 py-2 text-sm",
                index === active && "bg-elevated",
              )}
            >
              <span>
                {option.label}
                {option.hint && <span className="ml-2 text-xs text-muted">{option.hint}</span>}
              </span>
              {option.value === value && <Check className="size-4 text-brand-bright" aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
