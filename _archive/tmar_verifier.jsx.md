Now I have the full picture. Let me build a comprehensive EIN/Account verification tool. I'll create both a Python CLI script (for automated use with the TMAR sheet) and a React dashboard for visual verification.

Architected interactive dashboard for verifying company credentials against SEC databases

Architected interactive dashboard for verifying company credentials against SEC databases

Let me build this properly as an interactive verification dashboard.

Assembled tool framework for account verification integration

Assembled tool framework for account verification integration

Two tools delivered:

**1. React Dashboard (`tmar_verifier.jsx`)** — Interactive UI with:

- All 17 TMAR accounts pre-loaded (MR-001 through MR-017)
- **Live SEC EDGAR API** lookups that pull registered company name, CIK, address, state, SIC code, fiscal year end, and recent filings (10-K, 8-K, 10-Q)
- Click any row to open a detail panel with EIN confirmation status, full SEC data, and **recommended verification steps** specific to each account type
- Filterable by confidence level (HIGH/MEDIUM/LOW/UNVERIFIED) and searchable by name, EIN, or account number
- Color-coded by account type (Banking, Brokerage, Employer, etc.)

**2. Python CLI (`tmar_ein_verifier.py`)** — Scriptable tool that:

- Reads directly from your TMAR Google Sheet (tabs 13 & 17) using the service account creds at `~/Downloads/04_Dev-Config/credentials.json`
- Falls back to embedded account data with `--offline` flag
- Single EIN lookup: `python tmar_ein_verifier.py --ein 94-1687665`
- Exports JSON reports for audit trail
- Hits SEC EDGAR, IRS Exempt Org, and full-text filing search

**What gets verified automatically vs. manually:**

|Source|Entities Covered|Data Returned|
|---|---|---|
|SEC EDGAR (live API)|BAC, PYPL, NNI, OMF|Registered name, address, CIK, recent filings|
|Manual cross-ref needed|Fidelity, Vanguard, Webull, First Premier, Merrick|Verify via W-9, 1099, or FINRA BrokerCheck|
|W-2 box (b)|Boys & Girls Club, Inter Tech, Kinston Arts, Lenoir CC|EIN confirmation from payroll records|
|Government records|SSA|Verify via SSA-1099 or benefit statement|
|Parent company (DUK)|Piedmont Gas|Subsidiary — verify via Duke Energy 10-K|

Tmar verifier

Code · JSX 

Tmar ein verifier

PY