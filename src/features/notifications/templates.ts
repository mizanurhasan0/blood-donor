import type { BloodGroup } from "@/lib/constants/blood-groups";
import { SITE, type Urgency } from "@/lib/constants/site";
import { formatDate, formatNumber, interpolate } from "@/lib/i18n/format";
import { bn as geoBn } from "@/lib/i18n/messages/geo";
import { bn as notifyBn } from "@/lib/i18n/messages/notify";

/** Recipients get Bangla. Email and Telegram text always use the bn copy. */
const copy = notifyBn;

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
  return `${SITE.url}/bn/requests/${id}`;
}

/** District names are stored in English and shown in Bangla. */
function districtName(district: string): string {
  return (geoBn.districts as Record<string, string>)[district] ?? district;
}

function neededDate(date: Date): string {
  return formatDate(date, "bn", "long");
}

function summary(description: string): string {
  const text = description.replace(/\s+/g, " ").trim();
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

export function emailSubject(r: NotifiableRequest): string {
  const template = r.urgency === "urgent" ? copy.emailSubjectUrgent : copy.emailSubject;
  return interpolate(template, { bloodGroup: r.bloodGroup, district: districtName(r.district) });
}

/**
 * Email body. Inline styles are required for email clients; these values
 * mirror the theme tokens in globals.css since CSS variables don't work in email.
 */
export function emailBody(r: NotifiableRequest, recipientName: string, unsubscribeUrl: string) {
  const rows: [string, string][] = [
    [copy.labelBloodGroup, r.bloodGroup],
    [copy.labelHospital, r.hospitalName],
    [copy.labelDistrict, districtName(r.district)],
    [copy.labelNeededBy, neededDate(r.neededAt)],
    [copy.labelUnits, formatNumber(r.units, "bn")],
  ];
  const url = requestUrl(r.id);
  const note = summary(r.description);
  const urgent = r.urgency === "urgent";

  const text = [
    interpolate(copy.emailGreeting, { name: recipientName }),
    "",
    interpolate(copy.emailLead, { bloodGroup: r.bloodGroup }),
    ...rows.map(([k, v]) => `${k}: ${v}`),
    note ? `\n${note}` : "",
    "",
    interpolate(copy.emailViewRequest, { url }),
    "",
    copy.safetyNotice,
    interpolate(copy.emailUnsubscribeText, { url: unsubscribeUrl }),
  ].join("\n");

  const leadHtml = interpolate(urgent ? copy.emailLeadUrgent : copy.emailLead, {
    bloodGroup: `<strong style="color:#ff2442">${r.bloodGroup}</strong>`,
  });

  const html = `<!doctype html><html lang="bn"><body style="margin:0;background:#06121d;font-family:'Noto Sans Bengali','Nirmala UI',Vrinda,Arial,sans-serif;color:#f8fafc">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#102635;border:1px solid #243b4c;border-radius:16px;padding:28px">
<tr><td style="font-size:20px;font-weight:bold;padding-bottom:4px">Blood<span style="color:#ff2442">Link</span></td></tr>
<tr><td style="font-size:15px;color:#a7b7c8;padding-bottom:20px">${interpolate(copy.emailGreeting, { name: escapeHtml(recipientName) })} ${leadHtml}</td></tr>
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:6px 0;font-size:14px"><span style="color:#a7b7c8">${k}:</span> <strong>${escapeHtml(v)}</strong></td></tr>`,
  )
  .join("")}
${note ? `<tr><td style="padding:14px 0 0;font-size:14px;color:#a7b7c8">${escapeHtml(note)}</td></tr>` : ""}
<tr><td style="padding:24px 0"><a href="${url}" style="display:inline-block;background:#ff2442;color:#f8fafc;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:999px">${copy.emailViewButton}</a></td></tr>
<tr><td style="font-size:12px;color:#a7b7c8;line-height:1.5">${copy.safetyNotice}<br><br><a href="${unsubscribeUrl}" style="color:#a7b7c8">${copy.emailUnsubscribeLink}</a></td></tr>
</table></td></tr></table></body></html>`;

  return { html, text };
}

/** Telegram HTML message. Contains no contact details or documents. */
export function telegramMessage(r: NotifiableRequest): string {
  const lines = [
    `🩸 <b>${interpolate(copy.telegramTitle, { bloodGroup: r.bloodGroup })}</b>${r.urgency === "urgent" ? copy.telegramUrgent : ""}`,
    "",
    `${copy.labelHospital}: ${escapeHtml(r.hospitalName)}`,
    `${copy.labelDistrict}: ${escapeHtml(districtName(r.district))}`,
    `${copy.labelUnits}: ${formatNumber(r.units, "bn")}`,
    `${copy.labelNeededBy}: ${neededDate(r.neededAt)}`,
    "",
    copy.telegramViewRequest,
    requestUrl(r.id),
  ];
  return lines.join("\n");
}
