# Master Register Duplicate Analysis Report
**Generated**: 2026-02-28
**Analyst**: TMAR Duplicate Analyzer v1.0
**Total Accounts**: 71 (MR-001 through MR-070 + MR-COAF-001)

---

## Executive Summary

Based on analysis of the Master Register, the following duplicate patterns have been identified:

### High-Priority Duplicates (Immediate Action Recommended)
1. **Multiple Nelnet Student Loan Entries** (8 accounts) - Same EIN 84-0748903
2. **Multiple OneMain Financial Entries** (5 accounts) - Likely same or related loans
3. **Multiple LVNV Funding Collection Accounts** (4 accounts) - Collection agency duplicates

### Medium-Priority Review Needed
4. **Transferred Student Loans** - Great Lakes to Nelnet migration
5. **Original Creditor + Collection Agency Pairs** - Credit One/Continental Finance → LVNV Funding

---

## Detailed Analysis

### 1. Nelnet Student Loans (EIN: 84-0748903)

**Accounts Identified**:
- MR-016: Nelnet
- MR-054: Nelnet
- MR-055: Nelnet
- MR-056: Nelnet
- MR-057: Nelnet
- MR-058: Nelnet
- MR-059: Nelnet
- MR-060: Nelnet

**Analysis**:
All eight accounts share the same EIN (84-0748903) for Nelnet. This indicates one of two scenarios:

#### Scenario A: Different Federal Student Loans
- Each MR-XXX entry represents a separate federal student loan
- Common for borrowers to have multiple loans from the same academic period
- **Action**: Verify each has a unique account number
- **Recommendation**: KEEP ALL if account numbers differ

#### Scenario B: Duplicate Entries for Same Loan(s)
- Multiple entries created for the same underlying loan(s)
- Data entry error or multiple imports from credit reports
- **Action**: Compare account numbers, balances, and payment amounts
- **Recommendation**: REMOVE duplicates, keep most recent

**Verification Steps**:
1. Check account numbers in column F for each entry
2. Compare balances - do they add up to total Nelnet debt?
3. Review Nelnet statements to count actual number of loans
4. Check studentaid.gov for official loan count

**Recommended Action**:
```javascript
// IF duplicates confirmed (same account numbers):
// Keep MR-060 (likely most recent), remove others
removeDuplicateAccounts(['MR-016', 'MR-054', 'MR-055', 'MR-056', 'MR-057', 'MR-058', 'MR-059']);

// OR use archive for safety:
archiveDuplicateAccounts(['MR-016', 'MR-054', 'MR-055', 'MR-056', 'MR-057', 'MR-058', 'MR-059']);
```

**Expected Outcome**: Reduce from 8 entries to 1-4 entries (depending on actual number of separate loans)

---

### 2. OneMain Financial (Multiple Entries)

**Accounts Identified**:
- MR-017: OneMain Financial
- MR-061: OneMain Financial
- MR-063: OneMain Financial
- MR-064: OneMain Financial
- MR-065: OneMain Financial

**Analysis**:
Five entries for OneMain Financial. Possible scenarios:

#### Scenario A: Different Loan Products
- Personal loan, auto loan, debt consolidation loan, etc.
- OneMain offers multiple financial products
- **Action**: Verify each has unique account number and purpose
- **Recommendation**: KEEP ALL if different products

#### Scenario B: Refinanced/Consolidated Loans
- Original loan refinanced or consolidated into new loan
- Old loan marked closed/paid, new loan active
- **Action**: Check status field - closed vs. active
- **Recommendation**: ARCHIVE closed loans, keep active

#### Scenario C: Duplicate Entries
- Same loan entered multiple times
- **Action**: Compare account numbers and balances
- **Recommendation**: REMOVE exact duplicates

**Verification Steps**:
1. Check account numbers - different = likely separate loans
2. Check status - closed vs. active
3. Review OneMain statements or online account
4. Verify balances don't represent the same debt

**Recommended Action**:
```javascript
// STEP 1: Identify closed vs. active
var oneMainAccounts = ['MR-017', 'MR-061', 'MR-063', 'MR-064', 'MR-065'];

// STEP 2: Review each account's status and account number in Master Register

// STEP 3: If MR-017 is old/closed and others are refinances:
archiveDuplicateAccounts(['MR-017']);

// STEP 4: If MR-061, MR-063, MR-064 are exact duplicates of MR-065:
removeDuplicateAccounts(['MR-061', 'MR-063', 'MR-064']);
```

**Expected Outcome**: Reduce from 5 entries to 1-3 active loans (plus archived closed loans)

---

### 3. LVNV Funding (Collection Agency)

**Accounts Identified**:
- MR-033: LVNV Funding
- MR-034: LVNV Funding
- MR-052: LVNV Funding
- MR-053: LVNV Funding

**Analysis**:
Four LVNV Funding entries. LVNV is a debt collection company that purchases charged-off debts from original creditors.

**Key Questions**:
1. Are these four separate debts purchased from different creditors?
2. Are they duplicates of the same underlying debt?
3. Do corresponding original creditor accounts exist in Master Register?

**Investigation Required**:
- Check account numbers - different = different debts
- Check notes field for original creditor information
- Search Master Register for potential original creditors:
  - Credit One Bank
  - Continental Finance
  - Discover
  - Other credit card issuers

**Common Pattern**:
```
Original Creditor Account (e.g., Credit One - MR-XXX)
       ↓ (debt sold/transferred)
Collection Account (LVNV Funding - MR-033)
```

**Recommended Action**:
```javascript
// STEP 1: For each LVNV account, identify original creditor
// Check notes field or search credit reports

// STEP 2: Find and archive original creditor accounts if debt was sold
// Example:
archiveDuplicateAccounts(['MR-010']); // Original Credit One account
// Keep MR-033 (LVNV Funding collection account)

// STEP 3: Update LVNV account notes
updateAccount('MR-033', {
  notes: 'Collection account - original creditor: Credit One (MR-010 archived)'
});

// STEP 4: If multiple LVNV entries are for the SAME original debt (duplicates):
removeDuplicateAccounts(['MR-034', 'MR-052', 'MR-053']);
```

**Expected Outcome**:
- Archive 2-4 original creditor accounts
- Keep 1-4 LVNV collection accounts (depending on number of unique debts)
- Clear notes linking collection accounts to original creditors

---

### 4. Student Loan Servicer Transfers

**Pattern**: Great Lakes → Nelnet Transfer (2021-2022)

**Background**:
In 2021-2022, the federal government consolidated student loan servicers. Great Lakes Education Loan Services transferred all federal student loans to Nelnet.

**Likely Accounts Affected**:
- Any "Great Lakes" entries in Master Register
- Corresponding Nelnet entries (MR-016, MR-054-060)

**Recommended Action**:
```javascript
// Find Great Lakes accounts
var greatLakesAccounts = getAccountsByName('Great Lakes');

// Archive Great Lakes (transferred/closed)
greatLakesAccounts.forEach(function(acct) {
  archiveDuplicateAccounts([acct.id]);

  // Find corresponding Nelnet account and update notes
  var nelnetId = 'MR-060'; // Replace with actual corresponding account
  updateAccount(nelnetId, {
    notes: 'Transferred from Great Lakes (' + acct.id + ') in 2021-2022 federal servicer consolidation'
  });
});
```

**Expected Outcome**:
- Archive all Great Lakes entries
- Keep corresponding Nelnet entries with clear transfer notes

---

### 5. Other Potential Duplicate Patterns

#### Banking Accounts
**Check for**:
- Multiple Bank of America checking/savings accounts
- Duplicate Chase accounts
- Closed accounts with same account number as active accounts

#### Credit Cards
**Check for**:
- Same credit card with different limits (likely limit increase, not duplicate)
- Closed cards re-opened with new account number
- Store cards (e.g., Target, Amazon) - legitimate to have multiple

#### Utilities
**Check for**:
- Same utility provider at different addresses (legitimate if moved)
- Duplicate entries for current address

---

## Recommended Removal Priority

### Phase 1: High-Confidence Exact Duplicates
**Action**: Auto-remove or manual removal
**Risk**: Low

```javascript
// Run automatic removal for exact duplicates (same EIN + account number)
autoRemoveExactDuplicates();
```

**Estimated Removals**: 5-10 accounts

---

### Phase 2: Transferred/Closed Accounts
**Action**: Archive (safe, reversible)
**Risk**: Very Low

```javascript
// Archive Great Lakes student loan accounts
archiveDuplicateAccounts(['MR-XXX', 'MR-YYY']); // Replace with actual IDs

// Archive original creditor accounts where debt sold to LVNV
archiveDuplicateAccounts(['MR-AAA', 'MR-BBB']); // Replace with actual IDs
```

**Estimated Archives**: 3-5 accounts

---

### Phase 3: Manual Review Cases
**Action**: Individual review required
**Risk**: Medium (requires verification)

**Accounts to Review**:
1. OneMain Financial entries (5 accounts) - verify separate products vs. duplicates
2. Nelnet entries (8 accounts) - count actual loans
3. LVNV Funding entries (4 accounts) - verify separate debts
4. Any accounts with status "Closed" but no corresponding active account

**Process**:
1. For each group, pull credit report or account statements
2. Count unique account numbers
3. Verify current balances match statements
4. Make individual keep/remove decisions
5. Document decisions in Notes field

**Estimated Action**: Keep 50-70% of reviewed accounts after verification

---

## Summary of Expected Cleanup Results

### Before Cleanup
- **Total Accounts**: 71
- **Suspected Duplicates**: 15-20 accounts

### After Cleanup
- **Active Accounts**: 50-55 accounts
- **Archived Accounts**: 10-15 accounts (in "Master Register Archive" sheet)
- **Permanently Removed**: 5-10 accounts (exact duplicates only)

### Data Quality Improvements
- ✅ No exact duplicates (same EIN + account number)
- ✅ Closed/transferred accounts archived with clear notes
- ✅ Collection accounts linked to original creditors
- ✅ Unique account numbers verified
- ✅ Clear audit trail of all changes

---

## Step-by-Step Cleanup Workflow

### Preparation
```javascript
// 1. Backup spreadsheet
// File > Version History > Name this version "Pre-Duplicate Cleanup 2026-02-28"

// 2. Run full analysis
var report = analyzeDuplicateAccounts();
Logger.log(JSON.stringify(report, null, 2));
```

### Phase 1: Exact Duplicates (5 minutes)
```javascript
// 3. Auto-remove exact duplicates
var result1 = autoRemoveExactDuplicates();
Logger.log(result1);
```

### Phase 2: Transferred Accounts (10 minutes)
```javascript
// 4. Archive Great Lakes student loans
archiveDuplicateAccounts(['MR-XXX']); // Replace with actual Great Lakes IDs

// 5. Archive original creditor accounts (debt sold to LVNV)
archiveDuplicateAccounts(['MR-YYY']); // Replace with original creditor IDs
```

### Phase 3: Manual Review (30-60 minutes)
```javascript
// 6. Review Nelnet accounts
// Pull credit report or studentaid.gov data
// Verify each MR-054 through MR-060 has unique account number
// Remove duplicates if account numbers match

// 7. Review OneMain Financial accounts
// Check statements for all 5 accounts
// Identify closed vs. active
// Archive closed, verify active are separate products

// 8. Review LVNV Funding accounts
// Verify each represents unique debt
// Link to original creditors in notes
```

### Finalization
```javascript
// 9. Run analysis again to verify cleanup
var finalReport = analyzeDuplicateAccounts();
Logger.log('Cleanup complete. Remaining accounts: ' + finalReport.totalAccounts);

// 10. Document in CPA Questions sheet
// Note: "Duplicate account cleanup completed 2026-02-28 - reduced from 71 to XX accounts"
```

---

## Verification Checklist

Before removing ANY account, verify:

- [ ] Reviewed account in credit report or bank statement
- [ ] Confirmed duplicate (same EIN AND account number) OR
- [ ] Confirmed closed/transferred with active replacement OR
- [ ] Confirmed collection account with original creditor archived
- [ ] Updated Notes field explaining removal reason
- [ ] Spreadsheet backed up to version history
- [ ] No impact on tax reporting (consult CPA if tax-relevant)

---

## Post-Cleanup Actions

### 1. Update Dashboard
```javascript
// Refresh dashboard to reflect new account totals
refreshDashboard();
```

### 2. Run Data Gap Scanner
```javascript
// Ensure no new gaps created by cleanup
runFullGapScan();
```

### 3. Document for CPA
Create entry in "CPA Questions" sheet:
```
Date: 2026-02-28
Question: Duplicate Account Cleanup Summary
Priority: Low
Status: Info Only
Notes: Cleaned up Master Register duplicates:
- Removed: X exact duplicates
- Archived: Y transferred/closed accounts
- Final active accounts: Z
- See "Master Register Archive" sheet for archived records
```

### 4. Verify Tax Forms
If any tax-relevant accounts were removed/archived:
- Update Tax Relevance tracking
- Ensure 1099s/W-2s still properly categorized
- Verify no double-counting of income/deductions

---

## Questions to Answer Before Cleanup

### For Nelnet Accounts (8 entries)
❓ How many federal student loans do you actually have with Nelnet?
   - Check: studentaid.gov → "My Aid" → "Download My Aid Data"
   - Count: Individual loan IDs

❓ Did you consolidate loans recently?
   - If yes: Old loans should be closed, new consolidated loan active

### For OneMain Financial (5 entries)
❓ How many active loans do you have with OneMain?
   - Check: OneMain online account or statements
   - Count: Unique account numbers

❓ Have you refinanced any OneMain loans?
   - If yes: Old loan should be closed

### For LVNV Funding (4 entries)
❓ Do you know which original creditors these debts came from?
   - Check: Credit report "Collections" section
   - Look for: "Original Creditor" field

❓ Are any of these for the same original debt?
   - If yes: Remove duplicates

### For Student Loan Servicers
❓ Did you have Great Lakes loans that transferred to Nelnet?
   - If yes: Great Lakes accounts should be archived

❓ Have you had other servicer changes (FedLoan, MOHELA, etc.)?
   - Document: Which servicer currently holds the loans

---

## Technical Notes

### Column Mapping Reference
- Column A (row[0]): Account ID (MR-XXX)
- Column C (row[2]): Provider/Creditor Name
- Column E (row[4]): Provider EIN
- Column F (row[5]): Account Number
- Column G (row[6]): Account Type
- Column K (row[10]): Status
- Column N (row[13]): Current Balance
- Column AG (row[32]): Notes

### Functions Used
```javascript
analyzeDuplicateAccounts()         // Generate full report
showDuplicateAnalysisReport()      // Display HTML report
autoRemoveExactDuplicates()        // Auto-remove safe duplicates
removeDuplicateAccounts([ids])     // Manual removal
archiveDuplicateAccounts([ids])    // Move to archive
updateAccount(id, {fields})        // Update account fields
```

---

## Support Resources

### Internal Resources
- DUPLICATE_ANALYZER_GUIDE.md - Full user guide
- DuplicateAnalyzer.gs - Source code with comments
- TMAR Tools menu → 🔍 Analyze Duplicates

### External Resources
- Credit report (annual free report: annualcreditreport.com)
- Student loan data: studentaid.gov
- Bank/credit card statements
- Collections validation letters

### Professional Consultation
- **CPA**: Tax implications of account consolidation
- **Financial Advisor**: Debt management strategy
- **Attorney**: Collections/dispute matters

---

## Conclusion

The Master Register contains approximately **15-20 suspected duplicate accounts** across four main categories:

1. **Nelnet Student Loans** (8 accounts) - Verify if separate loans or duplicates
2. **OneMain Financial** (5 accounts) - Check for refinances and separate products
3. **LVNV Funding** (4 accounts) - Link to original creditors, verify unique debts
4. **Transferred Accounts** (3-5 accounts) - Archive Great Lakes and other transferred servicers

**Recommended Approach**: Start with Phase 1 automatic removal of exact duplicates (low risk), then Phase 2 archival of transferred accounts (very safe), and finally Phase 3 manual review with external verification.

**Estimated Time Investment**:
- Phase 1: 5 minutes
- Phase 2: 10 minutes
- Phase 3: 30-60 minutes
- **Total**: 45-75 minutes

**Expected Outcome**: Reduce Master Register from 71 accounts to 50-55 active accounts, with 10-15 properly archived for audit trail purposes.

---

**Next Step**: Open your TMAR Google Sheet and click **TMAR Tools → 🔍 Analyze Duplicates** to run the full automated analysis.
