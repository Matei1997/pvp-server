import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { getArenaPresets } from "./ArenaPresets.asset";
import { IArenaPreset } from "@shared/interfaces/ArenaPreset.interface";
import { startMatch as startArenaMatch, isPlayerInArenaMatch } from "./ArenaMatch.manager";
import { QUEUE_SIZES, QueueSize, ARENA_CONFIG } from "./ArenaConfig";
import {
    addPlayer as queueAddPlayer,
    addPlayers as queueAddPlayers,
    removePlayer as queueRemovePlayer,
    removePlayers as queueRemovePlayers,
    getQueueForPlayerInfo,
    isQueueFull,
    clearQueue as queueClearQueue,
    allocateDimension
} from "@modules/matchmaking/QueueManager";
import {
    getPartyByPlayer,
    getPartyMemberIds,
    isLeader,
    canPartyQueue
} from "@modules/party/PartyManager";
import "../../arena/WeaponPresets.service";

export type ArenaLobbyState = "waiting" | "voting" | "starting";

const LOBBY_COUNTDOWN_SEC = 0;
const VOTING_DURATION_SEC = 0;

interface LobbyPlayer {
    player: PlayerMp;
    ready: boolean;
    voteMapId: string | null;
    preferredMapId?: string | null;
}

interface LobbyData {
    state: ArenaLobbyState;
    queueSize: QueueSize;
    players: { id: number; name: string; ready: boolean }[];
    countdown: number;
    voteMaps: { id: string; name: string; votes: number }[];
    voteEndsAt: number;
    myVote?: string | null;
}

const READY_CHECK_DURATION_MS = 10000;

interface PendingMatchData {
    q: QueueInstance;
    winner: IArenaPreset;
    redTeam: PlayerMp[];
    blueTeam: PlayerMp[];
    dim: number;
    responses: Map<number, "accept" | "decline">;
    timeoutId: ReturnType<typeof setTimeout>;
}

interface QueueInstance {
    size: QueueSize;
    lobbyPlayers: Map<number, LobbyPlayer>;
    /** Party members in lobby: when one leaves, whole party is removed. */
    partyInLobby: Map<string, Set<number>>;
    lobbyState: ArenaLobbyState;
    countdownInterval: ReturnType<typeof setInterval> | null;
    votingInterval: ReturnType<typeof setInterval> | null;
    voteMaps: { preset: IArenaPreset; votes: number }[];
    voteEndsAt: number;
    /** Ready check: pending match before start */
    pendingMatch: PendingMatchData | null;
}

const lobbyInstances = new Map<QueueSize, QueueInstance>();

QUEUE_SIZES.forEach((size) => {
    lobbyInstances.set(size, {
        size,
        lobbyPlayers: new Map(),
        partyInLobby: new Map(),
        lobbyState: "waiting",
        countdownInterval: null,
        votingInterval: null,
        voteMaps: [],
        voteEndsAt: 0,
        pendingMatch: null
    });
});

function getPlayerQueue(player: PlayerMp): QueueInstance | null {
    const info = getQueueForPlayerInfo(player);
    return info ? lobbyInstances.get(info.size as QueueSize) ?? null : null;
}

function emitLobbyToAll(q: QueueInstance): void {
    const baseData: LobbyData = {
        state: q.lobbyState,
        queueSize: q.size,
        players: Array.from(q.lobbyPlayers.values()).map((p) => ({
            id: p.player.id,
            name: p.player.name,
            ready: p.ready
        })),
        countdown: 0,
        voteMaps: q.voteMaps.map((m) => ({ id: m.preset.id, name: m.preset.name, votes: m.votes })),
        voteEndsAt: q.voteEndsAt
    };

    if ((q.lobbyState === "waiting" && q.countdownInterval) || q.lobbyState === "voting") {
        baseData.countdown = Math.max(0, Math.ceil((q.voteEndsAt - Date.now()) / 1000));
    }

    const event = q.lobbyState === "voting" ? "setVoting" : "setLobby";
    Array.from(q.lobbyPlayers.values()).forEach((lp) => {
        const p = lp.player;
        if (mp.players.exists(p)) {
            const data = { ...baseData, myVote: lp.voteMapId ?? null };
            (RAGERP.cef.emit as Function)(p, "arena", event, data);
        }
    });
}

function startCountdown(q: QueueInstance): void {
    if (q.lobbyState !== "waiting" || q.countdownInterval) return;
    q.voteEndsAt = Date.now() + LOBBY_COUNTDOWN_SEC * 1000;

    q.countdownInterval = setInterval(() => {
        const remaining = Math.ceil((q.voteEndsAt - Date.now()) / 1000);
        emitLobbyToAll(q);
        if (remaining <= 0) {
            if (q.countdownInterval) clearInterval(q.countdownInterval);
            q.countdownInterval = null;
            startVoting(q);
        }
    }, 1000);
    emitLobbyToAll(q);
}

function startVoting(q: QueueInstance): void {
    q.lobbyState = "voting";
    const presets = getArenaPresets();
    const preferredIds = new Set<string>();
    q.lobbyPlayers.forEach((lp) => {
        if (lp.preferredMapId) preferredIds.add(lp.preferredMapId);
    });

    let candidates = presets.filter((p) => preferredIds.has(p.id));
    if (candidates.length >= 3) {
        candidates = [...candidates].sort(() => Math.random() - 0.5).slice(0, 3);
    } else {
        const remaining = presets.filter((p) => !preferredIds.has(p.id));
        const shuffled = remaining.sort(() => Math.random() - 0.5);
        candidates = candidates.concat(shuffled.slice(0, 3 - candidates.length));
    }

    q.voteMaps = candidates.map((p) => ({ preset: p, votes: 0 }));
    q.voteEndsAt = Date.now() + VOTING_DURATION_SEC * 1000;

    q.lobbyPlayers.forEach((lp) => {
        lp.voteMapId = null;
        if (lp.preferredMapId && q.voteMaps.some((m) => m.preset.id === lp.preferredMapId)) {
            lp.voteMapId = lp.preferredMapId;
        }
    });
    q.lobbyPlayers.forEach((lp) => {
        if (!lp.voteMapId) return;
        const map = q.voteMaps.find((m) => m.preset.id === lp.voteMapId);
        if (map) map.votes++;
    });

    Array.from(q.lobbyPlayers.values()).forEach((lp) => {
        const p = lp.player;
        if (mp.players.exists(p)) {
            RAGERP.cef.emit(p, "system", "setPage", "arena_voting");
        }
    });

    if (q.votingInterval) clearInterval(q.votingInterval);
    q.votingInterval = setInterval(() => {
        const remaining = Math.ceil((q.voteEndsAt - Date.now()) / 1000);
        emitLobbyToAll(q);
        if (remaining <= 0) {
            if (q.votingInterval) clearInterval(q.votingInterval);
            q.votingInterval = null;
            startReadyCheck(q);
        }
    }, 1000);
    emitLobbyToAll(q);
}

function startReadyCheck(q: QueueInstance): void {
    q.lobbyState = "starting";

    if (q.voteMaps.length === 0) {
        Array.from(q.lobbyPlayers.values()).forEach((lp) => lp.player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "No arena locations available."));
        resetQueue(q);
        return;
    }

    let winner: IArenaPreset;
    const maxVotes = Math.max(...q.voteMaps.map((m) => m.votes), 0);
    const tied = q.voteMaps.filter((m) => m.votes === maxVotes);
    winner = tied.length > 1 || maxVotes === 0
        ? tied[Math.floor(Math.random() * tied.length)]?.preset ?? q.voteMaps[0].preset
        : q.voteMaps.find((m) => m.votes === maxVotes)?.preset ?? q.voteMaps[0].preset;

    const players = Array.from(q.lobbyPlayers.values()).map((lp) => lp.player);
    const dim = allocateDimension();

    const redTeam: PlayerMp[] = [];
    const blueTeam: PlayerMp[] = [];
    const groups: PlayerMp[][] = [];
    const assigned = new Set<number>();
    q.partyInLobby.forEach((memberIds: Set<number>) => {
        const group = [...memberIds].map((id) => mp.players.at(id)).filter((p): p is PlayerMp => !!p && mp.players.exists(p));
        if (group.length > 0) {
            groups.push(group);
            group.forEach((p) => assigned.add(p.id));
        }
    });
    players.forEach((p) => {
        if (!assigned.has(p.id)) groups.push([p]);
    });
    groups.sort((a, b) => b.length - a.length);
    for (const group of groups) {
        const redSpace = q.size - redTeam.length;
        const blueSpace = q.size - blueTeam.length;
        if (redSpace >= group.length) {
            group.forEach((p) => redTeam.push(p));
        } else if (blueSpace >= group.length) {
            group.forEach((p) => blueTeam.push(p));
        } else if (redSpace >= blueSpace) {
            group.forEach((p) => redTeam.push(p));
        } else {
            group.forEach((p) => blueTeam.push(p));
        }
    }

    const responses = new Map<number, "accept" | "decline">();
    const allPlayerIds = [...redTeam, ...blueTeam].map((p) => p.id);
    const timeoutId = setTimeout(() => {
        if (q.pendingMatch) cancelReadyCheck(q);
    }, READY_CHECK_DURATION_MS);

    q.pendingMatch = { q, winner, redTeam, blueTeam, dim, responses, timeoutId };

    [...redTeam, ...blueTeam].forEach((p) => {
        if (mp.players.exists(p)) {
            RAGERP.cef.emit(p, "match", "readyCheck", { mapName: winner.name, timeLeft: 10 });
            RAGERP.cef.startPage(p, "arena_readycheck");
            RAGERP.cef.emit(p, "system", "setPage", "arena_readycheck");
        }
    });
}

function cancelReadyCheck(q: QueueInstance): void {
    const pending = q.pendingMatch;
    if (!pending) return;
    clearTimeout(pending.timeoutId);
    q.pendingMatch = null;
    q.lobbyState = "waiting";
    q.voteMaps = [];
    q.voteEndsAt = 0;
    q.votingInterval = null;
    q.countdownInterval = null;

    Array.from(q.lobbyPlayers.values()).forEach((lp) => {
        const p = lp.player;
        if (mp.players.exists(p)) {
            p.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Match cancelled. Returning to queue.");
            RAGERP.cef.startPage(p, "arena_lobby");
            RAGERP.cef.emit(p, "system", "setPage", "arena_lobby");
        }
    });
    emitLobbyToAll(q);
    if (isQueueFull(q.size) && !q.countdownInterval) startCountdown(q);
}

function proceedToMatch(pending: PendingMatchData): void {
    const { q, winner, redTeam, blueTeam, dim } = pending;
    if (q.pendingMatch !== pending) return;
    clearTimeout(pending.timeoutId);
    q.pendingMatch = null;

    startArenaMatch(dim, winner, redTeam, blueTeam);

    const matchData = {
        mapId: winner.id,
        mapName: winner.name,
        queueSize: q.size,
        redTeam: redTeam.map((p) => ({ id: p.id, name: p.name })),
        blueTeam: blueTeam.map((p) => ({ id: p.id, name: p.name })),
        dimension: dim,
        redScore: 0,
        blueScore: 0,
        currentRound: 1,
        roundsToWin: ARENA_CONFIG.roundsToWin,
        timeLeft: ARENA_CONFIG.maxRoundTime
    };

    [...redTeam, ...blueTeam].forEach((p) => {
        if (mp.players.exists(p)) {
            RAGERP.cef.emit(p, "arena", "setMatch", matchData);
            RAGERP.cef.startPage(p, "arena_hud");
            RAGERP.cef.emit(p, "system", "setPage", "arena_hud");
        }
    });

    redTeam.forEach((p) => {
        if (mp.players.exists(p)) p.call("client::arena:setTeam", ["red"]);
    });
    blueTeam.forEach((p) => {
        if (mp.players.exists(p)) p.call("client::arena:setTeam", ["blue"]);
    });

    resetQueue(q);
}


function resetQueue(q: QueueInstance): void {
    queueClearQueue(q.size);
    q.lobbyPlayers.clear();
    q.partyInLobby.clear();
    q.lobbyState = "waiting";
    q.voteMaps = [];
    q.voteEndsAt = 0;
}

export function joinQueue(player: PlayerMp, size: QueueSize = 2, preferredMapId?: string): boolean {
    if (!player.character) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "No character loaded.");
        return false;
    }
    if (isPlayerInArenaMatch(player)) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Already in a match.");
        return false;
    }
    if (getPlayerQueue(player)) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Already in a queue.");
        return false;
    }

    const q = lobbyInstances.get(size);
    if (!q) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid queue size.");
        return false;
    }

    queueAddPlayer(player, size);
    q.lobbyPlayers.set(player.id, { player, ready: false, voteMapId: null, preferredMapId: preferredMapId ?? null });

    const neededPlayers = size * 2;
    if (isQueueFull(size) && !q.countdownInterval) {
        startCountdown(q);
    } else {
        const data: LobbyData = {
            state: "waiting",
            queueSize: q.size,
            players: Array.from(q.lobbyPlayers.values()).map((p) => ({ id: p.player.id, name: p.player.name, ready: p.ready })),
            countdown: 0,
            voteMaps: [],
            voteEndsAt: 0,
            myVote: null
        };
        RAGERP.cef.emit(player, "arena", "setLobby", data);
    }
    emitLobbyToAll(q);
    return true;
}

export function joinQueueWithParty(leader: PlayerMp, size: QueueSize = 2, preferredMapId?: string): boolean {
    const party = getPartyByPlayer(leader);
    if (!party) {
        leader.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You are not in a party.");
        return false;
    }
    if (!isLeader(leader)) {
        leader.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Only the party leader can queue.");
        return false;
    }

    const canQueue = canPartyQueue(party.partyId, size);
    if (!canQueue.ok) {
        leader.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, canQueue.reason ?? "Cannot queue.");
        return false;
    }

    const q = lobbyInstances.get(size);
    if (!q) {
        leader.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid queue size.");
        return false;
    }

    const members = getPartyMemberIds(party.partyId).map((id) => mp.players.at(id)).filter((p): p is PlayerMp => !!p && mp.players.exists(p));
    if (!queueAddPlayers(members, size)) {
        leader.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Could not add party to queue.");
        return false;
    }

    const memberIds = new Set(members.map((p) => p.id));
    q.partyInLobby.set(party.partyId, memberIds);
    members.forEach((p) => {
        q.lobbyPlayers.set(p.id, { player: p, ready: false, voteMapId: null, preferredMapId: preferredMapId ?? null });
    });

    if (isQueueFull(size) && !q.countdownInterval) {
        startCountdown(q);
    }
    emitLobbyToAll(q);
    return true;
}

export function removePartyFromQueue(partyId: string): boolean {
    let q: QueueInstance | null = null;
    for (const inst of lobbyInstances.values()) {
        if (inst.partyInLobby.has(partyId)) {
            q = inst;
            break;
        }
    }
    if (!q) return false;

    const memberIds = q.partyInLobby.get(partyId)!;
    const toRemove = [...memberIds];
    q.partyInLobby.delete(partyId);
    queueRemovePlayers(toRemove, q.size);
    toRemove.forEach((id) => q.lobbyPlayers.delete(id));
    toRemove.forEach((id) => {
        const p = mp.players.at(id);
        if (p && mp.players.exists(p)) {
            RAGERP.cef.startPage(p, "mainmenu");
            RAGERP.cef.emit(p, "system", "setPage", "mainmenu");
        }
    });
    const neededPlayers = q.size * 2;
    if (q.lobbyPlayers.size < neededPlayers && q.countdownInterval) {
        clearInterval(q.countdownInterval);
        q.countdownInterval = null;
    }
    emitLobbyToAll(q);
    if (process.env.DEBUG_MODE) console.log(`[Arena] Queue removal: party ${partyId} removed from size ${q.size}`);
    return true;
}

/**
 * Called when a player disconnects while in queue. Removes them (and their party if any)
 * from the lobby and sends remaining members to main menu.
 * Also cancels ready check if the player was in a pending match.
 */
export function onPlayerDisconnectFromQueue(playerId: number): boolean {
    for (const inst of lobbyInstances.values()) {
        if (inst.pendingMatch) {
            const { redTeam, blueTeam } = inst.pendingMatch;
            if ([...redTeam, ...blueTeam].some((p) => p.id === playerId)) {
                cancelReadyCheck(inst);
                break;
            }
        }
    }

    let q: QueueInstance | null = null;
    for (const inst of lobbyInstances.values()) {
        if (inst.lobbyPlayers.has(playerId)) {
            q = inst;
            break;
        }
    }
    if (!q) return false;

    let toRemove: number[] = [playerId];
    for (const [partyId, memberIds] of q.partyInLobby) {
        if (memberIds.has(playerId)) {
            toRemove = [...memberIds];
            q.partyInLobby.delete(partyId);
            break;
        }
    }

    queueRemovePlayers(toRemove, q.size);
    toRemove.forEach((id) => q.lobbyPlayers.delete(id));

    toRemove.forEach((id) => {
        const p = mp.players.at(id);
        if (p && mp.players.exists(p) && id !== playerId) {
            RAGERP.cef.startPage(p, "mainmenu");
            RAGERP.cef.emit(p, "system", "setPage", "mainmenu");
        }
    });

    const neededPlayers = q.size * 2;
    const currentCount = q.lobbyPlayers.size;
    if (currentCount < neededPlayers && q.countdownInterval) {
        clearInterval(q.countdownInterval);
        q.countdownInterval = null;
    }
    emitLobbyToAll(q);
    if (process.env.DEBUG_MODE) console.log(`[Arena] Queue removal (disconnect): player ${playerId}, size ${q.size}`);
    return true;
}

export function leaveQueue(player: PlayerMp): boolean {
    const q = getPlayerQueue(player);
    if (!q) return false;

    if (!q.lobbyPlayers.has(player.id)) return false;

    let toRemove: number[] = [player.id];
    for (const [partyId, memberIds] of q.partyInLobby) {
        if (memberIds.has(player.id)) {
            toRemove = [...memberIds];
            q.partyInLobby.delete(partyId);
            break;
        }
    }

    queueRemovePlayers(toRemove, q.size);
    toRemove.forEach((id) => q.lobbyPlayers.delete(id));

    toRemove.forEach((id) => {
        const p = mp.players.at(id);
        if (p && mp.players.exists(p) && id !== player.id) {
            RAGERP.cef.startPage(p, "mainmenu");
            RAGERP.cef.emit(p, "system", "setPage", "mainmenu");
        }
    });

    const neededPlayers = q.size * 2;
    const currentCount = q.lobbyPlayers.size;
    if (currentCount < neededPlayers && q.countdownInterval) {
        clearInterval(q.countdownInterval);
        q.countdownInterval = null;
    }
    emitLobbyToAll(q);
    return true;
}

export function vote(player: PlayerMp, mapId: string): boolean {
    const q = getPlayerQueue(player);
    if (!q || q.lobbyState !== "voting") return false;
    const lp = q.lobbyPlayers.get(player.id);
    if (!lp) return false;

    const map = q.voteMaps.find((m) => m.preset.id === mapId);
    if (!map) return false;

    if (lp.voteMapId) {
        const prev = q.voteMaps.find((m) => m.preset.id === lp.voteMapId);
        if (prev) prev.votes--;
    }
    lp.voteMapId = mapId;
    map.votes++;
    emitLobbyToAll(q);
    return true;
}

function getPendingMatchForPlayer(playerId: number): PendingMatchData | null {
    for (const inst of lobbyInstances.values()) {
        if (inst.pendingMatch) {
            const { redTeam, blueTeam } = inst.pendingMatch;
            if ([...redTeam, ...blueTeam].some((p) => p.id === playerId)) return inst.pendingMatch;
        }
    }
    return null;
}

export function acceptReadyCheck(player: PlayerMp): boolean {
    const pending = getPendingMatchForPlayer(player.id);
    if (!pending) return false;
    pending.responses.set(player.id, "accept");
    const allIds = [...pending.redTeam, ...pending.blueTeam].map((p) => p.id);
    const allAccepted = allIds.every((id) => pending.responses.get(id) === "accept");
    if (allAccepted) proceedToMatch(pending);
    return true;
}

export function declineReadyCheck(player: PlayerMp): boolean {
    const pending = getPendingMatchForPlayer(player.id);
    if (!pending) return false;
    cancelReadyCheck(pending.q);
    return true;
}

export function getLobbyState(size: QueueSize): { state: ArenaLobbyState; playerCount: number } {
    const q = lobbyInstances.get(size);
    if (!q) return { state: "waiting", playerCount: 0 };
    return { state: q.lobbyState, playerCount: q.lobbyPlayers.size };
}

export function startSoloMatch(player: PlayerMp, presetId?: string): boolean {
    if (isPlayerInArenaMatch(player)) return false;
    const presets = getArenaPresets();
    if (presets.length === 0) return false;

    const preset = presetId ? presets.find((p) => p.id === presetId) : presets[0];
    if (!preset) return false;

    const dim = allocateDimension();
    startArenaMatch(dim, preset, [player], []);

    const matchData = {
        mapId: preset.id,
        mapName: preset.name,
        queueSize: 2 as QueueSize,
        redTeam: [{ id: player.id, name: player.name }],
        blueTeam: [] as { id: number; name: string }[],
        dimension: dim,
        redScore: 0,
        blueScore: 0,
        currentRound: 1,
        roundsToWin: ARENA_CONFIG.roundsToWin,
        timeLeft: ARENA_CONFIG.maxRoundTime
    };

    RAGERP.cef.emit(player, "arena", "setMatch", matchData);
    RAGERP.cef.startPage(player, "arena_hud");
    RAGERP.cef.emit(player, "system", "setPage", "arena_hud");
    player.call("client::arena:setTeam", ["red"]);
    return true;
}
