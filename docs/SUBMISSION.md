# Submission form answers

Copy-paste material for the Colosseum portal and the Superteam Earn India track. Keep the videos links handy.

## Product name
GreenLedger

## One-line description
Verifiable ESG and carbon attestations for Indian MSMEs: record a claim once on Solana, get it signed by an accredited verifier, share one link every buyer can trust.

## Links
- Live app (Solana devnet): https://greenledger-drab.vercel.app
- GitHub (public, MIT): https://github.com/vam-luffy/greenledger
- Program ID (devnet): Hd8P3F7NAnFA6KtYnWZzcfF6LSUMAN6khGXP7Z9kELaB
- Demo supplier record: https://greenledger-drab.vercel.app/s/5kw97yVqdh9er9QaPHqpbe4s6EXCJbkpZ7rm5evzJQ8M
- Pitch video (1:52 cut, under the 2-minute cap): https://youtu.be/8JmU2u7cafk (unlisted) · direct MP4: https://kce2snjsd9zyaalt.public.blob.vercel-storage.com/videos/GreenLedger-pitch-short.mp4 · long 2:35 version: https://kce2snjsd9zyaalt.public.blob.vercel-storage.com/videos/GreenLedger-pitch.mp4
- Demo video: https://youtu.be/rFPWBx_AtOs (unlisted) · direct MP4: https://kce2snjsd9zyaalt.public.blob.vercel-storage.com/videos/GreenLedger-demo.mp4

## Blockchains and tools integrated
Solana (Anchor 1.2 program, program-derived accounts, events), Solana wallet adapter (Phantom, Solflare, Backpack via Wallet Standard), Next.js 16, Vercel Blob for evidence storage.

## Description (long)
India's largest companies must file Business Responsibility and Sustainability Reports and, from FY2026, get their value-chain ESG data assured. EU buyers add CSRD and CBAM on top. The result is that every MSME supplier receives a different ESG questionnaire from every customer, attaches the same electricity bills again and again, and nobody can verify any of it.

GreenLedger is a public ledger of verified ESG claims on Solana. A supplier registers once with its GSTIN and records claims: energy consumption, Scope 1 and Scope 2 emissions, renewable energy certificates, water usage, waste diverted. Each claim stores the reporting period, the quantity, and the SHA-256 hash of the evidence document. The document can optionally be stored so verifiers can open it. An accredited verifier, approved by the registry, reviews the evidence and signs an on-chain approval or rejection with a note. From then on any buyer opens one link or scans one QR code and sees every claim, its status, who attested it, and when. A buyer can also drop a document they were sent onto the supplier's page and the browser confirms whether it is byte-for-byte the document the verifier reviewed.

The app has four surfaces: a supplier console, a verifier console with a queue of pending claims, a buyer dashboard with a watchlist, compliance rates and BRSR-ready CSV export, and public per-supplier record pages. A verifier registry shows every accredited verifier and its attestation count.

## Why Solana
Attestations cost a fraction of a rupee, so a ten-person factory with four claims a year is viable. Verifier signatures and timestamps are public and cannot be edited after the fact, which is what assurance teams need. Program-derived addresses give every supplier a deterministic record address. Verified claims are composable: a lender or a carbon-credit issuer can read them directly with no API agreement.

## Go-to-market and demand validation
Start with one sector where buyer pressure is highest: textile exporters in Karnataka and Tamil Nadu supplying EU brands under CSRD. Partner with one assurance body already doing BRSR Core work so attestations are credible from day one. Buyer-led onboarding: the buyer sends suppliers a GreenLedger link instead of a spreadsheet. Distribution through export promotion councils and industry associations. Revenue: free for suppliers, platform fee per verification, buyer subscription for bulk lookup, alerts and BRSR export.

## Team
Ghost, solo founder, Bengaluru. Background in ESG and sustainability reporting. Built the product during the hackathon using AI coding tools.

## Pre-existing code disclosure
None. The repository was created on 3 October 2026 and all code was written during the hackathon window. Open-source dependencies: Anchor, Solana web3.js, Solana wallet adapter, Next.js, Tailwind, motion, qrcode.react, Vercel Blob SDK.

## Superteam India track extras
- Team based in India: yes, Bengaluru.
- Registered on Colosseum with India selected: yes.
- Built on Solana: yes, Anchor program deployed to devnet.
- Ecosystem impact: brings a non-crypto compliance workflow (MSME ESG reporting) on-chain with a wallet-free read path for buyers.
