/**
 * DocumentRegistryTrigger.gs
 *
 * Installable onEdit trigger for the Document Registry tab.
 *
 * What it does on every edit to Document Registry (row 3+):
 *   1. Auto-assigns the next DOC-XXXX ID if col A is blank
 *   2. Auto-stamps today's date in col J (Scan Date) if blank
 *
 * HOW TO INSTALL (one-time):
 *   TMAR menu → Document Registry → Install Auto-ID & Date Trigger
 *   — OR —
 *   Run installDocRegistryTrigger() directly from the Apps Script editor.
 *
 * HOW TO REMOVE:
 *   Run removeDocRegistryTrigger() from the Apps Script editor,
 *   or delete it manually via Triggers (⏱) in the left sidebar.
 */

// ── Trigger handler ───────────────────────────────────────────────────────────

function onEditDocumentRegistry_(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  if (sheet.getName() !== 'Document Registry') return;

  const row = e.range.getRow();
  if (row < 3) return; // rows 1–2 are title / header

  // ── 1. Auto-assign Doc ID (col A) if blank ───────────────────────────────
  const docIdCell = sheet.getRange(row, 1);
  if (!docIdCell.getValue()) {
    const colAVals = sheet.getRange(1, 1, sheet.getMaxRows(), 1).getValues().flat();
    let lastDocNum = 0;
    for (const v of colAVals) {
      if (/^DOC-\d{4}$/.test(String(v))) {
        const n = parseInt(String(v).slice(4), 10);
        if (n > lastDocNum) lastDocNum = n;
      }
    }
    docIdCell.setValue('DOC-' + String(lastDocNum + 1).padStart(4, '0'));
  }

  // ── 2. Auto-stamp Scan Date (col J) if blank ─────────────────────────────
  const scanDateCell = sheet.getRange(row, 10);
  if (!scanDateCell.getValue()) {
    const today = new Date();
    const iso   = today.getFullYear() + '-' +
                  String(today.getMonth() + 1).padStart(2, '0') + '-' +
                  String(today.getDate()).padStart(2, '0');
    scanDateCell.setValue(iso);
  }
}

// ── Installer ─────────────────────────────────────────────────────────────────

function installDocRegistryTrigger() {
  // Remove any stale copies first
  for (const t of ScriptApp.getProjectTriggers()) {
    if (t.getHandlerFunction() === 'onEditDocumentRegistry_') {
      ScriptApp.deleteTrigger(t);
    }
  }

  ScriptApp.newTrigger('onEditDocumentRegistry_')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();

  SpreadsheetApp.getUi().alert(
    '✅ Document Registry trigger installed.\n\n' +
    'Any new row added to Document Registry will automatically receive:\n' +
    '  • A DOC-XXXX ID (col A)\n' +
    '  • Today\'s date as Scan Date (col J)'
  );
}

// ── Uninstaller ───────────────────────────────────────────────────────────────

function removeDocRegistryTrigger() {
  let removed = 0;
  for (const t of ScriptApp.getProjectTriggers()) {
    if (t.getHandlerFunction() === 'onEditDocumentRegistry_') {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  }
  SpreadsheetApp.getUi().alert(
    removed > 0
      ? '✅ Document Registry trigger removed (' + removed + ' deleted).'
      : 'ℹ️ No Document Registry trigger found — nothing to remove.'
  );
}
