/**
 * Seed a cluster with demo data for GreenLedger.
 *
 *   ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
 *   ANCHOR_WALLET=~/.config/solana/id.json \
 *   npx ts-node scripts/seed.ts
 *
 * Creates (idempotently):
 *   - the registry, owned by the provider wallet
 *   - one verifier (a fresh keypair saved to keypairs/verifier.json)
 *   - two suppliers (fresh keypairs saved to keypairs/supplier-*.json)
 *   - a handful of claims, some verified, one rejected, one pending
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { Greenledger } from "../target/types/greenledger";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.Greenledger as Program<Greenledger>;
const payer = (provider.wallet as anchor.Wallet).payer;

const KEY_DIR = "keypairs";
function loadOrCreate(name: string): Keypair {
  mkdirSync(KEY_DIR, { recursive: true });
  const path = `${KEY_DIR}/${name}.json`;
  if (existsSync(path)) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(path, "utf8"))));
  }
  const kp = Keypair.generate();
  writeFileSync(path, JSON.stringify(Array.from(kp.secretKey)));
  return kp;
}

const sha256 = (s: string) => Array.from(createHash("sha256").update(s).digest());
const ts = (d: string) => new anchor.BN(Math.floor(new Date(d).getTime() / 1000));

async function fund(pk: PublicKey, sol = 0.05) {
  const bal = await provider.connection.getBalance(pk);
  if (bal >= sol * LAMPORTS_PER_SOL) return;
  const tx = new anchor.web3.Transaction().add(
    SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: pk, lamports: sol * LAMPORTS_PER_SOL })
  );
  await provider.sendAndConfirm(tx, [payer]);
}

const pda = {
  registry: () => PublicKey.findProgramAddressSync([Buffer.from("registry")], program.programId)[0],
  supplier: (o: PublicKey) =>
    PublicKey.findProgramAddressSync([Buffer.from("supplier"), o.toBuffer()], program.programId)[0],
  verifier: (a: PublicKey) =>
    PublicKey.findProgramAddressSync([Buffer.from("verifier"), a.toBuffer()], program.programId)[0],
  claim: (s: PublicKey, i: number) => {
    const b = Buffer.alloc(8);
    b.writeBigUInt64LE(BigInt(i));
    return PublicKey.findProgramAddressSync([Buffer.from("claim"), s.toBuffer(), b], program.programId)[0];
  },
};

async function main() {
  console.log("cluster:", provider.connection.rpcEndpoint);
  console.log("authority:", payer.publicKey.toBase58());

  // Registry
  if (!(await program.account.registry.fetchNullable(pda.registry()))) {
    await program.methods.initializeRegistry().accounts({ authority: payer.publicKey }).rpc();
    console.log("registry initialized");
  }

  // Verifier
  const verifier = loadOrCreate("verifier");
  await fund(verifier.publicKey);
  if (!(await program.account.verifier.fetchNullable(pda.verifier(verifier.publicKey)))) {
    await program.methods
      .addVerifier("Bureau Veritas India", "NABCB-ESG-0042")
      .accounts({ verifierAuthority: verifier.publicKey, authority: payer.publicKey })
      .rpc();
    console.log("verifier added:", verifier.publicKey.toBase58());
  }

  // Suppliers and claims
  const suppliers = [
    {
      key: "supplier-shakti",
      name: "Shakti Textiles Pvt Ltd",
      gstin: "29ABCDE1234F1Z5",
      sector: "Textiles",
      claims: [
        { kind: { energyConsumption: {} }, start: "2026-04-01", end: "2026-06-30", value: 48_250_000, unit: "kWh", ev: "bescom-q1-fy27.pdf", uri: "", decide: true, note: "Matches BESCOM invoice, meter 4471-B" },
        { kind: { scope2Emissions: {} }, start: "2026-04-01", end: "2026-06-30", value: 34_580, unit: "tCO2e", ev: "scope2-calc-q1.xlsx", uri: "", decide: true, note: "CEA grid factor 0.716 applied correctly" },
        { kind: { renewableCertificate: {} }, start: "2026-04-01", end: "2026-06-30", value: 12_000_000, unit: "MWh", ev: "rec-cert-IN-2026-0931.pdf", uri: "", decide: false, note: "REC serial not found in IREC registry" },
        { kind: { waterUsage: {} }, start: "2026-07-01", end: "2026-09-30", value: 2_140_000, unit: "kL", ev: "bwssb-q2.pdf", uri: "", decide: null, note: "" },
      ],
    },
    {
      key: "supplier-arjun",
      name: "Arjun Auto Components",
      gstin: "27PQRSX5678G1Z2",
      sector: "Auto parts",
      claims: [
        { kind: { scope1Emissions: {} }, start: "2026-04-01", end: "2026-06-30", value: 118_200, unit: "tCO2e", ev: "diesel-genset-log-q1.csv", uri: "", decide: true, note: "Fuel logs reconcile with purchase invoices" },
        { kind: { wasteDiverted: {} }, start: "2026-04-01", end: "2026-06-30", value: 41_500, unit: "t", ev: "recycler-receipts-q1.pdf", uri: "", decide: null, note: "" },
      ],
    },
  ];

  for (const s of suppliers) {
    const owner = loadOrCreate(s.key);
    await fund(owner.publicKey, 0.08);
    const sPda = pda.supplier(owner.publicKey);
    let acct = await program.account.supplier.fetchNullable(sPda);
    if (!acct) {
      await program.methods
        .registerSupplier(s.name, s.gstin, s.sector)
        .accounts({ owner: owner.publicKey })
        .signers([owner])
        .rpc();
      acct = await program.account.supplier.fetch(sPda);
      console.log("supplier registered:", s.name, sPda.toBase58());
    }
    const existing = acct.claimCount.toNumber();
    for (let i = existing; i < s.claims.length; i++) {
      const c = s.claims[i];
      await program.methods
        .submitClaim(c.kind as never, ts(c.start), ts(c.end), new anchor.BN(c.value), c.unit, sha256(c.ev), c.uri)
        .accounts({ owner: owner.publicKey })
        .signers([owner])
        .rpc();
      console.log(`  claim #${i} submitted (${Object.keys(c.kind)[0]})`);
      if (c.decide !== null) {
        await program.methods
          .verifyClaim(c.decide, c.note)
          .accountsPartial({ supplier: sPda, claim: pda.claim(sPda, i), verifierAuthority: verifier.publicKey })
          .signers([verifier])
          .rpc();
        console.log(`  claim #${i} ${c.decide ? "verified" : "rejected"}`);
      }
    }
  }
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
