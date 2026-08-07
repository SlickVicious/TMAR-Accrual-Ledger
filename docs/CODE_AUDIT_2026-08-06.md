# Code Audit Report — TMAR Accrual Ledger
**Date:** 2026-08-06 | **Auditor:** Hermes Agent (law profile) | **Thoroughness:** Standard

---

## Executive Summary

- **Overall health score:** **58/100** (needs attention)
- **Critical issues:** 3
- **High-priority issues:** 7
- **Medium-priority issues:** 11
- **Top 3 priorities:**
  1. **Schema drift breaking data integrity** — SheetsService.js (JavaScript) uses 35-column schema that was corrected to 29 columns in TMARBridge.gs on 2026-08-03 but never synced back to JS sources. Every `readMasterRegister()`, `writeMasterRegisterAccount()`, `accountToRow()`, and `rowToAccount()` in the JS layer operates on wrong column offsets.
  2. **Test suite is broken** — jest-29.7.0 fails to install (dependency conflict with jspdf→dompurify), 0% coverage verifiable. Four test files exist but cannot be executed.
  3. **Critical NPM vulnerability** — dompurify ≤3.4.11 (transitive via jspdf 2.5.1) has 17 published XSS CVEs. jspdf 4.2.1 would fix but requires migration.

---

## Metrics

| Metric | Count |
|---|---|
| Files analyzed | 259+ (excluding gitignored/node_modules) |
| Lines of code | ~205,000 across .js/.html/.gs/.mjs |
| JavaScript (src/) | 22 files, 9,387 lines |
| Google Apps Script (gas/) | 36 files, 22,598 lines |
| HTML (app+tools) | 27 files, 120,751 lines |
| Main single-file app | 3,813 KB, 55,163 lines |
| Documentation (.md) | 130 files, 34,429 lines |
| Production dependencies | 2 (html2canvas, jspdf) |
| Dev dependencies | 5 (jest, jsdom, testing-library, playwright) |
| Test files | 4 files, ~716 lines of tests |
| Test coverage (verified) | 0% (suite broken) |
| Complexity hotspot | TMAR-Accrual-Ledger.html (55K lines in single file) |

---

## Findings by Category

### 1. Architecture & Design

#### 🔴 Critical — Schema drift between JS and GAS layers

- **SheetsService.js:8** — `MASTER_REGISTER_SCHEMA` defines **35 columns** (indices 0–34):
  ```js
  export const MASTER_REGISTER_SCHEMA = {
    ROW_ID: 0, DATE_ADDED: 1, PROVIDER: 2, MAILING_ADDRESS: 3,
    PROVIDER_EIN: 4, ACCOUNT_NUMBER: 5, ...
    DISCOVERY_STATUS: 34   // AI: Discovery Status
  };
  ```
- **TMARBridge.gs:142** (corrected 2026-08-03) — `addTMARAccount()` writes a **29-column** row (A–AC), with completely different field positions. `readMasterRegisterAccounts_()` at TMARBridge.gs:211 still reads *35* columns via `getRange(2,1,lastRow-1,35)` but maps them to the old 35-column indices.
- **Impact:** Every JS-to-GAS round-trip through SheetsService silently corrupts column positions. `addAccount()` → `writeMasterRegisterAccount()` writes 35 values to a 29-column schema. `readMasterRegister()` maps the wrong columns into account objects.
- **Recommendation:** Freeze the canonical schema in ONE place (either GAS or JS), update the other side to match, and add a runtime schema-version check on every read.

#### 🔴 Critical — 55K-line monolithic single-file HTML application

- **TMAR-Accrual-Ledger.html:55,163 lines, 3,813 KB** — 246 functions, 19 agents, LLM streaming, DOM rendering, CORS proxy routing, and full application logic in one file.
- **Impact:** Impossible to review, diff, or maintain. No modularization boundaries. Any change risks cascading breakage. Git diffs for this file are unreadable.
- **Recommendation:** Break into ES modules served via `<script type="module">` or a build step (Vite/Rollup). Minimum: extract agents, DOM rendering, API layer, and utility functions into separate files.

#### 🟡 Medium — Dual source-of-truth pattern without sync enforcement

- The CLAUDE.md explicitly states that two pairs live in "two synced places": fiduciary doc factory (`.claude/skills/` ↔ `DOCUMENT_KNOWLEDGE.fiduciaryDocFactory` inline in HTML) and ledger topology (`.claude/docs/data-topology.md` ↔ `DOCUMENT_KNOWLEDGE.ledgerTopology` inline in HTML). There is no automated verification that these pairs are in sync.
- **Impact:** Divergence risk between docs and injected prompts. Agents using stale knowledge.
- **Recommendation:** Add a CI/lint step that diffs the source-of-truth against the HTML-embedded copies and fails on mismatch.

#### 🟡 Medium — Mixed concern: Obsidian vault + Git repo + GAS project

- The same directory is an Obsidian vault (.obsidian/ config), a Git-tracked JavaScript project, and the deployment source for a Google Apps Script project (gas/ with .clasp.json).
- **Impact:** Tooling conflicts (Obsidian plugins auto-modify files, git sees changes; .gitignore must be maintained across all three surfaces). New contributors face steep onboarding.
- **Recommendation:** Document the triple-role architecture explicitly. Consider a pre-commit hook that warns if Obsidian config files are staged.

#### 🟢 Low — Unused service files

- **InvoiceService.js (204 lines)** and **PayrollService.js (247 lines)** are fully implemented but are not referenced by any consumer in the codebase. `src/index.js` imports them but they are never called by the main HTML app or GAS bridge.
- **Impact:** Dead code that adds maintenance burden and test surface without value.
- **Recommendation:** Either wire them into the app or archive them.

---

### 2. Code Quality

#### 🔴 High — 35-column schema still referenced in active JS code

- **SheetsService.js:8,98,155,219** — Every method uses 35 as the column count. The real schema was corrected to 29 columns. This is the same issue as Architecture finding #1, classified here as a code quality defect because the fix is a simple constant update — but it hasn't been done.
- **Recommendation:** Update `MASTER_REGISTER_SCHEMA` and all dependent row indices to match the 29-column schema documented in `domain-models.md` and implemented in TMARBridge.gs:addTMARAccount().

#### 🟡 Medium — 70 `console.log/warn/error` calls remain in production JavaScript

- **tt_block.js:49 occurrences** — a 49-location log surface, likely from the Transcript Transformer block embedded in the main app.
- **src/index.js:2**, **SheetsService.js:1**, **StateManager.js:1**, **LocalStorage.js:7** — straightforward log patterns.
- **Impact:** Console logs in production leak internal state and slow execution in the browser. The Transcript Transformer block (tt_block.js) being the worst offender.
- **Recommendation:** Wrap console calls behind a debug flag, strip in production build, or use a logging framework with levels.

#### 🟡 Medium — 7 TODO/FIXME/HACK markers in active code

- **TMARService.js:1** — TODO in comment (unclear what)
- **SheetsService.js:2** — TODO items
- **tt_block.js:1** — one FIXME
- **backup_20260228/CreditReportImport.js:2** — archived but indicates recent tech debt
- **Recommendation:** Either resolve or promote to tracked issues. Archived backup files should be cleaned.

#### 🟡 Medium — 1,049 `.innerHTML =` assignments across HTML files

- **TMAR-Accrual-Ledger.html:445** — the main app alone has 445 direct innerHTML assignments. The GAS HTML dialogs (GAAPInterface:10, ControlPanel:7, EINVerifier:6, etc.) contribute to the rest.
- **Impact:** While most are against trusted strings, this pattern is a recognized XSS vector if any user-controlled data flows through. The sheer volume makes auditing impossible.
- **Recommendation:** Audit the 445 assignments in the main app for any that receive user input or API responses. Replace with `textContent` where only text is needed, and use DOMPurify (already in the dependency tree as a jspdf transitive) for HTML content.

#### 🟢 Low — `substr()` deprecation

- **AccountService.js:72, TransactionService.js:71, InvoiceService.js:86, PayrollService.js:66** — `String.prototype.substr()` is used for generating random ID suffixes. This method is deprecated (MDN marks it as "avoid").
- **Recommendation:** Replace with `String.prototype.substring()` or `String.prototype.slice()`.

#### 🟢 Low — Inconsistent ID generation strategies

- Accounts use `ACC-` prefix (AccountService.js), Master Register uses `MR-` prefix (SheetsService.js), Transactions use `TXN-` (TransactionService.js), Invoices use `INV-` (InvoiceService.js), Employees use `EMP-` (PayrollService.js). Five different ID strategies with no shared factory.
- **Recommendation:** Centralize ID generation into a shared utility.

---

### 3. Security

#### 🔴 Critical — NPM dependencies have known XSS vulnerabilities

- **dompurify ≤3.4.11** (transitive via `jspdf ^2.5.1`) — 17 published CVEs for XSS bypasses.
- **jspdf ≤4.2.0** — directly affected.
- **Impact:** If any user-supplied content is rendered through jspdf (PDF export), XSS is possible.
- **Recommendation:** `npm audit fix --force` to upgrade jspdf to 4.2.1 (breaking change — verify PDF export still works). If jspdf 4.x migration is too large, pin dompurify separately at latest and test.

#### 🟡 Medium — API key in localStorage, not HTTP-only

- The CORS proxy key and API keys are stored in browser `localStorage`. Any XSS on the page can exfiltrate them.
- **Impact:** localStorage is accessible to all JavaScript running on the origin, including any injected scripts.
- **Recommendation:** For the CORS proxy key, consider session-only storage. At minimum, document that keys stored in localStorage are susceptible to XSS exfiltration.

#### 🟡 Medium — No input sanitization on JSON import

- **TMARService.js:370-398** — `importFromJSON()` parses arbitrary JSON and directly sets it as application state without validation of individual fields beyond checking that `accounts` is an array.
- **Impact:** Malformed JSON (injected balances, XSS payloads in names/notes) can corrupt the Master Register.
- **Recommendation:** Validate each account object through `AccountService.validateAccount()` before ingestion, and sanitize string fields.

#### 🟢 Low — GAS innerHTML usage is controlled but not audited

- **gas/Code.gs:3124-3131** — Three innerHTML assignments for status messages, using only hardcoded strings and `.error.message`. Low risk but non-zero.
- **Recommendation:** Replace with `textContent` where possible.

#### 🟢 Low — GAS SyncCenter.gs API key gate is well-implemented

- **SyncCenter.gs** — `checkApiKey_()` is properly applied to all doGet/doPost actions except `ping`. Credentials are stripped at the GAS layer. This is a positive finding — the authentication model is sound.

---

### 4. Performance

#### 🟡 Medium — No build step for the 3.8 MB main application

- The entire app is served as a single 3,813 KB HTML file with no minification, tree-shaking, or code splitting.
- **Impact:** First-load time is dominated by parse/compile of 55K lines of JavaScript. On slow connections, this is seconds of blank screen.
- **Recommendation:** Add a Vite or Rollup build step that splits the application into chunks with dynamic imports. At minimum, minify the JavaScript.

#### 🟡 Medium — DOM reflows from 445 innerHTML assignments

- Each `innerHTML =` forces the browser to parse HTML, reconstruct the DOM subtree, and recalculate layout. The main app has 445 of these.
- **Impact:** Cumulative layout thrashing during account list rendering, dashboard updates, and agent responses.
- **Recommendation:** Batch DOM updates using `DocumentFragment` or a virtual DOM approach. The LLM streaming UI is the most visible hotspot.

#### 🟢 Low — No lazy loading for tools/

- Seven standalone HTML tools (~2 MB combined) in `tools/` are loaded eagerly via iframes or direct navigation, not on-demand.
- **Impact:** None — these are separate pages navigated to independently, not loaded with the main app.
- **Recommendation:** N/A — current approach is fine for tools that are separate pages.

#### 🟢 Low — GAS reads entire sheet on every operation

- **readMasterRegisterAccounts_()** at TMARBridge.gs:211 reads `getRange(2,1,lastRow-1,35)` — the entire Master Register — on every dashboard load. For ~150 rows this is fast, but will degrade linearly.
- **Impact:** Minimal today (<1s for 150 rows). Becomes relevant at 1,000+ rows.
- **Recommendation:** Consider caching with `CacheService` for reads, invalidated on writes.

---

### 5. Testing

#### 🔴 Critical — Test suite is non-functional

- **Jest 29.7.0 fails to install** due to a dependency conflict between jspdf → dompurify. The `npm install` output shows only 21 packages installed (html2canvas + jspdf + their deps), but jest and its 200+ transitive dependencies are missing.
- **Four test files exist** (716 lines of tests across AccountService, StateManager, TMARService, TMARInspectorService) with good coverage patterns — but **zero can be executed**.
- **Impact:** No regression safety net. Any change to src/ services has no automated verification.
- **Recommendation:** Resolve the jspdf→dompurify conflict first, then verify tests pass. This is the single highest-impact fix for long-term maintainability.

#### 🟡 Medium — Coverage threshold defined but unenforceable

- **package.json:46-52** — Jest is configured with 70% coverage thresholds across branches, functions, lines, and statements. The `src/` directory is properly scoped. But since tests can't run, the thresholds are aspirational.
- **Recommendation:** Once tests are executable, run `npm run test:coverage` and adjust thresholds to match reality before ratcheting up.

#### 🟡 Medium — Missing test files for three services

- **TransactionService.js (232 lines)** — no `TransactionService.test.js` exists, despite 8 exported functions with complex logic (net income calculation, date filtering, category grouping, monthly spending).
- **InvoiceService.js (204 lines)** — no test file. 10 exported functions including tax calculation and revenue aggregation.
- **PayrollService.js (247 lines)** — no test file. 8 exported functions including progressive tax bracket calculation and SS wage base logic — these have real dollar impacts if wrong.
- **Impact:** The three most business-critical services (money math) are completely untested.
- **Recommendation:** Write tests for all three, prioritizing PayrollService (progressive tax brackets are error-prone) and TransactionService.

#### 🟢 Low — Existing test quality is good

- **AccountService.test.js (251 lines)** — 16 tests covering validation, creation, aggregation, filtering, searching, and immutable updates. Tests both happy paths and error cases.
- **StateManager.test.js (126 lines)** — 10 tests covering initialization, immutability, observer notification, unsubscribe, error isolation, and factory function.
- **TMARService.test.js (254 lines)** — 14 tests covering initialization, CRUD, financial summary, search, and JSON import/export. Properly mocks localStorage.
- **TMARInspectorService.test.js (85 lines)** — 4 tests covering function registration, instrumentation, and report generation.
- **Positive finding:** The test patterns are solid — pure functions, no DOM, clear arrange-act-assert. The tests that exist are well-written.

---

### 6. Maintainability

#### 🟡 Medium — 130 markdown documentation files with drift risk

- The `docs/` directory has 34 markdown files (14,505 lines). Many are handoff notes, implementation plans, and revision-specific documents that may be stale. The `GSheet/` directory duplicates some content from docs/ and `_archive/`.
- **Impact:** A new developer doesn't know which docs are current vs. historical. Time is wasted cross-referencing.
- **Recommendation:** Add "Last Verified: YYYY-MM-DD" frontmatter to all docs. Archive docs older than 6 months that describe completed work. Tag docs as `current`, `historical`, or `draft`.

#### 🟡 Medium — 36 GAS files with no module system

- Google Apps Script has no native `import`/`export`. 36 `.gs` files share a global namespace via file load order. Function name collisions would silently clobber.
- **Impact:** Adding a new `.gs` file requires auditing all existing files for name conflicts. The `RunnableFunctionsAllowlist.gs` and `PopulateAppScriptsInventory.gs` files attempt to catalog this but are themselves part of the problem.
- **Recommendation:** Document the load order and naming convention explicitly. Consider migrating to clasp with ES modules (if supported by newer Apps Script runtime) or using a namespace prefix convention.

#### 🟡 Medium — No CI/CD

- CLAUDE.md states "No CI/CD — run `npm test` locally before pushing HTML changes." Since `npm test` is broken, even the manual gate doesn't work.
- **Impact:** No automated quality enforcement. The schema drift between JS and GAS layers would have been caught by a simple CI test that validated column counts.
- **Recommendation:** Add GitHub Actions for: (a) `npm test` on push, (b) schema validation script, (c) linting. This is a one-time setup with lasting ROI.

#### 🟡 Medium — CLAUDE.md is 350+ lines

- The project context file is comprehensive but verbose. Some entries are historical (e.g., "backup_20260228" references, old schema notes) and may mislead if read without cross-referencing.
- **Impact:** Agents (both human and AI) spend time parsing stale information.
- **Recommendation:** Trim to current-state facts. Move historical entries to a `HISTORY.md` changelog.

#### 🟢 Low — `gas/TMAR_AestheticsAndAudit.gs` is superseded but not archived

- CLAUDE.md documents this as superseded by FormattingComplement.gs. It still exists in the active `gas/` directory and is loaded by clasp.
- **Impact:** Functions loaded but never called. Poses a name-collision risk.
- **Recommendation:** Move to `gas/_superseded/` or delete.

#### 🟢 Low — Good conventions exist

- **Positive finding:** The project has well-documented conventions: immutability for service functions, colon-hyphenated name format, 10pt TNR for fiduciary docs, DOC-ID registry system, GPO 2016 editorial rules. These are explicitly stated and consistently followed.

---

## Prioritized Action Plan

### Quick Wins (< 1 day)

| # | Action | Effort | Impact |
|---|---|---|---|
| 1 | **Fix the schema drift** — Update `SheetsService.js` MASTER_REGISTER_SCHEMA to 29 columns matching TMARBridge.gs | 2h | Data integrity |
| 2 | **Fix test suite** — Resolve jspdf→dompurify conflict, verify all 4 test files pass | 2h | Safety net restored |
| 3 | **Fix NPM vulnerabilities** — `npm audit fix --force` and verify PDF export | 1h | Security |
| 4 | **Remove dead code** — Archive unused InvoiceService/PayrollService or wire them in | 1h | Clarity |
| 5 | **Archive TMAR_AestheticsAndAudit.gs** — Move to `gas/_superseded/` | 15m | Clarity |

### Medium-term Improvements (1–5 days)

| # | Action | Effort | Impact |
|---|---|---|---|
| 6 | **Write tests for TransactionService, InvoiceService, PayrollService** | 8h | 100% service coverage |
| 7 | **Add CI/CD pipeline** — GitHub Actions for test, lint, schema validation | 4h | Continuous quality |
| 8 | **Centralize ID generation** — One shared utility for ACC-/MR-/TXN-/INV-/EMP- IDs | 2h | Consistency |
| 9 | **Audit innerHTML usage** — Replace with textContent where safe, DOMPurify where HTML needed | 4h | Security |
| 10 | **Clean up console.log** — Wrap behind debug flag, strip tt_block.js logs | 2h | Performance |
| 11 | **Resolve TODO/FIXME markers** — Promote to tracked issues | 1h | Tech debt |

### Long-term Initiatives (> 5 days)

| # | Action | Effort | Impact |
|---|---|---|---|
| 12 | **Split TMAR-Accrual-Ledger.html** — Extract into ES modules with build step | 3–5d | Maintainability |
| 13 | **Add schema version check** — Runtime validation on every GAS↔JS data transfer | 1d | Data integrity |
| 14 | **Automate dual-source sync** — CI step that diffs `.claude/` ↔ `DOCUMENT_KNOWLEDGE` | 1d | Prevent drift |
| 15 | **Documentation audit** — Tag all docs as current/historical/draft, archive stale ones | 2d | Onboarding |

---

## Appendix: File Inventory

### Source code (src/)
```
src/index.js                        69 lines  — Entry point, exports services
src/services/AccountService.js     175 lines  — Account CRUD, validation, search
src/services/TransactionService.js 232 lines  — Transaction CRUD, net income, grouping
src/services/TMARService.js        399 lines  — High-level orchestrator, Sheets bridge
src/services/SheetsService.js      363 lines  — Google Sheets read/write, mock data
src/services/InvoiceService.js     204 lines  — Invoice CRUD, tax calculation (UNUSED)
src/services/PayrollService.js     247 lines  — Payroll tax calculation (UNUSED)
src/services/TMARInspectorService.js 293 lines — Function cataloging, monitoring
src/storage/LocalStorage.js        148 lines  — localStorage wrapper
src/utils/StateManager.js           87 lines  — Observer-pattern state manager
```

### Tests (src/__tests__/)
```
AccountService.test.js      251 lines  — 16 tests ✓ (well-written)
StateManager.test.js        126 lines  — 10 tests ✓ (well-written)
TMARService.test.js         254 lines  — 14 tests ✓ (well-written)
TMARInspectorService.test.js 85 lines  —  4 tests ✓ (well-written)
```

### Google Apps Script (gas/)
```
Code.gs                  3,576 lines  — onOpen menu, CSV import, data pull
SyncCenter.gs            2,522 lines  — doGet/doPost, pushEntities, pushForm2848, pushForm1040
GUIFunctions.gs            530 lines  — Dialogs, sidebars, data query functions
TMARBridge.gs              349 lines  — Financial summary, addAccount, search
FormattingComplement.gs    604 lines  — Tab colors, validation, conditional formatting
ReconcileCrossFill.gs      120 lines  — Cross-tab reconciliation
PopulateProofOfMailing.gs  127 lines  — Proof of mailing sheet population
ImportRegistryScan.gs     ≈200 lines  — Registry scan import
PopulateAppScriptsInventory.gs ≈140 lines — Function catalog
DuplicateAnalyzer.gs      ≈350 lines  — Account duplicate detection
+ 26 more utility scripts
```

### HTML tools (tools/)
```
TMAR-Accrual-Ledger.html          3,813 KB  — Main application (55,163 lines)
tools/TMAR-Ecosystem-Navigator.html   38 KB  — Mermaid navigator (12 tabs)
tools/GAAP-source.html               — GAAP source viewer
tools/upstream-GAAP.html             — Upstream GAAP interface
tools/Universal-Process-Tracker.html — Process tracking dashboard
tools/TMAR_Audit_Dashboard.html      — Audit dashboard
tools/TMAR-System-Status-Dashboard.html — System status
tools/tmar-transcript-transformer-v2.html — Transcript Transformer
tools/_eon_fixes.html                — EON fixes page
tools/TMAR-Architecture-Diagram.html — Architecture diagram
```

---

*Generated by Hermes Agent (law profile) via code-auditor skill. Findings based on static analysis of 259+ files. Test coverage data unavailable due to broken test suite.*
