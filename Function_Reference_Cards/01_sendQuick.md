# Function: sendQuick()

**Status:** ✅ Implemented  
**Priority:** ⚡ CRITICAL (12 call sites)  
**Category:** Chat & Communication

---

## Purpose
Send predefined questions to the chat agent. Enables quick access to common queries on the Trust Agent page.

## Signature
```javascript
function sendQuick(message)
```

## Parameters
- **message** (string) - The predefined question/prompt to send to the chat agent

## Usage Example
```javascript
// Called from quick button
sendQuick('What forms does EEON Foundation need to file?')

// Manual call
sendQuick('Explain accrual accounting for financial asset recognition under Glenshaw Glass.')
```

## Implementation Details
```javascript
function sendQuick(message) {
  console.log('📤 sendQuick:', message);
  var chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.value = message;
    if (typeof eeonSendChat === 'function') {
      eeonSendChat();
    } else if (typeof sendChat === 'function') {
      sendChat();
    } else {
      console.error('No send function available');
      alert('Chat send function not available');
    }
  }
}
```

## Call Sites (12 Total)
Located on Trust Agent page (TMAR-Accrual-Ledger.html):
1. Line 24936 - "What forms to file?"
2. Line 24937 - "Analyze trial balance"
3. Line 24938 - "Glenshaw Glass standard"
4. Line 24939 - "Estimated tax"
5. Line 24940 - "NOL carryforward §172"
6. Line 24941 - "Voluntary filing"
7. Line 24942 - "Form 3800 - full flow"
8. Line 24943 - "Full tax summary"
9. Line 24944 - "Form 1041 Schedule G"
10. Line 24945 - "Full computation chain"
11. Line 24946 - "IRC §6402 refund mandate"
12. Line 24947 - "Journal doc generator"

## Dependencies
- `chat-input` element (textarea)
- `eeonSendChat()` or `sendChat()` function
- EEON chat system

## Error Handling
- Validates chat input element exists
- Falls back to sendChat() if eeonSendChat() not available
- Shows alert if no send function found
- Console logging for debugging

## Testing
1. Navigate to Trust Agent page
2. Click any of the 12 quick button prompts
3. Verify message appears in chat input
4. Verify agent responds to the query

## Enhancement Opportunities
- [ ] Add message history persistence
- [ ] Track frequently used queries
- [ ] Add custom quick buttons
- [ ] Implement message queuing

## Change Log
- **2026-03-09**: Initial implementation (v1.0)
- **Status**: ✅ Confirmed working
