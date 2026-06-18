# Component Library

Reusable blocks. Each embeds the GPO editorial + Weiss substance + format invariants already.
Assemble in the order the document type specifies (`document-types.md`). `[ ]` = fill at render.

## N. Serial / Doc-ID stamp  (R2 — required on every emitted document)

```
DOC-NNNN                      ← upper-left, top of page 1, above/left of letterhead
```
- 4-digit zero-padded, plain text, Profile B face, **no box/fill**.
- Value **must equal** the matter's row in the register (`SKILL.md §7`). If absent → mint
  `DOC-(max+1)`, write the row back, then stamp. Revisions keep the same ID (track version in the
  register's status/notes column, not the ID).

## A. Letterhead

```
DOC-NNNN
{{MARK}}                                      ← optional mark/seal slot (mono line-art; ≤ 1.0" tall)
A PROVIDENT PRIVATE CREDITOR REVOCABLE LIVING TRUST
{{TAGLINE}}                                   ← e.g. "Express Trust Organization — organized under Declaration of Trust"
EIN **-***9588   ·   N.C.G.S. Ch. 36C
[current mailing address — flush left, from workbook]
────────────────────────────────────────────  (0.75 pt black rule)
```
- Trust name in caps (defined entity). EIN masked. Doc-ID stamp (N) sits above the mark.
- **Asset slots pending operator graphics.** Until a conforming mark is supplied, render the
  **text-only fallback** (omit `{{MARK}}`). Do not invent a mark.
- **`{{MARK}}` must be mono / line-art** to honor the no-color invariant (`format-spec.md`).
  A full-color family crest is **non-conforming** unless the operator records a color override.
- **`{{TAGLINE}}` (Weiss due-notice, part 1):** a designation disclosing trust nature —
  `Express Trust Organization` / `organized under Declaration of Trust`.

## B. Dateline
```
[Month D, YYYY]          ← spelled-out month (GPO Ch. 12/16)
```

## C. Recipient address block (flush left, GPO Ch. 16)
```
[Recipient full legal name]
[Title / Department]
[Agency or company]
[Street]
[City], [ST]  [ZIP]
```

## D. Re-line
```
Re:  [Concise subject].  Account No. [number]  (omit line if no account; never placeholder)
```

## E. Trust-ID block (when the trust must self-identify in body)
```
The undersigned acts for A Provident Private Creditor Revocable Living Trust (the "Trust"),
a revocable living trust organized under the laws of North Carolina, N.C.G.S. Ch. 36C,
EIN **-***9588, by its Trustee.
```

## F. Authority recital (Weiss §3 — opens most instruments)
```
Pursuant to the powers vested in the Trustee under that certain A Provident Private Creditor
Revocable Living Trust and the North Carolina Uniform Trust Code, N.C.G.S. Ch. 36C, the
undersigned Trustee acts as follows:
```

## G. Numbered items (GPO outline order; hanging indent per format-spec)
```
1.  [First item — serial commas, figures for legal numbers.]
2.  [Second item.]
    a.  [Sub-item if needed.]
```

## H. Reservation of rights (Weiss §4 — closes demands/notices)
```
Nothing herein waives, releases, or limits any right, remedy, or defense of the Trust or its
Trustee, all of which are expressly reserved.
```

## I. Signature block (capacity line mandatory — Weiss §1; geometry — format-spec)
```
                              (left-indent 3.0")
                              _______________________________
                              [Name]
                              as Trustee and not individually
                              A Provident Private Creditor Revocable Living Trust
```
- Co-Trustee variant: `as Co-Trustee and not individually`.
- **On debt / contract instruments**, a bare title is insufficient — use a qualified non-personal
  form per Weiss §1 (`as Trustee and not personally`, `without recourse to Trustee`, etc.).

## J. Jurat (flush left beneath signature; "jurat" set roman, GPO Ch. 11)
```
State of North Carolina   )
                          )  ss.
County of [Lenoir]        )

Subscribed and sworn to (or affirmed) before me this ___ day of __________, 20__.

_______________________________
Notary Public
My commission expires: __________
```
- Use only where the type requires sworn execution (affidavits, declarations, some notices).

## K. Certification block (for Certification of Documents)
```
I certify under penalty of perjury under the laws of the United States and the State of North
Carolina that the foregoing is true and correct to the best of my knowledge.
```
- "penalty of perjury" language; spell out `United States` (noun) per GPO Ch. 9.

## L. CC / distribution block (flush left, addresses GPO Ch. 16)
```
cc:  [Name / entity] (no EIN, no account numbers in cc line)
     [Name / entity]
```

## M. Enclosures
```
Enclosures:  (1) [item];  (2) [item].
```
