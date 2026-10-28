import "server-only";
import { timingSafeEqual } from "node:crypto";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import { env } from "@/lib/env";
import { randomToken, sha256 } from "@/lib/security/crypto";
import { findDonorByTelegramId, linkTelegramAccount } from "@/features/users/user.repository";
import { ProviderError } from "./retry";
import { telegramMessage, type NotifiableRequest } from "./templates";

const LINK_TOKEN_TTL_MS = 15 * 60_000;

interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
  parameters?: { retry_after?: number };
}

async function call<T>(method: string, payload: Record<string, unknown>): Promise<T> {
  const { TELEGRAM_BOT_TOKEN } = env("telegram");
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  }).catch((error: unknown) => {
    throw new ProviderError(`Telegram unreachable: ${String(error)}`, true);
  });
  const body = (await response.json().catch(() => ({ ok: false }))) as TelegramResponse<T>;
  if (!response.ok || !body.ok) {
    const retryAfter = body.parameters?.retry_after;
    throw ProviderError.fromStatus(
      "Telegram",
      body.error_code ?? response.status,
      body.description ?? "Unknown error",
      retryAfter ? retryAfter * 1000 : undefined,
    );
  }
  return body.result as T;
}

export const TelegramService = {
  /** Posts a short request alert to the private channel. Returns the message id. */
  async postRequest(request: NotifiableRequest): Promise<number> {
    const message = await call<{ message_id: number }>("sendMessage", {
      chat_id: env("telegram").TELEGRAM_CHANNEL_ID,
      text: telegramMessage(request),
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
    return message.message_id;
  },

  async sendDirect(chatId: number, text: string): Promise<void> {
    await call("sendMessage", { chat_id: chatId, text, link_preview_options: { is_disabled: true } });
  },

  async approveJoinRequest(userId: number): Promise<void> {
    await call("approveChatJoinRequest", { chat_id: env("telegram").TELEGRAM_CHANNEL_ID, user_id: userId });
  },

  /** One-time deep-link token so a donor can prove which Telegram account is theirs. */
  async createLinkToken(userId: ObjectId): Promise<string> {
    const token = randomToken(24);
    const { telegramLinks } = await collections();
    await telegramLinks.deleteMany({ userId });
    await telegramLinks.insertOne({
      _id: new ObjectId(),
      tokenHash: sha256(token),
      userId,
      expiresAt: new Date(Date.now() + LINK_TOKEN_TTL_MS),
    });
    return token;
  },

  /** Consumes a link token (single use) and attaches the Telegram account. */
  async consumeLinkToken(token: string, telegramUserId: number): Promise<boolean> {
    const { telegramLinks } = await collections();
    const link = await telegramLinks.findOneAndDelete({
      tokenHash: sha256(token),
      expiresAt: { $gt: new Date() },
    });
    if (!link) return false;
    await linkTelegramAccount(link.userId, telegramUserId);
    return true;
  },

  /** Only donors who linked their account and are still registered are auto-approved. */
  async isEligibleMember(telegramUserId: number): Promise<boolean> {
    const donor = await findDonorByTelegramId(telegramUserId);
    return Boolean(donor?.donorProfile?.telegramLinked);
  },

  verifyWebhookSecret(header: string | null): boolean {
    if (!header) return false;
    const expected = Buffer.from(env("telegram").TELEGRAM_WEBHOOK_SECRET);
    const actual = Buffer.from(header);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  },
};
