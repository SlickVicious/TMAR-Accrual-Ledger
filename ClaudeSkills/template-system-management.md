---
name: template-system-management
description: >-
  Use this skill when the user needs to create, modify, consolidate, or
  troubleshoot templates in the LDG Obsidian vault. Triggers include: create
  template, new template, fix template, template not working, Templater,
  folder template, auto template, frontmatter template, YAML template,
  QuickAdd, template mapping, template consolidation, duplicate templates,
  or any mention of template organization, Templater configuration,
  folder-to-template bindings, or automating note creation with pre-filled
  content. Also triggers when the user reports new files not getting the right
  template, templates appearing in wrong locations, or wanting to add a new
  folder-to-template mapping.
type: claude-skill
Category: ClaudeSkills
subcategory: Template-System
skill_title: Template System Management
priority: medium
platform: multi-platform
status: production
version: "1.0.0"
Date-Added: "[[2026-02-26]]"
tags:
  - "#My/SysAdmin"
  - "#Claude/Skill"
  - "#AI/Automation"
  - "#Template-System"
aliases:
  - Template System Management
---

# Template System Consolidation & Management

## Overview

Manages the Templater-based template system in the LDG vault, including template creation, folder-to-template mappings, frontmatter schemas, user script functions, and consolidation of the template landscape.

## Current Template Architecture

### Primary Location (Templater Target)

Path: `06 Toolkit/Templates/`
Configured in: `.obsidian/plugins/templater-obsidian/data.json`

Key subdirectories: clipper, estate, GAS, LDG templates, legal_notices, MCP, Properties, SysAdmin (15+ templates), trust structures, trusts, TxtG_Templates, Claude

### Active Folder-Template Mappings

| Folder | Template | Purpose |
|--------|----------|---------|
| `YTubiversity/` | `clipper/WC-Template-Video-Lesson.md` | Video lesson notes |
| `Generated-Documents/` | `Properties/yamlTemplate.md` | Generic YAML frontmatter |
| `Generated-Documents/Trusts/` | `trust structures/private_family.md` | Trust documents |
| `06 Toolkit/` | `Properties/yamlTemplate.md` | Toolkit items |
| `ClaudeSkills/` | `SysAdmin/SysAdmin Claude Skill Template.md` | Claude skills |

Templater has `trigger_on_file_creation: true` so these apply automatically.

### User Script Functions

Location: `06 Toolkit/Scripts/TemplaterUserScripts/`

| Function | Purpose | Example |
|----------|---------|---------|
| `tp.user.genDocId(tp, "TRUST")` | Unique document IDs | LDG-TRUST-20260226-001 |
| `tp.user.binderSection(tp, "tax")` | Master Binder section lookup | 04-Tax-Forms |
| `tp.user.vaultStats(tp)` | Full vault metrics table | Markdown stats table |
| `tp.user.skillIndex(tp)` | Claude skills registry | Auto-generated skill table |
| `tp.user.findRelated(tp, "tag", "trust")` | Find files by tag/type/folder | Related file list |
| `tp.user.autoTag(tp, "trust EIN")` | Suggest tags from path and keywords | YAML tag array |
| `tp.user.statusBadge(tp, "executed")` | Visual status indicator | Emoji plus label |
| `tp.user.quickNav(tp)` | Breadcrumbs and sibling links | Navigation block |

## Creating New Templates

### Templater Syntax Reference

| Syntax | Output |
|--------|--------|
| `<% tp.date.now("YYYY-MM-DD") %>` | Current date |
| `<% tp.file.title %>` | File name without .md |
| `<% tp.file.folder() %>` | Parent folder name |
| `<% tp.system.prompt("Label") %>` | User input prompt |
| `<% tp.system.prompt("Label", "Default") %>` | Prompt with default |
| `<% tp.system.suggester(["A","B"], ["A","B"]) %>` | Selection dropdown |
| `<% tp.file.cursor() %>` | Cursor placement after insert |

### Adding a New Folder-Template Mapping

1. Create template in `06 Toolkit/Templates/[category]/`
2. Edit `.obsidian/plugins/templater-obsidian/data.json`
3. Add entry to `folder_templates` array:

```json
{
  "folder": "path/to/target/folder",
  "template": "category/template-name.md"
}
```

4. Restart Obsidian or toggle Templater plugin
5. Test by creating a new file in the target folder

Note: Templater matches the most specific folder path first. A mapping for `Generated-Documents/Trusts/` takes priority over `Generated-Documents/`.

## Template Categories

### Legal Documents
Location: trust structures, estate, legal_notices
Required fields: type, category, subcategory, status, jurisdiction, parties

### Course/Video
Location: clipper
Required fields: type, educator, title, url, status, key_topics

### SysAdmin (15+ templates)
Location: SysAdmin
Covers: Claude, GAS, GCP, HomeLab, LLM, MCP, Obsidian, PowerShell, Python, Prompts, SSDB, StreamDeck, YTV, Connection Hubs

### Claude Skills
Location: SysAdmin/SysAdmin Claude Skill Template.md
Required fields: name, description, type, Category, subcategory, priority, platform, status, version

## Troubleshooting

### Template did not auto-apply

1. Check Templater is enabled in Community Plugins
2. Verify `trigger_on_file_creation: true` in Templater settings
3. Check folder mapping matches the EXACT path (case-sensitive)
4. Longer/more specific paths take priority

### Template variables not filling in

1. Ensure Templater syntax (`<% ... %>`) not core templates (`{{ ... }}`)
2. Check for syntax errors in Templater expressions
3. Template must be in the configured templates folder

### Wrong template applied

Check folder template priority. Templater matches most specific path first.

### User script function not available

1. Verify `user_scripts_folder` is set in Templater config
2. Script must export a function via `module.exports`
3. Restart Obsidian after adding new scripts
4. Check Obsidian developer console for errors (Cmd+Option+I)

---

### When to use?

Create template, Templater, folder mapping, QuickAdd, template not working, frontmatter, user scripts, auto template.

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
