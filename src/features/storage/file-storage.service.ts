import "server-only";
import { AwsClient } from "aws4fetch";
import { env } from "@/lib/env";
import { AppError } from "@/lib/utils/result";

/**
 * Private S3-compatible storage (Cloudflare R2, Backblaze B2, MinIO, AWS S3)
 * using signed requests. The bucket must not allow public reads; documents are
 * only ever streamed back through an authorised route.
 */
let client: AwsClient | undefined;

function storage() {
  const config = env("storage");
  client ??= new AwsClient({
    accessKeyId: config.STORAGE_ACCESS_KEY,
    secretAccessKey: config.STORAGE_SECRET_KEY,
    service: "s3",
    region: config.STORAGE_REGION,
  });
  const base = `${config.STORAGE_ENDPOINT.replace(/\/$/, "")}/${config.STORAGE_BUCKET}`;
  return {
    client,
    objectUrl: (key: string) => `${base}/${key.split("/").map(encodeURIComponent).join("/")}`,
  };
}

async function send(key: string, init: RequestInit & { allow404?: boolean }): Promise<Response> {
  const { client, objectUrl } = storage();
  const response = await client.fetch(objectUrl(key), init);
  if (!response.ok && !(init.allow404 && response.status === 404)) {
    throw new AppError("storageUnavailable", "UNAVAILABLE");
  }
  return response;
}

export async function putObject(key: string, body: Uint8Array, contentType: string): Promise<void> {
  await send(key, {
    method: "PUT",
    body: body as BodyInit,
    headers: { "Content-Type": contentType, "Content-Length": String(body.byteLength) },
  });
}

export async function headObject(key: string): Promise<{ contentType: string; size: number } | null> {
  const response = await send(key, { method: "HEAD", allow404: true });
  if (response.status === 404) return null;
  return {
    contentType: response.headers.get("content-type") ?? "application/octet-stream",
    size: Number(response.headers.get("content-length") ?? 0),
  };
}

export async function getObject(key: string): Promise<Response | null> {
  const response = await send(key, { method: "GET", allow404: true });
  return response.status === 404 ? null : response;
}

export async function deleteObject(key: string): Promise<void> {
  await send(key, { method: "DELETE", allow404: true });
}
