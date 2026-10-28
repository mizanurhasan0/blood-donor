import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Responsible-matching notice shown wherever donors and requesters connect. */
export function SafetyNotice({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex gap-3 rounded-card border border-warning/30 bg-warning/5 p-4 text-sm text-muted",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
      <p>
        <strong className="font-medium text-foreground">Safety notice:</strong> matching by blood group only
        finds potential volunteers. Final screening, compatibility testing and donation eligibility are
        decided by qualified medical staff. Never pay or accept payment for blood.
      </p>
    </aside>
  );
}
