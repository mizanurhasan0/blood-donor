import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
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
import { LOCALE_TAG } from "@/lib/i18n/config";
import { formatDate, formatNumber, interpolate } from "@/lib/i18n/format";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { localeAlternates, localizedPath } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";

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

export async function generateMetadata({ params }: PageProps<"/[lang]/requests/[id]">): Promise<Metadata> {
  const t = await getDictionary();
  const lang = await getLocale();
  const request = await loadRequest((await params).id);
  if (!request) return { title: t.requests.notFound.title, robots: { index: false } };

  // Only non-identifying fields: never the phone, documents or the free-text description.
  const seo = t.requests.seo;
  const district = t.geo.districts[request.district];
  const units = interpolate(request.units === 1 ? seo.unitOne : seo.unitOther, {
    count: formatNumber(request.units, lang),
  });
  const title = interpolate(seo.title, {
    bloodGroup: request.bloodGroup,
    district,
    hospital: request.hospitalName,
  });
  const description = interpolate(seo.description, {
    units,
    bloodGroup: request.bloodGroup,
    hospital: request.hospitalName,
    district,
    date: formatDate(request.neededAt, lang, "long"),
  });
  const path = `/requests/${request.id}`;

  return {
    title,
    description,
    alternates: localeAlternates(lang, path),
    openGraph: {
      type: "article",
      siteName: SITE.name,
      locale: LOCALE_TAG[lang].replace("-", "_"),
      title,
      description,
      url: localizedPath(lang, path),
    },
    twitter: { card: "summary", title, description },
    robots: ROBOTS[request.status],
  };
}

export default async function RequestDetailPage({ params }: PageProps<"/[lang]/requests/[id]">) {
  const request = await loadRequest((await params).id);
  if (!request) notFound();

  const t = await getDictionary();
  const label = interpolate(t.requests.detail.crumb, {
    bloodGroup: request.bloodGroup,
    district: t.geo.districts[request.district],
  });
  const commentsOpen = request.status === "published" || request.status === "fulfilled";

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs id={request.id} label={label} />
      <div className="mt-6">
        <BloodRequestDetails request={request}>
          <div id="request-comments" className="scroll-mt-24">
            <Suspense
              fallback={
                <CommentSectionSkeleton heading={t.comments.heading} label={t.comments.section.loading} />
              }
            >
              <CommentSection requestId={request.id} commentsOpen={commentsOpen} />
            </Suspense>
          </div>
        </BloodRequestDetails>
      </div>
    </Container>
  );
}

async function Breadcrumbs({ id, label }: { id: string; label: string }) {
  const t = await getDictionary();
  const lang = await getLocale();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t.requests.breadcrumb.home,
        item: `${SITE.url}${localizedPath(lang, "/")}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t.requests.title,
        item: `${SITE.url}${localizedPath(lang, "/requests")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: label,
        item: `${SITE.url}${localizedPath(lang, `/requests/${id}`)}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escaped JSON built from enum values and translated names only (no user text).
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label={t.requests.breadcrumb.label}>
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
          <Crumb href="/">{t.requests.breadcrumb.home}</Crumb>
          <Crumb href="/requests">{t.requests.title}</Crumb>
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
      <LocalizedLink href={href} className="rounded transition-colors hover:text-foreground">
        {children}
      </LocalizedLink>
      <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
    </li>
  );
}
