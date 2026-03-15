/**
 * EntityVerifierSources.gs — Individual Source Query Functions for Entity Verifier v2
 * ====================================================================================
 * Each function queries one external data source and returns a normalized result
 * object. The dispatcher querySource() routes to the appropriate function based
 * on sourceId.
 *
 * Standard Return Format:
 *   {
 *     sourceId: string,        // e.g., "SEC_EDGAR"
 *     hit: boolean,            // true if source returned relevant data
 *     legalName: string|null,  // legal entity name found (or null)
 *     ein: string|null,        // EIN found (or null)
 *     additionalIds: {},       // source-specific IDs (CIK, CERT, NMLS_ID, CRD, etc.)
 *     metadata: {},            // any extra useful data (address, status, etc.)
 *     isDBA: boolean,          // true if the queried name was identified as a trade name
 *     dbaLegalName: string|null, // if isDBA, the legal name behind the DBA
 *     rawResponse: string|null,  // truncated raw response for debugging (first 500 chars)
 *     error: string|null,      // error message if query failed
 *     queryTimeMs: number      // how long the query took
 *   }
 *
 * All functions use var declarations for Google Apps Script compatibility.
 * All functions use UrlFetchApp.fetch with muteHttpExceptions: true.
 * All functions wrap logic in try/catch and time their execution.
 *
 * @fileoverview Source query functions for Entity Verifier v2 verification engine.
 */


// ─── HELPERS ────────────────────────────────────────────────────────────────────

/**
 * Creates a blank result template for a given sourceId.
 *
 * @param {string} sourceId - The source identifier.
 * @return {Object} A result object with all fields initialized to defaults.
 */
function makeBlankResult(sourceId) {
  return {
    sourceId: sourceId,
    hit: false,
    legalName: null,
    ein: null,
    additionalIds: {},
    metadata: {},
    isDBA: false,
    dbaLegalName: null,
    rawResponse: null,
    error: null,
    queryTimeMs: 0
  };
}

/**
 * Truncates a string to the first 500 characters for rawResponse debugging.
 *
 * @param {string} str - The string to truncate.
 * @return {string|null} Truncated string or null if input was falsy.
 */
function truncateRaw(str) {
  if (!str) return null;
  var s = String(str);
  return s.length > 500 ? s.substring(0, 500) + '...[truncated]' : s;
}

/**
 * Computes a simple name similarity score between two strings (0.0 to 1.0).
 * Uses case-insensitive comparison of alphanumeric characters only.
 *
 * @param {string} a - First string.
 * @param {string} b - Second string.
 * @return {number} Similarity score between 0.0 and 1.0.
 */
function nameSimilarity(a, b) {
  if (!a || !b) return 0;
  var normA = String(a).toLowerCase().replace(/[^a-z0-9]/g, '');
  var normB = String(b).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normA === normB) return 1.0;
  if (normA.length === 0 || normB.length === 0) return 0;

  // Check containment
  if (normA.indexOf(normB) !== -1 || normB.indexOf(normA) !== -1) {
    return 0.8;
  }

  // Bigram similarity
  var bigramsA = {};
  var bigramsB = {};
  var i;
  for (i = 0; i < normA.length - 1; i++) {
    var bg = normA.substring(i, i + 2);
    bigramsA[bg] = (bigramsA[bg] || 0) + 1;
  }
  for (i = 0; i < normB.length - 1; i++) {
    var bg2 = normB.substring(i, i + 2);
    bigramsB[bg2] = (bigramsB[bg2] || 0) + 1;
  }

  var intersection = 0;
  var union = 0;
  var allBigrams = {};
  var key;
  for (key in bigramsA) {
    if (bigramsA.hasOwnProperty(key)) allBigrams[key] = true;
  }
  for (key in bigramsB) {
    if (bigramsB.hasOwnProperty(key)) allBigrams[key] = true;
  }
  for (key in allBigrams) {
    if (allBigrams.hasOwnProperty(key)) {
      var countA = bigramsA[key] || 0;
      var countB = bigramsB[key] || 0;
      intersection += Math.min(countA, countB);
      union += Math.max(countA, countB);
    }
  }

  return union > 0 ? intersection / union : 0;
}


// ─── DISPATCHER ─────────────────────────────────────────────────────────────────

/**
 * Routes a query to the appropriate source function based on sourceId.
 * Wraps each call in try/catch and returns the standard result format.
 *
 * @param {string} sourceId - The source identifier (e.g., "SEC_EDGAR", "FDIC_BANKFIND").
 * @param {Object} params - Query parameters: { name, ein, entityType, state, formTypes }.
 * @return {Object} Standard result object.
 */
function querySource(sourceId, params) {
  var result = makeBlankResult(sourceId);
  var start = new Date().getTime();

  try {
    switch (sourceId) {
      case 'SEC_EDGAR':
        result = querySecEdgar(params);
        break;
      case 'FDIC_BANKFIND':
        result = queryFdicBankFind(params);
        break;
      case 'FFIEC_NIC':
        result = queryFfiecNic(params);
        break;
      case 'HUD_NEIGHBORHOOD_WATCH':
        result = queryHudNeighborhoodWatch(params);
        break;
      case 'NMLS':
        result = queryNmls(params);
        break;
      case 'IRS_TEOS':
        result = queryIrsTeos(params);
        break;
      case 'PROPUBLICA_990':
        result = queryProPublica990(params);
        break;
      case 'SAM_GOV':
        result = querySamGov(params);
        break;
      case 'USA_SPENDING':
        result = queryUsaSpending(params);
        break;
      case 'STATE_SOS':
        result = queryStateSos(params);
        break;
      case 'FINRA_BROKERCHECK':
        result = queryFinraBrokerCheck(params);
        break;
      case 'SEC_IARD':
        result = querySecIard(params);
        break;
      case 'CFPB_COMPLAINTS':
        result = queryCfpbComplaints(params);
        break;
      case 'OPENCORPORATES':
        result = queryOpenCorporates(params);
        break;
      case 'GOOGLE_FALLBACK':
        result = queryGoogleFallback(params);
        break;
      default:
        result.error = 'Unknown sourceId: ' + sourceId;
        break;
    }
  } catch (e) {
    result.error = 'Dispatcher error for ' + sourceId + ': ' + e.message;
    Logger.log('EntityVerifierSources: querySource(' + sourceId + ') failed — ' + e.message);
  }

  // Ensure queryTimeMs is set if the source function didn't set it
  if (!result.queryTimeMs) {
    result.queryTimeMs = new Date().getTime() - start;
  }

  return result;
}


// ─── 1. SEC EDGAR ───────────────────────────────────────────────────────────────

/**
 * Queries SEC EDGAR for entity information via full-text search and company search.
 * Extracts CIK, legal name, SIC code, and state of incorporation.
 * Respects SEC's 10 req/sec rate limit. Sets required User-Agent header.
 *
 * @param {Object} params - { name, formTypes }.
 * @return {Object} Standard result object.
 */
function querySecEdgar(params) {
  var result = makeBlankResult('SEC_EDGAR');
  var start = new Date().getTime();

  try {
    var name = params.name || '';
    var formTypes = params.formTypes || '10-K';
    var headers = {
      'User-Agent': 'TMAR-EntityVerifier/2.0 (entity-verification@tmar.local)',
      'Accept': 'application/json'
    };

    // Attempt 1: EDGAR full-text search API
    var searchUrl = 'https://efts.sec.gov/LATEST/search-index?q="' +
      encodeURIComponent(name) + '"&forms=' + encodeURIComponent(formTypes);

    var searchResp = UrlFetchApp.fetch(searchUrl, {
      muteHttpExceptions: true,
      headers: headers
    });

    var searchCode = searchResp.getResponseCode();
    var searchBody = searchResp.getContentText();
    result.rawResponse = truncateRaw(searchBody);

    if (searchCode === 200) {
      try {
        var searchData = JSON.parse(searchBody);
        // EDGAR full-text search returns hits with entity info
        if (searchData && searchData.hits && searchData.hits.hits && searchData.hits.hits.length > 0) {
          var topHit = searchData.hits.hits[0];
          var source = topHit._source || topHit;

          result.hit = true;
          result.legalName = source.entity_name || source.display_names || null;
          if (Array.isArray(result.legalName)) {
            result.legalName = result.legalName[0] || null;
          }
          result.additionalIds.CIK = source.entity_id || source.cik || null;
          result.metadata.SIC = source.sic || null;
          result.metadata.stateOfIncorporation = source.state_of_inc || null;
          result.metadata.filingDate = source.file_date || null;
          result.metadata.formType = source.form_type || null;
        }
      } catch (parseErr) {
        // Full-text search parse failed; fall through to company search
        Logger.log('EntityVerifierSources: SEC EDGAR full-text parse error — ' + parseErr.message);
      }
    }

    // Attempt 2: Company search (HTML) — if full-text didn't yield results
    if (!result.hit) {
      var companyUrl = 'https://www.sec.gov/cgi-bin/browse-edgar?company=' +
        encodeURIComponent(name) +
        '&CIK=&type=10-K&owner=include&count=5&action=getcompany';

      var companyResp = UrlFetchApp.fetch(companyUrl, {
        muteHttpExceptions: true,
        headers: headers
      });

      var companyCode = companyResp.getResponseCode();
      var companyBody = companyResp.getContentText();

      if (!result.rawResponse) {
        result.rawResponse = truncateRaw(companyBody);
      }

      if (companyCode === 200 && companyBody) {
        // Parse HTML table for company results
        // EDGAR company search returns a table with class "tableFile2"
        var cikMatch = companyBody.match(/CIK=(\d+)/);
        var companyNameMatch = companyBody.match(/<td[^>]*>\s*<a[^>]*CIK=\d+[^>]*>([^<]+)<\/a>/i);

        // Also try the more structured pattern in EDGAR results
        var sicMatch = companyBody.match(/SIC=(\d+)/);
        var stateMatch = companyBody.match(/State location=([A-Z]{2})/i);

        if (cikMatch || companyNameMatch) {
          result.hit = true;
          if (companyNameMatch && companyNameMatch[1]) {
            result.legalName = companyNameMatch[1].trim();
          }
          if (cikMatch && cikMatch[1]) {
            result.additionalIds.CIK = cikMatch[1];
          }
          if (sicMatch && sicMatch[1]) {
            result.metadata.SIC = sicMatch[1];
          }
          if (stateMatch && stateMatch[1]) {
            result.metadata.stateOfIncorporation = stateMatch[1];
          }
        }
      }
    }
  } catch (e) {
    result.error = 'SEC EDGAR query failed: ' + e.message;
    Logger.log('EntityVerifierSources: querySecEdgar error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 2. FDIC BANKFIND ───────────────────────────────────────────────────────────

/**
 * Queries FDIC BankFind API for institution information.
 * Free JSON API, no auth needed. Finds best match by name similarity.
 * Extracts legal name, FDIC certificate number, active status, and merger info.
 *
 * @param {Object} params - { name }.
 * @return {Object} Standard result object.
 */
function queryFdicBankFind(params) {
  var result = makeBlankResult('FDIC_BANKFIND');
  var start = new Date().getTime();

  try {
    var name = params.name || '';
    var url = 'https://banks.data.fdic.gov/api/institutions?search=' +
      encodeURIComponent(name) +
      '&limit=10&fields=REPNM,CERT,STALP,CITY,SPECGRP,ACTIVE,ENDEFYMD,CHANGECODE,INSTNAME,ESTYMD,EFFDATE';

    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var code = resp.getResponseCode();
    var body = resp.getContentText();
    result.rawResponse = truncateRaw(body);

    if (code !== 200) {
      result.error = 'HTTP ' + code;
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    var data = JSON.parse(body);
    if (!data || !data.data || data.data.length === 0) {
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    // Find best match by name similarity
    var bestMatch = null;
    var bestScore = 0;

    for (var i = 0; i < data.data.length; i++) {
      var inst = data.data[i].data || data.data[i];
      var instName = inst.INSTNAME || inst.REPNM || '';
      var score = nameSimilarity(name, instName);

      // Also check REPNM (report name) for similarity
      var repScore = inst.REPNM ? nameSimilarity(name, inst.REPNM) : 0;
      var maxScore = Math.max(score, repScore);

      if (maxScore > bestScore) {
        bestScore = maxScore;
        bestMatch = inst;
      }
    }

    if (bestMatch && bestScore > 0.3) {
      result.hit = true;
      result.legalName = bestMatch.INSTNAME || bestMatch.REPNM || null;
      result.additionalIds.CERT = bestMatch.CERT || null;
      result.metadata.activeStatus = bestMatch.ACTIVE === 1 ? 'Active' : 'Inactive';
      result.metadata.charterClass = bestMatch.SPECGRP || null;
      result.metadata.city = bestMatch.CITY || null;
      result.metadata.state = bestMatch.STALP || null;
      result.metadata.establishedDate = bestMatch.ESTYMD || null;
      result.metadata.effectiveDate = bestMatch.EFFDATE || null;
      result.metadata.matchScore = bestScore;

      // Flag defunct institutions
      if (bestMatch.ACTIVE !== 1) {
        result.metadata.mergerInfo = {
          changeCode: bestMatch.CHANGECODE || null,
          endDate: bestMatch.ENDEFYMD || null
        };
      }

      // If legal name differs significantly from queried name, may be DBA
      if (bestScore < 0.9 && bestMatch.REPNM && bestMatch.INSTNAME &&
          bestMatch.REPNM !== bestMatch.INSTNAME) {
        var repMatchScore = nameSimilarity(name, bestMatch.REPNM);
        var instMatchScore = nameSimilarity(name, bestMatch.INSTNAME);
        if (repMatchScore > instMatchScore) {
          result.isDBA = true;
          result.dbaLegalName = bestMatch.INSTNAME;
        }
      }
    }
  } catch (e) {
    result.error = 'FDIC BankFind query failed: ' + e.message;
    Logger.log('EntityVerifierSources: queryFdicBankFind error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 3. FFIEC NIC ───────────────────────────────────────────────────────────────

/**
 * Queries FFIEC National Information Center for institution history.
 * HTML scraping required — parses institution details, RSSD ID,
 * holding company parent, and subsidiaries.
 *
 * @param {Object} params - { name }.
 * @return {Object} Standard result object.
 */
function queryFfiecNic(params) {
  var result = makeBlankResult('FFIEC_NIC');
  var start = new Date().getTime();

  try {
    var name = params.name || '';
    var url = 'https://www.ffiec.gov/nicpubweb/nicweb/InstitutionHistory.aspx' +
      '?parID_Rssd=&parDT_END=99991231&ESSION_KEY=&institutionTyp=' +
      '&searchPageType=OrgHist&nickName=' + encodeURIComponent(name);

    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var code = resp.getResponseCode();
    var body = resp.getContentText();
    result.rawResponse = truncateRaw(body);

    if (code !== 200) {
      result.error = 'HTTP ' + code;
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    // Parse HTML for institution details
    // FFIEC NIC returns institution info in labeled spans and tables

    // Look for RSSD ID
    var rssdMatch = body.match(/ID_RSSD[^>]*>\s*(\d+)/i) ||
                    body.match(/RSSD\s*(?:ID|#|Number)?[:\s]*(\d+)/i);

    // Look for institution name in results
    var nameMatch = body.match(/<a[^>]*InstitutionProfile[^>]*>([^<]+)<\/a>/i) ||
                    body.match(/Institution\s*Name[^<]*<[^>]*>([^<]+)/i);

    // Look for holding company parent
    var parentMatch = body.match(/(?:Holding|Parent)\s*(?:Company)?[^<]*<[^>]*>([^<]+)/i) ||
                      body.match(/Top\s*Holder[^<]*<[^>]*>([^<]+)/i);

    // Look for subsidiaries
    var subsidiaries = [];
    var subPattern = /(?:Subsidiary|Branch)[^<]*<[^>]*>([^<]+)/gi;
    var subMatch;
    while ((subMatch = subPattern.exec(body)) !== null) {
      var subName = subMatch[1].trim();
      if (subName.length > 2 && subsidiaries.indexOf(subName) === -1) {
        subsidiaries.push(subName);
      }
    }

    if (rssdMatch || nameMatch) {
      result.hit = true;
      result.legalName = nameMatch ? nameMatch[1].trim() : null;
      result.additionalIds.RSSD_ID = rssdMatch ? rssdMatch[1] : null;
      result.metadata.holdingCompanyParent = parentMatch ? parentMatch[1].trim() : null;
      if (subsidiaries.length > 0) {
        result.metadata.subsidiaries = subsidiaries;
      }
    }

    // Check if multiple results are returned — look for result count
    var countMatch = body.match(/(\d+)\s*(?:institution|result|record)/i);
    if (countMatch) {
      result.metadata.resultCount = parseInt(countMatch[1], 10);
    }
  } catch (e) {
    result.error = 'FFIEC NIC query failed: ' + e.message;
    Logger.log('EntityVerifierSources: queryFfiecNic error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 4. HUD NEIGHBORHOOD WATCH ─────────────────────────────────────────────────

/**
 * Queries HUD Neighborhood Watch for mortgage lender DBA resolution.
 * Critical for identifying DBA → legal name mappings for lenders.
 * Uses POST with form data. Parses HTML response for DBA/Institution labels.
 *
 * @param {Object} params - { name }.
 * @return {Object} Standard result object.
 */
function queryHudNeighborhoodWatch(params) {
  var result = makeBlankResult('HUD_NEIGHBORHOOD_WATCH');
  var start = new Date().getTime();

  try {
    var name = params.name || '';
    var url = 'https://entp.hud.gov/sfnw/public/lend_dba_info.cfm';

    var resp = UrlFetchApp.fetch(url, {
      method: 'post',
      payload: {
        lendlist: name,
        lender_type: 't2'
      },
      muteHttpExceptions: true
    });

    var code = resp.getResponseCode();
    var body = resp.getContentText();
    result.rawResponse = truncateRaw(body);

    if (code !== 200) {
      result.error = 'HTTP ' + code;
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    // Parse HTML for DBA → Legal Name mapping
    // Look for table rows containing "Institution:" and "DBA:" labels
    var institutionMatch = body.match(/Institution[:\s]*<[^>]*>\s*([^<]+)/i) ||
                           body.match(/Legal\s*Name[:\s]*<[^>]*>\s*([^<]+)/i) ||
                           body.match(/Institution[:\s]*([^<\n]+)/i);

    var dbaMatch = body.match(/DBA[:\s]*<[^>]*>\s*([^<]+)/i) ||
                   body.match(/(?:Trade|Doing\s*Business\s*As)\s*(?:Name)?[:\s]*<[^>]*>\s*([^<]+)/i) ||
                   body.match(/DBA[:\s]*([^<\n]+)/i);

    var idMatch = body.match(/(?:Lender|Institution)\s*(?:ID|#|Number)[:\s]*(\d+)/i);

    if (institutionMatch || dbaMatch) {
      result.hit = true;

      var institutionName = institutionMatch ? institutionMatch[1].trim() : null;
      var dbaName = dbaMatch ? dbaMatch[1].trim() : null;

      // Determine if the queried name is the DBA or the institution
      if (dbaName && institutionName) {
        var dbaScore = nameSimilarity(name, dbaName);
        var instScore = nameSimilarity(name, institutionName);

        if (dbaScore > instScore) {
          // Queried name matches the DBA — legal name is the institution
          result.isDBA = true;
          result.dbaLegalName = institutionName;
          result.legalName = institutionName;
        } else {
          // Queried name matches the institution — it IS the legal name
          result.legalName = institutionName;
          if (dbaName && dbaName !== institutionName) {
            result.metadata.dbaNames = [dbaName];
          }
        }
      } else {
        result.legalName = institutionName || dbaName || null;
      }

      if (idMatch && idMatch[1]) {
        result.additionalIds.INSTITUTION_ID = idMatch[1];
      }
    }

    // Try to extract multiple DBA entries from table rows
    var dbaList = [];
    var dbaRowPattern = /<tr[^>]*>[\s\S]*?DBA[\s\S]*?<td[^>]*>\s*([^<]+)/gi;
    var dbaRowMatch;
    while ((dbaRowMatch = dbaRowPattern.exec(body)) !== null) {
      var dbaEntry = dbaRowMatch[1].trim();
      if (dbaEntry.length > 2 && dbaList.indexOf(dbaEntry) === -1) {
        dbaList.push(dbaEntry);
      }
    }
    if (dbaList.length > 0) {
      result.metadata.allDbaNames = dbaList;
    }
  } catch (e) {
    result.error = 'HUD Neighborhood Watch query failed: ' + e.message;
    Logger.log('EntityVerifierSources: queryHudNeighborhoodWatch error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 5. NMLS CONSUMER ACCESS ────────────────────────────────────────────────────

/**
 * Queries NMLS Consumer Access for mortgage licensee information.
 * Parses HTML for legal entity name, NMLS ID, and state licenses.
 *
 * @param {Object} params - { name }.
 * @return {Object} Standard result object.
 */
function queryNmls(params) {
  var result = makeBlankResult('NMLS');
  var start = new Date().getTime();

  try {
    var name = params.name || '';
    var url = 'https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/' +
      encodeURIComponent(name);

    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var code = resp.getResponseCode();
    var body = resp.getContentText();
    result.rawResponse = truncateRaw(body);

    if (code !== 200) {
      result.error = 'HTTP ' + code;
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    // Parse HTML for NMLS entity details

    // Look for NMLS ID
    var nmlsIdMatch = body.match(/NMLS\s*(?:ID|#|Number)[:\s]*(\d+)/i) ||
                      body.match(/nmls[_\-]?id["\s:=]*(\d+)/i);

    // Look for legal entity name
    var legalNameMatch = body.match(/<h[1-4][^>]*>\s*([^<]+?)\s*<\/h[1-4]>/i) ||
                         body.match(/(?:Legal|Entity|Company)\s*Name[:\s]*<[^>]*>\s*([^<]+)/i) ||
                         body.match(/entityName["\s:=]*"?([^"<]+)/i);

    // Look for state licenses
    var stateLicenses = [];
    var licensePattern = /([A-Z]{2})\s*[-–]\s*(Licensed|Registered|Exempt|Approved)/gi;
    var licMatch;
    while ((licMatch = licensePattern.exec(body)) !== null) {
      stateLicenses.push({
        state: licMatch[1],
        status: licMatch[2]
      });
    }

    // Also try to find licenses in table format
    var stateTablePattern = /<td[^>]*>\s*([A-Z]{2})\s*<\/td>\s*<td[^>]*>\s*(Licensed|Registered|Exempt|Approved|Active)/gi;
    var stMatch;
    while ((stMatch = stateTablePattern.exec(body)) !== null) {
      var alreadyAdded = false;
      for (var k = 0; k < stateLicenses.length; k++) {
        if (stateLicenses[k].state === stMatch[1]) {
          alreadyAdded = true;
          break;
        }
      }
      if (!alreadyAdded) {
        stateLicenses.push({
          state: stMatch[1],
          status: stMatch[2]
        });
      }
    }

    // Look for trade/DBA names
    var tradeNameMatch = body.match(/(?:Trade|Other)\s*Name[s]?[:\s]*<[^>]*>\s*([^<]+)/i) ||
                         body.match(/DBA[:\s]*<[^>]*>\s*([^<]+)/i);

    if (nmlsIdMatch || legalNameMatch) {
      result.hit = true;
      result.legalName = legalNameMatch ? legalNameMatch[1].trim() : null;
      result.additionalIds.NMLS_ID = nmlsIdMatch ? nmlsIdMatch[1] : null;

      if (stateLicenses.length > 0) {
        result.metadata.stateLicenses = stateLicenses;
      }

      if (tradeNameMatch) {
        var tradeName = tradeNameMatch[1].trim();
        if (tradeName && result.legalName && tradeName !== result.legalName) {
          result.metadata.tradeNames = [tradeName];
          // Check if queried name matches trade name more than legal name
          if (nameSimilarity(name, tradeName) > nameSimilarity(name, result.legalName)) {
            result.isDBA = true;
            result.dbaLegalName = result.legalName;
          }
        }
      }
    }
  } catch (e) {
    result.error = 'NMLS query failed: ' + e.message;
    Logger.log('EntityVerifierSources: queryNmls error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 6. IRS TEOS ────────────────────────────────────────────────────────────────

/**
 * Queries IRS Tax Exempt Organization Search. Since the IRS EOS portal
 * requires interactive search, this delegates to queryProPublica990
 * as the programmatic alternative for exempt organization lookup.
 *
 * @param {Object} params - { name, ein }.
 * @return {Object} Standard result object.
 */
function queryIrsTeos(params) {
  var result = makeBlankResult('IRS_TEOS');
  var start = new Date().getTime();

  try {
    // Delegate to ProPublica 990 as the programmatic alternative
    var ppResult = queryProPublica990(params);

    // Re-label the result as IRS_TEOS
    result.sourceId = 'IRS_TEOS';
    result.hit = ppResult.hit;
    result.legalName = ppResult.legalName;
    result.ein = ppResult.ein;
    result.additionalIds = ppResult.additionalIds || {};
    result.metadata = ppResult.metadata || {};
    result.rawResponse = ppResult.rawResponse;
    result.isDBA = ppResult.isDBA;
    result.dbaLegalName = ppResult.dbaLegalName;

    // Add metadata indicating delegation
    result.metadata.delegatedTo = 'PROPUBLICA_990';
    result.metadata.note = 'IRS EOS requires interactive search; using ProPublica Nonprofit Explorer API';

    if (ppResult.hit) {
      result.metadata.exemptStatus = ppResult.metadata.nteeCode ? 'Exempt (NTEE: ' + ppResult.metadata.nteeCode + ')' : 'Exempt';
      result.metadata.rulingDate = ppResult.metadata.rulingDate || null;
    }
  } catch (e) {
    result.error = 'IRS TEOS query failed: ' + e.message;
    Logger.log('EntityVerifierSources: queryIrsTeos error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 7. PROPUBLICA 990 ─────────────────────────────────────────────────────────

/**
 * Queries ProPublica Nonprofit Explorer API for tax-exempt organization data.
 * Free JSON API — searches by name or EIN. Returns organization details
 * including EIN, legal name, NTEE code, revenue, and filing history.
 *
 * @param {Object} params - { name, ein }.
 * @return {Object} Standard result object.
 */
function queryProPublica990(params) {
  var result = makeBlankResult('PROPUBLICA_990');
  var start = new Date().getTime();

  try {
    var name = params.name || '';
    var ein = params.ein || '';
    var url;
    var body;
    var resp;
    var code;

    // If EIN is known, query by EIN first (more precise)
    if (ein) {
      var cleanEin = ein.replace(/[^0-9]/g, '');
      url = 'https://projects.propublica.org/nonprofits/api/v2/organizations/' + cleanEin + '.json';

      resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      code = resp.getResponseCode();
      body = resp.getContentText();
      result.rawResponse = truncateRaw(body);

      if (code === 200 && body) {
        var orgData = JSON.parse(body);
        if (orgData && orgData.organization) {
          var org = orgData.organization;
          result.hit = true;
          result.legalName = org.name || null;
          result.ein = org.ein ? String(org.ein) : null;
          result.metadata.city = org.city || null;
          result.metadata.state = org.state || null;
          result.metadata.nteeCode = org.ntee_code || null;
          result.metadata.revenue = org.total_revenue || null;
          result.metadata.rulingDate = org.ruling_date || null;
          result.metadata.subsectionCode = org.subsection_code || null;

          // Filing history
          if (orgData.filings_with_data && orgData.filings_with_data.length > 0) {
            result.metadata.filingHistory = [];
            var maxFilings = Math.min(orgData.filings_with_data.length, 5);
            for (var f = 0; f < maxFilings; f++) {
              var filing = orgData.filings_with_data[f];
              result.metadata.filingHistory.push({
                taxPeriod: filing.tax_prd || null,
                totalRevenue: filing.totrevenue || null,
                totalAssets: filing.totassetsend || null
              });
            }
          }

          result.queryTimeMs = new Date().getTime() - start;
          return result;
        }
      }
    }

    // Search by name
    url = 'https://projects.propublica.org/nonprofits/api/v2/search.json?q=' +
      encodeURIComponent(name);

    resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    code = resp.getResponseCode();
    body = resp.getContentText();

    if (!result.rawResponse) {
      result.rawResponse = truncateRaw(body);
    }

    if (code !== 200) {
      result.error = 'HTTP ' + code;
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    var searchData = JSON.parse(body);
    if (!searchData || !searchData.organizations || searchData.organizations.length === 0) {
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    // Find best match by name similarity
    var bestOrg = null;
    var bestScore = 0;

    for (var i = 0; i < searchData.organizations.length; i++) {
      var candidate = searchData.organizations[i];
      var candidateName = candidate.name || '';
      var score = nameSimilarity(name, candidateName);
      if (score > bestScore) {
        bestScore = score;
        bestOrg = candidate;
      }
    }

    if (bestOrg && bestScore > 0.3) {
      result.hit = true;
      result.legalName = bestOrg.name || null;
      result.ein = bestOrg.ein ? String(bestOrg.ein) : null;
      result.metadata.city = bestOrg.city || null;
      result.metadata.state = bestOrg.state || null;
      result.metadata.nteeCode = bestOrg.ntee_code || null;
      result.metadata.revenue = bestOrg.total_revenue || null;
      result.metadata.matchScore = bestScore;
    }
  } catch (e) {
    result.error = 'ProPublica 990 query failed: ' + e.message;
    Logger.log('EntityVerifierSources: queryProPublica990 error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 8. SAM.GOV ─────────────────────────────────────────────────────────────────

/**
 * Queries SAM.gov Entity Management API for federal contractor/grantee info.
 * Requires an API key from api.data.gov stored in PropertiesService as
 * 'SAM_GOV_API_KEY'. Extracts legal name, UEI, EIN, CAGE code, and address.
 *
 * @param {Object} params - { name }.
 * @return {Object} Standard result object.
 */
function querySamGov(params) {
  var result = makeBlankResult('SAM_GOV');
  var start = new Date().getTime();

  try {
    // Retrieve API key from PropertiesService
    var apiKey;
    try {
      apiKey = PropertiesService.getScriptProperties().getProperty('SAM_GOV_API_KEY');
    } catch (propErr) {
      apiKey = null;
    }

    if (!apiKey) {
      result.error = 'SAM_GOV_API_KEY not configured. Get a free API key from https://api.data.gov/signup/ ' +
        'and store it via: PropertiesService.getScriptProperties().setProperty("SAM_GOV_API_KEY", "YOUR_KEY")';
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    var name = params.name || '';
    var url = 'https://api.sam.gov/entity-information/v3/entities?api_key=' + apiKey +
      '&legalBusinessName=' + encodeURIComponent(name) +
      '&registrationStatus=A&purposeOfRegistrationCode=Z1~Z2~Z5';

    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var code = resp.getResponseCode();
    var body = resp.getContentText();
    result.rawResponse = truncateRaw(body);

    if (code === 403 || code === 401) {
      result.error = 'SAM.gov API authentication failed. Verify your API key is valid.';
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    if (code !== 200) {
      result.error = 'HTTP ' + code;
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    var data = JSON.parse(body);
    if (!data || !data.entityData || data.entityData.length === 0) {
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    // Find best match
    var bestEntity = null;
    var bestScore = 0;

    for (var i = 0; i < data.entityData.length; i++) {
      var entity = data.entityData[i];
      var reg = entity.entityRegistration || {};
      var entityName = reg.legalBusinessName || '';
      var score = nameSimilarity(name, entityName);

      // Also check DBA name
      var dbaName = reg.dbaName || '';
      var dbaScore = dbaName ? nameSimilarity(name, dbaName) : 0;
      var maxScore = Math.max(score, dbaScore);

      if (maxScore > bestScore) {
        bestScore = maxScore;
        bestEntity = entity;
      }
    }

    if (bestEntity && bestScore > 0.3) {
      var bestReg = bestEntity.entityRegistration || {};
      var coreData = bestEntity.coreData || {};
      var entityInfo = coreData.entityInformation || {};
      var physAddr = coreData.physicalAddress || {};

      result.hit = true;
      result.legalName = bestReg.legalBusinessName || null;
      result.additionalIds.UEI = bestReg.ueiSAM || null;
      result.additionalIds.CAGE_CODE = bestReg.cageCode || null;

      // Extract EIN if present in core data
      if (coreData.federalTaxIdentifierNumber) {
        result.ein = String(coreData.federalTaxIdentifierNumber);
      } else if (entityInfo.entityEFTIndicator) {
        result.metadata.eftIndicator = entityInfo.entityEFTIndicator;
      }

      result.metadata.entityType = entityInfo.entityStructureDesc || null;
      result.metadata.matchScore = bestScore;

      if (physAddr) {
        result.metadata.physicalAddress = {
          line1: physAddr.addressLine1 || null,
          city: physAddr.city || null,
          state: physAddr.stateOrProvinceCode || null,
          zip: physAddr.zipCode || null,
          country: physAddr.countryCode || null
        };
      }

      // Check for DBA
      if (bestReg.dbaName && bestReg.dbaName !== bestReg.legalBusinessName) {
        var queriedMatchesDba = nameSimilarity(name, bestReg.dbaName) >
                                nameSimilarity(name, bestReg.legalBusinessName);
        if (queriedMatchesDba) {
          result.isDBA = true;
          result.dbaLegalName = bestReg.legalBusinessName;
        }
        result.metadata.dbaName = bestReg.dbaName;
      }
    }
  } catch (e) {
    result.error = 'SAM.gov query failed: ' + e.message;
    Logger.log('EntityVerifierSources: querySamGov error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 9. USA SPENDING ────────────────────────────────────────────────────────────

/**
 * Queries USASpending.gov API for federal award recipient information.
 * Free JSON API. Extracts legal name, UEI, and recipient type.
 *
 * @param {Object} params - { name }.
 * @return {Object} Standard result object.
 */
function queryUsaSpending(params) {
  var result = makeBlankResult('USA_SPENDING');
  var start = new Date().getTime();

  try {
    var name = params.name || '';
    var url = 'https://api.usaspending.gov/api/v2/recipient/duns/?keyword=' +
      encodeURIComponent(name);

    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var code = resp.getResponseCode();
    var body = resp.getContentText();
    result.rawResponse = truncateRaw(body);

    if (code !== 200) {
      result.error = 'HTTP ' + code;
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    var data = JSON.parse(body);
    if (!data || !data.results || data.results.length === 0) {
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    // Find best match
    var bestResult = null;
    var bestScore = 0;

    for (var i = 0; i < data.results.length; i++) {
      var recipient = data.results[i];
      var recipientName = recipient.name || recipient.recipient_name || '';
      var score = nameSimilarity(name, recipientName);
      if (score > bestScore) {
        bestScore = score;
        bestResult = recipient;
      }
    }

    if (bestResult && bestScore > 0.3) {
      result.hit = true;
      result.legalName = bestResult.name || bestResult.recipient_name || null;
      result.additionalIds.UEI = bestResult.uei || null;
      result.metadata.recipientType = bestResult.recipient_level || null;
      result.metadata.recipientId = bestResult.id || null;
      result.metadata.amount = bestResult.amount || null;
      result.metadata.matchScore = bestScore;

      // Legacy DUNS if available
      if (bestResult.duns) {
        result.additionalIds.DUNS = bestResult.duns;
      }
    }
  } catch (e) {
    result.error = 'USASpending query failed: ' + e.message;
    Logger.log('EntityVerifierSources: queryUsaSpending error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 10. STATE SECRETARY OF STATE ───────────────────────────────────────────────

/**
 * Queries state Secretary of State business registrations.
 * Routes to the correct SOS based on params.state. Supports DE, NC, and VA
 * via HTML form POST and response scraping. Extracts legal name, file number,
 * formation date, status, entity type, and registered agent.
 *
 * @param {Object} params - { name, state }.
 * @return {Object} Standard result object.
 */
function queryStateSos(params) {
  var result = makeBlankResult('STATE_SOS');
  var start = new Date().getTime();

  try {
    var name = params.name || '';
    var state = (params.state || '').toUpperCase();

    if (!state) {
      result.error = 'State parameter required for SOS lookup. Provide params.state (e.g., "DE", "NC", "VA").';
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    var url;
    var payload;
    var body;
    var resp;
    var code;

    switch (state) {
      case 'DE':
        url = 'https://icis.corp.delaware.gov/eCorp/EntitySearch/NameSearch.aspx';
        // Delaware requires a GET first to obtain __VIEWSTATE, then POST
        resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        code = resp.getResponseCode();
        body = resp.getContentText();

        if (code === 200) {
          // Extract ASP.NET form fields
          var viewstate = extractFormField(body, '__VIEWSTATE');
          var eventValidation = extractFormField(body, '__EVENTVALIDATION');
          var viewstateGen = extractFormField(body, '__VIEWSTATEGENERATOR');

          payload = {
            '__VIEWSTATE': viewstate,
            '__EVENTVALIDATION': eventValidation,
            '__VIEWSTATEGENERATOR': viewstateGen,
            'ctl00$ContentPlaceHolder1$frmEntityName': name,
            'ctl00$ContentPlaceHolder1$btnSubmit': 'Search'
          };

          resp = UrlFetchApp.fetch(url, {
            method: 'post',
            payload: payload,
            muteHttpExceptions: true,
            followRedirects: true
          });
          code = resp.getResponseCode();
          body = resp.getContentText();
        }
        break;

      case 'NC':
        url = 'https://www.sosnc.gov/online_services/search/by_title/_Business_Registration';
        resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        code = resp.getResponseCode();
        body = resp.getContentText();

        if (code === 200) {
          var ncViewstate = extractFormField(body, '__VIEWSTATE');
          var ncEventVal = extractFormField(body, '__EVENTVALIDATION');

          payload = {
            '__VIEWSTATE': ncViewstate,
            '__EVENTVALIDATION': ncEventVal,
            'SearchCriteria': name,
            'SearchType': 'EntityName'
          };

          resp = UrlFetchApp.fetch(url, {
            method: 'post',
            payload: payload,
            muteHttpExceptions: true,
            followRedirects: true
          });
          code = resp.getResponseCode();
          body = resp.getContentText();
        }
        break;

      case 'VA':
        url = 'https://cis.scc.virginia.gov/EntitySearch.aspx';
        resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        code = resp.getResponseCode();
        body = resp.getContentText();

        if (code === 200) {
          var vaViewstate = extractFormField(body, '__VIEWSTATE');
          var vaEventVal = extractFormField(body, '__EVENTVALIDATION');

          payload = {
            '__VIEWSTATE': vaViewstate,
            '__EVENTVALIDATION': vaEventVal,
            'ctl00$cphMain$txtEntityName': name,
            'ctl00$cphMain$btnSearch': 'Search'
          };

          resp = UrlFetchApp.fetch(url, {
            method: 'post',
            payload: payload,
            muteHttpExceptions: true,
            followRedirects: true
          });
          code = resp.getResponseCode();
          body = resp.getContentText();
        }
        break;

      default:
        result.error = 'State "' + state + '" not yet supported. Currently supported: DE, NC, VA.';
        result.queryTimeMs = new Date().getTime() - start;
        return result;
    }

    result.rawResponse = truncateRaw(body);

    if (code !== 200) {
      result.error = 'HTTP ' + code;
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    // Parse HTML response for entity details (common patterns across SOS sites)
    var entityNameMatch = body.match(/(?:Entity|Company|Business)\s*Name[:\s]*<[^>]*>\s*([^<]+)/i) ||
                          body.match(/<td[^>]*class="[^"]*name[^"]*"[^>]*>\s*([^<]+)/i) ||
                          body.match(/<a[^>]*EntityDetails[^>]*>([^<]+)<\/a>/i);

    var fileNumberMatch = body.match(/(?:File|Entity|Registration)\s*(?:Number|#|No\.?)[:\s]*<[^>]*>\s*([^<]+)/i) ||
                          body.match(/(?:File|Entity)\s*(?:Number|#)[:\s]*(\d+)/i);

    var formDateMatch = body.match(/(?:Formation|Incorporation|Filing|Creation)\s*Date[:\s]*<[^>]*>\s*([^<]+)/i) ||
                        body.match(/(?:Formation|Incorporation)\s*Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);

    var statusMatch = body.match(/(?:Entity|Registration)?\s*Status[:\s]*<[^>]*>\s*([^<]+)/i) ||
                      body.match(/Status[:\s]*(Active|Inactive|Good Standing|Dissolved|Revoked|Withdrawn|Merged)/i);

    var entityTypeMatch = body.match(/(?:Entity|Business)\s*Type[:\s]*<[^>]*>\s*([^<]+)/i) ||
                          body.match(/Type[:\s]*(Corporation|LLC|Limited\s*Liability|Partnership|Trust)/i);

    var agentMatch = body.match(/(?:Registered|Statutory)\s*Agent[:\s]*<[^>]*>\s*([^<]+)/i);

    if (entityNameMatch || fileNumberMatch) {
      result.hit = true;
      result.legalName = entityNameMatch ? entityNameMatch[1].trim() : null;
      result.additionalIds.STATE_FILE_NUMBER = fileNumberMatch ? fileNumberMatch[1].trim() : null;
      result.metadata.formationDate = formDateMatch ? formDateMatch[1].trim() : null;
      result.metadata.status = statusMatch ? statusMatch[1].trim() : null;
      result.metadata.entityType = entityTypeMatch ? entityTypeMatch[1].trim() : null;
      result.metadata.registeredAgent = agentMatch ? agentMatch[1].trim() : null;
      result.metadata.state = state;
    }
  } catch (e) {
    result.error = 'State SOS query failed: ' + e.message;
    Logger.log('EntityVerifierSources: queryStateSos error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}

/**
 * Extracts a hidden form field value from HTML by field name.
 * Used for ASP.NET __VIEWSTATE, __EVENTVALIDATION, etc.
 *
 * @param {string} html - The HTML content.
 * @param {string} fieldName - The form field name to extract.
 * @return {string} The field value, or empty string if not found.
 */
function extractFormField(html, fieldName) {
  var escaped = fieldName.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
  var pattern = new RegExp('name="' + escaped + '"[^>]*value="([^"]*)"', 'i');
  var match = html.match(pattern);
  if (match) return match[1];

  // Try alternate attribute order: value before name
  var altPattern = new RegExp('value="([^"]*)"[^>]*name="' + escaped + '"', 'i');
  var altMatch = html.match(altPattern);
  if (altMatch) return altMatch[1];

  // Try id-based match
  var idPattern = new RegExp('id="' + escaped + '"[^>]*value="([^"]*)"', 'i');
  var idMatch = html.match(idPattern);
  return idMatch ? idMatch[1] : '';
}


// ─── 11. FINRA BROKERCHECK ──────────────────────────────────────────────────────

/**
 * Queries FINRA BrokerCheck API for broker-dealer firm information.
 * Free JSON API. Extracts legal name, CRD number, SEC number,
 * and registration status.
 *
 * @param {Object} params - { name }.
 * @return {Object} Standard result object.
 */
function queryFinraBrokerCheck(params) {
  var result = makeBlankResult('FINRA_BROKERCHECK');
  var start = new Date().getTime();

  try {
    var name = params.name || '';
    var url = 'https://api.brokercheck.finra.org/search/firm?query=' +
      encodeURIComponent(name) + '&hl=true&nrows=10&start=0';

    var resp = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { 'Accept': 'application/json' }
    });
    var code = resp.getResponseCode();
    var body = resp.getContentText();
    result.rawResponse = truncateRaw(body);

    if (code !== 200) {
      result.error = 'HTTP ' + code;
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    var data = JSON.parse(body);
    var hits = (data && data.hits && data.hits.hits) ? data.hits.hits : [];

    if (hits.length === 0) {
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    // Find best match
    var bestHit = null;
    var bestScore = 0;

    for (var i = 0; i < hits.length; i++) {
      var hitSource = hits[i]._source || {};
      var firmName = hitSource.bc_scope_name || hitSource.bc_firm_name || '';
      // Strip HTML highlight tags if present
      firmName = firmName.replace(/<\/?em>/gi, '').replace(/<\/?b>/gi, '');
      var score = nameSimilarity(name, firmName);
      if (score > bestScore) {
        bestScore = score;
        bestHit = hitSource;
      }
    }

    if (bestHit && bestScore > 0.3) {
      result.hit = true;
      var cleanName = (bestHit.bc_scope_name || bestHit.bc_firm_name || '')
        .replace(/<\/?em>/gi, '').replace(/<\/?b>/gi, '').trim();
      result.legalName = cleanName || null;
      result.additionalIds.CRD_NUMBER = bestHit.bc_firm_bc_firm_id || null;
      result.additionalIds.SEC_NUMBER = bestHit.bc_firm_bc_sec_number || null;
      result.metadata.registrationStatus = bestHit.bc_firm_ia_full_sec || null;
      result.metadata.matchScore = bestScore;

      // Additional firm details if available
      if (bestHit.bc_firm_bc_city) {
        result.metadata.city = bestHit.bc_firm_bc_city;
      }
      if (bestHit.bc_firm_bc_state) {
        result.metadata.state = bestHit.bc_firm_bc_state;
      }
    }
  } catch (e) {
    result.error = 'FINRA BrokerCheck query failed: ' + e.message;
    Logger.log('EntityVerifierSources: queryFinraBrokerCheck error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 12. SEC IARD ───────────────────────────────────────────────────────────────

/**
 * Queries SEC Investment Adviser Registration Depository (IARD) for
 * registered investment adviser information. Free JSON API.
 * Extracts legal name, CRD number, SEC number, and Form ADV status.
 *
 * @param {Object} params - { name }.
 * @return {Object} Standard result object.
 */
function querySecIard(params) {
  var result = makeBlankResult('SEC_IARD');
  var start = new Date().getTime();

  try {
    var name = params.name || '';
    var url = 'https://adviserinfo.sec.gov/IAPD/Content/Search/api/OrganizationSearch?query=' +
      encodeURIComponent(name);

    var resp = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { 'Accept': 'application/json' }
    });
    var code = resp.getResponseCode();
    var body = resp.getContentText();
    result.rawResponse = truncateRaw(body);

    if (code !== 200) {
      result.error = 'HTTP ' + code;
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    var data = JSON.parse(body);

    // The API may return firms directly or in a nested structure
    var firms = [];
    if (Array.isArray(data)) {
      firms = data;
    } else if (data && data.firms) {
      firms = data.firms;
    } else if (data && data.results) {
      firms = data.results;
    } else if (data && data.Firms) {
      firms = data.Firms;
    }

    if (firms.length === 0) {
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    // Find best match
    var bestFirm = null;
    var bestScore = 0;

    for (var i = 0; i < firms.length; i++) {
      var firm = firms[i];
      var firmName = firm.Name || firm.name || firm.FirmName || '';
      var score = nameSimilarity(name, firmName);
      if (score > bestScore) {
        bestScore = score;
        bestFirm = firm;
      }
    }

    if (bestFirm && bestScore > 0.3) {
      result.hit = true;
      result.legalName = bestFirm.Name || bestFirm.name || bestFirm.FirmName || null;
      result.additionalIds.CRD_NUMBER = bestFirm.CRDNumber || bestFirm.crd_number || bestFirm.CrdNumber || null;
      result.additionalIds.SEC_NUMBER = bestFirm.SECNumber || bestFirm.sec_number || bestFirm.SecNumber || null;
      result.metadata.formAdvStatus = bestFirm.Status || bestFirm.status || null;
      result.metadata.matchScore = bestScore;

      // Additional details
      if (bestFirm.City || bestFirm.city) {
        result.metadata.city = bestFirm.City || bestFirm.city;
      }
      if (bestFirm.State || bestFirm.state) {
        result.metadata.state = bestFirm.State || bestFirm.state;
      }
      if (bestFirm.BranchOfficeCount || bestFirm.branchOfficeCount) {
        result.metadata.branchOfficeCount = bestFirm.BranchOfficeCount || bestFirm.branchOfficeCount;
      }

      // Check for DBA / other names
      var otherNames = bestFirm.OtherNames || bestFirm.otherNames || bestFirm.AlsoKnownAs || null;
      if (otherNames) {
        if (typeof otherNames === 'string') {
          result.metadata.otherNames = [otherNames];
        } else if (Array.isArray(otherNames)) {
          result.metadata.otherNames = otherNames;
        }
      }
    }
  } catch (e) {
    result.error = 'SEC IARD query failed: ' + e.message;
    Logger.log('EntityVerifierSources: querySecIard error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 13. CFPB COMPLAINTS ───────────────────────────────────────────────────────

/**
 * Queries CFPB Consumer Complaint Database for the CFPB-normalized
 * company name. Free JSON API. Useful for identifying how CFPB
 * refers to an entity (often the legal name).
 *
 * @param {Object} params - { name }.
 * @return {Object} Standard result object.
 */
function queryCfpbComplaints(params) {
  var result = makeBlankResult('CFPB_COMPLAINTS');
  var start = new Date().getTime();

  try {
    var name = params.name || '';
    var url = 'https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/?company=' +
      encodeURIComponent(name) + '&size=1';

    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var code = resp.getResponseCode();
    var body = resp.getContentText();
    result.rawResponse = truncateRaw(body);

    if (code !== 200) {
      result.error = 'HTTP ' + code;
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    var data = JSON.parse(body);
    var hits = (data && data.hits && data.hits.hits) ? data.hits.hits : [];

    if (hits.length === 0) {
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    // Extract CFPB-normalized company name
    var complaint = hits[0]._source || {};
    var cfpbName = complaint.company || null;

    if (cfpbName) {
      result.hit = true;
      result.legalName = cfpbName;
      result.metadata.cfpbNormalizedName = cfpbName;
      result.metadata.matchScore = nameSimilarity(name, cfpbName);

      // Additional complaint metadata
      if (complaint.product) {
        result.metadata.product = complaint.product;
      }
      if (complaint.company_response) {
        result.metadata.companyResponse = complaint.company_response;
      }
      if (complaint.state) {
        result.metadata.state = complaint.state;
      }
      if (complaint.date_received) {
        result.metadata.dateReceived = complaint.date_received;
      }
    }
  } catch (e) {
    result.error = 'CFPB Complaints query failed: ' + e.message;
    Logger.log('EntityVerifierSources: queryCfpbComplaints error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 14. OPENCORPORATES ─────────────────────────────────────────────────────────

/**
 * Queries OpenCorporates API (free tier) for corporate registry data.
 * Searches US jurisdictions. Extracts legal name, company number,
 * jurisdiction, status, and incorporation date.
 *
 * @param {Object} params - { name, state }.
 * @return {Object} Standard result object.
 */
function queryOpenCorporates(params) {
  var result = makeBlankResult('OPENCORPORATES');
  var start = new Date().getTime();

  try {
    var name = params.name || '';
    var state = (params.state || '').toLowerCase();

    var url = 'https://api.opencorporates.com/v0.4/companies/search?q=' +
      encodeURIComponent(name);

    if (state) {
      url += '&jurisdiction_code=us_' + state;
    }

    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var code = resp.getResponseCode();
    var body = resp.getContentText();
    result.rawResponse = truncateRaw(body);

    if (code === 403 || code === 429) {
      result.error = 'OpenCorporates API rate limit reached. Free tier allows limited requests.';
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    if (code !== 200) {
      result.error = 'HTTP ' + code;
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    var data = JSON.parse(body);
    var companies = (data && data.results && data.results.companies) ? data.results.companies : [];

    if (companies.length === 0) {
      result.queryTimeMs = new Date().getTime() - start;
      return result;
    }

    // Find best match
    var bestCompany = null;
    var bestScore = 0;

    for (var i = 0; i < companies.length; i++) {
      var co = companies[i].company || companies[i];
      var coName = co.name || '';
      var score = nameSimilarity(name, coName);
      if (score > bestScore) {
        bestScore = score;
        bestCompany = co;
      }
    }

    if (bestCompany && bestScore > 0.3) {
      result.hit = true;
      result.legalName = bestCompany.name || null;
      result.additionalIds.COMPANY_NUMBER = bestCompany.company_number || null;
      result.metadata.jurisdiction = bestCompany.jurisdiction_code || null;
      result.metadata.status = bestCompany.current_status || null;
      result.metadata.incorporationDate = bestCompany.incorporation_date || null;
      result.metadata.companyType = bestCompany.company_type || null;
      result.metadata.registeredAddress = bestCompany.registered_address_in_full || null;
      result.metadata.matchScore = bestScore;
      result.metadata.opencorporatesUrl = bestCompany.opencorporates_url || null;

      // Check for previous names (DBA indicator)
      if (bestCompany.previous_names && bestCompany.previous_names.length > 0) {
        result.metadata.previousNames = [];
        for (var p = 0; p < bestCompany.previous_names.length; p++) {
          var prevName = bestCompany.previous_names[p];
          result.metadata.previousNames.push(prevName.company_name || prevName.name || prevName);
        }
      }
    }
  } catch (e) {
    result.error = 'OpenCorporates query failed: ' + e.message;
    Logger.log('EntityVerifierSources: queryOpenCorporates error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}


// ─── 15. GOOGLE FALLBACK ────────────────────────────────────────────────────────

/**
 * LAST RESORT: Searches Google for EIN and legal name information.
 * Constructs targeted queries for SEC filings and W-9 references.
 * Rate-limited heavily. Results are flagged as low confidence.
 *
 * @param {Object} params - { name }.
 * @return {Object} Standard result object.
 */
function queryGoogleFallback(params) {
  var result = makeBlankResult('GOOGLE_FALLBACK');
  var start = new Date().getTime();

  try {
    var name = params.name || '';

    // Construct targeted search queries
    var queries = [
      name + ' EIN site:sec.gov',
      name + ' "legal entity" EIN',
      name + ' W-9 EIN'
    ];

    var foundEins = [];
    var foundNames = [];

    for (var q = 0; q < queries.length; q++) {
      var searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(queries[q]) + '&num=5';

      try {
        var resp = UrlFetchApp.fetch(searchUrl, {
          muteHttpExceptions: true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          followRedirects: true
        });

        var code = resp.getResponseCode();
        var body = resp.getContentText();

        if (q === 0) {
          result.rawResponse = truncateRaw(body);
        }

        if (code === 200 && body) {
          // Extract EIN patterns (XX-XXXXXXX) from snippets
          var einPattern = /\b(\d{2}-\d{7})\b/g;
          var einMatch;
          while ((einMatch = einPattern.exec(body)) !== null) {
            var candidateEin = einMatch[1];
            // Filter out unlikely EINs (dates, phone fragments)
            var prefix = parseInt(candidateEin.substring(0, 2), 10);
            if (prefix >= 10 && prefix <= 98 && foundEins.indexOf(candidateEin) === -1) {
              foundEins.push(candidateEin);
            }
          }

          // Try to extract legal name variations from search snippets
          // Look for patterns like "legal name: XYZ" or "XYZ, Inc." near search terms
          var legalNamePattern = /(?:legal\s*(?:entity\s*)?name|officially\s*known\s*as|registered\s*as)[:\s]*([A-Z][A-Za-z0-9\s,.'&-]{3,60}(?:Inc\.?|LLC|Corp\.?|Ltd\.?|Co\.?|LP|LLP|NA|N\.A\.)?)/gi;
          var lnMatch;
          while ((lnMatch = legalNamePattern.exec(body)) !== null) {
            var candidateName = lnMatch[1].trim();
            // Clean HTML remnants
            candidateName = candidateName.replace(/<[^>]+>/g, '').trim();
            if (candidateName.length > 3 && foundNames.indexOf(candidateName) === -1) {
              foundNames.push(candidateName);
            }
          }
        }

        if (code === 429 || code === 503) {
          // Rate limited — stop further queries
          result.metadata.rateLimited = true;
          break;
        }
      } catch (fetchErr) {
        Logger.log('EntityVerifierSources: Google query ' + (q + 1) + ' failed — ' + fetchErr.message);
      }

      // Rate limit: brief pause between queries
      if (q < queries.length - 1) {
        Utilities.sleep(1000);
      }
    }

    // Compile results
    if (foundEins.length > 0 || foundNames.length > 0) {
      result.hit = true;

      if (foundEins.length > 0) {
        result.ein = foundEins[0]; // Most likely EIN
        if (foundEins.length > 1) {
          result.metadata.allEinsFound = foundEins;
        }
      }

      if (foundNames.length > 0) {
        // Find the name variation most similar to the queried name
        var bestName = null;
        var bestScore = 0;
        for (var n = 0; n < foundNames.length; n++) {
          var score = nameSimilarity(name, foundNames[n]);
          if (score > bestScore) {
            bestScore = score;
            bestName = foundNames[n];
          }
        }
        result.legalName = bestName;
        if (foundNames.length > 1) {
          result.metadata.allNamesFound = foundNames;
        }
      }

      result.metadata.confidence = 'LOW';
      result.metadata.note = 'Google fallback results have low confidence. Verify through authoritative sources.';
      result.metadata.queriesRun = queries.length;
    }
  } catch (e) {
    result.error = 'Google fallback query failed: ' + e.message;
    Logger.log('EntityVerifierSources: queryGoogleFallback error — ' + e.message);
  }

  result.queryTimeMs = new Date().getTime() - start;
  return result;
}
