import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeTone = "brand" | "solid" | "success" | "warning" | "info" | "neutral";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand/15 text-brand-bright ring-brand/30",
  solid: "bg-brand-strong text-foreground ring-transparent",
  success: "bg-success/12 text-success ring-success/30",
  warning: "bg-warning/12 text-warning ring-warning/30",
  info: "bg-info/12 text-info ring-info/30",
  neutral: "bg-elevated text-muted ring-outline",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
