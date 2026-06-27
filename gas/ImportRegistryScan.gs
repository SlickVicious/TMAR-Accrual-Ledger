/**
 * ImportRegistryScan.gs
 *
 * One-click loader for the output of scripts/scan_filecabinet_registry.py.
 *
 * GAS cannot read the local FileCabinet, so the scanner runs on the PC/Mac and
 * emits DocumentRegistry_DELTA.csv / DocumentRegistry_FULL.tsv. This dialog lets
 * you paste that text and append (or full-replace) the "Document Registry" tab —
 * no Drive upload, no file IDs.
 *
 * Menu: TMAR → Data Gap Scanner → Import Registry Scan…
 *
 * Behaviour:
 *   • Tolerant of TSV or CSV input; strips the header row if present.
 *   • Idempotent APPEND: rows whose Full File Path (col H) already exists in the
 *     registry are skipped (path compared relative + case-insensitive, mirroring
 *     resolveDocPath_ in Code.gs). Appended rows get fresh DOC-IDs continuing
 *     from the current max — incoming IDs are ignored on append to avoid clashes.
 *   • FULL REPLACE: clears data (row 3+), writes all incoming rows, preserving
 *     each row's DOC-ID (blank IDs are auto-assigned).
 *
 * Registry layout (unchanged): row 1 = title, row 2 = header, row 3+ = data.
 */

var REGISTRY_TAB_ = 'Document Registry';
var REGISTRY_DATA_START_ = 3;            // row 3 (row 1 title, row 2 header)
var REGISTRY_COLS_ = 10;                 // A..J

// ── Menu entry point ──────────────────────────────────────────────────────────
function showImportRegistryScanDialog() {
  var html = HtmlService.createHtmlOutputFromFile('ImportRegistryScanUI')
    .setWidth(620).setHeight(560);
  SpreadsheetApp.getUi().showModalDialog(html, 'Import Registry Scan');
}

// ── Path normalisation (mirror norm_rel in the Python scanner) ────────────────
function normRegistryPath_(p) {
  var s = String(p || '').trim().replace(/\\/g, '/');
  var prefixes = [
    'C:/Users/rhyme/Desktop/FileCabinet/',
    '/Users/animatedastronaut/Downloads/FileCabinet/',
    '/Volumes/GoogleDrive/My Drive/FileCabinet/'
  ];
  var low = s.toLowerCase();
  for (var i = 0; i < prefixes.length; i++) {
    var pre = prefixes[i].toLowerCase();
    if (low.indexOf(pre) === 0) { s = s.slice(prefixes[i].length); break; }
  }
  return s.replace(/^\/+|\/+$/g, '').toLowerCase();
}

// ── Parse pasted text (TSV or CSV) into 10-col rows, header stripped ───────────
function parseRegistryPaste_(text) {
  if (!text || !text.trim()) return [];
  var firstLine = text.split(/\r?\n/, 1)[0] || '';
  var delim = firstLine.indexOf('\t') > -1 ? '\t' : ',';
  var rows = Utilities.parseCsv(text, delim);
  var out = [];
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    if (!row) continue;
    // Strip header row(s)
    var a = String(row[0] || '').trim();
    if (a === 'Doc ID' || (r === 0 && a.toLowerCase() === 'doc id')) continue;
    // Skip blank rows (need at least a filename in col B or a path in col H)
    var filename = String(row[1] || '').trim();
    var path = String(row[7] || '').trim();
    if (!filename && !path) continue;
    // Normalise to exactly 10 columns
    var norm = [];
    for (var c = 0; c < REGISTRY_COLS_; c++) norm.push(row[c] != null ? row[c] : '');
    out.push(norm);
  }
  return out;
}

// ── Helpers over the live registry ────────────────────────────────────────────
function getRegistrySheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(REGISTRY_TAB_);
  if (!sheet) throw new Error('Tab "' + REGISTRY_TAB_ + '" not found.');
  return sheet;
}

function lastDocRow_(sheet) {
  var colA = sheet.getRange(1, 1, sheet.getMaxRows(), 1).getValues();
  var last = REGISTRY_DATA_START_ - 1;
  for (var i = 0; i < colA.length; i++) {
    if (/^DOC-\d{4,}$/.test(String(colA[i][0]))) last = i + 1;
  }
  return last;
}

function maxDocNum_(sheet) {
  var colA = sheet.getRange(1, 1, sheet.getMaxRows(), 1).getValues();
  var max = 0;
  for (var i = 0; i < colA.length; i++) {
    var m = String(colA[i][0]).match(/^DOC-(\d{4,})$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max;
}

function existingPathKeys_(sheet, lastRow) {
  var keys = {};
  if (lastRow < REGISTRY_DATA_START_) return keys;
  var colH = sheet.getRange(REGISTRY_DATA_START_, 8, lastRow - REGISTRY_DATA_START_ + 1, 1).getValues();
  for (var i = 0; i < colH.length; i++) {
    var k = normRegistryPath_(colH[i][0]);
    if (k) keys[k] = true;
  }
  return keys;
}

function docId_(n) { return 'DOC-' + String(n).padStart(4, '0'); }

// ── Called from the dialog ────────────────────────────────────────────────────
// mode: 'append' | 'replace'. Returns a result object for the UI.
// NOTE: no trailing underscore — Apps Script hides _-suffixed functions from
// google.script.run, so this must stay client-callable.
function importRegistryScan(text, mode) {
  var sheet = getRegistrySheet_();
  var rows = parseRegistryPaste_(text);
  if (!rows.length) return { ok: false, message: 'No data rows found in the pasted text.' };

  if (mode === 'replace') {
    // Clear existing data (row 3+), then write all incoming, preserving/assigning IDs.
    var lastRow = sheet.getLastRow();
    if (lastRow >= REGISTRY_DATA_START_) {
      sheet.getRange(REGISTRY_DATA_START_, 1, lastRow - REGISTRY_DATA_START_ + 1, REGISTRY_COLS_).clearContent();
    }
    var nextNum = 0;
    for (var i = 0; i < rows.length; i++) {
      var id = String(rows[i][0] || '').trim();
      var m = id.match(/^DOC-(\d{4,})$/);
      if (m) { nextNum = Math.max(nextNum, parseInt(m[1], 10)); }
    }
    for (var j = 0; j < rows.length; j++) {
      if (!/^DOC-\d{4,}$/.test(String(rows[j][0] || '').trim())) {
        rows[j][0] = docId_(++nextNum);
      }
    }
    sheet.getRange(REGISTRY_DATA_START_, 1, rows.length, REGISTRY_COLS_).setValues(rows);
    return { ok: true, mode: 'replace', written: rows.length, skipped: 0,
             message: 'Replaced registry data with ' + rows.length + ' rows.' };
  }

  // APPEND (default): dedup on path, re-stamp DOC-IDs from current max.
  var last = lastDocRow_(sheet);
  var keys = existingPathKeys_(sheet, last);
  var nextId = maxDocNum_(sheet);
  var toWrite = [];
  var skipped = 0;
  for (var k = 0; k < rows.length; k++) {
    var key = normRegistryPath_(rows[k][7]);
    if (key && keys[key]) { skipped++; continue; }
    if (key) keys[key] = true; // guard against in-batch duplicates
    rows[k][0] = docId_(++nextId);
    toWrite.push(rows[k]);
  }
  if (!toWrite.length) {
    return { ok: true, mode: 'append', written: 0, skipped: skipped,
             message: 'Nothing new to add — all ' + skipped + ' rows already in the registry.' };
  }
  sheet.getRange(last + 1, 1, toWrite.length, REGISTRY_COLS_).setValues(toWrite);
  return { ok: true, mode: 'append', written: toWrite.length, skipped: skipped,
           firstId: toWrite[0][0], lastId: toWrite[toWrite.length - 1][0],
           message: 'Appended ' + toWrite.length + ' new rows (' +
                    toWrite[0][0] + '…' + toWrite[toWrite.length - 1][0] + '); ' +
                    'skipped ' + skipped + ' already present.' };
}
