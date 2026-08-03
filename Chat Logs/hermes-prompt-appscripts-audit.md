# Hermes prompt — live-test TMAR Tools menu, populate the AppScripts sheet

Paste this into Hermes. It picks up where static analysis left off — everything below
that static analysis *could* determine is already done; this is the live-testing pass
that needs an actual Google Sheets session.

---

I'm auditing the "TMAR Tools" custom menu in the TMAR Live Google Sheet
(`1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ`, Apps Script project
`1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr`) to populate a currently-empty
"AppScripts" tab (columns: Function | File | What it does) with an accurate, current
inventory — removing one-off scripts, documenting what's actually functional.

**Static analysis already done** (via Claude Code, cross-referencing `Code.gs`'s
`onOpen()` menu registration against every `.gs` file in the `gas/` folder):

- All 66 menu-wired function names have a matching `function` definition somewhere in
  the project. Zero orphaned menu items at the code level.
- 10 files have ZERO functions wired into the menu:
  `addFillingPackage2025.gs`, `DeleteSdhcDuplicateRow.gs`, `FixCurrentBalanceValidation.gs`,
  `FixOriginalBalanceDateFormat.gs`, `PopulateProofOfMailing.gs`, `RemoveArchiveBanner.gs`,
  `RetireTrustLedger.gs`, `TabConsolidationAudit.gs`, `TMAR_AestheticsAndAudit.gs`,
  `TransactionLedgerTrackingFix.gs`.
  - `PopulateProofOfMailing.gs` is NOT dead — 2 of its functions (`pomRecords_`,
    `refreshProofOfMailing`) are called internally from `SyncCenter.gs`. It's a library,
    just not directly menu-exposed.
  - `TMAR_AestheticsAndAudit.gs` is the interesting one: its function names
    (`runHealthAudit`, `colorMasterRegisterRows`, `insertAllLegends`,
    `applyAesthetics`) sound like genuine ongoing tools, not one-time fixes — but the
    *menu* has near-identically-named items ("Run Health Audit", "Apply Party Row
    Colors", "Add Legend Blocks") that are wired to **`FormattingComplement.gs`**
    instead. Figure out: is `TMAR_AestheticsAndAudit.gs` a superseded predecessor of
    `FormattingComplement.gs`'s formatting menu (safe to archive), or does it do
    something genuinely different that got orphaned from the menu by accident (should
    be re-wired)? Read both files and compare.
  - The rest (`addFillingPackage2025.gs`, `DeleteSdhcDuplicateRow.gs`,
    `FixCurrentBalanceValidation.gs`, `FixOriginalBalanceDateFormat.gs`,
    `RemoveArchiveBanner.gs`, `RetireTrustLedger.gs`, `TabConsolidationAudit.gs`,
    `TransactionLedgerTrackingFix.gs`) are one-time maintenance/migration scripts
    (some run this session, some from earlier project history) — legitimate one-offs,
    good candidates for an "ARCHIVED / one-time use, already run" category rather than
    deletion (they document real fixes and should stay in git history/the file even if
    flagged inactive).

**What I need you to do** (things that need an actual live Sheets session, not just
reading code):

1. Open the TMAR Live sheet, click through every submenu under "TMAR Tools" (Control
   Panel, Universal Accrual Ledger, Bill of Exchange, EIN Verifier, Document Generator,
   Analyze Duplicates, Execute Cleanup, Year Settings, Dashboard, Data Gap Scanner, CPA
   Questions, Import Tools, Setup & Administration, Formatting, 🏦 TMAR Engine, About).
2. For each menu item, actually invoke it (where safe — read-only/view items are safe
   to click; anything that writes data, ask me first or use a duplicate/test copy of
   the sheet if one exists) and note: does it open/run without error, or does it throw
   (missing sheet, stale range reference, undefined variable, etc.)?
3. Pay special attention to the "🏦 TMAR Engine" submenu (Calculate DNI, View Trial
   Balance, View Overdue/Upcoming Tasks, Refresh Compliance Sheet, Refresh Document
   List) and "Import Tools" → "📥 Import Clinton/Syrina/ALL Credit Report" — these
   read from `TMAREngine.gs` and `CreditReportImport.gs` respectively. Note on the
   credit-report importers: I already fixed a stale-schema bug in
   `CreditReportImport.gs` on 2026-08-01, verified against the live 29-column Master
   Register header — they should be safe to run now, but confirm the dedup logic
   correctly skips accounts that already exist (I manually corrected most of what
   these importers would add, earlier in this project).
4. For `TMAR_AestheticsAndAudit.gs` specifically — determine live whether it's dead
   code or an accidentally-unwired tool, per the question above.
5. Write the results into the "AppScripts" tab (columns: Function | File | What it
   does) — one row per function that's either menu-wired or a legitimate standalone
   tool, with a clear status (Active / Needs Fix / Archived-one-time-use) and a short
   description. Skip internal helper functions (ones with a trailing underscore, e.g.
   `_liveSheetByGid_`) — just the entry points.

This is the Live production workbook — if any menu item is a destructive/write
operation, don't execute it blind; either check with me first or verify against a
duplicate/test copy.
