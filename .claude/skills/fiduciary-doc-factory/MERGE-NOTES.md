# Merge provenance

This directory is the **single combined** `fiduciary-doc-factory` skill, merged 2026-06-16 from two
fragments that were sitting in `Downloads/`:

| Fragment | Version | Role in merge |
|---|---|---|
| `fiduciary-doc-factory_1/fiduciary-doc-factory/` | **2.0.0** | Older fragment. Fully superseded. |
| `fiduciary-doc-factory-v2.1.0.zip` | **2.1.0** | Canonical. This tree is taken from it verbatim. |

## How the two were reconciled

- **Binaries are byte-identical** across both fragments — all `references/examples/*` and
  `references/source-books/*` (GPO Style Manual 2016, Weiss Concise Trustee Handbook) matched on diff,
  so no asset was lost by taking v2.1.0 as the base.
- **`CONTINUE_HERE.md` and `references/gpo-editorial-rules.md` were identical** in both fragments.
- **`SKILL.md`, `component-library.md`, `document-types.md`, `format-spec.md`,
  `weiss-fiduciary-standards.md`** all grew in v2.1.0. v2.1.0 is a strict superset of v2.0.0's
  substance, so the v2.1.0 copies are canonical here.
- The one place v2.0.0 carried content v2.1.0 "drops" is the **dual output-profile (Profile A Cambria
  for admin correspondence / Profile B GPO for filings)**. v2.1.0 did not lose this — it **deliberately
  overrode** it: the operator directive forces **Profile B for every document**. The A/B table is
  retained in `format-spec.md §Output profiles` and `SKILL.md §2` for reversibility. Nothing unique to
  v2.0.0 was discarded; it was folded in and superseded.

## TMAR integration

This skill is wired into `TMAR-Accrual-Ledger.html` (2026-06-16):
- `DOCUMENT_KNOWLEDGE.fiduciaryDocFactory` — distilled standard, injected into **every agent**
  through `buildFullSystemPrompt` (operative only when a document is being produced).
- `getSystemPrompt('doc_creation')` / `getSystemPrompt('doc_format')` — dedicated firm prompts that
  embody this skill (the Document Creation Firm and Document Format Firm).
- The **Document Creator** tab (`docCreatorSection`) renders/export under Profile B and surfaces an
  "active standard" indicator.
