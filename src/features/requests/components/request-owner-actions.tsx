"use client";

import { CircleCheck, HeartHandshake } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
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
      if (result.ok) setMessage(result.message ?? "Marked as fulfilled.");
      else setError(result.error);
    });
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <h2 className="text-base font-semibold">Manage request</h2>
      <p role="status" className={message ? "flex gap-2 text-sm text-success" : "sr-only"}>
        {message && <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
        {message}
      </p>
      {!message && (
        <>
          <p className="text-sm text-muted">
            Got the blood you needed? Mark it fulfilled so donors can help someone else.
          </p>
          <Button variant="secondary" onClick={() => setOpen(true)} className="w-full">
            <HeartHandshake className="size-4" aria-hidden="true" />
            Mark as fulfilled
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
        title="Mark this request as fulfilled?"
        description="It will be shown as fulfilled and donors will stop receiving alerts for it. This can't be undone."
        confirmLabel="Mark as fulfilled"
        onConfirm={confirm}
        pending={isPending}
        destructive={false}
      />
    </Card>
  );
}
