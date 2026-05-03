/**
 * TMAR Trust & Credits Binder v2 — Apply Color Theme to Tabs 11-14
 * v2 — uses keyword tab matching + hardcoded colors from ThemeLog
 *
 * Colors sampled from this workbook (Cover tab, 2026-05-02):
 *   Column header bg : #1a1a2e  (dark navy)
 *   Column header font: #ffffff
 *   Section divider bg: #9898a1  (slate gray)
 *   Tab strip color   : #1f4e79  (dark blue)
 *
 * HOW TO RUN:
 *  Open TMAR GSheet → Extensions → Apps Script → paste → Save
 *  Run:  applyThemeToNewTabs()      — colors + section formatting
 *  Run:  fixTabNames()              — rename tabs to match existing convention (optional)
 */

// ─── WORKBOOK THEME (from ThemeLog) ─────────────────────────────
var THEME = {
  colHdrBg:     '#1f4e79',   // steel blue — column header background (matches Tab 9 style)
  colHdrFont:   '#ffffff',   // white text
  colHdrBold:   'bold',
  colHdrSize:   11,
  colHdrAlign:  'center',
  secBg:        '#9898a1',   // slate gray — section divider background
  secFont:      '#ffffff',
  secBold:      'bold',
  secBlend:     '#c4c4ca',   // lighter blend for sub-section headers
  subSecBg:     '#2c2c54',   // deeper navy for sub-section headers in Tab 12/13
  subSecFont:   '#ffffff',
  tabColor:     '#1f4e79'    // tab strip color
};

// ─── TAB KEYWORDS (match on partial name, case-insensitive) ──────
var NEW_TAB_KEYWORDS = [
  'Freeway Checklist',
  'Filing Dashboard',
  'Creditor Registry',
  'Binder Guide'
];

// ═══════════════════════════════════════════════════════════════
// MAIN — run this
// ═══════════════════════════════════════════════════════════════
function applyThemeToNewTabs() {
  var ss  = SpreadsheetApp.getActiveSpreadsheet();
  var log = ['TMAR Theme — ' + new Date().toLocaleString(), ''];

  var targets = findNewTabs(ss);
  if (targets.length === 0) {
    log.push('❌ No new tabs found. Ensure Tabs 11-14 exist in this workbook.');
    SpreadsheetApp.getUi().alert(log.join('\n'));
    return;
  }

  targets.forEach(function(sheet) {
    log.push('Styling: "' + sheet.getName() + '"');
    styleSheet(sheet, log);
    log.push('  ✅ Done\n');
  });

  SpreadsheetApp.flush();
  writeLog(ss, '_ThemeLog', log);
  SpreadsheetApp.getUi().alert(
    'Theme applied to ' + targets.length + ' tab(s).\n\n' +
    targets.map(function(s){ return '✅ ' + s.getName(); }).join('\n') +
    '\n\nFull details in _ThemeLog tab.'
  );
}

// ═══════════════════════════════════════════════════════════════
// FIND NEW TABS by keyword (immune to dash type / spacing differences)
// ═══════════════════════════════════════════════════════════════
function findNewTabs(ss) {
  return ss.getSheets().filter(function(sheet) {
    var name = sheet.getName();
    return NEW_TAB_KEYWORDS.some(function(kw) {
      return name.toLowerCase().indexOf(kw.toLowerCase()) >= 0;
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// STYLE ONE SHEET
// ═══════════════════════════════════════════════════════════════
function styleSheet(sheet, log) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return;

  var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  // Reset all rows to neutral first so prior incomplete styling is cleared
  sheet.getRange(1, 1, lastRow, lastCol)
       .setBackground(null)
       .setFontColor('#000000')
       .setFontWeight('normal');

  for (var r = 0; r < data.length; r++) {
    var row    = data[r];
    var rowStr = rowToStr(row);
    var filled = row.filter(function(v){ return v.toString().trim() !== ''; }).length;

    if (filled === 0) continue;

    var role = detectRole(row, rowStr, filled);
    if (role === 'NONE') continue;

    var range = sheet.getRange(r + 1, 1, 1, lastCol);

    switch (role) {
      case 'COL_HEADER':
        range.setBackground(THEME.colHdrBg)
             .setFontColor(THEME.colHdrFont)
             .setFontWeight(THEME.colHdrBold)
             .setFontSize(THEME.colHdrSize)
             .setHorizontalAlignment(THEME.colHdrAlign)
             .setVerticalAlignment('middle')
             .setWrap(true);
        log.push('  [COL_HDR  R' + (r+1) + '] ' + rowPreview(row));
        break;

      case 'SECTION':
        range.setBackground(THEME.secBg)
             .setFontColor(THEME.secFont)
             .setFontWeight(THEME.secBold)
             .setHorizontalAlignment('center')
             .setVerticalAlignment('middle');
        // Merge for clean look (skip if already merged or only 1 col)
        if (lastCol > 1) { try { range.merge(); } catch(e) {} }
        log.push('  [SECTION  R' + (r+1) + '] ' + row[0]);
        break;

      case 'SUBSECTION':
        range.setBackground(THEME.subSecBg)
             .setFontColor(THEME.subSecFont)
             .setFontWeight('bold')
             .setHorizontalAlignment('left')
             .setVerticalAlignment('middle');
        log.push('  [SUBSEC   R' + (r+1) + '] ' + row[0]);
        break;

      case 'LABEL_ROW':
        range.setBackground(THEME.secBlend)
             .setFontColor('#1a1a2e')
             .setFontWeight('bold')
             .setHorizontalAlignment('left');
        log.push('  [LABEL    R' + (r+1) + '] ' + row[0]);
        break;
    }
  }

  // Apply tab strip color
  try {
    var colorBuilder = SpreadsheetApp.newColor().setRgbColor(THEME.tabColor).build();
    sheet.setTabColorObject(colorBuilder);
  } catch(e) {
    try { sheet.setTabColor(THEME.tabColor); } catch(e2) {}
  }
}

// ═══════════════════════════════════════════════════════════════
// DETECT ROW ROLE
// ═══════════════════════════════════════════════════════════════
function detectRole(row, rowStr, filled) {

  // ── Guard: account/reference data rows — never classify as header
  //    Catches T-001, C-002, S-003, VAL-001, RES-001, MR-005, DOC-001, AR-001 etc.
  //    Prevents "EIN" cell value (TIN type column) from triggering COL_HEADER match
  var _first = row[0].toString().trim();
  if (/^[TCSA]-\d+$|^(VAL|RES|DOC|AR|MR)-/.test(_first)) return 'NONE';

  // ── Section divider: 1-3 filled cells containing em-dashes or separator pattern
  if (filled <= 3) {
    var first = row[0].toString().trim();
    if (first.indexOf('—') >= 0 || /^[-–—]{3,}/.test(first)) return 'SECTION';
    // Pattern like "— CREDIT CARDS — CLINTON" or "— CO-TRUSTEE —"
    if (/^\s*[—–-].+[—–-]\s*/.test(first)) return 'SECTION';
  }

  // ── Column header: has 3+ filled cells AND contains known header keywords
  var COL_HDR_KEYWORDS = [
    'TAB #', 'TAB\\s*#', 'PAYER', 'CREDITOR', 'EIN', 'TIN TYPE',
    'BINDER SECTION', 'FILING ORDER', 'METRIC', '1099-B PAIR',
    'FORM 56 DATE', 'W-9 DATE', 'IRIS CONF',
    'STEP', 'ACTION', 'FORM / DOCUMENT', 'TIMING', 'TMAR STATUS',
    'PRIORITY', 'RES REF', 'DEADLINE', 'OWNER', 'STATUS',
    'RESOLUTION', 'AMOUNT', 'PERIOD', 'SOURCE',
    'DOCUMENT TYPE', 'DOC ID', 'DATE', 'LOCATION',
    'EIN DEDUPLICATION', 'RULE', 'EXPLANATION', 'IMPACT',
    'RETURN RECEIPT', 'ADMIN NOTICE', 'CERTIFIED MAIL',
    'ADDRESS LINE', 'CITY', 'STATE', 'ZIP'
  ];
  if (filled >= 3) {
    for (var i = 0; i < COL_HDR_KEYWORDS.length; i++) {
      if (rowStr.indexOf(COL_HDR_KEYWORDS[i]) >= 0) return 'COL_HEADER';
    }
  }

  // ── Sub-section header: ALL-CAPS, 1-3 cells filled, long label, not an ID
  if (filled <= 3) {
    var first = row[0].toString().trim();
    if (first.length >= 8 &&
        first === first.toUpperCase() &&
        !/^[TC]-\d+$|^VAL-|^S-\d|^DOC-|^AR-|^MR-|^RES-|^\d+$/.test(first) &&
        !/[a-z]/.test(first)) {
      return 'SUBSECTION';
    }
  }

  // ── Label row: mixed case, short header prefix, 1-2 filled cells (like "Trust Name:")
  if (filled <= 2) {
    var first = row[0].toString().trim();
    if (first.endsWith(':') && first.length > 3) return 'LABEL_ROW';
  }

  return 'NONE';
}

// ═══════════════════════════════════════════════════════════════
// OPTIONAL: Fix tab names to match the workbook's naming convention
// ═══════════════════════════════════════════════════════════════
function fixTabNames() {
  var ss     = SpreadsheetApp.getActiveSpreadsheet();
  var log    = ['Fix Tab Names — ' + new Date().toLocaleString(), ''];
  var sheets = ss.getSheets();

  // Detect convention from existing original tabs
  var origNames = sheets
    .filter(function(s){ return NEW_TAB_KEYWORDS.every(function(k){ return s.getName().toLowerCase().indexOf(k.toLowerCase()) < 0; }); })
    .filter(function(s){ return !s.getName().match(/^_/); })
    .map(function(s){ return s.getName(); });

  // Convention detection: "Tab N Desc" vs "Tab N — Desc" vs "N — Desc" vs "Desc only"
  var useTabPrefix  = origNames.some(function(n){ return /^Tab\s+\d/i.test(n); });
  var useEmDash     = origNames.some(function(n){ return n.indexOf('—') >= 0; });
  var useHyphen     = origNames.some(function(n){ return / - /.test(n); });
  var separator     = useEmDash ? ' — ' : useHyphen ? ' - ' : ' ';

  log.push('Detected convention: ' + (useTabPrefix ? 'Tab N' : 'N') + separator + 'Desc');
  log.push('Sample existing names: ' + origNames.slice(0, 3).join(', '));
  log.push('');

  var defs = [
    { keywords: ['Freeway Checklist'],          num: '11', desc: 'Freeway Checklist' },
    { keywords: ['Filing Dashboard'],           num: '12', desc: 'Filing Dashboard' },
    { keywords: ['Creditor Registry'],          num: '13', desc: 'Creditor Registry' },
    { keywords: ['Binder Guide', 'Process Flow'], num: '14', desc: 'Binder Guide + Process Flow' }
  ];

  defs.forEach(function(def) {
    var sheet = sheets.find(function(s){
      var n = s.getName().toLowerCase();
      return def.keywords.some(function(k){ return n.indexOf(k.toLowerCase()) >= 0; });
    });
    if (!sheet) { log.push('⚠️  Not found: ' + def.desc); return; }

    var targetName = (useTabPrefix ? 'Tab ' : '') + def.num + separator + def.desc;
    if (sheet.getName() !== targetName) {
      var old = sheet.getName();
      sheet.setName(targetName);
      log.push('✅  "' + old + '" → "' + targetName + '"');
    } else {
      log.push('ℹ️   Already correct: "' + targetName + '"');
    }
  });

  SpreadsheetApp.flush();
  writeLog(ss, '_ThemeLog', log);
  SpreadsheetApp.getUi().alert(log.join('\n'));
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function rowToStr(row) {
  return row.map(function(v){ return v.toString().toUpperCase().trim(); }).join('|');
}

function rowPreview(row) {
  return row.filter(function(v){ return v.toString().trim(); }).slice(0, 4).join(' | ');
}

function writeLog(ss, tabName, lines) {
  var s = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
  s.clearContents();
  lines.forEach(function(l, i){ s.getRange(i+1, 1).setValue(l); });
}
