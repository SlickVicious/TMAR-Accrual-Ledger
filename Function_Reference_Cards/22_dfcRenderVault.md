# Function: dfcRenderVault()

**Status:** ✅ Implemented  
**Priority:** Medium  
**Category:** Digital File Cabinet  
**Call Sites:** 2 (goEonPage monkey-patch on first page-docs open, dfcVaultSearch)

---

## Purpose

Render the expandable Obsidian vault directory tree from the static `VAULT_INDEX` object into the Vault Browser tab of the Digital File Cabinet.

## Signature

```javascript
function dfcRenderVault(q)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Optional search query — filters displayed files/folders |

## Implementation Location

File: `TMAR-Accrual-Ledger.html`  
Section: Digital File Cabinet JS block (before `// ── CALENDAR`)

## Behavior

1. Iterates `VAULT_INDEX` categories
2. Filters entries against `q` if provided (case-insensitive match on name)
3. Renders category `<details>/<summary>` accordions with file links
4. Empty categories are hidden when a search query is active

## VAULT_INDEX Source

Static JS object derived from:  
`C:\Users\rhyme\Documents\Legal Document Generator\Digital File Cabinet\`

**5 categories:**

| Category | Description |
|----------|-------------|
| Master Binder System | Account inventory, binder tabs, integration index |
| Generated Documents | Legal filings, correspondence, affidavits |
| Financials | Tax documents, statements, worksheets |
| Legal Reference Library | Case law, statutes, templates |
| Gov Forms | IRS, court, and agency forms |

## Companion Function

`dfcVaultSearch(q)` — called by the search input's `oninput`; simply calls `dfcRenderVault(q)`.

## Dependencies

- `VAULT_INDEX` constant (defined in same JS block)
- DOM: `#dfc-vault-tree` container inside `#dfc-panel-vault`

## Change Log

- **2026-04-07**: v1.0 — initial implementation

---

*For implementation code, see `TMAR-Accrual-Ledger.html` DFC JS block.*
