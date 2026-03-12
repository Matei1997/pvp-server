import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { getSeasonRewardsForCharacter, claimSeasonReward } from "@modules/seasons/SeasonRewardsManager";

RAGERP.cef.register("seasons", "getMyRewards", async (player: PlayerMp) => {
    const characterId = player.character?.id;
    if (characterId == null) {
        (RAGERP.cef.emit as Function)(player, "seasons", "setMyRewards", { rewards: [] });
        return;
    }
    try {
        const rewards = await getSeasonRewardsForCharacter(characterId);
        (RAGERP.cef.emit as Function)(player, "seasons", "setMyRewards", { rewards });
    } catch (err) {
        console.error("[Seasons] getMyRewards failed:", err);
        (RAGERP.cef.emit as Function)(player, "seasons", "setMyRewards", { rewards: [] });
    }
});

RAGERP.cef.register("seasons", "claimReward", async (player: PlayerMp, data?: string) => {
    const characterId = player.character?.id;
    if (characterId == null) {
        (RAGERP.cef.emit as Function)(player, "seasons", "claimRewardResult", { success: false, error: "No character loaded." });
        return;
    }
    let rewardId: number | undefined;
    try {
        const parsed = data ? (typeof data === "string" ? JSON.parse(data) : data) : null;
        if (parsed && typeof parsed === "object" && typeof parsed.rewardId === "number") {
            rewardId = parsed.rewardId;
        }
    } catch {
        /* invalid */
    }
    if (rewardId == null) {
        (RAGERP.cef.emit as Function)(player, "seasons", "claimRewardResult", { success: false, error: "Invalid reward ID." });
        return;
    }
    try {
        const result = await claimSeasonReward(characterId, rewardId);
        (RAGERP.cef.emit as Function)(player, "seasons", "claimRewardResult", result);
        if (result.success) {
            const rewards = await getSeasonRewardsForCharacter(characterId);
            (RAGERP.cef.emit as Function)(player, "seasons", "setMyRewards", { rewards });
        }
    } catch (err) {
        console.error("[Seasons] claimReward failed:", err);
        (RAGERP.cef.emit as Function)(player, "seasons", "claimRewardResult", { success: false, error: "Claim failed." });
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Failed to claim season reward.");
    }
});
