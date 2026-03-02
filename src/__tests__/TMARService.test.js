/**
 * Tests for TMARService
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import * as TMARService from '../services/TMARService.js';
import * as LocalStorage from '../storage/LocalStorage.js';

// Mock localStorage
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
};

describe('TMARService', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);

    // Reset TMAR state by reinitializing
    const state = TMARService.initializeTMAR();
    state.reset({ accounts: [], transactions: [], currentYear: new Date().getFullYear() });
  });

  describe('initializeTMAR', () => {
    test('initializes state manager', () => {
      const state = TMARService.initializeTMAR();

      expect(state).toBeDefined();
      expect(state.getState).toBeDefined();
    });

    test('initializes with empty data', () => {
      TMARService.initializeTMAR();
      const state = TMARService.getState();

      expect(Array.isArray(state.accounts)).toBe(true);
      expect(Array.isArray(state.transactions)).toBe(true);
      expect(state.currentYear).toBe(new Date().getFullYear());
    });
  });

  describe('getState', () => {
    test('returns current state', () => {
      const state = TMARService.getState();

      expect(state).toBeDefined();
      expect(state.accounts).toBeDefined();
      expect(state.transactions).toBeDefined();
    });
  });

  describe('addAccount', () => {
    test('adds account with generated ID', () => {
      const accountData = {
        name: 'Test Account',
        type: 'Bank Account - Checking',
        balance: 1000
      };

      const account = TMARService.addAccount(accountData);

      expect(account.id).toBeDefined();
      expect(account.id).toMatch(/^MR-/);
      expect(account.name).toBe('Test Account');
      expect(account.balance).toBe(1000);
    });

    test('validates account data', () => {
      const invalidData = {
        name: 'Test'
        // missing type
      };

      expect(() => TMARService.addAccount(invalidData)).toThrow('Invalid account data');
    });

    test('updates state with new account', () => {
      const accountData = {
        name: 'Test Account',
        type: 'Bank Account - Checking',
        balance: 1000
      };

      TMARService.addAccount(accountData);
      const state = TMARService.getState();

      expect(state.accounts.length).toBe(1);
      expect(state.accounts[0].name).toBe('Test Account');
    });
  });

  describe('getActiveAccounts', () => {
    test('filters active accounts', () => {
      // Add active and closed accounts
      TMARService.addAccount({
        name: 'Active Account',
        type: 'Checking',
        status: 'Active'
      });

      TMARService.addAccount({
        name: 'Closed Account',
        type: 'Checking',
        status: 'Closed'
      });

      const active = TMARService.getActiveAccounts();

      expect(active.length).toBe(1);
      expect(active[0].name).toBe('Active Account');
    });
  });

  describe('getAccountsByUser', () => {
    test('filters accounts by user', () => {
      TMARService.addAccount({
        name: 'Clint Account',
        type: 'Checking',
        primaryUser: 'Clint'
      });

      TMARService.addAccount({
        name: 'Syrina Account',
        type: 'Savings',
        primaryUser: 'Syrina'
      });

      const clintAccounts = TMARService.getAccountsByUser('Clint');

      expect(clintAccounts.length).toBe(1);
      expect(clintAccounts[0].name).toBe('Clint Account');
    });
  });

  describe('getBalancesByType', () => {
    test('calculates balances by type', () => {
      TMARService.addAccount({
        name: 'Checking 1',
        type: 'Checking',
        balance: 1000
      });

      TMARService.addAccount({
        name: 'Checking 2',
        type: 'Checking',
        balance: 2000
      });

      TMARService.addAccount({
        name: 'Savings 1',
        type: 'Savings',
        balance: 5000
      });

      const balances = TMARService.getBalancesByType();

      expect(balances.Checking).toBe(3000);
      expect(balances.Savings).toBe(5000);
    });
  });

  describe('getFinancialSummary', () => {
    test('provides complete financial summary', () => {
      TMARService.addAccount({
        name: 'Checking',
        type: 'Checking',
        balance: 5000
      });

      TMARService.addAccount({
        name: 'Credit Card',
        type: 'Credit',
        balance: -1000
      });

      const summary = TMARService.getFinancialSummary();

      expect(summary.totalAssets).toBe(5000);
      expect(summary.totalLiabilities).toBe(1000);
      expect(summary.netWorth).toBe(4000);
      expect(summary.accountCount).toBe(2);
    });
  });

  describe('searchAccounts', () => {
    test('searches accounts by query', () => {
      TMARService.addAccount({
        name: 'Chase Bank',
        type: 'Checking',
        accountNumber: '1234'
      });

      TMARService.addAccount({
        name: 'Wells Fargo',
        type: 'Savings',
        accountNumber: '5678'
      });

      const results = TMARService.searchAccounts('Chase');

      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Chase Bank');
    });
  });

  describe('exportToJSON', () => {
    test('exports data to JSON string', () => {
      TMARService.addAccount({
        name: 'Test Account',
        type: 'Checking',
        balance: 1000
      });

      const json = TMARService.exportToJSON();
      const data = JSON.parse(json);

      expect(data.accounts).toBeDefined();
      expect(data.accounts.length).toBe(1);
      expect(data.exportDate).toBeDefined();
      expect(data.version).toBe('1.0.0');
    });
  });

  describe('importFromJSON', () => {
    test('imports data from JSON', () => {
      const jsonData = JSON.stringify({
        accounts: [
          { id: 'MR-001', name: 'Test Account', type: 'Checking', balance: 1000 }
        ],
        transactions: []
      });

      const result = TMARService.importFromJSON(jsonData);

      expect(result.success).toBe(true);
      expect(result.accountCount).toBe(1);

      const state = TMARService.getState();
      expect(state.accounts.length).toBe(1);
      expect(state.accounts[0].name).toBe('Test Account');
    });

    test('handles invalid JSON', () => {
      const result = TMARService.importFromJSON('invalid json');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
