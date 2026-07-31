# Testing Conventions
- Load this file when changing tests, test commands, or test strategy.
- Prefer the smallest test change that matches the requested code change.
- Keep existing assertions unless behavior intentionally changed.
- Do not delete failing tests without explaining why.
- When adding tests, match the surrounding framework, naming, and fixture style.

## Framework

- **Runner:** Jest with ESM (`NODE_OPTIONS=--experimental-vm-modules jest`)
- **Environment:** jsdom
- **Coverage threshold:** 70% (branches, functions, lines, statements) — enforced by Jest config
- **Coverage source:** `src/**/*.js` excluding `**/*.test.js` and `__tests__/**`

## Test Location & Naming

All tests live in `src/__tests__/`. File naming: `<ServiceName>.test.js`.
Current test files:
- `AccountService.test.js` — validate, create, totalBalance, filter, group, update, search
- `StateManager.test.js` — observer pattern, subscribe/unsubscribe
- `TMARService.test.js` — integration (account + transaction + state)

## Test Patterns

**Unit pattern (pure functions — no DOM, no network):**
```javascript
describe('ServiceName.methodName', () => {
  it('description of expected behavior', () => {
    const result = ServiceName.methodName(input);
    expect(result).toEqual(expected);
  });
});
```

**Immutability assertions** — always verify the original object is unchanged after an update:
```javascript
const original = { ...account };
const updated = AccountService.updateAccountBalance(account, 500);
expect(account.balance).toBe(original.balance); // original unchanged
expect(updated.balance).toBe(500);
```

**Validation / error boundary pattern:**
```javascript
it('throws on missing required field', () => {
  expect(() => AccountService.createAccount({ type: 'Checking' })).toThrow();
});
```

**Date range filtering** — pass ISO strings; test both inclusive boundary and out-of-range cases.

## npm Scripts

```bash
npm test              # run all tests once
npm run test:watch    # continuous watch
npm run test:coverage # coverage report
```

Run the narrowest scope first: `jest AccountService` before the full suite.

## What Is NOT Tested Here

- `TMAR-Accrual-Ledger.html` UI logic — no automated tests; manual verification only
- GAS functions — no test framework in `gas/`; test via the GAS editor's debugger
- LLM streaming responses — mock or skip; do not add real API calls to unit tests
