"use client";

import { ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { localTestWallets } from "@/lib/testWallet";

import "@solana/wallet-adapter-react-ui/styles.css";

export const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;

/**
 * HTTP RPC goes through the same-origin /api/rpc proxy so the provider key
 * stays on the server. WebSocket subscriptions cannot be proxied by a route
 * handler, so they use the public devnet socket; web3.js also polls, so a
 * slow socket only delays confirmation notices, never correctness.
 */
function rpcEndpoint(): string {
  if (process.env.NEXT_PUBLIC_SOLANA_RPC) return process.env.NEXT_PUBLIC_SOLANA_RPC;
  if (typeof window !== "undefined") return `${window.location.origin}/api/rpc`;
  return clusterApiUrl(SOLANA_NETWORK);
}
export const SOLANA_WS = "wss://api.devnet.solana.com/";

/**
 * The public devnet RPC answers 429 under modest load. Retry those with
 * backoff so a page load does not fail because two fetches overlapped.
 */
const retryingFetch: typeof fetch = async (input, init) => {
  let delay = 400;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(input, init);
    if (res.status !== 429 || attempt >= 5) return res;
    await new Promise((r) => setTimeout(r, delay + Math.random() * 200));
    delay *= 2;
  }
};

export function SolanaProvider({ children }: { children: ReactNode }) {
  // Wallet Standard wallets (Phantom, Solflare, Backpack) register themselves.
  // Local test wallets appear only on localhost with an explicit env var.
  const wallets = useMemo(() => localTestWallets(), []);
  const endpoint = useMemo(() => rpcEndpoint(), []);
  const config = useMemo(
    () => ({ commitment: "confirmed" as const, fetch: retryingFetch, wsEndpoint: SOLANA_WS }),
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint} config={config}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
