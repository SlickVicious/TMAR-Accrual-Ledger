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
