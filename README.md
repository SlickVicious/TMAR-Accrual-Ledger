# TMAR - Trust Master Account Register

**Complete Interactive Web Application + Google Sheets Integration**
**Version:** 3.8
**Last Updated:** April 7, 2026
**Status:** ✅ Production Ready — 246/246 Functions Verified | 211/211 GUI Elements Verified

---

## 🌐 Live Application

### Public URL (Auto-Updates)
**GitHub Pages:** https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html

Access from anywhere:
- ✅ Mac Desktop/Laptop
- ✅ Windows PC
- ✅ Mobile/Tablet
- ✅ Any modern web browser

### Local Development
```bash
# Start local server
npx http-server -p 8080 -o

# Access at
http://localhost:8080/TMAR-Accrual-Ledger.html
```

---

## 🌐 CORS Proxy Setup

Direct browser API calls to Anthropic are blocked by CORS when using the app from GitHub Pages. A free Cloudflare Worker proxy solves this.

**Current worker:** `cloudflare-worker-v2.js` — dual mode:
- `/v1/*` → Anthropic API proxy (strips `Origin`/`Referer`, injects `anthropic-dangerous-direct-browser-access`)
- `?url=<encoded>` → Generic CORS proxy for `redressright.me` only (used by `tmar-updater.js`)

### Deploy (one-time, ~3 minutes)

1. Go to [workers.cloudflare.com](https://workers.cloudflare.com) — create a free account
2. Click **Create Worker**
3. Select all default code, delete it, paste the full contents of [`cloudflare-worker-v2.js`](./cloudflare-worker-v2.js)
4. Click **Deploy** — copy the worker URL (e.g. `https://your-worker.yourname.workers.dev`)

### Configure in TMAR

5. Open the app → click **🤖** → **API Keys**
6. Scroll to **🌐 CORS Proxy URL** → paste the worker URL
7. Click **Save All Keys**

All Anthropic API calls now route through your worker. The worker strips browser identity headers and forwards requests cleanly to `api.anthropic.com`.

---

## 📊 Project Overview

TMAR is a comprehensive financial management system combining:

1. **Interactive Web Application** - Full-featured HTML/JavaScript GUI
2. **Google Apps Script Backend** - Automated Google Sheets integration
3. **AI Agent Integration** - 6 specialized Claude AI agents
4. **Secure Vault System** - Encrypted document storage
5. **Research & Analysis Tools** - Legal, tax, and accounting research

---

## 🎯 Core Features

### Web Application (TMAR-Accrual-Ledger.html)

**55 Tabs/Screens** across 13 groups:

- Core Accounting (Ledger, Entities, CoA, Journal, A/R, A/P, Consolidation, Statements)
- Tax & Compliance (Tax Filings, Tax Estimator, Schedule A)
- Trust Estate (Dashboard, Ledger, Reports)
- SPV Module (SPV Dashboard, SPV Ledger, SPV Reports) ← **new v3.3**
- UK Accounting (FRS 102 / IFRS — entity config, compliance checklist, UK statements) ← **new v3.3**
- Operations (Invoicing, Payroll, Inventory, Budget, Payment Orders, Bills of Exchange, Expenses, Customers/Vendors, Depreciation, Bank Recon)
- Reports & Intelligence (Reports, Master Report, GAAPCLAW Master, 6 CPA Firms, IRS Form Generator)
- Tools (Settings & API, API Scout, Voice & Chat, Financial Assets, Document Creator, Source Folders)
- RedressRight Libraries (CPSA, TRCF, CCSN, FDRF, EEEJ)
- Verification (Entity Verifier v2.0)
- Data Integration (Sync Center)
- PDKB Tools (Transcript, Etymology, PDF/MD, POA/DBA)

**211 GUI Elements Verified** (see [System Status Dashboard](./TMAR-System-Status-Dashboard.html)):

- ✅ 211/211 Working (100%)
- ✅ 0 Not Working
- ✅ Full function audit with dependency documentation
- ✅ Interactive dashboard with search & filtering

**17 Custom Functions (All Documented):**
- Chat & Communication (3)
- Memory & Storage (3)
- Settings & Preferences (3)
- Voice & Speech (4)
- Utilities (4)

See [Function_Reference_Cards/](./Function_Reference_Cards/) for complete documentation.

### Google Sheets Integration

**Apps Script Project:**
https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ

**Features:**
- Master Account Register
- Cash Flow Analysis (CapOne, BOA, PNC, Fidelity)
- Bill of Exchange Management
- Duplicate Detection & Analysis
- GAAP Compliance Interface
- Sync Center for data exchange

See [GSheet/](./GSheet/) for Google Sheets documentation.

---

## 🚀 Quick Start

### 1. Access the Web Application

**Option A - GitHub Pages (Recommended):**
```
https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html
```

**Option B - Local Development:**
```bash
cd "/path/to/TMAR"
npx http-server -p 8080 -o
```

### 2. Configure API Keys

1. Navigate to **Settings > API Keys**
2. Add your Anthropic Claude API key
3. Click **Save** (green indicators appear)
4. Click **Test** to verify connection

### 3. Start Using Agents

1. Go to **Trust Agent** page
2. Select an agent (Legal, Tax, Accounting, etc.)
3. Type your question
4. Click **⚡ Analyze**

---

## 🆕 What's New in v3.8

| Feature | Details |
|---|---|
| **tmar-key-manager.js** | New standalone floating 🔐 API key manager panel. Loaded via `<script src="tmar-key-manager.js">` before `</body>`. 10 provider slots (Claude, OpenAI, DeepSeek, Gemini, Perplexity, OpenRouter, xAI, HuggingFace, GitHub, DataGov). Per-key ⚡ live test, Test All, 👁 reveal/hide, `.env` import, IDB backup, and red-pulse alert when required keys are missing. |
| **Vault → `eeon_key_*` injection bridge** | `_vaultInjectApiKeys(entries)` — called on both `unlockVault()` and `addVaultEntry()`. On unlock the full vault entry array is iterated; each `site` field is mapped via `_VAULT_SITE_MAP` to the correct `eeon_key_*` / `stg_key_*` localStorage slot. Claude key is mirrored to all 5 aliases (`eeon_key_claude`, `_trustApiKey`, `TMAR_trustApiKey`, `tmar_claude_key`, `stg_key_claude`). IDB backup fires after injection. |
| **Digital File Cabinet (`page-docs`)** | Full 3-tab panel replacing the stub: **Vault Browser** (expandable static `VAULT_INDEX` tree from Obsidian vault dir, with search), **Sheets Data** (live GAS sync via `dfcSyncSheets()` — renders headers + rows for 3 workbook GIDs as scrollable tables), **Local Docs** (placeholder for local file links). `dfcShowSheetInPanel(context)` called from Accounting and Trust toolbar buttons. |
| **Google Sheets workbook integration** | GAS `SyncCenter.gs` gains two new actions: `listWorkbookTabs` (returns all tab names + GIDs from workbook `1CYg4fwQoLARD9y3bQbn8W8HO5jI89osj`) and `pullWorkbookSheets` (returns headers + up to 200 rows each for GIDs 779167554, 1677909637, 1870452300). `SyncBridge` client updated with matching methods. |
| **Obsidian vault static index** | `VAULT_INDEX` JS object embedded in HTML — full tree of `C:\Users\rhyme\Documents\Legal Document Generator\Digital File Cabinet\` (5 categories: Master Binder System, Generated Documents, Financials, Legal Reference Library, Gov Forms). Rendered as interactive accordion in Vault Browser tab. |
| **`.chat-wrap` flex fix** | `height: calc(100vh - 142px - 40px)` → `flex: 1; min-height: 0` — chat panels now fill EON overlay correctly without hard-coded viewport offsets. |
| **Duplicate 📎 icon removal** | 24 legacy `apAttachFile()` `<label>` elements removed from all AP agent input rows, eliminating phantom "double send button" appearance. |
| **`.voice-btn` CSS** | Added missing `.voice-btn` definition (used on `page-voice`) — button now renders correctly with hover/active states. |

---

## 🆕 What's New in v3.7

| Feature | Details |
|---|---|
| **tmar-updater.js** | New standalone auto-update module (`TmarUpdater` class). Fetches upstream `redressright.me/GAAP.html` via CORS proxy, diffs against local version, presents update/rollback UI. Replaces the old inline `parityCheckOnLoad` / `parityDriftBanner` system (~75 lines removed). Loaded via `<script src="tmar-updater.js">` before `</body>`. |
| **Cloudflare Worker v2** | Updated worker (`cloudflare-worker-v2.js`) adds a second route: `?url=<encoded>` generic CORS proxy limited to `redressright.me` / `www.redressright.me`. The existing `/v1/*` Anthropic API proxy is unchanged. Required by `tmar-updater.js` to fetch upstream source. |
| **EON portal blank-page fix** | `.page.active` now uses `height: calc(100vh - 72px); max-height: calc(100vh - 72px); box-sizing: border-box` — resolves percentage-height failure inside `overflow-y:auto` scroll container. AP inner wrapper divs changed from `height:100%` to `flex:1;min-height:0` (23 occurrences). |
| **Icons restored (12 pages)** | Stripped Font Awesome glyphs replaced with emoji equivalents on: Backup & Restore, Chat, Tax Forms (sync/print/TTS), NOI Ask, Vault, Voice Center, Search, Settings (API Keys, Provider Keys, GCMemory, Ollama, Web Search, Custom Provider, Channel Tokens). |

---

## 🆕 What's New in v3.6

| Feature | Details |
|---|---|
| **Analytics stat cards** | Added HARD_LOCK (v3.0) and Key Vault (AES-256) stats to Analytics page; SYPHER Active now shows ✓ (was blank). |
| **Corporation feature section** | OG-style description card with 5 feature badges (Corporate Formation, Governance, SPV, Tax Compliance, Religious Corp) added above AP conversation interface. |
| **AI Hub** | New first entry in TOOLS sidebar. Full page includes NOI Quick Launch (12 AI services), NOI Developer Tools, Free LLM API Resources, and Open Source AI curated directory. Adds `goPage`, `aiHubAskAgent()`, `noiServiceToChat()` JS functions. |
| **AP file upload (all 24 agents)** | 📎 button added to every AP conversation page. Uses DOM-attached file input pattern; reads content and prepends to textarea. Covers all LEGAL, LEGAL FIRMS, SPECIALISTS, and TOOLS agent pages. |
| **EEON Full Suite** | New sidebar entry + dedicated page. Describes TMAR as the full financial suite; includes Return to Ledger, Open Full Screen, and module quick-launch cards (Tax Forms, OpenClaw, AI Hub, Tax Estimator). |
| **Dream Team button icons** | Restored blank send (➤), upload (📎), and mic (🎤) icons that had been stripped. |
| **Page overlap fix** | `goEonPage()` now force-sets `display:none` on all pages before switching, preventing inline `style` overrides from ghost-rendering deactivated pages. Added `#page-corporation.active { display:flex }` CSS rule. |

---

## 🆕 What's New in v3.5

| Feature | Details |
|---|---|
| **14 New EON Chat Agents** | Added 14 legal-specialty firm agents to the Chat firm selector, Agents grid, and sidebar — matching Agent.html parity at 25 total agents. |
| **LEGAL FIRMS sidebar section** | New sidebar group with 13 dedicated AP-style pages: Document Creation, Legal Analyst, Document Format, Writs Writing, Amicus Brief, Dream Team Appeal, Presumption Killer, Fact & Conclusion of Law, Jurisdictional Challenge, Constitutional Sovereignty, Strategic Brainstorm, Trial Preparation, Biblical Scholar. |
| **Ledger & Accounting Expert chip** | Chat firm chip added for `ledger` — routes to existing `accounting` page/prompt. |
| **25 active agents** | Dashboard Active Agents stat updated from 10 → 25. |

---

## 🆕 What's New in v3.4

| Feature | Details |
|---|---|
| **GAAPCLAW Master Agent** | Dedicated streaming chat agent (`gaapAgentSection`) for all entity types — C-Corp, S-Corp, LLC, Trust, SPV, Non-Profit. 6 quick-prompts, full conversation history, calls `callLLMStream()` via active provider. |
| **OpenClaw Page** | New EON sidebar page with Apify token + Tavily + Firecrawl key cards and a discovery search panel for live web scraping/search integration. |
| **Tavily / Firecrawl / Mem0 Keys** | Three new API key cards in Settings → API Keys. Keys stored as `stg_key_tavily`, `stg_key_firecrawl`, `stg_key_mem0`. Vault `.env` import maps `TAVILY_API_KEY`, `FIRECRAWL_API_KEY`, `MEM0_API_KEY`. |
| **Image Paste** | `handleChatPaste()` — intercepts clipboard paste events, converts images to base64, sends to Claude vision API as `{type:'image',source:{type:'base64',...}}`. Ctrl+V to paste screenshots directly into any chat. |
| **Token Guard** | Session token counter in chat action bar — gray <50K, amber ⚡ <100K, red ⚠️ <180K, ⛔ at limit. Tracks send + streaming tokens. |
| **CAMT + Buyback Tax** | Two new sub-tabs in Tax Estimator: IRC §55 Corporate AMT (15% on AFSI ≥$1B) and IRC §4501 Stock Buyback Excise (1%, $10M de minimis). |
| **Vault Buttons** | Three quick-action buttons in Settings action row: 🔐 Load .env, 📦 Export Bundle, 📥 Import Bundle. |
| **Model Defaults Updated** | OpenAI→`gpt-4.1-mini`, xAI→`grok-3-mini`, MiniMax→`MiniMax-Text-01`, Ernie→Qianfan v2 endpoint + `ernie-4.0-turbo-8k`, Ollama fallback→`deepseek-r1:14b`. |
| **Dev Workflow** | Document maintenance protocol added: per-feature doc update checklist, archive criteria, stale-doc rules. Parity drift issues now include a doc-update checklist. |

---

## 🆕 What's New in v3.3

| Feature | Details |
|---|---|
| **SPV Module** | 3 new tabs: SPV Dashboard, SPV Ledger, SPV Reports. Full CRUD for Special Purpose Vehicles with trial balance and asset summaries. |
| **UK Accounting** | New tab: FRS 102 / IFRS compliance — entity config (UTR, VAT, Companies House), 8-item compliance checklist, UK P&L + Balance Sheet generator, AI agent for HMRC/Companies Act queries. |
| **Groq provider** | Free-tier LLM via `https://api.groq.com` — `llama-3.3-70b-versatile`, 32K context. |
| **Cerebras provider** | Free-tier LLM via `https://api.cerebras.ai` — `llama-3.3-70b`, 8K context. |
| **OpenRouter provider** | 200+ model aggregator via `https://openrouter.ai` — default `gpt-4o-mini`. |
| **Parity Drift Notifications** | Weekly GitHub Actions cron fingerprints `redressright.me/Agent.html` + `GAAP.html`. In-app sticky banner + GitHub Issue auto-created when upstream changes detected. |
| **User Manual** | `TMAR-User-Manual.md` updated to v3.3 with all new sections and ~30 new function references. |

---

## 📂 Project Structure

```
TMAR/
├── TMAR-Accrual-Ledger.html          # Main web application (v3.8)
├── tmar-key-manager.js               # Standalone floating API key manager (v1.0)
├── TMAR-User-Manual.md               # Complete user manual (v3.3, ~3,600 lines)
├── parity-fingerprint.json           # Source parity baseline (auto-updated weekly by CI)
├── TMAR-System-Status-Dashboard.html # GUI element status dashboard (211 elements)
├── TMAR_Audit_Dashboard.html         # Interactive audit dashboard v2 (246/246, 100%)
├── audit_report.json                 # Full audit data v2 (0 missing)
├── .github/workflows/
│   └── parity-check.yml              # Weekly cron: fingerprints redressright.me, opens Issue on drift
├── _archive/                         # Archived one-time records and superseded docs
│
├── Function_Reference_Cards/         # Complete function documentation
│   ├── README.md                     # Quick reference index
│   ├── COMPLETE_IMPLEMENTATION_GUIDE.md
│   ├── 01_sendQuick.md               # Individual function cards
│   ├── 02_eeonSendChat.md
│   └── ... (22 total reference cards)
│
├── gas/                              # Google Apps Script files
│   ├── Code.gs                       # Main GAS code
│   ├── FormattingComplement.gs       # Formatting utilities
│   ├── SyncCenter.gs                 # Data synchronization
│   ├── DocumentGenerator.html        # Document generation UI
│   ├── GAAPInterface.html            # GAAP compliance UI
│   ├── README.md                     # GAS documentation
│   └── ... (22 total GAS files)
│
├── GSheet/                           # Google Sheets documentation
│   ├── README.md                     # GSheet overview
│   ├── INTEGRATION_COMPLETE.md       # Integration guide
│   ├── DEPLOYMENT_GUIDE.md
│   └── ... (17 documentation files)
│
├── docs/                             # Additional documentation
│   ├── Bank_Statement_Extraction_Guide.md
│   ├── Extractor_API_Reference.md
│   ├── LLM Provider Status.md
│   └── plans/                        # Development plans
│
└── ClaudeSkills/                     # Claude Code skills
    └── LDG Vault Skills Suite — Index.md
```

---

## 🔧 Development Workflow

### Git Workflow

**Mac → GitHub:**
```bash
git add TMAR-Accrual-Ledger.html   # stage only what changed
git commit -m "feat/fix/chore: description"
git push origin master              # GitHub Pages auto-deploys
```

**PC → Sync from GitHub:**
```bash
git pull origin master
# Make changes
git add TMAR-Accrual-Ledger.html
git commit -m "PC updates"
git push origin master
```

### Google Apps Script Deployment

```bash
cd gas/
clasp push       # deploy to Apps Script
clasp open       # open in editor to redeploy Web App if SyncCenter.gs changed
```

---

### 📋 Document Maintenance Checklist

Run this checklist on **every feature or parity-sync commit** before pushing.

#### Update (when applicable)

| Document | Update When |
|---|---|
| `README.md` | version bump, new features, tab/count changes, What's New entry |
| `TMAR-ACCRUAL-LEDGER-DESIGN.md` | new Approved Decision rows, version header, module scope |
| `TMAR-User-Manual.md` | any user-visible feature added or changed |
| `parity-fingerprint.json` | auto-updated by CI — do not edit manually |

#### Archive to `_archive/`

Move these when they are no longer current:
- One-time deployment records, setup completion reports (after their feature ships)
- Superseded planning docs and gap-audit reports (after implementation)
- Old implementation plans that are fully executed
- Duplicate guides that have been consolidated elsewhere

#### Remove

- Empty stubs or placeholder files with no content
- Files wholly superseded by a renamed/rewritten replacement
- Temporary scratch files committed by mistake

**Rule of thumb:** if you wouldn't link it from `README.md` and nothing in the codebase references it, archive or delete it before the next push.

---

### 🔁 Parity Sync Workflow

When the weekly Actions run or `gh workflow run parity-check.yml` opens a drift issue:

1. Fetch both source URLs listed in the issue
2. Run gap audit (diff source tabs vs TMAR sidebar)
3. Implement gaps in TMAR-Accrual-Ledger.html
4. Follow the Document Maintenance Checklist above
5. Commit → push → close the drift issue

---

## 📖 Documentation

### Quick References
- [Function Reference Cards](./Function_Reference_Cards/README.md) - All 17 custom functions
- [Audit Dashboard](./TMAR_Audit_Dashboard.html) - Interactive coverage report (v2, 246/246)
- [System Status Dashboard](./TMAR-System-Status-Dashboard.html) - GUI element status (211/211)

### Implementation Guides
- [Complete Implementation Guide](./Function_Reference_Cards/COMPLETE_IMPLEMENTATION_GUIDE.md)

### Google Sheets Integration
- [GSheet README](./GSheet/README.md)
- [Integration Complete](./GSheet/INTEGRATION_COMPLETE.md)
- [Deployment Guide](./GSheet/DEPLOYMENT_GUIDE.md)

### Specialized Guides
- [Bank Statement Extraction](./docs/Bank_Statement_Extraction_Guide.md)
- [Extractor API Reference](./docs/Extractor_API_Reference.md)
- [LLM Provider Status](./docs/LLM%20Provider%20Status.md)

---

## ✅ Implementation Status

### Web Application

- **GUI Elements:** 211/211 (100%) — verified via System Status Dashboard
- **Tabs/Screens:** 51 across 12 groups (100%)
- **AI Agents:** 19 total (GAAPCLAW Master + 6 CPA firms × 3 sub-agents each)
- **Testing:** ✅ All buttons verified working (zero stubs remaining)

### Google Apps Script
- **Main Code:** Code.gs (137 KB)
- **Modules:** 22 files
- **Integration:** ✅ Complete
- **Deployment:** ✅ Live on Google Sheets

### AI Agents (6 Total)
1. ⚖️ Legal Expert - Presumption Killer
2. 💰 Tax Strategist - IRC Master
3. 📊 Accounting Expert - GAAP/FASB
4. 🏛️ Trust Administrator - Estate Planning
5. ⚔️ Arbitration Expert - Dispute Resolution
6. 🏢 Corporation Specialist - Business Formation

**API Integration:** Anthropic Claude (claude-sonnet-4-20250514)

---

## 🔐 Security Features

### Vault System
- **Encryption:** AES-256-GCM
- **Key Derivation:** PBKDF2 (100,000 iterations)
- **Password Hashing:** SHA-256
- **Auto-Lock:** 15-minute timer
- **Failed Attempts:** 5 max before lockout

### API Keys
- **Storage:** Browser localStorage (encrypted at rest)
- **Transmission:** HTTPS only
- **Validation:** Connection testing before save
- **Indicators:** Visual key status dots

### Data Privacy
- **Local First:** All data stored in browser localStorage
- **No Cloud Sync:** Unless explicitly configured
- **No Tracking:** No analytics or telemetry
- **Offline Capable:** Works without internet (except AI features)

---

## 🎨 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Bootstrap 5 + Custom styles
- **JavaScript** - Vanilla JS (ES6+)
- **LocalStorage** - Client-side persistence
- **Web Crypto API** - Encryption
- **Web Speech API** - Voice features

### Backend
- **Google Apps Script** - Server-side automation
- **Google Sheets API** - Data storage
- **Anthropic Claude API** - AI agents

### Deployment
- **GitHub Pages** - Static hosting
- **Git** - Version control
- **clasp** - Google Apps Script CLI

---

## 📈 Version History

### v3.5 (April 5, 2026) — 14 New EON Legal Firm Agents (25 Total)

- ✅ **14 new Chat firm chips** — Document Creation, Legal Analyst, Document Format, Writs Writing, Amicus Brief, Dream Team Appeal, Presumption Killer, Fact & Conclusion of Law, Jurisdictional Challenge, Constitutional Sovereignty, Strategic Brainstorm, Trial Preparation, Biblical Scholar, Ledger & Accounting Expert
- ✅ **13 new AP-style agent pages** — full conversation history, Speak/Listen/Print/PDF/Word/Share, color-matched UI per agent
- ✅ **LEGAL FIRMS sidebar section** — 13 new sidebar nav buttons
- ✅ **25 agent cards** in Agents grid (`renderAgents()`)
- ✅ **System prompts** — SYPHER/EEON methodology applied to all 13 new agents
- ✅ **Dashboard** — Active Agents stat updated to 25

### v3.4 (April 4, 2026) — GAAPCLAW Master Agent + OpenClaw + Model Updates + Doc Workflow

- ✅ **GAAPCLAW Master Agent** — dedicated streaming chat for all entity types; 6 quick-prompts; `gaapAgentSend/Clear/Q()` wired to `callLLMStream()`
- ✅ **OpenClaw page** — Apify/Tavily/Firecrawl key cards + discovery search in EON sidebar
- ✅ **Tavily / Firecrawl / Mem0 API keys** — settings cards + ENV_TO_LS_MAP vault import mappings
- ✅ **Image paste** — `handleChatPaste()` on all chat inputs; Claude vision base64 block format
- ✅ **Token Guard** — session token counter with color-coded thresholds in chat bar
- ✅ **CAMT + Buyback Tax sub-tabs** — IRC §55 (15% AFSI ≥$1B) + IRC §4501 (1% excise, $10M de minimis)
- ✅ **Vault quick-action buttons** — 🔐 Load .env, 📦 Export Bundle, 📥 Import Bundle in Settings row
- ✅ **Model defaults** — OpenAI→`gpt-4.1-mini`, xAI→`grok-3-mini`, MiniMax→`MiniMax-Text-01`, Ernie→Qianfan v2, Ollama fallback→`deepseek-r1:14b`
- ✅ **Document maintenance protocol** — per-feature checklist, archive criteria, parity issue doc checklist

### v3.2 (April 4, 2026) — Transcript Transformer YAML Fix + Audit Dashboard v2

- ✅ **Transcript Transformer YAML fix** — `source_url` now single-quoted in generated frontmatter, fixing Obsidian parse failure on Windows paths (C: colon was breaking YAML key detection); `purpose` switched to `>-` block scalar; `tags` switched to list format
- ✅ **Audit Dashboard v2** — Rebuilt to reflect post-fix verified state (246/246, 100%); removed stale red alert, added green all-clear banner with fixed-17 highlight grid
- ✅ **audit_report.json v2** — All 17 previously-missing functions now in `implemented` array with `fixed` date markers; 8 browser built-ins separated into `excluded_builtins`
- ✅ **Doc cleanup** — 12 one-time deployment/completion records archived; 15+ GSheet duplicate files archived; stale PR #1 closed

### v3.1 (March 17, 2026) — Full GUI Audit + Entity Verifier CSV Import

- ✅ **System Status Dashboard** — Interactive HTML dashboard mapping all 211 GUI elements with status, handlers, descriptions, search & filtering
- ✅ **Full function verification** — All 23 previously-unconfirmed functions investigated and confirmed working with graceful degradation
- ✅ **toggleMic() fixed** — Replaced stub with real implementation wired to startVoiceRec()/stopVoiceRec()
- ✅ **testSyncConnection() implemented** — Pings GAS Web App via SyncBridge.ping(), shows version/year/latency
- ✅ **Entity Verifier CSV Import** — `ev2ImportCSV()` parses TMAR Entities CSV format, deduplicates by EIN/name, merges into `appData.entities` with extended fields (address, phone, email)
- ✅ **Entity Verifier v2.0 section** added to System Status Dashboard (12 elements)

### v3.0 (March 14, 2026) — GAAPCLAW Full Parity + Engine Ports
- ✅ **GCMemory IndexedDB engine** — Full persistent agent memory (replaces localStorage stub)
  - `add()`, `addPdf()`, `search()` with keyword-overlap scoring, `clearAll()`, `count()`
  - 60+ legal/financial importance keywords; auto-prune at 500 records
- ✅ **MEM0 (GAAP_MEM0)** — Drop-in proxy routing all calls to GCMemory; always enabled, no key gate
- ✅ **OpenClawRuntime SYPHER-7.8-HARDLOCK** — 3-phase boot: guarded registration → delete methods → `Object.freeze()`; 5 agents + 9 skills sealed; rogue injection blocked + logged
- ✅ **HARD_LOCK enforcement layer** — Frozen object: sanitizeOutput (strips markdown), validatePrompt, stripDisclaimers, processOutput; integrity self-test at load
- ✅ **Streaming architecture (callLLMStream v7.1)** — Multi-provider SSE/NDJSON streaming: Ollama, Anthropic, OpenAI-compatible bearer, Ernie non-streaming fallback; 15-min AbortController
- ✅ **Token Budget Guard** — PROVIDER_LIMITS for 14 providers; `truncateToTokenBudget()` preserves questions, truncates docs first
- ✅ **resolveProvider()** — Reads `eeon_*` localStorage keys; cascading fallback to Claude
- ✅ **askAgent() refactored** — Full streaming with live cursor, MEM0 context injection, IndexedDB save on completion
- ✅ **API Scout v2** — 22 curated APIs, search/category/auth filters, ⚡ Test All Live with per-card status dots, ⬇ Integrate All
- ✅ **`#gc-v3-bar` footer status bar** — Fixed bottom: Rev/Exp/Net/Assets/Tax/BALANCED/entries/Mem + 5 panel buttons
- ✅ **AP pattern** — All 7 specialist pages rebuilt with left sidebar + 6-button action bar (Speak/Listen/Print/PDF/Word/Share) + localStorage conversation persistence
- ✅ **AUTONOMOUS sidebar section** — Task Planner, API Integrations, Code Builder, API Scout properly separated from SYSTEM
- ✅ **uploadIRSTemplate()** — PDF template upload with FileReader + localStorage
- ✅ **Settings expanded** — Appearance tab, LLM provider grid buttons, GCMemory block, OpenClaw + Apify sections

### v2.0 (March 9, 2026)
- ✅ Implemented all 17 custom functions
- ✅ Created 17 reference cards
- ✅ Complete audit system (246 functions)
- ✅ Interactive audit dashboard
- ✅ 100% function coverage
- ✅ Documentation reorganization

### v1.0 (March 8, 2026)
- ✅ 6 AI agents with Claude API integration
- ✅ Research HUB with 3 depth modes
- ✅ API Keys management
- ✅ Enhanced button styling
- ✅ Comprehensive error handling

---

## 🤝 Contributing

### Reporting Issues
1. Check existing issues on GitHub
2. Provide detailed description
3. Include browser/environment info
4. Add screenshots if applicable

### Making Changes
1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

---

## 📞 Support

### Documentation
- Check [Function Reference Cards](./Function_Reference_Cards/)
- Review [Audit Dashboard](./TMAR_Audit_Dashboard.html)
- Read implementation guides

### Troubleshooting
- Enable browser console (F12)
- Check for error messages
- Verify API key configuration
- Test network connectivity

---

## 📝 License

Copyright © 2026 TMAR Development Team
All Rights Reserved

---

## 🔗 Links

- **Live Application:** https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html
- **GitHub Repository:** https://github.com/SlickVicious/TMAR-Accrual-Ledger
- **Google Sheets:** https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ
- **Audit Dashboard:** https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR_Audit_Dashboard.html

---

**Last Updated:** April 4, 2026
**Status:** ✅ Production Ready — 246/246 Functions | 211/211 GUI Elements Verified
**Coverage:** 100%
