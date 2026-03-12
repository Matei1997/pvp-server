/**
 * Gun Game match manager. No teams, respawn on death, kill advances tier, first to complete final tier wins.
 */
import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { IArenaPreset } from "@shared/interfaces/ArenaPreset.interface";
import { allocateDimension } from "@modules/matchmaking/QueueManager";
import { weaponUnhash } from "@assets/Weapons.assets";
import { GUNGAME_CONFIG, GUNGAME_WEAPON_POOL, GUNGAME_AMMO, shuffleWeaponPool } from "./GunGameConfig";
import { getArenaPresets } from "../hopouts/ArenaPresets.asset";

interface GunGamePlayer {
    id: number;
    name: string;
    tier: number;
    kills: number;
    deaths: number;
    characterId?: number;
}

export interface GunGameMatchData {
    dimension: number;
    state: "active" | "match_end";
    mapId: string;
    mapName: string;
    preset: IArenaPreset;
    players: GunGamePlayer[];
    weaponOrder: number[];
    totalTiers: number;
    spawnPoints: { x: number; y: number; z: number; heading?: number }[];
}

const gunGameMatches = new Map<number, GunGameMatchData>();
const gunGamePlayerToMatch = new Map<number, number>();

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

function pickRandomSpawn(match: GunGameMatchData): { x: number; y: number; z: number; heading?: number } {
    const pts = match.spawnPoints;
    return pts[Math.floor(Math.random() * pts.length)];
}

function getWeaponName(hash: number): string {
    const name = weaponUnhash[hash];
    if (!name) return `weapon_${hash}`;
    return name.replace("weapon_", "").replace(/_/g, " ");
}

function emitToAll(match: GunGameMatchData, event: string, data: unknown): void {
    match.players.forEach((p) => {
        const mp_ = mp.players.at(p.id);
        if (mp_ && mp.players.exists(mp_)) {
            (RAGERP.cef.emit as Function)(mp_, "gungame", event, data);
        }
    });
}

function buildLeaderboard(match: GunGameMatchData) {
    return match.players
        .map((p) => ({
            id: p.id,
            name: p.name,
            tier: p.tier,
            kills: p.kills,
            deaths: p.deaths,
            weaponName: getWeaponName(match.weaponOrder[Math.min(p.tier, match.totalTiers - 1)])
        }))
        .sort((a, b) => b.tier - a.tier || b.kills - a.kills);
}

function emitGunGameUpdate(match: GunGameMatchData): void {
    const leaderboard = buildLeaderboard(match);
    const topPlayer = leaderboard[0] ?? null;
    emitToAll(match, "matchUpdate", {
        state: match.state,
        totalTiers: match.totalTiers,
        weaponOrder: match.weaponOrder.map((h) => getWeaponName(h)),
        leaderboard,
        topPlayer
    });
}

function giveTierWeapon(player: PlayerMp, match: GunGameMatchData, playerData: GunGamePlayer): void {
    player.removeAllWeapons();
    const tier = Math.min(playerData.tier, match.totalTiers - 1);
    const weaponHash = match.weaponOrder[tier];
    player.giveWeaponEx(weaponHash, GUNGAME_AMMO, 30);
}

function spawnGunGamePlayer(player: PlayerMp, match: GunGameMatchData, playerData: GunGamePlayer): void {
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
    giveTierWeapon(player, match, playerData);
    player.call("client::player:setVitals", [100, 100]);
    player.call("client::arena:requestCollision", [spawn.x, spawn.y, spawn.z]);
}

export function isPlayerInGunGameMatch(player: PlayerMp): boolean {
    return gunGamePlayerToMatch.has(player.id);
}

export function getGunGameMatchByPlayer(player: PlayerMp): GunGameMatchData | undefined {
    const dim = gunGamePlayerToMatch.get(player.id);
    return dim !== undefined ? gunGameMatches.get(dim) : undefined;
}

export function getGunGameMatchByDimension(dim: number): GunGameMatchData | undefined {
    return gunGameMatches.get(dim);
}

export function startGunGameMatch(players: PlayerMp[]): number {
    const presets = getArenaPresets();
    const preset = presets.length > 0 ? presets[Math.floor(Math.random() * presets.length)] : null;
    if (!preset) {
        console.error("[GunGame] No arena presets available");
        return 0;
    }

    const weaponOrder = shuffleWeaponPool(GUNGAME_WEAPON_POOL);
    const dimension = allocateDimension();
    const spawnPoints = getSpawnPoints(preset);
    const match: GunGameMatchData = {
        dimension,
        state: "active",
        mapId: preset.id,
        mapName: preset.name,
        preset,
        players: players.map((p) => ({
            id: p.id,
            name: p.name,
            tier: 0,
            kills: 0,
            deaths: 0,
            characterId: p.character?.id
        })),
        weaponOrder,
        totalTiers: weaponOrder.length,
        spawnPoints
    };

    gunGameMatches.set(dimension, match);
    players.forEach((p) => gunGamePlayerToMatch.set(p.id, dimension));

    players.forEach((p) => {
        const playerData = match.players.find((x) => x.id === p.id)!;
        spawnGunGamePlayer(p, match, playerData);
        p.setVariable("arenaTeammateIds", []);
        p.setVariable("currentTeam", undefined);
    });

    emitGunGameUpdate(match);
    return dimension;
}

/**
 * Called when a player dies in Gun Game. Killer advances tier. Victim respawns after delay.
 * Returns true if death was handled.
 */
export function handleGunGameDeath(victim: PlayerMp, killer?: PlayerMp): boolean {
    const match = getGunGameMatchByPlayer(victim);
    if (!match || match.state !== "active") return false;

    const victimData = match.players.find((p) => p.id === victim.id);
    if (!victimData) return false;

    victimData.deaths++;

    if (killer && mp.players.exists(killer)) {
        const killerData = match.players.find((p) => p.id === killer.id);
        if (killerData && killerData.id !== victim.id) {
            killerData.kills++;
            killerData.tier++;
            if (killerData.tier >= match.totalTiers) {
                endGunGameMatch(match.dimension);
                return true;
            }
            const killerMp = mp.players.at(killer.id);
            if (killerMp && mp.players.exists(killerMp)) {
                giveTierWeapon(killerMp, match, killerData);
            }
        }
    }

    emitGunGameUpdate(match);

    setTimeout(() => {
        const m = getGunGameMatchByDimension(match.dimension);
        if (!m || m.state !== "active") return;
        const p = mp.players.at(victim.id);
        if (!p || !mp.players.exists(p)) return;
        const pd = m.players.find((x) => x.id === p.id);
        if (pd) spawnGunGamePlayer(p, m, pd);
        emitGunGameUpdate(m);
    }, GUNGAME_CONFIG.respawnDelaySeconds * 1000);

    return true;
}

function endGunGameMatch(dimension: number): void {
    const match = gunGameMatches.get(dimension);
    if (!match) return;
    if (match.state === "match_end") return;

    match.state = "match_end";
    const sorted = [...match.players].sort((a, b) => b.tier - a.tier || b.kills - a.kills);
    const winner = sorted[0];

    match.players.forEach((p) => gunGamePlayerToMatch.delete(p.id));
    gunGameMatches.delete(dimension);

    const allPlayers = match.players
        .map((p) => mp.players.at(p.id))
        .filter((p): p is PlayerMp => !!p && mp.players.exists(p));

    allPlayers.forEach((p) => {
        p.dimension = 0;
        p.removeAllWeapons();
        p.call("client::player:freeze", [false]);
        p.setVariable("arenaTeammateIds", []);
        p.setVariable("currentTeam", undefined);
        (RAGERP.cef.emit as Function)(p, "gungame", "matchEnd", {
            winner: winner ? { id: winner.id, name: winner.name, tier: winner.tier, kills: winner.kills } : null,
            leaderboard: sorted.map((x) => ({
                id: x.id,
                name: x.name,
                tier: x.tier,
                kills: x.kills,
                deaths: x.deaths
            }))
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

export function leaveGunGameMatch(player: PlayerMp): boolean {
    const match = getGunGameMatchByPlayer(player);
    if (!match) return false;

    const idx = match.players.findIndex((p) => p.id === player.id);
    if (idx >= 0) match.players.splice(idx, 1);
    gunGamePlayerToMatch.delete(player.id);

    player.dimension = 0;
    player.removeAllWeapons();
    player.setVariable("arenaTeammateIds", []);
    player.setVariable("currentTeam", undefined);
    RAGERP.cef.startPage(player, "mainmenu");
    RAGERP.cef.emit(player, "system", "setPage", "mainmenu");
    (RAGERP.cef.emit as Function)(player, "gungame", "leftMatch", null);

    if (match.players.length === 0) {
        gunGameMatches.delete(match.dimension);
    } else {
        emitGunGameUpdate(match);
    }
    return true;
}
