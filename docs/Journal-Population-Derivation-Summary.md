# Journal Population — Derivation Summary (2026-10-16, FINAL)

## Result
- **248 double-entry journal entries** derived from the Transaction Ledger + Truist statement CSVs, pushed to the `Journal` sheet via `pushJournalEntries`.
- **496 lines** (2 per entry), fully balanced: **$69,208.89 debit = $69,208.89 credit** (diff $0.00).
- Verified live via `pullJournalEntries` and raw-tab totals after every push.
- The Truist (APPCRLT trust account 1340030301225) activity is now **fully reconciled** — all 19 statement transactions captured (7 originally missing-amount + 12 absent from the Transaction Ledger).

## Source
- `Transaction Ledger` (239 rows) → 229 journalizable rows (10 rows skipped: 7 Truist-no-amount + 1 correction note + 2 footer banners).
- Truist CSVs (`03-Banking/Clinton/Truist/Statements/CSV/`) → 19 transactions total. Note: the monthly `Truist_2026-0X.csv` extracts are STALE (stop at July); the `all_accounts_*.csv` quarterly exports are the current/authoritative source (through 09/29).

## Account mapping (final, operator-confirmed classifications)
| Category | DR / CR account |
|---|---|
| Housing — Rent | 6300 Rent Expense |
| Housing — Lawn | 6600 Repairs & Maintenance |
| Utilities (Electric/Cell/Internet/Gas) | 6400 Utilities |
| Subscriptions (software/streaming/AI/etc.) | 6700 Office Supplies |
| Insurance (Life/Auto/Phone) | 6500 Insurance |
| Debt — Credit Card / Personal Loan | 2500 Notes Payable (liability reduction) |
| Debt — Student Loan | 2600 Long-Term Debt (liability reduction) |
| Healthcare / Groceries / Shopping / Fitness / Personal | 9100 Miscellaneous Expense |
| Dining (Fast Food/Restaurant) | 7600 Meals & Entertainment |
| Travel / Transportation — Fuel | 7500 Travel Expense |
| Automotive | 6600 Repairs & Maintenance |
| Administrative Expense / Administrative | 6800 Professional Fees |
| Bank Fee | 8100 Bank Charges |
| Taxes — IRS Payment | 9000 Income Tax Expense |
| Income (Salary/Gift/Deposit) | CR 4900 Other Income |
| Transfers (outgoing) | DR 3500 Owner Draws / Distributions |
| Transfer In (incoming) | CR 3500 Owner Draws / Distributions |
| Trust Funding | CR 3600 Trust Corpus |
| **Owner Distribution (living expense)** | DR 3500 Owner Draws / Distributions |
| **Education (Tutor)** | DR 6800 Professional Fees |

Offset cash account for all entries: **1000 Cash - Operating**.

## 3R framing (per redressright.me TAX.html)
- **Recognition** — the operator's election to treat household/trust activity on the accrual basis.
- **Realization** — the paired debit/credit entries (248 entries, 496 lines, every entry a balanced pair).
- **Reconciliation** — balanced trial balance: $69,208.89 DR = $69,208.89 CR, diff $0.00. No half-ledgers.

## Judgment calls (flagged for operator review)
1. W-2 salary → 4900 Other Income (household income, consistent with register's "W-2 Wage" family).
2. Debt payments treated as full principal reduction — interest not broken out.
3. All subscriptions (business software AND streaming) → 6700 Office Supplies — streaming is likely personal.
4. **"Education (Tutor)" → 6800 Professional Fees** — the 80-account GAAP CoA has no dedicated Education/Tutoring account. If a distinct account (e.g. 6850 Education) is wanted, add it to the CoA and remap the 6 education entries ($110 total).

## Open items
1. **BOA / CapOne / PNC reconciliation** — the Transaction Ledger's 2022–2025 household data has not yet been checked against those bank CSVs for the same completeness gap the Truist data had. Point me at those CSVs to complete the full centralization.
2. **Ledgers register** (14 monthly bank sub-ledger summaries) remains opening-balance / control-account material — a separate opening-balance step requiring an opening-date decision.
