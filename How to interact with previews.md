
1. When a preview tab opens showing a directory listing, **click the filename** (e.g., `TMAR-Accrual-Ledger.html`) to navigate to it
2. Or I can navigate it for you using `preview_eval` like I just did

The `tmar-preview` server serves the entire TMAR directory, so the root shows all files. The app itself lives at `/TMAR-Accrual-Ledger.html`. Once you're on that URL, all buttons and tabs are fully interactive — you can click, scroll, and use the app directly in the preview panel.

so the TMAR html is the revised version of the GAAP Interface? what are the distinguising factors?

Analyzed and identified key differences between TMAR-Accrual-Ledger and GAAP-source documents

Analyzed and identified key differences between TMAR-Accrual-Ledger and GAAP-source documents

Yes — `TMAR-Accrual-Ledger.html` is a fork of `GAAP-source.html` customized for your trust. Here are the distinguishing factors:

## Branding & Identity

||GAAP (Original)|TMAR (Fork)|
|---|---|---|
|**Title**|Universal Accrual Ledger App|TMAR Universal Accrual Ledger|
|**Trust**|Generic placeholder|A Provident Private Creditor RLT|
|**EIN**|Empty|41-6809588 (pre-populated)|
|**Fonts**|JetBrains Mono + Space Grotesk|Calibri, Segoe UI, system-ui|
|**Colors**|Generic dark theme|TMAR palette (#1B2A4A dark blue, #D6E4F0 light blue)|

## Structural Changes

**Renamed:** All `spv*` functions/tabs → `trust*` (SPV Dashboard → Trust Dashboard, `spvSave()` → `trustSave()`, etc. ~15 function renames)

**Removed:** UK Accounting tab, `financialAssets` tab

**Added (5 RedressRight source library tabs):**

- CPSA — Constitutional Challenge Creator (12 templates, rich text editor)
- TRCF — Tax Refund Calculator (Route 1/Route 2, 2024 brackets)
- CCSN — NOL Asset Classification (72-slide reference)
- FDRF — Federal Damages Framework (4-part accordion + TTS)
- EEEJ — Tutorial Journal (28 slides + progress tracking)

## Data Layer

**localStorage keys renamed:** `GAAP_UniversalLedger_Data` → `TMAR_AccrualLedger_Data`, `RR_*` prefix → `TMAR_*` prefix, plus new `TMAR_TrustEstate_Data` key

## Scale

||GAAP|TMAR|
|---|---|---|
|Lines|9,401|16,280 (+73%)|
|Size|628KB|1.1MB|
|Tabs|32|37 (36 active)|

In short: same accounting engine, rebranded for trust administration, with 5 integrated legal/tax reference tools bolted on.