import { observer } from "mobx-react-lite";
import { FC, useMemo } from "react";
import { entries } from "mobx";

import { hudStore } from "store/Hud.store";
import { playerStore } from "store/Player.store";

import Speedometer from "./components/Speedometer";

import star from "assets/images/hud/icons/star.svg";
import ping from "assets/images/hud/icons/ping.svg";
import users from "assets/images/hud/icons/user.svg";
import ammoicon from "assets/images/hud/icons/ammo.svg";
import areaicon from "assets/images/hud/icons/areaname.svg";
import cashicon from "assets/images/hud/icons/cash.svg";

import style from "./mainhud.module.scss";
import { regExp } from "utils/Helpers.util";

const MainHUD: FC<{ store: typeof hudStore; playerStore: typeof playerStore }> = ({ store, playerStore }) => {
    const getWeaponImage = useMemo(() => {
        return new URL(`../../../assets/images/hud/weapons/${playerStore.data.weapondata?.weapon}.svg`, import.meta.url).href;
    }, [playerStore.data.weapondata]);

    const rawHealth = Number(playerStore.data.health);
    const rawArmour = Number(playerStore.data.armour);
    const healthNorm = !Number.isNaN(rawHealth)
        ? (rawHealth > 100 ? Math.min(100, rawHealth - 100) : Math.min(100, rawHealth))
        : 100;
    const armourNorm = !Number.isNaN(rawArmour)
        ? Math.max(0, Math.min(100, rawArmour))
        : 100;
    const healthVal = Math.round(healthNorm);
    const armourVal = Math.round(armourNorm);

    return (
        <div className={style.mainhud}>
            <div className={style.left}>
                <div className={style.vitals}>
                    <div className={style.vitalsHeader}>
                        <span className={style.vitalsName}>{playerStore.data.name ? `${playerStore.data.name} (YOU)` : "Player (YOU)"}</span>
                        <span className={style.vitalsKills}>{playerStore.data.kills ?? 0} kills</span>
                    </div>
                    <div className={style.vitalRow}>
                        <span className={style.vitalLabel}>AP</span>
                        <div className={style.vitalTrack}>
                            <div className={style.vitalFillArmour} style={{ width: `${armourNorm}%` }} />
                        </div>
                        <span className={style.vitalValue}>{armourVal}</span>
                    </div>
                    <div className={style.vitalRow}>
                        <span className={style.vitalLabel}>HP</span>
                        <div className={style.vitalTrack}>
                            <div className={style.vitalFillHealth} style={{ width: `${healthNorm}%` }} />
                        </div>
                        <span className={style.vitalValue}>{healthVal}</span>
                    </div>
                </div>
                <div className={style.areainfo}>
                    <img src={areaicon} alt="" />
                    <div className={style.areadata}>
                        <div className={style.areaname}>{store.areaData.area}</div>
                        <div className={style.streetname}>{store.areaData.street}</div>
                    </div>
                </div>
            </div>

            <div className={style.right}>
                <div className={style.topContent}>
                    <div className={style.serverBadges}>
                        <div className={`${style.serverBadge} ${style.onlineBadge}`}>
                            <span className={style.onlineLabel}>Online:</span>
                            <span className={style.onlineCount}>{playerStore.nowPlaying}</span>
                        </div>
                        <div className={`${style.serverBadge} ${style.serverNameBadge}`}>HOPOUTS</div>
                    </div>

                    <div className={style.playerInfo}>
                        <div className={style.id}>ID: {playerStore.data.id}</div>
                        <div className={style.ping}>
                            <img src={ping} alt="" />
                            {playerStore.data.ping}
                        </div>
                        <div className={style.online}>
                            <img src={users} alt="" />
                            {playerStore.nowPlaying}
                        </div>
                    </div>

                    {playerStore.data.wantedLevel > 0 && (
                        <div className={style.stars}>
                            {Array.from({ length: playerStore.data.wantedLevel }).map((_e, x) => (
                                <img src={star} alt="star" key={x} />
                            ))}
                        </div>
                    )}

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

                    <div className={style.cashinfo}>
                        <img src={cashicon} alt="" />${("" + playerStore.data.cash).replace(regExp.money, "$1,")}
                    </div>
                </div>

                {store.vehicleData.isActive && <Speedometer store={store} />}
            </div>

            {(store.voiceTransmitting.local || store.voiceTransmitting.radio) && (
                <div className={style.voiceIndicator} aria-label="Voice transmitting">
                    {store.voiceTransmitting.local && <span className={`${style.voiceIcon} ${style.voiceIconLocal}`} />}
                    {store.voiceTransmitting.radio && <span className={`${style.voiceIcon} ${style.voiceIconRadio}`} />}
                </div>
            )}
        </div>
    );
};

export default observer(MainHUD);
