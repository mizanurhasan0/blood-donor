import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunityStats, CommunityStatsSkeleton } from "@/components/home/community-stats";
import { DonorCallToAction } from "@/components/home/donor-cta";
import { HeroSection } from "@/components/home/hero-section";
import {
  RecentRequests,
  RecentRequestsSection,
  RecentRequestsSkeleton,
} from "@/components/home/recent-requests";
import { Container } from "@/components/ui/container";
import { SiteJsonLd } from "@/components/shared/json-ld";
import { SITE } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: { absolute: SITE.title },
  alternates: { canonical: "/" },
};

async function DeletedNotice({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { deleted } = await searchParams;
  if (deleted !== "1") return null;
  return (
    <Container className="pt-4">
      <p
        role="status"
        className="flex items-center gap-2 rounded-card border border-success/30 bg-success/10 px-4 py-3 text-sm"
      >
        <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
        Your account and personal data have been deleted.
      </p>
    </Container>
  );
}

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <SiteJsonLd />
      <Suspense>
        <DeletedNotice searchParams={searchParams} />
      </Suspense>
      <HeroSection />
      <Suspense fallback={<CommunityStatsSkeleton />}>
        <CommunityStats />
      </Suspense>
      <RecentRequestsSection>
        <Suspense fallback={<RecentRequestsSkeleton />}>
          <RecentRequests />
        </Suspense>
      </RecentRequestsSection>
      <DonorCallToAction />
    </>
  );
}
