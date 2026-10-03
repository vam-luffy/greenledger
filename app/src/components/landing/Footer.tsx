import Link from "next/link";

const links = [
  { href: "/supplier", label: "Supplier" },
  { href: "/verify", label: "Verifier" },
  { href: "/buyer", label: "Buyer" },
  { href: "/verifiers", label: "Verifiers" },
  { href: "/lookup", label: "Lookup" },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" aria-hidden className="h-6 w-6 rounded-md" />
          <span className="font-semibold tracking-tight">GreenLedger</span>
          <span className="text-sm text-zinc-500">ESG attestations on Solana</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-emerald-700 dark:hover:text-emerald-400">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
        Built for the Colosseum Crypto World&apos;s Fair, September to October 2026.
      </p>
    </footer>
  );
}
