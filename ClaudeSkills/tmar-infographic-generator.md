---
name: tmar-infographic-generator
description: >-
  Use this skill to generate visual infographics, diagrams, and navigational
  guides for the TMAR (Trust Master Account Register) system using the
  Excalidraw MCP connector. Triggers include: TMAR diagram, TMAR infographic,
  GUI diagram, control panel visual, ledger map, tab navigation diagram,
  account flow chart, transaction flow, gap scanner visual, menu tree diagram,
  data architecture diagram, TMAR visual guide, workbook map, tab relationship
  diagram, feature map, or any request to visually explain TMAR navigation,
  features, functions, data flow, or system architecture. Also triggers when
  the user asks for onboarding visuals, training materials, quick reference
  cards, or visual documentation for the TMAR Google Sheets system.
type: claude-skill
Category: ClaudeSkills
subcategory: Integration
skill_title: TMAR Infographic Generator (Excalidraw)
priority: high
platform: claude-ai
status: production
version: "1.0.0"
Date-Added: "[[2026-03-03]]"
tags:
  - "#My/SysAdmin"
  - "#Claude/Skill"
  - "#AI/Automation"
  - "#Integration"
  - "#Excalidraw"
  - "#TMAR"
aliases:
  - TMAR Infographic Generator
  - TMAR Visual Documentation
---

# TMAR Infographic Generator (Excalidraw)

## Overview

Generates professional dark-mode infographics for the TMAR (Trust Master Account Register) system using the Excalidraw MCP connector in Claude.ai. Produces interactive, animated diagrams that document GUI navigation, feature maps, data architecture, menu trees, tab relationships, and workflow sequences for the 13-tab unified workbook and 6-tab Control Panel.

## Quick Reference

| Diagram Type | Camera Size | Use Case |
|-------------|-------------|----------|
| GUI Overview | XL (1200x900) | Full Control Panel layout with all 6 tabs |
| Tab Deep-Dive | L (800x600) | Single tab features and actions |
| Menu Architecture | XL (1200x900) | TMAR Tools menu tree with 7 submenus |
| Navigation Flow | XL (1200x900) | User journey through the system |
| Data Architecture | XL (1200x900) | 3-zone data flow (Sheets → GAS → GUI) |
| Workbook Map | XL (1200x900) | 13-tab Group A / Group B layout |
| Gap Scanner Flow | L (800x600) | Scanner input → processing → report |
| Feature Comparison | L (800x600) | Side-by-side tab capabilities |
| Onboarding Guide | XXL (1600x1200) | Full system walkthrough with camera pans |
| Quick Reference Card | M (600x450) | Single-concept cheat sheet |

## Tool Requirements

This skill requires the **Excalidraw MCP connector** enabled in Claude.ai.

### Activation Check

Before generating, confirm the connector is available:
1. The Excalidraw tools `create_view` and `read_me` must be loaded
2. Call `read_me` once per conversation to load the element format reference
3. Use `create_view` with a JSON elements array to render diagrams

### Tool Workflow

```
1. Call Excalidraw:read_me        → Load element format (once per session)
2. Build JSON elements array      → Compose diagram programmatically
3. Call Excalidraw:create_view    → Render animated diagram
4. Capture checkpointId           → Enable iterative editing
```

## TMAR Design System

### Color Palette (Dark Mode — Mandatory)

All TMAR infographics use dark mode with this background as the FIRST element:

```json
{"type":"rectangle","id":"darkbg","x":-4000,"y":-3000,"width":10000,"height":7500,"backgroundColor":"#1e1e2e","fillStyle":"solid","strokeColor":"transparent","strokeWidth":0}
```

### Zone Colors (Shape Fills on Dark Background)

| Zone | Fill | Stroke | Represents |
|------|------|--------|------------|
| Google Sheets Backend | `#1e3a5f` | `#4a9eed` | Data layer, sheet tabs, raw data |
| Apps Script Engine | `#2d1b69` | `#8b5cf6` | Logic layer, GAS functions, TMARBridge |
| Control Panel GUI | `#1a4d2e` | `#22c55e` | Presentation layer, user-facing HTML |
| Warning/Scanner | `#5c3d1a` | `#f59e0b` | Gap Scanner, alerts, pending items |
| Error/Critical | `#5c1a1a` | `#ef4444` | Errors, closed accounts, overdue items |
| Info/Verification | `#1a4d4d` | `#06b6d4` | API verifiers, SEC/FDIC lookups |

### Text Colors on Dark

| Use | Color | Hex |
|-----|-------|-----|
| Primary text, titles | White | `#e5e5e5` |
| Secondary text, descriptions | Muted gray | `#a0a0a0` |
| Subtle annotations | Dark gray | `#555555` |
| NEVER use | — | Anything darker than `#555555` |

### Typography Rules

| Element | Min fontSize | Recommended |
|---------|-------------|-------------|
| Diagram title | 24 | 26 |
| Section headers | 18 | 20 |
| Box labels (in shapes) | 16 | 16 |
| Descriptions | 14 | 14 |
| Annotations | 14 | 14 |

## TMAR System Architecture Reference

### Control Panel GUI — 6 Tabs

| Tab | Icon | Key Features | Data Source |
|-----|------|-------------|-------------|
| Dashboard | — | Asset/liability/net worth cards, refresh | Master Register aggregates |
| Accounts | — | Add account, filter Active/Closed, group by user | Master Register sheet (35 cols) |
| Transactions | — | Add transaction, monthly view, category grouping, export | Transaction Ledger sheet |
| Reports | — | Financial Summary, Balance by Type, Monthly, Tax | Cross-tab aggregation |
| Search | — | Real-time search, user quick filters, results table | Master Register + Ledger |
| Tools | — | Sync, Export, Populate Dropdowns, Refresh Validation, Disputes, Verify | _Validation + all sheets |

### TMAR Tools Menu — 7 Submenus

| Submenu | Functions | Color Zone |
|---------|-----------|------------|
| Year Settings | Set Active Year, View Current, Reset | Sheets (blue) |
| Data Gap Scanner | Full Scan, Current Tab, View Report, Email | Warning (amber) |
| CPA Questions | Add, View All, Filter Open, Priority, Meeting Prep | Success (green) |
| Import Tools | CSV Transactions, Add Account/Obligation/Subscription | Sheets (blue) |
| Setup & Administration | Refresh Dashboard, Sample Data, Export PDF | Info (cyan) |
| Formatting | Apply All, Tab Colors, Validation, Conditional, Filters, Headers | Error (red) |
| About | Workbook Info, Help & Documentation | Logic (purple) |

### 13-Tab Workbook Structure

**Group A — Living Dashboard (7 tabs)**:
Executive Dashboard, Transaction Ledger, W-2 and Income Detail, BOA Cash Flow, Household Obligations, Subscriptions and Services, Tax Strategy

**Group B — Executive Estate Ledger (6 tabs)**:
Master Register, Trust Ledger, 1099 Filing Chain, Forms and Authority, Proof of Mailing, Document Inventory

### Data Flow Path

```
Google Sheets (13 tabs) → TMARBridge.gs (read/write/format) → Control Panel HTML (6 tabs) → User Browser
                                ↑                                        ↓
                        Gap Scanner                              User interactions
                        API Verifiers (SEC/FDIC)                 (add, edit, search, export)
```

## Diagram Templates

### Template 1: GUI Tab Overview

Use when the user asks to visualize any single Control Panel tab.

Structure:
- Dark background
- Title bar with tab name
- Feature grid (3-column layout of action cards)
- Data source annotation at bottom
- Camera: L (800x600)

Pattern:
```
[cameraUpdate] → [darkbg] → [title] → [tab header bar] →
[feature card 1] → [feature card 2] → [feature card 3] →
[feature card 4] → [feature card 5] → [feature card 6] →
[data source footer] → [final cameraUpdate zoom-out]
```

### Template 2: Menu Tree

Use when the user asks about the TMAR Tools menu system.

Structure:
- Dark background
- Root node: "TMAR Tools"
- 7 child nodes (submenus) with arrows from root
- Sub-items listed as text blocks under each child
- Camera: XL (1200x900) for full tree visibility

### Template 3: Data Architecture (3-Zone)

Use when the user asks about data flow or system architecture.

Structure:
- Dark background
- 3 vertical zones: Sheets (left, blue), GAS (center, purple), GUI (right, green)
- Components placed within zones
- Arrows showing data flow left-to-right
- Camera: XL (1200x900)

### Template 4: Navigation Flowchart

Use when the user asks how to navigate or use the system.

Structure:
- Dark background
- Start node (ellipse): "Open Sheet"
- Decision diamond: "Which action?"
- Two paths: Direct Menu Items (left) vs Control Panel GUI (right)
- Sub-steps under each path
- Loop-back arrows for "return to menu"
- Camera: XL (1200x900) with progressive panning

### Template 5: Workbook Map (13 Tabs)

Use when the user asks about the workbook structure or tab relationships.

Structure:
- Dark background
- Two grouped regions: Group A (blue zone) and Group B (purple zone)
- Tab nodes within each group with inter-tab arrows
- Gap Scanner node with dashed arrows to both groups
- Control Panel node with solid arrows to key tabs
- Camera: XL (1200x900)

### Template 6: Gap Scanner Pipeline

Use when the user asks about data quality scanning.

Structure:
- Dark background
- Input: 13 tab nodes (compact)
- Process: Scanner engine with rule checks
- Output: Gap Report with finding categories
- Action items branching from findings
- Camera: L (800x600)

## Construction Rules

### Element Ordering (Critical for Animation)

Always emit elements in this streaming order:
1. `cameraUpdate` (frame the view FIRST)
2. `darkbg` rectangle
3. Title and subtitle text
4. Zone backgrounds (large translucent rectangles, opacity 25-35)
5. Primary nodes (shapes with labels)
6. Arrows connecting nodes
7. Secondary text (descriptions, annotations)
8. Final `cameraUpdate` (zoom out to show full diagram)

### Camera Strategy

For complex diagrams, use multiple camera positions to guide attention:
1. Start zoomed into title area (M or S camera)
2. Pan to each major section as you draw it
3. End with full zoom-out (XL or XXL camera)

### Shape Standards

| Element | Shape | Min Width | Min Height |
|---------|-------|-----------|------------|
| Tab/feature node | Rectangle (rounded) | 120 | 40 |
| Decision point | Diamond | 120 | 80 |
| Start/end | Ellipse | 140 | 50 |
| Zone background | Rectangle (rounded) | 250 | 300 |
| Status card | Rectangle (rounded) | 200 | 100 |

### Arrow Standards

| Connection Type | strokeWidth | strokeStyle | endArrowhead |
|----------------|-------------|-------------|--------------|
| Primary flow | 2 | solid | arrow |
| Data dependency | 1 | dashed | arrow |
| Bidirectional | 2 | solid | arrow (both start and end) |
| Weak association | 1 | dashed | null |

## Integration Points

### With Other Skills

| Skill | Integration |
|-------|------------|
| `financial-doc-processing` | Reference for 13-tab structure and Gap Scanner details |
| `vault-navigation-search` | Dataview queries to find TMAR docs for diagram content |
| `vault-health-maintenance` | Visual health score cards using Excalidraw |
| `template-system-management` | Diagram Templater user script relationships |

### With Vault Storage

Generated diagrams can be referenced in Obsidian via the Excalidraw plugin if the user saves them. The vault already has an Excalidraw directory at `06 Toolkit/Excalidraw/`.

### With Mermaid Chart

For flowcharts that need to be embedded in markdown notes (not interactive), use the Mermaid Chart MCP connector instead. Excalidraw is preferred for visual documentation, onboarding guides, and presentation-quality infographics.

## Prompt Patterns

### User Says → Generate This

| User Request | Diagram Type | Template |
|-------------|-------------|----------|
| "Show me the TMAR dashboard" | GUI Tab Overview | Template 1 (Dashboard tab) |
| "Map out the menu system" | Menu Tree | Template 2 |
| "How does data flow in TMAR?" | Data Architecture | Template 3 |
| "How do I navigate the system?" | Navigation Flow | Template 4 |
| "Show me all 13 tabs" | Workbook Map | Template 5 |
| "Explain the gap scanner" | Scanner Pipeline | Template 6 |
| "Create onboarding visuals" | All templates sequentially | Progressive build |
| "Visual quick reference" | Quick Reference Card | Compact Template 1 variant |

## Troubleshooting

### Diagram text is unreadable

Increase fontSize. Minimum 14 for any text, 16 for labels, 20+ for headers. On XXL cameras (1600x1200), minimum fontSize is 21.

### Elements overlap

Increase spacing between nodes. Minimum 20-30px gaps. Use zone backgrounds to visually separate groups.

### Camera shows blank space

Adjust cameraUpdate x,y to center on content. Add 50-100px padding around content edges.

### Colors invisible on dark background

Never use strokeColor or text color darker than `#555555` on the dark background. Use the zone color table above.

---

### When to use?

TMAR diagram, infographic, GUI visual, control panel map, ledger flow, tab navigation, menu tree, data architecture, gap scanner visual, onboarding guide, feature map.

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
