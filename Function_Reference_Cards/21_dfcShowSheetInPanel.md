# Function: dfcShowSheetInPanel()

**Status:** ✅ Implemented  
**Priority:** Medium  
**Category:** Digital File Cabinet  
**Call Sites:** 2 (Accounting toolbar, Trust toolbar)

---

## Purpose

Deep-link from another EON page directly into the Digital File Cabinet's Sheets Data tab. Used by the 📊 Sheets Data buttons in the Accounting and Trust toolbars.

## Signature

```javascript
function dfcShowSheetInPanel(context)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `context` | string | `'accounting'` \| `'trust'` — reserved for future filtering |

## Implementation Location

File: `TMAR-Accrual-Ledger.html`  
Section: Digital File Cabinet JS block (before `// ── CALENDAR`)

## Behavior

1. Calls `goEonPage(null, 'page-docs')` to navigate to the Docs page
2. Calls `dfcTab('sheets')` to activate the Sheets Data tab
3. Auto-syncs if cache is empty (delegated to `dfcTab`)

## Usage

```html
<!-- Accounting toolbar -->
<button onclick="dfcShowSheetInPanel('accounting')">📊 Sheets Data</button>

<!-- Trust toolbar -->
<button onclick="dfcShowSheetInPanel('trust')">📊 Trust Ledger</button>
```

## Dependencies

- `goEonPage()` — EON navigation
- `dfcTab()` — tab switcher

## Change Log

- **2026-04-07**: v1.0 — initial implementation

---

*For implementation code, see `TMAR-Accrual-Ledger.html` DFC JS block.*
