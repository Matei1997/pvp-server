import * as React from "react";
import { observer } from "mobx-react-lite";
import type { ArenaRoundStart, ArenaRoundEnd } from "store/Arena.store";
import style from "../arenaHud.module.scss";

interface RoundOverlayProps {
    roundStart: ArenaRoundStart | null;
    roundEnd: ArenaRoundEnd | null;
}

export const RoundOverlay: React.FC<RoundOverlayProps> = observer(({ roundStart, roundEnd }) => {
    if (roundStart) {
        return (
            <div className={style.roundOverlay}>
                <div className={style.roundTitle}>ROUND {roundStart.round}</div>
                <div className={style.roundWeapon}>{roundStart.weaponName}</div>
                <div className={style.roundScore}>
                    {roundStart.redScore} — {roundStart.blueScore}
                </div>
            </div>
        );
    }
    if (roundEnd) {
        return null;
    }
    return null;
});

