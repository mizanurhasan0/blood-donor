import { BellRing, ClipboardPen, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { SignInPrompt } from "@/features/auth/components/sign-in-prompt";
import { getViewer } from "@/features/auth/viewer";
import { BloodRequestForm } from "@/features/requests/components/blood-request-form";

export const metadata: Metadata = {
  title: "Post a Blood Request",
  description:
    "Post a free blood request on BloodLink. A moderator reviews it, then matching donors across Bangladesh are notified.",
  alternates: { canonical: "/request/new" },
  robots: { index: false, follow: true },
};

const STEPS = [
  { label: "Submit", icon: ClipboardPen },
  { label: "Quick review", icon: ShieldCheck },
  { label: "Donors notified", icon: BellRing },
] as const;

export default function NewRequestPage() {
  return (
    <PageContainer
      narrow
      title="Post a Blood Request"
      description="Free, reviewed by a moderator before it goes live, then shared with matching donors by email and our private Telegram channel."
    >
      <NextSteps />
      <Suspense fallback={<FormSkeleton />}>
        <RequestFormGate />
      </Suspense>
    </PageContainer>
  );
}

async function RequestFormGate() {
  const viewer = await getViewer();
  if (!viewer) {
    return (
      <SignInPrompt
        title="Sign in to post a request"
        description="Signing in lets you track your request, update it and mark it fulfilled, and helps keep the community free of spam."
        callbackUrl="/request/new"
      />
    );
  }
  return <BloodRequestForm viewerName={viewer.name} />;
}

function NextSteps() {
  return (
    <section aria-labelledby="next-steps" className="mb-8">
      <h2 id="next-steps" className="mb-3 text-xs font-medium tracking-wider text-muted uppercase">
        What happens next
      </h2>
      <ol className="grid grid-cols-3 gap-2 sm:gap-3">
        {STEPS.map(({ label, icon: Icon }, index) => (
          <li
            key={label}
            className="flex flex-col items-center gap-2 rounded-card border border-outline/70 bg-surface/60 px-2 py-3 text-center sm:flex-row sm:gap-3 sm:px-4 sm:text-left"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-bright">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="text-xs text-muted">Step {index + 1}</span>
              <span className="text-sm leading-tight font-medium">{label}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <span className="sr-only" role="status">
        Loading the request form…
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
