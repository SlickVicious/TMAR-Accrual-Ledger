
Version 1 on Mar 4, 2026, 4:32 PM
Deployment ID: AKfycbwdLljh2fsOv--_8Ik3PKVAnXRflpkSkmB8zi-JZeVwdvZaKbLNk843kgK9R3V2V_2C

URL: https://script.google.com/macros/s/AKfycbwdLljh2fsOv--_8Ik3PKVAnXRflpkSkmB8zi-JZeVwdvZaKbLNk843kgK9R3V2V_2C/exec## Data Flow Map — Where Everything Goes

### PULL (Blue buttons — Sheets → Ledger)

|Sync Button|Reads from Google Sheet|Stores in|**You see it on this tab**|
|---|---|---|---|
|**Accounts**|`Master Register` sheet|`appData.entities` → localStorage|**🏢 Entities** tab|
|**Transactions**|`Transaction Ledger` sheet|`appData.ledgerEntries` → localStorage|**📒 Ledger** tab|
|**Obligations**|`Household Obligations` sheet|`appData.payables` → localStorage|**📤 A/P** tab|

### PUSH (Green buttons — Ledger → Sheets)

|Sync Button|Reads from|Writes to Google Sheet|
|---|---|---|
|**Entities**|**🏢 Entities** tab → `appData.entities`|`Master Register` sheet|
|**Transactions**|**📒 Ledger** tab → `appData.ledgerEntries`|`Transaction Ledger` sheet|
|**Payables**|**📤 A/P** tab → `appData.payables`|`Household Obligations` sheet|
|**1099s**|**📑 Filings** tab → `appData.filings`|`1099 Filing Chain` sheet|

### The storage chain:

```
Google Sheet ←→ GAS Web App ←→ fetch() ←→ appData.{} ←→ localStorage
                                                ↕
                                          UI Tab renders
```

**Everything lives in `localStorage`** under the `appData` object. There is no separate "Payables" tab — the Sync Center button labeled "Payables" writes to `appData.payables` which is rendered by the **📤 A/P** tab. The naming mismatch between the button labels ("Accounts", "Obligations", "Payables") and the actual UI tabs ("Entities", "A/P") is confusing. Want me to rename the Sync Center button labels to match the actual tab names so it's clear where data lands?

## Labels Updated

### Sync Buttons (before → after)

||PUSH (green)|PULL (blue)|
|---|---|---|
|**Before**|Entities, Transactions, Payables, 1099s|Accounts, Transactions, Obligations|
|**After**|🏢 Entities, 📒 Ledger, 📤 A/P, 📑 1099s|🏢 Entities, 📒 Ledger, 📤 A/P|

### Sync Log Messages (before → after)

|Direction|Before|After|
|---|---|---|
|Push|"Entities → Master Register"|"🏢 Entities → Master Register"|
|Push|"Transactions → Transaction Ledger"|"📒 Ledger → Transaction Ledger"|
|Push|"Payables → Obligations"|"📤 A/P → Household Obligations"|
|Pull|"Master Register → Entities"|"Master Register → 🏢 Entities"|
|Pull|"Transaction Ledger → Ledger"|"Transaction Ledger → 📒 Ledger"|
|Pull|"Obligations → Payables"|"Household Obligations → 📤 A/P"|

### CSV Import Cards (before → after)

|Before|After|
|---|---|
|"Master Register → Entities + COA"|"Master Register → 🏢 Entities + COA"|
|"Transaction Ledger → Ledger Entries"|"Transaction Ledger → 📒 Ledger"|
|"Household Obligations → Payables"|"Household Obligations → 📤 A/P"|

Now button labels match the tab icons, and log messages show `Sheet Name → 📌 Tab Name` so you always know exactly where data is going. Refresh to see it.