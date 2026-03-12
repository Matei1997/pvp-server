/**
 * XP and level progression for Hopouts. Separate from ranked MMR.
 */
import { RAGERP } from "@api";
import { PlayerStatsEntity } from "./PlayerStats.entity";
import { ensureStats } from "./StatsManager";
import { MAX_LEVEL } from "./PrestigeManager";

const XP_WIN = 150;
const XP_LOSS = 80;
const XP_KILL = 10;
const XP_HEADSHOT = 5;
const XP_CLUTCH = 25;

/** Per-player XP result during a match. Keyed by dimension -> characterId. */
const matchXpResults = new Map<number, Map<number, { totalXp: number; leveledUp: boolean; newLevel: number }>>();

export function getRequiredXpForLevel(level: number): number {
    return 500 + (level - 1) * 150;
}

export function getMatchXpResult(dimension: number, characterId: number): { totalXp: number; leveledUp: boolean; newLevel: number } | undefined {
    return matchXpResults.get(dimension)?.get(characterId);
}

export function clearMatchXpResults(dimension: number): void {
    matchXpResults.delete(dimension);
}

function accumulateMatchXp(dimension: number, characterId: number, result: AddXpResult): void {
    let dimMap = matchXpResults.get(dimension);
    if (!dimMap) {
        dimMap = new Map();
        matchXpResults.set(dimension, dimMap);
    }
    const existing = dimMap.get(characterId);
    if (existing) {
        existing.totalXp += result.xpGained;
        existing.leveledUp = existing.leveledUp || result.leveledUp;
        existing.newLevel = result.newLevel;
    } else {
        dimMap.set(characterId, {
            totalXp: result.xpGained,
            leveledUp: result.leveledUp,
            newLevel: result.newLevel
        });
    }
}

export interface AddXpResult {
    xpGained: number;
    newXp: number;
    newLevel: number;
    leveledUp: boolean;
}

export async function addXp(playerId: number, amount: number, matchDimension?: number): Promise<AddXpResult> {
    const stats = await ensureStats(playerId);
    const repo = RAGERP.database.getRepository(PlayerStatsEntity);
    const oldLevel = stats.level;

    let xp = stats.xp + amount;
    let level = stats.level;

    while (level < MAX_LEVEL) {
        const required = getRequiredXpForLevel(level);
        if (xp < required) break;
        xp -= required;
        level++;
    }

    stats.xp = xp;
    stats.level = level;
    await repo.save(stats);

    const result: AddXpResult = {
        xpGained: amount,
        newXp: xp,
        newLevel: level,
        leveledUp: level > oldLevel
    };
    if (matchDimension != null) {
        accumulateMatchXp(matchDimension, playerId, result);
    }
    return result;
}

export interface MatchXpInput {
    characterId: number;
    isWin: boolean;
    isLoss: boolean;
}

export async function applyMatchXpResult(input: MatchXpInput, matchDimension?: number): Promise<AddXpResult> {
    const amount = input.isWin ? XP_WIN : input.isLoss ? XP_LOSS : 0;
    if (amount <= 0) return { xpGained: 0, newXp: 0, newLevel: 0, leveledUp: false };
    return addXp(input.characterId, amount, matchDimension);
}

export async function applyKillXp(characterId: number, headshot: boolean, matchDimension?: number): Promise<AddXpResult> {
    const amount = XP_KILL + (headshot ? XP_HEADSHOT : 0);
    return addXp(characterId, amount, matchDimension);
}

export async function applyClutchXp(characterId: number, matchDimension?: number): Promise<AddXpResult> {
    return addXp(characterId, XP_CLUTCH, matchDimension);
}
