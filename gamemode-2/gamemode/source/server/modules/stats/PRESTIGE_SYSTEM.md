# Prestige System

## Overview

Prestige provides long-term progression beyond the normal level cap. Players who reach max level can manually prestige to reset lifetime level/XP and gain a prestige rank. Kills, wins, losses, MMR, and seasonal data are preserved.

## Prestige Rule

- **Max level:** 50
- **Eligibility:** Player must reach level 50 to prestige
- **Manual only:** Prestige is never automatic
- **On prestige:**
  - `prestige` increases by 1
  - `level` resets to 1
  - `xp` resets to 0
- **Preserved:** kills, deaths, wins, losses, matchesPlayed, mmr, rankTier, placementMatchesPlayed, seasonal data

## Backend

### PlayerStatsEntity

- Added `prestige` (int, default 0)

### PrestigeManager

| Function | Description |
|----------|-------------|
| `canPrestige(characterId)` | Returns true if level >= MAX_LEVEL |
| `getPrestigeStatus(characterId)` | Returns `{ prestige, level, xp, maxLevel, canPrestige }` |
| `prestigePlayer(characterId)` | Executes prestige; returns `{ success, newPrestige?, error? }` |

### ProgressionManager

- Level cap: `addXp` stops leveling at MAX_LEVEL (50)
- XP can still accumulate at max level; prestige resets it

### ProfileManager

- Profile includes: `prestige`, `maxLevel`, `canPrestige`

## CEF Events

| Event | Direction | Payload |
|-------|-----------|---------|
| progression:getPrestigeStatus | CEF → Server | No payload |
| progression:setPrestigeStatus | Server → CEF | `{ status: PrestigeStatus \| null }` |
| progression:prestige | CEF → Server | No payload |
| progression:prestigeResult | Server → CEF | `{ success, newPrestige?, error? }` |

Note: Profile already includes prestige status; `getPrestigeStatus` is available for standalone use.

## Frontend Integration

- **Location:** Profile page (Ranking → View Profile / My Profile)
- **Shows:** Prestige level (when > 0), Prestige button when eligible
- **Flow:** Click Prestige → confirmation dialog → Confirm → server prestige → profile refresh
- **Own profile only:** Prestige button and confirmation only when viewing own profile

## XP Progression Compatibility

- After prestige, `addXp` continues to work; player levels from 1 again
- No changes to challenge XP, season XP, or match XP formulas
- Profile state remains consistent after prestige

## Limitations / Deferred Features

- No prestige rewards (cosmetic, title, etc.)
- No prestige-based unlocks
- Max level is fixed at 50; not configurable
- No prestige leaderboard
