"use client";

import { AnchorProvider, BN, Program, type Idl } from "@coral-xyz/anchor";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import idlJson from "@/idl/greenledger.json";
import type { Greenledger } from "@/idl/greenledger";

export const PROGRAM_ID = new PublicKey((idlJson as Idl).address);

export type GreenledgerProgram = Program<Greenledger>;

/** Read-only program for pages that only fetch accounts. */
export function getReadonlyProgram(connection: Connection): GreenledgerProgram {
  return new Program(idlJson as Greenledger, { connection });
}

export function getProgram(connection: Connection, wallet: AnchorWallet): GreenledgerProgram {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program(idlJson as Greenledger, provider);
}

export const pda = {
  registry: () =>
    PublicKey.findProgramAddressSync([Buffer.from("registry")], PROGRAM_ID)[0],
  supplier: (owner: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("supplier"), owner.toBuffer()],
      PROGRAM_ID
    )[0],
  verifier: (authority: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("verifier"), authority.toBuffer()],
      PROGRAM_ID
    )[0],
  claim: (supplier: PublicKey, index: number | BN) => {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(BigInt(index.toString()));
    return PublicKey.findProgramAddressSync(
      [Buffer.from("claim"), supplier.toBuffer(), buf],
      PROGRAM_ID
    )[0];
  },
};

export const CLAIM_KINDS = [
  { key: "energyConsumption", label: "Energy consumption", unit: "kWh" },
  { key: "scope1Emissions", label: "Scope 1 emissions", unit: "tCO2e" },
  { key: "scope2Emissions", label: "Scope 2 emissions", unit: "tCO2e" },
  { key: "renewableCertificate", label: "Renewable energy certificate", unit: "MWh" },
  { key: "waterUsage", label: "Water usage", unit: "kL" },
  { key: "wasteDiverted", label: "Waste diverted from landfill", unit: "t" },
] as const;

export type ClaimKindKey = (typeof CLAIM_KINDS)[number]["key"];

export function kindLabel(kind: Record<string, unknown>): string {
  const key = Object.keys(kind)[0];
  return CLAIM_KINDS.find((k) => k.key === key)?.label ?? key;
}

export function statusKey(status: Record<string, unknown>): "pending" | "verified" | "rejected" {
  return Object.keys(status)[0] as "pending" | "verified" | "rejected";
}

/** Values are stored scaled by 1000. */
export const SCALE = 1000;
export function formatValue(v: BN, unit: string): string {
  const n = v.toNumber() / SCALE;
  return `${n.toLocaleString("en-IN", { maximumFractionDigits: 3 })} ${unit}`;
}

export function formatDate(ts: BN | number): string {
  const n = typeof ts === "number" ? ts : ts.toNumber();
  if (!n) return "-";
  return new Date(n * 1000).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function sha256File(file: File): Promise<number[]> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash));
}

export function hexOf(bytes: number[] | Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function short(pk: PublicKey | string, n = 4): string {
  const s = pk.toString();
  return `${s.slice(0, n)}…${s.slice(-n)}`;
}

export function explorerUrl(address: string, type: "address" | "tx" = "address"): string {
  return `https://explorer.solana.com/${type}/${address}?cluster=devnet`;
}
