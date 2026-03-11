/**
 * Client-side recoil (kc_weapon-style): per-weapon pitch kick applied over frames.
 * Recoil = camera moves UP (add to relative pitch). Skip when scoped (view mode 4).
 * Server attachment modifier applied via client::recoil:setModifier.
 */

import { Browser } from "@classes/Browser.class";

const UNARMED_HASH = 2725352035;

/** Scope view mode: skip pitch recoil so scoped snipers aren't double-kicked. */
const VIEW_MODE_FIRST_PERSON_SCOPE = 4;

/** Per-weapon recoil strength (kc_weapon values). Unknown weapons use DEFAULT_RECOIL. */
const WEAPON_RECOIL: Record<number, number> = {
    453432689: 0.3,      // PISTOL
    3219281620: 0.3,    // PISTOL MK2
    1593441988: 0.2,    // COMBAT PISTOL
    584646201: 0.1,     // AP PISTOL
    2578377531: 0.6,    // PISTOL .50
    324215364: 0.2,     // MICRO SMG
    736523883: 0.1,     // SMG
    2024373456: 0.1,    // SMG MK2
    4024951519: 0.1,    // ASSAULT SMG
    3220176749: 0.2,    // ASSAULT RIFLE
    961495388: 0.2,     // ASSAULT RIFLE MK2
    2210333304: 0.1,    // CARBINE RIFLE
    4208062921: 0.1,    // CARBINE RIFLE MK2
    2937143193: 0.1,    // ADVANCED RIFLE
    2634544996: 0.1,    // MG
    2144741730: 0.1,    // COMBAT MG
    3686625920: 0.1,    // COMBAT MG MK2
    487013001: 0.4,     // PUMP SHOTGUN
    2017895192: 0.7,    // SAWNOFF SHOTGUN
    3800352039: 0.4,    // ASSAULT SHOTGUN
    2640438543: 0.2,    // BULLPUP SHOTGUN
    100416529: 0.5,     // SNIPER RIFLE
    205991906: 0.7,     // HEAVY SNIPER
    177293209: 0.7,     // HEAVY SNIPER MK2
    3523564046: 0.5,    // HEAVY PISTOL
    3231910285: 0.2,    // SPECIAL CARBINE
    2132975508: 0.2,    // BULLPUP RIFLE
    171789620: 0.2,     // COMBAT PDW
    3675956304: 0.3,    // MACHINE PISTOL
    3249783761: 0.6,    // REVOLVER
    4019527611: 0.7,    // DOUBLE BARREL SHOTGUN
    1649403952: 0.3,    // COMPACT RIFLE
    317205821: 0.2,     // AUTO SHOTGUN
    3173288789: 0.1,    // MINI SMG
    3218215474: 0.2,    // SNS PISTOL
    984333226: 0.2,     // HEAVY SHOTGUN
    3342088282: 0.3,    // MARKSMAN RIFLE
    1785463520: 0.35,   // MARKSMAN RIFLE MK2
    1198879012: 0.9,    // FLARE GUN
    3696079510: 0.9,    // MARKSMAN PISTOL
    1834241177: 2.4,    // RAILGUN
    1627465347: 0.1,    // GUSENBERG
    137902532: 0.4,     // VINTAGE PISTOL
    2828843422: 0.7,    // MUSKET
};
const DEFAULT_RECOIL = 0.15;

/** Applied per frame (kc_weapon uses 0.4); lower = smoother. */
const RECOIL_STEP = 0.35;
/** Smoothing for SetGameplayCamRelativePitch (kc_weapon uses 0.6). */
const PITCH_SMOOTHING = 0.6;
/** Optional camera shake on shot (0 = off). */
const SHAKE_INTENSITY = 0.04;

let recoilModifier = 1.0;
let lastAmmo = 0;
let lastWeapon = 0;
let pendingPitch = 0;

mp.events.add("client::recoil:setModifier", (modifier: number) => {
    recoilModifier = modifier;
});

mp.events.add("client::recoil:reset", () => {
    recoilModifier = 1.0;
});

mp.events.add("render", () => {
    const player = mp.players.local;
    if (!player || !mp.players.exists(player)) return;
    if (player.getHealth() <= 0) return;
    if (player.vehicle) return;
    if (Browser.currentPage === "arena_hud") return; // Optional: disable in hopouts if it still feels off

    const weapon = player.weapon;
    if (weapon === UNARMED_HASH) {
        lastWeapon = weapon;
        lastAmmo = 0;
        pendingPitch = 0;
        return;
    }

    const ammo = player.getAmmoInClip(weapon);
    const cam = mp.game.cam;

    if (weapon !== lastWeapon) {
        lastWeapon = weapon;
        lastAmmo = ammo;
        pendingPitch = 0;
        return;
    }

    // Shot detected: add recoil (pitch UP = positive)
    if (ammo < lastAmmo && lastAmmo > 0) {
        const recoilVal = WEAPON_RECOIL[weapon] ?? DEFAULT_RECOIL;
        if (recoilVal > 0) {
            pendingPitch += recoilVal * recoilModifier;
            if (SHAKE_INTENSITY > 0 && typeof cam.shakeGameplay === "function") {
                cam.shakeGameplay("SMALL_EXPLOSION_SHAKE", SHAKE_INTENSITY * recoilVal);
            }
        }
    }

    // Apply pending recoil over frames (kc_weapon: add pitch each frame until done)
    if (pendingPitch > 0 && typeof cam.getGameplayRelativePitch === "function" && typeof cam.setGameplayRelativePitch === "function") {
        const viewMode = typeof cam.getFollowPedViewMode === "function" ? cam.getFollowPedViewMode() : 0;
        if (viewMode !== VIEW_MODE_FIRST_PERSON_SCOPE) {
            const step = Math.min(pendingPitch, RECOIL_STEP);
            const current = cam.getGameplayRelativePitch();
            cam.setGameplayRelativePitch(current + step, PITCH_SMOOTHING);
            pendingPitch -= step;
        } else {
            pendingPitch = 0;
        }
    }

    lastAmmo = ammo;
});
