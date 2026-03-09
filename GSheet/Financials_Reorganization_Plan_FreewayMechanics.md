# Financials Reorganization Plan
## Following Freeway Mechanics Workbook Standards

**Date:** 2026-01-18
**Purpose:** Trustee/Estate Account Keeping
**Standard:** Freeway Mechanics Workbook Methodology

---

## Current vs. Required Structure

### What You Have (Current):
```
Digital File Cabinet/Financials/
├── B&G/
│   └── Boys & Girls Club 1 25 - 12 25.md (paycheck tracking)
├── BoA Annual Deposits/
│   ├── 2022.md
│   ├── 2023-25.md
│   ├── 22-2025.md
│   └── Deposits 6-24 to 12 -25.md
└── SSA Earnings Record/
    └── Earnings Summary.md
```

### What You Need (Freeway Mechanics Standard):
```
Master Binder System/
├── 06-Account-Register/
│   ├── 20260118_Trust_AccountRegister.xlsx  ← Master inventory
│   ├── 20260118_Trust_AccountRegister.pdf
│   └── Supporting-Documents/
│       ├── Employment-Income/
│       │   ├── BoysGirlsClub_Paychecks/
│       │   └── InterTechnologies_Paychecks/
│       ├── Bank-Accounts/
│       │   └── BankOfAmerica_Deposits/
│       └── Government-Records/
│           └── SSA_Earnings/
│
└── 07-Source-Documents/
    ├── [EIN]_BoysGirlsClub/
    │   ├── Contracts/
    │   ├── Paychecks/
    │   └── Tax-Forms/
    ├── [EIN]_BankOfAmerica/
    │   ├── Statements/
    │   ├── Contracts/
    │   └── Notices/
    └── SSA_OfficialRecords/
```

---

## Naming Convention Standards

### From Freeway Mechanics Workbook:

#### For Account Statements:
```
YYYYMM_[Provider]_[Last4Acct]_Statement.pdf
Example: 202501_BankOfAmerica_7890_Statement.pdf
```

#### For Contracts/Agreements:
```
YYYYMMDD_[Provider]_[Last4Acct]_Contract.pdf
Example: 20250115_BoysGirlsClub_Employment_Contract.pdf
```

#### For Notices:
```
YYYYMMDD_[Provider]_[Last4Acct]_[NoticeType].pdf
Example: 20251231_BankOfAmerica_7890_YearEndStatement.pdf
```

#### For Tax Documents:
```
YYYY_Tax_[Provider]_[FormType].pdf
Example: 2024_Tax_BoysGirlsClub_W2.pdf
```

#### For Master Register:
```
YYYYMMDD_Trust_AccountRegister.xlsx
YYYYMMDD_Trust_AccountRegister.pdf
Example: 20260118_Trust_AccountRegister.xlsx
```

---

## Proposed File Migrations

### Employment Records:

#### Boys & Girls Club (Current Employer):
**Current:** `B&G/Boys & Girls Club 1 25 - 12 25.md`

**New Location & Names:**
```
Master Binder System/07-Source-Documents/[EIN]_BoysGirlsClub/
├── Paychecks/
│   └── 2025_BoysGirlsClub_PaycheckRegister.md
│   └── 2025_BoysGirlsClub_PaycheckRegister.docx
└── Supporting-Documents/
    └── Individual pay stubs (if you have PDFs)
```

#### Inter Technologies (Previous Employer):
**New Location:**
```
Master Binder System/07-Source-Documents/541990514_InterTechnologies/
├── Paychecks/
│   ├── 2022_InterTech_PaycheckRegister.md
│   ├── 2023_InterTech_PaycheckRegister.md
│   └── 2024_InterTech_PaycheckRegister.md
└── Tax-Forms/
    ├── 2022_Tax_InterTech_W2.pdf (when you get it)
    ├── 2023_Tax_InterTech_W2.pdf
    └── 2024_Tax_InterTech_W2.pdf
```

### Bank Records:

#### Bank of America Deposits:
**Current Files:**
- `2022.md`
- `2023-25.md`
- `22-2025.md`
- `Deposits 6-24 to 12 -25.md`

**New Location & Names:**
```
Master Binder System/07-Source-Documents/[EIN]_BankOfAmerica_[Last4]/
├── Statements/
│   ├── 202201_BankOfAmerica_[Last4]_Statement.md
│   ├── 202201_BankOfAmerica_[Last4]_Statement.docx
│   ├── 202212_BankOfAmerica_[Last4]_Statement.md
│   ├── 202301_BankOfAmerica_[Last4]_Statement.md
│   └── ... (monthly statements)
└── Annual-Summaries/
    ├── 2022_BankOfAmerica_[Last4]_AnnualDeposits.md
    ├── 2022_BankOfAmerica_[Last4]_AnnualDeposits.docx
    ├── 2023_BankOfAmerica_[Last4]_AnnualDeposits.md
    └── 2024_BankOfAmerica_[Last4]_AnnualDeposits.md
```

### Government Records:

#### SSA Earnings:
**Current:** `SSA Earnings Record/Earnings Summary.md`

**New Location & Name:**
```
Master Binder System/07-Source-Documents/SSA_OfficialRecords/
└── Lifetime-Earnings/
    ├── 20260114_SSA_LifetimeEarnings.md
    └── 20260114_SSA_LifetimeEarnings.docx
```

---

## Master Account Register Requirements

Create: `Master Binder System/06-Account-Register/20260118_Trust_AccountRegister.xlsx`

### Required Columns (from Freeway Mechanics):

| Column                 | Data Type     | Example                                       |
| ---------------------- | ------------- | --------------------------------------------- |
| Provider/Creditor Name | Text          | Boys & Girls Clubs of Wayne County            |
| EIN Number             | Text          | XX-XXXXXXX                                    |
| Account Number         | Text (masked) | ****7890                                      |
| Account Type           | Dropdown      | Employment Income / Bank Account / Government |
| Open Date              | Date          | 2025-01-02                                    |
| Close Date             | Date          | (blank if active)                             |
| Status                 | Dropdown      | Open / Closed / Dormant                       |
| Current Balance        | Currency      | $1,521.60                                     |
| Running Total Paid     | Currency      | $34,858.53                                    |
| Billing Frequency      | Dropdown      | Bi-weekly / Monthly / Annual                  |
| Authorized Users       | Text          | Trustee Name                                  |
| Autopay Source         | Text          | None / Bank Account                           |
| Notices on File        | Y/N           | Y                                             |
| 1099s on File          | Text          | 1099-MISC (list form types)                   |
| Statements Complete    | Y/N           | Y                                             |
| Contracts on File      | Y/N           | Y                                             |
| Notes                  | Memo          | CSR contacts, retention terms                 |

### Example Rows:

**Boys & Girls Club Employment:**
- Provider: Boys & Girls Clubs of Wayne County
- EIN: [Their EIN]
- Account: Employee ID (masked)
- Type: Employment Income
- Open Date: 2025-01-02
- Status: Open
- Current Balance: N/A
- Running Total Paid: $34,858.53 (2025 YTD)
- Frequency: Bi-weekly
- Documents: Employment contract, pay stubs, W-2 expected

**Bank of America Account:**
- Provider: Bank of America
- EIN: Bank's EIN
- Account: ****7890
- Type: Bank Account - Checking
- Open Date: [when opened]
- Status: Open
- Current Balance: [current]
- Running Total Deposits: [from your records]
- Frequency: N/A
- Documents: Statements 2022-present, account agreement

**SSA Record:**
- Provider: Social Security Administration
- EIN: Government
- Account: SSN (masked)
- Type: Government - Earnings Record
- Open Date: 1991 (first earnings)
- Status: Active
- Lifetime Earnings: $1,013,884 (calculated from your summary)
- Documents: Official earnings record downloaded 2026-01-14

---

## Migration Script Actions

### Step 1: Create Required Directories
```
Master Binder System/06-Account-Register/Supporting-Documents/
Master Binder System/07-Source-Documents/[EIN]_BoysGirlsClub/
Master Binder System/07-Source-Documents/[EIN]_BankOfAmerica_[Last4]/
Master Binder System/07-Source-Documents/SSA_OfficialRecords/
```

### Step 2: Rename & Move Files

**Employment Records:**
1. Copy `B&G/Boys & Girls Club 1 25 - 12 25.md`
   - To: `07-Source-Documents/[EIN]_BoysGirlsClub/Paychecks/2025_BoysGirlsClub_PaycheckRegister.md`

2. Copy corresponding .docx file
   - To: `07-Source-Documents/[EIN]_BoysGirlsClub/Paychecks/2025_BoysGirlsClub_PaycheckRegister.docx`

**Bank Records:**
1. Consolidate BoA files into annual summaries:
   - `2022.md` → `2022_BankOfAmerica_[Last4]_AnnualDeposits.md`
   - `2023-25.md` → Review and split into 2023, 2024, 2025 files
   - `22-2025.md` → Review and consolidate
   - `Deposits 6-24 to 12 -25.md` → `2024-2025_BankOfAmerica_[Last4]_Deposits_Jun-Dec.md`

**SSA Records:**
1. Copy `SSA Earnings Record/Earnings Summary.md`
   - To: `07-Source-Documents/SSA_OfficialRecords/Lifetime-Earnings/20260114_SSA_LifetimeEarnings.md`

### Step 3: Create Master Account Register
- Template Excel file with all required columns
- Pre-populate with known accounts from current files
- Save as both .xlsx and .pdf

### Step 4: Archive Old Structure
- Move original `Financials/` folder to `Financials_Archive_20260118/`
- Keep as backup reference

---

## Questions Needed Before Script Creation

1. **Bank Account Last 4 Digits:** What are the last 4 of your Bank of America account?
   - For folder naming: `[EIN]_BankOfAmerica_[Last4]`

2. **Boys & Girls Club EIN:** Do you have their Employer Identification Number?
   - For folder naming: `[EIN]_BoysGirlsClub`
   - Can get from W-2 or paycheck stub

3. **BoA Files Clarification:**
   - Should `2023-25.md` be split into separate year files?
   - Is `22-2025.md` a duplicate of the others or different data?

4. **Missing Data:**
   - Do you have employment contract with Boys & Girls Club?
   - Do you have Bank of America account agreement?
   - Do you have W-2s from Inter Technologies (2022-2024)?

---

## Deliverables

I will create:

1. **Migration PowerShell Script** with:
   - Preview mode (shows what will happen)
   - Execute mode (performs the migration)
   - Rollback capability

2. **Master Account Register Template** (.xlsx) with:
   - All required columns from Freeway Mechanics
   - Sample rows for your current accounts
   - Formulas for totals

3. **Trust Minutes Template** documenting:
   - Account inventory completion
   - Trustee acknowledgment of records
   - EIN issuance (if applicable)
   - Banking authorizations

4. **README.md** for `06-Account-Register/` explaining:
   - How to maintain the register
   - When to update it
   - How to add new accounts

---

## Next Steps

**Please provide:**
1. Bank of America account last 4 digits
2. Boys & Girls Club EIN (from paystub or W-2)
3. Clarification on the BoA file dates/coverage
4. Any other account details you want in the Master Register

Then I'll generate the complete migration package!

---

*Created by: Vault Renovation Specialist*
*Standard: Freeway Mechanics Workbook Methodology*
*Date: 2026-01-18*
