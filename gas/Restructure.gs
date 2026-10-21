/**
 * Restructure.gs — split the Master Register into its functional registers.
 *
 * The Master Register had become a flat grab-bag. This routes each row by its
 * Category to the correct home, leaving the Master Register as a pure
 * creditor / 1099-chain register:
 *
 *   Category routing (col F):
 *     Rental Housing / Utility* / Insurance* / Healthcare  -> Business Obligations
 *     Employment W-2                                        -> "W-2 & Income Detail" (new)
 *     Banking* / Investment* / Payment Platform / Trust     -> "Asset & Investment Accounts" (new)
 *     Government*                                           -> KEEP (taxpayer reference)
 *     everything else (loans, cards, collections)           -> KEEP (creditors)
 *
 * Idempotent-ish (backed up), atomic (single function), bounded. Wired to
 * doPost case 'restructureMasterRegister'.
 */

function restructureMasterRegister_(ss) {
  var mr = ss.getSheetByName('Master Register');
  if (!mr) return { status: 'error', message: 'Master Register not found' };

  // 1. Full backup (values + formatting)
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  var backup = ss.insertSheet('MasterRegister_PreRestructure_' + stamp);
  var mrLastRow = mr.getLastRow();
  var mrLastCol = mr.getLastColumn();
  mr.getRange(1, 1, mrLastRow, mrLastCol).copyTo(backup.getRange(1, 1), { contentsOnly: false });
  backup.hideSheet();

  // 2. Read data rows (title row 1, header row 2, data row 3+; 19 cols)
  var data = mr.getRange(3, 1, mrLastRow - 2, 19).getValues();

  var expenses = [], income = [], assets = [], government = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var id = String(row[0] || '').trim();
    if (!id) continue;
    var cat = String(row[5] || '').trim();
    var name = String(row[2] || '').trim();
    var ein = String(row[3] || '').trim();
    var acct = String(row[4] || '').trim();
    var status = String(row[7] || '').trim();
    var user = String(row[9] || '').trim();
    var rec = { id: id, name: name, cat: cat, ein: ein, acct: acct, status: status, user: user };

    if (/Rental Housing|Utility|Insurance|Healthcare/.test(cat)) expenses.push(rec);
    else if (/Employment W-2/.test(cat)) income.push(rec);
    else if (/Banking|Investment|Payment Platform|Trust Entity/.test(cat)) assets.push(rec);
    else if (/Government/.test(cat)) government.push(rec);
    // else: creditor -> keep
  }

  // 3. Route expenses -> Business Obligations
  var expCount = 0, expErrors = [];
  if (expenses.length) {
    try { expCount = appendExpenses_(ss.getSheetByName('Business Obligations'), expenses); }
    catch (e) { expErrors.push(String(e)); }
  }

  // 4. Route income -> W-2 & Income Detail (new)
  var incCount = 0, incErrors = [];
  if (income.length) {
    try { incCount = writeIncome_(ss, income); }
    catch (e) { incErrors.push(String(e)); }
  }

  // 5. Route assets -> Asset & Investment Accounts (new)
  var astCount = 0, astErrors = [];
  if (assets.length) {
    try { astCount = writeAssets_(ss, assets); }
    catch (e) { astErrors.push(String(e)); }
  }

  // 6. Delete moved rows from Master Register (bottom-up, inline)
  var moved = expenses.concat(income).concat(assets);
  var moveIds = {};
  moved.forEach(function (x) { moveIds[x.id] = true; });
  var deleteRows = [];
  for (var d = 0; d < data.length; d++) {
    var did = String(data[d][0] || '').trim();
    if (moveIds[did]) deleteRows.push(d + 3);
  }
  deleteRows.sort(function (a, b) { return b - a; });
  deleteRows.forEach(function (sheetRow) { mr.deleteRow(sheetRow); });

  return {
    status: 'ok', action: 'restructureMasterRegister',
    backup: backup.getName(),
    moved: {
      expenses: { count: expenses.length, target: 'Business Obligations', written: expCount },
      income: { count: income.length, target: 'W-2 & Income Detail', written: incCount },
      assets: { count: assets.length, target: 'Asset & Investment Accounts', written: astCount },
      governmentKept: government.length
    },
    deletedFromMR: deleteRows.length,
    errors: { expenses: expErrors, income: incErrors, assets: astErrors }
  };
}

// ---- expense -> Business Obligations (11-col, insert above Monthly Pivot) ----
function appendExpenses_(bo, rows) {
  if (!bo) throw new Error('Business Obligations sheet missing');
  var lastRow = bo.getLastRow();
  var colA = bo.getRange(1, 1, lastRow, 1).getValues();
  var pivotRow = lastRow + 1;
  for (var r = 0; r < colA.length; r++) {
    if (/Monthly Pivot/i.test(String(colA[r][0] || ''))) { pivotRow = r + 1; break; }
  }

  var mapped = rows.map(function (x) { return mapExpense_(x); });
  for (var k = 0; k < mapped.length; k++) bo.insertRowBefore(pivotRow + k);
  for (var m = 0; m < mapped.length; m++) {
    bo.getRange(pivotRow + m, 1, 1, 11).setValues([mapped[m]]);
  }
  return mapped.length;
}

function mapExpense_(x) {
  var cat = '', sub = '';
  var c = x.cat;
  if (/Rental/.test(c)) { cat = 'Rent / Lease'; sub = 'Rent'; }
  else if (/Utility Cell/.test(c)) { cat = 'Utilities'; sub = 'Cell Phone'; }
  else if (/Utility Internet/.test(c)) { cat = 'Utilities'; sub = 'Internet'; }
  else if (/Utility Gas/.test(c)) { cat = 'Utilities'; sub = 'Gas'; }
  else if (/Insurance/.test(c) && /Auto/.test(c)) { cat = 'Insurance'; sub = 'Auto'; }
  else if (/Insurance/.test(c) && /Life/.test(c)) { cat = 'Insurance'; sub = 'Life'; }
  else if (/Healthcare/.test(c)) { cat = 'Healthcare'; sub = 'Mental Health'; }
  else { cat = 'Expense'; sub = c; }
  return [x.name, cat, sub, '', '', '', 'Joint', (x.status || 'Active'), '', '', 'moved from Master Register ' + x.id];
}

// ---- income -> W-2 & Income Detail (new) ----
function writeIncome_(ss, rows) {
  var sh = ss.getSheetByName('W-2 & Income Detail');
  if (!sh) sh = ss.insertSheet('W-2 & Income Detail');
  sh.getRange(1, 1).setValue('W-2 & Income Detail').setFontWeight('bold').setFontFamily('Arial');
  var hdr = ['Employer', 'EIN', 'Primary User', 'Status', 'Notes'];
  sh.getRange(2, 1, 1, hdr.length).setValues([hdr])
    .setBackground('#1F3864').setFontColor('#FFFFFF').setFontWeight('bold').setFontFamily('Arial');
  var out = rows.map(function (x) { return [x.name, x.ein, x.user, x.status, 'moved from Master Register ' + x.id]; });
  sh.getRange(3, 1, out.length, hdr.length).setValues(out).setFontFamily('Arial');
  sh.setFrozenRows(2);
  sh.setHiddenGridlines(true);
  sh.setTabColor('#375623');
  return out.length;
}

// ---- assets -> Asset & Investment Accounts (new) ----
function writeAssets_(ss, rows) {
  var sh = ss.getSheetByName('Asset & Investment Accounts');
  if (!sh) sh = ss.insertSheet('Asset & Investment Accounts');
  sh.getRange(1, 1).setValue('Asset & Investment Accounts').setFontWeight('bold').setFontFamily('Arial');
  var hdr = ['Entity', 'Account Type', 'EIN', 'Account #', 'Primary User', 'Status', 'Notes'];
  sh.getRange(2, 1, 1, hdr.length).setValues([hdr])
    .setBackground('#1F3864').setFontColor('#FFFFFF').setFontWeight('bold').setFontFamily('Arial');
  var out = rows.map(function (x) { return [x.name, x.cat, x.ein, x.acct, x.user, x.status, 'moved from Master Register ' + x.id]; });
  sh.getRange(3, 1, out.length, hdr.length).setValues(out).setFontFamily('Arial');
  sh.setFrozenRows(2);
  sh.setHiddenGridlines(true);
  sh.setTabColor('#7030A0');
  return out.length;
}
