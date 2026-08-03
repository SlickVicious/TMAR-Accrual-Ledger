# TMAR Dropdown Values - Complete Guide

**Last Updated:** 2026-02-28
**Status:** ✅ Deployed to Apps Script

---

## Quick Start

### Step 1: Populate Dropdown Values

1. Open your TMAR Google Sheet
2. Refresh the page (Ctrl+R / Cmd+R)
3. Click **TMAR Tools → Setup & Administration → Populate Dropdown Values**
4. Click OK when prompted
5. You'll see a confirmation showing how many values were added

### Step 2: Apply to Columns

1. Click **TMAR Tools → Formatting → Refresh Data Validation**
2. All dropdowns will now show the comprehensive values

---

## What Was Added

### 🏦 Account Types (89 values)

**Banking:**
- Bank Account - Checking
- Bank Account - Savings
- Bank Account - Money Market
- Bank Account - CD
- Bank Account - Business Checking/Savings

**Credit:**
- Credit Card - Personal/Business/Secured/Store
- Line of Credit
- HELOC

**Loans:**
- Mortgage - Primary/Investment
- Auto Loan
- Student Loan - Federal/Private
- Personal/Business/Payday Loans

**Investments:**
- Brokerage (Individual/Joint)
- IRA (Traditional/Roth)
- 401(k)/403(b)/SEP/Simple
- HSA/529 Plan
- Crypto Exchange
- Real Estate

**Insurance:**
- Life/Health/Auto/Home
- Disability/Umbrella

**Utilities & Services:**
- Electric/Gas/Water
- Internet/Phone/Cable
- Trash

**Government & Collections:**
- Tax Authorities (IRS/State/Local)
- Court Judgments
- Social Security/Medicare/Medicaid
- Collection/Charge-off accounts

**Other:**
- PayPal/Venmo/Cash App
- Cryptocurrency Wallet
- Subscriptions/Memberships
- Retail Financing/BNPL
- Storage Units

---

### 📊 Status Values (22 values)

- Active
- Closed (+ variants: Paid Off, Transferred, Refinanced)
- Pending (+ variants: Opening, Closing)
- Dormant
- Frozen
- Disputed
- In Collections
- Charged Off
- Bankruptcy (Chapter 7/13)
- Settled
- Foreclosed
- Repossessed
- Under Review
- Inactive/Suspended/Cancelled

---

### 📝 Filing Statuses (15 values)

- Not Started
- Draft
- In Progress
- Ready to File
- Filed/Submitted
- Accepted/Rejected
- Complete
- Pending Review
- Amended
- Under Audit
- On Hold/Cancelled
- Not Applicable

---

### 👥 Users (6 values)

- Clint
- Syrina
- Joint
- Trust
- Business
- Other

---

### 📂 FWM Binder Tabs (12 values)

- Tab 1 - Trust Document
- Tab 2 - EIN Letter
- Tab 3 - Form 56
- Tab 4 - Power of Attorney
- Tab 5 - Account Claims
- Tab 6 - 1099-A Forms
- Tab 7 - 1099-B Forms
- Tab 8 - Correspondence
- Tab 9 - Asset Valuations
- Tab 10 - Tax Returns
- Tab 11 - Supporting Docs
- Not Assigned

---

### 📅 Billing Frequency (14 values)

- Daily
- Weekly/Bi-Weekly
- Semi-Monthly/Monthly/Bi-Monthly
- Quarterly/Semi-Annually/Annually
- One-Time
- Variable/As Incurred/On Demand
- None

---

### 💰 Transaction Categories (95+ values)

**Income Categories:**
- W-2 Wages
- 1099-MISC/NEC/INT/DIV/B
- Rental/Business
- Social Security/Pension
- Unemployment/Tax Refund
- Gifts/Inheritance

**Expense Categories:**
- Housing (Rent, Mortgage, HOA, Property Tax, Insurance, Maintenance)
- Utilities (Electric, Gas, Water, Internet, Phone, Cable, Trash)
- Transportation (Car Payment, Insurance, Gas, Maintenance, Transit, Parking)
- Food (Groceries, Dining, Fast Food)
- Healthcare (Insurance, Medical, Dental, Vision, Pharmacy, Mental Health)
- Personal (Childcare, Education, Loans, Clothing, Pet Care, Life Insurance)
- Entertainment (Hobbies, Gym, Travel, Subscriptions)
- Financial (Bank Fees, Interest, Investment Fees, Tax Prep, Legal, Accounting)
- Business (Supplies, Software, Professional Dev, Travel, Marketing)

**Transfers:**
- Savings/Investment
- Loan Payments
- Credit Card Payments
- Between Accounts

**Other:**
- Charitable Donations
- Gifts
- Adjustments/Fees/Refunds/Reimbursements

---

### 🔍 Discovery Status (15 values)

- Known
- Discovered (Credit Report, Statement, IRS Transcript, Mail, Online)
- Verified (Documents, Called Provider)
- Claimed (Form 56 Filed, In Progress)
- Abandoned (No Response, Unable to Claim)
- Closed Before Death
- Not Applicable
- Under Investigation

---

## Where Dropdowns Are Used

| Sheet | Column | Dropdown Type |
|-------|--------|---------------|
| **Master Register** | G (Account Type) | Account Types |
| | K (Status) | Statuses |
| | R (Billing Frequency) | Billing Frequency |
| | T (Primary User) | Users |
| | AI (Discovery Status) | Discovery Status |
| **1099 Filing Chain** | F, I, L, N (Status) | Filing Statuses |
| **Forms & Authority** | H (FWM Binder Tab) | Binder Tabs |
| | I (Status) | Filing Statuses |
| **Document Inventory** | H (FWM Binder Tab) | Binder Tabs |
| | M (Status) | Filing Statuses |
| **Trust Ledger** | F (FWM Binder Tab) | Binder Tabs |
| | G (Filing Status) | Filing Statuses |
| **Proof of Mailing** | L (FWM Binder Tab) | Binder Tabs |
| **Transaction Ledger** | C (Category) | Transaction Categories |
| **CPA Questions** | C (Category) | CPA Categories |
| | G (Priority) | Priority Levels |
| | H (Status) | CPA Statuses |

---

## Troubleshooting

### Dropdowns still show errors

1. Run **TMAR Tools → Setup & Administration → Populate Dropdown Values** first
2. Then run **TMAR Tools → Formatting → Refresh Data Validation**
3. Hard refresh the sheet (Ctrl+Shift+R / Cmd+Shift+R)

### Can't see _Validation sheet

- It's intentionally hidden
- To view: Right-click any sheet tab → Show hidden sheets → _Validation

### Want to add custom values

1. Unhide _Validation sheet
2. Add values to the appropriate column
3. Run **Refresh Data Validation** to apply

### Values aren't showing in dropdown

- Check that you refreshed the page after running Populate
- Verify the _Validation sheet was created (check hidden sheets)
- Re-run the Populate function

---

## Value Counts

| Category | Count |
|----------|-------|
| Account Types | 89 |
| Statuses | 22 |
| Filing Statuses | 15 |
| Users | 6 |
| Binder Tabs | 12 |
| Billing Frequencies | 14 |
| Transaction Categories | 95+ |
| Discovery Statuses | 15 |
| **TOTAL** | **268+** |

---

## Menu Location

```
TMAR Tools
└── Setup & Administration
    ├── Populate Dropdown Values  ← Run this first
    ├── ──────────────
    ├── Refresh Dashboard Formulas
    ├── Add Sample Data
    ├── ──────────────
    └── Export Current Tab to PDF

AND THEN:

TMAR Tools
└── Formatting
    └── Refresh Data Validation  ← Run this second
```

---

## Next Steps

1. ✅ Run **Populate Dropdown Values**
2. ✅ Run **Refresh Data Validation**
3. ✅ Test dropdowns in Master Register
4. ✅ All dropdown errors should be resolved!

---

**Generated with Claude Code**
