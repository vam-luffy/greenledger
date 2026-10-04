import type { ClaimRow } from "@/components/ClaimTable";
import type { SupplierRecord } from "@/lib/fetch";
import { hexOf, SCALE, statusKey } from "@/lib/program";
import { brsrToCsv, buildBrsrReport, type BrsrClaim, type BrsrReport } from "@/lib/brsr";

/** Reduce an on-chain claim account to the plain values the BRSR mapping needs. */
export function toBrsrClaim(c: ClaimRow): BrsrClaim {
  return {
    address: c.address.toBase58(),
    kind: Object.keys(c.kind)[0],
    periodStart: c.periodStart.toNumber(),
    periodEnd: c.periodEnd.toNumber(),
    quantity: c.value.toNumber() / SCALE,
    unit: c.unit,
    status: statusKey(c.status),
    verifier: c.verifier?.toBase58() ?? null,
    verifiedAt: c.verifiedAt.toNumber(),
    evidenceSha256: hexOf(c.evidenceHash),
  };
}

export function supplierBrsrReport(supplier: SupplierRecord, claims: ClaimRow[], at = new Date()): BrsrReport {
  return buildBrsrReport(
    { name: supplier.name, gstin: supplier.gstin, sector: supplier.sector, address: supplier.address.toBase58() },
    claims.map(toBrsrClaim),
    at
  );
}

export function brsrCsvFor(list: { supplier: SupplierRecord; claims: ClaimRow[] }[]): string {
  const at = new Date();
  return brsrToCsv(list.map((r) => supplierBrsrReport(r.supplier, r.claims, at)));
}

export function brsrFilename(gstin: string | null): string {
  const day = new Date().toISOString().slice(0, 10);
  return gstin ? `brsr-core-${gstin}-${day}.csv` : `brsr-core-watchlist-${day}.csv`;
}
