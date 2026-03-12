import * as React from "react";
import EventManager from "utils/EventManager.util";
import Notification from "utils/NotifyManager.util";
import { rankingStore } from "store/Ranking.store";
import style from "../mainmenu.module.scss";

export interface ChallengeProgress {
    id: number;
    challengeKey: string;
    label: string;
    challengeType: "daily" | "weekly";
    progress: number;
    target: number;
    completed: boolean;
    claimed: boolean;
    rewardXp: number;
    resetAt: number;
}

export const Challenges: React.FC = () => {
    const [challenges, setChallenges] = React.useState<ChallengeProgress[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchChallenges = React.useCallback(() => {
        setLoading(true);
        EventManager.emitServer("challenges", "getMyChallenges");
    }, []);

    React.useEffect(() => {
        fetchChallenges();
    }, [fetchChallenges]);

    React.useEffect(() => {
        const handler = (data: { challenges: ChallengeProgress[] }) => {
            const list = Array.isArray(data?.challenges) ? data.challenges : [];
            setChallenges(list);
            rankingStore.setChallengesData(list);
            setLoading(false);
        };
        const claimResultHandler = (data: { ok: boolean; challengeKey: string | null; xpAwarded?: number }) => {
            if (data.ok && data.xpAwarded != null) {
                Notification.success(`Challenge claimed: +${data.xpAwarded} XP`);
            } else if (!data.ok) {
                Notification.error("Failed to claim challenge.");
            }
        };
        EventManager.addHandler("challenges", "setMyChallenges", handler);
        EventManager.addHandler("challenges", "claimRewardResult", claimResultHandler);
        return () => EventManager.removeTargetHandlers("challenges");
    }, []);

    const handleClaim = React.useCallback((challengeKey: string) => {
        EventManager.emitServer("challenges", "claimReward", { challengeKey });
    }, []);

    const daily = challenges.filter((c) => c.challengeType === "daily");
    const weekly = challenges.filter((c) => c.challengeType === "weekly");

    function formatResetTime(resetAt: number): string {
        const now = Date.now();
        const diff = Math.max(0, resetAt - now);
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const d = Math.floor(h / 24);
        if (d >= 1) return `${d}d ${h % 24}h`;
        if (h >= 1) return `${h}h ${m}m`;
        return `${m}m`;
    }

    return (
        <div className={style.challengesContent}>
            <div className={style.challengesHeader}>
                <div className={style.challengesTitle}>CHALLENGES</div>
                <div className={style.challengesSubtitle}>Complete challenges to earn XP</div>
                <button type="button" className={style.challengesRefreshBtn} onClick={fetchChallenges}>
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className={style.challengesLoading}>Loading...</div>
            ) : (
                <>
                    <div className={style.challengesSection}>
                        <div className={style.challengesSectionTitle}>
                            Daily
                            {daily.length > 0 && daily[0].resetAt > 0 && (
                                <span className={style.challengesResetLabel}>
                                    Resets in {formatResetTime(daily[0].resetAt)}
                                </span>
                            )}
                        </div>
                        {daily.length === 0 ? (
                            <div className={style.challengesEmpty}>No daily challenges. Check back later.</div>
                        ) : (
                            daily.map((c) => (
                                <div key={c.id} className={style.challengeRow}>
                                    <div className={style.challengeInfo}>
                                        <span className={style.challengeLabel}>{c.label}</span>
                                        <span className={style.challengeProgress}>
                                            {c.progress} / {c.target}
                                        </span>
                                    </div>
                                    <span className={style.challengeReward}>{c.rewardXp} XP</span>
                                    {c.completed && !c.claimed && (
                                        <button
                                            type="button"
                                            className={style.challengeClaimBtn}
                                            onClick={() => handleClaim(c.challengeKey)}
                                        >
                                            Claim
                                        </button>
                                    )}
                                    {c.claimed && <span className={style.challengeClaimed}>Claimed</span>}
                                </div>
                            ))
                        )}
                    </div>
                    <div className={style.challengesSection}>
                        <div className={style.challengesSectionTitle}>Weekly</div>
                        {weekly.length === 0 ? (
                            <div className={style.challengesEmpty}>No weekly challenges. Check back later.</div>
                        ) : (
                            weekly.map((c) => (
                                <div key={c.id} className={style.challengeRow}>
                                    <div className={style.challengeInfo}>
                                        <span className={style.challengeLabel}>{c.label}</span>
                                        <span className={style.challengeProgress}>
                                            {c.progress} / {c.target}
                                        </span>
                                    </div>
                                    <span className={style.challengeReward}>{c.rewardXp} XP</span>
                                    {c.completed && !c.claimed && (
                                        <button
                                            type="button"
                                            className={style.challengeClaimBtn}
                                            onClick={() => handleClaim(c.challengeKey)}
                                        >
                                            Claim
                                        </button>
                                    )}
                                    {c.claimed && <span className={style.challengeClaimed}>Claimed</span>}
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
