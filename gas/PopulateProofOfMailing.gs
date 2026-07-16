/**
 * PopulateProofOfMailing.gs — fill the Live workbook's "Proof of Mailing" tab from the
 * reconciled certified-mail record (04-Taxes/Receipts/Postal scans + Proof-of-Filing logs).
 *
 * Supersedes APPCMigration.gs: the APPC hub's Proof of Mailing tab turned out to be an empty
 * template, so there was nothing to migrate. The real source is the physical USPS receipts.
 *
 * Usage (Apps Script editor, bound to Live):
 *   1. previewProofOfMailingPopulate()  → check View > Logs (writes nothing)
 *   2. populateProofOfMailing()         → inserts the rows
 * Idempotent: a row is skipped if its Mail ID or certified tracking # already exists in the tab.
 *
 * Pairings use the CORRECTED tracking numbers from MAILING_LOG_2026-05-13.md (FINAL/CORRECTED),
 * NOT the swapped numbers in TMAR_ENTRY_PACKAGE_2026-05-13.md.
 *
 * 2026-07-14: USPS delivery scans for the 6/27 creditor batch confirmed MAIL-010 (Progressive)
 * and MAIL-012 (Piedmont) tracking numbers were transposed. Corrected by delivery city:
 *   ...2901 01 delivered CLEVELAND OH 44101 -> Progressive (MAIL-010)
 *   ...2900 95 delivered CHARLOTTE NC 28233 -> Piedmont   (MAIL-012)
 * All 8 creditor letters (MAIL-005..012) delivered 7/2-7/13/2026; delivery data recorded below.
 *
 * Re-apply after editing: refreshProofOfMailing()  (clears MAIL-* rows, then re-inserts).
 */

var POM_TAB_NAME_ = 'Proof of Mailing';
var POM_BASE_ = '04-Taxes\\Receipts\\Postal\\';

function pomNorm_(h) { return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }

/** Map a header cell to a canonical data key. Order matters (longest/most-specific first). */
function pomKey_(h) {
  var n = pomNorm_(h);
  var map = [
    ['recipientaddress', 'recipientaddress'], ['mailingaddress', 'recipientaddress'],
    ['address', 'recipientaddress'],
    ['recipient', 'recipient'], ['sentto', 'recipient'], ['to', 'recipient'],
    ['mailid', 'mailid'],
    ['datesent', 'datesent'], ['date', 'datesent'],
    // NOTE: 'documentlocation' must precede the 'documentsent'/'documentcontents' rules,
    // otherwise the generic "document" prefix mis-catches the "Document Location" header.
    ['documentlocation', 'documentlocation'], ['location', 'documentlocation'],
    ['filepath', 'documentlocation'], ['scan', 'documentlocation'],
    ['documentsent', 'documentsent'], ['documentcontents', 'documentsent'],
    ['documentcontent', 'documentsent'], ['contents', 'documentsent'], ['formcontents', 'documentsent'],
    ['relatedform', 'relatedform'], ['form', 'relatedform'],
    ['certifiedtracking', 'uspstracking'], ['certified', 'uspstracking'],
    ['uspstracking', 'uspstracking'], ['tracking', 'uspstracking'],
    ['psform3811', 'psform3811'], ['returnreceipttracking', 'psform3811'],
    ['returnreceiptnumber', 'psform3811'], ['greencard', 'psform3811'],
    ['deliveryconfirmed', 'deliveryconfirmed'], ['confirmed', 'deliveryconfirmed'],
    ['deliverydate', 'deliverydate'], ['delivered', 'deliverydate'],
    ['returnreceipt', 'returnreceipt'],
    ['fwmbindertab', 'fwmbindertab'], ['bindertab', 'fwmbindertab'], ['binder', 'fwmbindertab'],
    ['service', 'service'], ['cost', 'cost'], ['status', 'status'],
    ['note', 'note'], ['notes', 'note']
  ];
  for (var i = 0; i < map.length; i++) {
    if (n.indexOf(map[i][0]) === 0) return map[i][1];
  }
  return null;
}

/** The reconciled record. Keys are canonical (see pomKey_). */
function pomRecords_() {
  return [
    { mailid: 'MAIL-001', datesent: '2026-04-02',
      recipient: 'Internal Revenue Service (Dept. of the Treasury)',
      recipientaddress: 'Kansas City, MO 64999-0002',
      documentsent: 'IRS filing, 2022 tax year — mailed via CertifiedMailLabels.com',
      relatedform: 'Form 1040 (2022)',
      uspstracking: '9414 8118 9876 5525 2665 53',
      service: 'Certified Mail', status: 'MAILED',
      documentlocation: POM_BASE_ + '02APR26_CM_IRS-KC_266553.pdf',
      note: 'Ref "IRS FORM"; sender Clinton Wimberly IV, Trustee. Earlier guess that green card ' +
            '...5525 66 belonged to this piece RULED OUT 2026-07-16 — card front shows it is MAIL-011 ' +
            '(Verizon). No return receipt for MAIL-001; delivery not yet confirmed.' },

    { mailid: 'MAIL-002', datesent: '2026-05-13',
      recipient: 'NYS Dept. of Health, Bureau of Vital Records Certification Unit',
      recipientaddress: 'PO Box 2602, Albany NY 12220-2602',
      documentsent: 'DOH-4380 COLB Request x2 (CW IV + SSW) + 2x $30 money orders (MO 55160386748, 55160386755)',
      relatedform: 'DOH-4380 (Certificate of Live Birth)',
      uspstracking: '9589 0710 5270 4022 2902 86',
      service: 'Certified Mail', status: 'MAILED',
      documentlocation: POM_BASE_ + '13MAY26_PO_taxbatch-summary_290033.png',
      note: 'Certified, no return receipt. Enclosed 2x Love stamps for SASE return envelopes. ' +
            'Supporting scans: 13MAY26_MO_NYDOH-COLB.jpg (money orders + envelope), ' +
            '13MAY26_MO_COLB-2x-stamps.png (MO stubs + stamps), 13MAY26_REQ_NYDOH-COLB.jpg (DOH-4380 request).' },

    { mailid: 'MAIL-003', datesent: '2026-05-13',
      recipient: 'Internal Revenue Service (Dept. of the Treasury)',
      recipientaddress: 'Kansas City, MO 64999-0002',
      documentsent: '2022 Joint Form 1040 (Federal) — CPA prepared, signed CW IV + SSW [1st filing]',
      relatedform: 'Form 1040 (2022) - Federal',
      uspstracking: '9589 0710 5270 4022 2900 26',
      psform3811: '9590 9402 9939 5335 0121 35',
      deliveryconfirmed: 'Yes', deliverydate: '2026-05-27', returnreceipt: 'Yes - hardcopy',
      service: 'Certified + Return Receipt', status: 'DELIVERED',
      documentlocation: POM_BASE_ + '27MAY26_GC_IRS-KC-2022-alt_012135.png',
      note: 'Delivered 5/27/26 (IRS RECEIVED stamp #2231). Green card scan: 27MAY26_GC_IRS-KC-2022-alt_012135.png. ' +
            'Certified receipt (5/13 batch): 13MAY26_CM_IRS-NCDOR-2022TR_290033.jpg. ' +
            'Filing PDF: 04-Taxes\\IRS-Filings\\2022\\2022_Wimberly_Joint_1040_Filed_2026-05-13.pdf. ' +
            'Re-filed as MAIL-013 (2026-07-07).' },

    { mailid: 'MAIL-004', datesent: '2026-05-13',
      recipient: 'NC Department of Revenue',
      recipientaddress: 'PO Box 25000, Raleigh NC 27640-0002',
      documentsent: '2022 Joint NC D-400 (State) — CPA prepared, signed CW IV + SSW',
      relatedform: 'NC D-400 (2022) - State',
      uspstracking: '9589 0710 5270 4022 2900 33',
      psform3811: '9590 9402 9939 5335 0121 28',
      deliveryconfirmed: 'Yes', deliverydate: '2026-05-20', returnreceipt: 'Yes - hardcopy',
      service: 'Certified + Return Receipt', status: 'DELIVERED',
      documentlocation: POM_BASE_ + '20MAY26_GC_NCDOR-2022-alt_012128.png',
      note: 'Delivered 5/20/26 (NCDOR delivery stamp). Green card scans: 20MAY26_GC_NCDOR-2022-alt_012128.png ' +
            '+ -altB_012128.png. Certified receipt (5/13 batch): 13MAY26_CM_IRS-NCDOR-2022TR_290033.jpg.' },

    // --- 2026-06-27 creditor demand-letter batch (8 certified, no return receipts) ---
    { mailid: 'MAIL-005', datesent: '2026-06-27', recipient: 'First Premier Bank',
      recipientaddress: '601 S Minnesota Ave, Sioux Falls SD 57104',
      documentsent: 'Creditor demand letter', relatedform: 'UCC demand letter',
      uspstracking: '9589 0710 5270 4022 2902 17', service: 'Certified Mail', status: 'DELIVERED',
      deliveryconfirmed: 'Yes', deliverydate: '2026-07-13',
      documentlocation: POM_BASE_ + '27JUN26_PO_creditors-8x-receipt.jpg',
      note: '6/27/2026 certified demand-letter batch (8). No return receipt purchased. Delivered 7/13/2026 11:29 AM — Left with Individual (electronic confirmation only). PS 3800 stubs grid: 27JUN26_CM_creditors-8x-grid.jpg.' },
    { mailid: 'MAIL-006', datesent: '2026-06-27', recipient: 'OneMain Financial',
      recipientaddress: 'PO Box 3251, Evansville IN 47731',
      documentsent: 'Creditor demand letter', relatedform: 'UCC demand letter',
      uspstracking: '9589 0710 5270 4022 2902 24', service: 'Certified Mail', status: 'DELIVERED',
      deliveryconfirmed: 'Yes', deliverydate: '2026-07-02',
      documentlocation: POM_BASE_ + '27JUN26_PO_creditors-8x-receipt.jpg',
      note: '6/27/2026 demand-letter batch. Delivered 7/2/2026 7:11 AM — PO Box. PS 3800 stubs grid: 27JUN26_CM_creditors-8x-grid.jpg.' },
    { mailid: 'MAIL-007', datesent: '2026-06-27', recipient: 'NELNET',
      recipientaddress: 'PO Box 82561, Lincoln NE 68501',
      documentsent: 'Creditor demand letter', relatedform: 'UCC demand letter',
      uspstracking: '9589 0710 5270 4022 2902 31', service: 'Certified Mail', status: 'DELIVERED',
      deliveryconfirmed: 'Yes', deliverydate: '2026-07-02',
      documentlocation: POM_BASE_ + '27JUN26_PO_creditors-8x-receipt.jpg',
      note: '6/27/2026 demand-letter batch. Delivered 7/2/2026 7:20 AM — PO Box. PS 3800 stubs grid: 27JUN26_CM_creditors-8x-grid.jpg.' },
    { mailid: 'MAIL-008', datesent: '2026-06-27', recipient: 'Altice USA Inc',
      recipientaddress: '1111 Stewart Ave, Bethpage NY 11714',
      documentsent: 'Creditor demand letter', relatedform: 'UCC demand letter',
      uspstracking: '9589 0710 5270 4022 2901 18',
      psform3811: '9590 9402 9939 5335 0121 11',
      service: 'Certified + Return Receipt', status: 'DELIVERED',
      deliveryconfirmed: 'Yes', deliverydate: '2026-07-02', returnreceipt: 'Yes - hardcopy',
      documentlocation: POM_BASE_ + '27JUN26_PO_creditors-8x-receipt.jpg',
      note: '6/27/2026 demand-letter batch. Delivered 7/2/2026 9:47 AM — Left with Individual. ' +
            'Green card CONFIRMED 2026-07-16 vs card front: addressed Altice USA Inc, 1111 Stewart Ave ' +
            'Bethpage NY 11714, article ...2901 18, PS 3811 ...0121 11. Card scans filed at ' +
            '06-Account-Register\\Altice\\ (Altice Front_.jpg / Altice Back_1200px.jpg); sender-side scan: ' +
            POM_BASE_ + '08JUL26_GC_Altice-demand_012111.jpg. PS 3800 stubs grid: 27JUN26_CM_creditors-8x-grid.jpg.' },
    { mailid: 'MAIL-009', datesent: '2026-06-27', recipient: 'Capital One Bank (USA) NA',
      recipientaddress: 'PO Box 30285, Salt Lake City UT 84130',
      documentsent: 'Creditor demand letter', relatedform: 'UCC demand letter',
      uspstracking: '9589 0710 5270 4022 2900 64',
      psform3811: '9590 9402 9486 5069 5525 42',
      service: 'Certified + Return Receipt', status: 'DELIVERED',
      deliveryconfirmed: 'Yes', deliverydate: '2026-07-06', returnreceipt: 'Yes - hardcopy',
      documentlocation: POM_BASE_ + '27JUN26_PO_creditors-8x-receipt.jpg',
      note: '6/27/2026 demand-letter batch. Delivered 7/6/2026 8:47 AM — PO Box (USPS scan). ' +
            'Green card in hand 2026-07-16: article ...2900 64, PS 3811 ...5525 42, signed; card ' +
            'delivery stamp reads JUL 07 2026 (one day after USPS electronic scan — kept USPS date). ' +
            'Card scans filed at 06-Account-Register\\Capital_One_Bank\\ (CapOne_FRONT_label_1200px.jpg / ' +
            'CapOne_BACK_greencard_1200px.jpg). PS 3800 stubs grid: 27JUN26_CM_creditors-8x-grid.jpg.' },
    { mailid: 'MAIL-010', datesent: '2026-06-27', recipient: 'Progressive Insurance',
      recipientaddress: 'PO Box 6807, Cleveland OH 44101',
      documentsent: 'Creditor demand letter', relatedform: 'UCC demand letter',
      uspstracking: '9589 0710 5270 4022 2901 01', service: 'Certified Mail', status: 'DELIVERED',
      deliveryconfirmed: 'Yes', deliverydate: '2026-07-06',
      documentlocation: POM_BASE_ + '27JUN26_PO_creditors-8x-receipt.jpg',
      note: '6/27/2026 demand-letter batch. Tracking CORRECTED 2026-07-14: swapped with MAIL-012 — USPS shows this piece (...2901 01) delivered CLEVELAND OH 44101, Progressive\'s city. Delivered 7/6/2026 — Picked Up at Post Office. PS 3800 stubs grid: 27JUN26_CM_creditors-8x-grid.jpg.' },
    { mailid: 'MAIL-011', datesent: '2026-06-27', recipient: 'Verizon Communications Inc',
      recipientaddress: 'PO Box 408, Newark NJ 07101',
      documentsent: 'Creditor demand letter', relatedform: 'UCC demand letter',
      uspstracking: '9589 0710 5270 4022 2901 25',
      psform3811: '9590 9402 9486 5069 5525 66',
      service: 'Certified + Return Receipt', status: 'DELIVERED',
      deliveryconfirmed: 'Yes', deliverydate: '2026-07-02', returnreceipt: 'Yes - hardcopy',
      documentlocation: POM_BASE_ + '27JUN26_PO_creditors-8x-receipt.jpg',
      note: '6/27/2026 demand-letter batch. Pairing confirmed by USPS delivery (Newark NJ). ' +
            'Delivered 7/2/2026 5:17 AM — PO Box; green card signed "Diego F", date of delivery 7-2-26. ' +
            'Card CONFIRMED in hand 2026-07-16: article ...2901 25, PS 3811 ...5525 66. Card scans filed at ' +
            '06-Account-Register\\Verizon\\ (Verizon_FRONT_greencard_1200px.jpg / Verizon_Back_TRACKING_labels_1200px.jpg); ' +
            'sender-side scan: ' + POM_BASE_ + '08JUL26_GC_Verizon-demand_552566.jpg. ' +
            'PS 3800 stubs grid: 27JUN26_CM_creditors-8x-grid.jpg.' },
    { mailid: 'MAIL-012', datesent: '2026-06-27', recipient: 'Piedmont Natural Gas',
      recipientaddress: 'PO Box 33068, Charlotte NC 28233',
      documentsent: 'Creditor demand letter', relatedform: 'UCC demand letter',
      uspstracking: '9589 0710 5270 4022 2900 95', service: 'Certified Mail', status: 'DELIVERED',
      deliveryconfirmed: 'Yes', deliverydate: '2026-07-02',
      documentlocation: POM_BASE_ + '27JUN26_PO_creditors-8x-receipt.jpg',
      note: '6/27/2026 demand-letter batch. Tracking CORRECTED 2026-07-14: swapped with MAIL-010 — USPS shows this piece (...2900 95) delivered CHARLOTTE NC 28233, Piedmont\'s city. Delivered 7/2/2026 — Picked Up at Post Office. PS 3800 stubs grid: 27JUN26_CM_creditors-8x-grid.jpg.' },

    { mailid: 'MAIL-013', datesent: '2026-07-07',
      recipient: 'Internal Revenue Service — Stop 6120',
      recipientaddress: 'Kansas City, MO 64999-0002',
      documentsent: '2022 Form 1040 (Federal) — SECOND filing / re-send',
      relatedform: 'Form 1040 (2022) - Federal [2nd]',
      uspstracking: '9589 0710 5270 4022 2894 71',
      psform3811: '9590 9402 0097 6058 1083 41',
      returnreceipt: 'Yes - hardcopy (return pending)',
      service: 'Certified + Return Receipt', status: 'MAILED — awaiting delivery',
      documentlocation: POM_BASE_ + '07JUL26_CM_IRS-KC-2022-2nd_289471.pdf',
      note: '2022 1040 filed TWICE: 1st = MAIL-003 (5/13, delivered 5/27); this 2nd filing 7/7, ' +
            'est. delivery 7/11. Return receipt 1083 41 not yet returned.' },

    // --- 2026-04-01 IRS CAF Unit fax filings. NON-POSTAL (fax, no USPS tracking) but logged here
    //     per operator request; also tracked in Proof-of-Filing/Filing-Status-Tracker.md (FS-05/06). ---
    { mailid: 'MAIL-014', datesent: '2026-04-01',
      recipient: 'IRS CAF Unit — Memphis',
      recipientaddress: 'Fax 855-214-7519 (Centralized Authorization File Processing)',
      documentsent: 'Form 2848 Power of Attorney (2 pp, wet-ink signed) + trust instrument pp 1/9/10',
      relatedform: 'Form 2848 (POA)',
      uspstracking: '',
      service: 'Fax filing (not USPS)', status: 'FILED — FAX',
      documentlocation: '02-Recorded-Documents\\Filing Packages\\FAX_2848_with_Cover_and_Trust.pdf',
      note: 'Filed by FAX 2026-04-01 to IRS CAF Unit Memphis (855-214-7519). CAF No. 0317-17351. ' +
            '6 pages incl. cover. Taxpayer: A Provident Private Creditor RLT. NOT USPS mail — no tracking #. ' +
            'Cover sheet verified; fax transmission-confirmation page not located.' },

    { mailid: 'MAIL-015', datesent: '2026-04-01',
      recipient: 'IRS CAF Unit — Memphis',
      recipientaddress: 'Fax 855-214-7519 (Centralized Authorization File Processing)',
      documentsent: 'Form 8821 Tax Information Authorization (1 p, wet-ink signed) + trust instrument pp 1/9/10',
      relatedform: 'Form 8821 (TIA)',
      uspstracking: '',
      service: 'Fax filing (not USPS)', status: 'FILED — FAX',
      documentlocation: '02-Recorded-Documents\\Filing Packages\\FAX_8821_with_Cover_and_Trust.pdf',
      note: 'Filed by FAX 2026-04-01 to IRS CAF Unit Memphis (855-214-7519). CAF No. 0317-17351 ' +
            '(designee Clinton Wimberly IV). 5 pages incl. cover. NOT USPS mail — no tracking #. ' +
            'Cover sheet verified; fax transmission-confirmation page not located.' }
  ];
}

function previewProofOfMailingPopulate() { return pomPopulate_(true); }
function populateProofOfMailing() { return pomPopulate_(false); }

/**
 * One-shot refresh: delete every MAIL-* row, then re-insert the full reconciled set from
 * pomRecords_(). Use this to apply edits to existing rows (populate alone skips rows that
 * already exist). Header + footer rows are preserved. Returns a summary string.
 * Callable from the Apps Script editor OR the Web App (doPost 'refreshProofOfMailing').
 */
function refreshProofOfMailing() {
  var cleared = clearProofOfMailingRows();
  var added = pomPopulate_(false);
  var msg = cleared + ' ' + added;
  Logger.log(msg);
  return msg;
}

/**
 * Delete every MAIL-* data row from the Proof of Mailing tab (header + footer untouched),
 * so populateProofOfMailing() can re-insert a clean set. Run this, then populateProofOfMailing().
 */
function clearProofOfMailingRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = (ss && ss.getSheetByName(POM_TAB_NAME_)) ||
              SpreadsheetApp.openById(TMAR_CONFIG.liveBookId).getSheetByName(POM_TAB_NAME_);
  if (!sheet) throw new Error('Tab not found: ' + POM_TAB_NAME_);
  var values = sheet.getDataRange().getValues();
  var deleted = 0;
  // delete bottom-up so row indices stay valid
  for (var r = values.length - 1; r >= 0; r--) {
    if (/^mail-/i.test(String(values[r][0] || '').trim())) {
      sheet.deleteRow(r + 1); // 1-based
      deleted++;
    }
  }
  var msg = 'Deleted ' + deleted + ' MAIL-* row(s) from ' + POM_TAB_NAME_ + '.';
  Logger.log(msg);
  return msg;
}

function pomPopulate_(dryRun) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = (ss && ss.getSheetByName(POM_TAB_NAME_)) ||
              SpreadsheetApp.openById(TMAR_CONFIG.liveBookId).getSheetByName(POM_TAB_NAME_);
  if (!sheet) throw new Error('Tab not found: ' + POM_TAB_NAME_);

  var values = sheet.getDataRange().getValues();
  var headerRow = -1;
  for (var r = 0; r < values.length; r++) {
    if (pomNorm_(values[r][0]) === 'mailid') { headerRow = r; break; }
  }
  if (headerRow < 0) throw new Error('No "Mail ID" header row found in ' + POM_TAB_NAME_);

  var headers = values[headerRow];
  var width = sheet.getLastColumn();
  var colKey = headers.map(pomKey_);
  var noteCol = -1;
  for (var c = 0; c < colKey.length; c++) if (colKey[c] === 'note') noteCol = c;

  Logger.log('Header row at sheet row %s. Column map:', headerRow + 1);
  for (var c2 = 0; c2 < headers.length; c2++) {
    Logger.log('  col %s "%s" -> %s', c2 + 1, headers[c2], colKey[c2] || '(unmapped)');
  }

  // existing keys for dedup
  var seen = {};
  for (var r2 = headerRow + 1; r2 < values.length; r2++) {
    var a = pomNorm_(values[r2][0]);
    if (/^mail/.test(a)) seen['id:' + a] = true;
    for (var c3 = 0; c3 < colKey.length; c3++) {
      if (colKey[c3] === 'uspstracking' && values[r2][c3]) seen['trk:' + pomNorm_(values[r2][c3])] = true;
    }
  }

  var recs = pomRecords_();
  var toAdd = recs.filter(function (rec) {
    return !seen['id:' + pomNorm_(rec.mailid)] &&
           !(rec.uspstracking && seen['trk:' + pomNorm_(rec.uspstracking)]);
  });

  Logger.log('Records: %s | already present: %s | to add: %s',
             recs.length, recs.length - toAdd.length, toAdd.length);

  var rows = toAdd.map(function (rec) {
    var row = new Array(width).fill('');
    var overflow = [];
    Object.keys(rec).forEach(function (k) {
      var placed = false;
      for (var c = 0; c < colKey.length && c < width; c++) {
        if (colKey[c] === k) { row[c] = rec[k]; placed = true; break; }
      }
      // service/cost/status have no column in this tab and are redundant with the
      // delivery columns — drop them rather than clutter Notes.
      if (!placed && k !== 'note' && ['service', 'cost', 'status'].indexOf(k) === -1) {
        overflow.push(k + '=' + rec[k]);
      }
    });
    if (noteCol >= 0) {
      var base = rec.note ? String(rec.note) : '';
      if (overflow.length) base += (base ? ' | ' : '') + overflow.join('; ');
      row[noteCol] = base;
    }
    return row;
  });

  toAdd.forEach(function (rec) { Logger.log('  + %s | %s | %s | %s', rec.mailid, rec.datesent, rec.recipient, rec.uspstracking); });

  if (dryRun) return 'DRY RUN — ' + toAdd.length + ' row(s) would be added. See View > Logs.';
  if (!rows.length) return 'Nothing to add — all records already present.';

  var insertAt = headerRow + 2; // sheet row directly under the header
  sheet.insertRowsBefore(insertAt, rows.length);
  sheet.getRange(insertAt, 1, rows.length, width).setValues(rows);
  var msg = 'Added ' + rows.length + ' Proof of Mailing row(s) starting at row ' + insertAt + '.';
  Logger.log(msg);
  return msg;
}
