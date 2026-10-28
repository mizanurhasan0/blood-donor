"use client";

import { CircleCheck, Send } from "lucide-react";
import { useId, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { formatNumber, translate } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import { LIMITS } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";
import { useCommentForm } from "../hooks/use-comment-form";
import type { CommentView } from "../types";

interface CommentFormProps {
  requestId: string;
  parentId?: string;
  onPosted: (comment: CommentView) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  placeholder: string;
}

/** Shared by new top-level comments and replies. */
export function CommentForm({
  requestId,
  parentId,
  onPosted,
  onCancel,
  autoFocus,
  placeholder,
}: CommentFormProps) {
  const { lang, t } = useLocale();
  const c = t.comments;
  const id = useId();
  const { form, contentField, submit, pending, serverError, announcement, length } = useCommentForm({
    requestId,
    parentId,
    onPosted,
  });
  const error = form.formState.errors.content?.message;
  const isReply = Boolean(parentId);
  const over = length > LIMITS.commentMaxLength;

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (!pending) void submit();
    } else if (event.key === "Escape" && onCancel && !pending) {
      onCancel();
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-2">
      <label htmlFor={id} className="sr-only">
        {isReply ? c.form.writeReply : c.form.writeComment}
      </label>
      <Textarea
        id={id}
        {...contentField}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(error && `${id}-error`, `${id}-count`)}
        readOnly={pending}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-brand-bright">
          {translate(t.feedback, error)}
        </p>
      )}
      {serverError && (
        <p role="alert" className="text-sm text-brand-bright">
          {serverError}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-h-6 items-center gap-3 text-xs text-muted">
          <span id={`${id}-count`} className={cn("tabular-nums", over && "font-medium text-brand-bright")}>
            {formatNumber(length, lang)}/{formatNumber(LIMITS.commentMaxLength, lang)}
            <span className="sr-only"> {c.form.characters}</span>
          </span>
          <p role="status" className="flex items-center gap-1 text-success">
            {announcement && <CircleCheck className="size-3.5" aria-hidden="true" />}
            {announcement}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={pending}>
              {t.common.cancel}
            </Button>
          )}
          <Button type="submit" pending={pending} aria-keyshortcuts="Control+Enter Meta+Enter">
            {!pending && <Send className="size-4" aria-hidden="true" />}
            {isReply ? c.reply : c.form.post}
          </Button>
        </div>
      </div>
    </form>
  );
}
