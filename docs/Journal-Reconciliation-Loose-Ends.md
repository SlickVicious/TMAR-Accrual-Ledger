# Journal Entries Reconciliation — Loose Ends

Honest loose ends not auto-fixed (need your call, not a field-mapping issue):

## 1. Journal entries

The clean "Journal" data table is empty, but the "General Ledger" tab holds 37 formatted report rows (title block + running-balance column) in a different schema (Entry#, Date, Account, Account Type, Description, Ref/Authority, Debit, Credit, Balance). Reconciling them is a data migration (move the 37 into the Journal table), not a mapping fix — I didn't want to risk corrupting the human-readable General Ledger.

## 2. Receivables

Receivables is an empty tab (no data to drift), and asset/spv have no sheet source (they're GUI-local stores).

## Open question

Want me to migrate the 37 General Ledger rows into the Journal table (with a backup-first approach), or leave the General Ledger as the formatted report and just wire `pullJournalEntries` to read it directly?
