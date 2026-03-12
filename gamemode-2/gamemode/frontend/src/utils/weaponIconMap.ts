/**
 * Maps weapon names (e.g. weapon_pistol50) to kill feed icon URLs.
 * Used by KillFeed to display weapon icons. Fallback for unknown weapons.
 */

const WEAPON_ICON_MAP: Record<string, string> = {
    weapon_pistol50: new URL("../assets/images/hud/weapons/weapon_pistol50.svg", import.meta.url).href,
    weapon_pistol: new URL("../assets/images/hud/weapons/weapon_pistol.svg", import.meta.url).href,
    weapon_combatpistol: new URL("../assets/images/hud/weapons/weapon_combatpistol.svg", import.meta.url).href,
    weapon_heavypistol: new URL("../assets/images/hud/weapons/weapon_heavypistol.svg", import.meta.url).href,
    weapon_appistol: new URL("../assets/images/hud/weapons/weapon_appistol.svg", import.meta.url).href,
    weapon_snspistol: new URL("../assets/images/hud/weapons/weapon_snspistol.svg", import.meta.url).href,
    /* Arena rifles/shotgun: no SVGs yet — fallback used. Add when assets available:
       weapon_assaultrifle, weapon_specialcarbine, weapon_bullpuprifle, weapon_carbinerifle_mk2, weapon_pumpshotgun */
    weapon_knife: new URL("../assets/images/hud/weapons/weapon_knife.svg", import.meta.url).href,
    weapon_bat: new URL("../assets/images/hud/weapons/weapon_bat.svg", import.meta.url).href,
    weapon_crowbar: new URL("../assets/images/hud/weapons/weapon_crowbar.svg", import.meta.url).href,
    weapon_dagger: new URL("../assets/images/hud/weapons/weapon_dagger.svg", import.meta.url).href,
    weapon_hammer: new URL("../assets/images/hud/weapons/weapon_hammer.svg", import.meta.url).href,
    weapon_hatchet: new URL("../assets/images/hud/weapons/weapon_hatchet.svg", import.meta.url).href,
    weapon_golfclub: new URL("../assets/images/hud/weapons/weapon_golfclub.svg", import.meta.url).href,
    weapon_bottle: new URL("../assets/images/hud/weapons/weapon_bottle.svg", import.meta.url).href,
    weapon_poolcue: new URL("../assets/images/hud/weapons/weapon_poolcue.svg", import.meta.url).href,
    weapon_switchblade: new URL("../assets/images/hud/weapons/weapon_switchblade.svg", import.meta.url).href,
    weapon_flashlight: new URL("../assets/images/hud/weapons/weapon_flashlight.svg", import.meta.url).href,
    weapon_nightstick: new URL("../assets/images/hud/weapons/weapon_nightstick.svg", import.meta.url).href,
    weapon_wrench: new URL("../assets/images/hud/weapons/weapon_wrench.svg", import.meta.url).href,
    weapon_grenade: new URL("../assets/images/hud/weapons/weapon_grenade.svg", import.meta.url).href,
    weapon_stickybomb: new URL("../assets/images/hud/weapons/weapon_stickybomb.svg", import.meta.url).href,
    weapon_stungun: new URL("../assets/images/hud/weapons/weapon_stungun.svg", import.meta.url).href,
    weapon_ball: new URL("../assets/images/hud/weapons/weapon_ball.svg", import.meta.url).href,
    weapon_snowball: new URL("../assets/images/hud/weapons/weapon_snowball.svg", import.meta.url).href,
    weapon_bzgas: new URL("../assets/images/hud/weapons/weapon_bzgas.svg", import.meta.url).href,
    weapon_fireextinguisher: new URL("../assets/images/hud/weapons/weapon_fireextinguisher.svg", import.meta.url).href,
    weapon_flare: new URL("../assets/images/hud/weapons/weapon_flare.svg", import.meta.url).href,
    weapon_proxmine: new URL("../assets/images/hud/weapons/weapon_proxmine.svg", import.meta.url).href,
};

const FALLBACK_ICON = new URL("../assets/images/hud/weapons/weapon_pistol.svg", import.meta.url).href;

/** Get weapon icon URL for kill feed. Returns fallback if weapon unknown. */
export function getWeaponIconUrl(weaponName: string): string {
    if (!weaponName || weaponName === "0" || weaponName === "Unknown") return FALLBACK_ICON;
    return WEAPON_ICON_MAP[weaponName] ?? FALLBACK_ICON;
}
