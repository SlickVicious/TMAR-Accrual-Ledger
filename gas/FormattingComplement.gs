/**
 * FormattingComplement.gs
 * ═══════════════════════════════════════════════════════════════════════════
 * Complement to Code.gs / applyAllFormatting()
 * Adds: legend blocks, fine-print attribution, party row coloring,
 *       and a formatting health audit — without modifying existing scripts.
 *
 * Menu integration: adds items to TMAR Tools > Formatting submenu.
 *   Call enhanceFormattingMenu() from onOpen() — see bottom of file.
 *
 * Created: 2026-03-06
 * Version: 1.0
 * ═══════════════════════════════════════════════════════════════════════════
 */


// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const FC_COLORS_ = {
  HEADER_BG:      '#1B2A4A',
  HEADER_FG:      '#FFFFFF',
  ACTIVE_BG:      '#E8F5E9',
  ACTIVE_FG:      '#1B5E20',
  CLOSED_BG:      '#FFEBEE',
  CLOSED_FG:      '#B71C1C',
  PENDING_BG:     '#FFF8E1',
  PENDING_FG:     '#F57F17',
  FILED_BG:       '#E3F2FD',
  FILED_FG:       '#0D47A1',
  POS_BG:         '#E8F5E9',
  POS_FG:         '#1B5E20',
  NEG_BG:         '#FFEBEE',
  NEG_FG:         '#B71C1C',
  LEGEND_BG:      '#F5F5F5',
  LEGEND_BORDER:  '#BDBDBD',
  CLINT_ROW:      '#E3F2FD',   // Light blue for Clint
  SYRINA_ROW:     '#F3E5F5',   // Light purple for Syrina
  JOINT_ROW:      '#E0F2F1',   // Light teal for Joint
  TRUST_ROW:      '#FFF8E1',   // Light amber for Trust
  CHARGEOFF_BG:   '#FFCDD2',
  COLLECTION_BG:  '#FFE0B2',
  CLOSED_PAID_BG: '#E0E0E0',
};

const FC_TRUST_LINE_ = 'A Provident Private Creditor Revocable Living Trust  ·  EIN 41-6809588  ·  Trustee: Clinton Wimberly IV  ·  CAF 0317-17351';
const FC_VERSION_     = 'TMAR Tools v1.0  ·  FormattingComplement v1.0  ·  Generated with Claude';


// ═══════════════════════════════════════════════════════════════════════════
// MASTER RUNNER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Apply all enhancement layers at once.
 */
function applyAllEnhancements() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast('Applying formatting enhancements...', 'Formatting Complement', -1);

  applyLegendBlocks(ss);
  applyFinePrintAttribution(ss);
  applyPartyRowColoring(ss);

  ss.toast('All enhancements applied!', 'Formatting Complement', 5);
}


// ═══════════════════════════════════════════════════════════════════════════
// 1. LEGEND BLOCKS
// ═══════════════════════════════════════════════════════════════════════════
// Inserts a small color-key block in an unused area to the right of each
// sheet's data range. Non-destructive — only writes to empty columns.

function applyLegendBlocks(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();

  // Ensure each sheet has enough columns for its legend placement
  var legendColReqs = {
    'Master Register':          39,   // AK+2 = col 39
    'Transaction Ledger':       20,   // R+2  = col 20
    'Forms & Authority':        17,   // O+2  = col 17
    'BOA Cash Flow':            11,   // J+1  = col 11
    'Household Obligations':    14,   // M+1  = col 14
    '1099 Filing Chain':        19,   // Q+2  = col 19
  };
  for (var name in legendColReqs) {
    var sheet = ss.getSheetByName(name);
    if (sheet && sheet.getMaxColumns() < legendColReqs[name]) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), legendColReqs[name] - sheet.getMaxColumns());
      Logger.log('Expanded ' + name + ' to ' + legendColReqs[name] + ' columns for legend');
    }
  }

  var legendFns = [
    ['Master Register',       applyLegend_MasterRegister_,   37, 1],
    ['Transaction Ledger',    applyLegend_TransactionLedger_, 18, 3],
    ['Forms & Authority',     applyLegend_FormsAuthority_,   15, 3],
    ['BOA Cash Flow',         applyLegend_BOACashFlow_,      10, 3],
    ['Household Obligations', applyLegend_HouseholdObligations_, 13, 3],
    ['1099 Filing Chain',     applyLegend_1099FilingChain_,  17, 3],
  ];
  for (var i = 0; i < legendFns.length; i++) {
    try {
      // Unmerge any cells in the legend area before writing
      var lSheet = ss.getSheetByName(legendFns[i][0]);
      if (lSheet) {
        var lCol = legendFns[i][2];
        var lRow = legendFns[i][3];
        var lCols = (lCol === 10 || lCol === 13) ? 2 : 3;  // BOA & HH use 2 cols, others 3
        try {
          // Ensure enough rows exist
          if (lSheet.getMaxRows() < lRow + 14) {
            lSheet.insertRowsAfter(lSheet.getMaxRows(), (lRow + 14) - lSheet.getMaxRows());
          }
          // Break any merges in the target area
          lSheet.getRange(lRow, lCol, 14, lCols).breakApart();
          // Clear any stale data validation rules in the legend area
          lSheet.getRange(lRow, lCol, 14, lCols).clearDataValidations();
        } catch (ue) {
          Logger.log('Unmerge/expand on ' + legendFns[i][0] + ': ' + ue.message);
        }
      }
      legendFns[i][1](ss);
    } catch (e) {
      Logger.log('Legend FAILED on ' + legendFns[i][0] + ': ' + e.message);
    }
  }

  Logger.log('Legend blocks applied');
}


function applyLegend_MasterRegister_(ss) {
  const sheet = ss.getSheetByName('Master Register');
  if (!sheet) return;

  const startCol = 37; // AK — safely past col 35 (AI)
  const startRow = 1;

  const legend = [
    ['STATUS LEGEND', '', ''],
    ['Color', 'Status', 'Meaning'],
    ['', 'Active', 'Account is open and in use'],
    ['', 'Closed', 'Account has been closed'],
    ['', 'Pending', 'Awaiting action or approval'],
    ['', '', ''],
    ['ROW COLORS', '', ''],
    ['', 'Green row', 'Active / Current — good standing'],
    ['', 'Red row', 'Charge-off — derogatory'],
    ['', 'Orange row', 'Collection — debt buyer'],
    ['', 'Gray row', 'Closed / Paid / Transferred'],
  ];

  const range = sheet.getRange(startRow, startCol, legend.length, 3);
  range.setValues(legend);
  range.setFontFamily('Calibri').setFontSize(9).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  // Title rows
  sheet.getRange(startRow, startCol, 1, 3).setBackground(FC_COLORS_.HEADER_BG)
    .setFontColor(FC_COLORS_.HEADER_FG).setFontWeight('bold').setFontSize(10);
  sheet.getRange(startRow + 1, startCol, 1, 3).setFontWeight('bold').setBackground('#E0E0E0');
  sheet.getRange(startRow + 6, startCol, 1, 3).setBackground(FC_COLORS_.HEADER_BG)
    .setFontColor(FC_COLORS_.HEADER_FG).setFontWeight('bold').setFontSize(10);

  // Color swatches (column AK, rows 3-5 and 8-11)
  sheet.getRange(startRow + 2, startCol).setBackground(FC_COLORS_.ACTIVE_BG);
  sheet.getRange(startRow + 3, startCol).setBackground(FC_COLORS_.CLOSED_BG);
  sheet.getRange(startRow + 4, startCol).setBackground(FC_COLORS_.PENDING_BG);

  sheet.getRange(startRow + 7, startCol).setBackground(FC_COLORS_.ACTIVE_BG);
  sheet.getRange(startRow + 8, startCol).setBackground(FC_COLORS_.CHARGEOFF_BG);
  sheet.getRange(startRow + 9, startCol).setBackground(FC_COLORS_.COLLECTION_BG);
  sheet.getRange(startRow + 10, startCol).setBackground(FC_COLORS_.CLOSED_PAID_BG);

  // Border the legend area
  range.setBorder(true, true, true, true, false, false, FC_COLORS_.LEGEND_BORDER, SpreadsheetApp.BorderStyle.SOLID);

  // Column widths for legend
  sheet.setColumnWidth(startCol, 70);
  sheet.setColumnWidth(startCol + 1, 120);
  sheet.setColumnWidth(startCol + 2, 200);

  Logger.log('Legend: Master Register');
}


function applyLegend_TransactionLedger_(ss) {
  const sheet = ss.getSheetByName('Transaction Ledger');
  if (!sheet) return;

  const startCol = 18; // R — past the 16-col data range
  const startRow = 3;  // Below merged title and header rows

  const legend = [
    ['STATUS LEGEND', '', ''],
    ['Color', 'Status', 'Meaning'],
    ['', 'Paid', 'Transaction completed'],
    ['', 'Received', 'Income received'],
    ['', 'Owed', 'Outstanding obligation'],
    ['', 'Pending', 'Awaiting confirmation'],
    ['', '', ''],
    ['PARTY ROW COLORS', '', ''],
    ['', 'Clint', 'Clinton\'s transactions'],
    ['', 'Syrina', 'Syrina\'s transactions'],
    ['', 'Joint', 'Joint transactions'],
    ['', 'Trust', 'Trust entity transactions'],
  ];

  const range = sheet.getRange(startRow, startCol, legend.length, 3);
  range.setValues(legend);
  range.setFontFamily('Calibri').setFontSize(9).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  // Titles
  sheet.getRange(startRow, startCol, 1, 3).setBackground(FC_COLORS_.HEADER_BG)
    .setFontColor(FC_COLORS_.HEADER_FG).setFontWeight('bold').setFontSize(10);
  sheet.getRange(startRow + 1, startCol, 1, 3).setFontWeight('bold').setBackground('#E0E0E0');
  sheet.getRange(startRow + 7, startCol, 1, 3).setBackground(FC_COLORS_.HEADER_BG)
    .setFontColor(FC_COLORS_.HEADER_FG).setFontWeight('bold').setFontSize(10);

  // Status swatches
  sheet.getRange(startRow + 2, startCol).setBackground(FC_COLORS_.ACTIVE_BG);
  sheet.getRange(startRow + 3, startCol).setBackground(FC_COLORS_.ACTIVE_BG);
  sheet.getRange(startRow + 4, startCol).setBackground(FC_COLORS_.PENDING_BG);
  sheet.getRange(startRow + 5, startCol).setBackground(FC_COLORS_.PENDING_BG);

  // Party swatches
  sheet.getRange(startRow + 8, startCol).setBackground(FC_COLORS_.CLINT_ROW);
  sheet.getRange(startRow + 9, startCol).setBackground(FC_COLORS_.SYRINA_ROW);
  sheet.getRange(startRow + 10, startCol).setBackground(FC_COLORS_.JOINT_ROW);
  sheet.getRange(startRow + 11, startCol).setBackground(FC_COLORS_.TRUST_ROW);

  range.setBorder(true, true, true, true, false, false, FC_COLORS_.LEGEND_BORDER, SpreadsheetApp.BorderStyle.SOLID);

  sheet.setColumnWidth(startCol, 70);
  sheet.setColumnWidth(startCol + 1, 120);
  sheet.setColumnWidth(startCol + 2, 200);

  Logger.log('Legend: Transaction Ledger');
}


function applyLegend_FormsAuthority_(ss) {
  const sheet = ss.getSheetByName('Forms & Authority');
  if (!sheet) return;

  const startCol = 15; // O — past existing columns
  const startRow = 3;

  const legend = [
    ['STATUS LEGEND', '', ''],
    ['Color', 'Status', 'Meaning'],
    ['', 'Not Started', 'Form not yet prepared'],
    ['', 'Filed', 'Submitted to authority'],
    ['', 'Complete', 'Accepted and confirmed'],
    ['', 'Accepted', 'Authority acknowledged'],
    ['', 'Rejected', 'Returned — needs correction'],
  ];

  const range = sheet.getRange(startRow, startCol, legend.length, 3);
  range.setValues(legend);
  range.setFontFamily('Calibri').setFontSize(9).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  sheet.getRange(startRow, startCol, 1, 3).setBackground(FC_COLORS_.HEADER_BG)
    .setFontColor(FC_COLORS_.HEADER_FG).setFontWeight('bold').setFontSize(10);
  sheet.getRange(startRow + 1, startCol, 1, 3).setFontWeight('bold').setBackground('#E0E0E0');

  sheet.getRange(startRow + 2, startCol).setBackground(FC_COLORS_.PENDING_BG);
  sheet.getRange(startRow + 3, startCol).setBackground(FC_COLORS_.FILED_BG);
  sheet.getRange(startRow + 4, startCol).setBackground(FC_COLORS_.ACTIVE_BG);
  sheet.getRange(startRow + 5, startCol).setBackground(FC_COLORS_.ACTIVE_BG);
  sheet.getRange(startRow + 6, startCol).setBackground(FC_COLORS_.CLOSED_BG);

  range.setBorder(true, true, true, true, false, false, FC_COLORS_.LEGEND_BORDER, SpreadsheetApp.BorderStyle.SOLID);

  sheet.setColumnWidth(startCol, 70);
  sheet.setColumnWidth(startCol + 1, 120);
  sheet.setColumnWidth(startCol + 2, 200);

  Logger.log('Legend: Forms & Authority');
}


function applyLegend_BOACashFlow_(ss) {
  const sheet = ss.getSheetByName('BOA Cash Flow');
  if (!sheet) return;

  const startCol = 10; // J
  const startRow = 3;

  const legend = [
    ['NET CHANGE LEGEND', ''],
    ['Color', 'Meaning'],
    ['', 'Positive net change (surplus)'],
    ['', 'Negative net change (deficit)'],
  ];

  const range = sheet.getRange(startRow, startCol, legend.length, 2);
  range.setValues(legend);
  range.setFontFamily('Calibri').setFontSize(9);

  sheet.getRange(startRow, startCol, 1, 2).setBackground(FC_COLORS_.HEADER_BG)
    .setFontColor(FC_COLORS_.HEADER_FG).setFontWeight('bold').setFontSize(10);
  sheet.getRange(startRow + 1, startCol, 1, 2).setFontWeight('bold').setBackground('#E0E0E0');

  sheet.getRange(startRow + 2, startCol).setBackground(FC_COLORS_.POS_BG);
  sheet.getRange(startRow + 3, startCol).setBackground(FC_COLORS_.NEG_BG);

  range.setBorder(true, true, true, true, false, false, FC_COLORS_.LEGEND_BORDER, SpreadsheetApp.BorderStyle.SOLID);

  sheet.setColumnWidth(startCol, 70);
  sheet.setColumnWidth(startCol + 1, 240);

  Logger.log('Legend: BOA Cash Flow');
}


function applyLegend_HouseholdObligations_(ss) {
  const sheet = ss.getSheetByName('Household Obligations');
  if (!sheet) return;

  const startCol = 13; // M
  const startRow = 3;

  const legend = [
    ['STATUS LEGEND', ''],
    ['Color', 'Meaning'],
    ['', 'Active — currently owed'],
    ['', 'Closed — no longer owed'],
  ];

  const range = sheet.getRange(startRow, startCol, legend.length, 2);
  range.setValues(legend);
  range.setFontFamily('Calibri').setFontSize(9);

  sheet.getRange(startRow, startCol, 1, 2).setBackground(FC_COLORS_.HEADER_BG)
    .setFontColor(FC_COLORS_.HEADER_FG).setFontWeight('bold').setFontSize(10);
  sheet.getRange(startRow + 1, startCol, 1, 2).setFontWeight('bold').setBackground('#E0E0E0');

  sheet.getRange(startRow + 2, startCol).setBackground(FC_COLORS_.ACTIVE_BG);
  sheet.getRange(startRow + 3, startCol).setBackground(FC_COLORS_.CLOSED_BG);

  range.setBorder(true, true, true, true, false, false, FC_COLORS_.LEGEND_BORDER, SpreadsheetApp.BorderStyle.SOLID);

  sheet.setColumnWidth(startCol, 70);
  sheet.setColumnWidth(startCol + 1, 240);

  Logger.log('Legend: Household Obligations');
}


function applyLegend_1099FilingChain_(ss) {
  const sheet = ss.getSheetByName('1099 Filing Chain');
  if (!sheet) return;

  const startCol = 17; // Q
  const startRow = 3;

  const legend = [
    ['FILING STATUS LEGEND', '', ''],
    ['Color', 'Status', 'Next Step'],
    ['', 'Not Started', 'Prepare 1099-A form'],
    ['', 'Filed', 'Await IRS acceptance'],
    ['', 'Complete', 'Proceed to next form in chain'],
    ['', 'Rejected', 'Correct and refile'],
  ];

  const range = sheet.getRange(startRow, startCol, legend.length, 3);
  range.setValues(legend);
  range.setFontFamily('Calibri').setFontSize(9).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  sheet.getRange(startRow, startCol, 1, 3).setBackground(FC_COLORS_.HEADER_BG)
    .setFontColor(FC_COLORS_.HEADER_FG).setFontWeight('bold').setFontSize(10);
  sheet.getRange(startRow + 1, startCol, 1, 3).setFontWeight('bold').setBackground('#E0E0E0');

  sheet.getRange(startRow + 2, startCol).setBackground(FC_COLORS_.PENDING_BG);
  sheet.getRange(startRow + 3, startCol).setBackground(FC_COLORS_.FILED_BG);
  sheet.getRange(startRow + 4, startCol).setBackground(FC_COLORS_.ACTIVE_BG);
  sheet.getRange(startRow + 5, startCol).setBackground(FC_COLORS_.CLOSED_BG);

  range.setBorder(true, true, true, true, false, false, FC_COLORS_.LEGEND_BORDER, SpreadsheetApp.BorderStyle.SOLID);

  sheet.setColumnWidth(startCol, 70);
  sheet.setColumnWidth(startCol + 1, 120);
  sheet.setColumnWidth(startCol + 2, 200);

  Logger.log('Legend: 1099 Filing Chain');
}


// ═══════════════════════════════════════════════════════════════════════════
// 2. FINE-PRINT ATTRIBUTION
// ═══════════════════════════════════════════════════════════════════════════
// Stamps a trust identity line and version tag in the bottom-left of each
// data sheet, two rows below the last data row. Idempotent — clears old
// stamps before writing.

function applyFinePrintAttribution(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();

  const year = getActiveYear_();
  const trustLine = FC_TRUST_LINE_;
  const versionLine = FC_VERSION_ + '  ·  Active Year: ' + year;

  const sheetNames = [
    'Executive Dashboard',
    'Transaction Ledger',
    'W-2 & Income Detail',
    'BOA Cash Flow',
    'PNC Cash Flow',
    'Household Obligations',
    'Subscriptions & Services',
    'Tax Strategy',
    'Master Register',
    'Trust Ledger',
    '1099 Filing Chain',
    'Forms & Authority',
    'Proof of Mailing',
    'Document Inventory',
    'Document Registry',
  ];

  for (const name of sheetNames) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) continue;

    const lastDataRow = sheet.getLastRow();
    const stampRow = lastDataRow + 2;

    // Ensure sheet has enough rows for the stamp
    if (sheet.getMaxRows() < stampRow + 1) {
      sheet.insertRowsAfter(sheet.getMaxRows(), (stampRow + 1) - sheet.getMaxRows());
    }

    // Clear any previous stamp in the area
    const clearStart = Math.max(lastDataRow - 19, 1);
    try {
      var clearRows = Math.min(lastDataRow - clearStart + 3, sheet.getMaxRows() - clearStart + 1);
      if (clearRows > 0) {
        const scanRange = sheet.getRange(clearStart, 1, clearRows, 1).getValues().flat();
        for (let i = 0; i < scanRange.length; i++) {
          const val = String(scanRange[i]);
          if (val.includes('Provident Private Creditor') || val.includes('TMAR Tools v')) {
            sheet.getRange(clearStart + i, 1, 1, 4).clearContent().clearFormat();
          }
        }
      }
    } catch (e) {
      Logger.log('Attribution clear scan failed on ' + name + ': ' + e.message);
    }

    // Write stamp
    try {
      const trustCell = sheet.getRange(stampRow, 1);
      trustCell.setValue(trustLine);
      trustCell.setFontFamily('Calibri').setFontSize(8).setFontColor('#9E9E9E').setFontStyle('italic');

      const versionCell = sheet.getRange(stampRow + 1, 1);
      versionCell.setValue(versionLine);
      versionCell.setFontFamily('Calibri').setFontSize(7).setFontColor('#BDBDBD').setFontStyle('italic');
    } catch (e) {
      Logger.log('Attribution write failed on ' + name + ': ' + e.message);
    }
  }

  Logger.log('Fine-print attribution applied to ' + sheetNames.length + ' sheets');
}


// ═══════════════════════════════════════════════════════════════════════════
// 3. TRANSACTION LEDGER — PARTY ROW COLORING
// ═══════════════════════════════════════════════════════════════════════════
// Colors entire rows based on the Party column (B = col 2). This is a
// data-driven paint pass, NOT conditional formatting — avoids conflict
// with Code.gs's status-column conditional rules on col J.

function applyPartyRowColoring(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();

  const sheet = ss.getSheetByName('Transaction Ledger');
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const lastCol = Math.min(sheet.getLastColumn(), 16);

  // Column B (2) = Party
  const parties = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();

  const partyColorMap = {
    'clint':   FC_COLORS_.CLINT_ROW,
    'clinton': FC_COLORS_.CLINT_ROW,
    'syrina':  FC_COLORS_.SYRINA_ROW,
    'joint':   FC_COLORS_.JOINT_ROW,
    'trust':   FC_COLORS_.TRUST_ROW,
  };

  // Batch: collect row ranges by color to minimize API calls
  const colorBuckets = {};

  for (let i = 0; i < parties.length; i++) {
    const party = String(parties[i]).trim().toLowerCase();
    const color = partyColorMap[party];
    if (!color) continue;

    if (!colorBuckets[color]) colorBuckets[color] = [];
    colorBuckets[color].push(i + 2); // row number (1-indexed, data starts row 2)
  }

  // Apply in batches — group consecutive rows for efficiency
  for (const [color, rows] of Object.entries(colorBuckets)) {
    // Group consecutive rows
    const groups = groupConsecutiveRows_(rows);
    for (const group of groups) {
      sheet.getRange(group.start, 1, group.count, lastCol).setBackground(color);
    }
  }

  Logger.log('Party row coloring applied: ' + parties.length + ' rows scanned');
}


/**
 * Groups consecutive row numbers into {start, count} objects for batch range ops.
 */
function groupConsecutiveRows_(rows) {
  if (rows.length === 0) return [];
  rows.sort(function(a, b) { return a - b; });

  const groups = [];
  let start = rows[0];
  let count = 1;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i] === rows[i - 1] + 1) {
      count++;
    } else {
      groups.push({ start: start, count: count });
      start = rows[i];
      count = 1;
    }
  }
  groups.push({ start: start, count: count });
  return groups;
}


// ═══════════════════════════════════════════════════════════════════════════
// 4. FORMATTING HEALTH AUDIT
// ═══════════════════════════════════════════════════════════════════════════
// Checks all sheets for formatting integrity: tab colors, dropdowns,
// conditional rules, filters, legends, and attribution stamps.
// Outputs results to a dialog.

function runFormattingHealthAudit() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast('Running formatting health audit...', 'Health Audit', -1);

  const results = [];

  // 1. Tab color check
  const expectedTabColors = {
    'Executive Dashboard':      '#FFD700',
    'Transaction Ledger':       '#1B2A4A',
    'W-2 & Income Detail':      '#1B2A4A',
    'BOA Cash Flow':            '#1B2A4A',
    'PNC Cash Flow':            '#4A148C',
    'Household Obligations':    '#1B2A4A',
    'Subscriptions & Services': '#1B2A4A',
    'Tax Strategy':             '#1B2A4A',
    'Master Register':          '#2E7D32',
    'Trust Ledger':             '#2E7D32',
    '1099 Filing Chain':        '#2E7D32',
    'Forms & Authority':        '#2E7D32',
    'Proof of Mailing':         '#2E7D32',
    'Document Inventory':       '#2E7D32',
    'Document Registry':        '#4CAF50',
    '_Validation':              '#9E9E9E',
  };

  for (const [name, expected] of Object.entries(expectedTabColors)) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) {
      results.push({ area: 'Tab Colors', sheet: name, status: 'MISSING', detail: 'Sheet not found' });
      continue;
    }
    const actual = sheet.getTabColor();
    if (!actual) {
      results.push({ area: 'Tab Colors', sheet: name, status: 'FAIL', detail: 'No tab color set (expected ' + expected + ')' });
    } else if (actual.toUpperCase() !== expected.toUpperCase()) {
      results.push({ area: 'Tab Colors', sheet: name, status: 'WARN', detail: 'Color mismatch: got ' + actual + ', expected ' + expected });
    } else {
      results.push({ area: 'Tab Colors', sheet: name, status: 'OK', detail: '' });
    }
  }

  // 2. Data validation presence check
  const valTargets = [
    { sheet: 'Master Register', col: 7, label: 'Account Type (G)' },
    { sheet: 'Master Register', col: 11, label: 'Status (K)' },
    { sheet: 'Master Register', col: 20, label: 'Primary User (T)' },
    { sheet: 'Master Register', col: 35, label: 'Discovery Status (AI)' },
    { sheet: 'Transaction Ledger', col: 3, label: 'Category (C)' },
    { sheet: '1099 Filing Chain', col: 6, label: 'Filing Status (F)' },
  ];

  for (const t of valTargets) {
    const sheet = ss.getSheetByName(t.sheet);
    if (!sheet) continue;
    const rule = sheet.getRange(2, t.col).getDataValidation();
    if (!rule) {
      results.push({ area: 'Dropdowns', sheet: t.sheet, status: 'FAIL', detail: t.label + ' — no validation rule' });
    } else {
      results.push({ area: 'Dropdowns', sheet: t.sheet, status: 'OK', detail: t.label });
    }
  }

  // 3. Conditional formatting rule count
  const cfTargets = ['Master Register', 'Transaction Ledger', 'Forms & Authority', 'BOA Cash Flow', 'Household Obligations'];
  for (const name of cfTargets) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) continue;
    const ruleCount = sheet.getConditionalFormatRules().length;
    if (ruleCount === 0) {
      results.push({ area: 'Cond. Formatting', sheet: name, status: 'FAIL', detail: 'No conditional formatting rules found' });
    } else {
      results.push({ area: 'Cond. Formatting', sheet: name, status: 'OK', detail: ruleCount + ' rules' });
    }
  }

  // 4. Filter check
  const filterTargets = ['Master Register', 'Transaction Ledger', 'Household Obligations'];
  for (const name of filterTargets) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) continue;
    if (!sheet.getFilter()) {
      // Check if merges are preventing the filter
      var hasMerges = false;
      try {
        var dr = sheet.getDataRange();
        hasMerges = dr.getMergedRanges().length > 0;
      } catch(e) {}
      if (hasMerges) {
        results.push({ area: 'Filters', sheet: name, status: 'WARN', detail: 'No filter — sheet has merged cells (unmerge manually to enable)' });
      } else {
        results.push({ area: 'Filters', sheet: name, status: 'FAIL', detail: 'No filter applied' });
      }
    } else {
      results.push({ area: 'Filters', sheet: name, status: 'OK', detail: '' });
    }
  }

  // 5. Header protection check
  const protTargets = ['Master Register', 'Transaction Ledger', 'Executive Dashboard'];
  for (const name of protTargets) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) continue;
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    const hasHeaderProtection = protections.some(function(p) {
      const r = p.getRange();
      return r.getRow() === 1 && r.getNumRows() <= 2;
    });
    if (!hasHeaderProtection) {
      results.push({ area: 'Header Protection', sheet: name, status: 'WARN', detail: 'No header row protection found' });
    } else {
      results.push({ area: 'Header Protection', sheet: name, status: 'OK', detail: '' });
    }
  }

  // 6. Legend presence check (look for "STATUS LEGEND" text)
  const legendTargets = [
    { sheet: 'Master Register', col: 37, row: 1 },
    { sheet: 'Transaction Ledger', col: 18, row: 3 },
    { sheet: 'Forms & Authority', col: 15, row: 3 },
    { sheet: 'BOA Cash Flow', col: 10, row: 3 },
    { sheet: 'Household Obligations', col: 13, row: 3 },
    { sheet: '1099 Filing Chain', col: 17, row: 3 },
  ];
  for (const t of legendTargets) {
    const sheet = ss.getSheetByName(t.sheet);
    if (!sheet) continue;
    // Check both the expected row and row 1 (Master Register)
    var found = false;
    for (var lr = t.row; lr <= t.row + 2; lr++) {
      try {
        var val = sheet.getRange(lr, t.col).getValue();
        if (String(val).includes('LEGEND')) { found = true; break; }
      } catch(e) {}
    }
    if (found) {
      results.push({ area: 'Legends', sheet: t.sheet, status: 'OK', detail: '' });
    } else {
      results.push({ area: 'Legends', sheet: t.sheet, status: 'MISSING', detail: 'No legend block found at expected column ' + t.col });
    }
  }

  // 7. Attribution stamp check — scan bottom 20 rows to handle varying data lengths
  const stampSheets = ['Master Register', 'Transaction Ledger', 'Executive Dashboard'];
  for (const name of stampSheets) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) continue;
    const lastRow = sheet.getLastRow();
    let found = false;
    if (lastRow >= 3) {
      var scanStart = Math.max(1, lastRow - 19);
      var scanRows = lastRow - scanStart + 1;
      const scan = sheet.getRange(scanStart, 1, scanRows, 1).getValues().flat();
      found = scan.some(function(v) { return String(v).includes('Provident Private Creditor'); });
    }
    if (found) {
      results.push({ area: 'Attribution', sheet: name, status: 'OK', detail: '' });
    } else {
      results.push({ area: 'Attribution', sheet: name, status: 'MISSING', detail: 'No trust attribution stamp found' });
    }
  }

  // 8. _Validation sheet check
  const valSheet = ss.getSheetByName('_Validation');
  if (!valSheet) {
    results.push({ area: 'System', sheet: '_Validation', status: 'FAIL', detail: 'Sheet missing — dropdowns will not work' });
  } else if (valSheet.getLastRow() < 5) {
    results.push({ area: 'System', sheet: '_Validation', status: 'WARN', detail: 'Sheet exists but has very few rows — may be unpopulated' });
  } else {
    results.push({ area: 'System', sheet: '_Validation', status: 'OK', detail: valSheet.getLastRow() - 1 + ' validation entries' });
  }

  // ── Render HTML report ──

  const okCount = results.filter(function(r) { return r.status === 'OK'; }).length;
  const failCount = results.filter(function(r) { return r.status === 'FAIL'; }).length;
  const warnCount = results.filter(function(r) { return r.status === 'WARN'; }).length;
  const missCount = results.filter(function(r) { return r.status === 'MISSING'; }).length;

  let html = `
    <style>
      body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; padding: 20px; color: #333; }
      h2 { color: #1B2A4A; font-size: 18px; margin-bottom: 4px; }
      .subtitle { color: #666; font-size: 12px; margin-bottom: 16px; }
      .summary { display: flex; gap: 12px; margin-bottom: 16px; }
      .pill { padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: bold; }
      .pill-ok { background: #E8F5E9; color: #1B5E20; }
      .pill-fail { background: #FFEBEE; color: #B71C1C; }
      .pill-warn { background: #FFF8E1; color: #F57F17; }
      .pill-miss { background: #E3F2FD; color: #0D47A1; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #1B2A4A; color: white; padding: 8px 6px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
      td { padding: 6px; border-bottom: 1px solid #E0E0E0; }
      .st-ok { color: #1B5E20; font-weight: bold; }
      .st-fail { color: #B71C1C; font-weight: bold; }
      .st-warn { color: #F57F17; font-weight: bold; }
      .st-miss { color: #0D47A1; font-weight: bold; }
      .footer { margin-top: 16px; font-size: 10px; color: #999; text-align: center; }
      .fix-btn { padding: 8px 20px; background: #1B2A4A; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 12px; }
    </style>
    <h2>Formatting Health Audit</h2>
    <div class="subtitle">Checked ${results.length} formatting rules across ${Object.keys(expectedTabColors).length} sheets</div>
    <div class="summary">
      <span class="pill pill-ok">${okCount} OK</span>
      <span class="pill pill-fail">${failCount} Fail</span>
      <span class="pill pill-warn">${warnCount} Warn</span>
      <span class="pill pill-miss">${missCount} Missing</span>
    </div>
    <table>
      <tr><th>Area</th><th>Sheet</th><th>Status</th><th>Detail</th></tr>
  `;

  // Sort: FAIL first, then WARN, MISSING, OK
  const statusOrder = { 'FAIL': 0, 'WARN': 1, 'MISSING': 2, 'OK': 3 };
  results.sort(function(a, b) { return (statusOrder[a.status] || 9) - (statusOrder[b.status] || 9); });

  for (const r of results) {
    const cls = 'st-' + r.status.toLowerCase();
    html += '<tr><td>' + r.area + '</td><td>' + r.sheet + '</td><td class="' + cls + '">' + r.status + '</td><td>' + (r.detail || '—') + '</td></tr>';
  }

  html += '</table>';

  if (failCount > 0 || missCount > 0) {
    html += '<button class="fix-btn" onclick="google.script.run.fixAllFormattingIssues();this.textContent=\'Running — check toasts...\';this.disabled=true;setTimeout(function(){google.script.host.close()},1500)">Fix All Issues</button>';
    html += '<div style="margin-top:8px;font-size:11px;color:#666;">Or close this dialog and run from: TMAR Tools &rarr; Formatting &rarr; \ud83d\udd27 Fix All Issues</div>';
  }

  html += '<div class="footer">' + FC_VERSION_ + '</div>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(700).setHeight(550);
  SpreadsheetApp.getUi().showModalDialog(output, 'Formatting Health Audit');

  ss.toast(okCount + ' OK, ' + failCount + ' Fail, ' + warnCount + ' Warn, ' + missCount + ' Missing', 'Health Audit', 5);
}


/**
 * One-click fix: runs all existing formatting + enhancements.
 * Called from the Health Audit dialog's "Fix All Issues" button.
 *
 * IMPORTANT: Does NOT call applyAllFormatting() directly because that
 * function ends with SpreadsheetApp.getUi().alert() which deadlocks
 * when invoked from an HTML dialog via google.script.run. Instead we
 * call each sub-function individually with toast progress feedback.
 */
function fixAllFormattingIssues() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const errors = [];

  function runPhase(step, label, fn) {
    ss.toast(step + '/9  ' + label + '...', 'Health Audit', -1);
    try {
      fn(ss);
      Logger.log('Phase ' + step + ' OK: ' + label);
    } catch (e) {
      Logger.log('Phase ' + step + ' FAILED: ' + label + ' — ' + e.message);
      errors.push(step + ') ' + label + ': ' + e.message);
    }
  }

  // ── Phase 1: Core formatting (from Code.gs) ──
  runPhase(1, 'Applying tab colors',           applyTabColors);
  runPhase(2, 'Applying data validation',      applyDataValidationSafe_);
  runPhase(3, 'Applying conditional formatting', applyConditionalFormatting);
  runPhase(4, 'Creating filter views',         createFilterViewsSafe_);
  runPhase(5, 'Protecting header rows',        protectHeaderRows);

  // ── Phase 2: Enhancements (from this file) ──
  runPhase(6, 'Adding legend blocks',          applyLegendBlocks);
  runPhase(7, 'Adding attribution stamps',     applyFinePrintAttribution);
  runPhase(8, 'Applying party row colors',     applyPartyRowColoring);

  if (errors.length > 0) {
    ss.toast('Done with ' + errors.length + ' error(s) — check Execution log', 'Health Audit', 8);
    Logger.log('Errors:\n' + errors.join('\n'));
  } else {
    ss.toast('9/9  All phases complete!', 'Health Audit', 5);
  }
  Logger.log('fixAllFormattingIssues: finished (' + (9 - errors.length) + '/9 succeeded)');
}


/**
 * Safe wrapper for applyDataValidation() that expands sheets before setting
 * validation on ranges that may exceed the current sheet dimensions.
 */
function applyDataValidationSafe_(ss) {
  // Ensure Master Register has at least 35 columns and 100 rows
  var mr = ss.getSheetByName('Master Register');
  if (mr) {
    if (mr.getMaxColumns() < 35) {
      mr.insertColumnsAfter(mr.getMaxColumns(), 35 - mr.getMaxColumns());
    }
    var neededRows = Math.max(mr.getLastRow() + 50, 100);
    if (mr.getMaxRows() < neededRows) {
      mr.insertRowsAfter(mr.getMaxRows(), neededRows - mr.getMaxRows());
    }
  }

  // Ensure other sheets have enough rows for their validation ranges
  var sheetMinRows = {
    '1099 Filing Chain': 102,
    'Forms & Authority': 103,
    'Document Inventory': 203,
    'Trust Ledger': 203,
    'Proof of Mailing': 103,
    'Transaction Ledger': 502,
  };
  for (var name in sheetMinRows) {
    var sheet = ss.getSheetByName(name);
    if (sheet && sheet.getMaxRows() < sheetMinRows[name]) {
      sheet.insertRowsAfter(sheet.getMaxRows(), sheetMinRows[name] - sheet.getMaxRows());
    }
  }

  applyDataValidation(ss);
}


/**
 * Safe wrapper for createFilterViews() that unmerges data ranges first.
 * GAS can't create a filter on a range with merged cells.
 */
function createFilterViewsSafe_(ss) {
  var filterSheets = ['Master Register', 'Transaction Ledger', 'Household Obligations'];
  for (var i = 0; i < filterSheets.length; i++) {
    var sheet = ss.getSheetByName(filterSheets[i]);
    if (!sheet) continue;
    try {
      if (sheet.getFilter()) sheet.getFilter().remove();
      var dataRange = sheet.getDataRange();
      dataRange.breakApart();
      dataRange.createFilter();
      Logger.log('Filter created on ' + filterSheets[i]);
    } catch (e) {
      // Fallback: skip merged title row, filter from row 1 col 1 to last data
      Logger.log('Filter attempt 1 failed on ' + filterSheets[i] + ': ' + e.message + ' — trying row 2+');
      try {
        if (sheet.getFilter()) sheet.getFilter().remove();
        var lastRow = sheet.getLastRow();
        var lastCol = sheet.getLastColumn();
        // Try to unmerge just the data rows (skip row 1 title)
        if (lastRow > 1) {
          sheet.getRange(2, 1, lastRow - 1, lastCol).breakApart();
          // Create filter on header + data (row 1 to end) using individual column range
          // If row 1 has merges, filter from row 2 instead
          try {
            sheet.getRange(1, 1, lastRow, lastCol).createFilter();
          } catch (e3) {
            // Row 1 still merged — unmerge row 1 too
            sheet.getRange(1, 1, 1, lastCol).breakApart();
            sheet.getRange(1, 1, lastRow, lastCol).createFilter();
          }
        }
        Logger.log('Filter created on ' + filterSheets[i] + ' (fallback)');
      } catch (e2) {
        Logger.log('Filter on ' + filterSheets[i] + ' fallback also failed: ' + e2.message);
      }
    }
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// MENU INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════
// Because Code.gs already builds the TMAR Tools menu in onOpen(), we can't
// add items to the existing submenu from a separate file without modifying
// onOpen(). Instead, we register a separate top-level installable trigger
// OR the user can paste the following lines into Code.gs's Formatting submenu.
//
// OPTION A — Add these lines inside Code.gs onOpen() under the Formatting
//            submenu (after the existing items):
//
//   .addSeparator()
//   .addItem('Apply All Enhancements', 'applyAllEnhancements')
//   .addItem('Add Legend Blocks', 'menuApplyLegendBlocks')
//   .addItem('Add Attribution Stamps', 'menuApplyFinePrint')
//   .addItem('Apply Party Row Colors', 'menuApplyPartyColors')
//   .addItem('Run Health Audit', 'runFormattingHealthAudit')
//
// OPTION B — Call enhanceFormattingMenu() from a second onOpen trigger
//            (installable trigger, not simple). This adds a standalone
//            "Formatting+" menu.

function enhanceFormattingMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Formatting+')
    .addItem('⚡ Apply All Enhancements', 'applyAllEnhancements')
    .addSeparator()
    .addItem('Add Legend Blocks', 'menuApplyLegendBlocks')
    .addItem('Add Attribution Stamps', 'menuApplyFinePrint')
    .addItem('Apply Party Row Colors', 'menuApplyPartyColors')
    .addSeparator()
    .addItem('🩺 Run Health Audit', 'runFormattingHealthAudit')
    .addItem('🔧 Fix All Issues', 'fixAllFormattingIssues')
    .addToUi();
}


/**
 * Diagnostic: test writing to each legend and attribution location.
 * Run from: TMAR Tools > Formatting > Diagnose Legend Issues
 */
function diagnoseLegendAndAttribution() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var report = [];

  var targets = [
    { name: 'Master Register',       col: 37, row: 1, cols: 3 },
    { name: 'Transaction Ledger',     col: 18, row: 3, cols: 3 },
    { name: 'Forms & Authority',      col: 15, row: 3, cols: 3 },
    { name: 'BOA Cash Flow',          col: 10, row: 3, cols: 2 },
    { name: 'Household Obligations',  col: 13, row: 3, cols: 2 },
    { name: '1099 Filing Chain',      col: 17, row: 3, cols: 3 },
  ];

  for (var i = 0; i < targets.length; i++) {
    var t = targets[i];
    var sheet = ss.getSheetByName(t.name);
    if (!sheet) { report.push(t.name + ': SHEET NOT FOUND'); continue; }

    report.push(t.name + ':');
    report.push('  maxCols=' + sheet.getMaxColumns() + ' maxRows=' + sheet.getMaxRows());
    report.push('  target: row=' + t.row + ' col=' + t.col + ' cols=' + t.cols);

    if (sheet.getMaxColumns() < t.col + t.cols - 1) {
      report.push('  PROBLEM: need col ' + (t.col + t.cols - 1) + ' but only ' + sheet.getMaxColumns());
    }

    try {
      var merges = sheet.getRange(1, 1, Math.min(sheet.getMaxRows(), 5), sheet.getMaxColumns()).getMergedRanges();
      var conflicts = [];
      for (var m = 0; m < merges.length; m++) {
        var mr = merges[m];
        if (mr.getLastColumn() >= t.col && mr.getColumn() <= t.col + t.cols - 1 &&
            mr.getLastRow() >= t.row && mr.getRow() <= t.row + 3) {
          conflicts.push(mr.getA1Notation());
        }
      }
      report.push(conflicts.length > 0 ? '  MERGE CONFLICTS: ' + conflicts.join(', ') : '  No merge conflicts');
    } catch (e) {
      report.push('  Merge check error: ' + e.message);
    }

    try {
      sheet.getRange(t.row, t.col).setValue('TEST');
      sheet.getRange(t.row, t.col).clearContent();
      report.push('  WRITE: OK');
    } catch (e) {
      report.push('  WRITE FAILED: ' + e.message);
    }
  }

  report.push('');
  report.push('=== ATTRIBUTION ===');
  var attrSheets = ['Master Register', 'Transaction Ledger', 'Executive Dashboard'];
  for (var a = 0; a < attrSheets.length; a++) {
    var sh = ss.getSheetByName(attrSheets[a]);
    if (!sh) { report.push(attrSheets[a] + ': NOT FOUND'); continue; }
    var lr = sh.getLastRow();
    var tgt = lr + 2;
    report.push(attrSheets[a] + ': lastRow=' + lr + ' maxRows=' + sh.getMaxRows() + ' stampRow=' + tgt);
    try {
      sh.getRange(tgt, 1).setValue('TEST');
      sh.getRange(tgt, 1).clearContent();
      report.push('  WRITE: OK');
    } catch (e) {
      report.push('  WRITE FAILED: ' + e.message);
    }
  }

  Logger.log(report.join('\n'));
  SpreadsheetApp.getUi().alert('Diagnostic Results', report.join('\n'), SpreadsheetApp.getUi().ButtonSet.OK);
}


// ─── Menu wrappers ──────────────────────────────────────────────────────────

function menuApplyLegendBlocks() { applyLegendBlocks(); }
function menuApplyFinePrint() { applyFinePrintAttribution(); }
function menuApplyPartyColors() { applyPartyRowColoring(); }
