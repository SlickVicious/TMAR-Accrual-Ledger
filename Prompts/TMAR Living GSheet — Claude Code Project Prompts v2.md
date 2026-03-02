

> **Updated:** 2026-02-26 — Adapted to the ACTUAL 22-tab Google Sheet structure
>
> **Purpose**: Turn the Trust Master Account Register (TMAR) Google Sheet into a "pseudo living" spreadsheet powered by Python scripts that scan, extract, reconcile, and sync data from the local FileCabinet to Google Sheets — following the Freeway Mechanics Workbook framework.
>
> **Google Sheet**: `1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ`
> **Primary Data Source**: `/Users/animatedastronaut/Downloads/FileCabinet 2/Taxes`
> **Parent Dir**: `/Users/animatedastronaut/Downloads/FileCabinet 2`
> **Service Account**: `cupsup-bet@expense-tracker-459709.iam.gserviceaccount.com`
> **Credentials**: `/Users/animatedastronaut/Downloads/04_Dev-Config/credentials.json`
> **Access**: ✅ Confirmed 2026-02-26

---

## SHEET STRUCTURE REFERENCE (22 Tabs — Actual)

Before executing any prompt, understand the actual sheet layout:

### Group A — Living Dashboard & Household (Tabs 1-12)

| # | Tab Name | Header Row | Columns | Purpose |
|---|----------|-----------|---------|---------|
| 1 | Executive Dashboard | Row 1 (title) | Free-form | Trust ID, EIN 41-6809588, Trustee, CAF 0317-17351 |
| 2 | Syrina Credit Summary | Row 1 (title) | Free-form | TransUnion credit report summary |
| 3 | Syrina Debt Strategy | Row 1 (title) | Free-form | Debt resolution & tax strategy |
| 4 | Syrina Student Loans | Row 1 (title) | Free-form | Federal student loan details (Dept of Ed / Nelnet) |
| 5 | _Settings | Row 1 | 2 cols | Active Year, Last Gap Scan timestamp |
| 6 | CPA Questions | Row 1 | 12 cols | Q-ID, Date Added, Category, Related Tab, Question, Context, Priority, Status, CPA Response, Response Date, Action Required, Resolved |
| 7 | Transaction Ledger | Row 1 | 16 cols | Date, Party, Category, Subcategory, Vendor, Description, Amount, Payment, Acct Type, Status, Tax Ded?, Biz Use %, Due Day, Recurring, Notes, Source |
| 8 | W-2 & Income Detail | Row 1 (title) | 3 cols (Row 2) | Box, Description, Amount |
| 9 | Gap Report | Row 1 | 8 cols | Tab Name, Row, Column Header, Gap Type, Current Value, Severity, Recommended Action, Registry Status |
| 10 | BOA Cash Flow | Row 1 (title) | 8 cols (Row 2) | Month, Beginning Balance, Total Deposits, Total Debits, Fees/Charges, Ending Balance, Net Change, Zelle to Syrina |
| 11 | Household Obligations | Row 1 | 11 cols | Vendor, Category, Subcategory, Current Monthly, Due Day, Payment Method, Responsible Party, Status, Start Date, Rate Changes, Notes |
| 12 | Tax Strategy | Row 1 (title) | Free-form | Tax filing summary — MFJ |

### Group B — Estate Ledger & Compliance (Tabs 13-22)

| # | Tab Name | Header Row | Columns | Purpose |
|---|----------|-----------|---------|---------|
| 13 | Master Register | Row 1 | 35 cols | Full account inventory (see schema below) |
| 14 | Forms & Authority | Row 2 (title in 1) | 13 cols | Fiduciary forms, FOIA records |
| 15 | Trust Ledger | Row 2 (title in 1) | 8 cols | Asset ledger with verified values |
| 16 | Banking Log | — | 0 cols | Empty — needs population |
| 17 | EIN Acct Ledger | Row 1 | 16 cols | 1099 recipient data (TIN, name, address) |
| 18 | 1099 Filing Chain | Row 2 (title in 1) | 15 cols | Three-layer uplift strategy tracking |
| 19 | Proof of Mailing | Row 2 (title in 1) | 14 cols | Certified mail & PS Form 3811 log |
| 20 | Receipts, Subscriptions & Services | Row 1 | 10 cols | Service, Category, Monthly/Annual cost, etc. |
| 21 | Document Inventory | Row 2 (title in 1) | 17 cols | Trust document inventory & corrections register |
| 22 | _Validation | Row 1 | 10 cols | Dropdown lists for data validation |

### Master Register — Full 35-Column Schema (Tab 13, Row 1 headers)

```
A: Row ID              B: Date Added           C: Provider/Creditor
D: Mailing Address     E: Provider EIN         F: Account Number
G: Account Type        H: Account Subtype      I: Account Agent
J: Agent Address       K: Status               L: Open Date
M: Close Date          N: Current Balance       O: Original Balance
P: Running Total (In)  Q: Running Total (Out)  R: Billing Frequency
S: Next Payment Due    T: Primary User         U: Authorized Users
V: Autopay Status      W: Payment Source       X: Contract/Terms File
Y: Statements Complete Z: Tax Forms on File    AA: PoP Documents
AB: Document Location  AC: Last Statement Date AD: Last Verified Date
AE: Retention Period   AF: Destroy After Date  AG: Notes
AH: Tags              AI: Discovery Status
```

### Document Inventory — 17-Column Schema (Tab 21, Row 2 headers)

```
A: Doc ID              B: Document Name         C: Document Type
D: Date Created        E: Date Filed            F: Source/Issuer
G: Related Account (MR Row)  H: FWM Binder Tab  I: Vault Location Path
J: Physical Location   K: Retention Period      L: Destroy After Date
M: Status              N: Is Correction         O: Corrects Doc ID
P: Correction Date     Q: Notes
```

### Transaction Ledger — 16-Column Schema (Tab 7, Row 1 headers)

```
A: Date       B: Party       C: Category      D: Subcategory
E: Vendor     F: Description G: Amount        H: Payment
I: Acct Type  J: Status      K: Tax Ded?      L: Biz Use %
M: Due Day    N: Recurring   O: Notes         P: Source
```

---

## PROMPT 0 — Project Initialization

```
Create a new Python project called `tmar-engine` at ~/Projects/tmar-engine with the following structure:

tmar-engine/
├── README.md
├── pyproject.toml                # uv/pip project config
├── .env.example                  # Template for secrets
├── config/
│   ├── settings.yaml             # All configurable paths, sheet IDs, tab names
│   ├── account_registry.yaml     # Known accounts, EINs, providers (seed data)
│   └── sheet_schema.yaml         # Complete 22-tab schema definition
├── src/
│   ├── __init__.py
│   ├── scanner/                  # FileCabinet directory scanner
│   │   ├── __init__.py
│   │   ├── tree_builder.py       # Recursively catalog all files w/ metadata
│   │   └── file_classifier.py    # Classify files by type (statement, W2, 1099, transcript, etc.)
│   ├── extractor/                # PDF/CSV data extraction
│   │   ├── __init__.py
│   │   ├── pdf_extractor.py      # Extract text/tables from PDF statements
│   │   ├── csv_extractor.py      # Parse CashApp CSVs, transaction exports
│   │   └── ocr_fallback.py       # OCR for scanned PDFs (tesseract fallback)
│   ├── ledger/                   # Trust ledger engine
│   │   ├── __init__.py
│   │   ├── account_ledger.py     # Per-account debit/credit/running balance
│   │   ├── reconciler.py         # Cross-check extracted vs. sheet data
│   │   └── valuation.py          # FMV / valuation memo logic (no uplift without docs)
│   ├── sheets/                   # Google Sheets API integration
│   │   ├── __init__.py
│   │   ├── auth.py               # Service account auth (NO OAuth flow needed)
│   │   ├── reader.py             # Read existing TMAR sheet state (all 22 tabs)
│   │   ├── writer.py             # Write/update cells, formatting, batch ops
│   │   └── schema.py             # 22-tab schema definitions + validation
│   ├── compliance/               # IRS form tracking & filing status
│   │   ├── __init__.py
│   │   ├── form_tracker.py       # Track Forms & Authority tab
│   │   ├── filing_chain.py       # Track 1099 Filing Chain tab
│   │   ├── mailing_log.py        # Track Proof of Mailing tab
│   │   ├── deadline_calendar.py  # IRS filing deadlines & alerts
│   │   ├── gap_analyzer.py       # Generate/update Gap Report tab
│   │   └── tin_matcher.py        # TIN matching (EIN Acct Ledger validation)
│   └── reports/                  # Output reports & dashboards
│       ├── __init__.py
│       ├── inventory_report.py   # Document Inventory population
│       ├── dashboard_updater.py  # Executive Dashboard refresh
│       └── filing_status.py      # Which forms filed, pending, overdue
├── scripts/
│   ├── scan_filecabinet.py       # CLI: scan and catalog all files
│   ├── extract_statements.py     # CLI: extract data from PDFs/CSVs
│   ├── sync_to_sheets.py         # CLI: push data to Google Sheets
│   ├── reconcile.py              # CLI: compare local vs sheet data
│   └── full_pipeline.py          # CLI: run everything end-to-end
└── tests/
    ├── test_scanner.py
    ├── test_extractor.py
    └── test_ledger.py

Use `uv` for dependency management. Key dependencies:
- google-api-python-client, google-auth (Sheets API — service account only, no OAuth)
- pdfplumber or pymupdf (PDF extraction)
- pytesseract (OCR fallback)
- pyyaml (config)
- rich (CLI output)
- pandas (data manipulation)

In settings.yaml, set these paths and sheet config:
  filecabinet_root: "/Users/animatedastronaut/Downloads/FileCabinet 2"
  taxes_dir: "/Users/animatedastronaut/Downloads/FileCabinet 2/Taxes"
  sheet_id: "1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ"
  credentials_path: "/Users/animatedastronaut/Downloads/04_Dev-Config/credentials.json"
  service_account_email: "cupsup-bet@expense-tracker-459709.iam.gserviceaccount.com"

In sheet_schema.yaml, define ALL 22 tabs with their:
  - tab name (exact string)
  - header_row (1 or 2 — some tabs have title in row 1, headers in row 2)
  - data_start_row (row where actual data begins)
  - columns (ordered list with column letter, name, data type)
  - writable (boolean — some tabs like _Settings and _Validation are read-only for the engine)

  Tabs with title in row 1 and headers in row 2:
    - Document Inventory, Forms & Authority, Trust Ledger,
      1099 Filing Chain, Proof of Mailing

  Tabs with headers directly in row 1:
    - Master Register, Transaction Ledger, CPA Questions,
      Gap Report, Household Obligations, EIN Acct Ledger,
      Receipts Subscriptions & Services, _Validation, _Settings

  Free-form tabs (read-only, dashboard-style — engine updates specific cells only):
    - Executive Dashboard, Syrina Credit Summary, Syrina Debt Strategy,
      Syrina Student Loans, W-2 & Income Detail, BOA Cash Flow, Tax Strategy

In account_registry.yaml, seed with the known accounts discovered in the filesystem:
  - provider: Bank of America
    type: checking
    account_last4: "0672"
    statement_dir: "Clint taxes/BOA statements"
    years: [2022, 2023, 2024, 2025]
  - provider: Fidelity
    type: brokerage/IRA
    statement_dir: "Clint taxes/Fidelity docs"
    sub_accounts: [Individual-TOD-7819, ROTH-IRA-1235, Cash-Management-6396]
    years: [2020, 2021, 2022, 2023, 2024, 2025]
  - provider: Vanguard
    type: 401k
    statement_dir: "Clint taxes/Vanguard 401k"
  - provider: Vanguard (Distributions)
    type: retirement-distribution
    statement_dir: "Clint taxes/Vanguard"
    forms: [1099-R]
  - provider: CashApp
    type: p2p/payment
    statement_dir: "Clint taxes/CashApp"
    format: csv
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
  - provider: PayPal
    type: p2p/payment
    ein: "83-0364903"
    statement_dir: "Clint taxes/Expenses/Paypal"
    years: [2024, 2025]
  - provider: Webull
    type: brokerage
    statement_dir: "Clint taxes/Webull"
    years: [2021, 2022, 2023, 2024, 2025]
  - provider: IRS
    type: government/tax
    sub_dirs:
      - "Clint taxes/Account Transcripts"
      - "Clint taxes/Return Transcripts"
      - "Clint taxes/Record of Account Transcripts"
      - "Clint taxes/Wage & Income Transcripts"
      - "Clint taxes/W2's"
  - provider: SSA
    type: government/benefits
    statement_dir: "Clint taxes/SSAdocs"
  - provider: Credit Bureaus
    type: credit-reports
    statement_dir: "Clint taxes/credit reports"
    bureaus: [Experian, TransUnion, Equifax]

Also register the secondary principal (Syrina) with her file paths under Taxes/Syrina/.

Include the parent-level directories too:
  - 1099's/: Filed 1099-A and 1099-B forms
  - ABB's/: Additional 1099 forms (BOA)
  - FWMclassDocs/: Freeway Mechanics class reference docs & templates
  - Filings/: State filings, assumed name, CUSIP
  - Estates/: Trust estate documents (Clint's, Chef's, Drafts)
  - Business Ents/: Business entity docs (Domivia, SoleProp)
  - Expenses/: Master transaction databases (.numbers files)
```

---

## PROMPT 1 — FileCabinet Scanner & Classifier

```
Build the scanner module (src/scanner/) that:

1. Recursively walks /Users/animatedastronaut/Downloads/FileCabinet 2/Taxes
   and the parent directory, cataloging every file with:
   - Full path, filename, extension, size, modified date
   - Relative path from filecabinet root
   - Classification (see below)
   - Associated principal (Clint or Syrina, based on directory)
   - Associated provider (BOA, Fidelity, IRS, etc.)
   - Tax year (extracted from filename or parent directory name)

2. File classification rules:
   - *eStmt_*.pdf → "bank-statement"
   - *Statement*.pdf in Fidelity → "brokerage-statement"
   - *1099*.pdf → "tax-form-1099" (sub-classify: A, B, C, R, DIV, INT)
   - *W2*.pdf or *w2*.pdf → "tax-form-w2"
   - *5498*.pdf → "tax-form-5498"
   - *1095*.pdf → "tax-form-1095"
   - *_accTx.pdf or *_acctTx.pdf → "irs-account-transcript"
   - *_rtrn*.pdf → "irs-return-transcript"
   - *_RoATx.pdf → "irs-record-of-account"
   - *_W&I*.pdf or *W&E*.pdf → "irs-wage-income-transcript"
   - *RefundTx*.pdf → "irs-refund-transcript"
   - cash_app_report_*.csv → "cashapp-transactions"
   - statement-*-20*.pdf in Paypal → "paypal-statement"
   - *paystubs* or date-formatted PDFs in PayStubs → "paystub"
   - *credit*report* or *TransUnion* or *Experian* → "credit-report"
   - *benefit-verification* → "ssa-verification"
   - *social-security-statement* → "ssa-statement"
   - *1040*.pdf → "tax-return"
   - *f56*.pdf → "irs-form-56"
   - *f2848*.pdf → "irs-form-2848"
   - *f8821*.pdf → "irs-form-8821"
   - *fw9*.pdf → "irs-form-w9"
   - *TradeConfirmation*.pdf → "trade-confirmation"
   - *AccountRecords*.pdf → "account-records"
   - *Net worth*.xlsx → "net-worth-summary"
   - *.numbers → "apple-numbers-file"
   - Anything in FWMclassDocs/ → "fwm-reference"
   - Anything in 1099's/ or ABB's/ → "filed-1099"
   - Anything in Estates/ → "estate-document"
   - Anything in Filings/ → "state-filing"

3. Output a JSON manifest: filecabinet_manifest.json
   And a summary report showing:
   - Total files by classification
   - Coverage matrix: which years have which document types per provider
   - Gaps: expected documents that are missing (e.g., no 2022 W&I transcript)

4. Use rich library for pretty CLI output during scanning.

Run with: python scripts/scan_filecabinet.py
```

---

## PROMPT 2 — PDF & CSV Data Extraction Engine

```
Build the extractor module (src/extractor/) that processes the scanned manifest
and extracts structured data from each file type:

1. Bank Statements (BOA eStmt_*.pdf):
   Extract: statement period, beginning balance, ending balance,
   total deposits, total withdrawals, list of transactions
   (date, description, amount, running balance)

   Target tab: "BOA Cash Flow" (Row 1=title, Row 2=headers:
   Month | Beginning Balance | Total Deposits | Total Debits |
   Fees/Charges | Ending Balance | Net Change | Zelle to Syrina)

   Also feeds: "Transaction Ledger" for individual transactions

2. Brokerage Statements (Fidelity):
   Extract: account number, account type, period,
   portfolio value, holdings summary, gains/losses,
   contributions, distributions

   Target tab: "Trust Ledger" (Row 2 headers:
   Date | Asset Description | Source/Grantor | Verified Value |
   Asset Category | FWM Binder Tab | Filing Status | Notes)

3. CashApp CSVs (cash_app_report_*.csv):
   Parse directly with pandas. Extract: transaction date,
   type (sent/received/deposit/withdrawal/bitcoin),
   amount, fee, net, counterparty, notes, status

   Target tab: "Transaction Ledger" (map to 16-column schema:
   Date | Party | Category | Subcategory | Vendor | Description |
   Amount | Payment=CashApp | Acct Type | Status | Tax Ded? |
   Biz Use % | Due Day | Recurring | Notes | Source=CashApp CSV)

4. PayPal Statements:
   Extract: transaction date, type, name, amount, fee,
   net, balance, transaction ID

   Target tab: "Transaction Ledger" (same mapping as CashApp,
   Payment=PayPal, Source=PayPal Statement)

5. IRS Transcripts (all types):
   Extract: tax year, form type, key fields:
   - Account Transcript: AGI, tax liability, payments, balance due
   - Return Transcript: filing status, income, deductions, credits
   - W&I Transcript: employer names, wages per employer, withholding
   - Record of Account: combined account + return data

   Target tab: "Document Inventory" (Row 2 headers:
   Doc ID | Document Name | Document Type | Date Created | Date Filed |
   Source/Issuer=IRS | Related Account (MR Row) | FWM Binder Tab |
   Vault Location Path | Physical Location | Retention Period |
   Destroy After Date | Status | Is Correction | Corrects Doc ID |
   Correction Date | Notes)

6. W-2 Forms:
   Extract: employer name/EIN, wages (Box 1), federal withholding (Box 2),
   SS wages (Box 3), SS tax (Box 4), Medicare wages (Box 5),
   Medicare tax (Box 6), state wages, state tax

   Target tab: "W-2 & Income Detail" (Row 2: Box | Description | Amount)
   Also updates: "Master Register" employment rows

7. 1099 Forms (all variants):
   Extract per form type: payer name/TIN, recipient, amounts
   per box, tax year

   Target tabs:
   - "EIN Acct Ledger" (Recipient Type | TIN Type | TIN | Names |
     Address fields — 16 columns for 1099 recipient data)
   - "1099 Filing Chain" (Row 2: Asset ID | Asset Description |
     Acquisition Date | 1099-A Filed/Date/Status | 1099-B #1 and #2
     Filed/Date/Status | Correction Filed | Overall Status | Notes)

8. Trade Confirmations:
   Extract: trade date, settlement date, security, action
   (buy/sell), quantity, price, amount

   Target tab: "Trust Ledger" (as investment assets)

Store extracted data as JSON per file alongside the source:
  {source_path}.extracted.json

Create a master extraction database:
  extraction_db.json — all extracted records indexed by
  provider → account → year → document_type

Use pdfplumber as primary PDF engine. Fall back to pymupdf
if pdfplumber fails. Fall back to OCR (tesseract) as last resort.
Log extraction confidence scores.

Run with: python scripts/extract_statements.py [--provider BOA] [--year 2024]
```

---

## PROMPT 3 — Google Sheets Schema & Sync Engine

```
Build the sheets module (src/sheets/) to manage the TMAR Google Sheet
(ID: 1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ).

CRITICAL: This sheet ALREADY EXISTS with 22 populated tabs.
DO NOT create tabs. DO NOT overwrite existing data.
The engine APPENDS new rows and UPDATES existing rows by matching on key columns.

Authentication:
- Use SERVICE ACCOUNT auth only (no OAuth flow, no token.json)
- Credentials file: /Users/animatedastronaut/Downloads/04_Dev-Config/credentials.json
- Service account already has Editor access to the sheet

Implement these modules:

1. auth.py — Service account authentication:
   - Load credentials from config path
   - Scopes: spreadsheets (read/write)
   - Return authorized service object
   - NO OAuth2 flow, NO token.json, NO browser popup

2. schema.py — Define all 22 tab schemas as Python dataclasses:

   IMPORTANT: Some tabs have headers in Row 1, others have a title in Row 1
   with headers in Row 2. The schema must track this per tab.

   Structured tabs (engine reads/writes):
   - Master Register: Row 1 headers, 35 cols, key=Row ID (col A)
   - Transaction Ledger: Row 1 headers, 16 cols, key=Date+Vendor+Amount
   - Document Inventory: Row 2 headers (title in Row 1), 17 cols, key=Doc ID
   - Forms & Authority: Row 2 headers, 13 cols, key=Form/Document+Date Filed
   - Trust Ledger: Row 2 headers, 8 cols, key=Date+Asset Description
   - 1099 Filing Chain: Row 2 headers, 15 cols, key=Asset ID
   - EIN Acct Ledger: Row 1 headers, 16 cols, key=Recipient TIN
   - Proof of Mailing: Row 2 headers, 14 cols, key=Mail ID
   - Gap Report: Row 1 headers, 8 cols, key=Tab Name+Column Header
   - Household Obligations: Row 1 headers, 11 cols, key=Vendor+Category
   - Receipts Subscriptions & Services: Row 1 headers, 10 cols, key=Service
   - CPA Questions: Row 1 headers, 12 cols, key=Q-ID
   - BOA Cash Flow: Row 2 headers, 8 cols, key=Month
   - W-2 & Income Detail: Row 2 headers, 3 cols, key=Box

   Settings/validation tabs (engine reads only, writes only to _Settings.Last Gap Scan):
   - _Settings: Row 1, 2 cols
   - _Validation: Row 1, 10 cols (dropdown source data)

   Free-form dashboard tabs (engine updates specific cells, not row-based):
   - Executive Dashboard
   - Syrina Credit Summary
   - Syrina Debt Strategy
   - Syrina Student Loans
   - Tax Strategy
   - Banking Log (currently empty — engine can populate)

3. reader.py — Read current sheet state:
   - Read all tabs, respecting header_row per schema
   - Return structured data as list of dicts per tab
   - Detect existing rows by key columns (for upsert logic)
   - Read _Validation tab to get valid dropdown values
   - Track row count per tab for append position

4. writer.py — Write/update with upsert logic:
   - UPSERT: If key exists → update row in place. If new → append.
   - Use batch updates (values.batchUpdate) for performance
   - Respect _Validation dropdown values for typed columns
   - Apply conditional formatting only to new rows
   - Update _Settings.Last Gap Scan timestamp after sync
   - Never exceed Sheets API quotas (use exponential backoff)
   - Banking Log tab: Create headers on first write since it's empty:
     Date | Bank | Account | Transaction Type | Description |
     Debit | Credit | Running Balance | Check/Ref # | Cleared | Notes

Run with: python scripts/sync_to_sheets.py [--tab "Master Register"] [--force] [--dry-run]
```

---

## PROMPT 4 — Ledger Engine & Reconciliation

```
Build the ledger module (src/ledger/) that:

1. account_ledger.py:
   - Takes extracted transaction data per account
   - Builds double-entry style ledger entries
   - Computes running balance per transaction
   - Validates: running balance matches statement ending balance
   - Flags discrepancies with severity (warning if < $1, error if > $1)
   - Outputs per-account ledger as both JSON and formatted for GSheets

   Writes to these tabs:
   a) "Trust Ledger" (asset-level, Row 2 headers):
      Date | Asset Description | Source/Grantor | Verified Value |
      Asset Category | FWM Binder Tab | Filing Status | Notes

   b) "Transaction Ledger" (transaction-level, Row 1 headers):
      Date | Party | Category | Subcategory | Vendor | Description |
      Amount | Payment | Acct Type | Status | Tax Ded? | Biz Use % |
      Due Day | Recurring | Notes | Source

   c) "BOA Cash Flow" (monthly summary, Row 2 headers):
      Month | Beginning Balance | Total Deposits | Total Debits |
      Fees/Charges | Ending Balance | Net Change | Zelle to Syrina

   d) "Banking Log" (per-transaction bank detail):
      Date | Bank | Account | Transaction Type | Description |
      Debit | Credit | Running Balance | Check/Ref # | Cleared | Notes

2. reconciler.py:
   - Compares local extracted data vs. what's already in the TMAR sheet
   - Uses reader.py to pull current state from all relevant tabs
   - Identifies:
     a) New transactions not yet in sheet
     b) Modified transactions (amount/date changed)
     c) Transactions in sheet but not in local files (orphans)
     d) Balance mismatches between sources
   - Generates reconciliation report
   - Writes discrepancies to "Gap Report" tab

3. valuation.py:
   - Per FWM workbook rules: "No memo = no uplift"
   - Only compute FMV from documented sources
   - For investment accounts: use statement-reported values
   - For bank accounts: use ending balance
   - For 401k: use reported balance
   - Flag any account where FMV cannot be determined from docs
   - NEVER fabricate or estimate values
   - Updates "Trust Ledger" Verified Value column

Run with: python scripts/reconcile.py [--account "BOA"] [--year 2024]
```

---

## PROMPT 5 — Compliance Tracker & Gap Analysis

```
Build the compliance module (src/compliance/) that:

1. form_tracker.py:
   Scan the following directories for filed IRS forms:
   - /FileCabinet 2/Taxes/IRS Files & FORMS/FillOut2Submit/ → forms ready to submit
   - /FileCabinet 2/Taxes/IRS Files & FORMS/EXAMPLES/ → reference/example forms
   - /FileCabinet 2/1099's/ → filed 1099 forms
   - /FileCabinet 2/ABB's/ → additional filed 1099s

   For each form found, extract:
   - Form type, version, principal, related account
   - Filing status (draft, example, filed)
   - Date (from filename or PDF metadata)

   Writes to "Forms & Authority" tab (Row 2 headers):
     Form/Document | IRS Form Number | Purpose | Date Filed |
     Date Accepted | IRS Receipt/Confirmation | CAF Number |
     FWM Binder Tab | Status | Filing Method | Tracking Number |
     Document Location | Notes

   Cross-reference against the FWM workbook's 15 core forms requirement.
   Identify which of these are present and which are missing:
   - Form 56 (Notice Concerning Fiduciary)
   - Form 56-F (Financial Institution Notice)
   - Form 2848 (Power of Attorney)
   - Form 8821 (Tax Information Authorization)
   - Form W-9 (trust)
   - Form 1099-A (per account)
   - Form 1099-B (per account)
   - Form 1096 (transmittal)
   - Form 8832 (Entity Classification Election)
   - Schedule C (Form 1040)
   - SF-181

2. filing_chain.py:
   Writes to "1099 Filing Chain" tab (Row 2 headers):
     Asset ID | Asset Description | Acquisition Date |
     1099-A Filed | 1099-A Date | 1099-A Status |
     1099-B #1 Filed | 1099-B #1 Date | 1099-B #1 Status |
     1099-B #2 Filed | 1099-B #2 Date | 1099-B #2 Status |
     Correction Filed | Overall Status | Notes

   For each account in Master Register, check if the full
   1099-A → 1099-B → 1099-B(corrected) chain is complete.

3. mailing_log.py:
   Writes to "Proof of Mailing" tab (Row 2 headers):
     Mail ID | Date Sent | Recipient | Recipient Address |
     Document Sent | Related Form/Filing | USPS Tracking Number |
     PS Form 3811 (Green Card) | Delivery Confirmed | Delivery Date |
     Return Receipt Received | FWM Binder Tab | Document Location | Notes

   Scans for any proof-of-mailing documents in the FileCabinet.

4. deadline_calendar.py:
   Based on current tax year (2025/2026):
   - 1099-A/B recipient copies due: January 31
   - 1099-A/B IRS filing due: February 28 (paper) / March 31 (e-file)
   - Form 1041 (trust return): April 15
   - State equivalents for NC
   Flag any approaching or past deadlines.
   Writes alerts to "Gap Report" tab.

5. tin_matcher.py:
   Validate TIN/EIN consistency across:
   - "Master Register" Provider EIN column (col E)
   - "EIN Acct Ledger" Recipient TIN column (col C)
   - Filed 1099 forms (extracted payer/recipient TINs)
   - W-9 data
   Flag any mismatches to "Gap Report" tab.

6. gap_analyzer.py:
   Writes to "Gap Report" tab (Row 1 headers):
     Tab Name | Row | Column Header | Gap Type | Current Value |
     Severity | Recommended Action | Registry Status

   Generate comprehensive gap report showing:
   - Per provider: missing statement months
   - Per tax year: missing W2s, transcripts, 1099s
   - Per FWM step: completion percentage
   - Per Master Register row: missing required fields
   - TIN mismatches between tabs
   - Incomplete 1099 filing chains
   - Priority ranking: what to obtain next

   Update _Settings.Last Gap Scan with current timestamp.

Run with: python scripts/full_pipeline.py --report gaps
```

---

## PROMPT 6 — Full Pipeline & CLI

```
Build the full pipeline script (scripts/full_pipeline.py) that orchestrates
everything in sequence:

1. Scan FileCabinet → filecabinet_manifest.json
2. Extract data from all classified files → extraction_db.json
3. Build/update account registry from extracted data
4. Generate per-account ledgers
5. Run reconciliation against current TMAR sheet state (all 22 tabs)
6. Identify gaps and compliance issues
7. Sync updated data to Google Sheets (upsert, never overwrite)
8. Update Gap Report tab
9. Update _Settings.Last Gap Scan timestamp
10. Generate summary report

CLI interface using argparse:
  python scripts/full_pipeline.py              # Run full pipeline
  python scripts/full_pipeline.py --scan-only  # Just scan, don't sync
  python scripts/full_pipeline.py --sync-only  # Just sync existing data
  python scripts/full_pipeline.py --report gaps # Just generate gap report
  python scripts/full_pipeline.py --report compliance  # Filing status
  python scripts/full_pipeline.py --report inventory   # Master inventory
  python scripts/full_pipeline.py --provider Fidelity  # Single provider
  python scripts/full_pipeline.py --year 2024          # Single tax year
  python scripts/full_pipeline.py --principal Clint     # Single principal
  python scripts/full_pipeline.py --dry-run            # Preview, don't write
  python scripts/full_pipeline.py --tab "Transaction Ledger"  # Single tab sync

Target tab mapping for sync:
  Scanner output → Document Inventory, Master Register
  BOA extractor → BOA Cash Flow, Transaction Ledger, Banking Log
  CashApp extractor → Transaction Ledger
  PayPal extractor → Transaction Ledger
  W-2 extractor → W-2 & Income Detail, Master Register
  1099 extractor → EIN Acct Ledger, 1099 Filing Chain
  IRS transcript extractor → Document Inventory
  Ledger engine → Trust Ledger, Transaction Ledger, Banking Log
  Compliance tracker → Forms & Authority, 1099 Filing Chain, Proof of Mailing
  Gap analyzer → Gap Report, _Settings
  Reconciler → Gap Report (discrepancies)

Use rich for formatted CLI output showing progress bars, tables, and color-coded status.

Also create a cron-friendly mode:
  python scripts/full_pipeline.py --cron --quiet
  (logs to file, only outputs errors)
```

---

## PROMPT 7 — CLAUDE.md Project Instructions

```
Create the CLAUDE.md file at the project root with comprehensive project
instructions for Claude Code to reference in future sessions:

Include:
- Project purpose: Automate trust administration record-keeping per the
  Freeway Mechanics Workbook framework
- Architecture overview of all modules
- How to run each script
- Google Sheets setup: Service account auth (NO OAuth), credentials path,
  sheet ID, 22-tab structure
- The complete 22-tab schema reference with header rows and column definitions
- The account registry with all known providers and paths
- The FWM step-to-module mapping:
    Step 1 (Identity & File Setup) → scanner module
    Step 7 (Account Inventory) → Master Register tab (35 cols)
    Step 8 (Source Documents) → Document Inventory tab (17 cols) + extractor
    Step 9 (Ledgers) → ledger module + Trust Ledger + Transaction Ledger + Banking Log
    Step 10 (Valuations) → valuation.py (docs-only, no fabrication)
    Step 11 (Admin Notices) → Forms & Authority tab
    Steps 12-15 (IRS Forms) → 1099 Filing Chain + EIN Acct Ledger
    Step 14 (Assembly & Filing) → compliance + Proof of Mailing + Gap Report
- Tab-specific sync rules:
    * Master Register: upsert by Row ID (col A)
    * Transaction Ledger: upsert by Date+Vendor+Amount composite key
    * Document Inventory: upsert by Doc ID
    * BOA Cash Flow: upsert by Month
    * Trust Ledger: append only (asset records are immutable)
    * 1099 Filing Chain: upsert by Asset ID
    * EIN Acct Ledger: upsert by Recipient TIN
    * Forms & Authority: upsert by Form/Document name
    * Proof of Mailing: upsert by Mail ID
    * Gap Report: full replace on each scan (stale gaps are cleared)
    * Banking Log: append only
    * Free-form tabs: cell-level updates only
- Critical compliance rules:
    * NEVER fabricate values on any forms
    * No memo = no uplift
    * Use only verified figures from statements, ledgers, contracts
    * Maintain audit-ready files at every step
    * Validate _Validation dropdown values before writing
- The two principals: Clint (primary) and Syrina (secondary)
- Trust identity: A Provident Private Creditor RLT, EIN 41-6809588, CAF 0317-17351
- File path conventions and naming standards
- Known tab quirks: some have title rows, Banking Log is currently empty
```

---

## Changes from v1 Prompts

| Area | v1 (Original) | v2 (Adapted) |
|------|---------------|--------------|
| Tab count | 8 planned | 22 actual |
| Auth | OAuth2 + token.json | Service account only |
| Credentials | "Create new OAuth" | Reuse BET Project credentials |
| Tab creation | Engine creates tabs | Engine writes to EXISTING tabs |
| Write mode | Overwrite | Upsert (match by key columns) |
| Header rows | All Row 1 | Mixed — some Row 1, some Row 2 (title in Row 1) |
| BOA Cash Flow | Not in v1 | Dedicated tab with 8 cols |
| Transaction Ledger | Not in v1 | 16-col transaction-level detail |
| 1099 Filing Chain | Part of IRS Form Tracker | Dedicated 15-col tab |
| EIN Acct Ledger | Not in v1 | 16-col recipient registry |
| Proof of Mailing | Not in v1 | Dedicated 14-col tab |
| Gap Report | CLI output only | Dedicated 8-col tab + _Settings timestamp |
| Banking Log | Not in v1 | Empty tab — engine creates headers + populates |
| Syrina tabs | Not in v1 | 3 dedicated tabs (read-only for engine) |
| CPA Questions | Not in v1 | 12-col tab (engine can append questions) |
| _Validation | Not in v1 | Dropdown source data — engine validates against it |
| Filing Deadlines | Dedicated tab | Merged into Gap Report alerts |
| Contact Registry | Dedicated tab | Not present — contacts in free-form dashboard |
| Subscription Register | Dedicated tab | "Receipts, Subscriptions & Services" (10 cols) |
| compliance/ | 3 files | 6 files (form_tracker, filing_chain, mailing_log, deadline_calendar, gap_analyzer, tin_matcher) |

---

## Quick-Start Sequence

After copying these prompts into Claude Code, execute in order:

| Order | Prompt | What It Does | Depends On |
|-------|--------|-------------|------------|
| 0 | Init | Creates project structure, config, dependencies | Nothing |
| 1 | Scanner | Catalogs all files in FileCabinet | Prompt 0 |
| 2 | Extractor | Pulls structured data from PDFs/CSVs | Prompt 1 |
| 3 | Sheets | Sets up Google Sheets read/write engine | Prompt 0 + sheet shared ✅ |
| 4 | Ledger | Builds trust ledgers per account | Prompts 2 + 3 |
| 5 | Compliance | Tracks IRS forms, deadlines, gaps | Prompts 1 + 3 |
| 6 | Pipeline | Wires everything together via CLI | All above |
| 7 | CLAUDE.md | Project memory for future sessions | All above |

---

## Pre-Requisites Status

| Prerequisite | Status |
|---|---|
| Google Sheets API enabled | ✅ Ready |
| Service account credentials | ✅ `/Users/animatedastronaut/Downloads/04_Dev-Config/credentials.json` |
| TMAR sheet shared with service account | ✅ Confirmed 2026-02-26 |
| Python 3.9.6 (system) | ⚠️ Works, 3.11+ preferred |
| Tesseract OCR | ❌ `brew install tesseract` (Claude Code can install) |
| uv | ❌ Claude Code can install |

---

_Generated: 2026-02-26 | Framework: Freeway Mechanics Workbook Part 1_
_FileCabinet scanned: 200+ files across 6 providers, 2 principals, tax years 2016-2025_
_Sheet: 22 tabs, 35-col Master Register, service account access confirmed_
