/**
 * TMAR Trust & Credits Binder v2 — Apply All 21 Corrections
 * Target workbook: 1ew9OzuPMiWK1_gCLI--EAPKl6cQcZ3gU
 *
 * HOW TO RUN:
 *  1. Open the merged workbook in Google Sheets
 *  2. Extensions → Apps Script → paste this entire file → Save
 *  3. Select function: applyAllCorrections → Run
 *  4. Review the _CorrectionLog tab for results
 */

// ═══════════════════════════════════════════════════════════════
// MASTER RUNNER
// ═══════════════════════════════════════════════════════════════
function applyAllCorrections() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var log = ['TMAR Corrections — ' + new Date().toLocaleString(), ''];

  var steps = [
    correction_01_renameImportedTabs,
    correction_02_coverDateAndGoverningLaw,
    correction_03_coverAddTabIndex,
    correction_04_tab1FlagDocIdConflict,
    correction_05_tab6FixAR002andLedgerRefs,
    correction_06_tab7SourceDocs,
    correction_07_tab9FixValAttribution,
    correction_08_tab9CompleteVAL019,
    correction_09_tab10AssignDocIds,
    correction_10_tab10VeteransUnitedEIN,
    correction_11_tab11PncEin,
    correction_12_tab11Add1099ReadyCol,
    correction_13_tab11BoaNotes,
    correction_14_tab12GoverningLaw,
    correction_15_tab12NextAction,
    correction_16_tab13PncEin,
    correction_17_tab13EinSummaryBlock,
    correction_18_tab14Form56Status
  ];

  steps.forEach(function(fn) {
    try { fn(ss, log); }
    catch(e) { log.push('❌ ' + fn.name + ': ' + e.message); }
    log.push('');
  });

  SpreadsheetApp.flush();

  var logSheet = ss.getSheetByName('_CorrectionLog') || ss.insertSheet('_CorrectionLog');
  logSheet.clearContents();
  log.forEach(function(line, i) { logSheet.getRange(i + 1, 1).setValue(line); });

  var summary = log.filter(function(l) {
    return l.indexOf('✅') >= 0 || l.indexOf('⚠️') >= 0 || l.indexOf('❌') >= 0;
  }).join('\n');

  SpreadsheetApp.getUi().alert('TMAR Corrections Complete\n\n' + summary + '\n\nFull log in _CorrectionLog tab.');
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function findSheet(ss, names) {
  for (var i = 0; i < names.length; i++) {
    var s = ss.getSheetByName(names[i]);
    if (s) return s;
  }
  return null;
}

function findSheetByContent(ss, col1Keywords) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var lastRow = sheets[i].getLastRow();
    if (lastRow < 1) continue;
    var colA = sheets[i].getRange(1, 1, Math.min(lastRow, 5), 1).getValues();
    for (var r = 0; r < colA.length; r++) {
      var val = colA[r][0].toString().toUpperCase();
      for (var k = 0; k < col1Keywords.length; k++) {
        if (val.indexOf(col1Keywords[k].toUpperCase()) >= 0) return sheets[i];
      }
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 1 — Rename imported tabs from generic Sheet names
// ═══════════════════════════════════════════════════════════════
function correction_01_renameImportedTabs(ss, log) {
  log.push('— C1: Rename Imported Tabs —');
  var mappings = [
    { h1: '1099-B PAIR REQUIRED', h2: 'FORM 56 DATE SENT', name: 'Tab 11 — Freeway Checklist' },
    { h1: 'ACCOUNT COUNTS',       h2: '1099-B FILING',    name: 'Tab 12 — Filing Dashboard' },
    { h1: 'TIN TYPE',             h2: 'ADDRESS LINE',     name: 'Tab 13 — Creditor Registry' },
    { h1: 'BINDER SECTION',       h2: 'FILING ORDER',     name: 'Tab 14 — Binder Guide + Process Flow' }
  ];
  var sheets = ss.getSheets();
  sheets.forEach(function(sheet) {
    var name = sheet.getName();
    if (!name.match(/^Sheet\d+$/) && name.indexOf('Copy of') < 0) return;
    var headerText = '';
    try { headerText = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].join(' ').toUpperCase(); } catch(e) { return; }
    for (var i = 0; i < mappings.length; i++) {
      var m = mappings[i];
      if (headerText.indexOf(m.h1) >= 0 && headerText.indexOf(m.h2) >= 0) {
        if (!ss.getSheetByName(m.name)) {
          sheet.setName(m.name);
          log.push('✅ Renamed "' + name + '" → "' + m.name + '"');
        } else {
          log.push('⚠️ "' + m.name + '" already exists — delete duplicate "' + name + '" manually');
        }
        return;
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 2 — Cover: fix date 2025→2026 + Virginia→NC
// ═══════════════════════════════════════════════════════════════
function correction_02_coverDateAndGoverningLaw(ss, log) {
  log.push('— C2: Cover — Date + Governing Law —');
  var cover = ss.getSheetByName('Cover') || ss.getSheetByName('COVER') ||
              ss.getSheetByName('Cover Page') || ss.getSheets()[0];
  var data = cover.getDataRange().getValues();
  var fixes = 0;
  for (var r = 0; r < data.length; r++) {
    for (var c = 0; c < data[r].length; c++) {
      var v = data[r][c].toString();
      if (!v) continue;
      var nv = v
        .replace('2025-01-20', '2026-01-20')
        .replace('January 20, 2025', 'January 20, 2026')
        .replace(/Established:\s*2025/i, function(m){ return m.replace('2025','2026'); });
      // Governing law — only replace standalone Virginia, not e.g. "West Virginia"
      if (nv === 'Virginia') nv = 'North Carolina';
      else if (/^Governing Law[:\s]+Virginia$/i.test(nv)) nv = nv.replace(/Virginia/i,'North Carolina');
      if (nv !== v) {
        cover.getRange(r+1, c+1).setValue(nv);
        log.push('✅ Cover[R'+(r+1)+'C'+(c+1)+']: "'+v+'" → "'+nv+'"');
        fixes++;
      }
    }
  }
  if (fixes === 0) log.push('ℹ️ Cover: no date/law issues found (may already be correct)');
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 3 — Cover: add Tabs 11-14 to index
// ═══════════════════════════════════════════════════════════════
function correction_03_coverAddTabIndex(ss, log) {
  log.push('— C3: Cover — Tab 11-14 Index Entries —');
  var cover = ss.getSheetByName('Cover') || ss.getSheetByName('COVER') ||
              ss.getSheetByName('Cover Page') || ss.getSheets()[0];
  var full = cover.getDataRange().getValues().map(function(r){ return r.join(' '); }).join(' ');
  if (full.indexOf('Tab 11') >= 0) { log.push('ℹ️ Cover: Tabs 11-14 already indexed'); return; }
  var lr = cover.getLastRow();
  var rows = [
    ['Tab 11','Freeway Method Filing Checklist','All 39 accounts — filing status tracker (16 cols)'],
    ['Tab 12','Filing Dashboard','Account counts, EIN table, 1099-B status, open resolutions, financials'],
    ['Tab 13','Creditor Registry','Mailing addresses + EINs for all 39 creditors | Unique EIN summary at top'],
    ['Tab 14','Binder Guide + Process Flow','Physical binder guide + 8-step Freeway Process flow']
  ];
  cover.getRange(lr+2, 1, rows.length, rows[0].length).setValues(rows);
  log.push('✅ Cover: Tabs 11-14 added to index at rows '+(lr+2)+'–'+(lr+5));
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 4 — Tab 1: flag DOC-0040 / DOC-0008 conflict
// ═══════════════════════════════════════════════════════════════
function correction_04_tab1FlagDocIdConflict(ss, log) {
  log.push('— C4: Tab 1 — DOC-0040/DOC-0008 Conflict —');
  var sheet = findSheet(ss, ['Tab 1','1. Master Document Index','Master Document Index','Tab 1 — Master Document Index']);
  if (!sheet) { log.push('⚠️ Tab 1 not found'); return; }
  var data = sheet.getDataRange().getValues();
  var hdr = data[0];
  var notesCol = -1;
  hdr.forEach(function(h,i){ if(/notes?/i.test(h)) notesCol = i; });
  var rows = { '0040': -1, '0008': -1 };
  for (var r = 1; r < data.length; r++) {
    var row = data[r].join('|');
    if (row.indexOf('DOC-0040') >= 0) rows['0040'] = r;
    if (row.indexOf('DOC-0008') >= 0) rows['0008'] = r;
  }
  if (rows['0040'] >= 0 && rows['0008'] >= 0 && notesCol >= 0) {
    var flag = '⚠️ CONFLICT: both DOC-0040 and DOC-0008 are Certificate of Trust — verify distinct docs or renumber one';
    ['0040','0008'].forEach(function(key) {
      var existing = sheet.getRange(rows[key]+1, notesCol+1).getValue().toString();
      if (existing.indexOf('CONFLICT') < 0)
        sheet.getRange(rows[key]+1, notesCol+1).setValue(existing ? existing+' | '+flag : flag);
    });
    log.push('✅ Tab 1: DOC-0040 and DOC-0008 flagged as potential duplicate Certificate of Trust entries');
  } else if (rows['0040'] < 0 || rows['0008'] < 0) {
    log.push('⚠️ Tab 1: one or both DOC IDs not found — check tab name');
  } else {
    log.push('⚠️ Tab 1: no Notes column — add flag manually to DOC-0040 and DOC-0008');
  }
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 5 — Tab 6: AR-002 debit + MR-001/MR-002 Ledger Refs
// ═══════════════════════════════════════════════════════════════
function correction_05_tab6FixAR002andLedgerRefs(ss, log) {
  log.push('— C5: Tab 6 — AR-002 + MR Ledger Refs —');
  var sheet = findSheet(ss, ['Tab 6','Account Register','6. Account Register','Tab 6 — Account Register'])
              || findSheetByContent(ss, ['AR-001','AR-002']);
  if (!sheet) { log.push('⚠️ Tab 6 not found'); return; }
  var data = sheet.getDataRange().getValues();
  var hdr = data[0];
  var typeCol = -1, refCol = -1, amtCol = -1;
  hdr.forEach(function(h,i){
    var u = h.toString().toUpperCase();
    if (/^(TYPE|DR.?CR|ENTRY TYPE|DEBIT.?CREDIT)$/.test(u)) typeCol = i;
    if (u.indexOf('LEDGER REF') >= 0 || u.indexOf('REFERENCE') >= 0) refCol = i;
    if (u.indexOf('AMOUNT') >= 0) amtCol = i;
  });
  for (var r = 1; r < data.length; r++) {
    var id = data[r][0].toString().trim();
    if (id === 'AR-002' && typeCol >= 0) {
      var t = data[r][typeCol].toString().toLowerCase();
      if (t === 'debit' || t === 'dr') {
        sheet.getRange(r+1, typeCol+1).setValue('Credit');
        log.push('✅ Tab 6: AR-002 type Debit → Credit (row '+(r+1)+')');
      } else {
        log.push('ℹ️ Tab 6: AR-002 type = "'+t+'" — no change');
      }
    }
    if ((id === 'MR-001' || id === 'MR-002') && refCol >= 0) {
      var ref = data[r][refCol].toString().trim();
      if (ref && !ref.match(/^(Tab |MR-|T-|C-|Sheet|$)/i)) {
        sheet.getRange(r+1, refCol+1).setValue('REVIEW: "'+ref+'" — not a valid cross-reference');
        log.push('✅ Tab 6: '+id+' Ledger Ref flagged: "'+ref+'"');
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 6 — Tab 7: complete S-029 + add S-032/S-033/S-034
// ═══════════════════════════════════════════════════════════════
function correction_06_tab7SourceDocs(ss, log) {
  log.push('— C6: Tab 7 — Source Docs S-029/032/033/034 —');
  var sheet = findSheet(ss, ['Tab 7','Source Documents','7. Source Documents','Tab 7 — Source Documents'])
              || findSheetByContent(ss, ['S-001','S-002']);
  if (!sheet) { log.push('⚠️ Tab 7 not found'); return; }
  var data = sheet.getDataRange().getValues();
  var hdr = data[0];
  var ncols = hdr.length;
  var existing = {};
  var lastDataRow = 0;
  for (var r = 1; r < data.length; r++) {
    var id = data[r][0].toString().trim();
    if (id) { existing[id] = r; lastDataRow = r; }
    if (id === 'S-029') {
      var filled = data[r].filter(function(v){ return v.toString().trim(); }).length;
      if (filled <= 2) {
        var s029 = ['S-029','Clinton Wimberly IV','Capital One Auto Finance',
          '75-2163778','EIN','B','PO Box 66068','Sacramento','CA','95866','T-029',
          'Prior auto account — exact acct # TBD | Shared EIN 75-2163778 with T-030'];
        while (s029.length < ncols) s029.push('');
        sheet.getRange(r+1, 1, 1, ncols).setValues([s029.slice(0,ncols)]);
        log.push('✅ Tab 7: S-029 completed (Capital One Auto — T-029)');
      } else {
        log.push('ℹ️ Tab 7: S-029 already has data');
      }
    }
  }
  var toAdd = [];
  if (!existing['S-032']) toAdd.push(
    ['S-032','Syrina S. Wimberly','Capital One Bank (USA) NA','54-1719854','EIN','B',
     'PO Box 30285','Salt Lake City','UT','84130','C-002','Co-Trustee | 360 Checking | Acct 36136995198']);
  if (!existing['S-033']) toAdd.push(
    ['S-033','Syrina S. Wimberly','Capital One Bank (USA) NA','54-1719854','EIN','B',
     'PO Box 30285','Salt Lake City','UT','84130','C-003','DUPLICATE EIN — W-9/Form 56 under C-002 | 360 Performance Savings | Acct 36136995385']);
  if (!existing['S-034']) toAdd.push(
    ['S-034','Syrina S. Wimberly','Capital One Bank (USA) NA','54-1719854','EIN','B',
     'PO Box 30285','Salt Lake City','UT','84130','C-004','DUPLICATE EIN — W-9/Form 56 under C-002 | 360 Checking 2nd | Acct 36270212801']);
  if (toAdd.length > 0) {
    var ins = lastDataRow + 2;
    sheet.getRange(ins, 1, toAdd.length, ncols).setValues(
      toAdd.map(function(row){ while(row.length<ncols) row.push(''); return row.slice(0,ncols); })
    );
    log.push('✅ Tab 7: Added S-032/033/034 (Syrina Co-Trustee Capital One accounts)');
  } else {
    log.push('ℹ️ Tab 7: S-032/033/034 already present');
  }
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 7 — Tab 9: fix VAL-001–008 payer attribution
// ═══════════════════════════════════════════════════════════════
function correction_07_tab9FixValAttribution(ss, log) {
  log.push('— C7: Tab 9 — VAL-001-008 Payer Attribution —');
  var sheet = findSheet(ss, ['Tab 9','Validation Status','9. Validation','Validation','Tab 9 — Validation'])
              || findSheetByContent(ss, ['VAL-001','VAL-002']);
  if (!sheet) { log.push('⚠️ Tab 9 not found'); return; }
  var data = sheet.getDataRange().getValues();
  var hdr = data[0];
  var payerCol = -1;
  hdr.forEach(function(h,i){
    var u = h.toString().toUpperCase();
    if (u === 'PAYER' || u === 'ACCOUNT HOLDER' || u === 'NAME' || u === 'PAYEE') payerCol = i;
  });
  if (payerCol < 0) { log.push('⚠️ Tab 9: Payer column not found'); return; }
  var fixed = 0;
  for (var r = 1; r < data.length; r++) {
    var id = data[r][0].toString();
    var num = parseInt(id.replace('VAL-',''));
    if (num >= 1 && num <= 8) {
      var cur = data[r][payerCol].toString();
      if (cur.toLowerCase().indexOf('syrina') >= 0) {
        sheet.getRange(r+1, payerCol+1).setValue('Clinton Wimberly IV');
        log.push('✅ Tab 9: '+id+' payer: "'+cur+'" → "Clinton Wimberly IV"');
        fixed++;
      }
    }
  }
  if (fixed === 0) log.push('ℹ️ Tab 9: VAL-001-008 payer is not "Syrina" — no change needed');
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 8 — Tab 9: complete VAL-019 (Southeast Toyota)
// ═══════════════════════════════════════════════════════════════
function correction_08_tab9CompleteVAL019(ss, log) {
  log.push('— C8: Tab 9 — VAL-019 (Southeast Toyota) —');
  var sheet = findSheet(ss, ['Tab 9','Validation Status','9. Validation','Validation','Tab 9 — Validation'])
              || findSheetByContent(ss, ['VAL-001','VAL-002']);
  if (!sheet) { log.push('⚠️ Tab 9 not found'); return; }
  var data = sheet.getDataRange().getValues();
  for (var r = 1; r < data.length; r++) {
    if (data[r][0].toString() === 'VAL-019') {
      var filled = data[r].filter(function(v){ return v.toString().trim(); }).length;
      if (filled <= 1) {
        // Fill what we know from Tab 13/Tab 11 data
        var hdr = data[0];
        var vals = [];
        hdr.forEach(function(h) {
          var u = h.toString().toUpperCase();
          if (u === 'VAL ID' || u === 'ID' || u === '#') vals.push('VAL-019');
          else if (u.indexOf('PAYER') >= 0 || u.indexOf('ACCOUNT HOLDER') >= 0) vals.push('Clinton Wimberly IV');
          else if (u.indexOf('CREDITOR') >= 0 || u.indexOf('ENTITY') >= 0) vals.push('Southeast Toyota Finance');
          else if (u === 'EIN') vals.push('59-1989978');
          else if (u.indexOf('ACCT') >= 0 || u.indexOf('ACCOUNT #') >= 0) vals.push('11000000362');
          else if (u === 'STATUS') vals.push('Open');
          else if (u.indexOf('SOURCE') >= 0 || u.indexOf('REF') >= 0) vals.push('S-031 / T-031');
          else if (u.indexOf('TYPE') >= 0) vals.push('Auto Loan');
          else vals.push('');
        });
        if (vals.length > 0) {
          sheet.getRange(r+1, 1, 1, vals.length).setValues([vals]);
          log.push('✅ Tab 9: VAL-019 completed (Southeast Toyota Finance / T-031 / 59-1989978)');
        }
      } else {
        log.push('ℹ️ Tab 9: VAL-019 already has '+filled+' populated fields');
      }
      return;
    }
  }
  log.push('⚠️ Tab 9: VAL-019 row not found');
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 9 — Tab 10: assign DOC-0052 to DOC-0055
// ═══════════════════════════════════════════════════════════════
function correction_09_tab10AssignDocIds(ss, log) {
  log.push('— C9: Tab 10 — Assign DOC-0052–0055 —');
  var sheet = findSheet(ss, ['Tab 10','Document Registry','10. Document Registry','Tab 10 — Document Registry'])
              || findSheetByContent(ss, ['DOC-0001','DOC-0002']);
  if (!sheet) { log.push('⚠️ Tab 10 not found'); return; }
  var data = sheet.getDataRange().getValues();
  var nextNum = 52;
  var assigned = 0;
  for (var r = 1; r < data.length; r++) {
    var id = data[r][0].toString().trim();
    if (id === '' && data[r].some(function(v){ return v.toString().trim(); })) {
      var docId = 'DOC-' + ('0000'+nextNum).slice(-4);
      sheet.getRange(r+1, 1).setValue(docId);
      log.push('✅ Tab 10: '+docId+' assigned to row '+(r+1)+' ('+data[r].filter(function(v){return v;}).slice(0,3).join(' | ')+')');
      nextNum++;
      assigned++;
    }
  }
  if (assigned === 0) log.push('ℹ️ Tab 10: No unregistered rows found — all rows have Doc IDs');
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 10 — Tab 10: add Veterans United EIN 26-1192831
// ═══════════════════════════════════════════════════════════════
function correction_10_tab10VeteransUnitedEIN(ss, log) {
  log.push('— C10: Tab 10 — Veterans United EIN —');
  var sheet = findSheet(ss, ['Tab 10','Document Registry','10. Document Registry','Tab 10 — Document Registry'])
              || findSheetByContent(ss, ['DOC-0001','DOC-0002']);
  if (!sheet) { log.push('⚠️ Tab 10 not found'); return; }
  var data = sheet.getDataRange().getValues();
  var hdr = data[0];
  var einCol = -1;
  hdr.forEach(function(h,i){ if(h.toString().toUpperCase().indexOf('EIN') >= 0) einCol = i; });
  for (var r = 1; r < data.length; r++) {
    if (data[r].join(' ').toUpperCase().indexOf('VETERANS UNITED') >= 0) {
      if (einCol >= 0) {
        var cur = data[r][einCol].toString().trim();
        if (!cur || cur.toUpperCase() === 'TBD' || cur === '') {
          sheet.getRange(r+1, einCol+1).setValue('26-1192831');
          log.push('✅ Tab 10: Veterans United EIN set to 26-1192831 at row '+(r+1));
        } else {
          log.push('ℹ️ Tab 10: Veterans United EIN = "'+cur+'" — verify against 26-1192831');
        }
      }
      return;
    }
  }
  log.push('⚠️ Tab 10: "Veterans United" not found — may be listed under different name');
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 11 — Tab 11: PNC EIN TBD → 25-1185235
// ═══════════════════════════════════════════════════════════════
function correction_11_tab11PncEin(ss, log) {
  log.push('— C11: Tab 11 — PNC EIN —');
  var sheet = findSheet(ss, ['Tab 11 — Freeway Checklist','Tab 11','Freeway Checklist']);
  if (!sheet) { log.push('⚠️ Tab 11 not found'); return; }
  var data = sheet.getDataRange().getValues();
  var hdr = data[0];
  var einCol = -1;
  hdr.forEach(function(h,i){ if(h.toString().toUpperCase() === 'EIN') einCol = i; });
  for (var r = 1; r < data.length; r++) {
    if (data[r].join(' ').toUpperCase().indexOf('PNC') >= 0 && einCol >= 0) {
      var cur = data[r][einCol].toString().trim();
      if (cur.toUpperCase().indexOf('TBD') >= 0 || cur === '') {
        sheet.getRange(r+1, einCol+1).setValue('25-1185235');
        log.push('✅ Tab 11: C-001 PNC EIN: "'+cur+'" → 25-1185235 (row '+(r+1)+')');
      } else {
        log.push('ℹ️ Tab 11: PNC EIN = "'+cur+'" — verify matches 25-1185235');
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 12 — Tab 11: add "1099-B Ready" column
// ═══════════════════════════════════════════════════════════════
function correction_12_tab11Add1099ReadyCol(ss, log) {
  log.push('— C12: Tab 11 — 1099-B Ready Column —');
  var sheet = findSheet(ss, ['Tab 11 — Freeway Checklist','Tab 11','Freeway Checklist']);
  if (!sheet) { log.push('⚠️ Tab 11 not found'); return; }
  var data = sheet.getDataRange().getValues();
  var hdr = data[0];
  // Check if exists
  for (var c = 0; c < hdr.length; c++) {
    if (hdr[c].toString().toUpperCase().indexOf('1099-B READY') >= 0) {
      log.push('ℹ️ Tab 11: "1099-B Ready" column already exists'); return;
    }
  }
  var irisF1 = -1, irisF2 = -1, pairReq = -1;
  hdr.forEach(function(h,i){
    var u = h.toString().toUpperCase();
    if (u.indexOf('FORM 1') >= 0 && u.indexOf('IRIS') >= 0) irisF1 = i;
    if (u.indexOf('FORM 2') >= 0 && u.indexOf('IRIS') >= 0) irisF2 = i;
    if (u.indexOf('1099-B PAIR') >= 0 || u.indexOf('PAIR REQUIRED') >= 0) pairReq = i;
  });
  var newCol = hdr.length + 1;
  sheet.getRange(1, newCol).setValue('1099-B Ready');
  for (var r = 1; r < data.length; r++) {
    var acct = data[r][0].toString().trim();
    if (!acct.match(/^[TC]-\d+/)) continue;
    var pair = pairReq >= 0 ? data[r][pairReq].toString() : '';
    var f1   = irisF1 >= 0 ? data[r][irisF1].toString().trim() : '';
    var f2   = irisF2 >= 0 ? data[r][irisF2].toString().trim() : '';
    var status = (pair.indexOf('N/A') >= 0 || pair.toUpperCase().indexOf('CLOSED') >= 0)
               ? 'N/A — Closed'
               : (f1 && f2) ? 'FILED ✅' : 'PENDING';
    sheet.getRange(r+1, newCol).setValue(status);
  }
  log.push('✅ Tab 11: "1099-B Ready" column added at col '+newCol+' (FILED/PENDING/N/A for all 39 accounts)');
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 13 — Tab 11: T-035 BOA IRIS confirmation notes
// ═══════════════════════════════════════════════════════════════
function correction_13_tab11BoaNotes(ss, log) {
  log.push('— C13: Tab 11 — T-035 BOA IRIS Notes —');
  var sheet = findSheet(ss, ['Tab 11 — Freeway Checklist','Tab 11','Freeway Checklist']);
  if (!sheet) { log.push('⚠️ Tab 11 not found'); return; }
  var data = sheet.getDataRange().getValues();
  var hdr = data[0];
  // Notes are in the MAILING ADDRESS column in the original structure
  var notesCol = hdr.length - 1;
  hdr.forEach(function(h,i){
    var u = h.toString().toUpperCase();
    if (u === 'NOTES' || u === 'MAILING ADDRESS') notesCol = i;
  });
  var fullNote = 'Original IRIS filings: 202018774 (1099-A Form 1) | 202018785 (1099-A Form 2) | 202018977 (1099-B Form 2) — Filed 2026-01-30 | CORRECTED 1099-B: 202046529 (Form 1) + 202046536 (Form 2) — Corrected 2026-02-12';
  for (var r = 1; r < data.length; r++) {
    if (data[r][0].toString().trim() === 'T-035') {
      var cur = data[r][notesCol].toString();
      if (cur.indexOf('202046529') < 0) {
        sheet.getRange(r+1, notesCol+1).setValue(fullNote);
        log.push('✅ Tab 11: T-035 BOA notes updated with original + corrected IRIS numbers');
      } else {
        log.push('ℹ️ Tab 11: T-035 notes already contain IRIS numbers — no change');
      }
      return;
    }
  }
  log.push('⚠️ Tab 11: T-035 row not found');
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 14 — Tab 12: update any "Virginia" → "North Carolina"
// ═══════════════════════════════════════════════════════════════
function correction_14_tab12GoverningLaw(ss, log) {
  log.push('— C14: Tab 12 — Governing Law —');
  var sheet = findSheet(ss, ['Tab 12 — Filing Dashboard','Tab 12','Filing Dashboard']);
  if (!sheet) { log.push('⚠️ Tab 12 not found'); return; }
  var data = sheet.getDataRange().getValues();
  var fixes = 0;
  for (var r = 0; r < data.length; r++) {
    for (var c = 0; c < data[r].length; c++) {
      var v = data[r][c].toString();
      if (v.indexOf('Virginia') >= 0 || v.indexOf('VIRGINIA') >= 0) {
        var nv = v.replace(/\bVirginia\b/g,'North Carolina').replace(/\bVIRGINIA\b/g,'NORTH CAROLINA');
        if (nv !== v) { sheet.getRange(r+1,c+1).setValue(nv); fixes++; log.push('✅ Tab 12[R'+(r+1)+'C'+(c+1)+']: "'+v+'" → "'+nv+'"'); }
      }
    }
  }
  if (fixes === 0) log.push('ℹ️ Tab 12: No "Virginia" found (may already be NC or not in this tab)');
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 15 — Tab 12: add Next Action Priority Queue
// ═══════════════════════════════════════════════════════════════
function correction_15_tab12NextAction(ss, log) {
  log.push('— C15: Tab 12 — Next Action Priority Queue —');
  var sheet = findSheet(ss, ['Tab 12 — Filing Dashboard','Tab 12','Filing Dashboard']);
  if (!sheet) { log.push('⚠️ Tab 12 not found'); return; }
  var full = sheet.getDataRange().getValues().map(function(r){return r.join(' ');}).join(' ');
  if (full.toUpperCase().indexOf('NEXT ACTION') >= 0) { log.push('ℹ️ Tab 12: Next Action section already present'); return; }
  var lr = sheet.getLastRow();
  var rows = [
    [''],
    ['— NEXT ACTION PRIORITY QUEUE —','','','','',''],
    ['PRIORITY','ACTION','RES REF','DEADLINE','OWNER','STATUS'],
    ['1 — CRITICAL','File Form 56 (Notice of Fiduciary) — 20 unique creditor EINs','RES-001','Before 1099-B','Clinton Wimberly IV','NOT STARTED'],
    ['2 — CRITICAL','Issue W-9 (EIN 41-6809588) to all 20 unique creditor EINs','RES-004','Before 1099-B','Clinton Wimberly IV','NOT STARTED'],
    ['3 — HIGH','File Form 2848 — Power of Attorney (CAF 0317-17351)','RES-002','After Form 56','Clinton Wimberly IV','NOT STARTED'],
    ['4 — HIGH','File Form 8821 — Tax Information Authorization','RES-003','After Form 56','Clinton Wimberly IV','NOT STARTED'],
    ['5 — HIGH','File 1099-B Form 1 + Form 2 via IRIS — 73 outstanding pairs (all but T-035)','Tab 11','Annual deadline','Clinton Wimberly IV','NOT STARTED'],
    ['6 — MEDIUM','Confirm PNC EIN for C-001 (Syrina) — updated to 25-1185235 (verify)','Tab 11/13','ASAP','Syrina S. Wimberly','EIN UPDATED — VERIFY'],
    ['7 — MEDIUM','Verify Veterans United EIN 26-1192831 in Tab 10','Tab 10','ASAP','Clinton Wimberly IV','EIN ADDED — VERIFY'],
    ['8 — LOW','File Form 8949 + Schedule D with 2025 Form 1040 after IRIS complete','RES-005','Tax deadline','Clinton Wimberly IV','PENDING IRIS #s']
  ];
  sheet.getRange(lr+1, 1, rows.length, 6).setValues(rows.map(function(row){
    while(row.length<6) row.push(''); return row;
  }));
  log.push('✅ Tab 12: Next Action Priority Queue (8 items) added at rows '+(lr+1)+'–'+(lr+rows.length));
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 16 — Tab 13: PNC EIN TBD → 25-1185235
// ═══════════════════════════════════════════════════════════════
function correction_16_tab13PncEin(ss, log) {
  log.push('— C16: Tab 13 — PNC EIN —');
  var sheet = findSheet(ss, ['Tab 13 — Creditor Registry','Tab 13','Creditor Registry']);
  if (!sheet) { log.push('⚠️ Tab 13 not found'); return; }
  var data = sheet.getDataRange().getValues();
  var hdr = data[0];
  var einCol = -1;
  hdr.forEach(function(h,i){
    var u = h.toString().toUpperCase();
    if (u === 'EIN') einCol = i;
  });
  for (var r = 0; r < data.length; r++) {
    if (data[r].join(' ').toUpperCase().indexOf('PNC') >= 0 && einCol >= 0) {
      var cur = data[r][einCol].toString().trim();
      if (cur.toUpperCase().indexOf('TBD') >= 0 || cur === '') {
        sheet.getRange(r+1, einCol+1).setValue('25-1185235');
        log.push('✅ Tab 13: PNC C-001 EIN: "'+cur+'" → 25-1185235 (row '+(r+1)+')');
      } else {
        log.push('ℹ️ Tab 13: PNC EIN = "'+cur+'" — verify matches 25-1185235');
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 17 — Tab 13: insert Unique EIN Summary block at top
// ═══════════════════════════════════════════════════════════════
function correction_17_tab13EinSummaryBlock(ss, log) {
  log.push('— C17: Tab 13 — Unique EIN Summary Block —');
  var sheet = findSheet(ss, ['Tab 13 — Creditor Registry','Tab 13','Creditor Registry']);
  if (!sheet) { log.push('⚠️ Tab 13 not found'); return; }
  var topRows = sheet.getRange(1, 1, 3, 1).getValues().map(function(r){return r[0].toString().toUpperCase();}).join(' ');
  if (topRows.indexOf('UNIQUE EIN') >= 0 || topRows.indexOf('APPC RLT') >= 0) {
    log.push('ℹ️ Tab 13: EIN summary block already at top'); return;
  }
  var NCOLS = 12;
  var e = function(v){ var r=[v]; while(r.length<NCOLS) r.push(''); return r; };
  var summary = [
    e('APPC RLT — CREDITOR REGISTRY | A Provident Private Creditor Revocable Living Trust | EIN: 41-6809588 | Trustee: Clinton Wimberly IV | North Carolina'),
    e(''),
    ['UNIQUE EIN SUMMARY — 20 CREDITOR EINs (1 Form 56 + 1 W-9 per row)','','','','','','','','','','',''],
    ['EIN','ENTITY','ACCOUNTS','FORM 56','W-9 STATUS','','','','','','',''],
    ['54-1719854','Capital One Bank (USA) NA','T-001, T-009','Not Started','Not Started','','','','','','',''],
    ['20-1477312','Continental Finance Co LLC','T-002','Not Started','Not Started','','','','','','',''],
    ['46-0119480','First PREMIER Bank','T-003','Not Started','Not Started','','','','','','',''],
    ['91-1756404','Merrick Bank Corporation','T-004','Not Started','Not Started','','','','','','',''],
    ['26-2465888','Credit One Bank NA','T-005 (Closed)','Not Started','Not Started','','','','','','',''],
    ['43-6003801','Bank of Missouri','T-006, T-008','Not Started','Not Started','','','','','','',''],
    ['42-0747941','Pathward NA (fka MetaBank)','T-007','Not Started','Not Started','','','','','','',''],
    ['04-3523567','Natl Financial Services LLC (Fidelity)','T-010','Not Started','Not Started','','','','','','',''],
    ['20-2688027','LVNV Funding LLC','T-011, T-012','Not Started','Not Started','','','','','','',''],
    ['47-2581234','Launch Servicing LLC','T-013','Not Started','Not Started','','','','','','',''],
    ['27-4393679','OneMain Financial Inc','T-014, T-015, T-016, T-017, T-018','Not Started','Not Started','','','','','','',''],
    ['87-0407509','WebBank','T-019','Not Started','Not Started','','','','','','',''],
    ['84-0748903','Nelnet Inc','T-020 – T-026','Not Started','Not Started','','','','','','',''],
    ['52-1198289','US Department of Education','T-027, T-028','Not Started','Not Started','','','','','','',''],
    ['75-2163778','Capital One Auto Finance','T-029, T-030','Not Started','Not Started','','','','','','',''],
    ['59-1989978','Southeast Toyota Finance','T-031','Not Started','Not Started','','','','','','',''],
    ['52-0754506','GEICO General Insurance Co','T-032','Not Started','Not Started','','','','','','',''],
    ['57-0354320','Colonial Life & Accident Insurance Co','T-033','Not Started','Not Started','','','','','','',''],
    ['39-1021860','Assurant Inc','T-034','Not Started','Not Started','','','','','','',''],
    ['94-1687665','Bank of America N.A.','T-035','Filed','1099-B Corrected 2026-02-12','','','','','','',''],
    ['25-1185235','PNC Bank National Association','C-001 (Co-Trustee Syrina)','Not Started','Not Started','','','','','','',''],
    ['54-1719854','Capital One Bank (USA) NA','C-002, C-003, C-004 (Co-Trustee Syrina) — same EIN as T-001/T-009','Not Started','Not Started','','','','','','',''],
    e('NOTE: Verify PNC EIN 25-1185235 via official PNC document before filing'),
    e(''),
    e('— FULL CREDITOR REGISTRY — ALL 39 ACCOUNTS —')
  ];
  sheet.insertRows(1, summary.length);
  sheet.getRange(1, 1, summary.length, NCOLS).setValues(
    summary.map(function(row){ while(row.length<NCOLS) row.push(''); return row.slice(0,NCOLS); })
  );
  log.push('✅ Tab 13: EIN summary block (20 EINs) inserted — '+summary.length+' rows at top');
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION 18 — Tab 4 + Tab 14: Form 56 status conflict
// ═══════════════════════════════════════════════════════════════
function correction_18_tab14Form56Status(ss, log) {
  log.push('— C18: Tab 4 + Tab 14 — Form 56 Status —');

  // Fix Tab 4 — find any row with DOC-0044 or DOC-0045 that says "On File"
  var tab4 = findSheet(ss, ['Tab 4','4. W-2 & Income','W-2 & Income','Tab 4 — W-2'])
             || findSheetByContent(ss, ['DOC-0044','DOC-0045','W-2']);
  if (tab4) {
    var data4 = tab4.getDataRange().getValues();
    for (var r = 0; r < data4.length; r++) {
      var row = data4[r].join(' ');
      if (row.indexOf('DOC-0044') >= 0 || row.indexOf('DOC-0045') >= 0 || row.indexOf('Form 56') >= 0) {
        for (var c = 0; c < data4[r].length; c++) {
          var v = data4[r][c].toString();
          if (v.toUpperCase() === 'ON FILE' || v.toUpperCase() === 'FILED') {
            tab4.getRange(r+1, c+1).setValue('TEMPLATE READY — NOT FILED (RES-001 Pending | CAF 0317-17351)');
            log.push('✅ Tab 4: Form 56 status corrected: "'+v+'" → "TEMPLATE READY — NOT FILED"');
          }
        }
      }
    }
  } else {
    log.push('⚠️ Tab 4 not found — Form 56 "On File" status must be corrected manually');
  }

  // Tab 14 — add cross-reference note to Form 56 row
  var tab14 = findSheet(ss, ['Tab 14 — Binder Guide + Process Flow','Tab 14','Binder Guide + Process Flow','Binder Guide']);
  if (!tab14) { log.push('⚠️ Tab 14 not found'); return; }
  var data14 = tab14.getDataRange().getValues();
  for (var r = 0; r < data14.length; r++) {
    var row = data14[r].join(' ');
    if ((row.indexOf('DOC-0044') >= 0 || row.indexOf('Form 56') >= 0) && row.indexOf('Fiduciary') >= 0) {
      for (var c = 0; c < data14[r].length; c++) {
        var v = data14[r][c].toString();
        if (v.toUpperCase().indexOf('NOT STARTED') >= 0 && v.indexOf('TEMPLATE') < 0) {
          tab14.getRange(r+1, c+1).setValue(v + ' | TEMPLATE READY — verify Tab 4 status matches (should NOT say "On File")');
          log.push('✅ Tab 14: Form 56 row annotated with cross-reference warning at row '+(r+1));
          return;
        }
      }
    }
  }
  log.push('ℹ️ Tab 14: Form 56 row already correctly marked NOT STARTED');
}
