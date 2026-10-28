"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, describedBy } from "@/components/ui/field";
import { translate } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import { deleteAccountAction } from "../actions";
import { Rich } from "./rich-text";

/** Typed to confirm. Kept in Latin letters in every language because it is matched literally. */
const CONFIRM_WORD = "DELETE";

export function DeleteAccountCard() {
  const { lang, t } = useLocale();
  const copy = t.donor.deleteAccount;
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const confirmed = typed.trim() === CONFIRM_WORD;
  const errorText = error ? translate(t.feedback, error) : null;

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
      const result = await deleteAccountAction(lang);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <section
      aria-labelledby="delete-account-heading"
      className="rounded-card border border-brand/30 bg-brand/5 p-5 sm:p-6"
    >
      <h2 id="delete-account-heading" className="text-lg font-semibold">
        {t.account.deleteAccount}
      </h2>
      <p className="mt-2 text-sm text-muted">{copy.removesIntro}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
        {copy.removes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm font-medium">{copy.irreversible}</p>
      {errorText && !open && (
        <p role="alert" className="mt-3 text-sm text-brand-bright">
          {errorText}
        </p>
      )}
      <Button variant="danger" className="mt-4" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" aria-hidden="true" />
        {copy.deleteButton}
      </Button>

      <Dialog open={open} onClose={close} title={copy.dialogTitle} description={copy.dialogText}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field
            id="delete-confirm"
            label={
              <Rich
                text={copy.typeToConfirm}
                values={{
                  word: <strong className="font-semibold text-brand-bright">{CONFIRM_WORD}</strong>,
                }}
              />
            }
            error={errorText ?? undefined}
          >
            <Input
              id="delete-confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={errorText ? true : undefined}
              aria-describedby={describedBy("delete-confirm", errorText ?? undefined)}
            />
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={close} disabled={isPending}>
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="danger" disabled={!confirmed} pending={isPending}>
              {copy.confirmButton}
            </Button>
          </div>
        </form>
      </Dialog>
    </section>
  );
}
