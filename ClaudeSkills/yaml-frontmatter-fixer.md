---
name: yaml-frontmatter-fixer
description: >-
  Use this skill when YAML frontmatter is broken, not rendering as Properties
  in Obsidian, or when the user pastes clipboard content into a new note and
  the metadata appears as raw text instead of the Properties panel. Triggers
  include: YAML broken, frontmatter not rendering, Properties not showing,
  fix frontmatter, fix YAML, paste broke my note, metadata as plain text,
  properties panel missing, horizontal rule instead of frontmatter, dashes
  not working, fix properties, broken properties, YAML syntax error, scan
  vault for broken YAML, batch fix frontmatter, sidebar paste broke YAML,
  description collapsed, fields on one line, heading in frontmatter, or any
  mention of pasting content and the note header appearing wrong. Also
  triggers when the user reports that the --- delimiter renders as a
  horizontal line instead of opening the Properties panel.
type: claude-skill
Category: ClaudeSkills
subcategory: Vault-Management
skill_title: YAML Frontmatter Auto-Fixer
priority: critical
platform: multi-platform
status: production
version: "2.0.0"
Date-Added: "[[2026-03-06]]"
tags:
  - "#My/SysAdmin"
  - "#Claude/Skill"
  - "#AI/Automation"
  - "#Vault-Management"
  - "#YAML"
aliases:
  - YAML Frontmatter Auto-Fixer
  - Fix YAML Properties
---

# YAML Frontmatter Auto-Fixer

## Overview

Detects and repairs broken YAML frontmatter in Obsidian markdown files. Handles two classes of failure: structural delimiter issues (BOM, blank lines, missing `---`) and sidebar copy-paste deformation (heading prefixes, collapsed fields, inline arrays).

## The Two Failure Modes

### Mode A — Structural (delimiter/encoding)

The `---` frontmatter block is malformed at the byte level. Obsidian refuses to parse it as Properties and renders `---` as a horizontal rule.

| # | Issue | Cause | Symptom |
|---|-------|-------|---------|
| 1 | BOM character | Windows clipboard, cross-platform copy | Invisible `U+FEFF` at byte 0 |
| 2 | Leading blank line | Paste adds newline before `---` | `---` on line 2 instead of line 1 |
| 3 | Missing `---` openers | Content pasted without delimiters | Bare `key: value` lines at top |
| 4 | Blank lines in block | Empty lines between fields | Parser stops at first blank |
| 5 | Tab characters | Editors that insert tabs | YAML spec requires spaces only |
| 6 | Trailing space on `---` | Copy artifact | `--- ` instead of `---` |
| 7 | CRLF line endings | Windows files on Mac | `\r\n` mixed with `\n` |
| 8 | Missing closing `---` | Truncated paste | Frontmatter never terminates |

### Mode B — Sidebar Copy-Paste Deformation (NEW in v2)

Content copied from Obsidian's sidebar or Properties panel and pasted into a new note. The YAML structure gets mangled into markdown body text.

| # | Issue | What Happens | Example |
|---|-------|-------------|---------|
| 9 | Heading prefix | `## ` prepended to first field | `## name: my-skill` |
| 10 | Concatenated fields | Multiple fields collapse to one line | `name: foo type: bar status: draft` |
| 11 | Long description inline | Block scalar collapses to quoted string | `description: "Use this skill..."` (200+ chars) |
| 12 | Collapsed tag array | YAML list items smashed to one line | `tags: - "#tag1" - "#tag2" - "#tag3"` |
| 13 | Collapsed aliases | Same as tags but for aliases | `aliases: - Name One - Name Two` |

## Quick Fix — Single Note

### Templater Command

Open any note, run Templater: Insert Template, and use:

```
<% tp.user.fixYaml(tp) %>
```

Or bind to hotkey (recommended: `Ctrl+Shift+Y`) via Templater settings for one-keystroke fixing.

**Location:** `06 Toolkit/Scripts/TemplaterUserScripts/fixYaml.js`

### What It Does (in order)

1. Strips BOM character from byte 0
2. Removes leading whitespace/blank lines before `---`
3. Strips `##` heading prefixes from inside frontmatter
4. Splits concatenated fields back to separate lines (uses known LDG vault key list)
5. Converts long inline `description: "..."` to `>-` block scalar with word-wrap at 76 chars
6. Adds missing opening `---` if bare YAML fields detected
7. Removes blank lines inside the frontmatter block
8. Converts tabs to spaces
9. Strips trailing whitespace on `---` delimiters
10. Normalizes CRLF to LF
11. Wraps bare comma-separated tags in `[]` brackets
12. Expands collapsed inline tag/alias arrays to proper YAML lists
13. Adds missing closing `---` if absent

**Output:** Returns a numbered summary of fixes applied. Shows an Obsidian Notice popup with count.

### Known YAML Keys for Field Splitting

The field splitter recognizes these keys (used in the LDG vault):

`name`, `description`, `type`, `Category`, `subcategory`, `skill_title`, `priority`, `platform`, `status`, `version`, `Date-Added`, `tags`, `aliases`, `date_created`, `date_modified`, `date_watched`, `educator`, `title`, `url`, `duration`, `key_topics`, `category`, `jurisdiction`, `parties`, `execution_date`, `filing_date`, `binder_section`, `notarized`, `author`, `source`, `cssclass`, `publish`, `permalink`

To add more keys: edit `fixYaml.js` line with the `KNOWN_KEYS` array.

## Batch Fix — Folder or Vault

### Templater Command

```
<% tp.user.fixYamlBatch(tp) %>
```

Shows interactive picker for scope and mode.

### Direct Calls

```
<% tp.user.fixYamlBatch(tp, "YTubiversity") %>          — Dry run on folder
<% tp.user.fixYamlBatch(tp, "YTubiversity", false) %>    — Fix folder
<% tp.user.fixYamlBatch(tp, "", false) %>                — Fix entire vault
```

**Location:** `06 Toolkit/Scripts/TemplaterUserScripts/fixYamlBatch.js`

### Pre-Configured Scan Targets

The interactive picker offers: Entire Vault, YTubiversity, Generated-Documents, Dev Sessions, ClaudeSkills, Templates, Clippings, NoteLab

### Batch Output

Generates a markdown report with wikilinks to every affected file:

```markdown
# YAML Frontmatter Scan Report

**Scope:** ClaudeSkills
**Files scanned:** 10
**Issues found:** 2 files
**Mode:** Applied fixes
**Files fixed:** 2

---

## Files with Issues

### [[path/to/file]]
- Markdown heading prefix (##) inside frontmatter
- Concatenated fields on single line (sidebar paste pattern)
- Long inline description (should be >- block scalar)
```

## Agent Repair (Filesystem MCP)

When the user reports broken YAML outside of Obsidian, or when Claude is operating via filesystem MCP tools:

### Step 1: Read the first 30 lines

```
filesystem:read_text_file path="[vault path]/[file].md" head=30
```

### Step 2: Diagnose

Check for these patterns:
- Line 1 is blank or whitespace → Mode A, Fix 2
- `## ` prefix on any line inside `---` block → Mode B, Fix 3
- Two or more `key:` patterns on the same line → Mode B, Fix 4
- `description: "` followed by 80+ chars on one line → Mode B, Fix 5
- `tags: - "` on a single line → Mode B, Fix 6

### Step 3: Reconstruct and Write

Build corrected YAML manually and write via `filesystem:write_file`:

```yaml
---
name: skill-name
description: >-
  Long description text here wrapped at 76 characters per line using the
  folded block scalar syntax which prevents future paste corruption.
type: claude-skill
tags:
  - "#tag1"
  - "#tag2"
aliases:
  - Alias One
---
```

Key rules for the reconstruction:
- `description` values over 80 chars MUST use `>-` block scalar with 2-space indent
- Tags MUST be YAML list format (one `- "value"` per line) not inline
- Aliases MUST be YAML list format
- No blank lines between fields
- No `## ` prefixes
- `---` must be the absolute first three characters of the file (byte 0, 1, 2)

### Step 4: Verify

Re-read head=5 and confirm line 1 is exactly `---` followed by a valid YAML key on line 2.

## Prevention

### Why Sidebar Paste Breaks YAML

When you view a file in Obsidian's Properties panel (sidebar), the panel renders YAML fields as styled UI elements. Copying this rendered output and pasting into a new note produces the UI text representation, not the raw YAML source. The rendered output:
- Prepends `## ` to field names (Properties panel uses heading styling)
- Collapses multi-line values to single strings
- Flattens YAML arrays to inline sequences
- Strips block scalar indicators (`>-`, `|`)

### Prevention Strategies

1. **Copy from Source Mode** — Toggle to Source Mode (Ctrl/Cmd+E) before copying. This gives you raw YAML.
2. **Use Templater** — Create notes from templates instead of pasting. Templates generate clean YAML.
3. **Bind fixYaml to hotkey** — Run `Ctrl+Shift+Y` immediately after any paste. Takes under 1 second.
4. **Always use `>-` for description** — The folded block scalar is paste-resistant. Inline quoted strings are fragile.
5. **Write files via filesystem tools** — When Claude writes files via `filesystem:write_file`, the output is byte-exact with no UI deformation.

## Integration Points

| System | How |
|--------|-----|
| Templater | `fixYaml.js` and `fixYamlBatch.js` in `TemplaterUserScripts/` |
| Hotkeys | Bind `Templater: fixYaml` to `Ctrl+Shift+Y` |
| QuickAdd | Wire as macro for toolbar button |
| Claude Agent | Filesystem MCP direct repair (see Agent Repair section) |
| Obsidian Startup | Can be wired into Templater's `startup_templates` for auto-scan on vault open |

## Troubleshooting

### Properties still don't show after fix

Close and reopen the note. Obsidian caches the initial parse. Toggle Source Mode (Ctrl/Cmd+E) twice to force re-parse.

### Fix ran but description looks wrong

If `description` contains colons, the `>-` block scalar handles them correctly. But if the value starts with `{`, `[`, `*`, `&`, or `!` you need to quote it. The fixer handles the common case (long text strings) but exotic YAML characters may need manual quoting.

### Batch scan shows 0 issues but a file is visibly broken

The scanner checks for known structural patterns. If the YAML parses technically correctly but Obsidian still won't render Properties, check for:
- Unicode zero-width characters (invisible in editors)
- Non-breaking spaces (U+00A0) instead of regular spaces
- A second `---` line inside the body content creating a false boundary

Run in Source Mode and look character-by-character at the first 3 bytes of the file.

---

### When to use?

YAML broken, frontmatter not rendering, Properties not showing, paste broke note, fix YAML, sidebar paste, collapsed fields, heading in frontmatter, scan vault YAML, batch fix.

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
