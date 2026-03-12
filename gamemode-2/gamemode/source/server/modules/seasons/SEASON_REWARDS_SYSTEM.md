# Season-End Ranked Rewards System

## Overview

Players receive rewards at the end of each ranked season based on their final seasonal rank tier. Rewards are generated once per season per player, stored in a snapshot entity, and claimed manually by the player.

## Reward Definitions

**File:** `SeasonRewardsConfig.ts`

| Tier    | XP   | Title   |
|---------|------|---------|
| Bronze  | 100  | Bronze  |
| Silver  | 200  | Silver  |
| Gold    | 350  | Gold    |
| Platinum| 500  | Platinum|
| Diamond | 750  | Diamond |
| Elite   | 1000 | Elite   |

Unranked players (no `PlayerSeasonStats` or unknown tier) receive no reward.

## Entity: PlayerSeasonReward

**File:** `PlayerSeasonReward.entity.ts`

| Field          | Type      | Description                          |
|----------------|-----------|--------------------------------------|
| id             | number    | Primary key                          |
| seasonId       | string    | Season identifier                    |
| characterId    | number    | Character who earned the reward      |
| finalRankTier  | string    | Tier at season end (from stats)      |
| rewardXp       | number    | XP to award on claim                 |
| rewardTitle    | string?   | Optional title/badge string          |
| generatedAt    | Date      | When reward was generated            |
| claimed        | boolean   | Whether player has claimed           |
| claimedAt      | Date?     | When claimed                        |

**Unique constraint:** `(seasonId, characterId)` — one reward per player per season.

## Generation Flow

1. **When:** After a season ends, an admin runs `/generateSeasonRewards <seasonId>` (or `/genrewards <seasonId>`).
2. **Source:** `PlayerSeasonStats` for the given `seasonId` — uses `seasonalRankTier` as final tier.
3. **Logic:** For each player with stats:
   - Skip if a `PlayerSeasonReward` already exists for that season/character.
   - Look up reward from `getRewardForTier(seasonalRankTier)`.
   - If tier has no reward (e.g. Unranked), skip.
   - Create and save `PlayerSeasonReward` entity.
4. **Idempotent:** Safe to run multiple times; skips existing rewards.
5. **Stats:** Lifetime and seasonal stats are not modified by reward generation.

## Claim Flow

1. Player opens **Ranking → Season Rewards** tab.
2. Frontend emits `seasons:getMyRewards`; server responds with `seasons:setMyRewards` and list of rewards.
3. Player clicks **Claim** on an unclaimed reward.
4. Frontend emits `seasons:claimReward` with `{ rewardId }`.
5. Server:
   - Validates: reward exists, belongs to character, not already claimed.
   - If `rewardXp > 0`: calls `addXp(characterId, rewardXp)` via ProgressionManager.
   - Marks reward as claimed, sets `claimedAt`.
   - Emits `seasons:claimRewardResult` with `{ success, xpGained?, newLevel?, leveledUp? }`.
   - On success, emits `seasons:setMyRewards` with updated list.
6. Duplicate claims are prevented by the `claimed` check.

## CEF Events

| Event                     | Direction      | Payload / Description                          |
|---------------------------|----------------|------------------------------------------------|
| seasons:getMyRewards     | CEF → Server   | No payload. Returns rewards for character.    |
| seasons:setMyRewards      | Server → CEF   | `{ rewards: SeasonRewardDto[] }`               |
| seasons:claimReward       | CEF → Server   | `{ rewardId: number }`                         |
| seasons:claimRewardResult | Server → CEF   | `{ success, xpGained?, newLevel?, leveledUp?, error? }` |

## Frontend Integration

- **Location:** Ranking tab → **Season Rewards** sub-tab (next to Leaderboard, Challenges).
- **Component:** `SeasonRewards.tsx`
- **Shows:** Season ID, final tier, XP and title, claimed/unclaimed status, Claim button.
- **Minimal UI:** No visual polish; functional only.

## Season Rollover Support

- Current season ends → admin manually starts new season via SeasonManager.
- Admin runs `/generateSeasonRewards <previousSeasonId>` for the ended season.
- Players can claim previous season rewards at any time from the Season Rewards panel.
- No admin UI for reward generation yet; command-line only.

## Limitations / Deferred Features

- No cosmetic inventory rewards (titles/badges are strings only, not equippable).
- No automatic reward generation on season end (manual command required).
- Season name not stored in reward entity; frontend shows `seasonId` only.
- No notification when new rewards become available.
