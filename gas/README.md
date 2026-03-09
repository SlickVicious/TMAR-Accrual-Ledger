# TMAR GAS Project — Cash Flow Modules

Google Apps Script modules for the Trust Master Account Register (TMAR) Google Sheet.

## Modules (deployed to Apps Script editor)

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

## GSheet Target

https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ

## Integration Note

Cash flow menu calls are appended to the existing `onOpen()` in Code.gs (lines 604-605):
```javascript
if (typeof addCOHISTMenu === 'function') addCOHISTMenu();
if (typeof addBOAMenu === 'function') addBOAMenu();
if (typeof addPNCMenu === 'function') addPNCMenu();
if (typeof addFidelityMenu === 'function') addFidelityMenu();
```

Generated: 2026-03-08
