# Function: mem0ClearAll()

**Status:** ✅ Implemented (v2 — IndexedDB)
**Priority:** High
**Category:** Memory & Storage
**Call Sites:** 1 (Settings → GCMemory block)

---

## Purpose
Clear all persistent agent memories stored in the browser's IndexedDB via the `MEM0`/`GCMemory` engine.

## Signature
```javascript
async function mem0ClearAll()
```

## Implementation Location
File: `TMAR-Accrual-Ledger.html`
Section: GCMemory / MEM0 Engine block
Approximate lines: ~33865

## How It Works

```javascript
async function mem0ClearAll() {
  if (!confirm('Delete ALL agent memories stored in this browser? This cannot be undone.')) return;
  var ok = await MEM0.clearAll();
  alert(ok ? '✅ All memories cleared from this browser.' : '❌ Clear failed — check browser console.');
}
```

Calls `MEM0.clearAll()` → `GCMemory.clearAll()` which runs:
```javascript
async function clearAll() {
  var db = await openDB();
  var tx = db.transaction('exchanges', 'readwrite');
  tx.objectStore('exchanges').clear();
  return true;
}
```

## Dependencies
- `MEM0` proxy object (GAAP_MEM0)
- `GCMemory` IndexedDB engine (`GCMemory_v1` / `exchanges` store)
- User confirmation dialog

## Storage Backend
**IndexedDB** — `GCMemory_v1` database, `exchanges` object store.
> **v1 used localStorage** (`localStorage.removeItem('gcMemory')`).
> **v2 (2026-03-14) upgraded to IndexedDB** for full persistent memory with keyword search, scoring, and auto-pruning.

## Related Engines
| Object | Role |
|---|---|
| `GCMemory` | IIFE — full IndexedDB engine (add, addPdf, search, clearAll, count, isWorthy) |
| `MEM0` | Thin proxy to GCMemory; always enabled, no API key gate |
| `OpenClawRuntime` | Uses GCMemory to log security violations under `'security'` agent |

## Change Log
- **2026-03-09**: Initial implementation v1 — localStorage wrapper calling `clearMemory()`
- **2026-03-14**: **v2 upgrade** — full IndexedDB engine (`GCMemory`), MEM0 proxy, proper async `clearAll()`

---

*See also: `GCMemory` engine (IndexedDB) and `MEM0` proxy object in `TMAR-Accrual-Ledger.html`*
