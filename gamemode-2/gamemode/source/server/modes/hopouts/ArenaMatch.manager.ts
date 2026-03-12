import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { startSpectate, stopSpectate } from "@events/Player.event";
import { IArenaPreset } from "@shared/interfaces/ArenaPreset.interface";
import { ARENA_CONFIG, WEAPON_ROTATION, VEHICLE_POOL, ARENA_AMMO, ITEM_CONFIG } from "./ArenaConfig";
import { startZone, stopZone } from "./ZoneSystem";
import { applyWeaponPresets } from "../../arena/WeaponPresets.service";
import { onMatchDeath as statsOnMatchDeath, onMatchEnd as statsOnMatchEnd } from "@modules/stats/StatsEvents";
import { applyClutchXp, clearMatchXpResults, getMatchXpResult } from "@modules/stats/ProgressionManager";
import { incrementChallengeProgress } from "@modules/stats/ChallengeManager";
import {
    updateRankedMatchResult,
    type RankedMatchPlayerInput,
    type RankedMatchResult
} from "@modules/stats/StatsManager";
import { isSeasonActive, getActiveSeason, updateSeasonalRankedMatchResult } from "@modules/seasons/SeasonManager";
import { recordPlayerMatchHistory } from "@modules/stats/MatchHistoryManager";
import {
    getMatchByDimension as matchGetByDimension,
    getMatchByPlayer as matchGetByPlayer,
    isPlayerInMatch as matchIsPlayerInMatch,
    getTeam as matchGetTeam,
    isAliveInMatch as matchIsAliveInMatch,
    registerMatch as matchRegister,
    unregisterMatch as matchUnregister,
    unregisterPlayer as matchUnregisterPlayer,
    registerPlayer as matchRegisterPlayer,
    getAllMatches
} from "@modules/matches/MatchManager";
import { recordDisconnect, tryReconnect, type Team as ReconnectTeam } from "@modules/matches/ReconnectManager";
import { buildDeathRecap, clearVictim } from "@modules/combat/DeathRecapTracker";
import { weaponUnhash } from "@assets/Weapons.assets";

type MatchState = "warmup" | "active" | "round_end" | "match_end";
type Team = "red" | "blue";

interface MatchPlayer {
    id: number;
    name: string;
    alive: boolean;
    kills: number;
    deaths: number;
    /** Kills this round (for clutch detection). Reset at round start. */
    roundKills: number;
    /** Headshot kills this match (for XP calculation). */
    headshotKills: number;
    /** Clutch rounds won this match (for XP calculation). */
    clutchCount: number;
    /** For reconnect: stable identifier across sessions */
    characterId?: number;
    /** True when player disconnected but within reconnect window */
    disconnected?: boolean;
    /** After this timestamp, player no longer counts as alive for round resolution (round-presence grace) */
    roundPresenceDeadline?: number;
}

export interface ArenaMatchData {
    dimension: number;
    mapId: string;
    mapName: string;
    state: MatchState;
    redTeam: MatchPlayer[];
    blueTeam: MatchPlayer[];
    redScore: number;
    blueScore: number;
    currentRound: number;
    matchEndsAt: number;
    roundEndsAt: number;
    preset: IArenaPreset;
    zoneCenter?: { x: number; y: number; z: number };
    vehicles: VehicleMp[];
    /** Random weapon set for this round (same for all players). */
    roundWeaponSet: { name: string; weapons: number[] };
    /** True when lastAlive event was emitted this round. Reset at round start. */
    lastAliveEmittedThisRound?: boolean;
}

export const getMatchByDimension = matchGetByDimension<ArenaMatchData>;
export const getMatchByPlayer = matchGetByPlayer<ArenaMatchData>;
export const isPlayerInArenaMatch = matchIsPlayerInMatch;
export const getTeam = matchGetTeam;
export const isAliveInMatch = matchIsAliveInMatch;

function getTeamPlayers(match: ArenaMatchData, team: Team): MatchPlayer[] {
    return team === "red" ? match.redTeam : match.blueTeam;
}

/** Players who count as alive for round resolution. Excludes disconnected players past round-presence grace. */
function getAlivePlayers(match: ArenaMatchData, team: Team): MatchPlayer[] {
    const now = Date.now();
    return getTeamPlayers(match, team).filter((p) => {
        if (!p.alive) return false;
        if (!p.disconnected) return true;
        if (p.roundPresenceDeadline && now < p.roundPresenceDeadline) return true;
        return false;
    });
}

/** Returns alive teammates for spectating. Excludes the given player. */
export function getSpectatableTeammates(playerId: number): { playerId: number; playerName: string }[] {
    const player = mp.players.at(playerId);
    if (!player || !mp.players.exists(player)) return [];
    const match = getMatchByPlayer(player);
    if (!match || match.state !== "active") return [];
    const team = getTeam(match, playerId);
    if (!team) return [];
    const alive = getAlivePlayers(match, team);
    return alive
        .filter((p) => p.id !== playerId)
        .map((p) => ({ playerId: p.id, playerName: p.name }));
}

function pickRandomWeaponSet(): { name: string; weapons: number[] } {
    const entry = WEAPON_ROTATION[Math.floor(Math.random() * WEAPON_ROTATION.length)];
    return { name: entry.name, weapons: [...entry.weapons] };
}

function getZoneCenter(preset: IArenaPreset): { x: number; y: number; z: number } {
    const safe = preset.safeNodes;
    if (safe && safe.length > 0) {
        return safe[Math.floor(Math.random() * safe.length)];
    }
    return preset.center;
}

function giveRoundWeapons(player: PlayerMp, weapons: number[]): void {
    player.removeAllWeapons();
    player.call("client::recoil:reset");
    weapons.forEach((hash) => {
        player.giveWeaponEx(hash, ARENA_AMMO, 30);
    });
    applyWeaponPresets(player, weapons);
    player.setVariable("weaponsOnBody", weapons);
}

function randomVehicleModel(): string {
    return VEHICLE_POOL[Math.floor(Math.random() * VEHICLE_POOL.length)];
}

function spawnTeamVehicles(match: ArenaMatchData, team: Team, spawnPoint: { x: number; y: number; z: number; heading?: number }): void {
    const players = getTeamPlayers(match, team);
    const vehicleCount = Math.ceil(players.length / 2);
    for (let i = 0; i < vehicleCount; i++) {
        const model = randomVehicleModel();
        const offset = i * 6;
        const heading = spawnPoint.heading ?? 0;
        const rad = (heading * Math.PI) / 180;
        const vx = spawnPoint.x + Math.sin(rad) * offset;
        const vy = spawnPoint.y + Math.cos(rad) * offset;
        try {
            const veh = mp.vehicles.new(mp.joaat(model), new mp.Vector3(vx, vy, spawnPoint.z), {
                heading,
                dimension: match.dimension,
                locked: false,
                engine: true
            });
            match.vehicles.push(veh);
        } catch (e) {
            console.error(`[Arena] Failed to spawn vehicle ${model}:`, e);
        }
    }
}

function destroyMatchVehicles(match: ArenaMatchData): void {
    match.vehicles.forEach((veh) => {
        try {
            if (mp.vehicles.exists(veh)) veh.destroy();
        } catch {
            /* ignore */
        }
    });
    match.vehicles = [];
}

function getAllMatchPlayerMps(match: ArenaMatchData): PlayerMp[] {
    const ids = [...match.redTeam, ...match.blueTeam].map((p) => p.id);
    const result: PlayerMp[] = [];
    ids.forEach((id) => {
        const p = mp.players.at(id);
        if (p && mp.players.exists(p)) result.push(p);
    });
    return result;
}

/** Set arenaTeammateIds and currentTeam for voice radio and /team chat during hopouts. */
function setArenaVoiceAndTeam(match: ArenaMatchData): void {
    getAllMatchPlayerMps(match).forEach((p) => {
        const team = getTeam(match, p.id);
        if (!team) return;
        const teammates = getTeamPlayers(match, team).map((m) => m.id).filter((id) => id !== p.id);
        p.setVariable("arenaTeammateIds", teammates);
        p.setVariable("currentTeam", team);
    });
}

/** Clear arena voice/team vars when leaving match. */
function clearArenaVoiceAndTeam(player: PlayerMp): void {
    player.setVariable("arenaTeammateIds", []);
    player.setVariable("currentTeam", undefined);
}

function emitToAll(match: ArenaMatchData, event: string, data: any): void {
    getAllMatchPlayerMps(match).forEach((p) => {
        (RAGERP.cef.emit as Function)(p, "arena", event, data);
    });
}

function buildMatchUpdate(match: ArenaMatchData): object {
    const timeLeft = match.state === "active" ? Math.max(0, Math.ceil((match.roundEndsAt - Date.now()) / 1000)) : 0;
    return {
        state: match.state,
        redScore: match.redScore,
        blueScore: match.blueScore,
        currentRound: match.currentRound,
        roundsToWin: ARENA_CONFIG.roundsToWin,
        weaponName: match.roundWeaponSet.name,
        redAlive: getAlivePlayers(match, "red").length,
        blueAlive: getAlivePlayers(match, "blue").length,
        redTeam: match.redTeam.map((p) => {
            const mp_ = mp.players.at(p.id);
            const health = mp_ && mp.players.exists(mp_) ? Math.max(0, Math.min(100, mp_.health)) : 0;
            const armor = mp_ && mp.players.exists(mp_) ? Math.max(0, Math.min(100, mp_.armour)) : 0;
            return { id: p.id, name: p.name, kills: p.kills, deaths: p.deaths, alive: p.alive, health, armor };
        }),
        blueTeam: match.blueTeam.map((p) => {
            const mp_ = mp.players.at(p.id);
            const health = mp_ && mp.players.exists(mp_) ? Math.max(0, Math.min(100, mp_.health)) : 0;
            const armor = mp_ && mp.players.exists(mp_) ? Math.max(0, Math.min(100, mp_.armour)) : 0;
            return { id: p.id, name: p.name, kills: p.kills, deaths: p.deaths, alive: p.alive, health, armor };
        }),
        timeLeft
    };
}

function emitMatchUpdate(match: ArenaMatchData): void {
    emitToAll(match, "matchUpdate", buildMatchUpdate(match));
}

function emitKillFeed(
    match: ArenaMatchData,
    killerId: number,
    killerName: string,
    victimId: number,
    victimName: string,
    weaponHash: string,
    weaponName: string,
    headshot: boolean = false
): void {
    emitToAll(match, "killFeed", {
        killerId,
        killerName,
        victimId,
        victimName,
        weaponHash,
        weaponName,
        headshot
    });
}

function emitAliveCount(match: ArenaMatchData): void {
    emitToAll(match, "aliveCount", {
        redAlive: getAlivePlayers(match, "red").length,
        blueAlive: getAlivePlayers(match, "blue").length
    });
}

/** Emit lastAlive when one team has exactly 1 alive and the other has >1. Fires once per round. */
function checkAndEmitLastAlive(match: ArenaMatchData): void {
    if (match.state !== "active" || match.lastAliveEmittedThisRound) return;

    const redAlive = getAlivePlayers(match, "red");
    const blueAlive = getAlivePlayers(match, "blue");

    if (redAlive.length === 1 && blueAlive.length > 1) {
        const last = redAlive[0];
        match.lastAliveEmittedThisRound = true;
        emitToAll(match, "lastAlive", {
            playerId: last.id,
            playerName: last.name,
            team: "red" as const,
            enemiesRemaining: blueAlive.length
        });
    } else if (redAlive.length > 1 && blueAlive.length === 1) {
        const last = blueAlive[0];
        match.lastAliveEmittedThisRound = true;
        emitToAll(match, "lastAlive", {
            playerId: last.id,
            playerName: last.name,
            team: "blue" as const,
            enemiesRemaining: redAlive.length
        });
    }
}

function emitRoundResult(
    match: ArenaMatchData,
    roundWinner: Team | "draw"
): void {
    const winnerTeam = roundWinner === "draw" ? "draw" : roundWinner;
    const payload: {
        winnerTeam: "red" | "blue" | "draw";
        winningPlayerId?: number;
        winningPlayerName?: string;
        clutch?: boolean;
        remainingEnemies?: number;
    } = { winnerTeam: winnerTeam as "red" | "blue" | "draw" };

    if (roundWinner !== "draw") {
        const aliveWinners = getAlivePlayers(match, roundWinner);
        if (aliveWinners.length === 1) {
            const lastAlive = aliveWinners[0];
            if (lastAlive.roundKills >= 2) {
                payload.clutch = true;
                payload.winningPlayerId = lastAlive.id;
                payload.winningPlayerName = lastAlive.name;
                payload.remainingEnemies = lastAlive.roundKills;
                if (lastAlive.characterId) {
                    lastAlive.clutchCount = (lastAlive.clutchCount ?? 0) + 1;
                    applyClutchXp(lastAlive.characterId, match.dimension).catch((err) => console.error("[Progression] applyClutchXp failed:", err));
                    incrementChallengeProgress(lastAlive.characterId, "win_clutch", 1).catch((err) =>
                        console.error("[Challenges] increment win_clutch failed:", err)
                    );
                }
            }
        }
    }

    emitToAll(match, "roundResult", payload);
}

function spawnPlayerAtArena(player: PlayerMp, spawn: { x: number; y: number; z: number; heading?: number }, dimension: number): void {
    player.dimension = dimension;
    player.spawn(new mp.Vector3(spawn.x, spawn.y, spawn.z));
    player.heading = spawn.heading ?? 0;
    player.health = 100;
    player.armour = 100;
    player.call("client::arena:requestCollision", [spawn.x, spawn.y, spawn.z]);
}

function resetPlayerArenaState(player: PlayerMp): void {
    stopSpectate(player);
    player.setVariable("isDead", false);
    if (player.character) {
        player.character.deathState = RageShared.Players.Enums.DEATH_STATES.STATE_NONE;
        player.character.setStoreData(player, "isDead", false);
    }
    player.setOwnVariable("deathAnim", null);
    player.stopScreenEffect("DeathFailMPIn");
}

export function startMatch(dimension: number, preset: IArenaPreset, redTeam: PlayerMp[], blueTeam: PlayerMp[]): void {
    const firstWeaponSet = pickRandomWeaponSet();
    const match: ArenaMatchData = {
        dimension,
        mapId: preset.id,
        mapName: preset.name,
        state: "warmup",
        redTeam: redTeam.map((p) => ({
            id: p.id,
            name: p.name,
            alive: true,
            kills: 0,
            deaths: 0,
            roundKills: 0,
            headshotKills: 0,
            clutchCount: 0,
            characterId: p.character?.id
        })),
        blueTeam: blueTeam.map((p) => ({
            id: p.id,
            name: p.name,
            alive: true,
            kills: 0,
            deaths: 0,
            roundKills: 0,
            headshotKills: 0,
            clutchCount: 0,
            characterId: p.character?.id
        })),
        redScore: 0,
        blueScore: 0,
        currentRound: 1,
        matchEndsAt: 0,
        roundEndsAt: 0,
        preset,
        vehicles: [],
        roundWeaponSet: firstWeaponSet
    };

    matchRegister(match);
    clearMatchXpResults(dimension);

    beginRound(match);
}

function beginRound(match: ArenaMatchData): void {
    match.state = "warmup";
    match.lastAliveEmittedThisRound = false;

    destroyMatchVehicles(match);

    match.redTeam.forEach((p) => (p.alive = true));
    match.blueTeam.forEach((p) => (p.alive = true));

    match.roundWeaponSet = pickRandomWeaponSet();
    const weapons = match.roundWeaponSet.weapons;

    const redSpawn = match.preset.redSpawn;
    const blueSpawn = match.preset.blueSpawn;

    const medkits = ITEM_CONFIG.medkit.countPerRound;
    const plates = ITEM_CONFIG.plate.countPerRound;

    match.redTeam.forEach((mp_) => {
        const p = mp.players.at(mp_.id);
        if (p && mp.players.exists(p)) {
            resetPlayerArenaState(p);
            spawnPlayerAtArena(p, redSpawn, match.dimension);
            p.call("client::player:freeze", [true]);
            giveRoundWeapons(p, weapons);
            p.setVariable("arenaMedkits", medkits);
            p.setVariable("arenaPlates", plates);
            p.setVariable("arenaCastActive", false);
            p.setVariable("arenaEffectiveHp", 100);
            RAGERP.cef.emit(p, "arena", "itemCounts", { medkits, plates });
            p.call("client::arena:setTeam", ["red"]);
        }
    });

    match.blueTeam.forEach((mp_) => {
        const p = mp.players.at(mp_.id);
        if (p && mp.players.exists(p)) {
            resetPlayerArenaState(p);
            spawnPlayerAtArena(p, blueSpawn, match.dimension);
            p.call("client::player:freeze", [true]);
            giveRoundWeapons(p, weapons);
            p.setVariable("arenaMedkits", medkits);
            p.setVariable("arenaPlates", plates);
            p.setVariable("arenaCastActive", false);
            p.setVariable("arenaEffectiveHp", 100);
            RAGERP.cef.emit(p, "arena", "itemCounts", { medkits, plates });
            p.call("client::arena:setTeam", ["blue"]);
        }
    });

    spawnTeamVehicles(match, "red", match.preset.redCar);
    spawnTeamVehicles(match, "blue", match.preset.blueCar);

    emitToAll(match, "roundStart", {
        round: match.currentRound,
        weaponName: match.roundWeaponSet.name,
        warmupTime: ARENA_CONFIG.warmupDuration,
        redScore: match.redScore,
        blueScore: match.blueScore,
        roundsToWin: ARENA_CONFIG.roundsToWin
    });
    emitAliveCount(match);
    emitMatchUpdate(match);

    const zoneCenter = getZoneCenter(match.preset);
    match.zoneCenter = zoneCenter;

    const cx = Number(zoneCenter?.x ?? match.preset.center?.x ?? 0);
    const cy = Number(zoneCenter?.y ?? match.preset.center?.y ?? 0);
    const initRadius = 200;
    if (!Number.isFinite(cx) || !Number.isFinite(cy) || initRadius <= 0) {
        console.warn("[Hopouts] Invalid zone center, using preset center");
    }

    getAllMatchPlayerMps(match).forEach((p) => {
        p.call("client::arena:zoneInit", [cx, cy, initRadius]);
    });

    setArenaVoiceAndTeam(match);
    startZone(match.dimension, cx, cy, ARENA_CONFIG.warmupDuration * 1000);

    setTimeout(() => {
        if (!getMatchByDimension(match.dimension)) return;
        match.state = "active";
        match.roundEndsAt = Date.now() + ARENA_CONFIG.maxRoundTime * 1000;

        getAllMatchPlayerMps(match).forEach((p) => {
            p.call("client::player:freeze", [false]);
        });

        const center = match.zoneCenter ?? match.preset.center;
        emitMatchUpdate(match);
    }, ARENA_CONFIG.warmupDuration * 1000);
}

function checkRoundEnd(match: ArenaMatchData): void {
    if (match.state !== "active") return;

    const redAlive = getAlivePlayers(match, "red").length;
    const blueAlive = getAlivePlayers(match, "blue").length;

    if (redAlive > 0 && blueAlive > 0) return;

    let roundWinner: Team | "draw";
    if (redAlive === 0 && blueAlive === 0) {
        roundWinner = "draw";
    } else if (redAlive === 0) {
        roundWinner = "blue";
        match.blueScore++;
    } else {
        roundWinner = "red";
        match.redScore++;
    }

    match.state = "round_end";
    stopZone(match.dimension);

    getAllMatchPlayerMps(match).forEach((p) => {
        p.call("client::arena:zoneClear");
        clearVictim(p.id);
    });

    emitToAll(match, "roundEnd", {
        winner: roundWinner,
        redScore: match.redScore,
        blueScore: match.blueScore,
        round: match.currentRound,
        roundsToWin: ARENA_CONFIG.roundsToWin
    });
    emitRoundResult(match, roundWinner);

    if (match.redScore >= ARENA_CONFIG.roundsToWin || match.blueScore >= ARENA_CONFIG.roundsToWin) {
        setTimeout(() => endMatch(match.dimension), ARENA_CONFIG.roundEndDelay * 1000);
    } else {
        setTimeout(() => {
            if (!getMatchByDimension(match.dimension)) return;
            match.currentRound++;
            beginRound(match);
        }, ARENA_CONFIG.roundEndDelay * 1000);
    }
}

export function handleArenaDeath(victim: PlayerMp, killer: PlayerMp | undefined): boolean {
    const match = getMatchByPlayer(victim);
    if (!match || match.state !== "active") return false;

    const victimTeam = getTeam(match, victim.id);
    if (!victimTeam) return false;

    const victimData = [...match.redTeam, ...match.blueTeam].find((p) => p.id === victim.id);
    if (!victimData) return false;

    if (!victimData.alive) return true;

    victimData.alive = false;
    victimData.deaths++;
    if (victim.getVariable("arenaCastActive")) {
        victim.setVariable("arenaCastActive", false);
        RAGERP.cef.emit(victim, "arena", "itemCastCancel", {});
    }

    victim.spawn(victim.position);
    victim.health = 100;
    resetPlayerArenaState(victim);
    victim.removeAllWeapons();

    let killerName = "";
    const recap = buildDeathRecap(victim.id, killer?.id, killer && mp.players.exists(killer) ? killer.name : "Unknown");

    if (killer && mp.players.exists(killer)) {
        const killerTeam = getTeam(match, killer.id);
        if (killerTeam && killerTeam !== victimTeam) {
            const killerData = [...match.redTeam, ...match.blueTeam].find((p) => p.id === killer.id);
            if (killerData) {
                killerData.kills++;
                killerData.roundKills = (killerData.roundKills ?? 0) + 1;
                if (recap?.headshot) killerData.headshotKills = (killerData.headshotKills ?? 0) + 1;
            }
            killerName = killer.name;
            const weaponName = recap ? (weaponUnhash[parseInt(recap.weaponHash, 10)] ?? recap.weaponHash) : "weapon_unarmed";
            emitKillFeed(match, killer.id, killer.name, victim.id, victim.name, recap?.weaponHash ?? "0", weaponName, recap?.headshot ?? false);
            RAGERP.cef.emit(killer, "arena", "youKill", { victim: victim.name });
        }
    }

    RAGERP.cef.emit(victim, "arena", "youDied", { killer: killerName });

    if (recap) {
        const weaponName = weaponUnhash[parseInt(recap.weaponHash, 10)];
        RAGERP.cef.emit(victim, "arena", "deathRecap", {
            ...recap,
            weaponName: weaponName ?? recap.weaponHash
        });
    }
    clearVictim(victim.id);

    const aliveTeammates = getAlivePlayers(match, victimTeam);
    const teammatesPayload = aliveTeammates.map((p) => ({ playerId: p.id, playerName: p.name }));
    RAGERP.cef.emit(victim, "arena", "startSpectate", { teammates: teammatesPayload });

    if (aliveTeammates.length > 0) {
        const target = aliveTeammates[0];
        const targetMp = mp.players.at(target.id);
        if (targetMp && mp.players.exists(targetMp)) {
            victim.call("client::arena:spectateTeammates", [JSON.stringify(teammatesPayload)]);
            startSpectate(victim, targetMp);
        }
    }

    // Notify other spectators (dead teammates) of updated list when someone dies
    const deadTeammates = getTeamPlayers(match, victimTeam).filter((p) => !p.alive);
    deadTeammates.forEach((p) => {
        const spectatorMp = mp.players.at(p.id);
        if (spectatorMp && mp.players.exists(spectatorMp) && spectatorMp.getVariable("isSpectating")) {
            spectatorMp.call("client::arena:spectateTeammatesUpdated", [JSON.stringify(teammatesPayload)]);
        }
    });

    emitAliveCount(match);
    checkAndEmitLastAlive(match);
    emitMatchUpdate(match);
    checkRoundEnd(match);

    const validKiller = killer && mp.players.exists(killer) && getTeam(match, killer.id) !== victimTeam ? killer : undefined;
    statsOnMatchDeath(victim, validKiller, recap?.headshot ?? false, match.dimension);

    return true;
}

export function handleZoneDeath(player: PlayerMp): void {
    handleArenaDeath(player, undefined);
}

/**
 * Restore a reconnecting player to their match. Called after spawnWithCharacter when tryReconnect succeeds.
 * Does not resurrect into a round that already resolved (round_end).
 */
export function restoreReconnectingPlayer(player: PlayerMp, slot: { dimension: number; team: ReconnectTeam; alive: boolean }): boolean {
    const match = getMatchByDimension(slot.dimension) as ArenaMatchData | undefined;
    if (!match) return false;

    const teamArr = slot.team === "red" ? match.redTeam : match.blueTeam;
    const matchPlayer = teamArr.find((p) => p.characterId === player.character?.id && p.disconnected);
    if (!matchPlayer) return false;

    matchPlayer.id = player.id;
    matchPlayer.disconnected = false;
    matchPlayer.roundPresenceDeadline = undefined;
    matchPlayer.name = player.name;
    matchRegisterPlayer(player.id, match.dimension);

    player.dimension = match.dimension;
    player.call("client::arena:setTeam", [slot.team]);
    setArenaVoiceAndTeam(match);

    const spawn = slot.team === "red" ? match.preset.redSpawn : match.preset.blueSpawn;
    const weapons = match.roundWeaponSet.weapons;
    const medkits = ITEM_CONFIG.medkit.countPerRound;
    const plates = ITEM_CONFIG.plate.countPerRound;

    const canSpawnAlive = slot.alive && (match.state === "active" || match.state === "warmup");

    if (canSpawnAlive) {
        resetPlayerArenaState(player);
        spawnPlayerAtArena(player, spawn, match.dimension);
        giveRoundWeapons(player, weapons);
        player.setVariable("arenaMedkits", medkits);
        player.setVariable("arenaPlates", plates);
        player.setVariable("arenaCastActive", false);
        player.setVariable("arenaEffectiveHp", 100);
        RAGERP.cef.emit(player, "arena", "itemCounts", { medkits, plates });
        player.call("client::player:freeze", [match.state === "warmup"]);
    } else {
        resetPlayerArenaState(player);
        spawnPlayerAtArena(player, spawn, match.dimension);
        player.health = 0;
        player.setVariable("isDead", true);
        const aliveTeammates = getAlivePlayers(match, slot.team);
        const teammatesPayload = aliveTeammates.map((p) => ({ playerId: p.id, playerName: p.name }));
        RAGERP.cef.emit(player, "arena", "startSpectate", { teammates: teammatesPayload });
        if (aliveTeammates.length > 0) {
            const targetMp = mp.players.at(aliveTeammates[0].id);
            if (targetMp && mp.players.exists(targetMp)) {
                player.call("client::arena:spectateTeammates", [JSON.stringify(teammatesPayload)]);
                startSpectate(player, targetMp);
            }
        }
    }

    const cx = Number(match.zoneCenter?.x ?? match.preset.center?.x ?? 0);
    const cy = Number(match.zoneCenter?.y ?? match.preset.center?.y ?? 0);
    player.call("client::arena:zoneInit", [cx, cy, 200]);

    const matchData = {
        mapId: match.mapId,
        mapName: match.mapName,
        queueSize: match.redTeam.length + match.blueTeam.length,
        redTeam: match.redTeam.map((p) => ({ id: p.id, name: p.name })),
        blueTeam: match.blueTeam.map((p) => ({ id: p.id, name: p.name })),
        dimension: match.dimension,
        redScore: match.redScore,
        blueScore: match.blueScore,
        currentRound: match.currentRound,
        roundsToWin: ARENA_CONFIG.roundsToWin,
        timeLeft: match.state === "active" ? Math.max(0, Math.ceil((match.roundEndsAt - Date.now()) / 1000)) : ARENA_CONFIG.maxRoundTime
    };
    RAGERP.cef.emit(player, "arena", "setMatch", matchData);
    RAGERP.cef.startPage(player, "arena_hud");
    RAGERP.cef.emit(player, "system", "setPage", "arena_hud");

    emitAliveCount(match);
    emitMatchUpdate(match);
    return true;
}

function removePlayerFromMatchPermanently(match: ArenaMatchData, characterId: number): void {
    const removeFromTeam = (team: MatchPlayer[]) => {
        const idx = team.findIndex((p) => p.characterId === characterId);
        if (idx >= 0) team.splice(idx, 1);
    };
    removeFromTeam(match.redTeam);
    removeFromTeam(match.blueTeam);

    const remaining = [...match.redTeam, ...match.blueTeam];
    if (remaining.length === 0) {
        destroyMatchVehicles(match);
        stopZone(match.dimension);
        matchUnregister(match.dimension);
    } else {
        emitMatchUpdate(match);
        if (match.state === "active") checkRoundEnd(match);
    }
}

/**
 * Called when a player disconnects during a match. Marks them as temporarily disconnected,
 * starts a 60s reconnect window, and a shorter round-presence grace (15s). After round-presence
 * expires, the player no longer counts as alive for round resolution.
 */
export function handleMatchDisconnect(player: PlayerMp): boolean {
    const match = getMatchByPlayer(player);
    if (!match) return false;

    const characterId = player.character?.id;
    const team = getTeam(match, player.id);
    if (!team || !characterId) {
        leaveMatch(player, false);
        return true;
    }

    const matchPlayer = [...match.redTeam, ...match.blueTeam].find((p) => p.id === player.id);
    if (!matchPlayer) return false;

    matchUnregisterPlayer(player.id);
    matchPlayer.disconnected = true;

    const roundPresenceGraceMs = ARENA_CONFIG.roundPresenceGraceSeconds * 1000;
    matchPlayer.roundPresenceDeadline = Date.now() + roundPresenceGraceMs;

    recordDisconnect(
        characterId,
        match.dimension,
        team,
        matchPlayer.alive,
        matchPlayer.name,
        () => removePlayerFromMatchPermanently(match, characterId)
    );

    if (match.state === "active" && matchPlayer.alive) {
        setTimeout(() => {
            if (!getMatchByDimension(match.dimension)) return;
            if (match.state !== "active") return;
            emitAliveCount(match);
            checkAndEmitLastAlive(match);
            checkRoundEnd(match);
        }, roundPresenceGraceMs);
    }

    emitAliveCount(match);
    emitMatchUpdate(match);
    return true;
}

export function leaveMatch(player: PlayerMp, returnToMenu: boolean = true): boolean {
    const match = getMatchByPlayer(player);
    if (!match) return false;

    matchUnregisterPlayer(player.id);
    // Inventory system removed - no cast cancellation needed
    // Inventory system removed - no item clearing needed
    player.dimension = 0;
    player.removeAllWeapons();
    player.call("client::player:freeze", [false]);
    stopSpectate(player, false);
    player.call("client::arena:zoneClear");
    clearArenaVoiceAndTeam(player);

    match.redTeam = match.redTeam.filter((p) => p.id !== player.id);
    match.blueTeam = match.blueTeam.filter((p) => p.id !== player.id);

    const remaining = [...match.redTeam, ...match.blueTeam];
    if (remaining.length === 0) {
        destroyMatchVehicles(match);
        stopZone(match.dimension);
        matchUnregister(match.dimension);
    } else {
        emitMatchUpdate(match);
        if (match.state === "active") checkRoundEnd(match);
    }

    player.call("client::arena:clearTeam");
    if (returnToMenu) {
        RAGERP.cef.startPage(player, "mainmenu");
        RAGERP.cef.emit(player, "system", "setPage", "mainmenu");
    }
    RAGERP.cef.emit(player, "arena", "leftMatch", null);
    return true;
}

export async function endMatch(dimension: number): Promise<void> {
    const match = getMatchByDimension(dimension);
    if (!match) return;
    if (match.state === "match_end") return;

    match.state = "match_end";
    stopZone(match.dimension);
    destroyMatchVehicles(match);

    const winner: Team | "draw" = match.redScore > match.blueScore ? "red" : match.blueScore > match.redScore ? "blue" : "draw";

    const baseResults = {
        redScore: match.redScore,
        blueScore: match.blueScore,
        winner,
        redTeam: match.redTeam.map((p: MatchPlayer) => ({ id: p.id, name: p.name, kills: p.kills, deaths: p.deaths })),
        blueTeam: match.blueTeam.map((p: MatchPlayer) => ({ id: p.id, name: p.name, kills: p.kills, deaths: p.deaths }))
    };

    const allPlayers = getAllMatchPlayerMps(match);
    const redTeamPlayers = allPlayers.filter((p) => getTeam(match, p.id) === "red");
    const blueTeamPlayers = allPlayers.filter((p) => getTeam(match, p.id) === "blue");
    await statsOnMatchEnd(winner, redTeamPlayers, blueTeamPlayers, match.dimension);

    const rankedInputs: RankedMatchPlayerInput[] = [];
    for (const p of [...match.redTeam, ...match.blueTeam]) {
        const characterId = p.characterId;
        if (!characterId) continue;
        const isWin = winner !== "draw" && ((winner === "red" && getTeam(match, p.id) === "red") || (winner === "blue" && getTeam(match, p.id) === "blue"));
        const isLoss = winner !== "draw" && ((winner === "red" && getTeam(match, p.id) === "blue") || (winner === "blue" && getTeam(match, p.id) === "red"));
        rankedInputs.push({ characterId, kills: p.kills, deaths: p.deaths, isWin, isLoss });
    }

    let mmrResults: Map<number, RankedMatchResult> = new Map();
    try {
        mmrResults = await updateRankedMatchResult(rankedInputs);
    } catch (err) {
        console.error("[Ranked] updateRankedMatchResult failed:", err);
    }
    if (isSeasonActive()) {
        const season = getActiveSeason();
        if (season) {
            try {
                await updateSeasonalRankedMatchResult(season.seasonId, rankedInputs);
            } catch (err) {
                console.error("[Ranked] updateSeasonalRankedMatchResult failed:", err);
            }
        }
    }

    const matchId = `dim-${dimension}-${Date.now()}`;

    for (const p of [...match.redTeam, ...match.blueTeam]) {
        const characterId = p.characterId;
        if (!characterId || winner === "draw") continue;
        const team = getTeam(match, p.id);
        if (!team) continue;
        const mmr = mmrResults.get(characterId);
        const xpResult = getMatchXpResult(match.dimension, characterId);
        const isWin =
            (winner === "red" && team === "red") || (winner === "blue" && team === "blue");
        const mmrChange = mmr ? mmr.newMMR - mmr.oldMMR : 0;
        recordPlayerMatchHistory({
            characterId,
            matchId,
            result: isWin ? "Win" : "Loss",
            team,
            kills: p.kills,
            deaths: p.deaths,
            mmrChange,
            xpGained: xpResult?.totalXp ?? 0,
            levelAfter: xpResult?.newLevel ?? 1,
            rankTierAfter: mmr?.rankTier ?? "Unranked"
        }).catch((err) => console.error("[MatchHistory] recordPlayerMatchHistory failed:", err));
    }

    allPlayers.forEach((p) => {
        matchUnregisterPlayer(p.id);
        clearArenaVoiceAndTeam(p);
        // Inventory system removed - no cast cancellation needed
        p.removeAllWeapons();
        p.call("client::player:freeze", [false]);
        stopSpectate(p, false);
        p.call("client::arena:zoneClear");
        const characterId = p.character?.id;
        const mmr = characterId ? mmrResults.get(characterId) : undefined;
        const xpResult = characterId ? getMatchXpResult(match.dimension, characterId) : undefined;
        const results = {
            ...baseResults,
            oldMMR: mmr?.oldMMR ?? 0,
            newMMR: mmr?.newMMR ?? 0,
            rankTier: mmr?.rankTier ?? "Unranked",
            xpGained: xpResult?.totalXp ?? 0,
            leveledUp: xpResult?.leveledUp ?? false,
            newLevel: xpResult?.newLevel ?? 0
        };
        RAGERP.cef.emit(p, "arena", "matchEnd", results);
    });

    clearMatchXpResults(match.dimension);
    matchUnregister(dimension);

    setTimeout(() => {
        allPlayers.forEach((p) => {
            if (mp.players.exists(p)) {
                p.dimension = 0;
                p.call("client::arena:clearTeam");
                RAGERP.cef.startPage(p, "mainmenu");
                RAGERP.cef.emit(p, "system", "setPage", "mainmenu");
            }
        });
    }, ARENA_CONFIG.matchEndDelay * 1000);
}

export function tickMatches(): void {
    const now = Date.now();
    getAllMatches<ArenaMatchData>().forEach((match, dim) => {
        if (match.state === "active" && now >= match.roundEndsAt) {
            const redAlive = getAlivePlayers(match, "red").length;
            const blueAlive = getAlivePlayers(match, "blue").length;
            if (redAlive > blueAlive) match.redScore++;
            else if (blueAlive > redAlive) match.blueScore++;

            match.state = "round_end";
            stopZone(dim);

            getAllMatchPlayerMps(match).forEach((p) => {
                p.call("client::arena:zoneClear");
                clearVictim(p.id);
            });

            const roundWinner: Team | "draw" = redAlive > blueAlive ? "red" : blueAlive > redAlive ? "blue" : "draw";
            emitToAll(match, "roundEnd", {
                winner: roundWinner,
                redScore: match.redScore,
                blueScore: match.blueScore,
                round: match.currentRound,
                roundsToWin: ARENA_CONFIG.roundsToWin
            });
            emitRoundResult(match, roundWinner);

            if (match.redScore >= ARENA_CONFIG.roundsToWin || match.blueScore >= ARENA_CONFIG.roundsToWin) {
                setTimeout(() => endMatch(dim), ARENA_CONFIG.roundEndDelay * 1000);
            } else {
        setTimeout(() => {
            if (!getMatchByDimension(dim)) return;
                    match.currentRound++;
                    beginRound(match);
                }, ARENA_CONFIG.roundEndDelay * 1000);
            }
        } else if (match.state === "active") {
            emitMatchUpdate(match);
        }
    });
}

setInterval(tickMatches, 1000);
