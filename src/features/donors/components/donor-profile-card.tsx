import { BellOff, BellRing, CircleCheck, CirclePause, MapPin, Send } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { Viewer } from "@/features/auth/viewer";
import { BloodGroupBadge } from "@/features/requests/components/badges";

type DonorProfile = NonNullable<Viewer["donor"]>;

function StatusRow({
  icon,
  label,
  value,
  active,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full",
          active ? "bg-success/10 text-success" : "bg-elevated text-muted",
        )}
      >
        {icon}
      </span>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={cn("ml-auto text-right text-sm font-medium", active ? "text-foreground" : "text-muted")}>
        {value}
      </dd>
    </div>
  );
}

/** Read-only donor summary. The phone number is deliberately never displayed. */
export function DonorProfileCard({ donor }: { donor: DonorProfile }) {
  const iconClass = "size-4";
  return (
    <Card className="flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <BloodGroupBadge group={donor.bloodGroup} />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-lg font-semibold">{donor.fullName}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {donor.district}, {donor.division} Division
          </p>
        </div>
      </div>
      <dl className="divide-y divide-outline/60 border-t border-outline/60">
        <StatusRow
          label="Availability"
          active={donor.available}
          value={donor.available ? "Available to donate" : "Not available right now"}
          icon={
            donor.available ? (
              <CircleCheck className={iconClass} aria-hidden="true" />
            ) : (
              <CirclePause className={iconClass} aria-hidden="true" />
            )
          }
        />
        <StatusRow
          label="Email alerts"
          active={donor.emailNotifications}
          value={donor.emailNotifications ? "On" : "Off"}
          icon={
            donor.emailNotifications ? (
              <BellRing className={iconClass} aria-hidden="true" />
            ) : (
              <BellOff className={iconClass} aria-hidden="true" />
            )
          }
        />
        <StatusRow
          label="Telegram"
          active={donor.telegramLinked}
          value={donor.telegramLinked ? "Linked" : "Not linked"}
          icon={<Send className={iconClass} aria-hidden="true" />}
        />
      </dl>
    </Card>
  );
}
