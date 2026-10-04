"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// The wallet and connection providers pull in @solana/web3.js, which must not
// be evaluated during the server render. Load them in the browser only.
const SolanaProvider = dynamic(
  async () => (await import("./SolanaProvider")).SolanaProvider,
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  return <SolanaProvider>{children}</SolanaProvider>;
}
