import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { createComponent } from "src/hoc/registerComponent";
import { gunGameStore } from "store/GunGame.store";
import { playerStore } from "store/Player.store";
import style from "./gunGameHud.module.scss";

const GunGameHudInner: React.FC = observer(() => {
    const { match, matchUpdate, matchEnd } = gunGameStore;

    const handleLeaveMatch = React.useCallback(() => {
        EventManager.emitServer("gungame", "leaveMatch");
    }, []);

    if (matchEnd) {
        return (
            <div className={style.ggResult}>
                <div className={style.resultTitle}>
                    {matchEnd.winner ? `${matchEnd.winner.name} WINS!` : "MATCH ENDED"}
                </div>
                <div className={style.resultSub}>
                    {matchEnd.winner && `Tier ${matchEnd.winner.tier} • ${matchEnd.winner.kills} kills`}
                </div>
                <div className={style.leaderboard}>
                    <div className={style.leaderboardTitle}>FINAL STANDINGS</div>
                    {matchEnd.leaderboard.slice(0, 8).map((p, i) => (
                        <div key={p.id} className={style.leaderboardRow}>
                            <span className={style.rank}>#{i + 1}</span>
                            <span className={style.name}>{p.name}</span>
                            <span className={style.tier}>T{p.tier}</span>
                            <span className={style.kd}>{p.kills} / {p.deaths}</span>
                        </div>
                    ))}
                </div>
                <div className={style.returnMsg}>Returning to menu...</div>
            </div>
        );
    }

    if (!match && !matchUpdate) return null;

    const totalTiers = match?.totalTiers ?? matchUpdate?.totalTiers ?? 0;
    const leaderboard = matchUpdate?.leaderboard ?? match?.leaderboard ?? [];
    const topPlayer = matchUpdate?.topPlayer ?? leaderboard[0] ?? null;
    const myEntry = leaderboard.find((p) => p.id === playerStore.data.id);
    const myTier = myEntry?.tier ?? 0;
    const myWeapon = myEntry?.weaponName ?? "—";

    return (
        <div className={style.gunGameHud}>
            <div className={style.topCenter}>
                <div className={style.tierBar}>
                    <span className={style.tierLabel}>TIER</span>
                    <span className={style.tierValue}>{myTier + 1} / {totalTiers}</span>
                </div>
                <div className={style.weaponName}>{myWeapon}</div>
                {topPlayer && topPlayer.id !== playerStore.data.id && (
                    <div className={style.topPlayer}>
                        LEADER: {topPlayer.name} (T{topPlayer.tier + 1})
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
    component: GunGameHudInner,
    pageName: "gungame_hud"
});
