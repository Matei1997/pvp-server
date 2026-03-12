# Ranked MMR System

## Overview

First-version ranked progression for Hopouts. Simple implementation: no seasons, no promotion series, no matchmaking changes.

## PlayerStats Fields

| Field | Type | Default |
|-------|------|---------|
| `mmr` | int | 1000 |
| `rankTier` | varchar(32) | "Unranked" |
| `placementMatchesPlayed` | int | 0 |

## Placement Matches

- First **5** matches are placements
- During placements, `rankTier` displays "Unranked"
- MMR still updates during placements
- After 5 matches, tier is computed from MMR

## MMR Update

- **Win:** +25 base
- **Loss:** -20 base
- **Draw:** no change

### K/D Modifier

- Modifier = `clamp(kills - deaths, -5, +5)`
- Added to base delta
- Examples:
  - Win, 5 more kills than deaths: +25 + 5 = **+30**
  - Win, 5 more deaths than kills: +25 - 5 = **+20**
  - Loss, 5 more kills than deaths: -20 + 5 = **-15**
  - Loss, 5 more deaths than kills: -20 - 5 = **-25**

## Rank Tiers

| Tier | Min MMR |
|------|---------|
| Bronze | 0 |
| Silver | 1000 |
| Gold | 1200 |
| Platinum | 1400 |
| Diamond | 1600 |
| Elite | 1800 |

## Integration

- **Trigger:** Hopouts match end (`endMatch` in ArenaMatch.manager.ts)
- **Flow:** `statsOnMatchEnd` (win/loss) → `updateRankedMatchResult` (MMR) → per-player `matchEnd` CEF emit
- **UI:** MatchResult shows `rankTier` and `oldMMR → newMMR`

## Key Files

| File | Purpose |
|------|---------|
| `source/server/modules/stats/PlayerStats.entity.ts` | mmr, rankTier, placementMatchesPlayed columns |
| `source/server/modules/stats/StatsManager.ts` | updateRankedMatchResult, getRankTierFromMmr |
| `source/server/modes/hopouts/ArenaMatch.manager.ts` | endMatch → ranked update → per-player payload |
| `frontend/src/pages/arena/components/MatchResult.tsx` | MMR/rank display |

## Match End Payload (per player)

```ts
{
  redScore, blueScore, winner, redTeam, blueTeam,
  oldMMR: number,
  newMMR: number,
  rankTier: string
}
```
