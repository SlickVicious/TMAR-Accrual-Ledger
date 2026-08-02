# Domain Models
- Load this file when changing persistence, calculations, schemas, or business rules.
- Preserve existing field names and public interfaces unless explicitly told otherwise.
- Prefer additive schema changes over destructive ones.
- Document assumptions before changing core calculations.
- If a model change affects reports or exports, note downstream impact briefly.

## Master Register Schema (29 columns, A–AC, strict order)

**Corrected 2026-08-01** — the table below was previously documented as 35 columns
(A–AI) with a different field order. That version was stale and never matched the live
sheet; it silently caused real bugs in three separate GAS files that were written
against it instead of the live header (`CreditReportImport.gs`'s row builder,
`pushEntities_` in `SyncCenter.gs`, and `DuplicateAnalyzer.gs`'s column reader — all
fixed same day). This table is verified directly against the live header row, not
assumed. If you touch Master Register column logic again, re-verify against
`?action=pullRawTab&tab=Master%20Register` rather than trusting this doc blindly —
schemas drift.

| Col | Field | Notes |
|-----|-------|-------|
| A | Row ID | Format: MR-XXX (auto-generated, never reuse) |
| B | Date Added | ISO date |
| C | Provider/Creditor | Creditor / institution name |
| D | Provider EIN | |
| E | Account Number | |
| F | Account Type | Observed values include Credit Card, Auto Loan, Trust Entity, Employment W-2 — no confirmed exhaustive list; check the sheet's own data validation if precision matters |
| G | Account Subtype | **Validated dropdown, confirmed 2026-08-01**: Bank Account - Checking, Bank Account - Savings, Bank Account - Money Market, Bank Account - CD, Bank Account - Business Checking, Bank Account - Business Savings, Credit Card - Personal, Credit Card - Business, Credit Card - Secured, Credit Card - Store Card, Line of Credit, Home Equity Line (HELOC), Mortgage - Primary Residence, Mortgage - Investment Property, Auto Loan, Student Loan - Federal, Student Loan - Private, Personal Loan, Business Loan, Payday Loan, Investment - Brokerage (Individual), Investment - Brokerage (Joint), Investment - IRA Traditional, Investment - IRA Roth, Investment - 401(k), Investment - 403(b), Investment - SEP IRA, Investment - Simple IRA, Investment - HSA, Investment - 529 Plan, Investment - Crypto Exchange, Investment - Real Estate, Insurance - Life, Insurance - Health, Insurance - Auto, Insurance - Home/Renters, Insurance - Disability, Insurance - Umbrella, Utility - Electric, Utility - Gas, Utility - Water/Sewer, Utility - Internet, Utility - Phone/Mobile, Utility - Cable/Streaming, Utility - Trash/Recycling, Tax Authority - IRS, Tax Authority - State, Tax Authority - Local, Court - Judgment, Court - Settlement, Government Benefit - SSA, Government Benefit - Medicare, Government Benefit - Medicaid, Collection Account, Charge-off - Bank, Charge-off - Credit Card, Medical Collection, Subscription - Streaming, Subscription - Software, Subscription - Gym/Fitness, Subscription - News/Media, Membership - Professional, Membership - Club/Organization, PayPal, Venmo, Cash App, Cryptocurrency Wallet, Prepaid Card, Gift Card Balance, Retail Financing, Buy Now Pay Later, Rental Agreement, Storage Unit, Other |
| H | Status | Observed values include Active, Closed — no confirmed exhaustive validated list |
| I | Open Date | ISO date |
| J | Close Date | ISO date |
| K | Current Balance | Number — a stale mis-applied validation (a Status-style dropdown) briefly blocked free-form values here; cleared 2026-08-01 via `gas/FixCurrentBalanceValidation.gs` |
| L | Original Balance | Number — used for high-balance/original-principal figures |
| M | Billing Frequency | Monthly / Quarterly / Annual / Semi-Annual / Bi-Weekly / Weekly / On-Demand (observed, not confirmed exhaustive) |
| N | Next Payment Due | |
| O | Primary User | Clint / Syrina / Joint (observed) |
| P | Authorized Users | |
| Q | Autopay Status | |
| R | Payment Source | |
| S | Contract/Terms File | |
| T | Statements Complete | |
| U | Tax Forms on File | |
| V | PoP Documents | |
| W | Document Location | |
| X | Last Statement Date | |
| Y | Last Verified Date | |
| Z | Retention Period | |
| AA | Notes | Free text — in practice also carries fields with no dedicated column (credit-report status, removal date, source citation) folded in as sentences, since there's no AD–AI equivalent in this schema |
| AB | Tags | |
| AC | Discovery Status | Observed: "Newly Discovered", "Synced from Ledger" — no confirmed exhaustive validated list |

**Never reorder or remove columns** — GAS reads by index (`getRange(2, 1, lastRow-1, 29)`).
There is no dedicated Tax Form, Mailing Address, Account Agent, High Balance, APR/Rate,
Secondary User, Account Purpose, Linked MR Account, Trust Assignment, Tax Relevance,
Deduction Type, Credit Report Status, Removal Date, Dispute Status, or Source column in
the live sheet, despite an earlier version of this doc claiming otherwise — any of that
information that needs to be captured goes in Notes (AA) as free text.

## Account Subtype Allowed Values

See column G above — this is the one column with a confirmed, validated, exhaustive
dropdown list as of 2026-08-01.

## Transaction Model (src/services/TransactionService.js)

```javascript
{
  id: string,           // auto-generated UUID
  date: string,         // ISO date
  category: string,     // determines type: Income / Expense / Transfer
  description: string,
  amount: number,       // never zero; validation throws on 0
  accountId: string,    // foreign key to Account.id
  type: string,         // derived from category name
  reconciled: boolean,  // immutable once set true
  createdAt: string,
  updatedAt: string
}
```

## Account Model (src/services/AccountService.js)

```javascript
{
  id: string,
  name: string,
  type: string,           // matches Master Register ACCOUNT_TYPE values
  accountNumber: string,
  balance: number,
  status: string,         // Active / Closed / Pending / Disputed / Verified / Unverified
  primaryUser: string,    // Clint / Syrina / Joint
  billingFrequency: string,
  discoveryStatus: string,
  createdAt: string,
  updatedAt: string
}
```

## appData (localStorage)

Top-level keys stored under the `appData` key:

| Key | Type |
|-----|------|
| entities | array |
| transactions / ledgerEntries | array |
| chartOfAccounts | array |
| payables / receivables | array |
| journalEntries | array |
| filings | array |
| eliminations | array |
| settings | object |
| syncLog | array |
| lastSaved | timestamp |

## Balance Calculations

- **Assets:** accounts where `balance > 0`
- **Liabilities:** accounts where `balance < 0` (use absolute value for display)
- **Net Worth:** `totalAssets - totalLiabilities`
- **Net Income:** `totalIncome - totalExpenses`
- Verification threshold: 90 days (configurable, used by `getAccountsNeedingVerification()`)

## Immutability Rule

All service functions return **new objects** — never mutate the input. This is enforced by tests. Follow this pattern:
```javascript
// Correct
return { ...account, balance: newBalance, updatedAt: new Date().toISOString() };
// Wrong
account.balance = newBalance; return account;
```

## Persistence Layers

1. **localStorage** (primary, browser-side) — sync read/write, ~5-10 MB quota, no encryption
2. **Google Sheets** (secondary) — via GAS; manual sync trigger
3. **IndexedDB / GCMemory** (agent memory) — auto-managed, 500-record cap
4. **Vault** (AES-256-GCM, PBKDF2) — separate from appData; manages API keys
