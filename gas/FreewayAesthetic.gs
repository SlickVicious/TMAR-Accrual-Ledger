/**
 * FreewayAesthetic.gs — reproduce the "FMV" (Freeway Filing System) visual
 * template faithfully. Decoded from the operator's reference sheet:
 *
 *   TITLE   row 1   : 16pt bold, color #1F3864 (navy), NO fill
 *   INFO    row 2-3 : 10pt, color #808080 (gray), fill #FFF2CC (tan)   [trustee/address]
 *   blank   row 4
 *   HEADER  row 5   : 11pt bold, color #FFFFFF, fill #1F3864 (navy)
 *   BANNER  (groups): 11pt bold, color #375623, fill #E2EFDA (green)   [— CREDIT CARDS —]
 *   DATA             : 10pt
 *   frozen panes: A6 (title+info+header)
 *
 * Two functions:
 *   applyFreewayAesthetic_  — style title/header/data/widths on EVERY visible tab
 *   buildMasterIndex_       — restructure Master Register into the sectioned index
 *
 * Wired to doPost cases 'applyFreewayAesthetic' and 'buildMasterIndex'.
 */

var FWV_COLORS_ = {
  NAVY: '#1F3864', WHITE: '#FFFFFF',
  GREEN_TEXT: '#375623', GREEN_FILL: '#E2EFDA',
  TAN: '#FFF2CC', GRAY: '#808080', DARKGRAY: '#404040',
  RED: '#C00000', ORANGE: '#ED7D31', PURPLE: '#7030A0', GREEN: '#375623'
};

var FWV_MAX_ROW_ = 500;
var FWV_MAX_COL_ = 40;

// sheets to leave untouched by applyFreewayAesthetic_ (bespoke layout or non-tabular)
var FWV_SKIP_ = [
  'Master Register',                      // already sectioned with green banners
  'AppScripts Canvas & Workflow Board',   // object canvas, not a data table
  '📋 HUB INDEX',                          // navigation hub
  '📋 Dashboard'                           // dashboard
];

function fwvTabColor_(name) {
  var n = name.toLowerCase();
  if (/hub|dashboard|summary|index|tin registry|chart of accounts|cover/.test(n)) return FWV_COLORS_.NAVY;
  if (/form|1099|proof|mailing|checklist|authority|tax form/.test(n)) return FWV_COLORS_.RED;
  if (/creditor|master register|principal register|website account|entity/.test(n)) return FWV_COLORS_.ORANGE;
  if (/guide|binder|document|inventory|gap report|reference|legacy/.test(n)) return FWV_COLORS_.PURPLE;
  if (/ledger|obligation|cash flow|transaction|journal|valuation|subscription|expense|budget|schedule|asset|income/.test(n)) return FWV_COLORS_.GREEN;
  return FWV_COLORS_.NAVY;
}

function fwvHeaderRow_(sheet) {
  var n = Math.min(sheet.getLastRow(), 8);
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var vals = sheet.getRange(1, 1, n, lastCol).getValues();
  // The header is the first row with >= 3 non-empty cells.
  // Title (row 1) and description (row 2) carry only 1 cell (col A).
  for (var r = 0; r < vals.length; r++) {
    var count = 0;
    for (var c = 0; c < vals[r].length; c++) {
      if (vals[r][c] !== null && vals[r][c] !== undefined && String(vals[r][c]).trim() !== '') count++;
    }
    if (count >= 3) return r + 1;
  }
  return 1;
}

// ---- style EVERY visible tab: title / header / data / widths ----
function applyFreewayAesthetic_(ss) {
  var sheets = ss.getSheets();
  var applied = [], skipped = [], errors = [];
  for (var si = 0; si < sheets.length; si++) {
    var sheet = sheets[si];
    var name;
    try { name = sheet.getName(); } catch (e) { continue; }
    if (sheet.isSheetHidden() || name.indexOf('_') === 0) { skipped.push(name); continue; }
    // skip sheets already carrying a bespoke sectioned layout (Master Register) or non-tabular canvases
    if (FWV_SKIP_.indexOf(name) !== -1) { skipped.push(name + ' (skip)'); continue; }

    var maxRow = 0, maxCol = 0;
    try {
      maxRow = Math.min(sheet.getLastRow(), FWV_MAX_ROW_);
      maxCol = Math.min(sheet.getLastColumn(), FWV_MAX_COL_);
    } catch (e) { continue; }
    if (maxRow < 1 || maxCol < 1) { skipped.push(name + ' (empty)'); continue; }

    try { sheet.setTabColor(fwvTabColor_(name)); } catch (e) { errors.push(name + ':tab'); }
    try { sheet.setHiddenGridlines(true); } catch (e) { errors.push(name + ':grid'); }

    // base: reset formatting to clean white/black Arial 10pt
    try {
      sheet.getRange(1, 1, maxRow, maxCol)
        .setFontFamily('Arial').setFontSize(10)
        .setFontWeight('normal').setFontStyle('normal')
        .setFontColor('#000000').setBackground('#FFFFFF');
    } catch (e) { errors.push(name + ':reset'); }

    var hr = fwvHeaderRow_(sheet);
    if (hr === 1) {
      // "title in col A + headers in cols B+" layout (cash-flow sheets)
      var a1txt = String(sheet.getRange(1, 1).getValue() || '').trim();
      if (a1txt.length > 20 && maxCol > 1) {
        try {
          sheet.getRange(1, 1).setFontSize(16).setFontWeight('bold').setFontColor(FWV_COLORS_.NAVY).setBackground('#FFFFFF');
          sheet.getRange(1, 2, 1, maxCol - 1).setBackground(FWV_COLORS_.NAVY).setFontColor(FWV_COLORS_.WHITE).setFontWeight('bold').setFontSize(11);
        } catch (e) { errors.push(name + ':header1'); }
      } else {
        try {
          sheet.getRange(1, 1, 1, maxCol).setBackground(FWV_COLORS_.NAVY).setFontColor(FWV_COLORS_.WHITE).setFontWeight('bold').setFontSize(11);
        } catch (e) { errors.push(name + ':header1b'); }
      }
    } else {
      // header: 11pt bold white on navy
      try {
        sheet.getRange(hr, 1, 1, maxCol).setBackground(FWV_COLORS_.NAVY).setFontColor(FWV_COLORS_.WHITE).setFontWeight('bold').setFontSize(11);
        if (sheet.getFrozenRows() === 0) sheet.setFrozenRows(hr);
      } catch (e) { errors.push(name + ':header'); }

      // title: 16pt bold navy (row 1)
      try {
        sheet.getRange(1, 1, 1, 1).setFontSize(16).setFontWeight('bold').setFontColor(FWV_COLORS_.NAVY);
      } catch (e) { errors.push(name + ':title'); }

      // description rows between title and header: gray (FMV subtitle)
      try {
        if (hr > 2) sheet.getRange(2, 1, hr - 2, 1).setFontColor(FWV_COLORS_.DARKGRAY);
      } catch (e) { errors.push(name + ':desc'); }
    }

    // generous first-column width
    try { sheet.setColumnWidth(1, 45); } catch (e) {}

    applied.push(name + ' (hr=' + hr + ')');
  }
  return {
    status: 'ok', action: 'applyFreewayAesthetic',
    appliedCount: applied.length, skippedCount: skipped.length, errorCount: errors.length,
    applied: applied, errors: errors
  };
}

// ---- restructure Master Register into the FMV sectioned index ----
var FWV_CAT_ORDER_ = ['Credit Card', 'Student Loan', 'Auto Loan', 'Secured Loan',
  'Personal Loan', 'Installment Loan', 'Collection', 'Government IRS', 'Government SSA'];
var FWV_BANNER_ = {
  'Credit Card': '— CREDIT CARDS —',
  'Student Loan': '— STUDENT LOANS —',
  'Auto Loan': '— AUTO LOANS —',
  'Secured Loan': '— SECURED LOANS —',
  'Personal Loan': '— PERSONAL LOANS —',
  'Installment Loan': '— INSTALLMENT LOANS —',
  'Collection': '— COLLECTIONS —',
  'Government IRS': '— GOVERNMENT —',
  'Government SSA': '— GOVERNMENT —'
};

function buildMasterIndex_(ss) {
  var mr = ss.getSheetByName('Master Register');
  if (!mr) return { status: 'error', message: 'Master Register not found' };

  // remove any filter (filtered rows hide content / break row math)
  try { if (mr.getFilter()) mr.getFilter().remove(); } catch (e) {}

  // read from the current Master Register (it holds the header + MR-### rows);
  // fall back to the most-populated pre-build backup only if it is empty
  var src = mr;
  if (src.getLastRow() < 3) {
    var sheets = ss.getSheets();
    for (var s = 0; s < sheets.length; s++) {
      var nm = sheets[s].getName();
      if (nm.indexOf('MasterIndex_PreBuild_') === 0 && sheets[s].getLastRow() > src.getLastRow()) {
        src = sheets[s];
      }
    }
  }

  var NCOL = Math.max(mr.getLastColumn(), 19);
  var srcLastRow = src.getLastRow();

  // capture header + data (STRICT MR-### filter) from the source
  var headerRow = fwvHeaderRow_(src);
  var header = src.getRange(headerRow, 1, 1, NCOL).getValues()[0];
  var data = [];
  for (var r = headerRow + 1; r <= srcLastRow; r++) {
    var a = String(src.getRange(r, 1).getValue() || '').trim();
    if (a.indexOf('MR-') === 0) data.push(src.getRange(r, 1, 1, NCOL).getValues()[0]);
  }

  // group by category (keep MR order within group)
  var groups = {};
  FWV_CAT_ORDER_.forEach(function (c) { groups[c] = []; });
  var others = [];
  data.forEach(function (row) {
    var cat = String(row[5] || '').trim();
    if (groups[cat]) groups[cat].push(row);
    else others.push(row);
  });

  // snapshot before clearing
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  var backup = ss.insertSheet('MasterIndex_PreBuild_' + stamp);
  var mrLastRow = mr.getLastRow();
  var mrLastCol = Math.max(mr.getLastColumn(), NCOL);
  if (mrLastRow > 0) {
    mr.getRange(1, 1, mrLastRow, mrLastCol).copyTo(backup.getRange(1, 1), { contentsOnly: false });
  }
  backup.hideSheet();

  // ---- rebuild with explicit per-row writes ----
  mr.clear();
  mr.getRange(1, 1).setValue('MASTER REGISTER — CREDITOR INDEX');
  mr.getRange(2, 1).setValue('Trustee: Clinton Wimberly IV — A Provident Private Creditor Revocable Living Trust');
  mr.getRange(3, 1).setValue('Address: 2105 Presbyterian Ln, Kinston NC 28501');
  // row 4 left blank
  var hr = 5;
  mr.getRange(hr, 1, 1, NCOL).setValues([header]);
  var wr = hr + 1;
  var nBanners = 0;
  FWV_CAT_ORDER_.forEach(function (cat) {
    var rows = groups[cat];
    if (!rows.length) return;
    mr.getRange(wr, 3).setValue(FWV_BANNER_[cat] || ('— ' + cat.toUpperCase() + ' —'));
    wr++; nBanners++;
    rows.forEach(function (row) { mr.getRange(wr, 1, 1, NCOL).setValues([row]); wr++; });
  });
  if (others.length) {
    mr.getRange(wr, 3).setValue('— OTHER —');
    wr++; nBanners++;
    others.forEach(function (row) { mr.getRange(wr, 1, 1, NCOL).setValues([row]); wr++; });
  }

  // ---- style ----
  mr.getRange(1, 1).setFontSize(16).setFontWeight('bold').setFontColor(FWV_COLORS_.NAVY).setFontFamily('Arial');
  mr.getRange(2, 1, 2, NCOL).setBackground(FWV_COLORS_.TAN).setFontSize(10).setFontColor(FWV_COLORS_.GRAY).setFontFamily('Arial');
  mr.getRange(hr, 1, 1, NCOL).setBackground(FWV_COLORS_.NAVY).setFontColor(FWV_COLORS_.WHITE).setFontWeight('bold').setFontSize(11).setFontFamily('Arial');
  if (wr - hr - 1 > 0) mr.getRange(hr + 1, 1, wr - hr - 1, NCOL).setFontSize(10).setFontFamily('Arial');
  var wr3 = hr + 1;
  FWV_CAT_ORDER_.forEach(function (cat) {
    var rows = groups[cat];
    if (!rows.length) return;
    mr.getRange(wr3, 1, 1, NCOL).setBackground(FWV_COLORS_.GREEN_FILL);
    mr.getRange(wr3, 3).setFontColor(FWV_COLORS_.GREEN_TEXT).setFontWeight('bold').setFontSize(11);
    wr3 += rows.length + 1;
  });

  mr.setFrozenRows(hr);
  mr.setHiddenGridlines(true);
  mr.setColumnWidth(1, 45);

  return {
    status: 'ok', action: 'buildMasterIndex',
    backup: backup.getName(),
    dataRows: data.length, sectionBanners: nBanners,
    totalRows: wr - 1
  };
}

// ---- restore Master Register from a named backup sheet ----
function restoreMasterRegister_(ss, backupName) {
  var mr = ss.getSheetByName('Master Register');
  if (!mr) return { status: 'error', message: 'Master Register not found' };
  var backup = ss.getSheetByName(backupName);
  if (!backup) return { status: 'error', message: 'Backup "' + backupName + '" not found' };
  var bLastRow = backup.getLastRow();
  var bLastCol = backup.getLastColumn();
  mr.clear();
  backup.getRange(1, 1, bLastRow, bLastCol).copyTo(mr.getRange(1, 1), { contentsOnly: true });
  if (mr.getLastRow() > bLastRow) {
    mr.deleteRows(bLastRow + 1, mr.getLastRow() - bLastRow);
  }
  return { status: 'ok', action: 'restoreMasterRegister', restoredRows: bLastRow, source: backupName };
}

// ---- read-only peek at the Master Register's first rows (correct row index) ----
function peekMR_(ss) {
  var mr = ss.getSheetByName('Master Register');
  if (!mr) return { status: 'error', message: 'Master Register not found' };
  var out = [];
  for (var r = 1; r <= 12; r++) {
    var a = String(mr.getRange(r, 1).getValue() || '');
    var c = String(mr.getRange(r, 3).getValue() || '');
    out.push('r' + r + ' | A="' + a.slice(0, 40) + '" | C="' + c.slice(0, 24) + '"');
  }
  return { status: 'ok', lastRow: mr.getLastRow(), peek: out };
}

// ---- read-only peek at ANY sheet's physical rows 1-8 (shows blank rows + non-empty count) ----
function peekSheet_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) return { status: 'error', message: 'Sheet not found: ' + name };
  var lastCol = Math.max(sh.getLastColumn(), 1);
  var vals = sh.getRange(1, 1, 8, lastCol).getValues();
  var out = [];
  for (var r = 0; r < vals.length; r++) {
    var count = 0;
    for (var c = 0; c < vals[r].length; c++) {
      if (vals[r][c] !== null && vals[r][c] !== undefined && String(vals[r][c]).trim() !== '') count++;
    }
    out.push('r' + (r + 1) + ' (' + count + ') A="' + String(vals[r][0] || '').slice(0, 32) + '" B="' + String(vals[r][1] || '').slice(0, 20) + '"');
  }
  return { status: 'ok', sheet: name, peek: out };
}

// ---- fix the Journal's corrupted header (a stray ";" was left where the header belongs) ----
function fixJournalHeader_(ss) {
  var j = ss.getSheetByName('Journal');
  if (!j) return { status: 'error', message: 'Journal not found' };
  var a1 = String(j.getRange(1, 1).getValue() || '').trim();
  var looksJunk = (a1 === '' || a1 === ';' || a1.charAt(0) === ';');
  if (!looksJunk) return { status: 'ok', action: 'fixJournalHeader', fixed: false, a1: a1.slice(0, 20) };

  // insert 2 rows at top (title + description), then a header row; data shifts down
  j.insertRows(1, 2);
  j.getRange(1, 1).setValue('JOURNAL — GENERAL LEDGER');
  j.getRange(2, 1).setValue('Chronological double-entry journal (debit/credit pairs)');
  var hdr = ['JE#', 'Date', 'Party', 'Category', 'Description', 'Account', 'Debit', 'Credit'];
  j.getRange(3, 1, 1, hdr.length).setValues([hdr]);
  return { status: 'ok', action: 'fixJournalHeader', fixed: true };
}
