/**
 * ExecuteCleanup.gs
 * Executes the duplicate account cleanup based on 2026-02-28 analysis
 *
 * SUMMARY:
 * - Remove: 9 exact duplicates (HIGH confidence)
 * - Archive: 3 closed accounts (MEDIUM - preserves data)
 * - Net reduction: 72 accounts → 60 accounts
 */

/**
 * Main cleanup function - executes all cleanup steps
 * Run this function to perform the complete cleanup
 */
function executeFullDuplicateCleanup() {
  Logger.log('=== STARTING DUPLICATE CLEANUP ===');
  Logger.log('Timestamp: ' + new Date());

  var results = {
    timestamp: new Date(),
    exactDuplicatesRemoved: [],
    closedAccountsArchived: [],
    errors: [],
    summary: {}
  };

  try {
    // PHASE 1: Remove exact duplicates (HIGH confidence)
    Logger.log('\n=== PHASE 1: REMOVING EXACT DUPLICATES ===');

    var exactDuplicates = [
      'MR-006',  // Fidelity duplicate
      'MR-016',  // Nelnet duplicate #1
      'MR-055',  // Nelnet duplicate #2
      'MR-056',  // Nelnet duplicate #3
      'MR-057',  // Nelnet duplicate #4
      'MR-058',  // Nelnet duplicate #5
      'MR-059',  // Nelnet duplicate #6
      'MR-060',  // Nelnet duplicate #7
      'MR-017'   // OneMain Financial duplicate
    ];

    Logger.log('Accounts to remove: ' + exactDuplicates.join(', '));

    var removeResult = removeDuplicateAccounts(exactDuplicates);
    results.exactDuplicatesRemoved = removeResult;

    if (removeResult.success) {
      Logger.log('✓ Successfully removed ' + removeResult.removedCount + ' exact duplicates');
      Logger.log('  Removed: ' + removeResult.removedAccounts.join(', '));
      if (removeResult.notFoundAccounts.length > 0) {
        Logger.log('  Not found: ' + removeResult.notFoundAccounts.join(', '));
      }
    } else {
      Logger.log('✗ Error removing duplicates: ' + removeResult.error);
      results.errors.push('Phase 1 error: ' + removeResult.error);
    }

    // PHASE 2: Archive closed accounts (MEDIUM - preserves data)
    Logger.log('\n=== PHASE 2: ARCHIVING CLOSED ACCOUNTS ===');

    var closedAccounts = [
      'MR-063',  // OneMain Financial (2019) - Closed
      'MR-064',  // OneMain Financial (2018) - Closed
      'MR-065'   // OneMain Financial (2016) - Closed
    ];

    Logger.log('Accounts to archive: ' + closedAccounts.join(', '));

    var archiveResult = archiveDuplicateAccounts(closedAccounts);
    results.closedAccountsArchived = archiveResult;

    if (archiveResult.success) {
      Logger.log('✓ Successfully archived ' + archiveResult.archivedCount + ' closed accounts');
      Logger.log('  Archived: ' + archiveResult.archivedAccounts.join(', '));
      if (archiveResult.notFoundAccounts.length > 0) {
        Logger.log('  Not found: ' + archiveResult.notFoundAccounts.join(', '));
      }
    } else {
      Logger.log('✗ Error archiving accounts: ' + archiveResult.error);
      results.errors.push('Phase 2 error: ' + archiveResult.error);
    }

    // PHASE 3: Update notes for consolidated accounts
    Logger.log('\n=== PHASE 3: UPDATING CONSOLIDATED ACCOUNT NOTES ===');

    var noteUpdates = [
      {
        id: 'MR-029',
        notes: 'Consolidated Fidelity account - duplicate MR-006 removed 2026-02-28. Account X96-957819.'
      },
      {
        id: 'MR-054',
        notes: 'Consolidated Nelnet account - 7 duplicates (MR-016, MR-055-060) removed 2026-02-28. Account E985506201. All duplicates had identical account number - data entry error from credit report imports.'
      },
      {
        id: 'MR-061',
        notes: 'Consolidated OneMain Financial account - duplicate MR-017 removed, closed accounts MR-063/064/065 archived 2026-02-28. Account 3243985015137137.'
      },
      {
        id: 'MR-036',
        notes: 'OneMain Financial car loan - separate from personal loan MR-061. Account 619398501513****. Verified unique account.'
      }
    ];

    noteUpdates.forEach(function(update) {
      try {
        var result = updateAccount(update.id, { notes: update.notes });
        if (result.success) {
          Logger.log('✓ Updated notes for ' + update.id);
        } else {
          Logger.log('✗ Failed to update notes for ' + update.id + ': ' + result.error);
          results.errors.push('Note update failed for ' + update.id);
        }
      } catch (error) {
        Logger.log('✗ Error updating ' + update.id + ': ' + error);
        results.errors.push('Note update error for ' + update.id + ': ' + error);
      }
    });

    // PHASE 4: Final verification
    Logger.log('\n=== PHASE 4: FINAL VERIFICATION ===');

    var finalReport = analyzeDuplicateAccounts();

    Logger.log('Final account count: ' + finalReport.totalAccounts);
    Logger.log('Remaining exact duplicates: ' + finalReport.duplicateCategories.exactDuplicates.length);

    results.summary = {
      startingAccounts: 72,
      finalAccounts: finalReport.totalAccounts,
      accountsRemoved: removeResult.removedCount || 0,
      accountsArchived: archiveResult.archivedCount || 0,
      remainingExactDuplicates: finalReport.duplicateCategories.exactDuplicates.length,
      remainingSameEIN: finalReport.duplicateCategories.sameEIN.length,
      remainingTransferred: finalReport.duplicateCategories.transferredAccounts.length
    };

    // SUMMARY
    Logger.log('\n=== CLEANUP SUMMARY ===');
    Logger.log('Starting accounts: 72');
    Logger.log('Accounts removed: ' + results.summary.accountsRemoved);
    Logger.log('Accounts archived: ' + results.summary.accountsArchived);
    Logger.log('Final active accounts: ' + results.summary.finalAccounts);
    Logger.log('Net reduction: ' + (72 - results.summary.finalAccounts) + ' accounts');
    Logger.log('');
    Logger.log('Remaining items for review:');
    Logger.log('  - Exact duplicates: ' + results.summary.remainingExactDuplicates);
    Logger.log('  - Same EIN (review needed): ' + results.summary.remainingSameEIN);
    Logger.log('  - Transferred/collection accounts: ' + results.summary.remainingTransferred);

    if (results.errors.length > 0) {
      Logger.log('\n⚠ ERRORS ENCOUNTERED:');
      results.errors.forEach(function(err) {
        Logger.log('  - ' + err);
      });
    } else {
      Logger.log('\n✓ CLEANUP COMPLETED SUCCESSFULLY - NO ERRORS');
    }

    Logger.log('\n=== CLEANUP COMPLETE ===');

    return results;

  } catch (error) {
    Logger.log('✗ CRITICAL ERROR: ' + error);
    results.errors.push('Critical error: ' + error.toString());
    return results;
  }
}

/**
 * Shows a confirmation dialog before running cleanup
 * Recommended for first-time execution
 */
function confirmAndExecuteCleanup() {
  var ui = SpreadsheetApp.getUi();

  var message = 'This will perform the following actions:\n\n' +
                'REMOVE (permanent):\n' +
                '  • MR-006 (Fidelity duplicate)\n' +
                '  • MR-016, MR-055-060 (7 Nelnet duplicates)\n' +
                '  • MR-017 (OneMain Financial duplicate)\n' +
                '  Total: 9 accounts\n\n' +
                'ARCHIVE (preserves data):\n' +
                '  • MR-063, MR-064, MR-065 (3 closed OneMain accounts)\n\n' +
                'Net result: 72 → 60 accounts\n\n' +
                'IMPORTANT: This cannot be undone!\n' +
                'Ensure you have backed up the spreadsheet.\n\n' +
                'Continue with cleanup?';

  var response = ui.alert(
    'Confirm Duplicate Cleanup',
    message,
    ui.ButtonSet.YES_NO
  );

  if (response == ui.Button.YES) {
    var results = executeFullDuplicateCleanup();

    var summaryMessage = 'Cleanup Complete!\n\n' +
                        'Removed: ' + results.summary.accountsRemoved + ' duplicates\n' +
                        'Archived: ' + results.summary.accountsArchived + ' closed accounts\n' +
                        'Final count: ' + results.summary.finalAccounts + ' accounts\n\n' +
                        'Check "Master Register Archive" sheet for archived accounts.\n' +
                        'See Execution log for detailed results.';

    ui.alert('Success', summaryMessage, ui.ButtonSet.OK);

    return results;
  } else {
    ui.alert('Cancelled', 'Duplicate cleanup cancelled. No changes made.', ui.ButtonSet.OK);
    return { cancelled: true };
  }
}

/**
 * Removes ONLY the exact duplicates (no confirmation)
 * Safe to run - high confidence duplicates only
 */
function removeExactDuplicatesOnly() {
  Logger.log('=== REMOVING EXACT DUPLICATES ONLY ===');

  var exactDuplicates = [
    'MR-006',  // Fidelity duplicate (same EIN + account number as MR-029)
    'MR-016',  // Nelnet duplicate (same EIN + account number as MR-054)
    'MR-055',  // Nelnet duplicate
    'MR-056',  // Nelnet duplicate
    'MR-057',  // Nelnet duplicate
    'MR-058',  // Nelnet duplicate
    'MR-059',  // Nelnet duplicate
    'MR-060',  // Nelnet duplicate
    'MR-017'   // OneMain Financial duplicate (same EIN + account number as MR-061)
  ];

  var result = removeDuplicateAccounts(exactDuplicates);

  Logger.log('Result: ' + JSON.stringify(result, null, 2));

  return result;
}

/**
 * Archives ONLY the closed accounts (no confirmation)
 * Very safe - just moves closed accounts to archive
 */
function archiveClosedAccountsOnly() {
  Logger.log('=== ARCHIVING CLOSED ACCOUNTS ONLY ===');

  var closedAccounts = [
    'MR-063',  // OneMain Financial (2019) - Status: Closed
    'MR-064',  // OneMain Financial (2018) - Status: Closed
    'MR-065'   // OneMain Financial (2016) - Status: Closed
  ];

  var result = archiveDuplicateAccounts(closedAccounts);

  Logger.log('Result: ' + JSON.stringify(result, null, 2));

  return result;
}

/**
 * Dry run - shows what would be done without making changes
 */
function dryRunCleanup() {
  Logger.log('=== DRY RUN - NO CHANGES WILL BE MADE ===');

  var report = {
    exactDuplicatesToRemove: [
      { id: 'MR-006', reason: 'Fidelity duplicate - keep MR-029' },
      { id: 'MR-016', reason: 'Nelnet duplicate - keep MR-054' },
      { id: 'MR-055', reason: 'Nelnet duplicate - keep MR-054' },
      { id: 'MR-056', reason: 'Nelnet duplicate - keep MR-054' },
      { id: 'MR-057', reason: 'Nelnet duplicate - keep MR-054' },
      { id: 'MR-058', reason: 'Nelnet duplicate - keep MR-054' },
      { id: 'MR-059', reason: 'Nelnet duplicate - keep MR-054' },
      { id: 'MR-060', reason: 'Nelnet duplicate - keep MR-054' },
      { id: 'MR-017', reason: 'OneMain Financial duplicate - keep MR-061' }
    ],
    closedAccountsToArchive: [
      { id: 'MR-063', reason: 'OneMain Financial (2019) - Closed' },
      { id: 'MR-064', reason: 'OneMain Financial (2018) - Closed' },
      { id: 'MR-065', reason: 'OneMain Financial (2016) - Closed' }
    ],
    accountsToUpdate: [
      { id: 'MR-029', update: 'Add note about consolidated Fidelity account' },
      { id: 'MR-054', update: 'Add note about 7 Nelnet duplicates removed' },
      { id: 'MR-061', update: 'Add note about OneMain consolidation' },
      { id: 'MR-036', update: 'Clarify this is separate car loan' }
    ],
    expectedOutcome: {
      startingAccounts: 72,
      accountsToRemove: 9,
      accountsToArchive: 3,
      finalActiveAccounts: 60,
      netReduction: 12
    }
  };

  Logger.log(JSON.stringify(report, null, 2));

  Logger.log('\n=== SUMMARY ===');
  Logger.log('Starting: 72 accounts');
  Logger.log('Remove: 9 exact duplicates');
  Logger.log('Archive: 3 closed accounts');
  Logger.log('Final: 60 active accounts');
  Logger.log('Net reduction: 12 accounts');

  return report;
}
