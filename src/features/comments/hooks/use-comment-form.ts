"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition, type BaseSyntheticEvent } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import type { z } from "zod";
import { translate } from "@/lib/i18n/format";
import { useT } from "@/lib/i18n/locale-context";
import { commentSchema } from "@/lib/validators/comment";
import { addCommentAction } from "../actions";
import type { CommentView } from "../types";

type FormInput = z.input<typeof commentSchema>;
type FormOutput = z.output<typeof commentSchema>;

interface Options {
  requestId: string;
  parentId?: string;
  onPosted: (comment: CommentView) => void;
}

/** RHF + zod validation for the comment form, posting through addCommentAction in a transition. */
export function useCommentForm({ requestId, parentId, onPosted }: Options) {
  const t = useT();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  // Guards against a double click/shortcut landing before `pending` re-renders.
  const inFlight = useRef(false);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { requestId, parentId, content: "" },
    reValidateMode: "onChange",
  });
  const content = useWatch({ control: form.control, name: "content" }) ?? "";

  function onValid(values: FormOutput) {
    if (inFlight.current) return;
    inFlight.current = true;
    setServerError(null);
    setAnnouncement("");
    startTransition(async () => {
      const result = await addCommentAction(values).catch(() => null);
      inFlight.current = false;
      if (!result) {
        setServerError(t.comments.offlineCheck);
        return;
      }
      if (!result.ok) {
        // Field errors stay as keys: the form shows them translated at render time.
        const fieldError = result.fieldErrors?.content?.[0];
        if (fieldError) form.setError("content", { message: fieldError }, { shouldFocus: true });
        else setServerError(translate(t.feedback, result.error));
        return;
      }
      form.reset({ requestId, parentId, content: "" });
      setAnnouncement(parentId ? t.comments.replyPosted : t.comments.commentPosted);
      onPosted(result.data);
    });
  }

  // Only `content` is user-editable; any other failure means the page itself is stale.
  function onInvalid(errors: FieldErrors<FormInput>) {
    if (!errors.content) setServerError(t.comments.staleForm);
  }

  const submit = (event?: BaseSyntheticEvent) => form.handleSubmit(onValid, onInvalid)(event);

  const contentField = form.register("content", { onChange: () => setAnnouncement("") });

  return { form, contentField, submit, pending, serverError, announcement, length: content.length };
}
