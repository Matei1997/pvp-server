import * as React from "react";
import { observer } from "mobx-react-lite";
import type { ArenaKillFeedEntry } from "store/Arena.store";
import { getWeaponIconUrl } from "utils/weaponIconMap";
import style from "../arenaHud.module.scss";

interface KillFeedProps {
    entries: ArenaKillFeedEntry[];
}

export const KillFeed: React.FC<KillFeedProps> = observer(({ entries }) => (
    <div className={style.killFeed}>
        {entries.map((e, i) => (
            <div key={`${e.killerId}-${e.victimId}-${i}`} className={style.killEntry}>
                <span className={style.killer}>{e.killerName}</span>
                <img src={getWeaponIconUrl(e.weaponName)} className={style.weaponIcon} alt="" />
                {e.headshot && <span className={style.headshotMarker} title="Headshot">HS</span>}
                <span className={style.victim}>{e.victimName}</span>
            </div>
        ))}
    </div>
));
