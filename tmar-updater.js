/**
 * TMAR Universal Accrual Ledger — Auto-Updater Module
 * =====================================================
 * Drop this script into your TMAR HTML (or load via <script src="tmar-updater.js">).
 *
 * What it does:
 *   1. Fetches the latest GAAPCLAW source from redressright.me/GAAP.html
 *   2. Computes a hash to detect real changes vs. your current version
 *   3. Backs up ALL localStorage/sessionStorage data before any update
 *   4. Lets you preview a diff summary before applying
 *   5. Injects ONLY net-new functions/CSS — never removes or replaces existing code
 *   6. Offers a "Download Merged" option for a persistent, git-deployable merged file
 *   7. Keeps a rollback snapshot so you can revert injected additions
 *
 * IMPORTANT — Update Modes:
 *   "Inject New Functions" — Additively injects net-new functions from upstream into
 *     the current browser session only. Your customizations are untouched. Injections
 *     are NOT persistent — they disappear on next page load.
 *
 *   "Download Merged File" — Generates a full merged HTML file (your TMAR + upstream
 *     additions) for download. Review it, then deploy via git for a persistent update.
 *     This is the recommended workflow.
 *
 * Configuration — edit these constants to match your setup:
 */

const TMAR_UPDATER_CONFIG = {
  // The canonical upstream URL
  upstreamURL: 'https://redressright.me/GAAP.html',

  // Your Cloudflare Worker CORS proxy (primary)
  corsProxy: 'https://crimson-recipe-cdfd.rhymeminded.workers.dev/?url=',

  // Fallback proxy if worker is down
  corsProxyFallback: 'https://corsproxy.io/?',

  // GitHub repo parity fingerprint — shared source of truth with
  // your GitHub Actions parity-check workflow
  parityFingerprintURL: 'https://raw.githubusercontent.com/SlickVicious/TMAR-Accrual-Ledger/master/parity-fingerprint.json',

  // localStorage key prefix for updater metadata
  storagePrefix: 'tmar_updater_',

  // How often to auto-check (ms). 0 = manual only.
  autoCheckInterval: 0,

  // Filename for downloaded merged files
  mergedFilename: 'TMAR-Accrual-Ledger-merged.html',
};


// ============================================================
//  CORE UPDATER
// ============================================================

class TmarUpdater {
  constructor(config = TMAR_UPDATER_CONFIG) {
    this.config = config;
    this.upstreamHTML = null;
    this.currentHash = null;
    this.upstreamHash = null;
  }

  // --- Hashing utility (SHA-256 via SubtleCrypto) ---
  async hash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // --- Fetch upstream with Cloudflare Worker primary, fallback chain ---
  async fetchUpstream() {
    const { upstreamURL, corsProxy, corsProxyFallback } = this.config;

    // Try direct first (in case CORS is ever added)
    try {
      const resp = await fetch(upstreamURL, { cache: 'no-store' });
      if (resp.ok) {
        this.upstreamHTML = await resp.text();
        return this.upstreamHTML;
      }
    } catch (e) {
      console.warn('[TMAR Updater] Direct fetch failed, trying Cloudflare Worker...', e.message);
    }

    // Primary: Your Cloudflare Worker
    if (corsProxy) {
      try {
        const resp = await fetch(corsProxy + encodeURIComponent(upstreamURL), { cache: 'no-store' });
        if (resp.ok) {
          this.upstreamHTML = await resp.text();
          return this.upstreamHTML;
        }
      } catch (e) {
        console.warn('[TMAR Updater] Cloudflare Worker failed, trying fallback proxy...', e.message);
      }
    }

    // Fallback: Third-party proxy
    if (corsProxyFallback) {
      try {
        const resp = await fetch(corsProxyFallback + encodeURIComponent(upstreamURL), { cache: 'no-store' });
        if (resp.ok) {
          this.upstreamHTML = await resp.text();
          return this.upstreamHTML;
        }
      } catch (e) {
        console.error('[TMAR Updater] All proxies failed:', e.message);
      }
    }

    throw new Error('Could not fetch upstream source. Check network or CORS settings.');
  }

  // --- Check parity fingerprint from GitHub Actions workflow ---
  async checkParityFingerprint() {
    const { parityFingerprintURL } = this.config;
    if (!parityFingerprintURL) return null;

    try {
      const resp = await fetch(parityFingerprintURL, { cache: 'no-store' });
      if (resp.ok) {
        const fingerprint = await resp.json();
        return fingerprint;
      }
    } catch (e) {
      console.warn('[TMAR Updater] Could not fetch parity fingerprint:', e.message);
    }
    return null;
  }

  // --- Check for updates (uses parity fingerprint first, falls back to hash) ---
  async checkForUpdate() {
    // Try the parity fingerprint first (shared with GitHub Actions)
    const fingerprint = await this.checkParityFingerprint();
    if (fingerprint) {
      const lastKnownHash = localStorage.getItem(this.config.storagePrefix + 'appliedHash');
      const upstreamHash = fingerprint['GAAP.html']?.hash || fingerprint['GAAP.html']?.fingerprint;

      if (upstreamHash && lastKnownHash && upstreamHash !== lastKnownHash) {
        this.upstreamHash = upstreamHash;
        this.currentHash = lastKnownHash;

        localStorage.setItem(
          this.config.storagePrefix + 'lastCheck',
          JSON.stringify({
            timestamp: new Date().toISOString(),
            hasUpdate: true,
            upstreamHash,
            source: 'parity-fingerprint',
          })
        );

        return { hasUpdate: true, currentHash: lastKnownHash, upstreamHash };
      }
    }

    // Fallback: full fetch + hash comparison
    const currentHTML = document.documentElement.outerHTML;
    this.currentHash = await this.hash(currentHTML);

    await this.fetchUpstream();
    this.upstreamHash = await this.hash(this.upstreamHTML);

    const hasUpdate = this.currentHash !== this.upstreamHash;

    localStorage.setItem(
      this.config.storagePrefix + 'lastCheck',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        hasUpdate,
        upstreamHash: this.upstreamHash,
        source: 'full-hash',
      })
    );

    return { hasUpdate, currentHash: this.currentHash, upstreamHash: this.upstreamHash };
  }

  // --- Back up all localStorage data ---
  backupLocalData() {
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key.startsWith(this.config.storagePrefix + 'backup_')) {
        backup[key] = localStorage.getItem(key);
      }
    }

    const backupKey = this.config.storagePrefix + 'backup_' + Date.now();
    localStorage.setItem(backupKey, JSON.stringify(backup));
    localStorage.setItem(this.config.storagePrefix + 'backup_latest', backupKey);

    console.log(`[TMAR Updater] Backed up ${Object.keys(backup).length} localStorage entries → ${backupKey}`);
    return backupKey;
  }

  // --- Restore from backup ---
  restoreFromBackup(backupKey = null) {
    const key = backupKey || localStorage.getItem(this.config.storagePrefix + 'backup_latest');
    if (!key) throw new Error('No backup found.');

    const backup = JSON.parse(localStorage.getItem(key));
    if (!backup) throw new Error('Backup data is empty or corrupted.');

    const updaterKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(this.config.storagePrefix)) updaterKeys.push(k);
    }

    localStorage.clear();

    updaterKeys.forEach(k => {
      const val = backup[k] || null;
      if (val) localStorage.setItem(k, val);
    });

    Object.entries(backup).forEach(([k, v]) => {
      localStorage.setItem(k, v);
    });

    console.log('[TMAR Updater] Restored from backup:', key);
  }

  // --- Save rollback snapshot (current page before any injection) ---
  saveRollbackSnapshot() {
    localStorage.setItem(this.config.storagePrefix + 'rollback_html', document.documentElement.outerHTML);
    localStorage.setItem(this.config.storagePrefix + 'rollback_time', new Date().toISOString());
  }

  // ---------------------------------------------------------------
  //  FUNCTION EXTRACTION HELPERS
  // ---------------------------------------------------------------

  // Extract all top-level named function declarations from a script string
  _extractFunctionNames(scriptText) {
    const names = new Set();
    const re = /(?:^|\n)[ \t]*(?:async[ \t]+)?function[ \t]+(\w+)[ \t]*\(/gm;
    let m;
    while ((m = re.exec(scriptText)) !== null) {
      names.add(m[1]);
    }
    return names;
  }

  // Extract the full source of a named function from a script string.
  // Returns null if not found or brace-balancing fails.
  _extractFunctionBody(scriptText, name) {
    const searchRe = new RegExp(
      '(?:^|\\n)([ \\t]*(?:async[ \\t]+)?function[ \\t]+' + name + '[ \\t]*\\()',
      'm'
    );
    const m = searchRe.exec(scriptText);
    if (!m) return null;

    const lineStart = m.index === 0 ? 0 : m.index + 1; // skip the \n
    const braceIdx = scriptText.indexOf('{', lineStart + m[1].length);
    if (braceIdx < 0) return null;

    let depth = 0;
    let i = braceIdx;
    for (; i < scriptText.length; i++) {
      if (scriptText[i] === '{') depth++;
      else if (scriptText[i] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    if (depth !== 0) return null;

    return scriptText.slice(lineStart, i + 1).trim();
  }

  // Return array of { name, code } for functions in upstreamText not present in localText
  _findNewFunctions(upstreamScriptText, localScriptText) {
    const upstreamNames = this._extractFunctionNames(upstreamScriptText);
    const localNames = this._extractFunctionNames(localScriptText);

    const results = [];
    for (const name of upstreamNames) {
      if (!localNames.has(name)) {
        const code = this._extractFunctionBody(upstreamScriptText, name);
        if (code) results.push({ name, code });
      }
    }
    return results;
  }

  // Return CSS variable declarations from upstreamText not present in localText
  _findNewCssVars(upstreamStyleText, localStyleText) {
    const varRe = /(--[\w-]+)\s*:/g;
    const localVars = new Set();
    let m;
    while ((m = varRe.exec(localStyleText)) !== null) localVars.add(m[1]);

    const newLines = [];
    const lineRe = /^\s*(--[\w-]+\s*:[^;]+;)/gm;
    while ((m = lineRe.exec(upstreamStyleText)) !== null) {
      const varName = m[1].match(/^(--[\w-]+)/)[1];
      if (!localVars.has(varName)) {
        newLines.push(m[1].trim());
      }
    }
    return newLines;
  }

  // ---------------------------------------------------------------
  //  ADDITIVE INJECTION (session-only)
  // ---------------------------------------------------------------

  /**
   * Injects net-new functions and CSS variables from upstream into the
   * current browser session. NEVER removes or replaces existing code.
   *
   * ⚠️ SESSION ONLY — changes disappear on next page reload.
   * Use downloadMerged() for a persistent update.
   */
  async injectNewFunctions() {
    if (!this.upstreamHTML) await this.fetchUpstream();

    this.backupLocalData();
    this.saveRollbackSnapshot();

    const parser = new DOMParser();
    const upstreamDoc = parser.parseFromString(this.upstreamHTML, 'text/html');

    // Gather all inline script text from upstream and local
    const upstreamScriptText = Array.from(upstreamDoc.querySelectorAll('script:not([src])'))
      .map(s => s.textContent).join('\n');
    const localScriptText = Array.from(document.querySelectorAll('script:not([src])'))
      .map(s => s.textContent).join('\n');

    const newFunctions = this._findNewFunctions(upstreamScriptText, localScriptText);

    // Gather CSS vars
    const upstreamStyleText = Array.from(upstreamDoc.querySelectorAll('style'))
      .map(s => s.textContent).join('\n');
    const localStyleText = Array.from(document.querySelectorAll('style'))
      .map(s => s.textContent).join('\n');
    const newCssVars = this._findNewCssVars(upstreamStyleText, localStyleText);

    // Inject new CSS vars
    if (newCssVars.length > 0) {
      const styleEl = document.createElement('style');
      styleEl.id = 'tmar-upstream-css-' + Date.now();
      styleEl.textContent = `/* TMAR upstream CSS additions — ${new Date().toISOString()} */\n:root {\n  ${newCssVars.join('\n  ')}\n}`;
      document.head.appendChild(styleEl);
    }

    // Inject new functions
    if (newFunctions.length > 0) {
      const scriptEl = document.createElement('script');
      scriptEl.id = 'tmar-upstream-js-' + Date.now();
      scriptEl.textContent =
        `// TMAR upstream additions — ${new Date().toISOString()}\n` +
        `// New functions: ${newFunctions.map(f => f.name).join(', ')}\n\n` +
        newFunctions.map(f => f.code).join('\n\n');
      document.body.appendChild(scriptEl);
    }

    // Record
    localStorage.setItem(this.config.storagePrefix + 'appliedHash', this.upstreamHash || '');
    localStorage.setItem(this.config.storagePrefix + 'lastUpdate', JSON.stringify({
      timestamp: new Date().toISOString(),
      mode: 'additive-inject',
      newFunctions: newFunctions.map(f => f.name),
      newCssVars: newCssVars.length,
    }));

    console.log(`[TMAR Updater] Injected: ${newFunctions.length} new functions, ${newCssVars.length} new CSS vars`);
    return { newFunctions, newCssVars };
  }

  // ---------------------------------------------------------------
  //  DOWNLOAD MERGED (persistent update workflow)
  // ---------------------------------------------------------------

  /**
   * Generates a merged HTML file combining current TMAR + net-new
   * upstream additions, then triggers a browser download.
   *
   * The downloaded file preserves 100% of your customizations.
   * Review it, then deploy via git for a persistent update:
   *   git add TMAR-Accrual-Ledger.html && git commit && git push
   */
  async downloadMerged() {
    if (!this.upstreamHTML) await this.fetchUpstream();

    const parser = new DOMParser();
    const upstreamDoc = parser.parseFromString(this.upstreamHTML, 'text/html');

    const upstreamScriptText = Array.from(upstreamDoc.querySelectorAll('script:not([src])'))
      .map(s => s.textContent).join('\n');
    const localScriptText = Array.from(document.querySelectorAll('script:not([src])'))
      .map(s => s.textContent).join('\n');

    const newFunctions = this._findNewFunctions(upstreamScriptText, localScriptText);

    const upstreamStyleText = Array.from(upstreamDoc.querySelectorAll('style'))
      .map(s => s.textContent).join('\n');
    const localStyleText = Array.from(document.querySelectorAll('style'))
      .map(s => s.textContent).join('\n');
    const newCssVars = this._findNewCssVars(upstreamStyleText, localStyleText);

    // Build injection block
    const ts = new Date().toISOString();
    let injection = `\n<!-- ═══ TMAR Upstream Merge — ${ts} ═══\n     Source: ${this.config.upstreamURL}\n     New functions: ${newFunctions.length} | New CSS vars: ${newCssVars.length}\n═══════════════════════════════════════════ -->\n`;

    if (newCssVars.length > 0) {
      injection += `<style id="tmar-upstream-css">\n/* Upstream CSS additions */\n:root {\n  ${newCssVars.join('\n  ')}\n}\n</style>\n`;
    }

    if (newFunctions.length > 0) {
      injection +=
        `<script id="tmar-upstream-js">\n` +
        `// Upstream additions — ${ts}\n` +
        `// New functions: ${newFunctions.map(f => f.name).join(', ')}\n\n` +
        newFunctions.map(f => f.code).join('\n\n') +
        `\n<\/script>\n`;
    }

    // Inject before </body> in the current page's outerHTML
    const currentHTML = document.documentElement.outerHTML;
    const merged = currentHTML.includes('</body>')
      ? currentHTML.replace('</body>', injection + '</body>')
      : currentHTML + injection;

    // Trigger download
    const blob = new Blob([merged], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.config.mergedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    console.log(`[TMAR Updater] Merged file downloaded: ${newFunctions.length} new functions, ${newCssVars.length} new CSS vars`);
    return { newFunctions, newCssVars };
  }

  // --- Rollback injected additions (removes tmar-upstream-* elements) ---
  rollback() {
    let removed = 0;
    document.querySelectorAll('[id^="tmar-upstream-"]').forEach(el => {
      el.remove();
      removed++;
    });
    this.restoreFromBackup();
    localStorage.removeItem(this.config.storagePrefix + 'appliedHash');
    console.log(`[TMAR Updater] Rolled back — removed ${removed} injected element(s).`);
    return removed;
  }

  // --- Generate a diff summary ---
  getDiffSummary() {
    if (!this.upstreamHTML) return null;

    const parser = new DOMParser();
    const upstreamDoc = parser.parseFromString(this.upstreamHTML, 'text/html');

    const upstreamScriptText = Array.from(upstreamDoc.querySelectorAll('script:not([src])'))
      .map(s => s.textContent).join('\n');
    const localScriptText = Array.from(document.querySelectorAll('script:not([src])'))
      .map(s => s.textContent).join('\n');

    const newFunctions = this._findNewFunctions(upstreamScriptText, localScriptText);

    const upstreamStyleText = Array.from(upstreamDoc.querySelectorAll('style'))
      .map(s => s.textContent).join('\n');
    const localStyleText = Array.from(document.querySelectorAll('style'))
      .map(s => s.textContent).join('\n');
    const newCssVars = this._findNewCssVars(upstreamStyleText, localStyleText);

    const currentLines = document.documentElement.outerHTML.split('\n').length;
    const upstreamLines = this.upstreamHTML.split('\n').length;

    return {
      currentLines,
      upstreamLines,
      newFunctions: newFunctions.map(f => f.name),
      newFunctionsCount: newFunctions.length,
      newCssVarsCount: newCssVars.length,
    };
  }
}


// ============================================================
//  UI COMPONENT — Update Banner
// ============================================================

function initTmarUpdaterUI() {
  const updater = new TmarUpdater();

  const style = document.createElement('style');
  style.textContent = `
    #tmar-update-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 99999;
      background: linear-gradient(135deg, #1e3a5f, #1a5276);
      color: #fff;
      padding: 12px 20px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      display: none;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
      border-bottom: 1px solid rgba(0,229,255,0.3);
    }
    #tmar-update-banner.visible { display: flex; flex-wrap: wrap; }
    #tmar-update-banner .msg { flex: 1; min-width: 200px; line-height: 1.4; }
    #tmar-update-banner .msg strong { color: #7fdbff; }
    #tmar-update-banner .msg small { display: block; font-size: 11px; color: #a9cce3; margin-top: 2px; }
    #tmar-update-banner button {
      padding: 7px 14px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
      transition: all 0.2s;
      white-space: nowrap;
    }
    #tmar-download-btn { background: #0e6655; color: #a9dfbf; }
    #tmar-download-btn:hover { background: #117a65; }
    #tmar-inject-btn { background: rgba(255,255,255,0.12); color: #d6eaf8; border: 1px solid rgba(255,255,255,0.2); }
    #tmar-inject-btn:hover { background: rgba(255,255,255,0.2); }
    #tmar-preview-btn { background: rgba(255,255,255,0.08); color: #aed6f1; border: 1px solid rgba(255,255,255,0.15); }
    #tmar-preview-btn:hover { background: rgba(255,255,255,0.15); }
    #tmar-dismiss-btn { background: transparent; color: #85c1e9; font-size: 18px; padding: 4px 8px; }
    #tmar-dismiss-btn:hover { color: #fff; }
    #tmar-rollback-btn {
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 99998;
      background: #7b241c;
      color: #f5b7b1;
      padding: 9px 14px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      display: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    #tmar-diff-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.65); display: none;
    }
    #tmar-diff-modal {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      z-index: 100000;
      background: #0f1923;
      color: #e2e8f0;
      padding: 24px;
      border-radius: 12px;
      max-width: 460px;
      width: 92%;
      display: none;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      border: 1px solid rgba(0,229,255,0.2);
      font-family: system-ui, sans-serif;
    }
    #tmar-diff-modal h3 { margin: 0 0 4px; color: #7fdbff; font-size: 15px; }
    #tmar-diff-modal .subtitle { color: #7f8c8d; font-size: 11px; margin: 0 0 16px; }
    #tmar-diff-modal .stat {
      display: flex; justify-content: space-between; align-items: center;
      padding: 7px 0; border-bottom: 1px solid #1c2e3e; font-size: 13px;
    }
    #tmar-diff-modal .stat .label { color: #7fb3d3; }
    #tmar-diff-modal .fn-list {
      font-size: 11px; color: #5d6d7e; max-height: 80px;
      overflow-y: auto; margin-top: 4px; font-family: monospace;
    }
    #tmar-diff-modal .mode-note {
      margin-top: 14px; padding: 10px 12px;
      background: rgba(255,193,7,0.08); border-left: 3px solid #f39c12;
      border-radius: 4px; font-size: 11px; color: #f0b27a; line-height: 1.5;
    }
    #tmar-diff-modal .actions { margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; }
    #tmar-diff-modal .actions button {
      padding: 8px 14px; border: none; border-radius: 6px;
      cursor: pointer; font-weight: 600; font-size: 12px;
    }
  `;
  document.head.appendChild(style);

  // Banner
  const banner = document.createElement('div');
  banner.id = 'tmar-update-banner';
  banner.innerHTML = `
    <div class="msg">
      🔄 <strong>Upstream update available</strong> — redressright.me/GAAP.html has new content.
      <small id="tmar-diff-hint">Checking what's new…</small>
    </div>
    <button id="tmar-preview-btn">📋 Preview</button>
    <button id="tmar-download-btn">⬇️ Download Merged</button>
    <button id="tmar-inject-btn">💉 Inject (session)</button>
    <button id="tmar-dismiss-btn">✕</button>
  `;
  document.body.prepend(banner);

  // Rollback button
  const rollbackBtn = document.createElement('button');
  rollbackBtn.id = 'tmar-rollback-btn';
  rollbackBtn.textContent = '↩️ Undo Injection';
  document.body.appendChild(rollbackBtn);

  // Diff modal
  const overlay = document.createElement('div');
  overlay.id = 'tmar-diff-overlay';
  document.body.appendChild(overlay);

  const modal = document.createElement('div');
  modal.id = 'tmar-diff-modal';
  modal.innerHTML = `
    <h3>📊 Upstream Diff Summary</h3>
    <p class="subtitle">What's new in upstream vs. your current TMAR build</p>
    <div id="tmar-diff-stats"></div>
    <div class="mode-note">
      <strong>⬇️ Download Merged</strong> — Recommended. Generates a merged HTML file with upstream
      additions appended. Your customizations are fully preserved. Deploy the downloaded file via git.<br><br>
      <strong>💉 Inject (session only)</strong> — Adds new functions to this browser session only.
      Disappears on next page load. Good for previewing new features before committing.
    </div>
    <div class="actions">
      <button id="tmar-modal-download" style="background:#0e6655;color:#a9dfbf;">⬇️ Download Merged</button>
      <button id="tmar-modal-inject" style="background:#1a5276;color:#aed6f1;">💉 Inject (session)</button>
      <button id="tmar-modal-close" style="background:#1c2e3e;color:#85c1e9;">Close</button>
    </div>
  `;
  document.body.appendChild(modal);

  // --- Helpers ---
  const closeModal = () => {
    overlay.style.display = 'none';
    modal.style.display = 'none';
  };
  overlay.onclick = closeModal;
  document.getElementById('tmar-modal-close').onclick = closeModal;
  document.getElementById('tmar-dismiss-btn').onclick = () => banner.classList.remove('visible');

  const showDiffModal = (diff) => {
    const statsEl = document.getElementById('tmar-diff-stats');
    const fnListHtml = diff.newFunctionsCount > 0
      ? `<div class="fn-list">${diff.newFunctions.join(', ')}</div>`
      : '';
    statsEl.innerHTML = `
      <div class="stat"><span class="label">Your build</span><span>${diff.currentLines.toLocaleString()} lines</span></div>
      <div class="stat"><span class="label">Upstream</span><span>${diff.upstreamLines.toLocaleString()} lines</span></div>
      <div class="stat">
        <span class="label">New functions to add</span>
        <span style="color:#52be80;">+${diff.newFunctionsCount}</span>
      </div>
      ${fnListHtml}
      <div class="stat"><span class="label">New CSS variables</span><span style="color:#52be80;">+${diff.newCssVarsCount}</span></div>
      <div class="stat" style="border:none;padding-top:10px;font-size:11px;color:#5d6d7e;">
        Existing TMAR code and customizations: untouched
      </div>
    `;
    overlay.style.display = 'block';
    modal.style.display = 'block';
  };

  // --- Preview button ---
  document.getElementById('tmar-preview-btn').onclick = async () => {
    const diff = updater.getDiffSummary();
    if (diff) {
      showDiffModal(diff);
      return;
    }
    // Need to fetch first
    try {
      await updater.fetchUpstream();
      const diff2 = updater.getDiffSummary();
      if (diff2) showDiffModal(diff2);
    } catch(e) {
      alert('Could not fetch upstream: ' + e.message);
    }
  };

  // --- Download Merged ---
  const doDownload = async () => {
    try {
      const result = await updater.downloadMerged();
      banner.classList.remove('visible');
      closeModal();
      const fns = result.newFunctions.length;
      const css = result.newCssVars.length;
      alert(`✅ Merged file downloaded!\n\n+${fns} new function${fns!==1?'s':''}, +${css} new CSS variable${css!==1?'s':''}.\n\nReview the file, then replace TMAR-Accrual-Ledger.html and deploy via git.`);
    } catch(e) {
      alert('❌ Download failed: ' + e.message);
    }
  };
  document.getElementById('tmar-download-btn').onclick = doDownload;
  document.getElementById('tmar-modal-download').onclick = doDownload;

  // --- Inject (session only) ---
  const doInject = async () => {
    if (!confirm('Inject new upstream functions into this session?\n\nThis is temporary (session only) and will not affect the saved file. Your customizations are untouched.')) return;
    try {
      const result = await updater.injectNewFunctions();
      banner.classList.remove('visible');
      closeModal();
      rollbackBtn.style.display = 'block';
      const fns = result.newFunctions.length;
      const css = result.newCssVars.length;
      if (fns === 0 && css === 0) {
        alert('ℹ️ No new functions or CSS variables found in upstream. Your TMAR is already up to date with upstream additions.');
        rollbackBtn.style.display = 'none';
      } else {
        alert(`✅ Injected for this session:\n+${fns} new function${fns!==1?'s':''}: ${result.newFunctions.map(f=>f.name).join(', ') || '—'}\n+${css} new CSS variable${css!==1?'s':''}\n\nUse ↩️ Undo to revert, or Download Merged for a persistent update.`);
      }
    } catch(e) {
      alert('❌ Injection failed: ' + e.message);
    }
  };
  document.getElementById('tmar-inject-btn').onclick = doInject;
  document.getElementById('tmar-modal-inject').onclick = doInject;

  // --- Rollback ---
  rollbackBtn.onclick = () => {
    if (!confirm('Remove injected upstream additions from this session?')) return;
    try {
      const removed = updater.rollback();
      rollbackBtn.style.display = 'none';
      alert(`✅ Removed ${removed} injected element(s). Session restored.`);
    } catch(e) {
      alert('❌ Rollback failed: ' + e.message);
    }
  };

  // --- Auto-check on load ---
  (async () => {
    try {
      const result = await updater.checkForUpdate();
      if (result.hasUpdate) {
        banner.classList.add('visible');
        // Try to build diff hint if we have the upstream already
        const diff = updater.getDiffSummary();
        const hintEl = document.getElementById('tmar-diff-hint');
        if (diff) {
          hintEl.textContent = `+${diff.newFunctionsCount} new function${diff.newFunctionsCount!==1?'s':''}, +${diff.newCssVarsCount} new CSS vars detected.`;
        } else {
          hintEl.textContent = 'Click Preview to see what\'s new.';
        }
      }
    } catch(e) {
      console.warn('[TMAR Updater] Auto-check failed:', e.message);
    }
  })();

  window.tmarUpdater = updater;
  return updater;
}


// ============================================================
//  AUTO-INIT
// ============================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTmarUpdaterUI);
} else {
  initTmarUpdaterUI();
}
