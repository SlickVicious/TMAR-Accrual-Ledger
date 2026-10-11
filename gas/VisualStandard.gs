/**
 * VisualStandard.gs — apply the reference visual layout standard.
 *
 * Reference: (1) "Wimberly Household" dashboard — navy #1B2A4A headers, Arial body,
 * alternating #EDF2FA rows, category tab colors; (2) "Trust & Credits Binder" —
 * Arial title/subtitle, light-blue #BDD7EE tabs, freeze-pane headers.
 *
 * Closes the deltas over the existing #1B2A4A header + colored-tab scheme:
 * Arial font, alternating fill, freeze-pane header, category tab colors.
 * Idempotent, non-destructive to data, per-operation fault-tolerant, and bounded
 * (max 200 rows / 40 cols) so it completes well inside the 360s web-app limit.
 */

const VS_COLORS_ = {
  NAVY: '#1B2A4A', BLUE: '#4472C4', GREEN: '#2E7D32',
  GOLD: '#C5942D', RED: '#C62828', LIGHTBLUE: '#BDD7EE',
  GRAY: '#9E9E9E', ALT_ROW: '#EDF2FA',
};

const VS_MAX_ROW_ = 200;
const VS_MAX_COL_ = 40;
const VS_SKIP_ALT_FILL_ = ['Master Register', 'Transaction Ledger'];
const VS_SKIP_ALT_FILL_DASHBOARD_ = ['Executive Dashboard', 'HUB INDEX', 'Cover'];

function vsTabColor_(name) {
  const n = name.toLowerCase();
  if (/dashboard|hub|index|summary|cover/.test(n)) return VS_COLORS_.NAVY;
  if (/tax|1099|estate|schedule|form|w-2|w2/.test(n)) return VS_COLORS_.GOLD;
  if (/obligation|register|trust|resolution|ledger/.test(n)) return VS_COLORS_.GREEN;
  if (/gap|action|audit|review|correction/.test(n)) return VS_COLORS_.RED;
  if (/filing|binder|guide|inventory|mailing|proof|document/.test(n)) return VS_COLORS_.LIGHTBLUE;
  return VS_COLORS_.BLUE;
}

function applyVisualStandard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const applied = [];
  const skipped = [];
  const errors = [];

  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    let name;
    try { name = sheet.getName(); } catch (e) { skipped.push('(unnameable: ' + e.message + ')'); continue; }
    if (sheet.isSheetHidden() || name.indexOf('_') === 0) { skipped.push(name + ' (hidden/system)'); continue; }

    let maxRow = 0, maxCol = 0;
    try {
      maxRow = Math.min(sheet.getLastRow(), VS_MAX_ROW_);
      maxCol = Math.min(sheet.getLastColumn(), VS_MAX_COL_);
    } catch (e) { skipped.push(name + ' (dims: ' + e.message + ')'); continue; }
    if (maxRow < 1 || maxCol < 1) { skipped.push(name + ' (empty)'); continue; }

    // 1. tab color
    try { sheet.setTabColor(vsTabColor_(name)); }
    catch (e) { errors.push(name + ' tabColor: ' + e.message); }

    // 2. Arial font on the bounded used range
    try { sheet.getRange(1, 1, maxRow, maxCol).setFontFamily('Arial'); }
    catch (e) { errors.push(name + ' font: ' + e.message); }

    // 3. freeze header row (only if none set)
    try { if (sheet.getFrozenRows() === 0) sheet.setFrozenRows(1); }
    catch (e) { errors.push(name + ' freeze: ' + e.message); }

    // 4. alternating fill — read col A once, then paint even non-empty data rows
    if (VS_SKIP_ALT_FILL_.indexOf(name) === -1 && VS_SKIP_ALT_FILL_DASHBOARD_.indexOf(name) === -1) {
      try {
        if (maxRow >= 3) {
          const colA = sheet.getRange(2, 1, maxRow - 1, 1).getValues();
          for (let r = 2; r <= maxRow; r += 2) {
            if (String(colA[r - 2][0] || '').trim() !== '') {
              sheet.getRange(r, 1, 1, maxCol).setBackground(VS_COLORS_.ALT_ROW);
            }
          }
        }
      } catch (e) { errors.push(name + ' altFill: ' + e.message); }
    }

    applied.push(name);
  }

  return {
    status: 'ok',
    action: 'applyVisualStandard',
    appliedCount: applied.length,
    skippedCount: skipped.length,
    errorCount: errors.length,
    applied: applied,
    skipped: skipped,
    errors: errors,
  };
}
