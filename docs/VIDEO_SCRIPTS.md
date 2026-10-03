# Video scripts

Two videos are required: a pitch (2 to 3 minutes) and a product demo (under 3 minutes). Judges watch the pitch first. Record at 1080p, screen plus voice. Keep each take under the limit with ten seconds to spare.

## Pitch video (target 2:30)

**0:00 to 0:15, hook.** Screen: the live landing page, slow scroll.
> "Every large company in India now has to report ESG data for its supply chain. So every supplier gets the same spreadsheet from forty different buyers, attaches the same electricity bill forty times, and nobody can verify any of it. GreenLedger fixes that."

**0:15 to 0:45, problem.** Screen: a cluttered spreadsheet, then a stack of PDFs.
> "SEBI's BRSR Core rules are phasing in value-chain assurance through 2027. EU buyers add CSRD and CBAM on top. The cost of all this lands on MSMEs, the companies least able to pay for an auditor per customer per year. Buyers either trust unverified numbers or pay for the same verification over and over."

**0:45 to 1:30, solution.** Screen: public supplier page, then verifier console, then buyer dashboard.
> "GreenLedger is a public ledger of verified ESG claims on Solana. A supplier records a claim once: energy, Scope 1 and 2 emissions, renewable certificates, water, waste. Each claim carries the hash of its evidence document. An accredited verifier reviews the evidence and signs an on-chain attestation. From then on, any buyer opens one link, or scans one QR code, and sees every claim, who verified it, and when. One verification serves every buyer."

**1:30 to 1:55, why Solana.** Screen: Solana Explorer showing a claim account.
> "Attestations cost a fraction of a rupee, so a micro-enterprise with four claims a year is viable. Verifier signatures and timestamps are public and can't be edited after the fact, which is what assurance teams actually need. And the data is composable: a lender or a carbon registry can read verified claims directly."

**1:55 to 2:20, business and go to market.** Screen: pitch doc headings or simple slides.
> "Suppliers record for free. The platform earns a fee per verification, and buyers subscribe for bulk lookup and BRSR export. We start with textile exporters in Karnataka and Tamil Nadu who supply EU brands, partnered with one assurance body already doing BRSR Core work. Buyer-led onboarding: the buyer sends a GreenLedger link instead of a spreadsheet."

**2:20 to 2:30, close.** Screen: landing page hero.
> "I'm Ghost, building GreenLedger from Bengaluru. Everything you saw is live on Solana devnet and open source. Link in the submission."

## Demo video (target 2:40)

Set-up before recording: Phantom on devnet with three accounts named Supplier, Verifier, Buyer. Seed script already run so the directory has data. Have `docs/demo-evidence/bescom-q1-fy27.pdf` and a tampered copy ready on the desktop.

**0:00 to 0:10.** Landing page. Point at the live stats.
> "This is GreenLedger on Solana devnet. Those numbers are read from the chain."

**0:10 to 0:55, supplier.** Switch Phantom to the Supplier account, open /supplier.
> "A supplier connects a wallet and registers once with its GSTIN." Fill name, GSTIN, sector, approve in Phantom.
> "Now a claim. Energy consumption for the quarter, 48,250 kilowatt hours, and the BESCOM invoice as evidence. Only the hash goes on-chain; the invoice never leaves my machine." Submit, approve in Phantom, show the explorer link on the confirmation.

**0:55 to 1:30, verifier.** Switch to the Verifier account, open /verify.
> "Verifiers are approved by the registry. This one is accredited under NABCB. The claim is in the queue with the supplier's GSTIN and the evidence hash." Click Approve, type a note, approve in Phantom.
> "That signature is now permanent."

**1:30 to 2:10, buyer.** Open /buyer, no wallet needed.
> "A procurement team doesn't need a wallet. Add suppliers by GSTIN, see verification rates across the whole watchlist, export everything as a BRSR-ready CSV." Add the supplier, show the rate, click export.
> Open the public page from the watchlist. "Each supplier has a public record with a QR code they can put on an invoice."

**2:10 to 2:35, document check.** On the public page, drop the genuine invoice.
> "Been sent a PDF? Drop it here. It matches claim zero, verified." Drop the tampered copy. "Change one byte and it fails. That's the whole point of hashing the evidence."

**2:35 to 2:40.** Verifiers page.
> "Every verifier and every attestation is public. Thanks for watching."

## Recording notes

- Zoom the browser to 110 percent so text is readable at 1080p.
- Hide bookmarks bar and other tabs.
- Pre-approve Phantom's connection to localhost or the Vercel domain so no permission dialogs interrupt.
- If a devnet transaction is slow, cut the pause in editing rather than re-recording.
- Export at 1080p, H.264, upload to YouTube as unlisted, paste links in both submission forms.
