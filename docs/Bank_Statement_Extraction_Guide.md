# Bank Statement Extraction Guide

**Created:** 2026-03-06
**Tool:** Bank Statement Extractor
**Purpose:** Automated extraction of BOA and PNC financial data for TMAR

---

## Quick Start

### 1. Extract and Review

```bash
cd "Digital File Cabinet/Financials/Master-Account-Register"

# Extract BOA 2024 statements
.venv/bin/python3.14 extract_statements.py --review --years 2024 --banks boa

# Extract both banks for multiple years
.venv/bin/python3.14 extract_statements.py --review --years 2022,2024 --banks boa,pnc
```

### 2. Review Output

Check `extraction_logs/extracted_data_YYYY-MM-DD_HHMMSS.json` for:
- ✅ **PASS**: All validation checks passed
- ⚠️ **WARNING**: Suspicious values (review but likely okay)
- ❌ **ERROR**: Math errors or missing data (must fix)

### 3. Apply Validated Data

```bash
# Apply to build_year_archive.py and upload to Sheets
.venv/bin/python3.14 extract_statements.py --apply extraction_logs/extracted_data_YYYY-MM-DD_HHMMSS.json
```

### 4. Verify in TMAR

1. Open TMAR Google Sheet
2. Go to **TMAR Tools → Year Settings → Data Completeness Diagnostic**
3. Verify green checkmarks for updated years
4. Select year and verify BOA/PNC tabs display data

---

## How It Works

### Architecture

```
PDF Files → Parsers → Validator → Formatters → Output
  │          │         │           │            │
  │          │         │           │            ├─ JSON (review)
  │          │         │           └────────────┴─ Python code (apply)
  │          │         │
  │          │         └─ Math checks, sanity checks
  │          │
  │          ├─ BOA Parser (year dirs)
  │          └─ PNC Parser (flat dir)
  │
  ├─ BOA: /Taxes/Clint taxes/BOA statements/
  └─ PNC: /Taxes/Syrina/PNC_Documents/
```

### Dual-Mode Operation

**Review Mode** (`--review`):
1. Extracts data from PDFs
2. Validates all fields and math
3. Outputs JSON for human review
4. Flags warnings and errors

**Auto-Update Mode** (`--apply`):
1. Reads validated JSON
2. Generates Python dictionary code
3. Surgically updates `build_year_archive.py`
4. Runs upload script to Google Sheets

---

## Validation Rules

### Math Validation
```
beginning_balance + deposits - debits - fees = ending_balance
```
Tolerance: ±$0.01 (floating point precision)

### Completeness Checks
Required fields:
- beginning_balance, deposits, debits, fees, ending_balance

### Sanity Checks (Warnings)
- Negative deposits
- Account overdrawn (-$100 to $0)
- Unusually high deposits (>$50,000)

### Continuity Checks
Sequential months: `month[n].ending == month[n+1].beginning`

---

## Troubleshooting

### ❌ ERROR: Balance mismatch

**Cause:** Extracted values don't add up mathematically
**Fix:**
1. Open the PDF manually
2. Verify numbers on account summary page
3. Edit JSON file to correct values
4. Re-run `--apply` mode

### ⚠️ WARNING: Balance discontinuity

**Cause:** February beginning ≠ January ending
**Likely Reason:**
- External transfer between months
- Account opened/closed mid-year
- Manual adjustment by bank

**Action:** Review JSON, verify it's expected, proceed with `--apply`

### ERROR: ModuleNotFoundError

**Cause:** Virtual environment not activated or dependencies missing
**Fix:**
```bash
cd "Digital File Cabinet/Financials/Master-Account-Register"
.venv/bin/pip install pdfplumber pytest
```

### ERROR: PDF not found

**Cause:** PDF files not in expected directories
**Fix:** Verify paths in `extract_statements.py`:
```python
BOA_DIR = "/Users/.../BOA statements"
PNC_DIR = "/Users/.../PNC_Documents"
```

---

## File Locations

### Source PDFs
- **BOA**: `/Users/animatedastronaut/Downloads/FileCabinet 2/Taxes/Clint taxes/BOA statements/`
  - Structure: `22/eStmt_2022-MM-DD.pdf`, `24/eStmt_2024-MM-DD.pdf`
- **PNC**: `/Users/animatedastronaut/Downloads/FileCabinet 2/Taxes/Syrina/PNC_Documents/`
  - Structure: `Spend_x0672_Statement_{Month}_{Year}.pdf`

### Generated Files
- **Extraction Logs**: `extraction_logs/extracted_data_*.json`
- **Backups**: `build_year_archive.py.bak` (created before updates)

### Code
- **CLI**: `extract_statements.py`
- **Parsers**: `extractors/boa_parser.py`, `extractors/pnc_parser.py`
- **Validator**: `extractors/validator.py`
- **Upload Script**: `build_year_archive.py`

---

## Adding New Years

When new statements arrive:

```bash
# 1. Add PDFs to correct directories
cp ~/Downloads/eStmt_2025-*.pdf "/Users/.../BOA statements/25/"

# 2. Extract
.venv/bin/python3.14 extract_statements.py --review --years 2025 --banks boa,pnc

# 3. Review JSON (should auto-pass for new statements)

# 4. Apply
.venv/bin/python3.14 extract_statements.py --apply extraction_logs/extracted_data_*.json
```

No code changes required!

---

## Extending to New Banks

To add Wells Fargo support:

1. Create `extractors/wells_fargo_parser.py` inheriting from `BaseParser`
2. Implement `parse_statement()` with WF-specific regex patterns
3. Add to CLI in `extract_statements.py`:
   ```python
   if "wf" in banks:
       wf_parser = WellsFargoParser(WF_DIR)
       wf_statements = wf_parser.extract_all(years=years)
   ```
4. Update formatter to generate `WF_CASH_FLOW` dict
5. Test with real WF PDFs

Estimated time: 2-3 hours

---

## Best Practices

1. **Always Review Before Applying**
   - Check validation results
   - Spot-check a few months manually
   - Verify totals make sense

2. **Keep Backups**
   - `build_year_archive.py.bak` is created automatically
   - Keep original PDFs in File Cabinet

3. **Test New Years First**
   - Extract single month first
   - Verify format hasn't changed
   - Then extract full year

4. **Document Format Changes**
   - If bank changes PDF format, document it
   - Update parser regex patterns
   - Add new test cases

---

## Support

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review `Extractor_API_Reference.md` for technical details
3. Check git commit history for recent changes
4. Test with a single PDF first to isolate issues

Last updated: 2026-03-06
