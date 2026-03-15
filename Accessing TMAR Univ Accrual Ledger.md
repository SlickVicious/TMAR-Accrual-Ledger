
All servers up, both URLs verified. Here's what you need:

---

## 🔗 URLs

### For your colleague (shareable — works anywhere):

**https://slickvicious.github.io/TMAR-Accrual-Ledger/**

GitHub Pages — public, HTTPS, no login required. Send this link.

### For you (local dev):

**http://127.0.0.1:8080/TMAR-Accrual-Ledger.html**

Local server running via `tmar-preview` on port 8080.

---

### What your colleague CAN review:

✅ All 38 tabs (Ledger, Entities, COA, Journal, A/R, A/P, Tax Estimator, TRCF, Document Creator, Package Builder, Voice Chat, Trust Agent, Entity Verifier, Sync Center, etc.) ✅ Document & Form Creator with all templates ✅ Package Builder with FWM presets ✅ Full UI/UX and navigation

### What requires their own setup:

⚠️ **Trust Agent / Voice Chat** — needs their own Anthropic API key (`sk-ant-...`) ⚠️ **Sync Center push/pull** — needs their own Google Sheet + GAS Web App ⚠️ **IRS PDF viewer** — `irs-forms/` symlink won't resolve on GitHub Pages (404s for PDF viewing)