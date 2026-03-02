/**
 * DuplicateAnalyzer.gs
 * Analyzes Master Register for duplicate accounts
 */

/**
 * Main function to find and report duplicate accounts
 * @returns {Object} Comprehensive duplicate analysis report
 */
function analyzeDuplicateAccounts() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Master Register');

    if (!sheet) {
      return { error: 'Master Register sheet not found' };
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { message: 'No accounts found in Master Register' };
    }

    // Read all 35 columns
    var data = sheet.getRange(2, 1, lastRow - 1, 35).getValues();

    var accounts = data.map(function(row, idx) {
      return {
        rowNum: idx + 2, // +2 because we start from row 2 and arrays are 0-indexed
        id: row[0],                    // A: Row ID
        dateAdded: row[1],             // B: Date Added
        name: (row[2] || '').toString().trim(),  // C: Provider/Creditor Name
        ein: (row[4] || '').toString().trim(),   // E: Provider EIN (based on CreditReportImport line 586)
        accountNumber: (row[5] || '').toString().trim(), // F: Account Number
        type: (row[6] || '').toString().trim(),  // G: Account Type
        subtype: (row[7] || '').toString().trim(), // H: Account Subtype
        status: (row[10] || '').toString().trim(), // K: Status
        balance: row[13],              // N: Current Balance
        primaryUser: (row[19] || '').toString().trim(), // T: Primary User
        notes: (row[32] || '').toString().trim()  // AG: Notes
      };
    });

    // Initialize report
    var report = {
      totalAccounts: accounts.length,
      duplicateCategories: {
        exactDuplicates: [],
        sameEIN: [],
        sameName: [],
        sameAccountNumber: [],
        relatedAccounts: [],
        transferredAccounts: [],
        closedWithActive: []
      },
      recommendations: []
    };

    // 1. Find exact duplicates (same EIN + same account number)
    findExactDuplicates(accounts, report);

    // 2. Find accounts with same EIN (multiple accounts from same company)
    findSameEINAccounts(accounts, report);

    // 3. Find accounts with similar names but different IDs
    findSameNameAccounts(accounts, report);

    // 4. Find transferred/sold accounts (original creditor + collection agency)
    findTransferredAccounts(accounts, report);

    // 5. Find closed accounts with active duplicates
    findClosedWithActiveDuplicates(accounts, report);

    // Generate recommendations
    generateRecommendations(report);

    return report;

  } catch (error) {
    Logger.log('Error in analyzeDuplicateAccounts: ' + error);
    return { error: error.toString() };
  }
}

/**
 * Finds exact duplicate accounts (same EIN + account number)
 */
function findExactDuplicates(accounts, report) {
  var seen = {};

  accounts.forEach(function(acct) {
    if (!acct.ein || !acct.accountNumber) return;

    var key = acct.ein + '|' + acct.accountNumber;

    if (!seen[key]) {
      seen[key] = [];
    }
    seen[key].push(acct);
  });

  // Find groups with more than 1 account
  Object.keys(seen).forEach(function(key) {
    if (seen[key].length > 1) {
      report.duplicateCategories.exactDuplicates.push({
        key: key,
        accounts: seen[key],
        count: seen[key].length
      });
    }
  });
}

/**
 * Finds accounts with the same EIN (multiple accounts from same company)
 */
function findSameEINAccounts(accounts, report) {
  var einMap = {};

  accounts.forEach(function(acct) {
    if (!acct.ein || acct.ein === 'Not provided') return;

    if (!einMap[acct.ein]) {
      einMap[acct.ein] = [];
    }
    einMap[acct.ein].push(acct);
  });

  // Find EINs with more than 1 account
  Object.keys(einMap).forEach(function(ein) {
    if (einMap[ein].length > 1) {
      report.duplicateCategories.sameEIN.push({
        ein: ein,
        companyName: einMap[ein][0].name,
        accounts: einMap[ein],
        count: einMap[ein].length
      });
    }
  });
}

/**
 * Finds accounts with similar/same names
 */
function findSameNameAccounts(accounts, report) {
  var nameMap = {};

  accounts.forEach(function(acct) {
    if (!acct.name) return;

    var normalizedName = acct.name.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9\s]/g, '');

    if (!nameMap[normalizedName]) {
      nameMap[normalizedName] = [];
    }
    nameMap[normalizedName].push(acct);
  });

  // Find names with more than 1 account
  Object.keys(nameMap).forEach(function(name) {
    if (nameMap[name].length > 1) {
      report.duplicateCategories.sameName.push({
        name: nameMap[name][0].name,
        accounts: nameMap[name],
        count: nameMap[name].length
      });
    }
  });
}

/**
 * Finds transferred/sold accounts (e.g., original creditor + collection agency)
 */
function findTransferredAccounts(accounts, report) {
  var collectionKeywords = ['lvnv', 'midland', 'portfolio', 'collect', 'recovery'];
  var transferKeywords = ['transferred', 'sold', 'acquired'];

  var collectionAccounts = accounts.filter(function(acct) {
    var nameLower = acct.name.toLowerCase();
    var notesLower = acct.notes.toLowerCase();

    return collectionKeywords.some(function(keyword) {
      return nameLower.indexOf(keyword) !== -1;
    }) || transferKeywords.some(function(keyword) {
      return notesLower.indexOf(keyword) !== -1;
    });
  });

  if (collectionAccounts.length > 0) {
    report.duplicateCategories.transferredAccounts = collectionAccounts;
  }
}

/**
 * Finds closed accounts that have active duplicates
 */
function findClosedWithActiveDuplicates(accounts, report) {
  var closedStatuses = ['closed', 'transferred', 'sold', 'paid off', 'settled'];

  accounts.forEach(function(closedAcct) {
    if (!closedStatuses.some(function(s) {
      return closedAcct.status.toLowerCase().indexOf(s) !== -1;
    })) {
      return; // Not a closed account
    }

    // Look for active accounts with same EIN or similar name
    var relatedActive = accounts.filter(function(activeAcct) {
      if (activeAcct.id === closedAcct.id) return false;

      var isActive = activeAcct.status.toLowerCase().indexOf('active') !== -1 ||
                     activeAcct.status.toLowerCase().indexOf('open') !== -1;

      if (!isActive) return false;

      // Check if related by EIN or name
      var sameEIN = closedAcct.ein && activeAcct.ein === closedAcct.ein;
      var similarName = closedAcct.name && activeAcct.name &&
                        activeAcct.name.toLowerCase().indexOf(closedAcct.name.toLowerCase()) !== -1;

      return sameEIN || similarName;
    });

    if (relatedActive.length > 0) {
      report.duplicateCategories.closedWithActive.push({
        closedAccount: closedAcct,
        activeAccounts: relatedActive
      });
    }
  });
}

/**
 * Generates recommendations for duplicate removal
 */
function generateRecommendations(report) {
  // Exact duplicates - keep most recent
  report.duplicateCategories.exactDuplicates.forEach(function(group) {
    var sorted = group.accounts.sort(function(a, b) {
      return new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    report.recommendations.push({
      type: 'EXACT_DUPLICATE',
      severity: 'HIGH',
      action: 'REMOVE',
      keep: sorted[0].id,
      remove: sorted.slice(1).map(function(a) { return a.id; }),
      reason: 'Exact duplicate (same EIN + account number)',
      details: 'Keep most recent: ' + sorted[0].id + ' (' + sorted[0].dateAdded + ')'
    });
  });

  // Closed accounts with active duplicates
  report.duplicateCategories.closedWithActive.forEach(function(group) {
    report.recommendations.push({
      type: 'CLOSED_WITH_ACTIVE',
      severity: 'MEDIUM',
      action: 'ARCHIVE',
      keep: group.activeAccounts.map(function(a) { return a.id; }),
      remove: [group.closedAccount.id],
      reason: 'Closed account has active replacement',
      details: 'Archive closed ' + group.closedAccount.id + ', keep active ' +
               group.activeAccounts.map(function(a) { return a.id; }).join(', ')
    });
  });

  // Multiple accounts with same EIN
  report.duplicateCategories.sameEIN.forEach(function(group) {
    var hasMultipleActive = group.accounts.filter(function(a) {
      return a.status.toLowerCase().indexOf('active') !== -1;
    }).length > 1;

    if (hasMultipleActive) {
      report.recommendations.push({
        type: 'SAME_EIN_MULTIPLE_ACCOUNTS',
        severity: 'LOW',
        action: 'REVIEW',
        accounts: group.accounts.map(function(a) { return a.id; }),
        reason: 'Multiple active accounts from same company (' + group.companyName + ')',
        details: 'Verify if these are different products/services or true duplicates'
      });
    }
  });

  // Transferred/collection accounts
  if (report.duplicateCategories.transferredAccounts.length > 0) {
    report.recommendations.push({
      type: 'TRANSFERRED_DEBT',
      severity: 'MEDIUM',
      action: 'REVIEW',
      accounts: report.duplicateCategories.transferredAccounts.map(function(a) {
        return a.id;
      }),
      reason: 'Collection/transferred debt accounts detected',
      details: 'Verify original creditor accounts are closed/transferred'
    });
  }
}

/**
 * Formats the duplicate report as HTML for display
 */
function formatDuplicateReportHTML(report) {
  if (report.error) {
    return '<p style="color: red;">Error: ' + report.error + '</p>';
  }

  var html = '<div style="font-family: Arial, sans-serif; padding: 20px;">';
  html += '<h1>Master Register Duplicate Analysis Report</h1>';
  html += '<p><strong>Total Accounts:</strong> ' + report.totalAccounts + '</p>';
  html += '<hr>';

  // Summary
  html += '<h2>Summary</h2>';
  html += '<ul>';
  html += '<li>Exact Duplicates: ' + report.duplicateCategories.exactDuplicates.length + '</li>';
  html += '<li>Accounts with Same EIN: ' + report.duplicateCategories.sameEIN.length + '</li>';
  html += '<li>Accounts with Same Name: ' + report.duplicateCategories.sameName.length + '</li>';
  html += '<li>Transferred/Collection Accounts: ' + report.duplicateCategories.transferredAccounts.length + '</li>';
  html += '<li>Closed with Active Duplicates: ' + report.duplicateCategories.closedWithActive.length + '</li>';
  html += '</ul>';

  // Recommendations
  html += '<h2>Recommendations</h2>';
  if (report.recommendations.length === 0) {
    html += '<p>No duplicates requiring immediate action found.</p>';
  } else {
    report.recommendations.forEach(function(rec) {
      html += '<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; border-radius: 5px;">';
      html += '<h3 style="color: ' + (rec.severity === 'HIGH' ? 'red' : rec.severity === 'MEDIUM' ? 'orange' : 'blue') + ';">';
      html += rec.type + ' (' + rec.severity + ')</h3>';
      html += '<p><strong>Action:</strong> ' + rec.action + '</p>';
      html += '<p><strong>Reason:</strong> ' + rec.reason + '</p>';
      html += '<p><strong>Details:</strong> ' + rec.details + '</p>';
      if (rec.keep) {
        html += '<p><strong>Keep:</strong> ' + (Array.isArray(rec.keep) ? rec.keep.join(', ') : rec.keep) + '</p>';
      }
      if (rec.remove) {
        html += '<p><strong>Remove:</strong> ' + (Array.isArray(rec.remove) ? rec.remove.join(', ') : rec.remove) + '</p>';
      }
      if (rec.accounts) {
        html += '<p><strong>Accounts to Review:</strong> ' + rec.accounts.join(', ') + '</p>';
      }
      html += '</div>';
    });
  }

  // Detailed breakdown
  html += '<h2>Detailed Breakdown</h2>';

  // Exact duplicates
  if (report.duplicateCategories.exactDuplicates.length > 0) {
    html += '<h3>Exact Duplicates</h3>';
    report.duplicateCategories.exactDuplicates.forEach(function(group) {
      html += '<div style="margin-left: 20px;">';
      html += '<p><strong>EIN + Account Number:</strong> ' + group.key + '</p>';
      html += '<ul>';
      group.accounts.forEach(function(acct) {
        html += '<li>' + acct.id + ': ' + acct.name + ' - Status: ' + acct.status +
                ' - Added: ' + acct.dateAdded + '</li>';
      });
      html += '</ul>';
      html += '</div>';
    });
  }

  // Same EIN groups
  if (report.duplicateCategories.sameEIN.length > 0) {
    html += '<h3>Multiple Accounts with Same EIN</h3>';
    report.duplicateCategories.sameEIN.forEach(function(group) {
      html += '<div style="margin-left: 20px;">';
      html += '<p><strong>Company:</strong> ' + group.companyName + ' (EIN: ' + group.ein + ')</p>';
      html += '<ul>';
      group.accounts.forEach(function(acct) {
        html += '<li>' + acct.id + ': ' + acct.name + ' - Account: ' + acct.accountNumber +
                ' - Type: ' + acct.type + ' - Status: ' + acct.status + '</li>';
      });
      html += '</ul>';
      html += '</div>';
    });
  }

  html += '</div>';
  return html;
}

/**
 * Shows the duplicate analysis report in a dialog
 */
function showDuplicateAnalysisReport() {
  var report = analyzeDuplicateAccounts();
  var htmlContent = formatDuplicateReportHTML(report);

  var html = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(1000)
    .setHeight(800);

  SpreadsheetApp.getUi().showModalDialog(html, 'Duplicate Account Analysis Report');
}

/**
 * Returns the duplicate report as JSON for programmatic access
 */
function getDuplicateReportJSON() {
  var report = analyzeDuplicateAccounts();
  return JSON.stringify(report, null, 2);
}

/**
 * Removes duplicate accounts based on recommendations
 * @param {Array<string>} accountIdsToRemove - Array of MR-XXX IDs to remove
 * @returns {Object} Result with success/failure details
 */
function removeDuplicateAccounts(accountIdsToRemove) {
  try {
    if (!accountIdsToRemove || accountIdsToRemove.length === 0) {
      return { success: false, error: 'No account IDs provided' };
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Master Register');

    if (!sheet) {
      return { success: false, error: 'Master Register sheet not found' };
    }

    var lastRow = sheet.getLastRow();
    var data = sheet.getRange(1, 1, lastRow, 1).getValues();

    var removedAccounts = [];
    var notFoundAccounts = [];
    var rowsToDelete = [];

    // Find rows to delete (in reverse order to avoid index shifting)
    for (var i = data.length - 1; i >= 1; i--) { // Start from 1 to skip header
      var accountId = data[i][0];

      if (accountIdsToRemove.indexOf(accountId) !== -1) {
        rowsToDelete.push({
          rowNum: i + 1, // +1 because arrays are 0-indexed but rows are 1-indexed
          accountId: accountId
        });
      }
    }

    // Delete rows in reverse order to avoid index shifting
    rowsToDelete.forEach(function(item) {
      sheet.deleteRow(item.rowNum);
      removedAccounts.push(item.accountId);
    });

    // Check for accounts that weren't found
    accountIdsToRemove.forEach(function(id) {
      if (removedAccounts.indexOf(id) === -1) {
        notFoundAccounts.push(id);
      }
    });

    return {
      success: true,
      removedCount: removedAccounts.length,
      removedAccounts: removedAccounts,
      notFoundAccounts: notFoundAccounts,
      message: 'Removed ' + removedAccounts.length + ' duplicate account(s)'
    };

  } catch (error) {
    Logger.log('Error removing duplicates: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Archives duplicate accounts by moving them to an Archive sheet
 * @param {Array<string>} accountIdsToArchive - Array of MR-XXX IDs to archive
 * @returns {Object} Result with success/failure details
 */
function archiveDuplicateAccounts(accountIdsToArchive) {
  try {
    if (!accountIdsToArchive || accountIdsToArchive.length === 0) {
      return { success: false, error: 'No account IDs provided' };
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var masterSheet = ss.getSheetByName('Master Register');

    if (!masterSheet) {
      return { success: false, error: 'Master Register sheet not found' };
    }

    // Get or create Archive sheet
    var archiveSheet = ss.getSheetByName('Master Register Archive');
    if (!archiveSheet) {
      archiveSheet = ss.insertSheet('Master Register Archive');

      // Copy headers from Master Register
      var headers = masterSheet.getRange(1, 1, 1, 35).getValues();
      archiveSheet.getRange(1, 1, 1, 35).setValues(headers);

      // Add archive metadata columns
      archiveSheet.getRange(1, 36).setValue('Archive Date');
      archiveSheet.getRange(1, 37).setValue('Archive Reason');
    }

    var lastRow = masterSheet.getLastRow();
    var data = masterSheet.getRange(1, 1, lastRow, 35).getValues();

    var archivedAccounts = [];
    var notFoundAccounts = [];
    var rowsToDelete = [];

    // Find and copy accounts to archive (in reverse order)
    for (var i = data.length - 1; i >= 1; i--) {
      var accountId = data[i][0];

      if (accountIdsToArchive.indexOf(accountId) !== -1) {
        // Copy to archive sheet
        var archiveLastRow = archiveSheet.getLastRow();
        var rowData = data[i];

        // Add archive metadata
        rowData.push(new Date()); // Archive date
        rowData.push('Duplicate account - archived via Duplicate Analyzer');

        archiveSheet.getRange(archiveLastRow + 1, 1, 1, 37).setValues([rowData]);

        rowsToDelete.push({
          rowNum: i + 1,
          accountId: accountId
        });
      }
    }

    // Delete rows from Master Register (in reverse order)
    rowsToDelete.forEach(function(item) {
      masterSheet.deleteRow(item.rowNum);
      archivedAccounts.push(item.accountId);
    });

    // Check for accounts that weren't found
    accountIdsToArchive.forEach(function(id) {
      if (archivedAccounts.indexOf(id) === -1) {
        notFoundAccounts.push(id);
      }
    });

    return {
      success: true,
      archivedCount: archivedAccounts.length,
      archivedAccounts: archivedAccounts,
      notFoundAccounts: notFoundAccounts,
      message: 'Archived ' + archivedAccounts.length + ' duplicate account(s) to Master Register Archive sheet'
    };

  } catch (error) {
    Logger.log('Error archiving duplicates: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Automatically removes high-confidence exact duplicates
 * Keeps the most recent account and removes older duplicates
 * @returns {Object} Result with details of removed accounts
 */
function autoRemoveExactDuplicates() {
  try {
    var report = analyzeDuplicateAccounts();

    if (!report.recommendations || report.recommendations.length === 0) {
      return {
        success: true,
        message: 'No exact duplicates found',
        removedCount: 0
      };
    }

    var accountsToRemove = [];

    // Get all EXACT_DUPLICATE recommendations
    report.recommendations.forEach(function(rec) {
      if (rec.type === 'EXACT_DUPLICATE' && rec.severity === 'HIGH' && rec.remove) {
        accountsToRemove = accountsToRemove.concat(rec.remove);
      }
    });

    if (accountsToRemove.length === 0) {
      return {
        success: true,
        message: 'No exact duplicates to remove',
        removedCount: 0
      };
    }

    // Remove the duplicates
    var result = removeDuplicateAccounts(accountsToRemove);

    return result;

  } catch (error) {
    Logger.log('Error in autoRemoveExactDuplicates: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}
