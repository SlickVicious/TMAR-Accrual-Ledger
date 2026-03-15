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
| Footer panel modals (Live P&L, Agents, Memory, Security, Hash Chain) | ✅ Complete |
| Trust agent full system prompt (`buildTrustAgentSystemPrompt + TRUST_AGENT_PROMPT_BODY`) | ✅ Complete |
| Ollama web search injection (`eeon_ollama_web_search` → tools array) | ✅ Complete |
| NOI Agent Browser Hardened Launcher | ✅ Complete |
| E2ZERO embedded widget (TRCF only) | N/A — TMAR has own EON portal |

---

## Session 3 — Parity Gap Closure + NOI Launcher (2026-03-14)

### Gap #1: Footer Panel Modals
Replaced all 5 alert() stubs with real overlay modals backed by live data:
- `showGCFinancials()` — stat cards (Revenue/Expenses/Net/Entries) + last 10 entries table
- `showGCAgentLog()` — AP conversation sessions per agent + live IndexedDB count
- `showGCMemoryPanel()` — GCMemory.count() + last 20 memories table + Clear All button
- `showGCSecurityReport()` — SYPHER version, HARD_LOCK status, agents/skills sealed, security event log
- `showGCIntegrityCheck()` — entry count, chain intact/broken status, last 10 entries with hash display
- Added `_gcOpenModal()` and `_gcStatCard()` helpers for shared panel UI

### Gap #2: Trust Agent Full System Prompt
Updated `getSystemPrompt('trust')` to call `buildTrustAgentSystemPrompt() + TRUST_AGENT_PROMPT_BODY` at runtime (with `typeof` guards for cross-script-block safety), replacing the simplified fallback prompt.

### Gap #3: Ollama Web Search Injection
Added `eeon_ollama_web_search` check to the Ollama block in `callLLMStream`:
- When enabled, injects a `web_search` function tool definition into the request body
- Sets `tool_choice: 'auto'`
- Handles `tool_calls` responses in the NDJSON streaming loop (logs search query inline)

### NOI Agent Browser Hardened Launcher
Created `NOI_Agent_Browser.bat` and `NOI_Agent_Browser_Harden.ps1`:
- Binds gateway to 127.0.0.1 only; blocks public bind
- Locks down `bearer.token`, `config.toml`, `gateway.json`, `logs/`, `memory/`, `sessions/` ACLs
- Checks for healthy existing gateway and reuses if available
- Validates and blocks remote computer-use endpoints
- `--dry-run` mode for validation without execution
- `--enable-startup` flag to create startup shortcut (off by default)
- Added all sensitive files/dirs to `.gitignore`

---

## Session 4 — CPA Firm Full Parity (2026-03-14)

### Gap: All 6 CPA Tabs Broken vs. GAAP.html

Reviewed original `redressright.me/GAAP.html` via Playwright. All 6 CPA tabs (Nonprofit, Partnership, Corporation, Trust, Trust Corp, Consolidated) had the following gaps vs. original:

| Issue | Old TMAR | Fixed |
|---|---|---|
| Sub-tab onclick values | `'compliance'` (matched no element) | `'tax'` / `'reporting'` / `'audit'` |
| Sub-tab selector strategy | ID-based (`cpa-sub-{firm}-compliance`) | Class-based (`.cpa-sub-{firm}`) |
| Quick prompt actions | `setCPAPrompt()` — filled only, didn't send | `cpaQuery()` — fills + sends immediately |
| Quick prompt count | 3 prompts, short labels | 4 prompts, full verbatim query text from original |
| Agent label div | Missing | `{firm}-agent-label` div with `AGENT N — [FIRM] [ROLE]` |
| Entity bar | Missing | Inline `🏢 Entity: [name] [Select]` bar per section |
| Submit button | Outline-style generic text | Filled color-matched `🏛️ Submit to [Firm]` |
| Clear button | Missing | `clearCPAChat(firm)` clears response + textarea |
| Response area default | Empty | Firm ready message on load |
| `sendCPAQuery` routing | Hardcoded Anthropic direct fetch, wrong key names | Routes through `callLLMStream` (multi-provider streaming) |
| System prompt | Generic one-liner, no sub-agent awareness | `buildCPASystemPrompt(firm, subAgent)` per-agent prompts |
| Entity detection | Static fallback to 'Entity Not Set' | Calls `promptEntitySelection()` if entity unset |
| Memory integration | None | `MEM0.search()` before call, `MEM0.add()` after |
| Entity type chips in header | Missing | Colored pill badges (e.g., §501(c)(3), Form 1065) |
| IRC references in subtitle | Missing | Full IRC section references per firm |

### `CPA_AGENT_CONFIGS` — Full Data Object

Central config object with all 6 firms × 3 sub-agents, each with:
- `name`, `icon`, `color`
- `subAgents.tax.label`, `.focus`
- `subAgents.reporting.label`, `.focus`
- `subAgents.audit.label`, `.focus`

Focus descriptions are verbatim from original GAAP.html — covering complete form lists, IRC sections, ASC standards, and regulatory frameworks per agent.

### New/Rewritten Functions

```javascript
var CPA_AGENT_CONFIGS = { nfp, ptnr, corp, trust, tcorp, consol }  // 6 firms × 3 agents
var activeSubAgents = { nfp:'tax', ptnr:'tax', ... }                // active sub-agent state

switchCPASubAgent(firm, subAgent)   // class-based button activation + label update
cpaQuery(firm, question)            // set textarea + call sendCPAQuery
clearCPAChat(firm)                  // clear response + textarea
buildCPASystemPrompt(firm, subAgent)// per-agent system prompt (HARD_LOCK compatible)
async sendCPAQuery(firm)            // streaming via callLLMStream, entity detection, MEM0
```

### Parity Status Post-Session 4

| Feature | Status |
|---|---|
| Nonprofit CPA (3 sub-agents + 4 quick prompts) | ✅ Complete |
| Partnership CPA (3 sub-agents + 4 quick prompts) | ✅ Complete |
| Corporation CPA (3 sub-agents + 4 quick prompts) | ✅ Complete |
| Trust CPA (3 sub-agents + 4 quick prompts) | ✅ Complete |
| Trust Corporation CPA (3 sub-agents + 4 quick prompts) | ✅ Complete |
| Consolidated CPA (3 sub-agents + 4 quick prompts) | ✅ Complete |
| Sub-agent switching (class-based) | ✅ Complete |
| Entity detection → promptEntitySelection() | ✅ Complete |
| Multi-provider streaming via callLLMStream | ✅ Complete |
| MEM0 memory integration | ✅ Complete |
| HARD_LOCK.validatePrompt compatibility | ✅ Complete |

---

## Session 5 — EON Agent Pages: Missing + DOM Nesting Fix (2026-03-14)

### Gap: 5 Agent Cards in Agents Grid Failed to Navigate

Agents tab grid showed 11 agents; clicking Code Expert, Creative Writer, HTML Architect, General Assistant, and Arbitration Specialist did nothing (blank screen).

**Root cause:** `goEonPage(null, page)` calls `container.querySelector('#page-' + page)` where `container = eonPagesContainer`. Four agent IDs had no matching `#page-{id}` element:

| Agent ID | Page ID Needed | Status |
|---|---|---|
| `code` | `#page-code` | ❌ Missing — only `#page-codebuilder` existed (different tool) |
| `creative` | `#page-creative` | ❌ Missing |
| `html_arch` | `#page-html_arch` | ❌ Missing |
| `general` | `#page-general` | ❌ Missing |
| `arbitration` | `#page-arbitration` | ✅ Existed — re-verified working |

### Fix Attempt 1 — Pages Added Outside eonPagesContainer

Initial fix inserted the 4 pages by matching the wrong anchor string, placing them outside `eonPagesContainer`. Since `container.querySelector()` only searches within the container subtree, the pages were unreachable.

### Fix Attempt 2 — Broken Voice Page Nesting

Second insertion correctly targeted the container's closing region but accidentally removed 4 closing `</div>` tags from `page-voice` (2-column grid → card-body → card → page-voice). HTML parser then nested all 4 new pages inside `page-voice`'s DOM subtree. Since `page-voice` has `display:none` when inactive, CSS propagated to all children — new pages were hidden even when given `.active`.

### Fix Applied

1. Restored 4 missing `</div>` tags closing `page-voice` structure
2. New pages (`page-code`, `page-creative`, `page-html_arch`, `page-general`) now correctly placed as siblings of `page-voice` inside `eonPagesContainer`
3. All 4 follow full AP pattern: saved-convs sidebar, Speak/Listen/Print/PDF/Word/Share action bar, color-matched textarea + Send button
4. Added to AP `DOMContentLoaded` init list (7 → 11 agents)
5. Added sidebar nav buttons under SPECIALISTS section

### Parity Status Post-Session 5

| Feature | Status |
|---|---|
| page-code (Code Expert, #3b82f6) | ✅ Complete |
| page-creative (Creative Writer, #ec4899) | ✅ Complete |
| page-html_arch (HTML Architect, #f97316) | ✅ Complete |
| page-general (General Assistant, #06b6d4) | ✅ Complete |
| AP init — 11 agents total | ✅ Complete |
| Sidebar nav buttons for all 4 | ✅ Complete |

---

## Commits

| Hash | Description |
|---|---|
| `589a73b` | API Scout v2, footer bar, stubs |
| `9d5a4fe` | GCMemory, OpenClawRuntime, Streaming engines |
| *(pending)* | NOI Launcher, parity gap closure (modals, trust prompt, Ollama web search) |
| `920099a` | CPA Firm full parity — HTML rebuild + JS engine replacement |
| `eaa34d9` | Add missing agent pages: code, creative, html_arch, general |
| `0cdcabd` | Fix DOM nesting — restore 4 missing </div> closing page-voice |

---

*Updated: 2026-03-14 | TMAR v3.0 | Agent page parity complete*
