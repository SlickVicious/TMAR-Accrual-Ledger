
Good call — that's sitting completely unused. Let me build a practical script library and wire it up.Now wire it all up in the Templater config:Let me verify everything landed clean:All wired up. After restarting Obsidian (or toggling Templater off/on), you'll have 8 functions available via `tp.user.*` in any template or inline Templater expression:

|Function|What It Does|Example Call|
|---|---|---|
|**`genDocId`**|Unique legal document IDs with auto-increment|`<% tp.user.genDocId(tp, "TRUST") %>` → `LDG-TRUST-20260226-001`|
|**`binderSection`**|Maps category to Master Binder section (or shows picker)|`<% tp.user.binderSection(tp, "tax") %>` → `04-Tax-Forms`|
|**`vaultStats`**|Full vault metrics — files, types, tags, sizes|`<% tp.user.vaultStats(tp) %>` for table, `"summary"` for one-liner|
|**`skillIndex`**|Auto-generates registry table of all Claude skills|`<% tp.user.skillIndex(tp) %>` or `"active"` to filter|
|**`findRelated`**|Finds files by tag, type, category, status, or folder|`<% tp.user.findRelated(tp, "tag", "trust-administration") %>`|
|**`autoTag`**|Suggests YAML tags from file path + content keywords|`<% tp.user.autoTag(tp, "trust EIN north carolina") %>`|
|**`statusBadge`**|Visual status indicator with emoji|`<% tp.user.statusBadge(tp, "executed", "full") %>` → `✅ **Executed** — Document has been signed...`|
|**`quickNav`**|Breadcrumbs + sibling links + parent folder|`<% tp.user.quickNav(tp) %>` for full nav block|

Every function uses the Obsidian `app.vault` and `app.metadataCache` APIs directly, so they read live vault data — no external dependencies needed. The `autoTag` function has 30+ path rules mapped specifically to your folder hierarchy (YTubiversity educators, Master Binder sections, Generated-Documents categories, ClaudeSkills, etc.).