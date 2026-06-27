/**
 * RemoveArchiveBanner.gs — one-shot cleanup for the stale 2026-06-04
 * "ARCHIVED — DO NOT EDIT" notice tab left in the Live book. That notice points
 * edits to the old APPC hub (1Ac5A…), but the 2026-06-27 consolidation made the
 * Live book (TMAR_CONFIG.liveBookId) the single source of truth — so the notice
 * is now backwards and should go.
 *
 * USAGE (Apps Script editor → Run):
 *   1. previewArchiveTab()  → check Execution log; confirm it's the notice tab.
 *   2. deleteArchiveTab()   → removes it (guarded so it can't hit a data sheet).
 *
 * Targets the tab BY GID (not name), and refuses to delete anything that looks
 * like real data (too large, or missing the archive text).
 */
var ARCHIVE_NOTICE_GID_ = 1647649900;

function _liveSheetByGid_(gid) {
  var ss = SpreadsheetApp.openById(TMAR_CONFIG.liveBookId);
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === gid) return { ss: ss, sheet: sheets[i] };
  }
  return { ss: ss, sheet: null };
}

function previewArchiveTab() {
  var r = _liveSheetByGid_(ARCHIVE_NOTICE_GID_);
  if (!r.sheet) { Logger.log('No tab with gid %s in Live book — already removed?', ARCHIVE_NOTICE_GID_); return; }
  var sh = r.sheet;
  var rows = Math.min(10, sh.getLastRow() || 1);
  var cols = Math.min(3, sh.getLastColumn() || 1);
  Logger.log('Tab "%s" | lastRow=%s lastCol=%s', sh.getName(), sh.getLastRow(), sh.getLastColumn());
  Logger.log('Top cells:\n%s', JSON.stringify(sh.getRange(1, 1, rows, cols).getValues(), null, 2));
}

function deleteArchiveTab() {
  var r = _liveSheetByGid_(ARCHIVE_NOTICE_GID_);
  if (!r.sheet) { Logger.log('Already gone — no tab with gid %s.', ARCHIVE_NOTICE_GID_); return; }
  var sh = r.sheet, name = sh.getName();
  // Guard 1: must be a small notice tab, never a data sheet (e.g. Master Register = 35 cols).
  if (sh.getLastColumn() > 2 || sh.getLastRow() > 12) {
    Logger.log('ABORT: tab "%s" is %sx%s — too large to be the notice. Inspect/delete manually.', name, sh.getLastRow(), sh.getLastColumn());
    return;
  }
  // Guard 2: must actually contain the archive text.
  var blob = JSON.stringify(sh.getRange(1, 1, Math.min(8, sh.getLastRow() || 1), Math.min(2, sh.getLastColumn() || 1)).getValues()).toUpperCase();
  if (blob.indexOf('ARCHIVED') === -1 && blob.indexOf('ABSORBED') === -1) {
    Logger.log('ABORT: tab "%s" has no ARCHIVED/ABSORBED text — not the notice. Inspect/delete manually.', name);
    return;
  }
  // Guard 3: never delete the last remaining sheet.
  if (r.ss.getSheets().length <= 1) { Logger.log('ABORT: only one sheet in book.'); return; }
  r.ss.deleteSheet(sh);
  Logger.log('Deleted archive-notice tab "%s" (gid %s) from Live book.', name, ARCHIVE_NOTICE_GID_);
}
