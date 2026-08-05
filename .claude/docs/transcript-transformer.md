# Transcript Transformer
- Load this file when adding or changing anything under the `tt*` function family in `TMAR-Accrual-Ledger.html` (the Transcript Transformer panel) — the paste/Load flow, the merged-mode prompt, the Upgrade tool, or Generate Process Tracker.
- All of this lives inline in `TMAR-Accrual-Ledger.html`. `tools/tmar-transcript-transformer-v2.html` is still an empty placeholder — do not confuse the two, and do not assume the tools/ copy reflects anything below.
- `tt_block.js` at repo root is mislabeled leftover EON sidebar code, not Transcript Transformer code — ignore it.

## Pipeline overview

Paste or load a transcript into `#tt-input` → `ttTransform()` → `ttBuildPrompt()` → single LLM call via `pdkbCallAnthropic` (streamed into the output panel) → `ttState.output` holds the resulting markdown → Copy / `.md` download / Export HTML / Generate Process Tracker all operate on `ttState.output`.

There is no separate "Auto" vs "Full" *content* mode. The `Auto`/`Full`/`Chunked` buttons (`ttSetMode`) only control whether the input gets split into chunks before transforming (`ttChunkTranscript`) — they do not change document structure. The single v2.2.0 "merged" structure (fusing educational concept framing with argument/protocol structure, previously two separate passes) is always the output.

## The merged-mode prompt (`ttBuildPrompt` / `ttMergedModeRulesBlock`)

`ttMergedModeRulesBlock()` holds the Required Sections (A–I) and Formatting Rules shared by **both** `ttBuildPrompt()` (raw transcript → doc) and `ttUpgradePrompt()` (existing doc → upgraded doc) — edit it once, both paths stay in sync. Key rules baked in:
- Section E (Core Content) must fuse educational intros ("What Is X?") with argument/procedural structure per topic — never one at the expense of the other.
- Section D (Warnings) is always a 3-column table (`Ineffective Approach | Why It Fails | Correct Alternative`), never a checklist.
- **Self-correction rule**: if the transcript's speaker revises an earlier statement later on, the later statement governs the output — this generalizes a real bug class (an early draft of this prompt propagated a since-corrected escalation path) without hardcoding any specific transcript's content into a prompt every future transcript will hit.
- **Naming-consistency rule**: if a proper noun/doctrine is spelled inconsistently in the transcript, pick the clearest instance and use it throughout — same generalization principle, for a misspelling bug class instead of a stale-fact bug class.

Do not hardcode content from any *specific* transcript into this prompt (e.g. a particular case name or doctrine) — generalize the underlying rule instead, the way the two rules above do.

## Upgrade Existing Output (`ttUpgradePrompt`)

Takes an **already-generated** document (any prior tool version — v1.2.x, v2.0.0, the "Direct Chat" variant with `instructor`/`session_duration`/`jurisdiction` fields, v2.1.0) and restructures it into the current format. This is fundamentally different from `ttBuildPrompt()`: there is no raw transcript, so the prompt explicitly forbids inventing new facts/quotes/timestamps beyond what survived into the old document — it can only reorganize and relabel, never add fidelity back.

**File I/O — deliberately not the File System Access API.** Reads via `<input type="file">` and downloads the result under the original filename (`ttUpgradeState.file`, not a `FileSystemFileHandle`). This was tried first with `showOpenFilePicker`/`createWritable()` for true in-place overwrite, but **Brave deliberately blocks the entire File System Access API family with no user-facing way to re-enable it** (confirmed via [brave/brave-browser#29411](https://github.com/brave/brave-browser/issues/29411) and [#44411](https://github.com/brave/brave-browser/issues/44411) — this is a hard policy decision, not a flag or a Shields setting). Do not reintroduce that API for this feature without re-confirming Brave's stance; the `<input>`+download approach works identically in every browser instead of only Chromium ones that permit it.

`ttUpgradeStripHtml()` extracts content from old `.html` exports before sending to the LLM. One known malformed pattern from the pre-v2.1 backlog embeds the entire document as a JS string literal passed to `marked.parse("...")` inside an inline `<script>` — decoded via `JSON.parse('"' + capture + '"')`, never `eval`/`Function` of file content.

## Generate Process Tracker (`ttProcessTrackerPrompt`)

Converts the merged output into a JSON payload for a **separate personal tool**: `_engine.html` in `Desktop\FileCabinet\.FC\Processes`, a local (non-repo) interactive checklist dashboard. The schema below was reverse-engineered directly from that engine's source and a real payload (`_verizon.json`) — **field names and nesting must match exactly**, the engine renders nothing for a field shaped differently.

```
{
  "title": string,
  "subtitle": string,
  "metadata": [[label, value], ...],
  "tabs": [{"id": string, "label": string}, ...],
  "overview": { "principle": string, "kpis": [{"value","color","label"}, ...] },
  "tracker": { "sections": [
    { "id", "title", "steps": [{"id","label","detail"?,"ref"?}, ...] }
    // OR, for a section with named sub-procedures:
    { "id", "title", "subsections": [{"title","steps":[...]}, ...] }
  ]},
  "mindmap": { "mindmap": "<tree text>" }   // see Mind Map below
}
```

Gotchas specific to this engine, not obvious from the schema alone:
- `step.label`/`step.detail` are injected as **raw HTML with no markdown parsing** — `**bold**` renders literally as asterisks. The prompt restricts the model to bare `<strong>...</strong>` only, no attributes, because a quoted HTML attribute inside a JSON string is its own parse-failure class.
- `step.id` is keyed **globally**, not per-section — `_engine.html` uses it as the localStorage key for checkbox/notes state, so a duplicate id anywhere in the document silently merges two unrelated steps' checked-state. `ttTrackerDedupeIds()` is a client-side safety net for this; do not remove it even though the prompt also tells the model to keep ids unique.
- The `overview` tab is special-cased in `_engine.html`'s render dispatch (`if (t.id === 'overview') return;` before the generic `renderSection()` call) — **anything placed under `overview` besides `principle`/`kpis`/`identity` renders nowhere**. This is why Mind Map is its own top-level tab, not nested under `overview` (a real reference file, `_verizon.json`, has `mindmap` misplaced inside `overview` and it silently never renders — don't copy that mistake).
- `_engine.html`'s own source comments admit `?data=` query params get stripped by some browsers on `file://`, and its `fetch()` fallback gets CORS-blocked on `file://` in others. **Data is embedded directly** into a self-contained copy of the template (`ttTrackerInjectEmbeddedData` — inserts `<script id="embedded-data" type="application/json">` before `</head>`) rather than relying on either. The engine's `loadData()` checks embedded data first, unconditionally, before touching the URL — this sidesteps both failure modes.
- The `<\/script>` in that injected tag must stay backslash-escaped mid-string. An unescaped `</script>` — even inside a JS string, even inside a comment — terminates the *outer* `<script>` block that this code itself lives in, corrupting the surrounding app. This bit us once already while building this feature; verify with the syntax-check pattern below after any edit near it.

### Mind Map tab

Built **deterministically by `ttTrackerBuildMindmap()`**, never asked of the LLM — an indented tree (`├─`/`└─`/`│`) from the already-parsed `tracker.sections`. This was a deliberate choice over an LLM-generated ASCII box-diagram (matching the visual style of older reference files like `_verizon.json`): box-diagrams require an LLM to keep border characters aligned across a wide 2D layout, which is unreliable, while a simple indented tree is pure string logic that can never come out misaligned.

### Self-healing JSON parser (`ttTrackerParseJson`)

The single most common way the LLM's JSON response breaks: the source document has a verbatim quoted phrase, and the model copies it into a `label`/`detail` without escaping the inner double-quotes. `ttTrackerRepairJsonQuote()` reads V8's own `JSON.parse` error position, walks back to the nearest unescaped `"`, escapes it, and `ttTrackerParseJson()` retries — looping (bounded at 25 attempts) so a document with several such phrases converges one at a time. The prompt also explicitly warns the model about this as its "#1 most common mistake," but treat that as risk reduction, not a guarantee — keep the repair loop.

## HTML export (`ttMarkdownToExportedHtml`)

Shared by `ttExportHtml()` (triggers a download) and the Upgrade tool's `.html` output path — both must always render identically, which is why the markdown→HTML builder was factored out of `ttExportHtml()` rather than duplicated.

- **Source-video banner**: if `source_url` in the frontmatter is a recognized YouTube URL (`watch`, `youtu.be`, `/embed/`, `/live/`, `/shorts/`), embeds a responsive `youtube-nocookie.com` iframe carrying over any `t=`/`start=` timestamp; otherwise a link-out banner with no player. Mirrors the Huey class-library's `VIDEO_BANNER` layout (banner card + player, placed right after the metadata table) — but that pattern embeds a *local* `.mp4` via `<video><source>`, since `source_url` here is a remote link instead.
- **GFM pipe tables** render as native `<table>` elements. They previously fell through to the generic `<p>` case (no table-detection branch existed), which is why old exported HTML showed markdown tables as escaped paragraph text — fixed, keep the table-detection branch ahead of the generic paragraph fallback if this function is restructured.

## Persistence

`tt-input`, `tt-source-url`, and `ttState.output` persist to localStorage (`tt_persist_input`/`_source_url`/`_output`, debounced 400ms on input) and restore on `DOMContentLoaded` — a page reload no longer loses in-progress work. `🗑️ Clear` (`ttClearAll`) also wipes the persisted copies, so a deliberate clear doesn't silently reappear on the next reload. The "📂 Load .md" button (`ttLoadOutputFile`) loads an external file straight into `ttState.output`, letting Export HTML / Generate Process Tracker run on previously-saved work without re-transforming.

## Verifying changes

This is one 3.4+ MB HTML file with 28 inline `<script>` blocks — a syntax error in one can silently corrupt unrelated parts of the page. After any edit here, check every block parses:

```js
const fs = require('fs');
const html = fs.readFileSync('TMAR-Accrual-Ledger.html', 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let ok = 0, fail = 0;
scripts.forEach((s, i) => { try { new Function(s); ok++; } catch (e) { fail++; console.log('BLOCK', i, 'FAILED:', e.message); } });
console.log('script blocks:', scripts.length, 'ok:', ok, 'fail:', fail);
```

There is no automated test coverage for this subsystem (per `.claude/docs/testing-conventions.md`, `TMAR-Accrual-Ledger.html` UI logic has none) — extract and exercise the specific function you changed against a realistic input (see this file's own development history for the pattern: extract via string markers, `eval` in a throwaway Node script, assert on the output) rather than trusting a syntax pass alone.
