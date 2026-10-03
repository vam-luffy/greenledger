"use client";

import { motion } from "motion/react";

export const easeOut = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts its children into place the first time they enter the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}
