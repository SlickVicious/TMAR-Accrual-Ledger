/**
 * SheetsService - Google Sheets integration
 * Handles reading/writing data from Google Sheets
 * Uses Apps Script globals when available, mock data otherwise
 */

// Master Register 35-column schema
export const MASTER_REGISTER_SCHEMA = {
  ROW_ID: 0,           // A: MR-XXX
  DATE_ADDED: 1,       // B: Date Added
  PROVIDER: 2,         // C: Provider/Creditor
  MAILING_ADDRESS: 3,  // D: Mailing Address
  PROVIDER_EIN: 4,     // E: Provider EIN
  ACCOUNT_NUMBER: 5,   // F: Account Number
  ACCOUNT_TYPE: 6,     // G: Account Type
  ACCOUNT_SUBTYPE: 7,  // H: Account Subtype
  ACCOUNT_AGENT: 8,    // I: Account Agent
  AGENT_ADDRESS: 9,    // J: Agent Address
  STATUS: 10,          // K: Status
  OPENED_DATE: 11,     // L: Opened Date
  CLOSED_DATE: 12,     // M: Closed Date
  CURRENT_BALANCE: 13, // N: Current Balance
  HIGH_BALANCE: 14,    // O: High Balance
  MONTHLY_PAYMENT: 15, // P: Monthly Payment
  APR_RATE: 16,        // Q: APR/Rate
  BILLING_FREQUENCY: 17, // R: Billing Frequency
  NEXT_PAYMENT_DUE: 18,  // S: Next Payment Due
  PRIMARY_USER: 19,      // T: Primary User
  SECONDARY_USER: 20,    // U: Secondary User
  ACCOUNT_PURPOSE: 21,   // V: Account Purpose
  DOCUMENT_LOCATION: 22, // W: Document Location
  LAST_VERIFIED: 23,     // X: Last Verified
  LINKED_MR_ACCOUNT: 24, // Y: Linked MR Account
  TRUST_ASSIGNMENT: 25,  // Z: Trust Assignment
  TAX_RELEVANCE: 26,     // AA: Tax Relevance
  TAX_FORM: 27,          // AB: Tax Form
  DEDUCTION_TYPE: 28,    // AC: Deduction Type
  CREDIT_REPORT_STATUS: 29, // AD: Credit Report Status
  REMOVAL_DATE: 30,      // AE: Removal Date
  DISPUTE_STATUS: 31,    // AF: Dispute Status
  NOTES: 32,             // AG: Notes
  SOURCE: 33,            // AH: Source
  DISCOVERY_STATUS: 34   // AI: Discovery Status
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
  const data = sheet.getRange(2, 1, lastRow - 1, 35).getValues();

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
    mailingAddress: row[S.MAILING_ADDRESS] || '',
    providerEin: row[S.PROVIDER_EIN] || '',
    accountNumber: row[S.ACCOUNT_NUMBER] || '',
    type: row[S.ACCOUNT_TYPE] || '',
    subtype: row[S.ACCOUNT_SUBTYPE] || '',
    agent: row[S.ACCOUNT_AGENT] || '',
    agentAddress: row[S.AGENT_ADDRESS] || '',
    status: row[S.STATUS] || 'Active',
    openedDate: row[S.OPENED_DATE] || null,
    closedDate: row[S.CLOSED_DATE] || null,
    balance: parseFloat(row[S.CURRENT_BALANCE]) || 0,
    highBalance: parseFloat(row[S.HIGH_BALANCE]) || 0,
    monthlyPayment: parseFloat(row[S.MONTHLY_PAYMENT]) || 0,
    aprRate: parseFloat(row[S.APR_RATE]) || 0,
    billingFrequency: row[S.BILLING_FREQUENCY] || '',
    nextPaymentDue: row[S.NEXT_PAYMENT_DUE] || null,
    primaryUser: row[S.PRIMARY_USER] || '',
    secondaryUser: row[S.SECONDARY_USER] || '',
    purpose: row[S.ACCOUNT_PURPOSE] || '',
    documentLocation: row[S.DOCUMENT_LOCATION] || '',
    lastVerified: row[S.LAST_VERIFIED] || null,
    linkedAccount: row[S.LINKED_MR_ACCOUNT] || '',
    trustAssignment: row[S.TRUST_ASSIGNMENT] || '',
    taxRelevance: row[S.TAX_RELEVANCE] || '',
    taxForm: row[S.TAX_FORM] || '',
    deductionType: row[S.DEDUCTION_TYPE] || '',
    creditReportStatus: row[S.CREDIT_REPORT_STATUS] || '',
    removalDate: row[S.REMOVAL_DATE] || null,
    disputeStatus: row[S.DISPUTE_STATUS] || '',
    notes: row[S.NOTES] || '',
    source: row[S.SOURCE] || '',
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
  const row = new Array(35).fill('');

  row[S.ROW_ID] = account.id || '';
  row[S.DATE_ADDED] = account.dateAdded || new Date();
  row[S.PROVIDER] = account.name || '';
  row[S.MAILING_ADDRESS] = account.mailingAddress || '';
  row[S.PROVIDER_EIN] = account.providerEin || '';
  row[S.ACCOUNT_NUMBER] = account.accountNumber || '';
  row[S.ACCOUNT_TYPE] = account.type || '';
  row[S.ACCOUNT_SUBTYPE] = account.subtype || '';
  row[S.ACCOUNT_AGENT] = account.agent || '';
  row[S.AGENT_ADDRESS] = account.agentAddress || '';
  row[S.STATUS] = account.status || 'Active';
  row[S.OPENED_DATE] = account.openedDate || '';
  row[S.CLOSED_DATE] = account.closedDate || '';
  row[S.CURRENT_BALANCE] = account.balance || 0;
  row[S.HIGH_BALANCE] = account.highBalance || 0;
  row[S.MONTHLY_PAYMENT] = account.monthlyPayment || 0;
  row[S.APR_RATE] = account.aprRate || 0;
  row[S.BILLING_FREQUENCY] = account.billingFrequency || '';
  row[S.NEXT_PAYMENT_DUE] = account.nextPaymentDue || '';
  row[S.PRIMARY_USER] = account.primaryUser || '';
  row[S.SECONDARY_USER] = account.secondaryUser || '';
  row[S.ACCOUNT_PURPOSE] = account.purpose || '';
  row[S.DOCUMENT_LOCATION] = account.documentLocation || '';
  row[S.LAST_VERIFIED] = account.lastVerified || '';
  row[S.LINKED_MR_ACCOUNT] = account.linkedAccount || '';
  row[S.TRUST_ASSIGNMENT] = account.trustAssignment || '';
  row[S.TAX_RELEVANCE] = account.taxRelevance || '';
  row[S.TAX_FORM] = account.taxForm || '';
  row[S.DEDUCTION_TYPE] = account.deductionType || '';
  row[S.CREDIT_REPORT_STATUS] = account.creditReportStatus || '';
  row[S.REMOVAL_DATE] = account.removalDate || '';
  row[S.DISPUTE_STATUS] = account.disputeStatus || '';
  row[S.NOTES] = account.notes || '';
  row[S.SOURCE] = account.source || '';
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

  sheet.getRange(lastRow + 1, 1, 1, 35).setValues([row]);

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
