import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageContainer } from "@/components/ui/container";
import { requireViewerOrRedirect } from "@/features/auth/viewer";
import { ModerationFeedbackProvider } from "@/features/moderation/components/moderation-feedback";
import { ModerationQueue, ModerationQueueSkeleton } from "@/features/moderation/components/moderation-queue";
import { ModerationTabs, parseModerationView } from "@/features/moderation/components/moderation-tabs";
import {
  NotificationSummary,
  NotificationSummarySkeleton,
} from "@/features/moderation/components/notification-summary";
import {
  ReportedComments,
  ReportedCommentsSkeleton,
} from "@/features/moderation/components/reported-comments";

// Blocks on the server so guests get a real redirect and non-admins a real 404.
export const instant = false;

export const metadata: Metadata = {
  title: "Moderation",
  robots: { index: false, follow: false },
};

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewerOrRedirect("/admin/requests");
  if (!viewer.isAdmin) notFound();
  const view = parseModerationView((await searchParams).view);

  return (
    <PageContainer
      title="Moderation"
      description="Review new requests, handle reports and check that notifications are being delivered."
    >
      <ModerationFeedbackProvider>
        <div className="flex flex-col gap-8">
          <Suspense fallback={<NotificationSummarySkeleton />}>
            <NotificationSummary />
          </Suspense>
          <ModerationTabs current={view} />
          <Suspense key={view} fallback={<ModerationQueueSkeleton />}>
            <ModerationQueue view={view} />
          </Suspense>
          {view === "reported" && (
            <Suspense fallback={<ReportedCommentsSkeleton />}>
              <ReportedComments />
            </Suspense>
          )}
        </div>
      </ModerationFeedbackProvider>
    </PageContainer>
  );
}
