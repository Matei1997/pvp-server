import { makeAutoObservable } from "mobx";
import EventManager from "utils/EventManager.util";

export interface FfaLobbyData {
    players: { id: number; name: string }[];
    needed: number;
    maxPlayers: number;
}

export interface FfaLeaderboardEntry {
    id: number;
    name: string;
    score: number;
    deaths: number;
}

export interface FfaMatchData {
    mapId: string;
    mapName: string;
    dimension: number;
    scoreToWin: number;
    leaderboard: FfaLeaderboardEntry[];
}

export interface FfaMatchUpdate {
    state: string;
    scoreToWin: number;
    leaderboard: FfaLeaderboardEntry[];
    topPlayer: FfaLeaderboardEntry | null;
}

export interface FfaMatchEnd {
    winner: { id: number; name: string; score: number } | null;
    leaderboard: FfaLeaderboardEntry[];
}

class FfaStore {
    lobby: FfaLobbyData | null = null;
    match: FfaMatchData | null = null;
    matchUpdate: FfaMatchUpdate | null = null;
    matchEnd: FfaMatchEnd | null = null;

    constructor() {
        makeAutoObservable(this);

        EventManager.addHandler("ffa", "setLobby", (data: FfaLobbyData) => {
            this.lobby = data;
            this.match = null;
            this.matchEnd = null;
            this.matchUpdate = null;
        });

        EventManager.addHandler("ffa", "setMatch", (data: FfaMatchData) => {
            this.match = data;
            this.matchUpdate = {
                state: "active",
                scoreToWin: data.scoreToWin,
                leaderboard: data.leaderboard,
                topPlayer: data.leaderboard[0] ?? null
            };
            this.matchEnd = null;
        });

        EventManager.addHandler("ffa", "matchUpdate", (data: FfaMatchUpdate) => {
            this.matchUpdate = data;
        });

        EventManager.addHandler("ffa", "matchEnd", (data: FfaMatchEnd) => {
            this.matchEnd = data;
            this.match = null;
            this.matchUpdate = null;
        });

        EventManager.addHandler("ffa", "leftMatch", () => {
            this.match = null;
            this.matchUpdate = null;
            this.matchEnd = null;
        });
    }

    reset() {
        this.lobby = null;
        this.match = null;
        this.matchUpdate = null;
        this.matchEnd = null;
    }
}

export const ffaStore = new FfaStore();
