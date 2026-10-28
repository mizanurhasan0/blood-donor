"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, describedBy } from "@/components/ui/field";
import { deleteAccountAction } from "../actions";

const CONFIRM_WORD = "DELETE";

export function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const confirmed = typed.trim() === CONFIRM_WORD;

  function close() {
    setOpen(false);
    setTyped("");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      // Redirects away on success, so a result only comes back on failure.
      const result = await deleteAccountAction();
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <section
      aria-labelledby="delete-account-heading"
      className="rounded-card border border-brand/30 bg-brand/5 p-5 sm:p-6"
    >
      <h2 id="delete-account-heading" className="text-lg font-semibold">
        Delete account
      </h2>
      <p className="mt-2 text-sm text-muted">Deleting your account permanently removes:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
        <li>Your donor profile, alert settings and Telegram link</li>
        <li>Your blood requests and any documents you uploaded with them</li>
        <li>The text of your comments on other requests (they show as deleted)</li>
      </ul>
      <p className="mt-3 text-sm font-medium">This can&apos;t be undone.</p>
      {error && !open && (
        <p role="alert" className="mt-3 text-sm text-brand-bright">
          {error}
        </p>
      )}
      <Button variant="danger" className="mt-4" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" aria-hidden="true" />
        Delete my account
      </Button>

      <Dialog
        open={open}
        onClose={close}
        title="Delete your account?"
        description="Your profile, requests, documents and Telegram link are deleted, and your comments are blanked. This can't be undone."
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field
            id="delete-confirm"
            label={
              <>
                Type <strong className="font-semibold text-brand-bright">{CONFIRM_WORD}</strong> to confirm
              </>
            }
            error={error ?? undefined}
          >
            <Input
              id="delete-confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy("delete-confirm", error ?? undefined)}
            />
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={close} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={!confirmed} pending={isPending}>
              Delete permanently
            </Button>
          </div>
        </form>
      </Dialog>
    </section>
  );
}
