import { describe, expect, it } from "vitest";
import { bn as notifyBn } from "@/lib/i18n/messages/notify";
import {
  emailBody,
  emailSubject,
  escapeHtml,
  requestUrl,
  telegramMessage,
  type NotifiableRequest,
} from "@/features/notifications/templates";

const PHONE = "01712345678";

function notifiable(overrides: Partial<NotifiableRequest> = {}): NotifiableRequest {
  return {
    id: "65f1c0ffee0000000000abcd",
    bloodGroup: "B+",
    units: 2,
    hospitalName: "Dhaka Medical College Hospital",
    district: "Dhaka",
    neededAt: new Date("2026-03-11T17:59:59.999Z"),
    urgency: "normal",
    description: "Patient is in ward 5.",
    ...overrides,
  };
}

const UNSUBSCRIBE = "https://bloodlink.test/unsubscribe?u=1&t=abc";

describe("escapeHtml", () => {
  it("escapes every HTML-significant character", () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe(
      "&#60;a href=&#34;x&#34; onclick=&#39;y&#39;&#62;&#38;&#60;/a&#62;",
    );
  });
});

describe("emailSubject", () => {
  it("names the blood group and district", () => {
    expect(emailSubject(notifiable())).toBe("রক্ত প্রয়োজন: B+, ঢাকা");
  });

  it("flags urgent requests", () => {
    expect(emailSubject(notifiable({ urgency: "urgent", bloodGroup: "O-", district: "Sylhet" }))).toBe(
      "জরুরি: রক্ত প্রয়োজন: O-, সিলেট",
    );
  });
});

describe("emailBody", () => {
  it("escapes user-supplied hospital, description and recipient name in the HTML", () => {
    const { html } = emailBody(
      notifiable({
        hospitalName: `<img src=x onerror="alert(1)">`,
        description: "<script>steal()</script> please help",
      }),
      "<b>Karim</b>",
      UNSUBSCRIBE,
    );
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>Karim</b>");
    expect(html).toContain("&#60;img src=x onerror=&#34;alert(1)&#34;&#62;");
    expect(html).toContain("&#60;script&#62;steal()&#60;/script&#62; please help");
  });

  it("includes the key facts, the request link and an unsubscribe link in both parts", () => {
    const { html, text } = emailBody(notifiable(), "Karim", UNSUBSCRIBE);
    for (const part of [html, text]) {
      expect(part).toContain("Dhaka Medical College Hospital");
      expect(part).toContain("১১ মার্চ, ২০২৬");
      expect(part).toContain("https://bloodlink.test/bn/requests/65f1c0ffee0000000000abcd");
      expect(part).toContain(UNSUBSCRIBE);
    }
    expect(text).toContain("প্রয়োজনীয় ইউনিট: ২");
    expect(text).toContain(notifyBn.safetyNotice);
  });

  it("shortens long descriptions", () => {
    const { text } = emailBody(notifiable({ description: "word ".repeat(100) }), "Karim", UNSUBSCRIBE);
    const summary = text.split("\n").find((line) => line.startsWith("word"));
    expect(summary).toHaveLength(178);
    expect(summary?.endsWith("…")).toBe(true);
  });
});

describe("telegramMessage", () => {
  it("contains the request facts and link", () => {
    const message = telegramMessage(notifiable({ urgency: "urgent" }));
    expect(message).toContain("<b>B+ রক্ত প্রয়োজন</b> · জরুরি");
    expect(message).toContain("হাসপাতাল: Dhaka Medical College Hospital");
    expect(message).toContain("জেলা: ঢাকা");
    expect(message).toContain("প্রয়োজনীয় ইউনিট: ২");
    expect(message).toContain("প্রয়োজনের তারিখ: ১১ মার্চ, ২০২৬");
    expect(message).toContain("https://bloodlink.test/bn/requests/65f1c0ffee0000000000abcd");
  });

  it("never includes contact details or the free-text description", () => {
    const message = telegramMessage(notifiable({ description: `Call me on ${PHONE} or +880 1712-345678` }));
    expect(message).not.toContain(PHONE);
    expect(message).not.toContain("1712");
    expect(message).not.toContain("Call me");
  });

  it("escapes the hospital name for Telegram's HTML parse mode", () => {
    const message = telegramMessage(notifiable({ hospitalName: "Square <Hospital> & Co" }));
    expect(message).toContain("হাসপাতাল: Square &#60;Hospital&#62; &#38; Co");
  });
});

describe("requestUrl", () => {
  it("builds absolute links from the configured site URL without a double slash", () => {
    expect(requestUrl("abc")).toBe("https://bloodlink.test/bn/requests/abc");
  });
});
