import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { getChallengesForCharacter, claimChallengeReward } from "@modules/stats/ChallengeManager";

RAGERP.cef.register("challenges", "getMyChallenges", async (player: PlayerMp) => {
    const characterId = player.character?.id;
    if (characterId == null) {
        (RAGERP.cef.emit as Function)(player, "challenges", "setMyChallenges", { challenges: [] });
        return;
    }
    try {
        const challenges = await getChallengesForCharacter(characterId);
        (RAGERP.cef.emit as Function)(player, "challenges", "setMyChallenges", { challenges });
    } catch (err) {
        console.error("[Challenges] getMyChallenges failed:", err);
        (RAGERP.cef.emit as Function)(player, "challenges", "setMyChallenges", { challenges: [] });
    }
});

RAGERP.cef.register("challenges", "claimReward", async (player: PlayerMp, data?: string) => {
    const characterId = player.character?.id;
    if (characterId == null) {
        (RAGERP.cef.emit as Function)(player, "challenges", "claimRewardResult", { ok: false, challengeKey: null });
        return;
    }
    let challengeKey: string | undefined;
    try {
        const parsed = data ? (typeof data === "string" ? JSON.parse(data) : data) : null;
        if (parsed && typeof parsed === "object" && typeof parsed.challengeKey === "string") {
            challengeKey = parsed.challengeKey;
        }
    } catch {
        /* invalid */
    }
    if (!challengeKey) {
        (RAGERP.cef.emit as Function)(player, "challenges", "claimRewardResult", { ok: false, challengeKey: null });
        return;
    }
    try {
        const result = await claimChallengeReward(characterId, challengeKey);
        (RAGERP.cef.emit as Function)(player, "challenges", "claimRewardResult", {
            ok: result.ok,
            challengeKey,
            xpAwarded: result.xpAwarded
        });
        if (result.ok) {
            const challenges = await getChallengesForCharacter(characterId);
            (RAGERP.cef.emit as Function)(player, "challenges", "setMyChallenges", { challenges });
        }
    } catch (err) {
        console.error("[Challenges] claimReward failed:", err);
        (RAGERP.cef.emit as Function)(player, "challenges", "claimRewardResult", { ok: false, challengeKey });
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Failed to claim challenge.");
    }
});
