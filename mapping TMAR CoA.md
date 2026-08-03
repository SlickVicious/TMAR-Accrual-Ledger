Done. The cross-reference is saved at:

06-Account-Register/Digital-Binders/TMAR_CoA_CrossReference.md

Here's what it covers in six sections:

────────────────────────────────────

What Was Mapped

Section 1 — TMAR Account Type Registry: All 33 TMAR account types from theValidation/Master Register sheets, each mapped to its equivalent standard CoAaccount number. Example: Utility Electric → CoA 6400 Utilities, Credit Card → CoA2000 Accounts Payable.

Section 2 — Full 90-Account Standard CoA → TMAR: Every account from 1000 (Cash -Operating) through 9900 (Gain/Loss on Disposal) with its TMAR equivalent. Where thestandard CoA has accounting-level abstractions (like "Prepaid Expenses" or"Accrued Expenses"), I noted how the TMAR system tracks these at thevendor/obligation level.

Section 3 — Reverse Map (TMAR Ledger Category → CoA): When you enter a transactionin the TMAR Ledger under a category like "Housing," this tells you the correctCoA debit and credit pattern.

Section 4 — TMAR Validation Dropdown Reference: The full list of 33 account-typevalues used in the Validation sheet dropdowns — use these for UI autocompleteoptions.

Section 5 — 3R Dual-Character Integration: Which TMAR categories generate thesecond journal leg (Financial Asset + Property Reserve). Example: Housing → DR 1751+ CR 3751. Also identifies which categories are non-deduction (single-entry only —like Transfers and Credit Card principal payments).

Section 6 — Quick Feeder: Maps each payment source (BOA Debit, BOA Zelle, Cap One,PayPal, etc.) to its default TMAR category and CoA account for automated entryrouting.

────────────────────────────────────

Key Design Decisions

• Account 3500 (Owner Draws) + 8600 (Distributions) are the correct accounts forZelle transfers to Syrina — they're cash outflows, not expenses. The TMAR correctlytracks these under "Transfers" not "Expenses."
• Trust-specific accounts (3600 Trust Corpus, 8500 Fiduciary Fees, 8600 BeneficiaryDistributions, 8700 Attorney Fees) map directly to TMAR Trust categories and Form1041 line items.
• The 3R Financial Asset extension ranges (1750–1759, 3750–3759) are laid out perTMAR category for the dual-character ledger entries.