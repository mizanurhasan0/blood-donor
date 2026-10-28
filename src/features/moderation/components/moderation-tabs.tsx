import { Clock, Flag, ListChecks, type LucideIcon } from "lucide-react";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { getDictionary } from "@/lib/i18n/server";
import { cn } from "@/lib/utils/cn";

export const MODERATION_VIEWS = ["pending", "reported", "recent"] as const;
export type ModerationView = (typeof MODERATION_VIEWS)[number];

const ICONS: Record<ModerationView, LucideIcon> = {
  pending: Clock,
  reported: Flag,
  recent: ListChecks,
};

export function parseModerationView(value: string | string[] | undefined): ModerationView {
  return MODERATION_VIEWS.find((view) => view === value) ?? "pending";
}

export async function ModerationTabs({ current }: { current: ModerationView }) {
  const t = await getDictionary();
  return (
    <nav aria-label={t.moderation.tabs.label} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="inline-flex gap-1 rounded-pill border border-outline/70 bg-surface p-1">
        {MODERATION_VIEWS.map((view) => {
          const Icon = ICONS[view];
          const active = view === current;
          return (
            <li key={view}>
              <LocalizedLink
                href={view === "pending" ? "/admin/requests" : `/admin/requests?view=${view}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-sm font-medium transition-colors",
                  active ? "bg-elevated text-foreground shadow-card" : "text-muted hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4", active && "text-brand-bright")} aria-hidden="true" />
                {t.moderation.tabs[view]}
              </LocalizedLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
