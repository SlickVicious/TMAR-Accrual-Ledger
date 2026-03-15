# Quick Reference: Adding Subscription Documents

## When You Get a Receipt/Invoice Email:

### Step 1: Save the Document
**Naming Format:** `YYYYMMDD_[Service]_[Type].pdf`

**Examples:**
- `20260115_Anthropic_Receipt.pdf`
- `20260101_Obsidian_Invoice.pdf`
- `20260118_OpenAI_API_Usage.pdf`

### Step 2: File in Vault
```
Trust-Records/
└── Subscriptions/
    └── [Category]/
        └── [Service]/
            └── Receipts/
                └── YYYYMMDD_[Service]_Receipt.pdf
```

**Real Examples:**
```
Trust-Records/Subscriptions/AI-Services/Anthropic/Receipts/20260115_Anthropic_Receipt.pdf
Trust-Records/Subscriptions/Software/Obsidian/Receipts/20260101_Obsidian_Invoice.pdf
Trust-Records/Subscriptions/Apple/Receipts/20260110_Apple_iCloud_Receipt.pdf
```

### Step 3: Update Master Account Register (Excel)
Open the Excel file and add to **Master Register tab:**

| Field | Example |
|-------|---------|
| Provider/Creditor | Anthropic PBC |
| Account Number | (email address or ID) |
| Account Type | Subscription - AI Service |
| Status | Active |
| Open Date | 2025-12-01 |
| Current Balance | N/A (subscription) |
| Billing Frequency | Monthly |
| Next Payment Date | 2026-02-01 |
| Primary User | Clint |
| Autopay Status | Yes |
| Autopay Source | BoA ****0672 |
| Statements Complete | Y |
| Document Location | Trust-Records/Subscriptions/AI-Services/Anthropic/ |

### Step 4: Update PoP Register Tab
Add to **Proof of Purchase tab:**

| Field | Example |
|-------|---------|
| Date of Purchase | 2026-01-15 |
| Vendor/Seller | Anthropic |
| Description | Claude Pro Subscription - January |
| Category | Subscription - AI Service |
| Purchase Type | Service |
| Amount | $20.00 |
| Payment Method | BoA ****0672 |
| Tax Deductible | Yes (if business use) |
| Document Location | Trust-Records/Subscriptions/AI-Services/Anthropic/Receipts/ |
| File Name | 20260115_Anthropic_Receipt.pdf |

---

## Folder Cheat Sheet:

### AI Services:
```
Subscriptions/AI-Services/
├── OpenAI/Receipts/           ← ChatGPT Plus, API
├── Anthropic/Receipts/        ← Claude Pro, API
├── Perplexity/Receipts/       ← Perplexity Pro
└── Cline/Receipts/            ← Cline subscription
```

### Software:
```
Subscriptions/Software/
├── Obsidian/Receipts/         ← Sync, Publish
├── Adobe/Receipts/            ← Creative Cloud
├── GitHub/Receipts/           ← Copilot, Pro
├── Microsoft/Receipts/        ← M365, OneDrive
└── [Add more as needed]
```

### Streaming:
```
Subscriptions/Streaming/
├── Netflix/Receipts/
├── Hulu/Receipts/
├── Disney-Plus/Receipts/
├── HBO-Max/Receipts/
└── Spotify/Receipts/
```

### Apple:
```
Subscriptions/Apple/
├── iCloud-Storage/Receipts/
├── Apple-Music/Receipts/
├── Apple-TV-Plus/Receipts/
└── AppleCare/Receipts/
```

### Google:
```
Subscriptions/Google/
├── Google-Workspace/Receipts/
├── Google-One/Receipts/
└── YouTube-Premium/Receipts/
```

---

## Monthly Routine (15 minutes):

**End of Each Month:**

1. **Check email** for all subscription receipts
2. **Save** with proper naming: `YYYYMMDD_Service_Receipt.pdf`
3. **File** in appropriate vault folder
4. **Update** Master Account Register (add row if new)
5. **Update** PoP Register (add receipt details)
6. **Reconcile** against bank/credit card statement

---

## Annual Routine (1 hour):

**End of Each Year:**

1. **Create annual summaries** for each service
2. **Export** Excel to PDF for Trust Minutes
3. **Archive** old receipts (keep 7 years)
4. **Review** subscriptions - cancel unused
5. **Update** Document Inventory tab
6. **Verify** all tax-deductible expenses tracked

---

## Tax Time (Quarterly/Annually):

**Pull Reports From:**
- PoP Register → Filter by "Tax Deductible = Y"
- Investment Accounts → 1099s, 5498s
- Employment Records → W-2s
- Tax Tracking → All forms

**For CPA/Tax Preparer:**
- Export Excel to PDF
- Include all 1099s from investment accounts
- Include all W-2s from employment
- Include business expense receipts (AI services if business use)
- Include charitable donations (if tracked)

---

## Emergency: Finding Old Documents

**If you can't remember where you filed something:**

1. **Search vault** (Obsidian search or File Explorer)
2. **Check Excel** → Master Register → Document Location column
3. **Check Excel** → PoP Register → File Name column
4. **Check Excel** → Document Inventory tab
5. **Check backups** in `.obsidian\_*-backup-*` folders

---

## Adding New Service Not Listed:

1. **Create folder:**
   ```
   Trust-Records/Subscriptions/[Category]/[Service-Name]/
   Trust-Records/Subscriptions/[Category]/[Service-Name]/Receipts/
   Trust-Records/Subscriptions/[Category]/[Service-Name]/Account-Documents/
   ```

2. **Create _ACCOUNT_INFO.md** (use template from existing services)

3. **Add to Master Register** in Excel

4. **Add to Account Discovery Tracker** (so you remember you created it)

---

## Quick Stats to Track:

**Monthly:**
- Total subscription cost
- New subscriptions added
- Subscriptions canceled
- Autopay failures

**Annually:**
- Total spent on subscriptions
- Which services used most
- Which services never used (cancel!)
- Tax-deductible expenses total

---

*Keep this guide handy - you'll reference it monthly!*
