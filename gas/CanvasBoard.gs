/**
 * CanvasBoard.gs — read the OBJECT "AppScripts Canvas & Workflow Board" + embed
 * reference-card hyperlinks into the "AppScripts" grid tab.
 */

var CANVAS_BOARD_NAME_ = 'AppScripts Canvas & Workflow Board';
var CANVAS_BOARD_GID_ = 15365688;

function dumpCanvasBoard_() {
  var ssId = TMAR_SPREADSHEET_ID_ || '1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ';
  var out = { status: 'ok', tab: CANVAS_BOARD_NAME_, gid: CANVAS_BOARD_GID_ };
  var sh = null;
  try {
    var ss = SpreadsheetApp.openById(ssId);
    sh = ss.getSheetByName(CANVAS_BOARD_NAME_);
    out.sheetFound = !!sh;
  } catch (e) { out.openError = String(e); }
  if (sh) {
    try { out.lastRow = sh.getLastRow(); } catch (e) { out.lastRowError = String(e); }
    try { out.lastCol = sh.getLastColumn(); } catch (e) { out.lastColError = String(e); }
    try { out.charts = sh.getCharts().map(function (c) { var ci = null; try { ci = c.getContainerInfo(); } catch (e) {} return { type: (function(){ try { return c.getType(); } catch(e){ return null; } })(), anchorRow: ci ? ci.getAnchorRow() : null, anchorCol: ci ? ci.getAnchorColumn() : null }; }); } catch (e) { out.chartsError = String(e); }
    try { out.drawings = sh.getDrawings().map(function (d) { return { altTitle: (function(){ try { return d.getAltTextTitle(); } catch(e){ return null; } })(), altDesc: (function(){ try { return d.getAltTextDescription(); } catch(e){ return null; } })() }; }); } catch (e) { out.drawingsError = String(e); }
    try { out.images = sh.getImages().map(function (im) { return { altTitle: (function(){ try { return im.getAltTextTitle(); } catch(e){ return null; } })(), altDesc: (function(){ try { return im.getAltTextDescription(); } catch(e){ return null; } })() }; }); } catch (e) { out.imagesError = String(e); }
    try {
      var resp = Sheets.Spreadsheets.get(ssId, { ranges: [CANVAS_BOARD_NAME_], fields: 'sheets' });
      out.properties = (resp.sheets && resp.sheets[0]) ? resp.sheets[0].properties : null;
    } catch (e) { out.sheetsApiError = String(e); }
  }
  return out;
}

/**
 * embedAppScriptsLinks_(links) — write a "Card" column (col G) of =HYPERLINK
 * formulas on the "AppScripts" tab. `links` is [{name: "<file> → <fn>", url}]
 * where `name` matches the exact Function-column (col A) string.
 */
function embedAppScriptsLinks_(links) {
  var ss = SpreadsheetApp.openById(TMAR_SPREADSHEET_ID_ || '1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ');
  var sh = ss.getSheetByName('AppScripts');
  if (!sh) return { status: 'error', message: 'AppScripts tab not found' };
  if (!Array.isArray(links) || links.length === 0) return { status: 'error', message: 'links array required' };

  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();

  // Break merges + clear data validations on the written range (known gotcha).
  try { sh.getRange(1, 1, Math.max(lastRow, 2), Math.max(lastCol, 7)).breakApart(); } catch (e) {}
  try { sh.getRange(1, 1, Math.max(lastRow, 2), Math.max(lastCol, 7)).clearDataValidations(); } catch (e) {}

  // Build col A (Function) -> 1-based row map.
  var colA = sh.getRange(1, 1, Math.max(lastRow, 1), 1).getValues();
  var rowByName = {};
  for (var i = 1; i < colA.length; i++) {
    var key = String(colA[i][0] || '').replace(/\s+/g, ' ').trim();
    if (key) rowByName[key] = i + 1;
  }

  sh.getRange(1, 7).setValue('Card');

  var written = 0, unmatched = 0, unmatchedList = [];
  for (var j = 0; j < links.length; j++) {
    var name = String((links[j] && links[j].name) || '').replace(/\s+/g, ' ').trim();
    var url = String((links[j] && links[j].url) || '').trim();
    if (!name || !url) continue;
    var row = rowByName[name];
    if (!row) { unmatched++; if (unmatchedList.length < 30) unmatchedList.push(name); continue; }
    sh.getRange(row, 7).setFormula('=HYPERLINK("' + url.replace(/"/g, '""') + '", "📄")');
    written++;
  }

  return {
    status: 'ok',
    action: 'embedAppScriptsLinks',
    header: 'Card',
    written: written,
    unmatched: unmatched,
    unmatchedSample: unmatchedList
  };
}
