import * as React from "react";
import { useMemo, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { arenaStore } from "store/Arena.store";
import { playerStore } from "store/Player.store";
import { hudStore } from "store/Hud.store";
import { createComponent } from "src/hoc/registerComponent";
import Speedometer from "../hud/MainHud/components/Speedometer";
import ammoicon from "assets/images/hud/icons/ammo.svg";
import style from "./arenaHud.module.scss";

const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const CARDINALS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
const PROGRESS_SEGMENTS = 16;

const ArenaHudInner: React.FC = observer(() => {
    const { match, killFeed, matchEnd, mapName, lastKillNotification, lastDeathNotification, scoreboardVisible, roundStart, roundEnd, zone, itemCounts, itemCast, vitals, minimapData, outOfBounds, arenaDeathOverlayVisible, arenaDeathRespawnMessage } =
        arenaStore;
    const [castProgress, setCastProgress] = useState(0);

    useEffect(() => {
        if (!itemCast) {
            setCastProgress(0);
            return;
        }
        const start = itemCast.startedAt;
        const duration = itemCast.castTime;
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            if (elapsed >= duration) {
                setCastProgress(1);
                clearInterval(interval);
                return;
            }
            setCastProgress(elapsed / duration);
        }, 50);
        return () => clearInterval(interval);
    }, [itemCast?.startedAt, itemCast?.castTime]);

    const getWeaponImage = useMemo(() => {
        return new URL(`../../assets/images/hud/weapons/${playerStore.data.weapondata?.weapon}.svg`, import.meta.url).href;
    }, [playerStore.data.weapondata]);

    // When F2 shows cursor, game keys don't fire; handle 5 (medkit), 6 (plate), Tab/Caps (scoreboard) in CEF
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.keyCode === 53) {
                EventManager.emitServer("arena", "useItem", JSON.stringify({ item: "medkit" }));
                e.preventDefault();
            } else if (e.keyCode === 54) {
                EventManager.emitServer("arena", "useItem", JSON.stringify({ item: "plate" }));
                e.preventDefault();
            } else if (e.keyCode === 20 || e.keyCode === 9) {
                arenaStore.scoreboardVisible = !arenaStore.scoreboardVisible;
                e.preventDefault();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    if (matchEnd) {
        return (
            <div className={style.results}>
                <div className={`${style.resultsTitle} ${matchEnd.winner === "red" || matchEnd.winner === "blue" ? style[matchEnd.winner === "red" ? "victory" : "defeat"] : ""}`}>
                    {matchEnd.winner === "draw" ? "DRAW" : `${matchEnd.winner.toUpperCase()} VICTORY`}
                </div>
                <div className={style.resultsScores}>
                    <div className={style.teamScore}>
                        <span className={style.teamLabel}>RED</span>
                        <span className={style.score}>{matchEnd.redScore}</span>
                    </div>
                    <span className={style.vs}>—</span>
                    <div className={style.teamScore}>
                        <span className={style.teamLabel}>BLUE</span>
                        <span className={style.score}>{matchEnd.blueScore}</span>
                    </div>
                </div>

                <div className={style.resultsTeams}>
                    <div className={style.teamList}>
                        <div className={style.teamHeader}>RED</div>
                        {matchEnd.redTeam.map((p) => (
                            <div key={p.id} className={style.playerRow}>
                                <span>{p.name}</span>
                                <span className={style.kd}>
                                    {p.kills}/{p.deaths}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className={style.teamList}>
                        <div className={style.teamHeader}>BLUE</div>
                        {matchEnd.blueTeam.map((p) => (
                            <div key={p.id} className={style.playerRow}>
                                <span>{p.name}</span>
                                <span className={style.kd}>
                                    {p.kills}/{p.deaths}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!match) return null;

    if (scoreboardVisible) {
        return (
            <div className={style.scoreboardOverlay} onClick={() => (arenaStore.scoreboardVisible = false)}>
                <div className={style.scoreboardPanel} onClick={(e) => e.stopPropagation()}>
                    <div className={style.scoreboardTitle}>TACTICAL ASSESSMENT</div>
                    <div className={style.scoreboardScores}>
                        <div className={style.sbRed}>
                            <span className={style.sbBigScore}>{match.redScore}</span>
                        </div>
                        <span className={style.sbTimer}>ROUND {match.currentRound}</span>
                        <div className={style.sbBlue}>
                            <span className={style.sbBigScore}>{match.blueScore}</span>
                        </div>
                    </div>
                    <div className={style.scoreboardTeams}>
                        <div className={style.sbTeamCol}>
                            <div className={style.sbTeamHeader}>RED TEAM</div>
                            {match.redTeam.map((p) => (
                                <div key={p.id} className={`${style.sbRow} ${!p.alive ? style.dead : ""} ${p.id === playerStore.data.id ? style.self : ""}`}>
                                    <span>{p.name}</span>
                                    <span className={style.sbKills}>{p.kills}</span>
                                    <span className={style.sbDeaths}>{p.deaths}</span>
                                </div>
                            ))}
                        </div>
                        <div className={style.sbTeamCol}>
                            <div className={style.sbTeamHeader}>BLUE TEAM</div>
                            {match.blueTeam.map((p) => (
                                <div key={p.id} className={`${style.sbRow} ${!p.alive ? style.dead : ""} ${p.id === playerStore.data.id ? style.self : ""}`}>
                                    <span>{p.name}</span>
                                    <span className={style.sbKills}>{p.kills}</span>
                                    <span className={style.sbDeaths}>{p.deaths}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const myId = playerStore.data.id;
    const myTeam = match.redTeam.some((p) => p.id === myId) ? "red" : match.blueTeam.some((p) => p.id === myId) ? "blue" : null;
    const teammates = myTeam === "red" ? match.redTeam : myTeam === "blue" ? match.blueTeam : [];

    return (
        <div className={style.arenaHud}>
            {/* Full-screen death overlay (tech style): YOU'RE DEAD → You won't respawn until next round */}
            {arenaDeathOverlayVisible && (
                <div className={style.deathOverlay}>
                    <div className={style.deathOverlayVignette} />
                    <div className={style.deathOverlayContent}>
                        <h1 className={style.deathOverlayTitle}>YOU'RE DEAD</h1>
                        {arenaDeathRespawnMessage && (
                            <p className={style.deathOverlaySubtitle}>You won't respawn until next round.</p>
                        )}
                    </div>
                </div>
            )}
            {/* Round start/end overlays */}
            {roundStart && (
                <div className={style.roundOverlay}>
                    <div className={style.roundTitle}>ROUND {roundStart.round}</div>
                    <div className={style.roundWeapon}>{roundStart.weaponName}</div>
                    <div className={style.roundScore}>
                        {roundStart.redScore} — {roundStart.blueScore}
                    </div>
                </div>
            )}
            {roundEnd && (
                <div className={style.roundOverlay}>
                    <div className={style.roundTitle}>{roundEnd.winner === "draw" ? "ROUND DRAW" : `${roundEnd.winner.toUpperCase()} WINS ROUND`}</div>
                    <div className={style.roundScore}>
                        {roundEnd.redScore} — {roundEnd.blueScore}
                    </div>
                </div>
            )}

            {/* Compass */}
            {minimapData && (
                <div className={style.compass}>
                    <div
                        className={style.compassStrip}
                        style={{
                            transform: `translateX(calc(100px - ${((((minimapData.heading % 360) + 360) % 360) / 360) * 1600}px))`
                        }}
                    >
                        {CARDINALS.map((d) => (
                            <span key={d} className={style.compassTick}>
                                {d}
                            </span>
                        ))}
                        <span className={style.compassTick}>{CARDINALS[0]}</span>
                    </div>
                    <div className={style.compassCenter} />
                </div>
            )}

            {/* Top center: scores + round info */}
            <div className={style.topCenter}>
                <div className={style.scores}>
                    <div className={`${style.teamBadge} ${style.redTeam}`}>
                        <span className={style.score}>{match.redScore}</span>
                    </div>

                    <div className={style.timer}>{formatTime(match.timeLeft)}</div>

                    <div className={`${style.teamBadge} ${style.blueTeam}`}>
                        <span className={style.score}>{match.blueScore}</span>
                    </div>
                </div>

                {zone && (
                    <div className={style.zoneInfo}>
                        <span className={style.zonePhase}>PHASE {zone.phase}</span>
                        <span className={style.zoneTimer}>{zone.phaseTimeLeft}s</span>
                    </div>
                )}
            </div>

            {outOfBounds.active && <div className={style.outOfBounds}>RETURN TO PLAYABLE AREA • {outOfBounds.timeLeft}s</div>}

            {/* Top right area: weapon info + kill feed */}
            <div className={style.topRight}>
                {playerStore.data.weapondata && (
                    <div className={style.weaponInfo}>
                        <img src={getWeaponImage} alt="" />
                        {playerStore.data.weapondata.weapon !== "weapon_unarmed" && (
                            <span className={style.ammodata}>
                                <img src={ammoicon} alt="ammo" />
                                {playerStore.data.weapondata.ammo}/{playerStore.data.weapondata.maxammo}
                            </span>
                        )}
                    </div>
                )}
                <div className={style.killFeed}>
                    {killFeed.map((e, i) => (
                        <div key={`${e.killer}-${e.victim}-${i}`} className={style.killEntry}>
                            <span className={style.killer}>{e.killer}</span>
                            <img src="https://cdn-icons-png.flaticon.com/512/565/565868.png" className={style.weaponIcon} alt="" />
                            <span className={style.victim}>{e.victim}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Kill/death notifications */}
            {(lastKillNotification || lastDeathNotification) && (
                <div className={style.centerNotification}>
                    {lastKillNotification && (
                        <div className={style.killNotif}>
                            <span className={style.killLabel}>ELIMINATED</span>
                            <span className={style.killName}>{lastKillNotification.victim}</span>
                        </div>
                    )}
                    {lastDeathNotification && (
                        <div className={style.deathNotif}>
                            <span className={style.deathLabel}>ELIMINATED BY</span>
                            <span className={style.deathName}>{lastDeathNotification.killer || "Unknown"}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Items */}
            <div className={style.itemBar}>
                <div className={`${style.itemBtn} ${itemCounts.medkits <= 0 ? style.itemDisabled : ""}`}>
                    <span className={style.itemKey}>5</span>
                    <span className={style.itemIcon}>+</span>
                    <span className={style.itemCount}>{itemCounts.medkits}</span>
                </div>
                <div className={`${style.itemBtn} ${itemCounts.plates <= 0 ? style.itemDisabled : ""}`}>
                    <span className={style.itemKey}>6</span>
                    <span className={style.itemIcon}>⛨</span>
                    <span className={style.itemCount}>{itemCounts.plates}</span>
                </div>
            </div>

            {itemCast && (
                <div className={style.progressWrapper}>
                    <div className={style.progressBox}>
                        <div className={style.progressRow}>
                            <span className={style.progressTitle}>
                                {itemCast.item === "medkit" ? "Healing..." : "Applying plate..."}
                            </span>
                        </div>
                        <div className={style.progressDots}>
                            {Array.from({ length: PROGRESS_SEGMENTS }, (_, i) => (
                                <div
                                    key={i}
                                    className={`${style.progressDot} ${i < Math.floor(castProgress * PROGRESS_SEGMENTS) ? style.active : ""}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom right: speedometer */}
            <div className={style.bottomRight}>
                {hudStore.vehicleData.isActive && (
                    <div className={style.speedoWrapper}>
                        <Speedometer store={hudStore} />
                    </div>
                )}
            </div>
        </div>
    );
});

export default createComponent({
    props: {},
    component: ArenaHudInner,
    pageName: "arena_hud"
});
