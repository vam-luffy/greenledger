//! GreenLedger: verifiable ESG and carbon attestations for Indian MSMEs.
//!
//! Flow:
//! 1. `initialize_registry` once, by the deploying authority.
//! 2. Authority approves verifiers with `add_verifier`.
//! 3. Any wallet registers a supplier profile with `register_supplier`.
//! 4. Suppliers submit claims (energy, emissions, RECs...) with `submit_claim`,
//!    carrying a SHA-256 hash of the evidence document.
//! 5. An approved verifier attests with `verify_claim` (approve or reject).
//! 6. Anyone can read a supplier record and its claims.

use anchor_lang::prelude::*;

declare_id!("GLedger1111111111111111111111111111111111111");

pub const MAX_NAME: usize = 64;
pub const MAX_GSTIN: usize = 15;
pub const MAX_SECTOR: usize = 32;
pub const MAX_ACCREDITATION: usize = 64;
pub const MAX_UNIT: usize = 16;
pub const MAX_URI: usize = 128;
pub const MAX_NOTE: usize = 128;

#[program]
pub mod greenledger {
    use super::*;

    pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.authority = ctx.accounts.authority.key();
        registry.verifier_count = 0;
        registry.supplier_count = 0;
        registry.claim_count = 0;
        registry.bump = ctx.bumps.registry;
        Ok(())
    }

    pub fn add_verifier(
        ctx: Context<AddVerifier>,
        name: String,
        accreditation: String,
    ) -> Result<()> {
        require!(name.len() <= MAX_NAME, GreenLedgerError::StringTooLong);
        require!(
            accreditation.len() <= MAX_ACCREDITATION,
            GreenLedgerError::StringTooLong
        );
        let verifier = &mut ctx.accounts.verifier;
        verifier.authority = ctx.accounts.verifier_authority.key();
        verifier.name = name;
        verifier.accreditation = accreditation;
        verifier.active = true;
        verifier.verified_count = 0;
        verifier.created_at = Clock::get()?.unix_timestamp;
        verifier.bump = ctx.bumps.verifier;
        ctx.accounts.registry.verifier_count += 1;
        Ok(())
    }

    pub fn set_verifier_active(ctx: Context<SetVerifierActive>, active: bool) -> Result<()> {
        ctx.accounts.verifier.active = active;
        Ok(())
    }

    pub fn register_supplier(
        ctx: Context<RegisterSupplier>,
        name: String,
        gstin: String,
        sector: String,
    ) -> Result<()> {
        require!(name.len() <= MAX_NAME, GreenLedgerError::StringTooLong);
        require!(gstin.len() <= MAX_GSTIN, GreenLedgerError::StringTooLong);
        require!(sector.len() <= MAX_SECTOR, GreenLedgerError::StringTooLong);
        let supplier = &mut ctx.accounts.supplier;
        supplier.owner = ctx.accounts.owner.key();
        supplier.name = name;
        supplier.gstin = gstin;
        supplier.sector = sector;
        supplier.claim_count = 0;
        supplier.verified_count = 0;
        supplier.created_at = Clock::get()?.unix_timestamp;
        supplier.bump = ctx.bumps.supplier;
        ctx.accounts.registry.supplier_count += 1;
        Ok(())
    }

    pub fn submit_claim(
        ctx: Context<SubmitClaim>,
        kind: ClaimKind,
        period_start: i64,
        period_end: i64,
        value: u64,
        unit: String,
        evidence_hash: [u8; 32],
        evidence_uri: String,
    ) -> Result<()> {
        require!(period_end > period_start, GreenLedgerError::InvalidPeriod);
        require!(unit.len() <= MAX_UNIT, GreenLedgerError::StringTooLong);
        require!(evidence_uri.len() <= MAX_URI, GreenLedgerError::StringTooLong);

        let supplier = &mut ctx.accounts.supplier;
        let claim = &mut ctx.accounts.claim;
        claim.supplier = supplier.key();
        claim.index = supplier.claim_count;
        claim.kind = kind;
        claim.period_start = period_start;
        claim.period_end = period_end;
        claim.value = value;
        claim.unit = unit;
        claim.evidence_hash = evidence_hash;
        claim.evidence_uri = evidence_uri;
        claim.status = ClaimStatus::Pending;
        claim.verifier = None;
        claim.verified_at = 0;
        claim.note = String::new();
        claim.submitted_at = Clock::get()?.unix_timestamp;
        claim.bump = ctx.bumps.claim;

        supplier.claim_count += 1;
        ctx.accounts.registry.claim_count += 1;

        emit!(ClaimSubmitted {
            supplier: supplier.key(),
            claim: claim.key(),
            index: claim.index,
            kind,
        });
        Ok(())
    }

    pub fn verify_claim(ctx: Context<VerifyClaim>, approve: bool, note: String) -> Result<()> {
        require!(note.len() <= MAX_NOTE, GreenLedgerError::StringTooLong);
        let verifier = &mut ctx.accounts.verifier;
        require!(verifier.active, GreenLedgerError::VerifierInactive);

        let claim = &mut ctx.accounts.claim;
        require!(
            claim.status == ClaimStatus::Pending,
            GreenLedgerError::ClaimAlreadyResolved
        );

        claim.status = if approve {
            ClaimStatus::Verified
        } else {
            ClaimStatus::Rejected
        };
        claim.verifier = Some(verifier.key());
        claim.verified_at = Clock::get()?.unix_timestamp;
        claim.note = note;

        verifier.verified_count += 1;
        if approve {
            ctx.accounts.supplier.verified_count += 1;
        }

        emit!(ClaimVerified {
            claim: claim.key(),
            verifier: verifier.key(),
            approved: approve,
        });
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[account]
#[derive(InitSpace)]
pub struct Registry {
    pub authority: Pubkey,
    pub verifier_count: u64,
    pub supplier_count: u64,
    pub claim_count: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Verifier {
    pub authority: Pubkey,
    #[max_len(MAX_NAME)]
    pub name: String,
    #[max_len(MAX_ACCREDITATION)]
    pub accreditation: String,
    pub active: bool,
    pub verified_count: u64,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Supplier {
    pub owner: Pubkey,
    #[max_len(MAX_NAME)]
    pub name: String,
    #[max_len(MAX_GSTIN)]
    pub gstin: String,
    #[max_len(MAX_SECTOR)]
    pub sector: String,
    pub claim_count: u64,
    pub verified_count: u64,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Claim {
    pub supplier: Pubkey,
    pub index: u64,
    pub kind: ClaimKind,
    pub period_start: i64,
    pub period_end: i64,
    /// Quantity in `unit`, scaled by 1000 (three decimals).
    pub value: u64,
    #[max_len(MAX_UNIT)]
    pub unit: String,
    /// SHA-256 of the evidence document (invoice, meter reading, REC certificate).
    pub evidence_hash: [u8; 32],
    #[max_len(MAX_URI)]
    pub evidence_uri: String,
    pub status: ClaimStatus,
    pub verifier: Option<Pubkey>,
    pub verified_at: i64,
    #[max_len(MAX_NOTE)]
    pub note: String,
    pub submitted_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum ClaimKind {
    EnergyConsumption,
    Scope1Emissions,
    Scope2Emissions,
    RenewableCertificate,
    WaterUsage,
    WasteDiverted,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum ClaimStatus {
    Pending,
    Verified,
    Rejected,
}

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Registry::INIT_SPACE,
        seeds = [b"registry"],
        bump
    )]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddVerifier<'info> {
    #[account(mut, seeds = [b"registry"], bump = registry.bump, has_one = authority)]
    pub registry: Account<'info, Registry>,
    #[account(
        init,
        payer = authority,
        space = 8 + Verifier::INIT_SPACE,
        seeds = [b"verifier", verifier_authority.key().as_ref()],
        bump
    )]
    pub verifier: Account<'info, Verifier>,
    /// CHECK: the wallet that will sign verifications; no data is read from it.
    pub verifier_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetVerifierActive<'info> {
    #[account(seeds = [b"registry"], bump = registry.bump, has_one = authority)]
    pub registry: Account<'info, Registry>,
    #[account(mut, seeds = [b"verifier", verifier.authority.as_ref()], bump = verifier.bump)]
    pub verifier: Account<'info, Verifier>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct RegisterSupplier<'info> {
    #[account(mut, seeds = [b"registry"], bump = registry.bump)]
    pub registry: Account<'info, Registry>,
    #[account(
        init,
        payer = owner,
        space = 8 + Supplier::INIT_SPACE,
        seeds = [b"supplier", owner.key().as_ref()],
        bump
    )]
    pub supplier: Account<'info, Supplier>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitClaim<'info> {
    #[account(mut, seeds = [b"registry"], bump = registry.bump)]
    pub registry: Account<'info, Registry>,
    #[account(
        mut,
        seeds = [b"supplier", owner.key().as_ref()],
        bump = supplier.bump,
        has_one = owner
    )]
    pub supplier: Account<'info, Supplier>,
    #[account(
        init,
        payer = owner,
        space = 8 + Claim::INIT_SPACE,
        seeds = [b"claim", supplier.key().as_ref(), &supplier.claim_count.to_le_bytes()],
        bump
    )]
    pub claim: Account<'info, Claim>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyClaim<'info> {
    #[account(
        mut,
        seeds = [b"verifier", verifier_authority.key().as_ref()],
        bump = verifier.bump,
        constraint = verifier.authority == verifier_authority.key() @ GreenLedgerError::Unauthorized
    )]
    pub verifier: Account<'info, Verifier>,
    #[account(mut, seeds = [b"supplier", supplier.owner.as_ref()], bump = supplier.bump)]
    pub supplier: Account<'info, Supplier>,
    #[account(
        mut,
        seeds = [b"claim", supplier.key().as_ref(), &claim.index.to_le_bytes()],
        bump = claim.bump,
        constraint = claim.supplier == supplier.key() @ GreenLedgerError::ClaimSupplierMismatch
    )]
    pub claim: Account<'info, Claim>,
    pub verifier_authority: Signer<'info>,
}

// ---------------------------------------------------------------------------
// Events and errors
// ---------------------------------------------------------------------------

#[event]
pub struct ClaimSubmitted {
    pub supplier: Pubkey,
    pub claim: Pubkey,
    pub index: u64,
    pub kind: ClaimKind,
}

#[event]
pub struct ClaimVerified {
    pub claim: Pubkey,
    pub verifier: Pubkey,
    pub approved: bool,
}

#[error_code]
pub enum GreenLedgerError {
    #[msg("String exceeds maximum length")]
    StringTooLong,
    #[msg("Reporting period end must be after start")]
    InvalidPeriod,
    #[msg("Verifier is not active")]
    VerifierInactive,
    #[msg("Claim has already been verified or rejected")]
    ClaimAlreadyResolved,
    #[msg("Signer is not the verifier authority")]
    Unauthorized,
    #[msg("Claim does not belong to this supplier")]
    ClaimSupplierMismatch,
}
