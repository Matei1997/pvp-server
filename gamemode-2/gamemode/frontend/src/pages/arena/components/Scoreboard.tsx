import * as React from "react";
import { observer } from "mobx-react-lite";
import { playerStore } from "store/Player.store";
import type { ArenaMatchData } from "store/Arena.store";
import style from "../arenaHud.module.scss";

interface ScoreboardProps {
    match: ArenaMatchData;
    visible: boolean;
    onClose: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = observer(({ match, visible, onClose }) => {
    if (!visible) return null;
    const myId = playerStore.data.id;

    return (
        <div className={style.scoreboardOverlay} onClick={onClose}>
            <div className={style.scoreboardPanel} onClick={(e) => e.stopPropagation()}>
                <div className={style.scoreboardTitle}>Match Score</div>
                <div className={style.scoreboardScores}>
                    <div className={style.sbScoreRed}>
                        <span className={style.sbBigScore}>{match.redScore}</span>
                    </div>
                    <span className={style.sbScoreDivider}>—</span>
                    <div className={style.sbScoreBlue}>
                        <span className={style.sbBigScore}>{match.blueScore}</span>
                    </div>
                </div>
                <div className={style.sbRoundBadge}>Round {match.currentRound}</div>
                <div className={style.scoreboardTeams}>
                    <div className={style.sbTeamCol}>
                        <div className={style.sbTeamHeader}>Red Team</div>
                        <div className={style.sbPlayerList}>
                            {match.redTeam.map((p) => (
                                <div
                                    key={p.id}
                                    className={`${style.sbRow} ${!p.alive ? style.sbRowDead : ""} ${p.id === myId ? style.sbRowSelf : ""}`}
                                >
                                    <span className={style.sbPlayerName}>{p.name}</span>
                                    <span className={style.sbKd}>
                                        {p.kills} / {p.deaths}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={style.sbTeamCol}>
                        <div className={style.sbTeamHeader}>Blue Team</div>
                        <div className={style.sbPlayerList}>
                            {match.blueTeam.map((p) => (
                                <div
                                    key={p.id}
                                    className={`${style.sbRow} ${!p.alive ? style.sbRowDead : ""} ${p.id === myId ? style.sbRowSelf : ""}`}
                                >
                                    <span className={style.sbPlayerName}>{p.name}</span>
                                    <span className={style.sbKd}>
                                        {p.kills} / {p.deaths}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
