/**
 * Stats event hooks. Call these from match modes when combat/match events occur.
 * Extracts character ID from players and delegates to StatsManager.
 */
import { recordKill, recordDeath, recordMatchWin, recordMatchLoss, recordMatchPlayed } from "./StatsManager";
import { applyKillXp, applyMatchXpResult } from "./ProgressionManager";
import { incrementChallengeProgress } from "./ChallengeManager";
import { isSeasonActive, getActiveSeason, recordSeasonalKill, recordSeasonalDeath, addSeasonalXp, applySeasonalMatchXp } from "../seasons/SeasonManager";

function getCharacterId(player: PlayerMp): number | null {
    return player?.character?.id ?? null;
}

/**
 * Call when a player dies in a match. Records death for victim, kill for killer (if any).
 * headshot: true if the killing blow was a headshot (for XP bonus).
 * matchDimension: optional, for XP tracking in match result.
 */
export function onMatchDeath(victim: PlayerMp, killer?: PlayerMp, headshot?: boolean, matchDimension?: number): void {
    const victimId = getCharacterId(victim);
    if (victimId !== null) {
        recordDeath(victimId).catch((err) => console.error("[Stats] recordDeath failed:", err));
        if (isSeasonActive()) {
            const season = getActiveSeason();
            if (season) recordSeasonalDeath(season.seasonId, victimId).catch((err) => console.error("[Stats] recordSeasonalDeath failed:", err));
        }
    }
    if (killer) {
        const killerId = getCharacterId(killer);
        if (killerId !== null) {
            recordKill(killerId).catch((err) => console.error("[Stats] recordKill failed:", err));
            applyKillXp(killerId, !!headshot, matchDimension).catch((err) => console.error("[Stats] applyKillXp failed:", err));
            if (isSeasonActive()) {
                const season = getActiveSeason();
                if (season) {
                    recordSeasonalKill(season.seasonId, killerId).catch((err) => console.error("[Stats] recordSeasonalKill failed:", err));
                    const xpAmount = 10 + (headshot ? 5 : 0);
                    addSeasonalXp(season.seasonId, killerId, xpAmount).catch((err) => console.error("[Stats] addSeasonalXp failed:", err));
                }
            }
        }
    }
}

/**
 * Call when a match ends. Records win/loss/draw for all players.
 * Pass player objects; character IDs are extracted (players without character are skipped).
 * matchDimension: optional, for XP tracking in match result.
 * Returns Promise that resolves when all records (including XP) are done.
 */
export async function onMatchEnd(
    winner: "red" | "blue" | "draw",
    redTeamPlayers: PlayerMp[],
    blueTeamPlayers: PlayerMp[],
    matchDimension?: number
): Promise<void> {
    const getCharacterIds = (players: PlayerMp[]): number[] =>
        players.map((p) => getCharacterId(p)).filter((id): id is number => id !== null);

    const record = async (characterId: number, isWin: boolean, isLoss: boolean) => {
        try {
            if (isWin) await recordMatchWin(characterId);
            else if (isLoss) await recordMatchLoss(characterId);
            else await recordMatchPlayed(characterId);
            await applyMatchXpResult({ characterId, isWin, isLoss }, matchDimension);
            if (isSeasonActive()) {
                const season = getActiveSeason();
                if (season) {
                    await applySeasonalMatchXp(season.seasonId, characterId, isWin, isLoss);
                }
            }
            await incrementChallengeProgress(characterId, "play_matches", 1);
            if (isWin) await incrementChallengeProgress(characterId, "win_matches", 1);
        } catch (err) {
            console.error("[Stats] recordMatchEnd failed:", err);
        }
    };

    const winningIds = winner === "red" ? getCharacterIds(redTeamPlayers) : winner === "blue" ? getCharacterIds(blueTeamPlayers) : [];
    const losingIds = winner === "red" ? getCharacterIds(blueTeamPlayers) : winner === "blue" ? getCharacterIds(redTeamPlayers) : [];
    const drawIds = winner === "draw" ? getCharacterIds([...redTeamPlayers, ...blueTeamPlayers]) : [];

    await Promise.all([
        ...winningIds.map((id) => record(id, true, false)),
        ...losingIds.map((id) => record(id, false, true)),
        ...drawIds.map((id) => record(id, false, false))
    ]);
}
