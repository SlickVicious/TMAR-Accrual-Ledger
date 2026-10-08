# TMAR Unified Workbook — Layout Optimization Proposal

**Workbook:** `1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ` (APPC RLT Unified Workbook)
**Evaluated:** 2026-10-08 · **Current state:** 56 tabs · **Target:** 42 tabs (−14) in 13 logical sections

---

## 1. What "the hub index" actually shows

The `📋 HUB INDEX` tab (gid `260113626`) is a **stale map**, dated `Generated: 2026-06-03`.
It lists 42 "sheets" but is no longer a faithful map of the workbook:

| Hub-index claim | Reality today |
|---|---|
| `Copy of Master Register`, `Copy of Transaction Ledger`, `Copy of Subscriptions & Services`, `Copy of Household Obligations`, `Copy of PNC Cash Flow`, `Copy of BOA Cash Flow` (6 "Legacy/Archive" rows) | **None of these tabs exist.** They were deleted, but the index still lists them. |
| `TMAR — Master Register`, `TMAR — Transaction Ledger`, `TMAR — CoA`, etc. (all `TMAR —` prefixed) | These tabs exist but were **renamed** (dropped the `TMAR —` prefix). |
| `Account Entities` | Renamed to `Entities`. |
| `FWM — Dashboard`, `FWM — Binder Tab Guide` | **Do not exist** (never landed or were renamed away). |
| 42 sheets listed | **56 tabs actually present** — the index omits 14 tabs entirely (the backup sheets, `Documents`, `Acct Ledger`, `Creditor Registry`, `CPA Questions`, `Gap Report`, `Register Summary`, `Tax Strategy`, `AppScripts`, `Process Flow`, `Filing Dashboard`, `Validation`, `Document Registry`, `Trust Ledger`). |

**Conclusion:** the hub index is doing negative work — it maps a structure that no longer exists while ignoring the tabs that do. It needs full regeneration, not patching.

---

## 2. Bloat inventory (evidence-backed)

The workbook absorbed **three systems** — APPC RLT (original), TMAR, and the Freeway Filing System (FWM) — and each brought its own copies of the same datasets. The bloat is the absorption artifacts.

### 2.1 — Four tabs track the same documents

| Tab | Rows | What it actually is |
|---|---|---|
| `Document Inventory` | 829 | **Authoritative** 17-field inventory (Doc ID, Type, Vault Location Path, Status, Is Correction…) |
| `Documents` | 831 | **Echo** — its own header row reads *"Source: Document Inventory \| 829 documents"*. A derived copy. |
| `Document Registry` | 2,933 | PC filesystem cross-reference (every file on disk, incl. `.claude/settings.local.json`). Superset. |
| `Document Registry (Mac legacy)` | 1,029 | Hidden. Mac filesystem cross-reference — paths point to `/Users/animatedastronaut/…`, which is stale. |

### 2.2 — Five tabs hold the same creditor/entity data

| Tab | Rows | Role |
|---|---|---|
| `Master Register` | 73 | **System of record** (GAS write target), 39 cols, full account lifecycle |
| `Acct Ledger` | 92 | Older creditor-account register (balances, opened/closed, credit limit/high balance) — overlaps Master Register |
| `Creditor Registry` | 50 | Mailing addresses per EIN (W-9 / Form 56 basis) |
| `FWM — Creditor Detail` | 60 | **Near-duplicate** of Creditor Registry — same columns, same rows (S-001 Capital One, S-002 Continental…) |
| `Entities` | 52 | EIN verification report (PASS/WARN, sources, action items) — same entity list, audit columns |
| `Chart of Accounts` | 56 | **Mislabeled** — header says CoA, but the data is entity/TIN records (EIN + Acct # + name + address). A *third* copy of the creditor/entity data. A prior author already planned this rename (see §7.5). |

The **real** GAAP chart of accounts is in `Copy of Chart of Accounts` (80 rows: `1000 Cash - Operating`, `1010 Cash - Payroll`, asset/current/debit, SchL-1…). The naming is inverted.

### 2.3 — Two validation lists

| Tab | Rows | Hidden |
|---|---|---|
| `_Validation` | 78 | Yes — the actual dropdown source (more complete) |
| `Validation` | 33 | No — a partial/older copy |

### 2.4 — Three "binder / filing guide" tabs

| Tab | Rows | Content |
|---|---|---|
| `FWM — Master Index` | 64 | Master binder index (37 Syrina + 12 Clinton accounts) |
| `Process Flow` | 52 | Physical binder organization guide (doc order per creditor tab) |
| `📁 Binder Index` | 10 | Another physical-binder guide, same EIN/trustee header |

### 2.5 — Two dashboards, one empty

| Tab | Rows | Note |
|---|---|---|
| `📋 Dashboard` | 48 | Active grantor-trust dashboard |
| `A Provident Private Creditor Dashboard` | 0 | **Empty** — zero headers, zero rows |
| `Register Summary` | 10 | Small metrics block (`Total Accounts = 71`) — belongs inside `📋 Dashboard` |

### 2.6 — Transient backup sheets left in place

| Tab | Rows | Origin |
|---|---|---|
| `F1040_PreDelete_20261007_220304` | 1 | Safety snapshot from a 10/07 `deleteForm1040` call |
| `WA_PreDelete_20260803_135115` | 56 | Safety snapshot from an 08/03 website-account delete |

These are the delete endpoints' *backup-before-delete* artifacts. They served their purpose and should be archived off, not left in the live book.

### 2.7 — Retired tab still present

| Tab | Rows | Note |
|---|---|---|
| `Trust Ledger` | 4 | Hidden. Its own banner: *"⚠️ RETIRED 2026-07-31 — superseded by Schedule A… This tab had no asset rows at retirement."* |

---

## 3. Proposed target layout — 42 tabs, 13 sections

Ordered by filing lifecycle. Control tabs hidden at the end.

| § | Section | Tabs | Count |
|---|---|---|---|
| A | **Index & Dashboard** | `📋 HUB INDEX` (regenerated) · `📋 Dashboard` (+ Register Summary metrics) | 2 |
| B | **Core Registers** | `Master Register` (+ Acct Ledger detail) · `Creditor Registry` (+ FWM Creditor Detail + Entities + mislabeled CoA) | 2 |
| C | **Ledgers & Accounting** | `Transaction Ledger` · `General Ledger` · `Chart of Accounts` (renamed from "Copy of") | 3 |
| D | **Banking** | `Banking Records` · `BOA Cash Flow` · `PNC Cash Flow` · `Principal Register` | 4 |
| E | **Tax Filings** | `1040 Submissions` · `W-2 & Income Detail` · `Schedule A` · `Tax Filings` · `Tax Determinations` · `Tax Strategy` · `CPA Questions` | 7 |
| F | **1099 Pipeline** | `1099 Filing Chain` · `1099 Filings` · `IRIS 1099-B Generator` | 3 |
| G | **Mailings & Authority** | `Proof of Mailing` · `Forms & Authority` · `Website Accounts` | 3 |
| H | **Trust Instruments** | `Trust Instrument` · `Trustee Authority` · `Trustee Resolutions` · `Asset Transfer Log` · `Corpus & M-2` | 5 |
| I | **Documents** | `Document Inventory` · `Document Registry` | 2 |
| J | **Household** | `Household Obligations` · `Subscriptions & Services` | 2 |
| K | **Filing System** | `FWM — Master Index` (+ Binder Index + Process Flow) · `FWM — Forms Checklist` · `Filing Dashboard` | 3 |
| L | **Reference** | `AppScripts` · `Gap Report` | 2 |
| M | **Control (hidden)** | `_Settings` · `_SyncMeta` · `_Validation` (merged) · `_YearData` | 4 |

**Total: 42 tabs** (down from 56).

---

## 4. Tab-by-tab action map

### 4.1 Delete outright (6) — pure bloat, no data loss after archive

| Tab | Why safe |
|---|---|
| `F1040_PreDelete_20261007_220304` | Transient backup; original delete already confirmed |
| `WA_PreDelete_20260803_135115` | Transient backup; original delete already confirmed |
| `A Provident Private Creditor Dashboard` | Empty (0 rows) |
| `Trust Ledger` | Self-documented RETIRED, no asset rows |
| `Document Registry (Mac legacy)` | Stale Mac paths (`/Users/animatedastronaut/…`) |
| `Documents` | Echo of `Document Inventory` (its own header admits it) |

> **Archive first.** Copy each to a dated `_Archive_<name>` sheet or a separate "Archive" workbook before deleting, so nothing is lost irreversibly.

### 4.2 Merge, then delete (8) — reconcile rows BEFORE removing the source

| Source tab | Absorbed into | Reconciliation required |
|---|---|---|
| `Acct Ledger` (92 rows) | **reconcile into `Master Register`** | ⚠️ NOT a duplicate — Acct Ledger holds **27 EINs Master Register lacks** (Fidelity, Vanguard, Webull, BofA, Verizon, Spectrum, IRS, SSA, GEICO, PayPal, OpenAI, …). A blind delete loses them. Reconcile: add the missing entities to Master Register first. |
| `FWM — Creditor Detail` (60 rows) | **canonical — absorb `Creditor Registry` into it** | ⚠️ Direction inverted: FWM has **34 EINs**, Creditor Registry only **20** and is a **strict subset** (0 unique). Merge Creditor Registry's extra `Source Ref`/`Notes` columns into FWM, then archive Creditor Registry. |
| `Entities` (52 rows) | `FWM — Creditor Detail` | Entities is a subset (all 28 EINs already covered). Append its unique verification columns (EIN Status, Verification Source, Action Items) keyed by EIN. |
| `Chart of Accounts` (56 rows) | **rename → `TIN Registry`** | Mislabeled — it holds entity/TIN data (the Entity Verifier's source-data tab), *not* GAAP codes. Rename, don't merge. |
| `Copy of Chart of Accounts` (80 rows) | **rename → `Chart of Accounts`** | This is the *real* GAAP CoA (`1000 Cash - Operating`, asset/current/debit). Frees the correct name once the mislabeled tab is renamed to `TIN Registry`. |
| `Validation` (33 rows) | `_Validation` (78 rows) | `_Validation` is the superset; confirm no enum value lives only in the visible copy. |
| `Register Summary` (10 rows) | `📋 Dashboard` | Relocate the metrics block into the dashboard. |
| `Process Flow` (52 rows) | `FWM — Master Index` | Fold the "doc order per creditor tab" guide into the master index. |
| `📁 Binder Index` (10 rows) | `FWM — Master Index` | Same physical-binder content; merge. |

### 4.3 Rename (2) — fix inverted/ambiguous names

| Current | Rename to | Why |
|---|---|---|
| `Chart of Accounts` | `TIN Registry` | It holds entity/TIN data, not GAAP codes. Matches a prior author's plan in `TabConsolidationAudit.gs` (`TAB_RENAMES_`). |
| `Copy of Chart of Accounts` | `Chart of Accounts` | It *is* the real GAAP CoA; the "Copy of" prefix is wrong once the mislabeled tab is renamed. |
| `📒 General Ledger` | `General Ledger` | Distinguish the trust journal from `Transaction Ledger`; the emoji + near-identical name caused the confusion. |

### 4.4 Keep as-is (40)

Everything else, reordered into Sections A–M above.

---

## 7.5 Reconciliation with the existing GAS consolidation code

`gas/TabConsolidationAudit.gs` already encodes a partial consolidation of this same workbook. My API-level findings line up with it, with three refinements the prior author had already worked out:

1. **`Chart of Accounts` → `TIN Registry`** is *already planned* in `TAB_RENAMES_`. It is the Entity Verifier's source-data tab (people + creditor EINs), **not** a GAAP chart. My original "merge into Creditor Registry" was wrong — rename it, matching the in-repo plan.
2. **`Documents` is engine-managed.** `TMAREngine.gs` regenerates it from `Document Inventory`/`Document Registry` on demand. It is a derived *view*, not a distinct dataset — safe to delete, but it will regenerate. Treat it as "derived, not canonical."
3. **Retired tabs use "hide, don't delete."** `Trust Ledger` (`RetireTrustLedger.gs`) and `Document Registry (Mac legacy)` (`promotePcRegistryToCanonical`) are already hidden with deprecation banners rather than deleted. Stage 3 should honor that convention (archive to the separate workbook, then *hide* — or delete only after the archive workbook is confirmed).

The prior author also already removed the `TMAR —`-prefixed duplicate tabs and promoted the PC filesystem scan to the canonical `Document Registry` — so this workbook is already partway through consolidation; this proposal completes it.

---

## 5. Naming convention (going forward)

1. **One purpose = one tab.** No `Copy of …`, no absorbed-system duplicates.
2. **`_` prefix = hidden control/system** tabs (`_Settings`, `_Validation`, `_SyncMeta`, `_YearData`). No user-facing data hides behind `_`.
3. **`—` separator = source-system namespaces** (`FWM — …`) only where a third system genuinely retains its own index. As those merge, drop the namespace.
4. **No transient artifacts in the live book** — `*_PreDelete_*` backups move to an Archive workbook the same session they're created.
5. **Regenerate `📋 HUB INDEX` whenever a tab is added/removed/renamed** — it is a map, and a stale map is worse than none.

---

## 6. Implementation plan (staged, non-destructive)

> The live workbook is the system of record. Execute in reviewable stages; do not mutate in one blind pass.

**Stage 1 — Snapshot & archive (read-only).** Export the workbook; copy all 6 "delete outright" tabs + the 8 "merge" sources to a dated `Archive_20261008` workbook. Nothing in the live book changes yet.

**Stage 2 — Reconcile the 8 merges.** For each pair, produce a row-level union/diff (Acct Ledger→Master Register and FWM Creditor Detail→Creditor Registry especially, since the sources have *more* rows). Confirm every account/EIN lands once in its survivor before touching sources.

**Stage 3 — Apply merges + renames + deletions** in one controlled session (tab reorder can be scripted through the GAS `reorderSheet`/`setActiveSheet` or via Apps Script `moveActiveSheet`).

**Stage 4 — Regenerate `📋 HUB INDEX`** from the actual surviving tab list (name + section + sheet #), dated, with the correct EIN/trustee header. This is the artifact the operator originally asked about — it must map reality.

**Stage 5 — Verify.** Re-pull `listWorkbookTabs` and confirm 42 tabs, no `Copy of`, no `_PreDelete_`, no empty dashboard; confirm GAS write targets (`Master Register`, `1040 Submissions`, `Website Accounts`, etc.) still resolve by name.

---

## 7. Net effect

| Metric | Before | After |
|---|---|---|
| Tabs | 56 | **42** |
| Document-tracking tabs | 4 | 2 |
| Creditor/entity tabs | 6 | 2 |
| Validation lists | 2 | 1 |
| Binder/filing guides | 3 | 1 |
| Dashboards | 3 | 1 |
| Transient backup sheets in live book | 2 | 0 |
| Retired/legacy tabs | 3 | 0 |
| Hub index accuracy | Stale (maps 42, omits 14, lists 8 phantom) | Accurate (maps all 42) |

The reduction is ~25% of tab count but ~**70% of the data-management surface**, because the eliminated tabs were the redundant copies of the same three datasets (documents, creditors, binder guides) rather than distinct information.
