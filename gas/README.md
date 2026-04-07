# TMAR GAS Project

Google Apps Script modules for the Trust Master Account Register (TMAR) Google Sheet.

## Core Modules

| File | Lines | Purpose |
|------|-------|---------|
| `Code.gs` | ~3,100 | Main menu, formatting, year selector, gap scanner, CPA, import tools |
| `SyncCenter.gs` | ~1,100 | Web App bridge — `doGet`/`doPost` handlers, TMAR ↔ GSheet sync, workbook integration |
| `CreditReportImport.gs` | ~842 | Credit report import |
| `DuplicateAnalyzer.gs` | ~616 | Duplicate detection |
| `GUIFunctions.gs` | ~530 | GUI helpers |
| `PopulateValidation.gs` | ~411 | Validation data |
| `TMARBridge.gs` | ~341 | Dashboard, Add Account, Financial Summary |
| `ExecuteCleanup.gs` | ~311 | Cleanup functions |

## Cash Flow Modules

| File | Sheet Tab | Account | Data Source |
|------|-----------|---------|-------------|
| `CapitalOneCashFlow_CSV.gs` | CapOne Cash Flow | 360 Checking ...5198 (Syrina) | CSV export 2024-2026 |
| `CapOneCashFlow.gs` (COHIST) | CapOne Historical | 360 Checking ...5198 (Syrina) | PDF extraction 2021-2023 |
| `BOACashFlow.gs` | BOA Cash Flow | Checking ...6198 (Clinton) | PDF extraction 2021-2025 |
| `PNCCashFlow.gs` | PNC Cash Flow | Spend ...0672 (Syrina) | PDF extraction 2024-2026 |
| `FidelityCashFlow.gs` | Fidelity Portfolio | 5 accounts (Clinton) | CSV snapshot Dec 2025 |
| `TMAR_onOpen_reference.gs` | — | Reference only | Menu loader (merged into Code.gs) |

## Data Pipeline

`scripts/` — Python extraction + parsing tools (requires pymupdf)
`data/parsed_transactions/` — 8,372 parsed transactions (4 CSVs + summary)
`data/extracted/` — Manifests from PDF extraction (101 PDFs)

## GSheet Targets

| Spreadsheet | Purpose |
|-------------|---------|
| `1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ` | TMAR Master Register (primary — sync target) |
| `1CYg4fwQoLARD9y3bQbn8W8HO5jI89osj` | Wimberly Financial Workbook (read-only — DFC source) |

## Web App (SyncCenter)

**Exec URL:** `https://script.google.com/macros/s/AKfycbwdLljh2fsOv--_8Ik3PKVAnXRflpkSkmB8zi-JZeVwdvZaKbLNk843kgK9R3V2V_2C/exec`

### Supported Actions (`?action=`)

| Action | Method | Description |
|--------|--------|-------------|
| `getMasterRegister` | GET | Returns all Master Register rows |
| `getTransactionLedger` | GET | Returns all Transaction Ledger rows |
| `getHouseholdObligations` | GET | Returns Household Obligations |
| `pushEntities` | POST | Writes entities → Master Register |
| `pushTransactions` | POST | Writes transactions → Transaction Ledger |
| `pushPayables` | POST | Writes payables → Household Obligations |
| `push1099s` | POST | Writes filings → 1099 Filing Chain |
| `listWorkbookTabs` | GET | Lists all tabs (name + GID) from `WORKBOOK_ID_` |
| `pullWorkbookSheets` | GET | Returns headers + rows for `WORKBOOK_TARGET_GIDS_` (779167554, 1677909637, 1870452300) |

> **`listWorkbookTabs` and `pullWorkbookSheets`** were added 2026-04-07 to support the Digital File Cabinet's Sheets Data tab in `TMAR-Accrual-Ledger.html`.

### Workbook Integration Constants (SyncCenter.gs)

```javascript
var WORKBOOK_ID_ = '1CYg4fwQoLARD9y3bQbn8W8HO5jI89osj';
var WORKBOOK_TARGET_GIDS_ = [779167554, 1677909637, 1870452300];
```

## Integration Note

Cash flow menu calls are appended to the existing `onOpen()` in Code.gs:
```javascript
if (typeof addCOHISTMenu === 'function') addCOHISTMenu();
if (typeof addBOAMenu === 'function') addBOAMenu();
if (typeof addPNCMenu === 'function') addPNCMenu();
if (typeof addFidelityMenu === 'function') addFidelityMenu();
```

## Deployment

```bash
cd gas/
clasp push --force          # push all files to Apps Script project
# If SyncCenter.gs changed: Apps Script editor → Deploy → Manage → Redeploy
```

Script ID: `1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr`

Last updated: 2026-04-07
