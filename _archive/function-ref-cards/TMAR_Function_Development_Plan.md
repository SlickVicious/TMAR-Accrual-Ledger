# TMAR Custom Functions - Full Implementation Plan

## Overview
17 custom functions requiring full implementation with persistence, error handling, and integration with existing TMAR systems.

---

## Phase 1: Chat & Communication Functions (3 functions)

### 1. sendQuick() - ⚡ HIGHEST PRIORITY
**Priority:** Critical (12 call sites)
**Purpose:** Send predefined questions to chat agent
**Implementation:**
- [x] Basic implementation complete
- [ ] Add chat history persistence
- [ ] Integrate with GCMemory system
- [ ] Add loading states
- [ ] Error handling with retry logic

**Dependencies:** sendChat(), eeonSendChat(), chat-input element

**Testing:** Click any of 12 quick buttons on Trust Agent page

---

### 2. eeonSendChat()
**Priority:** High (1 call site)
**Purpose:** EoN sidebar chat submission handler
**Implementation:**
- [x] Basic implementation complete
- [ ] Add message queuing
- [ ] Implement typing indicators
- [ ] Add message persistence
- [ ] Integrate with agent memory

**Dependencies:** sendChat(), chat-input, chat-messages

**Testing:** Type message in chat and click SEND

---

### 3. exportAllHistory()
**Priority:** Medium (2 call sites)
**Purpose:** Export complete chat/research history
**Implementation:**
- [x] Basic implementation complete
- [ ] Add filtering by date range
- [ ] Include agent metadata
- [ ] Add export format options (JSON/CSV)
- [ ] Compress large exports

**Dependencies:** localStorage (chatHistory, researchHistory)

**Testing:** Click export history button

---

## Phase 2: Memory & Storage Functions (3 functions)

### 4. clearMemory()
**Priority:** High
**Purpose:** Clear agent conversation memory
**Implementation:**
- [x] Basic implementation complete
- [ ] Add selective clearing (by agent)
- [ ] Create memory snapshots before clearing
- [ ] Add undo capability (restore last cleared)
- [ ] Update UI memory indicators

**Dependencies:** GCMemory system, localStorage

**Testing:** Confirm dialog and verify memory cleared

---

### 5. mem0ClearAll()
**Priority:** High (Settings button)
**Purpose:** Clear all agent memories from Settings page
**Implementation:**
- [x] Basic implementation complete
- [ ] Show memory size before clearing
- [ ] Create auto-backup before clearing
- [ ] Add progress indicator for large clears
- [ ] Log clearing event

**Dependencies:** clearMemory()

**Testing:** Settings > GCMemory section > Clear All Memories

---

### 6. exportBackup()
**Priority:** High
**Purpose:** Full localStorage backup export
**Implementation:**
- [x] Basic implementation complete
- [ ] Add compression (zip)
- [ ] Include version metadata
- [ ] Add import/restore function
- [ ] Schedule automatic backups

**Dependencies:** localStorage

**Testing:** Backup > Export Backup button

---

## Phase 3: Settings & Preferences Functions (3 functions)

### 7. savePrefs()
**Priority:** Medium
**Purpose:** Save user preferences to localStorage
**Implementation:**
- [x] Basic implementation complete
- [ ] Create full preferences schema
- [ ] Add validation
- [ ] Implement preferences UI
- [ ] Add export/import preferences
- [ ] Sync across tabs

**Schema:**
```javascript
{
  theme: 'dark' | 'light',
  autoSave: boolean,
  voiceEnabled: boolean,
  ttsEnabled: boolean,
  defaultAgent: string,
  apiProvider: string,
  fontSize: number,
  language: string,
  timezone: string
}
```

**Dependencies:** localStorage

**Testing:** Preferences page > Save Preferences

---

### 8. refreshOllamaModels()
**Priority:** Medium
**Purpose:** Fetch and display installed Ollama models
**Implementation:**
- [x] Basic implementation complete
- [ ] Add model details (size, parameters)
- [ ] Show model capabilities
- [ ] Add model download option
- [ ] Cache model list (5 min TTL)

**Dependencies:** Ollama API (http://127.0.0.1:11434)

**Testing:** Settings > Ollama section > Refresh Models

---

### 9. testSyncConnection()
**Priority:** High
**Purpose:** Test Google Sheets sync connection
**Implementation:**
- [ ] **NEEDS FULL IMPLEMENTATION**
- [ ] Connect to Google Sheets API
- [ ] Test read/write permissions
- [ ] Display connection status
- [ ] Show last sync timestamp
- [ ] Verify credentials

**Dependencies:** Google Sheets API, service account credentials

**Testing:** Settings > Sync section > Test Connection

---

## Phase 4: Voice & Speech Functions (4 functions)

### 10. toggleVoiceMic()
**Priority:** Medium
**Purpose:** Toggle voice microphone recording
**Implementation:**
- [x] Basic implementation complete
- [ ] **ENHANCE WITH WEB SPEECH API**
- [ ] Add microphone permissions check
- [ ] Show audio level indicator
- [ ] Add noise cancellation
- [ ] Implement voice activity detection

**Dependencies:** Web Speech API, navigator.mediaDevices

**Testing:** Voice Center > Click microphone button

---

### 11. toggleAgentSTT()
**Priority:** Medium
**Purpose:** Toggle speech-to-text for agents
**Implementation:**
- [x] Basic implementation complete
- [ ] **ENHANCE WITH WEB SPEECH API**
- [ ] Add language selection
- [ ] Show transcription in real-time
- [ ] Add confidence scores
- [ ] Support continuous recognition

**Dependencies:** Web Speech API (SpeechRecognition)

**Testing:** Trust Agent > Speak button

---

### 12. toggleAgentTTS()
**Priority:** Medium
**Purpose:** Toggle text-to-speech playback
**Implementation:**
- [x] Basic implementation complete
- [ ] Add voice selection
- [ ] Add speed/pitch controls
- [ ] Show playback progress
- [ ] Add pause/resume
- [ ] Queue multiple utterances

**Dependencies:** Web Speech API (SpeechSynthesis)

**Testing:** Trust Agent > TTS ON/OFF button

---

### 13. speakTTS()
**Priority:** Medium
**Purpose:** Speak text using TTS
**Implementation:**
- [x] Basic implementation complete
- [ ] Add SSML support
- [ ] Highlight text as spoken
- [ ] Add voice caching
- [ ] Error recovery
- [ ] Support multiple languages

**Dependencies:** SpeechSynthesisUtterance

**Testing:** Programmatically call with text

---

## Phase 5: Utility Functions (4 functions)

### 14. genPW()
**Priority:** Low
**Purpose:** Generate secure password
**Implementation:**
- [x] Basic implementation complete
- [ ] Add password strength options
- [ ] Add pattern options (symbols, length)
- [ ] Show strength indicator
- [ ] Store in vault option
- [ ] Generate passphrase option

**Dependencies:** crypto.getRandomValues

**Testing:** Settings > Generate Password button

---

### 15. addCalEvent()
**Priority:** Medium
**Purpose:** Add calendar event
**Implementation:**
- [ ] **NEEDS FULL IMPLEMENTATION**
- [ ] Create calendar events schema
- [ ] Implement event form modal
- [ ] Add recurring events support
- [ ] Send reminders
- [ ] Export to .ics format
- [ ] Integrate with Google Calendar

**Schema:**
```javascript
{
  id: string,
  title: string,
  description: string,
  start: Date,
  end: Date,
  location: string,
  attendees: string[],
  reminders: number[],
  recurring: { frequency, until }
}
```

**Dependencies:** localStorage, Google Calendar API (optional)

**Testing:** Calendar > Add Event button

---

### 16. addVaultEntry()
**Priority:** High
**Purpose:** Add encrypted entry to vault
**Implementation:**
- [ ] **NEEDS FULL IMPLEMENTATION**
- [ ] Implement encryption (AES-256)
- [ ] Create vault entry form
- [ ] Add categories/tags
- [ ] Implement search
- [ ] Add file attachments
- [ ] Add version history

**Schema:**
```javascript
{
  id: string,
  title: string,
  content: string (encrypted),
  category: string,
  tags: string[],
  created: Date,
  modified: Date,
  attachments: File[]
}
```

**Dependencies:** Web Crypto API, localStorage

**Testing:** Vault > Add Entry button

---

### 17. unlockVault()
**Priority:** High
**Purpose:** Unlock vault with password
**Implementation:**
- [x] Basic implementation complete
- [ ] Implement proper key derivation (PBKDF2)
- [ ] Add biometric unlock option
- [ ] Add auto-lock timer
- [ ] Add wrong password attempts limit
- [ ] Show vault contents after unlock
- [ ] Implement session management

**Dependencies:** Web Crypto API, localStorage

**Testing:** Vault > Unlock button

---

## Implementation Priority Order

### Sprint 1 (Critical - Day 1)
1. ✅ sendQuick() - Enhance with history
2. ✅ eeonSendChat() - Add queuing
3. 🔨 testSyncConnection() - Full implementation
4. 🔨 addVaultEntry() - Full implementation with encryption

### Sprint 2 (High - Day 2)
5. 🔨 unlockVault() - Enhance security
6. ✅ mem0ClearAll() - Add backup
7. ✅ clearMemory() - Add selective clearing
8. ✅ exportBackup() - Add compression

### Sprint 3 (Medium - Day 3)
9. 🔨 addCalEvent() - Full implementation
10. ✅ savePrefs() - Create full schema
11. ✅ refreshOllamaModels() - Add caching
12. 🔨 Voice functions - Enhance with Web Speech API

### Sprint 4 (Polish - Day 4)
13. ✅ exportAllHistory() - Add filtering
14. ✅ genPW() - Add strength options
15. Testing & documentation
16. Create reference cards

---

## Testing Strategy

### Unit Tests
- Each function tested individually
- Mock dependencies
- Test error conditions

### Integration Tests
- Test function interactions
- Verify localStorage operations
- Test API connections

### UI Tests
- Click all buttons
- Verify UI updates
- Test error messages

### Security Tests
- Encryption strength
- Password security
- XSS prevention

---

## Documentation Requirements

### For Each Function
1. Reference card in vault (Markdown)
2. JSDoc comments
3. Usage examples
4. Error codes
5. Dependencies list

### Vault Reference Card Template
```markdown
# Function Name: functionName()

## Purpose
Brief description

## Signature
```javascript
function functionName(param1, param2)
```

## Parameters
- param1: Description
- param2: Description

## Returns
Return value description

## Usage Example
```javascript
// Example code
```

## Error Handling
- Error 1: Description
- Error 2: Description

## Dependencies
- Dependency 1
- Dependency 2

## Testing
How to test this function

## Implementation Notes
Technical details

## Change Log
- Date: Initial implementation
```

---

## Success Criteria

✅ All 17 functions fully implemented
✅ All functions tested and working
✅ Reference cards created in vault
✅ No console errors
✅ Security audit passed
✅ Documentation complete
✅ Committed to Git
✅ Deployed to GitHub Pages

---

**Plan Created:** March 9, 2026
**Estimated Completion:** 4 days
**Status:** Ready for execution
