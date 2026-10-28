"use client";

import { CircleCheck, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { ModerationText } from "@/lib/i18n/messages/moderation";

type Tone = "success" | "error";
type Notify = (tone: Tone, message: string) => void;

interface ModerationValue {
  notify: Notify;
  text: ModerationText;
}

const ModerationContext = createContext<ModerationValue | null>(null);

/**
 * Page-level toast for moderation results, so the message survives
 * the card it came from disappearing after the list refreshes.
 * The admin strings are passed in once here, so each card does not carry its own copy.
 */
export function ModerationFeedbackProvider({
  text,
  children,
}: {
  text: ModerationText;
  children: ReactNode;
}) {
  const [feedback, setFeedback] = useState<{
    id: number;
    tone: Tone;
    message: string;
  } | null>(null);
  const notify = useCallback<Notify>(
    (tone, message) => setFeedback((prev) => ({ id: (prev?.id ?? 0) + 1, tone, message })),
    [],
  );

  return (
    <ModerationContext value={{ notify, text }}>
      {children}
      <div role="status" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center">
        {feedback && (
          <p
            key={feedback.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-md animate-fade-up items-start gap-3 rounded-card border bg-elevated p-4 text-sm shadow-popover",
              feedback.tone === "error" ? "border-brand/50" : "border-success/40",
            )}
          >
            {feedback.tone === "error" ? (
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-brand-bright" aria-hidden="true" />
            ) : (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            )}
            <span className="flex-1">{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="-m-2 grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">{text.dismissMessage}</span>
            </button>
          </p>
        )}
      </div>
    </ModerationContext>
  );
}

function useModeration(): ModerationValue {
  const value = useContext(ModerationContext);
  if (!value) throw new Error("Moderation controls must be rendered inside ModerationFeedbackProvider");
  return value;
}

export function useModerationFeedback(): Notify {
  return useModeration().notify;
}

export function useModerationText(): ModerationText {
  return useModeration().text;
}
