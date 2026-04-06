---
name: iris-1099b-generator
type: Claude Desktop Project Skill
location: Claude Desktop → TMAR Project → Skills
status: active
---

# IRIS 1099-B Generator

**Type:** Claude Desktop Project Skill (not a vault file — lives in the Claude project)

Generates IRS IRIS-compliant 1099-B CSV files from TMAR data sources. Supports both Google Sheets live data and XLSX exports. Produces paired filings per account (Form 1: G+Y, Form 2: N+N) ready for IRIS upload.

## Trigger phrases
- "generate 1099-B CSVs", "make the 1099s", "build the tax CSVs", "file the B forms"
- Uploading XLSX with creditor/entity data and asking for 1099-B filings

## Key logic
- Two-form-per-entity methodology: Form 1 (Box 6=G, 7=Y), Form 2 (Box 6=N, 7=N, 24% withholding)
- Full pipeline: source extraction → IRIS field mapping → paired generation → validation → output
