# Challenges System

First-version Daily / Weekly Challenges for Hopouts. Rewards XP on claim.

## Entity Structure

**PlayerChallengeProgress** (`player_challenge_progress` table)

| Field | Type | Description |
|-------|------|--------------|
| id | int | Primary key |
| characterId | int | Character ID |
| challengeKey | varchar(64) | e.g. "play_matches_3" |
| challengeType | varchar(16) | "daily" \| "weekly" |
| progress | int | Current progress |
| target | int | Target to complete |
| completed | boolean | Reached target |
| claimed | boolean | Reward claimed |
| resetAt | bigint | Timestamp (ms) when challenge resets |
| createdAt | timestamp | |
| updatedAt | timestamp | |

## Challenge Definitions

Static definitions in `ChallengeDefinitions.ts`.

### Daily (4 challenges)

| Key | Label | Target | Reward XP | Stat Key |
|-----|-------|--------|-----------|----------|
| play_matches_3 | Play 3 Matches | 3 | 150 | play_matches |
| win_matches_2 | Win 2 Matches | 2 | 150 | win_matches |
| get_kills_10 | Get 10 Kills | 10 | 150 | get_kills |
| headshots_3 | Get 3 Headshots | 3 | 150 | headshots |

### Weekly (4 challenges)

| Key | Label | Target | Reward XP | Stat Key |
|-----|-------|--------|-----------|----------|
| play_matches_10 | Play 10 Matches | 10 | 500 | play_matches |
| win_matches_5 | Win 5 Matches | 5 | 500 | win_matches |
| get_kills_30 | Get 30 Kills | 30 | 500 | get_kills |
| win_clutch_1 | Win 1 Clutch | 1 | 500 | win_clutch |

## Hook Integration

Uses existing server-side events only.

| Event | Location | Stat Key | When |
|-------|----------|----------|------|
| Match end | StatsEvents.onMatchEnd | play_matches (all), win_matches (winners) | After record |
| Kill | StatsEvents.onMatchDeath | get_kills | When killer recorded |
| Headshot kill | StatsEvents.onMatchDeath | headshots | When headshot=true |
| Clutch win | ArenaMatch.manager emitRoundResult | win_clutch | When lastAlive.clutchCount++ |

No new combat event triggers.

## Reset Logic

- **Daily:** resetAt = next midnight UTC
- **Weekly:** resetAt = next Monday 00:00 UTC

**Lazy reset:** When fetching challenges via `getChallengesForCharacter`, `ensureActiveChallenges` runs first. It removes rows where `resetAt < now` and creates fresh challenges for any missing keys. No cron.

## Claim Flow

1. Player completes challenge (progress >= target)
2. UI shows "Claim" button
3. Client emits `challenges:claimReward` with `{ challengeKey }`
4. Server: `claimChallengeReward(characterId, challengeKey)`
   - Validates: not claimed, progress >= target
   - Sets `claimed = true`
   - Calls `addXp(characterId, rewardXp)` via ProgressionManager
5. Server emits `challenges:claimRewardResult` with `{ ok, challengeKey, xpAwarded? }`
6. On success, server emits `challenges:setMyChallenges` with updated list

## Frontend Events

| Event | Direction | Payload |
|-------|------------|---------|
| challenges:getMyChallenges | CEF → Server | (none) |
| challenges:setMyChallenges | Server → CEF | `{ challenges: ChallengeProgressDto[] }` |
| challenges:claimReward | CEF → Server | `{ challengeKey: string }` |
| challenges:claimRewardResult | Server → CEF | `{ ok: boolean, challengeKey: string \| null, xpAwarded?: number }` |

## ChallengeManager Functions

- `ensureActiveChallenges(characterId)` — Remove expired, create missing
- `getChallengesForCharacter(characterId)` — Fetch all (calls ensureActiveChallenges)
- `incrementChallengeProgress(characterId, statKey, amount)` — Increment matching challenges
- `completeChallengeIfNeeded(characterId, challengeKey)` — Mark complete if target reached
- `claimChallengeReward(characterId, challengeKey)` — Award XP, mark claimed

## Key Files

| File | Purpose |
|------|---------|
| `PlayerChallengeProgress.entity.ts` | Entity |
| `ChallengeDefinitions.ts` | Static pool |
| `ChallengeManager.ts` | Logic |
| `Challenge.event.ts` | CEF handlers |
| `StatsEvents.ts` | play_matches, win_matches, get_kills, headshots hooks |
| `ArenaMatch.manager.ts` | win_clutch hook |
| `Challenges.tsx` | UI panel |
