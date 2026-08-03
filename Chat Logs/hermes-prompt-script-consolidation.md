# Prompt for Hermes — GAS Script Consolidation + Master Register Dedup Candidates

## Context

I have Google Apps Script tools scattered across multiple vaults/directories from past
projects, and I want them centralized in one place: `D:\_ScriptSalad`. Two locations are
already known to have some:

- `D:\_ObsidianVaults\MCP GCP GAS\05 Project Ref Docs\GAS` — checked, not the primary
  collection I was thinking of, but may still hold something worth keeping.
- `C:\Users\rhyme\Documents\AIHub\03 Spaces\System Engineer Wiki\Google Drive\GAS` —
  looks more like it, but unconfirmed.

There are very likely more locations I'm not remembering — this has happened before with
scattered script/tool collections (see the Hueys Class Library `dedupe_classes_tree.py`
work, which found satellite copies in `D:\Communities\Classes` and `HH Shared Files` that
weren't in the "canonical" location either).

## The actual motivating problem (so you can prioritize what's relevant)

The TMAR Master Register (`Master Register` tab, Google Sheet
`1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ`) currently has duplicate account rows.
Checked directly against the live sheet just now — 11 providers have 2+ rows:

**9 providers with a shadow blank-ID row** (a properly-IDed row plus a second row for the
same provider with no MR-NNN assigned at all — these look like a bulk import created
duplicate entries for accounts that already existed): SDHC Property Rentals (MR-011),
Duke Energy Progress LLC (MR-051), Assurant Inc (MR-101), Bank of America NA (MR-102),
Fidelity Investments - FMR LLC (MR-103), Vanguard Group Inc (MR-107), Piedmont Natural
Gas Co (MR-109), Verizon Communications Inc (MR-110), Altice USA - Optimum (MR-111).

**2 providers with two fully-numbered duplicate rows**: Merrick Bank (MR-019 and MR-116)
and Capital One (MR-023 and MR-112). The higher-numbered rows (MR-112, MR-116) came from
a 2026-08-01 credit-report import whose dedup logic apparently didn't match against the
pre-existing MR-019/MR-023 rows for the same provider — worth checking whether that's a
provider-name mismatch (e.g. trailing whitespace, case, or a suffix like "(Clinton)"
used elsewhere in that same import for a different Capital One account) or an
account-type mismatch in the dedup key.

The existing dedup tool already in this project is `gas/DuplicateAnalyzer.gs` (in the
TMAR-Accrual-Ledger repo, `C:\Users\rhyme\Documents\TMAR-Accrual-Ledger\gas\`). I
remember having built other/better account-dedup tooling in the past — if any of what you
find is more capable than what's currently there (fuzzy provider-name matching, EIN/account-number
cross-checks, a proper merge-not-just-delete workflow), flag it specifically.

## What I want you to do

1. **Search broadly**, not just the two locations above — check other Obsidian vaults,
   `AIHub`, and anywhere else you'd reasonably expect old Apps Script / `.gs` files to be
   parked, for anything related to Google Sheets automation, account/entity
   deduplication, or Master Register-style ledger tooling.
2. **Catalog what you find** — for each distinct script or script collection: what it
   does, where it currently lives, and whether it looks like a duplicate of something
   already found elsewhere (don't just copy every instance — note which are genuinely
   distinct vs. copies of the same thing).
3. **Consolidate into `D:\_ScriptSalad`** — organize it sensibly (this directory may
   already have some structure; check before just dumping files in). Dedup the scripts
   themselves as you go, not just relocate everything as-is.
4. **Specifically flag anything relevant to account/entity deduplication** — call out by
   name any script that looks like it could help with the Master Register duplicate
   problem above, and briefly say why.

## What NOT to do

Don't import or wire anything into the live TMAR GAS project (`gas/*.gs` in the
TMAR-Accrual-Ledger repo) yourself — that's a live financial/fiduciary ledger and any
integration needs review first. Your job here is search, catalog, and centralize; flag
candidates, don't merge code.

## When done

Give me a summary: where everything ended up, what's genuinely new/distinct vs.
duplicate, and which (if any) script looks like the right fit for the Master Register
dedup problem so I can hand that off for review.
