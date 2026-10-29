import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
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
import { localeAlternates } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";

// Blocks on the server so guests get a real redirect and non-admins a real 404.
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const [t, lang] = await Promise.all([getDictionary(), getLocale()]);
  return {
    title: t.moderation.pageTitle,
    robots: { index: false, follow: false },
    alternates: localeAlternates(lang, "/admin/requests"),
  };
}

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewerOrRedirect("/admin/requests");
  if (!viewer.isAdmin) notFound();
  const view = parseModerationView((await searchParams).view);
  const t = await getDictionary();

  return (
    <Container className="py-6 sm:py-10">
      {/* Visually hidden: keeps one level-1 heading for screen readers and search engines. */}
      <h1 className="sr-only">{t.moderation.pageTitle}</h1>
      <ModerationFeedbackProvider text={t.moderation}>
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
    </Container>
  );
}
