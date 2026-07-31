# Ledger Calculation Rules
- Load this file when changing financial calculations, balance logic, reporting, or business-rule derivations.
- Do not change calculation semantics without explicit user approval — these rules affect financial reports.
- Prefer additive changes; trace impact to all consumers before modifying a formula.

## Balance Classification

| Condition | Classification |
|-----------|---------------|
| `account.balance > 0` | Asset |
| `account.balance < 0` | Liability (use `Math.abs(balance)` for display) |
| `account.balance === 0` | Neutral (count in totals, show as $0) |

**Net Worth:** `totalAssets - Math.abs(totalLiabilities)`

Never invert this formula. Net Worth can be negative.

## Income vs. Expense Classification

Transaction type is **derived from `category` name**, not stored separately:
- Category name contains "Income", "Revenue", "Salary", "Deposit" → type = `"Income"`
- Category name contains "Transfer" → type = `"Transfer"` (excluded from net income)
- All other categories → type = `"Expense"`

`TransactionService.calculateNetIncome(transactions)` returns:
```javascript
{ income: number, expenses: number, net: number }
// net = income - expenses (transfers excluded)
```

## Monthly Spending Report

`calculateMonthlySpending(transactions, year, month)` where `month` is 1–12.

Filters by: `new Date(txn.date).getFullYear() === year && new Date(txn.date).getMonth() + 1 === month`

Returns: `{ category: { transactions: [], total: number, count: number } }`

Only `Expense`-type transactions are included (Income/Transfer excluded).

## Account Verification Threshold

Default: **90 days** from `LAST_VERIFIED` date.
Used by `getAccountsNeedingVerification(daysThreshold = 90)`.
Configurable per call; do not hardcode 90 elsewhere — pass the parameter.

## MR-ID Generation

Format: `MR-` + zero-padded 3-digit number (e.g., `MR-042`).
`SheetsService.generateNextMRId()` reads the last ROW_ID in the Master Register and increments.
**Never reuse or manually assign MR-IDs.**

## Financial Summary Shape

`TMARService.getFinancialSummary()` and `TMARBridge.getTMARFinancialSummary()` must return:

```javascript
{
  totalAssets: number,
  totalLiabilities: number,   // positive value (already abs)
  netWorth: number,
  income: number,
  expenses: number,
  netIncome: number,
  balancesByType: { [accountType]: number },
  accountCount: number,
  transactionCount: number,
  lastSync: string            // ISO timestamp or null
}
```

Both browser-side (`TMARService`) and GAS-side (`TMARBridge`) return this same shape. Keep them in sync.

## Reconciliation Rule

Once `transaction.reconciled` is set to `true`, **it must not be set back to false**.
`TransactionService.reconcileTransaction(txn)` returns `{ ...txn, reconciled: true }`.
Do not add an unreconcile function without explicit user request.

## Tax Relevance

`getTaxRelevantAccounts(year)` filters accounts where `TAX_RELEVANCE` is truthy and groups by `TAX_FORM`.
Supported forms: Form 1099-B, Schedule A, Form 990, Form 1065, Form 1120, Form 1041, Form 1120-S, Form 1120-W, Schedule C.
Adding a new form requires updating the _Validation sheet dropdown via `PopulateValidation.gs`.

## Primary Users

Valid values: `Clint`, `Syrina`, `Joint`.
`getAccountsByUser(user)` does a case-sensitive match on `PRIMARY_USER`.
Do not add new user values without updating validation lists.

## Dispute Status Flow

Typical progression: `""` → `"Disputed"` → `"Removed"` or `"Resolved"`.
`REMOVAL_DATE` must be set when status becomes `"Removed"`.
`getDisputedAccounts()` returns accounts where `DISPUTE_STATUS === "Disputed"` (not Removed).

## Immutability Requirement

All service layer calculations must return **new objects**. Never mutate input arrays or objects.
This is enforced by unit tests in `src/__tests__/AccountService.test.js`.
