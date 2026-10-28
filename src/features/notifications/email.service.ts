import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE } from "@/lib/constants/site";
import { env } from "@/lib/env";
import { bumpDailyCounter, readDailyCounter } from "@/lib/security/rate-limit";
import { ProviderError } from "./retry";
import { emailBody, emailSubject, type NotifiableRequest } from "./templates";

export interface EmailMessage {
  to: { email: string; name: string };
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

/** Provider seam: swap Brevo for another service by implementing this. */
export interface EmailProvider {
  send(message: EmailMessage): Promise<{ messageId: string }>;
}

export const brevoProvider: EmailProvider = {
  async send(message) {
    const config = env("email");
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": config.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: config.BREVO_SENDER_EMAIL, name: config.BREVO_SENDER_NAME },
        to: [message.to],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
        headers: message.headers,
        tags: ["blood-request"],
      }),
      signal: AbortSignal.timeout(15_000),
    }).catch((error: unknown) => {
      throw new ProviderError(`Brevo unreachable: ${String(error)}`, true);
    });
    if (!response.ok) {
      const retryAfter = Number(response.headers.get("retry-after"));
      throw ProviderError.fromStatus(
        "Brevo",
        response.status,
        await response.text().catch(() => ""),
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : undefined,
      );
    }
    const body = (await response.json().catch(() => ({}))) as { messageId?: string };
    return { messageId: body.messageId ?? "" };
  },
};

const QUOTA_COUNTER = "quota:email";

/**
 * EmailNotificationService: builds per-recipient blood-request emails,
 * respects the provider's daily quota, and exposes signed unsubscribe links.
 * Each donor gets an individual message — recipient lists are never shared.
 */
export const EmailNotificationService = {
  async remainingQuota(now = new Date()): Promise<number> {
    const used = await readDailyCounter(QUOTA_COUNTER, now);
    return Math.max(0, env("email").EMAIL_DAILY_LIMIT - used);
  },

  maxRecipientsPerRequest(): number {
    return env("email").EMAIL_MAX_RECIPIENTS_PER_REQUEST;
  },

  build(request: NotifiableRequest, recipient: { id: string; email: string; name: string }): EmailMessage {
    const unsubscribeUrl = unsubscribeLink(recipient.id);
    const { html, text } = emailBody(request, recipient.name, unsubscribeUrl);
    return {
      to: { email: recipient.email, name: recipient.name },
      subject: emailSubject(request),
      html,
      text,
      // RFC 8058: mail clients POST to this endpoint for one-click unsubscribe.
      headers: {
        "List-Unsubscribe": `<${unsubscribeApiLink(recipient.id)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
  },

  async send(message: EmailMessage, provider: EmailProvider = brevoProvider) {
    const result = await provider.send(message);
    await bumpDailyCounter(QUOTA_COUNTER);
    return result;
  },
};

function unsubscribeSignature(userId: string): string {
  return createHmac("sha256", env("auth").AUTH_SECRET).update(`unsubscribe:${userId}`).digest("base64url");
}

/** The page a recipient opens from the email footer (Bangla by default). */
export function unsubscribeLink(userId: string): string {
  return `${SITE.url}/bn/unsubscribe?u=${userId}&t=${unsubscribeSignature(userId)}`;
}

/** The one-click endpoint mail clients call (RFC 8058). Stays unprefixed. */
export function unsubscribeApiLink(userId: string): string {
  return `${SITE.url}/api/unsubscribe?u=${userId}&t=${unsubscribeSignature(userId)}`;
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeSignature(userId));
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
