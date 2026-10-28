import { connection } from "next/server";
import { getDb } from "@/lib/db/client";

/** Liveness + database reachability for Docker and uptime checks. */
export async function GET() {
  await connection();
  try {
    await (await getDb()).command({ ping: 1 });
    return Response.json({ status: "ok", database: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "degraded", database: "unreachable" }, { status: 503 });
  }
}
