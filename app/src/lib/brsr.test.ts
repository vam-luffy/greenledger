import { describe, expect, it } from "vitest";
import {
  BRSR_CSV_HEADER,
  brsrRows,
  brsrToCsv,
  buildBrsrReport,
  buildPeriod,
  csvEscape,
  istDate,
  normalizeQuantity,
  periodLabel,
  round,
  type BrsrClaim,
} from "./brsr";

// FY 2025-26 in IST: 2025-04-01 00:00 IST .. 2026-03-31 00:00 IST
const FY_START = Date.UTC(2025, 2, 31, 18, 30) / 1000;
const FY_END = Date.UTC(2026, 2, 30, 18, 30) / 1000;
const Q1_START = FY_START;
const Q1_END = Date.UTC(2025, 5, 29, 18, 30) / 1000;

let n = 0;
function claim(p: Partial<BrsrClaim>): BrsrClaim {
  n++;
  return {
    address: `Claim${n}`,
    kind: "energyConsumption",
    periodStart: FY_START,
    periodEnd: FY_END,
    quantity: 0,
    unit: "kWh",
    status: "verified",
    verifier: "Verifier1",
    verifiedAt: Date.UTC(2026, 4, 2, 6) / 1000,
    evidenceSha256: "ab".repeat(32),
    ...p,
  };
}

const supplier = { name: "Shakti Textiles", gstin: "24AAACS1234F1Z5", address: "Supp1" };

describe("unit conversion", () => {
  it("converts kWh to GJ at 0.0036", () => {
    expect(round(normalizeQuantity("energyConsumption", 48250, "kWh")!)).toBe(173.7);
    expect(normalizeQuantity("energyConsumption", 1, "MWh")).toBe(3.6);
    expect(normalizeQuantity("energyConsumption", 5, "GJ")).toBe(5);
  });
  it("normalises other units and rejects unknown ones", () => {
    expect(normalizeQuantity("scope2Emissions", 1500, "kgCO2e")).toBe(1.5);
    expect(normalizeQuantity("waterUsage", 2000, "litres")).toBe(2);
    expect(normalizeQuantity("wasteDiverted", 12.5, "t")).toBe(12.5);
    expect(normalizeQuantity("energyConsumption", 1, "BTU")).toBeNull();
    expect(normalizeQuantity("unknownKind", 1, "t")).toBeNull();
  });
});

describe("periods", () => {
  it("formats dates in IST regardless of machine time zone", () => {
    expect(istDate(FY_START)).toBe("2025-04-01");
    expect(istDate(FY_END)).toBe("2026-03-31");
    expect(istDate(0)).toBe("");
  });
  it("labels Indian financial years", () => {
    expect(periodLabel(FY_START, FY_END)).toBe("FY 2025-26");
    expect(periodLabel(Q1_START, Q1_END)).toBe("2025-04-01 to 2025-06-30");
  });
});

describe("demo supplier mapping (Shakti Textiles)", () => {
  const claims = [
    claim({ kind: "energyConsumption", quantity: 48250, unit: "kWh" }),
    claim({ kind: "scope2Emissions", quantity: 34.58, unit: "tCO2e" }),
    claim({ kind: "renewableCertificate", quantity: 12000, unit: "MWh", status: "rejected" }),
    claim({ kind: "waterUsage", quantity: 900, unit: "kL", status: "pending", verifier: null, verifiedAt: 0 }),
    claim({ kind: "wasteDiverted", quantity: 12.5, unit: "t" }),
  ];
  const report = buildBrsrReport(supplier, claims, new Date("2026-10-04T00:00:00Z"));
  const period = report.periods[0];
  const byMetric = Object.fromEntries(period.lines.map((l) => [l.metric, l]));

  it("puts everything in one FY period", () => {
    expect(report.periods).toHaveLength(1);
    expect(period.label).toBe("FY 2025-26");
  });
  it("maps verified energy to Attribute 3 in GJ with raw kWh", () => {
    expect(byMetric.energyTotal.attribute).toBe(3);
    expect(byMetric.energyTotal.value).toBe(173.7);
    expect(byMetric.energyTotal.rawValue).toBe(48250);
    expect(byMetric.energyTotal.rawUnit).toBe("kWh");
    expect(byMetric.energyTotal.evidence[0]).toMatchObject({ status: "verified", verifier: "Verifier1", verifiedOn: "2026-05-02" });
  });
  it("maps Scope 2 to Attribute 1 and totals Scope 1+2 with a missing-scope note", () => {
    expect(byMetric.scope2.attribute).toBe(1);
    expect(byMetric.scope2.value).toBe(34.58);
    expect(byMetric.scope1).toBeUndefined();
    expect(byMetric.scope12Total.value).toBe(34.58);
    expect(byMetric.scope12Total.note).toMatch(/No verified Scope 1/);
  });
  it("maps waste to Attribute 4 (circularity)", () => {
    expect(byMetric.wasteDiverted.attribute).toBe(4);
    expect(byMetric.wasteDiverted.value).toBe(12.5);
  });
  it("keeps the rejected REC and pending water out of the totals", () => {
    expect(byMetric.renewableProcured).toBeUndefined();
    expect(byMetric.renewableShare).toBeUndefined();
    expect(byMetric.waterConsumption).toBeUndefined();
    expect(period.excluded.map((x) => [x.kind, x.status, x.attribute])).toEqual([
      ["renewableCertificate", "rejected", 3],
      ["waterUsage", "pending", 2],
    ]);
  });
  it("emits a CSV row per parameter plus one per excluded claim", () => {
    const rows = brsrRows(report);
    expect(rows).toHaveLength(period.lines.length + 2);
    rows.forEach((r) => expect(r).toHaveLength(BRSR_CSV_HEADER.length));
    const csv = brsrToCsv([report]);
    expect(csv.startsWith("﻿supplier_name,gstin")).toBe(true);
    expect(csv).toContain("Total energy consumed,173.7,GJ,48250,kWh,yes,Verified");
    expect(csv).toContain("Renewable energy certificate (claim not counted),12000,MWh,,,no,Rejected,");
    expect(csv).toContain(",no,Pending,");
  });
});

describe("aggregation", () => {
  it("sums several verified claims, Scope 1 + 2, and renewable share", () => {
    const { lines } = buildPeriod([
      claim({ kind: "energyConsumption", quantity: 100000, unit: "kWh" }), // 360 GJ
      claim({ kind: "energyConsumption", quantity: 50, unit: "MWh" }), // 180 GJ
      claim({ kind: "renewableCertificate", quantity: 30, unit: "MWh" }), // 108 GJ
      claim({ kind: "scope1Emissions", quantity: 10.1, unit: "tCO2e" }),
      claim({ kind: "scope2Emissions", quantity: 20.2, unit: "tCO2e" }),
    ]);
    const m = Object.fromEntries(lines.map((l) => [l.metric, l]));
    expect(m.energyTotal.value).toBe(540);
    expect(m.energyTotal.rawValue).toBe(150000);
    expect(m.energyTotal.evidence).toHaveLength(2);
    expect(m.renewableProcured.value).toBe(30);
    expect(m.renewableShare.value).toBe(20);
    expect(m.renewableShare.evidence).toHaveLength(3);
    expect(m.scope12Total.value).toBe(30.3);
    expect(m.scope12Total.note).toBeUndefined();
  });
  it("flags renewable share above 100%", () => {
    const { lines } = buildPeriod([
      claim({ kind: "energyConsumption", quantity: 1000, unit: "kWh" }),
      claim({ kind: "renewableCertificate", quantity: 2, unit: "MWh" }),
    ]);
    expect(lines.find((l) => l.metric === "renewableShare")!.note).toMatch(/exceed/);
  });
  it("excludes verified claims with unconvertible units", () => {
    const { lines, excluded } = buildPeriod([claim({ kind: "waterUsage", quantity: 5, unit: "gallons" })]);
    expect(lines).toHaveLength(0);
    expect(excluded[0].reason).toMatch(/cannot be converted/);
  });
  it("splits claims into periods and orders them oldest first", () => {
    const r = buildBrsrReport(supplier, [
      claim({ periodStart: FY_START, periodEnd: FY_END, quantity: 1 }),
      claim({ periodStart: Q1_START, periodEnd: Q1_END, quantity: 2 }),
      claim({ periodStart: FY_START, periodEnd: FY_END, quantity: 3 }),
    ]);
    expect(r.periods.map((p) => p.label)).toEqual(["2025-04-01 to 2025-06-30", "FY 2025-26"]);
    expect(r.periods[1].lines[0].rawValue).toBe(4);
  });
});

describe("csvEscape", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(csvEscape("a,b")).toBe('"a,b"');
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(12.5)).toBe("12.5");
  });
});
