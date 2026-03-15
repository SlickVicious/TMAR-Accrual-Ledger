/**
 * Wimberly Unified Master Register — Google Sheets Formatting
 * ============================================================
 * Run after uploading Wimberly_Unified_MasterRegister_{ACTIVE_YEAR}.xlsx
 * to Google Sheets. Applies Google-native features that don't
 * translate from .xlsx format.
 *
 * Usage:
 *   1. Upload .xlsx to Google Drive -> Open with Google Sheets
 *   2. Extensions -> Apps Script -> paste this file
 *   3. Reload the sheet — "TMAR Tools" menu appears automatically
 *   4. Or run applyAllFormatting() directly
 *
 * Color Palette:
 *   #1B2A4A  dark blue headers
 *   #D6E4F0  light blue subtotals
 *   #E8F5E9  green positive
 *   #FFEBEE  red negative
 *   #FFF8E1  yellow warning
 */

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
// Default year used as fallback when _Settings sheet hasn't been created yet.
// Using current calendar year so the script stays year-agnostic.
const DEFAULT_YEAR_ = new Date().getFullYear();

// ─── MAIN ENTRY POINT ──────────────────────────────────────────────────────

function applyAllFormatting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Logger.log('Starting Master Register formatting...');

  applyTabColors(ss);
  applyDataValidation(ss);
  applyConditionalFormatting(ss);
  createFilterViews(ss);
  protectHeaderRows(ss);

  Logger.log('All formatting applied successfully!');
  SpreadsheetApp.getUi().alert('Formatting applied successfully!');
}


// ─── TAB COLORS ─────────────────────────────────────────────────────────────

function applyTabColors(ss) {
  const tabColors = {
    'Executive Dashboard':      '#FFD700',  // Gold
    'Transaction Ledger':       '#1B2A4A',  // Dark blue
    'W-2 & Income Detail':      '#1B2A4A',
    'BOA Cash Flow':            '#1B2A4A',
    'PNC Cash Flow':            '#4A148C',  // Deep purple — Syrina's PNC Spend
    'Household Obligations':    '#1B2A4A',
    'Subscriptions & Services': '#1B2A4A',
    'Tax Strategy':             '#1B2A4A',
    'Master Register':          '#2E7D32',  // Green
    'Trust Ledger':             '#2E7D32',
    '1099 Filing Chain':        '#2E7D32',
    'Forms & Authority':        '#2E7D32',
    'Proof of Mailing':         '#2E7D32',
    'Document Inventory':       '#2E7D32',
    'Document Registry':        '#4CAF50',  // Bright green — filesystem cross-reference
    '_Validation':              '#9E9E9E',  // Gray
  };

  for (const [name, color] of Object.entries(tabColors)) {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      sheet.setTabColor(color);
      Logger.log(`Tab color set: ${name} -> ${color}`);
    }
  }

  // Hide _Validation tab
  const valSheet = ss.getSheetByName('_Validation');
  if (valSheet) {
    valSheet.hideSheet();
    Logger.log('_Validation tab hidden');
  }
}


// ─── DATA VALIDATION (DROPDOWNS) ────────────────────────────────────────────

function applyDataValidation(ss) {
  const valSheet = ss.getSheetByName('_Validation');
  if (!valSheet) {
    Logger.log('WARNING: _Validation sheet not found');
    return;
  }

  // Helper: get values from a validation column
  function getValList(col) {
    const lastRow = valSheet.getLastRow();
    const values = valSheet.getRange(2, col, lastRow - 1, 1).getValues()
      .flat()
      .filter(v => v !== '' && v !== null);
    return values;
  }

  // Master Register dropdowns
  const mrSheet = ss.getSheetByName('Master Register');
  if (mrSheet) {
    const lastRow = Math.max(mrSheet.getLastRow() + 50, 100); // Room to grow

    // Column G (7): Account Type (col 1 in _Validation)
    // 35-col schema: A=RowID, B=DateAdded, C=Provider, D=MailAddr, E=EIN, F=AcctNum, G=AcctType
    const accountTypes = getValList(1);
    const atRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(accountTypes, true)
      .setAllowInvalid(false)
      .build();
    mrSheet.getRange(2, 7, lastRow, 1).setDataValidation(atRule);

    // Column K (11): Status (col 2 in _Validation)
    // 35-col: H=AcctSubtype, I=AcctAgent, J=AgentAddr, K=Status
    const statuses = getValList(2);
    const stRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(statuses, true)
      .setAllowInvalid(false)
      .build();
    mrSheet.getRange(2, 11, lastRow, 1).setDataValidation(stRule);

    // Column T (20): Primary User (col 4 in _Validation)
    // 35-col: R=BillFreq, S=NextPmtDue, T=PrimaryUser
    const users = getValList(4);
    const usRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(users, true)
      .setAllowInvalid(false)
      .build();
    mrSheet.getRange(2, 20, lastRow, 1).setDataValidation(usRule);

    // Column R (18): Billing Frequency (col 8 in _Validation)
    const freqs = getValList(8);
    const frRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(freqs, true)
      .setAllowInvalid(false)
      .build();
    mrSheet.getRange(2, 18, lastRow, 1).setDataValidation(frRule);

    // Column AI (35): Discovery Status (col 10 in _Validation)
    // 35-col: last column = Discovery Status
    const discStatuses = getValList(10);
    const dsRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(discStatuses, true)
      .setAllowInvalid(false)
      .build();
    mrSheet.getRange(2, 35, lastRow, 1).setDataValidation(dsRule);

    Logger.log('Master Register dropdowns applied');
  }

  // 1099 Filing Chain dropdowns
  const fcSheet = ss.getSheetByName('1099 Filing Chain');
  if (fcSheet) {
    const filingStatuses = getValList(3);
    const fsRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(filingStatuses, true)
      .setAllowInvalid(false)
      .build();
    // Status columns: F (6), I (9), L (12), N (14)
    const statusCols = [6, 9, 12, 14];
    for (const col of statusCols) {
      fcSheet.getRange(2, col, 100, 1).setDataValidation(fsRule);
    }
    Logger.log('1099 Filing Chain dropdowns applied');
  }

  // Forms & Authority dropdowns
  const faSheet = ss.getSheetByName('Forms & Authority');
  if (faSheet) {
    // Column H: FWM Binder Tab
    const binderTabs = getValList(5);
    const btRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(binderTabs, true)
      .setAllowInvalid(false)
      .build();
    faSheet.getRange(3, 8, 100, 1).setDataValidation(btRule);

    // Column I: Status
    const faStatuses = getValList(3);
    const faStRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(faStatuses, true)
      .setAllowInvalid(false)
      .build();
    faSheet.getRange(3, 9, 100, 1).setDataValidation(faStRule);

    Logger.log('Forms & Authority dropdowns applied');
  }

  // Document Inventory dropdowns
  const diSheet = ss.getSheetByName('Document Inventory');
  if (diSheet) {
    // Column H: FWM Binder Tab
    const binderTabs = getValList(5);
    const btRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(binderTabs, true)
      .setAllowInvalid(false)
      .build();
    diSheet.getRange(3, 8, 200, 1).setDataValidation(btRule);

    // Column M: Status
    const diStatuses = getValList(3);
    const diStRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(diStatuses, true)
      .setAllowInvalid(false)
      .build();
    diSheet.getRange(3, 13, 200, 1).setDataValidation(diStRule);

    Logger.log('Document Inventory dropdowns applied');
  }

  // Trust Ledger dropdowns
  const tlSheet = ss.getSheetByName('Trust Ledger');
  if (tlSheet) {
    const binderTabs = getValList(5);
    const btRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(binderTabs, true)
      .setAllowInvalid(false)
      .build();
    tlSheet.getRange(3, 6, 200, 1).setDataValidation(btRule);

    const filingStatuses = getValList(3);
    const fsRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(filingStatuses, true)
      .setAllowInvalid(false)
      .build();
    tlSheet.getRange(3, 7, 200, 1).setDataValidation(fsRule);

    Logger.log('Trust Ledger dropdowns applied');
  }

  // Proof of Mailing dropdowns
  const pmSheet = ss.getSheetByName('Proof of Mailing');
  if (pmSheet) {
    const binderTabs = getValList(5);
    const btRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(binderTabs, true)
      .setAllowInvalid(false)
      .build();
    pmSheet.getRange(3, 12, 100, 1).setDataValidation(btRule);

    Logger.log('Proof of Mailing dropdowns applied');
  }

  // Transaction Ledger: Category dropdown
  const tlgSheet = ss.getSheetByName('Transaction Ledger');
  if (tlgSheet) {
    const cats = getValList(9);
    const catRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(cats, true)
      .setAllowInvalid(true)  // Allow existing CSV values
      .build();
    tlgSheet.getRange(2, 3, 500, 1).setDataValidation(catRule);

    Logger.log('Transaction Ledger dropdowns applied');
  }
}


// ─── CONDITIONAL FORMATTING ─────────────────────────────────────────────────

function applyConditionalFormatting(ss) {
  // Master Register: Status column K (col 11 in 35-col schema)
  const mrSheet = ss.getSheetByName('Master Register');
  if (mrSheet) {
    const statusRange = mrSheet.getRange('K2:K100');
    const rules = mrSheet.getConditionalFormatRules();

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Active')
      .setBackground('#E8F5E9')
      .setFontColor('#1B5E20')
      .setRanges([statusRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Closed')
      .setBackground('#FFEBEE')
      .setFontColor('#B71C1C')
      .setRanges([statusRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Pending')
      .setBackground('#FFF8E1')
      .setFontColor('#F57F17')
      .setRanges([statusRange])
      .build());

    mrSheet.setConditionalFormatRules(rules);
    Logger.log('Master Register conditional formatting applied');
  }

  // Forms & Authority: Status column (I)
  const faSheet = ss.getSheetByName('Forms & Authority');
  if (faSheet) {
    const statusRange = faSheet.getRange('I3:I100');
    const rules = faSheet.getConditionalFormatRules();

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Not Started')
      .setBackground('#FFF8E1')
      .setFontColor('#F57F17')
      .setRanges([statusRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Filed')
      .setBackground('#E3F2FD')
      .setFontColor('#0D47A1')
      .setRanges([statusRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Complete')
      .setBackground('#E8F5E9')
      .setFontColor('#1B5E20')
      .setRanges([statusRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Accepted')
      .setBackground('#E8F5E9')
      .setFontColor('#1B5E20')
      .setRanges([statusRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Rejected')
      .setBackground('#FFEBEE')
      .setFontColor('#B71C1C')
      .setRanges([statusRange])
      .build());

    faSheet.setConditionalFormatRules(rules);
    Logger.log('Forms & Authority conditional formatting applied');
  }

  // Transaction Ledger: Status column (J)
  const tlSheet = ss.getSheetByName('Transaction Ledger');
  if (tlSheet) {
    const statusRange = tlSheet.getRange('J2:J500');
    const rules = tlSheet.getConditionalFormatRules();

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Paid')
      .setBackground('#E8F5E9')
      .setRanges([statusRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Received')
      .setBackground('#E8F5E9')
      .setRanges([statusRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Owed')
      .setBackground('#FFF8E1')
      .setRanges([statusRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Pending')
      .setBackground('#FFF8E1')
      .setRanges([statusRange])
      .build());

    tlSheet.setConditionalFormatRules(rules);
    Logger.log('Transaction Ledger conditional formatting applied');
  }

  // BOA Cash Flow: Net Change column (G) — green positive, red negative
  const boaSheet = ss.getSheetByName('BOA Cash Flow');
  if (boaSheet) {
    const netRange = boaSheet.getRange('G3:G14');
    const rules = boaSheet.getConditionalFormatRules();

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(0)
      .setBackground('#E8F5E9')
      .setFontColor('#1B5E20')
      .setRanges([netRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenNumberLessThan(0)
      .setBackground('#FFEBEE')
      .setFontColor('#B71C1C')
      .setRanges([netRange])
      .build());

    boaSheet.setConditionalFormatRules(rules);
    Logger.log('BOA Cash Flow conditional formatting applied');
  }

  // Household Obligations: Status column (H)
  const hoSheet = ss.getSheetByName('Household Obligations');
  if (hoSheet) {
    const statusRange = hoSheet.getRange('H2:H50');
    const rules = hoSheet.getConditionalFormatRules();

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Active')
      .setBackground('#E8F5E9')
      .setFontColor('#1B5E20')
      .setRanges([statusRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Closed')
      .setBackground('#FFEBEE')
      .setFontColor('#B71C1C')
      .setRanges([statusRange])
      .build());

    hoSheet.setConditionalFormatRules(rules);
    Logger.log('Household Obligations conditional formatting applied');
  }
}


// ─── FILTER VIEWS ───────────────────────────────────────────────────────────

function createFilterViews(ss) {
  const mrSheet = ss.getSheetByName('Master Register');
  if (!mrSheet) return;

  // Apply basic filter to Master Register
  const range = mrSheet.getDataRange();
  if (!mrSheet.getFilter()) {
    range.createFilter();
  }

  // Apply basic filter to Transaction Ledger
  const tlSheet = ss.getSheetByName('Transaction Ledger');
  if (tlSheet) {
    const tlRange = tlSheet.getDataRange();
    if (!tlSheet.getFilter()) {
      tlRange.createFilter();
    }
  }

  // Apply basic filter to Household Obligations
  const hoSheet = ss.getSheetByName('Household Obligations');
  if (hoSheet) {
    const hoRange = hoSheet.getDataRange();
    if (!hoSheet.getFilter()) {
      hoRange.createFilter();
    }
  }

  Logger.log('Filter views applied to Master Register, Transaction Ledger, Household Obligations');
}


// ─── PROTECT HEADER ROWS ────────────────────────────────────────────────────

function protectHeaderRows(ss) {
  const sheetsToProtect = [
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

  for (const name of sheetsToProtect) {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      // Protect rows 1-2 (title + header rows)
      const protection = sheet.getRange('1:2').protect();
      protection.setDescription(`${name} — Header Rows (Protected)`);
      protection.setWarningOnly(true);  // Warning only, not locked
    }
  }

  Logger.log('Header row protections applied (warning only)');
}


// ═══════════════════════════════════════════════════════════════════════════
// TMAR TOOLS — CUSTOM MENU SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

// ─── MENU & INITIALIZATION ─────────────────────────────────────────────────

function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('TMAR Tools')

    .addItem('⚡ Open Control Panel', 'showControlPanel')
    .addItem('📊 Universal Accrual Ledger', 'showGAAPInterface')
    .addItem('⚖ Bill of Exchange', 'showBillOfExchange')
    .addItem('🔍 EIN Verifier', 'showEINVerifier')
    .addItem('📄 Document Generator', 'showDocumentGenerator')
    .addSeparator()
    .addItem('🔍 Analyze Duplicates', 'showDuplicateAnalysisReport')
    .addItem('🗑️ Execute Cleanup', 'confirmAndExecuteCleanup')
    .addSeparator()

    .addSubMenu(ui.createMenu('Year Settings')
      .addItem('Set Active Year...', 'showYearSelector')
      .addItem('View Current Year', 'showCurrentYear')
      .addSeparator()
      .addItem('📊 Data Completeness Diagnostic', 'showDataCompletenessDashboard')
      .addSeparator()
      .addItem('Reset to Current Year', 'resetToDefaultYear'))

    .addSubMenu(ui.createMenu('Dashboard')
      .addItem('📊 View Dashboard', 'showTMARDashboard')
      .addItem('📈 Financial Summary', 'showFinancialSummary')
      .addSeparator()
      .addItem('➕ Add Account', 'showAddAccountDialog'))

    .addSubMenu(ui.createMenu('Data Gap Scanner')
      .addItem('Run Full Scan', 'runFullGapScan')
      .addItem('Scan Current Tab Only', 'scanCurrentTab')
      .addSeparator()
      .addItem('View Last Report', 'navigateToGapReport')
      .addItem('View Document Registry', 'navigateToDocRegistry')
      .addItem('Email Gap Report...', 'emailGapReport'))

    .addSubMenu(ui.createMenu('CPA Questions')
      .addItem('Add New Question...', 'showAddQuestionDialog')
      .addItem('View All Questions', 'navigateToCPASheet')
      .addSeparator()
      .addItem('Filter: Open Questions', 'filterCPAOpen')
      .addItem('Filter: By Priority...', 'filterCPAPriority')
      .addItem('Clear Filters', 'clearCPAFilters')
      .addSeparator()
      .addItem('Generate CPA Meeting Prep', 'generateCPAMeetingPrep'))

    .addSubMenu(ui.createMenu('Import Tools')
      .addItem('Import CSV Transactions...', 'showCSVImportDialog')
      .addSeparator()
      .addItem('Add Account to Master Reg...', 'showAddAccountDialog')
      .addItem('Add Obligation Entry...', 'showAddObligationDialog')
      .addItem('Add Subscription Entry...', 'showAddSubscriptionDialog')
      .addSeparator()
      .addItem('Import from Accrual Ledger...', 'showLedgerImportDialog'))


    .addSubMenu(ui.createMenu('Setup & Administration')
      .addItem('Populate Dropdown Values', 'populateValidationSheet')
      .addSeparator()
      .addItem('Refresh Dashboard Formulas', 'refreshDashboard')
      .addItem('Add Sample Data', 'addSampleData')
      .addSeparator()
      .addItem('Export Current Tab to PDF', 'exportToPdf'))

    .addSubMenu(ui.createMenu('Formatting')
      .addItem('Apply All Formatting', 'menuApplyAllFormatting')
      .addSeparator()
      .addItem('Refresh Tab Colors', 'menuRefreshTabColors')
      .addItem('Refresh Data Validation', 'menuRefreshDataValidation')
      .addItem('Refresh Conditional Fmt.', 'menuRefreshConditionalFmt')
      .addItem('Refresh Filters', 'menuRefreshFilters')
      .addItem('Refresh Header Protection', 'menuRefreshHeaderProtection')
      .addSeparator()
      .addItem('⚡ Apply All Enhancements', 'applyAllEnhancements')
      .addItem('Add Legend Blocks', 'menuApplyLegendBlocks')
      .addItem('Add Attribution Stamps', 'menuApplyFinePrint')
      .addItem('Apply Party Row Colors', 'menuApplyPartyColors')
      .addSeparator()
      .addItem('🩺 Run Health Audit', 'runFormattingHealthAudit')
      .addItem('🔧 Fix All Issues', 'fixAllFormattingIssues')
      .addItem('🔍 Diagnose Legend Issues', 'diagnoseLegendAndAttribution'))

    .addSeparator()

    .addSubMenu(ui.createMenu('About')
      .addItem('Workbook Info', 'showAboutDialog')
      .addItem('Help & Documentation', 'showHelpDialog'))

    .addToUi();

  // Ensure supporting sheets exist (wrapped in try-catch so menu always appears
  // even before authorization is granted — simple triggers have limited permissions)
  try {
    ensureSettingsSheet_();
    ensureCPASheet_();
  } catch (e) {
    Logger.log('TMAR setup deferred until authorization granted: ' + e.message);
  }

  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('TMAR Tools menu loaded', 'Ready', 3);
  } catch (e) {
    // toast() may also require authorization on first run
  }
}


function ensureSettingsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('_Settings');
  if (sheet) return sheet;

  sheet = ss.insertSheet('_Settings');
  sheet.getRange('A1').setValue('Active Year');
  sheet.getRange('B1').setValue(DEFAULT_YEAR_);
  sheet.getRange('A2').setValue('Last Gap Scan');
  sheet.getRange('B2').setValue('Never');
  sheet.getRange('A3').setValue('CPA Questions Count');
  sheet.getRange('B3').setValue(0);
  sheet.setTabColor('#9E9E9E');
  sheet.hideSheet();
  Logger.log('_Settings sheet created');
  return sheet;
}


/**
 * Read the active year from _Settings, falling back to current calendar year.
 * Use this everywhere instead of reading B1 directly.
 */
function getActiveYear_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = ss.getSheetByName('_Settings');
  if (!settings) return String(DEFAULT_YEAR_);
  const val = settings.getRange('B1').getValue();
  return val ? String(val) : String(DEFAULT_YEAR_);
}


function ensureCPASheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('CPA Questions');
  if (sheet) return sheet;

  sheet = ss.insertSheet('CPA Questions');
  const headers = [
    'Q-ID', 'Date Added', 'Category', 'Related Tab', 'Question',
    'Context / Reference', 'Priority', 'Status', 'CPA Response',
    'Response Date', 'Action Required', 'Resolved'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Header styling
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1B2A4A').setFontColor('#FFFFFF')
    .setFontWeight('bold').setFontFamily('Calibri').setFontSize(10)
    .setHorizontalAlignment('center').setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  // Column widths
  sheet.setColumnWidth(1, 80);   // Q-ID
  sheet.setColumnWidth(2, 100);  // Date
  sheet.setColumnWidth(3, 110);  // Category
  sheet.setColumnWidth(4, 150);  // Related Tab
  sheet.setColumnWidth(5, 350);  // Question
  sheet.setColumnWidth(6, 200);  // Context
  sheet.setColumnWidth(7, 90);   // Priority
  sheet.setColumnWidth(8, 100);  // Status
  sheet.setColumnWidth(9, 350);  // CPA Response
  sheet.setColumnWidth(10, 100); // Response Date
  sheet.setColumnWidth(11, 250); // Action Required
  sheet.setColumnWidth(12, 80);  // Resolved

  // Data validation dropdowns
  const catRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Filing', 'Deductions', 'Credits', 'Income', 'Trust', 'State', 'Other'], true)
    .setAllowInvalid(false).build();
  sheet.getRange(2, 3, 200, 1).setDataValidation(catRule);

  const tabNames = ['Executive Dashboard', 'Transaction Ledger', 'W-2 & Income Detail',
    'BOA Cash Flow', 'Household Obligations', 'Subscriptions & Services', 'Tax Strategy',
    'Master Register', 'Trust Ledger', '1099 Filing Chain', 'Forms & Authority',
    'Proof of Mailing', 'Document Inventory'];
  const tabRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(tabNames, true).setAllowInvalid(false).build();
  sheet.getRange(2, 4, 200, 1).setDataValidation(tabRule);

  const prioRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Critical', 'High', 'Medium', 'Low'], true)
    .setAllowInvalid(false).build();
  sheet.getRange(2, 7, 200, 1).setDataValidation(prioRule);

  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Open', 'Answered', 'Pending CPA', 'Resolved'], true)
    .setAllowInvalid(false).build();
  sheet.getRange(2, 8, 200, 1).setDataValidation(statusRule);

  sheet.setFrozenRows(1);
  sheet.setTabColor('#FF8F00');
  Logger.log('CPA Questions sheet created');
  return sheet;
}


// ─── FORMATTING MENU WRAPPERS ───────────────────────────────────────────────

function menuApplyAllFormatting() { applyAllFormatting(); }
function menuRefreshTabColors() { applyTabColors(SpreadsheetApp.getActiveSpreadsheet()); }
function menuRefreshDataValidation() { applyDataValidation(SpreadsheetApp.getActiveSpreadsheet()); }
function menuRefreshConditionalFmt() { applyConditionalFormatting(SpreadsheetApp.getActiveSpreadsheet()); }
function menuRefreshFilters() { createFilterViews(SpreadsheetApp.getActiveSpreadsheet()); }
function menuRefreshHeaderProtection() { protectHeaderRows(SpreadsheetApp.getActiveSpreadsheet()); }


// ─── ABOUT / HELP ───────────────────────────────────────────────────────────

function showAboutDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = ss.getSheetByName('_Settings');
  const year = settings ? settings.getRange('B1').getValue() : DEFAULT_YEAR_;
  const lastScan = settings ? settings.getRange('B2').getValue() : 'Never';
  const cpaCount = settings ? settings.getRange('B3').getValue() : 0;
  const tabCount = ss.getSheets().length;

  // Count open CPA questions
  let openQs = 0;
  const cpaSheet = ss.getSheetByName('CPA Questions');
  if (cpaSheet && cpaSheet.getLastRow() > 1) {
    const statuses = cpaSheet.getRange(2, 8, cpaSheet.getLastRow() - 1, 1).getValues().flat();
    openQs = statuses.filter(s => s === 'Open' || s === 'Pending CPA').length;
  }

  const html = `
    <style>
      body { font-family: Calibri, Arial, sans-serif; padding: 16px; color: #333; }
      h2 { color: #1B2A4A; margin-bottom: 4px; }
      .subtitle { color: #666; font-size: 12px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 6px 8px; border-bottom: 1px solid #E0E0E0; font-size: 13px; }
      td:first-child { font-weight: bold; color: #1B2A4A; width: 45%; }
      .footer { margin-top: 16px; font-size: 11px; color: #999; text-align: center; }
    </style>
    <h2>Wimberly Unified Master Register</h2>
    <div class="subtitle">A Provident Private Creditor Revocable Living Trust</div>
    <table>
      <tr><td>Trust EIN</td><td>41-6809588</td></tr>
      <tr><td>Trustee</td><td>Clinton Wimberly IV</td></tr>
      <tr><td>CAF Number</td><td>0317-17351</td></tr>
      <tr><td>Active Year</td><td>${year}</td></tr>
      <tr><td>Total Tabs</td><td>${tabCount}</td></tr>
      <tr><td>Last Gap Scan</td><td>${lastScan}</td></tr>
      <tr><td>CPA Questions</td><td>${cpaCount} total / ${openQs} open</td></tr>
    </table>
    <div class="footer">TMAR Tools v1.0 — Generated with Claude Code</div>
  `;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(380).setHeight(340);
  SpreadsheetApp.getUi().showModalDialog(output, 'Workbook Info');
}


function showHelpDialog() {
  const html = `
    <style>
      body { font-family: Calibri, Arial, sans-serif; padding: 16px; color: #333; font-size: 13px; }
      h2 { color: #1B2A4A; font-size: 16px; }
      h3 { color: #2E7D32; font-size: 14px; margin-top: 14px; margin-bottom: 4px; }
      p { margin: 4px 0; }
      .section { margin-bottom: 12px; }
    </style>
    <h2>TMAR Tools — Help</h2>

    <div class="section">
      <h3>Year Settings</h3>
      <p><b>Set Active Year:</b> Changes all title headers and tax bracket calculations to the selected year (2024–2030). Underlying data is not modified.</p>
      <p><b>Reset to Current Year:</b> Reverts all year references back to the current calendar year.</p>
    </div>

    <div class="section">
      <h3>Data Gap Scanner</h3>
      <p><b>Run Full Scan:</b> Checks all 13 data tabs for missing/empty required fields. Results are written to a "Gap Report" tab with severity ratings.</p>
      <p><b>Scan Current Tab:</b> Scans only the currently active tab.</p>
      <p><b>Email Gap Report:</b> Sends the last scan results to your email.</p>
    </div>

    <div class="section">
      <h3>CPA Questions</h3>
      <p><b>Add New Question:</b> Opens a form to log a question for your CPA. Auto-generates a Q-ID.</p>
      <p><b>Meeting Prep:</b> Generates a printable summary of all open questions grouped by category — ready for your CPA meeting.</p>
    </div>

    <div class="section">
      <h3>Import Tools</h3>
      <p><b>CSV Transactions:</b> Upload a CSV file to append rows to the Transaction Ledger.</p>
      <p><b>Add Account:</b> Adds a new row to Master Register with auto-generated MR-xxx ID.</p>
      <p><b>Add Obligation/Subscription:</b> Appends entries to Household Obligations or Subscriptions & Services.</p>
    </div>

    <div class="section">
      <h3>Formatting</h3>
      <p>Reapply Google Sheets-native formatting that doesn't survive .xlsx upload: tab colors, dropdowns, conditional formatting, filters, and header protection.</p>
    </div>
  `;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(500).setHeight(520);
  SpreadsheetApp.getUi().showModalDialog(output, 'Help & Documentation');
}


// ═══════════════════════════════════════════════════════════════════════════
// YEAR SELECTOR
// ═══════════════════════════════════════════════════════════════════════════

const TAX_BRACKETS_ = {
  // ── Pre-TCJA era (7 brackets: 10%, 15%, 25%, 28%, 33%, 35%, 39.6%) ──
  2016: {
    standard_deduction_mfj: 12600,
    brackets: [
      { limit: 18550, rate: 0.10 },
      { limit: 75300, rate: 0.15 },
      { limit: 151900, rate: 0.25 },
      { limit: 231450, rate: 0.28 },
      { limit: 413350, rate: 0.33 },
      { limit: 466950, rate: 0.35 },
      { limit: Infinity, rate: 0.396 }
    ],
    nc_rate: 0.0560
  },
  2017: {
    standard_deduction_mfj: 12700,
    brackets: [
      { limit: 18650, rate: 0.10 },
      { limit: 75900, rate: 0.15 },
      { limit: 153100, rate: 0.25 },
      { limit: 233350, rate: 0.28 },
      { limit: 416700, rate: 0.33 },
      { limit: 470700, rate: 0.35 },
      { limit: Infinity, rate: 0.396 }
    ],
    nc_rate: 0.0560
  },
  // ── TCJA era (7 brackets: 10%, 12%, 22%, 24%, 32%, 35%, 37%) ──
  2018: {
    standard_deduction_mfj: 24000,
    brackets: [
      { limit: 19050, rate: 0.10 },
      { limit: 77400, rate: 0.12 },
      { limit: 165000, rate: 0.22 },
      { limit: 315000, rate: 0.24 },
      { limit: 400000, rate: 0.32 },
      { limit: 600000, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    nc_rate: 0.05499
  },
  2019: {
    standard_deduction_mfj: 24400,
    brackets: [
      { limit: 19400, rate: 0.10 },
      { limit: 78950, rate: 0.12 },
      { limit: 168400, rate: 0.22 },
      { limit: 321450, rate: 0.24 },
      { limit: 408200, rate: 0.32 },
      { limit: 612350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    nc_rate: 0.0525
  },
  2020: {
    standard_deduction_mfj: 24800,
    brackets: [
      { limit: 19750, rate: 0.10 },
      { limit: 80250, rate: 0.12 },
      { limit: 171050, rate: 0.22 },
      { limit: 326600, rate: 0.24 },
      { limit: 414700, rate: 0.32 },
      { limit: 622050, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    nc_rate: 0.0525
  },
  2021: {
    standard_deduction_mfj: 25100,
    brackets: [
      { limit: 19900, rate: 0.10 },
      { limit: 81050, rate: 0.12 },
      { limit: 172750, rate: 0.22 },
      { limit: 329850, rate: 0.24 },
      { limit: 418850, rate: 0.32 },
      { limit: 628300, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    nc_rate: 0.0525
  },
  2022: {
    standard_deduction_mfj: 25900,
    brackets: [
      { limit: 20550, rate: 0.10 },
      { limit: 83550, rate: 0.12 },
      { limit: 178150, rate: 0.22 },
      { limit: 340100, rate: 0.24 },
      { limit: 431900, rate: 0.32 },
      { limit: 647850, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    nc_rate: 0.0499
  },
  2023: {
    standard_deduction_mfj: 27700,
    brackets: [
      { limit: 22000, rate: 0.10 },
      { limit: 89450, rate: 0.12 },
      { limit: 190750, rate: 0.22 },
      { limit: 364200, rate: 0.24 },
      { limit: 462500, rate: 0.32 },
      { limit: 693750, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    nc_rate: 0.0475
  },
  // ── Current/future years ──
  2024: {
    standard_deduction_mfj: 29200,
    brackets: [
      { limit: 23200, rate: 0.10 },
      { limit: 94300, rate: 0.12 },
      { limit: 201050, rate: 0.22 },
      { limit: 383900, rate: 0.24 },
      { limit: 487450, rate: 0.32 },
      { limit: 731200, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    nc_rate: 0.0475
  },
  2025: {
    standard_deduction_mfj: 30000,
    brackets: [
      { limit: 23200, rate: 0.10 },
      { limit: 94300, rate: 0.12 },
      { limit: 201050, rate: 0.22 },
      { limit: 383900, rate: 0.24 },
      { limit: 487450, rate: 0.32 },
      { limit: 731200, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    nc_rate: 0.045
  },
  2026: {
    standard_deduction_mfj: 30700,
    brackets: [
      { limit: 23850, rate: 0.10 },
      { limit: 96950, rate: 0.12 },
      { limit: 206700, rate: 0.22 },
      { limit: 394600, rate: 0.24 },
      { limit: 501050, rate: 0.32 },
      { limit: 751600, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    nc_rate: 0.045
  }
};


function showYearSelector() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = ensureSettingsSheet_();
  const currentYear = settings.getRange('B1').getValue() || DEFAULT_YEAR_;

  // Gather years from all three data sources
  const yearsWithFinancialData = getYearsWithData_();        // _YearData sheet (full W-2/income)
  const yearsWithDocuments = getYearsFromDocRegistry_();      // Document Registry col D
  const yearsWithBrackets = Object.keys(TAX_BRACKETS_).map(Number);  // TAX_BRACKETS_ keys

  // Merge into sorted unique set — only years that appear in at least one source
  const allYearsSet = new Set([
    ...yearsWithFinancialData,
    ...yearsWithDocuments,
    ...yearsWithBrackets
  ]);
  const allYears = Array.from(allYearsSet).sort();

  // Build option HTML with 3-tier classification
  const optionsHtml = allYears.map(y => {
    const hasFinancial = yearsWithFinancialData.indexOf(y) >= 0;
    const hasDocs = yearsWithDocuments.indexOf(y) >= 0;
    const hasBrackets = TAX_BRACKETS_[y] !== undefined;

    var icon, suffix;
    if (hasFinancial) {
      icon = '\u2705';       // green checkmark
      suffix = ' (full financial data)';
    } else if (hasDocs) {
      icon = '\uD83D\uDCC4'; // page facing up
      suffix = ' (documents on file)';
    } else if (hasBrackets) {
      icon = '\u26A0\uFE0F'; // warning sign
      suffix = ' (tax brackets only)';
    } else {
      icon = '\u2796';       // heavy minus
      suffix = ' (no data)';
    }

    return '<option value="' + y + '"' +
      (y == currentYear ? ' selected' : '') +
      '>' + icon + ' ' + y + suffix + '</option>';
  }).join('');

  const html = `
    <style>
      body { font-family: Calibri, Arial, sans-serif; padding: 20px; color: #333; }
      h3 { color: #1B2A4A; margin-bottom: 12px; }
      select { width: 100%; padding: 8px; font-size: 14px; margin-bottom: 16px;
               border: 1px solid #CCC; border-radius: 4px; }
      .btn { padding: 10px 24px; font-size: 14px; border: none;
             border-radius: 4px; cursor: pointer; margin-right: 8px; }
      .btn-primary { background: #1B2A4A; color: white; }
      .btn-secondary { background: #E0E0E0; color: #333; }
      .note { font-size: 11px; color: #888; margin-top: 12px; }
      .legend { font-size: 12px; color: #555; margin-bottom: 12px; line-height: 1.8; }
    </style>
    <h3>Set Active Year</h3>
    <p>Select the fiscal year:</p>
    <select id="yearSelect">${optionsHtml}</select>
    <div class="legend">
      \u2705 Full financial data (W-2, income, tax calcs)<br>
      \uD83D\uDCC4 Documents on file (no W-2 data loaded)<br>
      \u26A0\uFE0F Tax brackets only (no data or docs)
    </div>
    <div>
      <button class="btn btn-primary" onclick="submitYear()">Apply</button>
      <button class="btn btn-secondary" onclick="google.script.host.close()">Cancel</button>
    </div>
    <div class="note">Updates: titles, tax brackets, and financial values (if available for selected year).</div>
    <script>
      function submitYear() {
        var year = document.getElementById('yearSelect').value;
        document.querySelector('.btn-primary').textContent = 'Applying...';
        document.querySelector('.btn-primary').disabled = true;
        google.script.run.withSuccessHandler(function() {
          google.script.host.close();
        }).setActiveYear(Number(year));
      }
    </script>
  `;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(440).setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(output, 'Year Settings');
}


/**
 * Returns an array of years that have data in _YearData sheet.
 */
function getYearsWithData_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('_YearData');
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const years = new Set();
  for (let i = 1; i < data.length; i++) {
    const y = Number(data[i][0]);
    if (y > 0) years.add(y);
  }
  return Array.from(years).sort();
}


/**
 * Returns a sorted array of unique years found in the Document Registry tab
 * (column D = "Tax Year", data starts row 3). These are years where the user
 * has documents on file but may not have full financial data in _YearData.
 */
function getYearsFromDocRegistry_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = ss.getSheetByName('Document Registry');
  if (!regSheet || regSheet.getLastRow() < 3) return [];

  // Column D (index 4) is "Tax Year", data starts at row 3
  const data = regSheet.getRange(3, 4, regSheet.getLastRow() - 2, 1).getValues();
  const years = new Set();
  for (const row of data) {
    const y = Number(row[0]);
    if (y >= 2010 && y <= 2030) years.add(y);
  }
  return Array.from(years).sort();
}


function setActiveYear(year) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = ensureSettingsSheet_();
  const oldYear = settings.getRange('B1').getValue() || DEFAULT_YEAR_;

  // Determine data tier for this year
  const yearData = loadYearData_(Number(year));
  const docsExist = getYearsFromDocRegistry_().indexOf(Number(year)) >= 0;
  const hasBrackets = TAX_BRACKETS_[Number(year)] !== undefined;

  if (yearData) {
    ss.toast('Loading ' + year + ' financial data...', 'Year Settings', 3);
  } else if (docsExist && hasBrackets) {
    ss.toast(year + ': Documents on file \u2014 clearing old data, updating labels and tax brackets.', 'Year Settings', 5);
  } else if (docsExist) {
    ss.toast(year + ': Documents on file \u2014 clearing old data, updating labels only.', 'Year Settings', 5);
  } else if (hasBrackets) {
    ss.toast(year + ': Tax brackets only \u2014 clearing old data, updating labels and brackets.', 'Year Settings', 5);
  } else {
    ss.toast('No data available for ' + year + ' \u2014 clearing old values.', 'Year Settings', 5);
  }

  // ALWAYS apply year data — pass empty dict {} if no data so apply functions clear old values
  applyYearDataToSheets_(yearData || {}, Number(year));

  // Update display labels (title text replacements)
  updateYearReferences_(String(oldYear), String(year));

  // Save active year
  settings.getRange('B1').setValue(year);

  let msg;
  if (yearData) {
    msg = 'Year switched to ' + year + ' \u2014 full financial data applied';
  } else if (docsExist) {
    msg = 'Year switched to ' + year + ' \u2014 documents on file, labels' + (hasBrackets ? ' and brackets' : '') + ' updated';
  } else {
    msg = 'Year switched to ' + year + ' \u2014 labels' + (hasBrackets ? ' and tax brackets' : '') + ' updated';
  }
  ss.toast(msg, 'Year Settings', 5);
}


function showCurrentYear() {
  const settings = ensureSettingsSheet_();
  const year = settings.getRange('B1').getValue() || DEFAULT_YEAR_;
  SpreadsheetApp.getUi().alert('Active Year: ' + year);
}


function resetToDefaultYear() {
  setActiveYear(DEFAULT_YEAR_);
}


/**
 * Show diagnostic dashboard for year data completeness.
 * Displays which years have data in each category and what's missing.
 */
function showDataCompletenessDashboard() {
  const yearsWithFinancialData = getYearsWithData_();
  const yearsWithDocuments = getYearsFromDocRegistry_();
  const yearsWithBrackets = Object.keys(TAX_BRACKETS_).map(Number);

  // Get all unique years
  const allYearsSet = new Set([
    ...yearsWithFinancialData,
    ...yearsWithDocuments,
    ...yearsWithBrackets
  ]);
  const allYears = Array.from(allYearsSet).sort((a, b) => b - a); // descending

  // Analyze data completeness for each year
  const yearAnalysis = {};
  for (const year of allYears) {
    const yearData = loadYearData_(Number(year));
    const analysis = {
      hasW2: false,
      hasBOA: false,
      hasPNC: false,
      hasHH: false,
      hasDocs: yearsWithDocuments.indexOf(year) >= 0,
      hasBrackets: TAX_BRACKETS_[year] !== undefined,
      totalFields: yearData ? Object.keys(yearData).length : 0
    };

    if (yearData) {
      // Check for W-2/tax/income data
      analysis.hasW2 = Object.keys(yearData).some(k =>
        k.startsWith('w2_') || k.startsWith('tax.') || k.startsWith('income.')
      );

      // Check for BOA cash flow data (sentinel: boa.jan.deposits)
      analysis.hasBOA = yearData['boa.jan.deposits'] !== undefined &&
                        yearData['boa.jan.deposits'] !== '';

      // Check for PNC cash flow data (sentinel: pnc.jan.deposits)
      analysis.hasPNC = yearData['pnc.jan.deposits'] !== undefined &&
                        yearData['pnc.jan.deposits'] !== '';

      // Check for Household Obligations data
      analysis.hasHH = Object.keys(yearData).some(k => k.startsWith('hh.'));
    }

    yearAnalysis[year] = analysis;
  }

  // Build HTML
  let html = `
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #333; }
      h2 { color: #1B2A4A; font-size: 18px; margin-bottom: 8px; }
      .subtitle { color: #666; font-size: 12px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th { background: #1B2A4A; color: white; padding: 10px 8px; text-align: left;
           font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
      td { padding: 8px; border-bottom: 1px solid #E0E0E0; font-size: 13px; }
      .year-col { font-weight: bold; color: #1B2A4A; width: 60px; }
      .status-col { text-align: center; font-size: 16px; width: 50px; }
      .total-col { text-align: right; color: #666; font-size: 12px; width: 70px; }
      .legend { margin-top: 20px; padding: 12px; background: #F5F5F5; border-radius: 4px; font-size: 12px; }
      .legend-item { margin: 4px 0; }
      .missing { background: #FFEBEE; }
      .partial { background: #FFF8E1; }
      .complete { background: #E8F5E9; }
      .footer { margin-top: 16px; font-size: 11px; color: #999; text-align: center; }
    </style>
    <h2>Year Data Completeness Diagnostic</h2>
    <div class="subtitle">Shows which financial data exists for each tax year</div>
    <table>
      <tr>
        <th>Year</th>
        <th>W-2 / Tax</th>
        <th>BOA Cash</th>
        <th>PNC Cash</th>
        <th>H/H Oblig.</th>
        <th>Documents</th>
        <th>Brackets</th>
        <th>Total Fields</th>
      </tr>
  `;

  for (const year of allYears) {
    const a = yearAnalysis[year];
    const rowClass = a.totalFields === 0 ? 'missing' :
                     (a.hasW2 && a.hasBOA && a.hasPNC && a.hasHH) ? 'complete' : 'partial';

    html += `
      <tr class="${rowClass}">
        <td class="year-col">${year}</td>
        <td class="status-col">${a.hasW2 ? '✓' : '—'}</td>
        <td class="status-col">${a.hasBOA ? '✓' : '—'}</td>
        <td class="status-col">${a.hasPNC ? '✓' : '—'}</td>
        <td class="status-col">${a.hasHH ? '✓' : '—'}</td>
        <td class="status-col">${a.hasDocs ? '📄' : '—'}</td>
        <td class="status-col">${a.hasBrackets ? '✓' : '—'}</td>
        <td class="total-col">${a.totalFields} fields</td>
      </tr>
    `;
  }

  html += `
    </table>
    <div class="legend">
      <div class="legend-item"><b>Legend:</b></div>
      <div class="legend-item">✓ = Data exists | 📄 = Documents on file | — = Missing</div>
      <div class="legend-item" style="margin-top: 8px;"><b>Row Colors:</b></div>
      <div class="legend-item">🟢 Green = Complete (all data categories) | 🟡 Yellow = Partial | 🔴 Red = No data</div>
      <div class="legend-item" style="margin-top: 8px;"><b>Data Sources:</b></div>
      <div class="legend-item">• <b>W-2/Tax:</b> W-2 wages, tax calculations, income sources</div>
      <div class="legend-item">• <b>BOA Cash:</b> Monthly cash flow (BOA account 6198)</div>
      <div class="legend-item">• <b>PNC Cash:</b> Monthly cash flow (PNC account 0672)</div>
      <div class="legend-item">• <b>H/H Oblig.:</b> Household Obligations vendor data</div>
      <div class="legend-item">• <b>Documents:</b> Tax documents in Document Registry</div>
      <div class="legend-item">• <b>Brackets:</b> Tax bracket lookup tables</div>
    </div>
    <div class="footer">TMAR Tools — Data Completeness Diagnostic</div>
  `;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(720).setHeight(550);
  SpreadsheetApp.getUi().showModalDialog(output, 'Year Data Completeness');
}


// ─── YEAR DATA ARCHIVE: LOAD & APPLY ─────────────────────────────────────────

/**
 * Load financial data for a given year from the _YearData hidden sheet.
 * Returns an object {key: value, ...} or null if no data for that year.
 */
function loadYearData_(year) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('_YearData');
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return null; // Only header or empty

  const result = {};
  let found = false;
  for (let i = 1; i < data.length; i++) {
    const rowYear = Number(data[i][0]);
    const key = data[i][1];
    const value = data[i][2];
    if (rowYear === year && key) {
      result[key] = value;
      found = true;
    }
  }
  return found ? result : null;
}


/**
 * Apply year-specific financial data to visible sheets.
 * Uses label-driven cell lookup (scans column A for known text, writes to adjacent columns).
 */
function applyYearDataToSheets_(d, year) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── EXECUTIVE DASHBOARD ──
  applyToExecDashboard_(ss, d);

  // ── W-2 & INCOME DETAIL ──
  applyToW2Detail_(ss, d, year);

  // ── TAX STRATEGY ──
  applyToTaxStrategy_(ss, d, year);

  // ── BOA CASH FLOW ──
  applyToBOACashFlow_(ss, d);

  // ── PNC CASH FLOW ──
  applyToPNCCashFlow_(ss, d);

  // ── HOUSEHOLD OBLIGATIONS ──
  applyToHouseholdObligations_(ss, d);

  Logger.log('Year data applied to sheets for year ' + year);
}


/**
 * Update Executive Dashboard income summary and tax outcome rows.
 */
function applyToExecDashboard_(ss, d) {
  const sheet = ss.getSheetByName('Executive Dashboard');
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  const colA = sheet.getRange('A1:A' + lastRow).getValues().flat();

  // Income Summary section — find rows by label in column A, write to cols B (Clinton), C (Syrina), D (Combined)
  const incomeMap = {
    'W-2 Wages (Box 1)':             [d['w2_clinton.wages'],       d['w2_syrina.wages'],       d['tax.combined_agi']],
    'Federal Tax Withheld (Box 2)':   [d['w2_clinton.fed_withheld'], d['w2_syrina.fed_withheld'], d['tax.fed_withheld_total']],
    'Social Security Wages (Box 3)':  [d['w2_clinton.ss_wages'],    d['w2_syrina.ss_wages'],    (Number(d['w2_clinton.ss_wages']||0) + Number(d['w2_syrina.ss_wages']||0))],
    'Social Security Tax (Box 4)':    [d['w2_clinton.ss_tax'],      d['w2_syrina.ss_tax'],      (Number(d['w2_clinton.ss_tax']||0) + Number(d['w2_syrina.ss_tax']||0))],
    'Medicare Wages (Box 5)':         [d['w2_clinton.medicare_wages'], d['w2_syrina.medicare_wages'], (Number(d['w2_clinton.medicare_wages']||0) + Number(d['w2_syrina.medicare_wages']||0))],
    'Medicare Tax (Box 6)':           [d['w2_clinton.medicare_tax'], d['w2_syrina.medicare_tax'], (Number(d['w2_clinton.medicare_tax']||0) + Number(d['w2_syrina.medicare_tax']||0))],
    'State Wages (Box 16)':           [d['w2_clinton.nc_wages'],    d['w2_syrina.nc_wages'],    (Number(d['w2_clinton.nc_wages']||0) + Number(d['w2_syrina.nc_wages']||0))],
    'State Tax Withheld (Box 17)':    [d['w2_clinton.nc_tax'],      d['w2_syrina.nc_tax'],      d['tax.nc_withheld_total']],
  };

  for (let i = 0; i < colA.length; i++) {
    const label = String(colA[i]).trim();
    if (incomeMap[label]) {
      const vals = incomeMap[label];
      sheet.getRange(i + 1, 2).setValue(Number(vals[0]) || 0);
      sheet.getRange(i + 1, 3).setValue(Number(vals[1]) || 0);
      sheet.getRange(i + 1, 4).setValue(Number(vals[2]) || 0);
    }
  }

  // Tax Outcome section — column A label, column B amount
  const taxMap = {
    'Combined AGI':           d['tax.combined_agi'],
    'Standard Deduction (MFJ)': d['tax.standard_deduction'],
    'Taxable Income':         d['tax.taxable_income'],
    'Federal Tax Owed':       d['tax.fed_tax_total'],
    'Federal Tax Withheld':   d['tax.fed_withheld_total'],
    'Est. Federal Refund':    d['tax.fed_refund'],
    'NC Tax Withheld':        d['tax.nc_withheld_total'],
    'Est. NC Refund':         d['tax.nc_refund'],
  };

  // NC Tax Owed label varies (contains the rate percentage)
  const ncRate = Number(d['tax.nc_rate'] || 0);
  const ncRateStr = (ncRate * 100).toFixed(1) + '%';

  for (let i = 0; i < colA.length; i++) {
    const label = String(colA[i]).trim();
    if (taxMap[label] !== undefined) {
      sheet.getRange(i + 1, 2).setValue(Number(taxMap[label]) || 0);
    }
    // Handle "NC Tax Owed (X.X%)" — match partial
    if (label.startsWith('NC Tax Owed')) {
      sheet.getRange(i + 1, 1).setValue('NC Tax Owed (' + ncRateStr + ')');
      sheet.getRange(i + 1, 2).setValue(Number(d['tax.nc_tax_liability']) || 0);
    }
  }

  Logger.log('Executive Dashboard updated with year data');
}


/**
 * Update W-2 & Income Detail tab with year-specific W-2 box values.
 */
function applyToW2Detail_(ss, d, year) {
  const sheet = ss.getSheetByName('W-2 & Income Detail');
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  const colA = sheet.getRange('A1:A' + lastRow).getValues().flat();
  const colB = sheet.getRange('B1:B' + lastRow).getValues().flat();

  // Clinton W-2 boxes — find by Box number in col A + description in col B
  // Clinton section starts at row 3 (row 1 = header, row 2 = column headers)
  // We look for rows where col A has box number and col B has description
  const clintonBoxMap = {
    'Wages, tips, other compensation':   d['w2_clinton.wages'],
    'Federal income tax withheld':       d['w2_clinton.fed_withheld'],
    'Social security wages':             d['w2_clinton.ss_wages'],
    'Social security tax withheld':      d['w2_clinton.ss_tax'],
    'Medicare wages and tips':           d['w2_clinton.medicare_wages'],
    'Medicare tax withheld':             d['w2_clinton.medicare_tax'],
    'State wages':                       d['w2_clinton.nc_wages'],
    'State income tax':                  d['w2_clinton.nc_tax'],
  };

  // Syrina section comes after Clinton — we track which section we're in
  let inSyrinaSection = false;
  const syrinaBoxMap = {
    'Wages, tips, other compensation':   d['w2_syrina.wages'],
    'Federal income tax withheld':       d['w2_syrina.fed_withheld'],
    'Social security wages':             d['w2_syrina.ss_wages'],
    'Social security tax withheld':      d['w2_syrina.ss_tax'],
    'Medicare wages and tips':           d['w2_syrina.medicare_wages'],
    'Medicare tax withheld':             d['w2_syrina.medicare_tax'],
    'State wages':                       d['w2_syrina.nc_wages'],
    'State income tax':                  d['w2_syrina.nc_tax'],
  };

  for (let i = 0; i < colA.length; i++) {
    const aVal = String(colA[i]).trim();
    const bVal = String(colB[i]).trim();

    // Detect Syrina section header
    if (aVal.includes('SYRINA') && aVal.includes('W-2')) {
      inSyrinaSection = true;
      continue;
    }

    // Match box descriptions (col B) and write amount (col C)
    if (!inSyrinaSection && clintonBoxMap[bVal] !== undefined) {
      sheet.getRange(i + 1, 3).setValue(Number(clintonBoxMap[bVal]) || 0);
    } else if (inSyrinaSection && syrinaBoxMap[bVal] !== undefined) {
      sheet.getRange(i + 1, 3).setValue(Number(syrinaBoxMap[bVal]) || 0);
    }

    // Also update Box 12 codes for Clinton
    if (!inSyrinaSection) {
      if (aVal === '12a') {
        const code12a = d['w2_clinton.box_12a_code'] || '';
        const amt12a = Number(d['w2_clinton.box_12a_amt']) || 0;
        sheet.getRange(i + 1, 2).setValue('Code ' + code12a + (code12a === 'DD' ? ' - Health coverage cost' : code12a === 'AA' ? ' - Roth 401(k)' : ''));
        sheet.getRange(i + 1, 3).setValue(amt12a);
      }
      if (aVal === '12b') {
        const code12b = d['w2_clinton.box_12b_code'] || '';
        const amt12b = Number(d['w2_clinton.box_12b_amt']) || 0;
        sheet.getRange(i + 1, 2).setValue('Code ' + code12b + (code12b === 'W' ? ' - HSA contribution' : code12b === 'D' ? ' - 401(k) deferral' : ''));
        sheet.getRange(i + 1, 3).setValue(amt12b);
      }
    }
  }

  // Update income source rows if present
  for (let i = 0; i < colA.length; i++) {
    const label = String(colA[i]).trim();
    if (label.includes('INTER TECHNOLOGIES') && label.includes('Salary')) {
      sheet.getRange(i + 1, 4).setValue(Number(d['income.clinton_salary']) || 0);
    }
    if (label.includes('Boys & Girls Club') || label.includes('BGC Wayne')) {
      const bVal = String(colB[i]).trim();
      if (typeof Number(bVal) === 'number' || bVal === '') {
        // This is the income row
        sheet.getRange(i + 1, 1).setValue(String(d['income.syrina_employer'] || 'Boys & Girls Club Wayne'));
        sheet.getRange(i + 1, 2).setValue(Number(d['income.syrina_salary']) || 0);
        sheet.getRange(i + 1, 4).setValue(Number(d['income.syrina_salary']) || 0);
      }
    }
  }

  Logger.log('W-2 & Income Detail updated with year data');
}


/**
 * Update Tax Strategy tab — federal and NC calculations.
 */
function applyToTaxStrategy_(ss, d, year) {
  const sheet = ss.getSheetByName('Tax Strategy');
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  const colA = sheet.getRange('A1:A' + lastRow).getValues().flat();

  // Federal tax calculation rows — col A label, col B amount
  const fedMap = {
    'Line 1a: Wages (Clint':            d['w2_clinton.wages'],
    'Line 1a: Wages (Syrina':           d['w2_syrina.wages'],
    'Combined Gross Income':            d['tax.combined_agi'],
    'Adjusted Gross Income (AGI)':      d['tax.combined_agi'],
    'Taxable Income':                   d['tax.taxable_income'],
    'Total Federal Tax Liability':      d['tax.fed_tax_total'],
    'Total Federal Withheld (Clinton)': d['w2_clinton.fed_withheld'],
    'Total Federal Withheld (Syrina)':  d['w2_syrina.fed_withheld'],
    'Combined Federal Withheld':        d['tax.fed_withheld_total'],
    'ESTIMATED FEDERAL REFUND':         d['tax.fed_refund'],
  };

  // NC tax rows
  const ncMap = {
    'NC Taxable Income':                d['tax.taxable_income'],
    'NC Tax Liability':                 null, // calculated below
    'Adjusted NC Tax':                  d['tax.nc_tax_liability'],
    'NC Tax Withheld (Clinton)':        d['w2_clinton.nc_tax'],
    'NC Tax Withheld (Syrina)':         d['w2_syrina.nc_tax'],
    'Combined NC Withheld':             d['tax.nc_withheld_total'],
    'ESTIMATED NC REFUND':              d['tax.nc_refund'],
  };

  // Calculate NC Tax Liability (taxable income × rate)
  const ncRate = Number(d['tax.nc_rate'] || 0.045);
  const taxableIncome = Number(d['tax.taxable_income'] || 0);
  const ncTaxLiability = Math.round(taxableIncome * ncRate * 100) / 100;
  ncMap['NC Tax Liability'] = ncTaxLiability;

  for (let i = 0; i < colA.length; i++) {
    const label = String(colA[i]).trim();

    // Federal matches (some use startsWith for partial match)
    for (const [key, value] of Object.entries(fedMap)) {
      if (value !== undefined && value !== null && label.startsWith(key)) {
        sheet.getRange(i + 1, 2).setValue(Number(value) || 0);
        break;
      }
    }

    // Standard Deduction with year
    if (label.includes('Standard Deduction (MFJ')) {
      sheet.getRange(i + 1, 1).setValue('Standard Deduction (MFJ ' + year + ')');
      sheet.getRange(i + 1, 2).setValue(Number(d['tax.standard_deduction']) || 0);
    }

    // Federal bracket rows — update amounts from year data
    if (label.includes('Federal Tax (10%')) {
      sheet.getRange(i + 1, 2).setValue(Number(d['tax.fed_tax_10pct']) || 0);
    }
    if (label.includes('Federal Tax (12%')) {
      sheet.getRange(i + 1, 2).setValue(Number(d['tax.fed_tax_12pct']) || 0);
    }

    // NC matches
    for (const [key, value] of Object.entries(ncMap)) {
      if (value !== undefined && value !== null && label === key) {
        sheet.getRange(i + 1, 2).setValue(Number(value) || 0);
        break;
      }
    }

    // NC Tax Rate row — update the percentage text
    if (label.includes('NC Tax Rate')) {
      const rateStr = (ncRate * 100).toFixed(2) + '%';
      sheet.getRange(i + 1, 2).setValue(rateStr);
    }
  }

  Logger.log('Tax Strategy updated with year data');
}


/**
 * Apply year-specific BOA Cash Flow data from _YearData.
 * Writes monthly cash flow values (rows 3-14) and Zelle breakdown.
 * Keys: boa.{month}.{field}
 */
function applyToBOACashFlow_(ss, d) {
  const sheet = ss.getSheetByName('BOA Cash Flow');
  if (!sheet) return;

  // Fix account number if still showing old PNC number
  const titleCell = sheet.getRange('A1');
  const title = titleCell.getValue();
  if (typeof title === 'string' && title.includes('0672')) {
    titleCell.setValue(title.replace('0672', '6198'));
  }

  const months = ['jan','feb','mar','apr','may','jun',
                  'jul','aug','sep','oct','nov','dec'];
  const fields = [
    'beginning_balance',   // col B
    'deposits',            // col C
    'debits',              // col D
    'fees',                // col E
    'ending_balance',      // col F
    'net_change',          // col G
    'zelle_to_syrina'      // col H
  ];

  // CLEAR main cash flow grid (rows 3-14, cols B-H) — always clear before write
  sheet.getRange(3, 2, 12, fields.length).clearContent();

  // Find and CLEAR Zelle breakdown section
  const lastRow = sheet.getLastRow();
  const colA = sheet.getRange('A1:A' + lastRow).getValues().flat();
  let zelleDataStart = 0;
  for (let i = 0; i < colA.length; i++) {
    if (String(colA[i]).includes('TRANSFERS TO SYRINA')) {
      zelleDataStart = i + 3;  // header row + sub-header row + 1 for first data row
      break;
    }
  }
  if (zelleDataStart > 0) {
    sheet.getRange(zelleDataStart, 2, 12, 3).clearContent();
  }

  // Check sentinel — if no BOA data for this year, we're done (grid already cleared)
  const testKey = 'boa.jan.deposits';
  if (d[testKey] === undefined || d[testKey] === '') {
    Logger.log('No BOA Cash Flow data — cleared old values');
    return;
  }

  // Write main cash flow grid (rows 3-14, cols B-H)
  for (let m = 0; m < 12; m++) {
    const row = m + 3;  // Rows 3-14 = Jan-Dec
    for (let f = 0; f < fields.length; f++) {
      const key = 'boa.' + months[m] + '.' + fields[f];
      if (d[key] !== undefined && d[key] !== '') {
        sheet.getRange(row, f + 2).setValue(Number(d[key]) || 0);
      }
    }
  }

  // Write Zelle/Assurant breakdown
  if (zelleDataStart > 0) {
    const zelleFields = ['zelle_transfers', 'assurant', 'transfers_total'];
    for (let m = 0; m < 12; m++) {
      const row = zelleDataStart + m;
      for (let f = 0; f < zelleFields.length; f++) {
        const key = 'boa.' + months[m] + '.' + zelleFields[f];
        if (d[key] !== undefined && d[key] !== '') {
          sheet.getRange(row, f + 2).setValue(Number(d[key]) || 0);
        }
      }
    }
  }

  Logger.log('BOA Cash Flow updated with year data');
}


/**
 * Apply year-specific PNC Cash Flow data from _YearData.
 * Same pattern as BOA but with 6 fields (no Zelle section).
 * Keys: pnc.{month}.{field}
 */
function applyToPNCCashFlow_(ss, d) {
  const sheet = ss.getSheetByName('PNC Cash Flow');
  if (!sheet) return;

  const months = ['jan','feb','mar','apr','may','jun',
                  'jul','aug','sep','oct','nov','dec'];
  const fields = [
    'beginning_balance',   // col B
    'deposits',            // col C
    'debits',              // col D
    'fees',                // col E
    'ending_balance',      // col F
    'net_change'           // col G
  ];

  // CLEAR data grid (rows 3-14, cols B-G) — always clear before write
  sheet.getRange(3, 2, 12, fields.length).clearContent();

  // Check sentinel — if no PNC data for this year, we're done (grid already cleared)
  const testKey = 'pnc.jan.deposits';
  if (d[testKey] === undefined || d[testKey] === '') {
    Logger.log('No PNC Cash Flow data — cleared old values');
    return;
  }

  // Write main cash flow grid (rows 3-14, cols B-G)
  for (let m = 0; m < 12; m++) {
    const row = m + 3;  // Rows 3-14 = Jan-Dec
    for (let f = 0; f < fields.length; f++) {
      const key = 'pnc.' + months[m] + '.' + fields[f];
      if (d[key] !== undefined && d[key] !== '') {
        sheet.getRange(row, f + 2).setValue(Number(d[key]) || 0);
      }
    }
  }

  Logger.log('PNC Cash Flow updated with year data');
}


/**
 * Apply year-specific Household Obligations data from _YearData.
 * Matches vendor names in column A and writes monthly amount to column D
 * and status to column H.
 */
function applyToHouseholdObligations_(ss, d) {
  const sheet = ss.getSheetByName('Household Obligations');
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  const colA = sheet.getRange('A1:A' + lastRow).getValues().flat();

  const vendorMap = {
    'Rent':                'rent',
    'Duke Energy':         'electric',
    'T-Mobile':            'cell',
    'Spectrum':            'internet',
    'Piedmont Natural Gas':'gas',
    'Lawn Care':           'lawn',
    'Nelnet':              'nelnet',
    'OneMain Financial':   'onemain',
    'GEICO':               'geico',
    'National Life':       'life_ins',
    'Planet Fitness':      'planet_fitness',
    'IRS':                 'irs',
    'Milestone':           'milestone',
    'Merrick Bank':        'merrick',
    'Verde Card':          'verde',
    'Credit One':          'creditone',
    'Destiny':             'destiny',
  };

  // CLEAR amount (col D) and status (col H) for all vendor rows — always clear before write
  for (let i = 0; i < colA.length; i++) {
    const label = String(colA[i]).trim();
    for (const [vendorName] of Object.entries(vendorMap)) {
      if (label.includes(vendorName)) {
        sheet.getRange(i + 1, 4).clearContent();  // col D: amount
        sheet.getRange(i + 1, 8).clearContent();  // col H: status
        break;
      }
    }
  }

  // Check sentinel — if no HH data for this year, we're done (cells already cleared)
  const testKey = 'hh.rent.amount';
  if (d[testKey] === undefined || d[testKey] === '') {
    Logger.log('No HH Obligations data — cleared old values');
    return;
  }

  // Write new values
  for (let i = 0; i < colA.length; i++) {
    const label = String(colA[i]).trim();
    for (const [vendorName, vendorKey] of Object.entries(vendorMap)) {
      if (label.includes(vendorName)) {
        const amtKey = 'hh.' + vendorKey + '.amount';
        const statKey = 'hh.' + vendorKey + '.status';
        if (d[amtKey] !== undefined && d[amtKey] !== '') {
          sheet.getRange(i + 1, 4).setValue(Number(d[amtKey]) || 0);  // col D
        }
        if (d[statKey] !== undefined && d[statKey] !== '') {
          sheet.getRange(i + 1, 8).setValue(d[statKey]);  // col H
        }
        break;
      }
    }
  }

  Logger.log('Household Obligations updated with year data');
}


function updateYearReferences_(oldYear, newYear) {
  if (oldYear === newYear) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Sheets and columns to scan for year references — ALL tabs covered
  const scanTargets = {
    // ── Group A: Living Dashboard ──
    'Executive Dashboard':      ['A'],
    'Transaction Ledger':       ['A'],
    'W-2 & Income Detail':      ['A', 'F'],
    'BOA Cash Flow':            ['A', 'H'],
    'PNC Cash Flow':            ['A'],
    'Household Obligations':    ['A', 'I', 'J'],
    'Subscriptions & Services': ['A', 'J'],
    'Tax Strategy':             ['A', 'B', 'D'],

    // ── Group B: Estate Ledger ──
    'Master Register':          ['A', 'B', 'I', 'J', 'Y'],
    'Trust Ledger':             ['A', 'B'],
    '1099 Filing Chain':        ['A', 'B', 'C'],
    'Forms & Authority':        ['A', 'D', 'L'],
    'Proof of Mailing':         ['A', 'B'],
    'Document Inventory':       ['A', 'Q'],
    'Document Registry':        ['A'],
  };

  for (const [sheetName, cols] of Object.entries(scanTargets)) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;
    const lastRow = sheet.getLastRow();
    if (lastRow < 1) continue;

    for (const colLetter of cols) {
      // ── Row 1: handle separately with setValue (merged title cells break bulk setValues) ──
      const cell1 = sheet.getRange(colLetter + '1');
      const val1 = cell1.getValue();
      if (typeof val1 === 'string') {
        let newVal = val1;
        if (newVal.includes(oldYear)) {
          newVal = newVal.split(oldYear).join(newYear);
        } else {
          // Fallback: replace any 4-digit year (20xx) — handles desync when B1 moved ahead of title
          newVal = newVal.replace(/\b(20[1-3]\d)\b/g, newYear);
        }
        if (newVal !== val1) {
          cell1.setValue(newVal);
        }
      }

      // ── Rows 2+: bulk scan with setValues (safe — no merged cells in data rows) ──
      if (lastRow < 2) continue;
      const range = sheet.getRange(colLetter + '2:' + colLetter + lastRow);
      const values = range.getValues();
      let changed = false;

      for (let i = 0; i < values.length; i++) {
        const val = values[i][0];
        if (typeof val === 'string' && val.includes(oldYear)) {
          values[i][0] = val.split(oldYear).join(newYear);
          changed = true;
        }
      }

      if (changed) {
        range.setValues(values);
      }
    }
  }

  // Update tax bracket calculations if data available
  updateTaxBrackets_(Number(newYear));
}


function updateTaxBrackets_(year) {
  const data = TAX_BRACKETS_[year];
  if (!data) return; // No bracket data for this year

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tax Strategy');
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  const colA = sheet.getRange('A1:A' + lastRow).getValues().flat();
  const colB = sheet.getRange('B1:B' + lastRow).getValues().flat();

  // Find and update Standard Deduction row
  for (let i = 0; i < colA.length; i++) {
    if (typeof colA[i] === 'string' && colA[i].includes('Standard Deduction')) {
      // Update label
      sheet.getRange(i + 1, 1).setValue('Standard Deduction (MFJ ' + year + ')');
      // Update amount
      sheet.getRange(i + 1, 2).setValue(data.standard_deduction_mfj);
      break;
    }
  }

  // Find and update bracket rows
  const brackets = data.brackets;
  let bracketIdx = 0;
  for (let i = 0; i < colA.length; i++) {
    if (typeof colA[i] === 'string' && colA[i].includes('Federal Tax (') && colA[i].includes('%')) {
      if (bracketIdx < brackets.length) {
        const b = brackets[bracketIdx];
        const pct = Math.round(b.rate * 100);
        const limitStr = b.limit === Infinity ? '+' : '$' + b.limit.toLocaleString();

        if (bracketIdx === 0) {
          sheet.getRange(i + 1, 1).setValue('Federal Tax (' + pct + '% on first $' + b.limit.toLocaleString() + ')');
        } else {
          const prevLimit = brackets[bracketIdx - 1].limit;
          sheet.getRange(i + 1, 1).setValue(
            'Federal Tax (' + pct + '% on $' + prevLimit.toLocaleString() + '-' + limitStr + ')'
          );
        }

        // Recalculate amount if AGI is available
        // Find AGI row
        let agi = 0;
        for (let j = 0; j < colA.length; j++) {
          if (typeof colA[j] === 'string' && colA[j].includes('Adjusted Gross Income')) {
            agi = colB[j] || 0;
            break;
          }
        }

        if (agi > 0) {
          const taxableIncome = Math.max(0, agi - data.standard_deduction_mfj);
          const prevLimit = bracketIdx === 0 ? 0 : brackets[bracketIdx - 1].limit;
          const taxableInBracket = Math.max(0, Math.min(taxableIncome, b.limit) - prevLimit);
          sheet.getRange(i + 1, 2).setValue(Math.round(taxableInBracket * b.rate * 100) / 100);
        }

        bracketIdx++;
      }
    }
  }

  // Find and update NC rate
  for (let i = 0; i < colA.length; i++) {
    if (typeof colA[i] === 'string' && colA[i].includes('NC ') && colA[i].includes('rate')) {
      sheet.getRange(i + 1, 2).setValue(data.nc_rate);
      break;
    }
  }

  Logger.log('Tax brackets updated for year ' + year);
}


// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT REGISTRY HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Read the Document Registry sheet into a lookup-friendly structure.
 * Called once per scan, then passed to each scanner.
 */
function getDocumentRegistry_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = ss.getSheetByName('Document Registry');
  const result = { byMRAccount: {}, byDocType: {}, byPerson: {}, byYear: {}, allDocs: [] };

  if (!regSheet || regSheet.getLastRow() < 3) return result;

  const data = regSheet.getRange(3, 1, regSheet.getLastRow() - 2, 10).getValues();

  for (const row of data) {
    const doc = {
      docId:     row[0],              // A: Doc ID
      filename:  row[1],              // B: Filename
      docType:   row[2],              // C: Document Type
      taxYear:   String(row[3]),      // D: Tax Year
      person:    row[4],              // E: Person
      mrAccount: row[5],              // F: MR Account
      fwmBinder: row[6],             // G: FWM Binder Tab
      filePath:  row[7],             // H: Full File Path
      sourceDir: row[8],             // I: Source Directory
      scanDate:  row[9],             // J: Scan Date
    };

    result.allDocs.push(doc);

    if (doc.mrAccount) {
      if (!result.byMRAccount[doc.mrAccount]) result.byMRAccount[doc.mrAccount] = [];
      result.byMRAccount[doc.mrAccount].push(doc);
    }
    if (doc.docType) {
      if (!result.byDocType[doc.docType]) result.byDocType[doc.docType] = [];
      result.byDocType[doc.docType].push(doc);
    }
    if (doc.person) {
      if (!result.byPerson[doc.person]) result.byPerson[doc.person] = [];
      result.byPerson[doc.person].push(doc);
    }
    if (doc.taxYear && doc.taxYear !== '0' && doc.taxYear !== '') {
      if (!result.byYear[doc.taxYear]) result.byYear[doc.taxYear] = [];
      result.byYear[doc.taxYear].push(doc);
    }
  }

  return result;
}


/**
 * Check if documents matching given criteria exist in the registry.
 */
function hasDocumentInRegistry_(registry, criteria) {
  let candidates = registry.allDocs;

  // Start with MR account index if available (fastest)
  if (criteria.mrAccount && registry.byMRAccount[criteria.mrAccount]) {
    candidates = registry.byMRAccount[criteria.mrAccount];
  } else if (criteria.mrAccount) {
    return { found: false, matches: [] };
  }

  const matches = candidates.filter(function(doc) {
    if (criteria.docType && doc.docType.indexOf(criteria.docType) === -1) return false;
    if (criteria.person && doc.person !== criteria.person) return false;
    if (criteria.taxYear && doc.taxYear !== String(criteria.taxYear)) return false;
    if (criteria.filenameContains && doc.filename.toLowerCase().indexOf(criteria.filenameContains.toLowerCase()) === -1) return false;
    return true;
  });

  return { found: matches.length > 0, matches: matches };
}


/**
 * Resolve a single Executive Dashboard action item against the registry.
 */
function resolveActionItemAgainstRegistry_(itemText, registry) {
  const text = itemText.toLowerCase();
  const activeYear = getActiveYear_();  // Read once, reuse below

  // Rule 1: Syrina's W-2 / 1099
  if (text.indexOf('syrina') !== -1 && (text.indexOf('w-2') !== -1 || text.indexOf('1099') !== -1 || text.indexOf('w2') !== -1)) {
    var check = hasDocumentInRegistry_(registry, { person: 'Syrina', docType: 'W-2', taxYear: activeYear });
    if (check.found) return { found: true, evidence: check.matches.map(function(d) { return d.filename; }) };
    check = hasDocumentInRegistry_(registry, { person: 'Syrina', docType: '1099', taxYear: activeYear });
    if (check.found) return { found: true, evidence: check.matches.map(function(d) { return d.filename; }) };
    return { found: false, suggestion: 'No W-2 or 1099 found for Syrina ' + activeYear };
  }

  // Rule 2: Food Truck / Schedule C
  if (text.indexOf('food truck') !== -1 || text.indexOf('schedule c') !== -1) {
    var check = hasDocumentInRegistry_(registry, { filenameContains: 'food_truck' });
    if (!check.found) check = hasDocumentInRegistry_(registry, { filenameContains: 'schedule c' });
    if (check.found) return { found: true, evidence: check.matches.map(function(d) { return d.filename; }) };
    return { found: false, suggestion: 'No food truck / Schedule C records found' };
  }

  // Rule 3: Missing months (BOA)
  if (text.indexOf('missing months') !== -1) {
    var monthCodes = ['04', '08', '09'];
    var monthNames = ['April', 'August', 'September'];
    var found = [], missing = [];
    for (var m = 0; m < monthCodes.length; m++) {
      var check = hasDocumentInRegistry_(registry, { mrAccount: 'MR-005', docType: 'Bank Statement' });
      var monthMatch = check.matches.filter(function(d) { return d.filename.indexOf(activeYear + '-' + monthCodes[m]) !== -1; });
      if (monthMatch.length > 0) found.push(monthMatch[0].filename);
      else missing.push(monthNames[m]);
    }
    if (missing.length === 0) return { found: true, evidence: found };
    return { found: false, suggestion: 'Still missing BOA statements for: ' + missing.join(', ') };
  }

  // Rule 4: PayPal full-year
  if (text.indexOf('paypal') !== -1) {
    var check = hasDocumentInRegistry_(registry, { docType: 'PayPal Statement', taxYear: activeYear });
    if (check.matches.length >= 12) return { found: true, evidence: [check.matches.length + ' PayPal statements found'] };
    return { found: false, suggestion: check.matches.length + ' of 12 PayPal statements found' };
  }

  // Rule 5: Credit card summaries
  if (text.indexOf('credit card') !== -1 && text.indexOf('summar') !== -1) {
    return { found: false, suggestion: 'No credit card annual summaries found' };
  }

  // Rule 6: Investment statements
  if (text.indexOf('investment') !== -1) {
    var fid = hasDocumentInRegistry_(registry, { mrAccount: 'MR-006' });
    var van = hasDocumentInRegistry_(registry, { mrAccount: 'MR-007' });
    var web = hasDocumentInRegistry_(registry, { mrAccount: 'MR-008' });
    var total = fid.matches.length + van.matches.length + web.matches.length;
    if (total > 0) return { found: true, evidence: [total + ' investment documents found'] };
    return { found: false, suggestion: 'No investment documents found' };
  }

  // Rule 7: Mileage
  if (text.indexOf('mileage') !== -1) {
    var check = hasDocumentInRegistry_(registry, { filenameContains: 'mileage' });
    if (check.found) return { found: true, evidence: check.matches.map(function(d) { return d.filename; }) };
    return { found: false, suggestion: 'No mileage log found' };
  }

  // Rule 8: Home office
  if (text.indexOf('home office') !== -1) {
    var check = hasDocumentInRegistry_(registry, { filenameContains: 'home_office' });
    if (!check.found) check = hasDocumentInRegistry_(registry, { filenameContains: 'home office' });
    if (check.found) return { found: true, evidence: check.matches.map(function(d) { return d.filename; }) };
    return { found: false, suggestion: 'No home office documentation found' };
  }

  // Rule 9: Health insurance
  if (text.indexOf('health insurance') !== -1) {
    var check = hasDocumentInRegistry_(registry, { docType: '1095' });
    if (check.found) return { found: true, evidence: check.matches.map(function(d) { return d.filename; }) };
    return { found: false, suggestion: 'No 1095-C found' };
  }

  // Rule 10: Charitable donations
  if (text.indexOf('charit') !== -1 || text.indexOf('donation') !== -1) {
    var check = hasDocumentInRegistry_(registry, { filenameContains: 'donation' });
    if (!check.found) check = hasDocumentInRegistry_(registry, { filenameContains: 'charit' });
    if (check.found) return { found: true, evidence: check.matches.map(function(d) { return d.filename; }) };
    return { found: false, suggestion: 'No donation receipts found' };
  }

  // Default: not resolved
  return { found: false, suggestion: '' };
}


// ═══════════════════════════════════════════════════════════════════════════
// DATA GAP SCANNER
// ═══════════════════════════════════════════════════════════════════════════

function createOrClearGapReport_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Gap Report');

  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet('Gap Report');
  }

  const headers = ['Tab Name', 'Row', 'Column Header', 'Gap Type', 'Current Value', 'Severity', 'Recommended Action', 'Registry Status'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#1B2A4A').setFontColor('#FFFFFF')
    .setFontWeight('bold').setFontFamily('Calibri').setFontSize(10);

  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 50);
  sheet.setColumnWidth(3, 160);
  sheet.setColumnWidth(4, 140);
  sheet.setColumnWidth(5, 150);
  sheet.setColumnWidth(6, 90);
  sheet.setColumnWidth(7, 280);
  sheet.setColumnWidth(8, 120);

  sheet.setFrozenRows(1);
  sheet.setTabColor('#FFEBEE');

  return sheet;
}


function runFullGapScan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast('Scanning all tabs for data gaps...', 'Gap Scanner', -1);

  const report = createOrClearGapReport_();
  const results = [];

  // Load Document Registry ONCE for cross-referencing
  const registry = getDocumentRegistry_();
  if (registry.allDocs.length === 0) {
    results.push(['System', 0, 'Document Registry', 'Registry not found or empty', '', 'HIGH',
      'Re-run Python generator with document scanning, then re-upload workbook', 'N/A']);
  }

  // Scan each tab
  const scanners = {
    'Executive Dashboard': scanTabExecutiveDashboard_,
    'Transaction Ledger': scanTabTransactionLedger_,
    'W-2 & Income Detail': scanTabW2Income_,
    'BOA Cash Flow': scanTabBOACashFlow_,
    'Household Obligations': scanTabHouseholdObligations_,
    'Subscriptions & Services': scanTabSubscriptions_,
    'Tax Strategy': scanTabTaxStrategy_,
    'Master Register': scanTabMasterRegister_,
    'Trust Ledger': scanTabTrustLedger_,
    '1099 Filing Chain': scanTab1099FilingChain_,
    'Forms & Authority': scanTabFormsAuthority_,
    'Proof of Mailing': scanTabProofOfMailing_,
    'Document Inventory': scanTabDocInventory_,
  };

  for (const [name, fn] of Object.entries(scanners)) {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      fn(sheet, results, registry);
    }
  }

  // Write results
  if (results.length > 0) {
    report.getRange(2, 1, results.length, 8).setValues(results);

    // Color-code severity column
    for (let i = 0; i < results.length; i++) {
      const severity = results[i][5];
      const cell = report.getRange(i + 2, 6);
      if (severity === 'CRITICAL') cell.setBackground('#FFEBEE').setFontColor('#B71C1C');
      else if (severity === 'HIGH') cell.setBackground('#FFF3E0').setFontColor('#E65100');
      else if (severity === 'MEDIUM') cell.setBackground('#FFF8E1').setFontColor('#F57F17');
      else if (severity === 'INFO') cell.setBackground('#E8F5E9').setFontColor('#1B5E20');
      else cell.setBackground('#F5F5F5').setFontColor('#616161');
    }
  }

  // Update settings
  const settings = ensureSettingsSheet_();
  settings.getRange('B2').setValue(new Date().toLocaleString());

  // Navigate to report
  ss.setActiveSheet(report);
  ss.toast('Found ' + results.length + ' data gaps across ' + Object.keys(scanners).length + ' tabs', 'Gap Scanner', 5);
}


function scanCurrentTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const active = ss.getActiveSheet();
  const name = active.getName();

  const scanners = {
    'Executive Dashboard': scanTabExecutiveDashboard_,
    'Transaction Ledger': scanTabTransactionLedger_,
    'W-2 & Income Detail': scanTabW2Income_,
    'BOA Cash Flow': scanTabBOACashFlow_,
    'Household Obligations': scanTabHouseholdObligations_,
    'Subscriptions & Services': scanTabSubscriptions_,
    'Tax Strategy': scanTabTaxStrategy_,
    'Master Register': scanTabMasterRegister_,
    'Trust Ledger': scanTabTrustLedger_,
    '1099 Filing Chain': scanTab1099FilingChain_,
    'Forms & Authority': scanTabFormsAuthority_,
    'Proof of Mailing': scanTabProofOfMailing_,
    'Document Inventory': scanTabDocInventory_,
  };

  if (!scanners[name]) {
    SpreadsheetApp.getUi().alert('No scanner available for tab: ' + name);
    return;
  }

  // Load Document Registry for cross-referencing
  const registry = getDocumentRegistry_();

  const report = createOrClearGapReport_();
  const results = [];
  scanners[name](active, results, registry);

  if (results.length > 0) {
    report.getRange(2, 1, results.length, 8).setValues(results);
    for (let i = 0; i < results.length; i++) {
      const severity = results[i][5];
      const cell = report.getRange(i + 2, 6);
      if (severity === 'CRITICAL') cell.setBackground('#FFEBEE').setFontColor('#B71C1C');
      else if (severity === 'HIGH') cell.setBackground('#FFF3E0').setFontColor('#E65100');
      else if (severity === 'MEDIUM') cell.setBackground('#FFF8E1').setFontColor('#F57F17');
      else if (severity === 'INFO') cell.setBackground('#E8F5E9').setFontColor('#1B5E20');
      else cell.setBackground('#F5F5F5').setFontColor('#616161');
    }
  }

  ss.setActiveSheet(report);
  ss.toast('Found ' + results.length + ' gaps in ' + name, 'Gap Scanner', 5);
}


function navigateToGapReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const report = ss.getSheetByName('Gap Report');
  if (report) {
    ss.setActiveSheet(report);
  } else {
    SpreadsheetApp.getUi().alert('No Gap Report found. Run a scan first.');
  }
}


function navigateToDocRegistry() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reg = ss.getSheetByName('Document Registry');
  if (reg) {
    ss.setActiveSheet(reg);
  } else {
    SpreadsheetApp.getUi().alert('No Document Registry found. Re-run the Python generator with document scanning enabled, then re-upload the workbook.');
  }
}


function emailGapReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const report = ss.getSheetByName('Gap Report');
  if (!report || report.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No Gap Report data. Run a scan first.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Email Gap Report', 'Enter email address:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText().trim();
  if (!email || !email.includes('@')) {
    ui.alert('Invalid email address.');
    return;
  }

  const data = report.getRange(2, 1, report.getLastRow() - 1, 8).getValues();

  // Build HTML table
  let html = '<h2>TMAR Data Gap Report</h2>';
  html += '<p>Scanned: ' + new Date().toLocaleString() + '</p>';
  html += '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; font-family:Calibri; font-size:12px;">';
  html += '<tr style="background:#1B2A4A; color:white;"><th>Tab</th><th>Row</th><th>Column</th><th>Gap</th><th>Value</th><th>Severity</th><th>Action</th><th>Registry</th></tr>';

  for (const row of data) {
    const sevColor = row[5] === 'CRITICAL' ? '#FFEBEE' : row[5] === 'HIGH' ? '#FFF3E0' : row[5] === 'MEDIUM' ? '#FFF8E1' : row[5] === 'INFO' ? '#E8F5E9' : '#F5F5F5';
    html += '<tr style="background:' + sevColor + ';"><td>' + row.join('</td><td>') + '</td></tr>';
  }
  html += '</table>';
  html += '<p style="font-size:11px; color:#999;">Generated from Wimberly Unified Master Register</p>';

  MailApp.sendEmail({
    to: email,
    subject: 'TMAR Data Gap Report — ' + data.length + ' gaps found',
    htmlBody: html,
  });

  ui.alert('Report emailed to ' + email);
}


// ─── PER-TAB SCANNERS ───────────────────────────────────────────────────────
// All scanners accept (sheet, results, registry) — the registry parameter
// enables cross-referencing the Document Registry tab for filesystem-aware
// gap detection.

function scanTabMasterRegister_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const lastCol = sheet.getLastColumn();
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2;
    const mrId = row[0];     // Col A: Row ID (MR-001, MR-002, ...)
    const provider = row[2]; // Col C (idx 2)
    if (!provider) continue; // Skip entirely empty rows

    // Existing field-completeness checks
    if (!row[5]) results.push(['Master Register', rowNum, 'Account Type (F)', 'Empty field', '', 'HIGH', 'Set account type from _Validation dropdown', '']);
    if (!row[7]) results.push(['Master Register', rowNum, 'Status (H)', 'Empty field', '', 'HIGH', 'Set status: Active, Closed, Pending, etc.', '']);
    if (!row[14]) results.push(['Master Register', rowNum, 'Primary User (O)', 'Empty field', '', 'MEDIUM', 'Set primary user: Clint, Syrina, Joint, or Trust', '']);

    // ENHANCED: Document Location check with registry cross-reference (col W = idx 22)
    if (!row[22]) {
      const check = hasDocumentInRegistry_(registry, { mrAccount: mrId });
      if (check.found) {
        results.push(['Master Register', rowNum, 'Document Location (W)',
          'Empty — but registry has ' + check.matches.length + ' doc(s)',
          provider, 'MEDIUM',
          'Auto-fill from registry: ' + check.matches[0].filePath,
          'Docs found: ' + check.matches.length]);
      } else {
        results.push(['Master Register', rowNum, 'Document Location (W)',
          'Empty — no documents in registry either',
          provider, 'HIGH', 'Link to vault path or physical file location', 'No docs']);
      }
    }

    // Balance gap: Active accounts should have a balance
    if (row[7] === 'Active' && (row[10] === '' || row[10] === null || row[10] === 0)) {
      const acctType = row[5] || '';
      if (['Banking', 'Investment', 'Credit Card', 'Student Loan'].some(t => acctType.includes(t))) {
        results.push(['Master Register', rowNum, 'Current Balance (K)', 'Active account with $0/blank balance', provider, 'HIGH', 'Update balance from latest statement', '']);
      }
    }

    // EIN gap
    if (!row[3]) results.push(['Master Register', rowNum, 'Provider EIN (D)', 'Missing EIN', provider, 'MEDIUM', 'Look up EIN from W-2, 1099, or SEC EDGAR', '']);

    // NEW: Active accounts with zero supporting documents in registry
    if (mrId && row[7] === 'Active') {
      const check = hasDocumentInRegistry_(registry, { mrAccount: mrId });
      if (!check.found) {
        results.push(['Master Register', rowNum, 'Registry Coverage',
          'Active account with no supporting documents',
          provider, 'MEDIUM', 'No files found in filesystem for ' + mrId,
          'No docs']);
      }
    }
  }
}


function scanTabTransactionLedger_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2;
    if (!row[0] && !row[1] && !row[6]) continue;

    if (!row[0]) results.push(['Transaction Ledger', rowNum, 'Date (A)', 'Missing date', '', 'CRITICAL', 'Add transaction date', '']);
    if (!row[2]) results.push(['Transaction Ledger', rowNum, 'Category (C)', 'Missing category', '', 'HIGH', 'Set category from dropdown', '']);
    if (row[6] === '' || row[6] === null) results.push(['Transaction Ledger', rowNum, 'Amount (G)', 'Missing amount', '', 'CRITICAL', 'Enter transaction amount', '']);
    if (!row[9]) results.push(['Transaction Ledger', rowNum, 'Status (J)', 'Missing status', '', 'MEDIUM', 'Set status: Paid, Received, Pending, Owed', '']);
  }
}


function scanTabW2Income_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const colA = sheet.getRange('A1:A' + lastRow).getValues().flat();
  const colC = sheet.getRange('C1:C' + lastRow).getValues().flat();

  // Existing logic: check for "Verify"/"Estimated" — enhanced with registry cross-ref
  for (let i = 0; i < colA.length; i++) {
    if (typeof colC[i] === 'string' && (colC[i].includes('Verify') || colC[i].includes('Estimated'))) {
      const check = hasDocumentInRegistry_(registry, { docType: 'W-2' });
      if (check.found) {
        results.push(['W-2 & Income Detail', i + 1, 'Status (C)',
          'Needs verification (document exists)',
          colA[i], 'MEDIUM',
          'Verify against: ' + check.matches[0].filename,
          'Doc on file']);
      } else {
        results.push(['W-2 & Income Detail', i + 1, 'Status (C)',
          'Needs verification (NO document found)',
          colA[i], 'CRITICAL',
          'Verify amount — document not found in filesystem',
          'No doc']);
      }
    }
  }

  // NEW: Verify W-2 PDFs exist for each person for current tax year
  const year = getActiveYear_();
  var people = ['Clinton', 'Syrina'];
  for (var p = 0; p < people.length; p++) {
    var check = hasDocumentInRegistry_(registry, { docType: 'W-2', person: people[p], taxYear: year });
    if (!check.found) {
      results.push(['W-2 & Income Detail', 0, 'W-2 Document',
        'No W-2 file in filesystem',
        people[p] + ' ' + year, 'CRITICAL',
        'Expected W-2 PDF for ' + people[p] + ' tax year ' + year,
        'Missing']);
    } else {
      results.push(['W-2 & Income Detail', 0, 'W-2 Document',
        'W-2 file confirmed in filesystem',
        people[p] + ' ' + year, 'INFO',
        'Found: ' + check.matches.map(function(d) { return d.filename; }).join(', '),
        'On file']);
    }
  }
}


function scanTabBOACashFlow_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;
  const data = sheet.getRange(3, 1, Math.min(12, lastRow - 2), 8).getValues();
  const currentMonth = new Date().getMonth();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 3;
    const monthName = row[0];
    if (!monthName) continue;

    if (i <= currentMonth) {
      if (!row[1] && row[1] !== 0) results.push(['BOA Cash Flow', rowNum, 'Beginning Balance (B)', 'Missing balance', monthName, 'HIGH', 'Enter beginning balance from bank statement', '']);
      if (!row[5] && row[5] !== 0) results.push(['BOA Cash Flow', rowNum, 'Ending Balance (F)', 'Missing balance', monthName, 'HIGH', 'Enter ending balance from bank statement', '']);
      if (row[2] === 0 || row[2] === '') results.push(['BOA Cash Flow', rowNum, 'Total Deposits (C)', 'Zero/missing deposits', monthName, 'MEDIUM', 'Verify — did the account have deposits this month?', '']);
    }
  }

  // NEW: Check BOA statement PDF coverage for each past month
  const year = getActiveYear_();
  const monthNames = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];
  const monthNums =  ['01','02','03','04','05','06','07','08','09','10','11','12'];

  for (var m = 0; m <= currentMonth && m < 12; m++) {
    var check = hasDocumentInRegistry_(registry, { mrAccount: 'MR-005', docType: 'Bank Statement' });
    var monthMatch = check.matches.filter(function(d) { return d.filename.indexOf(year + '-' + monthNums[m]) !== -1; });
    if (monthMatch.length === 0) {
      results.push(['BOA Cash Flow', 0, 'Statement Coverage',
        'No BOA statement PDF for ' + monthNames[m] + ' ' + year,
        '', 'MEDIUM', 'Download statement from Bank of America online banking',
        'Missing']);
    }
  }
}


function scanTabHouseholdObligations_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const data = sheet.getRange(2, 1, lastRow - 1, 11).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2;
    if (!row[0]) continue;

    if (!row[7]) results.push(['Household Obligations', rowNum, 'Status (H)', 'Missing status', row[0], 'HIGH', 'Set status: Active or Closed', '']);
    if (row[7] === 'Active' && !row[4]) results.push(['Household Obligations', rowNum, 'Due Day (E)', 'Active item missing due day', row[0], 'MEDIUM', 'Enter monthly due date', '']);
    if (row[7] === 'Active' && (!row[3] || row[3] === 0)) results.push(['Household Obligations', rowNum, 'Monthly Amount (D)', 'Active item with $0/blank', row[0], 'HIGH', 'Enter current monthly payment amount', '']);
  }
}


function scanTabSubscriptions_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2;
    if (!row[0]) continue;

    if (!row[2] && row[2] !== 0) results.push(['Subscriptions & Services', rowNum, 'Monthly Cost (C)', 'Missing cost', row[0], 'HIGH', 'Enter monthly subscription cost', '']);
    if (!row[6]) results.push(['Subscriptions & Services', rowNum, 'Status (G)', 'Missing status', row[0], 'MEDIUM', 'Set status: Active or Cancelled', '']);
    if (row[7] === '' || row[7] === null) results.push(['Subscriptions & Services', rowNum, 'Tax Deductible (H)', 'Not specified', row[0], 'MEDIUM', 'Determine if deductible — ask CPA if unsure', '']);
  }
}


function scanTabTaxStrategy_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const colA = sheet.getRange('A1:A' + lastRow).getValues().flat();
  const colC = sheet.getRange('C1:C' + lastRow).getValues().flat();

  for (let i = 0; i < colA.length; i++) {
    if (typeof colC[i] === 'string' && (colC[i].includes('Verify') || colC[i].includes('Estimated'))) {
      results.push(['Tax Strategy', i + 1, 'Status (C)', 'Needs verification', colA[i], 'HIGH', 'Confirm amount before filing', '']);
    }
  }
}


function scanTabExecutiveDashboard_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const colA = sheet.getRange('A1:A' + lastRow).getValues().flat();
  const colB = sheet.getRange('B1:B' + lastRow).getValues().flat();

  let inActionItems = false;
  for (let i = 0; i < colA.length; i++) {
    if (typeof colA[i] === 'string' && colA[i].includes('ACTION ITEMS')) {
      inActionItems = true;
      continue;
    }
    if (inActionItems && colA[i]) {
      if (typeof colA[i] === 'string' && colA[i] === colA[i].toUpperCase() && colA[i].length > 15) {
        inActionItems = false;
        continue;
      }

      const item = String(colA[i]);
      const priority = String(colB[i] || '');

      // Skip items already marked RESOLVED in the workbook
      if (priority.indexOf('RESOLVED') !== -1) {
        results.push(['Executive Dashboard', i + 1, 'Action Item (A)',
          'Action item resolved', item, 'INFO',
          'Marked RESOLVED in workbook', 'Resolved']);
        continue;
      }

      // Cross-reference against Document Registry
      const resolved = resolveActionItemAgainstRegistry_(item, registry);

      if (resolved.found) {
        results.push(['Executive Dashboard', i + 1, 'Action Item (A)',
          'Resolved by registry', item, 'INFO',
          'Documents found: ' + resolved.evidence.join(', '),
          'On file']);
      } else {
        const suggestion = resolved.suggestion || 'Address this action item';
        results.push(['Executive Dashboard', i + 1, 'Action Item (A)',
          'Unresolved action item', item, 'HIGH', suggestion, 'Not found']);
      }
    }
  }
}


function scanTabTrustLedger_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;
  const data = sheet.getRange(3, 1, lastRow - 2, 8).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 3;
    if (!row[0] && !row[1]) continue;

    if (!row[3]) results.push(['Trust Ledger', rowNum, 'Verified Value (D)', 'Missing value', row[1], 'HIGH', 'Appraise or verify asset value', '']);
    if (!row[6]) results.push(['Trust Ledger', rowNum, 'Filing Status (G)', 'Missing status', row[1], 'HIGH', 'Set filing status for this asset', '']);
  }
}


function scanTab1099FilingChain_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;
  const data = sheet.getRange(3, 1, lastRow - 2, 15).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 3;
    if (!row[0] && !row[1]) continue;

    if (row[5] && row[5] !== 'Not Started' && (!row[8] || row[8] === 'Not Started')) {
      results.push(['1099 Filing Chain', rowNum, '1099-B #1 Status (I)', 'Incomplete chain', row[1], 'HIGH', '1099-A filed — proceed with 1099-B filing', '']);
    }
  }
}


function scanTabFormsAuthority_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;
  const data = sheet.getRange(3, 1, lastRow - 2, 13).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 3;
    if (!row[0]) continue;

    if (row[8] === 'Not Started') {
      // ENHANCED: Check if form document exists in registry
      const formName = String(row[0]).toLowerCase().replace(/\s+/g, '');
      const check = registry.allDocs.filter(function(d) {
        return d.filename.toLowerCase().replace(/\s+/g, '').indexOf(formName) !== -1;
      });
      if (check.length > 0) {
        results.push(['Forms & Authority', rowNum, 'Status (I)',
          'Status is "Not Started" but form found in registry',
          row[0], 'HIGH',
          'Update status — document exists: ' + check[0].filename,
          'Doc found']);
      } else {
        results.push(['Forms & Authority', rowNum, 'Status (I)', 'Not started', row[0], 'MEDIUM', 'Prepare and file ' + row[0], '']);
      }
    }
    if ((row[8] === 'Filed' || row[8] === 'Complete') && !row[3]) {
      results.push(['Forms & Authority', rowNum, 'Date Filed (D)', 'Filed but no date', row[0], 'CRITICAL', 'Record the filing date for audit trail', '']);
    }
  }
}


function scanTabProofOfMailing_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;
  const data = sheet.getRange(3, 1, lastRow - 2, 14).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 3;
    if (!row[1]) continue;

    if (!row[6]) results.push(['Proof of Mailing', rowNum, 'Tracking # (G)', 'Missing tracking', row[2], 'HIGH', 'Add USPS tracking number from receipt', '']);
    if (row[6] && !row[8]) results.push(['Proof of Mailing', rowNum, 'Delivery Confirmed (I)', 'Unconfirmed delivery', row[2], 'MEDIUM', 'Check USPS tracking for delivery confirmation', '']);
  }
}


function scanTabDocInventory_(sheet, results, registry) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;
  const data = sheet.getRange(3, 1, lastRow - 2, 17).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 3;
    if (!row[0] && !row[1]) continue;

    // Existing checks
    if (!row[12]) results.push(['Document Inventory', rowNum, 'Status (M)', 'Missing status', row[1], 'HIGH', 'Set document status', '']);
    if (!row[7]) results.push(['Document Inventory', rowNum, 'FWM Binder Tab (H)', 'Missing binder tab', row[1], 'MEDIUM', 'Assign to FWM binder tab 1-11', '']);

    // ENHANCED: Vault Location check with registry cross-ref
    if (!row[8]) {
      const docId = row[0];
      const regMatch = registry.allDocs.filter(function(d) { return d.docId === docId; });
      if (regMatch.length > 0) {
        results.push(['Document Inventory', rowNum, 'Vault Location (I)',
          'Missing vault path — registry has path',
          row[1], 'LOW',
          'Auto-fill: ' + regMatch[0].filePath,
          'Path available']);
      } else {
        results.push(['Document Inventory', rowNum, 'Vault Location (I)',
          'Missing vault path — not in registry',
          row[1], 'MEDIUM', 'Enter Obsidian vault path to document', 'No match']);
      }
    }
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// CPA QUESTIONS TRACKER
// ═══════════════════════════════════════════════════════════════════════════

function showAddQuestionDialog() {
  const tabNames = ['Executive Dashboard', 'Transaction Ledger', 'W-2 & Income Detail',
    'BOA Cash Flow', 'Household Obligations', 'Subscriptions & Services', 'Tax Strategy',
    'Master Register', 'Trust Ledger', '1099 Filing Chain', 'Forms & Authority',
    'Proof of Mailing', 'Document Inventory'];

  const tabOptions = tabNames.map(t => '<option value="' + t + '">' + t + '</option>').join('');

  const html = `
    <style>
      body { font-family: Calibri, Arial, sans-serif; padding: 16px; color: #333; }
      h3 { color: #1B2A4A; margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-top: 10px; margin-bottom: 3px; font-size: 12px; color: #1B2A4A; }
      select, input, textarea { width: 100%; padding: 6px; font-size: 13px; border: 1px solid #CCC; border-radius: 4px; box-sizing: border-box; font-family: Calibri, Arial, sans-serif; }
      textarea { resize: vertical; }
      .btn { padding: 10px 24px; font-size: 13px; border: none; border-radius: 4px; cursor: pointer; margin-top: 14px; margin-right: 8px; }
      .btn-primary { background: #1B2A4A; color: white; }
      .btn-secondary { background: #E0E0E0; color: #333; }
      #status { margin-top: 10px; font-size: 12px; color: #2E7D32; }
    </style>
    <h3>Add CPA Question</h3>
    <form id="cpaForm" onsubmit="submitQuestion(); return false;">
      <label>Category *</label>
      <select id="category">
        <option value="Filing">Filing</option>
        <option value="Deductions">Deductions</option>
        <option value="Credits">Credits</option>
        <option value="Income">Income</option>
        <option value="Trust">Trust</option>
        <option value="State">State</option>
        <option value="Other">Other</option>
      </select>

      <label>Related Tab</label>
      <select id="relatedTab">
        <option value="">— None —</option>
        ${tabOptions}
      </select>

      <label>Question *</label>
      <textarea id="question" rows="3" placeholder="Type your question for the CPA..." required></textarea>

      <label>Context / Reference</label>
      <input type="text" id="context" placeholder="e.g., Master Register row 12, or W-2 Box 12a" />

      <label>Priority</label>
      <select id="priority">
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
        <option value="Low">Low</option>
      </select>

      <div>
        <button type="submit" class="btn btn-primary">Add Question</button>
        <button type="button" class="btn btn-secondary" onclick="google.script.host.close()">Close</button>
      </div>
    </form>
    <div id="status"></div>

    <script>
      function submitQuestion() {
        var data = {
          category: document.getElementById('category').value,
          relatedTab: document.getElementById('relatedTab').value,
          question: document.getElementById('question').value,
          context: document.getElementById('context').value,
          priority: document.getElementById('priority').value
        };
        document.getElementById('status').textContent = 'Adding...';
        google.script.run
          .withSuccessHandler(function(msg) {
            document.getElementById('status').textContent = msg;
            document.getElementById('question').value = '';
            document.getElementById('context').value = '';
          })
          .withFailureHandler(function(err) {
            document.getElementById('status').textContent = 'Error: ' + err.message;
          })
          .addCPAQuestion(data);
      }
    </script>
  `;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(380).setHeight(480);
  SpreadsheetApp.getUi().showSidebar(output);
}


function addCPAQuestion(formData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureCPASheet_();
  const settings = ensureSettingsSheet_();

  // Generate next ID
  let counter = settings.getRange('B3').getValue() || 0;
  counter++;
  settings.getRange('B3').setValue(counter);
  const qId = 'CPA-' + String(counter).padStart(3, '0');

  // Append row
  const newRow = [
    qId,
    new Date().toLocaleDateString(),
    formData.category || '',
    formData.relatedTab || '',
    formData.question || '',
    formData.context || '',
    formData.priority || 'Medium',
    'Open',           // Status
    '',               // CPA Response
    '',               // Response Date
    '',               // Action Required
    'No'              // Resolved
  ];

  sheet.appendRow(newRow);
  return 'Question ' + qId + ' added successfully!';
}


function navigateToCPASheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureCPASheet_();
  ss.setActiveSheet(sheet);
}


function filterCPAOpen() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureCPASheet_();
  ss.setActiveSheet(sheet);

  // Remove existing filter
  if (sheet.getFilter()) sheet.getFilter().remove();

  // Create new filter and set criteria on Status column (H = col 8)
  const range = sheet.getDataRange();
  const filter = range.createFilter();
  const criteria = SpreadsheetApp.newFilterCriteria()
    .whenTextEqualTo('Open')
    .build();
  filter.setColumnFilterCriteria(8, criteria);

  ss.toast('Showing Open questions only', 'CPA Questions', 3);
}


function filterCPAPriority() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Filter by Priority', 'Enter priority (Critical, High, Medium, Low):', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const priority = response.getResponseText().trim();
  if (!['Critical', 'High', 'Medium', 'Low'].includes(priority)) {
    ui.alert('Invalid priority. Use: Critical, High, Medium, or Low');
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureCPASheet_();
  ss.setActiveSheet(sheet);

  if (sheet.getFilter()) sheet.getFilter().remove();

  const range = sheet.getDataRange();
  const filter = range.createFilter();
  const criteria = SpreadsheetApp.newFilterCriteria()
    .whenTextEqualTo(priority)
    .build();
  filter.setColumnFilterCriteria(7, criteria); // Priority = col 7

  ss.toast('Showing ' + priority + ' priority questions', 'CPA Questions', 3);
}


function clearCPAFilters() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureCPASheet_();
  ss.setActiveSheet(sheet);
  if (sheet.getFilter()) sheet.getFilter().remove();
  ss.toast('Filters cleared', 'CPA Questions', 3);
}


function generateCPAMeetingPrep() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CPA Questions');
  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No CPA questions found. Add questions first.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues();

  // Filter to open/pending questions
  const open = data.filter(row => row[7] === 'Open' || row[7] === 'Pending CPA');

  if (open.length === 0) {
    SpreadsheetApp.getUi().alert('No open questions to prepare. All questions are resolved!');
    return;
  }

  // Group by category
  const grouped = {};
  for (const row of open) {
    const cat = row[2] || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(row);
  }

  // Sort categories, with Critical/High first within each
  const prioOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };

  let html = `
    <style>
      @media print { body { font-size: 11px; } .no-print { display: none; } }
      body { font-family: Calibri, Arial, sans-serif; padding: 20px; color: #333; max-width: 700px; margin: 0 auto; }
      h1 { color: #1B2A4A; font-size: 18px; margin-bottom: 2px; }
      .trust-info { color: #666; font-size: 11px; margin-bottom: 16px; }
      .summary { background: #D6E4F0; padding: 10px; border-radius: 4px; margin-bottom: 16px; font-size: 13px; }
      h2 { color: #2E7D32; font-size: 15px; border-bottom: 2px solid #2E7D32; padding-bottom: 4px; margin-top: 20px; }
      .question { border-left: 3px solid #1B2A4A; padding: 8px 12px; margin: 10px 0; background: #FAFAFA; }
      .q-meta { font-size: 11px; color: #888; }
      .q-text { font-size: 13px; margin: 4px 0; }
      .q-context { font-size: 12px; color: #666; font-style: italic; }
      .priority-Critical { border-left-color: #B71C1C; }
      .priority-High { border-left-color: #E65100; }
      .priority-Medium { border-left-color: #F57F17; }
      .priority-Low { border-left-color: #9E9E9E; }
      .response-area { border: 1px dashed #CCC; padding: 6px; margin-top: 6px; min-height: 30px; font-size: 12px; color: #999; }
      .btn { padding: 8px 20px; background: #1B2A4A; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 16px; }
    </style>

    <h1>CPA Meeting Preparation</h1>
    <div class="trust-info">
      A Provident Private Creditor Revocable Living Trust | EIN: 41-6809588<br>
      Trustee: Clinton Wimberly IV | CAF: 0317-17351<br>
      Prepared: ${new Date().toLocaleDateString()}
    </div>

    <div class="summary">
      <strong>${open.length}</strong> open question${open.length !== 1 ? 's' : ''} across <strong>${Object.keys(grouped).length}</strong> categor${Object.keys(grouped).length !== 1 ? 'ies' : 'y'}
    </div>
  `;

  for (const cat of Object.keys(grouped).sort()) {
    const questions = grouped[cat].sort((a, b) => (prioOrder[a[6]] || 9) - (prioOrder[b[6]] || 9));

    html += '<h2>' + cat + ' (' + questions.length + ')</h2>';

    for (const q of questions) {
      html += `
        <div class="question priority-${q[6]}">
          <div class="q-meta">${q[0]} | Priority: ${q[6]} | Tab: ${q[3] || 'N/A'}</div>
          <div class="q-text"><strong>${q[4]}</strong></div>
          ${q[5] ? '<div class="q-context">Context: ' + q[5] + '</div>' : ''}
          <div class="response-area">CPA Response: ___________________________________</div>
        </div>
      `;
    }
  }

  html += '<button class="btn no-print" onclick="window.print()">Print</button>';
  html += '<button class="btn no-print" style="background:#666; margin-left:8px;" onclick="google.script.host.close()">Close</button>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(720).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(output, 'CPA Meeting Prep');
}


// ═══════════════════════════════════════════════════════════════════════════
// IMPORT TOOLS
// ═══════════════════════════════════════════════════════════════════════════

function showCSVImportDialog() {
  const html = `
    <style>
      body { font-family: Calibri, Arial, sans-serif; padding: 16px; color: #333; }
      h3 { color: #1B2A4A; margin-bottom: 8px; }
      .note { font-size: 11px; color: #888; margin-bottom: 12px; }
      textarea { width: 100%; height: 200px; font-family: monospace; font-size: 11px; border: 1px solid #CCC; padding: 8px; box-sizing: border-box; }
      .btn { padding: 10px 24px; font-size: 13px; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px; margin-right: 8px; }
      .btn-primary { background: #1B2A4A; color: white; }
      .btn-secondary { background: #E0E0E0; color: #333; }
      #status { margin-top: 10px; font-size: 12px; }
      .success { color: #2E7D32; }
      .error { color: #B71C1C; }
    </style>
    <h3>Import CSV Transactions</h3>
    <div class="note">Paste CSV data below. Expected columns: Date, Party, Category, Subcategory, Vendor, Description, Amount, Payment, Acct Type, Status, Tax Ded?, Biz Use %, Due Day, Recurring, Notes, Source</div>
    <textarea id="csvData" placeholder="Date,Party,Category,..."></textarea>
    <div>
      <button class="btn btn-primary" onclick="importCSV()">Import</button>
      <button class="btn btn-secondary" onclick="google.script.host.close()">Cancel</button>
    </div>
    <div id="status"></div>

    <script>
      function importCSV() {
        var csv = document.getElementById('csvData').value.trim();
        if (!csv) { document.getElementById('status').innerHTML = '<span class="error">No data to import</span>'; return; }
        document.getElementById('status').textContent = 'Importing...';
        google.script.run
          .withSuccessHandler(function(msg) {
            document.getElementById('status').innerHTML = '<span class="success">' + msg + '</span>';
          })
          .withFailureHandler(function(err) {
            document.getElementById('status').innerHTML = '<span class="error">Error: ' + err.message + '</span>';
          })
          .importCSVTransactions(csv);
      }
    </script>
  `;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(550).setHeight(420);
  SpreadsheetApp.getUi().showModalDialog(output, 'Import CSV Transactions');
}


function importCSVTransactions(csvText) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Transaction Ledger');
  if (!sheet) throw new Error('Transaction Ledger tab not found');

  // Parse CSV
  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

  // Skip header, parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map(c => c.trim().replace(/^"(.*)"$/, '$1'));
    if (cells.length >= 3) { // At minimum: date, party, category
      // Pad to 16 columns
      while (cells.length < 16) cells.push('');
      rows.push(cells.slice(0, 16));
    }
  }

  if (rows.length === 0) throw new Error('No valid data rows found');

  // Append after last row
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, rows.length, 16).setValues(rows);

  return 'Imported ' + rows.length + ' transaction' + (rows.length !== 1 ? 's' : '') + ' to Transaction Ledger';
}


function showAddAccountDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Get validation lists
  const valSheet = ss.getSheetByName('_Validation');
  let acctTypes = ['Banking', 'Investment', 'Credit Card', 'Student Loan', 'Utilities'];
  let statuses = ['Active', 'Closed', 'Pending'];
  let users = ['Clint', 'Syrina', 'Joint', 'Trust'];

  if (valSheet) {
    const lastRow = valSheet.getLastRow();
    const getCol = (col) => valSheet.getRange(2, col, lastRow - 1, 1).getValues().flat().filter(v => v);
    acctTypes = getCol(1);
    statuses = getCol(2);
    users = getCol(4);
  }

  // Get next MR ID
  const mrSheet = ss.getSheetByName('Master Register');
  let nextId = 'MR-001';
  if (mrSheet) {
    const ids = mrSheet.getRange(2, 1, mrSheet.getLastRow() - 1, 1).getValues().flat().filter(v => v);
    const maxNum = Math.max(0, ...ids.map(id => {
      const m = String(id).match(/MR-(\d+)/);
      return m ? parseInt(m[1]) : 0;
    }));
    nextId = 'MR-' + String(maxNum + 1).padStart(3, '0');
  }

  const typeOpts = acctTypes.map(t => '<option>' + t + '</option>').join('');
  const statusOpts = statuses.map(s => '<option>' + s + '</option>').join('');
  const userOpts = users.map(u => '<option>' + u + '</option>').join('');

  const html = `
    <style>
      body { font-family: Calibri, Arial, sans-serif; padding: 16px; color: #333; }
      h3 { color: #1B2A4A; margin-bottom: 8px; }
      label { display: block; font-weight: bold; margin-top: 8px; margin-bottom: 2px; font-size: 11px; color: #1B2A4A; }
      select, input { width: 100%; padding: 5px; font-size: 12px; border: 1px solid #CCC; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 8px; }
      .row > div { flex: 1; }
      .btn { padding: 8px 20px; font-size: 12px; border: none; border-radius: 4px; cursor: pointer; margin-top: 12px; margin-right: 6px; }
      .btn-primary { background: #1B2A4A; color: white; }
      .btn-secondary { background: #E0E0E0; color: #333; }
      #status { margin-top: 8px; font-size: 12px; color: #2E7D32; }
      .id-badge { background: #D6E4F0; padding: 4px 10px; border-radius: 4px; font-weight: bold; display: inline-block; margin-bottom: 8px; }
    </style>
    <h3>Add Account to Master Register</h3>
    <div class="id-badge">${nextId}</div>

    <label>Provider / Creditor *</label>
    <input type="text" id="provider" required />

    <div class="row">
      <div><label>Account Type *</label><select id="acctType">${typeOpts}</select></div>
      <div><label>Status *</label><select id="status_sel">${statusOpts}</select></div>
    </div>

    <label>Account Number</label>
    <input type="text" id="acctNum" placeholder="Last 4 or full" />

    <label>Provider EIN</label>
    <input type="text" id="ein" placeholder="XX-XXXXXXX" />

    <div class="row">
      <div><label>Primary User</label><select id="user">${userOpts}</select></div>
      <div><label>Current Balance</label><input type="number" id="balance" step="0.01" /></div>
    </div>

    <label>Notes</label>
    <input type="text" id="notes" />

    <div>
      <button class="btn btn-primary" onclick="submitAccount()">Add Account</button>
      <button class="btn btn-secondary" onclick="google.script.host.close()">Close</button>
    </div>
    <div id="result"></div>

    <script>
      function submitAccount() {
        var data = {
          id: '${nextId}',
          provider: document.getElementById('provider').value,
          acctType: document.getElementById('acctType').value,
          status: document.getElementById('status_sel').value,
          acctNum: document.getElementById('acctNum').value,
          ein: document.getElementById('ein').value,
          user: document.getElementById('user').value,
          balance: document.getElementById('balance').value,
          notes: document.getElementById('notes').value
        };
        if (!data.provider) { alert('Provider is required'); return; }
        document.getElementById('result').textContent = 'Adding...';
        google.script.run
          .withSuccessHandler(function(msg) {
            document.getElementById('result').textContent = msg;
          })
          .withFailureHandler(function(err) {
            document.getElementById('result').textContent = 'Error: ' + err.message;
          })
          .addAccountToMasterRegister(data);
      }
    </script>
  `;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(380).setHeight(520);
  SpreadsheetApp.getUi().showSidebar(output);
}


function addAccountToMasterRegister(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Master Register');
  if (!sheet) throw new Error('Master Register tab not found');

  // Build 35-column row (matching schema)
  const row = new Array(35).fill('');
  row[0] = data.id;                            // A: Row ID
  row[1] = new Date().toISOString().slice(0,10); // B: Date Added
  row[2] = data.provider;                      // C: Provider/Creditor
  row[3] = '';                                 // D: Mailing Address
  row[4] = data.ein || '';                     // E: Provider EIN
  row[5] = data.acctNum || '';                 // F: Account Number
  row[6] = data.acctType || '';                // G: Account Type
  row[10] = data.status || 'Active';           // K: Status
  row[13] = data.balance ? Number(data.balance) : ''; // N: Current Balance
  row[19] = data.user || '';                   // T: Primary User
  row[32] = data.notes || '';                  // AG: Notes
  row[34] = 'Newly Discovered';               // AI: Discovery Status

  sheet.appendRow(row);
  return data.id + ' (' + data.provider + ') added to Master Register';
}


function showAddObligationDialog() {
  const html = `
    <style>
      body { font-family: Calibri, Arial, sans-serif; padding: 16px; color: #333; }
      h3 { color: #1B2A4A; margin-bottom: 8px; }
      label { display: block; font-weight: bold; margin-top: 8px; margin-bottom: 2px; font-size: 11px; color: #1B2A4A; }
      select, input { width: 100%; padding: 5px; font-size: 12px; border: 1px solid #CCC; border-radius: 4px; box-sizing: border-box; }
      .btn { padding: 8px 20px; font-size: 12px; border: none; border-radius: 4px; cursor: pointer; margin-top: 12px; margin-right: 6px; }
      .btn-primary { background: #1B2A4A; color: white; }
      .btn-secondary { background: #E0E0E0; color: #333; }
      #status { margin-top: 8px; font-size: 12px; color: #2E7D32; }
    </style>
    <h3>Add Household Obligation</h3>
    <label>Vendor *</label>
    <input type="text" id="vendor" required />

    <label>Category</label>
    <select id="category">
      <option>Housing</option><option>Utilities</option><option>Debt</option>
      <option>Insurance</option><option>Subscriptions</option><option>Other</option>
    </select>

    <label>Monthly Amount</label>
    <input type="number" id="amount" step="0.01" />

    <label>Due Day (1-31)</label>
    <input type="number" id="dueDay" min="1" max="31" />

    <label>Payment Method</label>
    <select id="payMethod">
      <option>Auto-Pay</option><option>BOA Debit</option><option>BOA Zelle</option>
      <option>Check</option><option>Cash</option><option>PayPal</option><option>Other</option>
    </select>

    <label>Responsible Party</label>
    <select id="party"><option>Clint</option><option>Syrina</option><option>Joint</option></select>

    <label>Status</label>
    <select id="ob_status"><option>Active</option><option>Closed</option></select>

    <label>Notes</label>
    <input type="text" id="notes" />

    <div>
      <button class="btn btn-primary" onclick="submit()">Add Obligation</button>
      <button class="btn btn-secondary" onclick="google.script.host.close()">Close</button>
    </div>
    <div id="status"></div>

    <script>
      function submit() {
        var data = {
          vendor: document.getElementById('vendor').value,
          category: document.getElementById('category').value,
          amount: document.getElementById('amount').value,
          dueDay: document.getElementById('dueDay').value,
          payMethod: document.getElementById('payMethod').value,
          party: document.getElementById('party').value,
          status: document.getElementById('ob_status').value,
          notes: document.getElementById('notes').value
        };
        if (!data.vendor) { alert('Vendor is required'); return; }
        google.script.run
          .withSuccessHandler(function(msg) { document.getElementById('status').textContent = msg; })
          .addObligationEntry(data);
      }
    </script>
  `;

  const output = HtmlService.createHtmlOutput(html).setWidth(340).setHeight(520);
  SpreadsheetApp.getUi().showSidebar(output);
}


function addObligationEntry(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Household Obligations');
  if (!sheet) throw new Error('Household Obligations tab not found');

  const row = [
    data.vendor,
    data.category || '',
    '',                        // Subcategory
    data.amount ? Number(data.amount) : '',
    data.dueDay ? Number(data.dueDay) : '',
    data.payMethod || '',
    data.party || '',
    data.status || 'Active',
    new Date().toISOString().slice(0, 10),  // Start Date
    '',                        // Rate Changes
    data.notes || ''
  ];

  sheet.appendRow(row);
  return data.vendor + ' added to Household Obligations';
}


function showAddSubscriptionDialog() {
  const html = `
    <style>
      body { font-family: Calibri, Arial, sans-serif; padding: 16px; color: #333; }
      h3 { color: #1B2A4A; margin-bottom: 8px; }
      label { display: block; font-weight: bold; margin-top: 8px; margin-bottom: 2px; font-size: 11px; color: #1B2A4A; }
      select, input { width: 100%; padding: 5px; font-size: 12px; border: 1px solid #CCC; border-radius: 4px; box-sizing: border-box; }
      .btn { padding: 8px 20px; font-size: 12px; border: none; border-radius: 4px; cursor: pointer; margin-top: 12px; margin-right: 6px; }
      .btn-primary { background: #1B2A4A; color: white; }
      .btn-secondary { background: #E0E0E0; color: #333; }
      #status { margin-top: 8px; font-size: 12px; color: #2E7D32; }
    </style>
    <h3>Add Subscription / Service</h3>
    <label>Service Name *</label>
    <input type="text" id="service" required />

    <label>Category</label>
    <select id="category">
      <option>Software</option><option>Streaming</option><option>Cloud Storage</option>
      <option>News/Media</option><option>Fitness</option><option>AI/Tech</option><option>Other</option>
    </select>

    <label>Monthly Cost</label>
    <input type="number" id="monthly" step="0.01" />

    <label>Payment Method</label>
    <select id="payMethod">
      <option>BOA Debit</option><option>Cap One</option><option>PayPal</option><option>Other</option>
    </select>

    <label>Responsible Party</label>
    <select id="party"><option>Clint</option><option>Syrina</option><option>Joint</option></select>

    <label>Tax Deductible?</label>
    <select id="taxDed"><option>No</option><option>Yes</option><option>Partial</option></select>

    <label>Business Use %</label>
    <input type="number" id="bizUse" min="0" max="100" value="0" />

    <label>Notes</label>
    <input type="text" id="notes" />

    <div>
      <button class="btn btn-primary" onclick="submit()">Add Subscription</button>
      <button class="btn btn-secondary" onclick="google.script.host.close()">Close</button>
    </div>
    <div id="status"></div>

    <script>
      function submit() {
        var data = {
          service: document.getElementById('service').value,
          category: document.getElementById('category').value,
          monthly: document.getElementById('monthly').value,
          payMethod: document.getElementById('payMethod').value,
          party: document.getElementById('party').value,
          taxDed: document.getElementById('taxDed').value,
          bizUse: document.getElementById('bizUse').value,
          notes: document.getElementById('notes').value
        };
        if (!data.service) { alert('Service name is required'); return; }
        google.script.run
          .withSuccessHandler(function(msg) { document.getElementById('status').textContent = msg; })
          .addSubscriptionEntry(data);
      }
    </script>
  `;

  const output = HtmlService.createHtmlOutput(html).setWidth(340).setHeight(520);
  SpreadsheetApp.getUi().showSidebar(output);
}


function addSubscriptionEntry(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions & Services');
  if (!sheet) throw new Error('Subscriptions & Services tab not found');

  const monthly = data.monthly ? Number(data.monthly) : 0;
  const annual = Math.round(monthly * 12 * 100) / 100;

  const row = [
    data.service,
    data.category || '',
    monthly,
    annual,
    data.payMethod || '',
    data.party || '',
    'Active',                  // Status
    data.taxDed || 'No',
    data.bizUse ? Number(data.bizUse) + '%' : '0%',
    data.notes || ''
  ];

  sheet.appendRow(row);
  return data.service + ' added to Subscriptions & Services (Monthly: $' + monthly.toFixed(2) + ', Annual: $' + annual.toFixed(2) + ')';
}


// ═══════════════════════════════════════════════════════════════════════════
// TRUST ADMIN TOOLS — ADMINISTRATION & UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Refresh dashboard formulas
 */
function refreshDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = ss.getSheetByName('Dashboard') || ss.getSheetByName('Executive Dashboard');
  
  if (!dashboard) {
    SpreadsheetApp.getUi().alert(
      'Dashboard Not Found',
      'Could not find "Dashboard" or "Executive Dashboard" tab.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  dashboard.getRange('B5').setFormula("=IFERROR(COUNTA('Master Register'!C:C)-1,0)");
  dashboard.getRange('B6').setFormula("=IFERROR(COUNTIF('Master Register'!H:H,\"Active\"),0)");
  dashboard.getRange('B7').setFormula("=IFERROR(COUNTIF('Master Register'!H:H,\"Dormant\"),0)");
  dashboard.getRange('B8').setFormula("=IFERROR(COUNTIF('Master Register'!H:H,\"Closed*\"),0)");
  dashboard.getRange('B9').setFormula("=IFERROR(COUNTIF('Master Register'!H:H,\"Disputed\"),0)");
  dashboard.getRange('B11').setFormula("=IFERROR(SUMIF('Master Register'!H:H,\"Active\",'Master Register'!K:K),0)");
  dashboard.getRange('B12').setFormula("=IFERROR(COUNTIF('Master Register'!V:V,\"Y\")/COUNTA('Master Register'!V:V),0)");
  dashboard.getRange('B13').setFormula("=IFERROR(COUNTIF('Master Register'!V:V,\"N\")+COUNTIF('Master Register'!U:U,\"N\"),0)");
  dashboard.getRange('B14').setFormula("=IFERROR(COUNTIF('Master Register'!AA:AA,\"<\"&TODAY()-90),0)");
  
  SpreadsheetApp.getActiveSpreadsheet().toast('Dashboard formulas refreshed!', 'Complete', 3);
}

/**
 * Add sample data
 */
function addSampleData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Add Sample Data?',
    'This will add sample accounts to demonstrate the system.\\n\\nYou can delete these later.\\n\\nContinue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var masterSheet = ss.getSheetByName('Master Register');
  
  if (!masterSheet) {
    ui.alert('Error', 'Master Register tab not found.', ui.ButtonSet.OK);
    return;
  }
  
  var sampleData = [
    ['Bank of America', '12-3456789', '****6198', 'Bank Account', 'Checking', 'Active', '2020-01-15', '', 5234.56],
    ['Fidelity Investments', '04-2731432', '****7819', 'Investment', 'Brokerage', 'Active', '2019-06-01', '', 125000.00],
    ['American Express', '13-4922250', '****1234', 'Credit Card', 'Personal', 'Active', '2018-03-20', '', -2456.78],
    ['Duke Energy', '56-1234567', '****5678', 'Utility', 'Electric', 'Active', '2015-08-01', '', 0]
  ];
  
  var lastRow = masterSheet.getLastRow();
  var startRow = lastRow + 1;
  
  for (var i = 0; i < sampleData.length; i++) {
    masterSheet.getRange(startRow + i, 3, 1, sampleData[i].length).setValues([sampleData[i]]);
  }
  
  ui.alert('Sample Data Added', 
    'Added ' + sampleData.length + ' sample accounts.\\n\\nCheck the Master Register tab!',
    ui.ButtonSet.OK);
}

/**
 * Export current tab to PDF
 */
function exportToPdf() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  var url = ss.getUrl().replace(/edit$/, '') +
    'export?exportFormat=pdf' +
    '&format=pdf' +
    '&gid=' + sheet.getSheetId() +
    '&portrait=false' +
    '&fitw=true' +
    '&gridlines=false' +
    '&printtitle=true' +
    '&sheetnames=true';
  
  var html = 
    '<style>' +
    'body { font-family: Arial, sans-serif; padding: 20px; }' +
    'h3 { color: #1B2A4A; }' +
    '.url-box { background: #F5F5F5; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 11px; word-break: break-all; margin: 12px 0; border: 1px solid #DDD; }' +
    'a { color: #1B2A4A; }' +
    '</style>' +
    '<h3>Export to PDF</h3>' +
    '<p>Click the link below:</p>' +
    '<div class="url-box"><a href="' + url + '" target="_blank">' + sheet.getName() + '.pdf</a></div>';
  
  var output = HtmlService.createHtmlOutput(html).setWidth(500).setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(output, 'Export to PDF');
}
