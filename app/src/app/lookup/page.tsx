"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Header } from "@/components/Header";
import { ClaimTable, type ClaimRow } from "@/components/ClaimTable";
import { Button, Card, Field, Notice, Stat } from "@/components/ui";
import { explorerUrl, getReadonlyProgram, pda } from "@/lib/program";
import { Suspense } from "react";

type SupplierView = {
  address: PublicKey;
  name: string;
  gstin: string;
  sector: string;
  claimCount: { toString(): string };
  verifiedCount: { toString(): string };
};

function LookupInner() {
  const { connection } = useConnection();
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [supplier, setSupplier] = useState<SupplierView | null>(null);
  const [claims, setClaims] = useState<ClaimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (q: string) => {
      const program = getReadonlyProgram(connection);
      setLoading(true);
      setError(null);
      setSupplier(null);
      setClaims(null);
      try {
        let supplierPda: PublicKey | null = null;
        const trimmed = q.trim();

        // Accept a wallet address, a supplier PDA, or a GSTIN.
        if (/^[0-9A-Za-z]{15}$/.test(trimmed) && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
          const all = await program.account.supplier.all();
          const hit = all.find((s) => s.account.gstin.toUpperCase() === trimmed.toUpperCase());
          supplierPda = hit?.publicKey ?? null;
        } else {
          const pk = new PublicKey(trimmed);
          const direct = await program.account.supplier.fetchNullable(pk);
          supplierPda = direct ? pk : pda.supplier(pk);
        }
        if (!supplierPda) throw new Error("No supplier found for that GSTIN");

        const acct = await program.account.supplier.fetchNullable(supplierPda);
        if (!acct) throw new Error("No supplier registered at that address");
        setSupplier({ address: supplierPda, ...acct });

        const rows = await program.account.claim.all([
          { memcmp: { offset: 8, bytes: supplierPda.toBase58() } },
        ]);
        setClaims(
          rows
            .map((r) => ({ address: r.publicKey, ...r.account }))
            .sort((a, b) => a.index.toNumber() - b.index.toNumber())
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [connection]
  );

  useEffect(() => {
    const q = params.get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial on-chain fetch
    if (q) search(q);
  }, [params, search]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    router.replace(`/lookup?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Supplier lookup</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Paste a supplier wallet, record address, or GSTIN. No wallet needed to read.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field
          label="Wallet, address, or GSTIN"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="29ABCDE1234F1Z5"
          className="flex-1"
          required
        />
        <Button disabled={loading}>{loading ? "Searching…" : "Look up"}</Button>
      </form>

      {error && <Notice tone="err">{error}</Notice>}

      {supplier && (
        <>
          <Card title={supplier.name}>
            <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
              <Stat label="GSTIN" value={supplier.gstin} mono />
              <Stat label="Sector" value={supplier.sector} />
              <Stat label="Claims" value={supplier.claimCount.toString()} />
              <Stat label="Verified" value={supplier.verifiedCount.toString()} />
            </dl>
            <p className="mt-3 text-xs text-zinc-500">
              <a className="mr-3 underline" href={`/s/${supplier.address.toBase58()}`}>Open public page</a>
              On-chain record:{" "}
              <a className="font-mono underline" href={explorerUrl(supplier.address.toBase58())} target="_blank" rel="noreferrer">
                {supplier.address.toBase58()}
              </a>
            </p>
          </Card>
          <Card title="Claims">
            {claims === null ? (
              <p className="text-sm text-zinc-500">Loading claims from devnet…</p>
            ) : (
              <ClaimTable claims={claims} emptyText="This supplier has not recorded any claims." />
            )}
          </Card>
        </>
      )}
    </main>
  );
}

export default function LookupPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <LookupInner />
      </Suspense>
    </>
  );
}
