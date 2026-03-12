# Profile / Stats Page System

## Overview

Player profile page for Hopouts displaying ranked and lifetime combat stats. Uses existing PlayerStats; does not modify combat, MMR, or matchmaking.

## Backend

### ProfileManager

**File:** `source/server/modules/stats/ProfileManager.ts`

| Function | Description |
|----------|-------------|
| `getPlayerProfile(characterId)` | Alias for getPlayerProfileByCharacterId |
| `getPlayerProfileByCharacterId(characterId)` | Returns full profile or null |

### Return Shape

```ts
{
  playerId: number;        // character ID
  playerName: string;
  mmr: number;
  rankTier: string;
  placementMatchesPlayed: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  kd: number;             // kills / max(1, deaths)
  winRate: number;        // wins / max(1, matchesPlayed)
  leaderboardRank?: number;  // optional, from getPlayerRank
}
```

### Stat Formulas

- **kd** = kills / max(1, deaths)
- **winRate** = wins / max(1, matchesPlayed)
- Placements: when placementMatchesPlayed < 5 and rankTier === "Unranked", profile displays placement status clearly

## Server Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `profile:getPlayerProfile` | CEF → Server | Fetch profile by characterId (payload: `{ characterId }`) |
| `profile:getMyProfile` | CEF → Server | Fetch current player's profile (no payload) |
| `profile:setPlayerProfile` | Server → CEF | Response with `{ profile: PlayerProfile \| null }` |

**File:** `source/server/serverevents/Profile.event.ts`

## Frontend

### ProfileStats.tsx

**File:** `frontend/src/pages/mainmenu/components/ProfileStats.tsx`

- **Props:** `characterId` (use -1 for "my profile"), `onBack`
- **Layout:**
  - Header: player name, rank tier, MMR, placements status (if applicable)
  - Stats grid: Matches Played, Wins, Losses, Win Rate, Kills, Deaths, K/D
  - Optional: leaderboard rank
  - Back button to return to leaderboard

### Leaderboard → Profile Navigation

- Click a leaderboard row → opens ProfileStats for that player (characterId from row)
- "My Profile" button → opens ProfileStats with characterId=-1 (server fetches current player)

### MainMenu Integration

- RANKING tab shows Leaderboard or ProfileStats based on selection
- Uses existing LobbyShell / tab structure
- PartyPanel: "BADGES" label renamed to "RANK"

## Key Files

| File | Purpose |
|------|---------|
| `source/server/modules/stats/ProfileManager.ts` | getPlayerProfile, getPlayerProfileByCharacterId |
| `source/server/serverevents/Profile.event.ts` | CEF register for getPlayerProfile, getMyProfile |
| `frontend/src/pages/mainmenu/components/ProfileStats.tsx` | Profile UI |
| `frontend/src/pages/mainmenu/components/Leaderboard.tsx` | Row click, My Profile button |
| `frontend/src/pages/mainmenu/components/LobbyShell.tsx` | Ranking view state, ProfileStats/Leaderboard switch |
