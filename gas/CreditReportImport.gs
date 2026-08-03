/**
 * TMAR — Syrina Credit Report Account Import
 * ============================================
 * Adds all accounts from Syrina's TransUnion Credit Report (01/15/2026)
 * to both the Master Register and Acct Ledger sheets.
 *
 * USAGE:
 *   1. Open your TMAR Google Sheet
 *   2. Extensions → Apps Script
 *   3. Paste this entire file into a new script file (or append to existing)
 *   4. Save, then run: importSyrinaCreditReportAccounts()
 *   5. Check Master Register and Acct Ledger tabs for new rows
 *
 * This script will:
 *   - Find the next available MR-XXX ID
 *   - Skip accounts that already exist (matches on Provider + Account Type)
 *   - Add new rows to Master Register (35-col schema)
 *   - Add corresponding rows to Acct Ledger (EIN cross-reference)
 *   - Color-code rows by status
 */


// ─── CREDIT REPORT DATA ────────────────────────────────────────────────────

function getSyrinaCreditReportAccounts_() {
  const today = new Date().toISOString().slice(0, 10);

  return [
    // ═══════════════════════════════════════════════════════════════════
    // ADVERSE ACCOUNTS — Charge-offs
    // ═══════════════════════════════════════════════════════════════════
    {
      provider:       'Capital One',
      ein:            '',
      acctNumber:     '',
      acctType:       'Credit Card',
      acctSubtype:    'Paid C/O',
      status:         'Closed',
      opened:         '07/2019',
      closed:         '02/2021',
      balance:        0,
      highBal:        669,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Paid Charge-off',
      removalDate:    '08/2027',
      taxRelevance:   'No 1099-C — paid in full',
      notes:          'TransUnion: Paid charge-off. $0 balance. Removes 08/2027.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'Continental Finance',
      ein:            '',
      acctNumber:     '',
      acctType:       'Credit Card',
      acctSubtype:    'Sold/C/O',
      status:         'Closed',
      opened:         '11/2023',
      closed:         '05/2025',
      balance:        0,
      highBal:        1521,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Sold to LVNV / Charge-off',
      removalDate:    '12/2031',
      taxRelevance:   'LVNV now owns — watch for 1099-C',
      notes:          'TransUnion: Sold to LVNV Funding. Original high $1,521. See MR for LVNV collection entry.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'First Premier Bank',
      ein:            '46-0119480',
      acctNumber:     '51780068421*****',
      acctType:       'Credit Card',
      acctSubtype:    'Charge-off',
      status:         'Closed',
      opened:         '09/2019',
      closed:         '12/2020',
      balance:        627,
      highBal:        627,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Active Charge-off',
      removalDate:    '06/2027',
      taxRelevance:   '$627 still owed — may get 1099-C if settled',
      notes:          'TransUnion: Active charge-off since 12/2020. $627 outstanding. Removes 06/2027.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'Launch Servicing',
      ein:            '',
      acctNumber:     '',
      acctType:       'Student Loan',
      acctSubtype:    'C/O Transferred',
      status:         'Closed',
      opened:         '01/2018',
      closed:         '05/2022',
      balance:        0,
      highBal:        5807,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Charge-off / Transferred to Recovery',
      removalDate:    '09/2028',
      taxRelevance:   'Transferred to recovery — check if Nelnet absorbed',
      notes:          'TransUnion: C/O transferred to recovery. $0 balance. Verify if consolidated into Nelnet loans.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'Merrick Bank',
      ein:            '91-1756404',
      acctNumber:     '54631667117*****',
      acctType:       'Credit Card',
      acctSubtype:    'Charge-off',
      status:         'Closed',
      opened:         '07/2023',
      closed:         '06/2025',
      balance:        1657,
      highBal:        1657,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Active Charge-off',
      removalDate:    '01/2032',
      taxRelevance:   '$1,657 active C/O — accruing interest. 1099-C risk.',
      notes:          'TransUnion: Charged off 09/2025. $1,657 outstanding. Removes 01/2032.',
      source:         'TransUnion Credit Report 01/15/2026',
    },

    // ═══════════════════════════════════════════════════════════════════
    // ADVERSE ACCOUNTS — Collections
    // ═══════════════════════════════════════════════════════════════════
    {
      provider:       'LVNV Funding (Credit One)',
      ein:            '',
      acctNumber:     '',
      acctType:       'Collection',
      acctSubtype:    'Debt Buyer',
      status:         'Active',
      opened:         '08/2025',
      closed:         '',
      balance:        806,
      highBal:        834,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Active Collection',
      removalDate:    '12/2031',
      taxRelevance:   'Original: Credit One Bank N.A. — 1099-C risk if settled',
      notes:          'TransUnion: Collection by LVNV. Original creditor: Credit One Bank N.A. $806 balance.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'LVNV Funding (Verve/Continental)',
      ein:            '',
      acctNumber:     '',
      acctType:       'Collection',
      acctSubtype:    'Debt Buyer',
      status:         'Active',
      opened:         '06/2025',
      closed:         '',
      balance:        1521,
      highBal:        1521,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Active Collection',
      removalDate:    '12/2031',
      taxRelevance:   'Original: Verve Bank / Continental Finance — 1099-C risk',
      notes:          'TransUnion: Collection by LVNV. Original: Verve Bank/Continental Finance. $1,521 balance.',
      source:         'TransUnion Credit Report 01/15/2026',
    },

    // ═══════════════════════════════════════════════════════════════════
    // CURRENT ACCOUNTS — Student Loans (7 individual Nelnet loans)
    // ═══════════════════════════════════════════════════════════════════
    {
      provider:       'Nelnet — Loan #1',
      ein:            '84-0748903',
      acctNumber:     'E985506201',
      acctType:       'Student Loan',
      acctSubtype:    'Federal',
      status:         'Active',
      opened:         '09/2011',
      closed:         '',
      balance:        5344,
      highBal:        4500,
      monthlyPmt:     16,
      primaryUser:    'Syrina',
      creditStatus:   'Current — IDR',
      removalDate:    '',
      taxRelevance:   'Interest deductible up to $2,500 (1098-E). 300 mo term.',
      notes:          'TransUnion: Current. IDR plan. Opened 09/01/2011. Original balance $4,500.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'Nelnet — Loan #2',
      ein:            '84-0748903',
      acctNumber:     'E985506201',
      acctType:       'Student Loan',
      acctSubtype:    'Federal',
      status:         'Active',
      opened:         '08/2015',
      closed:         '',
      balance:        4930,
      highBal:        4500,
      monthlyPmt:     17,
      primaryUser:    'Syrina',
      creditStatus:   'Current — IDR',
      removalDate:    '',
      taxRelevance:   'Interest deductible up to $2,500 (1098-E). 300 mo term.',
      notes:          'TransUnion: Current. IDR plan. Opened 08/27/2015. Original balance $4,500.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'Nelnet — Loan #3',
      ein:            '84-0748903',
      acctNumber:     'E985506201',
      acctType:       'Student Loan',
      acctSubtype:    'Federal',
      status:         'Active',
      opened:         '08/2015',
      closed:         '',
      balance:        7399,
      highBal:        6000,
      monthlyPmt:     25,
      primaryUser:    'Syrina',
      creditStatus:   'Current — IDR',
      removalDate:    '',
      taxRelevance:   'Interest deductible up to $2,500 (1098-E). 300 mo term.',
      notes:          'TransUnion: Current. IDR plan. Opened 08/27/2015. Original balance $6,000.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'Nelnet — Loan #4',
      ein:            '84-0748903',
      acctNumber:     'E985506201',
      acctType:       'Student Loan',
      acctSubtype:    'Federal',
      status:         'Active',
      opened:         '02/2018',
      closed:         '',
      balance:        3587,
      highBal:        3403,
      monthlyPmt:     12,
      primaryUser:    'Syrina',
      creditStatus:   'Current — IDR',
      removalDate:    '',
      taxRelevance:   'Interest deductible up to $2,500 (1098-E). 300 mo term.',
      notes:          'TransUnion: Current. IDR plan. Opened 02/23/2018. Original balance $3,403.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'Nelnet — Loan #5',
      ein:            '84-0748903',
      acctNumber:     'E985506201',
      acctType:       'Student Loan',
      acctSubtype:    'Federal',
      status:         'Active',
      opened:         '02/2018',
      closed:         '',
      balance:        6486,
      highBal:        5833,
      monthlyPmt:     22,
      primaryUser:    'Syrina',
      creditStatus:   'Current — IDR',
      removalDate:    '',
      taxRelevance:   'Interest deductible up to $2,500 (1098-E). 300 mo term.',
      notes:          'TransUnion: Current. IDR plan. Opened 02/23/2018. Original balance $5,833.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'Nelnet — Loan #6',
      ein:            '84-0748903',
      acctNumber:     'E985506201',
      acctType:       'Student Loan',
      acctSubtype:    'Federal',
      status:         'Active',
      opened:         '07/2012',
      closed:         '',
      balance:        10239,
      highBal:        7920,
      monthlyPmt:     28,
      primaryUser:    'Syrina',
      creditStatus:   'Current — IDR',
      removalDate:    '',
      taxRelevance:   'Interest deductible up to $2,500 (1098-E). 300 mo term.',
      notes:          'TransUnion: Current. IDR plan. Opened 07/13/2012. Original balance $7,920.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'Nelnet — Loan #7',
      ein:            '84-0748903',
      acctNumber:     'E985506201',
      acctType:       'Student Loan',
      acctSubtype:    'Federal',
      status:         'Active',
      opened:         '07/2012',
      closed:         '',
      balance:        5461,
      highBal:        4628,
      monthlyPmt:     15,
      primaryUser:    'Syrina',
      creditStatus:   'Current — IDR',
      removalDate:    '',
      taxRelevance:   'Interest deductible up to $2,500 (1098-E). 300 mo term.',
      notes:          'TransUnion: Current. IDR plan. Opened 07/13/2012. Original balance $4,628.',
      source:         'TransUnion Credit Report 01/15/2026',
    },

    // ═══════════════════════════════════════════════════════════════════
    // CURRENT ACCOUNTS — Personal Loan
    // ═══════════════════════════════════════════════════════════════════
    {
      provider:       'OneMain Financial (active)',
      ein:            '27-4393679',
      acctNumber:     '3243985015137137',
      acctType:       'Personal Loan',
      acctSubtype:    'Unsecured',
      status:         'Active',
      opened:         '03/2024',
      closed:         '',
      balance:        3298,
      highBal:        4447,
      monthlyPmt:     167,
      primaryUser:    'Syrina',
      creditStatus:   'Current',
      removalDate:    '',
      taxRelevance:   'Interest NOT deductible (personal loan). 48 mo term. Payoff ~03/2028.',
      notes:          'TransUnion: Current. Unsecured personal loan. Refi of prior OneMain secured loan.',
      source:         'TransUnion Credit Report 01/15/2026',
    },

    // ═══════════════════════════════════════════════════════════════════
    // CLOSED/PAID ACCOUNTS
    // ═══════════════════════════════════════════════════════════════════
    {
      provider:       'Credit One Bank',
      ein:            '',
      acctNumber:     '',
      acctType:       'Credit Card',
      acctSubtype:    'Closed by Grantor',
      status:         'Closed',
      opened:         '09/2023',
      closed:         '10/2023',
      balance:        0,
      highBal:        104,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Closed by Grantor',
      removalDate:    '',
      taxRelevance:   'Closed by grantor — no balance. No tax impact.',
      notes:          'TransUnion: Closed by grantor after 1 month. High balance $104.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'OneMain Financial (2019)',
      ein:            '27-4393679',
      acctNumber:     '',
      acctType:       'Secured Loan',
      acctSubtype:    'Refinanced/Paid',
      status:         'Closed',
      opened:         '06/2019',
      closed:         '03/2024',
      balance:        0,
      highBal:        21634,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Paid — Refinanced',
      removalDate:    '',
      taxRelevance:   'Refinanced into current OneMain unsecured loan.',
      notes:          'TransUnion: Paid. Refinanced into 2024 unsecured loan. High balance $21,634.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'OneMain Financial (2018)',
      ein:            '27-4393679',
      acctNumber:     '',
      acctType:       'Secured Loan',
      acctSubtype:    'Refinanced/Paid',
      status:         'Closed',
      opened:         '01/2018',
      closed:         '06/2019',
      balance:        0,
      highBal:        21031,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Paid — Refinanced',
      removalDate:    '',
      taxRelevance:   'Refinanced into 2019 OneMain secured loan.',
      notes:          'TransUnion: Paid. Refinanced into 2019 loan. High balance $21,031.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'OneMain Financial (2016)',
      ein:            '27-4393679',
      acctNumber:     '',
      acctType:       'Secured Loan',
      acctSubtype:    'Refinanced/Paid',
      status:         'Closed',
      opened:         '04/2016',
      closed:         '01/2018',
      balance:        0,
      highBal:        3114,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Paid — Refinanced',
      removalDate:    '',
      taxRelevance:   'Refinanced into 2018 OneMain secured loan.',
      notes:          'TransUnion: Paid. Refinanced into 2018 loan. High balance $3,114.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'SE Toyota Financial',
      ein:            '',
      acctNumber:     '',
      acctType:       'Auto Loan',
      acctSubtype:    'Paid & Closed',
      status:         'Closed',
      opened:         '10/2016',
      closed:         '01/2018',
      balance:        0,
      highBal:        19656,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Paid & Closed',
      removalDate:    '',
      taxRelevance:   'No tax impact — fully paid auto loan.',
      notes:          'TransUnion: Paid and closed. High balance $19,656.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'Springleaf Financial',
      ein:            '',
      acctNumber:     '',
      acctType:       'Secured Loan',
      acctSubtype:    'Refinanced/Paid',
      status:         'Closed',
      opened:         '01/2015',
      closed:         '03/2016',
      balance:        0,
      highBal:        7103,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Paid — Refinanced',
      removalDate:    '',
      taxRelevance:   'Refinanced into OneMain Financial (2016).',
      notes:          'TransUnion: Paid. Precursor to OneMain refi chain. High balance $7,103.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'US Dept of Ed / Great Lakes (GLE)',
      ein:            '',
      acctNumber:     '',
      acctType:       'Student Loan',
      acctSubtype:    'Transferred',
      status:         'Closed',
      opened:         '07/2012',
      closed:         '01/2023',
      balance:        0,
      highBal:        12548,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Transferred to Nelnet',
      removalDate:    '',
      taxRelevance:   'Now serviced as Nelnet Loan #6 & #7.',
      notes:          'TransUnion: Transferred to Nelnet Jan 2023. Original high $12,548.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'US Dept of Ed / Great Lakes (GL)',
      ein:            '',
      acctNumber:     '',
      acctType:       'Student Loan',
      acctSubtype:    'Transferred',
      status:         'Closed',
      opened:         '09/2011',
      closed:         '01/2023',
      balance:        0,
      highBal:        24236,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Transferred to Nelnet',
      removalDate:    '',
      taxRelevance:   'Now serviced as Nelnet Loan #1.',
      notes:          'TransUnion: Transferred to Nelnet Jan 2023. Original high $24,236.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
    {
      provider:       'WebBank / FreshStart',
      ein:            '',
      acctNumber:     '',
      acctType:       'Installment Loan',
      acctSubtype:    'Paid & Closed',
      status:         'Closed',
      opened:         '11/2018',
      closed:         '12/2018',
      balance:        0,
      highBal:        129,
      monthlyPmt:     0,
      primaryUser:    'Syrina',
      creditStatus:   'Paid & Closed',
      removalDate:    '',
      taxRelevance:   'No tax impact — fully paid installment loan.',
      notes:          'TransUnion: Paid and closed within 1 month. High balance $129.',
      source:         'TransUnion Credit Report 01/15/2026',
    },
  ];
}


// ─── MASTER REGISTER IMPORT ─────────────────────────────────────────────────

/**
 * Main entry point — run this function from Apps Script.
 */
function importSyrinaCreditReportAccounts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const accounts = getSyrinaCreditReportAccounts_();

  // Import to Master Register
  const mrResult = importToMasterRegister_(ss, accounts);

  // Import to Acct Ledger
  const alResult = importToAcctLedger_(ss, accounts);

  const msg = 'Credit Report Import Complete!\n\n' +
    'Master Register: ' + mrResult.added + ' added, ' + mrResult.skipped + ' skipped (already exist)\n' +
    'Acct Ledger: ' + alResult.added + ' added, ' + alResult.skipped + ' skipped (already exist)';

  ui.alert(msg);
  Logger.log(msg);
}


/** 'MM/YYYY' -> 'YYYY-MM-01' (matches the sheet's date convention). Passes through '', already-ISO, or unparseable input unchanged. */
function normalizeMonthYear_(val) {
  if (!val) return '';
  var m = String(val).match(/^(\d{2})\/(\d{4})$/);
  if (!m) return val;
  return m[2] + '-' + m[1] + '-01';
}

function importToMasterRegister_(ss, accounts) {
  const sheet = ss.getSheetByName('Master Register');
  if (!sheet) {
    Logger.log('ERROR: Master Register sheet not found');
    return { added: 0, skipped: 0 };
  }

  const lastRow = sheet.getLastRow();
  const lastCol = Math.min(sheet.getLastColumn(), 35);

  // Read existing data to find max MR ID and check for duplicates
  let existingData = [];
  if (lastRow > 1) {
    existingData = sheet.getRange(2, 1, lastRow - 1, Math.max(lastCol, 7)).getValues();
  }

  // Find max MR-XXX number
  let maxId = 0;
  const existingProviders = new Set();
  for (const row of existingData) {
    const idStr = String(row[0] || '');
    const match = idStr.match(/MR-(\d+)/);
    if (match) maxId = Math.max(maxId, parseInt(match[1]));

    // Build dedup key: Provider + Account Type. Fixed 2026-08-03 -- was
    // reading row[6] (Account Subtype, e.g. "Paid C/O") and comparing it
    // against the incoming record's real Account Type (e.g. "Credit Card"),
    // so this almost never matched and reruns would duplicate rows. row[5]
    // is the real Account Type column, matching what acct.acctType holds.
    const provider = String(row[2] || '').trim().toLowerCase();
    const acctType = String(row[5] || '').trim().toLowerCase();
    if (provider) existingProviders.add(provider + '|' + acctType);
  }

  let nextId = maxId + 1;
  let added = 0;
  let skipped = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (const acct of accounts) {
    // Dedup check
    const key = acct.provider.trim().toLowerCase() + '|' + acct.acctType.trim().toLowerCase();
    if (existingProviders.has(key)) {
      Logger.log('SKIP (exists): ' + acct.provider + ' / ' + acct.acctType);
      skipped++;
      continue;
    }

    // Build row matching the LIVE Master Register header (29 real columns —
    // NOT the 35-column layout in domain-models.md, which is stale relative
    // to this sheet; verified against the live header 2026-08-01 after this
    // mismatch silently shifted MR-112/114/116/146 by several columns).
    const mrId = 'MR-' + String(nextId).padStart(3, '0');
    const row = new Array(29).fill('');

    // Fold every field that has no dedicated live column into one Notes string.
    const combinedNotes = [
      acct.creditStatus,
      acct.notes,
      acct.taxRelevance,
      acct.removalDate ? ('Removal: ' + normalizeMonthYear_(acct.removalDate)) : '',
      acct.source ? ('Source: ' + acct.source) : ''
    ].filter(Boolean).join(' ');

    row[0]  = mrId;                            // Row ID
    row[1]  = today;                           // Date Added
    row[2]  = acct.provider;                   // Provider/Creditor
    row[3]  = acct.ein;                        // Provider EIN
    row[4]  = acct.acctNumber;                 // Account Number
    row[5]  = acct.acctType;                   // Account Type
    row[6]  = acct.acctSubtype;                // Account Subtype
    row[7]  = acct.status;                     // Status
    row[8]  = normalizeMonthYear_(acct.opened);   // Open Date
    row[9]  = normalizeMonthYear_(acct.closed);   // Close Date
    row[10] = acct.balance;                    // Current Balance
    row[11] = acct.highBal;                    // Original Balance
    row[12] = '';                               // Billing Frequency
    row[13] = '';                               // Next Payment Due
    row[14] = acct.primaryUser;                // Primary User
    row[15] = '';                               // Authorized Users
    row[16] = '';                               // Autopay Status
    row[17] = '';                               // Payment Source
    row[18] = '';                               // Contract/Terms File
    row[19] = '';                               // Statements Complete
    row[20] = '';                               // Tax Forms on File
    row[21] = '';                               // PoP Documents
    row[22] = '';                               // Document Location
    row[23] = '';                               // Last Statement Date
    row[24] = '2026-01-15';                    // Last Verified Date (credit report pull date)
    row[25] = '';                               // Retention Period
    row[26] = combinedNotes;                   // Notes
    row[27] = '';                               // Tags
    row[28] = 'Newly Discovered';              // Discovery Status

    sheet.appendRow(row);
    existingProviders.add(key);
    nextId++;
    added++;
    Logger.log('ADDED: ' + mrId + ' — ' + acct.provider);
  }

  // Color-code the newly added rows
  if (added > 0) {
    colorCodeMasterRegisterRows_(sheet);
  }

  return { added: added, skipped: skipped };
}


// ─── ACCT LEDGER IMPORT ─────────────────────────────────────────────────────

function importToAcctLedger_(ss, accounts) {
  let sheet = ss.getSheetByName('Acct Ledger');
  if (!sheet) {
    // Try alternate names
    sheet = ss.getSheetByName('EIN Acct Ledger');
    if (!sheet) {
      Logger.log('WARNING: Acct Ledger sheet not found — creating it');
      sheet = createAcctLedgerSheet_(ss);
    }
  }

  const lastRow = sheet.getLastRow();
  const lastCol = Math.max(sheet.getLastColumn(), 10);

  // Read existing to dedup
  let existingData = [];
  if (lastRow > 1) {
    existingData = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  }

  // Build dedup set (Provider + EIN)
  const existingEntries = new Set();
  for (const row of existingData) {
    const provider = String(row[0] || '').trim().toLowerCase();
    const ein = String(row[1] || '').trim();
    if (provider) existingEntries.add(provider + '|' + ein);
  }

  // Deduplicate accounts by provider+EIN (Nelnet appears 7 times but same EIN)
  const uniqueAccounts = new Map();
  for (const acct of accounts) {
    const key = acct.provider.trim().toLowerCase() + '|' + acct.ein;
    if (!uniqueAccounts.has(key)) {
      uniqueAccounts.set(key, acct);
    }
  }

  let added = 0;
  let skipped = 0;

  for (const [key, acct] of uniqueAccounts) {
    if (existingEntries.has(key)) {
      skipped++;
      continue;
    }

    // Acct Ledger columns:
    // A: Provider/Creditor
    // B: Provider EIN
    // C: Account Number
    // D: Account Type
    // E: Account Subtype
    // F: Status
    // G: Primary User
    // H: Opened Date
    // I: Closed Date
    // J: MR Row ID (linked)
    // K: Notes/Source
    const row = [
      acct.provider,
      acct.ein,
      acct.acctNumber,
      acct.acctType,
      acct.acctSubtype,
      acct.status,
      acct.primaryUser,
      acct.opened,
      acct.closed,
      '', // MR Row ID — will need manual linking or lookup
      acct.source,
    ];

    sheet.appendRow(row);
    existingEntries.add(key);
    added++;
  }

  return { added: added, skipped: skipped };
}


function createAcctLedgerSheet_(ss) {
  const sheet = ss.insertSheet('Acct Ledger');

  const headers = [
    'Provider/Creditor', 'Provider EIN', 'Account Number',
    'Account Type', 'Account Subtype', 'Status',
    'Primary User', 'Opened Date', 'Closed Date',
    'MR Row ID', 'Source'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#1B2A4A')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontFamily('Calibri')
    .setFontSize(10)
    .setHorizontalAlignment('center');

  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 180);
  sheet.setColumnWidth(4, 140);
  sheet.setColumnWidth(5, 140);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 100);
  sheet.setColumnWidth(8, 100);
  sheet.setColumnWidth(9, 100);
  sheet.setColumnWidth(10, 80);
  sheet.setColumnWidth(11, 280);

  sheet.setFrozenRows(1);
  sheet.setTabColor('#1B2A4A');

  return sheet;
}


// ─── COLOR CODING ───────────────────────────────────────────────────────────

/**
 * Colors newly-imported rows by Status. Simplified 2026-08-03: previously
 * also branched on a "Credit Report Status" column (creditCol=30/AD) that
 * doesn't exist in the real 29-col schema -- that data is folded into
 * free-text Notes instead (see combinedNotes in importToMasterRegister_),
 * so there's no structured column left to color by charge-off/collection
 * detail. Dropped that logic rather than parse it back out of Notes text;
 * status-based coloring (statusCol corrected 11->8) still works.
 */
function colorCodeMasterRegisterRows_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const statusCol = 8;  // H: Status
  const statuses = sheet.getRange(2, statusCol, lastRow - 1, 1).getValues().flat();

  for (let i = 0; i < statuses.length; i++) {
    const status = String(statuses[i]).toLowerCase();
    const rowNum = i + 2;

    let bgColor = null;
    if (status === 'closed') {
      bgColor = '#E0E0E0';  // Gray — closed
    } else if (status === 'active') {
      bgColor = '#E8F5E9';  // Green — active
    } else if (status === 'disputed') {
      bgColor = '#FFE0B2';  // Orange — disputed
    }

    if (bgColor) {
      sheet.getRange(rowNum, 1, 1, 29).setBackground(bgColor);
    }
  }
}


// ─── CLINTON CREDIT REPORT DATA ─────────────────────────────────────────────

function getClintCreditReportAccounts_() {
  const today = new Date().toISOString().slice(0, 10);

  return [
    // ═══════════════════════════════════════════════════════════════════
    // ACTIVE ACCOUNTS
    // ═══════════════════════════════════════════════════════════════════
    {
      provider:     'ECSI (Educational Computer Systems)',
      ein:          '',
      acctNumber:   '*R24A',
      acctType:     'Student Loan',
      acctSubtype:  'Education Loan',
      status:       'Active',
      opened:       '09/13/1994',
      closed:       '',
      balance:      186,
      highBal:      3071,
      monthlyPmt:   40,
      primaryUser:  'Clint',
      creditStatus: 'Current — Paying as Agreed',
      removalDate:  '',
      taxRelevance: 'Student loan interest deductible up to $2,500/yr (Form 1040 Sch 1 L21). Request 1098-E.',
      notes:        'Oldest active account (30+ yrs). ~5 months to payoff at $40/mo. Contact: (412) 788-3900.',
      source:       'Credit Report Sheets 2025-2026',
    },
    {
      provider:     'Elan Financial Services / Fidelity',
      ein:          '',
      acctNumber:   '',
      acctType:     'Credit Card',
      acctSubtype:  'Flexible Spending',
      status:       'Active',
      opened:       '09/2025',
      closed:       '',
      balance:      0,
      highBal:      1500,
      monthlyPmt:   0,
      primaryUser:  'Clint',
      creditStatus: 'Current — $0 Balance',
      removalDate:  '',
      taxRelevance: 'No tax impact — revolving credit. Keep utilization under 30% ($450 max).',
      notes:        '$1,500 limit. Keep utilization under 30%. Pay in full monthly to build payment history.',
      source:       'Credit Report Sheets 2025-2026',
    },

    // ═══════════════════════════════════════════════════════════════════
    // ADVERSE ACCOUNTS — Collection
    // ═══════════════════════════════════════════════════════════════════
    {
      provider:     'US Dept of Education / Perkins Loans',
      ein:          '',
      acctNumber:   '6473XXXX',
      acctType:     'Student Loan',
      acctSubtype:  'Perkins Loan',
      status:       'Active',
      opened:       '01/13/2025',
      closed:       '',
      balance:      191,
      highBal:      187,
      monthlyPmt:   0,
      primaryUser:  'Clint',
      creditStatus: 'Collection — Cannot Locate Consumer',
      removalDate:  '11/2030',
      taxRelevance: 'Collection interest not deductible. Pay immediately; request pay-for-delete. Possible 1099-C if >$600 forgiven (unlikely at $191).',
      notes:        'Removes 11/2030. Address: 3130 Fairview Park Dr Ste 800, Falls Church VA. Call 1-800-4-FED-AID.',
      source:       'Credit Report Sheets 2025-2026',
    },

    // ═══════════════════════════════════════════════════════════════════
    // CLOSED / PAID ACCOUNTS
    // ═══════════════════════════════════════════════════════════════════
    {
      provider:     'Capital One (Clinton)',
      ein:          '',
      acctNumber:   '517805XXXX',
      acctType:     'Credit Card',
      acctSubtype:  'Paid/Closed',
      status:       'Closed',
      opened:       '09/2017',
      closed:       '02/2023',
      balance:      0,
      highBal:      626,
      monthlyPmt:   0,
      primaryUser:  'Clint',
      creditStatus: 'Paid/Closed',
      removalDate:  '',
      taxRelevance: 'No tax impact — paid in full. Limit was $500.',
      notes:        'Closed Feb 2023. High balance $626. PO Box 31293, Salt Lake City UT 84131.',
      source:       'Credit Report Sheets 2025-2026',
    },
    {
      provider:     'Cornerstone / UT Higher Ed Authority',
      ein:          '',
      acctNumber:   '7656099424KU0****',
      acctType:     'Student Loan',
      acctSubtype:  'Federal — Transferred',
      status:       'Closed',
      opened:       '01/2009',
      closed:       '11/2020',
      balance:      0,
      highBal:      6567,
      monthlyPmt:   0,
      primaryUser:  'Clint',
      creditStatus: 'Transferred — Servicer 1 of 3',
      removalDate:  '',
      taxRelevance: 'Part of single-loan transfer chain (Cornerstone → FedLoan → MOHELA). $0 owed.',
      notes:        'Transferred to FedLoan Servicing 11/2020. POB 145122, Salt Lake City UT 84114.',
      source:       'Credit Report Sheets 2025-2026',
    },
    {
      provider:     'FedLoan Servicing (PHEAA)',
      ein:          '',
      acctNumber:   '7656099424FD0****',
      acctType:     'Student Loan',
      acctSubtype:  'Federal — Transferred',
      status:       'Closed',
      opened:       '01/2009',
      closed:       '10/2021',
      balance:      0,
      highBal:      6567,
      monthlyPmt:   0,
      primaryUser:  'Clint',
      creditStatus: 'Transferred — Servicer 2 of 3',
      removalDate:  '',
      taxRelevance: 'Transferred to MOHELA 10/2021. Same underlying loan as Cornerstone entry.',
      notes:        'Received from Cornerstone, transferred to MOHELA. POB 60610, Harrisburg PA 17106.',
      source:       'Credit Report Sheets 2025-2026',
    },
    {
      provider:     'MOHELA / MO Higher Ed Loan Auth',
      ein:          '',
      acctNumber:   '241950XXXX',
      acctType:     'Student Loan',
      acctSubtype:  'Federal — Paid/Closed',
      status:       'Closed',
      opened:       '01/2009',
      closed:       '10/2021',
      balance:      0,
      highBal:      9592,
      monthlyPmt:   0,
      primaryUser:  'Clint',
      creditStatus: 'Paid/Closed — Final Servicer',
      removalDate:  '',
      taxRelevance: 'Loan fully paid. Servicer 3 of 3 in transfer chain. $0 owed.',
      notes:        'Final servicer — loan paid in full. 633 Spirit Dr, Chesterfield MO 63005. (888) 866-4352.',
      source:       'Credit Report Sheets 2025-2026',
    },
    {
      provider:     'WebBank / Fingerhut',
      ein:          '',
      acctNumber:   '636992XXXX',
      acctType:     'Credit Card',
      acctSubtype:  'Charge Account — Paid/Closed',
      status:       'Closed',
      opened:       '03/2018',
      closed:       '04/2020',
      balance:      0,
      highBal:      652,
      monthlyPmt:   0,
      primaryUser:  'Clint',
      creditStatus: 'Paid/Closed',
      removalDate:  '',
      taxRelevance: 'No tax impact — fully paid. Limit was $1,000.',
      notes:        '6250 Ridgewood Rd, St Cloud MN 56301. Phone: 866-734-0342.',
      source:       'Credit Report Sheets 2025-2026',
    },
    {
      provider:     'SyncB / CareCredit',
      ein:          '',
      acctNumber:   '*8786',
      acctType:     'Credit Card',
      acctSubtype:  'Charge Account — Paid/Closed',
      status:       'Closed',
      opened:       '06/2012',
      closed:       '08/2013',
      balance:      0,
      highBal:      1000,
      monthlyPmt:   0,
      primaryUser:  'Clint',
      creditStatus: 'Paid/Closed',
      removalDate:  '',
      taxRelevance: 'No tax impact — fully paid. Equifax only.',
      notes:        'PO Box 71757, Philadelphia PA 19176. Phone: 866-396-8254. Equifax only.',
      source:       'Credit Report Sheets 2025-2026',
    },

    // ═══════════════════════════════════════════════════════════════════
    // ASSETS / INVESTMENT ACCOUNTS
    // ═══════════════════════════════════════════════════════════════════
    {
      provider:     'Fidelity Investments (Rollover IRA)',
      ein:          '04-3523567',
      acctNumber:   '244-057897',
      acctType:     'Investment',
      acctSubtype:  'Rollover IRA',
      status:       'Active',
      opened:       '2022',
      closed:       '',
      balance:      12866.66,
      highBal:      13000,
      monthlyPmt:   0,
      primaryUser:  'Clint',
      creditStatus: 'Active — IRA Asset',
      removalDate:  '',
      taxRelevance: 'Rollover IRA — tax-deferred. No required distributions yet. Designate beneficiary at Fidelity.com/beneficiary. Trustee TIN: 04-3523567 (National Financial Services LLC).',
      notes:        'FMV $12,866.66 as of 12/31/2022. Rollover contribution: $13,000. Update beneficiary. (800) 544-6666.',
      source:       'Credit Report Sheets 2025-2026',
    },
  ];
}


// ─── SYRINA MISSING ACCOUNT — Capital One Auto (added 2026) ─────────────────
// Run importSyrinaAutoLoan() to add the Kia Sorento loan (missing from original import)

function importSyrinaAutoLoan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const accounts = [
    {
      provider:     'Capital One Auto Finance',
      ein:          '',
      acctNumber:   '',
      acctType:     'Auto Loan',
      acctSubtype:  'Secured — Vehicle',
      status:       'Active',
      opened:       '02/2026',
      closed:       '',
      balance:      31440,
      highBal:      31440,
      monthlyPmt:   624,
      primaryUser:  'Syrina',
      creditStatus: 'Current',
      removalDate:  '',
      taxRelevance: 'Auto loan interest NOT deductible (personal vehicle). APR 12.39%. Total interest over life: $13,506.97.',
      notes:        '2026 Kia Sorento LX FWD. VIN: SXYRGAJCXTG432063. 72 mo @ $624.27. First pmt 03/29/2026. Dealer: Kia of Kinston / Deacon Jones.',
      source:       'Credit Report Sheets 2025-2026',
    },
  ];
  const mrResult = importToMasterRegister_(ss, accounts);
  const alResult = importToAcctLedger_(ss, accounts);
  SpreadsheetApp.getUi().alert(
    'Syrina Auto Loan Import:\nMaster Register: ' + mrResult.added + ' added, ' + mrResult.skipped + ' skipped\n' +
    'Acct Ledger: ' + alResult.added + ' added, ' + alResult.skipped + ' skipped'
  );
}


// ─── CLINTON IMPORT ENTRY POINT ──────────────────────────────────────────────

function importClintCreditReportAccounts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const accounts = getClintCreditReportAccounts_();
  const mrResult = importToMasterRegister_(ss, accounts);
  const alResult = importToAcctLedger_(ss, accounts);
  const msg =
    'Clinton Credit Report Import Complete!\n\n' +
    'Master Register: ' + mrResult.added + ' added, ' + mrResult.skipped + ' skipped\n' +
    'Acct Ledger: '     + alResult.added + ' added, ' + alResult.skipped + ' skipped';
  SpreadsheetApp.getUi().alert(msg);
  Logger.log(msg);
}


// ─── COMBINED IMPORT (Syrina + Clinton + Auto) ───────────────────────────────

function importAllCreditReportAccounts() {
  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  const all = [
    ...getSyrinaCreditReportAccounts_(),
    ...getClintCreditReportAccounts_(),
    // Syrina's auto loan (added after original Syrina import)
    {
      provider:     'Capital One Auto Finance',
      ein:          '',
      acctNumber:   '',
      acctType:     'Auto Loan',
      acctSubtype:  'Secured — Vehicle',
      status:       'Active',
      opened:       '02/2026',
      closed:       '',
      balance:      31440,
      highBal:      31440,
      monthlyPmt:   624,
      primaryUser:  'Syrina',
      creditStatus: 'Current',
      removalDate:  '',
      taxRelevance: 'Auto loan interest NOT deductible (personal vehicle). APR 12.39%. Total interest over life: $13,506.97.',
      notes:        '2026 Kia Sorento LX FWD. VIN: SXYRGAJCXTG432063. 72 mo @ $624.27. First pmt 03/29/2026.',
      source:       'Credit Report Sheets 2025-2026',
    },
  ];

  const mrResult = importToMasterRegister_(ss, all);
  const alResult = importToAcctLedger_(ss, all);
  const msg =
    'Full Credit Report Import Complete!\n\n' +
    'Master Register: ' + mrResult.added + ' added, ' + mrResult.skipped + ' skipped (already exist)\n' +
    'Acct Ledger: '     + alResult.added + ' added, ' + alResult.skipped + ' skipped (already exist)';
  SpreadsheetApp.getUi().alert(msg);
  Logger.log(msg);
}


// ─── STANDALONE ACCT LEDGER POPULATION ──────────────────────────────────────
// Run this if you only want to populate the Acct Ledger without Master Register

function populateAcctLedgerOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const accounts = getSyrinaCreditReportAccounts_();
  const result = importToAcctLedger_(ss, accounts);
  SpreadsheetApp.getUi().alert(
    'Acct Ledger: ' + result.added + ' added, ' + result.skipped + ' skipped'
  );
}


// ─── LINK MR IDs TO ACCT LEDGER ────────────────────────────────────────────
// Run after both sheets are populated to cross-reference MR IDs into Acct Ledger

function linkMRIdsToAcctLedger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mrSheet = ss.getSheetByName('Master Register');
  let alSheet = ss.getSheetByName('Acct Ledger') || ss.getSheetByName('EIN Acct Ledger');

  if (!mrSheet || !alSheet) {
    SpreadsheetApp.getUi().alert('Both Master Register and Acct Ledger must exist.');
    return;
  }

  // Build lookup: provider name → MR ID
  const mrData = mrSheet.getRange(2, 1, mrSheet.getLastRow() - 1, 7).getValues();
  const lookup = {};
  for (const row of mrData) {
    const mrId = String(row[0]);
    const provider = String(row[2]).trim().toLowerCase();
    if (mrId && provider) lookup[provider] = mrId;
  }

  // Update Acct Ledger col J (10) with MR IDs
  const alLastRow = alSheet.getLastRow();
  if (alLastRow < 2) return;

  const alProviders = alSheet.getRange(2, 1, alLastRow - 1, 1).getValues().flat();
  const mrIdCol = alSheet.getRange(2, 10, alLastRow - 1, 1);
  const mrIds = mrIdCol.getValues();

  let linked = 0;
  for (let i = 0; i < alProviders.length; i++) {
    const provider = String(alProviders[i]).trim().toLowerCase();
    if (lookup[provider] && !mrIds[i][0]) {
      mrIds[i][0] = lookup[provider];
      linked++;
    }
  }

  mrIdCol.setValues(mrIds);
  SpreadsheetApp.getUi().alert('Linked ' + linked + ' MR IDs to Acct Ledger');
}