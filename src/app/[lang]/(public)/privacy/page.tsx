import type { Metadata } from "next";
import { Rich } from "@/components/shared/rich-text";
import { Prose } from "@/components/shared/prose";
import { Container } from "@/components/ui/container";
import { SITE } from "@/lib/constants/site";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { formatDate, interpolate } from "@/lib/i18n/format";
import { localeAlternates } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";

/** Date of the last change to this policy; the page shows it formatted in the visitor's language. */
const LAST_UPDATED = "2026-10-28";

export async function generateMetadata(): Promise<Metadata> {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  const alternates = localeAlternates(lang, "/privacy");
  return {
    title: t.pages.privacy.meta.title,
    description: t.pages.privacy.meta.description,
    alternates,
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: LOCALE_TAG[lang].replace("-", "_"),
      url: alternates.canonical,
      title: t.pages.privacy.meta.title,
      description: t.pages.privacy.meta.description,
    },
  };
}

export default async function PrivacyPage() {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  const p = t.pages.privacy;
  const updated = formatDate(LAST_UPDATED, lang, "long");

  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <header className="flex flex-col gap-3 border-b border-outline/70 pb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{p.title}</h1>
        <p className="text-sm text-muted">{interpolate(p.updated, { date: updated })}</p>
        <p className="text-lg leading-relaxed text-muted">{p.intro}</p>
      </header>
      <Prose>
        <h2>{p.collect.heading}</h2>
        <h3>{p.collect.google.heading}</h3>
        <p>
          <Rich text={p.collect.google.text} />
        </p>
        <h3>{p.collect.donor.heading}</h3>
        <ul>
          {p.collect.donor.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <h3>{p.collect.request.heading}</h3>
        <ul>
          {p.collect.request.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <h3>{p.collect.usage.heading}</h3>
        <ul>
          {p.collect.usage.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p>{p.collect.noAds}</p>

        <h2>{p.who.heading}</h2>
        <ul>
          {p.who.items.map((item, index) => (
            <li key={index}>
              <Rich text={item} />
            </li>
          ))}
        </ul>

        <h2>{p.notify.heading}</h2>
        <ul>
          {p.notify.items.map((item, index) => (
            <li key={index}>
              <Rich text={item} />
            </li>
          ))}
        </ul>

        <h2>{p.share.heading}</h2>
        <p>{p.share.text}</p>

        <h2>{p.safe.heading}</h2>
        <p>{p.safe.text}</p>

        <h2>{p.choices.heading}</h2>
        <ul>
          {p.choices.items.map((item, index) => (
            <li key={index}>
              <Rich text={item} />
            </li>
          ))}
        </ul>

        <h2>{p.changes.heading}</h2>
        <p>
          <Rich text={p.changes.text} />
        </p>
      </Prose>
    </Container>
  );
}
