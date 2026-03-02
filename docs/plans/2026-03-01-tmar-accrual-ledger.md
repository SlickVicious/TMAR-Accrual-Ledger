# TMAR-Aligned Universal Accrual Ledger Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fork the redressright.me GAAP.html source (9,401 lines) into a TMAR-branded, trust-contextualized Universal Accrual Ledger single-file app with 31 tabs.

**Architecture:** Copy-then-refactor: duplicate the source file, apply a series of surgical find-and-replace + block-removal edits to rebrand, restructure tabs, rename data structures, and pre-populate with TMAR trust data. No new modules are being built — every change transforms existing code.

**Tech Stack:** Single HTML file, Tailwind CSS 2.2.19 (CDN), jsPDF 2.5.1 (CDN), FileSaver.js 2.0.5 (CDN), vanilla JavaScript, localStorage persistence.

**Reference docs in this directory:**
- `TMAR-ACCRUAL-LEDGER-DESIGN.md` — full design spec
- `GAAP-SOURCE-ASSOCIATION-CHART.md` — complete GUI→function mapping
- `GAAP-source.html` — the source to fork

---

## Task 1: Copy Source & Verify Baseline

**Files:**
- Create: `06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html` (copy of GAAP-source.html)

**Step 1: Copy the source file**

```bash
cp "/Users/animatedastronaut/Documents/Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR/GAAP-source.html" \
   "/Users/animatedastronaut/Documents/Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
```

**Step 2: Verify the copy is identical**

```bash
diff "/Users/animatedastronaut/Documents/Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR/GAAP-source.html" \
     "/Users/animatedastronaut/Documents/Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
```
Expected: No output (files identical), exit code 0.

**Step 3: Verify file opens in dev server**

Start `tmar-preview` server (port 8080) and navigate to `http://localhost:8080/TMAR-Accrual-Ledger.html`. Take screenshot. Expected: App renders with all 32 tabs, RedressRight branding visible.

**Step 4: Commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): copy GAAP source as baseline for TMAR Accrual Ledger"
```

---

## Task 2: Strip RedressRight Branding

**Files:**
- Modify: `TMAR-Accrual-Ledger.html`

The RedressRight nav block spans lines 189-275 (87 lines: inline CSS + `<header>` + `<script>` for mobile toggle).

**Step 1: Remove RedressRight navigation header**

Delete the entire block from `<!-- REDRESSRIGHT NAVIGATION HEADER - START -->` (line 189) to `<!-- REDRESSRIGHT NAVIGATION HEADER - END -->` (line 275), inclusive.

**Step 2: Remove RedressRight print-hide rule**

In the `<style>` section (~line 134), find and remove:
```css
.redressright-header, nav, button, .tab-btn { display: none !important; }
```
Replace with a clean print rule:
```css
nav, .tab-btn, #themeToggle, #autoSaveStatus { display: none !important; }
```

**Step 3: Update the app header (was ~line 280-286)**

Find:
```html
<h1 class="text-3xl md:text-4xl font-bold mb-2" style="font-family: 'Space Grotesk', sans-serif;">
  <span class="text-green-400">📘</span> Universal Accrual Ledger
</h1>
<p class="text-sm text-gray-400 max-w-2xl mx-auto">
  Comprehensive financial record system with multi-entity tax filing support
</p>
```

Replace with:
```html
<h1 class="text-3xl md:text-4xl font-bold mb-2" style="font-family: Calibri, 'Segoe UI', system-ui, sans-serif;">
  <span class="text-blue-400">⚖️</span> TMAR Universal Accrual Ledger
</h1>
<p class="text-sm text-gray-400 max-w-2xl mx-auto">
  A Provident Private Creditor Revocable Living Trust — EIN 41-6809588
</p>
```

**Step 4: Verify no RedressRight references remain**

```bash
grep -in "redressright\|redress" TMAR-Accrual-Ledger.html
```
Expected: No output.

**Step 5: Verify in browser**

Reload `http://localhost:8080/TMAR-Accrual-Ledger.html`. Expected: No RedressRight nav bar, TMAR header visible.

**Step 6: Commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): strip RedressRight branding, add TMAR header"
```

---

## Task 3: Swap Color Palette & Fonts

**Files:**
- Modify: `TMAR-Accrual-Ledger.html` (CSS variables section, ~lines 12-50)

**Step 1: Replace CSS custom properties**

Find the `:root` / dark mode CSS variable block. Replace color values:

| Variable | Old | New |
|---|---|---|
| `--bg-primary` | `#0f172a` | `#0D1B2A` |
| `--bg-secondary` | `#1e293b` | `#1B2A4A` |
| `--bg-tertiary` | `#334155` | `#243B5E` |
| `--accent-blue` (any `#3b82f6` in var defs) | `#3b82f6` | `#4A7FBF` |

Keep `--accent-green: #10b981`, `--accent-red: #ef4444`, `--accent-amber: #f59e0b` unchanged (already match TMAR).

**Step 2: Replace Google Fonts imports**

Find and remove:
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Step 3: Replace font-family references throughout**

Global find-and-replace in the file:
- `'JetBrains Mono'` → remove from font stacks (replace with `'SF Mono', 'Cascadia Code', monospace`)
- `'Space Grotesk'` → `Calibri`
- `font-family: 'Space Grotesk', sans-serif` → `font-family: Calibri, 'Segoe UI', system-ui, sans-serif`
- `font-family:'JetBrains Mono',monospace` → `font-family:'SF Mono','Cascadia Code',monospace`

**Step 4: Verify in browser**

Reload. Expected: TMAR navy blue palette, Calibri font throughout, no Google Fonts network requests.

**Step 5: Commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): swap to TMAR color palette and Calibri font"
```

---

## Task 4: Remove UK Accounting Tab

**Files:**
- Modify: `TMAR-Accrual-Ledger.html`

**Step 1: Remove the UK Accounting tab button**

Find and delete (originally ~line 358-360):
```html
<button onclick="switchMainTab('ukAccounting')" class="tab-btn px-4 py-3 rounded-lg font-semibold text-sm" data-tab="ukAccounting">
  🇬🇧 UK Accounting
</button>
```

**Step 2: Remove the UK Accounting section**

Delete the entire section from `<section id="ukAccountingSection"` through its closing `</section>` (originally lines 2709-2818, ~110 lines).

**Step 3: Remove any inline reference to UK Accounting**

Find and remove the secondary UK Accounting button in the SPV section (originally ~line 2539):
```html
<button onclick="switchMainTab('ukAccounting')" class="px-4 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm">UK Accounting</button>
```

**Step 4: Verify no ukAccounting references remain**

```bash
grep -in "ukAccounting\|UK Accounting\|uk.accounting" TMAR-Accrual-Ledger.html
```
Expected: No output.

**Step 5: Verify in browser**

Reload. Expected: 31 tab buttons, no UK Accounting tab, no console errors.

**Step 6: Commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): remove UK Accounting tab (31 tabs remain)"
```

---

## Task 5: Rename SPV → Trust Estate (HTML Labels)

**Files:**
- Modify: `TMAR-Accrual-Ledger.html`

There are ~103 SPV references throughout the file. This task handles the HTML labels and data-tab attributes.

**Step 1: Rename SPV tab buttons**

Find and replace the 3 SPV tab buttons:

| Find | Replace |
|---|---|
| `switchMainTab('spvDashboard')` | `switchMainTab('trustDashboard')` |
| `data-tab="spvDashboard"` | `data-tab="trustDashboard"` |
| `🏦 SPV Dashboard` | `🏦 Trust Estate Dashboard` |
| `switchMainTab('spvLedger')` | `switchMainTab('trustLedger')` |
| `data-tab="spvLedger"` | `data-tab="trustLedger"` |
| `📋 SPV Ledger` | `📋 Trust Estate Ledger` |
| `switchMainTab('spvReports')` | `switchMainTab('trustReports')` |
| `data-tab="spvReports"` | `data-tab="trustReports"` |
| `📈 SPV Reports` | `📈 Trust Estate Reports` |

**Step 2: Rename SPV section IDs**

| Find | Replace |
|---|---|
| `id="spvDashboardSection"` | `id="trustDashboardSection"` |
| `id="spvLedgerSection"` | `id="trustLedgerSection"` |
| `id="spvReportsSection"` | `id="trustReportsSection"` |

**Step 3: Rename SPV heading text in HTML**

Replace all visible "SPV" text labels:
- `"SPV Dashboard"` → `"Trust Estate Dashboard"`
- `"SPV Ledger"` → `"Trust Estate Ledger"`
- `"SPV Reports"` → `"Trust Estate Reports"`
- `"SPV entry"` → `"Trust Estate entry"`
- `"No SPV entries"` → `"No Trust Estate entries"`

**Step 4: Verify in browser**

Reload. Click Trust Estate Dashboard, Trust Estate Ledger, Trust Estate Reports tabs. Expected: Correct labels, no console errors.

**Step 5: Commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): rename SPV tab labels to Trust Estate"
```

---

## Task 6: Rename SPV → Trust Estate (JavaScript Functions)

**Files:**
- Modify: `TMAR-Accrual-Ledger.html`

**Step 1: Rename SPV JavaScript references in switchMainTab()**

In the `switchMainTab()` function, replace:
- `tabName === 'spvDashboard'` → `tabName === 'trustDashboard'`
- `updateSPVDashboard` → `updateTrustDashboard` (or keep function name and only change the tab routing)
- `tabName === 'spvReports'` → `tabName === 'trustReports'`
- `updateSPVReports` → `updateTrustReports`

**Step 2: Rename SPV data/function prefixes**

Global find-and-replace in `<script>` block:
- `spvData` → `trustData`
- `spvSave` → `trustSave`
- `spvRenderLedger` → `trustRenderLedger`
- `spvUpdateDashboard` → `trustUpdateDashboard`
- `spvShowForm` → `trustShowForm`
- `spvHideForm` → `trustHideForm`
- `spvSaveEntry` → `trustSaveEntry`
- `spvDeleteEntry` → `trustDeleteEntry`
- `spvApplyFilters` → `trustApplyFilters`
- `spvResetFilters` → `trustResetFilters`
- `spvActiveFilter` → `trustActiveFilter`
- `spvExportCSV` → `trustExportCSV`
- `spvExportPDF` → `trustExportPDF`
- `spvCurrSymbol` → `trustCurrSymbol`
- `spvTypeLabel` → `trustTypeLabel`
- `generateSPVTrialBalance` → `generateTrustTrialBalance`
- `generateSPVAssetSummary` → `generateTrustAssetSummary`
- `initSPV` → `initTrustEstate`

**Step 3: Rename SPV DOM element IDs**

Replace all `spv`-prefixed element IDs:
- `spvEntryForm` → `trustEntryForm`
- `spvDate` → `trustDate`
- `spvType` → `trustType`
- `spvDescription` → `trustDescription`
- `spvReference` → `trustReference`
- `spvDebitAccount` → `trustDebitAccount`
- `spvCreditAccount` → `trustCreditAccount`
- `spvAmount` → `trustAmount`
- `spvCurrency` → `trustCurrency`
- `spvStatus` → `trustStatus`
- `spvNotes` → `trustNotes`
- `spvLedgerBody` → `trustLedgerBody`
- `spvLedgerTotal` → `trustLedgerTotal`
- `spvFilterType` → `trustFilterType`
- `spvFilterFrom` → `trustFilterFrom`
- `spvFilterTo` → `trustFilterTo`
- `spvRecentActivity` → `trustRecentActivity`
- `spv-total-assets` → `trust-total-assets`
- `spv-tcu-total` → `trust-tcu-total`
- `spv-token-total` → `trust-token-total`
- `spvTrialBalanceBody` → `trustTrialBalanceBody`
- `spvTrialBalanceFoot` → `trustTrialBalanceFoot`
- `spvTrialBalanceOutput` → `trustTrialBalanceOutput`
- `spvAssetSummaryBody` → `trustAssetSummaryBody`
- `spvAssetSummaryOutput` → `trustAssetSummaryOutput`

**Step 4: Update SPV type labels for trust context**

Find the `spvTypeLabel` function (now `trustTypeLabel`) and update labels:
- `'tcu'` → `'corpus'` with label `"Corpus Distribution"`
- `'digital-token'` → `'beneficiary'` with label `"Beneficiary Payment"`
- Add: `'trustee-fee'` → `"Trustee Fee"`, `'asset-transfer'` → `"Asset Transfer"`, `'tax-payment'` → `"Tax Payment"`

Update the type `<select>` options in the Trust Estate entry form to match.

**Step 5: Verify in browser**

Click through all 3 Trust Estate tabs. Add a test entry, filter, delete. Expected: All functions work, no console errors.

**Step 6: Commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): rename SPV JavaScript functions and DOM IDs to Trust Estate"
```

---

## Task 7: Rename GAAP Agent → Trust Accounting Agent

**Files:**
- Modify: `TMAR-Accrual-Ledger.html`

**Step 1: Rename the tab button**

Find:
```html
<button onclick="switchMainTab('gaapAgent')" ... data-tab="gaapAgent">
  ⚖️ GAAP Agent
</button>
```
Replace with:
```html
<button onclick="switchMainTab('trustAgent')" ... data-tab="trustAgent">
  ⚖️ Trust Accounting Agent
</button>
```

**Step 2: Rename the section ID**

- `id="gaapAgentSection"` → `id="trustAgentSection"`

**Step 3: Rename switchMainTab routing**

In `switchMainTab()`, update any reference to `gaapAgent` tab name to `trustAgent`.

**Step 4: Rename JS functions and DOM IDs**

- `gaapAgentQ(` → `trustAgentQ(`
- `sendGaapAgentQuery` → `sendTrustAgentQuery`
- `gaap-agent-input` → `trust-agent-input`
- `gaap-agent-response` → `trust-agent-response`
- `GAAP_AGENT_SYSTEM_PROMPT` → `TRUST_AGENT_SYSTEM_PROMPT`
- `_gaapApiKey` → `_trustApiKey`

**Step 5: Update the system prompt**

Find the `GAAP_AGENT_SYSTEM_PROMPT` (now `TRUST_AGENT_SYSTEM_PROMPT`) string literal (~line 8363). Prepend trust context at the beginning:

```javascript
const TRUST_AGENT_SYSTEM_PROMPT = `You are the TRUST ACCOUNTING AGENT for A Provident Private Creditor Revocable Living Trust (EIN 41-6809588), Trustee Clinton Wimberly IV (CAF 0317-17351). You operate within the GAAP accrual accounting framework aligned with the Freeway Mechanics (FWM) trust administration system (7-Part, 11 Binder Tabs).

` + /* rest of original prompt */;
```

**Step 6: Update visible text labels**

- `"GAAP Agent"` → `"Trust Accounting Agent"` in all headings
- `"Submit to GAAP Agent"` → `"Submit to Trust Agent"`
- `"GAAP / ASC / IRC accounting question"` → `"Trust accounting, GAAP / ASC / IRC question"`
- `"API Key Required"` → update instructions text

**Step 7: Verify in browser**

Click Trust Accounting Agent tab. Expected: Correct label, input field present, preset question buttons work (they populate the input).

**Step 8: Commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): rename GAAP Agent to Trust Accounting Agent with trust context"
```

---

## Task 8: Rename localStorage Keys

**Files:**
- Modify: `TMAR-Accrual-Ledger.html`

**Step 1: Rename main storage key**

Find: `const STORAGE_KEY = 'GAAP_UniversalLedger_Data';` (line ~3910)
Replace: `const STORAGE_KEY = 'TMAR_AccrualLedger_Data';`

**Step 2: Rename module storage keys**

Global find-and-replace:
- `'RR_BOE'` → `'TMAR_BOE'` (4 occurrences)
- `'RR_BOECounter'` → `'TMAR_BOECounter'` (2 occurrences)
- `'RR_Expenses'` → `'TMAR_Expenses'` (4 occurrences)
- `'RR_Customers'` → `'TMAR_Customers'` (3 occurrences)
- `'RR_Vendors'` → `'TMAR_Vendors'` (3 occurrences)
- `'RR_Assets'` → `'TMAR_Assets'` (3 occurrences)
- `'RR_Reconciliations'` → `'TMAR_Reconciliations'` (3 occurrences)
- `'vcHistory'` → `'TMAR_vcHistory'` (4 occurrences)
- `'vcStats'` → `'TMAR_vcStats'` (4 occurrences)

**Step 3: Verify no old keys remain**

```bash
grep -in "GAAP_UniversalLedger\|RR_BOE\|RR_Expenses\|RR_Customers\|RR_Vendors\|RR_Assets\|RR_Reconciliations\|'vcHistory'\|'vcStats'" TMAR-Accrual-Ledger.html
```
Expected: No output.

**Step 4: Verify in browser**

Open console, type `localStorage`. Expected: No old keys. Add a ledger entry, check `localStorage.getItem('TMAR_AccrualLedger_Data')` returns valid JSON.

**Step 5: Commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): rename all localStorage keys from GAAP/RR to TMAR prefix"
```

---

## Task 9: Pre-Populate Default Entity

**Files:**
- Modify: `TMAR-Accrual-Ledger.html`

**Step 1: Update defaultAppData with trust entity**

Find the `defaultAppData` object (~line 3914). Replace `entities: []` with:

```javascript
entities: [{
  id: 'trust_primary',
  name: 'A Provident Private Creditor Revocable Living Trust',
  type: 'Trust',
  ein: '41-6809588',
  trustee: 'Clinton Wimberly IV',
  cafNumber: '0317-17351',
  fiscalYearEnd: '12/31',
  status: 'Active',
  primaryUser: 'Trust',
  contact: '',
  address: ''
}],
```

**Step 2: Add settings to defaultAppData**

Add after `lastSaved: null`:
```javascript
settings: {
  trustName: 'A Provident Private Creditor Revocable Living Trust',
  trustEIN: '41-6809588',
  trusteeName: 'Clinton Wimberly IV',
  cafNumber: '0317-17351',
  activeYear: '2025'
}
```

**Step 3: Verify in browser**

Reload app (clear localStorage first to test defaults: `localStorage.clear()` in console). Click Entities tab. Expected: Trust entity card displayed with correct name, EIN, trustee, status "Active".

**Step 4: Commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): pre-populate trust entity in default app data"
```

---

## Task 10: Add TMAR Dropdowns (Account Types, Statuses, Users)

**Files:**
- Modify: `TMAR-Accrual-Ledger.html`

**Step 1: Update the ledger category dropdown**

Find the category `<select>` in the Ledger section. Replace its `<option>` list with the 33 TMAR account types:

```html
<option value="">Select Category...</option>
<option value="Checking">Checking</option>
<option value="Savings">Savings</option>
<option value="Credit Card">Credit Card</option>
<option value="Mortgage">Mortgage</option>
<option value="Auto Loan">Auto Loan</option>
<option value="Student Loan">Student Loan</option>
<option value="Personal Loan">Personal Loan</option>
<option value="Gym Membership">Gym Membership</option>
<option value="Investment">Investment</option>
<option value="Retirement">Retirement</option>
<option value="Brokerage">Brokerage</option>
<option value="HSA">HSA</option>
<option value="FSA">FSA</option>
<option value="Life Insurance">Life Insurance</option>
<option value="Auto Insurance">Auto Insurance</option>
<option value="Health Insurance">Health Insurance</option>
<option value="Dental Insurance">Dental Insurance</option>
<option value="Vision Insurance">Vision Insurance</option>
<option value="Homeowners Insurance">Homeowners Insurance</option>
<option value="Renters Insurance">Renters Insurance</option>
<option value="Utility">Utility</option>
<option value="Subscription">Subscription</option>
<option value="Streaming">Streaming</option>
<option value="Phone">Phone</option>
<option value="Internet">Internet</option>
<option value="Medical">Medical</option>
<option value="Dental">Dental</option>
<option value="Tax Account">Tax Account</option>
<option value="Trust Account">Trust Account</option>
<option value="Business Account">Business Account</option>
<option value="Government Account">Government Account</option>
<option value="Collections">Collections</option>
<option value="Other">Other</option>
```

**Step 2: Add status dropdown to Entity form**

Find the entity add/edit form. Ensure the status field is a dropdown with 9 TMAR statuses:
Active, Closed, Pending, Suspended, In Review, Dormant, Under Dispute, Transferred, Archived.

**Step 3: Add primary user dropdown to Entity form**

Add a "Primary User" field with options: Clint, Syrina, Joint, Trust.

**Step 4: Verify in browser**

Test: Ledger → add entry → category dropdown shows 33 types. Entities → add entity → status dropdown shows 9 statuses, primary user shows 4 options.

**Step 5: Commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): add 33 account types, 9 statuses, 4 user dropdowns"
```

---

## Task 11: Reorganize Tab Order into 8 Groups

**Files:**
- Modify: `TMAR-Accrual-Ledger.html`

**Step 1: Reorder tab buttons with group dividers**

Replace the tab button `<div>` (lines ~320-418) with the 31 buttons organized into 8 visual groups, separated by subtle dividers:

```html
<!-- Group 1: Core Accounting -->
<!-- Ledger, Entities, Chart of Accounts, Journal -->

<div class="w-px h-6 bg-gray-600 mx-1 hidden md:block"></div>

<!-- Group 2: Receivables & Payables -->
<!-- A/R, A/P -->

<div class="w-px h-6 bg-gray-600 mx-1 hidden md:block"></div>

<!-- Group 3: Consolidation & Statements -->
<!-- Consolidation, Statements -->

<div class="w-px h-6 bg-gray-600 mx-1 hidden md:block"></div>

<!-- Group 4: Tax & Compliance -->
<!-- Tax Filings, Tax Estimator, Schedule A Detail -->

<div class="w-px h-6 bg-gray-600 mx-1 hidden md:block"></div>

<!-- Group 5: Trust Estate -->
<!-- Trust Estate Dashboard, Trust Estate Ledger, Trust Estate Reports -->

<div class="w-px h-6 bg-gray-600 mx-1 hidden md:block"></div>

<!-- Group 6: Operations -->
<!-- Invoicing, Payroll, Inventory, Budget & Forecast, Payment Orders, Bills of Exchange,
     Expense Itemization, Customers & Vendors, Asset Depreciation, Bank Reconciliation -->

<div class="w-px h-6 bg-gray-600 mx-1 hidden md:block"></div>

<!-- Group 7: Reports & Intelligence -->
<!-- Reports, MASTER REPORT, Trust Accounting Agent, Voice & Chat -->

<div class="w-px h-6 bg-gray-600 mx-1 hidden md:block"></div>

<!-- Group 8: Tools -->
<!-- Financial Assets, Document Creator, Source Folders -->
```

Maintain the exact same `onclick`, `data-tab`, and `style` attributes from the original — only reorder position in the DOM.

**Step 2: Verify in browser**

Reload. Expected: Tabs appear in 8 logical groups with subtle dividers. All tabs still function correctly.

**Step 3: Commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): reorganize tabs into 8 logical groups with dividers"
```

---

## Task 12: Update Page Title & Meta Tags

**Files:**
- Modify: `TMAR-Accrual-Ledger.html`

**Step 1: Update `<title>` tag**

Find: `<title>Universal Accrual Ledger</title>` (or similar)
Replace: `<title>TMAR Universal Accrual Ledger</title>`

**Step 2: Add meta description**

After `<title>`, add:
```html
<meta name="description" content="TMAR-Aligned Universal Accrual Ledger - Trust accounting, double-entry journal, tax forms, financial statements">
<meta name="author" content="Clinton Wimberly IV">
```

**Step 3: Update any remaining "Universal Accrual Ledger" standalone text**

Search for text references to "Universal Accrual Ledger" that should include "TMAR":
- Export PDF titles
- Preview window title
- Import/export file names

Replace:
- `'Universal_Accrual_Ledger_Export'` → `'TMAR_Accrual_Ledger_Export'`
- `'UniversalLedgerBook.json'` → `'TMAR_LedgerBook.json'`
- `'UniversalLedger.csv'` → `'TMAR_Ledger.csv'`

**Step 4: Commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): update page title, meta tags, and export filenames"
```

---

## Task 13: Final Verification & Polish

**Files:**
- Modify: `TMAR-Accrual-Ledger.html` (if fixes needed)

**Step 1: Full grep audit — no leftover references**

```bash
grep -inc "redressright\|GAAP_Universal\|RR_BOE\|RR_Expense\|RR_Customer\|RR_Vendor\|RR_Asset\|RR_Reconciliation\|ukAccounting\|spvDashboard\|spvLedger\|spvReports\|gaapAgent\|SPV Dashboard\|SPV Ledger\|SPV Reports\|GAAP Agent\|'vcHistory'\|'vcStats'" TMAR-Accrual-Ledger.html
```
Expected: `0` for every pattern.

**Step 2: Browser console check**

Open `TMAR-Accrual-Ledger.html` in browser. Open DevTools Console. Expected: Zero errors, zero warnings (CDN loads OK).

**Step 3: Click-through every tab**

Navigate all 31 tabs sequentially. For each tab, verify:
- Tab switches correctly (section visible, button highlighted)
- No JavaScript errors in console
- Correct TMAR labels (no "SPV", no "GAAP Agent", no "UK")

**Step 4: Test data persistence**

1. Add a ledger entry, journal entry, and entity
2. Reload the page
3. Verify all data persists
4. Check `localStorage` keys all use TMAR prefix

**Step 5: Test dark/light mode**

Toggle dark mode off. Verify:
- Light mode uses TMAR palette (white bg, navy text, light blue accents)
- Toggle back to dark mode — TMAR navy bg
- Mode persists after reload

**Step 6: Test export**

Export JSON → verify file name includes "TMAR". Export PDF → verify header says "TMAR Universal Accrual Ledger". Import the JSON back → verify data restores.

**Step 7: Test print preview**

Ctrl+P / Cmd+P. Verify: Clean black/white output, no tab buttons, no auto-save toast.

**Step 8: Commit final state**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-Accrual-Ledger.html"
git commit -m "feat(tmar): final polish — verified all 31 tabs, exports, persistence, themes"
```

---

## Task 14: Update Dev Server & Documentation

**Files:**
- Modify: `.claude/launch.json` (update tmar-preview default page)
- Modify: `TMAR-ACCRUAL-LEDGER-DESIGN.md` (mark as implemented)

**Step 1: Update launch.json**

No changes needed — the `tmar-preview` server already serves the TMAR directory; just navigate to `TMAR-Accrual-Ledger.html` instead of `GAAP-source.html`.

**Step 2: Mark design doc as complete**

Add to top of `TMAR-ACCRUAL-LEDGER-DESIGN.md`:
```markdown
**Status**: ✅ IMPLEMENTED — 2026-03-01
**Output File**: `TMAR-Accrual-Ledger.html`
```

**Step 3: Final commit**

```bash
git add "06 Toolkit/Dev/SS Master Acct Reg/TMAR/TMAR-ACCRUAL-LEDGER-DESIGN.md"
git commit -m "docs(tmar): mark design as implemented"
```

---

## Summary

| Task | What | Est. Size |
|---|---|---|
| 1 | Copy source, verify baseline | 1 edit |
| 2 | Strip RedressRight branding | ~90 lines removed, 10 lines replaced |
| 3 | Swap palette & fonts | ~30 find/replace operations |
| 4 | Remove UK Accounting | ~115 lines removed |
| 5 | Rename SPV → Trust Estate (HTML) | ~25 find/replace in HTML labels |
| 6 | Rename SPV → Trust Estate (JS) | ~80 find/replace in JS code |
| 7 | Rename GAAP Agent → Trust Agent | ~35 find/replace + prompt update |
| 8 | Rename localStorage keys | ~30 find/replace |
| 9 | Pre-populate default entity | ~20 lines added |
| 10 | Add TMAR dropdowns | ~50 lines added |
| 11 | Reorganize tab order | Reorder 31 buttons + add dividers |
| 12 | Update titles & meta | ~10 find/replace |
| 13 | Final verification | Testing only |
| 14 | Update docs | 2 lines added |

**Total**: 14 tasks, ~13 commits, primarily find-and-replace surgery on a single file.
