# Seasons System

First-version Seasons system for structured progression/reset cycles. One active season at a time.

## Season Model

- **seasonId** — Unique identifier (e.g. "s1", "s2")
- **name** — Display name (e.g. "Season 1")
- **startAt** — Unix timestamp
- **endAt** — Unix timestamp
- **active** — Whether this season is currently active

Stored in `SeasonConfig.ts`. Single active season. No automated rollover yet.

## Files

- `SeasonConfig.ts` — Active season definition, get/set
- `SeasonManager.ts` — getActiveSeason, isSeasonActive, startNewSeason, ensureDefaultSeason, ensureSeasonStats, recordSeasonalKill/Death, updateSeasonalRankedMatchResult, addSeasonalXp, applySeasonalMatchXp
- `PlayerSeasonStats.entity.ts` — Per-character per-season stats table
- `PlayerSeasonStats` — seasonId, characterId (composite PK), seasonalMMR, seasonalRankTier, seasonalPlacementMatchesPlayed, seasonalWins, seasonalLosses, seasonalMatchesPlayed, seasonalKills, seasonalDeaths, seasonalXp, seasonalLevel

## Hook Integration

Uses existing finalized hooks only:

- **StatsEvents.onMatchDeath** — When season active: recordSeasonalDeath (victim), recordSeasonalKill (killer), addSeasonalXp (killer, 10 + 5 if headshot)
- **StatsEvents.onMatchEnd** — When season active: applySeasonalMatchXp for each player
- **ArenaMatch.manager endMatch** — When season active: updateSeasonalRankedMatchResult after updateRankedMatchResult

Lifetime stats (PlayerStatsEntity) remain untouched. Seasonal stats are written in parallel.

## Leaderboard / Profile Season Behavior

- **LeaderboardManager.getTopPlayers** — When season active, queries PlayerSeasonStats ordered by seasonalMMR DESC. Returns seasonName, useSeasonal in result.
- **LeaderboardManager.getPlayerRank** — When season active, uses seasonal stats for rank.
- **ProfileManager.getPlayerProfileByCharacterId** — When season active, adds seasonal fields (seasonName, seasonalMmr, seasonalRankTier, seasonalWins, etc.) to profile.

## Reset / Start New Season Flow

```ts
import { startNewSeason } from "@modules/seasons/SeasonManager";

startNewSeason({
    seasonId: "s2",
    name: "Season 2",
    startAt: Date.now(),
    endAt: 9999999999999,
    active: true
});
```

- Existing lifetime stats (PlayerStatsEntity) remain.
- New seasonal rows (PlayerSeasonStats) begin fresh when players next play.
- Seasonal leaderboard naturally resets (new seasonId, new rows).
- No admin UI for this yet.

## Limitations / Deferred Features

- No automated season rollover
- No battle pass logic
- No cosmetic reward logic
- No admin UI for starting new season
- Party/FFA/Gun Game do not affect seasonal ranked stats (Hopouts only)
