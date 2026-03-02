/**
 * TMAR - Trust Master Account Register
 * Main entry point for JavaScript services
 */

import * as AccountService from './services/AccountService.js';
import * as TransactionService from './services/TransactionService.js';
import * as InvoiceService from './services/InvoiceService.js';
import * as PayrollService from './services/PayrollService.js';
import * as LocalStorage from './storage/LocalStorage.js';
import { createStateManager } from './utils/StateManager.js';

// Initialize state manager
const appState = createStateManager({
  accounts: [],
  transactions: [],
  invoices: [],
  employees: [],
  currentYear: new Date().getFullYear()
});

// Export services
export {
  AccountService,
  TransactionService,
  InvoiceService,
  PayrollService,
  LocalStorage,
  appState
};

// Example usage
export function initializeTMAR() {
  console.log('TMAR System Initialized');
  console.log('Current Year:', appState.getState().currentYear);

  // Load saved data from localStorage
  const savedAccounts = LocalStorage.load('tmar_accounts', []);
  const savedTransactions = LocalStorage.load('tmar_transactions', []);

  appState.setState({
    accounts: savedAccounts,
    transactions: savedTransactions
  });

  // Subscribe to state changes to auto-save
  appState.subscribe((newState) => {
    LocalStorage.save('tmar_accounts', newState.accounts);
    LocalStorage.save('tmar_transactions', newState.transactions);
  });

  return appState;
}

// If running in browser, expose to window
if (typeof window !== 'undefined') {
  window.TMAR = {
    AccountService,
    TransactionService,
    InvoiceService,
    PayrollService,
    LocalStorage,
    appState,
    initialize: initializeTMAR
  };
}
