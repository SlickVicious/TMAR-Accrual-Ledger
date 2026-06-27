/**
 * TabConsolidationAudit.gs — report + guarded cleanup of duplicate tabs in the
 * Live book left by the APPC→Live migration. The migration round-tripped
 * prefixed "TMAR — *" (and a couple of emoji) COPIES of unprefixed originals
 * that the app actually reads (getMasterRegister, getRegistrySheet_, etc.).
 *
 * Safety model:
 *   - Only the COPY (left column of DUP_PAIRS_) is ever eligible for deletion.
 *   - The unprefixed ORIGINAL (right column) is NEVER deleted — the app reads it.
 *   - A copy is deleted only when its original has >= the data rows (original is
 *     the source of truth). A copy with MORE rows is skipped + flagged so you can
 *     reconcile by hand (it may hold unique/newer data).
 *   - Tier-2/3 tabs (dashboards, ledgers, the trust-binder/FWM sets) are NOT in
 *     DUP_PAIRS_, so this can never touch them.
 *
 * USAGE (Apps Script editor → Run, in order):
 *   1. auditTabsForConsolidation()     → report-only: every tab + duplicate verdicts
 *   2. previewDuplicateRemoval()       → dry run: what WOULD be deleted vs skipped
 *   3. removeConfirmedDuplicateTabs()  → actually deletes the safe copies
 */

// Tier-1 duplicate copies → their authoritative unprefixed twin. ONLY these are
// ever eligible for deletion.
var DUP_PAIRS_ = [
  ['TMAR — Master Register',       'Master Register'],
  ['TMAR — Transaction Ledger',    'Transaction Ledger'],
  ['TMAR — 1099 Filing Chain',     '1099 Filing Chain'],
  ['TMAR — W-2 & Income Detail',   'W-2 & Income Detail'],
  ['TMAR — 1040 Submissions',      '1040 Submissions'],
  ['TMAR — Forms & Authority',     'Forms & Authority'],
  ['TMAR — Proof of Mailing',      'Proof of Mailing'],
  ['TMAR — 1099 Filings',          '1099 Filings'],
  ['TMAR — Document Inventory',    'Document Inventory'],
  ['TMAR — Document Registry',     'Document Registry'],
  ['TMAR — CoA',                   'CoA'],
  ['TMAR — Principal Register',    'Principal Register'],
  ['TMAR — Household Obligations', 'Household Obligations'],
  ['DInv',                         'Document Inventory']   // headerless near-clone (826 vs 829 rows) — spot-check Inventory is a superset
];

// Empty scaffolding (0 rows) to remove: the folded Freeway (FWM) package + empty
// CPA Questions. The 15 emoji trust-binder tabs are intentionally KEPT as a
// planned binder structure to fill. Deleted ONLY when getLastRow() === 0, so
// anything you populate later is automatically spared.
var EMPTY_SCAFFOLD_ = [
  'FWM — Master Index', 'FWM — Forms Checklist', 'FWM — Creditor Detail', 'FWM — Dashboard', 'FWM — Binder Tab Guide',
  'CPA Questions'
];

function _liveBook_() { return SpreadsheetApp.openById(TMAR_CONFIG.liveBookId); }

function auditTabsForConsolidation() {
  var ss = _liveBook_();
  var sheets = ss.getSheets();
  Logger.log('=== ALL TABS (%s) in Live book ===', sheets.length);
  sheets.forEach(function(sh) {
    Logger.log('%s | rows=%s cols=%s', sh.getName(), sh.getLastRow(), sh.getLastColumn());
  });
  Logger.log('');
  Logger.log('=== TIER-1 DUPLICATE PAIRS (copy vs original) ===');
  DUP_PAIRS_.forEach(function(p) {
    var copy = ss.getSheetByName(p[0]);
    var twin = ss.getSheetByName(p[1]);
    if (!copy) { Logger.log('· copy "%s" — already gone', p[0]); return; }
    if (!twin) { Logger.log('⚠ copy "%s" rows=%s — ORIGINAL "%s" MISSING; do NOT delete (copy may be the only source)', p[0], copy.getLastRow(), p[1]); return; }
    var cr = copy.getLastRow(), tr = twin.getLastRow();
    var verdict = (tr >= cr)
      ? 'SAFE — delete copy (original ' + tr + ' >= copy ' + cr + ' rows)'
      : 'SKIP — copy has MORE rows (' + cr + ' > original ' + tr + '); reconcile manually';
    Logger.log('· "%s" (rows=%s) ↔ "%s" (rows=%s)  →  %s', p[0], cr, p[1], tr, verdict);
  });
  Logger.log('');
  Logger.log('=== EMPTY SCAFFOLD (deleted only when 0 rows) ===');
  EMPTY_SCAFFOLD_.forEach(function(name) {
    var sh = ss.getSheetByName(name);
    if (!sh) { Logger.log('· "%s" — already gone', name); return; }
    Logger.log('· "%s" → rows=%s %s', name, sh.getLastRow(),
      sh.getLastRow() === 0 ? '(EMPTY — safe delete)' : '(HAS DATA — will be SKIPPED)');
  });
}

// ── Content diff for overlapping populated tabs ──────────────────────────────
// Compares each pair by its first-column key (Doc ID / name) to reveal whether
// one tab holds rows the other is missing (a real merge), or is just stale.
var COMPARE_PAIRS_ = [
  ['TMAR — Document Registry', 'Document Registry'],   // 1629 vs 1030 rows
  ['Creditor Registry',        'FWM — Creditor Detail'],
  ['Checklist',                'FWM — Forms Checklist']
];

// Dump the first rows of both registries so the backfill column-mapping can be
// designed from real headers (canonical = 20 cols, copy = 10 cols).
function dumpRegistryHeaders() {
  var ss = _liveBook_();
  ['Document Registry', 'TMAR — Document Registry'].forEach(function(name) {
    var sh = ss.getSheetByName(name);
    if (!sh) { Logger.log('── "%s" MISSING', name); return; }
    Logger.log('──── "%s" (lastRow=%s lastCol=%s) ────', name, sh.getLastRow(), sh.getLastColumn());
    var n = Math.min(3, sh.getLastRow());
    sh.getRange(1, 1, n, sh.getLastColumn()).getValues().forEach(function(r, i) {
      Logger.log('  row%s: %s', i + 1, JSON.stringify(r));
    });
  });
}

// Dump the first rows of the FWM merge-pair tabs so the Party-column merge can
// be designed from real structure (banners, headers, key columns may differ).
// Coverage check: do the richer non-FWM tabs contain every EIN (col D) that the
// FWM source tabs have? If yes, the FWM tabs are safe to archive (nothing lost).
function checkCreditorCoverage() {
  var ss = _liveBook_();
  [['Checklist', 'FWM — Forms Checklist'], ['Creditor Registry', 'FWM — Creditor Detail']].forEach(function(p) {
    var rich = ss.getSheetByName(p[0]), fwm = ss.getSheetByName(p[1]);
    Logger.log('──── keep "%s"  vs  archive "%s" ────', p[0], p[1]);
    if (!rich || !fwm) { Logger.log('  missing a sheet'); return; }
    var er = _einSet_(rich), ef = _einSet_(fwm);
    var onlyFwm = []; ef.forEach(function(x) { if (!er.has(x)) onlyFwm.push(x); });
    var onlyRich = []; er.forEach(function(x) { if (!ef.has(x)) onlyRich.push(x); });
    Logger.log('  "%s": %s EINs | "%s": %s EINs | shared=%s', p[0], er.size, p[1], ef.size, er.size - onlyRich.length);
    Logger.log('  EINs ONLY in FWM (LOST if archived): %s%s', onlyFwm.length, onlyFwm.length ? ' → ' + onlyFwm.join(', ') : '  ✅ none — safe to archive');
    if (onlyRich.length) Logger.log('  EINs only in "%s": %s → %s', p[0], onlyRich.length, onlyRich.join(', '));
  });
}
function _einSet_(sh) {
  var n = sh.getLastRow(); var set = new Set(); if (n < 1) return set;
  var vals = sh.getRange(1, 1, n, Math.min(4, sh.getLastColumn())).getValues();
  vals.forEach(function(r) {
    var e = String(r[3] == null ? '' : r[3]).replace(/[^0-9]/g, '');
    if (e.length === 9) set.add(e);
  });
  return set;
}

function dumpMergeCandidates() {
  var ss = _liveBook_();
  ['Checklist', 'FWM — Forms Checklist', 'Creditor Registry', 'FWM — Creditor Detail'].forEach(function(name) {
    var sh = ss.getSheetByName(name);
    if (!sh) { Logger.log('── "%s" MISSING', name); return; }
    Logger.log('════ "%s" (lastRow=%s lastCol=%s) ════', name, sh.getLastRow(), sh.getLastColumn());
    var n = Math.min(8, sh.getLastRow());
    sh.getRange(1, 1, n, sh.getLastColumn()).getValues().forEach(function(r, i) {
      Logger.log('  r%s: %s', i + 1, JSON.stringify(r));
    });
  });
}

function compareSuspectPairs() {
  var ss = _liveBook_();
  COMPARE_PAIRS_.forEach(function(pair) {
    var a = ss.getSheetByName(pair[0]), b = ss.getSheetByName(pair[1]);
    Logger.log('──────── "%s"  vs  "%s" ────────', pair[0], pair[1]);
    if (!a || !b) { Logger.log('  missing: "%s"', !a ? pair[0] : pair[1]); return; }
    var ka = _keySet_(a), kb = _keySet_(b);
    var onlyA = _diffKeys_(ka, kb), onlyB = _diffKeys_(kb, ka);
    var shared = ka.size - onlyA.length;
    Logger.log('  "%s": %s col-1 keys | "%s": %s keys | shared=%s', pair[0], ka.size, pair[1], kb.size, shared);
    Logger.log('  only in "%s": %s%s', pair[0], onlyA.length, onlyA.length ? '  e.g. ' + onlyA.slice(0, 8).join(', ') : '');
    Logger.log('  only in "%s": %s%s', pair[1], onlyB.length, onlyB.length ? '  e.g. ' + onlyB.slice(0, 8).join(', ') : '');
  });
}

function _keySet_(sh) {
  var n = sh.getLastRow();
  var set = new Set();
  if (n < 1) return set;
  sh.getRange(1, 1, n, 1).getValues().forEach(function(r) {
    var k = String(r[0] == null ? '' : r[0]).trim();
    if (k) set.add(k);
  });
  return set;
}
function _diffKeys_(a, b) { var out = []; a.forEach(function(x) { if (!b.has(x)) out.push(x); }); return out; }

// ── Promote the PC scan to the canonical Document Registry ────────────────────
// "Document Registry" (Mac FileCabinet 2, 20 cols) and "TMAR — Document Registry"
// (PC Desktop\FileCabinet, 10 cols) are TWO corpora with colliding Doc IDs — NOT
// mergeable. Decision: PC is canonical. Archive the Mac one, rename the PC one in,
// and normalize its header (title row 1, full header row 2, data row 3+) so the
// fiduciary minter (getRegistrySheet_ / REGISTRY_DATA_START_=3) keeps working.
var REGISTRY_FULL_HEADER_ = ['Doc ID','Filename','Document Type','Tax Year','Person','MR Account','FWM Binder Tab','Full File Path','Source Directory','Scan Date'];
var REGISTRY_MAC_LEGACY_NAME_ = 'Document Registry (Mac legacy)';

function previewPromotePcRegistry() { return _promotePcRegistry_(true); }
function promotePcRegistryToCanonical() { return _promotePcRegistry_(false); }

function _promotePcRegistry_(dryRun) {
  var ss = _liveBook_();
  var mac = ss.getSheetByName('Document Registry');
  var pc  = ss.getSheetByName('TMAR — Document Registry');
  if (!pc)  { Logger.log('ABORT: "TMAR — Document Registry" not found (already promoted?).'); return; }
  if (!mac) { Logger.log('ABORT: "Document Registry" not found.'); return; }
  if (ss.getSheetByName(REGISTRY_MAC_LEGACY_NAME_)) { Logger.log('ABORT: "%s" already exists — resolve manually.', REGISTRY_MAC_LEGACY_NAME_); return; }
  Logger.log('%s — promote PC scan to canonical Document Registry:', dryRun ? 'DRY RUN (no changes)' : 'EXECUTE');
  Logger.log('  1. "Document Registry" (Mac, %s rows) → "%s"', mac.getLastRow(), REGISTRY_MAC_LEGACY_NAME_);
  Logger.log('  2. "TMAR — Document Registry" (PC, %s rows) → "Document Registry"', pc.getLastRow());
  Logger.log('  3. Insert title row + write full header; data shifts to row 3 (DOC-0001..). New doc count = %s', pc.getLastRow() - 1);
  if (dryRun) return { dryRun: true };
  mac.setName(REGISTRY_MAC_LEGACY_NAME_);
  pc.setName('Document Registry');
  pc.insertRowBefore(1);                                                   // new blank row 1
  pc.getRange(1, 1, 1, 10).setValues([['DOCUMENT REGISTRY — FILESYSTEM CROSS-REFERENCE (PC)', '', '', '', '', '', '', '', '', '']]);
  pc.getRange(2, 1, 1, 10).setValues([REGISTRY_FULL_HEADER_]);            // overwrite shifted partial header
  SpreadsheetApp.flush();
  Logger.log('DONE — "Document Registry" is now the PC scan (%s data rows). Old Mac registry archived as "%s".', pc.getLastRow() - 2, REGISTRY_MAC_LEGACY_NAME_);
  return { dryRun: false, canonicalRows: pc.getLastRow() - 2 };
}

// ── Dead-tab cleanup (code-confirmed) ────────────────────────────────────────
//  - "Validation" (plain): unreferenced by any GAS (all code uses "_Validation").
//    Guarded by a data-validation reference scan so we never break a dropdown.
//  - "CPA Questions": header-only; ensureCPASheet_() recreates it on demand.
// ── Align workbook tab names to their TMAR GUI section labels (SHEET_MAP) ─────
// Safe: no GAS reader references these names. Guarded — renames only when the
// source exists and the target name is free. Mirror of the HTML SHEET_MAP.
// The 'CoA' / 'Chart of Accounts' tab actually holds entity/TIN data (people +
// creditor EINs), NOT GAAP account codes — rename it to its true name. The GUI's
// GAAP Chart of Accounts syncs to a separate 'GAAP CoA' tab (created on push).
// 'Account Entities' stays as-is (it is the Entity Verifier's source-data tab).
var TAB_RENAMES_ = [
  ['Chart of Accounts', 'TIN Registry'],
  ['CoA',               'TIN Registry']
];
function previewAlignTabNames() { return _alignTabs_(true); }
function alignTabNames() { return _alignTabs_(false); }
function _alignTabs_(dryRun) {
  var ss = _liveBook_();
  var done = [], skip = [];
  TAB_RENAMES_.forEach(function(p) {
    var from = p[0], to = p[1], sh = ss.getSheetByName(from);
    if (!sh) { skip.push('"' + from + '" → "' + to + '" (source missing — already renamed?)'); return; }
    if (ss.getSheetByName(to)) { skip.push('"' + from + '" → "' + to + '" (target already exists)'); return; }
    if (!dryRun) sh.setName(to);
    done.push('"' + from + '" → "' + to + '"');
  });
  Logger.log('%s — %s rename(s) %s:\n  %s', dryRun ? 'DRY RUN' : 'DONE', done.length, dryRun ? 'WOULD apply' : 'applied', done.join('\n  ') || '(none)');
  if (skip.length) Logger.log('SKIPPED:\n  %s', skip.join('\n  '));
  return { done: done, skipped: skip };
}

function previewRemoveDeadTabs() { return _removeDead_(true); }
function removeDeadTabs() { return _removeDead_(false); }

function _removeDead_(dryRun) {
  var ss = _liveBook_();
  var del = [], skip = [];

  // CPA Questions — delete only if header-only (no real questions).
  var cpa = ss.getSheetByName('CPA Questions');
  if (!cpa) skip.push('CPA Questions (not found)');
  else if (cpa.getLastRow() >= 2) skip.push('CPA Questions (' + cpa.getLastRow() + ' rows — has real questions, kept)');
  else { if (!dryRun) ss.deleteSheet(cpa); del.push('CPA Questions (header-only; auto-recreated by ensureCPASheet_)'); }

  // Validation — delete only if no dropdown rule references it.
  var val = ss.getSheetByName('Validation');
  if (!val) skip.push('Validation (not found)');
  else {
    var refs = _sheetReferencedByValidation_(ss, 'Validation');
    if (refs.length) skip.push('Validation (KEPT — dropdown rules reference it: ' + refs.slice(0, 5).join(', ') + ')');
    else { if (!dryRun) ss.deleteSheet(val); del.push('Validation (' + val.getLastRow() + ' rows; code-unreferenced, no dropdown refs)'); }
  }

  Logger.log('%s — %s tab(s) %s:\n  %s', dryRun ? 'DRY RUN' : 'DONE', del.length, dryRun ? 'WOULD be deleted' : 'deleted', del.join('\n  ') || '(none)');
  if (skip.length) Logger.log('SKIPPED:\n  %s', skip.join('\n  '));
  return { deleted: del, skipped: skip };
}

// Scan all sheets (capped) for data-validation rules whose source range is on `name`.
function _sheetReferencedByValidation_(ss, name) {
  var hits = [];
  ss.getSheets().forEach(function(sh) {
    if (sh.getName() === name) return;
    var lr = Math.min(sh.getLastRow() || 0, 300), lc = sh.getLastColumn() || 0;
    if (lr < 1 || lc < 1) return;
    var rules;
    try { rules = sh.getRange(1, 1, lr, lc).getDataValidations(); } catch (e) { return; }
    for (var r = 0; r < rules.length; r++) {
      for (var c = 0; c < rules[r].length; c++) {
        var rule = rules[r][c];
        if (!rule) continue;
        try {
          (rule.getCriteriaValues() || []).forEach(function(v) {
            if (v && v.getSheet && v.getSheet().getName() === name && hits.indexOf(sh.getName()) === -1) hits.push(sh.getName());
          });
        } catch (e) {}
      }
    }
  });
  return hits;
}

function previewEmptyRemoval() { return _removeEmpty_(true); }
function removeEmptyScaffoldTabs() { return _removeEmpty_(false); }

function _removeEmpty_(dryRun) {
  var ss = _liveBook_();
  var del = [], skip = [];
  EMPTY_SCAFFOLD_.forEach(function(name) {
    var sh = ss.getSheetByName(name);
    if (!sh) return;
    if (sh.getLastRow() === 0) { if (!dryRun) ss.deleteSheet(sh); del.push(name); }
    else skip.push(name + ' (now has ' + sh.getLastRow() + ' rows)');
  });
  Logger.log('%s — %s empty tab(s) %s:\n  %s',
    dryRun ? 'DRY RUN' : 'DONE', del.length,
    dryRun ? 'WOULD be deleted' : 'deleted', del.join('\n  ') || '(none)');
  if (skip.length) Logger.log('SKIPPED %s (not empty — spared):\n  %s', skip.length, skip.join('\n  '));
  return { deleted: del, skipped: skip, dryRun: dryRun };
}

function previewDuplicateRemoval() { return _removeDuplicates_(true); }
function removeConfirmedDuplicateTabs() { return _removeDuplicates_(false); }

function _removeDuplicates_(dryRun) {
  var ss = _liveBook_();
  var del = [], skip = [];
  DUP_PAIRS_.forEach(function(p) {
    var copy = ss.getSheetByName(p[0]);
    var twin = ss.getSheetByName(p[1]);
    if (!copy) return;                                          // already gone
    if (!twin) { skip.push(p[0] + ' (original missing)'); return; }
    if (copy.getSheetId() === twin.getSheetId()) return;        // paranoia: same sheet
    if (twin.getLastRow() >= copy.getLastRow()) {
      if (!dryRun) ss.deleteSheet(copy);
      del.push(p[0]);
    } else {
      skip.push(p[0] + ' (copy rows ' + copy.getLastRow() + ' > original ' + twin.getLastRow() + ')');
    }
  });
  Logger.log('%s — %s copy tab(s) %s:\n  %s',
    dryRun ? 'DRY RUN' : 'DONE',
    del.length,
    dryRun ? 'WOULD be deleted' : 'deleted',
    del.join('\n  ') || '(none)');
  if (skip.length) Logger.log('SKIPPED %s for manual review:\n  %s', skip.length, skip.join('\n  '));
  return { deleted: del, skipped: skip, dryRun: dryRun };
}
