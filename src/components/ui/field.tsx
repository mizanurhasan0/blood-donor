"use client";

import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useT } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils/cn";

export const controlClasses =
  "w-full min-h-11 rounded-button border border-outline bg-surface px-3.5 py-2.5 text-foreground placeholder:text-muted/60 transition-colors hover:border-muted/60 focus:border-brand focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-brand/30 aria-invalid:border-brand disabled:opacity-60";

interface FieldProps {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label + control + hint/error wiring. Controls should set aria-describedby via describedBy(). */
export function Field({ id, label, error, hint, optional, className, children }: FieldProps) {
  const t = useT();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">{t.common.optional}</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-brand-bright">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: boolean) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlClasses, "min-h-28 resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className={cn("relative", className)}>
      <select className={cn(controlClasses, "appearance-none pr-10")} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

export function Checkbox({
  label,
  description,
  className,
  id,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode; id: string }) {
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-start gap-3 py-1", className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-brand"
        {...props}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
}
