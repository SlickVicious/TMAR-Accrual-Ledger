/**
 * TMAR Key Manager v1.0
 * Floating 🔐 button → slide-out panel for managing all API keys.
 * Self-contained — no external deps. Matches TMAR dark theme.
 */
(function () {
  'use strict';

  // ── Provider registry ──────────────────────────────────────────────────────
  var PROVIDERS = [
    {
      id:          'claude',
      label:       'Anthropic (Claude)',
      lsKey:       'eeon_key_claude',
      aliases:     ['_trustApiKey', 'TMAR_trustApiKey', 'tmar_claude_key', 'stg_key_claude'],
      envKeys:     ['ANTHROPIC_API_KEY', 'ANTHROPIC_LEDGER_KEY'],
      required:    true,
      placeholder: 'sk-ant-api03-...',
      testType:    'anthropic'
    },
    {
      id:          'openai',
      label:       'OpenAI',
      lsKey:       'eeon_key_openai',
      envKeys:     ['OPENAI_API_KEY'],
      placeholder: 'sk-...',
      testType:    'bearer',
      testUrl:     'https://api.openai.com/v1/models'
    },
    {
      id:          'deepseek',
      label:       'DeepSeek',
      lsKey:       'eeon_key_deepseek',
      envKeys:     ['DEEPSEEK_API_KEY'],
      placeholder: 'sk-...',
      testType:    'bearer',
      testUrl:     'https://api.deepseek.com/models'
    },
    {
      id:          'gemini',
      label:       'Gemini (Google)',
      lsKey:       'eeon_key_zai',
      envKeys:     ['GEMINI_API_KEY', 'GEMINI_LEDGER_KEY'],
      placeholder: 'AIza...',
      testType:    'gemini'
    },
    {
      id:          'perplexity',
      label:       'Perplexity',
      lsKey:       'eeon_key_perplexity',
      envKeys:     ['PERPLEXITY_API_KEY'],
      placeholder: 'pplx-...',
      testType:    'bearer',
      testUrl:     'https://api.perplexity.ai/models'
    },
    {
      id:          'openrouter',
      label:       'OpenRouter',
      lsKey:       'eeon_key_openrouter',
      envKeys:     ['OPENROUTER_API_KEY'],
      placeholder: 'sk-or-v1-...',
      testType:    'bearer',
      testUrl:     'https://openrouter.ai/api/v1/models'
    },
    {
      id:          'xai',
      label:       'xAI (Grok)',
      lsKey:       'eeon_key_xai',
      envKeys:     ['GROK_API_KEY', 'XAI_WEBCLIPPER_KEY'],
      placeholder: 'xai-...',
      testType:    'bearer',
      testUrl:     'https://api.x.ai/v1/models'
    },
    {
      id:          'huggingface',
      label:       'HuggingFace',
      lsKey:       'eeon_key_huggingface',
      envKeys:     ['HUGGINGFACE_API_KEY'],
      placeholder: 'hf_...',
      testType:    'hf'
    },
    {
      id:          'github',
      label:       'GitHub PAT',
      lsKey:       'eeon_key_github',
      envKeys:     ['GITHUB_PAT'],
      placeholder: 'ghp_...',
      testType:    'github'
    },
    {
      id:          'datagov',
      label:       'Data.gov',
      lsKey:       'eeon_key_datagov',
      envKeys:     ['DATA_GOV_API_KEY'],
      placeholder: 'API key...',
      testType:    'datagov'
    }
  ];

  // .env variable name → localStorage key (matches existing ENV_TO_LS_MAP)
  var ENV_MAP = {
    'ANTHROPIC_API_KEY':    'eeon_key_claude',
    'ANTHROPIC_LEDGER_KEY': 'eeon_key_claude',
    'OPENAI_API_KEY':       'eeon_key_openai',
    'DEEPSEEK_API_KEY':     'eeon_key_deepseek',
    'GROK_API_KEY':         'eeon_key_xai',
    'XAI_WEBCLIPPER_KEY':   'eeon_key_xai',
    'GEMINI_API_KEY':       'eeon_key_zai',
    'GEMINI_LEDGER_KEY':    'eeon_key_zai',
    'OPENROUTER_API_KEY':   'eeon_key_openrouter',
    'PERPLEXITY_API_KEY':   'eeon_key_perplexity',
    'HUGGINGFACE_API_KEY':  'eeon_key_huggingface',
    'COHERE_API_KEY':       'eeon_key_cohere',
    'GITHUB_PAT':           'eeon_key_github',
    'DATA_GOV_API_KEY':     'eeon_key_datagov',
    'BRAVE_API_KEY':        'eeon_key_brave',
    'PINECONE_API_KEY':     'eeon_key_pinecone',
    'POSTMAN_API_KEY':      'eeon_key_postman',
    'N8N_API_TOKEN':        'eeon_key_n8n',
    'TAVILY_API_KEY':       'stg_key_tavily',
    'FIRECRAWL_API_KEY':    'stg_key_firecrawl',
    'MEM0_API_KEY':         'stg_key_mem0',
    'SUPABASE_SERVICE_KEY': 'eeon_key_supabase'
  };

  // ── CSS ────────────────────────────────────────────────────────────────────
  var css = [
    '#tkm-btn{position:fixed;bottom:22px;right:22px;z-index:99999;width:46px;height:46px;border-radius:50%;',
    'background:#1e293b;border:2px solid #334155;color:#e2e8f0;font-size:20px;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.5);',
    'transition:transform .15s,box-shadow .15s;}',
    '#tkm-btn:hover{transform:scale(1.1);box-shadow:0 6px 24px rgba(0,0,0,.7);}',
    '@keyframes tkmPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.6);}50%{box-shadow:0 0 0 8px rgba(239,68,68,0);}}',
    '#tkm-btn.pulse{animation:tkmPulse 1.8s infinite;border-color:#ef4444;}',
    '#tkm-panel{position:fixed;bottom:80px;right:22px;z-index:99998;width:420px;max-width:calc(100vw - 44px);',
    'max-height:80vh;background:#0f172a;border:1px solid #1e293b;border-radius:14px;',
    'box-shadow:0 20px 60px rgba(0,0,0,.8);display:flex;flex-direction:column;',
    'transform:translateY(20px) scale(.96);opacity:0;pointer-events:none;',
    'transition:transform .2s cubic-bezier(.34,1.56,.64,1),opacity .2s;}',
    '#tkm-panel.open{transform:translateY(0) scale(1);opacity:1;pointer-events:all;}',
    '#tkm-head{padding:14px 16px 10px;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}',
    '#tkm-head h3{margin:0;font-size:14px;font-weight:700;color:#f1f5f9;letter-spacing:.3px;}',
    '#tkm-head-btns{display:flex;gap:6px;}',
    '.tkm-hbtn{padding:5px 10px;font-size:11px;border-radius:6px;border:1px solid #334155;',
    'background:#1e293b;color:#94a3b8;cursor:pointer;transition:background .15s,color .15s;}',
    '.tkm-hbtn:hover{background:#334155;color:#f1f5f9;}',
    '#tkm-body{overflow-y:auto;padding:10px 12px;flex:1;}',
    '.tkm-row{display:grid;grid-template-columns:1fr auto auto auto;gap:6px;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04);}',
    '.tkm-row:last-child{border-bottom:none;}',
    '.tkm-label{font-size:11px;font-weight:600;color:#94a3b8;white-space:nowrap;}',
    '.tkm-label.required::after{content:" *";color:#ef4444;}',
    '.tkm-inp-wrap{position:relative;grid-column:1/-1;display:flex;gap:4px;margin-top:3px;}',
    '.tkm-inp{flex:1;padding:7px 10px;background:#1e293b;border:1px solid #334155;border-radius:7px;',
    'color:#e2e8f0;font-size:12px;font-family:monospace;transition:border-color .15s;}',
    '.tkm-inp:focus{outline:none;border-color:#6366f1;}',
    '.tkm-inp.ok{border-color:#22c55e;}',
    '.tkm-inp.err{border-color:#ef4444;}',
    '.tkm-btn-sm{padding:6px 9px;font-size:12px;border-radius:6px;border:1px solid #334155;',
    'background:#1e293b;color:#94a3b8;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .15s,color .15s;}',
    '.tkm-btn-sm:hover{background:#334155;color:#f1f5f9;}',
    '.tkm-save{background:rgba(99,102,241,.15);border-color:rgba(99,102,241,.4);color:#818cf8;}',
    '.tkm-save:hover{background:rgba(99,102,241,.3);}',
    '.tkm-status{font-size:10px;grid-column:1/-1;height:14px;margin-top:1px;}',
    '.tkm-status.ok{color:#22c55e;}',
    '.tkm-status.err{color:#ef4444;}',
    '.tkm-status.info{color:#60a5fa;}',
    '#tkm-env{padding:10px 12px;border-top:1px solid #1e293b;flex-shrink:0;}',
    '#tkm-env summary{font-size:11px;color:#64748b;cursor:pointer;user-select:none;padding:4px 0;}',
    '#tkm-env summary:hover{color:#94a3b8;}',
    '#tkm-env-area{width:100%;height:90px;margin-top:8px;padding:8px;background:#1e293b;',
    'border:1px solid #334155;border-radius:7px;color:#94a3b8;font-size:11px;',
    'font-family:monospace;resize:vertical;box-sizing:border-box;}',
    '#tkm-env-area:focus{outline:none;border-color:#6366f1;color:#e2e8f0;}',
    '#tkm-env-btns{display:flex;gap:6px;margin-top:6px;}',
    '#tkm-env-status{font-size:11px;color:#22c55e;margin-top:4px;min-height:16px;}'
  ].join('');

  // ── DOM helpers ────────────────────────────────────────────────────────────
  function injectCSS() {
    var s = document.createElement('style');
    s.id = 'tkm-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildPanel() {
    // Floating button
    var btn = document.createElement('button');
    btn.id = 'tkm-btn';
    btn.title = 'API Key Manager';
    btn.innerHTML = '🔐';
    btn.addEventListener('click', togglePanel);
    document.body.appendChild(btn);

    // Panel
    var panel = document.createElement('div');
    panel.id = 'tkm-panel';
    panel.innerHTML = [
      '<div id="tkm-head">',
        '<h3>🔐 API Key Manager</h3>',
        '<div id="tkm-head-btns">',
          '<button class="tkm-hbtn" id="tkm-testall" title="Test all filled keys">⚡ Test All</button>',
          '<button class="tkm-hbtn" onclick="document.getElementById(\'tkm-panel\').classList.remove(\'open\')">✕</button>',
        '</div>',
      '</div>',
      '<div id="tkm-body"></div>',
      '<details id="tkm-env">',
        '<summary>📥 Import .env file</summary>',
        '<textarea id="tkm-env-area" placeholder="Paste .env contents here&#10;ANTHROPIC_API_KEY=sk-ant-...&#10;OPENAI_API_KEY=sk-..."></textarea>',
        '<div id="tkm-env-btns">',
          '<button class="tkm-hbtn" id="tkm-env-import">Import Keys</button>',
          '<button class="tkm-hbtn" onclick="document.getElementById(\'tkm-env-area\').value=\'\'">Clear</button>',
        '</div>',
        '<div id="tkm-env-status"></div>',
      '</details>'
    ].join('');
    document.body.appendChild(panel);

    document.getElementById('tkm-testall').addEventListener('click', testAll);
    document.getElementById('tkm-env-import').addEventListener('click', importEnv);

    renderRows();
    checkRequired();
  }

  function renderRows() {
    var body = document.getElementById('tkm-body');
    if (!body) return;
    body.innerHTML = PROVIDERS.map(function (p) {
      var val = localStorage.getItem(p.lsKey) || '';
      return [
        '<div class="tkm-row" id="tkm-row-' + p.id + '">',
          '<span class="tkm-label' + (p.required ? ' required' : '') + '">' + p.label + '</span>',
          '<div class="tkm-inp-wrap">',
            '<input class="tkm-inp" id="tkm-inp-' + p.id + '" type="password"',
            ' placeholder="' + p.placeholder + '"',
            ' value="' + esc(val) + '"',
            ' autocomplete="off" spellcheck="false">',
            '<button class="tkm-btn-sm" title="Show/hide" onclick="tkmToggleVis(\'' + p.id + '\')">👁</button>',
            '<button class="tkm-btn-sm tkm-save" onclick="tkmSave(\'' + p.id + '\')">Save</button>',
            '<button class="tkm-btn-sm" title="Test key" onclick="tkmTest(\'' + p.id + '\')">⚡</button>',
          '</div>',
          '<div class="tkm-status" id="tkm-st-' + p.id + '"></div>',
        '</div>'
      ].join('');
    }).join('');

    // Enter key saves
    PROVIDERS.forEach(function (p) {
      var inp = document.getElementById('tkm-inp-' + p.id);
      if (inp) inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') tkmSave(p.id);
      });
    });
  }

  // ── Core actions ───────────────────────────────────────────────────────────
  window.tkmSave = function (id) {
    var p = providerById(id);
    if (!p) return;
    var inp = document.getElementById('tkm-inp-' + id);
    if (!inp) return;
    var val = inp.value.trim();

    localStorage.setItem(p.lsKey, val);

    // Sync aliases
    if (p.aliases) {
      p.aliases.forEach(function (a) { localStorage.setItem(a, val); });
    }

    // For Anthropic, also set window._trustApiKey
    if (id === 'claude') {
      window._trustApiKey = val;
    }

    // Backup to IDB if backupKeysToIDB exists
    if (typeof backupKeysToIDB === 'function') backupKeysToIDB();

    setStatus(id, val ? '✅ Saved' : '⚪ Cleared', val ? 'ok' : 'info');
    inp.className = 'tkm-inp' + (val ? ' ok' : '');
    checkRequired();
  };

  window.tkmToggleVis = function (id) {
    var inp = document.getElementById('tkm-inp-' + id);
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
  };

  window.tkmTest = function (id) {
    var p = providerById(id);
    if (!p) return;
    var key = localStorage.getItem(p.lsKey) || '';
    var inp = document.getElementById('tkm-inp-' + id);
    if (inp && inp.value.trim()) key = inp.value.trim();
    if (!key) { setStatus(id, '⚠️ No key — save first', 'err'); return; }
    setStatus(id, '⏳ Testing…', 'info');
    runTest(p, key).then(function (msg) {
      setStatus(id, msg.ok ? '✅ ' + msg.text : '❌ ' + msg.text, msg.ok ? 'ok' : 'err');
      var inp2 = document.getElementById('tkm-inp-' + id);
      if (inp2) inp2.className = 'tkm-inp ' + (msg.ok ? 'ok' : 'err');
    });
  };

  function testAll() {
    var btn = document.getElementById('tkm-testall');
    if (btn) btn.disabled = true;
    var queue = PROVIDERS.filter(function (p) {
      return !!(localStorage.getItem(p.lsKey) || '').trim();
    });
    var i = 0;
    function next() {
      if (i >= queue.length) { if (btn) btn.disabled = false; return; }
      var p = queue[i++];
      setStatus(p.id, '⏳ Testing…', 'info');
      runTest(p, localStorage.getItem(p.lsKey)).then(function (msg) {
        setStatus(p.id, msg.ok ? '✅ ' + msg.text : '❌ ' + msg.text, msg.ok ? 'ok' : 'err');
        var inp = document.getElementById('tkm-inp-' + p.id);
        if (inp) inp.className = 'tkm-inp ' + (msg.ok ? 'ok' : 'err');
        setTimeout(next, 400);
      });
    }
    next();
  }

  function importEnv() {
    var raw = (document.getElementById('tkm-env-area') || {}).value || '';
    var lines = raw.split('\n');
    var imported = 0;
    var skipped = 0;
    lines.forEach(function (line) {
      line = line.trim();
      if (!line || line.charAt(0) === '#') return;
      var eqIdx = line.indexOf('=');
      if (eqIdx < 1) return;
      var key = line.slice(0, eqIdx).trim();
      var val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      var lsKey = ENV_MAP[key];
      if (!lsKey || !val) { skipped++; return; }
      localStorage.setItem(lsKey, val);
      // Sync Anthropic aliases
      if (lsKey === 'eeon_key_claude') {
        ['_trustApiKey', 'TMAR_trustApiKey', 'tmar_claude_key', 'stg_key_claude'].forEach(function (a) {
          localStorage.setItem(a, val);
        });
        window._trustApiKey = val;
      }
      imported++;
    });
    if (typeof backupKeysToIDB === 'function') backupKeysToIDB();
    var st = document.getElementById('tkm-env-status');
    if (st) st.textContent = '✅ Imported ' + imported + ' key(s)' + (skipped ? ' (' + skipped + ' unrecognized lines skipped)' : '');
    renderRows();
    checkRequired();
  }

  // ── Test runners ───────────────────────────────────────────────────────────
  function runTest(p, key) {
    var corsProxy = (localStorage.getItem('eeon_cors_proxy') || '').replace(/\/$/, '');
    switch (p.testType) {
      case 'anthropic': return testAnthropic(key, corsProxy);
      case 'gemini':    return testGemini(key);
      case 'hf':        return testHF(key);
      case 'github':    return testGitHub(key);
      case 'datagov':   return testDataGov(key);
      default:          return testBearer(key, p.testUrl);
    }
  }

  function fetchJSON(url, opts) {
    return fetch(url, opts || {})
      .then(function (r) { return { ok: r.ok, status: r.status, json: r.json.bind(r) }; })
      .catch(function (e) { return { ok: false, status: 0, err: e.message || String(e) }; });
  }

  function testAnthropic(key, proxy) {
    var url = (proxy ? proxy + '/v1/models' : 'https://api.anthropic.com/v1/models');
    return fetchJSON(url, {
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' }
    }).then(function (r) {
      if (r.status === 200) return { ok: true,  text: 'Valid — Anthropic' };
      if (r.status === 401) return { ok: false, text: 'Invalid key (401)' };
      if (r.status === 0)   return { ok: null,  text: 'CORS blocked — format ' + (key.startsWith('sk-ant-') ? 'looks valid ✓' : 'invalid') };
      return { ok: false, text: 'HTTP ' + r.status };
    });
  }

  function testBearer(key, url) {
    if (!url) return Promise.resolve({ ok: null, text: 'No test URL configured' });
    return fetchJSON(url, {
      headers: { 'Authorization': 'Bearer ' + key }
    }).then(function (r) {
      if (r.status === 200) return { ok: true,  text: 'Valid' };
      if (r.status === 401 || r.status === 403) return { ok: false, text: 'Invalid key (' + r.status + ')' };
      if (r.status === 0)   return { ok: null,  text: 'CORS blocked — cannot verify' };
      return { ok: false, text: 'HTTP ' + r.status };
    });
  }

  function testGemini(key) {
    return fetchJSON('https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key))
      .then(function (r) {
        if (r.status === 200) return { ok: true,  text: 'Valid — Gemini' };
        if (r.status === 400 || r.status === 403) return { ok: false, text: 'Invalid key (' + r.status + ')' };
        if (r.status === 0)   return { ok: null,  text: 'CORS blocked — cannot verify' };
        return { ok: false, text: 'HTTP ' + r.status };
      });
  }

  function testHF(key) {
    return fetchJSON('https://huggingface.co/api/whoami', {
      headers: { 'Authorization': 'Bearer ' + key }
    }).then(function (r) {
      if (r.status === 200) return { ok: true,  text: 'Valid — HuggingFace' };
      if (r.status === 401) return { ok: false, text: 'Invalid token (401)' };
      if (r.status === 0)   return { ok: null,  text: 'CORS blocked — cannot verify' };
      return { ok: false, text: 'HTTP ' + r.status };
    });
  }

  function testGitHub(key) {
    return fetchJSON('https://api.github.com/user', {
      headers: { 'Authorization': 'Bearer ' + key, 'X-GitHub-Api-Version': '2022-11-28' }
    }).then(function (r) {
      if (r.status === 200) return r.json().then(function (j) { return { ok: true, text: 'Valid — @' + (j.login || 'user') }; });
      if (r.status === 401) return { ok: false, text: 'Invalid token (401)' };
      if (r.status === 0)   return { ok: null,  text: 'CORS blocked — cannot verify' };
      return { ok: false, text: 'HTTP ' + r.status };
    });
  }

  function testDataGov(key) {
    return fetchJSON('https://api.data.gov/api/verify_key?api_key=' + encodeURIComponent(key))
      .then(function (r) {
        if (r.status === 200) return { ok: true,  text: 'Valid — data.gov' };
        if (r.status === 403) return { ok: false, text: 'Invalid key (403)' };
        if (r.status === 0)   return { ok: null,  text: 'CORS blocked — cannot verify' };
        return { ok: false, text: 'HTTP ' + r.status };
      });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function setStatus(id, text, cls) {
    var el = document.getElementById('tkm-st-' + id);
    if (!el) return;
    el.textContent = text;
    el.className = 'tkm-status ' + (cls || '');
  }

  function checkRequired() {
    var btn = document.getElementById('tkm-btn');
    if (!btn) return;
    var missing = PROVIDERS.some(function (p) { return p.required && !(localStorage.getItem(p.lsKey) || '').trim(); });
    btn.classList.toggle('pulse', missing);
    btn.title = missing ? '🔐 API Key Manager — missing required key' : '🔐 API Key Manager';
  }

  function providerById(id) {
    for (var i = 0; i < PROVIDERS.length; i++) { if (PROVIDERS[i].id === id) return PROVIDERS[i]; }
    return null;
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function togglePanel() {
    var panel = document.getElementById('tkm-panel');
    if (!panel) return;
    var open = panel.classList.toggle('open');
    if (open) { renderRows(); checkRequired(); }
  }

  // ── Boot ───────────────────────────────────────────────────────────────────
  function init() {
    if (document.getElementById('tkm-btn')) return; // already mounted
    injectCSS();
    buildPanel();
    // Re-check pulse whenever localStorage changes (e.g. vault unlock injects keys)
    window.addEventListener('storage', checkRequired);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
