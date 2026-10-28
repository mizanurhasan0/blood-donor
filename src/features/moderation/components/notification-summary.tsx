import { Mail, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { formatNumber, formatRelative, interpolate } from "@/lib/i18n/format";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { countJobsByStatus, listFailedJobs } from "@/features/notifications/notification.repository";

export async function NotificationSummary() {
  const [t, lang, counts, failed] = await Promise.all([
    getDictionary(),
    getLocale(),
    countJobsByStatus(),
    listFailedJobs(),
  ]);
  const n = t.moderation.notifications;
  const stats = [
    {
      label: n.pending,
      value: counts.pending + counts.processing,
      tone: "text-warning",
    },
    { label: n.sent, value: counts.sent, tone: "text-success" },
    {
      label: n.failed,
      value: counts.failed,
      tone: counts.failed > 0 ? "text-brand-bright" : "text-foreground",
    },
    { label: n.cancelled, value: counts.cancelled, tone: "text-muted" },
  ];

  return (
    <section
      aria-labelledby="queue-health"
      className="rounded-card border border-outline/70 bg-surface/60 p-4"
    >
      <h2 id="queue-health" className="text-sm font-medium text-muted">
        {n.heading}
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-button bg-card px-3 py-2">
            <dt className="text-xs text-muted">{stat.label}</dt>
            <dd className={cn("text-xl font-semibold tabular-nums", stat.tone)}>
              {formatNumber(stat.value, lang)}
            </dd>
          </div>
        ))}
      </dl>
      {failed.length > 0 && (
        <details className="group mt-3">
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-brand-bright">
            {interpolate(n.failedHeading, { count: formatNumber(failed.length, lang) })}
          </summary>
          <ul className="mt-2 flex flex-col divide-y divide-outline/60 rounded-button border border-outline/60 bg-card">
            {failed.map((job) => (
              <li key={job._id.toHexString()} className="flex flex-col gap-1 px-3 py-2.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={job.channel === "email" ? "info" : "neutral"}>
                    {job.channel === "email" ? (
                      <Mail className="size-3" aria-hidden="true" />
                    ) : (
                      <Send className="size-3" aria-hidden="true" />
                    )}
                    {job.channel === "email" ? n.email : n.telegram}
                  </Badge>
                  <span className="text-muted">
                    {interpolate(job.attempts === 1 ? n.attemptOne : n.attemptOther, {
                      count: formatNumber(job.attempts, lang),
                    })}
                  </span>
                  <time dateTime={job.updatedAt.toISOString()} className="text-muted">
                    {formatRelative(job.updatedAt, lang)}
                  </time>
                  <LocalizedLink
                    href={`/requests/${job.requestId.toHexString()}`}
                    className="ml-auto text-info underline-offset-4 hover:underline"
                  >
                    {n.viewRequest}
                  </LocalizedLink>
                </div>
                <p className="font-mono text-xs break-words text-muted">{job.lastError ?? n.noError}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

export function NotificationSummarySkeleton() {
  return <Skeleton className="h-28 rounded-card" />;
}
