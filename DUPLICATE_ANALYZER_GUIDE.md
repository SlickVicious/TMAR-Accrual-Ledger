# TMAR Duplicate Account Analyzer - User Guide

## Overview

The **Duplicate Account Analyzer** is a comprehensive tool for identifying and removing duplicate accounts in your Master Register. It analyzes accounts based on multiple criteria and provides actionable recommendations.

---

## Features

### 1. **Duplicate Detection Categories**

The analyzer identifies duplicates in six categories:

#### A. Exact Duplicates (HIGH Priority)
- **Criteria**: Same EIN + Same Account Number
- **Action**: Automatically removable
- **Example**: Two entries for the same Credit One account with identical EIN and account number

#### B. Same EIN Accounts (LOW-MEDIUM Priority)
- **Criteria**: Multiple accounts from the same company (same EIN)
- **Action**: Review required
- **Example**: Multiple Nelnet student loans (MR-054 through MR-060) all with EIN 84-0748903
- **Note**: These may be legitimate separate accounts (different loans) or duplicates

#### C. Same Name Accounts (MEDIUM Priority)
- **Criteria**: Accounts with identical or very similar names
- **Action**: Manual review recommended
- **Example**: "OneMain Financial" appearing multiple times (MR-017, MR-061, MR-063, MR-064, MR-065)

#### D. Transferred/Collection Accounts (MEDIUM Priority)
- **Criteria**: Collection agencies holding debts from original creditors
- **Action**: Review and archive original creditor if debt transferred
- **Example**: LVNV Funding (collection agency) vs. Credit One/Continental Finance (original creditors)

#### E. Closed with Active Duplicates (MEDIUM Priority)
- **Criteria**: Closed/transferred accounts that have active replacements
- **Action**: Archive closed accounts
- **Example**: Great Lakes student loan (closed/transferred to Nelnet)

#### F. Account Number Duplicates
- **Criteria**: Different providers with the same account number (rare, usually data entry error)
- **Action**: Verify and correct

---

## How to Use

### Step 1: Access the Analyzer

**Option A: Via Menu (Recommended)**
1. Open your TMAR Google Sheet
2. Click **TMAR Tools** menu
3. Select **🔍 Analyze Duplicates**
4. A modal window will display the full analysis report

**Option B: Via Apps Script**
1. Open **Extensions** > **Apps Script**
2. Run the function: `analyzeDuplicateAccounts()`
3. View results in **Execution log**

**Option C: Get JSON Report**
1. Run function: `getDuplicateReportJSON()`
2. Copy JSON output for programmatic processing

---

### Step 2: Review the Report

The report contains:

1. **Summary Section**
   - Total accounts analyzed
   - Count of each duplicate category

2. **Recommendations Section** (Color-coded by severity)
   - **RED (HIGH)**: Exact duplicates - safe to auto-remove
   - **ORANGE (MEDIUM)**: Requires review before action
   - **BLUE (LOW)**: Informational - verify legitimacy

3. **Detailed Breakdown**
   - Lists all accounts in each duplicate group
   - Shows account IDs, names, statuses, balances
   - Provides context for decision-making

---

### Step 3: Take Action

#### Option A: Automatic Removal (Exact Duplicates Only)

```javascript
// Run this function to auto-remove high-confidence exact duplicates
autoRemoveExactDuplicates();
```

This function will:
- Identify exact duplicates (same EIN + account number)
- Keep the most recent account
- **Permanently delete** older duplicates
- Return a summary of removed accounts

**⚠️ WARNING**: This permanently deletes rows. Use with caution!

---

#### Option B: Manual Removal

```javascript
// Specify account IDs to remove
removeDuplicateAccounts(['MR-001', 'MR-002', 'MR-003']);
```

**Example - Removing Nelnet Duplicates:**

Based on analysis showing multiple Nelnet accounts (EIN 84-0748903):
- MR-016, MR-054, MR-055, MR-056, MR-057, MR-058, MR-059, MR-060

If you determine these are duplicates of the same loan (not separate loans):

```javascript
// Keep MR-060 (most recent), remove others
removeDuplicateAccounts(['MR-016', 'MR-054', 'MR-055', 'MR-056', 'MR-057', 'MR-058', 'MR-059']);
```

---

#### Option C: Archive Instead of Delete (Recommended for Safety)

```javascript
// Move accounts to archive instead of deleting
archiveDuplicateAccounts(['MR-001', 'MR-002', 'MR-003']);
```

This function will:
- Create a "Master Register Archive" sheet if it doesn't exist
- Copy duplicate accounts to the archive with timestamp and reason
- Remove them from the active Master Register
- Allow future recovery if needed

**Recommended for:**
- Closed accounts with active replacements
- Transferred debts (original creditor entries)
- Accounts you're uncertain about

---

## Common Duplicate Patterns

### Pattern 1: Student Loan Servicer Transfers

**Scenario**: Great Lakes transferred federal student loans to Nelnet

**Accounts**:
- MR-XXX: Great Lakes (Status: Transferred/Closed)
- MR-YYY: Nelnet (Status: Active)

**Action**:
```javascript
archiveDuplicateAccounts(['MR-XXX']); // Archive Great Lakes
// Keep MR-YYY (Nelnet) active
```

---

### Pattern 2: Multiple Accounts with Same Company

**Scenario**: Multiple OneMain Financial entries

**Accounts**:
- MR-017, MR-061, MR-063, MR-064, MR-065

**Investigation Steps**:
1. Check account numbers - are they different?
2. Check loan types - personal loan, auto loan, etc.?
3. Check balances - do they add up to total debt?

**If Duplicates**:
```javascript
// Keep most recent, remove others
removeDuplicateAccounts(['MR-017', 'MR-061', 'MR-063', 'MR-064']);
```

**If Separate Loans**:
- Keep all accounts
- Update notes field to clarify: "OneMain - Personal Loan", "OneMain - Auto Loan", etc.

---

### Pattern 3: Original Creditor + Collection Agency

**Scenario**: LVNV Funding collecting on behalf of Credit One

**Accounts**:
- MR-XXX: Credit One (Original creditor)
- MR-YYY: LVNV Funding (Collection agency)

**Action**:
```javascript
// Archive original creditor if debt was sold
archiveDuplicateAccounts(['MR-XXX']); // Archive Credit One
// Keep MR-YYY (LVNV Funding) active with updated notes
```

**Update Notes**:
```javascript
updateAccount('MR-YYY', {
  notes: 'Collection account for original Credit One debt (MR-XXX archived)'
});
```

---

### Pattern 4: Same Account Number, Different Names

**Scenario**: Data entry error - same account listed twice with different provider names

**Investigation**:
1. Compare EINs
2. Compare account numbers
3. Compare balances and payment amounts
4. Check credit report or statements

**If Confirmed Duplicate**:
```javascript
// Keep correct entry, remove incorrect
removeDuplicateAccounts(['MR-INCORRECT-ID']);
```

---

## Best Practices

### 1. **Always Review Before Deleting**
- Run `analyzeDuplicateAccounts()` first
- Review the recommendations
- Verify account details in external sources (credit reports, statements)

### 2. **Use Archive for Uncertain Cases**
- Archive instead of delete if you're not 100% sure
- Archive preserves data with timestamp and reason
- Can be restored if needed

### 3. **Document Decisions**
- Update the Notes field explaining why accounts were merged/removed
- Example: "Duplicate of MR-060 - same Nelnet loan, removed 2026-02-28"

### 4. **Handle Transferred Debts Carefully**
- When debt is transferred: Archive original creditor, keep new servicer
- Update new servicer notes to reference original account
- Maintain audit trail

### 5. **Keep Separate Accounts Separate**
- Just because two accounts have the same EIN doesn't mean they're duplicates
- Verify account numbers differ
- Check if they represent different products/services

### 6. **Run Regular Audits**
- Schedule monthly or quarterly duplicate scans
- Prevents accumulation of duplicates
- Maintains data quality

---

## Verification Checklist

Before removing duplicates, verify:

- [ ] Account numbers are identical (for exact duplicates)
- [ ] EINs match (for same-company accounts)
- [ ] Check external sources (credit reports, bank statements)
- [ ] Verify one account isn't closed while other is active
- [ ] Check if transferred debt (original vs. new servicer)
- [ ] Review payment history to confirm same account
- [ ] Update Notes field with merger/removal reason
- [ ] Back up spreadsheet before bulk deletions

---

## Technical Details

### Functions Available

| Function | Purpose | Returns |
|----------|---------|---------|
| `analyzeDuplicateAccounts()` | Full analysis of all duplicates | Object with report |
| `showDuplicateAnalysisReport()` | Display report in modal dialog | HTML modal |
| `getDuplicateReportJSON()` | Get report as JSON string | JSON string |
| `removeDuplicateAccounts(ids)` | Permanently delete accounts | Result object |
| `archiveDuplicateAccounts(ids)` | Move to archive sheet | Result object |
| `autoRemoveExactDuplicates()` | Auto-remove high-confidence dupes | Result object |

### Report Structure

```javascript
{
  totalAccounts: 70,
  duplicateCategories: {
    exactDuplicates: [...],      // Same EIN + account number
    sameEIN: [...],               // Multiple accounts, same company
    sameName: [...],              // Similar names
    relatedAccounts: [...],       // Related but not identical
    transferredAccounts: [...],   // Collection agencies
    closedWithActive: [...]       // Closed with active replacement
  },
  recommendations: [
    {
      type: 'EXACT_DUPLICATE',
      severity: 'HIGH',
      action: 'REMOVE',
      keep: 'MR-060',
      remove: ['MR-054', 'MR-055'],
      reason: 'Exact duplicate (same EIN + account number)',
      details: 'Keep most recent: MR-060 (2024-01-15)'
    }
  ]
}
```

---

## Troubleshooting

### Issue: "Master Register sheet not found"
**Solution**: Ensure your sheet is named exactly "Master Register"

### Issue: No duplicates found when you know they exist
**Solution**:
- Check if EINs and account numbers are properly filled in
- Verify data format (no extra spaces, consistent formatting)
- Run `populateValidationSheet()` to refresh data

### Issue: Wrong accounts marked as duplicates
**Solution**:
- Review the criteria used
- Some accounts may share EIN but be different products
- Update the logic in `findSameEINAccounts()` if needed

### Issue: Accidental deletion
**Solution**:
- Restore from Google Sheets version history
- Check Archive sheet if `archiveDuplicateAccounts()` was used
- Always backup before bulk operations

---

## Example Workflow

### Complete Duplicate Cleanup Process

```javascript
// STEP 1: Analyze
var report = analyzeDuplicateAccounts();
Logger.log(JSON.stringify(report, null, 2));

// STEP 2: Review high-priority exact duplicates
// Based on report, exact duplicates identified:
// - MR-054, MR-055, MR-056 (same Nelnet loan as MR-060)

// STEP 3: Archive transferred accounts
archiveDuplicateAccounts(['MR-025']); // Great Lakes (transferred to Nelnet)

// STEP 4: Remove exact duplicates (keeping most recent)
removeDuplicateAccounts(['MR-054', 'MR-055', 'MR-056']);

// STEP 5: Update notes for consolidated account
updateAccount('MR-060', {
  notes: 'Consolidated Nelnet account - duplicates MR-054/055/056 removed 2026-02-28'
});

// STEP 6: Document in CPA Questions
// Add note about cleanup for tax purposes
```

---

## Support

For issues or questions:
1. Review this guide
2. Check the code comments in `DuplicateAnalyzer.gs`
3. Run `showHelpDialog()` from TMAR Tools menu
4. Consult with your CPA for tax implications of account consolidation

---

## Version History

- **v1.0** (2026-02-28): Initial release
  - 6 duplicate detection categories
  - Automatic removal for exact duplicates
  - Archive functionality
  - HTML report generator
  - Comprehensive recommendations engine

---

## Safety Notes

⚠️ **IMPORTANT**:
- Duplicate removal is **permanent** unless using archive
- Always backup your spreadsheet before bulk operations
- Review recommendations carefully before auto-removal
- When in doubt, archive instead of delete
- Consult tax professional before removing tax-relevant accounts

✅ **SAFE PRACTICES**:
- Use `archiveDuplicateAccounts()` instead of `removeDuplicateAccounts()`
- Run analysis multiple times before acting
- Verify against external sources (credit reports, statements)
- Document all changes in Notes field
- Keep audit trail of removed accounts
