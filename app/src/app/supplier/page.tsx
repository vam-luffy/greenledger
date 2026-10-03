"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { Header } from "@/components/Header";
import { ClaimTable, type ClaimRow } from "@/components/ClaimTable";
import { Button, Card, Field, Notice, Stat, inputCls } from "@/components/ui";
import {
  CLAIM_KINDS,
  SCALE,
  explorerUrl,
  getProgram,
  getReadonlyProgram,
  pda,
  sha256File,
  type ClaimKindKey,
} from "@/lib/program";

type SupplierAccount = {
  name: string;
  gstin: string;
  sector: string;
  claimCount: BN;
  verifiedCount: BN;
};

export default function SupplierPage() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { publicKey } = useWallet();

  const [supplier, setSupplier] = useState<SupplierAccount | null>(null);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!publicKey) return;
    const program = getReadonlyProgram(connection);
    const supplierPda = pda.supplier(publicKey);
    const acct = await program.account.supplier.fetchNullable(supplierPda);
    setSupplier(acct);
    if (!acct) {
      setClaims([]);
      return;
    }
    const rows = await program.account.claim.all([
      { memcmp: { offset: 8, bytes: supplierPda.toBase58() } },
    ]);
    setClaims(
      rows
        .map((r) => ({ address: r.publicKey, ...r.account }))
        .sort((a, b) => a.index.toNumber() - b.index.toNumber())
    );
  }, [connection, publicKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial on-chain fetch
    refresh().catch((e) => setError(String(e)));
  }, [refresh]);

  async function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!wallet) return;
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const program = getProgram(connection, wallet);
      const sig = await program.methods
        .registerSupplier(
          String(fd.get("name")),
          String(fd.get("gstin")).toUpperCase(),
          String(fd.get("sector"))
        )
        .accounts({ owner: wallet.publicKey })
        .rpc();
      setStatus(`Registered. Tx ${sig}`);
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitClaim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!wallet) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    setLoading(true);
    setError(null);
    try {
      const kindKey = String(fd.get("kind")) as ClaimKindKey;
      const kind = CLAIM_KINDS.find((k) => k.key === kindKey)!;
      const file = fd.get("evidence") as File | null;
      if (!file || file.size === 0) throw new Error("Attach an evidence document");
      const hash = await sha256File(file);
      const start = Math.floor(new Date(String(fd.get("start"))).getTime() / 1000);
      const end = Math.floor(new Date(String(fd.get("end"))).getTime() / 1000);
      const value = Math.round(Number(fd.get("value")) * SCALE);

      const program = getProgram(connection, wallet);
      const sig = await program.methods
        .submitClaim(
          { [kindKey]: {} } as never,
          new BN(start),
          new BN(end),
          new BN(value),
          kind.unit,
          hash,
          String(fd.get("uri") ?? "")
        )
        .accounts({ owner: wallet.publicKey })
        .rpc();
      setStatus(`Claim submitted. Tx ${sig}`);
      form.reset();
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Supplier console</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Register your business once, then record ESG claims with hashed evidence.
          </p>
        </div>

        {!publicKey && (
          <Notice>Connect a devnet wallet to continue.</Notice>
        )}

        {publicKey && supplier === null && (
          <Card title="Register your business">
            <form onSubmit={onRegister} className="grid gap-4 sm:grid-cols-2">
              <Field label="Legal name" name="name" placeholder="Shakti Textiles Pvt Ltd" required maxLength={64} />
              <Field label="GSTIN" name="gstin" placeholder="29ABCDE1234F1Z5" required maxLength={15} pattern="[0-9A-Za-z]{15}" />
              <Field label="Sector" name="sector" placeholder="Textiles" required maxLength={32} />
              <div className="flex items-end">
                <Button disabled={loading}>{loading ? "Submitting…" : "Register on-chain"}</Button>
              </div>
            </form>
          </Card>
        )}

        {publicKey && supplier && (
          <>
            <Card title={supplier.name}>
              <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
                <Stat label="GSTIN" value={supplier.gstin} mono />
                <Stat label="Sector" value={supplier.sector} />
                <Stat label="Claims" value={supplier.claimCount.toString()} />
                <Stat label="Verified" value={supplier.verifiedCount.toString()} />
              </dl>
              <p className="mt-3 text-xs text-zinc-500">
                <a className="mr-3 underline" href={`/s/${pda.supplier(publicKey).toBase58()}`}>Open your public page</a>
                Public lookup address:{" "}
                <a className="font-mono underline" href={explorerUrl(pda.supplier(publicKey).toBase58())} target="_blank" rel="noreferrer">
                  {pda.supplier(publicKey).toBase58()}
                </a>
              </p>
            </Card>

            <Card title="Record a new claim">
              <form onSubmit={onSubmitClaim} className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">Claim type</span>
                  <select name="kind" className={inputCls} required defaultValue="energyConsumption">
                    {CLAIM_KINDS.map((k) => (
                      <option key={k.key} value={k.key}>
                        {k.label} ({k.unit})
                      </option>
                    ))}
                  </select>
                </label>
                <Field label="Quantity" name="value" type="number" step="0.001" min="0" required placeholder="48250" />
                <Field label="Period start" name="start" type="date" required />
                <Field label="Period end" name="end" type="date" required />
                <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                  <span className="font-medium">Evidence document</span>
                  <input name="evidence" type="file" required className={inputCls} />
                  <span className="text-xs text-zinc-500">
                    Only the SHA-256 hash goes on-chain. The file stays with you.
                  </span>
                </label>
                <Field label="Evidence link (optional)" name="uri" placeholder="https://drive.google.com/…" maxLength={128} className="sm:col-span-2" />
                <div>
                  <Button disabled={loading}>{loading ? "Submitting…" : "Submit claim"}</Button>
                </div>
              </form>
            </Card>

            <Card title="Your claims">
              <ClaimTable claims={claims} emptyText="No claims yet." />
            </Card>
          </>
        )}

        {status && <Notice tone="ok">{status}</Notice>}
        {error && <Notice tone="err">{error}</Notice>}
      </main>
    </>
  );
}
