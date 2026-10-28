"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition, type BaseSyntheticEvent } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import type { z } from "zod";
import type { ActionResult } from "@/lib/utils/result";
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

const OFFLINE: ActionResult<never> = {
  ok: false,
  error: "Couldn't reach the server. Check your connection and try again.",
};

/** RHF + zod validation for the comment form, posting through addCommentAction in a transition. */
export function useCommentForm({ requestId, parentId, onPosted }: Options) {
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
      const result = await addCommentAction(values).catch(() => OFFLINE);
      inFlight.current = false;
      if (!result.ok) {
        const fieldError = result.fieldErrors?.content?.[0];
        if (fieldError) form.setError("content", { message: fieldError }, { shouldFocus: true });
        else setServerError(result.error);
        return;
      }
      form.reset({ requestId, parentId, content: "" });
      setAnnouncement(parentId ? "Reply posted" : "Comment posted");
      onPosted(result.data);
    });
  }

  // Only `content` is user-editable; any other failure means the page itself is stale.
  function onInvalid(errors: FieldErrors<FormInput>) {
    if (!errors.content) setServerError("Something went wrong. Please refresh the page and try again.");
  }

  const submit = (event?: BaseSyntheticEvent) => form.handleSubmit(onValid, onInvalid)(event);

  const contentField = form.register("content", { onChange: () => setAnnouncement("") });

  return { form, contentField, submit, pending, serverError, announcement, length: content.length };
}
