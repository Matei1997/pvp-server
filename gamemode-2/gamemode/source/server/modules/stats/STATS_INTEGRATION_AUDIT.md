# Stats Integration Audit — Death, Damage, Match Result

## Source of Truth

| Concern | Source of Truth | Location |
|---------|-----------------|----------|
| **Damage** | `server:PlayerHit` → DamageSync.event.ts | Client sends hit; server applies damage, checks effectiveHp |
| **Death (arena)** | `handleArenaDeath` | ArenaMatch.manager.ts — single entry point for arena deaths |
| **Death (freeroam)** | `playerDeath` → respawnFreeroamAtLegionSquare | Death.event.ts — no stats recorded |
| **Match result** | `endMatch` | ArenaMatch.manager.ts — called once when match ends |

## Kill/Death Flow

```
[Client] playerWeaponShot → server:PlayerHit
    ↓
[DamageSync] Apply damage (effectiveHp, armour, health)
    ↓
[DamageSync] if effectiveHp <= 0 → handleArenaDeath(victim, shooter)
    ↓
[ArenaMatch] handleArenaDeath:
    - Guard: if !victimData.alive → return true (already processed)
    - Set victimData.alive = false, victimData.deaths++
    - If killer && killerTeam !== victimTeam → killerData.kills++, statsOnMatchDeath(victim, killer)
    - Else → statsOnMatchDeath(victim, undefined)
    - Spectate, emitMatchUpdate, checkRoundEnd
```

**Alternative path (engine):** RageMP `playerDeath` event may fire when health reaches 0. Death.event calls `handleArenaDeath(player, killer)`. The **duplicate guard** (`!victimData.alive`) ensures we only process once; second call returns true immediately (no stats, no respawn logic).

## Zone Death Flow

```
[ZoneSystem] tickZones (every 1s)
    ↓
[ZoneSystem] if player outside zone or OOB grace expired → handleZoneDeath(p)
    ↓
[ArenaMatch] handleZoneDeath(p) → handleArenaDeath(p, undefined)
    ↓
[ArenaMatch] statsOnMatchDeath(victim, undefined) — death only, no kill
```

## Match Result Flow

```
[checkRoundEnd or tickMatches] Team wins or round timeout
    ↓
setTimeout → endMatch(dimension)
    ↓
[ArenaMatch] endMatch:
    - Guard: if match.state === "match_end" → return (re-entry guard)
    - Set match.state = "match_end"
    - statsOnMatchEnd(winner, redTeamPlayers, blueTeamPlayers)
    - matchUnregister(dimension)
```

**Re-entry:** Second endMatch call would get `match` = undefined (already unregistered) and return. Guard handles any race where both callbacks run before unregister.

## Stats Triggers

| Event | Trigger | Stats Recorded |
|-------|---------|----------------|
| Player killed by enemy | handleArenaDeath(victim, killer) | recordDeath(victim), recordKill(killer) |
| Player killed by zone/OOB | handleArenaDeath(victim, undefined) | recordDeath(victim) only |
| Teamkill | handleArenaDeath(victim, killer) | recordDeath(victim) only — killer not passed |
| Match ends (win) | statsOnMatchEnd(winner, red, blue) | recordMatchWin(winners), recordMatchLoss(losers) |
| Match ends (draw) | statsOnMatchEnd("draw", red, blue) | recordMatchPlayed(all) |

## Safety Guards Added (Pass 4.5)

1. **Duplicate death guard:** `if (!victimData.alive) return true` — prevents double-processing when both DamageSync and playerDeath fire.
2. **Teamkill stats:** Only pass `killer` to statsOnMatchDeath when `killerTeam !== victimTeam`.
3. **Duplicate endMatch guard:** `if (match.state === "match_end") return` — prevents double match-result recording.

## Unresolved Edge Cases

- **Leave during match:** `leaveMatch` does not record match loss. Player who leaves early gets no win/loss/matchesPlayed. Intentional — they didn't finish.
- **Database failure:** Stats use `.catch()` — failures are logged but don't affect gameplay.
- **Character missing:** StatsEvents skips players without `player.character?.id`.
