import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { collections } from "@/lib/db/collections";
import {
  enqueueRequestNotifications,
  processNotificationJobs,
} from "@/features/notifications/notification.service";
import type { EmailProvider } from "@/features/notifications/email.service";
import { TelegramService } from "@/features/notifications/telegram.service";
import { POST as webhook } from "@/app/api/telegram/webhook/route";
import { createDonor, createUser, findRequest, insertRequest, jobsFor, PHONE } from "./support/fixtures";

/*
 * Telegram is configured in this file only. fetch is the stub from setup.ts,
 * given a fake Bot API implementation here, so api.telegram.org is never reached.
 */
const CHANNEL_ID = "-1001234567890";
const SECRET = "test_webhook_secret_0123456789";

interface BotCall {
  method: string;
  body: Record<string, unknown>;
}

let calls: BotCall[];
let reply: (call: BotCall) => Response;

const ok = (result: unknown) => Response.json({ ok: true, result });
const noEmail: EmailProvider = { send: vi.fn() };

beforeEach(() => {
  vi.stubEnv("TELEGRAM_BOT_TOKEN", "123456:test-token");
  vi.stubEnv("TELEGRAM_CHANNEL_ID", CHANNEL_ID);
  vi.stubEnv("TELEGRAM_WEBHOOK_SECRET", SECRET);
  vi.stubEnv("TELEGRAM_CHANNEL_INVITE_LINK", "https://t.me/+testInvite");
  calls = [];
  reply = (call) => ok(call.method === "sendMessage" ? { message_id: 42 } : true);
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const url = new URL(String(input));
    expect(url.origin).toBe("https://api.telegram.org");
    const call = { method: url.pathname.split("/").pop()!, body: JSON.parse(String(init?.body)) };
    calls.push(call);
    return reply(call);
  });
});

afterEach(() => {
  // Back to the throwing safety-net implementation from setup.ts.
  vi.mocked(fetch).mockReset();
  vi.restoreAllMocks();
});

describe("Telegram channel delivery", () => {
  async function queuedRequest(overrides: Parameters<typeof insertRequest>[1] = {}) {
    const request = await insertRequest(await createUser(), {
      hospitalName: "Square Hospital",
      description: `Call ${PHONE}`,
      ...overrides,
    });
    await enqueueRequestNotifications(request, 10);
    return request;
  }

  it("posts the request once and remembers the message id", async () => {
    const request = await queuedRequest();

    const summary = await processNotificationJobs({ emailProvider: noEmail });

    expect(summary).toMatchObject({ sent: 1, skippedChannels: [] });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      method: "sendMessage",
      body: { chat_id: CHANNEL_ID, parse_mode: "HTML" },
    });
    expect(calls[0].body.text).toContain("Square Hospital");
    expect(calls[0].body.text).not.toContain(PHONE);
    expect((await findRequest(request._id))!.telegramMessageId).toBe(42);
    expect(await jobsFor(request._id)).toMatchObject([
      { status: "sent", providerMessageId: "42", attempts: 1 },
    ]);
  });

  it("never posts twice when a crashed run already posted the message", async () => {
    const request = await queuedRequest({ telegramMessageId: 7 });

    await processNotificationJobs({ emailProvider: noEmail });

    expect(calls).toHaveLength(0);
    expect(await jobsFor(request._id)).toMatchObject([{ status: "sent", providerMessageId: "7" }]);
  });

  it("waits for Telegram's retry_after on flood control", async () => {
    const request = await queuedRequest();
    reply = () =>
      Response.json(
        { ok: false, error_code: 429, description: "Too Many Requests", parameters: { retry_after: 600 } },
        { status: 429 },
      );
    const before = Date.now();

    await processNotificationJobs({ emailProvider: noEmail });

    const [job] = await jobsFor(request._id);
    expect(job).toMatchObject({
      status: "pending",
      attempts: 1,
      lastError: "Telegram 429: Too Many Requests",
    });
    expect(job.nextAttemptAt.getTime()).toBeGreaterThanOrEqual(before + 600_000);
  });

  it("fails permanently when the bot lost access to the channel", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const request = await queuedRequest();
    reply = () =>
      Response.json(
        { ok: false, error_code: 403, description: "Forbidden: bot is not a member" },
        { status: 403 },
      );

    await processNotificationJobs({ emailProvider: noEmail });

    expect(await jobsFor(request._id)).toMatchObject([{ status: "failed" }]);
  });

  it("cancels the post for a request that expired before delivery", async () => {
    const request = await queuedRequest();
    const { requests } = await collections();
    await requests.updateOne({ _id: request._id }, { $set: { status: "expired" } });

    await processNotificationJobs({ emailProvider: noEmail });

    expect(calls).toHaveLength(0);
    expect(await jobsFor(request._id)).toMatchObject([{ status: "cancelled" }]);
  });
});

describe("POST /api/telegram/webhook", () => {
  function update(body: unknown, secret: string | null = SECRET) {
    return webhook(
      new Request("https://bloodlink.test/api/telegram/webhook", {
        method: "POST",
        headers: secret ? { "x-telegram-bot-api-secret-token": secret } : {},
        body: JSON.stringify(body),
      }),
    );
  }

  const startMessage = (text: string, fromId = 555) => ({
    message: { chat: { id: fromId, type: "private" }, from: { id: fromId, is_bot: false }, text },
  });

  it("rejects updates without the right secret token", async () => {
    expect((await update(startMessage("/start x"), null)).status).toBe(401);
    expect((await update(startMessage("/start x"), `${SECRET}-wrong`)).status).toBe(401);
    expect(calls).toHaveLength(0);
  });

  it("links a donor's Telegram account with a single-use deep-link token", async () => {
    const donor = await createDonor();
    const linkToken = await TelegramService.createLinkToken(donor._id);

    expect((await update(startMessage(`/start ${linkToken}`))).status).toBe(200);

    const { users, telegramLinks } = await collections();
    expect((await users.findOne({ _id: donor._id }))!.donorProfile).toMatchObject({
      telegramLinked: true,
      telegramUserId: 555,
    });
    expect(await telegramLinks.countDocuments()).toBe(0);
    expect(calls.at(-1)!.body).toMatchObject({ chat_id: 555 });
    expect(calls.at(-1)!.body.text).toContain("https://t.me/+testInvite");

    await update(startMessage(`/start ${linkToken}`, 777));
    expect(calls.at(-1)!.body.text).toContain("expired or was already used");
    expect((await users.findOne({ _id: donor._id }))!.donorProfile!.telegramUserId).toBe(555);
  });

  it("auto-approves channel join requests only from linked donors", async () => {
    const donor = await createDonor();
    await TelegramService.consumeLinkToken(await TelegramService.createLinkToken(donor._id), 555);
    const join = (userId: number) => ({
      chat_join_request: {
        chat: { id: Number(CHANNEL_ID) },
        from: { id: userId, is_bot: false },
        user_chat_id: userId,
      },
    });

    await update(join(555));
    expect(calls).toEqual([
      { method: "approveChatJoinRequest", body: { chat_id: CHANNEL_ID, user_id: 555 } },
    ]);

    calls = [];
    await update(join(999));
    expect(calls.map((c) => c.method)).toEqual(["sendMessage"]);
  });
});
