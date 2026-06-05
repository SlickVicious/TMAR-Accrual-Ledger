#!/usr/bin/env python3
"""
portal_pruner.py — Prune unused tabs from TMAR-Accrual-Ledger.html

Strategy per tab key X:
  1. Find the nav button: line containing  data-tab="X"  (single-line match)
  2. Find the content section: line containing  id="XSection"  (single-line match)
  3. From the section's open tag, walk forward with DEPTH-MATCHED <div>/<section>
     bracket counting until depth returns to 0 — that's the section's end line.
  4. Find the switchMainTab init arm: line containing  tabName === 'X'  (single-line)

The drop_list below is the editable inventory. Anything NOT in drop_list is kept.
Default = SAFE (only the 37 unambiguously-non-trust tabs are queued for removal).
The 10 ambiguous tabs (cpsa/trcf/ccsn/fdrf/eeej + cpaTrust/trustAgent/gaapAgent
+ journal/statements) are KEPT by default — edit the drop_list to remove them too.

Usage:
  python portal_pruner.py                 # dry-run preview: print [start,end] per tab
  python portal_pruner.py --execute       # cut + write to TMAR-Accrual-Ledger.pruned.html
                                          # (does NOT overwrite the live file)
  python portal_pruner.py --in-place      # overwrite live file (use only after verifying preview)
"""
import argparse, os, re, sys
from pathlib import Path

REPO = Path(__file__).resolve().parent
LIVE = REPO / "TMAR-Accrual-Ledger.html"

# === DROP LIST — narrow surgical cut per user 2026-06-04 ===
# Original 37-tab cut reverted: user confirmed accounting modules (receivables,
# payables, payroll, invoicing, inventory, etc.) and SPV/CPA/trust modes are
# all in active use. Only these 2 tabs were confirmed stale.
DROP_LIST = [
    "etymologyAnalyzer",   # niche; not used from portal
    "pdfMdConverter",      # superseded by transcriptTransformer / external tools
]

# Opening-tag regex: <div ...> or <section ...>
OPEN_TAG = re.compile(r'<(div|section)\b[^>]*>')
CLOSE_TAG = re.compile(r'</(div|section)>')


def find_section_span(lines, start_line):
    """From start_line (0-indexed), walk forward counting <div>/<section> opens vs closes.
    Return (start_line, end_line) where end_line is the line containing the matching close.
    """
    depth = 0
    for i in range(start_line, len(lines)):
        line = lines[i]
        # Count opens and closes on this line
        opens = len(OPEN_TAG.findall(line))
        closes = len(CLOSE_TAG.findall(line))
        # On the very first line, the outer tag counts as an open
        if i == start_line and opens == 0:
            # Section opener might span multiple lines; treat as +1
            opens = 1
        depth += opens - closes
        if depth <= 0:
            return (start_line, i)
    raise RuntimeError(f'unbalanced <div>/<section> from line {start_line+1}')


def find_button_line(lines, tab_key):
    """Returns int line index of <button data-tab="X"> (kept for back-compat)."""
    pat = re.compile(r'data-tab="' + re.escape(tab_key) + r'"')
    for i, line in enumerate(lines):
        if pat.search(line):
            return i
    return None


def find_button_span(lines, tab_key):
    """Returns (start_line, end_line) span for the <button data-tab="X">...</button>.
    Buttons are not nestable in HTML5 — walk forward to first </button>.
    """
    start = find_button_line(lines, tab_key)
    if start is None:
        return None
    # If the opening <button> tag is on a different (earlier) line than data-tab=,
    # walk back to find it. But in practice, data-tab is on the <button ...> opening line.
    # Walk forward to find </button>
    for i in range(start, len(lines)):
        if '</button>' in lines[i]:
            return (start, i)
    return None


def find_section_open_line(lines, tab_key):
    pat = re.compile(r'id="' + re.escape(tab_key) + r'Section"')
    for i, line in enumerate(lines):
        if pat.search(line):
            return i
    return None


def find_init_arm_line(lines, tab_key):
    # Loose match: looks for tabName === 'X' or 'X' init lookup
    pat = re.compile(r"tabName === ['\"]" + re.escape(tab_key) + r"['\"]")
    for i, line in enumerate(lines):
        if pat.search(line):
            return i
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--execute', action='store_true', help='Write to TMAR-Accrual-Ledger.pruned.html')
    ap.add_argument('--in-place', action='store_true', help='Overwrite live file (USE WITH CAUTION)')
    ap.add_argument('--source', type=Path, default=LIVE, help='Source HTML path')
    args = ap.parse_args()

    if not args.source.exists():
        print(f'ERROR: source not found: {args.source}')
        sys.exit(2)

    src_bytes = args.source.read_bytes()
    text = src_bytes.decode('utf-8', errors='replace')
    lines = text.split('\n')
    orig_size_mb = len(src_bytes) / 1024 / 1024

    print('=' * 78)
    print(f'portal_pruner — {"EXECUTE" if (args.execute or args.in_place) else "DRY-RUN"}')
    print(f'Source: {args.source} ({orig_size_mb:.2f} MB, {len(lines)} lines)')
    print(f'Drop list: {len(DROP_LIST)} tabs')
    print('=' * 78)

    drop_spans = []  # list of (start, end, reason, tab_key)
    misses = []

    for key in DROP_LIST:
        sec_open = find_section_open_line(lines, key)
        init = find_init_arm_line(lines, key)

        report = [f'  {key:<22}']
        bspan = find_button_span(lines, key)
        if bspan is None:
            report.append('button:MISS')
            misses.append((key, 'button'))
        else:
            bs, be = bspan
            if be == bs:
                report.append(f'button:L{bs+1}')
            else:
                report.append(f'button:L{bs+1}-L{be+1}')
            drop_spans.append((bs, be, 'button', key))

        if sec_open is None:
            report.append('section:MISS')
            misses.append((key, 'section'))
        else:
            try:
                s, e = find_section_span(lines, sec_open)
                report.append(f'section:L{s+1}-L{e+1} ({e-s+1} lines)')
                drop_spans.append((s, e, 'section', key))
            except RuntimeError as ex:
                report.append(f'section:UNBALANCED ({ex})')
                misses.append((key, 'section-unbalanced'))

        if init is not None:
            report.append(f'init:L{init+1}')
            drop_spans.append((init, init, 'init', key))

        print(' '.join(report))

    # Merge overlapping spans + sort
    drop_spans.sort()
    print()
    print('-' * 78)
    print(f'Total drop spans: {len(drop_spans)} (button + section + init lines combined)')

    # Compute total lines to remove (with overlap merging)
    if drop_spans:
        merged = [list(drop_spans[0][:2])]
        for s, e, _, _ in drop_spans[1:]:
            if s <= merged[-1][1] + 1:
                merged[-1][1] = max(merged[-1][1], e)
            else:
                merged.append([s, e])
        total_lines = sum(e - s + 1 for s, e in merged)
        # Approximate byte savings: count bytes in those line ranges
        byte_savings = sum(len(lines[i].encode('utf-8')) + 1 for s, e in merged for i in range(s, e + 1))
        print(f'After merge: {len(merged)} contiguous spans')
        print(f'Lines to remove: {total_lines} ({total_lines/len(lines)*100:.1f}% of file)')
        print(f'Estimated byte savings: {byte_savings/1024/1024:.2f} MB ({byte_savings/len(src_bytes)*100:.1f}%)')

    if misses:
        print()
        print(f'MISSES ({len(misses)}):')
        for k, what in misses:
            print(f'  {k:<22} no {what}')

    if not (args.execute or args.in_place):
        print()
        print('DRY-RUN — re-run with --execute (writes .pruned.html) or --in-place (overwrites).')
        return

    # === EXECUTE ===
    # Mark each line for deletion, then write only the unmarked lines.
    drop_mask = [False] * len(lines)
    for s, e in merged:
        for i in range(s, e + 1):
            drop_mask[i] = True
    new_lines = [ln for i, ln in enumerate(lines) if not drop_mask[i]]
    new_text = '\n'.join(new_lines)
    new_bytes = new_text.encode('utf-8')

    if args.in_place:
        backup = args.source.with_suffix('.html.prepruner-bak')
        backup.write_bytes(src_bytes)
        args.source.write_bytes(new_bytes)
        out_path = args.source
        print(f'IN-PLACE: backup → {backup}')
    else:
        out_path = args.source.with_suffix('.pruned.html')
        out_path.write_bytes(new_bytes)

    new_size_mb = len(new_bytes) / 1024 / 1024
    print(f'WROTE:  {out_path}  ({new_size_mb:.2f} MB, was {orig_size_mb:.2f} MB)')
    print(f'Saved:  {orig_size_mb - new_size_mb:.2f} MB')


if __name__ == '__main__':
    main()
