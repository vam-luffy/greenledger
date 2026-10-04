"use client";

import { motion } from "motion/react";
import { easeOut } from "./Reveal";

/**
 * Glass panel that hosts the existing <LiveStats /> (passed as children so it stays
 * exactly as written). A CSS :has() rule hides the loading line once its grid renders.
 */
export function StatsStrip({ children }: { children: React.ReactNode }) {
  return (
    <section aria-labelledby="live-heading" className="relative z-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: easeOut }}
        className="gl-stats mx-auto -mt-10 max-w-5xl rounded-3xl border border-zinc-200/80 bg-white/70 p-4 shadow-2xl shadow-zinc-900/5 backdrop-blur-xl sm:-mt-16 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-black/40"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2
            id="live-heading"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
          >
            <span className="relative flex h-2 w-2">
              <span className="gl-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live from the Solana devnet registry
          </h2>
          <span className="font-mono text-[11px] text-zinc-400">read directly from program accounts</span>
        </div>
        <p className="gl-stats-loading flex items-center gap-3 text-sm text-zinc-500">
          <span className="h-1 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <span className="block h-full w-full animate-pulse bg-emerald-500/70" />
          </span>
          Reading the registry from devnet&hellip;
        </p>
        {children}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-200/70 pt-4 text-sm dark:border-zinc-800">
          <span className="mr-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Try it</span>
          {[
            { href: "/s/5kw97yVqdh9er9QaPHqpbe4s6EXCJbkpZ7rm5evzJQ8M", label: "Open a verified supplier record" },
            { href: "/buyer", label: "Buyer dashboard" },
            { href: "/verifiers", label: "Verifier registry" },
            { href: "/supplier", label: "Record your own claim" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:hover:text-emerald-300"
            >
              {l.label}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
