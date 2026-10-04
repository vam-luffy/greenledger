"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

// The wallet button reads browser state, so it must not render on the server.
const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const nav = [
  { href: "/supplier", label: "Supplier" },
  { href: "/verify", label: "Verifier" },
  { href: "/buyer", label: "Buyer" },
  { href: "/verifiers", label: "Verifiers" },
  { href: "/lookup", label: "Lookup" },
];

export function Header({ sticky = true }: { sticky?: boolean }) {
  return (
    <header
      className={`w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 ${
        sticky ? "sticky top-0 z-40" : ""
      }`}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-7 w-7 rounded-md" aria-hidden />
          <span className="text-lg font-semibold tracking-tight">GreenLedger</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            devnet
          </span>
        </Link>
        <nav className="order-last flex w-full items-center gap-4 overflow-x-auto text-sm sm:order-none sm:ml-auto sm:w-auto">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap hover:underline">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto shrink-0 sm:ml-0 [&_button]:!h-9 [&_button]:!whitespace-nowrap [&_button]:!px-3 [&_button]:!text-sm">
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
