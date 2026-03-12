import * as React from "react";
import { observer } from "mobx-react-lite";
import style from "./DeathRecapCard.module.scss";

export interface DeathRecapData {
    killerName: string;
    weaponName: string;
    totalDamage: number;
    hits: number;
    headshots: number;
    victimDamageToKiller: number;
}

interface DeathRecapCardProps {
    recap: DeathRecapData;
}

function formatWeaponDisplay(name: string): string {
    if (!name || name === "0" || name === "Unknown") return "Unknown";
    return name.replace(/^weapon_/, "").replace(/_/g, " ");
}

export const DeathRecapCard: React.FC<DeathRecapCardProps> = observer(({ recap }) => {
    const weaponImgSrc = recap.weaponName && recap.weaponName !== "0" && recap.weaponName !== "Unknown"
        ? new URL(`../../../assets/images/hud/weapons/${recap.weaponName}.svg`, import.meta.url).href
        : null;

    return (
        <div className={style.deathRecapCard}>
            <h2 className={style.title}>You were eliminated</h2>
            <div className={style.content}>
                <div className={style.killerRow}>
                    <span className={style.label}>Killer</span>
                    <span className={style.killerName}>{recap.killerName || "Unknown"}</span>
                </div>
                <div className={style.weaponRow}>
                    <span className={style.label}>Weapon</span>
                    <div className={style.weaponHighlight}>
                        {weaponImgSrc ? (
                            <img src={weaponImgSrc} alt="" className={style.weaponIcon} />
                        ) : null}
                        <span>{formatWeaponDisplay(recap.weaponName)}</span>
                    </div>
                </div>
                <div className={style.stats}>
                    <div className={style.stat}>
                        <span className={style.statValue}>{recap.totalDamage.toFixed(1)}</span>
                        <span className={style.statLabel}>Damage</span>
                    </div>
                    <div className={style.stat}>
                        <span className={style.statValue}>{recap.hits}</span>
                        <span className={style.statLabel}>Hits</span>
                    </div>
                    <div className={style.stat}>
                        <span className={style.statValue}>{recap.headshots}</span>
                        <span className={style.statLabel}>Headshots</span>
                    </div>
                    {recap.victimDamageToKiller > 0 && (
                        <div className={style.stat}>
                            <span className={style.statValue}>{recap.victimDamageToKiller.toFixed(1)}</span>
                            <span className={style.statLabel}>Damage dealt back</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
