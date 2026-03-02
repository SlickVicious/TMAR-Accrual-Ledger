# TMAR Unified Menu System — Integration Complete

**Created:** 2026-02-28
**Version:** 2.0 (Unified)
**Location:** `TMAR/gas/TMAR_Unified_Complete.gs`

---

## Overview

The unified TMAR menu system combines functionality from **two separate projects**:
1. **TMAR Tools** (original Wimberly Unified Master Register features)
2. **Trust Admin Tools** (Master Account Register setup and utilities)

All features are now accessible from a single **"TMAR Tools"** menu in your Google Sheet.

---

## What's New?

### New "Setup & Administration" Submenu

This new submenu combines the Trust Admin Tools into the TMAR system:

| Menu Item | Function | Description |
|-----------|----------|-------------|
| **Refresh Dashboard Formulas** | `refreshDashboard()` | Re-applies all dashboard formulas (useful after structural changes) |
| **Add Sample Data** | `addSampleData()` | Adds 4 sample accounts to demonstrate the system |
| **Export Current Tab to PDF** | `exportToPdf()` | Generates a PDF export link for the active tab |

---

## Complete Menu Structure

```
TMAR Tools
├── Year Settings
│   ├── Set Active Year...
│   ├── View Current Year
│   └── Reset to Current Year
│
├── Data Gap Scanner
│   ├── Run Full Scan
│   ├── Scan Current Tab Only
│   ├── View Last Report
│   ├── View Document Registry
│   └── Email Gap Report...
│
├── CPA Questions
│   ├── Add New Question...
│   ├── View All Questions
│   ├── Filter: Open Questions
│   ├── Filter: By Priority...
│   ├── Clear Filters
│   └── Generate CPA Meeting Prep
│
├── Import Tools
│   ├── Import CSV Transactions...
│   ├── Add Account to Master Reg...
│   ├── Add Obligation Entry...
│   └── Add Subscription Entry...
│
├── Setup & Administration ← NEW!
│   ├── Refresh Dashboard Formulas
│   ├── Add Sample Data
│   └── Export Current Tab to PDF
│
├── Formatting
│   ├── Apply All Formatting
│   ├── Refresh Tab Colors
│   ├── Refresh Data Validation
│   ├── Refresh Conditional Fmt.
│   ├── Refresh Filters
│   └── Refresh Header Protection
│
└── About
    ├── Workbook Info
    └── Help & Documentation
```

---

## Installation Instructions

### Option 1: New Google Sheet

1. Open your TMAR Google Sheet
2. Go to **Extensions → Apps Script**
3. Delete any existing code in the editor
4. Copy the entire contents of `TMAR_Unified_Complete.gs`
5. Paste into the Apps Script editor
6. Save (Ctrl+S / Cmd+S)
7. Close the Apps Script tab
8. Reload your Google Sheet
9. The "TMAR Tools" menu will appear in the menu bar

### Option 2: Update Existing Sheet

If you already have the TMAR Tools menu:

1. Open **Extensions → Apps Script**
2. **Replace** the existing `Code.gs` file with the contents of `TMAR_Unified_Complete.gs`
3. Save
4. Reload your Google Sheet
5. You'll see the updated menu with the new "Setup & Administration" submenu

---

## Feature Details

### Setup & Administration

#### 1. Refresh Dashboard Formulas

**When to use:**
- After adding/removing tabs
- If dashboard formulas appear broken
- After major structural changes to Master Register

**What it does:**
- Re-applies all formulas in the Dashboard/Executive Dashboard tab
- Counts active/dormant/closed accounts
- Calculates total balances
- Updates verification statistics

#### 2. Add Sample Data

**When to use:**
- Testing the system for the first time
- Demonstrating functionality to others
- Understanding how data should be formatted

**What it does:**
- Adds 4 sample accounts to Master Register:
  - Bank of America checking account
  - Fidelity investment account
  - American Express credit card
  - Duke Energy utility account
- Can be deleted later

#### 3. Export Current Tab to PDF

**When to use:**
- Sharing reports with CPA or financial advisor
- Creating printable records
- Archiving snapshots of data

**What it does:**
- Generates a PDF export link for the currently active tab
- Opens in a dialog with clickable link
- Configured for landscape, fit-to-width printing

---

## Migration from Separate Projects

### Before (Two Separate Scripts)

**Project 1:** `TMAR/gas/Wimberly Unified Master Register — Google Sheets Formatting.md`
- TMAR Tools menu with 6 submenus

**Project 2:** `06 Toolkit/Scripts/GAS/Masteraccountregister setup.md`
- Trust Admin Tools menu with 4 items

### After (Single Unified Script)

**Single File:** `TMAR/gas/TMAR_Unified_Complete.gs`
- All functionality in one place
- Consistent interface
- Enhanced menu organization

---

## File Locations

| File | Description |
|------|-------------|
| `TMAR/gas/TMAR_Unified_Complete.gs` | **New unified script** (3,188 lines) |
| `TMAR/gas/Wimberly Unified Master Register — Google Sheets Formatting.md` | Original TMAR Tools (reference only) |
| `06 Toolkit/Scripts/GAS/Masteraccountregister setup.md` | Original Trust Admin Tools (reference only) |
| `TMAR/UNIFIED_MENU_README.md` | This documentation file |

---

## Troubleshooting

### Menu doesn't appear

1. Reload the Google Sheet (Ctrl+R / Cmd+R)
2. Check Apps Script authorization:
   - Go to Extensions → Apps Script
   - Click Run → Run function → `onOpen`
   - Grant permissions when prompted
3. Check browser console for errors (F12)

### "Dashboard Not Found" error

- The `refreshDashboard()` function looks for either:
  - "Dashboard" tab, or
  - "Executive Dashboard" tab
- Ensure one of these tabs exists

### Functions missing or broken

- Verify you copied the **entire** `TMAR_Unified_Complete.gs` file
- Check that no functions were accidentally deleted during copy/paste
- Compare line count: should be **3,188 lines**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Various | Original TMAR Tools + Trust Admin Tools (separate) |
| 2.0 | 2026-02-28 | **Unified menu system** — All features integrated into single script |

---

## Support

For issues or questions:
1. Check the **About → Help & Documentation** menu in the sheet
2. Review this README file
3. Verify all tabs exist with correct names
4. Check Apps Script execution log (Extensions → Apps Script → View → Logs)

---

## Technical Notes

- **Total Lines:** 3,188
- **Menu Items:** 35+ functions
- **Submenus:** 7
- **Auto-generated items:** MR-XXX IDs, Q-IDs, timestamps
- **Sheet compatibility:** Works with TMAR 35-column schema

---

**Generated with Claude Code**
© 2026 A Provident Private Creditor Revocable Living Trust
