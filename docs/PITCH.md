# GreenLedger: submission notes

Working draft of the Colosseum and Superteam Earn submission text. Edit freely.

## One line

Verifiable ESG and carbon attestations for Indian MSMEs, anchored on Solana, so a supplier records a claim once and every buyer can trust it.

## Problem

India has about 63 million MSMEs. The top 1,000 listed companies must file Business Responsibility and Sustainability Reports (BRSR), and since FY2025 the largest must get value-chain ESG data assured. Every large buyer now sends its suppliers a different ESG questionnaire. European buyers add CSRD and CBAM demands on top.

A supplier with 40 customers fills 40 spreadsheets, attaches the same electricity bills 40 times, and nobody can check any of it. Buyers either trust unverified numbers or pay an auditor per supplier per year. Verification costs land on the party least able to pay.

## What GreenLedger does

1. A supplier registers once with its GSTIN and records claims: energy use, Scope 1 and 2 emissions, renewable energy certificates, water, waste. Each claim stores a reporting period, a quantity, and the SHA-256 hash of the evidence document. The document itself stays private.
2. An accredited verifier reviews the evidence and signs an on-chain approval or rejection with a note. Verifiers are approved by the registry and can be suspended.
3. Any buyer looks up a supplier by wallet or GSTIN and sees every claim, its status, who attested it, and when. No account needed to read.

One attestation serves every buyer. The hash proves the document the verifier saw is the document the buyer is shown later.

## Why Solana

- Attestation cost is a fraction of a rupee, so even a micro-enterprise with four claims a year is viable.
- Verifier signatures and timestamps are public and cannot be edited after the fact, which is what assurance providers and auditors actually need.
- Program-derived addresses give every supplier a deterministic public record address derived from its wallet.
- Composable: a lender or a carbon-credit issuer can read verified claims directly without an API agreement.

## Why now

- SEBI's BRSR Core assurance requirement is phasing in for value-chain partners through FY2026 to FY2027.
- CSRD reporting began for large EU companies in 2025, and CBAM moved to its definitive phase in January 2026, both pushing data requests down to Indian exporters.
- Solana now has the wallet UX and fee profile to put an MSME owner on-chain without them knowing it.

## Market

- Bottom-up: 1.5 million Indian MSMEs supply listed companies or exporters. At four verified claims a year and a 100 rupee platform fee per verified claim, that is 60 crore rupees (about USD 7 million) in annual platform revenue before verifier fees.
- Verification market: assurance of BRSR Core alone is estimated at several hundred crore rupees a year in India. GreenLedger reduces per-supplier verification cost by letting one attestation be reused.
- Expansion: the same primitive works for any buyer-driven compliance data, such as labour audits and quality certifications.

## Business model

- Free for suppliers to record claims.
- Platform fee per verification, paid by the verifier out of what the buyer pays them, or by the buyer in a sponsored model.
- Buyer subscription for bulk lookup, alerts when a supplier's claim is rejected, and export to BRSR and CSRD formats.

## Go to market

1. Start with one sector where buyer pressure is highest: textile exporters in Karnataka and Tamil Nadu supplying EU brands under CSRD.
2. Partner with one verification body already doing BRSR Core assurance, so attestations are credible from day one.
3. Buyer-led onboarding: the buyer sends suppliers a GreenLedger link instead of a spreadsheet.
4. Industry associations (Apparel Export Promotion Council, Tirupur Exporters' Association) as distribution.

## Hackathon build (14 Sep to 12 Oct 2026)

- Anchor program with registry, supplier, verifier, and claim accounts, deployed on devnet.
- Next.js app: supplier console, verifier console, public lookup.
- Integration tests covering the happy path and the access-control failures.
- Seed script with realistic demo data.

## Roadmap after the hackathon

- Evidence storage on Arweave or IPFS with encrypted access for verifiers.
- Verifier staking and slashing for bad attestations.
- Export verified claims to BRSR Core and CSRD ESRS formats.
- Lender integration: green working-capital loans priced on verified claims.
- Mainnet launch with a pilot buyer and verifier.

## Team

Ghost (solo founder), Bengaluru. Background in ESG and sustainability reporting. Built with AI coding tools. All code written during the hackathon; no pre-existing codebase.

## Disclosures

- No pre-existing code. The repository was created on 3 October 2026.
- Open-source dependencies: Anchor, Solana web3.js, Solana wallet adapter, Next.js, Tailwind.
- No outside funding.
