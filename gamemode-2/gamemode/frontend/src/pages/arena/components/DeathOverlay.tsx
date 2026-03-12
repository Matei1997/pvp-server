import * as React from "react";
import { observer } from "mobx-react-lite";
import style from "../arenaHud.module.scss";

interface DeathOverlayProps {
    visible: boolean;
    showRespawnMessage?: boolean;
}

export const DeathOverlay: React.FC<DeathOverlayProps> = observer(({ visible, showRespawnMessage }) => {
    if (!visible) return null;
    return (
        <div className={style.deathOverlay}>
            <div className={style.deathOverlayVignette} />
            <div className={style.deathOverlayContent}>
                <h1 className={style.deathOverlayTitle}>YOU'RE DEAD</h1>
                {showRespawnMessage && <p className={style.deathOverlaySubtitle}>You won't respawn until next round.</p>}
            </div>
        </div>
    );
});
