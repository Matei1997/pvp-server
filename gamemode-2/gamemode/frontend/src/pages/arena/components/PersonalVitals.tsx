import * as React from "react";
import { observer } from "mobx-react-lite";
import style from "./PersonalVitals.module.scss";

interface PersonalVitalsProps {
    health: number;
    armor: number;
}

export const PersonalVitals: React.FC<PersonalVitalsProps> = observer(({ health, armor }) => {
    const healthNorm = Math.max(0, Math.min(100, health)) / 100;
    const armorNorm = Math.max(0, Math.min(100, armor)) / 100;

    return (
        <div className={style.personalVitals}>
            <div className={style.vitalRow}>
                <span className={style.vitalLabel}>HP</span>
                <div className={style.vitalTrack}>
                    <div className={style.vitalFillHealth} style={{ width: `${healthNorm * 100}%` }} />
                </div>
                <span className={style.vitalValue}>{Math.round(healthNorm * 100)}</span>
            </div>
            <div className={style.vitalRow}>
                <span className={style.vitalLabel}>AP</span>
                <div className={style.vitalTrack}>
                    <div className={style.vitalFillArmour} style={{ width: `${armorNorm * 100}%` }} />
                </div>
                <span className={style.vitalValue}>{Math.round(armorNorm * 100)}</span>
            </div>
        </div>
    );
});
