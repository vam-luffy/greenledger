# Grant application drafts

Both grants on Superteam Earn showed "Applications Paused" on 4 Oct 2026. Re-check: after the Colosseum submit (6 Oct) and after results (28 Oct). Paste from here when they reopen.

## Solana Foundation India Grants (up to 10,000 USDG)

**Project:** GreenLedger, https://greenledger-drab.vercel.app, https://github.com/vam-luffy/greenledger

**One line:** A public ledger of verified ESG and carbon claims for Indian MSME suppliers on Solana: record once, get attested by an accredited verifier, share one link every buyer can trust.

**What exists today (proof of work):**
- Anchor program on devnet (registry, supplier, verifier, claim accounts; six instructions with role-based access control; nine passing integration tests).
- Live app: supplier console with hashed evidence and optional storage, verifier queue, buyer dashboard with watchlist and compliance rates, public supplier pages with QR codes, a drop-a-document hash check, and BRSR Core export mapped to SEBI's attribute format.
- Submitted to Colosseum Crypto World's Fair and the Superteam India sidetrack (Oct 2026). Second project, Program Pulse, built for the Solami track.
- Solo founder with an ESG reporting background; all code written during the hackathon with AI coding tools.

**The insight:** SEBI's BRSR Core and the EU's CSRD and CBAM push ESG data requests down to suppliers, but every buyer asks separately and nobody verifies. The cheapest fix is one attestation that every buyer can reuse, which needs a neutral, permanent, public record of who verified what and when. That is a blockchain use case with a real buyer on the other end.

**What the grant funds (0 to 1):** a 90-day pilot in the Karnataka or Tamil Nadu textile export cluster.
1. Sign one accredited assurance provider as the first verifier (target: a NABCB-accredited firm already doing BRSR Core work) and 15 to 25 supplier MSMEs through one anchor buyer or an export promotion council.
2. Ship the pilot-blocking features: encrypted evidence with verifier-only access, verifier fee escrow in USDC, BRSR Core and CSRD ESRS exports, supplier onboarding in Kannada and Tamil.
3. Mainnet deployment and a security review of the program.
4. Measure: claims recorded, verification turnaround, buyer lookups per supplier, and whether a second buyer accepts a reused attestation.

**Budget (ask: 6,000 USDG):** 2,500 verifier pilot fees and supplier onboarding, 1,500 mainnet deployment, RPC, storage and audit tooling, 1,500 founder time for 3 months of full-time build, 500 travel to the cluster and events.

**Milestones:** M1 (month 1) verifier and anchor buyer signed, encrypted evidence live. M2 (month 2) 15 suppliers recording claims on mainnet, first reused attestation. M3 (month 3) pilot report with numbers, decision on pre-seed.

**Why me:** domain background in ESG and sustainability reporting, shipped the full stack solo in the hackathon window, based in Bengaluru near the pilot cluster.

**Links:** live app, repo, pitch video https://youtu.be/8JmU2u7cafk, demo https://youtu.be/rFPWBx_AtOs, Colosseum project https://colosseum.com/arena/projects/greenledger-1. Contact: Telegram @Monkey_D_Luffy3898, X @vamshith_ban.

## Agentic Engineering Grant (200 USDG)

**What I'll build:** take GreenLedger from devnet to a mainnet pilot: encrypted evidence storage with verifier-only decryption, a verifier fee flow in USDC, and the mainnet deploy, shipped within 30 days.

**How I'll use AI coding tools:** the whole current product (Anchor program, Next.js app, tests, BRSR export) was built with Claude Code in the Crypto World's Fair window; the grant pays for the next month's subscription to finish the pilot features. Receipts will be uploaded for the second tranche.

**Solana integration:** Anchor program with PDAs for suppliers, verifiers and claims; wallet-adapter frontend; mainnet deploy is the deliverable.

**Links:** live app, repo, videos as above.
