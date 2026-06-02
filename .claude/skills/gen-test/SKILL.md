---
name: gen-test
description: Scaffold a Jest test for a TMAR service in the project's exact conventions (ESM, jsdom, immutability assertions, src/__tests__/<Service>.test.js). User-invoked when adding tests for src/services code.
disable-model-invocation: true
---

# Generate a Jest Test (TMAR conventions)

Create tests that match this repo exactly. Details in
`.claude/docs/testing-conventions.md`.

## Hard conventions
- **Runner**: Jest + ESM (`NODE_OPTIONS=--experimental-vm-modules jest`), `jsdom` env.
- **Location/Name**: `src/__tests__/<ServiceName>.test.js`.
- **Imports**: ESM `import` (the package is `"type": "module"`). Import the unit under
  test from `../services/<Service>.js` (or `../utils/`, `../storage/`).
- **Coverage**: global threshold 70% (branches/functions/lines/statements). Cover the
  happy path, each branch, and error boundaries so the threshold holds.
- **No network, no real LLM calls, no DOM-dependent UI logic.** Mock or skip those.

## Required patterns

Pure-function unit:
```javascript
import { ServiceName } from '../services/ServiceName.js';

describe('ServiceName.methodName', () => {
  it('describes the expected behavior', () => {
    const result = ServiceName.methodName(input);
    expect(result).toEqual(expected);
  });
});
```

Immutability assertion (ALWAYS include for any update/transform method — the repo
enforces "return new objects, never mutate input"):
```javascript
it('does not mutate its input', () => {
  const original = { ...account };
  const updated = AccountService.updateAccountBalance(account, 500);
  expect(account.balance).toBe(original.balance); // input unchanged
  expect(updated.balance).toBe(500);
  expect(updated).not.toBe(account);              // new reference
});
```

Validation / error boundary:
```javascript
it('throws on missing required field', () => {
  expect(() => AccountService.createAccount({ type: 'Checking' })).toThrow();
});
```

Date-range filtering: pass ISO strings; test inclusive boundary AND out-of-range cases.

## Workflow
1. Read the target service in `src/services/` to enumerate its public methods.
2. For each method generate: happy path, branch coverage, error/edge cases, and an
   immutability check if it returns a transformed object.
3. Write to `src/__tests__/<Service>.test.js` matching the style above.
4. Run the narrowest scope first: `NODE_OPTIONS=--experimental-vm-modules npx jest <Service>`
   before the full suite, and report results.
