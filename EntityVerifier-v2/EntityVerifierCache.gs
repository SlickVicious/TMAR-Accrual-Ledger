/**
 * EntityVerifierCache.gs — Two-Tier Caching Layer for Entity Verifier v2
 * ======================================================================
 * Provides fast in-memory caching via PropertiesService (Tier 1) and
 * persistent storage via a hidden 'EV_Cache' sheet (Tier 2).
 *
 * Tier 1 — PropertiesService (ScriptProperties):
 *   - Fast key-value lookups, ~1ms per read
 *   - Limited to 9KB per property, 500KB total across all properties
 *   - Entries auto-fall through to sheet-only when quota is exceeded
 *
 * Tier 2 — Hidden 'EV_Cache' Sheet:
 *   - No size limit, persists across sessions
 *   - Columns: KEY | TIMESTAMP | DATA | ENTITY_NAME | EIN | STATUS
 *   - Sheet is created automatically and hidden from the user
 *
 * Cache keys are normalized from entity name + EIN:
 *   ev_${lowercase_trimmed_alphanum_name}_${ein}
 *
 * All functions reference CONFIG.CACHE_TTL_DAYS and CONFIG.CACHE_SHEET_NAME
 * from EntityVerifierConfig.gs (same GAS project).
 *
 * @fileoverview Two-tier cache for Entity Verifier v2 verification results.
 */

// ─── CACHE KEY GENERATION ─────────────────────────────────────────────────────

/**
 * Normalizes entity name and EIN into a deterministic cache key.
 * Strips special characters, lowercases, trims whitespace.
 *
 * @param {string} entityName - The entity/business name.
 * @param {string} ein - The EIN (Employer Identification Number).
 * @return {string} Normalized cache key in format ev_name_ein.
 */
function makeCacheKey(entityName, ein) {
  var name = String(entityName || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  var cleanEin = String(ein || '').trim().replace(/[^0-9]/g, '');
  return 'ev_' + name + '_' + cleanEin;
}

// ─── TTL / EXPIRATION ─────────────────────────────────────────────────────────

/**
 * Checks whether a cached timestamp has exceeded the configured TTL.
 *
 * @param {number|string} timestamp - ISO string or epoch ms of when the entry was cached.
 * @return {boolean} True if the entry is expired.
 */
function isCacheExpired(timestamp) {
  if (!timestamp) return true;

  var ttlDays = (typeof CONFIG !== 'undefined' && CONFIG.CACHE_TTL_DAYS) ? CONFIG.CACHE_TTL_DAYS : 90;
  var cachedTime;

  if (typeof timestamp === 'number') {
    cachedTime = timestamp;
  } else {
    cachedTime = new Date(String(timestamp)).getTime();
  }

  if (isNaN(cachedTime)) return true;

  var ttlMs = ttlDays * 24 * 60 * 60 * 1000;
  return (Date.now() - cachedTime) > ttlMs;
}

// ─── COMPRESSION / SERIALIZATION ──────────────────────────────────────────────

/**
 * Serializes an object to minimal JSON. Returns null if the result
 * exceeds the PropertiesService 9KB per-property limit, signaling
 * that the entry should be stored in the sheet tier only.
 *
 * @param {Object} obj - The verification result object to serialize.
 * @return {string|null} Compact JSON string, or null if over 9KB.
 */
function compressForProperties(obj) {
  try {
    var json = JSON.stringify(obj);
    // PropertiesService limit is 9KB per property value
    if (json.length > 9000) {
      return null;
    }
    return json;
  } catch (e) {
    Logger.log('EntityVerifierCache: compressForProperties failed — ' + e.message);
    return null;
  }
}

// ─── TIER 1: PROPERTIESSERVICE ────────────────────────────────────────────────

/**
 * Retrieves a cached verification result. Checks PropertiesService first,
 * then falls back to the sheet tier. Returns null on miss or expiration.
 *
 * @param {string} entityName - The entity/business name.
 * @param {string} ein - The EIN.
 * @return {Object|null} Parsed verification result, or null if not found/expired.
 */
function cacheGet(entityName, ein) {
  var key = makeCacheKey(entityName, ein);

  // Tier 1: PropertiesService
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty(key);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed._cacheTimestamp && !isCacheExpired(parsed._cacheTimestamp)) {
        return parsed;
      }
      // Expired in properties — clean it up
      try { props.deleteProperty(key); } catch (ignore) {}
    }
  } catch (e) {
    Logger.log('EntityVerifierCache: PropertiesService read failed — ' + e.message);
  }

  // Tier 2: Sheet fallback
  var sheetResult = sheetCacheGet(key);
  if (sheetResult) {
    return sheetResult;
  }

  return null;
}

/**
 * Stores a verification result in both cache tiers.
 * Adds a _cacheTimestamp to the result object.
 * If PropertiesService quota is exceeded, stores in sheet tier only.
 *
 * @param {string} entityName - The entity/business name.
 * @param {string} ein - The EIN.
 * @param {Object} result - The verification result to cache.
 */
function cacheSet(entityName, ein, result) {
  if (!result || typeof result !== 'object') return;

  var key = makeCacheKey(entityName, ein);
  var now = new Date().toISOString();

  // Stamp the result with cache metadata
  var stamped = {};
  for (var prop in result) {
    if (result.hasOwnProperty(prop)) {
      stamped[prop] = result[prop];
    }
  }
  stamped._cacheTimestamp = now;
  stamped._cacheKey = key;

  // Tier 1: PropertiesService (best-effort)
  var compressed = compressForProperties(stamped);
  if (compressed !== null) {
    try {
      var props = PropertiesService.getScriptProperties();
      props.setProperty(key, compressed);
    } catch (e) {
      // Quota exceeded or other PropertiesService error — sheet-only
      Logger.log('EntityVerifierCache: PropertiesService write failed (quota?) — ' + e.message);
    }
  }

  // Tier 2: Sheet (always)
  sheetCacheSet(key, entityName, ein, stamped);
}

/**
 * Removes a specific cache entry from both tiers.
 *
 * @param {string} entityName - The entity/business name.
 * @param {string} ein - The EIN.
 */
function cacheDelete(entityName, ein) {
  var key = makeCacheKey(entityName, ein);

  // Tier 1
  try {
    var props = PropertiesService.getScriptProperties();
    props.deleteProperty(key);
  } catch (e) {
    Logger.log('EntityVerifierCache: PropertiesService delete failed — ' + e.message);
  }

  // Tier 2
  sheetCacheDelete(key);
}

/**
 * Checks whether a cache entry exists in either tier and is not expired.
 *
 * @param {string} entityName - The entity/business name.
 * @param {string} ein - The EIN.
 * @return {boolean} True if a valid (non-expired) entry exists.
 */
function cacheHas(entityName, ein) {
  var key = makeCacheKey(entityName, ein);

  // Tier 1: PropertiesService
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty(key);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed._cacheTimestamp && !isCacheExpired(parsed._cacheTimestamp)) {
        return true;
      }
    }
  } catch (e) {
    // Fall through to sheet check
  }

  // Tier 2: Sheet
  var sheetResult = sheetCacheGet(key);
  return sheetResult !== null;
}

// ─── TIER 2: HIDDEN SHEET ─────────────────────────────────────────────────────

/**
 * Ensures the EV_Cache sheet exists with proper headers and is hidden.
 * Creates it if missing. Returns the sheet object.
 *
 * @return {GoogleAppsScript.Spreadsheet.Sheet} The EV_Cache sheet.
 */
function ensureCacheSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = (typeof CONFIG !== 'undefined' && CONFIG.CACHE_SHEET_NAME) ? CONFIG.CACHE_SHEET_NAME : 'EV_Cache';
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);

    // Set headers
    var headers = ['KEY', 'TIMESTAMP', 'DATA', 'ENTITY_NAME', 'EIN', 'STATUS'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Bold headers
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#E8EAF6');

    // Freeze header row
    sheet.setFrozenRows(1);

    // Set column widths for readability
    sheet.setColumnWidth(1, 280);  // KEY
    sheet.setColumnWidth(2, 180);  // TIMESTAMP
    sheet.setColumnWidth(3, 400);  // DATA
    sheet.setColumnWidth(4, 200);  // ENTITY_NAME
    sheet.setColumnWidth(5, 120);  // EIN
    sheet.setColumnWidth(6, 100);  // STATUS

    // Hide the sheet
    sheet.hideSheet();

    Logger.log('EntityVerifierCache: Created and hid EV_Cache sheet.');
  }

  return sheet;
}

/**
 * Reads a cached entry from the EV_Cache sheet by key.
 * Returns the parsed DATA column as an object, or null if not found/expired.
 *
 * @param {string} key - The normalized cache key.
 * @return {Object|null} Parsed verification result, or null.
 */
function sheetCacheGet(key) {
  try {
    var sheet = ensureCacheSheet();
    var data = sheet.getDataRange().getValues();

    // Row 0 is headers; search from row 1 onward
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        var timestamp = data[i][1];
        var jsonStr = data[i][2];

        // Check expiration
        if (isCacheExpired(timestamp)) {
          return null;
        }

        // Parse the DATA column
        try {
          var parsed = JSON.parse(jsonStr);
          return parsed;
        } catch (parseErr) {
          Logger.log('EntityVerifierCache: Corrupt JSON in sheet row ' + (i + 1) + ' — ' + parseErr.message);
          // Remove corrupt row
          sheet.deleteRow(i + 1);
          return null;
        }
      }
    }
  } catch (e) {
    Logger.log('EntityVerifierCache: sheetCacheGet failed — ' + e.message);
  }

  return null;
}

/**
 * Writes or updates a cache entry in the EV_Cache sheet.
 * If the key already exists, the row is updated in place.
 *
 * @param {string} key - The normalized cache key.
 * @param {string} entityName - The entity/business name (for display).
 * @param {string} ein - The EIN (for display).
 * @param {Object} result - The verification result (will be JSON-stringified).
 */
function sheetCacheSet(key, entityName, ein, result) {
  try {
    var sheet = ensureCacheSheet();
    var data = sheet.getDataRange().getValues();
    var now = new Date().toISOString();
    var jsonStr = JSON.stringify(result);
    var status = (result && result.status) ? String(result.status) : 'cached';

    var rowData = [key, now, jsonStr, String(entityName || ''), String(ein || ''), status];

    // Check for existing row to update
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
        return;
      }
    }

    // No existing row — append
    sheet.appendRow(rowData);
  } catch (e) {
    Logger.log('EntityVerifierCache: sheetCacheSet failed — ' + e.message);
  }
}

/**
 * Removes a cache entry from the EV_Cache sheet by key.
 *
 * @param {string} key - The normalized cache key.
 */
function sheetCacheDelete(key) {
  try {
    var sheet = ensureCacheSheet();
    var data = sheet.getDataRange().getValues();

    // Search in reverse so row indices stay valid after deletion
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === key) {
        sheet.deleteRow(i + 1);
        return;
      }
    }
  } catch (e) {
    Logger.log('EntityVerifierCache: sheetCacheDelete failed — ' + e.message);
  }
}

// ─── CACHE MANAGEMENT ─────────────────────────────────────────────────────────

/**
 * Purges all expired entries from both cache tiers.
 *
 * @return {number} Total count of purged entries.
 */
function cachePurgeExpired() {
  var purged = 0;

  // Tier 1: PropertiesService
  try {
    var props = PropertiesService.getScriptProperties();
    var all = props.getProperties();
    for (var propKey in all) {
      if (all.hasOwnProperty(propKey) && propKey.indexOf('ev_') === 0) {
        try {
          var parsed = JSON.parse(all[propKey]);
          if (parsed && isCacheExpired(parsed._cacheTimestamp)) {
            props.deleteProperty(propKey);
            purged++;
          }
        } catch (parseErr) {
          // Corrupt entry — remove it
          props.deleteProperty(propKey);
          purged++;
        }
      }
    }
  } catch (e) {
    Logger.log('EntityVerifierCache: PropertiesService purge failed — ' + e.message);
  }

  // Tier 2: Sheet
  try {
    var sheet = ensureCacheSheet();
    var data = sheet.getDataRange().getValues();

    // Delete in reverse to keep row indices stable
    for (var i = data.length - 1; i >= 1; i--) {
      var timestamp = data[i][1];
      if (isCacheExpired(timestamp)) {
        sheet.deleteRow(i + 1);
        purged++;
      }
    }
  } catch (e) {
    Logger.log('EntityVerifierCache: Sheet purge failed — ' + e.message);
  }

  Logger.log('EntityVerifierCache: Purged ' + purged + ' expired entries.');
  return purged;
}

/**
 * Clears ALL cache entries from both tiers regardless of expiration.
 *
 * @return {number} Total count of cleared entries.
 */
function cachePurgeAll() {
  var cleared = 0;

  // Tier 1: PropertiesService — only remove ev_ prefixed keys
  try {
    var props = PropertiesService.getScriptProperties();
    var all = props.getProperties();
    for (var propKey in all) {
      if (all.hasOwnProperty(propKey) && propKey.indexOf('ev_') === 0) {
        props.deleteProperty(propKey);
        cleared++;
      }
    }
  } catch (e) {
    Logger.log('EntityVerifierCache: PropertiesService clear failed — ' + e.message);
  }

  // Tier 2: Sheet — clear all data rows, keep headers
  try {
    var sheet = ensureCacheSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var rowCount = lastRow - 1;
      sheet.deleteRows(2, rowCount);
      cleared += rowCount;
    }
  } catch (e) {
    Logger.log('EntityVerifierCache: Sheet clear failed — ' + e.message);
  }

  Logger.log('EntityVerifierCache: Cleared ' + cleared + ' total entries.');
  return cleared;
}

/**
 * Returns statistics about the current cache state across both tiers.
 *
 * @return {Object} Stats object with totalEntries, expiredEntries, oldestEntry,
 *                  newestEntry, propertyServiceUsage, and sheetRows.
 */
function cacheGetStats() {
  var stats = {
    totalEntries: 0,
    expiredEntries: 0,
    oldestEntry: null,
    newestEntry: null,
    propertyServiceUsage: 0,
    sheetRows: 0
  };

  var allTimestamps = [];

  // Tier 1: PropertiesService
  try {
    var props = PropertiesService.getScriptProperties();
    var all = props.getProperties();
    var totalBytes = 0;

    for (var propKey in all) {
      if (all.hasOwnProperty(propKey) && propKey.indexOf('ev_') === 0) {
        totalBytes += propKey.length + (all[propKey] || '').length;

        try {
          var parsed = JSON.parse(all[propKey]);
          if (parsed && parsed._cacheTimestamp) {
            var ts = new Date(parsed._cacheTimestamp).getTime();
            if (!isNaN(ts)) {
              allTimestamps.push(ts);
            }
            if (isCacheExpired(parsed._cacheTimestamp)) {
              stats.expiredEntries++;
            }
          }
        } catch (ignore) {
          stats.expiredEntries++; // Corrupt = treat as expired
        }
      }
    }

    stats.propertyServiceUsage = totalBytes;
  } catch (e) {
    Logger.log('EntityVerifierCache: Stats PropertiesService read failed — ' + e.message);
  }

  // Tier 2: Sheet
  try {
    var sheet = ensureCacheSheet();
    var lastRow = sheet.getLastRow();
    var sheetRows = Math.max(0, lastRow - 1);
    stats.sheetRows = sheetRows;

    if (sheetRows > 0) {
      var data = sheet.getRange(2, 1, sheetRows, 6).getValues();
      for (var i = 0; i < data.length; i++) {
        var timestamp = data[i][1];
        if (timestamp) {
          var ts = new Date(String(timestamp)).getTime();
          if (!isNaN(ts)) {
            allTimestamps.push(ts);
          }
          if (isCacheExpired(timestamp)) {
            stats.expiredEntries++;
          }
        }
      }
    }
  } catch (e) {
    Logger.log('EntityVerifierCache: Stats sheet read failed — ' + e.message);
  }

  // Deduplicate counting: total unique entries is the sheet row count
  // (sheet is authoritative since all entries go there)
  stats.totalEntries = stats.sheetRows;

  // Oldest / newest from all timestamps
  if (allTimestamps.length > 0) {
    allTimestamps.sort(function(a, b) { return a - b; });
    stats.oldestEntry = new Date(allTimestamps[0]).toISOString();
    stats.newestEntry = new Date(allTimestamps[allTimestamps.length - 1]).toISOString();
  }

  return stats;
}

/**
 * Returns all cached verification results as an array (for UI display).
 * Each element includes entityName, ein, status, timestamp, and the full result.
 *
 * @return {Array<Object>} Array of cache entry objects.
 */
function cacheGetAll() {
  var entries = [];

  try {
    var sheet = ensureCacheSheet();
    var lastRow = sheet.getLastRow();

    if (lastRow <= 1) return entries;

    var data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();

    for (var i = 0; i < data.length; i++) {
      var key = data[i][0];
      var timestamp = data[i][1];
      var jsonStr = data[i][2];
      var entityName = data[i][3];
      var ein = data[i][4];
      var status = data[i][5];

      var result = null;
      try {
        result = JSON.parse(jsonStr);
      } catch (parseErr) {
        result = { _parseError: true, _rawData: String(jsonStr).substring(0, 200) };
      }

      entries.push({
        key: key,
        entityName: entityName,
        ein: ein,
        status: status,
        timestamp: timestamp,
        expired: isCacheExpired(timestamp),
        result: result
      });
    }
  } catch (e) {
    Logger.log('EntityVerifierCache: cacheGetAll failed — ' + e.message);
  }

  return entries;
}
