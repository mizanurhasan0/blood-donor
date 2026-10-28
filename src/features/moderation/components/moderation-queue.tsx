import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { formatNumber } from "@/lib/i18n/format";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { listForModeration } from "@/features/requests/request.repository";
import { ModerationRequestCard } from "./moderation-request-card";
import type { ModerationView } from "./moderation-tabs";

export async function ModerationQueue({ view }: { view: ModerationView }) {
  const [t, lang, items] = await Promise.all([getDictionary(), getLocale(), listForModeration(view)]);
  const { title, empty } = t.moderation.queue[view];
  return (
    <section aria-labelledby="queue-title" className="flex flex-col gap-4">
      <h2 id="queue-title" className="text-lg font-semibold">
        {title} <span className="font-normal text-muted">({formatNumber(items.length, lang)})</span>
      </h2>
      {items.length === 0 ? (
        <EmptyState title={t.moderation.queue.allClear} description={empty} />
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
