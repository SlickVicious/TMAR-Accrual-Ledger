/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SYNC CENTER — Accrual Ledger ↔ Google Sheets Integration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Phase 1 (Tier 1): Import sidebar — JSON paste/upload from Accrual Ledger
 * Phase 2 (Tier 2): Web App Bridge — doGet/doPost endpoints for Live Sync
 *
 * Menu item: TMAR Tools > Import > Import from Accrual Ledger...
 *
 * Created: 2026-03-04
 * Version: 3.0
 * ═══════════════════════════════════════════════════════════════════════════
 */


// ═══════════════════════════════════════════════════════════════════════════
// PHASE 1 — IMPORT SIDEBAR (Tier 1)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Shows the Import from Accrual Ledger sidebar.
 * Called from TMAR Tools > Import > Import from Accrual Ledger...
 */
function showLedgerImportDialog() {
  const html = `
    <style>
      body { font-family: Calibri, Arial, sans-serif; padding: 16px; color: #333; }
      h3 { color: #1B2A4A; margin-bottom: 4px; }
      .subtitle { font-size: 11px; color: #888; margin-bottom: 16px; }
      .section { margin-bottom: 16px; }
      .section-title { font-weight: bold; font-size: 12px; color: #1B2A4A; margin-bottom: 6px; }
      textarea { width: 100%; height: 150px; font-family: monospace; font-size: 10px; border: 1px solid #CCC; padding: 8px; box-sizing: border-box; resize: vertical; }
      select { width: 100%; padding: 6px; font-size: 12px; border: 1px solid #CCC; border-radius: 4px; margin-bottom: 10px; }
      .btn { padding: 10px 24px; font-size: 13px; border: none; border-radius: 4px; cursor: pointer; margin-top: 8px; margin-right: 8px; }
      .btn-primary { background: #1B2A4A; color: white; }
      .btn-secondary { background: #E0E0E0; color: #333; }
      .btn-success { background: #2E7D32; color: white; }
      #status { margin-top: 10px; font-size: 12px; }
      .success { color: #2E7D32; font-weight: bold; }
      .error { color: #B71C1C; font-weight: bold; }
      .info { color: #1565C0; }
      .help { font-size: 10px; color: #999; margin-top: 4px; line-height: 1.4; }
      .file-input { margin: 8px 0; }
      .tabs { display: flex; gap: 0; margin-bottom: 12px; }
      .tab { padding: 6px 14px; font-size: 12px; cursor: pointer; background: #f5f5f5; border: 1px solid #CCC; font-weight: 600; }
      .tab:first-child { border-radius: 4px 0 0 4px; }
      .tab:last-child { border-radius: 0 4px 4px 0; }
      .tab.active { background: #1B2A4A; color: white; border-color: #1B2A4A; }
    </style>
    <h3>Import from Accrual Ledger</h3>
    <div class="subtitle">Import JSON data exported from the TMAR Universal Accrual Ledger</div>

    <div class="section">
      <div class="section-title">Import Type</div>
      <select id="importType">
        <option value="entities">Entities → Master Register</option>
        <option value="transactions">Ledger Entries → Transaction Ledger</option>
        <option value="payables">Payables → Household Obligations</option>
        <option value="filings1099">1099 Filings → 1099 Filing Chain</option>
        <option value="full">Full Ledger Export (JSON) — Auto-detect all</option>
      </select>
    </div>

    <div class="section">
      <div class="section-title">Data Input</div>
      <div class="tabs">
        <div class="tab active" onclick="switchInputTab('paste')">Paste JSON</div>
        <div class="tab" onclick="switchInputTab('file')">Upload File</div>
      </div>
      <div id="pasteTab">
        <textarea id="jsonData" placeholder='Paste JSON data here...\\n\\nFor "Full Ledger Export", paste the entire appData JSON.\\nFor individual types, paste the array (e.g., entities array).'></textarea>
      </div>
      <div id="fileTab" style="display:none">
        <input type="file" id="fileInput" accept=".json,.csv" class="file-input" onchange="loadFile()" />
        <div class="help">Select a .json file exported from the Accrual Ledger Sync Center</div>
      </div>
    </div>

    <div>
      <button class="btn btn-primary" onclick="doImport()">Import</button>
      <button class="btn btn-secondary" onclick="google.script.host.close()">Cancel</button>
    </div>
    <div id="status"></div>

    <script>
      function switchInputTab(tab) {
        document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
        if (tab === 'paste') {
          document.getElementById('pasteTab').style.display = '';
          document.getElementById('fileTab').style.display = 'none';
          document.querySelectorAll('.tab')[0].classList.add('active');
        } else {
          document.getElementById('pasteTab').style.display = 'none';
          document.getElementById('fileTab').style.display = '';
          document.querySelectorAll('.tab')[1].classList.add('active');
        }
      }

      function loadFile() {
        var file = document.getElementById('fileInput').files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
          document.getElementById('jsonData').value = e.target.result;
          switchInputTab('paste');
        };
        reader.readAsText(file);
      }

      function doImport() {
        var json = document.getElementById('jsonData').value.trim();
        if (!json) { showStatus('No data to import', 'error'); return; }
        var type = document.getElementById('importType').value;
        showStatus('Importing ' + type + '...', 'info');

        google.script.run
          .withSuccessHandler(function(msg) { showStatus(msg, 'success'); })
          .withFailureHandler(function(err) { showStatus('Error: ' + err.message, 'error'); })
          .importFromLedger(type, json);
      }

      function showStatus(msg, cls) {
        document.getElementById('status').innerHTML = '<div class="' + cls + '">' + msg + '</div>';
      }
    </script>
  `;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(420).setHeight(550);
  SpreadsheetApp.getUi().showSidebar(output);
}


/**
 * Router function — dispatches import to the correct handler.
 * @param {string} type — 'entities', 'transactions', 'payables', 'filings1099', or 'full'
 * @param {string} jsonStr — JSON string of the data
 * @returns {string} success message
 */
function importFromLedger(type, jsonStr) {
  const data = JSON.parse(jsonStr);

  if (type === 'full') {
    // Full appData export — auto-detect and import all available
    const results = [];
    if (data.entities && data.entities.length > 0) {
      results.push(importLedgerEntities(data.entities));
    }
    if (data.ledgerEntries && data.ledgerEntries.length > 0) {
      results.push(importLedgerTransactions(data.ledgerEntries));
    }
    if (data.payables && data.payables.length > 0) {
      results.push(importLedgerPayables(data.payables));
    }
    if (data.filings) {
      const all1099 = [];
      Object.keys(data.filings).forEach(function(k) {
        if (k.startsWith('1099') && Array.isArray(data.filings[k])) {
          data.filings[k].forEach(function(f) { all1099.push({ type: k, data: f }); });
        }
      });
      if (all1099.length > 0) results.push(importLedger1099s(all1099));
    }
    if (results.length === 0) return 'No importable data found in the JSON export.';
    return results.join('\n');
  }

  if (type === 'entities') {
    const arr = Array.isArray(data) ? data : (data.entities || []);
    return importLedgerEntities(arr);
  }
  if (type === 'transactions') {
    const arr = Array.isArray(data) ? data : (data.ledgerEntries || []);
    return importLedgerTransactions(arr);
  }
  if (type === 'payables') {
    const arr = Array.isArray(data) ? data : (data.payables || []);
    return importLedgerPayables(arr);
  }
  if (type === 'filings1099') {
    // Accept either flat array of {type, data} or filings object
    let arr;
    if (Array.isArray(data)) {
      arr = data;
    } else if (data.filings) {
      arr = [];
      Object.keys(data.filings).forEach(function(k) {
        if (k.startsWith('1099') && Array.isArray(data.filings[k])) {
          data.filings[k].forEach(function(f) { arr.push({ type: k, data: f }); });
        }
      });
    } else {
      arr = [];
    }
    return importLedger1099s(arr);
  }

  throw new Error('Unknown import type: ' + type);
}


/**
 * Import entities from Accrual Ledger → Master Register.
 * Uses addAccountToMasterRegister() pattern.
 */
function importLedgerEntities(entities) {
  if (!entities || entities.length === 0) return 'No entities to import.';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Master Register');
  if (!sheet) throw new Error('Master Register tab not found');

  // Get existing providers for dedup
  const lastRow = sheet.getLastRow();
  const existingProviders = {};
  if (lastRow > 2) {
    const existingData = sheet.getRange(3, 3, lastRow - 2, 1).getValues(); // Col C = Provider
    existingData.forEach(function(r, i) {
      if (r[0]) existingProviders[String(r[0]).toLowerCase().trim()] = i + 3;
    });
  }

  // Find next Row ID number
  let nextId = 1;
  if (lastRow > 2) {
    const ids = sheet.getRange(3, 1, lastRow - 2, 1).getValues();
    ids.forEach(function(r) {
      const match = String(r[0]).match(/MR-(\d+)/);
      if (match) nextId = Math.max(nextId, parseInt(match[1]) + 1);
    });
  }

  let imported = 0;
  let skipped = 0;

  entities.forEach(function(e) {
    const name = (e.name || '').trim();
    if (!name) return;

    // Dedup by provider name
    if (existingProviders[name.toLowerCase()]) {
      skipped++;
      return;
    }

    const rowId = 'MR-' + String(nextId).padStart(3, '0');
    nextId++;

    // Entity type → Account Type mapping
    const typeMap = {
      'Trust': 'Trust Entity', 'LLC': 'LLC', 'Corporation': 'Corporation',
      'Individual': 'Individual', 'Employer': 'Employment W-2',
      'Bank': 'Banking Checking', 'Brokerage': 'Investment Brokerage',
      'Insurance': 'Insurance', 'Vendor': 'Vendor',
      'Government': 'Government Agency', 'Creditor': 'Credit Card'
    };

    const row = new Array(29).fill('');
    row[0] = rowId;
    row[1] = new Date().toISOString().slice(0, 10);
    row[2] = name;
    row[3] = ''; // Never import EINs — they come masked from the Ledger
    row[4] = e.accountNumber || '';
    row[5] = typeMap[e.type] || e.type || '';
    row[6] = e.subtype || '';
    row[7] = e.status || 'Active';
    row[14] = e.primaryUser || '';
    row[26] = e.notes || '';
    row[28] = 'Synced from Ledger';

    sheet.appendRow(row);
    existingProviders[name.toLowerCase()] = true;
    imported++;
  });

  return 'Imported ' + imported + ' entities to Master Register (' + skipped + ' duplicates skipped).';
}


/**
 * Import ledger entries from Accrual Ledger → Transaction Ledger.
 * Uses importCSVTransactions() pattern (append rows).
 */
function importLedgerTransactions(entries) {
  if (!entries || entries.length === 0) return 'No transactions to import.';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Transaction Ledger');
  if (!sheet) throw new Error('Transaction Ledger tab not found');

  const rows = [];
  entries.forEach(function(e) {
    const amount = (parseFloat(e.debit) || 0) - (parseFloat(e.credit) || 0);
    const row = [
      e.date || '',
      e.entity || e.entityId || '',
      e.category || '',
      e.subcategory || '',
      e.vendor || '',
      e.description || '',
      amount,
      e.paymentMethod || '',
      e.accountType || '',
      e.status || 'Posted',
      e.taxDeductible || '',
      e.businessUse || '',
      e.dueDay || '',
      e.recurring || '',
      e.notes || '',
      'Accrual Ledger'
    ];
    rows.push(row);
  });

  if (rows.length > 0) {
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, 16).setValues(rows);
  }

  return 'Imported ' + rows.length + ' transactions to Transaction Ledger.';
}


/**
 * Import payables from Accrual Ledger → Household Obligations.
 * Upserts by vendor name (updates existing, appends new).
 */
function importLedgerPayables(payables) {
  if (!payables || payables.length === 0) return 'No payables to import.';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Household Obligations');
  if (!sheet) throw new Error('Household Obligations tab not found');

  // Build vendor → row map for existing data
  const lastRow = sheet.getLastRow();
  const vendorMap = {};
  if (lastRow > 1) {
    const existing = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    existing.forEach(function(r, i) {
      if (r[0]) vendorMap[String(r[0]).toLowerCase().trim()] = i + 2;
    });
  }

  let imported = 0;
  let updated = 0;

  payables.forEach(function(p) {
    const vendor = (p.vendor || p.name || '').trim();
    if (!vendor) return;

    const dueDay = p.dueDay || '';
    const row = [
      vendor,
      p.category || '',
      p.subcategory || '',
      p.amount || p.monthlyAmount || '',
      dueDay,
      p.paymentMethod || '',
      p.responsibleParty || p.party || '',
      p.status || 'Active',
      p.startDate || '',
      p.rateChanges || '',
      p.notes || ''
    ];

    const existingRow = vendorMap[vendor.toLowerCase()];
    if (existingRow) {
      // Update existing row
      sheet.getRange(existingRow, 1, 1, 11).setValues([row]);
      updated++;
    } else {
      // Append new
      sheet.appendRow(row);
      vendorMap[vendor.toLowerCase()] = sheet.getLastRow();
      imported++;
    }
  });

  return 'Imported ' + imported + ' new, updated ' + updated + ' existing payables in Household Obligations.';
}


/**
 * Import 1099 filings from Accrual Ledger → 1099 Filing Chain.
 * Each item: { type: '1099-A', data: { ... } }
 */
function importLedger1099s(filings) {
  if (!filings || filings.length === 0) return 'No 1099 filings to import.';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('1099 Filing Chain');
  if (!sheet) throw new Error('1099 Filing Chain tab not found');

  // Find last data row (skip header rows 1-2 and explanatory rows 3-4)
  const lastRow = Math.max(sheet.getLastRow(), 4);

  const rows = [];
  filings.forEach(function(item, idx) {
    const f = item.data || item;
    const type = item.type || '1099';

    const row = new Array(15).fill('');
    row[0] = f.assetId || f.id || ('LED-' + String(idx + 1).padStart(3, '0'));
    row[1] = f.assetDescription || f.description || f.payerName || '';
    row[2] = f.acquisitionDate || f.dateAcquired || '';

    if (type === '1099-A') {
      row[3] = 'Yes'; row[4] = f.date || f.filingDate || ''; row[5] = f.status || 'Filed';
    } else if (type === '1099-B') {
      row[6] = 'Yes'; row[7] = f.date || f.filingDate || ''; row[8] = f.status || 'Filed';
    }
    row[13] = f.status || 'Pending';
    row[14] = (f.notes || '') + ' [Imported from Ledger: ' + type + ']';

    rows.push(row);
  });

  if (rows.length > 0) {
    sheet.getRange(lastRow + 1, 1, rows.length, 15).setValues(rows);
  }

  return 'Imported ' + rows.length + ' 1099 filings to Filing Chain.';
}


// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2 — WEB APP BRIDGE (Tier 2)
// ═══════════════════════════════════════════════════════════════════════════
// doGet/doPost endpoints for bidirectional sync between Accrual Ledger HTML
// app and this Google Sheet. Deploy as Web App (Execute as: Me, Access: Anyone).
//
// Usage from Accrual Ledger:
//   GET  ?action=ping                → connection test
//   GET  ?action=pullAccounts        → read Master Register → JSON
//   GET  ?action=pullTransactions    → read Transaction Ledger → JSON
//   GET  ?action=pullObligations     → read Household Obligations → JSON
//   GET  ?action=pull1099            → read 1099 Filing Chain → JSON
//   GET  ?action=pullValidation      → read _Validation lists → JSON
//   POST {action:'pushEntities', entities:[...]}     → write to Master Register
//   POST {action:'pushTransactions', entries:[...]}  → write to Transaction Ledger
//   POST {action:'pushPayables', payables:[...]}     → write to Household Obligations
//   POST {action:'push1099', filings:[...]}          → write to 1099 Filing Chain
//   POST {action:'fullSync', data:{...}}             → write to all sheets
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// SINGLE SOURCE OF TRUTH — every workbook ID + the Web App URL live here only.
// Target architecture (2 books): "TMAR Live" (read/write) + "Archive" (read-only).
// After the Google-side merge, set liveBookId/sourceBookId/appcHubId to the SAME
// merged-book ID — every reference below (and across this file) follows automatically.
// ═══════════════════════════════════════════════════════════════════════════
var TMAR_CONFIG = {
  liveBookId:    '1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ', // TMAR — Web App context (Master Register, ledgers; menu + sync target). Form imports write here.
  sourceBookId:  '1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ', // = liveBookId. Old Wimberly source (1CYg4fwQ…) was DELETED 2026-06-27 → folded into Live; pulls now read the same book imports write to.
  appcHubId:     '1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ', // = liveBookId. APPC hub (1Ac5A…) folded into Live 2026-06-27 (MigrateAppcToLive.gs); its TMAR—/FWM— tabs now read from Live.
  archiveBookId: '1kbulI33th8uOmrumj7RkiJ8aqZs48gqzujrXUmNRjk8', // Freeway 2025 — LEGACY, read-only Archive (never write)
  execUrl:       'https://script.google.com/macros/s/AKfycbzpeegvE52lvqCTMyKrsdaa_4JFfjM6MQrsJkU8zb17fkUJzPRasUU0fjONdaHkM5dh/exec'
};

/** Spreadsheet ID for Web App context (getActiveSpreadsheet() won't work in doGet/doPost) */
var TMAR_SPREADSHEET_ID_ = TMAR_CONFIG.liveBookId;

/** Wimberly Unified Master Register — workbook tabs to pull into TMAR */
var WORKBOOK_ID_ = TMAR_CONFIG.sourceBookId;
// Tabs the DFC "Sheets Data" view pulls — selected by NAME (GID-drift-proof; survives tab moves/merges).
// Empty → defaults to the form-data tabs in FORM_PULL_CONFIG_. Override per-request with ?tabs=Name1,Name2.
var WORKBOOK_TARGET_TABS_ = [];

/**
 * Table-driven config for Artifactory pull endpoints (GSheet → Artifactory).
 * fields[] maps column index → contract field name (matches push payload keys).
 * taxYearCol is the 0-indexed column that holds the tax_year value for filtering.
 * worksheetTypeCol is the 0-indexed column for worksheet_type filtering (pullWorksheetData only).
 */
var FORM_PULL_CONFIG_ = {
  pullSubstituteW2: {
    sheet: 'W-2 & Income Detail', taxYearCol: 0,
    fields: ['tax_year','form_type','taxpayer_name','taxpayer_ssn','taxpayer_address',
             'employer_name','employer_tin','wages','fed_withheld',
             'determination_1','determination_2','efforts_1','efforts_2','submitted_at','source']
  },
  pullForm1040: {
    sheet: '1040 Submissions', taxYearCol: 0,
    fields: ['tax_year','filing_status','taxpayer_first_name','taxpayer_last_name','taxpayer_ssn',
             'taxpayer_address','taxpayer_city_state_zip',
             'wages_line1','taxable_interest_line2b','ordinary_dividends_line3b',
             'capital_gain_line7','other_income_line8','total_income_line9',
             'agi_line11','deductions_line12','taxable_income_line15',
             'tax_line16','total_tax_line24','fed_withholding_line25a',
             'total_payments_line33','refund_line34','amount_owed_line37',
             'submitted_at','source']
  },
  pullScheduleA: {
    sheet: 'Schedule A', taxYearCol: 0,
    fields: ['tax_year','taxpayer_name','taxpayer_ssn',
             'medical_expenses_line4','taxes_paid_line7','interest_paid_line10',
             'charity_gifts_line14','casualty_theft_line15',
             'other_deductions_line16','total_deductions_line17','submitted_at','source']
  },
  pullSchedule1: {
    sheet: 'Schedule 1', taxYearCol: 0,
    fields: ['tax_year','taxpayer_name','taxpayer_ssn',
             'part1_total','part2_total','lines_data','submitted_at','source']
  },
  pullSchedule2: {
    sheet: 'Schedule 2', taxYearCol: 0,
    fields: ['tax_year','taxpayer_name','taxpayer_ssn',
             'part1_total','part2_total','lines_data','submitted_at','source']
  },
  pullWorksheetData: {
    sheet: 'Tax Worksheets', taxYearCol: 0, worksheetTypeCol: 3,
    fields: ['tax_year','taxpayer_name','taxpayer_ssn',
             'worksheet_type','data_blob','submitted_at','source']
  }
};

/**
 * Open the TMAR spreadsheet by ID (for Web App context).
 * In sidebar context, getActiveSpreadsheet() works. In Web App, it doesn't.
 */
function getTMARSpreadsheet_() {
  return SpreadsheetApp.openById(TMAR_SPREADSHEET_ID_);
}

/**
 * Read active year from a given spreadsheet object (Web App-safe variant).
 * @param {Spreadsheet} ss - The spreadsheet to read from.
 * @return {string} The active year string.
 */
function getActiveYearFromSS_(ss) {
  var settings = ss.getSheetByName('_Settings');
  if (!settings) return String(DEFAULT_YEAR_);
  var val = settings.getRange('B1').getValue();
  return val ? String(val) : String(DEFAULT_YEAR_);
}

/**
 * Create a JSON ContentService response.
 * @param {Object} data - The data object to serialize.
 * @return {TextOutput} JSON response.
 */
function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create a JSON error response.
 * @param {string} message - The error message.
 * @return {TextOutput} JSON error response.
 */
function errorResponse_(message) {
  return jsonResponse_({ status: 'error', message: message });
}

/**
 * Mask an EIN for security (server-side, matches client maskEIN()).
 * @param {string} ein - Raw EIN like '41-6809588'.
 * @return {string} Masked EIN like '••-•••9588'.
 */
function maskEIN_(ein) {
  if (!ein) return '';
  var s = String(ein).replace(/[^0-9]/g, '');
  if (s.length < 4) return '\u2022\u2022-\u2022\u2022\u2022\u2022\u2022\u2022\u2022';
  return '\u2022\u2022-\u2022\u2022\u2022' + s.slice(-4);
}

/**
 * Ensure the _SyncMeta sheet exists for tracking sync timestamps.
 * @param {Spreadsheet} ss - The spreadsheet.
 * @return {Sheet} The _SyncMeta sheet.
 */
function ensureSyncMetaSheet_(ss) {
  var sheet = ss.getSheetByName('_SyncMeta');
  if (sheet) return sheet;

  sheet = ss.insertSheet('_SyncMeta');
  sheet.getRange('A1:E1').setValues([['Sheet Name', 'Last Push', 'Last Pull', 'Push Count', 'Pull Count']]);
  sheet.getRange('A1:E1').setFontWeight('bold');

  var sheets = ['Master Register', 'Transaction Ledger', 'Household Obligations', '1099 Filing Chain',
                'Principal Register', 'Contacts', 'Website Accounts'];
  for (var i = 0; i < sheets.length; i++) {
    sheet.getRange(i + 2, 1, 1, 5).setValues([[sheets[i], '', '', 0, 0]]);
  }

  sheet.setTabColor('#9E9E9E');
  sheet.hideSheet();
  Logger.log('_SyncMeta sheet created');
  return sheet;
}

/**
 * Update sync timestamp in _SyncMeta for a given sheet.
 * @param {Spreadsheet} ss - The spreadsheet.
 * @param {string} sheetName - The sheet that was synced.
 * @param {string} direction - 'push' or 'pull'.
 */
function updateSyncTimestamp_(ss, sheetName, direction) {
  var meta = ensureSyncMetaSheet_(ss);
  var data = meta.getRange(2, 1, meta.getLastRow() - 1, 5).getValues();
  var now = new Date().toISOString();

  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === sheetName) {
      var row = i + 2;
      if (direction === 'push') {
        meta.getRange(row, 2).setValue(now);
        meta.getRange(row, 4).setValue((data[i][3] || 0) + 1);
      } else {
        meta.getRange(row, 3).setValue(now);
        meta.getRange(row, 5).setValue((data[i][4] || 0) + 1);
      }
      return;
    }
  }
  // Sheet not in meta yet — add it
  var newRow = [sheetName, direction === 'push' ? now : '', direction === 'pull' ? now : '', direction === 'push' ? 1 : 0, direction === 'pull' ? 1 : 0];
  meta.appendRow(newRow);
}

/**
 * Validate a payload has required fields.
 * @param {Array} data - Array of objects to validate.
 * @param {Array<string>} requiredFields - Field names that must be non-empty.
 * @return {Object} { valid: boolean, message: string }
 */
function validatePayload_(data, requiredFields) {
  if (!Array.isArray(data)) return { valid: false, message: 'Payload must be an array' };
  if (data.length === 0) return { valid: false, message: 'Payload is empty' };
  for (var i = 0; i < Math.min(data.length, 5); i++) {
    for (var j = 0; j < requiredFields.length; j++) {
      if (!data[i][requiredFields[j]] && data[i][requiredFields[j]] !== 0) {
        return { valid: false, message: 'Record ' + i + ' missing required field: ' + requiredFields[j] };
      }
    }
  }
  return { valid: true, message: 'ok' };
}

/**
 * Generic sheet data reader — reads rows from a sheet and returns JSON objects.
 * @param {Spreadsheet} ss - The spreadsheet.
 * @param {string} sheetName - Tab name to read.
 * @param {number} startRow - First data row (1-indexed).
 * @param {Array<string>} headers - Column header names for JSON keys.
 * @param {Object} [options] - Optional: { einColumn: number (0-indexed) }
 * @return {Array<Object>} Array of row objects.
 */
function pullSheetData_(ss, sheetName, startRow, headers, options) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow < startRow) return [];

  var numCols = headers.length;
  var data = sheet.getRange(startRow, 1, lastRow - startRow + 1, numCols).getValues();
  var results = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    // Skip completely empty rows
    var hasData = false;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== '' && row[c] !== null && row[c] !== undefined) { hasData = true; break; }
    }
    if (!hasData) continue;

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      // Mask EINs if specified
      if (options && options.einColumn === j && val) {
        val = maskEIN_(val);
      }
      // Convert Date objects to ISO strings; coerce others to string
      if (val instanceof Date) {
        val = val.toISOString().slice(0, 10);
      } else if (val !== null && val !== undefined && val !== '' && typeof val !== 'string') {
        val = String(val);
      }
      obj[headers[j]] = val;
    }
    results.push(obj);
  }

  return results;
}


// ─── doGet() — GET Request Dispatcher ────────────────────────────────────────

/**
 * Web App GET endpoint. Dispatches based on ?action= parameter.
 * Deploy as: Execute as Me, Access Anyone.
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

  try {
    var ss = getTMARSpreadsheet_();

    switch (action) {
      case 'ping':
        return jsonResponse_({
          status: 'ok',
          version: '3.0',
          year: getActiveYearFromSS_(ss),
          sheetId: TMAR_SPREADSHEET_ID_,
          timestamp: new Date().toISOString()
        });

      case 'pullAccounts':
        var accounts = pullSheetData_(ss, 'Master Register', 3, [
          'rowId', 'dateAdded', 'provider', 'ein', 'accountNumber',
          'accountType', 'accountSubtype', 'status', 'openDate', 'startDate',
          'endDate', 'currentBalance', 'monthlyPayment', 'interestRate', 'primaryUser',
          'secondaryUser', 'autopay', 'paperless', 'loginUrl', 'contactPhone',
          'contactEmail', 'lastVerified', 'verifiedBy', 'taxRelevant', 'taxCategory',
          'linkedEntities', 'notes', 'actionItems', 'source'
        ], { einColumn: 3 });
        updateSyncTimestamp_(ss, 'Master Register', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pullAccounts', count: accounts.length, data: accounts });

      case 'pullTransactions':
        var txns = pullSheetData_(ss, 'Transaction Ledger', 2, [
          'date', 'description', 'category', 'account', 'debit',
          'credit', 'balance', 'method', 'reference', 'vendor',
          'taxDeductible', 'receipt', 'reconciled', 'notes', 'source',
          'importDate'
        ]);
        updateSyncTimestamp_(ss, 'Transaction Ledger', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pullTransactions', count: txns.length, data: txns });

      case 'pullObligations':
        var obls = pullSheetData_(ss, 'Household Obligations', 2, [
          'vendor', 'category', 'accountNumber', 'monthlyAmount',
          'dueDay', 'autopay', 'status', 'lastPaid',
          'annualTotal', 'startDate', 'notes'
        ]);
        updateSyncTimestamp_(ss, 'Household Obligations', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pullObligations', count: obls.length, data: obls });

      case 'pullChartOfAccounts': {
        var coaRows = pullSheetData_(ss, 'GAAP CoA', 2, [
          'num', 'name', 'type', 'subtype', 'normalBal', 'formLine'
        ]);
        updateSyncTimestamp_(ss, 'GAAP CoA', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pullChartOfAccounts', count: coaRows.length, data: coaRows });
      }

      case 'pullReceivables': {
        var arRows = pullSheetData_(ss, 'Receivables', 2, [
          'invoiceNum', 'customer', 'entityId', 'date', 'dueDate', 'amount', 'balance', 'isIntercompany'
        ]);
        updateSyncTimestamp_(ss, 'Receivables', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pullReceivables', count: arRows.length, data: arRows });
      }

      case 'pullJournalEntries': {
        var jeRows = pullSheetData_(ss, 'Journal', 2, [
          'number', 'date', 'reference', 'type', 'description', 'account', 'debit', 'credit', 'status'
        ]);
        updateSyncTimestamp_(ss, 'Journal', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pullJournalEntries', count: jeRows.length, data: jeRows });
      }

      case 'pull1099':
        var filings = pullSheetData_(ss, '1099 Filing Chain', 5, [
          'assetId', 'description', 'acquisitionDate', '1099A_filed', '1099A_date',
          '1099A_status', '1099B_filed', '1099B_date', '1099B_status', '1099C_filed',
          '1099C_date', '1099C_status', 'fairMarketValue', 'status', 'notes'
        ]);
        updateSyncTimestamp_(ss, '1099 Filing Chain', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pull1099', count: filings.length, data: filings });

      case 'pullPrincipalRegister': {
        var principals = pullSheetData_(ss, 'Principal Register', 2, [
          'entityId', 'entityType', 'legalName', 'dbaName', 'ein',
          'mailingAddress', 'city', 'state', 'zip',
          'primaryTrustee', 'coTrustee', 'registeredState', 'dateEstablished',
          'bankName', 'branch', 'accountNumber', 'routingNumber',
          'accountType', 'accountHolderName', 'notes'
        ], { einColumn: 4 });
        updateSyncTimestamp_(ss, 'Principal Register', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pullPrincipalRegister', count: principals.length, data: principals });
      }

      case 'pullContacts': {
        var contacts = pullSheetData_(ss, 'Contacts', 2, [
          'contactId', 'role', 'fullName', 'organization',
          'phone', 'email', 'mailingAddress', 'relatedEntity', 'notes'
        ]);
        updateSyncTimestamp_(ss, 'Contacts', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pullContacts', count: contacts.length, data: contacts });
      }

      case 'pullWebsiteAccounts': {
        var webAccts = pullSheetData_(ss, 'Website Accounts', 2, [
          'accountId', 'platform', 'url', 'username',
          'linkedEntity', 'mfaMethod', 'lastVerified', 'notes'
        ]);
        updateSyncTimestamp_(ss, 'Website Accounts', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pullWebsiteAccounts', count: webAccts.length, data: webAccts });
      }

      case 'pullValidation':
        var valSheet = ss.getSheetByName('_Validation');
        var valData = { accountTypes: [], statuses: [], priorities: [], primaryUsers: [] };
        if (valSheet) {
          var valLastRow = valSheet.getLastRow();
          if (valLastRow > 1) {
            var valRange = valSheet.getRange(2, 1, valLastRow - 1, 4).getValues();
            for (var v = 0; v < valRange.length; v++) {
              if (valRange[v][0]) valData.accountTypes.push(valRange[v][0]);
              if (valRange[v][1]) valData.statuses.push(valRange[v][1]);
              if (valRange[v][2]) valData.priorities.push(valRange[v][2]);
              if (valRange[v][3]) valData.primaryUsers.push(valRange[v][3]);
            }
          }
        }
        return jsonResponse_({ status: 'ok', action: 'pullValidation', data: valData });

      // ─── Dynamic Tab Access (COA Import Wizard) ──────────────────────

      case 'listSheetTabs':
        var sheets = ss.getSheets();
        var tabList = [];
        for (var si = 0; si < sheets.length; si++) {
          var sName = sheets[si].getName();
          if (sName.charAt(0) !== '_') {
            tabList.push(sName);
          }
        }
        return jsonResponse_({ status: 'ok', action: 'listSheetTabs', tabs: tabList });

      case 'pullRawTab':
        var tabName = (e.parameter && e.parameter.tab) ? e.parameter.tab : '';
        if (!tabName) return errorResponse_('Missing ?tab= parameter');
        var rawSheet = ss.getSheetByName(tabName);
        if (!rawSheet) return errorResponse_('Sheet not found: ' + tabName);
        var rawLastRow = rawSheet.getLastRow();
        var rawLastCol = rawSheet.getLastColumn();
        if (rawLastRow < 1 || rawLastCol < 1) {
          return jsonResponse_({ status: 'ok', action: 'pullRawTab', tab: tabName, headers: [], rows: [] });
        }
        var rawHeaders = rawSheet.getRange(1, 1, 1, rawLastCol).getValues()[0].map(function(h) {
          return h !== null && h !== undefined ? String(h).trim() : '';
        });
        var rawRows = [];
        if (rawLastRow > 1) {
          var rawVals = rawSheet.getRange(2, 1, rawLastRow - 1, rawLastCol).getValues();
          for (var ri = 0; ri < rawVals.length; ri++) {
            var rRow = rawVals[ri];
            var rHas = false;
            for (var rc = 0; rc < rRow.length; rc++) {
              if (rRow[rc] !== '' && rRow[rc] !== null && rRow[rc] !== undefined) { rHas = true; break; }
            }
            if (!rHas) continue;
            var rArr = [];
            for (var rj = 0; rj < rRow.length; rj++) {
              var rv = rRow[rj];
              if (rv instanceof Date) rv = rv.toISOString().slice(0, 10);
              rArr.push(rv !== null && rv !== undefined ? String(rv) : '');
            }
            rawRows.push(rArr);
          }
        }
        return jsonResponse_({ status: 'ok', action: 'pullRawTab', tab: tabName, headers: rawHeaders, rows: rawRows });

      // ─── Workbook Sheet Integration (Wimberly Unified Master Register) ──
      case 'listWorkbookTabs': {
        var wbSS = SpreadsheetApp.openById(WORKBOOK_ID_);
        var wbTabs = wbSS.getSheets().map(function(s) {
          return { name: s.getName(), gid: s.getSheetId(), hidden: s.isSheetHidden() };
        });
        return jsonResponse_({ status: 'ok', action: 'listWorkbookTabs', spreadsheetId: WORKBOOK_ID_, tabs: wbTabs });
      }

      case 'pullWorkbookSheets': {
        var wbSS2 = SpreadsheetApp.openById(WORKBOOK_ID_);
        // Name-based selection (GID-drift-proof). Priority: ?tabs= → WORKBOOK_TARGET_TABS_ → FORM_PULL_CONFIG_ data tabs.
        var wantTabs = [];
        if (e.parameter && e.parameter.tabs) {
          wantTabs = String(e.parameter.tabs).split(',').map(function(s) { return s.trim(); }).filter(String);
        } else if (WORKBOOK_TARGET_TABS_ && WORKBOOK_TARGET_TABS_.length) {
          wantTabs = WORKBOOK_TARGET_TABS_.slice();
        } else {
          Object.keys(FORM_PULL_CONFIG_).forEach(function(k) {
            var n = FORM_PULL_CONFIG_[k].sheet;
            if (n && wantTabs.indexOf(n) === -1) wantTabs.push(n);
          });
        }
        var sheetData = {};
        wbSS2.getSheets().forEach(function(sheet) {
          if (wantTabs.indexOf(sheet.getName()) === -1) return;
          var gid = sheet.getSheetId();
          var lastRow = sheet.getLastRow();
          var lastCol = sheet.getLastColumn();
          if (lastRow < 1 || lastCol < 1) {
            sheetData[sheet.getName()] = { gid: gid, headers: [], rows: [] };
            return;
          }
          var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
            return (h !== null && h !== undefined) ? String(h).trim() : '';
          });
          var rows = [];
          if (lastRow > 1) {
            sheet.getRange(2, 1, lastRow - 1, lastCol).getValues().forEach(function(row) {
              var hasData = row.some(function(c) { return c !== '' && c !== null && c !== undefined; });
              if (!hasData) return;
              var obj = {};
              headers.forEach(function(h, i) {
                var v = row[i];
                if (v instanceof Date) v = v.toISOString().slice(0, 10);
                obj[h || ('col' + (i + 1))] = (v !== null && v !== undefined) ? String(v) : '';
              });
              rows.push(obj);
            });
          }
          sheetData[sheet.getName()] = { gid: gid, headers: headers, rows: rows };
        });
        return jsonResponse_({ status: 'ok', action: 'pullWorkbookSheets', sheets: sheetData, timestamp: new Date().toISOString() });
      }

      // ─── Artifactory Pull Endpoints (GSheet → Artifactory) ──────────────

      case 'pullSubstituteW2': {
        var w2PullData = pullFormTab_(ss, FORM_PULL_CONFIG_['pullSubstituteW2'],
          (e.parameter && e.parameter.tax_year) || null,
          parseInt((e.parameter && e.parameter.limit) || 0), null);
        return jsonResponse_({ status: 'ok', action: action, count: w2PullData.length, data: w2PullData });
      }

      case 'pullForm1040': {
        var f1040PullData = pullFormTab_(ss, FORM_PULL_CONFIG_['pullForm1040'],
          (e.parameter && e.parameter.tax_year) || null,
          parseInt((e.parameter && e.parameter.limit) || 0), null);
        return jsonResponse_({ status: 'ok', action: action, count: f1040PullData.length, data: f1040PullData });
      }

      case 'pullScheduleA': {
        var schAPullData = pullFormTab_(ss, FORM_PULL_CONFIG_['pullScheduleA'],
          (e.parameter && e.parameter.tax_year) || null,
          parseInt((e.parameter && e.parameter.limit) || 0), null);
        return jsonResponse_({ status: 'ok', action: action, count: schAPullData.length, data: schAPullData });
      }

      case 'pullSchedule1': {
        var sch1PullData = pullFormTab_(ss, FORM_PULL_CONFIG_['pullSchedule1'],
          (e.parameter && e.parameter.tax_year) || null,
          parseInt((e.parameter && e.parameter.limit) || 0), null);
        return jsonResponse_({ status: 'ok', action: action, count: sch1PullData.length, data: sch1PullData });
      }

      case 'pullSchedule2': {
        var sch2PullData = pullFormTab_(ss, FORM_PULL_CONFIG_['pullSchedule2'],
          (e.parameter && e.parameter.tax_year) || null,
          parseInt((e.parameter && e.parameter.limit) || 0), null);
        return jsonResponse_({ status: 'ok', action: action, count: sch2PullData.length, data: sch2PullData });
      }

      case 'pullWorksheetData': {
        var wsPullData = pullFormTab_(ss, FORM_PULL_CONFIG_['pullWorksheetData'],
          (e.parameter && e.parameter.tax_year) || null,
          parseInt((e.parameter && e.parameter.limit) || 0),
          (e.parameter && e.parameter.worksheet_type) || null);
        return jsonResponse_({ status: 'ok', action: action, count: wsPullData.length, data: wsPullData });
      }

      case 'pullForm2848': {
        var faSheet2848 = ss.getSheetByName('Forms & Authority');
        if (!faSheet2848) return jsonResponse_({ status: 'ok', action: action, count: 0, data: [] });
        var limit2848 = parseInt((e.parameter && e.parameter.limit) || 0);
        var fields2848 = ['taxpayer_name_and_address','taxpayer_ssn','taxpayer_phone',
                          'representative_name_and_address','representative_caf','representative_ptin',
                          'representative_phone','authorized_tax_years','submitted_at','source'];
        var lastRow2848 = faSheet2848.getLastRow();
        var data2848 = [];
        if (lastRow2848 > 1) {
          var rows2848 = faSheet2848.getRange(2, 1, lastRow2848 - 1, 10).getValues();
          for (var ri2848 = 0; ri2848 < rows2848.length; ri2848++) {
            var r2848 = rows2848[ri2848];
            if (!r2848[0] || String(r2848[0]).indexOf('Form ') === 0) continue;
            var obj2848 = {};
            for (var fi2848 = 0; fi2848 < fields2848.length; fi2848++) {
              var v2848 = r2848[fi2848];
              if (v2848 instanceof Date) v2848 = v2848.toISOString().slice(0, 10);
              obj2848[fields2848[fi2848]] = (v2848 !== null && v2848 !== undefined) ? v2848 : '';
            }
            data2848.push(obj2848);
          }
        }
        data2848.reverse();
        if (limit2848 > 0) data2848 = data2848.slice(0, limit2848);
        return jsonResponse_({ status: 'ok', action: action, count: data2848.length, data: data2848 });
      }

      case 'pullForm8275R': {
        var faSheet8275 = ss.getSheetByName('Forms & Authority');
        if (!faSheet8275) return jsonResponse_({ status: 'ok', action: action, count: 0, data: [] });
        var limit8275 = parseInt((e.parameter && e.parameter.limit) || 0);
        var fields8275 = ['form_type','taxpayer_name','taxpayer_ssn',
                          'amount_1','explanation','submitted_at','source'];
        var lastRow8275 = faSheet8275.getLastRow();
        var data8275 = [];
        if (lastRow8275 > 1) {
          var rows8275 = faSheet8275.getRange(2, 1, lastRow8275 - 1, 7).getValues();
          for (var ri8275 = 0; ri8275 < rows8275.length; ri8275++) {
            var r8275 = rows8275[ri8275];
            if (String(r8275[0]) !== 'Form 8275-R') continue;
            var obj8275 = {};
            for (var fi8275 = 0; fi8275 < fields8275.length; fi8275++) {
              var v8275 = r8275[fi8275];
              if (v8275 instanceof Date) v8275 = v8275.toISOString().slice(0, 10);
              obj8275[fields8275[fi8275]] = (v8275 !== null && v8275 !== undefined) ? v8275 : '';
            }
            data8275.push(obj8275);
          }
        }
        data8275.reverse();
        if (limit8275 > 0) data8275 = data8275.slice(0, limit8275);
        return jsonResponse_({ status: 'ok', action: action, count: data8275.length, data: data8275 });
      }

      case 'pullAdminForms': {
        var faSheetAdm = ss.getSheetByName('Forms & Authority');
        if (!faSheetAdm) return jsonResponse_({ status: 'ok', action: action, count: 0, data: [] });
        var filterFtAdm = (e.parameter && e.parameter.form_type) ? ('Form ' + e.parameter.form_type) : null;
        var filterYrAdm = (e.parameter && e.parameter.tax_year) || null;
        var limitAdm = parseInt((e.parameter && e.parameter.limit) || 0);
        var adminTypesList = ['Form 8453', 'Form 8867', 'Form 8879'];
        var adminFields = ['form_type','tax_year','taxpayer_name','taxpayer_ssn',
                           'spouse_name','spouse_ssn','form_data','submitted_at','source'];
        var lastRowAdm = faSheetAdm.getLastRow();
        var dataAdm = [];
        if (lastRowAdm > 1) {
          var rowsAdm = faSheetAdm.getRange(2, 1, lastRowAdm - 1, 9).getValues();
          for (var riAdm = 0; riAdm < rowsAdm.length; riAdm++) {
            var rAdm = rowsAdm[riAdm];
            if (adminTypesList.indexOf(String(rAdm[0])) === -1) continue;
            if (filterFtAdm && String(rAdm[0]) !== filterFtAdm) continue;
            if (filterYrAdm && String(rAdm[1]) !== String(filterYrAdm)) continue;
            var objAdm = {};
            for (var fiAdm = 0; fiAdm < adminFields.length; fiAdm++) {
              var vAdm = rAdm[fiAdm];
              if (vAdm instanceof Date) vAdm = vAdm.toISOString().slice(0, 10);
              objAdm[adminFields[fiAdm]] = (vAdm !== null && vAdm !== undefined) ? vAdm : '';
            }
            dataAdm.push(objAdm);
          }
        }
        dataAdm.reverse();
        if (limitAdm > 0) dataAdm = dataAdm.slice(0, limitAdm);
        return jsonResponse_({ status: 'ok', action: action, count: dataAdm.length, data: dataAdm });
      }

      default:
        return errorResponse_('Unknown action: ' + action + '. Valid: ping, pullAccounts, pullTransactions, pullObligations, pull1099, pullValidation, pullPrincipalRegister, pullContacts, pullWebsiteAccounts, listSheetTabs, pullRawTab, listWorkbookTabs, pullWorkbookSheets, pullSubstituteW2, pullForm1040, pullScheduleA, pullSchedule1, pullSchedule2, pullWorksheetData, pullForm2848, pullForm8275R, pullAdminForms');
    }

  } catch (err) {
    return errorResponse_(err.message || String(err));
  }
}


// ─── doPost() — POST Request Dispatcher ──────────────────────────────────────

/**
 * Web App POST endpoint. Payload in e.postData.contents (JSON string).
 * Content-Type must be 'text/plain' to avoid CORS preflight.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return errorResponse_('No POST body received');
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return errorResponse_('Invalid JSON: ' + parseErr.message);
    }

    var action = payload.action || '';
    var ss = getTMARSpreadsheet_();

    switch (action) {
      case 'pushEntities':
        var entV = validatePayload_(payload.entities, ['name']);
        if (!entV.valid) return errorResponse_(entV.message);
        var entResult = pushEntities_(ss, payload.entities);
        updateSyncTimestamp_(ss, 'Master Register', 'push');
        return jsonResponse_(entResult);

      case 'pushTransactions':
        var txnV = validatePayload_(payload.entries, ['date', 'description']);
        if (!txnV.valid) return errorResponse_(txnV.message);
        var txnResult = pushTransactions_(ss, payload.entries);
        updateSyncTimestamp_(ss, 'Transaction Ledger', 'push');
        return jsonResponse_(txnResult);

      case 'pushPayables':
        var payV = validatePayload_(payload.payables, ['vendor']);
        if (!payV.valid) return errorResponse_(payV.message);
        var payResult = pushPayables_(ss, payload.payables);
        updateSyncTimestamp_(ss, 'Household Obligations', 'push');
        return jsonResponse_(payResult);

      case 'pushChartOfAccounts':
        var coaV = validatePayload_(payload.accounts, ['num']);
        if (!coaV.valid) return errorResponse_(coaV.message);
        var coaResult = pushChartOfAccounts_(ss, payload.accounts);
        return jsonResponse_(coaResult);

      case 'pushReceivables':
        var arV = validatePayload_(payload.receivables, []);
        if (!arV.valid) return errorResponse_(arV.message);
        return jsonResponse_(pushReceivables_(ss, payload.receivables));

      case 'pushJournalEntries':
        var jeV = validatePayload_(payload.entries, []);
        if (!jeV.valid) return errorResponse_(jeV.message);
        return jsonResponse_(pushJournalEntries_(ss, payload.entries));

      case 'push1099':
        var filV = validatePayload_(payload.filings, []);
        if (!filV.valid) return errorResponse_(filV.message);
        var filResult = push1099_(ss, payload.filings);
        updateSyncTimestamp_(ss, '1099 Filing Chain', 'push');
        return jsonResponse_(filResult);

      case 'fullSync':
        var results = {};
        if (payload.entities && payload.entities.length > 0) {
          results.entities = pushEntities_(ss, payload.entities);
          updateSyncTimestamp_(ss, 'Master Register', 'push');
        }
        if (payload.entries && payload.entries.length > 0) {
          results.transactions = pushTransactions_(ss, payload.entries);
          updateSyncTimestamp_(ss, 'Transaction Ledger', 'push');
        }
        if (payload.payables && payload.payables.length > 0) {
          results.payables = pushPayables_(ss, payload.payables);
          updateSyncTimestamp_(ss, 'Household Obligations', 'push');
        }
        if (payload.filings && payload.filings.length > 0) {
          results['1099'] = push1099_(ss, payload.filings);
          updateSyncTimestamp_(ss, '1099 Filing Chain', 'push');
        }
        return jsonResponse_({ status: 'ok', action: 'fullSync', results: results });

      case 'pushPrincipalRegister': {
        var prV = validatePayload_(payload.principals, ['legalName']);
        if (!prV.valid) return errorResponse_(prV.message);
        var prResult = pushPrincipalRegister_(ss, payload.principals);
        updateSyncTimestamp_(ss, 'Principal Register', 'push');
        return jsonResponse_(prResult);
      }

      case 'pushContacts': {
        var ctV = validatePayload_(payload.contacts, ['fullName']);
        if (!ctV.valid) return errorResponse_(ctV.message);
        var ctResult = pushContacts_(ss, payload.contacts);
        updateSyncTimestamp_(ss, 'Contacts', 'push');
        return jsonResponse_(ctResult);
      }

      case 'pushWebsiteAccounts': {
        var waV = validatePayload_(payload.accounts, ['platform']);
        if (!waV.valid) return errorResponse_(waV.message);
        var waResult = pushWebsiteAccounts_(ss, payload.accounts);
        updateSyncTimestamp_(ss, 'Website Accounts', 'push');
        return jsonResponse_(waResult);
      }

      case 'importSubstituteW2':
        if (!payload.payload || typeof payload.payload !== 'object') {
          return errorResponse_('importSubstituteW2 requires a nested "payload" object');
        }
        var w2Result = pushSubstituteW2_(ss, payload.payload);
        updateSyncTimestamp_(ss, 'W-2 & Income Detail', 'push');
        return jsonResponse_(w2Result);

      case 'importForm1040':
        if (!payload.payload || typeof payload.payload !== 'object') {
          return errorResponse_('importForm1040 requires a nested "payload" object');
        }
        var f1040Result = pushForm1040_(ss, payload.payload);
        updateSyncTimestamp_(ss, '1040 Submissions', 'push');
        return jsonResponse_(f1040Result);

      case 'importForm2848':
        if (!payload.payload || typeof payload.payload !== 'object') {
          return errorResponse_('importForm2848 requires a nested "payload" object');
        }
        var f2848Result = pushForm2848_(ss, payload.payload);
        updateSyncTimestamp_(ss, 'Forms & Authority', 'push');
        return jsonResponse_(f2848Result);

      case 'importScheduleA':
        if (!payload.payload || typeof payload.payload !== 'object') {
          return errorResponse_('importScheduleA requires a nested "payload" object');
        }
        var schaResult = pushScheduleA_(ss, payload.payload);
        updateSyncTimestamp_(ss, 'Schedule A', 'push');
        return jsonResponse_(schaResult);

      case 'importSchedule1':
        if (!payload.payload || typeof payload.payload !== 'object') {
          return errorResponse_('importSchedule1 requires a nested "payload" object');
        }
        var sch1Result = pushSchedule1_(ss, payload.payload);
        updateSyncTimestamp_(ss, 'Schedule 1', 'push');
        return jsonResponse_(sch1Result);

      case 'importSchedule2':
        if (!payload.payload || typeof payload.payload !== 'object') {
          return errorResponse_('importSchedule2 requires a nested "payload" object');
        }
        var sch2Result = pushSchedule2_(ss, payload.payload);
        updateSyncTimestamp_(ss, 'Schedule 2', 'push');
        return jsonResponse_(sch2Result);

      case 'importForm8275R':
        if (!payload.payload || typeof payload.payload !== 'object') {
          return errorResponse_('importForm8275R requires a nested "payload" object');
        }
        var f8275rResult = pushForm8275R_(ss, payload.payload);
        updateSyncTimestamp_(ss, 'Forms & Authority', 'push');
        return jsonResponse_(f8275rResult);

      case 'importAdminForms':
        if (!payload.payload || typeof payload.payload !== 'object') {
          return errorResponse_('importAdminForms requires a nested "payload" object');
        }
        var adminResult = pushAdminForms_(ss, payload.payload);
        updateSyncTimestamp_(ss, 'Forms & Authority', 'push');
        return jsonResponse_(adminResult);

      case 'importWorksheetData':
        if (!payload.payload || typeof payload.payload !== 'object') {
          return errorResponse_('importWorksheetData requires a nested "payload" object');
        }
        var wsResult = pushWorksheetData_(ss, payload.payload);
        updateSyncTimestamp_(ss, 'Tax Worksheets', 'push');
        return jsonResponse_(wsResult);

      default:
        return errorResponse_('Unknown action: ' + action + '. Valid: pushEntities, pushTransactions, pushPayables, push1099, fullSync, pushPrincipalRegister, pushContacts, pushWebsiteAccounts, importSubstituteW2, importForm1040, importForm2848, importScheduleA, importSchedule1, importSchedule2, importForm8275R, importAdminForms, importWorksheetData');
    }

  } catch (err) {
    return errorResponse_(err.message || String(err));
  }
}


// ─── Push Functions (Web App-safe wrappers) ──────────────────────────────────
// These replicate importLedger* logic but use the passed `ss` object
// instead of getActiveSpreadsheet(). Sidebar functions remain unchanged.

/**
 * Push entities to Master Register via Web App.
 * Replicates importLedgerEntities() logic with openById() spreadsheet.
 */
function pushEntities_(ss, entities) {
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return { status: 'error', action: 'pushEntities', message: 'Master Register tab not found' };

  var lastRow = sheet.getLastRow();
  var existingProviders = {};
  if (lastRow > 2) {
    var existingData = sheet.getRange(3, 3, lastRow - 2, 1).getValues();
    for (var i = 0; i < existingData.length; i++) {
      if (existingData[i][0]) existingProviders[String(existingData[i][0]).toLowerCase().trim()] = i + 3;
    }
  }

  var nextId = 1;
  if (lastRow > 2) {
    var ids = sheet.getRange(3, 1, lastRow - 2, 1).getValues();
    for (var k = 0; k < ids.length; k++) {
      var match = String(ids[k][0]).match(/MR-(\d+)/);
      if (match) nextId = Math.max(nextId, parseInt(match[1]) + 1);
    }
  }

  var typeMap = {
    'Trust': 'Trust Entity', 'LLC': 'LLC', 'Corporation': 'Corporation',
    'Individual': 'Individual', 'Employer': 'Employment W-2',
    'Bank': 'Banking Checking', 'Brokerage': 'Investment Brokerage',
    'Insurance': 'Insurance', 'Vendor': 'Vendor',
    'Government': 'Government Agency', 'Creditor': 'Credit Card'
  };

  var imported = 0, skipped = 0, updated = 0;

  for (var e = 0; e < entities.length; e++) {
    var ent = entities[e];
    var name = (ent.name || '').trim();
    if (!name) continue;

    var existingRow = existingProviders[name.toLowerCase()];
    if (existingRow) {
      // Upsert: update existing row
      if (ent.status) sheet.getRange(existingRow, 8).setValue(ent.status);
      if (ent.notes) sheet.getRange(existingRow, 27).setValue(ent.notes);
      sheet.getRange(existingRow, 29).setValue('Synced from Ledger');
      updated++;
      continue;
    }

    var rowId = 'MR-' + String(nextId).padStart(3, '0');
    nextId++;

    var row = new Array(29).fill('');
    row[0] = rowId;
    row[1] = new Date().toISOString().slice(0, 10);
    row[2] = name;
    row[3] = ''; // Never import EINs
    row[4] = ent.accountNumber || '';
    row[5] = typeMap[ent.type] || ent.type || '';
    row[6] = ent.subtype || '';
    row[7] = ent.status || 'Active';
    row[14] = ent.primaryUser || '';
    row[26] = ent.notes || '';
    row[28] = 'Synced from Ledger';

    sheet.appendRow(row);
    existingProviders[name.toLowerCase()] = true;
    imported++;
  }

  return { status: 'ok', action: 'pushEntities', imported: imported, skipped: skipped, updated: updated };
}

/**
 * Push transactions to Transaction Ledger via Web App.
 * Replicates importLedgerTransactions() logic.
 */
function pushTransactions_(ss, entries) {
  var sheet = ss.getSheetByName('Transaction Ledger');
  if (!sheet) return { status: 'error', action: 'pushTransactions', message: 'Transaction Ledger tab not found' };

  var rows = [];
  for (var i = 0; i < entries.length; i++) {
    var t = entries[i];
    var row = new Array(16).fill('');
    row[0] = t.date || new Date().toISOString().slice(0, 10);
    row[1] = t.description || '';
    row[2] = t.category || '';
    row[3] = t.account || '';
    row[4] = t.debit || '';
    row[5] = t.credit || '';
    row[6] = ''; // balance calculated by sheet
    row[7] = t.method || '';
    row[8] = t.reference || '';
    row[9] = t.vendor || '';
    row[10] = t.taxDeductible || '';
    row[11] = t.receipt || '';
    row[12] = ''; // reconciled
    row[13] = t.notes || '';
    row[14] = 'Accrual Ledger';
    row[15] = new Date().toISOString().slice(0, 10);
    rows.push(row);
  }

  if (rows.length > 0) {
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, 16).setValues(rows);
  }

  return { status: 'ok', action: 'pushTransactions', imported: rows.length };
}

/**
 * Push payables to Household Obligations via Web App.
 * Replicates importLedgerPayables() logic with upsert.
 */
function pushReceivables_(ss, receivables) {
  var sheet = ss.getSheetByName('Receivables');
  if (!sheet) {
    sheet = ss.insertSheet('Receivables');
    sheet.getRange(1, 1, 1, 8).setValues([['Invoice #', 'Customer', 'Entity', 'Date', 'Due Date', 'Amount', 'Balance', 'Intercompany']]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  var last = sheet.getLastRow();
  if (last > 1) sheet.getRange(2, 1, last - 1, 8).clearContent();
  var rows = (receivables || []).map(function(r) {
    return [r.invoiceNum || '', r.customer || '', r.entityId || '', r.date || '', r.dueDate || '',
            r.amount || '', (r.balance != null ? r.balance : r.amount) || '', r.isIntercompany ? 'Y' : ''];
  });
  if (rows.length) sheet.getRange(2, 1, rows.length, 8).setValues(rows);
  updateSyncTimestamp_(ss, 'Receivables', 'push');
  return { status: 'ok', action: 'pushReceivables', imported: rows.length };
}

function pushJournalEntries_(ss, entries) {
  // Flatten header + lines → one row per line (general-journal format).
  var sheet = ss.getSheetByName('Journal');
  if (!sheet) {
    sheet = ss.insertSheet('Journal');
    sheet.getRange(1, 1, 1, 9).setValues([['JE #', 'Date', 'Reference', 'Type', 'Description', 'Account', 'Debit', 'Credit', 'Status']]);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  var last = sheet.getLastRow();
  if (last > 1) sheet.getRange(2, 1, last - 1, 9).clearContent();
  var rows = [];
  (entries || []).forEach(function(e) {
    var lines = e.lines || [];
    if (!lines.length) {
      rows.push([e.number || '', e.date || '', e.reference || '', e.type || '', e.description || '', '', '', '', e.status || '']);
      return;
    }
    lines.forEach(function(l) {
      rows.push([e.number || '', e.date || '', e.reference || '', e.type || '', e.description || '',
                 l.account || '', l.debit || '', l.credit || '', e.status || '']);
    });
  });
  if (rows.length) sheet.getRange(2, 1, rows.length, 9).setValues(rows);
  updateSyncTimestamp_(ss, 'Journal', 'push');
  return { status: 'ok', action: 'pushJournalEntries', imported: rows.length, entries: (entries || []).length };
}

function pushChartOfAccounts_(ss, accounts) {
  // GUI's GAAP chart is authoritative → full-replace the data rows. Creates the
  // 'GAAP CoA' tab (header: Num | Name | Type | Subtype | Normal Balance | Form Line).
  var sheet = ss.getSheetByName('GAAP CoA');
  if (!sheet) {
    sheet = ss.insertSheet('GAAP CoA');
    sheet.getRange(1, 1, 1, 6).setValues([['Num', 'Name', 'Type', 'Subtype', 'Normal Balance', 'Form Line']]);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  var last = sheet.getLastRow();
  if (last > 1) sheet.getRange(2, 1, last - 1, 6).clearContent();
  var rows = (accounts || []).map(function(a) {
    return [a.num || '', a.name || '', a.type || '', a.subtype || '', a.normalBal || a.normalBalance || '', a.formLine || ''];
  });
  if (rows.length) sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  updateSyncTimestamp_(ss, 'GAAP CoA', 'push');
  return { status: 'ok', action: 'pushChartOfAccounts', imported: rows.length };
}

function pushPayables_(ss, payables) {
  var sheet = ss.getSheetByName('Household Obligations');
  if (!sheet) return { status: 'error', action: 'pushPayables', message: 'Household Obligations tab not found' };

  var lastRow = sheet.getLastRow();
  var vendorMap = {};
  if (lastRow > 1) {
    var vendors = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var v = 0; v < vendors.length; v++) {
      if (vendors[v][0]) vendorMap[String(vendors[v][0]).toLowerCase().trim()] = v + 2;
    }
  }

  var imported = 0, updated = 0;

  for (var p = 0; p < payables.length; p++) {
    var pay = payables[p];
    var vendor = (pay.vendor || pay.name || '').trim();
    if (!vendor) continue;

    var existingRow = vendorMap[vendor.toLowerCase()];
    if (existingRow) {
      // Upsert: update amount and status
      if (pay.amount || pay.monthlyAmount) sheet.getRange(existingRow, 4).setValue(pay.amount || pay.monthlyAmount);
      if (pay.status) sheet.getRange(existingRow, 7).setValue(pay.status);
      if (pay.dueDate || pay.dueDay) sheet.getRange(existingRow, 5).setValue(pay.dueDate || pay.dueDay);
      updated++;
    } else {
      var row = new Array(11).fill('');
      row[0] = vendor;
      row[1] = pay.category || '';
      row[2] = pay.accountNumber || '';
      row[3] = pay.amount || pay.monthlyAmount || '';
      row[4] = pay.dueDate || pay.dueDay || '';
      row[5] = pay.autopay || '';
      row[6] = pay.status || 'Active';
      row[7] = pay.lastPaid || '';
      row[8] = ''; // annual total
      row[9] = pay.startDate || '';
      row[10] = (pay.notes || '') + ' [Synced from Ledger]';

      sheet.appendRow(row);
      vendorMap[vendor.toLowerCase()] = sheet.getLastRow();
      imported++;
    }
  }

  return { status: 'ok', action: 'pushPayables', imported: imported, updated: updated };
}

/**
 * Push a Form 2848 (Power of Attorney) record to "Forms & Authority" sheet.
 * authorized_tax_years array is serialized to a comma-joined string.
 * SSN must already be masked (last 4 only) before this function receives it.
 * @param {Spreadsheet} ss
 * @param {Object} p - Clean payload matching API_CONTRACT.md importForm2848 shape.
 */
function pushForm2848_(ss, p) {
  var sheet = ss.getSheetByName('Forms & Authority');
  if (!sheet) return { status: 'error', action: 'importForm2848', message: 'Forms & Authority tab not found' };

  if (!p.taxpayer_name_and_address) return { status: 'error', action: 'importForm2848', message: 'Missing required field: taxpayer_name_and_address' };
  if (!p.representative_name_and_address) return { status: 'error', action: 'importForm2848', message: 'Missing required field: representative_name_and_address' };

  var taxYears = '';
  if (Array.isArray(p.authorized_tax_years)) {
    taxYears = p.authorized_tax_years.filter(function(y) { return y; }).join(', ');
  } else if (typeof p.authorized_tax_years === 'string') {
    taxYears = p.authorized_tax_years;
  }

  var row = [
    p.taxpayer_name_and_address        || '',
    p.taxpayer_ssn                     || '',
    p.taxpayer_phone                   || '',
    p.representative_name_and_address  || '',
    p.representative_caf               || '',
    p.representative_ptin              || '',
    p.representative_phone             || '',
    taxYears,
    p.submitted_at || new Date().toISOString(),
    'Artifactory'
  ];

  sheet.appendRow(row);
  Logger.log('importForm2848: appended POA for ' + p.taxpayer_name_and_address + ' | rep: ' + p.representative_name_and_address);

  return { status: 'ok', action: 'importForm2848', rowsWritten: 1 };
}


/**
 * Push a Schedule A (Itemized Deductions) record to "Schedule A" sheet.
 * Sheet is auto-created with headers if absent.
 * Link to a Form 1040 row via tax_year + taxpayer_ssn.
 * @param {Spreadsheet} ss
 * @param {Object} p - Clean payload matching API_CONTRACT.md importScheduleA shape.
 */
function pushScheduleA_(ss, p) {
  if (!p.tax_year)      return { status: 'error', action: 'importScheduleA', message: 'Missing required field: tax_year' };
  if (!p.taxpayer_name) return { status: 'error', action: 'importScheduleA', message: 'Missing required field: taxpayer_name' };

  var sheet = ss.getSheetByName('Schedule A');
  if (!sheet) {
    sheet = ss.insertSheet('Schedule A');
    var headers = [
      'Tax Year', 'Taxpayer Name', 'SSN (masked)',
      'Medical Expenses (L4)', 'Taxes Paid (L7)', 'Interest Paid (L10)',
      'Charitable Gifts (L14)', 'Casualty/Theft (L15)',
      'Other Deductions (L16)', 'Total Deductions (L17)',
      'Submitted At', 'Source'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setTabColor('#4CAF50');
    Logger.log('Schedule A sheet created');
  }

  var row = [
    p.tax_year                              || '',
    p.taxpayer_name                         || '',
    p.taxpayer_ssn                          || '',
    parseFloat(p.medical_expenses_line4)    || 0,
    parseFloat(p.taxes_paid_line7)          || 0,
    parseFloat(p.interest_paid_line10)      || 0,
    parseFloat(p.charity_gifts_line14)      || 0,
    parseFloat(p.casualty_theft_line15)     || 0,
    parseFloat(p.other_deductions_line16)   || 0,
    parseFloat(p.total_deductions_line17)   || 0,
    p.submitted_at || new Date().toISOString(),
    'Artifactory'
  ];

  sheet.appendRow(row);
  Logger.log('importScheduleA: appended TY' + p.tax_year + ' for ' + p.taxpayer_name);

  return { status: 'ok', action: 'importScheduleA', rowsWritten: 1 };
}


/**
 * Ensure "1040 Submissions" sheet exists; create with headers if not.
 * @param {Spreadsheet} ss
 * @return {Sheet}
 */
function ensureForm1040Sheet_(ss) {
  var sheet = ss.getSheetByName('1040 Submissions');
  if (sheet) return sheet;

  sheet = ss.insertSheet('1040 Submissions');
  var headers = [
    'Tax Year', 'Filing Status', 'First Name', 'Last Name', 'SSN (masked)',
    'Address', 'City/State/Zip',
    'Wages (L1)', 'Taxable Interest (L2b)', 'Ordinary Dividends (L3b)',
    'Capital Gain (L7)', 'Other Income (L8)', 'Total Income (L9)',
    'AGI (L11)', 'Deductions (L12)', 'Taxable Income (L15)',
    'Tax (L16)', 'Total Tax (L24)', 'Fed Withholding (L25a)',
    'Total Payments (L33)', 'Refund (L34)', 'Amount Owed (L37)',
    'Submitted At', 'Source'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.setTabColor('#3F51B5');
  Logger.log('1040 Submissions sheet created');
  return sheet;
}

/**
 * Push a Form 1040 return record to "1040 Submissions" sheet.
 * Sheet is auto-created with headers if absent.
 * SSN must already be masked (last 4 only) before this function receives it.
 * @param {Spreadsheet} ss
 * @param {Object} p - Clean payload matching API_CONTRACT.md importForm1040 shape.
 */
function pushForm1040_(ss, p) {
  if (!p.tax_year)             return { status: 'error', action: 'importForm1040', message: 'Missing required field: tax_year' };
  if (!p.taxpayer_last_name)   return { status: 'error', action: 'importForm1040', message: 'Missing required field: taxpayer_last_name' };

  var validStatuses = ['Single', 'MFJ', 'MFS', 'HOH', 'QW'];
  if (p.filing_status && validStatuses.indexOf(p.filing_status) === -1) {
    return { status: 'error', action: 'importForm1040', message: 'Invalid filing_status: ' + p.filing_status + '. Must be one of: ' + validStatuses.join(', ') };
  }

  var sheet = ensureForm1040Sheet_(ss);

  var row = [
    p.tax_year                          || '',
    p.filing_status                     || '',
    p.taxpayer_first_name               || '',
    p.taxpayer_last_name                || '',
    p.taxpayer_ssn                      || '',
    p.taxpayer_address                  || '',
    p.taxpayer_city_state_zip           || '',
    parseFloat(p.wages_line1)           || 0,
    parseFloat(p.taxable_interest_line2b)  || 0,
    parseFloat(p.ordinary_dividends_line3b)|| 0,
    parseFloat(p.capital_gain_line7)    || 0,
    parseFloat(p.other_income_line8)    || 0,
    parseFloat(p.total_income_line9)    || 0,
    parseFloat(p.agi_line11)            || 0,
    parseFloat(p.deductions_line12)     || 0,
    parseFloat(p.taxable_income_line15) || 0,
    parseFloat(p.tax_line16)            || 0,
    parseFloat(p.total_tax_line24)      || 0,
    parseFloat(p.fed_withholding_line25a)  || 0,
    parseFloat(p.total_payments_line33) || 0,
    parseFloat(p.refund_line34)         || 0,
    parseFloat(p.amount_owed_line37)    || 0,
    p.submitted_at || new Date().toISOString(),
    'Artifactory'
  ];

  sheet.appendRow(row);
  Logger.log('importForm1040: appended TY' + p.tax_year + ' for ' + p.taxpayer_last_name + ', ' + p.taxpayer_first_name);

  return { status: 'ok', action: 'importForm1040', rowsWritten: 1 };
}


/**
 * Push a Form 4852 (Substitute W-2) record to W-2 & Income Detail.
 * Called by doPost action 'importSubstituteW2'.
 * SSN must already be masked (last 4 only) before this function receives it.
 * @param {Spreadsheet} ss
 * @param {Object} p - Clean payload matching API_CONTRACT.md importSubstituteW2 shape.
 */
function pushSubstituteW2_(ss, p) {
  var sheet = ss.getSheetByName('W-2 & Income Detail');
  if (!sheet) return { status: 'error', action: 'importSubstituteW2', message: 'W-2 & Income Detail tab not found' };

  if (!p.tax_year)      return { status: 'error', action: 'importSubstituteW2', message: 'Missing required field: tax_year' };
  if (!p.taxpayer_name) return { status: 'error', action: 'importSubstituteW2', message: 'Missing required field: taxpayer_name' };
  if (!p.employer_name) return { status: 'error', action: 'importSubstituteW2', message: 'Missing required field: employer_name' };

  var row = [
    p.tax_year        || '',
    'Form 4852',
    p.taxpayer_name   || '',
    p.taxpayer_ssn    || '',   // pre-masked to XXX-XX-1234 by Artifactory
    p.taxpayer_address|| '',
    p.employer_name   || '',
    p.employer_tin    || '',
    parseFloat(p.wages)        || 0,
    parseFloat(p.fed_withheld) || 0,
    p.determination_1 || '',
    p.determination_2 || '',
    p.efforts_1       || '',
    p.efforts_2       || '',
    p.submitted_at    || new Date().toISOString(),
    'Artifactory'
  ];

  sheet.appendRow(row);
  Logger.log('importSubstituteW2: appended row for ' + p.taxpayer_name + ' TY' + p.tax_year);

  return { status: 'ok', action: 'importSubstituteW2', rowsWritten: 1 };
}


// ─── Sprint 2 Artifactory Bridge Handlers ────────────────────────────────────

/**
 * Push Schedule 1 (Additional Income & Adjustments) to "Schedule 1" sheet.
 * Sheet auto-created if absent. lines_data blob stores line-level fields.
 * part1_total / part2_total are explicit summary fields for auditability.
 */
function pushSchedule1_(ss, p) {
  if (!p.tax_year)      return { status: 'error', action: 'importSchedule1', message: 'Missing required field: tax_year' };
  if (!p.taxpayer_name) return { status: 'error', action: 'importSchedule1', message: 'Missing required field: taxpayer_name' };

  var sheet = ss.getSheetByName('Schedule 1');
  if (!sheet) {
    sheet = ss.insertSheet('Schedule 1');
    var headers = [
      'Tax Year', 'Taxpayer Name', 'SSN (masked)',
      "Part I Total (Add'l Income)", 'Part II Total (Adjustments)',
      'Lines Data (JSON)', 'Submitted At', 'Source'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setTabColor('#FF9800');
    Logger.log('Schedule 1 sheet created');
  }

  var linesData = p.lines_data
    ? (typeof p.lines_data === 'string' ? p.lines_data : JSON.stringify(p.lines_data))
    : '';

  sheet.appendRow([
    p.tax_year       || '',
    p.taxpayer_name  || '',
    p.taxpayer_ssn   || '',
    parseFloat(p.part1_total) || 0,
    parseFloat(p.part2_total) || 0,
    linesData,
    p.submitted_at   || new Date().toISOString(),
    'Artifactory'
  ]);
  Logger.log('importSchedule1: appended TY' + p.tax_year + ' for ' + p.taxpayer_name);
  return { status: 'ok', action: 'importSchedule1', rowsWritten: 1 };
}


/**
 * Push Schedule 2 (Additional Taxes) to "Schedule 2" sheet.
 * Sheet auto-created if absent. Same structure as Schedule 1 handler.
 */
function pushSchedule2_(ss, p) {
  if (!p.tax_year)      return { status: 'error', action: 'importSchedule2', message: 'Missing required field: tax_year' };
  if (!p.taxpayer_name) return { status: 'error', action: 'importSchedule2', message: 'Missing required field: taxpayer_name' };

  var sheet = ss.getSheetByName('Schedule 2');
  if (!sheet) {
    sheet = ss.insertSheet('Schedule 2');
    var headers = [
      'Tax Year', 'Taxpayer Name', 'SSN (masked)',
      'Part I Total (AMT & NIIT)', 'Part II Total (Other Taxes)',
      'Lines Data (JSON)', 'Submitted At', 'Source'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setTabColor('#F44336');
    Logger.log('Schedule 2 sheet created');
  }

  var linesData = p.lines_data
    ? (typeof p.lines_data === 'string' ? p.lines_data : JSON.stringify(p.lines_data))
    : '';

  sheet.appendRow([
    p.tax_year       || '',
    p.taxpayer_name  || '',
    p.taxpayer_ssn   || '',
    parseFloat(p.part1_total) || 0,
    parseFloat(p.part2_total) || 0,
    linesData,
    p.submitted_at   || new Date().toISOString(),
    'Artifactory'
  ]);
  Logger.log('importSchedule2: appended TY' + p.tax_year + ' for ' + p.taxpayer_name);
  return { status: 'ok', action: 'importSchedule2', rowsWritten: 1 };
}


/**
 * Push Form 8275-R (Regulation Disclosure Statement) to "Forms & Authority".
 * Rigid columns — form is simple; no blob needed.
 * Col A = "Form 8275-R" type marker (coexists with 2848 rows by type-prefix pattern).
 */
function pushForm8275R_(ss, p) {
  var sheet = ss.getSheetByName('Forms & Authority');
  if (!sheet) return { status: 'error', action: 'importForm8275R', message: 'Forms & Authority tab not found' };
  if (!p.taxpayer_name) return { status: 'error', action: 'importForm8275R', message: 'Missing required field: taxpayer_name' };

  sheet.appendRow([
    'Form 8275-R',
    p.taxpayer_name               || '',
    p.taxpayer_ssn                || '',
    parseFloat(p.amount_1)        || 0,
    p.explanation                 || '',
    p.submitted_at                || new Date().toISOString(),
    'Artifactory'
  ]);
  Logger.log('importForm8275R: appended for ' + p.taxpayer_name);
  return { status: 'ok', action: 'importForm8275R', rowsWritten: 1 };
}


/**
 * Push admin/signature forms (8453, 8867, 8879) to "Forms & Authority".
 * form_data blob accommodates each form's unique field structure.
 * Col A = "Form XXXX" type marker; col G = JSON blob of form-specific fields.
 */
function pushAdminForms_(ss, p) {
  var sheet = ss.getSheetByName('Forms & Authority');
  if (!sheet) return { status: 'error', action: 'importAdminForms', message: 'Forms & Authority tab not found' };

  var validFormTypes = ['8453', '8867', '8879'];
  if (!p.form_type || validFormTypes.indexOf(String(p.form_type)) === -1) {
    return { status: 'error', action: 'importAdminForms', message: 'Missing or invalid form_type. Must be one of: ' + validFormTypes.join(', ') };
  }
  if (!p.taxpayer_name) return { status: 'error', action: 'importAdminForms', message: 'Missing required field: taxpayer_name' };

  var formData = p.form_data
    ? (typeof p.form_data === 'string' ? p.form_data : JSON.stringify(p.form_data))
    : '';

  sheet.appendRow([
    'Form ' + p.form_type,
    p.tax_year       || '',
    p.taxpayer_name  || '',
    p.taxpayer_ssn   || '',
    p.spouse_name    || '',
    p.spouse_ssn     || '',
    formData,
    p.submitted_at   || new Date().toISOString(),
    'Artifactory'
  ]);
  Logger.log('importAdminForms: appended Form ' + p.form_type + ' for ' + p.taxpayer_name);
  return { status: 'ok', action: 'importAdminForms', rowsWritten: 1 };
}


/**
 * Push worksheet data to consolidated "Tax Worksheets" sheet.
 * Handles: CG, EIC, OTHER_INCOME, REG_EXPLANATION.
 * Sheet auto-created if absent. data_blob stores all worksheet-specific fields.
 */
function pushWorksheetData_(ss, p) {
  if (!p.tax_year)      return { status: 'error', action: 'importWorksheetData', message: 'Missing required field: tax_year' };
  if (!p.taxpayer_name) return { status: 'error', action: 'importWorksheetData', message: 'Missing required field: taxpayer_name' };

  var validTypes = ['CG', 'EIC', 'OTHER_INCOME', 'REG_EXPLANATION'];
  if (!p.worksheet_type || validTypes.indexOf(p.worksheet_type) === -1) {
    return { status: 'error', action: 'importWorksheetData', message: 'Missing or invalid worksheet_type. Must be one of: ' + validTypes.join(', ') };
  }

  var sheet = ss.getSheetByName('Tax Worksheets');
  if (!sheet) {
    sheet = ss.insertSheet('Tax Worksheets');
    var headers = [
      'Tax Year', 'Taxpayer Name', 'SSN (masked)',
      'Worksheet Type', 'Data (JSON)', 'Submitted At', 'Source'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setTabColor('#607D8B');
    Logger.log('Tax Worksheets sheet created');
  }

  var dataBlob = p.data_blob
    ? (typeof p.data_blob === 'string' ? p.data_blob : JSON.stringify(p.data_blob))
    : '';

  sheet.appendRow([
    p.tax_year        || '',
    p.taxpayer_name   || '',
    p.taxpayer_ssn    || '',
    p.worksheet_type  || '',
    dataBlob,
    p.submitted_at    || new Date().toISOString(),
    'Artifactory'
  ]);
  Logger.log('importWorksheetData: appended ' + p.worksheet_type + ' TY' + p.tax_year + ' for ' + p.taxpayer_name);
  return { status: 'ok', action: 'importWorksheetData', rowsWritten: 1 };
}


// ─── Sprint 2 Pull Helper (GSheet → Artifactory) ─────────────────────────────

/**
 * Read rows from an Artifactory form tab and return as keyed objects.
 * Uses FORM_PULL_CONFIG_ entry for column→field mapping.
 * Results are returned most-recent-first (reversed row order).
 *
 * @param {Spreadsheet} ss
 * @param {Object} config - Entry from FORM_PULL_CONFIG_
 * @param {string|null} taxYear - Optional: filter rows where taxYearCol === taxYear
 * @param {number} limit - Optional: cap results (0 = unlimited)
 * @param {string|null} worksheetType - Optional: filter by worksheetTypeCol value
 * @return {Array<Object>} Rows as keyed objects matching the push payload field names
 */
function pullFormTab_(ss, config, taxYear, limit, worksheetType) {
  var sheet = ss.getSheetByName(config.sheet);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var numCols = config.fields.length;
  var data = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
  var results = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var hasData = false;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== '' && row[c] !== null && row[c] !== undefined) { hasData = true; break; }
    }
    if (!hasData) continue;

    if (taxYear && String(row[config.taxYearCol]) !== String(taxYear)) continue;
    if (worksheetType && config.worksheetTypeCol !== undefined &&
        String(row[config.worksheetTypeCol]) !== worksheetType) continue;

    var obj = {};
    for (var j = 0; j < config.fields.length; j++) {
      var v = row[j];
      if (v instanceof Date) v = v.toISOString().slice(0, 10);
      obj[config.fields[j]] = (v !== null && v !== undefined) ? v : '';
    }
    results.push(obj);
  }

  results.reverse(); // most recent submission first
  if (limit > 0) results = results.slice(0, limit);
  return results;
}


/**
 * Push principal entity records to "Principal Register" tab.
 * Upserts by legalName (case-insensitive). ID prefix: PE-NNN.
 */
function pushPrincipalRegister_(ss, records) {
  var sheet = ss.getSheetByName('Principal Register');
  if (!sheet) return { status: 'error', action: 'pushPrincipalRegister', message: 'Principal Register tab not found' };

  var lastRow = sheet.getLastRow();
  var nameMap = {}, existingRows = {};
  if (lastRow > 1) {
    var allData = sheet.getRange(2, 1, lastRow - 1, 20).getValues();
    for (var n = 0; n < allData.length; n++) {
      var k = String(allData[n][2] || '').toLowerCase().trim(); // col C = legalName
      if (k) { nameMap[k] = n + 2; existingRows[k] = allData[n]; }
    }
  }

  var nextId = 1;
  if (lastRow > 1) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var ki = 0; ki < ids.length; ki++) {
      var m = String(ids[ki][0]).match(/PE-(\d+)/);
      if (m) nextId = Math.max(nextId, parseInt(m[1]) + 1);
    }
  }

  var imported = 0, updated = 0;
  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    var name = (r.legalName || '').trim();
    if (!name) continue;
    var key = name.toLowerCase();
    var existingRow = nameMap[key];

    if (existingRow) {
      var ex = existingRows[key];
      sheet.getRange(existingRow, 1, 1, 20).setValues([[
        ex[0], r.entityType || ex[1], name, r.dbaName || ex[3], r.ein || ex[4],
        r.mailingAddress || ex[5], r.city || ex[6], r.state || ex[7], r.zip || ex[8],
        r.primaryTrustee || ex[9], r.coTrustee || ex[10], r.registeredState || ex[11],
        r.dateEstablished || ex[12], r.bankName || ex[13], r.branch || ex[14],
        r.accountNumber || ex[15], r.routingNumber || ex[16], r.accountType || ex[17],
        r.accountHolderName || ex[18], r.notes || ex[19]
      ]]);
      updated++;
    } else {
      sheet.appendRow([
        'PE-' + String(nextId++).padStart(3, '0'),
        r.entityType || '', name, r.dbaName || '', r.ein || '',
        r.mailingAddress || '', r.city || '', r.state || '', r.zip || '',
        r.primaryTrustee || '', r.coTrustee || '', r.registeredState || '',
        r.dateEstablished || '', r.bankName || '', r.branch || '',
        r.accountNumber || '', r.routingNumber || '', r.accountType || '',
        r.accountHolderName || '', r.notes || ''
      ]);
      nameMap[key] = sheet.getLastRow();
      imported++;
    }
  }
  return { status: 'ok', action: 'pushPrincipalRegister', imported: imported, updated: updated };
}


/**
 * Push contact records to "Contacts" tab.
 * Upserts by fullName (case-insensitive). ID prefix: PC-NNN.
 */
function pushContacts_(ss, contacts) {
  var sheet = ss.getSheetByName('Contacts');
  if (!sheet) return { status: 'error', action: 'pushContacts', message: 'Contacts tab not found' };

  var lastRow = sheet.getLastRow();
  var nameMap = {}, existingRows = {};
  if (lastRow > 1) {
    var allData = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    for (var n = 0; n < allData.length; n++) {
      var k = String(allData[n][2] || '').toLowerCase().trim(); // col C = fullName
      if (k) { nameMap[k] = n + 2; existingRows[k] = allData[n]; }
    }
  }

  var nextId = 1;
  if (lastRow > 1) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var ki = 0; ki < ids.length; ki++) {
      var m = String(ids[ki][0]).match(/PC-(\d+)/);
      if (m) nextId = Math.max(nextId, parseInt(m[1]) + 1);
    }
  }

  var imported = 0, updated = 0;
  for (var i = 0; i < contacts.length; i++) {
    var c = contacts[i];
    var name = (c.fullName || '').trim();
    if (!name) continue;
    var key = name.toLowerCase();
    var existingRow = nameMap[key];

    if (existingRow) {
      var ex = existingRows[key];
      sheet.getRange(existingRow, 1, 1, 9).setValues([[
        ex[0], c.role || ex[1], name, c.organization || ex[3],
        c.phone || ex[4], c.email || ex[5], c.mailingAddress || ex[6],
        c.relatedEntity || ex[7], c.notes || ex[8]
      ]]);
      updated++;
    } else {
      sheet.appendRow([
        'PC-' + String(nextId++).padStart(3, '0'),
        c.role || '', name, c.organization || '',
        c.phone || '', c.email || '', c.mailingAddress || '',
        c.relatedEntity || '', c.notes || ''
      ]);
      nameMap[key] = sheet.getLastRow();
      imported++;
    }
  }
  return { status: 'ok', action: 'pushContacts', imported: imported, updated: updated };
}


/**
 * Push website account records to "Website Accounts" tab.
 * Upserts by platform name (case-insensitive). ID prefix: WA-NNN.
 * Does NOT write passwords — callers must strip them before sending.
 */
function pushWebsiteAccounts_(ss, accounts) {
  var sheet = ss.getSheetByName('Website Accounts');
  if (!sheet) return { status: 'error', action: 'pushWebsiteAccounts', message: 'Website Accounts tab not found' };

  var lastRow = sheet.getLastRow();
  var platformMap = {}, existingRows = {};
  if (lastRow > 1) {
    var allData = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    for (var n = 0; n < allData.length; n++) {
      var k = String(allData[n][1] || '').toLowerCase().trim(); // col B = platform
      if (k) { platformMap[k] = n + 2; existingRows[k] = allData[n]; }
    }
  }

  var nextId = 1;
  if (lastRow > 1) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var ki = 0; ki < ids.length; ki++) {
      var m = String(ids[ki][0]).match(/WA-(\d+)/);
      if (m) nextId = Math.max(nextId, parseInt(m[1]) + 1);
    }
  }

  var imported = 0, updated = 0;
  for (var i = 0; i < accounts.length; i++) {
    var a = accounts[i];
    var platform = (a.platform || '').trim();
    if (!platform) continue;
    var key = platform.toLowerCase();
    var existingRow = platformMap[key];

    if (existingRow) {
      var ex = existingRows[key];
      sheet.getRange(existingRow, 1, 1, 8).setValues([[
        ex[0], platform, a.url || ex[2], a.username || ex[3],
        a.linkedEntity || ex[4], a.mfaMethod || ex[5],
        a.lastVerified || ex[6], a.notes || ex[7]
      ]]);
      updated++;
    } else {
      sheet.appendRow([
        'WA-' + String(nextId++).padStart(3, '0'),
        platform, a.url || '', a.username || '',
        a.linkedEntity || '', a.mfaMethod || '',
        a.lastVerified || '', a.notes || ''
      ]);
      platformMap[key] = sheet.getLastRow();
      imported++;
    }
  }
  return { status: 'ok', action: 'pushWebsiteAccounts', imported: imported, updated: updated };
}


/**
 * Push 1099 filings to 1099 Filing Chain via Web App.
 * Replicates importLedger1099s() logic.
 */
function push1099_(ss, filings) {
  var sheet = ss.getSheetByName('1099 Filing Chain');
  if (!sheet) return { status: 'error', action: 'push1099', message: '1099 Filing Chain tab not found' };

  var lastRow = Math.max(sheet.getLastRow(), 4);

  var rows = [];
  for (var i = 0; i < filings.length; i++) {
    var item = filings[i];
    var f = item.data || item;
    var type = item.type || '1099';

    var row = new Array(15).fill('');
    row[0] = f.assetId || f.id || ('LED-' + String(i + 1).padStart(3, '0'));
    row[1] = f.assetDescription || f.description || f.payerName || '';
    row[2] = f.acquisitionDate || f.dateAcquired || '';

    if (type === '1099-A') {
      row[3] = 'Yes'; row[4] = f.date || f.filingDate || ''; row[5] = f.status || 'Filed';
    } else if (type === '1099-B') {
      row[6] = 'Yes'; row[7] = f.date || f.filingDate || ''; row[8] = f.status || 'Filed';
    }
    row[13] = f.status || 'Pending';
    row[14] = (f.notes || '') + ' [Synced from Ledger: ' + type + ']';

    rows.push(row);
  }

  if (rows.length > 0) {
    sheet.getRange(lastRow + 1, 1, rows.length, 15).setValues(rows);
  }

  return { status: 'ok', action: 'push1099', imported: rows.length };
}


// ═══════════════════════════════════════════════════════════════════════════
// APPC_RLT HUB LAYER  (ADDITIVE — does NOT touch doGet/doPost above)
// ═══════════════════════════════════════════════════════════════════════════
// Unified-hub consolidation. These functions copy whole sheets between the
// active spreadsheet and the APPC_RLT hub workbook (full-replace copy).
//
// They are intended to run from the Apps Script editor, a custom menu, or a
// time-driven trigger — they are deliberately NOT wired into the web-app
// bridge, so the deployed exec URL and all existing pull/push/import actions
// keep working unchanged. No Web App redeploy is required for these.
//
// Hub tabs use prefixed names, e.g. "TMAR — Master Register", "FWM — Dashboard".
// Sync timestamps reuse the existing ensureSyncMetaSheet_/updateSyncTimestamp_
// machinery, writing into the hub's own hidden _SyncMeta tab.
//
// Added: 2026-06-07
// CONSOLIDATED 2026-06-27 — the APPC hub was folded INTO the Live book, so
//   TMAR_CONFIG.appcHubId now == liveBookId. appcPushToHub/appcPullFromHub
//   short-circuit (no-op) when hub == Live to avoid self-referential duplicate
//   "TMAR — *" tabs. Kept intact for history / future un-fold.
// ═══════════════════════════════════════════════════════════════════════════

/** APPC_RLT unified hub workbook ID. Source of truth: TMAR_CONFIG.appcHubId (top of file). */
var APPC_HUB_ID_ = TMAR_CONFIG.appcHubId;

// Legacy / archive sources (read-only — never write). IDs centralized in TMAR_CONFIG (top of file):
//   Live (TMAR)            : TMAR_CONFIG.liveBookId
//   Archive (Freeway 2025) : TMAR_CONFIG.archiveBookId

/** Hub tab-name constants. Use these instead of hardcoded prefixed strings. */
var APPC_SHEET_NAMES_ = {
  MASTER_REGISTER:       'TMAR — Master Register',
  TRANSACTION_LEDGER:    'TMAR — Transaction Ledger',
  HOUSEHOLD_OBLIGATIONS: 'TMAR — Household Obligations',
  FILING_CHAIN:          'TMAR — 1099 Filing Chain',
  W2_INCOME:             'TMAR — W-2 & Income Detail',
  SUBMISSIONS_1040:      'TMAR — 1040 Submissions',
  FORMS_AUTHORITY:       'TMAR — Forms & Authority',
  PROOF_OF_MAILING:      'TMAR — Proof of Mailing',
  FILINGS_1099:          'TMAR — 1099 Filings',
  DOCUMENT_INVENTORY:    'TMAR — Document Inventory',
  DOCUMENT_REGISTRY:     'TMAR — Document Registry',
  COA:                   'TMAR — CoA',
  PRINCIPAL_REGISTER:    'TMAR — Principal Register',
  // Freeway tabs (absorbed into the hub)
  FWM_MASTER_INDEX:      'FWM — Master Index',
  FWM_CHECKLIST:         'FWM — Forms Checklist',
  FWM_CREDITOR_DETAIL:   'FWM — Creditor Detail',
  FWM_DASHBOARD:         'FWM — Dashboard',
  FWM_BINDER_GUIDE:      'FWM — Binder Tab Guide'
};

/** Open the APPC_RLT hub workbook (Web App-safe; uses openById). */
function getAppcHub_() {
  return SpreadsheetApp.openById(APPC_HUB_ID_);
}

/**
 * Copy a sheet from the active spreadsheet INTO a hub tab (full replace).
 * Creates the hub tab if it does not exist.
 * @param {string} localSheetName - Source sheet in the active spreadsheet.
 * @param {string} hubSheetName   - Destination tab name in the hub.
 * @return {Object} { status, rows, hubTab }
 */
function appcPushToHub(localSheetName, hubSheetName) {
  if (APPC_HUB_ID_ === TMAR_CONFIG.liveBookId) {
    Logger.log('appcPushToHub: APPC hub folded into Live (2026-06-27) — no-op for "' + hubSheetName + '" (would create a self-referential duplicate tab).');
    return { status: 'skipped', action: 'appcPushToHub', reason: 'hub-consolidated-into-live', hubTab: hubSheetName };
  }
  var src = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(localSheetName);
  if (!src) {
    Logger.log('appcPushToHub: local sheet "' + localSheetName + '" not found.');
    return { status: 'error', action: 'appcPushToHub', message: 'Local sheet not found: ' + localSheetName };
  }

  var hub = getAppcHub_();
  var dest = hub.getSheetByName(hubSheetName);
  if (!dest) {
    dest = hub.insertSheet(hubSheetName);
    Logger.log('appcPushToHub: created hub tab "' + hubSheetName + '".');
  }

  var values = src.getDataRange().getValues();
  dest.clearContents();
  if (values.length > 0 && values[0].length > 0) {
    dest.getRange(1, 1, values.length, values[0].length).setValues(values);
  }

  updateSyncTimestamp_(hub, hubSheetName, 'push');
  SpreadsheetApp.flush();
  Logger.log('appcPushToHub: "' + localSheetName + '" → "' + hubSheetName + '" (' + values.length + ' rows).');
  return { status: 'ok', action: 'appcPushToHub', rows: values.length, hubTab: hubSheetName };
}

/**
 * Copy a hub tab INTO a sheet in the active spreadsheet (full replace).
 * Creates the local sheet if it does not exist.
 * @param {string} hubSheetName   - Source tab name in the hub.
 * @param {string} localSheetName - Destination sheet in the active spreadsheet.
 * @return {Object} { status, rows, localSheet }
 */
function appcPullFromHub(hubSheetName, localSheetName) {
  if (APPC_HUB_ID_ === TMAR_CONFIG.liveBookId) {
    Logger.log('appcPullFromHub: APPC hub folded into Live (2026-06-27) — no-op for "' + hubSheetName + '" (hub and Live are the same book).');
    return { status: 'skipped', action: 'appcPullFromHub', reason: 'hub-consolidated-into-live', localSheet: localSheetName };
  }
  var hub = getAppcHub_();
  var src = hub.getSheetByName(hubSheetName);
  if (!src) {
    Logger.log('appcPullFromHub: hub tab "' + hubSheetName + '" not found.');
    return { status: 'error', action: 'appcPullFromHub', message: 'Hub tab not found: ' + hubSheetName };
  }

  var local = SpreadsheetApp.getActiveSpreadsheet();
  var dest = local.getSheetByName(localSheetName);
  if (!dest) {
    dest = local.insertSheet(localSheetName);
    Logger.log('appcPullFromHub: created local sheet "' + localSheetName + '".');
  }

  var values = src.getDataRange().getValues();
  dest.clearContents();
  if (values.length > 0 && values[0].length > 0) {
    dest.getRange(1, 1, values.length, values[0].length).setValues(values);
  }

  updateSyncTimestamp_(hub, hubSheetName, 'pull');
  SpreadsheetApp.flush();
  Logger.log('appcPullFromHub: "' + hubSheetName + '" → "' + localSheetName + '" (' + values.length + ' rows).');
  return { status: 'ok', action: 'appcPullFromHub', rows: values.length, localSheet: localSheetName };
}

// ─── Convenience wrappers (active sheet name ⇄ hub prefixed tab) ──────────────

function appcPushMasterRegister()    { return appcPushToHub('Master Register',    APPC_SHEET_NAMES_.MASTER_REGISTER); }
function appcPushTransactionLedger() { return appcPushToHub('Transaction Ledger', APPC_SHEET_NAMES_.TRANSACTION_LEDGER); }
function appcPullMasterRegister()    { return appcPullFromHub(APPC_SHEET_NAMES_.MASTER_REGISTER,    'Master Register'); }
function appcPullTransactionLedger() { return appcPullFromHub(APPC_SHEET_NAMES_.TRANSACTION_LEDGER, 'Transaction Ledger'); }

/**
 * Push the core TMAR sheets up to the APPC_RLT hub in one call.
 * Extend with additional appcPushToHub() calls as more tabs are migrated.
 * @return {Object} per-sheet results keyed by hub tab.
 */
function appcSyncAll() {
  var results = {};
  results.masterRegister    = appcPushMasterRegister();
  results.transactionLedger = appcPushTransactionLedger();
  Logger.log('appcSyncAll: complete → hub ' + APPC_HUB_ID_);
  return { status: 'ok', action: 'appcSyncAll', results: results };
}
