/**
 * addFilingPackage2025
 * Appends 17 rows to the "Document Registry" tab for the 2025 tax return
 * package filed by Ready Player 1 Tax Pros (Dawn Alderson) on 2026-03-16.
 *
 * HOW TO RUN:
 *   1. Open the TMAR Google Sheet
 *   2. Extensions > Apps Script
 *   3. Paste this entire file, then click ▶ Run (select addFilingPackage2025)
 *   4. Grant permissions when prompted
 */
function addFilingPackage2025() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Document Registry');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('❌ Sheet "Document Registry" not found.');
    return;
  }

  // ── Find last populated DOC- row (ignore blank/formatting rows below data) ─
  const colA       = sheet.getRange(1, 1, sheet.getMaxRows(), 1).getValues().flat();
  let   lastDocNum = 0;
  let   lastDocRow = 1;  // 1-indexed row of the last DOC-XXXX entry

  for (let i = 0; i < colA.length; i++) {
    const v = String(colA[i]);
    if (/^DOC-\d{4}$/.test(v)) {
      lastDocNum = parseInt(v.slice(4), 10);
      lastDocRow = i + 1;
    }
  }

  function nextId() {
    return 'DOC-' + String(++lastDocNum).padStart(4, '0');
  }

  // ── Constants ────────────────────────────────────────────────────────────
  const SCAN_DATE  = '2026-05-06';
  const TAX_YEAR   = '2025';
  const BINDER_TAB = 'Tab 4: Tax Forms & EIN';
  // Relative to FILECABINET_BASE_PATH_ in Code.gs — forward slashes, cross-platform.
  const BASE_PATH  = 'Taxes/RobinHoodReturns';
  const SOURCE_DIR = 'Tax Returns/2025 — Ready Player 1 Tax Pros (Dawn Alderson) | Filed 2026-03-16';

  // ── Rows: 10 cols per row ─────────────────────────────────────────────────
  // [ Doc ID, Filename, Document Type, Tax Year, Person, MR Account, FWM Binder Tab, Full File Path, Source Directory, Scan Date ]
  const rows = [
    // ── Core Return ──────────────────────────────────────────────────────
    [nextId(), '2025_Form1040.pdf',
      'Tax Return', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_Form1040.pdf', SOURCE_DIR, SCAN_DATE],

    [nextId(), '2025_Schedule1_AdditionalIncome.pdf',
      'Government Form', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_Schedule1_AdditionalIncome.pdf', SOURCE_DIR, SCAN_DATE],

    [nextId(), '2025_Schedule2_AdditionalTaxes.pdf',
      'Government Form', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_Schedule2_AdditionalTaxes.pdf', SOURCE_DIR, SCAN_DATE],

    [nextId(), '2025_ScheduleA_ItemizedDeductions.pdf',
      'Government Form', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_ScheduleA_ItemizedDeductions.pdf', SOURCE_DIR, SCAN_DATE],

    // ── Worksheets ───────────────────────────────────────────────────────
    [nextId(), '2025_CapitalGainTaxWorksheet.pdf',
      'Tax Worksheet', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_CapitalGainTaxWorksheet.pdf', SOURCE_DIR, SCAN_DATE],

    [nextId(), '2025_EIC_NoDependents.pdf',
      'Tax Worksheet', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_EIC_NoDependents.pdf', SOURCE_DIR, SCAN_DATE],

    [nextId(), '2025_OtherIncome_Statements_x3.pdf',
      'Tax Worksheet', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_OtherIncome_Statements_x3.pdf', SOURCE_DIR, SCAN_DATE],

    // ── Substitute W-2s ──────────────────────────────────────────────────
    [nextId(), '2025_Form4852_1_Syrina_BGC.pdf',
      'Government Form', TAX_YEAR, 'Syrina', '', BINDER_TAB,
      BASE_PATH + '/2025_Form4852_1_Syrina_BGC.pdf', SOURCE_DIR, SCAN_DATE],

    [nextId(), '2025_Form4852_2_Clinton_InterTech.pdf',
      'Government Form', TAX_YEAR, 'Clinton', '', BINDER_TAB,
      BASE_PATH + '/2025_Form4852_2_Clinton_InterTech.pdf', SOURCE_DIR, SCAN_DATE],

    // ── Power of Attorney ────────────────────────────────────────────────
    [nextId(), '2025_Form2848_POA_Syrina.pdf',
      'Government Form', TAX_YEAR, 'Syrina', '', BINDER_TAB,
      BASE_PATH + '/2025_Form2848_POA_Syrina.pdf', SOURCE_DIR, SCAN_DATE],

    [nextId(), '2025_Form2848_POA_Clinton.pdf',
      'Government Form', TAX_YEAR, 'Clinton', '', BINDER_TAB,
      BASE_PATH + '/2025_Form2848_POA_Clinton.pdf', SOURCE_DIR, SCAN_DATE],

    // ── Authorization & Compliance ───────────────────────────────────────
    [nextId(), '2025_Form8275R_RegDisclosure.pdf',
      'Government Form', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_Form8275R_RegDisclosure.pdf', SOURCE_DIR, SCAN_DATE],

    [nextId(), '2025_Form8879_EfileSignAuth.pdf',
      'Government Form', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_Form8879_EfileSignAuth.pdf', SOURCE_DIR, SCAN_DATE],

    [nextId(), '2025_Form8453_EfileDeclaration.pdf',
      'Government Form', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_Form8453_EfileDeclaration.pdf', SOURCE_DIR, SCAN_DATE],

    [nextId(), '2025_Form8867_DueDiligence.pdf',
      'Government Form', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_Form8867_DueDiligence.pdf', SOURCE_DIR, SCAN_DATE],

    // ── NC State Return ──────────────────────────────────────────────────
    [nextId(), '2025_NC_D400_StateReturn.pdf',
      'State Tax Return', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_NC_D400_StateReturn.pdf', SOURCE_DIR, SCAN_DATE],

    [nextId(), '2025_NC_ScheduleA_StateDeductions.pdf',
      'State Tax Return', TAX_YEAR, 'Joint', '', BINDER_TAB,
      BASE_PATH + '/2025_NC_ScheduleA_StateDeductions.pdf', SOURCE_DIR, SCAN_DATE],
  ];

  // ── Write immediately after the last DOC- row ───────────────────────────
  const startRow = lastDocRow + 1;
  sheet.getRange(startRow, 1, rows.length, 10).setValues(rows);

  const firstId = 'DOC-' + String(lastDocNum - rows.length + 1).padStart(4, '0');
  const lastId  = 'DOC-' + String(lastDocNum).padStart(4, '0');

  SpreadsheetApp.getUi().alert(
    '✅ 2025 Filing Package added to Document Registry\n\n' +
    'Rows inserted : ' + startRow + ' – ' + (startRow + rows.length - 1) + '\n' +
    'Doc IDs       : ' + firstId + ' – ' + lastId + '\n' +
    'Forms logged  : ' + rows.length + '\n\n' +
    'Preparer: Dawn Alderson / Ready Player 1 Tax Pros\n' +
    'Filed: 2026-03-16 | Tax Year: 2025'
  );
}
