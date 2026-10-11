#!/usr/bin/env python3
"""
tmar-doc-watchdog.py — cron watchdog for TMAR docs drift.

Runs the reality baseline extractor (silently) then the staleness scanner.
Prints NOTHING when docs are clean; prints the drift report when stale anchors
are found. This is the `script` for a no_agent cron job — empty stdout = no
delivery, so the operator is only poked when there is actually drift to fix.
"""

import subprocess
import sys
import os

ROOT = "/mnt/c/Users/rhyme/Documents/TMAR-Accrual-Ledger"


def main():
    # 1. Regenerate the reality baseline (silent — discard its "Wrote ..." line).
    subprocess.run(
        [sys.executable, os.path.join(ROOT, "scripts", "tmar-reality-baseline.py")],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )

    # 2. Scan for drift. Capture output and exit code.
    p = subprocess.run(
        [sys.executable, os.path.join(ROOT, "scripts", "tmar-docs-scan.py")],
        cwd=ROOT, capture_output=True, text=True,
    )

    if p.returncode != 0 and p.stdout.strip():
        # Drift found — emit a compact report so the cron delivers it.
        print("TMAR docs drift detected. Fix per skill `tmar-docs-maintenance`.\n")
        print(p.stdout.strip())
    # else: clean — print nothing (no delivery).


if __name__ == "__main__":
    main()
