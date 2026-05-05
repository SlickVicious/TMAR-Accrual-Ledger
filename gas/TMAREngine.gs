/**
 * TMAR Engine Functions
 * Adapted from standalone TMAR Engine Script (1QLy6NFM1X8YWq3ZmoIjc7_eUdJ0I1n8S4yAxgEeeiWj_tu2niTVEACNv)
 * All Flask API calls replaced with direct Sheets data access.
 */


// ─── DNI CALCULATION ────────────────────────────────────────────────────────

function calculateDNI() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt('Calculate DNI', 'Enter tax year (e.g. 2026):', ui.ButtonSet.OK_CANCEL);
  if (result.getSelectedButton() !== ui.Button.OK) return;

  const taxYear = parseInt(result.getResponseText()) || new Date().getFullYear();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const txSheet = ss.getSheetByName('Transaction Ledger');

  if (!txSheet || txSheet.getLastRow() < 2) {
    ui.alert('Transaction Ledger not found or empty.');
    return;
  }

  // Detect columns from header row
  const headers = txSheet.getRange(1, 1, 1, txSheet.getLastColumn()).getValues()[0]
    .map(h => String(h).toLowerCase().trim());
  const col = name => headers.findIndex(h => h.includes(name));

  const dateIdx    = Math.max(col('date'), 0);
  const categoryIdx = Math.max(col('category'), 2);
  const amountIdx  = Math.max(col('amount'), 4);
  const typeIdx    = col('type');

  const data = txSheet.getRange(2, 1, txSheet.getLastRow() - 1, txSheet.getLastColumn()).getValues();

  let income = 0, expenses = 0, capitalGains = 0;

  for (const row of data) {
    if (!row[dateIdx]) continue;
    if (new Date(row[dateIdx]).getFullYear() !== taxYear) continue;

    const category = String(row[categoryIdx] || '').toLowerCase();
    const type     = typeIdx >= 0 ? String(row[typeIdx] || '').toLowerCase() : '';
    const amount   = parseFloat(row[amountIdx]) || 0;

    if (category.includes('capital gain')) {
      capitalGains += amount;
    } else if (
      type === 'income' ||
      category.includes('income') ||
      category.includes('revenue') ||
      category.includes('interest') ||
      category.includes('salary') ||
      category.includes('deposit')
    ) {
      income += amount;
    } else if (type === 'expense' || type === '' || category.includes('expense')) {
      expenses += amount;
    }
  }

  const dni = income - expenses - capitalGains;

  ui.alert(
    'DNI — Tax Year ' + taxYear,
    'Ordinary Income:  $' + income.toFixed(2) + '\n' +
    'Expenses:         $' + expenses.toFixed(2) + '\n' +
    'Capital Gains:    $' + capitalGains.toFixed(2) + '\n' +
    '──────────────────────────\n' +
    'DNI:              $' + dni.toFixed(2),
    ui.ButtonSet.OK
  );
}


// ─── TRIAL BALANCE ───────────────────────────────────────────────────────────

function viewTrialBalance() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const txSheet = ss.getSheetByName('Transaction Ledger');

  if (!txSheet || txSheet.getLastRow() < 2) {
    ui.alert('Transaction Ledger not found or empty.');
    return;
  }

  const headers = txSheet.getRange(1, 1, 1, txSheet.getLastColumn()).getValues()[0]
    .map(h => String(h).toLowerCase().trim());
  const col = name => headers.findIndex(h => h.includes(name));

  const categoryIdx = Math.max(col('category'), 2);
  const amountIdx   = Math.max(col('amount'), 4);
  const typeIdx     = col('type');

  const data = txSheet.getRange(2, 1, txSheet.getLastRow() - 1, txSheet.getLastColumn()).getValues();

  const accounts = {};
  for (const row of data) {
    if (!row[0]) continue;
    const cat    = String(row[categoryIdx] || 'Uncategorized');
    const amount = parseFloat(row[amountIdx]) || 0;
    const type   = typeIdx >= 0 ? String(row[typeIdx] || '') : '';

    if (!accounts[cat]) accounts[cat] = { balance: 0, type: type };
    accounts[cat].balance += amount;
  }

  let sheet = ss.getSheetByName('Trial Balance');
  if (!sheet) sheet = ss.insertSheet('Trial Balance');
  sheet.clear();

  sheet.getRange('A1').setValue('TRIAL BALANCE')
    .setFontSize(14).setFontWeight('bold');
  sheet.getRange('A2').setValue('As of ' + new Date().toLocaleDateString());

  sheet.getRange('A4:C4').setValues([['Account / Category', 'Type', 'Balance']])
    .setFontWeight('bold').setBackground('#1B2A4A').setFontColor('#FFFFFF');

  let row = 5, totalDebits = 0, totalCredits = 0;
  for (const [cat, d] of Object.entries(accounts)) {
    sheet.getRange('A' + row + ':C' + row).setValues([[cat, d.type, d.balance]]);
    sheet.getRange('C' + row).setNumberFormat('$#,##0.00');
    if (d.balance >= 0) totalDebits += d.balance;
    else totalCredits += Math.abs(d.balance);
    row++;
  }

  row++;
  sheet.getRange('A' + row).setValue('TOTAL DEBITS').setFontWeight('bold');
  sheet.getRange('C' + row).setValue(totalDebits).setNumberFormat('$#,##0.00').setFontWeight('bold');
  row++;
  sheet.getRange('A' + row).setValue('TOTAL CREDITS').setFontWeight('bold');
  sheet.getRange('C' + row).setValue(totalCredits).setNumberFormat('$#,##0.00').setFontWeight('bold');

  sheet.autoResizeColumns(1, 3);
  sheet.setTabColor('#2E7D32');
  ss.setActiveSheet(sheet);
  ss.toast('Trial balance generated', 'TMAR Engine', 3);
}


// ─── COMPLIANCE / FILING ─────────────────────────────────────────────────────

function refreshComplianceSheet() {
  _loadComplianceSheet_('ALL COMPLIANCE TASKS', null);
}

function viewOverdueTasks() {
  _loadComplianceSheet_('OVERDUE TASKS', 'overdue');
}

function viewUpcomingTasks() {
  _loadComplianceSheet_('UPCOMING TASKS — NEXT 30 DAYS', 'upcoming');
}

function _loadComplianceSheet_(title, filter) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const sourceSheet =
    ss.getSheetByName('Freeway Method Filing Checklist') ||
    ss.getSheetByName('1099 Filing Chain');

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    ui.alert('Filing Checklist not found. Tab needed: "Freeway Method Filing Checklist" or "1099 Filing Chain".');
    return;
  }

  const ncols   = sourceSheet.getLastColumn();
  const headers = sourceSheet.getRange(1, 1, 1, ncols).getValues()[0];
  const data    = sourceSheet.getRange(2, 1, sourceSheet.getLastRow() - 1, ncols).getValues()
    .filter(row => row.some(c => c !== ''));

  const today       = new Date();
  const in30        = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const dateColIdx  = headers.findIndex(h => /due|date/i.test(String(h)));
  const statColIdx  = headers.findIndex(h => /status/i.test(String(h)));

  let rows = data;
  if (filter === 'overdue') {
    rows = data.filter(row => {
      const stat = statColIdx >= 0 ? String(row[statColIdx]).toLowerCase() : '';
      if (/complete|filed|sent|done/i.test(stat)) return false;
      const d = dateColIdx >= 0 ? new Date(row[dateColIdx]) : null;
      return (d && !isNaN(d) && d < today) || /pending|overdue/i.test(stat);
    });
  } else if (filter === 'upcoming') {
    rows = data.filter(row => {
      const stat = statColIdx >= 0 ? String(row[statColIdx]).toLowerCase() : '';
      if (/complete|filed|sent|done/i.test(stat)) return false;
      const d = dateColIdx >= 0 ? new Date(row[dateColIdx]) : null;
      return d && !isNaN(d) && d >= today && d <= in30;
    });
  }

  const headerBg = filter === 'overdue' ? '#D32F2F' : filter === 'upcoming' ? '#FF9800' : '#4285F4';
  const rowBg    = filter === 'overdue' ? '#FFCDD2' : filter === 'upcoming' ? '#FFF3E0' : null;

  let sheet = ss.getSheetByName('Compliance');
  if (!sheet) sheet = ss.insertSheet('Compliance');
  sheet.clear();

  sheet.getRange('A1').setValue(title).setFontSize(14).setFontWeight('bold');
  sheet.getRange('A2').setValue('Source: ' + sourceSheet.getName() + ' | ' + new Date().toLocaleDateString());
  sheet.getRange(4, 1, 1, ncols).setValues([headers])
    .setFontWeight('bold').setBackground(headerBg).setFontColor('#FFFFFF');

  if (rows.length > 0) {
    const dataRange = sheet.getRange(5, 1, rows.length, ncols);
    dataRange.setValues(rows);
    if (rowBg) dataRange.setBackground(rowBg);
  }

  sheet.autoResizeColumns(1, Math.min(ncols, 12));
  sheet.setTabColor('#E65100');
  ss.setActiveSheet(sheet);
  ss.toast(rows.length + ' records', title, 4);
}


// ─── DOCUMENT LIST ───────────────────────────────────────────────────────────

function refreshDocumentList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const sourceSheet =
    ss.getSheetByName('Document Inventory') ||
    ss.getSheetByName('Document Registry');

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    ui.alert('Document Inventory sheet not found.');
    return;
  }

  const ncols   = sourceSheet.getLastColumn();
  const headers = sourceSheet.getRange(1, 1, 1, ncols).getValues()[0];
  const data    = sourceSheet.getRange(2, 1, sourceSheet.getLastRow() - 1, ncols).getValues()
    .filter(row => row.some(c => c !== ''));

  let sheet = ss.getSheetByName('Documents');
  if (!sheet) sheet = ss.insertSheet('Documents');
  sheet.clear();

  sheet.getRange('A1').setValue('DOCUMENT LIST').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A2').setValue(
    'Source: ' + sourceSheet.getName() + ' | ' + data.length + ' documents | ' + new Date().toLocaleDateString()
  );

  sheet.getRange(4, 1, 1, ncols).setValues([headers])
    .setFontWeight('bold').setBackground('#1B2A4A').setFontColor('#FFFFFF');

  if (data.length > 0) {
    sheet.getRange(5, 1, data.length, ncols).setValues(data);
  }

  sheet.autoResizeColumns(1, Math.min(ncols, 10));
  sheet.setTabColor('#2E7D32');
  ss.setActiveSheet(sheet);
  ss.toast('Found ' + data.length + ' documents', 'TMAR Engine', 3);
}
