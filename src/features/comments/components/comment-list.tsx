"use client";

import { Lock, LogIn, MessageCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ActionResult } from "@/lib/utils/result";
import { loadMoreCommentsAction } from "../actions";
import type { CommentPage, CommentView, CommentViewer } from "../types";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";

interface CommentListProps {
  requestId: string;
  commentsOpen: boolean;
  viewer: CommentViewer | null;
  initialPage: CommentPage;
}

const OFFLINE: ActionResult<never> = { ok: false, error: "Couldn't reach the server. Please try again." };

function countLive(comments: CommentView[]) {
  return comments.reduce((n, c) => n + (c.content === null ? 0 : 1) + c.replies.length, 0);
}

function withoutComment(comments: CommentView[], target: CommentView): CommentView[] {
  return comments.flatMap((c) => {
    if (target.parentId === null) {
      if (c.id !== target.id) return [c];
      // A top-level comment with replies stays behind as a placeholder.
      return c.replies.length > 0 ? [{ ...c, content: null }] : [];
    }
    if (c.id !== target.parentId) return [c];
    const replies = c.replies.filter((r) => r.id !== target.id);
    return c.content === null && replies.length === 0 ? [] : [{ ...c, replies }];
  });
}

/** Client-side thread state: posts, replies, deletes and pagination without a page refresh. */
export function CommentList({ requestId, commentsOpen, viewer, initialPage }: CommentListProps) {
  const [comments, setComments] = useState(initialPage.comments);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
  const [freshIds, setFreshIds] = useState<ReadonlySet<string>>(() => new Set());
  const [announcement, setAnnouncement] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();

  // Repeating the same text wouldn't be re-announced, so nudge it with a trailing space.
  const announce = (message: string) =>
    setAnnouncement((prev) => (prev === message ? `${message} ` : message));
  const markFresh = (ids: string[]) => setFreshIds((prev) => new Set([...prev, ...ids]));

  function handlePosted(comment: CommentView) {
    setComments((prev) =>
      comment.parentId
        ? prev.map((c) => (c.id === comment.parentId ? { ...c, replies: [...c.replies, comment] } : c))
        : [comment, ...prev],
    );
    markFresh([comment.id]);
    // The top-level form announces its own success; reply forms close on success.
    if (comment.parentId) announce("Reply posted");
  }

  function handleDeleted(comment: CommentView) {
    setComments((prev) => withoutComment(prev, comment));
    announce(comment.parentId ? "Reply deleted" : "Comment deleted");
  }

  function loadMore() {
    if (!nextCursor || loading) return;
    setLoadError(null);
    startLoading(async () => {
      const result = await loadMoreCommentsAction(requestId, nextCursor).catch(() => OFFLINE);
      if (!result.ok) {
        setLoadError(result.error);
        return;
      }
      const page = result.data.comments;
      setComments((prev) => {
        const seen = new Set(prev.map((c) => c.id));
        return [...prev, ...page.filter((c) => !seen.has(c.id))];
      });
      setNextCursor(result.data.nextCursor);
      markFresh(page.map((c) => c.id));
      announce(`Loaded ${page.length} more ${page.length === 1 ? "comment" : "comments"}`);
    });
  }

  const count = countLive(comments);
  const loginHref = `/login?callbackUrl=${encodeURIComponent(`/requests/${requestId}`)}`;

  return (
    <section id="comments" aria-labelledby="comments-heading" className="scroll-mt-24">
      <Card className="flex flex-col gap-5 p-4 sm:p-6">
        <h2 id="comments-heading" className="text-lg font-semibold sm:text-xl">
          Comments{" "}
          <span className="font-normal text-muted tabular-nums">
            ({count}
            {nextCursor ? "+" : ""})
          </span>
        </h2>

        {!commentsOpen ? (
          <p className="flex items-center gap-2.5 rounded-button border border-outline bg-surface px-4 py-3 text-sm text-muted">
            <Lock className="size-4 shrink-0" aria-hidden="true" />
            Comments are closed for this request.
          </p>
        ) : !viewer ? (
          <div className="flex flex-col gap-3 rounded-button border border-dashed border-outline bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.95rem] text-muted">Sign in to join the conversation.</p>
            <ButtonLink href={loginHref} variant="secondary">
              <LogIn className="size-4" aria-hidden="true" />
              Sign in
            </ButtonLink>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="hidden pt-1 sm:block">
              <Avatar name={viewer.name} src={viewer.avatar} />
            </div>
            <div className="min-w-0 flex-1">
              <CommentForm
                requestId={requestId}
                onPosted={handlePosted}
                placeholder="Offer help, share a lead or ask a question…"
              />
            </div>
          </div>
        )}

        {comments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-button border border-dashed border-outline px-4 py-8 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-elevated text-muted">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <p className="font-medium">No comments yet.</p>
            {commentsOpen && <p className="text-sm text-muted">Offer help or ask a question.</p>}
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-outline/60 *:py-4 *:first:pt-0 *:last:pb-0">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                requestId={requestId}
                viewer={viewer}
                commentsOpen={commentsOpen}
                freshIds={freshIds}
                onPosted={handlePosted}
                onDeleted={handleDeleted}
              />
            ))}
          </ul>
        )}

        {nextCursor && (
          <div className="flex flex-col items-center gap-2">
            <Button variant="secondary" pending={loading} onClick={loadMore}>
              Load more comments
            </Button>
            {loadError && (
              <p role="alert" className="text-sm text-brand-bright">
                {loadError}
              </p>
            )}
          </div>
        )}
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </Card>
    </section>
  );
}
