/**
 * APPCMigration.gs — one-time migration of Proof of Mailing records from the dead
 * APPC_RLT hub into the Live workbook's Proof of Mailing tab.
 *
 * Background: the APPC hub (1Ac5A…ATtc) was folded into Live 2026-06-27 and flagged
 * do-not-write, but its 📮 Proof of Mailing tab still holds the only copy of the
 * certified-mail log (MAIL-001…006: Form 56 to Treasury KC, Form 2848/8821 CAF,
 * USCIS FOIA, NC D-400, NY DOH). Live's Proof of Mailing tab is empty.
 *
 * Usage (Apps Script editor, bound to the Live workbook project):
 *   1. Run previewAPPCProofOfMailingMigration()  → check the log (View > Logs)
 *   2. Run migrateAPPCProofOfMailing()           → appends the rows
 * Idempotent: rows are skipped when their Mail ID or USPS tracking # already exists in Live.
 */

var APPC_HUB_ID_ = '1Ac5AAM2381L2AgXi_llp7ugfRW2bWX2NbMLW3jiATtc';
var APPC_HUB_POM_TAB_ = '📮 Proof of Mailing';
var LIVE_POM_TAB_ = 'Proof of Mailing';

function previewAPPCProofOfMailingMigration() { return appcPomMigrate_(true); }
function migrateAPPCProofOfMailing() { return appcPomMigrate_(false); }

function appcPomNorm_(h) {
  return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Map a source header to a canonical key both sheets share. */
function appcPomKey_(h) {
  var n = appcPomNorm_(h);
  var canon = ['mailid', 'datesent', 'recipientaddress', 'recipient', 'documentsent',
               'relatedform', 'uspstracking', 'psform3811', 'deliveryconfirmed',
               'deliverydate', 'returnreceipt', 'fwmbindertab', 'documentlocation', 'note'];
  for (var i = 0; i < canon.length; i++) {
    if (n.indexOf(canon[i]) === 0) return canon[i];
  }
  return null;
}

function appcPomReadTab_(sheet) {
  var values = sheet.getDataRange().getValues();
  var headerRow = -1;
  for (var r = 0; r < values.length; r++) {
    if (appcPomNorm_(values[r][0]) === 'mailid') { headerRow = r; break; }
  }
  if (headerRow < 0) throw new Error('No "Mail ID" header row found in ' + sheet.getName());
  var keys = values[headerRow].map(appcPomKey_);
  var records = [];
  for (var r2 = headerRow + 1; r2 < values.length; r2++) {
    var first = String(values[r2][0] || '');
    if (/^MAIL-/i.test(first)) {
      var rec = {};
      for (var c = 0; c < keys.length; c++) {
        if (keys[c]) rec[keys[c]] = values[r2][c];
      }
      records.push(rec);
    }
  }
  return { headerRow: headerRow, keys: keys, records: records, values: values };
}

function appcPomMigrate_(dryRun) {
  var hub = SpreadsheetApp.openById(APPC_HUB_ID_).getSheetByName(APPC_HUB_POM_TAB_);
  if (!hub) throw new Error('Hub tab not found: ' + APPC_HUB_POM_TAB_);
  var live = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LIVE_POM_TAB_)
          || SpreadsheetApp.openById(TMAR_CONFIG.liveBookId).getSheetByName(LIVE_POM_TAB_);
  if (!live) throw new Error('Live tab not found: ' + LIVE_POM_TAB_);

  var src = appcPomReadTab_(hub);
  var dst = appcPomReadTab_(live);

  // existing keys in Live for dedup
  var seen = {};
  dst.records.forEach(function (rec) {
    if (rec.mailid) seen['id:' + appcPomNorm_(rec.mailid)] = true;
    if (rec.uspstracking) seen['trk:' + appcPomNorm_(rec.uspstracking)] = true;
  });

  var toAdd = src.records.filter(function (rec) {
    var idK = 'id:' + appcPomNorm_(rec.mailid || '');
    var trkRaw = appcPomNorm_(rec.uspstracking || '');
    var trkK = 'trk:' + trkRaw;
    var dupe = seen[idK] || (trkRaw && trkRaw.indexOf('uspstracking') === -1 && trkRaw.length > 8 && seen[trkK]);
    return !dupe;
  });

  Logger.log('Hub records: %s | already in Live: %s | to migrate: %s',
             src.records.length, src.records.length - toAdd.length, toAdd.length);
  toAdd.forEach(function (rec) {
    Logger.log('  + %s | %s | %s | trk %s', rec.mailid, rec.recipient, rec.documentsent, rec.uspstracking);
  });
  if (dryRun) return 'DRY RUN — ' + toAdd.length + ' row(s) would be migrated. See log.';
  if (!toAdd.length) return 'Nothing to migrate — Live already has all hub records.';

  // insert before the footer (first row after the header block whose col A is non-MAIL text)
  var liveValues = dst.values;
  var insertAt = liveValues.length + 1; // default: end of data
  for (var r = dst.headerRow + 1; r < liveValues.length; r++) {
    var first = String(liveValues[r][0] || '');
    if (first && !/^MAIL-/i.test(first)) { insertAt = r + 1; break; } // 1-based sheet row of footer
  }
  var width = live.getLastColumn();
  var rows = toAdd.map(function (rec) {
    var row = new Array(width).fill('');
    for (var c = 0; c < dst.keys.length && c < width; c++) {
      if (dst.keys[c] && rec[dst.keys[c]] !== undefined) row[c] = rec[dst.keys[c]];
    }
    return row;
  });
  live.insertRowsBefore(insertAt, rows.length);
  live.getRange(insertAt, 1, rows.length, width).setValues(rows);
  var msg = 'Migrated ' + rows.length + ' Proof of Mailing row(s) from the APPC hub into Live (inserted at row ' + insertAt + ').';
  Logger.log(msg);
  return msg;
}
