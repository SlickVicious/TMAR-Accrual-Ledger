# TMAR Context — 2026-02-26

## Current State
- TMAR Google Sheet is live with existing tabs including Master Register and Acct Ledger
- Acct Ledger tab was added to match an outline but is functionally the same as Master Register with different column headers
- Syrina's TransUnion Credit Report (01/15/2026) has been fully parsed
- Credit Report Import script (TMAR_CreditReport_Import.js) is ready to deploy
- 24 accounts extracted: 5 charge-offs, 2 collections, 7 Nelnet student loans, 1 OneMain, 9 closed/paid

## Key EINs Extracted
| Provider | EIN | Account # |
|----------|-----|-----------|
| Boys & Girls Club Wayne Co | 56-0706013 | Employee #81 |
| Inter Technologies Corp | 54-1990514 | Employee #80 |
| Kinston Arts Council | 56-0842535 | Employee #82 |
| Lenoir CC | 56-0753025 | Employee #83 |
| Fidelity (Individual-TOD) | 04-2731432 | X96-957819 |
| Fidelity (Roth IRA) | 04-3523567 | 237-431235 |
| Fidelity (Cash Mgmt) | — | Z35386396 |
| Vanguard | 23-1945930 | 266304.0 |
| Webull | 13-2967453 | SIA46352 |
| Bank of America | 94-1687665 | 2370 1289 6198 |
| PayPal | 83-0364903 | — |
| SSA | 26-0745325 | — |
| Piedmont Gas | 56-0556998 | 6100008209497 |
| Nelnet (×7 loans) | 84-0748903 | E985506201 |
| OneMain Financial | 27-4393679 | 3243985015137137 |
| First Premier Bank | 46-0119480 | 51780068421***** |
| Merrick Bank | 91-1756404 | 54631667117***** |

## Debt Snapshot (Syrina)
- Total Debt: $51,355
- Monthly Obligation: $302/mo (student loans $135 + OneMain $167)
- DTI: 7.0%
- 1099-C Exposure: $4,611

## Next Steps
1. Run `importSyrinaCreditReportAccounts()` in TMAR Apps Script
2. Run `linkMRIdsToAcctLedger()` to cross-reference
3. Reconcile Acct Ledger vs Master Register columns (same data, align headers)
4. Address 2022 Roth IRA excess contribution issue
5. Obtain 1098-E from Nelnet for student loan interest deduction
