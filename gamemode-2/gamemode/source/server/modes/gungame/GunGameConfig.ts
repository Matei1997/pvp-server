import { weaponHash } from "@assets/Weapons.assets";

export const GUNGAME_CONFIG = {
    maxPlayers: 8,
    minPlayersToStart: 2,
    respawnDelaySeconds: 3
};

/**
 * Curated Gun Game weapon pool. Sensible PvP weapons only.
 * Excludes: explosives, heavy grief (minigun, railgun), utility (stungun, flaregun), non-combat.
 * Order here is irrelevant — shuffled at match start.
 */
export const GUNGAME_WEAPON_POOL: number[] = [
    weaponHash.knife,
    weaponHash.hatchet,
    weaponHash.dagger,
    weaponHash.machete,
    weaponHash.bat,
    weaponHash.crowbar,
    weaponHash.pistol,
    weaponHash.combatpistol,
    weaponHash.pistol50,
    weaponHash.heavypistol,
    weaponHash.revolver,
    weaponHash.snspistol,
    weaponHash.microsmg,
    weaponHash.smg,
    weaponHash.assaultsmg,
    weaponHash.combatpdw,
    weaponHash.machinepistol,
    weaponHash.pumpshotgun,
    weaponHash.sawnoffshotgun,
    weaponHash.bullpupshotgun,
    weaponHash.assaultshotgun,
    weaponHash.assaultrifle,
    weaponHash.carbinerifle,
    weaponHash.specialcarbine,
    weaponHash.bullpuprifle,
    weaponHash.advancedrifle,
    weaponHash.mg,
    weaponHash.combatmg,
    weaponHash.sniperrifle,
    weaponHash.heavysniper,
    weaponHash.marksmanrifle
];

export const GUNGAME_AMMO = 999;

/** Fisher-Yates shuffle. Returns new array. */
export function shuffleWeaponPool(pool: number[]): number[] {
    const out = [...pool];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}
