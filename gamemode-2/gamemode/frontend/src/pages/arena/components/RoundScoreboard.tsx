import * as React from "react";
import { observer } from "mobx-react-lite";
import { playerStore } from "store/Player.store";
import type { ArenaMatchData, ArenaMatchPlayer, ArenaRoundEnd } from "store/Arena.store";
import style from "../arenaHud.module.scss";

interface RoundScoreboardProps {
    match: ArenaMatchData;
    roundEnd: ArenaRoundEnd;
    visible: boolean;
}

function formatHeadshotPct(player: ArenaMatchPlayer): string {
    const dmg = player.damage ?? 0;
    const hs = player.headshots ?? 0;
    const hits = player.hits ?? 0;
    if (hits <= 0) return "—";
    return `${Math.round((hs / hits) * 100)}%`;
}

export const RoundScoreboard: React.FC<RoundScoreboardProps> = observer(({ match, roundEnd, visible }) => {
    if (!visible) return null;
    const myId = playerStore.data.id;

    return (
        <div className={style.roundScoreboardOverlay}>
            <div className={style.roundScoreboardPanel}>
                <div className={style.roundScoreboardTitle}>Round {roundEnd.round} Complete</div>
                <div className={style.roundScoreboardScores}>
                    <div className={style.rsbScoreRed}>
                        <span className={style.rsbBigScore}>{roundEnd.redScore}</span>
                    </div>
                    <span className={style.rsbScoreDivider}>—</span>
                    <div className={style.rsbScoreBlue}>
                        <span className={style.rsbBigScore}>{roundEnd.blueScore}</span>
                    </div>
                </div>
                <div className={style.rsbRoundBadge}>
                    First to {match.roundsToWin} wins
                </div>
                <div className={style.roundScoreboardTeams}>
                    <div className={style.rsbTeamCol}>
                        <div className={style.rsbTeamHeader}>Red Team</div>
                        <div className={style.rsbPlayerList}>
                            {match.redTeam.map((p) => (
                                <div
                                    key={p.id}
                                    className={`${style.rsbRow} ${p.id === myId ? style.rsbRowSelf : ""}`}
                                >
                                    <span className={style.rsbPlayerName}>{p.name}</span>
                                    <div className={style.rsbStats}>
                                        <span className={style.rsbKd}>{p.kills} / {p.deaths}</span>
                                        <span className={style.rsbDmg}>{p.damage != null ? p.damage : "—"}</span>
                                        <span className={style.rsbHs}>{formatHeadshotPct(p)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={style.rsbTeamCol}>
                        <div className={style.rsbTeamHeader}>Blue Team</div>
                        <div className={style.rsbPlayerList}>
                            {match.blueTeam.map((p) => (
                                <div
                                    key={p.id}
                                    className={`${style.rsbRow} ${p.id === myId ? style.rsbRowSelf : ""}`}
                                >
                                    <span className={style.rsbPlayerName}>{p.name}</span>
                                    <div className={style.rsbStats}>
                                        <span className={style.rsbKd}>{p.kills} / {p.deaths}</span>
                                        <span className={style.rsbDmg}>{p.damage != null ? p.damage : "—"}</span>
                                        <span className={style.rsbHs}>{formatHeadshotPct(p)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
