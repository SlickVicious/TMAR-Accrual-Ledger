# Master Account Register - Google Sheets Version
## Complete Step-by-Step Setup Guide (15-20 minutes)

**Advantages of Google Sheets:**
- ✓ Auto-saves (never lose work)
- ✓ Version history (restore any previous version)
- ✓ Accessible from any device (Mac, PC, phone, tablet)
- ✓ Shareable with co-trustee or CPA
- ✓ No software installation needed
- ✓ Free with Google account

---

## 🚀 SETUP OVERVIEW

**12 Tabs to Create:**
1. Dashboard
2. Master Register
3. Proof of Purchase
4. Vendors & Contracts
5. Account Discovery Tracker
6. Investment Accounts
7. Employment Records
8. Banking Accounts
9. Transaction Log
10. Document Inventory
11. Tax Tracking
12. Monthly Reconciliation

**Time Estimate:**
- Basic setup (Tabs 1-5): 15 minutes
- Additional tabs (6-12): 10 minutes
- Total: 25 minutes (but worth it!)

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### PRELIMINARY: Create New Spreadsheet

1. Go to: https://sheets.google.com
2. Click: **Blank** (new spreadsheet)
3. Name it: `Trust Master Account Register`
4. Save location: `My Drive > Legal Document Generator > Master-Account-Register/`

---

## TAB 1: DASHBOARD (5 minutes)

### Step 1.1: Create Tab
- Rename "Sheet1" to: **Dashboard**
- Right-click tab → **Change color** → Blue

### Step 1.2: Add Title
**Cell A1:**
```
TRUST ACCOUNT DASHBOARD
```
**Formatting:**
- Merge cells A1:F1
- Font: Bold, 16pt
- Background: Dark blue (#1a237e)
- Text color: White
- Alignment: Center

**Cell A2:**
```
=TEXT(NOW(),"Generated: yyyy-mm-dd hh:mm")
```
**Formatting:**
- Merge cells A2:F2
- Font: Italic, 10pt
- Alignment: Center

### Step 1.3: Summary Metrics Section
**Cell A4:**
```
ACCOUNT SUMMARY
```
**Formatting:**
- Merge cells A4:B4
- Font: Bold, 12pt
- Background: Light blue (#bbdefb)

**Create labels in column A (A5:A14):**
```
A5:  Total Accounts Tracked:
A6:  Active Accounts:
A7:  Dormant Accounts:
A8:  Closed Accounts:
A9:  Disputed Accounts:
A10: [leave blank]
A11: Total Account Value:
A12: Document Completion:
A13: Missing Documents:
A14: Accounts Needing Review:
```

**Add formulas in column B:**

**B5:** (Total accounts)
```
=COUNTA('Master Register'!C:C)-1
```

**B6:** (Active accounts)
```
=COUNTIF('Master Register'!H:H,"Active")
```

**B7:** (Dormant)
```
=COUNTIF('Master Register'!H:H,"Dormant")
```

**B8:** (Closed)
```
=COUNTIFS('Master Register'!H:H,"Closed*")
```

**B9:** (Disputed)
```
=COUNTIF('Master Register'!H:H,"Disputed")
```

**B11:** (Total value)
```
=SUMIF('Master Register'!H:H,"Active",'Master Register'!K:K)
```
**Format:** Currency ($#,##0.00)

**B12:** (Doc completion %)
```
=IFERROR(COUNTIF('Master Register'!V:V,"Y")/COUNTA('Master Register'!V:V),0)
```
**Format:** Percentage (0%)

**B13:** (Missing docs)
```
=COUNTIF('Master Register'!V:V,"N")+COUNTIF('Master Register'!U:U,"N")
```

**B14:** (Needs review - accounts not verified in 90 days)
```
=COUNTIF('Master Register'!AA:AA,"<"&TODAY()-90)
```

### Step 1.4: Instructions Section
**Cell A16:**
```
INSTRUCTIONS
```
**Formatting:**
- Merge A16:F16
- Font: Bold, 12pt
- Background: Light blue (#bbdefb)

**Add instructions (A17:A22):**
```
A17: 1. Add new accounts in the 'Master Register' tab
A18: 2. Track receipts/invoices in 'Proof of Purchase' tab
A19: 3. Record vendors/contractors in 'Vendors & Contracts' tab
A20: 4. Use 'Account Discovery Tracker' to find old accounts
A21: 5. Dashboard updates automatically as you add data
A22: 6. All formulas are pre-configured - just enter data
```

### Step 1.5: Column Widths
- Column A: 250 pixels
- Column B: 200 pixels

---

## TAB 2: MASTER REGISTER (10 minutes)

### Step 2.1: Create Tab
- Click **+** to add new sheet
- Name it: **Master Register**
- Right-click tab → **Change color** → Green

### Step 2.2: Create Headers (Row 1)
**Copy and paste these headers into A1:AE1:**

```
Row ID	Date Added	Provider/Creditor	Provider EIN	Account Number	Account Type	Account Subtype	Status	Open Date	Close Date	Current Balance	Original Balance	Running Total (In)	Running Total (Out)	Billing Frequency	Next Payment Date	Authorized Users	Primary User	Autopay Status	Autopay Source	Contract/Terms File	Statements Complete	Tax Forms on File	PoP Documents	Document Location	Last Statement Date	Last Verified Date	Retention Period	Destroy After Date	Notes	Tags
```

**Formatting:**
- Font: Bold, White
- Background: Dark green (#1b5e20)
- Text wrap: Enabled
- Alignment: Center, Top
- Border: All borders
- Freeze: Row 1 (View → Freeze → 1 row)

### Step 2.3: Set Column Widths
```
A: 80    (Row ID)
B: 100   (Date Added)
C: 200   (Provider/Creditor)
D: 120   (Provider EIN)
E: 120   (Account Number)
F: 200   (Account Type)
G: 150   (Account Subtype)
H: 120   (Status)
I: 100   (Open Date)
J: 100   (Close Date)
K: 120   (Current Balance)
L: 120   (Original Balance)
M: 150   (Running Total In)
N: 150   (Running Total Out)
O: 120   (Billing Frequency)
P: 120   (Next Payment Date)
Q: 150   (Authorized Users)
R: 100   (Primary User)
S: 120   (Autopay Status)
T: 120   (Autopay Source)
U: 120   (Contract File)
V: 150   (Statements Complete)
W: 150   (Tax Forms)
X: 100   (PoP Documents)
Y: 300   (Document Location)
Z: 120   (Last Statement Date)
AA: 120  (Last Verified Date)
AB: 100  (Retention Period)
AC: 120  (Destroy After Date)
AD: 250  (Notes)
AE: 150  (Tags)
```

### Step 2.4: Add Formulas in Row 2

**A2:** (Auto Row ID)
```
=IF(C2<>"","R-"&TEXT(ROW()-1,"000"),"")
```

**B2:** (Date added - manual entry or)
```
=TODAY()
```

**AC2:** (Destroy After Date - auto-calculates)
```
=IF(AND(J2<>"",AB2<>""),DATE(YEAR(J2)+AB2,MONTH(J2),DAY(J2)),"")
```

**Copy formulas down:** Select A2:AC2, then click the blue square in bottom-right corner and drag down to row 1000

### Step 2.5: Data Validation - Account Type (Column F)

**Select F2:F1000:**
1. Data → Data validation
2. Criteria: **List of items**
3. Paste this list:
```
Employment Income - W-2,Employment Income - 1099,Employment Income - Contract,Bank Account - Checking,Bank Account - Savings,Bank Account - Money Market,Investment - Brokerage (Individual),Investment - IRA Roth,Investment - IRA Traditional,Investment - 401k,Credit Card - Personal,Loan - Mortgage,Loan - Auto,Utility - Electric,Utility - Gas,Phone - Mobile,Subscription - Streaming,Subscription - Software,Subscription - AI Service,Insurance - Auto,Insurance - Health,Insurance - Life,Vendor - Professional Services,Vendor - Home Services,Government - SSA,Government - IRS
```
4. Check: **Show dropdown list in cell**
5. Check: **Reject input** (on invalid data)
6. Click **Save**

### Step 2.6: Data Validation - Status (Column H)

**Select H2:H1000:**
1. Data → Data validation
2. Criteria: **List of items**
3. Paste:
```
Active,Closed - Normal,Closed - Paid Off,Dormant,Disputed,Frozen,Pending Activation,Under Review
```
4. Save

### Step 2.7: Data Validation - Primary User (Column R)

**Select R2:R1000:**
1. Data → Data validation
2. List:
```
Clint,Syrina,Joint,Trust,Beneficiary
```
3. Save

### Step 2.8: Data Validation - Y/N Fields (Columns U, V, S)

**Select U2:U1000, V2:V1000, S2:S1000** (hold Ctrl/Cmd to select multiple):
1. Data → Data validation
2. List:
```
Y,N,Partial
```
3. Save

### Step 2.9: Conditional Formatting - Status Colors

**Select H2:H1000:**
1. Format → Conditional formatting
2. Format rules:

**Rule 1:** Active = Green
- Format cells if: **Text is exactly** → `Active`
- Formatting: Background color: Light green (#d9ead3)

**Rule 2:** Closed = Gray
- Format cells if: **Text contains** → `Closed`
- Formatting: Background color: Light gray (#d9d9d9)

**Rule 3:** Disputed = Red
- Format cells if: **Text is exactly** → `Disputed`
- Formatting: Background color: Light red (#f4cccc)

**Rule 4:** Dormant = Yellow
- Format cells if: **Text is exactly** → `Dormant`
- Formatting: Background color: Light yellow (#fff2cc)

---

## TAB 3: PROOF OF PURCHASE (5 minutes)

### Step 3.1: Create Tab
- Add new sheet: **Proof of Purchase**
- Color: Orange

### Step 3.2: Headers (Row 1)
```
PoP ID	Date of Purchase	Vendor/Seller	Item/Service Description	Category	Purchase Type	Amount	Payment Method	Transaction ID	Purpose	Tax Deductible	Deduction Category	Warranty Period	Warranty Expiration	Return Period	Return Deadline	Receipt/Invoice #	Document Format	Document Location	File Name	Related Asset	Depreciation Schedule	Current Value	Notes
```

**Formatting:** Same as Master Register (bold, dark green background, white text)

### Step 3.3: Formula in A2
```
=IF(B2<>"","PoP-"&TEXT(ROW()-1,"00000"),"")
```

### Step 3.4: Data Validation - Category (Column E)

**Select E2:E5000:**
```
Electronics - Computer Hardware,Electronics - Software,Electronics - Phones/Tablets,Appliances - Major,Appliances - Small,Furniture,Tools & Equipment,Auto - Purchase,Auto - Parts,Auto - Service/Repair,Professional Services - Legal,Professional Services - Accounting,Home Services - Repair,Home Services - Maintenance,Medical - Services,Medical - Prescriptions,Medical - Equipment,Office Supplies,Software Licenses,Subscriptions
```

### Step 3.5: Data Validation - Purchase Type (Column F)

**Select F2:F5000:**
```
Asset,Expense,Service
```

### Step 3.6: Data Validation - Tax Deductible (Column K)

**Select K2:K5000:**
```
Y,N,Partial
```

### Step 3.7: Column Widths
- Most columns: 120 pixels
- D (Description): 250 pixels
- S (Document Location): 300 pixels
- X (Notes): 250 pixels

---

## TAB 4: VENDORS & CONTRACTS (3 minutes)

### Step 4.1: Create Tab
- Add new sheet: **Vendors & Contracts**
- Color: Purple

### Step 4.2: Headers
```
Vendor ID	Vendor Name	Vendor Type	Contact Name	Phone	Email	Address	EIN/Tax ID	First Service Date	Last Service Date	Contract Status	Contract Type	Total Paid (Lifetime)	Services Provided	PoP Documents Count	PoP Folder Path	W-9 on File	Insurance Certificate	Last 1099 Issued	Rating/Notes
```

### Step 4.3: Formula in A2
```
=IF(B2<>"","V-"&TEXT(ROW()-1,"000"),"")
```

### Step 4.4: Data Validation - Vendor Type (Column C)

**Select C2:C1000:**
```
Professional Services - CPA,Professional Services - Attorney,Professional Services - Consultant,Home Services - Plumbing,Home Services - Electric,Home Services - HVAC,Home Services - Roofing,Auto Services - Mechanic,Auto Services - Body Shop,Medical Services - Doctor,Medical Services - Dentist,Technology Services - IT,Technology Services - Web,Financial Services - Advisor
```

### Step 4.5: Data Validation - Contract Status (Column K)

**Select K2:K1000:**
```
Ongoing,Completed,Terminated,On Hold
```

### Step 4.6: Data Validation - Y/N (Columns Q, R)

**Select Q2:Q1000, R2:R1000:**
```
Y,N
```

---

## TAB 5: ACCOUNT DISCOVERY TRACKER (3 minutes)

### Step 5.1: Create Tab
- Add new sheet: **Account Discovery Tracker**
- Color: Yellow

### Step 5.2: Headers
```
Discovery ID	Date Remembered	Provider Name (If Known)	Account Type Estimate	Approximate Dates	How Remembered	Status	Search Method	Account Found	Account Number (If Found)	Added to Master Register	Master Register Row	Documents Recovered	Notes
```

### Step 5.3: Formula in A2
```
=IF(B2<>"","DISC-"&TEXT(ROW()-1,"000"),"")
```

### Step 5.4: Data Validation - Status (Column G)

**Select G2:G1000:**
```
Researching,Located,Added,Dead End,On Hold
```

### Step 5.5: Data Validation - Search Method (Column H)

**Select H2:H1000:**
```
Credit Report Pull,Old Bank Statements,Email Search,Tax Return Review,File Cabinet Excavation,Memory Trigger,Provider Customer Service Call,Found Old Statement,Account Alert Email
```

### Step 5.6: Data Validation - Y/N (Columns I, K)

**Select I2:I1000, K2:K1000:**
```
Y,N
```

---

## TAB 6: INVESTMENT ACCOUNTS (2 minutes)

### Step 6.1: Create Tab
- Add new sheet: **Investment Accounts**
- Color: Teal

### Step 6.2: Headers
```
Account ID	Broker	Account Type	Account Number	Opening Balance	Current Balance	Cost Basis	Unrealized Gain/Loss	YTD Dividends	YTD Capital Gains	YTD Contributions	YTD Withdrawals	Asset Allocation	Holdings Count	Last Trade Date	Statements Complete	1099 Forms	5498 Forms	Trade Confirmations	Document Path	Notes
```

### Step 6.3: Formulas

**A2:**
```
=IF(B2<>"","INV-"&TEXT(ROW()-1,"000"),"")
```

**H2:** (Unrealized Gain/Loss)
```
=IF(AND(F2<>"",G2<>""),F2-G2,"")
```

### Step 6.4: Data Validation - Y/N (Columns P, Q, R, S)

**Select P2:P1000, Q2:Q1000, R2:R1000, S2:S1000:**
```
Y,N,Partial
```

---

## TABS 7-12: SIMPLE TEMPLATES (5 minutes total)

For each remaining tab, create a simple structure:

### Template for Each Tab:

**Tab Names & Colors:**
7. Employment Records (Light Green)
8. Banking Accounts (Blue)
9. Transaction Log (Orange)
10. Document Inventory (Gray)
11. Tax Tracking (Red)
12. Monthly Reconciliation (Purple)

**For each tab:**
1. Add tab with name and color
2. Cell A1: Tab name in CAPS
3. Format A1: Bold, 14pt, colored background, white text, merged A1:F1
4. Cell A2: "Add your column headers and data below"
5. Format A2: Italic

---

## 🎨 FINAL TOUCHES (2 minutes)

### Organize Tab Order:
Drag tabs to this order:
1. Dashboard
2. Master Register
3. Proof of Purchase
4. Vendors & Contracts
5. Account Discovery Tracker
6. Investment Accounts
7. Employment Records
8. Banking Accounts
9. Transaction Log
10. Document Inventory
11. Tax Tracking
12. Monthly Reconciliation

### Share Settings:
1. Click **Share** (top right)
2. Change to: **Restricted** (only you have access)
3. Or: Add co-trustee email if needed

### Version History:
- File → Version history → Name current version
- Name it: "Initial Setup Complete"

---

## ✅ VERIFICATION CHECKLIST

Go through each tab and verify:

**Dashboard:**
- [ ] Title formatted correctly
- [ ] All formulas reference 'Master Register'
- [ ] Metrics section complete

**Master Register:**
- [ ] All 31 column headers present
- [ ] Row 1 frozen
- [ ] Auto-ID formula in A2
- [ ] All dropdowns working (F, H, R, U, V, S)
- [ ] Conditional formatting on Status column

**Proof of Purchase:**
- [ ] Headers present
- [ ] Auto-ID formula in A2
- [ ] Dropdowns working (E, F, K)

**Vendors & Contracts:**
- [ ] Headers present
- [ ] Auto-ID formula in A2
- [ ] Dropdowns working (C, K, Q, R)

**Account Discovery:**
- [ ] Headers present
- [ ] Auto-ID formula in A2
- [ ] Dropdowns working (G, H, I, K)

**Investment Accounts:**
- [ ] Headers present
- [ ] Formulas in A2, H2
- [ ] Dropdowns working (P, Q, R, S)

---

## 🚀 USING YOUR GOOGLE SHEETS

### Adding Your First Account:

1. Go to **Master Register** tab
2. Click on cell **C2** (Provider/Creditor)
3. Type: `Boys & Girls Clubs of Wayne County`
4. Press Tab to move to next cell
5. Fill in the row with your account details
6. Switch to **Dashboard** tab
7. Watch the metrics auto-update!

### Example First Row:

```
C2:  Boys & Girls Clubs of Wayne County
D2:  XX-XXXXXXX
E2:  Employment
F2:  Employment Income - W-2
G2:  W-2 Employment
H2:  Active
I2:  2025-01-02
J2:  [leave blank]
K2:  [leave blank for employment]
L2:  [leave blank]
M2:  34858.53
N2:  [leave blank]
O2:  Bi-weekly
P2:  2026-02-01
Q2:  Clint
R2:  Clint
S2:  No
T2:  [leave blank]
U2:  N
V2:  Y
W2:  [leave blank - pending 2025 W-2]
X2:  1
Y2:  Trust-Records/Accounts/BoysGirlsClub_Wayne/
Z2:  2025-12-31
AA2: 2026-01-18
AB2: 7
AD2: 2025 payroll summary on file
AE2: #Employment #Active
```

### Tips:

**Auto-fill formulas:**
- After entering data in any row, the formulas in columns A and AC will auto-calculate

**Date entry:**
- Type dates as: 2025-01-02 or 1/2/2025
- Google Sheets will format automatically

**Currency:**
- Just type numbers: 1234.56
- Select cells → Format → Number → Currency

**Dropdown lists:**
- Click cell → Arrow appears → Select from list
- Or start typing to filter

**Copy rows:**
- Select entire row → Right-click → Copy
- Right-click destination → Paste

---

## 📱 MOBILE ACCESS

### On Phone/Tablet:

1. Download **Google Sheets** app
2. Open your spreadsheet
3. View-only works great for checking balances
4. Can edit on mobile but easier on computer

---

## 🔄 SYNCING WITH VAULT

### Document Location Column (Y):

Always use vault paths like:
```
Trust-Records/Accounts/PayPal/
Trust-Records/Subscriptions/AI-Services/Anthropic/
```

This links your Google Sheets tracking to your physical file organization!

---

## 💾 BACKUP & EXPORT

### Automatic Backups:
- Google Sheets auto-saves every few seconds
- Version history keeps all previous versions
- File → Version history → See version history

### Export to Excel:
1. File → Download → Microsoft Excel (.xlsx)
2. Saves to your Downloads folder
3. Can open in Excel or Numbers

### Export to PDF:
1. File → Download → PDF
2. Good for Trust Minutes
3. Choose: **Entire workbook** or **Current sheet**

---

## 🎯 MAINTENANCE TIPS

**Weekly:**
- Add new accounts as you discover them
- File receipts and update PoP tab

**Monthly:**
- Update current balances
- Add any new transactions
- Check Dashboard metrics

**Quarterly:**
- Export to PDF for records
- Review dropdowns (add new categories if needed)

**Annually:**
- Create named version: "Year-End 2026"
- Export full backup
- Review and archive old accounts

---

## 🆘 TROUBLESHOOTING

**Formulas not working?**
- Check that sheet names match exactly (case-sensitive)
- Make sure you're using single quotes: 'Master Register'!C:C

**Dropdowns not showing?**
- Data → Data validation → Check if rule exists
- Make sure range is correct (e.g., F2:F1000)

**Dashboard showing #REF! error?**
- Master Register tab must exist
- Check formula references sheet name

**Can't see all columns?**
- Zoom out: View → Zoom → 75%
- Or: Scroll horizontally

**Lost changes?**
- File → Version history
- Find previous version
- Click to restore

---

## 🌟 ADVANCED FEATURES (Optional)

### Add Charts to Dashboard:

**Account Type Pie Chart:**
1. Select data in Master Register: F2:F100
2. Insert → Chart
3. Chart type: Pie chart
4. Move chart to Dashboard
5. Resize and position

**Monthly Balance Line Chart:**
1. Track balances over time in Banking Accounts tab
2. Insert → Chart → Line chart
3. X-axis: Months
4. Y-axis: Balance

### Conditional Formatting - Missing Docs:

**Highlight missing documents:**
1. Select V2:V1000 (Statements Complete column)
2. Format → Conditional formatting
3. Format cells if: Text is exactly → `N`
4. Background: Light red
5. Done

### Add Notes:

**Cell comments:**
- Right-click any cell → Insert comment
- Use for reminders or clarifications
- Others can see if you share the sheet

---

## ✅ YOU'RE DONE!

Your Google Sheets Master Account Register is now **fully functional** and ready to use!

**What you have:**
- ✓ 12 professionally designed tabs
- ✓ Auto-calculating formulas
- ✓ Data validation dropdowns
- ✓ Conditional formatting
- ✓ Unlimited scalability
- ✓ Auto-saving & version history
- ✓ Accessible from any device
- ✓ Ready for 20+ years of use

**Total setup time:** ~20-25 minutes
**Years of value:** Unlimited!

---

## 📚 QUICK REFERENCE

**Key Shortcuts:**
- Ctrl/Cmd + C: Copy
- Ctrl/Cmd + V: Paste
- Ctrl/Cmd + Z: Undo
- Ctrl/Cmd + F: Find
- Ctrl/Cmd + H: Find and replace

**Navigation:**
- Ctrl/Cmd + Home: Go to A1
- Ctrl/Cmd + End: Go to last cell with data
- Ctrl/Cmd + Arrow: Jump to edge of data

**Formatting:**
- Ctrl/Cmd + B: Bold
- Ctrl/Cmd + I: Italic
- Ctrl/Cmd + U: Underline

**Google Sheets Help:**
- Help → Help and training
- Or: F1 key

---

**🎉 CONGRATULATIONS! Your Google Sheets tracking system is ready! 🎉**

*Start adding your accounts and watch the Dashboard auto-update!*
