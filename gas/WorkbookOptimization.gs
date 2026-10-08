/**
 * WorkbookOptimization.gs — archive + credit-scorecard endpoints.
 *
 * (1) archiveTabs_   — copy a list of source tabs into a NEW dated archive
 *     workbook (spreadsheet.create + sheet.copyTo), so the live book can be
 *     slimmed without losing any content. Read-only w.r.t. the live book.
 *
 * (2) pushCreditScorecard_ — write a single "📊 Credit Scorecard" tab that
 *     centralizes the key credit-eval metrics (adverse/active/closed debt,
 *     monthly obligation, student loans, 1099-C exposure, removal dates) for
 *     Clinton and Syrina, extracted from the local Credit-Report-Analysis
 *     workbooks. GAS is a dumb renderer — the client supplies the numbers.
 */

var SCORECARD_TAB_ = '📊 Credit Scorecard';

/**
 * Copy the named source tabs into a fresh archive workbook.
 * @param {string[]} tabNames — exact tab names to copy
 * @param {string}   archiveName — name for the new workbook
 */
function archiveTabs_(tabNames, archiveName) {
  var source = SpreadsheetApp.openById(TMAR_SPREADSHEET_ID_);
  var target = SpreadsheetApp.create(archiveName);
  var copied = [], valueCopied = [], missing = [], failed = [];

  tabNames.forEach(function (name) {
    var sh = source.getSheetByName(name);
    if (!sh) { missing.push(name); return; }
    try {
      var cp = sh.copyTo(target);
      cp.setName(name);
      copied.push({ name: name, rows: sh.getLastRow(), cols: sh.getLastColumn(), mode: 'copyTo' });
    } catch (e) {
      // OBJECT sheets (embedded charts/drawings) can't copyTo — fall back to a value-only copy.
      try {
        var lr = sh.getLastRow(), lc = sh.getLastColumn();
        var values = (lr >= 1 && lc >= 1) ? sh.getRange(1, 1, lr, lc).getValues() : [];
        var ns = target.insertSheet(name);
        if (values.length && values[0].length) ns.getRange(1, 1, values.length, values[0].length).setValues(values);
        valueCopied.push({ name: name, rows: lr, cols: lc, mode: 'values', error: String(e).slice(0, 80) });
      } catch (e2) {
        failed.push({ name: name, error: String(e2).slice(0, 120) });
      }
    }
  });

  // Drop the auto-created default sheet (only if we copied at least one tab).
  var def = target.getSheetByName('Sheet1');
  if (def && target.getSheets().length > 1) {
    try { target.deleteSheet(def); } catch (e) {}
  }

  // Manifest
  try {
    var man = target.insertSheet('_ArchiveManifest');
    var row = 1;
    man.getRange(row, 1, 1, 2).setValues([['Archived', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')]]);
    row += 2;
    man.getRange(row, 1, 1, 3).setValues([['Tab', 'Rows', 'Mode']]);
    row++;
    copied.concat(valueCopied).forEach(function (c) {
      man.getRange(row, 1, 1, 3).setValues([[c.name, c.rows, c.mode]]);
      row++;
    });
    if (missing.length) {
      row++; man.getRange(row, 1).setValue('MISSING:'); row++;
      missing.forEach(function (m) { man.getRange(row, 1).setValue(m); row++; });
    }
    if (failed.length) {
      row++; man.getRange(row, 1).setValue('FAILED:'); row++;
      failed.forEach(function (f) { man.getRange(row, 1).setValue(f.name + ' — ' + f.error); row++; });
    }
  } catch (e) {}

  return {
    status: 'ok',
    action: 'archiveTabs',
    archiveName: archiveName,
    archiveId: target.getId(),
    archiveUrl: target.getUrl(),
    copied: copied,
    valueCopied: valueCopied,
    missing: missing,
    failed: failed
  };
}

/**
 * Write/replace the centralized credit scorecard tab.
 * @param {Spreadsheet} ss — live workbook
 * @param {object} scorecard — { asOf, sourceNote, metrics:[{label,clinton,syrina,household}], notes:[] }
 */
function pushCreditScorecard_(ss, scorecard) {
  var tab = ss.getSheetByName(SCORECARD_TAB_);
  if (!tab) tab = ss.insertSheet(SCORECARD_TAB_);
  tab.clear();

  var asOf = scorecard.asOf || '—';
  var sourceNote = scorecard.sourceNote || '';
  var metrics = Array.isArray(scorecard.metrics) ? scorecard.metrics : [];
  var notes = Array.isArray(scorecard.notes) ? scorecard.notes : [];

  var r = 1;
  tab.getRange(r, 1).setValue('CREDIT SCORECARD — CLINTON & SYRINA WIMBERLY (HOUSEHOLD)')
    .setFontWeight('bold').setFontSize(14);
  r++;
  tab.getRange(r, 1).setValue('As of: ' + asOf + (sourceNote ? '   |   ' + sourceNote : ''));
  tab.getRange(r, 1).setFontStyle('italic');
  r += 2;

  // Headline metrics table
  tab.getRange(r, 1, 1, 4).setValues([['Metric', 'Clinton', 'Syrina', 'Household']])
    .setFontWeight('bold').setBackground('#1B2A4A').setFontColor('#FFFFFF');
  r++;
  if (metrics.length) {
    var mrows = metrics.map(function (m) {
      return [m.label || '', m.clinton == null ? '' : m.clinton, m.syrina == null ? '' : m.syrina, m.household == null ? '' : m.household];
    });
    var mStart = r;
    // Force plain-text format on date/text rows BEFORE writing, so Sheets won't
    // auto-parse "Nov 2030" into a full Date (inventing a day).
    for (var i = 0; i < metrics.length; i++) {
      if (metrics[i].text) {
        tab.getRange(mStart + i, 2, 1, 3).setNumberFormat('@');
      }
    }
    tab.getRange(mStart, 1, mrows.length, 4).setValues(mrows);
    for (var j = 0; j < metrics.length; j++) {
      if (metrics[j].money) {
        tab.getRange(mStart + j, 2, 1, 3).setNumberFormat('$#,##0.00');
      }
    }
    r += mrows.length;
  }
  r++;

  // Notes
  if (notes.length) {
    tab.getRange(r, 1).setValue('NOTES').setFontWeight('bold');
    r++;
    notes.forEach(function (n) {
      tab.getRange(r, 1).setValue('• ' + n);
      r++;
    });
  }

  tab.autoResizeColumns(1, 4);
  tab.setTabColor('#7E57C2');

  return {
    status: 'ok',
    action: 'pushCreditScorecard',
    tab: SCORECARD_TAB_,
    metrics: metrics.length,
    notes: notes.length
  };
}
