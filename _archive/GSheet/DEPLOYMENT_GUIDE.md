# TMAR Unified Menu - Deployment Guide

**Last Updated:** 2026-03-04
**Google Sheet:** https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ/
**Apps Script ID:** `1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr`

---

## ✅ Deployment Complete!

The unified TMAR menu has been successfully deployed using `clasp push`. The menu now includes:

### Original TMAR Tools
- Year Settings
- Data Gap Scanner
- CPA Questions
- Import Tools
- Formatting
- About

### NEW: Setup & Administration
- **Refresh Dashboard Formulas** - Re-applies all dashboard calculations
- **Add Sample Data** - Adds 4 demo accounts for testing
- **Export Current Tab to PDF** - Creates PDF export links

---

## Quick Test

1. Open your TMAR Google Sheet: https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ/
2. Refresh the page (Ctrl+R / Cmd+R)
3. Look for **"TMAR Tools"** in the menu bar
4. Click **TMAR Tools → Setup & Administration**
5. You should see the 3 new menu items!

---

## Deployment Workflow (For Future Updates)

### Directory Structure

```
06 Toolkit/Dev/SS Master Acct Reg/TMAR/gas/
├── .clasp.json                    ← Clasp configuration (Script ID)
├── .claspignore                   ← Excludes *.md, backups, .DS_Store
├── appsscript.json                ← Apps Script manifest
├── Code.gs                        ← Main unified menu (3,119 lines)
├── SyncCenter.gs                  ← NEW: Sync Center — import sidebar + Web App Bridge (1,002 lines)
├── CreditReportImport.gs          ← Credit report import functions
├── DuplicateAnalyzer.gs           ← Duplicate detection and cleanup
├── ExecuteCleanup.gs              ← Cleanup execution functions
├── GUIFunctions.gs                ← GUI helper functions
├── PopulateValidation.gs          ← _Validation sheet population
├── TMARBridge.gs                  ← Dashboard, Add Account, Financial Summary
├── AddAccount.html                ← Add Account dialog
├── BillOfExchange.html            ← Bill of Exchange generator
├── ControlPanel.html              ← Control panel sidebar
├── Dashboard.html                 ← Dashboard sidebar
├── DocumentGenerator.html         ← Document generator dialog
├── EINVerifier.html               ← EIN verification dialog
├── GAAPInterface.html             ← GAAP interface sidebar
└── backup_20260228/               ← Backup of previous version
```

### Making Changes

1. **Edit locally:**
   ```bash
   cd "/Users/animatedastronaut/Documents/Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR/gas"
   # Edit Code.gs with your changes
   ```

2. **Test syntax:**
   ```bash
   node --check Code.gs  # Basic JavaScript syntax check
   ```

3. **Deploy to Apps Script:**
   ```bash
   clasp push
   ```

4. **Test in Google Sheets:**
   - Open the sheet
   - Refresh the page
   - Test the menu items

### Pulling Latest Code from Apps Script

If you make changes directly in the Apps Script editor:

```bash
cd "/Users/animatedastronaut/Documents/Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR/gas"
clasp pull
```

---

## File Descriptions

### Code.gs (Main Menu)
- **Lines:** 3,119
- **Contains:**
  - `onOpen()` with unified TMAR Tools menu (including Import from Accrual Ledger item)
  - All formatting functions
  - All TMAR Tools menu functions
  - Trust Admin Tools functions (refreshDashboard, addSampleData, exportToPdf)
  - Year selector with tax brackets
  - Data gap scanner
  - CPA questions manager
  - Import tools (CSV import, Add Account, Add Obligation, Add Subscription)
  - Conditional formatting
  - Data validation

### SyncCenter.gs (Sync Center — Phase 1 + Phase 2) ← NEW v3.1
- **Lines:** 1,002
- **Contains:**
  - **Phase 1 (Tier 1):** Import sidebar (`showLedgerImportDialog`, `importFromLedger` router, 4 import handlers)
  - **Phase 2 (Tier 2):** Web App Bridge (`doGet`, `doPost`, 16 helper/push/pull functions)
  - Spreadsheet ID constant, EIN masking, _SyncMeta tracking, payload validation
  - Deploy as Web App to enable Live Sync from Accrual Ledger

### CreditReportImport.gs
- **Purpose:** Import accounts from credit reports
- **Contains:** `importSyrinaCreditReportAccounts()` function
- **Status:** Unchanged

### Other Script Files
| File | Lines | Purpose |
|------|-------|---------|
| `TMARBridge.gs` | 342 | Dashboard sidebar, Add Account dialog, Financial Summary, JSON export |
| `DuplicateAnalyzer.gs` | ~700 | Duplicate account detection and cleanup |
| `ExecuteCleanup.gs` | ~400 | Cleanup execution functions |
| `GUIFunctions.gs` | ~470 | GUI helper functions |
| `PopulateValidation.gs` | ~470 | _Validation sheet population |

### HTML Files (Sidebars & Dialogs)
| File | Purpose |
|------|---------|
| `AddAccount.html` | Add Account form dialog |
| `BillOfExchange.html` | Bill of Exchange generator |
| `ControlPanel.html` | Control panel sidebar |
| `Dashboard.html` | Dashboard sidebar |
| `DocumentGenerator.html` | Document generator dialog |
| `EINVerifier.html` | EIN verification dialog |
| `GAAPInterface.html` | GAAP interface sidebar |

---

## Clasp Configuration

### .clasp.json
```json
{
  "scriptId": "1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr",
  "rootDir": "/Users/animatedastronaut/Documents/Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR/gas"
}
```

### appsscript.json
```json
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

---

## Deploying as Web App (for Live Sync)

After `clasp push`, the `SyncCenter.gs` file adds `doGet()` and `doPost()` endpoints. To enable Live Sync from the Accrual Ledger:

1. **Open Apps Script Editor:**
   - In your TMAR Google Sheet: Extensions → Apps Script
   - Verify you see `SyncCenter.gs` in the file list

2. **Deploy as Web App:**
   - Click **Deploy** → **New deployment**
   - Click the gear icon ⚙️ → select **Web app**
   - **Execute as:** Me
   - **Who has access:** Anyone
   - Click **Deploy**
   - **Copy the Web App URL** (format: `https://script.google.com/macros/s/.../exec`)

3. **Connect from Accrual Ledger:**
   - Open the TMAR Accrual Ledger HTML app
   - Go to the **Sync Center** tab
   - Paste the Web App URL into the **GAS Web App URL** field
   - Click **Test Connection**
   - Verify: green status indicator + version/year display

4. **Test Push/Pull:**
   - Push a few entities → verify new rows in Master Register
   - Pull accounts → verify entities appear in the Accrual Ledger

### Updating the Web App

After making changes and running `clasp push`:
- Go to Apps Script → **Deploy** → **Manage deployments**
- Click the pencil icon ✏️ on your Web App deployment
- Change **Version** to **New version**
- Click **Deploy**

> **Note:** You must create a new version each time you update the code. The old URL continues to work automatically.

---

## Troubleshooting

### Menu doesn't appear
1. Hard refresh the Google Sheet (Ctrl+Shift+R / Cmd+Shift+R)
2. Check Apps Script authorization:
   - Extensions → Apps Script
   - Run → Run function → `onOpen`
   - Grant permissions

### Clasp push fails
```bash
# Check clasp login
clasp login

# Check you're in the right directory
pwd
# Should be: /Users/animatedastronaut/Documents/Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR/gas

# Verify .clasp.json exists
cat .clasp.json
```

### Syntax errors
- Apps Script uses ES5 JavaScript
- Avoid template literals (use string concatenation instead)
- Use `var` instead of `const`/`let` for broader compatibility

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-03-04 | 3.1 | **Web App Bridge** — Added `SyncCenter.gs` (1,002 lines) with `doGet`/`doPost` endpoints, 16 push/pull functions, `_SyncMeta` tracking. Deploy as Web App for Live Sync. |
| 2026-03-04 | 3.0 | **Sync Center integration** — Added Accrual Ledger import sidebar (6 functions), Import menu item in Code.gs |
| 2026-02-28 | 2.0 | **Unified menu deployed via clasp** — Added Trust Admin Tools submenu with 3 functions |
| Previous | 1.0 | Original TMAR Tools menu |

---

## Next Steps

1. ✅ Test the menu in Google Sheets
2. ✅ Verify all menu items work correctly
3. ✅ Test "Setup & Administration" functions
4. Document any issues or improvements

---

## Commands Reference

```bash
# Navigate to TMAR gas directory
cd "/Users/animatedastronaut/Documents/Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR/gas"

# Check clasp status
clasp login

# Pull latest from Apps Script
clasp pull

# Push local changes to Apps Script
clasp push

# Force push (overwrites remote)
clasp push --force

# Open Apps Script editor in browser
clasp open
```

---

**Deployment Status:** ✅ COMPLETE
**Generated with Claude Code**
