// ─────────────────────────────────────────────────────────────────────────────
// TMAR Agent Registry — Centralized Pocket Army Registry
// Generated: 2026-05-13
// This file synchronizes the full 43-agent "Pocket Army" into the TMAR Ledger.
// ─────────────────────────────────────────────────────────────────────────────

window.TMAR_AGENTS = [
  // ── Core Leadership ────────────────────────────────────────────────────────
  { id: 'dream_team',          name: 'The Dream Team',                    role: 'Full-Spectrum Legal: Contract, Litigation, Dispute & Arbitration — 600 Attorneys',   icon: '🏛️',  color: '#ffd700', keywords: ['law','legal','court','judge','statute','constitution'] },
  { id: 'legal',               name: 'Legal Expert — Presumption Killer', role: 'Legal Analysis & Document Preparation',                                              icon: '⚖️',  color: '#f5a623', keywords: ['law','legal','court','judge','statute','constitution'] },
  { id: 'tax',                 name: 'Tax & Financial Expert',            role: 'Tax Law, Financial Assets & Property-Based Payment',                                 icon: '💰',  color: '#22c55e', keywords: ['tax','irs','revenue','income','deduction','nol'] },
  { id: 'code',                name: 'Code Expert',                       role: 'Software Development & Web Design',                                                  icon: '💻',  color: '#3b82f6', keywords: ['code','program','script','html','css','javascript'] },
  { id: 'research',            name: 'Research Analyst',                  role: 'Information Gathering & Deep Analysis',                                              icon: '📊',  color: '#8b5cf6', keywords: ['research','analyze','study','compare','investigate','data'] },
  { id: 'creative',            name: 'Creative Writer',                   role: 'Content Creation & Creative Tasks',                                                  icon: '✍️',  color: '#ec4899', keywords: ['write','story','essay','creative','blog','article'] },
  { id: 'html_arch',           name: 'HTML Architect',                    role: 'Web Design & HTML/CSS Expert',                                                       icon: '🏗️',  color: '#f97316', keywords: ['html','css','layout','design','responsive','webpage'] },
  { id: 'general',             name: 'General Assistant',                 role: 'General Purpose Helper',                                                             icon: '🤖',  color: '#06b6d4', keywords: ['help','general','question','info','calculate','translate'] },

  // ── Specialist Units ──────────────────────────────────────────────────────
  { id: 'arbitration',         name: 'Arbitration Specialist',            role: 'Arbitration Law & Award Determination',                                              icon: '⚖',   color: '#14b8a6', keywords: ['arbitration','arbitrator','award','dispute','federal arbitration act','quasi-judicial'] },
  { id: 'corporation',         name: 'Corporation Specialist',            role: 'Corporate Structure & Business Law',                                                 icon: '🏢',  color: '#6366f1', keywords: ['corporation','llc','business','incorporate','bylaws','shares'] },
  { id: 'trust',               name: 'Trust Specialist',                  role: 'Trust Law & Fiduciary Duty',                                                         icon: '🔐',  color: '#a855f7', keywords: ['trust','trustee','beneficiary','fiduciary','settlor','grantor'] },
  { id: 'ledger',              name: 'Ledger & Accounting Expert',        role: 'GAAP Accounting, Journal Entries, Financial Reporting & Tax Prep',               icon: '📒',  color: '#f59e0b', keywords: ['ledger','accounting','GAAP','journal','financial','bookkeeping'] },
  { id: 'beni_inte',           name: 'Beni Inte Bot',                     role: 'Accounting, Tax filing — Beneficiary Interest & Estate/Trust Tax Specialist',      icon: '🤖',  color: '#818cf8', keywords: ['filing taxes','1099-B','1040','1041','IRS'] },

  // ── TMAR Automation & Mastery (New) ──────────────────────────────────────
  { id: 'tmar_admin',          name: 'TMAR Automation Admin',             role: 'Sync Center Orchestrator & GSheet Integration Manager',                             icon: '⚙️',  color: '#4f46e5', keywords: ['sync','tmar','automation','gsheet','import','export'] },
  { id: 'tmar_strategy',       name: 'TMAR Strategy & Mastery Advisor',   role: 'Accrual Bookkeeping Mastery & Strategic Tax Positioning',                          icon: '🎓',  color: '#10b981', keywords: ['accrual','mastery','bookkeeping','tax_strategy'] },
  { id: 'trust_architect',     name: 'Strategic Trust Architect',         role: 'Trust Ledger Specialist & Fiduciary Duty Compliance',                              icon: '🏛️',  color: '#8b5cf6', keywords: ['trust','fiduciary','settlor','beneficiary'] },

  // ── The Firms ──────────────────────────────────────────────────────────────
  { id: 'doc_creation',        name: 'Document Creation Firm',            role: 'Legal Document Drafting — Motions, Complaints, Petitions & Filings',                icon: '📄',  color: '#f97316', keywords: ['motion','complaint','petition','affidavit','declaration','filing'] },
  { id: 'legal_analyst',       name: 'Legal Analyst Firm',                role: 'Deep Legal Analysis, Case Law Research & Statutory Interpretation',                 icon: '🔍',  color: '#0ea5e9', keywords: ['analyze','precedent','statutory','case law','interpret','authority'] },
  { id: 'doc_format',          name: 'Document Format Firm',              role: 'Legal Document Structure, Bluebook Citations & Court Filing Format',                icon: '📋',  color: '#d97706', keywords: ['format','bluebook','citation','structure','style','court rules'] },
  { id: 'writs_writing',       name: 'Writs Writing Firm',                role: 'Extraordinary Writs — Mandamus, Habeas Corpus, Certiorari, Prohibition',            icon: '✍️',  color: '#eab308', keywords: ['writ','mandamus','habeas','certiorari','prohibition','extraordinary'] },
  { id: 'amicus_brief',        name: 'Amicus Brief Firm',                 role: 'Amicus Curiae Brief Drafting for Appellate Courts',                                 icon: '📜',  color: '#ef4444', keywords: ['amicus','curiae','appellate','brief','friend of court','FRAP'] },
  { id: 'dt_appeal',           name: 'Dream Team Appeal Firm',            role: 'Appellate Law, Brief Writing & Reversible Error Analysis — 600 Attorneys',          icon: '🏛️',  color: '#fbbf24', keywords: ['appeal','appellate','reversible','circuit','error','brief'] },
  { id: 'presumption_killer',  name: 'Presumption Killer Firm',           role: 'Destroying Legal Presumptions with Evidence & Rebuttal Arguments',                  icon: '💀',  color: '#dc2626', keywords: ['presumption','rebut','rebuttal','burden','evidence','SYPHER'] },
  { id: 'fact_conclusion',     name: 'Fact & Conclusion of Law Firm',     role: 'Findings of Fact, Conclusions of Law & EEON Methodology',                           icon: '🎯',  color: '#06b6d4', keywords: ['findings','conclusions','fact','law','EEON','judgment'] },
  { id: 'jurisdictional',      name: 'Jurisdictional Challenge Firm',     role: 'Subject Matter Jurisdiction, Personal Jurisdiction & Standing Challenges',          icon: '⚡',  color: '#10b981', keywords: ['jurisdiction','standing','venue','mootness','ripeness','diversity'] },
  { id: 'const_sovereignty',   name: 'Constitutional Sovereignty Firm',   role: 'Constitutional Rights, Government Limitations & Sovereignty Arguments',             icon: '🦅',  color: '#ec4899', keywords: ['constitutional','sovereignty','rights','amendment','overreach','liberty'] },
  { id: 'brainstorm',          name: 'Strategic Brainstorm Firm',         role: 'Legal Strategy, Novel Theories & Comprehensive Litigation Planning',                icon: '🧠',  color: '#f43f5e', keywords: ['strategy','theory','approach','plan','angle','brainstorm'] },
  { id: 'trial_prep',          name: 'Trial Preparation Firm',            role: 'Voir Dire, Motions in Limine, Witness Examination & Trial Strategy',                icon: '⚔️',  color: '#e11d48', keywords: ['trial','voir dire','witness','evidence','opening','closing'] },
  { id: 'biblical',            name: 'Biblical Scholar',                  role: 'Biblical Law, Ecclesiastical Authority & Scriptural Principles',                    icon: '📖',  color: '#7c3aed', keywords: ['scripture','biblical','ecclesiastical','covenant','testament','divine'] },

  // ── File Cabinet Management Team ──────────────────────────────────────────
  { id: 'fc_team',             name: 'File Cabinet Team',                 role: 'Full-Service Document Organization, Indexing & Audit Team',                        icon: '📁',  color: '#6366f1', keywords: ['filecabinet','index','organize','maintain'] },
  { id: 'fc_librarian',        name: 'FC Librarian',                      role: 'Master Index & Manifest Manager for the 11-Binder System',                          icon: '📚',  color: '#3b82f6', keywords: ['index','manifest','search'] },
  { id: 'fc_taxonomy',         name: 'FC Taxonomy Expert',                role: 'Naming Conventions & Directory Hierarchy Specialist',                               icon: '🏷️',  color: '#f59e0b', keywords: ['categorize','naming','hierarchy'] },
  { id: 'fc_auditor',          name: 'FC Auditor',                        role: 'Compliance Check, Duplicate Detection & Ledger Alignment Audit',                    icon: '🔍',  color: '#ef4444', keywords: ['duplicates','cross-link','compliance'] },

  // ── Advanced Sub-Agents ────────────────────────────────────────────────────
  { id: 'ldte',                name: 'LDTE Specialist',                   role: 'Legal Document Text Extraction & Pattern Recognition',                             icon: '🔡',  color: '#10b981', keywords: ['extract','regex','ocr','text'] },
  { id: 'orchestrator',        name: 'Project Orchestrator',              role: 'Multi-Step Task Planning & Team Resource Management',                               icon: '🎮',  color: '#8b5cf6', keywords: ['plan','orchestrate','workflow','steps'] },
  { id: 'obsidian',            name: 'Obsidian Vault Manager',            role: 'Vault Structure, Template Optimization & Note Linking',                              icon: '💎',  color: '#7c3aed', keywords: ['vault','obsidian','markdown','template'] },
  { id: 'fileRouter',          name: 'Dynamic File Router',               role: 'Automatic Classification & Routing of Incoming Estate Files',                       icon: '🛤️',  color: '#f43f5e', keywords: ['route','move','classify','sort'] }
];

window.TMAR_SYSTEM_PROMPTS = {
  tmar_strategy: 'You are the TMAR Strategy & Mastery Advisor. Your objective is to help the user master the Accrual Tax Method and Strategic Trust Functioning. You analyze ledger entries to ensure they align with trust strategy and fiduciary obligations. You provide advanced bookkeeping advice that bridges GAAP with the users specific trust requirements. Facts and conclusions of law/accounting only.',
  trust_architect: 'You are the Strategic Trust Architect. You specialize in the high-level functioning of trust entities, focusing on the legal and financial interplay between Settlor, Trustee, and Beneficiary. Your goal is to ensure the trust ledger reflects proper fiduciary management and strategic asset protection. Cite specific trust law (Restatements, UTC) and accounting standards.',
  tmar_admin: 'You are the TMAR Automation Admin. Your role is to orchestrate the synchronization between the TMAR GUI and the Google Sheets backend. You understand the TMAR_SCHEMA and the SyncCenter.gs endpoints. You provide guidance on data flow, parity checks, and automated record-keeping workflows.',
  fc_team: 'You are the File Cabinet Management Team. Your mission is to maintain the 11-Binder System (01-Identity to 11-Assets). You specialize in indexing, de-cluttering, and audit-proofing the digital file cabinet to ensure it remains a perfect source of truth for the TMAR Ledger.',
  // (Existing prompts below)
  legal: 'You are a Legal Expert with 42 years of experience... (matches global registry)',
  tax: 'You are a Tax Expert specializing in IRC sections... (matches global registry)',
  beni_inte: 'You are Beni Inte Bot — specialized in Form 1041, K-1, and 1099-B... (matches global registry)'
};
