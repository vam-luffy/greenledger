import type { ClaimRow } from "@/components/ClaimTable";
import { formatDate, hexOf, kindLabel, statusKey, SCALE } from "@/lib/program";

/**
 * Export claims in a BRSR-style flat table: one row per claim with the
 * on-chain proof columns a buyer's assurance team needs.
 */
export function claimsToCsv(
  rows: { supplierName: string; gstin: string; claim: ClaimRow }[]
): string {
  const header = [
    "supplier_name",
    "gstin",
    "claim_index",
    "metric",
    "quantity",
    "unit",
    "period_start",
    "period_end",
    "status",
    "verifier",
    "verified_on",
    "verifier_note",
    "evidence_sha256",
    "evidence_link",
    "onchain_record",
  ];
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map(({ supplierName, gstin, claim: c }) =>
    [
      supplierName,
      gstin,
      c.index.toString(),
      kindLabel(c.kind),
      (c.value.toNumber() / SCALE).toString(),
      c.unit,
      formatDate(c.periodStart),
      formatDate(c.periodEnd),
      statusKey(c.status),
      c.verifier?.toBase58() ?? "",
      c.verifiedAt.toNumber() ? formatDate(c.verifiedAt) : "",
      c.note,
      hexOf(c.evidenceHash),
      c.evidenceUri,
      c.address.toBase58(),
    ]
      .map(esc)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export function downloadText(filename: string, text: string, mime = "text/csv") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
