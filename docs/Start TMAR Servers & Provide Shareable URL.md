
## Context

User wants to start the TMAR servers and get a shareable URL for a colleague to review functionality. The TMAR Accrual Ledger is a single-file HTML app (`TMAR-Accrual-Ledger.html`, ~20,931 lines) already pushed to GitHub at `SlickVicious/TMAR-Accrual-Ledger`.

## Current State

- **Local server**: `http-server` already running on port 8080 (localhost only)
- **GitHub Pages**: `index.html` redirect already in repo → `TMAR-Accrual-Ledger.html`
- **Latest commit** `58fa029` pushed to `origin/master`
- **No `.claude/launch.json`** exists yet

## Plan

### Step 1: Create `.claude/launch.json` for local dev server

Create launch config so `preview_start` can manage the server:

json

````json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "tmar",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["http-server", ".", "-p", "8080", "-c-1", "--cors"],
      "port": 8080
    }
  ]
}
```
- **File**: `/Users/animatedastronaut/.claude/launch.json`

### Step 2: Start (or confirm) the local server
- Kill the existing `http-server` process on 8080 if stale
- Start fresh via `preview_start` with the `tmar` config
- Verify `http://127.0.0.1:8080/TMAR-Accrual-Ledger.html` loads

### Step 3: Confirm GitHub Pages is live
- Check that GitHub Pages is enabled on the repo (source: `master` branch, root)
- The public shareable URL will be: **`https://slickvicious.github.io/TMAR-Accrual-Ledger/`**
- Verify it loads via web fetch

### Step 4: Provide both URLs
- **Local dev**: `http://127.0.0.1:8080` (you only)
- **Shareable with colleague**: `https://slickvicious.github.io/TMAR-Accrual-Ledger/`

### Notes on limitations for the colleague
- **IRS PDFs**: `irs-forms/` is a local symlink — won't resolve on GitHub Pages. IRS form viewer will 404. (Non-blocking: all other features work)
- **Trust Agent / Voice Chat**: Requires an Anthropic API key — colleague would need their own `sk-ant-...` key
- **Sync Center**: GAS Web App URL is per-user — colleague can review UI but push/pull won't work without their own Sheet

## Verification
- Open `https://slickvicious.github.io/TMAR-Accrual-Ledger/` in browser
- Confirm all tabs load: Dashboard, Ledger, Trust Agent, Document Creator, Package Builder, Sync Center, Voice Chat
- Confirm `index.html` auto-redirects to main app

---

# FWM Document Package Builder — Document & Form Creator

## ✅ STATUS: COMPLETE (2026-03-05)

All 8 steps implemented and verified via Playwright browser testing. Package Builder fully operational with 4 FWM presets, 5 new HTML templates, 3 new IRS PDFs, 15-variable auto-fill system, PDF/ZIP/Print export, and Trust Accounting Agent integration.

## Context

The TMAR Accrual Ledger's Document & Form Creator currently supports 11 HTML legal templates + 13 IRS fillable PDFs as individual documents. The user wants to generate **complete trust administration document packages** aligned with the Freeway Mechanics (FWM) 7-Part framework — selecting an entity (e.g., the RLT) and producing multiple contextually auto-filled documents in one action. For example: 3 copies of the Certificate of Trust + Durable POA + Form 2848 + Form 8821 + Form 56-F + Notice of Non-Decedent — all pre-filled with the same trust name, EIN, trustee, etc.

This requires: (A) a Package Builder UI, (B) template variable auto-fill from entity data, (C) new templates/forms that don't exist yet, (D) FWM-aligned package presets, and (E) Trust Accounting Agent integration.

## Gap Analysis

### Available Today
| Type | Item | Key |
|------|------|-----|
| HTML template | Certificate of Trust | `certificate_of_trust` |
| HTML template | Trust Resolution | `trust_resolution` |
| HTML template | Affidavit (generic) | `affidavit` |
| HTML template | 8 more legal templates | various |
| IRS PDF | Form 1099-A | `irs_f1099a` |
| IRS PDF | Form 1099-B | `irs_f1099b` |
| IRS PDF | Form 56-F (Successor Fiduciary) | `irs_f56f` |
| IRS PDF | Form SS-4 (EIN Application) | `irs_fss4` |
| IRS PDF | Form W-9 | `irs_fw9` |
| IRS PDF | 8 more IRS forms | various |

### Missing — Needed for FWM Package
| Type | Item | FWM Part | Priority |
|------|------|----------|----------|
| **IRS PDF** | Form 2848 (Power of Attorney) | Part III | HIGH |
| **IRS PDF** | Form 8821 (Tax Information Auth) | Part III | HIGH |
| **IRS PDF** | Form 56 (Fiduciary Notice) | Part III | HIGH |
| **HTML template** | Durable Power of Attorney | Part II | HIGH |
| **HTML template** | Notice of Non-Decedent | Part III | HIGH |
| **HTML template** | Witness Affidavit (3-witness) | Part II | MEDIUM |
| **HTML template** | Certificate of Service | Part III | MEDIUM |
| **HTML template** | FWM Certificate of Trust (full) | Part II | HIGH |

### Auto-Fill Gap
- Only `{{DATE}}` is currently auto-replaced; `{{PARTY_NAME}}`, `{{JURISDICTION}}` etc. require manual editing
- Entity data (name, EIN, type, status) exists in `appData.entities` but is NOT connected to templates
- Trust settings (trustName, trustEIN, trusteeName, cafNumber) exist in `appData.settings` but are NOT connected to templates

## Files to Modify

| File | Path | Changes |
|------|------|---------|
| `TMAR-Accrual-Ledger.html` | `.../TMAR/TMAR-Accrual-Ledger.html` | Package Builder UI, new templates, variable system, agent integration (~650 lines) |
| Filesystem | `.../TMAR/irs-forms/` | Download 3 missing IRS PDFs (2848, 8821, 56) into source directory |

## Data Flow
```
┌─ Package Builder Panel ─────────────────────────────────┐
│                                                          │
│  1. SELECT ENTITY ──────────────────────────────────────│
│     [▼ A Provident Private Creditor RLT (EIN 41-...)]  │
│                                                          │
│  2. SELECT PACKAGE PRESET OR INDIVIDUAL DOCS ───────────│
│     [★ Trust Establishment (Part II)]                    │
│     [★ IRS Notification (Part III)]                      │
│     [★ Banking Setup (Part IV)]                          │
│     [  Custom Selection...]                              │
│                                                          │
│  3. VARIABLE PREVIEW ───────────────────────────────────│
│     {{TRUST_NAME}} = A PROVIDENT PRIVATE CREDITOR...     │
│     {{TRUSTEE}}    = Clinton Wimberly IV                 │
│     {{EIN}}        = 41-6809588                          │
│     {{CAF_NUMBER}} = 0317-17351                          │
│                                                          │
│  4. SET COPIES ─────────────────────────────────────────│
│     Certificate of Trust: [3] copies                     │
│     Durable POA:          [1] copy                       │
│                                                          │
│  5. EXPORT ─────────────────────────────────────────────│
│     [📄 Combined PDF] [📦 ZIP] [🖨️ Print All]           │
└──────────────────────────────────────────────────────────┘
````

---

## Step 1: Download Missing IRS PDFs

Download from IRS.gov into the source directory (symlinked to `TMAR/irs-forms/`):

bash

````bash
cd "/Users/animatedastronaut/Documents/Legal Document Generator/Digital File Cabinet/Gov Forms Links/files/02-forms/2025 IRS Forms"
curl -o f2848.pdf "https://www.irs.gov/pub/irs-pdf/f2848.pdf"
curl -o f8821.pdf "https://www.irs.gov/pub/irs-pdf/f8821.pdf"
curl -o f56.pdf   "https://www.irs.gov/pub/irs-pdf/f56.pdf"
```

Then add 3 new entries to the `<optgroup>` in the template selector AND to the `IRS_FORMS` map:
```
irs_f2848  → { file: 'f2848.pdf', title: 'Form 2848 — Power of Attorney' }
irs_f8821  → { file: 'f8821.pdf', title: 'Form 8821 — Tax Information Authorization' }
irs_f56    → { file: 'f56.pdf',   title: 'Form 56 — Notice Concerning Fiduciary' }
````

---

## Step 2: Add JSZip CDN

Insert after jspdf-autotable script tag (~line 12 in `<head>`):

html

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
```

---

## Step 3: Add New HTML Templates to DOC_TEMPLATES

### 3a. FWM Certificate of Trust (`fwm_certificate_of_trust`)

Based on the FWM workbook's 1-page template. Key differences from existing `certificate_of_trust`:

- Includes recording/mail-to header block
- 7 numbered sections (Trust Name, Effective Date, Grantor, Trustees, EIN, Purpose, Revocability, Property, Authority, Indemnity)
- Uses `{{TRUST_NAME}}`, `{{TRUSTEE}}`, `{{GRANTOR}}`, `{{EIN}}`, `{{JURISDICTION}}`, `{{CO_TRUSTEE}}`, `{{SUCCESSOR_TRUSTEE}}`, `{{DATE}}`
- Notary acknowledgment section

### 3b. Durable Power of Attorney (`durable_poa`)

Covers financial + healthcare decisions. Uses `{{PARTY_NAME}}`, `{{TRUSTEE}}`, `{{JURISDICTION}}`, `{{DATE}}`.

### 3c. Notice of Non-Decedent (`non_decedent_notice`)

Living status notice per FWM Part III. References trust name, EIN, declares trustee is alive. Uses `{{TRUST_NAME}}`, `{{TRUSTEE}}`, `{{EIN}}`, `{{DATE}}`, `{{JURISDICTION}}`.

### 3d. Witness Affidavit (`witness_affidavit`)

3-witness form for trust execution. Uses `{{TRUST_NAME}}`, `{{TRUSTEE}}`, `{{DATE}}`, `{{JURISDICTION}}`.

### 3e. Certificate of Service (`certificate_of_service`)

Proof of mailing/service. Uses `{{TRUST_NAME}}`, `{{TRUSTEE}}`, `{{DATE}}`.

Add these to DOC_TEMPLATES object and to the template `<select>` as a new optgroup:

html

```html
<optgroup label="── FWM Trust Administration ──">
  <option value="fwm_certificate_of_trust">FWM Certificate of Trust (1-Page)</option>
  <option value="durable_poa">Durable Power of Attorney</option>
  <option value="non_decedent_notice">Notice of Non-Decedent</option>
  <option value="witness_affidavit">Witness Affidavit (3-Witness)</option>
  <option value="certificate_of_service">Certificate of Service</option>
</optgroup>
```

---

## Step 4: Template Variable Auto-Fill System

### 4a. Expand `appData.settings` defaults (~line 5279)

Add 4 new fields to the default settings object:

js

```js
jurisdiction: '',
court: '',
address: '',
grantor: ''
```

The existing deep-merge in `loadFromStorage()` handles backward compatibility automatically.

### 4b. `buildVariableMap(entity)` function (~30 lines)

Insert near the DOC_TEMPLATES object. Merges entity data with settings fallbacks:

js

```js
function buildVariableMap(entity) {
  var s = appData.settings || {};
  var e = entity || {};
  var today = new Date();
  var months = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  return {
    '{{PARTY_NAME}}':        e.name || s.trusteeName || '',
    '{{TRUST_NAME}}':        (e.type==='trust'?e.name:'') || s.trustName || '',
    '{{ENTITY_NAME}}':       e.name || s.trustName || '',
    '{{TRUSTEE}}':           s.trusteeName || '',
    '{{GRANTOR}}':           s.grantor || s.trusteeName || '',
    '{{CO_TRUSTEE}}':        '',
    '{{SUCCESSOR_TRUSTEE}}': '',
    '{{EIN}}':               e.ein || s.trustEIN || '',
    '{{CAF_NUMBER}}':        s.cafNumber || '',
    '{{JURISDICTION}}':      s.jurisdiction || '',
    '{{COURT}}':             s.court || '',
    '{{CASE_NUMBER}}':       '',
    '{{DATE}}':              months[today.getMonth()]+' '+today.getDate()+', '+today.getFullYear(),
    '{{ACTIVE_YEAR}}':       s.activeYear || today.getFullYear().toString(),
    '{{ADDRESS}}':           s.address || ''
  };
}
```

### 4c. `populateTemplate(key, varMap)` function (~15 lines)

Fetches DOC_TEMPLATES[key] and replaces all `{{VAR}}` tokens via loop.

### 4d. Modify existing `loadDocTemplate()` (~line 15187)

Replace the current date-only replacement with a call to `buildVariableMap(null)` loop, so even single-document loads benefit from auto-fill.

---

## Step 5: Package Builder UI

### 5a. "📦 Package Builder" button in template bar

Insert after the "New Blank" button (~line 11815):

html

```html
<button onclick="showPackageBuilder()" style="padding:6px 14px;border:1px solid rgba(139,92,246,.4);border-radius:4px;background:rgba(139,92,246,.15);color:#8b5cf6;cursor:pointer;font-weight:700;font-size:11px">📦 Package Builder</button>
```

### 5b. Package Builder HTML panel (~90 lines)

Insert after `doc-pdf-viewer` div. Contains:

- Header with "DOCUMENT PACKAGE BUILDER" title + Back to Editor button
- Entity selection `<select>` populated from `appData.entities`
- **FWM Package Presets** — 4 preset buttons:
    - **Trust Establishment (Part II)**: FWM Certificate of Trust ×3, Witness Affidavit, Durable POA
    - **IRS Notification (Part III)**: Form 2848, Form 8821, Form 56, Non-Decedent Notice, Certificate of Service
    - **Banking Setup (Part IV)**: Certificate of Trust, Trust Resolution, W-9, SS-4
    - **Full Trust Admin**: All of the above combined
- **Custom Selection**: Two-column checklist (legal templates left, IRS forms right) with checkboxes
- **Copies** column: number input next to each checked document (default 1)
- **Variable Preview**: table showing `{{VAR}} = resolved value` for selected entity
- **Action bar**: "Build & Preview" → "Export Combined PDF" / "Export ZIP" / "Print All"
- **Preview area**: scrollable container showing populated documents

### 5c. `showPackageBuilder()` / `exitPackageBuilder()` (~30 lines)

Same pattern as `showIRSForm()`/`exitPDFViewer()` — hide editor+toolbar+pdf-viewer, show package builder.

### 5d. `renderPackageBuilder()` (~80 lines)

Populates entity dropdown, renders checklists from DOC_TEMPLATES keys + IRS_FORMS keys, wires preset buttons.

### 5e. `selectPackagePreset(presetName)` (~40 lines)

Pre-checks the correct documents for each FWM preset:

js

```js
var FWM_PRESETS = {
  trustEstablishment: {
    label: 'Trust Establishment (Part II)',
    docs: [
      { key: 'fwm_certificate_of_trust', copies: 3 },
      { key: 'witness_affidavit',        copies: 1 },
      { key: 'durable_poa',              copies: 1 }
    ]
  },
  irsNotification: {
    label: 'IRS Notification (Part III)',
    docs: [
      { key: 'irs_f2848',              copies: 1 },
      { key: 'irs_f8821',              copies: 1 },
      { key: 'irs_f56',                copies: 1 },
      { key: 'irs_f56f',               copies: 1 },
      { key: 'non_decedent_notice',    copies: 1 },
      { key: 'certificate_of_service', copies: 1 }
    ]
  },
  bankingSetup: {
    label: 'Banking Setup (Part IV)',
    docs: [
      { key: 'fwm_certificate_of_trust', copies: 1 },
      { key: 'trust_resolution',          copies: 1 },
      { key: 'irs_fw9',                   copies: 1 },
      { key: 'irs_fss4',                  copies: 1 }
    ]
  },
  fullTrustAdmin: { /* combines all above */ }
};
```

### 5f. `updateVariablePreview()` (~30 lines)

Reads selected entity, calls `buildVariableMap()`, renders preview table.

### 5g. `buildAndPreviewPackage()` (~60 lines)

Iterates checked items, populates each HTML template via `populateTemplate()`, respects copy count, renders preview. IRS forms show as info cards with entity context (since PDFs can't be auto-filled in Phase 1).

---

## Step 6: Export Functions

### 6a. `exportPackagePDF(docs)` (~80 lines)

Uses jsPDF. For each HTML template: extract text, render pages. For IRS forms: add appendix page with form title + entity context. Respects copy count (repeats pages). Filename: `{TrustName}_Package_{date}.pdf`.

### 6b. `exportPackageZIP(docs)` (~60 lines)

Uses JSZip + FileSaver. For each HTML template: create .doc blob (same as exportDocWord pattern). For IRS PDFs: fetch from `irs-forms/` and include in zip. Respects copy count (duplicates files as `Certificate_of_Trust_1.doc`, `_2.doc`, `_3.doc`). Filename: `{TrustName}_Package_{date}.zip`.

### 6c. `printPackage(docs)` (~30 lines)

Opens new window, concatenates all populated HTML templates with `page-break-before` CSS. Calls `window.print()`.

---

## Step 7: Trust Accounting Agent Integration

### 7a. `parseDocumentCommand(query)` (~40 lines)

Insert near `sendTrustAgentQuery()`. Regex patterns to detect:

- `generate|create|build` + document names or `trust package|document package`
- Returns `{command: 'package', preset: 'trustEstablishment', entity: '...'}` or null

### 7b. Modify `sendTrustAgentQuery()` (~5 lines changed)

Add pre-check before API call: if `parseDocumentCommand()` returns a match, skip API, render response with "Open Package Builder" button that calls `triggerPackageFromAgent()`.

### 7c. `triggerPackageFromAgent(preset, entityName)` (~20 lines)

Switches to Document Creator tab, opens Package Builder, pre-selects entity and preset.

### 7d. Quick query button

Add to Trust Accounting Agent section (~line 11012):

html

```html
<button onclick="trustAgentQ('Generate a trust administration package')">📦 Trust Document Package</button>
```

---

## Step 8: Verify

1. **Missing IRS PDFs**: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/irs-forms/f2848.pdf` → 200
2. **New templates**: Select "FWM Certificate of Trust" from dropdown → loads with `{{VAR}}` placeholders
3. **Auto-fill**: Select any template → variables auto-filled from settings (trust name, EIN, etc.)
4. **Package Builder opens**: Click "📦 Package Builder" → panel shows with entity dropdown + presets
5. **Preset selection**: Click "Trust Establishment (Part II)" → checks Cert of Trust ×3, Witness Affidavit, Durable POA
6. **Variable preview**: Select entity → preview table shows resolved values
7. **Build & Preview**: Click button → populated documents render in preview area
8. **Export PDF**: Click "Export Combined PDF" → multi-page PDF downloads with all documents
9. **Export ZIP**: Click "Export ZIP" → zip file with individual .doc + .pdf files
10. **Print All**: Click "Print All" → print dialog with page breaks between documents
11. **Agent integration**: Type "generate trust establishment package" in Trust Agent → offers Package Builder launch
12. **Back to Editor**: Click "⬅ Back to Editor" → returns to normal editor view, no regression

## Estimated Scope

- ~650 lines of JS/HTML added to TMAR-Accrual-Ledger.html
- 5 new HTML templates in DOC_TEMPLATES (~200 lines of template HTML)
- 3 IRS PDFs downloaded
- 1 CDN script tag (JSZip)
- 4 new settings fields (backward-compatible)