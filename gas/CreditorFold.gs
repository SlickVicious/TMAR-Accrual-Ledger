/**
 * One-shot fold of the legacy "Creditor Registry" into the canonical
 * "FWM — Creditor Detail" tab, then reconcile "FWM — Forms Checklist"
 * so it mirrors the Detail 1:1.
 *
 * Steps (all reversible — the registry is renamed + hidden, never deleted):
 *   1. Back up Creditor Registry  → hidden "Creditor Registry_PreFold_<ts>".
 *   2. Add SOURCE REF (col L) + NOTES (col M) to FWM — Creditor Detail.
 *   3. Map each registry row onto its Detail row:
 *        SOURCE REF "S-###"  → direct Tab # hit;
 *        SOURCE REF "MR-###" → fall back to an EIN match (e.g. BOA).
 *   4. Append any registry creditor missing from Detail (e.g. PNC) as a new row,
 *      preserving its EIN value verbatim (even "TBD — Verify").
 *   5. Append missing rows to FWM — Forms Checklist so it mirrors Detail 1:1.
 *
 * Idempotent: if Creditor Registry no longer exists it returns a no-op error
 * (it has already been folded) and touches nothing.
 */
function foldCreditorRegistry_(ss) {
  var log = [];
  var ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');

  // ── 0. Read the registry BEFORE renaming it ─────────────────────
  var reg = ss.getSheetByName('Creditor Registry');
  if (!reg) {
    return { status: 'error', action: 'foldCreditorRegistry', message: 'Creditor Registry not found (already folded — see hidden "_PreFold" backup)' };
  }
  var regVals = reg.getDataRange().getValues();

  var regRows = [];
  for (var i = 0; i < regVals.length; i++) {
    var r = regVals[i];
    var tab = String(r[0] || '').trim();
    if (/^(T|C)-\d{3}$/.test(tab)) {
      regRows.push({
        tab: tab,
        payer: String(r[1] || '').trim(),
        creditor: String(r[2] || '').trim(),
        ein: String(r[3] || '').trim(),
        addr: String(r[6] || '').trim(),
        city: String(r[7] || '').trim(),
        state: String(r[8] || '').trim(),
        zip: String(r[9] || '').trim(),
        src: String(r[10] || '').trim(),
        notes: String(r[11] || '').trim()
      });
    }
  }

  // ── 1. Back up the registry (rename + hide) ─────────────────────
  var backupName = 'Creditor Registry_PreFold_' + ts;
  reg.setName(backupName);
  reg.hideSheet();
  log.push('Backed up Creditor Registry → hidden "' + backupName + '"');

  // ── 2. Open Detail; add SOURCE REF + NOTES header columns ───────
  var cd = ss.getSheetByName('FWM — Creditor Detail');
  if (!cd) {
    return { status: 'error', action: 'foldCreditorRegistry', message: 'FWM — Creditor Detail not found (registry already renamed — restore from "' + backupName + '")' };
  }

  var cdLastRow = cd.getLastRow();
  var cdVals = cd.getRange(1, 1, cdLastRow, 11).getValues(); // A..K only

  cd.getRange(2, 12).setValue('SOURCE REF'); // L (header row is row 2)
  cd.getRange(2, 13).setValue('NOTES');      // M

  // Index Detail rows by Tab # (1-based row number).
  var byTab = {};
  for (var a = 2; a < cdVals.length; a++) {
    var t = String(cdVals[a][0] || '').trim();
    if (/^[CS]-\d{3}$/.test(t)) byTab[t] = a + 1;
  }

  // ── 3. Map registry rows → Detail rows ──────────────────────────
  var mapped = [], unmatched = [];
  for (var j = 0; j < regRows.length; j++) {
    var rr = regRows[j];
    var target = null;

    if (/^[CS]-\d{3}$/.test(rr.src)) target = byTab[rr.src] || null;

    if (!target && /^\d{2}-\d{7}$/.test(rr.ein)) {
      // MR-### fallback: match by EIN, preferring an exact creditor-name match.
      for (var k = 2; k < cdVals.length; k++) {
        if (String(cdVals[k][3] || '').trim() === rr.ein) {
          var nm = String(cdVals[k][2] || '').trim().toLowerCase();
          if (nm === rr.creditor.toLowerCase()) { target = k + 1; break; }
          if (!target) target = k + 1;
        }
      }
    }

    if (target) {
      cd.getRange(target, 12).setValue(rr.src);
      cd.getRange(target, 13).setValue(rr.notes);
      mapped.push({ registryTab: rr.tab, src: rr.src, detailRow: target, creditor: rr.creditor });
    } else {
      unmatched.push(rr);
    }
  }

  // ── 4. Append unmatched creditors (e.g. PNC) as new Detail rows ─
  var appended = [];
  var next = { C: 0, S: 0 };
  for (var b = 2; b < cdVals.length; b++) {
    var mm = String(cdVals[b][0] || '').trim().match(/^([CS])-(\d{3})$/);
    if (mm) { var pp = mm[1], nn = parseInt(mm[2], 10); if (nn > next[pp]) next[pp] = nn; }
  }
  for (var u = 0; u < unmatched.length; u++) {
    var uu = unmatched[u];
    var prefix = uu.payer.toLowerCase().indexOf('syrina') >= 0 ? 'S' : 'C';
    next[prefix] = next[prefix] + 1;
    var newTab = prefix + '-' + String(next[prefix]).padStart(3, '0');
    var newRow = [newTab, uu.payer, uu.creditor, uu.ein, 'EIN', 'B', uu.addr, uu.city, uu.state, uu.zip, 'US', uu.src, uu.notes];
    cd.appendRow(newRow);
    appended.push({ newTab: newTab, creditor: uu.creditor, ein: uu.ein, src: uu.src, notes: uu.notes });
  }
  SpreadsheetApp.flush();

  // ── 5. Reconcile Forms Checklist to mirror Detail ───────────────
  var fc = ss.getSheetByName('FWM — Forms Checklist');
  var fcAdded = [];
  if (fc) {
    var fcLastRow = fc.getLastRow();
    var fcTabs = {};
    for (var c2 = 1; c2 <= fcLastRow; c2++) {
      var ft = String(fc.getRange(c2, 1).getValue() || '').trim();
      if (/^[CS]-\d{3}$/.test(ft)) fcTabs[ft] = true;
    }
    var cdAfter = cd.getRange(1, 1, cd.getLastRow(), 4).getValues(); // Tab#, Obligor, Creditor, EIN
    for (var d2 = 2; d2 < cdAfter.length; d2++) {
      var dt = String(cdAfter[d2][0] || '').trim();
      if (/^[CS]-\d{3}$/.test(dt) && !fcTabs[dt]) {
        var fcRow = [
          dt,
          String(cdAfter[d2][1] || '').trim(),
          String(cdAfter[d2][2] || '').trim(),
          String(cdAfter[d2][3] || '').trim()
        ];
        fc.appendRow(fcRow);
        fcAdded.push(dt);
      }
    }
    SpreadsheetApp.flush();
  } else {
    log.push('FWM — Forms Checklist not found — skipped');
  }

  return {
    status: 'ok',
    action: 'foldCreditorRegistry',
    registryRows: regRows.length,
    mapped: mapped.length,
    mappedDetail: mapped,
    appended: appended,
    checklistRowsAdded: fcAdded,
    backupName: backupName,
    log: log
  };
}

/**
 * Corrective pass: the column header for "FWM — Creditor Detail" lives one row
 * lower than the fold assumed (row 1 = banner, row 2 = subtitle, row 3 = the
 * "Tab # | Obligor | …" header). This relocates the SOURCE REF / NOTES labels
 * onto the real header row and clears the stray copies left on the subtitle row.
 */
function fixCreditorDetailHeader_(ss) {
  var cd = ss.getSheetByName('FWM — Creditor Detail');
  if (!cd) return { status: 'error', action: 'fixCreditorDetailHeader', message: 'FWM — Creditor Detail not found' };

  var lastRow = cd.getLastRow();
  var lastCol = cd.getLastColumn();
  var vals = cd.getRange(1, 1, lastRow, lastCol).getValues();

  var headerIdx = -1;
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0] || '').trim() === 'Tab #') { headerIdx = i; break; }
  }
  if (headerIdx < 0) return { status: 'error', action: 'fixCreditorDetailHeader', message: 'Header row ("Tab #") not found' };

  var log = [];
  // Write the correct labels onto the real header row (cols L, M).
  cd.getRange(headerIdx + 1, 12).setValue('SOURCE REF');
  cd.getRange(headerIdx + 1, 13).setValue('NOTES');
  log.push('Set SOURCE REF / NOTES on header row ' + (headerIdx + 1));

  // Clear stray labels left on the subtitle/banner rows.
  for (var r = 0; r < vals.length; r++) {
    if (r === headerIdx) continue;
    var c0 = String(vals[r][0] || '').trim();
    if (/^[CS]-\d{3}$/.test(c0)) continue; // never touch data rows
    var c12 = String(vals[r][11] || '').trim();
    var c13 = String(vals[r][12] || '').trim();
    if (c12 === 'SOURCE REF' || c13 === 'NOTES') {
      cd.getRange(r + 1, 12).setValue('');
      cd.getRange(r + 1, 13).setValue('');
      log.push('Cleared stray labels on row ' + (r + 1));
    }
  }
  SpreadsheetApp.flush();
  return { status: 'ok', action: 'fixCreditorDetailHeader', headerRow: headerIdx + 1, log: log };
}
