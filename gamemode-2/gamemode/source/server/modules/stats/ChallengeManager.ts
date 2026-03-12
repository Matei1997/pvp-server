/**
 * Daily/weekly challenges for Hopouts. Rewards XP on claim.
 */
import { RAGERP } from "@api";
import { PlayerChallengeProgressEntity } from "./PlayerChallengeProgress.entity";
import { addXp } from "./ProgressionManager";
import {
    ALL_CHALLENGES,
    getChallengeDef,
    getChallengesByStatKey,
    type ChallengeDef,
    type ChallengeType
} from "./ChallengeDefinitions";

function getNextDailyReset(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.getTime();
}

function getNextWeeklyReset(): number {
    const now = new Date();
    const day = now.getUTCDay();
    const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
    const nextMonday = new Date(now);
    nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
    nextMonday.setUTCHours(0, 0, 0, 0);
    return nextMonday.getTime();
}

function getResetAt(type: ChallengeType): number {
    return type === "daily" ? getNextDailyReset() : getNextWeeklyReset();
}

export interface ChallengeProgressDto {
    id: number;
    challengeKey: string;
    label: string;
    challengeType: ChallengeType;
    progress: number;
    target: number;
    completed: boolean;
    claimed: boolean;
    rewardXp: number;
    resetAt: number;
}

export async function ensureActiveChallenges(characterId: number): Promise<void> {
    const repo = RAGERP.database.getRepository(PlayerChallengeProgressEntity);
    const now = Date.now();
    const existing = await repo.find({ where: { characterId } });

    for (const row of existing) {
        if (row.resetAt < now) {
            await repo.remove(row);
        }
    }

    const remaining = await repo.find({ where: { characterId } });
    const existingKeys = new Set(remaining.map((r) => r.challengeKey));

    for (const def of ALL_CHALLENGES) {
        if (existingKeys.has(def.key)) continue;
        const row = repo.create({
            characterId,
            challengeKey: def.key,
            challengeType: def.type,
            progress: 0,
            target: def.target,
            completed: false,
            claimed: false,
            resetAt: getResetAt(def.type)
        });
        await repo.save(row);
    }
}

export async function getChallengesForCharacter(characterId: number): Promise<ChallengeProgressDto[]> {
    await ensureActiveChallenges(characterId);
    const repo = RAGERP.database.getRepository(PlayerChallengeProgressEntity);
    const rows = await repo.find({ where: { characterId }, order: { challengeType: "ASC", challengeKey: "ASC" } });
    return rows.map((r) => {
        const def = getChallengeDef(r.challengeKey);
        return {
            id: r.id,
            challengeKey: r.challengeKey,
            label: def?.label ?? r.challengeKey,
            challengeType: r.challengeType as ChallengeType,
            progress: r.progress,
            target: r.target,
            completed: r.completed,
            claimed: r.claimed,
            rewardXp: def?.rewardXp ?? 0,
            resetAt: Number(r.resetAt)
        };
    });
}

export async function incrementChallengeProgress(
    characterId: number,
    statKey: string,
    amount: number = 1
): Promise<void> {
    const challenges = getChallengesByStatKey(statKey);
    if (challenges.length === 0) return;

    const repo = RAGERP.database.getRepository(PlayerChallengeProgressEntity);
    const now = Date.now();

    for (const def of challenges) {
        let row = await repo.findOne({ where: { characterId, challengeKey: def.key } });
        if (!row) {
            await ensureActiveChallenges(characterId);
            row = await repo.findOne({ where: { characterId, challengeKey: def.key } });
        }
        if (!row || row.claimed) continue;
        if (row.resetAt < now) {
            row.progress = 0;
            row.completed = false;
            row.resetAt = getResetAt(def.type);
        }
        row.progress = Math.min(row.progress + amount, row.target);
        if (row.progress >= row.target) row.completed = true;
        await repo.save(row);
    }
}

export async function completeChallengeIfNeeded(characterId: number, challengeKey: string): Promise<boolean> {
    const def = getChallengeDef(challengeKey);
    if (!def) return false;
    const repo = RAGERP.database.getRepository(PlayerChallengeProgressEntity);
    const row = await repo.findOne({ where: { characterId, challengeKey } });
    if (!row || row.claimed) return false;
    if (row.progress >= row.target) {
        row.completed = true;
        await repo.save(row);
        return true;
    }
    return false;
}

export async function claimChallengeReward(characterId: number, challengeKey: string): Promise<{ ok: boolean; xpAwarded?: number }> {
    const def = getChallengeDef(challengeKey);
    if (!def) return { ok: false };

    const repo = RAGERP.database.getRepository(PlayerChallengeProgressEntity);
    const row = await repo.findOne({ where: { characterId, challengeKey } });
    if (!row || row.claimed) return { ok: false };
    if (row.progress < row.target) return { ok: false };

    row.claimed = true;
    await repo.save(row);
    await addXp(characterId, def.rewardXp);
    return { ok: true, xpAwarded: def.rewardXp };
}
