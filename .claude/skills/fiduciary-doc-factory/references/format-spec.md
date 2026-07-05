# Format Spec

Deterministic format backbone. Loaded for every document. Format **invariants** here outrank the
GPO editorial layer when they conflict (and the conflict is surfaced to the operator).

## Identity (3-level stack)

| Level | Selector | Body reference | Signature capacity line |
|---|---|---|---|
| Trust (entity) | acting for/as trust | `the Trust` (defined short form) | `A Provident Private Creditor Revocable Living Trust, by [Name], Trustee` |
| Living Man | status / principal assertion | per Phase 5 affidavit | per Phase 5 affidavit |
| Co-Trustee | joint act | named party | `[Name], as Co-Trustee and not individually` |

**EIN masking:** display `**-***9588` everywhere except a form field that legally compels the full
number. Never put the unmasked EIN in letterhead, body prose, or a CC line.

**Governing law:** `N.C.G.S. Ch. 36C` (North Carolina Uniform Trust Code).

**Address:** pull the current value from the active workbook at render time — do not hardcode;
address has a pending update and must not drift.

## Output profiles (the one font decision)

| | **Profile A — Cambria-admin** (default for correspondence) | **Profile B — GPO white-paper** (petitions, white papers, declarations for filing) |
|---|---|---|
| Body face | **Cambria** | **Times New Roman** |
| Body size | 11–12 pt | **12 pt (identifier-led paragraph text: 10 pt — see two-tier directive below)** |
| Margins | 1″ | **1″ all sides** |
| Alignment | left (ragged right) | **justified** |
| Line spacing | executive (below) | 1.5 or double per court/agency rule |
| Selection rule | account letters, notices, transmittals, cover sheets | affidavits/declarations for filing, petitions, FOIA, appeals, white papers |

> **OPERATOR DIRECTIVE (2026-07-04) — two-tier type within Profile B.** Structural identifiers
> keep **12 pt**; the paragraph text that follows an identifier is set at **10 pt**. An identifier
> is the leading token of a block: a type label — "Article", "Section", "Schedule", "Exhibit",
> "Appendix", "Part", "Clause", "Type" — together with its numeral or letter, or an enumerator —
> "(a)", "1.", "IV.", "A.". Centered headings and paragraphs not led by an identifier are
> unaffected (12 pt). In the TMAR Document Creator this is enforced by `fdfTwoTierType()`
> (applied by the ⚖ Fiduciary Standard button and automatically on Word/Print export).

> **OPERATOR OVERRIDE (v2.1.0) — forced Profile B.** The type-driven A/B selection below is
> **overridden by operator directive**: every document renders in **Profile B (Times New Roman
> 12 pt, 1″, justified)**, including administrative correspondence that v1 set to Cambria (Profile A).
> The table is retained for reference and reversibility. To revert to type-driven selection, remove
> this override (and the matching note in `SKILL.md §2`). When B is forced, `document-types.md` Profile
> column is informational only.

Default (pre-override) is **type-driven**: the document-type table assigns A or B; operator may
override per matter. This reconciled the v1 Cambria invariant with the documented GPO Times-New-Roman
white-paper standard without discarding either.

## Executive spacing (numeric)

- Letterhead block → 24 pt space-after, then a 0.75 pt rule (black), then 12 pt before dateline.
- Dateline → 12 pt before, 24 pt after.
- Body paragraphs → 0 first-line indent in Profile A (block style), 6 pt space-after;
  Profile B uses a 0.5″ first-line indent, 0 space-after.
- Numbered items → hanging indent 0.3″, 6 pt between items.
- Signature/Jurat → 36 pt before the signature line.

## Page economy (v2.1.0 — final pass before output)

Maximize content per printed sheet; eliminate orphan pages and single-line spillover.

- **Widow/orphan control:** keep-with-next on headings; never strand a lone final line on a fresh
  sheet; keep ≥ 2 lines of any paragraph together.
- **Signature/Jurat sharing:** the signature block and Jurat **may share the last content page** with
  preceding body where they fit; force them to a new sheet only if the body genuinely fills the page.
- **Block space-before minimums:** set so a single heading or line cannot trigger a new sheet.
- **Pass placement:** runs as the **last gate step** (SKILL §0.9), after render, before output.
- Subordinate to the format invariants — never shrink margins below 1″ or alter Profile B type size
  to win a page; tighten spacing/keeps only.

## Media (size & weight) — R3

Size and stock are assigned per document type in `document-types.md` (Media column) and summarized in
`SKILL.md §8`. Default **Letter 8.5×11 / 24 lb bond**; **Legal 8.5×14** for court forms and recording
filings (e.g., the UCC-1 and detinue exemplars in `references/examples/`); **32 lb/cover** for
certificates, seals, and cover pages. Surface the choice in the output preamble.

## Signature / Jurat geometry (GPO Ch. 16 mapped to print)

- GPO: *signatures indented in multiples of 2 ems; addresses flush left.*
- Map: signature block reached by a **left indent of 3.0″** (places it right-of-center),
  capacity line directly beneath the name, no underline rule longer than the longest name line.
- Jurat sits flush left beneath the signature, with notary/witness lines as applicable.
- Addresses (recipient block, CC addresses) **flush left**.

## Color / fill / emphasis

- Black text on white only. **No** shading, **no** highlight, **no** colored rules or borders.
- Emphasis by *italic* (sparingly, per GPO Ch. 11) or **bold** for defined terms on first use only.
- Tables: single black hairline grid, no fills, header row bold not shaded.
- **Letterhead mark (component A):** any device/seal must be **mono / line-art** to honor this
  invariant. A full-color crest is non-conforming unless the operator records a color override.

## Conflict resolution order

1. Legal/agency form requirement (compelled field) →
2. Format invariant (this file) →
3. Fiduciary-substance rule (Weiss layer) →
4. GPO editorial rule.

Higher number yields to lower; any yield is noted to the operator in a one-line flag.
