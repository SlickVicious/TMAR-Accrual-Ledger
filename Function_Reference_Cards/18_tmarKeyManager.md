# Module: TmarKeyManager (tmar-key-manager.js)

**Status:** ✅ Implemented  
**Priority:** High  
**Category:** API Key Management  
**Type:** External standalone module (IIFE)

---

## Purpose

Floating 🔐 API key manager panel. Provides a single UI for managing all provider keys stored in `eeon_key_*` / `stg_key_*` localStorage slots, independent of the vault and settings pages.

## Loaded Via

```html
<!-- Added before </body> in TMAR-Accrual-Ledger.html -->
<script src="tmar-key-manager.js"></script>
```

## Signature / Entry Point

Self-executing IIFE — no function call needed. Initialises on `DOMContentLoaded`.

## Providers Managed (10)

| Slot ID | localStorage Key | Required |
|---------|-----------------|---------|
| claude | `eeon_key_claude` | ✅ Yes |
| openai | `eeon_key_openai` | — |
| deepseek | `eeon_key_deepseek` | — |
| gemini | `stg_key_gemini` | — |
| perplexity | `stg_key_perplexity` | — |
| openrouter | `eeon_key_openrouter` | — |
| xai | `stg_key_xai` | — |
| huggingface | `stg_key_hf` | — |
| github | `stg_key_github` | — |
| datagov | `stg_key_datagov` | — |

## Key Functions (internal to module)

| Function | Purpose |
|----------|---------|
| `buildPanel()` | Creates floating button + slide-out panel DOM |
| `renderRows()` | Populates provider rows from current localStorage |
| `tkmSave(id)` | Saves key, syncs aliases, calls `backupKeysToIDB()` |
| `tkmToggleVis(id)` | Toggles password ↔ text input visibility |
| `tkmTest(id)` | Runs live API test for one provider |
| `testAll()` | Sequentially tests all filled keys (400ms delay) |
| `importEnv()` | Parses `.env` text → maps via `ENV_MAP` → saves |
| `checkRequired()` | Adds/removes red-pulse on 🔐 button |

## Special Behaviors

- **Claude alias sync**: saving `claude` key also writes `_trustApiKey`, `TMAR_trustApiKey`, `tmar_claude_key`, `stg_key_claude`
- **CORS proxy**: Anthropic test uses `eeon_cors_proxy` URL if set, falls back to direct call
- **Red pulse**: `@keyframes tkmPulse` on `#tkm-btn` when `eeon_key_claude` is empty; re-checks on `storage` events
- **IDB backup**: calls `window.backupKeysToIDB()` after every save if the function is available

## Implementation Location

File: `tmar-key-manager.js` (project root)  
~490 lines

## Dependencies

- `localStorage` API
- `fetch` API (for key tests)
- `window.backupKeysToIDB` (optional — provided by GCMemory engine in HTML)
- `eeon_cors_proxy` localStorage key (optional — for Anthropic CORS-proxied test)

## Error Handling

- CORS 0-status errors caught and surfaced as key-format description instead of test failure
- All test functions wrapped in try/catch with inline status display
- `.env` import skips unrecognised variable names silently

## Change Log

- **2026-04-07**: v1.0 — initial implementation

---

*Module lives in `tmar-key-manager.js`; loaded as external script.*
