"use client";

import { RefreshCw, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { translate } from "@/lib/i18n/format";
import { useT } from "@/lib/i18n/locale-context";
import { createTelegramLinkAction } from "../actions";
import { Rich } from "./rich-text";

/** Creates a one-time bot deep link that ties the viewer's Telegram account to their donor profile. */
export function TelegramLinkButton() {
  const t = useT();
  const copy = t.donor.telegram;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function createLink() {
    setError(null);
    startTransition(async () => {
      const result = await createTelegramLinkAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setUrl(result.data.url);
      // May be blocked as a popup after the await; the link below is the fallback.
      window.open(result.data.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button variant="secondary" onClick={createLink} pending={isPending}>
          {!isPending && <Send className="size-4" aria-hidden="true" />}
          {url ? copy.newLink : copy.linkButton}
        </Button>
        {url && (
          <Button variant="ghost" onClick={() => router.refresh()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {copy.checkAgain}
          </Button>
        )}
      </div>
      {url && (
        <p role="status" className="text-sm text-muted">
          <Rich
            text={copy.linkHint}
            values={{
              openLink: (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-bright underline underline-offset-4"
                >
                  {copy.openLink}
                </a>
              ),
              start: <strong className="text-foreground">{copy.startLabel}</strong>,
            }}
          />
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-brand-bright">
          {translate(t.feedback, error)}
        </p>
      )}
    </div>
  );
}
