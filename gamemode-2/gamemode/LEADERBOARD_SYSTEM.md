# Leaderboard System

## Overview

Displays the top 100 ranked Hopouts players by MMR. Uses existing PlayerStats entity; does not modify ranked MMR logic, combat, or matchmaking.

## Backend

### LeaderboardManager

**File:** `source/server/modules/stats/LeaderboardManager.ts`

| Function | Description |
|----------|-------------|
| `getTopPlayers(limit?: number)` | Returns top players ordered by MMR DESC. Default limit 100. |
| `getPlayerRank(playerId)` | Returns rank and entry for a specific player, or null if not found. |

### Query

```sql
SELECT playerId, mmr, rankTier, wins, losses, kills, deaths
FROM player_stats
ORDER BY mmr DESC
LIMIT 100
```

Character names are joined from `characters` table via `playerId` (character ID).

### CEF Event

| Event | Direction | Purpose |
|-------|-----------|---------|
| `leaderboard:getTopPlayers` | CEF → Server | Request top 100 players |
| `leaderboard:setTopPlayers` | Server → CEF | Response with `{ entries: LeaderboardEntry[] }` |

**File:** `source/server/serverevents/Leaderboard.event.ts`

## Frontend

### Leaderboard.tsx

**File:** `frontend/src/pages/mainmenu/components/Leaderboard.tsx`

- Mounted when MainMenu "RANKING" tab is active
- Emits `leaderboard:getTopPlayers` on mount
- Handles `leaderboard:setTopPlayers` to display data

### Columns

| Column | Source |
|--------|--------|
| Rank | 1-based index |
| Player | `playerName` (from characters) |
| Tier | `rankTier` |
| MMR | `mmr` |
| W | `wins` |
| L | `losses` |
| K/D | `kills / deaths` (1 decimal) |

### MainMenu Integration

- RANKING nav tab shows Leaderboard component
- Replaces previous placeholder content

## Key Files

| File | Purpose |
|------|---------|
| `source/server/modules/stats/LeaderboardManager.ts` | getTopPlayers, getPlayerRank |
| `source/server/serverevents/Leaderboard.event.ts` | CEF register for getTopPlayers |
| `frontend/src/pages/mainmenu/components/Leaderboard.tsx` | UI component |
| `frontend/src/pages/mainmenu/components/LobbyShell.tsx` | Renders Leaderboard when ranking tab active |
