import * as React from "react";
import { observer } from "mobx-react-lite";
import style from "../arenaHud.module.scss";

const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

interface ScoreBarProps {
    redScore: number;
    blueScore: number;
    timeLeft: number;
}

export const ScoreBar: React.FC<ScoreBarProps> = observer(({ redScore, blueScore, timeLeft }) => (
    <div className={style.scores}>
        <div className={`${style.teamBadge} ${style.redTeam}`}>
            <span className={style.score}>{redScore}</span>
        </div>
        <div className={style.timer}>{formatTime(timeLeft)}</div>
        <div className={`${style.teamBadge} ${style.blueTeam}`}>
            <span className={style.score}>{blueScore}</span>
        </div>
    </div>
));
