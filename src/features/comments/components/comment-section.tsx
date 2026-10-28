import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { getViewer } from "@/features/auth/viewer";
import { getDictionary } from "@/lib/i18n/server";
import { getCommentPage } from "../comment.service";
import type { CommentViewer } from "../types";
import { CommentList } from "./comment-list";

function SectionShell({ heading, children, busy }: { heading: string; children: ReactNode; busy?: boolean }) {
  return (
    <section
      id="comments"
      aria-labelledby="comments-heading"
      aria-busy={busy || undefined}
      className="scroll-mt-24"
    >
      <Card className="flex flex-col gap-5 p-4 sm:p-6">
        <h2 id="comments-heading" className="text-lg font-semibold sm:text-xl">
          {heading}
        </h2>
        {children}
      </Card>
    </section>
  );
}

async function loadThread(requestId: string) {
  try {
    // Request-time only: never touch the database while prerendering.
    await connection();
    const [viewer, page] = await Promise.all([getViewer(), getCommentPage(requestId)]);
    // Only what the comment UI needs — never the ObjectId or email.
    const commentViewer: CommentViewer | null = viewer
      ? { id: viewer.id, name: viewer.name, avatar: viewer.avatar ?? null, isAdmin: viewer.isAdmin }
      : null;
    return { viewer: commentViewer, page };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[comments] failed to load thread", error);
    return null;
  }
}

/** Request-time comment thread; render inside <Suspense fallback={<CommentSectionSkeleton />}>. */
export async function CommentSection({
  requestId,
  commentsOpen,
}: {
  requestId: string;
  commentsOpen: boolean;
}) {
  const t = await getDictionary();
  const thread = await loadThread(requestId);
  if (!thread) {
    return (
      <SectionShell heading={t.comments.heading}>
        <ErrorState title={t.comments.section.errorTitle} description={t.comments.section.errorBody} />
      </SectionShell>
    );
  }
  return (
    <CommentList
      requestId={requestId}
      commentsOpen={commentsOpen}
      viewer={thread.viewer}
      initialPage={thread.page}
    />
  );
}

export function CommentSectionSkeleton({ heading, label }: { heading: string; label: string }) {
  return (
    <SectionShell heading={heading} busy>
      <span className="sr-only">{label}</span>
      <Skeleton className="h-28 w-full" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <div aria-hidden="true" className="size-9 shrink-0 animate-pulse rounded-full bg-elevated/70" />
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </SectionShell>
  );
}
