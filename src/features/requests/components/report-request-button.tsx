"use client";

import { Flag } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { reportRequestAction } from "../actions";

export function ReportRequestButton({ requestId }: { requestId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await reportRequestAction(requestId);
      setOpen(false);
      if (result.ok) setMessage(result.message ?? "Thanks — a moderator will take a look.");
      else setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p role="status" className={message ? "py-2 text-sm text-muted" : "sr-only"}>
        {message}
      </p>
      {!message && (
        <Button variant="ghost" onClick={() => setOpen(true)} className="w-full">
          <Flag className="size-4" aria-hidden="true" />
          Report this request
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-brand-bright">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={open}
        onClose={() => !isPending && setOpen(false)}
        title="Report this request?"
        description="Report it if it looks fake, asks for money, or shares private details. A moderator will review it."
        confirmLabel="Report"
        onConfirm={confirm}
        pending={isPending}
      />
    </div>
  );
}
