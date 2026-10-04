"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import type { ClaimRow } from "@/components/ClaimTable";
import { Notice } from "@/components/ui";
import { fetchClaims, fetchSupplier, type SupplierRecord } from "@/lib/fetch";
import { downloadText } from "@/lib/csv";
import { explorerUrl, short } from "@/lib/program";
import { BRSR_ATTRIBUTES, kindName, statusLabel, type BrsrEvidence, type BrsrStatus } from "@/lib/brsr";
import { brsrCsvFor, brsrFilename, supplierBrsrReport } from "@/lib/brsrClaims";

const fmt = (n: number, dp = 3) => n.toLocaleString("en-IN", { maximumFractionDigits: dp });

function Addr({ a }: { a: string | null }) {
  if (!a) return <span className="text-zinc-400">-</span>;
  return (
    <a
      href={explorerUrl(a)}
      target="_blank"
      rel="noreferrer"
      className="font-mono underline decoration-zinc-300 underline-offset-2 print:no-underline"
      title={a}
    >
      {short(a, 6)}
    </a>
  );
}

function Status({ s }: { s: BrsrStatus }) {
  const cls =
    s === "verified"
      ? "bg-emerald-100 text-emerald-900"
      : s === "rejected"
        ? "bg-red-100 text-red-900"
        : "bg-amber-100 text-amber-900";
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-medium print:border print:border-current ${cls}`}>
      {statusLabel(s)}
    </span>
  );
}

function Proof({ e }: { e: BrsrEvidence }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-2 text-[11px] leading-5 text-zinc-600">
      <span>Claim</span>
      <Addr a={e.claimAddress} />
      <span>Verifier</span>
      <span>
        <Addr a={e.verifier} /> {e.verifiedOn && <span>on {e.verifiedOn}</span>}
      </span>
      <span>SHA-256</span>
      <span className="break-all font-mono">{e.evidenceSha256}</span>
    </div>
  );
}

export default function BrsrReportView({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const { connection } = useConnection();
  const [supplier, setSupplier] = useState<SupplierRecord | null | undefined>(undefined);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt] = useState(() => new Date());

  useEffect(() => {
    (async () => {
      try {
        const pk = new PublicKey(address);
        const s = await fetchSupplier(connection, pk);
        if (s) setClaims(await fetchClaims(connection, pk));
        setSupplier(s);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setSupplier(null);
      }
    })();
  }, [address, connection]);

  const report = useMemo(
    () => (supplier ? supplierBrsrReport(supplier, claims, generatedAt) : null),
    [supplier, claims, generatedAt]
  );

  function exportCsv() {
    if (!supplier) return;
    downloadText(brsrFilename(supplier.gstin), brsrCsvFor([{ supplier, claims }]), "text/csv;charset=utf-8");
  }

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/s/${address}` : `/s/${address}`;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 bg-white px-6 py-8 text-zinc-900 print:max-w-none print:px-0 print:py-0">
      <div className="mb-6 flex flex-wrap items-center gap-2 print:hidden">
        <Link href={`/s/${address}`} className="text-sm text-zinc-600 hover:underline">
          ← Back to supplier record
        </Link>
        <div className="flex-1" />
        <button
          onClick={exportCsv}
          disabled={!report}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-40"
        >
          Download BRSR Core CSV
        </button>
        <button
          onClick={() => window.print()}
          disabled={!report}
          className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-40"
        >
          Print / Save as PDF
        </button>
      </div>

      {supplier === undefined && !error && <p className="text-sm text-zinc-500">Loading on-chain record…</p>}
      {error && <Notice tone="err">{error}</Notice>}
      {supplier === null && !error && <Notice tone="err">No supplier is registered at this address.</Notice>}

      {supplier && report && (
        <article>
          <header className="flex flex-col gap-4 border-b-2 border-zinc-900 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
                BRSR Core · Value-chain ESG disclosure
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{supplier.name}</h1>
              <p className="mt-1 font-mono text-sm">GSTIN {supplier.gstin}</p>
              <p className="text-sm text-zinc-600">{supplier.sector}</p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-xs text-zinc-600 sm:text-right">
              <dt>Generated</dt>
              <dd>
                {generatedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST
              </dd>
              <dt>Supplier record</dt>
              <dd>
                <Addr a={report.supplier.address} />
              </dd>
              <dt>Network</dt>
              <dd>Solana devnet</dd>
            </dl>
          </header>

          <p className="mt-4 text-xs leading-5 text-zinc-600">
            Figures follow SEBI&apos;s BRSR Core format (Annexure I, circular of 12 July 2023): Attribute 1 GHG
            footprint, Attribute 2 Water footprint, Attribute 3 Energy footprint, Attribute 4 Embracing circularity.
            Only claims attested by an accredited verifier count toward the figures. Pending and rejected claims are
            listed separately and are not summed. Energy is converted at 1 kWh = 0.0036 GJ and 1 MWh = 3.6 GJ.
          </p>

          {report.periods.length === 0 && <p className="mt-6 text-sm text-zinc-500">No claims recorded yet.</p>}

          {report.periods.map((p) => (
            <section key={`${p.periodStart}-${p.periodEnd}`} className="mt-8">
              <h2 className="text-lg font-semibold">Reporting period: {p.label}</h2>

              <div className="overflow-x-auto">
                <table className="mt-3 w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-400 text-[11px] uppercase tracking-wide text-zinc-500">
                      <th className="py-2 pr-3 font-medium">Attribute</th>
                      <th className="py-2 pr-3 font-medium">Parameter</th>
                      <th className="py-2 pr-3 text-right font-medium">Value</th>
                      <th className="py-2 font-medium">On-chain proof (verified)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.lines.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-3 text-sm text-zinc-500">
                          No verified figures for this period.
                        </td>
                      </tr>
                    )}
                    {p.lines.map((l) => (
                      <tr key={l.metric} className="break-inside-avoid border-b border-zinc-200 align-top">
                        <td className="py-2 pr-3 text-xs">
                          <span className="font-semibold">{l.attribute}.</span> {l.attributeName}
                        </td>
                        <td className="py-2 pr-3">
                          {l.label}
                          {l.note && <div className="mt-0.5 text-[11px] text-amber-800">{l.note}</div>}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-3 text-right tabular-nums">
                          <span className="font-semibold">{fmt(l.value, l.unit === "%" ? 2 : 3)}</span> {l.unit}
                          {l.rawValue !== undefined && (
                            <div className="text-[11px] text-zinc-500">
                              {fmt(l.rawValue)} {l.rawUnit}
                            </div>
                          )}
                        </td>
                        <td className="py-2">
                          <div className="flex flex-col gap-1.5">
                            {l.evidence.map((e) => (
                              <Proof key={e.claimAddress} e={e} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {p.excluded.length > 0 && (
                <>
                  <h3 className="mt-5 text-sm font-semibold">Not counted in totals</h3>
                  <div className="overflow-x-auto">
                    <table className="mt-2 w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-400 text-[11px] uppercase tracking-wide text-zinc-500">
                          <th className="py-2 pr-3 font-medium">Attribute</th>
                          <th className="py-2 pr-3 font-medium">Claim</th>
                          <th className="py-2 pr-3 text-right font-medium">Stated value</th>
                          <th className="py-2 pr-3 font-medium">Status</th>
                          <th className="py-2 font-medium">On-chain proof</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.excluded.map((x) => (
                          <tr key={x.claimAddress} className="break-inside-avoid border-b border-zinc-200 align-top">
                            <td className="py-2 pr-3 text-xs">
                              {x.attribute !== null ? (
                                <>
                                  <span className="font-semibold">{x.attribute}.</span> {BRSR_ATTRIBUTES[x.attribute]}
                                </>
                              ) : (
                                x.attributeName
                              )}
                            </td>
                            <td className="py-2 pr-3">
                              {kindName(x.kind)}
                              <div className="text-[11px] text-zinc-500">{x.reason}</div>
                            </td>
                            <td className="whitespace-nowrap py-2 pr-3 text-right tabular-nums text-zinc-500">
                              {fmt(x.quantity)} {x.unit}
                            </td>
                            <td className="py-2 pr-3">
                              <Status s={x.status} />
                            </td>
                            <td className="py-2">
                              <Proof e={x} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          ))}

          <footer className="mt-10 border-t border-zinc-300 pt-3 text-[11px] leading-5 text-zinc-600">
            Every figure in this report links to a Solana account. Each claim address is an on-chain record signed by
            the supplier and, where verified, attested by an accredited verifier; the SHA-256 hash identifies the
            evidence document the verifier reviewed. Check any figure on Solana Explorer (devnet) or at {publicUrl}.
            Generated by GreenLedger.
          </footer>
        </article>
      )}
    </main>
  );
}
