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
  // The on-chain claim stores the URL in a 128-byte field, so keep the path short:
  // base URL (~55) + "e/" + 16 hex + "-" + name (<=24) + ext stays under 110.
  const ext = (file.name.match(/\.[A-Za-z0-9]{1,5}$/)?.[0] ?? "").toLowerCase();
  const stem = file.name.replace(/\.[A-Za-z0-9]{1,5}$/, "").replace(/[^\w-]+/g, "_").slice(0, 24);
  void owner; // kept in the form for audit logs later; not part of the path
  const blob = await put(`e/${sha256.slice(0, 16)}-${stem}${ext}`, bytes, {
    access: "public",
    contentType: file.type || "application/octet-stream",
    addRandomSuffix: false,
  });
  return NextResponse.json({ url: blob.url, sha256, size: file.size });
}
