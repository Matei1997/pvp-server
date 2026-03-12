import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { createComponent } from "src/hoc/registerComponent";
import { ffaStore } from "store/Ffa.store";
import { playerStore } from "store/Player.store";
import style from "./ffaHud.module.scss";

const FfaHudInner: React.FC = observer(() => {
    const { match, matchUpdate, matchEnd } = ffaStore;

    const handleLeaveMatch = React.useCallback(() => {
        EventManager.emitServer("ffa", "leaveMatch");
    }, []);

    if (matchEnd) {
        return (
            <div className={style.ffaResult}>
                <div className={style.resultTitle}>
                    {matchEnd.winner ? `${matchEnd.winner.name} WINS!` : "MATCH ENDED"}
                </div>
                <div className={style.resultScore}>
                    {matchEnd.winner && `${matchEnd.winner.score} kills`}
                </div>
                <div className={style.leaderboard}>
                    <div className={style.leaderboardTitle}>FINAL STANDINGS</div>
                    {matchEnd.leaderboard.slice(0, 8).map((p, i) => (
                        <div key={p.id} className={style.leaderboardRow}>
                            <span className={style.rank}>#{i + 1}</span>
                            <span className={style.name}>{p.name}</span>
                            <span className={style.score}>{p.score} / {p.deaths}</span>
                        </div>
                    ))}
                </div>
                <div className={style.returnMsg}>Returning to menu...</div>
            </div>
        );
    }

    if (!match && !matchUpdate) return null;

    const scoreToWin = match?.scoreToWin ?? matchUpdate?.scoreToWin ?? 20;
    const leaderboard = matchUpdate?.leaderboard ?? match?.leaderboard ?? [];
    const topPlayer = matchUpdate?.topPlayer ?? leaderboard[0] ?? null;
    const myEntry = leaderboard.find((p) => p.id === playerStore.data.id);
    const myScore = myEntry?.score ?? 0;

    return (
        <div className={style.ffaHud}>
            <div className={style.topCenter}>
                <div className={style.scoreBar}>
                    <span className={style.scoreLabel}>KILLS</span>
                    <span className={style.scoreValue}>{myScore} / {scoreToWin}</span>
                </div>
                {topPlayer && topPlayer.id !== playerStore.data.id && (
                    <div className={style.topPlayer}>
                        LEADER: {topPlayer.name} ({topPlayer.score})
                    </div>
                )}
            </div>

            <div className={style.leaveBtnWrap}>
                <button className={style.leaveBtn} onClick={handleLeaveMatch}>
                    LEAVE
                </button>
            </div>
        </div>
    );
});

export default createComponent({
    props: {},
    component: FfaHudInner,
    pageName: "ffa_hud"
});
