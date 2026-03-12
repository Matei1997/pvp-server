/**
 * Leaderboard for ranked Hopouts. Top players by MMR.
 * Uses seasonal stats when a season is active.
 */
import { In } from "typeorm";
import { RAGERP } from "@api";
import { PlayerStatsEntity } from "./PlayerStats.entity";
import { PlayerSeasonStatsEntity } from "../seasons/PlayerSeasonStats.entity";
import { CharacterEntity } from "@entities/Character.entity";
import { isSeasonActive, getActiveSeason } from "../seasons/SeasonManager";

export interface LeaderboardEntry {
    playerId: number;
    playerName: string;
    mmr: number;
    rankTier: string;
    wins: number;
    losses: number;
    kills: number;
    deaths: number;
}

export interface LeaderboardResult {
    entries: LeaderboardEntry[];
    seasonName?: string;
    useSeasonal?: boolean;
}

export async function getTopPlayers(limit: number = 100): Promise<LeaderboardResult> {
    const charRepo = RAGERP.database.getRepository(CharacterEntity);

    if (isSeasonActive()) {
        const season = getActiveSeason();
        if (season) {
            const repo = RAGERP.database.getRepository(PlayerSeasonStatsEntity);
            const stats = await repo.find({
                where: { seasonId: season.seasonId },
                order: { seasonalMMR: "DESC" },
                take: limit,
                select: ["characterId", "seasonalMMR", "seasonalRankTier", "seasonalWins", "seasonalLosses", "seasonalKills", "seasonalDeaths"]
            });

            if (stats.length === 0) return { entries: [], seasonName: season.name, useSeasonal: true };

            const ids = stats.map((s) => s.characterId);
            const chars = await charRepo.find({
                where: { id: In(ids) },
                select: ["id", "name"]
            });
            const nameMap = new Map(chars.map((c) => [c.id, c.name]));

            return {
                entries: stats.map((s) => ({
                    playerId: s.characterId,
                    playerName: nameMap.get(s.characterId) ?? `Player #${s.characterId}`,
                    mmr: s.seasonalMMR,
                    rankTier: s.seasonalRankTier,
                    wins: s.seasonalWins,
                    losses: s.seasonalLosses,
                    kills: s.seasonalKills,
                    deaths: s.seasonalDeaths
                })),
                seasonName: season.name,
                useSeasonal: true
            };
        }
    }

    const repo = RAGERP.database.getRepository(PlayerStatsEntity);
    const stats = await repo.find({
        order: { mmr: "DESC" },
        take: limit,
        select: ["playerId", "mmr", "rankTier", "wins", "losses", "kills", "deaths"]
    });

    if (stats.length === 0) return { entries: [] };

    const ids = stats.map((s) => s.playerId);
    const chars = await charRepo.find({
        where: { id: In(ids) },
        select: ["id", "name"]
    });
    const nameMap = new Map(chars.map((c) => [c.id, c.name]));

    return {
        entries: stats.map((s) => ({
            playerId: s.playerId,
            playerName: nameMap.get(s.playerId) ?? `Player #${s.playerId}`,
            mmr: s.mmr,
            rankTier: s.rankTier,
            wins: s.wins,
            losses: s.losses,
            kills: s.kills,
            deaths: s.deaths
        }))
    };
}

export interface PlayerRankResult {
    rank: number;
    entry: LeaderboardEntry;
    seasonName?: string;
    useSeasonal?: boolean;
}

export async function getPlayerRank(playerId: number): Promise<PlayerRankResult | null> {
    const charRepo = RAGERP.database.getRepository(CharacterEntity);

    if (isSeasonActive()) {
        const season = getActiveSeason();
        if (season) {
            const repo = RAGERP.database.getRepository(PlayerSeasonStatsEntity);
            const allOrdered = await repo.find({
                where: { seasonId: season.seasonId },
                order: { seasonalMMR: "DESC" },
                select: ["characterId", "seasonalMMR", "seasonalRankTier", "seasonalWins", "seasonalLosses", "seasonalKills", "seasonalDeaths"]
            });

            const rank = allOrdered.findIndex((s) => s.characterId === playerId);
            if (rank < 0) return null;

            const char = await charRepo.findOne({ where: { id: playerId }, select: ["id", "name"] });
            const s = allOrdered[rank];
            const entry: LeaderboardEntry = {
                playerId,
                playerName: char?.name ?? `Player #${playerId}`,
                mmr: s.seasonalMMR,
                rankTier: s.seasonalRankTier,
                wins: s.seasonalWins,
                losses: s.seasonalLosses,
                kills: s.seasonalKills,
                deaths: s.seasonalDeaths
            };

            return { rank: rank + 1, entry, seasonName: season.name, useSeasonal: true };
        }
    }

    const repo = RAGERP.database.getRepository(PlayerStatsEntity);
    const allOrdered = await repo.find({
        order: { mmr: "DESC" },
        select: ["playerId", "mmr", "rankTier", "wins", "losses", "kills", "deaths"]
    });

    const rank = allOrdered.findIndex((s) => s.playerId === playerId);
    if (rank < 0) return null;

    const char = await charRepo.findOne({ where: { id: playerId }, select: ["id", "name"] });
    const s = allOrdered[rank];
    const entry: LeaderboardEntry = {
        playerId,
        playerName: char?.name ?? `Player #${playerId}`,
        mmr: s.mmr,
        rankTier: s.rankTier,
        wins: s.wins,
        losses: s.losses,
        kills: s.kills,
        deaths: s.deaths
    };

    return { rank: rank + 1, entry };
}
