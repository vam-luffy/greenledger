"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowIcon, CheckIcon } from "./icons";
import { easeOut } from "./Reveal";

const surfaces = [
  {
    href: "/supplier",
    name: "Supplier console",
    who: "For MSMEs",
    blurb: "Register with GSTIN, record claims, attach hashed evidence.",
    mock: <SupplierMock />,
  },
  {
    href: "/verify",
    name: "Verifier console",
    who: "For assurance providers",
    blurb: "A queue of pending claims across suppliers. Approve or reject with a note.",
    mock: <VerifierMock />,
  },
  {
    href: "/buyer",
    name: "Buyer dashboard",
    who: "For procurement teams",
    blurb: "Watchlist, compliance summary, BRSR CSV export.",
    mock: <BuyerMock />,
  },
  {
    href: "/lookup",
    name: "Public record",
    who: "For anyone",
    blurb: "Find a supplier by wallet or GSTIN. QR code, share link, every attestation.",
    mock: <RecordMock />,
  },
];

export function ProductSurfaces() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const maxShift = useMotionValue(0);

  // Pinned horizontal scroll on desktop: the section is made exactly as tall as the
  // track overflow, so vertical scroll distance maps 1:1 to horizontal travel.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(() => -scrollYProgress.get() * maxShift.get());

  // Measure on mount and resize. Mobile, short screens and reduced motion use a native swipe row.
  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;
    const pinQuery = window.matchMedia(
      "(min-width: 768px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)"
    );
    const measure = () => {
      const overflow = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const pin = pinQuery.matches && overflow > 0;
      maxShift.set(pin ? overflow : 0);
      section.style.height = pin ? `calc(100svh + ${overflow}px)` : "";
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(track);
    pinQuery.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      pinQuery.removeEventListener("change", measure);
    };
  }, [maxShift]);

  return (
    <section ref={sectionRef} aria-labelledby="surfaces-heading" className="relative overflow-x-clip">
      <div className="sticky top-0 mx-auto flex max-w-6xl flex-col justify-center px-4 py-16 sm:py-20 md:min-h-svh md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
              The product
            </p>
            <h2 id="surfaces-heading" className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Four surfaces. One source of truth.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Every screen reads the same on-chain accounts, so what the verifier signed is exactly
            what the buyer sees.
            <span className="mt-1 block text-xs text-zinc-500 md:hidden">Swipe to explore &rarr;</span>
          </p>
        </motion.div>

        <div
          ref={viewportRef}
          className="gl-hscroll gl-noscrollbar -mx-4 mt-10 snap-x snap-mandatory overflow-x-auto px-4 pb-6 md:mx-0 md:snap-none md:overflow-visible md:px-0"
        >
          <motion.div ref={trackRef} style={{ x }} className="gl-depth flex w-max gap-4 md:gap-6">
            {surfaces.map((s, i) => (
              <motion.div
                key={s.href}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, ease: easeOut, delay: i * 0.1 }}
                className="snap-start"
              >
                <Link
                  href={s.href}
                  className="group block w-[min(82vw,320px)] rounded-3xl border border-zinc-200 bg-white/80 p-3 shadow-xl shadow-zinc-900/5 backdrop-blur transition-[border-color,translate,box-shadow] duration-500 hover:-translate-y-2 hover:border-emerald-500/50 hover:shadow-emerald-900/10 sm:w-[380px] lg:w-[420px] dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-black/30 dark:hover:border-emerald-400/40"
                >
                  <BrowserFrame path={s.href}>{s.mock}</BrowserFrame>
                  <div className="flex items-end justify-between gap-3 px-2 pb-2 pt-4">
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {s.who}
                      </div>
                      <h3 className="mt-0.5 text-lg font-semibold">{s.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{s.blurb}</p>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-200 transition-[background-color,border-color,color] duration-300 group-hover:border-emerald-600 group-hover:bg-emerald-600 group-hover:text-white dark:border-zinc-700">
                      <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-45" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function BrowserFrame({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <div aria-hidden className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <span className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400/70" />
          <span className="h-2 w-2 rounded-full bg-amber-400/70" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
        </span>
        <span className="flex-1 truncate rounded-md bg-white px-2 py-0.5 text-center font-mono text-[10px] text-zinc-500 dark:bg-zinc-900">
          greenledger.app{path}
        </span>
      </div>
      <div className="h-[230px] overflow-hidden p-3 sm:h-[250px] md:h-[240px]">{children}</div>
    </div>
  );
}

function MockLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[9px] uppercase tracking-wider text-zinc-500">{children}</div>;
}

function SupplierMock() {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold">Record a claim</div>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
          Registered
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Category", "Scope 1 emissions"],
          ["Quantity", "12.4 tCO2e"],
          ["Period", "FY26 Q1"],
          ["Unit", "tonnes"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
            <MockLabel>{k}</MockLabel>
            <div className="truncate text-[11px] font-medium">{v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-dashed border-emerald-500/50 bg-emerald-50/60 px-2 py-2 dark:bg-emerald-950/30">
        <div className="text-[11px] font-medium">diesel_genset_log.pdf</div>
        <div className="truncate font-mono text-[9px] text-emerald-700 dark:text-emerald-400">
          sha256 c41e0b9a77f2d35e8a1046bd29fe5c03
        </div>
      </div>
      <div className="mt-auto rounded-md bg-emerald-600 py-1.5 text-center text-[11px] font-semibold text-white">
        Record on-chain
      </div>
    </div>
  );
}

function VerifierMock() {
  const rows = [
    ["Shakti Textiles", "Electricity", "48,200 kWh"],
    ["Kaveri Castings", "Scope 1", "12.4 tCO2e"],
    ["Nilgiri Dyes", "Water", "1,240 kL"],
    ["Vasan Polymers", "Waste", "3.1 t"],
  ];
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold">Pending claims</div>
        <span className="font-mono text-[10px] text-zinc-500">4 in queue</span>
      </div>
      {rows.map(([s, c, q], i) => (
        <div
          key={s}
          className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-medium">{s}</div>
            <div className="truncate text-[9px] text-zinc-500">
              {c}, {q}
            </div>
          </div>
          {i === 0 ? (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-semibold text-white">
              <CheckIcon className="h-2.5 w-2.5" /> Signed
            </span>
          ) : (
            <span className="flex gap-1">
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                Approve
              </span>
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                Reject
              </span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function BuyerMock() {
  const rows = [
    ["Shakti Textiles", 1],
    ["Kaveri Castings", 0.75],
    ["Nilgiri Dyes", 0.5],
    ["Vasan Polymers", 0.85],
  ] as const;
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold">Watchlist</div>
        <span className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-[9px] font-medium dark:border-zinc-700">
          Export BRSR CSV
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Suppliers", "4"],
          ["Claims", "23"],
          ["Verified", "78%"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
            <MockLabel>{k}</MockLabel>
            <div className="text-sm font-semibold tabular-nums">{v}</div>
          </div>
        ))}
      </div>
      {rows.map(([name, pct]) => (
        <div key={name}>
          <div className="flex justify-between text-[10px]">
            <span className="font-medium">{name}</span>
            <span className="tabular-nums text-zinc-500">{Math.round(pct * 100)}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full origin-left rounded-full bg-emerald-500" style={{ transform: `scaleX(${pct})` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecordMock() {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <MockLabel>Public supplier record</MockLabel>
          <div className="text-sm font-semibold">Shakti Textiles</div>
          <div className="font-mono text-[9px] text-zinc-500">GSTIN 33AABCS1429B1Z5</div>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-semibold text-white">
            <CheckIcon className="h-2.5 w-2.5" /> 3 of 3 verified
          </div>
        </div>
        <div className="rounded-md border border-zinc-200 bg-white p-1 dark:border-zinc-700">
          <QRCodeSVG value="https://greenledger.app/s/demo" size={58} bgColor="#ffffff" fgColor="#064e3b" />
        </div>
      </div>
      {[
        ["Electricity, Scope 2", "48,200 kWh"],
        ["Renewable certificates", "320 MWh"],
        ["Water withdrawal", "1,240 kL"],
      ].map(([k, v]) => (
        <div
          key={k}
          className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            <CheckIcon className="h-2.5 w-2.5" />
          </span>
          <span className="flex-1 truncate text-[11px]">{k}</span>
          <span className="text-[11px] font-semibold tabular-nums">{v}</span>
        </div>
      ))}
    </div>
  );
}
