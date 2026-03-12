/**
 * Re-export from Hopouts mode. Kept for backward compatibility.
 * Implementation: source/server/modes/hopouts/ArenaMatch.manager.ts
 */
export {
    getMatchByDimension,
    getMatchByPlayer,
    isPlayerInArenaMatch,
    getTeam,
    isAliveInMatch,
    getSpectatableTeammates,
    startMatch,
    handleArenaDeath,
    handleZoneDeath,
    handleMatchDisconnect,
    leaveMatch,
    restoreReconnectingPlayer,
    endMatch,
    tickMatches
} from "../modes/hopouts/ArenaMatch.manager";
export type { ArenaMatchData } from "../modes/hopouts/ArenaMatch.manager";
