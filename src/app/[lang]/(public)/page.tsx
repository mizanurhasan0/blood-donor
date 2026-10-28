import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunityStats, CommunityStatsSkeleton } from "@/components/home/community-stats";
import { HeroSection } from "@/components/home/hero-section";
import {
  RecentRequests,
  RecentRequestsSection,
  RecentRequestsSkeleton,
} from "@/components/home/recent-requests";
import { SiteJsonLd } from "@/components/shared/json-ld";
import { Container } from "@/components/ui/container";
import { localeAlternates } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  return {
    title: { absolute: t.common.siteTitle },
    alternates: localeAlternates(lang, "/"),
  };
}

async function DeletedNotice({ searchParams }: Pick<PageProps<"/[lang]">, "searchParams">) {
  const { deleted } = await searchParams;
  if (deleted !== "1") return null;
  const t = await getDictionary();
  return (
    <Container className="pt-4">
      <p
        role="status"
        className="flex items-center gap-2 rounded-card border border-success/30 bg-success/10 px-4 py-3 text-sm"
      >
        <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
        {t.home.deletedNotice}
      </p>
    </Container>
  );
}

export default async function HomePage({ searchParams }: PageProps<"/[lang]">) {
  const t = await getDictionary();
  return (
    <>
      <SiteJsonLd />
      <Suspense>
        <DeletedNotice searchParams={searchParams} />
      </Suspense>
      <HeroSection />
      <Suspense fallback={<CommunityStatsSkeleton t={t.home} />}>
        <CommunityStats />
      </Suspense>
      <RecentRequestsSection>
        <Suspense fallback={<RecentRequestsSkeleton />}>
          <RecentRequests />
        </Suspense>
      </RecentRequestsSection>
    </>
  );
}
