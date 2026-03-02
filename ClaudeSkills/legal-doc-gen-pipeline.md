---
name: legal-doc-gen-pipeline
description: >-
  Use this skill whenever the user needs to create, generate, draft, or manage
  legal documents in the LDG Obsidian vault. Triggers include: create trust,
  draft affidavit, generate notice, legal document, trust instrument, power of
  attorney, bill of exchange, UCC filing, cover sheet, IRS correspondence,
  W-4 correction, hold harmless, proof of service, DBA filing, master binder,
  filing system, notarize, execute document, legal template, or any mention of
  creating estate planning, trust administration, or legal compliance documents.
  Also triggers when the user asks about document status tracking, the
  Generated-Documents folder structure, Express Trust templates, or the Master
  Binder System filing hierarchy.
type: claude-skill
Category: ClaudeSkills
subcategory: Legal-Document
skill_title: Legal Document Generation Pipeline
priority: high
platform: multi-platform
status: production
version: "1.0.0"
Date-Added: "[[2026-02-26]]"
tags:
  - "#My/SysAdmin"
  - "#Claude/Skill"
  - "#AI/Automation"
  - "#Legal-Document"
aliases:
  - Legal Document Generation Pipeline
---

# Legal Document Generation Pipeline

## Overview

End-to-end system for generating, filing, and tracking legal documents within the LDG Obsidian vault. Covers trust instruments, affidavits, notices, UCC filings, IRS correspondence, and estate planning documents using Templater-driven workflows and structured filing in the Master Binder System.

## Quick Reference

| Document Type | Template Location | Output Folder | Binder Section |
|--------------|-------------------|---------------|----------------|
| Trust Instrument | `trust structures/private_family.md` | `Generated-Documents/Trusts/` | 01-Trust-Instrument |
| Affidavit | `legal_notices/` | `Generated-Documents/Affidavits/` | 02-Recorded-Documents |
| Notice/Letter | `legal_notices/` | `Generated-Documents/Notices/` | 02-Recorded-Documents |
| UCC Filing | — | `Generated-Documents/UCC-Filings/` | 02-Recorded-Documents |
| Bill of Exchange | — | `Generated-Documents/Bills-of-Exchange/` | 03-Banking |
| IRS Form/Letter | `Express-Trust-Templates/` | `Generated-Documents/` | 04-Tax-Forms |
| Cover Sheet | — | `Generated-Documents/Cover Sheets/` | 07-Source-Documents |
| Power of Attorney | `estate/power_of_attorney.md` | `Generated-Documents/` | 01-Trust-Instrument |
| Will | `estate/will.md` | `Generated-Documents/` | 01-Trust-Instrument |
| Identity Document | — | `Generated-Documents/Identity-Documents/` | 07-Source-Documents |
| Invoice | — | `Generated-Documents/Invoices/` | 03-Banking |

## Document Generation Workflow

### Step 1: Determine Document Type and Template

Consult the template index at `06 Toolkit/Templates/` and identify which template category (trust structures, estate, legal_notices, Express Trust), which Generated-Documents subfolder receives the output, and which Master Binder section it maps to.

### Step 2: Generate Document Using Templater

For documents with existing templates:

1. Open Obsidian Command Palette (Cmd+P)
2. Run Templater: Create new note from template
3. Select the appropriate template
4. Fill in prompted variables
5. Document auto-generates with proper frontmatter

Auto-assignment folders:
- `Generated-Documents/` → `Properties/yamlTemplate.md`
- `Generated-Documents/Trusts/` → `trust structures/private_family.md`

### Step 3: Required Frontmatter Schema

```yaml
---
type: legal_document
category: trust|estate|notice|government_form|ucc|financial
subcategory: specific document type
status: draft|review|executed|filed|archived
jurisdiction: North Carolina
parties:
  - name: ""
    role: grantor|trustee|beneficiary|affiant|respondent
execution_date: YYYY-MM-DD
filing_date: YYYY-MM-DD
binder_section: 01-Trust-Instrument
notarized: true|false
tags:
  - legal-document
---
```

### Step 4: File in Master Binder System

```
Master Binder System/
├── 01-Trust-Instrument/    — Trust agreements, amendments, POA, wills
├── 02-Recorded-Documents/  — Filed affidavits, notices, UCC filings
├── 03-Banking/             — Banking docs, bills of exchange, invoices
├── 04-Tax-Forms/           — IRS forms, W-4 corrections, 1099s, EINs
├── 05-Minutes-Resolutions/ — Trust meeting minutes, resolutions
├── 06-Account-Register/    — Account tracking, asset schedules
└── 07-Source-Documents/    — Identity docs, cover sheets, source materials
```

## Express Trust Templates

Located at `Digital File Cabinet/Gov Forms Links/Form LINKS/Filing examples/Express-Trust-Templates/`:

| Template | Purpose |
|----------|---------|
| 01-W4-Correction-Statement-Template.md | W-4 withholding correction |
| 02-IRS-Correspondence-Letter-Template.md | IRS communication |
| 03-DBA-Filing-Forms-All-Six-Template.md | DBA registration (6 forms) |
| 04-Hold-Harmless-Agreement-Template.md | Liability protection |
| 05-Proof-of-Service-Template.md | Service verification |
| IRS-48-Hour-Response-Letter.md | IRS deadline response |

## Document Status Tracking

### Active Documents by Status

```dataview
TABLE
  category as "Category",
  subcategory as "Type",
  status as "Status",
  execution_date as "Executed",
  binder_section as "Binder"
FROM "Digital File Cabinet/Generated-Documents"
WHERE type = "legal_document"
SORT status ASC, execution_date DESC
```

### Documents Pending Action

```dataview
TABLE
  subcategory as "Type",
  status as "Status",
  file.mtime as "Last Touch"
FROM "Digital File Cabinet/Generated-Documents"
WHERE type = "legal_document" AND (status = "draft" OR status = "review")
SORT file.mtime ASC
```

---

### When to use?

Create trust, draft affidavit, legal template, master binder, filing, execute document, IRS correspondence, UCC filing, power of attorney.

```meta-bind-button
label: "⬅️ Claude Skills Directory"
icon: ""
hidden: true
class: ""
tooltip: ""
id: "claudeskills"
style: default
actions:
  - type: open
    link: "[[ClaudeSkills]]"

```
