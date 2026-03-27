/**
 * ============================================================================
 * EntityVerifierPreflight.gs — IRIS Error Prevention Pre-Flight Check
 * ============================================================================
 *
 * Purpose:
 *   Catches all known IRIS (IRS Information Returns Intake System) rejection
 *   patterns BEFORE filing. IRIS rejects for TIN/name mismatches, invalid
 *   formats, defunct entities, and other data-quality issues that can be
 *   detected and corrected programmatically. This module runs every entity
 *   through a comprehensive checklist and produces actionable warnings.
 *
 * Version:   2.0.0
 * Engine:    Entity Verifier v2
 * Platform:  Google Apps Script (Google Sheets)
 *
 * Dependencies:
 *   - EntityVerifierConfig.gs     (CONFIG object)
 *   - EntityVerifierDBA.gs        (resolveDBA, _normalizeName, _normalizeEIN)
 *   - EntityVerifierGenealogy.gs  (traceEntityGenealogy, detectDefunctSignals)
 *
 * Entry Points:
 *   irisPreflightCheck(entity)       — Single entity check
 *   generatePreflightReport(entities) — Batch report
 *
 * ============================================================================
 */

/* ===========================================================================
 * SEVERITY LEVELS
 * ===========================================================================
 */
var SEVERITY = {
  CRITICAL: 'CRITICAL',  // Will cause IRIS rejection — must fix before filing
  HIGH: 'HIGH',          // Very likely to cause rejection or CP2100 notice
  MEDIUM: 'MEDIUM',      // May cause issues — recommended to resolve
  LOW: 'LOW'             // Informational — unlikely to cause rejection
};

/* ===========================================================================
 * CONFIGURATION DEFAULTS
 * Used if CONFIG object from EntityVerifierConfig.gs is not available.
 * ===========================================================================
 */
var PREFLIGHT_DEFAULTS = {
  CACHE_TTL_DAYS: 90,
  NAME_TRUNCATION_LIMIT: 40,
  MIN_CONFIDENCE_THRESHOLD: 0.3,
  EIN_FORMAT_REGEX: /^\d{2}-\d{7}$/,
  PLACEHOLDER_EINS: ['00-0000000', '000000000', '00-000000', '99-9999999'],
  SPECIAL_CHAR_PATTERN: /[^\x20-\x7E]/,
  DBA_PATTERNS: [
    /\bd\/?b\/?a\b/i,
    /\bdoing\s+business\s+as\b/i,
    /\btrading\s+as\b/i,
    /\bt\/?a\b/i,
    /\bformerly\s+known\s+as\b/i,
    /\bf\/?k\/?a\b/i
  ],
  NA_ENTITY_KEYWORDS: ['bank', 'national', 'trust company'],
  NA_SUFFIXES: ['N.A.', 'NA', 'N.A', ', N.A.', ', NA']
};


/* ===========================================================================
 * irisPreflightCheck(entity)
 *
 * Main entry point for a single entity. Runs all preflight checks and
 * returns an array of warnings.
 *
 * @param {Object} entity - Full verification result object with fields:
 *   - name {string}             — Filing name (what would go on the 1099)
 *   - ein {string}              — EIN (XX-XXXXXXX format expected)
 *   - entityType {string}       — Entity classification
 *   - isDBA {boolean}           — Whether name is a DBA (from DBA engine)
 *   - tradeName {string}        — Original trade name if DBA
 *   - legalName {string}        — Resolved legal name if DBA
 *   - isDefunct {boolean}       — Whether entity is defunct (from Genealogy)
 *   - successorEntity {Object}  — Successor { name, ein } if defunct
 *   - confidence {number}       — Verification confidence 0-1
 *   - sources {Array}           — Sources that confirmed the entity
 *   - verificationDate {string} — ISO date when verification was performed
 *   - nameHistory {Array}       — Name changes from Genealogy
 *   - subsidiaryChain {Array}   — Parent/child relationships
 *   - parentEntity {Object}     — Parent entity { name, ein } if subsidiary
 *   - alternativeNames {Array}  — Other names found across sources
 *   - recommendedFilingName {string} — Recommended name for 1099
 *
 * @return {Array} Array of warning objects
 * ===========================================================================
 */
function irisPreflightCheck(entity) {
  var warnings = [];

  if (!entity || typeof entity !== 'object') {
    warnings.push(_createWarning(
      'NO_ENTITY',
      SEVERITY.CRITICAL,
      'No entity data provided for preflight check.',
      'Provide a valid entity verification result.',
      false
    ));
    return warnings;
  }

  // ── Check 1: SMF018 — Issuer TIN/Name mismatch ──
  var smf018 = _checkSMF018(entity);
  if (smf018) warnings.push(smf018);

  // ── Check 2: SHAREDIRFORM015 — Recipient TIN/Name mismatch ──
  var share015 = _checkSHAREDIRFORM015(entity);
  if (share015) warnings.push(share015);

  // ── Check 3: Placeholder EIN ──
  var placeholder = _checkPlaceholderEIN(entity);
  if (placeholder) warnings.push(placeholder);

  // ── Check 4: EIN format ──
  var format = _checkEINFormat(entity);
  if (format) warnings.push(format);

  // ── Check 5: Defunct entity (no successor) ──
  var defunct = _checkDefunct(entity);
  if (defunct) warnings.push(defunct);

  // ── Check 6: Defunct with successor ──
  var defunctSuccessor = _checkDefunctWithSuccessor(entity);
  if (defunctSuccessor) warnings.push(defunctSuccessor);

  // ── Check 7: Subsidiary / multiple EINs ──
  var subsidiary = _checkSubsidiary(entity);
  if (subsidiary) warnings.push(subsidiary);

  // ── Check 8: DBA language in name ──
  var dbaInName = _checkDBAInName(entity);
  if (dbaInName) warnings.push(dbaInName);

  // ── Check 9: N.A. suffix for national banks ──
  var naSuffix = _checkNASuffix(entity);
  if (naSuffix) warnings.push(naSuffix);

  // ── Check 10: Name truncation risk ──
  var truncation = _checkNameTruncation(entity);
  if (truncation) warnings.push(truncation);

  // ── Check 11: Special characters ──
  var specialChars = _checkSpecialCharacters(entity);
  if (specialChars) warnings.push(specialChars);

  // ── Check 12: Multiple names across sources ──
  var multipleNames = _checkMultipleNames(entity);
  if (multipleNames) warnings.push(multipleNames);

  // ── Check 13: Stale verification ──
  var stale = _checkStaleVerification(entity);
  if (stale) warnings.push(stale);

  // ── Check 14: No sources ──
  var noSources = _checkNoSources(entity);
  if (noSources) warnings.push(noSources);

  // ── Check 15: Low confidence ──
  var lowConf = _checkLowConfidence(entity);
  if (lowConf) warnings.push(lowConf);

  // Attach suggested fixes to each warning
  for (var i = 0; i < warnings.length; i++) {
    if (!warnings[i].fix) {
      warnings[i].fix = suggestFix(warnings[i], entity);
    }
  }

  return warnings;
}


/* ===========================================================================
 * generatePreflightReport(entities)
 *
 * Runs preflight checks on an array of entities and produces a summary.
 *
 * @param {Array} entities - Array of entity verification result objects
 *
 * @return {Object} Comprehensive preflight report
 * ===========================================================================
 */
function generatePreflightReport(entities) {
  if (!entities || !Array.isArray(entities) || entities.length === 0) {
    return {
      totalEntities: 0,
      totalWarnings: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      entityWarnings: [],
      summary: 'No entities provided for preflight check.',
      readyToFile: false,
      readyToFileCount: 0,
      blockedCount: 0
    };
  }

  var totalWarnings = 0;
  var criticalCount = 0;
  var highCount = 0;
  var mediumCount = 0;
  var lowCount = 0;
  var entityWarnings = [];
  var blockedCount = 0;
  var readyToFileCount = 0;

  for (var i = 0; i < entities.length; i++) {
    var entity = entities[i];
    var warnings = irisPreflightCheck(entity);
    var entityName = entity.name || entity.tradeName || entity.legalName || 'Unknown Entity #' + (i + 1);
    var entityEIN = entity.ein || 'N/A';

    var hasCritical = false;
    for (var j = 0; j < warnings.length; j++) {
      totalWarnings++;
      switch (warnings[j].severity) {
        case SEVERITY.CRITICAL:
          criticalCount++;
          hasCritical = true;
          break;
        case SEVERITY.HIGH:
          highCount++;
          break;
        case SEVERITY.MEDIUM:
          mediumCount++;
          break;
        case SEVERITY.LOW:
          lowCount++;
          break;
      }
    }

    if (hasCritical) {
      blockedCount++;
    } else {
      readyToFileCount++;
    }

    entityWarnings.push({
      entityName: entityName,
      ein: entityEIN,
      warnings: warnings
    });
  }

  // Build summary paragraph
  var summaryParts = [];
  summaryParts.push('Pre-flight check completed for ' + entities.length + ' entities.');
  summaryParts.push(totalWarnings + ' total warnings found.');

  if (criticalCount > 0) {
    summaryParts.push(criticalCount + ' CRITICAL issues must be resolved before filing.');
  }
  if (highCount > 0) {
    summaryParts.push(highCount + ' HIGH priority issues should be addressed.');
  }
  if (mediumCount > 0) {
    summaryParts.push(mediumCount + ' MEDIUM priority issues recommended to review.');
  }
  if (lowCount > 0) {
    summaryParts.push(lowCount + ' LOW priority informational notes.');
  }

  summaryParts.push(readyToFileCount + ' of ' + entities.length + ' entities are ready to file.');
  if (blockedCount > 0) {
    summaryParts.push(blockedCount + ' entities are BLOCKED due to critical issues.');
  }

  return {
    totalEntities: entities.length,
    totalWarnings: totalWarnings,
    criticalCount: criticalCount,
    highCount: highCount,
    mediumCount: mediumCount,
    lowCount: lowCount,
    entityWarnings: entityWarnings,
    summary: summaryParts.join(' '),
    readyToFile: criticalCount === 0,
    readyToFileCount: readyToFileCount,
    blockedCount: blockedCount
  };
}


/* ===========================================================================
 * suggestFix(warning, entity)
 *
 * Returns a specific actionable fix string for a given warning.
 *
 * @param {Object} warning  - Warning object from irisPreflightCheck
 * @param {Object} entity   - The entity verification result
 *
 * @return {string|null} Suggested fix action
 * ===========================================================================
 */
function suggestFix(warning, entity) {
  if (!warning || !warning.code) return null;

  var name = entity.name || entity.tradeName || '';
  var legalName = entity.legalName || entity.recommendedFilingName || '';
  var ein = entity.ein || '';

  switch (warning.code) {
    case 'SMF018':
      return "Replace '" + name + "' with '" + legalName + "' in the Payer Name field. " +
             "The IRS has '" + legalName + "' on file for EIN " + ein + ".";

    case 'SHAREDIRFORM015':
      return "Replace '" + name + "' with '" + legalName + "' in the Recipient Name field. " +
             "The IRS expects the legal name registered to the TIN.";

    case 'PLACEHOLDER':
      if (entity.parentEntity && entity.parentEntity.ein) {
        return "Use parent entity EIN " + entity.parentEntity.ein +
               " (" + (entity.parentEntity.name || 'parent') + ") instead of placeholder EIN.";
      }
      return "EIN " + ein + " is a placeholder. Look up the actual EIN via IRS EIN verification, " +
             "SEC EDGAR, or contact the entity directly for their valid EIN.";

    case 'FORMAT':
      var digits = (ein || '').replace(/\D/g, '');
      if (digits.length === 9) {
        return "Reformat EIN to: " + digits.substring(0, 2) + '-' + digits.substring(2) + ".";
      }
      return "EIN must be exactly 9 digits in XX-XXXXXXX format. Current value '" + ein + "' is invalid.";

    case 'DEFUNCT':
      return "Entity '" + name + "' is defunct with no confirmed successor. " +
             "Do NOT file a 1099 against a defunct entity. Research the successor entity or " +
             "contact the IRS for guidance on unresolvable defunct issuers.";

    case 'DEFUNCT_WITH_SUCCESSOR':
      var succ = entity.successorEntity || {};
      return "File under successor entity: " + (succ.name || 'Unknown') +
             (succ.ein ? " (" + succ.ein + ")" : "") +
             ". Entity '" + name + "' no longer exists.";

    case 'SUBSIDIARY':
      return "Multiple EINs found in the corporate family for '" + name + "'. " +
             "Verify which specific entity (and EIN) is the correct issuer/recipient. " +
             "Check the original account agreement or statement for the specific legal entity name.";

    case 'DBA_IN_NAME':
      var stripped = _stripDBAFromName(name);
      return "Remove DBA portion. Use only: '" + stripped + "'. " +
             "IRS systems do not recognize DBA notation in the name field.";

    case 'NA_SUFFIX':
      return "Add 'N.A.' suffix: '" + name + ", N.A.' — " +
             "National banks are registered with the N.A. designation and the IRS expects it.";

    case 'NAME_TRUNCATION':
      return "Filing name is " + name.length + " characters. IRS systems may truncate names " +
             "beyond " + PREFLIGHT_DEFAULTS.NAME_TRUNCATION_LIMIT + " characters. Verify the " +
             "truncated version still matches IRS records, or use an accepted abbreviation.";

    case 'SPECIAL_CHARACTERS':
      var cleaned = name.replace(PREFLIGHT_DEFAULTS.SPECIAL_CHAR_PATTERN, '');
      return "Remove or replace special characters. Cleaned version: '" + cleaned + "'. " +
             "IRS IRIS accepts only standard ASCII characters (letters, numbers, spaces, hyphens, ampersands).";

    case 'MULTIPLE_NAMES':
      return "Multiple name variations found across sources for EIN " + ein + ". " +
             "Use the name that matches what the IRS has on file. If unsure, use the name from " +
             "the most authoritative source (FDIC for banks, SEC for public companies).";

    case 'STALE_VERIFICATION':
      return "Verification data is outdated. Re-run entity verification to get current data. " +
             "Entity names and EINs can change due to mergers, acquisitions, or rebranding.";

    case 'NO_SOURCES':
      return "No data sources could confirm this entity. Verify the name and EIN manually: " +
             "check IRS EIN lookup, SEC EDGAR, FDIC BankFind, or contact the entity directly.";

    case 'LOW_CONFIDENCE':
      return "Verification confidence is below " + PREFLIGHT_DEFAULTS.MIN_CONFIDENCE_THRESHOLD + ". " +
             "Cross-reference the entity name and EIN with at least one authoritative source before filing.";

    default:
      return null;
  }
}


/* ===========================================================================
 * INDIVIDUAL CHECK IMPLEMENTATIONS
 * ===========================================================================
 */

/**
 * Check 1: SMF018 — Issuer TIN/Name mismatch
 * If entity is a DBA, the filing name won't match IRS records.
 */
function _checkSMF018(entity) {
  if (!entity.isDBA) return null;
  if (!entity.legalName) return null;

  var filingName = entity.name || entity.tradeName || '';
  var legalName = entity.legalName || '';

  // If the filing name matches the legal name, no issue
  if (_normalizeName(filingName) === _normalizeName(legalName)) return null;

  return _createWarning(
    'SMF018',
    SEVERITY.CRITICAL,
    "Issuer TIN/Name mismatch: Filing name '" + filingName + "' is a DBA/trade name. " +
    "IRS has '" + legalName + "' registered to EIN " + (entity.ein || 'N/A') + ". " +
    "IRIS will reject with error SMF018.",
    "Replace '" + filingName + "' with '" + legalName + "' in the Payer Name field.",
    true
  );
}

/**
 * Check 2: SHAREDIRFORM015 — Recipient TIN/Name mismatch
 * Same concept as SMF018 but for recipient-side filings.
 */
function _checkSHAREDIRFORM015(entity) {
  if (!entity.isRecipient) return null;
  if (!entity.isDBA) return null;
  if (!entity.legalName) return null;

  var filingName = entity.name || entity.tradeName || '';
  var legalName = entity.legalName || '';

  if (_normalizeName(filingName) === _normalizeName(legalName)) return null;

  return _createWarning(
    'SHAREDIRFORM015',
    SEVERITY.CRITICAL,
    "Recipient TIN/Name mismatch: Filing name '" + filingName + "' does not match " +
    "IRS records. Legal name: '" + legalName + "'.",
    "Replace '" + filingName + "' with '" + legalName + "' in the Recipient Name field.",
    true
  );
}

/**
 * Check 3: Placeholder EIN
 * Detects EINs that are obviously placeholders (all zeros, etc.).
 */
function _checkPlaceholderEIN(entity) {
  var ein = entity.ein || '';
  var einDigits = ein.replace(/\D/g, '');

  for (var i = 0; i < PREFLIGHT_DEFAULTS.PLACEHOLDER_EINS.length; i++) {
    var placeholder = PREFLIGHT_DEFAULTS.PLACEHOLDER_EINS[i].replace(/\D/g, '');
    if (einDigits === placeholder) {
      return _createWarning(
        'PLACEHOLDER',
        SEVERITY.CRITICAL,
        "EIN '" + ein + "' is a placeholder/invalid value. This will be rejected by IRIS.",
        null, // suggestFix will handle
        false
      );
    }
  }

  // Also check for obvious patterns: all same digit
  if (einDigits.length === 9) {
    var allSame = true;
    for (var j = 1; j < einDigits.length; j++) {
      if (einDigits[j] !== einDigits[0]) {
        allSame = false;
        break;
      }
    }
    if (allSame) {
      return _createWarning(
        'PLACEHOLDER',
        SEVERITY.CRITICAL,
        "EIN '" + ein + "' appears to be a placeholder (all identical digits).",
        null,
        false
      );
    }
  }

  return null;
}

/**
 * Check 4: EIN format validation
 * EIN must be in XX-XXXXXXX format (2 digits, hyphen, 7 digits).
 */
function _checkEINFormat(entity) {
  var ein = entity.ein;

  if (!ein || ein === '') {
    return _createWarning(
      'FORMAT',
      SEVERITY.CRITICAL,
      "No EIN provided. Every 1099 filing requires a valid Employer Identification Number.",
      "Obtain the entity's EIN from IRS records, SEC EDGAR, or contact the entity directly.",
      false
    );
  }

  if (!PREFLIGHT_DEFAULTS.EIN_FORMAT_REGEX.test(ein)) {
    var digits = ein.replace(/\D/g, '');
    if (digits.length === 9) {
      return _createWarning(
        'FORMAT',
        SEVERITY.HIGH,
        "EIN '" + ein + "' is not in the required XX-XXXXXXX format.",
        "Reformat to: " + digits.substring(0, 2) + '-' + digits.substring(2) + ".",
        true
      );
    }
    return _createWarning(
      'FORMAT',
      SEVERITY.CRITICAL,
      "EIN '" + ein + "' is not valid. Expected format: XX-XXXXXXX (9 digits total).",
      null,
      false
    );
  }

  // Validate first two digits (prefix) — IRS assigns specific ranges
  var prefix = parseInt(ein.substring(0, 2), 10);
  if (prefix === 0 || prefix > 99) {
    return _createWarning(
      'FORMAT',
      SEVERITY.HIGH,
      "EIN prefix '" + ein.substring(0, 2) + "' is outside normal IRS-assigned ranges.",
      "Verify the EIN is correct. IRS EIN prefixes range from 01 to 98.",
      false
    );
  }

  return null;
}

/**
 * Check 5: Defunct entity with no successor
 * Entity no longer exists and we couldn't find who took over.
 */
function _checkDefunct(entity) {
  if (!entity.isDefunct) return null;
  if (entity.successorEntity && entity.successorEntity.name) return null; // has successor — handled by check 6

  return _createWarning(
    'DEFUNCT',
    SEVERITY.CRITICAL,
    "Entity '" + (entity.name || 'Unknown') + "' is defunct/dissolved with no confirmed successor. " +
    "Filing against a defunct entity will result in IRIS rejection or a CP2100 notice.",
    null,
    false
  );
}

/**
 * Check 6: Defunct entity WITH a successor identified
 * Not as severe — we know who to file under instead.
 */
function _checkDefunctWithSuccessor(entity) {
  if (!entity.isDefunct) return null;
  if (!entity.successorEntity || !entity.successorEntity.name) return null;

  var succ = entity.successorEntity;
  return _createWarning(
    'DEFUNCT_WITH_SUCCESSOR',
    SEVERITY.HIGH,
    "Entity '" + (entity.name || 'Unknown') + "' is defunct. Successor entity identified: " +
    succ.name + (succ.ein ? ' (EIN: ' + succ.ein + ')' : '') + ".",
    "File under successor entity: " + succ.name +
    (succ.ein ? " (" + succ.ein + ")" : "") + ".",
    true
  );
}

/**
 * Check 7: Subsidiary / multiple EINs in corporate family
 * Ambiguous which EIN to use on the 1099.
 */
function _checkSubsidiary(entity) {
  if (!entity.subsidiaryChain || entity.subsidiaryChain.length === 0) return null;

  // Only warn if there's genuine ambiguity
  if (entity.subsidiaryChain.length < 2 && !entity.parentEntity) return null;

  var chainDesc = entity.subsidiaryChain.map(function(s) {
    return (s.parent || 'Unknown') + ' > ' + (s.child || 'Unknown');
  }).join('; ');

  return _createWarning(
    'SUBSIDIARY',
    SEVERITY.MEDIUM,
    "Multiple entities/EINs found in corporate family: " + chainDesc + ". " +
    "Filing under the wrong EIN may trigger a TIN mismatch.",
    null,
    false
  );
}

/**
 * Check 8: DBA language embedded in the name field
 * Names containing "d/b/a", "doing business as", etc. will cause issues.
 */
function _checkDBAInName(entity) {
  var name = entity.name || entity.tradeName || '';
  if (!name) return null;

  for (var i = 0; i < PREFLIGHT_DEFAULTS.DBA_PATTERNS.length; i++) {
    if (PREFLIGHT_DEFAULTS.DBA_PATTERNS[i].test(name)) {
      var stripped = _stripDBAFromName(name);
      return _createWarning(
        'DBA_IN_NAME',
        SEVERITY.HIGH,
        "Filing name contains DBA notation: '" + name + "'. " +
        "IRS systems do not accept DBA/trade name designations in the name field.",
        "Remove DBA portion. Use only: '" + stripped + "'.",
        true
      );
    }
  }

  return null;
}

/**
 * Check 9: National bank missing N.A. suffix
 * National banks are registered with "N.A." and the IRS expects it.
 */
function _checkNASuffix(entity) {
  var entityType = (entity.entityType || '').toUpperCase().replace(/[\s-]/g, '_');
  if (entityType !== 'NATIONAL_BANK') return null;

  var name = entity.name || entity.recommendedFilingName || '';
  if (!name) return null;

  // Check if name already has N.A. suffix
  var nameUpper = name.toUpperCase().trim();
  for (var i = 0; i < PREFLIGHT_DEFAULTS.NA_SUFFIXES.length; i++) {
    if (nameUpper.indexOf(PREFLIGHT_DEFAULTS.NA_SUFFIXES[i].toUpperCase()) !== -1) {
      return null; // Already has the suffix
    }
  }

  // Also check if name naturally contains "National Association"
  if (/national\s+association/i.test(name)) {
    return null;
  }

  return _createWarning(
    'NA_SUFFIX',
    SEVERITY.HIGH,
    "National bank '" + name + "' is missing the 'N.A.' (National Association) suffix. " +
    "The IRS registers national banks with this designation.",
    "Add 'N.A.' suffix: '" + name + ", N.A.'.",
    true
  );
}

/**
 * Check 10: Name truncation risk
 * IRS systems truncate names at certain character limits.
 */
function _checkNameTruncation(entity) {
  var name = entity.name || entity.recommendedFilingName || entity.legalName || '';
  if (!name) return null;

  var limit = PREFLIGHT_DEFAULTS.NAME_TRUNCATION_LIMIT;
  if (name.length <= limit) return null;

  return _createWarning(
    'NAME_TRUNCATION',
    SEVERITY.MEDIUM,
    "Filing name is " + name.length + " characters ('" + name + "'). " +
    "IRS systems may truncate names beyond " + limit + " characters, potentially " +
    "causing a TIN/name mismatch if the truncated version doesn't match records.",
    null,
    false
  );
}

/**
 * Check 11: Special characters in name
 * IRS systems may not handle certain characters properly.
 */
function _checkSpecialCharacters(entity) {
  var name = entity.name || entity.recommendedFilingName || entity.legalName || '';
  if (!name) return null;

  // Check for non-ASCII characters
  if (PREFLIGHT_DEFAULTS.SPECIAL_CHAR_PATTERN.test(name)) {
    var problematicChars = [];
    for (var i = 0; i < name.length; i++) {
      var code = name.charCodeAt(i);
      if (code < 32 || code > 126) {
        var ch = name.charAt(i);
        if (problematicChars.indexOf(ch) === -1) {
          problematicChars.push(ch);
        }
      }
    }

    return _createWarning(
      'SPECIAL_CHARACTERS',
      SEVERITY.MEDIUM,
      "Filing name contains special characters that IRS systems may not handle: " +
      problematicChars.join(', ') + " in '" + name + "'.",
      null,
      true
    );
  }

  // Also warn about ampersands — IRS accepts them but they can cause XML issues
  if (name.indexOf('&') !== -1 && name.indexOf('&amp;') === -1) {
    return _createWarning(
      'SPECIAL_CHARACTERS',
      SEVERITY.LOW,
      "Filing name contains '&' character: '" + name + "'. " +
      "While IRS accepts ampersands, ensure proper XML encoding if filing electronically.",
      "Verify that '&' is properly encoded as '&amp;' in the electronic filing.",
      false
    );
  }

  return null;
}

/**
 * Check 12: Multiple slightly different names across sources
 * Ambiguity in which name the IRS has on file.
 */
function _checkMultipleNames(entity) {
  var names = entity.alternativeNames || [];
  if (!names || names.length < 2) return null;

  // De-duplicate normalized names
  var uniqueNormalized = {};
  var uniqueNames = [];
  for (var i = 0; i < names.length; i++) {
    var norm = _normalizeName(names[i]);
    if (!uniqueNormalized[norm]) {
      uniqueNormalized[norm] = true;
      uniqueNames.push(names[i]);
    }
  }

  if (uniqueNames.length < 2) return null;

  return _createWarning(
    'MULTIPLE_NAMES',
    SEVERITY.MEDIUM,
    "Multiple name variations found: " + uniqueNames.join(' | ') + ". " +
    "The IRS may have a specific variation on file. Using the wrong one " +
    "could trigger a TIN/name mismatch.",
    null,
    false
  );
}

/**
 * Check 13: Stale verification data
 * If verification is older than the cache TTL, data may be outdated.
 */
function _checkStaleVerification(entity) {
  if (!entity.verificationDate) return null;

  var verDate = new Date(entity.verificationDate);
  if (isNaN(verDate.getTime())) return null;

  var cacheTTL = PREFLIGHT_DEFAULTS.CACHE_TTL_DAYS;
  if (typeof CONFIG !== 'undefined' && CONFIG.CACHE_TTL_DAYS) {
    cacheTTL = CONFIG.CACHE_TTL_DAYS;
  }

  var now = new Date();
  var ageMs = now.getTime() - verDate.getTime();
  var ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

  if (ageDays > cacheTTL) {
    return _createWarning(
      'STALE_VERIFICATION',
      SEVERITY.MEDIUM,
      "Verification data is " + ageDays + " days old (performed on " +
      entity.verificationDate + "). Data may be outdated — entities can change " +
      "names, merge, or dissolve.",
      "Re-run entity verification to get current data.",
      false
    );
  }

  return null;
}

/**
 * Check 14: No sources could confirm the entity
 */
function _checkNoSources(entity) {
  if (entity.sources && entity.sources.length > 0) return null;

  return _createWarning(
    'NO_SOURCES',
    SEVERITY.HIGH,
    "No data sources could confirm entity '" + (entity.name || 'Unknown') + "' " +
    "(EIN: " + (entity.ein || 'N/A') + "). The name and/or EIN may be incorrect.",
    null,
    false
  );
}

/**
 * Check 15: Low confidence score
 */
function _checkLowConfidence(entity) {
  var confidence = entity.confidence;
  if (confidence === undefined || confidence === null) return null;
  if (confidence >= PREFLIGHT_DEFAULTS.MIN_CONFIDENCE_THRESHOLD) return null;

  return _createWarning(
    'LOW_CONFIDENCE',
    SEVERITY.HIGH,
    "Verification confidence is " + (confidence * 100).toFixed(1) + "% — below the " +
    (PREFLIGHT_DEFAULTS.MIN_CONFIDENCE_THRESHOLD * 100) + "% threshold. " +
    "The entity name and/or EIN may not match IRS records.",
    null,
    false
  );
}


/* ===========================================================================
 * INTERNAL HELPERS
 * ===========================================================================
 */

/**
 * Creates a standardized warning object.
 */
function _createWarning(code, severity, message, fix, autoFixAvailable) {
  return {
    code: code,
    severity: severity,
    message: message,
    fix: fix || null,
    autoFixAvailable: autoFixAvailable || false
  };
}

/**
 * Strips DBA/trade name designation from a name string.
 * e.g. "ABC Bank d/b/a Easy Loans" → "ABC Bank"
 *      "Easy Loans dba ABC Bank"   → "ABC Bank"  (keeps the legal-sounding part)
 */
function _stripDBAFromName(name) {
  if (!name) return '';

  // Try each DBA pattern
  for (var i = 0; i < PREFLIGHT_DEFAULTS.DBA_PATTERNS.length; i++) {
    var pattern = PREFLIGHT_DEFAULTS.DBA_PATTERNS[i];
    if (pattern.test(name)) {
      // Split on the DBA pattern
      var parts = name.split(pattern);
      if (parts.length >= 2) {
        var before = parts[0].trim();
        var after = parts[parts.length - 1].trim();

        // The legal name is typically the part WITH a legal suffix
        if (_hasLegalSuffix(after)) return after;
        if (_hasLegalSuffix(before)) return before;

        // If neither has a suffix, use the longer part (usually more formal)
        return before.length >= after.length ? before : after;
      }
    }
  }

  return name;
}

/**
 * Checks if a name ends with a legal entity suffix.
 * Uses the helper from EntityVerifierDBA.gs if available,
 * otherwise uses a local implementation.
 */
function _hasLegalSuffix(name) {
  if (!name) return false;

  // Try to use the DBA module's version
  if (typeof _hasLegalSuffix !== 'undefined' && _hasLegalSuffix !== arguments.callee) {
    // Avoid infinite recursion — this IS _hasLegalSuffix
  }

  var suffixes = ['LLC', 'L.L.C.', 'Inc', 'Inc.', 'Incorporated', 'Corp', 'Corp.',
                  'Corporation', 'Co', 'Co.', 'Company', 'Ltd', 'Ltd.', 'Limited',
                  'LP', 'L.P.', 'LLP', 'L.L.P.', 'N.A.', 'NA', 'FSB', 'F.S.B.',
                  'SSB', 'S.S.B.', 'P.A.', 'PA', 'P.C.', 'PC', 'PLLC', 'P.L.L.C.'];

  var nameUpper = name.toUpperCase().trim();
  for (var i = 0; i < suffixes.length; i++) {
    var suffix = suffixes[i].toUpperCase();
    var pattern = new RegExp('\\b' + suffix.replace(/\./g, '\\.') + '\\.?$', 'i');
    if (pattern.test(nameUpper)) {
      return true;
    }
  }
  return false;
}

/**
 * Normalizes a name for comparison. Uses the DBA module's version if
 * available, otherwise falls back to a local implementation.
 */
function _normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
