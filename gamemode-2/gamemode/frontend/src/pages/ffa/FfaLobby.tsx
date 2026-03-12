import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { createComponent } from "src/hoc/registerComponent";
import { ffaStore } from "store/Ffa.store";
import style from "../arena/arena.module.scss";

const FfaLobbyInner: React.FC = observer(() => {
    const { lobby } = ffaStore;

    const handleLeaveQueue = React.useCallback(() => {
        EventManager.emitServer("ffa", "leaveQueue");
    }, []);

    if (!lobby) return null;

    const { players, needed, maxPlayers } = lobby;

    return (
        <div className={style.arena}>
            <div className={style.header}>
                FREE FOR ALL
                <span className={style.desc}>
                    Waiting for players... ({players.length}/{needed})
                </span>
            </div>

            <div className={style.players}>
                {players.map((p) => (
                    <div key={p.id} className={style.playerCard}>
                        <span className={style.playerName}>{p.name}</span>
                    </div>
                ))}
            </div>

            <button className={style.leaveBtn} onClick={handleLeaveQueue}>
                LEAVE QUEUE
            </button>
        </div>
    );
});

export default createComponent({
    props: {},
    component: FfaLobbyInner,
    pageName: "ffa_lobby"
});
