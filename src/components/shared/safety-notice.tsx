"use client";

import { ShieldAlert } from "lucide-react";
import { useT } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils/cn";

/**
 * Responsible-matching notice shown wherever donors and requesters connect.
 * Client component so it can be used from both server and client pages.
 */
export function SafetyNotice({ className }: { className?: string }) {
  const t = useT();
  return (
    <aside
      className={cn(
        "flex gap-3 rounded-card border border-warning/30 bg-warning/5 p-4 text-sm text-muted",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
      <p>
        <strong className="font-medium text-foreground">{t.common.safetyTitle}</strong> {t.common.safetyBody}
      </p>
    </aside>
  );
}
