#!/usr/bin/env python3
"""
md2github_export.py — Markdown → GitHub-styled HTML + PDF
Version 2.0.0 | TMAR Transcript Transformer Integration

Usage:
  python md2github_export.py yourfile.md
  python md2github_export.py yourfile.md --html-only
  python md2github_export.py yourfile.md custom_output.pdf

Works on Windows (TMAR PC) and macOS (MacBook).
Dependencies: pip install markdown pygments playwright
              python -m playwright install chromium
"""

import sys
import os
import re
import argparse
from pathlib import Path

# ── Dependency check ──────────────────────────────────────────────────────────
try:
    import markdown
    from markdown.extensions.codehilite import CodeHiliteExtension
    from markdown.extensions.fenced_code import FencedCodeExtension
    from markdown.extensions.tables import TableExtension
    from markdown.extensions.toc import TocExtension
    from markdown.extensions.nl2br import Nl2BrExtension
    from pygments.formatters import HtmlFormatter
except ImportError:
    print("ERROR: Missing dependencies. Run:")
    print("  pip install markdown pygments playwright")
    sys.exit(1)


# ── GitHub CSS ────────────────────────────────────────────────────────────────
GITHUB_CSS = """
*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans",
               Helvetica, Arial, sans-serif, "Apple Color Emoji";
  font-size: 16px;
  line-height: 1.5;
  color: #1f2328;
  background: #ffffff;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
}

@media (max-width: 767px) { body { padding: 15px; } }

/* Headings */
h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}
h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #d1d9e0; }
h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #d1d9e0; }
h3 { font-size: 1.25em; }
h4 { font-size: 1em; }
h5 { font-size: 0.875em; }
h6 { font-size: 0.85em; color: #59636e; }

/* Links */
a { color: #0969da; text-decoration: none; }
a:hover { text-decoration: underline; }

/* Paragraphs */
p { margin-top: 0; margin-bottom: 16px; }

/* Blockquote */
blockquote {
  margin: 0 0 16px 0;
  padding: 0 1em;
  color: #59636e;
  border-left: 4px solid #d1d9e0;
}
blockquote > :first-child { margin-top: 0; }
blockquote > :last-child  { margin-bottom: 0; }

/* Code */
code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  white-space: break-spaces;
  background-color: #eff1f3;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
               "Liberation Mono", monospace;
}

pre {
  margin-top: 0;
  margin-bottom: 16px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  color: #1f2328;
  background-color: #f6f8fa;
  border-radius: 6px;
  border: 1px solid #d1d9e0;
}
pre code {
  padding: 0;
  margin: 0;
  font-size: 100%;
  white-space: pre;
  background: transparent;
  border: 0;
  word-break: normal;
}

/* Tables */
table {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  max-width: 100%;
  overflow: auto;
  margin-bottom: 16px;
}
table th {
  padding: 6px 13px;
  border: 1px solid #d1d9e0;
  font-weight: 600;
  background-color: #f6f8fa;
}
table td {
  padding: 6px 13px;
  border: 1px solid #d1d9e0;
}
table tr { background-color: #ffffff; border-top: 1px solid #d1d9e0; }
table tr:nth-child(2n) { background-color: #f6f8fa; }

/* Lists */
ul, ol { margin-top: 0; margin-bottom: 16px; padding-left: 2em; }
li > p { margin-top: 16px; }
li + li { margin-top: 0.25em; }

/* Horizontal rule */
hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #d1d9e0;
  border: 0;
}

/* Images */
img { max-width: 100%; box-sizing: border-box; }

/* Task list */
.task-list-item { list-style-type: none; }
.task-list-item input[type="checkbox"] {
  margin: 0 0.2em 0.25em -1.4em;
  vertical-align: middle;
}

/* TOC */
.toc { background: #f6f8fa; border: 1px solid #d1d9e0; border-radius: 6px; padding: 16px 24px; margin-bottom: 24px; }
.toc ul { margin-bottom: 0; }

/* Print */
@media print {
  body { max-width: 100%; padding: 20px; font-size: 12pt; }
  pre  { white-space: pre-wrap; word-wrap: break-word; }
  h1, h2 { page-break-after: avoid; }
  table  { page-break-inside: avoid; }
}
"""


def build_html(md_text: str, title: str = "") -> str:
    """Convert markdown to a full GitHub-styled HTML document."""
    pygments_css = HtmlFormatter(style="github-dark").get_style_defs(".codehilite")

    md = markdown.Markdown(
        extensions=[
            FencedCodeExtension(),
            CodeHiliteExtension(css_class="codehilite", guess_lang=True),
            TableExtension(),
            TocExtension(permalink=True),
            Nl2BrExtension(),
            "markdown.extensions.sane_lists",
            "markdown.extensions.smarty",
            "markdown.extensions.attr_list",
            "markdown.extensions.def_list",
            "markdown.extensions.footnotes",
            "markdown.extensions.abbr",
        ]
    )
    body_html = md.convert(md_text)

    doc_title = title or (md.toc_tokens[0]["name"] if md.toc_tokens else "Document")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{doc_title}</title>
<style>
{GITHUB_CSS}
/* Pygments syntax highlighting */
{pygments_css}
.codehilite {{ background: #0d1117; border-radius: 6px; border: 1px solid #30363d; }}
.codehilite pre {{ background: transparent; color: #e6edf3; border: none; margin: 0; }}
.codehilite .hll {{ background-color: #6e7681; }}
</style>
</head>
<body>
{body_html}
</body>
</html>"""


def export_html(md_path: Path, out_path: Path) -> Path:
    """Write GitHub-styled HTML file."""
    text = md_path.read_text(encoding="utf-8")
    html = build_html(text, title=md_path.stem.replace("-", " ").replace("_", " ").title())
    out_path.write_text(html, encoding="utf-8")
    return out_path


def export_pdf(html_path: Path, pdf_path: Path) -> Path:
    """Render HTML to PDF via headless Chromium (Playwright)."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise RuntimeError("Playwright not installed. Run: pip install playwright && python -m playwright install chromium")

    abs_html = html_path.resolve().as_posix()
    file_url = f"file:///{abs_html}" if sys.platform == "win32" else f"file://{abs_html}"

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(file_url, wait_until="networkidle")
        page.pdf(
            path=str(pdf_path),
            format="Letter",
            margin={"top": "0.75in", "bottom": "0.75in", "left": "0.75in", "right": "0.75in"},
            print_background=True,
        )
        browser.close()

    return pdf_path


def human_size(path: Path) -> str:
    b = path.stat().st_size
    for unit in ("B", "KB", "MB"):
        if b < 1024:
            return f"{b:.1f} {unit}"
        b /= 1024
    return f"{b:.1f} MB"


def main():
    # Force UTF-8 stdout on Windows to avoid cp1252 encoding errors
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(
        description="Export Markdown to GitHub-styled HTML + PDF",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("input", help="Path to the .md file")
    parser.add_argument("output", nargs="?", help="Output path (.pdf or .html). Defaults to same name as input.")
    parser.add_argument("--html-only", action="store_true", help="Generate HTML only, skip PDF")
    args = parser.parse_args()

    md_path = Path(args.input).resolve()
    if not md_path.exists():
        print(f"ERROR: File not found: {md_path}")
        sys.exit(1)
    if md_path.suffix.lower() != ".md":
        print(f"WARNING: Input doesn't have .md extension: {md_path.name}")

    # Determine output paths
    stem = md_path.stem
    out_dir = md_path.parent

    if args.output:
        out = Path(args.output).resolve()
        if out.suffix.lower() == ".html":
            html_path = out
            pdf_path = out.with_suffix(".pdf")
        else:
            pdf_path = out if out.suffix.lower() == ".pdf" else out.with_suffix(".pdf")
            html_path = pdf_path.with_suffix(".html")
    else:
        html_path = out_dir / f"{stem}.html"
        pdf_path = out_dir / f"{stem}.pdf"

    print(f"Input  : {md_path}")
    print(f"HTML   : {html_path}")
    if not args.html_only:
        print(f"PDF    : {pdf_path}")
    print()

    # ── HTML ──────────────────────────────────────────────────────────────────
    print("Generating HTML...", end=" ", flush=True)
    export_html(md_path, html_path)
    print(f"done ({human_size(html_path)})")

    if args.html_only:
        print(f"\nOutput: {html_path}")
        return

    # ── PDF ───────────────────────────────────────────────────────────────────
    print("Rendering PDF via Chromium...", end=" ", flush=True)
    try:
        export_pdf(html_path, pdf_path)
        print(f"done ({human_size(pdf_path)})")
        print(f"\nOutputs:")
        print(f"  HTML → {html_path}")
        print(f"  PDF  → {pdf_path}")
    except Exception as e:
        print(f"\nPDF generation failed: {e}")
        print(f"HTML was saved to: {html_path}")
        print("You can open it in Chrome and use File → Print → Save as PDF.")
        sys.exit(1)


if __name__ == "__main__":
    main()
