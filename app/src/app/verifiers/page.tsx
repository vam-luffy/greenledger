"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Header } from "@/components/Header";
import { Notice } from "@/components/ui";
import { fetchAllVerifiers, type VerifierRecord } from "@/lib/fetch";
import { explorerUrl, formatDate, short } from "@/lib/program";

export default function VerifiersPage() {
  const { connection } = useConnection();
  const [verifiers, setVerifiers] = useState<VerifierRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllVerifiers(connection).then(setVerifiers).catch((e) => setError(String(e)));
  }, [connection]);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Accredited verifiers</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Only wallets approved by the registry can attest to claims. Their accreditation and every attestation they
            sign are public, so a buyer can judge who stands behind a number.
          </p>
        </div>

        {error && <Notice tone="err">{error}</Notice>}
        {verifiers === null && !error && <p className="text-sm text-zinc-500">Loading…</p>}
        {verifiers && verifiers.length === 0 && <Notice>No verifiers have been approved on this cluster yet.</Notice>}

        {verifiers && verifiers.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {verifiers.map((v) => (
              <div key={v.address.toBase58()} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{v.name}</h2>
                    <p className="font-mono text-xs text-zinc-500">{v.accreditation}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${v.active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                    {v.active ? "Active" : "Suspended"}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-zinc-500">Attestations</dt>
                    <dd className="text-lg font-semibold">{v.verifiedCount.toString()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-zinc-500">Approved</dt>
                    <dd>{formatDate(v.createdAt)}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-zinc-500">
                  Signing wallet{" "}
                  <a className="font-mono underline" href={explorerUrl(v.authority.toBase58())} target="_blank" rel="noreferrer">
                    {short(v.authority, 6)}
                  </a>
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
