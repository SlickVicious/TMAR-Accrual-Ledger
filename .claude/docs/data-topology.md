# Ledger Data Topology
- The TMAR system is a **living, multi-surface relational database** — not isolated sheets/files. Load this when reasoning about where a value lives, cross-tab/cross-workbook dependencies, or document propagation.
- **Source-of-truth mirror:** the distilled, HARD_LOCK-safe version is `DOCUMENT_KNOWLEDGE.ledgerTopology` in `TMAR-Accrual-Ledger.html`, injected into **every agent** by `buildFullSystemPrompt` (after the SYPHER gate, alongside `fiduciaryDocFactory`). Keep both in sync — edit here, then distill into the HTML.

## System model (surfaces)
| Surface | Role |
|---|---|
| **GitHub Pages app** (`slickvicious.github.io/TMAR-Accrual-Ledger/…`) | **Central control hub** — pulls/pushes to all remotes |
| **TMAR Live workbook** (`1k6J2s0x…WInQ`) | The organized **record/log** — estate planning, ledger keeping, file tracking. Sole read/write source of truth |
| **YTubiversity Vaults** (`C:\Users\rhyme\Documents\00_YTubiversity Vaults`) | Where documents are **born** (lessons learned) |
| **FileCabinet** (`C:\Users\rhyme\Desktop\FileCabinet`, PC) | Local document **storage**; what `Document Registry` indexes |
| **Freeway 2025 Archive** (`1kbulI…Rjk8`) | Read-only legacy. Never write |
| **APPC_RLT hub** (`1Ac5A…ATtc`) | **Dead** — an abandoned prior attempt to merge TMAR+FWM. Never actually synced. Do not read/write |

## Core rule
**A blank cell is almost never missing data** — the value lives in a related tab. Resolve via the join key to the canonical tab *before* reporting a value missing or asking the operator to enter it.

## Join keys (graph edges)
| Key | Format | Links |
|---|---|---|
| **EIN** | `NN-NNNNNNN` | Creditor identity spine: `Master Register` (PROVIDER_EIN), `Creditor Registry`, `Checklist`, `FWM — Creditor Detail`, `FWM — Forms Checklist`, `1099 Filing Chain`, `1099 Filings`. *One W-9 + one Form 56 per unique EIN, not per account.* |
| **DOC-NNNN** | `DOC-0001` | `Document Registry` (= **PC FileCabinet scan, canonical**). ⚠️ `Document Inventory` is a separate Mac catalog whose DOC-NNNN **collide** (same number, different file) — never join DOC numbers across the two |
| **MR-NNN** | `MR-001` | `Master Register` row key — the account spine |
| **Account #** | account number | `Master Register`, bank cash-flow tabs, `Checklist` |
| **T-NNN / S-NNN** | creditor tag | Two numbering schemes over the **same** creditors — reconcile by EIN, not by tag |

## Canonical source per fact
| Fact | Canonical tab |
|---|---|
| Creditor mailing address, legal entity name | `FWM — Creditor Detail` (28-creditor master) + `Creditor Registry` |
| **Filing/1099 payee name** | Creditor **LEGAL ENTITY NAME** (`CREDITOR / ENTITY LEGAL NAME` col) + EIN — never the brand/trade name (e.g. "Capital One Bank (USA) NA", not "Capital One") |
| Account #, status, 1099-B pairing | `Checklist` / `Master Register` |
| Document filename, filesystem path | `Document Registry` (PC scan) |
| Account balance | `Master Register` CURRENT_BALANCE (col N) |
| Trust corpus assets (Schedule A inventory) | `📦 Asset Transfer Log` — embedded "SCHEDULE A — ASSET INVENTORY" section (Serial/VIN/ID#, FMV method, appraiser/source, photo-on-file, transfer date, JE ref) |

## Relationship facts
- **FWM tabs = complete 28 creditors;** `Creditor Registry`/`Checklist` = **enriched subsets of 20** (joined by EIN; `Creditor Registry.SOURCE REF` = the FWM `S-###`). Blank in a subset → look up by EIN in the FWM master.
- **`Master Register Archive` = quarantine** of duplicate/closed accounts moved out by `DuplicateAnalyzer.gs`. Not redundant; never merge back (re-injects dupes).
- **`Trust Ledger` = retired** (2026-07-31, `gas/RetireTrustLedger.gs`) — hidden, not deleted, matching this workbook's retirement pattern. It duplicated the SCHEDULE A — ASSET INVENTORY section already embedded in `📦 Asset Transfer Log`, which `📁 Binder Index` already treated as the authoritative TAB 4; Trust Ledger had zero asset rows at retirement. Do not resurrect it — use Asset Transfer Log's Schedule A block for trust corpus assets.
- **`Document Registry (Mac legacy)`** = archived earlier corpus; the active corpus is the PC scan (see [[project_vault_index_regen]] for the related FileCabinet rebuild).

## GUI ↔ workbook tab binding (`SHEET_MAP`)
Import/export targets workbook tabs through a single canonical map (`SHEET_MAP` in the HTML, near `SyncBridge`) — one place, not scattered tab names. Tab names are aligned to the GUI section labels; `tabAliases` tolerate pre-rename names. Mirror: `gas/TabConsolidationAudit.gs` → `alignTabNames()` renames the tabs (guarded; GAS references none of these names).

| GUI model | Workbook tab | Existing sync (Sync Center) |
|---|---|---|
| `entities` (accounts) | `Master Register` | ✅ `pushEntities` / `pullAccounts` |
| `transactions` / `ledgerEntries` | `Transaction Ledger` | ✅ `pushTransactions` / `pullTransactions` |
| `payables` | `Household Obligations` | ✅ `pushPayables` / `pullObligations` |
| `filings` | `1099 Filing Chain` | ✅ `push1099` / `pull1099` |
| `principalRegister` | `Principal Register` | ✅ push/pull |
| `chartOfAccounts` | `GAAP CoA` (created on push) | ✅ `pushChartOfAccounts` / `pullChartOfAccounts` |
| `receivables` | `Receivables` (created on push) | ✅ `pushReceivables` / `pullReceivables` |
| `journalEntries` | `Journal` (created on push) | ✅ `pushJournalEntries` / `pullJournalEntries` (flatten header+lines → 1 row/line) |

Helpers: `sheetForModel(key)` → tab name; `modelForSheet(tab)` → model key. Sync is bidirectional via the Sync Center (per-section ⬆/⬇ buttons + Push All / Pull All). Notes: **`Account Entities` is the Entity Verifier's source-data tab — NOT the GUI Entities section (which syncs to Master Register).** The old `CoA` tab held entity/TIN data and was renamed **`TIN Registry`**; the GUI's GAAP chart lives in the separate **`GAAP CoA`** tab. Push = full-replace (GUI authoritative); pull = upsert by key (CoA by `num`, A/R by `invoiceNum`, Journal by JE `number`, adds only).

## Design law (north star)
**Minimalist, single source of truth — capture once, propagate everywhere.** Never require the same fact in two places. Roadmap (not yet built): document creation auto-captures its linked Account IDs (`DOC-NNNN` ↔ `T-NNN`) into every applicable tab so the operator never updates locations by hand.

## Agent directives (enforced via the injected block)
1. Resolve a "missing" value through its join key to the canonical tab before asking the operator.
2. Never assume two `DOC-NNNN` in different document tabs are the same file.
3. Treat `*Archive*` tabs and the dead APPC hub as out of scope for active data.
4. On create/update, reflect the record in every tab that joins to it by the keys above.
