import { RAGERP } from "@api";
import { getTopPlayers } from "@modules/stats/LeaderboardManager";

RAGERP.cef.register("leaderboard", "getTopPlayers", async (player: PlayerMp) => {
    try {
        const result = await getTopPlayers(100);
        (RAGERP.cef.emit as Function)(player, "leaderboard", "setTopPlayers", {
            entries: result.entries,
            seasonName: result.seasonName ?? null,
            useSeasonal: result.useSeasonal ?? false
        });
    } catch (err) {
        console.error("[Leaderboard] getTopPlayers failed:", err);
        (RAGERP.cef.emit as Function)(player, "leaderboard", "setTopPlayers", { entries: [], seasonName: null, useSeasonal: false });
    }
});
