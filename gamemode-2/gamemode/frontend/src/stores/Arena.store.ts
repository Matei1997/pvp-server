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
    /** Optional: damage dealt this round (if backend sends) */
    damage?: number;
    /** Optional: headshot hits (if backend sends) */
    headshots?: number;
    /** Optional: total hits (if backend sends, for headshot %) */
    hits?: number;
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
    killerId: number;
    killerName: string;
    victimId: number;
    victimName: string;
    weaponHash: string;
    weaponName: string;
    headshot?: boolean;
}

export interface ArenaMatchEndData {
    redScore: number;
    blueScore: number;
    redTeam: ArenaMatchPlayer[];
    blueTeam: ArenaMatchPlayer[];
    winner: "red" | "blue" | "draw";
    oldMMR?: number;
    newMMR?: number;
    rankTier?: string;
    xpGained?: number;
    leveledUp?: boolean;
    newLevel?: number;
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

export type ArenaDamageNumberStatus = "health" | "armor" | "headshot";

export interface ArenaDamageNumberEntry {
    id: string;
    damage: number;
    status: ArenaDamageNumberStatus;
    screenX: number;
    screenY: number;
    createdAt: number;
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
    minimapData: { x: number; y: number; heading: number; localPlayerId?: number } | null = null;
    outOfBounds: { active: boolean; timeLeft: number } = { active: false, timeLeft: 0 };
    myTeam: "red" | "blue" | null = null;
    mapName = "";
    /** Full-screen death overlay (tech style): show "YOU'RE DEAD", then "You won't respawn until next round." */
    arenaDeathOverlayVisible = false;
    arenaDeathRespawnMessage = false;
    /** Death recap panel: killer, weapon, damage stats. Shown when dead, auto-hides after 5s or round start. */
    deathRecap: {
        killerName: string;
        weaponName: string;
        totalDamage: number;
        hits: number;
        headshots: number;
        victimDamageToKiller: number;
    } | null = null;
    /** Alive count: redAlive, blueAlive. Updated on roundStart, death, disconnect, reconnect. */
    aliveCount: { redAlive: number; blueAlive: number } | null = null;
    /** Damage direction indicator: left/right/front/behind. Visible ~800ms, resets on new hit. */
    damageDirection: { direction: "left" | "right" | "front" | "behind"; at: number } | null = null;
    /** Armor break indicator: shown when armor transitions from >0 to 0. Visible ~400ms. */
    armorBreak: { at: number } | null = null;
    /** Last alive indicator: shown when a team has 1 player vs >1 enemies. Visible 3s. */
    lastAlive: { playerName: string; team: "red" | "blue"; enemiesRemaining: number } | null = null;
    /** Spectating: name of teammate being spectated. Set on arena:startSpectate, updated on cycle, cleared on round start. */
    spectatingTarget: string | null = null;
    /** Number of spectatable teammates (for "← → to switch" hint). */
    spectatingTeammateCount: number = 0;
    /** True when spectate stopped because no teammates remain (show "waiting for next round"). */
    spectatingNoTeammates: boolean = false;
    /** Floating damage numbers: id, damage, status, screenX/Y. Auto-removed after ~700ms. */
    damageNumbers: ArenaDamageNumberEntry[] = [];
    /** Round result overlay: ROUND WON / CLUTCH. Visible 3s, cleared on round start. */
    roundResult: {
        winnerTeam: "red" | "blue" | "draw";
        winningPlayerName?: string;
        clutch?: boolean;
        remainingEnemies?: number;
    } | null = null;
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
            this.roundResult = null;
            this.aliveCount = null;
            this.damageDirection = null;
            this.armorBreak = null;
            this.lastAlive = null;
            this.spectatingTarget = null;
            this.spectatingTeammateCount = 0;
            this.spectatingNoTeammates = false;
            this.deathRecap = null;
            this.clearArenaDeathOverlay();
            setTimeout(() => {
                if (this.roundStart?.round === data.round) this.roundStart = null;
            }, (data.warmupTime + 1) * 1000);
        });

        EventManager.addHandler("arena", "roundEnd", (data: ArenaRoundEnd) => {
            this.roundEnd = data;
            this.roundStart = null;
            setTimeout(() => (this.roundEnd = null), 3000);
        });

        EventManager.addHandler("arena", "aliveCount", (data: { redAlive: number; blueAlive: number }) => {
            this.aliveCount = { redAlive: data.redAlive, blueAlive: data.blueAlive };
        });

        EventManager.addHandler("arena", "roundResult", (data: {
            winnerTeam: "red" | "blue" | "draw";
            winningPlayerName?: string;
            clutch?: boolean;
            remainingEnemies?: number;
        }) => {
            this.roundResult = {
                winnerTeam: data.winnerTeam,
                winningPlayerName: data.winningPlayerName,
                clutch: data.clutch,
                remainingEnemies: data.remainingEnemies
            };
            this._arenaDeathTimeouts.push(setTimeout(() => (this.roundResult = null), 3000));
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

        EventManager.addHandler("arena", "startSpectate", (data: { teammates: { playerId: number; playerName: string }[] }) => {
            const teammates = data.teammates ?? [];
            this.spectatingTarget = teammates.length ? teammates[0].playerName : null;
            this.spectatingTeammateCount = teammates.length;
            this.spectatingNoTeammates = false;
        });

        EventManager.addHandler("arena", "spectateTargetChanged", (data: string | { playerName: string }) => {
            const parsed = typeof data === "string" ? (() => { try { return JSON.parse(data); } catch { return null; } })() : data;
            this.spectatingTarget = parsed?.playerName ?? null;
        });

        EventManager.addHandler("arena", "spectateStopped", () => {
            this.spectatingTarget = null;
            this.spectatingTeammateCount = 0;
            this.spectatingNoTeammates = true;
        });

        EventManager.addHandler("arena", "lastAlive", (data: { playerId: number; playerName: string; team: "red" | "blue"; enemiesRemaining: number }) => {
            this.lastAlive = { playerName: data.playerName, team: data.team, enemiesRemaining: data.enemiesRemaining };
            this._arenaDeathTimeouts.push(setTimeout(() => (this.lastAlive = null), 3000));
        });

        EventManager.addHandler("arena", "damageDirection", (data: { direction: "left" | "right" | "front" | "behind" }) => {
            const at = Date.now();
            this.damageDirection = { direction: data.direction, at };
            this._arenaDeathTimeouts.push(setTimeout(() => {
                if (this.damageDirection?.at === at) this.damageDirection = null;
            }, 850));
        });

        EventManager.addHandler("arena", "setMinimapData", (data: { x: number; y: number; heading: number; localPlayerId?: number }) => {
            this.minimapData = data;
        });

        EventManager.addHandler("arena", "outOfBounds", (data: { active: boolean; timeLeft: number }) => {
            this.outOfBounds = data;
        });

        EventManager.addHandler("arena", "killFeed", (entry: ArenaKillFeedEntry) => {
            this.killFeed = [entry, ...this.killFeed].slice(0, 8);
        });

        EventManager.addHandler("arena", "damageNumber", (data: { damage: number; status: string; screenX: number; screenY: number }) => {
            const id = `dn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const entry: ArenaDamageNumberEntry = {
                id,
                damage: data.damage,
                status: (data.status === "health" || data.status === "armor" || data.status === "headshot" ? data.status : "health") as ArenaDamageNumberStatus,
                screenX: data.screenX,
                screenY: data.screenY,
                createdAt: Date.now()
            };
            this.damageNumbers = [...this.damageNumbers, entry];
            this._arenaDeathTimeouts.push(setTimeout(() => {
                this.damageNumbers = this.damageNumbers.filter((e) => e.id !== id);
            }, 700));
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

        EventManager.addHandler("arena", "deathRecap", (data: {
            killerName: string;
            weaponName?: string;
            weaponHash?: string;
            totalDamage: number;
            hits: number;
            headshots: number;
            victimDamageToKiller: number;
        }) => {
            this.deathRecap = {
                killerName: data.killerName || "Unknown",
                weaponName: data.weaponName ?? data.weaponHash ?? "Unknown",
                totalDamage: data.totalDamage ?? 0,
                hits: data.hits ?? 0,
                headshots: data.headshots ?? 0,
                victimDamageToKiller: data.victimDamageToKiller ?? 0
            };
            this._arenaDeathTimeouts.push(setTimeout(() => (this.deathRecap = null), 5000));
        });

        EventManager.addHandler("arena", "toggleScoreboard", () => {
            this.scoreboardVisible = !this.scoreboardVisible;
        });

        EventManager.addHandler("arena", "matchEnd", (data: ArenaMatchEndData) => {
            this.matchEnd = data;
            this.match = null;
            this.damageNumbers = [];
            this.zone = null;
            this.roundResult = null;
            this.damageDirection = null;
            this.lastAlive = null;
            this.spectatingTarget = null;
            this.spectatingTeammateCount = 0;
            this.spectatingNoTeammates = false;
            this.deathRecap = null;
            this.clearArenaDeathOverlay();
        });

        EventManager.addHandler("arena", "leftMatch", () => {
            this.match = null;
            this.matchEnd = null;
            this.roundStart = null;
            this.roundEnd = null;
            this.roundResult = null;
            this.damageDirection = null;
            this.armorBreak = null;
            this.lastAlive = null;
            this.spectatingTarget = null;
            this.spectatingTeammateCount = 0;
            this.spectatingNoTeammates = false;
            this.zone = null;
            this.killFeed = [];
            this.damageNumbers = [];
            this.lastKillNotification = null;
            this.lastDeathNotification = null;
            this.deathRecap = null;
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
