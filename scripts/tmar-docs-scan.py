#!/usr/bin/env python3
"""
tmar-docs-scan.py — scan TMAR docs for stale anchors against the current reality.

Usage:
    python3 scripts/tmar-docs-scan.py            # scan docs/ and report stale hits
    python3 scripts/tmar-docs-scan.py --fix-hint # same, but print the suggested replacement

This is the "reality drift detector" for the documentation layer. When the reality
baseline changes (tab renames, counts, provider list), the anchors below are the
terms docs must NOT still contain. Add a new anchor whenever a rename/refactor
changes a term that is documented in prose.

Exit code 0 = clean (no stale anchors found). Exit 1 = stale anchors found.
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")
SELF = os.path.basename(__file__)

# anchor -> (reason, correction). Regex, applied with re.search (case-sensitive).
# Order matters: put longer/more-specific patterns before shorter ones.
STALE_ANCHORS = [
    (r"Household Obligations", "tab renamed to Business Obligations (2026-10-10)", "Business Obligations"),
    (r"~52 tabs|52 tabs|52\+ tabs|52-tab", "workbook is now 57 tabs (28 visible + 29 hidden)", "57 tabs"),
    (r"23-function hard-allowlist|23 hard-allowlisted|23-function allowlist|of the 23 ", "allowlist is now 29 functions", "29 functions"),
    (r"3\.9 MB|3\.9MB|3\.9 megabytes", "app HTML is now ~4.17 MB", "4.17 MB"),
    (r"Register Summary", "tab folded into 📋 Dashboard (2026-10-08)", "📋 Dashboard"),
    (r"Chart of Accounts\s*\(CoA\)|CoA \(Chart of Accounts\)", "CoA renamed to TIN Registry (2026-10-08)", "TIN Registry"),
    (r"TMAR_AestheticsAndAudit\.gs", "superseded by FormattingComplement.gs", "FormattingComplement.gs"),
]

# Files that are point-in-time historical records — the scanner reports them as
# HISTORICAL (not actionable). They document a past state; do not rewrite their facts.
POINT_IN_TIME = {
    "CODE_AUDIT_2026-08-06.md",
    "Bank_Statement_Extractor_CHANGELOG.md",
    "TMAR-IRS-Autofill-Revision-2026-05-20.md",
    "plans/2026-03-01-tmar-accrual-ledger.md",
    "document-lifecycle-proposal-DRAFT.md",
    "TMAR-Implementation-Status.md",
    "TMAR_Context.md",
    "Universal Accrual Ledger App.md",
    "TMAR-ACCRUAL-LEDGER-DESIGN.md",
    "Workbook_Layout_Optimization_Proposal.md",
    "How to interact with previews.md",
    "TMAR&Vault Preview.md",
    "GAAPCLAW-Parity-Implementation.md",
    "tmar-filecabinet-enhanced-audit.md",
    "plans/Excel-vs-Google-Sheets-Comparison.md",
}

IGNORE_FILES = {"_TMAR-REALITY-BASELINE.md"}


def scan(show_hint=False):
    hits = 0
    living = 0
    for dirpath, _dirs, files in os.walk(DOCS):
        for fn in files:
            if not fn.endswith(".md"):
                continue
            if fn in IGNORE_FILES:
                continue
            path = os.path.join(dirpath, fn)
            rel = os.path.relpath(path, DOCS)
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()
            for i, line in enumerate(lines, 1):
                for pattern, reason, correction in STALE_ANCHORS:
                    m = re.search(pattern, line)
                    if m:
                        # Already-annotated "superseded" references are not drift.
                        if pattern.startswith("TMAR_AestheticsAndAudit") and (
                            "superseded" in line.lower() or "FormattingComplement" in line
                        ):
                            break
                        hits += 1
                        tag = "HISTORICAL" if rel in POINT_IN_TIME else "LIVING"
                        if tag == "LIVING":
                            living += 1
                        print(f"[{tag}] {rel}:{i}: {m.group(0)!r} -> {correction}  ({reason})")
                        if show_hint:
                            print(f"       context: {line.strip()[:120]}")
                        break  # one anchor per line is enough
    return living, hits


if __name__ == "__main__":
    show = "--fix-hint" in sys.argv
    living, total = scan(show)
    print(f"\n{'-'*60}")
    if living == 0:
        if total:
            print(f"CLEAN on living docs — {total} historical anchor(s) remain in point-in-time docs (expected; leave as-is).")
        else:
            print("CLEAN — no stale anchors found in docs/.")
        sys.exit(0)
    else:
        print(f"{living} stale LIVING anchor(s) found ({total} total incl. historical).")
        print("POINT-IN-TIME files are flagged HISTORICAL — leave as-is or add a superseded banner.")
        print("LIVING files should be corrected to the suggested replacement.")
        sys.exit(1)
