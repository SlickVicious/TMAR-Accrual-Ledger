# Master Account Register - Google Sheets Setup Guide
## Complete Trust Administration System in 15-20 Minutes

**Advantage:** Cloud-based, auto-saving, accessible anywhere, no software needed!

---

## 🚀 QUICK START (Do This First)

1. **Go to:** https://sheets.google.com
2. **Create new blank spreadsheet**
3. **Rename it:** Click "Untitled spreadsheet" → `Trust Master Account Register`
4. **Follow the steps below**

---

## 📊 TAB 1: DASHBOARD (5 minutes)

### Step 1: Create Tab
- Bottom left: Click ➕ or rename "Sheet1" → `Dashboard`

### Step 2: Set Up Title Section

**Cell A1:** Type `TRUST ACCOUNT DASHBOARD`
- Font size: 18
- Bold
- Background color: Dark blue (#203764)
- Text color: White
- Merge cells A1:F1

**Cell A2:** Type `=TEXT(TODAY(),"Generated: yyyy-mm-dd")`
- Font: Italic
- Size: 10
- Merge A2:F2

### Step 3: Create Summary Metrics

**Cell A4:** Type `ACCOUNT SUMMARY`
- Bold, size 12
- Background: Light blue (#D9E1F2)
- Merge A4:B4

**Enter these in Column A (starting A5):**
```
A5:  Total Accounts Tracked:
A6:  Active Accounts:
A7:  Dormant Accounts:
A8:  Closed Accounts:
A9:  Disputed Accounts:
A10: (leave blank)
A11: Total Account Value:
A12: Document Completion:
A13: Missing Documents:
A14: Accounts Needing Review:
```

**Make Column A bold**

**Enter these formulas in Column B:**
```
B5:  =COUNTA('Master Register'!C:C)-1
B6:  =COUNTIF('Master Register'!H:H,"Active")
B7:  =COUNTIF('Master Register'!H:H,"Dormant")
B8:  =COUNTIF('Master Register'!H:H,"Closed*")
B9:  =COUNTIF('Master Register'!H:H,"Disputed")
B11: =SUMIF('Master Register'!H:H,"Active",'Master Register'!K:K)
B12: =IFERROR(COUNTIF('Master Register'!V:V,"Y")/COUNTA('Master Register'!V:V),0)
B13: =COUNTIF('Master Register'!V:V,"N")+COUNTIF('Master Register'!U:U,"N")
B14: =COUNTIF('Master Register'!AA:AA,"<"&TODAY()-90)
```

**Format B11:** Currency ($ sign)
**Format B12:** Percent (%)

### Step 4: Add Instructions

**Cell A16:** Type `INSTRUCTIONS`
- Bold, size 12
- Background: Light blue
- Merge A16:F16

**Cells A17-A22:** Type these instructions:
```
A17: 1. Add new accounts in the 'Master Register' tab
A18: 2. Track receipts/invoices in 'Proof of Purchase' tab
A19: 3. Record vendors/contractors in 'Vendors & Contracts' tab
A20: 4. Use 'Account Discovery Tracker' to find old accounts
A21: 5. Dashboard updates automatically as you add data
A22: 6. All formulas are pre-configured - just enter data
```

### Step 5: Format Columns
- Column A width: 300 pixels
- Column B width: 200 pixels

**Dashboard Complete!** ✓

---

## 📋 TAB 2: MASTER REGISTER (5 minutes)

### Step 1: Create Tab
- Bottom: Click ➕ → Rename to `Master Register`

### Step 2: Create Headers (Row 1)

**Copy/paste this entire row into A1-AE1:**
```
Row ID	Date Added	Provider/Creditor	Provider EIN	Account Number	Account Type	Account Subtype	Status	Open Date	Close Date	Current Balance	Original Balance	Running Total (In)	Running Total (Out)	Billing Frequency	Next Payment Date	Authorized Users	Primary User	Autopay Status	Autopay Source	Contract/Terms File	Statements Complete	Tax Forms on File	PoP Documents	Document Location	Last Statement Date	Last Verified Date	Retention Period	Destroy After Date	Notes	Tags
```

**Format headers:**
- Bold, size 11
- Background: Blue (#4472C4)
- Text color: White
- Text wrapping: Wrap
- Align: Center, Top

### Step 3: Add Formulas in Row 2

**Cell A2:** `=IF(C2<>"","R-"&TEXT(ROW()-1,"000"),"")`
**Cell B2:** `=TODAY()`
**Cell AC2:** `=IF(AND(J2<>"",AB2<>""),DATE(YEAR(J2)+AB2,MONTH(J2),DAY(J2)),"")`

### Step 4: Create Data Validation (Dropdowns)

**Column F (Account Type) - F2:F1000:**
- Data → Data validation
- Criteria: List of items
- Items (paste this):
```
Employment Income - W-2,Employment Income - 1099,Bank Account - Checking,Bank Account - Savings,Investment - Brokerage (Individual),Investment - IRA Roth,Investment - IRA Traditional,Credit Card - Personal,Loan - Mortgage,Utility - Electric,Phone - Mobile,Subscription - Streaming,Subscription - Software,Insurance - Auto,Insurance - Health,Vendor - Professional Services,Government - SSA
```

**Column H (Status) - H2:H1000:**
```
Active,Closed - Normal,Closed - Paid Off,Dormant,Disputed,Frozen,Pending Activation
```

**Column R (Primary User) - R2:R1000:**
```
Clint,Syrina,Joint,Trust,Beneficiary
```

**Columns U, V, S (Y/N fields) - Each separately:**
```
Y,N,Partial
```

### Step 5: Format Columns

**Widths (approximate):**
- A: 80
- B: 100
- C: 250
- D-E: 120
- F: 250
- G: 180
- H: 120
- I-J: 100
- K-N: 120
- O-P: 120
- Q: 180
- R: 100
- S-V: 120
- W: 180
- X: 80
- Y: 350
- Z-AB: 120
- AC: 120
- AD: 250
- AE: 180

### Step 6: Freeze Header Row
- View → Freeze → 1 row

**Master Register Complete!** ✓

---

## 💰 TAB 3: PROOF OF PURCHASE (3 minutes)

### Step 1: Create Tab
- Click ➕ → Rename to `Proof of Purchase`

### Step 2: Headers (Row 1)
```
PoP ID	Date of Purchase	Vendor/Seller	Item/Service Description	Category	Purchase Type	Amount	Payment Method	Transaction ID	Purpose	Tax Deductible	Deduction Category	Warranty Period	Warranty Expiration	Return Period	Return Deadline	Receipt/Invoice #	Document Format	Document Location	File Name	Related Asset	Depreciation Schedule	Current Value	Notes
```

**Format same as Master Register headers**

### Step 3: Formula in A2
```
=IF(B2<>"","PoP-"&TEXT(ROW()-1,"00000"),"")
```

### Step 4: Data Validation

**Column E (Category) - E2:E5000:**
```
Electronics - Computer Hardware,Electronics - Software,Appliances - Major,Furniture,Auto - Purchase,Auto - Parts,Professional Services - Legal,Professional Services - Accounting,Home Services - Repair,Medical - Services,Office Supplies,Software Licenses,Subscriptions
```

**Column F (Purchase Type) - F2:F5000:**
```
Asset,Expense,Service
```

**Column K (Tax Deductible) - K2:K5000:**
```
Y,N,Partial
```

### Step 5: Format
- Column D (Description): Width 350
- Column S (Document Location): Width 400
- Column X (Notes): Width 300
- Freeze row 1

**Proof of Purchase Complete!** ✓

---

## 🏢 TAB 4: VENDORS & CONTRACTS (3 minutes)

### Step 1: Create Tab
- Click ➕ → Rename to `Vendors & Contracts`

### Step 2: Headers
```
Vendor ID	Vendor Name	Vendor Type	Contact Name	Phone	Email	Address	EIN/Tax ID	First Service Date	Last Service Date	Contract Status	Contract Type	Total Paid (Lifetime)	Services Provided	PoP Documents Count	PoP Folder Path	W-9 on File	Insurance Certificate	Last 1099 Issued	Rating/Notes
```

### Step 3: Formula in A2
```
=IF(B2<>"","V-"&TEXT(ROW()-1,"000"),"")
```

### Step 4: Data Validation

**Column C (Vendor Type) - C2:C1000:**
```
Professional Services - CPA,Professional Services - Attorney,Home Services - Plumbing,Home Services - Electric,Home Services - HVAC,Auto Services - Mechanic,Medical Services - Doctor,Technology Services - IT,Financial Services - Advisor
```

**Column K (Contract Status) - K2:K1000:**
```
Ongoing,Completed,Terminated,On Hold
```

**Columns Q, R (W-9, Insurance) - Each separately:**
```
Y,N
```

### Step 5: Format
- Column B (Vendor Name): 250
- Column C (Vendor Type): 300
- Column G (Address): 300
- Column N (Services): 350
- Column P (PoP Folder): 400
- Column T (Notes): 300

**Vendors & Contracts Complete!** ✓

---

## 🔍 TAB 5: ACCOUNT DISCOVERY TRACKER (2 minutes)

### Step 1: Create Tab
- Click ➕ → Rename to `Account Discovery Tracker`

### Step 2: Headers
```
Discovery ID	Date Remembered	Provider Name (If Known)	Account Type Estimate	Approximate Dates	How Remembered	Status	Search Method	Account Found	Account Number (If Found)	Added to Master Register	Master Register Row	Documents Recovered	Notes
```

### Step 3: Formula in A2
```
=IF(B2<>"","DISC-"&TEXT(ROW()-1,"000"),"")
```

### Step 4: Data Validation

**Column G (Status) - G2:G1000:**
```
Researching,Located,Added,Dead End,On Hold
```

**Column H (Search Method) - H2:H1000:**
```
Credit Report Pull,Old Bank Statements,Email Search,Tax Return Review,File Cabinet Excavation,Memory Trigger,Provider Customer Service Call
```

**Columns I, K (Found, Added) - Each separately:**
```
Y,N
```

**Account Discovery Tracker Complete!** ✓

---

## 💼 TAB 6: INVESTMENT ACCOUNTS (2 minutes)

### Step 1: Create Tab
- Click ➕ → Rename to `Investment Accounts`

### Step 2: Headers
```
Account ID	Broker	Account Type	Account Number	Opening Balance	Current Balance	Cost Basis	Unrealized Gain/Loss	YTD Dividends	YTD Capital Gains	YTD Contributions	YTD Withdrawals	Asset Allocation	Holdings Count	Last Trade Date	Statements Complete	1099 Forms	5498 Forms	Trade Confirmations	Document Path	Notes
```

### Step 3: Formulas
**Cell A2:** `=IF(B2<>"","INV-"&TEXT(ROW()-1,"000"),"")`
**Cell H2:** `=IF(AND(F2<>"",G2<>""),F2-G2,"")`

### Step 4: Data Validation
**Columns P, Q, R, S - Each separately:**
```
Y,N,Partial
```

**Investment Accounts Complete!** ✓

---

## 📝 REMAINING TABS (Quick Setup)

Create these 6 additional tabs (just headers for now - you'll fill as needed):

### TAB 7: Employment Records
Headers:
```
Employer Name	Employer EIN	Employee ID	Pay Date	Pay Period Start	Pay Period End	Gross Pay	Federal Tax	State Tax	FICA/Medicare	Other Deductions	Net Pay	YTD Gross	YTD Net	Voucher/Check #	Bank Account	Pay Stub Filed	Document Path
```

### TAB 8: Banking Accounts
Headers:
```
Bank Name	Account Type	Account #	Routing #	Open Date	Current Balance	Available Balance	Last Statement Date	Statement Balance	Reconciled	Online Access	Debit Card	Monthly Service Fee	Interest Rate	Document Path
```

### TAB 9: Transaction Log
Headers:
```
Date	Account	Transaction Type	Category	Description	Debit	Credit	Balance	Check/Ref #	Cleared	Reconciled	Receipt Filed	Document Path	PoP Reference
```

### TAB 10: Document Inventory
Headers:
```
Account ID	Provider	Document Type	Document Date	Filing Location	File Name	Format	Original/Copy	Pages	Digital	Physical	Certified	Notarized	Expiration Date	Retention Years	Destroy After	Notes
```

### TAB 11: Tax Tracking
Headers:
```
Tax Year	Provider	Form Type	Form Date	Box 1 - Wages	Federal Tax	State Tax	Received	Filed with Return	Document Path
```

### TAB 12: Monthly Reconciliation
Headers:
```
Month	Year	Account	Statement Balance	Ledger Balance	Difference	Status	Reconciled By	Date	Notes
```

---

## 🎨 FINAL POLISH (2 minutes)

### 1. Color Code Tabs
- Right-click each tab → "Change color"
- Dashboard: Blue
- Master Register: Green  
- Proof of Purchase: Orange
- Vendors: Purple
- Discovery: Yellow
- Investments: Red
- Others: Gray

### 2. Protect Formulas (Optional)
- Data → Protect sheets and ranges
- Select "Sheet" → Choose columns with formulas
- Set to "Show warning when editing"

### 3. Create Named Ranges (Makes formulas easier)
- Data → Named ranges
- Create: `ActiveAccounts` = `'Master Register'!H:H`
- Create: `AccountBalances` = `'Master Register'!K:K`

### 4. Add Conditional Formatting

**Master Register - Status Column (H):**
- Format → Conditional formatting
- Format rules:
  - If text contains "Active" → Green background
  - If text contains "Closed" → Gray background
  - If text contains "Disputed" → Red background
  - If text contains "Dormant" → Yellow background

**Master Register - Document Completion (V):**
- If text is exactly "Y" → Green background
- If text is exactly "N" → Red background

---

## 📱 BONUS: MOBILE ACCESS

### Google Sheets App
1. Install "Google Sheets" app (iOS/Android)
2. Sign in with your Google account
3. Open "Trust Master Account Register"
4. Can view/edit on phone!

### Quick Add from Phone
- Add new account on-the-go
- Snap photo of receipt → Upload to Drive → Link in PoP Register
- Check account balances anywhere

---

## 🔄 GOOGLE SHEETS ADVANTAGES

### Auto-Sync
- Edit on PC → Instantly available on Mac
- Edit on Mac → Instantly available on phone
- No file management needed!

### Version History
- File → Version history → See version history
- Restore any previous version
- See who changed what (if shared)

### Share with Co-Trustee (Optional)
- Share button (top right)
- Add co-trustee email
- Set permissions: Can edit / Can comment / Can view

### Export Options
- File → Download
  - Microsoft Excel (.xlsx)
  - PDF
  - CSV (individual tabs)
- For Trust Minutes: Export to PDF monthly

### Google Sheets Special Formulas

**Use QUERY for powerful filtering:**
```
=QUERY('Master Register'!A:AE,"SELECT * WHERE H='Active'")
```

**Use IMPORTRANGE to pull from other sheets:**
```
=IMPORTRANGE("sheet_url","Master Register!A:AE")
```

---

## 📊 POPULATE WITH YOUR DATA

### Current Accounts to Add:

**Row 2 (Boys & Girls Club):**
- Provider: Boys & Girls Clubs of Wayne County
- Account Type: Employment Income - W-2
- Status: Active
- Primary User: Clint
- Document Location: Trust-Records/Accounts/BoysGirlsClub_Wayne/

**Row 3 (Bank of America):**
- Provider: Bank of America
- Account #: ****0672
- Account Type: Bank Account - Checking
- Status: Active
- Current Balance: [enter current]
- Document Location: Trust-Records/Accounts/BankOfAmerica_0672/

**Row 4 (Fidelity):**
- Provider: Fidelity Investments
- Account #: ****7819
- Account Type: Investment - Brokerage (Individual)
- Status: Active
- Document Location: Trust-Records/Accounts/Fidelity_7819/

**Continue for all 10 accounts...**

---

## 🎯 QUICK REFERENCE: Adding Accounts

**For each new account:**

1. **Go to Master Register tab**
2. **Click next empty row**
3. **Fill in:**
   - Provider name (Column C)
   - Account number (Column E)
   - Account Type (Column F - use dropdown)
   - Status (Column H - use dropdown)
   - Open Date (Column I)
   - Primary User (Column R - use dropdown)
   - Document Location (Column Y)

4. **Row ID auto-fills** (Column A)
5. **Date Added auto-fills** (Column B)
6. **Dashboard updates automatically!**

---

## 💾 BACKUP STRATEGY

### Google Sheets Auto-Backups
- Google automatically saves every change
- Version history keeps 30+ days
- No manual backups needed!

### Optional: Monthly Export
- File → Download → Microsoft Excel
- Save to: `Master-Account-Register/Backups/YYYYMM_Export.xlsx`
- Keep last 12 months of exports

---

## 🚀 YOU'RE DONE!

**Total Time:** 15-20 minutes

**What You Have:**
- ✅ 12-tab tracking system
- ✅ Auto-calculating dashboard
- ✅ Data validation (dropdowns)
- ✅ Conditional formatting (colors)
- ✅ Cloud-based (access anywhere)
- ✅ Auto-saving
- ✅ Version history
- ✅ Mobile accessible

**Next Steps:**
1. Add your 10 current accounts
2. Verify dashboard updates
3. Bookmark the sheet
4. Start using it!

---

## 📱 QUICK ACCESS

**Desktop:**
- Bookmark: `https://docs.google.com/spreadsheets/d/[YOUR_SHEET_ID]`

**Phone:**
- Open Google Sheets app
- Star the spreadsheet (for quick access)

**Share Link (if needed):**
- Share button → Copy link
- Send to co-trustee

---

## 🎓 TIPS & TRICKS

### Keyboard Shortcuts
- `Ctrl+/` (Windows) or `Cmd+/` (Mac): See all shortcuts
- `Ctrl+F`: Find
- `Ctrl+H`: Find and replace
- `Alt+=`: Auto-sum

### Quick Data Entry
- `Ctrl+D`: Fill down
- `Ctrl+Enter`: Fill range
- Tab: Move to next cell
- Shift+Tab: Move to previous cell

### Freeze Multiple Rows/Columns
- View → Freeze → 1 row (already done)
- Can also freeze columns if needed

### Filter Views
- Data → Filter views → Create new filter view
- Name it: "Active Accounts Only"
- Filter Status column = "Active"
- Save it!

---

**🎉 YOUR GOOGLE SHEETS MASTER ACCOUNT REGISTER IS COMPLETE! 🎉**

*Access it anywhere, anytime, from any device!*
