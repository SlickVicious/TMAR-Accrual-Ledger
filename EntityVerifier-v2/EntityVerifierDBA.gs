/**
 * ============================================================================
 * EntityVerifierDBA.gs — DBA / Trade Name Resolution Engine
 * ============================================================================
 *
 * Purpose:
 *   Resolves consumer-facing trade names (DBAs) to IRS-registered legal entity
 *   names. Many companies operate under names different from their legal
 *   registration — this engine detects those cases and returns the correct
 *   legal name so that 1099 filings match what the IRS has on record,
 *   preventing SMF018 / SHAREDIRFORM015 rejections.
 *
 * Version:   2.0.0
 * Engine:    Entity Verifier v2
 * Platform:  Google Apps Script (Google Sheets)
 *
 * Dependencies:
 *   - EntityVerifierConfig.gs  (CONFIG object, API helpers)
 *   - EntityVerifierSources.gs (queryFDIC, queryNMLS, querySEC, etc.)
 *
 * Entry Point:
 *   resolveDBA(tradeName, ein, entityType)
 *
 * ============================================================================
 */

/* ===========================================================================
 * KNOWN DBA MAPPINGS
 * Confirmed DBA-to-legal-name resolutions. Checked FIRST before any external
 * query, providing instant results for previously resolved entities.
 * ===========================================================================
 */
var KNOWN_DBA_MAPPINGS = {
  'Veterans United Home Loans': {
    legalName: 'Mortgage Research Center LLC',
    ein: '75-2921540',
    source: 'HUD Neighborhood Watch'
  },
  'Fidelity Investments': {
    legalName: 'FMR LLC',
    ein: '04-3523567',
    source: 'SEC EDGAR'
  },
  'Spectrum': {
    legalName: 'Charter Communications Inc',
    ein: null,
    source: 'FCC/SEC'
  },
  'Cash App': {
    legalName: 'Block Inc',
    ein: null,
    source: 'SEC EDGAR'
  },
  'Venmo': {
    legalName: 'PayPal Inc',
    ein: '83-0364903',
    source: 'SEC EDGAR'
  },
  'Zelle': {
    legalName: 'Early Warning Services LLC',
    ein: null,
    source: 'FinCEN MSB / SEC'
  },
  'QuickBooks': {
    legalName: 'Intuit Inc',
    ein: '77-0034661',
    source: 'SEC EDGAR'
  },
  'TurboTax': {
    legalName: 'Intuit Inc',
    ein: '77-0034661',
    source: 'SEC EDGAR'
  },
  'Rocket Mortgage': {
    legalName: 'Rocket Mortgage LLC',
    ein: null,
    source: 'HUD Neighborhood Watch'
  },
  'SoFi': {
    legalName: 'Social Finance Inc',
    ein: null,
    source: 'SEC EDGAR'
  }
};

/* ===========================================================================
 * LEGAL SUFFIXES
 * Standard suffixes that indicate a name is already a legal entity name
 * rather than a trade/marketing name.
 * ===========================================================================
 */
var LEGAL_SUFFIXES = [
  'LLC', 'L.L.C.', 'L.L.C',
  'Inc', 'Inc.', 'Incorporated',
  'Corp', 'Corp.', 'Corporation',
  'Co', 'Co.', 'Company',
  'Ltd', 'Ltd.', 'Limited',
  'LP', 'L.P.', 'LLP', 'L.L.P.',
  'N.A.', 'NA',
  'FSB', 'F.S.B.',
  'SSB', 'S.S.B.',
  'P.A.', 'PA',
  'P.C.', 'PC',
  'PLLC', 'P.L.L.C.'
];

/* ===========================================================================
 * MARKETING KEYWORDS
 * Words that commonly appear in trade names / DBAs rather than legal names.
 * ===========================================================================
 */
var MARKETING_KEYWORDS = [
  'Home Loans', 'Home Lending', 'Financial Services', 'Financial Solutions',
  'Mortgage Services', 'Insurance Services', 'Credit Services',
  'Capital Solutions', 'Wealth Management', 'Investment Services',
  'Payment Solutions', 'Money Transfer', 'Quick', 'Smart', 'Easy',
  'Express', 'Direct', 'Online', 'Digital', 'Mobile', 'My '
];

/* ===========================================================================
 * resolveDBA(tradeName, ein, entityType)
 *
 * Main entry point. Resolves a consumer-facing trade name to the
 * IRS-registered legal entity name.
 *
 * @param {string} tradeName   - The name as it appears on statements/bills
 * @param {string} ein         - Employer Identification Number (XX-XXXXXXX)
 * @param {string} entityType  - Classification from EntityVerifier taxonomy
 *                                (MORTGAGE_LENDER, NATIONAL_BANK, etc.)
 *
 * @return {Object} Resolution result with isDBA, legalName, confidence, etc.
 * ===========================================================================
 */
function resolveDBA(tradeName, ein, entityType) {
  var result = {
    isDBA: false,
    tradeName: tradeName || '',
    legalName: null,
    confidence: 0,
    sources: [],
    resolution: '',
    recommendedFilingName: tradeName || ''
  };

  // ── Guard: empty input ──
  if (!tradeName || typeof tradeName !== 'string' || tradeName.trim() === '') {
    result.resolution = 'No trade name provided.';
    return result;
  }

  tradeName = tradeName.trim();
  result.tradeName = tradeName;

  // ── Step 1: Check KNOWN_DBA_MAPPINGS ──
  var knownKey = _findKnownDBAKey(tradeName);
  if (knownKey) {
    var known = KNOWN_DBA_MAPPINGS[knownKey];
    result.isDBA = true;
    result.legalName = known.legalName;
    result.confidence = 1.0;
    result.sources = [known.source];
    result.resolution = "Known DBA mapping: '" + tradeName + "' is a trade name for '" + known.legalName + "'.";
    result.recommendedFilingName = known.legalName;

    // If caller provided EIN and it matches known mapping, boost trust
    if (ein && known.ein && _normalizeEIN(ein) === _normalizeEIN(known.ein)) {
      result.resolution += ' EIN confirmed.';
    }
    return result;
  }

  // ── Step 2: Query external sources by entity type ──
  var sourceResults = _querySourcesByType(tradeName, ein, entityType);

  // ── Step 3: Detect DBA signals ──
  var signals = detectDBASignals(tradeName, sourceResults);

  // ── Step 4: If DBA likely, resolve to legal name ──
  if (signals.likelyDBA && sourceResults.legalCandidates.length > 0) {
    var match = matchDBAToLegal(tradeName, sourceResults.legalCandidates);
    result.isDBA = true;
    result.legalName = match.legalName;
    result.confidence = Math.min(signals.confidence, match.confidence);
    result.sources = sourceResults.confirmedSources;
    result.resolution = "'" + tradeName + "' appears to be a DBA/trade name for '" + match.legalName + "'. " +
                        'Signals: ' + signals.signals.join('; ') + '.';
    result.recommendedFilingName = match.legalName;
  } else if (signals.likelyDBA && sourceResults.legalCandidates.length === 0) {
    // DBA suspected but no legal name candidate found
    result.isDBA = true;
    result.legalName = null;
    result.confidence = signals.confidence * 0.5;
    result.sources = sourceResults.confirmedSources;
    result.resolution = "'" + tradeName + "' shows DBA signals but no legal name could be resolved. " +
                        'Signals: ' + signals.signals.join('; ') + '. Manual verification required.';
    result.recommendedFilingName = tradeName; // use as-is until resolved
  } else {
    // Not a DBA — the input name appears to be the legal name
    result.isDBA = false;
    result.legalName = tradeName;
    result.confidence = sourceResults.confirmedSources.length > 0 ? 0.85 : 0.5;
    result.sources = sourceResults.confirmedSources;
    result.resolution = "'" + tradeName + "' appears to be the legal entity name (no DBA signals detected).";
    result.recommendedFilingName = tradeName;
  }

  return result;
}


/* ===========================================================================
 * detectDBASignals(inputName, sourceResults)
 *
 * Analyzes whether the input name is likely a DBA based on multiple
 * heuristics and source data.
 *
 * @param {string} inputName      - The consumer-facing name
 * @param {Object} sourceResults  - Results from _querySourcesByType
 *
 * @return {Object} { likelyDBA, signals, confidence }
 * ===========================================================================
 */
function detectDBASignals(inputName, sourceResults) {
  var signals = [];
  var score = 0;
  var maxScore = 0;

  // ── Signal 1: No legal suffix in input name ──
  maxScore += 1;
  if (!_hasLegalSuffix(inputName)) {
    signals.push('No legal suffix (LLC, Inc, Corp, etc.) in name');
    score += 0.6;
  }

  // ── Signal 2: Contains marketing/DBA-style words ──
  maxScore += 1;
  var marketingHits = _findMarketingKeywords(inputName);
  if (marketingHits.length > 0) {
    signals.push('Contains marketing keywords: ' + marketingHits.join(', '));
    score += 0.4;
  }

  // ── Signal 3: Source returned a different legal name ──
  maxScore += 2;
  if (sourceResults.legalCandidates && sourceResults.legalCandidates.length > 0) {
    var bestCandidate = sourceResults.legalCandidates[0];
    var nameNorm = _normalizeName(inputName);
    var candidateNorm = _normalizeName(bestCandidate.name);
    if (nameNorm !== candidateNorm) {
      signals.push("Source returned different name: '" + bestCandidate.name + "' (from " + bestCandidate.source + ')');
      score += 1.5;
    }
  }

  // ── Signal 4: Source explicitly flags as DBA/trade name ──
  maxScore += 2;
  if (sourceResults.explicitDBAFlag) {
    signals.push('Source explicitly identifies name as a DBA/trade name');
    score += 2.0;
  }

  // ── Signal 5: Multiple sources agree on a different legal name ──
  maxScore += 1.5;
  if (sourceResults.legalCandidates && sourceResults.legalCandidates.length >= 2) {
    var firstNorm = _normalizeName(sourceResults.legalCandidates[0].name);
    var agreeing = sourceResults.legalCandidates.filter(function(c) {
      return _normalizeName(c.name) === firstNorm;
    });
    if (agreeing.length >= 2) {
      signals.push('Multiple sources (' + agreeing.length + ') agree on legal name: ' + sourceResults.legalCandidates[0].name);
      score += 1.5;
    }
  }

  // ── Signal 6: Input name significantly shorter than legal name ──
  maxScore += 0.5;
  if (sourceResults.legalCandidates && sourceResults.legalCandidates.length > 0) {
    var legalLen = sourceResults.legalCandidates[0].name.length;
    var inputLen = inputName.length;
    if (inputLen < legalLen * 0.6) {
      signals.push('Trade name significantly shorter than legal name (' + inputLen + ' vs ' + legalLen + ' chars)');
      score += 0.5;
    }
  }

  // ── Calculate confidence ──
  var confidence = maxScore > 0 ? Math.min(score / maxScore, 1.0) : 0;
  var likelyDBA = score >= 1.2; // threshold: need at least moderate signal strength

  return {
    likelyDBA: likelyDBA,
    signals: signals,
    confidence: confidence
  };
}


/* ===========================================================================
 * matchDBAToLegal(tradeName, legalCandidates)
 *
 * Given a trade name and an array of candidate legal names from various
 * sources, determines which legal name is the correct match.
 *
 * @param {string} tradeName        - The trade / DBA name
 * @param {Array}  legalCandidates  - Array of { name, source, score? }
 *
 * @return {Object} { legalName, confidence, source }
 * ===========================================================================
 */
function matchDBAToLegal(tradeName, legalCandidates) {
  if (!legalCandidates || legalCandidates.length === 0) {
    return { legalName: null, confidence: 0, source: 'none' };
  }

  if (legalCandidates.length === 1) {
    return {
      legalName: legalCandidates[0].name,
      confidence: 0.7,
      source: legalCandidates[0].source
    };
  }

  // Score each candidate
  var scored = legalCandidates.map(function(candidate) {
    var s = 0;

    // ── Exact substring match ──
    var tradeNorm = _normalizeName(tradeName);
    var candNorm = _normalizeName(candidate.name);
    if (candNorm.indexOf(tradeNorm) !== -1 || tradeNorm.indexOf(candNorm) !== -1) {
      s += 3;
    }

    // ── Word overlap ──
    var tradeWords = _extractWords(tradeName);
    var candWords = _extractWords(candidate.name);
    var overlap = 0;
    for (var i = 0; i < tradeWords.length; i++) {
      for (var j = 0; j < candWords.length; j++) {
        if (tradeWords[i] === candWords[j]) {
          overlap++;
          break;
        }
      }
    }
    if (tradeWords.length > 0) {
      s += (overlap / tradeWords.length) * 2;
    }

    // ── Known DBA registration ──
    var knownKey = _findKnownDBAKey(tradeName);
    if (knownKey && KNOWN_DBA_MAPPINGS[knownKey].legalName === candidate.name) {
      s += 5;
    }

    // ── Source authority bonus ──
    var authoritySources = ['FDIC BankFind', 'SEC EDGAR', 'FINRA BrokerCheck',
                            'HUD Neighborhood Watch', 'NMLS', 'NAIC'];
    for (var k = 0; k < authoritySources.length; k++) {
      if (candidate.source === authoritySources[k]) {
        s += 1;
        break;
      }
    }

    // ── Multiple sources confirm same name ──
    var confirming = legalCandidates.filter(function(c) {
      return _normalizeName(c.name) === candNorm && c.source !== candidate.source;
    });
    s += confirming.length * 0.5;

    return {
      name: candidate.name,
      source: candidate.source,
      score: s
    };
  });

  // Sort by score descending
  scored.sort(function(a, b) { return b.score - a.score; });

  var best = scored[0];
  var maxPossibleScore = 11; // rough ceiling
  var confidence = Math.min(best.score / maxPossibleScore, 1.0);

  // If top two candidates are very close in score, lower confidence
  if (scored.length >= 2 && (best.score - scored[1].score) < 0.5) {
    confidence *= 0.7;
  }

  return {
    legalName: best.name,
    confidence: Math.round(confidence * 100) / 100,
    source: best.source
  };
}


/* ===========================================================================
 * INTERNAL HELPERS
 * ===========================================================================
 */

/**
 * Searches KNOWN_DBA_MAPPINGS for a match, case-insensitive.
 * Returns the key if found, null otherwise.
 */
function _findKnownDBAKey(name) {
  if (!name) return null;
  var nameNorm = name.trim().toLowerCase();
  var keys = Object.keys(KNOWN_DBA_MAPPINGS);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase() === nameNorm) {
      return keys[i];
    }
  }
  return null;
}

/**
 * Normalizes a name for comparison: lowercase, strip punctuation,
 * collapse whitespace.
 */
function _normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes an EIN to digits only (9 digits) for comparison.
 */
function _normalizeEIN(ein) {
  if (!ein) return '';
  return ein.replace(/\D/g, '');
}

/**
 * Checks whether a name contains a recognized legal entity suffix.
 */
function _hasLegalSuffix(name) {
  if (!name) return false;
  var nameUpper = name.toUpperCase().trim();
  for (var i = 0; i < LEGAL_SUFFIXES.length; i++) {
    var suffix = LEGAL_SUFFIXES[i].toUpperCase();
    // Check if the name ends with the suffix (with optional trailing period)
    var pattern = new RegExp('\\b' + suffix.replace(/\./g, '\\.') + '\\.?$', 'i');
    if (pattern.test(nameUpper)) {
      return true;
    }
  }
  return false;
}

/**
 * Finds any marketing-style keywords present in the name.
 */
function _findMarketingKeywords(name) {
  if (!name) return [];
  var found = [];
  var nameUpper = name.toUpperCase();
  for (var i = 0; i < MARKETING_KEYWORDS.length; i++) {
    if (nameUpper.indexOf(MARKETING_KEYWORDS[i].toUpperCase()) !== -1) {
      found.push(MARKETING_KEYWORDS[i]);
    }
  }
  return found;
}

/**
 * Extracts significant words from a name (drops common filler words
 * and legal suffixes).
 */
function _extractWords(name) {
  if (!name) return [];
  var stopWords = ['the', 'of', 'and', 'for', 'a', 'an', 'in', 'at', 'by', 'to', 'or', 'as'];
  var suffixWords = LEGAL_SUFFIXES.map(function(s) { return s.toLowerCase().replace(/\./g, ''); });
  var words = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  return words.filter(function(w) {
    return w.length > 1 &&
           stopWords.indexOf(w) === -1 &&
           suffixWords.indexOf(w) === -1;
  });
}

/**
 * Queries external data sources in priority order based on entity type.
 * Returns a unified sourceResults object.
 *
 * @param {string} tradeName   - Name to search for
 * @param {string} ein         - EIN to search for
 * @param {string} entityType  - Entity classification
 *
 * @return {Object} { legalCandidates, confirmedSources, explicitDBAFlag }
 */
function _querySourcesByType(tradeName, ein, entityType) {
  var results = {
    legalCandidates: [],    // Array of { name, source, score }
    confirmedSources: [],   // Array of source names that returned data
    explicitDBAFlag: false  // Whether any source explicitly flagged as DBA
  };

  var queryOrder = _getQueryOrder(entityType);

  for (var i = 0; i < queryOrder.length; i++) {
    var sourceName = queryOrder[i];
    try {
      var sourceResult = _querySingleSource(sourceName, tradeName, ein);
      if (sourceResult && sourceResult.found) {
        results.confirmedSources.push(sourceName);

        if (sourceResult.legalName &&
            _normalizeName(sourceResult.legalName) !== _normalizeName(tradeName)) {
          results.legalCandidates.push({
            name: sourceResult.legalName,
            source: sourceName,
            score: sourceResult.confidence || 0.5
          });
        }

        if (sourceResult.isDBAFlagged) {
          results.explicitDBAFlag = true;
        }
      }
    } catch (e) {
      // Source query failed — log and continue
      Logger.log('DBA source query failed for ' + sourceName + ': ' + e.message);
    }
  }

  return results;
}

/**
 * Determines the optimal query order based on entity type.
 * More authoritative sources for the entity type come first.
 */
function _getQueryOrder(entityType) {
  var type = (entityType || '').toUpperCase().replace(/[\s-]/g, '_');

  switch (type) {
    case 'MORTGAGE_LENDER':
      return ['HUD Neighborhood Watch', 'NMLS', 'CFPB', 'State SOS', 'OpenCorporates'];

    case 'NATIONAL_BANK':
    case 'STATE_BANK':
      return ['FDIC BankFind', 'FFIEC NIC', 'State SOS', 'CFPB', 'OpenCorporates'];

    case 'BROKER_DEALER':
      return ['FINRA BrokerCheck', 'SEC IARD', 'SEC EDGAR', 'State SOS', 'OpenCorporates'];

    case 'PAYMENT_PROCESSOR':
    case 'MONEY_TRANSMITTER':
      return ['FinCEN MSB', 'NMLS', 'State SOS', 'SEC EDGAR', 'OpenCorporates'];

    case 'INSURANCE_COMPANY':
      return ['NAIC', 'State SOS', 'SEC EDGAR', 'OpenCorporates'];

    case 'CREDIT_UNION':
      return ['NCUA', 'FFIEC NIC', 'State SOS', 'OpenCorporates'];

    default:
      // Generic order: broad sources first
      return ['State SOS', 'SEC EDGAR', 'CFPB', 'OpenCorporates', 'FDIC BankFind'];
  }
}

/**
 * Queries a single data source and returns a normalized result.
 * Delegates to the appropriate source-specific query function.
 *
 * @param {string} sourceName  - Source identifier
 * @param {string} name        - Entity name to query
 * @param {string} ein         - EIN to query
 *
 * @return {Object|null} { found, legalName, isDBAFlagged, confidence }
 */
function _querySingleSource(sourceName, name, ein) {
  // Each source integration returns { found, legalName, isDBAFlagged, confidence, rawData }
  // These call functions defined in EntityVerifierSources.gs

  switch (sourceName) {
    case 'FDIC BankFind':
      return _queryFDICForDBA(name, ein);
    case 'FFIEC NIC':
      return _queryFFIECForDBA(name, ein);
    case 'SEC EDGAR':
      return _querySECForDBA(name, ein);
    case 'SEC IARD':
      return _querySECIARDForDBA(name, ein);
    case 'FINRA BrokerCheck':
      return _queryFINRAForDBA(name, ein);
    case 'NMLS':
      return _queryNMLSForDBA(name, ein);
    case 'HUD Neighborhood Watch':
      return _queryHUDForDBA(name, ein);
    case 'NAIC':
      return _queryNAICForDBA(name, ein);
    case 'FinCEN MSB':
      return _queryFinCENForDBA(name, ein);
    case 'CFPB':
      return _queryCFPBForDBA(name, ein);
    case 'State SOS':
      return _queryStateSOSForDBA(name, ein);
    case 'NCUA':
      return _queryNCUAForDBA(name, ein);
    case 'OpenCorporates':
      return _queryOpenCorporatesForDBA(name, ein);
    default:
      Logger.log('Unknown DBA source: ' + sourceName);
      return null;
  }
}


/* ===========================================================================
 * SOURCE QUERY ADAPTERS
 *
 * Each adapter wraps the source-specific query function (from
 * EntityVerifierSources.gs) and normalizes the response into the DBA
 * resolution format. If the source module is not available, the adapter
 * returns null gracefully.
 * ===========================================================================
 */

function _queryFDICForDBA(name, ein) {
  try {
    if (typeof queryFDIC !== 'function') return null;
    var raw = queryFDIC(name, ein);
    if (!raw || !raw.found) return { found: false };
    var legalName = raw.legalName || raw.institutionName || null;
    var isDBA = raw.tradeNames && raw.tradeNames.length > 0;
    return {
      found: true,
      legalName: legalName,
      isDBAFlagged: isDBA,
      confidence: raw.confidence || 0.8
    };
  } catch (e) {
    Logger.log('_queryFDICForDBA error: ' + e.message);
    return null;
  }
}

function _queryFFIECForDBA(name, ein) {
  try {
    if (typeof queryFFIEC !== 'function') return null;
    var raw = queryFFIEC(name, ein);
    if (!raw || !raw.found) return { found: false };
    return {
      found: true,
      legalName: raw.legalName || raw.institutionName || null,
      isDBAFlagged: raw.isDBA || false,
      confidence: raw.confidence || 0.7
    };
  } catch (e) {
    Logger.log('_queryFFIECForDBA error: ' + e.message);
    return null;
  }
}

function _querySECForDBA(name, ein) {
  try {
    if (typeof querySEC !== 'function') return null;
    var raw = querySEC(name, ein);
    if (!raw || !raw.found) return { found: false };
    return {
      found: true,
      legalName: raw.legalName || raw.companyName || null,
      isDBAFlagged: raw.formerNames && raw.formerNames.length > 0,
      confidence: raw.confidence || 0.8
    };
  } catch (e) {
    Logger.log('_querySECForDBA error: ' + e.message);
    return null;
  }
}

function _querySECIARDForDBA(name, ein) {
  try {
    if (typeof querySECIARD !== 'function') return null;
    var raw = querySECIARD(name, ein);
    if (!raw || !raw.found) return { found: false };
    return {
      found: true,
      legalName: raw.legalName || null,
      isDBAFlagged: raw.isDBA || false,
      confidence: raw.confidence || 0.7
    };
  } catch (e) {
    Logger.log('_querySECIARDForDBA error: ' + e.message);
    return null;
  }
}

function _queryFINRAForDBA(name, ein) {
  try {
    if (typeof queryFINRA !== 'function') return null;
    var raw = queryFINRA(name, ein);
    if (!raw || !raw.found) return { found: false };
    return {
      found: true,
      legalName: raw.legalName || raw.firmName || null,
      isDBAFlagged: raw.otherNames && raw.otherNames.length > 0,
      confidence: raw.confidence || 0.8
    };
  } catch (e) {
    Logger.log('_queryFINRAForDBA error: ' + e.message);
    return null;
  }
}

function _queryNMLSForDBA(name, ein) {
  try {
    if (typeof queryNMLS !== 'function') return null;
    var raw = queryNMLS(name, ein);
    if (!raw || !raw.found) return { found: false };
    return {
      found: true,
      legalName: raw.legalName || null,
      isDBAFlagged: raw.tradeNames && raw.tradeNames.length > 0,
      confidence: raw.confidence || 0.75
    };
  } catch (e) {
    Logger.log('_queryNMLSForDBA error: ' + e.message);
    return null;
  }
}

function _queryHUDForDBA(name, ein) {
  try {
    if (typeof queryHUD !== 'function') return null;
    var raw = queryHUD(name, ein);
    if (!raw || !raw.found) return { found: false };
    return {
      found: true,
      legalName: raw.legalName || raw.lenderName || null,
      isDBAFlagged: raw.dbaName ? true : false,
      confidence: raw.confidence || 0.85
    };
  } catch (e) {
    Logger.log('_queryHUDForDBA error: ' + e.message);
    return null;
  }
}

function _queryNAICForDBA(name, ein) {
  try {
    if (typeof queryNAIC !== 'function') return null;
    var raw = queryNAIC(name, ein);
    if (!raw || !raw.found) return { found: false };
    return {
      found: true,
      legalName: raw.legalName || raw.companyName || null,
      isDBAFlagged: raw.isDBA || false,
      confidence: raw.confidence || 0.75
    };
  } catch (e) {
    Logger.log('_queryNAICForDBA error: ' + e.message);
    return null;
  }
}

function _queryFinCENForDBA(name, ein) {
  try {
    if (typeof queryFinCEN !== 'function') return null;
    var raw = queryFinCEN(name, ein);
    if (!raw || !raw.found) return { found: false };
    return {
      found: true,
      legalName: raw.legalName || null,
      isDBAFlagged: raw.dbaNames && raw.dbaNames.length > 0,
      confidence: raw.confidence || 0.7
    };
  } catch (e) {
    Logger.log('_queryFinCENForDBA error: ' + e.message);
    return null;
  }
}

function _queryCFPBForDBA(name, ein) {
  try {
    if (typeof queryCFPB !== 'function') return null;
    var raw = queryCFPB(name, ein);
    if (!raw || !raw.found) return { found: false };
    // CFPB normalizes names in complaints database
    return {
      found: true,
      legalName: raw.normalizedName || raw.companyName || null,
      isDBAFlagged: raw.normalizedName &&
                    _normalizeName(raw.normalizedName) !== _normalizeName(name),
      confidence: raw.confidence || 0.5
    };
  } catch (e) {
    Logger.log('_queryCFPBForDBA error: ' + e.message);
    return null;
  }
}

function _queryStateSOSForDBA(name, ein) {
  try {
    if (typeof queryStateSOS !== 'function') return null;
    var raw = queryStateSOS(name, ein);
    if (!raw || !raw.found) return { found: false };
    return {
      found: true,
      legalName: raw.legalName || raw.entityName || null,
      isDBAFlagged: raw.fictitiousNames && raw.fictitiousNames.length > 0,
      confidence: raw.confidence || 0.7
    };
  } catch (e) {
    Logger.log('_queryStateSOSForDBA error: ' + e.message);
    return null;
  }
}

function _queryNCUAForDBA(name, ein) {
  try {
    if (typeof queryNCUA !== 'function') return null;
    var raw = queryNCUA(name, ein);
    if (!raw || !raw.found) return { found: false };
    return {
      found: true,
      legalName: raw.legalName || raw.cuName || null,
      isDBAFlagged: false,
      confidence: raw.confidence || 0.7
    };
  } catch (e) {
    Logger.log('_queryNCUAForDBA error: ' + e.message);
    return null;
  }
}

function _queryOpenCorporatesForDBA(name, ein) {
  try {
    if (typeof queryOpenCorporates !== 'function') return null;
    var raw = queryOpenCorporates(name, ein);
    if (!raw || !raw.found) return { found: false };
    return {
      found: true,
      legalName: raw.legalName || raw.companyName || null,
      isDBAFlagged: raw.alternativeNames && raw.alternativeNames.length > 0,
      confidence: raw.confidence || 0.5
    };
  } catch (e) {
    Logger.log('_queryOpenCorporatesForDBA error: ' + e.message);
    return null;
  }
}
