"use client";

import { Flag, Reply, Trash2 } from "lucide-react";
import { useState, useTransition, type ComponentProps, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { formatDate, formatRelative, interpolate, translate } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils/cn";
import { canDeleteComment } from "@/features/requests/permissions";
import { deleteCommentAction, reportCommentAction } from "../actions";
import type { CommentView, CommentViewer } from "../types";
import { CommentForm } from "./comment-form";

export interface CommentItemProps {
  comment: CommentView;
  requestId: string;
  viewer: CommentViewer | null;
  commentsOpen: boolean;
  freshIds: ReadonlySet<string>;
  onPosted: (comment: CommentView) => void;
  onDeleted: (comment: CommentView) => void;
  isReply?: boolean;
}

function ActionButton({
  pending,
  icon,
  disabled,
  children,
  className,
  ...props
}: ComponentProps<"button"> & { pending?: boolean; icon: ReactNode }) {
  return (
    <button
      type="button"
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-sm font-medium text-muted transition-colors hover:bg-elevated hover:text-foreground disabled:pointer-events-none disabled:opacity-60 sm:min-h-9",
        className,
      )}
      {...props}
    >
      {pending ? <Spinner className="size-4" /> : icon}
      {children}
    </button>
  );
}

/** One comment or reply. Replies sit one level deep, indented under their parent. */
export function CommentItem(props: CommentItemProps) {
  const { comment, requestId, viewer, commentsOpen, freshIds, onPosted, onDeleted, isReply = false } = props;
  const { lang, t } = useLocale();
  const c = t.comments;
  // Deleted accounts come back as a key (e.g. "formerMember"); show it in the current language.
  const authorName = translate(t.feedback, comment.authorName);
  const [replying, setReplying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [reported, setReported] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();
  const [reporting, startReport] = useTransition();

  const deleted = comment.content === null;
  const isAuthor = viewer?.id === comment.authorId;
  // isDonor plays no part in comment permissions.
  const actor = viewer && { id: viewer.id, isAdmin: viewer.isAdmin, isDonor: false };
  const canDelete = !deleted && canDeleteComment(actor, comment);
  const canReply = !isReply && !deleted && Boolean(viewer) && commentsOpen;
  const canReport = !deleted && Boolean(viewer) && !isAuthor;
  const showThread = !isReply && (comment.replies.length > 0 || replying);

  function remove() {
    setError(null);
    startDelete(async () => {
      const result = await deleteCommentAction(comment.id).catch(() => null);
      setConfirming(false);
      if (!result) setError(c.offline);
      else if (result.ok) onDeleted(comment);
      else setError(translate(t.feedback, result.error));
    });
  }

  function report() {
    setError(null);
    startReport(async () => {
      const result = await reportCommentAction(comment.id).catch(() => null);
      if (!result) setError(c.offline);
      else if (result.ok) {
        setReported(true);
        setNotice(result.message ? translate(t.feedback, result.message) : c.reportThanks);
      } else setError(translate(t.feedback, result.error));
    });
  }

  return (
    <li className={freshIds.has(comment.id) ? "animate-fade-in" : undefined}>
      <article className="flex gap-3">
        <Avatar
          name={deleted ? "" : authorName}
          src={deleted ? null : comment.authorAvatar}
          size={isReply ? 28 : 36}
        />
        <div className="min-w-0 flex-1">
          {deleted ? (
            <p className="pt-1.5 text-[0.95rem] text-muted italic">{c.deleted}</p>
          ) : (
            <>
              <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-medium break-words text-foreground">{authorName}</span>
                {isAuthor && <span className="text-xs text-muted">{c.you}</span>}
                <time
                  dateTime={comment.createdAt}
                  title={formatDate(comment.createdAt, lang)}
                  className="text-xs text-muted"
                  suppressHydrationWarning
                >
                  {formatRelative(comment.createdAt, lang)}
                </time>
              </header>
              <p className="mt-1 text-[0.95rem] leading-relaxed break-words whitespace-pre-line text-foreground/90 sm:text-base">
                {comment.content}
              </p>
            </>
          )}

          {(canReply || canDelete || canReport) && (
            <div className="mt-1 -ml-3 flex flex-wrap items-center">
              {canReply && (
                <ActionButton
                  icon={<Reply className="size-4" aria-hidden="true" />}
                  aria-expanded={replying}
                  onClick={() => setReplying((open) => !open)}
                >
                  {c.reply}
                </ActionButton>
              )}
              {canDelete && (
                <ActionButton
                  icon={<Trash2 className="size-4" aria-hidden="true" />}
                  pending={deleting}
                  onClick={() => setConfirming(true)}
                >
                  {c.delete}
                </ActionButton>
              )}
              {canReport && (
                <ActionButton
                  icon={<Flag className="size-4" aria-hidden="true" />}
                  pending={reporting}
                  disabled={reported}
                  onClick={report}
                >
                  {reported ? c.reported : c.report}
                </ActionButton>
              )}
            </div>
          )}
          <p role="status" className="text-xs text-success">
            {notice}
          </p>
          {error && (
            <p role="alert" className="mt-1 text-sm text-brand-bright">
              {error}
            </p>
          )}
        </div>
      </article>

      {showThread && (
        <div className="mt-3 ml-4 flex flex-col gap-4 border-l border-outline pl-3 sm:ml-12 sm:pl-4">
          {comment.replies.length > 0 && (
            <ul className="flex flex-col gap-4" aria-label={c.repliesLabel}>
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} {...props} comment={reply} isReply />
              ))}
            </ul>
          )}
          {replying && (
            <CommentForm
              requestId={requestId}
              parentId={comment.id}
              autoFocus
              placeholder={interpolate(c.placeholderReply, { name: authorName })}
              onCancel={() => setReplying(false)}
              onPosted={(reply) => {
                setReplying(false);
                onPosted(reply);
              }}
            />
          )}
        </div>
      )}

      {canDelete && (
        <ConfirmDialog
          open={confirming}
          onClose={() => !deleting && setConfirming(false)}
          title={isReply ? c.deleteReplyTitle : c.deleteTitle}
          description={comment.replies.length > 0 ? c.deleteWithReplies : c.deleteBody}
          confirmLabel={c.delete}
          pending={deleting}
          onConfirm={remove}
        />
      )}
    </li>
  );
}
