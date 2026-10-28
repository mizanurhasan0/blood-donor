import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { listForModeration } from "@/features/requests/request.repository";
import { ModerationRequestCard } from "./moderation-request-card";
import type { ModerationView } from "./moderation-tabs";

const COPY: Record<ModerationView, { title: string; empty: string }> = {
  pending: {
    title: "Waiting for review",
    empty: "No requests are waiting for review. New ones appear here first.",
  },
  reported: {
    title: "Reported requests",
    empty: "No requests have open reports.",
  },
  recent: {
    title: "Latest requests",
    empty: "No requests have been posted yet.",
  },
};

export async function ModerationQueue({ view }: { view: ModerationView }) {
  const items = await listForModeration(view);
  const { title, empty } = COPY[view];
  return (
    <section aria-labelledby="queue-title" className="flex flex-col gap-4">
      <h2 id="queue-title" className="text-lg font-semibold">
        {title} <span className="font-normal text-muted">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <EmptyState title="All clear" description={empty} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <ModerationRequestCard key={item.id} request={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export function ModerationQueueSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <Skeleton className="h-6 w-48" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-64 rounded-card" />
        ))}
      </div>
    </div>
  );
}
