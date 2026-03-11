import { makeAutoObservable } from "mobx";
import EventManager from "utils/EventManager.util";

export interface ArenaLobbyData {
    state: "waiting" | "voting" | "starting";
    queueSize?: number;
    players: { id: number; name: string; ready: boolean }[];
    countdown: number;
    voteMaps: { id: string; name: string; votes: number }[];
    voteEndsAt: number;
    myVote?: string | null;
}

export interface ArenaMatchPlayer {
    id: number;
    name: string;
    kills: number;
    deaths: number;
    alive: boolean;
    health?: number;
    armor?: number;
}

export interface ArenaMatchData {
    state: string;
    redScore: number;
    blueScore: number;
    currentRound: number;
    roundsToWin: number;
    weaponName: string;
    redAlive: number;
    blueAlive: number;
    redTeam: ArenaMatchPlayer[];
    blueTeam: ArenaMatchPlayer[];
    timeLeft: number;
}

export interface ArenaKillFeedEntry {
    killer: string;
    victim: string;
}

export interface ArenaMatchEndData {
    redScore: number;
    blueScore: number;
    redTeam: ArenaMatchPlayer[];
    blueTeam: ArenaMatchPlayer[];
    winner: "red" | "blue" | "draw";
}

export interface ArenaZoneData {
    centerX: number;
    centerY: number;
    radius: number;
    phase: number;
    totalPhases: number;
    phaseTimeLeft: number;
    dps: number;
}

export interface ArenaRoundStart {
    round: number;
    weaponName: string;
    warmupTime: number;
    redScore: number;
    blueScore: number;
    roundsToWin: number;
}

export interface ArenaRoundEnd {
    winner: "red" | "blue" | "draw";
    redScore: number;
    blueScore: number;
    round: number;
    roundsToWin: number;
}

class ArenaStore {
    lobby: ArenaLobbyData = {
        state: "waiting",
        players: [],
        countdown: 0,
        voteMaps: [],
        voteEndsAt: 0
    };

    match: ArenaMatchData | null = null;
    killFeed: ArenaKillFeedEntry[] = [];
    matchEnd: ArenaMatchEndData | null = null;
    roundStart: ArenaRoundStart | null = null;
    roundEnd: ArenaRoundEnd | null = null;
    zone: ArenaZoneData | null = null;
    itemCounts: { medkits: number; plates: number } = { medkits: 0, plates: 0 };
    itemCast: { item: "medkit" | "plate"; castTime: number; startedAt: number } | null = null;
    lastKillNotification: { type: "kill"; victim: string } | null = null;
    lastDeathNotification: { type: "death"; killer: string } | null = null;
    scoreboardVisible = false;
    vitals: { health: number; armor: number } = { health: 100, armor: 0 };
    minimapData: { x: number; y: number; heading: number } | null = null;
    outOfBounds: { active: boolean; timeLeft: number } = { active: false, timeLeft: 0 };
    myTeam: "red" | "blue" | null = null;
    mapName = "";
    /** Full-screen death overlay (tech style): show "YOU'RE DEAD", then "You won't respawn until next round." */
    arenaDeathOverlayVisible = false;
    arenaDeathRespawnMessage = false;
    private _arenaDeathTimeouts: ReturnType<typeof setTimeout>[] = [];

    constructor() {
        makeAutoObservable(this);

        EventManager.addHandler("arena", "setLobby", (data: ArenaLobbyData) => {
            this.matchEnd = null;
            this.match = null;
            this.roundStart = null;
            this.roundEnd = null;
            this.zone = null;
            this.setLobby(data);
        });

        EventManager.addHandler("arena", "setVoting", (data: ArenaLobbyData) => this.setLobby(data));

        EventManager.addHandler("arena", "setMatch", (data: any) => {
            this.mapName = data.mapName;
            this.killFeed = [];
            this.matchEnd = null;
            this.roundStart = null;
            this.roundEnd = null;
            this.zone = null;
            this.match = {
                state: "warmup",
                redScore: 0,
                blueScore: 0,
                currentRound: data.currentRound ?? 1,
                roundsToWin: data.roundsToWin ?? 7,
                weaponName: "",
                redAlive: data.redTeam.length,
                blueAlive: data.blueTeam.length,
                redTeam: data.redTeam.map((p: any) => ({ id: p.id, name: p.name, kills: 0, deaths: 0, alive: true })),
                blueTeam: data.blueTeam.map((p: any) => ({ id: p.id, name: p.name, kills: 0, deaths: 0, alive: true })),
                timeLeft: data.timeLeft ?? 180
            };
        });

        EventManager.addHandler("arena", "matchUpdate", (data: ArenaMatchData) => {
            this.match = data;
        });

        EventManager.addHandler("arena", "roundStart", (data: ArenaRoundStart) => {
            this.roundStart = data;
            this.roundEnd = null;
            this.clearArenaDeathOverlay();
            setTimeout(() => {
                if (this.roundStart?.round === data.round) this.roundStart = null;
            }, (data.warmupTime + 1) * 1000);
        });

        EventManager.addHandler("arena", "roundEnd", (data: ArenaRoundEnd) => {
            this.roundEnd = data;
            this.roundStart = null;
            setTimeout(() => (this.roundEnd = null), 4000);
        });

        EventManager.addHandler("arena", "zoneUpdate", (data: ArenaZoneData) => {
            this.zone = data;
        });

        EventManager.addHandler("arena", "itemCounts", (data: { medkits: number; plates: number }) => {
            this.itemCounts = data;
        });

        EventManager.addHandler("arena", "itemCastStart", (data: { item: "medkit" | "plate"; castTime: number }) => {
            this.itemCast = { ...data, startedAt: Date.now() };
        });

        EventManager.addHandler("arena", "itemCastComplete", () => {
            this.itemCast = null;
        });

        EventManager.addHandler("arena", "itemCastCancel", () => {
            this.itemCast = null;
        });

        EventManager.addHandler("arena", "setVitals", (data: { health: number; armor: number }) => {
            this.vitals = data;
        });

        EventManager.addHandler("arena", "setMinimapData", (data: { x: number; y: number; heading: number }) => {
            this.minimapData = data;
        });

        EventManager.addHandler("arena", "outOfBounds", (data: { active: boolean; timeLeft: number }) => {
            this.outOfBounds = data;
        });

        EventManager.addHandler("arena", "killFeed", (entry: ArenaKillFeedEntry) => {
            this.killFeed = [entry, ...this.killFeed].slice(0, 8);
        });

        EventManager.addHandler("arena", "youKill", (data: { victim: string }) => {
            this.lastKillNotification = { type: "kill", victim: data.victim };
            setTimeout(() => (this.lastKillNotification = null), 2500);
        });

        EventManager.addHandler("arena", "youDied", (data: { killer: string }) => {
            this.lastDeathNotification = { type: "death", killer: data.killer };
            setTimeout(() => (this.lastDeathNotification = null), 3000);
            // Death banner: "YOU'RE DEAD" → "You won't respawn until next round." then auto-hide after ~3.5s
            this._arenaDeathTimeouts.forEach((id) => clearTimeout(id));
            this._arenaDeathTimeouts = [];
            this.arenaDeathOverlayVisible = true;
            this.arenaDeathRespawnMessage = false;
            this._arenaDeathTimeouts.push(
                setTimeout(() => {
                    this.arenaDeathRespawnMessage = true;
                }, 1500)
            );
            this._arenaDeathTimeouts.push(
                setTimeout(() => this.clearArenaDeathOverlay(), 3500)
            );
        });

        EventManager.addHandler("arena", "toggleScoreboard", () => {
            this.scoreboardVisible = !this.scoreboardVisible;
        });

        EventManager.addHandler("arena", "matchEnd", (data: ArenaMatchEndData) => {
            this.matchEnd = data;
            this.match = null;
            this.zone = null;
            this.clearArenaDeathOverlay();
        });

        EventManager.addHandler("arena", "leftMatch", () => {
            this.match = null;
            this.matchEnd = null;
            this.roundStart = null;
            this.roundEnd = null;
            this.zone = null;
            this.killFeed = [];
            this.lastKillNotification = null;
            this.lastDeathNotification = null;
            this.itemCast = null;
            this.itemCounts = { medkits: 0, plates: 0 };
            this.clearArenaDeathOverlay();
            this.outOfBounds = { active: false, timeLeft: 0 };
        });
    }

    clearArenaDeathOverlay() {
        this._arenaDeathTimeouts.forEach((id) => clearTimeout(id));
        this._arenaDeathTimeouts = [];
        this.arenaDeathOverlayVisible = false;
        this.arenaDeathRespawnMessage = false;
    }

    setLobby(data: ArenaLobbyData) {
        this.lobby = data;
    }

    setMyTeam(team: "red" | "blue") {
        this.myTeam = team;
    }
}

export const arenaStore = new ArenaStore();
