/**
 * Re-export from Hopouts mode. Kept for backward compatibility.
 * Implementation: source/server/modes/hopouts/Arena.module.ts
 */
export {
    joinQueue,
    joinQueueWithParty,
    leaveQueue,
    removePartyFromQueue,
    onPlayerDisconnectFromQueue,
    vote,
    getLobbyState,
    startSoloMatch,
    acceptReadyCheck,
    declineReadyCheck
} from "../modes/hopouts/Arena.module";
export type { ArenaLobbyState } from "../modes/hopouts/Arena.module";
