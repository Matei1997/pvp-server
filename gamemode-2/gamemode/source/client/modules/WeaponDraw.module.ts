/**
 * Plays a short draw/holster animation when the local player switches or draws a weapon.
 */

const UNARMED = mp.game.joaat("weapon_unarmed");
const PISTOL_GROUP = mp.game.weapon.getWeapontypeGroup(mp.game.joaat("weapon_pistol"));

const PISTOL_DRAW = { dict: "anim@weapons@pistol@std@pistol@", name: "holster_2_aim" };
const RIFLE_DRAW = { dict: "anim@weapons@rifle@std@rifle@", name: "holster_2_aim" };

/** Duration ms to play the draw anim (-1 = full anim once). */
const DRAW_DURATION_MS = 800;
/** Upper body only (16) + allow player control (32). */
const ANIM_FLAG = 48;

let lastWeapon: number = UNARMED;

function getDrawAnim(weapon: number): { dict: string; name: string } | null {
    if (weapon === UNARMED) return null;
    const group = mp.game.weapon.getWeapontypeGroup(weapon);
    return group === PISTOL_GROUP ? PISTOL_DRAW : RIFLE_DRAW;
}

function requestAnimDict(dict: string): Promise<boolean> {
    return new Promise((resolve) => {
        if (mp.game.streaming.hasAnimDictLoaded(dict)) {
            resolve(true);
            return;
        }
        mp.game.streaming.requestAnimDict(dict);
        const deadline = Date.now() + 2000;
        const t = setInterval(() => {
            if (mp.game.streaming.hasAnimDictLoaded(dict)) {
                clearInterval(t);
                resolve(true);
            } else if (Date.now() > deadline) {
                clearInterval(t);
                resolve(false);
            }
        }, 50);
    });
}

function playDrawAnimation(anim: { dict: string; name: string }): void {
    const ped = mp.players.local;
    if (!ped || ped.vehicle || !mp.game.streaming.hasAnimDictLoaded(anim.dict)) return;
    ped.taskPlayAnim(anim.dict, anim.name, 8, -8, DRAW_DURATION_MS, ANIM_FLAG, 0, false, false, false);
}

function onWeaponChanged(newWeapon: number): void {
    if (newWeapon === lastWeapon) return;
    lastWeapon = newWeapon;

    if (newWeapon === UNARMED) return; // holster: could add holster anim later
    if (mp.players.local.vehicle) return;

    const anim = getDrawAnim(newWeapon);
    if (!anim) return;

    requestAnimDict(anim.dict).then((ok) => {
        if (ok) playDrawAnimation(anim);
    });
}

mp.events.add("render", () => {
    const w = mp.players.local?.weapon;
    if (w === undefined) return;
    onWeaponChanged(w);
});
