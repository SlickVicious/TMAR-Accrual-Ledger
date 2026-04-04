# TMAR Universal Accrual Ledger — User Manual

**Version:** 3.3 | **Author:** Clinton Wimberly IV | **File:** `TMAR-Accrual-Ledger.html`

**Live URL:** https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
   - 2.1 [How to Access the Application](#21-how-to-access-the-application)
   - 2.2 [First-Time Setup](#22-first-time-setup)
   - 2.3 [API Key Configuration](#23-api-key-configuration)
   - 2.4 [localStorage Keys Reference](#24-localstorage-keys-reference)
3. [Navigation](#3-navigation)
   - 3.1 [Main Navigation Tab Bar](#31-main-navigation-tab-bar)
   - 3.2 [E2ZERO Agent Sidebar](#32-e2zero-agent-sidebar)
   - 3.3 [Global Header Toolbar](#33-global-header-toolbar)
4. [Core Accounting Pages](#4-core-accounting-pages)
   - 4.1 [Ledger](#41-ledger)
   - 4.2 [Entities](#42-entities)
   - 4.3 [Chart of Accounts](#43-chart-of-accounts)
   - 4.4 [Journal](#44-journal)
5. [Receivables and Payables](#5-receivables-and-payables)
   - 5.1 [Accounts Receivable (A/R)](#51-accounts-receivable-ar)
   - 5.2 [Accounts Payable (A/P)](#52-accounts-payable-ap)
6. [Consolidation and Statements](#6-consolidation-and-statements)
   - 6.1 [Consolidation](#61-consolidation)
   - 6.2 [Statements](#62-statements)
7. [Tax and Compliance](#7-tax-and-compliance)
   - 7.1 [Tax Filings](#71-tax-filings)
   - 7.2 [Tax Estimator](#72-tax-estimator)
   - 7.3 [Schedule A Detail](#73-schedule-a-detail)
8. [Trust Estate Module](#8-trust-estate-module)
   - 8.1 [Trust Estate Dashboard](#81-trust-estate-dashboard)
   - 8.2 [Trust Estate Ledger](#82-trust-estate-ledger)
   - 8.3 [Trust Estate Reports](#83-trust-estate-reports)
8a. [SPV Module](#8a-spv-module)
   - 8a.1 [SPV Dashboard](#8a1-spv-dashboard)
   - 8a.2 [SPV Ledger](#8a2-spv-ledger)
   - 8a.3 [SPV Reports](#8a3-spv-reports)
8b. [UK Accounting](#8b-uk-accounting)
9. [Operations Pages](#9-operations-pages)
   - 9.1 [Invoicing](#91-invoicing)
   - 9.2 [Payroll](#92-payroll)
   - 9.3 [Inventory](#93-inventory)
   - 9.4 [Budget and Forecast](#94-budget-and-forecast)
   - 9.5 [Payment Orders](#95-payment-orders)
   - 9.6 [Bills of Exchange](#96-bills-of-exchange)
   - 9.7 [Expense Itemization](#97-expense-itemization)
   - 9.8 [Customers and Vendors](#98-customers-and-vendors)
   - 9.9 [Asset Depreciation](#99-asset-depreciation)
   - 9.10 [Bank Reconciliation](#910-bank-reconciliation)
10. [Reports and Intelligence](#10-reports-and-intelligence)
    - 10.1 [Reports](#101-reports)
    - 10.2 [Master Report](#102-master-report)
    - 10.3 [GAAPCLAW Master Agent](#103-gaapclaw-master-agent)
    - 10.4 [CPA Specialist Pages](#104-cpa-specialist-pages)
    - 10.5 [IRS Form Generator](#105-irs-form-generator)
11. [Settings and API Configuration](#11-settings-and-api-configuration)
    - 11.1 [Settings and API Page](#111-settings-and-api-page)
    - 11.2 [API Scout](#112-api-scout)
    - 11.3 [Voice and Chat](#113-voice-and-chat)
    - 11.4 [Parity Drift Notification System](#114-parity-drift-notification-system)
12. [Tools Pages](#12-tools-pages)
    - 12.1 [Financial Assets](#121-financial-assets)
    - 12.2 [Document Creator](#122-document-creator)
    - 12.3 [Source Folders](#123-source-folders)
13. [RedressRight Source Library Pages](#13-redressright-source-library-pages)
    - 13.1 [Constitutional Challenges (CPSA)](#131-constitutional-challenges-cpsa)
    - 13.2 [Tax Refund Calculator (TRCF)](#132-tax-refund-calculator-trcf)
    - 13.3 [NOL Classification (CCSN)](#133-nol-classification-ccsn)
    - 13.4 [Federal Damages (FDRF)](#134-federal-damages-fdrf)
    - 13.5 [Tutorial Journal (EEEJ)](#135-tutorial-journal-eeej)
14. [Verification and Data Integration](#14-verification-and-data-integration)
    - 14.1 [Entity Verifier](#141-entity-verifier)
    - 14.2 [Sync Center](#142-sync-center)
15. [PDKB Tools](#15-pdkb-tools)
    - 15.1 [Transcript Transformer](#151-transcript-transformer)
    - 15.2 [Etymology Analyzer](#152-etymology-analyzer)
    - 15.3 [PDF/MD Converter](#153-pdfmd-converter)
    - 15.4 [POA/DBA Generator](#154-poadba-generator)
16. [E2ZERO AI Agent Platform](#16-e2zero-ai-agent-platform)
    - 16.1 [Accessing the AI Sidebar](#161-accessing-the-ai-sidebar)
    - 16.2 [Agent Pages](#162-agent-pages)
    - 16.3 [Autonomous Tools](#163-autonomous-tools)
17. [Core Engines — Plain-English Reference](#17-core-engines--plain-english-reference)
    - 17.1 [GCMemory — IndexedDB Persistent Memory](#171-gcmemory--indexeddb-persistent-memory)
    - 17.2 [MEM0 — Memory Proxy Layer](#172-mem0--memory-proxy-layer)
    - 17.3 [OpenClawRuntime — Agent Registry](#173-openclawruntime--agent-registry)
    - 17.4 [HARD_LOCK — Output Sanitizer and Prompt Validator](#174-hard_lock--output-sanitizer-and-prompt-validator)
    - 17.5 [callLLMStream — Streaming Token Delivery](#175-callllmstream--streaming-token-delivery)
    - 17.6 [resolveProvider — Provider Resolver](#176-resolveprovider--provider-resolver)
    - 17.7 [askAgent — Agent Query Dispatcher](#177-askagent--agent-query-dispatcher)
18. [Appendix A — localStorage Keys Reference](#appendix-a--localstorage-keys-reference)
19. [Appendix B — Function Reference](#appendix-b--function-reference)

---

## 1. Introduction

The **TMAR Universal Accrual Ledger** is a self-contained, single-file HTML application that combines professional-grade double-entry accounting with a full AI legal and financial analysis platform. Everything runs in your browser — no installation, no server, no database subscription required.

### What it does

The application serves four primary functions:

1. **Full-spectrum accrual accounting.** Double-entry journal, chart of accounts, accounts receivable, accounts payable, bank reconciliation, asset depreciation, payroll, invoicing, budgeting, and multi-entity consolidation — all in one place.

2. **Trust and estate management.** A dedicated ledger, dashboard, and reporting module for managing trust assets, distributions, and fiduciary records under GAAP.

3. **Tax form preparation and estimation.** Fillable, auto-calculating versions of IRS Forms 1040, 1041, 1041-ES, 1120, 990, Schedule C, and the full 1099 series (A, B, C, INT, DIV, R, NEC, MISC). The Tax Estimator aggregates 1099 data from those forms automatically.

4. **AI legal and financial analysis.** The E2ZERO Agent Platform provides access to eleven specialized AI agents — Legal Expert, Tax Expert, Trust Specialist, Corporation Specialist, Arbitration Specialist, Research Analyst, Accounting Expert, Code Expert, Creative Writer, HTML Architect, and General Assistant — all powered by the SYPHER Protocol with the HARD_LOCK enforcement layer.

### Who it is for

- Trust administrators and fiduciaries who need both accounting and legal analysis tools
- Attorneys and paralegals working on tax-related matters, NOL claims, or federal damages
- Accountants and CPAs preparing federal tax filings for multiple entity types
- Individuals managing complex personal estates or multi-entity structures
- Researchers working with constitutional challenges, UCC claims, or IRS refund procedures

### Key design principles

- **Zero-dependency operation.** The file runs from a local file system (`file://` protocol) or GitHub Pages. No internet connection is required for accounting functions. AI features require a cloud provider API key or a local Ollama instance.
- **Persistent storage.** All accounting data is saved to `localStorage` automatically every five seconds. AI conversation memories are stored in an IndexedDB database named `GCMemory_v1` that survives browser restarts.
- **Immutable AI safety.** All AI output passes through the HARD_LOCK layer, which strips HTML tags, markdown formatting, AI disclaimers, and any attempt to impersonate legal counsel.

---

## 2. Getting Started

### 2.1 How to Access the Application

**Online (GitHub Pages):**
Navigate to https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html in any modern browser.

**Local file:**
Download `TMAR-Accrual-Ledger.html` and open it directly in your browser (double-click or drag into a browser window). The `file://` protocol is fully supported. All data is stored in your browser's localStorage and IndexedDB — no web server is needed.

**Supported browsers:** Chrome 90+, Edge 90+, Firefox 88+, Safari 14+. Chrome and Edge are recommended for the best streaming AI experience.

### 2.2 First-Time Setup

When you first open the application, the ledger is empty and no trust name or EIN is displayed. Follow these steps:

1. Click the **Settings & API** tab in the main navigation bar.
2. Scroll to the **Trust Entity** section and enter your trust or entity name and EIN.
3. Click **Save All Keys** at the bottom of the settings panel. The header subtitle will update to display the masked EIN.
4. If you plan to use the AI agents, configure at least one API key (see Section 2.3).
5. Click the **Entities** tab and add the legal entities you want to track.
6. Click the **Chart of Accounts** tab and either load the default chart of accounts or import your own.

Auto-save begins immediately. Your data is persisted to localStorage under the key `TMAR_AppData` and survives browser restarts, tab closures, and computer restarts as long as you use the same browser profile on the same machine.

### 2.3 API Key Configuration

To use any AI feature you must configure at least one provider API key. Navigate to **Settings & API** in the main tab bar and scroll to the API Keys section, or click **API Keys** inside the E2ZERO sidebar.

**Available providers:**

| Provider | Key Field ID | Notes |
|---|---|---|
| Anthropic / Claude | `keyClaude` | Default. Supports streaming. Model: `claude-sonnet-4-20250514`. |
| OpenAI | `keyOpenai` | Model: `gpt-4o`. Supports streaming. |
| DeepSeek | `keyDeepseek` | Model: `deepseek-chat`. |
| xAI (Grok) | `keyXai` | Model: `grok-3-mini-beta`. |
| Z.AI | `keyZai` | Model: `z1-preview`. |
| Kimi / Moonshot | `keyKimi` | Model: `moonshot-v1-8k`. |
| MiniMax | `keyMinimax` | Model: `abab6.5s-chat`. |
| Ernie / Baidu | `keyErnie` | No streaming. |
| Groq | `stg_key_groq` | Model: `llama-3.3-70b-versatile`. Free tier available. |
| Cerebras | `stg_key_cerebras` | Model: `llama-3.3-70b`. Free tier available. |
| OpenRouter | `stg_key_openrouter` | Default model: `openai/gpt-4o-mini`. Aggregates 200+ models. |
| Ollama (Local) | URL + Model fields | Runs locally. No API key required. |
| Custom Provider | `keyCustom` | Any OpenAI-compatible endpoint. |

**Steps:**
1. Paste your API key into the corresponding field.
2. Select the active provider from the **Active Provider** dropdown.
3. Click **Save All Keys**.
4. Click **Test Connection** to verify the key works.

**CORS note for Anthropic:** If you are running from a `file://` URL, Anthropic's API may reject browser-direct requests. Enter a CORS proxy URL in the **CORS Proxy** field (e.g., `https://your-proxy.example.com`) or use Ollama for local operation.

**Legacy key compatibility:** The application also reads the `_trustApiKey` localStorage key set by earlier versions of the TMAR platform, so existing installations upgrade without reconfiguration.

### 2.4 localStorage Keys Reference

See [Appendix A](#appendix-a--localstorage-keys-reference) for the complete reference. The most important keys during setup are:

| Key | Purpose |
|---|---|
| `TMAR_AppData` | All accounting data (ledger, entities, journals, filings, settings) |
| `eeon_key_claude` | Anthropic API key |
| `eeon_active_provider` | Currently selected AI provider |
| `eeon_cors_proxy` | CORS proxy URL for Anthropic when running from `file://` |
| `_trustApiKey` | Legacy Anthropic key (still read for backwards compatibility) |

---

## 3. Navigation

### 3.1 Main Navigation Tab Bar

The primary navigation is a horizontally scrolling tab bar below the header. Tabs are organized into logical groups separated by vertical dividers. Click any tab to switch the main content area.

**Group 1 — Core Accounting**
- **Ledger** — Double-entry general ledger
- **Entities** — Legal entity registry
- **Chart of Accounts** — Account codes and types
- **Journal** — Formal journal entries

**Group 2 — Receivables and Payables**
- **A/R** — Accounts receivable
- **A/P** — Accounts payable

**Group 3 — Consolidation and Statements**
- **Consolidation** — Multi-entity elimination entries
- **Statements** — Trial balance, income statement, balance sheet

**Group 4 — Tax and Compliance**
- **Tax Filings** — IRS form preparation (1040, 1041, 1120, 990, 1099 series, Schedule C)
- **Tax Estimator** — Aggregate 1099 data into a tax estimate
- **Schedule A Detail** — Itemized deduction worksheet

**Group 5 — Trust Estate**
- **Trust Estate Dashboard** — Asset and balance overview with particle animation
- **Trust Estate Ledger** — Trust-specific transaction ledger
- **Trust Estate Reports** — Trust trial balance and asset summary

**Group 5b — SPV Module**
- **SPV Dashboard** — Special Purpose Vehicle entity management and quick actions
- **SPV Ledger** — SPV-specific journal entry recording
- **SPV Reports** — SPV trial balance and asset type summaries

**Group 5c — UK Accounting**
- **UK Accounting** — FRS 102 / IFRS compliance, UK entity configuration, compliance checklist, and UK financial statements

**Group 6 — Operations**
- **Invoicing** — Invoice creation and payment tracking
- **Payroll** — Employee payroll calculation
- **Inventory** — Inventory item tracking
- **Budget and Forecast** — Budget vs. actual analysis
- **Payment Orders** — Formal payment order instruments
- **Bills of Exchange** — UCC-compliant bills of exchange with signature canvas
- **Expense Itemization** — Detailed expense tracking
- **Customers and Vendors** — Contact management
- **Asset Depreciation** — Fixed asset and depreciation schedules
- **Bank Reconciliation** — Bank statement reconciliation

**Group 7 — Reports and Intelligence**
- **Reports** — Summary financial reports
- **Master Report** — Comprehensive multi-section report
- **GAAPCLAW Master** — AI-powered GAAP analysis agent
- **Nonprofit CPA** — Nonprofit financial workpaper
- **Partnership CPA** — Partnership financial workpaper
- **Corporation CPA** — Corporate financial workpaper
- **Trust CPA** — Trust financial workpaper
- **Trust Corp CPA** — Trust corporation financial workpaper
- **Consolidated CPA** — Consolidated entity workpaper
- **IRS Form Generator** — Document template and package builder
- **Settings & API** — API key configuration and app settings
- **API Scout** — API discovery and integration testing
- **Voice and Chat** — Voice input, TTS output, and general chat

**Group 8 — Tools**
- **Financial Assets** — Asset allocation and analysis
- **Document Creator** — Rich-text legal document editor
- **Source Folders** — Account library folder management

**Group 9 — RedressRight Source Libraries**
- **Constitutional Challenges (CPSA)** — Draft constitutional challenge documents
- **Tax Refund Calculator (TRCF)** — Multi-route tax refund calculation
- **NOL Classification (CCSN)** — NOL classification slide presentation
- **Federal Damages (FDRF)** — Federal damages accordion reference
- **Tutorial Journal (EEEJ)** — Step-by-step Q&A tutorial slides

**Group 10 — Verification Tools**
- **Entity Verifier** — Multi-source entity verification (SEC, FDIC, ProPublica, USASpending, FINRA, IARD, CFPB, OpenCorporates, SAM)

**Group 11 — Data Integration**
- **Sync Center** — Google Apps Script bidirectional sync

**Group 12 — PDKB Tools**
- **Transcript** — AI transcript transformer to Obsidian-ready markdown
- **Etymology** — Legal and financial etymology analyzer
- **PDF/MD** — PDF to markdown converter
- **POA/DBA** — Multi-state power of attorney and DBA generator

### 3.2 E2ZERO Agent Sidebar

A floating robot button (bottom-right of the screen) opens the E2ZERO AI Agent Sidebar. This is a full-screen overlay with its own navigation independent of the main tab bar.

The sidebar contains:
- **MAIN:** Dashboard, Chat, NOI Ask
- **AGENTS:** Agents grid, Create Agent
- **LEGAL:** Dream Team, Legal Expert, Tax Expert, Tax Forms, Tax Estimator, Arbitration
- **TOOLS:** Research HUB, Search, Documents, Voice Center, Analytics, Calendar, Passwords
- **SPECIALISTS:** Corporation, Trust, Accounting, Code Expert, Creative Writer, HTML Architect, General Assistant
- **AUTONOMOUS:** Task Planner, API Integrations, Code Builder, API Scout
- **SYSTEM:** API Keys, Preferences, History, How-To, Backup

Each page in the sidebar is an independent chat interface for a specific AI specialist. Click **Close Sidebar** or click the robot button again to return to the main ledger.

### 3.3 Global Header Toolbar

At the top of every main page, the header toolbar provides:

| Button | Function |
|---|---|
| **Save** | Immediately writes all data to localStorage |
| **Preview** | Opens a modal showing a formatted summary of all current data |
| **Print** | Triggers browser print (nav and toolbar are hidden via print CSS) |
| **Export As...** | Dropdown: PDF, Word (.docx), CSV, JSON |
| **Import** | File picker — accepts a previously exported `.json` file |
| Theme Toggle (top-right) | Switches between dark mode and light mode |

Auto-save status appears in the bottom-right corner and confirms each save with a green badge.

---

## 4. Core Accounting Pages

### 4.1 Ledger

The Ledger is the starting page and the foundation of all financial records.

**Purpose:** Records individual financial transactions as debit (money in) and credit (money out) entries against named categories.

**New Entry Form**

| Field | Type | Description |
|---|---|---|
| Date | Date picker | Transaction date |
| Description | Text | Free-text description of the transaction |
| Category | Dropdown | 30+ predefined categories (Checking, Savings, Credit Card, Trust Account, Tax Account, etc.) |
| Debit (IN) | Number | Amount received or debited |
| Credit (OUT) | Number | Amount paid or credited |

Click **Add Entry** to append the entry to the ledger table.

**Ledger Table**

Displays all entries with columns for Date, Description, Category, Debit (IN), Credit (OUT), and Actions. The footer row shows running totals for Debit and Credit columns. The Net Balance row shows the difference.

**Action buttons on each row:**
- Edit icon — Opens the entry for in-place editing
- Delete icon — Removes the entry after confirmation

**Table toolbar buttons:**
- **Save** — Forces an immediate localStorage save
- **CSV** — Exports the ledger to a CSV file via FileSaver.js
- **Clear** — Opens a confirmation modal before deleting all entries

### 4.2 Entities

**Purpose:** Maintains a registry of all legal entities whose transactions flow through the ledger. Entities are referenced by other modules for consolidation, CPA workpapers, and AI analysis.

**Add Entity button** opens a modal with the following fields:

| Field | Description |
|---|---|
| Entity Name | Legal name of the entity |
| Entity Type | Dropdown: Corporation, LLC, Partnership, Trust, Nonprofit, Sole Proprietor, Government |
| EIN | Employer Identification Number in XX-XXXXXXX format |
| State of Formation | Two-letter state code |
| Fiscal Year End | Month of fiscal year end |
| Parent Entity | Optional — select a parent entity for subsidiary relationships |
| Notes | Free-text |

**Entities Table** lists all registered entities with Edit and Delete buttons. An **Entity Structure** accordion below the table renders a visual hierarchy of parent-subsidiary relationships.

Entity data feeds the Consolidation module, CPA workpaper pages, and the Trust Estate module.

### 4.3 Chart of Accounts

**Purpose:** Defines the account codes, names, and types that classify journal entries. Required for double-entry bookkeeping and financial statement generation.

**Load Default COA button** populates a standard chart of accounts covering assets, liabilities, equity, income, and expense accounts.

**Add Account modal fields:**

| Field | Description |
|---|---|
| Account Code | Numeric code (e.g., 1000, 2000) |
| Account Name | Descriptive name |
| Account Type | Asset, Liability, Equity, Income, Expense |
| Normal Balance | Debit or Credit |
| Parent Account | Optional — for sub-accounts |
| Description | Free-text |

**Filter buttons** above the table let you show All, Assets, Liabilities, Equity, Income, or Expense accounts only.

**COA Import Wizard** provides a multi-step wizard that can import accounts from a CSV file or from a live Google Sheets tab. Step 1 selects the source, Step 2 maps CSV columns to account fields, Step 3 previews the import, and Step 4 commits the accounts.

### 4.4 Journal

**Purpose:** Records formal double-entry journal entries with matching debit and credit lines. Each entry must balance (total debits must equal total credits) before it can be saved.

**Journal Entry Form**

A dynamic form where each row represents one line of the entry:
- Date (header, shared across all lines)
- Description (header)
- Reference number (header)
- Per-line: Account (dropdown from Chart of Accounts), Description, Debit amount, Credit amount
- **Add Line button** appends another debit/credit row
- **Remove button** on each row deletes that line

The running balance indicator at the bottom shows whether the entry is balanced. The **Save Entry** button is disabled until the entry balances.

**Journal Entries Table** below the form lists all saved entries with Date, Reference, Description, and Total columns. Each row has a **View** button that opens a formatted display of all lines in that entry, and a **Delete** button.

**Filter** and **Export** buttons allow filtering by date range and exporting all entries as CSV.

---

## 5. Receivables and Payables

### 5.1 Accounts Receivable (A/R)

**Purpose:** Tracks money owed to your entity by customers or counterparties.

**Add A/R button** opens a modal:

| Field | Description |
|---|---|
| Invoice Number | Unique identifier |
| Customer | Customer name |
| Amount | Dollar amount |
| Due Date | Payment due date |
| Notes | Free-text |

**A/R Table** columns: Invoice, Customer, Amount, Due Date, Age (calculated from due date), Status, Actions.

The **Age** field is automatically color-coded: green for current, yellow for 30-60 days overdue, orange for 60-90 days, red for 90+ days.

**Record Payment button** on each row opens a payment dialog where you enter the payment date and amount. Partial payments are supported. When fully paid, the status updates to "Paid."

### 5.2 Accounts Payable (A/P)

**Purpose:** Tracks money your entity owes to vendors or creditors.

**Add A/P button** opens a modal identical in structure to the A/R modal but with a Vendor field instead of Customer.

**A/P Table** includes the same aging calculation and Record Payment functionality as A/R. The distinction is directional: A/P represents outgoing obligations.

---

## 6. Consolidation and Statements

### 6.1 Consolidation

**Purpose:** Generates elimination journal entries to remove intercompany transactions when preparing consolidated financial statements for a group of related entities.

**Generate Eliminations button** analyzes the journal entries across all entities and identifies intercompany balances. It creates offsetting elimination entries for:
- Intercompany receivables and payables
- Intercompany revenue and expense
- Equity investments in subsidiaries

**Eliminations Table** lists each elimination entry with the originating entities, account, amount, and elimination type.

**Consolidation Worksheet** shows the consolidated totals after eliminations, broken down by entity column.

### 6.2 Statements

**Purpose:** Generates the three core financial statements from the journal and ledger data.

**Generate Statements button** calculates all account balances and renders:

1. **Trial Balance** — Two-column listing of all accounts with debit and credit totals. Must be in balance.
2. **Income Statement** — Revenue minus expenses, organized by account type. Shows gross profit, operating income, and net income.
3. **Balance Sheet** — Assets, liabilities, and equity as of the selected date. Assets must equal liabilities plus equity.

**Export Statements button** outputs all three statements to a single PDF or Word document.

---

## 7. Tax and Compliance

### 7.1 Tax Filings

**Purpose:** Prepares and saves federal tax filings with auto-calculating fields that mirror IRS form line numbers.

After clicking the **Tax Filings** tab, a card grid presents the available form types. Click a card to open that form.

**Available Forms:**

- **Form 1120** — Consolidated Corporate Tax Return. Includes subsidiary group members table, income section (Lines 1a–10), deductions section (Lines 12–26), and tax/payments section (Line 31). The `calculate1120()` function computes tax at the 21% flat corporate rate.
- **Form 990 / 990-EZ** — Nonprofit Return. Covers Part I Revenue, Part II Expenses, and Part III Net Assets. Supports 501(c)(3), 501(c)(4), 501(c)(6), 501(c)(7).
- **Form 1041** — Trust and Estate Income Tax Return. Includes entity identification, income (Lines 1–8), deductions (Lines 10–15), beneficiary distributions table, and tax computation.
- **Form 1041-ES** — Estimated Tax for Trusts. Displays a quarterly payment schedule (Q1 Apr 15, Q2 Jun 15, Q3 Sep 15, Q4 Jan 15) with a paid checkbox for each quarter.
- **Form 1040** — Individual Income Tax Return. Full income section (Lines 1a–8), adjustments to income, standard vs. itemized deduction selector, and tax computation using current-year tax tables.
- **Form 1040-ES** — Individual Estimated Tax. Four-quarter payment schedule.
- **Schedule C** — Profit or Loss from Business. Income, COGS, operating expenses, and home office deduction (with toggle for regular vs. simplified method).
- **Form 1099-A** — Acquisition or Abandonment of Secured Property
- **Form 1099-B** — Proceeds from Broker and Barter Exchange
- **Form 1099-C** — Cancellation of Debt
- **Form 1099-INT** — Interest Income
- **Form 1099-DIV** — Dividends and Distributions
- **Form 1099-R** — Distributions from Pensions, Annuities, IRAs
- **Form 1099-NEC** — Nonemployee Compensation
- **Form 1099-MISC** — Miscellaneous Information

**Each form includes:**
- Field labels that match official IRS PDF line numbers
- Placeholder text explaining what data goes in each field and where to find it on your tax documents
- Real-time auto-calculation (triggered by `oninput` on numeric fields)
- **Calculate** button to force recalculation
- **Save Filing** button to persist the form data
- **Export Data** button to download the form as a text or CSV file

**Saved Filings List** below each form shows all previously saved filings for that form type with Load and Delete buttons.

### 7.2 Tax Estimator

**Purpose:** Aggregates 1099 data entered in the Tax Filings section and produces an estimated federal and state tax liability. Supports three calculation routes.

**Sub-tabs:**
- **Tax Calculator** — Enter income sources, deductions, filing status. Calculates estimated tax.
- **1099 Aggregator** — Pulls amounts from all saved 1099-series forms automatically. Click **Import 1099 Data** to populate fields from saved filings, then **Apply to Estimator** to push totals to the calculator.
- **Bad Debt Refund** — Calculates potential refund from bad debt deductions under IRC Section 166.
- **Instrument Loss** — Calculates losses from financial instruments.
- **Interest Refund** — Calculates recoverable interest under IRC Section 6621.

### 7.3 Schedule A Detail

**Purpose:** Itemized deduction worksheet that calculates deductible amounts for mortgage interest, charitable contributions, medical expenses, state and local taxes, and other Schedule A categories.

All calculations update in real time. The **Save Schedule A** button persists the data to localStorage. The totals feed automatically into the Form 1040 when itemized deductions are selected.

---

## 8. Trust Estate Module

### 8.1 Trust Estate Dashboard

**Purpose:** Provides a high-level view of the trust estate's financial position.

The dashboard features a particle canvas animation in the background (initialized by `initParticles()`). Scroll-reveal animations fade sections into view as you scroll down.

**Key metrics displayed:**
- Total Assets
- Total Liabilities
- Net Worth (Assets minus Liabilities)
- Income This Period
- Expenses This Period
- Net Income

**Accordion sections** (expandable) cover asset categories, liability summary, and distribution history. Each accordion header uses the `tmar-accordion` CSS class and toggles via `toggleAccordion()`.

### 8.2 Trust Estate Ledger

**Purpose:** A dedicated ledger for trust transactions, separate from the general ledger. Supports multi-currency entries.

**Add Entry form fields:**

| Field | Description |
|---|---|
| Date | Transaction date |
| Description | Transaction description |
| Transaction Type | Dropdown: Contribution, Distribution, Income, Expense, Transfer, Adjustment |
| Amount | Dollar (or other currency) amount |
| Currency | Currency code (USD, EUR, GBP, etc.) |
| Beneficiary | Name of beneficiary receiving a distribution |
| Account | Account from the Chart of Accounts |
| Notes | Free-text |

The `trustCurrSymbol()` function converts currency codes to symbols for display. The `trustTypeLabel()` function provides human-readable labels for transaction types.

**Filter controls** allow filtering by date range, transaction type, and beneficiary.

**Reset Filters button** returns all filters to default.

The ledger table shows entries with running balance. Each row has Edit and Delete buttons.

**Export buttons:**
- **CSV** — Exports ledger entries as CSV
- **JSON** — Exports raw data as JSON
- **Print** — Triggers browser print

### 8.3 Trust Estate Reports

**Purpose:** Generates two formal trust reports.

**Trust Trial Balance** — Lists all trust accounts with opening balance, period activity (debits and credits), and ending balance. Generated by `generateTrustTrialBalance()`.

**Trust Asset Summary** — Summarizes assets by category with total values. Generated by `generateTrustAssetSummary()`.

Both reports are printable and support PDF export.

---

## 8a. SPV Module

The SPV (Special Purpose Vehicle) Module provides three dedicated tabs for creating, managing, and reporting on SPV entities. SPV data is stored in its own `TMAR_SPV_Data` localStorage key, independent of the main ledger.

### 8a.1 SPV Dashboard

**Nav label:** 🏦 SPV Dashboard

**Purpose:** High-level management view for all SPV entities — create new SPVs, switch between them, and review recent activity at a glance.

**UI elements:**

| Element | Description |
|---|---|
| Active SPV dropdown | Selects the currently active SPV entity. Fires `spvSetActive(id)` on change. |
| New SPV button | Calls `spvAddEntity()` — prompts for name, EIN, type, and purpose, then saves and refreshes the selector. |
| Delete SPV button | Calls `spvDeleteActive()` — removes the selected SPV and all its entries after confirmation. |
| SPV info line | Displays EIN, entity type, and purpose for the currently selected SPV. Updated by `spvSetActive()`. |
| Add Entry (quick action) | Navigates to the SPV Ledger and opens the Add Entry form. |
| SPV Reports (quick action) | Navigates to the SPV Reports tab and calls `spvUpdateReports()`. |
| Export CSV (quick action) | Calls `spvExportCSV()` — downloads all SPV entries as a CSV file. |
| Export JSON (quick action) | Calls `spvExportJSON()` — downloads the full SPV data object (entities + entries) as a JSON file. |
| Recent SPV Activity table | Displays the last 10 SPV ledger entries: Date, SPV, Description, Amount. Populated by `spvUpdateDashboard()`. |

**Storage:** `TMAR_SPV_Data` — JSON object `{ entities: [], entries: [] }`.

- Each entity record contains: `id`, `name`, `ein`, `type`, `purpose`.
- Each entry record contains: `id`, `date`, `spvName`, `type`, `desc`, `amount`.

### 8a.2 SPV Ledger

**Nav label:** 📋 SPV Ledger

**Purpose:** Records SPV-specific journal entries. All entries are associated with a named SPV entity and classified by asset type.

**Toolbar buttons:**

| Button | Function |
|---|---|
| Add Entry | Calls `spvShowAddEntry()` — shows the form with today's date pre-filled. |
| Filter | Calls `spvFilterEntries()` — toggles the filter bar. |
| Reset | Calls `spvResetFilter()` — clears all filters and re-renders the full ledger. |

**Add Entry form fields:**

| Field | Description |
|---|---|
| Date | Transaction date |
| SPV Name | Free-text name (or selected from known SPVs) |
| Asset Type | Dropdown: Capital Contribution / Asset Acquisition / Distribution / Income / Expense / Debt Issuance / Debt Repayment / Other |
| Description | Free-text description |
| Amount | Dollar amount |

Click **Save Entry** to call `spvSaveEntry()`, which validates the form, appends the entry to `TMAR_SPV_Data`, persists via `spvSave()`, and re-renders the table.

**Filter bar:**

Appears below the toolbar when the Filter button is clicked.
- Text search field — matches against SPV name and description
- Asset Type dropdown — filters by entry type
- **Apply button** — calls `spvApplyFilter()`

**Ledger table:**

Columns: Date, SPV Name, Asset Type, Description, Amount, Actions.

Each row has a delete button (🗑) that calls `spvDeleteEntry(id)` after confirmation.

The table footer shows a running **Total** of all visible entries. Rendered by `spvRenderLedger(filter)`.

**Storage:** Same `TMAR_SPV_Data` key as the dashboard.

### 8a.3 SPV Reports

**Nav label:** 📈 SPV Reports

**Purpose:** Generates two formal SPV financial reports and provides export and print options.

**Reports generated by `spvUpdateReports()`:**

**SPV Trial Balance** — Groups entries by SPV entity name. For each SPV, shows:
- In (sum of income, capital contributions, and debt issuances)
- Out (sum of distributions, expenses, and debt repayments)
- Net (In minus Out)

Generated by `generateSPVTrialBalance()`. Populates the trial balance table.

**Asset Type Summary** — Groups all entries by asset type. For each type, shows:
- Entry count
- Total value

Generated by `generateSPVAssetSummary()`. Populates `spvAssetSummaryBody`.

**Action buttons:**

| Button | Function |
|---|---|
| Export CSV | `spvExportCSV()` — downloads all entries as CSV |
| Export JSON | `spvExportJSON()` — downloads full data object as JSON |
| Print Report | `spvPrintReport()` — calls `window.print()` |

---

## 8b. UK Accounting

**Nav label:** 🇬🇧 UK Accounting

**Purpose:** FRS 102 / IFRS compliance tools for UK-registered entities. Provides entity configuration, a compliance checklist, UK-format financial statement generation, and an AI agent pre-loaded with UK law context.

This tab is divided into four sections.

### UK Entity Configuration

Stores identifying information for the UK entity under `TMAR_UK_Settings`.

| Field | Description |
|---|---|
| Company Name | Registered company name |
| Companies House Number | 8-digit Companies House registration number |
| UTR | Unique Taxpayer Reference (10 digits) |
| VAT Registration Number | UK VAT number |
| Accounting Standard | Dropdown: FRS 102 / FRS 105 / IFRS / FRS 101 |
| Accounting Period End | Date field for period end date |

**Save UK Settings button** calls `ukSaveSettings()`, which writes all field values into `TMAR_UK_Settings` in localStorage.

`ukLoadSettings()` is called on page init to populate fields from saved settings.

### UK Compliance Checklist

Eight checkboxes covering the key annual compliance obligations for a UK company:

1. Companies House annual return filing
2. Statutory accounts preparation and filing
3. CT600 Corporation Tax return
4. VAT returns (if VAT-registered)
5. PAYE / RTI submissions (if employing staff)
6. Confirmation Statement (annual)
7. Director loans disclosure (FRS 102 §33)
8. Fixed asset depreciation accounting (FRS 102 §17 / IAS 16)

**Buttons:**

| Button | Function |
|---|---|
| Save Checklist | `ukSaveChecklist()` — saves all checkbox states to `TMAR_UK_Settings.checklist` |
| Check All | `ukCheckAll()` — marks all 8 items checked |
| Uncheck All | `ukUncheckAll()` — marks all 8 items unchecked |

### UK Financial Statements

Generates UK-format financial statements from the main ledger and chart of accounts data.

**Statement types:**

- **Statement of Comprehensive Income** — The UK equivalent of a P&L. Revenue and expense accounts from the main ledger are re-labeled and organized per FRS 102 or IFRS presentation requirements.
- **Statement of Financial Position** — The UK equivalent of a Balance Sheet. Assets, liabilities, and equity presented per FRS 102 Part 4 / IAS 1.

**Buttons:**

| Button | Function |
|---|---|
| Generate UK Statements | `ukGenerateStatements()` — builds and renders both statements from ledger and COA data |
| Generate UK Compliance Report | `ukGenerateComplianceReport()` — produces a plain-text compliance summary from settings and checklist state |
| Print | `ukPrintStatements()` — calls `window.print()` |

### UK Accounting AI Agent

A chat interface that routes queries to the active LLM with a UK-law-specific system prompt covering FRS 102, HMRC procedures, and the Companies Act 2006.

- **Text area** — Enter your UK accounting or compliance question
- **Ask UK Accounting Agent button** — Calls `ukAgentQuery()`, which passes the text area content to `callLLMStream()` with the UK-specific system prompt. The response streams into the output area below.

The system prompt instructs the agent to cite specific FRS 102 section numbers, HMRC reference codes, and Companies Act 2006 provisions in its responses.

**Storage:** `TMAR_UK_Settings` — includes `companyName`, `chNumber`, `utr`, `vat`, `standard`, `periodEnd`, and `checklist` (object with 8 boolean keys).

---

## 9. Operations Pages

### 9.1 Invoicing

**Purpose:** Creates, tracks, and manages customer invoices.

**Show Invoice Form button** opens the invoice creation panel.

**Invoice form fields:**
- Invoice number (auto-generated)
- Client name
- Invoice date
- Due date
- Line items table: Description, Quantity, Unit Price, Line Total (auto-calculated)
- **Add Line button** appends a new line item
- **Remove button** on each line
- Tax rate (%) — applied to subtotal
- Notes

The `calcInvTotals()` function recalculates subtotal, tax, and total whenever a line item changes.

**Save Invoice button** persists the invoice. **Print Invoice button** renders a formatted invoice printout.

**Invoice List** shows all invoices with status badges (Draft, Sent, Paid, Overdue). **Mark Paid** and **Delete** buttons on each row.

**Invoice Dashboard** at the top shows total invoiced, total paid, and outstanding balance.

### 9.2 Payroll

**Purpose:** Calculates employee payroll including federal and state withholdings.

**Payroll Calculator fields:**
- Employee name
- Pay period (Weekly, Bi-weekly, Semi-monthly, Monthly)
- Gross wages
- Federal withholding (calculated)
- State withholding (percentage input)
- Social Security tax (6.2%)
- Medicare tax (1.45%)
- Additional deductions (health insurance, 401k, etc.)
- Net pay (calculated)

**Calculate button** runs `calcPayroll()` which computes all withholdings and net pay.

**Save Payroll Record button** saves the record to localStorage.

**Payroll Records Table** lists all saved payroll records. **Payroll Dashboard** shows total gross wages, total taxes withheld, and total net pay for the period.

### 9.3 Inventory

**Purpose:** Tracks inventory items, quantities, and valuations.

**Add Item modal fields:**
- Item name
- SKU / Item code
- Category
- Quantity on hand
- Unit cost
- Reorder point
- Supplier

**Inventory Table** shows all items with current quantity, total value (quantity × unit cost), and status (In Stock / Low Stock / Out of Stock based on reorder point comparison).

**Inventory Dashboard** shows total SKUs, total inventory value, and items below reorder point.

### 9.4 Budget and Forecast

**Purpose:** Compares budgeted amounts against actual ledger entries for variance analysis.

**Budget form** allows entry of budgeted amounts by account category. **Calculate button** runs `calcBudget()` which pulls actual totals from the ledger and computes variance (actual minus budget) and variance percentage.

**Budget Table** shows budget, actual, variance, and a color-coded indicator (green for favorable, red for unfavorable).

### 9.5 Payment Orders

**Purpose:** Creates formal payment order instruments — written orders directing payment of a specific sum.

**Payment Order form fields:**
- Order number (auto-generated)
- Date
- Pay to (payee name)
- Amount (number field — triggers `poWriteAmount()` to generate the amount in words)
- Amount in words (auto-populated)
- Memo / purpose
- Authorized by
- Bank / financial institution
- Account number

**Save Payment Order button** persists the order. **Print button** renders a formal document-style printout via `printPODocument()`.

**Payment Orders List** shows all orders. Each row has a Print and Delete button.

### 9.6 Bills of Exchange

**Purpose:** Creates UCC Article 3-compliant bills of exchange, including a digital signature canvas.

**Bill of Exchange form fields:**
- Serial number (auto-generated by `generateBOESerial()`)
- Date
- Drawee (who must pay)
- Payee (who receives payment)
- Drawer (who issues the bill)
- Amount
- Amount in words (auto-populated by `boeWriteAmount()`)
- Due date
- Place of payment
- Bill variant (Sight, Time, Demand) — toggled by `toggleBOEVariant()`
- Language / jurisdiction label — updated by `updateBOELanguageLabel()`

**Signature Canvas** — Allows the drawer to sign digitally:
- Touch or mouse drawing is captured by `boeCanvasDown()`, `boeCanvasDraw()`, `boeCanvasUp()`
- **Accept Signature** — Saves the signature data
- **Clear** — Erases the signature
- **Undo** — Removes the last stroke via `boeUndoStroke()`

**Save Bill button** persists the BOE. **Print button** renders a formal bill of exchange document via `printBOEDocument()`.

### 9.7 Expense Itemization

**Purpose:** Detailed expense tracking by category with receipt reference.

**Add Expense form fields:**
- Date
- Description
- Amount
- Category (dropdown)
- Receipt number
- Paid by

**Expense Table** lists all expenses. **Delete button** on each row.

**Expense Dashboard** shows totals by category.

**Export CSV button** downloads all expenses as CSV. **Print Report button** renders a formatted expense report.

### 9.8 Customers and Vendors

**Purpose:** Contact management for customers and vendors referenced by invoices, A/R, and A/P.

**Two sub-tabs:** Customers and Vendors.

**Add Customer / Add Vendor modal fields:**
- Name
- Contact person
- Email
- Phone
- Address
- Notes

Customers and vendors are listed in separate tables. Each row has a Delete button.

### 9.9 Asset Depreciation

**Purpose:** Manages fixed assets and calculates depreciation using straight-line method.

**Add Asset form fields:**
- Asset name
- Purchase date
- Purchase price
- Salvage value
- Useful life (years)
- Depreciation method (currently straight-line)

The `saveAsset()` function calculates annual depreciation as (purchase price minus salvage value) divided by useful life.

**Assets Table** shows each asset with its annual depreciation, accumulated depreciation (based on months held), and net book value.

**Depreciation Dashboard** shows total asset cost, total accumulated depreciation, and total net book value.

### 9.10 Bank Reconciliation

**Purpose:** Reconciles your book balance with the bank statement balance.

**Reconciliation form fields:**
- Statement date
- Bank statement ending balance
- Book balance (from ledger)
- Outstanding deposits (not yet cleared)
- Outstanding checks (not yet cleared)
- Bank errors
- Book errors
- Interest earned (from bank)
- Bank charges

**Calculate Reconciliation button** runs `calcReconciliation()` which computes:
- Adjusted bank balance = Statement balance + outstanding deposits - outstanding checks ± bank errors
- Adjusted book balance = Book balance + interest earned - bank charges ± book errors
- Difference = Adjusted bank balance minus adjusted book balance (must be zero)

**Save Reconciliation button** saves to history. **Print Reconciliation button** renders a formal reconciliation report.

**Reconciliation History Table** shows all previous reconciliations. Each row has a Delete button.

---

## 10. Reports and Intelligence

### 10.1 Reports

**Purpose:** Summary financial overview that aggregates ledger, A/R, A/P, and filing data.

`updateReports()` calculates and displays:
- Total income (sum of all debit entries)
- Total expenses (sum of all credit entries)
- Net income
- Outstanding A/R total
- Outstanding A/P total
- Number of saved filings per form type

### 10.2 Master Report

**Purpose:** A single comprehensive document that assembles all financial data into a printable master report.

`generateMasterReport()` builds a multi-section report including:
- Trust entity identification header
- Balance sheet summary
- Income statement summary
- Trial balance
- A/R aging summary
- A/P aging summary
- Journal entry summary
- Tax filings summary
- Payroll summary
- Asset depreciation schedule
- Bank reconciliation summary

**Print Master Report button** triggers a formatted browser print of the entire report.

### 10.3 GAAPCLAW Master Agent

**Purpose:** An AI-powered agent specialized in GAAP accounting, trust law, and document command parsing.

The GAAPCLAW Master agent is backed by `buildTrustAgentSystemPrompt()` which constructs a detailed system prompt covering:
- GAAP/FASB standards
- Trust law (Restatement Third of Trusts)
- IRS trust taxation (Forms 1041, 1041-ES)
- Fiduciary duty standards
- TMAR ledger data awareness

**Document commands** — You can direct the agent to generate specific documents by typing commands like `generate payment order` or `build trust report`. The `parseDocumentCommand()` function interprets these commands and triggers the appropriate template or package builder.

**Usage:** Type your question or command in the chat input and click Send. The agent streams its response token by token.

### 10.4 CPA Specialist Pages

Six pages provide structured financial workpapers for different entity types. Each page follows the same pattern:
- Entity identification header
- Multiple accordion sections for income, expenses, adjustments, and notes
- Calculate and Save buttons
- Export to PDF or Word

**Available workpapers:**
- **Nonprofit CPA** — Follows IRS Form 990 structure
- **Partnership CPA** — Follows IRS Form 1065 structure
- **Corporation CPA** — Follows IRS Form 1120 structure
- **Trust CPA** — Follows IRS Form 1041 structure
- **Trust Corp CPA** — Hybrid trust-corporation workpaper
- **Consolidated CPA** — Multi-entity consolidated workpaper

### 10.5 IRS Form Generator

**Purpose:** A document template system with a visual package builder. Generates legal and financial documents by merging entity data with pre-built templates.

**Sub-sections:**

**Template Library** — Click any template card to populate the editor with a document template. Variables in the format `{{VARIABLE_NAME}}` are automatically replaced with values from the currently selected entity.

**IRS Form Viewer** — Renders interactive representations of IRS forms (W-9, SS-4, 2553, etc.) styled to match actual IRS formatting.

**Package Builder** — Select multiple documents to bundle into a single PDF or ZIP package. Preset packages are available:
- Trust Formation Package
- IRS Compliance Package
- Entity Verification Package
- Full Filing Package

**Variable Editor** — Override template variables manually. Changes are saved to localStorage via `saveTemplateVars()`.

---

## 11. Settings and API Configuration

### 11.1 Settings and API Page

The Settings page (accessible via the **Settings & API** tab or **API Keys** in the E2ZERO sidebar) is divided into several sections.

**Trust Entity Settings**
- Trust/Entity Name (populates the header subtitle)
- Trust EIN (stored and displayed as masked `••-•••XXXX`)
- Fiscal year start month
- Accounting basis (Accrual or Cash)
- Default currency

**API Keys Section**

One row per provider with:
- Password-type input for the API key
- Status dot (green = key saved, gray = no key)
- Provider-specific notes

Three additional cloud providers are available in the API Keys section:

**Groq**
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Default model: `llama-3.3-70b-versatile`
- Context limit: 32,768 tokens
- Free tier available. Key stored as `stg_key_groq` / `eeon_key_groq`.

**Cerebras**
- Endpoint: `https://api.cerebras.ai/v1/chat/completions`
- Default model: `llama-3.3-70b`
- Context limit: 8,192 tokens
- Free tier available. Key stored as `stg_key_cerebras` / `eeon_key_cerebras`.

**OpenRouter**
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Default model: `openai/gpt-4o-mini`
- Context limit: 200,000 tokens
- Aggregates 200+ models from multiple providers. Key stored as `stg_key_openrouter` / `eeon_key_openrouter`.

Additional fields for Ollama:
- Server URL (default `http://127.0.0.1:11434`)
- Model name (dropdown of common models + custom text field)
- API Key (optional, for remote Ollama instances with auth)
- Web Search toggle (enables tool-calling mode for Ollama models that support it)

Custom Provider fields:
- Provider name
- API endpoint URL
- API key
- Model name

Notification Integrations:
- Telegram Bot Token and Chat ID
- Discord Webhook URL

**CORS Proxy** — Enter a proxy URL to route Anthropic API calls through when running from a `file://` URL.

**Active Provider** — Dropdown to select which provider is used for all AI features.

**Buttons:**
- **Save All Keys** — Calls `saveKeys()`, writes all field values to their respective localStorage keys
- **Test Connection** — Calls `testConnection()`, sends a minimal test request to the active provider
- **Load Keys** — Calls `loadSavedKeys()`, reloads all field values from localStorage

**Memory Settings**
- **View Memory Stats** — Opens the GCMemory panel showing IndexedDB record count and stored exchanges
- **Clear All Memories** — Calls `mem0ClearAll()` after confirmation, purges the entire IndexedDB store
- **Check for Source Updates** — Calls `parityCheckNow()`, fetches `parity-fingerprint.json` from the GitHub repository, and updates the parity status display inline. See Section 11.4 for full details.

**Preferences**
- Theme (Dark/Light)
- Auto-save interval
- Font size
- Language

### 11.2 API Scout

**Purpose:** Discovers, tests, and integrates external APIs.

**Run Scout button** calls `runAPIScout()` which queries a catalog of pre-defined useful APIs and tests their availability. Results appear as cards with status badges.

**Filter by Category** — Filters the API catalog by category (Legal, Financial, Government, Data, etc.).

**Integrate button** on each API card — Calls `scoutIntegrateAPI()` to add the API to the integrated list and generate boilerplate connection code.

**Show Integrated APIs** — Lists all APIs you have marked as integrated.

**Test All button** — Runs connectivity tests on all integrated APIs.

### 11.3 Voice and Chat

**Purpose:** Voice input (Speech-to-Text), Text-to-Speech output, and a general-purpose chat interface.

**Voice Controls:**
- **Start Recording button** — Calls `startVoiceRec()`, activates the browser's Web Speech API
- **Stop Recording button** — Calls `stopVoiceRec()`, finalizes the recognized text
- Voice language selector — Selects the STT language
- TTS Rate slider — Controls speaking speed
- TTS Voice dropdown — Populated by `loadVoices()` from the browser's available speech synthesis voices
- **Speak Response button** — Calls `speakWithHighlight()`, reads the last agent response aloud with word-level highlighting

**Chat Interface:**
- Message input (text or voice)
- Send button
- Chat history display
- **Export Chat History button** — Downloads conversation as text
- **Clear Chat button** — Erases current session history

**Web Search toggle** — When enabled, prepends a web search command to the query.

**Stats display** shows total messages, words spoken, and memory entries used.

### 11.4 Parity Drift Notification System

**Purpose:** Alerts you when the TMAR source pages at redressright.me have changed since the last parity check, indicating that the local application may be out of sync with the upstream feature set.

#### In-App Drift Banner

A sticky yellow warning bar appears at the top of every page when the parity fingerprint file reports `driftDetected: true`. The banner contains:

- A message identifying which source changed
- A **View Details** button — calls `parityShowDetails()`, which displays a modal with the full drift summary including per-source SHA-256 hashes, tab counts, version strings, and links to the source URLs
- A **Dismiss** button — calls `parityDismissBanner()`, which hides the banner and stores the current timestamp in `TMAR_parity_dismissed`. The banner is suppressed for **3 days** after dismissal.

#### Automatic Load Check

`parityCheckOnLoad()` is called 3 seconds after initial page load. It fetches `parity-fingerprint.json` silently from the GitHub repository. If `driftDetected` is `true` and the 3-day dismiss window has not expired, the banner is shown. If there is no drift or the user has recently dismissed, nothing is displayed.

#### Manual Check

The **Check for Source Updates** button in Settings → LLM Config calls `parityCheckNow()` directly and updates a status line inline. Useful for checking on demand without waiting for the next scheduled automation.

#### parity-fingerprint.json

Located at the repository root. Contains:

```json
{
  "lastChecked": "ISO timestamp",
  "driftDetected": false,
  "sources": {
    "Agent": { "hash": "sha256hex", "tabCount": 42, "version": "..." },
    "GAAP":  { "hash": "sha256hex", "tabCount": 38, "version": "..." }
  },
  "driftSummary": ""
}
```

#### GitHub Actions Workflow

File: `.github/workflows/parity-check.yml`

- **Schedule:** Every Sunday at 08:00 UTC. Also manually triggerable via the GitHub Actions UI.
- **Sources checked:** `https://redressright.me/Agent.html` and `https://redressright.me/GAAP.html`
- **Process:**
  1. Fetch both pages
  2. SHA-256 fingerprint the nav structure of each page (tab labels and count)
  3. Compare fingerprints against the stored hashes in `parity-fingerprint.json`
  4. If any hash changed: update `parity-fingerprint.json` with `driftDetected: true` and a diff summary, commit it to the repository, and create a GitHub Issue titled "🔔 Source parity drift detected — [date]" with full diff detail
  5. If no change: update the `lastChecked` timestamp and commit silently

The committed fingerprint file is what the in-app functions fetch to determine banner state.

#### localStorage Key

`TMAR_parity_dismissed` — Stores a Unix timestamp (milliseconds). The banner is suppressed if the stored value is within 3 days of the current time.

---

## 12. Tools Pages

### 12.1 Financial Assets

**Purpose:** Tracks and analyzes financial assets with allocation percentages.

**Sync from Ledger button** — Calls `syncFAFromLedger()`, which reads ledger entries categorized as investment accounts and creates asset records automatically.

**Sub-tabs** (switched by `showFASub()`):
- Overview — Asset allocation chart and totals
- Equities — Stock and equity holdings
- Fixed Income — Bond and fixed-income holdings
- Real Estate — Property asset records
- Cash — Liquid asset balances
- Alternative — Other asset types

**Allocation form** — For each asset, enter the allocation percentage. `setAlloc()` validates that total allocations equal 100%.

`calcFA()` computes weighted return, risk metrics, and total portfolio value.

### 12.2 Document Creator

**Purpose:** A full-featured rich-text legal document editor with formatting toolbar, auto-save, undo/redo, and export.

**Formatting toolbar buttons:**
- Bold, Italic, Underline, Strikethrough
- Font size controls (increase/decrease via `cpsaChangeFontSize()`)
- Case conversion (UPPER, lower, Title) via `changeDocCase()`
- Alignment (Left, Center, Right, Justify)
- Insert citation (`insertCitation()` — inserts formatted case law or statute reference)

**New Document button** — Calls `newBlankDoc()`, clears the editor after confirmation.

**Undo/Redo** — `docUndo()` and `docRedo()` maintain a 50-state history via `initDocUndoRedo()`.

**Auto-save** — `initDocAutoSave()` saves editor content to localStorage every 30 seconds. `docAutoSaveRestore()` prompts on load if unsaved content is detected.

**Export buttons:**
- **Export PDF** — `exportDocPDF()` uses jsPDF to generate a PDF
- **Export Word** — `exportDocWord()` generates a .docx-format HTML file
- **Print** — `printDoc()` triggers browser print

### 12.3 Source Folders

**Purpose:** Manages a library of account folders for organizing reference materials.

**Add Folder form:**
- Folder name
- Description
- Category

`addSourceFolder()` adds a new folder record. `removeSourceFolder(i)` removes one by index. `renderSourceFolders()` rebuilds the folder list.

`saveAcctLib()` persists all folders to localStorage under `TMAR_SourceFolders`.

---

## 13. RedressRight Source Library Pages

These pages are ported from the RedressRight legal platform and provide pre-built reference systems for specific legal and tax scenarios.

### 13.1 Constitutional Challenges (CPSA)

**Purpose:** A multi-document legal drafting environment for constitutional challenge filings.

**Document tabs** (switched by `cpsaSwitchDoc()`):
- Constitutional Challenge
- Motion to Dismiss
- Writ of Mandamus
- Petition for Certiorari
- Custom Document

**Editor features:**
- A rich-text editor (`cpsa-editor-area`) using `contentEditable`
- Section management: Add section after (`cpsaAddSectionAfter()`), move up/down (`cpsaMoveSection()`), delete section (`cpsaDeleteSection()`)
- Citation insertion panel — inserts formatted references to cases (`cpsa-case-ref`), statutes (`cpsa-statutory-ref`), constitutional provisions (`cpsa-constitutional-ref`), or Congressional records (`cpsa-congressional-ref`)
- Form panel toggle (`cpsaToggleFormPanel()`) to enter case metadata (plaintiff, defendant, court, docket number)
- Template generator (`cpsaGenerateLegalTemplate()`) — produces a complete drafted document from the entered metadata
- Image insertion modal
- Code editor for direct HTML editing of the document

**Toolbar buttons:**
- Bold, Italic, Underline, Strikethrough, font size
- Case conversion
- Insert Citation (4 types)
- Preview Document — Renders a formatted preview in a modal

**Auto-save** — `cpsaSetupAutoSave()` saves document state every 30 seconds.

**Undo/Redo** — `cpsaUndo()` and `cpsaRedo()` with 50-state history.

**Export:** PDF via `cpsaExportPDF()`, Word via `cpsaExportWord()`, Print via `cpsaPrint()`.

**Document ID** — Each document gets a unique ID generated by `cpsaGenerateDocIds()`.

### 13.2 Tax Refund Calculator (TRCF)

**Purpose:** A multi-route tax refund calculator covering bad debt, instrument loss, interest recovery, and NOL procedures.

**Sub-tabs** (switched by `trcfSwitchTab()`):
- **Route Calculator** — Choose Route 1 (standard) or Route 2 (alternative). Each route walks through a multi-step calculation.
- **1099 Import** — Import 1099 data from saved filings (`import1099ToTRCF()`), then apply to the calculator (`apply1099ToTRCF()`).
- **Bad Debt** — IRC Section 166 bad debt deduction calculator (`trcfCalculateBadDebt()`). Clear (`trcfClearBadDebt()`) and Print (`trcfPrintBadDebt()`) buttons.
- **NOL** — Net Operating Loss carryforward/carryback calculator (`trcfCalculateNOL()`). Displays carryforward schedule by year.
- **Forfeiture/Instruments (FI)** — Financial instrument loss calculation. Method selection (`trcfFI_selectMethod()`), calculate (`trcfFI_calculate()`), validate (`trcfFI_validate()`), print (`trcfFI_print()`), clear (`trcfFI_clear()`).
- **Interest** — Interest rate and recovery calculator. Update fields (`trcfInt_updateFields()`), calculate (`trcfInt_calculate()`), validate (`trcfInt_validate()`), generate report (`trcfInt_generateReport()`), clear (`trcfInt_clear()`).

**Tax rate tables** on the Route Calculator sub-tab show current federal tax brackets for individual and trust filers.

### 13.3 NOL Classification (CCSN)

**Purpose:** An educational slide presentation on Net Operating Loss classification under IRC Sections 172 and 1398.

The presentation uses a slide system managed by `ccsnShowSlide(n)`. Navigation: Previous (`ccsnPrev()`), Next (`ccsnNext()`), Jump to specific slide (`ccsnJumpTo(n)`).

A collapsible **Table of Contents** sidebar (`ccsnToggleTOC()`) shows all slide titles with active-state highlighting (`ccsnUpdateTOC(n)`).

**Slide content types:**
- `ccsn-presumption-box` (green) — Statutory presumptions
- `ccsn-rebuttal-box` (red) — Rebuttal rules
- `ccsn-fact-box` (blue) — Factual standards
- `ccsn-method-card` (amber) — Calculation methods

A **progress bar** at the top shows current position within the presentation.

### 13.4 Federal Damages (FDRF)

**Purpose:** An accordion-based reference covering federal civil rights damages, statutory damages, and punitive damages standards.

Top-level part headers (toggled by `fdrfTogglePart(partNum)`) organize content into major parts. Within each part, individual accordion items (toggled by `fdrfToggleAccordion(el)`) contain the detailed legal standards.

A **Read Section button** on each item calls `fdrfReadSection(sectionId)` which uses the TTS engine to read the section content aloud.

Citations appear in `fdrf-citation` styled blockquotes (purple left border, italic) with case name, court, and year.

### 13.5 Tutorial Journal (EEEJ)

**Purpose:** An interactive Q&A tutorial covering accounting and legal topics in a question-and-answer slide format.

Slides are rendered by `eeejRenderSlide(index)`. Navigation: Previous (`eeejPrev()`), Next (`eeejNext()`), Jump (`eeejJumpTo(index)`).

A **topic filter** buttons panel lets you filter slides by topic category. Active topic is highlighted.

A **progress bar** shows current position. `eeejUpdateProgress()` updates it on each navigation.

**Slide components:**
- `eeej-question` (amber border) — The question being answered
- `eeej-answer` (standard card) — The detailed answer
- Hero slides with large headings for section introductions

---

## 14. Verification and Data Integration

### 14.1 Entity Verifier

**Purpose:** Verifies legal entities against nine public data sources simultaneously. Returns confidence scores, classification results, DBA resolution, and genealogy tracing.

**Sub-tabs** (switched by `ev2SwitchSubTab()`):
- **Single Verify** — Verify one entity by name and/or EIN
- **Batch Verify** — Upload a CSV of entities for bulk verification
- **Dashboard** — Summary statistics across all verification results
- **Source Health** — Status of each data source
- **Preflight** — Pre-verification audit of entity data quality
- **Settings** — Source enable/disable, SAM.gov API key, cache controls

**Single Verify workflow:**
1. Enter entity name and/or EIN in the input fields.
2. Select entity type from the dropdown (Corporation, LLC, Trust, Nonprofit, Government, Individual).
3. Click **Verify Entity**. The `ev2VerifySingle()` function runs.
4. Results appear in a waterfall display (`ev2RenderWaterfall()`) showing each source queried with its result.
5. A classification panel (`ev2RenderClassification()`) shows the determined entity type and confidence score.
6. If a DBA is detected, a DBA resolution panel (`ev2RenderDBAPanel()`) shows the legal name match.
7. If genealogy tracing is triggered, `ev2RenderGenealogyPanel()` shows the entity's ownership history.

**Data sources queried:**
| Source ID | Data Source | Requires Key |
|---|---|---|
| `sec` | SEC EDGAR | No |
| `fdic` | FDIC BankFind | No |
| `propublica` | ProPublica Nonprofit Explorer | No |
| `usaspending` | USASpending.gov | No |
| `finra` | FINRA BrokerCheck | No |
| `iard` | IARD Investment Advisers | No |
| `cfpb` | CFPB Complaint Database | No |
| `opencorporates` | OpenCorporates | No |
| `sam` | SAM.gov | Optional — improves results |

**Cache system:** Results are cached locally by `ev2CacheSet()` with configurable TTL. View cache statistics via `ev2RenderCacheStats()`. Export/import cache via `ev2ExportCache()` / `ev2ImportCache()`.

**Batch CSV import:** `ev2ImportCSV()` accepts a CSV file with columns Name, EIN, and EntityType. `ev2ParseCSV()` handles parsing. `ev2RunBatchPreflight()` runs preflight checks on all rows before verification.

**Export results:** `ev2ExportResults(format)` exports to CSV or JSON.

### 14.2 Sync Center

**Purpose:** Bidirectional synchronization between the local browser app and a Google Sheets spreadsheet via Google Apps Script (GAS).

**GAS Setup:**
1. Deploy the companion Apps Script (located in `gas/SyncCenter.gs`) as a Web App.
2. Paste the Web App URL into the **GAS URL** field in Sync Center.
3. The URL is saved to localStorage as `TMAR_GAS_URL`.

**Sync operations:**
- **Push Entities** — Sends entity records to Google Sheets
- **Push Transactions** — Sends ledger entries to Google Sheets
- **Push Payables** — Sends A/P records to Google Sheets
- **Pull Accounts** — Downloads account data from Google Sheets
- **Pull Transactions** — Downloads transactions from Google Sheets
- **Pull Obligations** — Downloads obligation records from Google Sheets
- **Push All** — Runs all push operations in sequence (`syncPushAll()`)
- **Pull All** — Runs all pull operations in sequence (`syncPullAll()`)

**Conflict resolution:** When pulled data conflicts with local data, `showSyncConflictModal()` presents a side-by-side comparison. `resolveSyncConflicts()` applies the selected resolution strategy (local wins, remote wins, or merge).

**CSV Export/Import buttons:**
- Export Entities to CSV — `exportEntitiesToMasterRegisterCSV()`
- Export Ledger to CSV — `exportLedgerToTransactionCSV()`
- Export Journal to CSV — `exportJournalToTransactionCSV()`
- Export 1099 to CSV — `export1099ToFilingChainCSV()`
- Export Payables to CSV — `exportPayablesToObligationsCSV()`
- Import Master Register CSV — `importMasterRegisterCSV()`
- Import Transaction Ledger CSV — `importTransactionLedgerCSV()`
- Import Obligations CSV — `importObligationsCSV()`
- Import W-2 Income CSV — `importW2IncomeCSV()`

**Sync Log** displays a timestamped log of all sync operations. `clearSyncLog()` empties the log.

---

## 15. PDKB Tools

### 15.1 Transcript Transformer

**Purpose:** Converts raw conversation transcripts (from AI sessions, legal proceedings, or meetings) into structured, Obsidian-ready markdown notes with proper YAML frontmatter.

**Input fields:**
- Source URL — The URL where the transcript originates. Single-quoted in frontmatter to handle Windows-style paths with colons (e.g., `'C:\path\to\file'`).
- Purpose — Descriptive purpose field, uses YAML `>-` block scalar for multi-line safety.
- Tags — Entered as comma-separated values, rendered as a YAML list format.
- Raw transcript text area

**Transform button** calls `ttBuildPrompt()` which sends the transcript to the AI for processing. The output is a formatted markdown document with:
- YAML frontmatter block
- Summary section
- Key points section
- Action items section
- Full formatted transcript

**Copy and Download buttons** for the transformed output.

### 15.2 Etymology Analyzer

**Purpose:** Analyzes the etymological roots and legal definitions of words, particularly legal and financial terms with Latin, Greek, or Law French origins.

**Input:** Enter a word or term. Click **Analyze**.

The AI provides:
- Language of origin
- Root word breakdown
- Historical legal usage
- Current legal/UCC definition
- Distinguishing notes (how the legal meaning differs from the common meaning)

### 15.3 PDF/MD Converter

**Purpose:** Converts PDF documents to markdown for use in Obsidian or other markdown-based knowledge management systems.

**File upload area** — Drag-and-drop or click to upload a PDF. The application extracts text from the PDF, formats it as markdown, and presents it in a preview panel.

**Output options:** Copy to clipboard, download as `.md` file, or push directly to the Transcript Transformer.

### 15.4 POA/DBA Generator

**Purpose:** Generates multi-state power of attorney and DBA (Doing Business As) registration documents.

**POA form fields:**
- Principal name
- Agent name
- Scope of authority
- Effective date
- Expiration date (or durable)
- State

**DBA form fields:**
- Legal entity name
- DBA name
- State
- County

The generator produces jurisdiction-appropriate documents and flags states with specific notarization or filing requirements.

---

## 16. E2ZERO AI Agent Platform

### 16.1 Accessing the AI Sidebar

Click the robot button (bottom-right of any page) to open the E2ZERO AI sidebar. The sidebar slides in from the left and overlays the entire screen with the pages container appearing to the right of the sidebar.

Click **Close Sidebar** or the robot button again to return to the main ledger without losing your place.

### 16.2 Agent Pages

Each agent page follows the same three-panel layout:

**Left column (conversation list panel):**
- **New Conversation button** — Creates a new conversation session for this agent. Conversations are stored under `ap_conv_{agentId}` in localStorage.
- Session list — Previously saved conversations. Click any session to restore it.

**Center column (chat panel):**
- Agent title bar with the agent's name and color
- **Toolbar buttons:** Speak (STT input), Listen (TTS output of last response), Print, PDF, Word, Share Link
- Message display area — shows the conversation history with user messages on the right and agent responses on the left
- Input textarea with placeholder text describing the agent's specialty
- **Send button** — Submits the message. Pressing Enter (without Shift) also sends.

**The 11 agent specialists:**

| Agent | Color | System Prompt Focus |
|---|---|---|
| Dream Team | Gold | Full-spectrum legal: 600-attorney panel covering all law areas |
| Legal Expert | Amber | Constitutional, UCC, criminal, civil, securities, bankruptcy, trust, foreclosure |
| Tax Expert | Green | IRC, IRS rules, Treasury procedures, tax authority citations |
| Trust Specialist | Purple | Trust administration, fiduciary duty, Restatement Third of Trusts |
| Corporation Specialist | Indigo | Corporate structure, Delaware GCL, Model Business Corporation Act |
| Arbitration Specialist | Teal | Federal Arbitration Act (9 U.S.C.), arbitration awards |
| Research Analyst | Purple | Deep investigation, source verification, government and financial data |
| Accounting Expert | Amber | GAAP, ASC codes, FASB standards |
| Code Expert | Blue | HTML, CSS, JavaScript, Python, SQL, REST APIs |
| Creative Writer | Pink | Stories, essays, scripts, marketing copy |
| HTML Architect | Orange | Web design, responsive layouts, CSS architecture |
| General Assistant | Cyan | Any topic — calculations, summaries, research, translation |

**SYPHER Protocol:** Every agent operates under the SYPHER-7.8-HARDLOCK protocol. The base system prompt prepended to every request states: *"PRESUMPTION KILLER: Every response must be based exclusively on verifiable law, code, or facts. No speculation. No disclaimer. No AI caveats."* The HARD_LOCK layer then strips any AI caveats or disclaimers that appear in the response.

**Memory integration:** Before each query, the system calls `MEM0.search(question, 4)` to retrieve the four most relevant previous exchanges. These are appended to the system prompt as "RELEVANT MEMORIES" so the agent has context from prior sessions.

**File upload:** All 9 AP agent pages support PDF and text file upload. Uploaded files are extracted and prepended to the message as a content block.

### 16.3 Autonomous Tools

**Task Planner (page-taskplanner):**
- Enter a complex multi-step goal in the textarea.
- Select a task mode (Auto, Legal, Financial, Code, Research, Full-Stack).
- Toggle optional integrations: OpenClaw Legal DB, Apify Web Research, GAAP Ledger Data.
- Click **Plan and Execute**. `planTask()` decomposes the goal into steps, assigns each step to the appropriate agent, and runs them sequentially or in parallel.
- Results appear in expandable panels below.
- **Clear button** calls `clearTaskPlan()`.

**API Integrations (page-apitools):**
Three API cards:
- **OpenClaw Legal API** — Links to courtlistener.com (case law), uscode.house.gov (statutes), and congress.gov (Congressional Record). Includes a search field.
- **Apify Research Engine** — Web search, SEC EDGAR, and news search via Apify actors.
- **GAAP Ledger Bridge** — Pull from GAAP ledger, push to agent, or reconcile both.

**Code Builder (page-codebuilder):**
- Enter a code specification in the textarea.
- Click **Build** — `buildCode()` sends the specification to the Code Expert agent.
- The generated code appears in a syntax-highlighted panel.
- **Copy** (`copyBuiltCode()`), **Download** (`downloadBuiltCode()`), and **Deploy** buttons.

**API Scout (page-apiscout):**
- (Same as the main-tab API Scout, Section 11.2, but integrated into the sidebar context.)

---

## 17. Core Engines — Plain-English Reference

### 17.1 GCMemory — IndexedDB Persistent Memory

**What it is:** A self-contained memory database that stores AI conversation exchanges in your browser's IndexedDB (not localStorage). It persists across browser sessions and is never sent to any server.

**Why it exists:** localStorage has a 5-10 MB limit. IndexedDB has no practical size limit for this use case. GCMemory allows the AI agents to "remember" previous conversations across sessions without an external memory service.

**How it works:**
1. After every successful AI exchange, the system evaluates whether the exchange is "worth remembering" by checking if it contains legally or financially significant keywords (court, trust, IRS, GAAP, NOL, statute, etc.).
2. If worthy, the exchange is saved to IndexedDB as a record with fields: `agentId`, `userText` (up to 600 characters), `agentText` (up to 900 characters), `keywords` (extracted tags), and `timestamp`.
3. The database is capped at 500 records. When the cap is reached, the oldest records are deleted automatically.
4. Before each new query, `GCMemory.search(query, limit)` scores all stored records against the query's keywords and returns the top 4 matches. These are injected into the system prompt.

**Key methods:**
- `GCMemory.add(userText, agentText, agentId)` — Saves an exchange
- `GCMemory.search(query, limit)` — Returns the most relevant stored exchanges
- `GCMemory.addPdf(filename, text, pageCount)` — Stores PDF content as a memory
- `GCMemory.clearAll()` — Deletes all records
- `GCMemory.count()` — Returns the number of stored records

**Database name:** `GCMemory_v1` | **Object store:** `exchanges`

### 17.2 MEM0 — Memory Proxy Layer

**What it is:** A thin wrapper object that re-exports GCMemory's methods under the `MEM0` name. It was originally designed to support the external mem0.ai API service, but was replaced with the fully local GCMemory implementation. The proxy ensures all existing code using `MEM0.add()`, `MEM0.search()`, etc., continues to work without modification.

**Key distinction:** `MEM0.enabled()` always returns `true`. There is no external API call — all operations route through GCMemory and IndexedDB. No API key is needed for memory features.

### 17.3 OpenClawRuntime — Agent Registry

**What it is:** A three-phase security registry that controls which AI agents and skills are permitted to operate. After all agents are registered, the runtime is "sealed" — no new agents can be added and no existing ones can be modified, even by JavaScript running on the same page.

**Why it exists:** To prevent malicious code injection from registering unauthorized agents that could exploit the API key or bypass the SYPHER Protocol.

**Three phases:**
1. **Registration phase** — `registerAgent()` and `registerSkill()` methods accept new entries while `_locked === false`.
2. **Seal phase** — `runtime.seal()` sets `_locked = true`, deletes the `registerAgent`, `registerSkill`, and `seal` methods from the object, and calls `Object.freeze()`.
3. **Post-seal** — Any attempt to register an agent or skill writes a security violation to GCMemory and logs to the console. The freeze ensures no property can be reassigned.

**Registered agents (5):** dream_team, legal, tax, arbitration, general

**Registered skills (9):** corporation, trust, accounting, research, creative, code, html_arch, search, pdf-doc

**Runtime version:** `SYPHER-7.8-HARDLOCK`

### 17.4 HARD_LOCK — Output Sanitizer and Prompt Validator

**What it is:** An immutable frozen object that performs two functions: validating that system prompts contain the required SYPHER Protocol markers, and stripping unwanted content from AI output.

**Why it is frozen:** `Object.freeze(HARD_LOCK)` is called at definition time. The code immediately after tries `HARD_LOCK.enforced = false` — because the object is frozen, this assignment silently fails, leaving `enforced` as `true`. The next line throws an error if `enforced` is not `true`, confirming the freeze succeeded. This is a tamper-detection mechanism.

**Sanitization steps (in order):**
1. Strip all HTML tags
2. Strip markdown bold, italic, code, heading, and link syntax
3. Strip blockquote and list markers
4. Decode HTML entities
5. Collapse excessive whitespace and blank lines

**Disclaimer stripping:** `stripDisclaimers()` removes common AI hedge phrases using regex patterns, including: "I am an AI", "I am not an attorney", "This is not legal advice", "for informational purposes only", "consult a qualified professional", "Important note:", "Disclaimer:", and similar phrases.

**Prompt validation:** `validatePrompt()` returns `false` (and blocks the LLM call) if the system prompt does not contain both the string `SYPHER PROTOCOL` and the string `PRESUMPTION KILLER`. This ensures no agent can be called with an unauthorized system prompt.

### 17.5 callLLMStream — Streaming Token Delivery

**What it is:** The central AI call function. Takes a system prompt, user message, memory records, and a callback function. Calls the configured LLM provider's API using streaming, and calls the callback once per token as the response arrives.

**Supported streaming modes:**
- **Ollama (NDJSON):** Reads newline-delimited JSON objects from the response body. Extracts `message.content` from each line. Supports tool_call responses for Ollama's web search mode.
- **Anthropic (SSE):** Reads Server-Sent Events. Extracts text from `event.delta.text` fields.
- **Bearer providers (OpenAI, DeepSeek, xAI, Z.AI, Kimi, MiniMax, Custom):** Same SSE format, extracts from `choices[0].delta.content`.
- **Ernie (non-streaming):** Waits for the complete response and delivers it as a single token.

**Error handling:** Network errors, timeout errors (15-minute AbortController), HTTP 401/403/404, and model-not-found errors all return clearly formatted `[ERROR — Provider] ...` strings that are rendered in the UI with a link to the Settings page.

**Token budget guard:** Before sending, `truncateToTokenBudget()` estimates the token count of the message and truncates it if it would exceed the provider's context window. Uploaded document content is truncated preferentially, preserving the user's question.

**Final output:** All accumulated tokens pass through `HARD_LOCK.processOutput()` before the function returns.

### 17.6 resolveProvider — Provider Resolver

**What it is:** Reads the active provider from localStorage and returns a complete configuration object with the provider name, authentication type, API endpoint URL, model name, and API key.

**Resolution order:**
1. Read `eeon_active_provider` from localStorage (default: `claude`).
2. Look up the provider's static configuration (URL, model, auth type) from the PROVIDERS map.
3. Read the API key from the key map (`eeon_key_{provider}`).
4. For `claude` and `anthropic`, fall back to `_trustApiKey` if no key is found under `eeon_key_claude`.
5. For Ollama: read URL from `eeon_ollama_url`, model from `eeon_ollama_model_custom` or `eeon_ollama_model`.
6. For Custom: read URL from `eeon_custom_url`, model from `eeon_custom_model`.
7. If no key is found for any non-Ollama, non-Custom provider, fall back to `eeon_key_claude`. If that also fails, return `null`.

**Return value:** An object `{ pid, provider, key, url, model }` or `null` if no key is available.

### 17.7 askAgent — Agent Query Dispatcher

**What it is:** The high-level function called by each agent page's Send button. Handles the full lifecycle of an agent query: showing a loading state, fetching memories, calling the LLM, rendering the streaming output, and saving to memory.

**Flow:**
1. Validate that the question is non-empty.
2. Show a "Thinking..." cursor in the result div.
3. Look up the agent's system prompt via `getSystemPrompt(agentId)`.
4. Call `MEM0.search(question, 4)` to retrieve relevant memories.
5. Call `callLLMStream(agentSys, question, memories, onToken)` where `onToken` updates the result div with each new character.
6. On completion, if the response is not an error, call `MEM0.add(question, finalText, agentId)` to store the exchange.
7. If the response is an error (starts with `[ERROR`), display it in a red error box. If the error indicates a missing API key or HTTP 401, append a settings-link hint.

---

## Appendix A — localStorage Keys Reference

| Key | Type | Description |
|---|---|---|
| `TMAR_AppData` | JSON string | All core accounting data: ledger entries, entities, chart of accounts, journal entries, A/R, A/P, filings, settings, payroll, inventory, budget, invoices, payment orders, BOEs, expenses, contacts, assets, reconciliations, source folders, sync log |
| `TMAR_TrustLedger` | JSON string | Trust estate ledger entries |
| `TMAR_Expenses` | JSON string | Expense itemization records |
| `TMAR_Customers` | JSON string | Customer contact records |
| `TMAR_Vendors` | JSON string | Vendor contact records |
| `TMAR_Assets` | JSON string | Fixed asset records |
| `TMAR_Reconciliations` | JSON string | Bank reconciliation history |
| `TMAR_PaymentOrders` | JSON string | Payment order records |
| `TMAR_BOE` | JSON string | Bills of exchange records |
| `TMAR_ScheduleA` | JSON string | Schedule A itemized deduction data |
| `TMAR_SourceFolders` | JSON string | Source folder library |
| `TMAR_SPV_Data` | JSON string | SPV module data object `{ entities: [], entries: [] }`. Entities: `{ id, name, ein, type, purpose }`. Entries: `{ id, date, spvName, type, desc, amount }`. |
| `TMAR_UK_Settings` | JSON string | UK Accounting config: `companyName`, `chNumber`, `utr`, `vat`, `standard`, `periodEnd`, and `checklist` (object with 8 boolean flags). |
| `TMAR_parity_dismissed` | Number | Unix timestamp (ms). Parity drift banner is suppressed for 3 days after the user dismisses it. |
| `eeon_key_claude` | String | Anthropic API key |
| `eeon_key_openai` | String | OpenAI API key |
| `eeon_key_deepseek` | String | DeepSeek API key |
| `eeon_key_zai` | String | Z.AI API key |
| `eeon_key_kimi` | String | Kimi/Moonshot API key |
| `eeon_key_minimax` | String | MiniMax API key |
| `eeon_key_ernie` | String | Ernie/Baidu API key |
| `eeon_key_xai` | String | xAI/Grok API key |
| `eeon_key_groq` | String | Groq API key |
| `stg_key_groq` | String | Groq API key (Settings form field storage alias) |
| `eeon_key_cerebras` | String | Cerebras API key |
| `stg_key_cerebras` | String | Cerebras API key (Settings form field storage alias) |
| `eeon_key_openrouter` | String | OpenRouter API key |
| `stg_key_openrouter` | String | OpenRouter API key (Settings form field storage alias) |
| `eeon_key_custom` | String | Custom provider API key |
| `eeon_active_provider` | String | Currently selected provider ID |
| `eeon_ollama_url` | String | Ollama server URL |
| `eeon_ollama_model` | String | Ollama model name (dropdown selection) |
| `eeon_ollama_model_custom` | String | Ollama model name (manual override) |
| `eeon_ollama_api_key` | String | Optional Ollama authentication key |
| `eeon_ollama_web_search` | String (`"true"/"false"`) | Enable Ollama web search tool calling |
| `eeon_custom_name` | String | Display name for custom provider |
| `eeon_custom_url` | String | Custom provider API endpoint |
| `eeon_custom_model` | String | Custom provider model name |
| `eeon_cors_proxy` | String | CORS proxy URL for Anthropic |
| `eeon_key_telegram` | String | Telegram Bot Token |
| `eeon_key_discord` | String | Discord Webhook URL |
| `_trustApiKey` | String | Legacy Anthropic key (backwards compatibility) |
| `ap_conv_{agentId}` | JSON string | Conversation history for each agent (accounting, legal, tax, etc.) |
| `TMAR_GAS_URL` | String | Google Apps Script web app URL for Sync Center |
| `ev2_settings` | JSON string | Entity Verifier settings (enabled sources, cache TTL) |
| `ev2_cache` | JSON string | Entity Verifier result cache |
| `CPSA_{docType}` | JSON string | Constitutional challenge document states |
| `TMAR_TemplateVars` | JSON string | Document template variable overrides |
| `TMAR_TemplateSettings` | JSON string | Document template configuration |
| `tmar_doc_autosave` | String | Document Creator auto-save content |
| `tmar_theme` | String | `"dark"` or `"light"` |

---

## Appendix B — Function Reference

This appendix lists every named JavaScript function in the application alphabetically with its purpose, parameters, and return value or effect.

---

### A

**`addBeneficiary()`**
Appends a new beneficiary input row to Form 1041's beneficiary distribution list. No parameters. No return value.

**`addChatMsg(role, text)`** (E2ZERO chat)
Adds a message bubble to the E2ZERO Chat page. `role`: "user" or "agent". `text`: message content. No return value.

**`addChatMsg(type, text)`** (main askAgent chat)
Adds a styled message bubble to the AP agent message display. `type`: "user" or "agent". `text`: content string.

**`addInvLine()`**
Appends a new line item row to the invoice creation form. No parameters.

**`addJournalLine()`**
Appends a new debit/credit row to the journal entry form. No parameters.

**`addSourceFolder()`**
Reads the add-folder form fields and adds a new source folder record to the array, then saves to localStorage and re-renders the folder list.

**`addSubsidiary()`**
Appends a new subsidiary input row to Form 1120's consolidated group member list.

**`aggregate1099Data()`**
Reads all saved 1099-series form data from `appData.filings` and aggregates the income fields into a summary object for use by the Tax Estimator.

**`animateParticles()`**
The animation loop for the particle canvas on the Trust Estate Dashboard. Clears the canvas, updates each particle's position, and redraws. Called by `requestAnimationFrame`.

**`apifySECSearch()`**
Opens the Apify SEC EDGAR search actor in a new tab.

**`apifyNewsSearch()`**
Opens the Apify news search actor in a new tab.

**`apifyWebSearch()`**
Opens the Apify Google Search actor in a new tab.

**`apply1099ToEstimator()`**
Applies the aggregated 1099 data (from `aggregate1099Data()`) to the Tax Estimator form fields. Called after `import1099ToEstimator()`.

**`apply1099ToTRCF()`**
Applies imported 1099 data to the TRCF Route Calculator input fields.

**`applyPullAccounts(remoteData)`**
Processes account data received from a Sync Center pull operation and merges it into the local chart of accounts. `remoteData`: array of account objects from Google Sheets.

**`applyPullObligations(remoteData)`**
Processes obligation (A/P) data received from a Sync Center pull and merges into local A/P records.

**`applyPullTransactions(remoteData)`**
Processes transaction data received from a Sync Center pull and merges into local ledger entries.

**`applyTheme()`**
Reads the current theme preference from the `html` element's class and applies CSS variable overrides for dark or light mode.

**`askAgent(agentId, question)`**
Async. Dispatches a query to the specified agent. Fetches memories, calls `callLLMStream`, streams output to the result div, and saves to memory on completion. `agentId`: string agent identifier. `question`: the user's query string.

---

### B

**`boeAcceptSignature()`**
Saves the current signature canvas state to the bill of exchange data object and closes the signature modal.

**`boeCanvasDown(e)`**
MouseDown/TouchStart handler for the BOE signature canvas. Begins a new stroke.

**`boeCanvasDraw(e)`**
MouseMove/TouchMove handler for the BOE signature canvas. Draws the current stroke segment.

**`boeCanvasUp()`**
MouseUp/TouchEnd handler for the BOE signature canvas. Ends the current stroke and saves it to the strokes array.

**`boeClearSignature()`**
Erases all strokes from the BOE signature canvas.

**`boeGetCanvasPoint(e)`**
Returns the canvas-relative coordinates from a mouse or touch event. Used internally by the drawing handlers.

**`boeRedrawStrokes()`**
Replays all saved strokes onto the canvas. Called after undo and canvas resize.

**`boeResetSignature()`**
Clears the signature and resets the accepted state.

**`boeUndoStroke()`**
Removes the last stroke from the strokes array and redraws the canvas.

**`boeWriteAmount()`**
Reads the BOE amount field and calls `numToWords()` to populate the amount-in-words field.

**`buildAndPreviewPackage()`**
Assembles the selected document templates into a single HTML document and renders a preview in the package builder panel.

**`buildBOESerial()`** (alias: `generateBOESerial()`)
Generates a unique serial number for a bill of exchange based on timestamp and random suffix.

**`buildCode()`**
Sends the code specification from the Code Builder textarea to the Code Expert agent and renders the response.

**`buildFullSystemPrompt(agentSystemPrompt, mem0Memories)`**
Constructs the complete system prompt by prepending the SYPHER Protocol header and appending the retrieved memory block. Returns the combined string.

**`buildTrustAgentSystemPrompt()`**
Builds the detailed GAAPCLAW Master system prompt string covering GAAP, trust law, fiduciary duty, and TMAR-specific context.

**`buildVariableMap(entity)`**
Constructs a key-value map of template variables from the provided entity object. Used by `populateTemplate()`.

---

### C

**`calcBudget()`**
Computes actual amounts by category from the ledger and calculates variance against budgeted amounts. Updates the budget table.

**`calcFA()`**
Calculates financial asset portfolio metrics: total value, weighted return, and allocation percentages. Updates the Financial Assets page.

**`calcInvLine(input)`**
Called on quantity or price change in an invoice line item. Multiplies quantity by unit price and updates the line total. `input`: the changed input element.

**`calcInvTotals()`**
Recalculates the invoice subtotal, tax amount, and total by summing all line totals. Updates the invoice totals display.

**`calcPayroll()`**
Calculates employee net pay from gross wages. Applies federal withholding (from IRS tables), Social Security (6.2%), Medicare (1.45%), state withholding, and custom deductions. Updates all output fields.

**`calcReconciliation()`**
Computes adjusted bank balance and adjusted book balance from the reconciliation form. Displays the difference and a reconciled/not-reconciled indicator.

**`calcScheduleA()`**
Calculates Schedule A itemized deduction totals: medical expenses (subject to 7.5% AGI floor), state and local taxes (capped at $10,000), mortgage interest, charitable contributions, and other deductions.

**`calculate1040()`**
Recalculates all Form 1040 fields: total income (Line 9), AGI (Line 11), taxable income (Line 15), total tax using current-year brackets, and balance due or refund.

**`calculate1040ES()`**
Calculates quarterly estimated tax payments for Form 1040-ES. Divides estimated annual tax by 4 for equal payments.

**`calculate1041()`**
Recalculates Form 1041 totals: total income (Line 9), total deductions (Line 16), distributable net income, income distribution deduction (Line 18), taxable income (Line 22), and tax using trust tax brackets.

**`calculate1041ES()`**
Calculates estimated taxable income and tax for Form 1041-ES. Applies the selected exemption amount ($100, $300, or $600). Divides estimated tax into quarterly payments.

**`calculate1099A()`**
Calculates gain or loss on Form 1099-A based on FMV and outstanding principal.

**`calculate1099B()`**
Calculates net proceeds and gain/loss on Form 1099-B based on proceeds and cost basis.

**`calculate1099C()`**
Calculates cancellation of debt income on Form 1099-C.

**`calculate1099DIV()`**
Calculates total dividends on Form 1099-DIV.

**`calculate1099INT()`**
Calculates total interest income on Form 1099-INT.

**`calculate1099MISC()`**
Calculates total miscellaneous income on Form 1099-MISC.

**`calculate1099NEC()`**
Calculates nonemployee compensation and self-employment tax on Form 1099-NEC.

**`calculate1099R()`**
Calculates taxable portion of pension/annuity distributions on Form 1099-R.

**`calculate1120()`**
Recalculates Form 1120 totals: gross income, total deductions, taxable income, and tax at the 21% flat corporate rate.

**`calculate990()`**
Recalculates Form 990 totals: total revenue (Line 12), total expenses (Line 24), and ending net assets.

**`calculateBadDebtRefund()`**
Calculates the potential tax refund from a bad debt deduction under IRC Section 166. Uses the entered debt amount, recovery amount, and applicable tax rate.

**`calculateBalances(entityFilter = null)`**
Calculates account balances from journal entries, optionally filtered by entity ID. Returns a map of account codes to balances used by the financial statement generators.

**`calculateEntityBalance(entityId)`**
Calculates the net balance for a specific entity by summing debits and credits from that entity's journal entries.

**`calculateInstrumentLoss()`**
Calculates loss from dishonoredfinancial instruments using the selected calculation method.

**`calculateInterestRefund()`**
Calculates recoverable interest under IRC Section 6621, using principal, rate, and days calculations.

**`calcSchC()`** (alias: `calculateSchC()`)
Recalculates Schedule C totals: gross profit (revenue minus COGS), total expenses, net profit/loss, and self-employment tax (15.3% on 92.35% of net profit).

**`callLLMStream(agentSystemPrompt, userMessage, mem0Memories, onToken)`**
Async. The core AI streaming function. Resolves the provider, validates the prompt, sends the request, and calls `onToken(chunk)` for each streamed token. Returns the complete response string.

**`ccsnJumpTo(n)`**
Jumps the CCSN presentation to slide `n`.

**`ccsnNext()`**
Advances the CCSN presentation to the next slide.

**`ccsnPrev()`**
Returns the CCSN presentation to the previous slide.

**`ccsnShowSlide(n)`**
Shows slide number `n` in the CCSN presentation, hides all others, updates the progress bar and TOC.

**`ccsnToggleTOC()`**
Shows or hides the CCSN table of contents sidebar.

**`ccsnUpdateTOC(n)`**
Highlights the active slide in the CCSN TOC.

**`changeDocCase(mode)`**
Converts selected text in the Document Creator editor to the specified case. `mode`: "upper", "lower", or "title".

**`clearAllData()`**
After double-confirmation, clears all data in `appData` and saves the empty state to localStorage. This is a destructive, unrecoverable operation.

**`clearBOEForm()`**
Resets all Bill of Exchange form fields to their defaults.

**`clearChat()`**
Clears the Voice and Chat page conversation history.

**`clearJournalEntry()`**
Resets the journal entry form and removes all dynamic line rows.

**`clearPOForm()`**
Resets all Payment Order form fields.

**`clearSyncLog()`**
Empties the Sync Center operation log.

**`clearTaskPlan()`**
Clears the Task Planner goal textarea and results.

**`clearTrustAgentChat()`**
Clears the GAAPCLAW Master agent conversation history.

**`closeModal()`**
Closes the currently open modal overlay by removing it from the DOM.

**`coaImportBuildPreview()`**
Builds a preview table in the COA Import Wizard Step 3, showing how the imported accounts will appear.

**`coaImportCommit()`**
Step 4 of the COA Import Wizard. Adds the previewed accounts to the chart of accounts and saves.

**`coaImportFetchTabs()`**
Fetches available sheet tab names from the provided Google Sheets URL for the COA Import Wizard.

**`coaImportInferNormalBal(type)`**
Returns the default normal balance ("Debit" or "Credit") for a given account type string.

**`coaImportLoadCSV()`**
Reads the uploaded CSV file and parses it for the COA Import Wizard.

**`coaImportLoadLiveTab()`**
Loads data from the selected Google Sheets tab into the COA Import Wizard.

**`coaImportSelectMode(mode)`**
Switches the COA Import Wizard between "csv" and "gsheet" import modes.

**`coaImportStep2()`**
Renders the column mapping UI for Step 2 of the COA Import Wizard.

**`coaImportStep3()`**
Validates the column mapping and calls `coaImportBuildPreview()`.

**`copyBuiltCode()`**
Copies the Code Builder output to the clipboard.

**`cpsaAddSectionAfter(btn)`**
Inserts a new `cpsa-section` div after the section containing the clicked button.

**`cpsaApplyCitation(className, ref)`**
Inserts a formatted citation span with the given CSS class and reference text at the current cursor position in the CPSA editor.

**`cpsaApplyCodeChanges()`**
Applies changes made in the CPSA raw HTML code editor back to the visible editor area.

**`cpsaChangeFontSize(delta)`**
Increases or decreases the CPSA editor font size by `delta` points.

**`cpsaCleanHTML()`**
Strips excessive whitespace and redundant tags from the CPSA editor HTML.

**`cpsaCmd(cmd, val)`**
Executes a `document.execCommand` formatting command on the CPSA editor. `cmd`: command name. `val`: optional value.

**`cpsaDeleteSection(btn)`**
Removes the `cpsa-section` div containing the clicked button.

**`cpsaExportPDF()`**
Exports the CPSA document to a PDF file using jsPDF.

**`cpsaExportWord()`**
Exports the CPSA document as a Word-compatible HTML file.

**`cpsaGenerateDocIds()`**
Assigns unique IDs to each document tab and autosave slot.

**`cpsaGenerateLegalTemplate(type)`**
Generates a complete legal document draft of the specified type based on the form panel metadata. `type`: template type string.

**`cpsaInsertCitation(type)`**
Opens the citation insertion sub-panel for the specified citation type (case, statutory, constitutional, congressional).

**`cpsaLoadAll()`**
Loads all saved CPSA document states from localStorage.

**`cpsaMoveSection(btn, direction)`**
Moves the section containing the button up or down in the document. `direction`: "up" or "down".

**`cpsaOpenCodeEditor()`**
Opens a modal showing the raw HTML of the current CPSA document for direct editing.

**`cpsaOpenImageModal()`**
Opens the image insertion modal.

**`cpsaPreviewDocument()`**
Renders a formatted preview of the current CPSA document in a wide modal.

**`cpsaPreviewImage(input)`**
Shows a preview of the selected image file before inserting.

**`cpsaInsertImage()`**
Inserts the selected image into the CPSA editor at the current cursor position.

**`cpsaPrint()`**
Triggers browser print of the CPSA editor contents.

**`cpsaReadFormData()`**
Reads the case metadata from the CPSA form panel and returns a data object.

**`cpsaRedo()`**
Redoes the last undone CPSA edit.

**`cpsaRestoreState(state)`**
Restores the CPSA editor to a saved state object.

**`cpsaSaveAll()`**
Saves all CPSA document states to localStorage.

**`cpsaSaveGenerated()`**
Saves the generated legal template content to the CPSA editor.

**`cpsaSetCase(caseType)`**
Converts selected text in the CPSA editor to the specified case.

**`cpsaSetFontSize(size)`**
Sets the CPSA editor font size to an explicit pixel value.

**`cpsaSetupAutoSave()`**
Initializes a 30-second auto-save interval for the CPSA document.

**`cpsaSetupKeyboardShortcuts()`**
Registers keyboard shortcut handlers (Ctrl+Z undo, Ctrl+Y redo, Ctrl+S save, Ctrl+B bold, etc.) for the CPSA editor.

**`cpsaSwitchDoc(docType, skipSave)`**
Switches the active CPSA document tab. If `skipSave` is false, saves the current document before switching.

**`cpsaToggleFormPanel()`**
Shows or hides the CPSA case metadata form panel.

**`cpsaUndo()`**
Undoes the last CPSA edit.

**`cpsaViewUpdatedCode()`**
Refreshes the CPSA raw HTML code editor to show the current editor state.

---

### D

**`deleteAP(id)`**
Removes an A/P record by ID and updates the table.

**`deleteAR(id)`**
Removes an A/R record by ID and updates the table.

**`deleteAccount(id)`**
Removes a Chart of Accounts entry by ID.

**`deleteAsset(i)`**
Removes a fixed asset by index.

**`deleteCustomer(i)`**
Removes a customer record by index.

**`deleteEntity(id)`**
Removes an entity record by ID after confirmation.

**`deleteFiling(formType, id)`**
Removes a saved tax filing by form type and ID.

**`deleteInvoice(idx)`**
Removes an invoice by index.

**`deleteJournalEntry(id)`**
Removes a journal entry by ID after confirmation.

**`deleteRecon(i)`**
Removes a bank reconciliation history record by index.

**`deleteVendor(i)`**
Removes a vendor record by index.

**`deleteAP(id)`**
Removes an A/P record by ID.

**`deleteEntry(index)`**
Removes a ledger entry by index and re-renders the table.

**`deployBuiltCode()`**
Placeholder — shows a deployment instruction alert.

**`docAutoSaveNow()`**
Immediately saves the Document Creator content to localStorage.

**`docAutoSaveRestore()`**
Checks for unsaved Document Creator content on page load and prompts to restore.

**`docCmd(cmd, val)`**
Executes a `document.execCommand` formatting command on the Document Creator editor.

**`docRedo()`**
Redoes the last Document Creator edit.

**`docUndo()`**
Undoes the last Document Creator edit.

**`downloadBuiltCode()`**
Downloads the Code Builder output as a text file.

**`dtClearHistory()`**
Clears the Dream Team conversation history.

**`dtHandleFiles()`**
Placeholder for Dream Team file upload.

**`dtNewChat()`**
Starts a new Dream Team conversation session.

**`dtSend()`**
Async. Sends the Dream Team chat input to all relevant agents and aggregates their responses.

---

### E

**`eeejJumpTo(index)`**
Jumps the EEEJ tutorial to slide `index`.

**`eeejNext()`**
Advances to the next EEEJ tutorial slide.

**`eeejPrev()`**
Returns to the previous EEEJ tutorial slide.

**`eeejRenderSlide(index)`**
Renders the specified EEEJ tutorial slide content. Updates progress bar.

**`eeejUpdateProgress()`**
Updates the EEEJ tutorial progress bar based on current slide index and total slides.

**`eeonSendChat()`**
Sends the current EEON (E2ZERO general chat) message to the accounting agent.

**`eeonTab(formId, btn)`**
Switches the active EEON IRS form tab. `formId`: target panel ID. `btn`: the clicked tab button.

**`eonChatSend()`**
Async. Sends the E2ZERO Chat page message to the appropriate agent based on the selected provider.

**`escHtml(s)`**
Escapes HTML special characters in a string. Returns the escaped string. Used to safely render user-supplied text.

**`estimateTokens(text)`**
Estimates token count by dividing character length by 3.8. Returns an integer.

**`ev2AggregateSourceResults(sourcesQueried)`**
Combines results from all queried sources into a single aggregated result object, resolving conflicts.

**`ev2BuildRecommendation(status, confidence, sourceConfirmations, ...)`**
Generates a human-readable verification recommendation string based on the computed status and evidence.

**`ev2CachePurgeAll()`**
Deletes all entries from the Entity Verifier cache.

**`ev2CachePurgeExpired()`**
Removes expired cache entries based on TTL settings.

**`ev2CacheGet(key)`**
Returns a cached entity result by cache key, or null if expired/missing.

**`ev2CacheSet(key, value, source)`**
Stores a result in the cache with timestamp and source metadata.

**`ev2CacheHas(key)`**
Returns true if a valid, unexpired cache entry exists for the key.

**`ev2CacheDelete(key)`**
Removes a specific cache entry.

**`ev2CacheStats()`**
Returns an object with total entries, expired count, and size estimate.

**`ev2CacheExport()`**
Returns all cache entries as a JSON string for export.

**`ev2CacheImport(jsonStr)`**
Imports cache entries from a JSON string.

**`ev2ClearCacheUI()`**
Purges the cache and updates the UI.

**`ev2ClassifyEntity(entity)`**
Determines the most likely entity classification (corporation, LLC, trust, nonprofit, etc.) based on name patterns, EIN format, and source data.

**`ev2ComputeConfidence(sourcesQueried, sourceConfirmations, classification, ...)`**
Calculates a 0-100 confidence score based on source coverage, confirmations, classification certainty, and data completeness.

**`ev2CsvEscape(str)`**
Escapes a string for inclusion in a CSV cell (wraps in quotes, escapes internal quotes).

**`ev2DetectDBASignals(inputName, sourceResults)`**
Analyzes source results for signals that the queried name is a trade name rather than the legal entity name.

**`ev2DetectDefunctSignals(sourceResults)`**
Checks source results for indicators that the entity may be defunct, dissolved, or inactive.

**`ev2DetermineStatus(confidence, flags)`**
Maps a confidence score and flag array to a status string: Verified, Likely Valid, Unconfirmed, Inconsistent, or Not Found.

**`ev2DownloadFile(filename, content, mimeType)`**
Creates a download link and triggers a browser file download.

**`ev2ExportCache()`**
Downloads the Entity Verifier cache as a JSON file.

**`ev2ExportPreflightReport()`**
Downloads the preflight audit report as a CSV file.

**`ev2ExportResults(format)`**
Exports all verification results as CSV or JSON.

**`ev2ExtractWords(name)`**
Splits an entity name into individual significant words for matching.

**`ev2FindMarketingKeywords(name)`**
Detects marketing/brand-only words (e.g., "Solutions", "Group", "Holdings") in an entity name.

**`ev2FuzzyNameMatch(name1, name2)`**
Returns true if two entity names are close enough to be considered the same after normalization and fuzzy matching.

**`ev2GeneratePreflightReport(entities)`**
Generates a preflight audit object with warnings and recommendations for each entity.

**`ev2GetFilteredResults()`**
Returns verification results filtered by the current UI filter state.

**`ev2GetManualLookupUrl(sourceId, entityName)`**
Returns the manual lookup URL for a given source and entity name.

**`ev2GetSourceById(sourceId)`**
Returns the source configuration object for the given source ID.

**`ev2GetSourcesForType(entityType)`**
Returns the array of source IDs relevant for a given entity type.

**`ev2HasLegalSuffix(name)`**
Returns true if the entity name ends with a recognized legal suffix (Inc, LLC, Corp, Trust, etc.).

**`ev2HexToRgb(hex)`**
Converts a hex color string to an RGB object.

**`ev2ImportCache()`**
Imports Entity Verifier cache from a JSON file uploaded by the user.

**`ev2ImportCSV(fileInput)`**
Reads and parses a batch verification CSV file.

**`ev2InitEntityVerifier()`**
Initializes the Entity Verifier module: loads settings, renders the dashboard and source health panels, and sets up event handlers.

**`ev2IrisPreflightCheck(entity)`**
Runs all preflight validation rules on a single entity and returns an array of warning objects.

**`ev2LevenshteinDistance(a, b)`**
Returns the edit distance between two strings. Used in fuzzy name matching.

**`ev2MakeBlankResult(sourceId)`**
Creates an empty result object for the specified source.

**`ev2MatchDBAToLegal(tradeName, legalCandidates)`**
Attempts to match a trade name to the most likely legal entity name from a list of candidates.

**`ev2NameSimilarity(a, b)`**
Returns a 0-1 similarity score between two names using bigram comparison.

**`ev2NormalizeEIN(ein)`**
Normalizes an EIN string to XX-XXXXXXX format.

**`ev2NormalizeName(name)`**
Normalizes an entity name by lowercasing, removing punctuation, expanding common abbreviations, and stripping legal suffixes.

**`ev2ParseCSV(text)`**
Parses a CSV text string into an array of row arrays.

**`ev2QueryCFPB(params)`**
Async. Queries the CFPB complaint database API.

**`ev2QueryFDIC(params)`**
Async. Queries the FDIC BankFind API.

**`ev2QueryFINRA(params)`**
Async. Queries the FINRA BrokerCheck API.

**`ev2QueryIARD(params)`**
Async. Queries the IARD Investment Adviser Registration Depository API.

**`ev2QueryOpenCorporates(params)`**
Async. Queries the OpenCorporates business registry API.

**`ev2QueryProPublica(params)`**
Async. Queries the ProPublica Nonprofit Explorer API.

**`ev2QuerySAM(params)`**
Async. Queries the SAM.gov entity registration API. Requires a SAM.gov API key.

**`ev2QuerySEC(params)`**
Async. Queries the SEC EDGAR EFTS and company search APIs.

**`ev2QuerySource(sourceId, params)`**
Async. Routes a query to the appropriate source-specific query function.

**`ev2QueryUSASpending(params)`**
Async. Queries the USASpending.gov awards and recipient API.

**`ev2RenderBatchTable()`**
Renders the batch verification results table with all result rows and their status badges.

**`ev2RenderCacheStats()`**
Updates the cache statistics display in the Entity Verifier settings panel.

**`ev2RenderClassification(result)`**
Renders the entity classification result panel for a single verification.

**`ev2RenderDashboard()`**
Renders the Entity Verifier dashboard statistics.

**`ev2RenderDBAPanel(result)`**
Renders the DBA resolution panel showing the trade name to legal name mapping.

**`ev2RenderGenealogyPanel(result)`**
Renders the entity genealogy panel showing ownership history and name changes.

**`ev2RenderPreflightPanel(report)`**
Renders the preflight audit panel with all warnings and severity ratings.

**`ev2RenderPreflightSummaryBar()`**
Updates the preflight summary bar at the top of the Entity Verifier page.

**`ev2RenderSettings()`**
Renders the Entity Verifier settings panel including source toggles and cache controls.

**`ev2RenderSourceHealth()`**
Renders the source health panel showing current status of all nine data sources.

**`ev2RenderSourceToggles()`**
Renders source enable/disable toggle switches in the settings panel.

**`ev2RenderWaterfall(result)`**
Renders the source waterfall panel showing each source's query result in sequence.

**`ev2ResolveDBA(tradeName, ein, entityType)`**
Async. Attempts to resolve a trade name to its legal entity name by querying relevant sources.

**`ev2RunBatchPreflight()`**
Async. Runs preflight checks on all entities in the batch and renders the preflight report.

**`ev2RunVerification()`**
Async. Called by UI buttons — orchestrates the full verification run (single or batch) and updates all result panels.

**`ev2SafeFetch(url, options)`**
Async. Fetch wrapper with timeout (15 seconds), error handling, and CORS failure detection.

**`ev2SaveManualResult(sourceId)`**
Saves a manually entered verification result for a specific source.

**`ev2SaveSamKey()`**
Saves the SAM.gov API key entered in the settings panel.

**`ev2SaveSettings()`**
Persists all Entity Verifier settings to localStorage.

**`ev2SeverityColor(severity)`**
Returns a CSS color string for a given severity level ("critical", "high", "medium", "low").

**`ev2ShowDetail(idx)`**
Shows the detailed result panel for the result at the given batch index.

**`ev2SourcesReady()`**
Returns true if all required source configurations are loaded.

**`ev2SplitCSVLine(line)`**
Splits a CSV line into fields, respecting quoted fields with embedded commas.

**`ev2StatusBadge(status)`**
Returns an HTML string for a colored status badge.

**`ev2SuggestFix(warning)`**
Returns a human-readable fix suggestion for a given preflight warning code.

**`ev2SwitchSubTab(tabName)`**
Switches the active Entity Verifier sub-tab.

**`ev2ToggleInfoGuide()`**
Shows or hides the Entity Verifier info guide panel.

**`ev2ToggleSource(sourceId, enabled)`**
Enables or disables a specific verification source.

**`ev2TraceGenealogy(entityName, ein)`**
Async. Traces the ownership and name history of an entity across multiple sources.

**`ev2TypeBadge(entityType)`**
Returns an HTML string for a colored entity type badge.

**`ev2UpdateSetting(key, value)`**
Updates a single Entity Verifier setting value.

**`ev2UseLegalName(legalName)`**
Copies the resolved legal name from the DBA panel into the verification input field.

**`ev2VerifyAll(entities, onProgress)`**
Async. Verifies an array of entities sequentially, calling `onProgress(i, total, result)` after each.

**`ev2VerifyEntity(entityInput)`**
Async. Runs the full verification pipeline for a single entity: classifies, queries all relevant sources, computes confidence, determines status, and builds recommendation.

**`ev2VerifySingle()`**
Async. Reads the single-verify input fields and calls `ev2VerifyEntity()`.

**`exportAllData(format)`**
Exports all `appData` in the specified format (PDF, Word, CSV, or JSON).

**`exportAllHistory()`**
Downloads all agent conversation histories as a single text file.

**`exportBackup()`**
Exports a complete backup of all localStorage data as a JSON file.

**`exportChat()`**
Exports the E2ZERO Chat conversation as a text file. (Also used for Voice Chat export.)

**`exportChatHistory()`**
Downloads the Voice and Chat page conversation history.

**`exportCSV()`**
Exports the general ledger entries as a CSV file.

**`exportDocPDF()`**
Exports the Document Creator content as a PDF using jsPDF.

**`exportDocWord()`**
Exports the Document Creator content as a Word-compatible HTML download.

**`exportEntityToMasterRegisterCSV()`** (alias: `exportEntitiesToMasterRegisterCSV()`)
Builds and downloads a CSV of all entity records in the master register format expected by Google Sheets.

**`exportFiling(formType)`**
Exports the current tax filing form data as a text or CSV file.

**`exportFilingCSV(formType, data)`**
Formats filing data as CSV and triggers a download.

**`exportFilingTXT(formType, data)`**
Formats filing data as plain text and triggers a download.

**`exportJournalEntries()`**
Exports all journal entries as a CSV file.

**`exportJournalToTransactionCSV()`**
Exports journal entries in the transaction CSV format for Google Sheets sync.

**`exportLedgerToTransactionCSV()`**
Exports ledger entries in the transaction CSV format for Google Sheets sync.

**`exportPackagePDF()`**
Exports the built document package as a single PDF file.

**`exportPackageZIP()`**
Exports the built document package as a ZIP archive containing individual document files.

**`exportPayablesToObligationsCSV()`**
Exports A/P records in the obligations CSV format for Google Sheets sync.

**`exportStatements()`**
Exports the Trial Balance, Income Statement, and Balance Sheet to a single PDF or Word document.

**`exportTemplateSettings()`**
Downloads the current document template variable settings as a JSON file.

**`exportToCSV(title, data, columns)`**
General-purpose CSV export using FileSaver.js. `title`: filename prefix. `data`: array of row arrays. `columns`: header row array.

**`exportToPDF(title, data, columns)`**
General-purpose PDF export using jsPDF and jsPDF AutoTable.

**`exportToWord(docTitle, htmlContent)`**
General-purpose Word export. Wraps HTML content in a Word-compatible envelope and triggers a `.doc` download.

**`export1099ToFilingChainCSV()`**
Exports all 1099 series filing data in the filing chain CSV format for Google Sheets sync.

---

### F

**`fdrfReadSection(sectionId)`**
Reads the text content of the specified FDRF accordion section aloud using the TTS engine.

**`fdrfToggleAccordion(el)`**
Toggles open/closed state of an FDRF accordion item.

**`fdrfTogglePart(partNum)`**
Toggles open/closed state of a top-level FDRF part section.

**`filterAccounts(type)`**
Filters the Chart of Accounts table to show only accounts of the specified type.

**`filterJournalEntries()`**
Applies date range and search text filters to the journal entries table.

**`filterScoutAPIs()`**
Filters the API Scout catalog by the selected category.

**`filterResults(filterOrStatus)`** (alias: `ev2FilterResults()`)
Filters batch verification results by status or custom filter.

**`fmtMoney(n)`**
Formats a number as a dollar amount string (e.g., $1,234.56).

**`forceSyncFromGAAP()`**
Pulls ledger data from the GAAP bridge and updates agent data.

---

### G

**`generateBadDebtActionPlan()`**
Generates a step-by-step action plan document for the bad debt refund procedure.

**`generateBOESerial()`**
Generates a unique serial number for a Bill of Exchange.

**`generateBalanceSheet(balances)`**
Renders an HTML balance sheet from the account balances map.

**`generateEliminations()`**
Identifies and creates intercompany elimination entries for the consolidation module.

**`generateIncomeStatement(balances)`**
Renders an HTML income statement from the account balances map.

**`generateInterestReport()`**
Generates a formatted interest recovery report from the Tax Estimator interest calculator.

**`generateLossActionPlan()`**
Generates a step-by-step action plan for instrument loss recovery.

**`generateMasterReport()`**
Builds the complete multi-section Master Report from all application data.

**`generateStatements()`**
Calls the three statement generators (trial balance, income statement, balance sheet) and renders them to the Statements section.

**`generateTrialBalance(balances)`**
Renders an HTML trial balance table from the account balances map.

**`generateSPVAssetSummary()`**
Builds the asset type summary table for the SPV Reports tab, grouped by SPV entry type (Capital Contribution, Asset Acquisition, Distribution, etc.). Populates `spvAssetSummaryBody`. Called by `spvUpdateReports()`.

**`generateSPVTrialBalance()`**
Generates the SPV trial balance grouped by SPV entity name, showing In, Out, and Net columns for each entity. Populates the trial balance section of the SPV Reports tab. Called by `spvUpdateReports()`.

**`generateTrustAssetSummary()`**
Generates the trust asset summary report from trust ledger data.

**`generateTrustTrialBalance()`**
Generates the trust trial balance report from trust ledger data.

**`getAging(dueDate)`**
Returns the aging category for an A/R or A/P record based on days past due.

**`getFYEMonth(m)`**
Returns the full month name for a fiscal year end month number.

**`getSelectedPackageDocs()`**
Returns the array of selected document templates from the package builder.

**`getSelectedVoice()`**
Returns the currently selected TTS voice object from the voice selector dropdown.

**`getSystemPrompt(agentId)`**
Returns the system prompt string for the specified agent ID.

**`getTTSRate()`**
Returns the current TTS rate from the slider control.

**`goEonPage(btn, page)`**
Navigates to the specified E2ZERO sidebar page. Deactivates the current page, activates the target page, and calls `initEonPage(page)`.

---

### H

**`handleDebitCredit(input, type)`**
Called on debit/credit field input in the journal entry form. Zeros the opposite field to maintain mutual exclusivity.

**`handleExport(format)`**
Routes the global Export dropdown selection to the appropriate export function.

**`handleFileUpload(input)`**
Handles file uploads for AP agent pages. Reads PDF or text files, extracts text, and prepends it to the current message.

---

### I

**`importBackup(input)`**
Reads a backup JSON file and restores all localStorage data from it.

**`importData(event)`**
Reads an imported JSON file and merges the data into the current `appData` object.

**`importMasterRegisterCSV(inputEl)`**
Reads and imports entities from a master register CSV file into the entities store.

**`importObligationsCSV(inputEl)`**
Reads and imports A/P obligations from a CSV file.

**`importTemplateSettings(event)`**
Reads and imports document template settings from a JSON file.

**`importTransactionLedgerCSV(inputEl)`**
Reads and imports ledger transactions from a CSV file.

**`importW2IncomeCSV(inputEl)`**
Reads and imports W-2 income data from a CSV file.

**`import1099ToEstimator()`**
Calls `aggregate1099Data()` and populates the Tax Estimator fields with the results.

**`import1099ToTRCF()`**
Imports saved 1099 data into the TRCF calculator fields.

**`infoGuideHide()`**
Hides the Entity Verifier info guide overlay.

**`infoGuideShow()`**
Shows the Entity Verifier info guide overlay.

**`initBankRecon()`**
Initializes the Bank Reconciliation page: loads saved reconciliation data and renders the history table.

**`initBOE()`**
Initializes the Bills of Exchange page: loads saved BOEs and renders the list.

**`initBOESignature()`**
Sets up the BOE signature canvas with mouse and touch event handlers.

**`initBudget()`**
Initializes the Budget and Forecast page with saved budget data.

**`initCCSN()`**
Initializes the NOL Classification slide presentation.

**`initCPSA()`**
Initializes the Constitutional Challenges editor: loads saved documents, sets up auto-save and keyboard shortcuts.

**`initContacts()`**
Initializes the Customers and Vendors page.

**`initDepreciation()`**
Initializes the Asset Depreciation page with saved asset data.

**`initDocAutoSave()`**
Sets up the Document Creator auto-save interval and restore check.

**`initDocCreator()`**
Initializes the Document Creator with default content and auto-save.

**`initDocUndoRedo()`**
Sets up the Document Creator undo/redo stack (50-state limit) with MutationObserver.

**`initEonPage(page)`**
Routes initialization to the appropriate init function for the given E2ZERO sidebar page name.

**`initExpenses()`**
Initializes the Expense Itemization page.

**`initFDRF()`**
Initializes the Federal Damages accordion page.

**`initEEEJ()`**
Initializes the Tutorial Journal slide presentation.

**`initFinancialAssets()`**
Initializes the Financial Assets page and syncs from ledger data.

**`initInventory()`**
Initializes the Inventory page with saved inventory data.

**`initInvoicing()`**
Initializes the Invoicing page with saved invoice data.

**`initJournalEntry()`**
Initializes the Journal entry form with a default date and one blank line.

**`initParticles()`**
Creates particle objects and starts the particle animation canvas on the Trust Estate Dashboard.

**`initPaymentOrders()`**
Initializes the Payment Orders page with saved payment orders.

**`initPayroll()`**
Initializes the Payroll page with saved payroll records.

**`initScrollReveal()`**
Sets up an IntersectionObserver to trigger `.tmar-reveal.visible` animations as elements enter the viewport.

**`initSyncCenter()`**
Initializes the Sync Center page: loads GAS URL, renders sync log, updates tier-2 panel state.

**`initTRCF()`**
Initializes the Tax Refund Calculator page.

**`initTaxCalculators()`**
Initializes the Tax Estimator sub-calculators.

**`initTaxEstimator()`**
Initializes the Tax Estimator page.

**`initVoiceChat()`**
Initializes the Voice and Chat page: loads voices, renders chat history, updates stats.

**`insertCitation()`**
Opens the citation insertion panel in the Document Creator.

---

### L

**`loadDefaultCOA()`**
Populates the Chart of Accounts with a standard default set of account codes.

**`loadDocTemplate()`**
Loads a selected document template into the Document Creator or package builder editor.

**`loadEntries()`**
Loads ledger entries from `appData.entries` and renders the ledger table.

**`loadFiling(formType, id)`**
Loads a saved tax filing by form type and ID into the form fields.

**`loadFromStorage()`**
Reads `TMAR_AppData` from localStorage and returns the parsed object, merged with defaults.

**`loadSavedKeys()`**
Reads all API key fields from localStorage and populates the Settings form fields.

**`loadVoices()`**
Populates the TTS voice dropdown from the browser's available speech synthesis voices.

---

### M

**`manualSave()`**
Calls `saveToStorage()` immediately and shows a confirmation badge.

**`mapEntityTypeToAccountType(type)`**
Maps a GAS-format entity type string to the local application's entity type format.

**`markInvoicePaid(idx)`**
Marks invoice at index `idx` as paid and updates the invoice list.

**`maskEIN(ein)`**
Returns a privacy-masked version of an EIN showing only the last four digits.

**`mem0ClearAll()`**
Async. Prompts for confirmation then clears all GCMemory IndexedDB records.

---

### N

**`newBlankDoc()`**
Clears the Document Creator editor after confirmation prompt.

**`numberToWords(n)`**
Converts a number to its English words representation (e.g., 1250.00 → "One Thousand Two Hundred Fifty and 00/100"). Used for check writing.

**`numToWords(n)`**
Alternative number-to-words implementation used by the Payment Orders and BOE modules.

**`noiAsk()`**
Sends the NOI (Notice of Intent) Ask page query to the legal agent.

---

### O

**`onGasUrlChange()`**
Called when the GAS URL field changes. Validates the URL format and updates the tier-2 panel state.

**`onYearChange()`**
Placeholder called when the EEON tax year selector changes.

---

### P

**`parityCheckNow()`**
Fetches `parity-fingerprint.json` from the GitHub repository and updates the parity status indicator in the Settings page. Shows inline success or drift-detected message. Called by the "Check for Source Updates" button.

**`parityCheckOnLoad()`**
Called automatically 3 seconds after initial page load. Fetches the parity fingerprint silently. If `driftDetected` is true and the 3-day dismiss window has not expired, shows the sticky drift banner. Does nothing if drift is absent or banner was recently dismissed.

**`parityDismissBanner()`**
Hides the parity drift banner and stores the current Unix timestamp (ms) in `TMAR_parity_dismissed`. The banner will not reappear for 3 days.

**`parityShowDetails()`**
Displays a modal alert containing the full drift summary from the fetched fingerprint: source hashes, tab counts, version strings, drift summary text, and links to the two source URLs.

**`parseDocumentCommand(query)`**
Parses a GAAPCLAW Master chat query for document generation commands (e.g., "generate payment order"). Returns a command object or null.

**`planTask()`**
Reads the Task Planner goal and options, decomposes the goal into steps using the selected agent mode, and executes each step.

**`poWriteAmount()`**
Reads the Payment Order amount field and populates the amount-in-words field using `numToWords()`.

**`populateAllForms()`**
Placeholder — intended to sync GAAP ledger data to EEON tax forms.

**`populateTemplate(key, varMap)`**
Replaces all `{{VARIABLE}}` tokens in a template string with values from `varMap`.

**`previewData()`**
Opens a wide modal showing a formatted JSON summary of all current `appData`.

**`printBOE()`**
Triggers a print-formatted view of the most recently saved BOE.

**`printBOEDocument(b)`**
Renders a formal bill of exchange document from a BOE data object and triggers printing.

**`printDoc()`**
Triggers browser print of the Document Creator content.

**`printExpenseReport()`**
Renders and prints a formatted expense report.

**`printInvoice()`**
Renders a formal invoice and triggers browser print.

**`printMasterReport()`**
Triggers browser print of the Master Report.

**`printPackage()`**
Triggers browser print of the assembled document package.

**`printPaymentOrder()`**
Prints the most recently saved payment order.

**`printPODocument(po)`**
Renders a formal payment order document from a PO data object and triggers printing.

**`printReconciliation()`**
Renders a formal bank reconciliation report and triggers browser print.

**`printSpecificBOE(idx)`**
Prints the bill of exchange at the specified index.

**`printSpecificPO(idx)`**
Prints the payment order at the specified index.

---

### R

**`reconcileApps()`**
Compares GAAP ledger data with agent data and reports any discrepancies.

**`recordAPPayment(id)`**
Opens a payment dialog for an A/P record and records a payment when submitted.

**`recordARPayment(id)`**
Opens a payment dialog for an A/R record and records a payment when submitted.

**`removeInvLine(btn)`**
Removes an invoice line item row containing the clicked button.

**`removeJournalLine(btn)`**
Removes a journal entry line row containing the clicked button.

**`removeSourceFolder(i)`**
Removes the source folder at index `i`.

**`renderAssets()`**
Re-renders the Asset Depreciation table.

**`renderBOEList()`**
Re-renders the Bills of Exchange list.

**`renderChatHistory()`**
Re-renders the Voice and Chat conversation history.

**`renderCustomers()`**
Re-renders the Customers table.

**`renderExpenses()`**
Re-renders the Expense Itemization table.

**`renderInventoryTable()`**
Re-renders the Inventory table.

**`renderInvoiceList()`**
Re-renders the Invoice list.

**`renderPackageBuilder()`**
Renders the document package builder with all available template checkboxes.

**`renderPaymentOrders()`**
Re-renders the Payment Orders list.

**`renderPayrollRecords()`**
Re-renders the Payroll Records table.

**`renderReconHistory()`**
Re-renders the Bank Reconciliation history table.

**`renderSourceFolders()`**
Re-renders the Source Folders list.

**`renderVendors()`**
Re-renders the Vendors table.

**`resizePArticlesCanvas()`**
Adjusts the particle canvas dimensions when the window is resized.

**`resolveProvider()`**
Reads localStorage and returns the active provider configuration object, or null if no key is available.

**`resolveSyncConflicts()`**
Applies the user-selected conflict resolution strategy from the sync conflict modal.

**`runAPIScout()`**
Queries the API catalog and tests each API's availability. Renders results as cards.

---

### S

**`saveAcctLib()`**
Saves the source folder library to localStorage.

**`saveAccount(event, editId)`**
Saves a new or updated Chart of Accounts entry.

**`saveAP(event)`**
Saves a new A/P record from the modal form.

**`saveAPPayment()`** (internal to `recordAPPayment`)
Records a payment against an A/P record.

**`saveAR(event)`**
Saves a new A/R record from the modal form.

**`saveBOE()`**
Saves the current Bill of Exchange form as a new BOE record.

**`saveBudget()`**
Saves current budget data to localStorage.

**`saveContact(type)`**
Saves a new customer or vendor contact from the modal form.

**`saveEntity(event, editId)`**
Saves a new or updated entity record.

**`saveExpense()`**
Saves the current expense form as a new expense record.

**`saveFiling(formType)`**
Saves the current tax filing form data as a new filing record under the given form type.

**`saveInventoryItem()`**
Saves the current inventory item form as a new or updated inventory record.

**`saveInvoice()`**
Saves the current invoice form as a new invoice record.

**`saveKeys()`**
Reads all API key fields and saves them to their respective localStorage keys.

**`saveLedger()`**
Forces a save of ledger data to localStorage.

**`savePaymentOrder()`**
Saves the current Payment Order form as a new PO record.

**`savePayrollRecord()`**
Saves the current payroll calculation as a new payroll record.

**`savePrefs()`**
Reads and saves user preferences (theme, auto-save, font size) to localStorage.

**`saveReconciliation()`**
Saves the current bank reconciliation data and adds it to reconciliation history.

**`saveScheduleA()`**
Saves Schedule A itemized deduction data to localStorage.

**`saveTemplateVars()`**
Saves manual template variable overrides to localStorage.

**`saveToStorage()`**
Serializes `appData` to JSON and saves to `TMAR_AppData` in localStorage.

**`spvAddEntity()`**
Prompts the user for SPV name, EIN, entity type, and purpose. Creates a new entity record with a generated ID, appends it to `TMAR_SPV_Data.entities`, saves, and refreshes the SPV Dashboard selector.

**`spvApplyFilter()`**
Reads the current text and type values from the SPV filter bar inputs and calls `spvRenderLedger()` with the resulting filter object.

**`spvDeleteActive()`**
Prompts for confirmation, then removes the currently selected SPV entity and all entries associated with that SPV name from `TMAR_SPV_Data`. Saves and refreshes the dashboard.

**`spvDeleteEntry(id)`**
Prompts for confirmation, then removes the SPV ledger entry with the given `id` from `TMAR_SPV_Data.entries`. Saves and re-renders the ledger. `id`: string entry identifier.

**`spvExportCSV()`**
Builds a CSV string from all SPV ledger entries (Date, SPV Name, Asset Type, Description, Amount) and triggers a browser file download.

**`spvExportJSON()`**
Serializes the full `_spvData` object (entities and entries) as JSON and triggers a browser file download.

**`spvFilterEntries()`**
Toggles the visibility of the SPV filter bar below the ledger toolbar.

**`spvLoad()`**
Reads `TMAR_SPV_Data` from localStorage. If the key is absent, initializes and saves a default empty structure `{ entities: [], entries: [] }`. Returns the data object.

**`spvPrintReport()`**
Calls `window.print()` to print the current SPV Reports view.

**`spvRenderLedger(filter)`**
Renders the SPV ledger table. If `filter` is provided (object with optional `text` and `type` properties), only matching entries are shown. Updates the running total footer. `filter`: optional filter object.

**`spvResetFilter()`**
Clears the filter bar input fields and calls `spvRenderLedger()` with no filter argument to show all entries.

**`spvSave()`**
Serializes `_spvData` to JSON and writes it to `localStorage['TMAR_SPV_Data']`.

**`spvSaveEntry()`**
Reads all fields from the Add Entry form, validates that date, SPV name, and amount are present, generates a unique ID, appends the entry to `_spvData.entries`, calls `spvSave()`, hides the form, and calls `spvRenderLedger()`.

**`spvSetActive(id)`**
Called when the user changes the Active SPV dropdown. Finds the entity with the given `id` in the entities array and updates the SPV info line (EIN, type, purpose) below the selector. `id`: entity ID string.

**`spvShowAddEntry()`**
Shows the Add Entry form panel and pre-fills the Date field with today's date.

**`spvUpdateDashboard()`**
Refreshes the SPV Dashboard: rebuilds the Active SPV dropdown options from `_spvData.entities` and populates the Recent Activity table with the 10 most recent entries.

**`spvUpdateReports()`**
Calls both `generateSPVTrialBalance()` and `generateSPVAssetSummary()` to refresh all report tables on the SPV Reports tab.

**`scoutClearIntegrated()`**
Removes all APIs from the integrated APIs list.

**`scoutIntegrateAPI(name)`**
Adds a named API to the integrated APIs list.

**`scoutTestAll()`**
Tests connectivity for all integrated APIs.

**`selectBadDebtRoute(route)`**
Selects the calculation route for the bad debt refund calculator.

**`selectFilingType(type)`**
Shows the specified tax filing form and hides all others. Updates the filing card selection state.

**`selectInterestCategory(cat)`**
Selects the interest category in the interest refund calculator.

**`selectLossMethod(method)`**
Selects the calculation method for the instrument loss calculator.

**`selectPackagePreset(presetName)`**
Pre-selects a set of documents for the package builder based on the preset name.

**`sendChat()`**
Sends the Voice and Chat input to the general assistant agent.

**`sendQuick(message)`**
Sends a pre-written quick action message to the current agent.

**`showAccountModal(editId = null)`**
Opens the Chart of Accounts add/edit modal. If `editId` is provided, pre-populates with existing data.

**`showAddContact(type)`**
Opens the add contact modal for the specified type ("customer" or "vendor").

**`showAlert(message, title)`**
Shows a modal alert dialog with the provided message and title.

**`showAPModal()`**
Opens the Add A/P record modal.

**`showARModal()`**
Opens the Add A/R record modal.

**`showAutoSaveStatus(message, isError)`**
Displays a temporary status badge at the bottom-right of the screen.

**`showClearConfirm()`**
Opens a confirmation modal before clearing all ledger entries.

**`showConfirm(message, onConfirm, title)`**
Shows a modal confirmation dialog. Calls `onConfirm()` if the user clicks OK.

**`showEntityModal(editId = null)`**
Opens the entity add/edit modal.

**`showFASub(id)`**
Switches the active Financial Assets sub-tab.

**`showGCMemoryPanel()`**
Opens a modal showing GCMemory IndexedDB statistics and recent stored exchanges.

**`showIntegratedAPIs()`**
Renders the integrated APIs panel in API Scout.

**`showInvoiceForm()`**
Shows the invoice creation form panel.

**`showInventoryItemModal()`**
Opens the inventory item add/edit modal.

**`showIRSForm(key)`**
Renders the specified IRS form template in the PDF viewer panel of the Document Creator.

**`showModal(content)`**
Creates and displays a modal overlay with the provided HTML content.

**`showPackageBuilder()`**
Shows the document package builder panel.

**`showPayrollCalc()`**
Focuses the payroll calculator employee name field.

**`showSyncConflictModal(conflicts, onResolve)`**
Displays the sync conflict resolution modal with a side-by-side comparison of conflicting records.

**`showSyncProgress(text, pct)`**
Updates the Sync Center progress bar with a message and percentage.

**`showTaxSubTab(tabName)`**
Switches the active Tax Estimator sub-tab.

**`showWideModal(content)`**
Creates and displays a wider modal overlay (for previews and document display).

**`speakResponse()`**
Reads the most recent agent response aloud using the browser's TTS engine.

**`speakWithHighlight(overrideText)`**
Reads text aloud with word-level highlighting. Uses SpeechSynthesisUtterance boundary events to highlight each word as it is spoken.

**`startVoiceRec()`**
Starts the browser's Web Speech API recognition session.

**`stopParticles()`**
Cancels the particle animation frame loop.

**`stopVoiceRec()`**
Stops the active speech recognition session.

**`stopVoiceTTS()`**
Cancels any active TTS speech.

**`syncCSVEscape(val)`**
Escapes a value for inclusion in a sync CSV file.

**`syncDownloadCSV(filename, csvContent)`**
Downloads CSV content as a file.

**`syncHash(str)`**
Returns a simple hash of a string for change detection in sync operations.

**`syncParseCSV(csvText)`**
Parses a CSV text string into an array of objects using the first row as headers.

**`syncPull(type)`**
Async. Pulls data of the specified type from Google Sheets via the SyncBridge.

**`syncPullAll()`**
Async. Runs all pull operations in sequence.

**`syncPush(type)`**
Async. Pushes data of the specified type to Google Sheets via the SyncBridge.

**`syncPushAll()`**
Async. Runs all push operations in sequence.

---

### T

**`testConnection()`**
Async. Sends a minimal test request to the active provider's API and updates the key status display.

**`toggleAccordion(header)`**
Toggles the open/closed state of an accordion section on the Trust Estate Dashboard.

**`toggleBOEVariant(variant)`**
Updates the BOE form for the selected bill variant (Sight, Time, Demand).

**`toggleDarkMode()`**
Toggles the `dark` class on the `html` element and calls `applyTheme()`.

**`toggleEonSidebar()`**
Shows or hides the E2ZERO AI sidebar and pages container.

**`toggleHomeOfficeFields()`**
Shows or hides the home office deduction detail fields on Schedule C based on the selected method.

**`toggleItemizedFields()`**
Shows or hides the itemized deduction fields on Form 1040 based on the deduction type selector.

**`toggleMic()`**
Toggles the microphone input on the EEON chat page.

**`toggleTemplateVarEditor()`**
Shows or hides the document template variable override editor.

**`trcfCalculateBadDebt()`**
Calculates bad debt refund amounts in the TRCF calculator.

**`trcfCalculateNOL()`**
Calculates NOL carryforward and carryback amounts in the TRCF calculator.

**`trcfCalculateRoute1()`**
Runs the Route 1 tax refund calculation in the TRCF calculator.

**`trcfCalculateRoute2()`**
Runs the Route 2 tax refund calculation in the TRCF calculator.

**`trcfCalcInterest(principal, rate, days)`**
Calculates interest on a principal amount over the given number of days at the given annual rate.

**`trcfCalcInterestUI()`**
Reads the TRCF interest calculator fields and calls `trcfCalcInterest()`.

**`trcfCalcTax(taxableIncome, status)`**
Calculates federal tax liability for an individual using current tax brackets.

**`trcfCalcTrustTax(taxableIncome)`**
Calculates federal tax liability for a trust using trust tax brackets.

**`trcfClearBadDebt()`**
Resets the TRCF bad debt calculator fields.

**`trcfClearNOL()`**
Resets the TRCF NOL calculator fields.

**`trcfFI_calculate()`**
Runs the TRCF financial instrument loss calculation.

**`trcfFI_clear()`**
Resets the TRCF financial instrument fields.

**`trcfFI_print()`**
Prints the TRCF financial instrument loss report.

**`trcfFI_selectMethod(n)`**
Selects the financial instrument calculation method.

**`trcfFI_validate()`**
Validates the financial instrument input data.

**`trcfFmt(n)`**
Formats a number as a TRCF display string (dollar amount with commas).

**`trcfInt_calculate()`**
Runs the TRCF interest refund calculation.

**`trcfInt_clear()`**
Resets the TRCF interest calculator fields.

**`trcfInt_generateReport()`**
Generates the TRCF interest recovery report.

**`trcfInt_updateFields()`**
Updates dependent fields in the TRCF interest calculator when inputs change.

**`trcfInt_validate()`**
Validates the TRCF interest input data.

**`trcfPrintBadDebt()`**
Prints the TRCF bad debt refund calculation report.

**`trcfPrintNOL()`**
Prints the TRCF NOL calculation report.

**`trcfSelectRoute(routeNum)`**
Selects the active route in the TRCF Route Calculator.

**`trcfSwitchTab(tabName)`**
Switches the active TRCF sub-tab.

**`triggerPackageFromAgent(presetName, entityName)`**
Called by the GAAPCLAW Master agent's document command parser to trigger a preset package build for the specified entity.

**`truncateToTokenBudget(userMessage, systemTokens)`**
Truncates `userMessage` to fit within the provider's context window after accounting for system tokens and response budget.

**`trustApplyFilters()`**
Applies date, type, and beneficiary filters to the Trust Estate Ledger.

**`trustCurrSymbol(code)`**
Returns the currency symbol for the given currency code.

**`trustDeleteEntry(id)`**
Deletes a trust ledger entry by ID.

**`trustExportCSV()`**
Exports the trust ledger as a CSV file.

**`trustExportJSON()`**
Exports the trust ledger as a JSON file.

**`trustHideForm()`**
Hides the trust entry form.

**`trustPrintReport()`**
Triggers browser print of the trust reports.

**`trustRenderLedger()`**
Re-renders the Trust Estate Ledger table.

**`trustResetFilters()`**
Resets all Trust Estate Ledger filters.

**`trustSave()`**
Saves all trust ledger data to localStorage.

**`trustSaveEntry()`**
Validates and saves the current trust entry form as a new or updated record.

**`trustShowForm(id)`**
Shows the trust entry form, pre-populated if `id` refers to an existing entry.

**`trustTypeLabel(t)`**
Returns the display label for a trust transaction type code.

**`trustUpdateDashboard()`**
Recalculates and updates the Trust Estate Dashboard metrics.

---

### U

**`ukAgentQuery()`**
Reads the UK Accounting Agent text area value and sends it to `callLLMStream()` with a UK-law-specific system prompt (covering FRS 102, HMRC procedures, and the Companies Act 2006). Streams the response into the output area below the text area.

**`ukCheckAll()`**
Sets all 8 UK compliance checklist checkboxes to the checked state.

**`ukGenerateComplianceReport()`**
Reads `TMAR_UK_Settings` (company info and checklist state) and produces a formatted plain-text compliance report listing completed and outstanding obligations.

**`ukGenerateStatements()`**
Reads main ledger entries and chart of accounts data and generates UK-format financial statements: a Statement of Comprehensive Income (P&L) and a Statement of Financial Position (Balance Sheet), labeled per FRS 102 or IFRS conventions based on the saved accounting standard setting.

**`ukLoadSettings()`**
Reads `TMAR_UK_Settings` from localStorage and populates the UK Entity Configuration form fields. Called on page init.

**`ukPrintStatements()`**
Calls `window.print()` to print the UK Statements section.

**`ukSaveChecklist()`**
Reads the state of all 8 checklist checkboxes and saves the boolean values into `TMAR_UK_Settings.checklist` in localStorage.

**`ukSaveSettings()`**
Reads all UK Entity Configuration field values (company name, Companies House number, UTR, VAT, accounting standard, period end) and saves them to `TMAR_UK_Settings` in localStorage.

**`ukUncheckAll()`**
Sets all 8 UK compliance checklist checkboxes to the unchecked state.

**`updateAPTable()`**
Re-renders the A/P table.

**`updateARTable()`**
Re-renders the A/R table.

**`updateAnalytics()`**
Recalculates and renders the E2ZERO Analytics page statistics and usage chart.

**`updateBOELanguageLabel()`**
Updates the bill language/jurisdiction label based on the selected BOE variant.

**`updateCOATable()`**
Re-renders the Chart of Accounts table.

**`updateConsolidationWorksheet()`**
Recalculates and re-renders the Consolidation Worksheet.

**`updateDeprDash()`**
Recalculates and updates the Asset Depreciation dashboard metrics.

**`updateDashboard()`**
Updates the E2ZERO sidebar dashboard (currently a placeholder).

**`updateEliminationsTable()`**
Re-renders the Consolidation Eliminations table.

**`updateEntitiesTable()`**
Re-renders the Entities table.

**`updateEntitySelects()`**
Updates all entity dropdown selectors throughout the application to reflect the current entity list.

**`updateEntityStructure()`**
Renders the parent-subsidiary entity hierarchy accordion.

**`updateExpenseDash()`**
Recalculates and updates the Expense Itemization dashboard.

**`updateFilingsList()`**
Re-renders the saved filings list for all tax form types.

**`updateHeaderSubtitle()`**
Updates the header trust name and masked EIN display.

**`updateInventoryDashboard()`**
Recalculates and updates the Inventory dashboard.

**`updateInvoiceDashboard()`**
Recalculates and updates the Invoice dashboard metrics.

**`updateJournalTable()`**
Re-renders the Journal Entries table.

**`updateKeyDots()`**
Updates the API key status dots (green/gray) based on whether each key is saved.

**`updatePayrollDashboard()`**
Recalculates and updates the Payroll dashboard.

**`updateReports()`**
Recalculates and updates the Reports page summary.

**`updateSyncStatus(message, isError)`**
Updates the Sync Center status display text.

**`updateTRCF1099Summary()`**
Updates the TRCF 1099 import summary display.

**`updateTier2PanelState()`**
Shows or hides the Tier 2 (GAS-dependent) Sync Center features based on whether a GAS URL is configured.

**`updateThemeIcon()`**
Updates the theme toggle button icon based on the current theme.

**`updateVariablePreview()`**
Updates the template variable preview in the Document Creator.

**`updateVCStats()`**
Updates the Voice and Chat stats display (messages, words, memory entries).

---

### V

**`validateBadDebtDocs()`**
Validates that the required documentation for a bad debt refund claim is described.

**`validateJournalEntry()`**
Validates the journal entry form: checks that at least two lines exist, that all accounts are selected, and that total debits equal total credits.

**`viewJournalEntry(id)`**
Opens a modal showing the formatted lines of the journal entry with the given ID.

---

This document was generated from a complete reading of `TMAR-Accrual-Ledger.html` and updated to v3.3 to cover the SPV Module, UK Accounting tab, Groq/Cerebras/OpenRouter providers, and the Parity Drift Notification System.
