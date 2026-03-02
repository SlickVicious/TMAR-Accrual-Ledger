/**
 * TransactionService - Pure functions for transaction management
 * Handles income, expenses, and transfers
 */

/**
 * Validates transaction data
 * @param {Object} transaction - Transaction object to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateTransaction(transaction) {
  const errors = [];

  if (!transaction) {
    return { valid: false, errors: ['Transaction object is required'] };
  }

  if (!transaction.date) {
    errors.push('Transaction date is required');
  }

  if (!transaction.category || typeof transaction.category !== 'string') {
    errors.push('Transaction category is required and must be a string');
  }

  if (transaction.amount === undefined || typeof transaction.amount !== 'number') {
    errors.push('Transaction amount is required and must be a number');
  }

  if (transaction.amount !== undefined && transaction.amount === 0) {
    errors.push('Transaction amount cannot be zero');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates a new transaction object
 * @param {Object} data - Transaction data
 * @returns {Object} Normalized transaction object
 */
export function createTransaction(data = {}) {
  const validation = validateTransaction(data);

  if (!validation.valid) {
    throw new Error(`Invalid transaction data: ${validation.errors.join(', ')}`);
  }

  return {
    id: data.id || generateTransactionId(),
    date: data.date,
    category: data.category,
    description: data.description || '',
    amount: data.amount,
    accountId: data.accountId || '',
    type: determineTransactionType(data.category),
    reconciled: data.reconciled || false,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Generates a unique transaction ID
 * @returns {string} Unique ID
 */
function generateTransactionId() {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Determines transaction type based on category
 * @param {string} category - Transaction category
 * @returns {string} Transaction type (Income, Expense, Transfer)
 */
function determineTransactionType(category) {
  if (!category) return 'Expense';

  const lowerCategory = category.toLowerCase();

  if (lowerCategory.includes('income')) return 'Income';
  if (lowerCategory.includes('transfer')) return 'Transfer';
  return 'Expense';
}

/**
 * Calculates net income from transactions
 * @param {Array<Object>} transactions - Array of transaction objects
 * @returns {Object} { income: number, expenses: number, net: number }
 */
export function calculateNetIncome(transactions) {
  if (!Array.isArray(transactions)) {
    throw new Error('Transactions must be an array');
  }

  const income = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    income,
    expenses,
    net: income - expenses
  };
}

/**
 * Filters transactions by date range
 * @param {Array<Object>} transactions - Array of transaction objects
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {Array<Object>} Filtered transactions
 */
export function filterTransactionsByDateRange(transactions, startDate, endDate) {
  if (!Array.isArray(transactions)) {
    throw new Error('Transactions must be an array');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date range');
  }

  return transactions.filter(transaction => {
    const txnDate = new Date(transaction.date);
    return txnDate >= start && txnDate <= end;
  });
}

/**
 * Groups transactions by category
 * @param {Array<Object>} transactions - Array of transaction objects
 * @returns {Object} Transactions grouped by category with totals
 */
export function groupTransactionsByCategory(transactions) {
  if (!Array.isArray(transactions)) {
    throw new Error('Transactions must be an array');
  }

  return transactions.reduce((grouped, transaction) => {
    const category = transaction.category || 'Uncategorized';

    if (!grouped[category]) {
      grouped[category] = {
        transactions: [],
        total: 0,
        count: 0
      };
    }

    grouped[category].transactions.push(transaction);
    grouped[category].total += Math.abs(transaction.amount);
    grouped[category].count += 1;

    return grouped;
  }, {});
}

/**
 * Calculates monthly spending by category
 * @param {Array<Object>} transactions - Array of transaction objects
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Object} Spending summary by category
 */
export function calculateMonthlySpending(transactions, year, month) {
  if (!Array.isArray(transactions)) {
    throw new Error('Transactions must be an array');
  }

  if (!year || !month || month < 1 || month > 12) {
    throw new Error('Valid year and month (1-12) are required');
  }

  const monthlyTransactions = transactions.filter(transaction => {
    const txnDate = new Date(transaction.date);
    return txnDate.getFullYear() === year && txnDate.getMonth() + 1 === month;
  });

  return groupTransactionsByCategory(monthlyTransactions);
}

/**
 * Searches transactions by description or category
 * @param {Array<Object>} transactions - Array of transaction objects
 * @param {string} query - Search query
 * @returns {Array<Object>} Matching transactions
 */
export function searchTransactions(transactions, query) {
  if (!Array.isArray(transactions)) {
    throw new Error('Transactions must be an array');
  }

  if (!query || typeof query !== 'string') {
    return transactions;
  }

  const lowerQuery = query.toLowerCase();

  return transactions.filter(transaction => {
    const descMatch = transaction.description?.toLowerCase().includes(lowerQuery);
    const catMatch = transaction.category?.toLowerCase().includes(lowerQuery);

    return descMatch || catMatch;
  });
}

/**
 * Marks transaction as reconciled
 * @param {Object} transaction - Transaction to reconcile
 * @returns {Object} Updated transaction object (immutable)
 */
export function reconcileTransaction(transaction) {
  if (!transaction) {
    throw new Error('Transaction is required');
  }

  return {
    ...transaction,
    reconciled: true,
    updatedAt: new Date().toISOString()
  };
}
