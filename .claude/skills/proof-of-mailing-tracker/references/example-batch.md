# Worked example — 2026-06-27 creditor demand-letter batch

Eight UCC demand letters (`MAIL-005`..`MAIL-012`), certified, no return receipts. Reconciled
2026-07-14 from USPS delivery scans. Two tracking numbers (`MAIL-010` Progressive ↔ `MAIL-012`
Piedmont) had been transposed at logging; the parser caught it by delivered ZIP.

## Input

`2026-06-27-creditor-batch.txt` (one line per piece; last field = USPS *delivered-to* location):

```
MAIL-010 | 9589 0710 5270 4022 2900 95 | delivered | 2026-07-02 | Picked Up at Post Office | CHARLOTTE NC 28233
MAIL-012 | 9589 0710 5270 4022 2901 01 | delivered | 2026-07-06 | Picked Up at Post Office | CLEVELAND OH 44101
```

## Run

```
python scripts/parse_tracking.py --gs ../../../gas/PopulateProofOfMailing.gs \
    --results references/2026-06-27-creditor-batch.txt
```

## Result

The parser matches each tracking number to the Mail ID whose **recipient ZIP equals the delivered ZIP**:

- `…2900 95` delivered **CHARLOTTE NC 28233** → Piedmont's ZIP → belongs to **MAIL-012** (was logged as MAIL-010) → **SWAP**
- `…2901 01` delivered **CLEVELAND OH 44101** → Progressive's ZIP → belongs to **MAIL-010** (was logged as MAIL-012) → **SWAP**

The other six matched their asserted Mail IDs. Output: `8 piece(s), 2 swap(s) detected`, plus a JSON
block of corrected fields. Those corrections were folded into `pomRecords_()`:

- MAIL-010 (Progressive, Cleveland OH 44101): tracking → `…2901 01`, delivered 2026-07-06, Picked Up at Post Office
- MAIL-012 (Piedmont, Charlotte NC 28233): tracking → `…2900 95`, delivered 2026-07-02, Picked Up at Post Office

Full delivery window: 2026-07-02 → 2026-07-13 (5–16 days from the 6/27 mailing). 8/8 delivered.

## Lesson

When a batch is bought at one counter and the PS 3800 stubs aren't individually labeled, the
tracking↔recipient pairing is a guess until the delivery scan lands. Don't trust the send-time
pairing; let the **delivered ZIP** assign the tracking number. That is exactly what the parser
automates, and why the send-time Notes flagged these as `Cert# pairing tentative`.
