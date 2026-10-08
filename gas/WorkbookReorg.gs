/**
 * WorkbookReorg.gs — Stage 3 of the layout optimization (2026-10-08).
 * (1) rename Chart of Accounts → TIN Registry, Copy of Chart of Accounts → Chart of Accounts
 * (2) hide the now-redundant source tabs (data already merged/archived)
 * (3) regenerate the 📋 HUB INDEX from the actual surviving visible tabs
 */

var HUB_SECTIONS_ = [
  ['Index & Dashboard',   ['📋 HUB INDEX', '📋 Dashboard', '📊 Credit Scorecard']],
  ['Core Registers',      ['Master Register', 'TIN Registry', 'FWM — Creditor Detail']],
  ['Ledgers & Accounting',['Transaction Ledger', 'General Ledger', 'Chart of Accounts']],
  ['Banking',             ['BOA Cash Flow', 'PNC Cash Flow', 'Principal Register']],
  ['Tax Filings',         ['1040 Submissions', 'W-2 & Income Detail', 'Schedule A', '📄 Tax Filings']],
  ['1099 Pipeline',       ['1099 Filings']],
  ['Mailings & Authority',['Proof of Mailing', 'Website Accounts']],
  ['Trust Instruments',   ['📜 Trustee Resolutions', '📦 Asset Transfer Log']],
  ['Documents',           ['Document Inventory', 'Document Registry']],
  ['Household',           ['Household Obligations', 'Subscriptions & Services']],
  ['Filing System',       ['FWM — Master Index']],
  ['Reference',           ['AppScripts', 'Validation']]
];

function finalizeWorkbookReorg_(ss) {
  var out = { renames: [], hidden: [], skipRename: [] };

  // (1) Rename — guarded: only if source exists and target name is free.
  var coa = ss.getSheetByName('Chart of Accounts');
  if (coa && !ss.getSheetByName('TIN Registry')) {
    coa.setName('TIN Registry');
    out.renames.push('Chart of Accounts → TIN Registry');
  } else if (!coa) {
    out.skipRename.push('Chart of Accounts (missing)');
  } else {
    out.skipRename.push('Chart of Accounts → TIN Registry (target already exists)');
  }

  var copyCoa = ss.getSheetByName('Copy of Chart of Accounts');
  if (copyCoa && !ss.getSheetByName('Chart of Accounts')) {
    copyCoa.setName('Chart of Accounts');
    out.renames.push('Copy of Chart of Accounts → Chart of Accounts');
  } else if (!copyCoa) {
    out.skipRename.push('Copy of Chart of Accounts (missing)');
  } else {
    out.skipRename.push('Copy of Chart of Accounts → Chart of Accounts (target already exists)');
  }

  // (2) Hide redundant source tabs (data already merged into survivors or archived).
  var hideNames = [
    'Acct Ledger', 'Creditor Registry', 'Entities', 'Documents',
    'A Provident Private Creditor Dashboard',
    'F1040_PreDelete_20261007_220304', 'WA_PreDelete_20260803_135115'
  ];
  hideNames.forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (sh && !sh.isSheetHidden()) { sh.hideSheet(); out.hidden.push(name); }
  });

  SpreadsheetApp.flush();
  return out;
}

function regenerateHubIndex_(ss) {
  var hub = ss.getSheetByName('📋 HUB INDEX');
  if (!hub) hub = ss.insertSheet('📋 HUB INDEX');
  hub.clear();

  var r = 1;
  hub.getRange(r, 1).setValue('APPC RLT — UNIFIED WORKBOOK INDEX').setFontWeight('bold').setFontSize(13); r++;
  hub.getRange(r, 1).setValue('EIN: 41-6809588 | Trustee: Clinton Wimberly IV | CAF: 0317-17351'); r++;
  hub.getRange(r, 1).setValue('Generated: ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') + ' | Address: 2105 Presbyterian Ln, Kinston NC 28501'); r += 2;

  hub.getRange(r, 1, 1, 3).setValues([['TAB NAME', 'SECTION', 'SHEET #']])
    .setFontWeight('bold').setBackground('#1B2A4A').setFontColor('#FFFFFF'); r++;

  var sheetNo = 0, listed = 0;
  HUB_SECTIONS_.forEach(function (sec) {
    sec[1].forEach(function (name) {
      var sh = ss.getSheetByName(name);
      if (!sh) return;
      if (sh.isSheetHidden()) return;
      sheetNo++;
      hub.getRange(r, 1, 1, 3).setValues([[name, sec[0], sheetNo]]);
      r++; listed++;
    });
  });

  // Hidden/archived reference block.
  var hiddenTabs = [];
  ss.getSheets().forEach(function (sh) { if (sh.isSheetHidden()) hiddenTabs.push(sh.getName()); });
  hiddenTabs.sort();
  if (hiddenTabs.length) {
    r++;
    hub.getRange(r, 1).setValue('HIDDEN / ARCHIVED (' + hiddenTabs.length + '):').setFontWeight('bold'); r++;
    hiddenTabs.forEach(function (n) { hub.getRange(r, 1).setValue('  · ' + n); r++; });
  }

  hub.autoResizeColumns(1, 3);
  hub.setTabColor('#2E7D32');
  SpreadsheetApp.flush();
  return { listed: listed, hiddenCount: hiddenTabs.length, hidden: hiddenTabs };
}

// ── Stage 3b: fold the 3 binder/metrics guides into their survivors ──────────

function consolidateGuides_(ss) {
  var out = { renamed: [], appended: [], hidden: [], skipped: [] };

  // (1) Rename 📒 General Ledger → General Ledger (drop the emoji; distinguish from Transaction Ledger).
  var gl = ss.getSheetByName('📒 General Ledger');
  if (gl && !ss.getSheetByName('General Ledger')) {
    gl.setName('General Ledger');
    out.renamed.push('📒 General Ledger → General Ledger');
  } else {
    out.skipped.push('General Ledger rename (' + (gl ? 'target already exists' : 'source missing') + ')');
  }

  // (2) Register Summary metrics → 📋 Dashboard.
  if (appendBlock_(ss, 'Register Summary', '📋 Dashboard', 'REGISTER SUMMARY — ACCOUNT METRICS (folded from "Register Summary")')) {
    out.appended.push('Register Summary → 📋 Dashboard');
  }

  // (3) 📁 Binder Index registry → FWM — Master Index.
  if (appendBlock_(ss, '📁 Binder Index', 'FWM — Master Index', 'BINDER DOCUMENT REGISTRY (folded from "📁 Binder Index")')) {
    out.appended.push('📁 Binder Index → FWM — Master Index');
  }

  // (4) Process Flow guide → FWM — Master Index.
  if (appendBlock_(ss, 'Process Flow', 'FWM — Master Index', 'BINDER DOC ORDER + FREEWAY PROCESS FLOW + KEY DOC INVENTORY + EIN DEDUP RULE (folded from "Process Flow")')) {
    out.appended.push('Process Flow → FWM — Master Index');
  }

  // (5) Hide the three folded sources.
  ['Register Summary', 'Process Flow', '📁 Binder Index'].forEach(function (n) {
    var sh = ss.getSheetByName(n);
    if (sh && !sh.isSheetHidden()) { sh.hideSheet(); out.hidden.push(n); }
  });

  SpreadsheetApp.flush();
  return out;
}

function appendBlock_(ss, srcName, dstName, banner) {
  var src = ss.getSheetByName(srcName);
  var dst = ss.getSheetByName(dstName);
  if (!src || !dst) return false;
  if (src.isSheetHidden()) return false;          // source already hidden → skip
  // Strong idempotency: skip if the destination already carries this banner (prevents duplicate folds on re-run).
  var dstVals = dst.getDataRange().getValues();
  for (var i = 0; i < dstVals.length; i++) {
    if (String(dstVals[i][0]).indexOf(banner) !== -1) return false;  // already folded
  }
  var data = src.getDataRange().getValues();
  var cols = src.getLastColumn();
  var r = dst.getLastRow() + 2;                    // one blank separator row
  dst.getRange(r, 1).setValue(banner).setFontWeight('bold').setBackground('#FCE5CD');
  r++;
  dst.getRange(r, 1, data.length, cols).setValues(data);
  return true;
}

// ── Surface the installed trigger list (answers "what is driving consolidation?") ──

function listInstalledTriggers_(ss) {
  var trigs = [];
  try {
    ScriptApp.getProjectTriggers().forEach(function (t) {
      var ev = '', src = '';
      try { ev = String(t.getEventType()); } catch (e) {}
      try { src = String(t.getTriggerSource()); } catch (e) {}
      trigs.push({ handler: t.getHandlerFunction(), eventType: ev, source: src, uniqueId: t.getUniqueId() });
    });
  } catch (e) {
    trigs.push({ error: String(e) });
  }
  return trigs;
}

// ── Scheduled consolidation (time-based trigger) — PC agent is the single writer ──

function runScheduledConsolidation() {
  var ss = SpreadsheetApp.openById(TMAR_CONFIG.liveBookId);
  var reorg = finalizeWorkbookReorg_(ss);
  var guides = consolidateGuides_(ss);
  var hub = regenerateHubIndex_(ss);
  Logger.log('Scheduled consolidation @ %s — renames %d, skips %d, folded %d, hidden %d, hub %d visible / %d hidden',
    new Date().toISOString(),
    reorg.renames.length, reorg.skipRename.length,
    guides.appended.length, guides.hidden.length,
    hub.listed, hub.hiddenCount);
  return { reorg: reorg, guides: guides, hub: hub };
}

function installConsolidationTrigger() {
  // Remove any prior copy first (idempotent — never duplicates).
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'runScheduledConsolidation') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runScheduledConsolidation')
    .timeBased()
    .everyDays(1)
    .atHour(4)
    .create();
  return 'Installed daily consolidation trigger (04:00).';
}

function removeConsolidationTrigger() {
  var n = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'runScheduledConsolidation') { ScriptApp.deleteTrigger(t); n++; }
  });
  return 'Removed ' + n + ' consolidation trigger(s).';
}

// ── Stage 4: prune the static guide/reference sheets (13) ─────────────────────

var PRUNE_GUIDES_ = [
  '🏦 Banking Records', '⚖️ Tax Determinations', 'Tax Strategy', 'CPA Questions',
  '1099 Filing Chain', '🧾 IRIS 1099-B Generator', 'Forms & Authority',
  '📑 Trust Instrument', '🔑 Trustee Authority', '📊 Corpus & M-2',
  'FWM — Forms Checklist', 'Filing Dashboard', 'Gap Report'
];

function pruneGuides_(ss) {
  var out = { hidden: [], missing: [] };
  PRUNE_GUIDES_.forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) { out.missing.push(name); return; }
    if (!sh.isSheetHidden()) { sh.hideSheet(); out.hidden.push(name); }
  });
  SpreadsheetApp.flush();
  return out;
}

// Append tabs into an EXISTING archive workbook (avoids SpreadsheetApp.create, which
// intermittently drops the Web App POST connection).
function appendToArchive_(tabNames, archiveId) {
  var source = SpreadsheetApp.openById(TMAR_SPREADSHEET_ID_);
  var target = SpreadsheetApp.openById(archiveId);
  var copied = [], missing = [], failed = [];
  tabNames.forEach(function (name) {
    var sh = source.getSheetByName(name);
    if (!sh) { missing.push(name); return; }
    try {
      sh.copyTo(target).setName(name);
      copied.push(name);
    } catch (e) {
      failed.push(name + ' :: ' + String(e));
    }
  });
  SpreadsheetApp.flush();
  return { status: 'ok', action: 'appendToArchive', copied: copied, missing: missing, failed: failed, archiveId: archiveId };
}

// ── Fold Script Executions into AppScripts ─────────────────────────────────────
// AppScripts layout (written by pushAppScriptsInventory_): Function (file → name) | What it does | Status | Start Time | Duration (s) | Error.
// This populates the three runtime columns by matching the execution log's HTTP
// action ("GET:pullAccounts") against the source function name ("pullAccounts_").

function _normExecName_(n) { return String(n || '').trim().replace(/^(GET|POST|PUT|DELETE|PATCH):/i, ''); }
function _normFuncName_(n) { return String(n || '').trim().replace(/_+$/, ''); }

function foldScriptExecutions_(ss) {
  var app = ss.getSheetByName('AppScripts');
  var se = ss.getSheetByName('Script Executions');
  if (!app) return { status: 'error', action: 'foldScriptExecutions', message: 'AppScripts sheet not found' };
  if (!se) return { status: 'error', action: 'foldScriptExecutions', message: 'Script Executions sheet not found' };

  var appVals = app.getDataRange().getValues();   // A=Function (file → name), B=What it does, C=Status, D=Start Time, E=Duration, F=Error
  var seVals = se.getDataRange().getValues();     // A=Function, B=Status, C=Start Time, D=Duration, E=Error

  // latest-execution map (log is newest-first → keep first occurrence per action)
  var exec = {};
  for (var i = 1; i < seVals.length; i++) {
    var act = _normExecName_(seVals[i][0]);
    if (!act || (act in exec)) continue;
    exec[act] = { start: seVals[i][2], dur: seVals[i][3], err: seVals[i][4] };
  }

  // populate the three runtime columns where a source function matches a logged action
  var populated = 0, missing = 0;
  for (var r = 1; r < appVals.length; r++) {
    var combined = String(appVals[r][0] || '').trim();
    if (!combined) continue;
    var fn = combined.indexOf(' → ') >= 0 ? combined.split(' → ').pop().trim() : combined;
    var key = _normFuncName_(fn);
    if (!(key in exec)) { missing++; continue; }
    var e = exec[key];
    app.getRange(r + 1, 4, 1, 3).setValues([[e.start || '', e.dur || '', e.err || '']]);
    populated++;
  }

  var hiddenSe = false;
  if (!se.isSheetHidden()) { se.hideSheet(); hiddenSe = true; }

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'foldScriptExecutions', populated: populated, unmatched: missing, matchedActions: Object.keys(exec).length, hiddenScriptExecutions: hiddenSe };
}
