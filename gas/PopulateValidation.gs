/**
 * Populate _Validation Sheet with Comprehensive Dropdown Values
 * Run this once to set up all validation lists
 */

function populateValidationSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('_Validation');

  if (!sheet) {
    sheet = ss.insertSheet('_Validation');
  } else {
    sheet.clear();
  }

  // Set up headers
  var headers = [
    'Account Types',        // Col 1 (A)
    'Statuses',            // Col 2 (B)
    'Filing Statuses',     // Col 3 (C)
    'Users',               // Col 4 (D)
    'FWM Binder Tabs',     // Col 5 (E)
    '',                    // Col 6 (F) - unused
    '',                    // Col 7 (G) - unused
    'Billing Frequency',   // Col 8 (H)
    'Transaction Categories', // Col 9 (I)
    'Discovery Status'     // Col 10 (J)
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#1B2A4A')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');

  // ═══════════════════════════════════════════════════════════════
  // COLUMN 1: ACCOUNT TYPES (Comprehensive)
  // ═══════════════════════════════════════════════════════════════
  var accountTypes = [
    // Banking
    'Bank Account - Checking',
    'Bank Account - Savings',
    'Bank Account - Money Market',
    'Bank Account - CD',
    'Bank Account - Business Checking',
    'Bank Account - Business Savings',

    // Credit
    'Credit Card - Personal',
    'Credit Card - Business',
    'Credit Card - Secured',
    'Credit Card - Store Card',
    'Line of Credit',
    'Home Equity Line (HELOC)',

    // Loans
    'Mortgage - Primary Residence',
    'Mortgage - Investment Property',
    'Auto Loan',
    'Student Loan - Federal',
    'Student Loan - Private',
    'Personal Loan',
    'Business Loan',
    'Payday Loan',

    // Investments
    'Investment - Brokerage (Individual)',
    'Investment - Brokerage (Joint)',
    'Investment - IRA Traditional',
    'Investment - IRA Roth',
    'Investment - 401(k)',
    'Investment - 403(b)',
    'Investment - SEP IRA',
    'Investment - Simple IRA',
    'Investment - HSA',
    'Investment - 529 Plan',
    'Investment - Crypto Exchange',
    'Investment - Real Estate',

    // Insurance
    'Insurance - Life',
    'Insurance - Health',
    'Insurance - Auto',
    'Insurance - Home/Renters',
    'Insurance - Disability',
    'Insurance - Umbrella',

    // Utilities & Services
    'Utility - Electric',
    'Utility - Gas',
    'Utility - Water/Sewer',
    'Utility - Internet',
    'Utility - Phone/Mobile',
    'Utility - Cable/Streaming',
    'Utility - Trash/Recycling',

    // Government & Legal
    'Tax Authority - IRS',
    'Tax Authority - State',
    'Tax Authority - Local',
    'Court - Judgment',
    'Court - Settlement',
    'Government Benefit - SSA',
    'Government Benefit - Medicare',
    'Government Benefit - Medicaid',

    // Collections & Charge-offs
    'Collection Account',
    'Charge-off - Bank',
    'Charge-off - Credit Card',
    'Medical Collection',

    // Subscriptions & Memberships
    'Subscription - Streaming',
    'Subscription - Software',
    'Subscription - Gym/Fitness',
    'Subscription - News/Media',
    'Membership - Professional',
    'Membership - Club/Organization',

    // Other
    'PayPal',
    'Venmo',
    'Cash App',
    'Cryptocurrency Wallet',
    'Prepaid Card',
    'Gift Card Balance',
    'Retail Financing',
    'Buy Now Pay Later',
    'Rental Agreement',
    'Storage Unit',
    'Other'
  ];

  // ═══════════════════════════════════════════════════════════════
  // COLUMN 2: STATUSES
  // ═══════════════════════════════════════════════════════════════
  var statuses = [
    'Active',
    'Closed',
    'Closed - Paid Off',
    'Closed - Transferred',
    'Closed - Refinanced',
    'Pending',
    'Pending - Opening',
    'Pending - Closing',
    'Dormant',
    'Frozen',
    'Disputed',
    'In Collections',
    'Charged Off',
    'Bankruptcy - Chapter 7',
    'Bankruptcy - Chapter 13',
    'Settled',
    'Foreclosed',
    'Repossessed',
    'Under Review',
    'Inactive',
    'Suspended',
    'Cancelled'
  ];

  // ═══════════════════════════════════════════════════════════════
  // COLUMN 3: FILING STATUSES
  // ═══════════════════════════════════════════════════════════════
  var filingStatuses = [
    'Not Started',
    'Draft',
    'In Progress',
    'Ready to File',
    'Filed',
    'Submitted',
    'Accepted',
    'Rejected',
    'Complete',
    'Pending Review',
    'Amended',
    'Under Audit',
    'On Hold',
    'Cancelled',
    'Not Applicable'
  ];

  // ═══════════════════════════════════════════════════════════════
  // COLUMN 4: USERS
  // ═══════════════════════════════════════════════════════════════
  var users = [
    'Clint',
    'Syrina',
    'Joint',
    'Trust',
    'Business',
    'Other'
  ];

  // ═══════════════════════════════════════════════════════════════
  // COLUMN 5: FWM BINDER TABS
  // ═══════════════════════════════════════════════════════════════
  var binderTabs = [
    'Tab 1 - Trust Document',
    'Tab 2 - EIN Letter',
    'Tab 3 - Form 56',
    'Tab 4 - Power of Attorney',
    'Tab 5 - Account Claims',
    'Tab 6 - 1099-A Forms',
    'Tab 7 - 1099-B Forms',
    'Tab 8 - Correspondence',
    'Tab 9 - Asset Valuations',
    'Tab 10 - Tax Returns',
    'Tab 11 - Supporting Docs',
    'Not Assigned'
  ];

  // ═══════════════════════════════════════════════════════════════
  // COLUMN 8: BILLING FREQUENCY
  // ═══════════════════════════════════════════════════════════════
  var billingFreq = [
    'Daily',
    'Weekly',
    'Bi-Weekly',
    'Semi-Monthly',
    'Monthly',
    'Bi-Monthly',
    'Quarterly',
    'Semi-Annually',
    'Annually',
    'One-Time',
    'Variable',
    'As Incurred',
    'On Demand',
    'None'
  ];

  // ═══════════════════════════════════════════════════════════════
  // COLUMN 9: TRANSACTION CATEGORIES
  // ═══════════════════════════════════════════════════════════════
  var transactionCats = [
    // Income
    'Income - W-2 Wages',
    'Income - 1099-MISC',
    'Income - 1099-NEC',
    'Income - 1099-INT Interest',
    'Income - 1099-DIV Dividends',
    'Income - 1099-B Investment Sale',
    'Income - Rental',
    'Income - Business',
    'Income - Social Security',
    'Income - Pension/Annuity',
    'Income - Unemployment',
    'Income - Tax Refund',
    'Income - Gift/Inheritance',
    'Income - Other',

    // Housing
    'Expense - Rent/Mortgage',
    'Expense - HOA Fees',
    'Expense - Property Tax',
    'Expense - Home Insurance',
    'Expense - Home Maintenance',
    'Expense - Home Improvement',

    // Utilities
    'Expense - Electric',
    'Expense - Gas/Heat',
    'Expense - Water/Sewer',
    'Expense - Internet',
    'Expense - Phone/Mobile',
    'Expense - Cable/Streaming',
    'Expense - Trash',

    // Transportation
    'Expense - Car Payment',
    'Expense - Auto Insurance',
    'Expense - Gas/Fuel',
    'Expense - Car Maintenance',
    'Expense - Public Transit',
    'Expense - Parking/Tolls',

    // Food
    'Expense - Groceries',
    'Expense - Dining Out',
    'Expense - Fast Food',

    // Healthcare
    'Expense - Health Insurance',
    'Expense - Medical',
    'Expense - Dental',
    'Expense - Vision',
    'Expense - Pharmacy',
    'Expense - Mental Health',

    // Personal & Family
    'Expense - Childcare',
    'Expense - Education/Tuition',
    'Expense - Student Loans',
    'Expense - Clothing',
    'Expense - Personal Care',
    'Expense - Pet Care',
    'Expense - Life Insurance',

    // Entertainment & Recreation
    'Expense - Entertainment',
    'Expense - Hobbies',
    'Expense - Gym/Fitness',
    'Expense - Travel/Vacation',
    'Expense - Subscriptions',

    // Financial & Legal
    'Expense - Bank Fees',
    'Expense - Credit Card Interest',
    'Expense - Investment Fees',
    'Expense - Tax Preparation',
    'Expense - Legal Fees',
    'Expense - Accounting',

    // Business
    'Expense - Office Supplies',
    'Expense - Software/Tools',
    'Expense - Professional Development',
    'Expense - Business Travel',
    'Expense - Marketing/Advertising',

    // Debt & Savings
    'Transfer - Savings',
    'Transfer - Investment',
    'Transfer - Loan Payment',
    'Transfer - Credit Card Payment',
    'Transfer - Between Accounts',

    // Other
    'Expense - Charitable Donations',
    'Expense - Gifts',
    'Expense - Miscellaneous',
    'Adjustment',
    'Fee/Penalty',
    'Refund',
    'Reimbursement',
    'Uncategorized'
  ];

  // ═══════════════════════════════════════════════════════════════
  // COLUMN 10: DISCOVERY STATUS
  // ═══════════════════════════════════════════════════════════════
  var discoveryStatus = [
    'Known',
    'Discovered - Credit Report',
    'Discovered - Statement',
    'Discovered - IRS Transcript',
    'Discovered - Mail',
    'Discovered - Online Search',
    'Verified - Documents',
    'Verified - Called Provider',
    'Claimed - Form 56 Filed',
    'Claimed - In Progress',
    'Abandoned - No Response',
    'Abandoned - Unable to Claim',
    'Closed Before Death',
    'Not Applicable',
    'Under Investigation'
  ];

  // ═══════════════════════════════════════════════════════════════
  // WRITE VALUES TO SHEET
  // ═══════════════════════════════════════════════════════════════

  // Find max length
  var maxLen = Math.max(
    accountTypes.length,
    statuses.length,
    filingStatuses.length,
    users.length,
    binderTabs.length,
    billingFreq.length,
    transactionCats.length,
    discoveryStatus.length
  );

  // Write each column
  for (var i = 0; i < maxLen; i++) {
    var row = [
      accountTypes[i] || '',           // Col 1
      statuses[i] || '',              // Col 2
      filingStatuses[i] || '',        // Col 3
      users[i] || '',                 // Col 4
      binderTabs[i] || '',            // Col 5
      '',                             // Col 6
      '',                             // Col 7
      billingFreq[i] || '',           // Col 8
      transactionCats[i] || '',       // Col 9
      discoveryStatus[i] || ''        // Col 10
    ];

    sheet.getRange(i + 2, 1, 1, row.length).setValues([row]);
  }

  // Format and hide
  sheet.setTabColor('#9E9E9E');
  sheet.hideSheet();

  SpreadsheetApp.getUi().alert(
    'Validation Sheet Updated',
    'Successfully populated _Validation sheet with ' + maxLen + ' rows of dropdown values.\\n\\n' +
    'Account Types: ' + accountTypes.length + '\\n' +
    'Statuses: ' + statuses.length + '\\n' +
    'Transaction Categories: ' + transactionCats.length + '\\n\\n' +
    'Now run: TMAR Tools → Formatting → Refresh Data Validation',
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  Logger.log('_Validation sheet populated with comprehensive dropdown values');
}
