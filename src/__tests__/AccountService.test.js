/**
 * Tests for AccountService
 */

import { describe, test, expect } from '@jest/globals';
import {
  validateAccount,
  createAccount,
  calculateTotalBalance,
  filterAccountsByStatus,
  groupAccountsByType,
  updateAccountBalance,
  searchAccounts
} from '../services/AccountService.js';

describe('AccountService', () => {
  describe('validateAccount', () => {
    test('validates correct account data', () => {
      const account = {
        name: 'Test Account',
        type: 'Bank Account - Checking',
        balance: 1000
      };

      const result = validateAccount(account);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects missing account object', () => {
      const result = validateAccount(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Account object is required');
    });

    test('rejects missing name', () => {
      const account = {
        type: 'Bank Account - Checking'
      };

      const result = validateAccount(account);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('rejects invalid balance type', () => {
      const account = {
        name: 'Test Account',
        type: 'Bank Account - Checking',
        balance: 'invalid'
      };

      const result = validateAccount(account);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Balance must be a number');
    });
  });

  describe('createAccount', () => {
    test('creates account with valid data', () => {
      const data = {
        name: 'Test Checking',
        type: 'Bank Account - Checking',
        balance: 5000
      };

      const account = createAccount(data);

      expect(account.name).toBe('Test Checking');
      expect(account.type).toBe('Bank Account - Checking');
      expect(account.balance).toBe(5000);
      expect(account.status).toBe('Active');
      expect(account.id).toBeDefined();
    });

    test('applies default values', () => {
      const data = {
        name: 'Test Account',
        type: 'Savings'
      };

      const account = createAccount(data);

      expect(account.balance).toBe(0);
      expect(account.status).toBe('Active');
      expect(account.accountNumber).toBe('');
    });

    test('throws error for invalid data', () => {
      const data = {
        name: 'Test'
        // missing type
      };

      expect(() => createAccount(data)).toThrow('Invalid account data');
    });
  });

  describe('calculateTotalBalance', () => {
    test('calculates total from multiple accounts', () => {
      const accounts = [
        { balance: 1000 },
        { balance: 2000 },
        { balance: 1500 }
      ];

      const total = calculateTotalBalance(accounts);

      expect(total).toBe(4500);
    });

    test('handles empty array', () => {
      const total = calculateTotalBalance([]);

      expect(total).toBe(0);
    });

    test('ignores invalid balances', () => {
      const accounts = [
        { balance: 1000 },
        { balance: 'invalid' },
        { balance: 2000 }
      ];

      const total = calculateTotalBalance(accounts);

      expect(total).toBe(3000);
    });

    test('throws error for non-array input', () => {
      expect(() => calculateTotalBalance('not an array')).toThrow();
    });
  });

  describe('filterAccountsByStatus', () => {
    const accounts = [
      { name: 'Account 1', status: 'Active' },
      { name: 'Account 2', status: 'Closed' },
      { name: 'Account 3', status: 'Active' }
    ];

    test('filters by Active status', () => {
      const filtered = filterAccountsByStatus(accounts, 'Active');

      expect(filtered).toHaveLength(2);
      expect(filtered.every(a => a.status === 'Active')).toBe(true);
    });

    test('filters by Closed status', () => {
      const filtered = filterAccountsByStatus(accounts, 'Closed');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Account 2');
    });

    test('throws error for invalid status', () => {
      expect(() => filterAccountsByStatus(accounts, null)).toThrow();
    });
  });

  describe('groupAccountsByType', () => {
    test('groups accounts by type', () => {
      const accounts = [
        { type: 'Checking', name: 'Account 1' },
        { type: 'Savings', name: 'Account 2' },
        { type: 'Checking', name: 'Account 3' }
      ];

      const grouped = groupAccountsByType(accounts);

      expect(grouped.Checking).toHaveLength(2);
      expect(grouped.Savings).toHaveLength(1);
    });

    test('handles uncategorized accounts', () => {
      const accounts = [
        { name: 'Account 1' }
      ];

      const grouped = groupAccountsByType(accounts);

      expect(grouped.Uncategorized).toHaveLength(1);
    });
  });

  describe('updateAccountBalance', () => {
    test('updates balance immutably', () => {
      const account = {
        id: '123',
        balance: 1000,
        updatedAt: '2024-01-01'
      };

      const updated = updateAccountBalance(account, 2000);

      expect(updated.balance).toBe(2000);
      expect(updated.id).toBe('123');
      expect(updated.updatedAt).not.toBe('2024-01-01');
      expect(account.balance).toBe(1000); // Original unchanged
    });

    test('throws error for invalid balance', () => {
      const account = { balance: 1000 };

      expect(() => updateAccountBalance(account, 'invalid')).toThrow();
    });
  });

  describe('searchAccounts', () => {
    const accounts = [
      { name: 'Chase Checking', accountNumber: '1234', type: 'Checking' },
      { name: 'Wells Fargo Savings', accountNumber: '5678', type: 'Savings' },
      { name: 'Chase Credit Card', accountNumber: '9012', type: 'Credit' }
    ];

    test('searches by name', () => {
      const results = searchAccounts(accounts, 'Chase');

      expect(results).toHaveLength(2);
    });

    test('searches by account number', () => {
      const results = searchAccounts(accounts, '5678');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Wells Fargo Savings');
    });

    test('searches by type', () => {
      const results = searchAccounts(accounts, 'Savings');

      expect(results).toHaveLength(1);
    });

    test('returns all accounts for empty query', () => {
      const results = searchAccounts(accounts, '');

      expect(results).toHaveLength(3);
    });

    test('is case insensitive', () => {
      const results = searchAccounts(accounts, 'chase');

      expect(results).toHaveLength(2);
    });
  });
});
