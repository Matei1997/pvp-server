import * as React from "react";
import { observer } from "mobx-react-lite";
import type { ArenaMatchPlayer } from "store/Arena.store";
import style from "./TeamVitals.module.scss";

interface TeammateRowProps {
    player: ArenaMatchPlayer;
}

const TeammateRow: React.FC<TeammateRowProps> = ({ player }) => {
    const isDead = !player.alive;
    const healthNorm = Math.max(0, Math.min(100, player.health ?? 0)) / 100;
    const armorNorm = Math.max(0, Math.min(100, player.armor ?? 0)) / 100;

    return (
        <div className={`${style.teammateRow} ${isDead ? style.dead : ""}`}>
            <div className={style.rowHeader}>
                <span className={style.playerName}>{player.name}</span>
                {isDead && <span className={style.deadIcon}>✕</span>}
            </div>
            <div className={style.bars}>
                <div className={style.barRow}>
                    <span className={style.barLabel}>HP</span>
                    <div className={style.barTrack}>
                        <div
                            className={style.barFillHealth}
                            style={{ width: isDead ? "0%" : `${healthNorm * 100}%` }}
                        />
                    </div>
                </div>
                <div className={style.barRow}>
                    <span className={style.barLabel}>AP</span>
                    <div className={style.barTrack}>
                        <div
                            className={style.barFillArmour}
                            style={{ width: isDead ? "0%" : `${armorNorm * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TeamVitalsProps {
    teammates: ArenaMatchPlayer[];
}

export const TeamVitals: React.FC<TeamVitalsProps> = observer(({ teammates }) => {
    if (teammates.length === 0) return null;

    return (
        <div className={style.teamVitals}>
            <div className={style.panelTitle}>TEAM</div>
            <div className={style.teammateList}>
                {teammates.map((p) => (
                    <TeammateRow key={p.id} player={p} />
                ))}
            </div>
        </div>
    );
});
