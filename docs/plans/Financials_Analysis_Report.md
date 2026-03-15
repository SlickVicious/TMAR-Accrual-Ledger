# Financials Directory Analysis & Reorganization Plan
**Date:** 2026-01-18
**Location:** `Digital File Cabinet/Financials/`

---

## Current Structure Analysis

### What You Have Now:

```
Financials/
├── B&G/                           # Boys & Girls Club paychecks (2025)
│   ├── Boys & Girls Club 1 25 - 12 25.md
│   └── Boys & Girls Club 1 25 - 12 25.md.docx
├── BoA Annual Deposits/           # Bank deposit summaries by year
│   ├── 2022.md
│   ├── 2023-25.md
│   ├── 22-2025.md
│   └── Deposits 6-24 to 12 -25.md
└── SSA Earnings Record/           # Social Security lifetime earnings
    └── Earnings Summary.md
```

### File Content Types:

| Directory | Content | Time Period | Purpose |
|-----------|---------|-------------|---------|
| **B&G** | Paycheck tracking table | Jan-Dec 2025 | Current employer income tracking |
| **BoA Annual Deposits** | Bank deposit lists | 2022-2025 | Historical bank records |
| **SSA Earnings Record** | SSA earnings summary | 1991-2025 | Official government earnings record |

---

## Issues Identified

### 1. Naming Inconsistencies
- BoA files use multiple naming schemes: `2022.md`, `2023-25.md`, `22-2025.md`, `Deposits 6-24 to 12 -25.md`
- Unclear what each file covers without opening it

### 2. Duplicate Formats
- Every .md file has a .docx duplicate (why?)
- Unclear which is the "source of truth"

### 3. Mixed Organization Schemes
- B&G is organized by EMPLOYER
- BoA is organized by YEAR
- SSA is a single summary file
- No consistent approach

### 4. Unclear File Purposes
- Are BoA files summaries or detailed records?
- How do they relate to B&G paycheck tracking?
- Is this for tax purposes, budgeting, or record-keeping?

---

## Recommended Organization Structure

### Option A: By Year (Tax-Focused)
```
Financials/
├── _Income_Summary.md              # Master summary linking to all years
├── 2022/
│   ├── Employers/
│   │   └── Inter_Technologies.md  # Paycheck tracking
│   ├── Bank_Deposits.md            # Bank records
│   └── Tax_Summary.md              # Year-end totals
├── 2023/
│   ├── Employers/
│   │   └── Inter_Technologies.md
│   ├── Bank_Deposits.md
│   └── Tax_Summary.md
├── 2024/
│   ├── Employers/
│   │   └── Inter_Technologies.md
│   │   └── Boys_Girls_Club.md     # If you had multiple employers
│   ├── Bank_Deposits.md
│   └── Tax_Summary.md
├── 2025/
│   ├── Employers/
│   │   └── Boys_Girls_Club.md     # Current
│   ├── Bank_Deposits.md
│   └── Tax_Summary.md (in progress)
└── SSA_Records/
    └── Lifetime_Earnings_Summary.md
```

### Option B: By Source (Current Structure Enhanced)
```
Financials/
├── _Financial_Dashboard.md         # Overview with totals
├── Employment_Records/
│   ├── Inter_Technologies/
│   │   ├── 2022_Paychecks.md
│   │   ├── 2023_Paychecks.md
│   │   └── 2024_Paychecks.md
│   └── Boys_Girls_Club/
│       └── 2025_Paychecks.md
├── Bank_Records/
│   ├── BoA_Deposits_2022.md
│   ├── BoA_Deposits_2023.md
│   ├── BoA_Deposits_2024.md
│   └── BoA_Deposits_2025.md
└── Government_Records/
    └── SSA_Lifetime_Earnings.md
```

### Option C: By Purpose (Function-Based)
```
Financials/
├── Income_Tracking/                # Active tracking
│   ├── Current_Employer.md         # Boys & Girls Club 2025
│   └── Previous_Employers/
│       └── Inter_Technologies_2022-2024.md
├── Tax_Records/                    # For tax filing
│   ├── 2022_Tax_Year.md
│   ├── 2023_Tax_Year.md
│   ├── 2024_Tax_Year.md
│   └── 2025_Tax_Year.md (in progress)
├── Bank_Statements/                # Bank records
│   └── BoA_Deposit_History.md      # All years
└── Official_Records/               # Government documents
    └── SSA_Earnings_Summary.md
```

---

## Recommendations

### Immediate Actions:

1. **Decide on .md vs .docx**
   - Keep .md files (better for Obsidian, version control, linking)
   - Delete or archive .docx files
   - Or: Keep .docx in a separate "Exports" folder

2. **Standardize BoA file names**
   - Rename to: `BoA_Deposits_YYYY.md`
   - Current files become:
     - `2022.md` → `BoA_Deposits_2022.md`
     - `2023-25.md` → DELETE (overlapping/redundant?)
     - `22-2025.md` → `BoA_Deposits_2022-2025_Combined.md`?
     - `Deposits 6-24 to 12-25.md` → `BoA_Deposits_2024-2025_Jun-Dec.md`

3. **Create Index/Dashboard**
   - Create `_Financial_Dashboard.md` with:
     - Links to all financial records
     - Year-over-year income comparison
     - Quick stats (total earnings, average deposits, etc.)

4. **Establish Naming Convention**
   - Format: `[Source]_[Type]_[Year/Period].md`
   - Examples:
     - `BGC_Paychecks_2025.md`
     - `InterTech_Paychecks_2022.md`
     - `BoA_Deposits_2024.md`
     - `SSA_Earnings_Lifetime.md`

---

## Questions for You

Before I create a reorganization script, please decide:

1. **Which organizational structure do you prefer?**
   - Option A (By Year)
   - Option B (By Source)
   - Option C (By Purpose)

2. **What's your main use case?**
   - Tax preparation?
   - Budget tracking?
   - Long-term financial analysis?
   - Employment history verification?

3. **Do you want to keep .docx files?**
   - Yes, move to separate folder
   - No, delete them
   - Only keep most recent

4. **What should happen to BoA duplicate/overlapping files?**
   - Consolidate into single files per year?
   - Keep separate if they track different things?
   - Need to review contents first?

---

## Next Steps

Once you decide on the above, I will create:

1. **Reorganization PowerShell script** with preview mode
2. **Financial Dashboard template** with Dataview queries
3. **Standardized file templates** for future tracking
4. **Documentation** on how to maintain the new structure

---

*Generated by: Vault Renovation Specialist*
*Project: LDG Financials Directory Cleanup*
