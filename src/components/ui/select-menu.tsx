"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { controlClasses } from "./field";

export interface SelectOption {
  value: string;
  label: string;
}

// Radix does not allow an empty string as an item value, so "" is mapped to this sentinel.
const NONE = "__none__";

interface SelectMenuProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}

/**
 * Styled dropdown built on Radix Select: keyboard, typeahead and screen-reader
 * behaviour come from the library; the look comes from the shared control styles.
 */
export function SelectMenu({
  id,
  value,
  onValueChange,
  options,
  invalid,
  describedBy,
  className,
}: SelectMenuProps) {
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <Select.Root
      value={value === "" ? NONE : value}
      onValueChange={(next) => onValueChange(next === NONE ? "" : next)}
    >
      <Select.Trigger
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(controlClasses, "flex items-center justify-between gap-2 pr-3 text-left", className)}
      >
        <Select.Value className="truncate">{selected?.label}</Select.Value>
        <Select.Icon asChild>
          <ChevronDown
            className="size-4 shrink-0 text-muted transition-transform duration-200 data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-72 w-(--radix-select-trigger-width) animate-slide-in overflow-hidden rounded-card border border-outline bg-elevated p-1 shadow-popover"
        >
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value || NONE}
                value={option.value === "" ? NONE : option.value}
                className="relative flex min-h-11 cursor-pointer items-center rounded-button py-2 pr-9 pl-3 text-sm text-foreground outline-none select-none data-highlighted:bg-surface data-[state=checked]:font-semibold data-[state=checked]:text-brand-bright"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-3 grid place-items-center">
                  <Check className="size-4" aria-hidden="true" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
