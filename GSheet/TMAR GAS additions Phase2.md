Here's what I found and fixed:

---

## The Problem

The Apps Script project isn't a single file — it's a **multi-file project** deployed from `TMAR/gas/` via `clasp push`. The directory contains:

|File|Lines|Purpose|
|---|---|---|
|`Code.gs`|3,119|Main menu, formatting, year selector, gap scanner, CPA, import tools|
|`SyncCenter.gs`|**1,002**|**← NEW: Phase 1 sidebar + Phase 2 Web App Bridge**|
|`CreditReportImport.gs`|842|Credit report import|
|`DuplicateAnalyzer.gs`|616|Duplicate detection|
|`GUIFunctions.gs`|530|GUI helpers|
|`PopulateValidation.gs`|411|Validation data|
|`TMARBridge.gs`|341|Dashboard, Add Account, Financial Summary|
|`ExecuteCleanup.gs`|311|Cleanup functions|
|+ 7 `.html` files|—|Sidebars & dialogs|

In the previous session, all Sync Center code was added to `06 Toolkit/Scripts/GAS/apply_master_register_formatting.gs` (a separate reference file), but **never put into the clasp deployment directory**. So the code was never deployed to your Google Sheet.

## What I Fixed

1. **Created `SyncCenter.gs`** (1,002 lines) in `TMAR/gas/` — contains all 22 functions:
    
    - Phase 1: `showLedgerImportDialog`, `importFromLedger`, 4 import handlers
    - Phase 2: `doGet`, `doPost`, 10 helpers, 4 push wrappers
2. **Updated `Code.gs`** — added the "Import from Accrual Ledger..." menu item under Import Tools
    
3. **Updated docs** — DEPLOYMENT_GUIDE, SYNC_CENTER_DEPLOYMENT_COMPLETE, UNIFIED_MENU_README all now reflect the correct multi-file project structure
    

## How to Deploy

Run these commands to push everything to your Apps Script project:

```bash
cd "/Users/animatedastronaut/Documents/Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR/gas"
clasp push
```

Then to enable Live Sync:

1. Open your TMAR Google Sheet → **Extensions → Apps Script**
2. Verify you see `SyncCenter` in the file list on the left
3. Click **Deploy → New deployment → Web App**
4. Set **Execute as: Me**, **Access: Anyone** → Deploy
5. Copy the Web App URL → paste into Accrual Ledger's Sync Center → Test Connection

---

## Phase 3 — Artifactory Bridge Endpoints (2026-05-06) ✅

4 new `doPost` actions added to `SyncCenter.gs` as part of cross-agent
Artifactory ↔ TMAR data pipeline. Translation layer lives client-side
in Artifactory's React orchestrator; GAS receives clean contract payloads.

| Function | Action Key | Target Sheet | Cols |
|----------|-----------|-------------|------|
| `pushSubstituteW2_()` | `importSubstituteW2` | W-2 & Income Detail | 15 |
| `pushForm1040_()` + `ensureForm1040Sheet_()` | `importForm1040` | 1040 Submissions* | 24 |
| `pushForm2848_()` | `importForm2848` | Forms & Authority | 10 |
| `pushScheduleA_()` | `importScheduleA` | Schedule A* | 12 |

*Tab auto-created with headers + frozen row if absent.

**SSN policy:** All SSNs must be masked to `XXX-XX-1234` client-side before POST.
**Content-Type:** All fetches use `text/plain` (not `application/json`) to avoid CORS preflight.

Active exec URL (updated 2026-05-06):
`https://script.google.com/macros/s/AKfycbzpeegvE52lvqCTMyKrsdaa_4JFfjM6MQrsJkU8zb17fkUJzPRasUU0fjONdaHkM5dh/exec`

Full payload contracts: `C:\Users\rhyme\Documents\Agent-Bridge\API_CONTRACT.md`