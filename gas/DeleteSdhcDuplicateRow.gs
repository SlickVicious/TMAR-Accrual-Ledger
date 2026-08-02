/**
 * DeleteSdhcDuplicateRow.gs — one-time removal of the redundant blank-ID SDHC
 * Property Rentals row in Master Register. Its consolidation note ("merged
 * MR-011 + MR-050 — DELETE row MR-050") is stale — both MR-050 and the two
 * other explicitly-noted consolidation targets (MR-033, MR-039) were already
 * deleted at some point before 2026-08-01. Only this one straggler remains.
 * The row's one piece of non-redundant info (landlord name, restated
 * Acct#/EIN) was merged into MR-011's Notes field before this script runs —
 * do not run this until that's confirmed.
 *
 * Matches ONLY a row where: Row ID is blank AND Provider = "SDHC Property
 * Rentals" AND Notes contains "DELETE row MR-050" — narrow enough that it
 * cannot accidentally match MR-011 (which has a real Row ID and a short,
 * different Notes value).
 *
 * Usage (Apps Script editor, bound to Live):
 *   1. previewSdhcDuplicateRow() → read-only; logs the matched row number
 *   2. deleteSdhcDuplicateRow()  → deletes that exact row
 */

function _findSdhcDuplicateRow_(sheet) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) { // skip header row
    var rowId = String(data[i][0] || '').trim();
    var provider = String(data[i][2] || '').trim();
    var notes = String(data[i][26] || '');
    if (!rowId && provider === 'SDHC Property Rentals' && notes.indexOf('DELETE row MR-050') !== -1) {
      return i + 1; // 1-based sheet row number
    }
  }
  return -1;
}

function previewSdhcDuplicateRow() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var rowNum = _findSdhcDuplicateRow_(sheet);
  if (rowNum === -1) return 'No matching row found — already deleted, or the note text changed.';
  var row = sheet.getRange(rowNum, 1, 1, 29).getValues()[0];
  Logger.log('Would delete sheet row ' + rowNum + ': ' + JSON.stringify(row));
  return 'Match: sheet row ' + rowNum + '. See View > Logs for full row content.';
}

/**
 * DIAGNOSTIC: why won't MR-011's Notes field update via pushEntities_?
 * Checks for a data validation rule on that specific cell and attempts a
 * direct write, reporting the exact exception if one is thrown.
 */
function diagnoseMr011NotesWrite() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var data = sheet.getDataRange().getValues();
  var rowNum = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === 'MR-011') { rowNum = i + 1; break; }
  }
  if (rowNum === -1) return 'MR-011 not found';
  var cell = sheet.getRange(rowNum, 27); // Notes column
  var rule = cell.getDataValidation();
  var report = 'MR-011 is sheet row ' + rowNum + '. Notes cell validation: ' +
    (rule ? rule.getCriteriaType() + ' — ' + JSON.stringify(rule.getCriteriaValues()) : 'none') + '. ';
  try {
    cell.setValue('Rent increased Jul 2025. Acct# 938806. EIN 47-3246377. Landlord: Streamline Development.');
    SpreadsheetApp.flush();
    report += 'Direct write SUCCEEDED, new value: ' + JSON.stringify(cell.getValue());
  } catch (e) {
    report += 'Direct write FAILED: ' + e.message;
  }
  Logger.log(report);
  return report;
}

function deleteSdhcDuplicateRow() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var rowNum = _findSdhcDuplicateRow_(sheet);
  if (rowNum === -1) return 'No matching row found — nothing to delete.';
  sheet.deleteRow(rowNum);
  return 'Deleted sheet row ' + rowNum + ' (redundant SDHC Property Rentals duplicate).';
}
