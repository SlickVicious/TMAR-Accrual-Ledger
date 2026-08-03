# FileCabinet Audit Index — 2026-08-02

Comprehensive audit of `C:\Users\rhyme\Desktop\FileCabinet` (2,822 files, 24 top-level
binders). Built to support Master Register reconciliation and future vault
documentation. Mechanical duplicate scan (SHA256, whole tree) + 6 parallel content
audits by region. This file is the living index — update it as findings get resolved.

## At a glance

| Metric | Value |
|---|---|
| Total files audited | 2,822 (excl. `.FC` internal tooling) |
| Duplicate file groups (exact hash match) | 123 groups, 148 redundant copies, 356 MB |
| — systematic pattern (Books ↔ Legal-Reference) | 23 of the 123 groups |
| — other duplicate groups | 100 (see `.FC/fc_other_duplicates_20260802.txt`) |
| Master Register corrections made from this audit | 7 (see below) |
| Open items needing a human decision | ~15 (see Action Items) |

## Master Register corrections already applied (this session, from audit findings)

| Row | Fix |
|---|---|
| MR-005 (Bank of America) | Document Location corrected — was pointing at PNC's last-4 (0672) instead of BofA's (6198) |
| MR-149 (Fidelity Cash Mgmt, Clint) | Balance updated to $10,074.55 (Feb 2026 statement — more recent than the Dec 2025 snapshot first used) |
| MR-008 (Webull, Clint) | Account number added: 5IA46352 ("APEX C/F ROTH IRA," custodian UMB Bank NA), balance $9.19 (dormant since Aug 2024) |
| MR-149–152 (4 new rows) | Clint's Fidelity accounts added: Cash Management, ROTH IRA, Rollover IRA, Individual-TOD Brokerage — previously entirely untracked |

## Binder-by-binder summary

### 01-Trust-Instrument, 02-Recorded-Documents, 05-Labels, 09-Valuations, Legal-Reference, Courts
- **Two high-value documents worth a full read, not just this summary:**
  - `01-Trust-Instrument/Meetings/Adviser_Meeting_Outline_May1_2026_v2.docx` — dense status report: 2025 IRS transcript showing a **$74,218 frozen refund** (CP5071 identity-verification hold), a "Related Accounts Overview" table close in spirit to Master Register itself, full Syrina credit summary, and a business-entity roundup.
  - `02-Recorded-Documents/Filing Packages/APPC_RLT_Retitling_Package_v2.docx` — a full active + closed liability ledger for both spouses, organized for a trust re-titling campaign. Worth a line-by-line diff against Master Register.
- `Legal-Reference/Trust-Law-Books/` vs `07-Source-Documents/Books/` — **not simple duplicates.** Legal-Reference is a curated 34-item trust-law subset with 10 PDFs unique to it; Source-Documents is a much larger 155-item general library (includes non-trust material). Keep both.
- Misfiles found: two documents belonging to an unrelated third party (Calvin F. Cauthen, Georgia) sitting in the Wimberly trust folders (`01-Trust-Instrument/Affidavits/` and `/Drafts/`); a Kia warranty repair invoice misfiled as a "valuation" in `09-Valuations/Asset-Inventory/`.
- **Security concern:** `01-Trust-Instrument/Incoming Instruments/NC Quick Pass/Discharge Outline-2026-07-31.txt` responds to what looks like a smishing scam (`ncquickpats.help` — misspelled domain), not a real toll notice.
- Minor: empty `05-Labels/PLS780 4x2.5/` folder; two non-identical 8822-B filings ~2 weeks apart in `02-Recorded-Documents` (confirm which supersedes).

### 03-Banking, 06-Account-Register
- **Statement gaps affecting "Statements Complete" accuracy:** Syrina's Capital One — missing all of 2025 and 2026 (only a raw CSV export exists, no statement PDFs); Syrina's PNC — 4 months behind (no Apr–Jul 2026); Clinton's BOA — 3 months behind.
- Fidelity, TD-Account, and Ally (all Clinton) have onboarding paperwork only — no transaction statements at all in the cabinet.
- **Same institution, different account — don't conflate:** Bank of America, Capital One, and Fidelity each appear twice: once as a real live account (`03-Banking`) and separately as a 2-file dispute/collections item (`06-Account-Register`).
- `06-Account-Register` turned out to be a 34-creditor FCRA dispute/demand-letter campaign archive, not account data. First PREMIER is the only creditor with an actual received response.
- New duplication pattern: ~32 files mirror between `06-Account-Register/<Creditor>/` and `Estates/Clinton-Other-Drafts/AAAReq/...` — looks like an intentional master-draft-to-filing copy, but the two will drift if only one side gets edited going forward.
- Confirmed misfile: Syrina's driver's license photo (`_SW-NCDL.jpeg`) sitting in Clinton's `ID-Copies/` folder.

### 04-Taxes, Employment, Credit-Reports
- **Major cross-check resource:** `04-Taxes/Filing-Systems/Freeway_Filing_System_2025.xlsx` — independently confirms **49 total accounts (37 Syrina + 12 Clinton)** with EIN/address/account-number data for every one. Worth diffing directly against the live Master Register.
- **Policy violation, not just a misfile:** `04-Taxes/Authority/Form-56-Form-2848/fiduciarty sep pkg.zip` contains an explicit household policy — "NEVER reference Shawn's SSN in Clinton's filings," "zero intersection" between the two fiduciary structures. Clinton's 2024 tax return sitting in `Estates/Shawn/Taxes/` breaches this. Recommend removing that stray copy.
- Syrina's `Credit-Reports/Rinas/` folder is completely empty — no raw bureau pulls filed for her anywhere, even though her hand-built credit summary implies they exist somewhere.
- PII flag: `04-Taxes/1099s/IRIS_1099B_Filing_Reference.xlsx` contains both spouses' full SSNs in its Payer Profiles sheet.
- The 2022 tax return is duplicated across **6 locations** under 3 different filenames — candidate for consolidation.
- Clinton's employment paystubs have 3 redundant identical ZIP exports of the same 43-file set.

### Fidelity, Vanguard, Webull, Digital-Binders, 08-Ledgers
- **Confirmed: Syrina has no Fidelity/Vanguard/Webull accounts of her own** — no `Institution/Syrina/` folder exists at any of the three. Rules out further gaps there.
- Vanguard: fully liquidated (Clinton's 401(k) distribution, Apr 2025, plan 266304) — no standing balance, MR-007 already correct.
- Possible missing account: `Freeway_Filing_System_PERSONAL_v2.xlsx` lists a "Fidelity VISA Sig Rewards," last-4 **7456**, attributed to **Syrina** — unclear if this is the same card as MR-137 (Clint's, $0 balance, no last-4 recorded) or a genuinely separate card. Needs a human call, not resolved here.
- `Digital-Binders/Trust Master Account Register (TMAR).xlsx` and the two smaller `Trust_Credits_Binder*.xlsx` files are all confirmed stale/superseded snapshots (cap out around MR-111, no new data) — same pattern as the already-known 11Tab_FULL file.
- `08-Ledgers/Expenses/Wimberly_Annual_Deposit_Register.xlsx`'s "Fidelity Balances" tab is a substantive (not byte-identical) duplicate of data already captured from the net worth CSV.

### Archive, Business, Credentials, Forms-Library, HHHW, 00-Receipts-Invoices, 07-Source-Documents
- **Archive is a partial dumping ground, not purely archival:** `Archive/monthly_data.json` has real, non-superseded BOA/PNC/CapOne monthly transaction summaries; `Archive/Certified Documents/` holds active birth certificates; `Archive/RLT - Scanned Filings Portfolio - Unprocessed.pdf` (filename literally says "Unprocessed") looks like active work-in-progress.
- **`00-Receipts-Invoices/Proof-of-Filing/` is directly actionable:**
  - `Filing-Status-Tracker.md` — independently confirms the $74,218 frozen refund finding from the Adviser Meeting Outline.
  - `Mailing-Chase-List.md` — open items with no proof of mailing, plus 2 flagged internal data conflicts.
  - `2026/TMAR_ENTRY_PACKAGE_2026-05-13.md` — **staged, ready-to-paste ledger entries that appear to have never actually been entered.**
- `Credentials/` is a legitimate, self-contained login vault (18 platforms) but includes a plaintext-password file — flagged for awareness, not a filing issue.
- `Business/` reveals **three distinct business entities**: CWIV Audio Visual Solutions, DomiVia Marketing & Event Management, and SW Autochthonous Avatar (Syrina's sole-proprietorship) — worth confirming each has appropriate Master Register representation if it has its own account.
- `HHHW/` holds recently-executed (POA dated 7/28/26) estate-planning originals with no clear naming rationale explaining why it's separate from the Estates/ structure.

### Estates
- **Only two top-level folders exist:** `Clinton-Other-Drafts/` (Clinton's own material — 421 of 553 files are Python venv tooling cruft, safe to delete; real content is under `Family/`) and `Shawn/` (a genuinely separate person/estate, confirmed out of scope).
- **Cross-contamination found:** `01-Trust-Instrument/Drafts/` (Clinton's own binder) has 13 files belonging to Shawn's trust (VVRLT) mixed in — including one file, `Schedule_A_TrusteePowers_VVRLT_Branch`, that exists **nowhere else, not even in Shawn's own estate folder.**
- Clinton's 2024 tax return duplicated into Shawn's folder — confirmed accidental (traced to a bulk Google Drive download event on 2026-06-24 that swept unrelated files together), and per the 04-Taxes finding above, a breach of the household's own separation policy.

## Action items (needs a human decision, not resolved automatically)

1. Remove Clinton's 2024 tax return from `Estates/Shawn/Taxes/` — breaches the household's own stated fiduciary-separation policy.
2. Decide fate of the 13 misplaced Shawn/VVRLT files in `01-Trust-Instrument/Drafts/` (exclude from Clinton's binder indexing, or relocate to `Estates/Shawn/`) — especially the one file that exists only there.
3. Report/ignore the NC Quick Pass text as a smishing scam.
4. Remove the two unrelated Calvin Cauthen documents from the Wimberly trust folders.
5. Delete the `.venv` in `Estates/Clinton-Other-Drafts/AAAReq/` (421 files, same pattern as the one already removed from Syrina's Auto Loans folder).
6. Resolve whether "Fidelity VISA Sig Rewards" last-4 7456 (Syrina) is the same card as MR-137 (Clint, $0 balance) or a separate untracked account.
7. Confirm/resolve the Continental Finance EIN conflict (20-1477312 vs 20-3038479) — still unresolved from an earlier finding.
8. Decide whether to consolidate the 6-location duplication of the 2022 tax return.
9. Review `TMAR_ENTRY_PACKAGE_2026-05-13.md` and `Mailing-Chase-List.md`'s flagged data conflicts for entry into the live ledger.
10. Cross-check `Freeway_Filing_System_2025.xlsx`'s 49-account list and `APPC_RLT_Retitling_Package_v2.docx`'s full liability ledger line-by-line against the live Master Register.
11. Decide whether `Business/`'s three entities (CWIV Audio Visual, DomiVia, SW Autochthonous Avatar) need their own Master Register rows.
12. Clean up: 3 redundant Clinton paystub ZIPs, 8 duplicate Vanguard 1099-R PDFs (4 unique, each saved twice), the near-duplicate `05-Labels` file variants, `capone_local.xlsx` (stale partial export).
13. Confirm `Credentials/_passwords.local.csv` and related plaintext-password files are excluded from any sync/git path.
14. Decide canonical status of `Legal-Reference/Trust-Law-Books/` vs `07-Source-Documents/Books/` (recommendation: keep both, they're not truly redundant).
15. Consider whether `HHHW/` should be merged into a broader Estates/trust structure.

## Reference

- Full duplicate-group data: `.FC/fc_duplicate_groups.csv` (all 123 groups) and `.FC/fc_other_duplicates_20260802.txt` (100 groups excluding the Books/Legal-Reference pattern)
- This audit does not cover `Estates/Shawn/` account-level detail (confirmed out of scope for Master Register) or `Forms-Library/` beyond a filename-level skim (confirmed to be blank templates)
