# TMAR Transcript Transformer v2.0.0

> Export pipeline: Audio → MacWhisper → Transcript Transformer → md-github-exporter → Styled HTML + PDF

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

```
Audio → MacWhisper → Raw Transcript
  → Transcript Transformer → Structured Outline (.md)
    → md-github-exporter  → Styled HTML + PDF
```

The skill docs reference this integration pattern.  
When running Transcript Transformer and wanting the export step — say **"export it"** or **"GitHub style"** and the skill kicks in automatically.

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
