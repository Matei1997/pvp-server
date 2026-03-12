# shared

**Ownership:** Types, interfaces, enums, constants, DTOs used by both client and server.

**Structure:**
- `enums/` — Shared enums (NotifyType, ADMIN_LEVELS, etc.)
- `constants/` — Shared constants
- `events/` — CEF event name strings
- `dto/` — Data transfer types (CefData)
- `interfaces/` — Shared interfaces (IArenaPreset, etc.)
- `schemas/` — Validation schemas
- `config/` — Shared config defaults

**Current:** Most types live in `index.ts`. Split into focused files in later passes.
