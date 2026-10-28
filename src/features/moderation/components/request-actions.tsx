"use client";

import { Check, ExternalLink, FlagOff, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/field";
import type { RequestStatus } from "@/lib/constants/site";
import { formatNumber, interpolate, translate } from "@/lib/i18n/format";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ActionResult } from "@/lib/utils/result";
import { approveRequestAction, dismissReportsAction, rejectRequestAction } from "../actions";
import { useModerationFeedback, useModerationText } from "./moderation-feedback";

type Pending = "approve" | "reject" | "dismiss" | null;

const PUBLIC: RequestStatus[] = ["published", "fulfilled", "expired"];
const NOTE_MAX_LENGTH = 300;

export function RequestActions({
  requestId,
  status,
  reportCount,
}: {
  requestId: string;
  status: RequestStatus;
  reportCount: number;
}) {
  const router = useRouter();
  const notify = useModerationFeedback();
  const text = useModerationText().actions;
  const { lang, t } = useLocale();
  const [pending, setPending] = useState<Pending>(null);
  const [, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const noteId = useId();

  function publishedMessage({ email, telegram }: { email: number; telegram: number }) {
    const emails = interpolate(email === 1 ? text.emailOne : text.emailOther, {
      count: formatNumber(email, lang),
    });
    return interpolate(text.published, { emails, telegram: telegram > 0 ? text.publishedTelegram : "" });
  }

  function run<T>(
    kind: Exclude<Pending, null>,
    action: () => Promise<ActionResult<T>>,
    onOk: (data: T) => string,
  ) {
    setPending(kind);
    startTransition(async () => {
      const result = await action();
      setPending(null);
      if (!result.ok) {
        const message = translate(t.feedback, result.error);
        if (kind === "reject") setRejectError(message);
        else notify("error", message);
        return;
      }
      if (kind === "reject") setRejectOpen(false);
      notify("success", onOk(result.data));
      router.refresh();
    });
  }

  const busy = pending !== null;
  const canApprove = status === "pending" || status === "rejected";
  const canReject = status === "pending" || status === "published";

  return (
    <div className="flex flex-wrap gap-2">
      {canApprove && (
        <Button
          size="sm"
          pending={pending === "approve"}
          disabled={busy}
          onClick={() => run("approve", () => approveRequestAction(requestId), publishedMessage)}
        >
          {pending !== "approve" && <Check className="size-4" aria-hidden="true" />}
          {text.approve}
        </Button>
      )}
      {canReject && (
        <Button
          size="sm"
          variant="danger"
          disabled={busy}
          onClick={() => {
            setRejectError(null);
            setRejectOpen(true);
          }}
        >
          <X className="size-4" aria-hidden="true" />
          {text.reject}
        </Button>
      )}
      {reportCount > 0 && (
        <Button
          size="sm"
          variant="secondary"
          pending={pending === "dismiss"}
          disabled={busy}
          onClick={() =>
            run(
              "dismiss",
              () => dismissReportsAction("request", requestId),
              () => text.reportsDismissed,
            )
          }
        >
          {pending !== "dismiss" && <FlagOff className="size-4" aria-hidden="true" />}
          {text.dismissReports}
        </Button>
      )}
      {PUBLIC.includes(status) && (
        <LocalizedLink href={`/requests/${requestId}`} className={buttonClasses("ghost", "sm")}>
          <ExternalLink className="size-4" aria-hidden="true" />
          {text.viewPublic}
        </LocalizedLink>
      )}

      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title={text.rejectTitle}
        description={text.rejectDescription}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setRejectError(null);
            run(
              "reject",
              () => rejectRequestAction(requestId, note),
              () => text.requestRejected,
            );
          }}
        >
          <Field
            id={noteId}
            label={text.noteLabel}
            optional
            hint={interpolate(text.noteHint, { max: formatNumber(NOTE_MAX_LENGTH, lang) })}
          >
            <Textarea
              id={noteId}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={NOTE_MAX_LENGTH}
              rows={3}
              aria-describedby={`${noteId}-hint`}
              placeholder={text.notePlaceholder}
            />
          </Field>
          {rejectError && (
            <p role="alert" className="text-sm text-brand-bright">
              {rejectError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setRejectOpen(false)} disabled={pending === "reject"}>
              {text.cancel}
            </Button>
            <Button type="submit" variant="danger" pending={pending === "reject"}>
              {text.rejectSubmit}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
