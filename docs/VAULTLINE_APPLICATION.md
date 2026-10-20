# Vaultline audit grant application (Superteam Earn)

Listing: https://superteam.fun/earn/listing/vaultline-security-audit-grants-for-colosseum-projects-up-to-4000-usdc-each
Closes 31 Oct 2026, selection 2 Nov. Grant is audit services up to 4,000 USDC, not cash.

## Answer

**Project:** GreenLedger, verifiable ESG and carbon attestations for Indian MSMEs on Solana. A supplier records a claim once with the SHA-256 hash of its evidence, a registry-approved verifier signs an on-chain attestation, and every buyer checks one public link. Colosseum submission: https://colosseum.com/arena/projects/greenledger-1

**Repository:** https://github.com/vam-luffy/greenledger (public, MIT). Program to audit: `programs/greenledger/src/lib.rs`, one Anchor 1.2 program, program ID Hd8P3F7NAnFA6KtYnWZzcfF6LSUMAN6khGXP7Z9kELaB.

**Size:** about 390 lines of Rust in a single file, 6 instructions (initialize_registry, add_verifier, set_verifier_active, register_supplier, submit_claim, verify_claim), 4 account types as PDAs (registry, verifier, supplier, claim), events and custom errors. Nine integration tests in `tests/greenledger.ts`.

**Stage:** devnet, deployed with IDL; live app at https://greenledger-drab.vercel.app with seeded suppliers, a verifier and verified, rejected and pending claims. No mainnet users or TVL yet; mainnet pilot planned with one assurance provider and one buyer in a textile export cluster.

**Why an audit matters now:** GreenLedger's whole value is trust: a buyer relies on the fact that only a registry-approved verifier could have signed an attestation and that a resolved claim can never be altered. A flaw in the PDA seeds, the has_one and signer constraints on verify_claim, or the verifier activation logic would let anyone forge "verified" ESG data, which is the exact fraud the product exists to prevent. The next version adds a verifier fee escrow in USDC and verifier staking with slashing, so user funds enter the program. We want the access-control model audited before those land and before mainnet, so the pilot partners and their auditors can rely on it.

**Contact:** Vamshith S Bangera, Telegram @Monkey_D_Luffy3898, X @vamshith_ban, GitHub vam-luffy.
