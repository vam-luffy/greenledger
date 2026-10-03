"use client";

import { Connection, PublicKey } from "@solana/web3.js";
import type { BN } from "@coral-xyz/anchor";
import type { ClaimRow } from "@/components/ClaimTable";
import { getReadonlyProgram, pda, statusKey } from "@/lib/program";

export type SupplierRecord = {
  address: PublicKey;
  owner: PublicKey;
  name: string;
  gstin: string;
  sector: string;
  claimCount: BN;
  verifiedCount: BN;
  createdAt: BN;
};

export type VerifierRecord = {
  address: PublicKey;
  authority: PublicKey;
  name: string;
  accreditation: string;
  active: boolean;
  verifiedCount: BN;
  createdAt: BN;
};

/** Resolve a wallet address, supplier PDA, or GSTIN to a supplier PDA. */
export async function resolveSupplier(connection: Connection, query: string): Promise<PublicKey | null> {
  const program = getReadonlyProgram(connection);
  const q = query.trim();
  const looksLikeKey = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(q);
  if (!looksLikeKey && /^[0-9A-Za-z]{15}$/.test(q)) {
    const all = await program.account.supplier.all();
    return all.find((s) => s.account.gstin.toUpperCase() === q.toUpperCase())?.publicKey ?? null;
  }
  const pk = new PublicKey(q);
  const direct = await program.account.supplier.fetchNullable(pk);
  return direct ? pk : pda.supplier(pk);
}

export async function fetchSupplier(connection: Connection, supplierPda: PublicKey): Promise<SupplierRecord | null> {
  const program = getReadonlyProgram(connection);
  const acct = await program.account.supplier.fetchNullable(supplierPda);
  return acct ? { address: supplierPda, ...acct } : null;
}

export async function fetchClaims(connection: Connection, supplierPda: PublicKey): Promise<ClaimRow[]> {
  const program = getReadonlyProgram(connection);
  const rows = await program.account.claim.all([
    { memcmp: { offset: 8, bytes: supplierPda.toBase58() } },
  ]);
  return rows
    .map((r) => ({ address: r.publicKey, ...r.account }))
    .sort((a, b) => a.index.toNumber() - b.index.toNumber());
}

export async function fetchAllSuppliers(connection: Connection): Promise<SupplierRecord[]> {
  const program = getReadonlyProgram(connection);
  const rows = await program.account.supplier.all();
  return rows
    .map((r) => ({ address: r.publicKey, ...r.account }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchAllVerifiers(connection: Connection): Promise<VerifierRecord[]> {
  const program = getReadonlyProgram(connection);
  const rows = await program.account.verifier.all();
  return rows
    .map((r) => ({ address: r.publicKey, ...r.account }))
    .sort((a, b) => b.verifiedCount.toNumber() - a.verifiedCount.toNumber());
}

export type ComplianceSummary = {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  /** 0 to 100, verified over resolved; null when nothing resolved. */
  score: number | null;
  lastVerified: number;
};

export function summarize(claims: ClaimRow[]): ComplianceSummary {
  let verified = 0, pending = 0, rejected = 0, lastVerified = 0;
  for (const c of claims) {
    const s = statusKey(c.status);
    if (s === "verified") { verified++; lastVerified = Math.max(lastVerified, c.verifiedAt.toNumber()); }
    else if (s === "pending") pending++;
    else rejected++;
  }
  const resolved = verified + rejected;
  return {
    total: claims.length,
    verified,
    pending,
    rejected,
    score: resolved ? Math.round((verified / resolved) * 100) : null,
    lastVerified,
  };
}
