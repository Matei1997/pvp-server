# server/modules

**Ownership:** Reusable server modules that can be shared across modes.

**Belongs here:**
- Chat.module.ts
- Attachments.module.ts
- Other cross-cutting modules (voice, vehicles, etc.)

**Does NOT belong here:**
- Arena match logic → `server/arena/` or `server/modes/hopouts/`
- Mode-specific systems → `server/modes/*/`
