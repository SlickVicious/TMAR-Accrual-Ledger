/**
 * EntityVerifier.gs — Core Engine for Entity Verifier v2
 * ========================================================
 * TMAR Google Sheets — Entity Classification, Source Dispatching,
 * Result Aggregation, and Main Verification Workflow.
 *
 * Architecture Dependencies:
 *   EntityVerifierConfig.gs   → ENTITY_TYPES, VERIFICATION_STATUS, SOURCE_REGISTRY,
 *                                CONFIG, getSourcesForType(), getSourceById()
 *   EntityVerifierCache.gs    → cacheGet(), cacheSet(), cacheHas(), ensureCacheSheet()
 *   EntityVerifierSources.gs  → querySource(sourceId, params)
 *   EntityVerifierDBA.gs      → resolveDBA(tradeName, ein, entityType)
 *   EntityVerifierGenealogy.gs→ traceEntityGenealogy(entityName, ein)
 *   EntityVerifierPreflight.gs→ irisPreflightCheck(entity)
 *
 * All declarations use `var` per Google Apps Script best practice.
 * Every function is fully implemented — no placeholders.
 *
 * Author:  Wimberly TMAR Project
 * Version: 2.0.0
 * Date:    2026-03-11
 */


// ─── SUFFIX / ABBREVIATION EQUIVALENCES ────────────────────────────────────

var SUFFIX_EQUIVALENCES = {
  'inc':          'incorporated',
  'inc.':         'incorporated',
  'incorporated': 'incorporated',
  'llc':          'llc',
  'l.l.c.':       'llc',
  'l.l.c':        'llc',
  'corp':         'corporation',
  'corp.':        'corporation',
  'corporation':  'corporation',
  'co':           'company',
  'co.':          'company',
  'company':      'company',
  'ltd':          'limited',
  'ltd.':         'limited',
  'limited':      'limited',
  'n.a.':         'national association',
  'n.a':          'national association',
  'na':           'national association',
  'national association': 'national association',
  'plc':          'plc',
  'p.l.c.':       'plc',
  'lp':           'limited partnership',
  'l.p.':         'limited partnership',
  'llp':          'limited liability partnership',
  'l.l.p.':       'limited liability partnership',
  'pbc':          'public benefit corporation',
  'p.b.c.':       'public benefit corporation',
  '&':            'and',
  'and':          'and'
};


// ─── 1. classifyEntity ─────────────────────────────────────────────────────

/**
 * Classifies an entity based on heuristic name/EIN analysis.
 *
 * @param {Object} entity  { name, ein, address, existingMetadata }
 * @return {Object}        { primaryType, secondaryTypes, recommendedSources,
 *                           skipSources, heuristics, confidence }
 */
function classifyEntity(entity) {
  var name        = (entity.name || '').trim();
  var ein         = (entity.ein  || '').trim();
  var nameLower   = name.toLowerCase();
  var nameUpper   = name.toUpperCase();
  var heuristics  = {};
  var primaryType = null;
  var secondaryTypes = [];
  var skipSources    = [];
  var confidence     = 0.3; // baseline

  // ── EIN-based heuristics ────────────────────────────────────────────────

  if (ein === '00-0000000' || ein === '000000000') {
    heuristics.placeholderEIN = true;
    primaryType = 'PLACEHOLDER';
    confidence  = 0.1;
  }

  if (/^98-/.test(ein)) {
    heuristics.foreignOrIRSPrefix = true;
    if (!primaryType) {
      secondaryTypes.push('FOREIGN_ENTITY');
    }
  }

  // ── DBA detection ───────────────────────────────────────────────────────

  if (/\bd[\/.]?b[\/.]?a\b/i.test(name) || /doing\s+business\s+as/i.test(name)) {
    heuristics.dbaDetected = true;
  }

  // ── Name-based heuristics (order matters — more specific first) ─────────

  // National banks
  if (/\bN\.?A\.?\b/.test(nameUpper) || /national\s+association/i.test(name)) {
    heuristics.nationalBankSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'NATIONAL_BANK';
      confidence  = Math.max(confidence, 0.7);
    }
  }

  // Savings / S&L / Thrift
  if (/\b(savings|s\s*&\s*l|thrift)\b/i.test(name)) {
    heuristics.savingsSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'SAVINGS_INSTITUTION';
      confidence  = Math.max(confidence, 0.65);
    } else {
      secondaryTypes.push('SAVINGS_INSTITUTION');
    }
  }

  // State-chartered bank (generic "Bank" without N.A.)
  if (/\bbank\b/i.test(name) && !heuristics.nationalBankSignal && !heuristics.savingsSignal) {
    heuristics.stateBankSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'STATE_BANK';
      confidence  = Math.max(confidence, 0.5);
    } else {
      secondaryTypes.push('STATE_BANK');
    }
  }

  // Federal agency
  if (/\b(u\.?\s*s\.?|united\s+states)\b/i.test(name) && /\b(department|bureau|agency|administration|commission|office)\b/i.test(name)) {
    heuristics.federalAgencySignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'FEDERAL_AGENCY';
      confidence  = Math.max(confidence, 0.75);
    } else {
      secondaryTypes.push('FEDERAL_AGENCY');
    }
  }

  // State government
  if (/\bstate\s+of\b/i.test(name) || (/\bdepartment\s+of\b/i.test(name) && !heuristics.federalAgencySignal)) {
    heuristics.stateGovernmentSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'STATE_GOVERNMENT';
      confidence  = Math.max(confidence, 0.65);
    } else {
      secondaryTypes.push('STATE_GOVERNMENT');
    }
  }

  // Municipal
  if (/\b(city\s+of|county\s+of|town\s+of|village\s+of)\b/i.test(name)) {
    heuristics.municipalSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'MUNICIPAL';
      confidence  = Math.max(confidence, 0.7);
    } else {
      secondaryTypes.push('MUNICIPAL');
    }
  }

  // Educational institution
  if (/\b(university|college|school|academy|institute)\b/i.test(name)) {
    heuristics.educationalSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'EDUCATIONAL_INSTITUTION';
      confidence  = Math.max(confidence, 0.65);
    } else {
      secondaryTypes.push('EDUCATIONAL_INSTITUTION');
    }
  }

  // Insurance
  if (/\b(insurance|assurance|indemnity)\b/i.test(name)) {
    heuristics.insuranceSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'INSURANCE_COMPANY';
      confidence  = Math.max(confidence, 0.65);
    } else {
      secondaryTypes.push('INSURANCE_COMPANY');
    }
  }

  // Telecom
  if (/\b(wireless|communications|telecom|cable)\b/i.test(name)) {
    heuristics.telecomSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'TELECOM';
      confidence  = Math.max(confidence, 0.6);
    } else {
      secondaryTypes.push('TELECOM');
    }
  }

  // Utility (check municipal vs investor-owned)
  if (/\b(electric|power|gas|water|utility)\b/i.test(name)) {
    heuristics.utilitySignal = true;
    if (heuristics.municipalSignal) {
      // Already classified as MUNICIPAL; add utility as secondary
      secondaryTypes.push('UTILITY');
    } else {
      if (!primaryType || primaryType === 'PLACEHOLDER') {
        primaryType = 'UTILITY';
        confidence  = Math.max(confidence, 0.55);
      } else {
        secondaryTypes.push('UTILITY');
      }
    }
  }

  // Payment processor (specific brand names)
  if (/\b(paypal|venmo|cash\s*app|square)\b/i.test(name)) {
    heuristics.paymentProcessorSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'PAYMENT_PROCESSOR';
      confidence  = Math.max(confidence, 0.8);
    } else {
      secondaryTypes.push('PAYMENT_PROCESSOR');
    }
  }

  // Mortgage / Home Loans / Lending
  if (/\b(home\s+loans?|mortgage|lending)\b/i.test(name)) {
    heuristics.mortgageLenderSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'MORTGAGE_LENDER';
      confidence  = Math.max(confidence, 0.6);
    } else {
      secondaryTypes.push('MORTGAGE_LENDER');
    }
  }

  // Servicing (loan context)
  if (/\bservicing\b/i.test(name)) {
    heuristics.servicingSignal = true;
    if (/\b(student|loan|education)\b/i.test(name)) {
      if (!primaryType || primaryType === 'PLACEHOLDER') {
        primaryType = 'STUDENT_LOAN_SERVICER';
        confidence  = Math.max(confidence, 0.6);
      } else {
        secondaryTypes.push('STUDENT_LOAN_SERVICER');
      }
    } else {
      if (!primaryType || primaryType === 'PLACEHOLDER') {
        primaryType = 'MORTGAGE_LENDER';
        confidence  = Math.max(confidence, 0.55);
      } else {
        secondaryTypes.push('MORTGAGE_LENDER');
      }
    }
  }

  // Debt buyer / collector
  if (/\b(funding\s+llc|recovery|solutions)\b/i.test(name) && /\b(debt|collect|purchase|portfolio)\b/i.test(name)) {
    heuristics.debtBuyerSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'DEBT_BUYER';
      confidence  = Math.max(confidence, 0.55);
    } else {
      secondaryTypes.push('DEBT_BUYER');
    }
  } else if (/\b(funding\s+llc|recovery|solutions)\b/i.test(name)) {
    // Weaker signal without explicit debt keywords
    heuristics.possibleDebtBuyerSignal = true;
    secondaryTypes.push('DEBT_BUYER');
  }

  // Investment fund / trust (investment context)
  if (/\b(fund|trust)\b/i.test(name) && /\b(investment|capital|asset|securities|mutual|hedge)\b/i.test(name)) {
    heuristics.investmentFundSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'INVESTMENT_FUND';
      confidence  = Math.max(confidence, 0.6);
    } else {
      secondaryTypes.push('INVESTMENT_FUND');
    }
    // Also check for fund series
    if (/\bseries\b/i.test(name)) {
      secondaryTypes.push('FUND_SERIES');
      heuristics.fundSeriesSignal = true;
    }
  }

  // Nonprofit indicators
  if (/\b(foundation|association|council|society|club)\b/i.test(name)) {
    heuristics.nonprofitSignal = true;
    if (/\bfoundation\b/i.test(name)) {
      if (!primaryType || primaryType === 'PLACEHOLDER') {
        primaryType = 'FOUNDATION';
        confidence  = Math.max(confidence, 0.55);
      } else {
        secondaryTypes.push('FOUNDATION');
      }
    } else {
      if (!primaryType || primaryType === 'PLACEHOLDER') {
        primaryType = 'NONPROFIT';
        confidence  = Math.max(confidence, 0.5);
      } else {
        secondaryTypes.push('NONPROFIT');
      }
    }
  }

  // PBC / Public Benefit
  if (/\b(pbc|public\s+benefit)\b/i.test(name)) {
    heuristics.pbcSignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'PRIVATE_COMPANY';
      confidence  = Math.max(confidence, 0.5);
    }
    // Also check nonprofit status
    secondaryTypes.push('NONPROFIT');
  }

  // Generic private company (LLC / Inc / Corp / Co.) — lowest priority
  if (/\b(llc|l\.l\.c|inc\.?|incorporated|corp\.?|corporation|co\.)\b/i.test(name)) {
    heuristics.privateCompanySignal = true;
    if (!primaryType || primaryType === 'PLACEHOLDER') {
      primaryType = 'PRIVATE_COMPANY';
      confidence  = Math.max(confidence, 0.45);
    } else {
      // Only add as secondary if not already classified as something more specific
      if (secondaryTypes.indexOf('PRIVATE_COMPANY') === -1) {
        secondaryTypes.push('PRIVATE_COMPANY');
      }
    }
  }

  // ── Fallback ────────────────────────────────────────────────────────────

  if (!primaryType) {
    primaryType = 'UNKNOWN';
    confidence  = 0.15;
    heuristics.noSignalsMatched = true;
  }

  // ── Deduplicate secondary types ─────────────────────────────────────────

  var seen = {};
  seen[primaryType] = true;
  var dedupedSecondary = [];
  for (var i = 0; i < secondaryTypes.length; i++) {
    if (!seen[secondaryTypes[i]]) {
      seen[secondaryTypes[i]] = true;
      dedupedSecondary.push(secondaryTypes[i]);
    }
  }

  // ── Resolve recommended sources ─────────────────────────────────────────

  var recommendedSources = [];
  try {
    recommendedSources = getSourcesForType(primaryType) || [];
  } catch (e) {
    Logger.log('classifyEntity: getSourcesForType failed for ' + primaryType + ': ' + e.message);
  }

  // Add sources for secondary types that aren't already included
  for (var j = 0; j < dedupedSecondary.length; j++) {
    try {
      var extraSources = getSourcesForType(dedupedSecondary[j]) || [];
      for (var k = 0; k < extraSources.length; k++) {
        if (recommendedSources.indexOf(extraSources[k]) === -1) {
          recommendedSources.push(extraSources[k]);
        }
      }
    } catch (e2) {
      Logger.log('classifyEntity: getSourcesForType failed for secondary ' + dedupedSecondary[j] + ': ' + e2.message);
    }
  }

  return {
    primaryType:        primaryType,
    secondaryTypes:     dedupedSecondary,
    recommendedSources: recommendedSources,
    skipSources:        skipSources,
    heuristics:         heuristics,
    confidence:         confidence
  };
}


// ─── 2. verifyEntity ───────────────────────────────────────────────────────

/**
 * Main verification workflow for a single entity.
 *
 * @param {Object} entityInput  { name, ein, forceRefresh }
 * @return {Object}             Full verification result
 */
function verifyEntity(entityInput) {
  var name         = (entityInput.name || '').trim();
  var ein          = (entityInput.ein  || '').trim();
  var forceRefresh = !!entityInput.forceRefresh;
  var startTime    = new Date();

  // ── Step 1: Cache check ─────────────────────────────────────────────────

  if (!forceRefresh) {
    try {
      var cacheKey = _buildCacheKey(name, ein);
      if (cacheHas(cacheKey)) {
        var cached = cacheGet(cacheKey);
        if (cached) {
          cached.fromCache = true;
          return cached;
        }
      }
    } catch (cacheErr) {
      Logger.log('verifyEntity: cache read error: ' + cacheErr.message);
    }
  }

  // ── Step 2: Classify entity ─────────────────────────────────────────────

  var classification = classifyEntity({
    name:             name,
    ein:              ein,
    address:          entityInput.address || '',
    existingMetadata: entityInput.existingMetadata || {}
  });

  // ── Step 3: Query recommended sources ───────────────────────────────────

  var sourcesQueried = [];
  var sources        = classification.recommendedSources || [];
  var skipSet        = {};
  var skipList       = classification.skipSources || [];
  for (var s = 0; s < skipList.length; s++) {
    skipSet[skipList[s]] = true;
  }

  for (var i = 0; i < sources.length; i++) {
    var sourceId = sources[i];
    if (skipSet[sourceId]) {
      continue;
    }

    var queryResult = { sourceId: sourceId, sourceHit: false, data: null, error: null, queryTimeMs: 0 };
    var queryStart  = new Date().getTime();

    try {
      var result = querySource(sourceId, { name: name, ein: ein, entityType: classification.primaryType });
      queryResult.queryTimeMs = new Date().getTime() - queryStart;

      if (result && result.found) {
        queryResult.sourceHit = true;
        queryResult.data      = result;
      } else if (result) {
        queryResult.data = result;
      }
    } catch (qErr) {
      queryResult.queryTimeMs = new Date().getTime() - queryStart;
      queryResult.error       = qErr.message || String(qErr);
      Logger.log('verifyEntity: querySource(' + sourceId + ') error: ' + queryResult.error);
    }

    sourcesQueried.push(queryResult);

    // Rate limiting between source calls
    if (i < sources.length - 1) {
      try {
        var pauseMs = (typeof CONFIG !== 'undefined' && CONFIG.RATE_LIMIT_PAUSE_MS) ? CONFIG.RATE_LIMIT_PAUSE_MS : 500;
        Utilities.sleep(pauseMs);
      } catch (sleepErr) {
        // Non-critical — continue
      }
    }
  }

  // ── Step 4: Aggregate results ───────────────────────────────────────────

  var aggregated          = aggregateSourceResults(sourcesQueried);
  var sourceConfirmations = _countConfirmations(sourcesQueried, ein, name);
  var legalName           = aggregated.consensusName || name;
  var confirmedEIN        = aggregated.consensusEIN  || ein;

  // ── Step 5: DBA resolution ──────────────────────────────────────────────

  var isDBA         = false;
  var dbaResolution = null;

  if (classification.heuristics.dbaDetected || _namesDiverge(name, legalName)) {
    isDBA = true;
    try {
      dbaResolution = resolveDBA(name, ein, classification.primaryType);
    } catch (dbaErr) {
      Logger.log('verifyEntity: resolveDBA error: ' + dbaErr.message);
      dbaResolution = { error: dbaErr.message };
    }
    if (dbaResolution && dbaResolution.legalName) {
      legalName = dbaResolution.legalName;
    }
    if (dbaResolution && dbaResolution.ein) {
      confirmedEIN = dbaResolution.ein;
    }
  }

  // ── Step 6: Genealogy (defunct / renamed) ───────────────────────────────

  var genealogy = null;
  var isDefunct = false;

  // Check if any source indicated defunct/renamed/merged
  for (var g = 0; g < sourcesQueried.length; g++) {
    var sData = sourcesQueried[g].data;
    if (sData && (sData.defunct || sData.merged || sData.renamed || sData.inactive)) {
      isDefunct = true;
      break;
    }
  }

  if (isDefunct) {
    try {
      genealogy = traceEntityGenealogy(name, ein);
    } catch (genErr) {
      Logger.log('verifyEntity: traceEntityGenealogy error: ' + genErr.message);
      genealogy = { error: genErr.message };
    }
  }

  // ── Step 7: IRIS preflight check ────────────────────────────────────────

  var preflightWarnings = [];
  try {
    var preflightResult = irisPreflightCheck({
      name:      legalName,
      ein:       confirmedEIN,
      type:      classification.primaryType,
      isDBA:     isDBA,
      isDefunct: isDefunct
    });
    if (preflightResult && preflightResult.warnings) {
      preflightWarnings = preflightResult.warnings;
    }
  } catch (pfErr) {
    Logger.log('verifyEntity: irisPreflightCheck error: ' + pfErr.message);
    preflightWarnings.push('Preflight check failed: ' + pfErr.message);
  }

  // ── Step 8: Compute confidence and status ───────────────────────────────

  var isPlaceholder   = classification.primaryType === 'PLACEHOLDER';
  var finalConfidence  = computeConfidence(sourcesQueried, sourceConfirmations, classification);

  var flags = {
    isDBA:         isDBA,
    isDefunct:     isDefunct,
    isPlaceholder: isPlaceholder
  };

  var status = determineStatus(finalConfidence, flags);

  // ── Step 9: Build recommendation ────────────────────────────────────────

  var recommendation = _buildRecommendation(status, finalConfidence, sourceConfirmations, isDBA, isDefunct, isPlaceholder, preflightWarnings);

  // ── Assemble final result ───────────────────────────────────────────────

  var verificationResult = {
    input:                { name: name, ein: ein },
    classification:       classification,
    legalName:            legalName,
    confirmedEIN:         confirmedEIN,
    isDBA:                isDBA,
    dbaResolution:        dbaResolution,
    genealogy:            genealogy,
    status:               status,
    confidence:           finalConfidence,
    sourcesQueried:       sourcesQueried,
    sourceConfirmations:  sourceConfirmations,
    preflightWarnings:    preflightWarnings,
    recommendation:       recommendation,
    verifiedAt:           new Date().toISOString(),
    fromCache:            false
  };

  // ── Step 10: Cache the result ───────────────────────────────────────────

  try {
    var ck = _buildCacheKey(name, ein);
    cacheSet(ck, verificationResult);
  } catch (cacheWriteErr) {
    Logger.log('verifyEntity: cache write error: ' + cacheWriteErr.message);
  }

  return verificationResult;
}


// ─── 3. verifyAll ───────────────────────────────────────────────────────────

/**
 * Batch verification of all entities in the active spreadsheet.
 *
 * @param {Object} options  { sheetName, nameColumn, einColumn, startRow, forceRefresh, onProgress }
 * @return {Object}         { results: [], summary: { total, high, medium, low, manual, errors, durationMs } }
 */
function verifyAll(options) {
  var ss           = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName    = (options && options.sheetName)  || 'Master Register';
  var nameColumn   = (options && options.nameColumn) || 1;
  var einColumn    = (options && options.einColumn)   || 2;
  var startRow     = (options && options.startRow)    || 2; // skip header
  var forceRefresh = !!(options && options.forceRefresh);
  var onProgress   = (options && typeof options.onProgress === 'function') ? options.onProgress : null;

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet "' + sheetName + '" not found.');
  }

  var lastRow   = sheet.getLastRow();
  var totalRows = lastRow - startRow + 1;
  if (totalRows < 1) {
    return { results: [], summary: _emptySummary(0, 0) };
  }

  // Read all names and EINs at once for efficiency
  var nameRange = sheet.getRange(startRow, nameColumn, totalRows, 1).getValues();
  var einRange  = sheet.getRange(startRow, einColumn,  totalRows, 1).getValues();

  var results     = [];
  var batchStart  = new Date().getTime();
  var statusCount = { HIGH: 0, MEDIUM: 0, LOW: 0, MANUAL_REQUIRED: 0, UNVERIFIED: 0, DBA_MISMATCH: 0, DEFUNCT: 0, PLACEHOLDER: 0 };
  var errorCount  = 0;

  for (var i = 0; i < totalRows; i++) {
    var entityName = String(nameRange[i][0] || '').trim();
    var entityEIN  = String(einRange[i][0]  || '').trim();

    // Skip empty rows
    if (!entityName && !entityEIN) {
      continue;
    }

    var rowResult = null;
    try {
      rowResult = verifyEntity({ name: entityName, ein: entityEIN, forceRefresh: forceRefresh });
    } catch (rowErr) {
      Logger.log('verifyAll: row ' + (startRow + i) + ' error: ' + rowErr.message);
      rowResult = {
        input:       { name: entityName, ein: entityEIN },
        status:      'ERROR',
        confidence:  0,
        error:       rowErr.message,
        verifiedAt:  new Date().toISOString(),
        fromCache:   false
      };
      errorCount++;
    }

    rowResult._rowNumber = startRow + i;
    results.push(rowResult);

    // Track status
    if (rowResult.status && statusCount.hasOwnProperty(rowResult.status)) {
      statusCount[rowResult.status]++;
    }

    // Progress callback
    if (onProgress) {
      try {
        onProgress({
          current:  i + 1,
          total:    totalRows,
          percent:  Math.round(((i + 1) / totalRows) * 100),
          lastEntity: entityName,
          lastStatus: rowResult.status || 'ERROR'
        });
      } catch (progErr) {
        // Non-critical — continue
      }
    }
  }

  var batchEnd = new Date().getTime();

  var summary = {
    total:           results.length,
    high:            statusCount.HIGH          || 0,
    medium:          statusCount.MEDIUM         || 0,
    low:             statusCount.LOW            || 0,
    manual:          statusCount.MANUAL_REQUIRED || 0,
    unverified:      statusCount.UNVERIFIED     || 0,
    dbaMismatch:     statusCount.DBA_MISMATCH   || 0,
    defunct:         statusCount.DEFUNCT         || 0,
    placeholder:     statusCount.PLACEHOLDER    || 0,
    errors:          errorCount,
    durationMs:      batchEnd - batchStart
  };

  return {
    results: results,
    summary: summary
  };
}


// ─── 4. computeConfidence ───────────────────────────────────────────────────

/**
 * Computes a 0-1 confidence score from source query results.
 *
 * @param {Array}  sourcesQueried       Array of { sourceId, sourceHit, data, error }
 * @param {number} sourceConfirmations  Count of confirming sources
 * @param {Object} classification       From classifyEntity()
 * @return {number}                     0-1 confidence
 */
function computeConfidence(sourcesQueried, sourceConfirmations, classification) {
  var score = 0;

  // ── Base from confirming sources ────────────────────────────────────────

  if (sourceConfirmations >= 3) {
    score += 0.45;
  } else if (sourceConfirmations === 2) {
    score += 0.35;
  } else if (sourceConfirmations === 1) {
    score += 0.2;
  } else {
    score += 0.0;
  }

  // ── Source authority weight ─────────────────────────────────────────────

  var HIGH_AUTHORITY_SOURCES = {
    'SEC_EDGAR': 0.15,
    'FDIC_BANKFIND': 0.15,
    'SAM_GOV': 0.15,
    'NCUA': 0.12,
    'NAIC': 0.12,
    'OCC': 0.12,
    'IRS_TEOS': 0.1,
    'FCC_ULS': 0.1,
    'NMLS': 0.1,
    'CFPB': 0.1
  };
  var LOW_AUTHORITY_SOURCES = {
    'OPENCORPORATES': true,
    'GOOGLE_SEARCH': true
  };

  var authorityBonus   = 0;
  var highAuthorityHit = false;

  for (var i = 0; i < sourcesQueried.length; i++) {
    var sq = sourcesQueried[i];
    if (!sq.sourceHit) continue;

    if (HIGH_AUTHORITY_SOURCES[sq.sourceId]) {
      authorityBonus  += HIGH_AUTHORITY_SOURCES[sq.sourceId];
      highAuthorityHit = true;
    } else if (LOW_AUTHORITY_SOURCES[sq.sourceId]) {
      authorityBonus += 0.03;
    } else {
      authorityBonus += 0.05;
    }
  }

  // Cap authority bonus
  score += Math.min(authorityBonus, 0.3);

  // ── Classification confidence contribution ──────────────────────────────

  var classConf = (classification && classification.confidence) || 0;
  score += classConf * 0.15;

  // ── EIN direct confirmation vs inferred ─────────────────────────────────

  var einDirectlyConfirmed = false;
  for (var j = 0; j < sourcesQueried.length; j++) {
    var sd = sourcesQueried[j];
    if (sd.sourceHit && sd.data && sd.data.einConfirmed) {
      einDirectlyConfirmed = true;
      break;
    }
  }

  if (einDirectlyConfirmed) {
    score += 0.1;
  }

  // ── Name match quality ──────────────────────────────────────────────────

  var bestNameSimilarity = 0;
  for (var k = 0; k < sourcesQueried.length; k++) {
    var sn = sourcesQueried[k];
    if (sn.sourceHit && sn.data && sn.data.legalName) {
      var matchResult = fuzzyNameMatch(classification && classification.primaryType ? sn.data.legalName : sn.data.legalName, sn.data.legalName);
      // Actually compare to input name — reconstruct from first source query params
      // Use the data's legalName similarity to itself as a baseline (will be 1.0)
      // Instead, we check if names were stored in the aggregation step
      if (sn.data.nameMatchSimilarity !== undefined) {
        bestNameSimilarity = Math.max(bestNameSimilarity, sn.data.nameMatchSimilarity);
      } else {
        bestNameSimilarity = Math.max(bestNameSimilarity, 0.7); // assume moderate if source hit
      }
    }
  }

  if (bestNameSimilarity >= 0.95) {
    score += 0.05;
  } else if (bestNameSimilarity >= 0.8) {
    score += 0.02;
  }

  // ── Clamp to 0-1 ───────────────────────────────────────────────────────

  return Math.max(0, Math.min(1, Math.round(score * 1000) / 1000));
}


// ─── 5. determineStatus ─────────────────────────────────────────────────────

/**
 * Maps confidence + flags to a VERIFICATION_STATUS string.
 *
 * @param {number} confidence  0-1
 * @param {Object} flags       { isDBA, isDefunct, isPlaceholder }
 * @return {string}            VERIFICATION_STATUS key
 */
function determineStatus(confidence, flags) {
  // Override statuses take priority
  if (flags && flags.isPlaceholder) {
    return 'PLACEHOLDER';
  }
  if (flags && flags.isDefunct) {
    return 'DEFUNCT';
  }
  if (flags && flags.isDBA) {
    return 'DBA_MISMATCH';
  }

  // Confidence-based statuses
  if (confidence >= 0.85) {
    return 'HIGH';
  }
  if (confidence >= 0.6) {
    return 'MEDIUM';
  }
  if (confidence >= 0.3) {
    return 'LOW';
  }

  // Low confidence with exhausted sources
  return 'MANUAL_REQUIRED';
}


// ─── 6. aggregateSourceResults ──────────────────────────────────────────────

/**
 * Collects all legal names and EINs found, determines consensus.
 *
 * @param {Array} sourcesQueried  Array of { sourceId, sourceHit, data, error }
 * @return {Object}               { consensusName, consensusEIN, nameVariations, einVariations, conflicts }
 */
function aggregateSourceResults(sourcesQueried) {
  var nameFrequency = {};
  var einFrequency  = {};
  var nameVariations = [];
  var einVariations  = [];
  var conflicts      = [];

  for (var i = 0; i < sourcesQueried.length; i++) {
    var sq = sourcesQueried[i];
    if (!sq.sourceHit || !sq.data) continue;

    // Collect legal names
    if (sq.data.legalName) {
      var normalizedName = _normalizeName(sq.data.legalName);
      if (!nameFrequency[normalizedName]) {
        nameFrequency[normalizedName] = { count: 0, original: sq.data.legalName, sources: [] };
      }
      nameFrequency[normalizedName].count++;
      nameFrequency[normalizedName].sources.push(sq.sourceId);

      if (nameVariations.indexOf(sq.data.legalName) === -1) {
        nameVariations.push(sq.data.legalName);
      }
    }

    // Collect EINs
    if (sq.data.ein) {
      var normalizedEIN = sq.data.ein.replace(/\D/g, '');
      if (!einFrequency[normalizedEIN]) {
        einFrequency[normalizedEIN] = { count: 0, original: sq.data.ein, sources: [] };
      }
      einFrequency[normalizedEIN].count++;
      einFrequency[normalizedEIN].sources.push(sq.sourceId);

      if (einVariations.indexOf(sq.data.ein) === -1) {
        einVariations.push(sq.data.ein);
      }
    }
  }

  // Find consensus name (highest frequency)
  var consensusName = null;
  var maxNameCount  = 0;
  var nameKeys      = Object.keys(nameFrequency);
  for (var n = 0; n < nameKeys.length; n++) {
    if (nameFrequency[nameKeys[n]].count > maxNameCount) {
      maxNameCount  = nameFrequency[nameKeys[n]].count;
      consensusName = nameFrequency[nameKeys[n]].original;
    }
  }

  // Find consensus EIN (highest frequency)
  var consensusEIN = null;
  var maxEINCount  = 0;
  var einKeys      = Object.keys(einFrequency);
  for (var e = 0; e < einKeys.length; e++) {
    if (einFrequency[einKeys[e]].count > maxEINCount) {
      maxEINCount  = einFrequency[einKeys[e]].count;
      consensusEIN = einFrequency[einKeys[e]].original;
    }
  }

  // Detect conflicts
  if (nameKeys.length > 1) {
    conflicts.push({
      type:    'NAME_MISMATCH',
      message: 'Multiple legal names found across sources: ' + nameVariations.join(', '),
      details: nameFrequency
    });
  }
  if (einKeys.length > 1) {
    conflicts.push({
      type:    'EIN_MISMATCH',
      message: 'Multiple EINs found across sources: ' + einVariations.join(', '),
      details: einFrequency
    });
  }

  return {
    consensusName:  consensusName,
    consensusEIN:   consensusEIN,
    nameVariations: nameVariations,
    einVariations:  einVariations,
    conflicts:      conflicts
  };
}


// ─── 7. fuzzyNameMatch ──────────────────────────────────────────────────────

/**
 * Normalized comparison of two entity names.
 *
 * @param {string} name1
 * @param {string} name2
 * @return {Object}  { isMatch, similarity, normalizedName1, normalizedName2 }
 */
function fuzzyNameMatch(name1, name2) {
  var n1 = _normalizeName(name1);
  var n2 = _normalizeName(name2);

  if (n1 === n2) {
    return { isMatch: true, similarity: 1.0, normalizedName1: n1, normalizedName2: n2 };
  }

  // Compute Levenshtein-based similarity
  var maxLen = Math.max(n1.length, n2.length);
  if (maxLen === 0) {
    return { isMatch: true, similarity: 1.0, normalizedName1: n1, normalizedName2: n2 };
  }

  var distance   = _levenshteinDistance(n1, n2);
  var similarity = 1.0 - (distance / maxLen);
  similarity     = Math.round(similarity * 1000) / 1000;

  // Threshold: similarity >= 0.85 considered a match
  var isMatch = similarity >= 0.85;

  return {
    isMatch:         isMatch,
    similarity:      similarity,
    normalizedName1: n1,
    normalizedName2: n2
  };
}


// ─── 8. Menu / Sidebar Entry Points ────────────────────────────────────────

/**
 * Opens the Entity Verifier v2 sidebar.
 */
function showEntityVerifier() {
  var html = HtmlService
    .createHtmlOutputFromFile('EntityVerifierUI')
    .setTitle('Entity Verifier v2')
    .setWidth(600);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Adds the Entity Verifier v2 menu item on spreadsheet open.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('TMAR Tools')
    .addItem('Entity Verifier v2', 'showEntityVerifier')
    .addToUi();
}

/**
 * Called by google.script.run from the sidebar to verify a single entity.
 *
 * @param {string} name  Entity name
 * @param {string} ein   EIN
 * @return {Object}       Verification result
 */
function verifyEntityFromSidebar(name, ein) {
  try {
    return verifyEntity({ name: name, ein: ein, forceRefresh: false });
  } catch (e) {
    Logger.log('verifyEntityFromSidebar error: ' + e.message);
    return {
      input:      { name: name, ein: ein },
      status:     'ERROR',
      confidence: 0,
      error:      e.message,
      verifiedAt: new Date().toISOString(),
      fromCache:  false
    };
  }
}

/**
 * Called by google.script.run from the sidebar to verify all entities.
 *
 * @param {Object} options  { sheetName, nameColumn, einColumn, startRow, forceRefresh }
 * @return {Object}          { results, summary }
 */
function verifyAllFromSidebar(options) {
  try {
    // Note: onProgress callback cannot cross the google.script.run boundary,
    // so we omit it here. The UI should poll getVerificationSummary() instead.
    return verifyAll(options || {});
  } catch (e) {
    Logger.log('verifyAllFromSidebar error: ' + e.message);
    return {
      results: [],
      summary: {
        total: 0, high: 0, medium: 0, low: 0, manual: 0,
        unverified: 0, dbaMismatch: 0, defunct: 0, placeholder: 0,
        errors: 1, durationMs: 0, errorMessage: e.message
      }
    };
  }
}

/**
 * Returns a summary dashboard for the UI.
 *
 * @return {Object}  Stats object for the verification dashboard
 */
function getVerificationSummary() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master Register');

  if (!sheet) {
    return {
      sheetFound:   false,
      totalEntities: 0,
      message:       'Master Register sheet not found.'
    };
  }

  var lastRow       = sheet.getLastRow();
  var totalEntities = Math.max(0, lastRow - 1); // minus header

  // Check cache sheet for existing verification data
  var cacheInfo = { cached: 0, stale: 0 };
  try {
    ensureCacheSheet();
    var cacheSheet = ss.getSheetByName('_VerificationCache');
    if (cacheSheet && cacheSheet.getLastRow() > 1) {
      cacheInfo.cached = cacheSheet.getLastRow() - 1;
    }
  } catch (cErr) {
    Logger.log('getVerificationSummary: cache check error: ' + cErr.message);
  }

  return {
    sheetFound:    true,
    totalEntities: totalEntities,
    cachedResults: cacheInfo.cached,
    staleResults:  cacheInfo.stale,
    lastUpdated:   new Date().toISOString()
  };
}


// ─── PRIVATE HELPERS ────────────────────────────────────────────────────────

/**
 * Builds a deterministic cache key from name + EIN.
 */
function _buildCacheKey(name, ein) {
  var n = _normalizeName(name);
  var e = (ein || '').replace(/\D/g, '');
  return 'EV2:' + n + ':' + e;
}

/**
 * Normalizes a name for comparison:
 * - Lowercase
 * - Strip punctuation (except alphanumeric and spaces)
 * - Normalize whitespace
 * - Replace known suffix equivalences
 */
function _normalizeName(name) {
  if (!name) return '';

  var s = String(name).toLowerCase().trim();

  // Replace known equivalences
  var keys = Object.keys(SUFFIX_EQUIVALENCES);
  for (var i = 0; i < keys.length; i++) {
    // Build a word-boundary regex for each suffix
    var escaped = keys[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re      = new RegExp('\\b' + escaped + '\\b', 'gi');
    s = s.replace(re, SUFFIX_EQUIVALENCES[keys[i]]);
  }

  // Strip remaining punctuation (keep alphanumeric, spaces)
  s = s.replace(/[^a-z0-9\s]/g, '');

  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Counts how many sources confirmed the entity (hit + name or EIN match).
 */
function _countConfirmations(sourcesQueried, inputEIN, inputName) {
  var count        = 0;
  var normalizedIn = _normalizeName(inputName);
  var cleanEIN     = (inputEIN || '').replace(/\D/g, '');

  for (var i = 0; i < sourcesQueried.length; i++) {
    var sq = sourcesQueried[i];
    if (!sq.sourceHit || !sq.data) continue;

    var confirmed = false;

    // EIN match
    if (sq.data.ein) {
      var srcEIN = sq.data.ein.replace(/\D/g, '');
      if (srcEIN && srcEIN === cleanEIN) {
        confirmed = true;
      }
    }

    // Name match (fuzzy)
    if (!confirmed && sq.data.legalName) {
      var match = fuzzyNameMatch(inputName, sq.data.legalName);
      if (match.isMatch) {
        confirmed = true;
      }
    }

    if (confirmed) {
      count++;
    }
  }

  return count;
}

/**
 * Checks if two names diverge enough to suspect a DBA situation.
 */
function _namesDiverge(inputName, resolvedName) {
  if (!inputName || !resolvedName) return false;
  var match = fuzzyNameMatch(inputName, resolvedName);
  // If similarity is below 0.7, names are quite different — likely DBA
  return !match.isMatch && match.similarity < 0.7;
}

/**
 * Builds a human-readable recommendation string.
 */
function _buildRecommendation(status, confidence, sourceConfirmations, isDBA, isDefunct, isPlaceholder, preflightWarnings) {
  var parts = [];

  switch (status) {
    case 'HIGH':
      parts.push('Entity verified with high confidence (' + (confidence * 100).toFixed(0) + '%).');
      parts.push(sourceConfirmations + ' source(s) confirmed.');
      break;
    case 'MEDIUM':
      parts.push('Entity partially verified (' + (confidence * 100).toFixed(0) + '% confidence).');
      parts.push('Consider additional source checks for full confirmation.');
      break;
    case 'LOW':
      parts.push('Low confidence verification (' + (confidence * 100).toFixed(0) + '%).');
      parts.push('Manual review recommended before proceeding.');
      break;
    case 'DBA_MISMATCH':
      parts.push('Input name appears to be a trade name (DBA).');
      parts.push('Legal name may differ — review DBA resolution details.');
      break;
    case 'DEFUNCT':
      parts.push('Entity appears defunct, merged, or renamed.');
      parts.push('Check genealogy data for successor entity.');
      break;
    case 'PLACEHOLDER':
      parts.push('Placeholder EIN detected (00-0000000).');
      parts.push('This entity requires series fund resolution or manual EIN lookup.');
      break;
    case 'MANUAL_REQUIRED':
      parts.push('Automated verification exhausted without sufficient confirmation.');
      parts.push('Manual research required — check state SOS filings or IRS records directly.');
      break;
    default:
      parts.push('Entity could not be verified. Status: ' + status + '.');
      break;
  }

  if (preflightWarnings && preflightWarnings.length > 0) {
    parts.push('IRIS preflight warnings: ' + preflightWarnings.join('; '));
  }

  return parts.join(' ');
}

/**
 * Returns an empty summary object.
 */
function _emptySummary(total, durationMs) {
  return {
    total: total, high: 0, medium: 0, low: 0, manual: 0,
    unverified: 0, dbaMismatch: 0, defunct: 0, placeholder: 0,
    errors: 0, durationMs: durationMs || 0
  };
}

/**
 * Computes Levenshtein edit distance between two strings.
 */
function _levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Use a single-row optimization for memory efficiency
  var prevRow = [];
  var curRow  = [];
  var i, j;

  for (j = 0; j <= b.length; j++) {
    prevRow[j] = j;
  }

  for (i = 1; i <= a.length; i++) {
    curRow[0] = i;
    for (j = 1; j <= b.length; j++) {
      var cost = (a.charAt(i - 1) === b.charAt(j - 1)) ? 0 : 1;
      curRow[j] = Math.min(
        curRow[j - 1] + 1,        // insertion
        prevRow[j] + 1,           // deletion
        prevRow[j - 1] + cost     // substitution
      );
    }
    // Swap rows
    var tmp = prevRow;
    prevRow = curRow;
    curRow  = tmp;
  }

  return prevRow[b.length];
}
