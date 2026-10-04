"use client";

import dynamic from "next/dynamic";

export const LiveStatsLazy = dynamic(
  async () => (await import("./LiveStats")).LiveStats,
  { ssr: false }
);
