import { BellRing, ClipboardPen, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { SignInPrompt } from "@/features/auth/components/sign-in-prompt";
import { getViewer } from "@/features/auth/viewer";
import { BloodRequestForm } from "@/features/requests/components/blood-request-form";
import { formatNumber, interpolate } from "@/lib/i18n/format";
import { localeAlternates, localizedPath } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  const lang = await getLocale();
  return {
    title: t.requestForm.pageTitle,
    description: t.requestForm.metaDescription,
    alternates: localeAlternates(lang, "/request/new"),
    robots: { index: false, follow: true },
  };
}

const STEPS = [
  { key: "submit", icon: ClipboardPen },
  { key: "review", icon: ShieldCheck },
  { key: "notified", icon: BellRing },
] as const;

export default async function NewRequestPage() {
  const t = await getDictionary();
  return (
    <PageContainer narrow title={t.requestForm.pageTitle} description={t.requestForm.pageDescription}>
      <NextSteps />
      <Suspense fallback={<FormSkeleton label={t.requestForm.loading} />}>
        <RequestFormGate />
      </Suspense>
    </PageContainer>
  );
}

async function RequestFormGate() {
  const viewer = await getViewer();
  if (!viewer) {
    const t = await getDictionary();
    const lang = await getLocale();
    return (
      <SignInPrompt
        title={t.requestForm.signIn.title}
        description={t.requestForm.signIn.description}
        callbackUrl={localizedPath(lang, "/request/new")}
      />
    );
  }
  return <BloodRequestForm viewerName={viewer.name} />;
}

async function NextSteps() {
  const t = await getDictionary();
  const lang = await getLocale();
  const copy = t.requestForm.nextSteps;
  return (
    <section aria-labelledby="next-steps" className="mb-8">
      <h2 id="next-steps" className="mb-3 text-xs font-medium tracking-wider text-muted uppercase">
        {copy.heading}
      </h2>
      <ol className="grid grid-cols-3 gap-2 sm:gap-3">
        {STEPS.map(({ key, icon: Icon }, index) => (
          <li
            key={key}
            className="flex flex-col items-center gap-2 rounded-card border border-outline/70 bg-surface/60 px-2 py-3 text-center sm:flex-row sm:gap-3 sm:px-4 sm:text-left"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-bright">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="text-xs text-muted">
                {interpolate(copy.step, { number: formatNumber(index + 1, lang) })}
              </span>
              <span className="text-sm leading-tight font-medium">{copy[key]}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FormSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-6">
      <span className="sr-only" role="status">
        {label}
      </span>
      <Skeleton className="h-5 w-64 max-w-full" />
      <Card className="flex flex-col gap-5 p-5 sm:p-6">
        <Skeleton className="h-6 w-36" />
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </Card>
      <Card className="flex flex-col gap-5 p-5 sm:p-6">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-11" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      </Card>
    </div>
  );
}
