"use client";

import { BellOff, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { unsubscribeAction, updatePreferencesAction } from "../actions";

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
      setFeedback(result.ok ? { ok: true, text: "Preferences saved" } : { ok: false, text: result.error });
    });
  }

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div className="divide-y divide-outline/60">
        <Toggle
          id="pref-available"
          label="Available to donate"
          description="Turn off after donating or while you can't donate. Alerts pause while you're unavailable."
          checked={prefs.available}
          onToggle={() => save({ available: !prefs.available })}
        />
        <Toggle
          id="pref-email"
          label="Email alerts"
          description="Emails about approved requests for your blood group in your district or division."
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
            Stop all notifications
          </Button>
        ) : (
          <p className="text-sm text-muted">You won&apos;t get any alert emails.</p>
        )}
      </div>
    </Card>
  );
}

/** One-click unsubscribe from an email link; no sign-in needed (the signed token authorises it). */
export function UnsubscribeConfirm({ userId, token }: { userId: string; token: string }) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);

  function confirm() {
    setFeedback(null);
    startTransition(async () => {
      const result = await unsubscribeAction(userId, token);
      setFeedback(
        result.ok
          ? { ok: true, text: result.message ?? "You're unsubscribed." }
          : { ok: false, text: result.error },
      );
    });
  }

  if (feedback?.ok) {
    return (
      <div role="status" className="flex flex-col items-center gap-3">
        <CircleCheck className="size-8 text-success" aria-hidden="true" />
        <p className="font-medium">{feedback.text}</p>
        <p className="text-sm text-muted">
          Changed your mind?{" "}
          <Link
            href="/account#notifications"
            className="text-brand-bright underline-offset-4 hover:underline"
          >
            Turn alerts back on
          </Link>{" "}
          from your account.
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
          Yes, stop emails
        </Button>
        <ButtonLink href="/" variant="ghost">
          Keep receiving them
        </ButtonLink>
      </div>
    </div>
  );
}
