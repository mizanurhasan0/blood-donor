"use client";

import { Check, ExternalLink, FlagOff, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/field";
import type { RequestStatus } from "@/lib/constants/site";
import type { ActionResult } from "@/lib/utils/result";
import { approveRequestAction, dismissReportsAction, rejectRequestAction } from "../actions";
import { useModerationFeedback } from "./moderation-feedback";

type Pending = "approve" | "reject" | "dismiss" | null;

const PUBLIC: RequestStatus[] = ["published", "fulfilled", "expired"];

function publishedMessage({ email, telegram }: { email: number; telegram: number }) {
  const emails = `${email} ${email === 1 ? "email" : "emails"}`;
  return `Published — ${emails}${telegram > 0 ? " + Telegram" : ""} queued.`;
}

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
  const [pending, setPending] = useState<Pending>(null);
  const [, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const noteId = useId();

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
        if (kind === "reject") setRejectError(result.error);
        else notify("error", result.error);
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
          Approve
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
          Reject
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
              () => "Reports dismissed.",
            )
          }
        >
          {pending !== "dismiss" && <FlagOff className="size-4" aria-hidden="true" />}
          Dismiss reports
        </Button>
      )}
      {PUBLIC.includes(status) && (
        <Link href={`/requests/${requestId}`} className={buttonClasses("ghost", "sm")}>
          <ExternalLink className="size-4" aria-hidden="true" />
          View public page
        </Link>
      )}

      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject this request?"
        description="It will be hidden from the public and any queued notifications are cancelled."
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setRejectError(null);
            run(
              "reject",
              () => rejectRequestAction(requestId, note),
              () => "Request rejected.",
            );
          }}
        >
          <Field id={noteId} label="Note" optional hint="Up to 300 characters, saved with the request.">
            <Textarea
              id={noteId}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={300}
              rows={3}
              aria-describedby={`${noteId}-hint`}
              placeholder="e.g. Hospital details could not be verified"
            />
          </Field>
          {rejectError && (
            <p role="alert" className="text-sm text-brand-bright">
              {rejectError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setRejectOpen(false)} disabled={pending === "reject"}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" pending={pending === "reject"}>
              Reject request
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
