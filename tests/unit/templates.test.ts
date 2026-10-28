import { describe, expect, it } from "vitest";
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
    expect(emailSubject(notifiable())).toBe("Blood Needed: B+ in Dhaka");
  });

  it("flags urgent requests", () => {
    expect(emailSubject(notifiable({ urgency: "urgent", bloodGroup: "O-", district: "Sylhet" }))).toBe(
      "Urgent: Blood Needed: O- in Sylhet",
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
      expect(part).toContain("11 March 2026");
      expect(part).toContain("https://bloodlink.test/requests/65f1c0ffee0000000000abcd");
      expect(part).toContain(UNSUBSCRIBE);
    }
    expect(text).toContain("Units needed: 2");
    expect(text).toContain("Medical staff decide donation eligibility");
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
    expect(message).toContain("<b>B+ BLOOD NEEDED</b> · URGENT");
    expect(message).toContain("Hospital: Dhaka Medical College Hospital");
    expect(message).toContain("District: Dhaka");
    expect(message).toContain("Units: 2");
    expect(message).toContain("Needed: 11 March 2026");
    expect(message).toContain("https://bloodlink.test/requests/65f1c0ffee0000000000abcd");
  });

  it("never includes contact details or the free-text description", () => {
    const message = telegramMessage(notifiable({ description: `Call me on ${PHONE} or +880 1712-345678` }));
    expect(message).not.toContain(PHONE);
    expect(message).not.toContain("1712");
    expect(message).not.toContain("Call me");
  });

  it("escapes the hospital name for Telegram's HTML parse mode", () => {
    const message = telegramMessage(notifiable({ hospitalName: "Square <Hospital> & Co" }));
    expect(message).toContain("Hospital: Square &#60;Hospital&#62; &#38; Co");
  });
});

describe("requestUrl", () => {
  it("builds absolute links from the configured site URL without a double slash", () => {
    expect(requestUrl("abc")).toBe("https://bloodlink.test/requests/abc");
  });
});
