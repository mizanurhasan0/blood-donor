import type { Metadata } from "next";
import { Prose } from "@/components/shared/prose";
import { Rich } from "@/components/shared/rich-text";
import { Container } from "@/components/ui/container";
import { SITE } from "@/lib/constants/site";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { formatDate, interpolate } from "@/lib/i18n/format";
import { localeAlternates } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";

/** Date of the last change to these terms; the page shows it formatted in the visitor's language. */
const LAST_UPDATED = "2026-10-28";

export async function generateMetadata(): Promise<Metadata> {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  const alternates = localeAlternates(lang, "/terms");
  return {
    title: t.pages.terms.meta.title,
    description: t.pages.terms.meta.description,
    alternates,
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: LOCALE_TAG[lang].replace("-", "_"),
      url: alternates.canonical,
      title: t.pages.terms.meta.title,
      description: t.pages.terms.meta.description,
    },
  };
}

export default async function TermsPage() {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  const p = t.pages.terms;
  const updated = formatDate(LAST_UPDATED, lang, "long");

  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <header className="flex flex-col gap-3 border-b border-outline/70 pb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{p.title}</h1>
        <p className="text-sm text-muted">{interpolate(p.updated, { date: updated })}</p>
        <p className="text-lg leading-relaxed text-muted">{p.intro}</p>
      </header>
      <Prose>
        <h2>{p.free.heading}</h2>
        <p>{p.free.text}</p>

        <h2>{p.pay.heading}</h2>
        <p>
          <Rich text={p.pay.text} />
        </p>

        <h2>{p.medical.heading}</h2>
        <p>{p.medical.text}</p>

        <h2>{p.responsibilities.heading}</h2>
        <ul>
          {p.responsibilities.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p>{p.responsibilities.text}</p>

        <h2>{p.moderation.heading}</h2>
        <p>{p.moderation.text}</p>

        <h2>{p.guarantees.heading}</h2>
        <p>{p.guarantees.text}</p>

        <h2>{p.account.heading}</h2>
        <p>
          <Rich text={p.account.text} />
        </p>

        <h2>{p.changes.heading}</h2>
        <p>
          <Rich text={p.changes.text} />
        </p>
      </Prose>
    </Container>
  );
}
