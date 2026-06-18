# TMAR Accrual Ledger — Claude Instructions

Single-file HTML legal/accounting portal + Google Apps Script backend. GitHub Pages deployment. No build step for the HTML app.

## Repo Map

```
TMAR-Accrual-Ledger/
  TMAR-Accrual-Ledger.html   3.4 MB — main app (246 functions, 19 agents, LLM streaming)
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
    SyncCenter.gs            doGet/doPost web app endpoints
    TMARBridge.gs            financial summary + account CRUD
    FormattingComplement.gs  tab colors, validation, conditional formatting
    *.html                   HtmlService UI pages
    .clasp.json              Script ID + rootDir
  docs/                      human docs — plans, handoff notes, guides (leave here)
  .claude/docs/              Claude instruction docs (load on demand)
  .claude/skills/            Claude Code skills (mr-row, gen-test, fiduciary-doc-factory)
  .github/                   GitHub Actions config
  ClaudeSkills/              custom skill definitions (markdown notes)
```

`.claude/skills/fiduciary-doc-factory/` — merged v2.1.0 fiduciary drafting skill (GPO 2016 + Weiss).
Its `references/source-books/` PDFs are gitignored (large/copyrighted reference manuals).

## Key Rules

- **CORS proxy is mandatory** for all LLM calls from GitHub Pages — never call Anthropic directly from the browser. See `.claude/docs/api-patterns.md`.
- **Master Register is 35 columns, strict order** — never reorder or add columns without updating all GAS readers. See `.claude/docs/domain-models.md`.
- **All service functions must return new objects** — immutability is enforced by tests.
- **GAS deploy requires two steps** if `doGet`/`doPost` changed: `clasp push` + manual redeploy in Apps Script editor.
- **No CI/CD** — run `npm test` locally before pushing HTML changes.
- **Never commit secrets** — API keys live in localStorage/vault only.
- **Fiduciary doc standard lives in two synced places** — `.claude/skills/fiduciary-doc-factory/` (source of truth) and `DOCUMENT_KNOWLEDGE.fiduciaryDocFactory` in the HTML (distilled, injected into every agent via `buildFullSystemPrompt` + the `doc_creation`/`doc_format` firm prompts). Update both together. See `.claude/docs/api-patterns.md`.
- **Gemini neural TTS calls Google directly** (CORS-allowed), NOT through the Anthropic CORS proxy. Engine + voices in Settings → Voice & TTS; key resolves from `eeon_key_gemini` first.

## Instruction Docs (load when relevant)

@.claude/docs/api-patterns.md
@.claude/docs/testing-conventions.md
@.claude/docs/domain-models.md
@.claude/docs/deployment.md
@.claude/docs/gas-patterns.md
@.claude/docs/ledger-calculation-rules.md
