# Domain Models
- Load this file when changing persistence, calculations, schemas, or business rules.
- Preserve existing field names and public interfaces unless explicitly told otherwise.
- Prefer additive schema changes over destructive ones.
- Document assumptions before changing core calculations.
- If a model change affects reports or exports, note downstream impact briefly.

## Master Register Schema (35 columns, A–AI, strict order)

| Col | Field | Notes |
|-----|-------|-------|
| A | ROW_ID | Format: MR-XXX (auto-generated, never reuse) |
| B | DATE_ADDED | ISO date |
| C | PROVIDER | Creditor / institution name |
| D | MAILING_ADDRESS | |
| E | PROVIDER_EIN | |
| F | ACCOUNT_NUMBER | |
| G | ACCOUNT_TYPE | See allowed values below |
| H | ACCOUNT_SUBTYPE | |
| I | ACCOUNT_AGENT | |
| J | AGENT_ADDRESS | |
| K | STATUS | Active / Closed / Pending / Disputed / Verified / Unverified |
| L | OPENED_DATE | |
| M | CLOSED_DATE | |
| N | CURRENT_BALANCE | Number |
| O | HIGH_BALANCE | |
| P | MONTHLY_PAYMENT | |
| Q | APR_RATE | |
| R | BILLING_FREQUENCY | Monthly / Quarterly / Annual / Semi-Annual / Bi-Weekly / Weekly / On-Demand |
| S | NEXT_PAYMENT_DUE | |
| T | PRIMARY_USER | Clint / Syrina / Joint |
| U | SECONDARY_USER | |
| V | ACCOUNT_PURPOSE | |
| W | DOCUMENT_LOCATION | |
| X | LAST_VERIFIED | |
| Y | LINKED_MR_ACCOUNT | |
| Z | TRUST_ASSIGNMENT | |
| AA | TAX_RELEVANCE | |
| AB | TAX_FORM | See allowed values below |
| AC | DEDUCTION_TYPE | |
| AD | CREDIT_REPORT_STATUS | |
| AE | REMOVAL_DATE | |
| AF | DISPUTE_STATUS | |
| AG | NOTES | |
| AH | SOURCE | |
| AI | DISCOVERY_STATUS | Known / Unknown / Suspected / Verified |

**Never reorder or remove columns** — GAS reads by index (`getRange(2, 1, lastRow-1, 35)`).

## Account Type Allowed Values

Bank Account - Checking, Bank Account - Savings, Credit Card, Loan, Trust Account, Investment, Other

## Tax Form Allowed Values

Form 1099-B, Schedule A, Form 990, Form 1065, Form 1120, Form 1041, Form 1120-S, Form 1120-W, Schedule C

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
