import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { BloodGroup } from "@/lib/constants/blood-groups";
import type { RequestStatus, Urgency } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

export function BloodGroupBadge({
  group,
  size = "md",
  className,
}: {
  group: BloodGroup;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "size-11 text-xl rounded-[0.65rem]",
    md: "size-[4.5rem] text-3xl rounded-card",
    lg: "size-24 text-4xl rounded-card",
  };
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center bg-brand-soft font-bold tracking-tight text-brand-strong",
        sizes[size],
        className,
      )}
    >
      <span className="sr-only">Blood group </span>
      {group}
    </span>
  );
}

const STATUS: Record<RequestStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending review", tone: "warning" },
  published: { label: "Active", tone: "success" },
  fulfilled: { label: "Fulfilled", tone: "info" },
  expired: { label: "Expired", tone: "neutral" },
  rejected: { label: "Rejected", tone: "brand" },
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>;
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return urgency === "urgent" ? <Badge tone="solid">Urgent</Badge> : <Badge tone="neutral">Normal</Badge>;
}
