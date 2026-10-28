import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { BloodGroup } from "@/lib/constants/blood-groups";
import type { RequestStatus, Urgency } from "@/lib/constants/site";
import { getDictionary } from "@/lib/i18n/server";
import { cn } from "@/lib/utils/cn";

export async function BloodGroupBadge({
  group,
  size = "md",
  className,
}: {
  group: BloodGroup;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const t = await getDictionary();
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
      <span className="sr-only">{t.requests.bloodGroup} </span>
      {group}
    </span>
  );
}

const STATUS_TONE: Record<RequestStatus, BadgeTone> = {
  pending: "warning",
  published: "success",
  fulfilled: "info",
  expired: "neutral",
  rejected: "brand",
};

export async function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const t = await getDictionary();
  return <Badge tone={STATUS_TONE[status]}>{t.requests.status[status]}</Badge>;
}

export async function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const t = await getDictionary();
  return urgency === "urgent" ? (
    <Badge tone="solid">{t.requests.urgency.urgent}</Badge>
  ) : (
    <Badge tone="neutral">{t.requests.urgency.normal}</Badge>
  );
}
