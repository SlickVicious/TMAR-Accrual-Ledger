# Function Reference Cards — Master Index

**22/22 Implemented** ✅ · **Coverage: 100%** · **Last Updated: April 7, 2026**

Each card documents a function in the TMAR-Accrual-Ledger HTML app: signature, parameters, implementation code, call sites, dependencies, error handling, and testing procedures.

---

## Quick Index

### Chat & Communication (3)
| # | Function | Priority | Description |
|---|----------|----------|-------------|
| 1 | [[Function_Reference_Cards/01_sendQuick|sendQuick()]] | ⚡ CRITICAL | Quick-send predefined questions (12 call sites) |
| 2 | [[Function_Reference_Cards/02_eeonSendChat|eeonSendChat()]] | High | EEON sidebar chat submission |
| 3 | [[Function_Reference_Cards/03_exportAllHistory|exportAllHistory()]] | Medium | Export chat/research history |

### Memory & Storage (3)
| # | Function | Priority | Description |
|---|----------|----------|-------------|
| 4 | [[Function_Reference_Cards/04_clearMemory|clearMemory()]] | High | Clear agent conversation memory |
| 5 | [[Function_Reference_Cards/05_mem0ClearAll|mem0ClearAll()]] | High | Clear all GCMemory (Settings button) |
| 6 | [[Function_Reference_Cards/06_exportBackup|exportBackup()]] | High | Full localStorage backup export |

### Settings & Preferences (3)
| # | Function | Priority | Description |
|---|----------|----------|-------------|
| 7 | [[Function_Reference_Cards/07_savePrefs|savePrefs()]] | Medium | Save user preferences |
| 8 | [[Function_Reference_Cards/08_refreshOllamaModels|refreshOllamaModels()]] | Medium | Detect installed Ollama models |
| 9 | [[Function_Reference_Cards/09_testSyncConnection|testSyncConnection()]] | High | Test Google Sheets sync |

### Voice & Speech (4)
| # | Function | Priority | Description |
|---|----------|----------|-------------|
| 10 | [[Function_Reference_Cards/10_toggleVoiceMic|toggleVoiceMic()]] | Medium | Toggle voice microphone |
| 11 | [[Function_Reference_Cards/11_toggleAgentSTT|toggleAgentSTT()]] | Medium | Toggle speech-to-text |
| 12 | [[Function_Reference_Cards/12_toggleAgentTTS|toggleAgentTTS()]] | Medium | Toggle text-to-speech |
| 13 | [[Function_Reference_Cards/13_speakTTS|speakTTS()]] | Medium | TTS playback function |

### Utilities (4)
| # | Function | Priority | Description |
|---|----------|----------|-------------|
| 14 | [[Function_Reference_Cards/14_genPW|genPW()]] | Low | Generate secure password |
| 15 | [[Function_Reference_Cards/15_addCalEvent|addCalEvent()]] | Medium | Create calendar events |
| 16 | [[Function_Reference_Cards/16_addVaultEntry|addVaultEntry()]] | High | Add encrypted vault entries (+ key injection v1.1) |
| 17 | [[Function_Reference_Cards/17_unlockVault|unlockVault()]] | High | Unlock vault with password (+ key injection v1.1) |

### API Key Management (1)
| # | Module | Priority | Description |
|---|--------|----------|-------------|
| 18 | [[Function_Reference_Cards/18_tmarKeyManager|TmarKeyManager]] | High | Standalone floating key manager panel (10 providers) |

### Digital File Cabinet (4)
| # | Function | Priority | Description |
|---|----------|----------|-------------|
| 19 | [[Function_Reference_Cards/19_dfcTab|dfcTab()]] | Medium | Switch between Vault/Sheets/Local tabs (3 call sites) |
| 20 | [[Function_Reference_Cards/20_dfcSyncSheets|dfcSyncSheets()]] | High | Pull Google Sheets workbook data via GAS (2 call sites) |
| 21 | [[Function_Reference_Cards/21_dfcShowSheetInPanel|dfcShowSheetInPanel()]] | Medium | Navigate to DFC Sheets tab from other pages (2 call sites) |
| 22 | [[Function_Reference_Cards/22_dfcRenderVault|dfcRenderVault()]] | Medium | Render expandable Obsidian vault tree (2 call sites) |

---

## Implementation Status

| # | Function | Status | Priority | Call Sites |
|---|----------|--------|----------|------------|
| 1 | sendQuick | ✅ | ⚡ CRITICAL | 12 |
| 2 | eeonSendChat | ✅ | High | 1 |
| 3 | exportAllHistory | ✅ | Medium | 2 |
| 4 | clearMemory | ✅ | High | 1 |
| 5 | mem0ClearAll | ✅ | High | 1 |
| 6 | exportBackup | ✅ | High | 1 |
| 7 | savePrefs | ✅ | Medium | 1 |
| 8 | refreshOllamaModels | ✅ | Medium | 1 |
| 9 | testSyncConnection | ✅ | High | 1 |
| 10 | toggleVoiceMic | ✅ | Medium | 1 |
| 11 | toggleAgentSTT | ✅ | Medium | 1 |
| 12 | toggleAgentTTS | ✅ | Medium | 1 |
| 13 | speakTTS | ✅ | Medium | 1 |
| 14 | genPW | ✅ | Low | 1 |
| 15 | addCalEvent | ✅ | Medium | 1 |
| 16 | addVaultEntry | ✅ | High | 1 |
| 17 | unlockVault | ✅ | High | 1 |
| 18 | TmarKeyManager | ✅ | High | external module |
| 19 | dfcTab | ✅ | Medium | 3 |
| 20 | dfcSyncSheets | ✅ | High | 2 |
| 21 | dfcShowSheetInPanel | ✅ | Medium | 2 |
| 22 | dfcRenderVault | ✅ | Medium | 2 |

---

## Directory Structure

```
TMAR-Accrual-Ledger/
├── Function Reference Cards Index.md    ← this file
└── Function Reference Cards/
    ├── README.md                         ← canonical index (same content, relative links)
    ├── COMPLETE_IMPLEMENTATION_GUIDE.md  ← full implementation guide
    ├── 01_sendQuick.md
    ├── 02_eeonSendChat.md
    ├── ...
    └── 22_dfcRenderVault.md
```

The implementation guide at `Function Reference Cards/COMPLETE_IMPLEMENTATION_GUIDE.md` covers integration patterns, testing methodology, and the verification dashboard used to confirm all 22 cards.

---

*Generated from `Function Reference Cards/README.md` — that file remains the canonical source.*
