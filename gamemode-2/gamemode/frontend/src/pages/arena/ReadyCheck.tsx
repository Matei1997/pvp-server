import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { createComponent } from "src/hoc/registerComponent";
import { matchStore } from "store/Match.store";
import style from "./arena.module.scss";

const ReadyCheck: React.FC = observer(() => {
    const { mapName, timeLeft, visible } = matchStore;

    const handleAccept = React.useCallback(() => {
        EventManager.emitServer("match", "acceptReady");
    }, []);

    const handleDecline = React.useCallback(() => {
        EventManager.emitServer("match", "declineReady");
    }, []);

    if (!visible) return null;

    return (
        <div className={style.arena}>
            <div className={style.header}>
                MATCH FOUND — ACCEPT?
                <span className={style.desc}>
                    {mapName ? `${mapName} — ` : ""}
                    {timeLeft > 0 ? `${timeLeft}s to respond` : "Respond now"}
                </span>
            </div>

            <div className={style.readyCheckActions}>
                <button className={`${style.readyCheckBtn} ${style.acceptBtn}`} onClick={handleAccept}>
                    ACCEPT
                </button>
                <button className={`${style.readyCheckBtn} ${style.declineBtn}`} onClick={handleDecline}>
                    DECLINE
                </button>
            </div>

            {timeLeft > 0 && <div className={style.timer}>{timeLeft}</div>}
        </div>
    );
});

export default createComponent({
    props: {},
    component: ReadyCheck,
    pageName: "arena_readycheck"
});
