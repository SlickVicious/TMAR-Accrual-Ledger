/**
 * FixCurrentBalanceValidation.gs — remove the wrong data validation on Master
 * Register column K (Current Balance). Discovered 2026-08-01 while fixing the
 * credit-report-import column shift (MR-112/114/116/146): column K currently
 * rejects any value that isn't in a Status-style list (Active, Closed, Charged
 * Off, etc.), even though the header says "Current Balance" and should hold a
 * dollar figure — confirmed by MR-005/MR-030 already holding real numeric
 * balances there. Every credit-report-imported row (~28 of them) has a
 * status-like value sitting in this column as a symptom of the same bug.
 * This blocked every currentBalance write via pushEntities_ with a silent
 * abort (the validation exception, thrown with no try/catch and no flush(),
 * killed the whole upsert before any pending field writes committed).
 *
 * Usage (Apps Script editor, bound to Live):
 *   1. previewCurrentBalanceValidation() → read-only; logs the current rule
 *   2. clearCurrentBalanceValidation()   → removes it from the whole column
 */

function previewCurrentBalanceValidation() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(2, 11, lastRow - 1, 1); // column K, all data rows
  var rule = range.getDataValidations()[0][0];
  if (!rule) return 'No data validation rule found on column K — nothing to clear.';
  var criteria = rule.getCriteriaType();
  Logger.log('Column K validation: ' + criteria + ' — ' + JSON.stringify(rule.getCriteriaValues()));
  return 'Rule found: ' + criteria + '. See View > Logs for details.';
}

function clearCurrentBalanceValidation() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(2, 11, lastRow - 1, 1); // column K, all data rows
  range.clearDataValidations();
  Logger.log('Cleared data validation from Master Register column K (Current Balance), rows 2-' + lastRow);
  return 'Cleared. Current Balance (column K) now accepts free-form values.';
}

/**
 * One-time cleanup: clear column 39 (AM), a blank/legend overflow column used
 * temporarily to write diagnostic traces while debugging pushEntities_
 * (2026-08-01). Safe to run for the whole sheet — this column holds no real
 * schema data.
 */
function clearDiagnosticTraceColumn() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var lastRow = sheet.getLastRow();
  sheet.getRange(2, 39, lastRow - 1, 1).clearContent();
  return 'Cleared column 39 (diagnostic trace) for all data rows.';
}
