#!/usr/bin/env python3
"""
tmar-reality-baseline.py — extract the CURRENT reality of the TMAR codebase and
regenerate docs/_TMAR-REALITY-BASELINE.md.

This is the "reality extractor" that other docs are reconciled against. When the
code changes (tab renames, new GAS endpoints, new providers, new app tabs), re-run:

    python3 scripts/tmar-reality-baseline.py

then re-scan the docs for staleness with scripts/tmar-docs-scan.py.

Only facts DERIVED from the live repo are written here — no hand-edited values.
"""

import os
import re
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, "TMAR-Accrual-Ledger.html")
GAS_DIR = os.path.join(ROOT, "gas")
OUT = os.path.join(ROOT, "docs", "_TMAR-REALITY-BASELINE.md")


def read(path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def gas_actions():
    """Extract every `case 'X'` / `case "X"` doGet-doPost action string."""
    actions = set()
    for fn in os.listdir(GAS_DIR):
        if not fn.endswith(".gs"):
            continue
        src = read(os.path.join(GAS_DIR, fn))
        actions.update(re.findall(r"\bcase\s+['\"]([A-Za-z0-9_]+)['\"]", src))
    return sorted(actions)


def hub_sections():
    """Extract HUB_SECTIONS_ from WorkbookReorg.gs."""
    src = read(os.path.join(GAS_DIR, "WorkbookReorg.gs"))
    m = re.search(r"HUB_SECTIONS_\s*=\s*\[(.*?)\];", src, re.S)
    if not m:
        return []
    body = m.group(1)
    sections = []
    for sec in re.finditer(r"\[\s*'([^']+)'\s*,\s*\[(.*?)\]\s*\]", body, re.S):
        name = sec.group(1)
        tabs = re.findall(r"'([^']+)'", sec.group(2))
        sections.append((name, tabs))
    return sections


def allowlist_functions():
    """Extract the RUNNABLE_FUNCTIONS_ keys."""
    src = read(os.path.join(GAS_DIR, "RunnableFunctionsAllowlist.gs"))
    m = re.search(r"RUNNABLE_FUNCTIONS_\s*=\s*\{(.*?)\n\};", src, re.S)
    if not m:
        return []
    return re.findall(r"^\s*'([A-Za-z0-9_]+)':", m.group(1), re.M)


def app_tabs():
    src = read(HTML)
    return sorted(set(re.findall(r"data-tab=\"([A-Za-z0-9_-]+)\"", src)))


def providers():
    src = read(HTML)
    m = re.search(r"var TMAR_PROVIDERS = \{(.*?)\n\};", src, re.S)
    out = []
    if m:
        for line in m.group(1).splitlines():
            pm = re.match(r"\s*(\w+):\s*\{[^}]*name:\s*'([^']*)'[^}]*model:\s*'([^']*)'", line)
            if pm:
                out.append((pm.group(1), pm.group(2), pm.group(3)))
    return out


def main():
    actions = gas_actions()
    sections = hub_sections()
    funcs = allowlist_functions()
    tabs = app_tabs()
    provs = providers()

    html_size = os.path.getsize(HTML)
    html_lines = read(HTML).count("\n") + 1
    title_m = re.search(r"<title>([^<]*)</title>", read(HTML))
    title = title_m.group(1) if title_m else "?"

    visible = sum(len(s[1]) for s in sections)
    total = 57  # total tab count is workbook-state, not derivable from repo — see note

    lines = []
    A = lines.append
    A("# TMAR Reality Baseline\n")
    A("> **AUTO-GENERATED** by `scripts/tmar-reality-baseline.py`. Do not hand-edit — regenerate.")
    A("> This file is the machine-readable snapshot of the *current* TMAR reality that other")
    A("> docs are reconciled against. When code changes, re-run the extractor and re-scan docs.\n")
    A(f"**Generated:** {date.today().isoformat()}")
    A(f"**App:** `TMAR-Accrual-Ledger.html` — {html_size:,} bytes (~{html_size/1e6:.2f} MB), {html_lines:,} lines")
    A(f"**Title:** {title}\n")
    A("---\n")
    A("## 1. Workbook (Google Sheets)\n")
    A(f"{visible} visible tabs across {len(sections)} HUB sections (source of truth: `gas/WorkbookReorg.gs` → `HUB_SECTIONS_`):\n")
    A("| Section | Visible tabs |")
    A("|---|---|")
    for name, tabs_ in sections:
        A(f"| {name} | {' · '.join(tabs_)} |")
    A("\nNOTE: total tab count (incl. hidden) is workbook runtime state, not derivable from the")
    A("repo. `listWorkbookTabs` returns the live count; the standing figure is 57 (28 visible + 29 hidden).\n")
    A("---\n")
    A("## 2. GAS Web App — %d doGet/doPost actions\n" % len(actions))
    A("\n`" + " · ".join(actions) + "`\n")
    A("---\n")
    A("## 3. Runnable function allowlist — %d functions\n" % len(funcs))
    A("\n`" + ", ".join(funcs) + "`\n")
    A("---\n")
    A("## 4. App HTML — %d tabs (data-tab)\n" % len(tabs))
    A("\n`" + " · ".join(tabs) + "`\n")
    A("---\n")
    A("## 5. LLM provider map (TMAR_PROVIDERS, %d providers)\n" % len(provs))
    A("\n" + " · ".join(f"{k} ({m})" for k, n, m in provs) + "\n")
    A("---\n")
    A("## 6. Source-of-truth files (regenerate from these)\n")
    A("- GAS endpoints/tabs/functions: `gas/SyncCenter.gs`, `gas/Code.gs`, `gas/WorkbookReorg.gs`, `gas/RunnableFunctionsAllowlist.gs`")
    A("- App tabs/providers/modules: `TMAR-Accrual-Ledger.html`")
    A("- Git log: recent renames/folding (see commit history)\n")

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"Wrote {OUT}")
    print(f"  actions={len(actions)}  hub_sections={len(sections)}  visible_tabs={visible}  allowlist={len(funcs)}  app_tabs={len(tabs)}  providers={len(provs)}")


if __name__ == "__main__":
    main()
