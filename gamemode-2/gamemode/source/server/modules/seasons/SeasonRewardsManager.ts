/**
 * Season-end reward generation and claim.
 */
import { RAGERP } from "@api";
import { PlayerSeasonStatsEntity } from "./PlayerSeasonStats.entity";
import { PlayerSeasonRewardEntity } from "./PlayerSeasonReward.entity";
import { getRewardForTier } from "./SeasonRewardsConfig";
import { addXp } from "@modules/stats/ProgressionManager";
import { getActiveSeasonConfig } from "./SeasonConfig";

export interface SeasonRewardDto {
    id: number;
    seasonId: string;
    seasonName?: string;
    finalRankTier: string;
    rewardXp: number;
    rewardTitle: string | null;
    claimed: boolean;
    claimedAt: Date | null;
}

/**
 * Generate rewards for all players who participated in a season.
 * Uses final seasonal rank tier from PlayerSeasonStats.
 * Idempotent: skips players who already have a reward for this season.
 */
export async function generateSeasonRewards(seasonId: string, seasonName?: string): Promise<number> {
    const statsRepo = RAGERP.database.getRepository(PlayerSeasonStatsEntity);
    const rewardRepo = RAGERP.database.getRepository(PlayerSeasonRewardEntity);

    const allStats = await statsRepo.find({
        where: { seasonId },
        select: ["characterId", "seasonalRankTier"]
    });

    let generated = 0;
    for (const s of allStats) {
        const existing = await rewardRepo.findOne({ where: { seasonId, characterId: s.characterId } });
        if (existing) continue;

        const reward = getRewardForTier(s.seasonalRankTier);
        if (!reward) continue;

        const entity = rewardRepo.create({
            seasonId,
            characterId: s.characterId,
            finalRankTier: s.seasonalRankTier,
            rewardXp: reward.rewardXp,
            rewardTitle: reward.rewardTitle,
            claimed: false
        });
        await rewardRepo.save(entity);
        generated++;
    }
    return generated;
}

function getSeasonDisplayName(seasonId: string): string {
    const active = getActiveSeasonConfig();
    if (active && active.seasonId === seasonId) return active.name;
    const num = seasonId.replace(/^s/i, "") || seasonId;
    return /^\d+$/.test(num) ? `Season ${num}` : seasonId;
}

/**
 * Get unclaimed (and claimed) season rewards for a character.
 */
export async function getSeasonRewardsForCharacter(characterId: number): Promise<SeasonRewardDto[]> {
    const rewardRepo = RAGERP.database.getRepository(PlayerSeasonRewardEntity);
    const rewards = await rewardRepo.find({
        where: { characterId },
        order: { generatedAt: "DESC" }
    });

    return rewards.map((r) => ({
        id: r.id,
        seasonId: r.seasonId,
        seasonName: getSeasonDisplayName(r.seasonId),
        finalRankTier: r.finalRankTier,
        rewardXp: r.rewardXp,
        rewardTitle: r.rewardTitle,
        claimed: r.claimed,
        claimedAt: r.claimedAt
    }));
}

/**
 * Claim a season reward. Awards XP and marks as claimed.
 * Prevents duplicate claims.
 */
export async function claimSeasonReward(
    characterId: number,
    rewardId: number
): Promise<{ success: boolean; xpGained?: number; newLevel?: number; leveledUp?: boolean; error?: string }> {
    const rewardRepo = RAGERP.database.getRepository(PlayerSeasonRewardEntity);
    const reward = await rewardRepo.findOne({ where: { id: rewardId, characterId } });

    if (!reward) {
        return { success: false, error: "Reward not found." };
    }
    if (reward.claimed) {
        return { success: false, error: "Already claimed." };
    }

    if (reward.rewardXp > 0) {
        const result = await addXp(characterId, reward.rewardXp);
        reward.claimed = true;
        reward.claimedAt = new Date();
        await rewardRepo.save(reward);
        return {
            success: true,
            xpGained: result.xpGained,
            newLevel: result.newLevel,
            leveledUp: result.leveledUp
        };
    }

    reward.claimed = true;
    reward.claimedAt = new Date();
    await rewardRepo.save(reward);
    return { success: true };
}
