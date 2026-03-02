/**
 * AccountService - Pure functions for account management
 * No DOM access, fully testable, predictable results
 */

/**
 * Validates account data structure
 * @param {Object} account - Account object to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateAccount(account) {
  const errors = [];

  if (!account) {
    return { valid: false, errors: ['Account object is required'] };
  }

  if (!account.name || typeof account.name !== 'string') {
    errors.push('Account name is required and must be a string');
  }

  if (!account.type || typeof account.type !== 'string') {
    errors.push('Account type is required and must be a string');
  }

  if (account.balance !== undefined && typeof account.balance !== 'number') {
    errors.push('Balance must be a number');
  }

  if (account.accountNumber && typeof account.accountNumber !== 'string') {
    errors.push('Account number must be a string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates a new account object with defaults
 * @param {Object} data - Account data
 * @returns {Object} Normalized account object
 */
export function createAccount(data = {}) {
  const validation = validateAccount(data);

  if (!validation.valid) {
    throw new Error(`Invalid account data: ${validation.errors.join(', ')}`);
  }

  return {
    id: data.id || generateAccountId(),
    name: data.name,
    type: data.type,
    accountNumber: data.accountNumber || '',
    balance: data.balance || 0,
    status: data.status || 'Active',
    primaryUser: data.primaryUser || '',
    billingFrequency: data.billingFrequency || 'Monthly',
    discoveryStatus: data.discoveryStatus || 'Known',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Generates a unique account ID
 * @returns {string} Unique ID
 */
function generateAccountId() {
  return `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculates total balance across multiple accounts
 * @param {Array<Object>} accounts - Array of account objects
 * @returns {number} Total balance
 */
export function calculateTotalBalance(accounts) {
  if (!Array.isArray(accounts)) {
    throw new Error('Accounts must be an array');
  }

  return accounts.reduce((total, account) => {
    const balance = parseFloat(account.balance) || 0;
    return total + balance;
  }, 0);
}

/**
 * Filters accounts by status
 * @param {Array<Object>} accounts - Array of account objects
 * @param {string} status - Status to filter by
 * @returns {Array<Object>} Filtered accounts
 */
export function filterAccountsByStatus(accounts, status) {
  if (!Array.isArray(accounts)) {
    throw new Error('Accounts must be an array');
  }

  if (!status || typeof status !== 'string') {
    throw new Error('Status must be a non-empty string');
  }

  return accounts.filter(account => account.status === status);
}

/**
 * Groups accounts by type
 * @param {Array<Object>} accounts - Array of account objects
 * @returns {Object} Accounts grouped by type
 */
export function groupAccountsByType(accounts) {
  if (!Array.isArray(accounts)) {
    throw new Error('Accounts must be an array');
  }

  return accounts.reduce((grouped, account) => {
    const type = account.type || 'Uncategorized';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(account);
    return grouped;
  }, {});
}

/**
 * Updates account balance
 * @param {Object} account - Account to update
 * @param {number} newBalance - New balance value
 * @returns {Object} Updated account object (immutable)
 */
export function updateAccountBalance(account, newBalance) {
  if (!account) {
    throw new Error('Account is required');
  }

  if (typeof newBalance !== 'number') {
    throw new Error('New balance must be a number');
  }

  return {
    ...account,
    balance: newBalance,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Searches accounts by name or account number
 * @param {Array<Object>} accounts - Array of account objects
 * @param {string} query - Search query
 * @returns {Array<Object>} Matching accounts
 */
export function searchAccounts(accounts, query) {
  if (!Array.isArray(accounts)) {
    throw new Error('Accounts must be an array');
  }

  if (!query || typeof query !== 'string') {
    return accounts;
  }

  const lowerQuery = query.toLowerCase();

  return accounts.filter(account => {
    const nameMatch = account.name?.toLowerCase().includes(lowerQuery);
    const numberMatch = account.accountNumber?.toLowerCase().includes(lowerQuery);
    const typeMatch = account.type?.toLowerCase().includes(lowerQuery);

    return nameMatch || numberMatch || typeMatch;
  });
}
