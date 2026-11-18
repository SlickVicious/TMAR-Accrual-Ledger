# TMAR Custom Functions - Reference Card Index

**Total Functions:** 22  
**All Implemented:** ✅  
**Coverage:** 100%  
**Last Updated:** April 7, 2026

---

## Quick Index

### Chat & Communication (3)
1. [sendQuick()](./01_sendQuick.md) - ⚡ CRITICAL - Quick-send predefined questions (12 calls)
2. [eeonSendChat()](./02_eeonSendChat.md) - EoN sidebar chat submission
3. [exportAllHistory()](./03_exportAllHistory.md) - Export chat/research history

### Memory & Storage (3)
4. [clearMemory()](./04_clearMemory.md) - Clear agent conversation memory
5. [mem0ClearAll()](./05_mem0ClearAll.md) - Clear all GCMemory (Settings button)
6. [exportBackup()](./06_exportBackup.md) - Full localStorage backup export

### Settings & Preferences (3)
7. [savePrefs()](./07_savePrefs.md) - Save user preferences
8. [refreshOllamaModels()](./08_refreshOllamaModels.md) - Detect installed Ollama models
9. [testSyncConnection()](./09_testSyncConnection.md) - Test Google Sheets sync

### Voice & Speech (4)
10. [toggleVoiceMic()](./10_toggleVoiceMic.md) - Toggle voice microphone
11. [toggleAgentSTT()](./11_toggleAgentSTT.md) - Toggle speech-to-text
12. [toggleAgentTTS()](./12_toggleAgentTTS.md) - Toggle text-to-speech
13. [speakTTS()](./13_speakTTS.md) - TTS playback function

### Utilities (4)
14. [genPW()](./14_genPW.md) - Generate secure password
15. [addCalEvent()](./15_addCalEvent.md) - Create calendar events
16. [addVaultEntry()](./16_addVaultEntry.md) - Add encrypted vault entries (+ key injection v1.1)
17. [unlockVault()](./17_unlockVault.md) - Unlock vault with password (+ key injection v1.1)

### API Key Management (1)
18. [TmarKeyManager (tmar-key-manager.js)](./18_tmarKeyManager.md) - Standalone floating key manager panel

### Digital File Cabinet (4)
19. [dfcTab()](./19_dfcTab.md) - Switch between Vault/Sheets/Local tabs
20. [dfcSyncSheets()](./20_dfcSyncSheets.md) - Pull Google Sheets workbook data via GAS
21. [dfcShowSheetInPanel()](./21_dfcShowSheetInPanel.md) - Navigate to DFC Sheets tab from other pages
22. [dfcRenderVault()](./22_dfcRenderVault.md) - Render expandable Obsidian vault tree

---

## Usage

Each reference card contains:
- Function signature and parameters
- Purpose and use cases
- Implementation code
- Call site locations
- Dependencies
- Error handling
- Testing procedures
- Enhancement opportunities

## Implementation Status

| Function | Status | Priority | Call Sites |
|----------|--------|----------|------------|
| sendQuick | ✅ | CRITICAL | 12 |
| eeonSendChat | ✅ | High | 1 |
| exportAllHistory | ✅ | Medium | 2 |
| clearMemory | ✅ | High | 1 |
| mem0ClearAll | ✅ | High | 1 |
| exportBackup | ✅ | High | 1 |
| savePrefs | ✅ | Medium | 1 |
| refreshOllamaModels | ✅ | Medium | 1 |
| testSyncConnection | ✅ | High | 1 |
| toggleVoiceMic | ✅ | Medium | 1 |
| toggleAgentSTT | ✅ | Medium | 1 |
| toggleAgentTTS | ✅ | Medium | 1 |
| speakTTS | ✅ | Medium | 1 |
| genPW | ✅ | Low | 1 |
| addCalEvent | ✅ | Medium | 1 |
| addVaultEntry | ✅ | High | 1 |
| unlockVault | ✅ | High | 1 |
| TmarKeyManager | ✅ | High | external module |
| dfcTab | ✅ | Medium | 3 |
| dfcSyncSheets | ✅ | High | 2 |
| dfcShowSheetInPanel | ✅ | Medium | 2 |
| dfcRenderVault | ✅ | Medium | 2 |

**Total:** 22/22 (100%)

---

## File Location

```
TMAR/
├── Function_Reference_Cards/
│   ├── README.md (this file)
│   ├── 01_sendQuick.md
│   ├── 02_eeonSendChat.md
│   ├── 03_exportAllHistory.md
│   ├── 04_clearMemory.md
│   ├── 05_mem0ClearAll.md
│   ├── 06_exportBackup.md
│   ├── 07_savePrefs.md
│   ├── 08_refreshOllamaModels.md
│   ├── 09_testSyncConnection.md
│   ├── 10_toggleVoiceMic.md
│   ├── 11_toggleAgentSTT.md
│   ├── 12_toggleAgentTTS.md
│   ├── 13_speakTTS.md
│   ├── 14_genPW.md
│   ├── 15_addCalEvent.md
│   ├── 16_addVaultEntry.md
│   ├── 17_unlockVault.md
│   ├── 18_tmarKeyManager.md
│   ├── 19_dfcTab.md
│   ├── 20_dfcSyncSheets.md
│   ├── 21_dfcShowSheetInPanel.md
│   └── 22_dfcRenderVault.md
```
