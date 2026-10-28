import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/container";
import {
  BloodRequestFilters,
  BloodRequestFiltersSkeleton,
} from "@/features/requests/components/blood-request-filters";
import {
  BloodRequestListSkeleton,
  BloodRequestResults,
} from "@/features/requests/components/blood-request-list";
import { SITE } from "@/lib/constants/site";

const description =
  "Browse live blood requests from hospitals across Bangladesh. Filter by blood group, district and urgency to find someone you can help today.";

export const metadata: Metadata = {
  title: "Blood Requests",
  description,
  alternates: { canonical: "/requests" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: "Blood Requests",
    description,
    url: "/requests",
  },
};

export default function RequestsPage({ searchParams }: PageProps<"/requests">) {
  return (
    <PageContainer
      title="Blood Requests"
      description="People across Bangladesh who need blood right now. Filter by blood group and district to find a request you can help with."
      action={
        <ButtonLink href="/request/new">
          <Plus className="size-4" aria-hidden="true" />
          Post Request
        </ButtonLink>
      }
    >
      <div className="group/requests flex flex-col gap-6">
        <Suspense fallback={<BloodRequestFiltersSkeleton />}>
          <BloodRequestFilters />
        </Suspense>
        <Suspense fallback={<BloodRequestListSkeleton />}>
          <BloodRequestResults searchParams={searchParams} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
