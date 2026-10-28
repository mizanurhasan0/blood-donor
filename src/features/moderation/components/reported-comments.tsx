import { ArrowUpRight, Flag } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { formatRelative } from "@/lib/utils/dates";
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
async function loadReportedComments(): Promise<ReportedComment[]> {
  const docs = await listReportedComments();
  const authors = await findUsersByIds([
    ...new Map(docs.map((d) => [d.authorId.toHexString(), d.authorId])).values(),
  ]);
  const names = new Map(authors.map((u) => [u._id.toHexString(), u.donorProfile?.fullName ?? u.name]));
  return docs.map((doc) => ({
    id: doc._id.toHexString(),
    requestId: doc.requestId.toHexString(),
    authorName: names.get(doc.authorId.toHexString()) ?? "Deleted user",
    content: doc.content,
    reportCount: doc.reportCount ?? 0,
    createdAt: doc.createdAt.toISOString(),
  }));
}

export async function ReportedComments() {
  const comments = await loadReportedComments();
  return (
    <section aria-labelledby="reported-comments-title" className="flex flex-col gap-4">
      <h2 id="reported-comments-title" className="text-lg font-semibold">
        Reported comments <span className="font-normal text-muted">({comments.length})</span>
      </h2>
      {comments.length === 0 ? (
        <EmptyState title="No reported comments" description="Comments people flag will appear here." />
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
                  {formatRelative(comment.createdAt)}
                </time>
                <Badge tone="warning">
                  <Flag className="size-3" aria-hidden="true" />
                  {comment.reportCount} {comment.reportCount === 1 ? "report" : "reports"}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed break-words whitespace-pre-line text-foreground/90">
                {comment.content}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline/60 pt-3">
                <Link
                  href={`/requests/${comment.requestId}`}
                  className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-info underline-offset-4 hover:underline"
                >
                  View request
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
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
