/**
 * FFA queue and launch flow. Separate from Hopouts.
 */
import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { startFfaMatch, isPlayerInFfaMatch, getFfaMatchByDimension } from "./FfaMatch.manager";
import { FFA_CONFIG } from "./FfaConfig";

const ffaQueue: PlayerMp[] = [];
const FFA_QUEUE_SIZE = "ffa" as unknown as number;

function getQueueForPlayer(player: PlayerMp): PlayerMp[] | null {
    if (ffaQueue.some((p) => p.id === player.id)) return ffaQueue;
    return null;
}

function emitFfaLobbyToAll(): void {
    const data = {
        players: ffaQueue.map((p) => ({ id: p.id, name: p.name })),
        needed: FFA_CONFIG.minPlayersToStart,
        maxPlayers: FFA_CONFIG.maxPlayers
    };
    ffaQueue.forEach((p) => {
        if (mp.players.exists(p)) {
            (RAGERP.cef.emit as Function)(p, "ffa", "setLobby", data);
        }
    });
}

export function joinFfaQueue(player: PlayerMp): boolean {
    if (!player.character) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "No character loaded.");
        return false;
    }
    if (isPlayerInFfaMatch(player)) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Already in a match.");
        return false;
    }
    if (getQueueForPlayer(player)) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Already in FFA queue.");
        return false;
    }

    ffaQueue.push(player);
    RAGERP.cef.startPage(player, "ffa_lobby");
    RAGERP.cef.emit(player, "system", "setPage", "ffa_lobby");
    emitFfaLobbyToAll();

    if (ffaQueue.length >= FFA_CONFIG.minPlayersToStart) {
        startFfaFromQueue();
    }
    return true;
}

function startFfaFromQueue(): void {
    const toStart = ffaQueue.splice(0, Math.min(ffaQueue.length, FFA_CONFIG.maxPlayers));
    ffaQueue.length = 0;
    emitFfaLobbyToAll();

    const dimension = startFfaMatch(toStart);
    const match = getFfaMatchByDimension(dimension);

    const matchData = {
        mapId: match?.mapId ?? "ffa",
        mapName: match?.mapName ?? "Free For All",
        dimension,
        scoreToWin: FFA_CONFIG.scoreToWin,
        leaderboard: toStart.map((p) => ({ id: p.id, name: p.name, score: 0, deaths: 0 }))
    };

    toStart.forEach((p) => {
        if (mp.players.exists(p)) {
            (RAGERP.cef.emit as Function)(p, "ffa", "setMatch", matchData);
            RAGERP.cef.startPage(p, "ffa_hud");
            RAGERP.cef.emit(p, "system", "setPage", "ffa_hud");
        }
    });
}

export function leaveFfaQueue(player: PlayerMp): boolean {
    const idx = ffaQueue.findIndex((p) => p.id === player.id);
    if (idx < 0) return false;
    ffaQueue.splice(idx, 1);
    emitFfaLobbyToAll();
    RAGERP.cef.startPage(player, "mainmenu");
    RAGERP.cef.emit(player, "system", "setPage", "mainmenu");
    return true;
}

export function onPlayerDisconnectFromFfaQueue(playerId: number): boolean {
    const idx = ffaQueue.findIndex((p) => p.id === playerId);
    if (idx < 0) return false;
    ffaQueue.splice(idx, 1);
    emitFfaLobbyToAll();
    return true;
}
