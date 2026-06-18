# Weiss Trustee-Substance Standards

Substance layer applied to any trustee act, signature, notice, or accounting. Principles below are
standard fiduciary doctrine consistent with the **Weiss Concise Trustee Handbook** (now a source file
in `references/source-books/`). These rules govern *what the document must say to be fiduciary-sound* —
they sit on top of the GPO editorial layer.

> **Caveat (preserve in skill, not in output):** Weiss reflects a common-law / sovereignty trust
> theory. This skill's job is **format + structure + fiduciary signature hygiene** only. Do **not**
> assert Weiss's legal/tax conclusions as settled law in generated documents; the operator directs
> substantive positions.

## 1. Capacity — every signature states it

- A trustee signs **in capacity, never personally**:
  `[Name], as Trustee and not individually` (or `as Co-Trustee and not individually`).
- Acts for the trust recite the trust as the principal:
  `A Provident Private Creditor Revocable Living Trust, by [Name], Trustee`.
- **Qualified non-personal signature (liability limitation).** On debt or contract instruments a
  bare title is **insufficient**; the signature must expressly disclaim personal capacity. Accepted forms:
  - `[Name], as Trustee and not personally`
  - `As Trustee but not personally`
  - `Without recourse to Trustee`
  - Long form citing the Declaration date.
- Never sign a trust instrument or demand with a bare personal signature; bare signatures invite
  personal-liability and capacity-waiver arguments.

## 2. Core duties to keep documents consistent with

| Duty | Drafting consequence |
|---|---|
| **Loyalty** | No self-dealing language; acts framed as for the trust/beneficiaries, not the trustee. |
| **Prudence** | Demands/transfers reference reasonable basis; avoid overreaching claims. |
| **Impartiality** | Among beneficiaries, no preference language. |
| **To inform & account** | Notices/accountings disclose material facts; do not conceal. |
| **To follow the instrument** | Cite the governing instrument + `N.C.G.S. Ch. 36C` authority. |

## 3. Authority recital (open most instruments with a version of this)

> Pursuant to the powers vested in the Trustee under that certain *A Provident Private Creditor
> Revocable Living Trust* and the North Carolina Uniform Trust Code, N.C.G.S. Ch. 36C, the
> undersigned Trustee acts as follows:

## 4. Reservation of rights (close demands / notices)

> Nothing herein waives, releases, or limits any right, remedy, or defense of the Trust or its
> Trustee, all of which are expressly reserved.

- Pair with a non-waiver clause where silence might be read as acquiescence.

## 5. Due-notice rule (two parts)

1. **Disclose trust nature** on letterhead, cards, checks, and orders via a designation such as
   `Express Trust Organization` / `organized under Declaration of Trust`. (Implemented as the
   letterhead `{{TAGLINE}}` slot — component **A**.)
2. **Stipulate trust-only liability** in every written contract — the trust alone is liable, not the
   trustee or interest-holders.

## 6. Notice & accounting hygiene

- Notices identify: the Trust, the Trustee, the recipient, the act, the effective date, and the
  response window (if any), in that order.
- Accountings separate **principal** from **income**; never net them silently.
- Retitling / transfer instructions state the **from-titling** and **to-titling** exactly, with
  account numbers (gated — see SKILL §0.5).

## 7. Banking package (non-interest-bearing account) — Phase-1 bundle

Doc set: Letter of Authorization (notarized) · Certificate of Trust · Trustee Appointment ·
settlor acknowledgment / Letter of Introduction · first + signature pages of the Declaration ·
SS-4 **only if** an EIN is needed.

## 8. Sample-form catalogue (Weiss pp. 45+) — reference only, not yet generators

Asset Sale Agreement · Assignment (Bank/Copyright/Wages) · Authorized-Rep contract + Introduction ·
Bill of Sale · Bonds (basic/indemnity) · Independent Contractor Agmt · Limited POA · Management Agmt ·
Minutes (annual/notice/real-estate/revocation) · Non-Recourse Note · Notice of Assignment ·
Notice of Private Sale · Offer to Buy Auto · Proposal to Exchange.
→ Candidates to extend the 14-type library; map each to components + profile when promoted.

## 9. Things that void fiduciary soundness (auto-flag in QA)

- Signature missing the capacity line (or, on debt instruments, the non-personal qualifier).
- Trust acting without an authority recital or governing-law cite.
- A demand that asserts a right the instrument does not grant.
- Commingling principal/income in an accounting.
- Personal pronouns ("I, personally…") where the trustee acts for the trust.

## Fiduciary QA checklist (run with the editorial checklist)

- [ ] Capacity line present and correct on every signature; non-personal qualifier on debt instruments
- [ ] Authority recital + `N.C.G.S. Ch. 36C` cite where the trust acts
- [ ] Reservation-of-rights / non-waiver on demands and notices
- [ ] Due-notice: trust-nature designation on letterhead; trust-only-liability clause in contracts
- [ ] No self-dealing, no preference, no concealment language
- [ ] Principal vs. income kept distinct in any accounting
- [ ] From/to titling + account numbers complete on transfers
