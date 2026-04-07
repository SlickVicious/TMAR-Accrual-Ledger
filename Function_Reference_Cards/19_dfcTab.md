# Function: dfcTab()

**Status:** ✅ Implemented  
**Priority:** Medium  
**Category:** Digital File Cabinet  
**Call Sites:** 3 (tab buttons inside `page-docs`)

---

## Purpose

Switch between the three tabs in the Digital File Cabinet (`page-docs`): Vault Browser, Sheets Data, Local Docs.

## Signature

```javascript
function dfcTab(name)
```

## Parameters

| Parameter | Type | Values |
|-----------|------|--------|
| `name` | string | `'vault'` \| `'sheets'` \| `'local'` |

## Implementation Location

File: `TMAR-Accrual-Ledger.html`  
Section: Digital File Cabinet JS block (before `// ── CALENDAR`)

## Behavior

1. Hides all `.dfc-panel` divs
2. Removes `active` class from all `.dfc-tab` buttons
3. Shows `#dfc-panel-{name}` and marks its tab button active
4. If switching to `'sheets'` and cache is empty, auto-calls `dfcSyncSheets()`

## Dependencies

- DOM: `#dfc-panel-vault`, `#dfc-panel-sheets`, `#dfc-panel-local`
- DOM: `.dfc-tab` buttons in `page-docs`
- `dfcSyncSheets()` (called on first sheets tab open)

## Change Log

- **2026-04-07**: v1.0 — initial implementation

---

*For implementation code, see `TMAR-Accrual-Ledger.html` DFC JS block.*
