"use client";

import { CircleCheck, HeartHandshake } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { translate } from "@/lib/i18n/format";
import { useT } from "@/lib/i18n/locale-context";
import { markFulfilledAction } from "../actions";

/**
 * Owner/admin controls. Rendered for every manager so the success message
 * survives the server re-render that removes the button afterwards.
 */
export function RequestOwnerActions({
  requestId,
  canMarkFulfilled,
}: {
  requestId: string;
  canMarkFulfilled: boolean;
}) {
  const t = useT();
  const o = t.requests.owner;
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!canMarkFulfilled && !message) return null;

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await markFulfilledAction(requestId);
      setOpen(false);
      if (result.ok) setMessage(result.message ? translate(t.feedback, result.message) : o.done);
      else setError(translate(t.feedback, result.error));
    });
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <h2 className="text-base font-semibold">{o.title}</h2>
      <p role="status" className={message ? "flex gap-2 text-sm text-success" : "sr-only"}>
        {message && <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
        {message}
      </p>
      {!message && (
        <>
          <p className="text-sm text-muted">{o.body}</p>
          <Button variant="secondary" onClick={() => setOpen(true)} className="w-full">
            <HeartHandshake className="size-4" aria-hidden="true" />
            {o.markFulfilled}
          </Button>
        </>
      )}
      {error && (
        <p role="alert" className="text-sm text-brand-bright">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={open}
        onClose={() => !isPending && setOpen(false)}
        title={o.confirmTitle}
        description={o.confirmBody}
        confirmLabel={o.markFulfilled}
        onConfirm={confirm}
        pending={isPending}
        destructive={false}
      />
    </Card>
  );
}
