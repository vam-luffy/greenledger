"use client";

import type { BN } from "@coral-xyz/anchor";
import type { PublicKey } from "@solana/web3.js";
import { StatusBadge } from "@/components/ui";
import { explorerUrl, formatDate, formatValue, hexOf, kindLabel, short, statusKey } from "@/lib/program";

export type ClaimRow = {
  address: PublicKey;
  supplier: PublicKey;
  index: BN;
  kind: Record<string, unknown>;
  periodStart: BN;
  periodEnd: BN;
  value: BN;
  unit: string;
  evidenceHash: number[];
  evidenceUri: string;
  status: Record<string, unknown>;
  verifier: PublicKey | null;
  verifiedAt: BN;
  note: string;
  submittedAt: BN;
};

export function ClaimTable({
  claims,
  emptyText,
  action,
}: {
  claims: ClaimRow[];
  emptyText: string;
  action?: (c: ClaimRow) => React.ReactNode;
}) {
  if (claims.length === 0) {
    return <p className="text-sm text-zinc-500">{emptyText}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
          <tr>
            <th className="py-2 pr-4">#</th>
            <th className="py-2 pr-4">Type</th>
            <th className="py-2 pr-4">Quantity</th>
            <th className="py-2 pr-4">Period</th>
            <th className="py-2 pr-4">Evidence</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Verifier</th>
            {action && <th className="py-2" />}
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => {
            const s = statusKey(c.status);
            return (
              <tr key={c.address.toBase58()} className="border-b border-zinc-100 align-top dark:border-zinc-800/60">
                <td className="py-3 pr-4 font-mono text-xs">{c.index.toString()}</td>
                <td className="py-3 pr-4">{kindLabel(c.kind)}</td>
                <td className="py-3 pr-4 whitespace-nowrap">{formatValue(c.value, c.unit)}</td>
                <td className="py-3 pr-4 whitespace-nowrap text-xs">
                  {formatDate(c.periodStart)} to {formatDate(c.periodEnd)}
                </td>
                <td className="py-3 pr-4">
                  <span className="font-mono text-xs" title={hexOf(c.evidenceHash)}>
                    sha256:{hexOf(c.evidenceHash).slice(0, 12)}…
                  </span>
                  {c.evidenceUri && (
                    <>
                      {" "}
                      <a href={c.evidenceUri} target="_blank" rel="noreferrer" className="text-xs underline">
                        link
                      </a>
                    </>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={s} />
                  {c.note && <div className="mt-1 max-w-xs text-xs text-zinc-500">{c.note}</div>}
                </td>
                <td className="py-3 pr-4 text-xs">
                  {c.verifier ? (
                    <a href={explorerUrl(c.verifier.toBase58())} target="_blank" rel="noreferrer" className="font-mono underline">
                      {short(c.verifier)}
                    </a>
                  ) : (
                    <span className="text-zinc-400">-</span>
                  )}
                  {c.verifiedAt.toNumber() > 0 && (
                    <div className="text-zinc-500">{formatDate(c.verifiedAt)}</div>
                  )}
                </td>
                {action && <td className="py-3">{action(c)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
