# TMAR Custom Menu - Troubleshooting Guide

**Issue:** Custom "TMAR Tools" menu not appearing in Google Sheets

**Last Updated:** 2026-02-28

---

## ✅ Quick Fix (First-Time Authorization)

Custom menus in Google Sheets require authorization before they appear. Follow these steps:

### Step 1: Open Apps Script Editor

1. Open your TMAR Google Sheet: https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ/
2. Click **Extensions → Apps Script**
3. You should see the Apps Script editor with your code

### Step 2: Manually Run onOpen()

1. In the Apps Script editor, look for the function dropdown at the top (should say "Select function")
2. Click the dropdown and select **onOpen**
3. Click the **Run** button (▶️ play icon)
4. You'll see an authorization dialog:
   - "Authorization required"
   - Click **Review permissions**
   - Select your Google account
   - Click **Advanced** (if you see a warning)
   - Click **Go to TMAR Unified Menu (unsafe)** - this is safe, it's your own script
   - Click **Allow**

### Step 3: Refresh Your Sheet

1. Go back to your Google Sheet tab
2. **Hard refresh** the page:
   - **Mac:** Cmd + Shift + R
   - **Windows/Linux:** Ctrl + Shift + R
3. The "TMAR Tools" menu should now appear in the menu bar!

---

## Alternative: Use clasp open

If you prefer to open the Apps Script editor directly from terminal:

```bash
cd "/Users/animatedastronaut/Documents/Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR/gas"
clasp open
```

This will open the Apps Script editor in your default browser.

---

## Verification Checklist

- ✅ **Deployment confirmed:** Code.js contains onOpen() at line 498
- ✅ **Files deployed:** 6 files including Code.js, PopulateValidation.js
- ✅ **Script ID correct:** 1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr
- ⏳ **Authorization needed:** Run onOpen() manually to grant permissions

---

## What the Menu Should Look Like

Once authorized, you'll see **"TMAR Tools"** in the menu bar with these submenus:

```
TMAR Tools
├── Year Settings
│   ├── Set Active Year...
│   ├── View Current Year
│   ├── ──────────────
│   └── Reset to Current Year
│
├── Data Gap Scanner
│   ├── Run Full Scan
│   ├── Scan Current Tab Only
│   ├── ──────────────
│   ├── View Last Report
│   ├── View Document Registry
│   └── Email Gap Report...
│
├── CPA Questions
│   ├── Add New Question...
│   ├── View All Questions
│   ├── ──────────────
│   ├── Mark as Resolved...
│   ├── Filter by Priority
│   └── Export Questions
│
├── Import Tools
│   ├── Import Credit Report Accounts
│   └── Import Bank Statements
│
├── Setup & Administration ← NEW!
│   ├── Populate Dropdown Values ← Run this first!
│   ├── ──────────────
│   ├── Refresh Dashboard Formulas
│   ├── Add Sample Data
│   ├── ──────────────
│   └── Export Current Tab to PDF
│
├── Formatting
│   ├── Apply Master Register Formatting
│   ├── Refresh Data Validation
│   ├── ──────────────
│   ├── Apply Conditional Formatting
│   ├── Reset All Formatting
│   └── Set Tab Colors
│
└── About
    ├── View Documentation
    ├── Check for Updates
    └── About TMAR Tools
```

---

## Still Not Working?

### Check Authorization Status

1. In Apps Script editor, click **Run → onOpen**
2. Check the **Execution log** at the bottom
3. Look for any error messages

### Common Issues

**Issue:** "Script not authorized"
- **Solution:** Complete Step 2 above to grant permissions

**Issue:** "onOpen not found"
- **Solution:** Run `clasp pull` then `clasp push` to re-deploy

**Issue:** Menu appears then disappears
- **Solution:** Hard refresh the sheet (Cmd+Shift+R / Ctrl+Shift+R)

**Issue:** Authorization keeps asking repeatedly
- **Solution:** Make sure you're signed in to the same Google account that owns the sheet

---

## Next Steps After Menu Appears

Once you see the "TMAR Tools" menu:

1. Click **TMAR Tools → Setup & Administration → Populate Dropdown Values**
   - This loads all 268+ dropdown values into the _Validation sheet
   - You'll see a confirmation message

2. Click **TMAR Tools → Formatting → Refresh Data Validation**
   - This applies the dropdown values to all relevant columns
   - No more dropdown errors!

3. Test a dropdown in the Master Register sheet
   - Column G (Account Type) should show 89 options
   - Column K (Status) should show 22 options
   - Column R (Billing Frequency) should show 14 options

---

## Direct Links

- **Google Sheet:** https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ/
- **Apps Script Editor:** Use `clasp open` or Extensions → Apps Script

---

**Generated with Claude Code**
