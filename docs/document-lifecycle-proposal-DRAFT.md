# Document Lifecycle & Naming Convention — PRELIMINARY DRAFT

**Status: placeholder, not a final design.** Written 2026-08-02 from a handful of examples
surfaced mid-FileCabinet-audit. The user explicitly asked that this be revisited only after a
full critical re-evaluation of the project's entire dev timeline — the workbook's tabs/scripts,
the GUI app and its sub-GUIs, and the FileCabinet — not designed from these examples alone.
See memory: `project_smart_consolidation_initiative`, `feedback_full_context_before_consolidation`.

## The problem, restated

The Document Registry (and the FileCabinet folder structure it indexes) tracks **files**. What
actually exists on disk, at least in the FCRA-dispute/demand-letter workflows, is **communication
threads** — a sequence of linked artifacts representing stages of one case against one MR-account:

```
Draft  →  Executed/Sent  →  Mailing Proof (tracking #)  →  Response Received  →  [Escalation]
```

Right now that structure is implicit and only recoverable by a human reading file paths, content,
and context clues to connect the dots. A single DOC-ID gets reused loosely across a draft and its
executed version; the mailing proof and the response typically get no DOC-ID at all. The registry
has no field for "this is stage 2 of case X" or "this document is about MR-114."

## Confirmed examples (verified, not assumed)

**First PREMIER Bank / MR-114** (`06-Account-Register/First_PREMIER_Bank/`):
- `Drafts/DOC-0031_First_PREMIER_Bank.txt` — draft, blank `Article No.:` placeholder for the
  certified-mail tracking number. References Account No. `517800684216****`, which matches
  MR-114's real account number (confirmed via Creditor Registry T-003).
- `Correspondance/DOC-0031_First_PREMIER_Bank.docx` — same DOC-ID, executed version.
- Mailing proof exists as an unlabeled photo in a batch of 6 certified-mail receipts
  (`00-Receipts-Invoices/Postal/PS Form-3800/...`), tracking number last-4 identified by the user
  as 0217 — no DOC-ID, no structural link to DOC-0031.
- `Correspondance/First Premier Bank RoA response letter.pdf` — the received response — no DOC-ID.
- Also present in the same folder: `Demand_for_Preservation_of_Records_First_PREMIER.docx`,
  `Notice_of_Default_Second_Demand_First_PREMIER.docx`, `Drafts/AFFIDAVIT_OF_NON-RESPONSE.docx`,
  `Drafts/NOTARY_PRESENTMENT.docx` (+ HTML variants) — a full escalation ladder beyond the two
  documents originally flagged, confirming this is a real multi-stage legal process, not a
  one-off exchange.

**Perkins Loan / MR-138** (`06-Account-Register/US_Department_of_Education/Perkins_Loan_Disputes/`):
- 4 freshly-drafted FCRA dispute letters (Furnisher/Dept of Ed, TransUnion, Equifax, Experian),
  created 2026-08-01, no DOC-ID assigned yet — drafted the same day MR-138 (Perkins Loan) was
  corrected in Master Register, evidently in direct response to that finding. The source credit
  report that surfaced this account isn't yet in the Document Registry either.

## What a real solution would need to account for (not designed here)

- A naming/ID scheme that can represent a *thread* (multiple linked artifacts, ordered by stage),
  not just an individual file.
- MR-account linkage as a structural field on the registry entry, not something inferred from
  reading the document body.
- Proof-of-Mailing integration — tracking numbers need to be a first-class link to the document
  they proved delivery for, not free-floating images requiring manual cross-reference.
- Forward-looking capture: functions/tooling that log a document's stage and thread membership
  *at creation time*, so this relationship doesn't need archaeological reconstruction every time
  (the way it just did for First PREMIER and Perkins).
- How this interacts with the DOC-ID scoping question raised separately (reference material,
  blank templates, and example/draft files possibly shouldn't get DOC-IDs at all, or should be
  tracked in a visibly different category from real entity records/filings/proofs).

## Explicitly out of scope for this draft

- Any actual schema, column layout, or GAS function implementation.
- A migration plan for the ~1,600+ documents (pre-today's-scan) or ~1,508 documents (today's scan)
  already in the registry without this structure.
- How this maps onto the workbook's tab structure or the GUI's document-creation flows — those are
  the other two branches of the broader consolidation initiative and haven't been reviewed yet.

## Next step

Revisit once the workbook (tabs + GAS scripts/functions) and the GUI (sub-GUIs, document-creation
paths) have had the same audit treatment the FileCabinet just got. Until then, this file is a
placeholder — a record that the pattern was found and confirmed, not a spec to build against.
