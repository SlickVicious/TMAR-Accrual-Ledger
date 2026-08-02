# TMAR Accrual Ledger — Claude Instructions

Single-file HTML legal/accounting portal + Google Apps Script backend + **Obsidian development vault**. GitHub Pages deployment. No build step for the HTML app.

> **⚠️ First file to load:** `VaultIndex.md` — the master ecosystem map. Surfaces, endpoints, script catalog, cross-references, and quick actions all indexed there. Load it before touching code.

## Repo Map

```
TMAR-Accrual-Ledger/          ← ALSO an Obsidian vault (open in Obsidian for visual nav)
  VaultIndex.md               🔑 MASTER ECOSYSTEM MAP — load first
  TMAR-Accrual-Ledger.html    3.4 MB — main app (246 functions, 19 agents, LLM streaming)
  tmar-transcript-transformer-v2.html
  TMAR-System-Status-Dashboard.html
  src/
    index.js                 entry point
    services/                AccountService, TransactionService, TMARService,
                             InvoiceService, PayrollService, SheetsService
    storage/LocalStorage.js  JSON serialization wrapper
    utils/StateManager.js    observer-pattern state management
    __tests__/               Jest/ESM tests (AccountService, StateManager, TMARService)
  gas/
    Code.gs                  onOpen() menu registration (137 KB)
    GUIFunctions.gs          all dialogs/sidebars + data query functions
    SyncCenter.gs            doGet/doPost web app endpoints + checkApiKey_() gate
    TMARBridge.gs            financial summary + account CRUD
    FormattingComplement.gs  tab colors, validation, conditional formatting
    *.html                   HtmlService UI pages
    .clasp.json              Script ID + rootDir
  docs/                      human docs — plans, handoff notes, guides (leave here)
  .claude/docs/              Claude instruction docs (load on demand)
  .claude/skills/            Claude Code skills (mr-row, gen-test, fiduciary-doc-factory)
  .github/                   GitHub Actions config
  ClaudeSkills/              custom skill definitions (markdown notes)
  .obsidian/                 Vault standards (theme, plugins, homepage) — TRACKED subset only
  .hermes/                   Hermes Agent vault context (bridge config + identity)
```

`.claude/skills/fiduciary-doc-factory/` — merged v2.1.0 fiduciary drafting skill (GPO 2016 + Weiss).
Its `references/source-books/` PDFs are gitignored (large/copyrighted reference manuals).

## Key Rules

- **CORS proxy is mandatory** for all LLM calls from GitHub Pages — never call Anthropic directly from the browser. See `.claude/docs/api-patterns.md`.
- **Master Register is 29 columns (A–AC), strict order** — never reorder or add columns without updating all GAS readers. Corrected 2026-08-01; the old "35 columns" figure was stale and caused real bugs in three GAS files written against it. Re-verify against `?action=pullRawTab` before trusting any doc's column count, including this one. See `.claude/docs/domain-models.md`.
- **All service functions must return new objects** — immutability is enforced by tests.
- **GAS deploy requires two steps** if `doGet`/`doPost` changed: `clasp push` + manual redeploy in Apps Script editor.
- **No CI/CD** — run `npm test` locally before pushing HTML changes.
- **Never commit secrets** — API keys live in localStorage/vault only.
- **Fiduciary doc standard lives in two synced places** — `.claude/skills/fiduciary-doc-factory/` (source of truth) and `DOCUMENT_KNOWLEDGE.fiduciaryDocFactory` in the HTML (distilled, injected into every agent via `buildFullSystemPrompt` + the `doc_creation`/`doc_format` firm prompts). Update both together. See `.claude/docs/api-patterns.md`.
- **Ledger Data Topology lives in two synced places** — `.claude/docs/data-topology.md` (source of truth) and `DOCUMENT_KNOWLEDGE.ledgerTopology` in the HTML (distilled, plain-prose, injected into every agent via `buildFullSystemPrompt`). The workbook is a living relational database: agents resolve facts across tabs/workbooks by join key (EIN, DOC-NNNN, MR-NNN) and never treat a blank cell as missing. Update both together.
- **Gemini neural TTS calls Google directly** (CORS-allowed), NOT through the Anthropic CORS proxy. Engine + voices in Settings → Voice & TTS; key resolves from `eeon_key_gemini` first.

## Vault Standards (2026-07-31)

This repo is also an **Obsidian vault**. Changes in VSC are instantly visible in Obsidian and vice versa — same directory, no sync needed.

### Gitignore discipline
- **TRACKED:** `.obsidian/app.json`, `appearance.json`, `community-plugins.json`, `core-plugins.json`, `homepage.json`, `hermes/context.json`
- **TRACKED:** `.hermes/vault-context.md`, `VaultIndex.md`
- **IGNORED:** `.obsidian/workspace.json`, `bookmarks.json`, `graph.json`, `hotkeys.json` (personal workspace state)
- **IGNORED:** `.obsidian/plugins/` (45 plugin binaries — installed per-machine)
- **IGNORED:** `.obsidian/themes/`, `snippets/`, `icons/` (personal preference files)
- **IGNORED:** `.hermes/runtime/` (Hermes session state)
- **Theme:** Cobalt Peacock · **Font:** Rubik 17px · **Accent:** `#6946b9`
- **Homepage:** VaultIndex.md

### Hermes Agent
- **Context bridge:** Enabled — pushes active file + selection to Hermes on terminal open
- **Profile:** `law` (legal/fiduciary persona)
- **Config:** `.obsidian/hermes/context.json` (tracked) + `.hermes/vault-context.md` (tracked)

### Credentials Bridge (2026-07-31)
- **GAS endpoint:** `?action=pullWebsiteAccounts` returns platform/username/URL (no passwords)
- **API key gate:** `checkApiKey_()` added to all doGet/doPost actions except `ping`
- **Key location:** `TMAR_API_KEY` Script Property in Apps Script editor (never in source)
- **Sync script:** `scripts/sync-credentials.mjs` → writes `FileCabinet/Credentials/master-reference.md`
- **Passwords:** Never stored in sheet or transmitted via API — stripped at the GAS layer

### Connected Surfaces
| Surface | Identifier |
|---|---|
| Google Sheet | `1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ` |
| GAS Web App | `https://script.google.com/macros/s/AKfycbzpeegvE52lvqCTMyKrsdaa_4JFfjM6MQrsJkU8zb17fkUJzPRasUU0fjONdaHkM5dh/exec` |
| GAS Editor | `https://script.google.com/u/0/home/projects/1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr/edit` |
| Live App | `https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html` |
| Local Dev | `http://localhost:5501/TMAR-Accrual-Ledger.html` |
| FileCabinet | `C:\Users\rhyme\Desktop\FileCabinet\` |
| Credentials CSV | `https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ/export?format=csv&gid=1034023905` *(if published)* |

## Instruction Docs (load when relevant)

@.claude/docs/api-patterns.md
@.claude/docs/testing-conventions.md
@.claude/docs/domain-models.md
@.claude/docs/deployment.md
@.claude/docs/gas-patterns.md
@.claude/docs/ledger-calculation-rules.md
@.claude/docs/data-topology.md
