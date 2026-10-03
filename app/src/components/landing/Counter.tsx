"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

function format(n: number, decimals: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Counts from `from` to `to` once it scrolls into view. The DOM text is written
 * directly from the animation callback, so there are no React re-renders per frame.
 */
export function Counter({
  from = 0,
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.6,
  grouping = true,
}: {
  from?: number;
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  grouping?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  const fmt = (n: number) =>
    prefix + (grouping ? format(n, decimals) : n.toFixed(decimals)) + suffix;

  useEffect(() => {
    const el = ref.current;
    if (!inView || !el || reduce) return;
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = fmt(v);
      },
    });
    return () => controls.stop();
    // fmt is derived from the props listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, from, to, decimals, prefix, suffix, duration, grouping]);

  return (
    <span ref={ref} className="tabular-nums">
      {fmt(to)}
    </span>
  );
}
