"use client";

import { RefreshCw, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createTelegramLinkAction } from "../actions";

/** Creates a one-time bot deep link that ties the viewer's Telegram account to their donor profile. */
export function TelegramLinkButton() {
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
          {url ? "Get a new link" : "Link Telegram"}
        </Button>
        {url && (
          <Button variant="ghost" onClick={() => router.refresh()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            I&apos;ve tapped Start, check again
          </Button>
        )}
      </div>
      {url && (
        <p role="status" className="text-sm text-muted">
          If Telegram didn&apos;t open,{" "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-bright underline underline-offset-4"
          >
            open your link
          </a>{" "}
          and tap <strong className="text-foreground">Start</strong>. It works once, for 15 minutes.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-brand-bright">
          {error}
        </p>
      )}
    </div>
  );
}
