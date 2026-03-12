import * as React from "react";
import EventManager from "utils/EventManager.util";
import Notification from "utils/NotifyManager.util";
import { rankingStore } from "store/Ranking.store";
import style from "../mainmenu.module.scss";

export interface SeasonRewardEntry {
    id: number;
    seasonId: string;
    seasonName?: string;
    finalRankTier: string;
    rewardXp: number;
    rewardTitle: string | null;
    claimed: boolean;
    claimedAt: Date | null;
}

export const SeasonRewards: React.FC = () => {
    const [rewards, setRewards] = React.useState<SeasonRewardEntry[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [claimingId, setClaimingId] = React.useState<number | null>(null);

    const fetchRewards = React.useCallback(() => {
        setLoading(true);
        EventManager.emitServer("seasons", "getMyRewards");
    }, []);

    React.useEffect(() => {
        fetchRewards();
    }, [fetchRewards]);

    React.useEffect(() => {
        const rewardsHandler = (data: { rewards: SeasonRewardEntry[] }) => {
            const list = Array.isArray(data?.rewards) ? data.rewards : [];
            setRewards(list);
            rankingStore.setRewardsData(list);
            setLoading(false);
            setClaimingId(null);
        };
        const claimHandler = (data: { success: boolean; error?: string; xpGained?: number }) => {
            if (data.success) {
                fetchRewards();
                if (data.xpGained != null && data.xpGained > 0) {
                    Notification.success(`Season reward claimed: +${data.xpGained} XP`);
                } else {
                    Notification.success("Season reward claimed.");
                }
            } else {
                Notification.error(data.error ?? "Failed to claim season reward.");
            }
            setClaimingId(null);
        };
        EventManager.addHandler("seasons", "setMyRewards", rewardsHandler);
        EventManager.addHandler("seasons", "claimRewardResult", claimHandler);
        return () => {
            EventManager.removeTargetHandlers("seasons");
        };
    }, [fetchRewards]);

    const handleClaim = React.useCallback((rewardId: number) => {
        setClaimingId(rewardId);
        EventManager.emitServer("seasons", "claimReward", { rewardId });
    }, []);

    return (
        <div className={style.seasonRewardsContent}>
            <div className={style.seasonRewardsHeader}>
                <div className={style.seasonRewardsTitle}>SEASON REWARDS</div>
                <div className={style.seasonRewardsSubtitle}>Claim your ranked rewards from past seasons</div>
                <button type="button" className={style.challengesRefreshBtn} onClick={fetchRewards}>
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className={style.challengesLoading}>Loading...</div>
            ) : rewards.length === 0 ? (
                <div className={style.challengesEmpty}>No season rewards yet. Complete a ranked season to earn rewards.</div>
            ) : (
                <div className={style.seasonRewardsList}>
                    {rewards.map((r) => (
                        <div key={r.id} className={style.seasonRewardRow}>
                            <div className={style.seasonRewardInfo}>
                                <span className={style.seasonRewardSeason}>{r.seasonName ?? r.seasonId}</span>
                                <span className={style.seasonRewardTier}>{r.finalRankTier}</span>
                            </div>
                            <div className={style.seasonRewardDetails}>
                                {r.rewardXp > 0 && <span className={style.seasonRewardXp}>{r.rewardXp} XP</span>}
                                {r.rewardTitle && <span className={style.seasonRewardTitle}>{r.rewardTitle}</span>}
                            </div>
                            {r.claimed ? (
                                <span className={style.challengeClaimed}>Claimed</span>
                            ) : (
                                <button
                                    type="button"
                                    className={style.challengeClaimBtn}
                                    onClick={() => handleClaim(r.id)}
                                    disabled={claimingId === r.id}
                                >
                                    {claimingId === r.id ? "Claiming..." : "Claim"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
