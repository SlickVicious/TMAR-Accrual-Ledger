# TMAR - Trust Master Account Register

**Complete Interactive Web Application + Google Sheets Integration**
**Version:** 3.0
**Last Updated:** March 16, 2026
**Status:** ✅ Production Ready — GAAPCLAW Full Parity

---

## 🌐 Live Application

### Public URL (Auto-Updates)
**GitHub Pages:** https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html

Access from anywhere:
- ✅ Mac Desktop/Laptop
- ✅ Windows PC
- ✅ Mobile/Tablet
- ✅ Any modern web browser

### Local Development
```bash
# Start local server
npx http-server -p 8080 -o

# Access at
http://localhost:8080/TMAR-Accrual-Ledger.html
```

---

## 🌐 CORS Proxy Setup

Direct browser API calls to Anthropic are blocked by CORS when using the app from GitHub Pages. A free Cloudflare Worker proxy solves this.

### Deploy (one-time, ~3 minutes)

1. Go to [workers.cloudflare.com](https://workers.cloudflare.com) — create a free account
2. Click **Create Worker**
3. Select all default code, delete it, paste the full contents of [`cors-proxy-worker.js`](./cors-proxy-worker.js)
4. Click **Deploy** — copy the worker URL (e.g. `https://your-worker.yourname.workers.dev`)

### Configure in TMAR

5. Open the app → click **🤖** → **API Keys**
6. Scroll to **🌐 CORS Proxy URL** → paste the worker URL
7. Click **Save All Keys**

All Anthropic API calls now route through your worker. The worker strips browser identity headers and forwards requests cleanly to `api.anthropic.com`.

---

## 📊 Project Overview

TMAR is a comprehensive financial management system combining:

1. **Interactive Web Application** - Full-featured HTML/JavaScript GUI
2. **Google Apps Script Backend** - Automated Google Sheets integration
3. **AI Agent Integration** - 6 specialized Claude AI agents
4. **Secure Vault System** - Encrypted document storage
5. **Research & Analysis Tools** - Legal, tax, and accounting research

---

## 🎯 Core Features

### Web Application (TMAR-Accrual-Ledger.html)

**26 Pages/Screens:**
- Dashboard
- Trust Agent (6 AI Agents: Legal, Tax, Accounting, Trust, Arbitration, Corporation)
- Research HUB (3 depth modes: Standard, Deep, Legal with Citations)
- Document Creator
- Calendar & Scheduling
- Encrypted Vault
- API Keys Management
- Sync Center
- Bill of Exchange Generator
- GAAP Interface
- Settings & Preferences

**246 Total Functions:**
- ✅ 100% Implementation Coverage
- ✅ All interactive elements functional
- ✅ Comprehensive error handling
- ✅ Console logging for debugging

**17 Custom Functions (All Documented):**
- Chat & Communication (3)
- Memory & Storage (3)
- Settings & Preferences (3)
- Voice & Speech (4)
- Utilities (4)

See [Function_Reference_Cards/](./Function_Reference_Cards/) for complete documentation.

### Google Sheets Integration

**Apps Script Project:**
https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ

**Features:**
- Master Account Register
- Cash Flow Analysis (CapOne, BOA, PNC, Fidelity)
- Bill of Exchange Management
- Duplicate Detection & Analysis
- GAAP Compliance Interface
- Sync Center for data exchange

See [GSheet/](./GSheet/) for Google Sheets documentation.

---

## 🚀 Quick Start

### 1. Access the Web Application

**Option A - GitHub Pages (Recommended):**
```
https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html
```

**Option B - Local Development:**
```bash
cd "/path/to/TMAR"
npx http-server -p 8080 -o
```

### 2. Configure API Keys

1. Navigate to **Settings > API Keys**
2. Add your Anthropic Claude API key
3. Click **Save** (green indicators appear)
4. Click **Test** to verify connection

### 3. Start Using Agents

1. Go to **Trust Agent** page
2. Select an agent (Legal, Tax, Accounting, etc.)
3. Type your question
4. Click **⚡ Analyze**

---

## 📂 Project Structure

```
TMAR/
├── TMAR-Accrual-Ledger.html          # Main web application
├── TMAR_Audit_Dashboard.html         # Interactive audit dashboard
├── AUDIT_SUMMARY.md                  # Audit results and coverage
├── audit_report.json                 # Full audit data
│
├── Function_Reference_Cards/         # Complete function documentation
│   ├── README.md                     # Quick reference index
│   ├── COMPLETE_IMPLEMENTATION_GUIDE.md
│   ├── COMPLETION_STATUS.md
│   ├── 01_sendQuick.md               # Individual function cards
│   ├── 02_eeonSendChat.md
│   └── ... (17 total reference cards)
│
├── gas/                              # Google Apps Script files
│   ├── Code.gs                       # Main GAS code
│   ├── FormattingComplement.gs       # Formatting utilities
│   ├── SyncCenter.gs                 # Data synchronization
│   ├── DocumentGenerator.html        # Document generation UI
│   ├── GAAPInterface.html            # GAAP compliance UI
│   ├── README.md                     # GAS documentation
│   └── ... (22 total GAS files)
│
├── GSheet/                           # Google Sheets documentation
│   ├── README.md                     # GSheet overview
│   ├── INTEGRATION_COMPLETE.md       # Integration guide
│   ├── DEPLOYMENT_GUIDE.md
│   └── ... (17 documentation files)
│
├── docs/                             # Additional documentation
│   ├── Bank_Statement_Extraction_Guide.md
│   ├── Extractor_API_Reference.md
│   ├── LLM Provider Status.md
│   └── plans/                        # Development plans
│
└── ClaudeSkills/                     # Claude Code skills
    └── LDG Vault Skills Suite — Index.md
```

---

## 🔧 Development Workflow

### Git Workflow

**Mac → GitHub:**
```bash
git add .
git commit -m "Your changes"
git push origin master
```

**PC → Sync from GitHub:**
```bash
git pull origin master
# Make changes
git add .
git commit -m "PC updates"
git push origin master
```

### Google Apps Script Deployment

```bash
# Navigate to gas/ directory
cd gas/

# Push to Google Apps Script
clasp push

# Open in Apps Script editor
clasp open
```

---

## 📖 Documentation

### Quick References
- [Function Reference Cards](./Function_Reference_Cards/README.md) - All 17 custom functions
- [Audit Dashboard](./TMAR_Audit_Dashboard.html) - Interactive coverage report
- [Audit Summary](./AUDIT_SUMMARY.md) - Coverage statistics

### Implementation Guides
- [Complete Implementation Guide](./Function_Reference_Cards/COMPLETE_IMPLEMENTATION_GUIDE.md)
- [Completion Status](./Function_Reference_Cards/COMPLETION_STATUS.md)
- [Development Plan](./Function_Reference_Cards/TMAR_Function_Development_Plan.md)

### Google Sheets Integration
- [GSheet README](./GSheet/README.md)
- [Integration Complete](./GSheet/INTEGRATION_COMPLETE.md)
- [Deployment Guide](./GSheet/DEPLOYMENT_GUIDE.md)

### Specialized Guides
- [Bank Statement Extraction](./docs/Bank_Statement_Extraction_Guide.md)
- [Extractor API Reference](./docs/Extractor_API_Reference.md)
- [LLM Provider Status](./docs/LLM%20Provider%20Status.md)

---

## ✅ Implementation Status

### Web Application
- **Functions:** 246/246 (100%)
- **Custom Functions:** 17/17 (100%)
- **Pages/Screens:** 26/26 (100%)
- **Reference Cards:** 17/17 (100%)
- **Testing:** ✅ All buttons functional

### Google Apps Script
- **Main Code:** Code.gs (137 KB)
- **Modules:** 22 files
- **Integration:** ✅ Complete
- **Deployment:** ✅ Live on Google Sheets

### AI Agents (6 Total)
1. ⚖️ Legal Expert - Presumption Killer
2. 💰 Tax Strategist - IRC Master
3. 📊 Accounting Expert - GAAP/FASB
4. 🏛️ Trust Administrator - Estate Planning
5. ⚔️ Arbitration Expert - Dispute Resolution
6. 🏢 Corporation Specialist - Business Formation

**API Integration:** Anthropic Claude (claude-sonnet-4-20250514)

---

## 🔐 Security Features

### Vault System
- **Encryption:** AES-256-GCM
- **Key Derivation:** PBKDF2 (100,000 iterations)
- **Password Hashing:** SHA-256
- **Auto-Lock:** 15-minute timer
- **Failed Attempts:** 5 max before lockout

### API Keys
- **Storage:** Browser localStorage (encrypted at rest)
- **Transmission:** HTTPS only
- **Validation:** Connection testing before save
- **Indicators:** Visual key status dots

### Data Privacy
- **Local First:** All data stored in browser localStorage
- **No Cloud Sync:** Unless explicitly configured
- **No Tracking:** No analytics or telemetry
- **Offline Capable:** Works without internet (except AI features)

---

## 🎨 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Bootstrap 5 + Custom styles
- **JavaScript** - Vanilla JS (ES6+)
- **LocalStorage** - Client-side persistence
- **Web Crypto API** - Encryption
- **Web Speech API** - Voice features

### Backend
- **Google Apps Script** - Server-side automation
- **Google Sheets API** - Data storage
- **Anthropic Claude API** - AI agents

### Deployment
- **GitHub Pages** - Static hosting
- **Git** - Version control
- **clasp** - Google Apps Script CLI

---

## 📈 Version History

### v3.0 (March 14, 2026) — GAAPCLAW Full Parity + Engine Ports
- ✅ **GCMemory IndexedDB engine** — Full persistent agent memory (replaces localStorage stub)
  - `add()`, `addPdf()`, `search()` with keyword-overlap scoring, `clearAll()`, `count()`
  - 60+ legal/financial importance keywords; auto-prune at 500 records
- ✅ **MEM0 (GAAP_MEM0)** — Drop-in proxy routing all calls to GCMemory; always enabled, no key gate
- ✅ **OpenClawRuntime SYPHER-7.8-HARDLOCK** — 3-phase boot: guarded registration → delete methods → `Object.freeze()`; 5 agents + 9 skills sealed; rogue injection blocked + logged
- ✅ **HARD_LOCK enforcement layer** — Frozen object: sanitizeOutput (strips markdown), validatePrompt, stripDisclaimers, processOutput; integrity self-test at load
- ✅ **Streaming architecture (callLLMStream v7.1)** — Multi-provider SSE/NDJSON streaming: Ollama, Anthropic, OpenAI-compatible bearer, Ernie non-streaming fallback; 15-min AbortController
- ✅ **Token Budget Guard** — PROVIDER_LIMITS for 14 providers; `truncateToTokenBudget()` preserves questions, truncates docs first
- ✅ **resolveProvider()** — Reads `eeon_*` localStorage keys; cascading fallback to Claude
- ✅ **askAgent() refactored** — Full streaming with live cursor, MEM0 context injection, IndexedDB save on completion
- ✅ **API Scout v2** — 22 curated APIs, search/category/auth filters, ⚡ Test All Live with per-card status dots, ⬇ Integrate All
- ✅ **`#gc-v3-bar` footer status bar** — Fixed bottom: Rev/Exp/Net/Assets/Tax/BALANCED/entries/Mem + 5 panel buttons
- ✅ **AP pattern** — All 7 specialist pages rebuilt with left sidebar + 6-button action bar (Speak/Listen/Print/PDF/Word/Share) + localStorage conversation persistence
- ✅ **AUTONOMOUS sidebar section** — Task Planner, API Integrations, Code Builder, API Scout properly separated from SYSTEM
- ✅ **uploadIRSTemplate()** — PDF template upload with FileReader + localStorage
- ✅ **Settings expanded** — Appearance tab, LLM provider grid buttons, GCMemory block, OpenClaw + Apify sections

### v2.0 (March 9, 2026)
- ✅ Implemented all 17 custom functions
- ✅ Created 17 reference cards
- ✅ Complete audit system (246 functions)
- ✅ Interactive audit dashboard
- ✅ 100% function coverage
- ✅ Documentation reorganization

### v1.0 (March 8, 2026)
- ✅ 6 AI agents with Claude API integration
- ✅ Research HUB with 3 depth modes
- ✅ API Keys management
- ✅ Enhanced button styling
- ✅ Comprehensive error handling

---

## 🤝 Contributing

### Reporting Issues
1. Check existing issues on GitHub
2. Provide detailed description
3. Include browser/environment info
4. Add screenshots if applicable

### Making Changes
1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

---

## 📞 Support

### Documentation
- Check [Function Reference Cards](./Function_Reference_Cards/)
- Review [Audit Dashboard](./TMAR_Audit_Dashboard.html)
- Read implementation guides

### Troubleshooting
- Enable browser console (F12)
- Check for error messages
- Verify API key configuration
- Test network connectivity

---

## 📝 License

Copyright © 2026 TMAR Development Team
All Rights Reserved

---

## 🔗 Links

- **Live Application:** https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR-Accrual-Ledger.html
- **GitHub Repository:** https://github.com/SlickVicious/TMAR-Accrual-Ledger
- **Google Sheets:** https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ
- **Audit Dashboard:** https://slickvicious.github.io/TMAR-Accrual-Ledger/TMAR_Audit_Dashboard.html

---

**Last Updated:** March 16, 2026
**Status:** ✅ Production Ready — GAAPCLAW Full Parity
**Coverage:** 100%
