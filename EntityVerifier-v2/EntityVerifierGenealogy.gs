/**
 * ============================================================================
 * EntityVerifierGenealogy.gs — Corporate Genealogy Engine
 * ============================================================================
 *
 * Purpose:
 *   Traces entity lineage through mergers, acquisitions, name changes, and
 *   dissolutions. When a company on record no longer exists or has changed
 *   its name, this engine identifies the successor entity so that 1099
 *   filings use the current IRS-recognized name and EIN.
 *
 * Version:   2.0.0
 * Engine:    Entity Verifier v2
 * Platform:  Google Apps Script (Google Sheets)
 *
 * Dependencies:
 *   - EntityVerifierConfig.gs  (CONFIG object, API helpers)
 *   - EntityVerifierSources.gs (queryFDIC, querySEC, queryStateSOS, etc.)
 *   - EntityVerifierDBA.gs     (_normalizeName, _normalizeEIN helpers)
 *
 * Entry Point:
 *   traceEntityGenealogy(entityName, ein)
 *
 * ============================================================================
 */

/* ===========================================================================
 * KNOWN GENEALOGIES
 * Confirmed corporate lineage events. Checked FIRST before external queries.
 * ===========================================================================
 */
var KNOWN_GENEALOGIES = {
  'MetaBank': {
    currentName: 'Pathward N.A.',
    type: 'NAME_CHANGE',
    date: '2022-02',
    isDefunct: false,
    acquirer: null,
    notes: 'Rebranded from MetaBank to Pathward N.A.'
  },
  'Springleaf Financial': {
    currentName: 'OneMain Financial Holdings LLC',
    type: 'ACQUISITION',
    date: '2015-11',
    isDefunct: true,
    acquirer: 'OneMain Financial',
    notes: 'Springleaf acquired and absorbed into OneMain'
  },
  'First Bank of Delaware': {
    currentName: null,
    type: 'DISSOLUTION',
    date: '2012',
    isDefunct: true,
    acquirer: null,
    notes: 'Dissolved. Issued Destiny Mastercard. Successor bank unknown — accounts may have been transferred to Continental Finance.'
  },
  'Time Warner Cable': {
    currentName: 'Charter Communications Inc',
    type: 'ACQUISITION',
    date: '2016-05',
    isDefunct: true,
    acquirer: 'Charter Communications',
    notes: 'Acquired by Charter, rebranded as Spectrum'
  },
  'Bright House Networks': {
    currentName: 'Charter Communications Inc',
    type: 'ACQUISITION',
    date: '2016-05',
    isDefunct: true,
    acquirer: 'Charter Communications',
    notes: 'Acquired by Charter along with TWC'
  },
  'Wachovia': {
    currentName: 'Wells Fargo & Company',
    type: 'ACQUISITION',
    date: '2008-12',
    isDefunct: true,
    acquirer: 'Wells Fargo',
    notes: 'Acquired by Wells Fargo during 2008 financial crisis'
  },
  'Washington Mutual': {
    currentName: 'JPMorgan Chase Bank N.A.',
    type: 'ACQUISITION',
    date: '2008-09',
    isDefunct: true,
    acquirer: 'JPMorgan Chase',
    notes: 'FDIC seized and sold to JPMorgan Chase'
  },
  'Countrywide Financial': {
    currentName: 'Bank of America N.A.',
    type: 'ACQUISITION',
    date: '2008-07',
    isDefunct: true,
    acquirer: 'Bank of America',
    notes: 'Acquired by Bank of America'
  },
  'MBNA': {
    currentName: 'Bank of America N.A.',
    type: 'ACQUISITION',
    date: '2006-01',
    isDefunct: true,
    acquirer: 'Bank of America',
    notes: 'Acquired by Bank of America'
  },
  'Providian Financial': {
    currentName: 'JPMorgan Chase Bank N.A.',
    type: 'ACQUISITION',
    date: '2005-10',
    isDefunct: true,
    acquirer: 'Washington Mutual (then JPMorgan Chase)',
    notes: 'Acquired by WaMu, then JPMorgan inherited via WaMu acquisition'
  },
  'GreenSky': {
    currentName: 'Goldman Sachs Bank USA',
    type: 'ACQUISITION',
    date: '2022-03',
    isDefunct: true,
    acquirer: 'Goldman Sachs',
    notes: 'Acquired by Goldman Sachs'
  }
};

/* ===========================================================================
 * FDIC CHANGE CODES
 * Maps FDIC CHANGECODE values to human-readable event types.
 * ===========================================================================
 */
var FDIC_CHANGE_CODES = {
  0: 'NO_CHANGE',
  1: 'CHARTER_DISCONTINUED',
  2: 'PURCHASE_AND_ASSUMPTION',
  3: 'PAYOUT',
  4: 'CHARTER_CONVERTED',
  5: 'MERGED_INTO_ANOTHER',
  6: 'NEW_CHARTER',
  7: 'REOPEN',
  8: 'TITLE_CHANGE',
  9: 'FAILURE',
  10: 'CHANGE_OF_INSURANCE',
  11: 'ABSORB_INTO_BRANCH',
  12: 'SPLIT_CHARTER'
};


/* ===========================================================================
 * traceEntityGenealogy(entityName, ein)
 *
 * Main entry point. Traces the full corporate lineage of an entity.
 *
 * @param {string} entityName  - Entity name to trace
 * @param {string} ein         - EIN associated with the entity
 *
 * @return {Object} Full genealogy result
 * ===========================================================================
 */
function traceEntityGenealogy(entityName, ein) {
  var result = {
    currentName: entityName,
    currentEIN: ein || null,
    isDefunct: false,
    isRenamed: false,
    successorEntity: null,
    nameHistory: [],
    mergerHistory: [],
    subsidiaryChain: [],
    irsNameOnFile: null,
    recommendation: ''
  };

  // ── Guard: empty input ──
  if (!entityName || typeof entityName !== 'string' || entityName.trim() === '') {
    result.recommendation = 'No entity name provided.';
    return result;
  }

  entityName = entityName.trim();

  // ── Step 1: Check KNOWN_GENEALOGIES ──
  var known = _findKnownGenealogy(entityName);
  if (known) {
    return _buildResultFromKnown(entityName, ein, known);
  }

  // ── Step 2: Query FDIC BankFind for merger/acquisition history ──
  var fdicResult = _queryFDICGenealogy(entityName, ein);
  if (fdicResult) {
    _mergeFDICGenealogy(result, fdicResult);
  }

  // ── Step 3: Query SEC EDGAR for 8-K filings (M&A events) ──
  var secResult = _querySECGenealogy(entityName, ein);
  if (secResult) {
    _mergeSECGenealogy(result, secResult);
  }

  // ── Step 4: Query State SOS for dissolution/name changes ──
  var sosResult = _querySOSGenealogy(entityName, ein);
  if (sosResult) {
    _mergeSOSGenealogy(result, sosResult);
  }

  // ── Step 5: Query FFIEC NIC for bank holding company changes ──
  var ffiecResult = _queryFFIECGenealogy(entityName, ein);
  if (ffiecResult) {
    _mergeFFIECGenealogy(result, ffiecResult);
  }

  // ── Step 6: Detect defunct signals from all gathered data ──
  var defunctSignals = detectDefunctSignals({
    fdic: fdicResult,
    sec: secResult,
    sos: sosResult,
    ffiec: ffiecResult
  });

  if (defunctSignals.isDefunct) {
    result.isDefunct = true;

    // ── Step 7: Find successor if defunct ──
    var successor = findSuccessor(entityName, ein, {
      fdic: fdicResult,
      sec: secResult,
      sos: sosResult,
      ffiec: ffiecResult
    });

    if (successor && successor.successorName) {
      result.successorEntity = {
        name: successor.successorName,
        ein: successor.successorEIN || null
      };
    }
  }

  // ── Step 8: Detect name changes ──
  if (result.nameHistory.length > 0) {
    var latestName = result.nameHistory[result.nameHistory.length - 1];
    if (latestName && latestName.name &&
        _normalizeName(latestName.name) !== _normalizeName(entityName)) {
      result.isRenamed = true;
      result.currentName = latestName.name;
    }
  }

  // ── Step 9: Build recommendation ──
  result.recommendation = _buildRecommendation(result, entityName);

  // ── Sort histories chronologically ──
  result.nameHistory.sort(function(a, b) {
    return (a.from || '').localeCompare(b.from || '');
  });
  result.mergerHistory.sort(function(a, b) {
    return (a.date || '').localeCompare(b.date || '');
  });

  return result;
}


/* ===========================================================================
 * detectDefunctSignals(sourceResults)
 *
 * Analyzes source results for signals that the entity no longer exists.
 *
 * @param {Object} sourceResults  - { fdic, sec, sos, ffiec }
 *
 * @return {Object} { isDefunct, signals, confidence }
 * ===========================================================================
 */
function detectDefunctSignals(sourceResults) {
  var signals = [];
  var score = 0;

  // ── FDIC: check ACTIVE status ──
  if (sourceResults.fdic) {
    if (sourceResults.fdic.active === false || sourceResults.fdic.active === 0) {
      signals.push('FDIC shows institution is NOT active');
      score += 3;
    }
    if (sourceResults.fdic.changeCode) {
      var code = parseInt(sourceResults.fdic.changeCode, 10);
      if (code === 1 || code === 5 || code === 9 || code === 11) {
        var desc = FDIC_CHANGE_CODES[code] || 'UNKNOWN';
        signals.push('FDIC change code ' + code + ' (' + desc + ') indicates entity is defunct');
        score += 3;
      }
    }
    if (sourceResults.fdic.endDate) {
      signals.push('FDIC shows end date: ' + sourceResults.fdic.endDate);
      score += 2;
    }
  }

  // ── SEC: no recent filings ──
  if (sourceResults.sec) {
    if (sourceResults.sec.lastFilingDate) {
      var lastFiling = new Date(sourceResults.sec.lastFilingDate);
      var threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
      if (lastFiling < threeYearsAgo) {
        signals.push('SEC shows no filings in the last 3 years (last: ' + sourceResults.sec.lastFilingDate + ')');
        score += 2;
      }
    }
    if (sourceResults.sec.status === 'INACTIVE' || sourceResults.sec.status === 'TERMINATED') {
      signals.push('SEC shows entity status: ' + sourceResults.sec.status);
      score += 2;
    }
  }

  // ── State SOS: dissolved/inactive ──
  if (sourceResults.sos) {
    if (sourceResults.sos.status) {
      var sosStatus = sourceResults.sos.status.toUpperCase();
      if (sosStatus === 'DISSOLVED' || sosStatus === 'INACTIVE' ||
          sosStatus === 'CANCELLED' || sosStatus === 'REVOKED' ||
          sosStatus === 'WITHDRAWN' || sosStatus === 'TERMINATED') {
        signals.push('State SOS shows status: ' + sourceResults.sos.status);
        score += 2.5;
      }
    }
    if (sourceResults.sos.dissolutionDate) {
      signals.push('State SOS shows dissolution date: ' + sourceResults.sos.dissolutionDate);
      score += 2;
    }
  }

  // ── FFIEC: institution no longer in NIC ──
  if (sourceResults.ffiec) {
    if (sourceResults.ffiec.active === false) {
      signals.push('FFIEC NIC shows institution is no longer active');
      score += 2;
    }
  }

  // ── Multiple sources return no results at all ──
  var noResultCount = 0;
  if (!sourceResults.fdic || !sourceResults.fdic.found) noResultCount++;
  if (!sourceResults.sec || !sourceResults.sec.found) noResultCount++;
  if (!sourceResults.sos || !sourceResults.sos.found) noResultCount++;
  if (!sourceResults.ffiec || !sourceResults.ffiec.found) noResultCount++;
  if (noResultCount >= 3) {
    signals.push('Multiple sources (' + noResultCount + '/4) returned no results');
    score += 1.5;
  }

  var isDefunct = score >= 3;
  var confidence = Math.min(score / 8, 1.0);

  return {
    isDefunct: isDefunct,
    signals: signals,
    confidence: Math.round(confidence * 100) / 100
  };
}


/* ===========================================================================
 * findSuccessor(entityName, ein, sourceResults)
 *
 * When an entity is defunct, attempts to find its successor.
 *
 * @param {string} entityName     - Original entity name
 * @param {string} ein            - Original EIN
 * @param {Object} sourceResults  - { fdic, sec, sos, ffiec }
 *
 * @return {Object} { successorName, successorEIN, confidence, source }
 * ===========================================================================
 */
function findSuccessor(entityName, ein, sourceResults) {
  var result = {
    successorName: null,
    successorEIN: null,
    confidence: 0,
    source: null
  };

  // ── Priority 1: FDIC merger history ──
  if (sourceResults.fdic) {
    // CHANGECODE 5 = merged into another bank
    if (sourceResults.fdic.changeCode === 5 || sourceResults.fdic.changeCode === '5') {
      if (sourceResults.fdic.successorInstitution) {
        result.successorName = sourceResults.fdic.successorInstitution.name || null;
        result.successorEIN = sourceResults.fdic.successorInstitution.ein || null;
        result.confidence = 0.9;
        result.source = 'FDIC BankFind (merger history)';
        return result;
      }
    }
    // Purchase & Assumption (CHANGECODE 2)
    if (sourceResults.fdic.changeCode === 2 || sourceResults.fdic.changeCode === '2') {
      if (sourceResults.fdic.acquirerInstitution) {
        result.successorName = sourceResults.fdic.acquirerInstitution.name || null;
        result.successorEIN = sourceResults.fdic.acquirerInstitution.ein || null;
        result.confidence = 0.85;
        result.source = 'FDIC BankFind (purchase & assumption)';
        return result;
      }
    }
  }

  // ── Priority 2: SEC 8-K filings ──
  if (sourceResults.sec && sourceResults.sec.mergerFilings) {
    var filings = sourceResults.sec.mergerFilings;
    for (var i = 0; i < filings.length; i++) {
      if (filings[i].acquirerName) {
        result.successorName = filings[i].acquirerName;
        result.successorEIN = filings[i].acquirerEIN || null;
        result.confidence = 0.75;
        result.source = 'SEC EDGAR (8-K filing)';
        return result;
      }
    }
  }

  // ── Priority 3: FFIEC NIC ──
  if (sourceResults.ffiec && sourceResults.ffiec.successorEntity) {
    result.successorName = sourceResults.ffiec.successorEntity.name || null;
    result.successorEIN = sourceResults.ffiec.successorEntity.ein || null;
    result.confidence = 0.8;
    result.source = 'FFIEC NIC';
    return result;
  }

  // ── Priority 4: State SOS merger/conversion records ──
  if (sourceResults.sos && sourceResults.sos.mergerTarget) {
    result.successorName = sourceResults.sos.mergerTarget.name || null;
    result.successorEIN = sourceResults.sos.mergerTarget.ein || null;
    result.confidence = 0.65;
    result.source = 'State Secretary of State';
    return result;
  }

  // ── Priority 5: Known genealogies (check acquirer field) ──
  var known = _findKnownGenealogy(entityName);
  if (known && known.currentName) {
    result.successorName = known.currentName;
    result.successorEIN = null;
    result.confidence = 0.95;
    result.source = 'Known Genealogy Database';
    return result;
  }

  return result;
}


/* ===========================================================================
 * INTERNAL HELPERS
 * ===========================================================================
 */

/**
 * Case-insensitive lookup in KNOWN_GENEALOGIES.
 * Returns the genealogy entry if found, null otherwise.
 */
function _findKnownGenealogy(name) {
  if (!name) return null;
  var nameNorm = name.trim().toLowerCase();
  var keys = Object.keys(KNOWN_GENEALOGIES);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase() === nameNorm) {
      return KNOWN_GENEALOGIES[keys[i]];
    }
  }
  return null;
}

/**
 * Builds a full genealogy result from a KNOWN_GENEALOGIES entry.
 */
function _buildResultFromKnown(entityName, ein, known) {
  var isDefunct = known.isDefunct || false;
  var isRenamed = known.type === 'NAME_CHANGE';
  var currentName = known.currentName || entityName;
  var successorEntity = null;

  if (isDefunct && known.currentName) {
    successorEntity = {
      name: known.currentName,
      ein: null
    };
  }

  // Build name history
  var nameHistory = [];
  if (known.type === 'NAME_CHANGE') {
    nameHistory.push({
      name: entityName,
      from: 'unknown',
      to: known.date || 'unknown'
    });
    nameHistory.push({
      name: known.currentName,
      from: known.date || 'unknown',
      to: 'present'
    });
  } else {
    nameHistory.push({
      name: entityName,
      from: 'unknown',
      to: known.date || 'unknown'
    });
  }

  // Build merger history
  var mergerHistory = [];
  mergerHistory.push({
    type: known.type,
    date: known.date || 'unknown',
    description: known.notes || '',
    acquirer: known.acquirer || null,
    target: entityName
  });

  // Build recommendation
  var recommendation = '';
  if (known.type === 'NAME_CHANGE') {
    recommendation = "Entity was renamed. File under current name: '" + known.currentName + "'.";
  } else if (known.type === 'ACQUISITION' && known.currentName) {
    recommendation = "Entity was acquired by " + (known.acquirer || known.currentName) +
                     ". File under successor: '" + known.currentName + "'.";
  } else if (known.type === 'DISSOLUTION') {
    if (known.currentName) {
      recommendation = "Entity was dissolved. Successor entity: '" + known.currentName + "'.";
    } else {
      recommendation = "Entity was dissolved with no confirmed successor. " + known.notes +
                       " Manual verification required.";
    }
  } else {
    recommendation = known.notes || "Use '" + (known.currentName || entityName) + "' for filing.";
  }

  return {
    currentName: currentName,
    currentEIN: ein || null,
    isDefunct: isDefunct,
    isRenamed: isRenamed,
    successorEntity: successorEntity,
    nameHistory: nameHistory,
    mergerHistory: mergerHistory,
    subsidiaryChain: [],
    irsNameOnFile: null,
    recommendation: recommendation
  };
}

/**
 * Builds a human-readable recommendation based on genealogy result.
 */
function _buildRecommendation(result, originalName) {
  if (result.isDefunct) {
    if (result.successorEntity && result.successorEntity.name) {
      return "Entity '" + originalName + "' is defunct. File under successor entity: '" +
             result.successorEntity.name + "'" +
             (result.successorEntity.ein ? ' (EIN: ' + result.successorEntity.ein + ')' : '') + '.';
    }
    return "Entity '" + originalName + "' appears to be defunct with no confirmed successor. " +
           "Manual verification required before filing.";
  }

  if (result.isRenamed) {
    return "Entity was renamed. Use current name '" + result.currentName + "' for filing.";
  }

  if (result.mergerHistory.length > 0) {
    return "Entity '" + originalName + "' has corporate history events. " +
           "Current name on file: '" + result.currentName + "'. Verify with IRS before filing.";
  }

  return "No genealogy events detected. Use '" + originalName + "' for filing.";
}


/* ===========================================================================
 * SOURCE QUERY ADAPTERS FOR GENEALOGY
 * Each returns a normalized object or null if the source is unavailable.
 * ===========================================================================
 */

/**
 * Queries FDIC for bank merger/acquisition/dissolution history.
 */
function _queryFDICGenealogy(name, ein) {
  try {
    if (typeof queryFDIC !== 'function') return null;
    var raw = queryFDIC(name, ein);
    if (!raw || !raw.found) return null;

    return {
      found: true,
      active: raw.active !== undefined ? raw.active : null,
      changeCode: raw.changeCode || null,
      endDate: raw.endDate || null,
      institutionName: raw.institutionName || raw.legalName || null,
      successorInstitution: raw.successorInstitution || null,
      acquirerInstitution: raw.acquirerInstitution || null,
      mergerHistory: raw.mergerHistory || [],
      nameChanges: raw.nameChanges || []
    };
  } catch (e) {
    Logger.log('_queryFDICGenealogy error: ' + e.message);
    return null;
  }
}

/**
 * Queries SEC EDGAR for 8-K M&A filings.
 */
function _querySECGenealogy(name, ein) {
  try {
    if (typeof querySEC !== 'function') return null;
    var raw = querySEC(name, ein);
    if (!raw || !raw.found) return null;

    return {
      found: true,
      companyName: raw.companyName || raw.legalName || null,
      status: raw.status || null,
      lastFilingDate: raw.lastFilingDate || null,
      formerNames: raw.formerNames || [],
      mergerFilings: raw.mergerFilings || [],
      acquisitionFilings: raw.acquisitionFilings || []
    };
  } catch (e) {
    Logger.log('_querySECGenealogy error: ' + e.message);
    return null;
  }
}

/**
 * Queries State Secretary of State for entity status and history.
 */
function _querySOSGenealogy(name, ein) {
  try {
    if (typeof queryStateSOS !== 'function') return null;
    var raw = queryStateSOS(name, ein);
    if (!raw || !raw.found) return null;

    return {
      found: true,
      entityName: raw.entityName || raw.legalName || null,
      status: raw.status || null,
      formationDate: raw.formationDate || null,
      dissolutionDate: raw.dissolutionDate || null,
      nameChanges: raw.nameChanges || [],
      mergerTarget: raw.mergerTarget || null,
      conversionHistory: raw.conversionHistory || []
    };
  } catch (e) {
    Logger.log('_querySOSGenealogy error: ' + e.message);
    return null;
  }
}

/**
 * Queries FFIEC NIC for bank holding company changes.
 */
function _queryFFIECGenealogy(name, ein) {
  try {
    if (typeof queryFFIEC !== 'function') return null;
    var raw = queryFFIEC(name, ein);
    if (!raw || !raw.found) return null;

    return {
      found: true,
      institutionName: raw.institutionName || raw.legalName || null,
      active: raw.active !== undefined ? raw.active : null,
      holdingCompany: raw.holdingCompany || null,
      successorEntity: raw.successorEntity || null,
      transformationHistory: raw.transformationHistory || []
    };
  } catch (e) {
    Logger.log('_queryFFIECGenealogy error: ' + e.message);
    return null;
  }
}


/* ===========================================================================
 * GENEALOGY MERGE HELPERS
 * Merge source-specific genealogy data into the unified result.
 * ===========================================================================
 */

/**
 * Merges FDIC genealogy data into the result object.
 */
function _mergeFDICGenealogy(result, fdicData) {
  if (!fdicData) return;

  // Merge name changes
  if (fdicData.nameChanges && fdicData.nameChanges.length > 0) {
    for (var i = 0; i < fdicData.nameChanges.length; i++) {
      var nc = fdicData.nameChanges[i];
      result.nameHistory.push({
        name: nc.name || nc.previousName || 'Unknown',
        from: nc.fromDate || nc.effectiveDate || 'unknown',
        to: nc.toDate || 'unknown'
      });
    }
  }

  // Merge merger history
  if (fdicData.mergerHistory && fdicData.mergerHistory.length > 0) {
    for (var j = 0; j < fdicData.mergerHistory.length; j++) {
      var mh = fdicData.mergerHistory[j];
      var changeDesc = FDIC_CHANGE_CODES[mh.changeCode] || 'UNKNOWN';
      result.mergerHistory.push({
        type: _mapFDICChangeToType(mh.changeCode),
        date: mh.date || mh.effectiveDate || 'unknown',
        description: 'FDIC: ' + changeDesc + (mh.description ? ' — ' + mh.description : ''),
        acquirer: mh.acquirer || null,
        target: mh.target || null
      });
    }
  }

  // Check active status
  if (fdicData.active === false || fdicData.active === 0) {
    result.isDefunct = true;
  }

  // Capture successor
  if (fdicData.successorInstitution && !result.successorEntity) {
    result.successorEntity = {
      name: fdicData.successorInstitution.name,
      ein: fdicData.successorInstitution.ein || null
    };
  }
}

/**
 * Merges SEC genealogy data into the result object.
 */
function _mergeSECGenealogy(result, secData) {
  if (!secData) return;

  // Former names become name history entries
  if (secData.formerNames && secData.formerNames.length > 0) {
    for (var i = 0; i < secData.formerNames.length; i++) {
      var fn = secData.formerNames[i];
      var existing = result.nameHistory.some(function(nh) {
        return _normalizeName(nh.name) === _normalizeName(fn.name || fn);
      });
      if (!existing) {
        result.nameHistory.push({
          name: fn.name || fn,
          from: fn.fromDate || 'unknown',
          to: fn.toDate || 'unknown'
        });
      }
    }
  }

  // Merger filings
  if (secData.mergerFilings && secData.mergerFilings.length > 0) {
    for (var j = 0; j < secData.mergerFilings.length; j++) {
      var mf = secData.mergerFilings[j];
      result.mergerHistory.push({
        type: 'ACQUISITION',
        date: mf.filingDate || mf.date || 'unknown',
        description: 'SEC 8-K: ' + (mf.description || 'Merger/acquisition filing'),
        acquirer: mf.acquirerName || null,
        target: mf.targetName || null
      });
    }
  }
}

/**
 * Merges State SOS genealogy data into the result object.
 */
function _mergeSOSGenealogy(result, sosData) {
  if (!sosData) return;

  // Name changes
  if (sosData.nameChanges && sosData.nameChanges.length > 0) {
    for (var i = 0; i < sosData.nameChanges.length; i++) {
      var nc = sosData.nameChanges[i];
      var existing = result.nameHistory.some(function(nh) {
        return _normalizeName(nh.name) === _normalizeName(nc.name || nc.previousName || '');
      });
      if (!existing) {
        result.nameHistory.push({
          name: nc.name || nc.previousName || 'Unknown',
          from: nc.fromDate || nc.effectiveDate || 'unknown',
          to: nc.toDate || 'unknown'
        });
      }
    }
  }

  // Dissolution
  if (sosData.status) {
    var s = sosData.status.toUpperCase();
    if (s === 'DISSOLVED' || s === 'INACTIVE' || s === 'CANCELLED' ||
        s === 'REVOKED' || s === 'WITHDRAWN' || s === 'TERMINATED') {
      result.isDefunct = true;
      result.mergerHistory.push({
        type: 'DISSOLUTION',
        date: sosData.dissolutionDate || 'unknown',
        description: 'State SOS: Entity status is ' + sosData.status,
        acquirer: null,
        target: sosData.entityName || null
      });
    }
  }

  // Conversion history
  if (sosData.conversionHistory && sosData.conversionHistory.length > 0) {
    for (var j = 0; j < sosData.conversionHistory.length; j++) {
      var cv = sosData.conversionHistory[j];
      result.mergerHistory.push({
        type: 'NAME_CHANGE',
        date: cv.date || cv.effectiveDate || 'unknown',
        description: 'State SOS: ' + (cv.description || 'Entity conversion/name change'),
        acquirer: null,
        target: cv.fromName || null
      });
    }
  }
}

/**
 * Merges FFIEC genealogy data into the result object.
 */
function _mergeFFIECGenealogy(result, ffiecData) {
  if (!ffiecData) return;

  // Holding company relationship
  if (ffiecData.holdingCompany) {
    result.subsidiaryChain.push({
      parent: ffiecData.holdingCompany.name || 'Unknown',
      child: ffiecData.institutionName || result.currentName,
      relationship: 'BANK_HOLDING_COMPANY',
      source: 'FFIEC NIC'
    });
  }

  // Transformation history
  if (ffiecData.transformationHistory && ffiecData.transformationHistory.length > 0) {
    for (var i = 0; i < ffiecData.transformationHistory.length; i++) {
      var th = ffiecData.transformationHistory[i];
      result.mergerHistory.push({
        type: th.type || 'NAME_CHANGE',
        date: th.date || th.effectiveDate || 'unknown',
        description: 'FFIEC NIC: ' + (th.description || 'Institutional transformation'),
        acquirer: th.acquirer || null,
        target: th.target || null
      });
    }
  }

  // Active status
  if (ffiecData.active === false) {
    result.isDefunct = true;
  }

  // Successor
  if (ffiecData.successorEntity && !result.successorEntity) {
    result.successorEntity = {
      name: ffiecData.successorEntity.name,
      ein: ffiecData.successorEntity.ein || null
    };
  }
}

/**
 * Maps FDIC CHANGECODE integer to genealogy event type string.
 */
function _mapFDICChangeToType(changeCode) {
  var code = parseInt(changeCode, 10);
  switch (code) {
    case 1:  return 'DISSOLUTION';
    case 2:  return 'ACQUISITION';
    case 3:  return 'DISSOLUTION';
    case 4:  return 'NAME_CHANGE';
    case 5:  return 'MERGER';
    case 6:  return 'NAME_CHANGE';
    case 7:  return 'NAME_CHANGE';
    case 8:  return 'NAME_CHANGE';
    case 9:  return 'DISSOLUTION';
    case 10: return 'NAME_CHANGE';
    case 11: return 'MERGER';
    case 12: return 'NAME_CHANGE';
    default: return 'NAME_CHANGE';
  }
}
