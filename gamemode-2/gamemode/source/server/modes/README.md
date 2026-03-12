# server/modes

**Ownership:** Game mode implementations (Hopouts, FFA, Gun Game, Freeroam).

**Structure:**
- `hopouts/` — Shrinking zone PvP (queue, voting, rounds, consumables)
- `ffa/` — Free-for-all (future)
- `gungame/` — Gun Game progression (future)
- `freeroam/` — Freeroam / shooting range (future)

**Belongs here:**
- ZoneSystem (Hopouts-specific) — keep under `hopouts/` for now
- Mode config, voting logic, weapon rotation
- Mode-specific event handlers

**Does NOT belong here:**
- Generic queue/match logic — extract to `server/modules/` in later passes
- Shared database/entities → `server/database/`
