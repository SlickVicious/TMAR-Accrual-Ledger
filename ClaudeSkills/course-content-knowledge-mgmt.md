---
name: course-content-knowledge-mgmt
description: >-
  Use this skill when the user needs to manage, organize, ingest, or work with
  course content in the YTubiversity section of the LDG vault, or when
  processing transcripts, video lessons, or educational material. Triggers
  include: course content, YTubiversity, video lesson, transcript, Freeway
  Mechanics, FWM, Zero Percent, Mz Jackson, Eeon, New Earth, UNA, course
  outline, lesson notes, MacWhisper, ingest transcript, capture course, Skool,
  curriculum, or any mention of educational content capture, course
  organization, or transcript processing. Also triggers for questions about
  how courses are structured, finding specific lessons across educators, or
  building study guides from vault content.
type: claude-skill
Category: ClaudeSkills
subcategory: Course-Content
skill_title: Course Content and Knowledge Management
priority: high
platform: multi-platform
status: production
version: "1.0.0"
Date-Added: "[[2026-02-26]]"
tags:
  - "#My/SysAdmin"
  - "#Claude/Skill"
  - "#AI/Automation"
  - "#Course-Content"
aliases:
  - Course Content and Knowledge Management
---

# Course Content & Knowledge Management

## Overview

Management system for the YTubiversity educational content library within the LDG vault. Handles course ingestion, transcript processing, lesson organization, and cross-educator knowledge synthesis across 6+ educators covering trust law, estate planning, financial sovereignty, and status correction.

## Course Library Map

| Educator | Directory | Modules | Lessons | Focus Area |
|----------|-----------|---------|---------|------------|
| Free Way Mechanics | `YTubiversity/Free Way Mechanics/` | 4 | 79 | Trust administration, FWM framework |
| Zero% | `YTubiversity/Zero%/` | 1 | 22 | Zero percent tax strategies |
| New Earth Living Trust | `YTubiversity/New Earth Living Trust Law studies/` | 4 | 23 | Living trust law |
| Mz Jackson | `YTubiversity/Mz Jackson/` | 0 | 11 | Status correction |
| Eeon | `YTubiversity/Eeon/` | 2 | 8 | Advanced trust concepts |
| UNA | `YTubiversity/UNA/` | — | — | University open sessions |

## Content Ingestion Workflows

### Workflow 1: Video Lesson Capture

Template: `06 Toolkit/Templates/clipper/WC-Template-Video-Lesson.md`
Auto-trigger: Any new file created in `YTubiversity/` gets this template via Templater.

Expected frontmatter:

```yaml
---
type: video-lesson
educator: Free Way Mechanics
title: Lesson Title
url: https://...
duration: HH:MM:SS
date_watched: YYYY-MM-DD
status: unwatched|in-progress|completed|reviewed
key_topics:
  - trust-administration
tags:
  - "#YTubiversity"
---
```

### Workflow 2: Transcript Processing (MacWhisper)

Integration Hub agent: `06 Toolkit/Dev/MacWhisPro/Integration_Hub/agents/`
Slash command: `/transcript-transform [file]`
Inbox: MacWhisper exports land in `01-Transcripts/estate-planning/inbox/`

Process:
1. Record/capture audio with MacWhisper
2. Export transcript
3. Run `/ingest-transcript [filename]` to import with auto-frontmatter
4. Run `/transcript-transform [file]` to structure into Obsidian markdown

### Workflow 3: Online Course Capture (Skool/LMS)

Agent: `06 Toolkit/Dev/MacWhisPro/Integration_Hub/agents/course-content-extractor.sh`
Slash command: `/capture-course [url] [title]`
Specialized modes: foia, dual-trust

## Cross-Educator Knowledge Synthesis

### Find Lessons by Topic

```dataview
TABLE educator as "Educator", title as "Lesson", status as "Status"
FROM "YTubiversity"
WHERE contains(key_topics, "trust-administration") OR contains(tags, "trust")
SORT educator ASC, title ASC
```

### Study Progress Dashboard

```dataview
TABLE WITHOUT ID
  educator as "Educator",
  length(filter(rows, (r) => r.status = "completed")) as "Completed",
  length(filter(rows, (r) => r.status = "in-progress")) as "In Progress",
  length(filter(rows, (r) => r.status = "unwatched")) as "Unwatched",
  length(rows) as "Total"
FROM "YTubiversity"
WHERE type = "video-lesson"
GROUP BY educator
SORT educator ASC
```

### Recently Watched

```dataview
TABLE educator as "Educator", title as "Lesson", date_watched as "Watched"
FROM "YTubiversity"
WHERE type = "video-lesson" AND status = "completed"
SORT date_watched DESC
LIMIT 10
```

## Course Structure Standards

### Folder Hierarchy Pattern

```
YTubiversity/
└── [Educator Name]/
    ├── [Educator Name].md           — Connection Hub
    ├── Module 01 - [Topic]/
    │   ├── Lesson 01 - [Title].md
    │   └── Lesson 02 - [Title].md
    └── Module 02 - [Topic]/
```

### Naming Conventions

- Modules: `Module XX - [Descriptive Name]/`
- Lessons: `Lesson XX - [Video Title].md`
- Transcripts: `[Educator]_[Date]_[Topic]_transcript.md`

---

### When to use?

YTubiversity, transcript, video lesson, course capture, FWM, Freeway Mechanics, MacWhisper, Skool, curriculum, study progress.

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
