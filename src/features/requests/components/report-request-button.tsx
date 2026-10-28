"use client";

import { Flag } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { translate } from "@/lib/i18n/format";
import { useT } from "@/lib/i18n/locale-context";
import { reportRequestAction } from "../actions";

export function ReportRequestButton({ requestId }: { requestId: string }) {
  const t = useT();
  const r = t.requests.report;
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await reportRequestAction(requestId);
      setOpen(false);
      if (result.ok) setMessage(result.message ? translate(t.feedback, result.message) : r.thanks);
      else setError(translate(t.feedback, result.error));
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
          {r.button}
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
        title={r.confirmTitle}
        description={r.confirmBody}
        confirmLabel={r.confirm}
        onConfirm={confirm}
        pending={isPending}
      />
    </div>
  );
}
