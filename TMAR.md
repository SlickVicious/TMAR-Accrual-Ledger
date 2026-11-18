---
type: index
status: active
tags:
  - "#TMAR"
---

# TMAR — Trust Master Account Register

This is the central hub for the TMAR system.

## What Is TMAR?

TMAR (Trust Master Account Register) is a living, multi-surface relational database for trust administration. It tracks accounts, transactions, filings, creditors, and documents across Google Sheets, a GitHub Pages control panel, and the Obsidian vault.

## Key Entry Points

- **[[VaultIndex]]** — Complete vault map and documentation index
- **[[Function Reference Cards Index]]** — All 22 TMAR functions documented
- **[[ClaudeSkills/ClaudeSkills]]** — Claude skill registry and TMAR engine project (Python automation, 8-prompts, GAS deployment)
- **`TMAR-Accrual-Ledger.html`** — The live control panel app (2.9 MB single-file HTML)

## Surfaces

| Surface | Role |
|---|---|
| GitHub Pages app | Central control hub — pulls/pushes to all remotes |
| TMAR Live workbook (`1k6J2s0x…WInQ`) | Organized record/log — sole read/write source of truth |
| FileCabinet (`Desktop/FileCabinet`) | Local document storage |
| YTubiversity Vaults | Where documents are born (lessons learned) |

## Architecture

See `.claude/docs/data-topology.md` for the full ledger data topology, join keys, and canonical-source-per-fact mapping.
