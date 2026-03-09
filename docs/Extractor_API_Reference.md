# Bank Statement Extractor API Reference

**Version:** 1.0.0
**Created:** 2026-03-06

---

## Module Overview

```
extractors/
├── __init__.py          # Package initialization
├── base_parser.py       # Abstract base class
├── boa_parser.py        # BOA-specific parser
├── pnc_parser.py        # PNC-specific parser
├── validator.py         # Data validation
└── formatters.py        # Output formatting
```

---

## BaseParser (Abstract)

**Path:** `extractors/base_parser.py`

### Class: `BaseParser(ABC)`

Abstract base class for all financial document parsers.

#### Constructor
```python
def __init__(self, base_dir: str, bank_name: str)
```
- `base_dir`: Root directory containing statements
- `bank_name`: Bank identifier (e.g., "boa", "pnc")
- Raises `ValueError` if directory doesn't exist

#### Abstract Methods
```python
@abstractmethod
def parse_statement(self, pdf_path: Path) -> Optional[Dict]
```
Parse single PDF, return standardized dictionary or None.

**Standard Return Format:**
```python
{
    "year": int,
    "month": str,  # lowercase 3-letter (jan, feb, ...)
    "bank": str,
    "beginning_balance": float,
    "deposits": float,
    "debits": float,
    "fees": float,
    "ending_balance": float,
    "net_change": float,
    # Optional bank-specific fields
}
```

#### Utility Methods

**`extract_all(years: Optional[List[int]] = None) -> List[Dict]`**
- Batch process all PDFs for specified years
- Returns list of parsed statement dictionaries

**`find_pdfs(years: Optional[List[int]] = None) -> List[Path]`**
- Find all PDF files (override for custom directory structures)
- Filters by year in filename if years provided

**`parse_amount(text: str) -> Optional[float]`** (static)
- Parse dollar amounts: `$1,234.56` → `1234.56`
- Handles negative values and various formats

**`extract_with_regex(pattern: str, text: str, group: int = 1) -> Optional[str]`** (static)
- Extract text using regex pattern (case-insensitive)

---

## BOAParser

**Path:** `extractors/boa_parser.py`

### Class: `BOAParser(BaseParser)`

Parser for Bank of America monthly statements.

#### Constructor
```python
def __init__(self, base_dir: str)
```
- Expected directory structure: `{base_dir}/22/`, `{base_dir}/24/`
- Filename pattern: `eStmt_YYYY-MM-DD.pdf`

#### Methods

**`find_pdfs(years: Optional[List[int]] = None) -> List[Path]`**
- Searches year directories (22, 24, etc.)
- Filters by year list if provided

**`parse_statement(pdf_path: Path) -> Optional[Dict]`**
- Extracts from page 1 account summary
- Includes BOA-specific fields:
  - `zelle_to_syrina`: Total Zelle transfers to Syrina
  - `zelle_breakdown`: Dict with zelle_transfers, assurant, transfers_total

#### Extraction Methods

Private methods for extracting specific fields:
- `_extract_beginning_balance(text: str)`
- `_extract_deposits(text: str)`
- `_extract_debits(text: str)` - Sums ATM, other, checks
- `_extract_fees(text: str)`
- `_extract_ending_balance(text: str)`
- `_extract_zelle_transfers(pdf)` - Scans transaction pages
- `_extract_zelle_breakdown(pdf)` - Includes Assurant insurance

---

## PNCParser

**Path:** `extractors/pnc_parser.py`

### Class: `PNCParser(BaseParser)`

Parser for PNC Virtual Wallet Spend statements.

#### Constructor
```python
def __init__(self, base_dir: str)
```
- Expected directory structure: Flat directory
- Filename pattern: `Spend_x0672_Statement_{Month}_{Year}.pdf`

#### Methods

**`find_pdfs(years: Optional[List[int]] = None) -> List[Path]`**
- Searches flat directory
- Filters by year in filename

**`parse_statement(pdf_path: Path) -> Optional[Dict]`**
- Extracts from page 1 Balance Summary
- PNC statements don't have Zelle breakdown (returns None)

#### Extraction Methods

Private methods:
- `_extract_beginning_balance(text: str)` - Multi-line table format
- `_extract_deposits(text: str)` - Second value in Balance Summary
- `_extract_debits(text: str)` - Third value in Balance Summary
- `_extract_fees(text: str)` - From "Charges and fees" section
- `_extract_ending_balance(text: str)` - Fourth value in Balance Summary

**Note:** PNC uses multi-line table format requiring `re.DOTALL` flag.

---

## Validator

**Path:** `extractors/validator.py`

### Class: `ValidationResult` (Dataclass)

```python
@dataclass
class ValidationResult:
    bank: str
    year: int
    month: str
    status: str  # "PASS", "WARNING", "ERROR"
    messages: List[str]
```

### Class: `Validator`

Validates extracted financial data.

#### Constructor
```python
def __init__(self, tolerance: float = 0.01)
```
- `tolerance`: Max acceptable difference for balance math (default: $0.01)

#### Methods

**`validate_statement(statement: Dict) -> ValidationResult`**
- Validates single statement
- Checks: completeness → math → sanity

**`validate_batch(statements: List[Dict]) -> List[ValidationResult]`**
- Validates multiple statements
- Sorts by bank/year/month
- Checks continuity between sequential months

**`generate_summary(results: List[ValidationResult]) -> Dict`**
- Returns: total, passed, warnings, errors, success_rate

#### Validation Rules

**Completeness:**
- Required fields: beginning_balance, deposits, debits, fees, ending_balance

**Math:**
- Equation: `beginning + deposits - debits - fees = ending`
- Tolerance: ±$0.01

**Sanity (Warnings):**
- Negative deposits
- Account overdrawn (-$100 to $0)
- Unusually high deposits (>$50,000)

**Continuity:**
- Sequential months: `prev.ending == curr.beginning`
- Works across year boundaries (Dec → Jan)

---

## Formatters

**Path:** `extractors/formatters.py`

### Class: `JSONFormatter`

Formats extracted data as JSON review file.

#### Methods

**`write_review_file(statements, validation_results, output_path)`**
- Creates JSON with extraction_summary, statements, validation_results
- Includes timestamp, success/warning/error counts

**Output Structure:**
```json
{
  "extraction_summary": {
    "timestamp": "2026-03-06T15:45:30.123456",
    "total_statements": 24,
    "successful": 24,
    "warnings": 0,
    "errors": 0
  },
  "statements": [ ... ],
  "validation_results": [ ... ]
}
```

### Class: `PythonCodeFormatter`

Generates Python dictionary code for `build_year_archive.py`.

#### Methods

**`generate_boa_dict(statements: List[Dict]) -> str`**
- Generates `BOA_CASH_FLOW = { ... }` code
- Groups by year, sorts by month
- Includes cash_flow and zelle_breakdown arrays
- Format: 7 values per row + month comment

**`generate_pnc_dict(statements: List[Dict]) -> str`**
- Generates `PNC_CASH_FLOW = { ... }` code
- Groups by year, sorts by month
- Single cash_flow array (6 values per row)
- No Zelle breakdown

**Output Format:**
```python
BOA_CASH_FLOW = {
    2024: {
        "cash_flow": [
            [1744.83, 5429.30, 5335.84, 2.50, 1835.79, 90.96, 1500.00],   # Jan
            ...
        ],
        "zelle_breakdown": [
            [1500.00, 18.50, 1518.50],   # Jan
            ...
        ],
    },
}
```

---

## CLI

**Path:** `extract_statements.py`

### Functions

**`review_mode(years_str: str, banks_str: str)`**
- Parses comma-separated years and banks
- Extracts statements using appropriate parsers
- Validates with Validator
- Outputs JSON to extraction_logs/

**`apply_mode(json_path: str)`**
- Loads validated JSON
- Generates Python code with PythonCodeFormatter
- Backs up build_year_archive.py
- Regex-replaces BOA_CASH_FLOW and PNC_CASH_FLOW
- Validates syntax with `ast.parse()`
- Runs build_year_archive.py via subprocess

**`main()`**
- Argument parser with --review, --apply, --years, --banks
- Routes to review_mode or apply_mode

### Configuration

Edit these paths in `extract_statements.py`:
```python
BOA_DIR = "/path/to/BOA statements"
PNC_DIR = "/path/to/PNC_Documents"
PROJECT_ROOT = Path(__file__).parent
EXTRACTION_LOGS = PROJECT_ROOT / "extraction_logs"
BUILD_SCRIPT = PROJECT_ROOT / "build_year_archive.py"
```

---

## Usage Examples

### Example 1: Extract BOA 2024

```python
from extractors.boa_parser import BOAParser

parser = BOAParser("/Users/.../BOA statements")
statements = parser.extract_all(years=[2024])

for stmt in statements:
    print(f"{stmt['year']}-{stmt['month']}: ${stmt['ending_balance']:.2f}")
```

### Example 2: Validate Extracted Data

```python
from extractors.validator import Validator

validator = Validator(tolerance=0.01)
results = validator.validate_batch(statements)
summary = validator.generate_summary(results)

print(f"Passed: {summary['passed']}/{summary['total_statements']}")
```

### Example 3: Generate Python Code

```python
from extractors.formatters import PythonCodeFormatter

formatter = PythonCodeFormatter()
boa_code = formatter.generate_boa_dict(boa_statements)
pnc_code = formatter.generate_pnc_dict(pnc_statements)

print(boa_code)
```

---

## Extension Guide

### Adding a New Bank

1. Create `extractors/newbank_parser.py`:
```python
from extractors.base_parser import BaseParser

class NewBankParser(BaseParser):
    def __init__(self, base_dir: str):
        super().__init__(base_dir, bank_name="newbank")

    def parse_statement(self, pdf_path: Path) -> Optional[Dict]:
        # Implement extraction logic
        pass
```

2. Add to CLI (`extract_statements.py`):
```python
if "newbank" in banks:
    nb_parser = NewBankParser(NEWBANK_DIR)
    nb_statements = nb_parser.extract_all(years=years)
    all_statements.extend(nb_statements)
```

3. Update formatters if needed for bank-specific output format

4. Test with real PDFs and add test cases

---

## Testing

### Run All Tests
```bash
cd "Digital File Cabinet/Financials/Master-Account-Register"
env PYTHONPATH=. .venv/bin/pytest tests/ -v
```

### Test Individual Modules
```bash
env PYTHONPATH=. .venv/bin/pytest tests/test_boa_parser.py -v
env PYTHONPATH=. .venv/bin/pytest tests/test_validator.py -v
```

### Test with Real PDFs
Tests automatically use real PDF files from File Cabinet if available. Tests are skipped if PDFs not found.

---

## Dependencies

- **pdfplumber**: PDF text extraction
- **pytest**: Testing framework
- **Python 3.14+**: Required for modern features

Install:
```bash
.venv/bin/pip install pdfplumber pytest
```

---

Last updated: 2026-03-06
Version: 1.0.0
