/**
 * TMARService - Trust Master Account Register main service
 * Combines all services for high-level TMAR operations
 */

import * as SheetsService from './SheetsService.js';
import * as AccountService from './AccountService.js';
import * as TransactionService from './TransactionService.js';
import { createStateManager } from '../utils/StateManager.js';
import * as LocalStorage from '../storage/LocalStorage.js';

// Global state manager for TMAR
let tmarState = null;

/**
 * Initializes TMAR system
 * Loads data from Google Sheets or localStorage
 * @returns {Object} State manager instance
 */
export function initializeTMAR() {
  if (tmarState) {
    return tmarState; // Already initialized
  }

  tmarState = createStateManager({
    accounts: [],
    transactions: [],
    currentYear: new Date().getFullYear(),
    lastSync: null,
    isLoading: false,
    error: null
  });

  // Try to load from Google Sheets first
  if (SheetsService.isAppsScriptEnvironment()) {
    syncFromSheets();
  } else {
    // Load from localStorage
    const savedAccounts = LocalStorage.load('tmar_accounts', []);
    const savedTransactions = LocalStorage.load('tmar_transactions', []);

    tmarState.setState({
      accounts: savedAccounts,
      transactions: savedTransactions,
      lastSync: LocalStorage.load('tmar_last_sync', null)
    });
  }

  // Auto-save to localStorage on state changes
  tmarState.subscribe((newState) => {
    if (!SheetsService.isAppsScriptEnvironment()) {
      LocalStorage.save('tmar_accounts', newState.accounts);
      LocalStorage.save('tmar_transactions', newState.transactions);
      LocalStorage.save('tmar_last_sync', newState.lastSync);
    }
  });

  return tmarState;
}

/**
 * Gets current TMAR state
 * @returns {Object} Current state
 */
export function getState() {
  if (!tmarState) {
    initializeTMAR();
  }
  return tmarState.getState();
}

/**
 * Syncs data from Google Sheets to local state
 * @returns {Object} { success: boolean, accountCount: number, transactionCount: number }
 */
export function syncFromSheets() {
  if (!tmarState) {
    initializeTMAR();
  }

  try {
    tmarState.setState({ isLoading: true, error: null });

    const accounts = SheetsService.readMasterRegister();
    const transactions = SheetsService.readTransactionLedger();

    tmarState.setState({
      accounts,
      transactions,
      lastSync: new Date().toISOString(),
      isLoading: false
    });

    return {
      success: true,
      accountCount: accounts.length,
      transactionCount: transactions.length
    };
  } catch (error) {
    tmarState.setState({
      isLoading: false,
      error: error.message
    });

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Adds a new account to Master Register
 * @param {Object} accountData - Account data
 * @returns {Object} Created account with MR-XXX ID
 */
export function addAccount(accountData) {
  if (!tmarState) {
    initializeTMAR();
  }

  try {
    // Generate next MR ID
    const id = SheetsService.generateNextMRId();

    // Create account object
    const account = {
      id,
      dateAdded: new Date(),
      name: accountData.name || '',
      accountNumber: accountData.accountNumber || '',
      type: accountData.type || '',
      status: accountData.status || 'Active',
      balance: accountData.balance || 0,
      primaryUser: accountData.primaryUser || '',
      billingFrequency: accountData.billingFrequency || '',
      ...accountData
    };

    // Validate account
    const validation = AccountService.validateAccount({
      name: account.name,
      type: account.type,
      balance: account.balance
    });

    if (!validation.valid) {
      throw new Error(`Invalid account data: ${validation.errors.join(', ')}`);
    }

    // Write to Google Sheets if available
    if (SheetsService.isAppsScriptEnvironment()) {
      SheetsService.writeMasterRegisterAccount(account);
    }

    // Update local state
    const currentState = tmarState.getState();
    tmarState.setState({
      accounts: [...currentState.accounts, account]
    });

    return account;
  } catch (error) {
    tmarState.setState({ error: error.message });
    throw error;
  }
}

/**
 * Gets all active accounts
 * @returns {Array<Object>} Active accounts
 */
export function getActiveAccounts() {
  const state = getState();
  return AccountService.filterAccountsByStatus(state.accounts, 'Active');
}

/**
 * Gets accounts by user
 * @param {string} user - User name (Clint, Syrina, Joint, etc.)
 * @returns {Array<Object>} User's accounts
 */
export function getAccountsByUser(user) {
  const state = getState();
  return state.accounts.filter(acc => acc.primaryUser === user);
}

/**
 * Calculates total balances by account type
 * @returns {Object} Balances grouped by type
 */
export function getBalancesByType() {
  const state = getState();
  const grouped = AccountService.groupAccountsByType(state.accounts);

  const balances = {};
  for (const [type, accounts] of Object.entries(grouped)) {
    balances[type] = AccountService.calculateTotalBalance(accounts);
  }

  return balances;
}

/**
 * Gets financial summary
 * @returns {Object} Summary with totals and breakdowns
 */
export function getFinancialSummary() {
  const state = getState();

  const totalAssets = AccountService.calculateTotalBalance(
    state.accounts.filter(acc => acc.balance > 0)
  );

  const totalLiabilities = Math.abs(AccountService.calculateTotalBalance(
    state.accounts.filter(acc => acc.balance < 0)
  ));

  const netWorth = totalAssets - totalLiabilities;

  const netIncome = TransactionService.calculateNetIncome(state.transactions);

  const balancesByType = getBalancesByType();

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    income: netIncome.income,
    expenses: netIncome.expenses,
    netIncome: netIncome.net,
    balancesByType,
    accountCount: state.accounts.length,
    transactionCount: state.transactions.length,
    lastSync: state.lastSync
  };
}

/**
 * Searches accounts across all fields
 * @param {string} query - Search query
 * @returns {Array<Object>} Matching accounts
 */
export function searchAccounts(query) {
  const state = getState();
  return AccountService.searchAccounts(state.accounts, query);
}

/**
 * Gets monthly spending breakdown
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Object} Spending by category
 */
export function getMonthlySpending(year, month) {
  const state = getState();
  return TransactionService.calculateMonthlySpending(
    state.transactions,
    year,
    month
  );
}

/**
 * Gets transactions for date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {Array<Object>} Transactions in range
 */
export function getTransactionsByDateRange(startDate, endDate) {
  const state = getState();
  return TransactionService.filterTransactionsByDateRange(
    state.transactions,
    startDate,
    endDate
  );
}

/**
 * Subscribes to TMAR state changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribe(callback) {
  if (!tmarState) {
    initializeTMAR();
  }
  return tmarState.subscribe(callback);
}

/**
 * Gets accounts needing verification
 * @param {number} daysThreshold - Days since last verification
 * @returns {Array<Object>} Accounts needing verification
 */
export function getAccountsNeedingVerification(daysThreshold = 90) {
  const state = getState();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

  return state.accounts.filter(account => {
    if (!account.lastVerified) return true;

    const lastVerified = new Date(account.lastVerified);
    return lastVerified < cutoffDate;
  });
}

/**
 * Gets disputed accounts
 * @returns {Array<Object>} Disputed accounts
 */
export function getDisputedAccounts() {
  const state = getState();
  return state.accounts.filter(acc =>
    acc.disputeStatus && acc.disputeStatus !== '' && acc.disputeStatus !== 'None'
  );
}

/**
 * Gets tax-relevant accounts for a tax year
 * @param {number} year - Tax year
 * @returns {Object} Accounts grouped by tax form type
 */
export function getTaxRelevantAccounts(year = null) {
  const state = getState();
  const taxYear = year || state.currentYear;

  const taxAccounts = state.accounts.filter(acc =>
    acc.taxRelevance && acc.taxRelevance !== '' && acc.taxRelevance !== 'None'
  );

  // Group by tax form
  const byForm = {};
  taxAccounts.forEach(account => {
    const form = account.taxForm || 'Other';
    if (!byForm[form]) {
      byForm[form] = [];
    }
    byForm[form].push(account);
  });

  return {
    year: taxYear,
    accounts: taxAccounts,
    byForm,
    count: taxAccounts.length
  };
}

/**
 * Exports current state to JSON
 * @returns {string} JSON string
 */
export function exportToJSON() {
  const state = getState();
  return JSON.stringify({
    accounts: state.accounts,
    transactions: state.transactions,
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  }, null, 2);
}

/**
 * Imports data from JSON
 * @param {string} jsonString - JSON data
 * @returns {Object} Import result
 */
export function importFromJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (!data.accounts || !Array.isArray(data.accounts)) {
      throw new Error('Invalid JSON format: accounts array required');
    }

    if (!tmarState) {
      initializeTMAR();
    }

    tmarState.setState({
      accounts: data.accounts,
      transactions: data.transactions || [],
      lastSync: new Date().toISOString()
    });

    return {
      success: true,
      accountCount: data.accounts.length,
      transactionCount: (data.transactions || []).length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
