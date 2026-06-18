# Document Types (14)

Each type maps to required component blocks (letters from `component-library.md`), an output
**profile** (A = Cambria-admin, B = GPO white-paper, per `format-spec.md`), its **phase**, a
**media** size (R3), and any type-specific overlay. Components listed in render order. `J` (Jurat) /
`K` (Certification) appear only where sworn/certified execution is required.

> **v2.1.0 — Profile override:** the **Profile** column is informational. Per operator directive,
> all types render in **Profile B** (see `format-spec.md §Output profiles`). Remove the override there
> to restore type-driven A/B.
>
> **v2.1.0 — Media:** `Ltr` = Letter 8.5×11 (default, 24 lb bond). Use **Legal 8.5×14** only for
> court forms / recording filings (the UCC-1 and detinue exemplars in `references/examples/` are the
> legal-size corpus). Certificates/seals/cover pages → 32 lb/cover. A Petition (#12) may take Legal
> where the forum requires it — set per matter.

| # | Type | Profile | Phase | Media | Component order | Type overlay |
|---|---|---|---|---|---|---|
| 1 | Account Transfer Letter | A | 1 | Ltr | A,B,C,D,E,G,H,I,L,M | **Account # gated.** State from/to titling exactly (Weiss §5). |
| 2 | Affidavit | B | All | Ltr | A,B,F,G,I,**J** | Sworn. First-person-as-trustee, not personal. Numbered averments. |
| 3 | Notice; Praecipe | A | All | Ltr | A,B,C,D,F,G,H,I,L | Notice order: parties, act, effective date, response window (Weiss §5). |
| 4 | Declaration | B | All | Ltr | A,B,F,G,I,**K** | Penalty-of-perjury (K) in lieu of notarized Jurat. |
| 5 | Trustee Resolution | B | All | Ltr | A,B,F,G,I | Resolved-clauses as numbered items; recital mandatory. |
| 6 | Power of Attorney (Private Law) | B | All | Ltr | A,B,E,F,G,I,**J** | Grant scope explicit; capacity + governing law; notarize. |
| 7 | FOIA Request | A | 3 | Ltr | A,B,C,D,G,I,L,M | Cite 5 U.S.C. §552; request specificity; fee-waiver para if used. |
| 8 | Administrative Appeal | B | All | Ltr | A,B,C,D,F,G,H,I,L,M | Identify decision appealed + date; grounds as numbered items. |
| 9 | **Election Letter (Principal Assertion)** | B | 2 | Ltr | A,B,C,D,E,F,G,H,I,**J** | Core Phase-2 instrument; assert principal status; reserve rights. |
| 10 | Certification of Documents | A | All | Ltr | A,B,G,I,**K** | List certified items in G; K block; no Jurat unless required. |
| 11 | Cover Sheet / Transmittal | A | All | Ltr | A,B,C,D,G,I,M | Itemize enclosures (M); brief; no substantive demands. |
| 12 | Petition | B | All | Ltr* | A,B,C,F,G,H,I,**J** | Caption per forum; numbered paragraphs; prayer for relief. *Legal if forum requires. |
| 13 | Cease & Desist / Notice of Claim | A | All | Ltr | A,B,C,D,F,G,H,I,L | Demand specific conduct stop; deadline (figures); reservation (H). |
| 14 | Affidavit of Identity & Status | B | **5** | Ltr | A,B,F,G,I,**J** | **Foundational — draft first.** Anchors the identity stack; sworn. |

## Phase Reference

| Phase | Theme | Anchor types |
|---|---|---|
| 1 | Account positioning / transfers | 1, 11 |
| 2 | Principal assertion | 9 |
| 3 | Records / disclosure | 7 |
| 5 | Identity & status foundation | **14** (and 2, 6 as sworn supports) |
| All | Cross-phase instruments | 2,3,4,5,6,8,10,12,13 |

**Sequencing note:** Phase 5 type #14 is foundational and worth drafting early — it anchors every
later capacity line and recital. Phase 1 account types (#1) are gated on account numbers; collect
those before generating, or start with #14 while numbers are pending.

## Per-type guards (auto-check before emit)

- Every emitted document carries a **Doc-ID stamp (component N)** matched to the register (SKILL §7).
- Types **2, 4, 6, 9, 12, 14** require sworn/certified execution (`J` or `K`) — never omit.
- Types **1, 7, 13** are account/identifier-specific — apply the SKILL §0.5 account-number gate.
- Every type carries the **capacity line (I)** and, where the trust acts, the **authority recital (F)**.
- All types render **Profile B** (Times New Roman 12 pt, 1″, justified) under the v2.1.0 override.
