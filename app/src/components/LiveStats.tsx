"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { getReadonlyProgram, pda } from "@/lib/program";

type Stats = { suppliers: number; verifiers: number; claims: number; verified: number };

export function LiveStats() {
  const { connection } = useConnection();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const program = getReadonlyProgram(connection);
    (async () => {
      const registry = await program.account.registry.fetchNullable(pda.registry());
      if (!registry) return;
      const suppliers = await program.account.supplier.all();
      const verified = suppliers.reduce((n, s) => n + s.account.verifiedCount.toNumber(), 0);
      setStats({
        suppliers: registry.supplierCount.toNumber(),
        verifiers: registry.verifierCount.toNumber(),
        claims: registry.claimCount.toNumber(),
        verified,
      });
    })().catch(() => {});
  }, [connection]);

  if (!stats) return null;

  const items = [
    ["Suppliers", stats.suppliers],
    ["Claims recorded", stats.claims],
    ["Verified on-chain", stats.verified],
    ["Accredited verifiers", stats.verifiers],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(([label, n]) => (
        <div key={label} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-2xl font-semibold tabular-nums">{n.toLocaleString("en-IN")}</div>
          <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
        </div>
      ))}
    </div>
  );
}
