import { AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface StateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

function StateShell({ title, description, action, icon, className, role }: StateProps & { role?: string }) {
  return (
    <div
      role={role}
      className={cn(
        "flex flex-col items-center gap-3 rounded-card border border-dashed border-outline px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-full bg-elevated text-muted">{icon}</span>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function EmptyState(props: StateProps) {
  return <StateShell icon={<Inbox className="size-5" aria-hidden="true" />} {...props} />;
}

export function ErrorState(props: StateProps) {
  return (
    <StateShell
      role="alert"
      icon={<AlertTriangle className="size-5 text-brand-bright" aria-hidden="true" />}
      {...props}
    />
  );
}
