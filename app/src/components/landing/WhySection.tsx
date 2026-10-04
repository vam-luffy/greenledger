"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Counter } from "./Counter";
import { easeOut } from "./Reveal";

type Card = {
  stat: React.ReactNode;
  label: string;
  body: string;
};

const solana: Card[] = [
  {
    stat: <Counter to={5000} suffix="" />,
    label: "lamports base fee per signature",
    body: "Under ₹30 per claim all in, and about five paise for the verifier's signature, so a micro-enterprise filing four claims a year is viable.",
  },
  {
    stat: <Counter to={300} suffix=" ms" />,
    label: "slot time",
    body: "A verifier's signature lands in under a second, timestamped by the chain itself.",
  },
  {
    stat: <Counter from={40} to={1} suffix=" link" duration={2} />,
    label: "replaces a questionnaire per buyer",
    body: "One program-derived address per supplier: a deterministic public record any buyer can open.",
  },
  {
    stat: <Counter to={100} suffix="%" />,
    label: "publicly verifiable",
    body: "Signatures cannot be edited after the fact. Lenders and carbon-credit issuers can read claims directly.",
  },
];

const now: Card[] = [
  {
    stat: <Counter to={1000} />,
    label: "listed companies under BRSR",
    body: "Top 250 listed companies can now report value-chain ESG data under BRSR, voluntary from FY2025-26 with assessment or assurance from FY2026-27, and BRSR Core assurance reaches the top 1,000 in FY2026-27.",
  },
  {
    stat: <Counter from={2005} to={2025} grouping={false} />,
    label: "CSRD reporting began",
    body: "Large EU companies now report under ESRS and push data requests down to Indian exporters.",
  },
  {
    stat: <Counter from={2006} to={2026} grouping={false} prefix="Jan " />,
    label: "CBAM definitive phase",
    body: "Embedded-emissions data for exports to the EU is no longer optional paperwork.",
  },
  {
    stat: <Counter to={63} suffix="M" />,
    label: "Indian MSMEs",
    body: "Most of them answer every buyer's ESG spreadsheet by hand, with nothing anyone can check.",
  },
];

export function WhySection() {
  return (
    <section aria-label="Why Solana and why now" className="relative overflow-x-clip pb-12 pt-24 sm:pb-16 sm:pt-32">
      <Group
        eyebrow="Why Solana"
        title="Attestations cheap enough for a ten-person factory."
        watermark="SOLANA"
        cards={solana}
        direction={1}
      />
      <div className="h-24 sm:h-32" />
      <Group
        eyebrow="Why now"
        title="The data requests are already arriving."
        watermark="2026"
        cards={now}
        direction={-1}
      />
    </section>
  );
}

function Group({
  eyebrow,
  title,
  watermark,
  cards,
  direction,
}: {
  eyebrow: string;
  title: string;
  watermark: string;
  cards: Card[];
  direction: 1 | -1;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const markX = useTransform(scrollYProgress, [0, 1], [`${8 * direction}%`, `${-14 * direction}%`]);

  return (
    <div ref={ref} className="relative">
      <motion.div
        aria-hidden
        style={{ x: markX }}
        className="gl-depth gl-outline-text pointer-events-none absolute -top-10 left-0 select-none whitespace-nowrap text-[28vw] font-bold leading-none tracking-tighter sm:-top-16 sm:text-[18vw]"
      >
        {watermark}
      </motion.div>
      <div className="relative mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">{title}</h2>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <motion.article
              key={c.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: easeOut, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 p-5 backdrop-blur transition-colors hover:border-emerald-500/50 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-emerald-400/40"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgb(16_185_129/0.22),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="text-4xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">
                {c.stat}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{c.label}</div>
              <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{c.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
