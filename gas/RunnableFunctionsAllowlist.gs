/**
 * RunnableFunctionsAllowlist.gs — lets an external caller (Hermes, Claude
 * Code, or anyone with TMAR_API_KEY) invoke a menu-wired function headlessly
 * via the Web App, for live-testing whether it still runs cleanly.
 *
 * Deliberately a hard allowlist (a literal object mapping name -> function
 * reference), not eval()/dynamic global lookup — only functions explicitly
 * listed here can ever be invoked this way, and the full exposed surface is
 * visible in one place.
 *
 * IMPORTANT LIMITATION: most TMAR Tools functions call SpreadsheetApp.getUi()
 * somewhere, often just for a final confirmation alert(). getUi() throws
 * when there's no live interactive Sheets session behind the call (which a
 * Web App request never has) — so a function invoked this way that reaches
 * its getUi() line will report an error even if everything before that line
 * ran correctly. Read the `error` field in the response to tell "real logic
 * broke" from "hit the expected getUi() wall at the end" (the latter usually
 * has "getUi" or "no user interface" in the message).
 *
 * DELIBERATELY EXCLUDED from this allowlist (do not add without a specific
 * reason and a human decision):
 *   - addSampleData            — writes fake demo rows into the LIVE sheet
 *   - emailGapReport           — sends a real email as a side effect
 *   - confirmAndExecuteCleanup — name implies a destructive, confirmation-gated op
 *   - importClintCreditReportAccounts / importSyrinaAutoLoan /
 *     importAllCreditReportAccounts — write to Master Register; this
 *     project spent 2026-08-01/02 hand-correcting that exact data, and
 *     their dedup-by-provider-name logic hasn't been re-verified against
 *     the current row set. Test these manually via the menu first.
 *   - installDocRegistryTrigger / removeDocRegistryTrigger — modifies
 *     time-driven trigger configuration, a persistent side effect beyond
 *     just sheet data.
 *   - runDriveFileCabinetScan / applyDriveFileCabinetScan /
 *     undoDriveScanApply — touches Document Registry via a Drive scan;
 *     safety not yet verified.
 *   - All show*Dialog / show*Interface / navigate* / filter* functions —
 *     these ARE the UI call; there's no headless version of them to test.
 *     Only a live browser session can exercise these.
 */

var RUNNABLE_FUNCTIONS_ = {
  // Formatting — visual/reversible, not financially destructive
  'menuApplyAllFormatting': menuApplyAllFormatting,
  'menuRefreshTabColors': menuRefreshTabColors,
  'menuRefreshDataValidation': menuRefreshDataValidation,
  'menuRefreshConditionalFmt': menuRefreshConditionalFmt,
  'menuRefreshFilters': menuRefreshFilters,
  'menuRefreshHeaderProtection': menuRefreshHeaderProtection,
  'applyAllEnhancements': applyAllEnhancements,
  'menuApplyLegendBlocks': menuApplyLegendBlocks,
  'menuApplyFinePrint': menuApplyFinePrint,
  'menuApplyPartyColors': menuApplyPartyColors,
  'runFormattingHealthAudit': runFormattingHealthAudit,
  'fixAllFormattingIssues': fixAllFormattingIssues,
  'diagnoseLegendAndAttribution': diagnoseLegendAndAttribution,

  // TMAR Engine — calculate/view/refresh, non-destructive
  'calculateDNI': calculateDNI,
  'viewTrialBalance': viewTrialBalance,
  'viewOverdueTasks': viewOverdueTasks,
  'viewUpcomingTasks': viewUpcomingTasks,
  'refreshComplianceSheet': refreshComplianceSheet,
  'refreshDocumentList': refreshDocumentList,

  // Setup/administration — idempotent, safe to re-run
  'populateValidationSheet': populateValidationSheet,
  'refreshDashboard': refreshDashboard,
  'exportToPdf': exportToPdf,

  // Gap scanning — read/report, no writes beyond a report tab
  'runFullGapScan': runFullGapScan,
  'scanCurrentTab': scanCurrentTab,

  // CPA Questions — read-oriented
  'generateCPAMeetingPrep': generateCPAMeetingPrep,

  // AppScripts inventory — writes only to the AppScripts tab, safe to re-run
  'populateAppScriptsInventory': populateAppScriptsInventory,
  'refreshAppScriptsHealth': refreshAppScriptsHealth
};

/**
 * Runs an allowlisted function and reports what happened, without letting an
 * exception (e.g. from getUi()) escape as an opaque platform error page.
 */
function runAllowlistedFunction_(functionName) {
  if (!RUNNABLE_FUNCTIONS_.hasOwnProperty(functionName)) {
    return {
      status: 'error',
      action: 'runFunction',
      function: functionName,
      error: 'Not in allowlist. Available: ' + Object.keys(RUNNABLE_FUNCTIONS_).join(', ')
    };
  }
  try {
    var result = RUNNABLE_FUNCTIONS_[functionName]();
    return { status: 'ok', action: 'runFunction', function: functionName, result: (result === undefined ? null : result) };
  } catch (err) {
    var msg = err.message || String(err);
    var likelyUiWall = /getUi|no user interface|user-interface/i.test(msg);
    return {
      status: 'error',
      action: 'runFunction',
      function: functionName,
      error: msg,
      likelyExpectedUiWall: likelyUiWall
    };
  }
}
