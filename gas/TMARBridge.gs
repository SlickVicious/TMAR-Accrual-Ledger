/**
 * TMARBridge - Bridge between Google Apps Script and JavaScript Services
 * Provides menu items and dialog functions that use TMAR services
 */

/**
 * Shows the TMAR Dashboard (HTML sidebar)
 */
function showTMARDashboard() {
  var html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('TMAR Dashboard')
    .setWidth(400);

  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Shows Add Account dialog
 */
function showAddAccountDialog() {
  var html = HtmlService.createHtmlOutputFromFile('AddAccount')
    .setWidth(500)
    .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add New Account');
}

/**
 * Shows Financial Summary dialog
 */
function showFinancialSummary() {
  var summary = getTMARFinancialSummary();

  var html = HtmlService.createTemplateFromFile('FinancialSummary');
  html.data = summary;

  var htmlOutput = html.evaluate()
    .setWidth(600)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Financial Summary');
}

/**
 * Gets financial summary data
 * Called from HTML dialogs
 * @returns {Object} Financial summary
 */
function getTMARFinancialSummary() {
  try {
    // Read accounts from Master Register
    var accounts = readMasterRegisterAccounts_();
    var transactions = readTransactionLedgerData_();

    // Calculate totals
    var totalAssets = 0;
    var totalLiabilities = 0;
    var accountsByType = {};

    accounts.forEach(function(account) {
      var balance = parseFloat(account.balance) || 0;

      if (balance > 0) {
        totalAssets += balance;
      } else {
        totalLiabilities += Math.abs(balance);
      }

      var type = account.type || 'Uncategorized';
      if (!accountsByType[type]) {
        accountsByType[type] = { count: 0, balance: 0 };
      }
      accountsByType[type].count++;
      accountsByType[type].balance += balance;
    });

    // Calculate net income
    var income = 0;
    var expenses = 0;

    transactions.forEach(function(txn) {
      var amount = parseFloat(txn.amount) || 0;
      if (txn.type === 'Income' || amount > 0) {
        income += Math.abs(amount);
      } else {
        expenses += Math.abs(amount);
      }
    });

    return {
      totalAssets: totalAssets.toFixed(2),
      totalLiabilities: totalLiabilities.toFixed(2),
      netWorth: (totalAssets - totalLiabilities).toFixed(2),
      income: income.toFixed(2),
      expenses: expenses.toFixed(2),
      netIncome: (income - expenses).toFixed(2),
      accountCount: accounts.length,
      transactionCount: transactions.length,
      accountsByType: accountsByType
    };
  } catch (error) {
    Logger.log('Error getting financial summary: ' + error);
    return {
      error: error.toString()
    };
  }
}

/**
 * Adds a new account to Master Register
 * Called from Add Account dialog
 * @param {Object} accountData - Account data from form
 * @returns {Object} Result with success status
 */
function addTMARAccount(accountData) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var mrSheet = ss.getSheetByName('Master Register');

    if (!mrSheet) {
      throw new Error('Master Register sheet not found');
    }

    // Generate next MR-XXX ID
    var nextId = generateNextMRId_();

    // Prepare row data (35 columns)
    var row = [
      nextId,                          // A: Row ID
      new Date(),                      // B: Date Added
      accountData.name || '',          // C: Provider/Creditor
      accountData.mailingAddress || '',// D: Mailing Address
      accountData.providerEin || '',   // E: Provider EIN
      accountData.accountNumber || '', // F: Account Number
      accountData.type || '',          // G: Account Type
      accountData.subtype || '',       // H: Account Subtype
      accountData.agent || '',         // I: Account Agent
      accountData.agentAddress || '',  // J: Agent Address
      accountData.status || 'Active',  // K: Status
      accountData.openedDate || '',    // L: Opened Date
      '',                              // M: Closed Date
      accountData.balance || 0,        // N: Current Balance
      accountData.highBalance || 0,    // O: High Balance
      accountData.monthlyPayment || 0, // P: Monthly Payment
      accountData.aprRate || 0,        // Q: APR/Rate
      accountData.billingFrequency || '', // R: Billing Frequency
      accountData.nextPaymentDue || '', // S: Next Payment Due
      accountData.primaryUser || '',   // T: Primary User
      accountData.secondaryUser || '', // U: Secondary User
      accountData.purpose || '',       // V: Account Purpose
      accountData.documentLocation || '', // W: Document Location
      '',                              // X: Last Verified
      accountData.linkedAccount || '', // Y: Linked MR Account
      accountData.trustAssignment || '', // Z: Trust Assignment
      accountData.taxRelevance || '',  // AA: Tax Relevance
      accountData.taxForm || '',       // AB: Tax Form
      accountData.deductionType || '', // AC: Deduction Type
      '',                              // AD: Credit Report Status
      '',                              // AE: Removal Date
      '',                              // AF: Dispute Status
      accountData.notes || '',         // AG: Notes
      'Manual Entry',                  // AH: Source
      'Known'                          // AI: Discovery Status
    ];

    // Append row
    var lastRow = mrSheet.getLastRow();
    mrSheet.getRange(lastRow + 1, 1, 1, 35).setValues([row]);

    Logger.log('Account added: ' + nextId);

    return {
      success: true,
      id: nextId,
      message: 'Account ' + nextId + ' added successfully'
    };
  } catch (error) {
    Logger.log('Error adding account: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Reads accounts from Master Register (helper)
 * @returns {Array<Object>} Array of account objects
 */
function readMasterRegisterAccounts_() {
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

  return data.map(function(row) {
    return {
      id: row[0],
      dateAdded: row[1],
      name: row[2],
      accountNumber: row[5],
      type: row[6],
      status: row[10],
      balance: row[13],
      monthlyPayment: row[15],
      primaryUser: row[19],
      notes: row[32]
    };
  });
}

/**
 * Reads transactions from Transaction Ledger (helper)
 * @returns {Array<Object>} Array of transaction objects
 */
function readTransactionLedgerData_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Transaction Ledger');

  if (!sheet) {
    return [];
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return [];
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();

  return data.map(function(row) {
    return {
      date: row[0],
      description: row[1],
      category: row[2],
      amount: row[3],
      account: row[4],
      type: row[5],
      reconciled: row[6]
    };
  });
}

/**
 * Generates next MR-XXX ID (helper)
 * @returns {string} Next available ID
 */
function generateNextMRId_() {
  var accounts = readMasterRegisterAccounts_();

  if (accounts.length === 0) {
    return 'MR-001';
  }

  var numbers = accounts
    .map(function(acc) { return acc.id; })
    .filter(function(id) { return id && id.startsWith('MR-'); })
    .map(function(id) { return parseInt(id.replace('MR-', ''), 10); })
    .filter(function(n) { return !isNaN(n); });

  var maxNumber = Math.max.apply(null, numbers.concat([0]));
  var nextNumber = maxNumber + 1;

  var paddedNumber = ('000' + nextNumber).slice(-3);
  return 'MR-' + paddedNumber;
}

/**
 * Searches accounts by query
 * @param {string} query - Search query
 * @returns {Array<Object>} Matching accounts
 */
function searchTMARAccounts(query) {
  try {
    var accounts = readMasterRegisterAccounts_();
    var lowerQuery = query.toLowerCase();

    var results = accounts.filter(function(account) {
      var nameMatch = (account.name || '').toLowerCase().includes(lowerQuery);
      var numberMatch = (account.accountNumber || '').toLowerCase().includes(lowerQuery);
      var typeMatch = (account.type || '').toLowerCase().includes(lowerQuery);

      return nameMatch || numberMatch || typeMatch;
    });

    return results;
  } catch (error) {
    Logger.log('Error searching accounts: ' + error);
    return [];
  }
}

/**
 * Gets accounts by user
 * @param {string} user - User name
 * @returns {Array<Object>} User's accounts
 */
function getAccountsByUser(user) {
  try {
    var accounts = readMasterRegisterAccounts_();

    return accounts.filter(function(account) {
      return account.primaryUser === user;
    });
  } catch (error) {
    Logger.log('Error getting accounts by user: ' + error);
    return [];
  }
}

/**
 * Exports TMAR data to JSON
 * @returns {string} JSON string
 */
function exportTMARToJSON() {
  try {
    var accounts = readMasterRegisterAccounts_();
    var transactions = readTransactionLedgerData_();

    var data = {
      accounts: accounts,
      transactions: transactions,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    Logger.log('Error exporting to JSON: ' + error);
    return JSON.stringify({ error: error.toString() });
  }
}
