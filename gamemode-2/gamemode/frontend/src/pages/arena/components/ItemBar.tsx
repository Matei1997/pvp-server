import * as React from "react";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import style from "../arenaHud.module.scss";

const PROGRESS_SEGMENTS = 16;

interface ItemBarProps {
    medkits: number;
    plates: number;
    itemCast: { item: "medkit" | "plate"; castTime: number; startedAt: number } | null;
}

export const ItemBar: React.FC<ItemBarProps> = observer(({ medkits, plates, itemCast }) => {
    const [castProgress, setCastProgress] = useState(0);

    useEffect(() => {
        if (!itemCast) {
            setCastProgress(0);
            return;
        }
        const start = itemCast.startedAt;
        const duration = itemCast.castTime;
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            if (elapsed >= duration) {
                setCastProgress(1);
                clearInterval(interval);
                return;
            }
            setCastProgress(elapsed / duration);
        }, 50);
        return () => clearInterval(interval);
    }, [itemCast?.startedAt, itemCast?.castTime]);

    return (
        <>
            <div className={style.itemBar}>
                <div className={`${style.itemBtn} ${medkits <= 0 ? style.itemDisabled : ""}`}>
                    <span className={style.itemKey}>5</span>
                    <span className={style.itemIcon}>+</span>
                    <span className={style.itemCount}>{medkits}</span>
                </div>
                <div className={`${style.itemBtn} ${plates <= 0 ? style.itemDisabled : ""}`}>
                    <span className={style.itemKey}>6</span>
                    <span className={style.itemIcon}>⛨</span>
                    <span className={style.itemCount}>{plates}</span>
                </div>
            </div>

            {itemCast && (
                <div className={style.progressWrapper}>
                    <div className={style.progressBox}>
                        <div className={style.progressRow}>
                            <span className={style.progressTitle}>
                                {itemCast.item === "medkit" ? "Healing..." : "Applying plate..."}
                            </span>
                        </div>
                        <div className={style.progressDots}>
                            {Array.from({ length: PROGRESS_SEGMENTS }, (_, i) => (
                                <div
                                    key={i}
                                    className={`${style.progressDot} ${i < Math.floor(castProgress * PROGRESS_SEGMENTS) ? style.active : ""}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});
