---
name: fiduciary-doc-factory
version: 2.1.0
description: "Auto-loads whenever a document is requested in the private administrative / fiduciary context. Generates, curates, and revises trust and administrative documents under a fixed identity stack, GPO 2016 editorial style, and Weiss trustee-substance standards."
---

# fiduciary-doc-factory v2.1.0

Auto-loads for any document request in the **private administrative / fiduciary context**.
This file is the orchestrator. Heavy rules live in `references/` and load **only when the
active task touches them** (progressive disclosure) — keep this file in context, pull the rest on demand.

> **v2.1.0 changes:** R1 page economy · R2 serial/Doc-ID matched to the live register · R3 paper
> size/weight per type · Weiss substance hardened · **single output profile forced to B (GPO-Times)**
> · letterhead component scaffolded (assets pending). All v2.0.0 invariants preserved. See §6 changelog.

## 0. Pre-flight gate (run before emitting ANY document)

1. **Identify document type** → look up its row in `references/document-types.md`.
2. **Resolve / mint Doc-ID** → register scheme `DOC-NNNN` (§7). Stamp upper-left (component **N**).
   If the matter has no row yet, **mint next `DOC-(max+1)` and write the row back** to the register.
   Never reuse or placeholder an ID.
3. **Resolve identity level** (Trust / Living Man / Co-Trustee) → `references/format-spec.md §Identity`.
4. **Select media** (R3) → `references/document-types.md` Media column. Default **Letter 8.5×11**;
   **Legal 8.5×14** only for court forms / recording filings. Surface size + weight in output (§8).
5. **Account-number check** — if the type is account-specific (transfer, retitle, closure),
   require every referenced account number first. Do **not** invent or placeholder them.
   Missing → ask, list exactly which are missing, stop.
6. **Apply editorial pass** → `references/gpo-editorial-rules.md` (caps, numerals, serial comma,
   abbreviations, italic, signature indentation).
7. **Apply fiduciary-substance pass** → `references/weiss-fiduciary-standards.md`
   (capacity line, qualified non-personal signature, due-notice, reservation of rights, no individual liability).
8. **Render** using `references/component-library.md` blocks in the type's required order, **Profile B** (§2).
9. **Page-fit pass** (R1) — last step: tighten widows/orphans, let signature/Jurat share the final
   content page, suppress single-line spillover. → `format-spec.md §Page economy`.

## 1. Identity stack (default profile — edit values, keep structure)

| Level | Use when | Signature capacity line |
|---|---|---|
| **Trust (entity)** | Acting for/as the trust | `A Provident Private Creditor Revocable Living Trust` |
| **Living Man** | Asserting status / principal | per Affidavit of Identity & Status (Phase 5) |
| **Co-Trustee** | Joint fiduciary act | `[Name], as Co-Trustee and not individually` |

Default trust record (instance data, not law): EIN displayed masked `**-***9588`;
governing law **N.C.G.S. Ch. 36C**; mailing address per current workbook value. Full EIN
appears **only** where a form legally compels it.

## 2. Non-negotiable format invariants

- **No color, no cell/shading fills, no highlight** — black on white only.
- **Masked EIN** in body/letterhead; unmasked only in compelled fields.
- **Executive spacing** (defined numerically in `references/format-spec.md`).
- **Single output profile: B (GPO — Times New Roman 12 pt, 1″ margins, justified).**
  > **OPERATOR OVERRIDE (v2.1.0):** profile is no longer type-driven. The v1 *Cambria-for-admin*
  > invariant (Profile A) is **deliberately overridden** by operator directive — every document,
  > including administrative correspondence, renders in Profile B. Surfaced per §5 "conflict is
  > surfaced." To revert to dual A/B, remove this override here and in `format-spec.md §Output profiles`.

## 3. Document library (14 types)

Full structures, required components, phase, per-type overlays, and the **Media** column (R3):
**`references/document-types.md`**. Phase Reference table also lives there; **Phase 5 (Affidavit of
Identity & Status, #14)** is foundational — draft early; it anchors the stack. The Weiss sample-form
catalogue (banking package, assignments, notes, minutes, etc.) is a candidate-extension list in
`weiss-fiduciary-standards.md` — **reference only, not yet first-class generators.**

## 4. Reference index (load on demand)

| File | Load when |
|---|---|
| `references/format-spec.md` | every document (identity, profile, spacing, margins, masking, **page economy**) |
| `references/gpo-editorial-rules.md` | drafting/revising prose — the editorial pass |
| `references/weiss-fiduciary-standards.md` | any trustee act, signature, notice, accounting, **banking package** |
| `references/component-library.md` | assembling blocks (**letterhead**, **Doc-ID stamp N**, notice, trust-ID, Jurat, CC) |
| `references/document-types.md` | identifying type + its required component order + **Media** |

## 5. Operating rules

- **Preserve, then layer.** Never drop a v1 invariant to satisfy a style rule; if GPO and a v1
  invariant conflict, the invariant wins **unless an operator override is recorded** (see §2 font),
  and the conflict is surfaced to the operator.
- **No fabricated authority.** GPO rules carry chapter pointers; Weiss items cite handbook sections
  (handbook now in `references/source-books/`; `[verify: Weiss]` tags drop as items are confirmed).
- **Volatile state stays out of the skill.** Account numbers, vendor lists, per-matter facts, and the
  register's spreadsheet ID are intake/config — never hardcoded as authority here.
- **Doc-ID write-back is mandatory.** A document is not "done" until its `DOC-NNNN` exists in the
  register and matches the upper-left stamp (§7).
- **Media is surfaced, never buried.** State size + weight in the output preamble for every emitted doc.
- **Revision mode** = same passes applied to existing text; output a tight diff, not a full rewrite,
  unless structure changed.

## 6. Changelog

- **2.1.0** — R1 page economy + page-fit gate step · R2 `DOC-NNNN` resolve/mint/write-back + component
  **N** upper-left stamp · R3 per-type Media (Letter default / Legal for court·recording) + weight notes ·
  Weiss hardened (qualified non-personal signature, two-part due-notice, banking doc set, sample-form
  catalogue) · **font forced to Profile B (override of v1 Cambria-admin invariant)** · letterhead
  component scaffolded (asset slots pending) · examples kept reference-only.
- **2.0.0** — pre-flight gate, 3-level identity stack, dual-profile, account-number gate, GPO Ch.16 sig geometry.

## 7. Register binding (R2) — instance config

- **Scheme:** `DOC-NNNN`, 4-digit zero-padded, sequential, monotonic. *(Supersedes the handoff's
  proposed `APPC-<TYPE>-<YYYY>-<NNN>` — the live register uses `DOC-NNNN`; match reality.)*
- **Canonical register:** TMAR Live workbook, sheet ID `1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ`,
  tab **`Document Registry`** (live; columns: `A Doc ID · B Document Name · C Document Type · …`). *(The APPC_RLT hub `1Ac5A…` was folded into Live 2026-06-27; the registry now lives in the Live book — the bound minter targets this tab via `getRegistrySheet_()`.)*
- **Mint:** next ID = `DOC-` + zeropad4(max(existing)+1). Append row {Doc ID, Document Name, Document Type, …}.
  A bound Apps Script minter (`mintDocId(name,type)` / `nextDocId()`) implements this against the workbook.
- **Stamp:** upper-left, above/beside letterhead (component **N**), value == register row Doc ID.

## 8. Media defaults (R3) — operator-confirmable

| Class | Size | Stock |
|---|---|---|
| Standard correspondence / notices / affidavits / certificates | **Letter 8.5×11** | 24 lb bond (executed originals) |
| Court forms · recording filings (UCC-1, detinue — see `references/examples/`) | **Legal 8.5×14** | 24 lb bond |
| Certificates · seals · cover/title pages | Letter | **32 lb / cover** |
