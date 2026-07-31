/**
 * RetireTrustLedger.gs — retire the standalone "Trust Ledger" tab in favor of
 * the SCHEDULE A — ASSET INVENTORY section already embedded in
 * "📦 Asset Transfer Log" (Serial/VIN/ID#, FMV method, appraiser, photo-on-file,
 * transfer date, JE ref — richer than Trust Ledger's plain "FWM Binder Tab"
 * reference column). Confirmed 2026-07-31: Trust Ledger had zero asset rows
 * (header + 2 metadata lines only) — nothing to migrate. 📁 Binder Index
 * already treats Asset Transfer Log as the authoritative TAB 4, not Trust
 * Ledger. Hides rather than deletes, matching this workbook's existing
 * pattern for retired tabs (_SyncMeta, Document Registry (Mac legacy), etc.).
 * No GAS or HTML code depends on Trust Ledger's column layout or visibility.
 *
 * Usage (Apps Script editor, bound to Live):
 *   1. previewRetireTrustLedger() → read-only; logs current state
 *   2. retireTrustLedger()        → inserts a deprecation banner + hides the tab
 */

function previewRetireTrustLedger() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Trust Ledger');
  if (!sheet) return 'Trust Ledger tab not found — already removed?';
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var isHidden = sheet.isSheetHidden();
  Logger.log('Trust Ledger: lastRow=%s, lastCol=%s, hidden=%s', lastRow, lastCol, isHidden);
  return 'lastRow=' + lastRow + ', lastCol=' + lastCol + ', hidden=' + isHidden + '. See View > Logs.';
}

function retireTrustLedger() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Trust Ledger');
  if (!sheet) return 'Trust Ledger tab not found — already removed?';

  var banner = '⚠️ RETIRED ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') +
    ' — superseded by the SCHEDULE A — ASSET INVENTORY section in the 📦 Asset Transfer Log tab ' +
    '(Serial/VIN/ID#, FMV method, appraiser, photo-on-file, transfer date, JE ref). ' +
    'This tab had no asset rows at retirement — nothing was migrated.';

  sheet.insertRowBefore(1);
  var cell = sheet.getRange(1, 1);
  cell.setValue(banner);
  cell.setFontWeight('bold').setFontColor('#b91c1c').setWrap(true);
  sheet.hideSheet();

  Logger.log('Trust Ledger retired: banner added at row 1, tab hidden.');
  return 'Trust Ledger retired — banner added, tab hidden. Use 📦 Asset Transfer Log going forward.';
}
