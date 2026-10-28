import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache, Suspense } from "react";
import { Container } from "@/components/ui/container";
import { getViewer } from "@/features/auth/viewer";
import { CommentSection, CommentSectionSkeleton } from "@/features/comments/components/comment-section";
import { BloodRequestDetails } from "@/features/requests/components/blood-request-details";
import { getPublicRequest } from "@/features/requests/request.queries";
import { getManagedRequest } from "@/features/requests/request.service";
import type { RequestDetail } from "@/features/requests/types";
import { SITE, type RequestStatus } from "@/lib/constants/site";
import { formatLongDate } from "@/lib/utils/dates";

// Blocks on the server so unknown ids get a real 404 and crawlers get full metadata.
export const instant = false;

const ID_PATTERN = /^[a-f\d]{24}$/i;

/** Public request, or the owner's/admin's own pending or rejected one. Shared by metadata and page. */
const loadRequest = cache(async (id: string): Promise<RequestDetail | null> => {
  if (!ID_PATTERN.test(id)) return null;
  await connection();
  const request = await getPublicRequest(id);
  if (request) return request;
  const viewer = await getViewer();
  return viewer ? getManagedRequest(viewer, id) : null;
});

const ROBOTS: Record<RequestStatus, Metadata["robots"]> = {
  published: { index: true, follow: true },
  fulfilled: { index: false, follow: true },
  expired: { index: false, follow: true },
  pending: { index: false, follow: false },
  rejected: { index: false, follow: false },
};

export async function generateMetadata({ params }: PageProps<"/requests/[id]">): Promise<Metadata> {
  const request = await loadRequest((await params).id);
  if (!request) return { title: "Request not found", robots: { index: false } };

  // Only non-identifying fields: never the phone, documents or the free-text description.
  const title = `${request.bloodGroup} blood needed in ${request.district} — ${request.hospitalName}`;
  const units = `${request.units} ${request.units === 1 ? "unit" : "units"}`;
  const description = `${units} of ${request.bloodGroup} blood needed at ${request.hospitalName}, ${request.district} by ${formatLongDate(request.neededAt)}. Can you help?`;
  const url = `/requests/${request.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", siteName: SITE.name, locale: SITE.locale, title, description, url },
    twitter: { card: "summary", title, description },
    robots: ROBOTS[request.status],
  };
}

export default async function RequestDetailPage({ params }: PageProps<"/requests/[id]">) {
  const request = await loadRequest((await params).id);
  if (!request) notFound();

  const label = `${request.bloodGroup} in ${request.district}`;
  const commentsOpen = request.status === "published" || request.status === "fulfilled";

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs id={request.id} label={label} />
      <div className="mt-6">
        <BloodRequestDetails request={request}>
          <div id="request-comments" className="scroll-mt-24">
            <Suspense fallback={<CommentSectionSkeleton />}>
              <CommentSection requestId={request.id} commentsOpen={commentsOpen} />
            </Suspense>
          </div>
        </BloodRequestDetails>
      </div>
    </Container>
  );
}

function Breadcrumbs({ id, label }: { id: string; label: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
      { "@type": "ListItem", position: 2, name: "Blood Requests", item: `${SITE.url}/requests` },
      { "@type": "ListItem", position: 3, name: label, item: `${SITE.url}/requests/${id}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escaped JSON built from enum values only (blood group, district).
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
          <Crumb href="/">Home</Crumb>
          <Crumb href="/requests">Blood Requests</Crumb>
          <li aria-current="page" className="font-medium text-foreground">
            {label}
          </li>
        </ol>
      </nav>
    </>
  );
}

function Crumb({ href, children }: { href: string; children: string }) {
  return (
    <li className="flex items-center gap-1">
      <Link href={href} className="rounded transition-colors hover:text-foreground">
        {children}
      </Link>
      <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
    </li>
  );
}
