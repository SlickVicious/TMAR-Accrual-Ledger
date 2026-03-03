# GAAP Source — Complete Association Chart

**Source**: `TMAR-Accrual-Ledger.html` (16,280 lines, 1.1MB)
**Date**: 2026-03-01
**Purpose**: Map every GUI element to its function, document navigation flow, and break down all core/sub/remote functions.

---

## 1. HEADER TOOLBAR (Lines 280-317)

| GUI Element | Type | Handler | Function Called | Effect |
|---|---|---|---|---|
| App Title ("Universal Accrual Ledger") | Static | — | — | Branding only |
| Dark/Light Toggle (☀️/🌙) | Button | `onclick` | `toggleDarkMode()` | Toggles `isDarkMode`, saves to `localStorage('darkMode')`, calls `applyTheme()` |
| Manual Save (💾) | Button | `onclick` | `manualSave()` | Calls `saveToStorage()`, shows success/fail alert |
| Export Dropdown | Select | `onchange` | `handleExport(format)` | Routes to `exportAllData('json'\|'pdf'\|'word'\|'csv')` |
| Preview | Button | `onclick` | `previewData()` | Opens new `window.open()` with formatted HTML report |
| Import JSON | File Input | `onchange` | `importData(event)` | FileReader → JSON.parse → Object.assign(appData) → saveToStorage() → reload |
| Clear All Data | Button | `onclick` | `clearAllData()` | `showConfirm()` → `localStorage.removeItem(STORAGE_KEY)` → `location.reload()` |

---

## 2. MAIN TAB NAVIGATION (Lines 322-417)

### Tab Buttons (37 total → 36 after removing UK Accounting)

All buttons call `switchMainTab(tabName)` which:
1. Removes `.active` from all `.tab-btn` elements
2. Adds `.active` to clicked button via `data-tab` attribute
3. Hides all `.form-section` elements
4. Shows `#${tabName}Section`
5. Runs tab-specific initialization (see column 4)

| # | Tab Name | data-tab | Init on Switch | Visual Style |
|---|---|---|---|---|
| 1 | 📒 Ledger | `ledger` | `loadEntries()` | Default (active on load) |
| 2 | 🏢 Entities | `entities` | `updateEntitiesTable()` | Default |
| 3 | 📋 Chart of Accounts | `coa` | `updateCOATable()` | Default |
| 4 | 📝 Journal | `journal` | `initJournalEntry()` + `updateJournalTable()` | Default |
| 5 | 📥 A/R | `receivables` | `updateARTable()` | Default |
| 6 | 📤 A/P | `payables` | `updateAPTable()` | Default |
| 7 | 🔗 Consolidation | `consolidation` | `updateEliminationsTable()` + `updateConsolidationWorksheet()` | Default |
| 8 | 📑 Statements | `statements` | `updateEntitySelects()` + `generateStatements()` | Default |
| 9 | 🏛️ Tax Filings | `filings` | `updateFilingsList()` | Default |
| 10 | 📊 Reports | `reports` | `updateReports()` | Default |
| 11 | 🏦 SPV Dashboard | `spvDashboard` | `updateSPVDashboard()` (guarded) | Default |
| 12 | 📋 SPV Ledger | `spvLedger` | *(none explicit)* | Default |
| 13 | 🇬🇧 UK Accounting | `ukAccounting` | *(none)* | Default — **REMOVE** |
| 14 | 📈 SPV Reports | `spvReports` | `updateSPVReports()` (guarded) | Default |
| 15 | 🧾 Invoicing | `invoicing` | *(setTimeout init)* | Green tint border |
| 16 | 👷 Payroll | `payroll` | *(setTimeout init)* | Blue tint border |
| 17 | 📦 Inventory | `inventory` | *(setTimeout init)* | Yellow tint border |
| 18 | 📈 Budget & Forecast | `budgetForecast` | *(setTimeout init)* | Purple tint border |
| 19 | 🧮 Tax Estimator | `taxEstimator` | *(setTimeout init)* | Red tint border |
| 20 | 💳 Payment Orders | `paymentOrders` | *(setTimeout init)* | Cyan bold border |
| 21 | 📜 Bills of Exchange | `billsOfExchange` | *(setTimeout init)* | Yellow bold border |
| 22 | 🧾 Expense Itemization | `expenses` | *(setTimeout init)* | Red tint border |
| 23 | 👥 Customers & Vendors | `customers` | *(setTimeout init)* | Green tint border |
| 24 | 📋 Schedule A Detail | `scheduleA` | *(setTimeout init)* | Purple tint border |
| 25 | 🏗️ Asset Depreciation | `depreciation` | *(setTimeout init)* | Yellow tint border |
| 26 | 🏦 Bank Reconciliation | `bankRecon` | *(setTimeout init)* | Cyan tint border |
| 27 | 📑 MASTER REPORT | `masterReport` | `generateMasterReport()` (guarded) | Gradient green/blue, bold |
| 28 | ⚖️ GAAP Agent | `gaapAgent` | *(none - user-triggered)* | Gradient green, bold |
| 29 | 🏛️ Financial Assets | `financialAssets` | `initFinancialAssets()` (guarded) | Gradient blue/purple, bold |
| 30 | 🎙️ Voice & Chat | `voiceChat` | `initVoiceChat()` (guarded) | Gradient yellow/red, bold |
| 31 | 📄 Document Creator | `docCreator` | `initDocCreator()` (guarded) | Gradient cyan/blue, bold |
| 32 | 📁 Source Folders | `sourceFolders` | *(setTimeout init)* | Purple tint border |
| | **Group 9: RedressRight Source Libraries** | | | |
| 33 | ⚖️ Constitutional Challenges | `cpsa` | `initCPSA()` (guarded) | Cyan bold border |
| 34 | 💰 Tax Refund Calculator | `trcf` | `initTRCF()` (guarded) | Red tint border |
| 35 | 📊 NOL Classification | `ccsn` | `initCCSN()` (guarded) | Amber bold border |
| 36 | 🏛️ Federal Damages | `fdrf` | `initFDRF()` (guarded) | Green bold border |
| 37 | 📓 Tutorial Journal | `eeej` | `initEEEJ()` (guarded) | Yellow bold border |
| 38 | 🔍 Entity Verifier | `entityVerifier` | `initEntityVerifier()` (guarded) | Blue bold border |

---

## 3. TAB NAVIGATION FLOW

```
switchMainTab(tabName)
├── ALL TABS: hide .form-section, show #{tabName}Section, update active button
│
├── ledger ──────────→ loadEntries()
│                      └── Renders ledger table, updates totalDebit/totalCredit/netBalance
│
├── entities ────────→ updateEntitiesTable()
│                      └── Renders entity cards with status badges
│
├── coa ─────────────→ updateCOATable()
│                      └── Renders 68+ COA rows, filter by type
│
├── journal ─────────→ initJournalEntry() + updateJournalTable()
│                      ├── initJournalEntry(): populates entity/account dropdowns
│                      └── updateJournalTable(): renders all journal entries with expand/collapse
│
├── receivables ─────→ updateARTable()
│                      └── Renders A/R aging table
│
├── payables ────────→ updateAPTable()
│                      └── Renders A/P aging table
│
├── consolidation ───→ updateEliminationsTable() + updateConsolidationWorksheet()
│                      ├── updateEliminationsTable(): renders intercompany elimination entries
│                      └── updateConsolidationWorksheet(): Trial Balance + eliminations = consolidated
│
├── statements ──────→ updateEntitySelects() + generateStatements()
│                      ├── updateEntitySelects(): populates entity filter dropdown
│                      └── generateStatements(): Trial Balance, Income Statement, Balance Sheet
│
├── filings ─────────→ updateFilingsList()
│                      └── Shows 7 filing type cards (1120, 990, 1041, 1041-ES, 1040, 1040-ES, SchC)
│                          └── selectFilingType(type) → shows specific form
│
├── reports ─────────→ updateReports()
│                      └── Summary stats across all modules
│
├── spvDashboard ────→ spvUpdateDashboard()
│                      └── Total assets, TCU total, token total, recent activity table
│
├── spvReports ──────→ (SPV trial balance + asset summary)
│
├── masterReport ────→ generateMasterReport()
│                      └── Pulls from ALL modules into consolidated PDF-ready report
│
├── financialAssets ──→ initFinancialAssets()
│                      └── Loads panels: Authority, Arbitration, Securities, Tax Payment, NOL, Calculator, Rebuttals, Forms, Validation
│
├── voiceChat ───────→ initVoiceChat()
│                      └── SpeechRecognition + SpeechSynthesis + Anthropic API chat
│
├── docCreator ──────→ initDocCreator()
│                      └── Document template selection + PDF generation
│
├── cpsa ────────────→ initCPSA()
│                      └── 12 constitutional challenge templates, rich text editor, save/load/export
│
├── trcf ────────────→ initTRCF()
│                      └── 7 sub-tabs, Route 1/Route 2 tax refund calculators (2024 brackets)
│
├── ccsn ────────────→ initCCSN()
│                      └── 72-slide NOL asset classification, prev/next navigation, TOC
│
├── fdrf ────────────→ initFDRF()
│                      └── 4-part accordion, TTS via speakWithHighlight()
│
├── eeej ────────────→ initEEEJ()
│                      └── 28-slide tutorial journal, topic nav, progress tracking
│
└── entityVerifier ──→ initEntityVerifier()
                       └── SEC EDGAR verification, EIN cross-ref, detail modal, JSON export
```

---

## 4. BUTTON → FUNCTION ASSOCIATION (Per Tab)

### 4.1 Ledger Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Entry (form submit) | `form.addEventListener('submit')` | Inline handler | Creates entry object → `appData.ledgerEntries.push()` → `loadEntries()` → `saveToStorage()` |
| 🗑️ Delete (per row) | `onclick` | `deleteEntry(index)` | `showConfirm()` → `appData.ledgerEntries.splice()` → `loadEntries()` |
| Save Ledger | `onclick` | `saveLedger()` | `Blob()` → `saveAs()` (FileSaver.js) |
| Export CSV | `onclick` | `exportCSV()` | Builds CSV string → `Blob()` → `saveAs()` |
| Clear All | `onclick` | `showClearConfirm()` | `showConfirm()` → `appData.ledgerEntries = []` → `loadEntries()` |
| Export Ledger PDF | `onclick` | `exportToPDF('Ledger', ...)` | jsPDF → autoTable → `doc.save()` |

### 4.2 Entities Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Entity (form submit) | `onclick` | `addEntity()` | Reads form fields → `appData.entities.push()` → `updateEntitiesTable()` → `saveToStorage()` |
| Delete Entity (per card) | `onclick` | `deleteEntity(index)` | `showConfirm()` → `appData.entities.splice()` → `updateEntitiesTable()` |
| Edit Entity (per card) | `onclick` | `editEntity(index)` | Populates form with existing data, sets editing flag |
| Export Entities | `onclick` | `exportToPDF('Entities', ...)` | jsPDF export |

### 4.3 Chart of Accounts Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Type Filter Dropdown | `onchange` | `filterCOA()` | Filters `appData.chartOfAccounts` by type → re-renders table |
| Add Account (form) | `onclick` | `addAccount()` | Reads form → `appData.chartOfAccounts.push()` → `updateCOATable()` → `saveToStorage()` |
| Reset to Default | `onclick` | `resetCOA()` | `showConfirm()` → `appData.chartOfAccounts = [...defaultCOA]` → `updateCOATable()` |
| Export COA | `onclick` | `exportToPDF('Chart of Accounts', ...)` | jsPDF export |

### 4.4 Journal Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Line Item (+) | `onclick` | `addJournalLine()` | Appends new debit/credit row to entry form |
| Remove Line Item (−) | `onclick` | `removeJournalLine(index)` | Removes a line item row |
| Save Journal Entry | `onclick` | `saveJournalEntry()` | Validates debits=credits → `appData.journalEntries.push()` → `updateJournalTable()` → `saveToStorage()` |
| Entry Type Select | `onchange` | *(inline)* | Sets entry type: Standard, Adjusting, Closing, Reversing |
| Entity Select | `onchange` | *(inline)* | Associates entry with entity |
| Expand/Collapse Entry | `onclick` | `toggleJournalDetail(id)` | Shows/hides line items for an entry |
| Delete Entry | `onclick` | `deleteJournalEntry(index)` | `showConfirm()` → splice → update |
| Export Journal | `onclick` | `exportToPDF('Journal', ...)` | jsPDF export |

### 4.5 A/R (Receivables) Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Receivable | `onclick` | `addReceivable()` | Form → `appData.receivables.push()` → `updateARTable()` → `saveToStorage()` |
| Mark as Paid | `onclick` | `markARPaid(index)` | Sets status → creates journal entry (debit Cash, credit A/R) |
| Delete | `onclick` | `deleteAR(index)` | `showConfirm()` → splice → update |
| Export A/R Aging | `onclick` | `exportToPDF('AR Aging', ...)` | jsPDF with aging buckets |

### 4.6 A/P (Payables) Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Payable | `onclick` | `addPayable()` | Form → `appData.payables.push()` → `updateAPTable()` → `saveToStorage()` |
| Mark as Paid | `onclick` | `markAPPaid(index)` | Sets status → creates journal entry (debit A/P, credit Cash) |
| Delete | `onclick` | `deleteAP(index)` | `showConfirm()` → splice → update |
| Export A/P Aging | `onclick` | `exportToPDF('AP Aging', ...)` | jsPDF with aging buckets |

### 4.7 Consolidation Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Elimination | `onclick` | `addElimination()` | Form → `appData.eliminations.push()` → `updateEliminationsTable()` |
| Delete Elimination | `onclick` | `deleteElimination(index)` | splice → update |
| Generate Worksheet | `onclick` | `updateConsolidationWorksheet()` | Computes per-entity Trial Balance + eliminations = consolidated figures |
| Export Consolidated | `onclick` | `exportToPDF('Consolidation', ...)` | jsPDF export |

### 4.8 Statements Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Entity Filter | `select.onchange` | `generateStatements()` | Filters by entity, regenerates all 3 statements |
| Generate | `onclick` | `generateStatements()` | → `generateTrialBalance()` + `generateIncomeStatement()` + `generateBalanceSheet()` |
| Export Trial Balance | `onclick` | `exportToPDF('Trial Balance', ...)` | jsPDF |
| Export Income Stmt | `onclick` | `exportToPDF('Income Statement', ...)` | jsPDF |
| Export Balance Sheet | `onclick` | `exportToPDF('Balance Sheet', ...)` | jsPDF |

### 4.9 Tax Filings Tab

#### Filing Type Selector (7 cards)

| Card | data-filing | Handler | Shows Form |
|---|---|---|---|
| Form 1120 (Corporate) | `1120` | `selectFilingType('1120')` | `#form1120` |
| Form 990 (Nonprofit) | `990` | `selectFilingType('990')` | `#form990` |
| Form 1041 (Trust/Estate) | `1041` | `selectFilingType('1041')` | `#form1041` |
| Form 1041-ES (Est. Tax) | `1041-ES` | `selectFilingType('1041-ES')` | `#form1041ES` |
| Form 1040 (Individual) | `1040` | `selectFilingType('1040')` | `#form1040` |
| Form 1040-ES (Est. Tax) | `1040-ES` | `selectFilingType('1040-ES')` | `#form1040ES` |
| Schedule C (Self-Emp) | `SchC` | `selectFilingType('SchC')` | `#formSchC` |

#### Per-Form Buttons

| Form | Button | Function | Key Sub-functions |
|---|---|---|---|
| **1120** | Calculate | `calculate1120()` | `calcCorpTax(taxableIncome)` → bracket-based, subsidiary aggregation |
| **1120** | Save | `save1120()` | Pushes to `appData.filings['1120']` → `saveToStorage()` |
| **1120** | Add Subsidiary | `addSubsidiary()` | Appends subsidiary input row |
| **1120** | Export | `export1120()` | `exportToPDF()` or `exportToWord()` |
| **990** | Calculate | `calculate990()` | Revenue − Expenses = Net, program efficiency ratio |
| **990** | Save / Export | `save990()` / `export990()` | Same pattern as 1120 |
| **1041** | Calculate | `calculate1041()` | Trust brackets (2024): 10%→37%, $100 exemption (trust) or $600 (estate) |
| **1041** | Save / Export | `save1041()` / `export1041()` | Same pattern |
| **1041-ES** | Calculate | `calculate1041ES()` | Quarterly estimated tax = total/4 |
| **1040** | Calculate | `calculate1040()` | Filing status brackets (Single/MFJ/MFS/HOH), standard deduction, credits |
| **1040-ES** | Calculate | `calculate1040ES()` | Quarterly estimated based on prior year or current estimate |
| **SchC** | Calculate | `calculateSchC()` | Gross − COGS − Expenses = Net Profit, SE Tax (15.3% of 92.35%) |
| **SchC** | Home Office | `calcHomeOffice()` | Simplified ($5/sqft, max 300) or regular method |

### 4.10 Reports Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Generate Report | `onclick` | `updateReports()` | Aggregates stats from all modules |
| Export All (JSON) | `onclick` | `exportAllData('json')` | `JSON.stringify(appData)` → `saveAs()` |
| Export All (PDF) | `onclick` | `exportAllData('pdf')` | jsPDF multi-section |
| Export All (Word) | `onclick` | `exportAllData('word')` | HTML-based .doc |
| Export All (CSV) | `onclick` | `exportAllData('csv')` | `exportToCSV()` |

### 4.11 SPV Dashboard Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Entry | `onclick` | `spvShowForm()` | Shows entry form (date, type, desc, debit/credit accts, amount, currency, status) |
| Save Entry | `onclick` | `spvSaveEntry()` | Validates → push/update → `spvSave()` → `spvRenderLedger()` → `spvUpdateDashboard()` |
| Edit Entry | `onclick` | `spvShowForm(id)` | Populates form with existing entry |
| Delete Entry | `onclick` | `spvDeleteEntry(id)` | `confirm()` → filter out → save → re-render |
| Cancel Form | `onclick` | `spvHideForm()` | Hides entry form |

### 4.12 SPV Ledger Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Filter (Type, Date range) | `onclick` | `spvApplyFilters()` | Sets `spvActiveFilter` → `spvRenderLedger()` |
| Reset Filters | `onclick` | `spvResetFilters()` | Clears filter → re-render |
| Export CSV | `onclick` | `spvExportCSV()` | Builds CSV → Blob → saveAs |
| Export PDF | `onclick` | `spvExportPDF()` | jsPDF → autoTable |

### 4.13 SPV Reports Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Generate Trial Balance | `onclick` | `generateSPVTrialBalance()` | Aggregates debits/credits per account → balanced check |
| Generate Asset Summary | `onclick` | `generateSPVAssetSummary()` | Groups by type → count + total |

### 4.14 Invoicing Tab (setTimeout 0ms init)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Create Invoice | `onclick` | `createInvoice()` | Form → invoice object → render |
| Add Line Item | `onclick` | `addInvoiceLine()` | Appends row |
| Calculate Total | `oninput` | `calcInvoiceTotal()` | Sum(qty * rate) + tax |
| Mark Paid | `onclick` | `markInvoicePaid(id)` | Status update |
| Export Invoice PDF | `onclick` | `exportInvoicePDF(id)` | jsPDF formatted invoice |

### 4.15 Payroll Tab (setTimeout 0ms init)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Employee | `onclick` | `addEmployee()` | Form → employee record |
| Run Payroll | `onclick` | `runPayroll()` | Calculates gross, federal/state tax, FICA, Medicare, net |
| Export Payroll | `onclick` | `exportPayrollPDF()` | jsPDF |

### 4.16 Inventory Tab (setTimeout 0ms init)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Item | `onclick` | `addInventoryItem()` | Form → inventory record |
| Adjust Qty | `onclick` | `adjustInventory(id)` | Quantity +/- |
| FIFO/LIFO/Avg toggle | `onchange` | `setInventoryMethod()` | Recalculates COGS |

### 4.17 Budget & Forecast Tab (setTimeout 300ms init)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Set Budget | `onclick` | `setBudgetLine()` | Category + monthly amounts |
| Forecast | `onclick` | `generateForecast()` | Trend projection |
| Variance Report | `onclick` | `calcVariance()` | Budget vs actual comparison |

### 4.18 Tax Estimator Tab (setTimeout 300ms init)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Calculate Estimate | `onclick` | `calcTaxEstimate()` | Combined federal + state + SE tax |
| Filing Status Select | `onchange` | *(inline)* | Adjusts brackets |
| What-If Scenarios | `onclick` | `runTaxScenario()` | Adjustable income/deduction sliders |
| Import 1099 Data | `onclick` | `import1099ToEstimator()` | Preview modal → `apply1099ToEstimator()` sets income fields + additive withholding |
| 1099 Aggregation | internal | `aggregate1099Data()` | Shared: sums all `appData.filings` 1099 types into investment/capGains/SE/rental/other/withholding |

### 4.19 Payment Orders Tab (setTimeout 0ms init)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Create Payment Order | `onclick` | `createPaymentOrder()` | Structured payment record |
| Generate PDF | `onclick` | `exportPaymentOrderPDF(id)` | jsPDF formatted payment order |

### 4.20 Bills of Exchange Tab (setTimeout 0ms init)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Create BOE | `onclick` | `createBOE()` | Bill of exchange record |
| Generate PDF | `onclick` | `exportBOEPDF(id)` | jsPDF formatted BOE |
| Separate localStorage | — | `localStorage('RR_BOE')` | Independent persistence |

### 4.21 Expense Itemization Tab (setTimeout 300ms init)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Expense | `onclick` | `addExpense()` | Category, amount, receipt, date |
| Photo Receipt | `onclick` | `captureReceipt()` | File input for receipt image |
| Category Totals | auto | `calcExpenseTotals()` | Groups by category |
| Export | `onclick` | `exportExpensesPDF()` | jsPDF |
| Separate localStorage | — | `localStorage('RR_Expenses')` | Independent persistence |

### 4.22 Customers & Vendors Tab (setTimeout 300ms init)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Customer | `onclick` | `addCustomer()` | Contact record |
| Add Vendor | `onclick` | `addVendor()` | Contact record |
| Toggle View | `onclick` | `toggleCustomerVendor()` | Switches between customer/vendor lists |
| Separate localStorage | — | `localStorage('RR_Customers')` + `localStorage('RR_Vendors')` | Independent persistence |

### 4.23 Schedule A Detail Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Deduction Item | `onclick` | `addScheduleAItem()` | Category + amount |
| Calculate Total | `onclick` | `calcScheduleA()` | Sum by category, compare to standard deduction |
| Export | `onclick` | `exportScheduleAPDF()` | jsPDF |

### 4.24 Asset Depreciation Tab (setTimeout 300ms init)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Asset | `onclick` | `addDepreciationAsset()` | Name, cost, salvage, life, method |
| Method Select | `onchange` | *(inline)* | Straight-line, MACRS, Double-declining |
| Calculate Schedule | `onclick` | `calcDepreciation(id)` | Year-by-year depreciation table |
| Section 179 Election | `checkbox` | `toggleSection179()` | Full first-year deduction option |

### 4.25 Bank Reconciliation Tab (setTimeout 500ms init)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Start Reconciliation | `onclick` | `startRecon()` | Bank balance + book balance inputs |
| Mark Cleared | `onclick` | `markCleared(id)` | Checks off transaction |
| Calculate Difference | auto | `calcReconDiff()` | Bank adjusted − Book adjusted = difference |
| Export Reconciliation | `onclick` | `exportReconPDF()` | jsPDF |
| Separate localStorage | — | `localStorage('RR_Reconciliations')` | Independent persistence |

### 4.26 MASTER REPORT Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Generate | `onclick` | `generateMasterReport()` | Pulls from ALL modules: ledger entries, journal summaries, entity list, A/R/A/P aging, tax filing summaries, SPV totals, statements |
| Export PDF | `onclick` | `exportMasterPDF()` | Multi-page jsPDF with all sections |
| Export Word | `onclick` | `exportMasterWord()` | HTML-based .doc |

### 4.27 GAAP Agent Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Send Query | `onclick` | `sendGaapAgentQuery()` | **REMOTE**: `fetch('https://api.anthropic.com/v1/messages')` with `GAAP_AGENT_SYSTEM_PROMPT` |
| API Key Input | `oninput` | *(saves to var)* | Stores API key in memory (not persisted) |
| Clear History | `onclick` | `clearAgentHistory()` | Empties conversation array |
| Copy Response | `onclick` | `copyToClipboard(text)` | `navigator.clipboard.writeText()` |

### 4.28 Financial Assets Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Panel Tabs (7 panels) | `onclick` | `showFAPanel(panelId)` | Hides all `.fap`, shows target: authority, arbitration, securities, taxpay, nol, alloc, rebuttals, forms, validation |
| Allocation Presets (4) | `onclick` | `setAlloc(nol%, pay%, inc%)` | Sets 20/70/10, 30/60/10, 10/80/10, 25/65/10 |
| Calculate | `oninput` | `calcFA()` | Award + Expense → NOL allocation, payment allocation, income allocation at tax rate |
| All number inputs | `oninput` | `calcFA()` | Real-time recalculation |

### 4.29 Voice & Chat Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Start Recording | `onclick` | `startVoiceRecording()` | `SpeechRecognition.start()` → transcribes to text |
| Stop Recording | `onclick` | `stopVoiceRecording()` | `SpeechRecognition.stop()` |
| Send Chat | `onclick` | `sendChat()` | **REMOTE**: `fetch('https://api.anthropic.com/v1/messages')` |
| Toggle Voice Output | `onclick` | `toggleVoiceOutput()` | Enables/disables `SpeechSynthesis.speak()` on responses |
| Clear Chat | `onclick` | `clearChat()` | Empties chat history array + DOM |
| Separate localStorage | — | `localStorage('vcHistory')` + `localStorage('vcStats')` | Independent persistence |

### 4.30 Document Creator Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Template Select | `onchange` | `loadDocTemplate(type)` | Populates form fields for selected document type |
| Generate Document | `onclick` | `generateDocument()` | Fills template → HTML preview |
| Export PDF | `onclick` | `exportDocPDF()` | jsPDF |
| Export Word | `onclick` | `exportDocWord()` | HTML-based .doc |

### 4.31 Source Folders Tab (setTimeout 500ms init)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Add Folder | `onclick` | `addSourceFolder()` | Name + path + description |
| Edit Folder | `onclick` | `editSourceFolder(id)` | Modifies existing |
| Delete Folder | `onclick` | `deleteSourceFolder(id)` | Removes |
| Category Filter | `onchange` | `filterSourceFolders()` | Filters by category |

### 4.32 Constitutional Challenges Tab (CPSA)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Template Select (12) | `onclick` | `cpsaSelectTemplate(type)` | Loads constitutional challenge template into rich text editor |
| Bold / Italic / Underline | `onclick` | `cpsaCmd('bold'\|'italic'\|'underline')` | `document.execCommand()` formatting |
| Insert Citation | `onclick` | `cpsaInsertCitation(type)` | Inserts legal citation block (USC, CFR, Case Law) |
| Set Font Size | `onchange` | `cpsaSetFontSize(size)` | Changes editor font size |
| Set Case | `onclick` | `cpsaSetCase(type)` | Transforms text: uppercase, lowercase, title case |
| Save Draft | `onclick` | `cpsaSave()` | localStorage persist |
| Load Draft | `onclick` | `cpsaLoad()` | Restores from localStorage |
| Export PDF | `onclick` | `cpsaExportPDF()` | jsPDF export |
| Export Word | `onclick` | `cpsaExportWord()` | HTML-based .doc export |
| Print | `onclick` | `cpsaPrint()` | `window.print()` |
| View Source | `onclick` | `cpsaViewSource()` | Shows raw HTML of editor content |
| Clean HTML | `onclick` | `cpsaCleanHTML()` | Strips unnecessary formatting |

### 4.33 Tax Refund Calculator Tab (TRCF)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Sub-tab Buttons (7) | `onclick` | `trcfSwitchTab(tabName)` | Switches between 7 calculator sub-tabs |
| Route Select (1/2) | `onclick` | `trcfSelectRoute(routeNum)` | Toggles Route 1 vs Route 2 calculator view |
| Route 1 Calculate | `onclick` | `trcfCalculateRoute1()` | Standard refund with 2024 individual/trust brackets |
| Route 2 Calculate | `onclick` | `trcfCalculateRoute2()` | Alternative method refund calculation |
| Interest Calculator | `onclick` | `trcfCalcInterestUI()` | `trcfCalcInterest(principal, rate, days)` — simple interest |
| Number Formatter | auto | `trcfFmt(n)` | Currency formatting helper |
| Tax Bracket Engine | internal | `trcfCalcTax(income, status)` | 2024 brackets: Single, MFJ, MFS, HOH |
| Trust Tax Engine | internal | `trcfCalcTrustTax(income)` | 2024 trust brackets: 10%→37% |
| Import 1099 Data (Route 1) | `onclick` | `import1099ToTRCF()` | Preview modal → `apply1099ToTRCF()` sets gross income + additive withholding |
| Live 1099 Summary | auto (tab switch) | `updateTRCF1099Summary()` | Shows filing counts + totals on 1099/1065 Mechanics sub-tab |

### 4.34 NOL Classification Tab (CCSN)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Next Slide | `onclick` | `ccsnNext()` | `ccsnShowSlide(ccsnCurrentSlide + 1)` |
| Prev Slide | `onclick` | `ccsnPrev()` | `ccsnShowSlide(ccsnCurrentSlide - 1)` |
| Jump to Slide | `onclick` | `ccsnJumpTo(n)` | Direct slide navigation from TOC |
| TOC Toggle | `onclick` | `ccsnToggleTOC()` | Shows/hides table of contents panel |
| TOC Update | auto | `ccsnUpdateTOC(n)` | Highlights current slide in TOC |
| Slide Counter | auto | — | Displays "Slide X of 72" |

### 4.35 Federal Damages Tab (FDRF)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Part Toggle (4 parts) | `onclick` | `fdrfTogglePart(partNum)` | Expand/collapse major damage framework sections |
| Accordion Headers | `onclick` | `fdrfToggleAccordion(el)` | Expand/collapse individual accordion items within parts |
| Read Section Aloud | `onclick` | `fdrfReadSection(sectionId)` | `speakWithHighlight(text)` — TTS via existing utility |

### 4.36 Tutorial Journal Tab (EEEJ)

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Next Slide | `onclick` | `eeejNext()` | Advances to next slide, updates progress |
| Prev Slide | `onclick` | `eeejPrev()` | Returns to previous slide |
| Jump to Slide | `onclick` | `eeejJumpTo(index)` | Direct slide navigation from topic list |
| Render Slide | internal | `eeejRenderSlide(index)` | Builds slide HTML from data array |
| Progress Update | auto | `eeejUpdateProgress()` | Updates progress bar and "X of 28" counter |

### 4.37 Entity Verifier Tab

| Button/Element | Handler | Function | Sub-functions |
|---|---|---|---|
| Verify All | `onclick` | `runEntityVerification()` | Loops entities, calls `verifyEntity()` per entity, updates progress bar |
| Export JSON | `onclick` | `exportVerifierResults('json')` | Exports masked verification results as JSON file download |
| Summary Cards | `onclick` | `filterVerifierResults(level)` | Filters table by confidence: all/HIGH/MEDIUM/LOW/UNVERIFIED |
| Search Input | `oninput` | `filterVerifierResults()` | Filters by entity name, EIN, or account number |
| Table Row Click | `onclick` | `showVerifierDetail(idx)` | Opens modal with TMAR record, SEC data, filings, recommended actions |
| SEC EDGAR Ticker | internal | `edgarLookupByTicker(ticker)` | Fetches `sec.gov/files/company_tickers.json` |
| SEC EDGAR Name | internal | `edgarLookupByName(name)` | Searches ticker JSON by company name substring |
| SEC EDGAR CIK | internal | `edgarGetSubmissions(cik)` | Fetches `data.sec.gov/submissions/CIK{padded}.json` |
| SEC EDGAR EIN | internal | `edgarSearchByEIN(ein)` | Full-text EIN search via `efts.sec.gov/LATEST/search-index` |
| Verify Entity | internal | `verifyEntity(entity)` | Core engine: ticker → name → EIN search, confidence scoring |

---

## 5. CORE FUNCTIONS BREAKDOWN

### 5.1 Data Layer

| Function | Line | Purpose | Called By |
|---|---|---|---|
| `loadFromStorage()` | ~5254 | Loads `TMAR_AccrualLedger_Data` from localStorage, merges with defaults | App init (once) |
| `saveToStorage()` | ~5290 | JSON.stringify → localStorage.setItem + timestamp | Auto-save interval, manual save, every CRUD op |
| `maskEIN(ein)` | ~5272 | Masks EIN to last 4 digits: `'41-6809588'` → `'••-•••9588'` | `updateHeaderSubtitle()`, `buildTrustAgentSystemPrompt()` |
| `updateHeaderSubtitle()` | ~5280 | Refreshes `#headerTrustSubtitle` from `appData.settings` with masked EIN | App init (after `loadFromStorage()`) |
| `buildTrustAgentSystemPrompt()` | ~10397 | Builds AI system prompt dynamically from `appData.settings` with masked EIN | `sendTrustAgentQuery()`, `sendChat()` |
| `showAutoSaveStatus(msg, isError)` | ~5305 | Fixed-position toast (bottom-right), fades after 2s | `loadFromStorage()`, `saveToStorage()` |
| `applyTheme()` | ~3886 | Adds/removes `.dark` on `<html>`, updates icon | `toggleDarkMode()`, init |
| `toggleDarkMode()` | ~3895 | Flips `isDarkMode`, persists to localStorage | Header toggle button |

### 5.2 Modal System

| Function | Line | Purpose | Called By |
|---|---|---|---|
| `showModal(content)` | ~4328 | Creates modal overlay with content HTML | `showAlert()`, `showConfirm()` |
| `closeModal()` | ~4339 | Empties modal container | Modal buttons, overlay click |
| `showAlert(msg, title)` | ~4343 | Info modal with OK button | Success/error notifications |
| `showConfirm(msg, onConfirm, title)` | ~4353 | Confirmation modal with Cancel/Confirm | Delete operations, clear data |

### 5.3 Export System

| Function | Line | Purpose | Dependencies |
|---|---|---|---|
| `exportToPDF(title, data, columns)` | ~3995 | Generic PDF export | **CDN**: jsPDF 2.5.1, autoTable 3.5.31 |
| `exportToWord(title, htmlContent)` | ~4021 | HTML-based .doc export | **CDN**: FileSaver.js 2.0.5 |
| `exportToCSV(title, data, columns)` | *(inline)* | CSV with UTF-8 BOM | **CDN**: FileSaver.js |
| `exportAllData(format)` | ~4053 | Routes to JSON/PDF/Word/CSV | All above |
| `handleExport(format)` | ~4146 | Dropdown handler | Header export dropdown |
| `previewData()` | ~4153 | Opens new window with formatted HTML | `window.open()` |
| `importData(event)` | ~4205 | FileReader → JSON.parse → merge | File input handler |

### 5.4 Tax Calculators

| Function | Tax Form | Key Calculation | Brackets (2024) |
|---|---|---|---|
| `calculate1120()` | Form 1120 | Corporate flat 21% | 21% flat rate |
| `calculate990()` | Form 990 | Revenue − Expenses, UBIT if applicable | 21% on UBIT |
| `calculate1041()` | Form 1041 | Trust/Estate graduated brackets | $0-$3,100 (10%), $3,100-$11,150 (24%), $11,150-$15,200 (35%), $15,200+ (37%) |
| `calculate1041ES()` | Form 1041-ES | Annual ÷ 4 = quarterly | Same as 1041 |
| `calculate1040()` | Form 1040 | Individual graduated brackets (4 filing statuses) | 10%/12%/22%/24%/32%/35%/37% |
| `calculate1040ES()` | Form 1040-ES | Annual ÷ 4 = quarterly | Same as 1040 |
| `calculateSchC()` | Schedule C | Gross − COGS − Expenses = Net Profit, SE = 15.3% of 92.35% of net | SE Tax: 12.4% SS (up to $168,600) + 2.9% Medicare |
| `calcHomeOffice()` | Schedule C | Simplified: $5/sqft × sqft (max 300) or Regular: % of expenses | — |
| `calcCorpTax(income)` | Helper | 21% flat rate calculation | 21% |
| `calcFA()` | Financial Assets | Award + Expense → allocation at tax rate | User-defined rate |
| `calcTaxEstimate()` | Tax Estimator | Combined federal + state + SE | Multiple brackets |

### 5.5 Financial Statements

| Function | Output | Data Source |
|---|---|---|
| `generateTrialBalance()` | All accounts with debit/credit totals, balanced check | `appData.journalEntries` + `appData.chartOfAccounts` |
| `generateIncomeStatement()` | Revenue − Expenses = Net Income | Journal entries filtered by revenue/expense accounts |
| `generateBalanceSheet()` | Assets = Liabilities + Equity | Journal entries filtered by asset/liability/equity accounts |
| `generateStatements()` | Calls all 3 above | Statements tab init |
| `generateSPVTrialBalance()` | SPV-specific trial balance | `spvData.entries` |
| `generateSPVAssetSummary()` | SPV asset types grouped | `spvData.entries` |
| `generateMasterReport()` | All-modules consolidated | Everything |

### 5.6 Remote / External Calls

| Function | Endpoint | Method | Auth | Purpose |
|---|---|---|---|---|
| `sendTrustAgentQuery()` | `https://api.anthropic.com/v1/messages` | POST | `x-api-key` header (user-provided) | GAAP accounting Q&A; system prompt built dynamically via `buildTrustAgentSystemPrompt() + TRUST_AGENT_PROMPT_BODY` |
| `sendChat()` | `https://api.anthropic.com/v1/messages` | POST | `x-api-key` header (user-provided) | Voice & Chat conversational AI; same dynamic prompt builder |
| `edgarLookupByTicker()` / `edgarLookupByName()` | `https://www.sec.gov/files/company_tickers.json` | GET | `User-Agent` header | Entity Verifier: look up CIK by ticker symbol or company name |
| `edgarGetSubmissions()` | `https://data.sec.gov/submissions/CIK{padded}.json` | GET | `User-Agent` header | Entity Verifier: fetch entity details, address, EIN, filings |
| `edgarSearchByEIN()` | `https://efts.sec.gov/LATEST/search-index` | GET | `User-Agent` header | Entity Verifier: full-text EIN search in 10-K/10-Q/8-K filings |

**Browser APIs Used:**
- `SpeechRecognition` (Web Speech API) — voice input transcription
- `SpeechSynthesis` (Web Speech API) — text-to-speech responses
- `navigator.clipboard.writeText()` — copy to clipboard
- `window.open()` — print preview

---

## 6. INITIALIZATION SEQUENCE

```
Page Load
├── CSS loads (lines 12-186)
│   └── CSS variables, dark/light mode, glass morphism, responsive
│
├── HTML renders (lines 189-3850)
│   └── RedressRight nav, app header, 37 tab buttons, 37 tab sections
│
├── <script> executes (line 3877+)
│   ├── Theme init: isDarkMode from localStorage → applyTheme()
│   ├── Data init: appData = loadFromStorage()
│   ├── Header refresh: updateHeaderSubtitle() — masked EIN from settings
│   ├── Auto-save: setInterval(saveToStorage, 5000)
│   ├── Unload save: window.addEventListener('beforeunload', saveToStorage)
│   ├── Default COA: defaultCOA[] (68 accounts)
│   ├── DOM refs: form, ledgerBody, totalDebit, totalCredit, netBalance
│   ├── Ledger form listener: form.addEventListener('submit', ...)
│   ├── loadEntries() — initial ledger render
│   │
│   ├── setTimeout(0ms):
│   │   ├── initSPV() — SPV data structure + dashboard
│   │   ├── initInvoicing() — Invoice module
│   │   ├── initPayroll() — Payroll module
│   │   ├── initInventory() — Inventory module
│   │   ├── initPaymentOrders() — Payment Orders module
│   │   └── initBillsOfExchange() — BOE module
│   │
│   ├── setTimeout(300ms):
│   │   ├── initExpenses() — Expense tracker
│   │   ├── initCustomersVendors() — Contacts
│   │   ├── initDepreciation() — Asset depreciation
│   │   ├── initBudgetForecast() — Budget & Forecast
│   │   └── initTaxEstimator() — Tax Estimator
│   │
│   └── setTimeout(500ms):
│       ├── initSourceFolders() — Source folder manager
│       └── initBankRecon() — Bank reconciliation
```

---

## 7. localStorage KEYS

| Key | Scope | Used By |
|---|---|---|
| `TMAR_AccrualLedger_Data` | Main app data (all core modules) | `loadFromStorage()` / `saveToStorage()` |
| `darkMode` | Theme preference | `toggleDarkMode()` / `applyTheme()` |
| `RR_BOE` | Bills of Exchange | BOE module |
| `RR_Expenses` | Expense Itemization | Expenses module |
| `RR_Customers` | Customer records | Customers & Vendors module |
| `RR_Vendors` | Vendor records | Customers & Vendors module |
| `RR_Assets` | Financial Assets calc state | Financial Assets module |
| `RR_Reconciliations` | Bank reconciliation data | Bank Recon module |
| `vcHistory` | Voice & Chat history | Voice & Chat module |
| `vcStats` | Voice & Chat statistics | Voice & Chat module |
| `cpsa_draft` | CPSA editor draft content | Constitutional Challenges module |

**Pending Renames:**
- `RR_*` prefix → `TMAR_*` prefix (future cleanup)
- `darkMode` → keep as-is (generic)

---

## 8. CDN DEPENDENCIES

| Library | Version | CDN URL | Used For |
|---|---|---|---|
| Tailwind CSS | 2.2.19 | `cdn.tailwindcss.com` | Utility classes throughout |
| jsPDF | 2.5.1 | `cdnjs.cloudflare.com/.../jspdf.umd.min.js` | PDF generation |
| jsPDF-AutoTable | 3.5.31 | `cdnjs.cloudflare.com/.../jspdf.plugin.autotable.min.js` | PDF table formatting |
| FileSaver.js | 2.0.5 | `cdnjs.cloudflare.com/.../FileSaver.min.js` | File download triggers |
| JetBrains Mono | — | Google Fonts | Monospace font (→ replace with Calibri) |
| Space Grotesk | — | Google Fonts | UI font (→ replace with Calibri) |

---

## 9. TMAR ADAPTATION NOTES

### Tabs to Remove
- `ukAccounting` (1 tab removed → 36 remain)

### Tabs to Rename
- `spvDashboard` → `trustDashboard` (Trust Estate Dashboard)
- `spvLedger` → `trustLedger` (Trust Estate Ledger)
- `spvReports` → `trustReports` (Trust Estate Reports)
- `gaapAgent` → `trustAgent` (Trust Accounting Agent)

### Pre-populated Data & PII Security
- **Entities**: Defaults are empty placeholders; user enters trust name, EIN, trustee, CAF via Entities tab
- **EIN Masking**: `maskEIN()` shows only last 4 digits everywhere (header, AI prompt) — e.g. `••-•••9588`
- **Header**: `updateHeaderSubtitle()` refreshes on load from `appData.settings`; shows `[Trust Entity Name] — EIN ••-•••••••` for fresh installs
- **AI Prompt**: `buildTrustAgentSystemPrompt()` injects settings dynamically with masked EIN; replaces former hardcoded `TRUST_AGENT_SYSTEM_PROMPT` const
- **COA**: 68 default accounts (keep as-is, GAAP-standard)
- **Account Types**: 33 TMAR types for Ledger category dropdown
- **Statuses**: 9 TMAR statuses for entity status
- **Primary Users**: Clint, Syrina, Joint, Trust

### Color Palette Swap (CSS Variables)
| GAAP Original | → | TMAR |
|---|---|---|
| `--bg-primary: #0f172a` | → | `#0D1B2A` (darker variant of #1B2A4A) |
| `--bg-secondary: #1e293b` | → | `#1B2A4A` |
| `--accent-green: #10b981` | → | `#10b981` (keep — matches TMAR green) |
| `--accent-red: #ef4444` | → | `#ef4444` (keep — matches TMAR red) |
| `--accent-amber: #f59e0b` | → | `#f59e0b` (keep — matches TMAR yellow) |
| `--accent-blue: #3b82f6` | → | `#4A7FBF` (lighter variant of #1B2A4A) |
| JetBrains Mono | → | `Calibri, system-ui, sans-serif` |
| Space Grotesk | → | `Calibri, system-ui, sans-serif` |
