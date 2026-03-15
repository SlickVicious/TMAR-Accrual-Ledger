# Bank Statement Extractor - Changelog

## [1.0.0] - 2026-03-06

### ✅ Initial Release - COMPLETE

**Status**: Production-ready for BOA, partial support for PNC

### Added
- Base parser abstract class with utility methods
- BOA parser for Bank of America statements (year directory structure)
- PNC parser for PNC Virtual Wallet statements (flat directory)
- Validator with 4 check types:
  - Completeness (missing fields)
  - Math validation (balance equations)
  - Sanity checks (negative deposits, overdrafts, high amounts)
  - Continuity checks (sequential month balances)
- Formatters:
  - JSON review formatter (human-readable validation reports)
  - Python code formatter (BOA_CASH_FLOW + PNC_CASH_FLOW dicts)
- CLI tool with dual modes:
  - Review mode: extract → validate → JSON output
  - Auto-update mode: JSON → Python code → update build_year_archive.py → upload to Sheets
- Comprehensive test suite (27 tests, all passing)
- User guide and API reference documentation

### Deployed
- **BOA 2024**: ✅ 12 months successfully extracted and uploaded to TMAR _YearData sheet
  - All validation checks passed
  - 120 fields uploaded
  - Data confirmed in Google Sheets

### Known Issues
1. **PNC Partial Year Support**: `build_year_archive.py` expects 12 months per year
   - Workaround: Extract full years only
   - Fix needed: Update build script to handle incomplete years

2. **PNC 2024 Extraction**:
   - March 2024: PDF extraction failed (missing fields)
   - Jul/Aug/Sep/Nov 2024: Small balance mismatches ($3-$9)
   - Only 9 of 12 months extracted successfully

3. **PNC Balance Validation**: 4 months show math errors
   - Likely cause: Hidden fees or multi-line balance format
   - Recommendation: Manual review of flagged months

### Usage
```bash
# Extract BOA 2024
.venv/bin/python3.14 extract_statements.py --review --years 2024 --banks boa

# Apply to Google Sheets
.venv/bin/python3.14 extract_statements.py --apply extraction_logs/extracted_data_*.json
```

### Files Created
- `extractors/` - Python package with all parsers
- `tests/` - Full test suite
- `extract_statements.py` - CLI tool
- `extraction_logs/` - JSON review files
- Vault documentation in `06 Toolkit/Dev/SS Master Acct Reg/TMAR/docs/`

### Git Commits
```
4132388 fix: move imports to module level in CLI
bbf1993 test: add end-to-end integration tests
9eef81c feat: add CLI for bank statement extraction
88b6673 feat: add formatters for JSON and Python code output
154cdee feat: add validator with comprehensive checks
383adce feat: add PNC parser with full extraction logic
0d88bf5 feat: add BOA parser with full extraction logic
2766f0d feat: add base parser abstract class with tests
2c6a4ae feat: initialize bank statement extractor project structure
```

### Next Steps
1. ✅ BOA extraction working - use for 2022, 2023, 2024 as needed
2. ⚠️ Fix PNC partial year handling in `build_year_archive.py`
3. 📋 Investigate PNC balance mismatch pattern (may need regex tuning)
4. 🔮 Future: Add Wells Fargo parser (2-3 hours)

### Dependencies
- Python 3.14+
- pdfplumber 0.11.9
- pytest 9.0.2

### Testing
All tests passing:
- `env PYTHONPATH=. .venv/bin/pytest tests/ -v`

---

**Author**: Claude Code + User
**Date**: 2026-03-06
**Version**: 1.0.0
**Status**: ✅ Production-ready (BOA), ⚠️ Partial support (PNC)
