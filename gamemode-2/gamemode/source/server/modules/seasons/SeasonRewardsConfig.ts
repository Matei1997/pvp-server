/**
 * Season-end rewards by final rank tier.
 */
export interface TierReward {
    rewardXp: number;
    rewardTitle: string;
}

export const SEASON_TIER_REWARDS: Record<string, TierReward> = {
    Bronze: { rewardXp: 100, rewardTitle: "Bronze" },
    Silver: { rewardXp: 200, rewardTitle: "Silver" },
    Gold: { rewardXp: 350, rewardTitle: "Gold" },
    Platinum: { rewardXp: 500, rewardTitle: "Platinum" },
    Diamond: { rewardXp: 750, rewardTitle: "Diamond" },
    Elite: { rewardXp: 1000, rewardTitle: "Elite" }
};

/** Unranked gets no reward. */
export function getRewardForTier(tier: string): TierReward | null {
    const t = SEASON_TIER_REWARDS[tier];
    return t ?? null;
}
