import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { getPrestigeStatus, prestigePlayer } from "@modules/stats/PrestigeManager";

RAGERP.cef.register("progression", "getPrestigeStatus", async (player: PlayerMp) => {
    const characterId = player.character?.id;
    if (characterId == null) {
        (RAGERP.cef.emit as Function)(player, "progression", "setPrestigeStatus", { status: null });
        return;
    }
    try {
        const status = await getPrestigeStatus(characterId);
        (RAGERP.cef.emit as Function)(player, "progression", "setPrestigeStatus", { status });
    } catch (err) {
        console.error("[Progression] getPrestigeStatus failed:", err);
        (RAGERP.cef.emit as Function)(player, "progression", "setPrestigeStatus", { status: null });
    }
});

RAGERP.cef.register("progression", "prestige", async (player: PlayerMp) => {
    const characterId = player.character?.id;
    if (characterId == null) {
        (RAGERP.cef.emit as Function)(player, "progression", "prestigeResult", { success: false, error: "No character loaded." });
        return;
    }
    try {
        const result = await prestigePlayer(characterId);
        (RAGERP.cef.emit as Function)(player, "progression", "prestigeResult", result);
    } catch (err) {
        console.error("[Progression] prestige failed:", err);
        (RAGERP.cef.emit as Function)(player, "progression", "prestigeResult", { success: false, error: "Prestige failed." });
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Prestige failed.");
    }
});
