# Desktop Tax Files Analysis & Migration Plan
**Source:** `C:\Users\rhyme\Desktop\FileCabinet\Taxes`  
**Destination:** `Legal Document Generator\Digital File Cabinet\Financials\Trust-Records`  
**Date:** 2026-01-18

---

## 📊 WHAT YOU HAVE (Summary)

### **Clint's Tax Documents:**
| Category | Years | Count | Notes |
|----------|-------|-------|-------|
| **Tax Years Covered** | 2015-2025 | 11 years | Complete decade+ |
| **W-2 Forms** | 2016-2024 | 9+ files | Multiple per year |
| **IRS Transcripts** | 2016-2024 | 9+ files | W-2, Refund, Wage & Earnings |
| **Bank Statements (BoA)** | 2022-2025 | 48 monthly | Complete! |
| **Fidelity 1099s** | 2022-2024 | 6 files | Investment income |
| **Fidelity 5498s** | 2020-2024 | 5+ files | IRA contributions |
| **Fidelity Statements** | 2021-2025 | 20+ files | Monthly/quarterly |
| **1095-C Health** | 2023-2025 | 3 files | Employer health coverage |
| **Pay Stubs** | 2023-2024 | 3 zip files | Need extraction |
| **Tax Returns** | 2023-2024 | 3 files | Federal & NC State |
| **SSA Documents** | Current | 2 files | Benefit verification, statement |

### **Syrina's Tax Documents:**
| Category | Years | Count | Notes |
|----------|-------|-------|-------|
| **Tax Years Covered** | 2020-2025 | 6 years | |
| **W-2 Forms** | 2020-2024 | 5 files | Multiple employers |
| **Pay Stubs (2025)** | Current | 26 files | Full year |
| **Tax Returns** | 2023-2024 | 2 files | |
| **Fidelity IRA** | 2022-2023 | 2 files | 5498 forms |

### **Total File Count:**
- **Clint:** ~140+ files
- **Syrina:** ~35+ files
- **Grand Total:** ~175+ tax/financial documents

---

## 🗂️ PROPOSED MIGRATION STRUCTURE

### **Integration with Existing Trust-Records:**

```
Trust-Records/
├── Accounts/
│   ├── BoysGirlsClub_Wayne/ (already exists)
│   ├── BankOfAmerica_0672/ (already exists - ADD MONTHLY STATEMENTS HERE)
│   ├── InterTechnologies_7965/ (already exists - ADD PAY STUBS & W-2S HERE)
│   ├── Fidelity_Investments_7819/  ← NEW
│   │   ├── Tax-Forms/
│   │   │   ├── 1099-Forms/
│   │   │   │   ├── 2022_Tax_Fidelity_1099-Consolidated.pdf
│   │   │   │   ├── 2023_Tax_Fidelity_1099-Consolidated.pdf
│   │   │   │   └── 2024_Tax_Fidelity_1099-Consolidated.pdf
│   │   │   └── 5498-Forms/
│   │   │       ├── 2020_Tax_Fidelity_5498_ROTH-IRA.pdf
│   │   │       ├── 2021_Tax_Fidelity_5498_ROTH-IRA.pdf
│   │   │       ├── 2022_Tax_Fidelity_5498_ROTH-IRA.pdf
│   │   │       ├── 2023_Tax_Fidelity_5498_ROTH-IRA.pdf
│   │   │       └── 2024_Tax_Fidelity_5498_ROTH-IRA.pdf
│   │   ├── Statements/
│   │   │   ├── Monthly/
│   │   │   └── Year-End/
│   │   ├── Trade-Confirmations/
│   │   └── Account-Documents/
│   │
│   └── KinstonArts_Council/  ← NEW (Syrina's employer)
│       ├── Paychecks/
│       │   └── 2025/ (26 pay stubs)
│       ├── W2-Forms/
│       │   ├── 2020_Tax_KinstonArts_W2.pdf
│       │   ├── 2021_Tax_KinstonArts_W2.pdf
│       │   ├── 2023_Tax_KinstonArts_W2.pdf
│       │   └── 2024_Tax_KinstonArts_W2.pdf
│       └── Health-Insurance/
│
└── Government-Records/
    ├── SSA-Earnings/ (already exists - ADD SSA DOCS HERE)
    ├── Tax-Returns/  ← POPULATE THIS
    │   ├── Federal/
    │   │   ├── 2016/ (transcript only)
    │   │   ├── 2017/ (transcript only)
    │   │   ├── 2018/ (transcript only)
    │   │   ├── 2019/ (transcript only)
    │   │   ├── 2020/ (transcript only)
    │   │   ├── 2021/ (transcript only)
    │   │   ├── 2022/ (transcript only)
    │   │   ├── 2023/
    │   │   │   ├── 2023_Federal_1040_Return.pdf
    │   │   │   ├── 2023_IRS_Refund_Transcript.pdf
    │   │   │   └── 2023_IRS_Wage_Earnings_Transcript.pdf
    │   │   └── 2024/
    │   │       ├── 2024_Federal_1040_Return.pdf
    │   │       ├── 2024_IRS_Refund_Transcript.pdf
    │   │       └── 2024_IRS_Account_Transcript.pdf
    │   │
    │   └── State-NC/
    │       └── 2024/
    │           └── 2024_NC_State_Return.pdf
    │
    └── IRS-Documents/
        ├── Compliance-Reports/
        └── Correspondence/
```

---

## 📋 FILE RENAMING PLAN

### **Current Naming → Freeway Mechanics Standard**

#### **W-2 Forms:**
```
Clinton_Wimberly_2023_W2.pdf
  → 2023_Tax_InterTech_W2.pdf

Clinton_Wimberly_2024_W2.pdf
  → 2024_Tax_InterTech_W2.pdf

W2_SWimberly_KinstonArts2023.pdf
  → 2023_Tax_KinstonArts_W2_Syrina.pdf
```

#### **Bank Statements:**
```
eStmt_2022-01-25.pdf
  → 202201_BankOfAmerica_0672_Statement.pdf

eStmt_2025-11-21.pdf
  → 202511_BankOfAmerica_0672_Statement.pdf
```

#### **Fidelity 1099s:**
```
2024-Individual-TOD-7819-Consolidated-Form-1099.pdf
  → 2024_Tax_Fidelity_7819_1099-Consolidated.pdf
```

#### **Pay Stubs (Syrina 2025):**
```
1-2-25.pdf
  → 20250102_KinstonArts_PayStub_Syrina.pdf

12-18-25.pdf
  → 20251218_KinstonArts_PayStub_Syrina.pdf
```

#### **Tax Returns:**
```
2024_FEDERAL_RETURN_2025-12-20_022034.pdf
  → 2024_Federal_1040_Return.pdf

2024_NC_RETURN_2025-12-20_022304.pdf
  → 2024_NC_State_Return.pdf
```

---

## 🚨 KEY DECISIONS NEEDED

### **1. Syrina's Documents - Joint or Separate?**

**Option A: Joint Trust (Recommended if married/partnered)**
```
Trust-Records/
├── Accounts/
│   ├── KinstonArts_Council/ (Syrina's employer)
│   ├── InterTechnologies_7965/ (Clint's employer)
```
Files named with person identifier: `_Syrina` or `_Clint`

**Option B: Separate Tracking**
```
Trust-Records/
├── Clint/
│   └── Accounts/...
└── Syrina/
    └── Accounts/...
```

### **2. Pay Stub Zip Files - Extract or Keep?**

**Current:**
- `2023Clinton Wimberly_paystubs.zip` (1.7 MB)
- `2024Clinton Wimberly_paystubs.zip` (1.7 MB)

**Options:**
- Extract all individual pay stubs (probably 26 files per year)
- Keep as zip files in Archive folder
- Both (extract + keep zip)

### **3. Fidelity Account - Need Last 4 Digits**

Current folder name: `Fidelity_Investments_7819`

**Is 7819 the account number or something else?**
Need last 4 of actual account for proper naming

### **4. Priority - What to Migrate First?**

**Option A: Everything at once** (comprehensive, takes time)  
**Option B: By priority:**
1. Current year tax docs (2024-2025) - MOST IMPORTANT
2. Bank statements (all years)
3. Historical tax docs (2015-2023)
4. Investment docs

---

## 🛠️ MIGRATION SCRIPT CAPABILITIES

I can create a PowerShell script that will:

✅ **Scan & Catalog** - List all files with proposed new names  
✅ **Backup** - Create complete backup before moving anything  
✅ **Extract Zips** - Unzip pay stub archives  
✅ **Rename** - Apply Freeway Mechanics naming conventions  
✅ **Organize** - Move to proper Trust-Records folders  
✅ **Verify** - Check all files moved correctly  
✅ **Report** - Generate migration summary  
✅ **Preview Mode** - Show what will happen before executing

---

## 📊 ESTIMATED SCOPE

**Time to Migrate:** 5-10 minutes (automated)  
**Manual Review Time:** 30-60 minutes (verify accuracy)  
**Files to Process:** ~175+ documents  
**New Folders Created:** ~30+  
**Files Renamed:** 100%  

---

## ⚠️ IMPORTANT NOTES

### **BoA Statements Discovery:**
You have **48 complete monthly statements** (2022-2025) on your Desktop!

These should REPLACE/SUPPLEMENT the summary files we just migrated:
- Current: `2022_BankOfAmerica_0672_Deposits.md` (summary)
- Add: 12 monthly PDFs for 2022

The monthly statements are the SOURCE DOCUMENTS you need for trust accounting!

### **Duplicate Detection:**
Some files appear in multiple locations:
- Fidelity 1099s (root folder + year subfolders)
- Tax returns (multiple copies)

Script will identify duplicates and consolidate.

---

## 🎯 NEXT STEPS

**Please provide:**

1. **Syrina's relationship to trust?**
   - Spouse/partner (joint filing)?
   - Separate individual?
   - Beneficiary?

2. **Fidelity account - confirm last 4 digits**
   - For proper folder naming

3. **Pay stub preference:**
   - Extract zip files? (Yes/No)
   - Keep originals? (Yes/No)

4. **Migration priority:**
   - Everything at once?
   - Current year first?

Then I'll create the comprehensive migration script!

---

*This represents 11 years of financial records ready for proper trust accounting organization!*
