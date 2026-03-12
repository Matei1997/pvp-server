/**
 * Player profile / stats for Hopouts. Uses existing PlayerStats.
 * Includes seasonal stats when a season is active.
 */
import { RAGERP } from "@api";
import { PlayerStatsEntity } from "./PlayerStats.entity";
import { CharacterEntity } from "@entities/Character.entity";
import { getPlayerRank } from "./LeaderboardManager";
import { getRequiredXpForLevel } from "./ProgressionManager";
import { isSeasonActive, getActiveSeason, ensureSeasonStats } from "../seasons/SeasonManager";
import { getPrestigeStatus, MAX_LEVEL } from "./PrestigeManager";

export interface PlayerProfile {
    playerId: number;
    playerName: string;
    mmr: number;
    rankTier: string;
    placementMatchesPlayed: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
    kills: number;
    deaths: number;
    kd: number;
    winRate: number;
    leaderboardRank?: number;
    xp: number;
    level: number;
    currentLevelProgress: number;
    xpForNextLevel: number;
    prestige: number;
    maxLevel: number;
    canPrestige: boolean;
    /** When season active */
    seasonName?: string;
    seasonalMmr?: number;
    seasonalRankTier?: string;
    seasonalWins?: number;
    seasonalLosses?: number;
    seasonalKills?: number;
    seasonalDeaths?: number;
    seasonalXp?: number;
    seasonalLevel?: number;
    seasonalPlacementMatchesPlayed?: number;
}

/** playerId in PlayerStats = character ID */
export async function getPlayerProfile(characterId: number): Promise<PlayerProfile | null> {
    return getPlayerProfileByCharacterId(characterId);
}

export async function getPlayerProfileByCharacterId(characterId: number): Promise<PlayerProfile | null> {
    const statsRepo = RAGERP.database.getRepository(PlayerStatsEntity);
    const charRepo = RAGERP.database.getRepository(CharacterEntity);

    const stats = await statsRepo.findOne({ where: { playerId: characterId } });
    if (!stats) return null;

    const char = await charRepo.findOne({ where: { id: characterId }, select: ["id", "name"] });
    const playerName = char?.name ?? `Player #${characterId}`;

    const kd = stats.kills / Math.max(1, stats.deaths);
    const winRate = stats.wins / Math.max(1, stats.matchesPlayed);
    const xpForNextLevel = getRequiredXpForLevel(stats.level);
    const currentLevelProgress = stats.xp;

    let leaderboardRank: number | undefined;
    try {
        const rankResult = await getPlayerRank(characterId);
        if (rankResult) leaderboardRank = rankResult.rank;
    } catch {
        /* optional */
    }

    const prestigeStatus = await getPrestigeStatus(characterId);
    const profile: PlayerProfile = {
        playerId: characterId,
        playerName,
        mmr: stats.mmr,
        rankTier: stats.rankTier,
        placementMatchesPlayed: stats.placementMatchesPlayed,
        matchesPlayed: stats.matchesPlayed,
        wins: stats.wins,
        losses: stats.losses,
        kills: stats.kills,
        deaths: stats.deaths,
        kd,
        winRate,
        leaderboardRank,
        xp: stats.xp,
        level: stats.level,
        currentLevelProgress,
        xpForNextLevel,
        prestige: prestigeStatus.prestige,
        maxLevel: MAX_LEVEL,
        canPrestige: prestigeStatus.canPrestige
    };

    if (isSeasonActive()) {
        const season = getActiveSeason();
        if (season) {
            try {
                const seasonStats = await ensureSeasonStats(season.seasonId, characterId);
                profile.seasonName = season.name;
                profile.seasonalMmr = seasonStats.seasonalMMR;
                profile.seasonalRankTier = seasonStats.seasonalRankTier;
                profile.seasonalWins = seasonStats.seasonalWins;
                profile.seasonalLosses = seasonStats.seasonalLosses;
                profile.seasonalKills = seasonStats.seasonalKills;
                profile.seasonalDeaths = seasonStats.seasonalDeaths;
                profile.seasonalXp = seasonStats.seasonalXp;
                profile.seasonalLevel = seasonStats.seasonalLevel;
                profile.seasonalPlacementMatchesPlayed = seasonStats.seasonalPlacementMatchesPlayed;
                profile.xpForNextLevel = getRequiredXpForLevel(seasonStats.seasonalLevel);
            } catch {
                /* optional */
            }
        }
    }

    return profile;
}
