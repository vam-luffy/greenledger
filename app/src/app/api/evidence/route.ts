import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Stores an evidence document and returns its public URL plus the SHA-256
 * the server computed, so the client can confirm the hash it will put on-chain
 * is the hash of the bytes that were actually stored.
 */
export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Evidence storage is not configured" }, { status: 503 });
  }
  const form = await req.formData();
  const file = form.get("file");
  const owner = String(form.get("owner") ?? "anon");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 10 MB" }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const safeName = file.name.replace(/[^\w.-]+/g, "_").slice(0, 80);
  const blob = await put(`evidence/${owner}/${sha256.slice(0, 16)}-${safeName}`, bytes, {
    access: "public",
    contentType: file.type || "application/octet-stream",
    addRandomSuffix: false,
  });
  return NextResponse.json({ url: blob.url, sha256, size: file.size });
}
