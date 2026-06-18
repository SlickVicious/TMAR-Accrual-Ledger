# GPO Editorial Rules (Style Manual, 2016)

Editorial pass applied to all prose. Chapter pointers are to the **GPO Style Manual, 2016**
(current edition; free text at govinfo.gov/gpo-style-manual). This layer governs *word and type
treatment*; it does **not** override the format invariants in `format-spec.md`.

## Capitalization (Ch. 3–4)

- Capitalize full official names; lowercase shortened/generic references.
  - `the Internal Revenue Service` → later `the Service`; `the Trust` (this instrument) capitalized
    as a defined short form; generic "a trust" lowercase.
- **Federal / State / Government** are capitalized when used as proper-noun equivalents in the
  Federal context (`Federal`, `State`, `the Government`); adjectival generic uses lowercase
  (`congressional`, `governmental`).
- Titles capitalized when preceding a name or standing for the specific officeholder:
  `Trustee`, `Co-Trustee`, `Settlor`, `Beneficiary` are capitalized as defined parties of the Trust.
- Acts/forms by full title capitalized: `Form 56`, `the Internal Revenue Code`.

## Punctuation (Ch. 8)

- **Serial (Oxford) comma is mandatory** (§8.42): `notice, demand, and reservation`.
- One space after terminal punctuation.
- Em dash — no surrounding spaces in GPO body; the skill's executive spacing may set a thin space —
  follow `format-spec.md` if it conflicts.
- Possessive of singular ending in s: add `'s` per GPO unless awkward.

## Abbreviation & letter symbols (Ch. 9)

- Drop internal periods in all-cap initialisms: `USPS`, `IRS`, `SSA`, `EIN`, `USDA` — **not** `U.S.D.A.`
- `U.S.` keeps periods as an adjective; spell out `United States` as a noun.
- Do **not** abbreviate `Figure`, `Section` headers, or month names in formal body text
  (`Figure 5`, not `Fig. 5`).
- State names spelled out in body; postal 2-letter only in the address block.

## Italic (Ch. 11)

- Italicize case names (`Smith v. Jones`) and the signal words `supra`, `infra`, `id.`
- Common Latin in general use is **roman**, not italic: `e.g.`, `i.e.`, `et al.`, `pro se`,
  `affidavit`, `jurat` — set these upright.
- Italicize a word referred to as a word, and statutory short titles only where the source italicizes.

## Numerals (Ch. 12)

- Spell out **one through nine**; figures for **10 and up** — but **be consistent within a category**
  in one sentence (if any in a series is ≥10, use figures for all).
- Always figures for: money (`$1,250.00`), dates, ages, percentages (`5 percent` — word "percent"
  in body, `%` in tables), section/clause numbers (`section 7`), account/EIN/case numbers.
- A sentence does not begin with a figure — recast or spell out.
- Money: cents shown with `.00` in formal demands; ranges `$500 to $1,000` (not `$500–1,000`).

## Datelines, addresses, signatures (Ch. 16) — high-value for fiduciary docs

- **Dateline**: spelled-out month, e.g., `June 4, 2026`. Place top-right or above the body per the
  component's spec.
- **Addresses set flush left.**
- **Datelines and signatures are indented in multiples of 2 ems** (GPO). In the skill's DOCX/print
  output this maps to a right-side signature block reached by a left indent (≈0.5″ per 2-em step);
  encode the exact measure in `format-spec.md`. This rule drives the Signature/Jurat block geometry.
- Signature line shows name, then capacity line on the next line (see Weiss capacity standard).

## Headings, contents, outlines (Ch. 15)

- Numbered items: GPO outline order is `I. → A. → 1. → a.`; keep one scheme per document.
- Front-matter page numbers (if any) lowercase Roman; body Arabic.

## Editorial QA checklist (run on every draft + every revision)

- [ ] Serial commas present in every list
- [ ] Initialisms period-free (`IRS`, `USPS`, `SSA`)
- [ ] Numbers follow 1–9 spelled / 10+ figures, money & legal numbers always figures
- [ ] Case names + `supra`/`infra`/`id.` italic; `e.g./i.e./et al./pro se` roman
- [ ] Defined parties (`Trustee`, `the Trust`) capitalized consistently
- [ ] No sentence starts with a figure
- [ ] Dateline = spelled-out month; addresses flush left; signature indented per Ch. 16
- [ ] `U.S.` (adj.) vs. `United States` (noun) correct
