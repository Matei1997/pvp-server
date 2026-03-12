# server/core

**Ownership:** Generic server infrastructure used across all modes.

**Belongs here:**
- CEFEvent, Command, Chat, Point (generic utilities)
- Player prototype extensions
- API/namespace bootstrap
- Any mode-agnostic server utilities

**Does NOT belong here:**
- Arena/Hopouts-specific logic → `server/modes/hopouts/`
- Database entities → `server/database/`
- Mode-specific event handlers → `server/modes/*/`
