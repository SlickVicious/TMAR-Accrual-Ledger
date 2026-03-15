# Mac Instructions: Generate Master Account Register

## Step 1: Copy Python Script to Mac

The Python script is already in your vault at:
```
~/Documents/Legal Document Generator/Digital File Cabinet/Financials/Master-Account-Register/generate_master_account_register.py
```

Or copy it from Windows:
```bash
# If syncing via iCloud/Dropbox, wait for sync
# Or manually copy from: D:\_ScriptSalad\_PS1_\generate_master_account_register.py
```

## Step 2: Install Required Package

Open Terminal on Mac:

```bash
pip3 install openpyxl
```

If that doesn't work, try:
```bash
python3 -m pip install openpyxl --user
```

## Step 3: Navigate to Directory

```bash
cd ~/Documents/Legal\ Document\ Generator/Digital\ File\ Cabinet/Financials/Master-Account-Register
```

## Step 4: Run the Script

```bash
python3 generate_master_account_register.py
```

## Step 5: Open the Excel File

The script will create:
```
~/Documents/Legal Document Generator/Digital File Cabinet/Financials/Master-Account-Register/YYYYMMDD_Trust_MasterAccountRegister.xlsx
```

Open it in Excel or Numbers!

---

## What the Excel File Contains:

**12 Tabs:**
1. **Dashboard** - Auto-updating summary with charts
2. **Master Register** - All accounts (unlimited rows)
3. **Proof of Purchase** - Receipt/invoice tracking
4. **Vendors & Contracts** - Historical vendor tracking
5. **Account Discovery Tracker** - Find old accounts
6. **Investment Accounts** - Fidelity, Vanguard, Webull details
7. **Employment Records** - Paycheck tracking
8. **Banking Accounts** - Bank reconciliation
9. **Transaction Log** - All transactions
10. **Document Inventory** - File tracking
11. **Tax Tracking** - Tax forms
12. **Monthly Reconciliation** - Balance verification

**Pre-configured Features:**
- ✓ Formulas (auto-calculate totals, percentages)
- ✓ Dropdowns (account types, statuses)
- ✓ Data validation
- ✓ Conditional formatting
- ✓ Auto-incrementing IDs

---

## Current Accounts to Add:

**Already Migrated (Add to Excel):**
1. Boys & Girls Club (Employment)
2. Bank of America ****0672 (Banking)
3. Inter Technologies (Employment - former)
4. Fidelity 7819 (Investment)
5. Vanguard (Investment - need account #)
6. Webull (Investment - need account #)
7. PayPal (Payment Platform)
8. Kinston Arts Council (Syrina - Employment)
9. Lenoir CC (Syrina - Employment)

**Ready to Add (when you get documents):**
10. Apple subscriptions
11. Microsoft subscriptions
12. Google subscriptions
13. OpenAI
14. Anthropic
15. Perplexity
16. Cline
17. Obsidian Sync/Publish
18. Any other subscriptions

---

## Quick Start After Excel Generation:

1. **Open the Excel file**
2. **Go to Master Register tab**
3. **Add your 9 current accounts** (one per row)
4. **Dashboard will auto-update**
5. **As you collect subscription docs, add them**

---

## Tips:

- **Account Type dropdown** has all categories pre-loaded
- **Status dropdown** tracks Active/Closed/Dormant
- **Primary User** can be Clint, Syrina, or Joint
- **Document Location** should match vault paths
- **PoP Documents** = count of receipts/invoices

---

## Troubleshooting:

**If `pip3 install openpyxl` fails:**
```bash
# Try with user flag:
python3 -m pip install --user openpyxl

# Or use Homebrew Python:
brew install python
python3 -m pip install openpyxl
```

**If Python not found:**
```bash
# Install via Homebrew:
brew install python

# Or download from python.org
```

---

*Once Excel is generated, you'll have a complete 20-year scalable tracking system!*
