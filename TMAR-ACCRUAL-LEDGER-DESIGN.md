# TMAR-Aligned Universal Accrual Ledger — Design Document

**Status**: ✅ IMPLEMENTED — 2026-03-01
**Output File**: `TMAR-Accrual-Ledger.html` (9,180 lines, 616KB)

**Version**: 2.0 (expanded from elegant-drifting-goblet plan)
**Date**: 2026-03-01
**Approach**: Fork & Refactor from `redressright.me/GAAP.html`
**Reference**: `GAAP-SOURCE-ASSOCIATION-CHART.md` (full GUI mapping)

---

## Approved Decisions

| Decision | Choice | Session Date |
|---|---|---|
| Module scope | All 31 tabs (32 minus UK Accounting) | 2026-02-28 |
| Customization depth | Deep adaptation (pre-populate TMAR data, rename modules, restyle) | 2026-02-28 |
| Modules removed | UK Accounting only | 2026-02-28 |
| Google Sheets sync | Fully independent (localStorage only) | 2026-02-28 |
| Implementation approach | Plan A: Fork & Refactor | 2026-02-28 |
| Visual identity | Strip RedressRight branding, TMAR palette, Calibri font | 2026-02-28 |
| Tab restructuring | 8 logical groups, 30 tabs, SPV→Trust Estate, GAAP Agent→Trust Accounting Agent | 2026-02-28 |

---

## 1. Source File

- **Origin**: `https://redressright.me/GAAP.html` (643KB, 9,401 lines)
- **Local copy**: `06 Toolkit/Dev/SS Master Acct Reg/TMAR/GAAP-source.html`
- **Output**: `06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html`

---

## 2. Visual Identity Changes

### 2.1 Strip RedressRight Branding
- Remove entire RedressRight header/nav bar (lines ~189-275)
- Replace with TMAR header: "TMAR Universal Accrual Ledger" + trust name subtitle
- Remove RedressRight logo, external links, footer credits

### 2.2 Color Palette (CSS Variables)

```css
:root {
  /* TMAR Dark Mode (default) */
  --bg-primary: #0D1B2A;       /* was #0f172a */
  --bg-secondary: #1B2A4A;     /* was #1e293b */
  --bg-tertiary: #243B5E;      /* was #334155 */
  --text-primary: #E2E8F0;     /* keep */
  --text-secondary: #94A3B8;   /* keep */
  --accent-green: #10b981;     /* keep — matches TMAR */
  --accent-red: #ef4444;       /* keep — matches TMAR */
  --accent-amber: #f59e0b;     /* keep — matches TMAR */
  --accent-blue: #4A7FBF;      /* was #3b82f6 — lighter TMAR blue */
  --border-color: rgba(74,127,191,0.2);  /* blue-tinted borders */
}

:root:not(.dark) {
  /* TMAR Light Mode */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --bg-tertiary: #D6E4F0;      /* TMAR light blue */
  --text-primary: #1B2A4A;     /* TMAR dark blue */
  --text-secondary: #4A5568;
  --accent-blue: #1B2A4A;
}
```

### 2.3 Font Swap
```css
/* Remove Google Fonts import for JetBrains Mono + Space Grotesk */
/* Replace with: */
body { font-family: Calibri, 'Segoe UI', system-ui, sans-serif; }
.font-mono, [class*="mono"] { font-family: 'SF Mono', 'Cascadia Code', monospace; font-variant-numeric: tabular-nums; }
```

---

## 3. Tab Restructuring (31 tabs → 8 groups)

### Group 1: Core Accounting
| Tab | Original Name | TMAR Name | data-tab |
|---|---|---|---|
| 1 | Ledger | Ledger | `ledger` |
| 2 | Entities | Entities | `entities` |
| 3 | Chart of Accounts | Chart of Accounts | `coa` |
| 4 | Journal | Journal | `journal` |

### Group 2: Receivables & Payables
| Tab | Original Name | TMAR Name | data-tab |
|---|---|---|---|
| 5 | A/R | A/R | `receivables` |
| 6 | A/P | A/P | `payables` |

### Group 3: Consolidation & Statements
| Tab | Original Name | TMAR Name | data-tab |
|---|---|---|---|
| 7 | Consolidation | Consolidation | `consolidation` |
| 8 | Statements | Statements | `statements` |

### Group 4: Tax & Compliance
| Tab | Original Name | TMAR Name | data-tab |
|---|---|---|---|
| 9 | Tax Filings | Tax Filings | `filings` |
| 10 | Tax Estimator | Tax Estimator | `taxEstimator` |
| 11 | Schedule A Detail | Schedule A Detail | `scheduleA` |

### Group 5: Trust Estate (renamed from SPV)
| Tab | Original Name | TMAR Name | data-tab |
|---|---|---|---|
| 12 | SPV Dashboard | Trust Estate Dashboard | `trustDashboard` (was `spvDashboard`) |
| 13 | SPV Ledger | Trust Estate Ledger | `trustLedger` (was `spvLedger`) |
| 14 | SPV Reports | Trust Estate Reports | `trustReports` (was `spvReports`) |

### Group 6: Operations
| Tab | Original Name | TMAR Name | data-tab |
|---|---|---|---|
| 15 | Invoicing | Invoicing | `invoicing` |
| 16 | Payroll | Payroll | `payroll` |
| 17 | Inventory | Inventory | `inventory` |
| 18 | Budget & Forecast | Budget & Forecast | `budgetForecast` |
| 19 | Payment Orders | Payment Orders | `paymentOrders` |
| 20 | Bills of Exchange | Bills of Exchange | `billsOfExchange` |
| 21 | Expense Itemization | Expense Itemization | `expenses` |
| 22 | Customers & Vendors | Customers & Vendors | `customers` |
| 23 | Asset Depreciation | Asset Depreciation | `depreciation` |
| 24 | Bank Reconciliation | Bank Reconciliation | `bankRecon` |

### Group 7: Reports & Intelligence
| Tab | Original Name | TMAR Name | data-tab |
|---|---|---|---|
| 25 | Reports | Reports | `reports` |
| 26 | MASTER REPORT | MASTER REPORT | `masterReport` |
| 27 | GAAP Agent | Trust Accounting Agent | `trustAgent` (was `gaapAgent`) |
| 28 | Voice & Chat | Voice & Chat | `voiceChat` |

### Group 8: Tools
| Tab | Original Name | TMAR Name | data-tab |
|---|---|---|---|
| 29 | Financial Assets | Financial Assets | `financialAssets` |
| 30 | Document Creator | Document Creator | `docCreator` |
| 31 | Source Folders | Source Folders | `sourceFolders` |

### Removed
- ~~UK Accounting~~ (`ukAccounting`) — removed entirely

---

## 4. Data Pre-Population

### 4.1 Default Entity
```javascript
{
  id: 'trust_primary',
  name: 'A Provident Private Creditor Revocable Living Trust',
  type: 'Trust',
  ein: '41-6809588',
  trustee: 'Clinton Wimberly IV',
  cafNumber: '0317-17351',
  fiscalYearEnd: '12/31',
  status: 'Active',
  primaryUser: 'Trust'
}
```

### 4.2 Ledger Category Dropdown (33 TMAR Account Types)
Checking, Savings, Credit Card, Mortgage, Auto Loan, Student Loan, Personal Loan, Gym Membership, Investment, Retirement, Brokerage, HSA, FSA, Life Insurance, Auto Insurance, Health Insurance, Dental Insurance, Vision Insurance, Homeowners Insurance, Renters Insurance, Utility, Subscription, Streaming, Phone, Internet, Medical, Dental, Tax Account, Trust Account, Business Account, Government Account, Collections, Other

### 4.3 Entity Status Options (9 TMAR Statuses)
Active, Closed, Pending, Suspended, In Review, Dormant, Under Dispute, Transferred, Archived

### 4.4 Primary User Options
Clint, Syrina, Joint, Trust

### 4.5 Chart of Accounts
Keep the full 68-account GAAP-standard defaultCOA[] as-is (already has trust-specific accounts: 3600 Trust Corpus, 8500 Fiduciary Fees, 8600 Distribution to Beneficiaries, 8700 Attorney & Accountant Fees)

### 4.6 Tax Brackets
Keep 2024 brackets as-is. All 7 tax form calculators retained (1120, 990, 1041, 1041-ES, 1040, 1040-ES, Schedule C).

---

## 5. Module Adaptations

### 5.1 Trust Accounting Agent (was GAAP Agent)
- Rename all references: "GAAP Agent" → "Trust Accounting Agent"
- Update `GAAP_AGENT_SYSTEM_PROMPT` to include trust context:
  - Trust name, EIN, Trustee
  - FWM trust admin framework reference
  - 7-Part, 11 Binder Tabs structure
- Keep Anthropic API integration (`fetch` to `/v1/messages`)
- Rename localStorage key considerations

### 5.2 Trust Estate (was SPV)
- All `spv` prefixed functions → `trust` prefix
- SPV type labels (TCU, digital-token, etc.) → Trust-relevant types (Corpus Distribution, Beneficiary Payment, Trustee Fee, Asset Transfer, Tax Payment)
- Currency options: keep USD, remove crypto options
- localStorage key: `RR_BOE` etc. → `TMAR_BOE` etc.

### 5.3 Financial Assets Tab
- Keep all panels (Authority, Arbitration, Securities, Tax Payment, NOL, Allocation Calculator, Rebuttals, Forms, Validation)
- No changes needed — content is directly relevant to trust admin context

### 5.4 Bills of Exchange / Payment Orders
- Keep as-is — directly relevant to FWM trust admin framework

### 5.5 Document Creator
- Keep as-is — PDF generation for trust documents

---

## 6. localStorage Key Renaming

| Original Key | TMAR Key |
|---|---|
| `GAAP_UniversalLedger_Data` | `TMAR_AccrualLedger_Data` |
| `darkMode` | `darkMode` (keep) |
| `RR_BOE` | `TMAR_BOE` |
| `RR_Expenses` | `TMAR_Expenses` |
| `RR_Customers` | `TMAR_Customers` |
| `RR_Vendors` | `TMAR_Vendors` |
| `RR_Assets` | `TMAR_Assets` |
| `RR_Reconciliations` | `TMAR_Reconciliations` |
| `vcHistory` | `TMAR_vcHistory` |
| `vcStats` | `TMAR_vcStats` |

---

## 7. CDN Dependencies (unchanged)

| Library | Version | Purpose |
|---|---|---|
| Tailwind CSS | 2.2.19 | Utility classes |
| jsPDF | 2.5.1 | PDF generation |
| jsPDF-AutoTable | 3.5.31 | PDF tables |
| FileSaver.js | 2.0.5 | File downloads |

**Removed**: Google Fonts imports (JetBrains Mono, Space Grotesk) — using system Calibri instead.

---

## 8. Technical Architecture

### File Structure
Single self-contained HTML file: `TMAR-Accrual-Ledger.html`

```
<html class="dark">
<head>
  <style>
    /* ~500 lines: CSS vars (TMAR palette), dark/light mode, glass morphism,
       tab nav (8 groups), forms, tables, badges, animations, responsive, print */
  </style>
  <link href="Tailwind CDN">
  <script src="jsPDF CDN">
  <script src="autoTable CDN">
  <script src="FileSaver CDN">
</head>
<body>
  <!-- TMAR Header: title + trust subtitle + toolbar (toggle, save, export, import, clear) -->
  <!-- Tab Navigation: 31 buttons in 8 groups with dividers -->
  <!-- 31 Tab Sections (each with class="form-section") -->
  <!-- Modal Container -->
  <!-- Auto-save Status Toast -->

  <script>
    /* ~6000+ lines:
       - Theme system (dark/light with TMAR palette)
       - Data model & localStorage persistence (TMAR_AccrualLedger_Data)
       - Auto-save (5s interval + beforeunload)
       - switchMainTab() with 31 tab initializers
       - Ledger CRUD
       - Entity management (pre-populated trust)
       - COA (68 GAAP accounts)
       - Double-entry Journal
       - A/R and A/P aging
       - Consolidation worksheet
       - Financial statements (TB, IS, BS)
       - 7 Tax form calculators
       - Trust Estate (Dashboard, Ledger, Reports)
       - Invoicing, Payroll, Inventory, Budget
       - Payment Orders, Bills of Exchange
       - Expenses, Customers/Vendors
       - Schedule A, Asset Depreciation, Bank Recon
       - MASTER REPORT
       - Trust Accounting Agent (Anthropic API)
       - Voice & Chat (Web Speech API + Anthropic)
       - Financial Assets (9 panels)
       - Document Creator
       - Source Folders
       - Export system (PDF, Word, CSV, JSON)
       - Import system (JSON)
       - Modal/Alert/Confirm system
    */
  </script>
</body>
</html>
```

### Data Model
```javascript
const STORAGE_KEY = 'TMAR_AccrualLedger_Data';

const defaultAppData = {
  ledgerEntries: [],
  filings: { '1120': [], '990': [], '1041': [], '1041-ES': [], '1040': [], '1040-ES': [], 'SchC': [] },
  entities: [/* pre-populated trust entity */],
  chartOfAccounts: [/* 68 GAAP accounts */],
  journalEntries: [],
  receivables: [],
  payables: [],
  eliminations: [],
  settings: {
    trustName: "A Provident Private Creditor Revocable Living Trust",
    trustEIN: "41-6809588",
    trusteeName: "Clinton Wimberly IV",
    cafNumber: "0317-17351",
    activeYear: "2025"
  },
  lastSaved: null
};
```

---

## 9. Implementation Strategy

**Approach**: Fork & Refactor
1. Copy `GAAP-source.html` → `TMAR-Accrual-Ledger.html`
2. Strip RedressRight branding (header nav, footer, links)
3. Swap CSS palette (6 variable changes + font swap)
4. Remove UK Accounting tab (button + section + any JS)
5. Rename SPV → Trust Estate (HTML labels, JS function names, data-tab attrs)
6. Rename GAAP Agent → Trust Accounting Agent
7. Update localStorage keys (GAAP_ → TMAR_, RR_ → TMAR_)
8. Pre-populate default entity with trust data
9. Add TMAR-specific dropdowns (33 account types, 9 statuses, 4 users)
10. Update Trust Accounting Agent system prompt
11. Reorganize tab order into 8 logical groups
12. Add TMAR header with trust name subtitle
13. Final polish: verify all 31 tabs, test exports, check console for errors

---

## 10. Verification Checklist

1. Open `TMAR-Accrual-Ledger.html` in browser
2. Dark mode loads by default with TMAR navy/blue palette
3. No RedressRight branding visible anywhere
4. Header shows "TMAR Universal Accrual Ledger" + trust name
5. All 31 tabs render without errors (no UK Accounting tab)
6. Trust Estate tabs show correct labels (not "SPV")
7. Trust Accounting Agent label (not "GAAP Agent")
8. Entities tab has pre-populated trust entity (EIN, Trustee, CAF)
9. Ledger category dropdown shows 33 TMAR account types
10. All tax calculators produce correct results
11. Journal double-entry balance verification works
12. Financial statements generate from journal data
13. Export JSON → close → reopen → Import JSON = data intact
14. Light mode toggle works with TMAR light palette
15. Print preview = clean black/white output
16. Browser console shows zero errors
17. localStorage keys all use TMAR_ prefix (no GAAP_ or RR_)
18. All 4 CDN libraries load successfully
19. Auto-save toast appears every 5 seconds
20. Master Report pulls from all modules
