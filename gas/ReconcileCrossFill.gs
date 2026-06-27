/**
 * ReconcileCrossFill.gs
 *
 * Cross-fills blank ID cells between the entity register (Type / TIN / Acct #)
 * and the account ledger (Provider/Creditor / Provider EIN / Account Number) by
 * matching rows on EIN (primary) then strict normalized name (fallback).
 *
 * Scope (per user choice): KEY IDS ONLY —
 *   • entity register "Acct #"      ← ledger "Account Number"
 *   • ledger "Provider EIN"         ← entity register "TIN"  (EIN rows only)
 *   • entity register "TIN" (EIN)   ← ledger "Provider EIN"  (if register blank)
 *
 * Safety:
 *   • Only writes to BLANK cells, never overwrites.
 *   • Preview-first: builds a "Cross-Fill Preview" tab (the only thing Apply
 *     touches) plus a "Cross-Fill Review" tab for ambiguous / no-source cases.
 *   • Columns are auto-detected by header text, so tab layout can drift.
 *   • SSN rows are ignored (never matched on SSN).
 *
 * Menu: TMAR → Data Gap Scanner → Reconcile & Cross-Fill…
 */

var XF_PREVIEW_ = 'Cross-Fill Preview';
var XF_REVIEW_  = 'Cross-Fill Review';

// ── Menu / dialog ─────────────────────────────────────────────────────────────
function showReconcileDialog() {
  var html = HtmlService.createHtmlOutputFromFile('ReconcileCrossFillUI')
    .setWidth(560).setHeight(440);
  SpreadsheetApp.getUi().showModalDialog(html, 'Reconcile & Cross-Fill');
}

// Client-callable (no trailing underscore).
function xfListSheetNames() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets().map(function (s) { return s.getName(); });
}

// ── Normalisation helpers ─────────────────────────────────────────────────────
function xfNormEin_(v) {
  var d = String(v == null ? '' : v).replace(/\D/g, '');
  return d.length === 9 ? d : '';   // EIN/SSN are 9 digits; we only key on EIN rows
}

function xfNormName_(v) {
  var s = String(v == null ? '' : v).toLowerCase();
  s = s.replace(/[.,#'"()\/\\-]/g, ' ');                 // punctuation -> space
  s = s.replace(/&/g, ' and ');
  s = s.replace(/\b(inc|llc|llp|lp|corp|corporation|co|company|na|ltd|the)\b/g, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

function xfHeaderRow_(sheet) {
  // Pick, among the first 6 rows, the row that looks most like a header
  // (most non-empty short text cells). Returns 1-based row index.
  var rng = sheet.getRange(1, 1, Math.min(6, sheet.getMaxRows()), sheet.getLastColumn() || 1).getValues();
  var best = 1, bestScore = -1;
  for (var r = 0; r < rng.length; r++) {
    var score = 0;
    for (var c = 0; c < rng[r].length; c++) {
      var v = String(rng[r][c] || '').trim();
      if (v && v.length <= 40 && /[a-z]/i.test(v)) score++;
    }
    if (score > bestScore) { bestScore = score; best = r + 1; }
  }
  return best;
}

function xfFindCol_(headers, tests) {
  // headers: array of header strings; tests: array of predicate fns. First hit wins.
  for (var t = 0; t < tests.length; t++) {
    for (var i = 0; i < headers.length; i++) {
      if (tests[t](String(headers[i] || '').toLowerCase().trim())) return i; // 0-based
    }
  }
  return -1;
}

/**
 * Read a register-type sheet into { sheet, headerRow, cols, rows }.
 * cols: { ein, acct, name, tinType }  (0-based; -1 if absent)
 * rows: [{ rowNum, ein, einRaw, acct, acctRaw, name, isSSN }]
 */
function xfReadSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Tab not found: ' + name);
  var hRow = xfHeaderRow_(sheet);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(hRow, 1, 1, lastCol).getValues()[0];

  var cols = {
    ein: xfFindCol_(headers, [
      function (h) { return /provider\s*ein/.test(h); },
      function (h) { return /\bein\b/.test(h); },
      function (h) { return /\btin\b/.test(h) && !/type/.test(h); }
    ]),
    acct: xfFindCol_(headers, [
      function (h) { return /acct\s*#|account\s*(number|no|#)|acct\.?\s*no/.test(h); }
    ]),
    name: xfFindCol_(headers, [
      function (h) { return /provider|creditor/.test(h); },
      function (h) { return /business\s*name/.test(h); },
      function (h) { return /company|payee|institution/.test(h); }
    ]),
    tinType: xfFindCol_(headers, [ function (h) { return /tin\s*type/.test(h); } ])
  };

  var rows = [];
  if (lastRow > hRow) {
    var data = sheet.getRange(hRow + 1, 1, lastRow - hRow, lastCol).getValues();
    for (var i = 0; i < data.length; i++) {
      var d = data[i];
      var einRaw  = cols.ein  >= 0 ? d[cols.ein]  : '';
      var acctRaw = cols.acct >= 0 ? d[cols.acct] : '';
      var nameRaw = cols.name >= 0 ? d[cols.name] : '';
      var tinType = cols.tinType >= 0 ? String(d[cols.tinType] || '').toUpperCase() : '';
      // skip fully empty rows
      if (!String(einRaw).trim() && !String(acctRaw).trim() && !String(nameRaw).trim()) continue;
      rows.push({
        rowNum: hRow + 1 + i,
        ein: xfNormEin_(einRaw),
        einRaw: einRaw,
        acct: String(acctRaw == null ? '' : acctRaw).trim(),
        acctRaw: acctRaw,
        name: xfNormName_(nameRaw),
        nameRaw: nameRaw,
        isSSN: /SSN/.test(tinType)
      });
    }
  }
  return { sheet: sheet, name: name, headerRow: hRow, cols: cols, rows: rows };
}

// Build name-uniqueness map (normalized name -> count) for strict-name fallback.
function xfNameCounts_(rows) {
  var m = {};
  rows.forEach(function (r) { if (r.name) m[r.name] = (m[r.name] || 0) + 1; });
  return m;
}

// Among rows sharing a key, the single distinct non-blank value of field, else ''.
function xfDistinct_(rows, field) {
  var set = {};
  rows.forEach(function (r) { var v = r[field]; if (v) set[v] = true; });
  var keys = Object.keys(set);
  return keys.length === 1 ? keys[0] : '';
}

// ── Preview ───────────────────────────────────────────────────────────────────
// Returns { ok, fills, review, message }
function xfPreview(entityTab, ledgerTab) {
  if (!entityTab || !ledgerTab) return { ok: false, message: 'Pick both tabs.' };
  if (entityTab === ledgerTab) return { ok: false, message: 'Pick two different tabs.' };

  var ent = xfReadSheet_(entityTab);
  var led = xfReadSheet_(ledgerTab);
  if (ent.cols.ein < 0 && ent.cols.acct < 0)
    return { ok: false, message: 'Could not find TIN/EIN or Acct # columns in "' + entityTab + '".' };
  if (led.cols.ein < 0 && led.cols.acct < 0)
    return { ok: false, message: 'Could not find EIN or Account Number columns in "' + ledgerTab + '".' };

  // EIN indexes
  function byEin(rows) { var m = {}; rows.forEach(function (r) { if (r.ein && !r.isSSN) (m[r.ein] = m[r.ein] || []).push(r); }); return m; }
  var entByEin = byEin(ent.rows), ledByEin = byEin(led.rows);
  var entNameCount = xfNameCounts_(ent.rows), ledNameCount = xfNameCounts_(led.rows);
  function byName(rows) { var m = {}; rows.forEach(function (r) { if (r.name) (m[r.name] = m[r.name] || []).push(r); }); return m; }
  var entByName = byName(ent.rows), ledByName = byName(led.rows);

  var fills = [];   // [TargetTab, TargetRow, TargetCol(1-based), TargetHeader, Proposed, MatchKey, SourceTab, SourceRow]
  var review = [];  // [Tab, Row, Field, Issue, NameOrEin]
  var n = 0;

  function pushFill(targetSheet, row, col0, header, value, matchKey, srcTab, srcRow) {
    fills.push(['F' + (++n), targetSheet, row, col0 + 1, header, value, matchKey, srcTab, srcRow]);
  }

  // 1) entity Acct #  ← ledger Account Number  (match on EIN)
  if (ent.cols.acct >= 0 && led.cols.acct >= 0) {
    ent.rows.forEach(function (e) {
      if (e.acct) return;                       // already has a value
      if (!e.ein || e.isSSN) {                  // can't key safely
        if (!e.ein) review.push([ent.name, e.rowNum, 'Acct #', 'no EIN to match on', e.nameRaw]);
        return;
      }
      var matches = (ledByEin[e.ein] || []);
      var val = xfDistinct_(matches, 'acct');
      if (val) pushFill(ent.name, e.rowNum, ent.cols.acct, 'Acct #', val, 'EIN ' + e.ein, led.name,
                        matches.map(function (m) { return m.rowNum; }).join(','));
      else if (matches.length) review.push([ent.name, e.rowNum, 'Acct #', 'EIN matched but account numbers differ/blank', e.nameRaw]);
      else review.push([ent.name, e.rowNum, 'Acct #', 'no ledger row with EIN ' + e.ein, e.nameRaw]);
    });
  }

  // 2) ledger Provider EIN ← entity TIN  (match on strict unique name)
  if (led.cols.ein >= 0 && ent.cols.ein >= 0) {
    led.rows.forEach(function (l) {
      if (l.ein) return;                        // already has EIN
      if (!l.name) return;
      var em = (entByName[l.name] || []).filter(function (r) { return r.ein && !r.isSSN; });
      if (em.length === 1 && ledNameCount[l.name] === 1) {
        pushFill(led.name, l.rowNum, led.cols.ein, 'Provider EIN', em[0].einRaw, 'name "' + l.name + '"', ent.name, em[0].rowNum);
      } else if (em.length) {
        review.push([led.name, l.rowNum, 'Provider EIN', 'ambiguous name match (' + em.length + ' candidates)', l.nameRaw]);
      } else {
        review.push([led.name, l.rowNum, 'Provider EIN', 'no register EIN for this name', l.nameRaw]);
      }
    });
  }

  // 3) entity TIN (EIN) ← ledger Provider EIN  (only where register blank; match on strict unique name)
  if (ent.cols.ein >= 0 && led.cols.ein >= 0) {
    ent.rows.forEach(function (e) {
      if (e.ein || e.isSSN) return;             // has EIN, or is an individual (SSN)
      if (!e.name) return;
      var lm = (ledByName[e.name] || []).filter(function (r) { return r.ein; });
      var val = xfDistinct_(lm, 'einRaw');
      if (val && entNameCount[e.name] === 1) {
        pushFill(ent.name, e.rowNum, ent.cols.ein, 'TIN', val, 'name "' + e.name + '"', led.name,
                 lm.map(function (m) { return m.rowNum; }).join(','));
      } else if (lm.length) {
        review.push([ent.name, e.rowNum, 'TIN', 'ambiguous/duplicate name', e.nameRaw]);
      }
    });
  }

  writeXfTabs_(fills, review);
  return {
    ok: true, fills: fills.length, review: review.length,
    message: 'Preview ready: ' + fills.length + ' confident fill(s) in "' + XF_PREVIEW_ +
             '", ' + review.length + ' to review in "' + XF_REVIEW_ + '". ' +
             'Review the preview, then click Apply.'
  };
}

function writeXfTabs_(fills, review) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var p = ss.getSheetByName(XF_PREVIEW_) || ss.insertSheet(XF_PREVIEW_);
  p.clear();
  var pHead = ['#', 'Target Tab', 'Target Row', 'Target Col', 'Target Field', 'Proposed Value', 'Match Key', 'Source Tab', 'Source Row', 'Status'];
  p.getRange(1, 1, 1, pHead.length).setValues([pHead]).setFontWeight('bold').setBackground('#1B2A4A').setFontColor('#fff');
  if (fills.length) {
    var withStatus = fills.map(function (f) { return f.concat(['PENDING']); });
    p.getRange(2, 1, withStatus.length, pHead.length).setValues(withStatus);
  }
  p.setFrozenRows(1);

  var rv = ss.getSheetByName(XF_REVIEW_) || ss.insertSheet(XF_REVIEW_);
  rv.clear();
  var rHead = ['Tab', 'Row', 'Field', 'Issue', 'Name / EIN'];
  rv.getRange(1, 1, 1, rHead.length).setValues([rHead]).setFontWeight('bold').setBackground('#7a5c00').setFontColor('#fff');
  if (review.length) rv.getRange(2, 1, review.length, rHead.length).setValues(review);
  rv.setFrozenRows(1);
}

// ── Apply ─────────────────────────────────────────────────────────────────────
// Writes the PENDING rows from the preview tab into blank target cells.
function xfApply() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var p = ss.getSheetByName(XF_PREVIEW_);
  if (!p || p.getLastRow() < 2) return { ok: false, message: 'No preview found. Run Preview first.' };

  var data = p.getRange(2, 1, p.getLastRow() - 1, 10).getValues();
  var applied = 0, skipped = 0;
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var status = String(r[9] || '').toUpperCase();
    if (status === 'APPLIED') continue;
    var tab = r[1], row = Number(r[2]), col = Number(r[3]), value = r[5];
    if (!tab || !row || !col) { skipped++; continue; }
    var sheet = ss.getSheetByName(tab);
    if (!sheet) { p.getRange(i + 2, 10).setValue('SKIP: tab gone'); skipped++; continue; }
    var cell = sheet.getRange(row, col);
    if (String(cell.getValue()).trim() !== '') {       // refuse to overwrite
      p.getRange(i + 2, 10).setValue('SKIP: not blank');
      skipped++; continue;
    }
    cell.setValue(value);
    p.getRange(i + 2, 10).setValue('APPLIED');
    applied++;
  }
  return { ok: true, applied: applied, skipped: skipped,
           message: 'Applied ' + applied + ' fill(s); skipped ' + skipped + '.' };
}
