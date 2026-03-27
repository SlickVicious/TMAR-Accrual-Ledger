
```js
/**

* TMAR — Syrina Credit Report Account Import

* ============================================

* Adds all accounts from Syrina's TransUnion Credit Report (01/15/2026)

* to both the Master Register and Acct Ledger sheets.

*

* USAGE:

* 1. Open your TMAR Google Sheet

* 2. Extensions → Apps Script

* 3. Paste this entire file into a new script file (or append to existing)

* 4. Save, then run: importSyrinaCreditReportAccounts()

* 5. Check Master Register and Acct Ledger tabs for new rows

*

* This script will:

* - Find the next available MR-XXX ID

* - Skip accounts that already exist (matches on Provider + Account Type)

* - Add new rows to Master Register (35-col schema)

* - Add corresponding rows to Acct Ledger (EIN cross-reference)

* - Color-code rows by status

*/

  
  

// ─── CREDIT REPORT DATA ────────────────────────────────────────────────────

  

function getSyrinaCreditReportAccounts_() {

const today = new Date().toISOString().slice(0, 10);

  

return [

// ═══════════════════════════════════════════════════════════════════

// ADVERSE ACCOUNTS — Charge-offs

// ═══════════════════════════════════════════════════════════════════

{

provider: 'Capital One',

ein: '',

acctNumber: '',

acctType: 'Credit Card',

acctSubtype: 'Paid C/O',

status: 'Closed',

opened: '07/2019',

closed: '02/2021',

balance: 0,

highBal: 669,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Paid Charge-off',

removalDate: '08/2027',

taxRelevance: 'No 1099-C — paid in full',

notes: 'TransUnion: Paid charge-off. $0 balance. Removes 08/2027.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'Continental Finance',

ein: '',

acctNumber: '',

acctType: 'Credit Card',

acctSubtype: 'Sold/C/O',

status: 'Closed',

opened: '11/2023',

closed: '05/2025',

balance: 0,

highBal: 1521,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Sold to LVNV / Charge-off',

removalDate: '12/2031',

taxRelevance: 'LVNV now owns — watch for 1099-C',

notes: 'TransUnion: Sold to LVNV Funding. Original high $1,521. See MR for LVNV collection entry.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'First Premier Bank',

ein: '46-0119480',

acctNumber: '51780068421*****',

acctType: 'Credit Card',

acctSubtype: 'Charge-off',

status: 'Closed',

opened: '09/2019',

closed: '12/2020',

balance: 627,

highBal: 627,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Active Charge-off',

removalDate: '06/2027',

taxRelevance: '$627 still owed — may get 1099-C if settled',

notes: 'TransUnion: Active charge-off since 12/2020. $627 outstanding. Removes 06/2027.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'Launch Servicing',

ein: '',

acctNumber: '',

acctType: 'Student Loan',

acctSubtype: 'C/O Transferred',

status: 'Closed',

opened: '01/2018',

closed: '05/2022',

balance: 0,

highBal: 5807,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Charge-off / Transferred to Recovery',

removalDate: '09/2028',

taxRelevance: 'Transferred to recovery — check if Nelnet absorbed',

notes: 'TransUnion: C/O transferred to recovery. $0 balance. Verify if consolidated into Nelnet loans.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'Merrick Bank',

ein: '91-1756404',

acctNumber: '54631667117*****',

acctType: 'Credit Card',

acctSubtype: 'Charge-off',

status: 'Closed',

opened: '07/2023',

closed: '06/2025',

balance: 1657,

highBal: 1657,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Active Charge-off',

removalDate: '01/2032',

taxRelevance: '$1,657 active C/O — accruing interest. 1099-C risk.',

notes: 'TransUnion: Charged off 09/2025. $1,657 outstanding. Removes 01/2032.',

source: 'TransUnion Credit Report 01/15/2026',

},

  

// ═══════════════════════════════════════════════════════════════════

// ADVERSE ACCOUNTS — Collections

// ═══════════════════════════════════════════════════════════════════

{

provider: 'LVNV Funding (Credit One)',

ein: '',

acctNumber: '',

acctType: 'Collection',

acctSubtype: 'Debt Buyer',

status: 'Active',

opened: '08/2025',

closed: '',

balance: 806,

highBal: 834,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Active Collection',

removalDate: '12/2031',

taxRelevance: 'Original: Credit One Bank N.A. — 1099-C risk if settled',

notes: 'TransUnion: Collection by LVNV. Original creditor: Credit One Bank N.A. $806 balance.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'LVNV Funding (Verve/Continental)',

ein: '',

acctNumber: '',

acctType: 'Collection',

acctSubtype: 'Debt Buyer',

status: 'Active',

opened: '06/2025',

closed: '',

balance: 1521,

highBal: 1521,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Active Collection',

removalDate: '12/2031',

taxRelevance: 'Original: Verve Bank / Continental Finance — 1099-C risk',

notes: 'TransUnion: Collection by LVNV. Original: Verve Bank/Continental Finance. $1,521 balance.',

source: 'TransUnion Credit Report 01/15/2026',

},

  

// ═══════════════════════════════════════════════════════════════════

// CURRENT ACCOUNTS — Student Loans (7 individual Nelnet loans)

// ═══════════════════════════════════════════════════════════════════

{

provider: 'Nelnet — Loan #1',

ein: '84-0748903',

acctNumber: 'E985506201',

acctType: 'Student Loan',

acctSubtype: 'Federal',

status: 'Active',

opened: '09/2011',

closed: '',

balance: 5344,

highBal: 4500,

monthlyPmt: 16,

primaryUser: 'Syrina',

creditStatus: 'Current — IDR',

removalDate: '',

taxRelevance: 'Interest deductible up to $2,500 (1098-E). 300 mo term.',

notes: 'TransUnion: Current. IDR plan. Opened 09/01/2011. Original balance $4,500.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'Nelnet — Loan #2',

ein: '84-0748903',

acctNumber: 'E985506201',

acctType: 'Student Loan',

acctSubtype: 'Federal',

status: 'Active',

opened: '08/2015',

closed: '',

balance: 4930,

highBal: 4500,

monthlyPmt: 17,

primaryUser: 'Syrina',

creditStatus: 'Current — IDR',

removalDate: '',

taxRelevance: 'Interest deductible up to $2,500 (1098-E). 300 mo term.',

notes: 'TransUnion: Current. IDR plan. Opened 08/27/2015. Original balance $4,500.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'Nelnet — Loan #3',

ein: '84-0748903',

acctNumber: 'E985506201',

acctType: 'Student Loan',

acctSubtype: 'Federal',

status: 'Active',

opened: '08/2015',

closed: '',

balance: 7399,

highBal: 6000,

monthlyPmt: 25,

primaryUser: 'Syrina',

creditStatus: 'Current — IDR',

removalDate: '',

taxRelevance: 'Interest deductible up to $2,500 (1098-E). 300 mo term.',

notes: 'TransUnion: Current. IDR plan. Opened 08/27/2015. Original balance $6,000.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'Nelnet — Loan #4',

ein: '84-0748903',

acctNumber: 'E985506201',

acctType: 'Student Loan',

acctSubtype: 'Federal',

status: 'Active',

opened: '02/2018',

closed: '',

balance: 3587,

highBal: 3403,

monthlyPmt: 12,

primaryUser: 'Syrina',

creditStatus: 'Current — IDR',

removalDate: '',

taxRelevance: 'Interest deductible up to $2,500 (1098-E). 300 mo term.',

notes: 'TransUnion: Current. IDR plan. Opened 02/23/2018. Original balance $3,403.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'Nelnet — Loan #5',

ein: '84-0748903',

acctNumber: 'E985506201',

acctType: 'Student Loan',

acctSubtype: 'Federal',

status: 'Active',

opened: '02/2018',

closed: '',

balance: 6486,

highBal: 5833,

monthlyPmt: 22,

primaryUser: 'Syrina',

creditStatus: 'Current — IDR',

removalDate: '',

taxRelevance: 'Interest deductible up to $2,500 (1098-E). 300 mo term.',

notes: 'TransUnion: Current. IDR plan. Opened 02/23/2018. Original balance $5,833.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'Nelnet — Loan #6',

ein: '84-0748903',

acctNumber: 'E985506201',

acctType: 'Student Loan',

acctSubtype: 'Federal',

status: 'Active',

opened: '07/2012',

closed: '',

balance: 10239,

highBal: 7920,

monthlyPmt: 28,

primaryUser: 'Syrina',

creditStatus: 'Current — IDR',

removalDate: '',

taxRelevance: 'Interest deductible up to $2,500 (1098-E). 300 mo term.',

notes: 'TransUnion: Current. IDR plan. Opened 07/13/2012. Original balance $7,920.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'Nelnet — Loan #7',

ein: '84-0748903',

acctNumber: 'E985506201',

acctType: 'Student Loan',

acctSubtype: 'Federal',

status: 'Active',

opened: '07/2012',

closed: '',

balance: 5461,

highBal: 4628,

monthlyPmt: 15,

primaryUser: 'Syrina',

creditStatus: 'Current — IDR',

removalDate: '',

taxRelevance: 'Interest deductible up to $2,500 (1098-E). 300 mo term.',

notes: 'TransUnion: Current. IDR plan. Opened 07/13/2012. Original balance $4,628.',

source: 'TransUnion Credit Report 01/15/2026',

},

  

// ═══════════════════════════════════════════════════════════════════

// CURRENT ACCOUNTS — Personal Loan

// ═══════════════════════════════════════════════════════════════════

{

provider: 'OneMain Financial (active)',

ein: '27-4393679',

acctNumber: '3243985015137137',

acctType: 'Personal Loan',

acctSubtype: 'Unsecured',

status: 'Active',

opened: '03/2024',

closed: '',

balance: 3298,

highBal: 4447,

monthlyPmt: 167,

primaryUser: 'Syrina',

creditStatus: 'Current',

removalDate: '',

taxRelevance: 'Interest NOT deductible (personal loan). 48 mo term. Payoff ~03/2028.',

notes: 'TransUnion: Current. Unsecured personal loan. Refi of prior OneMain secured loan.',

source: 'TransUnion Credit Report 01/15/2026',

},

  

// ═══════════════════════════════════════════════════════════════════

// CLOSED/PAID ACCOUNTS

// ═══════════════════════════════════════════════════════════════════

{

provider: 'Credit One Bank',

ein: '',

acctNumber: '',

acctType: 'Credit Card',

acctSubtype: 'Closed by Grantor',

status: 'Closed',

opened: '09/2023',

closed: '10/2023',

balance: 0,

highBal: 104,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Closed by Grantor',

removalDate: '',

taxRelevance: 'Closed by grantor — no balance. No tax impact.',

notes: 'TransUnion: Closed by grantor after 1 month. High balance $104.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'OneMain Financial (2019)',

ein: '27-4393679',

acctNumber: '',

acctType: 'Secured Loan',

acctSubtype: 'Refinanced/Paid',

status: 'Closed',

opened: '06/2019',

closed: '03/2024',

balance: 0,

highBal: 21634,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Paid — Refinanced',

removalDate: '',

taxRelevance: 'Refinanced into current OneMain unsecured loan.',

notes: 'TransUnion: Paid. Refinanced into 2024 unsecured loan. High balance $21,634.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'OneMain Financial (2018)',

ein: '27-4393679',

acctNumber: '',

acctType: 'Secured Loan',

acctSubtype: 'Refinanced/Paid',

status: 'Closed',

opened: '01/2018',

closed: '06/2019',

balance: 0,

highBal: 21031,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Paid — Refinanced',

removalDate: '',

taxRelevance: 'Refinanced into 2019 OneMain secured loan.',

notes: 'TransUnion: Paid. Refinanced into 2019 loan. High balance $21,031.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'OneMain Financial (2016)',

ein: '27-4393679',

acctNumber: '',

acctType: 'Secured Loan',

acctSubtype: 'Refinanced/Paid',

status: 'Closed',

opened: '04/2016',

closed: '01/2018',

balance: 0,

highBal: 3114,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Paid — Refinanced',

removalDate: '',

taxRelevance: 'Refinanced into 2018 OneMain secured loan.',

notes: 'TransUnion: Paid. Refinanced into 2018 loan. High balance $3,114.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'SE Toyota Financial',

ein: '',

acctNumber: '',

acctType: 'Auto Loan',

acctSubtype: 'Paid & Closed',

status: 'Closed',

opened: '10/2016',

closed: '01/2018',

balance: 0,

highBal: 19656,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Paid & Closed',

removalDate: '',

taxRelevance: 'No tax impact — fully paid auto loan.',

notes: 'TransUnion: Paid and closed. High balance $19,656.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'Springleaf Financial',

ein: '',

acctNumber: '',

acctType: 'Secured Loan',

acctSubtype: 'Refinanced/Paid',

status: 'Closed',

opened: '01/2015',

closed: '03/2016',

balance: 0,

highBal: 7103,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Paid — Refinanced',

removalDate: '',

taxRelevance: 'Refinanced into OneMain Financial (2016).',

notes: 'TransUnion: Paid. Precursor to OneMain refi chain. High balance $7,103.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'US Dept of Ed / Great Lakes (GLE)',

ein: '',

acctNumber: '',

acctType: 'Student Loan',

acctSubtype: 'Transferred',

status: 'Closed',

opened: '07/2012',

closed: '01/2023',

balance: 0,

highBal: 12548,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Transferred to Nelnet',

removalDate: '',

taxRelevance: 'Now serviced as Nelnet Loan #6 & #7.',

notes: 'TransUnion: Transferred to Nelnet Jan 2023. Original high $12,548.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'US Dept of Ed / Great Lakes (GL)',

ein: '',

acctNumber: '',

acctType: 'Student Loan',

acctSubtype: 'Transferred',

status: 'Closed',

opened: '09/2011',

closed: '01/2023',

balance: 0,

highBal: 24236,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Transferred to Nelnet',

removalDate: '',

taxRelevance: 'Now serviced as Nelnet Loan #1.',

notes: 'TransUnion: Transferred to Nelnet Jan 2023. Original high $24,236.',

source: 'TransUnion Credit Report 01/15/2026',

},

{

provider: 'WebBank / FreshStart',

ein: '',

acctNumber: '',

acctType: 'Installment Loan',

acctSubtype: 'Paid & Closed',

status: 'Closed',

opened: '11/2018',

closed: '12/2018',

balance: 0,

highBal: 129,

monthlyPmt: 0,

primaryUser: 'Syrina',

creditStatus: 'Paid & Closed',

removalDate: '',

taxRelevance: 'No tax impact — fully paid installment loan.',

notes: 'TransUnion: Paid and closed within 1 month. High balance $129.',

source: 'TransUnion Credit Report 01/15/2026',

},

];

}

  
  

// ─── MASTER REGISTER IMPORT ─────────────────────────────────────────────────

  

/**

* Main entry point — run this function from Apps Script.

*/

function importSyrinaCreditReportAccounts() {

const ss = SpreadsheetApp.getActiveSpreadsheet();

const ui = SpreadsheetApp.getUi();

  

const accounts = getSyrinaCreditReportAccounts_();

  

// Import to Master Register

const mrResult = importToMasterRegister_(ss, accounts);

  

// Import to Acct Ledger

const alResult = importToAcctLedger_(ss, accounts);

  

const msg = 'Credit Report Import Complete!\n\n' +

'Master Register: ' + mrResult.added + ' added, ' + mrResult.skipped + ' skipped (already exist)\n' +

'Acct Ledger: ' + alResult.added + ' added, ' + alResult.skipped + ' skipped (already exist)';

  

ui.alert(msg);

Logger.log(msg);

}

  
  

function importToMasterRegister_(ss, accounts) {

const sheet = ss.getSheetByName('Master Register');

if (!sheet) {

Logger.log('ERROR: Master Register sheet not found');

return { added: 0, skipped: 0 };

}

  

const lastRow = sheet.getLastRow();

const lastCol = Math.min(sheet.getLastColumn(), 35);

  

// Read existing data to find max MR ID and check for duplicates

let existingData = [];

if (lastRow > 1) {

existingData = sheet.getRange(2, 1, lastRow - 1, Math.max(lastCol, 7)).getValues();

}

  

// Find max MR-XXX number

let maxId = 0;

const existingProviders = new Set();

for (const row of existingData) {

const idStr = String(row[0] || '');

const match = idStr.match(/MR-(\d+)/);

if (match) maxId = Math.max(maxId, parseInt(match[1]));

  

// Build dedup key: Provider + Account Type

const provider = String(row[2] || '').trim().toLowerCase();

const acctType = String(row[6] || '').trim().toLowerCase();

if (provider) existingProviders.add(provider + '|' + acctType);

}

  

let nextId = maxId + 1;

let added = 0;

let skipped = 0;

const today = new Date().toISOString().slice(0, 10);

  

for (const acct of accounts) {

// Dedup check

const key = acct.provider.trim().toLowerCase() + '|' + acct.acctType.trim().toLowerCase();

if (existingProviders.has(key)) {

Logger.log('SKIP (exists): ' + acct.provider + ' / ' + acct.acctType);

skipped++;

continue;

}

  

// Build 35-column row

const mrId = 'MR-' + String(nextId).padStart(3, '0');

const row = new Array(35).fill('');

  

row[0] = mrId; // A: Row ID

row[1] = today; // B: Date Added

row[2] = acct.provider; // C: Provider/Creditor

row[3] = ''; // D: Mailing Address

row[4] = acct.ein; // E: Provider EIN

row[5] = acct.acctNumber; // F: Account Number

row[6] = acct.acctType; // G: Account Type

row[7] = acct.acctSubtype; // H: Account Subtype

row[8] = ''; // I: Account Agent

row[9] = ''; // J: Agent Address

row[10] = acct.status; // K: Status

row[11] = acct.opened; // L: Opened Date

row[12] = acct.closed; // M: Closed Date

row[13] = acct.balance; // N: Current Balance

row[14] = acct.highBal; // O: High Balance

row[15] = acct.monthlyPmt; // P: Monthly Payment

row[16] = ''; // Q: APR/Rate

row[17] = ''; // R: Billing Frequency

row[18] = ''; // S: Next Payment Due

row[19] = acct.primaryUser; // T: Primary User

row[20] = ''; // U: Secondary User

row[21] = ''; // V: Account Purpose

row[22] = ''; // W: Document Location

row[23] = '01/15/2026'; // X: Last Verified (credit report date)

row[24] = ''; // Y: Linked MR Account

row[25] = ''; // Z: Trust Assignment

row[26] = acct.taxRelevance; // AA: Tax Relevance

row[27] = ''; // AB: Tax Form

row[28] = ''; // AC: Deduction Type

row[29] = acct.creditStatus; // AD: Credit Report Status

row[30] = acct.removalDate; // AE: Removal Date

row[31] = ''; // AF: Dispute Status

row[32] = acct.notes; // AG: Notes

row[33] = acct.source; // AH: Source

row[34] = 'Newly Discovered'; // AI: Discovery Status

  

sheet.appendRow(row);

existingProviders.add(key);

nextId++;

added++;

Logger.log('ADDED: ' + mrId + ' — ' + acct.provider);

}

  

// Color-code the newly added rows

if (added > 0) {

colorCodeMasterRegisterRows_(sheet);

}

  

return { added: added, skipped: skipped };

}

  
  

// ─── ACCT LEDGER IMPORT ─────────────────────────────────────────────────────

  

function importToAcctLedger_(ss, accounts) {

let sheet = ss.getSheetByName('Acct Ledger');

if (!sheet) {

// Try alternate names

sheet = ss.getSheetByName('EIN Acct Ledger');

if (!sheet) {

Logger.log('WARNING: Acct Ledger sheet not found — creating it');

sheet = createAcctLedgerSheet_(ss);

}

}

  

const lastRow = sheet.getLastRow();

const lastCol = Math.max(sheet.getLastColumn(), 10);

  

// Read existing to dedup

let existingData = [];

if (lastRow > 1) {

existingData = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

}

  

// Build dedup set (Provider + EIN)

const existingEntries = new Set();

for (const row of existingData) {

const provider = String(row[0] || '').trim().toLowerCase();

const ein = String(row[1] || '').trim();

if (provider) existingEntries.add(provider + '|' + ein);

}

  

// Deduplicate accounts by provider+EIN (Nelnet appears 7 times but same EIN)

const uniqueAccounts = new Map();

for (const acct of accounts) {

const key = acct.provider.trim().toLowerCase() + '|' + acct.ein;

if (!uniqueAccounts.has(key)) {

uniqueAccounts.set(key, acct);

}

}

  

let added = 0;

let skipped = 0;

  

for (const [key, acct] of uniqueAccounts) {

if (existingEntries.has(key)) {

skipped++;

continue;

}

  

// Acct Ledger columns:

// A: Provider/Creditor

// B: Provider EIN

// C: Account Number

// D: Account Type

// E: Account Subtype

// F: Status

// G: Primary User

// H: Opened Date

// I: Closed Date

// J: MR Row ID (linked)

// K: Notes/Source

const row = [

acct.provider,

acct.ein,

acct.acctNumber,

acct.acctType,

acct.acctSubtype,

acct.status,

acct.primaryUser,

acct.opened,

acct.closed,

'', // MR Row ID — will need manual linking or lookup

acct.source,

];

  

sheet.appendRow(row);

existingEntries.add(key);

added++;

}

  

return { added: added, skipped: skipped };

}

  
  

function createAcctLedgerSheet_(ss) {

const sheet = ss.insertSheet('Acct Ledger');

  

const headers = [

'Provider/Creditor', 'Provider EIN', 'Account Number',

'Account Type', 'Account Subtype', 'Status',

'Primary User', 'Opened Date', 'Closed Date',

'MR Row ID', 'Source'

];

  

sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

sheet.getRange(1, 1, 1, headers.length)

.setBackground('#1B2A4A')

.setFontColor('#FFFFFF')

.setFontWeight('bold')

.setFontFamily('Calibri')

.setFontSize(10)

.setHorizontalAlignment('center');

  

sheet.setColumnWidth(1, 250);

sheet.setColumnWidth(2, 120);

sheet.setColumnWidth(3, 180);

sheet.setColumnWidth(4, 140);

sheet.setColumnWidth(5, 140);

sheet.setColumnWidth(6, 100);

sheet.setColumnWidth(7, 100);

sheet.setColumnWidth(8, 100);

sheet.setColumnWidth(9, 100);

sheet.setColumnWidth(10, 80);

sheet.setColumnWidth(11, 280);

  

sheet.setFrozenRows(1);

sheet.setTabColor('#1B2A4A');

  

return sheet;

}

  
  

// ─── COLOR CODING ───────────────────────────────────────────────────────────

  

function colorCodeMasterRegisterRows_(sheet) {

const lastRow = sheet.getLastRow();

if (lastRow < 2) return;

  

const statusCol = 11; // K: Status

const creditCol = 30; // AD: Credit Report Status

const statuses = sheet.getRange(2, statusCol, lastRow - 1, 1).getValues().flat();

const creditStatuses = sheet.getRange(2, creditCol, lastRow - 1, 1).getValues().flat();

  

for (let i = 0; i < statuses.length; i++) {

const status = String(statuses[i]).toLowerCase();

const credit = String(creditStatuses[i]).toLowerCase();

const rowNum = i + 2;

  

let bgColor = null;

if (credit.includes('charge-off') || credit.includes('charge off') || credit.includes('c/o')) {

bgColor = '#FFCDD2'; // Red — charge-off

} else if (credit.includes('collection')) {

bgColor = '#FFE0B2'; // Orange — collection

} else if (status === 'closed' && (credit.includes('paid') || credit.includes('transferred') || credit.includes('refinanced'))) {

bgColor = '#E0E0E0'; // Gray — closed/paid

} else if (status === 'active' && credit.includes('current')) {

bgColor = '#E8F5E9'; // Green — active/current

}

  

if (bgColor) {

sheet.getRange(rowNum, 1, 1, 35).setBackground(bgColor);

}

}

}

  
  

// ─── STANDALONE ACCT LEDGER POPULATION ──────────────────────────────────────

// Run this if you only want to populate the Acct Ledger without Master Register

  

function populateAcctLedgerOnly() {

const ss = SpreadsheetApp.getActiveSpreadsheet();

const accounts = getSyrinaCreditReportAccounts_();

const result = importToAcctLedger_(ss, accounts);

SpreadsheetApp.getUi().alert(

'Acct Ledger: ' + result.added + ' added, ' + result.skipped + ' skipped'

);

}

  
  

// ─── LINK MR IDs TO ACCT LEDGER ────────────────────────────────────────────

// Run after both sheets are populated to cross-reference MR IDs into Acct Ledger

  

function linkMRIdsToAcctLedger() {

const ss = SpreadsheetApp.getActiveSpreadsheet();

const mrSheet = ss.getSheetByName('Master Register');

let alSheet = ss.getSheetByName('Acct Ledger') || ss.getSheetByName('EIN Acct Ledger');

  

if (!mrSheet || !alSheet) {

SpreadsheetApp.getUi().alert('Both Master Register and Acct Ledger must exist.');

return;

}

  

// Build lookup: provider name → MR ID

const mrData = mrSheet.getRange(2, 1, mrSheet.getLastRow() - 1, 7).getValues();

const lookup = {};

for (const row of mrData) {

const mrId = String(row[0]);

const provider = String(row[2]).trim().toLowerCase();

if (mrId && provider) lookup[provider] = mrId;

}

  

// Update Acct Ledger col J (10) with MR IDs

const alLastRow = alSheet.getLastRow();

if (alLastRow < 2) return;

  

const alProviders = alSheet.getRange(2, 1, alLastRow - 1, 1).getValues().flat();

const mrIdCol = alSheet.getRange(2, 10, alLastRow - 1, 1);

const mrIds = mrIdCol.getValues();

  

let linked = 0;

for (let i = 0; i < alProviders.length; i++) {

const provider = String(alProviders[i]).trim().toLowerCase();

if (lookup[provider] && !mrIds[i][0]) {

mrIds[i][0] = lookup[provider];

linked++;

}

}

  

mrIdCol.setValues(mrIds);

SpreadsheetApp.getUi().alert('Linked ' + linked + ' MR IDs to Acct Ledger');

}
```