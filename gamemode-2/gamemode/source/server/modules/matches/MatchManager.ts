/**
 * Generic match registry and team tracking.
 * Stores matches by dimension; provides lookup and team helpers.
 * Mode-specific logic (rounds, weapons, zone) stays in modes.
 */

export type Team = "red" | "blue";

export interface IMatchPlayer {
    id: number;
    name: string;
    alive: boolean;
    kills: number;
    deaths: number;
}

export interface IMatchData {
    dimension: number;
    state: string;
    redTeam: IMatchPlayer[];
    blueTeam: IMatchPlayer[];
    redScore: number;
    blueScore: number;
    currentRound: number;
    roundEndsAt: number;
}

const activeMatches = new Map<number, IMatchData>();
const playerToMatch = new Map<number, number>();

export function getMatchByDimension<T extends IMatchData = IMatchData>(dim: number): T | undefined {
    return activeMatches.get(dim) as T | undefined;
}

export function getMatchByPlayer<T extends IMatchData = IMatchData>(player: PlayerMp): T | undefined {
    const dim = playerToMatch.get(player.id);
    return dim !== undefined ? (activeMatches.get(dim) as T | undefined) : undefined;
}

export function isPlayerInMatch(player: PlayerMp): boolean {
    return playerToMatch.has(player.id);
}

export function getTeam(match: IMatchData, playerId: number): Team | null {
    if (match.redTeam.some((p) => p.id === playerId)) return "red";
    if (match.blueTeam.some((p) => p.id === playerId)) return "blue";
    return null;
}

export function isAliveInMatch(match: IMatchData, playerId: number): boolean {
    const p = [...match.redTeam, ...match.blueTeam].find((x) => x.id === playerId);
    return p ? p.alive : false;
}

export function registerMatch<T extends IMatchData>(match: T): void {
    activeMatches.set(match.dimension, match);
    [...match.redTeam, ...match.blueTeam].forEach((p) => playerToMatch.set(p.id, match.dimension));
}

export function unregisterMatch(dimension: number): void {
    const match = activeMatches.get(dimension);
    if (match) {
        [...match.redTeam, ...match.blueTeam].forEach((p) => playerToMatch.delete(p.id));
        activeMatches.delete(dimension);
    }
}

export function unregisterPlayer(playerId: number): void {
    playerToMatch.delete(playerId);
}

export function registerPlayer(playerId: number, dimension: number): void {
    playerToMatch.set(playerId, dimension);
}

export function getAllMatches<T extends IMatchData = IMatchData>(): Map<number, T> {
    return activeMatches as Map<number, T>;
}
