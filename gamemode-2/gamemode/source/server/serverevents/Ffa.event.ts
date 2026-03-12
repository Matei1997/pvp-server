import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { joinFfaQueue, leaveFfaQueue } from "@modes/ffa/Ffa.module";
import { leaveFfaMatch, isPlayerInFfaMatch } from "@modes/ffa/FfaMatch.manager";

RAGERP.cef.register("ffa", "joinQueue", async (player: PlayerMp) => {
    const ok = joinFfaQueue(player);
    if (!ok) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Could not join FFA queue.");
    }
});

RAGERP.cef.register("ffa", "leaveQueue", async (player: PlayerMp) => {
    leaveFfaQueue(player);
});

RAGERP.cef.register("ffa", "leaveMatch", async (player: PlayerMp) => {
    if (leaveFfaMatch(player)) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Left FFA match.");
    }
});
