/**
 * FFA (Free For All) match manager. No teams, respawn on death, first to score wins.
 */
import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { IArenaPreset } from "@shared/interfaces/ArenaPreset.interface";
import { allocateDimension } from "@modules/matchmaking/QueueManager";
import { FFA_CONFIG, FFA_WEAPONS, FFA_AMMO } from "./FfaConfig";
import { getArenaPresets } from "../hopouts/ArenaPresets.asset";

interface FfaPlayer {
    id: number;
    name: string;
    score: number;
    deaths: number;
    characterId?: number;
}

export interface FfaMatchData {
    dimension: number;
    state: "active" | "match_end";
    mapId: string;
    mapName: string;
    preset: IArenaPreset;
    players: FfaPlayer[];
    scoreToWin: number;
    spawnPoints: { x: number; y: number; z: number; heading?: number }[];
}

const ffaMatches = new Map<number, FfaMatchData>();
const ffaPlayerToMatch = new Map<number, number>();

function getSpawnPoints(preset: IArenaPreset): { x: number; y: number; z: number; heading?: number }[] {
    const points: { x: number; y: number; z: number; heading?: number }[] = [];
    if (preset.redSpawn) points.push(preset.redSpawn);
    if (preset.blueSpawn) points.push(preset.blueSpawn);
    if (preset.center) points.push({ ...preset.center, heading: 0 });
    if (preset.safeNodes?.length) {
        preset.safeNodes.forEach((n) => points.push({ ...n, heading: 0 }));
    }
    return points.length > 0 ? points : [{ x: 0, y: 0, z: 70, heading: 0 }];
}

function pickRandomSpawn(match: FfaMatchData): { x: number; y: number; z: number; heading?: number } {
    const pts = match.spawnPoints;
    return pts[Math.floor(Math.random() * pts.length)];
}

function getAlivePlayers(match: FfaMatchData): PlayerMp[] {
    const result: PlayerMp[] = [];
    for (const p of match.players) {
        const mp_ = mp.players.at(p.id);
        if (mp_ && mp.players.exists(mp_) && mp_.health > 0) result.push(mp_);
    }
    return result;
}

function emitToAll(match: FfaMatchData, event: string, data: unknown): void {
    match.players.forEach((p) => {
        const mp_ = mp.players.at(p.id);
        if (mp_ && mp.players.exists(mp_)) {
            (RAGERP.cef.emit as Function)(mp_, "ffa", event, data);
        }
    });
}

function emitFfaUpdate(match: FfaMatchData): void {
    const leaderboard = match.players
        .map((p) => ({ id: p.id, name: p.name, score: p.score, deaths: p.deaths }))
        .sort((a, b) => b.score - a.score);
    emitToAll(match, "matchUpdate", {
        state: match.state,
        scoreToWin: match.scoreToWin,
        leaderboard,
        topPlayer: leaderboard[0] ?? null
    });
}

function giveFfaWeapons(player: PlayerMp): void {
    player.removeAllWeapons();
    FFA_WEAPONS.forEach((hash) => {
        player.giveWeaponEx(hash, FFA_AMMO, 30);
    });
}

function spawnFfaPlayer(player: PlayerMp, match: FfaMatchData): void {
    const spawn = pickRandomSpawn(match);
    player.dimension = match.dimension;
    player.spawn(new mp.Vector3(spawn.x, spawn.y, spawn.z));
    player.heading = spawn.heading ?? 0;
    player.health = 100;
    player.armour = 100;
    player.setVariable("arenaEffectiveHp", 100);
    player.setVariable("isDead", false);
    if (player.character) {
        player.character.deathState = RageShared.Players.Enums.DEATH_STATES.STATE_NONE;
        player.character.setStoreData(player, "isDead", false);
    }
    player.setOwnVariable("deathAnim", null);
    player.stopScreenEffect("DeathFailMPIn");
    giveFfaWeapons(player);
    player.call("client::player:setVitals", [100, 100]);
    player.call("client::arena:requestCollision", [spawn.x, spawn.y, spawn.z]);
}

export function isPlayerInFfaMatch(player: PlayerMp): boolean {
    return ffaPlayerToMatch.has(player.id);
}

export function getFfaMatchByPlayer(player: PlayerMp): FfaMatchData | undefined {
    const dim = ffaPlayerToMatch.get(player.id);
    return dim !== undefined ? ffaMatches.get(dim) : undefined;
}

export function getFfaMatchByDimension(dim: number): FfaMatchData | undefined {
    return ffaMatches.get(dim);
}

export function startFfaMatch(players: PlayerMp[]): number {
    const presets = getArenaPresets();
    const preset = presets.length > 0 ? presets[Math.floor(Math.random() * presets.length)] : null;
    if (!preset) {
        console.error("[FFA] No arena presets available");
        return 0;
    }

    const dimension = allocateDimension();
    const spawnPoints = getSpawnPoints(preset);
    const match: FfaMatchData = {
        dimension,
        state: "active",
        mapId: preset.id,
        mapName: preset.name,
        preset,
        players: players.map((p) => ({
            id: p.id,
            name: p.name,
            score: 0,
            deaths: 0,
            characterId: p.character?.id
        })),
        scoreToWin: FFA_CONFIG.scoreToWin,
        spawnPoints
    };

    ffaMatches.set(dimension, match);
    players.forEach((p) => ffaPlayerToMatch.set(p.id, dimension));

    players.forEach((p) => {
        spawnFfaPlayer(p, match);
        p.setVariable("arenaTeammateIds", []);
        p.setVariable("currentTeam", undefined);
    });

    emitFfaUpdate(match);
    return dimension;
}

/**
 * Called when a player dies in FFA. Schedules respawn after delay.
 * Returns true if death was handled (caller should not run other death logic).
 */
export function handleFfaDeath(victim: PlayerMp, killer?: PlayerMp): boolean {
    const match = getFfaMatchByPlayer(victim);
    if (!match || match.state !== "active") return false;

    const victimData = match.players.find((p) => p.id === victim.id);
    if (!victimData) return false;

    victimData.deaths++;
    if (killer && mp.players.exists(killer)) {
        const killerData = match.players.find((p) => p.id === killer.id);
        if (killerData && killerData.id !== victim.id) {
            killerData.score++;
            if (killerData.score >= match.scoreToWin) {
                endFfaMatch(match.dimension);
                return true;
            }
        }
    }

    emitFfaUpdate(match);

    setTimeout(() => {
        const m = getFfaMatchByDimension(match.dimension);
        if (!m || m.state !== "active") return;
        const p = mp.players.at(victim.id);
        if (!p || !mp.players.exists(p)) return;
        spawnFfaPlayer(p, m);
        emitFfaUpdate(m);
    }, FFA_CONFIG.respawnDelaySeconds * 1000);

    return true;
}

function endFfaMatch(dimension: number): void {
    const match = ffaMatches.get(dimension);
    if (!match) return;
    if (match.state === "match_end") return;

    match.state = "match_end";
    const sorted = [...match.players].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    match.players.forEach((p) => ffaPlayerToMatch.delete(p.id));
    ffaMatches.delete(dimension);

    const allPlayers = match.players
        .map((p) => mp.players.at(p.id))
        .filter((p): p is PlayerMp => !!p && mp.players.exists(p));

    allPlayers.forEach((p) => {
        p.dimension = 0;
        p.removeAllWeapons();
        p.call("client::player:freeze", [false]);
        p.setVariable("arenaTeammateIds", []);
        p.setVariable("currentTeam", undefined);
        (RAGERP.cef.emit as Function)(p, "ffa", "matchEnd", {
            winner: winner ? { id: winner.id, name: winner.name, score: winner.score } : null,
            leaderboard: sorted.map((x) => ({ id: x.id, name: x.name, score: x.score, deaths: x.deaths }))
        });
    });

    setTimeout(() => {
        allPlayers.forEach((p) => {
            if (mp.players.exists(p)) {
                RAGERP.cef.startPage(p, "mainmenu");
                RAGERP.cef.emit(p, "system", "setPage", "mainmenu");
            }
        });
    }, 8000);
}

export function leaveFfaMatch(player: PlayerMp): boolean {
    const match = getFfaMatchByPlayer(player);
    if (!match) return false;

    const idx = match.players.findIndex((p) => p.id === player.id);
    if (idx >= 0) match.players.splice(idx, 1);
    ffaPlayerToMatch.delete(player.id);

    player.dimension = 0;
    player.removeAllWeapons();
    player.setVariable("arenaTeammateIds", []);
    player.setVariable("currentTeam", undefined);
    RAGERP.cef.startPage(player, "mainmenu");
    RAGERP.cef.emit(player, "system", "setPage", "mainmenu");
    (RAGERP.cef.emit as Function)(player, "ffa", "leftMatch", null);

    if (match.players.length === 0) {
        ffaMatches.delete(match.dimension);
    } else {
        emitFfaUpdate(match);
    }
    return true;
}
