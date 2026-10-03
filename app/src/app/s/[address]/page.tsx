"use client";

import { use, useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { QRCodeSVG } from "qrcode.react";
import { Header } from "@/components/Header";
import { ClaimTable, type ClaimRow } from "@/components/ClaimTable";
import { Card, Notice, Stat, inputCls } from "@/components/ui";
import { fetchClaims, fetchSupplier, summarize, type SupplierRecord } from "@/lib/fetch";
import { claimsToCsv, downloadText } from "@/lib/csv";
import { explorerUrl, formatDate, hexOf, kindLabel, sha256File, statusKey } from "@/lib/program";

export default function PublicSupplierPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const { connection } = useConnection();
  const [supplier, setSupplier] = useState<SupplierRecord | null | undefined>(undefined);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [docCheck, setDocCheck] = useState<{ name: string; hash: string; match: ClaimRow | null } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const pk = new PublicKey(address);
        const s = await fetchSupplier(connection, pk);
        setSupplier(s);
        if (s) setClaims(await fetchClaims(connection, pk));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setSupplier(null);
      }
    })();
  }, [address, connection]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const summary = summarize(claims);

  function exportCsv() {
    if (!supplier) return;
    downloadText(
      `greenledger-${supplier.gstin}.csv`,
      claimsToCsv(claims.map((claim) => ({ supplierName: supplier.name, gstin: supplier.gstin, claim })))
    );
  }

  async function copyLink() {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
        {supplier === undefined && !error && <p className="text-sm text-zinc-500">Loading on-chain record…</p>}
        {error && <Notice tone="err">{error}</Notice>}
        {supplier === null && !error && <Notice tone="err">No supplier is registered at this address.</Notice>}

        {supplier && (
          <>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Public ESG record
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">{supplier.name}</h1>
                <p className="mt-1 font-mono text-sm text-zinc-500">GSTIN {supplier.gstin} · {supplier.sector}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Registered {formatDate(supplier.createdAt)} ·{" "}
                  <a className="underline" href={explorerUrl(supplier.address.toBase58())} target="_blank" rel="noreferrer">
                    view on Solana Explorer
                  </a>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={copyLink} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
                    {copied ? "Copied" : "Copy share link"}
                  </button>
                  <button onClick={exportCsv} disabled={claims.length === 0} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900">
                    Export BRSR CSV
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                {pageUrl && <QRCodeSVG value={pageUrl} size={128} bgColor="transparent" fgColor="currentColor" />}
                <span className="text-xs text-zinc-500">Scan to verify</span>
              </div>
            </div>

            <Card title="Attestation summary">
              <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-5">
                <Stat label="Claims" value={String(summary.total)} />
                <Stat label="Verified" value={String(summary.verified)} />
                <Stat label="Pending" value={String(summary.pending)} />
                <Stat label="Rejected" value={String(summary.rejected)} />
                <Stat label="Verification rate" value={summary.score === null ? "-" : `${summary.score}%`} />
              </dl>
              {summary.verified > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  {summary.verified} claim{summary.verified === 1 ? "" : "s"} verified on-chain, last on {formatDate(summary.lastVerified)}
                </div>
              )}
            </Card>

            <Card title="Check a document">
              <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                Been sent an invoice or certificate by this supplier? Drop it here. It is hashed in your browser and
                compared with every claim on this page. Nothing is uploaded.
              </p>
              <input
                type="file"
                className={inputCls}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const h = hexOf(await sha256File(f));
                  const hit = claims.find((c) => hexOf(c.evidenceHash) === h);
                  setDocCheck({ name: f.name, hash: h, match: hit ?? null });
                }}
              />
              {docCheck && (
                <div className="mt-3">
                  {docCheck.match ? (
                    <Notice tone="ok">
                      <strong>{docCheck.name}</strong> is the evidence behind claim #{docCheck.match.index.toString()} (
                      {kindLabel(docCheck.match.kind)}), status{" "}
                      <strong className="capitalize">{statusKey(docCheck.match.status)}</strong>.
                    </Notice>
                  ) : (
                    <Notice tone="err">
                      <strong>{docCheck.name}</strong> does not match any claim on this record. Its hash is{" "}
                      <span className="font-mono text-xs">{docCheck.hash.slice(0, 16)}…</span>. Either the document was
                      altered or it was never submitted for verification.
                    </Notice>
                  )}
                </div>
              )}
            </Card>

            <Card title="Claims">
              <ClaimTable claims={claims} emptyText="No claims recorded yet." />
            </Card>

            <p className="text-xs text-zinc-500">
              Every row above is a Solana account signed by the supplier and, where verified, by an accredited verifier.
              The evidence hash lets anyone confirm that a document they are shown is the one the verifier reviewed.
            </p>
          </>
        )}
      </main>
    </>
  );
}
