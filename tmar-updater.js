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
 *   5. Applies upstream code changes while preserving your local data
 *   6. Keeps a rollback snapshot so you can revert if something breaks
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
  parityFingerprintURL: 'https://raw.githubusercontent.com/SlickVicious/TMAR-Accrual-Ledger/main/parity-fingerprint.json',

  // localStorage key prefix for updater metadata
  storagePrefix: 'tmar_updater_',

  // How often to auto-check (ms). 0 = manual only.
  autoCheckInterval: 0, // e.g. 3600000 = 1 hour

  // Selectors for content zones to update (vs. replace entire page)
  // If null, the updater replaces the full <html> innerHTML.
  // If set, only matched sections are swapped (safer for customizations).
  selectiveSelectors: null, // e.g. ['#app-scripts', 'style', '.tab-content']

  // CSS selectors for YOUR custom sections to PRESERVE during update
  preserveSelectors: [
    '#trust-entity-header',   // your trust name / EIN display
    '.custom-branding',       // any custom branding you added
  ],
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
      // Skip updater's own keys from the backup payload
      if (!key.startsWith(this.config.storagePrefix + 'backup_')) {
        backup[key] = localStorage.getItem(key);
      }
    }

    const backupKey = this.config.storagePrefix + 'backup_' + Date.now();
    localStorage.setItem(backupKey, JSON.stringify(backup));

    // Also store a "latest" pointer
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

    // Clear current non-updater keys, then restore
    const updaterKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(this.config.storagePrefix)) updaterKeys.push(k);
    }

    localStorage.clear();

    // Restore updater keys
    updaterKeys.forEach(k => {
      const val = backup[k] || null;
      if (val) localStorage.setItem(k, val);
    });

    // Restore user data
    Object.entries(backup).forEach(([k, v]) => {
      localStorage.setItem(k, v);
    });

    console.log('[TMAR Updater] Restored from backup:', key);
  }

  // --- Store rollback snapshot (the current page before update) ---
  saveRollbackSnapshot() {
    const snapshot = document.documentElement.outerHTML;
    localStorage.setItem(this.config.storagePrefix + 'rollback_html', snapshot);
    localStorage.setItem(this.config.storagePrefix + 'rollback_time', new Date().toISOString());
  }

  // --- Apply the upstream update ---
  async applyUpdate() {
    if (!this.upstreamHTML) {
      await this.fetchUpstream();
    }

    // 1. Back up local data
    this.backupLocalData();

    // 2. Save rollback snapshot
    this.saveRollbackSnapshot();

    // 3. Extract and preserve custom sections
    const preserved = {};
    if (this.config.preserveSelectors) {
      this.config.preserveSelectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) preserved[sel] = el.outerHTML;
      });
    }

    // 4. Apply the update
    if (this.config.selectiveSelectors) {
      // Selective mode: only replace specific sections
      const parser = new DOMParser();
      const upstreamDoc = parser.parseFromString(this.upstreamHTML, 'text/html');

      this.config.selectiveSelectors.forEach(sel => {
        const upstreamEl = upstreamDoc.querySelector(sel);
        const localEl = document.querySelector(sel);
        if (upstreamEl && localEl) {
          localEl.outerHTML = upstreamEl.outerHTML;
        }
      });
    } else {
      // Full replace — write the upstream HTML, then reload
      document.open();
      document.write(this.upstreamHTML);
      document.close();
    }

    // 5. Re-inject preserved custom sections
    Object.entries(preserved).forEach(([sel, html]) => {
      const target = document.querySelector(sel);
      if (target) target.outerHTML = html;
    });

    // 6. Record update metadata
    localStorage.setItem(
      this.config.storagePrefix + 'lastUpdate',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        fromHash: this.currentHash,
        toHash: this.upstreamHash,
      })
    );

    // Store applied hash for parity fingerprint comparison
    if (this.upstreamHash) {
      localStorage.setItem(this.config.storagePrefix + 'appliedHash', this.upstreamHash);
    }

    console.log('[TMAR Updater] Update applied successfully.');
    return true;
  }

  // --- Rollback to previous version ---
  rollback() {
    const snapshot = localStorage.getItem(this.config.storagePrefix + 'rollback_html');
    if (!snapshot) throw new Error('No rollback snapshot available.');

    this.restoreFromBackup();
    document.open();
    document.write(snapshot);
    document.close();
    console.log('[TMAR Updater] Rolled back to previous version.');
  }

  // --- Generate a simple diff summary ---
  getDiffSummary() {
    if (!this.upstreamHTML) return null;

    const currentLines = document.documentElement.outerHTML.split('\n');
    const upstreamLines = this.upstreamHTML.split('\n');

    let added = 0, removed = 0, changed = 0;
    const maxLen = Math.max(currentLines.length, upstreamLines.length);

    for (let i = 0; i < maxLen; i++) {
      if (i >= currentLines.length) { added++; continue; }
      if (i >= upstreamLines.length) { removed++; continue; }
      if (currentLines[i] !== upstreamLines[i]) changed++;
    }

    return {
      currentLines: currentLines.length,
      upstreamLines: upstreamLines.length,
      linesAdded: added,
      linesRemoved: removed,
      linesChanged: changed,
    };
  }
}


// ============================================================
//  UI COMPONENT — Drop-in Update Banner + Button
// ============================================================

function initTmarUpdaterUI() {
  const updater = new TmarUpdater();

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #tmar-update-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 99999;
      background: linear-gradient(135deg, #b45309, #d97706);
      color: #fff;
      padding: 12px 20px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      display: none;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    }
    #tmar-update-banner.visible { display: flex; flex-wrap: wrap; }
    #tmar-update-banner .msg { flex: 1; min-width: 200px; }
    #tmar-update-banner .msg strong { color: #fef3c7; }
    #tmar-update-banner button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.2s;
    }
    #tmar-update-btn {
      background: #065f46;
      color: #d1fae5;
    }
    #tmar-update-btn:hover { background: #047857; }
    #tmar-preview-btn {
      background: rgba(255,255,255,0.15);
      color: #fff;
    }
    #tmar-preview-btn:hover { background: rgba(255,255,255,0.25); }
    #tmar-dismiss-btn {
      background: rgba(255,255,255,0.1);
      color: #fde68a;
    }
    #tmar-dismiss-btn:hover { background: rgba(255,255,255,0.2); }
    #tmar-rollback-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99998;
      background: #991b1b;
      color: #fecaca;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      display: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    #tmar-diff-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 100000;
      background: #1a1a2e;
      color: #e2e8f0;
      padding: 24px;
      border-radius: 12px;
      max-width: 400px;
      width: 90%;
      display: none;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      font-family: system-ui, sans-serif;
    }
    #tmar-diff-modal h3 { margin: 0 0 16px; color: #fbbf24; }
    #tmar-diff-modal .stat { 
      display: flex; justify-content: space-between; 
      padding: 8px 0; border-bottom: 1px solid #334155;
    }
    #tmar-diff-modal .stat .label { color: #94a3b8; }
    #tmar-diff-modal .actions { margin-top: 16px; display: flex; gap: 8px; }
    #tmar-diff-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.6); display: none;
    }
  `;
  document.head.appendChild(style);

  // Inject banner HTML
  const banner = document.createElement('div');
  banner.id = 'tmar-update-banner';
  banner.innerHTML = `
    <div class="msg">
      ⚠️ <strong>Source update detected</strong> — redressright.me has changed since your last sync.
      <span id="tmar-diff-hint"></span>
    </div>
    <button id="tmar-preview-btn">📋 Preview</button>
    <button id="tmar-update-btn">🔄 Apply Update</button>
    <button id="tmar-dismiss-btn">✕ Dismiss</button>
  `;
  document.body.prepend(banner);

  // Rollback button (shown after update)
  const rollbackBtn = document.createElement('button');
  rollbackBtn.id = 'tmar-rollback-btn';
  rollbackBtn.textContent = '↩️ Undo Update';
  document.body.appendChild(rollbackBtn);

  // Diff modal
  const overlay = document.createElement('div');
  overlay.id = 'tmar-diff-overlay';
  document.body.appendChild(overlay);

  const modal = document.createElement('div');
  modal.id = 'tmar-diff-modal';
  modal.innerHTML = `
    <h3>📊 Update Summary</h3>
    <div id="tmar-diff-stats"></div>
    <div class="actions">
      <button id="tmar-modal-apply" style="background:#065f46;color:#d1fae5;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-weight:600;">Apply Update</button>
      <button id="tmar-modal-close" style="background:#334155;color:#e2e8f0;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">Close</button>
    </div>
  `;
  document.body.appendChild(modal);

  // --- Event Handlers ---

  document.getElementById('tmar-dismiss-btn').onclick = () => {
    banner.classList.remove('visible');
  };

  document.getElementById('tmar-preview-btn').onclick = async () => {
    const diff = updater.getDiffSummary();
    if (!diff) return;
    const statsEl = document.getElementById('tmar-diff-stats');
    statsEl.innerHTML = `
      <div class="stat"><span class="label">Your version</span><span>${diff.currentLines.toLocaleString()} lines</span></div>
      <div class="stat"><span class="label">Upstream version</span><span>${diff.upstreamLines.toLocaleString()} lines</span></div>
      <div class="stat"><span class="label">Lines added</span><span style="color:#34d399;">+${diff.linesAdded}</span></div>
      <div class="stat"><span class="label">Lines removed</span><span style="color:#f87171;">-${diff.linesRemoved}</span></div>
      <div class="stat"><span class="label">Lines changed</span><span style="color:#fbbf24;">~${diff.linesChanged}</span></div>
    `;
    overlay.style.display = 'block';
    modal.style.display = 'block';
  };

  overlay.onclick = () => {
    overlay.style.display = 'none';
    modal.style.display = 'none';
  };

  document.getElementById('tmar-modal-close').onclick = () => {
    overlay.style.display = 'none';
    modal.style.display = 'none';
  };

  const doApply = async () => {
    if (!confirm('Apply upstream update? Your data will be backed up and preserved.')) return;
    try {
      await updater.applyUpdate();
      banner.classList.remove('visible');
      rollbackBtn.style.display = 'block';
      overlay.style.display = 'none';
      modal.style.display = 'none';
      alert('✅ Update applied! Your ledger data has been preserved.');
    } catch (e) {
      alert('❌ Update failed: ' + e.message);
    }
  };

  document.getElementById('tmar-update-btn').onclick = doApply;
  document.getElementById('tmar-modal-apply').onclick = doApply;

  rollbackBtn.onclick = () => {
    if (!confirm('Revert to previous version?')) return;
    try {
      updater.rollback();
      rollbackBtn.style.display = 'none';
      alert('✅ Rolled back successfully.');
    } catch (e) {
      alert('❌ Rollback failed: ' + e.message);
    }
  };

  // --- Auto-check on load ---
  (async () => {
    try {
      const result = await updater.checkForUpdate();
      if (result.hasUpdate) {
        banner.classList.add('visible');
        const diff = updater.getDiffSummary();
        if (diff) {
          document.getElementById('tmar-diff-hint').textContent =
            ` (+${diff.linesAdded} / -${diff.linesRemoved} / ~${diff.linesChanged} lines)`;
        }
      }
    } catch (e) {
      console.warn('[TMAR Updater] Auto-check failed:', e.message);
    }
  })();

  // Expose globally for console access
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
