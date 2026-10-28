import { ArrowUpRight, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { formatNumber, formatRelative, interpolate } from "@/lib/i18n/format";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { listReportedComments } from "@/features/comments/comment.repository";
import { findUsersByIds } from "@/features/users/user.repository";
import { CommentActions } from "./comment-actions";

interface ReportedComment {
  id: string;
  requestId: string;
  authorName: string;
  content: string;
  reportCount: number;
  createdAt: string;
}

/** Maps repository docs (ObjectIds, Dates) to plain values safe for client props. */
async function loadReportedComments(deletedUserLabel: string): Promise<ReportedComment[]> {
  const docs = await listReportedComments();
  const authors = await findUsersByIds([
    ...new Map(docs.map((d) => [d.authorId.toHexString(), d.authorId])).values(),
  ]);
  const names = new Map(authors.map((u) => [u._id.toHexString(), u.donorProfile?.fullName ?? u.name]));
  return docs.map((doc) => ({
    id: doc._id.toHexString(),
    requestId: doc.requestId.toHexString(),
    authorName: names.get(doc.authorId.toHexString()) ?? deletedUserLabel,
    content: doc.content,
    reportCount: doc.reportCount ?? 0,
    createdAt: doc.createdAt.toISOString(),
  }));
}

export async function ReportedComments() {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  const m = t.moderation.reported;
  const comments = await loadReportedComments(m.deletedUser);
  return (
    <section aria-labelledby="reported-comments-title" className="flex flex-col gap-4">
      <h2 id="reported-comments-title" className="text-lg font-semibold">
        {m.heading} <span className="font-normal text-muted">({formatNumber(comments.length, lang)})</span>
      </h2>
      {comments.length === 0 ? (
        <EmptyState title={m.empty} description={m.emptyHint} />
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="flex flex-col gap-3 rounded-card border border-outline/70 bg-card p-4"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-medium">{comment.authorName}</span>
                <time dateTime={comment.createdAt} className="text-muted">
                  {formatRelative(comment.createdAt, lang)}
                </time>
                <Badge tone="warning">
                  <Flag className="size-3" aria-hidden="true" />
                  {interpolate(
                    comment.reportCount === 1 ? t.moderation.card.reportOne : t.moderation.card.reportOther,
                    { count: formatNumber(comment.reportCount, lang) },
                  )}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed break-words whitespace-pre-line text-foreground/90">
                {comment.content}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline/60 pt-3">
                <LocalizedLink
                  href={`/requests/${comment.requestId}`}
                  className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-info underline-offset-4 hover:underline"
                >
                  {m.viewRequest}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </LocalizedLink>
                <CommentActions commentId={comment.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ReportedCommentsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-32 rounded-card" />
      <Skeleton className="h-32 rounded-card" />
    </div>
  );
}
