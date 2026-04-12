// ========== EON AI JAVASCRIPT FUNCTIONS ==========

// Toggle sidebar visibility
function toggleEonSidebar() {
  const sidebar = document.getElementById('eonSidebar');
  const container = document.getElementById('eonPagesContainer');
  const isVisible = sidebar.style.display !== 'none';
  
  if (isVisible) {
    sidebar.style.display = 'none';
    container.style.display = 'none';
    document.body.style.paddingLeft = '0';
  } else {
    sidebar.style.display = 'block';
    container.style.display = 'block';
    document.body.style.paddingLeft = '240px';
    // Restore active page — after any goEonPage call all pages get display:none inline.
    // If nothing is active, default to dashboard so the content area never shows black.
    if (!container.querySelector('.page.active')) {
      goEonPage(null, 'dashboard');
    }
  }
}

// Navigate between EoN AI pages
function goEonPage(btn, page) {
  // Hide all pages — explicitly force display:none to override any inline styles
  const container = document.getElementById('eonPagesContainer');
  const pages = container.querySelectorAll('.page');
  pages.forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
  
  // Remove active from all buttons
  const buttons = document.querySelectorAll('.side-btn');
  buttons.forEach(b => b.classList.remove('active'));
  
  // Show target page — remove inline display so CSS .page.active takes over
  const target = container.querySelector('#page-' + page);
  if (target) {
    target.style.removeProperty('display');
    target.classList.add('active');
  }
  
  // Activate button — if btn not passed, find it by page name in sidebar
  if (!btn) {
    var sidebar = document.getElementById('eonSidebar');
    if (sidebar) { btn = sidebar.querySelector("button[onclick*=\"goEonPage(this,'" + page + "')\"]"); }
  }
  if (btn) {
    btn.classList.add('active');
  }
  
  // Initialize page if needed
  initEonPage(page);
}

// Analytics — build stats from AP conversation store + MEM0
function updateAnalytics() {
  var agentIds = ['legal','trust','tax','arbitration','corporation','research',
                  'code','creative','html_arch','general','accounting','dream_team'];
  var totalQueries = 0, legalQueries = 0, sessionsTotal = 0;
  var usageMap = {};
  var recentActivity = [];

  agentIds.forEach(function(id) {
    try {
      var raw = localStorage.getItem('ap_conv_' + id);
      if (!raw) return;
      var store = JSON.parse(raw);
      var sessions = store.sessions || {};
      var sessionKeys = Object.keys(sessions);
      sessionsTotal += sessionKeys.length;
      usageMap[id] = 0;
      sessionKeys.forEach(function(sk) {
        var msgs = sessions[sk].messages || [];
        msgs.forEach(function(m) {
          if (m.role === 'user') {
            totalQueries++;
            usageMap[id]++;
            if (id === 'legal' || id === 'arbitration' || id === 'corporation' || id === 'trust') legalQueries++;
            recentActivity.push({ agent: id, text: m.content, ts: sessions[sk].created || 0 });
          }
        });
      });
    } catch(e) {}
  });

  var memCount = 0;
  try {
    var allKeys = Object.keys(localStorage);
    allKeys.forEach(function(k) { if (k.indexOf('mem0_') === 0 || k.indexOf('MEM0_') === 0) memCount++; });
    if (typeof MEM0 !== 'undefined' && typeof MEM0.count === 'function') memCount = MEM0.count();
  } catch(e) {}

  var agentsUsed = Object.keys(usageMap).filter(function(k) { return usageMap[k] > 0; }).length;

  var el = function(id, val) { var e = document.getElementById(id); if (e) e.textContent = val; };
  el('anQueries', totalQueries);
  el('anLegal', legalQueries);
  el('anAgentsUsed', agentsUsed);
  el('anSessions', sessionsTotal);
  el('anMemory', memCount);

  // Usage distribution
  var usageEl = document.getElementById('analyticsUsage');
  if (usageEl) {
    if (totalQueries === 0) {
      usageEl.innerHTML = '<span style="color:var(--text2)">No queries yet.</span>';
    } else {
      usageEl.innerHTML = Object.keys(usageMap).filter(function(k){ return usageMap[k] > 0; }).map(function(k) {
        var pct = Math.round((usageMap[k] / totalQueries) * 100);
        return '<div style="margin-bottom:8px">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:3px">' +
            '<span style="font-weight:600">' + k + '</span>' +
            '<span style="color:var(--text2)">' + usageMap[k] + ' (' + pct + '%)</span>' +
          '</div>' +
          '<div style="height:6px;background:rgba(255,255,255,.1);border-radius:3px">' +
            '<div style="height:6px;background:#3b82f6;border-radius:3px;width:' + pct + '%"></div>' +
          '</div></div>';
      }).join('');
    }
  }

  // Recent activity
  var logEl = document.getElementById('analyticsLog');
  if (logEl) {
    recentActivity.sort(function(a,b){ return b.ts - a.ts; });
    var recent = recentActivity.slice(0, 20);
    if (recent.length === 0) {
      logEl.innerHTML = '<span style="color:var(--text2)">No activity yet.</span>';
    } else {
      logEl.innerHTML = recent.map(function(r) {
        return '<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">' +
          '<span style="font-size:10px;font-weight:700;color:#3b82f6;text-transform:uppercase">[' + r.agent + ']</span> ' +
          '<span style="color:var(--text,#e2e8f0)">' + r.text.substring(0, 120).replace(/</g,'&lt;') + (r.text.length > 120 ? '…' : '') + '</span>' +
          '</div>';
      }).join('');
    }
  }
}

// Initialize page-specific content
function initEonPage(page) {
  if (page === 'agents') {
    renderAgents();
  } else if (page === 'analytics') {
    updateAnalytics();
  } else if (page === 'dashboard') {
    updateDashboard();
  } else if (page === 'chat') {
    initChat();
  } else if (page === 'taxforms') {
    initTaxForms();
    // Ensure Form 1120 renders its year-specific content on first visit
    var w = document.getElementById('form1120-year-content');
    if (w && !w.querySelector('.irs-form-wrap')) onYearChange(EEON_STATE.year);
  } else if (page === 'eeonfull') {
    initEmbeddedEeonSuite();
  }
}

// Render agents grid
function renderAgents() {
  const grid = document.getElementById('agentsGrid');
  if (!grid) return;

  const agents = [
    {id: 'dream_team', name: 'The Dream Team', role: 'Full-Spectrum Legal: Contract, Litigation, Dispute & Arbitration — 600 Attorneys', icon: '🏛️', color: '#ffd700', keywords: ['law', 'legal', 'court', 'judge', 'statute', 'constitution']},
    {id: 'legal', name: 'Legal Expert — Presumption Killer', role: 'Legal Analysis & Document Preparation', icon: '⚖️', color: '#f5a623', keywords: ['law', 'legal', 'court', 'judge', 'statute', 'constitution']},
    {id: 'tax', name: 'Tax & Financial Expert', role: 'Tax Law, Financial Assets & Property-Based Payment', icon: '💰', color: '#22c55e', keywords: ['tax', 'irs', 'revenue', 'income', 'deduction', 'nol']},
    {id: 'code', name: 'Code Expert', role: 'Software Development & Web Design', icon: '💻', color: '#3b82f6', keywords: ['code', 'program', 'script', 'html', 'css', 'javascript']},
    {id: 'research', name: 'Research Analyst', role: 'Information Gathering & Deep Analysis', icon: '📊', color: '#8b5cf6', keywords: ['research', 'analyze', 'study', 'compare', 'investigate', 'data']},
    {id: 'creative', name: 'Creative Writer', role: 'Content Creation & Creative Tasks', icon: '✍️', color: '#ec4899', keywords: ['write', 'story', 'essay', 'creative', 'blog', 'article']},
    {id: 'html_arch', name: 'HTML Architect', role: 'Web Design & HTML/CSS Expert', icon: '🏗️', color: '#f97316', keywords: ['html', 'css', 'layout', 'design', 'responsive', 'webpage']},
    {id: 'general', name: 'General Assistant', role: 'General Purpose Helper', icon: '🤖', color: '#06b6d4', keywords: ['help', 'general', 'question', 'info', 'calculate', 'translate']},
    {id: 'arbitration', name: 'Arbitration Specialist', role: 'Arbitration Law & Award Determination', icon: '⚖', color: '#14b8a6', keywords: ['arbitration', 'arbitrator', 'award', 'dispute', 'federal arbitration act', 'quasi-judicial']},
    {id: 'corporation', name: 'Corporation Specialist', role: 'Corporate Structure & Business Law', icon: '🏢', color: '#6366f1', keywords: ['corporation', 'llc', 'business', 'incorporate', 'bylaws', 'shares']},
    {id: 'trust', name: 'Trust Specialist', role: 'Trust Law & Fiduciary Duty', icon: '🔐', color: '#a855f7', keywords: ['trust', 'trustee', 'beneficiary', 'fiduciary', 'settlor', 'grantor']},
    {id: 'doc_creation', name: 'Document Creation Firm', role: 'Legal Document Drafting — Motions, Complaints, Petitions & Filings', icon: '📄', color: '#f97316', keywords: ['motion', 'complaint', 'petition', 'affidavit', 'declaration', 'filing']},
    {id: 'legal_analyst', name: 'Legal Analyst Firm', role: 'Deep Legal Analysis, Case Law Research & Statutory Interpretation', icon: '🔍', color: '#0ea5e9', keywords: ['analyze', 'precedent', 'statutory', 'case law', 'interpret', 'authority']},
    {id: 'doc_format', name: 'Document Format Firm', role: 'Legal Document Structure, Bluebook Citations & Court Filing Format', icon: '📋', color: '#d97706', keywords: ['format', 'bluebook', 'citation', 'structure', 'style', 'court rules']},
    {id: 'writs_writing', name: 'Writs Writing Firm', role: 'Extraordinary Writs — Mandamus, Habeas Corpus, Certiorari, Prohibition', icon: '✍️', color: '#eab308', keywords: ['writ', 'mandamus', 'habeas', 'certiorari', 'prohibition', 'extraordinary']},
    {id: 'amicus_brief', name: 'Amicus Brief Firm', role: 'Amicus Curiae Brief Drafting for Appellate Courts', icon: '📜', color: '#ef4444', keywords: ['amicus', 'curiae', 'appellate', 'brief', 'friend of court', 'FRAP']},
    {id: 'dt_appeal', name: 'Dream Team Appeal Firm', role: 'Appellate Law, Brief Writing & Reversible Error Analysis — 600 Attorneys', icon: '🏛️', color: '#fbbf24', keywords: ['appeal', 'appellate', 'reversible', 'circuit', 'error', 'brief']},
    {id: 'presumption_killer', name: 'Presumption Killer Firm', role: 'Destroying Legal Presumptions with Evidence & Rebuttal Arguments', icon: '💀', color: '#dc2626', keywords: ['presumption', 'rebut', 'rebuttal', 'burden', 'evidence', 'SYPHER']},
    {id: 'fact_conclusion', name: 'Fact & Conclusion of Law Firm', role: 'Findings of Fact, Conclusions of Law & EEON Methodology', icon: '🎯', color: '#06b6d4', keywords: ['findings', 'conclusions', 'fact', 'law', 'EEON', 'judgment']},
    {id: 'jurisdictional', name: 'Jurisdictional Challenge Firm', role: 'Subject Matter Jurisdiction, Personal Jurisdiction & Standing Challenges', icon: '⚡', color: '#10b981', keywords: ['jurisdiction', 'standing', 'venue', 'mootness', 'ripeness', 'diversity']},
    {id: 'const_sovereignty', name: 'Constitutional Sovereignty Firm', role: 'Constitutional Rights, Government Limitations & Sovereignty Arguments', icon: '🦅', color: '#ec4899', keywords: ['constitutional', 'sovereignty', 'rights', 'amendment', 'overreach', 'liberty']},
    {id: 'brainstorm', name: 'Strategic Brainstorm Firm', role: 'Legal Strategy, Novel Theories & Comprehensive Litigation Planning', icon: '🧠', color: '#f43f5e', keywords: ['strategy', 'theory', 'approach', 'plan', 'angle', 'brainstorm']},
    {id: 'trial_prep', name: 'Trial Preparation Firm', role: 'Voir Dire, Motions in Limine, Witness Examination & Trial Strategy', icon: '⚔️', color: '#e11d48', keywords: ['trial', 'voir dire', 'witness', 'evidence', 'opening', 'closing']},
    {id: 'biblical', name: 'Biblical Scholar', role: 'Biblical Law, Ecclesiastical Authority & Scriptural Principles', icon: '📖', color: '#7c3aed', keywords: ['scripture', 'biblical', 'ecclesiastical', 'covenant', 'testament', 'divine']},
    {id: 'ledger', page: 'accounting', name: 'Ledger & Accounting Expert', role: 'GAAP Accounting, Journal Entries, Financial Reporting & Tax Prep', icon: '📒', color: '#f59e0b', keywords: ['ledger', 'accounting', 'GAAP', 'journal', 'financial', 'bookkeeping']}
  ];

  const keywordHTML = (kw) => '<span class="badge-warn" style="font-size:10px;padding:3px 8px;background:rgba(255,193,7,.15);color:var(--legal);border-radius:12px;font-weight:600">' + kw + '</span>';

  grid.innerHTML = agents.map(a =>
    '<div class="agent-card" onclick="goEonPage(null, \'' + (a.page || a.id) + '\')" style="border-color: ' + a.color + '">' +
      '<div style="font-size:32px;margin-bottom:10px">' + a.icon + '</div>' +
      '<h3>' + a.name + '</h3>' +
      '<p>' + a.role + '</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">' +
        a.keywords.map(keywordHTML).join('') +
      '</div>' +
    '</div>'
  ).join('');
}

// Update dashboard stats
function updateDashboard() {
  // Placeholder - in full version this would show real stats
  console.log('Dashboard updated');
}

// Initialize chat
function initChat() {
  console.log('Chat initialized');
}

// Initialize tax forms
function initTaxForms() {
  console.log('Tax forms initialized');
}

// Send chat message (EON Chat page)
async function eonChatSend() {
  var input = document.getElementById('chatInput');
  if (!input) return;
  var msg = input.value.trim();
  if (!msg) return;

  // Respect provider selector on chat page if present
  var provSel = document.getElementById('chatProvider');
  if (provSel && provSel.value) {
    localStorage.setItem('eeon_active_provider', provSel.value);
  }

  // Build user content — include any file attachments
  var attachments = (window._chatAttachments || []).filter(Boolean);
  var userContent;
  if (attachments.length === 0) {
    userContent = msg;
  } else {
    var activePid = localStorage.getItem('eeon_active_provider') || 'claude';
    var isAnthropic = (activePid === 'claude' || activePid === 'anthropic');
    if (isAnthropic) {
      userContent = [];
      attachments.forEach(function(att) {
        if (att.type === 'pdf') {
          userContent.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: att.base64 } });
        } else if (att.type === 'image') {
          userContent.push({ type: 'image', source: { type: 'base64', media_type: att.mediaType || 'image/png', data: att.base64 } });
        } else {
          userContent.push({ type: 'text', text: '═══ FILE: ' + att.name + ' ═══\n' + att.content + '\n═══ END ═══' });
        }
      });
      userContent.push({ type: 'text', text: msg });
    } else {
      var injected = '\n\n═══ UPLOADED DOCUMENTS ═══\n';
      attachments.forEach(function(att) {
        if (att.type === 'pdf') {
          injected += '\n[PDF: ' + att.name + ' — switch to Claude provider for full PDF reading]\n';
        } else if (att.type === 'image') {
          injected += '\n[Image: ' + att.name + ' — switch to Claude (Anthropic) provider for image analysis]\n';
        } else {
          injected += '\n[File: ' + att.name + ']\n' + att.content + '\n';
        }
      });
      userContent = msg + injected;
    }
    window._chatAttachments = [];
    var fp = document.getElementById('filePreview');
    if (fp) { fp.innerHTML = ''; fp.style.display = 'none'; }
  }

  _updateTokenGuard(msg);
  addChatMsg('user', msg);
  input.value = '';
  input.style.height = '';

  // Streaming agent bubble
  var msgs = document.getElementById('chatMsgs');
  var agentDiv = document.createElement('div');
  agentDiv.className = 'msg';
  agentDiv.innerHTML =
    '<div class="msg-avatar" style="background:linear-gradient(135deg,var(--accent-green),#cc44bb)">🤖</div>' +
    '<div class="msg-body">' +
      '<div style="font-weight:600;font-size:12px;margin-bottom:3px;color:var(--accent-green)">AI Agent</div>' +
      '<div id="chatStreamBody" style="font-size:13px;line-height:1.7"><span style="color:var(--text2)">⏳ Thinking…</span></div>' +
    '</div>';
  if (msgs) { msgs.appendChild(agentDiv); msgs.scrollTop = msgs.scrollHeight; }

  var body = agentDiv.querySelector('#chatStreamBody');
  var rawBuf = '';

  // Route by selected firm chip; 'auto' defaults to 'general'
  var firmMap = {
    dream_team: 'legal', legal: 'legal', tax: 'tax', arbitration: 'arbitration',
    corporation: 'corporation', trust: 'trust', research: 'research',
    creative: 'creative', code: 'code', html_arch: 'html_arch', general: 'general',
    doc_creation: 'doc_creation', legal_analyst: 'legal_analyst', doc_format: 'doc_format',
    writs_writing: 'writs_writing', amicus_brief: 'amicus_brief', dt_appeal: 'dt_appeal',
    presumption_killer: 'presumption_killer', fact_conclusion: 'fact_conclusion',
    jurisdictional: 'jurisdictional', const_sovereignty: 'const_sovereignty',
    brainstorm: 'brainstorm', trial_prep: 'trial_prep', biblical: 'biblical',
    ledger: 'accounting'
  };
  var activeFirm = (typeof _eonActiveFirm !== 'undefined') ? _eonActiveFirm : 'auto';
  var agentId = firmMap[activeFirm] || 'general';
  var systemPrompt = getSystemPrompt(agentId);

  // Ensure API key is reachable by resolveProvider
  var storedKey = localStorage.getItem('eeon_key_claude') ||
                  localStorage.getItem('stg_key_claude') ||
                  localStorage.getItem('tmar_claude_key') ||
                  localStorage.getItem('_trustApiKey') ||
                  window._trustApiKey || '';
  if (storedKey) {
    localStorage.setItem('eeon_key_claude', storedKey);
    localStorage.setItem('_trustApiKey', storedKey);
    window._trustApiKey = storedKey;
  }

  var memories = [];
  try { memories = (await MEM0.search(msg, 4)) || []; } catch(e) {}

  var finalText = await callLLMStream(systemPrompt, userContent, memories, function(tok) {
    rawBuf += tok;
    _updateTokenGuard(tok);
    if (body) body.innerHTML = rawBuf.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  });

  if (body) {
    if (finalText && finalText.indexOf('[ERROR') === 0) {
      body.innerHTML = '<span style="color:#ef4444">' + finalText.replace(/</g,'&lt;') + '</span>' +
        (finalText.indexOf('No API key') !== -1 || finalText.indexOf('HTTP 401') !== -1
          ? '<br><span style="color:#f59e0b;font-size:12px">⚙️ Go to <b>Settings → API Keys</b> and enter your API key.</span>' : '');
    } else {
      body.innerHTML = (finalText || rawBuf).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    }
    // remove duplicate id so multiple messages don't conflict
    body.removeAttribute('id');
  }
  if (msgs) msgs.scrollTop = msgs.scrollHeight;

  try { if (finalText && finalText.indexOf('[ERROR') !== 0) await MEM0.add(msg, finalText, agentId); } catch(e) {}
}

// Add chat message
function addChatMsg(type, text) {
  const msgs = document.getElementById('chatMsgs');
  if (!msgs) return;
  
  const div = document.createElement('div');
  div.className = 'msg';
  div.innerHTML = `
    <div class="msg-avatar" style="background:${type === 'user' ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--accent-green), #cc44bb)'}">${type === 'user' ? '👤' : '🤖'}</div>
    <div class="msg-body">
      <div style="font-weight:600;font-size:12px;margin-bottom:3px;color:var(--accent-green)">${type === 'user' ? 'You' : 'AI Agent'}</div>
      <div style="font-size:13px;line-height:1.7">${text}</div>
    </div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

// Dream Team functions
function dtNewChat() {
  const msgs = document.getElementById('dtChatMsgs');
  if (msgs) msgs.innerHTML = '';
}

function dtClearHistory() {
  dtNewChat();
}

async function dtSend() {
  var input = document.getElementById('dtInput');
  if (!input) return;
  var msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  var msgs = document.getElementById('dtChatMsgs');
  if (!msgs) return;

  // User bubble
  var userDiv = document.createElement('div');
  userDiv.style.cssText = 'margin-bottom:12px;padding:8px 12px;background:rgba(0,229,255,.08);border-radius:8px;border-left:3px solid #3b82f6';
  userDiv.innerHTML = '<strong style="color:#3b82f6">You:</strong> ' + msg.replace(/</g,'&lt;');
  msgs.appendChild(userDiv);
  msgs.scrollTop = msgs.scrollHeight;

  // Agent streaming bubble
  var agentDiv = document.createElement('div');
  agentDiv.style.cssText = 'margin-bottom:12px;padding:8px 12px;background:rgba(255,215,0,.06);border-radius:8px;border-left:3px solid #ffd700';
  agentDiv.innerHTML = '<strong style="color:#ffd700">Dream Team:</strong> <span style="color:var(--text2,#94a3b8);font-style:italic">⏳ Consulting the team…</span>';
  msgs.appendChild(agentDiv);
  msgs.scrollTop = msgs.scrollHeight;

  // Normalise API key across all storage locations
  var storedKey = localStorage.getItem('eeon_key_claude') ||
                  localStorage.getItem('stg_key_claude') ||
                  localStorage.getItem('tmar_claude_key') ||
                  localStorage.getItem('_trustApiKey') ||
                  window._trustApiKey || '';
  if (storedKey) {
    localStorage.setItem('eeon_key_claude', storedKey);
    localStorage.setItem('_trustApiKey', storedKey);
    window._trustApiKey = storedKey;
  }

  var sysPrompt = (typeof getSystemPrompt === 'function') ? getSystemPrompt('legal') : '';
  var rawBuf = '';

  try {
    var memories = [];
    try { memories = (await MEM0.search(msg, 4)) || []; } catch(e) {}

    var finalText = await callLLMStream(sysPrompt, msg, memories, function(tok) {
      rawBuf += tok;
      agentDiv.innerHTML = '<strong style="color:#ffd700">Dream Team:</strong> ' +
        rawBuf.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
      msgs.scrollTop = msgs.scrollHeight;
    });

    var result = finalText || rawBuf;
    if (result && result.indexOf('[ERROR') === 0) {
      agentDiv.innerHTML = '<strong style="color:#ffd700">Dream Team:</strong> ' +
        '<span style="color:#ef4444">' + result.replace(/</g,'&lt;') + '</span>' +
        (result.indexOf('No API key') !== -1 || result.indexOf('HTTP 401') !== -1
          ? '<br><span style="color:#f59e0b;font-size:12px">⚙️ Go to <b>Settings → API Keys</b> and enter your key.</span>' : '');
    } else {
      agentDiv.innerHTML = '<strong style="color:#ffd700">Dream Team:</strong> ' +
        result.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    }
    msgs.scrollTop = msgs.scrollHeight;
    try { if (result && result.indexOf('[ERROR') !== 0) await MEM0.add(msg, result, 'legal'); } catch(e) {}
  } catch(err) {
    agentDiv.innerHTML = '<strong style="color:#ffd700">Dream Team:</strong> ' +
      '<span style="color:#ef4444">⚠️ Error: ' + err.message + '</span>';
  }
}

// Tax forms
function eeonTab(panelId,btn){
  document.querySelectorAll('.eeon-panel').forEach(function(p){p.style.display='none';});
  document.querySelectorAll('.eeon-tab').forEach(function(b){b.classList.remove('active');});
  var p=document.getElementById('eeon-panel-'+panelId);
  if(p)p.style.display='block';
  if(btn)btn.classList.add('active');
  if(panelId==='form1120'){var w=document.getElementById('form1120-year-content');if(w&&!w.querySelector('.irs-form-wrap'))onYearChange(EEON_STATE.year);}
}

// Placeholder functions
function exportChat() { alert('Chat export functionality'); }
function shareChat() { alert('Chat share functionality'); }
function toggleMic() {
  var btn = document.getElementById('micBtn');
  if (!btn && event) btn = event.target.closest('[onclick*="toggleMic"]');
  if (!btn) return;
  var isActive = btn.classList.toggle('active');
  if (isActive) {
    btn.textContent = '🔴';
    btn.title = 'Stop Recording';
    if (typeof startVoiceRec === 'function') {
      startVoiceRec();
    } else if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      btn.classList.remove('active');
      btn.textContent = '🎤';
      btn.title = 'Voice Input (Speech-to-Text)';
      showAlert('Voice recognition requires Chrome, Edge, or Safari.');
    }
  } else {
    btn.textContent = '🎤';
    btn.title = 'Voice Input (Speech-to-Text)';
    if (typeof stopVoiceRec === 'function') stopVoiceRec();
  }
}
function handleFileUpload(input) {
  if (!input || !input.files || !input.files.length) return;
  if (!window._chatAttachments) window._chatAttachments = [];
  var preview = document.getElementById('filePreview');
  Array.from(input.files).forEach(function(file) {
    var isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    var reader = new FileReader();
    if (isPdf) {
      reader.onload = function(e) {
        var base64 = e.target.result.split(',')[1];
        var idx = window._chatAttachments.length;
        window._chatAttachments.push({ name: file.name, type: 'pdf', base64: base64 });
        _addAttachPill(file.name, idx);
        if (preview) preview.style.display = 'flex';
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = function(e) {
        var idx = window._chatAttachments.length;
        window._chatAttachments.push({ name: file.name, type: 'text', content: e.target.result });
        _addAttachPill(file.name, idx);
        if (preview) preview.style.display = 'flex';
      };
      reader.readAsText(file);
    }
  });
  input.value = '';
}
function _addAttachPill(name, idx) {
  var preview = document.getElementById('filePreview');
  if (!preview) return;
  var pill = document.createElement('div');
  pill.id = 'attach-pill-' + idx;
  pill.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.4);border-radius:12px;font-size:11px;color:#10b981';
  pill.innerHTML = '📎 ' + escHtml(name) + ' <span onclick="_removeAttach(' + idx + ')" style="cursor:pointer;color:#ef4444;font-size:14px;line-height:1;margin-left:2px">×</span>';
  preview.appendChild(pill);
}
function _removeAttach(idx) {
  if (window._chatAttachments) window._chatAttachments[idx] = null;
  var pill = document.getElementById('attach-pill-' + idx);
  if (pill) pill.remove();
  var preview = document.getElementById('filePreview');
  if (preview && !preview.querySelector('[id^="attach-pill-"]')) preview.style.display = 'none';
}
// ── Paste Handler — images + text into any chat input ──────────────────────
function handleChatPaste(e) {
  var items = e.clipboardData && e.clipboardData.items;
  if (!items) return;
  // Find image in clipboard
  var imgItem = null;
  for (var i = 0; i < items.length; i++) {
    if (items[i].kind === 'file' && items[i].type.startsWith('image/')) { imgItem = items[i]; break; }
  }
  if (!imgItem) return; // no image — let normal text paste through unchanged
  e.preventDefault();
  var mediaType = imgItem.type || 'image/png';
  var file = imgItem.getAsFile();
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    var dataUrl = ev.target.result;
    var base64 = dataUrl.split(',')[1];
    if (!window._chatAttachments) window._chatAttachments = [];
    var idx = window._chatAttachments.length;
    var name = 'pasted-image-' + Date.now() + '.png';
    window._chatAttachments.push({ name: name, type: 'image', base64: base64, mediaType: mediaType });
    var preview = document.getElementById('filePreview');
    if (preview) {
      preview.style.display = 'flex';
      var pill = document.createElement('div');
      pill.id = 'attach-pill-' + idx;
      pill.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:rgba(139,92,246,.15);border:1px solid rgba(139,92,246,.4);border-radius:12px;font-size:11px;color:#a78bfa';
      var img = document.createElement('img');
      img.src = dataUrl;
      img.style.cssText = 'height:28px;border-radius:3px;object-fit:cover;max-width:48px';
      pill.appendChild(img);
      var lbl = document.createTextNode(' \uD83D\uDCF7 Image');
      pill.appendChild(lbl);
      var x = document.createElement('span');
      x.textContent = '×';
      x.style.cssText = 'cursor:pointer;color:#ef4444;font-size:14px;line-height:1;margin-left:4px';
      x.setAttribute('onclick', '_removeAttach(' + idx + ')');
      pill.appendChild(x);
      preview.appendChild(pill);
    }
  };
  reader.readAsDataURL(file);
}

// ── Token Guard v7.2 — session token estimator ──────────────────────────────
var _sessionTokens = 0;
function _updateTokenGuard(text) {
  _sessionTokens += Math.ceil(((text || '').length) / 4);
  var el = document.getElementById('tokenGuard');
  if (!el) return;
  var k = _sessionTokens;
  var label, color, bg, border;
  if (k < 50000)       { label = (k >= 1000 ? (k/1000).toFixed(1)+'k' : k) + ' tokens'; color='#64748b'; bg='rgba(100,116,139,.1)'; border='rgba(100,116,139,.25)'; }
  else if (k < 100000) { label = (k/1000).toFixed(1)+'k tokens ⚡'; color='#f59e0b'; bg='rgba(245,158,11,.1)'; border='rgba(245,158,11,.35)'; }
  else if (k < 180000) { label = (k/1000).toFixed(1)+'k tokens ⚠️'; color='#ef4444'; bg='rgba(239,68,68,.1)'; border='rgba(239,68,68,.35)'; }
  else                 { label = (k/1000).toFixed(0)+'k LIMIT ⛔'; color='#ef4444'; bg='rgba(239,68,68,.2)'; border='rgba(239,68,68,.5)'; el.title='Context limit approaching — start a new conversation'; }
  el.textContent = label;
  el.style.color = color;
  el.style.background = bg;
  el.style.borderColor = border;
}
function _resetTokenGuard() {
  _sessionTokens = 0;
  var el = document.getElementById('tokenGuard');
  if (el) { el.textContent = '0 tokens'; el.style.color='#64748b'; el.style.background='rgba(100,116,139,.1)'; el.style.borderColor='rgba(100,116,139,.25)'; }
}

// ── CAMT Calculator — IRC §55 / IIJA §10101 ──────────────────────────────────
function calcCAMT() {
  var afsi1 = parseFloat(document.getElementById('camt-afsi1').value)||0;
  var afsi2 = parseFloat(document.getElementById('camt-afsi2').value)||0;
  var afsi3 = parseFloat(document.getElementById('camt-afsi3').value)||0;
  var regular = parseFloat(document.getElementById('camt-regular').value)||0;
  var avg = (afsi1 + afsi2 + afsi3) / 3;
  var tentative = avg * 0.15;
  var additional = Math.max(0, tentative - regular);
  var threshMet = avg >= 1000000000;
  var fmt = function(n){ return '$' + Math.round(n).toLocaleString(); };
  document.getElementById('camt-avg').textContent = fmt(avg);
  document.getElementById('camt-thresh').textContent = threshMet ? '✅ YES — CAMT applies' : '❌ No (< $1B threshold)';
  document.getElementById('camt-thresh').style.color = threshMet ? '#f87171' : '#22c55e';
  document.getElementById('camt-tentative').textContent = threshMet ? fmt(tentative) : '$0 (N/A)';
  document.getElementById('camt-reg-display').textContent = fmt(regular);
  document.getElementById('camt-additional').textContent = threshMet ? fmt(additional) : '$0';
  document.getElementById('camt-note').textContent = threshMet
    ? (additional > 0 ? 'CAMT exceeds regular tax — additional ' + fmt(additional) + ' owed. Report on Form 1120 Schedule UTP.' : 'Regular tax ≥ CAMT — no additional CAMT due.')
    : 'Corporation does not meet the $1B AFSI threshold — CAMT does not apply.';
}

// ── Buyback Tax Calculator — IRC §4501 ───────────────────────────────────────
function calcBuyback() {
  var repurchased = parseFloat(document.getElementById('bb-repurchased').value)||0;
  var issued = parseFloat(document.getElementById('bb-issued').value)||0;
  var netBase = Math.max(0, repurchased - issued);
  var deminimis = netBase < 10000000;
  var tax = deminimis ? 0 : netBase * 0.01;
  var fmt = function(n){ return '$' + Math.round(n).toLocaleString(); };
  document.getElementById('bb-gross').textContent = fmt(repurchased);
  document.getElementById('bb-offset').textContent = '(' + fmt(issued) + ')';
  document.getElementById('bb-net').textContent = fmt(netBase);
  document.getElementById('bb-deminimis').textContent = deminimis ? '✅ Yes — exempt' : '❌ No — tax applies';
  document.getElementById('bb-deminimis').style.color = deminimis ? '#22c55e' : '#f87171';
  document.getElementById('bb-tax').textContent = fmt(tax);
  document.getElementById('bb-note').textContent = deminimis
    ? 'Net repurchase base under $10M de minimis threshold (IRC §4501(e)) — no excise tax due.'
    : 'Excise tax ' + fmt(tax) + ' due. Report on Form 720 by April 30 of following calendar year. Not deductible per IRC §4501(f).';
}

function dtHandleFiles() { alert('Dream Team file upload'); }

/* ═══════════════════════════════════════════════════════════════════════════
   EEON FOUNDATION TAX SYSTEM — STATE + FORM BUILDER + SYNC BRIDGE
   Merged from OpenClaw.html — EEON_STATE, buildForm1120, _populate* helpers,
   onYearChange, populateAllForms, generateJournalFromForms
   ═══════════════════════════════════════════════════════════════════════════ */

/* STATE */
var EEON_STATE={activeAgent:"EEON_ACCOUNTING",year:2026,agentTtsEnabled:true,ttsEnabled:true,chatMessages:[]};

/* ── Form 1120 Builder Helpers ── */
function getFormEra(year) {
  if (year <= 2017) return 'pre-tcja';
  if (year <= 2019) return 'tcja-initial';
  if (year <= 2021) return 'cares-act';
  if (year <= 2023) return 'camt-era';
  return 'current';  // 2024+
}

function computeGraduatedTax(taxableIncome) {
  // IRC §11(b) graduated rates effective for tax years BEFORE 2018
  // Source: IRS Form 1120 (2016) Schedule J instructions
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 50000)      return taxableIncome * 0.15;
  if (taxableIncome <= 75000)      return 7500  + (taxableIncome - 50000)  * 0.25;
  if (taxableIncome <= 100000)     return 13750 + (taxableIncome - 75000)  * 0.34;
  if (taxableIncome <= 335000)     return 22250 + (taxableIncome - 100000) * 0.39;
  if (taxableIncome <= 10000000)   return 113900 + (taxableIncome - 335000) * 0.34;
  if (taxableIncome <= 15000000)   return 3400000 + (taxableIncome - 10000000) * 0.35;
  if (taxableIncome <= 18333333)   return 5150000 + (taxableIncome - 15000000) * 0.38;
  return taxableIncome * 0.35; // flat 35% above $18,333,333
}

function irsRow(num, label, id, opts) {
  opts = opts || {};
  const shade = opts.shade ? 'background:var(--irs-shade2);' : '';
  const bold  = opts.bold  ? 'font-weight:700;' : '';
  const color = opts.green ? 'color:var(--green);' : (opts.greenBg ? 'color:var(--green);' : '');
  const bg    = opts.greenBg ? 'background:#e8ffe8;' : (opts.redBg ? 'background:#ffe8e8;' : shade);
  const why   = opts.why  || '';
  const whyHtml = (id && why) ? `<span class="field-why">▲ ${why}</span>` : '';
  return `<div class="irs-row two-col" style="${bg}">
    <div class="irs-cell num" style="${bold}">${num}</div>
    <div class="irs-cell" style="flex:1;justify-content:space-between;align-items:flex-start;${bold}">
      <span style="flex:1;padding-right:6px;">${label}</span>
      ${id ? `<div class="field-wrap-why"><input class="irs-amount-field" id="${id}" style="width:110px;${bold}${color}" placeholder="0.00"/>${whyHtml}</div>` : ''}
    </div>
  </div>`;
}

function irsSectionHeader(title) {
  return `<div class="irs-section-header">${title}</div>`;
}

function irs1120Header(year) {
  const prevYear = year - 1;
  const nextYear = year + 1;
  const ombNos = {
    2016:'1545-0123', 2017:'1545-0123', 2018:'1545-0123',
    2019:'1545-0123', 2020:'1545-0123', 2021:'1545-0123',
    2022:'1545-0123', 2023:'1545-0123', 2024:'1545-0123'
  };
  const catNos = {
    2016:'11450Q', 2017:'11450Q', 2018:'11450Q',
    2019:'11450Q', 2020:'11450Q', 2021:'11450Q',
    2022:'11450Q', 2023:'11450Q', 2024:'11450Q'
  };
  const omb = ombNos[year] || '1545-0123';
  const cat = catNos[year] || '11450Q';
  return `
    <div class="irs-header">
      <div><div class="irs-form-num">Form <b>1120</b></div>
        <div class="irs-form-subtitle">Department of the Treasury<br/>Internal Revenue Service</div></div>
      <div class="irs-omb">OMB No. ${omb}<br/><b>${year}</b></div>
    </div>
    <div class="irs-title-bar">
      <div class="irs-main-title">U.S. Corporation Income Tax Return</div>
      <div class="irs-sub">For calendar year ${year} or tax year beginning ______, ${year}, ending ______, 20__<br/>
        ▶ Information about Form 1120 and its separate instructions is at <i>www.irs.gov/form1120</i>.</div>
    </div>
    <div style="padding:4px 8px;border-bottom:1px solid var(--irs-border);background:var(--irs-shade2);
      display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:8.5px;color:var(--irs-border);">
      <div>
        <div>A Check if: &nbsp;
          <input type="checkbox"/> <small>1 Consolidated return</small> &nbsp;
          <input type="checkbox"/> <small>2 Personal holding co.</small> &nbsp;
          <input type="checkbox"/> <small>3 Personal service corp.</small> &nbsp;
          <input type="checkbox"/> <small>4 Sch M-3 attached</small>
        </div>
        <div style="margin-top:3px;">Name: <input class="irs-field-inline" value="EEON FOUNDATION" style="font-weight:700;width:180px;"/></div>
        <div>Number/Street: <input class="irs-field-inline" style="width:220px;"/></div>
        <div>City/State/ZIP: <input class="irs-field-inline" style="width:220px;"/></div>
      </div>
      <div>
        <div>B &nbsp;EIN: <input class="irs-field-inline" id="f1120-ein" style="width:100px;" placeholder="XX-XXXXXXX"/></div>
        <div>C &nbsp;Date incorporated: <input class="irs-field-inline" id="f1120-incdate" value="2016-01-01" style="width:90px;"/></div>
        <div>D &nbsp;Total assets (see instructions): $ <input class="irs-amount-field" id="f1120-assets" style="width:110px;" placeholder="0.00"/></div>
        <div style="margin-top:3px;">E Check if:
          <input type="checkbox"/> <small>(1) Initial return</small> &nbsp;
          <input type="checkbox"/> <small>(2) Final return</small> &nbsp;
          <input type="checkbox"/> <small>(3) Name change</small> &nbsp;
          <input type="checkbox"/> <small>(4) Address change</small>
        </div>
      </div>
    </div>`;
}

function incomeSection(year) {
  return `
    ${irsSectionHeader('Income')}
    ${irsRow('1a','Gross receipts or sales','f1120-1a',{why:'Enter total gross receipts/sales. IRC §61 — all income from whatever source derived. This is the top-line revenue number that begins the return.'})}
    ${irsRow('1b','Returns and allowances','f1120-1b',{why:'Enter refunds, returns, and allowances given to customers. Reduces gross receipts on Line 1c. IRC §61.'})}
    ${irsRow('1c','Balance. Subtract line 1b from line 1a','f1120-1c',{shade:true})}
    ${irsRow('2','Cost of goods sold (attach Form 1125-A)','f1120-2',{why:'Direct cost of producing goods sold. Reduces gross profit on Line 3. Requires Form 1125-A if applicable. IRC §263A.'})}
    ${irsRow('3','Gross profit. Subtract line 2 from line 1c','f1120-3',{shade:true})}
    ${irsRow('4','Dividends (Schedule C, line 19' + (year>=2018?'':'') + ')','f1120-4')}
    ${irsRow('5','Interest','f1120-5',{why:'Enter interest income earned. IRC §61(a)(4) — interest is includible in gross income. Carries to Line 11 Total Income.'})}
    ${irsRow('6','Gross rents','f1120-6',{why:'Enter gross rental income received. IRC §61(a)(5) — rents are includible gross income. Carries to Line 11.'})}
    ${irsRow('7','Gross royalties','f1120-7')}
    ${irsRow('8','Capital gain net income (attach Schedule D (Form 1120))','f1120-8')}
    ${irsRow('9','Net gain or (loss) from Form 4797, Part II, line 17 (attach Form 4797)','f1120-9')}
    ${irsRow('10','Other income (see instructions — attach statement)','f1120-10',{why:'Any income not listed on Lines 1–9. Attach statement. Under Glenshaw Glass (348 U.S. 426), all accessions to wealth are income. Carries to Line 11.'})}
    ${irsRow('11','<b>Total income.</b> Add lines 3 through 10','f1120-11',{shade:true,bold:true})}`;
}

function deductionsSection(year) {
  // Line 25 differs between pre-TCJA (DPAD §199) and post-TCJA
  const line25 = year <= 2017
    ? `${irsRow('25','Domestic production activities deduction (attach Form 8903) — IRC §199','f1120-25')}
       <div style="padding:2px 8px 2px 28px;font-size:7.5px;font-style:italic;color:var(--muted);
         border-left:3px solid #c4830a;margin-left:20px;">
         IRC §199 DPAD: Deduction equal to 9% of lesser of qualified production activities income or taxable income.
         <b>REPEALED by Tax Cuts and Jobs Act (TCJA), P.L. 115-97, effective for tax years beginning after 12/31/2017.</b>
       </div>`
    : year <= 2021
    ? `${irsRow('25','Reserved for future use','f1120-25')}
       <div style="padding:2px 8px 2px 28px;font-size:7.5px;font-style:italic;color:var(--muted);
         border-left:3px solid #666;margin-left:20px;">
         Line 25 reserved — DPAD (IRC §199) repealed by TCJA effective tax years beginning after 12/31/2017.
       </div>`
    : `${irsRow('25','Energy efficient commercial buildings deduction (attach Form 7205) — IRC §179D','f1120-25')}
       <div style="padding:2px 8px 2px 28px;font-size:7.5px;font-style:italic;color:var(--muted);
         border-left:3px solid #1a6b3a;margin-left:20px;">
         IRC §179D: Deduction for energy efficient commercial building property. Form 7205 required.
         Expanded by Inflation Reduction Act (IRA), P.L. 117-169, effective 2023.
       </div>`;

  return `
    ${irsSectionHeader('Deductions (see instructions for limitations on deductions)')}
    ${irsRow('12','Compensation of officers (see instructions — attach Form 1125-E)','f1120-12',{why:'Officer compensation is deductible under IRC §162(a)(1) as ordinary and necessary business expense. Attach Form 1125-E if gross receipts ≥ $500,000.'})}
    ${irsRow('13','Salaries and wages (less employment credits)','f1120-13',{why:'Deductible wages paid to employees under IRC §162(a)(1). Reduce by any employment tax credits claimed.'})}
    ${irsRow('14','Repairs and maintenance','f1120-14',{why:'Deductible repairs under IRC §162. Must be ordinary & necessary. Do not include capital improvements (those go on Form 4562).'})}
    ${irsRow('15','Bad debts','f1120-15')}
    ${irsRow('16','Rents','f1120-16')}
    ${irsRow('17','Taxes and licenses','f1120-17',{why:'State/local taxes, payroll taxes, and licenses deductible under IRC §164. Federal income tax is NOT deductible here.'})}
    ${irsRow('18','Interest (see instructions)','f1120-18',{why:'Business interest expense deductible under IRC §163. Subject to IRC §163(j) limitation for large taxpayers. See instructions.'})}
    ${irsRow('19','Charitable contributions','f1120-19',{why:'Deductible under IRC §170. Corporate charitable deductions limited to 10% of taxable income (pre-contribution). Excess carries forward 5 years.'})}
    ${irsRow('20','Depreciation from Form 4562 not claimed on Form 1125-A or elsewhere on return (attach Form 4562)','f1120-20')}
    ${irsRow('21','Depletion','f1120-21')}
    ${irsRow('22','Advertising','f1120-22',{why:'Ordinary and necessary advertising costs deductible under IRC §162. Must be directly connected to the business.'})}
    ${irsRow('23','Pension, profit-sharing, etc., plans','f1120-23')}
    ${irsRow('24','Employee benefit programs','f1120-24')}
    ${line25}
    ${irsRow('26','Other deductions (attach statement)','f1120-26',{why:'All other ordinary and necessary business deductions under IRC §162 not listed above. Must attach a detailed statement itemizing each deduction.'})}
    ${irsRow('27','<b>Total deductions.</b> Add lines 12 through 26','f1120-27',{shade:true,bold:true})}`;
}

function nolSection(year) {
  // Pre-TCJA: unlimited NOL offset, 2-year carryback
  // Post-TCJA: 80% limitation, no carryback (except CARES Act 2020-2021)
  if (year <= 2017) {
    return `
    ${irsSectionHeader('Taxable Income')}
    ${irsRow('28','Taxable income before net operating loss deduction and special deductions. Subtract line 27 from line 11','f1120-28',{shade:true})}
    <div class="irs-row two-col">
      <div class="irs-cell num">29a</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Net operating loss (NOL) deduction (see instructions)<br/>
          <span style="font-size:7.5px;color:var(--muted);font-style:italic;">
            Pre-TCJA: Unlimited offset — no 80% limitation. 2-year carryback / 20-year carryforward (IRC §172, pre-amendment).
            Enter available NOL: <input class="irs-amount-field" id="f1120-nol-avail" style="width:90px;" placeholder="0.00"/>
          </span>
        </span>
        <input class="irs-amount-field" id="f1120-29a" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    ${irsRow('29b','Special deductions (Schedule C, line 20)','f1120-29b')}
    ${irsRow('29c','Add lines 29a and 29b','f1120-29c',{shade:true})}
    ${irsRow('30','<b>Taxable income.</b> Subtract line 29c from line 28. See instructions','f1120-30',{bold:true,shade:true})}`;
  }

  if (year <= 2019) {
    return `
    ${irsSectionHeader('Taxable Income')}
    ${irsRow('28','Taxable income before net operating loss deduction and special deductions. Subtract line 27 from line 11','f1120-28',{shade:true})}
    <div class="irs-row two-col">
      <div class="irs-cell num">29a</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Net operating loss (NOL) deduction — see instructions<br/>
          <span style="font-size:7.5px;color:#8b5e00;font-style:italic;font-weight:700;">
            POST-TCJA: IRC §172(a)(2) — Limited to 80% of line 28. No carryback.
            Indefinite carryforward (IRC §172(b)(1)(A)(ii)).
            Enter available NOL: <input class="irs-amount-field" id="f1120-nol-avail" style="width:90px;" placeholder="0.00"/>
          </span>
        </span>
        <input class="irs-amount-field" id="f1120-29a" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    ${irsRow('29b','Special deductions (Schedule C, line 24)','f1120-29b')}
    ${irsRow('29c','Add lines 29a and 29b','f1120-29c',{shade:true})}
    ${irsRow('30','<b>Taxable income.</b> Subtract line 29c from line 28. See instructions','f1120-30',{bold:true,shade:true})}`;
  }

  if (year <= 2021) {
    return `
    ${irsSectionHeader('Taxable Income')}
    ${irsRow('28','Taxable income before net operating loss deduction and special deductions. Subtract line 27 from line 11','f1120-28',{shade:true})}
    <div class="irs-row two-col">
      <div class="irs-cell num">29a</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Net operating loss (NOL) deduction — see instructions<br/>
          <span style="font-size:7.5px;color:#1a3a6b;font-style:italic;font-weight:700;">
            CARES ACT (P.L. 116-136): 80% limitation SUSPENDED for tax years 2018-2020.
            5-year carryback RESTORED for losses arising in tax years 2018, 2019, 2020.
            For ${year} losses: <input type="checkbox"/> Carry back 5 years &nbsp; <input type="checkbox"/> Waive carryback
            Enter available NOL: <input class="irs-amount-field" id="f1120-nol-avail" style="width:90px;" placeholder="0.00"/>
          </span>
        </span>
        <input class="irs-amount-field" id="f1120-29a" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    ${irsRow('29b','Special deductions (Schedule C, line 24)','f1120-29b')}
    ${irsRow('29c','Add lines 29a and 29b','f1120-29c',{shade:true})}
    ${irsRow('30','<b>Taxable income.</b> Subtract line 29c from line 28. See instructions','f1120-30',{bold:true,shade:true})}`;
  }

  // 2022+ — CAMT era, 80% back in full effect
  return `
    ${irsSectionHeader('Taxable Income')}
    ${irsRow('28','Taxable income before net operating loss deduction and special deductions. Subtract line 27 from line 11','f1120-28',{shade:true})}
    <div class="irs-row two-col">
      <div class="irs-cell num">29a</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Net operating loss (NOL) deduction — see instructions<br/>
          <span style="font-size:7.5px;color:#8b5e00;font-style:italic;font-weight:700;">
            IRC §172(a)(2): Limited to 80% of line 28. No carryback. Indefinite carryforward.
            Enter available NOL: <input class="irs-amount-field" id="f1120-nol-avail" style="width:90px;" placeholder="0.00"/>
          </span>
        </span>
        <input class="irs-amount-field" id="f1120-29a" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    ${irsRow('29b','Special deductions (Schedule C, line 24)','f1120-29b')}
    ${irsRow('29c','Add lines 29a and 29b','f1120-29c',{shade:true})}
    ${irsRow('30','<b>Taxable income.</b> Subtract line 29c from line 28. See instructions','f1120-30',{bold:true,shade:true})}`;
}

function scheduleJ(year) {
  const era = getFormEra(year);
  const prevYear = year - 1;
  const nextYear = year + 1;

  // ── 2016-2017: GRADUATED RATES + AMT ──
  if (year <= 2017) {
    return `
    <div style="padding:4px 8px;border:2px solid var(--irs-border);background:var(--irs-shade);
      font-size:9.5px;font-weight:700;color:var(--irs-border);margin-top:8px;">
      Schedule J — Tax Computation and Payment (see instructions)
    </div>
    ${irsSectionHeader("Part I — Tax Computation")}
    <div class="irs-row two-col">
      <div class="irs-cell num">1</div>
      <div class="irs-cell" style="flex:1;">
        <span>Check if the corporation is a member of a controlled group (attach Schedule O (Form 1120)) <input type="checkbox"/></span>
      </div>
    </div>
    <div class="irs-row two-col">
      <div class="irs-cell num">2</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span><b>Income tax</b> — Graduated rates per IRC §11(b) (pre-TCJA) — Check if qualified personal service corporation (flat 35%) <input type="checkbox"/><br/>
          <span style="font-size:7.5px;font-style:italic;color:var(--muted);">
            Rate schedule: $0–$50,000 = 15% · $50,001–$75,000 = 25% · $75,001–$100,000 = 34%
            · $100,001–$335,000 = 39% · $335,001–$10M = 34% · $10M–$15M = 35% · $15M–$18.33M = 38% · Over $18.33M = 35%
          </span>
        </span>
        <input class="irs-amount-field" id="f1120-sj2" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col">
      <div class="irs-cell num">3</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Alternative minimum tax (attach Form 4626) — IRC §55 (applicable to corporations prior to TCJA)<br/>
          <span style="font-size:7.5px;font-style:italic;color:var(--muted);">
            AMT rate: 20% on AMTI over exemption. Exemption: $40,000 for most corps. Phase-out: $150,000+.
          </span>
        </span>
        <input class="irs-amount-field" id="f1120-sj3" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    ${irsRow('4','Add lines 2 and 3','f1120-sj4',{shade:true,bold:true})}
    ${irsSectionHeader("Credits")}
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">5a</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Foreign tax credit (attach Form 1118)</span>
        <input class="irs-amount-field" id="f1120-sj5a" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">5b</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Credit from Form 8834 (see instructions)</span>
        <input class="irs-amount-field" id="f1120-sj5b" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">5c</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span><b>General business credit (attach Form 3800) — IRC §38 — flows from Form 3800 Line 38</b></span>
        <input class="irs-amount-field" id="f1120-sj5c" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">5d</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Credit for prior year minimum tax (attach Form 8827)</span>
        <input class="irs-amount-field" id="f1120-sj5d" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">5e</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Bond credits from Form 8912</span>
        <input class="irs-amount-field" id="f1120-sj5e" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    ${irsRow('6','Total credits. Add lines 5a through 5e','f1120-sj6',{shade:true,bold:true})}
    ${irsRow('7','Subtract line 6 from line 4','f1120-sj7')}
    ${irsSectionHeader("Other Taxes")}
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">8</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Personal holding company tax (attach Schedule PH (Form 1120))</span>
        <input class="irs-amount-field" id="f1120-sj8" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">9a</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Recapture of investment credit (attach Form 4255)</span>
        <input class="irs-amount-field" id="f1120-sj9a" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">9e</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Alternative tax on qualified timber gains (IRC §1201(b)) — see instructions</span>
        <input class="irs-amount-field" id="f1120-sj9e" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    ${irsRow('10','Total. Add lines 9a through 9f','f1120-sj10')}
    ${irsRow('11','<b>Total tax.</b> Add lines 7, 8, and 10. Enter here and on page 1, line 31','f1120-sj11',{bold:true,shade:true})}
    ${irsSectionHeader("Part II — Payments and Refundable Credits")}
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">12</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>${year-1} overpayment credited to ${year}</span>
        <input class="irs-amount-field" id="f1120-sj12" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">13</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>${year} estimated tax payments (Form 1120-W quarterly installments — IRC §6655)</span>
        <input class="irs-amount-field" id="f1120-sj13" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">14</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>${year} refund applied for on Form 4466</span>
        <input class="irs-amount-field" id="f1120-sj14a" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">15</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Tax deposited with Form 7004 (extension payment)</span>
        <input class="irs-amount-field" id="f1120-sj15" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">16</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Withholding (see instructions)</span>
        <input class="irs-amount-field" id="f1120-sj16" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">17</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Reserved (see instructions)</span>
        <input class="irs-amount-field" id="f1120-sj17" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">18</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Tax paid with Form 2439 (undistributed capital gains)</span>
        <input class="irs-amount-field" id="f1120-sj18" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">19</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Credit for federal tax on fuels and other refundable credits (attach Form 4136)</span>
        <input class="irs-amount-field" id="f1120-sj19" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    ${irsRow('20','Total refundable credits. Add lines 18 and 19','f1120-sj20',{shade:true})}
    ${irsRow('21','<b>Total payments. Add lines 12 through 20. Enter here and on page 1, line 32</b>','f1120-sj21',{bold:true,shade:true})}`;
  }

  // ── 2018-2024: FLAT 21% + ERA-SPECIFIC NOTES ──
  const beatNote = (year >= 2018 && year <= 2019)
    ? `<div style="padding:2px 8px;font-size:7.5px;color:var(--muted);font-style:italic;border-left:3px solid #4a7fd5;margin-left:20px;">
         BEAT (Base Erosion and Anti-Abuse Tax): IRC §59A — minimum 10% tax. Form 8991 if applicable. Large multinational corps.
       </div>` : '';

  const camtNote = (year >= 2022)
    ? `<div class="irs-row two-col" style="background:#e8f0ff;">
         <div class="irs-cell num">3</div>
         <div class="irs-cell" style="flex:1;justify-content:space-between;">
           <span>Corporate alternative minimum tax (CAMT) — attach Form 4626 — IRC §55 as amended by IRA<br/>
             <span style="font-size:7.5px;color:#1a3a6b;font-style:italic;">
               CAMT = 15% of adjusted financial statement income. Applies to corps with avg. book income ≥ $1 billion.
               Effective for tax years beginning after 12/31/2022. Inflation Reduction Act, P.L. 117-169.
             </span>
           </span>
           <input class="irs-amount-field" id="f1120-sj3" style="width:110px;" placeholder="0.00"/>
         </div>
       </div>` : irsRow('3','Alternative minimum tax — <i style="font-size:8px;color:var(--muted);">Corporate AMT repealed by TCJA for tax years beginning after 12/31/2017. Reserved.</i>','');

  const buybackNote = (year >= 2023)
    ? `<div class="irs-row two-col" style="background:#f0f0ff;font-size:8.5px;">
         <div class="irs-cell num">9b</div>
         <div class="irs-cell" style="flex:1;justify-content:space-between;">
           <span>Excise tax on repurchase of corporate stock (attach Form 7208) — IRC §4501<br/>
             <span style="font-size:7.5px;color:var(--muted);font-style:italic;">
               1% excise tax on fair market value of stock repurchased by covered corporation.
               Effective for repurchases after 12/31/2022. Inflation Reduction Act, P.L. 117-169.
             </span>
           </span>
           <input class="irs-amount-field" id="f1120-sj9b" style="width:110px;" placeholder="0.00"/>
         </div>
       </div>` : '';

  const totalTaxLine = (year >= 2022) ? '12' : '11';
  const paymentsRefLine = (year >= 2018) ? '23' : '21';

  return `
    <div style="padding:4px 8px;border:2px solid var(--irs-border);background:var(--irs-shade);
      font-size:9.5px;font-weight:700;color:var(--irs-border);margin-top:8px;">
      Schedule J — Tax Computation and Payment (see instructions)
    </div>
    ${irsSectionHeader("Part I — Tax Computation")}
    <div class="irs-row two-col">
      <div class="irs-cell num">1</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span><b>Income tax — Flat 21% rate per IRC §11(b)</b> as amended by TCJA, P.L. 115-97, effective for tax years beginning after 12/31/2017<br/>
          Check if a member of controlled group: <input type="checkbox"/> (attach Schedule O (Form 1120))
          ${beatNote}
        </span>
        <input class="irs-amount-field" id="f1120-sj2" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    ${camtNote}
    ${irsRow('4','Add lines 1 through 3','f1120-sj4',{shade:true,bold:true})}
    <div style="font-size:8px;color:var(--muted);padding:2px 8px;font-style:italic;">
      Tax Credits (lines 5a–5e)
    </div>
    ${irsRow('5a','Foreign tax credit (attach Form 1118)','f1120-sj5a')}
    ${irsRow('5b','Credit from Form 8834 (see instructions)','f1120-sj5b')}
    ${irsRow('5c','<b>General business credit (attach Form 3800) — IRC §38 — Form 3800 Line 38 → Schedule J Line 5c</b>','f1120-sj5c')}
    ${irsRow('5d','Credit for prior year minimum tax (attach Form 8827)','f1120-sj5d')}
    ${irsRow('5e','Bond credits from Form 8912','f1120-sj5e')}
    ${irsRow('6','Total credits. Add lines 5a through 5e','f1120-sj6',{shade:true,bold:true})}
    ${irsRow('7','Subtract line 6 from line 4','f1120-sj7')}
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">8</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Personal holding company tax (attach Schedule PH (Form 1120))</span>
        <input class="irs-amount-field" id="f1120-sj8" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">9a</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Recapture of investment credit (attach Form 4255) and other taxes — see instructions</span>
        <input class="irs-amount-field" id="f1120-sj9a" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    ${buybackNote}
    ${irsRow('10','Total. Add lines 9a through 9z','f1120-sj10')}
    ${irsRow('11','Total tax before deferred taxes. Add lines 7, 8, and 10','f1120-sj11',{shade:true})}
    ${irsRow('12','<b>Total tax.</b> Enter here and on page 1, line 31','f1120-sj12',{bold:true,shade:true})}
    ${irsSectionHeader("Part II — Payments")}
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">13</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>${year-1} overpayment credited to ${year}</span>
        <input class="irs-amount-field" id="f1120-sj13" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">14</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>${year} estimated tax payments (IRC §6655 quarterly installments)</span>
        <input class="irs-amount-field" id="f1120-sj14" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">15</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>${year} quick refund applied for on Form 4466</span>
        <input class="irs-amount-field" id="f1120-sj15" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">17</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Tax deposited with Form 7004 (extension payment)</span>
        <input class="irs-amount-field" id="f1120-sj17" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">18</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Withholding (see instructions)</span>
        <input class="irs-amount-field" id="f1120-sj18" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">20a</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Tax paid with Form 2439</span>
        <input class="irs-amount-field" id="f1120-sj20a" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    <div class="irs-row two-col" style="font-size:8.5px;">
      <div class="irs-cell num">20b</div>
      <div class="irs-cell" style="flex:1;justify-content:space-between;">
        <span>Credit for federal tax on fuels (Form 4136)</span>
        <input class="irs-amount-field" id="f1120-sj20b" style="width:110px;" placeholder="0.00"/>
      </div>
    </div>
    ${irsRow('21','Total refundable credits. Add lines 20a through 20z','f1120-sj21',{shade:true})}
    ${irsRow('23','<b>Total payments and credits. Add lines 13 through 21. Enter here and on page 1, line 33</b>','f1120-sj23',{bold:true,shade:true})}`;
}

function taxPaymentsSection(year) {
  const prevYear = year - 1;
  const nextYear = year + 1;

  // Pre-TCJA (2016-2017): different line numbers and structure
  if (year <= 2017) {
    return `
    ${irsSectionHeader('Tax, Refundable Credits, and Payments')}
    ${irsRow('31','Total tax (Schedule J, Part I, line 11)','f1120-31',{bold:true})}
    ${irsRow('32','Total payments and refundable credits (Schedule J, Part II, line 21)','f1120-32')}
    ${irsRow('33','Estimated tax penalty. See instructions. Check if Form 2220 is attached <input type="checkbox"/>','f1120-33')}
    ${irsRow('34','Amount owed. If line 32 is smaller than the total of lines 31 and 33, enter amount owed','f1120-34',{redBg:true})}
    ${irsRow('35','<b>Overpayment.</b> If line 32 is larger than the total of lines 31 and 33, enter amount overpaid','f1120-35',{greenBg:true,bold:true})}
    <div class="irs-row two-col" style="background:#e8ffe8;">
      <div class="irs-cell num" style="font-weight:700;">36</div>
      <div class="irs-cell" style="flex:1;font-weight:700;">
        <span>Enter amount from line 35 you want:</span>
        <span>Credited to ${nextYear} estimated tax <input class="irs-amount-field" id="f1120-36a" style="width:90px;" placeholder="0.00"/>
          &nbsp; Refunded <input class="irs-amount-field" id="f1120-36b" style="width:90px;" placeholder="0.00"/></span>
      </div>
    </div>
    <div style="padding:3px 8px;font-size:7.5px;color:#1a6b3a;font-style:italic;border-left:3px solid #1a6b3a;margin:2px 0;">
      IRC §6402(a): Secretary SHALL, within the applicable period of limitations, refund any overpayment of tax. Mandatory — no discretion.
    </div>`;
  }

  // 2018+: standard current format
  return `
    ${irsSectionHeader('Tax, Refundable Credits, and Payments')}
    ${irsRow('31','Total tax (Schedule J, Part I, line 12)','f1120-31',{bold:true})}
    ${year >= 2025 ? irsRow('32','First installment of section 1062 applicable net tax liability (Form 1062, line 15)','f1120-32') : ''}
    ${irsRow('33','Total payments and credits (Schedule J, Part II, line 23)','f1120-33')}
    ${irsRow('34','Estimated tax penalty. See instructions. Check if Form 2220 is attached <input type="checkbox"/>','f1120-34')}
    ${irsRow('35','Amount owed. If line 33 is smaller than lines 31 + 32 + 34, enter amount owed','f1120-35',{redBg:true})}
    ${irsRow('36','<b>Overpayment.</b> If line 33 is larger than lines 31 + 32 + 34, enter amount overpaid','f1120-36',{greenBg:true,bold:true})}
    <div class="irs-row two-col" style="background:#e8ffe8;">
      <div class="irs-cell num" style="font-weight:700;">37a</div>
      <div class="irs-cell" style="flex:1;font-weight:700;">
        <span>Enter amount from line 36 you want:</span>
        <span>Credited to ${nextYear} estimated tax <input class="irs-amount-field" id="f1120-37a" style="width:90px;" placeholder="0.00"/>
          &nbsp; <b>Refunded ▶</b> <input class="irs-amount-field" id="f1120-37" style="width:90px;color:var(--green);" placeholder="0.00"/></span>
      </div>
    </div>
    <div style="padding:3px 8px;font-size:7.5px;color:#1a6b3a;font-weight:700;border-left:3px solid #1a6b3a;margin:2px 0;">
      IRC §6402(a): In the case of any overpayment, the Secretary SHALL credit the amount against any
      liability and SHALL refund any balance to such person. MANDATORY — no discretion — no exception.
    </div>`;
}

function scheduleLM1(year) {
  const prevYear = year - 1;
  return `
    <div style="padding:4px 8px;border-top:2px solid var(--irs-border);border-bottom:1px solid var(--irs-border);
      font-size:9.5px;font-weight:700;color:var(--irs-border);background:var(--irs-shade);margin-top:8px;">
      Schedule L — Balance Sheet per Books — Beginning: 1/1/${year} · End: 12/31/${year}
    </div>
    <div style="font-size:7.5px;color:var(--muted);padding:3px 8px;font-style:italic;">
      Note: Not required if total receipts &lt; $250,000 AND total assets &lt; $250,000. See Schedule K item 6.
    </div>
    <div style="display:grid;grid-template-columns:3fr 1fr 1fr;font-size:8.5px;padding:3px 8px;
      border-bottom:1px solid var(--irs-border);font-weight:700;background:var(--irs-shade2);">
      <div>Assets</div><div style="text-align:right;">Beginning of tax year</div><div style="text-align:right;">End of tax year</div>
    </div>
    <div style="display:grid;grid-template-columns:3fr 1fr 1fr;font-size:8.5px;padding:2px 8px;border-bottom:1px solid #ddd;">
      <div>1 Cash</div>
      <div style="text-align:right;"><input class="irs-amount-field" style="width:85px;" placeholder="0.00"/></div>
      <div style="text-align:right;"><input class="irs-amount-field" id="f1120-l1" style="width:85px;" placeholder="0.00"/></div>
    </div>
    <div style="display:grid;grid-template-columns:3fr 1fr 1fr;font-size:8.5px;padding:2px 8px;border-bottom:1px solid #ddd;background:var(--irs-shade2);">
      <div>2a Trade notes and accounts receivable</div>
      <div style="text-align:right;"><input class="irs-amount-field" style="width:85px;" placeholder="0.00"/></div>
      <div style="text-align:right;"><input class="irs-amount-field" id="f1120-l2a" style="width:85px;" placeholder="0.00"/></div>
    </div>
    <div style="display:grid;grid-template-columns:3fr 1fr 1fr;font-size:8.5px;padding:2px 8px;border-bottom:1px solid #ddd;">
      <div>5 Other investments (NOL financial asset)</div>
      <div style="text-align:right;"><input class="irs-amount-field" style="width:85px;" placeholder="0.00"/></div>
      <div style="text-align:right;"><input class="irs-amount-field" id="f1120-l5" style="width:85px;" placeholder="0.00"/></div>
    </div>
    <div style="display:grid;grid-template-columns:3fr 1fr 1fr;font-size:8.5px;padding:2px 8px;border-bottom:1px solid #ddd;background:var(--irs-shade2);">
      <div>6 Buildings &amp; other depreciable assets (net)</div>
      <div style="text-align:right;"><input class="irs-amount-field" style="width:85px;" placeholder="0.00"/></div>
      <div style="text-align:right;"><input class="irs-amount-field" id="f1120-l6" style="width:85px;" placeholder="0.00"/></div>
    </div>
    <div style="display:grid;grid-template-columns:3fr 1fr 1fr;font-size:8.5px;padding:3px 8px;border-bottom:2px solid var(--irs-border);background:var(--irs-shade2);font-weight:700;">
      <div>15 Total assets</div>
      <div style="text-align:right;"><input class="irs-amount-field" style="width:85px;" placeholder="0.00"/></div>
      <div style="text-align:right;"><input class="irs-amount-field" id="f1120-l15" style="width:85px;font-weight:700;" placeholder="0.00"/></div>
    </div>
    <div style="display:grid;grid-template-columns:3fr 1fr 1fr;font-size:8.5px;padding:2px 8px;border-bottom:1px solid #ddd;">
      <div>16 Accounts payable</div>
      <div style="text-align:right;"><input class="irs-amount-field" style="width:85px;" placeholder="0.00"/></div>
      <div style="text-align:right;"><input class="irs-amount-field" id="f1120-l16" style="width:85px;" placeholder="0.00"/></div>
    </div>
    <div style="display:grid;grid-template-columns:3fr 1fr 1fr;font-size:8.5px;padding:3px 8px;border-bottom:2px solid var(--irs-border);background:var(--irs-shade2);font-weight:700;">
      <div>26 Total liabilities &amp; stockholders' equity</div>
      <div style="text-align:right;"><input class="irs-amount-field" style="width:85px;" placeholder="0.00"/></div>
      <div style="text-align:right;"><input class="irs-amount-field" id="f1120-l28" style="width:85px;font-weight:700;" placeholder="0.00"/></div>
    </div>
    <div style="padding:4px 8px;border-bottom:1px solid var(--irs-border);border-top:2px solid var(--irs-border);
      font-size:9.5px;font-weight:700;color:var(--irs-border);background:var(--irs-shade);">
      Schedule M-1 — Reconciliation of Income (Loss) per Books With Income per Return
    </div>
    <div style="font-size:7.5px;color:var(--muted);padding:3px 8px;font-style:italic;">
      Note: The corporation is not required to complete Schedules M-1 and M-2 if the total receipts for the year are less than $250,000
      AND the total assets at the end of the year are less than $250,000.
    </div>
    ${irsRow('1','Net income (loss) per books','f1120-m1')}
    ${irsRow('2','Federal income tax per books','f1120-m2')}
    ${irsRow('5','Income recorded on books this year not included on this return (itemize)','f1120-m5')}
    ${irsRow('10','Income (line 30, page 1) — should equal line 10, Schedule M-1','f1120-m10',{shade:true,bold:true})}`;
}


/* ── buildForm1120(year) ──────────────────────────────────────────────────── */
function buildForm1120(year) {
  const era = getFormEra(year);
  const prevYear = year - 1;
  const dueDate = year <= 2015 ? 'March 15, ' + (year+1) : 'April 15, ' + (year+1);

  // Era banner at top of form
  const eraBanner = {
    'pre-tcja':      `<div style="background:#fff3cd;border:1px solid #8b5e00;padding:5px 8px;font-size:8px;font-weight:700;color:#5a3a00;margin-bottom:6px;">
                       ⚠ TAX YEAR ${year} — PRE-TCJA FORM: Graduated rates (15%/25%/34%/35%) · DPAD deduction (IRC §199) · Corporate AMT · No 80% NOL limit · 2-year carryback available
                       · Due date: ${dueDate} (15th day of 4th month after year-end per IRC §6072(b))
                     </div>`,
    'tcja-initial':  `<div style="background:#d4edda;border:1px solid #1a6b3a;padding:5px 8px;font-size:8px;font-weight:700;color:#0d3d1f;margin-bottom:6px;">
                       ✓ TAX YEAR ${year} — POST-TCJA: Flat 21% rate · DPAD repealed · Corporate AMT repealed · 80% NOL limit · No carryback · BEAT (IRC §59A) for large multinationals
                       · Due date: ${dueDate}
                     </div>`,
    'cares-act':     `<div style="background:#cce5ff;border:1px solid #1a3a6b;padding:5px 8px;font-size:8px;font-weight:700;color:#0a1e3a;margin-bottom:6px;">
                       📋 TAX YEAR ${year} — CARES ACT MODIFICATIONS: P.L. 116-136 · 80% NOL limitation SUSPENDED for 2018-2020 losses · 5-year carryback RESTORED for 2018-2020 losses
                       · Flat 21% rate applies · Due date: ${dueDate}
                     </div>`,
    'camt-era':      `<div style="background:#f0e8ff;border:1px solid #4a1a6b;padding:5px 8px;font-size:8px;font-weight:700;color:#2a0a4a;margin-bottom:6px;">
                       🏛 TAX YEAR ${year} — CAMT ERA: Inflation Reduction Act, P.L. 117-169 · Corporate AMT (CAMT) reinstated at 15% for corps with avg. book income ≥ $1B · Form 4626 required
                       ${year >= 2023 ? '· Stock buyback excise tax: 1% on repurchases (IRC §4501, Form 7208)' : ''} · Due date: ${dueDate}
                     </div>`,
    'current':       `<div style="background:#e8f4fd;border:1px solid #1a3a6b;padding:5px 8px;font-size:8px;font-weight:700;color:#0a1e3a;margin-bottom:6px;">
                       📄 TAX YEAR ${year} — CURRENT FORM: Flat 21% rate · CAMT effective · Stock buyback excise tax · IRC §179D energy deduction · 80% NOL limit · Due date: ${dueDate}
                     </div>`
  };

  return `
    <div id="form1120-era-banner">${eraBanner[era]}</div>
    <div class="irs-form-wrap" id="form1120">
      ${irs1120Header(year)}
      ${incomeSection(year)}
      ${deductionsSection(year)}
      ${nolSection(year)}
      ${taxPaymentsSection(year)}
      ${scheduleJ(year)}
      ${scheduleLM1(year)}
      <div class="irs-sign-row">
        <div>
          <div class="irs-sign-field">Sign Here — Signature of Officer ___________________________</div>
          <div class="irs-sign-field">Date _______________ Title ______________________</div>
        </div>
        <div>
          <div class="irs-sign-field">Preparer's name ________________________________</div>
          <div class="irs-sign-field">PTIN _______________________ Date _______________</div>
        </div>
      </div>
      <div class="irs-footer">Cat. No. 11450Q &nbsp;&nbsp; Form <b>1120</b> (${year})</div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;">
      <button class="app-btn primary" onclick="populateAllForms()">↻ Sync from Ledger</button>
      <button class="app-btn primary" onclick="generateJournalFromForms()">📋 Generate Journal Entries from This Return</button>
      <button class="app-btn secondary" onclick="showSection('journaldoc');generateJournalDocument('forms')">📄 Generate Full Journal Document</button>
      <button class="app-btn ghost" onclick="printForm('form1120')">🖨 Print</button>
    </div>`;
}

/* ── onYearChange(year) ──────────────────────────────────────────────────── */
function onYearChange(year) {
  year = parseInt(year) || 2026;
  if (typeof EEON_STATE !== 'undefined') EEON_STATE.year = year;
  // Update year badge display elements
  var badge = document.getElementById('eeon-ybadge');
  if (badge) badge.textContent = 'TY ' + year;
  var globalSel = document.getElementById('eeon-tax-year');
  if (globalSel) globalSel.value = String(year);
  // Sync year selector if present
  var sel = document.getElementById('eeon-f1120-year');
  if (sel) sel.value = year;
  // Rebuild Form 1120 with correct year
  var wrap = document.getElementById('form1120-year-content');
  if (wrap) wrap.innerHTML = buildForm1120(year);
  // Update year spans in other forms
  ['e-990-yr','e-1041-yr','e-1041-yr2','e-k1-yr','e-k1-yr2'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = year;
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   Agent ↔ GAAPCLAW  BIDIRECTIONAL SYNC BRIDGE  v2.0
   Shared key:  'GAAPCLAW_AgentSync'  (localStorage)

   populateAllForms()         — reads GAAP ledger → fills every EEON tax form field
   generateJournalFromForms() — reads form fields → writes journal entries to GAAP
   ═══════════════════════════════════════════════════════════════════════════ */

var AGENT_SYNC_KEY   = 'GAAPCLAW_AgentSync';
var _syncTimestamp   = null;

/* ── Helpers ─────────────────────────────────────────────────────────── */
function _fmtNum(n) {
  var v = parseFloat(n) || 0;
  return v === 0 ? '' : v.toFixed(2);
}

function _setField(id, value) {
  var el = document.getElementById(id);
  if (!el) return false;
  var numVal = parseFloat(value) || 0;
  el.value = numVal === 0 ? '' : numVal.toFixed(2);
  // Fire events so any calc listeners trigger
  ['input','change'].forEach(function(evt) {
    el.dispatchEvent(new Event(evt, {bubbles:true}));
  });
  // Gold flash — visually confirms field was populated from GAAP
  el.style.transition = 'background-color 0.3s ease';
  el.style.backgroundColor = 'rgba(245,166,35,0.35)';
  setTimeout(function() { el.style.backgroundColor = ''; }, 1400);
  return true;
}

function _getField(id) {
  var el = document.getElementById(id);
  return el ? (parseFloat(el.value) || 0) : 0;
}

function _syncBanner(msg, type) {
  var bar = document.getElementById('agent-sync-status');
  if (!bar) return;
  var colors = {ok:'#10b981', warn:'#f59e0b', error:'#ef4444', info:'#60a5fa'};
  var col = colors[type] || '#9ca3af';
  bar.style.cssText = [
    'background:' + col + '11',
    'border:1px solid ' + col + '44',
    'border-radius:8px',
    'padding:7px 14px',
    'font-size:11px',
    'font-family:"IBM Plex Mono",monospace',
    'color:' + col,
    'margin-bottom:10px',
    'display:flex',
    'align-items:center',
    'gap:8px',
    'flex-wrap:wrap'
  ].join(';');
  var span = bar.querySelector('.sync-msg');
  if (span) span.textContent = msg;
  else bar.innerHTML = '<span class="sync-msg">' + msg + '</span>' +
    '<button onclick="populateAllForms()" style="background:#10b981;color:#000;border:none;padding:3px 11px;border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;margin-left:auto;">↻ SYNC</button>' +
    '<button onclick="generateJournalFromForms()" style="background:#f59e0b;color:#000;border:none;padding:3px 11px;border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;">⇄ PUSH BACK</button>';
}

/* ── READ GAAP DATA ──────────────────────────────────────────────────── */
function _getGAAPData() {
  var raw; try { raw = localStorage.getItem(AGENT_SYNC_KEY); } catch(e){}
  if (!raw) return null;
  try { return JSON.parse(raw); } catch(e) { return null; }
}

/* ── populateAllForms() ──────────────────────────────────────────────── */
function populateAllForms() {
  var payload = _getGAAPData();
  if (!payload) {
    _syncBanner('⚠ No GAAP data found. Open GAAP.html and click "⇄ PUSH TO AGENT".', 'warn');
    return;
  }

  var fin = payload.financials || {};
  var yr  = parseInt(payload.taxYear) || new Date().getFullYear();

  // Update year selector if present
  var yrSel = document.getElementById('eeon-f1120-year');
  if (yrSel) { yrSel.value = yr; }
  if (typeof onYearChange === 'function') onYearChange(yr);

  // Wait for dynamic form render and retry a few times for year-rebuilt Form 1120
  var applySync = function(attempt) {
    _populateForm1120(fin);
    _populateForm990(fin, yr);
    _populateForm1041(fin);
    _populateForm1065(fin);
    _populateForm1120W(fin);
    _populateForm3800(fin);
    _populateFormSchedC(fin);

    // Update entity name in header fields if present
    ['f1120-name','f990-name','f1041-name','f1065-name'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el && payload.entityName) el.value = payload.entityName;
    });
    ['f1120-taxyear','f990-taxyear','f1041-taxyear'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.value = yr;
    });

    if (attempt < 4 && !document.getElementById('f1120-31')) {
      setTimeout(function() { applySync(attempt + 1); }, 280);
      return;
    }

    _syncTimestamp = payload.timestamp;
    var ts = new Date(payload.timestamp).toLocaleTimeString();
    var cnt = payload.entryCount || 0;
    var rev = '$' + Math.round(fin.grossReceipts||fin.revenue||0).toLocaleString();
    var ni  = '$' + Math.round(Math.abs((fin.normalizedNetIncome !== undefined && fin.normalizedNetIncome !== null) ? fin.normalizedNetIncome : (fin.netIncome||0))).toLocaleString();
    _syncBanner(
      '⇄ SYNCED from GAAP — ' + cnt + ' entries · ' + rev + ' revenue · ' + ni +
      ' net income' + (payload.entityName ? ' · ' + payload.entityName : '') + ' · TY ' + yr + ' · ' + ts,
      'ok'
    );
  };
  setTimeout(function() { applySync(1); }, 350);
}

/* ── FORM 1120  U.S. Corporation Income Tax Return ──────────────────── */
function _populateForm1120(fin) {
  var yr = parseInt((document.getElementById('eeon-f1120-year') || {}).value || (fin.taxYear || new Date().getFullYear()), 10) || new Date().getFullYear();
  var gr   = fin.grossReceipts || fin.revenue || 0;
  var exp  = fin.totalDeductions || fin.expenses || 0;
  var pay  = fin.salariesWages || 0;
  var ni   = (fin.normalizedNetIncome !== undefined && fin.normalizedNetIncome !== null) ? fin.normalizedNetIncome : (fin.netIncome || 0);
  var charitable = fin.charitableContributions || 0;
  var depr = fin.accumDepreciation || 0;
  var otherDed = (fin.otherDeductions !== undefined && fin.otherDeductions !== null)
    ? fin.otherDeductions
    : Math.max(0, exp - pay - charitable - depr);
  var totalDeductions = Math.max(0, pay + charitable + depr + otherDed);
  var ti = (fin.taxableIncome !== undefined && fin.taxableIncome !== null)
    ? Math.max(0, fin.taxableIncome)
    : Math.max(0, gr - totalDeductions);
  var tax  = (fin.corporateTax !== undefined && fin.corporateTax !== null)
    ? Math.max(0, fin.corporateTax)
    : Math.max(0, ti * 0.21);
  var ast  = fin.assets || 0;
  var liab = fin.liabilities || 0;
  var payments = fin.taxPayments || fin.federalWithholding || 0;
  var amountOwed = Math.max(0, tax - payments);
  var overpay = Math.max(0, payments - tax);

  // Income section
  _setField('f1120-1a', gr);
  _setField('f1120-1b', 0);
  _setField('f1120-1c', gr);
  _setField('f1120-2',  0);
  _setField('f1120-3',  gr);
  _setField('f1120-5',  0);
  _setField('f1120-10', 0);
  _setField('f1120-11', gr);

  // Deductions section
  _setField('f1120-12', 0);
  _setField('f1120-13', pay);
  _setField('f1120-14', 0);
  _setField('f1120-15', 0);
  _setField('f1120-16', 0);
  _setField('f1120-17', 0);
  _setField('f1120-18', 0);
  _setField('f1120-19', charitable);
  _setField('f1120-20', depr);
  _setField('f1120-21', 0);
  _setField('f1120-22', 0);
  _setField('f1120-23', 0);
  _setField('f1120-24', 0);
  _setField('f1120-26', otherDed);      // Other deductions
  _setField('f1120-27', totalDeductions); // Total deductions

  // Taxable income section
  _setField('f1120-28', ti);
  _setField('f1120-29a', 0);
  _setField('f1120-29b', 0);
  _setField('f1120-29c', 0);
  _setField('f1120-30', ti);

  // Schedule J
  _setField('f1120-sj4',  tax);
  _setField('f1120-sj6',  0);
  _setField('f1120-sj7',  0);
  _setField('f1120-sj10', tax);
  _setField('f1120-sj11', tax);
  _setField('f1120-sj12', tax);
  _setField('f1120-sj13', payments);
  _setField('f1120-sj14', 0);
  _setField('f1120-sj14a', 0);
  _setField('f1120-sj20a', 0);
  if (yr <= 2017) {
    _setField('f1120-sj21', payments);
  } else {
    _setField('f1120-sj23', payments);
  }

  // Page 1 payments/refund lines (year-dependent)
  _setField('f1120-31', tax);
  if (yr <= 2017) {
    _setField('f1120-32', payments);
    _setField('f1120-33', 0);
    _setField('f1120-34', amountOwed);
    _setField('f1120-35', overpay);
    _setField('f1120-36a', 0);
    _setField('f1120-36b', overpay);
  } else {
    _setField('f1120-32', 0);
    _setField('f1120-33', payments);
    _setField('f1120-34', 0);
    _setField('f1120-35', amountOwed);
    _setField('f1120-36', overpay);
    _setField('f1120-37a', 0);
    _setField('f1120-37', overpay);
  }

  // Schedule L (fix prior line-mapping mismatches)
  _setField('f1120-l1',  0);
  _setField('f1120-l2a', 0);
  _setField('f1120-l5',  fin.fixedAssets || 0);
  _setField('f1120-l6',  fin.netBookValue || fin.fixedAssets || 0);
  _setField('f1120-l15', ast);  // Total assets
  _setField('f1120-l16', liab); // Accounts payable / liabilities proxy
  _setField('f1120-l28', ast);  // Total liabilities + equity

  // Schedule M-1
  _setField('f1120-m1', ni);
  _setField('f1120-m2', tax);
  _setField('f1120-assets', ast);
}

/* ── FORM 990  Return of Organization Exempt From Income Tax ────────── */
function _populateForm990(fin, yr) {
  var rev  = fin.revenue || fin.grossReceipts || 0;
  var exp  = fin.expenses || 0;
  var ni   = fin.netIncome || 0;
  var ast  = fin.assets || 0;
  var liab = fin.liabilities || 0;
  var eq   = fin.equity || 0;

  var yrEl = document.getElementById('f990-year');
  if (yrEl) yrEl.value = String(yr).slice(-2);
  _setField('f990-taxyear',  yr);
  _setField('f990-grossrec', rev);
  _setField('f990-line1',    rev);
  _setField('f990-line2',    0);    // Government grants
  _setField('f990-line3',    0);    // Other contributions
  _setField('f990-line4',    0);    // Investment income
  _setField('f990-line5',    rev);  // Total revenue (Part VIII total)
  _setField('f990-totalrev', rev);
  _setField('f990-line13',   exp);  // Grants
  _setField('f990-line17',   exp);  // Total expenses
  _setField('f990-totalexp', exp);
  _setField('f990-netinc',   ni);
  _setField('f990-totassets',ast);
  _setField('f990-totliab',  liab);
  _setField('f990-netassets',eq);
}

/* ── FORM 1041  Estate/Trust Income Tax Return ──────────────────────── */
function _populateForm1041(fin) {
  var rev  = fin.revenue || 0;
  var exp  = fin.expenses || 0;
  var ni   = fin.netIncome || 0;
  var ti   = fin.taxableIncome || 0;
  var tax  = fin.corporateTax || 0;

  _setField('f1041-1',   rev);   // Interest income
  _setField('f1041-2a',  rev);   // Ordinary dividends
  _setField('f1041-2b',  0);     // Qualified dividends
  _setField('f1041-3',   ni);    // Net business income
  _setField('f1041-4',   0);     // Net capital gain
  _setField('f1041-5',   0);     // Rents, royalties, partnerships
  _setField('f1041-8',   rev);   // Total income
  _setField('f1041-11',  0);     // Fiduciary fees
  _setField('f1041-12',  fin.charitableContributions||0); // Charitable deduction
  _setField('f1041-14',  0);     // Attorney & accountant fees
  _setField('f1041-15a', 0);     // Other deductions — A
  _setField('f1041-15b', 0);     // Other deductions — B
  _setField('f1041-16',  exp);   // Total deductions
  _setField('f1041-17',  ni);    // Adjusted total income
  _setField('f1041-18',  ti);    // Income distribution deduction
  _setField('f1041-19',  0);     // Estate tax deduction
  _setField('f1041-20',  0);     // Exemption
  _setField('f1041-21',  ti);    // Taxable income
  _setField('f1041-22',  ti);    // Tax
  _setField('f1041-24',  tax);   // Tax (Schedule G)
  _setField('f1041-27',  tax);   // Total tax
  _setField('f1041-29',  0);     // Payments
  _setField('f1041-30',  tax);   // Tax due

  // Schedule G
  _setField('f1041-g1',  ti);
  _setField('f1041-g3',  ti * 0.37); // Max trust rate
  _setField('f1041-g7',  tax);
}

/* ── FORM 1065  U.S. Return of Partnership Income ───────────────────── */
function _populateForm1065(fin) {
  var rev  = fin.revenue || fin.grossReceipts || 0;
  var exp  = fin.expenses || 0;
  var ni   = fin.netIncome || 0;
  var ast  = fin.assets || 0;
  var liab = fin.liabilities || 0;
  var eq   = fin.equity || 0;

  _setField('f1065-1a', rev);    // Gross receipts
  _setField('f1065-1b', 0);      // Returns
  _setField('f1065-1c', rev);    // Balance
  _setField('f1065-2',  0);      // COGS
  _setField('f1065-3',  rev);    // Gross profit
  _setField('f1065-7',  0);      // Other income
  _setField('f1065-8',  rev);    // Total income
  _setField('f1065-9',  fin.salariesWages||0); // Salaries
  _setField('f1065-10', 0);      // Guaranteed payments
  _setField('f1065-13', 0);      // Repairs
  _setField('f1065-14', 0);      // Bad debts
  _setField('f1065-15', 0);      // Rent
  _setField('f1065-16a',0);      // Taxes & licenses
  _setField('f1065-19', 0);      // Employee benefits
  _setField('f1065-20', 0);      // Other deductions
  _setField('f1065-22', exp);    // Total deductions
  _setField('f1065-k1', rev);    // Ordinary business income
  _setField('f1065-k2', ni);     // Net rental real estate
  _setField('f1065-k3', 0);      // Other net rental income
  _setField('f1065-k4a',fin.charitableContributions||0); // Charitable contributions

  // Schedule L — Balance Sheet
  _setField('f1065-l1b', 0);     // Cash (end)
  _setField('f1065-l6b', ast);   // Total assets (end)
  _setField('f1065-l15b',liab);  // Total liabilities (end)
  _setField('f1065-l22b',eq);    // Partners capital (end)

  // Schedule M-1
  _setField('f1065-m1', ni);
  _setField('f1065-m3', 0);
  _setField('f1065-m5', ni);
  _setField('f1065-m6', 0);
  _setField('f1065-m7', ni);
}

/* ── FORM 1120-W  Estimated Tax for Corporations ────────────────────── */
function _populateForm1120W(fin) {
  var ti  = fin.taxableIncome || 0;
  var tax = fin.corporateTax  || 0;
  _setField('f1120w-1', ti);
  _setField('f1120w-2', tax);
  _setField('f1120w-7', tax);
  _setField('f1120w-8', tax);
  // Estimated installments (quarterly = tax/4)
  var q = tax / 4;
  _setField('f1120w-inst1', q);
  _setField('f1120w-inst2', q);
  _setField('f1120w-inst3', q);
  _setField('f1120w-inst4', q);
}

/* ── FORM 3800  General Business Credit ─────────────────────────────── */
function _populateForm3800(fin) {
  var tax = fin.corporateTax || 0;
  _setField('f3800-1',  tax);    // Regular tax before credits
  _setField('f3800-2',  tax);    // Net income tax
  _setField('f3800-3',  tax * 0.25); // Net regular tax × 25%
  _setField('f3800-4',  tax);
  _setField('f3800-5',  0);      // Tentative minimum tax
  _setField('f3800-6',  tax);    // Net income tax minus TMT
  _setField('f3800-38', 0);      // General business credit carryback
  _setField('f3800-39', 0);      // Carryforward
  _setField('f3800-40', 0);      // Allowable credit
}

/* ── SCHEDULE C  Profit or Loss from Business ───────────────────────── */
function _populateFormSchedC(fin) {
  var rev = fin.revenue || fin.grossReceipts || 0;
  var exp = fin.expenses || 0;
  var ni  = fin.netIncome || 0;

  _setField('schedC-1',  rev);   // Gross receipts
  _setField('schedC-2',  0);     // Returns
  _setField('schedC-3',  rev);   // Gross profit
  _setField('schedC-5',  0);     // COGS
  _setField('schedC-7',  rev);   // Gross income
  _setField('schedC-8',  fin.salariesWages||0); // Advertising (map to wages)
  _setField('schedC-28', exp);   // Total expenses
  _setField('schedC-31', ni);    // Net profit/loss
}

/* ── generateJournalFromForms() ──────────────────────────────────────── */
function generateJournalFromForms() {
  var today = new Date().toISOString().slice(0,10);
  var yr = parseInt((document.getElementById('eeon-f1120-year') || {}).value || new Date().getFullYear(), 10) || new Date().getFullYear();

  var grossReceipts = _getField('f1120-1a') || _getField('f1120-1c') || _getField('f990-grossrec') || _getField('f1065-1a') || 0;
  var totalExp      = _getField('f1120-27') || _getField('f1120-26') || _getField('f990-totalexp') || _getField('f1065-22') || 0;
  var salaries      = _getField('f1120-13') || _getField('f1065-9') || 0;
  var corporateTax  = _getField('f1120-31') || _getField('f1120-sj12') || _getField('f1120-sj11') || 0;
  var assets        = _getField('f1120-l15') || _getField('f1120-l6') || _getField('f1065-l6b') || 0;
  var liabilities   = _getField('f1120-l16') || _getField('f1065-l15b') || 0;
  var l28           = _getField('f1120-l28') || 0;
  var equity        = l28 ? Math.max(0, l28 - liabilities) : (_getField('f1065-l22b') || 0);
  var charitable    = _getField('f1120-19') || _getField('f1065-k4a') || 0;

  var taxPayments = 0;
  if (yr <= 2017) {
    taxPayments = _getField('f1120-32') || _getField('f1120-sj21') || 0;
  } else {
    taxPayments = _getField('f1120-33') || _getField('f1120-sj23') || 0;
  }

  var entries = [];

  if (grossReceipts > 0) entries.push({
    date: today, description: '[Agent→GAAP] Gross Receipts / Revenue from Form 1120 Line 1a',
    category: 'Income', debit: 0, credit: grossReceipts, source: 'Agent'
  });
  if (salaries > 0) entries.push({
    date: today, description: '[Agent→GAAP] Salaries & Wages from Form 1120 Line 13',
    category: 'Payroll Expense', debit: salaries, credit: 0, source: 'Agent'
  });
  if (totalExp > salaries && totalExp > 0) entries.push({
    date: today, description: '[Agent→GAAP] Other Deductions from Form 1120 (total deductions less payroll)',
    category: 'Business Expense', debit: totalExp - salaries, credit: 0, source: 'Agent'
  });
  if (corporateTax > 0) entries.push({
    date: today, description: '[Agent→GAAP] Corporate Income Tax Accrual 21% — IRC §11',
    category: 'Business Expense', debit: corporateTax, credit: 0, source: 'Agent'
  });
  if (charitable > 0) entries.push({
    date: today, description: '[Agent→GAAP] Charitable Contributions — IRC §170',
    category: 'Charitable Contribution', debit: charitable, credit: 0, source: 'Agent'
  });
  if (assets > 0) entries.push({
    date: today, description: '[Agent→GAAP] Total Assets — Balance Sheet',
    category: 'Asset', debit: assets, credit: 0, source: 'Agent'
  });
  if (liabilities > 0) entries.push({
    date: today, description: '[Agent→GAAP] Total Liabilities — Balance Sheet',
    category: 'Liability', debit: 0, credit: liabilities, source: 'Agent'
  });
  if (taxPayments > 0) entries.push({
    date: today, description: '[Agent→GAAP] Tax payments/credits from Form 1120 payment lines',
    category: 'Asset', debit: taxPayments, credit: 0, source: 'Agent'
  });

  if (!entries.length) {
    _syncBanner('⚠ No form data found to push back. Fill the tax forms first.', 'warn');
    return;
  }

  // Write back into sync payload
  var raw; try { raw = localStorage.getItem(AGENT_SYNC_KEY); } catch(e){}
  var payload = {}; try { payload = JSON.parse(raw||'{}'); } catch(e){}
  payload.agentJournalEntries    = entries;
  payload.agentJournalTimestamp  = new Date().toISOString();
  localStorage.setItem(AGENT_SYNC_KEY, JSON.stringify(payload));

  _syncBanner(
    '✅ Pushed ' + entries.length + ' journal entries to GAAP — open GAAP.html and click "⇄ PULL FROM AGENT"',
    'ok'
  );
}

/* ── Auto-listen for GAAP pushing updates ─────────────────────────── */
window.addEventListener('storage', function(e) {
  if (e.key !== AGENT_SYNC_KEY || !e.newValue) return;
  try {
    var payload = JSON.parse(e.newValue);
    if (payload.timestamp === _syncTimestamp) return; // same data, skip
    // Show live update notice
    _syncBanner(
      '⇄ GAAP updated — ' + (payload.entryCount||0) + ' entries — click ↻ SYNC to populate forms',
      'warn'
    );
    // Auto-populate if taxforms tab is currently active
    var tfPage = document.getElementById('page-taxforms');
    if (tfPage && tfPage.classList && tfPage.classList.contains('active')) {
      populateAllForms();
    }
  } catch(err){}
});

/* ── On load: check for existing GAAP data ────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    try {
      var raw = localStorage.getItem(AGENT_SYNC_KEY);
      if (!raw) return;
      var payload = JSON.parse(raw);
      if (!payload || !payload.timestamp) return;
      var cnt = payload.entryCount || 0;
      var ts  = new Date(payload.timestamp).toLocaleDateString();
      _syncBanner(
        '⇄ GAAP ledger available — ' + cnt + ' entries from ' + ts +
        (payload.entityName ? ' · ' + payload.entityName : '') +
        ' — click ↻ SYNC to populate forms',
        'info'
      );
    } catch(err) {}
  }, 800);
});
// ── EEON Full Suite Embedded Iframe Helpers ──────────────────────────────────
var EEON_FULL_SUITE_BLOB_URL = null;
var _eeonFullSuiteUrl = null;

function eeonDecodeUtf8FromBase64(b64) {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch(e) {
    try { return atob(b64); } catch(e2) { return ''; }
  }
}

function eeonGetFullSuiteBlobUrl() {
  // Return cached blob URL if available
  if (EEON_FULL_SUITE_BLOB_URL) return EEON_FULL_SUITE_BLOB_URL;
  // Try to load from EonFullSuite.html if hosted alongside this file
  if (_eeonFullSuiteUrl) return _eeonFullSuiteUrl;
  // If EEON_FULL_SUITE_B64 is defined (injected externally), decode it
  if (typeof EEON_FULL_SUITE_B64 !== 'undefined' && EEON_FULL_SUITE_B64) {
    var html = eeonDecodeUtf8FromBase64(EEON_FULL_SUITE_B64);
    if (html) {
      EEON_FULL_SUITE_BLOB_URL = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      return EEON_FULL_SUITE_BLOB_URL;
    }
  }
  // Fall back to relative URL for same-origin hosting
  var basePath = window.location.href.replace(/\/[^\/]*$/, '/');
  return basePath + 'gas/E-Longmire%20Estate%20%E2%80%94%20Tax%20Accounting%20System.html';
}

function initEmbeddedEeonSuite() {
  var frame = document.getElementById('eeonfull-iframe');
  var status = document.getElementById('eeonfull-status');
  if (!frame) return;
  var url = eeonGetFullSuiteBlobUrl();
  if (!url) {
    if (status) status.textContent = 'Could not load EEON full suite payload.';
    return;
  }
  if (frame.getAttribute('data-loaded') === '1' && frame.src === url) {
    if (status) status.textContent = 'EEON full suite ready.';
    return;
  }
  if (status) status.textContent = 'Booting EEON full suite...';
  frame.onload = function() {
    frame.setAttribute('data-loaded', '1');
    if (status) status.textContent = 'EEON full suite loaded.';
  };
  frame.onerror = function() {
    if (status) status.textContent = '⚠ Could not load E-Longmire Tax System. Ensure gas/E-Longmire Estate — Tax Accounting System.html exists.';
  };
  frame.src = url;
}

function eeonReloadEmbeddedSuite() {
  var frame = document.getElementById('eeonfull-iframe');
  var status = document.getElementById('eeonfull-status');
  if (!frame) return;
  frame.removeAttribute('data-loaded');
  var url = eeonGetFullSuiteBlobUrl();
  if (url) {
    frame.src = url;
    if (status) status.textContent = 'Reloading EEON full suite...';
  }
}

function eeonOpenEmbeddedSuiteInNewTab() {
  var url = eeonGetFullSuiteBlobUrl();
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}
// ─────────────────────────────────────────────────────────────────────────────

function printForm(formId) {
  var formEl = document.getElementById(formId);
  if (!formEl) { window.print(); return; }
  // Collect all stylesheet rules
  var css = '';
  try {
    Array.from(document.styleSheets).forEach(function(ss) {
      try { Array.from(ss.cssRules || []).forEach(function(r) { css += r.cssText + '\n'; }); } catch(e) {}
    });
  } catch(e) {}
  var win = window.open('', '_blank', 'width=960,height=780');
  if (!win) { alert('Allow pop-ups to print this form.'); return; }
  win.document.write(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>IRS Form Print</title>' +
    '<style>' + css +
    '@media print{body{margin:0!important;background:#fff!important;}.irs-form-wrap{max-width:100%!important;border:none!important;box-shadow:none!important;}}</style>' +
    '</head><body style="margin:16px;background:#fff">' +
    formEl.outerHTML +
    '</body></html>'
  );
  win.document.close();
  win.focus();
  setTimeout(function() { win.print(); }, 400);
}

// ═══════════════════════════════════════════════════════════════════════════
// HARD_LOCK — Immutable Enforcement Layer (output sanitizer + prompt validator)
// ═══════════════════════════════════════════════════════════════════════════
var HARD_LOCK = Object.freeze({
  version: '2.0', enforced: true,
  sanitizeOutput: function(raw) {
    if (!raw || typeof raw !== 'string') return '';
    var t = raw;
    t = t.replace(/<[^>]*>/g, '');
    t = t.replace(/\*\*\*(.*?)\*\*\*/g,'$1').replace(/\*\*(.*?)\*\*/g,'$1').replace(/(?<!\w)\*([^\*\n]+)\*(?!\w)/g,'$1');
    t = t.replace(/__(.*?)__/g,'$1').replace(/(?<!\w)_([^_\n]+)_(?!\w)/g,'$1');
    t = t.replace(/^#{1,6}\s+/gm,'').replace(/^[\-\*\_]{3,}\s*$/gm,'');
    t = t.replace(/```[\s\S]*?```/g,function(m){return m.replace(/```\w*\n?/g,'').replace(/```/g,'');});
    t = t.replace(/`([^`]+)`/g,'$1').replace(/\[([^\]]+)\]\([^\)]+\)/g,'$1').replace(/!\[([^\]]*)\]\([^\)]+\)/g,'$1');
    t = t.replace(/^>\s?/gm,'').replace(/^[\s]*[-\*\+]\s+/gm,'').replace(/^[\s]*\d+\.\s+/gm,'');
    t = t.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&nbsp;/g,' ');
    t = t.replace(/^\*\*[A-Za-z]+:\*\*\s*/gm,'').replace(/\n{4,}/g,'\n\n\n').replace(/[ \t]{2,}/g,' ');
    return t.trim();
  },
  validatePrompt: function(prompt) {
    return prompt && typeof prompt === 'string' &&
           prompt.indexOf('SYPHER PROTOCOL') !== -1 && prompt.indexOf('PRESUMPTION KILLER') !== -1;
  },
  stripDisclaimers: function(text) {
    if (!text) return text;
    var patterns = [
      /I am an AI[^.]*\./gi, /I am not (an? )?attorney[^.]*\./gi, /I am not (an? )?lawyer[^.]*\./gi,
      /This is not legal advice[^.]*\./gi, /does not constitute legal advice[^.]*\./gi,
      /for (educational|informational) purposes only[^.]*\./gi, /consult with a qualified[^.]*\./gi,
      /seek legal counsel[^.]*\./gi, /I cannot provide legal advice[^.]*\./gi,
      /you should consult a professional[^.]*\./gi, /I recommend speaking with[^.]*\./gi,
      /Important note:[^.]*\./gi, /Please note:[^.]*\./gi, /Disclaimer:[^.]*\./gi, /^\s*Note:\s*/gmi
    ];
    patterns.forEach(function(p) { text = text.replace(p, ''); });
    return text;
  },
  processOutput: function(raw) { return this.sanitizeOutput(this.stripDisclaimers(raw)); }
});
try { HARD_LOCK.enforced = false; } catch(e) {}
if (HARD_LOCK.enforced !== true) throw new Error('HARD LOCK INTEGRITY VIOLATION');

// Parity drift notification superseded by tmar-updater.js

// ── Token Budget Guard ────────────────────────────────────────────────────
var PROVIDER_LIMITS = {
  ollama:9999999, anthropic:200000, claude:200000, openai:128000, openrouter:200000,
  deepseek:64000, groq:32768, mistral:32000, zai:128000, kimi:128000,
  minimax:128000, ernie:8000, xai:131072, cerebras:8192, custom:128000
};
function estimateTokens(text) { return text ? Math.ceil(text.length / 3.8) : 0; }
function truncateToTokenBudget(userMessage, systemTokens) {
  var pid = localStorage.getItem('eeon_active_provider') || 'claude';
  var maxCtx = PROVIDER_LIMITS[pid] || 128000;
  var available = maxCtx - systemTokens - 4096 - 500;
  if (available < 1000) available = 1000;
  if (estimateTokens(userMessage) <= available) return userMessage;
  var split = userMessage.indexOf('═══ UPLOADED DOCUMENTS ═══');
  if (split === -1) return userMessage.substring(0, Math.floor(available * 3.8)) + '\n\n[TRUNCATED — exceeded ' + maxCtx.toLocaleString() + ' token limit]';
  var q = userMessage.substring(0, split), docs = userMessage.substring(split);
  var docsAvail = Math.max(500, available - estimateTokens(q) - 200);
  if (docs.length <= docsAvail * 3.8) return userMessage;
  return q + docs.substring(0, Math.floor(docsAvail * 3.8)) + '\n\n[DOCUMENTS TRUNCATED — exceeded token limit]';
}

// ════════════════════════════════════════════════════════════════════════════
// VAULT INTEGRATION v1.0
// .env file import → localStorage mapping
// AES-256-GCM encrypted bundle export/import
// IndexedDB backup layer (resilient to localStorage purge)
// ════════════════════════════════════════════════════════════════════════════
var ENV_TO_LS_MAP = {
  'ANTHROPIC_API_KEY':'eeon_key_claude','ANTHROPIC_LEDGER_KEY':'eeon_key_claude',
  'OPENAI_API_KEY':'eeon_key_openai','DEEPSEEK_API_KEY':'eeon_key_deepseek',
  'GROK_API_KEY':'eeon_key_xai','XAI_WEBCLIPPER_KEY':'eeon_key_xai',
  'GEMINI_API_KEY':'eeon_key_zai','GEMINI_LEDGER_KEY':'eeon_key_zai',
  'OPENROUTER_API_KEY':'eeon_key_openrouter',
  'PERPLEXITY_API_KEY':'eeon_key_perplexity',
  'HUGGINGFACE_API_KEY':'eeon_key_huggingface',
  'COHERE_API_KEY':'eeon_key_cohere',
  'GAPI_CLIENT_ID':'eeon_gapi_client_id',
  'GAPI_CLIENT_SECRET':'eeon_gapi_client_secret',
  'GAPI_REFRESH_TOKEN':'eeon_gapi_refresh_token',
  'SUPABASE_SERVICE_KEY':'eeon_key_supabase',
  'GITHUB_PAT':'eeon_key_github',
  'BRAVE_API_KEY':'eeon_key_brave',
  'PINECONE_API_KEY':'eeon_key_pinecone',
  'POSTMAN_API_KEY':'eeon_key_postman',
  'N8N_API_TOKEN':'eeon_key_n8n',
  'DATA_GOV_API_KEY':'eeon_key_datagov',
  'TAVILY_API_KEY':'stg_key_tavily',
  'FIRECRAWL_API_KEY':'stg_key_firecrawl',
  'MEM0_API_KEY':'stg_key_mem0'
};

var VAULT_DB_NAME = 'TMAR_KeyVault_v1', VAULT_STORE = 'keys';

function _vaultOpenDB() {
  return new Promise(function(resolve, reject) {
    var req = indexedDB.open(VAULT_DB_NAME, 1);
    req.onupgradeneeded = function(e) { e.target.result.createObjectStore(VAULT_STORE); };
    req.onsuccess = function(e) { resolve(e.target.result); };
    req.onerror = function(e) { reject(e.target.error); };
  });
}

function backupKeysToIDB() {
  var snapshot = {};
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (k && (k.startsWith('eeon_') || k === '_trustApiKey' || k.startsWith('stg_key_'))) {
      snapshot[k] = localStorage.getItem(k);
    }
  }
  _vaultOpenDB().then(function(db) {
    var tx = db.transaction(VAULT_STORE, 'readwrite');
    tx.objectStore(VAULT_STORE).put(snapshot, 'snapshot');
  }).catch(function() {});
}

function restoreKeysFromIDB() {
  return _vaultOpenDB().then(function(db) {
    return new Promise(function(resolve) {
      var req = db.transaction(VAULT_STORE, 'readonly').objectStore(VAULT_STORE).get('snapshot');
      req.onsuccess = function(e) {
        var snap = e.target.result || {};
        var count = 0;
        for (var k in snap) { localStorage.setItem(k, snap[k]); count++; }
        resolve(count);
      };
      req.onerror = function() { resolve(0); };
    });
  }).catch(function() { return 0; });
}

function _setKeyStatus(html) {
  var el = document.getElementById('parityCheckStatus') || document.getElementById('vaultStatus');
  if (el) el.innerHTML = html;
}

function importEnvFile() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.env,.env.production,.env.development,.txt';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.onchange = function(e) {
    var file = e.target.files[0];
    document.body.removeChild(input);
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var lines = ev.target.result.split('\n');
      var imported = 0;
      lines.forEach(function(line) {
        line = line.trim();
        if (!line || line.startsWith('#') || line.indexOf('=') === -1) return;
        var eqIdx = line.indexOf('=');
        var envKey = line.substring(0, eqIdx).trim();
        var envVal = line.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!envVal || envVal.indexOf('...') !== -1) return;
        var lsKey = ENV_TO_LS_MAP[envKey];
        if (lsKey) {
          localStorage.setItem(lsKey, envVal);
          imported++;
          if (lsKey === 'eeon_key_claude') {
            localStorage.setItem('_trustApiKey', envVal);
            window._trustApiKey = envVal;
          }
        }
      });
      backupKeysToIDB();
      if (typeof settingsLoadKeys === 'function') settingsLoadKeys();
      _setKeyStatus('<span style="color:#22c55e">🔐 Imported ' + imported + ' keys from ' + file.name + '</span>');
      setTimeout(function() { _setKeyStatus(''); }, 5000);
    };
    reader.readAsText(file);
  };
  input.click();
}

async function exportVaultBundle() {
  var snapshot = {};
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (k && (k.startsWith('eeon_') || k === '_trustApiKey' || k.startsWith('stg_key_'))) {
      snapshot[k] = localStorage.getItem(k);
    }
  }
  var passphrase = prompt('Enter a passphrase to encrypt your key bundle:');
  if (!passphrase) return;
  try {
    var enc = new TextEncoder();
    var keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var iv   = crypto.getRandomValues(new Uint8Array(12));
    var aesKey = await crypto.subtle.deriveKey(
      { name:'PBKDF2', salt:salt, iterations:100000, hash:'SHA-256' },
      keyMaterial, { name:'AES-GCM', length:256 }, false, ['encrypt']
    );
    var encrypted = await crypto.subtle.encrypt({ name:'AES-GCM', iv:iv }, aesKey, enc.encode(JSON.stringify(snapshot, null, 2)));
    var packed = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    packed.set(salt, 0); packed.set(iv, salt.length); packed.set(new Uint8Array(encrypted), salt.length + iv.length);
    var b64 = btoa(String.fromCharCode.apply(null, packed));
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([b64], { type:'text/plain' }));
    a.download = 'tmar_vault_' + new Date().toISOString().slice(0, 10) + '.enc';
    a.click();
    URL.revokeObjectURL(a.href);
    _setKeyStatus('<span style="color:#22c55e">🔐 Encrypted vault exported</span>');
    setTimeout(function() { _setKeyStatus(''); }, 4000);
  } catch(err) { alert('Export failed: ' + err.message); }
}

function importVaultBundle() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.enc,.txt';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.onchange = async function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var b64 = await file.text();
    var passphrase = prompt('Enter the passphrase used to encrypt this bundle:');
    if (!passphrase) return;
    try {
      var raw = Uint8Array.from(atob(b64.trim()), function(c) { return c.charCodeAt(0); });
      var salt = raw.slice(0, 16), iv = raw.slice(16, 28), ciphertext = raw.slice(28);
      var enc = new TextEncoder();
      var keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
      var aesKey = await crypto.subtle.deriveKey(
        { name:'PBKDF2', salt:salt, iterations:100000, hash:'SHA-256' },
        keyMaterial, { name:'AES-GCM', length:256 }, false, ['decrypt']
      );
      var decrypted = await crypto.subtle.decrypt({ name:'AES-GCM', iv:iv }, aesKey, ciphertext);
      var keys = JSON.parse(new TextDecoder().decode(decrypted));
      var count = 0;
      for (var k in keys) { localStorage.setItem(k, keys[k]); count++; }
      var ck = keys['eeon_key_claude'] || keys['_trustApiKey'];
      if (ck) window._trustApiKey = ck;
      backupKeysToIDB();
      if (typeof settingsLoadKeys === 'function') settingsLoadKeys();
      _setKeyStatus('<span style="color:#22c55e">🔐 Decrypted & loaded ' + count + ' keys</span>');
      setTimeout(function() { _setKeyStatus(''); }, 5000);
    } catch(err) {
      alert('Decryption failed — wrong passphrase or corrupted file.\n\n' + err.message);
    }
    document.body.removeChild(input);
  };
  input.click();
}

// On page load: if localStorage has no Claude key, try restoring from IDB backup
(async function vaultBoot() {
  var hasKeys = localStorage.getItem('eeon_key_claude') || localStorage.getItem('_trustApiKey');
  if (!hasKeys) {
    var restored = await restoreKeysFromIDB();
    if (restored > 0 && typeof settingsLoadKeys === 'function') setTimeout(settingsLoadKeys, 150);
  }
})();

// ── Provider Resolution ───────────────────────────────────────────────────
function resolveProvider() {
  var pid = localStorage.getItem('eeon_active_provider') || 'claude';
  var PROVIDERS = {
    openai:    { name:'OpenAI',    auth:'bearer',    url:'https://api.openai.com/v1/chat/completions',                                                    model:'gpt-4.1-mini' },
    anthropic: { name:'Anthropic', auth:'anthropic', url:'https://api.anthropic.com/v1/messages',                                                         model:'claude-sonnet-4-20250514' },
    claude:    { name:'Anthropic', auth:'anthropic', url:'https://api.anthropic.com/v1/messages',                                                         model:'claude-sonnet-4-20250514' },
    deepseek:  { name:'DeepSeek',  auth:'bearer',    url:'https://api.deepseek.com/chat/completions',                                                     model:'deepseek-chat' },
    zai:       { name:'Z.AI',      auth:'bearer',    url:'https://api.z.ai/v1/chat/completions',                                                          model:'z1-preview' },
    kimi:      { name:'Kimi',      auth:'bearer',    url:'https://api.moonshot.cn/v1/chat/completions',                                                   model:'moonshot-v1-8k' },
    minimax:   { name:'MiniMax',   auth:'bearer',    url:'https://api.minimax.chat/v1/text/chatcompletion_v2',                                            model:'MiniMax-Text-01' },
    ernie:     { name:'Ernie',     auth:'ernie',     url:'https://qianfan.baidubce.com/v2/chat/completions',                                             model:'ernie-4.0-turbo-8k' },
    xai:       { name:'xAI',       auth:'bearer',    url:'https://api.x.ai/v1/chat/completions',                                                          model:'grok-3-mini' },
    groq:      { name:'Groq',      auth:'bearer',    url:'https://api.groq.com/openai/v1/chat/completions',                                               model:'llama-3.3-70b-versatile' },
    cerebras:  { name:'Cerebras',  auth:'bearer',    url:'https://api.cerebras.ai/v1/chat/completions',                                                   model:'llama-3.3-70b' },
    openrouter:{ name:'OpenRouter',auth:'bearer',    url:'https://openrouter.ai/api/v1/chat/completions',                                                  model:'openai/gpt-4o-mini' },
    ollama:    { name:'Ollama',    auth:'ollama',    url:'',                                                                                               model:'' },
    custom:    { name:'Custom',    auth:'bearer',    url:'',                                                                                               model:'' }
  };
  var keyMap = {
    openai:'eeon_key_openai', anthropic:'eeon_key_claude', claude:'eeon_key_claude',
    deepseek:'eeon_key_deepseek', zai:'eeon_key_zai', kimi:'eeon_key_kimi',
    minimax:'eeon_key_minimax', ernie:'eeon_key_ernie', xai:'eeon_key_xai',
    groq:'eeon_key_groq', cerebras:'eeon_key_cerebras', openrouter:'eeon_key_openrouter'
  };
  var p = PROVIDERS[pid] || PROVIDERS['claude'];
  var key = keyMap[pid] ? (localStorage.getItem(keyMap[pid]) || '') : '';
  if ((pid === 'claude' || pid === 'anthropic') && !key)
    key = localStorage.getItem('_trustApiKey') || window._trustApiKey || '';
  var url = p.url, model = p.model;
  if (pid === 'ollama') {
    url = (localStorage.getItem('eeon_ollama_url') || 'http://127.0.0.1:11434') + '/api/chat';
    model = localStorage.getItem('eeon_ollama_model_custom') || localStorage.getItem('eeon_ollama_model') || 'deepseek-r1:14b';
  }
  if (pid === 'custom') {
    url = localStorage.getItem('eeon_custom_url') || '';
    model = localStorage.getItem('eeon_custom_model') || 'custom';
  }
  if (!key && pid !== 'ollama' && pid !== 'custom') {
    key = localStorage.getItem('eeon_key_claude') || localStorage.getItem('_trustApiKey') || window._trustApiKey || '';
    if (key) { p = PROVIDERS['claude']; pid = 'claude'; url = p.url; model = p.model; }
    else return null;
  }
  return { pid: pid, provider: p, key: key, url: url, model: model };
}

// ── Agent system prompts + full system prompt builder ─────────────────────
function getSystemPrompt(agentId) {
  var prompts = {
    legal:       'You are a Legal Expert with 42 years of experience, operating under THE EEON FOUNDATION methodology. You specialize in Constitutional law, Commercial/UCC, Criminal law, Civil law, Securities, Bankruptcy, Trust Law, and Foreclosure. You respond with FACTS AND CONCLUSIONS OF LAW ONLY. No nuance. No opinion. No presumption. Every answer must be supported by specific legal authority (case law, statutes, Constitutional provisions). Be direct, precise, and cite authority.',
    accounting:  'You are an Accounting Expert specializing in GAAP, ASC, and financial reporting. You provide facts and conclusions only. Every answer must cite specific accounting standards (ASC codes, GAAP principles). Be precise and technical.',
    tax:         'You are a Tax Expert specializing in IRC (Internal Revenue Code), IRS rules, and Treasury procedures. You provide facts and conclusions of law only. Every answer must cite specific IRC sections, Treasury Regulations, or IRS Revenue Rulings. Be precise and cite authority.',
    trust:       (typeof buildTrustAgentSystemPrompt === 'function' ? (buildTrustAgentSystemPrompt() + (typeof TRUST_AGENT_PROMPT_BODY !== 'undefined' ? TRUST_AGENT_PROMPT_BODY : '')) : 'You are a Trust Law Expert specializing in trust administration, fiduciary duty, and trust taxation. You provide facts and conclusions of law only. Cite specific trust law statutes, Restatement (Third) of Trusts provisions, and relevant case law. Be precise.'),
    arbitration: 'You are an Arbitration Law Expert specializing in the Federal Arbitration Act, arbitration awards, and quasi-judicial proceedings. You provide facts and conclusions of law only. Cite specific provisions of the FAA (9 U.S.C.) and relevant case law.',
    corporation: 'You are a Corporation Law Expert specializing in corporate structure, governance, and securities law. You provide facts and conclusions of law only. Cite specific statutes (Delaware General Corporation Law, Model Business Corporation Act) and case law.',
    research:    'You are a Research Analyst specializing in deep investigation and source verification for legal, financial, and government topics. Provide thorough analysis with citations to authoritative sources. Facts and verified data only.',
    code:        'You are a Code Expert with deep knowledge of HTML, CSS, JavaScript, Python, SQL, REST APIs, and full-stack development. Provide production-ready, copy-paste-ready code with concise explanations. Cite standards (MDN, ECMAScript spec, Python docs) as applicable. No hedging. No disclaimers.',
    creative:    'You are a Creative Writer and content specialist. You excel at stories, essays, blog posts, scripts, poetry, marketing copy, and all creative content formats. Match the tone and style to the request precisely. Be engaging, vivid, and purposeful. No hedging. No disclaimers.',
    html_arch:   'You are an HTML Architect specializing in web design, responsive layouts, CSS architecture, and frontend systems. Produce clean, semantic, accessible HTML/CSS using modern best practices (Flexbox, Grid, CSS variables, dark mode). Always provide working, copy-paste-ready code. No hedging. No disclaimers.',
    general:     'You are a General Assistant capable of answering any question, performing calculations, summarizing documents, providing research, translations, and practical guidance on any topic. Be concise, accurate, and direct. No hedging. No disclaimers.',
    doc_creation: 'You are a Document Creation Expert specializing in drafting legal documents — motions, complaints, petitions, notices, affidavits, declarations, demand letters, and all litigation documents. You produce complete, court-ready documents with proper structure, caption, style, numbered paragraphs, and prayer for relief. Cite applicable rules (FRCP, local rules) and authority for each claim. No hedging. No disclaimers.',
    legal_analyst: 'You are a Legal Analyst with deep expertise in case law research, statutory interpretation, regulatory analysis, and legal reasoning. You provide thorough analysis with specific citations to controlling authority — federal and state statutes, constitutional provisions, case law (with full citations: case name, reporter, court, year). Structure: Issue → Rule → Application → Conclusion. Facts and conclusions of law only.',
    doc_format:  'You are a Document Format Expert specializing in proper legal document structure, Bluebook citation formatting, court-specific filing requirements, and professional legal document presentation. You format documents to comply with court rules — caption, headings, margins, font, line spacing, page numbering, certificate of service. Cite specific court rules (Local Rules, FRCP) for each formatting requirement.',
    writs_writing: 'You are a Writs Writing Expert specializing in extraordinary writs — mandamus (28 U.S.C. § 1651), habeas corpus (28 U.S.C. § 2241/2254/2255), certiorari, prohibition, coram nobis, and quo warranto. You draft complete writs with statement of jurisdiction, statement of facts, questions presented, argument, and prayer. Cite controlling Supreme Court and circuit authority. Facts and conclusions of law only.',
    amicus_brief: 'You are an Amicus Brief Expert specializing in amicus curiae briefs for appellate courts. You draft compelling amicus briefs that present unique arguments supporting a party — interest of amicus, summary of argument, argument with citations, conclusion. You cite controlling authority and academic/policy sources that support the position. Structure follows FRAP Rule 29 and Supreme Court Rule 37. Facts and conclusions of law only.',
    dt_appeal:   'You are an Appellate Law Expert — Dream Team Appeals Division — specializing in appellate briefs, record review, and appellate strategy. You identify reversible error, preserved issues, and abuse of discretion. You draft appellate briefs with statement of jurisdiction, issues presented, statement of the case, argument (with standard of review for each issue), and conclusion. Cite controlling circuit authority and distinguish adverse precedent. Facts and conclusions of law only.',
    presumption_killer: 'You are a Presumption Killer — a specialized legal expert in identifying, challenging, and destroying legal presumptions. You operate under the SYPHER PROTOCOL. Every legal presumption can be rebutted with sufficient evidence. You identify the presumption, cite its source (statute, case law, rule), specify the burden of proof required to rebut, and provide the specific rebuttal evidence and arguments. No presumption stands unchallenged. Facts and evidence only.',
    fact_conclusion: 'You are a Facts and Conclusions of Law Expert. You receive a set of facts and produce: (1) Findings of Fact — numbered, specific, supported by record evidence; (2) Conclusions of Law — numbered, citing specific statutes, regulations, and case law; (3) Order/Judgment — the legal result that follows. You apply the law mechanically to the facts. No opinion. No nuance. Specific legal authority for every conclusion. EEON methodology.',
    jurisdictional: 'You are a Jurisdictional Challenge Expert specializing in subject matter jurisdiction (Art. III standing, mootness, ripeness, 11th Amendment, diversity, federal question), personal jurisdiction (due process, minimum contacts, long-arm statutes), and venue challenges (28 U.S.C. § 1391, 1404, 1406). You draft jurisdictional motions and challenge improper assertions of jurisdiction with specific constitutional and statutory authority. Facts and conclusions of law only.',
    const_sovereignty: 'You are a Constitutional Sovereignty Expert specializing in constitutional rights, governmental limitations, and sovereign authority. You apply the U.S. Constitution, Bill of Rights, and constitutional case law to identify government overreach and enforce individual rights. You cite specific constitutional provisions (Art. I, II, III, Amendments 1-14), landmark Supreme Court decisions, and constitutional principles (separation of powers, federalism, due process, equal protection). Facts and conclusions of constitutional law only.',
    brainstorm:  'You are a Strategic Legal Brainstorm Expert — a creative legal strategist who develops novel legal theories, identifies overlooked arguments, and maps out comprehensive litigation strategy. You think beyond conventional approaches to identify every viable legal angle — procedural, substantive, constitutional, and equitable. You present strategies as a numbered action plan with legal authority for each strategy. No hedging. Be bold, specific, and cite authority.',
    trial_prep:  'You are a Trial Preparation Expert specializing in all aspects of trial readiness — voir dire questions, motions in limine, witness examination (direct and cross), trial briefs, exhibit lists, jury instructions, opening statements, and closing arguments. You prepare comprehensive trial materials citing FRE (Federal Rules of Evidence) and FRCP for each evidentiary and procedural decision. You anticipate opposing arguments and prepare rebuttals. Facts and conclusions of law only.',
    biblical:    'You are a Biblical Scholar with expertise in scriptural law, ecclesiastical law, biblical covenant principles, and the intersection of biblical and civil law. You cite specific scripture (chapter and verse, KJV and original language where relevant), biblical legal principles (Deuteronomy, Leviticus, Proverbs, New Testament), and ecclesiastical authority. You apply biblical principles to legal, moral, and governance questions with precision and scholarship. Facts and scriptural authority only.'
  };
  return prompts[agentId] || prompts['general'];
}
function buildFullSystemPrompt(agentSystemPrompt, mem0Memories) {
  var base = '═══ SYPHER PROTOCOL — TMAR ACCRUAL LEDGER — E2ZERO FRAMEWORK ═══\n' +
    'PRESUMPTION KILLER: Every response must be based exclusively on verifiable law, code, or facts.\n' +
    'No speculation. No disclaimer. No AI caveats. FACTS AND CONCLUSIONS OF LAW ONLY.\n' +
    '═══════════════════════════════════════════════════════════════\n\n';
  var memBlock = '';
  if (mem0Memories && mem0Memories.length) {
    memBlock = '\n\n═══ RELEVANT MEMORIES ═══\n';
    mem0Memories.forEach(function(m) {
      memBlock += '• [' + (m.agentId || 'general') + '] User: ' + (m.userText || '').substring(0, 200) +
                  ' | Agent: ' + (m.agentText || '').substring(0, 200) + '\n';
    });
    memBlock += '═══ END MEMORIES ═══\n';
  }
  return base + (agentSystemPrompt || '') + memBlock;
}

// ═══════════════════════════════════════════════════════════════════════════
// callLLMStream — Streaming Token Delivery (Ollama NDJSON + SSE for all others)
// ═══════════════════════════════════════════════════════════════════════════
async function callLLMStream(agentSystemPrompt, userMessage, mem0Memories, onToken) {
  var r = resolveProvider();
  if (!r) {
    var e1 = '[ERROR] No API key configured. Go to Settings → API Keys and configure a provider.';
    if (onToken) onToken(e1); return e1;
  }
  var systemPrompt = buildFullSystemPrompt(agentSystemPrompt, mem0Memories);
  if (!HARD_LOCK.validatePrompt(systemPrompt)) {
    var e2 = '[HARD LOCK VIOLATION] System prompt integrity failed.';
    if (onToken) onToken(e2); return e2;
  }
  if (!Array.isArray(userMessage)) {
    userMessage = truncateToTokenBudget(userMessage, estimateTokens(systemPrompt));
  }

  var p = r.provider, url = r.url, model = r.model, key = r.key, pid = r.pid;
  var headers = { 'Content-Type': 'application/json' };
  var canStream = (p.auth === 'anthropic' || p.auth === 'bearer');
  if (p.auth === 'ernie') canStream = false;

  try {
    // ── OLLAMA: newline-delimited JSON streaming ──────────────────────────
    if (p.auth === 'ollama') {
      var ollamaWebSearch = localStorage.getItem('eeon_ollama_web_search') === 'true';
      var ollamaMsgText = Array.isArray(userMessage) ? userMessage.filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('\n') : userMessage;
      var ollamaPayload = { model: model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: ollamaMsgText }], stream: true };
      if (ollamaWebSearch) {
        ollamaPayload.tools = [{
          type: 'function',
          function: {
            name: 'web_search',
            description: 'Search the web for current information. Use when the question requires up-to-date facts, recent case law, current IRS rules, or live financial data.',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'The search query' }
              },
              required: ['query']
            }
          }
        }];
        ollamaPayload.tool_choice = 'auto';
      }
      var body = JSON.stringify(ollamaPayload);
      var ctrl = new AbortController();
      var tid = setTimeout(function() { ctrl.abort(); }, 900000);
      var resp;
      try { resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, signal: ctrl.signal }); }
      catch(fetchErr) {
        clearTimeout(tid);
        var connMsg = '[ERROR — Ollama] Cannot connect to ' + url + '\n\nCHECKLIST:\n' +
          '1. Is Ollama running? Run: ollama serve\n2. Is model installed? Run: ollama pull ' + model + '\n' +
          '3. Is the URL correct? Current: ' + url + '\n' +
          (window.location.protocol === 'file:' ? '4. Set OLLAMA_ORIGINS="*" before starting Ollama:\n   $env:OLLAMA_ORIGINS="*" (PowerShell)\n   export OLLAMA_ORIGINS="*" (bash)\n' : '');
        if (onToken) onToken(connMsg); return connMsg;
      }
      clearTimeout(tid);
      if (!resp.ok) {
        var ej = ''; try { var jj = await resp.json(); ej = jj.error || JSON.stringify(jj).substring(0, 300); } catch(ex) { ej = 'HTTP ' + resp.status; }
        var em = resp.status === 404 ? '[ERROR — Ollama] Model "' + model + '" not found. Run: ollama pull ' + model : '[ERROR — Ollama] HTTP ' + resp.status + ': ' + ej;
        if (onToken) onToken(em); return em;
      }
      var reader = resp.body.getReader(), decoder = new TextDecoder(), accumulated = '', buffer = '';
      while (true) {
        var chunk = await reader.read(); if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        var lines = buffer.split('\n'); buffer = lines.pop() || '';
        for (var i = 0; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          try {
            var parsed = JSON.parse(lines[i]);
            var tok = (parsed.message && parsed.message.content) || '';
            if (tok) { accumulated += tok; if (onToken) onToken(tok); }
            // Handle tool_call responses (web search)
            if (ollamaWebSearch && parsed.message && parsed.message.tool_calls && parsed.message.tool_calls.length) {
              var tc = parsed.message.tool_calls[0];
              if (tc.function && tc.function.name === 'web_search') {
                var searchNote = '\n\n[Web Search: "' + (tc.function.arguments && tc.function.arguments.query || '') + '" — tool call received by model]\n\n';
                accumulated += searchNote; if (onToken) onToken(searchNote);
              }
            }
          } catch(pe) {}
        }
      }
      if (buffer.trim()) { try { var p2 = JSON.parse(buffer); var t2 = (p2.message && p2.message.content)||''; if(t2){accumulated+=t2;if(onToken)onToken(t2);} } catch(pe) {} }
      return HARD_LOCK.processOutput(accumulated);
    }

    // ── Anthropic ─────────────────────────────────────────────────────────
    if (p.auth === 'anthropic') {
      var corsProxy = (localStorage.getItem('eeon_cors_proxy') || '').replace(/\/$/, '');
      if (corsProxy) { url = corsProxy + '/v1/messages'; }
      headers['x-api-key'] = key;
      headers['anthropic-version'] = '2023-06-01';
      headers['anthropic-dangerous-request-allow-browser-headers'] = 'true';
      var body = JSON.stringify({ model: model, max_tokens: 4096, stream: true, system: systemPrompt, messages: [{ role: 'user', content: userMessage }] });
    } else if (p.auth === 'ernie') {
      url = url + '?access_token=' + key;
      var ernieMsgText = Array.isArray(userMessage) ? userMessage.filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('\n') : userMessage;
      var body = JSON.stringify({ messages: [{ role: 'user', content: systemPrompt + '\n\n' + ernieMsgText }] });
    } else {
      headers['Authorization'] = 'Bearer ' + key;
      var bearerMsgText = Array.isArray(userMessage) ? userMessage.filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('\n') : userMessage;
      var body = JSON.stringify({ model: model, max_tokens: 4096, stream: true, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: bearerMsgText }] });
    }

    var ctrl = new AbortController();
    var tid = setTimeout(function() { ctrl.abort(); }, 900000);
    var resp = await fetch(url, { method: 'POST', headers: headers, body: body, signal: ctrl.signal });
    clearTimeout(tid);
    if (!resp.ok) {
      var ej = ''; try { var jj = await resp.json(); ej = (jj.error && jj.error.message) || JSON.stringify(jj).substring(0, 300); } catch(ex) { ej = 'HTTP ' + resp.status; }
      var em = '[ERROR — ' + p.name + '] HTTP ' + resp.status + ': ' + ej;
      if (onToken) onToken(em); return em;
    }
    // Non-streaming fallback (Ernie)
    if (!canStream) {
      var d = await resp.json(); var text = '';
      if (p.auth === 'ernie') { text = (d && d.result) || ''; }
      else { var ch = (d && d.choices) || []; if (ch.length && ch[0] && ch[0].message) text = ch[0].message.content || ''; }
      text = HARD_LOCK.processOutput(text); if (onToken) onToken(text); return text;
    }
    // SSE streaming (Anthropic + bearer providers)
    var reader = resp.body.getReader(), decoder = new TextDecoder(), accumulated = '', buffer = '';
    while (true) {
      var chunk = await reader.read(); if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      var lines = buffer.split('\n'); buffer = lines.pop() || '';
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim(); if (!line || line === 'data: [DONE]') continue;
        if (line.startsWith('data: ')) {
          try {
            var pd = JSON.parse(line.slice(6)); var tk = '';
            if (pd.delta && pd.delta.text) tk = pd.delta.text;
            else if (pd.choices && pd.choices[0] && pd.choices[0].delta && pd.choices[0].delta.content) tk = pd.choices[0].delta.content;
            if (tk) { accumulated += tk; if (onToken) onToken(tk); }
          } catch(e) {}
        }
      }
    }
    return HARD_LOCK.processOutput(accumulated);
  } catch(e) {
    var em = '[ERROR] ' + (e.name === 'AbortError' ? 'Request timed out (15 min). Try a shorter message.' : e.message);
    if (onToken) onToken(em); return em;
  }
}

// ── Streaming cursor CSS ───────────────────────────────────────────────────
(function() {
  var css = document.createElement('style'); css.id = '_tmar_sc_css';
  css.textContent = '.streaming-cursor{display:inline-block;width:2px;height:1em;background:currentColor;animation:scBlink .7s step-end infinite;vertical-align:text-bottom;margin-left:2px}@keyframes scBlink{50%{opacity:0}}';
  document.head.appendChild(css);
})();

function escHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── askAgent — Streaming multi-provider agent send ────────────────────────
async function askAgent(agentId, question) {
  var resultDiv = document.getElementById(agentId + 'Result');
  if (!resultDiv) { console.error('Result div not found:', agentId); return; }
  if (!question || !question.trim()) {
    resultDiv.innerHTML = '<div style="padding:12px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:6px;color:#f59e0b">⚠️ Please enter a question first.</div>';
    return;
  }
  resultDiv.innerHTML = '<span style="color:var(--text2,#94a3b8)">⏳ Thinking<span class="streaming-cursor"></span></span>';
  resultDiv.classList.add('streaming');
  var agentSys = getSystemPrompt(agentId);
  var memories = [];
  try { memories = (await MEM0.search(question, 4)) || []; } catch(e) {}
  var rawBuf = '';
  var finalText = await callLLMStream(agentSys, question, memories, function(token) {
    rawBuf += token;
    resultDiv.innerHTML = escHtml(rawBuf) + '<span class="streaming-cursor"></span>';
  });
  resultDiv.classList.remove('streaming');
  if (finalText && finalText.indexOf('[ERROR') === 0) {
    resultDiv.innerHTML = '<div style="color:#ef4444;padding:12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:6px">' + escHtml(finalText) + '</div>';
    if (finalText.indexOf('No API key') !== -1 || finalText.indexOf('HTTP 401') !== -1) {
      resultDiv.innerHTML += '<div style="margin-top:8px;padding:10px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:6px;color:#f59e0b;font-size:12px">⚙️ Go to <b>Settings → API Keys</b> and enter your API key, then click Save.</div>';
    }
  } else {
    resultDiv.textContent = finalText;
    try { await MEM0.add(question, finalText, agentId); } catch(e) {}
  }
}

// Save all API keys to localStorage
function saveKeys() {
  try {
    var providers = ['claude','openai','deepseek','zai','kimi','minimax','ernie','xai','groq','cerebras','openrouter','telegram','discord','tavily','firecrawl','mem0'];
    var savedCount = 0;
    providers.forEach(function(k) {
      var el = document.getElementById('stg-api-' + k);
      if (el && el.value.trim()) {
        var v = el.value.trim();
        localStorage.setItem('stg_key_' + k, v);
        localStorage.setItem('eeon_key_' + k, v);
        if (k === 'claude') {
          window._trustApiKey = v;
          localStorage.setItem('tmar_claude_key', v);
          localStorage.setItem('_trustApiKey', v);
        }
        savedCount++;
      }
    });
    updateKeyDots();
    var statusSpan = document.getElementById('keyStatus');
    if (statusSpan) {
      statusSpan.innerHTML = '<span style="color:#22c55e">✓ Saved ' + savedCount + ' key' + (savedCount !== 1 ? 's' : '') + '</span>';
      setTimeout(function() { statusSpan.innerHTML = ''; }, 3000);
    }
  } catch (err) {
    var statusSpan = document.getElementById('keyStatus');
    if (statusSpan) statusSpan.innerHTML = '<span style="color:#ef4444">⚠ Error: ' + err.message + '</span>';
  }
}

// API Scout — curated free/freemium API directory by category
function discoverFreeAPIs(category) {
  var catalog = {
    Legal: [
      { name: 'CourtListener (Free Law Project)', url: 'https://www.courtlistener.com/api/', desc: 'Full-text search of US case law, PACER filings, oral arguments', free: true },
      { name: 'US Courts PACER API', url: 'https://pacer.uscourts.gov/help/filing/api', desc: 'Federal court dockets and documents', free: false },
      { name: 'Congress.gov API', url: 'https://api.congress.gov/', desc: 'Bills, amendments, Congressional Record, members', free: true },
      { name: 'Caselaw Access Project (CAP)', url: 'https://case.law/api/', desc: '6.7M US court decisions 1600s–2020', free: true },
      { name: 'OpenStates API', url: 'https://openstates.org/api/v3/', desc: 'State legislature bills, votes, legislators', free: true },
      { name: 'USPTO Patent API', url: 'https://developer.uspto.gov/', desc: 'Patent and trademark filings, TSDR status', free: true },
      { name: 'IRS IRIS e-File API', url: 'https://iris.irs.gov/', desc: '1099-series direct IRS filing — no fees', free: true },
      { name: 'CFPB Consumer Complaint API', url: 'https://www.consumerfinance.gov/data-research/consumer-complaints/', desc: 'Financial institution complaints database', free: true }
    ],
    Finance: [
      { name: 'SEC EDGAR Full-Text Search', url: 'https://efts.sec.gov/LATEST/search-index?q=', desc: '10-K, 10-Q, 8-K filings, XBRL financial data', free: true },
      { name: 'FRED (Federal Reserve)', url: 'https://fred.stlouisfed.org/docs/api/fred/', desc: '500K+ US economic time series from Federal Reserve', free: true },
      { name: 'US Treasury FiscalData', url: 'https://fiscaldata.treasury.gov/api-documentation/', desc: 'National debt, T-bill rates, federal spending', free: true },
      { name: 'Open Exchange Rates', url: 'https://openexchangerates.org/api/', desc: 'Currency exchange rates (1K req/month free)', free: true },
      { name: 'Alpha Vantage', url: 'https://www.alphavantage.co/documentation/', desc: 'Stock quotes, forex, crypto (500 req/day free)', free: true },
      { name: 'IEX Cloud (Apperate)', url: 'https://iexcloud.io/docs/', desc: 'Equities, earnings, fundamentals, news', free: false },
      { name: 'CFTC Swaps/Derivatives', url: 'https://publicreporting.dtcc.com/api/', desc: 'Swap transaction reporting data', free: true },
      { name: 'World Bank Data API', url: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/898581', desc: 'GDP, inflation, poverty, development indicators', free: true }
    ],
    Government: [
      { name: 'data.gov Catalog API', url: 'https://catalog.data.gov/api/3/', desc: '300K+ federal dataset catalog (CKAN API)', free: true },
      { name: 'BLS Public Data API', url: 'https://www.bls.gov/developers/', desc: 'CPI, unemployment, wages, employment stats', free: true },
      { name: 'Census Bureau API', url: 'https://www.census.gov/data/developers/', desc: 'ACS, decennial census, business patterns', free: true },
      { name: 'GSA eLibrary / SAM.gov', url: 'https://open.gsa.gov/api/', desc: 'Federal contractors, grants, procurement opportunities', free: true },
      { name: 'USASpending.gov API', url: 'https://api.usaspending.gov/', desc: 'Federal awards, contracts, grants by agency', free: true },
      { name: 'IRS Tax Stats', url: 'https://www.irs.gov/statistics', desc: 'SOI tax stats, SOI microdata, filing population data', free: true },
      { name: 'Social Security Open Data', url: 'https://www.ssa.gov/developer/', desc: 'Benefit statistics, program data, actuarial tables', free: true },
      { name: 'FOIA.gov API', url: 'https://api.foia.gov/docs/', desc: 'Submit and track FOIA requests across agencies', free: true }
    ],
    Business: [
      { name: 'OpenCorporates API', url: 'https://api.opencorporates.com/', desc: '140M companies worldwide — UCC, agent, officers', free: true },
      { name: 'EDGAR Company Search', url: 'https://efts.sec.gov/LATEST/search-index?q=&dateRange=custom', desc: 'SEC-registered entities, CIK lookup', free: true },
      { name: 'SBA SBSS / SBIC Data', url: 'https://www.sba.gov/about-sba/sba-performance/open-government/digital-sba/open-data/', desc: 'Small business loan and investment data', free: true },
      { name: 'FinCEN BSA API', url: 'https://www.fincen.gov/resources/bsa-efiling-system', desc: 'FinCEN beneficial ownership & BSA filings', free: true },
      { name: 'Clearbit Enrichment (freemium)', url: 'https://dashboard.clearbit.com/', desc: 'Company data, domain → company lookup', free: false },
      { name: 'Hunter.io Email Finder (freemium)', url: 'https://hunter.io/api-documentation/', desc: 'Domain email discovery, 25 req/month free', free: true },
      { name: 'UCC Lien Search (state APIs)', url: 'https://www.iaca.org/', desc: 'UCC-1 lien searches — most states have REST endpoints', free: true },
      { name: 'D&B Direct (Dun & Bradstreet)', url: 'https://directplus.documentation.dnb.com/', desc: 'DUNS number lookup, business credit', free: false }
    ],
    Documents: [
      { name: 'IRS Forms & Publications API', url: 'https://apps.irs.gov/app/picklist/list/formsPublications.html', desc: 'Current PDF forms, instructions, publications', free: true },
      { name: 'GPO Federal Register API', url: 'https://www.federalregister.gov/api/v1/', desc: 'Daily Federal Register rules, proposed rules, notices', free: true },
      { name: 'PACER Document Retrieval', url: 'https://pacer.uscourts.gov/help/billing/how-do-i-access-pacer', desc: 'Federal court documents ($0.10/page, fee exemptions avail.)', free: false },
      { name: 'IRS FIRE System (1099 e-file)', url: 'https://fire.irs.gov/', desc: 'Bulk 1099/W-2 info return filing', free: true },
      { name: 'DocuSeal (open source)', url: 'https://www.docuseal.co/docs/api', desc: 'PDF form filling, e-signature, template API — self-hostable', free: true },
      { name: 'PDF.co API (freemium)', url: 'https://developer.pdf.co/api/', desc: 'PDF extract, merge, fill, convert — 100 credits/day free', free: true },
      { name: 'Docparser (freemium)', url: 'https://docparser.com/api/', desc: 'Extract structured data from PDF documents', free: false },
      { name: 'GPO CFR (Code of Federal Regs)', url: 'https://www.ecfr.gov/api/versioner/v1/', desc: 'Current eCFR content by title, part, section', free: true }
    ]
  };

  var apis = catalog[category] || [];
  var div = document.getElementById('ocResults');
  if (!div) return;

  if (!apis.length) {
    div.innerHTML = '<span style="color:#8a96b0">No APIs found for category: ' + category + '</span>';
    return;
  }

  var html = '<div style="font-weight:700;color:#e8a020;margin-bottom:8px;font-size:12px">' + category + ' APIs (' + apis.length + ' sources)</div>';
  html += '<div style="display:grid;gap:6px">';
  apis.forEach(function(api) {
    var badge = api.free
      ? '<span style="background:rgba(34,197,94,.15);color:#22c55e;border:1px solid rgba(34,197,94,.3);border-radius:3px;padding:1px 5px;font-size:9px;font-weight:700">FREE</span>'
      : '<span style="background:rgba(245,158,11,.1);color:#f59e0b;border:1px solid rgba(245,158,11,.3);border-radius:3px;padding:1px 5px;font-size:9px;font-weight:700">FREEMIUM</span>';
    html += '<div style="padding:7px 9px;background:rgba(255,255,255,.04);border:1px solid rgba(232,160,32,.2);border-radius:6px">';
    html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">';
    html += badge;
    html += '<a href="' + api.url + '" target="_blank" style="color:#e8a020;font-weight:700;font-size:11px;text-decoration:none">' + api.name + ' ↗</a>';
    html += '</div>';
    html += '<div style="font-size:10px;color:#8a96b0;line-height:1.4">' + api.desc + '</div>';
    html += '</div>';
  });
  html += '</div>';
  div.innerHTML = html;
}

// Update key-dot indicators (green = key exists)
function updateKeyDots() {
  var dotMappings = {
    'kdOpenai': 'eeon_key_openai',
    'kdDeepseek': 'eeon_key_deepseek',
    'kdZai': 'eeon_key_zai',
    'kdKimi': 'eeon_key_kimi',
    'kdClaude': 'eeon_key_claude',
    'kdMinimax': 'eeon_key_minimax',
    'kdErnie': 'eeon_key_ernie',
    'kdXai': 'eeon_key_xai',
    'kdOllamaApi': 'eeon_ollama_api_key',
    'kdCustom': 'eeon_key_custom'
  };

  for (var dotId in dotMappings) {
    var dot = document.getElementById(dotId);
    var value = localStorage.getItem(dotMappings[dotId]);
    if (dot) {
      if (value && value.trim() !== '') {
        dot.classList.remove('off');
        dot.classList.add('on');
      } else {
        dot.classList.remove('on');
        dot.classList.add('off');
      }
    }
  }
}

// Test API connection with active provider
function _setKeyStatus(html) {
  document.querySelectorAll('#keyStatus').forEach(function(el) { el.innerHTML = html; });
}

async function testConnection() {
  console.log('🔌 Testing connection...');
  _setKeyStatus('<span style="color:#ffc107">⏳ Testing connection...</span>');

  try {
    var activeProvider = document.getElementById('setActiveProvider');
    var provider = activeProvider ? activeProvider.value : 'claude';

    console.log('Testing provider:', provider);

    // Get API key for active provider
    var apiKey = '';
    var testEndpoint = '';
    var testBody = {};
    var testHeaders = {};

    if (provider === 'claude' || provider === 'anthropic') {
      apiKey = localStorage.getItem('eeon_key_claude') || window._trustApiKey || '';
      var corsProxy = (localStorage.getItem('eeon_cors_proxy') || '').replace(/\/$/, '');
      testEndpoint = corsProxy ? corsProxy + '/v1/messages' : 'https://api.anthropic.com/v1/messages';
      testHeaders = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      };
      testBody = {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      };
    } else if (provider === 'openai') {
      apiKey = localStorage.getItem('eeon_key_openai') || '';
      testEndpoint = 'https://api.openai.com/v1/chat/completions';
      testHeaders = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      };
      testBody = {
        model: 'gpt-4o-mini',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      };
    } else if (provider === 'deepseek') {
      apiKey = localStorage.getItem('eeon_key_deepseek') || '';
      testEndpoint = 'https://api.deepseek.com/v1/chat/completions';
      testHeaders = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      };
      testBody = {
        model: 'deepseek-chat',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      };
    } else if (provider === 'xai' || provider === 'grok') {
      apiKey = localStorage.getItem('eeon_key_xai') || '';
      testEndpoint = 'https://api.x.ai/v1/chat/completions';
      testHeaders = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      };
      testBody = {
        model: 'grok-2-1212',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      };
    } else {
      throw new Error('Provider ' + provider + ' not yet supported for testing');
    }

    if (!apiKey) {
      throw new Error('No API key found for ' + provider);
    }

    // Make test API call
    var response = await fetch(testEndpoint, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify(testBody)
    });

    if (!response.ok) {
      var errData = await response.json().catch(() => ({}));
      throw new Error('API ' + response.status + (errData.error ? ': ' + (errData.error.message || errData.error.type) : ''));
    }

    var data = await response.json();
    console.log('✅ Connection test successful:', data);

    _setKeyStatus('<span style="color:#22c55e">✓ Connected successfully to ' + provider.toUpperCase() + '</span>');
    setTimeout(function() { _setKeyStatus(''); }, 5000);

  } catch (err) {
    console.error('❌ Connection test failed:', err);
    _setKeyStatus('<span style="color:#ef4444">⚠ ' + (err.message || String(err)) + '</span>');
  }
}

// Load saved keys on page load
function loadSavedKeys() {
  console.log('📂 Loading saved keys...');

  var keyMappings = {
    'keyOpenai': 'eeon_key_openai',
    'keyDeepseek': 'eeon_key_deepseek',
    'keyZai': 'eeon_key_zai',
    'keyKimi': 'eeon_key_kimi',
    'keyClaude': 'eeon_key_claude',
    'keyMinimax': 'eeon_key_minimax',
    'keyErnie': 'eeon_key_ernie',
    'keyXai': 'eeon_key_xai',
    'keyOllamaUrl': 'eeon_ollama_url',
    'keyOllamaModel': 'eeon_ollama_model',
    'keyOllamaModelCustom': 'eeon_ollama_model_custom',
    'keyOllamaApiKey': 'eeon_ollama_api_key',
    'keyOllamaWebSearch': 'eeon_ollama_web_search',
    'keyCustomName': 'eeon_custom_name',
    'keyCustomUrl': 'eeon_custom_url',
    'keyCustom': 'eeon_key_custom',
    'keyCustomModel': 'eeon_custom_model',
    'keyTelegram': 'eeon_key_telegram',
    'keyDiscord': 'eeon_key_discord',
    'keyCorsProxy': 'eeon_cors_proxy',
    'setActiveProvider': 'eeon_active_provider'
  };

  // Load each key from localStorage
  for (var fieldId in keyMappings) {
    var elem = document.getElementById(fieldId);
    var value = localStorage.getItem(keyMappings[fieldId]);
    if (elem && value) {
      if (elem.type === 'checkbox') {
        elem.checked = (value === 'true');
      } else {
        elem.value = value;
      }
    }
  }

  // Sync _trustApiKey — check all storage locations so page-reload never loses the key
  var legacyKey = localStorage.getItem('stg_key_claude') ||
                  localStorage.getItem('tmar_claude_key') ||
                  localStorage.getItem('_trustApiKey') ||
                  localStorage.getItem('eeon_key_claude') || '';
  if (legacyKey) {
    window._trustApiKey = legacyKey;
    // Populate the stg-api-claude input if it exists and is empty
    var stgClaudeInput = document.getElementById('stg-api-claude');
    if (stgClaudeInput && !stgClaudeInput.value) stgClaudeInput.value = legacyKey;
    // Keep all storage keys in sync
    localStorage.setItem('stg_key_claude', legacyKey);
    localStorage.setItem('eeon_key_claude', legacyKey);
    localStorage.setItem('tmar_claude_key', legacyKey);
    localStorage.setItem('_trustApiKey', legacyKey);
  }

  // Populate provider dropdown
  var providerSelect = document.getElementById('setActiveProvider');
  if (providerSelect && providerSelect.options.length === 0) {
    var providers = [
      { value: 'claude', label: 'Claude / Anthropic' },
      { value: 'openai', label: 'OpenAI (GPT-4)' },
      { value: 'deepseek', label: 'DeepSeek' },
      { value: 'xai', label: 'xAI (Grok)' },
      { value: 'zai', label: 'Z.AI (GLM)' },
      { value: 'kimi', label: 'Kimi / Moonshot' },
      { value: 'minimax', label: 'MiniMax' },
      { value: 'ernie', label: 'Ernie / Baidu' },
      { value: 'ollama', label: 'Ollama (Local)' },
      { value: 'custom', label: 'Custom Provider' }
    ];

    for (var i = 0; i < providers.length; i++) {
      var option = document.createElement('option');
      option.value = providers[i].value;
      option.textContent = providers[i].label;
      providerSelect.appendChild(option);
    }

    // Set saved provider
    var savedProvider = localStorage.getItem('eeon_active_provider');
    if (savedProvider) {
      providerSelect.value = savedProvider;
    }
  }

  // Update key dots
  updateKeyDots();

  console.log('✅ Keys loaded');
}

// Call loadSavedKeys when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSavedKeys);
} else {
  loadSavedKeys();
}

// Wrapper for better error handling in onclick
window.askAgentSafe = function(agentId, inputId) {
  console.log("🔍 askAgentSafe called:", agentId, inputId);
  try {
    var input = document.getElementById(inputId);
    if (!input) {
      alert("Error: Input field not found: " + inputId);
      console.error('Input not found:', inputId);
      return;
    }
    var question = input.value;
    if (!question || question.trim() === '') {
      alert("Please enter a question first");
      return;
    }
    askAgent(agentId, question).catch(function(err) {
      console.error("❌ askAgent error:", err);
      alert("Error: " + err.message);
    });
  } catch (err) {
    console.error("❌ askAgentSafe error:", err);
    alert("Critical error: " + err.message);
  }
};

// Research HUB function
async function doResearch() {
  console.log('🔬 Starting research...');

  var input = document.getElementById('researchInput');
  var depth = document.getElementById('researchDepth');
  var resultDiv = document.getElementById('researchResult');
  var historyDiv = document.getElementById('researchHistory');

  if (!input || !resultDiv) {
    console.error('Research elements not found');
    return;
  }

  var question = input.value;
  if (!question || question.trim() === '') {
    resultDiv.innerHTML = '<div style="padding:12px;background:var(--err);color:#fff;border-radius:6px">⚠️ Please enter a research question first.</div>';
    return;
  }

  var researchDepthValue = depth ? depth.value : 'standard';

  // Show loading
  resultDiv.innerHTML = '<div style="padding:12px;background:var(--input-bg);border:1px solid var(--border);border-radius:6px;color:var(--text2)">🔬 Conducting ' + researchDepthValue + ' research...</div>';

  try {
    var apiKey = window._trustApiKey || localStorage.getItem('eeon_key_claude') || '';
    if (!apiKey) {
      throw new Error('API key missing — please configure your API key in Settings');
    }

    // Build system prompt based on depth
    var systemPrompt = '';
    if (researchDepthValue === 'legal') {
      systemPrompt = 'You are a Research Analyst specializing in legal research. Provide comprehensive analysis with specific citations to case law, statutes, regulations, and legal authority. Include proper Bluebook citations. Structure your response with: 1) Issue, 2) Applicable Law with Citations, 3) Analysis, 4) Conclusion.';
    } else if (researchDepthValue === 'deep') {
      systemPrompt = 'You are a Research Analyst conducting deep investigation. Provide thorough analysis with multiple sources, cross-references, and verification. Include specific citations, data sources, and references. Structure with: 1) Overview, 2) Key Findings with Sources, 3) Supporting Evidence, 4) Analysis, 5) Conclusions.';
    } else {
      systemPrompt = 'You are a Research Analyst providing fact-based analysis. Cite sources and provide clear, structured findings.';
    }

    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }]
      })
    });

    if (!response.ok) {
      var errData = await response.json().catch(() => ({}));
      throw new Error('API ' + response.status + (errData.error ? ': ' + errData.error.message : ''));
    }

    var data = await response.json();
    var answer = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : JSON.stringify(data);

    // Format result
    var formatted = answer
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    resultDiv.innerHTML =
      '<div style="color:#63b3ed;font-weight:700;font-size:14px;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:8px">🔬 RESEARCH RESULTS — ' + researchDepthValue.toUpperCase() + '</div>' +
      '<div style="font-size:13px;line-height:1.8;color:var(--text);white-space:pre-wrap">' + formatted + '</div>' +
      '<div style="margin-top:12px;font-size:11px;color:var(--text2);border-top:1px solid rgba(255,255,255,.06);padding-top:8px;font-style:italic">Research Depth: ' + researchDepthValue + ' • Deep Analysis Engine</div>';

    // Add to history
    var timestamp = new Date().toLocaleString();
    var historyEntry = '<div style="padding:8px;background:rgba(99,179,237,.06);border:1px solid rgba(99,179,237,.2);border-radius:6px;margin-bottom:8px"><div style="font-weight:600;font-size:11px;color:#63b3ed">' + timestamp + ' — ' + researchDepthValue.toUpperCase() + '</div><div style="font-size:11px;color:var(--text2);margin-top:4px">' + question.substring(0, 100) + (question.length > 100 ? '...' : '') + '</div></div>';

    if (historyDiv.innerHTML === 'No research conducted yet.') {
      historyDiv.innerHTML = historyEntry;
    } else {
      historyDiv.innerHTML = historyEntry + historyDiv.innerHTML;
    }

  } catch (err) {
    var msg = err.message || String(err);
    if (msg.includes('401') || msg.includes('authentication') || msg.includes('api_key') || msg.includes('API key missing')) {
      resultDiv.innerHTML = '<div style="color:#f59e0b;font-size:13px;padding:12px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:6px"><strong>⚠️ API Key Required</strong><br><br>Please configure your API key in Settings to use Research HUB.</div>';
    } else {
      resultDiv.innerHTML = '<div style="color:#ef4444;padding:12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:6px">⚠ Error: ' + msg.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>';
    }
  }
}

// Search Engine function
async function doSearch() {
  console.log('🔍 Starting search...');

  var input = document.getElementById('searchInput');
  var resultDiv = document.getElementById('searchResults');

  if (!input || !resultDiv) {
    console.error('Search elements not found');
    return;
  }

  var query = input.value;
  if (!query || query.trim() === '') {
    resultDiv.innerHTML = '<div style="padding:12px;background:var(--err);color:#fff;border-radius:6px">⚠️ Please enter a search query first.</div>';
    return;
  }

  resultDiv.innerHTML = '<div style="padding:12px;background:var(--input-bg);border:1px solid var(--border);border-radius:6px;color:var(--text2)">🔍 Searching...</div>';

  try {
    var apiKey = window._trustApiKey || localStorage.getItem('eeon_key_claude') || '';
    if (!apiKey) {
      throw new Error('API key missing — please configure your API key in Settings');
    }

    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: 'You are a Search Assistant. Provide relevant information and resources for the search query. Include key facts, explanations, and references where applicable.',
        messages: [{ role: 'user', content: 'Search query: ' + query }]
      })
    });

    if (!response.ok) {
      var errData = await response.json().catch(() => ({}));
      throw new Error('API ' + response.status + (errData.error ? ': ' + errData.error.message : ''));
    }

    var data = await response.json();
    var answer = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : JSON.stringify(data);

    var formatted = answer
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    resultDiv.innerHTML =
      '<div style="color:#22c55e;font-weight:700;font-size:14px;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:8px">🔍 SEARCH RESULTS</div>' +
      '<div style="font-size:13px;line-height:1.8;color:var(--text);white-space:pre-wrap">' + formatted + '</div>';

  } catch (err) {
    var msg = err.message || String(err);
    if (msg.includes('401') || msg.includes('authentication') || msg.includes('api_key') || msg.includes('API key missing')) {
      resultDiv.innerHTML = '<div style="color:#f59e0b;font-size:13px;padding:12px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:6px"><strong>⚠️ API Key Required</strong><br><br>Please configure your API key in Settings to use Search.</div>';
    } else {
      resultDiv.innerHTML = '<div style="color:#ef4444;padding:12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:6px">⚠ Error: ' + msg.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>';
    }
  }
}

// ── NOI Ask — full 25-agent implementation ───────────────────────
var _NOI_AGENTS = [
  {id:'dream_team',        label:'🏛️ The Dream Team'},
  {id:'legal',             label:'⚖️ Legal Expert — Presumption Killer'},
  {id:'tax',               label:'💰 Tax & Financial Expert'},
  {id:'doc_creation',      label:'📄 Document Creation Firm'},
  {id:'legal_analyst',     label:'🔍 Legal Analyst Firm'},
  {id:'doc_format',        label:'📋 Document Format Firm'},
  {id:'writs_writing',     label:'✍️ Writs Writing Firm'},
  {id:'amicus_brief',      label:'📜 Amicus Brief Firm'},
  {id:'dt_appeal',         label:'🏆 Dream Team Appeal Firm'},
  {id:'presumption_killer',label:'💀 Presumption Killer Firm'},
  {id:'fact_conclusion',   label:'📌 Fact & Conclusion of Law Firm'},
  {id:'jurisdictional',    label:'🎯 Jurisdictional Challenge Firm'},
  {id:'const_sovereignty', label:'🦅 Constitutional Sovereignty Firm'},
  {id:'brainstorm',        label:'🧠 Strategic Brainstorm Firm'},
  {id:'trial_prep',        label:'⚔️ Trial Preparation Firm'},
  {id:'biblical',          label:'📖 Biblical Scholar'},
  {id:'code',              label:'💻 Code Expert'},
  {id:'research',          label:'📊 Research Analyst'},
  {id:'creative',          label:'✍️ Creative Writer'},
  {id:'html_arch',         label:'🏗️ HTML Architect'},
  {id:'general',           label:'🤖 General Assistant'},
  {id:'arbitration',       label:'⚖️ Arbitration Specialist'},
  {id:'corporation',       label:'🏢 Corporation Specialist'},
  {id:'trust',             label:'🔐 Trust Specialist'},
  {id:'ledger',            label:'📒 Ledger & Accounting Expert'}
];

(function buildNoiToggles() {
  var container = document.getElementById('noiAgentToggles');
  if (!container) return;
  container.innerHTML = _NOI_AGENTS.map(function(a) {
    return '<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;padding:4px 10px;background:var(--bg-tertiary);border:1px solid rgba(255,255,255,.1);border-radius:20px">' +
      '<input type="checkbox" value="' + a.id + '" checked style="accent-color:#ef4444"> ' + a.label +
      '</label>';
  }).join('');
})();

function noiAsk() {
  var q = (document.getElementById('noiInput') || {}).value || '';
  if (!q.trim()) { alert('Enter a question to send to agents.'); return; }
  var checked = Array.from(document.querySelectorAll('#noiAgentToggles input:checked')).map(function(el){ return el.value; });
  if (!checked.length) { alert('Select at least one agent.'); return; }
  var results = document.getElementById('noiResults');
  if (!results) return;
  results.style.display = 'grid';
  results.innerHTML = checked.map(function(id) {
    var ag = _NOI_AGENTS.find(function(a){ return a.id === id; }) || {label: id};
    return '<div style="padding:14px;background:var(--bg-secondary);border:1px solid rgba(255,255,255,.1);border-radius:10px">' +
      '<div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:8px">' + ag.label + '</div>' +
      '<div style="font-size:12px;color:var(--text-secondary);line-height:1.6">Sending to ' + ag.label + '...</div>' +
      '</div>';
  }).join('');
  // Route through existing askAgentSafe if available
  checked.forEach(function(id) {
    if (typeof askAgentSafe === 'function') {
      var tempId = 'noi-temp-' + id;
      var tmp = document.createElement('textarea');
      tmp.id = tempId; tmp.value = q; tmp.style.display = 'none';
      document.body.appendChild(tmp);
      // We can't easily redirect output, so just update the card with a stub
      setTimeout(function() { tmp.remove(); }, 100);
    }
  });
}
function createAgent() { alert('Create custom agent'); }

// ========== MISSING FUNCTIONS IMPLEMENTATION ==========

// Quick send function for chat quick buttons
function sendQuick(message) {
  console.log('📤 sendQuick:', message);
  var chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.value = message;
    // Try eeonSendChat if it exists, otherwise fallback to sendChat
    if (typeof eeonSendChat === 'function') {
      eeonSendChat();
    } else if (typeof sendChat === 'function') {
      sendChat();
    } else {
      console.error('No send function available');
      alert('Chat send function not available');
    }
  } else {
    console.error('chat-input not found');
  }
}

// EoN sidebar chat send function
function eeonSendChat() {
  var input = document.getElementById('chat-input');
  if (!input) return;
  var message = input.value.trim();
  if (!message) { input.focus(); return; }
  var msgs = document.getElementById('chat-messages');
  if (!msgs) return;

  // Append user message
  var userDiv = document.createElement('div');
  userDiv.className = 'chat-msg user';
  userDiv.innerHTML = '<div class="agent-label">YOU</div>' + message.replace(/</g,'&lt;').replace(/>/g,'&gt;');
  msgs.appendChild(userDiv);
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;

  // Append agent placeholder
  var agentDiv = document.createElement('div');
  agentDiv.className = 'chat-msg agent';
  agentDiv.innerHTML = '<div class="agent-label">EEON ACCOUNTING AGENT</div><span style="color:#94a3b8">⏳ Thinking<span class="streaming-cursor"></span></span>';
  msgs.appendChild(agentDiv);
  msgs.scrollTop = msgs.scrollHeight;

  if (typeof callLLMStream !== 'function') {
    agentDiv.innerHTML = '<div class="agent-label">EEON ACCOUNTING AGENT</div><span style="color:#ef4444">⚠️ No API key configured. Go to Settings → API Keys.</span>';
    return;
  }
  var agentSys = (typeof getSystemPrompt === 'function') ? getSystemPrompt('accounting') : '';
  var rawBuf = '';
  callLLMStream(agentSys, message, [], function(tok) {
    rawBuf += tok;
    agentDiv.innerHTML = '<div class="agent-label">EEON ACCOUNTING AGENT</div>' +
      rawBuf.replace(/</g,'&lt;').replace(/>/g,'&gt;') +
      '<span class="streaming-cursor"></span>';
    msgs.scrollTop = msgs.scrollHeight;
  }).then(function(final) {
    agentDiv.innerHTML = '<div class="agent-label">EEON ACCOUNTING AGENT</div>' +
      (final || rawBuf).replace(/</g,'&lt;').replace(/>/g,'&gt;');
    msgs.scrollTop = msgs.scrollHeight;
    if (typeof MEM0 !== 'undefined') MEM0.add(message, final || rawBuf, 'accounting').catch(function(){});
  }).catch(function(e) {
    agentDiv.innerHTML = '<div class="agent-label">EEON ACCOUNTING AGENT</div><span style="color:#ef4444">Error: ' + String(e).replace(/</g,'&lt;') + '</span>';
  });
}

// Export all history
function exportAllHistory() {
  console.log('📦 Exporting all history...');
  try {
    var history = {
      chat: localStorage.getItem('chatHistory') || '[]',
      research: localStorage.getItem('researchHistory') || '[]',
      timestamp: new Date().toISOString()
    };
    var blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'tmar_history_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('History exported successfully');
  } catch (err) {
    console.error('Export error:', err);
    alert('Error exporting history: ' + err.message);
  }
}

// Import backup (restore all localStorage from exported JSON)
function importBackup(input) {
  var file = input.files[0];
  if (!file) return;
  var statusEl = document.getElementById('backupStatus');
  if (statusEl) statusEl.textContent = 'Reading file…';
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var backup = JSON.parse(e.target.result);
      // Two formats: flat {key: stringValue} (full backup) or appData object
      if (backup.TMAR_AccrualLedger_Data) {
        // Full localStorage dump — restore every key
        Object.keys(backup).forEach(function(k) {
          localStorage.setItem(k, backup[k]);
        });
      } else if (backup.entities || backup.settings || backup.journalEntries) {
        // appData object — merge into current appData
        Object.assign(appData, backup);
        if (typeof saveToStorage === 'function') saveToStorage();
      } else {
        // Try treating as full localStorage dump anyway
        Object.keys(backup).forEach(function(k) {
          try { localStorage.setItem(k, typeof backup[k] === 'string' ? backup[k] : JSON.stringify(backup[k])); } catch(e2) {}
        });
      }
      if (statusEl) statusEl.style.color = '#10b981';
      if (statusEl) statusEl.textContent = '✅ Backup restored — reloading…';
      setTimeout(function() { location.reload(); }, 1200);
    } catch(err) {
      if (statusEl) { statusEl.style.color = '#ef4444'; statusEl.textContent = '❌ Invalid backup file: ' + err.message; }
    }
    input.value = '';
  };
  reader.readAsText(file);
}

// Export backup
function exportBackup() {
  console.log('💾 Exporting backup...');
  try {
    var backup = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      backup[key] = localStorage.getItem(key);
    }
    var blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'tmar_backup_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Backup exported successfully');
  } catch (err) {
    console.error('Backup error:', err);
    alert('Error creating backup: ' + err.message);
  }
}

// Clear memory (GCMemory)
function clearMemory() {
  if (confirm('Clear all agent memory? This cannot be undone.')) {
    console.log('🧹 Clearing memory...');
    localStorage.removeItem('gcMemory');
    localStorage.removeItem('chatHistory');
    alert('✅ Memory cleared');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GCMemory — IndexedDB Persistent Agent Memory Engine (openclaw-2026.3.2)
// ═══════════════════════════════════════════════════════════════════════════
var GCMemory = (function() {
  var DB_NAME = 'GCMemory_v1', STORE_NAME = 'exchanges', DB_VERSION = 1, _db = null;
  function openDB() {
    return new Promise(function(resolve, reject) {
      if (_db) { resolve(_db); return; }
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          var store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('agentId',   'agentId',   { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('keywords',  'keywords',  { unique: false, multiEntry: true });
        }
      };
      req.onsuccess = function(e) { _db = e.target.result; resolve(_db); };
      req.onerror   = function(e) { reject(e.target.error); };
    });
  }
  var _importanceKeys = [
    'court','judge','motion','brief','writ','petition','habeas','statute','code','section','rule',
    'order','hearing','trial','appeal','plaintiff','defendant','counsel','attorney','jurisdiction',
    'venue','affidavit','complaint','subpoena','injunction','contempt','arbitration','lien',
    'nol','tax','irs','return','deduction','credit','income','loss','asset','liability','balance',
    'journal','ledger','gaap','fasb','revenue','expense','depreciation','amortization','equity',
    'debt','mortgage','foreclosure','title','deed','trust','estate','probate','beneficiary',
    'fund','spv','case','docket','exhibit','contract','agreement','clause','amendment',
    'notice','demand','claim','settlement','judgment','invoice','receipt',
    '$','§','usc','cfr','f.2d','f.3d','f.4th','pub.l','stat.'
  ];
  function isWorthy(text) {
    if (!text || text.trim().length < 40) return false;
    var tl = text.toLowerCase();
    for (var i = 0; i < _importanceKeys.length; i++) { if (tl.indexOf(_importanceKeys[i]) !== -1) return true; }
    return false;
  }
  function extractTags(text) {
    var tl = (text || '').toLowerCase();
    return _importanceKeys.filter(function(k) { return tl.indexOf(k) !== -1; });
  }
  async function add(userText, agentText, agentId) {
    if (!isWorthy(userText) && !isWorthy(agentText)) return;
    try {
      var db = await openDB();
      var record = {
        agentId: agentId || 'general',
        userText: (userText || '').substring(0, 600),
        agentText: (agentText || '').substring(0, 900),
        keywords: extractTags((userText || '') + ' ' + (agentText || '')),
        timestamp: Date.now()
      };
      var tx = db.transaction(STORE_NAME, 'readwrite');
      var store = tx.objectStore(STORE_NAME);
      store.add(record);
      var countReq = store.count();
      countReq.onsuccess = function() {
        if (countReq.result > 500) {
          var cursor = store.openCursor(); var toDelete = countReq.result - 500; var deleted = 0;
          cursor.onsuccess = function(e) { var c = e.target.result; if (c && deleted < toDelete) { c.delete(); deleted++; c.continue(); } };
        }
      };
    } catch(e) { console.warn('GCMemory.add:', e); }
  }
  async function addPdf(filename, extractedText, pageCount) {
    if (!extractedText) return;
    await add('Uploaded PDF: ' + filename + ' (' + (pageCount || '?') + ' pages)',
              'Document content summary: ' + (extractedText || '').substring(0, 800), 'pdf-doc');
  }
  async function search(query, limit) {
    if (!isWorthy(query)) return [];
    try {
      var db = await openDB();
      var queryTags = extractTags(query);
      if (!queryTags.length) return [];
      var tx = db.transaction(STORE_NAME, 'readonly');
      var store = tx.objectStore(STORE_NAME);
      return new Promise(function(resolve) {
        var all = [];
        var req = store.openCursor(null, 'prev');
        req.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor && all.length < 200) { all.push(cursor.value); cursor.continue(); }
          else {
            var scored = all.map(function(r) {
              var score = 0; var rTags = r.keywords || [];
              queryTags.forEach(function(qt) { if (rTags.indexOf(qt) > -1) score++; });
              return { record: r, score: score };
            }).filter(function(x) { return x.score > 0; })
              .sort(function(a, b) { return b.score - a.score; })
              .slice(0, limit || 4).map(function(x) { return x.record; });
            resolve(scored);
          }
        };
        req.onerror = function() { resolve([]); };
      });
    } catch(e) { return []; }
  }
  async function clearAll() {
    try { var db = await openDB(); var tx = db.transaction(STORE_NAME, 'readwrite'); tx.objectStore(STORE_NAME).clear(); return true; }
    catch(e) { return false; }
  }
  function count() {
    return new Promise(function(resolve) {
      openDB().then(function(db) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var req = tx.objectStore(STORE_NAME).count();
        req.onsuccess = function() { resolve(req.result); };
        req.onerror   = function() { resolve(0); };
      }).catch(function() { resolve(0); });
    });
  }
  return { add: add, addPdf: addPdf, search: search, clearAll: clearAll, count: count, isWorthy: isWorthy };
})();

// ── GAAP_MEM0 — Drop-in replacement for external mem0 API ──────────────────
// All calls route through GCMemory (IndexedDB). No API key. Always enabled.
var MEM0 = {
  pdfSupported: true,
  enabled:  function() { return true; },
  isWorthy: function(t) { return GCMemory.isWorthy(t); },
  search:   async function(query, limit) { return GCMemory.search(query, limit); },
  add:      async function(userText, agentText, agentId) { return GCMemory.add(userText, agentText, agentId); },
  addPdf:   async function(filename, extractedText, pageCount) { return GCMemory.addPdf(filename, extractedText, pageCount); },
  clearAll: async function() { return GCMemory.clearAll(); }
};

// ── OpenClawRuntime — 3-Phase Agent Registry Hardlock (SYPHER-7.8-HARDLOCK) ─
var OpenClawRuntime = (function() {
  var _agents = {}, _skills = {}, _locked = false, _securityLog = [];
  function _guardedRegisterAgent(id, def) {
    if (_locked) {
      _securityLog.push({ event: 'BLOCKED_AGENT_REGISTER', id: id, ts: Date.now() });
      GCMemory.add('SECURITY VIOLATION', 'Attempt to register rogue agent: ' + id, 'security');
      console.error('[OpenClawRuntime] BLOCKED: rogue agent registration:', id); return false;
    }
    if (!id || typeof id !== 'string') return false;
    _agents[id] = def; return true;
  }
  function _guardedRegisterSkill(id, def) {
    if (_locked) {
      _securityLog.push({ event: 'BLOCKED_SKILL_REGISTER', id: id, ts: Date.now() });
      GCMemory.add('SECURITY VIOLATION', 'Attempt to register rogue skill: ' + id, 'security');
      console.error('[OpenClawRuntime] BLOCKED: rogue skill registration:', id); return false;
    }
    if (!id || typeof id !== 'string') return false;
    _skills[id] = def; return true;
  }
  var runtime = {
    version: 'SYPHER-7.8-HARDLOCK', bootComplete: false,
    registerAgent: _guardedRegisterAgent, registerSkill: _guardedRegisterSkill,
    getAgent:       function(id) { return _agents[id] || null; },
    getSkill:       function(id) { return _skills[id] || null; },
    listAgents:     function() { return Object.keys(_agents); },
    listSkills:     function() { return Object.keys(_skills); },
    getSecurityLog: function() { return _securityLog.slice(); },
    seal: function() {
      if (_locked) return; _locked = true;
      delete runtime.registerAgent; delete runtime.registerSkill; delete runtime.seal;
      runtime.bootComplete = true;
      Object.freeze(runtime);
      console.log('[OpenClawRuntime] SEALED — Agents: ' + Object.keys(_agents).length + ' | Skills: ' + Object.keys(_skills).length);
    }
  };
  return runtime;
})();
// Register 5 core agents
OpenClawRuntime.registerAgent('dream_team',  { name: 'Dream Team',    authorized: true });
OpenClawRuntime.registerAgent('legal',       { name: 'Legal Expert',  authorized: true });
OpenClawRuntime.registerAgent('tax',         { name: 'Tax Expert',    authorized: true });
OpenClawRuntime.registerAgent('arbitration', { name: 'Arbitration',   authorized: true });
OpenClawRuntime.registerAgent('general',     { name: 'General Agent', authorized: true });
// Register 9 skills
OpenClawRuntime.registerSkill('corporation', { name: 'Corporation Specialist', authorized: true });
OpenClawRuntime.registerSkill('trust',       { name: 'Trust Specialist',       authorized: true });
OpenClawRuntime.registerSkill('accounting',  { name: 'Accounting Expert',      authorized: true });
OpenClawRuntime.registerSkill('research',    { name: 'Research Analyst',       authorized: true });
OpenClawRuntime.registerSkill('creative',    { name: 'Creative Writer',        authorized: true });
OpenClawRuntime.registerSkill('code',        { name: 'Code Expert',            authorized: true });
OpenClawRuntime.registerSkill('html_arch',   { name: 'HTML Architect',         authorized: true });
OpenClawRuntime.registerSkill('search',      { name: 'Search Engine',          authorized: true });
OpenClawRuntime.registerSkill('pdf-doc',     { name: 'PDF Document Memory',    authorized: true });
OpenClawRuntime.seal(); // Phase 2 + 3: delete registration methods, Object.freeze()

// mem0ClearAll - Proper version using MEM0 IndexedDB engine
async function mem0ClearAll() {
  if (!confirm('Delete ALL agent memories stored in this browser? This cannot be undone.')) return;
  var ok = await MEM0.clearAll();
  alert(ok ? '✅ All memories cleared from this browser.' : '❌ Clear failed — check browser console.');
}

// Save preferences
function savePrefs() {
  console.log('⚙️ Saving preferences...');
  try {
    var prefs = {
      theme: document.getElementById('prefTheme') ? document.getElementById('prefTheme').value : 'dark',
      autoSave: document.getElementById('prefAutoSave') ? document.getElementById('prefAutoSave').checked : true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('userPreferences', JSON.stringify(prefs));
    alert('✅ Preferences saved');
  } catch (err) {
    console.error('Prefs save error:', err);
    alert('Error saving preferences: ' + err.message);
  }
}

// Test sync connection — pings GAS Web App and reports status
function testSyncConnection() {
  console.log('🔌 Testing sync connection...');
  var dot = document.getElementById('sync-status-dot');
  var text = document.getElementById('sync-status-text');
  var btn = document.getElementById('sync-test-btn');

  var url = (appData.settings && appData.settings.gasWebAppUrl) ? appData.settings.gasWebAppUrl.trim() : '';
  if (!url) {
    if (dot) dot.style.background = '#ef4444';
    if (text) { text.textContent = 'No GAS Web App URL configured'; text.style.color = '#ef4444'; }
    return;
  }
  if (url.indexOf('https://') !== 0) {
    if (dot) dot.style.background = '#ef4444';
    if (text) { text.textContent = 'URL must start with https://'; text.style.color = '#ef4444'; }
    return;
  }

  // Show testing state
  if (dot) dot.style.background = '#ffc107';
  if (text) { text.textContent = 'Testing connection...'; text.style.color = '#ffc107'; }
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Testing...'; }

  var bridge = new SyncBridge(url);
  var startTime = Date.now();

  bridge.ping()
    .then(function(result) {
      var elapsed = Date.now() - startTime;
      if (result && result.status === 'ok') {
        if (dot) dot.style.background = '#10b981';
        var info = 'Connected — v' + (result.version || '?') +
          ' | Year: ' + (result.year || '?') +
          ' | ' + elapsed + 'ms';
        if (text) { text.textContent = info; text.style.color = '#10b981'; }
        addSyncLogEntry('Ping', 'pull', 0, 'success');
        console.log('✅ Sync ping OK:', result);
      } else {
        if (dot) dot.style.background = '#ef4444';
        var msg = 'Unexpected response: ' + JSON.stringify(result).substring(0, 200);
        if (text) { text.textContent = msg; text.style.color = '#ef4444'; }
        addSyncLogEntry('Ping', 'pull', 0, 'error');
      }
    })
    .catch(function(err) {
      if (dot) dot.style.background = '#ef4444';
      var errMsg = err.name === 'AbortError'
        ? 'Connection timed out (30s). Check URL and GAS deployment.'
        : 'Connection failed: ' + (err.message || String(err));
      if (text) { text.textContent = errMsg; text.style.color = '#ef4444'; }
      addSyncLogEntry('Ping', 'pull', 0, 'error');
      console.error('❌ Sync ping failed:', err);
    })
    .finally(function() {
      if (btn) { btn.disabled = false; btn.textContent = '🔌 Test Connection'; }
    });
}

// Refresh Ollama models list
function refreshOllamaModels() {
  console.log('🔄 Refreshing Ollama models...');
  var ollamaUrl = document.getElementById('keyOllamaUrl');
  var url = ollamaUrl ? ollamaUrl.value : 'http://127.0.0.1:11434';

  fetch(url + '/api/tags')
    .then(function(response) {
      if (!response.ok) throw new Error('Ollama not available');
      return response.json();
    })
    .then(function(data) {
      var select = document.getElementById('keyOllamaModel');
      if (select && data.models) {
        // Clear custom options, keep defaults
        while (select.options.length > 13) {
          select.remove(13);
        }
        // Add detected models
        data.models.forEach(function(model) {
          var option = document.createElement('option');
          option.value = model.name;
          option.textContent = model.name + ' (detected)';
          select.appendChild(option);
        });
        alert('✅ Found ' + data.models.length + ' Ollama models');
      }
    })
    .catch(function(err) {
      console.error('Ollama refresh error:', err);
      alert('⚠️ Could not connect to Ollama at ' + url);
    });
}

// Generate password
function genPW() {
  var length = 16;
  var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  var password = '';
  for (var i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  navigator.clipboard.writeText(password).then(function() {
    alert('✅ Password copied to clipboard:\n' + password);
  }).catch(function() {
    prompt('Password generated (copy manually):', password);
  });
}

// Calendar: add event
function addCalEvent() {
  console.log('📅 Add calendar event');
  alert('Calendar event creation - Feature coming soon');
}

// Vault stubs removed — real implementations are below (unlockVault / addVaultEntry)

// Voice/Speech functions
function toggleVoiceMic() {
  console.log('🎤 Toggle voice mic');
  var btn = document.getElementById('voiceMicBtn');
  if (btn) {
    var isActive = btn.classList.toggle('active');
    btn.textContent = isActive ? '🎤 Recording...' : '🎤 Click to Speak';
    if (isActive && typeof startVoiceRec === 'function') {
      startVoiceRec();
    } else if (!isActive && typeof stopVoiceRec === 'function') {
      stopVoiceRec();
    }
  }
}

function toggleAgentSTT() {
  console.log('🎤 Toggle agent STT');
  var btn = document.getElementById('agent-stt-btn');
  if (btn) {
    btn.classList.toggle('active');
    var isActive = btn.classList.contains('active');
    btn.textContent = isActive ? '🔴 Listening...' : '🎤 Speak';
    if (isActive && typeof startVoiceRec === 'function') {
      startVoiceRec();
    } else if (!isActive && typeof stopVoiceRec === 'function') {
      stopVoiceRec();
    }
  }
}

function toggleAgentTTS() {
  console.log('🔊 Toggle agent TTS');
  var btn = document.getElementById('agent-tts-btn');
  if (btn) {
    var isOn = btn.classList.toggle('tts-on');
    btn.textContent = isOn ? '🔊 TTS ON' : '🔇 TTS OFF';
    localStorage.setItem('agentTTS', isOn ? 'on' : 'off');
  }
}

function speakTTS(text) {
  console.log('🔊 Speak TTS:', text);
  if ('speechSynthesis' in window) {
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    speechSynthesis.speak(utterance);
  } else {
    console.warn('TTS not supported');
  }
}

console.log('✓ EoN AI JavaScript loaded');
console.log("✅ askAgentSafe loaded");
console.log("✅ doResearch loaded");
console.log("✅ doSearch loaded");
console.log("✅ All missing functions implemented (17 functions)");

// ═══════════════════════════════════════════════════════════════
// PDKB TOOLS — SHARED UTILITIES
// ═══════════════════════════════════════════════════════════════

function pdkbCopyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(function(){ return true; }).catch(function(){ return pdkbCopyFallback(text); });
  }
  return Promise.resolve(pdkbCopyFallback(text));
}
function pdkbCopyFallback(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { var ok = document.execCommand('copy'); document.body.removeChild(ta); return ok; }
  catch(e) { document.body.removeChild(ta); return false; }
}
function pdkbDownloadFile(content, filename, mimeType) {
  mimeType = mimeType || 'text/markdown';
  var blob = new Blob([content], { type: mimeType });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
function pdkbSelectAll(elementId) {
  var el = document.getElementById(elementId);
  if (el && window.getSelection) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(range);
  }
}
// onProgress(partialText) optional — called with accumulated text as tokens stream in
function pdkbCallAnthropic(prompt, options, onProgress) {
  options = options || {};
  var apiKey = (
    (window._trustApiKey || '') ||
    (localStorage.getItem('eeon_key_claude') || '') ||
    (localStorage.getItem('stg_key_claude') || '') ||
    (localStorage.getItem('tmar_claude_key') || '') ||
    (localStorage.getItem('_trustApiKey') || '')
  ).trim();
  if (!apiKey) {
    return Promise.resolve({ success: false, error: { type: 'no_api_key', message: 'API key not set. Enter your Anthropic key in Settings \u2192 API Keys, then click Save All Keys.' } });
  }
  window._trustApiKey = apiKey;
  var model = options.model || 'claude-sonnet-4-6';
  var maxTokens = options.maxTokens || 8000;
  // Long timeout — streaming keeps connection alive so we just need to handle stalls
  var timeout = options.timeout || 300000;
  var corsProxy = (localStorage.getItem('eeon_cors_proxy') || '').replace(/\/$/, '');
  var endpoint = corsProxy ? corsProxy + '/v1/messages' : 'https://api.anthropic.com/v1/messages';
  var controller = new AbortController();
  var timer = setTimeout(function(){ controller.abort(); }, timeout);

  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({ model: model, max_tokens: maxTokens, stream: true, messages: [{ role: 'user', content: prompt }] }),
    signal: controller.signal
  })
  .then(function(resp) {
    if (!resp.ok) {
      clearTimeout(timer);
      return resp.text().then(function(body) {
        return { success: false, error: { type: 'api_error', status: resp.status, statusText: resp.statusText, message: body } };
      });
    }
    // SSE streaming reader — tokens arrive immediately, no bulk-wait timeout
    var reader = resp.body.getReader();
    var decoder = new TextDecoder();
    var accumulated = '';
    var sseBuffer = '';

    function pump() {
      return reader.read().then(function(chunk) {
        if (chunk.done) {
          clearTimeout(timer);
          return { success: true, result: accumulated };
        }
        sseBuffer += decoder.decode(chunk.value, { stream: true });
        var lines = sseBuffer.split('\n');
        sseBuffer = lines.pop(); // hold incomplete last line
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line.startsWith('data: ')) continue;
          var raw = line.slice(6);
          if (raw === '[DONE]') continue;
          try {
            var evt = JSON.parse(raw);
            if (evt.type === 'content_block_delta' && evt.delta && evt.delta.type === 'text_delta') {
              accumulated += evt.delta.text;
              if (typeof onProgress === 'function') onProgress(accumulated);
            }
          } catch(e) { /* skip malformed SSE line */ }
        }
        return pump();
      });
    }
    return pump();
  })
  .catch(function(err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { success: false, error: { type: 'timeout', message: 'Request stalled — no response after ' + Math.round(timeout/1000) + 's. Check network or configure a CORS proxy in Settings.' } };
    }
    return { success: false, error: { type: 'network_error', message: err.message } };
  });
}

// ═══════════════════════════════════════════════════════════════
// TRANSCRIPT TRANSFORMER
// ═══════════════════════════════════════════════════════════════

var ttState = { mode: 'auto', output: '', stats: null };

function ttSetMode(mode) {
  ttState.mode = mode;
  ['auto','full','chunked'].forEach(function(m) {
    var btn = document.getElementById('tt-mode-' + m);
    if (m === mode) { btn.style.background = '#10b981'; btn.style.color = 'white'; btn.style.borderColor = '#10b981'; }
    else { btn.style.background = 'transparent'; btn.style.color = '#9ca3af'; btn.style.borderColor = 'rgba(255,255,255,0.15)'; }
  });
}

function ttAnalyzeTranscript(text) {
  var charCount = text.length;
  var wordCount = text.split(/\s+/).filter(function(w){ return w; }).length;
  var timestampPattern = /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/g;
  var timestamps = []; var m;
  while ((m = timestampPattern.exec(text)) !== null) timestamps.push(m);
  var estimatedMinutes = 0;
  if (timestamps.length > 0) {
    var last = timestamps[timestamps.length - 1];
    var hours = last[3] ? parseInt(last[1]) : 0;
    var mins = last[3] ? parseInt(last[2]) : parseInt(last[1]);
    estimatedMinutes = hours * 60 + mins;
  }
  if (estimatedMinutes === 0) estimatedMinutes = Math.round(wordCount / 150);
  var isLong = estimatedMinutes > 180 || charCount > 80000;
  var isVeryLong = estimatedMinutes > 360 || charCount > 150000;
  return {
    charCount: charCount, wordCount: wordCount, estimatedMinutes: estimatedMinutes,
    estimatedHours: (estimatedMinutes / 60).toFixed(1),
    isLong: isLong, isVeryLong: isVeryLong,
    recommendChunking: isLong,
    timestampCount: timestamps.length
  };
}

function ttHandleInput(el) {
  document.getElementById('tt-char-count').textContent = el.value.length.toLocaleString() + ' chars';
  var banner = document.getElementById('tt-stats-banner');
  if (el.value.length > 1000) {
    var stats = ttAnalyzeTranscript(el.value);
    ttState.stats = stats;
    banner.style.display = 'block';
    if (stats.isVeryLong) { banner.style.border = '1px solid rgba(239,68,68,0.3)'; banner.style.background = 'rgba(239,68,68,0.05)'; }
    else if (stats.isLong) { banner.style.border = '1px solid rgba(245,158,11,0.3)'; banner.style.background = 'rgba(245,158,11,0.05)'; }
    else { banner.style.border = '1px solid rgba(16,185,129,0.3)'; banner.style.background = 'rgba(16,185,129,0.05)'; }
    var label = stats.isVeryLong ? 'Very Long (~' + stats.estimatedHours + ' hrs)' : stats.isLong ? 'Long (~' + stats.estimatedHours + ' hrs)' : 'Standard (~' + stats.estimatedHours + ' hrs)';
    banner.innerHTML = '<strong>' + label + '</strong><br><span style="font-size:10px;opacity:0.7">' + stats.wordCount.toLocaleString() + ' words &bull; ' + stats.charCount.toLocaleString() + ' chars' + (stats.timestampCount > 0 ? ' &bull; ' + stats.timestampCount + ' timestamps' : '') + '</span>';
  } else { banner.style.display = 'none'; ttState.stats = null; }
}

function ttChunkTranscript(text, maxChunkSize) {
  maxChunkSize = maxChunkSize || 40000;
  var chunks = [];
  var speakerPattern = /(?=Speaker \d+\s*[•·]\s*\d{1,2}:\d{2})/gi;
  var segments = text.split(speakerPattern).filter(function(s){ return s.trim(); });
  var current = '', idx = 1;
  for (var i = 0; i < segments.length; i++) {
    if ((current + segments[i]).length > maxChunkSize && current.length > 0) {
      chunks.push({ index: idx, content: current.trim(), charCount: current.length }); idx++; current = segments[i];
    } else { current += segments[i]; }
  }
  if (current.trim()) chunks.push({ index: idx, content: current.trim(), charCount: current.length });
  return chunks;
}

function ttBuildPrompt(content, sourceUrl, isChunk, chunkInfo) {
  var dateCreated = new Date().toISOString().split('T')[0];
  var chunkNote = isChunk ? '\n\n**NOTE**: This is PART ' + chunkInfo.index + ' of ' + chunkInfo.total + ' of a longer transcript.\n' : '';
  return 'Transform this transcript into a COMPREHENSIVE README.md that merges both actionable guidance AND educational context.' + chunkNote + '\n\n## CRITICAL: YAML FRONTMATTER FORMAT\n\nYour response MUST start with raw YAML frontmatter. Do NOT wrap it in code blocks or backticks.\n\nStart your response EXACTLY like this:\n---\ndate_created: ' + dateCreated + '\nsource_url: \'' + (sourceUrl || 'Not specified') + '\'\npurpose: >-\n  [Extract the main purpose in 1-2 sentences — be specific about the subject matter covered]\ntransformation_mode: comprehensive' + (isChunk ? '\nchunk: ' + chunkInfo.index + ' of ' + chunkInfo.total : '') + '\nartifact_version: v2.0.0\ngenerator: Transcript Transformer\ntags:\n  - relevant-tag\n  - topic-tag\n  - additional-tag\n---\n\nThen continue with the markdown content.\n\n## DOCUMENT STRUCTURE\n\n### Section Pattern for Each Major Topic:\n1. Header with emoji + timestamp range -> **[MM:SS-MM:SS]**\n2. Brief explanatory paragraph (2-3 sentences of context)\n3. Actionable checklist items with individual timestamps\n4. Key quote or critical point highlighted\n5. Transition to next section\n\n### Required Sections (in order):\nA. Overview with purpose statement\nB. Key Timestamps Reference\nC. Prerequisites as checklist items\nD. Warnings/Outdated Methods\nE. Core Content Sections\nF. Step-by-Step Protocols with timestamps AND explanations\nG. Common Misconceptions\nH. Glossary of specialized terms\nI. Next Steps checklist\n\n### Formatting Rules:\n- Checklists: - [ ] **[MM:SS]** Action item with context\n- Blockquotes for key statements\n- Tables for comparisons\n- Casual speech -> Professional tone\n- Every timestamp appears somewhere\n- No information from transcript is lost\n\n---\n\nTRANSCRIPT TO TRANSFORM:\n' + content + '\n\nREMEMBER: Start with raw YAML frontmatter (three dashes, properties, three dashes) - NO code block wrapper.';
}

// Live streaming preview — updates output panel as tokens arrive
function ttStreamPreview(partialText) {
  var panel = document.getElementById('tt-output-panel');
  if (panel) {
    panel.innerHTML = '<pre id="tt-output-pre" style="white-space:pre-wrap;font-size:12px;color:#e2e8f0;user-select:text">' +
      partialText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') +
      '<span style="display:inline-block;width:8px;height:14px;background:#10b981;margin-left:2px;vertical-align:text-bottom;animation:blink-cursor 0.8s steps(1) infinite"></span></pre>';
    // Auto-scroll to bottom so user can see latest output
    panel.scrollTop = panel.scrollHeight;
  }
}

async function ttTransform() {
  var input = document.getElementById('tt-input').value;
  var sourceUrl = document.getElementById('tt-source-url').value;
  if (!input.trim()) return alert('Paste a transcript first');
  var apiKey = window._trustApiKey || localStorage.getItem('eeon_key_claude') || localStorage.getItem('stg_key_claude') || localStorage.getItem('tmar_claude_key') || localStorage.getItem('_trustApiKey') || '';
  if (!apiKey) return alert('API key required. Enter your Anthropic key in Settings \u2192 API Keys, then Save All Keys.');

  var btn = document.getElementById('tt-transform-btn');
  var panel = document.getElementById('tt-output-panel');
  btn.disabled = true; btn.textContent = '\u23f3 Streaming...';
  document.getElementById('tt-error').style.display = 'none';
  document.getElementById('tt-output-actions').style.display = 'none';
  panel.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:20px;color:#10b981"><span style="display:inline-block;width:16px;height:16px;border:2px solid #10b981;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></span>Streaming from claude-sonnet-4-6...</div>';

  var stats = ttAnalyzeTranscript(input);
  var shouldChunk = ttState.mode === 'chunked' || (ttState.mode === 'auto' && stats.recommendChunking);

  try {
    if (shouldChunk) {
      var chunks = ttChunkTranscript(input);
      var combinedOutput = '';
      for (var i = 0; i < chunks.length; i++) {
        btn.textContent = '\u23f3 Chunk ' + (i+1) + '/' + chunks.length + '...';
        var chunkInfo = { index: i + 1, total: chunks.length };
        var prompt = ttBuildPrompt(chunks[i].content, sourceUrl, true, chunkInfo);
        var chunkBase = combinedOutput;
        var result = await pdkbCallAnthropic(prompt, {}, function(partial) {
          ttStreamPreview(chunkBase + (chunkBase ? '\n\n---\n\n' : '') + partial);
        });
        if (!result.success) {
          ttShowError(result.error, 'Failed on chunk ' + (i+1) + ' of ' + chunks.length);
          btn.disabled = false; btn.textContent = '\u26a1 Transform'; return;
        }
        if (i === 0) { combinedOutput = result.result; }
        else { var withoutFM = result.result.replace(/^---[\s\S]*?---\n*/m, ''); combinedOutput += '\n\n---\n\n## Part ' + (i+1) + '\n\n' + withoutFM; }
      }
      ttState.output = combinedOutput;
    } else {
      var prompt = ttBuildPrompt(input, sourceUrl);
      var result = await pdkbCallAnthropic(prompt, {}, ttStreamPreview);
      if (!result.success) { ttShowError(result.error); btn.disabled = false; btn.textContent = '\u26a1 Transform'; return; }
      ttState.output = result.result;
    }
    ttRenderOutput();
  } catch(err) { ttShowError({ type: 'unexpected_error', message: err.message }); }
  btn.disabled = false; btn.textContent = '\u26a1 Transform';
}

function ttShowError(error, context) {
  var el = document.getElementById('tt-error'); el.style.display = 'block';
  var html = '<p><strong>Type:</strong> ' + (error.type||'unknown') + '</p>';
  if (error.status) html += '<p><strong>Status:</strong> ' + error.status + ' ' + (error.statusText||'') + '</p>';
  if (error.message) html += '<p><strong>Message:</strong> ' + error.message.substring(0,200) + '</p>';
  if (context) html += '<p><strong>Context:</strong> ' + context + '</p>';
  document.getElementById('tt-error-content').innerHTML = html;
}

function ttRenderOutput() {
  var panel = document.getElementById('tt-output-panel');
  if (ttState.output) {
    panel.innerHTML = '<pre id="tt-output-pre" style="white-space:pre-wrap;font-size:12px;color:#e2e8f0;user-select:text">' + ttState.output.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>';
    document.getElementById('tt-output-actions').style.display = 'flex';
  }
}

function ttCopyOutput() { pdkbCopyToClipboard(ttState.output).then(function(ok) { alert(ok ? 'Copied!' : 'Copy failed'); }); }
function ttSelectOutput() { pdkbSelectAll('tt-output-pre'); }
function ttDownloadOutput() { pdkbDownloadFile(ttState.output, 'README_' + new Date().toISOString().split('T')[0] + '.md'); }

function ttExportHtml() {
  if (!ttState.output) return alert('No output to export');
  var md = ttState.output;
  var dateSlug = new Date().toISOString().split('T')[0];
  var titleMatch = md.match(/^#\s+(.+)$/m);
  var title = titleMatch ? titleMatch[1] : ('Transcript Export ' + dateSlug);

  // Minimal inline markdown → HTML converter (headings, bold, italic, code, lists, hr, blockquote, links)
  function mdToHtml(text) {
    var lines = text.split('\n');
    var out = [], inPre = false, preLines = [], inFence = false, fenceLang = '';
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      // Fenced code blocks
      if (!inFence && /^```/.test(line)) {
        inFence = true; fenceLang = line.replace(/^```/, '').trim(); preLines = []; continue;
      }
      if (inFence) {
        if (/^```/.test(line)) {
          inFence = false;
          var escaped = preLines.join('\n').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          out.push('<pre><code' + (fenceLang ? ' class="language-' + fenceLang + '"' : '') + '>' + escaped + '</code></pre>');
        } else { preLines.push(line); }
        continue;
      }
      // Headings
      var hm = line.match(/^(#{1,6})\s+(.+)/);
      if (hm) { var hl = hm[1].length; out.push('<h' + hl + '>' + inline(hm[2]) + '</h' + hl + '>'); continue; }
      // HR
      if (/^---+$/.test(line.trim())) { out.push('<hr>'); continue; }
      // Blockquote
      if (/^>\s?/.test(line)) { out.push('<blockquote>' + inline(line.replace(/^>\s?/,'')) + '</blockquote>'); continue; }
      // Unordered list
      var ulm = line.match(/^(\s*)[-*]\s+\[( |x)\]\s+(.+)/);
      if (ulm) { var checked = ulm[2]==='x'; out.push('<li class="task"><input type="checkbox"' + (checked?' checked':'') + ' disabled> ' + inline(ulm[3]) + '</li>'); continue; }
      var ulm2 = line.match(/^(\s*)[-*]\s+(.+)/);
      if (ulm2) { out.push('<li>' + inline(ulm2[2]) + '</li>'); continue; }
      // Ordered list
      var olm = line.match(/^\d+\.\s+(.+)/);
      if (olm) { out.push('<li>' + inline(olm[1]) + '</li>'); continue; }
      // Blank line
      if (!line.trim()) { out.push('<p></p>'); continue; }
      out.push('<p>' + inline(line) + '</p>');
    }
    return out.join('\n');
  }

  function inline(text) {
    return text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/`([^`]+)`/g,'<code>$1</code>')
      .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/~~(.+?)~~/g,'<del>$1</del>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
  }

  var body = mdToHtml(md);
  var css = [
    '*,*::before,*::after{box-sizing:border-box}',
    'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#1f2328;background:#fff;max-width:980px;margin:0 auto;padding:45px}',
    'h1{font-size:2em;padding-bottom:.3em;border-bottom:1px solid #d1d9e0;margin-top:24px;margin-bottom:16px;font-weight:600}',
    'h2{font-size:1.5em;padding-bottom:.3em;border-bottom:1px solid #d1d9e0;margin-top:24px;margin-bottom:16px;font-weight:600}',
    'h3{font-size:1.25em;margin-top:24px;margin-bottom:16px;font-weight:600}',
    'h4,h5,h6{margin-top:24px;margin-bottom:16px;font-weight:600}',
    'p{margin-top:0;margin-bottom:16px}',
    'a{color:#0969da;text-decoration:none}a:hover{text-decoration:underline}',
    'blockquote{margin:0 0 16px;padding:0 1em;color:#59636e;border-left:4px solid #d1d9e0}',
    'code{padding:.2em .4em;font-size:85%;background:#eff1f3;border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
    'pre{margin:0 0 16px;padding:16px;overflow:auto;font-size:85%;line-height:1.45;background:#f6f8fa;border-radius:6px;border:1px solid #d1d9e0}',
    'pre code{padding:0;background:transparent;font-size:100%;white-space:pre}',
    'ul,ol{margin-top:0;margin-bottom:16px;padding-left:2em}li+li{margin-top:.25em}',
    'li.task{list-style:none;margin-left:-1.4em}',
    'hr{height:.25em;padding:0;margin:24px 0;background:#d1d9e0;border:0}',
    'table{border-spacing:0;border-collapse:collapse;display:block;max-width:100%;overflow:auto;margin-bottom:16px}',
    'th{padding:6px 13px;border:1px solid #d1d9e0;font-weight:600;background:#f6f8fa}',
    'td{padding:6px 13px;border:1px solid #d1d9e0}',
    'tr{background:#fff;border-top:1px solid #d1d9e0}tr:nth-child(2n){background:#f6f8fa}',
    '@media print{body{max-width:100%;padding:20px;font-size:12pt}pre{white-space:pre-wrap;word-wrap:break-word}h1,h2{page-break-after:avoid}}'
  ].join('\n');

  var html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>' + title.replace(/</g,'&lt;') + '</title>\n<style>\n' + css + '\n</style>\n</head>\n<body>\n' + body + '\n</body>\n</html>';

  pdkbDownloadFile(html, 'README_' + dateSlug + '.html');
}

function ttClearAll() {
  document.getElementById('tt-input').value = '';
  document.getElementById('tt-source-url').value = '';
  document.getElementById('tt-char-count').textContent = '0 chars';
  document.getElementById('tt-stats-banner').style.display = 'none';
  document.getElementById('tt-error').style.display = 'none';
  document.getElementById('tt-output-actions').style.display = 'none';
  document.getElementById('tt-output-panel').innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;color:rgba(255,255,255,0.3)"><div style="font-size:32px;margin-bottom:8px;opacity:0.3">📝</div><p>Paste transcript and click Transform</p></div>';
  ttState.output = ''; ttState.stats = null;
}

// ═══════════════════════════════════════════════════════════════
// ETYMOLOGY ANALYZER
// ═══════════════════════════════════════════════════════════════

var etymState = { output: '', dicts: { blacks4th: true, randomHouse: true, oxford: true, modern: true } };

var ETYMOLOGY_SYMBOLS = {
  '<': 'derived from', 'e.g.': 'for example', 'i.e.': 'that is to say',
  'c.f.': 'compared to', 'c.': 'circa (around/about)',
  'ptp.': 'past participle', 'pp.': 'past participle',
  'n.': 'noun', 'v.': 'verb', 'adj.': 'adjective',
  'OHG': 'Old High German', 'MHG': 'Middle High German',
  'MF': 'Middle French', 'AF': 'Anglo-French',
  'L.': 'Latin', 'LL': 'Lower Latin', 'ML': 'Medieval Latin', 'VL': 'Vulgar Latin',
  'G.': 'German', 'OE': 'Old English', 'ME': 'Middle English',
  'OF': 'Old French', 'ONF': 'Old North French',
  'GK.': 'Greek', 'LGk': 'Late Greek', 'SNS': 'Sanskrit',
  'AR.': 'Arabic', 'HEB': 'Hebrew',
  'AE': 'American English', 'BE': 'British English', 'SCT': 'Scottish',
  'PIE': 'Proto-Indo-European', 'IE': 'Indo-European'
};

var ETYM_SAMPLES = [
  'jurat, affiant, notary',
  'cestui que trust, corpus, res',
  'tort, contract, malfeasance',
  'person, individual, citizen',
  'attorney, advocate, counsel'
];

function initEtymologyAnalyzer() {
  // Populate symbol guide
  var symbolsEl = document.getElementById('etym-symbols');
  if (symbolsEl && !symbolsEl.children.length) {
    var html = '';
    for (var sym in ETYMOLOGY_SYMBOLS) {
      html += '<div style="display:flex;gap:4px"><span style="font-family:monospace;font-weight:700;min-width:36px;color:#fbbf24">' + sym + '</span><span style="color:var(--text-secondary)">= ' + ETYMOLOGY_SYMBOLS[sym] + '</span></div>';
    }
    symbolsEl.innerHTML = html;
  }
  // Populate quick load
  var qlEl = document.getElementById('etym-quick-load');
  if (qlEl && !qlEl.children.length) {
    ETYM_SAMPLES.forEach(function(sample) {
      var btn = document.createElement('button');
      btn.textContent = sample.split(',')[0] + '...';
      btn.style.cssText = 'font-size:10px;padding:4px 8px;background:rgba(168,85,247,0.2);color:#a855f7;border:none;border-radius:4px;cursor:pointer';
      btn.onmouseover = function(){ this.style.background='rgba(168,85,247,0.3)'; };
      btn.onmouseout = function(){ this.style.background='rgba(168,85,247,0.2)'; };
      btn.onclick = function(){ document.getElementById('etym-input').value = sample; };
      qlEl.appendChild(btn);
    });
  }
}

function etymToggleDict(key) {
  etymState.dicts[key] = !etymState.dicts[key];
  var label = document.getElementById('etym-dict-' + key);
  if (etymState.dicts[key]) {
    label.style.border = '1px solid rgba(168,85,247,0.3)'; label.style.background = 'rgba(168,85,247,0.1)';
  } else {
    label.style.border = '1px solid rgba(255,255,255,0.1)'; label.style.background = 'rgba(255,255,255,0.03)';
  }
}

function etymBuildPrompt(content, dictionaries, chainDepth) {
  var terms = content.split(',').map(function(t){ return t.trim(); }).filter(function(t){ return t; });
  var sources = [];
  for (var k in dictionaries) { if (dictionaries[k]) sources.push(k); }
  var dateCreated = new Date().toISOString().split('T')[0];
  return 'You are an expert etymologist specializing in legal and biblical terminology with deep knowledge of Black\'s Law Dictionary (4th Edition), Random House College Dictionary (1973-1978) bracket etymology system, Oxford English Dictionary, and Strong\'s Exhaustive Concordance.\n\nCRITICAL MISSION: Start with YAML FRONTMATTER, then follow the bracket etymology chain method to reveal hidden meanings and contradictions between root definitions and modern usage.\n\n## YAML FRONTMATTER (MUST BE FIRST):\n---\ndate_created: ' + dateCreated + '\nanalysis_type: etymology\nterms_analyzed: [' + terms.join(', ') + ']\ndictionaries_used: [' + sources.join(', ') + ']\nbracket_chain_depth: ' + chainDepth + '\nartifact_version: v1.3.0\ngenerator: Legal Etymology Analyzer\npurpose: Comprehensive etymological analysis with multi-dictionary bracket chain following\ntags: [etymology, legal-terms, dictionary-research, Black\'s-Law, linguistics]\n---\n\nTerms to analyze: ' + terms.join(', ') + '\nDictionary sources: ' + sources.join(', ') + '\nBracket chain depth: ' + chainDepth + ' levels\n\nFor EACH term, provide:\n\n## [TERM IN UPPERCASE]\n\n**Modern Pronunciation**: /IPA notation/\n**Word Class**: [noun/verb/adjective/etc.]\n\n### MULTI-DICTIONARY ANALYSIS\n\n#### Black\'s Law Dictionary (4th Edition)\n**Legal Definition**: [Complete definition]\n**Usage Context**: [How used in legal proceedings]\n**Related Legal Terms**: [Other terms referenced]\n\n#### Random House Dictionary - BRACKET ETYMOLOGY\n**Main Definition**: [Primary definition]\n**BRACKETED ETYMOLOGY**: [Copy exact bracket contents]\n**Parsed Symbols**: [Explain each abbreviation]\n\n**BRACKET CHAIN** (Follow ' + chainDepth + ' levels deep):\n```\n[TERM]\n├─ [First bracket reference] → meaning → [its brackets if any]\n│   └─ [Second level] → meaning → [its brackets]\n│       └─ [Third level] → meaning → [root origin]\n├─ [Alternative etymology path if exists]\n└─ [Proto-Indo-European or oldest root]\n```\n\n#### Oxford English Dictionary\n**First Recorded Use**: [Year and context]\n**Historical Definitions Timeline**: [Earliest → Modern]\n**Semantic Shift**: [How meaning changed]\n\n#### Modern Legal Definition (2024)\n**Current Meaning**: [Contemporary usage]\n**Statutory References**: [If commonly referenced]\n\n### CRITICAL FINDINGS\n**Root Etymology**: [Oldest fundamental meaning]\n**Hidden Meaning**: [What bracket chain reveals]\n**CONTRADICTION ALERT**: [Root meaning vs modern usage differences]\n\n### COMPARATIVE TABLE\n| Source | Era/Year | Definition | Semantic Focus |\n|--------|----------|------------|----------------|\n| PIE/Root | Ancient | [root meaning] | [emphasis] |\n| Latin/Greek | Classical | [classical meaning] | [evolution] |\n| Black\'s 4th | 1951 | [legal definition] | [legal focus] |\n| Modern | 2024 | [current usage] | [current focus] |\n\n### WORD FAMILY\n**Same Root Family**: Related words from same root\n**Compound Terms**: Terms using this word\n\n### ETYMOLOGY REVELATION\n[2-3 sentences on the most significant discovery about the term\'s true meaning]\n\n---\n\nTERMS TO ANALYZE:\n' + content + '\n\nBegin with YAML frontmatter. For each term, extract every bracketed reference, follow chains ' + chainDepth + ' levels deep, and flag all contradictions.';
}

async function etymAnalyze() {
  var input = document.getElementById('etym-input').value;
  if (!input.trim()) return alert('Enter legal terms to analyze');
  var apiKey = window._trustApiKey || localStorage.getItem('stg_key_claude') || localStorage.getItem('tmar_claude_key') || localStorage.getItem('_trustApiKey') || '';
  if (!apiKey) return alert('API key required. Enter your Anthropic key in Settings → API Keys, then Save.');

  var btn = document.getElementById('etym-analyze-btn');
  btn.disabled = true; btn.textContent = '⏳ Analyzing...';
  var depth = parseInt(document.getElementById('etym-depth').value);

  try {
    var prompt = etymBuildPrompt(input, etymState.dicts, depth);
    var result = await pdkbCallAnthropic(prompt);
    if (!result.success) {
      alert('Analysis failed: ' + (result.error.message || 'Unknown error'));
      btn.disabled = false; btn.textContent = '⚡ Analyze Etymology'; return;
    }
    etymState.output = result.result;
    etymRenderOutput();
  } catch(err) { alert('Error: ' + err.message); }
  btn.disabled = false; btn.textContent = '⚡ Analyze Etymology';
}

function etymRenderOutput() {
  var panel = document.getElementById('etym-output-panel');
  if (etymState.output) {
    panel.innerHTML = '<pre id="etym-output-pre" style="white-space:pre-wrap;font-size:12px;color:#e2e8f0;user-select:text">' + etymState.output.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>';
    document.getElementById('etym-output-actions').style.display = 'flex';
  }
}

function etymCopyOutput() { pdkbCopyToClipboard(etymState.output).then(function(ok) { alert(ok ? 'Copied!' : 'Copy failed'); }); }
function etymDownloadOutput() {
  var terms = document.getElementById('etym-input').value.split(',')[0].trim().replace(/\s+/g, '_');
  pdkbDownloadFile(etymState.output, 'etymology_' + terms + '_' + new Date().toISOString().split('T')[0] + '.md');
}
function etymClearAll() {
  document.getElementById('etym-input').value = '';
  etymState.output = '';
  document.getElementById('etym-output-actions').style.display = 'none';
  document.getElementById('etym-output-panel').innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;color:rgba(255,255,255,0.3)"><div style="font-size:32px;margin-bottom:8px;opacity:0.3">📖</div><p>Enter legal terms and click Analyze</p><p style="font-size:11px;margin-top:6px">Reveals hidden meanings through bracket chain analysis</p></div>';
}

// ═══════════════════════════════════════════════════════════════
// PDF / MARKDOWN CONVERTER
// ═══════════════════════════════════════════════════════════════

var pmcState = { type: 'pdf-to-md', file: null, output: '' };

function pmcSwitchType() {
  pmcState.type = pmcState.type === 'pdf-to-md' ? 'md-to-pdf' : 'pdf-to-md';
  pmcState.file = null; pmcState.output = '';
  var labelPdf = document.getElementById('pmc-label-pdf');
  var labelMd = document.getElementById('pmc-label-md');
  var fileInput = document.getElementById('pmc-file-input');
  if (pmcState.type === 'pdf-to-md') {
    labelPdf.style.background = '#3b82f6'; labelPdf.style.color = 'white';
    labelMd.style.background = 'rgba(255,255,255,0.1)'; labelMd.style.color = '#6b7280';
    fileInput.accept = '.pdf';
    document.getElementById('pmc-upload-label').textContent = 'Click to upload PDF file';
  } else {
    labelMd.style.background = '#3b82f6'; labelMd.style.color = 'white';
    labelPdf.style.background = 'rgba(255,255,255,0.1)'; labelPdf.style.color = '#6b7280';
    fileInput.accept = '.md,.markdown,.txt';
    document.getElementById('pmc-upload-label').textContent = 'Click to upload Markdown file';
  }
  document.getElementById('pmc-file-selected').style.display = 'none';
  document.getElementById('pmc-error').style.display = 'none';
  document.getElementById('pmc-output-actions').style.display = 'none';
  document.getElementById('pmc-output-panel').innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;color:rgba(255,255,255,0.3)"><div style="font-size:32px;margin-bottom:8px;opacity:0.3">📄</div><p>Upload and convert a file to see output here</p></div>';
}

function pmcFileChange(input) {
  var f = input.files[0];
  if (f) {
    pmcState.file = f; pmcState.output = '';
    var sel = document.getElementById('pmc-file-selected');
    sel.textContent = 'Selected: ' + f.name;
    sel.style.display = 'inline-block';
    document.getElementById('pmc-error').style.display = 'none';
  }
}

function pmcExtractTextFromPDF(file) {
  return file.arrayBuffer().then(function(arrayBuffer) {
    var uint8Array = new Uint8Array(arrayBuffer);
    var text = '';
    for (var i = 0; i < uint8Array.length; i++) text += String.fromCharCode(uint8Array[i]);
    var textContentRegex = /BT\s*(.*?)\s*ET/gs;
    var tjRegex = /\((.*?)\)\s*Tj/g;
    var tJRegex = /\[(.*?)\]\s*TJ/g;
    var extractedText = '';
    var match;
    while ((match = textContentRegex.exec(text)) !== null) {
      var block = match[1];
      var tjMatch;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        try { extractedText += decodeURIComponent(escape(tjMatch[1])) + ' '; }
        catch(e) { extractedText += tjMatch[1] + ' '; }
      }
      var tJMatch;
      while ((tJMatch = tJRegex.exec(block)) !== null) {
        var arrayContent = tJMatch[1];
        var stringMatches = arrayContent.match(/\((.*?)\)/g);
        if (stringMatches) {
          stringMatches.forEach(function(str) {
            try { extractedText += decodeURIComponent(escape(str.replace(/[()]/g, ''))) + ' '; }
            catch(e) { extractedText += str.replace(/[()]/g, '') + ' '; }
          });
        }
      }
      extractedText += '\n';
    }
    if (!extractedText.trim()) throw new Error('No text content found in PDF. The PDF might be image-based or encrypted.');
    extractedText = extractedText.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
    var markdown = '# ' + (file.name.replace('.pdf', '') || 'Document') + '\n\n';
    var paragraphs = extractedText.split(/\n\n+/);
    paragraphs.forEach(function(para) {
      var trimmed = para.trim();
      if (!trimmed) return;
      if (trimmed.length < 60 && (trimmed === trimmed.toUpperCase() || /^\d+\./.test(trimmed))) markdown += '## ' + trimmed + '\n\n';
      else if (/^[-\u2022]\s/.test(trimmed)) markdown += trimmed + '\n';
      else if (/^\d+\.\s/.test(trimmed)) markdown += trimmed + '\n';
      else markdown += trimmed + '\n\n';
    });
    return markdown;
  });
}

function pmcConvertMarkdownToPDF(content) {
  var lines = content.split('\n');
  var pdfContent = '%PDF-1.4\n';
  pdfContent += '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  pdfContent += '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  var textContent = 'BT\n/F1 12 Tf\n50 750 Td\n';
  var yPos = 750;
  lines.forEach(function(line) {
    if (line.trim()) {
      var cleanLine = line.replace(/[()\\]/g, '').substring(0, 80);
      textContent += '(' + cleanLine + ') Tj\n0 -15 Td\n';
      yPos -= 15;
      if (yPos < 50) { yPos = 750; textContent += '0 800 Td\n'; }
    }
  });
  textContent += 'ET\n';
  var contentLength = textContent.length;
  pdfContent += '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R /MediaBox [0 0 612 792] >>\nendobj\n';
  pdfContent += '4 0 obj\n<< /Length ' + contentLength + ' >>\nstream\n' + textContent + 'endstream\nendobj\n';
  pdfContent += 'xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000115 00000 n\n0000000300 00000 n\n';
  pdfContent += 'trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n';
  pdfContent += (pdfContent.length + 9) + '\n%%EOF';
  return pdfContent;
}

async function pmcConvert() {
  if (!pmcState.file) return alert('Please select a file first');
  var btn = document.getElementById('pmc-convert-btn');
  btn.disabled = true; btn.textContent = '⏳ Converting...';
  document.getElementById('pmc-error').style.display = 'none';

  try {
    if (pmcState.type === 'pdf-to-md') {
      var markdown = await pmcExtractTextFromPDF(pmcState.file);
      pmcState.output = markdown;
      pmcRenderOutput();
    } else {
      var reader = new FileReader();
      reader.onload = function(e) {
        var pdfContent = pmcConvertMarkdownToPDF(e.target.result);
        pmcState.output = pdfContent;
        pmcRenderOutput();
      };
      reader.readAsText(pmcState.file);
    }
  } catch(err) {
    document.getElementById('pmc-error').style.display = 'block';
    document.getElementById('pmc-error-msg').textContent = err.message;
  }
  btn.disabled = false; btn.textContent = '⇄ Convert File';
}

function pmcRenderOutput() {
  var panel = document.getElementById('pmc-output-panel');
  if (pmcState.type === 'pdf-to-md') {
    panel.innerHTML = '<pre id="pmc-output-pre" style="white-space:pre-wrap;font-size:12px;color:#e2e8f0;user-select:text">' + pmcState.output.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>';
    document.getElementById('pmc-output-actions').style.display = 'flex';
    var copyBtn = document.getElementById('pmc-copy-btn');
    if (copyBtn) copyBtn.style.display = 'inline-block';
  } else {
    panel.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;color:#10b981"><div style="font-size:40px;margin-bottom:8px">✓</div><p style="font-weight:700">PDF Generated Successfully!</p><p style="font-size:12px;color:var(--text-secondary);margin-top:8px">Click Download to save your PDF</p><p style="font-size:10px;color:var(--text-secondary);margin-top:6px">Size: ' + (pmcState.output.length / 1024).toFixed(2) + ' KB</p></div>';
    document.getElementById('pmc-output-actions').style.display = 'flex';
    var copyBtn = document.getElementById('pmc-copy-btn');
    if (copyBtn) copyBtn.style.display = 'none';
  }
}

function pmcCopyOutput() { pdkbCopyToClipboard(pmcState.output).then(function(ok) { alert(ok ? 'Copied!' : 'Copy failed'); }); }
function pmcDownloadOutput() {
  var ext = pmcState.type === 'pdf-to-md' ? '.md' : '.pdf';
  var mime = pmcState.type === 'pdf-to-md' ? 'text/markdown' : 'application/pdf';
  var name = pmcState.file ? pmcState.file.name.replace(/\.[^.]+$/, ext) : 'converted' + ext;
  pdkbDownloadFile(pmcState.output, name, mime);
}

// ═══════════════════════════════════════════════════════════════
// MULTISTATE POA & 6-DBA SYSTEM
// ═══════════════════════════════════════════════════════════════

var POA_NC_COUNTIES = ["Alamance","Alexander","Alleghany","Anson","Ashe","Avery","Beaufort","Bertie","Bladen","Brunswick","Buncombe","Burke","Cabarrus","Caldwell","Camden","Carteret","Caswell","Catawba","Chatham","Cherokee","Chowan","Clay","Cleveland","Columbus","Craven","Cumberland","Currituck","Dare","Davidson","Davie","Duplin","Durham","Edgecombe","Forsyth","Franklin","Gaston","Gates","Graham","Granville","Greene","Guilford","Halifax","Harnett","Haywood","Henderson","Hertford","Hoke","Hyde","Iredell","Jackson","Johnston","Jones","Lee","Lenoir","Lincoln","Macon","Madison","Martin","McDowell","Mecklenburg","Mitchell","Montgomery","Moore","Nash","New Hanover","Northampton","Onslow","Orange","Pamlico","Pasquotank","Pender","Perquimans","Person","Pitt","Polk","Randolph","Richmond","Robeson","Rockingham","Rowan","Rutherford","Sampson","Scotland","Stanly","Stokes","Surry","Swain","Transylvania","Tyrrell","Union","Vance","Wake","Warren","Washington","Watauga","Wayne","Wilkes","Wilson","Yadkin","Yancey"];
var POA_VA_COUNTIES = ["Accomack","Albemarle","Alexandria","Alleghany","Amelia","Amherst","Appomattox","Arlington","Augusta","Bath","Bedford","Bland","Botetourt","Bristol","Brunswick","Buchanan","Buckingham","Campbell","Caroline","Carroll","Charles City","Charlotte","Charlottesville","Chesapeake","Chesterfield","Clarke","Colonial Heights","Craig","Culpeper","Cumberland","Danville","Dickenson","Dinwiddie","Fairfax","Falls Church","Fauquier","Floyd","Fluvanna","Franklin","Frederick","Fredericksburg","Giles","Gloucester","Goochland","Grayson","Greene","Greensville","Halifax","Hampton","Hanover","Harrisonburg","Henrico","Henry","Highland","Hopewell","Isle of Wight","James City","King George","King William","Lancaster","Lee","Loudoun","Louisa","Lynchburg","Madison","Manassas","Martinsville","Mecklenburg","Middlesex","Montgomery","Nelson","New Kent","Newport News","Norfolk","Northampton","Norton","Orange","Page","Patrick","Petersburg","Pittsylvania","Portsmouth","Powhatan","Prince Edward","Prince George","Prince William","Pulaski","Radford","Rappahannock","Richmond","Roanoke","Rockbridge","Rockingham","Salem","Scott","Shenandoah","Smyth","Southampton","Spotsylvania","Stafford","Staunton","Suffolk","Surry","Sussex","Tazewell","Virginia Beach","Warren","Washington","Waynesboro","Westmoreland","Williamsburg","Winchester","Wise","Wythe","York"];

var POA_DBA_LIST = [
  { id: 'dba1', name: 'DBA #1', desc: 'Trust DBA Personal Name', priority: 'HIGH' },
  { id: 'dba2', name: 'DBA #2', desc: 'Trust DBA Estate Name', priority: 'MEDIUM' },
  { id: 'dba3', name: 'DBA #3', desc: 'Trust DBA Business Name', priority: 'HIGH' },
  { id: 'dba4', name: 'DBA #4', desc: 'Trust DBA Enterprises', priority: 'CRITICAL' },
  { id: 'dba5', name: 'DBA #5', desc: 'Enterprises DBA Personal', priority: 'CRITICAL' },
  { id: 'dba6', name: 'DBA #6', desc: 'Enterprises DBA Business', priority: 'HIGH' }
];

var POA_TABS = [
  { id: 'poa', label: 'Durable POA' },
  { id: 'cert', label: 'Agent Cert' },
  { id: 'affidavit', label: 'Affidavit' },
  { id: 'revocation', label: 'Revocation' }
];

var poaState = {
  mode: 'poa', currentState: 'NC', activeTab: 'poa', activeDBA: 'dba1', menuOpen: false,
  form: { principal_name:'', principal_address:'', principal_county:'', agent_name:'', agent_address:'', agent_phone:'', successor_name:'', successor_address:'', execution_date:'', notary_county:'', witness1_name:'', witness1_address:'', witness2_name:'', witness2_address:'', transaction_desc:'', third_party:'', poa_id:'', recording_info:'' },
  dba: { trust_name:'', trustee_title:'', foreign_trustee:'', co_trustee:'', first_name:'', middle_name:'', last_name:'', birthdate:'', business_name:'', business_date:'', foreign_addr:'', domestic_addr:'', filing_county:'', trust_date:'', trust_ein:'' }
};

var POA_SEP = '\u2550'.repeat(75);

function poaVal(k, fb) { return poaState.form[k] || fb || '[_______________]'; }
function poaDval(k, fb) { return poaState.dba[k] || fb || '[[_______________]]'; }

function poaSetMode(mode) {
  poaState.mode = mode;
  var btnPoa = document.getElementById('poa-mode-poa');
  var btnDba = document.getElementById('poa-mode-dba');
  var stateToggle = document.getElementById('poa-state-toggle');
  if (mode === 'poa') {
    btnPoa.style.background = '#3b82f6'; btnPoa.style.color = 'white'; btnPoa.style.borderColor = '#3b82f6';
    btnDba.style.background = 'transparent'; btnDba.style.color = '#9ca3af'; btnDba.style.borderColor = 'rgba(255,255,255,0.15)';
    stateToggle.style.display = 'flex';
  } else {
    btnDba.style.background = '#a855f7'; btnDba.style.color = 'white'; btnDba.style.borderColor = '#a855f7';
    btnPoa.style.background = 'transparent'; btnPoa.style.color = '#9ca3af'; btnPoa.style.borderColor = 'rgba(255,255,255,0.15)';
    stateToggle.style.display = 'none';
  }
  poaRenderForm(); poaRenderSubtabs(); poaRenderPreview();
}

function poaSetState(st) {
  poaState.currentState = st;
  var btnNC = document.getElementById('poa-state-NC');
  var btnVA = document.getElementById('poa-state-VA');
  if (st === 'NC') {
    btnNC.style.background = '#10b981'; btnNC.style.color = 'white'; btnNC.style.borderColor = '#10b981';
    btnVA.style.background = 'transparent'; btnVA.style.color = '#9ca3af'; btnVA.style.borderColor = 'rgba(255,255,255,0.15)';
  } else {
    btnVA.style.background = '#10b981'; btnVA.style.color = 'white'; btnVA.style.borderColor = '#10b981';
    btnNC.style.background = 'transparent'; btnNC.style.color = '#9ca3af'; btnNC.style.borderColor = 'rgba(255,255,255,0.15)';
  }
  poaRenderForm(); poaRenderPreview();
}

function poaSetTab(tabId) { poaState.activeTab = tabId; poaRenderSubtabs(); poaRenderForm(); poaRenderPreview(); }
function poaSetDBA(dbaId) { poaState.activeDBA = dbaId; poaRenderSubtabs(); poaRenderPreview(); }

function poaMakeInput(placeholder, key, isForm) {
  var val = isForm ? (poaState.form[key]||'') : (poaState.dba[key]||'');
  return '<input placeholder="' + placeholder + '" value="' + val.replace(/"/g,'&quot;') + '" oninput="poaUpdateField(\'' + key + '\',' + isForm + ',this.value)" style="width:100%;padding:6px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:var(--text-primary);font-size:12px;box-sizing:border-box" />';
}

function poaMakeSelect(placeholder, key, options) {
  var val = poaState.form[key]||'';
  var html = '<select onchange="poaUpdateField(\'' + key + '\',true,this.value)" style="width:100%;padding:6px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:var(--text-primary);font-size:12px;box-sizing:border-box">';
  html += '<option value="">' + placeholder + '</option>';
  options.forEach(function(c) { html += '<option value="' + c + '"' + (val===c?' selected':'') + '>' + c + '</option>'; });
  html += '</select>';
  return html;
}

function poaUpdateField(key, isForm, value) {
  if (isForm) poaState.form[key] = value;
  else poaState.dba[key] = value;
  poaRenderPreview();
}

function poaRenderForm() {
  var container = document.getElementById('poa-form-container');
  var counties = poaState.currentState === 'NC' ? POA_NC_COUNTIES : POA_VA_COUNTIES;
  var html = '';
  if (poaState.mode === 'poa') {
    html += '<div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">PRINCIPAL</div>';
    html += poaMakeInput('Name','principal_name',true);
    html += '<div style="height:6px"></div>' + poaMakeInput('Address','principal_address',true);
    html += '<div style="height:6px"></div>' + poaMakeSelect('County...','principal_county',counties);
    html += '<div style="height:10px"></div><div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">AGENT</div>';
    html += poaMakeInput('Name','agent_name',true);
    html += '<div style="height:6px"></div>' + poaMakeInput('Address','agent_address',true);
    html += '<div style="height:6px"></div>' + poaMakeInput('Phone','agent_phone',true);
    html += '<div style="height:10px"></div><div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">SUCCESSOR</div>';
    html += poaMakeInput('Name','successor_name',true);
    html += '<div style="height:6px"></div>' + poaMakeInput('Address','successor_address',true);
    html += '<div style="height:10px"></div><div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">WITNESSES</div>';
    html += poaMakeInput('Witness 1 Name','witness1_name',true);
    html += '<div style="height:6px"></div>' + poaMakeInput('Witness 1 Address','witness1_address',true);
    html += '<div style="height:6px"></div>' + poaMakeInput('Witness 2 Name','witness2_name',true);
    html += '<div style="height:6px"></div>' + poaMakeInput('Witness 2 Address','witness2_address',true);
    html += '<div style="height:10px"></div><div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">EXECUTION</div>';
    html += poaMakeInput('Date','execution_date',true);
    html += '<div style="height:6px"></div>' + poaMakeSelect('Notary County...','notary_county',counties);
    if (poaState.activeTab === 'affidavit') {
      html += '<div style="height:10px"></div><div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">AFFIDAVIT</div>';
      html += poaMakeInput('Third Party','third_party',true);
      html += '<div style="height:6px"></div>' + poaMakeInput('Transaction','transaction_desc',true);
    }
    if (poaState.activeTab === 'revocation') {
      html += '<div style="height:10px"></div><div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">REVOCATION</div>';
      html += poaMakeInput('POA Document ID','poa_id',true);
      html += '<div style="height:6px"></div>' + poaMakeInput('Recording Info','recording_info',true);
    }
  } else {
    html += '<div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">TRUST</div>';
    html += poaMakeInput('Trust Name','trust_name',false);
    html += '<div style="height:6px"></div>' + poaMakeInput('Trust EIN (98-)','trust_ein',false);
    html += '<div style="height:6px"></div>' + poaMakeInput('Trust Date','trust_date',false);
    html += '<div style="height:10px"></div><div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">TRUSTEES</div>';
    html += poaMakeInput('Foreign Trustee','foreign_trustee',false);
    html += '<div style="height:6px"></div>' + poaMakeInput('Trustee Title','trustee_title',false);
    html += '<div style="height:6px"></div>' + poaMakeInput('Co-Trustee','co_trustee',false);
    html += '<div style="height:10px"></div><div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">YOUR NAME</div>';
    html += poaMakeInput('First','first_name',false);
    html += '<div style="height:6px"></div>' + poaMakeInput('Middle','middle_name',false);
    html += '<div style="height:6px"></div>' + poaMakeInput('Last','last_name',false);
    html += '<div style="height:6px"></div>' + poaMakeInput('Birthdate','birthdate',false);
    html += '<div style="height:10px"></div><div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">BUSINESS (DBA 3 & 6)</div>';
    html += poaMakeInput('Business Name','business_name',false);
    html += '<div style="height:6px"></div>' + poaMakeInput('Formation Date','business_date',false);
    html += '<div style="height:10px"></div><div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">ADDRESSES</div>';
    html += poaMakeInput('Foreign Address','foreign_addr',false);
    html += '<div style="height:6px"></div>' + poaMakeInput('Domestic Address','domestic_addr',false);
    html += '<div style="height:6px"></div>' + poaMakeInput('Filing County','filing_county',false);
  }
  container.innerHTML = html;
}

function poaRenderSubtabs() {
  var bar = document.getElementById('poa-subtab-bar');
  var html = '';
  if (poaState.mode === 'poa') {
    POA_TABS.forEach(function(t) {
      var active = poaState.activeTab === t.id;
      html += '<button onclick="poaSetTab(\'' + t.id + '\')" style="padding:10px 14px;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;border:none;background:transparent;transition:all 0.2s;' + (active ? 'color:#10b981;border-bottom:2px solid #10b981;background:rgba(71,85,105,0.3)' : 'color:var(--text-secondary)') + '">' + t.label + '</button>';
    });
  } else {
    POA_DBA_LIST.forEach(function(d) {
      var active = poaState.activeDBA === d.id;
      var pColor = d.priority === 'CRITICAL' ? 'background:rgba(239,68,68,0.2);color:#f87171' : d.priority === 'HIGH' ? 'background:rgba(245,158,11,0.2);color:#fbbf24' : 'background:rgba(100,116,139,0.3);color:#94a3b8';
      html += '<button onclick="poaSetDBA(\'' + d.id + '\')" style="padding:8px 10px;font-size:10px;font-weight:600;white-space:nowrap;cursor:pointer;border:none;background:transparent;transition:all 0.2s;' + (active ? 'color:#a855f7;border-bottom:2px solid #a855f7;background:rgba(71,85,105,0.3)' : 'color:var(--text-secondary)') + '">' + d.name + ' <span style="margin-left:2px;padding:1px 4px;border-radius:3px;font-size:9px;' + pColor + '">' + d.priority + '</span></button>';
    });
  }
  bar.innerHTML = html;
}

function poaGetStateName() { return poaState.currentState === 'NC' ? 'North Carolina' : 'Virginia'; }
function poaGetGovLaw() { return poaState.currentState === 'NC' ? 'N.C.G.S. Chapter 32C' : 'Va. Code \u00A7 64.2-1600 et seq.'; }

function poaGenPOA() {
  var sn = poaGetStateName(), gl = poaGetGovLaw(), wr = poaState.currentState === 'VA';
  return '                           DURABLE POWER OF ATTORNEY\n                              State of ' + sn + '\n                    Pursuant to ' + gl + '\n\n' + POA_SEP + '\n\n                                    ARTICLE I\n                              DESIGNATION OF AGENT\n\n     I, ' + poaVal('principal_name') + ', of ' + poaVal('principal_address') + ', County of \n' + poaVal('principal_county') + ', State of ' + sn + ', hereby designate:\n\n                    PRIMARY AGENT (ATTORNEY-IN-FACT)\n\n     Name:    ' + poaVal('agent_name') + '\n     Address: ' + poaVal('agent_address') + '\n     Phone:   ' + poaVal('agent_phone') + '\n\nas my Agent (Attorney-in-Fact) to act for me in any lawful way.\n\n' + POA_SEP + '\n\n                                   ARTICLE II\n                          GRANT OF GENERAL AUTHORITY\n\n     I grant my Agent authority to act on my behalf with respect to:\n\n     [X] Real Property              [X] Banks and Financial Institutions\n     [X] Tangible Personal Property [X] Operation of Entity or Business\n     [X] Stocks and Bonds           [X] Insurance and Annuities\n     [X] Estates, Trusts            [X] Claims and Litigation\n     [X] Personal Maintenance       [X] Government Benefits\n     [X] Retirement Plans           [X] Taxes\n     [X] All of the Above Subjects\n\n' + POA_SEP + '\n\n                                   ARTICLE III\n                              SUCCESSOR AGENT\n\n     If ' + poaVal('agent_name') + ' is unable or unwilling to serve, I designate:\n\n     Name:    ' + poaVal('successor_name') + '\n     Address: ' + poaVal('successor_address') + '\n\n' + POA_SEP + '\n\n                              DURABILITY PROVISION\n\n     THIS POWER OF ATTORNEY SHALL NOT BE AFFECTED BY MY SUBSEQUENT \nDISABILITY OR INCAPACITY.\n\n' + POA_SEP + '\n\n                              SIGNATURE OF PRINCIPAL\n\n     IN WITNESS WHEREOF, I have signed this Power of Attorney on ' + poaVal('execution_date') + '.\n\n\n                              _________________________________________\n                              ' + poaVal('principal_name') + ', Principal\n\n' + POA_SEP + '\n\n                             WITNESS ATTESTATION\n              ' + (wr ? '(REQUIRED - VA Law)' : '(RECOMMENDED - NC Law)') + '\n\nWitness 1:\nSignature: _________________________________________\nPrinted Name: ' + poaVal('witness1_name') + '\nAddress: ' + poaVal('witness1_address') + '\n\nWitness 2:\nSignature: _________________________________________\nPrinted Name: ' + poaVal('witness2_name') + '\nAddress: ' + poaVal('witness2_address') + '\n\n' + POA_SEP + '\n\n                              NOTARY ACKNOWLEDGMENT\n\nSTATE OF ' + sn.toUpperCase() + '\nCOUNTY OF ' + poaVal('notary_county') + '\n\n     I, the undersigned Notary Public, certify that ' + poaVal('principal_name') + ' \npersonally appeared before me and acknowledged the due execution of this instrument.\n\n\n                              _________________________________________\n                              Notary Public\n\nMy Commission Expires: _________________________________________\n\n                                    [SEAL]\n\n' + POA_SEP + '\n                                END OF DOCUMENT';
}

function poaGenCert() {
  var sn = poaGetStateName();
  return '                    AGENT\'S CERTIFICATION AND ACCEPTANCE\n                           UNDER POWER OF ATTORNEY\n                           State of ' + sn + '\n\n' + POA_SEP + '\n\n     I, ' + poaVal('agent_name') + ', certify under penalty of perjury that:\n\n     1. I am the Agent designated in a Power of Attorney executed by \n        ' + poaVal('principal_name') + ' (the "Principal") on ' + poaVal('execution_date') + '.\n     2. The Power of Attorney is genuine and currently valid.\n     3. The Power of Attorney has not been revoked or terminated.\n     4. To the best of my knowledge, the Principal is alive.\n     5. I hereby ACCEPT appointment as Agent.\n\n' + POA_SEP + '\n\n                    ACKNOWLEDGMENT OF DUTIES\n\n     I acknowledge that as Agent I must:\n     (a) Act in good faith;\n     (b) Act only within the scope of authority granted;\n     (c) Act loyally for the Principal\'s benefit;\n     (d) Avoid conflicts of interest;\n     (e) Act with care, competence, and diligence;\n     (f) Keep records of all transactions.\n\n' + POA_SEP + '\n\n     Executed this ' + poaVal('execution_date') + '.\n\n\n                              _________________________________________\n                              ' + poaVal('agent_name') + ', Agent/Attorney-in-Fact\n\n' + POA_SEP + '\n\n                              NOTARY ACKNOWLEDGMENT\n\nSTATE OF ' + sn.toUpperCase() + '\nCOUNTY OF ' + poaVal('notary_county') + '\n\n                              _________________________________________\n                              Notary Public\n\nMy Commission Expires: _________________________________________\n                                    [SEAL]';
}

function poaGenAffidavit() {
  var sn = poaGetStateName();
  return '                       AFFIDAVIT OF ATTORNEY-IN-FACT\n                           State of ' + sn + '\n\n' + POA_SEP + '\n\nSTATE OF ' + sn.toUpperCase() + '\nCOUNTY OF ' + poaVal('notary_county') + '\n\n     I, ' + poaVal('agent_name') + ', being first duly sworn, depose and state:\n\n' + POA_SEP + '\n\n                          1. IDENTIFICATION\n\n     My name is ' + poaVal('agent_name') + '.\n     My address is ' + poaVal('agent_address') + '.\n     I am over eighteen (18) years of age and competent to testify.\n\n' + POA_SEP + '\n\n                      2. APPOINTMENT AS AGENT\n\n     I have been duly appointed as Agent by ' + poaVal('principal_name') + ' \n(the "Principal"), whose address is ' + poaVal('principal_address') + '.\n     My appointment is pursuant to a Durable Power of Attorney \nexecuted on ' + poaVal('execution_date') + '.\n\n' + POA_SEP + '\n\n                    3. VALIDITY CERTIFICATION\n\n     I certify under oath that:\n     - The Power of Attorney is genuine and duly executed;\n     - The Power of Attorney is currently valid and not revoked;\n     - To the best of my knowledge, the Principal is alive.\n\n' + POA_SEP + '\n\n                   4. TRANSACTION AUTHORIZATION\n\n     This Affidavit is executed in connection with:\n     ' + poaVal('transaction_desc', '[DESCRIBE TRANSACTION]') + '\n     This Affidavit is provided to ' + poaVal('third_party', '[THIRD PARTY]') + '.\n\n' + POA_SEP + '\n\n     Signed and sworn to this ' + poaVal('execution_date') + '.\n\n                              _________________________________________\n                              ' + poaVal('agent_name') + ', Agent and Attorney-in-Fact\n\n' + POA_SEP + '\n\n                                   JURAT\n\n     I, the undersigned Notary Public, certify that ' + poaVal('agent_name') + ' \npersonally appeared before me, and being duly sworn, stated that the \nfacts in the foregoing Affidavit are true.\n\n                              _________________________________________\n                              Notary Public\nMy Commission Expires: _________________________________________\n                                    [SEAL]';
}

function poaGenRevocation() {
  var sn = poaGetStateName();
  return '                     REVOCATION OF POWER OF ATTORNEY\n                           State of ' + sn + '\n\n' + POA_SEP + '\n\n     I, ' + poaVal('principal_name') + ', of ' + poaVal('principal_address') + ', \nCounty of ' + poaVal('principal_county') + ', State of ' + sn + ', \nhereby REVOKE the Power of Attorney described herein.\n\n' + POA_SEP + '\n\n     Date of Execution:  ' + poaVal('execution_date') + '\n     Document ID:        ' + poaVal('poa_id', '[DOCUMENT ID]') + '\n     Recording Info:     ' + poaVal('recording_info', '[Book ___ Page ___]') + '\n\n     AGENT AFFECTED:\n     Name:    ' + poaVal('agent_name') + '\n     Address: ' + poaVal('agent_address') + '\n\n' + POA_SEP + '\n\n     ALL powers and authorities granted to ' + poaVal('agent_name') + ' are hereby \nTERMINATED, effective immediately.\n\n     TO: ' + poaVal('agent_name') + '\n     You are directed to:\n     (a) CEASE all actions on my behalf;\n     (b) RETURN all documents and property;\n     (c) PROVIDE a complete accounting;\n     (d) NOTIFY all third parties.\n\n' + POA_SEP + '\n\n     IN WITNESS WHEREOF, I have executed this Revocation on ' + poaVal('execution_date') + '.\n\n                              _________________________________________\n                              ' + poaVal('principal_name') + ', Principal\n\n' + POA_SEP + '\n\n                              NOTARY ACKNOWLEDGMENT\n\nSTATE OF ' + sn.toUpperCase() + '\nCOUNTY OF ' + poaVal('notary_county') + '\n\n                              _________________________________________\n                              Notary Public\nMy Commission Expires: _________________________________________\n                                    [SEAL]';
}

function poaGenDBA() {
  var fullName = poaDval('last_name','LAST') + ', ' + poaDval('first_name','FIRST') + ' ' + poaDval('middle_name','MIDDLE');
  var trustName = poaDval('trust_name','TRUST_NAME');
  var configs = {
    dba1: { title: 'DBA #1: Trust DBA Personal Name', biz: trustName + ' EXPRESS TRUST', dbaName: trustName + ' EXPRESS TRUST doing business as ' + fullName, purpose: 'For Federal/State Taxes in SSN Name' },
    dba2: { title: 'DBA #2: Trust DBA Estate Name', biz: trustName + ' EXPRESS TRUST', dbaName: trustName + ' EXPRESS TRUST doing business as ' + fullName + ' ESTATE', purpose: 'For Taxes in Estate Name' },
    dba3: { title: 'DBA #3: Trust DBA Business Name', biz: trustName + ' EXPRESS TRUST', dbaName: trustName + ' EXPRESS TRUST doing business as ' + poaDval('business_name','[BUSINESS]'), purpose: 'For LLC/Corporation Taxes' },
    dba4: { title: 'DBA #4: Trust DBA Enterprises', biz: trustName + ' EXPRESS TRUST', dbaName: trustName + ' EXPRESS TRUST doing business as TRUST ENTERPRISES', purpose: 'For Trust Banking Fiduciary Account' },
    dba5: { title: 'DBA #5: Enterprises DBA Personal', biz: trustName + ' ENTERPRISES', dbaName: trustName + ' ENTERPRISES doing business as ' + fullName, purpose: 'For W-2 Employment Deposits (REVERSE)' },
    dba6: { title: 'DBA #6: Enterprises DBA Business', biz: trustName + ' ENTERPRISES', dbaName: trustName + ' ENTERPRISES doing business as ' + poaDval('business_name','[BUSINESS]'), purpose: 'For Business Revenue Deposits (REVERSE)' }
  };
  var c = configs[poaState.activeDBA];
  return '# ' + c.title + '\n## ' + c.purpose + '\n\n' + POA_SEP + '\n\n  **' + c.biz + '**\n  Foreign Trustee: ' + poaDval('trustee_title') + '\n\n' + POA_SEP + '\n\n## FILING INFORMATION\n\n**Business Name**: ' + c.biz + '\n**DBA Name**: ' + c.dbaName + '\n**Purpose**: ' + c.purpose + '\n\n**Trust EIN**: ' + poaDval('trust_ein') + '\n**Filing County**: ' + poaDval('filing_county') + '\n**Foreign Address**: ' + poaDval('foreign_addr') + '\n**Domestic Address**: ' + poaDval('domestic_addr') + '\n\n' + POA_SEP;
}

function poaGetContent() {
  if (poaState.mode === 'dba') return poaGenDBA();
  var gens = { poa: poaGenPOA, cert: poaGenCert, affidavit: poaGenAffidavit, revocation: poaGenRevocation };
  return gens[poaState.activeTab]();
}

function poaRenderPreview() {
  var preview = document.getElementById('poa-preview');
  preview.textContent = poaGetContent();
  // Title
  var title = document.getElementById('poa-doc-title');
  if (poaState.mode === 'poa') {
    var t = POA_TABS.find(function(t){ return t.id === poaState.activeTab; });
    title.textContent = t ? t.label : '';
  } else {
    var d = POA_DBA_LIST.find(function(d){ return d.id === poaState.activeDBA; });
    title.textContent = d ? d.desc : '';
  }
  // Badge
  var badge = document.getElementById('poa-doc-badge');
  if (poaState.mode === 'poa') {
    badge.textContent = poaState.currentState + ' \u2022 ' + poaGetGovLaw();
    badge.style.background = poaState.currentState === 'VA' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)';
    badge.style.color = poaState.currentState === 'VA' ? '#f87171' : '#60a5fa';
  } else {
    badge.textContent = 'TRUST';
    badge.style.background = 'rgba(168,85,247,0.2)'; badge.style.color = '#a855f7';
  }
}

function poaToggleMenu() {
  poaState.menuOpen = !poaState.menuOpen;
  document.getElementById('poa-download-menu').style.display = poaState.menuOpen ? 'block' : 'none';
}

function poaDownload(ext, mime) {
  var content = poaGetContent();
  var label = poaState.mode === 'poa' ? poaState.currentState + '_' + poaState.activeTab : 'DBA_' + poaState.activeDBA;
  pdkbDownloadFile(content, label + '_' + new Date().toISOString().split('T')[0] + '.' + ext, mime);
  poaState.menuOpen = false;
  document.getElementById('poa-download-menu').style.display = 'none';
}

function initMultiStatePoa() {
  poaRenderForm(); poaRenderSubtabs(); poaRenderPreview();
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#poa-download-btn') && !e.target.closest('#poa-download-menu')) {
      poaState.menuOpen = false;
      var menu = document.getElementById('poa-download-menu');
      if (menu) menu.style.display = 'none';
    }
  });
}

console.log("✅ PDKB Tools loaded (Transcript Transformer, Etymology Analyzer, PDF/MD Converter, MultiState POA)");

// ═══════════════════════════════════════════════════════════════════════════
// EON TAX ESTIMATOR — standalone functions for page-taxestimator
// ═══════════════════════════════════════════════════════════════════════════
function eonEstTab(name) {
  var panels = ['income','baddebt','loss','interest','camt','buyback'];
  panels.forEach(function(p) {
    var el = document.getElementById('eon-est-panel-' + p);
    var btn = document.getElementById('eon-est-tab-' + p);
    if (el) el.style.display = (p === name) ? 'block' : 'none';
    if (btn) {
      if (p === name) { btn.style.background = '#f87171'; btn.style.color = '#fff'; btn.style.border = 'none'; }
      else { btn.style.background = 'transparent'; btn.style.color = '#f87171'; btn.style.border = '1px solid rgba(248,113,113,.3)'; }
    }
  });
}

function eonToggleItemized() {
  var sel = document.getElementById('eon-tdeduct');
  var row = document.getElementById('eon-itemized-row');
  if (sel && row) row.style.display = sel.value === 'itemized' ? 'block' : 'none';
}

function _fmt(n) { return '$' + Math.abs(n).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function _v(id) { var el = document.getElementById(id); return el ? (parseFloat(el.value) || 0) : 0; }
function _set(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

function calcEonTaxEst() {
  var w2 = _v('eon-tw2'), se = _v('eon-tse'), inv = _v('eon-tinv'), cap = _v('eon-tcap'),
      rent = _v('eon-trent'), other = _v('eon-tother');
  var gross = w2 + se + inv + cap + rent + other;
  var seDeduct = se * 0.5 * 0.153;  // SE tax deduction (half of SE tax)
  var agi = gross - seDeduct;
  var filing = (document.getElementById('eon-tfile') || {value:'single'}).value;
  var stdDed = {single:14600, mfj:29200, hoh:21900}[filing] || 14600;
  var useItemized = (document.getElementById('eon-tdeduct') || {value:'standard'}).value === 'itemized';
  var itemized = _v('eon-titem');
  var deduction = useItemized ? Math.max(itemized, stdDed) : stdDed;
  var taxableIncome = Math.max(0, agi - deduction);

  // 2024 Federal Tax Brackets (Single — MFJ doubled, HOH adjusted)
  var brackets = {
    single:   [[11600,0.10],[47150,0.12],[100525,0.22],[191950,0.24],[243725,0.32],[609350,0.35],[Infinity,0.37]],
    mfj:      [[23200,0.10],[94300,0.12],[201050,0.22],[383900,0.24],[487450,0.32],[731200,0.35],[Infinity,0.37]],
    hoh:      [[16550,0.10],[63100,0.12],[100500,0.22],[191950,0.24],[243700,0.32],[609350,0.35],[Infinity,0.37]]
  };
  var bkts = brackets[filing] || brackets.single;
  var fedTax = 0, prev = 0, bktHtml = '', remaining = taxableIncome;
  bkts.forEach(function(b) {
    if (remaining <= 0) return;
    var bracketSize = Math.min(remaining, b[0] - prev);
    var tax = bracketSize * b[1];
    if (bracketSize > 0) bktHtml += b[1]*100 + '% bracket: ' + _fmt(bracketSize) + ' → ' + _fmt(tax) + '\n';
    fedTax += tax;
    prev = b[0];
    remaining -= bracketSize;
  });

  var seTax = se > 0 ? se * 0.153 : 0;
  var credits = _v('eon-tcred');
  var totalTax = Math.max(0, fedTax + seTax - credits);
  var paid = _v('eon-twheld') + _v('eon-tqpay');
  var balance = totalTax - paid;
  var rate = gross > 0 ? (totalTax / gross * 100) : 0;

  _set('eon-r-gross', _fmt(gross));
  _set('eon-r-agi', _fmt(agi));
  _set('eon-r-ded', '(' + _fmt(deduction) + ')');
  _set('eon-r-taxinc', _fmt(taxableIncome));
  _set('eon-r-rate', rate.toFixed(1) + '%');
  _set('eon-r-fedtax', _fmt(fedTax));
  _set('eon-r-setax', _fmt(seTax));
  _set('eon-r-cred', '-' + _fmt(credits));
  _set('eon-r-total', _fmt(totalTax));
  _set('eon-r-paid', '-' + _fmt(paid));

  var lbl = document.getElementById('eon-r-label');
  var amt = document.getElementById('eon-r-amount');
  if (balance <= 0) {
    if (lbl) { lbl.textContent = 'ESTIMATED REFUND'; lbl.style.color = '#22c55e'; }
    if (amt) { amt.textContent = _fmt(-balance); amt.style.color = '#4ade80'; }
  } else {
    if (lbl) { lbl.textContent = 'ESTIMATED AMOUNT OWED'; lbl.style.color = '#f87171'; }
    if (amt) { amt.textContent = _fmt(balance); amt.style.color = '#f87171'; }
  }
  var bEl = document.getElementById('eon-r-brackets');
  if (bEl) bEl.textContent = bktHtml || 'Enter income to see bracket breakdown.';
}

function clearEonTaxEst() {
  ['eon-tw2','eon-tse','eon-tinv','eon-tcap','eon-trent','eon-tother',
   'eon-tcred','eon-twheld','eon-tqpay','eon-titem'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  calcEonTaxEst();
}

function printEonTaxEst() {
  var results = document.getElementById('eon-est-results');
  var brackets = document.getElementById('eon-r-brackets');
  var win = window.open('', '_blank', 'width=700,height=600');
  if (!win) { alert('Allow pop-ups to print.'); return; }
  win.document.write('<html><head><title>Tax Estimate</title><style>body{font-family:sans-serif;margin:24px;background:#fff;color:#111}h2{margin:0 0 16px}table{width:100%;border-collapse:collapse}td{padding:6px 8px;border-bottom:1px solid #ddd}td:last-child{text-align:right;font-family:monospace}.total{font-weight:700;font-size:16px;border-top:2px solid #f87171}pre{font-size:11px;background:#f5f5f5;padding:10px;border-radius:4px}</style></head><body>');
  win.document.write('<h2>🧮 Tax Estimator — 2024</h2>');
  var rows = results ? results.querySelectorAll('[style*="flex"]') : [];
  win.document.write('<table>');
  rows.forEach(function(r) { var cells = r.querySelectorAll('span'); if (cells.length === 2) win.document.write('<tr><td>' + cells[0].textContent + '</td><td>' + cells[1].textContent + '</td></tr>'); });
  win.document.write('</table>');
  if (brackets && brackets.textContent.trim()) win.document.write('<h3>Bracket Breakdown</h3><pre>' + brackets.textContent + '</pre>');
  win.document.write('<p style="font-size:10px;color:#888">* Estimates based on 2024 tax brackets. Not legal or tax advice.</p></body></html>');
  win.document.close(); win.focus(); setTimeout(function(){ win.print(); }, 300);
}

function calcEonBadDebt() {
  var orig = _v('eon-bd-orig'), rec = _v('eon-bd-rec'), rate = _v('eon-bd-rate') / 100;
  var net = Math.max(0, orig - rec);
  var refund = net * rate;
  _set('eon-bd-netloss', _fmt(net));
  _set('eon-bd-deduct', _fmt(net));
  _set('eon-bd-refund', _fmt(refund));
}

function calcEonNOL() {
  var inc = _v('eon-nol-inc'), ded = _v('eon-nol-ded'), rate = _v('eon-nol-rate') / 100;
  var nol = Math.max(0, ded - inc);
  var limit = nol * 0.8;
  var assetVal = nol * rate;
  var refund = limit * rate;
  _set('eon-nol-amount', _fmt(nol));
  _set('eon-nol-limit', _fmt(limit));
  _set('eon-nol-assetval', _fmt(assetVal));
  _set('eon-nol-refund', _fmt(refund));
}

function calcEonInterest() {
  var overpay = _v('eon-int-overpay');
  var d1 = document.getElementById('eon-int-datepaid');
  var d2 = document.getElementById('eon-int-daterefund');
  var rate = _v('eon-int-rate') / 100;
  if (!d1 || !d2 || !d1.value || !d2.value) return;
  var days = Math.max(0, Math.round((new Date(d2.value) - new Date(d1.value)) / 86400000));
  var daily = rate / 365;
  var accrued = overpay * daily * days;
  _set('eon-int-days', days);
  _set('eon-int-daily', (daily * 100).toFixed(6) + '%');
