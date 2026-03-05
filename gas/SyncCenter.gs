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

/** Spreadsheet ID for Web App context (getActiveSpreadsheet() won't work in doGet/doPost) */
var TMAR_SPREADSHEET_ID_ = '1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ';

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

  var sheets = ['Master Register', 'Transaction Ledger', 'Household Obligations', '1099 Filing Chain'];
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

      case 'pull1099':
        var filings = pullSheetData_(ss, '1099 Filing Chain', 5, [
          'assetId', 'description', 'acquisitionDate', '1099A_filed', '1099A_date',
          '1099A_status', '1099B_filed', '1099B_date', '1099B_status', '1099C_filed',
          '1099C_date', '1099C_status', 'fairMarketValue', 'status', 'notes'
        ]);
        updateSyncTimestamp_(ss, '1099 Filing Chain', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pull1099', count: filings.length, data: filings });

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

      default:
        return errorResponse_('Unknown action: ' + action + '. Valid: ping, pullAccounts, pullTransactions, pullObligations, pull1099, pullValidation, listSheetTabs, pullRawTab');
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

      default:
        return errorResponse_('Unknown action: ' + action + '. Valid: pushEntities, pushTransactions, pushPayables, push1099, fullSync');
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
