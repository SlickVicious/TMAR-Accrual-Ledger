---
name: vault-health-maintenance
description: >-
  Use this skill for ANY Obsidian vault health, cleanup, maintenance, or audit
  task in the Legal Document Generator vault. Triggers include: vault health,
  clean up vault, find orphans, duplicate files, broken links, plugin audit,
  vault audit, stale files, vault maintenance, security check, fix vault,
  vault status, or any mention of vault organization problems. Also triggers
  for checking plugin utilization, finding unused templates, identifying
  fragmented content, rotating API keys, or optimizing vault performance.
type: claude-skill
Category: ClaudeSkills
subcategory: Vault-Management
skill_title: Vault Health and Maintenance
priority: critical
platform: multi-platform
status: production
version: "1.0.0"
Date-Added: "[[2026-02-26]]"
tags:
  - "#My/SysAdmin"
  - "#Claude/Skill"
  - "#AI/Automation"
  - "#Vault-Management"
aliases:
  - Vault Health and Maintenance
---

# Vault Health & Maintenance

## Overview

Comprehensive health monitoring, cleanup, and maintenance system for the Legal Document Generator (LDG) Obsidian vault at `/Users/animatedastronaut/Documents/Legal Document Generator`. This vault contains ~2,600 files across legal documents, course content, templates, and development tools.

## Quick Reference

| Task | Approach |
|------|----------|
| Full health audit | Run the Health Scan Protocol below |
| Find orphaned files | Dataview query for unlinked files |
| Check plugin status | Compare `community-plugins.json` vs `/plugins/` dirs |
| Find broken links | Use Obsidian's built-in broken links report |
| Security scan | Check for exposed API keys in plugin configs |
| Template dedup | Cross-reference 4 template locations |
| Stale content check | Find files not modified in 90+ days |

## Vault Architecture

```
Root Vault: /Users/animatedastronaut/Documents/Legal Document Generator
├── 00 NoteLab/              — Inbox (new files land here)
├── 01 Claude/               — Claude agent configuration
├── 06 Toolkit/              — Templates, scripts, dev tools, images
│   ├── Templates/           — PRIMARY template location (Templater target)
│   ├── Dev/MacWhisPro/      — Integration Hub sub-agents
│   ├── Scripts/             — GAS, Python, PowerShell scripts
│   └── Images/              — Attachment storage
├── Digital File Cabinet/    — Primary document repository
│   ├── Generated-Documents/ — Template output (11 categories)
│   ├── Master Binder System/— 7-section legal filing
│   ├── Financials/          — Master Account Register
│   └── Gov Forms Links/     — IRS forms, Express Trust Templates
├── Definitions, Legalise.../— Legal reference & definitions
├── YTubiversity/            — Course content (6 educators)
├── Sandbox/                 — Scratch/experimental notes
├── Clippings/               — Web clipper captures
├── Excalidraw/              — Visual diagrams
└── copilot/                 — AI conversations & custom prompts
```

## Health Scan Protocol

### Phase 1: Security Scan (ALWAYS RUN FIRST)

Check for exposed secrets in plugin configs:

```bash
grep -r "sk-ant-\|sk-svcacct-\|AIzaSy\|sk-proj-\|ghp_\|gho_" \
  "/Users/animatedastronaut/Documents/Legal Document Generator/.obsidian/" \
  --include="*.json" -l
```

**Known issue**: `.obsidian/plugins/copilot/data.json` contains plaintext API keys for OpenAI, Anthropic, and Google. These MUST be rotated and moved to environment variables.

### Phase 2: Plugin Health Check

Compare installed vs registered plugins:

```bash
VAULT="/Users/animatedastronaut/Documents/Legal Document Generator"
ls -1 "$VAULT/.obsidian/plugins/" | sort > /tmp/installed_plugins.txt
cat "$VAULT/.obsidian/community-plugins.json" | python3 -c "
import json, sys
for p in json.load(sys.stdin): print(p)
" | sort > /tmp/registered_plugins.txt
echo "=== ORPHANED PLUGINS ==="
comm -23 /tmp/installed_plugins.txt /tmp/registered_plugins.txt
echo "=== GHOST REGISTRATIONS ==="
comm -13 /tmp/installed_plugins.txt /tmp/registered_plugins.txt
```

### Phase 3: Template Fragmentation Audit

Templates exist across 4+ locations. Audit all:

```bash
VAULT="/Users/animatedastronaut/Documents/Legal Document Generator"
echo "=== PRIMARY (Templater target) ==="
find "$VAULT/06 Toolkit/Templates" -name "*.md" -type f | wc -l
echo "=== Root templates/ ==="
find "$VAULT/templates" -name "*.md" -type f 2>/dev/null | wc -l
echo "=== Express Trust Templates ==="
find "$VAULT/Digital File Cabinet/Gov Forms Links" -name "*Template*" -type f | wc -l
echo "=== Backups in .obsidian ==="
find "$VAULT/.obsidian" -path "*template-backup*" -name "*.md" -type f 2>/dev/null | wc -l
```

### Phase 4: Orphan Detection

```dataview
TABLE file.size as "Size", file.mtime as "Last Modified"
FROM ""
WHERE length(file.inlinks) = 0
  AND !contains(file.path, ".obsidian")
  AND !contains(file.path, "copilot")
  AND !contains(file.name, "Connection Hub")
  AND file.ext = "md"
SORT file.mtime ASC
LIMIT 30
```

### Phase 5: Stale Content Detection

```dataview
TABLE file.mtime as "Last Modified", file.folder as "Location"
FROM ""
WHERE file.ext = "md"
  AND (date(today) - file.mtime).days > 90
  AND !contains(file.path, ".obsidian")
  AND !contains(file.path, "copilot")
SORT file.mtime ASC
LIMIT 25
```

## Scoring Rubric

| Category | Weight | Check |
|----------|--------|-------|
| Security | 25% | No exposed API keys, encryption enabled |
| Plugin Health | 15% | No orphans, all plugins functional |
| Template Integrity | 15% | Single source of truth, no duplicates |
| Link Health | 15% | Less than 5% broken links |
| Content Freshness | 10% | Less than 10% files stale over 90 days |
| Organization | 10% | Files in correct directories, inbox clear |
| AI Integration | 10% | Copilot indexed, QuickAdd configured |

## Maintenance Schedules

### Weekly
- Check for new orphaned files in `00 NoteLab/`
- Review `.trash/` and permanently delete if over 2 weeks old
- Verify Connection Hub coverage via `/connection-hub status`

### Monthly
- Full plugin health check (Phase 2)
- Template fragmentation audit (Phase 3)
- Stale content review (Phase 5)
- Copilot index rebuild

### Quarterly
- Security scan (Phase 1)
- Full orphan detection (Phase 4)
- Plugin evaluation and removal of unused plugins
- Backup `.obsidian/` before any plugin updates

---

### When to use?

Vault health, cleanup, orphans, duplicates, security, plugin audit, stale files, broken links, maintenance.

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
