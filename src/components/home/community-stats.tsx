import { CheckCircle2, HeartPulse, MapPin, Users } from "lucide-react";
import { connection } from "next/server";
import { unstable_rethrow } from "next/navigation";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { getCommunityStats } from "@/features/requests/request.queries";
import type { CommunityStats as Stats } from "@/features/requests/types";

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

const METRICS: { key: keyof Stats; label: string; icon: ReactNode }[] = [
  { key: "donors", label: "Registered Donors", icon: <Users className="size-6" aria-hidden="true" /> },
  {
    key: "activeRequests",
    label: "Active Requests",
    icon: <HeartPulse className="size-6" aria-hidden="true" />,
  },
  {
    key: "fulfilledRequests",
    label: "Fulfilled Requests",
    icon: <CheckCircle2 className="size-6" aria-hidden="true" />,
  },
  {
    key: "districts",
    label: "Districts Represented",
    icon: <MapPin className="size-6" aria-hidden="true" />,
  },
];

function StatsFrame({ children }: { children: ReactNode }) {
  return (
    <Container>
      <section
        aria-label="Community statistics"
        className="grid grid-cols-2 gap-y-6 rounded-card border border-outline/70 bg-surface/70 px-4 py-6 shadow-card sm:px-6 lg:grid-cols-4 lg:divide-x lg:divide-outline/70 lg:py-7"
      >
        {children}
      </section>
    </Container>
  );
}

function Metric({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 lg:justify-center lg:px-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-bright sm:size-14">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums sm:text-3xl">{value}</p>
        <p className="text-xs text-muted sm:text-sm">{label}</p>
      </div>
    </div>
  );
}

/** Live counts straight from the database — never estimated or padded. */
export async function CommunityStats() {
  await connection();
  let stats: Stats;
  try {
    stats = await getCommunityStats();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[home] stats unavailable", error);
    return null;
  }
  return (
    <StatsFrame>
      {METRICS.map((m) => (
        <Metric key={m.key} icon={m.icon} label={m.label} value={compact.format(stats[m.key])} />
      ))}
    </StatsFrame>
  );
}

export function CommunityStatsSkeleton() {
  return (
    <StatsFrame>
      {METRICS.map((m) => (
        <Metric
          key={m.key}
          icon={m.icon}
          label={m.label}
          value={<span className="inline-block h-8 w-14 animate-pulse rounded bg-elevated align-middle" />}
        />
      ))}
    </StatsFrame>
  );
}
