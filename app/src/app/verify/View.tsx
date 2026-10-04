"use client";

import { useCallback, useEffect, useState } from "react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Header } from "@/components/Header";
import { ClaimTable, type ClaimRow } from "@/components/ClaimTable";
import { Card, Notice, Stat, TxNotice } from "@/components/ui";
import { getProgram, getReadonlyProgram, pda, statusKey } from "@/lib/program";

type VerifierAccount = {
  name: string;
  accreditation: string;
  active: boolean;
  verifiedCount: { toString(): string };
};

export default function VerifyView() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { publicKey } = useWallet();

  const [verifier, setVerifier] = useState<VerifierAccount | null | undefined>(undefined);
  const [pending, setPending] = useState<ClaimRow[]>([]);
  const [supplierNames, setSupplierNames] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<{ message: string; sig: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const program = getReadonlyProgram(connection);
    if (publicKey) {
      setVerifier(await program.account.verifier.fetchNullable(pda.verifier(publicKey)));
    }
    const all = await program.account.claim.all();
    const rows = all
      .map((r) => ({ address: r.publicKey, ...r.account }))
      .filter((c) => statusKey(c.status) === "pending")
      .sort((a, b) => a.submittedAt.toNumber() - b.submittedAt.toNumber());
    setPending(rows);

    const supplierKeys = Array.from(new Set(rows.map((r) => r.supplier.toBase58())));
    const names: Record<string, string> = {};
    await Promise.all(
      supplierKeys.map(async (k) => {
        const s = await program.account.supplier.fetchNullable(new PublicKey(k));
        if (s) names[k] = `${s.name} (${s.gstin})`;
      })
    );
    setSupplierNames(names);
  }, [connection, publicKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial on-chain fetch
    refresh().catch((e) => setError(String(e)));
  }, [refresh]);

  async function decide(claim: ClaimRow, approve: boolean) {
    if (!wallet) return;
    const note = window.prompt(approve ? "Verification note (optional)" : "Reason for rejection") ?? "";
    setBusy(claim.address.toBase58());
    setError(null);
    try {
      const program = getProgram(connection, wallet);
      const sig = await program.methods
        .verifyClaim(approve, note.slice(0, 128))
        .accountsPartial({
          supplier: claim.supplier,
          claim: claim.address,
          verifierAuthority: wallet.publicKey,
        })
        .rpc();
      setStatus({ message: `${approve ? "Approved" : "Rejected"} claim #${claim.index.toString()}.`, sig });
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(null);
    }
  }

  const canAct = Boolean(verifier && verifier.active);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Verifier console</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Review pending claims against their evidence and sign an on-chain attestation.
          </p>
        </div>

        {!publicKey && <Notice>Connect the wallet registered as a verifier.</Notice>}

        {publicKey && verifier === null && (
          <Notice tone="err">
            This wallet is not an approved verifier. Verifiers are added by the registry authority.
          </Notice>
        )}

        {verifier && (
          <Card title={verifier.name}>
            <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
              <Stat label="Accreditation" value={verifier.accreditation} mono />
              <Stat label="Status" value={verifier.active ? "Active" : "Suspended"} />
              <Stat label="Attestations" value={verifier.verifiedCount.toString()} />
            </dl>
          </Card>
        )}

        <Card title={`Pending claims (${pending.length})`}>
          <ClaimTable
            claims={pending}
            emptyText="Nothing waiting for verification."
            action={(c) => (
              <div className="flex flex-col gap-1">
                <div className="text-xs text-zinc-500">{supplierNames[c.supplier.toBase58()] ?? "…"}</div>
                <div className="flex gap-2">
                  <button
                    disabled={!canAct || busy === c.address.toBase58()}
                    onClick={() => decide(c, true)}
                    className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    disabled={!canAct || busy === c.address.toBase58()}
                    onClick={() => decide(c, false)}
                    className="rounded border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          />
        </Card>

        {status && <TxNotice message={status.message} sig={status.sig} />}
        {error && <Notice tone="err">{error}</Notice>}
      </main>
    </>
  );
}
