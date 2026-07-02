/**
 * ScanDriveFileCabinet.gs
 *
 * Server-side (Drive API) analogue of scripts/scan_filecabinet_registry.py, for
 * the **Google-Drive** FileCabinet mirror rather than the local disk.
 *
 * GAS can't read the PC/Mac FileCabinet, but it CAN walk the Drive mirror
 * (folder 1tr5b… "FileCabinet") because this project has Drive enabled. This
 * recurses that folder, infers per-document metadata, and emits rows in the
 * exact 10-column "Document Registry" schema — then reuses importRegistryScan()
 * (ImportRegistryScan.gs) so DOC-ID continuation + path dedup are identical.
 *
 * Two-step, preview-first (mirrors Reconcile & Cross-Fill):
 *   1. Scan Drive FileCabinet…        → walks Drive, writes "Drive FC Scan Preview"
 *                                         (non-destructive) + new-vs-existing count.
 *   2. Apply Drive FC Scan → Registry → appends the preview's NEW rows to the
 *                                         Document Registry (dedup on col-H path).
 *
 * Parity notes vs the Python scanner:
 *   • Same SKIP_DIRS / skip-file rules, same type/year/person inference.
 *   • col H = path RELATIVE to the FileCabinet root, forward slashes, folder
 *     NAMES (so it dedups against PC-scanned rows with the same relative path).
 *   • Duplicate-named top folders (e.g. two "Taxes" trees) collapse by path on
 *     dedup — the first occurrence wins; the rest are reported as duplicates.
 *   • Drive-native Docs/Sheets/Slides are mapped by mimeType (no file extension).
 *
 * Menu: TMAR → Data Gap Scanner → Scan Drive FileCabinet… / Apply Drive FC Scan
 */

var DRIVE_FC_ROOT_    = '1tr5bDGj66CwvVk3c21N_MEF-7bpgNWXg'; // "FileCabinet" (Drive mirror)
var DRIVE_FC_PREVIEW_ = 'Drive FC Scan Preview';
var DRIVE_FC_MAX_MS_  = 5 * 60 * 1000;                       // stay under the 6-min quota

var DFC_SKIP_DIRS_ = {
  '.fc': 1, '.git': 1, '.obsidian': 1, '__pycache__': 1, 'node_modules': 1,
  '.trash': 1, '.venv': 1, 'venv': 1, 'env': 1, 'site-packages': 1, '.tox': 1,
  '.mypy_cache': 1, '.pytest_cache': 1, 'dist-info': 1, '.idea': 1, '.vscode': 1
};
var DFC_ARCHIVE_TOP_ = { 'archive': 1 };
var DFC_SKIP_FILE_RE_ = /^(~\$|\.~lock|\.DS_Store|Thumbs\.db|desktop\.ini)/i;
var DFC_SKIP_EXT_ = { 'pyc': 1, 'pxi': 1, 'pxd': 1, 'so': 1, 'o': 1, 'tmp': 1 };

// skipCode (default ON): drop source code, build artifacts, and dev-log scratch
// files so the registry stays document-only. Two gates — extension, and a
// conservative name pattern (the dev logs are extension-less Google Docs like
// "parse_out2" / "deploy_log3"). Tuned to observed clutter; deliberately narrow
// to avoid matching real titles (e.g. "General Ledger" does NOT match).
var DFC_CODE_EXT_ = {
  py: 1, pyw: 1, js: 1, mjs: 1, ts: 1, tsx: 1, jsx: 1, sh: 1, rb: 1, go: 1,
  gs: 1, ipynb: 1, log: 1, lock: 1, bat: 1, ps1: 1, cfg: 1, ini: 1
};
var DFC_CODE_NAME_RE_ =
  /^(parse_|parse[0-9]|deploy(_|$|[0-9])|debug_|extract_|pdf_extract|master_parser|split_csv|build_gas|gen_monthly|generate_gas|gh_repos|git_err)/i;

var DFC_YEAR_RE_       = /(19[89]\d|20[0-4]\d)/;
var DFC_EXACT_YEAR_RE_ = /^(19[89]\d|20[0-4]\d)$/;

// Ordered (regex, label); first match wins. label === null → the 1040/return group.
var DFC_TYPE_KEYWORDS_ = [
  [/\b1040\b|tax[_\- ]?return|\bd[-_ ]?400\b|nc[_\- ]?d400/i, null],
  [/paystub|pay[_\- ]?stub|paycheck|payslip|payroll/i, 'Pay Stub'],
  [/worksheet/i, 'Tax Worksheet'],
  [/\bw[-_ ]?2\b|\bw[-_ ]?4\b|\b1099\b|\b4852\b|\b2848\b|\b56f?\b|\b8275r?\b|\b8879\b|\b8453\b|\b8867\b|\b5498\b|\b3949\b|\bein\b|form[_\- ]?\d|schedule[_\- ]?[a-z0-9]/i, 'Government Form'],
  [/affidavit/i, 'Affidavit'],
  [/certificate[_\- ]?of[_\- ]?trust|cert[_\- ]?of[_\- ]?trust|trust[_\- ]?(deed|instrument|agreement)/i, 'Trust Document'],
  [/estmt|e[-_ ]?statement|\bstatement\b|cash[_\- ]?flow|cashflow/i, 'Bank Statement'],
  [/\bledger\b|coa\b|chart[_\- ]?of[_\- ]?accounts/i, 'Ledger'],
  [/valuation|appraisal/i, 'Valuation'],
  [/receipt|invoice/i, 'Receipt'],
  [/\bdeed\b|recorded|recording/i, 'Recorded Document'],
  [/proof[_\- ]?of[_\- ]?mailing|usps|certified[_\- ]?mail|tracking/i, 'Proof of Mailing']
];

var DFC_EXT_CATEGORY_ = {
  pdf: 'PDF Document',
  docx: 'Word Document', doc: 'Word Document', odt: 'Word Document', rtf: 'Word Document', pages: 'Word Document',
  xlsx: 'Spreadsheet', xls: 'Spreadsheet', csv: 'Spreadsheet', tsv: 'Spreadsheet', numbers: 'Spreadsheet',
  jpg: 'Image', jpeg: 'Image', png: 'Image', gif: 'Image', heic: 'Image', tif: 'Image', tiff: 'Image',
  txt: 'Text', md: 'Text', zip: 'Archive File', json: 'Data File', xml: 'Data File'
};
var DFC_GOOGLE_MIME_ = {
  'application/vnd.google-apps.document': 'Word Document',
  'application/vnd.google-apps.spreadsheet': 'Spreadsheet',
  'application/vnd.google-apps.presentation': 'Presentation',
  'application/vnd.google-apps.form': 'Data File',
  'application/vnd.google-apps.drawing': 'Image'
};

function dfcExt_(name) {
  var i = name.lastIndexOf('.');
  return (i > 0 && i < name.length - 1) ? name.slice(i + 1).toLowerCase() : '';
}

function dfcInferType_(filename, ext, mime) {
  var name = filename.toLowerCase();
  for (var i = 0; i < DFC_TYPE_KEYWORDS_.length; i++) {
    if (DFC_TYPE_KEYWORDS_[i][0].test(name)) {
      var label = DFC_TYPE_KEYWORDS_[i][1];
      if (label === null) return /d[-_ ]?400|nc[_\- ]?d400|state/i.test(name) ? 'State Tax Return' : 'Tax Return';
      return label;
    }
  }
  if (DFC_GOOGLE_MIME_[mime]) return DFC_GOOGLE_MIME_[mime];
  return DFC_EXT_CATEGORY_[ext] || 'Other';
}

function dfcInferYear_(relParts, filename) {
  for (var i = 0; i < relParts.length; i++) {
    if (DFC_EXACT_YEAR_RE_.test(String(relParts[i]).trim())) return String(relParts[i]).trim();
  }
  var m = DFC_YEAR_RE_.exec(filename);
  if (m) return m[1];
  for (var j = 0; j < relParts.length; j++) {
    var m2 = DFC_YEAR_RE_.exec(relParts[j]);
    if (m2) return m2[1];
  }
  return '';
}

function dfcInferPerson_(relParts, filename) {
  var hay = (relParts.join(' ') + ' ' + filename).toLowerCase();
  var hasSyrina = hay.indexOf('syrina') > -1;
  var hasClinton = /clinton|clintonwimberly|\bclint\b/.test(hay);
  if (hay.indexOf('joint') > -1 || (hasSyrina && hasClinton)) return 'Joint';
  if (hasSyrina) return 'Syrina';
  if (hasClinton) return 'Clinton';
  return '';
}

/**
 * Recursively walk the Drive folder. Pushes 10-col rows into `rows`.
 * Returns { truncated:boolean, folders:int }.
 */
function dfcWalk_(folder, relPrefix, rows, ctx) {
  if (ctx.truncated) return;
  if (Date.now() - ctx.start > DRIVE_FC_MAX_MS_) { ctx.truncated = true; return; }
  ctx.folders++;

  var files = folder.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    var name = f.getName();
    var ext = dfcExt_(name);
    if (DFC_SKIP_FILE_RE_.test(name) || DFC_SKIP_EXT_[ext]) { ctx.skipped++; continue; }
    if (ctx.skipCode && (DFC_CODE_EXT_[ext] || DFC_CODE_NAME_RE_.test(name))) {
      ctx.skipped++; ctx.codeSkipped++; continue;
    }

    var relParts = relPrefix ? relPrefix.split('/') : [];
    var relPath = relPrefix ? (relPrefix + '/' + name) : name;
    var binder = relParts.length ? relParts[0] : '';
    var mime = f.getMimeType();

    rows.push([
      '',                                   // A Doc ID — assigned on append
      name,                                 // B Filename
      dfcInferType_(name, ext, mime),       // C Document Type
      dfcInferYear_(relParts, name),        // D Tax Year
      dfcInferPerson_(relParts, name),      // E Person
      '',                                   // F MR Account (no reliable map)
      binder,                               // G FWM Binder Tab (top folder)
      relPath,                              // H Full File Path (relative)
      relPrefix || '(root)',                // I Source Directory
      ctx.scanDate                          // J Scan Date
    ]);
  }

  var subs = folder.getFolders();
  while (subs.hasNext()) {
    if (ctx.truncated) return;
    var sub = subs.next();
    var sname = sub.getName();
    var low = sname.toLowerCase();
    if (DFC_SKIP_DIRS_[low]) continue;
    if (!ctx.includeArchive && !relPrefix && DFC_ARCHIVE_TOP_[low]) continue; // top-level Archive
    dfcWalk_(sub, relPrefix ? (relPrefix + '/' + sname) : sname, rows, ctx);
  }
}

// ── Step 1: Scan → preview tab (non-destructive) ──────────────────────────────
function runDriveFileCabinetScan() {
  var ui = SpreadsheetApp.getUi();
  var root;
  try { root = DriveApp.getFolderById(DRIVE_FC_ROOT_); }
  catch (e) { ui.alert('Cannot open FileCabinet folder (' + DRIVE_FC_ROOT_ + '): ' + e.message); return; }

  var ctx = { start: Date.now(), scanDate: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
              folders: 0, skipped: 0, codeSkipped: 0, truncated: false, includeArchive: false, skipCode: true };
  var rows = [];
  dfcWalk_(root, '', rows, ctx);

  // Dedup within the scan by relative path (collapses duplicate-named trees).
  var seen = {}, uniq = [], dupInScan = 0;
  for (var i = 0; i < rows.length; i++) {
    var k = normRegistryPath_(rows[i][7]);
    if (k && seen[k]) { dupInScan++; continue; }
    if (k) seen[k] = true;
    uniq.push(rows[i]);
  }

  // How many already exist in the live registry (col-H path match)?
  var reg = getRegistrySheet_();
  var existing = existingPathKeys_(reg, lastDocRow_(reg));
  var already = 0;
  for (var j = 0; j < uniq.length; j++) {
    if (existing[normRegistryPath_(uniq[j][7])]) { uniq[j].push('EXISTS'); already++; }
    else { uniq[j].push('NEW'); }
  }

  // Write preview tab (11 cols: schema A..J + Status).
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pv = ss.getSheetByName(DRIVE_FC_PREVIEW_) || ss.insertSheet(DRIVE_FC_PREVIEW_);
  pv.clear();
  var head = ['Doc ID', 'Filename', 'Document Type', 'Tax Year', 'Person', 'MR Account',
              'FWM Binder Tab', 'Full File Path', 'Source Directory', 'Scan Date', 'Status'];
  pv.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#1B2A4A').setFontColor('#fff');
  if (uniq.length) pv.getRange(2, 1, uniq.length, head.length).setValues(uniq);
  pv.setFrozenRows(1);

  var newCount = uniq.length - already;
  ui.alert('Drive FileCabinet scan complete' + (ctx.truncated ? ' (TRUNCATED — hit time limit)' : '') + '.\n\n' +
           'Folders walked: ' + ctx.folders + '\n' +
           'Files found: ' + rows.length + ' (' + ctx.skipped + ' skipped incl. ' + ctx.codeSkipped +
           ' code/log, ' + dupInScan + ' duplicate paths collapsed)\n' +
           'Unique docs: ' + uniq.length + '\n' +
           '  • NEW (not yet in registry): ' + newCount + '\n' +
           '  • already in registry: ' + already + '\n\n' +
           'Reviewed in "' + DRIVE_FC_PREVIEW_ + '". Run "Apply Drive FC Scan → Registry" to append the ' +
           newCount + ' NEW rows.');
}

// ── Undo → remove rows a prior Apply added from the Drive scan ─────────────────
// Deletes Document Registry rows whose col-H path matches a path in the current
// "Drive FC Scan Preview". Safe because Drive-scan paths have zero overlap with
// the PC-scanned rows, so only the appended duplicates are removed.
function undoDriveScanApply() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pv = ss.getSheetByName(DRIVE_FC_PREVIEW_);
  if (!pv || pv.getLastRow() < 2) { ui.alert('No "' + DRIVE_FC_PREVIEW_ + '" tab found — cannot identify what to undo.'); return; }

  var paths = {};
  var pvPaths = pv.getRange(2, 8, pv.getLastRow() - 1, 1).getValues();   // col H (Full File Path)
  for (var i = 0; i < pvPaths.length; i++) {
    var k = normRegistryPath_(pvPaths[i][0]);
    if (k) paths[k] = true;
  }

  var reg = getRegistrySheet_();
  var last = reg.getLastRow();
  if (last < REGISTRY_DATA_START_) { ui.alert('Registry is empty.'); return; }
  var colH = reg.getRange(REGISTRY_DATA_START_, 8, last - REGISTRY_DATA_START_ + 1, 1).getValues();

  var toDelete = [];
  for (var r = 0; r < colH.length; r++) {
    if (paths[normRegistryPath_(colH[r][0])]) toDelete.push(REGISTRY_DATA_START_ + r);
  }
  if (!toDelete.length) { ui.alert('Nothing to undo — no registry rows match the Drive scan paths.'); return; }

  var resp = ui.alert('Undo Drive scan Apply',
    'Delete ' + toDelete.length + ' registry rows whose path matches the Drive FC Scan Preview?\n' +
    'This removes the appended Drive-path duplicates and leaves the PC rows intact.',
    ui.ButtonSet.YES_NO);
  if (resp !== ui.Button.YES) return;

  for (var d = toDelete.length - 1; d >= 0; d--) reg.deleteRow(toDelete[d]);  // bottom-up
  ui.alert('Removed ' + toDelete.length + ' Drive-scan rows from the Document Registry.');
  return { ok: true, removed: toDelete.length };
}

// ── Step 2: Apply → append NEW rows to Document Registry ───────────────────────
function applyDriveFileCabinetScan() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pv = ss.getSheetByName(DRIVE_FC_PREVIEW_);
  if (!pv || pv.getLastRow() < 2) { ui.alert('No preview found. Run "Scan Drive FileCabinet…" first.'); return; }

  // Build TSV of the 10 schema cols (drop the Status col) and hand to the existing
  // importer in APPEND mode — it re-stamps DOC-IDs and dedups on path.
  var data = pv.getRange(2, 1, pv.getLastRow() - 1, 10).getValues();
  var lines = ['Doc ID\tFilename\tDocument Type\tTax Year\tPerson\tMR Account\tFWM Binder Tab\tFull File Path\tSource Directory\tScan Date'];
  for (var i = 0; i < data.length; i++) {
    lines.push(data[i].map(function (v) { return String(v == null ? '' : v).replace(/\t/g, ' '); }).join('\t'));
  }
  var res = importRegistryScan(lines.join('\n'), 'append');   // reuse tested append logic
  ui.alert(res && res.message ? res.message : 'Done.');
  return res;
}
