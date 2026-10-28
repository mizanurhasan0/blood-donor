"use client";

import { Check, Copy, LogIn, MessageSquare, Phone, UserPlus } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { revealPhoneAction } from "../actions";

/** What the current viewer may do with the requester's number (decided on the server). */
export type ContactAccess = "allowed" | "guest" | "needs-donor" | "hidden" | "closed";

export function ContactReveal({ requestId, access }: { requestId: string; access: ContactAccess }) {
  switch (access) {
    case "allowed":
      return <RevealPhone requestId={requestId} />;
    case "guest":
      return (
        <Notice text="Sign in with a donor account to see the requester's number.">
          <ButtonLink
            href={`/login?callbackUrl=${encodeURIComponent(`/requests/${requestId}`)}`}
            className="w-full"
          >
            <LogIn className="size-4" aria-hidden="true" />
            Sign in to contact
          </ButtonLink>
        </Notice>
      );
    case "needs-donor":
      return (
        <Notice text="Register as a donor to see contact numbers. It only takes a minute.">
          <ButtonLink href="/become-donor" className="w-full">
            <UserPlus className="size-4" aria-hidden="true" />
            Become a donor
          </ButtonLink>
        </Notice>
      );
    case "hidden":
      return (
        <Notice text="The requester prefers to be contacted through comments.">
          <ButtonLink href="#request-comments" variant="secondary" className="w-full">
            <MessageSquare className="size-4" aria-hidden="true" />
            Go to comments
          </ButtonLink>
        </Notice>
      );
    case "closed":
      return <Notice text="This request is no longer active, so contact details are hidden." />;
  }
}

function Notice({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">{text}</p>
      {children}
    </div>
  );
}

function RevealPhone({ requestId }: { requestId: string }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reveal() {
    setError(null);
    startTransition(async () => {
      const result = await revealPhoneAction(requestId);
      if (result.ok) setPhone(result.data);
      else setError(result.error);
    });
  }

  if (phone) return <RevealedPhone phone={phone} />;

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={reveal} pending={isPending} className="w-full">
        {!isPending && <Phone className="size-4" aria-hidden="true" />}
        {isPending ? "Revealing…" : "Show number"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-brand-bright">
          {error}
        </p>
      )}
      <p className="text-xs text-muted">
        Numbers are shown only to registered donors, and each view is logged.
      </p>
    </div>
  );
}

function RevealedPhone({ phone }: { phone: string }) {
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(phone);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
    setTimeout(() => setCopy("idle"), 2500);
  }

  return (
    <div className="flex animate-fade-in flex-col gap-2">
      <div className="flex items-center gap-2">
        <a
          href={`tel:${phone}`}
          className="inline-flex min-h-11 flex-1 items-center gap-2 rounded-button border border-success/40 bg-success/10 px-3.5 font-semibold tracking-wide text-success transition-colors hover:bg-success/15"
        >
          <Phone className="size-4" aria-hidden="true" />
          <span className="sr-only">Call </span>
          {phone}
        </a>
        <button
          type="button"
          onClick={copyNumber}
          className="grid size-11 shrink-0 place-items-center rounded-button border border-outline text-muted transition-colors hover:border-muted hover:text-foreground"
        >
          {copy === "copied" ? (
            <Check className="size-4 text-success" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          <span className="sr-only">Copy number</span>
        </button>
      </div>
      <p role="status" className="min-h-4 text-xs text-muted">
        {copy === "copied" && "Number copied."}
        {copy === "failed" && "Couldn't copy — press and hold the number instead."}
      </p>
    </div>
  );
}
