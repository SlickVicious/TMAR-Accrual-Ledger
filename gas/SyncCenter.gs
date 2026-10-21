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
        <option value="payables">Payables → Business Obligations</option>
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
  if (lastRow > 1) {
    const existingData = sheet.getRange(2, 3, lastRow - 1, 1).getValues(); // Col C = Provider
    existingData.forEach(function(r, i) {
      if (r[0]) existingProviders[String(r[0]).toLowerCase().trim()] = i + 2;
    });
  }

  // Find next Row ID number
  let nextId = 1;
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
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

    // Account Type is written verbatim from e.accountType (lossless round-trip) — see row[5].

    const row = new Array(29).fill('');
    row[0] = rowId;
    row[1] = new Date().toISOString().slice(0, 10);
    row[2] = name;
    row[3] = ''; // Never import EINs — they come masked from the Ledger
    row[4] = e.accountNumber || '';
    row[5] = e.accountType || e.type || '';
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
 * Import payables from Accrual Ledger → Business Obligations.
 * Upserts by vendor name (updates existing, appends new).
 */
function importLedgerPayables(payables) {
  if (!payables || payables.length === 0) return 'No payables to import.';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Business Obligations');
  if (!sheet) throw new Error('Business Obligations tab not found');

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

  return 'Imported ' + imported + ' new, updated ' + updated + ' existing payables in Business Obligations.';
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
// Auth: every action except `ping` requires a key — GET: &key=<TMAR_API_KEY>,
// POST: {..., key:'<TMAR_API_KEY>'}. Checked by checkApiKey_() against the
// TMAR_API_KEY Script Property (Project Settings → Script Properties in the
// Apps Script editor — never hardcode it here, this file is in a public repo).
//
// Usage from Accrual Ledger:
//   GET  ?action=ping                     → connection test (no key required)
//   GET  ?action=pullAccounts             → read Master Register → JSON
//   GET  ?action=pullTransactions         → read Transaction Ledger → JSON
//   GET  ?action=pullObligations          → read Business Obligations → JSON
//   GET  ?action=pull1099                 → read 1099 Filing Chain → JSON
//   GET  ?action=pullValidation           → read _Validation lists → JSON
//   GET  ?action=pullChartOfAccounts      → read GAAP CoA → JSON
//   GET  ?action=pullReceivables          → read Receivables → JSON
//   GET  ?action=pullJournalEntries       → read Journal → JSON
//   GET  ?action=pullPrincipalRegister    → read Principal Register → JSON
//   GET  ?action=pullContacts             → read Contacts → JSON
//   GET  ?action=pullWebsiteAccounts      → read Website Accounts (no password col) → JSON
//   GET  ?action=listSheetTabs/listWorkbookTabs/pullRawTab/pullWorkbookSheets
//   POST {action:'pushEntities', entities:[...]}     → write to Master Register
//   POST {action:'pushTransactions', entries:[...]}  → write to Transaction Ledger
//   POST {action:'pushPayables', payables:[...]}     → write to Business Obligations
//   POST {action:'push1099', filings:[...]}          → write to 1099 Filing Chain
//   POST {action:'pushChartOfAccounts'|'pushReceivables'|'pushJournalEntries'
//         |'pushPrincipalRegister'|'pushContacts'|'pushWebsiteAccounts', ...}
//   POST {action:'deleteWebsiteAccounts', accountIds:['WA-100',...], platforms:[...]}
//         → removes matching rows from Website Accounts, backs them up first
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
// Empty → defaults to the form-data tabs in FORM_PULL_CONFIG_, which is a tax-form config, not a
// curated view (that fallback is why the panel used to show an arbitrary Schedule A / 1040 / W-2
// slice). Override per-request with ?tabs=Name1,Name2.
var WORKBOOK_TARGET_TABS_ = ['Acct Ledger', 'Proof of Mailing', '1099 Filing Chain'];

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
 * Validate a caller-supplied key against the TMAR_API_KEY Script Property.
 * The key is never stored in source (this file is in a public repo) — set it
 * once via Apps Script editor: Project Settings → Script Properties.
 * @param {string} providedKey - value of ?key= (GET) or payload.key (POST).
 * @return {TextOutput|null} an error response if unauthorized, else null (OK).
 */
function checkApiKey_(providedKey) {
  var expected = PropertiesService.getScriptProperties().getProperty('TMAR_API_KEY');
  if (!expected) return errorResponse_('Server misconfigured: TMAR_API_KEY Script Property not set');
  if (!providedKey || providedKey !== expected) return errorResponse_('Unauthorized — missing or invalid key');
  return null;
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

  var sheets = ['Master Register', 'Transaction Ledger', 'Business Obligations', '1099 Filing Chain',
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
  // Optional stop-marker: truncate at the first row whose col A contains it.
  if (options && options.stopMarker) {
    for (var si = 0; si < data.length; si++) {
      if (String(data[si][0] || '').indexOf(options.stopMarker) !== -1) {
        data = data.slice(0, si);
        break;
      }
    }
  }
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
  var __t0 = Date.now(), __status = 'OK', __err = '';
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

  if (action !== 'ping') {
    var authErr = checkApiKey_(e && e.parameter && e.parameter.key);
    if (authErr) return authErr;
  }

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
        var accounts = pullSheetData_(ss, 'Master Register', 4, [
          'rowId', 'dateAdded', 'provider', 'ein', 'accountNumber',
          'accountType', 'accountSubtype', 'status', 'openDate', 'closeDate',
          'currentBalance', 'originalBalance', 'billingFrequency', 'nextPaymentDue', 'primaryUser',
          'authorizedUsers', 'autopayStatus', 'paymentSource', 'contractTermsFile', 'statementsComplete',
          'taxFormsOnFile', 'popDocuments', 'documentLocation', 'lastStatementDate', 'lastVerifiedDate',
          'retentionPeriod', 'notes', 'tags', 'discoveryStatus'
        ], { einColumn: 3 });
        updateSyncTimestamp_(ss, 'Master Register', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pullAccounts', count: accounts.length, data: accounts });

      case 'pullTransactions':
        var txns = pullSheetData_(ss, 'Transaction Ledger', 2, [
          'date', 'reference', 'category', 'account', 'vendor',
          'description', 'amount', 'method', 'acctType', 'status',
          'taxDeductible', 'bizUsePct', 'dueDay', 'recurring', 'notes',
          'source'
        ]);
        updateSyncTimestamp_(ss, 'Transaction Ledger', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pullTransactions', count: txns.length, data: txns });

      case 'pullObligations':
        var obls = pullSheetData_(ss, 'Business Obligations', 2, [
          'vendor', 'category', 'subcategory', 'amount',
          'dueDay', 'paymentMethod', 'responsibleParty', 'status',
          'startDate', 'rateChanges', 'notes'
        ], { stopMarker: 'Monthly Pivot' });
        updateSyncTimestamp_(ss, 'Business Obligations', 'pull');
        return jsonResponse_({ status: 'ok', action: 'pullObligations', count: obls.length, data: obls });

      case 'pullChartOfAccounts': {
        var coaRows = pullSheetData_(ss, 'Chart of Accounts', 2, [
          'num', 'name', 'type', 'subtype', 'normalBal', 'formLine'
        ]);
        updateSyncTimestamp_(ss, 'Chart of Accounts', 'pull');
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
          'entity', 'name', 'tin', 'addressOnFile', 'currentAddress',
          'bank', 'accountNumber', 'routingNumber', 'grantor', 'trustee'
        ], { einColumn: 2 });
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
          'accountId', 'platform', 'username',
          'lastVerified', 'notes', 'acctEmail'
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

      case 'listSheetTabsMeta':
        var metaSheets = ss.getSheets();
        var metaTabs = [];
        for (var mi = 0; mi < metaSheets.length; mi++) {
          metaTabs.push({ name: metaSheets[mi].getName(), gid: metaSheets[mi].getSheetId(), hidden: metaSheets[mi].isSheetHidden() });
        }
        return jsonResponse_({ status: 'ok', action: 'listSheetTabsMeta', tabs: metaTabs });

      case 'dumpCanvasBoard':
        return jsonResponse_(dumpCanvasBoard_());

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

      case 'listExternalTabs': {
        var extId = (e.parameter && e.parameter.spreadsheetId) ? String(e.parameter.spreadsheetId) : '';
        if (!extId) return errorResponse_('Missing ?spreadsheetId= parameter');
        var extSS = SpreadsheetApp.openById(extId);
        var extTabs = extSS.getSheets().map(function(s) {
          return { name: s.getName(), gid: s.getSheetId(), hidden: s.isSheetHidden() };
        });
        return jsonResponse_({ status: 'ok', action: 'listExternalTabs', spreadsheetId: extId, tabs: extTabs });
      }

      case 'pullExternalTab': {
        var xId = (e.parameter && e.parameter.spreadsheetId) ? String(e.parameter.spreadsheetId) : '';
        var xTab = (e.parameter && e.parameter.tab) ? String(e.parameter.tab) : '';
        if (!xId) return errorResponse_('Missing ?spreadsheetId= parameter');
        if (!xTab) return errorResponse_('Missing ?tab= parameter');
        var xSS = SpreadsheetApp.openById(xId);
        var xSheet = xSS.getSheetByName(xTab);
        if (!xSheet) return errorResponse_('Sheet not found: ' + xTab);
        var xLastRow = xSheet.getLastRow();
        var xLastCol = xSheet.getLastColumn();
        if (xLastRow < 1 || xLastCol < 1) {
          return jsonResponse_({ status: 'ok', action: 'pullExternalTab', spreadsheetId: xId, tab: xTab, headers: [], rows: [] });
        }
        var xHeaders = xSheet.getRange(1, 1, 1, xLastCol).getValues()[0].map(function(h) {
          return h !== null && h !== undefined ? String(h).trim() : '';
        });
        var xRows = [];
        if (xLastRow > 1) {
          var xVals = xSheet.getRange(2, 1, xLastRow - 1, xLastCol).getValues();
          for (var xi = 0; xi < xVals.length; xi++) {
            var xRow = xVals[xi];
            var xHas = false;
            for (var xc = 0; xc < xRow.length; xc++) {
              if (xRow[xc] !== '' && xRow[xc] !== null && xRow[xc] !== undefined) { xHas = true; break; }
            }
            if (!xHas) continue;
            var xArr = [];
            for (var xj = 0; xj < xRow.length; xj++) {
              var xv = xRow[xj];
              if (xv instanceof Date) xv = xv.toISOString().slice(0, 10);
              xArr.push(xv !== null && xv !== undefined ? String(xv) : '');
            }
            xRows.push(xArr);
          }
        }
        return jsonResponse_({ status: 'ok', action: 'pullExternalTab', spreadsheetId: xId, tab: xTab, headers: xHeaders, rows: xRows });
      }

      case 'listRunnableFunctions':
        return jsonResponse_({ status: 'ok', action: 'listRunnableFunctions', functions: Object.keys(RUNNABLE_FUNCTIONS_) });

      case 'refreshScriptExecutions':
        return refreshScriptExecutions();

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
          // Several tabs open with a merged title banner ("CERTIFIED MAIL & PROOF OF MAILING
          // LOG") whose row 1 holds a single cell. Taking row 1 as the header row collapsed
          // those sheets to one junk column and made every data cell unreachable. Scan the
          // first few rows and use the first one that looks like a real header (>=2 labels).
          var scan = Math.min(5, lastRow);
          var probe = sheet.getRange(1, 1, scan, lastCol).getValues();
          var headerRow = 1;
          for (var hr = 0; hr < scan; hr++) {
            var filled = probe[hr].filter(function(c) {
              return c !== null && c !== undefined && String(c).trim() !== '';
            }).length;
            if (filled >= 2) { headerRow = hr + 1; break; }
          }
          var headers = probe[headerRow - 1].map(function(h) {
            return (h !== null && h !== undefined) ? String(h).trim() : '';
          });
          var rows = [];
          if (lastRow > headerRow) {
            sheet.getRange(headerRow + 1, 1, lastRow - headerRow, lastCol).getValues().forEach(function(row) {
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
          sheetData[sheet.getName()] = { gid: gid, headerRow: headerRow, headers: headers, rows: rows };
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

      case 'analyzeDuplicates':
        return jsonResponse_({ status: 'ok', action: 'analyzeDuplicates', report: analyzeDuplicateAccounts() });

      default:
        return errorResponse_('Unknown action: ' + action + '. Valid: ping, pullAccounts, pullTransactions, pullObligations, pull1099, pullValidation, pullPrincipalRegister, pullContacts, pullWebsiteAccounts, listSheetTabs, pullRawTab, listWorkbookTabs, pullWorkbookSheets, pullSubstituteW2, pullForm1040, pullScheduleA, pullSchedule1, pullSchedule2, pullWorksheetData, pullForm2848, pullForm8275R, pullAdminForms, analyzeDuplicates, listRunnableFunctions');
    }

  } catch (err) {
    __status = 'ERROR';
    __err = err.message || String(err);
    return errorResponse_(err.message || String(err));
  } finally {
    logExecution_('GET:' + action, __status, Date.now() - __t0, __err);
  }
}


// ─── doPost() — POST Request Dispatcher ──────────────────────────────────────

/**
 * Web App POST endpoint. Payload in e.postData.contents (JSON string).
 * Content-Type must be 'text/plain' to avoid CORS preflight.
 */
function doPost(e) {
  var __t0 = Date.now(), __status = 'OK', __err = '', __action = '';
  try {
    if (!e || !e.postData || !e.postData.contents) {
      __status = 'ERROR'; __err = 'No POST body';
      return errorResponse_('No POST body received');
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      __status = 'ERROR'; __err = 'Invalid JSON: ' + parseErr.message;
      return errorResponse_('Invalid JSON: ' + parseErr.message);
    }

    __action = (payload && payload.action) || '';

    var authErr = checkApiKey_(payload.key);
    if (authErr) { __status = 'ERROR'; __err = 'Auth error'; return authErr; }

    var action = payload.action || '';
    __action = action;
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
        updateSyncTimestamp_(ss, 'Business Obligations', 'push');
        return jsonResponse_(payResult);

      case 'pushChartOfAccounts':
        var coaV = validatePayload_(payload.accounts, ['num']);
        if (!coaV.valid) return errorResponse_(coaV.message);
        var coaResult = pushChartOfAccounts_(ss, payload.accounts);
        return jsonResponse_(coaResult);

      case 'buildExternalTabs': {
        var beId = payload.spreadsheetId;
        var beTabs = payload.tabs;
        if (!beId) return errorResponse_('Missing spreadsheetId');
        if (!beTabs || !beTabs.length) return errorResponse_('Missing tabs');
        var beSS = SpreadsheetApp.openById(beId);
        var beSummary = [];
        beTabs.forEach(function(t) {
          var tName = t.name;
          var tRows = t.rows || [];
          var tSheet = beSS.getSheetByName(tName);
          if (!tSheet) tSheet = beSS.insertSheet(tName);
          tSheet.clear();
          var tMaxCols = 1;
          tRows.forEach(function(r) { if (r.length > tMaxCols) tMaxCols = r.length; });
          if (tRows.length && tMaxCols) {
            tSheet.getRange(1, 1, tRows.length, tMaxCols).setValues(tRows.map(function(r) {
              var row = [];
              for (var ci = 0; ci < tMaxCols; ci++) row.push((r[ci] !== undefined && r[ci] !== null) ? r[ci] : '');
              return row;
            }));
          }
          beSummary.push({ name: tName, rows: tRows.length, cols: tMaxCols, gid: tSheet.getSheetId() });
        });
        return jsonResponse_({ status: 'ok', action: 'buildExternalTabs', spreadsheetId: beId, tabs: beSummary });
      }

      case 'applyStandardHeader': {
        var hdrList = payload.headers || [payload];
        var hdrSummary = [];
        hdrList.forEach(function(h) {
          hdrSummary.push(applyStandardHeader_(ss, h.sheetName, h.title, h.description, h.headerRow));
        });
        return jsonResponse_({ status: 'ok', action: 'applyStandardHeader', results: hdrSummary });
      }

      case 'renameSheet': {
        var rnId = payload.spreadsheetId;
        var rnOld = payload.oldName;
        var rnNew = payload.newName;
        var rnSS = rnId ? SpreadsheetApp.openById(rnId) : ss;
        var rnSheet = rnSS.getSheetByName(rnOld);
        if (!rnSheet) return errorResponse_('No sheet: ' + rnOld);
        rnSheet.setName(rnNew);
        return jsonResponse_({ status: 'ok', action: 'renameSheet', oldName: rnOld, newName: rnNew, gid: rnSheet.getSheetId() });
      }

      case 'restoreSheets': {
        // For each named sheet: delete the (truncated) live sheet and rename its latest backup back to the original name.
        var rsList = payload.sheets || [];
        var rsSummary = [];
        rsList.forEach(function(n) {
          var safe = String(n).replace(/[^\w\- ]/g, '').slice(0, 22);
          var all = ss.getSheets();
          var backup = null;
          all.forEach(function(s) {
            var nm = s.getName();
            if (nm.indexOf(safe) === 0 && nm.indexOf('_PreHeader_') > 0) {
              if (!backup || nm > backup.getName()) backup = s;
            }
          });
          if (!backup) { rsSummary.push({ sheet: n, error: 'no backup' }); return; }
          var live = ss.getSheetByName(n);
          if (live) ss.deleteSheet(live);
          backup.setName(n);
          backup.showSheet();
          rsSummary.push({ ok: true, sheet: n, restored: true });
        });
        return jsonResponse_({ status: 'ok', action: 'restoreSheets', results: rsSummary });
      }

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
          updateSyncTimestamp_(ss, 'Business Obligations', 'push');
        }
        if (payload.filings && payload.filings.length > 0) {
          results['1099'] = push1099_(ss, payload.filings);
          updateSyncTimestamp_(ss, '1099 Filing Chain', 'push');
        }
        return jsonResponse_({ status: 'ok', action: 'fullSync', results: results });

      case 'pushPrincipalRegister': {
        var prV = validatePayload_(payload.principals, ['name']);
        if (!prV.valid) return errorResponse_(prV.message);
        var prResult = pushPrincipalRegister_(ss, payload.principals);
        updateSyncTimestamp_(ss, 'Principal Register', 'push');
        return jsonResponse_(prResult);
      }

      case 'deletePrincipalRegister': {
        var dpNames = Array.isArray(payload.names) ? payload.names : [];
        if (dpNames.length === 0) return errorResponse_('Provide names (array of exact entity names)');
        var dpResult = deletePrincipalRegister_(ss, dpNames);
        updateSyncTimestamp_(ss, 'Principal Register', 'push');
        return jsonResponse_(dpResult);
      }

      case 'pushContacts': {
        var ctV = validatePayload_(payload.contacts, ['fullName']);
        if (!ctV.valid) return errorResponse_(ctV.message);
        var ctResult = pushContacts_(ss, payload.contacts);
        updateSyncTimestamp_(ss, 'Contacts', 'push');
        return jsonResponse_(ctResult);
      }

      case 'pushCreditorDetail': {
        var cdV = validatePayload_(payload.rows, ['obligor', 'creditor']);
        if (!cdV.valid) return errorResponse_(cdV.message);
        var cdResult = pushCreditorDetail_(ss, payload.rows);
        updateSyncTimestamp_(ss, 'FWM — Creditor Detail', 'push');
        return jsonResponse_(cdResult);
      }

      case 'deleteCreditorDetail': {
        var tabIds = Array.isArray(payload.tabIds) ? payload.tabIds : [];
        var keys = Array.isArray(payload.keys) ? payload.keys : [];
        if (tabIds.length === 0 && keys.length === 0) {
          return errorResponse_('Provide tabIds (array of Tab #) and/or keys (array of {obligor, creditor})');
        }
        var delResult = deleteCreditorDetail_(ss, tabIds, keys);
        updateSyncTimestamp_(ss, 'FWM — Creditor Detail', 'push');
        return jsonResponse_(delResult);
      }

      case 'foldCreditorRegistry':
        return jsonResponse_(foldCreditorRegistry_(ss));

      case 'fixCreditorDetailHeader':
        return jsonResponse_(fixCreditorDetailHeader_(ss));

      case 'foldCreditorDetailIntoMaster':
        return jsonResponse_(foldCreditorDetailIntoMaster_(ss, payload));

      case 'runFunction': {
        if (!payload.functionName || typeof payload.functionName !== 'string') {
          return errorResponse_('runFunction requires a "functionName" field');
        }
        return jsonResponse_(runAllowlistedFunction_(payload.functionName));
      }

      case 'applyVisualStandard':
        return jsonResponse_(applyVisualStandard());

      case 'embedAppScriptsLinks':
        return jsonResponse_(embedAppScriptsLinks_(payload.links));

      case 'pushWebsiteAccounts': {
        var waV = validatePayload_(payload.accounts, ['platform']);
        if (!waV.valid) return errorResponse_(waV.message);
        var waResult = pushWebsiteAccounts_(ss, payload.accounts);
        updateSyncTimestamp_(ss, 'Website Accounts', 'push');
        return jsonResponse_(waResult);
      }

      case 'deleteWebsiteAccounts': {
        var wdIds = Array.isArray(payload.accountIds) ? payload.accountIds : [];
        var wdPlatforms = Array.isArray(payload.platforms) ? payload.platforms : [];
        if (wdIds.length === 0 && wdPlatforms.length === 0) {
          return errorResponse_('Provide accountIds (array of WA-NNN) and/or platforms (array of exact platform names, for rows with no accountId)');
        }
        var wdResult = deleteWebsiteAccounts_(ss, wdIds, wdPlatforms);
        updateSyncTimestamp_(ss, 'Website Accounts', 'push');
        return jsonResponse_(wdResult);
      }

      case 'deleteForm1040': {
        var dfSubmittedAt = Array.isArray(payload.submittedAt) ? payload.submittedAt : [];
        var dfKeys = Array.isArray(payload.keys) ? payload.keys : [];
        if (dfSubmittedAt.length === 0 && dfKeys.length === 0) {
          return errorResponse_('Provide submittedAt (array of exact ISO timestamps) and/or keys (array of {tax_year, taxpayer_last_name})');
        }
        var dfResult = deleteForm1040_(ss, dfSubmittedAt, dfKeys);
        updateSyncTimestamp_(ss, '1040 Submissions', 'push');
        return jsonResponse_(dfResult);
      }

      case 'pushRegistryScan': {
        if (!payload.text || typeof payload.text !== 'string') {
          return errorResponse_('pushRegistryScan requires a "text" field with TSV/CSV content');
        }
        var mode = payload.mode || 'replace';  // 'replace' | 'append'
        var rsResult = importRegistryScan(payload.text, mode);
        updateSyncTimestamp_(ss, 'Document Registry', 'push');
        return jsonResponse_(rsResult);
      }

      case 'pushDocumentInventory': {
        var diV = validatePayload_(payload.rows, ['docId']);
        if (!diV.valid) return errorResponse_(diV.message);
        var diResult = pushDocumentInventory_(ss, payload.rows);
        updateSyncTimestamp_(ss, 'Document Inventory', 'push');
        return jsonResponse_(diResult);
      }

      case 'updateMasterRegister': {
        var umV = validatePayload_(payload.rows, ['rowId']);
        if (!umV.valid) return errorResponse_(umV.message);
        var umResult = updateMasterRegister_(ss, payload.rows);
        updateSyncTimestamp_(ss, 'Master Register', 'update');
        return jsonResponse_(umResult);
      }

      case 'deleteMasterRegister': {
        var dmIds = Array.isArray(payload.rowIds) ? payload.rowIds : [];
        if (dmIds.length === 0) return errorResponse_('Provide rowIds (array of MR-NNN ids)');
        var dmResult = deleteMasterRegister_(ss, dmIds);
        updateSyncTimestamp_(ss, 'Master Register', 'delete');
        return jsonResponse_(dmResult);
      }

      case 'dedupeAcctLedger': {
        var dalResult = dedupeAcctLedger_(ss);
        updateSyncTimestamp_(ss, 'Acct Ledger', 'dedupe');
        return jsonResponse_(dalResult);
      }

      case 'finalizeAcctLedger': {
        var falResult = finalizeAcctLedger_(ss);
        updateSyncTimestamp_(ss, 'Acct Ledger', 'finalize');
        return jsonResponse_(falResult);
      }

      case 'foldFinalize': {
        var ffResult = foldFinalize_(ss);
        updateSyncTimestamp_(ss, 'Master Register', 'fold');
        return jsonResponse_(ffResult);
      }

      case 'remapMasterRegister': {
        var rmResult = remapMasterRegister_(ss);
        updateSyncTimestamp_(ss, 'Master Register', 'remap');
        return jsonResponse_(rmResult);
      }

      case 'applyMasterRegisterSpec': {
        var spec = payload.spec || {};
        if (!spec.backfill && !spec.merges) return errorResponse_('Provide spec.backfill and/or spec.merges');
        var amrsResult = applyMasterRegisterSpec_(ss, spec);
        updateSyncTimestamp_(ss, 'Master Register', 'backfill');
        return jsonResponse_(amrsResult);
      }

      case 'mergeMasterRegisterFast': {
        var spec2 = payload.spec || {};
        if (!spec2.deletes || !spec2.deletes.length) return errorResponse_('Provide spec.deletes (entryNos)');
        var mmfResult = mergeMasterRegisterFast_(ss, spec2);
        updateSyncTimestamp_(ss, 'Master Register', 'merge');
        return jsonResponse_(mmfResult);
      }

      case 'clearBalanceValidation': {
        var cbvResult = clearBalanceValidation_(ss);
        return jsonResponse_(cbvResult);
      }

      case 'finishRegisterSplit': {
        var frsResult = finishRegisterSplit_(ss);
        return jsonResponse_(frsResult);
      }

      case 'backfillTINRegistry': {
        var btrResult = backfillTINRegistry_(ss);
        return jsonResponse_(btrResult);
      }

      case 'updateTINRegistry': {
        var utV = validatePayload_(payload.rows, ['name']);
        if (!utV.valid) return errorResponse_(utV.message);
        var utResult = updateTINRegistry_(ss, payload.rows);
        updateSyncTimestamp_(ss, 'TIN Registry', 'update');
        return jsonResponse_(utResult);
      }

      case 'applyFreewayAesthetic': {
        var fwaResult = applyFreewayAesthetic_(ss);
        return jsonResponse_(fwaResult);
      }

      case 'hyperlinkProviderColumn': {
        var links = Array.isArray(payload.mappings) ? payload.mappings : [];
        if (links.length === 0) return errorResponse_('Provide mappings (array of {name, url})');
        var hlResult = hyperlinkProviderColumn_(ss, links);
        updateSyncTimestamp_(ss, 'Master Register', 'hyperlink');
        return jsonResponse_(hlResult);
      }

      case 'pushAppScriptsInventory': {
        var aiV = validatePayload_(payload.rows, ['name', 'file']);
        if (!aiV.valid) return errorResponse_(aiV.message);
        var aiResult = pushAppScriptsInventory_(ss, payload.rows);
        updateSyncTimestamp_(ss, 'AppScripts', 'push');
        return jsonResponse_(aiResult);
      }

      case 'pushScriptExecutions': {
        var seV = validatePayload_(payload.rows, ['function']);
        if (!seV.valid) return errorResponse_(seV.message);
        var seResult = pushScriptExecutions_(ss, payload.rows);
        updateSyncTimestamp_(ss, 'Script Executions', 'push');
        return jsonResponse_(seResult);
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

      // Rebuild the Proof of Mailing tab from the reconciled record in PopulateProofOfMailing.gs
      // (clears every MAIL-* row, then re-inserts). Source of truth = pomRecords_() in that file.
      // No payload required. refreshProofOfMailing() resolves the Live book via openById() itself.
      case 'refreshProofOfMailing': {
        var pomMsg = refreshProofOfMailing();
        updateSyncTimestamp_(ss, 'Proof of Mailing', 'push');
        return jsonResponse_({ status: 'ok', action: 'refreshProofOfMailing', message: pomMsg });
      }

      case 'archiveTabs': {
        var atNames = Array.isArray(payload.tabs) ? payload.tabs : [];
        if (atNames.length === 0) return errorResponse_('archiveTabs requires a "tabs" array of exact tab names');
        var atName = payload.archiveName || ('APPC_Archive_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd'));
        return jsonResponse_(archiveTabs_(atNames, atName));
      }

      case 'pushCreditScorecard': {
        if (!payload.scorecard || typeof payload.scorecard !== 'object') {
          return errorResponse_('pushCreditScorecard requires a "scorecard" object {asOf, sourceNote, metrics, notes}');
        }
        var scResult = pushCreditScorecard_(ss, payload.scorecard);
        updateSyncTimestamp_(ss, SCORECARD_TAB_, 'push');
        return jsonResponse_(scResult);
      }

      case 'runWorkbookMerge': {
        var mergeName = payload.merge || '';
        var mResult;
        switch (mergeName) {
          case 'enrichMasterRegister': mResult = enrichMasterRegisterFromAcctLedger_(ss); break;
          case 'mergeCreditorData':    mResult = mergeCreditorData_(ss); break;
          case 'mergeValidation':      mResult = mergeValidation_(ss); break;
          case 'dedupeMasterRegister': mResult = dedupeMasterRegister_(ss); break;
          default: return errorResponse_('runWorkbookMerge requires "merge" = enrichMasterRegister | mergeCreditorData | mergeValidation | dedupeMasterRegister');
        }
        updateSyncTimestamp_(ss, 'Master Register', 'push');
        return jsonResponse_(mResult);
      }

      case 'finalizeWorkbookReorg': {
        var frReorg = finalizeWorkbookReorg_(ss);
        var frHub = regenerateHubIndex_(ss);
        updateSyncTimestamp_(ss, 'Master Register', 'push');
        return jsonResponse_({ status: 'ok', action: 'finalizeWorkbookReorg', reorg: frReorg, hubIndex: frHub });
      }

      case 'consolidateGuides': {
        var cg = consolidateGuides_(ss);
        var cgHub = regenerateHubIndex_(ss);
        updateSyncTimestamp_(ss, 'Master Register', 'push');
        return jsonResponse_({ status: 'ok', action: 'consolidateGuides', guides: cg, hubIndex: cgHub });
      }

      case 'listTriggers': {
        return jsonResponse_({ status: 'ok', action: 'listTriggers', triggers: listInstalledTriggers_(ss) });
      }

      case 'installConsolidationTrigger': {
        return jsonResponse_({ status: 'ok', action: 'installConsolidationTrigger', message: installConsolidationTrigger(), triggers: listInstalledTriggers_(ss) });
      }

      case 'removeConsolidationTrigger': {
        return jsonResponse_({ status: 'ok', action: 'removeConsolidationTrigger', message: removeConsolidationTrigger(), triggers: listInstalledTriggers_(ss) });
      }

      case 'runConsolidationNow': {
        return jsonResponse_({ status: 'ok', action: 'runConsolidationNow', result: runScheduledConsolidation() });
      }

      case 'pruneGuides': {
        var pg = pruneGuides_(ss);
        var pgHub = regenerateHubIndex_(ss);
        updateSyncTimestamp_(ss, 'Master Register', 'push');
        return jsonResponse_({ status: 'ok', action: 'pruneGuides', pruned: pg, hubIndex: pgHub });
      }

      case 'appendToArchive': {
        var aaNames = Array.isArray(payload.tabs) ? payload.tabs : [];
        if (aaNames.length === 0) return errorResponse_('appendToArchive requires a "tabs" array');
        var aaId = payload.archiveId || '1km7s7JBj8mj3-NxJ3HZwMRejCtyGsratKJ2oLkxQHww';
        return jsonResponse_(appendToArchive_(aaNames, aaId));
      }

      case 'foldScriptExecutions': {
        return jsonResponse_(foldScriptExecutions_(ss));
      }

      case 'rebuildSubscriptions': {
        var rbRows = Array.isArray(payload.rows) ? payload.rows : [];
        if (rbRows.length === 0) return errorResponse_('rebuildSubscriptions requires a non-empty "rows" array');
        var rbResult = rebuildSubscriptions_(ss, rbRows);
        updateSyncTimestamp_(ss, 'Subscriptions & Services', 'push');
        return jsonResponse_(rbResult);
      }

      case 'replaceSubscriptions': {
        var rpRows = Array.isArray(payload.rows) ? payload.rows : [];
        if (rpRows.length === 0) return errorResponse_('replaceSubscriptions requires a non-empty "rows" array');
        var rpResult = replaceSubscriptions_(ss, rpRows);
        updateSyncTimestamp_(ss, 'Subscriptions & Services', 'push');
        return jsonResponse_(rpResult);
      }

      case 'pushCashFlow': {
        if (!payload || !payload.payload || !Array.isArray(payload.payload.rows)) {
          return errorResponse_('pushCashFlow requires {payload:{tab, header, rows:[...]}}');
        }
        var cfResult = pushCashFlow_(ss, payload.payload);
        if (cfResult.status === 'ok') updateSyncTimestamp_(ss, String(payload.payload.tab || 'Cash Flow'), 'push');
        return jsonResponse_(cfResult);
      }

      case 'updateObligationCategories': {
        var uoRows = Array.isArray(payload.rows) ? payload.rows : [];
        if (uoRows.length === 0) return errorResponse_('updateObligationCategories requires a non-empty "rows" array');
        var uoResult = updateObligationCategories_(ss, uoRows);
        if (uoResult.status === 'ok') updateSyncTimestamp_(ss, 'Business Obligations', 'push');
        return jsonResponse_(uoResult);
      }

      case 'rebuildObligationsPivot': {
        var rpResult = rebuildObligationsPivot_(ss);
        if (rpResult.status === 'ok') updateSyncTimestamp_(ss, 'Business Obligations', 'push');
        return jsonResponse_(rpResult);
      }

      case 'recomputeObligationsPivotTotals': {
        var rtResult = recomputeObligationsPivotTotals_(ss);
        if (rtResult.status === 'ok') updateSyncTimestamp_(ss, 'Business Obligations', 'push');
        return jsonResponse_(rtResult);
      }

      case 'backfillAuditAccounts': {
        var ba = Array.isArray(payload.fills) ? payload.fills : [];
        if (ba.length === 0) return errorResponse_('Provide fills (array of {entry, audit})');
        var baResult = backfillAuditAccounts_(ss, ba);
        updateSyncTimestamp_(ss, 'Master Register', 'backfillAuditAccounts');
        return jsonResponse_(baResult);
      }

      case 'deleteSheetsByName': {
        var ds = Array.isArray(payload.sheetNames) ? payload.sheetNames : [];
        if (ds.length === 0) return errorResponse_('Provide sheetNames (array)');
        var dsResult = deleteSheetsByName_(ss, ds);
        return jsonResponse_(dsResult);
      }

      default:
        return errorResponse_('Unknown action: ' + action + '. Valid: pushEntities, pushTransactions, pushPayables, push1099, fullSync, pushPrincipalRegister, pushContacts, pushCreditorDetail, deleteCreditorDetail, pushWebsiteAccounts, deleteWebsiteAccounts, importSubstituteW2, importForm1040, importForm2848, importScheduleA, importSchedule1, importSchedule2, importForm8275R, importAdminForms, importWorksheetData, refreshProofOfMailing, archiveTabs, pushCreditScorecard, pushCashFlow, updateObligationCategories, rebuildObligationsPivot, runFunction');
    }

  } catch (err) {
    __status = 'ERROR';
    __err = err.message || String(err);
    return errorResponse_(err.message || String(err));
  } finally {
    logExecution_('POST:' + __action, __status, Date.now() - __t0, __err);
  }
}


/**
 * Rebuild the "Subscriptions & Services" register: backs up the current tab to a
 * hidden red snapshot, removes the stale MONTHLY TOTAL row + any out-of-place
 * audit-dump/footer content below it, then appends the given clean rows. Preserves
 * the designed header + existing data rows (and their formatting) untouched.
 */
function rebuildSubscriptions_(ss, newRows) {
  var sheet = ss.getSheetByName('Subscriptions & Services');
  if (!sheet) return { status: 'error', action: 'rebuildSubscriptions', message: 'Subscriptions & Services tab not found' };
  var HEADERS = ['Service', 'Category', 'Monthly Cost', 'Annual Cost', 'Payment Method', 'Responsible Party', 'Status', 'Tax Deductible', 'Business Use %', 'Notes'];

  // 1) Backup-before-write (full sheet → hidden red tab).
  var backupName = 'Subscriptions_PreRebuild_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || HEADERS.length;
  var backup = ss.insertSheet(backupName, ss.getNumSheets());
  if (lastRow > 0) {
    backup.getRange(1, 1, lastRow, lastCol).setValues(sheet.getRange(1, 1, lastRow, lastCol).getValues());
  }
  backup.setTabColor('#c0392b');
  try { backup.hideSheet(); } catch (e) {}

  // 2) Locate the boundary: the MONTHLY TOTAL row, else the first footer line.
  var colA = sheet.getRange(1, 1, lastRow, 1).getValues();
  var boundaryRow = lastRow + 1;
  for (var i = 1; i < colA.length; i++) {
    var v = String(colA[i][0] || '').trim();
    if (/MONTHLY TOTAL/i.test(v) || /^(A Provident Private Creditor|TMAR Tools)/.test(v)) {
      boundaryRow = i + 1;
      break;
    }
  }

  // 3) Delete from the boundary to the end (stale total + audit dump + footers).
  var removed = 0;
  if (boundaryRow <= lastRow) {
    sheet.deleteRows(boundaryRow, lastRow - boundaryRow + 1);
    removed = lastRow - boundaryRow + 1;
  }

  // 4) Append the clean new rows.
  var added = 0;
  (newRows || []).forEach(function (r) {
    var padded = (r || []).slice(0, HEADERS.length);
    while (padded.length < HEADERS.length) padded.push('');
    sheet.appendRow(padded);
    added++;
  });

  return { status: 'ok', action: 'rebuildSubscriptions', backedUp: backupName, rowsRemoved: removed, rowsAdded: added };
}

/**
 * Full-replace the "Subscriptions & Services" register: backs up the current tab
 * to a hidden red snapshot, clears the entire tab, then rewrites the header + the
 * given rows verbatim. Used when existing rows need correcting (append-only
 * rebuildSubscriptions_ can't update a row that's already there).
 */
function replaceSubscriptions_(ss, allRows) {
  var sheet = ss.getSheetByName('Subscriptions & Services');
  if (!sheet) return { status: 'error', action: 'replaceSubscriptions', message: 'Subscriptions & Services tab not found' };
  var HEADERS = ['Service', 'Category', 'Monthly Cost', 'Annual Cost', 'Payment Method', 'Responsible Party', 'Status', 'Tax Deductible', 'Business Use %', 'Notes'];

  // 1) Backup-before-write (full sheet → hidden red tab).
  var backupName = 'Subscriptions_PreReplace_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || HEADERS.length;
  var backup = ss.insertSheet(backupName, ss.getNumSheets());
  if (lastRow > 0) {
    backup.getRange(1, 1, lastRow, lastCol).setValues(sheet.getRange(1, 1, lastRow, lastCol).getValues());
  }
  backup.setTabColor('#c0392b');
  try { backup.hideSheet(); } catch (e) {}

  // 2) Clear the whole tab.
  if (lastRow > 0) {
    sheet.getRange(1, 1, lastRow, sheet.getMaxColumns()).clearContent();
  }

  // 3) Rewrite the header.
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  // 4) Write every row.
  var written = 0;
  (allRows || []).forEach(function (r) {
    var padded = (r || []).slice(0, HEADERS.length);
    while (padded.length < HEADERS.length) padded.push('');
    sheet.getRange(2 + written, 1, 1, HEADERS.length).setValues([padded]);
    written++;
  });

  return { status: 'ok', action: 'replaceSubscriptions', backedUp: backupName, rowsWritten: written };
}

/**
 * Rebuild a "<Bank> Cash Flow" tab from the Python-computed monthly summary.
 * Payload: { tab, header, anchor, years:[...], annual:{...}, rows:[{year,month,
 * month_name, beginning_balance, deposits, debits, fees, ending_balance, net_change}] }.
 *
 * Layout per tab:
 *   Row 1          : [<bank header>, Beginning Balance, Total Deposits, Total Debits, Fees/Charges, Ending Balance, Net Change]
 *   Per year (asc) : [<year>] separator, then Jan..Dec monthly rows, then [ANNUAL <year>] total row.
 *   Footer         : blank + a "generated from combined statement CSVs · anchor $X" provenance note.
 *
 * Backs the current tab up to a hidden red snapshot first (reversible), then clears + rewrites.
 */
function pushCashFlow_(ss, p) {
  var tab = String(p.tab || '');
  if (!tab) return { status: 'error', action: 'pushCashFlow', message: 'missing payload.tab' };
  var sheet = ss.getSheetByName(tab);
  var created = false;
  if (!sheet) { sheet = ss.insertSheet(tab); created = true; }

  var HEADERS = ['', 'Beginning Balance', 'Total Deposits', 'Total Debits', 'Fees/Charges', 'Ending Balance', 'Net Change'];

  // 1) Backup-before-write (full sheet → hidden red tab).
  var backupName = tab.replace(/\s+/g, '') + '_PreCashFlow_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || HEADERS.length;
  var backup = ss.insertSheet(backupName, ss.getNumSheets());
  if (lastRow > 0) {
    backup.getRange(1, 1, lastRow, lastCol).setValues(sheet.getRange(1, 1, lastRow, lastCol).getValues());
  }
  backup.setTabColor('#c0392b');
  try { backup.hideSheet(); } catch (e) {}

  // 2) Clear the whole tab (content + any leftover formatting down 2000 rows).
  sheet.clearContents();
  sheet.getRange(1, 1, 2000, HEADERS.length).clearFormat();

  // 3) Write header row.
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1).setValue(String(p.header || tab));

  // 4) Build year blocks from rows (rows are already ordered by year then month).
  var rows = Array.isArray(p.rows) ? p.rows : [];
  var byYear = {};
  rows.forEach(function (r) { (byYear[r.year] = byYear[r.year] || []).push(r); });
  var years = (p.years || []).slice().sort(function (a, b) { return a - b; });
  if (years.length === 0) years = Object.keys(byYear).map(Number).sort(function (a, b) { return a - b; });

  var out = [];
  years.forEach(function (y) {
    var mrows = byYear[y] || [];
    out.push([String(y), '', '', '', '', '', '']);   // year separator
    mrows.forEach(function (r) {
      out.push([r.month_name || r.month, r.beginning_balance, r.deposits, r.debits, r.fees, r.ending_balance, r.net_change]);
    });
    var a = (p.annual && p.annual[String(y)]) || {};
    var open = mrows.length ? mrows[0].beginning_balance : '';
    var close = mrows.length ? mrows[mrows.length - 1].ending_balance : '';
    out.push(['ANNUAL ' + y, open, a.deposits != null ? a.deposits : '', a.debits != null ? a.debits : '', a.fees != null ? a.fees : '', close, a.net != null ? a.net : '']);
    out.push(['', '', '', '', '', '', '']);
  });

  var note = 'Generated from combined statement CSVs (generate_cashflow_summaries.py) · '
           + (p.anchor != null ? ('opening balance anchor $' + p.anchor) : 'opening balance anchor NOT resolved — balances chain from $0.00')
           + ' · ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm')
           + ' · ' + (p.total_tx_count != null ? p.total_tx_count + ' txs, ' : '')
           + (p.fee_tx_count != null ? p.fee_tx_count + ' fee-classified' : '');
  out.push(['', '', '', '', '', '', '']);
  out.push([note, '', '', '', '', '', '']);

  if (out.length) sheet.getRange(2, 1, out.length, HEADERS.length).setValues(out);

  // 5) Light formatting: bold header, number format on numeric columns (C..G → $#,##0.00).
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  if (out.length) {
    var numRange = sheet.getRange(2, 2, out.length, 6);
    numRange.setNumberFormat('$#,##0.00;[Red]-$#,##0.00');
  }

  return { status: 'ok', action: 'pushCashFlow', tab: tab, created: created,
           backedUp: backupName, yearBlocks: years.length, monthRows: rows.length };
}

/**
 * Recategorize the Business Obligations REGISTER (rows above the monthly-pivot block):
 * set column B (Category) on each matched vendor. Backs the tab up to a hidden red
 * snapshot first (reversible). Rows: [{vendor, category}]. Matches by col A (vendor),
 * stopping the scan at the "JOINT HOUSEHOLD EXPENSES" pivot header so pivot rows are
 * never touched.
 */
function updateObligationCategories_(ss, rows) {
  var sheet = ss.getSheetByName('Business Obligations');
  if (!sheet) return { status: 'error', action: 'updateObligationCategories', message: 'Business Obligations tab not found' };

  // 1) Backup before write.
  var backupName = 'Obligations_PreRecat_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || 11;
  var backup = ss.insertSheet(backupName, ss.getNumSheets());
  if (lastRow > 0) {
    backup.getRange(1, 1, lastRow, lastCol).setValues(sheet.getRange(1, 1, lastRow, lastCol).getValues());
  }
  backup.setTabColor('#c0392b');
  try { backup.hideSheet(); } catch (e) {}

  // 2) Vendor -> row map over the REGISTER only (col A, rows 2..lastRow, stop at pivot).
  var colA = sheet.getRange(1, 1, lastRow, 1).getValues();
  var vendorMap = {};
  for (var i = 1; i < colA.length; i++) {
    var v = String(colA[i][0] || '').trim();
    if (v.indexOf('JOINT HOUSEHOLD') !== -1) break;
    if (v) vendorMap[v.toLowerCase()] = i + 1;
  }

  // 3) Apply category updates.
  var updated = 0, notFound = [];
  (rows || []).forEach(function (r) {
    var vendor = String(r.vendor || '').trim();
    if (!vendor) return;
    var rowNum = vendorMap[vendor.toLowerCase()];
    if (!rowNum) { notFound.push(vendor); return; }
    sheet.getRange(rowNum, 2).setValue(String(r.category == null ? '' : r.category));
    updated++;
  });

  return { status: 'ok', action: 'updateObligationCategories', backedUp: backupName, updated: updated, notFound: notFound };
}

/**
 * Rebuild the Business Obligations monthly-pivot block: re-map household budget
 * categories to the Schedule C business taxonomy, merge Automotive+Transportation
 * into Mileage / Vehicle, drop non-business rows, and rename the "JOINT HOUSEHOLD
 * EXPENSES" header to "JOINT BUSINESS EXPENSES". Backup-first (reversible).
 */
function rebuildObligationsPivot_(ss) {
  var sheet = ss.getSheetByName('Business Obligations');
  if (!sheet) return { status: 'error', action: 'rebuildObligationsPivot', message: 'Business Obligations tab not found' };

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || 13;

  // 1) Backup the whole tab (reversible).
  var backupName = 'Obligations_PrePivotRebuild_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  var backup = ss.insertSheet(backupName, ss.getNumSheets());
  backup.getRange(1, 1, lastRow, lastCol).setValues(sheet.getRange(1, 1, lastRow, lastCol).getValues());
  backup.setTabColor('#c0392b');
  try { backup.hideSheet(); } catch (e) {}

  // 2) Locate the pivot header + footer rows.
  var colA = sheet.getRange(1, 1, lastRow, 1).getValues();
  var pivotHeaderRow = -1, footerRow = -1;
  for (var i = 0; i < colA.length; i++) {
    var v = String(colA[i][0] || '');
    if (pivotHeaderRow < 0 && (v.indexOf('Monthly Pivot') !== -1 || v.indexOf('JOINT') !== -1)) pivotHeaderRow = i + 1;
    if (v.indexOf('A Provident Private Creditor') !== -1) { footerRow = i + 1; break; }
  }
  if (pivotHeaderRow < 0) return { status: 'error', action: 'rebuildObligationsPivot', message: 'pivot header not found' };

  var colHeaderRow = pivotHeaderRow + 1;
  var dataStart = colHeaderRow + 1;
  var dataEnd = (footerRow > 0 ? footerRow : lastRow + 1) - 1;
  var numMonths = 12;

  var block = sheet.getRange(dataStart, 1, dataEnd - dataStart + 1, numMonths + 1).getValues();

  // 3) Re-map + merge + drop.
  var MAP = {
    'Housing': 'Rent / Lease',
    'Utilities': 'Utilities',
    'Debt': 'Interest Expense',
    'Insurance': 'Business Insurance',
    'Travel': 'Business Travel',
    'Subscriptions': 'Dues & Subscriptions',
    'Taxes': 'State & Local Taxes',
    'Fitness': 'Personal — non-deductible',
    'Automotive': 'Mileage / Vehicle',
    'Transportation': 'Mileage / Vehicle'
  };
  var DROP = { 'Income': 1, 'Transfers': 1, 'Shopping': 1, 'Personal': 1, 'Groceries': 1, 'Dining': 1, 'Healthcare': 1 };
  var ORDER = ['Rent / Lease', 'Utilities', 'Interest Expense', 'Business Insurance',
               'Business Travel', 'Dues & Subscriptions', 'State & Local Taxes',
               'Personal — non-deductible', 'Mileage / Vehicle'];

  var agg = {};
  for (var o = 0; o < ORDER.length; o++) {
    var rowArr = [ORDER[o]];
    for (var m = 0; m < numMonths; m++) rowArr.push('');
    agg[ORDER[o]] = rowArr;
  }

  for (var r = 0; r < block.length; r++) {
    var cat = String(block[r][0] || '').trim();
    if (DROP[cat]) continue;
    var target = MAP[cat];
    if (!target) continue;
    for (var m = 1; m <= numMonths; m++) {
      var val = block[r][m];
      if (val === '' || val === null || val === undefined) continue;
      var num = Number(val);
      if (isNaN(num)) continue;
      var cur = agg[target][m];
      agg[target][m] = (cur === '' || cur === null) ? num : cur + num;
    }
  }

  var out = [];
  for (var o2 = 0; o2 < ORDER.length; o2++) out.push(agg[ORDER[o2]]);

  // 4) Rename header + write the new block + delete leftover rows.
  sheet.getRange(pivotHeaderRow, 1).setValue('🏢 JOINT BUSINESS EXPENSES — TRUST MASTER ACCOUNT (Monthly Pivot)');

  var oldBlockRows = dataEnd - dataStart + 1;
  sheet.getRange(dataStart, 1, out.length, numMonths + 1).setValues(out);
  var extra = oldBlockRows - out.length;
  if (extra > 0) sheet.deleteRows(dataStart + out.length, extra);

  return { status: 'ok', action: 'rebuildObligationsPivot', backedUp: backupName,
           rowsBefore: oldBlockRows, rowsAfter: out.length,
           categories: out.map(function (rr) { return rr[0]; }) };
}

/**
 * Recompute the Business Obligations pivot's "Annual Total" column (col 14)
 * as the sum of each row's 12 monthly cells. Used to repair the pivot after a
 * category re-map, where the old totals no longer line up with the new rows.
 * Idempotent; rounds to cents.
 */
function recomputeObligationsPivotTotals_(ss) {
  var sheet = ss.getSheetByName('Business Obligations');
  if (!sheet) return { status: 'error', action: 'recomputeObligationsPivotTotals', message: 'tab not found' };

  var lastRow = sheet.getLastRow();
  var colA = sheet.getRange(1, 1, lastRow, 1).getValues();

  var headerRow = -1, toolsRow = -1;
  for (var i = 0; i < colA.length; i++) {
    var v = String(colA[i][0] || '');
    if (headerRow < 0 && v.indexOf('Monthly Pivot') !== -1) headerRow = i + 1;
    if (v.indexOf('TMAR Tools') !== -1) toolsRow = i + 1;
  }
  if (headerRow < 0) return { status: 'error', action: 'recomputeObligationsPivotTotals', message: 'pivot header not found' };

  var dataStart = headerRow + 2;                       // first category row (after header + column header)
  var dataEnd = (toolsRow > 0 ? toolsRow - 2 : lastRow - 1);  // two footer rows above "TMAR Tools"
  var numRows = dataEnd - dataStart + 1;
  if (numRows < 1) return { status: 'error', action: 'recomputeObligationsPivotTotals', message: 'no pivot data rows' };

  var months = sheet.getRange(dataStart, 2, numRows, 12).getValues(); // cols B..M (Jan..Dec)
  var totals = [];
  for (var r = 0; r < numRows; r++) {
    var sum = 0;
    for (var m = 0; m < 12; m++) {
      var v = months[r][m];
      if (v === '' || v === null || v === undefined) continue;
      var n = Number(v);
      if (!isNaN(n)) sum += n;
    }
    totals.push([Math.round(sum * 100) / 100]);
  }
  sheet.getRange(dataStart, 14, numRows, 1).setValues(totals);

  return { status: 'ok', action: 'recomputeObligationsPivotTotals', rows: numRows,
           totals: totals.map(function (t) { return t[0]; }) };
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
  if (lastRow > 1) {
    // Data starts at row 2 (row 1 is the header) — starting this scan at row 3
    // silently skipped MR-001 forever, so any "update" to it appended a
    // duplicate row instead. Found 2026-08-02 fixing Boys & Girls Club Wayne.
    var existingData = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
    for (var i = 0; i < existingData.length; i++) {
      if (existingData[i][0]) existingProviders[String(existingData[i][0]).toLowerCase().trim()] = i + 2;
    }
  }

  var nextId = 1;
  if (lastRow > 1) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var k = 0; k < ids.length; k++) {
      var match = String(ids[k][0]).match(/MR-(\d+)/);
      if (match) nextId = Math.max(nextId, parseInt(match[1]) + 1);
    }
  }

  // Account Type is written verbatim from ent.accountType (lossless round-trip) — see row[5].

  var imported = 0, skipped = 0, updated = 0;

  for (var e = 0; e < entities.length; e++) {
    var ent = entities[e];
    var name = (ent.name || '').trim();
    if (!name) continue;

    var existingRow = existingProviders[name.toLowerCase()];
    if (existingRow) {
      // Upsert: update existing row with all provided fields.
      // Uses !== undefined (not truthy) so a legitimate $0 balance or similar zero value writes correctly.
      // Each field is written + flushed independently inside its own try/catch: a data-validation
      // rejection on one column (e.g. a dropdown-restricted cell) throws, and without isolating it
      // per field + an explicit flush(), that exception aborts the whole upsert AND rolls back every
      // pending write that hadn't been flushed yet — silently dropping fields that "succeeded" earlier
      // in the list. Found 2026-08-01 fixing the credit-report-import column shift (MR-112/114/116/146).
      var fieldMap = [
        ['accountType', 6], ['subtype', 7], ['status', 8], ['openDate', 9], ['closeDate', 10],
        ['currentBalance', 11], ['originalBalance', 12], ['primaryUser', 15],
        ['paymentSource', 18], ['statementsComplete', 20], ['documentLocation', 23],
        ['lastStatementDate', 24], ['lastVerified', 25], ['notes', 27]
      ];
      for (var fi = 0; fi < fieldMap.length; fi++) {
        var fKey = fieldMap[fi][0], fCol = fieldMap[fi][1];
        if (ent[fKey] === undefined) continue;
        try {
          sheet.getRange(existingRow, fCol).setValue(ent[fKey]);
          SpreadsheetApp.flush();
        } catch (writeErr) {
          // A rejected value (e.g. validation-restricted dropdown column) shouldn't block the rest.
        }
      }
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
    row[5] = ent.accountType || ent.type || '';
    row[6] = ent.subtype || '';
    row[7] = ent.status || 'Active';
    row[8] = ent.openDate || '';
    row[10] = ent.currentBalance || '';
    row[14] = ent.primaryUser || '';
    row[17] = ent.paymentSource || '';
    row[19] = ent.statementsComplete || '';
    row[22] = ent.documentLocation || '';
    row[23] = ent.lastStatementDate || '';
    row[24] = ent.lastVerified || '';
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
    var debit = parseFloat(t.debit) || 0;
    var credit = parseFloat(t.credit) || 0;
    var amount = (debit || credit) ? (debit - credit) : ((t.amount !== undefined && t.amount !== '') ? t.amount : '');
    var row = new Array(16).fill('');
    row[0] = t.date || new Date().toISOString().slice(0, 10);   // Date
    row[1] = t.reference || '';                                   // Party
    row[2] = t.category || '';                                    // Category
    row[3] = t.account || '';                                     // Subcategory
    row[4] = t.vendor || '';                                      // Vendor
    row[5] = t.description || '';                                 // Description
    row[6] = amount;                                              // Amount
    row[7] = t.method || '';                                      // Payment
    row[8] = t.acctType || '';                                    // Acct Type
    row[9] = t.status || '';                                      // Status
    row[10] = t.taxDeductible || '';                              // Tax Ded?
    row[11] = t.bizUsePct || '';                                  // Biz Use %
    row[12] = t.dueDay || '';                                     // Due Day
    row[13] = t.recurring || '';                                  // Recurring
    row[14] = t.notes || '';                                      // Notes
    row[15] = t.source || 'Accrual Ledger';                       // Source
    rows.push(row);
  }

  if (rows.length > 0) {
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, 16).setValues(rows);
  }

  return { status: 'ok', action: 'pushTransactions', imported: rows.length };
}

/**
 * Push payables to Business Obligations via Web App.
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

function applyStandardHeader_(ss, sheetName, title, description, headerRow) {
  try {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { error: 'no sheet: ' + sheetName };
    var ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
    var backup = sheet.copyTo(ss);
    var safeName = String(sheetName).replace(/[^\w\- ]/g, '').slice(0, 22);
    backup.setName(safeName + '_PreHeader_' + ts);
    backup.hideSheet();
    var insert = 4 - headerRow;
    if (insert > 0) sheet.insertRows(1, insert);
    var lastCol = Math.max(sheet.getLastColumn(), 1);
    sheet.getRange(1, 1, 3, lastCol).clear();
    sheet.getRange(1, 1).setValue(title);
    sheet.getRange(2, 1).setValue(description);
    sheet.getRange(1, 1).setFontWeight('bold');
    sheet.setFrozenRows(4);
    SpreadsheetApp.flush();
    return { ok: true, sheet: sheetName, backup: backup.getName(), inserted: insert };
  } catch (err) {
    return { error: String(err), sheet: sheetName };
  }
}

function pushChartOfAccounts_(ss, accounts) {
  // GUI's GAAP chart is authoritative → upsert by Account # into the canonical
  // 'Chart of Accounts' tab (header: Account # | Account Name | Type | Subtype |
  // Normal Balance | Form Line | Country). Existing rows keep their col-7 edit markers.
  var sheet = ss.getSheetByName('Chart of Accounts');
  if (!sheet) {
    sheet = ss.insertSheet('Chart of Accounts');
    sheet.getRange(1, 1, 1, 7).setValues([['Account #', 'Account Name', 'Type', 'Subtype', 'Normal Balance', 'Form Line', 'Country']]);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  var lastRow = sheet.getLastRow();
  var byNum = {};
  if (lastRow > 1) {
    var nums = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < nums.length; i++) {
      var n = nums[i][0] != null ? String(nums[i][0]).trim() : '';
      if (n) byNum[n] = i + 2;
    }
  }
  var newRows = [];
  var imported = 0, updated = 0;
  (accounts || []).forEach(function(a) {
    var num = String(a.num || '').trim();
    if (!num) return;
    var vals = [num, a.name || '', a.type || '', a.subtype || '', a.normalBal || a.normalBalance || '', a.formLine || ''];
    var existingRow = byNum[num];
    if (existingRow) {
      sheet.getRange(existingRow, 1, 1, 6).setValues([vals]);
      updated++;
    } else {
      var row = new Array(7).fill('');
      row[0] = num; row[1] = vals[1]; row[2] = vals[2]; row[3] = vals[3]; row[4] = vals[4]; row[5] = vals[5];
      newRows.push(row);
      imported++;
    }
  });
  if (newRows.length) sheet.getRange(lastRow + 1, 1, newRows.length, 7).setValues(newRows);
  updateSyncTimestamp_(ss, 'Chart of Accounts', 'push');
  return { status: 'ok', action: 'pushChartOfAccounts', imported: imported, updated: updated };
}

function pushPayables_(ss, payables) {
  var sheet = ss.getSheetByName('Business Obligations');
  if (!sheet) return { status: 'error', action: 'pushPayables', message: 'Business Obligations tab not found' };

  var lastRow = sheet.getLastRow();
  var vendorMap = {};
  var pivotRow = -1;
  if (lastRow > 1) {
    var vendors = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var v = 0; v < vendors.length; v++) {
      var cellVal = vendors[v][0] ? String(vendors[v][0]) : '';
      if (pivotRow < 0 && /Monthly Pivot/i.test(cellVal)) pivotRow = v + 2; // 1-indexed sheet row of the pivot block
      if (cellVal && !/Monthly Pivot/i.test(cellVal)) vendorMap[cellVal.toLowerCase().trim()] = v + 2;
    }
  }

  // New rows are inserted just above the pivot block so they stay inside the obligations list.
  var insertRow = pivotRow > 0 ? pivotRow : (lastRow > 1 ? lastRow + 1 : 2);

  var newRows = [];
  var imported = 0, updated = 0;

  for (var p = 0; p < payables.length; p++) {
    var pay = payables[p];
    var vendor = String(pay.vendor || pay.name || '').trim();
    if (!vendor) continue;

    var existingRow = vendorMap[vendor.toLowerCase()];
    if (existingRow) {
      // Upsert: overwrite only fields explicitly provided (preserve the rest).
      if (pay.category !== undefined && pay.category !== '') sheet.getRange(existingRow, 2).setValue(pay.category);
      if (pay.subcategory !== undefined && pay.subcategory !== '') sheet.getRange(existingRow, 3).setValue(pay.subcategory);
      var amt = (pay.amount !== undefined && pay.amount !== '') ? pay.amount : ((pay.monthlyAmount !== undefined && pay.monthlyAmount !== '') ? pay.monthlyAmount : '');
      if (amt !== '') sheet.getRange(existingRow, 4).setValue(amt);
      if (pay.dueDay || pay.dueDate) sheet.getRange(existingRow, 5).setValue(pay.dueDay || pay.dueDate);
      if (pay.paymentMethod || pay.autopay) sheet.getRange(existingRow, 6).setValue(pay.paymentMethod || pay.autopay);
      if (pay.responsibleParty || pay.party) sheet.getRange(existingRow, 7).setValue(pay.responsibleParty || pay.party);
      if (pay.status) sheet.getRange(existingRow, 8).setValue(pay.status);
      if (pay.startDate) sheet.getRange(existingRow, 9).setValue(pay.startDate);
      if (pay.rateChanges) sheet.getRange(existingRow, 10).setValue(pay.rateChanges);
      if (pay.notes) sheet.getRange(existingRow, 11).setValue(pay.notes);
      updated++;
    } else {
      var row = new Array(11).fill('');
      row[0] = vendor;                                        // A Vendor
      row[1] = pay.category || '';                            // B Category
      row[2] = pay.subcategory || '';                         // C Subcategory
      row[3] = pay.amount || pay.monthlyAmount || '';         // D Current Monthly
      row[4] = pay.dueDay || pay.dueDate || '';               // E Due Day
      row[5] = pay.paymentMethod || pay.autopay || '';        // F Payment Method
      row[6] = pay.responsibleParty || pay.party || '';       // G Responsible Party
      row[7] = pay.status || 'Active';                        // H Status
      row[8] = pay.startDate || '';                           // I Start Date
      row[9] = pay.rateChanges || '';                         // J Rate Changes
      row[10] = pay.notes || '';                              // K Notes
      newRows.push(row);
      imported++;
    }
  }

  // Insert all new rows in one block above the pivot (keeps the obligations list contiguous).
  if (newRows.length) {
    sheet.insertRowsBefore(insertRow, newRows.length);
    sheet.getRange(insertRow, 1, newRows.length, 11).setValues(newRows);
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
 * Delete rows from "1040 Submissions" by exact `submitted_at` timestamp and/or
 * by a {tax_year, taxpayer_last_name} key pair.
 * Backs up every deleted row to a new sheet ("F1040_PreDelete_<timestamp>")
 * before removing anything — deletion is always reversible.
 * @param {Spreadsheet} ss
 * @param {Array<string>} submittedAt - exact ISO `submitted_at` values (col 23).
 * @param {Array<Object>} keys - {tax_year, taxpayer_last_name} pairs to delete.
 */
function deleteForm1040_(ss, submittedAt, keys) {
  var sheet = ss.getSheetByName('1040 Submissions');
  if (!sheet) return { status: 'error', action: 'deleteForm1040', message: '1040 Submissions tab not found' };

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { status: 'ok', action: 'deleteForm1040', deleted: 0, notFound: submittedAt, notFoundKeys: keys };
  }

  var n = lastRow - 1; // data rows, header at row 1
  var data = sheet.getRange(2, 1, n, 24).getValues();

  var tsSet = {};
  (submittedAt || []).forEach(function (t) { if (t) tsSet[String(t).trim()] = true; });
  var keySet = {};
  (keys || []).forEach(function (k) {
    if (k && k.tax_year && k.taxpayer_last_name) {
      keySet[(String(k.tax_year).trim() + '|' + String(k.taxpayer_last_name).trim().toLowerCase())] = true;
    }
  });

  var matchedTs = {}, matchedKeys = {};
  var deletedRows = [];
  var rowsToDelete = [];

  for (var i = 0; i < n; i++) {
    var row = data[i];
    var taxYear = String(row[0] || '').trim();
    var lastName = String(row[3] || '').trim();
    var submitted = String(row[22] || '').trim();
    var isMatch = false;

    if (submitted && tsSet[submitted]) { isMatch = true; matchedTs[submitted] = true; }
    else {
      var kkey = taxYear + '|' + lastName.toLowerCase();
      if (keySet[kkey]) { isMatch = true; matchedKeys[kkey] = true; }
    }

    if (isMatch) {
      deletedRows.push(row);
      rowsToDelete.push(i + 2); // +2: header row + 1-based index
    }
  }

  if (rowsToDelete.length === 0) {
    return { status: 'ok', action: 'deleteForm1040', deleted: 0, notFound: submittedAt, notFoundKeys: keys };
  }

  // Backup before delete — full 24-column snapshot of exactly the rows being removed.
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
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Chicago', 'yyyyMMdd_HHmmss');
  var backupName = 'F1040_PreDelete_' + stamp;
  var backupSheet = ss.insertSheet(backupName);
  backupSheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  backupSheet.getRange(2, 1, deletedRows.length, headers.length).setValues(deletedRows);
  backupSheet.setTabColor('#ef4444');

  // Delete bottom-up so earlier row indices stay valid.
  rowsToDelete.sort(function (a, b) { return b - a; });
  for (var d = 0; d < rowsToDelete.length; d++) sheet.deleteRow(rowsToDelete[d]);

  // Compute which requested keys did NOT match, for accurate reporting.
  var notFoundTs = [];
  (submittedAt || []).forEach(function (t) { if (t && !matchedTs[String(t).trim()]) notFoundTs.push(t); });
  var notFoundKeys = [];
  (keys || []).forEach(function (k) {
    if (k && k.tax_year && k.taxpayer_last_name) {
      var kkey = String(k.tax_year).trim() + '|' + String(k.taxpayer_last_name).trim().toLowerCase();
      if (!matchedKeys[kkey]) notFoundKeys.push(k);
    }
  });

  SpreadsheetApp.flush();
  return {
    status: 'ok', action: 'deleteForm1040',
    deleted: rowsToDelete.length, backupSheet: backupName,
    notFound: notFoundTs, notFoundKeys: notFoundKeys
  };
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

  // Actual sheet layout (10 cols): Entity | Name | TIN | Address on File |
  // Current Address | Bank | Acct # | Routing # | Grantor | Trustee.
  var lastRow = sheet.getLastRow();
  var nameMap = {}, existingRows = {};
  if (lastRow > 1) {
    var allData = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    for (var n = 0; n < allData.length; n++) {
      var k = String(allData[n][1] || '').toLowerCase().trim(); // col B = Name
      if (k) { nameMap[k] = n + 2; existingRows[k] = allData[n]; }
    }
  }

  var imported = 0, updated = 0;
  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    var name = (r.name || '').trim();
    if (!name) continue;
    var key = name.toLowerCase();
    var existingRow = nameMap[key];

    var vals = [
      r.entity || '', name, r.tin || '', r.addressOnFile || '', r.currentAddress || '',
      r.bank || '', r.accountNumber || '', r.routingNumber || '', r.grantor || '', r.trustee || ''
    ];

    if (existingRow) {
      var ex = existingRows[key];
      // merge: keep existing non-empty values where the new payload is blank
      for (var c = 0; c < 10; c++) {
        if (vals[c] === '' && ex[c] !== '') vals[c] = ex[c];
      }
      sheet.getRange(existingRow, 1, 1, 10).setValues([vals]);
      updated++;
    } else {
      sheet.appendRow(vals);
      nameMap[key] = sheet.getLastRow();
      imported++;
    }
  }
  return { status: 'ok', action: 'pushPrincipalRegister', imported: imported, updated: updated };
}

function deletePrincipalRegister_(ss, names) {
  var sheet = ss.getSheetByName('Principal Register');
  if (!sheet) return { status: 'error', action: 'deletePrincipalRegister', message: 'Principal Register tab not found' };

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { status: 'ok', action: 'deletePrincipalRegister', deleted: 0 };

  var target = names.map(function (n) { return String(n).toLowerCase().trim(); });
  var removed = 0;
  // iterate bottom-up so deleting a row doesn't shift the next index
  for (var r = lastRow; r >= 2; r--) {
    var name = String(sheet.getRange(r, 2).getValue() || '').toLowerCase().trim();
    if (target.indexOf(name) !== -1) {
      sheet.deleteRow(r);
      removed++;
    }
  }
  return { status: 'ok', action: 'deletePrincipalRegister', deleted: removed };
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
 * Push creditor/entity rows into the "FWM — Creditor Detail" registry.
 * Columns: A=Tab #, B=Obligor, C=Creditor/Entity, D=EIN, E=TIN Type, F=Name Type,
 *          G=Address Line 1, H=City, I=State, J=ZIP, K=Country.
 * Layout: row 1 = title banner, row 2 = column header, data starts row 3.
 * Upsert key = obligor + '|' + creditor/entity name (case-insensitive).
 * New rows append with the next Tab # in the obligor's prefix series (C-### / S-###).
 */
function pushCreditorDetail_(ss, rows) {
  var sheet = ss.getSheetByName('FWM — Creditor Detail');
  if (!sheet) return { status: 'error', action: 'pushCreditorDetail', message: 'FWM — Creditor Detail tab not found' };

  var lastRow = sheet.getLastRow();
  var headerRow = 2; // row 1 is the title banner; row 2 is the column header

  var keyMap = {}, nextNum = { 'C': 0, 'S': 0 };
  if (lastRow >= headerRow + 1) {
    var n = lastRow - headerRow;
    var tabCol = sheet.getRange(headerRow + 1, 1, n, 1).getValues(); // A
    var obCol  = sheet.getRange(headerRow + 1, 2, n, 1).getValues(); // B
    var crCol  = sheet.getRange(headerRow + 1, 3, n, 1).getValues(); // C
    for (var i = 0; i < n; i++) {
      var tabVal = String(tabCol[i][0] || '').trim();
      var obligor = String(obCol[i][0] || '').trim();
      var creditor = String(crCol[i][0] || '').trim();
      if (obligor && creditor) {
        keyMap[(obligor + '|' + creditor).toLowerCase()] = headerRow + 1 + i;
      }
      var m = tabVal.match(/^([CS])-(\d+)$/);
      if (m) {
        var prefix = m[1], num = parseInt(m[2], 10);
        if (num > (nextNum[prefix] || 0)) nextNum[prefix] = num;
      }
    }
  }

  var imported = 0, updated = 0, skipped = 0;
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var obligor = (row.obligor || '').trim();
    var creditor = (row.creditor || '').trim();
    if (!obligor || !creditor) { skipped++; continue; }

    var prefix = obligor.toLowerCase().indexOf('syrina') >= 0 ? 'S' : 'C';
    var key = (obligor + '|' + creditor).toLowerCase();

    var values = [
      '', // Tab # (filled below)
      obligor,
      creditor,
      row.ein || '',
      row.tinType || 'EIN',
      row.nameType || 'B',
      row.addr || '',
      row.city || '',
      row.state || '',
      row.zip || '',
      row.country || 'US'
    ];

    if (keyMap[key]) {
      values[0] = String(sheet.getRange(keyMap[key], 1).getValue() || '').trim();
      sheet.getRange(keyMap[key], 1, 1, 11).setValues([values]);
      updated++;
    } else {
      nextNum[prefix] = (nextNum[prefix] || 0) + 1;
      values[0] = prefix + '-' + String(nextNum[prefix]).padStart(3, '0');
      sheet.appendRow(values);
      keyMap[key] = sheet.getLastRow();
      imported++;
    }
  }

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'pushCreditorDetail', imported: imported, updated: updated, skipped: skipped };
}


/**
 * Push "Vault Location Path" (col I) updates to the "Document Inventory" tab.
 * Upserts by Doc ID (col A). Used to clear stale Mac paths after a FileCabinet
 * re-scan. Non-destructive: only col I is written; every other column untouched.
 * @param {Array<Object>} rows - [{docId, vaultLocationPath}]
 */
function pushDocumentInventory_(ss, rows) {
  var sheet = ss.getSheetByName('Document Inventory');
  if (!sheet) return { status: 'error', action: 'pushDocumentInventory', message: 'Document Inventory tab not found' };

  var lastRow = sheet.getLastRow();
  var headerRow = 2; // row 1 = title banner, row 2 = column header

  var idMap = {};
  if (lastRow >= headerRow + 1) {
    var n = lastRow - headerRow;
    var idCol = sheet.getRange(headerRow + 1, 1, n, 1).getValues();
    for (var i = 0; i < n; i++) {
      var id = String(idCol[i][0] || '').trim();
      if (id) idMap[id.toLowerCase()] = headerRow + 1 + i;
    }
  }

  var updated = 0, notFound = 0, skipped = 0;
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var docId = String(row.docId || '').trim();
    if (!docId) { skipped++; continue; }
    if (row.vaultLocationPath === undefined || row.vaultLocationPath === null) { skipped++; continue; }

    var target = idMap[docId.toLowerCase()];
    if (!target) { notFound++; continue; }

    sheet.getRange(target, 9).setValue(String(row.vaultLocationPath)); // col I = Vault Location Path
    updated++;
  }

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'pushDocumentInventory', updated: updated, notFound: notFound, skipped: skipped };
}


/**
 * Update existing Master Register rows by Row ID (col A). Unlike pushEntities_
 * (which is append-only and skips existing providers), this UPDATES specific
 * fields on rows that already exist.
 * @param {Array<Object>} rows - [{rowId, primaryUser?, authorizedUsers?, status?, notes?}]
 */
function updateMasterRegister_(ss, rows) {
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return { status: 'error', action: 'updateMasterRegister', message: 'Master Register tab not found' };

  var lastRow = sheet.getLastRow();
  // Clear stale data-validation on O/P so renamed enum values (e.g. Clint -> Clinton)
  // can write even though the frozen _Validation list still holds the old value.
  sheet.getRange(2, 6, Math.max(lastRow - 1, 1), 2).setDataValidation(null);  // F-G = Account Type/Subtype
  sheet.getRange(2, 13, Math.max(lastRow - 1, 1), 2).setDataValidation(null); // M-N = Billing Frequency / Next Payment Due
  sheet.getRange(2, 15, Math.max(lastRow - 1, 1), 1).setDataValidation(null); // O = Primary User
  sheet.getRange(2, 16, Math.max(lastRow - 1, 1), 1).setDataValidation(null); // P = Authorized Users
  sheet.getRange(2, 20, Math.max(lastRow - 1, 1), 1).setDataValidation(null); // T = Statements Complete
  var idMap = {}; // Row ID -> sheet row number
  if (lastRow > 1) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      var id = String(ids[i][0] || '').trim();
      if (id) idMap[id] = i + 2;
    }
  }

  var updated = 0, notFound = 0, skipped = 0;
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var rowId = String(row.rowId || '').trim();
    if (!rowId) { skipped++; continue; }
    var target = idMap[rowId];
    if (!target) { notFound++; continue; }

    if (row.provider !== undefined)        sheet.getRange(target, 3).setValue(String(row.provider));         // C
    if (row.ein !== undefined)             sheet.getRange(target, 4).setValue(String(row.ein));              // D
    if (row.accountNumber !== undefined)   sheet.getRange(target, 5).setValue(String(row.accountNumber));    // E
    if (row.accountType !== undefined)     sheet.getRange(target, 6).setValue(String(row.accountType));     // F
    if (row.accountSubtype !== undefined)  sheet.getRange(target, 7).setValue(String(row.accountSubtype));  // G
    if (row.billingFrequency !== undefined) sheet.getRange(target, 13).setValue(String(row.billingFrequency)); // M
    if (row.nextPaymentDue !== undefined)  sheet.getRange(target, 14).setValue(String(row.nextPaymentDue));   // N
    if (row.statementsComplete !== undefined) sheet.getRange(target, 20).setValue(String(row.statementsComplete)); // T
    if (row.currentBalance !== undefined)  sheet.getRange(target, 11).setValue(row.currentBalance === '' ? '' : Number(row.currentBalance)); // K
    if (row.originalBalance !== undefined) sheet.getRange(target, 12).setValue(row.originalBalance === '' ? '' : Number(row.originalBalance)); // L
    if (row.primaryUser !== undefined)     sheet.getRange(target, 15).setValue(String(row.primaryUser)); // O
    if (row.authorizedUsers !== undefined) sheet.getRange(target, 16).setValue(String(row.authorizedUsers)); // P
    if (row.status !== undefined)          sheet.getRange(target, 8).setValue(String(row.status));          // H
    if (row.notes !== undefined)           sheet.getRange(target, 27).setValue(String(row.notes));          // AA
    updated++;
  }

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'updateMasterRegister', updated: updated, notFound: notFound, skipped: skipped };
}


function deleteMasterRegister_(ss, rowIds) {
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return { status: 'error', action: 'deleteMasterRegister', message: 'Master Register tab not found' };

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: 'ok', action: 'deleteMasterRegister', deleted: 0, notFound: rowIds };

  var idSet = {};
  for (var i = 0; i < rowIds.length; i++) idSet[String(rowIds[i]).trim().toUpperCase()] = true;

  var data = sheet.getRange(2, 1, lastRow - 1, 29).getValues();
  var matched = {};
  var deletedRows = [];
  var rowsToDelete = [];

  for (var r = 0; r < data.length; r++) {
    var id = String(data[r][0] || '').trim().toUpperCase();
    if (id && idSet[id]) {
      matched[id] = true;
      deletedRows.push(data[r]);
      rowsToDelete.push(r + 2); // header row + 1-based index
    }
  }

  if (rowsToDelete.length === 0) {
    return { status: 'ok', action: 'deleteMasterRegister', deleted: 0, notFound: rowIds };
  }

  // Backup the full 29-column rows being removed, then delete bottom-up.
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Chicago', 'yyyyMMdd_HHmmss');
  var backupName = 'MR_PreDelete_' + stamp;
  var backupSheet = ss.insertSheet(backupName);
  var headers = sheet.getRange(1, 1, 1, 29).getValues()[0];
  backupSheet.getRange(1, 1, 1, 29).setValues([headers]).setFontWeight('bold');
  backupSheet.getRange(2, 1, deletedRows.length, 29).setValues(deletedRows);
  backupSheet.setTabColor('#ef4444');

  rowsToDelete.sort(function(a, b) { return b - a; });
  for (var d = 0; d < rowsToDelete.length; d++) sheet.deleteRow(rowsToDelete[d]);

  var notFound = [];
  for (var k in idSet) if (!matched[k]) notFound.push(k);

  return { status: 'ok', action: 'deleteMasterRegister', deleted: rowsToDelete.length, backupSheet: backupName, notFound: notFound };
}


/**
 * One-time data-quality cleanup for the "Acct Ledger" tab (2026-10-16).
 * (1) Collapses a 35-row duplicate block (rows copied verbatim twice) by full-16-column
 *     fingerprint; (2) deletes the "Credit One Bank N.A." shell row (name present but
 *     opened/closed dates empty) in favour of the complete copy; (3) re-points the 7 Nelnet
 *     rows' "Acct #" from Launch Servicing's E985506201 to their real per-loan account numbers
 *     (90000075961-L1..L7) keyed by opened year — L1=2011 (unique); 2015→L2/L3; 2018→L4/L5;
 *     2012→L6/L7 (assigned in row order within each same-year pair).
 * Backs up the entire tab to `AcctLedger_PreDedupe_<stamp>` before any mutation.
 * @param {Object} ss - active spreadsheet
 */
function dedupeAcctLedger_(ss) {
  var sheet = ss.getSheetByName('Acct Ledger');
  if (!sheet) return { status: 'error', action: 'dedupeAcctLedger', message: 'Acct Ledger tab not found' };

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || 16;
  if (lastRow <= 1) return { status: 'ok', action: 'dedupeAcctLedger', deleted: 0, fixedNelnet: 0, backupSheet: null };

  // 1. Backup the whole tab (red, reversible).
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Chicago', 'yyyyMMdd_HHmmss');
  var backup = ss.insertSheet('AcctLedger_PreDedupe_' + stamp);
  backup.getRange(1, 1, lastRow, lastCol).setValues(sheet.getRange(1, 1, lastRow, lastCol).getValues());
  backup.setTabColor('#ef4444');

  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues(); // data[r] = sheet row r+2

  function yearOf(v) {
    if (v instanceof Date) return v.getFullYear();
    var m = String(v || '').match(/(19|20)\d{2}/);
    return m ? parseInt(m[0], 10) : null;
  }
  function isEmpty(v) { return String(v || '').trim() === ''; }

  // 2. Re-point Nelnet "Acct #" (col C) by opened year (before dedup so the 7 loans stay distinct).
  var nelnetFixed = 0;
  var yearCount = {};
  for (var r = 0; r < data.length; r++) {
    var nm = String(data[r][0] || '').toLowerCase();
    if (nm.indexOf('nelnet') === -1) continue;
    var yr = yearOf(data[r][6]); // col G = Opened Date
    if (!yr) continue;
    yearCount[yr] = (yearCount[yr] || 0) + 1;
    var n = yearCount[yr];
    var newAcct = '';
    if (yr === 2011) newAcct = '90000075961-L1';
    else if (yr === 2015) newAcct = '90000075961-L' + (n === 1 ? '2' : '3');
    else if (yr === 2018) newAcct = '90000075961-L' + (n === 1 ? '4' : '5');
    else if (yr === 2012) newAcct = '90000075961-L' + (n === 1 ? '6' : '7');
    if (newAcct) { sheet.getRange(r + 2, 3).setValue(newAcct); nelnetFixed++; }
  }

  // 3. Identify rows to delete: full-fingerprint duplicates + the Credit One shell.
  var fpSeen = {};
  var rowsToDelete = [];
  for (var r2 = 0; r2 < data.length; r2++) {
    var hasContent = data[r2].some(function (c) { return String(c).trim() !== ''; });
    if (!hasContent) continue;
    var fp = data[r2].map(function (c) { return String(c).trim(); }).join('||');
    var rowNum = r2 + 2;
    if (fpSeen[fp] !== undefined) {
      rowsToDelete.push(rowNum); // true duplicate of an earlier row
    } else {
      fpSeen[fp] = rowNum;
      var nm2 = String(data[r2][0] || '').toLowerCase();
      if (nm2.indexOf('credit one') !== -1 && isEmpty(data[r2][6]) && isEmpty(data[r2][7])) {
        rowsToDelete.push(rowNum); // Credit One shell (opened+closed empty)
      }
    }
  }

  // 4. Delete bottom-up.
  rowsToDelete.sort(function (a, b) { return b - a; });
  for (var d = 0; d < rowsToDelete.length; d++) sheet.deleteRow(rowsToDelete[d]);

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'dedupeAcctLedger', deleted: rowsToDelete.length, fixedNelnet: nelnetFixed, backupSheet: backup.getName() };
}


/**
 * Second-pass Acct Ledger cleanup (2026-10-16), after dedupeAcctLedger_.
 * (a) Blanks the literal "N/A" account numbers on non-debt entities (employers/nonprofits
 *     that have no account number — the placeholder broke the entity dedup key).
 * (b) LVNV Funding LLC carries TWO accounts per FWM — Master Index (S-011 "Credit One Acct"
 *     444796276090, S-012 "Verve Acct" 516648722480). The ledger only had the Verve account.
 *     Relabel the existing row to "(Verve Acct)" and insert a cloned "(Credit One Acct)" row
 *     right below it (same EIN/address, new account #, opened date, and "Collected" status).
 * Backs up the whole tab to `AcctLedger_PreFinalize_<stamp>` first.
 * @param {Object} ss - active spreadsheet
 */
function finalizeAcctLedger_(ss) {
  var sheet = ss.getSheetByName('Acct Ledger');
  if (!sheet) return { status: 'error', action: 'finalizeAcctLedger', message: 'Acct Ledger tab not found' };

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || 16;
  if (lastRow <= 1) return { status: 'ok', action: 'finalizeAcctLedger', blankedNA: 0, relabeled: 0, addedCreditOne: false, backupSheet: null };

  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Chicago', 'yyyyMMdd_HHmmss');
  var backup = ss.insertSheet('AcctLedger_PreFinalize_' + stamp);
  backup.getRange(1, 1, lastRow, lastCol).setValues(sheet.getRange(1, 1, lastRow, lastCol).getValues());
  backup.setTabColor('#ef4444');

  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  // (a) Blank "N/A" account numbers (col C, index 2).
  var blankedNA = 0;
  for (var r = 0; r < data.length; r++) {
    var acct = String(data[r][2] || '').trim().toLowerCase();
    if (acct === 'n/a' || acct === 'na') { sheet.getRange(r + 2, 3).setValue(''); blankedNA++; }
  }

  // (b) LVNV: relabel Verve row, clone it into a Credit One row directly beneath.
  var relabeled = 0;
  var addedCreditOne = false;
  for (var r2 = 0; r2 < data.length; r2++) {
    var nm = String(data[r2][0] || '').trim().toLowerCase();
    var ac = String(data[r2][2] || '').trim();
    if (nm.indexOf('lvnv') !== -1 && ac === '516648722480') {
      sheet.getRange(r2 + 2, 1).setValue('LVNV Funding LLC (Verve Acct)');
      relabeled++;
      var clone = data[r2].slice();
      clone[0] = 'LVNV Funding LLC (Credit One Acct)';
      clone[2] = '444796276090';
      clone[5] = 'Collected';   // Status
      clone[6] = '08/21/2025';  // Opened Date (Date Acquired per FWM)
      clone[7] = '—';           // Closed Date
      sheet.insertRowAfter(r2 + 2);
      sheet.getRange(r2 + 3, 1, 1, lastCol).setValues([clone]);
      addedCreditOne = true;
      break;
    }
  }

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'finalizeAcctLedger', blankedNA: blankedNA, relabeled: relabeled, addedCreditOne: addedCreditOne, backupSheet: backup.getName() };
}


/**
 * Fold-completion mutations (2026-10-16), post data-migration into Master Register.
 * (1) Duke Energy Progress LLC wrongly carried Kinston Utilities' account number 63328-1972;
 *     its correct account identifier is its EIN, 202777218. Re-point the "Acct #" (col C) on
 *     the Acct Ledger Duke row (and, if present, Master Register "Audit Account #").
 * (2) Delete the now-redundant "FWM — Master Index" sheet (data already migrated to Master
 *     Register; full backup preserved as FWM_MasterIndex_PreHeader_20261016_000008).
 * @param {Object} ss - active spreadsheet
 */
function foldFinalize_(ss) {
  var result = { dukeFixedAcctLedger: 0, dukeFixedMasterRegister: 0, fwmDeleted: false, fwmBackup: 'FWM_MasterIndex_PreHeader_20261016_000008' };

  // (1) Duke fix — Acct Ledger (col C = Acct #).
  var al = ss.getSheetByName('Acct Ledger');
  if (al) {
    var lastRow = al.getLastRow();
    var lastCol = al.getLastColumn() || 16;
    var data = al.getRange(2, 1, lastRow - 1, lastCol).getValues();
    for (var r = 0; r < data.length; r++) {
      var nm = String(data[r][0] || '').toLowerCase();
      if (nm.indexOf('duke') !== -1 && nm.indexOf('energy') !== -1) {
        al.getRange(r + 2, 3).setValue('202777218');
        result.dukeFixedAcctLedger++;
      }
    }
  }

  // (1b) Duke fix — Master Register (locate header, then "Audit Account #" on the Duke row).
  var mr = ss.getSheetByName('Master Register');
  if (mr) {
    var mrLast = mr.getLastRow();
    var mrLastCol = mr.getLastColumn() || 13;
    var mrAll = mr.getRange(1, 1, mrLast, mrLastCol).getValues();
    // locate real header row (most non-empty cells)
    var hi = 0, hn = 0;
    for (var i = 0; i < mrAll.length; i++) {
      var n = 0;
      for (var c = 0; c < mrAll[i].length; c++) if (String(mrAll[i][c]).trim() !== '') n++;
      if (n > hn) { hn = n; hi = i; }
    }
    var hdr = mrAll[hi];
    var credIdx = -1, acctIdx = -1;
    for (var j = 0; j < hdr.length; j++) {
      var hj = String(hdr[j]).toLowerCase();
      if (credIdx === -1 && (hj.indexOf('creditor') !== -1 || hj.indexOf('entity') !== -1)) credIdx = j;
      if (acctIdx === -1 && hj.indexOf('audit account') !== -1) acctIdx = j;
    }
    if (credIdx !== -1 && acctIdx !== -1) {
      for (var r2 = hi + 1; r2 < mrAll.length; r2++) {
        var cn = String(mrAll[r2][credIdx] || '').toLowerCase();
        if (cn.indexOf('duke') !== -1 && cn.indexOf('energy') !== -1) {
          mr.getRange(r2 + 1, acctIdx + 1).setValue('202777218');
          result.dukeFixedMasterRegister++;
        }
      }
    }
  }

  // (2) Delete FWM — Master Index.
  var fwm = ss.getSheetByName('FWM — Master Index');
  if (fwm) { ss.deleteSheet(fwm); result.fwmDeleted = true; }

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'foldFinalize', dukeFixedAcctLedger: result.dukeFixedAcctLedger, dukeFixedMasterRegister: result.dukeFixedMasterRegister, fwmDeleted: result.fwmDeleted, fwmBackup: result.fwmBackup };
}


/**
 * Step 1 of the Master Register remap (2026-10-16).
 * (a) Fix the three mislabeled header columns: "Discription"→"Description",
 *     "Ledger Ref"→"Current Balance" (it holds balances), "Supporting Doc ID"→"High Balance".
 * (b) Delete the Merrick Bank shell row (empty EIN + empty account) in favour of the full row.
 * Backs up the whole tab to `MasterRegister_PreRemap_<stamp>` first. Read-only beyond these two.
 * @param {Object} ss - active spreadsheet
 */
function remapMasterRegister_(ss) {
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return { status: 'error', action: 'remapMasterRegister', message: 'Master Register tab not found' };

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || 13;
  if (lastRow <= 1) return { status: 'ok', action: 'remapMasterRegister', renamed: 0, deleted: 0, backupSheet: null };

  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Chicago', 'yyyyMMdd_HHmmss');
  var backup = ss.insertSheet('MasterRegister_PreRemap_' + stamp);
  backup.getRange(1, 1, lastRow, lastCol).setValues(sheet.getRange(1, 1, lastRow, lastCol).getValues());
  backup.setTabColor('#ef4444');

  var all = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var hi = 0, hn = 0;
  for (var i = 0; i < all.length; i++) {
    var n = 0;
    for (var c = 0; c < all[i].length; c++) if (String(all[i][c]).trim() !== '') n++;
    if (n > hn) { hn = n; hi = i; }
  }
  var hdrRow = hi + 1;

  var renames = { 'Discription': 'Description', 'Ledger Ref': 'Current Balance', 'Supporting Doc ID': 'High Balance' };
  var renamed = 0;
  var colIdx = { cred: -1, ein: -1, acct: -1 };
  for (var c = 0; c < all[hi].length; c++) {
    var h = String(all[hi][c]).trim();
    var hl = h.toLowerCase();
    if (colIdx.cred === -1 && (hl.indexOf('creditor') !== -1 || hl.indexOf('entity') !== -1)) colIdx.cred = c;
    if (colIdx.ein === -1 && hl === 'ein') colIdx.ein = c;
    if (colIdx.acct === -1 && hl.indexOf('audit account') !== -1) colIdx.acct = c;
    if (renames[h]) { sheet.getRange(hdrRow, c + 1).setValue(renames[h]); renamed++; }
  }

  var rowsToDelete = [];
  if (colIdx.cred !== -1 && colIdx.ein !== -1 && colIdx.acct !== -1) {
    for (var r = hi + 1; r < all.length; r++) {
      var nm = String(all[r][colIdx.cred] || '').toLowerCase();
      var ein = String(all[r][colIdx.ein] || '').trim();
      var acct = String(all[r][colIdx.acct] || '').trim();
      if (nm.indexOf('merrick') !== -1 && ein === '' && acct === '') rowsToDelete.push(r + 1);
    }
  }
  rowsToDelete.sort(function (a, b) { return b - a; });
  for (var d = 0; d < rowsToDelete.length; d++) sheet.deleteRow(rowsToDelete[d]);

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'remapMasterRegister', renamed: renamed, deleted: rowsToDelete.length, backupSheet: backup.getName() };
}


/**
 * Data-driven Master Register backfill + duplicate merge (2026-10-16).
 * Consumes a spec object (POST payload.spec): { backfill:[{no, ein}], merges:[{keep, remove:[...]}] }.
 * (a) Backfill EIN by Entry No. (col A "MR-nnn" stable key).
 * (b) Merge duplicates: gap-fill the keep row from each remove row (only empty cells), then
 *     delete the remove rows bottom-up.
 * Backs up the whole tab to `MasterRegister_PreBackfill_<stamp>` first.
 * @param {Object} ss - active spreadsheet
 * @param {Object} spec - { backfill:[{no,ein}], merges:[{keep,remove:[...]}] }
 */
function applyMasterRegisterSpec_(ss, spec) {
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return { status: 'error', action: 'applyMasterRegisterSpec', message: 'Master Register tab not found' };

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || 13;
  if (lastRow <= 1) return { status: 'ok', action: 'applyMasterRegisterSpec', filled: 0, merged: 0, deleted: 0, backupSheet: null };

  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Chicago', 'yyyyMMdd_HHmmss');
  var backup = ss.insertSheet('MasterRegister_PreBackfill_' + stamp);
  backup.getRange(1, 1, lastRow, lastCol).setValues(sheet.getRange(1, 1, lastRow, lastCol).getValues());
  backup.setTabColor('#ef4444');

  var all = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var hi = 0, hn = 0;
  for (var i = 0; i < all.length; i++) {
    var n = 0;
    for (var c = 0; c < all[i].length; c++) if (String(all[i][c]).trim() !== '') n++;
    if (n > hn) { hn = n; hi = i; }
  }
  var hdrRow = hi + 1;
  var hdr = all[hi];
  var cNo = -1, cEin = -1;
  for (var c = 0; c < hdr.length; c++) {
    var hl = String(hdr[c]).trim().toLowerCase();
    if (cNo === -1 && hl === 'entry no.') cNo = c;
    if (cEin === -1 && hl === 'ein') cEin = c;
  }
  if (cNo === -1 || cEin === -1) return { status: 'error', action: 'applyMasterRegisterSpec', message: 'Entry No./EIN column not found' };

  var noToRow = {};
  for (var r = hdrRow + 1; r <= lastRow; r++) {
    var no = String(sheet.getRange(r, cNo + 1).getValue()).trim();
    if (no) noToRow[no] = r;
  }

  var filled = 0;
  (spec.backfill || []).forEach(function (b) {
    var row = noToRow[b.no];
    if (row) { sheet.getRange(row, cEin + 1).setValue(b.ein); filled++; }
  });

  var merged = 0, toDelete = [];
  (spec.merges || []).forEach(function (m) {
    var keepRow = noToRow[m.keep];
    if (!keepRow) return;
    (m.remove || []).forEach(function (remNo) {
      var remRow = noToRow[remNo];
      if (!remRow) return;
      for (var c = 1; c <= lastCol; c++) {
        var kv = sheet.getRange(keepRow, c).getValue();
        var rv = sheet.getRange(remRow, c).getValue();
        if ((kv === '' || kv === null) && (rv !== '' && rv !== null)) { sheet.getRange(keepRow, c).setValue(rv); }
      }
      toDelete.push(remRow); merged++;
    });
  });
  toDelete.sort(function (a, b) { return b - a; });
  var deleted = 0;
  toDelete.forEach(function (r) { sheet.deleteRow(r); deleted++; });

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'applyMasterRegisterSpec', filled: filled, merged: merged, deleted: deleted, backupSheet: backup.getName() };
}


/**
 * Fast targeted duplicate merge (2026-10-16) — replaces the slow cell-by-cell gap-fill loop.
 * Spec: { gapfills:[{no, col, value}], deletes:[entryNos] } where `col` is 1-indexed.
 * Applies only the specific gap-fill cells, then deletes the remove rows bottom-up.
 * (No backup — the PreBackfill backup already captured the pre-merge state.)
 * @param {Object} ss - active spreadsheet
 * @param {Object} spec - { gapfills:[{no,col,value}], deletes:[entryNos] }
 */
function mergeMasterRegisterFast_(ss, spec) {
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return { status: 'error', action: 'mergeMasterRegisterFast', message: 'Master Register tab not found' };

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || 13;
  var all = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var hi = 0, hn = 0;
  for (var i = 0; i < all.length; i++) {
    var n = 0;
    for (var c = 0; c < all[i].length; c++) if (String(all[i][c]).trim() !== '') n++;
    if (n > hn) { hn = n; hi = i; }
  }
  var hdr = all[hi];
  var cNo = -1;
  for (var c = 0; c < hdr.length; c++) {
    if (cNo === -1 && String(hdr[c]).trim().toLowerCase() === 'entry no.') cNo = c;
  }
  if (cNo === -1) return { status: 'error', action: 'mergeMasterRegisterFast', message: 'Entry No. column not found' };

  var noToRow = {};
  for (var r = hi + 2; r <= lastRow; r++) {
    var no = String(all[r - 1][cNo]).trim();
    if (no) noToRow[no] = r;
  }

  var gapfilled = 0;
  (spec.gapfills || []).forEach(function (g) {
    var row = noToRow[g.no];
    if (row) { sheet.getRange(row, g.col).setValue(g.value); gapfilled++; }
  });

  var rows = (spec.deletes || []).map(function (n) { return noToRow[n]; }).filter(function (x) { return x; });
  rows.sort(function (a, b) { return b - a; });
  var deleted = 0;
  rows.forEach(function (r) { sheet.deleteRow(r); deleted++; });

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'mergeMasterRegisterFast', gapfilled: gapfilled, deleted: deleted };
}


/**
 * Clear the MISAPPLIED Status dropdown validation on the "Current Balance" (col K)
 * and "High Balance" (col L) columns so numeric balances can be written.
 * (The Status dropdown legitimately belongs only on col H "Status".)
 * @param {Object} ss - active spreadsheet
 */
function clearBalanceValidation_(ss) {
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return { status: 'error', action: 'clearBalanceValidation', message: 'Master Register tab not found' };

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || 13;
  var all = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var hi = 0, hn = 0;
  for (var i = 0; i < all.length; i++) {
    var n = 0;
    for (var c = 0; c < all[i].length; c++) if (String(all[i][c]).trim() !== '') n++;
    if (n > hn) { hn = n; hi = i; }
  }
  var hdr = all[hi];
  var colBal = -1, colHigh = -1;
  for (var c = 0; c < hdr.length; c++) {
    var hl = String(hdr[c]).trim().toLowerCase();
    if (colBal === -1 && hl === 'current balance') colBal = c + 1;
    if (colHigh === -1 && hl === 'high balance') colHigh = c + 1;
  }
  var cleared = [];
  if (colBal !== -1) {
    sheet.getRange(hi + 2, colBal, Math.max(1, lastRow - hi - 1), 1).setDataValidation(null);
    cleared.push('Current Balance (col ' + colBal + ')');
  }
  if (colHigh !== -1) {
    sheet.getRange(hi + 2, colHigh, Math.max(1, lastRow - hi - 1), 1).setDataValidation(null);
    cleared.push('High Balance (col ' + colHigh + ')');
  }
  SpreadsheetApp.flush();
  return { status: 'ok', action: 'clearBalanceValidation', cleared: cleared };
}


/**
 * Final reconcile: (1) fill First Bank of Delaware EIN on MR-187,
 * (2) rename MR-179 'Cline / Anysphere Inc.' -> 'Cline Bot Inc.',
 * (3) insert new row MR-192 'Anysphere Inc.' (maker of Cursor).
 * @param {Object} ss - active spreadsheet
 */
function finishRegisterSplit_(ss) {
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return { status: 'error', action: 'finishRegisterSplit', message: 'Master Register tab not found' };

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || 13;
  var all = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var hi = 0, hn = 0;
  for (var i = 0; i < all.length; i++) {
    var n = 0;
    for (var c = 0; c < all[i].length; c++) if (String(all[i][c]).trim() !== '') n++;
    if (n > hn) { hn = n; hi = i; }
  }
  var hdr = all[hi];
  function colIdx(label, fallback) {
    for (var c = 0; c < hdr.length; c++) {
      if (String(hdr[c]).trim().toLowerCase() === label) return c;
    }
    for (var d = 0; d < hdr.length; d++) {
      if (String(hdr[d]).toLowerCase().indexOf(fallback) >= 0) return d;
    }
    return -1;
  }
  var cNo = colIdx('entry no.', 'entry');
  var cDate = colIdx('date', 'date');
  var cCred = colIdx('creditor / entity', 'creditor');
  var cEin = colIdx('ein', 'ein');
  var cCat = colIdx('category', 'category');
  var cNotes = colIdx('notes', 'notes');

  var result = { status: 'ok', action: 'finishRegisterSplit', renamed: false, inserted: false, einFilled: false };

  for (var i = hi + 1; i < lastRow; i++) {
    var no = String(all[i][cNo]).trim();
    if (no === 'MR-187') {
      sheet.getRange(i + 1, cEin + 1).setValue('51-0389698');
      result.einFilled = true;
    }
    if (no === 'MR-179') {
      if (cCred >= 0) sheet.getRange(i + 1, cCred + 1).setValue('Cline Bot Inc.');
      if (cCat >= 0) sheet.getRange(i + 1, cCat + 1).setValue('Cline Bot Inc.');
      result.renamed = true;
    }
  }

  var newRow = [];
  for (var c = 0; c < lastCol; c++) newRow.push('');
  if (cNo >= 0) newRow[cNo] = 'MR-192';
  if (cDate >= 0) newRow[cDate] = '2026-10-08';
  if (cCred >= 0) newRow[cCred] = 'Anysphere Inc.';
  if (cCat >= 0) newRow[cCat] = 'Anysphere Inc.';
  if (cNotes >= 0) newRow[cNotes] = "Split from 'Cline / Anysphere Inc.' — Anysphere makes Cursor";
  sheet.appendRow(newRow);
  result.inserted = true;

  SpreadsheetApp.flush();
  return result;
}


/**
 * Backfill the TIN Registry (authoritative EIN master) with newly-confirmed EINs
 * that are now in the Master Register but not yet in the registry. Dedupes on col A (EIN).
 * @param {Object} ss - active spreadsheet
 */
function backfillTINRegistry_(ss) {
  var sheet = ss.getSheetByName('TIN Registry');
  if (!sheet) return { status: 'error', action: 'backfillTINRegistry', message: 'TIN Registry tab not found' };

  // [EIN, Account#, Name]  (address/phone left blank)
  var newEins = [
    ['25-1435979', '', 'PNC Financial Services Group'],
    ['51-0483352', '', 'Synchrony Financial'],
    ['38-0572512', '', 'Ally Financial'],
    ['80-0429876', '', 'Block Inc (Cash App)'],
    ['01-0137770', '', 'TD Bank N.A.'],
    ['43-1261525', '', 'MOHELA (MO Higher Ed Loan Auth)'],
    ['20-5276211', '', 'Early Warning Services LLC (Zelle)'],
    ['25-1222771', '', 'ECSI (Educational Computer Systems)'],
    ['51-0389698', '', 'First Bank of Delaware'],
    ['52-1198289', '', 'US Department of Education']
  ];

  var lastRow = sheet.getLastRow();
  var existing = {};
  if (lastRow > 0) {
    var colA = sheet.getRange(1, 1, lastRow, 1).getValues();
    for (var i = 0; i < colA.length; i++) {
      existing[String(colA[i][0]).trim()] = true;
    }
  }

  var added = 0, skipped = 0;
  for (var j = 0; j < newEins.length; j++) {
    var ein = newEins[j][0];
    if (existing[ein]) { skipped++; continue; }
    var row = [newEins[j][0], newEins[j][1], newEins[j][2], '', '', '', '', '', '', '', ''];
    sheet.appendRow(row);
    existing[ein] = true;
    added++;
  }

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'backfillTINRegistry', added: added, skipped: skipped };
}


/**
 * Update existing TIN Registry rows by Acct Name (col C) or EIN (col A).
 * Surgical EIN/name correction (e.g. Destiny re-point from First Bank of
 * Delaware to First Electronic Bank). Writes EIN (col A) + name (col C) only;
 * address/phone untouched.
 * @param {Array<Object>} rows - [{name?, ein?, newEin?, newName?}]
 */
function updateTINRegistry_(ss, rows) {
  var sheet = ss.getSheetByName('TIN Registry');
  if (!sheet) return { status: 'error', action: 'updateTINRegistry', message: 'TIN Registry tab not found' };

  var lastRow = sheet.getLastRow();
  var nameMap = {}, einMap = {};
  if (lastRow > 0) {
    var colA = sheet.getRange(1, 1, lastRow, 1).getValues();
    var colC = sheet.getRange(1, 3, lastRow, 1).getValues();
    for (var i = 0; i < lastRow; i++) {
      var ein = String(colA[i][0] || '').trim();
      var nm = String(colC[i][0] || '').trim();
      if (nm) nameMap[nm.toLowerCase()] = i + 1;
      if (ein) einMap[ein] = i + 1;
    }
  }

  var updated = 0, notFound = 0, skipped = 0;
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var target = null;
    if (row.name) target = nameMap[String(row.name).trim().toLowerCase()];
    else if (row.ein) target = einMap[String(row.ein).trim()];
    if (!target) { notFound++; continue; }

    if (row.newEin !== undefined)   sheet.getRange(target, 1).setValue(String(row.newEin));   // A = TIN/EIN
    if (row.newName !== undefined)  sheet.getRange(target, 3).setValue(String(row.newName));  // C = Acct Name / Type
    updated++;
  }

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'updateTINRegistry', updated: updated, notFound: notFound, skipped: skipped };
}


/**
 * Embed a website URL into each Master Register "Provider/Creditor" name (col C)
 * as a =HYPERLINK(url, name) formula. Only data rows (col A matches /^MR-/ with a
 * non-empty name) are touched; the footer/banner rows and any unmapped name are
 * left as plain text. getValues() on a =HYPERLINK cell still returns the label
 * (the name), so programmatic reads and the provider-name upsert key are preserved.
 * @param {Object} ss - active spreadsheet
 * @param {Array<Object>} mappings - [{name: 'Bank of America N.A.', url: 'https://…'}]
 */
function hyperlinkProviderColumn_(ss, mappings) {
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return { status: 'error', action: 'hyperlinkProviderColumn', message: 'Master Register tab not found' };

  var urlBy = {};
  for (var i = 0; i < mappings.length; i++) {
    var m = mappings[i];
    if (m && m.name && m.url) urlBy[String(m.name).trim()] = String(m.url).trim();
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: 'ok', action: 'hyperlinkProviderColumn', linked: 0, unmatched: [] };

  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var names = sheet.getRange(2, 3, lastRow - 1, 1).getValues();

  var linked = 0;
  var unmatched = [];
  for (var r = 0; r < ids.length; r++) {
    var id = String(ids[r][0] || '').trim();
    if (!/^MR-/.test(id)) continue;
    var name = String(names[r][0] || '').trim();
    if (!name) continue;
    var url = urlBy[name];
    if (url) {
      var formula = '=HYPERLINK("' + url + '","' + name.replace(/"/g, '""') + '")';
      sheet.getRange(r + 2, 3).setFormula(formula);
      linked++;
    } else {
      unmatched.push(id + ': ' + name);
    }
  }

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'hyperlinkProviderColumn', linked: linked, unmatchedCount: unmatched.length, unmatched: unmatched };
}


/**
 * Replace the entire "AppScripts" tab with a fresh function inventory.
 * New 6-column layout: Function (file → name) | What it does | Status | Start Time | Duration (s) | Error.
 * The file path is embedded into the Function name; the three runtime columns are
 * left empty here (foldScriptExecutions_ populates them from the execution log).
 * @param {Array<Object>} rows - [{name, file, description, status}]
 */
function pushAppScriptsInventory_(ss, rows) {
  var sheet = ss.getSheetByName('AppScripts');
  if (!sheet) return { status: 'error', action: 'pushAppScriptsInventory', message: 'AppScripts tab not found' };

  var lastRow = sheet.getLastRow();
  try { sheet.getRange(1, 1, Math.max(lastRow, 2), 8).breakApart(); } catch (e) {}
  try { sheet.getRange(1, 1, Math.max(lastRow, 2), 8).clearDataValidations(); } catch (e) {}
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, Math.max(sheet.getLastColumn(), 8)).clearContent();
  }
  sheet.getRange(1, 1, 1, 6).setValues([['Function', 'What it does', 'Status', 'Start Time', 'Duration (s)', 'Error']]);

  var out = rows.map(function (r) {
    var fn = (r.file ? String(r.file) + ' → ' : '') + (r.name || '');
    return [fn, r.description || '', r.status || '', '', '', ''];
  });
  if (out.length) sheet.getRange(2, 1, out.length, 6).setValues(out);

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'pushAppScriptsInventory', updated: out.length };
}


/**
 * Write execution-history rows (pulled by an external client via the Apps Script
 * API) into the "Script Executions" tab. rows = [{ function, status, startTime,
 * duration, error }, ...].
 */
function pushScriptExecutions_(ss, rows) {
  var sheet = ss.getSheetByName('Script Executions');
  if (!sheet) sheet = ss.insertSheet('Script Executions');

  var lastRow = sheet.getLastRow();
  try { sheet.getRange(1, 1, Math.max(lastRow, 2), 5).breakApart(); } catch (e) {}
  try { sheet.getRange(1, 1, Math.max(lastRow, 2), 5).clearDataValidations(); } catch (e) {}
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, Math.max(sheet.getLastColumn(), 5)).clearContent();
  }
  sheet.getRange(1, 1, 1, 5).setValues([['Function', 'Status', 'Start Time', 'Duration (s)', 'Error']]);

  var out = rows.map(function (r) {
    return [r.function || '', r.status || '', r.startTime || '', r.duration || '', r.error || ''];
  });
  if (out.length) sheet.getRange(2, 1, out.length, 5).setValues(out);

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'pushScriptExecutions', updated: out.length };
}


/**
 * Append one row to the "Script Executions" tab. Zero-OAuth: this runs inside the
 * script and writes to its own sheet, so no external API scopes are required.
 * Capped at 500 rows so it can't grow unbounded. Never throws.
 */
function logExecution_(action, status, durationMs, errorMsg) {
  try {
    var ss = getTMARSpreadsheet_();
    var sheet = ss.getSheetByName('Script Executions');
    if (!sheet) {
      sheet = ss.insertSheet('Script Executions');
      sheet.getRange(1, 1, 1, 5).setValues([['Function', 'Status', 'Start Time', 'Duration (s)', 'Error']]);
    }
    sheet.appendRow([
      action || '',
      status || '',
      new Date().toISOString(),
      durationMs != null ? (durationMs / 1000).toFixed(3) : '',
      errorMsg || ''
    ]);
    var lastRow = sheet.getLastRow();
    if (lastRow > 501) sheet.deleteRows(2, lastRow - 500);
    SpreadsheetApp.flush();
  } catch (e) {
    // logging must never break the request
  }
}


/**
 * Pull this script's recent execution history via the Apps Script API
 * (processes:listScriptProcesses) and write it to the "Script Executions" tab.
 * Requires the https://www.googleapis.com/auth/script.processes scope to be
 * authorized for the deploying user (one-time consent after adding the scope).
 */
function refreshScriptExecutions() {
  var token = ScriptApp.getOAuthToken();
  if (!token) {
    return jsonResponse_({ status: 'error', action: 'refreshScriptExecutions',
      message: 'No OAuth token — scopes not authorized yet (run once from the editor to consent).' });
  }

  var scriptId = '1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr';
  var url = 'https://script.googleapis.com/v1/processes:listScriptProcesses?scriptId='
    + encodeURIComponent(scriptId) + '&pageSize=100';
  var resp = UrlFetchApp.fetch(url, { headers: { 'Authorization': 'Bearer ' + token }, muteHttpExceptions: true });
  var code = resp.getResponseCode();
  if (code !== 200) {
    return jsonResponse_({ status: 'error', action: 'refreshScriptExecutions', httpCode: code,
      message: resp.getContentText().slice(0, 500) });
  }

  var data = JSON.parse(resp.getContentText());
  var procs = (data.processes || []).map(function (p) {
    return {
      functionName: p.functionName || '',
      status: (p.status || '').replace('PROCESS_STATUS_', ''),
      startTime: p.startTime || '',
      durationSec: p.duration ? String(p.duration).replace('s', '') : ''
    };
  });

  // Best-effort: pull ERROR-severity entries from Cloud Logging and attach the
  // message to the matching failed function. Returns {} on any failure (the
  // status column still stands alone).
  var errByFn = pullErrorLogs_(token);

  var ss = getTMARSpreadsheet_();
  var sheet = ss.getSheetByName('Script Executions');
  if (!sheet) sheet = ss.insertSheet('Script Executions');
  var hdr = ['Function', 'Status', 'Start Time', 'Duration (s)', 'Error'];
  sheet.getRange(1, 1, 1, 5).setValues([hdr]);
  var lr = sheet.getLastRow();
  if (lr > 1) sheet.getRange(2, 1, lr - 1, 5).clearContent();
  if (procs.length) {
    var out = procs.map(function (p) {
      var err = (p.status === 'FAILED' || p.status === 'TIMED_OUT') ? (errByFn[p.functionName] || '') : '';
      return [p.functionName, p.status, p.startTime, p.durationSec, err];
    });
    sheet.getRange(2, 1, out.length, 5).setValues(out);
  }
  SpreadsheetApp.flush();
  return jsonResponse_({ status: 'ok', action: 'refreshScriptExecutions', count: procs.length });
}


/**
 * Pull recent ERROR-severity log entries for this script from Cloud Logging.
 * Returns { functionName: message } keyed by the app_script function label.
 * Non-fatal: returns {} if the project id is wrong or the call fails.
 */
function pullErrorLogs_(token) {
  var out = {};
  // Try each candidate project resource name and merge entries. The Apps Script
  // logs live under whichever project the script is bound to — a GCP project id
  // (operator-supplied) or, for default scripts, the script id itself.
  var candidates = [
    'gen-lang-client-0416764369',
    '1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr'
  ];
  candidates.forEach(function (projectId) {
    try {
      var url = 'https://logging.googleapis.com/v2/entries:list';
      var body = JSON.stringify({
        resourceNames: ['projects/' + projectId],
        filter: 'resource.type="app_script" AND severity>=ERROR',
        orderBy: 'timestamp desc',
        pageSize: 200
      });
      var resp = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: { 'Authorization': 'Bearer ' + token },
        payload: body,
        muteHttpExceptions: true
      });
      if (resp.getResponseCode() !== 200) return;
      var data = JSON.parse(resp.getContentText());
      (data.entries || []).forEach(function (e) {
        var fn = (e.resource && e.resource.labels && e.resource.labels.function_name) || '';
        if (!fn || out[fn]) return;
        var msg = e.textPayload || (e.jsonPayload ? JSON.stringify(e.jsonPayload) : '');
        out[fn] = String(msg).slice(0, 300);
      });
    } catch (err) {
      // ignore — status-only fallback
    }
  });
  return out;
}


/**
 * Delete rows from "FWM — Creditor Detail" by Tab # (e.g. C-013) or by obligor|creditor key.
 * @param {Array<string>} tabIds - exact Tab # values to delete (highest priority).
 * @param {Array<Object>} keys - {obligor, creditor} pairs to delete.
 */
function deleteCreditorDetail_(ss, tabIds, keys) {
  var sheet = ss.getSheetByName('FWM — Creditor Detail');
  if (!sheet) return { status: 'error', action: 'deleteCreditorDetail', message: 'FWM — Creditor Detail tab not found' };

  var lastRow = sheet.getLastRow();
  var headerRow = 2;
  var toDelete = {}; // sheet row number -> true

  if (lastRow >= headerRow + 1) {
    var n = lastRow - headerRow;
    var tabCol = sheet.getRange(headerRow + 1, 1, n, 1).getValues();
    var obCol  = sheet.getRange(headerRow + 1, 2, n, 1).getValues();
    var crCol  = sheet.getRange(headerRow + 1, 3, n, 1).getValues();

    var tabSet = {};
    (tabIds || []).forEach(function (t) { if (t) tabSet[String(t).trim()] = true; });
    var keySet = {};
    (keys || []).forEach(function (k) {
      if (k && k.obligor && k.creditor) keySet[(k.obligor + '|' + k.creditor).toLowerCase()] = true;
    });

    for (var i = 0; i < n; i++) {
      var tabVal = String(tabCol[i][0] || '').trim();
      var obligor = String(obCol[i][0] || '').trim();
      var creditor = String(crCol[i][0] || '').trim();
      var rowNum = headerRow + 1 + i;
      if (tabSet[tabVal]) { toDelete[rowNum] = true; continue; }
      if (keySet[(obligor + '|' + creditor).toLowerCase()]) { toDelete[rowNum] = true; }
    }
  }

  // Delete bottom-up so row numbers stay valid.
  var rowNums = Object.keys(toDelete).map(Number).sort(function (a, b) { return b - a; });
  for (var d = 0; d < rowNums.length; d++) {
    sheet.deleteRow(rowNums[d]);
  }

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'deleteCreditorDetail', deleted: rowNums.length };
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
    var allData = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
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
      sheet.getRange(existingRow, 1, 1, 6).setValues([[
        ex[0], platform, a.username || ex[2], a.lastVerified || ex[3],
        a.notes || ex[4], a.acctEmail || ex[5]
      ]]);
      updated++;
    } else {
      sheet.appendRow([
        'WA-' + String(nextId++).padStart(3, '0'),
        platform, a.username || '', a.lastVerified || '',
        a.notes || '', a.acctEmail || ''
      ]);
      platformMap[key] = sheet.getLastRow();
      imported++;
    }
  }
  return { status: 'ok', action: 'pushWebsiteAccounts', imported: imported, updated: updated };
}


/**
 * Delete rows from "Website Accounts" by accountId (WA-NNN) and/or exact
 * platform-name match (for the rare row with no accountId at all).
 * Backs up every deleted row to a new sheet ("WA_PreDelete_<timestamp>")
 * before removing anything, mirroring the PreReplace/PreRewrite backup
 * pattern used elsewhere in this file (e.g. importRegistryFromSheet) —
 * deletion is always reversible by copying rows back out of that tab.
 */
function deleteWebsiteAccounts_(ss, accountIds, platforms) {
  var sheet = ss.getSheetByName('Website Accounts');
  if (!sheet) return { status: 'error', action: 'deleteWebsiteAccounts', message: 'Website Accounts tab not found' };

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { status: 'ok', action: 'deleteWebsiteAccounts', deleted: 0, notFound: accountIds, notFoundPlatforms: platforms };
  }

  var idSet = {};
  for (var i = 0; i < accountIds.length; i++) idSet[String(accountIds[i]).trim().toUpperCase()] = true;
  var platSet = {};
  for (var p = 0; p < platforms.length; p++) platSet[String(platforms[p]).trim().toLowerCase()] = true;

  var data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  var matchedIds = {}, matchedPlatforms = {};
  var deletedRows = [];
  var rowsToDelete = []; // sheet row numbers, will sort descending before deleting

  for (var r = 0; r < data.length; r++) {
    var row = data[r];
    var id = String(row[0] || '').trim().toUpperCase();
    var platform = String(row[1] || '').trim().toLowerCase();
    var isMatch = false;

    if (id && idSet[id]) { isMatch = true; matchedIds[id] = true; }
    else if (!id && platform && platSet[platform]) { isMatch = true; matchedPlatforms[platform] = true; }

    if (isMatch) {
      deletedRows.push(row);
      rowsToDelete.push(r + 2); // +2: header row + 1-based index
    }
  }

  if (rowsToDelete.length === 0) {
    return { status: 'ok', action: 'deleteWebsiteAccounts', deleted: 0, notFound: accountIds, notFoundPlatforms: platforms };
  }

  // Backup before delete — full 8-column snapshot of exactly the rows being removed.
  var headers = ['accountId', 'platform', 'username', 'lastVerified', 'notes', 'acctEmail'];
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Chicago', 'yyyyMMdd_HHmmss');
  var backupName = 'WA_PreDelete_' + stamp;
  var backupSheet = ss.insertSheet(backupName);
  backupSheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  backupSheet.getRange(2, 1, deletedRows.length, headers.length).setValues(deletedRows);
  backupSheet.setTabColor('#ef4444');

  // Delete bottom-up so earlier row indices stay valid.
  rowsToDelete.sort(function(a, b) { return b - a; });
  for (var d = 0; d < rowsToDelete.length; d++) sheet.deleteRow(rowsToDelete[d]);

  var notFoundIds = [];
  for (var idKey in idSet) if (!matchedIds[idKey]) notFoundIds.push(idKey);
  var notFoundPlatforms = [];
  for (var platKey in platSet) if (!matchedPlatforms[platKey]) notFoundPlatforms.push(platKey);

  return {
    status: 'ok', action: 'deleteWebsiteAccounts',
    deleted: rowsToDelete.length, backupSheet: backupName,
    notFound: notFoundIds, notFoundPlatforms: notFoundPlatforms
  };
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
  HOUSEHOLD_OBLIGATIONS: 'TMAR — Business Obligations',
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


/**
 * Backfill the Master Register "Audit Account #" column (col E) from the FWM
 * filing chain. Takes [{entry: 'MR-087', audit: '90000075961-L2'}, ...].
 * Backs up the tab to MasterRegister_PreBackfillAudit_<stamp> first (read-only
 * safety), then writes each value onto its Entry No. row. Locates the real
 * header row + "Audit Account #" column dynamically (header is NOT row 1).
 * @param {Object} ss - active spreadsheet
 * @param {Array<Object>} fills - [{entry, audit}]
 */
function backfillAuditAccounts_(ss, fills) {
  var sheet = ss.getSheetByName('Master Register');
  if (!sheet) return { status: 'error', action: 'backfillAuditAccounts', message: 'Master Register tab not found' };

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn() || 13;

  // Backup (read-only safety, mirroring PreBackfill pattern)
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Chicago', 'yyyyMMdd_HHmmss');
  var backup = ss.insertSheet('MasterRegister_PreBackfillAudit_' + stamp);
  backup.getRange(1, 1, lastRow, lastCol).setValues(sheet.getRange(1, 1, lastRow, lastCol).getValues());
  backup.setTabColor('#ef4444');

  var all = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var hi = 0, hn = 0;
  for (var i = 0; i < all.length; i++) {
    var n = 0;
    for (var c = 0; c < all[i].length; c++) if (String(all[i][c]).trim() !== '') n++;
    if (n > hn) { hn = n; hi = i; }
  }
  var hdr = all[hi];
  var entryIdx = -1, acctIdx = -1;
  for (var j = 0; j < hdr.length; j++) {
    var hj = String(hdr[j]).toLowerCase();
    if (entryIdx === -1 && (hj.indexOf('entry') !== -1)) entryIdx = j;
    if (acctIdx === -1 && hj.indexOf('audit account') !== -1) acctIdx = j;
  }
  if (entryIdx === -1 || acctIdx === -1) {
    return { status: 'error', action: 'backfillAuditAccounts', message: 'Entry No. or Audit Account # column not found', entryIdx: entryIdx, acctIdx: acctIdx };
  }

  var byEntry = {};
  fills.forEach(function(f) { if (f && f.entry) byEntry[String(f.entry).trim()] = f.audit; });

  var filled = 0, unmatched = [];
  for (var r = hi + 1; r < all.length; r++) {
    var entry = String(all[r][entryIdx] || '').trim();
    if (!entry) continue;
    if (Object.prototype.hasOwnProperty.call(byEntry, entry)) {
      sheet.getRange(r + 1, acctIdx + 1).setValue(byEntry[entry]);
      filled++;
    }
  }
  // report requested entries not found
  Object.keys(byEntry).forEach(function(e) {
    var found = false;
    for (var r = hi + 1; r < all.length; r++) if (String(all[r][entryIdx] || '').trim() === e) { found = true; break; }
    if (!found) unmatched.push(e);
  });

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'backfillAuditAccounts', filled: filled, requested: fills.length, unmatched: unmatched, backupSheet: backup.getName(), headerRow: hi + 1, entryCol: entryIdx + 1, acctCol: acctIdx + 1 };
}


/**
 * Delete Master Register backup sheets by exact name. Used to clean up the
 * redundant PreBackfillAudit snapshots a flaky POST can leave behind (each
 * retry creates one). Deletes only sheets whose name is in the given list;
 * returns deleted + notFound. Never touches the live 'Master Register'.
 * @param {Object} ss - active spreadsheet
 * @param {Array<string>} sheetNames
 */
function deleteSheetsByName_(ss, sheetNames) {
  var deleted = [], notFound = [];
  sheetNames.forEach(function(name) {
    if (!name || String(name) === 'Master Register') { notFound.push(name); return; }
    var s = ss.getSheetByName(String(name));
    if (s) { ss.deleteSheet(s); deleted.push(name); }
    else { notFound.push(name); }
  });
  SpreadsheetApp.flush();
  return { status: 'ok', action: 'deleteSheetsByName', deleted: deleted, notFound: notFound };
}

