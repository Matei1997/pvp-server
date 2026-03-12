/**
 * Active season configuration. Single active season at a time.
 * Update this when starting a new season.
 */
export interface SeasonDefinition {
    seasonId: string;
    name: string;
    startAt: number;
    endAt: number;
    active: boolean;
}

/** Current active season. Set via SeasonManager.startNewSeason(). */
let activeSeason: SeasonDefinition | null = null;

export function getActiveSeasonConfig(): SeasonDefinition | null {
    return activeSeason;
}

export function setActiveSeasonConfig(season: SeasonDefinition | null): void {
    activeSeason = season;
}

/** Default first season for initial setup. */
export const DEFAULT_SEASON: SeasonDefinition = {
    seasonId: "s1",
    name: "Season 1",
    startAt: 0,
    endAt: 9999999999999,
    active: true
};
