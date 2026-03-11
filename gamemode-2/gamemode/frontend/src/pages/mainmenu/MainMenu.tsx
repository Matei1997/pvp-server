import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { createComponent } from "src/hoc/registerComponent";
import { arenaStore } from "store/Arena.store";
import { playerStore } from "store/Player.store";
import style from "./mainmenu.module.scss";
import LoadoutPanel from "../loadout/LoadoutPanel";
import ClothingPanel from "../clothing/ClothingPanel";

const GAME_MODES = [
    { id: "hopouts", label: "HOP OUTS" },
    { id: "ffa", label: "FREE FOR ALL" },
    { id: "gungame", label: "GUN GAME" }
] as const;

const HOP_OUT_SIZES = [1, 2, 3, 4, 5] as const;

const MainMenu: React.FC = observer(() => {
    const [loading, setLoading] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [activeNav, setActiveNav] = React.useState<"play" | "connect" | "ranking" | "loadout" | "clothing">("play");
    const [gameMode, setGameMode] = React.useState<(typeof GAME_MODES)[number]["id"]>("hopouts");
    const [queueSize, setQueueSize] = React.useState<(typeof HOP_OUT_SIZES)[number]>(1);
    const [playerName, setPlayerName] = React.useState<string>("Player");

    React.useEffect(() => {
        EventManager.addHandler("mainmenu", "playError", (data: { message: string }) => {
            setLoading(null);
            setError(data.message);
            setTimeout(() => setError(null), 5000);
        });
        EventManager.addHandler("mainmenu", "setPlayerData", (data: { name: string }) => {
            setPlayerName(data.name || "Player");
        });
        return () => EventManager.removeTargetHandlers("mainmenu");
    }, []);

    const handleQueue = React.useCallback(() => {
        setError(null);
        setLoading("arena");
        const payload: { mode: string; size?: number } = { mode: gameMode };
        if (gameMode === "hopouts") payload.size = queueSize;
        EventManager.emitServer("mainmenu", "playArena", payload);
        setTimeout(() => setLoading(null), 3000);
    }, [gameMode, queueSize]);

    const handleFreeroam = React.useCallback(() => {
        setError(null);
        setLoading("freeroam");
        EventManager.emitServer("mainmenu", "playFreeroam");
        setTimeout(() => setLoading(null), 2000);
    }, []);

    const openSettings = React.useCallback(() => {
        EventManager.emitServer("mainmenu", "openSettings");
    }, []);

    const isLoading = loading !== null;
    const displayName = playerName && playerName !== "Player" ? playerName : playerStore.data.id ? `Player [${playerStore.data.id}]` : "Player";
    const modeLabel = GAME_MODES.find((m) => m.id === gameMode)?.label ?? "HOP OUTS";

    React.useEffect(() => {
        EventManager.emitClient("mainmenu", "scene", { showPlayer: activeNav === "clothing" });
        return () => {
            EventManager.emitClient("mainmenu", "scene", { showPlayer: true });
        };
    }, [activeNav]);

    return (
        <div className={cn(style.lobby, activeNav === "clothing" ? style.sceneMode : style.menuMode)}>
            <header className={style.navBar}>
                <div className={style.logo}>
                    <span className={style.logoMain}>ARENA</span>
                    <span className={style.logoSub}>ENTER HIDEOUT</span>
                </div>

                <nav className={style.navLinks}>
                    <button className={cn(style.navLink, activeNav === "play" && style.active)} onClick={() => setActiveNav("play")}>
                        PLAY
                    </button>
                    <button className={cn(style.navLink, activeNav === "connect" && style.active)} onClick={() => setActiveNav("connect")}>
                        CONNECT
                    </button>
                    <button className={cn(style.navLink, activeNav === "ranking" && style.active)} onClick={() => setActiveNav("ranking")}>
                        RANKING
                    </button>
                    <button className={cn(style.navLink, activeNav === "loadout" && style.active)} onClick={() => setActiveNav("loadout")}>
                        LOADOUT
                    </button>
                    <button className={cn(style.navLink, activeNav === "clothing" && style.active)} onClick={() => setActiveNav("clothing")}>
                        CLOTHING
                    </button>
                </nav>

                <div className={style.navRight}>
                    <button className={style.leaveBtn} onClick={openSettings}>
                        SETTINGS
                    </button>
                    <div className={style.playerBadge}>
                        <span className={style.gems}>0 GEMS</span>
                        <span className={style.playerName}>{displayName}</span>
                    </div>
                    {arenaStore.match && (
                        <button className={style.leaveBtn} onClick={() => EventManager.emitServer("arena", "leaveMatch")}>
                            LEAVE
                        </button>
                    )}
                </div>
            </header>

            {activeNav === "play" && (
                <main className={style.mainContent}>
                    <div className={style.modeTabs}>
                        {GAME_MODES.map((mode) => (
                            <button key={mode.id} className={cn(style.modeTab, gameMode === mode.id && style.modeTabActive)} onClick={() => setGameMode(mode.id)}>
                                {mode.label}
                            </button>
                        ))}
                    </div>

                    <section className={style.queueCard}>
                        <div className={style.queueMode}>
                            <span className={style.queueModeLabel}>{modeLabel}</span>
                            <span className={style.queueModeArrows}>‹ ›</span>
                        </div>
                        {gameMode === "hopouts" && (
                            <div className={style.sizeRow}>
                                {HOP_OUT_SIZES.map((size) => (
                                    <button key={size} className={cn(style.sizeChip, queueSize === size && style.sizeChipActive)} onClick={() => setQueueSize(size)}>
                                        {size}v{size}
                                    </button>
                                ))}
                            </div>
                        )}
                        <button className={style.queueBtn} onClick={handleQueue} disabled={isLoading}>
                            {loading === "arena" ? "JOINING..." : "QUEUE"}
                        </button>
                        <button className={style.freeroamBtn} onClick={handleFreeroam} disabled={isLoading} title="Enter freeroam. Use /fdim to set your dimension.">
                            {loading === "freeroam" ? "ENTERING..." : "FREEROAM"}
                        </button>
                    </section>

                    <aside className={style.socialPanel}>
                        <div className={style.socialSection}>
                            <div className={style.socialTitle}>YOUR PROFILE</div>
                            <div className={style.socialName}>{displayName}</div>
                            <div className={style.socialRank}>BRONZE I</div>
                            <div className={style.socialBadges}>BADGES</div>
                            <div className={style.socialLevel}>LEVEL 1</div>
                            <div className={style.socialXp}>0 / 500 XP</div>
                        </div>
                        <div className={style.socialSection}>
                            <div className={style.socialTitle}>YOUR LOBBY</div>
                            <div className={style.socialSearch}>
                                <span className={style.searchIcon}>⌕</span>
                                <input type="text" placeholder="Search..." className={style.searchInput} readOnly />
                            </div>
                            <div className={style.inviteSlots}>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={style.inviteSlot}>
                                        <span className={style.invitePlus}>+</span>
                                        <span className={style.inviteLabel}>INVITE FRIEND</span>
                                    </div>
                                ))}
                            </div>
                            <div className={style.friendsList}>FRIENDS LIST</div>
                        </div>
                    </aside>
                </main>
            )}

            {activeNav === "connect" && (
                <div className={style.infoContent}>
                    <div className={style.infoTitle}>CONNECT THE MATCH</div>
                    <div className={style.infoDesc}>Join an existing match by entering a match code shared by a friend. This feature will be available soon.</div>
                </div>
            )}

            {activeNav === "ranking" && (
                <div className={style.infoContent}>
                    <div className={style.infoTitle}>GLOBAL RANKING</div>
                    <div className={style.infoDesc}>Compete in ranked matches to climb the leaderboard. Rankings will be available after the first season begins.</div>
                </div>
            )}

            {activeNav === "loadout" && <LoadoutPanel />}

            {activeNav === "clothing" && <ClothingPanel />}

            {error && (
                <div className={style.errorToast}>
                    {error}
                    <button type="button" className={style.errorClose} onClick={() => setError(null)} aria-label="Dismiss">
                        ×
                    </button>
                </div>
            )}
        </div>
    );
});

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export default createComponent({
    props: {},
    component: MainMenu,
    pageName: "mainmenu"
});
