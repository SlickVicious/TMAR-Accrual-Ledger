/**
 * TransactionLedgerTrackingFix.gs — correct the swapped 2026-05-13 tracking numbers in the
 * Transaction Ledger. TMAR_ENTRY_PACKAGE_2026-05-13.md rotated the three tracking #s
 * (1040 <-> NYSDOH <-> NCDOR) and those entries were pushed to the ledger. The corrected
 * pairings are in MAILING_LOG_2026-05-13.md (FINAL/CORRECTED).
 *
 * Usage (Apps Script editor, bound to Live):
 *   1. auditLedgerTracking()     → read-only; logs every row containing any of the 6 tracking #s
 *   2. fixLedgerTrackingSwap()   → row-scoped, idempotent correction
 *
 * Row-scoped by recipient so the cascade (each wrong value equals another row's right value)
 * cannot cross-contaminate.
 */

var TXN_LEDGER_TAB_ = 'Transaction Ledger';

function tlNorm_(s) { return String(s || '').replace(/[^0-9]/g, ''); }

/**
 * wrong -> right, disambiguated by a recipient matcher on the whole row's text.
 * Per the 2026-07-09 audit the only mis-paired transaction row is the IRS 1040 line, which
 * carries NCDOR's number (…2900 33) instead of …2900 26. Rows 238/239/240 already read
 * correctly; the "CORRECTION NOTE" row (which lists all three numbers) is excluded via skipIf.
 */
function tlCorrections_() {
  return [
    { label: 'IRS 1040 (Federal) — had NCDOR number', who: /1040|kansas city|federal/i,
      wrong: '9589071052704022290033', right: '9589 0710 5270 4022 2900 26' }
  ];
}

/** Rows whose text matches this are audit-trail notes — never rewrite tracking #s inside them. */
var TL_SKIP_ROW_ = /correction note|reassignment/i;

function tlSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = (ss && ss.getSheetByName(TXN_LEDGER_TAB_)) ||
              SpreadsheetApp.openById(TMAR_CONFIG.liveBookId).getSheetByName(TXN_LEDGER_TAB_);
  if (!sheet) throw new Error('Tab not found: ' + TXN_LEDGER_TAB_);
  return sheet;
}

function auditLedgerTracking() {
  var sheet = tlSheet_();
  var values = sheet.getDataRange().getValues();
  var tracks = ['290286', '290026', '290033']; // the three ambiguous suffixes (last 6)
  var full = ['9589071052704022290286', '9589071052704022290026', '9589071052704022290033'];
  var hits = 0;
  for (var r = 0; r < values.length; r++) {
    var rowText = values[r].join(' ');
    var norm = tlNorm_(rowText);
    var found = [];
    for (var i = 0; i < full.length; i++) if (norm.indexOf(full[i]) !== -1) found.push('...' + tracks[i]);
    if (found.length) {
      hits++;
      Logger.log('row %s | tracks: %s | %s', r + 1, found.join(','),
                 rowText.substring(0, 160).replace(/\s+/g, ' '));
    }
  }
  Logger.log('Audit complete — %s row(s) contain a 5/13 tracking #.', hits);
  return hits + ' row(s) found. See View > Logs.';
}

function previewLedgerTrackingFix() { return tlFix_(true); }
function fixLedgerTrackingSwap() { return tlFix_(false); }

function tlFix_(dryRun) {
  var sheet = tlSheet_();
  var range = sheet.getDataRange();
  var values = range.getValues();
  var corr = tlCorrections_();
  var changes = 0;

  for (var r = 0; r < values.length; r++) {
    var rowText = values[r].join(' ');
    if (TL_SKIP_ROW_.test(rowText)) continue;                    // never touch audit-trail note rows
    for (var c = 0; c < values[r].length; c++) {
      var cell = String(values[r][c] || '');
      if (!cell) continue;
      for (var k = 0; k < corr.length; k++) {
        var fix = corr[k];
        if (tlNorm_(cell).indexOf(fix.wrong) === -1) continue;   // wrong # not in this cell
        if (!fix.who.test(rowText)) continue;                     // not this recipient's row — skip
        // build a tolerant pattern: the wrong digits with optional single separators between them
        var pat = new RegExp(fix.wrong.split('').join('[^0-9A-Za-z]?'));
        var before = cell;
        var after = cell.replace(pat, fix.right);
        if (after !== before) {
          values[r][c] = after;
          cell = after;
          changes++;
          Logger.log('%srow %s [%s]:\n    OLD: %s\n    NEW: %s', dryRun ? '(dry) ' : '', r + 1, fix.label,
                     before.substring(0, 140).replace(/\s+/g, ' '), after.substring(0, 140).replace(/\s+/g, ' '));
        }
      }
    }
  }

  if (!changes) { Logger.log('No swapped tracking #s found (already correct?).'); return 'Nothing to fix.'; }
  if (dryRun) return 'DRY RUN — ' + changes + ' cell(s) would change. See View > Logs.';
  range.setValues(values);
  var msg = 'Fixed ' + changes + ' cell(s) in ' + TXN_LEDGER_TAB_ + '.';
  Logger.log(msg);
  return msg;
}
