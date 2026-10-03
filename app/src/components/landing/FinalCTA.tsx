"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { easeOut } from "./Reveal";

export function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 0.8], [0.92, 1]);
  const ringA = useTransform(scrollYProgress, [0, 1], [0.6, 1.15]);
  const ringB = useTransform(scrollYProgress, [0, 1], [1.2, 0.85]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
    <section ref={ref} aria-labelledby="cta-heading" className="px-4 pb-16 pt-8 sm:pb-24">
      <motion.div
        style={{ scale }}
        className="gl-depth relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-emerald-950 px-6 py-20 text-center text-white sm:px-12 sm:py-28"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="gl-drift-a absolute -left-1/4 -top-1/2 h-[140%] w-[80%] rounded-full bg-[radial-gradient(circle,rgb(16_185_129/0.55),transparent_60%)]" />
          <div className="gl-drift-b absolute -bottom-1/2 -right-1/4 h-[140%] w-[80%] rounded-full bg-[radial-gradient(circle,rgb(163_230_53/0.25),transparent_60%)]" />
          <motion.div
            style={{ scale: ringA, rotate }}
            className="gl-depth absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          />
          <motion.div
            style={{ scale: ringB }}
            className="gl-depth absolute left-1/2 top-1/2 h-[780px] w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/10"
          />
          <div className="gl-grain absolute inset-0 opacity-20" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="relative"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" aria-hidden className="mx-auto h-12 w-12 rounded-xl shadow-lg shadow-emerald-500/30" />
          <h2 id="cta-heading" className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            One attestation.
            <br />
            <span className="text-emerald-300">Every buyer.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-emerald-100/80">
            Stop filling the same spreadsheet forty times. Record the claim once, get it signed, share
            the link.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/supplier"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-950 transition-[background-color,translate] duration-300 hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              Register as a supplier
            </Link>
            <Link
              href="/lookup"
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-[background-color,translate] duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              Look up a supplier
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
