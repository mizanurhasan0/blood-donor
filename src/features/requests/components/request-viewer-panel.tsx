import { ExternalLink, FileText, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getViewer } from "@/features/auth/viewer";
import {
  canManageRequest,
  canMarkFulfilled,
  canRevealPhone,
  canViewDocument,
  isOwner,
  type Actor,
  type RequestAccessInfo,
} from "../permissions";
import { toActor } from "../request.service";
import type { RequestDetail } from "../types";
import { ContactReveal, type ContactAccess } from "./contact-reveal";
import { ReportRequestButton } from "./report-request-button";
import { RequestOwnerActions } from "./request-owner-actions";

/*
 * Viewer-dependent parts of the detail page. Each reads the (request-cached)
 * viewer, so render them inside <Suspense> to let the request itself stream first.
 */

function accessInfo(request: RequestDetail): RequestAccessInfo {
  return {
    creatorId: request.creatorId,
    status: request.status,
    allowPhoneReveal: request.allowPhoneReveal,
    shareDocumentWithDonors: request.shareDocumentWithDonors,
    hasDocument: request.hasDocument,
  };
}

function contactAccess(actor: Actor | null, info: RequestAccessInfo): ContactAccess {
  if (canRevealPhone(actor, info)) return "allowed";
  if (info.status !== "published") return "closed";
  if (!actor) return "guest";
  if (!actor.isDonor) return "needs-donor";
  return "hidden";
}

export async function ViewerContact({ request }: { request: RequestDetail }) {
  const actor = toActor(await getViewer());
  return <ContactReveal requestId={request.id} access={contactAccess(actor, accessInfo(request))} />;
}

export async function ViewerActions({ request }: { request: RequestDetail }) {
  const actor = toActor(await getViewer());
  const info = accessInfo(request);
  return (
    <>
      {request.hasDocument && (
        <DocumentCard
          requestId={request.id}
          canView={canViewDocument(actor, info)}
          sharedWithDonors={info.shareDocumentWithDonors && info.status === "published"}
        />
      )}
      {canManageRequest(actor, info) && (
        <RequestOwnerActions requestId={request.id} canMarkFulfilled={canMarkFulfilled(actor, info)} />
      )}
      {actor && !isOwner(actor, info) && <ReportRequestButton requestId={request.id} />}
    </>
  );
}

function DocumentCard({
  requestId,
  canView,
  sharedWithDonors,
}: {
  requestId: string;
  canView: boolean;
  sharedWithDonors: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <FileText className="size-4 text-muted" aria-hidden="true" />
        Supporting document
      </h2>
      {canView ? (
        <a
          href={`/api/documents/${requestId}`}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-outline px-5 text-sm font-medium transition-colors hover:border-muted hover:bg-surface"
        >
          View document
          <ExternalLink className="size-4" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : (
        <p className="flex gap-2 text-sm text-muted">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {sharedWithDonors
            ? "The requester shared a document with registered donors. Sign in with a donor account to view it."
            : "A document was provided. It is private to the requester and moderators."}
        </p>
      )}
    </Card>
  );
}

export function ViewerContactSkeleton() {
  return <Skeleton className="h-11 w-full rounded-pill" />;
}
