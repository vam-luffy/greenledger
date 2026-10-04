# GreenLedger fact-check

Checked 2026-10-04. Scope: every numeric or regulatory claim on the landing page (`app/src/components/landing/*`, mainly `WhySection.tsx` and `Hero.tsx`) and in `docs/PITCH.md`, plus two closely related factual claims about evidence privacy that a judge could test in the live app. No source files were changed.

Ratings: **Accurate**, **Approx** (approximately right; needs a caveat or rewording), **Unsupported** (no source found or illustrative), **Inaccurate**.

## Count

| Rating | Count |
|---|---|
| Accurate | 11 |
| Approximately right | 10 |
| Unsupported | 5 |
| Inaccurate | 6 |
| **Needs change (Approx + Unsupported + Inaccurate)** | **21 of 32** |

## Top corrections (do these first)

1. **SEBI value-chain timeline is wrong in both places** (#8, #19, #22). Since SEBI's 28 March 2025 circular, value-chain ESG disclosures are *voluntary* for the top 250 listed entities from FY2025-26, and their assessment or assurance is *voluntary* from FY2026-27. Nothing about value-chain data is mandatory or "assured since FY2025".
2. **Slot time is no longer 400 ms** (#3). Mainnet moved to a 300 ms target on 25 Aug 2026 (SIMD-0525, staged). Measured on 4 Oct 2026: about 268 ms per slot on mainnet and about 234 ms on devnet.
3. **"The document itself stays private" / "only the hash goes on-chain" is false today** (#16, #32). `submit_claim` also stores `evidence_uri` on-chain, `app/src/app/api/evidence/route.ts` uploads with `access: "public"`, and `ClaimTable.tsx` links to it.
4. **"1.5 million MSMEs supply listed companies or exporters"** (#26) has no source. PIB's Budget 2025-26 note puts exporting MSMEs at about 1.73 lakh (0.17 million) in FY2024-25. The ₹60 crore revenue figure rests on this number.
5. **"Fraction of a rupee per attestation"** (#2, #21) holds only for the verifier's signature (5,000 lamports, about ₹0.05). Each claim also creates a 440-byte account whose rent deposit is 2,885,440 lamports (about ₹28, or $0.35). The program has no close instruction, so that deposit is never returned.

## Summary table

| # | Where | Claim (short quote) | Rating | Fix needed |
|---|---|---|---|---|
| 1 | WhySection | "5000 lamports base fee per signature" | Accurate | — |
| 2 | WhySection | "A fraction of a rupee per attestation" | Approx | Yes |
| 3 | WhySection | "400 ms slot time" | Inaccurate | Yes |
| 4 | WhySection | "signature lands in under a second" | Approx | Minor |
| 5 | WhySection | "1 link replaces 40 questionnaires" | Unsupported | Yes |
| 6 | WhySection | "100% publicly verifiable" | Approx | Minor |
| 7 | WhySection | "1,000 listed companies under BRSR" | Accurate | — |
| 8 | WhySection | "BRSR Core assurance phases in for value-chain partners through FY2026 to FY2027" | Inaccurate | Yes |
| 9 | WhySection | "2025 CSRD reporting began" | Accurate | — |
| 10 | WhySection | "Large EU companies now report under ESRS and push data requests down" | Approx | Yes |
| 11 | WhySection | "Jan 2026 CBAM definitive phase" | Accurate | — |
| 12 | WhySection | "Embedded-emissions data ... no longer optional paperwork" | Approx | Yes |
| 13 | WhySection | "63M Indian MSMEs" | Approx | Minor |
| 14 | Hero | chip "CBAM 2026" | Accurate | — |
| 15 | Hero | mock "slot 318,204,771" | Unsupported (illustrative) | Minor |
| 16 | HowItWorks | "only the hash goes on-chain" | Inaccurate | Yes |
| 17 | PITCH | "about 63 million MSMEs" | Approx | Minor |
| 18 | PITCH | "top 1,000 listed companies must file BRSR" | Accurate | — |
| 19 | PITCH | "since FY2025 the largest must get value-chain ESG data assured" | Inaccurate | Yes |
| 20 | PITCH | "supplier with 40 customers fills 40 spreadsheets" | Unsupported (illustrative) | Minor |
| 21 | PITCH | "Attestation cost is a fraction of a rupee" | Approx | Yes |
| 22 | PITCH | "BRSR Core assurance requirement is phasing in for value-chain partners through FY2026 to FY2027" | Inaccurate | Yes |
| 23 | PITCH | "CSRD reporting began for large EU companies in 2025" | Accurate | — |
| 24 | PITCH | "CBAM moved to its definitive phase in January 2026" | Accurate | — |
| 25 | PITCH | "both pushing data requests down to Indian exporters" | Approx | Yes |
| 26 | PITCH | "1.5 million Indian MSMEs supply listed companies or exporters" | Unsupported | Yes |
| 27 | PITCH | "4 claims x ₹100 ... 60 crore rupees (about USD 7 million)" | Accurate (arithmetic only) | — |
| 28 | PITCH | "assurance of BRSR Core ... several hundred crore rupees a year" | Unsupported | Yes |
| 29 | PITCH | "textile exporters ... supplying EU brands under CSRD" | Approx | Yes |
| 30 | PITCH | "Hackathon build (14 Sep to 12 Oct 2026)" | Accurate | — |
| 31 | PITCH | "repository was created on 3 October 2026" | Accurate | — |
| 32 | PITCH | "The document itself stays private" | Inaccurate | Yes |

---

## Detail

### Landing page: Why Solana (`WhySection.tsx`, `solana` cards)

**1. "5000 / lamports base fee per signature"**: Accurate.
Solana docs: the base fee is 5,000 lamports per signature, split 50% burned and 50% to the validator. Priority fees are extra and optional.
Source: https://solana.com/docs/core/fees

**2. "A fraction of a rupee per attestation, so a micro-enterprise filing four claims a year is viable."**: Approximately right.
The verifier's `verify_claim` transaction has one signature: 5,000 lamports = 0.000005 SOL, about ₹0.05 at ₹9,828/SOL (4 Oct 2026). So the *attestation signature* does cost a fraction of a rupee. But the supplier's `submit_claim` transaction initialises a new `Claim` PDA of 440 bytes. On 4 Oct 2026, `getMinimumBalanceForRentExemption(440)` returned 2,885,440 lamports on both devnet and mainnet, about ₹28 (about $0.35). The program has no close instruction, so the deposit stays locked. Four claims a year still cost only about ₹115 all in, so the viability point holds.
Suggested: "Under ₹30 per claim all in, and about 5 paise for the verifier's signature, so a micro-enterprise filing four claims a year is viable." Or keep "fraction of a rupee per signature" and drop "per attestation".
Sources: https://solana.com/docs/core/fees ; live RPC `getMinimumBalanceForRentExemption` on api.mainnet-beta.solana.com and api.devnet.solana.com (2,885,440 lamports for 440 bytes) ; SOL price https://www.bybit.com/en/convert/sol-to-inr/

**3. "400 ms / slot time"**: Inaccurate (out of date).
The slot target was 400 ms until August 2026. SIMD-0525's staged reductions took mainnet to 350 ms on 19 Aug 2026 (epoch 1019) and to 300 ms on 25 Aug 2026 (epoch 1023). The 250 ms and 200 ms steps are already live on devnet and testnet. `getRecentPerformanceSamples` on 4 Oct 2026 showed about 224 slots/min on mainnet (about 268 ms) and about 256 slots/min on devnet (about 234 ms).
Suggested: change the counter to `to={300}` with label "ms slot target (mainnet)", or use "<0.5 s slot time" so it survives the next reductions.
Sources: https://solana.com/upgrades/reduced-slot-times ; https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0525-reduce-slot-times.md

**4. "A verifier's signature lands in under a second, timestamped by the chain itself."**: Approximately right.
Inclusion at "confirmed" commitment is usually sub-second, but "finalized" takes about 32 slots (roughly 8 to 13 s). The `verified_at` timestamp comes from the Clock sysvar, which is validator-voted stake-weighted time, not wall-clock precise. This is fine for marketing copy.
Suggested (optional): "A verifier's signature is confirmed in under a second and finalized within seconds."
Source: https://solana.com/developers/guides/advanced/confirmation

**5. "40 → 1 link / replaces 40 questionnaires"**: Unsupported (illustrative).
I found no survey giving 40 questionnaires per MSME.
Suggested: "replaces a questionnaire per buyer", or footnote that 40 is illustrative.
Source: none found.

**6. "100% / publicly verifiable"**: Approximately right.
Claim accounts, verifier keys and signatures are publicly readable. Buyers can verify the evidence hash only if someone gives them the document (or the public URI, see #16). "Cannot be edited after the fact" holds: `verify_claim` rejects already-resolved claims (`ClaimAlreadyResolved`).
Suggested: label "of claims publicly readable on-chain".
Source: code, `programs/greenledger/src/lib.rs`.

### Landing page: Why now (`WhySection.tsx`, `now` cards)

**7. "1000 / listed companies under BRSR"**: Accurate.
BRSR is mandatory for the top 1,000 listed entities by market capitalisation from FY2022-23, under SEBI's circular of 10 May 2021.
Source: https://www.sebi.gov.in/legal/circulars/may-2021/business-responsibility-and-sustainability-reporting-by-listed-entities_50096.html

**8. "SEBI's BRSR Core assurance phases in for value-chain partners through FY2026 to FY2027."**: Inaccurate.
Under SEBI circular SEBI/HO/CFD/CFD-PoD-1/P/CIR/2025/42 (28 Mar 2025):
- Value-chain ESG disclosures apply to the top 250 listed entities on a **voluntary** basis from FY2025-26.
- **Assessment or assurance** of those disclosures is **voluntary** from FY2026-27.
- The value chain is limited to partners that each make up 2% or more of purchases or sales, with coverage capped at 75%.
- "Reasonable assurance" became "assessment or assurance".
- BRSR Core assessment or assurance for the listed entities themselves continues its glide path: top 150 (FY2023-24), 250 (FY2024-25), 500 (FY2025-26), 1,000 (FY2026-27).

Suggested: "Top 250 listed companies can now report value-chain ESG data under BRSR (voluntary from FY2025-26, with assessment or assurance from FY2026-27), and BRSR Core assurance reaches the top 1,000 in FY2026-27."
Source: https://www.sebi.gov.in/legal/circulars/mar-2025/measures-to-facilitate-ease-of-doing-business-with-respect-to-framework-for-assurance-or-assessment-esg-disclosures-for-value-chain-and-introduction-of-voluntary-disclosure-on-green-credits_93102.html

**9. "2025 / CSRD reporting began"**: Accurate.
Wave 1 (large public-interest entities with more than 500 employees, previously under the NFRD) reported FY2024 in 2025. The April 2025 "stop-the-clock" Directive (EU) 2025/794 did not delay wave 1.
Source: https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en ; https://eur-lex.europa.eu/eli/dir/2025/794/oj

**10. "Large EU companies now report under ESRS and push data requests down to Indian exporters."**: Approximately right.
- Only wave 1 reports today. Stop-the-clock moved wave 2 (other large companies) to FY2027 reports, due in 2028.
- Omnibus I (adopted by the Council 24 Feb 2026, published in the OJ 26 Feb 2026) narrows CSRD scope to companies with more than 1,000 employees and more than €450M turnover.
- Omnibus I also adds a **value-chain cap**: reporting companies cannot demand more than the voluntary (VSME-based) standard from value-chain companies with fewer than 1,000 employees. That covers almost every Indian MSME.

Suggested: "The largest EU companies now report under ESRS and ask suppliers for data, within the limits of the EU's voluntary SME standard."
Sources: https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en ; https://www.lw.com/en/insights/eu-sustainability-omnibus-published-in-the-official-journal

**11. "Jan 2026 / CBAM definitive phase"**: Accurate.
The Commission states: "As of 1 January 2026, CBAM is applicable under its definitive regime."
Source: https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en

**12. "Embedded-emissions data for exports to the EU is no longer optional paperwork."**: Approximately right (overbroad and slightly misleading).
- CBAM covers only cement, iron and steel, aluminium, fertilisers, electricity and hydrogen, not all exports.
- Regulation (EU) 2025/2083 (in force 20 Oct 2025) exempts importers bringing in 50 tonnes or less of CBAM goods per year (electricity and hydrogen excluded from the exemption). It also pushes the sale and surrender of CBAM certificates to 2027.
- Reporting was already mandatory for importers in the 2023-2025 transitional period, so it was never "optional". What changed in 2026 is the authorised-declarant regime and financial liability.

Suggested: "For steel, aluminium, cement and fertiliser exports to the EU, embedded-emissions data now carries a carbon price."
Sources: https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en ; https://eur-lex.europa.eu/eli/reg/2025/2083/oj

**13. "63M / Indian MSMEs"**: Approximately right.
63.39 million (633.88 lakh) is the NSS 73rd round estimate for 2015-16, which the Ministry of MSME still quotes ("6.3 crore"). The data is a decade old. Udyam plus Udyam Assist registrations passed 8.9 crore in July 2026, so the newer counts are higher.
Suggested: "63M+ Indian MSMEs (NSS estimate)", or cite the Udyam count.
Sources: https://msme.gov.in/sites/default/files/FINALMSMEANNUALREPORT2023-24ENGLISH.pdf ; https://dashboard.msme.gov.in/

### Landing page: Hero (`Hero.tsx`) and HowItWorks

**14. Chip "CBAM 2026"**: Accurate (see #11).

**15. Mock attestation "slot 318,204,771"**: Unsupported (illustrative).
Devnet is around slot 507 million and mainnet around 453 million (4 Oct 2026), so a sharp-eyed judge could spot the mock. The other mock values ("48,200 kWh, Apr to Jun 2026", "320 MWh Q1 FY26", "1,240 kL FY25") are internally consistent demo data.
Suggested: use a slot from a real seeded devnet transaction, or one in the 5xx,xxx,xxx range.
Source: live RPC `getRecentPerformanceSamples`.

**16. HowItWorks: "The evidence document is hashed with SHA-256 and only the hash goes on-chain."**: Inaccurate.
`Claim` also stores `evidence_uri` (up to 128 chars) on-chain. `app/src/app/api/evidence/route.ts` uploads to Vercel Blob with `access: "public"`, and `components/ClaimTable.tsx` renders the URI as a link.
Suggested: "The evidence document is hashed with SHA-256; the hash and a link to the file are stored on-chain." Or change the upload so the URI stays off-chain or private.
Source: code.

### PITCH.md

**17. "India has about 63 million MSMEs."**: Approximately right (see #13).

**18. "The top 1,000 listed companies must file Business Responsibility and Sustainability Reports (BRSR)"**: Accurate (see #7).

**19. "and since FY2025 the largest must get value-chain ESG data assured."**: Inaccurate.
Value-chain disclosure is voluntary from FY2025-26 and its assessment or assurance is voluntary from FY2026-27 (see #8). What *is* mandatory is BRSR Core assessment or assurance of the company's own data (top 250 in FY2024-25, top 500 in FY2025-26, top 1,000 in FY2026-27).
Suggested: "BRSR Core data must now be independently assessed or assured for the top 500 (top 1,000 from FY2026-27), and SEBI has opened voluntary value-chain disclosure for the top 250."
Source: SEBI circular of 28 Mar 2025 (link in #8).

**20. "A supplier with 40 customers fills 40 spreadsheets"**: Unsupported (illustrative). It reads as a hypothetical, which is fine; add "for example". (See #5.)

**21. "Attestation cost is a fraction of a rupee"**: Approximately right (see #2). The same phrase appears in `docs/SUBMISSION.md` line 30.

**22. "SEBI's BRSR Core assurance requirement is phasing in for value-chain partners through FY2026 to FY2027."**: Inaccurate (see #8). Use the suggested wording there.

**23. "CSRD reporting began for large EU companies in 2025"**: Accurate (wave 1; see #9). "The largest EU companies" is slightly more precise.

**24. "CBAM moved to its definitive phase in January 2026"**: Accurate (see #11).

**25. "both pushing data requests down to Indian exporters"**: Approximately right.
CBAM applies only to six sectors and to importers above 50 t/yr. CSRD requests to small suppliers are capped at the voluntary standard (see #10 and #12).
Suggested: "...pushing emissions data requests down to Indian exporters of steel, aluminium and other covered goods, and to suppliers of the largest EU groups."

**26. "Bottom-up: 1.5 million Indian MSMEs supply listed companies or exporters."**: Unsupported.
I found no source. PIB (Budget 2025-26 release) puts exporting MSMEs at 1,73,350 in FY2024-25. No official count exists of MSMEs supplying listed companies.
Suggested: state the assumption explicitly ("We assume roughly 1.5 million MSMEs sit in listed-company or export supply chains"), or build up from sourced numbers, for example 1.73 lakh exporting MSMEs plus suppliers to the top 1,000 BRSR filers.
Source: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2099687

**27. "four verified claims a year and a 100 rupee platform fee ... 60 crore rupees (about USD 7 million)"**: Accurate as arithmetic.
1.5M x 4 x ₹100 = ₹60 crore, which is about $6.8M at ₹88/$. The result inherits the unsupported input in #26.

**28. "assurance of BRSR Core alone is estimated at several hundred crore rupees a year in India"**: Unsupported.
I found no published estimate. A rough check (1,000 entities at ₹10 to 50 lakh per engagement gives ₹100 to 500 crore) makes it plausible, but nothing published backs it.
Suggested: cite a source, or say "We estimate..." and show the working.

**29. "textile exporters in Karnataka and Tamil Nadu supplying EU brands under CSRD"**: Approximately right.
Textiles are not CBAM goods. Most EU fashion brands outside wave 1 now report from FY2027 at the earliest, and only if they exceed 1,000 employees and €450M. Supplier requests to small suppliers are capped at the voluntary standard. This is still a reasonable beachhead, since large brands already run supplier ESG programmes and BRSR value-chain disclosure adds domestic pull, but the CSRD urgency is weaker than the copy implies.
Suggested: "...supplying large EU brands whose CSRD and buyer codes of conduct already ask for supplier emissions data."
Source: links in #10.

**30. "Hackathon build (14 Sep to 12 Oct 2026)"**: Accurate.
The Colosseum Crypto World's Fair hackathon runs 14 Sep to 12 Oct 2026, with submissions due 12 Oct.
Source: https://colosseum.com/worldsfair

**31. "The repository was created on 3 October 2026."**: Accurate. The first commit, "Initial scaffold", is dated 2026-10-03 22:10 +0530.
Source: `git log`.

**32. "The document itself stays private."**: Inaccurate today (see #16).
Uploaded evidence is public on Vercel Blob and its URL is on-chain. The roadmap line "plain storage is live today" admits this, but the "What GreenLedger does" section contradicts it.
Suggested: "The document is stored off-chain; only its hash and a link are recorded. Encrypted, verifier-only storage is on the roadmap."

---

## Could not verify

- **SOL/INR rate**: ₹9,828/SOL (about $119.7) is a 4 Oct 2026 snapshot from an exchange page. Rupee amounts in #2 and #21 move with the price.
- **Rent rate**: the live RPC returns 2,885,440 lamports for 440 bytes, below the classic (128 + bytes) x 6,960 formula (3,953,280). That suggests a rent reduction has activated. I took the live RPC value and did not trace the specific feature gate.
- **SEBI after March 2025**: I found no 2026 SEBI circular that changes the value-chain timeline again, but sebi.gov.in circular pages did not render full text via fetch. The provisions above come from the circular title and multiple secondary summaries that agree.
- **Exporting-MSME count (1.73 lakh)**: the PIB page returned HTTP 403 to the fetcher. The figure is quoted from search-indexed summaries of that release.
- **Claims #5, #20, #26, #28** have no locatable source at all (see ratings).
