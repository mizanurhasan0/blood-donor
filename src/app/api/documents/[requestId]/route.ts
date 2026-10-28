import { getViewer } from "@/features/auth/viewer";
import { getDocumentForViewer } from "@/features/requests/request.service";
import { getObject } from "@/features/storage/file-storage.service";
import { jsonError } from "@/lib/utils/http";

/**
 * Streams a private document to an authorised viewer (owner, admin, or a
 * donor when the requester allowed sharing). Never cached; images render
 * inline in a sandbox, PDFs download.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/documents/[requestId]">) {
  try {
    const { requestId } = await ctx.params;
    const viewer = await getViewer();
    if (!viewer) return Response.json({ error: "pleaseSignIn" }, { status: 401 });

    const document = await getDocumentForViewer(viewer, requestId);
    if (!document) return Response.json({ error: "notFound" }, { status: 404 });

    const object = await getObject(document.key);
    if (!object?.body) return Response.json({ error: "notFound" }, { status: 404 });

    const isPdf = document.contentType === "application/pdf";
    const extension = document.key.split(".").pop();
    return new Response(object.body, {
      headers: {
        "Content-Type": document.contentType,
        "Content-Length": String(document.size),
        "Content-Disposition": `${isPdf ? "attachment" : "inline"}; filename="bloodlink-document.${extension}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
