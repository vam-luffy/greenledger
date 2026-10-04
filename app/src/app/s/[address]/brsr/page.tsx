"use client";

import dynamic from "next/dynamic";

// Loaded client-only so the Solana client libraries never run in the server render.
const View = dynamic(() => import("./View"), {
  ssr: false,
  loading: () => <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-zinc-500">Loading…</div>,
});

export default function Page({ params }: { params: Promise<{ address: string }> }) {
  return <View params={params} />;
}
