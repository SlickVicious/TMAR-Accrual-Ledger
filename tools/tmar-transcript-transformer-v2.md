# TMAR Transcript Transformer v2.0.0

> Export pipeline: Audio → MacWhisper → Transcript Transformer → md-github-exporter → Styled HTML + PDF

---

## In-App Transformer (TMAR Portal)

The Transcript Transformer is built directly into **TMAR-Accrual-Ledger.html** — no Python or local server required.

### How to use

1. Open the TMAR portal → navigate to **Transcript Transformer** in the sidebar
2. Paste raw transcript text (MacWhisper output or any timestamped text)
3. Optionally enter a source URL for YAML metadata
4. Select processing mode: **Auto** (default) | **Full** | **Chunked** (for long transcripts)
5. Click **⚡ Transform** — streams directly from `claude-sonnet-4-6` using your saved API key
6. Output renders live in the preview panel

### Export options

| Button | Output |
|--------|--------|
| **🌐 Export HTML** | Self-contained `.html` with collapsible sections, GitHub styling, print CSS |
| **⬇ Download MD** | Raw `.md` file with YAML frontmatter |
| **📋 Copy** | Copies markdown to clipboard |

### Output format

Every transform produces a structured README.md with:

- **YAML frontmatter** — `date_created`, `source_url`, `purpose`, `session_type`, `participants`, `tags`
- **Overview** — purpose statement and session summary
- **Key Timestamps Reference** — table mapping timestamps to topics
- **Prerequisites Checklist** — `- [ ]` items with timestamps
- **Warnings & Clarifications** — blockquoted callouts for critical corrections
- **Core Content Sections** — one section per major topic with timestamps and action items
- **Common Misconceptions** — table format
- **Glossary** — specialized terms defined
- **Next Steps Checklist** — final action items

### Requirements

- Anthropic API key saved in Settings → API Keys (`eeon_key_claude`)
- Works from `file://`, `http://localhost`, or GitHub Pages — no server dependency

---

## Deliverables

### `md-github-exporter.skill`
Install in Claude Desktop or Claude.ai. Triggers automatically when you mention:
- Exporting markdown
- GitHub styling
- Transcript export
- "export it" / "GitHub style"

Drop it in your skills folder and it's live.

---

### `md2github_export.py`
Standalone script. Works on **Windows PC** and **MacBook**.

**Three ways to run it:**

```bash
# Default — outputs both HTML + PDF
python md2github_export.py yourfile.md

# HTML only (faster, no Playwright)
python md2github_export.py yourfile.md --html-only

# Custom output path
python md2github_export.py yourfile.md custom_output.pdf
```

---

### `github-readme-print.css`
Obsidian snippet for **Better Export PDF**.

**Install:** Drop in `.obsidian/snippets/`  
**Enable:** Settings → Appearance → CSS Snippets → toggle on

---

### HTML & PDF Exports
Fresh exports from the final pipeline with all fixes applied.

---

## Pipeline Flow

**Option A — In-app (no setup)**
```
Audio → MacWhisper → Raw Transcript
  → TMAR Portal (Transcript Transformer page) → Structured .md + Styled HTML
```

**Option B — External pipeline (Python)**
```
Audio → MacWhisper → Raw Transcript
  → Transcript Transformer (Claude Code) → Structured Outline (.md)
    → md-github-exporter skill           → Styled HTML + PDF
```

For the external pipeline, say **"export it"** or **"GitHub style"** after transforming and the skill kicks in automatically.

---

## Dependencies

Install once on each machine:

```bash
pip install markdown pygments playwright
python -m playwright install chromium
```

| Package | Purpose |
|---------|---------|
| `markdown` | Parse and render `.md` → HTML |
| `pygments` | Syntax highlighting for code blocks |
| `playwright` | Headless Chromium for PDF rendering |

---

## File Locations

| File | Path |
|------|------|
| Skill | `~/.claude/commands/md-github-exporter.md` |
| Script | `~/Documents/TMAR-Accrual-Ledger/md2github_export.py` |
| CSS snippet | `~/Documents/TMAR-Accrual-Ledger/github-readme-print.css` |

---

*Generated: TMAR Accrual Ledger — April 2026*
