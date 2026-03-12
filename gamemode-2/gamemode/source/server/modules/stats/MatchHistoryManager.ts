/**
 * Match history for Hopouts. Records recent match summaries at centralized match end.
 */
import { RAGERP } from "@api";
import { PlayerMatchHistoryEntity } from "./PlayerMatchHistory.entity";

export interface RecordMatchHistoryInput {
    characterId: number;
    matchId: string;
    result: "Win" | "Loss";
    team: "red" | "blue";
    kills: number;
    deaths: number;
    mmrChange: number;
    xpGained: number;
    levelAfter: number;
    rankTierAfter: string;
}

export async function recordPlayerMatchHistory(input: RecordMatchHistoryInput): Promise<void> {
    const kd = input.deaths > 0 ? input.kills / input.deaths : input.kills;
    const repo = RAGERP.database.getRepository(PlayerMatchHistoryEntity);
    const row = repo.create({
        characterId: input.characterId,
        matchId: input.matchId,
        result: input.result,
        team: input.team,
        kills: input.kills,
        deaths: input.deaths,
        kd,
        mmrChange: input.mmrChange,
        xpGained: input.xpGained,
        levelAfter: input.levelAfter,
        rankTierAfter: input.rankTierAfter
    });
    await repo.save(row);
}

export interface MatchHistoryEntry {
    id: number;
    result: "Win" | "Loss";
    team: "red" | "blue";
    kills: number;
    deaths: number;
    kd: number;
    mmrChange: number;
    xpGained: number;
    levelAfter: number;
    rankTierAfter: string;
    createdAt: Date;
}

export async function getRecentMatchesByCharacterId(
    characterId: number,
    limit: number = 10
): Promise<MatchHistoryEntry[]> {
    const repo = RAGERP.database.getRepository(PlayerMatchHistoryEntity);
    const rows = await repo.find({
        where: { characterId },
        order: { createdAt: "DESC" },
        take: limit
    });
    return rows.map((r) => ({
        id: r.id,
        result: r.result as "Win" | "Loss",
        team: r.team as "red" | "blue",
        kills: r.kills,
        deaths: r.deaths,
        kd: r.kd,
        mmrChange: r.mmrChange,
        xpGained: r.xpGained,
        levelAfter: r.levelAfter,
        rankTierAfter: r.rankTierAfter,
        createdAt: r.createdAt
    }));
}

/** Alias for profile flow; playerId = characterId in Hopouts. */
export async function getRecentMatchesByPlayerId(
    playerId: number,
    limit: number = 10
): Promise<MatchHistoryEntry[]> {
    return getRecentMatchesByCharacterId(playerId, limit);
}
