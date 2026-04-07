# Function: dfcSyncSheets()

**Status:** ✅ Implemented  
**Priority:** High  
**Category:** Digital File Cabinet  
**Call Sites:** 2 (dfcTab auto-trigger + Sync button)

---

## Purpose

Pull live Google Sheets workbook data via the GAS `pullWorkbookSheets` action and render it as scrollable tables in the Sheets Data tab of the Digital File Cabinet.

## Signature

```javascript
async function dfcSyncSheets()
```

## Implementation Location

File: `TMAR-Accrual-Ledger.html`  
Section: Digital File Cabinet JS block (before `// ── CALENDAR`)

## Behavior

1. Calls `getSyncBridge().pullWorkbookSheets()` (GAS web app)
2. Caches result in `_dfcSheetsCache` with timestamp `_dfcSheetsCacheTime`
3. Cache TTL: 5 minutes — skips re-fetch if cache is fresh
4. Calls `dfcRenderSheets()` to render tables
5. Shows loading/error state in `#dfc-panel-sheets` during fetch

## Workbook Sheets Pulled

| GID | Expected Tab |
|-----|-------------|
| 779167554 | Accounting / Financials |
| 1677909637 | Documents / Registry |
| 1870452300 | Trust / Estate |

Workbook ID: `1CYg4fwQoLARD9y3bQbn8W8HO5jI89osj`

## Dependencies

- `getSyncBridge()` — requires `appData.settings.gasWebAppUrl` to be set
- GAS `SyncCenter.gs` action `pullWorkbookSheets`
- DOM: `#dfc-panel-sheets`

## Error Handling

- Displays inline error message in sheets panel on GAS failure
- Falls back gracefully if `getSyncBridge()` is unavailable

## Change Log

- **2026-04-07**: v1.0 — initial implementation

---

*For implementation code, see `TMAR-Accrual-Ledger.html` DFC JS block.*
