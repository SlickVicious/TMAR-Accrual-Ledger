/**
 * GUIFunctions - Supporting functions for the Control Panel GUI
 */

/**
 * Shows the TMAR Control Panel (full-page GUI)
 */
function showControlPanel() {
  var html = HtmlService.createHtmlOutputFromFile('ControlPanel')
    .setWidth(1200)
    .setHeight(800);

  SpreadsheetApp.getUi().showModalDialog(html, 'TMAR Control Panel');
}

/**
 * Shows the Control Panel as a sidebar
 */
function showControlPanelSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('ControlPanel')
    .setTitle('TMAR Control Panel')
    .setWidth(450);

  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Shows the GAAP Universal Accrual Ledger Interface (full-page)
 */
function showGAAPInterface() {
  var html = HtmlService.createHtmlOutputFromFile('GAAPInterface')
    .setWidth(1400)
    .setHeight(900);

  SpreadsheetApp.getUi().showModalDialog(html, '⚡ TMAR Universal Accrual Ledger');
}

/**
 * Shows the Bill of Exchange Generator Interface (full-page)
 */
function showBillOfExchange() {
  var html = HtmlService.createHtmlOutputFromFile('BillOfExchange')
    .setWidth(1200)
    .setHeight(900);

  SpreadsheetApp.getUi().showModalDialog(html, '⚖ Bill of Exchange Generator');
}

/**
 * Shows the EIN Verifier Interface (full-page)
 */
function showEINVerifier() {
  var html = HtmlService.createHtmlOutputFromFile('EINVerifier')
    .setWidth(1200)
    .setHeight(900);

  SpreadsheetApp.getUi().showModalDialog(html, '🔍 EIN Verifier');
}

/**
 * Shows the Document Generator Interface (full-page)
 */
function showDocumentGenerator() {
  var html = HtmlService.createHtmlOutputFromFile('DocumentGenerator')
    .setWidth(1400)
    .setHeight(900);

  SpreadsheetApp.getUi().showModalDialog(html, '📄 Legal Document Generator');
}

/**
 * Gets a list of all accounts
 * @returns {Array<Object>} Array of account objects
 */
function getAccountList() {
  try {
    var accounts = readMasterRegisterAccounts_();
    return accounts;
  } catch (error) {
    Logger.log('Error getting account list: ' + error);
    return [];
  }
}

/**
 * Gets accounts filtered by status
 * @param {string} status - Status to filter by
 * @returns {Array<Object>} Filtered accounts
 */
function getAccountsByStatus(status) {
  try {
    var accounts = readMasterRegisterAccounts_();
    return accounts.filter(function(acc) {
      return acc.status === status;
    });
  } catch (error) {
    Logger.log('Error filtering by status: ' + error);
    return [];
  }
}

/**
 * Gets accounts grouped by type
 * @returns {Object} Accounts grouped by type
 */
function getAccountsGroupedByType() {
  try {
    var accounts = readMasterRegisterAccounts_();
    var grouped = {};

    accounts.forEach(function(acc) {
      var type = acc.type || 'Uncategorized';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(acc);
    });

    return grouped;
  } catch (error) {
    Logger.log('Error grouping by type: ' + error);
    return {};
  }
}

/**
 * Gets balance totals by account type
 * @returns {Object} Balance totals by type
 */
function getBalancesByAccountType() {
  try {
    var accounts = readMasterRegisterAccounts_();
    var balances = {};

    accounts.forEach(function(acc) {
      var type = acc.type || 'Uncategorized';
      var balance = parseFloat(acc.balance) || 0;

      if (!balances[type]) {
        balances[type] = 0;
      }
      balances[type] += balance;
    });

    return balances;
  } catch (error) {
    Logger.log('Error calculating balances by type: ' + error);
    return {};
  }
}

/**
 * Gets monthly spending breakdown
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Object} Spending by category
 */
function getMonthlySpendingReport(year, month) {
  try {
    var transactions = readTransactionLedgerData_();

    var monthlyTxns = transactions.filter(function(txn) {
      var txnDate = new Date(txn.date);
      return txnDate.getFullYear() === year && txnDate.getMonth() + 1 === month;
    });

    var byCategory = {};
    monthlyTxns.forEach(function(txn) {
      var category = txn.category || 'Uncategorized';
      var amount = Math.abs(parseFloat(txn.amount) || 0);

      if (!byCategory[category]) {
        byCategory[category] = { total: 0, count: 0 };
      }
      byCategory[category].total += amount;
      byCategory[category].count += 1;
    });

    return {
      year: year,
      month: month,
      categories: byCategory,
      totalTransactions: monthlyTxns.length
    };
  } catch (error) {
    Logger.log('Error getting monthly spending: ' + error);
    return { error: error.toString() };
  }
}

/**
 * Gets disputed accounts
 * @returns {Array<Object>} Disputed accounts
 */
function getDisputedAccounts() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Master Register');

    if (!sheet) {
      return [];
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return [];
    }

    var data = sheet.getRange(2, 1, lastRow - 1, 35).getValues();

    var disputed = data.filter(function(row) {
      var disputeStatus = row[31]; // AF: Dispute Status
      return disputeStatus && disputeStatus !== '' && disputeStatus !== 'None';
    }).map(function(row) {
      return {
        id: row[0],
        name: row[2],
        type: row[6],
        balance: row[13],
        disputeStatus: row[31],
        notes: row[32]
      };
    });

    return disputed;
  } catch (error) {
    Logger.log('Error getting disputed accounts: ' + error);
    return [];
  }
}

/**
 * Gets accounts needing verification
 * @param {number} daysThreshold - Days since last verification (default 90)
 * @returns {Array<Object>} Accounts needing verification
 */
function getAccountsNeedingVerification(daysThreshold) {
  daysThreshold = daysThreshold || 90;

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Master Register');

    if (!sheet) {
      return [];
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return [];
    }

    var data = sheet.getRange(2, 1, lastRow - 1, 35).getValues();
    var cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    var needingVerification = data.filter(function(row) {
      var lastVerified = row[23]; // X: Last Verified

      if (!lastVerified) {
        return true; // Never verified
      }

      var verifiedDate = new Date(lastVerified);
      return verifiedDate < cutoffDate;
    }).map(function(row) {
      return {
        id: row[0],
        name: row[2],
        type: row[6],
        balance: row[13],
        lastVerified: row[23] || 'Never',
        status: row[10]
      };
    });

    return needingVerification;
  } catch (error) {
    Logger.log('Error getting accounts needing verification: ' + error);
    return [];
  }
}

/**
 * Gets tax-relevant accounts for a tax year
 * @param {number} year - Tax year (optional)
 * @returns {Object} Tax-relevant accounts grouped by form type
 */
function getTaxRelevantAccountsReport(year) {
  year = year || new Date().getFullYear();

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Master Register');

    if (!sheet) {
      return { year: year, accounts: [], byForm: {} };
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { year: year, accounts: [], byForm: {} };
    }

    var data = sheet.getRange(2, 1, lastRow - 1, 35).getValues();

    var taxAccounts = data.filter(function(row) {
      var taxRelevance = row[26]; // AA: Tax Relevance
      return taxRelevance && taxRelevance !== '' && taxRelevance !== 'None';
    }).map(function(row) {
      return {
        id: row[0],
        name: row[2],
        type: row[6],
        balance: row[13],
        taxRelevance: row[26],
        taxForm: row[27] || 'Other',
        deductionType: row[28]
      };
    });

    // Group by tax form
    var byForm = {};
    taxAccounts.forEach(function(acc) {
      var form = acc.taxForm;
      if (!byForm[form]) {
        byForm[form] = [];
      }
      byForm[form].push(acc);
    });

    return {
      year: year,
      accounts: taxAccounts,
      byForm: byForm,
      count: taxAccounts.length
    };
  } catch (error) {
    Logger.log('Error getting tax-relevant accounts: ' + error);
    return { year: year, accounts: [], byForm: {}, error: error.toString() };
  }
}

/**
 * Updates an account in Master Register
 * @param {string} accountId - MR-XXX ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Result with success status
 */
function updateAccount(accountId, updates) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Master Register');

    if (!sheet) {
      throw new Error('Master Register sheet not found');
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      throw new Error('No accounts found');
    }

    // Find the account row
    var data = sheet.getRange(1, 1, lastRow, 1).getValues();
    var rowIndex = -1;

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === accountId) {
        rowIndex = i + 1; // +1 because arrays are 0-indexed but rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Account ' + accountId + ' not found');
    }

    // Update fields
    if (updates.balance !== undefined) {
      sheet.getRange(rowIndex, 14).setValue(updates.balance); // N: Current Balance
    }
    if (updates.status !== undefined) {
      sheet.getRange(rowIndex, 11).setValue(updates.status); // K: Status
    }
    if (updates.notes !== undefined) {
      sheet.getRange(rowIndex, 33).setValue(updates.notes); // AG: Notes
    }

    return {
      success: true,
      message: 'Account ' + accountId + ' updated successfully'
    };
  } catch (error) {
    Logger.log('Error updating account: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Deletes an account from Master Register
 * @param {string} accountId - MR-XXX ID
 * @returns {Object} Result with success status
 */
function deleteAccount(accountId) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Master Register');

    if (!sheet) {
      throw new Error('Master Register sheet not found');
    }

    var lastRow = sheet.getLastRow();
    var data = sheet.getRange(1, 1, lastRow, 1).getValues();
    var rowIndex = -1;

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === accountId) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Account ' + accountId + ' not found');
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Account ' + accountId + ' deleted successfully'
    };
  } catch (error) {
    Logger.log('Error deleting account: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets account details by ID
 * @param {string} accountId - MR-XXX ID
 * @returns {Object} Account object or null
 */
function getAccountById(accountId) {
  try {
    var accounts = readMasterRegisterAccounts_();

    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].id === accountId) {
        return accounts[i];
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting account by ID: ' + error);
    return null;
  }
}

/**
 * Adds a transaction to Transaction Ledger
 * @param {Object} txnData - Transaction data
 * @returns {Object} Result with success status
 */
function addTransaction(txnData) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Transaction Ledger');

    if (!sheet) {
      throw new Error('Transaction Ledger sheet not found');
    }

    var row = [
      txnData.date || new Date(),
      txnData.description || '',
      txnData.category || '',
      txnData.amount || 0,
      txnData.account || '',
      txnData.type || 'Expense',
      txnData.reconciled || false
    ];

    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, 7).setValues([row]);

    return {
      success: true,
      message: 'Transaction added successfully'
    };
  } catch (error) {
    Logger.log('Error adding transaction: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gets transactions for a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array<Object>} Transactions in range
 */
function getTransactionsByDateRange(startDate, endDate) {
  try {
    var transactions = readTransactionLedgerData_();

    var filtered = transactions.filter(function(txn) {
      var txnDate = new Date(txn.date);
      return txnDate >= new Date(startDate) && txnDate <= new Date(endDate);
    });

    return filtered;
  } catch (error) {
    Logger.log('Error getting transactions by date range: ' + error);
    return [];
  }
}
