---
name: vault-sync
description: Review and auto-commit routine Obsidian-vault housekeeping churn in the TMAR-Accrual-Ledger repo (Hermes Console context timestamps, tracked .obsidian/*.json config drift, YAML frontmatter repairs, line-ending-only diffs) — then push. Use when the user asks to sync/reconcile source control changes that keep reappearing after a recent commit, or mentions the source control panel showing changes despite having just committed and pushed. Never auto-commits application code (TMAR-Accrual-Ledger.html, gas/*.gs, src/**) or anything unfamiliar — those get reported for manual review instead.
---

# Vault Sync

This repo is also an Obsidian vault (Hermes Console terminal, various plugins), so `git status`
picks up small, routine, low-risk changes on its own even minutes after a clean push — a
terminal open bumps a timestamp in `.obsidian/hermes/context.json`, a linter plugin fixes a
malformed YAML date, a checkout normalizes line endings. None of that is "real" work, but it
still needs a human decision about whether to commit it. This skill makes that decision safely
and repeatably, the same way it's been done by hand throughout earlier sessions on this repo.

The operating principle: **classify before staging, and when a diff doesn't look like what its
filename would predict, treat it as unfamiliar rather than force-fitting it into a safe bucket.**
A file being on the "usually safe" list is a starting hypothesis, not a guarantee — the whole
point of reading the diff is to catch the one time housekeeping churn rides in alongside
something that isn't.

## Process

### 1. See what's actually dirty

```bash
git status --short
```

Always run this fresh — don't rely on anything reported earlier in the conversation, since
Hermes/Obsidian/linters can touch files at any time.

If it's clean, say so and stop. Nothing to do.

### 2. Classify every changed or untracked file

For each one, read its actual diff — `git diff <file>` for tracked changes, or open untracked
files directly — and sort into one of two buckets:

**SAFE-AUTO** — commit without asking, if and only if the diff matches the expected shape:

- `.obsidian/hermes/context.json` — only `updatedAt`, `updateTimestamp`, `submitSequence` (and
  similar session bookkeeping fields) changed. Hermes Console rewrites this on every terminal
  open; it's inert config, never worth a second look once the field names check out.
- `.hermes/vault-context.md`, or any of the other tracked `.obsidian/*.json` files (`app.json`,
  `appearance.json`, `community-plugins.json`, `core-plugins.json`,
  `core-plugins-migration.json`, `homepage.json`) — safe when the diff is confined to
  settings/plugin-list/theme values consistent with normal Obsidian use. Not safe if a large,
  unrelated rewrite rides along, or if a diff introduces something that looks like a path,
  token, or credential rather than a UI preference.
- YAML frontmatter repairs in `*.md` files — e.g. a wikilinked date `"[[2026-02-26]]"` turned
  into a plain string `"2026-02-26"`, or a smashed line like `status: superseded_by: "..."`
  split into separate `status:` / `superseded_by:` keys. Safe when the change is confined to
  the frontmatter block (or an isolated structural fix like an inline `[[wikilink]]` used where
  a heading was needed) — not safe if body content was deleted or rewritten alongside it.
- Line-ending-only changes — `git status` reports the file modified, but `git diff <file>`
  produces zero lines of output. This is CRLF/LF normalization noise from a checkout, not a
  real content change, and is always safe.

**NEEDS REVIEW** — do not stage or commit, no matter how small:

- Any application code: `TMAR-Accrual-Ledger.html`, anything under `gas/`, `src/`, `scripts/`.
- Any file whose diff doesn't match what its filename/pattern would predict (a "safe" JSON
  config with an unexpected structural change, a frontmatter fix that also touched prose).
- Deletions, renames, or new files that aren't one of the patterns above.
- Anything whose name or content looks credential/secret-shaped (keys, tokens, `.env`-like
  content) — flag it explicitly rather than silently skipping it, since that's worth the user's
  attention regardless of whether it ends up committed.
- Anything you're genuinely unsure about. There's no penalty for under-committing here; the
  next `/vault-sync` run will pick it up once it's been looked at.

### 3. Commit the SAFE-AUTO set

Stage every SAFE-AUTO file **by explicit name** — never `git add -A` or `git add .`, even
though everything in this bucket has already been reviewed. Group into one commit (or a couple,
if the changes are conceptually distinct — e.g. a Hermes timestamp bump and a batch of
frontmatter fixes are different enough to warrant separate commits) with a message that
describes what actually changed, not just "sync." Then push:

```bash
git push origin master
```

### 4. Report

Tell the user plainly:
- What got committed and pushed (file list + one-line description per commit).
- What's sitting in NEEDS REVIEW, if anything, with a short reason per file — enough that they
  can decide whether to look now or leave it for later. Don't stage these, don't ask "should I
  commit these too?" as a yes/no gate that blocks finishing the run — just report and stop,
  the same way you would for any other file that needs a human look.

### GAS changes are out of scope here

If a SAFE-AUTO commit somehow includes anything that would need `clasp push` (it shouldn't —
`gas/*.gs` files are never SAFE-AUTO), or if NEEDS REVIEW turns up GAS changes, mention that
`/tmar-deploy` is the right tool for that and don't duplicate its logic here. This skill's job
is exclusively the vault-housekeeping git sync.
