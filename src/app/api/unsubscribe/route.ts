import { verifyUnsubscribeToken } from "@/features/notifications/email.service";
import { unsubscribeUser } from "@/features/donors/donor.service";

/** RFC 8058 one-click unsubscribe target (mail clients POST here directly). */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("u") ?? "";
  const token = url.searchParams.get("t") ?? "";
  if (!verifyUnsubscribeToken(userId, token)) return new Response("Invalid link", { status: 400 });
  await unsubscribeUser(userId);
  return new Response("Unsubscribed");
}
