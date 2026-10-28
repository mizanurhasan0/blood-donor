import { bn as notifyBn } from "@/lib/i18n/messages/notify";
import { env, isConfigured } from "@/lib/env";
import { TelegramService } from "@/features/notifications/telegram.service";

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name?: string;
}

interface TelegramUpdate {
  message?: { chat: { id: number; type: string }; from?: TelegramUser; text?: string };
  chat_join_request?: { chat: { id: number }; from: TelegramUser; user_chat_id: number };
}

const START_COMMAND = /^\/start(?:@\w+)?\s+([A-Za-z0-9_-]{16,64})$/;

async function handleMessage(message: NonNullable<TelegramUpdate["message"]>) {
  if (message.chat.type !== "private" || !message.from || message.from.is_bot) return;
  const match = START_COMMAND.exec(message.text?.trim() ?? "");
  if (!match) {
    await TelegramService.sendDirect(message.chat.id, notifyBn.botHelp);
    return;
  }
  const linked = await TelegramService.consumeLinkToken(match[1], message.from.id);
  const invite = env("telegramPublic").TELEGRAM_CHANNEL_INVITE_LINK;
  await TelegramService.sendDirect(
    message.chat.id,
    linked
      ? `${notifyBn.botLinked}${invite ? `\n\n${notifyBn.botInviteIntro}\n${invite}` : ""}`
      : notifyBn.botLinkExpired,
  );
}

async function handleJoinRequest(join: NonNullable<TelegramUpdate["chat_join_request"]>) {
  if (String(join.chat.id) !== env("telegram").TELEGRAM_CHANNEL_ID) return;
  if (await TelegramService.isEligibleMember(join.from.id)) {
    await TelegramService.approveJoinRequest(join.from.id);
    return;
  }
  // Unlinked accounts stay pending for manual admin review.
  await TelegramService.sendDirect(join.user_chat_id, notifyBn.botJoinPending).catch(() => undefined);
}

/**
 * Telegram bot webhook. Authenticated with the secret token Telegram sends
 * in `X-Telegram-Bot-Api-Secret-Token` (configured via setWebhook).
 * Always answers 200 for authentic updates so Telegram doesn't retry forever.
 */
export async function POST(request: Request) {
  if (!isConfigured("telegram")) return new Response("Not configured", { status: 503 });
  if (!TelegramService.verifyWebhookSecret(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  try {
    if (update?.message) await handleMessage(update.message);
    if (update?.chat_join_request) await handleJoinRequest(update.chat_join_request);
  } catch (error) {
    console.error("[telegram] webhook handling failed", error);
  }
  return new Response("ok");
}
