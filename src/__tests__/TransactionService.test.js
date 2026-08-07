/**
 * Tests for TransactionService
 */

import { describe, test, expect } from '@jest/globals';
import {
  validateTransaction,
  createTransaction,
  calculateNetIncome,
  filterTransactionsByDateRange,
  groupTransactionsByCategory,
  calculateMonthlySpending,
  searchTransactions,
  reconcileTransaction
} from '../services/TransactionService.js';

describe('TransactionService', () => {
  describe('validateTransaction', () => {
    test('validates correct transaction data', () => {
      const transaction = {
        date: '2024-02-15',
        category: 'Income - W-2 Wages',
        amount: 3500
      };

      const result = validateTransaction(transaction);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects missing transaction object', () => {
      const result = validateTransaction(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Transaction object is required');
    });

    test('rejects missing date', () => {
      const result = validateTransaction({ category: 'Expense - Rent', amount: -1200 });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Transaction date is required');
    });

    test('rejects missing category', () => {
      const result = validateTransaction({ date: '2024-02-15', amount: -50 });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('rejects non-numeric amount', () => {
      const result = validateTransaction({
        date: '2024-02-15',
        category: 'Expense - Groceries',
        amount: 'invalid'
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Transaction amount is required and must be a number');
    });

    test('rejects zero amount', () => {
      const result = validateTransaction({
        date: '2024-02-15',
        category: 'Expense - Groceries',
        amount: 0
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Transaction amount cannot be zero');
    });
  });

  describe('createTransaction', () => {
    test('creates transaction with valid data', () => {
      const data = {
        date: '2024-02-15',
        category: 'Income - W-2 Wages',
        amount: 3500,
        description: 'Paycheck'
      };

      const transaction = createTransaction(data);

      expect(transaction.date).toBe('2024-02-15');
      expect(transaction.amount).toBe(3500);
      expect(transaction.type).toBe('Income');
      expect(transaction.id).toBeDefined();
      expect(transaction.reconciled).toBe(false);
    });

    test('derives Expense type by default', () => {
      const transaction = createTransaction({
        date: '2024-02-20',
        category: 'Rent/Mortgage',
        amount: -1200
      });

      expect(transaction.type).toBe('Expense');
    });

    test('derives Transfer type from category name', () => {
      const transaction = createTransaction({
        date: '2024-02-20',
        category: 'Transfer to Savings',
        amount: -500
      });

      expect(transaction.type).toBe('Transfer');
    });

    test('throws error for invalid data', () => {
      const data = { category: 'Expense - Rent' }; // missing date/amount

      expect(() => createTransaction(data)).toThrow('Invalid transaction data');
    });
  });

  describe('calculateNetIncome', () => {
    test('calculates income, expenses, and net excluding transfers', () => {
      const transactions = [
        { type: 'Income', amount: 3500 },
        { type: 'Expense', amount: -1200 },
        { type: 'Expense', amount: -150.25 },
        { type: 'Transfer', amount: -500 }
      ];

      const result = calculateNetIncome(transactions);

      expect(result.income).toBe(3500);
      expect(result.expenses).toBe(1350.25);
      expect(result.net).toBe(2149.75);
    });

    test('handles empty array', () => {
      const result = calculateNetIncome([]);

      expect(result).toEqual({ income: 0, expenses: 0, net: 0 });
    });

    test('throws error for non-array input', () => {
      expect(() => calculateNetIncome('not an array')).toThrow();
    });
  });

  describe('filterTransactionsByDateRange', () => {
    const transactions = [
      { date: '2024-01-15', description: 'Jan txn' },
      { date: '2024-02-15', description: 'Feb txn' },
      { date: '2024-03-15', description: 'Mar txn' }
    ];

    test('filters transactions within range (inclusive boundaries)', () => {
      const filtered = filterTransactionsByDateRange(transactions, '2024-01-15', '2024-02-15');

      expect(filtered).toHaveLength(2);
      expect(filtered.map(t => t.description)).toEqual(['Jan txn', 'Feb txn']);
    });

    test('excludes transactions outside range', () => {
      const filtered = filterTransactionsByDateRange(transactions, '2024-02-01', '2024-02-28');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].description).toBe('Feb txn');
    });

    test('throws error for invalid date range', () => {
      expect(() => filterTransactionsByDateRange(transactions, 'not-a-date', '2024-02-15')).toThrow('Invalid date range');
    });

    test('throws error for non-array input', () => {
      expect(() => filterTransactionsByDateRange('not an array', '2024-01-01', '2024-02-01')).toThrow();
    });
  });

  describe('groupTransactionsByCategory', () => {
    test('groups transactions by category with totals', () => {
      const transactions = [
        { category: 'Groceries', amount: -50 },
        { category: 'Groceries', amount: -30 },
        { category: 'Rent', amount: -1200 }
      ];

      const grouped = groupTransactionsByCategory(transactions);

      expect(grouped.Groceries.count).toBe(2);
      expect(grouped.Groceries.total).toBe(80);
      expect(grouped.Rent.count).toBe(1);
      expect(grouped.Rent.total).toBe(1200);
    });

    test('handles uncategorized transactions', () => {
      const grouped = groupTransactionsByCategory([{ amount: -10 }]);

      expect(grouped.Uncategorized.count).toBe(1);
    });

    test('throws error for non-array input', () => {
      expect(() => groupTransactionsByCategory('not an array')).toThrow();
    });
  });

  describe('calculateMonthlySpending', () => {
    const transactions = [
      { date: '2024-02-10', category: 'Groceries', amount: -50, type: 'Expense' },
      { date: '2024-02-20', category: 'Rent', amount: -1200, type: 'Expense' },
      { date: '2024-02-15', category: 'Income - W-2 Wages', amount: 3500, type: 'Income' },
      { date: '2024-02-18', category: 'Transfer to Savings', amount: -500, type: 'Transfer' },
      { date: '2024-03-05', category: 'Groceries', amount: -40, type: 'Expense' }
    ];

    test('includes only Expense-type transactions for the given month', () => {
      const result = calculateMonthlySpending(transactions, 2024, 2);

      expect(result.Groceries.count).toBe(1);
      expect(result.Groceries.total).toBe(50);
      expect(result.Rent.count).toBe(1);
      expect(result).not.toHaveProperty('Income - W-2 Wages');
      expect(result).not.toHaveProperty('Transfer to Savings');
    });

    test('excludes transactions from other months', () => {
      const result = calculateMonthlySpending(transactions, 2024, 3);

      expect(result.Groceries.count).toBe(1);
      expect(result.Groceries.total).toBe(40);
      expect(result.Rent).toBeUndefined();
    });

    test('throws error for invalid month', () => {
      expect(() => calculateMonthlySpending(transactions, 2024, 13)).toThrow('Valid year and month (1-12) are required');
    });

    test('throws error for non-array input', () => {
      expect(() => calculateMonthlySpending('not an array', 2024, 2)).toThrow();
    });
  });

  describe('searchTransactions', () => {
    const transactions = [
      { description: 'Paycheck', category: 'Income - W-2 Wages' },
      { description: 'Rent Payment', category: 'Expense - Rent/Mortgage' },
      { description: 'Groceries', category: 'Expense - Groceries' }
    ];

    test('searches by description', () => {
      const results = searchTransactions(transactions, 'Paycheck');

      expect(results).toHaveLength(1);
      expect(results[0].description).toBe('Paycheck');
    });

    test('searches by category', () => {
      const results = searchTransactions(transactions, 'Rent');

      expect(results).toHaveLength(1);
      expect(results[0].description).toBe('Rent Payment');
    });

    test('returns all transactions for empty query', () => {
      const results = searchTransactions(transactions, '');

      expect(results).toHaveLength(3);
    });

    test('is case insensitive', () => {
      const results = searchTransactions(transactions, 'groceries');

      expect(results).toHaveLength(1);
    });

    test('throws error for non-array input', () => {
      expect(() => searchTransactions('not an array', 'query')).toThrow();
    });
  });

  describe('reconcileTransaction', () => {
    test('marks transaction as reconciled immutably', () => {
      const transaction = { id: 'TXN-1', reconciled: false, updatedAt: '2024-01-01' };

      const updated = reconcileTransaction(transaction);

      expect(updated.reconciled).toBe(true);
      expect(updated.id).toBe('TXN-1');
      expect(updated.updatedAt).not.toBe('2024-01-01');
      expect(transaction.reconciled).toBe(false); // original unchanged
    });

    test('throws error for missing transaction', () => {
      expect(() => reconcileTransaction(null)).toThrow('Transaction is required');
    });
  });
});
