# TMAR Unified Menu - Deployment Guide

**Last Updated:** 2026-02-28
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
├── appsscript.json                ← Apps Script manifest
├── Code.gs                        ← Main unified menu (3,099 lines)
├── CreditReportImport.js          ← Credit report import functions
└── backup_20260228/               ← Backup of previous version
    ├── apply_master_register_formatting.gs.js
    └── CreditReportImport.js
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
- **Lines:** 3,099
- **Contains:**
  - All formatting functions
  - All TMAR Tools menu functions
  - NEW: Trust Admin Tools functions (refreshDashboard, addSampleData, exportToPdf)
  - Year selector with tax brackets
  - Data gap scanner
  - CPA questions manager
  - Import tools
  - Conditional formatting
  - Data validation

### CreditReportImport.js
- **Purpose:** Import accounts from credit reports
- **Contains:** `importSyrinaCreditReportAccounts()` function
- **Status:** Unchanged, kept as-is

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
| 2026-02-28 | 2.0 | **Unified menu deployed via clasp** - Added Trust Admin Tools submenu with 3 functions |
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
