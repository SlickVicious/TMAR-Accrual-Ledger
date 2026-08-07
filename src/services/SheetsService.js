/**
 * SheetsService - Google Sheets integration
 * Handles reading/writing data from Google Sheets
 * Uses Apps Script globals when available, mock data otherwise
 */

// Master Register 29-column schema (A-AC) -- corrected 2026-08-06 against the
// real live-sheet layout (domain-models.md). This previously modeled a
// 35-column layout that never matched the sheet, so every rowToAccount()/
// accountToRow() field silently pulled from or wrote to the wrong column.
// This is the JS-side twin of TMARBridge.gs's addTMARAccount()/
// readMasterRegisterAccounts_() column fix (2026-08-03/06) -- same 29-col
// schema, kept in sync so a round-trip through either layer agrees on
// position. Columns with no dedicated home in the real schema (mailing
// address, a standalone monthly-payment field, account agent/agent address,
// high balance, APR/rate, secondary user, account purpose, linked MR
// account, trust assignment, tax relevance, deduction type, credit report
// status, removal date, dispute status, source) do not exist on the live
// sheet -- domain-models.md's documented convention is to fold that
// information into Notes (AA) as free text rather than invent a column.
export const MASTER_REGISTER_SCHEMA = {
  ROW_ID: 0,               // A: MR-XXX
  DATE_ADDED: 1,            // B: Date Added
  PROVIDER: 2,              // C: Provider/Creditor
  PROVIDER_EIN: 3,          // D: Provider EIN
  ACCOUNT_NUMBER: 4,        // E: Account Number
  ACCOUNT_TYPE: 5,          // F: Account Type
  ACCOUNT_SUBTYPE: 6,       // G: Account Subtype (validated dropdown)
  STATUS: 7,                // H: Status
  OPEN_DATE: 8,             // I: Open Date
  CLOSE_DATE: 9,            // J: Close Date
  CURRENT_BALANCE: 10,      // K: Current Balance
  ORIGINAL_BALANCE: 11,     // L: Original Balance
  BILLING_FREQUENCY: 12,    // M: Billing Frequency
  NEXT_PAYMENT_DUE: 13,     // N: Next Payment Due
  PRIMARY_USER: 14,         // O: Primary User
  AUTHORIZED_USERS: 15,     // P: Authorized Users
  AUTOPAY_STATUS: 16,       // Q: Autopay Status
  PAYMENT_SOURCE: 17,       // R: Payment Source
  CONTRACT_TERMS_FILE: 18,  // S: Contract/Terms File
  STATEMENTS_COMPLETE: 19,  // T: Statements Complete
  TAX_FORMS_ON_FILE: 20,    // U: Tax Forms on File
  POP_DOCUMENTS: 21,        // V: PoP Documents
  DOCUMENT_LOCATION: 22,    // W: Document Location
  LAST_STATEMENT_DATE: 23,  // X: Last Statement Date
  LAST_VERIFIED: 24,        // Y: Last Verified Date
  RETENTION_PERIOD: 25,     // Z: Retention Period
  NOTES: 26,                // AA: Notes
  TAGS: 27,                 // AB: Tags
  DISCOVERY_STATUS: 28      // AC: Discovery Status
};

// Transaction Ledger schema
export const TRANSACTION_SCHEMA = {
  DATE: 0,
  DESCRIPTION: 1,
  CATEGORY: 2,
  AMOUNT: 3,
  ACCOUNT: 4,
  TYPE: 5,
  RECONCILED: 6
};

/**
 * Checks if running in Google Apps Script environment
 * @returns {boolean} True if in Apps Script
 */
export function isAppsScriptEnvironment() {
  return typeof SpreadsheetApp !== 'undefined';
}

/**
 * Gets the active spreadsheet (Apps Script only)
 * @returns {Object|null} Spreadsheet object or null
 */
export function getActiveSpreadsheet() {
  if (!isAppsScriptEnvironment()) {
    return null;
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Reads all accounts from Master Register sheet
 * @returns {Array<Object>} Array of account objects
 */
export function readMasterRegister() {
  if (!isAppsScriptEnvironment()) {
    return getMockAccounts();
  }

  const ss = getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Master Register');

  if (!sheet) {
    throw new Error('Master Register sheet not found');
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return []; // No data rows
  }

  // Read all data (skip header row)
  const data = sheet.getRange(2, 1, lastRow - 1, 29).getValues();

  return data.map(row => rowToAccount(row));
}

/**
 * Converts a sheet row to an account object
 * @param {Array} row - Sheet row data
 * @returns {Object} Account object
 */
function rowToAccount(row) {
  const S = MASTER_REGISTER_SCHEMA;

  return {
    id: row[S.ROW_ID] || '',
    dateAdded: row[S.DATE_ADDED] || null,
    name: row[S.PROVIDER] || '',
    providerEin: row[S.PROVIDER_EIN] || '',
    accountNumber: row[S.ACCOUNT_NUMBER] || '',
    type: row[S.ACCOUNT_TYPE] || '',
    subtype: row[S.ACCOUNT_SUBTYPE] || '',
    status: row[S.STATUS] || 'Active',
    openedDate: row[S.OPEN_DATE] || null,
    closedDate: row[S.CLOSE_DATE] || null,
    balance: parseFloat(row[S.CURRENT_BALANCE]) || 0,
    originalBalance: parseFloat(row[S.ORIGINAL_BALANCE]) || 0,
    billingFrequency: row[S.BILLING_FREQUENCY] || '',
    nextPaymentDue: row[S.NEXT_PAYMENT_DUE] || null,
    primaryUser: row[S.PRIMARY_USER] || '',
    authorizedUsers: row[S.AUTHORIZED_USERS] || '',
    autopayStatus: row[S.AUTOPAY_STATUS] || '',
    paymentSource: row[S.PAYMENT_SOURCE] || '',
    contractTermsFile: row[S.CONTRACT_TERMS_FILE] || '',
    statementsComplete: row[S.STATEMENTS_COMPLETE] || '',
    taxFormsOnFile: row[S.TAX_FORMS_ON_FILE] || '',
    popDocuments: row[S.POP_DOCUMENTS] || '',
    documentLocation: row[S.DOCUMENT_LOCATION] || '',
    lastStatementDate: row[S.LAST_STATEMENT_DATE] || null,
    lastVerified: row[S.LAST_VERIFIED] || null,
    retentionPeriod: row[S.RETENTION_PERIOD] || '',
    notes: row[S.NOTES] || '',
    tags: row[S.TAGS] || '',
    discoveryStatus: row[S.DISCOVERY_STATUS] || 'Known'
  };
}

/**
 * Converts an account object to a sheet row
 * @param {Object} account - Account object
 * @returns {Array} Sheet row data
 */
function accountToRow(account) {
  const S = MASTER_REGISTER_SCHEMA;
  const row = new Array(29).fill('');

  row[S.ROW_ID] = account.id || '';
  row[S.DATE_ADDED] = account.dateAdded || new Date();
  row[S.PROVIDER] = account.name || '';
  row[S.PROVIDER_EIN] = account.providerEin || '';
  row[S.ACCOUNT_NUMBER] = account.accountNumber || '';
  row[S.ACCOUNT_TYPE] = account.type || '';
  row[S.ACCOUNT_SUBTYPE] = account.subtype || '';
  row[S.STATUS] = account.status || 'Active';
  row[S.OPEN_DATE] = account.openedDate || '';
  row[S.CLOSE_DATE] = account.closedDate || '';
  row[S.CURRENT_BALANCE] = account.balance || 0;
  row[S.ORIGINAL_BALANCE] = account.originalBalance || 0;
  row[S.BILLING_FREQUENCY] = account.billingFrequency || '';
  row[S.NEXT_PAYMENT_DUE] = account.nextPaymentDue || '';
  row[S.PRIMARY_USER] = account.primaryUser || '';
  row[S.AUTHORIZED_USERS] = account.authorizedUsers || '';
  row[S.AUTOPAY_STATUS] = account.autopayStatus || '';
  row[S.PAYMENT_SOURCE] = account.paymentSource || '';
  row[S.CONTRACT_TERMS_FILE] = account.contractTermsFile || '';
  row[S.STATEMENTS_COMPLETE] = account.statementsComplete || '';
  row[S.TAX_FORMS_ON_FILE] = account.taxFormsOnFile || '';
  row[S.POP_DOCUMENTS] = account.popDocuments || '';
  row[S.DOCUMENT_LOCATION] = account.documentLocation || '';
  row[S.LAST_STATEMENT_DATE] = account.lastStatementDate || '';
  row[S.LAST_VERIFIED] = account.lastVerified || '';
  row[S.RETENTION_PERIOD] = account.retentionPeriod || '';
  row[S.NOTES] = account.notes || '';
  row[S.TAGS] = account.tags || '';
  row[S.DISCOVERY_STATUS] = account.discoveryStatus || 'Known';

  return row;
}

/**
 * Writes an account to Master Register
 * @param {Object} account - Account object
 * @returns {boolean} Success status
 */
export function writeMasterRegisterAccount(account) {
  if (!isAppsScriptEnvironment()) {
    console.log('Mock: Would write account:', account);
    return true;
  }

  const ss = getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Master Register');

  if (!sheet) {
    throw new Error('Master Register sheet not found');
  }

  const row = accountToRow(account);
  const lastRow = sheet.getLastRow();

  sheet.getRange(lastRow + 1, 1, 1, 29).setValues([row]);

  return true;
}

/**
 * Reads all transactions from Transaction Ledger
 * @returns {Array<Object>} Array of transaction objects
 */
export function readTransactionLedger() {
  if (!isAppsScriptEnvironment()) {
    return getMockTransactions();
  }

  const ss = getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Transaction Ledger');

  if (!sheet) {
    throw new Error('Transaction Ledger sheet not found');
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return [];
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();

  return data.map(row => ({
    date: row[TRANSACTION_SCHEMA.DATE] || null,
    description: row[TRANSACTION_SCHEMA.DESCRIPTION] || '',
    category: row[TRANSACTION_SCHEMA.CATEGORY] || '',
    amount: parseFloat(row[TRANSACTION_SCHEMA.AMOUNT]) || 0,
    account: row[TRANSACTION_SCHEMA.ACCOUNT] || '',
    type: row[TRANSACTION_SCHEMA.TYPE] || '',
    reconciled: row[TRANSACTION_SCHEMA.RECONCILED] || false
  }));
}

/**
 * Generates next MR-XXX ID
 * @returns {string} Next available ID
 */
export function generateNextMRId() {
  if (!isAppsScriptEnvironment()) {
    return `MR-${Date.now()}`;
  }

  const accounts = readMasterRegister();

  if (accounts.length === 0) {
    return 'MR-001';
  }

  // Extract numbers from existing IDs
  const numbers = accounts
    .map(acc => acc.id)
    .filter(id => id.startsWith('MR-'))
    .map(id => parseInt(id.replace('MR-', ''), 10))
    .filter(n => !isNaN(n));

  const maxNumber = Math.max(...numbers, 0);
  const nextNumber = maxNumber + 1;

  return `MR-${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Mock accounts for testing (when not in Apps Script)
 * @returns {Array<Object>} Mock account data
 */
function getMockAccounts() {
  return [
    {
      id: 'MR-001',
      dateAdded: new Date('2024-01-15'),
      name: 'Chase Bank',
      accountNumber: '****1234',
      type: 'Bank Account - Checking',
      status: 'Active',
      balance: 5234.56,
      primaryUser: 'Clint',
      billingFrequency: 'Monthly'
    },
    {
      id: 'MR-002',
      dateAdded: new Date('2024-01-20'),
      name: 'Wells Fargo',
      accountNumber: '****5678',
      type: 'Bank Account - Savings',
      status: 'Active',
      balance: 12500.00,
      primaryUser: 'Syrina',
      billingFrequency: 'Monthly'
    },
    {
      id: 'MR-003',
      dateAdded: new Date('2024-02-01'),
      name: 'Capital One',
      accountNumber: '****9012',
      type: 'Credit Card - Personal',
      status: 'Active',
      balance: -1234.50,
      monthlyPayment: 50.00,
      primaryUser: 'Joint',
      billingFrequency: 'Monthly'
    }
  ];
}

/**
 * Mock transactions for testing
 * @returns {Array<Object>} Mock transaction data
 */
function getMockTransactions() {
  return [
    {
      date: new Date('2024-02-15'),
      description: 'Paycheck',
      category: 'Income - W-2 Wages',
      amount: 3500.00,
      account: 'Chase Checking',
      type: 'Income',
      reconciled: true
    },
    {
      date: new Date('2024-02-20'),
      description: 'Rent Payment',
      category: 'Expense - Rent/Mortgage',
      amount: -1200.00,
      account: 'Chase Checking',
      type: 'Expense',
      reconciled: true
    },
    {
      date: new Date('2024-02-22'),
      description: 'Groceries',
      category: 'Expense - Groceries',
      amount: -150.25,
      account: 'Capital One',
      type: 'Expense',
      reconciled: false
    }
  ];
}
