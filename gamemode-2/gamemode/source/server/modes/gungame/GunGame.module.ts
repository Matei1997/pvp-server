/**
 * Gun Game queue and launch flow. Separate from Hopouts and FFA.
 */
import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { weaponUnhash } from "@assets/Weapons.assets";
import { startGunGameMatch, isPlayerInGunGameMatch, getGunGameMatchByDimension } from "./GunGameMatch.manager";
import { GUNGAME_CONFIG } from "./GunGameConfig";

function getWeaponDisplayName(hash: number): string {
    const name = weaponUnhash[hash];
    return (name ?? `weapon_${hash}`).replace("weapon_", "").replace(/_/g, " ");
}

const gunGameQueue: PlayerMp[] = [];

function getQueueForPlayer(player: PlayerMp): PlayerMp[] | null {
    if (gunGameQueue.some((p) => p.id === player.id)) return gunGameQueue;
    return null;
}

function emitGunGameLobbyToAll(): void {
    const data = {
        players: gunGameQueue.map((p) => ({ id: p.id, name: p.name })),
        needed: GUNGAME_CONFIG.minPlayersToStart,
        maxPlayers: GUNGAME_CONFIG.maxPlayers
    };
    gunGameQueue.forEach((p) => {
        if (mp.players.exists(p)) {
            (RAGERP.cef.emit as Function)(p, "gungame", "setLobby", data);
        }
    });
}

export function joinGunGameQueue(player: PlayerMp): boolean {
    if (!player.character) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "No character loaded.");
        return false;
    }
    if (isPlayerInGunGameMatch(player)) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Already in a match.");
        return false;
    }
    if (getQueueForPlayer(player)) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Already in Gun Game queue.");
        return false;
    }

    gunGameQueue.push(player);
    RAGERP.cef.startPage(player, "gungame_lobby");
    RAGERP.cef.emit(player, "system", "setPage", "gungame_lobby");
    emitGunGameLobbyToAll();

    if (gunGameQueue.length >= GUNGAME_CONFIG.minPlayersToStart) {
        startGunGameFromQueue();
    }
    return true;
}

function startGunGameFromQueue(): void {
    const toStart = gunGameQueue.splice(0, Math.min(gunGameQueue.length, GUNGAME_CONFIG.maxPlayers));
    gunGameQueue.length = 0;
    emitGunGameLobbyToAll();

    const dimension = startGunGameMatch(toStart);
    const match = getGunGameMatchByDimension(dimension);

    const weaponOrderNames = (match?.weaponOrder ?? []).map(getWeaponDisplayName);
    const firstWeapon = weaponOrderNames[0] ?? "—";

    const matchData = {
        mapId: match?.mapId ?? "gungame",
        mapName: match?.mapName ?? "Gun Game",
        dimension,
        totalTiers: match?.totalTiers ?? 0,
        weaponOrder: weaponOrderNames,
        leaderboard: toStart.map((p) => ({
            id: p.id,
            name: p.name,
            tier: 0,
            kills: 0,
            deaths: 0,
            weaponName: firstWeapon
        }))
    };

    toStart.forEach((p) => {
        if (mp.players.exists(p)) {
            (RAGERP.cef.emit as Function)(p, "gungame", "setMatch", matchData);
            RAGERP.cef.startPage(p, "gungame_hud");
            RAGERP.cef.emit(p, "system", "setPage", "gungame_hud");
        }
    });
}

export function leaveGunGameQueue(player: PlayerMp): boolean {
    const idx = gunGameQueue.findIndex((p) => p.id === player.id);
    if (idx < 0) return false;
    gunGameQueue.splice(idx, 1);
    emitGunGameLobbyToAll();
    RAGERP.cef.startPage(player, "mainmenu");
    RAGERP.cef.emit(player, "system", "setPage", "mainmenu");
    return true;
}

export function onPlayerDisconnectFromGunGameQueue(playerId: number): boolean {
    const idx = gunGameQueue.findIndex((p) => p.id === playerId);
    if (idx < 0) return false;
    gunGameQueue.splice(idx, 1);
    emitGunGameLobbyToAll();
    return true;
}
