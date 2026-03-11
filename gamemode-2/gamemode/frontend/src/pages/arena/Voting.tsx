import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { createComponent } from "src/hoc/registerComponent";
import { arenaStore } from "store/Arena.store";
import style from "./arena.module.scss";

const HopoutsVoting: React.FC = observer(() => {
    const { lobby } = arenaStore;

    const handleVote = React.useCallback((mapId: string) => {
        EventManager.emitServer("arena", "vote", { mapId });
    }, []);

    return (
        <div className={style.arena}>
            <div className={style.header}>
                PICK A LOCATION
                <span className={style.desc}>{lobby.countdown > 0 ? `Voting ends in ${lobby.countdown}s` : "Select where to play"}</span>
            </div>

            <div className={style.voteMaps}>
                {lobby.voteMaps.map((m) => (
                    <div key={m.id} className={`${style.mapCard} ${lobby.myVote === m.id ? style.mapCardSelected : ""}`} onClick={() => handleVote(m.id)}>
                        <div className={style.mapIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 16 16">
                                <path
                                    fill="currentColor"
                                    d="M5 2.223L1.235 4.576A.5.5 0 0 0 1 5v8.5a.5.5 0 0 0 .765.424L5 11.902zm1 9.586l4 2V4.191l-4-2zm8.765-.385L11 13.777v-9.68l3.235-2.021A.5.5 0 0 1 15 2.5V11a.5.5 0 0 1-.235.424"
                                />
                            </svg>
                        </div>
                        <span className={style.mapName}>{m.name.replace(/"/g, "")}</span>
                        <span className={style.voteCount}>{m.votes} votes</span>
                        {lobby.myVote === m.id && <span className={style.voteCheck}>✓</span>}
                    </div>
                ))}
            </div>

            {lobby.countdown > 0 && <div className={style.timer}>{lobby.countdown}</div>}
        </div>
    );
});

export default createComponent({
    props: {},
    component: HopoutsVoting,
    pageName: "arena_voting"
});
