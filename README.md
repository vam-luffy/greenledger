# GreenLedger

Verifiable ESG and carbon attestations for Indian MSMEs, on Solana.

Small suppliers are asked for ESG data by large buyers under India's BRSR and the EU's CSRD, and most of it is unverifiable spreadsheets. GreenLedger lets a supplier record energy, emissions and renewable-certificate claims on-chain with a hash of the evidence, lets an accredited verifier attest to them, and gives any buyer a public link to check the record.

Built for the Colosseum Crypto World's Fair hackathon, 14 September to 12 October 2026. See [docs/PITCH.md](docs/PITCH.md) for the problem, market, and go-to-market notes.

## How it works

| Actor | Action | Instruction |
|---|---|---|
| Registry authority | Deploys once, approves verifiers | `initialize_registry`, `add_verifier`, `set_verifier_active` |
| Supplier | Registers with GSTIN, records claims | `register_supplier`, `submit_claim` |
| Verifier | Approves or rejects a pending claim with a note | `verify_claim` |
| Buyer | Reads a supplier's record by wallet or GSTIN | read-only |

Each claim stores the claim type, reporting period, quantity, unit, the SHA-256 hash of the evidence document, an optional link, and its verification status. The evidence file never goes on-chain.

Accounts are program-derived addresses:

- `["registry"]`
- `["supplier", owner]`
- `["verifier", verifier_authority]`
- `["claim", supplier, index_le_u64]`

## Pages

| Route | Who | What |
|---|---|---|
| `/supplier` | Supplier (wallet) | Register with GSTIN, record claims with hashed evidence, see own claims |
| `/verify` | Verifier (wallet) | Queue of pending claims across all suppliers, approve or reject with a note |
| `/buyer` | Procurement team | Watchlist of suppliers, compliance summary, BRSR CSV export of every claim |
| `/s/[address]` | Anyone | Public supplier record with QR code, share link, attestation summary, CSV export |
| `/verifiers` | Anyone | Registry of accredited verifiers and their attestation counts |
| `/lookup` | Anyone | Find a supplier by wallet, record address, or GSTIN |

## Layout

- `programs/greenledger` - Anchor program (Rust)
- `tests` - Anchor integration tests (TypeScript, Mocha)
- `scripts/seed.ts` - seeds a cluster with demo suppliers, a verifier, and claims
- `app` - Next.js 16 frontend with Solana wallet adapter

## Run it

Prerequisites: Rust, Solana CLI, Anchor 1.2, Node 22. Anchor needs Linux or WSL.

```bash
# program
anchor build
anchor test            # spins up a local validator and runs tests/

# deploy to devnet and seed demo data
solana config set --url devnet
anchor deploy --provider.cluster devnet
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com ANCHOR_WALLET=~/.config/solana/id.json npx ts-node scripts/seed.ts

# frontend
cp target/idl/greenledger.json app/src/idl/
cp target/types/greenledger.ts app/src/idl/
cd app && npm install && npm run dev
```

The app defaults to devnet. Set `NEXT_PUBLIC_SOLANA_RPC` to point elsewhere.

## Devnet deployment

Program ID: `Hd8P3F7NAnFA6KtYnWZzcfF6LSUMAN6khGXP7Z9kELaB`

## License

MIT
