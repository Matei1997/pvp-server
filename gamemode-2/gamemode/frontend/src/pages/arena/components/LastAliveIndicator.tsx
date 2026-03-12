import * as React from "react";
import { observer } from "mobx-react-lite";
import style from "./LastAliveIndicator.module.scss";

interface LastAliveIndicatorProps {
    team: "red" | "blue";
    enemiesRemaining: number;
}

export const LastAliveIndicator: React.FC<LastAliveIndicatorProps> = observer(({ team, enemiesRemaining }) => (
    <div className={style.lastAlive}>
        <div className={style.primaryLabel}>LAST ALIVE</div>
        <div className={`${style.vsLabel} ${style[team]}`}>1v{enemiesRemaining}</div>
    </div>
));
