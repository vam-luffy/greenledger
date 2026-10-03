"use client";

import { useEffect } from "react";
import { useMotionValue, type MotionValue } from "motion/react";

/**
 * A MotionValue that is `match` while the media query matches and `otherwise` when not.
 * Updating a MotionValue does not re-render React, so this is safe to drive animations.
 * Server render and first paint use `otherwise` (the mobile value).
 */
export function useMediaValue(query: string, match: number, otherwise: number): MotionValue<number> {
  const value = useMotionValue(otherwise);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => value.set(mq.matches ? match : otherwise);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query, match, otherwise, value]);
  return value;
}
