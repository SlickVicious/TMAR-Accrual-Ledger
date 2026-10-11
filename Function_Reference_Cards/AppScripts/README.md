# Apps Script Function Reference Cards

**Total functions:** 372  
**Type:** Apps Script (server-side `.gs`)  
**Coverage:** 100% (auto-generated from `gas/*.gs` + `gas/_superseded/`)  

> ℹ️ These cards document the server-side Google Apps Script functions. For the 22 client-side HTML/JS functions, see the parent [`Function Reference Cards Index.md`](../Function Reference Cards Index.md).

---

## Status summary

- **Active**: 164
- **Library (internal)**: 139
- **Archived-one-time-use**: 55
- **Superseded**: 14

---

## Index by source file

### `TabConsolidationAudit.gs` (25)

- [`_alignTabs_()`](./_alignTabs_.md) — Internal helper: align Tabs
- [`_diffKeys_()`](./_diffKeys_.md) — Internal helper: diff Keys
- [`_einSet_()`](./_einSet_.md) — Internal helper: ein Set
- [`_keySet_()`](./_keySet_.md) — Internal helper: key Set
- [`_liveBook_()`](./_liveBook_.md) — Internal helper: live Book
- [`_promotePcRegistry_()`](./_promotePcRegistry_.md) — Internal helper: promote Pc Registry
- [`_removeDead_()`](./_removeDead_.md) — Internal helper: remove Dead
- [`_removeDuplicates_()`](./_removeDuplicates_.md) — Internal helper: remove Duplicates
- [`_removeEmpty_()`](./_removeEmpty_.md) — Internal helper: remove Empty
- [`_sheetReferencedByValidation_()`](./_sheetReferencedByValidation_.md) — Internal helper: sheet Referenced By Validation
- [`alignTabNames()`](./alignTabNames.md) — Aligns Tab Names
- [`auditTabsForConsolidation()`](./auditTabsForConsolidation.md) — Audits Tabs For Consolidation
- [`checkCreditorCoverage()`](./checkCreditorCoverage.md) — Checks Creditor Coverage
- [`compareSuspectPairs()`](./compareSuspectPairs.md) — Compares Suspect Pairs
- [`dumpMergeCandidates()`](./dumpMergeCandidates.md) — Dumps Merge Candidates
- [`dumpRegistryHeaders()`](./dumpRegistryHeaders.md) — Dumps Registry Headers
- [`previewAlignTabNames()`](./previewAlignTabNames.md) — Previews Align Tab Names
- [`previewDuplicateRemoval()`](./previewDuplicateRemoval.md) — Previews Duplicate Removal
- [`previewEmptyRemoval()`](./previewEmptyRemoval.md) — Previews Empty Removal
- [`previewPromotePcRegistry()`](./previewPromotePcRegistry.md) — Previews Promote Pc Registry
- [`previewRemoveDeadTabs()`](./previewRemoveDeadTabs.md) — Previews Remove Dead Tabs
- [`promotePcRegistryToCanonical()`](./promotePcRegistryToCanonical.md) — Promotes Pc Registry To Canonical
- [`removeConfirmedDuplicateTabs()`](./removeConfirmedDuplicateTabs.md) — Removes Confirmed Duplicate Tabs
- [`removeDeadTabs()`](./removeDeadTabs.md) — Removes Dead Tabs
- [`removeEmptyScaffoldTabs()`](./removeEmptyScaffoldTabs.md) — Removes Empty Scaffold Tabs

### `DeleteSdhcDuplicateRow.gs` (4)

- [`_findSdhcDuplicateRow_()`](./_findSdhcDuplicateRow_.md) — Internal helper: find Sdhc Duplicate Row
- [`deleteSdhcDuplicateRow()`](./deleteSdhcDuplicateRow.md) — Deletes Sdhc Duplicate Row
- [`diagnoseMr011NotesWrite()`](./diagnoseMr011NotesWrite.md) — Diagnoses Mr011 Notes Write
- [`previewSdhcDuplicateRow()`](./previewSdhcDuplicateRow.md) — Previews Sdhc Duplicate Row

### `RemoveArchiveBanner.gs` (3)

- [`_liveSheetByGid_()`](./_liveSheetByGid_.md) — Internal helper: live Sheet By Gid
- [`deleteArchiveTab()`](./deleteArchiveTab.md) — Deletes Archive Tab
- [`previewArchiveTab()`](./previewArchiveTab.md) — Previews Archive Tab

### `TMAREngine.gs` (7)

- [`_loadComplianceSheet_()`](./_loadComplianceSheet_.md) — Internal helper: load Compliance Sheet
- [`calculateDNI()`](./calculateDNI.md) — Calculates Distributable Net Income for trust
- [`refreshComplianceSheet()`](./refreshComplianceSheet.md) — Refreshes compliance tracking sheet
- [`refreshDocumentList()`](./refreshDocumentList.md) — Refreshes document list from registry
- [`viewOverdueTasks()`](./viewOverdueTasks.md) — Shows overdue compliance tasks
- [`viewTrialBalance()`](./viewTrialBalance.md) — Displays trial balance report
- [`viewUpcomingTasks()`](./viewUpcomingTasks.md) — Shows upcoming compliance tasks (next 30 days)

### `WorkbookReorg.gs` (13)

- [`_normExecName_()`](./_normExecName_.md) — Internal helper: norm Exec Name
- [`_normFuncName_()`](./_normFuncName_.md) — Internal helper: norm Func Name
- [`appendBlock_()`](./appendBlock_.md) — Internal helper: append Block
- [`appendToArchive_()`](./appendToArchive_.md) — Internal helper: append To Archive
- [`consolidateGuides_()`](./consolidateGuides_.md) — Internal helper: consolidate Guides
- [`finalizeWorkbookReorg_()`](./finalizeWorkbookReorg_.md) — Internal helper: finalize Workbook Reorg
- [`foldScriptExecutions_()`](./foldScriptExecutions_.md) — Internal helper: fold Script Executions
- [`installConsolidationTrigger()`](./installConsolidationTrigger.md) — Installs Consolidation Trigger
- [`listInstalledTriggers_()`](./listInstalledTriggers_.md) — Internal helper: list Installed Triggers
- [`pruneGuides_()`](./pruneGuides_.md) — Internal helper: prune Guides
- [`regenerateHubIndex_()`](./regenerateHubIndex_.md) — Internal helper: regenerate Hub Index
- [`removeConsolidationTrigger()`](./removeConsolidationTrigger.md) — Removes Consolidation Trigger
- [`runScheduledConsolidation()`](./runScheduledConsolidation.md) — Runs Scheduled Consolidation

### `_superseded/TMAR_AestheticsAndAudit.gs` (14)

- [`addAestheticsAuditMenu_()`](./addAestheticsAuditMenu_.md) — Internal helper: add Aesthetics Audit Menu
- [`applyAesthetics()`](./applyAesthetics.md) — ORIGINAL aesthetics wrapper -- superseded by applyAllEnhancements in FormattingComplement.gs
- [`colorMasterRegisterRows()`](./colorMasterRegisterRows.md) — ORIGINAL row coloring -- superseded by applyPartyRowColoring in FormattingComplement.gs
- [`colorTransactionLedger()`](./colorTransactionLedger.md) — color Transaction Ledger
- [`findLegendRow_()`](./findLegendRow_.md) — Internal helper: find Legend Row
- [`getDataLastRow_()`](./getDataLastRow_.md) — Internal helper: get Data Last Row
- [`insertAllLegends()`](./insertAllLegends.md) — ORIGINAL legend blocks -- superseded by applyLegendBlocks in FormattingComplement.gs
- [`insertLegend_()`](./insertLegend_.md) — Internal helper: insert Legend
- [`issueAction_()`](./issueAction_.md) — Internal helper: issue Action
- [`onOpen_AestheticsAudit()`](./onOpen_AestheticsAudit.md) — onOpen trigger: installs menu
- [`runAll()`](./runAll.md) — Runs All
- [`runHealthAudit()`](./runHealthAudit.md) — ORIGINAL health audit -- superseded by runFormattingHealthAudit in FormattingComplement.gs
- [`setRowHeight_()`](./setRowHeight_.md) — Internal helper: set Row Height
- [`writeAuditReport_()`](./writeAuditReport_.md) — Internal helper: write Audit Report

### `Code.gs` (83)

- [`addCPAQuestion()`](./addCPAQuestion.md) — Adds CPAQuestion
- [`addObligationEntry()`](./addObligationEntry.md) — Adds Obligation Entry
- [`addSampleData()`](./addSampleData.md) — Adds demo sample data for testing
- [`addSubscriptionEntry()`](./addSubscriptionEntry.md) — Adds Subscription Entry
- [`applyAllFormatting()`](./applyAllFormatting.md) — Applies All Formatting
- [`applyConditionalFormatting()`](./applyConditionalFormatting.md) — Applies Conditional Formatting
- [`applyDataValidation()`](./applyDataValidation.md) — Applies Data Validation
- [`applyTabColors()`](./applyTabColors.md) — Applies Tab Colors
- [`applyToBOACashFlow_()`](./applyToBOACashFlow_.md) — Internal helper: apply To BOACash Flow
- [`applyToExecDashboard_()`](./applyToExecDashboard_.md) — Internal helper: apply To Exec Dashboard
- [`applyToBusinessObligations_()`](./applyToBusinessObligations_.md) — Internal helper: apply To Household Obligations
- [`applyToPNCCashFlow_()`](./applyToPNCCashFlow_.md) — Internal helper: apply To PNCCash Flow
- [`applyToTaxStrategy_()`](./applyToTaxStrategy_.md) — Internal helper: apply To Tax Strategy
- [`applyToW2Detail_()`](./applyToW2Detail_.md) — Internal helper: apply To W2 Detail
- [`applyYearDataToSheets_()`](./applyYearDataToSheets_.md) — Internal helper: apply Year Data To Sheets
- [`clearCPAFilters()`](./clearCPAFilters.md) — Clears all CPA Questions filters
- [`createExecutiveDashboardTab()`](./createExecutiveDashboardTab.md) — Creates Executive Dashboard Tab
- [`createFilterViews()`](./createFilterViews.md) — Creates Filter Views
- [`createOrClearGapReport_()`](./createOrClearGapReport_.md) — Internal helper: create Or Clear Gap Report
- [`createRegisterSummaryTab()`](./createRegisterSummaryTab.md) — Creates Register Summary Tab
- [`emailGapReport()`](./emailGapReport.md) — Emails gap scan report
- [`ensureCPASheet_()`](./ensureCPASheet_.md) — Internal helper: ensure CPASheet
- [`ensureSettingsSheet_()`](./ensureSettingsSheet_.md) — Internal helper: ensure Settings Sheet
- [`exportToPdf()`](./exportToPdf.md) — Exports current tab to PDF
- [`filterCPAOpen()`](./filterCPAOpen.md) — Filters CPA Questions to show open items only
- [`filterCPAPriority()`](./filterCPAPriority.md) — Filters CPA Questions by priority level
- [`generateCPAMeetingPrep()`](./generateCPAMeetingPrep.md) — Generates CPA meeting preparation document
- [`getActiveYear_()`](./getActiveYear_.md) — Internal helper: get Active Year
- [`getDocumentRegistry_()`](./getDocumentRegistry_.md) — Internal helper: get Document Registry
- [`getValList()`](./getValList.md) — Gets Val List
- [`getYearsFromDocRegistry_()`](./getYearsFromDocRegistry_.md) — Internal helper: get Years From Doc Registry
- [`getYearsWithData_()`](./getYearsWithData_.md) — Internal helper: get Years With Data
- [`hasDocumentInRegistry_()`](./hasDocumentInRegistry_.md) — Internal helper: has Document In Registry
- [`importCSV()`](./importCSV.md) — Imports CSV
- [`importCSVTransactions()`](./importCSVTransactions.md) — Imports CSVTransactions
- [`installTmarToolsMenu()`](./installTmarToolsMenu.md) — Installs Tmar Tools Menu
- [`loadYearData_()`](./loadYearData_.md) — Internal helper: load Year Data
- [`menuApplyAllFormatting()`](./menuApplyAllFormatting.md) — Applies all formatting (tabs, validation, conditional, filters, headers)
- [`menuRefreshConditionalFmt()`](./menuRefreshConditionalFmt.md) — Refreshes conditional formatting rules
- [`menuRefreshDataValidation()`](./menuRefreshDataValidation.md) — Refreshes data validation dropdowns
- [`menuRefreshFilters()`](./menuRefreshFilters.md) — Refreshes filter views
- [`menuRefreshHeaderProtection()`](./menuRefreshHeaderProtection.md) — Refreshes header row protection
- [`menuRefreshTabColors()`](./menuRefreshTabColors.md) — Refreshes tab color coding
- [`migrateDocRegistryPaths()`](./migrateDocRegistryPaths.md) — One-time migration of absolute to relative paths in Document Registry -- already run
- [`navigateToCPASheet()`](./navigateToCPASheet.md) — Navigates to CPA Questions tab
- [`navigateToDocRegistry()`](./navigateToDocRegistry.md) — Navigates to the Document Registry tab
- [`navigateToGapReport()`](./navigateToGapReport.md) — Navigates to the Gap Report tab
- [`onOpen()`](./onOpen.md) — onOpen trigger: installs menu
- [`protectHeaderRows()`](./protectHeaderRows.md) — Protects Header Rows
- [`refreshDashboard()`](./refreshDashboard.md) — Refreshes dashboard formulas
- [`resetToDefaultYear()`](./resetToDefaultYear.md) — Resets year to current calendar year
- [`resolveActionItemAgainstRegistry_()`](./resolveActionItemAgainstRegistry_.md) — Internal helper: resolve Action Item Against Registry
- [`resolveDocPath_()`](./resolveDocPath_.md) — Internal helper: resolve Doc Path
- [`runFullGapScan()`](./runFullGapScan.md) — Runs full workbook gap scan across all tabs
- [`scanCurrentTab()`](./scanCurrentTab.md) — Scans only the currently active tab for gaps
- [`scanTab1099FilingChain_()`](./scanTab1099FilingChain_.md) — Internal helper: scan Tab1099 Filing Chain
- [`scanTabBOACashFlow_()`](./scanTabBOACashFlow_.md) — Internal helper: scan Tab BOACash Flow
- [`scanTabDocInventory_()`](./scanTabDocInventory_.md) — Internal helper: scan Tab Doc Inventory
- [`scanTabExecutiveDashboard_()`](./scanTabExecutiveDashboard_.md) — Internal helper: scan Tab Executive Dashboard
- [`scanTabFormsAuthority_()`](./scanTabFormsAuthority_.md) — Internal helper: scan Tab Forms Authority
- [`scanTabBusinessObligations_()`](./scanTabBusinessObligations_.md) — Internal helper: scan Tab Household Obligations
- [`scanTabMasterRegister_()`](./scanTabMasterRegister_.md) — Internal helper: scan Tab Master Register
- [`scanTabProofOfMailing_()`](./scanTabProofOfMailing_.md) — Internal helper: scan Tab Proof Of Mailing
- [`scanTabSubscriptions_()`](./scanTabSubscriptions_.md) — Internal helper: scan Tab Subscriptions
- [`scanTabTaxStrategy_()`](./scanTabTaxStrategy_.md) — Internal helper: scan Tab Tax Strategy
- [`scanTabTransactionLedger_()`](./scanTabTransactionLedger_.md) — Internal helper: scan Tab Transaction Ledger
- [`scanTabTrustLedger_()`](./scanTabTrustLedger_.md) — Internal helper: scan Tab Trust Ledger
- [`scanTabW2Income_()`](./scanTabW2Income_.md) — Internal helper: scan Tab W2 Income
- [`setActiveYear()`](./setActiveYear.md) — Sets Active Year
- [`showAboutDialog()`](./showAboutDialog.md) — Shows workbook info dialog
- [`showAddObligationDialog()`](./showAddObligationDialog.md) — Opens Add Obligation entry dialog
- [`showAddQuestionDialog()`](./showAddQuestionDialog.md) — Opens dialog to add new CPA question
- [`showAddSubscriptionDialog()`](./showAddSubscriptionDialog.md) — Opens Add Subscription entry dialog
- [`showCSVImportDialog()`](./showCSVImportDialog.md) — Opens CSV transaction import dialog
- [`showCurrentYear()`](./showCurrentYear.md) — Displays current active year
- [`showDataCompletenessDashboard()`](./showDataCompletenessDashboard.md) — Opens data completeness diagnostic dashboard
- [`showHelpDialog()`](./showHelpDialog.md) — Shows help & documentation dialog
- [`showYearSelector()`](./showYearSelector.md) — Shows dialog to set active tax year
- [`submit()`](./submit.md) — Submits
- [`submitQuestion()`](./submitQuestion.md) — Submits Question
- [`submitYear()`](./submitYear.md) — Submits Year
- [`updateTaxBrackets_()`](./updateTaxBrackets_.md) — Internal helper: update Tax Brackets
- [`updateYearReferences_()`](./updateYearReferences_.md) — Internal helper: update Year References

### `addFillingPackage2025.gs` (2)

- [`addFilingPackage2025()`](./addFilingPackage2025.md) — Adds Filing Package2025
- [`nextId()`](./nextId.md) — Gets next Id

### `TMARBridge.gs` (11)

- [`addTMARAccount()`](./addTMARAccount.md) — Adds TMARAccount
- [`exportTMARToJSON()`](./exportTMARToJSON.md) — Exports TMARTo JSON
- [`generateNextMRId_()`](./generateNextMRId_.md) — Internal helper: generate Next MRId
- [`getAccountsByUser()`](./getAccountsByUser.md) — Gets Accounts By User
- [`getTMARFinancialSummary()`](./getTMARFinancialSummary.md) — Gets TMARFinancial Summary
- [`readMasterRegisterAccounts_()`](./readMasterRegisterAccounts_.md) — Internal helper: read Master Register Accounts
- [`readTransactionLedgerData_()`](./readTransactionLedgerData_.md) — Internal helper: read Transaction Ledger Data
- [`searchTMARAccounts()`](./searchTMARAccounts.md) — Searches TMARAccounts
- [`showAddAccountDialog()`](./showAddAccountDialog.md) — Opens Add Account dialog (also in Import Tools)
- [`showFinancialSummary()`](./showFinancialSummary.md) — Shows financial summary dialog
- [`showTMARDashboard()`](./showTMARDashboard.md) — Opens TMAR dashboard HTML view

### `GUIFunctions.gs` (19)

- [`addTransaction()`](./addTransaction.md) — Adds Transaction
- [`deleteAccount()`](./deleteAccount.md) — Deletes Account
- [`getAccountById()`](./getAccountById.md) — Gets Account By Id
- [`getAccountList()`](./getAccountList.md) — Gets Account List
- [`getAccountsByStatus()`](./getAccountsByStatus.md) — Gets Accounts By Status
- [`getAccountsGroupedByType()`](./getAccountsGroupedByType.md) — Gets Accounts Grouped By Type
- [`getAccountsNeedingVerification()`](./getAccountsNeedingVerification.md) — Gets Accounts Needing Verification
- [`getBalancesByAccountType()`](./getBalancesByAccountType.md) — Gets Balances By Account Type
- [`getDisputedAccounts()`](./getDisputedAccounts.md) — Gets Disputed Accounts
- [`getMonthlySpendingReport()`](./getMonthlySpendingReport.md) — Gets Monthly Spending Report
- [`getTaxRelevantAccountsReport()`](./getTaxRelevantAccountsReport.md) — Gets Tax Relevant Accounts Report
- [`getTransactionsByDateRange()`](./getTransactionsByDateRange.md) — Gets Transactions By Date Range
- [`showBillOfExchange()`](./showBillOfExchange.md) — Opens Bill of Exchange dialog
- [`showControlPanel()`](./showControlPanel.md) — Opens Control Panel HTML dialog
- [`showControlPanelSidebar()`](./showControlPanelSidebar.md) — Opens Control Panel Sidebar dialog/view
- [`showDocumentGenerator()`](./showDocumentGenerator.md) — Opens Document Generator dialog
- [`showEINVerifier()`](./showEINVerifier.md) — Opens EIN Verifier tool
- [`showGAAPInterface()`](./showGAAPInterface.md) — Opens Universal Accrual Ledger (GAAP) interface
- [`updateAccount()`](./updateAccount.md) — Updates Account

### `DuplicateAnalyzer.gs` (13)

- [`analyzeDuplicateAccounts()`](./analyzeDuplicateAccounts.md) — Analyzes Duplicate Accounts
- [`archiveDuplicateAccounts()`](./archiveDuplicateAccounts.md) — Archives Duplicate Accounts
- [`autoRemoveExactDuplicates()`](./autoRemoveExactDuplicates.md) — auto Remove Exact Duplicates
- [`findClosedWithActiveDuplicates()`](./findClosedWithActiveDuplicates.md) — find Closed With Active Duplicates
- [`findExactDuplicates()`](./findExactDuplicates.md) — find Exact Duplicates
- [`findSameEINAccounts()`](./findSameEINAccounts.md) — find Same EINAccounts
- [`findSameNameAccounts()`](./findSameNameAccounts.md) — find Same Name Accounts
- [`findTransferredAccounts()`](./findTransferredAccounts.md) — find Transferred Accounts
- [`formatDuplicateReportHTML()`](./formatDuplicateReportHTML.md) — format Duplicate Report HTML
- [`generateRecommendations()`](./generateRecommendations.md) — Generates Recommendations
- [`getDuplicateReportJSON()`](./getDuplicateReportJSON.md) — Gets Duplicate Report JSON
- [`removeDuplicateAccounts()`](./removeDuplicateAccounts.md) — Removes Duplicate Accounts
- [`showDuplicateAnalysisReport()`](./showDuplicateAnalysisReport.md) — Analyzes Master Register for duplicate accounts

### `SyncCenter.gs` (62)

- [`appcPullFromHub()`](./appcPullFromHub.md) — APPCHub sync: Pull From Hub
- [`appcPullMasterRegister()`](./appcPullMasterRegister.md) — APPCHub sync: Pull Master Register
- [`appcPullTransactionLedger()`](./appcPullTransactionLedger.md) — APPCHub sync: Pull Transaction Ledger
- [`appcPushMasterRegister()`](./appcPushMasterRegister.md) — APPCHub sync: Push Master Register
- [`appcPushToHub()`](./appcPushToHub.md) — APPCHub sync: Push To Hub
- [`appcPushTransactionLedger()`](./appcPushTransactionLedger.md) — APPCHub sync: Push Transaction Ledger
- [`appcSyncAll()`](./appcSyncAll.md) — APPCHub sync: Sync All
- [`checkApiKey_()`](./checkApiKey_.md) — Internal helper: check Api Key
- [`deleteCreditorDetail_()`](./deleteCreditorDetail_.md) — Internal helper: delete Creditor Detail
- [`deleteForm1040_()`](./deleteForm1040_.md) — Internal helper: delete Form1040
- [`deleteWebsiteAccounts_()`](./deleteWebsiteAccounts_.md) — Internal helper: delete Website Accounts
- [`doGet()`](./doGet.md) — HTTP GET dispatch endpoint
- [`doImport()`](./doImport.md) — do Import
- [`doPost()`](./doPost.md) — HTTP POST dispatch endpoint
- [`ensureForm1040Sheet_()`](./ensureForm1040Sheet_.md) — Internal helper: ensure Form1040 Sheet
- [`ensureSyncMetaSheet_()`](./ensureSyncMetaSheet_.md) — Internal helper: ensure Sync Meta Sheet
- [`errorResponse_()`](./errorResponse_.md) — Internal helper: error Response
- [`getActiveYearFromSS_()`](./getActiveYearFromSS_.md) — Internal helper: get Active Year From SS
- [`getAppcHub_()`](./getAppcHub_.md) — Internal helper: get Appc Hub
- [`getTMARSpreadsheet_()`](./getTMARSpreadsheet_.md) — Internal helper: get TMARSpreadsheet
- [`importFromLedger()`](./importFromLedger.md) — Imports From Ledger
- [`importLedger1099s()`](./importLedger1099s.md) — Imports Ledger1099s
- [`importLedgerEntities()`](./importLedgerEntities.md) — Imports Ledger Entities
- [`importLedgerPayables()`](./importLedgerPayables.md) — Imports Ledger Payables
- [`importLedgerTransactions()`](./importLedgerTransactions.md) — Imports Ledger Transactions
- [`jsonResponse_()`](./jsonResponse_.md) — Internal helper: json Response
- [`loadFile()`](./loadFile.md) — Loads File
- [`logExecution_()`](./logExecution_.md) — Internal helper: log Execution
- [`maskEIN_()`](./maskEIN_.md) — Internal helper: mask EIN
- [`pullErrorLogs_()`](./pullErrorLogs_.md) — Internal helper: pull Error Logs
- [`pullFormTab_()`](./pullFormTab_.md) — Internal helper: pull Form Tab
- [`pullSheetData_()`](./pullSheetData_.md) — Internal helper: pull Sheet Data
- [`push1099_()`](./push1099_.md) — Internal helper: push1099
- [`pushAdminForms_()`](./pushAdminForms_.md) — Internal helper: push Admin Forms
- [`pushAppScriptsInventory_()`](./pushAppScriptsInventory_.md) — Internal helper: push App Scripts Inventory
- [`pushChartOfAccounts_()`](./pushChartOfAccounts_.md) — Internal helper: push Chart Of Accounts
- [`pushContacts_()`](./pushContacts_.md) — Internal helper: push Contacts
- [`pushCreditorDetail_()`](./pushCreditorDetail_.md) — Internal helper: push Creditor Detail
- [`pushDocumentInventory_()`](./pushDocumentInventory_.md) — Internal helper: push Document Inventory
- [`pushEntities_()`](./pushEntities_.md) — Internal helper: push Entities
- [`pushForm1040_()`](./pushForm1040_.md) — Internal helper: push Form1040
- [`pushForm2848_()`](./pushForm2848_.md) — Internal helper: push Form2848
- [`pushForm8275R_()`](./pushForm8275R_.md) — Internal helper: push Form8275 R
- [`pushJournalEntries_()`](./pushJournalEntries_.md) — Internal helper: push Journal Entries
- [`pushPayables_()`](./pushPayables_.md) — Internal helper: push Payables
- [`pushPrincipalRegister_()`](./pushPrincipalRegister_.md) — Internal helper: push Principal Register
- [`pushReceivables_()`](./pushReceivables_.md) — Internal helper: push Receivables
- [`pushSchedule1_()`](./pushSchedule1_.md) — Internal helper: push Schedule1
- [`pushSchedule2_()`](./pushSchedule2_.md) — Internal helper: push Schedule2
- [`pushScheduleA_()`](./pushScheduleA_.md) — Internal helper: push Schedule A
- [`pushScriptExecutions_()`](./pushScriptExecutions_.md) — Internal helper: push Script Executions
- [`pushSubstituteW2_()`](./pushSubstituteW2_.md) — Internal helper: push Substitute W2
- [`pushTransactions_()`](./pushTransactions_.md) — Internal helper: push Transactions
- [`pushWebsiteAccounts_()`](./pushWebsiteAccounts_.md) — Internal helper: push Website Accounts
- [`pushWorksheetData_()`](./pushWorksheetData_.md) — Internal helper: push Worksheet Data
- [`refreshScriptExecutions()`](./refreshScriptExecutions.md) — Refreshes Script Executions
- [`showLedgerImportDialog()`](./showLedgerImportDialog.md) — Opens Import from Accrual Ledger dialog
- [`showStatus()`](./showStatus.md) — Opens Status dialog/view
- [`switchInputTab()`](./switchInputTab.md) — switch Input Tab
- [`updateMasterRegister_()`](./updateMasterRegister_.md) — Internal helper: update Master Register
- [`updateSyncTimestamp_()`](./updateSyncTimestamp_.md) — Internal helper: update Sync Timestamp
- [`validatePayload_()`](./validatePayload_.md) — Internal helper: validate Payload

### `FormattingComplement.gs` (21)

- [`applyAllEnhancements()`](./applyAllEnhancements.md) — Applies legend blocks, attribution stamps, and party row colors
- [`applyDataValidationSafe_()`](./applyDataValidationSafe_.md) — Internal helper: apply Data Validation Safe
- [`applyFinePrintAttribution()`](./applyFinePrintAttribution.md) — Applies Fine Print Attribution
- [`applyLegend_1099FilingChain_()`](./applyLegend_1099FilingChain_.md) — Internal helper: apply Legend 1099 Filing Chain
- [`applyLegend_BOACashFlow_()`](./applyLegend_BOACashFlow_.md) — Internal helper: apply Legend BOACash Flow
- [`applyLegend_FormsAuthority_()`](./applyLegend_FormsAuthority_.md) — Internal helper: apply Legend Forms Authority
- [`applyLegend_BusinessObligations_()`](./applyLegend_BusinessObligations_.md) — Internal helper: apply Legend Household Obligations
- [`applyLegend_MasterRegister_()`](./applyLegend_MasterRegister_.md) — Internal helper: apply Legend Master Register
- [`applyLegend_TransactionLedger_()`](./applyLegend_TransactionLedger_.md) — Internal helper: apply Legend Transaction Ledger
- [`applyLegendBlocks()`](./applyLegendBlocks.md) — Applies Legend Blocks
- [`applyPartyRowColoring()`](./applyPartyRowColoring.md) — Applies Party Row Coloring
- [`createFilterViewsSafe_()`](./createFilterViewsSafe_.md) — Internal helper: create Filter Views Safe
- [`diagnoseLegendAndAttribution()`](./diagnoseLegendAndAttribution.md) — Diagnoses issues with legend blocks and attribution stamps
- [`enhanceFormattingMenu()`](./enhanceFormattingMenu.md) — enhance Formatting Menu
- [`fixAllFormattingIssues()`](./fixAllFormattingIssues.md) — Auto-fixes detected formatting issues
- [`groupConsecutiveRows_()`](./groupConsecutiveRows_.md) — Internal helper: group Consecutive Rows
- [`menuApplyFinePrint()`](./menuApplyFinePrint.md) — Adds fine-print attribution stamps
- [`menuApplyLegendBlocks()`](./menuApplyLegendBlocks.md) — Adds color legend blocks to sheets
- [`menuApplyPartyColors()`](./menuApplyPartyColors.md) — Applies party-based row color coding
- [`runFormattingHealthAudit()`](./runFormattingHealthAudit.md) — Runs workbook formatting health audit
- [`runPhase()`](./runPhase.md) — Runs Phase

### `ScanDriveFileCabinet.gs` (10)

- [`applyDriveFileCabinetScan()`](./applyDriveFileCabinetScan.md) — Applies Drive FC scan results to Document Registry
- [`dfcExt_()`](./dfcExt_.md) — Internal helper: dfc Ext
- [`dfcInferPerson_()`](./dfcInferPerson_.md) — Internal helper: dfc Infer Person
- [`dfcInferType_()`](./dfcInferType_.md) — Internal helper: dfc Infer Type
- [`dfcInferYear_()`](./dfcInferYear_.md) — Internal helper: dfc Infer Year
- [`dfcNameYearKey_()`](./dfcNameYearKey_.md) — Internal helper: dfc Name Year Key
- [`dfcWalk_()`](./dfcWalk_.md) — Internal helper: dfc Walk
- [`existingNameYearKeys_()`](./existingNameYearKeys_.md) — Internal helper: existing Name Year Keys
- [`runDriveFileCabinetScan()`](./runDriveFileCabinetScan.md) — Scans Google Drive mirror of FileCabinet for file inventory
- [`undoDriveScanApply()`](./undoDriveScanApply.md) — Undoes last Drive FC scan apply

### `ExecuteCleanup.gs` (5)

- [`archiveClosedAccountsOnly()`](./archiveClosedAccountsOnly.md) — Archives Closed Accounts Only
- [`confirmAndExecuteCleanup()`](./confirmAndExecuteCleanup.md) — Confirms and runs cleanup of flagged rows
- [`dryRunCleanup()`](./dryRunCleanup.md) — dry Run Cleanup
- [`executeFullDuplicateCleanup()`](./executeFullDuplicateCleanup.md) — execute Full Duplicate Cleanup
- [`removeExactDuplicatesOnly()`](./removeExactDuplicatesOnly.md) — Removes Exact Duplicates Only

### `WorkbookOptimization.gs` (2)

- [`archiveTabs_()`](./archiveTabs_.md) — Internal helper: archive Tabs
- [`pushCreditScorecard_()`](./pushCreditScorecard_.md) — Internal helper: push Credit Scorecard

### `TransactionLedgerTrackingFix.gs` (7)

- [`auditLedgerTracking()`](./auditLedgerTracking.md) — Audits Ledger Tracking
- [`fixLedgerTrackingSwap()`](./fixLedgerTrackingSwap.md) — Fixes Ledger Tracking Swap
- [`previewLedgerTrackingFix()`](./previewLedgerTrackingFix.md) — Previews Ledger Tracking Fix
- [`tlCorrections_()`](./tlCorrections_.md) — Internal helper: tl Corrections
- [`tlFix_()`](./tlFix_.md) — Internal helper: tl Fix
- [`tlNorm_()`](./tlNorm_.md) — Internal helper: tl Norm
- [`tlSheet_()`](./tlSheet_.md) — Internal helper: tl Sheet

### `ReconcileCrossFill.gs` (15)

- [`byEin()`](./byEin.md) — Cross-fill by EIN
- [`byName()`](./byName.md) — Cross-fill by name
- [`pushFill()`](./pushFill.md) — Pushes Fill
- [`showReconcileDialog()`](./showReconcileDialog.md) — Opens Reconcile & Cross-Fill dialog
- [`writeXfTabs_()`](./writeXfTabs_.md) — Internal helper: write Xf Tabs
- [`xfApply()`](./xfApply.md) — xf Apply
- [`xfDistinct_()`](./xfDistinct_.md) — Internal helper: xf Distinct
- [`xfFindCol_()`](./xfFindCol_.md) — Internal helper: xf Find Col
- [`xfHeaderRow_()`](./xfHeaderRow_.md) — Internal helper: xf Header Row
- [`xfListSheetNames()`](./xfListSheetNames.md) — xf List Sheet Names
- [`xfNameCounts_()`](./xfNameCounts_.md) — Internal helper: xf Name Counts
- [`xfNormEin_()`](./xfNormEin_.md) — Internal helper: xf Norm Ein
- [`xfNormName_()`](./xfNormName_.md) — Internal helper: xf Norm Name
- [`xfPreview()`](./xfPreview.md) — xf Preview
- [`xfReadSheet_()`](./xfReadSheet_.md) — Internal helper: xf Read Sheet

### `FixCurrentBalanceValidation.gs` (3)

- [`clearCurrentBalanceValidation()`](./clearCurrentBalanceValidation.md) — Clears Current Balance Validation
- [`clearDiagnosticTraceColumn()`](./clearDiagnosticTraceColumn.md) — Clears Diagnostic Trace Column
- [`previewCurrentBalanceValidation()`](./previewCurrentBalanceValidation.md) — Previews Current Balance Validation

### `PopulateProofOfMailing.gs` (8)

- [`clearProofOfMailingRows()`](./clearProofOfMailingRows.md) — Clears Proof Of Mailing Rows
- [`pomKey_()`](./pomKey_.md) — Internal helper: pom Key
- [`pomNorm_()`](./pomNorm_.md) — Internal helper: pom Norm
- [`pomPopulate_()`](./pomPopulate_.md) — Internal helper: pom Populate
- [`pomRecords_()`](./pomRecords_.md) — Internal helper for proof of mailing records (called from SyncCenter)
- [`populateProofOfMailing()`](./populateProofOfMailing.md) — populate Proof Of Mailing
- [`previewProofOfMailingPopulate()`](./previewProofOfMailingPopulate.md) — Previews Proof Of Mailing Populate
- [`refreshProofOfMailing()`](./refreshProofOfMailing.md) — Refreshes Proof of Mailing data (called from SyncCenter doPost)

### `CreditReportImport.gs` (13)

- [`colorCodeMasterRegisterRows_()`](./colorCodeMasterRegisterRows_.md) — Internal helper: color Code Master Register Rows
- [`createAcctLedgerSheet_()`](./createAcctLedgerSheet_.md) — Internal helper: create Acct Ledger Sheet
- [`getClintCreditReportAccounts_()`](./getClintCreditReportAccounts_.md) — Internal helper: get Clint Credit Report Accounts
- [`getSyrinaCreditReportAccounts_()`](./getSyrinaCreditReportAccounts_.md) — Internal helper: get Syrina Credit Report Accounts
- [`importAllCreditReportAccounts()`](./importAllCreditReportAccounts.md) — Imports ALL credit report accounts (Clint + Syrina)
- [`importClintCreditReportAccounts()`](./importClintCreditReportAccounts.md) — Imports Clinton's credit report accounts to Master Register
- [`importSyrinaAutoLoan()`](./importSyrinaAutoLoan.md) — Imports Syrina's Kia auto loan to Master Register
- [`importSyrinaCreditReportAccounts()`](./importSyrinaCreditReportAccounts.md) — Imports Syrina Credit Report Accounts
- [`importToAcctLedger_()`](./importToAcctLedger_.md) — Internal helper: import To Acct Ledger
- [`importToMasterRegister_()`](./importToMasterRegister_.md) — Internal helper: import To Master Register
- [`linkMRIdsToAcctLedger()`](./linkMRIdsToAcctLedger.md) — Links MRIds To Acct Ledger
- [`normalizeMonthYear_()`](./normalizeMonthYear_.md) — Internal helper: normalize Month Year
- [`populateAcctLedgerOnly()`](./populateAcctLedgerOnly.md) — populate Acct Ledger Only

### `MergeReconciliation.gs` (4)

- [`dedupeMasterRegister_()`](./dedupeMasterRegister_.md) — Internal helper: dedupe Master Register
- [`enrichMasterRegisterFromAcctLedger_()`](./enrichMasterRegisterFromAcctLedger_.md) — Internal helper: enrich Master Register From Acct Ledger
- [`mergeCreditorData_()`](./mergeCreditorData_.md) — Internal helper: merge Creditor Data
- [`mergeValidation_()`](./mergeValidation_.md) — Internal helper: merge Validation

### `FixOriginalBalanceDateFormat.gs` (9)

- [`deletePhase2ClutterRows()`](./deletePhase2ClutterRows.md) — Deletes Phase2 Clutter Rows
- [`deletePhase3TechCompanyRows()`](./deletePhase3TechCompanyRows.md) — Deletes Phase3 Tech Company Rows
- [`fixCapitalOne360Accounts()`](./fixCapitalOne360Accounts.md) — Fixes Capital One360 Accounts
- [`fixNelnetAccountNumbers()`](./fixNelnetAccountNumbers.md) — Fixes Nelnet Account Numbers
- [`fixOriginalBalanceDateFormat()`](./fixOriginalBalanceDateFormat.md) — Fixes Original Balance Date Format
- [`fixPhase4StructuralGaps()`](./fixPhase4StructuralGaps.md) — Fixes Phase4 Structural Gaps
- [`fixWebullAccountNumber()`](./fixWebullAccountNumber.md) — Fixes Webull Account Number
- [`mergeBgcDuplicateIntoMr001()`](./mergeBgcDuplicateIntoMr001.md) — Merges Bgc Duplicate Into Mr001
- [`previewOriginalBalanceFormat()`](./previewOriginalBalanceFormat.md) — Previews Original Balance Format

### `ImportRegistryScan.gs` (9)

- [`docId_()`](./docId_.md) — Internal helper: doc Id
- [`existingPathKeys_()`](./existingPathKeys_.md) — Internal helper: existing Path Keys
- [`getRegistrySheet_()`](./getRegistrySheet_.md) — Internal helper: get Registry Sheet
- [`importRegistryScan()`](./importRegistryScan.md) — Imports Registry Scan
- [`lastDocRow_()`](./lastDocRow_.md) — Internal helper: last Doc Row
- [`maxDocNum_()`](./maxDocNum_.md) — Internal helper: max Doc Num
- [`normRegistryPath_()`](./normRegistryPath_.md) — Internal helper: norm Registry Path
- [`parseRegistryPaste_()`](./parseRegistryPaste_.md) — Internal helper: parse Registry Paste
- [`showImportRegistryScanDialog()`](./showImportRegistryScanDialog.md) — Opens dialog to paste and import registry scan output

### `embedUrlsAsHyperlinks.gs` (1)

- [`embedUrlsAsHyperlinks()`](./embedUrlsAsHyperlinks.md) — embed Urls As Hyperlinks

### `DocumentRegistryTrigger.gs` (3)

- [`installDocRegistryTrigger()`](./installDocRegistryTrigger.md) — Installs auto-ID and date trigger on Document Registry
- [`onEditDocumentRegistry_()`](./onEditDocumentRegistry_.md) — Internal helper: on Edit Document Registry
- [`removeDocRegistryTrigger()`](./removeDocRegistryTrigger.md) — Removes auto-ID and date trigger from Document Registry

### `PopulateAppScriptsInventory.gs` (2)

- [`populateAppScriptsInventory()`](./populateAppScriptsInventory.md) — populate App Scripts Inventory
- [`refreshAppScriptsHealth()`](./refreshAppScriptsHealth.md) — Refreshes App Scripts Health

### `PopulateValidation.gs` (1)

- [`populateValidationSheet()`](./populateValidationSheet.md) — Populates dropdown validation values on _Validation tab

### `RetireTrustLedger.gs` (2)

- [`previewRetireTrustLedger()`](./previewRetireTrustLedger.md) — Previews Retire Trust Ledger
- [`retireTrustLedger()`](./retireTrustLedger.md) — retire Trust Ledger

### `RunnableFunctionsAllowlist.gs` (1)

- [`runAllowlistedFunction_()`](./runAllowlistedFunction_.md) — Internal helper: run Allowlisted Function

