## Who You're Talking To

**SLiCK** — operator of CupsUp (mobile coffee service) and related entities. Strong fluency across Python, Google Apps Script, PowerShell, Node.js, Obsidian automation. Dual-machine environment: MacBook Pro (`/Users/animatedastronaut`) + Windows PC (`C:\Users\rhyme`). Communication rules: direct, no pleasantries, lead with the answer, complete runnable code only, full execution rights granted, no per-step permission requests, assume competence.

---

## What This Project Is

The **TMAR (Trust Master Account Register)** system — a comprehensive legal document generation, trust administration, and IRS information return filing platform operating within a private trust framework governed by Virginia Trust Code, GPO Style Manual 2016, and related legal standards. It spans a browser-based GUI, a Google Sheets GAS backend, a dual-machine Obsidian LDG vault, and a suite of Python/GAS automation tools.

---

## Live Remote Infrastructure

| Resource | URL / ID |
|---|---|
| **Live app (GitHub Pages)** | `https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html` |
| **GitHub repo** | `https://github.com/SlickVicious/TMAR-Accrual-Ledger` |
| **Google Sheet (GAS backend)** | `https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ` |
| **GAS Script ID** | `1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr` |
| **Audit Dashboard** | `https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR_Audit_Dashboard.html` |
| **System Status Dashboard** | `https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-System-Status-Dashboard.html` |
| **Cloudflare CORS proxy** | Deployed to `workers.cloudflare.com` — required for browser → Anthropic API calls from GitHub Pages. Worker script: `cors-proxy-worker.js` in repo root. URL saved in app Settings → API Keys → CORS Proxy URL. |

**Git workflow:**

```
Mac → git add/commit/push origin master → GitHub Pages auto-deploys
PC  → git pull origin master → make changes → git add/commit/push
```

Note: The **Obsidian vault git remote is not configured** (vault-local repo only — `git push` from vault dir will fail). The TMAR repo at GitHub IS a live remote and pushes work normally from the `gas/` and HTML working directories.

---

## Filesystem Topology

### Vault Lineage

PDKB (original, ~5K files) → Proper Person Processes (curated fork) → **Legal Document Generator** (v1, spaces in path) → **Legal-Document-Generator** (v2, hyphens, **current active vault**)

Legacy vaults (PDKB, PPP) are archived to `D:\_Archive\` as of April 2026. They are no longer on `C:`.

### Windows PC — 7 Directories

| Directory | Role | Key contents |
|---|---|---|
| `C:\Users\rhyme\Documents\Legal-Document-Generator\` | **LDG v2 Obsidian vault** (active) | TMAR dev tree, Claude Skills, GAS project, templates, Dev Sessions, knowledge reference. `.obsidian/` configured. |
| `C:\Users\rhyme\Documents\TMAR-Accrual-Ledger\` | **TMAR GitHub repo clone** (VSC project) | Live app HTML (2.9 MB), GAS deployment source, audit artifacts, Function Reference Cards (17 cards), entity verifier, CORS proxy, guides. Has `.clasp.json` in `gas/`. |
| `C:\Users\rhyme\Desktop\FileCabinet\` | **Personal records vault** | Tax returns by year (2015–2025), credit reports, estate docs, status correction affidavits, FWM course materials, business entity filings |
| `C:\Users\rhyme\Documents\_HH Classes\` | **Private law course content** | Trust templates, status correction, treasury direct, FOIA, bankruptcy, mortgage discharge, canon law |
| `D:\_ScriptSalad\` | **Dev toolkit / scratch pad** | Python/GAS/PowerShell scripts, MCP servers, Claude artifacts, price targets. Contains older GAS iterations (e.g. `BankOfAmericaCashFlow.gs`) |
| `D:\_Archive\` | **Cold storage** | `PDKB_vault_20260405.zip` (886 MB), `ProperPersonProcesses_vault_20260405.zip` (~4 GB) |
| `C:\Users\rhyme\Documents\Proper Person Processes\` | **LEGACY — archiving in progress** | PPP vault. Critical reference docs already extracted to `FileCabinet\Legal Reference\`. Delete after zip is verified. |

### Mac — Parallel Paths

| Resource | Path |
|---|---|
| Mac vault | `/Users/animatedastronaut/Documents/Legal Document Generator/` (spaces — v1 naming) |
| FileCabinet 2 | `/Users/animatedastronaut/Downloads/FileCabinet 2/` |
| PNC statements | `/Users/animatedastronaut/Downloads/PNC_Documents/` |
| clasp binary | `/Users/animatedastronaut/.npm-global/bin/clasp` |

### Key Paths Within LDG v2 Vault (Windows)

| Path (relative to vault root) | Contents |
|---|---|
| `06 Toolkit/Dev/SS Master Acct Reg/TMAR/` | Main TMAR dev directory |
| `06 Toolkit/Dev/SS Master Acct Reg/TMAR/gas/` | GAS deployment source (10 `.gs` + 7 `.html`). Has `.clasp.json`. |
| `06 Toolkit/Dev/SS Master Acct Reg/TMAR/ClaudeSkills/` | 15 skill files (11 vault-native + 4 project skill stubs) |
| `06 Toolkit/Dev/SS Master Acct Reg/TMAR/Function_Reference_Cards/` | 17 individual `.md` function reference cards |
| `06 Toolkit/Dev/SS Master Acct Reg/TMAR/Prompts/` | Claude Code prompts (e.g. `CC_PROMPT_DocCreator_3Templates.md`) |
| `06 Toolkit/Scripts/Tax_Processing/` | 25 Python scripts (bank parsers, 1099-B generators, GAS data builders) |
| `06 Toolkit/Scripts/Tax_Processing/_logs/` | 24 debug/deploy log files |
| `06 Toolkit/Scripts/GAS/` | Standalone GAS scripts + `TMAR_AestheticsAndAudit.gs` source copy |

### FileCabinet Structure (Windows)

| Path | Contents |
|---|---|
| `Desktop\FileCabinet\Taxes\` | Tax reference docs (IRIS reference XLSX, IRS correspondence, FOIA analysis, financial whitepaper) |
| `Desktop\FileCabinet\Taxes\Forms\` | **Finals only**: 2 paired CSVs (Clinton + Syrina), 8 IRIS year templates, IRS form PDFs, recipient template |
| `Desktop\FileCabinet\Taxes\Forms\_Archive\` | 30 archived 1099-B iterations (TEST_, CoA_, intermediate paired files) |
| `Desktop\FileCabinet\Taxes\Clint taxes\` | Per-year tax dirs (2015–2025), bank statements (BOA, Fidelity, Vanguard, Webull), pay stubs, expenses |
| `Desktop\FileCabinet\Taxes\Syrina\` | Per-year tax dirs (2022–2024), Capital One/PNC statements, credit reports, pay stubs, recipient imports |
| `Desktop\FileCabinet\Taxes\parsed_transactions\` | Combined + per-bank CSV exports (ALL, BOA, CapOne, PNC), annual summary JSON |
| `Desktop\FileCabinet\Estates\` | Estate records: Clints/, Chefs/, Drafts/, Records/ |
| `Desktop\FileCabinet\Business Ents\` | DBA filings, Domivia, sole prop docs |
| `Desktop\FileCabinet\Status\` | Status correction affidavit scans |
| `Desktop\FileCabinet\Courts\` | Commerce court attachments |
| `Desktop\FileCabinet\FWMclassDocs\` | Freeway Mechanics course materials, bootcamp workbooks, trust templates |
| `Desktop\FileCabinet\Legal Reference\` | GPO Style Manual 2016, Gilbert's Law Summaries, Weiss Trustee Handbook + 34 trust reference PDFs (89.7 MB) |

**MCP tools available:** `Filesystem:` (Windows direct R/W), `Windows-MCP:PowerShell` (Windows shell), `Control your Mac:osascript` (Mac shell)

**osascript PATH required for clasp/npm (Mac):**

```bash
export PATH='/Users/animatedastronaut/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:$PATH'
```

---

## Application Architecture

### Web App — `TMAR-Accrual-Ledger.html`

- **51 tabs / 12 groups** — Core Accounting, Tax & Compliance, Trust Estate, Operations, Reports & Intelligence, Tools, RedressRight Libraries, Verification, Data Integration, PDKB Tools
- **211/211 GUI elements verified** (100%) — tracked in System Status Dashboard
- **246/246 functions verified** (100%) — tracked in Audit Dashboard (`audit_report.json` v2)
- **17 custom functions** documented in `Function_Reference_Cards/` (17 individual `.md` cards)
- **Document Creator:** 32 templates / 3 optgroups deployed; 4 Package Builder presets (Trust Formation, IRS Compliance, Entity Verification, Full Filing)
- **Tech stack:** Vanilla JS ES6+, Bootstrap 5, Web Crypto API (AES-256-GCM vault, PBKDF2 key derivation), Web Speech API, IndexedDB (GCMemory engine), localStorage

### AI Agent Layer

- **19 agents total:** GAAPCLAW Master + 6 CPA specialist firms × 3 sub-agents each
- **6 named agents:** Legal Expert, Tax Strategist, Accounting Expert, Trust Administrator, Arbitration Expert, Corporation Specialist
- **Runtime:** OpenClawRuntime SYPHER-7.8-HARDLOCK — 3-phase boot, frozen object, rogue injection blocked
- **Memory:** GCMemory IndexedDB engine — `add()`, `addPdf()`, `search()`, `clearAll()`; 60+ legal/financial keywords; auto-prune at 500 records; MEM0 proxy always enabled
- **Streaming:** `callLLMStream v7.1` — multi-provider SSE/NDJSON; Anthropic, OpenAI-compat, Ollama, Ernie fallback; 15-min AbortController
- **Model:** `claude-sonnet-4-20250514` (update string when model changes)
- **CORS:** All Anthropic calls route through Cloudflare Worker — required from GitHub Pages context

### Google Apps Script — `gas/`

**Windows current state: 10 `.gs` files + 7 `.html` files**

| File | Status | Notes |
|---|---|---|
| `Code.gs` | Live | 137KB main; contains `onOpen()` menu registration |
| `FormattingComplement.gs` | Live | Audited: 42 OK, 0 Fail, 1 Warn |
| `SyncCenter.gs` | Live | GAS ↔ GUI sync bridge |
| `TMARBridge.gs` | Live | Data bridge layer |
| `GUIFunctions.gs` | Live | GUI helper functions |
| `CreditReportImport.gs` | Live | TransUnion credit report import |
| `DuplicateAnalyzer.gs` | Live | Duplicate detection |
| `ExecuteCleanup.gs` | Live | Cleanup operations |
| `PopulateValidation.gs` | Live | Field validation |
| `TMAR_AestheticsAndAudit.gs` | **On disk — push unconfirmed** | 35KB; row-level color coding, 16-category legend, `_HealthAudit` hidden tab. Present in vault + repo `gas/` dirs. Not confirmed pushed via clasp. |

**Mac-only files (not yet on Windows — requires `git pull`):**
- `CapitalOneCashFlow_CSV.gs` (complete)
- `BOACashFlow.gs` (stub)
- `PNCCashFlow.gs` (stub)
- `FidelityCashFlow.gs` (stub)

**Also in `D:\_ScriptSalad\_GAS_\`:** `BankOfAmericaCashFlow.gs` — may be more complete than the Mac stub. Verify before syncing.

### Claude Skills Suite

**15 files** in both `ClaudeSkills/` directories (vault + repo), synchronized:

| Skill | Type | Purpose |
|---|---|---|
| `iris-1099b-generator` | Project skill (stub) | IRIS-compliant 1099-B CSV generation; paired two-form methodology |
| `coa-1099b-validator` | Project skill (stub) | Validate and auto-fix 1099-B CSVs for CoA upload |
| `cacfp-workbook-manager` | Project skill (stub) | CACFP meal program tracking for Boys & Girls Club |
| `obsidian-vault-manager` | Project skill (stub) | Vault health, orphan detection, link repair |
| `vault-health-maintenance` | Vault file | Vault-wide health monitoring |
| `legal-doc-gen-pipeline` | Vault file | LDG template pipeline management |
| `course-content-knowledge-mgmt` | Vault file | Course content organization |
| `financial-doc-processing` | Vault file | Financial document processing |
| `vault-navigation-search` | Vault file | Vault search and navigation |
| `template-system-management` | Vault file | Template CRUD and versioning |
| `tmar-infographic-generator` | Vault file | Infographic generation from TMAR data |
| `yaml-frontmatter-fixer` | Vault file | v2.0.0 — YAML frontmatter repair using `>-` block scalar |
| `Creating Word Docx` | Vault file | Word document generation reference |
| `ClaudeSkills` | Index | Skills directory index |
| `LDG Vault Skills Suite — Index` | Index | Full suite index |

---

## Status Board

### ✅ Done

| Item | Details |
|---|---|
| PNC deposit analysis | 291 deposits across 25 statements (Mar 2024–Mar 2026); $134,800.65 total. Output: `PNC_Documents/PNC_x0672_Deposits.xlsx` |
| Recipient reference table | 25 rows × 13 cols. Account # and Opened On blank (yellow). Output: `FileCabinet 2/Taxes/IRS Files & FORMS/fTemplates/Recipient_Table_Full.xlsx` |
| IRIS CSV templates | 36 IRIS-compliant CSV templates generated as `iris_templates.zip` |
| Syrina 1099-B paired CSV | `Syrina_Wimberly_1099B_2025_paired.csv` — 37 paired rows (74 data lines), ~20 payer entities. Recipient TIN masked `XXX-XX-XXXX`. Box pattern: Form 1 = G/Y/Y, Form 2 = N/N/N. |
| Clinton 1099-B generator | `generate_1099b_final.py` — 25 payer entities. Recipient TIN = empty string. |
| FormattingComplement.gs | Deployed, audited: 42 OK, 0 Fail, 1 Warn |
| Claude Skills suite | 15 files deployed and synced (vault + repo) |
| AI Tools for Obsidian | Installed both machines; Mac PATH bug fixed |
| TMAR GUI verification | 211/211 elements, 246/246 functions, 17 Function Reference Cards |
| **File organization (Apr 2026)** | 30 1099-B iterations archived; 25 scripts + 24 logs moved to vault; PDKB archived + deleted (1.07 GB freed); repo cleaned (2.8 MB stale artifacts removed); AestheticsAndAudit.gs synced to both deployment dirs; 37 trust reference PDFs rescued from PPP to FileCabinet |

### 🔧 In Progress

| Item | Details |
|---|---|
| PPP vault archive | Compression running → `D:\_Archive\ProperPersonProcesses_vault_20260405.zip`. Delete original after verification. |
| `TMAR_AestheticsAndAudit.gs` | 35KB script in vault + repo `gas/` dirs. **Clasp push from Mac not confirmed.** |
| Document Creator expansion | Prompt written (`CC_PROMPT_DocCreator_3Templates.md`): 16 new templates, 2 new optgroups, 3 new Package Builder presets. Would bring totals to 48 templates / 5 optgroups / 7 presets. **Not yet executed.** |
| PDKB flowchart extraction | 5 of 14 done; 9 remaining |

### 🚫 Blocked

| Item | Blocker |
|---|---|
| IRIS 1099-B submission | Recipient TIN blank in both principals' CSVs. One principal's legal last name also placeholder. |
| Git sync Mac → Windows | Git on Windows hangs (credential prompt). Fix auth, then `git pull` to get Mac-side GAS files. |

### 📋 Queued

| Item | Notes |
|---|---|
| Extract `iris_templates.zip` → staging | Then integrate into `DocumentGenerator.html` |
| Complete GAS cash flow stubs | `BOACashFlow.gs`, `PNCCashFlow.gs`, `FidelityCashFlow.gs`. Check `D:\_ScriptSalad\_GAS_\BankOfAmericaCashFlow.gs` — may be more complete than Mac stub. |
| Fill Account # + Opened On | Yellow cells in `Recipient_Table_Full.xlsx`, 25 rows |
| GSheet catch-up | GSheets haven't been developed in parallel with other workstreams; still representative but lagging |

---

## Two Central Principals

All trust/filing work involves two principals. Names and TINs are in `Recipient_Data_Import_FILLED.xlsx`.

| Principal | CSV File | TIN Status | Rows |
|---|---|---|---|
| Clinton Wimberly IV | Generated by `generate_1099b_final.py` | Empty string — must populate | 25 entities, ~27 rows |
| Syrina S. Wimberly | `Syrina_Wimberly_1099B_2025_paired.csv` | Masked `XXX-XX-XXXX` — must populate | 20 entities, 37 paired rows |

One principal's legal last name and tax ID remain as manual-entry placeholders prior to IRIS submission.

---

## IRS 1099-B Filing Methodology

**Two-form-per-entity paired filing pattern:**

| Field | Form 1 | Form 2 |
|---|---|---|
| Box 6 — Reported to IRS | Gross proceeds (G) | Net proceeds (N) |
| Box 7 — Loss not allowed | Yes (Y) | No (N) |
| Box 12 — Basis reported to IRS | Yes (Y) | No (N) |
| Box 1d — Proceeds | Lower amount | Higher amount (reversed) |
| Box 1e — Cost basis | Proceeds × 10 | Lower amount |
| Box 4 — Federal withholding | — | 24% of Form 2 proceeds |

**Key rules:**
- IRIS portal template selection: "1099-B (For Stock or Debt Instrument)" — form type column value may need `1099-BS`
- Template field conventions override IRIS guide transcript text
- Box 6 and Box 12 remain checked on 2nd B forms per working template
- Manual entry chosen as filing method; 98-form reference workbook produced (Filing Reference, Payer Profiles, Box Rules)

---

## Standing Technical Rules

1. **Vault git ≠ repo git** — Obsidian vault has no remote; TMAR GitHub repo does and pushes normally
2. **Mac = clasp/deploy; Windows = active work** — never conflate filesystem paths. Windows vault uses hyphens (`Legal-Document-Generator`), Mac uses spaces (`Legal Document Generator`)
3. **Both machines have `.clasp.json`** in their respective `gas/` dirs
4. **GAS is always non-destructive** — new `.gs` files only; patch `onOpen()` minimally
5. **Windows PowerShell quirks:** Python stdout swallowed by CLIXML — write to file, read with `Get-Content`; UTF-8 without BOM: `New-Object System.Text.UTF8Encoding($false)`
6. **Obsidian YAML:** `>-` folded block scalar for description fields >80 chars; inline quoted strings break Properties parser
7. **GAS progress feedback:** sequential `toast()` only — `getUi().alert()` inside HTML dialog callbacks causes deadlocks
8. **Template beats guide text:** 1099-B IRIS template field conventions override the IRIS guide transcript
9. **CORS proxy is mandatory** for any Anthropic API call originating from the GitHub Pages hosted app
10. **Merged cells block filter creation** in GAS — downgrade to WARN in audit
11. **`filesystem:read_media_file` cannot read PDFs** — use `pdfplumber` via Mac `osascript`; for longer scripts, write to `.py` file then invoke with `do shell script "python3 /path/to/script.py 2>&1"`

---

## Tools & Environment Reference

**Languages/runtimes:** Python 3, Google Apps Script, PowerShell, Node.js, JavaScript

**Key platforms:** Google Sheets/GAS, GitHub Pages, Cloudflare Workers, Obsidian, IRS IRIS portal

**Obsidian plugins:** Dataview, Templater, Excalidraw, BRAT, AI Tools for Obsidian

**Deployment:** clasp (Mac: `/Users/animatedastronaut/.npm-global/bin/clasp`; Windows: `.clasp.json` present in `gas/` dir)

**MCP tools in use:** `Filesystem:` (read/write), `Windows-MCP:PowerShell`, `Control your Mac:osascript`

**Python libraries:** pdfplumber (PDF extraction), openpyxl/xlsxwriter (Excel), Jinja2 (templating)

**Legal references:** Virginia Trust Code, GPO Style Manual 2016, Gilbert's Law Summaries on Trusts, Weiss Concise Trustee Handbook

**Reference paths (Windows):**
```
C:\Users\rhyme\Desktop\FileCabinet\Legal Reference\GPO-STYLEMANUAL-2016.pdf
C:\Users\rhyme\Desktop\FileCabinet\Legal Reference\Gilberts Law Summaries On Trust.pdf
C:\Users\rhyme\Desktop\FileCabinet\Legal Reference\Weiss Concise Trustee Handbook- Carlton Weiss.pdf
C:\Users\rhyme\Desktop\FileCabinet\Legal Reference\Trust Books Articles Ref Docs\   (34 files, 89.7 MB)
```

> These were extracted from PPP vault before archival. Original PPP vault is compressed at `D:\_Archive\`.
