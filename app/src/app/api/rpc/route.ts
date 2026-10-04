import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Same-origin JSON-RPC proxy so the browser never sees the RPC provider key.
 * Falls back to the public devnet endpoint when SOLANA_RPC is not configured.
 */
const UPSTREAM = process.env.SOLANA_RPC ?? "https://api.devnet.solana.com";
const MAX_BODY = 256 * 1024;

export async function POST(req: Request) {
  const body = await req.text();
  if (body.length > MAX_BODY) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }
  const upstream = await fetch(UPSTREAM, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    cache: "no-store",
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
}
