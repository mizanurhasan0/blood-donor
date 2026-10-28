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

export const metadata: Metadata = {
  title: "Become a Blood Donor",
  description:
    "Register as a voluntary blood donor in Bangladesh. Add your blood group and district, and get an email when someone near you needs your help.",
  alternates: { canonical: "/become-donor" },
};

const BENEFITS = [
  {
    icon: BellRing,
    title: "Alerts that matter",
    text: "Emails only for approved requests that match your blood group in your district or division.",
  },
  {
    icon: SlidersHorizontal,
    title: "You stay in control",
    text: "Pause availability or stop alerts any time from your account.",
  },
  {
    icon: Lock,
    title: "Private by default",
    text: "Your phone number and email are never shown publicly.",
  },
] as const;

const STORED = [
  ["Blood group, district and area", "to match you with nearby requests."],
  ["Availability and alert choice", "so we only contact you when you want."],
  ["Mobile number (optional)", "stored encrypted and never shown publicly."],
  ["Google name and email", "to sign you in and send the alerts you opt into."],
] as const;

async function DonorArea() {
  const viewer = await getViewer();
  if (!viewer) {
    return (
      <SignInPrompt
        title="Sign in to register"
        description="Use your Google account to create your donor profile. No passwords needed."
        callbackUrl="/become-donor"
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

export default function BecomeDonorPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-outline/60">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
        />
        <Container className="relative flex flex-col gap-8 py-12 sm:py-16">
          <div className="flex max-w-2xl animate-fade-up flex-col gap-4">
            <p className="text-sm font-medium tracking-wide text-brand-bright uppercase">
              Voluntary blood donors
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Become a Donor. <span className="text-brand-bright">Make a Difference.</span>
            </h1>
            <p className="text-lg text-muted">
              Patients across Bangladesh need blood for surgery, childbirth, accidents and ongoing treatment,
              and families often search for donors under pressure. When you register, people nearby can reach
              a willing donor faster.
            </p>
          </div>
          <h2 className="sr-only">Why register</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
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
            <h2 className="font-semibold">What we store and why</h2>
            <ul className="flex flex-col gap-2.5 text-sm text-muted">
              {STORED.map(([item, why]) => (
                <li key={item}>
                  <span className="font-medium text-foreground">{item}</span> {why}
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted">
              You can edit or delete everything from your account at any time.
            </p>
          </Card>
          <SafetyNotice />
        </aside>
      </Container>
    </>
  );
}
