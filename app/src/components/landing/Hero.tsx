"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { CheckIcon } from "./icons";
import { useMediaValue } from "./useMediaValue";

type W = { t: string; accent?: boolean; i: number };
const lines: { words: W[]; muted?: boolean }[] = [
  { words: [{ t: "Supplier", i: 0 }, { t: "ESG", i: 1 }, { t: "data,", i: 2 }] },
  { words: [{ t: "verified", accent: true, i: 3 }, { t: "once.", accent: true, i: 4 }] },
  { words: [{ t: "Trusted", i: 5 }, { t: "everywhere.", i: 6 }], muted: true },
];

const delayVar = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Scroll parallax layers: background slow, copy medium, cards at three depths.
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  // On narrow screens the stack sits under the copy, so depth separation is reduced.
  const depth = useMediaValue("(min-width: 1024px)", 1, 0.25);
  const backY = useTransform(() => scrollYProgress.get() * -50 * depth.get());
  const midY = useTransform(() => scrollYProgress.get() * -130 * depth.get());
  const frontY = useTransform(() => scrollYProgress.get() * -220 * depth.get());

  // Pointer tilt, mouse only. Springs keep it soft.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 110, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 110, damping: 20, mass: 0.6 });
  const rotY = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const rotX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const frontX = useTransform(sx, [-0.5, 0.5], [-16, 16]);

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onPointerLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate overflow-hidden"
    >
      {/* Animated gradient mesh */}
      <motion.div aria-hidden style={{ y: bgY }} className="gl-depth absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(16_185_129/0.10),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgb(16_185_129/0.16),transparent_60%)]" />
        <div className="gl-drift-a absolute -left-[20%] -top-[20%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgb(16_185_129/0.26),transparent_62%)] dark:bg-[radial-gradient(circle,rgb(16_185_129/0.28),transparent_62%)]" />
        <div className="gl-drift-b absolute -right-[25%] top-[5%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgb(45_212_191/0.20),transparent_62%)] dark:bg-[radial-gradient(circle,rgb(20_184_166/0.20),transparent_62%)]" />
        <div className="gl-drift-c absolute bottom-[-35%] left-[25%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,rgb(163_230_53/0.16),transparent_62%)] dark:bg-[radial-gradient(circle,rgb(132_204_22/0.10),transparent_62%)]" />
        {/* Ledger grid, faded at the edges */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(113_113_122/0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgb(113_113_122/0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_72%)]" />
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="gl-grain gl-grain-anim absolute -inset-[10%]" />
      </div>
      {/* Soft fade into the page below */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-zinc-50 dark:to-zinc-950" />

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-6xl items-center gap-10 px-4 pb-24 pt-12 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pb-28">
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="gl-depth flex flex-col gap-7">
          <p
            className="gl-rise inline-flex w-fit items-center gap-2 rounded-full border border-emerald-600/20 bg-white/60 px-3 py-1 text-xs font-medium text-emerald-800 backdrop-blur dark:border-emerald-400/20 dark:bg-zinc-900/60 dark:text-emerald-300"
            style={delayVar(0)}
          >
            <span className="relative flex h-2 w-2">
              <span className="gl-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            ESG attestations on Solana
          </p>

          <h1 className="text-[2.55rem] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[4.5rem]">
            {lines.map((line, li) => (
              <span
                key={li}
                className={`block ${line.muted ? "text-zinc-400 dark:text-zinc-500" : ""}`}
              >
                {line.words.map((w, wi) => {
                  const i = w.i;
                  return (
                    <span key={w.t}>
                      {wi > 0 && " "}
                      <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                        <span
                          className={`gl-rise inline-block ${
                            w.accent
                              ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-lime-500 bg-clip-text text-transparent dark:from-emerald-300 dark:via-teal-200 dark:to-lime-200"
                              : ""
                          }`}
                          style={delayVar(0.1 + i * 0.07)}
                        >
                          {w.t}
                        </span>
                      </span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <p
            className="gl-rise max-w-xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-400"
            style={delayVar(0.6)}
          >
            Indian MSMEs answer a different ESG questionnaire for every buyer. GreenLedger lets a
            supplier record a claim once, get it signed by an accredited verifier on Solana, and
            share one link that every buyer can check.
          </p>

          <div className="gl-rise flex flex-col gap-3 sm:flex-row" style={delayVar(0.75)}>
            <Link
              href="/supplier"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgb(5_150_105/0.7)] transition-[background-color,translate] duration-300 hover:-translate-y-0.5 hover:bg-emerald-500"
            >
              Register as a supplier
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
            <Link
              href="/lookup"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white/60 px-6 py-3 text-sm font-semibold backdrop-blur transition-[background-color,translate] duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:bg-zinc-900"
            >
              Look up a supplier
            </Link>
          </div>

          <ul
            className="gl-rise flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-500"
            style={delayVar(0.9)}
          >
            {["BRSR Core", "CSRD", "CBAM 2026", "SHA-256 evidence"].map((t) => (
              <li
                key={t}
                className="rounded-full border border-zinc-200 px-2.5 py-1 dark:border-zinc-800"
              >
                {t}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Layered card stack: three depths, scroll parallax plus pointer tilt */}
        <div className="relative mx-auto h-[410px] w-full max-w-[380px] [perspective:1200px] sm:h-[420px] lg:h-[470px]">
          <motion.div
            style={{ rotateX: rotX, rotateY: rotY }}
            className="gl-depth relative h-full w-full [transform-style:preserve-3d]"
          >
            <motion.div style={{ y: backY }} className="gl-depth absolute left-0 top-0 w-[76%]">
              <div className="gl-fade-in gl-float" style={delayVar(0.5)}>
                <MiniCard title="Water withdrawal" value="1,240 kL" period="FY25" status="Pending" />
              </div>
            </motion.div>
            <motion.div style={{ y: midY }} className="gl-depth absolute right-0 top-[25%] w-[76%] sm:top-[24%]">
              <div className="gl-fade-in gl-float" style={delayVar(0.7)}>
                <MiniCard
                  title="Renewable certificates"
                  value="320 MWh"
                  period="Q1 FY26"
                  status="Verified"
                />
              </div>
            </motion.div>
            <motion.div
              style={{ y: frontY, x: frontX }}
              className="gl-depth absolute bottom-0 left-[3%] w-[94%]"
            >
              <div className="gl-rise" style={delayVar(0.9)}>
                <HeroAttestation />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-24 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500 sm:flex"
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-zinc-300 dark:bg-zinc-800">
          <span className="gl-scroll-cue absolute inset-0 bg-emerald-500" />
        </span>
      </div>
    </section>
  );
}

function MiniCard({
  title,
  value,
  period,
  status,
}: {
  title: string;
  value: string;
  period: string;
  status: "Pending" | "Verified";
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/75 p-4 shadow-xl shadow-zinc-900/5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/75 dark:shadow-black/30">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {title}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            status === "Verified"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="mt-2 text-xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-zinc-500">{period}</div>
    </div>
  );
}

function HeroAttestation() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-600/20 bg-white/90 p-5 shadow-2xl shadow-emerald-900/15 backdrop-blur-xl dark:border-emerald-400/20 dark:bg-zinc-900/90 dark:shadow-black/50">
      <div
        aria-hidden
        className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgb(16_185_129/0.25),transparent_70%)]"
      />
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-6 w-6 rounded-md" aria-hidden />
          <span className="text-xs font-semibold">Attestation</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white">
          <CheckIcon className="h-3 w-3" /> Verified on-chain
        </span>
      </div>
      <div className="relative mt-4 text-[11px] uppercase tracking-wider text-zinc-500">
        Scope 2 electricity
      </div>
      <div className="relative mt-1 flex flex-wrap items-baseline gap-x-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">48,200</span>
        <span className="text-sm text-zinc-500">kWh, Apr to Jun 2026</span>
      </div>
      <div className="relative mt-4 truncate rounded-lg bg-zinc-100 px-3 py-2 font-mono text-[10px] leading-4 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400">
        <span className="text-zinc-400 dark:text-zinc-500">sha256 </span>
        9f2c41ab e07d3c88 b51f6a29 d4e077c1
      </div>
      <div className="relative mt-4 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
        <span className="truncate">Signed by Sahyadri Assurance</span>
        <span className="shrink-0 font-mono">slot 318,204,771</span>
      </div>
    </div>
  );
}
