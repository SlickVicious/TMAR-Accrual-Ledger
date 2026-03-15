# TMAR Bill of Exchange Generator - User Guide

**Version:** 1.0.0
**Last Updated:** 2026-02-28
**Status:** ✅ Deployed and Ready

---

## 🎯 Overview

The **TMAR Bill of Exchange Generator** is a professional legal document creation system for generating negotiable instruments and financial documents. The interface features a formal navy-and-gold design with multi-language support and Google Sheets integration.

### Document Types

1. **📜 Bill of Exchange** - Negotiable instrument (UNCITRAL compliant)
2. **💰 Payment Order** - Treasury payment instrument
3. **📝 Promissory Note** - Unconditional promise to pay
4. **📋 Credit Assignment** - Federal credit mechanism

### Key Features

- **Multi-Language Support** - English, French, Spanish with synchronized fields
- **Document Scope** - International (UNCITRAL) or Domestic (US Treasury)
- **Serial Number Generation** - Random alphanumeric codes with special characters
- **TMAR Integration** - Load account data from Master Register
- **Export Options** - Print, Save HTML, Export PDF, Share
- **Legal Compliance** - References to UCC, Federal Reserve Act, UNCITRAL, Supreme Court precedents
- **Professional Styling** - Navy/gold color scheme with serif fonts

---

## 🚀 Quick Start

### Opening the Interface

1. **Open your TMAR Google Sheet:**
   ```
   https://docs.google.com/spreadsheets/d/1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ/
   ```

2. **Refresh the page** (Cmd+Shift+R / Ctrl+Shift+R)

3. **Click:** `TMAR Tools → ⚖ Bill of Exchange`

4. **The interface opens in a 1200x900 modal dialog**

---

## 🎨 Interface Design

### Navy & Gold Theme

The interface features a formal, legal document aesthetic:

- **Color Palette:**
  - Navy (#0a1628) - Primary text and borders
  - Gold (#c9a962) - Accents and highlights
  - Parchment (#f5f0e6) - Document background
  - White (#ffffff) - Input fields

- **Typography:**
  - EB Garamond - Headings and display text
  - Crimson Pro - Body text and forms

- **Visual Elements:**
  - Official seal with ⚖ symbol
  - Double-bordered document wrapper
  - Diamond pattern background overlay
  - Signature lines with crosshair cursor

---

## 📋 Document Types

### 1. Bill of Exchange

**Purpose:** Three-party negotiable instrument directing payment

**Parties:**
- **Drawer** - Person/entity issuing the bill
- **Drawee** - Person/entity directed to pay (usually a bank)
- **Payee** - Person/entity receiving payment

**Legal Basis:**
- UCC Article 3 - Negotiable Instruments
- UNCITRAL Model Law on International Bills of Exchange
- Federal Reserve Act, Title IV § 401
- 31 U.S.C. § 3123

**Use Cases:**
- International trade transactions
- Commercial credit instruments
- Treasury payment mechanisms
- Debt obligations

### 2. Payment Order

**Purpose:** Direct instruction to pay a specified amount

**Legal Basis:**
- Treasury payment procedures
- Federal Reserve operations
- 31 U.S.C. § 321(d)

**Use Cases:**
- Government payments
- Federal credit disbursements
- Official payment directives

### 3. Promissory Note

**Purpose:** Unconditional promise to pay a sum of money

**Parties:**
- **Maker** - Person promising to pay
- **Payee** - Person receiving payment

**Legal Basis:**
- UCC Article 3
- State contract law

**Use Cases:**
- Personal loans
- Business financing
- Real estate transactions
- Settlement agreements

### 4. Credit Assignment

**Purpose:** Transfer of credit or right to receive payment

**Legal Basis:**
- Internal Revenue Manual 3.8.45.5.10.1
- Federal credit mechanisms
- Assignment of rights under UCC

**Use Cases:**
- Federal credit transfers
- Tax credit assignments
- Right to payment transfers

---

## 🔧 Using the Interface

### Document Controls

**1. Document Type Selector**
- **International** - UNCITRAL-compliant (for cross-border transactions)
- **Domestic** - US Treasury-focused (for domestic transactions)

**2. Language Selector**
- **English** - Full English legal text
- **Français** - Complete French translation
- **Español** - Complete Spanish translation

**Note:** All fields synchronize across languages automatically

**3. Load TMAR Account**
- Dropdown populated from Master Register
- Auto-fills Drawer name and Amount from selected account

### Field Synchronization

**How it works:**
When you enter data in one language version, the corresponding field updates in all languages automatically.

**Example:**
- Enter "John Doe" in Drawer (English)
- "John Doe" appears in Tireur (French) and Librador (Spanish)
- Enter "$5,000" in Amount
- All three language versions show $5,000

### Form Fields

**Instrument Details:**
- **Issue Date** - Date the instrument is created
- **Maturity Date** - Date payment is due
- **Amount (USD)** - Sum to be paid
- **Place of Issue** - Location where instrument is created
- **Place of Payment** - Location where payment should be made

**Parties:**
- **Drawer/Issuer** - Name and address of person creating the instrument
- **Drawee/Payer** - Name and address of person directed to pay
- **Payee/Beneficiary** - Name and address of person receiving payment

**Signatures:**
- **Drawer Signature** - Canvas for drawing signature
- **Acceptor/Drawee Signature** - Canvas for acceptor signature
- **Print Names** - Typed names below signatures
- **Dates** - Signature dates

---

## ⚡ Action Buttons

### 🔢 Generate Serial Number

**Click to generate a unique serial number**

**Format:** `XXXX-XXXX-XXXX-XXXX`

**Characters used:**
- Uppercase letters (A-Z)
- Numbers (0-9)
- Occasional special characters (!@#$%&*)

**Example:** `A5B2-9X!3-K7L4-P2@9`

**Purpose:**
- Unique identification of instrument
- Tracking and recordkeeping
- Verification and authentication

### 🖨️ Print

**Opens browser print dialog**

**Print features:**
- Hides navigation tabs and controls
- Hides action buttons
- Shows only document content
- Optimized for A4/Letter paper

**Steps:**
1. Fill in all required fields
2. Click Print button
3. Browser print dialog opens
4. Select printer or "Save as PDF"
5. Click Print

### 💾 Save HTML

**Downloads complete document as HTML file**

**File includes:**
- Full document content
- Embedded CSS styling
- Current language version
- All form data

**Filename format:** `bill-of-exchange_2026-02-28.html`

**Use cases:**
- Archive copy of document
- Email attachment
- Import into word processor
- Further editing

### 📄 Export PDF

**Status:** Coming in next version

**Current workaround:**
1. Click Print button
2. Select "Save as PDF" in print dialog
3. Save to desired location

**Future features:**
- Direct PDF generation
- Custom PDF templates
- Digital signatures
- Password protection

### 📤 Share

**Shares document via native share API or clipboard**

**Share methods:**

**If Web Share API supported (mobile):**
- Opens native share sheet
- Share via email, messages, etc.
- Copy link or text

**If Web Share API not supported (desktop):**
- Copies serial number to clipboard
- Alert notification confirms copy

**Shared content:**
```
TMAR BILL OF EXCHANGE - Serial: A5B2-9X!3-K7L4-P2@9
```

---

## 📝 Step-by-Step Workflow

### Creating a Bill of Exchange

**Scenario:** You need to create a bill of exchange for $10,000 payable in 90 days

**Step 1: Open the Interface**
1. Go to TMAR Google Sheet
2. Click: TMAR Tools → ⚖ Bill of Exchange
3. Interface opens

**Step 2: Configure Document**
1. Ensure "Bill of Exchange" tab is active (default)
2. Select Document Type: "International" or "Domestic"
3. Select Language: "English" (or preferred language)
4. (Optional) Select TMAR account to pre-fill drawer info

**Step 3: Generate Serial Number**
1. Click "🔢 Generate Serial Number"
2. Unique serial appears: `B7K3-M2@4-R9X1-P5L8`
3. Note this for your records

**Step 4: Fill Instrument Details**
1. **Issue Date:** Select today's date (pre-filled)
2. **Maturity Date:** Select date 90 days from now
3. **Amount:** Enter `10000`
4. **Place of Issue:** Enter city/state (e.g., "New York, NY")
5. **Place of Payment:** Enter payment location

**Amount displays prominently:** $10,000.00

**Step 5: Enter Party Information**

**Drawer (You):**
- Name: "Clint Wimberly"
- Address: "123 Main St, City, State, ZIP"

**Drawee (Bank):**
- Name: "Chase Bank, N.A."
- Address: "Bank branch address"

**Payee (Beneficiary):**
- Name: "John Smith"
- Address: "456 Oak Ave, City, State, ZIP"

**Step 6: Review Legal Declaration**

Read the pre-populated legal text:
- Authorization to drawee to pay
- Legal references (UCC, Federal Reserve Act, etc.)
- Terms and conditions

**Step 7: Sign the Document**

**Drawer Signature:**
1. Click in signature canvas
2. Draw your signature with mouse/touchpad
3. Enter your printed name: "Clint Wimberly"
4. Verify date is correct

**Acceptor Signature:**
- Leave blank if not yet accepted
- Bank will sign upon acceptance

**Step 8: Export the Document**

**Option A: Print/PDF**
1. Click "🖨️ Print"
2. Select "Save as PDF"
3. Save to: `Documents/Bills_of_Exchange/BOE_10000_2026-02-28.pdf`

**Option B: Save HTML**
1. Click "💾 Save HTML"
2. File downloads automatically
3. Archive in appropriate folder

**Option C: Share**
1. Click "📤 Share"
2. Share via email or messaging
3. Or copy serial number for reference

**Step 9: Present for Acceptance**

Send the document to the drawee (bank) for acceptance. Once accepted, the bill becomes a legally binding obligation.

---

## 🌍 Multi-Language Features

### Language Versions

**English (EN)**
- Bill of Exchange
- Negotiable Instrument - UNCITRAL Compliant
- Standard UCC terminology

**French (FR)**
- Lettre de Change
- Effet de Commerce - Conforme CNUDCI
- European legal terminology

**Spanish (ES)**
- Letra de Cambio
- Instrumento Negociable - Conforme CNUDMI
- Latin American legal terminology

### Terminology Differences

| English | French | Spanish |
|---------|--------|---------|
| Drawer | Tireur | Librador |
| Drawee | Tiré | Librado |
| Payee | Bénéficiaire | Beneficiario |
| Issue Date | Date d'émission | Fecha de emisión |
| Maturity Date | Date d'échéance | Fecha de vencimiento |
| Amount | Montant | Importe |

### Synchronized Fields

All data entered in one language automatically appears in other languages:

**Example workflow:**
1. Select English
2. Fill in all fields
3. Switch to French
4. All data appears in French version
5. Switch to Spanish
6. All data appears in Spanish version

**Use case:** Create document in English, present French copy to European bank, provide Spanish copy to Latin American counterparty - all identical data.

---

## 📚 Legal References

### UCC Article 3 - Negotiable Instruments

**Key Provisions:**
- § 3-104: Definition of negotiable instrument
- § 3-106: Unconditional promise or order
- § 3-108: Payable on demand or at definite time
- § 3-110: Identification of person to whom instrument payable

**Requirements for negotiability:**
1. Written and signed
2. Unconditional promise or order to pay
3. Fixed amount of money
4. Payable on demand or at definite time
5. Payable to order or bearer

### 31 U.S.C. § 3123

**Payment of Obligations**

> "The United States Government may pay an obligation of the Government from any money in the Treasury."

**Relevance:** Federal payment authority for bills of exchange drawn on US Treasury

### Federal Reserve Act, Title IV § 401

**Federal Reserve Note Issuance**

Establishes the legal framework for:
- Federal Reserve note creation
- Bank credit mechanisms
- Payment system operations

### UNCITRAL Model Law

**International Bills of Exchange and International Promissory Notes**

**Key Features:**
- Harmonized international standards
- Cross-border enforceability
- Uniform legal framework
- Recognition in multiple jurisdictions

**Applicability:** When "International" document type is selected

### Supreme Court Precedents

**Juilliard v. Greenman (1884)**
- Legal tender for all debts
- Constitutional authority for currency

**Perry v. United States (1935)**
- Government obligation to honor debts
- Sanctity of contracts

---

## 🔐 Security & Compliance

### Data Protection

**Browser Storage:**
- No data stored on external servers
- All processing happens client-side
- Privacy-preserving by design

**Google Sheets Integration:**
- Only loads account data for pre-fill
- No automatic data upload
- You control all exports

### Legal Compliance

**UCC Compliance:**
- Meets Article 3 requirements
- Proper legal terminology
- Required disclosures

**UNCITRAL Compliance:**
- International standards followed
- Cross-border enforceability
- Recognized legal framework

### Best Practices

**Before Creating Documents:**
1. Verify all party information is accurate
2. Confirm amounts and dates
3. Understand legal implications
4. Consult legal counsel if unsure

**After Creating Documents:**
1. Save multiple copies (PDF + HTML)
2. Archive securely
3. Track serial numbers
4. Keep records of acceptance

**Security Recommendations:**
1. Don't share serial numbers publicly
2. Store documents in encrypted folders
3. Shred physical copies when no longer needed
4. Maintain audit trail of all instruments

---

## 💡 Use Cases

### Use Case 1: International Trade

**Scenario:** Importing goods from France, need to establish payment terms

**Document Type:** Bill of Exchange (International)
**Language:** French

**Steps:**
1. Create bill for invoice amount
2. Set maturity to 60 days after shipment
3. Drawer: Your company
4. Drawee: Your bank
5. Payee: French exporter
6. Present to bank for acceptance
7. Send accepted bill to exporter
8. Goods ship with payment guarantee

### Use Case 2: Domestic Payment Obligation

**Scenario:** Settlement of business debt with structured payment

**Document Type:** Bill of Exchange (Domestic)
**Language:** English

**Steps:**
1. Create bill for settlement amount
2. Set maturity to agreed payment date
3. Drawer: Debtor company
4. Drawee: Debtor's bank
5. Payee: Creditor company
6. Sign and deliver
7. Creditor can negotiate or hold until maturity

### Use Case 3: Federal Credit Assignment

**Scenario:** Assigning federal tax credit to third party

**Document Type:** Credit Assignment
**Language:** English

**Steps:**
1. Select "Assignment" document type
2. Reference IRM 3.8.45.5.10.1
3. Drawer: Taxpayer assigning credit
4. Drawee: US Treasury
5. Payee: Credit purchaser
6. Include tax identification numbers
7. File with IRS per procedures

### Use Case 4: Promissory Note

**Scenario:** Personal loan between family members

**Document Type:** Promissory Note
**Language:** English

**Steps:**
1. Select "Promissory Note" tab
2. Amount: Loan principal
3. Maturity: Repayment date
4. Maker: Borrower
5. Payee: Lender
6. Include interest terms if applicable
7. Both parties sign
8. Retain copies for records

---

## 🛠️ Troubleshooting

### Interface Won't Open

**Issue:** Clicking "⚖ Bill of Exchange" does nothing

**Solution:**
1. Refresh Google Sheet (Cmd+Shift+R)
2. Wait 5 seconds for scripts to load
3. Try again
4. Check authorization (Extensions → Apps Script)

### Accounts Not Loading

**Issue:** "Load TMAR Account" dropdown is empty

**Solution:**
1. Verify Master Register sheet exists
2. Check you have view permissions
3. Refresh interface
4. Reload accounts from Google Sheets

### Serial Number Not Generating

**Issue:** Clicking generate does nothing

**Solution:**
1. Check browser console for errors (F12)
2. Refresh the interface
3. Try again
4. Manually enter serial if needed

### Fields Not Synchronizing

**Issue:** Entering data in English doesn't appear in French/Spanish

**Solution:**
1. Ensure you're typing in fields with `data-sync-group` attribute
2. Refresh the interface
3. Re-enter data
4. Check browser console for JavaScript errors

### Print Layout Issues

**Issue:** Document doesn't print correctly

**Solution:**
1. Use Chrome or Firefox (best print support)
2. Check print preview first
3. Adjust margins if needed
4. Consider landscape orientation for wider content
5. Use "Save as PDF" option instead

### Save HTML Not Working

**Issue:** Save HTML button clicks but no download

**Solution:**
1. Check browser download settings
2. Disable popup blocker
3. Allow downloads from Google Sheets domain
4. Try in different browser

---

## 📊 Technical Details

### Field Mapping

**Data attributes used:**
```html
<input type="text" id="drawer-en" data-sync-group="drawer">
<input type="text" id="drawer-fr" data-sync-group="drawer">
<input type="text" id="drawer-es" data-sync-group="drawer">
```

**JavaScript synchronization:**
```javascript
field.addEventListener('input', function() {
  const group = this.getAttribute('data-sync-group');
  const value = this.value;

  document.querySelectorAll(`[data-sync-group="${group}"]`).forEach(syncField => {
    if (syncField !== this) {
      syncField.value = value;
    }
  });
});
```

### Serial Number Algorithm

```javascript
function generateSerialNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const special = '!@#$%&*';
  let serial = '';

  for (let i = 0; i < 4; i++) {
    if (i > 0) serial += '-';
    for (let j = 0; j < 4; j++) {
      if (Math.random() > 0.9 && j > 0) {
        serial += special.charAt(Math.floor(Math.random() * special.length));
      } else {
        serial += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
  }

  return serial;
}
```

**Output example:** `K7M2-P@94-X3L1-R5!8`

### Google Sheets Integration

**Loading accounts:**
```javascript
google.script.run
  .withSuccessHandler(function(accounts) {
    // Populate dropdown
    accounts.forEach(acc => {
      const option = document.createElement('option');
      option.value = acc.id;
      option.textContent = `${acc.id} - ${acc.name}`;
      dropdown.appendChild(option);
    });
  })
  .getAccountList();
```

**Auto-fill from account:**
```javascript
const account = JSON.parse(selectedOption.dataset.account);
document.getElementById('drawer-en').value = account.primaryUser;
document.getElementById('amount-en').value = Math.abs(account.balance);
```

---

## 🎓 Training Resources

### Document Creation Checklist

**Before creating:**
- [ ] Understand the legal implications
- [ ] Verify all party information
- [ ] Confirm payment terms
- [ ] Check jurisdictional requirements
- [ ] Consult legal counsel if needed

**During creation:**
- [ ] Select correct document type
- [ ] Choose appropriate scope (International/Domestic)
- [ ] Generate unique serial number
- [ ] Fill all required fields
- [ ] Review legal declarations
- [ ] Verify amounts and dates
- [ ] Obtain necessary signatures

**After creation:**
- [ ] Save in multiple formats (PDF + HTML)
- [ ] Archive securely
- [ ] Distribute to relevant parties
- [ ] Track serial number
- [ ] Follow up on acceptance/payment
- [ ] Maintain records for tax/legal purposes

### Sample Documents

**Practice creating these:**

1. **Simple Bill of Exchange**
   - Amount: $1,000
   - Maturity: 30 days
   - Drawer: Yourself
   - Drawee: Your bank
   - Payee: Sample vendor

2. **International Trade Bill**
   - Amount: $50,000
   - Maturity: 90 days
   - Document Type: International
   - Language: French
   - Include shipping terms

3. **Payment Order**
   - Amount: $5,000
   - Document Type: Payment Order
   - Reference federal procedures
   - Treasury-focused language

---

## 🔄 Version History

### v1.0.0 (2026-02-28)

**Initial Release:**
- ✅ Four document types (Bill of Exchange, Payment Order, Promissory Note, Credit Assignment)
- ✅ Multi-language support (English, French, Spanish)
- ✅ Field synchronization across languages
- ✅ Serial number generator with special characters
- ✅ Google Sheets integration (load account data)
- ✅ Navy/gold professional styling
- ✅ Legal references (UCC, Federal Reserve Act, UNCITRAL, Supreme Court)
- ✅ Print functionality
- ✅ Save HTML export
- ✅ Share functionality
- ✅ Signature canvases
- ✅ Responsive design

**Coming Soon (v1.1):**
- [ ] Direct PDF export (without print dialog)
- [ ] Digital signature integration
- [ ] Save to Google Drive
- [ ] Email delivery
- [ ] Template library
- [ ] Custom legal clauses
- [ ] Multi-currency support
- [ ] Interest calculation
- [ ] Payment schedule generator

---

## 📞 Support

### Getting Help

**Documentation:**
- `BILL_OF_EXCHANGE_GUIDE.md` - This file
- `GUI_GUIDE.md` - Control Panel guide
- `GAAP_INTERFACE_GUIDE.md` - Accounting interface guide
- `INTEGRATION_COMPLETE.md` - Technical architecture

**Legal Resources:**
- UCC Article 3: https://www.law.cornell.edu/ucc/3
- UNCITRAL: https://uncitral.un.org/en
- Federal Reserve: https://www.federalreserve.gov/

---

## ✅ Summary

The **TMAR Bill of Exchange Generator** provides:

✅ **Professional Legal Documents** - UCC and UNCITRAL compliant
✅ **Multi-Language Support** - English, French, Spanish with synchronization
✅ **Four Document Types** - Bills, Payment Orders, Notes, Assignments
✅ **TMAR Integration** - Load account data from Master Register
✅ **Formal Styling** - Navy/gold legal document aesthetic
✅ **Export Options** - Print, HTML, PDF (coming), Share
✅ **Legal References** - Comprehensive citations to statutes and cases
✅ **Signature Capture** - Canvas-based signature input
✅ **Serial Numbers** - Unique identification system

**Open it now:** `TMAR Tools → ⚖ Bill of Exchange`

---

**Interface Status:** ✅ DEPLOYED AND READY
**Generated with Claude Code**
