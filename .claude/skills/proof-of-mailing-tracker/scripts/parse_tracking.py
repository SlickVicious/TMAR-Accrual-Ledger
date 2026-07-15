#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
parse_tracking.py — reconcile a USPS delivery batch against the Proof of Mailing records.

Reads the current records from PopulateProofOfMailing.gs (mailid -> recipient, destination ZIP,
tracking) and a pipe-delimited results file (one line per piece), then:

  * matches each delivered piece to the Mail ID whose recipient ZIP equals the *delivered-to* ZIP,
  * flags transposed tracking numbers (delivered ZIP != the assigned record's ZIP),
  * emits a reconciliation table + a JSON block of corrected fields for pomRecords_().

The core rule: a physical piece went where USPS delivered it, so a tracking number belongs to the
Mail ID whose recipient ZIP matches the delivered ZIP. That reassigns swaps automatically.

Results line format (fields pipe-delimited; trailing fields optional except the delivered location):
    MAIL-NNN | <tracking> | delivered | YYYY-MM-DD[ HH:MM AM] | <method> | <DELIVERED CITY ST ZIP>

Usage:
    python parse_tracking.py --gs ../../gas/PopulateProofOfMailing.gs --results batch.txt
    python parse_tracking.py --gs PopulateProofOfMailing.gs --results - < batch.txt   # stdin

Stdlib only. Works under WSL python3 and Windows python.
"""
import argparse
import json
import re
import sys


ZIP_RE = re.compile(r"\b(\d{5})(?:-\d{4})?\b")


def last_zip(text):
    """Return the last 5-digit ZIP in a string (the destination ZIP in an address), or ''."""
    zs = ZIP_RE.findall(text or "")
    return zs[-1] if zs else ""


def norm_tracking(t):
    """Digits only, so '9589 0710 ... 2901 01' and '...2901 01' compare on their tail."""
    return re.sub(r"\D", "", t or "")


def parse_gs_records(path):
    """
    Extract records from PopulateProofOfMailing.gs pomRecords_().
    Returns list of dicts: {mailid, recipient, address, zip, tracking, tracking_digits}.
    Tolerant regex parse — does not execute the JS.
    """
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    records = []
    # Each record is a { ... } object literal containing mailid: 'MAIL-NNN'. Split on 'mailid:'.
    chunks = re.split(r"\bmailid\s*:", src)
    for chunk in chunks[1:]:
        mid = re.match(r"\s*'([^']+)'", chunk)
        if not mid:
            continue
        mailid = mid.group(1)

        def field(name):
            m = re.search(r"\b" + name + r"\s*:\s*'((?:[^'\\]|\\.)*)'", chunk)
            return m.group(1).replace("\\'", "'") if m else ""

        recipient = field("recipient")
        address = field("recipientaddress")
        tracking = field("uspstracking")
        records.append({
            "mailid": mailid,
            "recipient": recipient,
            "address": address,
            "zip": last_zip(address),
            "tracking": tracking,
            "tracking_digits": norm_tracking(tracking),
        })
    return records


def parse_results(lines):
    """
    Parse pipe-delimited result lines into dicts:
    {mailid, tracking, status, date, method, delivered, delivered_zip}
    """
    out = []
    for raw in lines:
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 6:
            sys.stderr.write("WARN skipping (need 6 fields): %s\n" % line)
            continue
        mailid, tracking, status, date, method, delivered = parts[:6]
        out.append({
            "mailid": mailid,
            "tracking": tracking,
            "tracking_digits": norm_tracking(tracking),
            "status": status,
            "date": date,
            "method": method,
            "delivered": delivered,
            "delivered_zip": last_zip(delivered),
        })
    return out


def reconcile(records, results):
    """
    For each delivered piece, determine the CORRECT owning Mail ID by matching delivered ZIP to
    a record's recipient ZIP. Compare against the piece's asserted Mail ID to detect swaps.
    Returns (rows, corrections) where corrections maps mailid -> corrected fields.
    """
    by_zip = {}
    for r in records:
        by_zip.setdefault(r["zip"], []).append(r)

    rows = []
    # correct_tracking[mailid] = tracking whose delivered ZIP matches that mailid's recipient ZIP
    corrections = {}

    for res in results:
        dz = res["delivered_zip"]
        owners = by_zip.get(dz, [])
        correct_owner = owners[0]["mailid"] if len(owners) == 1 else (
            owners[0]["mailid"] if owners else "")
        swapped = bool(dz) and correct_owner and correct_owner != res["mailid"]
        rows.append({
            "asserted_mailid": res["mailid"],
            "tracking": res["tracking"],
            "delivered": res["delivered"],
            "delivered_zip": dz,
            "correct_mailid": correct_owner or res["mailid"],
            "swapped": swapped,
            "date": res["date"],
            "method": res["method"],
            "status": res["status"],
        })
        owner = correct_owner or res["mailid"]
        # Date -> ISO (take leading YYYY-MM-DD if a time trails it)
        iso = res["date"].split()[0] if res["date"] else ""
        corrections[owner] = {
            "uspstracking": res["tracking"],
            "deliveryconfirmed": "Yes",
            "deliverydate": iso,
            "status": "DELIVERED",
            "method": res["method"],
            "delivered": res["delivered"],
        }
    return rows, corrections


def main():
    ap = argparse.ArgumentParser(description="Reconcile a USPS delivery batch vs Proof of Mailing records.")
    ap.add_argument("--gs", required=True, help="path to PopulateProofOfMailing.gs")
    ap.add_argument("--results", required=True, help="results file (pipe-delimited), or - for stdin")
    ap.add_argument("--json-only", action="store_true", help="print only the corrections JSON")
    args = ap.parse_args()

    records = parse_gs_records(args.gs)
    rec_by_id = {r["mailid"]: r for r in records}

    if args.results == "-":
        lines = sys.stdin.readlines()
    else:
        with open(args.results, "r", encoding="utf-8") as f:
            lines = f.readlines()
    results = parse_results(lines)

    rows, corrections = reconcile(records, results)

    if not args.json_only:
        print("Proof of Mailing - delivery reconciliation")
        print("=" * 78)
        for row in rows:
            flag = "  SWAPPED" if row["swapped"] else ""
            owner = rec_by_id.get(row["correct_mailid"], {})
            print("%-9s tracking …%-6s -> delivered %-24s = %s (%s)%s" % (
                row["asserted_mailid"],
                norm_tracking(row["tracking"])[-6:],
                row["delivered"],
                row["correct_mailid"],
                owner.get("recipient", "?"),
                flag,
            ))
        swaps = [r for r in rows if r["swapped"]]
        print("-" * 78)
        print("%d piece(s), %d swap(s) detected." % (len(rows), len(swaps)))
        for s in swaps:
            print("  SWAP: tracking …%s belongs to %s (%s), not %s" % (
                norm_tracking(s["tracking"])[-6:], s["correct_mailid"],
                rec_by_id.get(s["correct_mailid"], {}).get("recipient", "?"),
                s["asserted_mailid"]))
        print("\nCorrected fields (fold into pomRecords_()):")

    print(json.dumps(corrections, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
