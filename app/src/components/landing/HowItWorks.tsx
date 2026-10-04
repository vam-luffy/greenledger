"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { CheckIcon } from "./icons";
import { useMediaValue } from "./useMediaValue";

type P = MotionValue<number>;

const steps = [
  {
    k: "01",
    title: "Supplier records a claim",
    body: "Energy, Scope 1 and 2 emissions, renewable certificates, water, waste. The evidence document is hashed with SHA-256; the hash is anchored on-chain, and the file can be kept private or stored for verifiers.",
  },
  {
    k: "02",
    title: "Accredited verifier signs",
    body: "An approved verifier checks the evidence against the hash and signs an on-chain approval or rejection. Permanent, public, timestamped.",
  },
  {
    k: "03",
    title: "Buyer scans one link",
    body: "Any procurement team scans the QR or opens the link and sees every claim, who verified it, and when. No PDF chasing.",
  },
];

// Stage boundaries on the section's 0..1 scroll progress.
const S1 = 0.3;
const S2 = 0.63;
const E = 0.03;

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const railScale = useTransform(p, [0, 0.95], [0, 1]);
  const glowX = useTransform(p, [0, 1], ["-25%", "25%"]);

  return (
    <section ref={ref} id="how-it-works" aria-labelledby="how-heading" className="relative h-[380vh] lg:h-[420vh]">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <motion.div
          aria-hidden
          style={{ x: glowX }}
          className="gl-depth pointer-events-none absolute inset-x-[-20%] top-1/2 -z-10 h-[70vh] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgb(16_185_129/0.14),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgb(16_185_129/0.16),transparent_65%)]"
        />
        <div className="mx-auto grid h-full w-full max-w-6xl grid-rows-[auto_minmax(0,1fr)] gap-4 px-4 pb-6 pt-8 lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-1 lg:items-center lg:gap-12 lg:py-0">
          {/* Copy column */}
          <div className="flex flex-col gap-4 lg:gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                How it works
              </p>
              <h2
                id="how-heading"
                className="mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
              >
                From evidence to trust in three signatures.
              </h2>
            </div>

            {/* Mobile: segmented progress and one crossfading step */}
            <div className="lg:hidden">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <Segment key={i} i={i} p={p} />
                ))}
              </div>
              <div className="relative mt-3 h-[7.5rem]">
                {steps.map((s, i) => (
                  <MobileStep key={s.k} i={i} p={p} step={s} />
                ))}
              </div>
            </div>

            {/* Desktop: full list with a progress rail */}
            <ol className="relative hidden flex-col gap-7 pl-8 lg:flex">
              <span aria-hidden className="absolute bottom-1 left-[5px] top-1 w-px bg-zinc-200 dark:bg-zinc-800" />
              <motion.span
                aria-hidden
                style={{ scaleY: railScale }}
                className="absolute bottom-1 left-[5px] top-1 w-px origin-top bg-emerald-500"
              />
              {steps.map((s, i) => (
                <DesktopStep key={s.k} i={i} p={p} step={s} />
              ))}
            </ol>
          </div>

          {/* Stage */}
          <Stage p={p} />
        </div>
      </div>
    </section>
  );
}

function stepOpacityRange(i: number): [number[], number[]] {
  if (i === 0) return [[0, S1 - E, S1 + E], [1, 1, 0.3]];
  if (i === 1) return [[S1 - E, S1 + E, S2 - E, S2 + E], [0.3, 1, 1, 0.3]];
  return [[S2 - E, S2 + E, 1], [0.3, 1, 1]];
}

function DesktopStep({ i, p, step }: { i: number; p: P; step: (typeof steps)[number] }) {
  const [inp, out] = stepOpacityRange(i);
  const opacity = useTransform(p, inp, out);
  const dot = useTransform(p, inp, out.map((o) => (o === 1 ? 1 : 0)));
  return (
    <motion.li style={{ opacity }} className="relative">
      <span
        aria-hidden
        className="absolute -left-8 top-1 h-[11px] w-[11px] rounded-full border-2 border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950"
      />
      <motion.span
        aria-hidden
        style={{ opacity: dot }}
        className="absolute -left-8 top-1 h-[11px] w-[11px] rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgb(16_185_129/0.2)]"
      />
      <div className="font-mono text-xs text-emerald-700 dark:text-emerald-400">{step.k}</div>
      <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">{step.body}</p>
    </motion.li>
  );
}

function Segment({ i, p }: { i: number; p: P }) {
  const start = [0, S1, S2][i];
  const end = [S1, S2, 0.95][i];
  const scaleX = useTransform(p, [start, end], [0, 1]);
  return (
    <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
      <motion.span style={{ scaleX }} className="absolute inset-0 origin-left bg-emerald-500" />
    </span>
  );
}

function MobileStep({ i, p, step }: { i: number; p: P; step: (typeof steps)[number] }) {
  const ranges: [number[], number[]][] = [
    [[0, S1 - E, S1], [1, 1, 0]],
    [[S1 - E, S1, S2 - E, S2], [0, 1, 1, 0]],
    [[S2 - E, S2, 1], [0, 1, 1]],
  ];
  const opacity = useTransform(p, ranges[i][0], ranges[i][1]);
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400">{step.k}</span>
        <h3 className="text-base font-semibold">{step.title}</h3>
      </div>
      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{step.body}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------------ */
/* Stage: three layered mock UIs in one grid cell, driven by scroll progress */
/* ------------------------------------------------------------------------ */

function Stage({ p }: { p: P }) {
  // Claim card: tilts up on entry, shifts aside for the verifier, then collapses into the record.
  const claimRotX = useTransform(p, [0, 0.14], [16, 0]);
  const claimShift = useMediaValue("(min-width: 1024px)", -52, -6);
  const claimShiftT = useTransform(p, [S1, S1 + 0.08], [0, 1]);
  const claimX = useTransform(() => claimShiftT.get() * claimShift.get());
  const claimY = useTransform(p, [S1, S1 + 0.08, S2, S2 + 0.1], [0, -22, -22, -120]);
  const claimScale = useTransform(p, [S2, S2 + 0.1], [1, 0.68]);
  const claimOpacity = useTransform(p, [S2 + 0.02, S2 + 0.09], [1, 0]);

  // Verifier panel
  const verOpacity = useTransform(p, [S1, S1 + 0.06, S2 - 0.02, S2 + 0.04], [0, 1, 1, 0]);
  const verX = useTransform(p, [S1, S1 + 0.08, S2 - 0.02, S2 + 0.06], [70, 0, 0, 50]);
  const verY = useTransform(p, [S1, S1 + 0.08], [30, 0]);

  // Public record
  const recOpacity = useTransform(p, [S2 + 0.03, S2 + 0.11], [0, 1]);
  const recScale = useTransform(p, [S2, S2 + 0.14], [0.82, 1]);
  const recY = useTransform(p, [S2, S2 + 0.14], [110, 0]);

  // Depth chips at different parallax rates
  const chipA = useTransform(p, [0, 1], [80, -80]);
  const chipB = useTransform(p, [0, 1], [-40, 120]);
  const chipC = useTransform(p, [0, 1], [140, -140]);
  const chipD = useTransform(p, [0, 1], [-90, 60]);

  return (
    <div className="relative min-h-0 [perspective:1400px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
        <Chip style={chipA} className="left-[2%] top-[10%]">SHA-256</Chip>
        <Chip style={chipB} className="right-[2%] top-[4%]">Ed25519 signature</Chip>
        <Chip style={chipC} className="bottom-[14%] left-[0%]">Program-derived address</Chip>
        <Chip style={chipD} className="bottom-[4%] right-[6%]">BRSR Core</Chip>
      </div>

      <div className="relative grid h-full place-items-center">
        <motion.div
          style={{ rotateX: claimRotX, x: claimX, y: claimY, scale: claimScale, opacity: claimOpacity }}
          className="gl-depth w-[min(310px,88%)] [grid-area:1/1] sm:w-[340px]"
        >
          <ClaimCard p={p} />
        </motion.div>

        <motion.div
          style={{ opacity: verOpacity, x: verX, y: verY }}
          className="gl-depth z-10 mb-1 mr-0 w-[210px] self-end justify-self-end [grid-area:1/1] sm:mb-10 sm:w-[230px] lg:-mr-4"
        >
          <VerifierPanel p={p} />
        </motion.div>

        <motion.div
          style={{ opacity: recOpacity, scale: recScale, y: recY }}
          className="gl-depth z-20 w-[min(300px,88%)] [grid-area:1/1] sm:w-[340px]"
        >
          <PublicRecord p={p} />
        </motion.div>
      </div>
    </div>
  );
}

function Chip({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className: string;
  style: MotionValue<number>;
}) {
  return (
    <motion.span
      style={{ y: style }}
      className={`gl-depth absolute rounded-full border border-zinc-200 bg-white/70 px-3 py-1 font-mono text-[11px] text-zinc-500 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 ${className}`}
    >
      {children}
    </motion.span>
  );
}

const fields = [
  { label: "Category", value: "Electricity, Scope 2" },
  { label: "Quantity", value: "48,200 kWh" },
  { label: "Period", value: "Apr to Jun 2026" },
  { label: "Evidence", value: "tneb_bill_q1.pdf" },
];

function Field({ i, p, label, value }: { i: number; p: P; label: string; value: string }) {
  const a = 0.015 + i * 0.04;
  const valueOpacity = useTransform(p, [a, a + 0.04], [0, 1]);
  const valueX = useTransform(p, [a, a + 0.04], [10, 0]);
  const skeleton = useTransform(p, [a, a + 0.03], [1, 0]);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 py-2 last:border-0 dark:border-zinc-800/80">
      <span className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="relative flex h-5 min-w-[7rem] items-center justify-end">
        <motion.span
          style={{ opacity: skeleton }}
          className="absolute right-0 h-2.5 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800"
        />
        <motion.span style={{ opacity: valueOpacity, x: valueX }} className="gl-depth text-sm font-medium">
          {value}
        </motion.span>
      </span>
    </div>
  );
}

function ClaimCard({ p }: { p: P }) {
  const upload = useTransform(p, [0.14, 0.2], [0, 1]);
  const hashCover = useTransform(p, [0.18, 0.27], [1, 0]);
  const pending = useTransform(p, [S1 + 0.11, S1 + 0.13], [1, 0]);
  const verified = useTransform(p, [S1 + 0.11, S1 + 0.13], [0, 1]);
  const glow = useTransform(p, [S1 + 0.12, S1 + 0.16], [0, 1]);

  // Verifier stamp slams down with a ripple.
  const stampScale = useTransform(p, [S1 + 0.09, S1 + 0.13], [2.6, 1]);
  const stampOpacity = useTransform(p, [S1 + 0.09, S1 + 0.12], [0, 1]);
  const stampRotate = useTransform(p, [S1 + 0.09, S1 + 0.13], [-38, -12]);
  const rippleScale = useTransform(p, [S1 + 0.13, S1 + 0.24], [0.9, 2.3]);
  const rippleOpacity = useTransform(p, [S1 + 0.125, S1 + 0.135, S1 + 0.24], [0, 0.55, 0]);

  return (
    <div className="relative rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl shadow-zinc-900/10 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/50">
      <motion.div
        aria-hidden
        style={{ opacity: glow }}
        className="pointer-events-none absolute -inset-px rounded-2xl ring-2 ring-emerald-500/70 shadow-[0_0_60px_-10px_rgb(16_185_129/0.6)]"
      />
      <div className="flex items-end gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-zinc-500">New claim</div>
          <div className="font-semibold">Claim #0142</div>
        </div>
        <span className="relative mb-0.5 inline-grid">
          <motion.span
            style={{ opacity: pending }}
            className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 [grid-area:1/1] dark:bg-amber-900/40 dark:text-amber-200"
          >
            Pending
          </motion.span>
          <motion.span
            style={{ opacity: verified }}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white [grid-area:1/1]"
          >
            <CheckIcon className="h-3 w-3" /> Verified
          </motion.span>
        </span>
      </div>

      <div className="mt-3">
        {fields.map((f, i) => (
          <Field key={f.label} i={i} p={p} label={f.label} value={f.value} />
        ))}
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <motion.div style={{ scaleX: upload }} className="h-full origin-left bg-emerald-500" />
      </div>

      <div className="relative mt-3 overflow-hidden rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-950/60">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500">SHA-256 of evidence</div>
        <div className="mt-0.5 break-all font-mono text-[11px] leading-4 text-emerald-700 dark:text-emerald-400">
          9f2c41abe07d3c88b51f6a29d4e077c1 5a03e8f2c19b6d47a0e2f5c8b3d91e64
        </div>
        <motion.div
          aria-hidden
          style={{ scaleX: hashCover }}
          className="absolute inset-y-0 right-0 w-full origin-right bg-zinc-50 dark:bg-zinc-950"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
        <span>Shakti Textiles, Tirupur</span>
        <span className="font-mono">33AABCS1429B1Z5</span>
      </div>

      {/* Stamp */}
      <div className="pointer-events-none absolute -right-3 -top-7 sm:-right-6">
        <motion.div
          aria-hidden
          style={{ scale: rippleScale, opacity: rippleOpacity }}
          className="absolute inset-0 rounded-full border-2 border-emerald-500"
        />
        <motion.div
          style={{ scale: stampScale, opacity: stampOpacity, rotate: stampRotate }}
          className="grid h-[88px] w-[88px] place-items-center rounded-full border-[3px] border-emerald-600 bg-white/90 text-center text-emerald-700 shadow-lg backdrop-blur dark:border-emerald-400 dark:bg-zinc-950/90 dark:text-emerald-300"
        >
          <div className="grid h-[72px] w-[72px] place-items-center rounded-full border border-dashed border-current">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em]">Attested</div>
              <CheckIcon className="mx-auto my-0.5 h-5 w-5" />
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em]">On-chain</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const checks = ["Evidence hash matches", "Quantity and period reviewed", "Supplier GSTIN on file"];

function CheckRow({ i, p, label }: { i: number; p: P; label: string }) {
  const a = S1 + 0.03 + i * 0.02;
  const opacity = useTransform(p, [a, a + 0.02], [0.25, 1]);
  const tick = useTransform(p, [a, a + 0.02], [0, 1]);
  return (
    <motion.li style={{ opacity }} className="flex items-center gap-2 text-xs">
      <span className="relative grid h-4 w-4 place-items-center rounded-full border border-zinc-300 dark:border-zinc-700">
        <motion.span
          style={{ opacity: tick, scale: tick }}
          className="gl-depth absolute inset-0 grid place-items-center rounded-full bg-emerald-500 text-white"
        >
          <CheckIcon className="h-2.5 w-2.5" />
        </motion.span>
      </span>
      {label}
    </motion.li>
  );
}

function VerifierPanel({ p }: { p: P }) {
  const press = useTransform(p, [S1 + 0.085, S1 + 0.095, S1 + 0.11], [1, 0.92, 1]);
  const sig = useTransform(p, [S1 + 0.11, S1 + 0.14], [0, 1]);
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-2xl shadow-zinc-900/15 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95 dark:shadow-black/60">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
          SA
        </span>
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold">Sahyadri Assurance LLP</div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400">Accredited verifier</div>
        </div>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {checks.map((c, i) => (
          <CheckRow key={c} i={i} p={p} label={c} />
        ))}
      </ul>
      <motion.div
        style={{ scale: press }}
        className="gl-depth mt-3 rounded-lg bg-emerald-600 py-2 text-center text-xs font-semibold text-white"
      >
        Approve and sign
      </motion.div>
      <motion.div style={{ opacity: sig }} className="mt-2 truncate font-mono text-[10px] text-zinc-500">
        sig 4kQp7Tz1&hellip;Wm9xZr
      </motion.div>
    </div>
  );
}

const records = [
  { what: "Electricity, Scope 2", qty: "48,200 kWh", when: "12 Jul 2026" },
  { what: "Renewable certificates", qty: "320 MWh", when: "02 Jul 2026" },
  { what: "Water withdrawal", qty: "1,240 kL", when: "18 Jun 2026" },
];

function RecordRow({ i, p, r }: { i: number; p: P; r: (typeof records)[number] }) {
  const a = S2 + 0.12 + i * 0.035;
  const opacity = useTransform(p, [a, a + 0.04], [0, 1]);
  const x = useTransform(p, [a, a + 0.04], [-14, 0]);
  return (
    <motion.li
      style={{ opacity, x }}
      className="gl-depth flex items-center gap-3 border-t border-zinc-100 py-2 dark:border-zinc-800"
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
        <CheckIcon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium">{r.what}</div>
        <div className="truncate text-[10px] text-zinc-500">Sahyadri Assurance, {r.when}</div>
      </div>
      <span className="shrink-0 text-xs font-semibold tabular-nums">{r.qty}</span>
    </motion.li>
  );
}

function PublicRecord({ p }: { p: P }) {
  const toastOpacity = useTransform(p, [S2 + 0.25, S2 + 0.29], [0, 1]);
  const toastY = useTransform(p, [S2 + 0.25, S2 + 0.29], [12, 0]);
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-emerald-900/15 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/60">
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/60">
          <span className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </span>
          <span className="truncate rounded-md bg-white px-2 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-zinc-900">
            greenledger.app/s/7xKXq&hellip;pQ2
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Public supplier record</div>
              <div className="mt-0.5 font-semibold leading-tight">Shakti Textiles</div>
              <div className="font-mono text-[10px] text-zinc-500">GSTIN 33AABCS1429B1Z5</div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                <CheckIcon className="h-3 w-3" /> 3 of 3 verified
              </div>
            </div>
            <div className="relative shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-1.5 dark:border-zinc-700">
              <QRCodeSVG value="https://greenledger.app/s/demo" size={72} bgColor="#ffffff" fgColor="#064e3b" />
              <div aria-hidden className="gl-scan pointer-events-none absolute inset-0">
                <div className="h-0.5 w-full bg-emerald-400 shadow-[0_0_12px_2px_rgb(52_211_153/0.8)]" />
              </div>
            </div>
          </div>
          <ul className="mt-3">
            {records.map((r, i) => (
              <RecordRow key={r.what} i={i} p={p} r={r} />
            ))}
          </ul>
        </div>
      </div>
      <motion.div
        style={{ opacity: toastOpacity, y: toastY }}
        className="gl-depth absolute -bottom-5 left-1/2 w-max max-w-[92%] -translate-x-1/2 rounded-full text-center border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
      >
        Opened by a buyer in Berlin, no account needed
      </motion.div>
    </div>
  );
}
