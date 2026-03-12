import * as React from "react";
import { useMemo, useEffect } from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { arenaStore } from "store/Arena.store";
import { playerStore } from "store/Player.store";
import { hudStore } from "store/Hud.store";
import { createComponent } from "src/hoc/registerComponent";
import Speedometer from "../hud/MainHud/components/Speedometer";
import ammoicon from "assets/images/hud/icons/ammo.svg";
import { ScoreBar } from "./components/ScoreBar";
import { KillFeed } from "./components/KillFeed";
import { ZoneInfo } from "./components/ZoneInfo";
import { ItemBar } from "./components/ItemBar";
import { RoundOverlay } from "./components/RoundOverlay";
import { RoundScoreboard } from "./components/RoundScoreboard";
import { DeathOverlay } from "./components/DeathOverlay";
import { DeathRecapCard } from "./components/DeathRecapCard";
import { RoundResultOverlay } from "./components/RoundResultOverlay";
import { AliveCounter } from "./components/AliveCounter";
import { PersonalVitals } from "./components/PersonalVitals";
import { TeamVitals } from "./components/TeamVitals";
import { DamageDirectionIndicator } from "./components/DamageDirectionIndicator";
import { DamageNumbers } from "./components/DamageNumbers";
import { ArmorBreakIndicator } from "./components/ArmorBreakIndicator";
import { LastAliveIndicator } from "./components/LastAliveIndicator";
import { MatchResult } from "./components/MatchResult";
import { Scoreboard } from "./components/Scoreboard";
import { VoiceIndicator } from "components/VoiceIndicator";
import style from "./arenaHud.module.scss";

const CARDINALS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

const ArenaHudInner: React.FC = observer(() => {
    const {
        match,
        killFeed,
        matchEnd,
        scoreboardVisible,
        roundStart,
        roundEnd,
        zone,
        itemCounts,
        itemCast,
        minimapData,
        outOfBounds,
        arenaDeathOverlayVisible,
        arenaDeathRespawnMessage,
        deathRecap,
        roundResult,
        aliveCount,
        vitals,
        myTeam,
        damageDirection,
        armorBreak,
        lastAlive,
        spectatingTarget,
        spectatingTeammateCount,
        spectatingNoTeammates,
        damageNumbers,
        lastKillNotification,
        lastDeathNotification
    } = arenaStore;

    const getWeaponImage = useMemo(() => {
        return new URL(`../../assets/images/hud/weapons/${playerStore.data.weapondata?.weapon}.svg`, import.meta.url).href;
    }, [playerStore.data.weapondata]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.keyCode === 53) {
                EventManager.emitServer("arena", "useItem", JSON.stringify({ item: "medkit" }));
                e.preventDefault();
            } else if (e.keyCode === 54) {
                EventManager.emitServer("arena", "useItem", JSON.stringify({ item: "plate" }));
                e.preventDefault();
            } else if ((e.keyCode === 20 || e.keyCode === 9) && !e.repeat) {
                arenaStore.scoreboardVisible = true;
                e.preventDefault();
            }
        };
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.keyCode === 20 || e.keyCode === 9) {
                arenaStore.scoreboardVisible = false;
                e.preventDefault();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("keyup", onKeyUp);
        };
    }, []);

    if (matchEnd) {
        return <MatchResult matchEnd={matchEnd} myTeam={myTeam} />;
    }

    if (!match) return null;

    if (scoreboardVisible) {
        return (
            <Scoreboard
                match={match}
                visible={scoreboardVisible}
                onClose={() => (arenaStore.scoreboardVisible = false)}
            />
        );
    }

    return (
        <div className={style.arenaHud}>
            <DeathOverlay visible={arenaDeathOverlayVisible} showRespawnMessage={arenaDeathRespawnMessage} />

            {damageDirection && <DamageDirectionIndicator direction={damageDirection.direction} />}

            <VoiceIndicator />
            <DamageNumbers entries={damageNumbers} />

            {armorBreak && <ArmorBreakIndicator />}

            {lastAlive && (
                <LastAliveIndicator team={lastAlive.team} enemiesRemaining={lastAlive.enemiesRemaining} />
            )}

            {deathRecap && <DeathRecapCard recap={deathRecap} />}

            {roundResult && <RoundResultOverlay result={roundResult} myTeam={myTeam} />}

            {roundEnd && match && <RoundScoreboard match={match} roundEnd={roundEnd} visible={!!roundEnd} />}

            <RoundOverlay roundStart={roundStart} roundEnd={roundEnd} />

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

            <div className={style.topCenter}>
                <ScoreBar redScore={match.redScore} blueScore={match.blueScore} timeLeft={match.timeLeft} />
                {(aliveCount || match) && (
                    <AliveCounter
                        redAlive={aliveCount?.redAlive ?? match.redAlive ?? 0}
                        blueAlive={aliveCount?.blueAlive ?? match.blueAlive ?? 0}
                    />
                )}
            </div>

            <div className={style.topRight}>
                <KillFeed entries={killFeed} />
            </div>

            <div className={style.topLeft}>
                {zone && <ZoneInfo zone={zone} />}
                {match &&
                    myTeam &&
                    (() => {
                        const ourTeam = myTeam === "red" ? match.redTeam : match.blueTeam;
                        const localId = minimapData?.localPlayerId ?? playerStore.data.id;
                        const teammates = ourTeam.filter((p) => p.id !== localId);
                        return teammates.length > 0 ? <TeamVitals teammates={teammates} /> : null;
                    })()}
            </div>

            {(spectatingTarget || spectatingNoTeammates) && (
                <div className={style.spectatingLabel}>
                    {spectatingNoTeammates ? (
                        <>NO TEAMMATES REMAINING — WAITING FOR NEXT ROUND</>
                    ) : (
                        <>
                            SPECTATING: {spectatingTarget}
                            {spectatingTeammateCount > 1 && (
                                <span className={style.spectatingHint}> ← → to switch</span>
                            )}
                        </>
                    )}
                </div>
            )}

            {outOfBounds.active && (
                <div className={style.outOfBounds}>RETURN TO PLAYABLE AREA • {outOfBounds.timeLeft}s</div>
            )}

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

            <div className={style.bottomRight}>
                <div className={style.bottomRightStack}>
                    <PersonalVitals health={vitals.health} armor={vitals.armor} />
                    <ItemBar medkits={itemCounts.medkits} plates={itemCounts.plates} itemCast={itemCast} />
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
                </div>
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
