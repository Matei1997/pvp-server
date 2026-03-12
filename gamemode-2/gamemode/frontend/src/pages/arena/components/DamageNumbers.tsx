import * as React from "react";
import { observer } from "mobx-react-lite";
import type { ArenaDamageNumberEntry } from "store/Arena.store";
import style from "../arenaHud.module.scss";

interface DamageNumbersProps {
    entries: ArenaDamageNumberEntry[];
}

const STATUS_COLORS: Record<string, string> = {
    health: "#FFFFFF",
    armor: "#FFDC50",
    headshot: "#FF5E5E"
};

export const DamageNumbers: React.FC<DamageNumbersProps> = observer(({ entries }) => (
    <>
        {entries.map((e) => (
            <div
                key={e.id}
                className={style.damageNumber}
                style={{
                    left: `${e.screenX * 100}%`,
                    top: `${e.screenY * 100}%`,
                    color: STATUS_COLORS[e.status] ?? STATUS_COLORS.health
                }}
            >
                {e.damage}
            </div>
        ))}
    </>
));
