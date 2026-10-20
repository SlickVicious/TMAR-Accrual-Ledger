# Master Register Remap & Reconcile — Final Report

**Date:** 2026-10-16
**Status:** COMPLETE (final reconciled state)
**Sheet:** TMAR workbook · tab `Master Register`

---

## Executive Summary

The Master Register was remapped and reconciled end-to-end. Duplicate rows were merged,
column labels corrected, a misapplied data-validation was removed, the retired
`FWM — Master Index` sheet was deleted (GAS references stripped), and empty EINs were
backfilled from six authoritative source tiers. The register went from **108 → 98 data rows**
and from a mostly-empty EIN column to **91 of 98 rows carrying a sourced EIN**.

---

## Final State — Master Register

| Metric | Before → After |
|---|---|
| Data rows | 108 → **98** |
| EINs filled | **91** (sourced) |
| Empty EINs | **7** (all legitimately unresolvable) |
| Duplicate groups merged | **10** |
| Header labels | corrected (`Description`, `Current Balance`, `High Balance`) |
| Status dropdown | cleared off the two balance columns (now numeric-writable) |

### Header (13 columns)
`Entry No., Date, Creditor / Entity, EIN, Audit Account #, Category, Description, Status, Date Acquired, Primary User, Current Balance, High Balance, Notes`

---

## EIN Source Tiers (priority order)

1. **TIN Registry** (tab `TIN Registry`, gid `205664006`) — authoritative entity→EIN master
2. **Sheet A** (confirmed-EIN list, `1fg8lwINPEzsU49qa8S8NTizIHuhuJJEq7qkAYibe7XU`)
3. **Acct Ledger** (tab `Acct Ledger`)
4. **FWM — Creditor Detail** (tab)
5. **SEC EDGAR** (`data.sec.gov/submissions/CIK…json` `ein` field, cross-checked `irs-number`)
6. **Secondary public sources** (state SOS filings, FDIC, company tax pages, ProPublica)

### Newly-confirmed EINs this pass

| Entity | EIN | Source |
|---|---|---|
| PNC Financial Services Group | `25-1435979` | SEC EDGAR (holding) |
| Synchrony Financial | `51-0483352` | SEC EDGAR (holding) |
| Ally Financial | `38-0572512` | SEC EDGAR |
| Block, Inc. (Cash App) | `80-0429876` | SEC EDGAR |
| TD Bank, N.A. | `01-0137770` | SEC EDGAR |
| MOHELA | `43-1261525` | mohela.com/tax |
| Early Warning Services (Zelle) | `20-5276211` | FL Sunbiz |
| ECSI | `25-1222771` | MA SOS foreign-corp FEIN |
| First Bank of Delaware | `51-0389698` | aggregator-only (low confidence) |
| US Department of Education | `52-1198289` | known |

---

## Duplicate Groups Merged (10)

Webull, PayPal, Assurant, Launch Servicing, Altice/Optimum, Duke Energy, Verde/Pathward,
Social Security Administration, Destiny Mastercard — plus one shell row (Merrick Bank)
removed. **Credit One Bank** was deliberately **not** merged: three distinct accounts
(Syrina's, Clinton's, and the FWM record) all carry the same bank EIN `26-2465888` but
remain separate rows.

### Row split
`MR-179 "Cline / Anysphere Inc."` was split into two distinct companies:
- `MR-179` → **Cline Bot Inc.** (Cline CLI)
- `MR-192` → **Anysphere Inc.** (maker of Cursor)

---

## Remaining Empty EINs (7 — all legitimately unresolvable)

| Row | Entity | Reason |
|---|---|---|
| MR-027 | Therapist | individual — no EIN |
| MR-173 | City of Kinston Utilities | municipal — no EIN |
| MR-140 | Cornerstone / UHEAA | Utah state agency, no public EIN |
| MR-178 | Perplexity AI | private startup |
| MR-179 | Cline Bot Inc. | private startup |
| MR-183 | Obsidian / Dynalist | private company |
| MR-192 | Anysphere Inc. (Cursor) | private startup |

---

## TIN Registry Backfill

The `TIN Registry` (authoritative EIN master) was backfilled with the 10 EINs above
(+10 rows, deduped on EIN), bringing it to **50 distinct EINs**. Address/phone fields were
left blank for the new entries; only EIN + entity name were recorded (sourced values only).

---

## Flags / Caveats

1. **Holding vs. bank EIN** — `25-1435979` (PNC) and `51-0483352` (Synchrony) are the
   *holding-company* EINs; the bank N.A. subsidiaries may carry different EINs. Verify at
   the bank level for 1099-INT matching.
2. **First Bank of Delaware** `51-0389698` is aggregator-only (eintaxid.com / w9ein.com,
   one with a mismatched address) — recorded as low-confidence, filled at operator request.
3. **TD Bank** disambiguated: TD Bank, N.A. `01-0137770` (operating bank) is distinct from
   TD Bank US Holding `01-0437984` and the Canadian parent `13-5640479`.

---

## Backup Sheets (preserved)

- `FWM_MasterIndex_PreHeader_20261016_000008` — FWM sheet, pre-delete
- `MasterRegister_PreRemap_*` — pre step-1 (labels + Merrick shell)
- `MasterRegister_PreBackfill_20261016_164355` — pre EIN backfill / merge

---

## GAS Endpoints Added (gas/SyncCenter.gs)

`foldFinalize`, `remapMasterRegister`, `applyMasterRegisterSpec`, `mergeMasterRegisterFast`,
`listSheetTabsMeta`, `clearBalanceValidation`, `finishRegisterSplit`, `backfillTINRegistry`.
All deployed to the live Web App (exec URL unchanged).
