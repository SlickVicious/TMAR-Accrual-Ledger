# API Patterns
- Load this file when adding or changing LLM calls, CORS proxy config, provider routing, or agent dispatch.
- Preserve backward compatibility unless the user approves breaking changes.
- Validate inputs close to the boundary; return concise, consistent error shapes.

## LLM Call Stack

**Primary function:** `callLLMStream()` (v7.1) in `TMAR-Accrual-Ledger.html`
- Multi-provider SSE/NDJSON streaming
- 15-minute AbortController timeout
- All browser calls **must** route through the Cloudflare Worker CORS proxy — never call Anthropic directly from GitHub Pages

**High-level agent dispatchers (all ultimately call `callLLMStream`):**
- `aiHubAskAgent(prompt, category)` — general hub; prepends category prefix to prompt
- `trustAgentQ(question)` — Trust estate specialist
- `ukAgentQuery(question)` — UK accounting / FRS 102 specialist
- `askAgent(prompt)` — generic dispatcher; streams into `#chatInput` then calls `eonChatSend()`
- `sendTrustAgentQuery()` — Trust Accounting Agent tab (`#tmar-trust-input`). **Not** `trustAgentQ`;
  this is the function the tab's Send button actually calls
- `sendChat()` — voice-chat panel (`#vc-input`)
- `doSearch()` — Search tab
- `AP.send(section)` — the shared agent-panel chat used by the Research / Agents tabs

**Every LLM call must go through `callLLMStream()` (agents) or `pdkbCallLLM()` (PDKB tools:
Transcript Transformer, Etymology Analyzer).** Both resolve the provider via `resolveProvider()`.
Do not hand-roll a `fetch` to `/v1/messages` with `x-api-key` — that hardcodes Anthropic and
silently ignores the user's provider selection. Until 2026-07-14 five tools did exactly that
(transformer, etymology, trust agent, search, voice chat), so picking DeepSeek still billed the
Anthropic account and failed with "credit balance is too low". Fixed in `6c23300` + follow-up.
`max_tokens` is per-provider — always take it from `maxOutputTokens(pid)`, never a literal.

## CORS Proxy

- Worker file: `cloudflare-worker-v2.js` deployed to workers.cloudflare.com
- Route 1: `/v1/*` → Anthropic API (strips Origin/Referer, injects `anthropic-dangerous-direct-browser-access`)
- Route 2: `?url=<encoded>` → generic CORS pass-through (redressright.me only)
- Proxy URL is user-configured: Settings → API Keys → CORS Proxy URL → saved in localStorage
- **Never hardcode the worker URL** in source; always read from settings

## Provider Routing (`resolveProvider()`)

Key lookup order per provider:
1. `eeon_key_claude` → `stg_key_claude` → `tmar_claude_key` → `window._trustApiKey`
2. `eeon_key_openai` (OpenAI/GPT-4)
3. `eeon_key_deepseek` (DeepSeek)
4. `eeon_key_xai` (xAI / Grok)
5. `ev2_sam_api_key` (alternate pattern)

Supported providers: Anthropic (Claude), OpenAI, DeepSeek, Z.AI (GLM), Kimi/Moonshot, xAI, Ernie/Baidu, Ollama (local).

Current Anthropic model string: `claude-sonnet-4-20250514` — update this string when the model changes.

## Request Body Shape

```json
{
  "model": "claude-sonnet-4-20250514",
  "messages": [...],
  "max_tokens": <number>,
  "system": "<system prompt>",
  "stream": true,
  "temperature": <number>
}
```

## Error Handling

- Try-catch with user `alert()` on failure; no automatic retry logic
- Missing API key → alert + block action before fetch
- Failures are final — do not add silent swallows

## Agents (OpenClawRuntime SYPHER-7.8-HARDLOCK)

19 registered agents total: GAAPCLAW Master + 6 CPA firms × 3 sub-agents each (Tax Compliance, Financial Reporting, Audit & Advisory).
Runtime objects are **frozen** (`Object.freeze`) — never mutate agent registry at runtime.
Memory backed by `GCMemory` (IndexedDB, 60+ legal/financial keywords, auto-prune at 500 records).
`MEM0` is a proxy alias to `GCMemory`; always enabled.

## GAS Web App Endpoint

- Exec URL: `https://script.google.com/macros/s/AKfycbzpeegvE52lvqCTMyKrsdaa_4JFfjM6MQrsJkU8zb17fkUJzPRasUU0fjONdaHkM5dh/exec`
- Actions passed as JSON body `{action, payload}` in POST, or query params in GET
- Defined in `gas/SyncCenter.gs` `doGet()` / `doPost()` handlers

## Text-to-Speech (Gemini Neural) — `GEMINI_TTS`

- Module: `GEMINI_TTS` IIFE in `TMAR-Accrual-Ledger.html` (defined just after `speakTTS`).
- Calls Google **directly** (not the Anthropic CORS proxy — Gemini returns CORS `*`):
  `POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent?key=<key>`
  with `generationConfig.responseModalities:["AUDIO"]` and
  `speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName`.
- Response audio: base64 PCM (signed 16-bit LE, mono, 24 kHz) at
  `candidates[0].content.parts[0].inlineData.data`. The module wraps it in a WAV header (`pcmToWav`)
  and plays via `new Audio()`. Long text is auto-chunked on sentence boundaries.
- Models (fallback chain): `gemini-2.5-flash-preview-tts` (default) → `gemini-3.1-flash-tts-preview`.
- Key resolution order: `eeon_key_gemini` → `tmar_gemini_tts_key` → `eeon_key_google` →
  `stg_key_gemini` → `eeon_key_zai`. **Gotcha:** the vault `_VAULT_SITE_MAP` maps both `gemini` and
  `zai` to `eeon_key_zai`; the Settings → Voice key field writes `eeon_key_gemini` directly.
- localStorage: `tmar_tts_engine` (`gemini`|`system`, default `gemini`), `tmar_gemini_tts_voice`
  (default `Charon`), `tmar_gemini_tts_model`. On missing key/error it falls back to Web Speech.
- Wired into `speakWithHighlight`, `speakTTS`, and section readers; all Stop buttons call `GEMINI_TTS.stop()`.

## Fiduciary Document Standard injection — `DOCUMENT_KNOWLEDGE.fiduciaryDocFactory`

- Distilled from `.claude/skills/fiduciary-doc-factory/` (the source of truth — keep both in sync).
  Plain prose only (no markdown) so it passes `HARD_LOCK`.
- `buildFullSystemPrompt()` appends it to **every** agent (framed inert unless drafting a document),
  after the MEM0 block and before `return sp` — the SYPHER gate tokens stay first.
- `getSystemPrompt('doc_creation')` / `getSystemPrompt('doc_format')` embed it as the firm mandate.
- The Document Creator tab applies Profile B on export (`FIDUCIARY_PROFILE_B_CSS`,
  `applyFiduciaryStandard()`).
