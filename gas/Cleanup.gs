/**
 * Cleanup.gs — post-restructure tidy-up.
 *
 *  1. Dedupe Business Obligations: the restructure appended "SDHC Property
 *     Rentals" and a second "Cell Provider" that duplicate the canonical
 *     "Landlord" and "Cell Provider" rows. Delete the moved dupes (they carry
 *     the "moved from Master Register MR-###" note; the canonical rows hold the
 *     live monthly amounts + rate history).
 *  2. Hide every backup tab (name contains "_Pre") so the tab bar is clean.
 *     Hiding preserves the sheets — nothing is deleted, they remain reachable
 *     via View > Hidden sheets.
 *
 * Wired to doPost case 'cleanupWorkbook'. Idempotent.
 */

function cleanupWorkbook_(ss) {
  var dedupe = { deleted: 0, rows: [] };
  var bo = ss.getSheetByName('Business Obligations');
  if (bo) {
    var lastRow = bo.getLastRow();
    var vals = bo.getRange(1, 1, lastRow, 11).getValues();
    var DUPLICATE_VENDORS = ['Cell Provider', 'SDHC Property Rentals',
      'Internet Provider (Spectrum)', 'Gas Company (Piedmont)', 'Geico', 'Life Insurance Co'];
    var deleteRows = [];
    for (var i = 0; i < vals.length; i++) {
      var vendor = String(vals[i][0] || '').trim();
      var notes = String(vals[i][10] || '');
      if (/moved from Master Register/.test(notes) && DUPLICATE_VENDORS.indexOf(vendor) >= 0) {
        deleteRows.push(i + 1);
      }
    }
    deleteRows.sort(function (a, b) { return b - a; });
    deleteRows.forEach(function (r) { bo.deleteRow(r); });
    dedupe = { deleted: deleteRows.length, reason: 'Cell Provider + SDHC Property Rentals dupes' };
  }

  var hidden = [];
  var sheets = ss.getSheets();
  for (var s = 0; s < sheets.length; s++) {
    var name = sheets[s].getName();
    if (/_Pre/i.test(name) && !sheets[s].isSheetHidden()) {
      sheets[s].hideSheet();
      hidden.push(name);
    }
  }

  return {
    status: 'ok', action: 'cleanupWorkbook',
    dedupe: dedupe,
    hiddenTabs: hidden,
    hiddenCount: hidden.length
  };
}

/**
 * Merge the specific vendor names (from the Master Register entities) onto the
 * canonical Business Obligations bill rows that still carry generic names.
 */
function mergeVendorNames_(ss) {
  var bo = ss.getSheetByName('Business Obligations');
  if (!bo) return { status: 'error', message: 'Business Obligations not found' };
  var RENAMES = {
    'Landlord': 'SDHC Property Rentals',
    'Electric Company': 'Duke Energy Progress',
    'Cell Provider': 'Verizon',
    'Internet Provider': 'Optimum',
    'Internet Provider (Spectrum)': 'Optimum',
    'Gas Company': 'Piedmont Natural Gas',
    'Gas Company (Piedmont)': 'Piedmont Natural Gas',
    'Life Ins Co': 'Colonial Life',
    'Life Insurance Co': 'Colonial Life',
    'Geico': 'Progressive',
    'GEICO': 'Progressive',
    'One Main': 'OneMain Financial',
    'Merrick': 'Merrick Bank',
    'Verde': 'Verde Card',
    'CreditOne': 'Credit One'
  };
  var lastRow = bo.getLastRow();
  var vals = bo.getRange(1, 1, lastRow, 1).getValues();
  var renamed = [];
  for (var i = 0; i < vals.length; i++) {
    var v = String(vals[i][0] || '').trim();
    if (RENAMES[v]) {
      bo.getRange(i + 1, 1).setValue(RENAMES[v]);
      renamed.push(v + ' -> ' + RENAMES[v]);
    }
  }
  return { status: 'ok', action: 'mergeVendorNames', renamed: renamed, count: renamed.length };
}
/**
 * Retire stale household bills that are no longer active.
 *   - IRS payment plan ended April 2025 (was $135/mo Jan-Mar only).
 *   - Therapist is no longer a current recurring bill.
 * Marks them Closed (col H) in Business Obligations and Master Register.
 * Idempotent. Wired to doPost case 'retireStaleBills'.
 */
function retireStaleBills_(ss) {
  const STALE = ['IRS', 'Therapist'];
  const results = { businessObligations: [], masterRegister: [] };

  const bo = ss.getSheetByName('Business Obligations');
  if (bo) {
    const lastRow = bo.getLastRow();
    const colA = bo.getRange(1, 1, lastRow, 1).getValues();
    for (let r = 0; r < colA.length; r++) {
      const v = String(colA[r][0] || '').trim();
      const hit = STALE.some(function (s) { return v.toLowerCase() === s.toLowerCase(); });
      if (hit) {
        bo.getRange(r + 1, 8).setValue('Closed');  // col H = Status
        results.businessObligations.push(v);
      }
    }
  }

  const mr = ss.getSheetByName('Master Register');
  if (mr) {
    const lastRow = mr.getLastRow();
    const colC = mr.getRange(1, 3, lastRow, 1).getValues();
    for (let r = 0; r < colC.length; r++) {
      const v = String(colC[r][0] || '').trim();
      const hit = STALE.some(function (s) { return v.toLowerCase() === s.toLowerCase(); });
      if (hit) {
        mr.getRange(r + 1, 8).setValue('Closed');  // col H = Status
        results.masterRegister.push(v);
      }
    }
  }

  return {
    status: 'ok', action: 'retireStaleBills',
    businessObligations: results.businessObligations,
    masterRegister: results.masterRegister
  };
}
/** Menu wrapper (no-arg) for the TMAR Tools → Setup & Administration menu. */
function retireStaleBills() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = retireStaleBills_(ss);
  SpreadsheetApp.getUi().alert(
    'Retired stale bills:\n' +
    'Business Obligations: ' + result.businessObligations.join(', ') + '\n' +
    'Master Register: ' + result.masterRegister.join(', ')
  );
  return result;
}

/**
 * One-off cleanup: importToAcctLedger_ wrote the Kia into the "Ledgers" tab,
 * which is a sub-ledger BOOK (Ledger ID | Name | Type | Period ...), not an
 * account ledger. Delete the misplaced row (col A == 'Capital One Auto Finance').
 * Headless-safe (uses getTMARSpreadsheet_, returns a plain object).
 */
function removeMisplacedKiaLedgerRow_() {
  const ss = getTMARSpreadsheet_();
  const sheet = ss.getSheetByName('Ledgers');
  if (!sheet) return { status: 'ok', removed: 0, note: 'Ledgers tab not found' };
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const colA = sheet.getRange(1, 1, lastRow, 1).getValues();
  const rowsToDelete = [];
  for (let i = 0; i < colA.length; i++) {
    const v = String(colA[i][0] || '').trim().toLowerCase();
    if (v === 'capital one auto finance') rowsToDelete.push(i + 1);
  }
  for (let j = rowsToDelete.length - 1; j >= 0; j--) {
    sheet.deleteRow(rowsToDelete[j]);
  }
  return { status: 'ok', removed: rowsToDelete.length };
}
