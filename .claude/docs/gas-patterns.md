# GAS Patterns (Google Apps Script)
- Load this file when adding or changing anything in the `gas/` folder.
- Match existing patterns for sheet reads, writes, dialogs, and return shapes.
- Never assume a sheet name — use the constants defined in each file.
- All GAS code runs server-side (V8, no DOM). HTML files in `gas/` are served via `HtmlService`.

## File Map

| File | Purpose |
|------|---------|
| `Code.gs` | Main entry, `onOpen()` menu registration |
| `GUIFunctions.gs` | All dialog/sidebar launchers + data query functions |
| `FormattingComplement.gs` | Tab colors, conditional formatting, data validation, filter views, header protection |
| `SyncCenter.gs` | `doGet()` / `doPost()` web app endpoints + import UI |
| `TMARBridge.gs` | Financial summary, account/transaction CRUD, Master Register helpers |
| `CreditReportImport.gs` | TransUnion import into Master Register |
| `DuplicateAnalyzer.gs` | Duplicate account detection |
| `ExecuteCleanup.gs` | Data cleanup operations |
| `PopulateValidation.gs` | Manages `_Validation` sheet dropdown lists |
| `TMAR_AestheticsAndAudit.gs` | Row color coding, 16-category legend, `_HealthAudit` tab |

## Sheet Read Pattern

```javascript
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getSheetByName('Master Register');
const lastRow = sheet.getLastRow();
if (lastRow < 2) return []; // empty sheet guard
const data = sheet.getRange(2, 1, lastRow - 1, 35).getValues(); // skip header, all 35 cols
```

Row index is 1-based in GAS. Column A = index 1.

## Sheet Write Pattern

```javascript
sheet.insertRows(2, 1);                           // insert before existing data
sheet.getRange(2, 1, 1, 35).setValues([rowArray]); // write single row (array of 35 values)
```

Always provide all 35 values for the Master Register — use `""` for empty cells.

## Dialog/Sidebar Launchers

```javascript
function showControlPanel() {
  const html = HtmlService.createHtmlOutputFromFile('ControlPanel')
    .setWidth(1200).setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, 'TMAR Control Panel');
}

function showSomeSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('MyPage')
    .setWidth(450);
  SpreadsheetApp.getUi().showSidebar(html);
}
```

## Data Query Return Shapes

These shapes are relied on by the HTML UI — do not change keys without updating consumers:

```javascript
// getTMARFinancialSummary()
{ totalAssets, totalLiabilities, netWorth, income, expenses, netIncome, accountsByType }

// getAccountsByStatus(status)
[{ ...accountFields }]  // array of account objects

// getAccountsGroupedByType()
{ "Bank Account - Checking": [...], "Credit Card": [...] }

// getBalancesByAccountType()
{ "Bank Account - Checking": 1234.56, "Credit Card": -500.00 }

// getMonthlySpendingReport(year, month)
{ category: { transactions: [...], total: number, count: number } }

// getTaxRelevantAccountsReport(year)
{ year, accounts: [...], byForm: { "Form 1099-B": [...] }, count: number }
```

## Web App Endpoints (SyncCenter.gs)

```javascript
// GET: ?action=listWorkbookTabs&workbookId=<id>
// GET: ?action=pullWorkbookSheets&workbookId=<id>
// POST body: { action: "importEntities"|"importTransactions"|..., payload: {...} }
```

Workbook IDs are centralized in **`TMAR_CONFIG`** (top of `SyncCenter.gs`) — never hardcode an ID elsewhere. Sync/push **target** = `TMAR_CONFIG.liveBookId` (TMAR `1k6J2…`); pull **source** for `?workbookId=` = `TMAR_CONFIG.sourceBookId` (now **= `liveBookId`** — the old Wimberly book `1CYg4fwQ…` was deleted 2026-06-27 and folded into Live).

Import action types: `entities`, `transactions`, `payables`, `filings1099`, `full`

## Error Handling Pattern

```javascript
try {
  // operation
  return { success: true, data: result };
} catch (error) {
  Logger.log('Error in functionName: ' + error);
  return { success: false, error: error.message };
}
```

Do **not** call `SpreadsheetApp.getUi().alert()` inside web app (`doGet`/`doPost`) handlers — no UI context.

## GAS Config

- Runtime: V8 engine
- Timezone: `America/Chicago` (in `appsscript.json`)
- APIs enabled: Sheets v4, Drive v3
- Exception logging: Stackdriver

## Deployment

```bash
cd gas
clasp push
```

If `doGet`/`doPost` changed: redeploy web app in Apps Script editor → new version required.
The exec URL does not change on redeploy.

## Sheet Name Constants (never misspell)

Master Register, Transaction Ledger, _Validation, Executive Dashboard, W-2 & Income Detail, BOA Cash Flow, PNC Cash Flow, Household Obligations, Subscriptions & Services, Tax Strategy, Trust Ledger, 1099 Filing Chain, Forms & Authority, Proof of Mailing, Document Inventory, Document Registry, _HealthAudit
