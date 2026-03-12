/**
 * Season management. Single active season, manual reset.
 */
import { RAGERP } from "@api";
import { PlayerSeasonStatsEntity } from "./PlayerSeasonStats.entity";
import {
    getActiveSeasonConfig,
    setActiveSeasonConfig,
    type SeasonDefinition,
    DEFAULT_SEASON
} from "./SeasonConfig";
import { getRankTierFromMmr } from "@modules/stats/StatsManager";

const PLACEMENT_MATCHES = 5;
const MMR_WIN = 25;
const MMR_LOSS = -20;
const MMR_MODIFIER_MIN = -5;
const MMR_MODIFIER_MAX = 5;

export function getActiveSeason(): SeasonDefinition | null {
    return getActiveSeasonConfig();
}

export function isSeasonActive(): boolean {
    const s = getActiveSeasonConfig();
    return !!(s && s.active);
}

/**
 * Start a new season. Existing lifetime stats remain. New seasonal rows begin fresh.
 */
export function startNewSeason(season: SeasonDefinition): void {
    setActiveSeasonConfig(season);
}

/**
 * Initialize default season if none set. Call once at server startup.
 */
export function ensureDefaultSeason(): void {
    if (!getActiveSeasonConfig()) {
        setActiveSeasonConfig(DEFAULT_SEASON);
    }
}

export async function ensureSeasonStats(seasonId: string, characterId: number): Promise<PlayerSeasonStatsEntity> {
    const repo = RAGERP.database.getRepository(PlayerSeasonStatsEntity);
    let stats = await repo.findOne({ where: { seasonId, characterId } });
    if (!stats) {
        stats = repo.create({
            seasonId,
            characterId,
            seasonalMMR: 1000,
            seasonalRankTier: "Unranked",
            seasonalPlacementMatchesPlayed: 0,
            seasonalWins: 0,
            seasonalLosses: 0,
            seasonalMatchesPlayed: 0,
            seasonalKills: 0,
            seasonalDeaths: 0,
            seasonalXp: 0,
            seasonalLevel: 1
        });
        await repo.save(stats);
    }
    return stats;
}

export async function recordSeasonalKill(seasonId: string, characterId: number): Promise<void> {
    const stats = await ensureSeasonStats(seasonId, characterId);
    stats.seasonalKills++;
    await RAGERP.database.getRepository(PlayerSeasonStatsEntity).save(stats);
}

export async function recordSeasonalDeath(seasonId: string, characterId: number): Promise<void> {
    const stats = await ensureSeasonStats(seasonId, characterId);
    stats.seasonalDeaths++;
    await RAGERP.database.getRepository(PlayerSeasonStatsEntity).save(stats);
}

export async function updateSeasonalRankedMatchResult(
    seasonId: string,
    inputs: { characterId: number; kills: number; deaths: number; isWin: boolean; isLoss: boolean }[]
): Promise<void> {
    const repo = RAGERP.database.getRepository(PlayerSeasonStatsEntity);

    for (const input of inputs) {
        const stats = await ensureSeasonStats(seasonId, input.characterId);
        const oldMMR = stats.seasonalMMR;
        const placementBefore = stats.seasonalPlacementMatchesPlayed;

        const kdDiff = input.kills - input.deaths;
        const modifier = Math.max(MMR_MODIFIER_MIN, Math.min(MMR_MODIFIER_MAX, kdDiff));

        let delta: number;
        if (input.isWin) delta = MMR_WIN + modifier;
        else if (input.isLoss) delta = MMR_LOSS + modifier;
        else delta = 0;

        const newMMR = Math.max(0, oldMMR + delta);
        stats.seasonalMMR = newMMR;
        stats.seasonalPlacementMatchesPlayed = Math.min(PLACEMENT_MATCHES, placementBefore + 1);
        stats.seasonalRankTier = getRankTierFromMmr(newMMR, stats.seasonalPlacementMatchesPlayed);

        if (input.isWin) {
            stats.seasonalWins++;
        } else if (input.isLoss) {
            stats.seasonalLosses++;
        }
        stats.seasonalMatchesPlayed++;

        await repo.save(stats);
    }
}

const XP_WIN = 150;
const XP_LOSS = 80;

export async function addSeasonalXp(
    seasonId: string,
    characterId: number,
    amount: number,
    isWin?: boolean,
    isLoss?: boolean
): Promise<{ xpGained: number; newXp: number; newLevel: number; leveledUp: boolean }> {
    const stats = await ensureSeasonStats(seasonId, characterId);
    const repo = RAGERP.database.getRepository(PlayerSeasonStatsEntity);
    const oldLevel = stats.seasonalLevel;

    let xp = stats.seasonalXp + amount;
    let level = stats.seasonalLevel;

    const getRequired = (lvl: number) => 500 + (lvl - 1) * 150;
    while (level < 999) {
        const required = getRequired(level);
        if (xp < required) break;
        xp -= required;
        level++;
    }

    stats.seasonalXp = xp;
    stats.seasonalLevel = level;
    await repo.save(stats);

    return {
        xpGained: amount,
        newXp: xp,
        newLevel: level,
        leveledUp: level > oldLevel
    };
}

export async function applySeasonalMatchXp(
    seasonId: string,
    characterId: number,
    isWin: boolean,
    isLoss: boolean
): Promise<{ xpGained: number }> {
    const amount = isWin ? XP_WIN : isLoss ? XP_LOSS : 0;
    if (amount <= 0) return { xpGained: 0 };
    const result = await addSeasonalXp(seasonId, characterId, amount, isWin, isLoss);
    return { xpGained: result.xpGained };
}
