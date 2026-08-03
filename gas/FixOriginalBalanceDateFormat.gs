/**
 * FixOriginalBalanceDateFormat.gs — Master Register column L (Original
 * Balance) had leftover Date-formatted cells on 23 rows (MR-113 through
 * MR-145, minus MR-145 itself which was unaffected) from the historical
 * credit-report-import column-shift bug: those cells used to hold shifted
 * ISO-date strings (e.g. "2023-11-01"), and Google Sheets auto-applied Date
 * formatting to them at that time. That formatting stuck even after
 * pushEntities_ overwrote the cell with a correct plain number (e.g. 1521)
 * on 2026-08-02 — Sheets reinterpreted the number as a date serial and
 * getValues() returned it as a date string ("1904-02-29") instead of 1521.
 *
 * Usage (Apps Script editor, bound to Live):
 *   1. previewOriginalBalanceFormat() → read-only; logs which of the 23 rows
 *      currently show a date-shaped value in column L.
 *   2. fixOriginalBalanceDateFormat() → clears Date format on column L for
 *      just these 23 rows, then re-writes the correct numeric value for each.
 */

var ORIGINAL_BALANCE_FIX_VALUES = {
  'MR-113': 1521, 'MR-115': 5807, 'MR-117': 834, 'MR-118': 1521,
  'MR-126': 4447, 'MR-127': 104, 'MR-128': 21634, 'MR-129': 21031,
  'MR-130': 3114, 'MR-131': 19656, 'MR-132': 7103, 'MR-133': 12548,
  'MR-134': 24236, 'MR-135': 129, 'MR-136': 3071, 'MR-137': 1500,
  'MR-138': 187, 'MR-139': 626, 'MR-140': 6567, 'MR-141': 6567,
  'MR-142': 9592, 'MR-143': 652, 'MR-144': 1000
};

function previewOriginalBalanceFormat() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var lastRow = sheet.getLastRow();
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var formats = sheet.getRange(2, 12, lastRow - 1, 1).getNumberFormats();
  var report = [];
  for (var rid in ORIGINAL_BALANCE_FIX_VALUES) {
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === rid) {
        report.push(rid + ': format="' + formats[i][0] + '"');
        break;
      }
    }
  }
  Logger.log(report.join('\n'));
  return report.length + ' rows checked. See View > Logs for details.';
}

function fixOriginalBalanceDateFormat() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var lastRow = sheet.getLastRow();
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  var fixed = 0, notFound = [];
  for (var rid in ORIGINAL_BALANCE_FIX_VALUES) {
    var rowNum = -1;
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === rid) { rowNum = i + 2; break; }
    }
    if (rowNum === -1) { notFound.push(rid); continue; }

    var cell = sheet.getRange(rowNum, 12); // column L, Original Balance
    cell.setNumberFormat('0.00');
    cell.setValue(ORIGINAL_BALANCE_FIX_VALUES[rid]);
    SpreadsheetApp.flush();
    fixed++;
  }

  var msg = 'Fixed ' + fixed + ' rows.' + (notFound.length ? ' Not found: ' + notFound.join(', ') : '');
  Logger.log(msg);
  return msg;
}

/**
 * Phase 4 structural gaps that pushEntities_ can't reach: it never writes
 * Row ID (col A) or Provider EIN / Account Number on an UPDATE (only on a
 * brand-new appended row) — see pushEntities_ in SyncCenter.gs. Two rows
 * need exactly that:
 *   - "Progressive Insurance" has no Row ID (blank-ID legacy row) — assign
 *     the next available MR-### so it's a first-class record.
 *   - "Life Insurance Co" (MR-026) is missing its EIN/Account Number even
 *     though the actual policy (Colonial Life & Accident, #8414072810,
 *     EIN 57-0354320) is on file — fill both in.
 * Run this once alongside fixOriginalBalanceDateFormat().
 */
function fixPhase4StructuralGaps() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var lastRow = sheet.getLastRow();
  var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues(); // A:Row ID, B:Date Added, C:Provider
  var results = [];

  // Assign a Row ID to the blank-ID Progressive Insurance row.
  var nextId = 1;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var k = 0; k < ids.length; k++) {
    var match = String(ids[k][0]).match(/MR-(\d+)/);
    if (match) nextId = Math.max(nextId, parseInt(match[1]) + 1);
  }
  var progRow = -1;
  for (var i = 0; i < data.length; i++) {
    if (!data[i][0] && data[i][2] === 'Progressive Insurance') { progRow = i + 2; break; }
  }
  if (progRow > -1) {
    var newId = 'MR-' + String(nextId).padStart(3, '0');
    sheet.getRange(progRow, 1).setValue(newId);
    SpreadsheetApp.flush();
    results.push('Progressive Insurance assigned ' + newId + ' (row ' + progRow + ')');
  } else {
    results.push('Progressive Insurance: no blank-ID row found (already has an ID, or name changed)');
  }

  // Fill EIN + Account Number for MR-026 (Life Insurance Co).
  var lifeRow = -1;
  for (var j = 0; j < data.length; j++) {
    if (data[j][0] === 'MR-026') { lifeRow = j + 2; break; }
  }
  if (lifeRow > -1) {
    sheet.getRange(lifeRow, 4).setValue('57-0354320'); // Provider EIN
    sheet.getRange(lifeRow, 5).setValue('8414072810');  // Account Number (policy #)
    SpreadsheetApp.flush();
    results.push('MR-026 EIN + Account Number set (row ' + lifeRow + ')');
  } else {
    results.push('MR-026 not found');
  }

  var msg = results.join(' | ');
  Logger.log(msg);
  return msg;
}

/**
 * One-time cleanup for a duplicate created by the row-2 upsert bug just
 * fixed in pushEntities_ (SyncCenter.gs) — a POST update targeting "Boys &
 * Girls Club Wayne" (MR-001, sheet row 2) couldn't match it because the old
 * lookup started scanning at row 3, so it appended a new row (MR-148)
 * instead. This merges MR-148's intended content directly onto MR-001 (row
 * writes, not pushEntities_, so it doesn't depend on the Web App being
 * redeployed) and deletes the duplicate row.
 */
function mergeBgcDuplicateIntoMr001() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var lastRow = sheet.getLastRow();
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  var mr001Row = -1, mr148Row = -1;
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === 'MR-001') mr001Row = i + 2;
    if (ids[i][0] === 'MR-148') mr148Row = i + 2;
  }
  if (mr001Row === -1) return 'MR-001 not found';
  if (mr148Row === -1) return 'MR-148 not found — may already be cleaned up';

  sheet.getRange(mr001Row, 25).setValue('2026-08-02'); // Last Verified Date
  sheet.getRange(mr001Row, 27).setValue(
    '2025 full-year payroll deposit record on file (25 pay periods, Jan-Dec 2025, ' +
    'total net deposits $34,858.53, biweekly, direct deposit to account ending 0672). ' +
    'Source: 04-Taxes/Syrina/Boys & Girls Club 1 25 - 12 25.pdf.'
  ); // Notes
  SpreadsheetApp.flush();
  sheet.deleteRow(mr148Row);

  return 'Merged onto MR-001 (row ' + mr001Row + '), deleted duplicate MR-148 (was row ' + mr148Row + ')';
}

/**
 * MR-096/097/098 ("Capital One 360 Checking", "Cap One 360 Perf Savings",
 * "Capital One 360 Checking (2nd)") looked like more Group-B creditor-
 * identity clutter, but they're actually 3 real distinct bank accounts —
 * Creditor Registry already has their true account numbers under
 * C-002/C-003/C-004 (the "CO-TRUSTEE — SYRINA S. WIMBERLY" section). Fills
 * EIN + Account Number directly since pushEntities_ can't touch those on
 * an update.
 */
function fixCapitalOne360Accounts() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var lastRow = sheet.getLastRow();
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  var fixes = {
    'MR-096': { ein: '54-1719854', acct: '36136995198' }, // 360 Checking
    'MR-097': { ein: '54-1719854', acct: '36136995385' }, // 360 Perf Savings
    'MR-098': { ein: '54-1719854', acct: '36270212801' }  // 360 Checking (2nd)
  };
  var results = [];
  for (var rid in fixes) {
    var rowNum = -1;
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === rid) { rowNum = i + 2; break; }
    }
    if (rowNum === -1) { results.push(rid + ' not found'); continue; }
    sheet.getRange(rowNum, 4).setValue(fixes[rid].ein);
    sheet.getRange(rowNum, 5).setValue(fixes[rid].acct);
    SpreadsheetApp.flush();
    results.push(rid + ' EIN + Account Number set (row ' + rowNum + ')');
  }
  var msg = results.join(' | ');
  Logger.log(msg);
  return msg;
}

/**
 * FileCabinet audit 2026-08-02 turned up a real account number for MR-008
 * (Webull, Clint) that was previously blank -- "APEX C/F ROTH IRA",
 * custodian UMB Bank NA, confirmed directly from statement PDFs.
 */
function fixWebullAccountNumber() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var lastRow = sheet.getLastRow();
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var rowNum = -1;
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === 'MR-008') { rowNum = i + 2; break; }
  }
  if (rowNum === -1) return 'MR-008 not found';
  sheet.getRange(rowNum, 5).setValue('5IA46352');
  SpreadsheetApp.flush();
  return 'MR-008 account number set to 5IA46352 (row ' + rowNum + ')';
}

/**
 * Phase 2 cleanup — delete the 68 verified creditor-identity clutter rows
 * (56 numbered + 12 blank-Row-ID). Each was checked column-by-column against
 * the full 29-column schema on 2026-08-02: every one holds only
 * boilerplate (name/EIN/address-fragment/"Synced from Ledger") with zero
 * unique data beyond what's already captured in Creditor Registry or in the
 * real account row for that creditor. Matches numbered rows by Row ID
 * (exact), blank-ID rows by Provider name AND blank Row ID together (so a
 * same-named real row is never at risk). Does NOT touch MR-060-064 (tech
 * companies, still pending user input) or the SDHC blank-ID row (has its
 * own dedicated script, DeleteSdhcDuplicateRow.gs).
 */
function deletePhase2ClutterRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var lastRow = sheet.getLastRow();
  var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues(); // A:Row ID, B:Date Added, C:Provider

  var numberedIds = ['MR-031','MR-032','MR-034','MR-035','MR-037','MR-040','MR-041','MR-042','MR-043',
    'MR-044','MR-045','MR-046','MR-047','MR-048','MR-049','MR-051','MR-052','MR-053','MR-054','MR-055',
    'MR-056','MR-057','MR-058','MR-059','MR-068','MR-069','MR-070','MR-072','MR-073','MR-074','MR-075',
    'MR-077','MR-078','MR-079','MR-080','MR-081','MR-082','MR-083','MR-084','MR-085','MR-093','MR-094',
    'MR-095','MR-099','MR-100','MR-101','MR-102','MR-103','MR-104','MR-105','MR-106','MR-107','MR-108',
    'MR-109','MR-110','MR-111'];
  var blankIdNames = ['National Financial Svcs LLC','Colonial Life & Accident Ins Co','Assurant Inc',
    'Bank of America NA','Fidelity Investments - FMR LLC','Vanguard Group Inc','Duke Energy Progress LLC',
    'Charter Comm - Spectrum','Piedmont Natural Gas Co','Verizon Communications Inc','Altice USA - Optimum',
    'City of Kinston'];

  var rowsToDelete = [];
  var numberedSet = {};
  numberedIds.forEach(function(id) { numberedSet[id] = true; });
  var blankSet = {};
  blankIdNames.forEach(function(n) { blankSet[n] = true; });

  for (var i = 0; i < data.length; i++) {
    var rid = data[i][0], provider = data[i][2];
    if (rid && numberedSet[rid]) {
      rowsToDelete.push(i + 2);
      delete numberedSet[rid];
    } else if (!rid && blankSet[provider]) {
      rowsToDelete.push(i + 2);
      delete blankSet[provider];
    }
  }
  var notFound = Object.keys(numberedSet).concat(Object.keys(blankSet));

  // Delete highest row number first so earlier indices don't shift.
  rowsToDelete.sort(function(a, b) { return b - a; });
  rowsToDelete.forEach(function(r) { sheet.deleteRow(r); });

  var msg = 'Deleted ' + rowsToDelete.length + ' rows.' +
    (notFound.length ? ' Not found (already gone?): ' + notFound.join(', ') : '');
  Logger.log(msg);
  return msg;
}

/**
 * Phase 3 — MR-060 through MR-064 (Anthropic PBC, OpenAI LLC, Apple Inc.,
 * Google LLC, Microsoft Corporation) are real accounts, but user confirmed
 * they belong in Website Accounts, not Master Register (it's not a
 * financial account in this ledger's sense). Anthropic/OpenAI already have
 * real entries there (Claude AI = WA-002, ChatGPT = WA-004); Apple/Google/
 * Microsoft were just added as WA rows via pushWebsiteAccounts. All 5 were
 * confirmed pure boilerplate here (no unique data) before deleting.
 */
function deletePhase3TechCompanyRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var lastRow = sheet.getLastRow();
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  var target = ['MR-060', 'MR-061', 'MR-062', 'MR-063', 'MR-064'];
  var rowsToDelete = [];
  var notFound = [];
  target.forEach(function(id) {
    var rowNum = -1;
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === id) { rowNum = i + 2; break; }
    }
    if (rowNum === -1) notFound.push(id); else rowsToDelete.push(rowNum);
  });

  rowsToDelete.sort(function(a, b) { return b - a; });
  rowsToDelete.forEach(function(r) { sheet.deleteRow(r); });

  var msg = 'Deleted ' + rowsToDelete.length + ' rows.' +
    (notFound.length ? ' Not found: ' + notFound.join(', ') : '');
  Logger.log(msg);
  return msg;
}

/**
 * MR-086 through MR-092 (the 7 real Nelnet student loans) all shared the
 * exact same Account Number "E985506201" -- which actually belongs to
 * Launch Servicing (MR-034/MR-115), not Nelnet. Found 2026-08-02 during a
 * full re-scan after the user flagged a stray clipboard paste elsewhere in
 * the sheet. Creditor Registry (T-020) has the real number for Loan 1;
 * Loans 2-7 don't have a confirmed real number anywhere, so this clears
 * the wrong value rather than leave it pointing at the wrong creditor.
 */
function fixNelnetAccountNumbers() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return 'Master Register tab not found';
  var lastRow = sheet.getLastRow();
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  var fixes = {
    'MR-086': '90000075961-L1', // confirmed via Creditor Registry T-020
    'MR-087': '', 'MR-088': '', 'MR-089': '', 'MR-090': '', 'MR-091': '', 'MR-092': ''
  };
  var results = [];
  for (var rid in fixes) {
    var rowNum = -1;
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === rid) { rowNum = i + 2; break; }
    }
    if (rowNum === -1) { results.push(rid + ' not found'); continue; }
    sheet.getRange(rowNum, 5).setValue(fixes[rid]); // col E, Account Number
    SpreadsheetApp.flush();
    results.push(rid + ' account number ' + (fixes[rid] ? 'set to ' + fixes[rid] : 'cleared') + ' (row ' + rowNum + ')');
  }
  var msg = results.join(' | ');
  Logger.log(msg);
  return msg;
}
