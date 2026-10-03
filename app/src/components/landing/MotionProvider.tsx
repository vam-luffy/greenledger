"use client";

import { MotionConfig } from "motion/react";

/**
 * reducedMotion="user" makes every motion component honour the OS setting:
 * transform animations are skipped and only opacity changes remain.
 * Scroll-linked transforms are neutralised separately by the .gl-depth CSS rule.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
