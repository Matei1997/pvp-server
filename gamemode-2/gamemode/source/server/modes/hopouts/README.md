# server/modes/hopouts

**Ownership:** Hopouts PvP mode — queue, map voting, rounds, shrinking zone, consumables.

**Belongs here (when migrated):**
- ZoneSystem.ts
- ArenaConfig.ts (Hopouts balance)
- Hopouts-specific event handlers
- Arena match logic (ArenaMatch.manager.ts) — candidate for later migration

**Note:** Arena files currently live in `server/arena/`. Migrate here in later passes. ZoneSystem stays under hopouts per architecture decision, not `server/modules/zone`.
