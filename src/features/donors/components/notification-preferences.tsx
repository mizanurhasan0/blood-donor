"use client";

import { BellOff, CircleCheck } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { translate } from "@/lib/i18n/format";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { useT } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils/cn";
import { unsubscribeAction, updatePreferencesAction } from "../actions";
import { Rich } from "./rich-text";

interface Preferences {
  available: boolean;
  emailNotifications: boolean;
}

type Feedback = { ok: boolean; text: string } | null;

function Toggle({
  id,
  label,
  description,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span id={`${id}-label`} className="font-medium">
          {label}
        </span>
        <span id={`${id}-description`} className="text-sm text-muted">
          {description}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-description`}
        onClick={onToggle}
        className="grid min-h-11 min-w-14 shrink-0 place-items-center rounded-pill"
      >
        <span
          aria-hidden="true"
          className={cn(
            "relative h-7 w-12 rounded-pill ring-1 transition-colors ring-inset",
            checked ? "bg-brand ring-brand" : "bg-elevated ring-outline",
          )}
        >
          <span
            className={cn(
              "absolute top-1 left-1 size-5 rounded-full bg-foreground shadow-card transition-transform",
              checked && "translate-x-5",
            )}
          />
        </span>
      </button>
    </div>
  );
}

/** Availability and email-alert switches, saved optimistically and reverted if the save fails. */
export function NotificationPreferences({ available, emailNotifications }: Preferences) {
  const t = useT();
  const copy = t.donor.preferences;
  const [prefs, applyOptimistic] = useOptimistic<Preferences, Partial<Preferences>>(
    { available, emailNotifications },
    (state, patch) => ({ ...state, ...patch }),
  );
  const [, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);

  function save(patch: Partial<Preferences>) {
    setFeedback(null);
    startTransition(async () => {
      applyOptimistic(patch);
      const result = await updatePreferencesAction(patch);
      setFeedback(
        result.ok ? { ok: true, text: copy.saved } : { ok: false, text: translate(t.feedback, result.error) },
      );
    });
  }

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div className="divide-y divide-outline/60">
        <Toggle
          id="pref-available"
          label={copy.availableLabel}
          description={copy.availableHint}
          checked={prefs.available}
          onToggle={() => save({ available: !prefs.available })}
        />
        <Toggle
          id="pref-email"
          label={copy.emailLabel}
          description={copy.emailHint}
          checked={prefs.emailNotifications}
          onToggle={() => save({ emailNotifications: !prefs.emailNotifications })}
        />
      </div>
      <div className="flex flex-col gap-3 border-t border-outline/60 pt-4 sm:flex-row sm:items-center">
        <div className="flex-1 text-sm">
          <p role="status" className={cn("text-success", !feedback?.ok && "sr-only")}>
            {feedback?.ok ? feedback.text : ""}
          </p>
          {feedback && !feedback.ok && (
            <p role="alert" className="text-brand-bright">
              {feedback.text}
            </p>
          )}
        </div>
        {prefs.emailNotifications ? (
          <Button variant="ghost" onClick={() => save({ emailNotifications: false })}>
            <BellOff className="size-4" aria-hidden="true" />
            {copy.stopAll}
          </Button>
        ) : (
          <p className="text-sm text-muted">{copy.noEmails}</p>
        )}
      </div>
    </Card>
  );
}

/** One-click unsubscribe from an email link; no sign-in needed (the signed token authorises it). */
export function UnsubscribeConfirm({ userId, token }: { userId: string; token: string }) {
  const t = useT();
  const copy = t.donor.unsubscribe;
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);

  function confirm() {
    setFeedback(null);
    startTransition(async () => {
      const result = await unsubscribeAction(userId, token);
      setFeedback(
        result.ok
          ? { ok: true, text: result.message ? translate(t.feedback, result.message) : copy.done }
          : { ok: false, text: translate(t.feedback, result.error) },
      );
    });
  }

  if (feedback?.ok) {
    return (
      <div role="status" className="flex flex-col items-center gap-3">
        <CircleCheck className="size-8 text-success" aria-hidden="true" />
        <p className="font-medium">{feedback.text}</p>
        <p className="text-sm text-muted">
          <Rich
            text={copy.changedMind}
            values={{
              link: (
                <LocalizedLink
                  href="/account#notifications"
                  className="text-brand-bright underline-offset-4 hover:underline"
                >
                  {copy.turnBackOn}
                </LocalizedLink>
              ),
            }}
          />
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {feedback && (
        <p role="alert" className="rounded-button border border-brand/40 bg-brand/10 px-4 py-3 text-sm">
          {feedback.text}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={confirm} pending={isPending}>
          {copy.confirmStop}
        </Button>
        <ButtonLink href="/" variant="ghost">
          {copy.keepReceiving}
        </ButtonLink>
      </div>
    </div>
  );
}
