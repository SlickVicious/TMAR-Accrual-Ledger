/**
 * ============================================================================
 * EntityVerifierConfig.gs
 * ============================================================================
 * Configuration module for Entity Verifier v2 — TMAR Accrual Ledger
 *
 * Provides entity type definitions, verification status levels,
 * a registry of external data sources with real endpoints, global
 * configuration constants, and helper functions for source lookup
 * and API-key management.
 *
 * Version : 2.0.0
 * Updated : 2026-03-11
 * Compat  : Google Apps Script (V8 runtime)
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1. ENTITY_TYPES
// ---------------------------------------------------------------------------

var ENTITY_TYPES = {

  // ---- Banking & Depository ------------------------------------------------

  NATIONAL_BANK: {
    label: 'National Bank',
    color: '#1565C0',
    badgeColor: '#BBDEFB',
    description: 'OCC-chartered national bank (N.A. / National Association)',
    primarySources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'SEC_EDGAR'],
    secondarySources: ['SAM_GOV', 'CFPB_COMPLAINTS', 'OPEN_CORPORATES'],
    skipSources: ['NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  STATE_BANK: {
    label: 'State-Chartered Bank',
    color: '#1976D2',
    badgeColor: '#BBDEFB',
    description: 'State-chartered commercial bank supervised by state banking dept and FDIC/Fed',
    primarySources: ['FDIC_BANKFIND', 'FFIEC_NIC'],
    secondarySources: ['SEC_EDGAR', 'SAM_GOV', 'CFPB_COMPLAINTS', 'OPEN_CORPORATES'],
    skipSources: ['NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  SAVINGS_INSTITUTION: {
    label: 'Savings Institution',
    color: '#1E88E5',
    badgeColor: '#BBDEFB',
    description: 'Savings bank, savings & loan, or thrift institution',
    primarySources: ['FDIC_BANKFIND', 'FFIEC_NIC'],
    secondarySources: ['SEC_EDGAR', 'CFPB_COMPLAINTS', 'OPEN_CORPORATES'],
    skipSources: ['NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  BANK_HOLDING_COMPANY: {
    label: 'Bank Holding Company',
    color: '#0D47A1',
    badgeColor: '#90CAF9',
    description: 'Holding company controlling one or more banks (Fed-supervised)',
    primarySources: ['FFIEC_NIC', 'SEC_EDGAR', 'FDIC_BANKFIND'],
    secondarySources: ['SAM_GOV', 'OPEN_CORPORATES', 'CFPB_COMPLAINTS'],
    skipSources: ['NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  // ---- Lending & Mortgage --------------------------------------------------

  MORTGAGE_LENDER: {
    label: 'Mortgage Lender',
    color: '#2E7D32',
    badgeColor: '#C8E6C9',
    description: 'Licensed mortgage lender or originator (state or NMLS-registered)',
    primarySources: ['NMLS', 'HUD_NEIGHBORHOOD_WATCH', 'CFPB_COMPLAINTS'],
    secondarySources: ['SEC_EDGAR', 'FDIC_BANKFIND', 'OPEN_CORPORATES'],
    skipSources: ['IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  CONSUMER_LENDER: {
    label: 'Consumer Lender',
    color: '#388E3C',
    badgeColor: '#C8E6C9',
    description: 'Consumer finance company (personal loans, credit cards, fintech lender)',
    primarySources: ['NMLS', 'CFPB_COMPLAINTS'],
    secondarySources: ['SEC_EDGAR', 'OPEN_CORPORATES', 'STATE_SOS_DE'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS']
  },

  AUTO_FINANCE: {
    label: 'Auto Finance Company',
    color: '#43A047',
    badgeColor: '#C8E6C9',
    description: 'Auto loan originator, captive finance subsidiary, or BHPH dealer',
    primarySources: ['NMLS', 'CFPB_COMPLAINTS', 'SEC_EDGAR'],
    secondarySources: ['OPEN_CORPORATES', 'STATE_SOS_DE'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS']
  },

  // ---- Securities & Investments --------------------------------------------

  INVESTMENT_FUND: {
    label: 'Investment Fund',
    color: '#6A1B9A',
    badgeColor: '#E1BEE7',
    description: 'Registered investment company, mutual fund, or ETF (1940 Act)',
    primarySources: ['SEC_EDGAR', 'SEC_IARD'],
    secondarySources: ['FINRA_BROKERCHECK', 'OPEN_CORPORATES'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'IRS_TEOS', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  FUND_SERIES: {
    label: 'Fund Series / Class',
    color: '#7B1FA2',
    badgeColor: '#E1BEE7',
    description: 'Series or share class within a registered investment company',
    primarySources: ['SEC_EDGAR'],
    secondarySources: ['SEC_IARD', 'FINRA_BROKERCHECK'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  BROKER_DEALER: {
    label: 'Broker-Dealer',
    color: '#8E24AA',
    badgeColor: '#E1BEE7',
    description: 'FINRA-registered broker-dealer firm',
    primarySources: ['FINRA_BROKERCHECK', 'SEC_EDGAR'],
    secondarySources: ['SEC_IARD', 'OPEN_CORPORATES', 'CFPB_COMPLAINTS'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  INVESTMENT_ADVISER: {
    label: 'Investment Adviser',
    color: '#9C27B0',
    badgeColor: '#E1BEE7',
    description: 'SEC or state-registered investment adviser (RIA)',
    primarySources: ['SEC_IARD', 'SEC_EDGAR'],
    secondarySources: ['FINRA_BROKERCHECK', 'OPEN_CORPORATES'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  // ---- Debt Collection & Buying --------------------------------------------

  DEBT_BUYER: {
    label: 'Debt Buyer',
    color: '#C62828',
    badgeColor: '#FFCDD2',
    description: 'Entity that purchases charged-off debt portfolios',
    primarySources: ['CFPB_COMPLAINTS', 'OPEN_CORPORATES'],
    secondarySources: ['SEC_EDGAR', 'STATE_SOS_DE', 'STATE_SOS_NC', 'STATE_SOS_VA'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS']
  },

  COLLECTION_AGENCY: {
    label: 'Collection Agency',
    color: '#D32F2F',
    badgeColor: '#FFCDD2',
    description: 'Third-party debt collector or servicer',
    primarySources: ['CFPB_COMPLAINTS', 'OPEN_CORPORATES'],
    secondarySources: ['STATE_SOS_DE', 'STATE_SOS_NC', 'STATE_SOS_VA', 'SAM_GOV'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS']
  },

  // ---- Student Loans -------------------------------------------------------

  STUDENT_LOAN_SERVICER: {
    label: 'Student Loan Servicer',
    color: '#E65100',
    badgeColor: '#FFE0B2',
    description: 'Federal or private student loan servicer',
    primarySources: ['CFPB_COMPLAINTS', 'SAM_GOV', 'USA_SPENDING'],
    secondarySources: ['SEC_EDGAR', 'OPEN_CORPORATES'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS']
  },

  // ---- Insurance -----------------------------------------------------------

  INSURANCE_COMPANY: {
    label: 'Insurance Company',
    color: '#00838F',
    badgeColor: '#B2EBF2',
    description: 'State-licensed insurance carrier or underwriter',
    primarySources: ['NAIC', 'OPEN_CORPORATES'],
    secondarySources: ['SEC_EDGAR', 'STATE_SOS_DE', 'CFPB_COMPLAINTS'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  // ---- Payments & Money Services -------------------------------------------

  PAYMENT_PROCESSOR: {
    label: 'Payment Processor',
    color: '#00695C',
    badgeColor: '#B2DFDB',
    description: 'Payment processing company, acquirer, or PSP',
    primarySources: ['FINCEN_MSB', 'OPEN_CORPORATES'],
    secondarySources: ['SEC_EDGAR', 'CFPB_COMPLAINTS', 'STATE_SOS_DE'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS']
  },

  MONEY_TRANSMITTER: {
    label: 'Money Transmitter',
    color: '#004D40',
    badgeColor: '#B2DFDB',
    description: 'Licensed money transmitter or money services business (MSB)',
    primarySources: ['FINCEN_MSB', 'NMLS'],
    secondarySources: ['OPEN_CORPORATES', 'CFPB_COMPLAINTS', 'STATE_SOS_DE'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS']
  },

  // ---- Utilities -----------------------------------------------------------

  UTILITY_INVESTOR_OWNED: {
    label: 'Investor-Owned Utility',
    color: '#F57F17',
    badgeColor: '#FFF9C4',
    description: 'Publicly traded or privately held investor-owned utility (IOU)',
    primarySources: ['SEC_EDGAR', 'OPEN_CORPORATES'],
    secondarySources: ['CFPB_COMPLAINTS', 'STATE_SOS_DE', 'STATE_SOS_NC', 'STATE_SOS_VA'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  UTILITY_MUNICIPAL: {
    label: 'Municipal Utility',
    color: '#F9A825',
    badgeColor: '#FFF9C4',
    description: 'Government-owned municipal utility or cooperative',
    primarySources: ['SAM_GOV', 'OPEN_CORPORATES'],
    secondarySources: ['CFPB_COMPLAINTS', 'USA_SPENDING'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'SEC_EDGAR', 'IRS_TEOS', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  // ---- Telecom & ISP -------------------------------------------------------

  TELECOM: {
    label: 'Telecommunications Provider',
    color: '#4527A0',
    badgeColor: '#D1C4E9',
    description: 'Wireline, wireless, or CLEC/ILEC telecommunications carrier',
    primarySources: ['FCC_ULS', 'SEC_EDGAR'],
    secondarySources: ['OPEN_CORPORATES', 'CFPB_COMPLAINTS', 'STATE_SOS_DE'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FINCEN_MSB']
  },

  ISP: {
    label: 'Internet Service Provider',
    color: '#5E35B1',
    badgeColor: '#D1C4E9',
    description: 'Broadband, fiber, cable, or satellite internet provider',
    primarySources: ['FCC_ULS', 'SEC_EDGAR'],
    secondarySources: ['OPEN_CORPORATES', 'CFPB_COMPLAINTS'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FINCEN_MSB']
  },

  // ---- Government ----------------------------------------------------------

  FEDERAL_AGENCY: {
    label: 'Federal Agency',
    color: '#263238',
    badgeColor: '#CFD8DC',
    description: 'U.S. federal government agency, department, or bureau',
    primarySources: ['SAM_GOV', 'USA_SPENDING'],
    secondarySources: ['SEC_EDGAR'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB', 'OPEN_CORPORATES']
  },

  STATE_GOVERNMENT: {
    label: 'State Government Entity',
    color: '#37474F',
    badgeColor: '#CFD8DC',
    description: 'State-level government agency, authority, or instrumentality',
    primarySources: ['SAM_GOV', 'USA_SPENDING'],
    secondarySources: ['OPEN_CORPORATES'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  MUNICIPAL: {
    label: 'Municipal / Local Government',
    color: '#455A64',
    badgeColor: '#CFD8DC',
    description: 'County, city, town, or special district government entity',
    primarySources: ['SAM_GOV', 'USA_SPENDING'],
    secondarySources: ['OPEN_CORPORATES'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'IRS_TEOS', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  // ---- Nonprofit & Education -----------------------------------------------

  NONPROFIT: {
    label: 'Nonprofit Organization',
    color: '#AD1457',
    badgeColor: '#F8BBD0',
    description: 'IRS-recognized 501(c) tax-exempt organization',
    primarySources: ['IRS_TEOS', 'IRS_990_PROPUBLICA'],
    secondarySources: ['SAM_GOV', 'OPEN_CORPORATES', 'STATE_SOS_DE', 'STATE_SOS_NC', 'STATE_SOS_VA'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  EDUCATIONAL_INSTITUTION: {
    label: 'Educational Institution',
    color: '#C2185B',
    badgeColor: '#F8BBD0',
    description: 'College, university, or post-secondary institution',
    primarySources: ['IPEDS', 'IRS_TEOS', 'IRS_990_PROPUBLICA'],
    secondarySources: ['SAM_GOV', 'USA_SPENDING', 'OPEN_CORPORATES'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'NAIC', 'FCC_ULS', 'FINCEN_MSB']
  },

  FOUNDATION: {
    label: 'Private Foundation',
    color: '#880E4F',
    badgeColor: '#F8BBD0',
    description: 'IRS-recognized private foundation (990-PF filer)',
    primarySources: ['IRS_990_PROPUBLICA', 'IRS_TEOS'],
    secondarySources: ['SEC_EDGAR', 'OPEN_CORPORATES', 'STATE_SOS_DE'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  // ---- General Corporate ---------------------------------------------------

  PUBLIC_COMPANY: {
    label: 'Public Company',
    color: '#212121',
    badgeColor: '#E0E0E0',
    description: 'SEC-reporting public company (10-K/10-Q filer)',
    primarySources: ['SEC_EDGAR', 'OPEN_CORPORATES'],
    secondarySources: ['FINRA_BROKERCHECK', 'SAM_GOV', 'CFPB_COMPLAINTS', 'STATE_SOS_DE'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'IPEDS', 'FINCEN_MSB']
  },

  PRIVATE_COMPANY: {
    label: 'Private Company',
    color: '#424242',
    badgeColor: '#E0E0E0',
    description: 'Privately held corporation, LLC, or partnership',
    primarySources: ['OPEN_CORPORATES', 'STATE_SOS_DE', 'STATE_SOS_NC', 'STATE_SOS_VA'],
    secondarySources: ['SAM_GOV', 'CFPB_COMPLAINTS', 'SEC_EDGAR'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'IRS_TEOS', 'IRS_990_PROPUBLICA', 'IPEDS', 'FINCEN_MSB']
  },

  // ---- Employer (Local) ----------------------------------------------------

  EMPLOYER_LOCAL: {
    label: 'Local Employer',
    color: '#5D4037',
    badgeColor: '#D7CCC8',
    description: 'Local or regional employer not otherwise categorized',
    primarySources: ['OPEN_CORPORATES', 'STATE_SOS_NC', 'STATE_SOS_VA'],
    secondarySources: ['SAM_GOV', 'CFPB_COMPLAINTS', 'IRS_TEOS'],
    skipSources: ['FDIC_BANKFIND', 'FFIEC_NIC', 'NMLS', 'NAIC', 'IPEDS', 'FCC_ULS', 'FINCEN_MSB']
  },

  // ---- Lifecycle States ----------------------------------------------------

  DEFUNCT: {
    label: 'Defunct / Dissolved',
    color: '#9E9E9E',
    badgeColor: '#F5F5F5',
    description: 'Entity that has been dissolved, liquidated, or ceased operations',
    primarySources: ['FDIC_BANKFIND', 'SEC_EDGAR', 'OPEN_CORPORATES'],
    secondarySources: ['STATE_SOS_DE', 'STATE_SOS_NC', 'STATE_SOS_VA'],
    skipSources: []
  },

  RENAMED: {
    label: 'Renamed / Merged',
    color: '#757575',
    badgeColor: '#EEEEEE',
    description: 'Entity that changed its name or merged into another entity',
    primarySources: ['FDIC_BANKFIND', 'SEC_EDGAR', 'OPEN_CORPORATES'],
    secondarySources: ['STATE_SOS_DE', 'STATE_SOS_NC', 'STATE_SOS_VA', 'FFIEC_NIC'],
    skipSources: []
  }
};


// ---------------------------------------------------------------------------
// 2. VERIFICATION_STATUS
// ---------------------------------------------------------------------------

var VERIFICATION_STATUS = {

  HIGH: {
    label: 'High Confidence',
    color: '#2E7D32',
    icon: '\u2705',          // green check
    description: 'Verified against primary regulatory source with matching identifiers',
    actionRequired: false
  },

  MEDIUM: {
    label: 'Medium Confidence',
    color: '#F9A825',
    icon: '\u26A0\uFE0F',   // warning sign
    description: 'Partial match found — name matched but key identifiers unconfirmed',
    actionRequired: false
  },

  LOW: {
    label: 'Low Confidence',
    color: '#E65100',
    icon: '\uD83D\uDFE0',   // orange circle
    description: 'Only secondary or fallback sources returned a plausible match',
    actionRequired: true
  },

  UNVERIFIED: {
    label: 'Unverified',
    color: '#C62828',
    icon: '\u274C',          // red X
    description: 'No authoritative source confirmed this entity',
    actionRequired: true
  },

  DBA_MISMATCH: {
    label: 'DBA Mismatch',
    color: '#6A1B9A',
    icon: '\uD83D\uDFE3',   // purple circle
    description: 'Entity found under a different legal name — possible DBA or trade name',
    actionRequired: true
  },

  DEFUNCT: {
    label: 'Defunct / Inactive',
    color: '#616161',
    icon: '\uD83D\uDEAB',   // prohibited sign
    description: 'Entity confirmed but marked inactive, dissolved, or merged',
    actionRequired: true
  },

  PLACEHOLDER: {
    label: 'Placeholder',
    color: '#1565C0',
    icon: '\uD83D\uDD35',   // blue circle
    description: 'Entry is a placeholder pending verification — no lookup attempted yet',
    actionRequired: false
  },

  MANUAL_REQUIRED: {
    label: 'Manual Review Required',
    color: '#FFFFFF',
    icon: '\uD83D\uDC41\uFE0F', // eye
    description: 'Automated verification inconclusive — human review needed',
    actionRequired: true
  }
};


// ---------------------------------------------------------------------------
// 3. SOURCE_REGISTRY
// ---------------------------------------------------------------------------

var SOURCE_REGISTRY = [

  // ---- SEC EDGAR -----------------------------------------------------------
  {
    id: 'SEC_EDGAR',
    name: 'SEC EDGAR Full-Text Search',
    endpoints: [
      'https://efts.sec.gov/LATEST/search-index?q={query}&dateRange=custom&startdt=2020-01-01&enddt=2026-12-31&forms={formTypes}',
      'https://www.sec.gov/cgi-bin/browse-edgar?company={name}&CIK=&type={formType}&owner=include&count=10&action=getcompany'
    ],
    servesTypes: [
      'NATIONAL_BANK', 'STATE_BANK', 'SAVINGS_INSTITUTION', 'BANK_HOLDING_COMPANY',
      'INVESTMENT_FUND', 'FUND_SERIES', 'BROKER_DEALER', 'INVESTMENT_ADVISER',
      'PUBLIC_COMPANY', 'UTILITY_INVESTOR_OWNED', 'TELECOM', 'ISP',
      'INSURANCE_COMPANY', 'FOUNDATION', 'DEFUNCT', 'RENAMED',
      'MORTGAGE_LENDER', 'CONSUMER_LENDER', 'AUTO_FINANCE',
      'STUDENT_LOAN_SERVICER', 'PAYMENT_PROCESSOR', 'PRIVATE_COMPANY'
    ],
    resolves: ['cik', 'legalName', 'sic', 'stateOfIncorporation', 'filingHistory', 'formerNames'],
    rateLimit: { requests: 10, perSeconds: 1 },
    notes: 'SEC fair-access policy: max 10 req/sec per source IP. Use User-Agent header with contact email.',
    enabled: true
  },

  // ---- FDIC BankFind -------------------------------------------------------
  {
    id: 'FDIC_BANKFIND',
    name: 'FDIC BankFind Suite',
    endpoints: [
      'https://banks.data.fdic.gov/api/institutions?search={name}&limit=10&fields=REPNM,CERT,STALP,CITY,SPECGRP,ACTIVE,ENDEFYMD,CHANGECODE,INSTNAME'
    ],
    servesTypes: [
      'NATIONAL_BANK', 'STATE_BANK', 'SAVINGS_INSTITUTION', 'BANK_HOLDING_COMPANY',
      'DEFUNCT', 'RENAMED'
    ],
    resolves: ['fdicCert', 'legalName', 'charterType', 'state', 'city', 'activeStatus', 'endDate', 'changeCode', 'specialization'],
    rateLimit: { requests: 20, perSeconds: 1 },
    notes: 'Free public JSON API. No key required. CHANGECODE field indicates mergers/name changes.',
    enabled: true
  },

  // ---- FFIEC NIC -----------------------------------------------------------
  {
    id: 'FFIEC_NIC',
    name: 'FFIEC National Information Center',
    endpoints: [
      'https://www.ffiec.gov/nicpubweb/nicweb/SearchForm.aspx'
    ],
    servesTypes: [
      'NATIONAL_BANK', 'STATE_BANK', 'SAVINGS_INSTITUTION', 'BANK_HOLDING_COMPANY',
      'RENAMED'
    ],
    resolves: ['rssdId', 'legalName', 'charterType', 'holdingCompany', 'state', 'city', 'activeStatus'],
    rateLimit: { requests: 5, perSeconds: 10 },
    notes: 'HTML scrape required. ASP.NET ViewState must be managed across requests.',
    enabled: true
  },

  // ---- HUD Neighborhood Watch ----------------------------------------------
  {
    id: 'HUD_NEIGHBORHOOD_WATCH',
    name: 'HUD Neighborhood Watch (Early Warning)',
    endpoints: [
      'https://entp.hud.gov/sfnw/public/'
    ],
    servesTypes: ['MORTGAGE_LENDER'],
    resolves: ['lenderName', 'lenderId', 'dbaNames', 'defaultRates', 'compareMetrics'],
    rateLimit: { requests: 3, perSeconds: 10 },
    notes: 'HTML scrape. Useful for DBA lookup on FHA-approved lenders. Session-based navigation.',
    enabled: true
  },

  // ---- NMLS Consumer Access ------------------------------------------------
  {
    id: 'NMLS',
    name: 'NMLS Consumer Access',
    endpoints: [
      'https://www.nmlsconsumeraccess.org/'
    ],
    servesTypes: [
      'MORTGAGE_LENDER', 'CONSUMER_LENDER', 'AUTO_FINANCE', 'MONEY_TRANSMITTER'
    ],
    resolves: ['nmlsId', 'legalName', 'dbaNames', 'licenseStates', 'licenseTypes', 'activeStatus'],
    rateLimit: { requests: 3, perSeconds: 10 },
    notes: 'HTML scrape with search form. Returns NMLS ID, trade names, and state license details.',
    enabled: true
  },

  // ---- IRS Tax Exempt Org Search -------------------------------------------
  {
    id: 'IRS_TEOS',
    name: 'IRS Tax Exempt Organization Search',
    endpoints: [
      'https://apps.irs.gov/app/eos/'
    ],
    servesTypes: ['NONPROFIT', 'EDUCATIONAL_INSTITUTION', 'FOUNDATION'],
    resolves: ['ein', 'legalName', 'city', 'state', 'exemptStatus', 'deductibilityCode', 'rulingDate'],
    rateLimit: { requests: 3, perSeconds: 10 },
    notes: 'HTML scrape. Official IRS source for 501(c) determination letters and revocations.',
    enabled: true
  },

  // ---- ProPublica Nonprofit Explorer (990 data) ----------------------------
  {
    id: 'IRS_990_PROPUBLICA',
    name: 'ProPublica Nonprofit Explorer API',
    endpoints: [
      'https://projects.propublica.org/nonprofits/api/v2/search.json?q={name}',
      'https://projects.propublica.org/nonprofits/api/v2/organizations/{ein}.json'
    ],
    servesTypes: ['NONPROFIT', 'EDUCATIONAL_INSTITUTION', 'FOUNDATION'],
    resolves: ['ein', 'legalName', 'nteeCode', 'totalRevenue', 'totalAssets', 'taxPeriod', 'filingType', 'state', 'city'],
    rateLimit: { requests: 10, perSeconds: 1 },
    notes: 'Free JSON API. No key required. Sourced from IRS 990 e-file data. Slight lag behind IRS.',
    enabled: true
  },

  // ---- SAM.gov Entity API --------------------------------------------------
  {
    id: 'SAM_GOV',
    name: 'SAM.gov Entity Information',
    endpoints: [
      'https://api.sam.gov/entity-information/v3/entities?api_key={key}&legalBusinessName={name}&registrationStatus=A'
    ],
    servesTypes: [
      'FEDERAL_AGENCY', 'STATE_GOVERNMENT', 'MUNICIPAL',
      'NATIONAL_BANK', 'STUDENT_LOAN_SERVICER', 'UTILITY_MUNICIPAL',
      'NONPROFIT', 'EDUCATIONAL_INSTITUTION', 'PUBLIC_COMPANY', 'PRIVATE_COMPANY',
      'EMPLOYER_LOCAL', 'COLLECTION_AGENCY'
    ],
    resolves: ['ueiSAM', 'cageCode', 'legalName', 'dbaName', 'entityType', 'registrationStatus', 'physicalAddress', 'naicsCode'],
    rateLimit: { requests: 10, perSeconds: 1 },
    notes: 'Requires free API key from api.data.gov. Stores in Script Properties as SAM_GOV_API_KEY.',
    enabled: true
  },

  // ---- USAspending.gov -----------------------------------------------------
  {
    id: 'USA_SPENDING',
    name: 'USAspending.gov Recipient API',
    endpoints: [
      'https://api.usaspending.gov/api/v2/recipient/duns/?keyword={name}'
    ],
    servesTypes: [
      'FEDERAL_AGENCY', 'STATE_GOVERNMENT', 'MUNICIPAL',
      'STUDENT_LOAN_SERVICER', 'EDUCATIONAL_INSTITUTION', 'UTILITY_MUNICIPAL'
    ],
    resolves: ['recipientName', 'duns', 'uei', 'totalObligations', 'recipientLevel'],
    rateLimit: { requests: 10, perSeconds: 1 },
    notes: 'Free JSON API. No key required. Useful for confirming federal contract/grant recipients.',
    enabled: true
  },

  // ---- Delaware Secretary of State -----------------------------------------
  {
    id: 'STATE_SOS_DE',
    name: 'Delaware Division of Corporations',
    endpoints: [
      'https://icis.corp.delaware.gov/eCorp/EntitySearch/NameSearch.aspx'
    ],
    servesTypes: [
      'PUBLIC_COMPANY', 'PRIVATE_COMPANY', 'DEBT_BUYER', 'COLLECTION_AGENCY',
      'INSURANCE_COMPANY', 'NONPROFIT', 'FOUNDATION', 'CONSUMER_LENDER',
      'AUTO_FINANCE', 'PAYMENT_PROCESSOR', 'MONEY_TRANSMITTER',
      'UTILITY_INVESTOR_OWNED', 'TELECOM', 'DEFUNCT', 'RENAMED'
    ],
    resolves: ['fileNumber', 'entityName', 'entityKind', 'incorporationDate', 'state', 'status', 'registeredAgent'],
    rateLimit: { requests: 3, perSeconds: 10 },
    notes: 'HTML scrape. ASP.NET ViewState required. DE is the most common state of incorporation for large entities.',
    enabled: true
  },

  // ---- North Carolina Secretary of State -----------------------------------
  {
    id: 'STATE_SOS_NC',
    name: 'NC Secretary of State Business Search',
    endpoints: [
      'https://www.sosnc.gov/online_services/search/by_title/_Business_Registration'
    ],
    servesTypes: [
      'PRIVATE_COMPANY', 'DEBT_BUYER', 'COLLECTION_AGENCY',
      'NONPROFIT', 'UTILITY_INVESTOR_OWNED', 'EMPLOYER_LOCAL',
      'DEFUNCT', 'RENAMED'
    ],
    resolves: ['sosId', 'entityName', 'entityType', 'status', 'dateFormed', 'registeredAgent', 'principalOffice'],
    rateLimit: { requests: 3, perSeconds: 10 },
    notes: 'HTML scrape. Useful for NC-domiciled or NC-registered foreign entities.',
    enabled: true
  },

  // ---- Virginia State Corporation Commission -------------------------------
  {
    id: 'STATE_SOS_VA',
    name: 'Virginia SCC Entity Search',
    endpoints: [
      'https://cis.scc.virginia.gov/EntitySearch.aspx'
    ],
    servesTypes: [
      'PRIVATE_COMPANY', 'DEBT_BUYER', 'COLLECTION_AGENCY',
      'NONPROFIT', 'UTILITY_INVESTOR_OWNED', 'EMPLOYER_LOCAL',
      'DEFUNCT', 'RENAMED'
    ],
    resolves: ['sccId', 'entityName', 'entityType', 'status', 'formationDate', 'state', 'registeredAgent'],
    rateLimit: { requests: 3, perSeconds: 10 },
    notes: 'HTML scrape. VA SCC handles corporate registration (not a traditional SOS).',
    enabled: true
  },

  // ---- FINRA BrokerCheck ---------------------------------------------------
  {
    id: 'FINRA_BROKERCHECK',
    name: 'FINRA BrokerCheck Firm Search',
    endpoints: [
      'https://api.brokercheck.finra.org/search/firm?query={name}&hl=true&nrows=10&start=0'
    ],
    servesTypes: ['BROKER_DEALER', 'INVESTMENT_FUND', 'PUBLIC_COMPANY'],
    resolves: ['crdNumber', 'firmName', 'mainOfficeCity', 'mainOfficeState', 'registrationStatus', 'bcScope'],
    rateLimit: { requests: 10, perSeconds: 1 },
    notes: 'Free JSON API. Returns CRD numbers, registration status, and disclosure counts.',
    enabled: true
  },

  // ---- SEC IARD (Investment Adviser Registration Depository) ---------------
  {
    id: 'SEC_IARD',
    name: 'SEC IAPD Adviser Search',
    endpoints: [
      'https://adviserinfo.sec.gov/IAPD/Content/Search/api/OrganizationSearch?query={name}'
    ],
    servesTypes: ['INVESTMENT_ADVISER', 'INVESTMENT_FUND', 'FUND_SERIES', 'BROKER_DEALER'],
    resolves: ['iardNumber', 'legalName', 'dbaNames', 'secStatus', 'regState', 'aum', 'totalAccounts'],
    rateLimit: { requests: 10, perSeconds: 1 },
    notes: 'Free JSON API. Returns IARD/CRD numbers and registration details for RIAs.',
    enabled: true
  },

  // ---- NAIC Company Search -------------------------------------------------
  {
    id: 'NAIC',
    name: 'NAIC Company Information Search',
    endpoints: [
      'https://content.naic.org/cis_refined_results.htm?coName={name}'
    ],
    servesTypes: ['INSURANCE_COMPANY'],
    resolves: ['naicCode', 'companyName', 'domicileState', 'companyType', 'groupName', 'status'],
    rateLimit: { requests: 3, perSeconds: 10 },
    notes: 'HTML scrape. NAIC codes are the standard insurance industry identifier.',
    enabled: true
  },

  // ---- IPEDS ---------------------------------------------------------------
  {
    id: 'IPEDS',
    name: 'NCES IPEDS Institution Lookup',
    endpoints: [
      'https://nces.ed.gov/ipeds/'
    ],
    servesTypes: ['EDUCATIONAL_INSTITUTION'],
    resolves: ['unitId', 'institutionName', 'city', 'state', 'sector', 'level', 'control', 'accreditation'],
    rateLimit: { requests: 3, perSeconds: 10 },
    notes: 'HTML scrape. IPEDS UnitID is the federal identifier for post-secondary institutions.',
    enabled: true
  },

  // ---- FCC Universal Licensing System --------------------------------------
  {
    id: 'FCC_ULS',
    name: 'FCC Universal Licensing System',
    endpoints: [
      'https://wireless2.fcc.gov/UlsApp/UlsSearch/searchLicense.jsp'
    ],
    servesTypes: ['TELECOM', 'ISP'],
    resolves: ['fccFrn', 'callSign', 'licenseeName', 'serviceType', 'status', 'state'],
    rateLimit: { requests: 3, perSeconds: 10 },
    notes: 'HTML scrape. FRN (FCC Registration Number) is the primary telecom identifier.',
    enabled: true
  },

  // ---- CFPB Consumer Complaint Database ------------------------------------
  {
    id: 'CFPB_COMPLAINTS',
    name: 'CFPB Consumer Complaint Database',
    endpoints: [
      'https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/?company={name}&size=1'
    ],
    servesTypes: [
      'NATIONAL_BANK', 'STATE_BANK', 'SAVINGS_INSTITUTION',
      'MORTGAGE_LENDER', 'CONSUMER_LENDER', 'AUTO_FINANCE',
      'DEBT_BUYER', 'COLLECTION_AGENCY', 'STUDENT_LOAN_SERVICER',
      'BROKER_DEALER', 'INSURANCE_COMPANY',
      'PAYMENT_PROCESSOR', 'MONEY_TRANSMITTER',
      'UTILITY_INVESTOR_OWNED', 'TELECOM', 'ISP',
      'PUBLIC_COMPANY', 'PRIVATE_COMPANY', 'EMPLOYER_LOCAL'
    ],
    resolves: ['companyName', 'complaintCount', 'productTypes', 'responseTypes'],
    rateLimit: { requests: 10, perSeconds: 1 },
    notes: 'Free JSON API. No key required. Useful for confirming company existence and DBA names via complaint records.',
    enabled: true
  },

  // ---- FinCEN MSB Registrant Search ----------------------------------------
  {
    id: 'FINCEN_MSB',
    name: 'FinCEN MSB Registrant Search',
    endpoints: [
      'https://www.fincen.gov/msb-registrant-search'
    ],
    servesTypes: ['PAYMENT_PROCESSOR', 'MONEY_TRANSMITTER'],
    resolves: ['legalName', 'dbaNames', 'msbActivities', 'registrationDate', 'state'],
    rateLimit: { requests: 3, perSeconds: 10 },
    notes: 'HTML scrape. FinCEN registration is required for all MSBs above de minimis thresholds.',
    enabled: true
  },

  // ---- OpenCorporates ------------------------------------------------------
  {
    id: 'OPEN_CORPORATES',
    name: 'OpenCorporates Company Search',
    endpoints: [
      'https://api.opencorporates.com/v0.4/companies/search?q={name}&jurisdiction_code=us_{state}'
    ],
    servesTypes: [
      'NATIONAL_BANK', 'STATE_BANK', 'SAVINGS_INSTITUTION', 'BANK_HOLDING_COMPANY',
      'MORTGAGE_LENDER', 'CONSUMER_LENDER', 'AUTO_FINANCE',
      'INVESTMENT_FUND', 'BROKER_DEALER', 'INVESTMENT_ADVISER',
      'DEBT_BUYER', 'COLLECTION_AGENCY', 'STUDENT_LOAN_SERVICER',
      'INSURANCE_COMPANY', 'PAYMENT_PROCESSOR', 'MONEY_TRANSMITTER',
      'UTILITY_INVESTOR_OWNED', 'UTILITY_MUNICIPAL',
      'TELECOM', 'ISP',
      'STATE_GOVERNMENT', 'MUNICIPAL',
      'NONPROFIT', 'EDUCATIONAL_INSTITUTION', 'FOUNDATION',
      'PUBLIC_COMPANY', 'PRIVATE_COMPANY', 'EMPLOYER_LOCAL',
      'DEFUNCT', 'RENAMED'
    ],
    resolves: ['companyNumber', 'companyName', 'jurisdictionCode', 'incorporationDate', 'companyType', 'status', 'registeredAddress', 'officers'],
    rateLimit: { requests: 5, perSeconds: 1 },
    notes: 'Free tier returns basic data (500 req/month). Paid plans for bulk. jurisdiction_code format: us_de, us_nc, etc.',
    enabled: true
  },

  // ---- Google Fallback (constructed search) --------------------------------
  {
    id: 'GOOGLE_FALLBACK',
    name: 'Google Targeted Search (Fallback)',
    endpoints: [],
    servesTypes: [
      'NATIONAL_BANK', 'STATE_BANK', 'SAVINGS_INSTITUTION', 'BANK_HOLDING_COMPANY',
      'MORTGAGE_LENDER', 'CONSUMER_LENDER', 'AUTO_FINANCE',
      'INVESTMENT_FUND', 'FUND_SERIES', 'BROKER_DEALER', 'INVESTMENT_ADVISER',
      'DEBT_BUYER', 'COLLECTION_AGENCY', 'STUDENT_LOAN_SERVICER',
      'INSURANCE_COMPANY', 'PAYMENT_PROCESSOR', 'MONEY_TRANSMITTER',
      'UTILITY_INVESTOR_OWNED', 'UTILITY_MUNICIPAL',
      'TELECOM', 'ISP',
      'FEDERAL_AGENCY', 'STATE_GOVERNMENT', 'MUNICIPAL',
      'NONPROFIT', 'EDUCATIONAL_INSTITUTION', 'FOUNDATION',
      'PUBLIC_COMPANY', 'PRIVATE_COMPANY', 'EMPLOYER_LOCAL',
      'DEFUNCT', 'RENAMED'
    ],
    resolves: ['searchUrl', 'suggestedQueries'],
    rateLimit: { requests: 1, perSeconds: 5 },
    notes: 'No direct endpoint. Constructs site:-scoped Google search URLs for manual or Apps Script UrlFetchApp follow-up.',
    enabled: true
  }
];


// ---------------------------------------------------------------------------
// 4. CONFIG — Global Configuration
// ---------------------------------------------------------------------------

var CONFIG = {
  CACHE_TTL_DAYS: 90,
  MAX_CONCURRENT_REQUESTS: 5,
  RATE_LIMIT_PAUSE_MS: 200,
  CACHE_SHEET_NAME: 'EV_Cache',
  SAM_API_KEY_PROPERTY: 'SAM_GOV_API_KEY',
  VERSION: '2.0.0',
  LOG_LEVEL: 'INFO'
};


// ---------------------------------------------------------------------------
// 5. Helper Functions
// ---------------------------------------------------------------------------

/**
 * Returns an ordered array of source objects applicable to a given entity type.
 * Primary sources appear first, followed by secondary sources.
 * Sources listed in skipSources for the type are excluded.
 *
 * @param {string} entityType - Key from ENTITY_TYPES (e.g. 'NATIONAL_BANK').
 * @return {Object[]} Array of source objects from SOURCE_REGISTRY, ordered
 *         primary-first then secondary. Empty array if type is unknown.
 */
function getSourcesForType(entityType) {
  var typeDef = ENTITY_TYPES[entityType];
  if (!typeDef) {
    Logger.log('[EntityVerifierConfig] Unknown entity type: ' + entityType);
    return [];
  }

  var skipSet = {};
  var i;
  for (i = 0; i < typeDef.skipSources.length; i++) {
    skipSet[typeDef.skipSources[i]] = true;
  }

  var sourceMap = {};
  for (i = 0; i < SOURCE_REGISTRY.length; i++) {
    sourceMap[SOURCE_REGISTRY[i].id] = SOURCE_REGISTRY[i];
  }

  var results = [];
  var seen = {};

  // Primary sources first
  for (i = 0; i < typeDef.primarySources.length; i++) {
    var pid = typeDef.primarySources[i];
    if (!skipSet[pid] && sourceMap[pid] && sourceMap[pid].enabled) {
      results.push(sourceMap[pid]);
      seen[pid] = true;
    }
  }

  // Secondary sources next
  for (i = 0; i < typeDef.secondarySources.length; i++) {
    var sid = typeDef.secondarySources[i];
    if (!skipSet[sid] && !seen[sid] && sourceMap[sid] && sourceMap[sid].enabled) {
      results.push(sourceMap[sid]);
      seen[sid] = true;
    }
  }

  return results;
}


/**
 * Retrieves a single source object from SOURCE_REGISTRY by its ID.
 *
 * @param {string} sourceId - The source identifier (e.g. 'SEC_EDGAR').
 * @return {Object|null} The source object, or null if not found.
 */
function getSourceById(sourceId) {
  for (var i = 0; i < SOURCE_REGISTRY.length; i++) {
    if (SOURCE_REGISTRY[i].id === sourceId) {
      return SOURCE_REGISTRY[i];
    }
  }
  Logger.log('[EntityVerifierConfig] Source not found: ' + sourceId);
  return null;
}


/**
 * Reads an API key from Google Apps Script's Script Properties store.
 *
 * @param {string} keyName - The property key name (e.g. 'SAM_GOV_API_KEY').
 * @return {string|null} The stored key value, or null if not set.
 */
function getApiKey(keyName) {
  var props = PropertiesService.getScriptProperties();
  var value = props.getProperty(keyName);
  if (!value) {
    Logger.log('[EntityVerifierConfig] API key not found in Script Properties: ' + keyName);
  }
  return value;
}


/**
 * Stores an API key into Google Apps Script's Script Properties store.
 *
 * @param {string} keyName - The property key name (e.g. 'SAM_GOV_API_KEY').
 * @param {string} value   - The API key value to store.
 */
function setApiKey(keyName, value) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty(keyName, value);
  Logger.log('[EntityVerifierConfig] API key stored: ' + keyName);
}
