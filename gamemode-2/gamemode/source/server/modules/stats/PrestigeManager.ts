/**
 * Prestige system: long-term progression beyond max level.
 * Manual prestige resets lifetime level/xp only; keeps kills, wins, MMR, seasonal data.
 */
import { RAGERP } from "@api";
import { PlayerStatsEntity } from "./PlayerStats.entity";
import { ensureStats } from "./StatsManager";

export const MAX_LEVEL = 50;

export interface PrestigeStatus {
    prestige: number;
    level: number;
    xp: number;
    maxLevel: number;
    canPrestige: boolean;
}

export async function canPrestige(characterId: number): Promise<boolean> {
    const stats = await ensureStats(characterId);
    return stats.level >= MAX_LEVEL;
}

export async function getPrestigeStatus(characterId: number): Promise<PrestigeStatus> {
    const stats = await ensureStats(characterId);
    return {
        prestige: stats.prestige,
        level: stats.level,
        xp: stats.xp,
        maxLevel: MAX_LEVEL,
        canPrestige: stats.level >= MAX_LEVEL
    };
}

export interface PrestigeResult {
    success: boolean;
    newPrestige?: number;
    error?: string;
}

export async function prestigePlayer(characterId: number): Promise<PrestigeResult> {
    const stats = await ensureStats(characterId);
    if (stats.level < MAX_LEVEL) {
        return { success: false, error: "Must reach max level to prestige." };
    }

    stats.prestige += 1;
    stats.level = 1;
    stats.xp = 0;
    await RAGERP.database.getRepository(PlayerStatsEntity).save(stats);

    return { success: true, newPrestige: stats.prestige };
}
