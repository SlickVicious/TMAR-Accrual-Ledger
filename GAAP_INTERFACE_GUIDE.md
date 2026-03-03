# TMAR Universal Accrual Ledger - User Guide

**Version:** 1.1.0
**Last Updated:** 2026-03-03
**Status:** ✅ Deployed and Ready

---

## 🎯 Overview

The **TMAR Universal Accrual Ledger** is a comprehensive GAAP-compliant accounting interface that provides:

- 📊 **Dashboard** - Real-time financial overview with 6 key metrics
- 📖 **Ledger** - Double-entry bookkeeping system
- 📝 **Journal** - Multi-line journal entries
- 📋 **Chart of Accounts** - GAAP-standard 48-account framework
- 💰 **Receivables** - Accounts receivable aging and tracking
- 💳 **Payables** - Accounts payable management
- 🏢 **Consolidation** - Multi-entity consolidation per IRC §1502
- 📄 **Tax Forms** - Form 1041, 1040, Schedule C
- 📉 **Depreciation** - Asset depreciation tracking
- 🏦 **Reconciliation** - Bank reconciliation tools

This interface mirrors professional accounting software while integrating seamlessly with your TMAR Master Register Google Sheet.

---

## 🚀 Quick Start

### Opening the Interface

1. **Open your TMAR Google Sheet:**
   ```
   https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ/
   ```

2. **Refresh the page** (Cmd+Shift+R / Ctrl+Shift+R)

3. **Click:** `TMAR Tools → 📊 Universal Accrual Ledger`

4. **The interface opens in a full-screen dialog!**

---

## 🎨 Interface Design

### Glass-Morphism Theme

The interface features a modern glass-morphism design with:

- **Backdrop blur effects** - 12px blur for depth
- **Semi-transparent cards** - 70% opacity backgrounds
- **Gradient accents** - Purple to pink gradients
- **Smooth animations** - 0.3s transitions
- **Dark/Light theme toggle** - Switch themes instantly

### Color Coding

- **Green (Debits)** - Asset increases, expense entries
- **Red (Credits)** - Liability increases, revenue entries
- **Purple gradients** - Primary actions and headers
- **Status badges** - Active (green), Pending (yellow), Closed (red)

---

## 📊 Tab-by-Tab Guide

### 1. Dashboard Tab

**Purpose:** Real-time financial overview

**Metrics displayed:**
- **Total Assets** - Sum of all asset account balances
- **Total Liabilities** - Sum of all liability account balances
- **Net Worth** - Assets minus Liabilities
- **YTD Income** - Year-to-date revenue
- **YTD Expenses** - Year-to-date expenses
- **Net Income** - Income minus Expenses

**Recent Activity Table:**
- Shows last 10 ledger entries
- Date, Description, Account, Debit, Credit columns
- Real-time updates as entries are added

**How to use:**
1. Click **📊 Dashboard** tab
2. View financial snapshot
3. Scroll down to see recent activity
4. Dashboard auto-updates when you add entries

---

### 2. Ledger Tab

**Purpose:** Single-entry ledger for daily transactions

**Add Entry Form:**
- **Date** (required) - Transaction date
- **Account** (required) - Select from Chart of Accounts dropdown
- **Category** (required) - Transaction category/type
- **Debit** - Debit amount (if applicable)
- **Credit** - Credit amount (if applicable)
- **Description** - Detailed notes

**How to add a ledger entry:**
1. Click **📖 Ledger** tab
2. Fill in the form fields
3. Enter either a Debit OR Credit amount (not both)
4. Click **Add Entry**
5. Entry appears in the table below
6. Form clears for next entry

**Ledger Table:**
- Date | Account | Category | Description | Debit | Credit | Balance
- Running balance calculated automatically
- Color-coded: Green debits, Red credits
- Scrollable with custom purple scrollbar

**Pro tip:** The running balance shows cumulative effect of all entries

---

### 3. Journal Tab

**Purpose:** Multi-line compound journal entries (not yet implemented in v1.0)

**Coming soon:**
- Date and journal entry number
- Multiple debit/credit lines per entry
- Automatic balance verification
- Memo field for entry description

---

### 4. Chart of Accounts Tab

**Purpose:** Manage your account structure

**Load GAAP Defaults:**
Click **Load GAAP Defaults** to populate with 23 standard accounts:

**Assets (1000-1510):**
- 1000: Cash - Operating
- 1010: Cash - Savings
- 1100: Accounts Receivable
- 1200: Inventory
- 1500: Fixed Assets
- 1510: Accumulated Depreciation

**Liabilities (2000-2500):**
- 2000: Accounts Payable
- 2100: Notes Payable
- 2500: Long-term Debt

**Equity (3000-3100):**
- 3000: Owner's Equity
- 3100: Retained Earnings

**Revenue (4000-4200):**
- 4000: Sales Revenue
- 4100: Service Revenue
- 4200: Interest Income

**Expenses (5000-9000):**
- 5000: Cost of Goods Sold
- 6000: Salaries & Wages
- 6100: Rent Expense
- 6200: Utilities
- 6300: Office Supplies
- 6400: Professional Fees
- 6500: Depreciation Expense
- 6600: Interest Expense
- 9000: Income Tax Expense

**Integration with Google Sheets:**
When you open the interface, it automatically loads accounts from your Master Register sheet and maps them to the chart.

**Account table columns:**
- Account # (e.g., MR-001 or 1000)
- Account Name
- Type (Asset, Liability, Equity, Revenue, Expense)
- Balance (current)
- Status badge (Active/Closed)

---

### 5. Receivables Tab

**Purpose:** Track customer invoices and aging

**Coming in future version:**
- Invoice list with due dates
- Aging buckets: 0-30, 31-60, 61-90, 90+ days
- Payment tracking
- Customer balance summary

---

### 6. Payables Tab

**Purpose:** Track vendor bills and payment obligations

**Coming in future version:**
- Bill entry form
- Payment due dates
- Vendor management
- Payment history

---

### 7. Consolidation Tab

**Purpose:** Multi-entity financial consolidation per IRC §1502

**How to use:**
1. Click **🏢 Consolidation** tab
2. Select entities to consolidate (checkboxes)
3. Click **Generate Report**
4. View trial balance for each entity
5. See eliminations column (intercompany transactions)
6. Final consolidated total displayed

**Use case:** If you manage multiple trusts, LLCs, or entities, this combines their financials into a single consolidated view.

---

### 8. Tax - Form 1041 Tab

**Purpose:** Trust/Estate Income Tax Return (IRS Form 1041)

**Form fields:**

**Header section:**
- Tax Year (default: 2024)
- EIN (Employer Identification Number)
- Trust/Estate Name
- Date Created

**Income section:**
- Interest Income
- Dividend Income
- Capital Gains
- Rental Income
- Other Income

**Deductions section:**
- Trustee Fees
- Attorney Fees
- Accounting Fees
- Other Deductions

**How to calculate:**
1. Fill in all income amounts
2. Fill in all deduction amounts
3. Click **Calculate Tax**
4. View results in the calculation card below:
   - Total Income
   - Total Deductions
   - Taxable Income
   - Tax Owed

**2024 Trust/Estate Tax Brackets:**
- 10% on income up to $3,100
- 24% on income $3,101 - $11,150
- 35% on income $11,151 - $15,200
- 37% on income over $15,200

**Export:** Click **Export PDF** to generate a PDF copy (future version)

**Storage:** Calculation results are saved to localStorage automatically

---

### 9. Tax - Form 1040 Tab

**Purpose:** Individual Income Tax Return (IRS Form 1040)

**Coming in future version:**
- Filing status selection (Single, MFJ, MFS, HOH)
- W-2 wage income
- 1099 income (INT, DIV, MISC)
- Standard/itemized deductions
- 2024 individual tax brackets
- Estimated tax calculator

---

### 10. Tax - Schedule C Tab

**Purpose:** Sole Proprietor Profit/Loss (Schedule C)

**Coming in future version:**
- Business income entry
- Cost of goods sold
- Business expense categories
- Home office deduction (simplified & regular methods)
- Vehicle expense tracking
- Self-employment tax calculation (15.3%)

---

### 11. Depreciation Tab

**Purpose:** Fixed asset depreciation tracking

**Coming in future version:**
- Asset list with purchase dates
- Depreciation methods: Straight-Line, MACRS
- Accumulated depreciation tracking
- Book value calculations
- Section 179 election tracking

---

### 12. Reconciliation Tab

**Purpose:** Bank reconciliation tools

**Coming in future version:**
- Beginning balance entry
- Outstanding checks list
- Outstanding deposits list
- Ending balance calculation
- Reconciliation difference resolution

---

### 13-17. RedressRight Source Libraries (Group 9)

Five reference tools integrated from `redressright.me` as dedicated tabs:

| # | Tab | Purpose | Key Features |
|---|---|---|---|
| 13 | ⚖️ Constitutional Challenges (CPSA) | Generate constitutional challenge documents | 12 templates, rich text editor, save/load drafts, PDF/Word export |
| 14 | 💰 Tax Refund Calculator (TRCF) | Calculate tax refunds via two routes | 7 sub-tabs, Route 1/Route 2 calculators, 2024 brackets, interest calculator |
| 15 | 📊 NOL Classification (CCSN) | Net Operating Loss asset classification | 72-slide presentation, prev/next navigation, table of contents |
| 16 | 🏛️ Federal Damages (FDRF) | Federal damages framework reference | 4-part accordion layout, text-to-speech read-aloud |
| 17 | 📓 Tutorial Journal (EEEJ) | Educational tutorial journal | 28 slides, topic navigation, progress tracking |

**How to access:** Click any tab in the "RedressRight Source Libraries" group at the right end of the tab bar.

---

## 🔧 Header Actions

### Theme Toggle (🌓)

**Click to switch between:**
- **Dark theme** - Dark blue/black background, light text
- **Light theme** - White/light gray background, dark text

**Preference saved:** Your theme choice persists in localStorage

### Save Indicator (✓)

- Appears briefly when data is saved
- Green checkmark with "Saved" text
- Auto-save runs every 5 seconds

### Sync Button (💾)

**Click to:**
- Sync ledger entries to Google Sheets Transaction Ledger
- Push data from interface to Master Register
- Bi-directional sync (coming soon)

### Export Button (📥)

**Click to open export modal with 4 format options:**

1. **JSON (Full Data)**
   - Complete export of all interface data
   - Includes ledger, accounts, journal, filings
   - Use for backups or data migration

2. **CSV (Ledger)**
   - Ledger entries only
   - Columns: Date, Account, Category, Description, Debit, Credit
   - Opens in Excel/Google Sheets

3. **PDF (Reports)**
   - Formatted reports (future version)
   - Tax forms, financial statements

4. **Excel (All Sheets)**
   - Multi-sheet workbook (future version)
   - Separate tabs for each module

**Export process:**
1. Click **📥 Export**
2. Select format from dropdown
3. Click **Download**
4. File downloads to your computer

---

## 💾 Data Persistence

### Auto-Save (Every 5 seconds)

All data is automatically saved to browser **localStorage**:
- Ledger entries
- Chart of accounts
- Journal entries
- Tax form data
- Receivables/payables
- Last saved timestamp

**Storage key:** `tmarGAAPData`

**Maximum size:** ~5-10MB per browser domain

### Google Sheets Sync

**Automatic integration:**
- On interface load, accounts are pulled from Master Register
- Account dropdown populated from Master Register
- Click **💾 Sync** to push ledger entries to Transaction Ledger sheet

**Data flow:**
```
Google Sheets Master Register
         ↓
   (on interface load)
         ↓
Chart of Accounts in Interface
         ↓
Account Dropdown (Ledger tab)
         ↓
User adds ledger entries
         ↓
   (click Sync button)
         ↓
Transaction Ledger Sheet
```

---

## 🎯 Common Workflows

### Workflow 1: Daily Expense Entry

1. Open **📊 Universal Accrual Ledger**
2. Click **📖 Ledger** tab
3. Select today's date (auto-filled)
4. Choose account from dropdown (e.g., "MR-042 - Chase Checking")
5. Enter category (e.g., "Office Supplies")
6. Enter credit amount: `$85.50`
7. Add description: "Staples - printer paper and pens"
8. Click **Add Entry**
9. View running balance update
10. Click **💾 Sync** to save to Google Sheets

### Workflow 2: Monthly Tax Prep

1. Open **📊 Universal Accrual Ledger**
2. Click **📄 Form 1041** tab
3. Enter trust information:
   - Year: 2024
   - EIN: XX-XXXXXXX
   - Name: Wimberly Family Trust
4. Enter income from statements:
   - Interest: $1,250.00 (from bank statements)
   - Dividends: $3,400.00 (from 1099-DIV)
5. Enter deductions:
   - Trustee Fees: $500.00
   - Attorney Fees: $1,200.00
   - Accounting Fees: $800.00
6. Click **Calculate Tax**
7. Review results:
   - Total Income: $4,650.00
   - Total Deductions: $2,500.00
   - Taxable Income: $2,150.00
   - Tax Owed: $215.00 (10% bracket)
8. Export results for CPA (future)

### Workflow 3: Setting Up Chart of Accounts

**First-time setup:**

1. Open **📊 Universal Accrual Ledger**
2. Click **📋 Chart of Accounts** tab
3. Click **Load GAAP Defaults** button
4. Review 23 standard accounts populated
5. Accounts are saved to localStorage
6. Return to **📖 Ledger** tab
7. Account dropdown now shows all GAAP accounts

**Subsequent uses:**
- Accounts persist across sessions
- No need to reload unless you clear browser data

### Workflow 4: Financial Review

1. Open **📊 Universal Accrual Ledger**
2. View **📊 Dashboard** metrics:
   - Assets: $150,000
   - Liabilities: $50,000
   - Net Worth: $100,000
3. Review recent activity table
4. Click **📖 Ledger** tab to see full transaction history
5. Click **📋 Chart of Accounts** to see balances by account
6. Export data for records: Click **📥 Export → JSON**

---

## ⚙️ Advanced Features

### LocalStorage Data Structure

```javascript
{
  ledgerEntries: [
    {
      date: '2024-02-28',
      account: 'MR-042',
      category: 'Office Supplies',
      description: 'Staples purchase',
      debit: 0,
      credit: 85.50
    },
    // ... more entries
  ],
  chartOfAccounts: [
    {
      number: '1000',
      name: 'Cash - Operating',
      type: 'Asset',
      balance: 25000,
      status: 'Active'
    },
    // ... more accounts
  ],
  filings: {
    form1041: {
      year: 2024,
      totalIncome: 4650,
      totalDeductions: 2500,
      taxableIncome: 2150,
      taxOwed: 215,
      timestamp: '2024-02-28T15:30:00Z'
    }
  },
  lastSaved: '2024-02-28T15:35:42Z'
}
```

### Manual Save

While auto-save runs every 5 seconds, you can also:
- Click **💾 Sync** to save immediately
- Data persists in localStorage
- Export to JSON for external backup

### Data Recovery

**If you lose data:**
1. Check localStorage in browser DevTools (F12)
2. Application → Local Storage → find `tmarGAAPData` key
3. Copy JSON value
4. Import via JSON upload (future feature)

**If interface won't load:**
1. Clear browser cache/localStorage
2. Reload interface
3. Click **Load GAAP Defaults** to reset chart
4. Re-import data from JSON backup

---

## 🔐 Security & Privacy

### Data Storage

- **Browser localStorage only** - Data stays on your computer
- **No external servers** - No data leaves your Google account
- **Google Sheets integration** - Data syncs to your private spreadsheet
- **No third-party access** - Only you can access via authorized Google account

### Authorization

- Requires Google Sheets authorization on first use
- Apps Script authorization prompt: Review permissions → Allow
- Only accesses TMAR spreadsheet, no other files

### Best Practices

1. **Regular backups** - Export JSON weekly
2. **Sync frequently** - Click Sync button after important entries
3. **Private browsing caution** - localStorage clears when you close browser
4. **Multi-device note** - Data is per-browser, not synced across devices (until Google Sheets sync)

---

## 🐛 Troubleshooting

### Interface Won't Open

**Issue:** Clicking "📊 Universal Accrual Ledger" does nothing

**Solution:**
1. Refresh Google Sheet (Cmd+Shift+R)
2. Wait 5 seconds for scripts to load
3. Try again
4. Check authorization (Extensions → Apps Script → Run onOpen)

### Accounts Not Loading

**Issue:** Chart of Accounts shows "No accounts loaded"

**Solution:**
1. Click **Load GAAP Defaults** button
2. Or sync from Google Sheets (click 💾 Sync)
3. If still empty, check Master Register sheet exists and has data

### Ledger Entries Not Syncing

**Issue:** Clicking Sync doesn't update Google Sheets

**Solution:**
1. Verify Transaction Ledger sheet exists in your spreadsheet
2. Check you have edit permissions
3. Look for errors in browser console (F12 → Console)
4. Re-authorize Apps Script if needed

### Calculator Not Working

**Issue:** Form 1041 Calculate button doesn't show results

**Solution:**
1. Ensure all numeric fields have values (even if $0.00)
2. Check browser console for JavaScript errors
3. Try refreshing the interface
4. Re-enter data and calculate again

### Theme Not Switching

**Issue:** Theme toggle button doesn't change appearance

**Solution:**
1. Check if CSS is loading (F12 → Sources)
2. Clear browser cache
3. Reload interface
4. Try in different browser

### Export Not Downloading

**Issue:** Export button clicks but no file downloads

**Solution:**
1. Check browser's download settings/permissions
2. Disable popup blocker for Google Sheets domain
3. Try different export format
4. Use browser DevTools to check for errors

---

## 📚 Reference

### Account Type Definitions

**Asset:**
- Economic resources owned by the entity
- Expected to provide future benefits
- Examples: Cash, Accounts Receivable, Inventory, Equipment

**Liability:**
- Obligations owed to external parties
- Require future payment or service
- Examples: Accounts Payable, Loans, Mortgages

**Equity:**
- Owner's residual interest (Assets - Liabilities)
- Includes capital contributions and retained earnings
- Examples: Owner's Equity, Retained Earnings

**Revenue:**
- Income from primary business operations
- Increases equity
- Examples: Sales, Service Revenue, Interest Income

**Expense:**
- Costs incurred to generate revenue
- Decreases equity
- Examples: Salaries, Rent, Utilities, Depreciation

### Debit vs. Credit Rules

**Debit increases:**
- Assets
- Expenses

**Credit increases:**
- Liabilities
- Equity
- Revenue

**Debit decreases:**
- Liabilities
- Equity
- Revenue

**Credit decreases:**
- Assets
- Expenses

**The accounting equation:**
```
Assets = Liabilities + Equity
```

**Double-entry rule:**
```
Total Debits = Total Credits (for every transaction)
```

### IRC §1502 Consolidation

**Purpose:** Consolidated returns for affiliated corporations

**Requirements:**
- Common parent owns 80%+ of voting stock
- Common parent owns 80%+ of total value
- All members must consent

**Eliminations:**
- Intercompany sales/purchases
- Intercompany dividends
- Intercompany interest
- Intercompany gains on asset transfers

**Benefits:**
- Single tax return for group
- Loss offset between entities
- Deferred intercompany gains

---

## 🎓 Training Resources

### Video Tutorials (Coming Soon)

1. **Getting Started** (5 min) - Interface tour
2. **Daily Bookkeeping** (10 min) - Ledger entry workflow
3. **Tax Preparation** (15 min) - Form 1041 walkthrough
4. **Advanced Features** (20 min) - Consolidation and reports

### Sample Data

To practice with realistic data:
1. Click **Load GAAP Defaults** in Chart of Accounts
2. Add sample ledger entries:
   - Cash deposit: Debit 1000 (Cash), Credit 4000 (Revenue)
   - Rent payment: Debit 6100 (Rent Expense), Credit 1000 (Cash)
   - Invoice payment received: Debit 1000 (Cash), Credit 1100 (AR)
3. View updated balances in Chart of Accounts
4. Check dashboard metrics

---

## 🔄 Version History

### v1.0.0 (2026-02-28)

**Initial Release:**
- ✅ Dashboard with 6 financial metrics
- ✅ Ledger entry system with running balance
- ✅ Chart of Accounts with 23 GAAP defaults
- ✅ Form 1041 tax calculator with 2024 brackets
- ✅ Dark/Light theme toggle
- ✅ Auto-save to localStorage (5-second interval)
- ✅ Export to JSON and CSV
- ✅ Google Sheets integration (load accounts, sync transactions)
- ✅ Glass-morphism design with backdrop blur
- ✅ Responsive layout (desktop, tablet, mobile)

### v1.1.0 (2026-03-03)

**RedressRight Source Libraries (5 new tabs):**
- ✅ Constitutional Challenges (CPSA) — 12 legal document templates with rich text editor
- ✅ Tax Refund Calculator (TRCF) — Route 1/Route 2 calculators with 2024 brackets
- ✅ NOL Classification (CCSN) — 72-slide asset classification reference
- ✅ Federal Damages (FDRF) — 4-part framework with text-to-speech
- ✅ Tutorial Journal (EEEJ) — 28-slide educational journal with progress tracking

**Bug Fixes:**
- ✅ Fixed Document Creator autosave overwriting in-memory drafts on tab re-entry
- ✅ Fixed duplicate autosave intervals accumulating on tab switches

**Coming Soon (v1.2):**
- Journal entries with multi-line support
- Accounts Receivable aging
- Accounts Payable tracking
- Form 1040 calculator
- Schedule C calculator
- Depreciation tracking
- Bank reconciliation
- PDF export for tax forms
- Excel export (.xlsx)
- Import from CSV/JSON
- Multi-user collaboration

---

## 📞 Support

### Getting Help

**Documentation:**
- `GAAP_INTERFACE_GUIDE.md` - This file
- `GUI_GUIDE.md` - Control Panel guide
- `INTEGRATION_COMPLETE.md` - Technical architecture
- `JAVASCRIPT_SETUP_GUIDE.md` - Developer setup

**In-App Help:**
- Each tab has tooltip hints (hover over field labels)
- Error messages display inline with validation
- Browser console (F12) shows detailed errors

---

## ✅ Quick Reference Checklist

**Before first use:**
- [ ] Google Sheet is open and authorized
- [ ] Page has been refreshed
- [ ] Scripts are authorized (Extensions → Apps Script)
- [ ] Clicked "📊 Universal Accrual Ledger" to open interface

**First-time setup:**
1. [ ] Click **📋 Chart of Accounts** tab
2. [ ] Click **Load GAAP Defaults** button
3. [ ] Review 23 accounts populated
4. [ ] Return to **📊 Dashboard** to verify

**Daily workflow:**
1. [ ] Open interface from TMAR Tools menu
2. [ ] Click **📖 Ledger** tab
3. [ ] Add transactions as they occur
4. [ ] Click **💾 Sync** to save to Google Sheets
5. [ ] Review **📊 Dashboard** for updated metrics

**Monthly workflow:**
1. [ ] Review ledger entries for accuracy
2. [ ] Generate **📄 Form 1041** if applicable
3. [ ] Export data: Click **📥 Export → JSON** for backup
4. [ ] Share exported file with CPA/accountant

---

## 🎉 Summary

The **TMAR Universal Accrual Ledger** provides:

✅ **Professional Accounting** - GAAP-compliant double-entry bookkeeping
✅ **Tax Preparation** - Form 1041 calculator with 2024 brackets
✅ **Real-Time Dashboard** - 6 key financial metrics at a glance
✅ **Seamless Integration** - Syncs with Google Sheets Master Register
✅ **Modern Design** - Glass-morphism UI with dark/light themes
✅ **Data Persistence** - Auto-save + localStorage + Google Sheets backup
✅ **Multi-Format Export** - JSON, CSV, PDF (coming soon)
✅ **Mobile-Friendly** - Responsive layout works on all devices

**Open it now:** `TMAR Tools → 📊 Universal Accrual Ledger`

---

**Interface Status:** ✅ DEPLOYED AND READY
**Generated with Claude Code**
