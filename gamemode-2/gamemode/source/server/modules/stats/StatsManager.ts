/**
 * Generic player statistics manager. Persists stats via TypeORM.
 * playerId = character ID (persistent across sessions).
 */
import { RAGERP } from "@api";
import { PlayerStatsEntity } from "./PlayerStats.entity";

const PLACEMENT_MATCHES = 5;
const MMR_WIN = 25;
const MMR_LOSS = -20;
const MMR_MODIFIER_MIN = -5;
const MMR_MODIFIER_MAX = 5;

/** Rank tier thresholds (MMR). Unranked = during placements. */
const RANK_TIERS: { tier: string; minMmr: number }[] = [
    { tier: "Bronze", minMmr: 0 },
    { tier: "Silver", minMmr: 1000 },
    { tier: "Gold", minMmr: 1200 },
    { tier: "Platinum", minMmr: 1400 },
    { tier: "Diamond", minMmr: 1600 },
    { tier: "Elite", minMmr: 1800 }
];

export function getRankTierFromMmr(mmr: number, placementMatchesPlayed: number): string {
    if (placementMatchesPlayed < PLACEMENT_MATCHES) return "Unranked";
    let tier = "Bronze";
    for (const t of RANK_TIERS) {
        if (mmr >= t.minMmr) tier = t.tier;
    }
    return tier;
}

export interface RankedMatchPlayerInput {
    characterId: number;
    kills: number;
    deaths: number;
    isWin: boolean;
    isLoss: boolean;
}

export interface RankedMatchResult {
    oldMMR: number;
    newMMR: number;
    rankTier: string;
}

export async function updateRankedMatchResult(
    inputs: RankedMatchPlayerInput[]
): Promise<Map<number, RankedMatchResult>> {
    const results = new Map<number, RankedMatchResult>();
    const repo = RAGERP.database.getRepository(PlayerStatsEntity);

    for (const input of inputs) {
        const stats = await ensureStats(input.characterId);
        const oldMMR = stats.mmr;
        const placementBefore = stats.placementMatchesPlayed;

        const kdDiff = input.kills - input.deaths;
        const modifier = Math.max(MMR_MODIFIER_MIN, Math.min(MMR_MODIFIER_MAX, kdDiff));

        let delta: number;
        if (input.isWin) delta = MMR_WIN + modifier;
        else if (input.isLoss) delta = MMR_LOSS + modifier;
        else delta = 0;

        const newMMR = Math.max(0, oldMMR + delta);
        stats.mmr = newMMR;
        stats.placementMatchesPlayed = Math.min(PLACEMENT_MATCHES, placementBefore + 1);
        stats.rankTier = getRankTierFromMmr(newMMR, stats.placementMatchesPlayed);

        await repo.save(stats);
        results.set(input.characterId, { oldMMR, newMMR, rankTier: stats.rankTier });
    }

    return results;
}

export async function getStats(playerId: number): Promise<PlayerStatsEntity | null> {
    const repo = RAGERP.database.getRepository(PlayerStatsEntity);
    return repo.findOne({ where: { playerId } });
}

export async function createStats(playerId: number): Promise<PlayerStatsEntity> {
    const repo = RAGERP.database.getRepository(PlayerStatsEntity);
    const stats = repo.create({
        playerId,
        kills: 0,
        deaths: 0,
        wins: 0,
        losses: 0,
        matchesPlayed: 0,
        xp: 0,
        level: 1,
        prestige: 0
    });
    return repo.save(stats);
}

export async function ensureStats(playerId: number): Promise<PlayerStatsEntity> {
    const existing = await getStats(playerId);
    return existing ?? createStats(playerId);
}

export async function recordKill(playerId: number): Promise<void> {
    const stats = await ensureStats(playerId);
    stats.kills++;
    await RAGERP.database.getRepository(PlayerStatsEntity).save(stats);
}

export async function recordDeath(playerId: number): Promise<void> {
    const stats = await ensureStats(playerId);
    stats.deaths++;
    await RAGERP.database.getRepository(PlayerStatsEntity).save(stats);
}

export async function recordMatchWin(playerId: number): Promise<void> {
    const stats = await ensureStats(playerId);
    stats.wins++;
    stats.matchesPlayed++;
    await RAGERP.database.getRepository(PlayerStatsEntity).save(stats);
}

export async function recordMatchLoss(playerId: number): Promise<void> {
    const stats = await ensureStats(playerId);
    stats.losses++;
    stats.matchesPlayed++;
    await RAGERP.database.getRepository(PlayerStatsEntity).save(stats);
}

export async function recordMatchPlayed(playerId: number): Promise<void> {
    const stats = await ensureStats(playerId);
    stats.matchesPlayed++;
    await RAGERP.database.getRepository(PlayerStatsEntity).save(stats);
}
