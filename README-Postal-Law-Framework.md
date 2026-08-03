# Postal Law Framework & Mailing Label System

> Curated agent: `mailing-label-generator` — legal/mailing-label-generator skill  
> Updated: August 1, 2026  
> Printer: Brother MFC-L2760DW

---

## Legal Authorities

### 12 Stat. 701, CHAP. LXXI — Act of March 3, 1863

**Section 23 (at 12 Stat. 705):**

> That the rate of postage on all letters not transmitted through the mails of
> the United States, but delivered through the post-office or its carriers,
> commonly described as local or drop letters, and not exceeding one half ounce
> in weight, shall be uniform at two cents, and an additional rate for each
> half ounce or fraction thereof of additional weight, to be in all cases
> prepaid by postage stamps affixed to the envelope of such letter, but no
> extra postage or carrier's fee shall hereafter be charged or collected upon
> letters delivered by carriers, nor upon letters collected by them for
> mailing or for delivery.

**Key elements:**
- Distinguishes mail "not transmitted through the mails" from ordinary USPS mail
- Establishes the two-cent drop-letter rate (prepaid by stamps)
- Prohibits additional charges on delivered/collected letters
- Source file: `/mnt/d/Communities/Classes/_HH Classes/USPostal Mail docs/Domestic Mail Manual.pdf`

### 18 U.S.C. § 1726 — Postage Collectible on Delivery

> Whoever, being a postmaster or other person employed in or connected with
> any branch of the Postal Service, shall unlawfully detain, delay, or open
> any letter, postal card, package, or mail, or shall unlawfully demand or
> receive any fee, perquisite, or reward on account of the detention, delay,
> or opening of any such letter, postal card, package, or mail, or on account
> of the delivery or nondelivery thereof, not provided for by law, shall be
> fined under this title or imprisoned not more than five years, or both.

**Key elements:**
- Makes it a federal offense for postal employees to demand unauthorized fees
- The 1863 Act's two-cent rate IS the charge provided for by law
- Any additional postage demanded = criminal violation

### DMM § 742 — Parcels Without Postage

- **742.1 MARKING** — Parcels mailed without postage affixed must bear "POSTAGE PAID" or similar endorsement in the upper right corner
- **742.2 PARCELS WITHOUT POSTAGE** — Certain mail categories accepted without postage when accounted for through authorized payment methods. The statutory non-domestic classification does not require an advance deposit account.

### UPU Convention — Article 06-001

- **§ 1.1** — Letter-post items shall be fully prepaid by the sender
- **§ 1.2** — Methods include stamps, postal prepayment impressions, franking machine impressions, and printing press impressions
- **§ 2** — "TAXE PERÇUE" ("Postage paid") indication in the top right-hand part of the address side
- Source file: `/mnt/d/Communities/Classes/_HH Classes/USPostal Mail docs/UPU Manual.pdf`

### How They Work Together

1. **12 Stat. 701 § 23** → statutory two-cent rate for mail not "transmitted through the mails"
2. **18 U.S.C. § 1726** → criminalizes demanding fees beyond what law provides
3. **DMM § 742** → marking standards for parcels without postage
4. **UPU Art. 06-001** → international standard for prepaid postage indication

A properly marked envelope bearing the statutory indicia and two-cent stamps is fully prepaid under law.

---

## Label Formats

### Label Stock Reference

| Format | Stock | Size | Per Sheet | Grid | Use |
|--------|-------|------|-----------|------|-----|
| OL875-07 | 30-up | 2.594″ × 0.999″ | 30 | 3×10 | Compact indicia + return address |
| PLS618 | 8-up | 3.75″ × 2″ | 8 | 2×4 | Estate return address |
| PLS780 | 8-up | 4″ × 2.5″ | 8 | 2×4 | No Postage Necessary indicia |
| 1.75×0.5 | 80-up | 1/2″ × 1-3/4″ | 80 | 2×40 | Taxe Percue international |

### Format D: OL875-07 — No Postage Necessary (30-Up Compact)

**Primary indicia label.** Print-verified after 9 iterations.

```
NO POSTAGE NECESSARY IF MAILED     ← 6pt BOLD, black
IN THE UNITED STATES                ← 5.5pt BOLD, black
First Class U.S. Mail               ← 5.5pt, black
Statutory Non-Domestic Mail         ← 5.5pt, black
Fully Pre-Paid                      ← 5.5pt, black
12 Stat at Law, Ch. 71. Sec 23      ← 5pt, black
Federal Offense to collect          ← 5pt, RED
additional postage                  ← 5pt, RED
18 USC 1726 ["without..."]          ← 5pt, black
742.1 MARKING                       ← 4.5pt, black
742.2 PARCELS WITHOUT POSTAGE       ← 4.5pt, black
```

**Calibrated settings (DO NOT CHANGE):**
- Top margin: **0.417″** (381000 EMU) — shifted up 6pt from default 0.500″
- Table borders: suppressed (explicit `w:tblBorders` with all edges `none`)
- Cell width: 2.594″ (2,371,725 EMU)
- Cell height: 0.999″ (913,765 EMU)
- Alignment: CENTER
- Column tblpX: 316 / 4253 / 8189 twips
- Locked output: `05-Labels/2.65x1/Estate_780_No_Postage_30up_v9.docx`

**Template:** `05-Labels/2.65x1/OL875-07.docx`

---

## Return Address Labels (30-Up OL875-07)

Generated August 1, 2026. Files in `05-Labels/2.65x1/`:

| File | Address |
|------|---------|
| `Return_Address_Trust_30up.docx` | A PROVIDENT PRIVATE CREDITOR REVOCABLE LIVING TRUST, 2105 Presbyterian Ln., Kinston, NC 28501 |
| `Return_Address_Clinton_30up.docx` | Clinton Wimberly IV, 1903 Saint George Place, Kinston, NC 28504 |
| `Return_Address_Syrina_30up.docx` | Syrina S. Wimberly, 2105 Presbyterian Ln., Kinston, NC 28501 |
| `Recipient_Address_Blank_30up.docx` | Blank — fill in recipient addresses |

Format: 10pt Times New Roman (9pt for trust), centered, name line bold, no borders.

---

## Agent Access

The `mailing-label-generator` skill is loaded automatically when any of these are mentioned:
- mailing label / print label / estate label
- postage indicia / no postage necessary / taxe percue
- return address label / non-domestic mail label

**Script location:** `.hermes/profiles/law/skills/legal/mailing-label-generator/scripts/generate_labels.py`

**Reference docs in skill:**
- `references/legal-authority.md` — full statutory text and citations
- `references/label-specs.md` — complete dimensional specs, font scaling formulas, scan analysis procedures
- `templates/` — backup copies of DMM, UPU Manual, and label templates

---

## Printing (Brother MFC-L2760DW)

- Paper Type: Labels
- Paper Size: Letter (8.5″×11″)
- Tray: Manual feed (recommended)
- Quality: 600 dpi
- Duplex: Off
- Label sheets are single-pass only — generate full sheet count in one job

---

## Related Tools

- `tmar-mailing-log-maintenance` — tracking certified mailings, return receipts, and mailing logs
- `label-template-production` — general label template filling and alignment tuning
