"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

// The wallet button reads browser state, so it must not render on the server.
const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function Header() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-7 w-7 rounded-md" aria-hidden />
          <span className="text-lg font-semibold tracking-tight">GreenLedger</span>
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            devnet
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/supplier" className="hover:underline">Supplier</Link>
          <Link href="/verify" className="hover:underline">Verifier</Link>
          <Link href="/buyer" className="hover:underline">Buyer</Link>
          <Link href="/verifiers" className="hidden hover:underline sm:inline">Verifiers</Link>
          <Link href="/lookup" className="hover:underline">Lookup</Link>
          <WalletMultiButton />
        </nav>
      </div>
    </header>
  );
}
