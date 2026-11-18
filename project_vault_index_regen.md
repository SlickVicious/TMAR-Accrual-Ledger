---
type: reference
status: planned
tags:
  - "#FileCabinet"
  - "#DevOps"
---

# project_vault_index_regen

Referenced in `.claude/docs/data-topology.md` (line 39) as a related FileCabinet rebuild project.

## Context

The TMAR data topology doc references this as a companion project for regenerating the vault index for the `FileCabinet` (the document registry at `C:\Users\rhyme\Desktop\FileCabinet`).

The `Document Registry` in the TMAR workbook indexes FileCabinet files by `DOC-NNNN` numbers. A vault index regen would rebuild that index to reflect the current state of the FileCabinet directory tree.

## Related

- **`.claude/docs/data-topology.md`** — Ledger data topology (cross-tab dependencies, join keys, canonical sources)
- **`TMAR-Accrual-Ledger.html`** — The live app (`VAULT_INDEX` constant for DFC vault tree)
- **`ClaudeSkills/vault-health-maintenance.md`** — Vault audit and cleanup skill (LDG vault)
