import * as React from "react";
import { observer } from "mobx-react-lite";
import type { ArenaZoneData } from "store/Arena.store";
import style from "../arenaHud.module.scss";

interface ZoneInfoProps {
    zone: ArenaZoneData;
}

export const ZoneInfo: React.FC<ZoneInfoProps> = observer(({ zone }) => (
    <div className={style.zoneInfo}>
        <span className={style.zonePhase}>PHASE {zone.phase}</span>
        <span className={style.zoneTimer}>{zone.phaseTimeLeft}s</span>
    </div>
));
