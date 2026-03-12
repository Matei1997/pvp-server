import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { arenaStore } from "store/Arena.store";
import { partyStore } from "store/Party.store";
import { playerStore } from "store/Player.store";
import { rankingStore } from "store/Ranking.store";
import { QueueCard } from "./QueueCard";
import { PartyPanel } from "./PartyPanel";
import { LoadoutTab } from "./LoadoutTab";
import { ClothingTab } from "./ClothingTab";
import { Leaderboard } from "./Leaderboard";
import { ProfileStats } from "./ProfileStats";
import { Challenges } from "./Challenges";
import { SeasonRewards } from "./SeasonRewards";
import style from "../mainmenu.module.scss";

const GAME_MODES = [
    { id: "hopouts", label: "HOP OUTS" },
    { id: "ffa", label: "FREE FOR ALL" },
    { id: "gungame", label: "GUN GAME" },
    { id: "freeroam", label: "FREEROAM" }
] as const;

const HOP_OUT_SIZES = [2, 3, 4, 5] as const;

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

interface LobbyShellProps {
    activeNav: "play" | "connect" | "ranking" | "loadout" | "clothing";
    setActiveNav: (n: "play" | "connect" | "ranking" | "loadout" | "clothing") => void;
    displayName: string;
    loading: string | null;
    setLoading: (v: string | null) => void;
    error: string | null;
    setError: (e: string | null) => void;
    invitePanelOpen: boolean;
    setInvitePanelOpen: (v: boolean) => void;
    inviteSearch: string;
    setInviteSearch: (v: string) => void;
    adminLevel?: number;
}

export const LobbyShell: React.FC<LobbyShellProps> = observer(
    ({ activeNav, setActiveNav, displayName, loading, setLoading, error, setError, invitePanelOpen, setInvitePanelOpen, inviteSearch, setInviteSearch, adminLevel = 0 }) => {
        const [gameMode, setGameMode] = React.useState<(typeof GAME_MODES)[number]["id"]>("hopouts");
        const [queueSize, setQueueSize] = React.useState<(typeof HOP_OUT_SIZES)[number]>(2);
        const [selectedProfileId, setSelectedProfileId] = React.useState<number | null>(null);
        const [rankingView, setRankingView] = React.useState<"leaderboard" | "challenges" | "seasonRewards">("leaderboard");

        const handleQueue = React.useCallback(() => {
            if (gameMode === "freeroam") return;
            setError(null);
            setLoading("arena");
            const payload: { mode: string; size?: number; asParty?: boolean } = { mode: gameMode };
            if (gameMode === "hopouts") payload.size = queueSize;
            const isLeaderInParty = partyStore.party && partyStore.isLeader(playerStore.data.id);
            if (isLeaderInParty) payload.asParty = true;
            EventManager.emitServer("mainmenu", "playArena", payload);
            setTimeout(() => setLoading(null), 3000);
        }, [gameMode, queueSize, setLoading, setError]);

        const handleFreeroam = React.useCallback(() => {
            setError(null);
            setLoading("freeroam");
            EventManager.emitServer("mainmenu", "playFreeroam");
            setTimeout(() => setLoading(null), 2000);
        }, [setLoading, setError]);

        const openSettings = React.useCallback(() => {
            EventManager.emitServer("mainmenu", "openSettings");
        }, []);

        const openAdmin = React.useCallback(() => {
            EventManager.emitServer("admin", "open");
        }, []);

        React.useEffect(() => {
            rankingStore.fetchBadges();
        }, []);

        React.useEffect(() => {
            if (activeNav === "ranking") {
                rankingStore.fetchBadges();
            }
        }, [activeNav]);

        return (
            <div className={cn(style.lobby, activeNav === "clothing" || activeNav === "loadout" ? style.sceneMode : style.menuMode)}>
                <header className={style.navBar}>
                    <div className={style.logo}>
                        <span className={style.logoMain}>ARENA</span>
                        <span className={style.logoSub}>ENTER HIDEOUT</span>
                    </div>

                    <nav className={style.navLinks}>
                        <button className={cn(style.navLink, activeNav === "play" && style.active)} onClick={() => setActiveNav("play")}>
                            PLAY
                        </button>
                        <button className={cn(style.navLink, activeNav === "ranking" && style.active)} onClick={() => setActiveNav("ranking")}>
                            RANKING
                            {rankingStore.hasBadge && <span className={style.navBadge} />}
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
                        {adminLevel > 0 && (
                            <button className={style.adminBtn} onClick={openAdmin}>
                                ADMIN
                            </button>
                        )}
                        <div className={style.playerBadge}>
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
                        <QueueCard
                            gameMode={gameMode}
                            setGameMode={setGameMode}
                            queueSize={queueSize}
                            setQueueSize={setQueueSize}
                            loading={loading}
                            onQueue={handleQueue}
                            onFreeroam={handleFreeroam}
                        />
                        <PartyPanel
                            displayName={displayName}
                            invitePanelOpen={invitePanelOpen}
                            setInvitePanelOpen={setInvitePanelOpen}
                            inviteSearch={inviteSearch}
                            setInviteSearch={setInviteSearch}
                        />
                    </main>
                )}

                {activeNav === "ranking" &&
                    (selectedProfileId != null ? (
                        <ProfileStats
                            characterId={selectedProfileId}
                            onBack={() => setSelectedProfileId(null)}
                        />
                    ) : (
                        <div className={style.rankingContent}>
                            {rankingStore.canPrestige && (
                                <div className={style.prestigeNotice}>
                                    Prestige Available — View your profile to prestige
                                </div>
                            )}
                            <div className={style.rankingTabs}>
                                <button
                                    type="button"
                                    className={cn(style.rankingTab, rankingView === "leaderboard" && style.active)}
                                    onClick={() => setRankingView("leaderboard")}
                                >
                                    Leaderboard
                                </button>
                                <button
                                    type="button"
                                    className={cn(style.rankingTab, rankingView === "challenges" && style.active)}
                                    onClick={() => setRankingView("challenges")}
                                >
                                    Challenges
                                </button>
                                <button
                                    type="button"
                                    className={cn(style.rankingTab, rankingView === "seasonRewards" && style.active)}
                                    onClick={() => setRankingView("seasonRewards")}
                                >
                                    Season Rewards
                                </button>
                            </div>
                            {rankingView === "leaderboard" && (
                                <Leaderboard
                                    onSelectPlayer={(e) => setSelectedProfileId(e.playerId)}
                                    onViewMyProfile={() => setSelectedProfileId(-1)}
                                />
                            )}
                            {rankingView === "challenges" && <Challenges />}
                            {rankingView === "seasonRewards" && <SeasonRewards />}
                        </div>
                    ))}

                {activeNav === "loadout" && <LoadoutTab onNavigateToClothing={() => setActiveNav("clothing")} />}

                {activeNav === "clothing" && <ClothingTab />}

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
    }
);
