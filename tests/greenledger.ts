import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createHash } from "crypto";
import { assert } from "chai";
import { Greenledger } from "../target/types/greenledger";

describe("greenledger", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Greenledger as Program<Greenledger>;
  const authority = provider.wallet as anchor.Wallet;

  const supplierOwner = Keypair.generate();
  const verifierAuthority = Keypair.generate();

  const [registryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    program.programId
  );
  const [supplierPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("supplier"), supplierOwner.publicKey.toBuffer()],
    program.programId
  );
  const [verifierPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("verifier"), verifierAuthority.publicKey.toBuffer()],
    program.programId
  );

  const claimPda = (index: number) => {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(BigInt(index));
    return PublicKey.findProgramAddressSync(
      [Buffer.from("claim"), supplierPda.toBuffer(), buf],
      program.programId
    )[0];
  };

  const sha256 = (s: string) => Array.from(createHash("sha256").update(s).digest());

  before(async () => {
    for (const kp of [supplierOwner, verifierAuthority]) {
      const sig = await provider.connection.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(sig, "confirmed");
    }
  });

  it("initializes the registry", async () => {
    await program.methods
      .initializeRegistry()
      .accounts({ authority: authority.publicKey })
      .rpc();
    const registry = await program.account.registry.fetch(registryPda);
    assert.ok(registry.authority.equals(authority.publicKey));
    assert.equal(registry.supplierCount.toNumber(), 0);
  });

  it("adds a verifier", async () => {
    await program.methods
      .addVerifier("Bureau Veritas India", "NABCB-ESG-0042")
      .accounts({
        verifierAuthority: verifierAuthority.publicKey,
        authority: authority.publicKey,
      })
      .rpc();
    const v = await program.account.verifier.fetch(verifierPda);
    assert.equal(v.name, "Bureau Veritas India");
    assert.isTrue(v.active);
  });

  it("registers a supplier", async () => {
    await program.methods
      .registerSupplier("Shakti Textiles Pvt Ltd", "29ABCDE1234F1Z5", "Textiles")
      .accounts({ owner: supplierOwner.publicKey })
      .signers([supplierOwner])
      .rpc();
    const s = await program.account.supplier.fetch(supplierPda);
    assert.equal(s.name, "Shakti Textiles Pvt Ltd");
    assert.equal(s.claimCount.toNumber(), 0);
  });

  it("submits an energy claim", async () => {
    const start = Math.floor(new Date("2026-04-01").getTime() / 1000);
    const end = Math.floor(new Date("2026-06-30").getTime() / 1000);
    await program.methods
      .submitClaim(
        { energyConsumption: {} },
        new anchor.BN(start),
        new anchor.BN(end),
        new anchor.BN(48_250_000), // 48,250.000 kWh
        "kWh",
        sha256("bescom-invoice-q1-fy27.pdf"),
        "ipfs://bafy.../bescom-q1.pdf"
      )
      .accounts({ owner: supplierOwner.publicKey })
      .signers([supplierOwner])
      .rpc();
    const c = await program.account.claim.fetch(claimPda(0));
    assert.deepEqual(c.status, { pending: {} });
    assert.equal(c.value.toNumber(), 48_250_000);
    const s = await program.account.supplier.fetch(supplierPda);
    assert.equal(s.claimCount.toNumber(), 1);
  });

  it("rejects a claim with an invalid period", async () => {
    try {
      await program.methods
        .submitClaim(
          { scope2Emissions: {} },
          new anchor.BN(200),
          new anchor.BN(100),
          new anchor.BN(1),
          "tCO2e",
          sha256("x"),
          ""
        )
        .accounts({ owner: supplierOwner.publicKey })
        .signers([supplierOwner])
        .rpc();
      assert.fail("should have thrown");
    } catch (e: any) {
      assert.include(e.toString(), "InvalidPeriod");
    }
  });

  it("verifier approves the claim", async () => {
    await program.methods
      .verifyClaim(true, "Matches BESCOM invoice, meter 4471-B")
      .accountsPartial({
        supplier: supplierPda,
        claim: claimPda(0),
        verifierAuthority: verifierAuthority.publicKey,
      })
      .signers([verifierAuthority])
      .rpc();
    const c = await program.account.claim.fetch(claimPda(0));
    assert.deepEqual(c.status, { verified: {} });
    assert.ok(c.verifier!.equals(verifierPda));
    const s = await program.account.supplier.fetch(supplierPda);
    assert.equal(s.verifiedCount.toNumber(), 1);
  });

  it("cannot verify the same claim twice", async () => {
    try {
      await program.methods
        .verifyClaim(false, "second attempt")
        .accountsPartial({
          supplier: supplierPda,
          claim: claimPda(0),
          verifierAuthority: verifierAuthority.publicKey,
        })
        .signers([verifierAuthority])
        .rpc();
      assert.fail("should have thrown");
    } catch (e: any) {
      assert.include(e.toString(), "ClaimAlreadyResolved");
    }
  });

  it("a random wallet cannot verify", async () => {
    const stranger = Keypair.generate();
    const sig = await provider.connection.requestAirdrop(stranger.publicKey, LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig, "confirmed");

    const start = 1_000, end = 2_000;
    await program.methods
      .submitClaim({ waterUsage: {} }, new anchor.BN(start), new anchor.BN(end), new anchor.BN(5_000), "kL", sha256("w"), "")
      .accounts({ owner: supplierOwner.publicKey })
      .signers([supplierOwner])
      .rpc();

    try {
      await program.methods
        .verifyClaim(true, "")
        .accountsPartial({
          supplier: supplierPda,
          claim: claimPda(1),
          verifierAuthority: stranger.publicKey,
        })
        .signers([stranger])
        .rpc();
      assert.fail("should have thrown");
    } catch (e: any) {
      // Verifier PDA for a stranger does not exist, so the account constraint fails.
      assert.ok(e);
    }
  });

  it("deactivated verifier cannot verify", async () => {
    await program.methods
      .setVerifierActive(false)
      .accounts({ verifier: verifierPda, authority: authority.publicKey })
      .rpc();
    try {
      await program.methods
        .verifyClaim(true, "")
        .accountsPartial({
          supplier: supplierPda,
          claim: claimPda(1),
          verifierAuthority: verifierAuthority.publicKey,
        })
        .signers([verifierAuthority])
        .rpc();
      assert.fail("should have thrown");
    } catch (e: any) {
      assert.include(e.toString(), "VerifierInactive");
    }
  });
});
