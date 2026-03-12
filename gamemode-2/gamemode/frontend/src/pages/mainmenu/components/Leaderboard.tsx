import * as React from "react";
import EventManager from "utils/EventManager.util";
import style from "../mainmenu.module.scss";

export interface LeaderboardEntry {
    playerId: number;
    playerName: string;
    mmr: number;
    rankTier: string;
    wins: number;
    losses: number;
    kills: number;
    deaths: number;
}

function formatKd(kills: number, deaths: number): string {
    if (deaths === 0) return kills > 0 ? `${kills}.0` : "0.0";
    return (kills / deaths).toFixed(1);
}

interface LeaderboardProps {
    onSelectPlayer?: (entry: LeaderboardEntry) => void;
    onViewMyProfile?: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onSelectPlayer, onViewMyProfile }) => {
    const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [seasonName, setSeasonName] = React.useState<string | null>(null);
    const [useSeasonal, setUseSeasonal] = React.useState(false);

    React.useEffect(() => {
        setLoading(true);
        EventManager.emitServer("leaderboard", "getTopPlayers");
    }, []);

    React.useEffect(() => {
        const handler = (data: { entries: LeaderboardEntry[]; seasonName?: string | null; useSeasonal?: boolean }) => {
            setEntries(Array.isArray(data?.entries) ? data.entries : []);
            setSeasonName(data?.seasonName ?? null);
            setUseSeasonal(data?.useSeasonal ?? false);
            setLoading(false);
        };
        EventManager.addHandler("leaderboard", "setTopPlayers", handler);
        return () => EventManager.removeTargetHandlers("leaderboard");
    }, []);

    return (
        <div className={style.leaderboardContent}>
            <div className={style.leaderboardHeaderRow}>
                <div>
                    <div className={style.leaderboardTitle}>LEADERBOARD</div>
                    <div className={style.leaderboardSubtitle}>
                        {useSeasonal && seasonName ? `${seasonName} • ` : ""}Top 100 ranked players by MMR
                    </div>
                </div>
                {onViewMyProfile && (
                    <button type="button" className={style.leaderboardMyProfileBtn} onClick={onViewMyProfile}>
                        My Profile
                    </button>
                )}
            </div>

            {loading ? (
                <div className={style.leaderboardLoading}>Loading...</div>
            ) : (
                <div className={style.leaderboardTable}>
                    <div className={style.leaderboardHeader}>
                        <span className={style.colRank}>#</span>
                        <span className={style.colPlayer}>Player</span>
                        <span className={style.colTier}>Tier</span>
                        <span className={style.colMmr}>MMR</span>
                        <span className={style.colWins}>W</span>
                        <span className={style.colLosses}>L</span>
                        <span className={style.colKd}>K/D</span>
                    </div>
                    {entries.map((e, i) => (
                        <div
                            key={e.playerId}
                            className={style.leaderboardRow}
                            role={onSelectPlayer ? "button" : undefined}
                            tabIndex={onSelectPlayer ? 0 : undefined}
                            onClick={() => onSelectPlayer?.(e)}
                            onKeyDown={(ev) => {
                                if (onSelectPlayer && (ev.key === "Enter" || ev.key === " ")) {
                                    ev.preventDefault();
                                    onSelectPlayer(e);
                                }
                            }}
                        >
                            <span className={style.colRank}>{i + 1}</span>
                            <span className={style.colPlayer}>{e.playerName}</span>
                            <span className={style.colTier}>{e.rankTier}</span>
                            <span className={style.colMmr}>{e.mmr}</span>
                            <span className={style.colWins}>{e.wins}</span>
                            <span className={style.colLosses}>{e.losses}</span>
                            <span className={style.colKd}>{formatKd(e.kills, e.deaths)}</span>
                        </div>
                    ))}
                    {entries.length === 0 && (
                        <div className={style.leaderboardEmpty}>No ranked players yet. Play matches to climb!</div>
                    )}
                </div>
            )}
        </div>
    );
};
