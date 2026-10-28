import { MailX } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { UnsubscribeConfirm } from "@/features/donors/components/notification-preferences";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

type SearchParams = PageProps<"/unsubscribe">["searchParams"];

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

async function UnsubscribeArea({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const userId = first(params.u);
  const token = first(params.t);
  if (!userId || !token) {
    return (
      <div role="alert" className="flex flex-col gap-3">
        <p className="text-sm">
          This unsubscribe link is incomplete. You can turn off email alerts from your account.
        </p>
        <ButtonLink href="/account#notifications" variant="secondary">
          Manage alerts
        </ButtonLink>
      </div>
    );
  }
  return <UnsubscribeConfirm userId={userId} token={token} />;
}

export default function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  return (
    <Container className="flex flex-1 items-center justify-center py-12 sm:py-20">
      <Card className="flex w-full max-w-md flex-col gap-6 p-6 text-center sm:p-8">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand/15 text-brand-bright">
          <MailX className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Stop blood request emails?</h1>
          <p className="text-sm text-muted">
            You&apos;ll stop getting emails about requests that match your blood group. Your donor profile
            stays active, and you can turn alerts back on from your account at any time.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="mx-auto h-11 w-48 rounded-pill" />}>
          <UnsubscribeArea searchParams={searchParams} />
        </Suspense>
      </Card>
    </Container>
  );
}
