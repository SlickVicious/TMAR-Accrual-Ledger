**Last Updated:** 2026-02-26 23:50 EST **Project:** tmar-engine (Python automation for Trust Master Account Register) **Sheet ID:** `1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ` **Prompts Version:** v2 (adapted to 22-tab actual sheet structure)

---

## 🏗️ Architecture Evolution

### Design History

|Version|Date|Description|
|---|---|---|
|v1 — 12-Tab Excel|2026-01-18|Original SCALABLE Excel design (see `Master-Account-Register-SCALABLE-Design.md`)|
|v2 — 13-Tab Unified|2026-02-11|Merged Python workbook + CSV + SCALABLE design with FWM alignment|
|v3 — 8-Tab Living GSheet|2026-02-26|Planned schema — superseded by v3.1 after sheet audit|
|**v3.1 — 22-Tab Living GSheet**|**2026-02-26**|**CURRENT** — Adapted to actual sheet structure. Prompts v2 written.|

### Current Schema (v3.1 — 22 Tabs, Actual)

**Group A — Living Dashboard & Household (Tabs 1-12)**

|#|Tab Name|Header Row|Cols|Purpose|
|---|---|---|---|---|
|1|Executive Dashboard|Row 1 (title)|Free-form|Trust ID, EIN, Trustee, CAF|
|2|Syrina Credit Summary|Row 1 (title)|Free-form|TransUnion credit report|
|3|Syrina Debt Strategy|Row 1 (title)|Free-form|Debt resolution & tax strategy|
|4|Syrina Student Loans|Row 1 (title)|Free-form|Federal student loans|
|5|_Settings|Row 1|2|Active Year, Last Gap Scan|
|6|CPA Questions|Row 1|12|Q-ID through Resolved|
|7|Transaction Ledger|Row 1|16|Date through Source|
|8|W-2 & Income Detail|Row 1 (title)|3 (Row 2)|Box, Description, Amount|
|9|Gap Report|Row 1|8|Tab Name through Registry Status|
|10|BOA Cash Flow|Row 1 (title)|8 (Row 2)|Month through Zelle to Syrina|
|11|Household Obligations|Row 1|11|Vendor through Notes|
|12|Tax Strategy|Row 1 (title)|Free-form|Tax filing summary — MFJ|

**Group B — Estate Ledger & Compliance (Tabs 13-22)**

|#|Tab Name|Header Row|Cols|Purpose|
|---|---|---|---|---|
|13|Master Register|Row 1|35|Full account inventory|
|14|Forms & Authority|Row 2 (title in 1)|13|Fiduciary forms, FOIA|
|15|Trust Ledger|Row 2 (title in 1)|8|Asset ledger with verified values|
|16|Banking Log|—|0|Empty — engine populates|
|17|EIN Acct Ledger|Row 1|16|1099 recipient data|
|18|1099 Filing Chain|Row 2 (title in 1)|15|Three-layer uplift tracking|
|19|Proof of Mailing|Row 2 (title in 1)|14|Certified mail & PS 3811 log|
|20|Receipts, Subscriptions & Services|Row 1|10|Service costs & deductibility|
|21|Document Inventory|Row 2 (title in 1)|17|Trust doc inventory & corrections|
|22|_Validation|Row 1|10|Dropdown validation lists|

---

## ✅ Pre-Requisites (Validated 2026-02-26)

|Prerequisite|Status|Details|
|---|---|---|
|GCP Project|✅ Ready|`expense-tracker-459709` (reused from BET Project)|
|Service Account Key|✅ Ready|`~/Downloads/04_Dev-Config/credentials.json`|
|Service Account Email|✅ Known|`cupsup-bet@expense-tracker-459709.iam.gserviceaccount.com`|
|OAuth Client Secret|✅ Ready|`~/Downloads/04_Dev-Config/client_secret_680767092305-*.json`|
|Google Sheets API|✅ Enabled|Via BET Project GCP config|
|Python|⚠️ 3.9.6|System Python — 3.11+ preferred, Claude Code can upgrade|
|pip|✅ 21.2.4|Available|
|Homebrew|❌ Not installed|Claude Code can install|
|tesseract|❌ Not installed|OCR fallback — brew install tesseract|
|uv|❌ Not installed|Claude Code can install, or use pip|
|**Share TMAR sheet**|✅ **DONE**|Shared 2026-02-26, 403→200 confirmed via API test|

---

## 📋 Claude Code Prompt Execution Status

|Prompt|Module|Status|Notes|
|---|---|---|---|
|**0 — Init**|Project structure, config, dependencies|⏳ **NEXT**|Creates ~/Projects/tmar-engine/|
|**1 — Scanner**|src/scanner/ — FileCabinet cataloger|⏳ Queued|30+ classification rules|
|**2 — Extractor**|src/extractor/ — PDF/CSV data extraction|⏳ Queued|BOA, Fidelity, CashApp, PayPal, IRS, W-2|
|**3 — Sheets**|src/sheets/ — Google Sheets API sync|⏳ Queued|**22-tab schema**, upsert logic, service account auth|
|**4 — Ledger**|src/ledger/ — Double-entry reconciliation|⏳ Queued|Writes to 4 tabs: Trust Ledger, Transaction Ledger, BOA Cash Flow, Banking Log|
|**5 — Compliance**|src/compliance/ — IRS form tracking & gaps|⏳ Queued|6 modules: form_tracker, filing_chain, mailing_log, deadline_calendar, gap_analyzer, tin_matcher|
|**6 — Pipeline**|scripts/full_pipeline.py — CLI orchestrator|⏳ Queued|scan→extract→ledger→sync across all 22 tabs|
|**7 — CLAUDE.md**|Project memory for future sessions|⏳ Queued|Full 22-tab schema, compliance rules, FWM mapping|

**Execution order:** 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7
**Blocker:** ~~Share TMAR sheet~~ ✅ RESOLVED 2026-02-26
**Prompts:** v2 adapted to 22-tab actual structure (see `TMAR Living GSheet — Claude Code Project Prompts v2.md`)

---

## 📂 Data Sources Cataloged

### Primary: /Users/animatedastronaut/Downloads/FileCabinet 2/Taxes

|Provider|Type|Directory|Years|Doc Count|
|---|---|---|---|---|
|Bank of America|Checking|Clint taxes/BOA statements|2022-2025|48 monthly statements|
|Fidelity|Brokerage/IRA|Clint taxes/Fidelity docs|2020-2025|1099s, 5498s, statements|
|Vanguard|401k|Clint taxes/Vanguard 401k|—|401k docs|
|Vanguard|Distributions|Clint taxes/Vanguard|—|1099-R forms|
|CashApp|P2P/Payment|Clint taxes/CashApp|2018-2025|CSV transaction reports|
|PayPal|P2P/Payment|Clint taxes/Expenses/Paypal|2024-2025|24 monthly statements|
|Webull|Brokerage|Clint taxes/Webull|2021-2025|1099s, monthly statements|
|IRS|Transcripts|Clint taxes/Account Transcripts + 3 more|2016-2024|Account, Return, W&I, RoA|
|IRS|Forms|IRS Files & FORMS/|—|56, 2848, 8821, W-9, 8832|
|SSA|Benefits|Clint taxes/SSAdocs|—|Verification, statement|
|Credit Bureaus|Reports|Clint taxes/credit reports|—|Experian, TransUnion, Equifax|
|Employers|W-2s|Clint taxes/W2's|2016-2025|Annual W-2 forms|

### Secondary Principal (Syrina)

- Various providers under Taxes/Syrina/

### Parent-Level Directories

|Directory|Classification|
|---|---|
|1099's/|Filed 1099-A and 1099-B forms|
|ABB's/|Additional 1099 forms (BOA)|
|FWMclassDocs/|Freeway Mechanics class reference & templates|
|Filings/|State filings, assumed name, CUSIP|
|Estates/|Trust estate documents|
|Business Ents/|Business entity docs (Domivia, SoleProp)|
|Expenses/|Master transaction databases (.numbers)|

---

## 🔢 File Classification Rules (30+)

```
*eStmt_*.pdf                    → bank-statement
*Statement*.pdf (Fidelity)      → brokerage-statement
*1099*.pdf                      → tax-form-1099 (sub: A, B, C, R, DIV, INT)
*W2*.pdf | *w2*.pdf             → tax-form-w2
*5498*.pdf                      → tax-form-5498
*1095*.pdf                      → tax-form-1095
*_accTx.pdf | *_acctTx.pdf      → irs-account-transcript
*_rtrn*.pdf                     → irs-return-transcript
*_RoATx.pdf                     → irs-record-of-account
*_W&I*.pdf | *W&E*.pdf          → irs-wage-income-transcript
*RefundTx*.pdf                  → irs-refund-transcript
cash_app_report_*.csv           → cashapp-transactions
statement-*-20*.pdf (PayPal)    → paypal-statement
*paystubs* | date-PDFs          → paystub
*credit*report* | *TransUnion*  → credit-report
*benefit-verification*          → ssa-verification
*social-security-statement*     → ssa-statement
*1040*.pdf                      → tax-return
*f56*.pdf                       → irs-form-56
*f2848*.pdf                     → irs-form-2848
*f8821*.pdf                     → irs-form-8821
*fw9*.pdf                       → irs-form-w9
*TradeConfirmation*.pdf         → trade-confirmation
*AccountRecords*.pdf            → account-records
*Net worth*.xlsx                → net-worth-summary
*.numbers                       → apple-numbers-file
FWMclassDocs/*                  → fwm-reference
1099's/* | ABB's/*              → filed-1099
Estates/*                       → estate-document
Filings/*                       → state-filing
```

---

## 🔗 FWM Step → Module Mapping

|FWM Step|Description|TMAR Module|
|---|---|---|
|1|Identity & File Setup|scanner — directory cataloging|
|7|Account Inventory|Tab 2: Master Account Register|
|8|Source Documents|Tab 3: Document Inventory + extractor|
|9|Ledgers|ledger module + Tab 4: Trust Ledger (per-account)|
|10|Valuations|valuation.py — docs-only, no memo = no uplift|
|11|Admin Notices|compliance/form_tracker|
|12-15|IRS Forms|Tab 5: IRS Form Tracker|
|14|Assembly & Filing|compliance + gap_analysis|
|14.3|Filing Calendar|Tab 6: Filing Deadlines|

---

## ⚖️ Critical Compliance Rules

1. NEVER fabricate values on any forms
2. No memo = no uplift — only documented FMV from statements/ledgers/contracts
3. Use only verified figures from source documents
4. Maintain audit-ready files at every step
5. TIN matching must be validated across account registry, filed 1099s, and W-9s
6. Two principals: Clint (primary) and Syrina (secondary)

---

## 📌 Contact Registry (Pre-populated)

|Office/Role|Name|Address|Phone|URL|
|---|---|---|---|---|
|Suffolk VA Court Clerk|W. Randolph Carter Jr.|—|—|—|
|Kinston NC Court Clerk|Dawn G. Stroud|—|—|—|
|NC Attorney General|Jeff Jackson|—|—|—|
|NC State Treasurer|—|—|—|—|
|US Treasury Secretary|Scott Bessent|—|—|—|
|NC Secretary of State|Elaine F. Marshall|2 S Salisbury St, Raleigh NC 27601|919-814-5400|https://www.sosnc.gov|

---

## 🚀 Next Steps (Execution Checklist)

- [x] **Share TMAR sheet** with cupsup-bet@expense-tracker-459709.iam.gserviceaccount.com (Editor) ✅ 2026-02-26
- [x] **Adapt prompts to actual 22-tab sheet structure** (v1→v2) ✅ 2026-02-26
- [ ] Execute Prompt 0 in Claude Code (project init) ⬅️ **START HERE**
- [ ] Execute Prompt 1 (scanner)
- [ ] Execute Prompt 2 (extractor)
- [ ] Execute Prompt 3 (sheets sync — requires sheet sharing)
- [ ] Execute Prompt 4 (ledger)
- [ ] Execute Prompt 5 (compliance)
- [ ] Execute Prompt 6 (pipeline CLI)
- [ ] Execute Prompt 7 (CLAUDE.md)
- [ ] Run full pipeline: python scripts/full_pipeline.py
- [ ] Verify Dashboard tab populates
- [ ] Run gap analysis: python scripts/full_pipeline.py --report gaps

---

## 📚 Related Dev Notes (This Directory)

|File|Purpose|Status|
|---|---|---|
|README.md|Documentation index|✅ Current (2026-02-11)|
|COMPLETE-SYSTEM-SUMMARY.md|Phase 1 vault reorg|✅ Complete (2026-01-18)|
|Master-Account-Register-SCALABLE-Design.md|v1 12-tab Excel|✅ Superseded by v3|
|Google-Sheets-Master-Account-Register-Setup.md|Manual setup|✅ Superseded by automation|
|Google-Sheets-Master-Account-Register-Guide.md|Detailed manual setup|✅ Superseded by automation|
|Financials_Reorganization_Plan_FreewayMechanics.md|FWM migration plan|✅ Complete|
|Financials_Analysis_Report.md|Directory analysis|✅ Complete|
|TMAR Living GSheet — Claude Code Project Prompts.md|v1 — 8-tab prompts|⚠️ Superseded by v2|
|**TMAR Living GSheet — Claude Code Project Prompts v2.md**|**v2 — 22-tab prompts**|✅ **Ready for execution**|
|**TMAR-Implementation-Status.md**|**THIS FILE**|🔄 Active|

---

_Generated: 2026-02-26 | Framework: Freeway Mechanics Workbook Part 1_ _Pipeline: scanner → extractor → ledger → compliance → sheets sync_