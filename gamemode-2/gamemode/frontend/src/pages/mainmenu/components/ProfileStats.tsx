import * as React from "react";
import EventManager from "utils/EventManager.util";
import Notification from "utils/NotifyManager.util";
import { rankingStore } from "store/Ranking.store";
import style from "../mainmenu.module.scss";

export interface PlayerProfile {
    playerId: number;
    playerName: string;
    mmr: number;
    rankTier: string;
    placementMatchesPlayed: number;
    seasonalPlacementMatchesPlayed?: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
    kills: number;
    deaths: number;
    kd: number;
    winRate: number;
    leaderboardRank?: number;
    xp: number;
    level: number;
    currentLevelProgress: number;
    xpForNextLevel: number;
    prestige?: number;
    maxLevel?: number;
    canPrestige?: boolean;
    seasonName?: string;
    seasonalMmr?: number;
    seasonalRankTier?: string;
    seasonalWins?: number;
    seasonalLosses?: number;
    seasonalKills?: number;
    seasonalDeaths?: number;
    seasonalXp?: number;
    seasonalLevel?: number;
}

export interface MatchHistoryEntry {
    id: number;
    result: "Win" | "Loss";
    team: "red" | "blue";
    kills: number;
    deaths: number;
    kd: number;
    mmrChange: number;
    xpGained: number;
    levelAfter: number;
    rankTierAfter: string;
    createdAt: string;
}

/** Use -1 for "my profile" (server uses current player's character) */
interface ProfileStatsProps {
    characterId: number;
    onBack: () => void;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ characterId, onBack }) => {
    const [profile, setProfile] = React.useState<PlayerProfile | null>(null);
    const [matches, setMatches] = React.useState<MatchHistoryEntry[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [prestigeConfirm, setPrestigeConfirm] = React.useState(false);
    const [prestiging, setPrestiging] = React.useState(false);
    const isMyProfile = characterId === -1;

    React.useEffect(() => {
        setLoading(true);
        setProfile(null);
        setMatches([]);
        if (isMyProfile) {
            EventManager.emitServer("profile", "getMyProfile");
        } else {
            EventManager.emitServer("profile", "getPlayerProfile", { characterId });
        }
    }, [characterId, isMyProfile]);

    React.useEffect(() => {
        const profileHandler = (data: { profile: PlayerProfile | null }) => {
            const p = data?.profile ?? null;
            setProfile(p);
            if (p?.canPrestige != null) rankingStore.setCanPrestige(p.canPrestige);
            setLoading(false);
        };
        const matchesHandler = (data: { matches: MatchHistoryEntry[] }) => {
            setMatches(data?.matches ?? []);
        };
        const prestigeResultHandler = (data: { success: boolean; newPrestige?: number; error?: string }) => {
            setPrestiging(false);
            setPrestigeConfirm(false);
            if (data.success) {
                Notification.success(`Prestige complete: Prestige ${data.newPrestige ?? "?"}`);
                if (isMyProfile) {
                    EventManager.emitServer("profile", "getMyProfile");
                }
            } else {
                Notification.error(data.error ?? "Prestige failed.");
            }
        };
        EventManager.addHandler("profile", "setPlayerProfile", profileHandler);
        EventManager.addHandler("profile", "setRecentMatches", matchesHandler);
        EventManager.addHandler("progression", "prestigeResult", prestigeResultHandler);
        return () => {
            EventManager.removeTargetHandlers("profile");
            EventManager.removeTargetHandlers("progression");
        };
    }, [isMyProfile]);

    React.useEffect(() => {
        if (profile?.playerId != null) {
            EventManager.emitServer("profile", "getRecentMatches", { characterId: profile.playerId });
        }
    }, [profile?.playerId]);

    if (loading) {
        return (
            <div className={style.profileContent}>
                <button type="button" className={style.profileBackBtn} onClick={onBack}>
                    ← Back to Leaderboard
                </button>
                <div className={style.profileLoading}>Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={style.profileContent}>
                <button type="button" className={style.profileBackBtn} onClick={onBack}>
                    ← Back to Leaderboard
                </button>
                <div className={style.profileEmpty}>Profile not found.</div>
            </div>
        );
    }

    const wins = profile.seasonalWins ?? profile.wins;
    const losses = profile.seasonalLosses ?? profile.losses;
    const kills = profile.seasonalKills ?? profile.kills;
    const deaths = profile.seasonalDeaths ?? profile.deaths;
    const matchesPlayed = profile.seasonName ? (wins + losses) : profile.matchesPlayed;
    const placementPlayed = profile.seasonalPlacementMatchesPlayed ?? profile.placementMatchesPlayed;
    const isPlacements = placementPlayed < 5 && (profile.seasonalRankTier ?? profile.rankTier) === "Unranked";
    const winRatePct = (matchesPlayed > 0 ? wins / matchesPlayed : 0) * 100;
    const kdStr = deaths > 0 ? (kills / deaths).toFixed(1) : kills > 0 ? `${kills}.0` : "0.0";

    return (
        <div className={style.profileContent}>
            <button type="button" className={style.profileBackBtn} onClick={onBack}>
                ← Back to Leaderboard
            </button>

            <div className={style.profileHeader}>
                <div className={style.profileName}>{profile.playerName}</div>
                {profile.seasonName && (
                    <div className={style.profileSeasonLabel}>{profile.seasonName}</div>
                )}
                {profile.seasonName ? (
                    <>
                        <div className={style.profileTier}>Seasonal Rank: {profile.seasonalRankTier ?? profile.rankTier}</div>
                        <div className={style.profileMmr}>Seasonal MMR: {profile.seasonalMmr ?? profile.mmr}</div>
                        <div className={style.profileLevel}>
                            Seasonal Level {profile.seasonalLevel ?? profile.level} —{" "}
                            {profile.seasonalXp ?? profile.currentLevelProgress} / {profile.xpForNextLevel} XP
                        </div>
                    </>
                ) : (
                    <>
                        <div className={style.profileTier}>{profile.rankTier}</div>
                        <div className={style.profileMmr}>MMR {profile.mmr}</div>
                        <div className={style.profileLevel}>
                            Level {profile.level} — {profile.currentLevelProgress} / {profile.xpForNextLevel} XP
                        </div>
                    </>
                )}
                <div className={style.profileLifetime}>
                    Prestige {profile.prestige ?? 0} · Lifetime Level {profile.level}
                    {profile.maxLevel != null && ` (max ${profile.maxLevel})`}
                </div>
                {isMyProfile && profile.canPrestige && !prestigeConfirm && (
                    <button
                        type="button"
                        className={style.profilePrestigeBtn}
                        onClick={() => setPrestigeConfirm(true)}
                        disabled={prestiging}
                    >
                        Prestige
                    </button>
                )}
                {isMyProfile && profile.canPrestige && prestigeConfirm && (
                    <div className={style.profilePrestigeConfirm}>
                        <span>Reset to Level 1 and gain Prestige {(profile.prestige ?? 0) + 1}?</span>
                        <div className={style.profilePrestigeConfirmBtns}>
                            <button type="button" onClick={() => setPrestigeConfirm(false)}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={style.profilePrestigeConfirmYes}
                                onClick={() => {
                                    setPrestiging(true);
                                    EventManager.emitServer("progression", "prestige");
                                }}
                                disabled={prestiging}
                            >
                                {prestiging ? "Prestiging..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                )}
                {isPlacements && (
                    <div className={style.profilePlacements}>
                        Placement: {placementPlayed} / 5 matches
                    </div>
                )}
            </div>

            <div className={style.profileStatsGrid}>
                <div className={style.profileStat}>
                    <span className={style.profileStatLabel}>Matches Played</span>
                    <span className={style.profileStatValue}>{matchesPlayed}</span>
                </div>
                <div className={style.profileStat}>
                    <span className={style.profileStatLabel}>Wins</span>
                    <span className={style.profileStatValue}>{wins}</span>
                </div>
                <div className={style.profileStat}>
                    <span className={style.profileStatLabel}>Losses</span>
                    <span className={style.profileStatValue}>{losses}</span>
                </div>
                <div className={style.profileStat}>
                    <span className={style.profileStatLabel}>Win Rate</span>
                    <span className={style.profileStatValue}>{winRatePct.toFixed(1)}%</span>
                </div>
                <div className={style.profileStat}>
                    <span className={style.profileStatLabel}>Kills</span>
                    <span className={style.profileStatValue}>{kills}</span>
                </div>
                <div className={style.profileStat}>
                    <span className={style.profileStatLabel}>Deaths</span>
                    <span className={style.profileStatValue}>{deaths}</span>
                </div>
                <div className={style.profileStat}>
                    <span className={style.profileStatLabel}>K/D</span>
                    <span className={style.profileStatValue}>{kdStr}</span>
                </div>
            </div>

            {profile.leaderboardRank != null && (
                <div className={style.profileRankRow}>
                    Leaderboard Rank: #{profile.leaderboardRank}
                </div>
            )}

            <div className={style.profileRecentMatches}>
                <h3 className={style.profileRecentMatchesTitle}>Recent Matches</h3>
                {matches.length === 0 ? (
                    <div className={style.profileRecentMatchesEmpty}>No recent matches yet</div>
                ) : (
                    <div className={style.profileRecentMatchesList}>
                        {matches.map((m) => (
                            <div key={m.id} className={style.profileRecentMatchRow}>
                                <span className={m.result === "Win" ? style.profileMatchWin : style.profileMatchLoss}>
                                    {m.result}
                                </span>
                                <span className={style.profileMatchDate}>
                                    {new Date(m.createdAt).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </span>
                                <span className={style.profileMatchKd}>
                                    {m.kills}/{m.deaths} ({m.kd.toFixed(1)} K/D)
                                </span>
                                <span className={style.profileMatchMmr}>
                                    {m.mmrChange >= 0 ? "+" : ""}
                                    {m.mmrChange} MMR
                                </span>
                                <span className={style.profileMatchXp}>+{m.xpGained} XP</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
