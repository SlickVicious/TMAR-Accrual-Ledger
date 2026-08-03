# Transcript Transformer v2.1 Upgrade

## Goal
Upgrade the Transcript Transformer embedded in `TMAR-Accrual-Ledger.html` to v2.1. Add two new input fields above the transcript textarea: a YouTube playlist URL input and an output folder input. When both are populated, wire a "Download + Transcribe" button that invokes the WSL pipeline (`yt_playlist_transcribe.py`) and auto-loads the resulting `.txt` transcripts into the transformer's textarea for formatting.

## Context
- **Live app:** `TMAR-Accrual-Ledger.html` (~3.8 MB single-file app)
- **Transformer JS functions start around line 46400:** `ttTransform()`, `ttBuildPrompt()`, `ttClearAll()`, `ttState`, etc.
- **Transformer HTML panel:** Find `tt-input` (the textarea), `tt-source-url` (existing source URL field), and the transform button area. Add new fields above them.
- **Pipeline script:** `D:\_ScriptSalad\_Py_\yt_playlist_transcribe.py` — accepts two args: `<playlist-url> <output-folder>`. Returns raw `.txt` transcripts in the output folder.
- **WSL invocation pattern:** From a `.bat` or the app, call `wsl -e bash -c "source /tmp/whisper-env/bin/activate && python3 /mnt/d/_ScriptSalad/_Py_/yt_playlist_transcribe.py 'URL' 'OUTDIR'"`

## What to Build

### 1. New UI elements (above the transcript textarea)
Add to the Transcript Transformer panel (find the `tt-input` textarea section):

- **Playlist URL input** (`id="tt-playlist-url"`) — placeholder: "YouTube playlist URL"
- **Output folder input** (`id="tt-output-dir"`) — placeholder: "Output folder" with a "Browse..." button that triggers a folder picker (or defaults to the last-used folder stored in localStorage)
- **"Download + Transcribe" button** (`id="tt-download-btn"`) — appears next to the existing Transform button. Disabled until both URL and output folder are populated.
- **Status bar** (`id="tt-dl-status"`) — hidden by default. While downloading/transcribing, shows "⏳ Downloading + Transcribing... (video 3 of 6)" or similar progress.

### 2. Download-then-load flow
When "Download + Transcribe" is clicked:

1. **Validate** both fields are filled
2. **Show status bar**, disable both buttons
3. **Invoke WSL:** Use the app's existing backend-call mechanism (or `fetch` to a local endpoint, or a hidden `<form>` that posts to a server). 

   **Problem:** Browser JavaScript can't run `wsl -e bash -c "..."` directly. Solutions (pick the best):
   - **Option A:** Add a tiny local HTTP server (Node.js, already have the TT v2 server at `localhost:3456`) — add a `/api/transcribe` POST endpoint that spawns the WSL pipeline and returns progress via SSE.
   - **Option B:** The `.bat` file approach — `window.open('file:///D:/_ScriptSalad/_Py_/yt_playlist_transcribe.bat')` won't work from a browser. 
   - **Option C:** Electron or Tauri app wrapper — overkill.
   - **Option D (recommended):** Extend `server.js` in `transcript-transformer-local/` to add a `/api/transcribe` POST endpoint that:
     ```js
     app.post('/api/transcribe', async (req, res) => {
       const { playlistUrl, outputDir } = req.body;
       const { exec } = require('child_process');
       const cmd = `wsl -e bash -c "source /tmp/whisper-env/bin/activate && python3 /mnt/d/_ScriptSalad/_Py_/yt_playlist_transcribe.py '${playlistUrl}' '${outputDir}'"`;
       const proc = exec(cmd);
       // Stream output back via SSE or poll
       proc.stdout.on('data', ...);
       proc.on('close', code => ...);
     });
     ```
     Add this to the existing `server.js` that's already at `transcript-transformer-local/server.js` (the DeepSeek proxy). Poll from the browser every 2 seconds to check progress.

4. **Track progress:** Parse the pipeline's stdout for progress markers (`transcribing 01...`, `→ 01...txt`, `transforming 01...`, etc.) and update the status bar.

5. **On completion:** 
   - Read the `.txt` files from the output folder
   - Load the FIRST `.txt` file's content into the transcript textarea (`tt-input`)
   - Set the source URL field to the playlist URL
   - Show a toast/notification: "✅ 6 transcripts ready for formatting"
   - Enable the Transform button so the user can format each transcript

### 3. Folder persistence
- Store the last-used output folder in `localStorage` key `tt_last_output_dir`
- Pre-fill the output folder input on next visit

### 4. Optional: Batch format
- If multiple `.txt` files exist, show a dropdown or list: "Format: [01 - Title.txt ▼]" with a "Format All" button

## Files to Modify
1. **`TMAR-Accrual-Ledger.html`** — Add UI elements + JS functions (~lines 46350-46490 area for the transformer panel, 46400+ for JS)
2. **`transcript-transformer-local/server.js`** — Add `/api/transcribe` endpoint
3. **`D:\_ScriptSalad\_Py_\yt_playlist_transcribe.py`** — Already done, accepts URL + output folder args, outputs to output dir

## Existing Transformer State
```js
var ttState = { 
  mode: 'comprehensive', 
  output: '', 
  stats: null 
};
```

## Style / Design
Match the existing TMAR glass-card aesthetic. The new input fields should look like the existing `tt-source-url` field. Use the same dark theme, monospace font for inputs, the accent blue for the button.

## Version
Bump to v2.1.0 in the UI label and in the YAML frontmatter `artifact_version` field in `ttBuildPrompt()`.
