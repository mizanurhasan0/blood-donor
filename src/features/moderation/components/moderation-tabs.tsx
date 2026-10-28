import { Clock, Flag, ListChecks, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export const MODERATION_VIEWS = ["pending", "reported", "recent"] as const;
export type ModerationView = (typeof MODERATION_VIEWS)[number];

const TABS: Record<ModerationView, { label: string; icon: LucideIcon }> = {
  pending: { label: "Pending", icon: Clock },
  reported: { label: "Reported", icon: Flag },
  recent: { label: "Recent", icon: ListChecks },
};

export function parseModerationView(value: string | string[] | undefined): ModerationView {
  return MODERATION_VIEWS.find((view) => view === value) ?? "pending";
}

export function ModerationTabs({ current }: { current: ModerationView }) {
  return (
    <nav aria-label="Moderation views" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="inline-flex gap-1 rounded-pill border border-outline/70 bg-surface p-1">
        {MODERATION_VIEWS.map((view) => {
          const { label, icon: Icon } = TABS[view];
          const active = view === current;
          return (
            <li key={view}>
              <Link
                href={view === "pending" ? "/admin/requests" : `/admin/requests?view=${view}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-sm font-medium transition-colors",
                  active ? "bg-elevated text-foreground shadow-card" : "text-muted hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4", active && "text-brand-bright")} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
