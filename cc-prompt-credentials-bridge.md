# Claude Code Prompt — Credentials Bridge

## Context
I need to create a centralized credentials directory at `C:\Users\rhyme\Desktop\FileCabinet\Credentials\` that serves as the local source-of-truth reference file for the credentials data currently stored in the Google Sheet `1k6J2s0xV5x8K5C6SyjGMNdIwVrUGbiKgPT97rwlWInQ`.

The GAS Web App at `https://script.google.com/macros/s/AKfycbzpeegvE52lvqCTMyKrsdaa_4JFfjM6MQrsJkU8zb17fkUJzPRasUU0fjONdaHkM5dh/exec` already has doGet/doPost but does NOT expose the "Website Accounts" tab via a GET action.

## What I Need You To Do

### 1. Identify the credentials sheet tab
- Open the workbook and find which tab holds login credentials (likely "Website Accounts" or "Passwords")
- Screenshot reference: `screenshot-passwords.png` in the repo root
- Confirm the column structure (Platform, Username, URL, Notes, etc.)

### 2. Add a GET endpoint to SyncCenter.gs
- Add `?action=pullWebsiteAccounts` (or `pullCredentials`) to the doGet dispatcher
- It should read the sheet and return all rows as JSON — **exclude the password column** if it exists
- Follow the existing pattern: `pullAccounts` (lines 702+) reads sheet → maps headers → returns JSON
- Add CORS headers (already in the existing pattern)
- Include the action in the docblock at lines 434-445

### 3. Handle the password column
- If passwords are stored in the sheet: the GET endpoint should **exclude** that column (the comment at line 2102 says "Does NOT write passwords" — so they may already be excluded from the API flow)
- If there's a separate "Passwords" tab that's never synced: confirm its structure and decide whether to create a companion local-only file for passwords
- The local `Credentials/` directory should have a **master-reference.md** with everything EXCEPT passwords, and optionally a gitignored `_passwords.md` for local-only sensitive data

### 4. Create the sync script
- Create `scripts/sync-credentials.mjs` in the TMAR-Accrual-Ledger repo
- It should:
  - Call the GAS Web App with `?action=pullWebsiteAccounts`
  - Parse the JSON response
  - Write `C:\Users\rhyme\Desktop\FileCabinet\Credentials\master-reference.md` as a clean markdown table
  - Optionally write a CSV alongside it
- Use Node.js (no external deps beyond what's already in package.json)

### 5. Deploy the GAS changes
- `clasp push` to push the updated SyncCenter.gs
- If doGet/doPost changed: redeploy the Web App in the Apps Script editor (manual step — tell me the new deployment URL if it changes)

### 6. Verify end-to-end
- Test: `node scripts/sync-credentials.mjs` produces a valid markdown file
- Confirm the file lands at `C:\Users\rhyme\Desktop\FileCabinet\Credentials\master-reference.md`
- Show me the first 10 lines of the output so I can verify the format

## Constraints
- **Never expose passwords in GET responses** — follow the existing `pushWebsiteAccounts_` pattern that strips them
- The sync script should be callable from WSL (`node /mnt/c/Users/rhyme/Documents/TMAR-Accrual-Ledger/scripts/sync-credentials.mjs`)
- FileCabinet `Credentials/` should be a clean, well-organized directory — one master reference file, not 30 per-account files
- If the "Website Accounts" tab doesn't have all the fields needed, tell me what's missing before adding endpoints

## Repo Map (from CLAUDE.md)
```
TMAR-Accrual-Ledger/
  gas/SyncCenter.gs       ← doGet/doPost live here (edit this)
  gas/Code.gs             ← onOpen menu + TMAR_CONFIG (read-only ref)
  scripts/                ← create sync-credentials.mjs here
  .clasp.json             ← GAS project config
```
