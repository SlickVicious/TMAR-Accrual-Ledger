# TMAR Control Panel GUI - User Guide

**Version:** 1.0.0
**Last Updated:** 2026-02-28
**Status:** ✅ Deployed and Ready

---

## 🎯 Quick Start

### Opening the Control Panel

1. **Open your TMAR Google Sheet:**
   https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ/

2. **Refresh the page** (Cmd+Shift+R / Ctrl+Shift+R)

3. **Click:** `TMAR Tools → ⚡ Open Control Panel`

4. **The Control Panel opens in a full-screen dialog!**

---

## 🎨 GUI Overview

The TMAR Control Panel features a modern, tabbed interface with 6 main sections:

```
┌─────────────────────────────────────────────────────┐
│        ⚡ TMAR Control Panel                        │
├─────────────────────────────────────────────────────┤
│ 📊 Dashboard | 💼 Accounts | 💳 Transactions |     │
│ 📈 Reports | 🔍 Search | 🛠️ Tools                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│              [Active Panel Content]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Dashboard Tab

**What it shows:**
- Real-time financial summary
- Total Assets
- Total Liabilities
- Net Worth
- Account Count

**Quick Actions:**
- View all stats at a glance
- Click cards to navigate to specific sections
- Refresh data with one click

**How to use:**
1. Click **📊 Dashboard** tab
2. View your financial overview
3. Click **🔄 Refresh Data** to update
4. Click any card to jump to that section

---

## 💼 Accounts Tab

**Features:**
- Add new accounts
- View all accounts in a table
- Filter by status (Active/Closed)
- Group by user (Clint, Syrina, Joint)
- Edit account details

### Add a New Account

1. Click **💼 Accounts** tab
2. Click **➕ Add New Account** button
3. Fill in the form:
   - **Account Name** (required): e.g., "Chase Bank"
   - **Account Type** (required): Select from dropdown
   - **Account Number**: Last 4 digits (e.g., "****1234")
   - **Current Balance**: Dollar amount
   - **Primary User**: Clint, Syrina, Joint, etc.
   - **Status**: Active, Closed, Pending, Dormant
   - **Notes**: Additional information

4. Click **Add Account**
5. Account is added with auto-generated MR-XXX ID
6. View it in the account list below

### View & Filter Accounts

**Quick Filters:**
- **✅ View Active** - Show only active accounts
- **❌ View Closed** - Show only closed accounts
- **👤 By User** - Group accounts by primary user

**Account Table Columns:**
- ID (MR-XXX)
- Name
- Type
- Balance
- Status (color-coded badge)
- User

---

## 💳 Transactions Tab

**Features:**
- Add new transactions
- View transaction history
- Monthly spending view
- Category grouping
- Export transactions

### Add a Transaction

1. Click **💳 Transactions** tab
2. Click **➕ Add Transaction**
3. Fill in the form:
   - **Date** (required): Transaction date
   - **Amount** (required): Dollar amount
   - **Category** (required): Select from dropdown
     - Income - W-2 Wages
     - Income - 1099-MISC
     - Expense - Rent/Mortgage
     - Expense - Groceries
     - Expense - Utilities
     - And more...
   - **Description**: What the transaction was for

4. Click **Add Transaction**
5. Transaction is added to Transaction Ledger

### View Transactions

**Quick Actions:**
- **📅 Monthly View** - See transactions by month
- **📂 By Category** - Group by category
- **💾 Export** - Export to CSV/JSON

---

## 📈 Reports Tab

**Available Reports:**

### 1. Financial Summary
- Complete overview of all finances
- Assets, liabilities, net worth
- Income and expenses
- Account counts

**How to generate:**
1. Click **📈 Reports** tab
2. Click **📊 Financial Summary** card
3. Report appears below

### 2. Balance by Type
- Shows balances grouped by account type
- Bank accounts, credit cards, investments, etc.
- Helps see where money is distributed

**How to generate:**
1. Click **🏦 Balance by Type** card
2. See breakdown by account type

### 3. Monthly Report
- Income and expenses for a specific month
- Category breakdown
- Net income calculation

**How to generate:**
1. Click **📅 Monthly Report** card
2. Select month and year
3. View detailed breakdown

### 4. Tax Report
- All tax-relevant accounts
- Grouped by tax form (1099-INT, 1099-DIV, etc.)
- Deduction types
- Tax year selection

**How to generate:**
1. Click **📋 Tax Report** card
2. View tax-relevant accounts
3. See grouping by form type

---

## 🔍 Search Tab

**Features:**
- Real-time search across all accounts
- Filter by user
- Advanced filters
- Search results table

### Search for Accounts

1. Click **🔍 Search** tab
2. Type in the search box:
   - Search by account name
   - Search by account number
   - Search by account type
3. Results appear instantly as you type

### Quick User Filters

**Pre-configured filters:**
- **👤 Clint's Accounts** - All accounts for Clint
- **👤 Syrina's Accounts** - All accounts for Syrina
- **👥 Joint Accounts** - All joint accounts
- **🔄 Clear Filters** - Reset search

**Search Results:**
- Displays matching accounts in a table
- Same columns as Account tab
- Click to view details

---

## 🛠️ Tools Tab

**Utility Functions:**

### 1. Sync from Sheets
- Reloads all data from Google Sheets
- Use when data seems out of date
- Click **🔄 Sync from Sheets**

### 2. Export Data
- Exports all data as JSON
- Creates downloadable file
- Includes accounts and transactions
- Click **💾 Export Data**

### 3. Populate Dropdowns
- Loads 268+ dropdown values
- Updates _Validation sheet
- Run this first on new sheets
- Click **📝 Populate Dropdowns**

### 4. Refresh Validation
- Applies data validation rules
- Updates dropdowns in all columns
- Run after populating dropdowns
- Click **✅ Refresh Validation**

### 5. Disputed Accounts
- Shows all accounts in dispute
- Filters by Dispute Status column
- Helps track issues
- Click **⚠️ Disputed Accounts**

### 6. Need Verification
- Accounts not verified in 90+ days
- Helps maintain data accuracy
- Shows last verified date
- Click **🔍 Need Verification**

---

## 🎨 Visual Features

### Color-Coded Status Badges

**Green Badge (Active):**
- ✅ Account is active and in use

**Red Badge (Closed):**
- ❌ Account has been closed

**Yellow Badge (Other):**
- ⚠️ Pending, Dormant, or other status

### Gradient Cards

**Dashboard Cards:**
- Purple gradient background
- Hover effect (lifts up)
- Click to navigate

**Stat Cards:**
- Blue/gray gradient
- Large numbers for quick viewing
- Labels below values

### Modern Design

**Features:**
- Smooth animations
- Clean typography
- Responsive layout
- Intuitive navigation
- Professional color scheme

---

## 🔑 Keyboard & Mouse Tips

### Navigation
- **Tab key** - Move between form fields
- **Enter** - Submit forms
- **Escape** - Close dialogs (in some browsers)

### Forms
- **Required fields** marked with *
- **Dropdowns** pre-populated from _Validation sheet
- **Date pickers** for date fields
- **Number inputs** for amounts

---

## 📱 Responsive Design

The Control Panel adapts to different screen sizes:

**Large Screens (1200px+):**
- Full 3-column grid layout
- All cards visible
- Optimal viewing experience

**Medium Screens (768px-1199px):**
- 2-column grid
- Slightly smaller cards
- Still fully functional

**Small Screens (<768px):**
- Single column layout
- Cards stack vertically
- Mobile-friendly

---

## ⚡ Performance Tips

### Loading Data
- Dashboard loads automatically on open
- Other tabs load data when clicked
- Use **🔄 Refresh** buttons to reload

### Large Datasets
- Search filters results in real-time
- Tables paginate automatically
- Reports may take 1-2 seconds

### Best Practices
1. **Refresh regularly** - Keep data in sync
2. **Use search** - Don't scroll through hundreds of accounts
3. **Filter first** - Narrow down before viewing
4. **Export backups** - Use Export Data regularly

---

## 🐛 Troubleshooting

### Panel Won't Open

**Issue:** Clicking "⚡ Open Control Panel" does nothing

**Solution:**
1. Refresh the Google Sheet (Cmd+Shift+R)
2. Wait 5 seconds for scripts to load
3. Try again
4. If still failing, check authorization (see below)

### Authorization Required

**Issue:** "Script requires authorization" message

**Solution:**
1. Go to **Extensions → Apps Script**
2. Select **onOpen** from function dropdown
3. Click **Run** button (▶️)
4. Click **Review permissions**
5. Select your Google account
6. Click **Advanced** → **Go to TMAR Unified Menu**
7. Click **Allow**
8. Go back to sheet and try again

### Data Not Loading

**Issue:** Dashboard shows $0 for everything

**Solution:**
1. Click **🛠️ Tools** tab
2. Click **🔄 Sync from Sheets**
3. Wait 2-3 seconds
4. Go back to Dashboard
5. Click **🔄 Refresh Data**

### Account Form Won't Submit

**Issue:** "Add Account" button does nothing

**Solution:**
1. Check all required fields (marked with *)
2. Make sure Account Name and Type are filled
3. Try again
4. Check browser console for errors (F12)

---

## 🔐 Security & Privacy

### Data Storage

- All data stays in your Google Sheet
- No external databases
- No data leaves Google's servers
- You maintain full control

### Authorization

- Scripts only access your TMAR spreadsheet
- No access to other files
- No email or calendar access
- You can revoke at any time

### Sharing

- Panel only works for authorized users
- Other users need permission to the sheet
- Each user must authorize scripts separately

---

## 🚀 Advanced Features

### Custom Reports

You can create custom reports by:
1. Using the Search tab to filter
2. Exporting filtered results
3. Importing into Excel/Sheets
4. Creating custom charts

### Data Export

**JSON Export includes:**
- All accounts with full details
- All transactions
- Export timestamp
- Version number

**Use exported data for:**
- Backups
- Analysis in other tools
- Year-end archiving
- Tax preparation

### Integration

**The Control Panel integrates with:**
- Master Register sheet (35 columns)
- Transaction Ledger sheet
- _Validation sheet
- JavaScript services (via TMARBridge)

---

## 📊 Understanding the Data

### Account Fields

**Essential:**
- **ID** - Auto-generated MR-XXX
- **Name** - Provider/creditor name
- **Type** - Category of account
- **Balance** - Current amount
- **Status** - Active/Closed/etc

**Additional:**
- **User** - Who owns it
- **Account Number** - Last 4 digits
- **Notes** - Important details

### Transaction Fields

**Required:**
- **Date** - When it happened
- **Amount** - How much
- **Category** - Type of transaction

**Optional:**
- **Description** - What it was for
- **Account** - Which account
- **Reconciled** - Verified or not

---

## 🎯 Common Workflows

### Monthly Review

1. Open Control Panel
2. Go to **📈 Reports**
3. Generate **Monthly Report**
4. Review income vs expenses
5. Check category breakdown
6. Note any unusual spending

### Adding New Account

1. Open Control Panel
2. Go to **💼 Accounts**
3. Click **➕ Add New Account**
4. Fill in all fields
5. Submit
6. Verify in account list

### Tax Season

1. Open Control Panel
2. Go to **📈 Reports**
3. Generate **Tax Report**
4. Review tax-relevant accounts
5. Check each form type (1099-INT, etc.)
6. Export data for CPA

### Finding an Account

1. Open Control Panel
2. Go to **🔍 Search**
3. Type account name/number
4. Results appear instantly
5. Or use quick filters for user

---

## 📞 Support

### Getting Help

**Documentation:**
- `GUI_GUIDE.md` - This file
- `INTEGRATION_COMPLETE.md` - Integration overview
- `JAVASCRIPT_SETUP_GUIDE.md` - Technical details

**Troubleshooting:**
- See "Troubleshooting" section above
- Check browser console (F12)
- Verify authorization (Extensions → Apps Script)

---

## ✅ Checklist

Before using the Control Panel:

- [ ] Google Sheet is open
- [ ] Page has been refreshed
- [ ] Scripts are authorized
- [ ] _Validation sheet has been populated
- [ ] Data validation has been refreshed

First-time setup:

1. [ ] Run **TMAR Tools → Setup & Administration → Populate Dropdown Values**
2. [ ] Run **TMAR Tools → Formatting → Refresh Data Validation**
3. [ ] Open **TMAR Tools → ⚡ Open Control Panel**
4. [ ] Verify dashboard shows correct data
5. [ ] Test adding an account
6. [ ] Test searching

---

## 🎉 Summary

The TMAR Control Panel provides:

✅ **Modern Interface** - Beautiful, intuitive design
✅ **6 Main Sections** - Dashboard, Accounts, Transactions, Reports, Search, Tools
✅ **Real-Time Data** - Always in sync with your Google Sheet
✅ **Quick Actions** - Add accounts, transactions, generate reports
✅ **Advanced Search** - Find anything instantly
✅ **Powerful Reports** - Financial summary, tax reports, monthly breakdowns
✅ **Mobile-Friendly** - Works on all devices
✅ **Secure** - Data stays in your Google Sheet

**Open it now:** `TMAR Tools → ⚡ Open Control Panel`

---

**GUI Status:** ✅ DEPLOYED AND READY
**Generated with Claude Code**
