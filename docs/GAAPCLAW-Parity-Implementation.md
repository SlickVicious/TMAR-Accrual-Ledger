# GAAPCLAW Parity Implementation — TMAR v3.0
**Date:** 2026-03-14
**Session:** Full parity audit + engine ports from redressright.me/Agent.html + TRCF.html

---

## Overview

Complete feature parity pass between TMAR-Accrual-Ledger.html and the original GAAPCLAW GUIs at:
- https://redressright.me/Agent.html (EON Agent Portal v7.2.1)
- https://redressright.me/TRCF.html

---

## Changes Made This Session

### 1. EON Sidebar — AUTONOMOUS Section Fix
**Problem:** Task Planner, API Integrations, Code Builder, API Scout were appended inside SYSTEM instead of having their own section.
**Fix:** Added `<div class="sidebar-title">AUTONOMOUS</div>` between SPECIALISTS and SYSTEM with the 4 buttons properly nested.

### 2. AP (Agent Portal) Pattern — All 7 Specialist Pages
Rebuilt all specialist/legal agent pages from simple card layouts to full AP pattern:
- Left 175px saved-conversations sidebar (`ap_sl_{page}`)
- 6-button action bar: Speak / Listen / Print / PDF / Word / Share
- New Conversation button
- Message area (`ap_msgs_{page}`) with empty-state placeholder
- Textarea with E2ZERO placeholder text + Send button
- Hidden `{page}Result` div preserved for `askAgentSafe` MutationObserver

**Pages updated:** legal, tax, arbitration, corporation, trust, accounting, research

### 3. AP JavaScript Object
Full localStorage-backed conversation persistence:
```javascript
const AP = { _convs, _stt, _sttPage, _load, _save, _renderSL, _renderMsgs,
             newConv, loadConv, send, speakLast, toggleSTT,
             printConv, exportPDF, exportWord, shareLink, init }
```
- `send()` uses MutationObserver on `{page}Result` to capture `askAgentSafe()` responses
- Sessions stored as `ap_conv_{page}` in localStorage
- Auto-inits all 7 pages on DOMContentLoaded

### 4. Dream Team Action Buttons
Added 6 inline action buttons (Speak/Listen/Print/PDF/Word/Share) to `page-dream_team` header.

### 5. API Scout v2 (22 Curated APIs)
Full replacement of the minimal 11-API version:

| API | Category | Auth |
|---|---|---|
| Congress.gov API | government | key |
| CourtListener / OpenClaw | legal | key |
| Case.law – Harvard | legal | key |
| Cornell LII | legal | none |
| GovInfo / FDsys | government | key |
| Regulations.gov | government | key |
| SEC EDGAR Full-Text | financial | none |
| SEC EDGAR REST | financial | none |
| FRED Federal Reserve | economic | key |
| Treasury Fiscal Data | financial | none |
| BLS Labor Statistics | economic | key |
| World Bank Open Data | economic | none |
| Open Corporates | business | key |
| CrossRef Academic | research | none |
| Semantic Scholar | research | key |
| Data.gov USA | government | key |
| Open Library | documents | none |
| Wikipedia REST | research | none |
| IRS SOI Public Data | tax | none |
| PACER via CourtListener | legal | key |
| USASpending.gov | government | none |
| Apify Research Engine | research | key |

New features:
- `scoutSearch` filter input with `mainScoutFilter()`
- Category dropdown (9 options) + auth filter
- `main-scout-count` + `main-scout-live-count` spans
- **⚡ Test All Live** — live `fetch()` to each test endpoint with AbortController + per-card status dots
- **⬇ Integrate All** — localStorage `ms_integrated` persistence
- Card-level **⚡ Test** and **+ Add** buttons

### 6. Settings & API Configuration — Full GAAPCLAW Expansion
- Added **Appearance** tab (Theme + Accent Color)
- LLM Config: replaced dropdown with **provider grid buttons** (`llm-prov-btn`) for 10 providers
- Added Claude model radio buttons, Ollama config panel with 14 models
- API Keys: GCMemory block, MiniMax + Ernie keys, colored status dots
- **OpenClaw Legal API** section: key, base URL, CourtListener token, endpoint badges
- **Apify** section: token + capability badges
- Web Search panel: SEC EDGAR, CourtListener, Regulations.gov, Treasury links

### 7. IRS Form Generator — Upload PDF Template
```html
<input type="file" id="irsTemplateUpload" accept=".pdf" onchange="uploadIRSTemplate(event)">
```
```javascript
function uploadIRSTemplate(event) { /* FileReader → localStorage name/size cache */ }
```

### 8. `#gc-v3-bar` Footer Status Bar
Fixed bottom bar matching GAAPCLAW format:
```
⚙️ TMAR v3.0 | SYPHER v7.1 ✅ | Rev: $0.00 Exp: $0.00 Net: $0.00 Assets: $0.00 Tax: $0.00 | ⚖️ BALANCED | 0 entries | 🧠 Mem: 0 | 📊 Live P&L 🤖 Agents 🧠 Memory 🔐 Security 🔗 Hash Chain
```
- Auto-updates every 5s from `appData.entries`
- Memory count reads `gcmem_*` + `ap_conv_*` localStorage keys
- 5 panel stub functions: `showGCFinancials`, `showGCAgentLog`, `showGCMemoryPanel`, `showGCSecurityReport`, `showGCIntegrityCheck`

---

## Engine Ports (v3.0 — Session 2)

### GCMemory — IndexedDB Persistent Agent Memory
```javascript
var GCMemory = (function() {
  // IndexedDB: GCMemory_v1 / exchanges store
  // Methods: openDB, add, addPdf, search, clearAll, count, isWorthy, extractTags
})();
```
- `isWorthy()` — 60+ legal/financial keyword filter
- `search()` — keyword-overlap scoring, cursor traversal, top-N results
- `add()` — stores userText (600 chars) + agentText (900 chars) + keywords + timestamp
- Auto-prune at 500 records (deletes oldest)

### MEM0 (GAAP_MEM0)
```javascript
var MEM0 = {
  enabled: () => true,   // Always on — no key gate
  search: (q, n) => GCMemory.search(q, n),
  add: (u, a, id) => GCMemory.add(u, a, id),
  addPdf: (f, t, p) => GCMemory.addPdf(f, t, p),
  clearAll: () => GCMemory.clearAll()
};
```

### OpenClawRuntime — SYPHER-7.8-HARDLOCK
3-phase boot:
1. **Phase 1** — Guarded `registerAgent`/`registerSkill` methods log + block attempts after lock
2. **Phase 2** — `seal()` deletes `registerAgent`, `registerSkill`, `seal` from runtime object
3. **Phase 3** — `Object.freeze(runtime)` — entire registry immutable

Registered: 5 agents, 9 skills → sealed at startup.

### HARD_LOCK
```javascript
var HARD_LOCK = Object.freeze({
  sanitizeOutput(raw),   // strips markdown, HTML, disclaimers
  validatePrompt(p),     // requires SYPHER PROTOCOL + PRESUMPTION KILLER tokens
  stripDisclaimers(t),   // removes 15 AI disclaimer patterns
  processOutput(raw)     // sanitizeOutput(stripDisclaimers(raw))
});
```
Integrity self-test: `HARD_LOCK.enforced` must remain `true` after frozen write attempt.

### Token Budget Guard
```javascript
var PROVIDER_LIMITS = { ollama: 9999999, anthropic: 200000, claude: 200000, openai: 128000, ... };
function estimateTokens(text)    // text.length / 3.8
function truncateToTokenBudget(userMessage, systemTokens)  // splits at document boundary
```

### callLLMStream — Multi-Provider Streaming Engine
```javascript
async function callLLMStream(agentSystemPrompt, userMessage, mem0Memories, onToken)
```
- Reads `eeon_*` localStorage keys via `resolveProvider()`
- **Ollama**: NDJSON streaming (`/api/chat`)
- **Anthropic**: SSE `data:` streaming
- **Bearer providers**: OpenAI-compatible SSE
- **Ernie**: Non-streaming JSON fallback
- All paths: 900s AbortController timeout
- All output: `HARD_LOCK.processOutput(accumulated)`

### askAgent() — Streaming Refactor
```javascript
async function askAgent(agentId, question)
```
- Fetches `MEM0.search(question, 4)` memories before each call
- Streams tokens live via `callLLMStream` with animated cursor
- Saves response to IndexedDB via `MEM0.add()` on completion
- Error handling includes API key setup guidance overlay

---

## Parity Status Post-Session

| Feature | Status |
|---|---|
| NOI Ask (11 agents) | ✅ Complete |
| AP pattern (7 specialist pages) | ✅ Complete |
| Dream Team AP + action buttons | ✅ Complete |
| AUTONOMOUS sidebar section | ✅ Complete |
| API Scout (22 APIs + live test) | ✅ Complete |
| Settings (all tabs + providers) | ✅ Complete |
| IRS Form Generator upload | ✅ Complete |
| `#gc-v3-bar` footer bar | ✅ Complete |
| GCMemory IndexedDB engine | ✅ Complete |
| MEM0 proxy | ✅ Complete |
| OpenClawRuntime HARDLOCK | ✅ Complete |
| HARD_LOCK enforcement | ✅ Complete |
| Token Budget Guard | ✅ Complete |
| callLLMStream (streaming) | ✅ Complete |
| resolveProvider() | ✅ Complete |
| E2ZERO embedded widget (TRCF only) | N/A — TMAR has own EON portal |

---

## Commits

| Hash | Description |
|---|---|
| `589a73b` | API Scout v2, footer bar, stubs |
| `9d5a4fe` | GCMemory, OpenClawRuntime, Streaming engines |

---

*Generated: 2026-03-14 | TMAR v3.0 | GAAPCLAW parity session*
