import { makeAutoObservable } from "mobx";
import EventManager from "utils/EventManager.util";

export interface GunGameLobbyData {
    players: { id: number; name: string }[];
    needed: number;
    maxPlayers: number;
}

export interface GunGameLeaderboardEntry {
    id: number;
    name: string;
    tier: number;
    kills: number;
    deaths: number;
    weaponName: string;
}

export interface GunGameMatchData {
    mapId: string;
    mapName: string;
    dimension: number;
    totalTiers: number;
    weaponOrder: string[];
    leaderboard: GunGameLeaderboardEntry[];
}

export interface GunGameMatchUpdate {
    state: string;
    totalTiers: number;
    weaponOrder: string[];
    leaderboard: GunGameLeaderboardEntry[];
    topPlayer: GunGameLeaderboardEntry | null;
}

export interface GunGameMatchEnd {
    winner: { id: number; name: string; tier: number; kills: number } | null;
    leaderboard: { id: number; name: string; tier: number; kills: number; deaths: number }[];
}

class GunGameStore {
    lobby: GunGameLobbyData | null = null;
    match: GunGameMatchData | null = null;
    matchUpdate: GunGameMatchUpdate | null = null;
    matchEnd: GunGameMatchEnd | null = null;

    constructor() {
        makeAutoObservable(this);

        EventManager.addHandler("gungame", "setLobby", (data: GunGameLobbyData) => {
            this.lobby = data;
            this.match = null;
            this.matchEnd = null;
            this.matchUpdate = null;
        });

        EventManager.addHandler("gungame", "setMatch", (data: GunGameMatchData) => {
            this.match = data;
            this.matchUpdate = {
                state: "active",
                totalTiers: data.totalTiers,
                weaponOrder: data.weaponOrder,
                leaderboard: data.leaderboard,
                topPlayer: data.leaderboard[0] ?? null
            };
            this.matchEnd = null;
        });

        EventManager.addHandler("gungame", "matchUpdate", (data: GunGameMatchUpdate) => {
            this.matchUpdate = data;
        });

        EventManager.addHandler("gungame", "matchEnd", (data: GunGameMatchEnd) => {
            this.matchEnd = data;
            this.match = null;
            this.matchUpdate = null;
        });

        EventManager.addHandler("gungame", "leftMatch", () => {
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

export const gunGameStore = new GunGameStore();
