# Enhanced TMAR ↔ FileCabinet Audit — Three-Way Reconciliation

> **Status:** 2026-10-07. Sections A–F complete (Hermes law-profile audit). The VSC agent seeded the "Prior context" below (process-folder model) — preserved verbatim and adopted. Two agents wrote this same path concurrently; the merged result below keeps both: the VSC "Prior context" and the full A–F reconciliation.

## Prior context — Filing Packages process-folder model (ADOPTED; do not re-derive)

The correct framing for `02-Recorded-Documents/Filing Packages/` is a **process-folder model**, not a per-request-number layout. It just bit us concretely: a drafted-but-never-sent June rebuttal sat in the same package folder as the mailed June resubmission, and the directory gave no way to tell them apart.

```
02-Recorded-Documents/Filing Packages/
  <ProcessName>/                 <- ONE folder per process, NOT per request number
    _MANIFEST.md                 <- dated ledger: every artifact, its status, what it produced, dates
    mailed/                      <- GATED: only if postage breadcrumbs are co-located
      req1_2026-05-13/           <-   form + $30 MO + tracking + 5/27 denial
      req2_2026-06-10/           <-   transmittal + short-form result
      req3_2026-08-18/           <-   form + $90 MO + tracking + green card + 3 short-form results
    drafted/                     <- quarantine: never mailed (explicitly flagged)
      rebuttal_2026-06-10/       <-   the drafted-not-sent rebuttal
    correspondence/
      received/                  <- denial letters, VitalChek letter, short-form copies
      sent/                      <- demand/escalation letters (moved here the moment mailed)
```

**The gate:** a document only earns a spot in `mailed/` if its postage breadcrumbs (tracking number, money-order serial, green card) sit in the same subfolder. No breadcrumbs → it stays in `drafted/` or `correspondence/`.

**Absorbs:** the scattered `04-Taxes\...\State-Filings\NYS DOH` files — denial letters and filled forms move into the process folder's `correspondence/received/` and `mailed/<reqN>/` instead of a tax-filing tree.

### Open items (operator decision)

1. **Scope** — pilot on NYS DOH only vs standing standard for every process package. *(Resolved same-day: standing standard; see §F and the `tmar-mailing-log-maintenance` skill.)*
2. **Proton Drive risk** — FileCabinet sits under Proton Drive "Computers" sync, which has a known rollback behavior on renames/moves. The AUDIT is read-only (safe); the eventual process-folder REMAP must be executed with sync PAUSED or carefully verified.

---

## Concurrent-work note (git)

At audit time the working tree showed Claude Code's parallel edits in the same repo: `start-local-server.bat` (a `netstat` port guard, unrelated) plus untracked `docs/TMAR AI AgenTalks/`, `docs/tmar-filecabinet-enhanced-audit-prompt.md`, `TMAR-Accrual-Ledger.html.bak.hermes-integration`, `start_tmar_server_hidden.bat`. This audit report itself collided with the VSC agent's seed of the same filename; merged here.

---

## Section A — GUI vocabulary inventory (`TMAR-Accrual-Ledger.html`)

Source: 3.96 MB single-file app; all live JS is inlined (the sibling `tt_block.js` is a stale mirror and was not consulted).

### A.1 Top-level pages (42, via `'page-*'` string ids)

`page-accounting`, `page-agents`, `page-aihub`, `page-analytics`, `page-apiscout`, `page-apitools`, `page-arbitration`, `page-backup`, `page-biblical`, `page-brainstorm`, `page-calendar`, `page-chat`, `page-chat-history`, `page-code`, `page-codebuilder`, `page-corporation`, `page-create`, `page-creative`, `page-dashboard`, `page-docs`, `page-eeonfull`, `page-general`, `page-gmailify`, `page-history`, `page-howto`, `page-jurisdictional`, `page-legal`, `page-noi`, `page-noi-ask`, `page-openclaw`, `page-preferences`, `page-research`, `page-search`, `page-settings`, `page-taskplanner`, `page-tax`, `page-taxestimator`, `page-taxforms`, `page-trust`, `page-vault`, `page-voice`.

### A.2 "Digital File Cabinet" page (`page-docs`) — the document-location surface

Three tabs (line 37602–37604):
- **📁 Vault Browser** — renders a **hardcoded JSON tree** (see A.4).
- **📊 Sheets Data** — live workbook tabs via GAS pull.
- **📋 Local Docs** — browser localStorage search.

### A.3 Master Register export schema (the GUI's canonical column list)

Line 33293–33303 (`exportEntitiesToMasterRegisterCSV`) — **29 columns**:

`Row ID, Date Added, Provider/Creditor, Provider EIN, Account Number, Account Type, Account Subtype, Status, Open Date, Close Date, Current Balance, Original Balance, Billing Frequency, Next Payment Due, Primary User, Authorized Users, Autopay Status, Payment Source, Contract/Terms File, Statements Complete, Tax Forms on File, PoP Documents, Document Location, Last Statement Date, Last Verified Date, Retention Period, Notes, Tags, Discovery Status`

### A.4 Vault Browser hardcoded tree (dead taxonomy)

- Line 54552: `var VAULT_ROOT = 'C:\\Users\\rhyme\\Desktop\\FileCabinet';`
- Line 54033 comment: the tree originated from `C:\Users\rhyme\Documents\Legal Document Generator\Digital File Cabinet`.
- Line 54131: a top-level `"Trust-Records"` object persists, with sections like `"Financials"` → `"B&G"`, `"BoA Annual Deposits"`, `"Master-Account-Register"`.

**`Trust-Records` is a pre-2026-10-07 taxonomy.** It appears in the GUI *and* in the Master Register `Document Location` column (§B.4) — but nowhere in the current directory.

### A.5 FWM (Freeway Mechanics) vocabulary in the GUI

- Line 14919: "…the Freeway Mechanics (FWM) trust administration system (**7-Part, 11 Binder Tabs**)."
- Line 15945–15946: doc-generator `<optgroup label="── FWM Trust Administration ──">` with presets (e.g. `fwm_certificate_of_trust`).
- Line 21928: `var FWM_PRESETS = { … }`.
- Lines 42071–42074 (`DOCUMENT_KNOWLEDGE.ledgerTopology`): **JOIN KEYS** (EIN links Master Register / Creditor Registry / Checklist / FWM Creditor Detail / FWM Forms Checklist / 1099 Filing Chain; DOC-NNNN is the document key in Document Registry, "now the PC FileCabinet scan and is canonical"; Document Inventory is an older catalog whose DOC-NNNN numbers COLLIDE), **SURFACE MAP** (TMAR Live `1k6J2…` sole read/write; Freeway 2025 Archive `1kbulI…` read-only; APPC_RLT hub `1Ac5A…` dead).
- Line 19745: "NC/VA Durable Power of Attorney + Trust DBA Filing System".

### A.6 GUI entity-type enum (typeMap)

`Trust → Trust Entity`, `LLC`, `Corporation`, `Individual`, `Employer → Employment W-2`, `Bank → Banking Checking`, `Brokerage → Investment Brokerage`, `Insurance`, `Vendor`, `Government → Government Agency`, `Creditor → Credit Card`.

### A.7 GUI dropdown value fragments

Entity-type constants: `AUTO_FINANCE`, `BANK_HOLDING_COMPANY`, `BROKER_DEALER`, `COLLECTION_AGENCY`, `CONSUMER_LENDER`; subtype strings: `Checking`, `Auto Loan`, `Brokerage`, `Business Account`, `Business Line`, `CUSIP/Bond`, `Asset Acquisition`, `Acquired`, `Capital Contribution`.

---

## Section B — Sheet + Apps Script schema inventory

Source of truth: `gas/*.gs` (clasp mirror of Script ID `1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr`) + Digital-Binders TSV extracts. The Google Sheets API is not configured from this environment; the `.gs` files and TSVs are authoritative proxies, as permitted.

### B.1 Workbook identity (SyncCenter.gs `TMAR_CONFIG`, lines 470–476)

| Role | ID |
|---|---|
| `liveBookId` / `sourceBookId` / `appcHubId` (merged) | `1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ` |
| `archiveBookId` ("Freeway 2025" — read-only legacy) | `1kbulI33th8uOmrumj7RkiJ8aqZs48gqzujrXUmNRjk8` |
| Web App execUrl | `…/AKfycbzpeegvE52lvqCTMyKrsdaa_4JFfjM6MQrsJkU8zb17fkUJzPRasUU0fjONdaHkM5dh/exec` |

### B.2 Tab names (verified across `.gs` + docs)

Core: `Master Register`, `Transaction Ledger`, `Household Obligations`, `1099 Filing Chain`, `Forms & Authority`, `Proof of Mailing`, `Document Inventory`, `Document Registry`, `Trust Ledger`, `Website Accounts`, `W-2 & Income Detail`, `Acct Ledger`, `Executive Dashboard`, `BOA Cash Flow`, `PNC Cash Flow`, `Subscriptions & Services`, `Tax Strategy`, `Receivables`, `Principal Register`, `Contacts`, `_Validation` (hidden), `_Settings` (hidden).

Legacy FWM tabs (TabConsolidationAudit.gs flags for removal): `FWM — Master Index`, `FWM — Forms Checklist`, `FWM — Creditor Detail`, `FWM — Dashboard`, `FWM — Binder Tab Guide`. TMAREngine.gs:162 also references a legacy `Freeway Method Filing Checklist` alias.

### B.3 Master Register — 29 columns (A–AC)

`TMARBridge.gs addTMARAccount()` (lines 142–172) is the most explicit authority:

| Col | 0-idx | Field | Col | 0-idx | Field |
|---|---|---|---|---|---|
| A | 0 | Row ID | Q | 16 | Autopay Status |
| B | 1 | Date Added | R | 17 | Payment Source |
| C | 2 | Provider/Creditor | S | 18 | Contract/Terms File |
| D | 3 | Provider EIN | T | 19 | Statements Complete |
| E | 4 | Account Number | U | 20 | Tax Forms on File |
| F | 5 | Account Type | V | 21 | PoP Documents |
| G | 6 | Account Subtype | **W** | **22** | **Document Location** |
| H | 7 | Status | X | 23 | Last Statement Date |
| I | 8 | Open Date | Y | 24 | Last Verified Date |
| J | 9 | Close Date | Z | 25 | Retention Period |
| K | 10 | Current Balance | AA | 26 | Notes |
| L | 11 | Original Balance | AB | 27 | Tags |
| M | 12 | Billing Frequency | AC | 28 | Discovery Status |
| N | 13 | Next Payment Due | | | |
| O | 14 | Primary User | | | |
| P | 15 | Authorized Users | | | |

**Document Location = column W = 0-index 22 = 23rd column.** ✅ Confirmed against all three sources.

### B.4 `pushEntities_` field list (SyncCenter.gs lines 1436–1477)

**14 fields** (the brief's "10 fields" is stale — the code has since been extended):

`acctType→F(6), subtype→G(7), status→H(8), openDate→I(9), closeDate→J(10), currentBalance→K(11), originalBalance→L(12), primaryUser→O(15), paymentSource→R(18), statementsComplete→T(20), documentLocation→W(23), lastStatementDate→X(24), lastVerified→Y(25), notes→AA(27)`.

Append path additionally sets `row[28]='Synced from Ledger'` (Discovery Status AC). EINs are never imported ("Never import EINs" — row[3] left empty).

### B.5 Proof of Mailing — 14 columns (A–N)

`Mail ID, Date Sent, Recipient, Recipient Address, Document Sent, Related Form/Filing, USPS Tracking Number, PS Form 3811 (Green Card), Delivery Confirmed, Delivery Date, Return Receipt Received, FWM Binder Tab, Document Location, Notes`.

### B.6 Document Registry / Document Inventory

- `ImportRegistryScan.gs`: `REGISTRY_TAB_='Document Registry'`, **10 columns A–J**, row 1 title / row 2 header / row 3+ data. Col H = Full File Path (dedup key, normalized against `C:/Users/rhyme/Desktop/FileCabinet/`, `/Users/animatedastronaut/Downloads/FileCabinet/`, `/Volumes/GoogleDrive/My Drive/FileCabinet/`).
- Registry header = `Doc ID, Filename, Document Type, Tax Year, Person, MR Account, FWM Binder Tab, Full File Path, Source Directory, Scan Date`.

### B.7 Dropdown enums (`PopulateValidation.gs` — authoritative)

- **Account Types** (~81 code values; the guide claims 89): `Bank Account - Checking/Savings/Money Market/CD/Business…`, `Credit Card - Personal/Business/Secured/Store`, `Line of Credit`, `HELOC`, `Mortgage - Primary/Investment`, `Auto Loan`, `Student Loan - Federal/Private`, `Personal/Business/Payday Loan`, `Investment - Brokerage/IRA/401(k)/403(b)/SEP/Simple/HSA/529/Crypto/Real Estate`, `Insurance - Life/Health/Auto/Home/Disability/Umbrella`, `Utility - Electric/Gas/Water/Internet/Phone/Cable/Trash`, `Tax Authority - IRS/State/Local`, `Court - Judgment/Settlement`, `Government Benefit - SSA/Medicare/Medicaid`, `Collection Account`, `Charge-off - Bank/Credit Card`, `Medical Collection`, `Subscription/Membership - …`, `PayPal/Venmo/Cash App/Cryptocurrency Wallet/Prepaid Card/Gift Card/Retail Financing/BNPL/Rental Agreement/Storage Unit/Other`.
- **Statuses** (22): `Active, Closed, Closed - Paid Off/Transferred/Refinanced, Pending, Pending - Opening/Closing, Dormant, Frozen, Disputed, In Collections, Charged Off, Bankruptcy - Ch7/Ch13, Settled, Foreclosed, Repossessed, Under Review, Inactive, Suspended, Cancelled`.
- **Filing Statuses** (15), **Users** (6): `Clint, Syrina, Joint, Trust, Business, Other`.
- **FWM Binder Tabs** (12): `Tab 1 - Trust Document, Tab 2 - EIN Letter, Tab 3 - Form 56, Tab 4 - Power of Attorney, Tab 5 - Account Claims, Tab 6 - 1099-A Forms, Tab 7 - 1099-B Forms, Tab 8 - Correspondence, Tab 9 - Asset Valuations, Tab 10 - Tax Returns, Tab 11 - Supporting Docs, Not Assigned`.
- **Billing Frequency** (14), **Transaction Categories** (~95), **Discovery Status** (15).

### B.8 Digital-Binders TSV extracts (headers)

| File | Header |
|---|---|
| `master_register.tsv` | 27 cols — **omits `Tags` + `Discovery Status`** (cf. 29-col schema) |
| `coa.tsv` / `coa_full.tsv` | 1099 CoA: `Type, TIN Type, TIN, First/Middle Name, Business Name & Last Name, Suffix, Attention To, Address 1/2, City, State, ZIP, Country, Phone, Email` |
| `household_obligations.tsv` | `Vendor, Category, Subcategory, Current Monthly, Due Day, Payment Method, Responsible Party, Status, Start Date, Rate Changes, Notes` |
| `subscriptions.tsv` | `Service, Category, Monthly/Annual Cost, Payment Method, Responsible Party, Status, Tax Deductible, Business Use %, Notes` |
| `transaction_ledger.tsv` | `Date, Party, Category, Subcategory, Vendor, Description, Amount, Payment, Acct Type, Status, Tax Ded?, Biz Use %, Due Day, Recurring, Notes, Source` |
| `ffs_master_index.tsv` | `Tab #, Binder Section, Category, Creditor/Entity, EIN, Audit Account #, Payer, Date Acquired, Date Sold, Account Status, 1099-B Pair` |
| `ffs_creditor_detail.tsv` | `Tab #, Payer, Creditor/Entity, EIN, TIN Type, Name Type, Address 1, City, State, ZIP, Country` |
| `ffs_proof_mailing.tsv` | 14 cols (see B.5) |
| `ffs_forms_authority.tsv` | `Form/Document, IRS Form Number, Purpose, Date Filed, Date Accepted, IRS Receipt/Confirmation, CAF Number, FWM Binder Tab, Status, Filing Method, Tracking Number, Document Location, Notes` |

### B.9 Freeway Filing System workbooks (category/authority map)

`Freeway_Filing_System_TEMPLATE.xlsx` sheets: `Master Index, Forms Checklist, Creditor Detail, Binder Tab Guide, Dashboard`.
`Freeway_Filing_System_PERSONAL_v2.xlsx` sheets: `Master Index, Forms Checklist, Creditor Detail, Forms & Authority, Binder Tab Guide, Dashboard, Document Inventory, Document Registry, Proof of Mailing, SPV`.

- **Master Index** `Binder Section` categories: `Credit Cards, Collections, Personal Loans, Student Loans, Auto Loans, Banking, Insurance` (+ `Investment, Housing, Utility` in Dashboard). Tab IDs `S-###` (Syrina, 37) and `C-###` (Clinton, 12).
- **Binder Tab Guide** uses a *third* naming: `Section 1: Trust Foundation, Section 2: IRS Notices, Section 3: Per-Creditor Tab`.
- **Forms & Authority** uses a *fourth*: `Tab 1: Trust Instrument, Tab 2: EIN Documentation, Tab 3: Banking Authority, Tab 4: Notices & FOIA`.
- **Document Inventory** uses a *fifth*: `Tab 1: Trust Instrument, Tab 7: 1099-A Records, Tab 8: 1099-B Records` (note "Records" and 1099-A at Tab 7, not 6).

---

## Section C — FileCabinet tree inventory

Root `/mnt/c/Users/rhyme/Desktop/FileCabinet/`. Canonical map: skill `file-vault-organization/references/taxonomy.md`.

### C.1 Top level (25 dirs — one more than the 24 in the taxonomy; `undated/` since removed)

`00-Receipts-Invoices`, `01-Mailings`, `02-Recorded-Documents`, `03-Banking`, `04-Taxes`, `05-Estate & Trust`, `05-Labels`, `06-Account-Register`, `07-Source-Documents`, `08-Ledgers`, `09-Valuations`, `Archive`, `Business`, `Credentials`, `Credit-Reports`, `Digital-Binders`, `Employment`, `Genealogy`, `Legal-Reference`, `_Unsorted` (empty), `scripts`, `$Temp`, `.FC`, `.claude`.

### C.2 One level deep (drift-relevant)

- **03-Banking** — person-first: `Clinton/{Ally, BOA, CashApp, Fidelity, ID-Copies, PayPal, TD-Account, Truist, Vanguard, Webull, Zelle}`, `Syrina/{Capital-One, ID-Copies, PNC}`. ✅ Clean.
- **04-Taxes** — `Clinton/`, `Syrina/`, `Filing-Systems/`, `Reference/`, + a stray `_enhanced_status_report_2026-08-08.md` at root.
- **06-Account-Register** — ~33 institution folders + loose files at root: `Creditor list- Sheet1.xlsx`, `break_down_50_USC___4305_for_me_in_the_s_.docx`, `Demand Auth Acc Acct Rec_Lm`, plus `_Templates/`, `__Prospectus/`, `AcctRetitling/`, `IRS-Verification/`.
- **07-Source-Documents** — `Books/`, `SPac RefDocs/`, `Generated-Documents/`, `DOR (w_state statues)/`, `My Collection of terms/`, `Transfers to Minors Act/`, `Biblical Principals/` (typo fixed), `notices affidavit/`.
- **00-Receipts-Invoices** — `Anthropic/`, `OpenAI/`, `deepseek/`, `E-Comm/`, `Living Expenses/`, `Proof-of-Filing/`, `_NonPostal/`, `Postal/` (being drained), + two loose `.jpg`.
- **Business** — `Assumed-Name-DBA/`, `Domivia/`, `Sole-Proprietorship/{CWIV Audio Visual Solutions, SW AUTOCHTHONOUS AVATAR}/` + loose files at root (`LNRS-ROUTING_NUMBER_APPLICATION-v2.pdf`, `RODfeeschedule2016.pdf`, `SPropTaxTx.pdf`).
- **Legal-Reference** — `Affidavits/`, `Courts/`, `Family-History/`, `IRS-Procedure/`, `Trust-Law-Books/`, `UCC/`, `USC/`, `noeE/` + loose files at root (State National Letterhead, Pro-Se Handbook, 73d Congress, operating-circular, GPO CRECB, Senate Report).
- **Credit-Reports** — `Clinton/`, `Syrina/` (renamed from `Clints`/`Rinas`) + `DOC-0081_*` and LexisNexis forms at root.
- **Archive** — `Dev_Logs/`, `Drafts/`, `Duplicates/`, `TMAR_Dev/`, `_Hermes_Profile_Backup/`, `_backup-unique/` + 5 stale `…TMAR).xlsx.bak-*` + `trustInstPkg.zip`.
- **Digital-Binders** — workbooks + 23 TSV extracts + `proof_of_mailing.tsv` (a *second* proof-of-mailing extract alongside `ffs_proof_mailing.tsv`).
- **Credentials** — `master-reference.{md,csv}`, `_passwords.local.csv`, `master-reference-full.{md,csv}`, `_Signatures/` (browser password dumps moved out 2026-10-07).

---

## Section D — Three-way contrast matrix

| Concept | FileCabinet (dir) | TMAR GUI | Sheet / GAS | Status |
|---|---|---|---|---|
| Physical document root | `C:\Users\rhyme\Desktop\FileCabinet\` | `VAULT_ROOT` (html:54552) = same | `FILECABINET_BASE_PATH_` (Code.gs:32) = same | ✅ aligned |
| Document-location pointer | actual 24-folder taxonomy | Vault Browser tree = **"Trust-Records"** (html:54131) | Master Register `Document Location` (col W) = **"Trust-Records/Accounts/…"** | 🔴 **dead tree, both sides** |
| Account grouping | `06-Account-Register/<Institution>/` (flat, institution-first) | — | FWM Master Index `Binder Section` (category-first) | 🔴 **orthogonal groupings** |
| Master Register columns | (n/a) | 29-col CSV export (html:33293) | 29-col (TMARBridge) **vs 27-col `master_register.tsv`** | 🔴 TSV drops `Tags` + `Discovery Status` |
| Account Type vs Subtype | — | — | F (Type) often blank; G (Subtype) carries the 89-item list; dropdown code still maps to **35-col positions** | 🔴 F/G confusion + stale 35-col |
| FWM Binder Tab | **no equivalent folder** | "7-Part, 11 Binder Tabs" (html:14919) | 4 different enumerations | 🔴 **4-way enum drift; absent from dir** |
| Users | `Clinton`, `Syrina` | — | `Clint, Syrina, Joint, Trust, Business, Other` | 🟠 "Clint" ≠ "Clinton" |
| Credit reports | `Credit-Reports/Clinton`, `Syrina` | — | (n/a) | ✅ fixed same-day |
| Tax forms | `04-Taxes/<Person>/<Year>/` | — | `1099 Filing Chain` tab | ✅ concept shared, no 1:1 path link |
| Proof of Mailing | `01-Mailings/Postal/{…}` | — | `Proof of Mailing` tab (14 cols) + 2 TSVs | 🟠 2 TSVs, no dir↔tab link |
| Document Registry | (scanner output) | — | `Document Registry` tab (10 cols A–J); paths = Mac `…` + "FileCabinet 2" | 🔴 stale paths |
| Receipts | `01-Mailings/Postal/` (canonical) + `00-Receipts-Invoices/Postal/` (draining) | — | — | 🟠 split across two folders |
| Trust instruments | `05-Estate & Trust/Estates/<Estate>/<DocType>/` | `page-trust`, FWM presets | `Forms & Authority`, `Trust Ledger` | 🟠 no path convention shared |

---

## Section E — Mismatches / gaps, ranked by impact

1. 🔴 **`Document Location` pointer encodes a dead taxonomy** — MR-001…MR-010 hold `Trust-Records/Accounts/<Institution>/` and `Trust-Records/Government-Records/SSA-Earnings/`; MR-011+ are empty. No `Trust-Records/` folder exists. The GUI Vault Browser reproduces the same dead tree.
2. 🔴 **FWM Binder Tab is four incompatible vocabularies** (dropdown vs Forms & Authority vs Document Inventory vs Binder Tab Guide) — and the directory has no binder-tab dimension at all.
3. 🔴 **Account Type (F) vs Subtype (G) + stale 35-col validation** — `Code.gs applyDataValidation()` still writes dropdowns to 35-col positions (7/11/20/18/35) against the live 29-col sheet.
4. 🔴 **29-col schema vs 27-col `master_register.tsv`** — the extract drops `Tags` + `Discovery Status`.
5. 🔴 **Directory institution-first vs FWM/Sheet category-first** — same accounts, two orthogonal groupings, no bridge.
6. 🔴 **Document Registry / Inventory path rot** — Mac `/Users/animatedastronaut/…` paths + source dir `FileCabinet 2`.
7. 🟠 **`pushEntities_` is 14 fields, not 10** (brief/memory stale).
8. 🟠 **Loose files at roots + misspellings + orphan folders** (largely resolved same-day; see §F status).
9. 🟠 **Naming variance** — `Clint` (sheet Users) vs `Clinton` (dir); `Clints`/`Rinas` (fixed).

---

## Section F — Enhanced framing (proposed revised taxonomy + move list)

> **Execution status (2026-10-07, same-day — verified on disk by this audit):**
> - **#8** `undated/DLSS.pdf` → `03-Banking/Clinton/ID-Copies/` ✅ (orphan `undated/` removed)
> - **#13** `01-Mailings/Recieved Letters` → `Received Letters` ✅
> - **#14** `Biblical Princepals` → `Biblical Principals` ✅ — **spelling corrected**: the content is "powers and principalities" (Eph 6:12), not "principles"; the table below still reads "Principles" and is superseded on this one item.
> - **#18** `Credit-Reports/Clints` → `Clinton`, `Rinas` → `Syrina` ✅
> - **#1 (new)** three plaintext browser password dumps (`Brave Passwords.csv`, `Chrome Passwords.csv`, `Proton Pass_export_*.csv`) moved OUT of the Proton-synced tree → `C:\Users\rhyme\Documents\_offline-credentials\`.
> - **#3/#4 (new)** 3 `DOC-0081_*__RECOVERED` near-duplicates (md5-verified distinct) quarantined to `Archive/Duplicates/`; 3 `.bak` files (2× DS-11 pre-font + 1× passport letter) moved to `Archive/`.

### F.1 Design principle

Adopt **one canonical "Document Location" path grammar** of the form `<top-level>/<…>` rooted at the 24-folder taxonomy, and make **three systems read it from the same source**: (1) Master Register col W → a relative FileCabinet path per account; (2) GUI Vault Browser → drop the hardcoded `Trust-Records` JSON, render the live `Document Registry` scan; (3) `Document Registry` / `Document Inventory` → re-scan from current roots (the normalizer already supports all three machines).

### F.2 Canonical account-location mapping (proposed)

| Account class | `Document Location` value (col W) |
|---|---|
| Bank/investment account (statements, agreements) | `03-Banking/<Person>/<Institution>/<Year>/` |
| Auto loan | `03-Banking/<Person>/<Lender>/` |
| Demand/affidavit/UCC package | `06-Account-Register/<Institution>/` |
| Tax form (1099/5498/W-2) for the account | `04-Taxes/<Person>/<Year>/` |
| Credit report | `Credit-Reports/<Person>/` |
| Trust instrument | `05-Estate & Trust/Estates/<Estate>/<DocType>/` |

### F.3 Reconcile FWM "Binder Section" vs institution-first

Keep the directory institution-first (stable, matches `06-Account-Register/<Institution>/`); introduce a cross-reference sheet (already half-present as `ffs_master_index.tsv`) mapping `Institution → Tab # → Binder Section → EIN → Audit Account #`. Do not re-arrange into category-first folders.

### F.4 Concrete rename / move list

Legend: **MUTABLE** = forward-facing template/working/metadata, safe to move. **HISTORICAL** = as-furnished evidence, leave in place.

| # | Item | Action | Class |
|---|---|---|---|
| 1 | Master Register `Document Location` (MR-001…MR-010) `Trust-Records/…` → live paths per F.2 | Rewrite column W values | MUTABLE |
| 2 | Back-fill empty `Document Location` (MR-011+) from F.2 map | Populate column W | MUTABLE |
| 3 | GUI Vault Browser JSON `Trust-Records` tree (html:54131, 54082+) | Replace with live `Document Registry` scan render | MUTABLE |
| 4 | `master_register.tsv` (27-col) | Regenerate as 29-col (add `Tags`, `Discovery Status`) | MUTABLE |
| 5 | `Code.gs applyDataValidation()` 35-col positions (7/11/20/18/35) | Correct to 29-col (F=5, H=7, O=14, M=12, AC=28) + fix `DROPDOWN_VALUES_GUIDE.md` letter map | MUTABLE |
| 6 | FWM Binder Tab enum | Pick **one** (recommend the 11-tab dropdown list); rewrite the 3 divergent in-sheet lists | MUTABLE |
| 7 | `Document Registry` / `Document Inventory` Mac paths + "FileCabinet 2" | Re-run `scripts/scan_filecabinet_registry.py` → `ImportRegistryScan` FULL REPLACE | MUTABLE |
| 8 | `undated/DLSS.pdf` → `03-Banking/Clinton/ID-Copies/` | ✅ DONE | MUTABLE |
| 9 | `04-Taxes/_enhanced_status_report_2026-08-08.md` | → `Archive/Dev_Logs/` | MUTABLE |
| 10 | `02-Recorded-Documents/` 3 loose 8822-B files | → `Filing Packages/APPCRLT_AddressChange_reqN/` (+ `_MANIFEST.md`) | MUTABLE |
| 11 | `06-Account-Register/` loose files | → `_Templates/` or `08-Ledgers/Vendor-Datasets/` | MUTABLE |
| 12 | `00-Receipts-Invoices/Postal/` | Merge into `01-Mailings/Postal/` (receipt pass delegated to mailing-log agent) | MUTABLE |
| 13 | `01-Mailings/Recieved Letters` → `Received Letters` | ✅ DONE | MUTABLE |
| 14 | `07-Source-Documents/Biblical Princepals` → `Biblical Principals` | ✅ DONE (spelling corrected) | MUTABLE |
| 15 | `07-Source-Documents/notices affidavit` | → `Legal-Reference/Affidavits/` | MUTABLE |
| 16 | `Business/` loose PDFs | → `Business/<Entity>/` or `Legal-Reference/UCC/` | MUTABLE |
| 17 | `Legal-Reference/` loose files | → `Legal-Reference/<Category>/` | MUTABLE |
| 18 | `Credit-Reports/Clints` → `Clinton`; `Rinas` → `Syrina` | ✅ DONE | MUTABLE |
| 19 | `Archive/` 5 × `…TMAR).xlsx.bak-*` | → `Archive/Duplicates/` or prune | MUTABLE |
| 20 | `Users` dropdown `Clint` | → `Clinton` (or document "Clint" as canonical) | MUTABLE |
| 21 | Bank statements, filed returns, credit reports as furnished, recorded instruments, IRS/NCDOR correspondence as-received | Leave in place | HISTORICAL |

### F.5 Proposed top-level taxonomy (unchanged from current, plus two fixes)

1. Fold `undated/` → `03-Banking/Clinton/ID-Copies/` ✅ (done).
2. Make `Document Location` (col W) the single join field tying `Master Register` → `Document Registry` → physical folder, replacing the dead `Trust-Records` grammar.
3. Standardize the FWM Binder-Tab enum so `Forms & Authority`, `Document Inventory`, `Proof of Mailing`, and `Trust Ledger` share one vocabulary.

---

*Sources: `gas/SyncCenter.gs`, `gas/TMARBridge.gs`, `gas/Code.gs`, `gas/ImportRegistryScan.gs`, `gas/PopulateValidation.gs`, `gas/TabConsolidationAudit.gs`, `gas/ScanDriveFileCabinet.gs`, `gas/TMAREngine.gs`, `TMAR-Accrual-Ledger.html`, `Digital-Binders/*.tsv`, `Digital-Binders/Freeway_Filing_System_*.xlsx`, skills `file-vault-organization` and `tmar-mailing-log-maintenance`.*
