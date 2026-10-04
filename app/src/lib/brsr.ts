/**
 * BRSR Core mapping.
 *
 * SEBI's BRSR Core (Annexure I to circular SEBI/HO/CFD/CFD-SEC-2/P/CIR/2023/122,
 * 12 July 2023) is the assured subset of the Business Responsibility and
 * Sustainability Report. This module maps GreenLedger claim kinds onto the
 * environmental BRSR Core attributes:
 *
 *   energyConsumption, renewableCertificate -> Attribute 3, Energy footprint
 *   scope1Emissions, scope2Emissions        -> Attribute 1, GHG footprint
 *   waterUsage                              -> Attribute 2, Water footprint
 *   wasteDiverted                           -> Attribute 4, Embracing circularity
 *
 * Everything here is pure and free of Solana runtime imports so it can be unit
 * tested in Node. Only Verified claims count toward headline figures; Pending
 * and Rejected claims are carried alongside, with their status, and never summed.
 */

export type BrsrStatus = "verified" | "pending" | "rejected";

/** A claim reduced to plain values. `quantity` is already unscaled (human units). */
export type BrsrClaim = {
  address: string;
  kind: string;
  periodStart: number; // unix seconds
  periodEnd: number; // unix seconds
  quantity: number;
  unit: string;
  status: BrsrStatus;
  verifier: string | null;
  verifiedAt: number; // unix seconds, 0 when not resolved
  evidenceSha256: string;
};

export type BrsrSupplier = { name: string; gstin: string; sector?: string; address: string };

export const KWH_TO_GJ = 0.0036;
export const MWH_TO_GJ = 3.6;

export const BRSR_ATTRIBUTES = {
  1: "Green-house gas (GHG) footprint",
  2: "Water footprint",
  3: "Energy footprint",
  4: "Embracing circularity",
} as const;
export type BrsrAttributeNo = keyof typeof BRSR_ATTRIBUTES;

export type BrsrMetricKey =
  | "scope1"
  | "scope2"
  | "scope12Total"
  | "energyTotal"
  | "renewableProcured"
  | "renewableShare"
  | "waterConsumption"
  | "wasteDiverted";

type MetricDef = { attribute: BrsrAttributeNo; label: string; unit: string };

export const BRSR_METRICS: Record<BrsrMetricKey, MetricDef> = {
  scope1: { attribute: 1, label: "Total Scope 1 emissions", unit: "tCO2e" },
  scope2: { attribute: 1, label: "Total Scope 2 emissions", unit: "tCO2e" },
  scope12Total: { attribute: 1, label: "Total Scope 1 and Scope 2 emissions", unit: "tCO2e" },
  energyTotal: { attribute: 3, label: "Total energy consumed", unit: "GJ" },
  renewableProcured: { attribute: 3, label: "Renewable energy procured (certificates)", unit: "MWh" },
  renewableShare: { attribute: 3, label: "Renewable share of total energy consumed", unit: "%" },
  waterConsumption: { attribute: 2, label: "Total water consumption", unit: "kL" },
  wasteDiverted: { attribute: 4, label: "Waste recovered through recycling, re-using or other recovery", unit: "t" },
};

/** Which headline metric a single claim kind feeds. */
const KIND_TO_METRIC: Record<string, BrsrMetricKey> = {
  scope1Emissions: "scope1",
  scope2Emissions: "scope2",
  energyConsumption: "energyTotal",
  renewableCertificate: "renewableProcured",
  waterUsage: "waterConsumption",
  wasteDiverted: "wasteDiverted",
};

/**
 * Convert a claim's quantity into the metric's reporting unit.
 * Returns null for a unit we cannot convert safely; such claims are excluded.
 */
export function normalizeQuantity(kind: string, quantity: number, unit: string): number | null {
  const u = unit.trim().toLowerCase().replace(/\s+/g, "");
  switch (kind) {
    case "energyConsumption":
      // reported in GJ
      if (u === "kwh") return quantity * KWH_TO_GJ;
      if (u === "mwh") return quantity * MWH_TO_GJ;
      if (u === "gj") return quantity;
      return null;
    case "renewableCertificate":
      // reported in MWh
      if (u === "mwh" || u === "rec" || u === "recs") return quantity;
      if (u === "kwh") return quantity / 1000;
      return null;
    case "scope1Emissions":
    case "scope2Emissions":
      if (u === "tco2e" || u === "tco2") return quantity;
      if (u === "kgco2e" || u === "kgco2") return quantity / 1000;
      return null;
    case "waterUsage":
      if (u === "kl" || u === "m3") return quantity;
      if (u === "l" || u === "litre" || u === "litres" || u === "liter" || u === "liters") return quantity / 1000;
      return null;
    case "wasteDiverted":
      if (u === "t" || u === "tonne" || u === "tonnes" || u === "mt") return quantity;
      if (u === "kg") return quantity / 1000;
      return null;
    default:
      return null;
  }
}

/** Raw energy in kWh, for the "raw kWh" column next to GJ. */
export function energyKwh(quantity: number, unit: string): number | null {
  const gj = normalizeQuantity("energyConsumption", quantity, unit);
  return gj === null ? null : gj / KWH_TO_GJ;
}

/** Round away floating point noise (e.g. 48250 * 0.0036 = 173.70000000000002). */
export function round(n: number, dp = 6): number {
  const f = 10 ** dp;
  return Math.round((n + Number.EPSILON) * f) / f;
}

/** YYYY-MM-DD in IST (UTC+05:30), independent of the machine's time zone. */
export function istDate(ts: number): string {
  if (!ts) return "";
  return new Date((ts + 19800) * 1000).toISOString().slice(0, 10);
}

/** "FY 2025-26" when the period is an Indian financial year, else "2025-04-01 to 2025-06-30". */
export function periodLabel(start: number, end: number): string {
  const s = istDate(start);
  const e = istDate(end);
  const sy = Number(s.slice(0, 4));
  if (s.slice(5) === "04-01" && e === `${sy + 1}-03-31`) {
    return `FY ${sy}-${String((sy + 1) % 100).padStart(2, "0")}`;
  }
  return `${s} to ${e}`;
}

/** Proof attached to every figure. */
export type BrsrEvidence = {
  claimAddress: string;
  status: BrsrStatus;
  verifier: string | null;
  verifiedOn: string; // YYYY-MM-DD IST, "" when unresolved
  evidenceSha256: string;
  quantity: number;
  unit: string;
};

export type BrsrLine = {
  metric: BrsrMetricKey;
  attribute: BrsrAttributeNo;
  attributeName: string;
  label: string;
  value: number;
  unit: string;
  /** For energy: the same total in kWh. */
  rawValue?: number;
  rawUnit?: string;
  /** Verified claims behind the number (all contributors, for derived lines). */
  evidence: BrsrEvidence[];
  note?: string;
};

export type BrsrExcluded = BrsrEvidence & {
  kind: string;
  attribute: BrsrAttributeNo | null;
  attributeName: string;
  reason: string;
};

export type BrsrPeriod = {
  periodStart: number;
  periodEnd: number;
  label: string;
  lines: BrsrLine[];
  excluded: BrsrExcluded[];
};

export type BrsrReport = {
  supplier: BrsrSupplier;
  generatedAt: string;
  periods: BrsrPeriod[];
};

const STATUS_LABEL: Record<BrsrStatus, string> = { verified: "Verified", pending: "Pending", rejected: "Rejected" };
export const statusLabel = (s: BrsrStatus) => STATUS_LABEL[s];

function evidenceOf(c: BrsrClaim): BrsrEvidence {
  return {
    claimAddress: c.address,
    status: c.status,
    verifier: c.verifier,
    verifiedOn: istDate(c.verifiedAt),
    evidenceSha256: c.evidenceSha256,
    quantity: c.quantity,
    unit: c.unit,
  };
}

const METRIC_ORDER: BrsrMetricKey[] = [
  "scope1",
  "scope2",
  "scope12Total",
  "waterConsumption",
  "energyTotal",
  "renewableProcured",
  "renewableShare",
  "wasteDiverted",
];

/** Build the headline lines and exclusions for one reporting period. */
export function buildPeriod(claims: BrsrClaim[]): Omit<BrsrPeriod, "periodStart" | "periodEnd" | "label"> {
  const sums = new Map<BrsrMetricKey, { value: number; evidence: BrsrEvidence[] }>();
  const excluded: BrsrExcluded[] = [];

  for (const c of claims) {
    const metric = KIND_TO_METRIC[c.kind];
    const def = metric ? BRSR_METRICS[metric] : null;
    const base = {
      ...evidenceOf(c),
      kind: c.kind,
      attribute: def?.attribute ?? null,
      attributeName: def ? BRSR_ATTRIBUTES[def.attribute] : "Not mapped to BRSR Core",
    };
    if (!metric) {
      excluded.push({ ...base, reason: "Claim kind is not a BRSR Core attribute" });
      continue;
    }
    if (c.status !== "verified") {
      excluded.push({ ...base, reason: `${statusLabel(c.status)}: not counted in totals` });
      continue;
    }
    const v = normalizeQuantity(c.kind, c.quantity, c.unit);
    if (v === null) {
      excluded.push({ ...base, reason: `Unit "${c.unit}" cannot be converted to ${def!.unit}` });
      continue;
    }
    const cur = sums.get(metric) ?? { value: 0, evidence: [] };
    cur.value += v;
    cur.evidence.push(evidenceOf(c));
    sums.set(metric, cur);
  }

  const lines: BrsrLine[] = [];
  const line = (metric: BrsrMetricKey, value: number, evidence: BrsrEvidence[], extra: Partial<BrsrLine> = {}) => {
    const def = BRSR_METRICS[metric];
    lines.push({
      metric,
      attribute: def.attribute,
      attributeName: BRSR_ATTRIBUTES[def.attribute],
      label: def.label,
      value: round(value),
      unit: def.unit,
      evidence,
      ...extra,
    });
  };

  for (const metric of METRIC_ORDER) {
    const s = sums.get(metric);
    if (metric === "scope12Total") {
      const s1 = sums.get("scope1");
      const s2 = sums.get("scope2");
      if (s1 || s2) {
        const missing = !s1 ? "Scope 1" : !s2 ? "Scope 2" : null;
        line(metric, (s1?.value ?? 0) + (s2?.value ?? 0), [...(s1?.evidence ?? []), ...(s2?.evidence ?? [])], {
          note: missing ? `No verified ${missing} claim this period; total covers available scope only` : undefined,
        });
      }
      continue;
    }
    if (metric === "renewableShare") {
      const re = sums.get("renewableProcured");
      const en = sums.get("energyTotal");
      if (re && en && en.value > 0) {
        const share = ((re.value * MWH_TO_GJ) / en.value) * 100;
        line(metric, round(share, 2), [...re.evidence, ...en.evidence], {
          note: share > 100 ? "Certificates exceed energy consumed in this period" : undefined,
        });
      }
      continue;
    }
    if (!s) continue;
    if (metric === "energyTotal") {
      line(metric, s.value, s.evidence, { rawValue: round(s.value / KWH_TO_GJ, 3), rawUnit: "kWh" });
    } else if (metric === "renewableProcured") {
      line(metric, s.value, s.evidence, { rawValue: round(s.value * MWH_TO_GJ), rawUnit: "GJ" });
    } else {
      line(metric, s.value, s.evidence);
    }
  }

  return { lines, excluded };
}

/** Group claims by (period_start, period_end) and build the report, oldest period first. */
export function buildBrsrReport(supplier: BrsrSupplier, claims: BrsrClaim[], generatedAt: Date = new Date()): BrsrReport {
  const groups = new Map<string, BrsrClaim[]>();
  for (const c of claims) {
    const key = `${c.periodStart}:${c.periodEnd}`;
    const g = groups.get(key);
    if (g) g.push(c);
    else groups.set(key, [c]);
  }
  const periods = [...groups.values()]
    .map((g) => ({
      periodStart: g[0].periodStart,
      periodEnd: g[0].periodEnd,
      label: periodLabel(g[0].periodStart, g[0].periodEnd),
      ...buildPeriod(g),
    }))
    .sort((a, b) => a.periodStart - b.periodStart || a.periodEnd - b.periodEnd);
  return { supplier, generatedAt: generatedAt.toISOString(), periods };
}

// ---------------------------------------------------------------- CSV

export const BRSR_CSV_HEADER = [
  "supplier_name",
  "gstin",
  "supplier_record",
  "reporting_period",
  "period_start",
  "period_end",
  "brsr_core_attribute_no",
  "brsr_core_attribute",
  "parameter",
  "value",
  "unit",
  "raw_value",
  "raw_unit",
  "counts_toward_total",
  "status",
  "onchain_claims",
  "verifiers",
  "verified_on",
  "evidence_sha256",
  "note",
  "generated_at",
] as const;

export function csvEscape(v: string | number | undefined | null): string {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const join = (xs: (string | null)[]) => [...new Set(xs.filter(Boolean))].join("; ");

/** One row per BRSR Core parameter per period, then one row per excluded (pending/rejected) claim. */
export function brsrRows(report: BrsrReport): string[][] {
  const { supplier: s, generatedAt } = report;
  const rows: string[][] = [];
  for (const p of report.periods) {
    const head = [s.name, s.gstin, s.address, p.label, istDate(p.periodStart), istDate(p.periodEnd)];
    for (const l of p.lines) {
      rows.push([
        ...head,
        String(l.attribute),
        l.attributeName,
        l.label,
        String(l.value),
        l.unit,
        l.rawValue === undefined ? "" : String(l.rawValue),
        l.rawUnit ?? "",
        "yes",
        "Verified",
        join(l.evidence.map((e) => e.claimAddress)),
        join(l.evidence.map((e) => e.verifier)),
        join(l.evidence.map((e) => e.verifiedOn)),
        join(l.evidence.map((e) => e.evidenceSha256)),
        l.note ?? "",
        generatedAt,
      ]);
    }
    for (const x of p.excluded) {
      rows.push([
        ...head,
        x.attribute === null ? "" : String(x.attribute),
        x.attributeName,
        x.kind,
        String(x.quantity),
        x.unit,
        "",
        "",
        "no",
        statusLabel(x.status),
        x.claimAddress,
        x.verifier ?? "",
        x.verifiedOn,
        x.evidenceSha256,
        x.reason,
        generatedAt,
      ]);
    }
  }
  return rows;
}

/** CSV for one or many suppliers. Starts with a UTF-8 BOM so Excel opens it cleanly. */
export function brsrToCsv(reports: BrsrReport[]): string {
  const lines = [BRSR_CSV_HEADER.join(","), ...reports.flatMap(brsrRows).map((r) => r.map(csvEscape).join(","))];
  return "﻿" + lines.join("\r\n");
}
