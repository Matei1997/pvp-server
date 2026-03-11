import { useState, useMemo, FC } from "react";
import cn from "classnames";
import { observer } from "mobx-react-lite";

import EventManager from "utils/EventManager.util";
import { playerStore } from "store/Player.store";
import { playerListStore } from "store/PlayerList.store";
import Keys from "pages/SettingsMenu/components/Keybinds/Keybinds";

import style from "./playerMenu.module.scss";
import { createComponent } from "src/hoc/registerComponent";

const TABS = [
    { id: "overview", label: "Overview", desc: "Your stats and info" },
    { id: "keybinds", label: "Keybinds", desc: "Configure controls" },
    { id: "players", label: "Players", desc: "Online players" }
] as const;

const PlayerMenuInner: FC = observer(() => {
    const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");

    const regExp = useMemo(() => /(\d)(?=(\d{3})+(?!\d))/g, []);

    return (
        <div className={style.playerMenu}>
            <div className={style.body}>
                <div className={style.header}>
                    <div className={style.heading}>
                        <div className={style.title}>Player Menu</div>
                        <div className={style.desc}>Stats, keybinds and player list</div>
                    </div>
                    <nav className={style.nav}>
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                className={cn(style.navItem, tab === t.id && style.active)}
                                onClick={() => setTab(t.id)}
                            >
                                <span className={style.navLabel}>{t.label}</span>
                                <span className={style.navDesc}>{t.desc}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className={style.main}>
                    {tab === "overview" && (
                        <div className={style.overview}>
                            <div className={style.statGrid}>
                                <div className={style.statCard}>
                                    <span className={style.statLabel}>ID</span>
                                    <span className={style.statValue}>{playerStore.data.id}</span>
                                </div>
                                <div className={style.statCard}>
                                    <span className={style.statLabel}>Ping</span>
                                    <span className={style.statValue}>{playerStore.data.ping} ms</span>
                                </div>
                                <div className={style.statCard}>
                                    <span className={style.statLabel}>Online</span>
                                    <span className={style.statValue}>{playerStore.nowPlaying}</span>
                                </div>
                                <div className={style.statCard}>
                                    <span className={style.statLabel}>Cash</span>
                                    <span className={style.statValue}>
                                        ${("" + playerStore.data.cash).replace(regExp, "$1,")}
                                    </span>
                                </div>
                                {(playerStore.data.health !== undefined || playerStore.data.armour !== undefined) && (
                                    <>
                                        <div className={style.statCard}>
                                            <span className={style.statLabel}>Health</span>
                                            <span className={style.statValue}>
                                                {Math.min(100, Math.round((playerStore.data.health ?? 100) / 2))}%
                                            </span>
                                        </div>
                                        <div className={style.statCard}>
                                            <span className={style.statLabel}>Armour</span>
                                            <span className={style.statValue}>
                                                {Math.min(100, playerStore.data.armour ?? 0)}%
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === "keybinds" && (
                        <div className={style.keybindsTab}>
                            <Keys store={playerStore} />
                        </div>
                    )}

                    {tab === "players" && (
                        <div className={style.playersTab}>
                            <div className={style.playersHeader}>
                                <span>Online: {playerListStore.players.length}</span>
                            </div>
                            <div className={style.playersList}>
                                <div className={style.playersRow + " " + style.playersHeaderRow}>
                                    <span>ID</span>
                                    <span>Name</span>
                                    <span>Ping</span>
                                </div>
                                {playerListStore.players.map((p) => (
                                    <div key={p.id} className={style.playersRow}>
                                        <span>{p.id}</span>
                                        <span>{p.name}</span>
                                        <span>{p.ping}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button className={style.closeBtn} onClick={() => EventManager.emitServer("playerMenu", "close")}>
                    Close (ESC)
                </button>
            </div>
        </div>
    );
});

export default createComponent({
    component: PlayerMenuInner,
    pageName: "playerMenu",
    props: {}
});
