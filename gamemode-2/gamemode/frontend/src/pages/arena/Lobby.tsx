import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { createComponent } from "src/hoc/registerComponent";
import { arenaStore } from "store/Arena.store";
import style from "./arena.module.scss";

const ArenaLobby: React.FC = observer(() => {
    const { lobby } = arenaStore;
    const targetPlayers = (lobby.queueSize || 1) * 2;

    const handleLeaveQueue = React.useCallback(() => {
        EventManager.emitServer("arena", "leaveQueue");
    }, []);

    return (
        <div className={style.arena}>
            <div className={style.header}>
                HOPOUTS
                <span className={style.desc}>
                    {lobby.state === "waiting"
                        ? lobby.players.length >= targetPlayers
                            ? `Match starting in ${lobby.countdown}s`
                            : `Waiting for players... (${lobby.players.length}/${targetPlayers})`
                        : "Vote for a location..."}
                </span>
            </div>

            <div className={style.players}>
                {lobby.players.map((p) => (
                    <div key={p.id} className={style.playerCard}>
                        <span className={style.playerName}>{p.name}</span>
                        {p.ready && <span className={style.ready}>READY</span>}
                    </div>
                ))}
            </div>

            {lobby.state === "waiting" && lobby.countdown > 0 && (
                <div className={style.countdown}>{lobby.countdown}</div>
            )}

            <button className={style.leaveBtn} onClick={handleLeaveQueue}>
                LEAVE QUEUE
            </button>
        </div>
    );
});

export default createComponent({
    props: {},
    component: ArenaLobby,
    pageName: "arena_lobby"
});
