/**
 * FreewayAesthetic.gs — apply the "FMV" (Freeway Filing System) visual template
 * across the workbook. Palette decoded from the operator's reference sheet:
 *   navy #1F3864 (title + header fill) with white bold header text,
 *   green #E2EFDA / #375623 (section banners), tan #FFF2CC (placeholder bands),
 *   Arial throughout, gridlines hidden, freeze on the header row, color-coded tabs.
 *
 * Formatting-ONLY: never reads or mutates cell values. Idempotent, bounded
 * (300 rows / 40 cols), per-tab fault-tolerant. Wired to doPost case
 * 'applyFreewayAesthetic'.
 */

const FWV_COLORS_ = {
  NAVY: '#1F3864', WHITE: '#FFFFFF',
  GREEN_TEXT: '#375623', GREEN_FILL: '#E2EFDA',
  TAN: '#FFF2CC', GRAY: '#808080', DARKGRAY: '#404040',
  RED: '#C00000', ORANGE: '#ED7D31', PURPLE: '#7030A0', GREEN: '#375623',
};

const FWV_MAX_ROW_ = 300;
const FWV_MAX_COL_ = 40;

function fwvTabColor_(name) {
  const n = name.toLowerCase();
  if (/hub|dashboard|summary|index|tin registry|chart of accounts|cover/.test(n)) return FWV_COLORS_.NAVY;
  if (/form|1099|proof|mailing|checklist|authority|tax form/.test(n)) return FWV_COLORS_.RED;
  if (/creditor|master register|principal register|website account|entity/.test(n)) return FWV_COLORS_.ORANGE;
  if (/guide|binder|document|inventory|gap report|reference|legacy/.test(n)) return FWV_COLORS_.PURPLE;
  if (/ledger|obligation|cash flow|transaction|journal|valuation|subscription|expense|budget|schedule/.test(n)) return FWV_COLORS_.GREEN;
  return FWV_COLORS_.NAVY;
}

function fwvHeaderRow_(sheet) {
  const n = Math.min(sheet.getLastRow(), 8);
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const vals = sheet.getRange(1, 1, n, lastCol).getValues();
  for (let r = 0; r < vals.length; r++) {
    const a = String(vals[r][0] || '').trim().toUpperCase();
    if (/^(TAB #|ENTRY|TIN|EIN|DATE|CREDITOR|BINDER|CATEGORY|PAYER|METRIC|FUNCTION|ACCOUNT|OBLIGOR|VENDOR|STATUS|DESCRIPTION)/.test(a)) {
      return r + 1;
    }
  }
  return 1;
}

function applyFreewayAesthetic_(ss) {
  const sheets = ss.getSheets();
  const applied = [], skipped = [], errors = [];
  for (const sheet of sheets) {
    let name;
    try { name = sheet.getName(); } catch (e) { skipped.push('(unnameable)'); continue; }
    if (sheet.isSheetHidden() || name.indexOf('_') === 0) { skipped.push(name + ' (hidden/system)'); continue; }

    let maxRow = 0, maxCol = 0;
    try {
      maxRow = Math.min(sheet.getLastRow(), FWV_MAX_ROW_);
      maxCol = Math.min(sheet.getLastColumn(), FWV_MAX_COL_);
    } catch (e) { skipped.push(name + ' (dims)'); continue; }
    if (maxRow < 1 || maxCol < 1) { skipped.push(name + ' (empty)'); continue; }

    try { sheet.setTabColor(fwvTabColor_(name)); } catch (e) { errors.push(name + ':tab'); }
    try { sheet.getRange(1, 1, maxRow, maxCol).setFontFamily('Arial'); } catch (e) { errors.push(name + ':font'); }
    try { sheet.setHiddenGridlines(true); } catch (e) { errors.push(name + ':grid'); }
    try {
      const hr = fwvHeaderRow_(sheet);
      if (sheet.getFrozenRows() === 0) sheet.setFrozenRows(hr);
      sheet.getRange(hr, 1, 1, maxCol)
        .setBackground(FWV_COLORS_.NAVY)
        .setFontColor(FWV_COLORS_.WHITE)
        .setFontWeight('bold')
        .setFontSize(11);
    } catch (e) { errors.push(name + ':header'); }

    applied.push(name);
  }
  return {
    status: 'ok', action: 'applyFreewayAesthetic',
    appliedCount: applied.length, skippedCount: skipped.length, errorCount: errors.length,
    applied: applied, skipped: skipped, errors: errors,
  };
}
