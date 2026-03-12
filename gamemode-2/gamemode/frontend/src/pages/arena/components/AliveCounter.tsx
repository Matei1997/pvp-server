import * as React from "react";
import { observer } from "mobx-react-lite";
import style from "./AliveCounter.module.scss";

interface AliveCounterProps {
    redAlive: number;
    blueAlive: number;
}

export const AliveCounter: React.FC<AliveCounterProps> = observer(({ redAlive, blueAlive }) => (
    <div className={style.aliveCounter}>
        <span className={style.redAlive}>
            RED <strong>{redAlive}</strong>
        </span>
        <span className={style.blueAlive}>
            BLUE <strong>{blueAlive}</strong>
        </span>
    </div>
));
