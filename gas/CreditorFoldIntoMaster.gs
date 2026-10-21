/**
 * Fold "FWM — Creditor Detail" into "Master Register" (column-level merge).
 *
 * 1. Snapshot Master Register -> hidden backup "Master Register_PreFold_<ts>".
 * 2. Rename + hide the source -> "FWM — Creditor Detail_PreFold_<ts>" (recoverable).
 * 3. Clear + rewrite Master Register with the pre-computed 19-column grid
 *    (15 original columns + Tab # | Obligor | SOURCE REF | NOTES).
 *
 * The grid is computed client-side (Python) because the EIN/name join is fuzzy;
 * this endpoint is a mechanical apply (backup + hide + write) with no matching logic.
 *
 * Idempotent: skips the source rename if "FWM — Creditor Detail" is already gone.
 */
function foldCreditorDetailIntoMaster_(ss, payload) {
  var ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');

  var mr = ss.getSheetByName('Master Register');
  if (!mr) return { error: 'Master Register not found' };

  // 1. Backup Master Register BEFORE overwrite (rollback point)
  var mrBackup = mr.copyTo(ss);
  mrBackup.setName('Master Register_PreFold_' + ts);
  mrBackup.hideSheet();

  // 2. Rename + hide source (idempotent)
  var cd = ss.getSheetByName('FWM — Creditor Detail');
  var hiddenSource = null;
  if (cd) {
    cd.setName('FWM — Creditor Detail_PreFold_' + ts);
    cd.hideSheet();
    hiddenSource = cd.getName();
  }

  // 3. Validate + normalize the grid
  var grid = payload.grid;
  if (!Array.isArray(grid) || grid.length === 0 || !Array.isArray(grid[0])) {
    return { error: 'grid must be a non-empty 2D array' };
  }
  var cols = grid[0].length;
  for (var i = 0; i < grid.length; i++) {
    if (!Array.isArray(grid[i])) grid[i] = [];
    while (grid[i].length < cols) grid[i].push('');
    if (grid[i].length > cols) grid[i] = grid[i].slice(0, cols);
  }

  // 4. Rewrite Master Register.
  //    Clear data validation FIRST — setValues ENFORCES it and aborts the whole
  //    write on the first violating cell (e.g. Status "Current" not in the dropdown).
  mr.getRange(1, 1, mr.getMaxRows(), mr.getMaxColumns()).clearDataValidations();
  mr.clear();
  mr.getRange(1, 1, grid.length, cols).setValues(grid);
  var lastRow = mr.getLastRow();
  var lastCol = mr.getLastColumn();

  return {
    backupSheet: mrBackup.getName(),
    hiddenSource: hiddenSource || '(already folded)',
    rows: grid.length,
    cols: cols,
    actualLastRow: lastRow,
    actualLastCol: lastCol,
    gridLen: grid.length,
    grid0len: grid[0] ? grid[0].length : -1,
    midRowEntry: grid[50] ? String(grid[50][0]) : 'N/A',
    lastRowEntry: grid[grid.length - 1] ? String(grid[grid.length - 1][0]) : 'N/A'
  };
}
