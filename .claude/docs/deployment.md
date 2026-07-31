# Deployment
- Load this file for deploy, CI, environment, secrets, hosting, or build pipeline tasks.
- Do not change deployment config unless the user requests it.
- Prefer minimal, reversible edits. Flag environment-specific risks before suggesting changes.
- Never expose or hardcode secrets.

## HTML App → GitHub Pages (primary deploy path)

```bash
git add TMAR-Accrual-Ledger.html
git commit -m "..."
git push origin master
```

GitHub Pages auto-deploys from `master`. Live URL:
`https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html`

**Dual-machine workflow:**
- Mac: primary push machine
- Windows PC: `git pull origin master` before editing; push changes after

## GAS → Apps Script (secondary deploy path)

```bash
cd gas
clasp push
```

If `SyncCenter.gs` changed, **manually redeploy the Web App** in the Apps Script editor (Deploy → Manage deployments → New version). The exec URL stays the same but the new code version must be published.

Script ID: `1fIfAfYbMw8udn2AggFnMDc-dwVNvrQeJT6qVOdJI1VdehZQzDoCdoyYr`
Exec URL: `https://script.google.com/macros/s/AKfycbzpeegvE52lvqCTMyKrsdaa_4JFfjM6MQrsJkU8zb17fkUJzPRasUU0fjONdaHkM5dh/exec`
*(Updated 2026-05-06 — previous URL deprecated after Artifactory bridge deploy)*

**Active doPost actions** (SyncCenter.gs):
- `pushEntities` / `pushTransactions` / `pushPayables` / `push1099` / `fullSync` — Accrual Ledger sync
- `importSubstituteW2` → W-2 & Income Detail
- `importForm1040` → 1040 Submissions (auto-created tab)
- `importForm2848` → Forms & Authority
- `importScheduleA` → Schedule A (auto-created tab)

Always `clasp push` from within `gas/` — `.clasp.json` rootDir is `"."` and is cross-platform.

## Cloudflare Worker (CORS proxy — one-time setup)

1. Log into workers.cloudflare.com
2. Create new worker, paste `cloudflare-worker-v2.js`
3. Deploy → copy the worker URL
4. In TMAR app: Settings → API Keys → CORS Proxy URL → paste → Save All Keys

The worker URL is stored in localStorage, not in source. **Do not hardcode it.**

## Secrets & API Keys

| Secret | Storage location |
|--------|-----------------|
| Anthropic / Claude | `eeon_key_claude`, `stg_key_claude`, `tmar_claude_key`, `window._trustApiKey` (localStorage) |
| OpenAI | `eeon_key_openai` (localStorage) |
| DeepSeek | `eeon_key_deepseek` (localStorage) |
| xAI / Grok | `eeon_key_xai` (localStorage) |
| Vault passphrase | Never stored — entered at unlock time |

Keys are also injectable via the vault (`_vaultInjectApiKeys` on unlock/save) and via `tmar-key-manager.js` floating UI.

**Never commit `.env` files.** `gas/env-vault-setup/` is in `.gitignore`.

## .gitignore Rules (relevant entries)

- `.vscode/`
- `*.bak-predeup`
- `eon-*.png`
- Merged HTML files (66 MB backup)
- `gas/env-vault-setup/`

## No CI/CD Pipeline

There is no automated CI. Tests must be run locally before pushing:
```bash
npm test
```

Coverage report: `npm run test:coverage`

## Rollback

Revert a bad push: `git revert HEAD && git push origin master`
GAS rollback: Deploy → Manage deployments → select previous version → update active deployment.
