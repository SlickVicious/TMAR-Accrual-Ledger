---
name: "proof-of-mailing-tracker"
description: "Fill and delivery-track the TMAR Live workbook's 'Proof of Mailing' tab. Use when recording certified/registered mail, reconciling USPS tracking results against PS Form 3800/3811 stubs, detecting transposed tracking numbers, or updating delivery status/dates for a mailing batch. Triggers: proof of mailing, PoM, certified mail log, tracking results, green card, PS 3811, MAIL-NNN, delivery confirmation."
---

# Proof of Mailing Tracker

Curated process for keeping the TMAR **Proof of Mailing** tab accurate: log each certified/registered
mailing when sent, then reconcile USPS delivery scans against the physical stubs and record delivery.

The tab is a legal evidence record (proof of service / mailing for tax filings, UCC demand letters,
vital-records requests). Accuracy of the **tracking-number ↔ recipient** pairing is the whole point —
a transposed number means you can't prove a specific letter reached a specific creditor.

## Where this lives

- **Sheet:** Live TMAR workbook, tab `Proof of Mailing`. Book id `1k6J2s0x…WInQ` (`TMAR_CONFIG.liveBookId`).
- **Source of truth (code):** `gas/PopulateProofOfMailing.gs` → `pomRecords_()`. Edit the record there, then
  re-apply. Never hand-edit the sheet as the primary write — the sheet is regenerated from `pomRecords_()`.
- **Physical source:** USPS receipts under `04-Taxes\Receipts\Postal\` (PS Form 3800 certified stubs,
  PS Form 3811 green cards, batch receipt photos). Receipt naming: `DDMMMYY_TYPE_purpose_last6`
  (e.g. `27JUN26_PO_creditors-8x-receipt.jpg`, `27MAY26_GC_IRS-KC-2022_012135.pdf`).

## Column schema (14 cols, exact order)

`Mail ID | Date Sent | Recipient | Recipient Address | Document Sent | Related Form/Filing |
USPS Tracking Number | PS Form 3811 (Green Card) | Delivery Confirmed | Delivery Date |
Return Receipt Received | FWM Binder Tab | Document Location | Notes`

There is **no** "delivery method" or "status" column — method (PO Box / Left with Individual / Picked Up
at Post Office / Individual) and delivery time go in **Notes**. `pomRecords_()` keys map to columns via
`pomKey_()`; the `service`/`cost`/`status` keys are intentionally dropped (no column) but kept in the
record for documentation.

## Vocabulary

- **Mail ID:** `MAIL-NNN`, sequential, never reused.
- **Status (record only):** `MAILED` → `MAILED — awaiting delivery` → `DELIVERED`.
- **Delivery method (goes in Notes):** `PO Box`, `Left with Individual`, `Picked Up at Post Office`, `Individual`.
- **Delivery Confirmed:** `Yes` once USPS shows delivered. **Delivery Date:** ISO `YYYY-MM-DD`.
- **Return Receipt Received:** `Yes - hardcopy` only when the physical green card is in hand; otherwise leave blank
  or `Yes - hardcopy (return pending)`.

## Process

### A. Log a mailing (at send time)
1. One `MAIL-NNN` record per physical piece. Fill Recipient (legal entity name — see data-topology: use the
   creditor LEGAL ENTITY NAME, not the brand), Recipient Address, Document Sent, Related Form, and the
   **certified tracking number from the PS 3800 stub** (not the batch receipt total).
2. Set `status: 'MAILED'`, `service: 'Certified Mail'` (or `'Certified + Return Receipt'` if a green card was bought).
3. Point `documentlocation` at the receipt scan under `04-Taxes\Receipts\Postal\`.
4. If tracking↔recipient pairing is uncertain (e.g. a batch bought at one counter, stubs not individually
   labeled), say so in Notes: `Cert# pairing tentative — verify vs individual PS 3800 stub.`

### B. Reconcile delivery (when USPS scans post)
1. Pull each piece's USPS tracking detail. Record **where it actually delivered** (city, ST, ZIP) and the
   delivery method + timestamp — not just "delivered".
2. **Swap detection (critical):** compare the USPS *delivered-to ZIP* against the recipient ZIP on the record.
   - Match → pairing confirmed.
   - Mismatch → the tracking numbers were transposed. The physical piece went where USPS delivered it, so a
     tracking number **belongs to the Mail ID whose recipient ZIP equals the delivered ZIP.** Reassign by ZIP.
   - Run `scripts/parse_tracking.py` to do this automatically (see below). It reassigns every tracking number
     to the Mail ID whose recipient ZIP matches the delivered ZIP, so swaps self-correct.
3. Update each record: `status: 'DELIVERED'`, `deliveryconfirmed: 'Yes'`, `deliverydate: 'YYYY-MM-DD'`, and
   append to Notes: `Delivered M/D/YYYY H:MM AM — <method>.` For a corrected pairing, note it explicitly:
   `Tracking CORRECTED YYYY-MM-DD: swapped with MAIL-0NN — USPS shows this piece (…NNNN) delivered CITY ST ZIP.`
4. Green cards (PS 3811): only set `Return Receipt Received: Yes - hardcopy` and a `psform3811` number when the
   physical card is confirmed in hand. Match a floating green card to a piece by postmark facility ↔ destination
   ZIP, and say "VERIFY vs card front" until confirmed.

### C. Apply to the sheet
Edit `pomRecords_()` in `gas/PopulateProofOfMailing.gs`, then apply one of:
- **Editor:** run `refreshProofOfMailing()` in the Apps Script editor (clears MAIL-* rows, re-inserts from records).
- **Remote:** `POST {"action":"refreshProofOfMailing"}` to the Web App exec URL (requires the deployment to be
  on a version that includes the `refreshProofOfMailing` doPost case — redeploy after `clasp push` if not).
Both preserve the header/footer and rebuild only the `MAIL-*` rows. It is idempotent.

## Parser: scripts/parse_tracking.py

Reconciles a delivery batch and emits corrected records. Stdlib only.

```
python scripts/parse_tracking.py --gs gas/PopulateProofOfMailing.gs --results batch.txt
```

- `--gs` : path to `PopulateProofOfMailing.gs` (reads current `mailid → recipient, ZIP, tracking`).
- `--results` : one line per piece, pipe-delimited:
  `MAIL-NNN | <tracking> | delivered | YYYY-MM-DD[ HH:MM] | <method> | <DELIVERED CITY ST ZIP>`
  (the last field is the USPS *delivered-to* location — the swap signal.)

Output: a reconciliation table (per Mail ID: confirmed vs SWAPPED), plus a JSON block of corrected fields
(`uspstracking`, `deliveryconfirmed`, `deliverydate`, method) ready to fold into `pomRecords_()`.

See `references/example-batch.md` for the worked 2026-06-27 creditor batch (where MAIL-010/MAIL-012 were
transposed and auto-corrected by delivered ZIP).

## Guardrails

- Never invent a delivery date or method — leave blank until USPS confirms.
- Never mark `Return Receipt Received: Yes - hardcopy` without the physical green card in hand.
- A blank delivery cell is "not yet confirmed," not "not delivered."
- Keep `pomRecords_()` and the sheet in sync — the sheet is rebuilt from the records, not the reverse.
- Recipient name = legal entity name + the pairing is proven by tracking, not by the brand on the envelope.
