# TMAR JavaScript Services - Setup Guide

**Version:** 1.0.0
**Last Updated:** 2026-02-28

Complete guide for setting up and using the TMAR JavaScript service layer with testing infrastructure.

---

## 🏗️ Architecture Overview

```
TMAR/
├── src/                          # JavaScript Services (NEW!)
│   ├── services/                 # Pure business logic
│   │   ├── AccountService.js     # Account management
│   │   ├── TransactionService.js # Transaction processing
│   │   ├── InvoiceService.js     # Invoice generation
│   │   └── PayrollService.js     # Payroll calculations
│   │
│   ├── utils/
│   │   └── StateManager.js       # Observable state management
│   │
│   ├── storage/
│   │   └── LocalStorage.js       # Safe localStorage wrapper
│   │
│   ├── __tests__/                # Jest test suite
│   │   ├── AccountService.test.js
│   │   └── StateManager.test.js
│   │
│   └── index.js                  # Main entry point
│
├── gas/                          # Google Apps Script (existing)
│   ├── Code.gs
│   ├── PopulateValidation.gs
│   └── CreditReportImport.gs
│
└── package.json                  # Dependencies & scripts
```

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd "/Users/animatedastronaut/Documents/Legal Document Generator/06 Toolkit/Dev/SS Master Acct Reg/TMAR"
npm install
```

**Installed packages:**
- `jspdf` - PDF generation from JavaScript
- `html2canvas` - Convert HTML to canvas for PDF export
- `jest` - Testing framework
- `jest-environment-jsdom` - DOM environment for tests
- `@testing-library/dom` - DOM testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers

### Step 2: Run Tests

```bash
npm test
```

**Available test scripts:**
```bash
npm test                # Run all tests
npm test:watch          # Run tests in watch mode
npm test:coverage       # Run tests with coverage report
```

### Step 3: Verify Installation

All tests should pass:
```
PASS  src/__tests__/AccountService.test.js
PASS  src/__tests__/StateManager.test.js

Test Suites: 2 passed, 2 total
Tests:       30 passed, 30 total
```

---

## 📋 Architectural Principles

All code follows these five principles:

### ✅ 1. Pure Functions (No DOM Access in Services)

**Rule:** Services contain business logic only - no DOM manipulation.

**Good:**
```javascript
export function calculateTotalBalance(accounts) {
  return accounts.reduce((sum, acc) => sum + acc.balance, 0);
}
```

**Bad:**
```javascript
export function calculateTotalBalance(accounts) {
  const total = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  document.getElementById('total').textContent = total; // ❌ NO!
  return total;
}
```

### ✅ 2. Error Handling (Try/Catch, Validation)

**Rule:** All functions validate inputs and handle errors gracefully.

```javascript
export function validateAccount(account) {
  const errors = [];

  if (!account) {
    return { valid: false, errors: ['Account object is required'] };
  }

  if (!account.name || typeof account.name !== 'string') {
    errors.push('Account name is required and must be a string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### ✅ 3. Separation of Concerns (UI ≠ Logic ≠ Storage)

**Three distinct layers:**

```javascript
// LAYER 1: Service (pure business logic)
import { createAccount } from './services/AccountService.js';

// LAYER 2: Storage (persistence)
import { save } from './storage/LocalStorage.js';

// LAYER 3: UI (DOM manipulation - separate file)
function handleAddAccount(formData) {
  // 1. Create account (service layer)
  const account = createAccount(formData);

  // 2. Save to storage
  save('tmar_accounts', [account]);

  // 3. Update UI
  renderAccountList();
}
```

### ✅ 4. Testable (Functions Return Predictable Results)

**Rule:** All functions are pure and easily testable.

```javascript
// Service function
export function calculateTotalBalance(accounts) {
  if (!Array.isArray(accounts)) {
    throw new Error('Accounts must be an array');
  }
  return accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
}

// Test
test('calculates total balance', () => {
  const accounts = [
    { balance: 1000 },
    { balance: 2000 }
  ];

  const total = calculateTotalBalance(accounts);

  expect(total).toBe(3000);
});
```

### ✅ 5. Observable (State Changes Trigger UI Updates)

**Rule:** Use observer pattern for reactive state management.

```javascript
import { createStateManager } from './utils/StateManager.js';

const appState = createStateManager({ count: 0 });

// Subscribe to changes
appState.subscribe((newState, oldState) => {
  console.log('State changed:', oldState.count, '->', newState.count);
  updateCounterDisplay(newState.count); // Automatic UI update
});

// Update state (observers are notified automatically)
appState.setState({ count: 5 });
```

---

## 📦 Service APIs

### AccountService

**Purpose:** Manage financial accounts

**Key Functions:**

```javascript
import * as AccountService from './services/AccountService.js';

// Create account with validation
const account = AccountService.createAccount({
  name: 'Chase Checking',
  type: 'Bank Account - Checking',
  balance: 5000
});

// Calculate total balance
const accounts = [account1, account2];
const total = AccountService.calculateTotalBalance(accounts);

// Search accounts
const results = AccountService.searchAccounts(accounts, 'Chase');

// Group by type
const grouped = AccountService.groupAccountsByType(accounts);

// Filter by status
const active = AccountService.filterAccountsByStatus(accounts, 'Active');
```

**Complete API:**
- `validateAccount(account)` - Validate account data
- `createAccount(data)` - Create new account with defaults
- `calculateTotalBalance(accounts)` - Sum all balances
- `filterAccountsByStatus(accounts, status)` - Filter by status
- `groupAccountsByType(accounts)` - Group by type
- `updateAccountBalance(account, newBalance)` - Update balance (immutable)
- `searchAccounts(accounts, query)` - Search by name/number/type

---

### TransactionService

**Purpose:** Process income, expenses, and transfers

**Key Functions:**

```javascript
import * as TransactionService from './services/TransactionService.js';

// Create transaction
const transaction = TransactionService.createTransaction({
  date: '2024-02-28',
  category: 'Income - W-2 Wages',
  amount: 5000,
  description: 'Paycheck'
});

// Calculate net income
const summary = TransactionService.calculateNetIncome(transactions);
// Returns: { income: 10000, expenses: 3000, net: 7000 }

// Filter by date range
const feb = TransactionService.filterTransactionsByDateRange(
  transactions,
  '2024-02-01',
  '2024-02-29'
);

// Group by category
const grouped = TransactionService.groupTransactionsByCategory(transactions);

// Monthly spending analysis
const spending = TransactionService.calculateMonthlySpending(transactions, 2024, 2);
```

**Complete API:**
- `validateTransaction(transaction)` - Validate transaction data
- `createTransaction(data)` - Create new transaction
- `calculateNetIncome(transactions)` - Calculate income/expenses/net
- `filterTransactionsByDateRange(transactions, start, end)` - Date filter
- `groupTransactionsByCategory(transactions)` - Group with totals
- `calculateMonthlySpending(transactions, year, month)` - Monthly breakdown
- `searchTransactions(transactions, query)` - Search transactions
- `reconcileTransaction(transaction)` - Mark as reconciled

---

### InvoiceService

**Purpose:** Generate and manage invoices

**Key Functions:**

```javascript
import * as InvoiceService from './services/InvoiceService.js';

// Create invoice
const invoice = InvoiceService.createInvoice({
  invoiceNumber: 'INV-2024-001',
  date: '2024-02-28',
  billTo: {
    name: 'Client Name',
    email: 'client@example.com'
  },
  lineItems: [
    { description: 'Consulting Services', quantity: 10, rate: 150 },
    { description: 'Design Work', quantity: 5, rate: 100 }
  ],
  taxRate: 8.5 // 8.5% tax
});

// Mark invoice as sent
const sent = InvoiceService.markInvoiceAsSent(invoice);

// Mark as paid
const paid = InvoiceService.markInvoiceAsPaid(invoice, '2024-03-15');

// Check if overdue
const isOverdue = InvoiceService.isInvoiceOverdue(invoice);

// Calculate revenue
const revenue = InvoiceService.calculateTotalRevenue(invoices, 'Paid');
```

**Complete API:**
- `validateInvoice(invoice)` - Validate invoice data
- `createInvoice(data)` - Create invoice with calculated totals
- `calculateSubtotal(lineItems)` - Calculate subtotal
- `markInvoiceAsSent(invoice)` - Mark as sent (immutable)
- `markInvoiceAsPaid(invoice, date)` - Mark as paid
- `isInvoiceOverdue(invoice)` - Check if overdue
- `filterInvoicesByStatus(invoices, status)` - Filter by status
- `calculateTotalRevenue(invoices, status)` - Calculate revenue

---

### PayrollService

**Purpose:** Calculate payroll with tax withholdings

**Key Functions:**

```javascript
import * as PayrollService from './services/PayrollService.js';

// Create employee
const employee = PayrollService.createEmployee({
  name: 'John Doe',
  payRate: 25.00,
  payType: 'hourly',
  federalAllowances: 2,
  stateAllowances: 1
});

// Calculate payroll
const payroll = PayrollService.calculatePayroll(employee, 80); // 80 hours

// Returns:
// {
//   employeeId: 'EMP-...',
//   employeeName: 'John Doe',
//   grossPay: 2000,
//   deductions: {
//     federalTax: 180,
//     stateTax: 60,
//     socialSecurity: 124,
//     medicare: 29,
//     additional: 0
//   },
//   totalDeductions: 393,
//   netPay: 1607
// }
```

**Complete API:**
- `validateEmployee(employee)` - Validate employee data
- `createEmployee(data)` - Create employee record
- `calculateGrossPay(employee, hours)` - Gross pay with overtime
- `calculateFederalTax(gross, allowances)` - Federal withholding
- `calculateStateTax(gross, allowances)` - State withholding (CA)
- `calculateSocialSecurityTax(gross, ytd)` - FICA calculation
- `calculateMedicareTax(gross)` - Medicare calculation
- `calculatePayroll(employee, hours, ytd)` - Complete payroll

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm test:watch

# Coverage report
npm test:coverage
```

### Writing Tests

Tests use Jest and follow this pattern:

```javascript
// src/__tests__/MyService.test.js
import { myFunction } from '../services/MyService.js';

describe('MyService', () => {
  describe('myFunction', () => {
    test('does what it should', () => {
      const result = myFunction(input);
      expect(result).toBe(expectedOutput);
    });

    test('handles errors', () => {
      expect(() => myFunction(null)).toThrow('Expected error message');
    });
  });
});
```

### Coverage Thresholds

All code must meet these coverage requirements:
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

---

## 💾 State Management

### StateManager

Observable state management with automatic UI updates:

```javascript
import { createStateManager } from './utils/StateManager.js';

// Create state manager
const appState = createStateManager({
  accounts: [],
  transactions: [],
  currentYear: 2024
});

// Subscribe to changes
const unsubscribe = appState.subscribe((newState, oldState) => {
  console.log('Accounts updated');
  renderAccountList(newState.accounts);
});

// Update state (notifies all subscribers)
appState.setState({ accounts: [newAccount] });

// Update with function
appState.setState(prev => ({
  currentYear: prev.currentYear + 1
}));

// Unsubscribe when done
unsubscribe();

// Reset state
appState.reset({ accounts: [], transactions: [] });
```

---

## 💿 Storage

### LocalStorage Wrapper

Safe wrapper for browser localStorage with JSON serialization:

```javascript
import * as LocalStorage from './storage/LocalStorage.js';

// Save data
LocalStorage.save('tmar_accounts', accountsArray);

// Load data with default
const accounts = LocalStorage.load('tmar_accounts', []);

// Check existence
if (LocalStorage.has('tmar_accounts')) {
  // ...
}

// Remove item
LocalStorage.remove('tmar_accounts');

// Clear all
LocalStorage.clear();

// Check availability
if (LocalStorage.isAvailable()) {
  // localStorage is supported
}
```

---

## 🔧 Development Workflow

### Adding a New Service

**Step 1:** Create service file

```bash
touch src/services/ReportService.js
```

**Step 2:** Write pure functions following patterns

```javascript
// src/services/ReportService.js

export function validateReport(report) {
  // Validation logic
}

export function createReport(data) {
  // Business logic
}

export function generatePDF(report) {
  // PDF generation
}
```

**Step 3:** Create test file

```bash
touch src/__tests__/ReportService.test.js
```

```javascript
// src/__tests__/ReportService.test.js
import { createReport } from '../services/ReportService.js';

describe('ReportService', () => {
  test('creates report', () => {
    const report = createReport({ title: 'Test' });
    expect(report.title).toBe('Test');
  });
});
```

**Step 4:** Export from index

```javascript
// src/index.js
import * as ReportService from './services/ReportService.js';
export { ReportService };
```

**Step 5:** Run tests

```bash
npm test ReportService
```

---

## 📊 Integration with Google Sheets

The JavaScript services complement the Google Apps Script layer:

**Google Apps Script (gas/):**
- Custom menu (TMAR Tools)
- Dropdown validation
- Sheet formatting
- Apps Script-specific functions

**JavaScript Services (src/):**
- Pure business logic
- Calculations
- Data transformation
- Testing infrastructure
- Offline-capable operations

**Example integration:**

```javascript
// In Apps Script
function calculateAccountTotals() {
  // Get data from sheet
  var accounts = getAccountsFromSheet();

  // Use JavaScript service (via HTML service or client-side)
  var total = AccountService.calculateTotalBalance(accounts);

  // Update sheet
  updateTotalCell(total);
}
```

---

## 🎯 Next Steps

### Immediate Actions

1. ✅ **Install dependencies:** `npm install`
2. ✅ **Run tests:** `npm test` (verify all pass)
3. ✅ **Review services:** Explore `src/services/`
4. ✅ **Try examples:** Use service functions in Node REPL

### Extend the System

**Create new services:**
- `ReportService` - Financial reporting
- `BudgetService` - Budget tracking
- `ReconciliationService` - Bank reconciliation
- `TaxService` - Tax calculations

**Add UI layer:**
- Create `src/ui/` directory
- Add DOM manipulation (separate from services)
- Connect services to UI via StateManager

**PDF Generation:**
- Use `jspdf` for invoice generation
- Use `html2canvas` for sheet exports

---

## 📚 Additional Resources

**Documentation:**
- `DEPLOYMENT_GUIDE.md` - Apps Script deployment
- `DROPDOWN_VALUES_GUIDE.md` - Dropdown reference
- `MENU_TROUBLESHOOTING.md` - Menu authorization
- `README.md` - Project overview

**Testing:**
- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)

---

## ✅ Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] All tests passing (`npm test`)
- [ ] Code coverage ≥70% (`npm test:coverage`)
- [ ] Services follow architectural principles
- [ ] Tests written for new features
- [ ] Documentation updated
- [ ] Google Sheets integration working

---

**Generated with Claude Code**
