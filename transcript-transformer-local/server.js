/**
 * Transcript Transformer — local companion server (v2.1.0)
 *
 * Powers the "Download + Transcribe" button in the Transcript Transformer
 * panel of TMAR-Accrual-Ledger.html. Runs on the same machine as the browser
 * (localhost only — never bind this to 0.0.0.0) and does two things the
 * browser can't do on its own:
 *
 *   POST /api/pick-folder  — native Windows folder-picker dialog
 *   POST /api/transcribe   — runs the WSL yt_playlist_transcribe.py pipeline
 *                            and streams progress back as NDJSON
 *
 * Start with: node server.js   (or: npm start, from this folder)
 * No npm dependencies — built-in http/child_process/fs only.
 *
 * Port: deliberately NOT 3456. There is already a separate, working
 * "Transcript Transformer v2.0.0 - Local" Express server occupying
 * localhost:3456 (it serves /api/transform, the DeepSeek proxy that
 * yt_playlist_transcribe.py's optional Step 3 calls) — do not collide
 * with it or try to replace it; this server is a standalone companion
 * that only owns the two routes below.
 */

const http = require('http');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3457;
const HOST = '127.0.0.1'; // local-only — this endpoint spawns processes, never expose it beyond localhost
const PIPELINE_SCRIPT_WSL = '/mnt/d/_ScriptSalad/_Py_/yt_playlist_transcribe.py';
const WHISPER_ENV_ACTIVATE = 'source /tmp/whisper-env/bin/activate';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Converts a Windows drive-letter path to its WSL /mnt/x/... equivalent.
// Must be done here, before the path is handed to wsl.exe as an argument —
// wsl.exe's own Windows->Linux argv marshalling strips backslashes, so a raw
// "C:\Foo\Bar" arrives on the Linux side as "CFooBar" with no separators.
function toWslPath(p) {
  const m = /^([A-Za-z]):[\\/](.*)$/.exec(p);
  if (!m) return p.replace(/\\/g, '/');
  return '/mnt/' + m[1].toLowerCase() + '/' + m[2].replace(/\\/g, '/');
}

function sendJson(res, status, obj) {
  res.writeHead(status, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 1e6) { reject(new Error('Request body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// ── POST /api/pick-folder ──────────────────────────────────────────────
// Native Windows folder-browser dialog via PowerShell/WinForms. No user
// input is interpolated into the PowerShell command, so this is safe
// regardless of what the client sends (the request body isn't even read).
function pickFolder(res) {
  const psScript = [
    'Add-Type -AssemblyName System.Windows.Forms',
    '$f = New-Object System.Windows.Forms.FolderBrowserDialog',
    "$f.Description = 'Select output folder for transcripts'",
    'if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { Write-Output $f.SelectedPath }',
  ].join('; ');

  try {
    const out = execFileSync(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-STA', '-Command', psScript],
      { encoding: 'utf8', timeout: 120000 }
    ).trim();
    sendJson(res, 200, { path: out || null });
  } catch (e) {
    sendJson(res, 200, { path: null, error: 'Folder picker unavailable: ' + e.message });
  }
}

// ── POST /api/transcribe ───────────────────────────────────────────────
// Streams newline-delimited JSON: {"type":"log","line":...} while running,
// then a final {"type":"done",...} or {"type":"error","message":...}.
async function transcribe(req, res) {
  let body;
  try { body = await readBody(req); }
  catch (e) { return sendJson(res, 400, { error: 'Invalid request body: ' + e.message }); }

  const playlistUrl = (body.playlistUrl || '').trim();
  const outputDir = (body.outputDir || '').trim();
  if (!playlistUrl || !outputDir) {
    return sendJson(res, 400, { error: 'playlistUrl and outputDir are both required' });
  }
  if (playlistUrl.includes('\0') || outputDir.includes('\0')) {
    return sendJson(res, 400, { error: 'Invalid input' });
  }

  try { fs.mkdirSync(outputDir, { recursive: true }); }
  catch (e) { return sendJson(res, 400, { error: 'Cannot create output folder: ' + e.message }); }

  res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' });
  const emit = (obj) => res.write(JSON.stringify(obj) + '\n');

  // Passed as bash positional params ($1, $2) via argv — NOT string-interpolated
  // into the shell command — so quotes/spaces/special chars in playlistUrl or
  // outputDir can never break out into shell metacharacters.
  //
  // outputDir must be pre-converted to a /mnt/x/... path before crossing the
  // Windows->WSL argv boundary: verified by testing that wsl.exe's argument
  // marshalling silently drops backslashes (C:\Foo\Bar arrives as CFooBar),
  // which would otherwise send the pipeline writing to a mangled path.
  const wslOutputDir = toWslPath(outputDir);
  const bashScript = `${WHISPER_ENV_ACTIVATE} && exec python3 -u ${PIPELINE_SCRIPT_WSL} "$1" "$2"`;
  const child = spawn('wsl', ['-e', 'bash', '-c', bashScript, 'bash', playlistUrl, wslOutputDir], {
    windowsHide: true,
  });

  let buffer = '';
  const handleChunk = (chunk) => {
    buffer += chunk.toString('utf8');
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.trim()) emit({ type: 'log', line: line.replace(/\r$/, '') });
    }
  };
  child.stdout.on('data', handleChunk);
  child.stderr.on('data', handleChunk);

  child.on('error', (err) => {
    emit({ type: 'error', message: 'Failed to launch WSL pipeline: ' + err.message });
    res.end();
  });

  child.on('close', (code) => {
    if (buffer.trim()) emit({ type: 'log', line: buffer.replace(/\r$/, '') });

    let files = [];
    try {
      files = fs.readdirSync(outputDir)
        // done.txt is yt-dlp's own download-archive tracker (a list of video
        // IDs), not a transcript — it lands in the same folder and matches
        // *.txt, so it must be excluded explicitly or it gets bundled in
        // (and even fed through Step 3's reformatter, producing a nonsense
        // done.md) alongside the real transcripts.
        .filter((f) => f.toLowerCase().endsWith('.txt') && f.toLowerCase() !== 'done.txt')
        .sort()
        .map((name) => ({ name, content: fs.readFileSync(path.join(outputDir, name), 'utf8') }));
    } catch (e) {
      emit({ type: 'error', message: 'Pipeline finished but output folder could not be read: ' + e.message });
      res.end();
      return;
    }

    if (files.length === 0) {
      emit({ type: 'error', message: 'Pipeline exited with code ' + code + ' and produced no transcripts. Check the log above.' });
    } else {
      emit({ type: 'done', outputDir, files, exitCode: code });
    }
    res.end();
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }
  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, { status: 'ok', service: 'transcript-transformer-local' });
  }
  if (req.method === 'POST' && req.url === '/api/pick-folder') {
    return pickFolder(res);
  }
  if (req.method === 'POST' && req.url === '/api/transcribe') {
    return transcribe(req, res);
  }
  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`Transcript Transformer local server listening on http://${HOST}:${PORT}`);
});
