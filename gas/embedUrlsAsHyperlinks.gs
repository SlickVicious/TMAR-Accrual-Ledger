/**
 * embedUrlsAsHyperlinks.gs
 * Converts each platform name in Website Accounts to a HYPERLINK formula
 * using the URL from col C, then clears the URL column.
 *
 * Run from the bound script: embedUrlsAsHyperlinks()
 */
function embedUrlsAsHyperlinks() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Website Accounts');
  if (!sheet) return 'Website Accounts tab not found';

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 'No data rows';

  // Read platform (col B) and URL (col C) for all rows
  var data = sheet.getRange(2, 2, lastRow - 1, 2).getValues();

  var updated = 0;
  var skipped = 0;

  for (var i = 0; i < data.length; i++) {
    var platform = String(data[i][0] || '').trim();
    var url = String(data[i][1] || '').trim();

    if (!platform) continue;

    var rowNum = i + 2; // 1-based, skip header

    if (url && url.startsWith('http')) {
      // Set platform cell to =HYPERLINK("url","platform")
      var formula = '=HYPERLINK("' + url + '","' + platform.replace(/"/g, '""') + '")';
      sheet.getRange(rowNum, 2).setFormula(formula);
      updated++;
    } else {
      skipped++;
    }
  }

  // Clear the URL column (col C)
  sheet.getRange(2, 3, lastRow - 1, 1).clearContent();

  // Remove URL header
  var header = sheet.getRange(1, 3).getValue();
  if (String(header).toLowerCase().indexOf('url') !== -1) {
    sheet.getRange(1, 3).clearContent();
  }

  SpreadsheetApp.getUi().alert(
    'Hyperlinks Embedded',
    updated + ' platforms converted to clickable links.\n' +
    skipped + ' rows skipped (no URL).\n' +
    'URL column cleared.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  return {
    platformsUpdated: updated,
    rowsSkipped: skipped,
    urlColumnCleared: true
  };
}
