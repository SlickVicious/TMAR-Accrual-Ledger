/**
 * TMAR_AestheticsAndAudit.gs
 * ═══════════════════════════════════════════════════════════════════════════
 * PURPOSE  : Complements apply_master_register_formatting.gs by adding:
 *              1. Row color coding (party / category) across all sheets
 *              2. Color legend block in lower-left of each sheet
 *              3. Fine-print attribution notes beneath each legend
 *              4. Full workbook health audit with actionable report
 *
 * DOES NOT : Touch dropdowns, conditional format rules, tab colors, or
 *            filter views — those live in apply_master_register_formatting.gs
 *
 * USAGE    : TMAR Tools menu → "Apply Aesthetics" or "Run Health Audit"
 *            Can also call runAll() to do both in sequence.
 *
 * AUTHOR   : TMAR GAS project
 * VERSION  : 1.0  (2026-03)
 * ═══════════════════════════════════════════════════════════════════════════
 */


// ── PALETTE ──────────────────────────────────────────────────────────────────
// Mirrors Recipient_Data_Import_EXPANDED.xlsx exactly.
const P = {
  // Header chrome
  headerBg   : '#1F4E79',
  headerFg   : '#FFFFFF',
  sectionBg  : '#263238',
  sectionFg  : '#FFFFFF',

  // Principal rows
  clint      : '#D6E4FF',   // blue
  syrina     : '#FFE4F0',   // pink
  joint      : '#E8F5E9',   // soft green

  // Credit status
  adverse    : '#FFF2CC',   // yellow
  current    : '#E2EFDA',   // green

  // Account category bands
  employment : '#EDE7F6',
  banking    : '#E3F2FD',
  investment : '#E0F7FA',
  payment    : '#E0F7FA',
  government : '#FBE9E7',
  housing    : '#F3E5F5',
  utility    : '#F1F8E9',
  insurance  : '#FFF8E1',
  subscriptions: '#F5F5F5',
  debtSyrina : '#FADADD',
  debtClint  : '#FCE4EC',
  historical : '#ECEFF1',

  // Audit / alert
  flagRed    : '#FFCDD2',
  flagYellow : '#FFF9C4',
  flagGreen  : '#C8E6C9',
  flagGray   : '#ECEFF1',

  // Text
  noteFg     : '#546E7A',   // muted blue-gray for fine print
  warnFg     : '#B71C1C',   // red for flag notes
};


// ── LEGEND DEFINITION ────────────────────────────────────────────────────────
// Shown at the bottom-left of every sheet that receives a legend.
const LEGEND_ROWS = [
  { hex: P.clint,        label: 'Clinton — Principal / Primary Account Holder' },
  { hex: P.syrina,       label: 'Syrina — Principal / Primary Account Holder' },
  { hex: P.joint,        label: 'Joint — Both Principals' },
  { hex: P.adverse,      label: 'Adverse Credit — Charge-Off / Collection' },
  { hex: P.current,      label: 'Current Credit — Good Standing' },
  { hex: P.employment,   label: 'Employment / W-2 Income' },
  { hex: P.banking,      label: 'Banking' },
  { hex: P.investment,   label: 'Investment / Brokerage / Digital Payment' },
  { hex: P.government,   label: 'Government / Tax' },
  { hex: P.housing,      label: 'Housing / Rental' },
  { hex: P.utility,      label: 'Utilities' },
  { hex: P.insurance,    label: 'Insurance' },
  { hex: P.subscriptions,label: 'Subscriptions / Technology' },
  { hex: P.debtSyrina,   label: 'Closed Debt — Syrina' },
  { hex: P.debtClint,    label: 'Closed Debt — Clinton' },
  { hex: P.historical,   label: 'Historical / Closed Accounts' },
];

const FINE_PRINT = [
  '* EINs sourced from public SEC / FDIC / corporate records. Verify before formal submissions.',
  '* Clinton\'s legal last name and SSN / TIN not recorded in source data — flag cells require manual entry.',
  '* TransUnion credit data as of 01/15/2026. Balances, removal dates, and status subject to change.',
  '* This register is a living trust document. Classified CONFIDENTIAL — not for public distribution.',
  'Source: TMAR Master Register + TransUnion Credit Report (Syrina S. Wimberly, 01/15/2026) | Generated: ' + new Date().toISOString().slice(0, 10),
];


// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — MENU
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Appends "TMAR Aesthetics & Audit" submenu to the existing TMAR Tools menu.
 * Called automatically by onOpen() in Code.gs (or standalone if that hook
 * doesn't exist yet).
 */
function onOpen_AestheticsAudit() {
  SpreadsheetApp.getUi()
    .createMenu('TMAR Tools')
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('🎨 Aesthetics & Audit')
        .addItem('Apply All Aesthetics', 'applyAesthetics')
        .addItem('Color Transaction Ledger Rows', 'colorTransactionLedger')
        .addItem('Color Master Register Rows', 'colorMasterRegisterRows')
        .addSeparator()
        .addItem('Insert / Refresh Legends (All Sheets)', 'insertAllLegends')
        .addSeparator()
        .addItem('Run Health Audit', 'runHealthAudit')
        .addItem('Run Everything', 'runAll')
    )
    .addToUi();
}


// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — MAIN ORCHESTRATORS
// ══════════════════════════════════════════════════════════════════════════════

function runAll() {
  applyAesthetics();
  runHealthAudit();
}

function applyAesthetics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast('Applying row colors…', 'TMAR Aesthetics', 60);

  colorTransactionLedger(ss);
  colorMasterRegisterRows(ss);

  ss.toast('Inserting legends…', 'TMAR Aesthetics', 60);
  insertAllLegends(ss);

  ss.toast('✅ Aesthetics applied.', 'Done', 5);
  SpreadsheetApp.getUi().alert('Aesthetics applied successfully.');
}


// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — ROW COLOR CODING
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Colors every data row in Transaction Ledger by Party (col B).
 *   Clint  → P.clint (blue)
 *   Syrina → P.syrina (pink)
 *   Joint  → P.joint (green)
 */
function colorTransactionLedger(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Transaction Ledger');
  if (!sheet) { Logger.log('Transaction Ledger not found'); return; }

  const lastRow  = sheet.getLastRow();
  const lastCol  = sheet.getLastColumn();
  if (lastRow < 2) return;

  const partyCol = 2; // Column B = "Party"
  const parties  = sheet.getRange(2, partyCol, lastRow - 1, 1).getValues();

  // Build batch: group consecutive rows by party for fewer API calls
  let batches = []; // {start, count, color}
  let curColor = null, curStart = 2, curCount = 0;

  for (let i = 0; i < parties.length; i++) {
    const party = String(parties[i][0]).trim().toLowerCase();
    const color  = party === 'clint'  ? P.clint
                 : party === 'syrina' ? P.syrina
                 : party === 'joint'  ? P.joint
                 : null;

    if (color === curColor) {
      curCount++;
    } else {
      if (curCount > 0 && curColor) batches.push({ start: curStart, count: curCount, color: curColor });
      curColor = color; curStart = i + 2; curCount = 1;
    }
  }
  if (curCount > 0 && curColor) batches.push({ start: curStart, count: curCount, color: curColor });

  // Apply backgrounds
  batches.forEach(b => {
    sheet.getRange(b.start, 1, b.count, lastCol).setBackground(b.color);
  });

  Logger.log('Transaction Ledger: colored ' + batches.length + ' batch(es)');
}


/**
 * Colors Master Register rows by Account Type / Primary User.
 * Maps the TMAR account type taxonomy to palette buckets.
 */
function colorMasterRegisterRows(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Master Register');
  if (!sheet) { Logger.log('Master Register not found'); return; }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return;

  // Col G (7) = Account Type  |  Col K (11) = Status  |  Col T (20) = Primary User
  const data = sheet.getRange(2, 1, lastRow - 1, Math.max(lastCol, 20)).getValues();

  for (let i = 0; i < data.length; i++) {
    const acctType   = String(data[i][6]  || '').toLowerCase();  // col G
    const status     = String(data[i][10] || '').toLowerCase();  // col K
    const primaryUser= String(data[i][19] || '').toLowerCase();  // col T

    let color = null;

    // Category-first mapping
    if (acctType.includes('employment') || acctType.includes('w-2') || acctType.includes('w2'))
      color = P.employment;
    else if (acctType.includes('banking') || acctType.includes('checking') || acctType.includes('savings'))
      color = P.banking;
    else if (acctType.includes('investment') || acctType.includes('brokerage') || acctType.includes('retirement') || acctType.includes('ira') || acctType.includes('401'))
      color = P.investment;
    else if (acctType.includes('paypal') || acctType.includes('digital') || acctType.includes('payment'))
      color = P.payment;
    else if (acctType.includes('government') || acctType.includes('ssa') || acctType.includes('irs') || acctType.includes('federal') || acctType.includes('tax'))
      color = P.government;
    else if (acctType.includes('rental') || acctType.includes('housing') || acctType.includes('rent') || acctType.includes('lease'))
      color = P.housing;
    else if (acctType.includes('utility') || acctType.includes('electric') || acctType.includes('gas') || acctType.includes('internet') || acctType.includes('cell') || acctType.includes('water'))
      color = P.utility;
    else if (acctType.includes('insurance'))
      color = P.insurance;
    else if (acctType.includes('subscription') || acctType.includes('service'))
      color = P.subscriptions;
    else if (acctType.includes('collection') || acctType.includes('charge-off') || acctType.includes('adverse'))
      color = P.adverse;
    else if (acctType.includes('credit card') || acctType.includes('personal loan') || acctType.includes('student loan') || acctType.includes('auto loan') || acctType.includes('car loan') || acctType.includes('unsecured') || acctType.includes('installment')) {
      // Active = current credit / Closed = historical or charged-off
      if (status.includes('closed') || status.includes('paid') || status.includes('transferred')) {
        // Distinguish whose closed debt it is
        color = primaryUser.includes('syrina') ? P.debtSyrina
              : primaryUser.includes('clint')  ? P.debtClint
              : P.historical;
      } else {
        color = P.current;
      }
    }
    // Fall back: principal color if primary user set
    else if (primaryUser.includes('clint'))   color = P.clint;
    else if (primaryUser.includes('syrina'))  color = P.syrina;
    else if (primaryUser.includes('joint'))   color = P.joint;

    if (color) {
      sheet.getRange(i + 2, 1, 1, lastCol).setBackground(color);
    }
  }

  Logger.log('Master Register rows colored');
}


// ══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — LEGEND & FINE-PRINT BLOCKS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Inserts (or refreshes) the color legend + fine-print block at the bottom of
 * every sheet in the workbook. Skips _Validation (hidden) and any sheet that
 * returns getLastRow() === 0.
 *
 * The legend is written 3 rows below the last data row so it never overwrites
 * existing data. If a legend was previously written it is cleared first
 * (detected via the sentinel value "LEGEND — ROW COLOR KEY" in col A).
 */
function insertAllLegends(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  sheets.forEach(sheet => {
    if (sheet.isSheetHidden()) return;
    const name = sheet.getName();
    if (name === '_Validation') return;

    try {
      insertLegend_(sheet);
    } catch (e) {
      Logger.log('Legend error on [' + name + ']: ' + e.message);
    }
  });
}

/**
 * Internal — writes legend to a single sheet.
 */
function insertLegend_(sheet) {
  const totalCols = Math.max(sheet.getLastColumn(), 4);

  // ── Find or clear existing legend ──────────────────────────────────────
  let legendStart = findLegendRow_(sheet);

  if (legendStart) {
    // Clear old legend block (legend + fine print + some buffer)
    const clearRows = LEGEND_ROWS.length + FINE_PRINT.length + 8;
    sheet.getRange(legendStart, 1, clearRows, totalCols).clearContent().clearFormat();
  }

  // ── Place new legend 3 rows below last data row ─────────────────────────
  const dataLastRow = getDataLastRow_(sheet);
  legendStart = dataLastRow + 3;

  let r = legendStart;

  // ── Legend header ────────────────────────────────────────────────────────
  const headerRange = sheet.getRange(r, 1, 1, Math.min(totalCols, 4));
  headerRange.merge()
    .setValue('LEGEND — ROW COLOR KEY')
    .setBackground(P.sectionBg)
    .setFontColor(P.sectionFg)
    .setFontWeight('bold')
    .setFontSize(9)
    .setFontFamily('Arial')
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('left')
    .setRowHeight_(r, 22);
  r++;

  // ── Color swatch + label rows ────────────────────────────────────────────
  LEGEND_ROWS.forEach(item => {
    // Col A: color swatch (blank cell with background)
    sheet.getRange(r, 1)
      .setValue('')
      .setBackground(item.hex);

    // Col B–D: label text
    const labelRange = sheet.getRange(r, 2, 1, Math.min(totalCols - 1, 3));
    if (totalCols > 2) labelRange.merge();
    labelRange
      .setValue(item.label)
      .setBackground(item.hex)
      .setFontSize(9)
      .setFontFamily('Arial')
      .setFontColor('#212121')
      .setVerticalAlignment('middle')
      .setHorizontalAlignment('left');

    setRowHeight_(sheet, r, 18);
    r++;
  });

  // ── Spacer row ───────────────────────────────────────────────────────────
  r++;

  // ── Fine-print block ─────────────────────────────────────────────────────
  FINE_PRINT.forEach((line, idx) => {
    const noteRange = sheet.getRange(r, 1, 1, Math.min(totalCols, 6));
    if (totalCols > 1) {
      try { noteRange.merge(); } catch(e) { /* already merged */ }
    }
    noteRange
      .setValue(line)
      .setFontSize(8)
      .setFontFamily('Arial')
      .setFontStyle('italic')
      .setFontColor(idx === FINE_PRINT.length - 1 ? P.noteFg : (line.startsWith('*') ? P.noteFg : P.noteFg))
      .setBackground(null)
      .setVerticalAlignment('middle')
      .setHorizontalAlignment('left');

    // Flag notes in red
    if (line.startsWith('* Clinton') || line.startsWith('* This register')) {
      noteRange.setFontColor(P.warnFg);
    }

    setRowHeight_(sheet, r, 16);
    r++;
  });

  Logger.log('Legend inserted on [' + sheet.getName() + '] at row ' + legendStart);
}

/**
 * Searches col A for the "LEGEND — ROW COLOR KEY" sentinel.
 * Returns the row number, or null if not found.
 */
function findLegendRow_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 1) return null;
  const colA = sheet.getRange(1, 1, lastRow, 1).getValues();
  for (let i = 0; i < colA.length; i++) {
    if (String(colA[i][0]).trim() === 'LEGEND — ROW COLOR KEY') return i + 1;
  }
  return null;
}

/**
 * Returns the last row that has any data, ignoring legend blocks.
 * Scans backward until a non-sentinel, non-empty row is found.
 */
function getDataLastRow_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1;
  // Walk backward from bottom, stop before legend sentinel
  const colA = sheet.getRange(1, 1, lastRow, 1).getValues();
  for (let i = lastRow - 1; i >= 0; i--) {
    const val = String(colA[i][0]).trim();
    if (val !== '' && val !== 'LEGEND — ROW COLOR KEY' && !val.startsWith('*') && !val.startsWith('Source:')) {
      return i + 1;
    }
  }
  return 1;
}

/** Safe row-height setter (avoids errors on frozen rows) */
function setRowHeight_(sheet, row, height) {
  try { sheet.setRowHeight(row, height); } catch(e) {}
}


// ══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — HEALTH AUDIT
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Comprehensive workbook health audit.
 * Outputs a formatted report to the Execution Log AND writes a summary
 * to the "_HealthAudit" sheet (creating it if needed).
 */
function runHealthAudit() {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets().filter(s => !s.isSheetHidden());
  const issues = [];
  const passes = [];

  ss.toast('Running health audit…', 'TMAR Audit', 120);

  // ── 1. EXPECTED SHEETS ────────────────────────────────────────────────────
  const EXPECTED_SHEETS = [
    'Transaction Ledger', 'W-2 & Income Detail', 'BOA Cash Flow',
    'PNC Cash Flow', 'Household Obligations', 'Subscriptions & Services',
    'Master Register', 'Syrina Credit Summary', '_Validation',
  ];
  EXPECTED_SHEETS.forEach(name => {
    if (!ss.getSheetByName(name)) {
      issues.push({ sev: 'WARN', sheet: name, msg: 'Sheet not found — may be missing or renamed.' });
    } else {
      passes.push('Sheet present: ' + name);
    }
  });

  // ── 2. MASTER REGISTER ───────────────────────────────────────────────────
  const mr = ss.getSheetByName('Master Register');
  if (mr) {
    const mrLastRow = mr.getLastRow();
    const mrLastCol = mr.getLastColumn();

    // Row count
    if (mrLastRow < 2) {
      issues.push({ sev: 'ERROR', sheet: 'Master Register', msg: 'No data rows found.' });
    } else {
      passes.push('Master Register: ' + (mrLastRow - 1) + ' data rows');
    }

    // Duplicate Row IDs
    if (mrLastRow > 2) {
      const ids = mr.getRange(2, 1, mrLastRow - 1, 1).getValues().flat().filter(v => v);
      const seen = {}, dupes = [];
      ids.forEach(id => { seen[id] = (seen[id] || 0) + 1; });
      Object.keys(seen).forEach(id => { if (seen[id] > 1) dupes.push(id); });
      if (dupes.length) {
        issues.push({ sev: 'ERROR', sheet: 'Master Register', msg: 'Duplicate Row IDs: ' + dupes.join(', ') });
      } else {
        passes.push('Master Register: No duplicate Row IDs');
      }
    }

    // Missing EINs on active accounts
    if (mrLastRow > 2) {
      const data = mr.getRange(2, 1, mrLastRow - 1, 11).getValues();
      let missingEIN = 0;
      data.forEach(row => {
        const status = String(row[10] || '').toLowerCase();
        const ein    = String(row[4]  || '').trim();
        if (status === 'active' && !ein) missingEIN++;
      });
      if (missingEIN > 0) {
        issues.push({ sev: 'WARN', sheet: 'Master Register', msg: missingEIN + ' active account(s) missing EIN.' });
      } else {
        passes.push('Master Register: All active accounts have EINs');
      }
    }

    // Column count sanity (expect 35 cols based on schema)
    if (mrLastCol < 30) {
      issues.push({ sev: 'WARN', sheet: 'Master Register', msg: 'Only ' + mrLastCol + ' columns found — expected 35. Schema may be incomplete.' });
    } else {
      passes.push('Master Register: Column count OK (' + mrLastCol + ')');
    }
  }

  // ── 3. TRANSACTION LEDGER ─────────────────────────────────────────────────
  const tl = ss.getSheetByName('Transaction Ledger');
  if (tl) {
    const tlLastRow = tl.getLastRow();
    if (tlLastRow < 2) {
      issues.push({ sev: 'WARN', sheet: 'Transaction Ledger', msg: 'No transaction rows found.' });
    } else {
      passes.push('Transaction Ledger: ' + (tlLastRow - 1) + ' rows');

      // Check for blank Party values
      const parties = tl.getRange(2, 2, tlLastRow - 1, 1).getValues().flat();
      const blankParty = parties.filter(v => !String(v).trim()).length;
      if (blankParty > 0) {
        issues.push({ sev: 'WARN', sheet: 'Transaction Ledger', msg: blankParty + ' row(s) have blank Party column.' });
      } else {
        passes.push('Transaction Ledger: All rows have Party value');
      }

      // Check for blank Amount
      const amounts = tl.getRange(2, 7, tlLastRow - 1, 1).getValues().flat();
      const blankAmt = amounts.filter(v => v === '' || v === null).length;
      if (blankAmt > 0) {
        issues.push({ sev: 'WARN', sheet: 'Transaction Ledger', msg: blankAmt + ' row(s) have blank Amount (col G).' });
      } else {
        passes.push('Transaction Ledger: No blank Amount cells');
      }
    }
  }

  // ── 4. BOA CASH FLOW ─────────────────────────────────────────────────────
  const boa = ss.getSheetByName('BOA Cash Flow');
  if (boa) {
    // Row 15 should be TOTALS row — verify formulas exist
    const totalsRowC = boa.getRange('C15').getFormula();
    const totalsRowD = boa.getRange('D15').getFormula();
    if (!totalsRowC || !totalsRowD) {
      issues.push({ sev: 'WARN', sheet: 'BOA Cash Flow', msg: 'TOTALS row (row 15) appears to be missing SUM formulas in C or D.' });
    } else {
      passes.push('BOA Cash Flow: TOTALS row formulas OK');
    }

    // Check data completeness — at least 6 months should have Beginning Balance
    const beginBals = boa.getRange('B3:B14').getValues().flat().filter(v => v !== '' && v !== 0);
    if (beginBals.length < 3) {
      issues.push({ sev: 'INFO', sheet: 'BOA Cash Flow', msg: 'Only ' + beginBals.length + ' month(s) have Beginning Balance data.' });
    } else {
      passes.push('BOA Cash Flow: ' + beginBals.length + '/12 months populated');
    }
  }

  // ── 5. HOUSEHOLD OBLIGATIONS ─────────────────────────────────────────────
  const ho = ss.getSheetByName('Household Obligations');
  if (ho) {
    const hoLastRow = ho.getLastRow();
    passes.push('Household Obligations: ' + Math.max(0, hoLastRow - 1) + ' rows');

    // Look for rows with no amount
    if (hoLastRow > 1) {
      const amounts = ho.getRange(2, 4, hoLastRow - 1, 1).getValues().flat();
      const blank = amounts.filter(v => v === '' || v === null).length;
      if (blank > 3) {
        issues.push({ sev: 'INFO', sheet: 'Household Obligations', msg: blank + ' obligation rows have blank Amount column.' });
      }
    }
  }

  // ── 6. SUBSCRIPTIONS & SERVICES ──────────────────────────────────────────
  const sub = ss.getSheetByName('Subscriptions & Services');
  if (sub) {
    passes.push('Subscriptions & Services: present');
  }

  // ── 7. W-2 & INCOME DETAIL ────────────────────────────────────────────────
  const w2 = ss.getSheetByName('W-2 & Income Detail');
  if (w2) {
    const w2LastRow = w2.getLastRow();
    passes.push('W-2 & Income Detail: ' + Math.max(0, w2LastRow - 1) + ' rows');
  }

  // ── 8. SYRINA CREDIT SUMMARY ─────────────────────────────────────────────
  const sc = ss.getSheetByName('Syrina Credit Summary');
  if (sc) {
    passes.push('Syrina Credit Summary: present');
  } else {
    issues.push({ sev: 'INFO', sheet: 'Syrina Credit Summary', msg: 'Sheet not found — may need to be imported from TransUnion export.' });
  }

  // ── 9. _VALIDATION ────────────────────────────────────────────────────────
  const val = ss.getSheetByName('_Validation');
  if (!val) {
    issues.push({ sev: 'WARN', sheet: '_Validation', msg: '_Validation sheet missing — dropdown source lists will not work.' });
  } else {
    const valCols = val.getLastColumn();
    if (valCols < 8) {
      issues.push({ sev: 'WARN', sheet: '_Validation', msg: 'Only ' + valCols + ' columns found — expected 10+. Dropdown lists may be incomplete.' });
    } else {
      passes.push('_Validation: ' + valCols + ' columns OK');
    }
  }

  // ── 10. GENERAL: Empty sheets ─────────────────────────────────────────────
  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name.startsWith('_')) return;
    if (sheet.getLastRow() === 0) {
      issues.push({ sev: 'INFO', sheet: name, msg: 'Sheet is completely empty.' });
    }
  });

  // ── 11. NAMED RANGES ─────────────────────────────────────────────────────
  const namedRanges = ss.getNamedRanges();
  if (namedRanges.length === 0) {
    issues.push({ sev: 'INFO', sheet: 'Workbook', msg: 'No named ranges defined. Consider creating ranges for key columns (ActiveAccounts, AccountBalances).' });
  } else {
    passes.push('Named ranges: ' + namedRanges.length + ' defined');
  }

  // ── 12. FROZEN ROWS ───────────────────────────────────────────────────────
  const SHEETS_NEEDING_FROZEN = ['Master Register', 'Transaction Ledger', 'Household Obligations', 'W-2 & Income Detail'];
  SHEETS_NEEDING_FROZEN.forEach(name => {
    const sh = ss.getSheetByName(name);
    if (sh && sh.getFrozenRows() < 1) {
      issues.push({ sev: 'INFO', sheet: name, msg: 'Header row not frozen — consider freezing row 1 or 2.' });
    } else if (sh) {
      passes.push(name + ': header frozen OK');
    }
  });

  // ── WRITE REPORT ──────────────────────────────────────────────────────────
  writeAuditReport_(ss, issues, passes);

  const errorCount = issues.filter(i => i.sev === 'ERROR').length;
  const warnCount  = issues.filter(i => i.sev === 'WARN').length;
  const infoCount  = issues.filter(i => i.sev === 'INFO').length;

  const summary = '✅ ' + passes.length + ' checks passed | ⛔ ' + errorCount + ' errors | ⚠️ ' + warnCount + ' warnings | ℹ️ ' + infoCount + ' info';
  ss.toast(summary, 'Audit Complete', 10);
  SpreadsheetApp.getUi().alert('Health Audit Complete\n\n' + summary + '\n\nSee "_HealthAudit" tab for full report.');
}


/**
 * Writes the audit results to the _HealthAudit sheet.
 */
function writeAuditReport_(ss, issues, passes) {
  let auditSheet = ss.getSheetByName('_HealthAudit');
  if (!auditSheet) {
    auditSheet = ss.insertSheet('_HealthAudit');
    auditSheet.setTabColor('#FF6F00'); // amber
  } else {
    auditSheet.clear();
  }

  const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  const rows = [];

  // Title
  rows.push(['TMAR WORKBOOK HEALTH AUDIT', '', '', '']);
  rows.push(['Generated: ' + now + ' (ET)', '', '', '']);
  rows.push(['', '', '', '']);

  // Header
  rows.push(['SEVERITY', 'SHEET', 'FINDING', 'RECOMMENDED ACTION']);

  // Issues
  const sevOrder = { ERROR: 0, WARN: 1, INFO: 2 };
  const sorted = [...issues].sort((a, b) => (sevOrder[a.sev] || 9) - (sevOrder[b.sev] || 9));

  sorted.forEach(issue => {
    const action = issueAction_(issue);
    rows.push([issue.sev, issue.sheet, issue.msg, action]);
  });

  rows.push(['', '', '', '']);
  rows.push(['PASSED CHECKS (' + passes.length + ')', '', '', '']);
  passes.forEach(p => rows.push(['PASS', '', p, '']));

  auditSheet.getRange(1, 1, rows.length, 4).setValues(rows);

  // Formatting
  const lastRow = auditSheet.getLastRow();
  const lastCol = 4;

  // Title rows
  auditSheet.getRange(1, 1, 1, lastCol).merge()
    .setBackground(P.headerBg).setFontColor(P.headerFg)
    .setFontWeight('bold').setFontSize(13).setFontFamily('Arial');

  auditSheet.getRange(2, 1, 1, lastCol).merge()
    .setFontStyle('italic').setFontSize(9).setFontColor(P.noteFg).setFontFamily('Arial');

  // Column header row (row 4)
  auditSheet.getRange(4, 1, 1, lastCol)
    .setBackground(P.sectionBg).setFontColor(P.sectionFg)
    .setFontWeight('bold').setFontSize(10).setFontFamily('Arial');

  // Color issues by severity
  for (let i = 4; i < rows.length; i++) {
    const sev = rows[i][0];
    const range = auditSheet.getRange(i + 1, 1, 1, lastCol);
    if (sev === 'ERROR') range.setBackground(P.flagRed);
    else if (sev === 'WARN') range.setBackground(P.flagYellow);
    else if (sev === 'INFO') range.setBackground('#E3F2FD');
    else if (sev === 'PASS') range.setBackground(P.flagGreen);
    range.setFontFamily('Arial').setFontSize(10);
  }

  // Column widths
  auditSheet.setColumnWidth(1, 90);
  auditSheet.setColumnWidth(2, 200);
  auditSheet.setColumnWidth(3, 420);
  auditSheet.setColumnWidth(4, 350);
  auditSheet.setFrozenRows(4);
  auditSheet.hideSheet(); // Keep it tidy — visible via TMAR Tools or direct nav

  Logger.log('Health audit written to _HealthAudit');
}


/**
 * Returns a short recommended action string for a known issue type.
 */
function issueAction_(issue) {
  const msg = issue.msg.toLowerCase();
  if (msg.includes('duplicate'))      return 'Open Master Register → sort by Row ID → delete or renumber duplicates.';
  if (msg.includes('missing ein'))    return 'Look up EIN at sec.gov/cgi-bin/browse-edgar or FDIC BankFind, then fill column E.';
  if (msg.includes('blank party'))    return 'Filter Transaction Ledger on blank col B → assign Clint / Syrina / Joint.';
  if (msg.includes('blank amount'))   return 'Review rows for missing dollar values in the Amount column.';
  if (msg.includes('_validation'))    return 'Run apply_master_register_formatting.gs → applyDataValidation().';
  if (msg.includes('frozen'))         return 'View → Freeze → 1 row (or 2 rows on that sheet).';
  if (msg.includes('empty'))          return 'Populate sheet or delete if no longer needed.';
  if (msg.includes('totals row'))     return 'Re-enter =SUM(C3:C14) / =SUM(D3:D14) in BOA Cash Flow row 15 cols C/D.';
  if (msg.includes('named ranges'))   return 'Run apply_master_register_formatting.gs → createNamedRanges().';
  if (msg.includes('column count'))   return 'Verify schema vs KNOWLEDGE_BASE — may need to add missing columns.';
  if (msg.includes('not found'))      return 'Create sheet from template or rename existing sheet to exact name.';
  return '— Review manually.';
}


// ══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — STANDALONE MENU HOOK (safe to call from onOpen in Code.gs)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Add this call inside your existing onOpen() in Code.gs:
 *
 *   function onOpen() {
 *     // ... existing menu items ...
 *     addAestheticsAuditMenu_();
 *   }
 *
 * Or just keep onOpen_AestheticsAudit() as a separate trigger.
 */
function addAestheticsAuditMenu_() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('TMAR Tools')
    .addSeparator()
    .addSubMenu(
      ui.createMenu('🎨 Aesthetics & Audit')
        .addItem('Apply All Aesthetics',               'applyAesthetics')
        .addItem('Color Transaction Ledger Rows',       'colorTransactionLedger')
        .addItem('Color Master Register Rows',          'colorMasterRegisterRows')
        .addSeparator()
        .addItem('Insert / Refresh Legends (All)',      'insertAllLegends')
        .addSeparator()
        .addItem('Run Health Audit',                    'runHealthAudit')
        .addItem('▶ Run All (Aesthetics + Audit)',      'runAll')
    )
    .addToUi();
}
