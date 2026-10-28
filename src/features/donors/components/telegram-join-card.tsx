import { CircleCheck, ExternalLink, Send } from "lucide-react";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/server";
import { TelegramLinkButton } from "./telegram-link-button";

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-elevated text-sm font-semibold text-muted">
        {number}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="font-medium">{title}</p>
        {children}
      </div>
    </li>
  );
}

/**
 * Private Telegram donor channel. Reads public Telegram settings at request
 * time, so render it inside a Suspense boundary.
 */
export async function TelegramJoinCard({ linked, isDonor }: { linked: boolean; isDonor: boolean }) {
  await connection();
  const t = await getDictionary();
  const copy = t.donor.telegram;
  const { TELEGRAM_BOT_USERNAME: bot, TELEGRAM_CHANNEL_INVITE_LINK: invite } = env("telegramPublic");
  const inviteUrl = invite?.startsWith("https://") ? invite : undefined;

  return (
    <Card className="flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-info/10 text-info">
          <Send className="size-5" aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{copy.title}</h2>
            {linked && <Badge tone="success">{copy.linkedBadge}</Badge>}
          </div>
          <p className="text-sm text-muted">{copy.intro}</p>
        </div>
      </div>

      {!inviteUrl ? (
        <p className="rounded-button bg-elevated/60 px-4 py-3 text-sm text-muted">{copy.comingSoon}</p>
      ) : (
        <ol className="flex flex-col gap-5">
          {bot && (
            <Step number={1} title={copy.linkStepTitle}>
              {linked ? (
                <p className="flex items-center gap-1.5 text-sm text-success">
                  <CircleCheck className="size-4" aria-hidden="true" />
                  {copy.linkedText}
                </p>
              ) : isDonor ? (
                <TelegramLinkButton />
              ) : (
                <p className="text-sm text-muted">{copy.registerFirst}</p>
              )}
            </Step>
          )}
          <Step number={bot ? 2 : 1} title={copy.joinStepTitle}>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses(linked ? "primary" : "secondary", "md", "self-start")}
            >
              {copy.requestToJoin}
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className="sr-only">{copy.opensTelegram}</span>
            </a>
            <p className="text-xs text-muted">{bot ? copy.joinNoteAutoApproved : copy.joinNoteAdminReview}</p>
          </Step>
        </ol>
      )}
    </Card>
  );
}

export function TelegramJoinCardSkeleton() {
  return (
    <div aria-hidden="true" className="h-56 animate-pulse rounded-card border border-outline/70 bg-card" />
  );
}
