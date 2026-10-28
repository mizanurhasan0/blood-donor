import { MailX } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { UnsubscribeConfirm } from "@/features/donors/components/notification-preferences";
import { localeAlternates } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  const lang = await getLocale();
  return {
    title: t.donor.unsubscribe.metaTitle,
    alternates: localeAlternates(lang, "/unsubscribe"),
    robots: { index: false, follow: false },
  };
}

type SearchParams = PageProps<"/[lang]/unsubscribe">["searchParams"];

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

async function UnsubscribeArea({ searchParams }: { searchParams: SearchParams }) {
  const t = await getDictionary();
  const copy = t.donor.unsubscribe;
  const params = await searchParams;
  const userId = first(params.u);
  const token = first(params.t);
  if (!userId || !token) {
    return (
      <div role="alert" className="flex flex-col gap-3">
        <p className="text-sm">{copy.incomplete}</p>
        <ButtonLink href="/account#notifications" variant="secondary">
          {copy.manageAlerts}
        </ButtonLink>
      </div>
    );
  }
  return <UnsubscribeConfirm userId={userId} token={token} />;
}

export default async function UnsubscribePage({ searchParams }: PageProps<"/[lang]/unsubscribe">) {
  const t = await getDictionary();
  const copy = t.donor.unsubscribe;
  return (
    <Container className="flex flex-1 items-center justify-center py-12 sm:py-20">
      <Card className="flex w-full max-w-md flex-col gap-6 p-6 text-center sm:p-8">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand/15 text-brand-bright">
          <MailX className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{copy.heading}</h1>
          <p className="text-sm text-muted">{copy.text}</p>
        </div>
        <Suspense fallback={<Skeleton className="mx-auto h-11 w-48 rounded-pill" />}>
          <UnsubscribeArea searchParams={searchParams} />
        </Suspense>
      </Card>
    </Container>
  );
}
