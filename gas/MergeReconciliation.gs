/**
 * MergeReconciliation.gs — the three data merges from the layout-optimization
 * reconciliation (2026-10-08), each idempotent and verifiable.
 *
 * 1. enrichMasterRegisterFromAcctLedger_ — Acct Ledger holds 27 EINs that the
 *    Master Register lacks. Add each missing entity as a new MR-NNN row
 *    (EIN → col D), preserving the rest of the detail in Notes.
 *
 * 2. mergeCreditorData_ — Creditor Registry (20 EINs) and Entities (28 EINs)
 *    are strict subsets of FWM — Creditor Detail (34 EINs). Append their unique
 *    annotation columns to FWM (Source Ref / Notes / EIN Status / Action Items)
 *    matched by EIN, so nothing is lost.
 *
 * 3. mergeValidation_ — confirm _Validation (78 rows) is a superset of the
 *    plain Validation (33 rows); report any enum value that exists only in the
 *    plain copy so it can be carried over before Validation is archived.
 */

var FWM_CREDITOR_TAB_ = 'FWM — Creditor Detail';

// ── 1. Enrich Master Register from Acct Ledger ──────────────────────────────
function enrichMasterRegisterFromAcctLedger_(ss) {
  var al = ss.getSheetByName('Acct Ledger');
  var mr = ss.getSheetByName('Master Register');
  if (!al || !mr) return { status: 'error', message: 'Acct Ledger or Master Register tab not found' };

  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // Existing identity keys in Master Register (name + 9-digit EIN).
  var existing = {};
  var mrLast = mr.getLastRow();
  if (mrLast >= 2) {
    var names = mr.getRange(2, 3, mrLast - 1, 1).getValues();
    var eins = mr.getRange(2, 4, mrLast - 1, 1).getValues();
    for (var i = 0; i < names.length; i++) {
      var n = String(names[i][0] || '').toLowerCase().trim();
      var e = String(eins[i][0] || '').replace(/[^0-9]/g, '');
      if (n) existing['n:' + n] = true;
      if (e.length === 9) existing['e:' + e] = true;
    }
  }

  // Next MR-NNN.
  var nextId = 1;
  if (mrLast >= 2) {
    var ids = mr.getRange(2, 1, mrLast - 1, 1).getValues();
    for (var k = 0; k < ids.length; k++) {
      var m = String(ids[k][0] || '').match(/MR-(\d+)/);
      if (m) nextId = Math.max(nextId, parseInt(m[1], 10) + 1);
    }
  }

  var alLast = al.getLastRow(), alCols = al.getLastColumn();
  var added = [], skipped = [], newRows = [];
  for (var r = 2; r <= alLast; r++) {
    var row = al.getRange(r, 1, 1, alCols).getValues()[0];
    var name = String(row[0] || '').trim();
    var ein = String(row[1] || '').replace(/[^0-9]/g, '');
    if (!name && !ein) continue;
    if (existing['n:' + name.toLowerCase()] || (ein.length === 9 && existing['e:' + ein])) { skipped.push(name); continue; }

    var parts = [];
    if (row[5]) parts.push('Status: ' + row[5]);
    if (row[6]) parts.push('Opened: ' + row[6]);
    if (row[7]) parts.push('Closed: ' + row[7]);
    if (row[8]) parts.push('Limit/High: ' + row[8]);
    if (row[9]) parts.push('Balance: ' + row[9]);
    var addr = [row[4], row[10], row[11], row[12]].filter(function (x) { return x; }).join(', ');
    if (addr) parts.push('Addr: ' + addr);
    if (row[14]) parts.push('Phone: ' + row[14]);
    var notes = 'Merged from Acct Ledger — ' + parts.join(' | ');

    var nr = new Array(29).fill('');
    nr[0] = 'MR-' + String(nextId).padStart(3, '0');
    nr[1] = today;
    nr[2] = name;
    nr[3] = ein;
    nr[4] = String(row[2] || '');
    nr[5] = String(row[3] || '');
    nr[26] = notes;
    nr[28] = 'Known';
    newRows.push(nr);
    if (name) existing['n:' + name.toLowerCase()] = true;
    if (ein.length === 9) existing['e:' + ein] = true;
    added.push(name);
    nextId++;
  }

  // Find true last data row (last "MR-" in col A) — skip any legend/trailing rows.
  var lastDataRow = 1;
  if (mrLast >= 2) {
    var idCol = mr.getRange(2, 1, mrLast - 1, 1).getValues();
    for (var q = 0; q < idCol.length; q++) {
      if (String(idCol[q][0] || '').match(/^MR-/)) lastDataRow = 2 + q;
    }
  }

  if (newRows.length) {
    mr.getRange(lastDataRow + 1, 1, newRows.length, 29).setValues(newRows);
    SpreadsheetApp.flush();
  }
  return { status: 'ok', action: 'enrichMasterRegister', added: added.length, addedNames: added, skipped: skipped.length };
}

// ── 2. Merge Creditor Registry + Entities into FWM ─────────────────────────
function mergeCreditorData_(ss) {
  var fwm = ss.getSheetByName(FWM_CREDITOR_TAB_);
  if (!fwm) return { status: 'error', message: 'FWM — Creditor Detail not found' };

  // FWM layout: row1 banner, row2 header (11 cols: Tab#,Obligor,Creditor,EIN,TIN,NameType,Addr,City,State,ZIP,Country), row3+ data.
  var fwmLast = fwm.getLastRow();
  var fwmCols = fwm.getLastColumn();

  // Direct, robust header extension: write the 4 labels to row 2, cols 12-15.
  fwm.getRange(2, 12, 1, 4).setValues([['Source Ref', 'Notes', 'EIN Status', 'Action Items']]);

  // Map FWM EIN -> row.
  var fwmEins = {};
  if (fwmLast >= 3) {
    var fe = fwm.getRange(3, 4, fwmLast - 2, 1).getValues();
    for (var i = 0; i < fe.length; i++) {
      var e = String(fe[i][0] || '').replace(/[^0-9]/g, '');
      if (e.length === 9) fwmEins[e] = 3 + i;
    }
  }

  var out = { creditorRegistry: { matched: 0, unmatched: [] }, entities: { matched: 0, unmatched: [] } };

  // Creditor Registry: banner r1, note r2, header r3 (12 cols, EIN col4, Source Ref col11, Notes col12), data r4+.
  var cr = ss.getSheetByName('Creditor Registry');
  if (cr) {
    var crLast = cr.getLastRow(), crCols = cr.getLastColumn();
    for (var r = 4; r <= crLast; r++) {
      var row = cr.getRange(r, 1, 1, crCols).getValues()[0];
      var ein = String(row[3] || '').replace(/[^0-9]/g, '');
      if (ein.length !== 9) continue;
      var target = fwmEins[ein];
      if (!target) { out.creditorRegistry.unmatched.push(ein); continue; }
      if (row[10] != null) fwm.getRange(target, 12).setValue(row[10]);       // Source Ref
      if (row[11] != null) fwm.getRange(target, 13).setValue(row[11]);       // Notes
      out.creditorRegistry.matched++;
    }
  }

  // Entities: banner r1, header r2 (#,Entity,Acct#,EIN,EIN Status,Verified Name,Source,Addr,AddrStatus,AddrNotes,Overall,Action), data r3+.
  var ent = ss.getSheetByName('Entities');
  if (ent) {
    var entLast = ent.getLastRow(), entCols = ent.getLastColumn();
    for (var r2 = 3; r2 <= entLast; r2++) {
      var erow = ent.getRange(r2, 1, 1, entCols).getValues()[0];
      var ein2 = String(erow[3] || '').replace(/[^0-9]/g, '');
      if (ein2.length !== 9) continue;
      var t2 = fwmEins[ein2];
      if (!t2) { out.entities.unmatched.push(ein2); continue; }
      if (erow[4] != null) fwm.getRange(t2, 14).setValue(erow[4]);  // EIN Status
      if (erow[11] != null) fwm.getRange(t2, 15).setValue(erow[11]); // Action Items
      out.entities.matched++;
    }
  }

  SpreadsheetApp.flush();
  return { status: 'ok', action: 'mergeCreditorData', fwmEins: Object.keys(fwmEins).length, out: out };
}

// ── 3. Validation superset check ───────────────────────────────────────────
function mergeValidation_(ss) {
  var plain = ss.getSheetByName('Validation');
  var under = ss.getSheetByName('_Validation');
  if (!under) return { status: 'error', message: '_Validation not found' };

  var underVals = new Set();
  var uLast = under.getLastRow(), uCols = under.getLastColumn();
  under.getRange(1, 1, uLast, uCols).getValues().forEach(function (row) {
    row.forEach(function (v) { if (v !== '' && v != null) underVals.add(String(v).trim()); });
  });

  var onlyPlain = [];
  if (plain) {
    var pLast = plain.getLastRow(), pCols = plain.getLastColumn();
    plain.getRange(1, 1, pLast, pCols).getValues().forEach(function (row) {
      row.forEach(function (v) {
        if (v !== '' && v != null) {
          var s = String(v).trim();
          if (!underVals.has(s)) onlyPlain.push(s);
        }
      });
    });
  }

  return {
    status: 'ok',
    action: 'mergeValidation',
    underscoreUniqueCount: underVals.size,
    onlyInPlainValidation: onlyPlain,
    safeToArchivePlain: onlyPlain.length === 0
  };
}

// ── 4. Dedupe the rows this enrichment added (same name+EIN+acct#) ───────────
// Only touches rows whose Notes carry 'Merged from Acct Ledger', so pre-existing
// same-name/different-holder pairs (e.g. the two Capital One rows) are untouched.
function dedupeMasterRegister_(ss) {
  var mr = ss.getSheetByName('Master Register');
  if (!mr) return { status: 'error', message: 'Master Register not found' };

  var lastRow = mr.getLastRow();
  var seen = {};
  var rowsToDelete = [];
  for (var r = 2; r <= lastRow; r++) {
    var vals = mr.getRange(r, 1, 1, 29).getValues()[0];
    var notes = String(vals[26] || '');
    if (notes.indexOf('Merged from Acct Ledger') === -1) continue;
    var name = String(vals[2] || '').toLowerCase().trim();
    var ein = String(vals[3] || '').replace(/[^0-9]/g, '');
    var acct = String(vals[4] || '').toLowerCase().trim();
    var key = name + '|' + ein + '|' + acct;
    if (seen[key]) {
      rowsToDelete.push(r);
    } else {
      seen[key] = true;
    }
  }
  rowsToDelete.sort(function (a, b) { return b - a; });
  rowsToDelete.forEach(function (row) { mr.deleteRow(row); });
  SpreadsheetApp.flush();
  return { status: 'ok', action: 'dedupeMasterRegister', removed: rowsToDelete.length };
}
