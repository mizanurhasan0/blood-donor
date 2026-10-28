import { Flag, Mail, MessagesSquare, Siren } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { Rich } from "@/components/shared/rich-text";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { SITE } from "@/lib/constants/site";
import { env } from "@/lib/env";
import { LOCALE_TAG } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages";
import { localeAlternates } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";

const LINK_CLASS = "font-medium text-foreground underline decoration-brand/60 underline-offset-4";

export async function generateMetadata(): Promise<Metadata> {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  const alternates = localeAlternates(lang, "/contact");
  return {
    title: t.pages.contact.meta.title,
    description: t.pages.contact.meta.description,
    alternates,
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: LOCALE_TAG[lang].replace("-", "_"),
      url: alternates.canonical,
      title: t.pages.contact.meta.title,
      description: t.pages.contact.meta.description,
    },
  };
}

function ContactCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Card className="flex gap-4 p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-bright">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="font-semibold">{title}</h2>
        <div className="text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </Card>
  );
}

/** Reads the address at request time so a changed env var applies without a rebuild. */
async function ContactEmail({ t }: { t: Dictionary["pages"]["contact"] }) {
  await connection();
  const email = env("contact").CONTACT_EMAIL;
  if (email) {
    return (
      <p>
        <Rich
          text={t.touch.withEmail}
          values={{
            address: (
              <a
                href={`mailto:${email}`}
                className="font-medium break-all text-foreground underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
              >
                {email}
              </a>
            ),
          }}
        />
      </p>
    );
  }
  return (
    <p>
      <Rich text={t.touch.noInbox} linkClassName={LINK_CLASS} />
    </p>
  );
}

export default async function ContactPage() {
  const t = await getDictionary();
  const c = t.pages.contact;
  return (
    <PageContainer narrow title={c.title} description={c.description}>
      <div className="flex flex-col gap-4">
        <ContactCard icon={<Mail className="size-5" aria-hidden="true" />} title={c.touch.title}>
          <Suspense fallback={<Skeleton className="h-5 w-64 max-w-full" />}>
            <ContactEmail t={c} />
          </Suspense>
        </ContactCard>
        <ContactCard icon={<Flag className="size-5" aria-hidden="true" />} title={c.report.title}>
          <p>
            <Rich text={c.report.text} strongClassName="font-medium text-foreground" />
          </p>
        </ContactCard>
        <ContactCard
          icon={<MessagesSquare className="size-5" aria-hidden="true" />}
          title={c.coordinate.title}
        >
          <p>
            <Rich text={c.coordinate.text} linkClassName={LINK_CLASS} />
          </p>
        </ContactCard>
        <ContactCard icon={<Siren className="size-5" aria-hidden="true" />} title={c.emergency.title}>
          <p>{c.emergency.text}</p>
        </ContactCard>
      </div>
    </PageContainer>
  );
}
