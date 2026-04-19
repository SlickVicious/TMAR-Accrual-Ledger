# Project Overview

- Purpose: [1–3 line description of what this repo does].
- Main components:
  - API: [path + 1-line summary]
  - Frontend/UI: [path + 1-line summary]
  - Jobs/Workers: [path + 1-line summary]
- Tech stack: [languages, frameworks, dbs, infra].

# How To Work In This Repo

- Always ask which file(s) to edit; do not scan the whole repo.
- Prefer **small, targeted edits** over large refactors.
- When unsure, propose a minimal change plan before editing.

# File & Context Usage (Token Minimization)

- Only open files that are explicitly mentioned in the request or obviously required (e.g., matching router/controller/view).
- When inspecting dependencies, open **one level at a time**, not entire trees.
- If a task feels broad, ask the user to narrow scope (file, function, endpoint, or module).

# Code Style & Quality

- Match surrounding code for formatting, imports, and patterns.
- Preserve existing public APIs unless the user explicitly allows breaking changes.
- Always keep or improve test coverage when editing core logic.

# Testing

- Default commands:
  - Unit tests: `[your command]`
  - Integration tests: `[your command]`
- Only modify tests that clearly conflict with new behavior; never delete tests to “make green” without explanation.

# Output Rules (Token-Efficient)

- Default: concise.
- For code changes:
  - Provide a short summary bullet list.
  - Show only the **smallest relevant diff or snippet**.
  - Avoid repeating large unchanged blocks.
- For explanations:
  - Use bullet lists.
  - Avoid restating the prompt or obvious context.
- If user asks for a “full file”, confirm they understand the token cost first.

# Extended Documentation Index

- Testing conventions: `@docs/testing-conventions.md` (only load when discussing tests).
- API patterns: `@docs/api-patterns.md` (use for new endpoints or major refactors).
- Data models: `@docs/domain-models.md` (use when changing persistence/domain logic).
- Deployment & env: `@docs/deployment.md` (only if user request mentions deploy, CI, or infra).

# Skills & Tools (If Available)

- Use Skills and MCP tools **only when clearly needed** and always request the smallest useful scope.
- Prefer file-specific tools (e.g., “read single file”, “search symbol”) over repo-wide tools.
