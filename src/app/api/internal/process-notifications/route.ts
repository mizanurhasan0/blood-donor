import { env, isConfigured } from "@/lib/env";
import { hasBearer, jsonError } from "@/lib/utils/http";
import { invalidateRequests } from "@/features/requests/cache";
import { expireOutdatedRequests } from "@/features/requests/request.service";
import { processNotificationJobs } from "@/features/notifications/notification.service";

/**
 * Background worker endpoint, called every minute by the cron container
 * (see docker-compose.yml) with `Authorization: Bearer $NOTIFICATION_CRON_SECRET`.
 * Expires outdated requests, then delivers a bounded batch of due jobs.
 */
export async function POST(request: Request) {
  if (!isConfigured("cron") || !hasBearer(request, env("cron").NOTIFICATION_CRON_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const expired = await expireOutdatedRequests();
    if (expired.length) invalidateRequests(expired, "background");
    const summary = await processNotificationJobs();
    if (summary.failed) console.warn(`[notifications] ${summary.failed} job(s) failed permanently`);
    return Response.json({ expired: expired.length, ...summary });
  } catch (error) {
    return jsonError(error);
  }
}
