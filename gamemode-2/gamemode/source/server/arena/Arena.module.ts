import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { getArenaPresets } from "./ArenaPresets.asset";
import { IArenaPreset } from "./ArenaPreset.interface";
import { startMatch as startArenaMatch, isPlayerInArenaMatch } from "./ArenaMatch.manager";
import { QUEUE_SIZES, QueueSize, ARENA_CONFIG } from "./ArenaConfig";
import "./WeaponPresets.service";

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

interface QueueInstance {
    size: QueueSize;
    queue: PlayerMp[];
    lobbyPlayers: Map<number, LobbyPlayer>;
    lobbyState: ArenaLobbyState;
    countdownInterval: ReturnType<typeof setInterval> | null;
    votingInterval: ReturnType<typeof setInterval> | null;
    voteMaps: { preset: IArenaPreset; votes: number }[];
    voteEndsAt: number;
}

const queues = new Map<QueueSize, QueueInstance>();
let nextDimension = 1000;

QUEUE_SIZES.forEach((size) => {
    queues.set(size, {
        size,
        queue: [],
        lobbyPlayers: new Map(),
        lobbyState: "waiting",
        countdownInterval: null,
        votingInterval: null,
        voteMaps: [],
        voteEndsAt: 0
    });
});

function getPlayerQueue(player: PlayerMp): QueueInstance | null {
    for (const q of queues.values()) {
        if (q.queue.some((p) => p.id === player.id)) return q;
    }
    return null;
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
    q.queue.forEach((p) => {
        if (mp.players.exists(p)) {
            const lp = q.lobbyPlayers.get(p.id);
            const data = { ...baseData, myVote: lp?.voteMapId ?? null };
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

    q.queue.forEach((p) => {
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
            launchMatch(q);
        }
    }, 1000);
    emitLobbyToAll(q);
}

function launchMatch(q: QueueInstance): void {
    q.lobbyState = "starting";

    if (q.voteMaps.length === 0) {
        q.queue.forEach((p) => p.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "No arena locations available."));
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
    const dim = nextDimension++;

    const redTeam: PlayerMp[] = [];
    const blueTeam: PlayerMp[] = [];
    players.forEach((p, i) => {
        if (i % 2 === 0) redTeam.push(p);
        else blueTeam.push(p);
    });

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
    q.queue = [];
    q.lobbyPlayers.clear();
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

    const q = queues.get(size);
    if (!q) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid queue size.");
        return false;
    }

    q.queue.push(player);
    q.lobbyPlayers.set(player.id, { player, ready: false, voteMapId: null, preferredMapId: preferredMapId ?? null });

    const neededPlayers = size * 2;
    if (q.queue.length >= neededPlayers && !q.countdownInterval) {
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

export function leaveQueue(player: PlayerMp): boolean {
    const q = getPlayerQueue(player);
    if (!q) return false;

    const idx = q.queue.findIndex((p) => p.id === player.id);
    if (idx < 0) return false;

    q.queue.splice(idx, 1);
    q.lobbyPlayers.delete(player.id);

    const neededPlayers = q.size * 2;
    if (q.queue.length < neededPlayers && q.countdownInterval) {
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

export function getLobbyState(size: QueueSize): { state: ArenaLobbyState; playerCount: number } {
    const q = queues.get(size);
    if (!q) return { state: "waiting", playerCount: 0 };
    return { state: q.lobbyState, playerCount: q.queue.length };
}

export function startSoloMatch(player: PlayerMp, presetId?: string): boolean {
    if (isPlayerInArenaMatch(player)) return false;
    const presets = getArenaPresets();
    if (presets.length === 0) return false;

    const preset = presetId ? presets.find((p) => p.id === presetId) : presets[0];
    if (!preset) return false;

    const dim = nextDimension++;
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
