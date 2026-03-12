# server/modules/stats

**Ownership:** Generic player statistics (kills, deaths, wins, losses, matches played).

- **PlayerStats.entity.ts** — TypeORM entity, `player_stats` table
- **StatsManager.ts** — CRUD and record functions
- **StatsEvents.ts** — Hooks for match modes (onMatchDeath, onMatchEnd)

**Used by:** Hopouts ArenaMatch.manager

See STATS_SYSTEM_NOTES.md for schema and integration details.
