import { BellRing, Lock, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { SafetyNotice } from "@/components/shared/safety-notice";
import { SignInPrompt } from "@/features/auth/components/sign-in-prompt";
import { getViewer } from "@/features/auth/viewer";
import { DonorRegistrationForm } from "@/features/donors/components/donor-registration-form";
import { TelegramJoinCard } from "@/features/donors/components/telegram-join-card";
import { SITE } from "@/lib/constants/site";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { localeAlternates, localizedPath } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  const lang = await getLocale();
  const { metaTitle, metaDescription } = t.donor.becomeDonor;
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: localeAlternates(lang, "/become-donor"),
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: LOCALE_TAG[lang].replace("-", "_"),
      url: localizedPath(lang, "/become-donor"),
      title: metaTitle,
      description: metaDescription,
    },
  };
}

async function DonorArea() {
  const viewer = await getViewer();
  const t = await getDictionary();
  const lang = await getLocale();
  if (!viewer) {
    return (
      <SignInPrompt
        title={t.donor.becomeDonor.signInTitle}
        description={t.donor.becomeDonor.signInText}
        callbackUrl={localizedPath(lang, "/become-donor")}
      />
    );
  }
  return (
    <DonorRegistrationForm
      initialValues={{ fullName: viewer.name }}
      registered={viewer.donor !== null}
      telegram={
        <TelegramJoinCard linked={viewer.donor?.telegramLinked ?? false} isDonor={viewer.donor !== null} />
      }
    />
  );
}

function DonorAreaSkeleton() {
  return (
    <Card aria-hidden="true" className="flex flex-col gap-6 p-5 sm:p-8">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-11 w-full" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="ml-auto h-12 w-44 rounded-pill" />
    </Card>
  );
}

export default async function BecomeDonorPage() {
  const t = await getDictionary();
  const copy = t.donor.becomeDonor;
  const benefits = [
    { icon: BellRing, title: copy.benefitAlertsTitle, text: copy.benefitAlertsText },
    { icon: SlidersHorizontal, title: copy.benefitControlTitle, text: copy.benefitControlText },
    { icon: Lock, title: copy.benefitPrivateTitle, text: copy.benefitPrivateText },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-outline/60">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
        />
        <Container className="relative flex flex-col gap-8 py-12 sm:py-16">
          <div className="flex max-w-2xl animate-fade-up flex-col gap-4">
            <p className="text-sm font-medium tracking-wide text-brand-bright uppercase">{copy.eyebrow}</p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {copy.heroTitle} <span className="text-brand-bright">{copy.heroHighlight}</span>
            </h1>
            <p className="text-lg text-muted">{copy.heroText}</p>
          </div>
          <h2 className="sr-only">{copy.whyRegister}</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3 rounded-card border border-outline/70 bg-surface/60 p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-bright">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="min-w-0">
          <Suspense fallback={<DonorAreaSkeleton />}>
            <DonorArea />
          </Suspense>
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
          <Card className="flex flex-col gap-3 p-5">
            <h2 className="font-semibold">{copy.storedTitle}</h2>
            <ul className="flex flex-col gap-2.5 text-sm text-muted">
              {copy.storedItems.map(({ item, why }) => (
                <li key={item}>
                  <span className="font-medium text-foreground">{item}</span> {why}
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted">{copy.storedNote}</p>
          </Card>
          <SafetyNotice />
        </aside>
      </Container>
    </>
  );
}
