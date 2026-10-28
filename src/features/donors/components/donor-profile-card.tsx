import { BellOff, BellRing, CircleCheck, CirclePause, MapPin, Send } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { interpolate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/server";
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
export async function DonorProfileCard({ donor }: { donor: DonorProfile }) {
  const t = await getDictionary();
  const copy = t.donor.profile;
  const iconClass = "size-4";
  return (
    <Card className="flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <BloodGroupBadge group={donor.bloodGroup} />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-lg font-semibold">{donor.fullName}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {interpolate(copy.region, {
              district: t.geo.districts[donor.district],
              division: t.geo.divisions[donor.division],
            })}
          </p>
        </div>
      </div>
      <dl className="divide-y divide-outline/60 border-t border-outline/60">
        <StatusRow
          label={copy.availability}
          active={donor.available}
          value={donor.available ? copy.availableNow : copy.notAvailable}
          icon={
            donor.available ? (
              <CircleCheck className={iconClass} aria-hidden="true" />
            ) : (
              <CirclePause className={iconClass} aria-hidden="true" />
            )
          }
        />
        <StatusRow
          label={copy.emailAlerts}
          active={donor.emailNotifications}
          value={donor.emailNotifications ? copy.on : copy.off}
          icon={
            donor.emailNotifications ? (
              <BellRing className={iconClass} aria-hidden="true" />
            ) : (
              <BellOff className={iconClass} aria-hidden="true" />
            )
          }
        />
        <StatusRow
          label={copy.telegram}
          active={donor.telegramLinked}
          value={donor.telegramLinked ? copy.linked : copy.notLinked}
          icon={<Send className={iconClass} aria-hidden="true" />}
        />
      </dl>
    </Card>
  );
}
