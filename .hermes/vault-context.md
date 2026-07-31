# TMAR Vault — Hermes Context

> Auto-loaded when Hermes Console opens a terminal from this Obsidian vault.

## What This Vault Is

This is the **Trust Master Account Register development vault** — not a content vault like the YTubiversity vaults (Huey Hardy, Eeon, etc.). It contains the source code, documentation, and configuration for the TMAR ecosystem:

- **TMAR-Accrual-Ledger.html** — single-file browser app (~3.7 MB, 246 functions, 25 agents)
- **gas/** — Google Apps Script backend (20 .gs files, clasp-managed)
- **Google Sheet** `1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ` — system of record (~52 tabs)
- **FileCabinet** `C:\Users\rhyme\Desktop\FileCabinet\` — document repository

## When You're Here

You are in a **development** context. The user may ask you to:
- Read/modify GAS files (in `gas/`)
- Read/modify the HTML app
- Run scripts (in `scripts/`)
- Navigate the docs (in `docs/`, `GSheet/`, `.claude/docs/`)
- Cross-reference against the Google Sheet or FileCabinet

## Key Files to Load First

1. [[VaultIndex]] — master ecosystem map (surfaces, endpoints, scripts, cross-references)
2. [[CLAUDE]] — Claude Code instructions and repo conventions
3. [[README]] — full project overview
4. `.claude/docs/data-topology.md` — join keys and data relationships
5. `GSheet/README.md` — sheet structure and GAS functions

## Vault Standards

This vault mirrors the YTubiversity vault standards:
- **Theme:** Cobalt Peacock · **Font:** Rubik 17px · **Accent:** `#6946b9`
- **Plugins:** 21 community plugins (see `.obsidian/community-plugins.json`)
- **Homepage:** VaultIndex.md
- **New files:** `_new/` · **Attachments:** `_attachments/`

## Hermes Console Config

- **shellPath:** `C:\Windows\System32\wsl.exe`
- **startupCommand:** `/home/devcontainers/.local/bin/hermes` (full path required)
- **Profile:** `law` (legal/fiduciary persona)
- **Context bridge:** Enabled — pushes active file + selection

## Connected Surfaces

When the user references these, resolve automatically:
- **Google Sheet:** `1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ` (via GAS Web App)
- **GAS Web App:** `https://script.google.com/macros/s/AKfycbzpeegvE52lvqCTMyKrsdaa_4JFfjM6MQrsJkU8zb17fkUJzPRasUU0fjONdaHkM5dh/exec`
- **GAS API Key:** `TMAR_API_KEY` Script Property (set in Apps Script editor)
- **Live App:** `https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html`
- **Local Dev:** `http://localhost:5501/TMAR-Accrual-Ledger.html`
- **FileCabinet:** `C:\Users\rhyme\Desktop\FileCabinet\`
