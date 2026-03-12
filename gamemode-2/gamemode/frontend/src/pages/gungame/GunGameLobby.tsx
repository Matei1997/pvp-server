import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { createComponent } from "src/hoc/registerComponent";
import { gunGameStore } from "store/GunGame.store";
import style from "../arena/arena.module.scss";

const GunGameLobbyInner: React.FC = observer(() => {
    const { lobby } = gunGameStore;

    const handleLeaveQueue = React.useCallback(() => {
        EventManager.emitServer("gungame", "leaveQueue");
    }, []);

    if (!lobby) return null;

    const { players, needed } = lobby;

    return (
        <div className={style.arena}>
            <div className={style.header}>
                GUN GAME
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
    component: GunGameLobbyInner,
    pageName: "gungame_lobby"
});
