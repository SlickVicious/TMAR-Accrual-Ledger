# CONTINUE_HERE — fiduciary-doc-factory dev handoff

**Purpose:** resume skill development cold in a new chat. Everything needed is in this folder.
**Status:** v2.0.0 shipped. v2.1.0 pending (3 new rules + Weiss substance upgrade, below).

---

## 1. What exists now (v2.0.0 — done)

```
fiduciary-doc-factory/
├── SKILL.md                         orchestrator: pre-flight gate, identity stack, invariants, refs index
├── CONTINUE_HERE.md                 this file
└── references/
    ├── gpo-editorial-rules.md       GPO 2016 editorial layer (caps, numerals, serial comma, abbr, italic, Ch.16 sigs)
    ├── weiss-fiduciary-standards.md  trustee substance (capacity, duties, recital, reservation) — UPGRADE PENDING
    ├── format-spec.md               identity, dual font profiles (A Cambria / B GPO-Times), spacing, masking, conflict order
    ├── component-library.md         blocks A–M (letterhead → enclosures)
    ├── document-types.md            14 types → component order + profile + phase + guards
    ├── source-books/                NEW — grounding PDFs (read on demand, do not bulk-load)
    │   ├── GPO-STYLEMANUAL-2016.pdf
    │   └── Weiss_Concise_Trustee_Handbook-_Carlton_Weiss.pdf
    └── examples/                    NEW — real exemplars informing the pending rules
        ├── AFFIDAVIT_OF_NON-RESPONSE_Template.docx
        ├── APPC_RLT_Retitling_Package_v2.docx
        ├── NOTICEOFACCEPTANCEtemplate.docx
        ├── Wimberly_Authentication_Package.docx
        ├── WARRANT_IN_DETINUE_TEMPLATE.pdf   (VA DC-404, small claims — legal-paper exemplar)
        └── UCC1_Template.pdf                  (trust-as-secured-party collateral language)
```

Core invariants already locked: no color/fill, masked EIN `**-***9588`, executive spacing, dual
font profile, 3-level identity stack, account-number gate, GPO Ch.16 signature geometry.

---

## 2. NEW requirements from this session (build into v2.1.0)

### R1 — Economical page layout
Documents must maximize content per printed page (reduce orphan pages / wasted trailing space).
Action: add a "page economy" rule to `format-spec.md` — tighten widow/orphan control, allow
signature/Jurat to share the last content page where possible, set sensible min space-before on
blocks so a single line doesn't spill to a new sheet. Add to the pre-flight gate a "page-fit pass."

### R2 — Serial number, upper-left, matching workbook Doc ID
Every document carries a **serial/Doc ID in the upper-left corner** that matches the record ID in
the tracking workbook/sheet. **If no ID exists yet, create one and write it back** to the workbook.
Action:
- Add component **N. Serial/Doc-ID stamp** (upper-left, above or beside letterhead) to `component-library.md`.
- Define an ID scheme (propose: `APPC-<TYPE>-<YYYY>-<NNN>`, e.g. `APPC-AFNR-2026-014`) — confirm with SLiCK.
- Add to pre-flight gate step: "resolve or mint Doc ID, ensure it matches/append to workbook."
- This ties to the iris/TMAR workbook tracking pattern already in SLiCK's ecosystem — locate the
  governing sheet (Google Drive / local) before minting, per his Script-Salad-style write-back habit.

### R3 — Paper size + weight awareness
Agent must decide **letter (8.5×11) vs legal (8.5×14)** per document, and suggest **paper weight**
when applicable. Legal exemplar in corpus: `examples/WARRANT_IN_DETINUE_TEMPLATE.pdf` (court form).
Action: add a "media spec" line to each row of `document-types.md` (default Letter; court/recording
filings that expect legal → Legal) and a weight note (e.g., 24 lb bond for executed originals,
32 lb / cover for certificates & seals). Surface the choice in output, don't bury it.

---

## 3. Weiss substance UPGRADE (now fully in-context — bank it into weiss-fiduciary-standards.md)

The handbook is now a source file; key specifics to harden the substance layer (currently marked
`[verify: Weiss]` — these are now verifiable and can drop the tag):

- **Qualified signature forms (liability limitation).** Weiss "Limiting Liability & Risk" gives
  accepted forms, e.g. `"[Name] as Trustee and not personally"`, `"As Trustee but not personally"`,
  `"Without recourse to Trustee"`, and the long form citing the declaration date. Mere title alone is
  **insufficient** on debt instruments — must expressly state non-personal capacity. Update component **I**.
- **Due-notice rule (two parts).** (1) Disclose trust nature on all letterhead/cards/checks/orders
  via a designation like `"Express Trust Organization"` / `"organized under Declaration of Trust"`;
  (2) stipulate in every written contract that the **trust only** is liable, not trustee/interest-holders.
  Add as a substance rule + a letterhead designation option in component **A**.
- **Banking doc set** (non-interest-bearing account): Letter of Authorization (notarized), Certificate
  of Trust, Trustee Appointment, settlor acknowledgment/Letter of Introduction, first+signature pages
  of declaration, SS-4 only if EIN needed. → feeds a new Phase-1 "Banking package" doc bundle.
- **Sample-form catalogue** (Weiss pp. 45+): Asset Sale Agreement, Assignment (Bank/Copyright/Wages),
  Authorized Rep contract + Introduction, Bill of Sale, Bonds (basic/indemnity), Independent
  Contractor Agmt, Limited POA, Management Agmt, Minutes (annual/notice/real-estate/revocation),
  Non-Recourse Note, Notice of Assignment, Notice of Private Sale, Offer to Buy Auto, Proposal to
  Exchange. → candidates to extend the 14-type library; map each to components + profile when added.

Caveat to preserve: Weiss reflects a **common-law / sovereignty trust theory**. Keep the skill's
job = format + structure + fiduciary signature hygiene. Do **not** assert its legal/tax conclusions
as settled law in generated documents; SLiCK directs substantive positions.

---

## 4. Open decisions (ask SLiCK at resume)

1. **Doc-ID scheme** — confirm `APPC-<TYPE>-<YYYY>-<NNN>` and the canonical tracking workbook/sheet location.
2. **Default media** — Letter as global default, Legal only for court/recording filings? Confirm weight defaults.
3. **Font reconciliation** — keep type-driven A/B default, or force one profile?
4. **Examples → templates** — promote any of the 6 exemplars into first-class generators now, or keep as reference only?

---

## 5. Resume prompt (paste into new chat)

> Continue developing the `fiduciary-doc-factory` skill. Read `CONTINUE_HERE.md` and the
> `references/` files in the uploaded package. Implement v2.1.0: (R1) economical page layout,
> (R2) upper-left serial/Doc-ID matched to the tracking workbook (mint if absent), (R3) paper
> size/weight awareness per document type. Also upgrade `weiss-fiduciary-standards.md` with the
> qualified-signature forms, two-part due-notice rule, and banking doc set now that the handbook
> is a source file. Preserve all v2.0.0 invariants. Confirm the 4 open decisions before finalizing.
