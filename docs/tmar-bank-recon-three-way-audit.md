# Three-Way Cross-Reference — Bank Statement / Bank Reconciliation Elements

**Date:** 2026-10-10
**Scope:** Read-only audit of the bank-statement → Bank-Reconciliation pipeline across three interfaces. No files were moved, renamed, deleted, or rewritten.
**Interfaces:** (1) FileCabinet `03-Banking`, (2) TMAR GUI/repo, (3) TMAR GSheet.

---

## 0. Verified baseline (on-disk + live-Sheet, not memory)

| Metric | BOA | CapOne | PNC | Truist |
|---|---|---|---|---|
| Per-statement CSVs (FileCabinet) | 86 | 40 | 25 | 3 |
| `_MANIFEST.csv` tx_count sum | 6,894 | 4,347 | 2,558 | 10 |
| Combined CSV rows (repo root) | 6,894 | 4,347 | 2,558 | 10 |
| Cash-flow tab tx count (Sheet) | 6,894 | 4,347 | 2,558 | 10 |

The transaction count is **identical across all four layers** for every bank — manifest sum == combined rows == Sheet cash-flow count. The pipeline is internally fresh.

---

## 1. Three-way contrast matrix

Legend: ✅ aligned · 🟠 partial / cosmetic drift · 🔴 substantive drift

| # | Element | FileCabinet | GUI / repo | GSheet | Status |
|---|---|---|---|---|---|
| 1 | **Import schema** `date,type,amount,description,source` | Per-statement + combined CSVs all carry this header (verified on 4 sample statements) | `reconLoadCSVText` reads `date,type,amount,description,source` (date+amount required, rest optional) | Bank cash-flow tabs are **summary** tabs (Beginning Balance / Deposits / Debits / Fees / Ending / Net Change) — not transaction tabs | ✅ |
| 2 | **Source/bank labels** | `source` = `BOA` / `CapOne` / `PNC` / `Truist` (single consistent tag per file) | `RECON_BANK_SOURCES` = same four keys/labels; filter dropdown is derived from the CSV `source` column, not hardcoded | Tab names `BOA Cash Flow` / `CapOne Cash Flow` / `PNC Cash Flow` / `Truist Cash Flow` | ✅ |
| 3 | **Combined-file ↔ "Load All"** | — | `RECON_BANK_SOURCES` has 4 entries; repo root has exactly 4 `*_Statements_Combined.csv` | — | ✅ |
| 4 | **Account identifiers** | BOA manifest `account` = `237012896198`; CapOne/PNC/Truist manifests have **no** `account` column (CapOne `...5198` only in a stray filename, PNC `...0672` only in `Spend_x0672` source name) | — | Cash-flow headers: BOA `237012896198`, CapOne `xxxx5198`, PNC `xxxx0672`, Truist `1340030301225`. Master Register: `Bank of America N.A.` `237012896198`, `Capital One 360 Checking` `36136995198`, `PNC Bank` `0672`, `Truist Bank` `1340030301225` | 🟠 |
| 5 | **`_MANIFEST.csv` audit-only + faithful** | Present per bank; **schema differs** (BOA 9-col incl. `kind/period_start/account`; CapOne/PNC/Truist 6-col, no account). Counts match CSV sets (86/40/25/3) | Not read by GUI (confirmed — `reconLoadCSVText` only consumes the combined CSV) | Not read by Sheet (cash-flow built from combined CSV) | 🟠 |
| 6 | **Pipeline freshness** | Manifest tx_count sums == combined rows (diff 0 ×4) | Combined files stamped 2026-10-10 16:01 | Cash-flow tabs built 2026-10-10 15:27, footers state the same tx counts | ✅ |

---

## 2. Ranked findings + proposed fixes (proposals only — no execution)

### 🔴 F1 — Master Register holds duplicate/ambiguous bank rows
The register has **two BOA rows for the same account**:
- `Bank of America` → account `6198`
- `Bank of America N.A.` → account `237012896198`

`6198` is the masked last-4 of `237012896198` (…6198). Same account, two representations. CapOne is worse: **six** `Capital One*` rows (`Capital One` ×2 with blank account, `Capital One 360 Checking` `36136995198`, `Capital One 360 Checking (2nd)` `36270212801`, `Capital One (Clinton)` `517805XXXX`, `Capital One Auto Finance` `6201067262643`). The statement account (`…5198`) resolves to exactly one row (`36136995198`), but the register gives no unambiguous way to tell which row the statement pipeline targets.

**Proposed fix:** deduplicate the register bank rows — collapse `Bank of America` (6198) into `Bank of America N.A.` (full), and disambiguate/label the six Capital One rows by holder + account (e.g. `Capital One 360 Checking — Syrina …5198`). Confirm with operator before any merge.

### 🟠 F2 — `_MANIFEST.csv` schema is inconsistent across banks
BOA's manifest (from `generate_statement_csvs.py`) has 9 columns including `account`, `kind`, `period_start`; CapOne/PNC/Truist manifests (from `generate_all_bank_csvs.py`) have 6 columns and **drop `account` entirely**. Consequence: the account identifier is auditable for BOA only; for the other three banks the account number lives nowhere in the audit trail (only in the cash-flow header and a stray source filename).

**Proposed fix:** standardize the manifest on the BOA 9-column schema (`csv_file,source_file,kind,period_start,period_end,account,tx_count,total_credits,total_debits`) in `generate_all_bank_csvs.py`, and backfill the `account` field for CapOne (`36136995198`), PNC (`…0672`), Truist (`1340030301225`).

### 🟠 F3 — Account-number representation is inconsistent (masked vs full)
Cash-flow headers show BOA/Truist in **full** (`237012896198`, `1340030301225`) but CapOne/PNC **masked** (`xxxx5198`, `xxxx0672`). The Master Register is likewise mixed (`0672`, `6198` masked; `237012896198`, `1340030301225`, `36136995198` full). Not a data-integrity break, but it makes a mechanical cross-reference fail on three of four banks.

**Proposed fix:** pick one convention (recommend full account in the register, masked `xxxxNNNN` only in display headers) and apply uniformly across `generate_cashflow_summaries.py` output and the register rows.

### 🟠 F4 — CapOne statement gap + unindexed files
The CapOne CSV set jumps **2023-06 → 2023-08** (no 2023-07), and two files sit outside the indexed `CSV/` folder: `2026/2026-03-07_360Checking...5198.csv` (a 2026 statement) and `undated/capone_local.csv`. Neither appears in the CapOne manifest, so the manifest under-reports the true on-disk CapOne inventory.

**Proposed fix:** determine whether 2023-07 genuinely has no statement (expected) or the CSV is missing (re-generate); index (or deliberately exclude, with a manifest note) the two stray files.

### 🟢 F5 — Transaction Ledger `source` is not the bank tag
The Transaction Ledger (239 rows) is a **separate manual double-entry ledger** — its `source` field carries annotations (`Accrual Ledger` ×14, `Last payment`, `Business use`, etc.), never `BOA`/`CapOne`/`PNC`/`Truist`. The bank-statement data flows into the **cash-flow summary tabs**, not the Transaction Ledger. This is expected architecture, but it means "source" means different things in the two schemas.

**Proposed fix:** none required — document the split (bank pipeline → cash-flow tabs; manual ledger → Transaction Ledger). Flag only if the operator intended the ledger to ingest statement rows.

### 🟢 F6 — Truist is thin (expected)
3 statements (May–Jul 2026), 10 transactions. Consistent with a newly-opened account; no action.

---

## 3. "Verified against" source list

**FileCabinet (disk):**
- `03-Banking/Clinton/BOA/Statements/CSV/` — 86 `BOA_*.csv` + `_MANIFEST.csv`
- `03-Banking/Syrina/Capital-One/Statements/CSV/` — 40 `CapOne_*.csv` + `_MANIFEST.csv` (+ stray `../2026/*.csv`, `../undated/capone_local.csv`)
- `03-Banking/Syrina/PNC/Statements/CSV/` — 25 `PNC_*.csv` + `_MANIFEST.csv`
- `03-Banking/Clinton/Truist/Statements/CSV/` — 3 `Truist_*.csv` + `_MANIFEST.csv`
- `03-Banking/generate_statement_csvs.py`, `generate_all_bank_csvs.py`, `generate_combined_bank_csvs.py`, `generate_cashflow_summaries.py`

**GUI / repo:**
- `TMAR-Accrual-Ledger.html` — `reconLoadCSVText` (L12845), `reconImportCSV` (L12880), `RECON_BANK_SOURCES` (L12891), `renderReconBankButtons` (L12898), `reconLoadBank` (L12908)
- Repo root combined CSVs: `BOA_Statements_Combined.csv` (6,894), `CapOne_Statements_Combined.csv` (4,347), `PNC_Statements_Combined.csv` (2,558), `Truist_Statements_Combined.csv` (10)
- `git status` clean; combined `.csv` files are git-ignored (regenerable via `generate_combined_bank_csvs.py`)

**GSheet (via GAS, read-only):**
- `listSheetTabs` — confirmed live tab names incl. the four `* Cash Flow` tabs and `Business Obligations`
- `pullRawTab` on `BOA Cash Flow` / `CapOne Cash Flow` / `PNC Cash Flow` / `Truist Cash Flow` — headers carry account + holder, footers carry tx counts (6,894 / 4,347 / 2,558 / 10)
- `pullAccounts` (Master Register, 110 rows) — bank account cross-reference
- `pullTransactions` (Transaction Ledger, 239 rows) — schema + `source` semantics

---

## 4. Bottom line

The **schema contract, source labels, Load-All mechanism, and pipeline freshness are all clean** (elements 1, 2, 3, 6 — ✅). The drift is concentrated in **account identifiers and the manifest** (elements 4, 5): a duplicate BOA register row, six ambiguous Capital One rows, an inconsistent manifest schema that omits the account number for three of four banks, and mixed masked/full account display. None of these break the current import flow (the GUI loads by filename, not account), but they will bite the moment account-level reconciliation or a 9-210/accession cross-reference is attempted. F1 and F2 are the highest-value fixes.
