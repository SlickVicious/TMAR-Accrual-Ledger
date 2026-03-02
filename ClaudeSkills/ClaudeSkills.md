---
type: skill-index
Category: ClaudeSkills
status: active
Date-Added: "[[2026-02-26]]"
tags:
  - "#My/SysAdmin"
  - "#Claude/Skill"
  - "#AI/Automation"
---

**Last Updated:** 2026-02-26 **Project:** tmar-engine (Python automation for Trust Master Account Register) **Sheet ID:** `1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ`

---

## 🏗️ Architecture Evolution

### Design History

|Version|Date|Description|
|---|---|---|
|v1 — 12-Tab Excel|2026-01-18|Original SCALABLE Excel design (see `Master-Account-Register-SCALABLE-Design.md`)|
|v2 — 13-Tab Unified|2026-02-11|Merged Python workbook + CSV + SCALABLE design with FWM alignment|
|v3 — 8-Tab Living GSheet|2026-02-26|**CURRENT** — Streamlined cloud-native schema, Python automation pipeline|

### Current Schema (v3 — 8 Tabs)

|Tab|Name|FWM Step|Purpose|
|---|---|---|---|
|1|Dashboard|Overview|Trust ID, FWM step completion, filing deadlines, gap summary, sync timestamp|
|2|Master Account Register|Step 7|Provider, EIN, account#, type, principal, status, balance, notices, 1099s, statements|
|3|Document Inventory|Step 8|Provider, doc type, tax year, filename, path, extraction status/confidence|
|4|Trust Ledger|Step 9|Per-account: Date, Ref, Counterparty, Description, Debit, Credit, Running Balance|
|5|IRS Form Tracker|Steps 12-15|Form type, principal, account, status, dates, filing method, tracking#|
|6|Filing Deadlines|Step 14.3|Form type, tax year, due dates (recipient + IRS), status|
|7|Contact Registry|—|Office/Role, Name, Dept, Address, Phone, URL, Notes|
|8|Subscription Register|Step 7 ext.|Service, Category, Tier, Price, Taxes, Cycle, Paid-to-Date, Renewal|

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
|**Share TMAR sheet**|⏳ **PENDING**|Must share with service account email as Editor|

---

## 📋 Claude Code Prompt Execution Status

|Prompt|Module|Status|Notes|
|---|---|---|---|
|**0 — Init**|Project structure, config, dependencies|⏳ Not started|Creates ~/Projects/tmar-engine/|
|**1 — Scanner**|src/scanner/ — FileCabinet cataloger|⏳ Not started|30+ classification rules|
|**2 — Extractor**|src/extractor/ — PDF/CSV data extraction|⏳ Not started|BOA, Fidelity, CashApp, PayPal, IRS, W-2|
|**3 — Sheets**|src/sheets/ — Google Sheets API sync|⏳ Not started|8-tab schema, batch updates|
|**4 — Ledger**|src/ledger/ — Double-entry reconciliation|⏳ Not started|Per-account debit/credit/balance|
|**5 — Compliance**|src/compliance/ — IRS form tracking & gaps|⏳ Not started|FWM 15-step coverage|
|**6 — Pipeline**|scripts/full_pipeline.py — CLI orchestrator|⏳ Not started|scan→extract→ledger→sync|
|**7 — CLAUDE.md**|Project memory for future sessions|⏳ Not started|Architecture, rules, compliance|

**Execution order:** 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 **Blocker:** Share TMAR sheet with service account (Prompt 3 depends on this)

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

- [ ] **Share TMAR sheet** with cupsup-bet@expense-tracker-459709.iam.gserviceaccount.com (Editor)
- [ ] Execute Prompt 0 in Claude Code (project init)
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
|TMAR Living GSheet — Claude Code Project Prompts.md|8 prompts|✅ Ready for execution|
|**TMAR-Implementation-Status.md**|**THIS FILE**|🔄 Active|

---

_Generated: 2026-02-26 | Framework: Freeway Mechanics Workbook Part 1_ _Pipeline: scanner → extractor → ledger → compliance → sheets sync_

# LDG Vault Skills Suite — Index

## Skills Registry

| # | Skill | Priority | Status | Triggers |
|---|-------|----------|--------|----------|
| 1 | [[vault-health-maintenance]] | 🔴 critical | production | vault health, cleanup, orphans, duplicates, security, plugin audit |
| 2 | [[legal-doc-gen-pipeline]] | 🟠 high | production | create trust, draft affidavit, legal template, master binder, filing |
| 3 | [[course-content-knowledge-mgmt]] | 🟠 high | production | YTubiversity, transcript, video lesson, course capture, FWM |
| 4 | [[financial-doc-processing]] | 🟠 high | production | Master Account Register, gap report, 1099, W-2, tax forms |
| 5 | [[vault-navigation-search]] | 🟡 medium | production | find in vault, search, connection hub, dataview query |
| 6 | [[template-system-management]] | 🟡 medium | production | create template, Templater, folder mapping, QuickAdd |

## Dynamic Registry

Use the Templater user script to auto-generate this table from frontmatter:

```
<% tp.user.skillIndex(tp) %>
```

## Installation

### For Claude.ai Projects
Upload each skill `.md` file to your project knowledge base.

### For Claude Desktop
Reference skills from custom instructions or copy content inline.

### For Obsidian AIHub
Skills live here in the vault and are referenced by Copilot and other AI plugins via the indexed content.

## Adding New Skills

1. Create a new note in this folder (template auto-applies)
2. Fill in the Templater prompts (name, title, category, priority, platform)
3. Write the `description` field first — this is the primary trigger mechanism
4. Build out the skill body with workflows, queries, and integration points
5. Update status from `draft` to `production` when ready

```meta-bind-button
label: "⬅️ TMAR Directory"
icon: ""
hidden: true
class: ""
tooltip: ""
id: "claudeskills"
style: default
actions:
  - type: open
    link: "[[TMAR]]"

```
