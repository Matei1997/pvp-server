import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { startSpectate, stopSpectate } from "@events/Player.event";
import { IArenaPreset } from "./ArenaPreset.interface";
import { ARENA_CONFIG, WEAPON_ROTATION, VEHICLE_POOL, ARENA_AMMO, ITEM_CONFIG } from "./ArenaConfig";
import { startZone, stopZone } from "./ZoneSystem";
import { applyWeaponPresets } from "./WeaponPresets.service";

type MatchState = "warmup" | "active" | "round_end" | "match_end";
type Team = "red" | "blue";

interface MatchPlayer {
    id: number;
    name: string;
    alive: boolean;
    kills: number;
    deaths: number;
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
}

const activeMatches = new Map<number, ArenaMatchData>();
const playerToMatch = new Map<number, number>();

export function getMatchByDimension(dim: number): ArenaMatchData | undefined {
    return activeMatches.get(dim);
}

export function getMatchByPlayer(player: PlayerMp): ArenaMatchData | undefined {
    const dim = playerToMatch.get(player.id);
    return dim !== undefined ? activeMatches.get(dim) : undefined;
}

export function isPlayerInArenaMatch(player: PlayerMp): boolean {
    return playerToMatch.has(player.id);
}

export function getTeam(match: ArenaMatchData, playerId: number): Team | null {
    if (match.redTeam.some((p) => p.id === playerId)) return "red";
    if (match.blueTeam.some((p) => p.id === playerId)) return "blue";
    return null;
}

export function isAliveInMatch(match: ArenaMatchData, playerId: number): boolean {
    const p = [...match.redTeam, ...match.blueTeam].find((x) => x.id === playerId);
    return p ? p.alive : false;
}

function getTeamPlayers(match: ArenaMatchData, team: Team): MatchPlayer[] {
    return team === "red" ? match.redTeam : match.blueTeam;
}

function getAlivePlayers(match: ArenaMatchData, team: Team): MatchPlayer[] {
    return getTeamPlayers(match, team).filter((p) => p.alive);
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

function emitKillFeed(match: ArenaMatchData, killerName: string, victimName: string): void {
    emitToAll(match, "killFeed", { killer: killerName, victim: victimName });
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
        redTeam: redTeam.map((p) => ({ id: p.id, name: p.name, alive: true, kills: 0, deaths: 0 })),
        blueTeam: blueTeam.map((p) => ({ id: p.id, name: p.name, alive: true, kills: 0, deaths: 0 })),
        redScore: 0,
        blueScore: 0,
        currentRound: 1,
        matchEndsAt: 0,
        roundEndsAt: 0,
        preset,
        vehicles: [],
        roundWeaponSet: firstWeaponSet
    };

    activeMatches.set(dimension, match);
    [...redTeam, ...blueTeam].forEach((p) => playerToMatch.set(p.id, dimension));

    beginRound(match);
}

function beginRound(match: ArenaMatchData): void {
    match.state = "warmup";

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
        if (!activeMatches.has(match.dimension)) return;
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
    });

    emitToAll(match, "roundEnd", {
        winner: roundWinner,
        redScore: match.redScore,
        blueScore: match.blueScore,
        round: match.currentRound,
        roundsToWin: ARENA_CONFIG.roundsToWin
    });

    if (match.redScore >= ARENA_CONFIG.roundsToWin || match.blueScore >= ARENA_CONFIG.roundsToWin) {
        setTimeout(() => endMatch(match.dimension), ARENA_CONFIG.roundEndDelay * 1000);
    } else {
        setTimeout(() => {
            if (!activeMatches.has(match.dimension)) return;
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
    if (killer && mp.players.exists(killer)) {
        const killerTeam = getTeam(match, killer.id);
        if (killerTeam && killerTeam !== victimTeam) {
            const killerData = [...match.redTeam, ...match.blueTeam].find((p) => p.id === killer.id);
            if (killerData) killerData.kills++;
            killerName = killer.name;
            emitKillFeed(match, killer.name, victim.name);
            RAGERP.cef.emit(killer, "arena", "youKill", { victim: victim.name });
        }
    }

    RAGERP.cef.emit(victim, "arena", "youDied", { killer: killerName });

    const aliveTeammates = getAlivePlayers(match, victimTeam);
    if (aliveTeammates.length > 0) {
        const target = aliveTeammates[0];
        const targetMp = mp.players.at(target.id);
        if (targetMp && mp.players.exists(targetMp)) {
            startSpectate(victim, targetMp);
        }
    }

    emitMatchUpdate(match);
    checkRoundEnd(match);
    return true;
}

export function handleZoneDeath(player: PlayerMp): void {
    handleArenaDeath(player, undefined);
}

export function leaveMatch(player: PlayerMp, returnToMenu: boolean = true): boolean {
    const match = getMatchByPlayer(player);
    if (!match) return false;

    playerToMatch.delete(player.id);
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
        activeMatches.delete(match.dimension);
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

export function endMatch(dimension: number): void {
    const match = activeMatches.get(dimension);
    if (!match) return;

    match.state = "match_end";
    stopZone(match.dimension);
    destroyMatchVehicles(match);

    const winner: Team | "draw" = match.redScore > match.blueScore ? "red" : match.blueScore > match.redScore ? "blue" : "draw";

    const results = {
        redScore: match.redScore,
        blueScore: match.blueScore,
        winner,
        redTeam: match.redTeam.map((p) => ({ id: p.id, name: p.name, kills: p.kills, deaths: p.deaths })),
        blueTeam: match.blueTeam.map((p) => ({ id: p.id, name: p.name, kills: p.kills, deaths: p.deaths }))
    };

    const allPlayers = getAllMatchPlayerMps(match);
    allPlayers.forEach((p) => {
        playerToMatch.delete(p.id);
        clearArenaVoiceAndTeam(p);
        // Inventory system removed - no cast cancellation needed
        p.removeAllWeapons();
        p.call("client::player:freeze", [false]);
        stopSpectate(p, false);
        p.call("client::arena:zoneClear");
        RAGERP.cef.emit(p, "arena", "matchEnd", results);
    });

    activeMatches.delete(dimension);

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
    activeMatches.forEach((match, dim) => {
        if (match.state === "active" && now >= match.roundEndsAt) {
            const redAlive = getAlivePlayers(match, "red").length;
            const blueAlive = getAlivePlayers(match, "blue").length;
            if (redAlive > blueAlive) match.redScore++;
            else if (blueAlive > redAlive) match.blueScore++;

            match.state = "round_end";
            stopZone(dim);

            getAllMatchPlayerMps(match).forEach((p) => {
                p.call("client::arena:zoneClear");
            });

            emitToAll(match, "roundEnd", {
                winner: redAlive > blueAlive ? "red" : blueAlive > redAlive ? "blue" : "draw",
                redScore: match.redScore,
                blueScore: match.blueScore,
                round: match.currentRound,
                roundsToWin: ARENA_CONFIG.roundsToWin
            });

            if (match.redScore >= ARENA_CONFIG.roundsToWin || match.blueScore >= ARENA_CONFIG.roundsToWin) {
                setTimeout(() => endMatch(dim), ARENA_CONFIG.roundEndDelay * 1000);
            } else {
                setTimeout(() => {
                    if (!activeMatches.has(dim)) return;
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
