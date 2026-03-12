import { RAGERP } from "@api";
import { getPlayerProfileByCharacterId } from "@modules/stats/ProfileManager";
import { getRecentMatchesByCharacterId } from "@modules/stats/MatchHistoryManager";

RAGERP.cef.register("profile", "getMyProfile", async (player: PlayerMp) => {
    const characterId = player.character?.id;
    if (characterId == null) {
        (RAGERP.cef.emit as Function)(player, "profile", "setPlayerProfile", { profile: null });
        return;
    }
    try {
        const profile = await getPlayerProfileByCharacterId(characterId);
        (RAGERP.cef.emit as Function)(player, "profile", "setPlayerProfile", { profile });
    } catch (err) {
        console.error("[Profile] getMyProfile failed:", err);
        (RAGERP.cef.emit as Function)(player, "profile", "setPlayerProfile", { profile: null });
    }
});

RAGERP.cef.register("profile", "getPlayerProfile", async (player: PlayerMp, data?: string) => {
    let characterId: number | undefined;
    try {
        const parsed = data ? (typeof data === "string" ? JSON.parse(data) : data) : null;
        if (parsed && typeof parsed === "object" && typeof parsed.characterId === "number") {
            characterId = parsed.characterId;
        }
    } catch {
        /* invalid */
    }

    if (characterId == null) {
        (RAGERP.cef.emit as Function)(player, "profile", "setPlayerProfile", { profile: null });
        return;
    }

    try {
        const profile = await getPlayerProfileByCharacterId(characterId);
        (RAGERP.cef.emit as Function)(player, "profile", "setPlayerProfile", { profile });
    } catch (err) {
        console.error("[Profile] getPlayerProfile failed:", err);
        (RAGERP.cef.emit as Function)(player, "profile", "setPlayerProfile", { profile: null });
    }
});

RAGERP.cef.register("profile", "getRecentMatches", async (player: PlayerMp, data?: string) => {
    let characterId: number | undefined;
    try {
        const parsed = data ? (typeof data === "string" ? JSON.parse(data) : data) : null;
        if (parsed && typeof parsed === "object" && typeof parsed.characterId === "number") {
            characterId = parsed.characterId;
        }
    } catch {
        /* invalid */
    }

    if (characterId == null) {
        (RAGERP.cef.emit as Function)(player, "profile", "setRecentMatches", { matches: [] });
        return;
    }

    try {
        const matches = await getRecentMatchesByCharacterId(characterId, 10);
        (RAGERP.cef.emit as Function)(player, "profile", "setRecentMatches", { matches });
    } catch (err) {
        console.error("[Profile] getRecentMatches failed:", err);
        (RAGERP.cef.emit as Function)(player, "profile", "setRecentMatches", { matches: [] });
    }
});
