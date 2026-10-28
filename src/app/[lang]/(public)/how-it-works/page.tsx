import {
  Ban,
  BellRing,
  ChevronDown,
  CircleCheckBig,
  Droplet,
  FileLock,
  FilePlus,
  HeartHandshake,
  Hospital,
  Lock,
  LogIn,
  Mail,
  MessagesSquare,
  Send,
  ShieldCheck,
  Stethoscope,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { SafetyNotice } from "@/components/shared/safety-notice";
import { Rich } from "@/components/shared/rich-text";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/container";
import { formatNumber, interpolate } from "@/lib/i18n/format";
import { LOCALE_TAG, type Locale } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { localeAlternates } from "@/lib/i18n/paths";
import { SITE } from "@/lib/constants/site";
import type { Dictionary } from "@/lib/i18n/messages";

// Icons belong to the layout; the dictionary holds the words, matched to these by position.
const REQUESTER_ICONS: LucideIcon[] = [FilePlus, ShieldCheck, BellRing, MessagesSquare, CircleCheckBig];
const DONOR_ICONS: LucideIcon[] = [LogIn, UserRoundPlus, Mail, Send, HeartHandshake];
const SAFETY_ICONS: LucideIcon[] = [Lock, FileLock, Ban, Stethoscope];

export async function generateMetadata(): Promise<Metadata> {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  const alternates = localeAlternates(lang, "/how-it-works");
  return {
    title: t.pages.howItWorks.meta.title,
    description: t.pages.howItWorks.meta.description,
    alternates,
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: LOCALE_TAG[lang].replace("-", "_"),
      url: alternates.canonical,
      title: t.pages.howItWorks.meta.title,
      description: t.pages.howItWorks.meta.description,
    },
  };
}

function StepList({
  steps,
  icons,
  stepLabel,
  lang,
}: {
  steps: { title: string; text: string }[];
  icons: LucideIcon[];
  stepLabel: string;
  lang: Locale;
}) {
  const zero = formatNumber(0, lang);
  return (
    <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map(({ title, text }, index) => {
        const Icon = icons[index];
        return (
          <li
            key={title}
            className="relative flex flex-col gap-3 rounded-card border border-outline/70 bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-full bg-brand/15 text-brand-bright">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span aria-hidden="true" className="text-3xl font-semibold text-muted tabular-nums">
                {formatNumber(index + 1, lang).padStart(2, zero)}
              </span>
            </div>
            <h3 className="font-semibold">
              <span className="sr-only">{interpolate(stepLabel, { n: formatNumber(index + 1, lang) })}</span>
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-muted">{text}</p>
          </li>
        );
      })}
    </ol>
  );
}

function Eyebrow({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 rounded-pill border border-outline/70 bg-surface px-3 py-1 text-xs font-medium tracking-wide text-muted uppercase">
      <Icon className="size-3.5 text-brand-bright" aria-hidden="true" />
      {children}
    </p>
  );
}

function Actions({ t }: { t: Dictionary["pages"]["howItWorks"] }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <ButtonLink href="/request/new" size="lg">
        {t.postRequest}
      </ButtonLink>
      <ButtonLink href="/become-donor" variant="secondary" size="lg">
        {t.becomeDonor}
      </ButtonLink>
    </div>
  );
}

export default async function HowItWorksPage() {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  const h = t.pages.howItWorks;

  return (
    <>
      <section className="relative overflow-hidden border-b border-outline/60">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-radial from-brand/15 to-transparent to-70%"
        />
        <Container className="relative flex flex-col items-start gap-5 py-14 sm:py-20">
          <Eyebrow icon={Droplet}>{h.eyebrow}</Eyebrow>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            <Rich
              text={h.heroTitle}
              values={{ accent: <span className="text-brand-bright">{h.heroAccent}</span> }}
            />
          </h1>
          <p className="max-w-2xl text-lg text-muted">{h.heroText}</p>
          <Actions t={h} />
        </Container>
      </section>

      <Container className="flex flex-col gap-16 py-14 sm:gap-20 sm:py-20">
        <section aria-labelledby="requesters">
          <Eyebrow icon={Hospital}>{h.requesters.eyebrow}</Eyebrow>
          <SectionHeading id="requesters" title={h.requesters.title} description={h.requesters.description} />
          <StepList steps={h.requesters.steps} icons={REQUESTER_ICONS} stepLabel={h.stepLabel} lang={lang} />
        </section>

        <section aria-labelledby="donors">
          <Eyebrow icon={HeartHandshake}>{h.donors.eyebrow}</Eyebrow>
          <SectionHeading id="donors" title={h.donors.title} description={h.donors.description} />
          <StepList steps={h.donors.steps} icons={DONOR_ICONS} stepLabel={h.stepLabel} lang={lang} />
        </section>

        <section aria-labelledby="safety">
          <Eyebrow icon={ShieldCheck}>{h.safety.eyebrow}</Eyebrow>
          <SectionHeading id="safety" title={h.safety.title} />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {h.safety.items.map(({ title, text }, index) => {
              const Icon = SAFETY_ICONS[index];
              return (
                <li
                  key={title}
                  className="flex gap-4 rounded-card border border-outline/70 bg-surface/60 p-5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-elevated text-brand-bright">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <SafetyNotice className="mt-4" />
        </section>

        <section aria-labelledby="faq" className="mx-auto w-full max-w-3xl">
          <SectionHeading id="faq" title={h.faq.title} />
          <div className="mt-8 flex flex-col gap-3">
            {h.faq.items.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-card border border-outline/70 bg-card transition-colors open:border-muted/40"
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-card px-5 py-3 font-medium [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown
                    className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="cta"
          className="relative overflow-hidden rounded-card border border-outline/70 bg-card px-6 py-10 text-center shadow-card sm:px-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-radial from-brand/20 to-transparent to-70%"
          />
          <div className="relative flex flex-col items-center gap-4">
            <h2 id="cta" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {h.cta.title}
            </h2>
            <p className="max-w-xl text-muted">{h.cta.text}</p>
            <Actions t={h} />
          </div>
        </section>
      </Container>
    </>
  );
}
