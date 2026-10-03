import Link from "next/link";
import { Header } from "@/components/Header";

const steps = [
  {
    title: "Supplier records a claim",
    body: "Energy, Scope 1 and 2 emissions, renewable certificates, water, waste. Each claim carries the SHA-256 hash of its evidence document.",
  },
  {
    title: "Accredited verifier attests",
    body: "An approved verifier checks the evidence and signs an on-chain approval or rejection. The attestation is permanent and public.",
  },
  {
    title: "Buyer looks it up",
    body: "Any procurement team pastes the supplier's wallet or GSTIN and sees every claim, who verified it, and when. No PDF chasing.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-16">
        <section className="flex flex-col gap-6">
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            ESG attestations on Solana
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Turn supplier ESG spreadsheets into verifiable on-chain records.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Indian MSMEs are being asked for BRSR and CSRD data by every large buyer.
            GreenLedger lets a supplier record a claim once, get it attested by an
            accredited verifier, and share a single link that any buyer can trust.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/supplier"
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Register as a supplier
            </Link>
            <Link
              href="/lookup"
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Look up a supplier
            </Link>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                {i + 1}
              </div>
              <h2 className="mb-2 font-semibold">{s.title}</h2>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{s.body}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
        Built for the Colosseum Crypto World&apos;s Fair, September to October 2026.
      </footer>
    </>
  );
}
