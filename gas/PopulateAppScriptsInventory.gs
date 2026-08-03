/**
 * PopulateAppScriptsInventory.gs — one-time population of the AppScripts tab
 * from the audit Hermes ran 2026-08-02 (docs/AppScripts_Inventory.tsv, 82
 * entries, deduped to 80 -- migrateDocRegistryPaths and
 * runDriveFileCabinetScan were each listed twice). The sheet's existing
 * headers are Function | (blank) | File | (blank) | What it does (columns
 * A/C/E) -- this adds a Status column (F) rather than repurpose the blank
 * spacer columns, in case those are used for formatting elsewhere.
 *
 * Usage (Apps Script editor, bound to Live): run populateAppScriptsInventory()
 */
function populateAppScriptsInventory() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('AppScripts');
  if (!sheet) return 'AppScripts tab not found';

  var rows = [
    ['showControlPanel', 'GUIFunctions.gs', 'Opens Control Panel HTML dialog', 'Active'],
    ['showGAAPInterface', 'GUIFunctions.gs', 'Opens Universal Accrual Ledger (GAAP) interface', 'Active'],
    ['showBillOfExchange', 'GUIFunctions.gs', 'Opens Bill of Exchange dialog', 'Active'],
    ['showEINVerifier', 'GUIFunctions.gs', 'Opens EIN Verifier tool', 'Active'],
    ['showDocumentGenerator', 'GUIFunctions.gs', 'Opens Document Generator dialog', 'Active'],
    ['showDuplicateAnalysisReport', 'DuplicateAnalyzer.gs', 'Analyzes Master Register for duplicate accounts', 'Active'],
    ['confirmAndExecuteCleanup', 'ExecuteCleanup.gs', 'Confirms and runs cleanup of flagged rows', 'Active'],
    ['showYearSelector', 'GUIFunctions.gs', 'Shows dialog to set active tax year', 'Active'],
    ['showCurrentYear', 'GUIFunctions.gs', 'Displays current active year', 'Active'],
    ['showDataCompletenessDashboard', 'GUIFunctions.gs', 'Opens data completeness diagnostic dashboard', 'Active'],
    ['resetToDefaultYear', 'GUIFunctions.gs', 'Resets year to current calendar year', 'Active'],
    ['showTMARDashboard', 'GUIFunctions.gs', 'Opens TMAR dashboard HTML view', 'Active'],
    ['showFinancialSummary', 'TMARBridge.gs', 'Shows financial summary dialog', 'Active'],
    ['showAddAccountDialog', 'GUIFunctions.gs', 'Opens Add Account dialog (also in Import Tools)', 'Active'],
    ['runFullGapScan', 'Code.gs', 'Runs full workbook gap scan across all tabs', 'Active'],
    ['scanCurrentTab', 'Code.gs', 'Scans only the currently active tab for gaps', 'Active'],
    ['navigateToGapReport', 'Code.gs', 'Navigates to the Gap Report tab', 'Active'],
    ['navigateToDocRegistry', 'Code.gs', 'Navigates to the Document Registry tab', 'Active'],
    ['showImportRegistryScanDialog', 'ImportRegistryScan.gs', 'Opens dialog to paste and import registry scan output', 'Active'],
    ['runDriveFileCabinetScan', 'ScanDriveFileCabinet.gs', 'Scans Google Drive mirror of FileCabinet for file inventory', 'Active'],
    ['applyDriveFileCabinetScan', 'ScanDriveFileCabinet.gs', 'Applies Drive FC scan results to Document Registry', 'Active'],
    ['undoDriveScanApply', 'ScanDriveFileCabinet.gs', 'Undoes last Drive FC scan apply', 'Active'],
    ['showReconcileDialog', 'GUIFunctions.gs', 'Opens Reconcile & Cross-Fill dialog', 'Active'],
    ['installDocRegistryTrigger', 'DocumentRegistryTrigger.gs', 'Installs auto-ID and date trigger on Document Registry', 'Active'],
    ['removeDocRegistryTrigger', 'DocumentRegistryTrigger.gs', 'Removes auto-ID and date trigger from Document Registry', 'Active'],
    ['migrateDocRegistryPaths', 'Code.gs', 'One-time migration of absolute to relative paths in Document Registry -- already run', 'Archived-one-time-use'],
    ['emailGapReport', 'Code.gs', 'Emails gap scan report', 'Active'],
    ['showAddQuestionDialog', 'GUIFunctions.gs', 'Opens dialog to add new CPA question', 'Active'],
    ['navigateToCPASheet', 'Code.gs', 'Navigates to CPA Questions tab', 'Active'],
    ['filterCPAOpen', 'Code.gs', 'Filters CPA Questions to show open items only', 'Active'],
    ['filterCPAPriority', 'Code.gs', 'Filters CPA Questions by priority level', 'Active'],
    ['clearCPAFilters', 'Code.gs', 'Clears all CPA Questions filters', 'Active'],
    ['generateCPAMeetingPrep', 'Code.gs', 'Generates CPA meeting preparation document', 'Active'],
    ['showCSVImportDialog', 'GUIFunctions.gs', 'Opens CSV transaction import dialog', 'Active'],
    ['showAddObligationDialog', 'GUIFunctions.gs', 'Opens Add Obligation entry dialog', 'Active'],
    ['showAddSubscriptionDialog', 'GUIFunctions.gs', 'Opens Add Subscription entry dialog', 'Active'],
    ['showLedgerImportDialog', 'SyncCenter.gs', 'Opens Import from Accrual Ledger dialog', 'Active'],
    ['importClintCreditReportAccounts', 'CreditReportImport.gs', "Imports Clinton's credit report accounts to Master Register", 'Active (schema fixed 2026-08-01)'],
    ['importSyrinaAutoLoan', 'CreditReportImport.gs', "Imports Syrina's Kia auto loan to Master Register", 'Active (schema fixed 2026-08-01)'],
    ['importAllCreditReportAccounts', 'CreditReportImport.gs', 'Imports ALL credit report accounts (Clint + Syrina)', 'Active (schema fixed 2026-08-01)'],
    ['populateValidationSheet', 'PopulateValidation.gs', 'Populates dropdown validation values on _Validation tab', 'Active'],
    ['refreshDashboard', 'Code.gs', 'Refreshes dashboard formulas', 'Active'],
    ['addSampleData', 'Code.gs', 'Adds demo sample data for testing', 'Active'],
    ['exportToPdf', 'Code.gs', 'Exports current tab to PDF', 'Active'],
    ['menuApplyAllFormatting', 'FormattingComplement.gs', 'Applies all formatting (tabs, validation, conditional, filters, headers)', 'Active'],
    ['menuRefreshTabColors', 'FormattingComplement.gs', 'Refreshes tab color coding', 'Active'],
    ['menuRefreshDataValidation', 'FormattingComplement.gs', 'Refreshes data validation dropdowns', 'Active'],
    ['menuRefreshConditionalFmt', 'FormattingComplement.gs', 'Refreshes conditional formatting rules', 'Active'],
    ['menuRefreshFilters', 'FormattingComplement.gs', 'Refreshes filter views', 'Active'],
    ['menuRefreshHeaderProtection', 'FormattingComplement.gs', 'Refreshes header row protection', 'Active'],
    ['applyAllEnhancements', 'FormattingComplement.gs', 'Applies legend blocks, attribution stamps, and party row colors', 'Active'],
    ['menuApplyLegendBlocks', 'FormattingComplement.gs', 'Adds color legend blocks to sheets', 'Active'],
    ['menuApplyFinePrint', 'FormattingComplement.gs', 'Adds fine-print attribution stamps', 'Active'],
    ['menuApplyPartyColors', 'FormattingComplement.gs', 'Applies party-based row color coding', 'Active'],
    ['runFormattingHealthAudit', 'FormattingComplement.gs', 'Runs workbook formatting health audit', 'Active'],
    ['fixAllFormattingIssues', 'FormattingComplement.gs', 'Auto-fixes detected formatting issues', 'Active'],
    ['diagnoseLegendAndAttribution', 'FormattingComplement.gs', 'Diagnoses issues with legend blocks and attribution stamps', 'Active'],
    ['calculateDNI', 'TMAREngine.gs', 'Calculates Distributable Net Income for trust', 'Active'],
    ['viewTrialBalance', 'TMAREngine.gs', 'Displays trial balance report', 'Active'],
    ['viewOverdueTasks', 'TMAREngine.gs', 'Shows overdue compliance tasks', 'Active'],
    ['viewUpcomingTasks', 'TMAREngine.gs', 'Shows upcoming compliance tasks (next 30 days)', 'Active'],
    ['refreshComplianceSheet', 'TMAREngine.gs', 'Refreshes compliance tracking sheet', 'Active'],
    ['refreshDocumentList', 'TMAREngine.gs', 'Refreshes document list from registry', 'Active'],
    ['showAboutDialog', 'GUIFunctions.gs', 'Shows workbook info dialog', 'Active'],
    ['showHelpDialog', 'GUIFunctions.gs', 'Shows help & documentation dialog', 'Active'],
    ['refreshProofOfMailing', 'PopulateProofOfMailing.gs', 'Refreshes Proof of Mailing data (called from SyncCenter doPost)', 'Library (internal)'],
    ['pomRecords_', 'PopulateProofOfMailing.gs', 'Internal helper for proof of mailing records (called from SyncCenter)', 'Library (internal)'],
    ['pushRegistryScan', 'SyncCenter.gs', 'doPost endpoint: imports registry scan TSV (added 2026-08-01)', 'Active (needs redeploy)'],
    ['runHealthAudit', 'TMAR_AestheticsAndAudit.gs', 'ORIGINAL health audit -- superseded by runFormattingHealthAudit in FormattingComplement.gs', 'Superseded'],
    ['colorMasterRegisterRows', 'TMAR_AestheticsAndAudit.gs', 'ORIGINAL row coloring -- superseded by applyPartyRowColoring in FormattingComplement.gs', 'Superseded'],
    ['insertAllLegends', 'TMAR_AestheticsAndAudit.gs', 'ORIGINAL legend blocks -- superseded by applyLegendBlocks in FormattingComplement.gs', 'Superseded'],
    ['applyAesthetics', 'TMAR_AestheticsAndAudit.gs', 'ORIGINAL aesthetics wrapper -- superseded by applyAllEnhancements in FormattingComplement.gs', 'Superseded'],
    ['addFillingPackage2025.gs (all functions)', 'addFillingPackage2025.gs', 'One-time 2025 tax filing package generation', 'Archived-one-time-use'],
    ['DeleteSdhcDuplicateRow (all)', 'DeleteSdhcDuplicateRow.gs', 'One-time SDHC duplicate row deletion script', 'Archived-one-time-use'],
    ['FixCurrentBalanceValidation (all)', 'FixCurrentBalanceValidation.gs', 'One-time fix for Current Balance column validation', 'Archived-one-time-use'],
    ['FixOriginalBalanceDateFormat (all)', 'FixOriginalBalanceDateFormat.gs', 'One-time fixes: Original Balance date format, Phase 2/3/4 structural gaps and cleanup, Nelnet account numbers', 'Archived-one-time-use'],
    ['RemoveArchiveBanner.gs (all)', 'RemoveArchiveBanner.gs', 'One-time cleanup: removes archive banner', 'Archived-one-time-use'],
    ['RetireTrustLedger.gs (all)', 'RetireTrustLedger.gs', 'One-time retirement of Trust Ledger tab', 'Archived-one-time-use'],
    ['TabConsolidationAudit.gs (all)', 'TabConsolidationAudit.gs', 'One-time tab consolidation audit toolkit', 'Archived-one-time-use'],
    ['TransactionLedgerTrackingFix.gs (all)', 'TransactionLedgerTrackingFix.gs', 'One-time fix for Transaction Ledger tracking columns', 'Archived-one-time-use']
  ];

  // Ensure a Status header exists in column F without disturbing the existing
  // A/C/E layout (columns B and D are blank spacers in the current sheet).
  sheet.getRange(1, 6).setValue('Status');

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
  }

  var out = rows.map(function(r) {
    return [r[0], '', r[1], '', r[2], r[3]];
  });
  sheet.getRange(2, 1, out.length, 6).setValues(out);

  return 'Wrote ' + out.length + ' rows to AppScripts.';
}

/**
 * refreshAppScriptsHealth() — adds Health (G) and Notes (H) columns to the
 * AppScripts tab from a real live-test + static-review pass (2026-08-03: 5
 * parallel agents covering all 65 non-archived menu functions). Also updates
 * Status (F) for the 3 functions that got a real code fix this pass. Keyed
 * by function name against whatever populateAppScriptsInventory() already
 * wrote to column A -- run that first if the sheet is empty.
 *
 * Usage (Apps Script editor, bound to Live): run refreshAppScriptsHealth()
 */
function refreshAppScriptsHealth() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('AppScripts');
  if (!sheet) return 'AppScripts tab not found';

  var health = {
    'showFinancialSummary': ['FLAG-HIGH: BROKEN', 'FinancialSummary.html does not exist anywhere in the repo -- menu item throws on click. Its data source readMasterRegisterAccounts_() also never got the 2026-08-01 29-col fix (balance reads Next Payment Due, not Current Balance). Needs a decision, not a quick patch.'],
    'showAddAccountDialog': ['FLAG-HIGH: DUPLICATE DEF', 'Defined twice under the identical global name (Code.gs:3188 and TMARBridge.gs:20) -- only one survives; both "Add Account" menu items trigger whichever wins. Needs a decision on which implementation to keep.'],
    'confirmAndExecuteCleanup': ['FLAG-HIGH', 'Its archive step (archiveDuplicateAccounts) still uses stale getRange(...,35); hardcoded Feb-2026 MR-ID list is likely stale. Do not run until reviewed.'],
    'refreshDashboard': ['FLAG-HIGH: BROKEN', 'Looks for "Dashboard"/"Executive Dashboard" -- neither exists; real tab is emoji-prefixed "📋 Dashboard", which is a hand-built trust-binder cover page, NOT this function\'s expected summary layout. Pointing it there would overwrite real content. Needs an operator decision, not an auto-fix.',],
    'addSampleData': ['FLAG (by design)', 'Read-only review confirms it writes 4 demo rows with a blank Row ID (breaks MR-NNN join key) and an invalid Account Subtype value. Excluded from live-invoke; do not run against production.'],
    'importClintCreditReportAccounts': ['FLAG-HIGH: DEDUP BROKEN', 'Existing-account check compares Account Subtype (col G) to incoming Account Type -- essentially never matches, so reruns will duplicate rows. Do not run until fixed.'],
    'importSyrinaAutoLoan': ['FLAG-HIGH: DEDUP BROKEN', 'Same shared dedup bug as importClintCreditReportAccounts.'],
    'importAllCreditReportAccounts': ['FLAG-HIGH: DEDUP BROKEN', 'Same dedup bug. colorCodeMasterRegisterRows_() (called after every import) is also a silent no-op -- wrong column anchors, never colors a row.'],
    'menuApplyAllFormatting': ['FIXED', 'Was FAIL (merge-cell filter crash via createFilterViews()). Fixed 2026-08-03 by delegating to the already-safe createFilterViewsSafe_(); re-verified live, deployed @37.'],
    'menuRefreshFilters': ['FIXED', 'Same merge-cell crash, same fix, same root cause as menuApplyAllFormatting. Re-verified live: status ok.'],
    'runFormattingHealthAudit': ['FIXED', 'Dropdowns check had all 4 Master Register column indices drifted from the pre-2026-08-01 schema (checking Balance/Statements-Complete/out-of-range instead of Subtype/Status/Primary-User/Discovery-Status). Fixed 2026-08-03, deployed @37.'],
    'installDocRegistryTrigger': ['FIXED (minor)', 'DOC-ID regex was exact 4-digit only, inconsistent with the 4-or-more convention used elsewhere -- would misfire past DOC-9999. Fixed 2026-08-03.'],
    'runFullGapScan': ['CLEAN (minor)', 'Live-tested PASS, wrote real Gap Report. Hardcodes a dead "Executive Dashboard" scanner key -- harmless no-op for that one scanner.'],
    'scanCurrentTab': ['CLEAN (minor)', 'Same dead scanner-map key as runFullGapScan; harmless.'],
    'showAddQuestionDialog': ['FLAG', 'Related-Tab dropdown offers a dead "Executive Dashboard" option. Non-crashing.'],
    'navigateToCPASheet': ['FLAG', 'Shares ensureCPASheet_() which hardcodes the same dead tab name in a dropdown list; dormant since CPA Questions already exists.'],
    'filterCPAOpen': ['FLAG', 'Same latent ensureCPASheet_() dependency.'],
    'filterCPAPriority': ['FLAG', 'Same latent ensureCPASheet_() dependency.'],
    'clearCPAFilters': ['FLAG', 'Same latent ensureCPASheet_() dependency.'],
    'menuRefreshTabColors': ['CLEAN (minor)', 'Live-tested PASS. Dead "Executive Dashboard" color-map entry, harmless.'],
    'menuRefreshHeaderProtection': ['CLEAN (minor)', 'Live-tested PASS. Dead "Executive Dashboard" protection-target entry, harmless.'],
    'menuApplyFinePrint': ['CLEAN (minor)', 'Live-tested PASS. Dead "Executive Dashboard" stamp-target entry, harmless.'],
    'diagnoseLegendAndAttribution': ['CLEAN (minor)', 'Live-tested, real logic ran. Dead "Executive Dashboard" entry, harmless.'],
    'menuApplyLegendBlocks': ['CLEAN (cosmetic)', 'Live-tested PASS. Legend-column requirement still based on old 35-col width, but numerically safe (37/39 > real 29-col data) -- just extra blank columns before the legend.'],
    'fixAllFormattingIssues': ['CLEAN (caveat)', 'Live-tested PASS, but each of its 9 phases swallows exceptions internally (Logger.log only) -- a PASS only proves the wrapper did not throw, not that all 9 phases succeeded.'],
    'calculateDNI': ['UNTESTABLE', 'getUi() called as its 2nd statement, before any real computation -- headless test can never validate the actual DNI math.'],
    'viewTrialBalance': ['UNTESTABLE', 'Same early-getUi() pattern.'],
    'viewOverdueTasks': ['UNTESTABLE', 'Shared _loadComplianceSheet_() calls getUi() before its fallback tab lookup even runs.'],
    'viewUpcomingTasks': ['UNTESTABLE', 'Same _loadComplianceSheet_() pattern.'],
    'refreshComplianceSheet': ['UNTESTABLE', 'Same _loadComplianceSheet_() pattern.'],
    'refreshDocumentList': ['UNTESTABLE', 'getUi() called before its Document Inventory -> Document Registry fallback lookup runs.'],
    'colorCodeMasterRegisterRows_': ['FLAG: DEAD CODE', 'Internal helper, wrong column anchors (status/credit-status), never colors a row.'],
    'pushRegistryScan': ['NOT RE-VERIFIED', 'doPost endpoint, out of scope for this menu-function pass; carried over reminder it needed a redeploy as of 2026-08-01.']
  };
  var defaultHealth = ['CLEAN', 'Live-tested or statically reviewed 2026-08-03, no issues found.'];
  var notRetested = ['NOT RE-TESTED', 'Correctly triaged as Superseded/Archived-one-time-use; out of scope for this pass.'];

  sheet.getRange(1, 7).setValue('Health (2026-08-03)');
  sheet.getRange(1, 8).setValue('Notes');

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 'No inventory rows found -- run populateAppScriptsInventory() first.';

  var names = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var statuses = sheet.getRange(2, 6, lastRow - 1, 1).getValues();
  var out = [];
  for (var i = 0; i < names.length; i++) {
    var fn = String(names[i][0] || '').trim();
    var status = String(statuses[i][0] || '');
    var isArchived = status.indexOf('Archived') !== -1 || status === 'Superseded';
    var h = health[fn] || (isArchived ? notRetested : defaultHealth);
    out.push(h);
  }
  sheet.getRange(2, 7, out.length, 2).setValues(out);

  // Update Status for the 3 functions that received a real code fix this pass.
  var statusFixes = { 'menuApplyAllFormatting': true, 'menuRefreshFilters': true };
  for (var j = 0; j < names.length; j++) {
    var fname = String(names[j][0] || '').trim();
    if (statusFixes[fname]) {
      sheet.getRange(j + 2, 6).setValue('Active (fixed 2026-08-03)');
    }
  }

  return 'Wrote health/notes for ' + out.length + ' rows to AppScripts.';
}
