"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Header } from "@/components/Header";
import { Button, Card, Field, Notice } from "@/components/ui";
import type { ClaimRow } from "@/components/ClaimTable";
import {
  fetchAllSuppliers,
  fetchClaims,
  fetchSupplier,
  resolveSupplier,
  summarize,
  type ComplianceSummary,
  type SupplierRecord,
} from "@/lib/fetch";
import { claimsToCsv, downloadText } from "@/lib/csv";
import { brsrCsvFor, brsrFilename } from "@/lib/brsrClaims";
import { formatDate } from "@/lib/program";

const STORAGE_KEY = "greenledger.watchlist";

type Row = { supplier: SupplierRecord; claims: ClaimRow[]; summary: ComplianceSummary };

function loadWatchlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveWatchlist(list: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* private mode */
  }
}

export default function BuyerView() {
  const { connection } = useConnection();
  const [watch, setWatch] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [directory, setDirectory] = useState<SupplierRecord[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial on-chain fetch
    setWatch(loadWatchlist());
    fetchAllSuppliers(connection).then(setDirectory).catch(() => {});
  }, [connection]);

  const refresh = useCallback(async (list: string[]) => {
    setLoading(true);
    try {
      const out: Row[] = [];
      for (const addr of list) {
        const pk = new PublicKey(addr);
        const supplier = await fetchSupplier(connection, pk);
        if (!supplier) continue;
        const claims = await fetchClaims(connection, pk);
        out.push({ supplier, claims, summary: summarize(claims) });
      }
      setRows(out);
    } finally {
      setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial on-chain fetch
    refresh(watch).catch((e) => setError(String(e)));
  }, [watch, refresh]);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const pk = await resolveSupplier(connection, query);
      if (!pk) throw new Error("No supplier found");
      const s = await fetchSupplier(connection, pk);
      if (!s) throw new Error("No supplier registered at that address");
      const next = Array.from(new Set([...watch, pk.toBase58()]));
      setWatch(next);
      saveWatchlist(next);
      setQuery("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function remove(addr: string) {
    const next = watch.filter((a) => a !== addr);
    setWatch(next);
    saveWatchlist(next);
  }

  function addFromDirectory(addr: string) {
    const next = Array.from(new Set([...watch, addr]));
    setWatch(next);
    saveWatchlist(next);
  }

  function exportAll() {
    const flat = rows.flatMap((r) =>
      r.claims.map((claim) => ({ supplierName: r.supplier.name, gstin: r.supplier.gstin, claim }))
    );
    downloadText("greenledger-supply-chain.csv", claimsToCsv(flat));
  }

  function exportBrsrAll() {
    downloadText(brsrFilename(null), brsrCsvFor(rows), "text/csv;charset=utf-8");
  }

  function exportBrsrOne(r: Row) {
    downloadText(brsrFilename(r.supplier.gstin), brsrCsvFor([r]), "text/csv;charset=utf-8");
  }

  const totals = rows.reduce(
    (acc, r) => ({
      claims: acc.claims + r.summary.total,
      verified: acc.verified + r.summary.verified,
      pending: acc.pending + r.summary.pending,
      rejected: acc.rejected + r.summary.rejected,
    }),
    { claims: 0, verified: 0, pending: 0, rejected: 0 }
  );

  const notWatched = directory.filter((s) => !watch.includes(s.address.toBase58()));

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Buyer dashboard</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Track the suppliers in your value chain. Everything here is read straight from Solana; nothing is
            self-reported to you.
          </p>
        </div>

        <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field
            label="Add supplier by GSTIN or wallet"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="29ABCDE1234F1Z5"
            className="flex-1"
            required
          />
          <Button>Add to watchlist</Button>
        </form>
        {error && <Notice tone="err">{error}</Notice>}

        {rows.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Suppliers", rows.length],
              ["Verified claims", totals.verified],
              ["Pending", totals.pending],
              ["Rejected", totals.rejected],
            ].map(([label, n]) => (
              <div key={String(label)} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
                <div className="mt-1 text-2xl font-semibold">{n}</div>
              </div>
            ))}
          </div>
        )}

        <Card title={`Watchlist${loading ? " (refreshing…)" : ""}`}>
          {rows.length === 0 ? (
            <p className="text-sm text-zinc-500">No suppliers yet. Add one above or pick from the directory below.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                  <tr>
                    <th className="py-2 pr-4">Supplier</th>
                    <th className="py-2 pr-4">Sector</th>
                    <th className="py-2 pr-4">Verified</th>
                    <th className="py-2 pr-4">Pending</th>
                    <th className="py-2 pr-4">Rejected</th>
                    <th className="py-2 pr-4">Rate</th>
                    <th className="py-2 pr-4">Last verified</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const { supplier: s, summary: m } = r;
                    return (
                    <tr key={s.address.toBase58()} className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-3 pr-4">
                        <Link href={`/s/${s.address.toBase58()}`} className="font-medium underline-offset-2 hover:underline">
                          {s.name}
                        </Link>
                        <div className="font-mono text-xs text-zinc-500">{s.gstin}</div>
                      </td>
                      <td className="py-3 pr-4">{s.sector}</td>
                      <td className="py-3 pr-4">{m.verified}</td>
                      <td className="py-3 pr-4">{m.pending}</td>
                      <td className="py-3 pr-4">{m.rejected}</td>
                      <td className="py-3 pr-4">
                        {m.score === null ? (
                          <span className="text-zinc-400">-</span>
                        ) : (
                          <span className={m.score >= 80 ? "text-emerald-700 dark:text-emerald-400" : m.score >= 50 ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400"}>
                            {m.score}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-xs">{m.lastVerified ? formatDate(m.lastVerified) : "-"}</td>
                      <td className="py-3 text-right">
                        <div className="flex flex-col items-end gap-1 text-xs">
                          <Link href={`/s/${s.address.toBase58()}/brsr`} className="whitespace-nowrap text-emerald-700 hover:underline dark:text-emerald-400">
                            BRSR Core report
                          </Link>
                          <button onClick={() => exportBrsrOne(r)} disabled={r.claims.length === 0} className="whitespace-nowrap text-emerald-700 hover:underline disabled:opacity-40 dark:text-emerald-400">
                            BRSR Core CSV
                          </button>
                          <button onClick={() => remove(s.address.toBase58())} className="text-zinc-500 hover:underline">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={exportBrsrAll} className="rounded-md border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-900 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-900">
                  Export BRSR Core (whole watchlist)
                </button>
                <button onClick={exportAll} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
                  Export raw claims CSV
                </button>
              </div>
            </div>
          )}
        </Card>

        {notWatched.length > 0 && (
          <Card title="Supplier directory">
            <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800/60">
              {notWatched.map((s) => (
                <li key={s.address.toBase58()} className="flex items-center justify-between py-2">
                  <div>
                    <span className="font-medium">{s.name}</span>
                    <span className="ml-2 font-mono text-xs text-zinc-500">{s.gstin}</span>
                    <span className="ml-2 text-xs text-zinc-500">{s.sector}</span>
                  </div>
                  <button onClick={() => addFromDirectory(s.address.toBase58())} className="text-xs text-emerald-700 hover:underline dark:text-emerald-400">
                    Watch
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </main>
    </>
  );
}
