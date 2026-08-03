# TMAR Project Vault — Master Index

> **This vault is the development control center for the Trust Master Account Register ecosystem.**  
> It documents every surface, script, endpoint, agent, and data flow — one index to navigate the entire project.

**Last updated:** 2026-07-31  
**Vault theme:** Cobalt Peacock · **Font:** Rubik · **Accent:** `#6946b9`

---

## 🗺️ Ecosystem Map

```
                          ┌──────────────────────────────────┐
                          │   TMAR-Accrual-Ledger.html       │
                          │   (GitHub Pages + localhost:5501) │
                          │   CENTRAL CONTROL HUB             │
                          │   · 25 agents · 22 functions      │
                          │   · Document Creator · Vault      │
                          └──────┬──────────┬────────────────┘
                                 │          │
                    fetch() GET/POST    fetch() SSE/JSON
                                 │          │
              ┌──────────────────┘          └──────────────────┐
              ▼                                                 ▼
┌──────────────────────────┐                    ┌──────────────────────────┐
│  GAS Web App             │                    │  LLM Providers           │
│  doGet/doPost            │                    │  Anthropic · OpenAI      │
│  SyncCenter.gs           │                    │  DeepSeek · xAI · Ollama │
│  TMARBridge.gs           │                    │  via Cloudflare Worker   │
│  ┌─────────────────────┐ │                    └──────────────────────────┘
│  │   TMAR_CONFIG       │ │
│  │   Sheet IDs         │ │
│  └─────────────────────┘ │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  TMAR Live Workbook                       │
│  1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT…    │
│  ~52 tabs · System of Record              │
│  Master Register · Ledgers · 1099s        │
│  Creditors · Documents · Tax              │
└──────────────────────────────────────────┘
           ↕ (DOC-NNNN scan)
┌──────────────────────────────────────────┐
│  FileCabinet (PC)                         │
│  C:\Users\rhyme\Desktop\FileCabinet\      │
│  · 00–09 numbered dirs                    │
│  · Credentials/ (new)                     │
│  · Estates/ · HHHW/ · Digital-Binders/    │
└──────────────────────────────────────────┘
           ↕ (documents born here)
┌──────────────────────────────────────────┐
│  YTubiversity Vaults (Obsidian)           │
│  D:\00_YTubiversity Vaults\               │
│  Eeon · Free Way Mechanics · Huey Hardy   │
│  New Earth Living · Zero% · 7_Ways        │
└──────────────────────────────────────────┘
```

---

## 📡 Surfaces (6 Total)

| #   | Surface                  | URL / Path                                                                                                         | Role                                         |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| 1   | **TMAR Web App** (prod)  | `https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html`                                      | Central control hub                          |
| 2   | **TMAR Web App** (local) | `http://localhost:5501/TMAR-Accrual-Ledger.html`                                                                   | Development (stable origin for localStorage) |
| 3   | **TMAR Live Workbook**   | `https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ/edit`                         | System of record (~52 tabs)                  |
| 4   | **GAS Web App**          | `https://script.google.com/macros/s/AKfycbzpeegvE52lvqCTMyKrsdaa_4JFfjM6MQrsJkU8zb17fkUJzPRasUU0fjONdaHkM5dh/exec` | Bridge: HTML ↔ Sheets                        |
| 5   | **GAS Editor**           | `https://script.google.com/u/0/home/projects/1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr/edit`       | Backend source                               |
| 6   | **Freeway 2025 Archive** | `1kbulI33th8uOmrumj7RkiJ8aqZs48gqzujrXUmNRjk8`                                                                     | Read-only legacy                             |

---

## 📊 Google Sheet Tab Inventory (52+ tabs)

### Account Spine
| Tab | Key Columns | Join Key |
|-----|------------|----------|
| Master Register | 29 cols (A–AC) | MR-NNN |
| Master Register Archive | 29 cols | Dedup quarantine |
| Account Entities | Entity metadata | — |
| CoA (Chart of Accounts) | GAAP account codes | — |
| Principal Register | Bank routing/account numbers | — |

### Ledgers
| Tab | Key Columns | Join Key |
|-----|------------|----------|
| Transaction Ledger | 16 cols | Date/Vendor |
| Trust Ledger | 8 cols | Asset |
| Acct Ledger | 16 cols | EIN |
| BOA Cash Flow | 8 cols | Month |
| PNC Cash Flow | 8 cols | Month |

### Creditors & 1099
| Tab | Key Columns | Join Key |
|-----|------------|----------|
| Creditor Registry | 28-creditor master | EIN / S-NNN |
| Creditor Checklist | 20-subset enriched | EIN / T-NNN |
| FWM — Creditor Detail | 28-creditor detail | EIN / S-NNN |
| FWM — Forms Checklist | Form tracking | EIN |
| 1099 Filing Chain | 15 cols, 3-layer uplift | EIN |
| 1099 Filings | Filing detail | EIN |
| Forms & Authority | 13 cols | Form type |
| Proof of Mailing | 14 cols, certified mail log | MAIL-NNN |

### Documents
| Tab | Key Columns | Join Key |
|-----|------------|----------|
| Document Registry | PC FileCabinet scan | DOC-NNNN |
| Document Inventory | Separate catalog | ⚠️ DOC-NNNN collide |

### Tax
| Tab | Key Columns |
|-----|------------|
| W-2 & Income Detail | Box, Description, Amount |
| Schedule A | Itemized deductions |
| 1040 Submissions | Filing history |
| Tax Strategy | Free-form |

### System (Hidden)
| Tab | Purpose |
|-----|---------|
| _Settings | Active Year, Last Gap Scan |
| _Validation | Dropdown lists |
| _SyncMeta | Sync state tracking |
| _YearData | Year-specific config |

### Trust Binder
Emoji-prefixed: 📋 HUB INDEX · 📒 General Ledger · 📊 Corpus & M-2 · …

### Credentials & Personal
| Tab | Purpose |
|-----|---------|
| Website Accounts | Platform logins (no passwords — stripped at API) |
| Contacts | Address book |
| Principal Register | Bank routing/account numbers |

---

## 🔧 GAS Endpoints (SyncCenter.gs doGet)

| Action | Method | Auth | Returns |
|--------|--------|------|---------|
| `ping` | GET | None | `{status:'ok'}` |
| `pullAccounts` | GET | Key required | Master Register |
| `pullTransactions` | GET | Key required | Transaction Ledger |
| `pullObligations` | GET | Key required | Household Obligations |
| `pull1099` | GET | Key required | 1099 Filing Chain |
| `pullValidation` | GET | Key required | _Validation lists |
| `pullChartOfAccounts` | GET | Key required | GAAP CoA |
| `pullReceivables` | GET | Key required | A/R data |
| `pullJournalEntries` | GET | Key required | Journal |
| `pullPrincipalRegister` | GET | Key required | Bank routing/account numbers |
| `pullContacts` | GET | Key required | Contacts |
| `pullWebsiteAccounts` | GET | Key required | Website logins (no passwords) |
| `listSheetTabs` | GET | Key required | Tab names |
| `listWorkbookTabs` | GET | Key required | All workbook tabs |
| `pullWorkbookSheets` | GET | Key required | Selected tabs as JSON |
| `pullRawTab` | GET | Key required | Raw tab data |

**Auth note (2026-07-31):** Added `checkApiKey_()` gate on all actions except `ping`. Key passed as `?key=<TMAR_API_KEY>` or `{key:'...'}` in POST body. Key stored as Script Property `TMAR_API_KEY`, never in source.

---

## 📁 GAS Backend Files

| File | Purpose |
|------|---------|
| `SyncCenter.gs` | Web App doGet/doPost, TMAR_CONFIG, all push/pull |
| `Code.gs` | onOpen() menu, formatting, CLAUDE.md Project Overview |
| `TMARBridge.gs` | Financial summary, account/transaction CRUD |
| `GUIFunctions.gs` | Dialog/sidebar launchers, data queries |
| `TMAREngine.gs` | Core calculation engine |
| `ImportRegistryScan.gs` | FileCabinet scan → Document Registry (mints DOC-NNNN) |
| `DuplicateAnalyzer.gs` | Dedup → Master Register Archive |
| `TabConsolidationAudit.gs` | Tab audit/compare/dedup/registry promotion |
| `ScanDriveFileCabinet.gs` | Drive FileCabinet scanner |
| `CreditReportImport.gs` | Syrina credit report import |
| `PopulateProofOfMailing.gs` | Auto-populate mail log |
| `PopulateValidation.gs` | Validation list population |
| `FormattingComplement.gs` | Tab colors, data validation, conditional formatting |
| `TMAR_AestheticsAndAudit.gs` | Health audit + aesthetics |
| `TransactionLedgerTrackingFix.gs` | Ledger tracking fixes |
| `ReconcileCrossFill.gs` | Capture-once propagation (in progress) |
| `RemoveArchiveBanner.gs` | One-shot cleanup |
| `ExecuteCleanup.gs` | Cleanup execution |
| `addFillingPackage2025.gs` | 2025 filing package |
| `DocumentRegistryTrigger.gs` | Document registry triggers |

### GAS HTML Dialogs
`AddAccount.html` · `BillOfExchange.html` · `ControlPanel.html` · `Dashboard.html` · `DocumentGenerator.html` · `EINVerifier.html` · `GAAPInterface.html` · `ImportRegistryScanUI.html` · `ReconcileCrossFillUI.html` · `E-Longmire Estate — Tax Accounting System.html`

---

## 🧠 Claude Code Infrastructure

### .claude/
```
.claude/
  settings.json / settings.local.json
  docs/          ← Instruction docs (loaded on demand)
    api-patterns.md
    testing-conventions.md
    domain-models.md
    deployment.md
    gas-patterns.md
    ledger-calculation-rules.md
    data-topology.md
  skills/        ← Reusable Claude Code skills
    fiduciary-doc-factory/   ← v2.1.0 (GPO 2016 + Weiss)
    gen-test/
    mr-row/
    proof-of-mailing-tracker/
  agents/        ← Shared agent definitions
    ledger-guardian/
    llm-security-reviewer/
  hooks/         ← Pre/post tool-use hooks
  commands/      ← Custom slash commands
```

### ClaudeSkills/ (Vault-level skill definitions)
| # | Skill | Directory | Triggers |
|---|-------|-----------|----------|
| 1 | Vault Health & Maintenance | `vault-health/` | vault health, cleanup, security |
| 2 | Legal Document Gen Pipeline | `legal-doc-gen/` | create trust, affidavit, filing |
| 3 | Course Content & Knowledge Mgmt | `course-content-mgmt/` | YTubiversity, transcript, video |
| 4 | Financial Document Processing | `financial-doc-processing/` | Master Register, gap report, 1099 |
| 5 | Vault Navigation & Search | `vault-navigation/` | find, search, dataview query |
| 6 | Template System Management | `template-management/` | Templater, folder mapping, QuickAdd |
| 7 | TMAR Infographic Generator | `tmar-infographic-generator.md` | Excalidraw diagrams, GUI visuals |
| 8 | YAML Frontmatter Auto-Fixer | `yaml-frontmatter-fixer.md` | YAML repair, clipboard paste |

### ClaudeSkills/ additional
`cacfp-workbook-manager.md` · `coa-1099b-validator.md` · `iris-1099b-generator.md` · `ClaudeSkills.md` · `Creating Word Docx.md`

---

## 📜 Scripts Catalog

### Node.js (`scripts/`)
| Script | Purpose |
|--------|---------|
| `sync-credentials.mjs` | Pull Website Accounts from GAS → FileCabinet/Credentials/master-reference.md |
| `gen-vault-index.mjs` | Regenerate VAULT_INDEX from live FileCabinet |
| `parity-sync.mjs` | GAAP parity sync between GAAP-source.html and TMAR-Accrual-Ledger.html |
| `_add-guides.mjs` / `_add-guides2.mjs` | Guide generators |
| `_ui-verify.mjs` | UI verification |

### Python (`scripts/filecabinet-build/`)
FileCabinet registry scanner — `scan_filecabinet_registry.py`

### Inspector (`scripts/tmar-inspector/`)
TMAR runtime inspection toolkit

### Other Root Scripts
| File | Purpose |
|------|---------|
| `cloudflare-worker-v2.js` | CORS proxy worker (deploy to Cloudflare) |
| `cors-proxy-worker.js` | Legacy CORS proxy |
| `tmar-key-manager.js` | Standalone floating API key manager panel |
| `tmar-agents-registry.js` | Agent registry definitions |
| `tmar-updater.js` | Auto-updater (replaces inline parity banner) |
| `tmar-corrections.gs` | Sheet corrections |
| `tmar-theme.gs` | Theme application |
| `tt_block.js` | Transcript Transformer block |
| `check_errors.py` · `portal_pruner.py` · `md2github_export.py` | Utilities |

### EntityVerifier-v2/
`EntityVerifier.gs` · `EntityVerifierCache.gs` · `EntityVerifierConfig.gs` · `EntityVerifierDBA.gs` · `EntityVerifierGenealogy.gs` · `EntityVerifierPreflight.gs` · `EntityVerifierSources.gs` · `EntityVerifierUI.html`

---

## 🏗️ HTML App Architecture

### Agent System
- **OpenClawRuntime SYPHER-7.8-HARDLOCK:** 19 agents (GAAPCLAW Master + 6 CPA firms × 3 sub-agents)
- **EON / AP chat agents:** 24+ legal-firm specialists (Document Creation, Format, Trust, UK/FRS 102, Writs, Amicus, Presumption Killer, Jurisdictional, Biblical Scholar, …)
- **Dispatcher:** `aiHubAskAgent` → `callLLMStream()` (v7.1, multi-provider SSE/NDJSON)
- **Memory:** `GCMemory` (IndexedDB, 60+ keyword scoring) + `MEM0` proxy
- **Guard:** `HARD_LOCK` (frozen output sanitizer) + `SYPHER / PRESUMPTION-KILLER` gate

### Injected Knowledge
`DOCUMENT_KNOWLEDGE` (injected via `buildFullSystemPrompt`):
- `fiduciaryDocFactory` — v2.1.0 document standard
- `ledgerTopology` — data-relationship map
- `taxFramework` · `nolClassification` · `arbitrationFramework`

### Modules
- **Document Creator** — drafts filing-ready instruments (Profile-B export, JSZip .docx)
- **Digital File Cabinet** (`page-docs`) — Vault Browser, Sheets Data, Local Docs
- **Smart Import** (`tmarImport`) — one-click entity/account/asset/SPV import
- **Gemini Neural TTS** — realistic voice (CORS-allowed, PCM→WAV)
- **🔐 Vault** — AES-256-GCM / PBKDF2(100k) key store
- **SPV Module** — Special Purpose Vehicle tracking
- **UK Accounting** — FRS 102 / IFRS
- **Tax Estimator** — IRC §55 CAMT, §4501 buyback
- **Entity Verifier v2** — EIN/entity validation
- **Sync Center** — bidirectional GAS sync (push/pull)

### Function Reference Cards (22/22 implemented)
See [[Function Reference Cards Index]] — covers Chat & Communication (3), Memory & Storage (3), Settings (3), Voice & Speech (4), Utilities (4), Key Management (1), Digital File Cabinet (4).

---

## 📚 Documentation Index

### Core Docs (Repo Root)
| Doc | Covers |
|-----|--------|
| [[README]] | Full project overview, surfaces, deployment, roadmap |
| [[CLAUDE]] | Claude Code instructions, repo map, key rules |
| [[docs/TMAR-ACCRUAL-LEDGER-DESIGN]] | Design decisions, visual identity, tab structure |
| [[docs/TMAR-Implementation-Status]] | Architecture evolution, schema versions |
| [[docs/TMAR-User-Manual]] | User guide |
| [[docs/TMAR WebApp Details & 'push pull' data flow maps]] | GAS Web App URL, data flow diagrams |
| [[docs/Universal Accrual Ledger App]] | App overview |
| [[docs/DEPLOYMENT_GUIDE]] | GAS deploy, Apps Script ID |
| [[docs/GUI_GUIDE]] | GUI usage guide |
| [[docs/UNIFIED_MENU_README]] | Unified menu system |
| [[docs/DROPDOWN_VALUES_GUIDE]] | Dropdown configuration |
| [[docs/DUPLICATE_ANALYZER_GUIDE]] | Dedup tool guide |
| [[docs/GAAP_INTERFACE_GUIDE]] | GAAP interface |
| [[docs/JAVASCRIPT_SETUP_GUIDE]] | JS setup |
| [[docs/BILL_OF_EXCHANGE_GUIDE]] | BOE processing |
| [[docs/Start TMAR Servers & Provide Shareable URL]] | Server startup |
| [[docs/How to interact with previews]] | Preview workflow |
| [[docs/MENU_TROUBLESHOOTING]] | Menu debugging |
| [[docs/PgSources]] | Upstream page sources |
| [[docs/GAAP-SOURCE-ASSOCIATION-CHART]] | GAAP source mapping |
| [[docs/Templater User Script (JS) Functions]] | Templater JS API |
| [[docs/TMAR&Vault Preview]] | Vault integration review |

### GSheet/ Docs
| Doc | Covers |
|-----|--------|
| `GSheet/README` · `GSheet/README 1` | Project structure, tab inventory, GAS functions |
| `GSheet/Google-Sheets-Master-Account-Register-Guide` | Sheet usage guide |
| `GSheet/Google-Sheets-Master-Account-Register-Setup` | Initial setup |
| `GSheet/Quick-Reference-Adding-Subscriptions` | Subscription workflow |
| `GSheet/Desktop-Tax-Files-Analysis` | Tax file analysis |
| `GSheet/Financials_Reorganization_Plan_FreewayMechanics` | FWM reorganization |
| `GSheet/Syrina Credit Report Account Import` | Credit report import |
| `GSheet/TMAR GAS additions Phase2` | GAS Phase 2 additions |
| `GSheet/TMAR-Implementation-Status` | Implementation tracking |
| `GSheet/Wimberly Unified Master Register — Google Sheets Formatting` | Formatting reference |

### .claude/docs/
| Doc | Covers |
|-----|--------|
| `data-topology.md` | Full data-relationship map (join keys, canonical sources) |
| `domain-models.md` | Master Register 29-col schema, Account/Transaction models |
| `ledger-calculation-rules.md` | Balance/income/verification rules |
| `api-patterns.md` | LLM call stack, CORS, provider routing, TTS |
| `gas-patterns.md` | GAS backend conventions |
| `deployment.md` | Deploy conventions |
| `testing-conventions.md` | Test patterns |

### docs/ (Human Docs)
`Bank_Statement_Extraction_Guide.md` · `Bank_Statement_Extractor_CHANGELOG.md` · `Extractor_API_Reference.md` · `GAAPCLAW-Parity-Implementation.md` · `LLM Provider Status.md` · `TMAR-IRS-Autofill-Revision-2026-05-20.md` · `TMAR_Context.md` · `TMAR_Handoff_v3.md`

### Prompts/
[[TMAR Living GSheet — Claude Code Project Prompts v2]] — Development prompts for Claude Code

---

## 🔗 Cross-Reference: Join Keys

| Key | Format | Connects |
|-----|--------|----------|
| **EIN** | `NN-NNNNNNN` | Master Register ↔ Creditor Registry ↔ Checklist ↔ FWM — Creditor Detail ↔ 1099 Filing Chain |
| **DOC-NNNN** | `DOC-0001` | Document Registry (canonical PC scan). ⚠️ Document Inventory uses same numbers — different files |
| **MR-NNN** | `MR-001` | Master Register row key (account spine) |
| **Account #** | varies | Master Register ↔ cash-flow tabs ↔ Checklist |
| **T-NNN / S-NNN** | creditor tag | Two numbering schemes over same creditors — reconcile by EIN, not tag |
| **MAIL-NNN** | `MAIL-001` | Proof of Mailing ↔ FileCabinet 04-Taxes/Receipts/Postal/ |
| **WA-NNN** | `WA-001` | Website Accounts row key |

---

## 📂 FileCabinet Mapping

| Dir | Contents |
|-----|----------|
| `00-Receipts-Invoices/` | E-Comm receipts |
| `01-Trust-Instrument/` | Trust instruments, bank account opening |
| `02-Recorded-Documents/` | Recorded legal docs |
| `03-Banking/` | Bank statements (BOA, Truist) |
| `04-Taxes/` | Tax returns, receipts, postal proofs |
| `05-Labels/` | Label templates (OL875-07, postal indicia) |
| `06-Account-Register/` | 31 creditor folders with demand/affidavit docs |
| `07-Source-Documents/` | Generated affidavits, source materials |
| `08-Ledgers/` | Ledger files |
| `09-Valuations/` | Asset valuations |
| `Credentials/` | **NEW** — synced from GAS Website Accounts tab |
| `Digital-Binders/` | TMAR.xlsx, TSV exports, COA, credit reports |
| `Estates/` | Trust packages (Dynasty, Virtuous Veteran) |
| `HHHW/` | Family estate docs |
| `Fidelity/` · `Vanguard/` · `Webull/` | Brokerage docs |
| `Business/` · `Courts/` · `Employment/` | Business/court/employment docs |
| `Forms-Library/` · `Legal-Reference/` | Reference libraries |
| `Archive/` · `_Unsorted/` | Archive + unsorted |

---

## 🎨 Vault Standards (from YTubiversity Vaults)

| Setting | Value |
|---------|-------|
| Theme | Cobalt Peacock (dark) |
| Font | Rubik (monospace + text + interface) |
| Base font size | 17px |
| Accent color | `#6946b9` |
| CSS snippet | `hideproperties` |

### Core Plugins (32)
`advanced-canvas` · `dataview` · `folder-notes` · `obsidian-icon-folder` · `meta-bind` · `metadata-menu` · `minimal-settings` · `style-settings` · `quickadd` · `templater` · `linter` · `recent-files` · `local-rest-api` · `periodic-notes` · `homepage` · `brat` · `convert-url-to-iframe` · `custom-frames` · `media-extended` · `oz-image` · `buttons` · `cmdr` · `js-engine` · `textgenerator` · `text-extractor` · `folderbridge` · `table-editor` · `hermes-console` · `tasks` · `mind-map` · `metaedit` · `html-plugin` · `docxer`

### Vault Settings
- `alwaysUpdateLinks`: true
- `newFileLocation`: folder → `00 VaultIndex/`
- `attachmentFolderPath`: `06 Toolkit/Images`
- `showLineNumber`: true
- `readableLineLength`: true
- `trashOption`: system

---

## 🚀 Quick Actions

| Task | Command / Location |
|------|--------------------|
| Start local dev server | `python -m http.server 5501` (or `start-local-server.bat`) |
| Run tests | `npm test` |
| Push GAS code | `cd gas && clasp push --force` |
| Redeploy GAS Web App | Apps Script editor → Deploy → Manage deployments → New version |
| Sync credentials | `node scripts/sync-credentials.mjs` (needs `TMAR_GAS_API_KEY` env var) |
| Regenerate vault index | `node scripts/gen-vault-index.mjs` |
| Parity sync | `node scripts/parity-sync.mjs` |
| Deploy HTML to Pages | `git push origin master` (auto-deploys in ~30s) |
| Open live app | https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html |
| Open GAS editor | https://script.google.com/u/0/home/projects/1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr/edit |

---

## 📈 Version History

| Version | Date | Highlights |
|---------|------|------------|
| **4.1** | 2026-06-27 | Ledger Data Topology injected into all agents; workbook consolidation; VAULT_INDEX v2 |
| **4.0** | 2026-06-17 | fiduciary-doc-factory v2.1.0; Gemini Neural TTS; UCC 9-210 demand template |
| **3.9** | 2026 | Clear + file upload across 24 AP agents |
| **3.8** | 2026-04-07 | tmar-key-manager.js; vault→key injection; Digital File Cabinet 3-tab |
| **3.7** | 2026 | tmar-updater.js; Cloudflare Worker v2; EON portal fixes |
| **3.5** | 2026-04-05 | 14 EON legal agents (25 total); LEGAL FIRMS sidebar |
| **3.4** | 2026-04-04 | GAAPCLAW Master agent; OpenClaw page; CAMT + buyback tax |
| **3.3** | 2026 | SPV module; UK Accounting (FRS 102/IFRS); Groq/Cerebras/OpenRouter |
| **3.0** | 2026-03-14 | GCMemory (IndexedDB); SYPHER-7.8-HARDLOCK; callLLMStream v7.1 |
| **2.0** | 2026-03-09 | 17 custom functions + reference cards + audit (246 fns) |
| **1.0** | 2026-03-08 | 6 AI agents + Claude API; Research HUB |

---

## 🔐 Security Notes

- **API keys** live only in localStorage / AES-256 vault — never committed
- **GAS API key** (`TMAR_API_KEY`) stored as Script Property, passed as `?key=` / `{key:}`
- **CORS proxy** mandatory for browser→LLM calls — never call Anthropic directly from Pages
- **PII** in public Pages source masked to last-4 (e.g., EIN `**-***9588`)
- **Passwords** stripped from Website Accounts API — never transmitted
- **Exec URL** in public repo — API key gate added 2026-07-31

---

*This index is regenerated by Hermes Agent (law profile). Update when surfaces, scripts, or endpoints change.*
