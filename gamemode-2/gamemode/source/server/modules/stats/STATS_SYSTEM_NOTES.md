# Player Statistics System

Generic player statistics infrastructure. Records match results and combat stats via TypeORM.

## Entity Schema

**PlayerStats.entity.ts** (`player_stats` table)

| Column        | Type      | Description                          |
|---------------|-----------|--------------------------------------|
| playerId      | int (PK)  | Character ID (persistent identifier) |
| kills         | int       | Total kills                           |
| deaths        | int       | Total deaths                          |
| wins          | int       | Match wins                            |
| losses        | int       | Match losses                          |
| matchesPlayed | int       | Total matches played                  |
| createdAt     | timestamp | First created                         |
| updatedAt     | timestamp | Last updated                          |

## Integration with Matches

### StatsEvents

`StatsEvents.ts` provides hooks that match modes call:

- **onMatchDeath(victim, killer?)** — Call when a player dies in a match.
  - Records `recordDeath` for victim
  - Records `recordKill` for killer (if any, and not teamkill)

- **onMatchEnd(winner, redTeamPlayers, blueTeamPlayers)** — Call when a match ends.
  - Winners → `recordMatchWin` (increments wins + matchesPlayed)
  - Losers → `recordMatchLoss` (increments losses + matchesPlayed)
  - Draw → `recordMatchPlayed` (increments matchesPlayed only)

### Hopouts Integration

- **handleArenaDeath** — Calls `statsOnMatchDeath(victim, killer)` after processing death
- **endMatch** — Calls `statsOnMatchEnd(winner, redTeamPlayers, blueTeamPlayers)` before clearing match

Character IDs are extracted from `player.character?.id`. Players without a character are skipped.

## StatsManager API

| Function              | Description                              |
|------------------------|------------------------------------------|
| getStats(playerId)      | Get stats or null                        |
| createStats(playerId)   | Create new stats row                     |
| ensureStats(playerId)   | Get or create                            |
| recordKill(playerId)   | Increment kills                          |
| recordDeath(playerId)   | Increment deaths                         |
| recordMatchWin(playerId)| Increment wins + matchesPlayed          |
| recordMatchLoss(playerId)| Increment losses + matchesPlayed        |
| recordMatchPlayed(playerId)| Increment matchesPlayed only          |

## Future Expansion

- **ELO / Ranked** — Add `elo` or `rating` column; update on match end with win/loss delta
- **Per-mode stats** — Separate tables or JSONB column for mode-specific stats (e.g. zone damage)
- **Leaderboards** — Query by kills, wins, K/D ratio
- **Seasons** — Add `seasonId`; reset or archive per season
