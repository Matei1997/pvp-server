import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { partyStore } from "store/Party.store";
import { playerStore } from "store/Player.store";
import style from "../mainmenu.module.scss";

const GAME_MODES = [
    { id: "hopouts", label: "HOP OUTS" },
    { id: "ffa", label: "FREE FOR ALL" },
    { id: "gungame", label: "GUN GAME" },
    { id: "freeroam", label: "FREEROAM" }
] as const;

const HOP_OUT_SIZES = [2, 3, 4, 5] as const;

interface QueueCardProps {
    gameMode: (typeof GAME_MODES)[number]["id"];
    setGameMode: (m: (typeof GAME_MODES)[number]["id"]) => void;
    queueSize: (typeof HOP_OUT_SIZES)[number];
    setQueueSize: (s: (typeof HOP_OUT_SIZES)[number]) => void;
    loading: string | null;
    onQueue: () => void;
    onFreeroam: () => void;
}

export const QueueCard: React.FC<QueueCardProps> = observer(({ gameMode, setGameMode, queueSize, setQueueSize, loading, onQueue, onFreeroam }) => {
    const modeLabel = GAME_MODES.find((m) => m.id === gameMode)?.label ?? "HOP OUTS";
    const isLoading = loading !== null;

    return (
        <>
            <div className={style.modeTabs}>
                {GAME_MODES.map((mode) => (
                    <button key={mode.id} className={`${style.modeTab} ${gameMode === mode.id ? style.modeTabActive : ""}`} onClick={() => setGameMode(mode.id)}>
                        {mode.label}
                    </button>
                ))}
            </div>

            <section className={style.queueCard}>
                <div className={style.queueMode}>
                    <span className={style.queueModeLabel}>{modeLabel}</span>
                    <span className={style.queueModeArrows}>‹ ›</span>
                </div>
                {gameMode === "freeroam" ? (
                    <>
                        <div className={style.freeroamCard}>
                            <p className={style.freeroamDesc}>Sandbox mode. Spawn cars, weapons, teleport, change dimensions.</p>
                            <ul className={style.freeroamFeatures}>
                                <li>Spawn vehicles</li>
                                <li>Spawn weapons</li>
                                <li>Teleport to locations</li>
                                <li>Change dimensions</li>
                            </ul>
                        </div>
                        <button className={style.queueBtn} onClick={onFreeroam} disabled={isLoading}>
                            {loading === "freeroam" ? "ENTERING..." : "ENTER FREEROAM"}
                        </button>
                    </>
                ) : (
                    <>
                        {gameMode === "hopouts" && (
                            <div className={style.sizeRow}>
                                {HOP_OUT_SIZES.map((size) => (
                                    <button key={size} className={`${style.sizeChip} ${queueSize === size ? style.sizeChipActive : ""}`} onClick={() => setQueueSize(size)}>
                                        {size}v{size}
                                    </button>
                                ))}
                            </div>
                        )}
                        <button className={style.queueBtn} onClick={onQueue} disabled={isLoading}>
                            {loading === "arena" ? "JOINING..." : "QUEUE"}
                        </button>
                    </>
                )}
            </section>
        </>
    );
});
