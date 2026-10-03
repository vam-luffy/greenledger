import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Anchor and its deps ship CommonJS that breaks when bundled for the server
  // render pass; let Node load them natively instead.
  serverExternalPackages: ["@coral-xyz/anchor", "@solana/web3.js"],
};

export default nextConfig;
