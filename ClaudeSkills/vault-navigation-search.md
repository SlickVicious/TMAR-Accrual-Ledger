---
name: vault-navigation-search
description: >-
  Use this skill when the user needs to find, navigate, search, or discover
  content within the LDG Obsidian vault. Triggers include: find in vault,
  search vault, where is, connection hub, vault search, dataview query,
  knowledge graph, linked notes, backlinks, graph view, navigate to, vault
  index, folder note, cross-reference, related documents, or any question
  about WHERE something is in the vault, HOW to find specific content, or
  requests to build custom Dataview queries. Also triggers when the user asks
  about the Connection Hub system, wants to understand vault structure, needs
  to trace relationships between documents, or wants to build search and
  navigation infrastructure.
type: claude-skill
Category: ClaudeSkills
subcategory: Navigation-Search
skill_title: Vault Navigation and Search Orchestration
priority: medium
platform: multi-platform
status: production
version: "1.0.0"
Date-Added: "[[2026-02-26]]"
tags:
  - "#My/SysAdmin"
  - "#Claude/Skill"
  - "#AI/Automation"
  - "#Navigation-Search"
aliases:
  - Vault Navigation and Search Orchestration
---

# Vault Navigation & Search Orchestration

## Overview

Navigation, search, and discovery system for the LDG vault. Leverages the 94-node Connection Hub network, Dataview queries, Obsidian search operators, and the vault graph structure to find and cross-reference content across legal documents, course material, templates, and financial records.

## Quick Navigation Map

| Need | Go To | Method |
|------|-------|--------|
| Find any document | Cmd+O quick switcher | Type partial name |
| Browse folder contents | Any Connection Hub note | Open folder note |
| Legal document by type | `Digital File Cabinet/MASTER_DOCUMENT_INDEX.md` | Dataview tables |
| Course by educator | `YTubiversity/[Educator]/[Educator].md` | Connection Hub |
| Template by category | `06 Toolkit/Templates/Templates.md` | Connection Hub |
| Financial records | `Digital File Cabinet/Financials/` | Direct navigate |
| Legal definitions | `Definitions, Legalise.../Vault Dictionary.md` | Reference |
| Process/procedure | `Digital File Cabinet/Purposes Processes & Procedures/` | How-to guides |
| Recent files | Recent Files plugin sidebar | Click sidebar icon |

## Connection Hub System

94 auto-generated folder index notes across the vault. Each provides Dataview file listings, type breakdowns, and subfolder navigation.

### Managing Hubs

- Regenerate all: `/connection-hub all`
- Check coverage: `/connection-hub status`
- Regenerate one: `/connection-hub "path/to/folder"`
- Template: `06 Toolkit/Templates/SysAdmin/Connection-Hub-Template.md`

## Search Techniques

### Obsidian Native Search (Cmd+Shift+F)

| Operator | Example | Finds |
|----------|---------|-------|
| file: | `file:trust` | Files with trust in name |
| path: | `path:Generated-Documents` | Files in that path |
| tag: | `tag:legal-document` | Files with that tag |
| content: | `content:"North Carolina"` | Files containing that text |
| section: | `section:## Parties` | Content under that heading |
| line: | `line:(1099 AND filed)` | Lines with both terms |
| - | `trust -template` | Trust docs excluding templates |

### Dataview Queries

All legal documents by category:

```dataview
TABLE
  category as "Category",
  subcategory as "Type",
  status as "Status",
  jurisdiction as "Jurisdiction"
FROM "Digital File Cabinet"
WHERE type = "legal_document"
GROUP BY category
SORT category ASC
```

Cross-vault topic search (example for 1099s):

```dataview
LIST
FROM ""
WHERE contains(file.name, "1099") OR contains(tags, "1099")
SORT file.folder ASC
```

Documents missing required frontmatter:

```dataview
TABLE file.folder as "Location"
FROM "Digital File Cabinet/Generated-Documents"
WHERE !category OR !status
SORT file.name ASC
```

Files by date range:

```dataview
TABLE file.folder as "Location", file.mtime as "Modified"
FROM ""
WHERE file.mtime >= date("2026-02-01") AND file.mtime <= date("2026-02-28")
  AND file.ext = "md"
SORT file.mtime DESC
```

### Slash Commands

| Command | Purpose |
|---------|---------|
| `/vault-search [query] [category]` | Search by category |
| `/vault-status` | Quick dashboard |
| `/connection-hub [path]` | Refresh folder index |
| `/fetch-reference [type] [id]` | Fetch IRS forms, UCC articles |

## Navigation Troubleshooting

### Cannot find a file

1. Try quick switcher (Cmd+O) with partial name
2. Try global search (Cmd+Shift+F) with key terms
3. Check Connection Hub for the likely parent folder
4. Check `00 NoteLab/` as files may have landed in inbox
5. Check `.trash/` for accidental deletion
6. Check `Sandbox/` for scratch area
7. Run Dataview query for frontmatter properties

### Search returns too many results

Narrow with operators: `path:specific/folder content:"exact phrase" tag:specific-tag`

### Dataview query returns nothing

Common causes: frontmatter field names are case-sensitive, strings need quotes if they contain spaces, FROM paths are relative to vault root with no leading slash, Obsidian does not index non-markdown files for Dataview.

---

### When to use?

Find in vault, search, connection hub, dataview query, where is, navigate to, cross-reference, graph view, folder note.

```meta-bind-button
label: "⬅️ Claude Skills Directory"
icon: ""
hidden: true
class: ""
tooltip: ""
id: "claudeskills"
style: default
actions:
  - type: open
    link: "[[ClaudeSkills]]"

```
