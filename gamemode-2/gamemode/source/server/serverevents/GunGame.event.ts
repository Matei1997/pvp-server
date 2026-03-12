import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { joinGunGameQueue, leaveGunGameQueue } from "@modes/gungame/GunGame.module";
import { leaveGunGameMatch } from "@modes/gungame/GunGameMatch.manager";

RAGERP.cef.register("gungame", "joinQueue", async (player: PlayerMp) => {
    const ok = joinGunGameQueue(player);
    if (!ok) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Could not join Gun Game queue.");
    }
});

RAGERP.cef.register("gungame", "leaveQueue", async (player: PlayerMp) => {
    leaveGunGameQueue(player);
});

RAGERP.cef.register("gungame", "leaveMatch", async (player: PlayerMp) => {
    if (leaveGunGameMatch(player)) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Left Gun Game match.");
    }
});
