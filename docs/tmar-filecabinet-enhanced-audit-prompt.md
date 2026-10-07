# Enhanced TMAR ↔ FileCabinet Audit — Reconcile the Directory Against the GUI and the Google Sheet / Apps Script

## Objective

Run a **read-only, three-way audit** that reconciles the FileCabinet directory structure with (a) the TMAR GUI (single-file web app) and (b) the TMAR Google Sheet + Apps Script data model. The deliverable is an **"enhanced framing"** — a proposed directory taxonomy whose folders and categories map one-to-one onto the GUI's features and the Sheet's schema, plus a concrete rename/move list.

You have no memory of prior work. This brief is self-contained. The three systems were *supposed* to share one vocabulary; they have drifted apart. Your job is to find the drift and propose the reconciliation.

## Current state (context)

- `C:\Users\rhyme\Desktop\FileCabinet\` was reorganized on 2026-10-07 by a "file-vault-organization" skill. The current canonical taxonomy and placement rules live in:
  - `~/.hermes/profiles/law/skills/vault/file-vault-organization/references/taxonomy.md` — top-level map (24 folders) + subfolder conventions.
  - `.../references/placement-rules.md` — document-type → destination decision table.
  - `.../references/filecabinet-remap-proposal.md` and `.../references/rules-log.md` — what was moved and why.
  If those paths are not readable from your environment, re-derive the tree with `Get-ChildItem -Recurse` or `tree /F` on FileCabinet.

## Prior context — the Filing Packages process-folder model (ADOPT this, do not re-derive it)

A separate review already settled the correct framing for `02-Recorded-Documents/Filing Packages/`, and it just bit us concretely: a **drafted-but-never-sent** June rebuttal sat in the same package folder as the **mailed** June resubmission, and the directory gave no way to tell them apart. Treat the following as the TARGET model; evaluate the current `Filing Packages/` layout against it.

```
02-Recorded-Documents/Filing Packages/
  <ProcessName>/                 <- ONE folder per process, NOT per request number
    _MANIFEST.md                 <- dated ledger: every artifact, its status, what it produced, dates
    mailed/                      <- GATED: only if postage breadcrumbs are co-located
      req1_2026-05-13/           <-   form + $30 MO + tracking + 5/27 denial
      req2_2026-06-10/           <-   transmittal + short-form result
      req3_2026-08-18/           <-   form + $90 MO + tracking + green card + 3 short-form results
    drafted/                     <- quarantine: never mailed (explicitly flagged)
      rebuttal_2026-06-10/       <-   the drafted-not-sent rebuttal
    correspondence/
      received/                  <- denial letters, VitalChek letter, short-form copies
      sent/                      <- demand/escalation letters (moved here the moment mailed)
```

The single rule that makes it work: **a document only earns a spot in `mailed/` if its postage breadcrumbs (tracking number, money-order serial, green card) sit in the same subfolder.** No breadcrumbs -> it stays in `drafted/` or `correspondence/`. That gate is what prevents a drafted-but-unsent document from masquerading as a sent one.

This model also absorbs the scattered `04-Taxes\...\State-Filings\NYS DOH` files — denial letters and filled forms move into the process folder's `correspondence/received/` and `mailed/<reqN>/` instead of living in a tax-filing tree.

Your audit MUST:
1. Inventory the current `Filing Packages/` layout against this model and flag every folder that mixes mailed vs drafted vs correspondence.
2. Include, in Section F, a **"Filing Packages -> process-folder remap"** subsection listing the concrete moves (NYS DOH is the worked example).

## The three sources

### (1) FileCabinet directory — `C:\Users\rhyme\Desktop\FileCabinet\`
Top level (24 folders): `00-Receipts-Invoices`, `01-Mailings`, `02-Recorded-Documents`, `03-Banking`, `04-Taxes`, `05-Estate & Trust`, `05-Labels`, `06-Account-Register`, `07-Source-Documents`, `08-Ledgers`, `09-Valuations`, `Archive`, `Business`, `Credentials`, `Credit-Reports`, `Digital-Binders`, `Employment`, `Genealogy`, `Legal-Reference`, `_Unsorted`, `scripts`, `$Temp`, `.FC`, `.claude`.

Current conventions:
- `03-Banking/<Person>/<Institution>/<Year>/` (person-first)
- Tax forms (1099-R/DIV/B/INT, W-2, 5498, 1098-E/T, 1095-C) → `04-Taxes/<Person>/<Year>/`
- Trust instruments / estates → `05-Estate & Trust/Estates/<Estate>/<DocType>/`
- Mailing/postal receipts → `01-Mailings/Postal/{PS Form-3800, PS Form-3811, MoneyOrderReceipts, USPS-Receipts}`
- Affidavit templates → `Legal-Reference/Affidavits/`

### (2) TMAR GUI — `C:\Users\rhyme\Documents\TMAR-Accrual-Ledger\TMAR-Accrual-Ledger.html`
A 3.9 MB single-file app. **All live JS is inlined in that HTML** — the sibling `tt_block.js` is a stale mirror; do not edit or trust it. Extract the app's *business-object vocabulary* (NOT the LLM provider plumbing):
- Menu structure and tab names
- Dropdown `<option>` lists: entity-type selects, account-subtype selects, category/status/document-location values
- Hardcoded category / subtype / status / document-type string arrays and enums
- Any "Filing System" or "document location" vocabulary that maps a document to a physical folder

### (3) TMAR Google Sheet + Apps Script
- **Google Sheet** — system of record, ~52 tabs. Locate its ID from the repo (clasp `.clasprc.json`, GAS code, or `docs/`). Known partial ID: `1k6J2s0x…WInQ`. Pull tab names and (where feasible) header rows. Key sheets: the **Master Register** (note: **Document Location = column 23 / "W"**) and **Proof of Mailing** (14 columns A–N).
- **Apps Script** — bound to the Sheet. Script ID `1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr`; source is in the repo via clasp. Read the `.gs` files for schema truth:
  - `SyncCenter.gs` — `pushEntities_` writes these 10 fields: `status, subtype, openDate, currentBalance, paymentSource, statementsComplete, documentLocation, lastStatementDate, lastVerified, notes`.
  - `ImportRegistryScan.gs` — FULL REPLACE registry import.
  - Any enum/constant declarations for category, subtype, status, and document-location.

### Data-model bridge files — `C:\Users\rhyme\Desktop\FileCabinet\Digital-Binders\`
TSV extracts that encode the canonical category/authority vocabulary:
`coa.tsv`, `coa_full.tsv`, `master_register.tsv`, `doc_registry_full.tsv`, `doc_registry_tmar.tsv`, `doc_inventory_tmar.tsv`, `entity_verification.tsv`, `filing_chain.tsv`, `filings_1099.tsv`, `forms_authority.tsv`, `ffs_master_index.tsv`, `ffs_forms_authority.tsv`, `ffs_creditor_detail.tsv`, `ffs_proof_mailing.tsv`, `household_obligations.tsv`, `boa_cashflow.tsv`, `pnc_cashflow.tsv`, `subscriptions.tsv`, `transaction_ledger.tsv`, `trust_ledger.tsv`, `w2_income.tsv`, `credit_report.tsv`.

Also relevant: `Trust Master Account Register (TMAR).xlsx` (in Digital-Binders) and the **Freeway Filing System** maps — `Freeway_Filing_System_PERSONAL_v2.xlsx` and `Freeway_Filing_System_TEMPLATE.xlsx` — which define document-type → category/authority. The directory should mirror *this* vocabulary.

## Method

1. **Inventory each source's vocabulary.**
   - GUI: grep the HTML for `<option>`, menu labels, tab titles, and hardcoded string arrays.
   - Sheet/GAS: tab names + column headers + enum constants in the `.gs` files.
   - Directory: the actual tree.
2. **Build a three-way contrast matrix** — one row per concept: FileCabinet folder ↔ GUI feature/category/tab ↔ Sheet tab / GAS column / enum.
3. **Flag every mismatch**, including:
   - A folder with no GUI/Sheet counterpart (and vice-versa).
   - The same concept named differently in each system.
   - Concepts the directory lumps together but the Sheet separates (or the reverse).
   - Master Register `documentLocation` (col 23/W) values that do NOT match actual folder paths.
   - The Freeway Filing System categories vs. the `03-Banking`/`04-Taxes`/`06-Account-Register` folder split.

## Deliverable — one markdown report, committed to `docs/` in the repo

- **Section A** — GUI vocabulary inventory (menus, tabs, dropdowns, category/subtype/status/document-location values).
- **Section B** — Sheet + GAS schema inventory (tab names; Master Register columns with the Document-Location = col 23/W note; Proof-of-Mailing columns; `pushEntities_` field list; enums).
- **Section C** — FileCabinet tree inventory (top level + one level deep where relevant).
- **Section D** — the three-way contrast matrix.
- **Section E** — mismatches/gaps, ranked by impact.
- **Section F** — **enhanced framing**: a proposed revised taxonomy + a concrete rename/move list so the directory's categories track the GUI and the Sheet one-to-one. Mark each item MUTABLE (safe to move) vs HISTORICAL (leave in place).

## Constraints

- **Read-only.** Do not move, rename, or delete any file. Audit + proposal only.
- Anchor every claim to a specific file path, a specific HTML/GAS line or function, or a specific Sheet tab/column. No invented vocabulary.
- If a source is inaccessible (e.g., the GSheet API is not configured), say so explicitly and fall back to the repo's `.gs` files + the Digital-Binders TSV extracts, which are authoritative proxies.
- Claude Code is working concurrently in this same repo — check `git status`/`git diff` and report alongside, never clobber.
