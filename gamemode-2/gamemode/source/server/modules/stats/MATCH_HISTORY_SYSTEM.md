# Match History System

First-version recent match history for Hopouts, connected to the Profile / Stats page.

## Entity

**PlayerMatchHistory** (`player_match_history` table)

| Field | Type | Description |
|-------|------|--------------|
| id | int | Primary key |
| characterId | int | Character ID (same as playerId in PlayerStats) |
| matchId | varchar(64) | Match reference (e.g. `dim-{dimension}-{timestamp}`) |
| result | varchar(8) | "Win" \| "Loss" |
| team | varchar(8) | "red" \| "blue" |
| kills | int | Kills this match |
| deaths | int | Deaths this match |
| kd | float | K/D for this match |
| mmrChange | int | MMR delta |
| xpGained | int | XP gained this match |
| levelAfter | int | Level after match |
| rankTierAfter | varchar(32) | Rank tier after match |
| createdAt | timestamp | When the row was created |

## Fields Stored

- Win/Loss
- team
- kills, deaths, K/D
- MMR delta for that match
- XP gained for that match
- resulting level
- resulting rank tier
- timestamp

## Source of Truth for Writes

**Single hook:** `endMatch` in `ArenaMatch.manager.ts`

Match history is recorded once per player when the match ends, in the same loop where:
- match results are finalized
- MMR results are available
- XP results are available
- CEF matchEnd is emitted

No duplicate writes. No hooks from death events or other pipelines.

## MatchHistoryManager

- `recordPlayerMatchHistory(input)` — Records one row per player at match end
- `getRecentMatchesByCharacterId(characterId, limit = 10)` — For profile flow
- `getRecentMatchesByPlayerId(playerId, limit = 10)` — Alias (playerId = characterId)

## Profile Integration

**Server events:**
- `profile:getRecentMatches` — Payload: `{ characterId }`. Returns 10 most recent matches.
- `profile:setRecentMatches` — Response: `{ matches: MatchHistoryEntry[] }`

Profile page requests recent matches after profile loads, using `profile.playerId` (characterId).

## Frontend Section

**ProfileStats.tsx** — "Recent Matches" section:

- result (Win/Loss) with color
- date/time
- kills / deaths (K/D)
- MMR change
- XP gained

**Empty state:** "No recent matches yet"

## Draw Matches

Draw matches are not recorded (result is Win | Loss only).
