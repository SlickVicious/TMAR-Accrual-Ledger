/**
 * TMAR Parity Sync — scripts/parity-sync.mjs
 *
 * Fetches redressright.me sources directly (no CORS needed on localhost),
 * diffs function bodies against TMAR-Accrual-Ledger.html, checks compatibility,
 * resolves missing dependencies, and patches the local file.
 *
 * Flags:
 *   --apply          Write changes to TMAR-Accrual-Ledger.html
 *   --yes            Skip per-function prompts (apply all)
 *   --compat         Show compatibility analysis per function (SAFE/REVIEW/SKIP)
 *   --resolve        Auto-include missing function deps from source
 *   --fn <name>      Target a single function only
 *   --source <name>  Target one source only (Agent.html | GAAP.html)
 *
 * Examples:
 *   node scripts/parity-sync.mjs --compat
 *   node scripts/parity-sync.mjs --compat --resolve --apply
 *   node scripts/parity-sync.mjs --apply --fn callLLMStream --resolve
 *   node scripts/parity-sync.mjs --apply --yes --resolve
 */

import fs      from 'node:fs';
import path    from 'node:path';
import crypto  from 'node:crypto';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// ── config ────────────────────────────────────────────────────────────────────

const ROOT             = process.cwd();
const TMAR_FILE        = path.join(ROOT, 'TMAR-Accrual-Ledger.html');
const FINGERPRINT_FILE = path.join(ROOT, 'parity-fingerprint.json');
const REPORT_FILE      = path.join(ROOT, 'scripts', 'parity-sync-report.txt');

const SOURCES = {
  'Agent.html': 'https://redressright.me/Agent.html',
  'GAAP.html':  'https://redressright.me/GAAP.html',
};

// JS builtins / browser globals — exclude from dependency analysis
const BUILTINS = new Set([
  // globals & constructors
  'console','alert','confirm','prompt','fetch','JSON','Math','Date','Object',
  'Array','String','Number','Boolean','Promise','setTimeout','setInterval',
  'clearTimeout','clearInterval','parseInt','parseFloat','isNaN','isFinite',
  'encodeURIComponent','decodeURIComponent','localStorage','sessionStorage',
  'document','window','navigator','location','history','performance',
  'addEventListener','removeEventListener','getElementById','querySelector',
  'querySelectorAll','createElement','appendChild','removeChild','setAttribute',
  'getAttribute','classList','style','innerHTML','textContent','value','href',
  'Error','TypeError','RangeError','ReferenceError','SyntaxError','RegExp',
  'Symbol','Map','Set','WeakMap','WeakSet','Proxy','Reflect',
  'ArrayBuffer','DataView','Uint8Array','Int32Array','Float64Array',
  'AbortController','AbortSignal','URL','URLSearchParams','FormData',
  'Blob','File','FileReader','Event','CustomEvent','MutationObserver',
  'IntersectionObserver','ResizeObserver','requestAnimationFrame',
  'cancelAnimationFrame','indexedDB','crypto','SubtleCrypto','TextDecoder',
  'TextEncoder','atob','btoa','structuredClone','queueMicrotask',
  // keywords
  'if','for','while','switch','catch','return','typeof','instanceof',
  'new','delete','void','throw','super','class','extends','import',
  'export','const','let','var','function','async','await','yield',
  'try','finally','do','in','of','with','break','continue',
  'null','undefined','true','false','this','arguments','eval',
  'NaN','Infinity','globalThis',
  // Array prototype methods (almost always method calls, not standalone fns)
  'push','pop','shift','unshift','splice','slice','concat','join',
  'map','filter','reduce','reduceRight','forEach','find','findIndex',
  'some','every','indexOf','lastIndexOf','includes','flat','flatMap',
  'fill','copyWithin','reverse','sort','entries','values','keys','at',
  // String prototype methods
  'trim','trimStart','trimEnd','split','replace','replaceAll','match',
  'matchAll','search','substring','substr','charAt','charCodeAt',
  'startsWith','endsWith','padStart','padEnd','repeat','normalize',
  'toLowerCase','toUpperCase','toLocaleLowerCase','toLocaleUpperCase',
  // Object static methods
  'assign','freeze','create','fromEntries','getOwnPropertyNames',
  'getOwnPropertyDescriptor','getPrototypeOf','setPrototypeOf','is',
  'hasOwn','hasOwnProperty','toString','valueOf','toLocaleString',
  // Math methods
  'ceil','floor','round','abs','max','min','pow','sqrt','log','log2','log10',
  'random','sign','trunc','hypot','cbrt','clz32','fround','imul','sinh',
  'cosh','tanh','asinh','acosh','atanh','asin','acos','atan','atan2',
  'sin','cos','tan','exp','expm1','log1p',
  // Promise methods
  'resolve','reject','all','allSettled','race','any','then','finally',
  // Date methods
  'now','toISOString','toLocaleDateString','toLocaleString','toLocaleTimeString',
  'getTime','getFullYear','getMonth','getDate','getDay','getHours',
  'getMinutes','getSeconds','getMilliseconds','setFullYear','setMonth',
  'setDate','setHours','setMinutes','setSeconds','setMilliseconds',
  // DOM / element methods
  'click','focus','blur','select','scroll','scrollIntoView','scrollTo',
  'scrollBy','getBoundingClientRect','getClientRects','closest','matches',
  'contains','append','prepend','before','after','replaceWith','remove',
  'cloneNode','normalize','dispatchEvent','requestFullscreen',
  'getComputedStyle','getPropertyValue','setProperty','removeProperty',
  'add','delete','has','clear','toggle','replace',
  'preventDefault','stopPropagation','stopImmediatePropagation',
  // Fetch / Response methods
  'json','text','blob','arrayBuffer','formData','clone',
  // FileReader
  'readAsText','readAsDataURL','readAsArrayBuffer','readAsBinaryString',
  // IndexedDB (all typically called as methods on db/store objects)
  'transaction','objectStore','openCursor','createObjectStore',
  'deleteObjectStore','createIndex','deleteIndex','getAll','getAllKeys',
  'getKey','put','count','index','open','advance','continue',
  // Clipboard
  'writeText','readText','write','read',
  // Media / other
  'play','pause','load','start','stop','abort','cancel',
  'connect','disconnect','observe','unobserve',
  'postMessage','terminate','importScripts',
  'send','close','redirect',
  // Console (when called as console.X — the method name itself)
  'log','warn','info','error','debug','trace','table','group','groupEnd',
  'groupCollapsed','time','timeEnd','timeLog','assert','dir','dirxml',
  // Misc prototype methods often seen as false positives
  'get','set','size','length','name','call','apply','bind',
  'next','return','throw','done','value',
  'createObjectURL','revokeObjectURL','decode','encode',
  'stringify','parse','format','now','from','of','isArray',
  'toFixed','toPrecision','toExponential',
  'charCodeAt','codePointAt','fromCharCode','fromCodePoint',
  // Common callback/param names mistaken for functions
  'error','result','event','data','response','request','options','config',
  'callback','resolve','reject','done','success','failure',
  // Web Speech API
  'SpeechRecognition','webkitSpeechRecognition','SpeechSynthesisUtterance',
  'SpeechSynthesis','SpeechGrammarList','SpeechRecognitionEvent',
  // Typed arrays & binary
  'Uint32Array','Uint8ClampedArray','Uint16Array','Int8Array',
  'Int16Array','Float32Array','BigInt64Array','BigUint64Array',
  // Canvas / CSS functions that appear as JS calls
  'rgba','rgb','hsl','hsla','linear-gradient','radial-gradient',
  // jsPDF & FileSaver — external libs (flag as REVIEW not SKIP — they may already be loaded)
  // (leave out so they surface as real warnings)
  // IndexedDB request object props often seen as function calls
  'onsuccess','onerror','onupgradeneeded','oncomplete','onblocked',
]);

// ── protected functions (TMAR has diverged intentionally — never replace) ─────
// callLLMStream        : routes through Cloudflare CORS proxy (required for GitHub Pages)
// resolveProvider      : reads TMAR-specific eeon_key_* localStorage keys
// buildFullSystemPrompt: TMAR adds typeof guards for prefs/memory (source uses bare
//                        globals → ReferenceError → total agent outage). Fix 2026-06-02.
// truncateToTokenBudget: TMAR reads provider via guarded path; source uses bare
//                        `activeProvider` (a local DOM var here, not a global) → ReferenceError.
const PROTECTED = new Set([
  'callLLMStream',
  'resolveProvider',
  'buildFullSystemPrompt',
  'truncateToTokenBudget',
]);

// ── args ──────────────────────────────────────────────────────────────────────

const args     = process.argv.slice(2);
const APPLY    = args.includes('--apply');
const YES_ALL        = args.includes('--yes');
const COMPAT         = args.includes('--compat') || APPLY;
const RESOLVE        = args.includes('--resolve');
const INCLUDE_REVIEW = args.includes('--include-review'); // apply REVIEW fns (default: skip)
const _fnIdx   = args.indexOf('--fn');
const _srcIdx  = args.indexOf('--source');
const ONLY_FN  = _fnIdx  >= 0 ? (args[_fnIdx  + 1] ?? null) : null;
const ONLY_SRC = _srcIdx >= 0 ? (args[_srcIdx + 1] ?? null) : null;

// ── parsing ───────────────────────────────────────────────────────────────────

/**
 * Scan from opening '{' at startIdx to matching '}'.
 * Skips strings, template literals, comments, and regex literals.
 * Returns index AFTER closing '}', or -1 if unbalanced.
 */
function scanToMatchingBrace(src, startIdx) {
  let i = startIdx + 1;
  let depth = 1;

  // Find the last non-whitespace character before position j
  function prevNonWS(j) {
    let k = j - 1;
    while (k >= 0 && /\s/.test(src[k])) k--;
    return k >= 0 ? src[k] : '';
  }

  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === '/' && src[i + 1] === '/') {
      const nl = src.indexOf('\n', i + 2);
      i = nl === -1 ? src.length : nl + 1;
    } else if (ch === '/' && src[i + 1] === '*') {
      // Treat as division if preceded by identifier/closing bracket; otherwise block comment
      if (/[a-zA-Z0-9_$)\]]/.test(prevNonWS(i))) {
        i++; // division operator
      } else {
        const end = src.indexOf('*/', i + 2);
        i = end === -1 ? src.length : end + 2;
      }
    } else if (ch === '/') {
      // Regex literal: only when previous non-WS char is an operator-context char
      // Identifier/closing chars after = division; operator chars = regex start
      const p = prevNonWS(i);
      if (p === '' || /[=(:,!&|?[{;~^%+\-*<>]/.test(p) || p === 'return' || p === 'typeof' || p === 'void' || p === 'delete' || p === 'in' || p === 'of') {
        // regex literal — scan to closing /
        i++;
        while (i < src.length) {
          if (src[i] === '\\') { i += 2; continue; }
          if (src[i] === '[') {
            i++;
            while (i < src.length) {
              if (src[i] === '\\') { i += 2; continue; }
              if (src[i] === ']') { i++; break; }
              i++;
            }
          } else if (src[i] === '/') {
            i++;
            while (i < src.length && /[gimsuy]/.test(src[i])) i++;
            break;
          } else { i++; }
        }
      } else {
        i++; // division operator
      }
    } else if (ch === '`') {
      i++;
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === '`') { i++; break; }
        if (src[i] === '$' && src[i + 1] === '{') {
          i += 2; let td = 1;
          while (i < src.length && td > 0) {
            if (src[i] === '{') td++;
            else if (src[i] === '}') td--;
            i++;
          }
        } else { i++; }
      }
    } else if (ch === '"' || ch === "'") {
      const q = ch; i++;
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === q)    { i++; break; }
        i++;
      }
    } else if (ch === '{') { depth++; i++; }
      else if (ch === '}') { depth--; i++; }
      else                 { i++; }
  }

  return depth === 0 ? i : -1;
}

/**
 * Extract all named function definitions — both declarations and expressions.
 * Detects:
 *   function name(          ← declaration
 *   async function name(    ← async declaration
 *   const/let/var name = (async)? function(   ← expression
 *   const/let/var name = (async)? (...) =>    ← arrow function
 * Returns Map<name, { body, hash, startIdx, endIdx }>
 */
function extractFunctions(src) {
  const results = new Map();

  // Pattern 1: function declarations
  const fnPat = /(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  let m;
  while ((m = fnPat.exec(src)) !== null) {
    const name = m[1];
    if (results.has(name)) continue;
    const braceIdx = src.indexOf('{', m.index + m[0].length);
    if (braceIdx === -1) continue;
    const endIdx = scanToMatchingBrace(src, braceIdx);
    if (endIdx === -1) continue;
    const body = src.slice(m.index, endIdx);
    results.set(name, { body, hash: sha256short(body), startIdx: m.index, endIdx });
  }

  // Pattern 2: function expressions  (const name = function / async function)
  const exprPat = /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s+)?function\s*\(/g;
  while ((m = exprPat.exec(src)) !== null) {
    const name = m[1];
    if (results.has(name)) continue;
    const braceIdx = src.indexOf('{', m.index + m[0].length);
    if (braceIdx === -1) continue;
    const endIdx = scanToMatchingBrace(src, braceIdx);
    if (endIdx === -1) continue;
    results.set(name, { body: src.slice(m.index, endIdx), hash: sha256short(src.slice(m.index, endIdx)), startIdx: m.index, endIdx });
  }

  // Pattern 3: arrow functions  (const name = (async)? (...) => {)
  const arrowPat = /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][A-Za-z0-9_$]*)\s*=>\s*\{/g;
  while ((m = arrowPat.exec(src)) !== null) {
    const name = m[1];
    if (results.has(name)) continue;
    const braceIdx = src.lastIndexOf('{', m.index + m[0].length);
    if (braceIdx === -1) continue;
    const endIdx = scanToMatchingBrace(src, braceIdx);
    if (endIdx === -1) continue;
    results.set(name, { body: src.slice(m.index, endIdx), hash: sha256short(src.slice(m.index, endIdx)), startIdx: m.index, endIdx });
  }

  return results;
}

/**
 * Strip string literals, template literals, and comments from source text,
 * replacing them with spaces so positions remain intact for method-call detection.
 */
function stripStrings(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    // line comment
    if (ch === '/' && src[i+1] === '/') {
      const nl = src.indexOf('\n', i+2);
      const end = nl === -1 ? src.length : nl;
      out += ' '.repeat(end - i); i = end;
    // block comment — only if not preceded by identifier (avoid treating /regex*.../ as comment)
    } else if (ch === '/' && src[i+1] === '*') {
      const prev = i > 0 ? src[i-1] : '';
      if (/[a-zA-Z0-9_$)\]]/.test(prev)) {
        out += ch; i++; // division operator
      } else {
        const end = src.indexOf('*/', i+2);
        const stop = end === -1 ? src.length : end + 2;
        out += ' '.repeat(stop - i); i = stop;
      }
    // template literal — preserve ${...} expression interiors
    } else if (ch === '`') {
      out += ' '; i++;
      while (i < src.length) {
        if (src[i] === '\\') { out += '  '; i += 2; continue; }
        if (src[i] === '`')  { out += ' '; i++; break; }
        if (src[i] === '$' && src[i+1] === '{') {
          out += '  '; i += 2;
          let td = 1;
          while (i < src.length && td > 0) {
            const c = src[i];
            if (c === '{') td++;
            else if (c === '}') { td--; if (td === 0) { out += ' '; i++; continue; } }
            out += c; i++;
          }
        } else { out += ' '; i++; }
      }
    // single/double-quoted string
    } else if (ch === '"' || ch === "'") {
      const q = ch; out += ' '; i++;
      while (i < src.length) {
        if (src[i] === '\\') { out += '  '; i += 2; continue; }
        if (src[i] === q)    { out += ' '; i++; break; }
        out += ' '; i++;
      }
    } else {
      out += ch; i++;
    }
  }
  return out;
}

/** All standalone function calls inside a body (excluding builtins and method calls). */
function extractCalls(body) {
  const stripped = stripStrings(body);
  const calls = new Set();
  const pat = /\b([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  let m;
  while ((m = pat.exec(stripped)) !== null) {
    if (m.index > 0 && stripped[m.index - 1] === '.') continue;
    if (!BUILTINS.has(m[1])) calls.add(m[1]);
  }
  // Remove locally-defined arrow functions and function expressions — not external deps
  const localArrow = /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][A-Za-z0-9_$]*)\s*=>/g;
  const localFn    = /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s+)?function/g;
  for (const rx of [localArrow, localFn]) {
    while ((m = rx.exec(stripped)) !== null) calls.delete(m[1]);
  }
  return [...calls];
}

/** getElementById / querySelector IDs referenced in a body. */
function extractDomIds(body) {
  const ids = new Set();
  const byId   = /getElementById\(['"]([^'"]+)['"]\)/g;
  const byQS   = /querySelector\(['"]#([A-Za-z][\w-]*)['"]\)/g;
  let m;
  while ((m = byId.exec(body)) !== null)  ids.add(m[1]);
  while ((m = byQS.exec(body))  !== null) ids.add(m[1]);
  return [...ids];
}

/** window.X references in a body. */
function extractWindowRefs(body) {
  const refs = new Set();
  const pat  = /window\.([A-Za-z_$][A-Za-z0-9_$]*)/g;
  let m;
  while ((m = pat.exec(body)) !== null) refs.add(m[1]);
  return [...refs];
}

// ── compatibility ─────────────────────────────────────────────────────────────

/**
 * Analyse a single function body for compatibility with TMAR.
 * Returns { status, issues, warnings, pullable, missingDomIds, missingGlobals }
 *   status: 'SAFE' | 'REVIEW' | 'SKIP'
 *   pullable: function names available in source that can be auto-resolved
 */
function analyzeCompat(body, srcFns, tmarFns, tmarHtml) {
  const calls       = extractCalls(body);
  const domIds      = extractDomIds(body);
  const windowRefs  = extractWindowRefs(body);

  const pullable       = [];  // missing in TMAR but available in source
  const hardMissing    = [];  // missing in both — can't auto-fix
  const missingDomIds  = [];
  const missingGlobals = [];

  for (const call of calls) {
    if (!tmarFns.has(call)) {
      if (srcFns.has(call)) pullable.push(call);
      else                  hardMissing.push(call);
    }
  }

  for (const id of domIds) {
    if (!tmarHtml.includes(`id="${id}"`) && !tmarHtml.includes(`id='${id}'`)) {
      missingDomIds.push(id);
    }
  }

  for (const ref of windowRefs) {
    if (!tmarHtml.includes(`window.${ref}`) && !tmarFns.has(ref)) {
      missingGlobals.push(ref);
    }
  }

  const issues   = [];
  const warnings = [];

  if (hardMissing.length)   warnings.push(`Deps not found anywhere: ${hardMissing.join(', ')}`);
  if (pullable.length)      warnings.push(`Deps in source (pullable with --resolve): ${pullable.join(', ')}`);
  if (missingDomIds.length) warnings.push(`DOM IDs not in TMAR: ${missingDomIds.join(', ')}`);
  if (missingGlobals.length)warnings.push(`window.X refs not in TMAR: ${missingGlobals.join(', ')}`);

  // SKIP only if there are hard-missing deps with no source fallback
  const status = hardMissing.length > 3   ? 'SKIP'
               : (warnings.length > 0)    ? 'REVIEW'
                                          : 'SAFE';

  return { status, issues, warnings, pullable, hardMissing, missingDomIds, missingGlobals };
}

/**
 * Recursively collect function names that must be pulled from source
 * to satisfy deps of targetFn.  Stops at depth 4.
 */
function resolveDeps(fnName, srcFns, tmarFns, collected = new Set(), depth = 0) {
  if (depth > 4) return collected;
  const entry = srcFns.get(fnName);
  if (!entry) return collected;

  const calls = extractCalls(entry.body);
  for (const call of calls) {
    if (!tmarFns.has(call) && srcFns.has(call) && !collected.has(call)) {
      collected.add(call);
      resolveDeps(call, srcFns, tmarFns, collected, depth + 1);
    }
  }
  return collected;
}

// ── diff ──────────────────────────────────────────────────────────────────────

function normalize(str) { return str.replace(/\s+/g, ' ').trim(); }

function diffSources(srcFns, tmarFns) {
  const changed = [], added = [];
  for (const [name, src] of srcFns) {
    const tmar = tmarFns.get(name);
    if (!tmar)                                               added.push({ name, body: src.body });
    else if (normalize(src.body) !== normalize(tmar.body))   changed.push({ name, newBody: src.body, oldBody: tmar.body });
  }
  return { changed, added };
}

// ── apply ─────────────────────────────────────────────────────────────────────

function applyChange(tmar, name, newBody) {
  const pat  = new RegExp(`(?:async\\s+)?function\\s+${name.replace(/[$]/g,'\\$')}\\s*\\(`);
  const idx  = tmar.search(pat);
  if (idx === -1) return null;
  const braceIdx = tmar.indexOf('{', idx);
  if (braceIdx === -1) return null;
  const endIdx = scanToMatchingBrace(tmar, braceIdx);
  if (endIdx === -1) return null;
  return tmar.slice(0, idx) + newBody + tmar.slice(endIdx);
}

function appendFunction(tmar, body, srcName) {
  const ts  = new Date().toISOString();
  const tag = `\n/* ── pulled from redressright.me/${srcName} — ${ts} ── */\n`;
  const last = tmar.lastIndexOf('</script>');
  if (last === -1) return tmar + '\n<script>\n' + tag + body + '\n</script>\n';
  return tmar.slice(0, last) + tag + body + '\n\n' + tmar.slice(last);
}

// ── helpers ───────────────────────────────────────────────────────────────────

function sha256(str)      { return crypto.createHash('sha256').update(str).digest('hex'); }
function sha256short(str) { return sha256(str).slice(0, 16); }

function pad(str, n, sym = ' ') { return (str + sym.repeat(n)).slice(0, n); }

function statusLabel(s) {
  return s === 'SAFE'   ? '🟢 SAFE  '
       : s === 'REVIEW' ? '🟡 REVIEW'
                        : '🔴 SKIP  ';
}
/**
 * Verify that buildFullSystemPrompt contains required gate tokens.
 * Returns { ok, missing, reason }
 */
function verifyBuildPromptGate(html) {
  const functions = extractFunctions(html);
  const target = functions.get('buildFullSystemPrompt');

  if (!target) {
    return {
      ok: false,
      missing: ['buildFullSystemPrompt'],
      reason: 'function missing'
    };
  }

  const requiredTokens = ['SYPHER PROTOCOL', 'PRESUMPTION KILLER'];

  // Two valid architectures:
  //   (a) tokens inlined directly in buildFullSystemPrompt's body, or
  //   (b) tokens supplied at runtime via SYPHER_PROTOCOL.core, which the function
  //       concatenates into the prompt (current TMAR architecture).
  // Validate the *reachable* gate: tokens must exist in the file AND be wired into
  // the prompt either inline or through a referenced SYPHER_PROTOCOL.core.
  const injectsCore = /SYPHER_PROTOCOL\s*\.\s*core/.test(target.body);
  const missing = requiredTokens.filter(token => {
    const inline = target.body.includes(token);
    const viaCore = injectsCore && html.includes(token);
    return !inline && !viaCore;
  });

  return {
    ok: missing.length === 0,
    missing,
    reason: missing.length
      ? 'gate tokens not reachable from buildFullSystemPrompt (neither inline nor via SYPHER_PROTOCOL.core)'
      : 'ok'
  };
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║        TMAR Parity Sync  (localhost)         ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  if (!fs.existsSync(TMAR_FILE)) {
    console.error('❌  TMAR-Accrual-Ledger.html not found. Run from project root.');
    process.exit(1);
  }

  const flags = [
    APPLY          && 'apply',
    YES_ALL        && 'yes (no prompts)',
    COMPAT         && 'compat',
    RESOLVE        && 'resolve deps',
    INCLUDE_REVIEW && 'include-review',
    ONLY_FN        && `fn=${ONLY_FN}`,
    ONLY_SRC       && `source=${ONLY_SRC}`,
  ].filter(Boolean);
  if (flags.length) console.log(`Flags: ${flags.join('  •  ')}\n`);

  const tmarOrig = fs.readFileSync(TMAR_FILE, 'utf8');
  const tmarFnsOrig = extractFunctions(tmarOrig);
  console.log(`📄  TMAR loaded — ${tmarFnsOrig.size} functions\n`);

  const fingerprint = JSON.parse(fs.readFileSync(FINGERPRINT_FILE, 'utf8'));
  const reportLines = [`TMAR Parity Sync — ${new Date().toISOString()}\n`];
  const rl = (APPLY && !YES_ALL) ? readline.createInterface({ input, output }) : null;

  let tmarWorking  = tmarOrig;
  let appliedCount = 0;

  for (const [srcName, srcUrl] of Object.entries(SOURCES)) {
    if (ONLY_SRC && srcName !== ONLY_SRC) continue;

    const divider = `─── ${srcName} ${'─'.repeat(Math.max(0, 46 - srcName.length))}`;
    console.log(divider);
    console.log(`⬇️   ${srcUrl}`);

    let srcHtml;
    try {
      const res = await fetch(srcUrl, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      srcHtml = await res.text();
    } catch (e) {
      console.error(`❌  Fetch failed: ${e.message}\n`);
      reportLines.push(`=== ${srcName} FETCH FAILED: ${e.message} ===\n`);
      continue;
    }

    const newHash = sha256(srcHtml);
    const oldHash = fingerprint.sources?.[srcName]?.hash ?? '';
    const drifted = newHash !== oldHash;
    console.log(`    Hash ${newHash.slice(0,16)} ${drifted ? '⚠️  CHANGED' : '✅ unchanged'}`);

    const srcFns = extractFunctions(srcHtml);
    console.log(`    ${srcFns.size} functions found\n`);

    const currentTmarFns = extractFunctions(tmarWorking);
    let { changed, added } = diffSources(srcFns, currentTmarFns);

    if (ONLY_FN) {
      changed = changed.filter(c => c.name === ONLY_FN);
      added   = added.filter(a => a.name === ONLY_FN);
    }

    // Drop protected functions from the changed list (TMAR intentionally diverged)
    const protectedChanged = changed.filter(c => PROTECTED.has(c.name));
    changed = changed.filter(c => !PROTECTED.has(c.name));
    if (protectedChanged.length) {
      console.log(`  🔒 Protected (skipping ${protectedChanged.length}): ${protectedChanged.map(c=>c.name).join(', ')}\n`);
      protectedChanged.forEach(c => reportLines.push(`  PROTECTED (unchanged): ${c.name}`));
    }

    // ── compatibility analysis ───────────────────────────────────────────────
    if (COMPAT) {
      console.log('  Compatibility check:\n');

      const allCandidates = [
        ...changed.map(c => ({ name: c.name, body: c.newBody, kind: 'changed' })),
        ...added.map(a   => ({ name: a.name, body: a.body,    kind: 'new'     })),
      ];

      // Accumulate extra functions to pull for all candidates
      const toResolve = new Map(); // name → body (from source)

      for (const cand of allCandidates) {
        const compat = analyzeCompat(cand.body, srcFns, currentTmarFns, tmarWorking);
        const kindTag = cand.kind === 'changed' ? '~' : '+';
        console.log(`  ${statusLabel(compat.status)} ${kindTag} ${cand.name}`);

        for (const w of compat.warnings) {
          console.log(`             ↳ ${w}`);
        }

        reportLines.push(`  ${compat.status} [${cand.kind}] ${cand.name}`);
        compat.warnings.forEach(w => reportLines.push(`    ${w}`));

        // --resolve: recursively collect pullable deps
        if (RESOLVE && compat.pullable.length) {
          const deps = resolveDeps(cand.name, srcFns, currentTmarFns);
          for (const dep of deps) {
            if (!toResolve.has(dep) && !currentTmarFns.has(dep)) {
              toResolve.set(dep, srcFns.get(dep).body);
            }
          }
        }

        // Upgrade compat status if --resolve covers the pullable deps
        if (RESOLVE && compat.status === 'REVIEW') {
          const stillMissing = compat.hardMissing.length + compat.missingDomIds.length;
          if (stillMissing === 0) {
            console.log(`             ↳ ✅ All warnings resolvable — will pull deps automatically`);
          }
        }
      }

      // Report resolved deps
      if (RESOLVE && toResolve.size) {
        console.log(`\n  🔗 --resolve will auto-pull ${toResolve.size} dep(s):`);
        for (const name of toResolve.keys()) console.log(`     + ${name}`);
        reportLines.push(`\n  --resolve: pulling ${toResolve.size} dep(s): ${[...toResolve.keys()].join(', ')}`);
      }

      // Merge resolved deps into added list so they get applied below
      if (RESOLVE && APPLY) {
        for (const [name, body] of toResolve) {
          if (!added.some(a => a.name === name) && !changed.some(c => c.name === name)) {
            added.push({ name, body, resolvedDep: true });
          }
        }
      }

      console.log('');
    }

    // Summarize counts
    const skipCount   = COMPAT
      ? [...changed, ...added].filter(c =>
          analyzeCompat(c.newBody ?? c.body, srcFns, currentTmarFns, tmarWorking).status === 'SKIP'
        ).length
      : 0;

    console.log(`  Changed: ${changed.length}   New: ${added.length}   Skip (hard-missing deps): ${skipCount}\n`);
    reportLines.push(`  ${srcName} — Changed: ${changed.length}  New: ${added.length}  Skip: ${skipCount}`);

    if (!changed.length && !added.length) {
      console.log(`  ✅ No differences — TMAR is in sync with ${srcName}\n`);
      reportLines.push('  No differences.\n');
    }

    // ── apply changed ────────────────────────────────────────────────────────
    if (changed.length && APPLY) {
      console.log(`  Applying changes…`);
      for (const c of changed) {
        const compat = COMPAT
          ? analyzeCompat(c.newBody, srcFns, currentTmarFns, tmarWorking)
          : { status: 'SAFE', warnings: [] };

        if (compat.status === 'SKIP') {
          console.log(`     🔴 SKIP  ~ ${c.name}  (hard-missing deps — manual review needed)`);
          reportLines.push(`  CHANGED SKIPPED (hard deps): ${c.name}`);
          continue;
        }

        // Without --include-review, skip REVIEW functions — they likely have DOM/window
        // dependencies that differ between source and TMAR HTML structure.
        if (compat.status === 'REVIEW' && !INCLUDE_REVIEW) {
          console.log(`     🟡 REVIEW ~ ${c.name}  (skipped — use --include-review to apply)`);
          reportLines.push(`  CHANGED REVIEW-SKIPPED: ${c.name}`);
          continue;
        }

        let apply = YES_ALL;
        if (!apply && rl) {
          const reviewNote = compat.status === 'REVIEW' ? ' [REVIEW — see warnings]' : '';
          const ans = await rl.question(`     ${statusLabel(compat.status)} ~ ${c.name}${reviewNote} apply? [y/N] `);
          apply = ans.trim().toLowerCase() === 'y';
        } else if (YES_ALL) {
          console.log(`     ${statusLabel(compat.status)} ~ ${c.name}`);
        }

        if (apply) {
          const result = applyChange(tmarWorking, c.name, c.newBody);
          if (result) {
            tmarWorking = result;
            appliedCount++;
            reportLines.push(`  CHANGED (applied): ${c.name}`);
          } else {
            console.log(`     ⚠️   Could not locate ${c.name} in TMAR`);
            reportLines.push(`  CHANGED (locate failed): ${c.name}`);
          }
        } else {
          reportLines.push(`  CHANGED (skipped): ${c.name}`);
        }
      }
      console.log('');
    }

    // ── apply new / resolved deps ────────────────────────────────────────────
    if (added.length && APPLY) {
      console.log(`  Adding new functions…`);
      for (const a of added) {
        const compat = COMPAT
          ? analyzeCompat(a.body, srcFns, currentTmarFns, tmarWorking)
          : { status: 'SAFE', warnings: [] };

        if (compat.status === 'SKIP') {
          console.log(`     🔴 SKIP  + ${a.name}  (hard-missing deps)`);
          reportLines.push(`  NEW SKIPPED (hard deps): ${a.name}`);
          continue;
        }

        // Skip REVIEW new functions unless --include-review (they may shadow TMAR functions
        // defined as expressions/arrows that extractFunctions might not have detected)
        if (compat.status === 'REVIEW' && !INCLUDE_REVIEW && !a.resolvedDep) {
          console.log(`     🟡 REVIEW + ${a.name}  (skipped — use --include-review to add)`);
          reportLines.push(`  NEW REVIEW-SKIPPED: ${a.name}`);
          continue;
        }

        const depTag = a.resolvedDep ? ' [auto-resolved dep]' : '';
        let apply = YES_ALL || a.resolvedDep;
        if (!apply && rl) {
          const ans = await rl.question(`     ${statusLabel(compat.status)} + ${a.name}${depTag} add? [y/N] `);
          apply = ans.trim().toLowerCase() === 'y';
        } else if (YES_ALL || a.resolvedDep) {
          console.log(`     ${statusLabel(compat.status)} + ${a.name}${depTag}`);
        }

        if (apply) {
          tmarWorking = appendFunction(tmarWorking, a.body, srcName);
          appliedCount++;
          reportLines.push(`  NEW (${a.resolvedDep ? 'dep-resolved' : 'added'}): ${a.name}`);
        } else {
          reportLines.push(`  NEW (skipped): ${a.name}`);
        }
      }
      console.log('');
    }

    // Only stamp the source hash as synced when --apply actually ran.
    // Dry runs update lastChecked only, so the banner keeps showing until
    // changes are genuinely applied.
    if (APPLY && appliedCount > 0) {
      fingerprint.sources[srcName] = {
        hash:      newHash,
        tabCount:  (srcHtml.match(/id="tab-/g) || []).length,
        version:   (srcHtml.match(/v\d+\.\d+/) || ['unknown'])[0],
        checkedAt: new Date().toISOString(),
      };
    }
  }

  if (rl) rl.close();

  // ── gate verification ─────────────────────────────────────────────────────
  const gateCheck = verifyBuildPromptGate(tmarWorking);
  if (!gateCheck.ok) {
    const missingList = gateCheck.missing.join(', ');
    const message = `Prompt gate verification failed: ${gateCheck.reason} (${missingList})`;

    reportLines.push(`\nVERIFY FAIL: ${message}`);

    if (APPLY) {
      fs.writeFileSync(REPORT_FILE, reportLines.join('\n'), 'utf8');
      console.error(`\n❌  ${message}`);
      console.error('Sync aborted. buildFullSystemPrompt must retain gate tokens.');
      process.exit(1);
    } else {
      console.warn(`\n⚠️   ${message}`);
      console.warn('(Dry run — gate check failed but not aborting without --apply)\n');
    }
  }

  // ── output ────────────────────────────────────────────────────────────────
  console.log('═'.repeat(48));

  if (APPLY && appliedCount > 0) {
    fs.writeFileSync(TMAR_FILE, tmarWorking, 'utf8');
    console.log(`\n💾  TMAR-Accrual-Ledger.html saved (${appliedCount} change(s))`);
    reportLines.push(`\nApplied ${appliedCount} change(s)`);
    fingerprint.driftDetected = false;
    fingerprint.driftSummary  = '';
  } else if (APPLY) {
    console.log('\n⏭️   No changes applied.');
  } else {
    console.log('\n💡  Dry run — no files modified.');
    if (!COMPAT)  console.log('    Add --compat to see compatibility analysis per function.');
    if (!RESOLVE) console.log('    Add --resolve to auto-pull missing dependencies from source.');
    console.log('    Add --apply  to write changes.');
  }

  fingerprint.lastChecked = new Date().toISOString();
  fs.writeFileSync(FINGERPRINT_FILE, JSON.stringify(fingerprint, null, 2), 'utf8');
  console.log('📝  parity-fingerprint.json updated');

  fs.writeFileSync(REPORT_FILE, reportLines.join('\n'), 'utf8');
  console.log(`📋  Report → scripts/parity-sync-report.txt`);

  if (APPLY && appliedCount > 0) {
    console.log('\nNext:');
    console.log('  git add TMAR-Accrual-Ledger.html parity-fingerprint.json');
    console.log('  git commit -m "sync: parity update from redressright.me"');
    console.log('  git push origin master\n');
  }
  console.log('');
}

main().catch(e => { console.error('\n❌  Fatal:', e.message); process.exit(1); });
