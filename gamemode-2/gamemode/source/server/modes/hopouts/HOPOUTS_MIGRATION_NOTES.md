# Hopouts Containment Migration Notes

Summary of the conservative Hopouts containment refactor. No gameplay changes, no behavior changes — ownership and structure only.

## Files Moved to `source/server/modes/hopouts/`

| File | Role | Notes |
|------|------|-------|
| `ArenaConfig.ts` | Hopouts balance constants | Rounds, zone phases, weapon rotation, vehicle pool, item config |
| `ArenaPresets.asset.ts` | Arena preset JSON load/save | Reads/writes `data/arenas.json` |
| `ZoneSystem.ts` | Shrinking zone + OOB damage | Hopouts-specific; only this mode uses zones |
| `ArenaMatch.manager.ts` | Match lifecycle, rounds, spawning | Core match state machine |
| `Arena.module.ts` | Queue, lobby, voting, match launch | Queue + voting + CEF bridge |

## Wrappers Created (in `source/server/arena/`)

All original arena files are now thin re-exports. External code continues to use `@arena/*` — no import changes required.

| Wrapper | Re-exports from |
|---------|-----------------|
| `ArenaConfig.ts` | `../modes/hopouts/ArenaConfig` |
| `ArenaPresets.asset.ts` | `../modes/hopouts/ArenaPresets.asset` |
| `ZoneSystem.ts` | `../modes/hopouts/ZoneSystem` |
| `ArenaMatch.manager.ts` | `../modes/hopouts/ArenaMatch.manager` |
| `Arena.module.ts` | `../modes/hopouts/Arena.module` |

## Files Left in Place

| File | Reason |
|------|--------|
| `arena/WeaponPresets.service.ts` | Used by loadout CEF (main menu) + arena; shared loadout module. Candidate for `server/modules/loadout/` later. |
| `arena/WeaponAttachments.data.ts` | Pure data; used by WeaponPresets.service. Could move to `data/weapons/` in a later pass. |
| `arena/ArenaPreset.interface.ts` | Re-export wrapper for `@shared/interfaces/ArenaPreset.interface` (from prior pass). |
| `serverevents/Arena.event.ts` | CEF handlers; stays in serverevents. Imports from `@arena/*`. |
| `serverevents/Death.event.ts` | Mode-agnostic death router. Imports from `@arena/ArenaMatch.manager`. |
| `serverevents/DamageSync.event.ts` | Server-authoritative damage; arena + freeroam. Imports from `@arena/ArenaMatch.manager`. |

## Remaining Coupling

1. **WeaponPresets.service** — Hopouts ArenaMatch imports from `../../arena/WeaponPresets.service`. This creates a dependency from hopouts → arena. Acceptable for now; WeaponPresets is a shared loadout module.

2. **@arena path** — All external imports still use `@arena/*`. The arena folder is the compatibility facade. Future: external code could migrate to `@hopouts/*` or a similar path.

3. **Death/DamageSync events** — Import from `@arena/ArenaMatch.manager`. The wrapper resolves to hopouts; no change needed.

## Pieces That Look Generic (Extract Later)

| Piece | Current Location | Future Target |
|-------|------------------|---------------|
| Queue join/leave/size logic | Arena.module.ts | Generic `QueueManager` or `MatchmakingManager` |
| Match state machine (warmup → active → round_end → match_end) | ArenaMatch.manager.ts | Generic `MatchManager` |
| Team split (red/blue) | Arena.module.ts launchMatch | Mode-specific; Hopouts uses alternating split |
| Map voting | Arena.module.ts | Hopouts-specific; FFA/Gun Game may not vote |
| Zone shrinking | ZoneSystem.ts | Hopouts-only; keep under hopouts |
| Weapon rotation per round | ArenaMatch.manager.ts | Hopouts-specific; Gun Game would use per-kill progression |
| Consumable cast (medkit/plate) | Arena.event.ts | Hopouts-specific |

## Build Status

`npm run build:all` — **PASSED** (server, client, CEF).
