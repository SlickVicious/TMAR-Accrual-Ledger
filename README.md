# TMAR Project — Trust Master Account Register
## Location: `Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR/`

**Google Sheet:** https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ/

**Last Updated:** 2026-02-26

---

## Project Structure

```
TMAR/
├── README.md                          ← This file
├── gas/                               ← Google Apps Script files
│   ├── TMAR_CreditReport_Import.js    ← Syrina credit report → MR + Acct Ledger
│   └── apply_master_register_formatting.gs  ← Tab colors, dropdowns, conditional fmt
├── data/                              ← Source data files
│   ├── Wimberly_Financial_Workbook_2025.xlsx
│   ├── Syrina_Credit_Report_Sheets.xlsx
│   └── Wimberly_Master_Register_2025.xlsx  (generated)
└── docs/                              ← Documentation & context
    └── TMAR_Context.md
```

## What Is TMAR?

The **Trust Master Account Register** is a Google Sheets workbook that serves as the central ledger for the Wimberly household's financial administration under the **A Provident Private Creditor Revocable Living Trust** (EIN: 41-6809588).

### Tab Structure (Unified 35-col schema)

**Group A — Living Dashboard (7 tabs):**
- Executive Dashboard
- Transaction Ledger
- W-2 & Income Detail
- BOA Cash Flow
- Household Obligations
- Subscriptions & Services
- Tax Strategy

**Group B — Estate Ledger (7 tabs):**
- Acct Ledger (EIN cross-reference — same data as Master Register, different headers)
- Master Register (35 columns, primary account tracker)
- Trust Ledger
- 1099 Filing Chain
- Forms & Authority
- Proof of Mailing
- Document Inventory

**Hidden:** `_Validation` (dropdown lists), `_Settings`, `_YearData`

### Master Register 35-Column Schema

| Col | Field | Col | Field |
|-----|-------|-----|-------|
| A | Row ID (MR-XXX) | S | Next Payment Due |
| B | Date Added | T | Primary User |
| C | Provider/Creditor | U | Secondary User |
| D | Mailing Address | V | Account Purpose |
| E | Provider EIN | W | Document Location |
| F | Account Number | X | Last Verified |
| G | Account Type | Y | Linked MR Account |
| H | Account Subtype | Z | Trust Assignment |
| I | Account Agent | AA | Tax Relevance |
| J | Agent Address | AB | Tax Form |
| K | Status | AC | Deduction Type |
| L | Opened Date | AD | Credit Report Status |
| M | Closed Date | AE | Removal Date |
| N | Current Balance | AF | Dispute Status |
| O | High Balance | AG | Notes |
| P | Monthly Payment | AH | Source |
| Q | APR/Rate | AI | Discovery Status |
| R | Billing Frequency | | |

## Key Insight: Acct Ledger = Master Register

The **Acct Ledger** and **Master Register** tabs track the same accounts — Acct Ledger is an EIN-focused view with fewer columns, while Master Register is the full 35-column version. The import script populates both.

## Apps Script Functions

### `importSyrinaCreditReportAccounts()`
Adds 24 accounts from Syrina's TransUnion report to both sheets:
- 5 charge-offs (Capital One, Continental Finance, First Premier, Launch Servicing, Merrick Bank)
- 2 collections (LVNV × 2)
- 7 Nelnet student loans (individual)
- 1 OneMain Financial (active)
- 9 closed/paid accounts

### `linkMRIdsToAcctLedger()`
Cross-references MR-XXX IDs from Master Register into Acct Ledger after both are populated.

### `applyAllFormatting()`
Applies Google-native features: tab colors, data validation dropdowns, conditional formatting, filters, header protection.

## Data Sources

| Source | Content |
|--------|---------|
| `Wimberly_Financial_Workbook_2025.xlsx` | W-2s, BOA cash flow, transfers, income, 1095-C, subscriptions, tax strategy |
| `Syrina_Credit_Report_Sheets.xlsx` | TransUnion credit summary, debt strategy, student loans |
| TMAR Google Sheet | Live working register with all tabs |

## Deployment Workflow

1. Edit `.js` files in `gas/` directory
2. Open TMAR Google Sheet → Extensions → Apps Script
3. Paste updated script → Save → Run target function
4. *Or* use `clasp push` if clasp is configured (see `.clasp.json`)
