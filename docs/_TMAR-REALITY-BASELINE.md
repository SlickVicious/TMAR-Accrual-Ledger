# TMAR Reality Baseline

> **AUTO-GENERATED** by `scripts/tmar-reality-baseline.py`. Do not hand-edit — regenerate.
> This file is the machine-readable snapshot of the *current* TMAR reality that other
> docs are reconciled against. When code changes, re-run the extractor and re-scan docs.

**Generated:** 2026-10-29
**App:** `TMAR-Accrual-Ledger.html` — 4,177,510 bytes (~4.18 MB), 61,536 lines
**Title:** TMAR Universal Accrual Ledger

---

## 1. Workbook (Google Sheets)

35 visible tabs across 10 HUB sections (source of truth: `gas/WorkbookReorg.gs` → `HUB_SECTIONS_`):

| Section | Visible tabs |
|---|---|
| Index & Dashboard | 📋 HUB INDEX · 📋 Dashboard · Live Dashboard · Checks |
| Core Registers | Lists · Accounts · Statements · Entities · Master Register · TIN Registry · Chart of Accounts |
| Ledgers & Accounting | Transactions · Ledgers · Journal · Cash Flow · Tax Lines |
| Income & Assets | W-2 & Income Detail · Asset & Investment Accounts |
| Tax & 1099 | Schedule A · 📄 Tax Forms · 1099 Filings |
| Contacts & Accounts | Contacts · Website Accounts · Business Obligations · Subscriptions & Services |
| Mailings & Authority | Proof of Mailing · Tab 5 — Minutes & Resolutions O |
| Trust Instruments | 📜 Trustee Resolutions · 📦 Asset Transfer Log · Valuations |
| Documents | Document Inventory · Document Registry · AppScripts Canvas & Workflow Board |
| Reference | AppScripts · Script Executions |

NOTE: total tab count (incl. hidden) is workbook runtime state, not derivable from the
repo. `listWorkbookTabs` returns the live count; the standing figure is 57 (28 visible + 29 hidden).

---

## 2. GAS Web App — 130 doGet/doPost actions


`analyzeDuplicates · appendToArchive · applyFreewayAesthetic · applyMasterRegisterSpec · applyStandardHeader · applyVisualStandard · archiveTabs · archiveWorkbook · backfillAuditAccounts · backfillTINRegistry · buildExternalTabs · buildMasterIndex · cleanupWorkbook · clearBalanceValidation · consolidateGuides · dedupeAcctLedger · dedupeMasterRegister · deleteCreditorDetail · deleteForm1040 · deleteMasterRegister · deletePrincipalRegister · deleteSheetsByName · deleteWebsiteAccounts · dumpCanvasBoard · embedAppScriptsLinks · enrichMasterRegister · finalizeAcctLedger · finalizeWorkbookReorg · finishRegisterSplit · fixCreditorDetailHeader · fixJournalHeader · foldCreditorDetailIntoMaster · foldCreditorRegistry · foldFinalize · foldScriptExecutions · fullSync · hyperlinkProviderColumn · importAdminForms · importForm1040 · importForm2848 · importForm8275R · importSchedule1 · importSchedule2 · importScheduleA · importSubstituteW2 · importWorksheetData · installConsolidationTrigger · listExternalTabs · listRunnableFunctions · listSheetTabs · listSheetTabsMeta · listTriggers · listWorkbookTabs · mergeCreditorData · mergeMasterRegisterFast · mergeValidation · mergeVendorNames · peekMR · peekSheet · ping · pruneGuides · pull1099 · pullAccounts · pullAdminForms · pullChartOfAccounts · pullContacts · pullDataValidation · pullExternalFormulas · pullExternalNamedRanges · pullExternalRange · pullExternalTab · pullExternalValidations · pullForm1040 · pullForm2848 · pullForm8275R · pullJournalEntries · pullObligations · pullPrincipalRegister · pullRawTab · pullReceivables · pullSchedule1 · pullSchedule2 · pullScheduleA · pullSubstituteW2 · pullTransactions · pullValidation · pullWebsiteAccounts · pullWorkbookSheets · pullWorksheetData · push1099 · pushAppScriptsInventory · pushCashFlow · pushChartOfAccounts · pushContacts · pushCreditScorecard · pushCreditorDetail · pushDataValidation · pushDocumentInventory · pushEntities · pushJournalEntries · pushPayables · pushPrincipalRegister · pushReceivables · pushRegistryScan · pushScriptExecutions · pushTransactions · pushWebsiteAccounts · rebuildHubIndex · rebuildObligationsPivot · rebuildSubscriptions · recomputeObligationsPivotTotals · refreshProofOfMailing · refreshScriptExecutions · remapMasterRegister · removeConsolidationTrigger · renameSheet · replaceSubscriptions · restoreMasterRegister · restoreSheets · restructureMasterRegister · retireSheets · runConsolidationNow · runFunction · runWorkbookMerge · showSheets · updateMasterRegister · updateObligationCategories · updateTINRegistry · writeExternalRange · writeExternalValidations`

---

## 3. Runnable function allowlist — 29 functions


`menuApplyAllFormatting, menuRefreshTabColors, menuRefreshDataValidation, menuRefreshConditionalFmt, menuRefreshFilters, menuRefreshHeaderProtection, applyAllEnhancements, menuApplyLegendBlocks, menuApplyFinePrint, menuApplyPartyColors, runFormattingHealthAudit, fixAllFormattingIssues, diagnoseLegendAndAttribution, calculateDNI, viewTrialBalance, viewOverdueTasks, viewUpcomingTasks, refreshComplianceSheet, refreshDocumentList, populateValidationSheet, refreshDashboard, exportToPdf, runFullGapScan, scanCurrentTab, generateCPAMeetingPrep, populateAppScriptsInventory, refreshAppScriptsHealth, createRegisterSummaryTab, createExecutiveDashboardTab`

---

## 4. App HTML — 57 tabs (data-tab)


`apiScout · bankRecon · billsOfExchange · budgetForecast · ccsn · coa · consolidation · cpaConsolidated · cpaCorporation · cpaNonprofit · cpaPartnership · cpaTrust · cpaTrustCorp · cpsa · customers · depreciation · docCreator · eeej · entities · entityVerifier · expenses · fdrf · filings · financialAssets · gaapAgent · inventory · invoicing · irsFormGen · journal · ledger · masterReport · multiStatePoa · payables · paymentOrders · payroll · receivables · reports · scheduleA · settingsApi · sourceFolders · spvDashboard · spvLedger · spvReports · statements · syncCenter · taxEstimator · tmarInspector · transcriptTransformer · trcf · trustAgent · trustDashboard · trustLedger · trustMonetize · trustOS · trustReports · ukAccounting · voiceChat`

---

## 5. LLM provider map (TMAR_PROVIDERS, 15 providers)


openai (gpt-4.1-mini) · anthropic (claude-sonnet-4-6) · claude (claude-sonnet-4-6) · deepseek (deepseek-v4-pro) · zai (z1-preview) · kimi (moonshot-v1-8k) · minimax (MiniMax-Text-01) · ernie (ernie-4.0-turbo-8k) · xai (grok-3-mini) · groq (llama-3.3-70b-versatile) · cerebras (llama-3.3-70b) · openrouter (openai/gpt-4o-mini) · ollama () · custom () · hermes (law)

---

## 6. Source-of-truth files (regenerate from these)

- GAS endpoints/tabs/functions: `gas/SyncCenter.gs`, `gas/Code.gs`, `gas/WorkbookReorg.gs`, `gas/RunnableFunctionsAllowlist.gs`
- App tabs/providers/modules: `TMAR-Accrual-Ledger.html`
- Git log: recent renames/folding (see commit history)

