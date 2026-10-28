import type { BloodGroup } from "@/lib/constants/blood-groups";
import { SITE, type Urgency } from "@/lib/constants/site";
import { formatLongDate } from "@/lib/utils/dates";

export interface NotifiableRequest {
  id: string;
  bloodGroup: BloodGroup;
  units: number;
  hospitalName: string;
  district: string;
  neededAt: Date;
  urgency: Urgency;
  description: string;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function requestUrl(id: string): string {
  return `${SITE.url}/requests/${id}`;
}

function summary(description: string): string {
  const text = description.replace(/\s+/g, " ").trim();
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

export function emailSubject(r: NotifiableRequest): string {
  return `${r.urgency === "urgent" ? "Urgent: " : ""}Blood Needed: ${r.bloodGroup} in ${r.district}`;
}

/**
 * Email body. Inline styles are required for email clients; these values
 * mirror the theme tokens in globals.css since CSS variables don't work in email.
 */
export function emailBody(r: NotifiableRequest, recipientName: string, unsubscribeUrl: string) {
  const rows: [string, string][] = [
    ["Blood group", r.bloodGroup],
    ["Hospital", r.hospitalName],
    ["District", r.district],
    ["Needed by", formatLongDate(r.neededAt)],
    ["Units needed", String(r.units)],
  ];
  const url = requestUrl(r.id);
  const note = summary(r.description);

  const text = [
    `Hi ${recipientName},`,
    "",
    `Someone near you needs ${r.bloodGroup} blood.`,
    ...rows.map(([k, v]) => `${k}: ${v}`),
    note ? `\n${note}` : "",
    "",
    `View the request: ${url}`,
    "",
    "Blood group matching only finds potential volunteers. Medical staff decide donation eligibility and compatibility.",
    `Stop these emails: ${unsubscribeUrl}`,
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#06121d;font-family:Arial,sans-serif;color:#f8fafc">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#102635;border:1px solid #243b4c;border-radius:16px;padding:28px">
<tr><td style="font-size:20px;font-weight:bold;padding-bottom:4px">Blood<span style="color:#ff2442">Link</span></td></tr>
<tr><td style="font-size:15px;color:#a7b7c8;padding-bottom:20px">Hi ${escapeHtml(recipientName)}, someone near you needs <strong style="color:#ff2442">${r.bloodGroup}</strong> blood${r.urgency === "urgent" ? " urgently" : ""}.</td></tr>
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:6px 0;font-size:14px"><span style="color:#a7b7c8">${k}:</span> <strong>${escapeHtml(v)}</strong></td></tr>`,
  )
  .join("")}
${note ? `<tr><td style="padding:14px 0 0;font-size:14px;color:#a7b7c8">${escapeHtml(note)}</td></tr>` : ""}
<tr><td style="padding:24px 0"><a href="${url}" style="display:inline-block;background:#ff2442;color:#f8fafc;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:999px">View Request</a></td></tr>
<tr><td style="font-size:12px;color:#a7b7c8;line-height:1.5">Blood group matching only finds potential volunteers. Final screening, compatibility testing and donation eligibility are decided by medical staff. Never pay or accept payment for blood.<br><br><a href="${unsubscribeUrl}" style="color:#a7b7c8">Stop these emails</a></td></tr>
</table></td></tr></table></body></html>`;

  return { html, text };
}

/** Telegram HTML message. Contains no contact details or documents. */
export function telegramMessage(r: NotifiableRequest): string {
  const lines = [
    `🩸 <b>${r.bloodGroup} BLOOD NEEDED</b>${r.urgency === "urgent" ? " · URGENT" : ""}`,
    "",
    `Hospital: ${escapeHtml(r.hospitalName)}`,
    `District: ${escapeHtml(r.district)}`,
    `Units: ${r.units}`,
    `Needed: ${formatLongDate(r.neededAt)}`,
    "",
    "View Request:",
    requestUrl(r.id),
  ];
  return lines.join("\n");
}
