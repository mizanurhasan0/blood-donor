import type { Locale } from "../config";
import * as account from "./account";
import * as auth from "./auth";
import * as comments from "./comments";
import * as common from "./common";
import * as donor from "./donor";
import * as feedback from "./feedback";
import * as geo from "./geo";
import * as home from "./home";
import * as moderation from "./moderation";
import * as nav from "./nav";
import * as pages from "./pages";
import * as requestForm from "./request-form";
import * as requests from "./requests";

/*
 * One namespace file per area, each holding `en` and `bn` side by side.
 * `bn` is type-checked against `en`, so both must keep the same keys.
 * Notification text (email, Telegram) lives in ./notify and is used by the worker only.
 */
const en = {
  account: account.en,
  auth: auth.en,
  comments: comments.en,
  common: common.en,
  donor: donor.en,
  feedback: feedback.en,
  geo: geo.en,
  home: home.en,
  moderation: moderation.en,
  nav: nav.en,
  pages: pages.en,
  requestForm: requestForm.en,
  requests: requests.en,
};

const bn: typeof en = {
  account: account.bn,
  auth: auth.bn,
  comments: comments.bn,
  common: common.bn,
  donor: donor.bn,
  feedback: feedback.bn,
  geo: geo.bn,
  home: home.bn,
  moderation: moderation.bn,
  nav: nav.bn,
  pages: pages.bn,
  requestForm: requestForm.bn,
  requests: requests.bn,
};

export type Dictionary = typeof en;

/** Client components get everything except long page copy and admin-only strings (keeps their payload small). */
export type ClientDictionary = Omit<Dictionary, "pages" | "moderation">;

export const messages: Record<Locale, Dictionary> = { en, bn };

export function clientMessages(lang: Locale): ClientDictionary {
  const d = messages[lang];
  return {
    account: d.account,
    auth: d.auth,
    comments: d.comments,
    common: d.common,
    donor: d.donor,
    feedback: d.feedback,
    geo: d.geo,
    home: d.home,
    nav: d.nav,
    requestForm: d.requestForm,
    requests: d.requests,
  };
}
