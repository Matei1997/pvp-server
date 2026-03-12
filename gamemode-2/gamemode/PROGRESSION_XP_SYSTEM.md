# Progression / XP System

## Overview

First-version progression for Hopouts using XP and levels. Separate from ranked MMR. No daily/weekly systems, no unlocks.

## PlayerStats Fields Added

| Field | Type | Default |
|-------|------|---------|
| `xp` | int | 0 |
| `level` | int | 1 |

## XP Rewards

| Source | Amount |
|--------|--------|
| Match win | +150 XP |
| Match loss | +80 XP |
| Kill | +10 XP |
| Headshot kill bonus | +5 XP |
| Clutch bonus | +25 XP |

Draw: no match XP.

## Level Formula

```
requiredXpForNextLevel = 500 + (level - 1) * 150
```

When XP crosses the threshold: level increases, excess XP carries forward.

## Helper Functions (ProgressionManager)

| Function | Purpose |
|----------|---------|
| `getRequiredXpForLevel(level)` | Returns XP needed for given level |
| `addXp(playerId, amount, matchDimension?)` | Add XP, level up if needed, optionally track for match result |
| `applyMatchXpResult(input, matchDimension?)` | Award win/loss XP |
| `applyKillXp(characterId, headshot, matchDimension?)` | Award kill XP (+ headshot bonus) |
| `applyClutchXp(characterId, matchDimension?)` | Award clutch XP |

## Hook Points

| Event | Location | Action |
|-------|----------|--------|
| Kill | `handleArenaDeath` → `statsOnMatchDeath` | `applyKillXp(killerId, headshot, dimension)` |
| Match end | `endMatch` → `statsOnMatchEnd` | `applyMatchXpResult` per player |
| Clutch | `emitRoundResult` | `applyClutchXp(lastAlive.characterId, dimension)` when clutch |

Headshot from `buildDeathRecap(victim, killer).headshot`. Clutch when last alive with ≥2 round kills.

## Profile Integration

Profile payload includes:

- `xp`, `level`
- `currentLevelProgress` — XP within current level
- `xpForNextLevel` — XP required for next level

Frontend can display progress bar: `currentLevelProgress / xpForNextLevel`.

## Match Result Integration

Match end payload includes:

- `xpGained` — total XP earned this match
- `leveledUp` — true if any level up occurred
- `newLevel` — current level after match

UI displays: "+185 XP", "LEVEL UP: 7".

## Key Files

| File | Purpose |
|------|---------|
| `source/server/modules/stats/PlayerStats.entity.ts` | xp, level columns |
| `source/server/modules/stats/ProgressionManager.ts` | XP/level logic |
| `source/server/modules/stats/StatsEvents.ts` | onMatchDeath (kill XP), onMatchEnd (match XP) |
| `source/server/modes/hopouts/ArenaMatch.manager.ts` | headshotKills, clutchCount, clutch XP, match result |
| `source/server/modules/stats/ProfileManager.ts` | xp, level, progress in profile |
| `frontend/.../MatchResult.tsx` | XP and level up display |
| `frontend/.../ProfileStats.tsx` | Level and XP progress |
