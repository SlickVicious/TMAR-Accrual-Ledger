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

All IDs are centralized in **`TMAR_CONFIG`** (top of `SyncCenter.gs`). Target architecture: **2 books** — "TMAR Live" (read/write) + "Archive" (read-only).

| `TMAR_CONFIG` key | Spreadsheet | Purpose |
|---|---|---|
| `liveBookId` | `1k6J2…WInQ` | TMAR — Web App context / sync + push target (→ **Live**) |
| `sourceBookId` | = `liveBookId` | Old Wimberly source (`1CYg4fwQ…`) **deleted 2026-06-27** → folded into Live; pulls now read the Live book (where form imports write) |
| `appcHubId` | `1Ac5A…ATtc` | APPC_RLT unified hub (→ fold into **Live**) |
| `archiveBookId` | `1kbulI…Rjk8` | Freeway 2025 — legacy, read-only **Archive** (never write) |

## Web App (SyncCenter)

**Exec URL:** `https://script.google.com/macros/s/AKfycbzpeegvE52lvqCTMyKrsdaa_4JFfjM6MQrsJkU8zb17fkUJzPRasUU0fjONdaHkM5dh/exec`

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
| `pullWorkbookSheets` | GET | Returns headers + rows for tabs selected **by name** (GID-drift-proof). Priority: `?tabs=Name1,Name2` → `WORKBOOK_TARGET_TABS_` → the `FORM_PULL_CONFIG_` data tabs |

> **`listWorkbookTabs` and `pullWorkbookSheets`** were added 2026-04-07 to support the Digital File Cabinet's Sheets Data tab in `TMAR-Accrual-Ledger.html`.

### Workbook Integration Constants (SyncCenter.gs)

```javascript
// Single source of truth — all IDs + exec URL (top of SyncCenter.gs):
var TMAR_CONFIG = { liveBookId, sourceBookId, appcHubId, archiveBookId, execUrl };
// Existing vars are now aliases — never hardcode an ID:
var WORKBOOK_ID_ = TMAR_CONFIG.sourceBookId;
var WORKBOOK_TARGET_TABS_ = [];  // pull by tab NAME; empty → FORM_PULL_CONFIG_ data tabs. Override per-request with ?tabs=
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
