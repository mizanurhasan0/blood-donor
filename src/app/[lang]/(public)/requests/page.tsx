import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  BloodRequestFilters,
  BloodRequestFiltersSkeleton,
} from "@/features/requests/components/blood-request-filters";
import {
  BloodRequestListSkeleton,
  BloodRequestResults,
} from "@/features/requests/components/blood-request-list";
import { SITE } from "@/lib/constants/site";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { localeAlternates, localizedPath } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  const lang = await getLocale();
  const { title, listDescription: description } = t.requests;

  return {
    title,
    description,
    alternates: localeAlternates(lang, "/requests"),
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: LOCALE_TAG[lang].replace("-", "_"),
      title,
      description,
      url: localizedPath(lang, "/requests"),
    },
  };
}

export default async function RequestsPage({ searchParams }: PageProps<"/[lang]/requests">) {
  const t = await getDictionary();
  return (
    <Container className="py-6 sm:py-10">
      {/* Visually hidden: keeps one level-1 heading for screen readers and search engines. */}
      <h1 className="sr-only">{t.requests.title}</h1>
      <div className="group/requests flex flex-col gap-6">
        <Suspense fallback={<BloodRequestFiltersSkeleton />}>
          <BloodRequestFilters
            action={
              <ButtonLink
                href="/request/new"
                aria-label={t.common.postRequest}
                className="shrink-0 px-4 sm:px-5"
              >
                <Plus className="size-4" aria-hidden="true" />
                <span className="sm:hidden">{t.requests.postShort}</span>
                <span className="hidden sm:inline">{t.common.postRequest}</span>
              </ButtonLink>
            }
          />
        </Suspense>
        <Suspense fallback={<BloodRequestListSkeleton label={t.requests.list.loading} />}>
          <BloodRequestResults searchParams={searchParams} />
        </Suspense>
      </div>
    </Container>
  );
}
