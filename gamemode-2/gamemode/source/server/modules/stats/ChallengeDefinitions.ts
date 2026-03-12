/**
 * Static challenge definitions for Hopouts daily/weekly challenges.
 */

export type ChallengeType = "daily" | "weekly";

export interface ChallengeDef {
    key: string;
    label: string;
    type: ChallengeType;
    target: number;
    rewardXp: number;
    /** Stat key used by incrementChallengeProgress */
    statKey: string;
}

export const DAILY_CHALLENGES: ChallengeDef[] = [
    { key: "play_matches_3", label: "Play 3 Matches", type: "daily", target: 3, rewardXp: 150, statKey: "play_matches" },
    { key: "win_matches_2", label: "Win 2 Matches", type: "daily", target: 2, rewardXp: 150, statKey: "win_matches" },
    { key: "get_kills_10", label: "Get 10 Kills", type: "daily", target: 10, rewardXp: 150, statKey: "get_kills" },
    { key: "headshots_3", label: "Get 3 Headshots", type: "daily", target: 3, rewardXp: 150, statKey: "headshots" }
];

export const WEEKLY_CHALLENGES: ChallengeDef[] = [
    { key: "play_matches_10", label: "Play 10 Matches", type: "weekly", target: 10, rewardXp: 500, statKey: "play_matches" },
    { key: "win_matches_5", label: "Win 5 Matches", type: "weekly", target: 5, rewardXp: 500, statKey: "win_matches" },
    { key: "get_kills_30", label: "Get 30 Kills", type: "weekly", target: 30, rewardXp: 500, statKey: "get_kills" },
    { key: "win_clutch_1", label: "Win 1 Clutch", type: "weekly", target: 1, rewardXp: 500, statKey: "win_clutch" }
];

export const ALL_CHALLENGES = [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES];

export function getChallengeDef(key: string): ChallengeDef | undefined {
    return ALL_CHALLENGES.find((c) => c.key === key);
}

export function getChallengesByStatKey(statKey: string): ChallengeDef[] {
    return ALL_CHALLENGES.filter((c) => c.statKey === statKey);
}
