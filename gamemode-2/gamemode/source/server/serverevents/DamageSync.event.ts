import { Utils } from "@shared/utils.module";
import { getRewindPosition } from "@modules/combat/SnapshotManager";
import {
    validateFireRate,
    validateDuplicateHit,
    validateDistance,
    recordKill,
    logSuspiciousShortInterval,
    getTimeSinceLastShot
} from "@modules/combat/CombatIntegrity";
import { RAGERP } from "@api";
import { getMatchByPlayer, getTeam, handleArenaDeath } from "@arena/ArenaMatch.manager";
import { getFfaMatchByPlayer, handleFfaDeath } from "@modes/ffa/FfaMatch.manager";
import { getGunGameMatchByPlayer, handleGunGameDeath } from "@modes/gungame/GunGameMatch.manager";
import { logDamageHit } from "../admin/AdminLog.manager";
import { recordDamageToVictim, recordDamageDealt } from "@modules/combat/DeathRecapTracker";

type DamageDirection = "left" | "right" | "front" | "behind";

function getDamageDirection(victim: PlayerMp, shooter: PlayerMp): DamageDirection {
    const dx = shooter.position.x - victim.position.x;
    const dy = shooter.position.y - victim.position.y;
    const angleToShooter = (Math.atan2(dx, dy) * 180) / Math.PI;
    const victimHeading = victim.heading;
    let relative = ((angleToShooter - victimHeading) % 360 + 360) % 360;
    if (relative > 180) relative -= 360;
    if (relative >= -45 && relative <= 45) return "front";
    if (relative > 45 && relative < 135) return "right";
    if (relative >= 135 || relative <= -135) return "behind";
    return "left";
}

const DEFAULT_BONE_MULT = 1;
const DEFAULT_WEAPON_BASE = 28;
const DEFAULT_WEAPON_MIN = 10;
/** Default effective range (m): damage = base inside this, then falls off with distance. */
const DEFAULT_EFFECTIVE_RANGE = 35;
/** Arena: scale so TTK varies by weapon (stronger guns kill in fewer shots). */
const ARENA_DAMAGE_MULT = 0.75;
/** Arena: base for per-weapon cap; cap = min(25, ARENA_CAP_BASE + weaponBase * 0.5) so .50 hits harder than carbine. */
const ARENA_CAP_BASE = 8;
const ARENA_CAP_MAX = 25;

const boneMultipliers: Record<string, number> = {
    Head: 1.5,
    Neck: 1.5,
    Left_Clavicle: 1,
    Right_Clavicle: 1,
    "Upper_Arm Right": 1,
    "Upper_Arm Left": 1,
    "Lower_Arm Right": 1,
    "Lower_Arm Left": 1,
    Spine_1: 1,
    Spine_3: 1,
    Right_Tigh: 1,
    Left_Tigh: 1,
    Right_Calf: 1,
    Left_Calf: 1,
    Right_Food: 1,
    Left_Food: 1
};

// Per-weapon damage: base/min for body, effectiveRange (m) for falloff. Head = 1.5x, no one-shot head.
// Inside effectiveRange = full base damage; beyond it, damage = base * effectiveRange / distance (clamped to min).
const weaponDamage: Record<string, { base: number; min: number; effectiveRange?: number }> = {
    [String(mp.joaat("weapon_pistol"))]: { base: 18, min: 9, effectiveRange: 18 },
    [String(mp.joaat("weapon_pistol_mk2"))]: { base: 20, min: 10, effectiveRange: 20 },
    [String(mp.joaat("weapon_combatpistol"))]: { base: 20, min: 10, effectiveRange: 20 },
    [String(mp.joaat("weapon_heavypistol"))]: { base: 22, min: 10, effectiveRange: 22 },
    [String(mp.joaat("weapon_appistol"))]: { base: 16, min: 8, effectiveRange: 15 },
    [String(mp.joaat("weapon_pistol50"))]: { base: 24, min: 12, effectiveRange: 25 },
    [String(mp.joaat("weapon_microsmg"))]: { base: 14, min: 8, effectiveRange: 18 },
    [String(mp.joaat("weapon_smg"))]: { base: 16, min: 10, effectiveRange: 22 },
    [String(mp.joaat("weapon_assaultrifle"))]: { base: 22, min: 10, effectiveRange: 45 },
    [String(mp.joaat("weapon_assaultrifle_mk2"))]: { base: 24, min: 10, effectiveRange: 50 },
    [String(mp.joaat("weapon_carbinerifle"))]: { base: 22, min: 8, effectiveRange: 45 },
    [String(mp.joaat("weapon_carbinerifle_mk2"))]: { base: 24, min: 10, effectiveRange: 50 },
    [String(mp.joaat("weapon_specialcarbine"))]: { base: 22, min: 10, effectiveRange: 42 },
    [String(mp.joaat("weapon_bullpuprifle"))]: { base: 22, min: 10, effectiveRange: 40 },
    [String(mp.joaat("weapon_advancedrifle"))]: { base: 22, min: 10, effectiveRange: 45 },
    [String(mp.joaat("weapon_sniperrifle"))]: { base: 55, min: 35, effectiveRange: 100 },
    [String(mp.joaat("weapon_heavysniper"))]: { base: 55, min: 45, effectiveRange: 120 },
    [String(mp.joaat("weapon_heavysniper_mk2"))]: { base: 65, min: 50, effectiveRange: 130 },
    [String(mp.joaat("weapon_pumpshotgun"))]: { base: 45, min: 35, effectiveRange: 20 },
    [String(mp.joaat("weapon_sawnoffshotgun"))]: { base: 40, min: 30, effectiveRange: 12 },
    [String(mp.joaat("weapon_assaultshotgun"))]: { base: 35, min: 25, effectiveRange: 22 },
    [String(mp.joaat("weapon_combatshotgun"))]: { base: 40, min: 30, effectiveRange: 25 },
    [String(mp.joaat("weapon_mg"))]: { base: 18, min: 12, effectiveRange: 55 },
    [String(mp.joaat("weapon_combatmg"))]: { base: 18, min: 14, effectiveRange: 60 },
    [String(mp.joaat("weapon_combatpdw"))]: { base: 16, min: 10, effectiveRange: 28 },
    [String(mp.joaat("weapon_compactrifle"))]: { base: 20, min: 10, effectiveRange: 35 }
};

function getBoneMultiplier(bone: string): number {
    return boneMultipliers[bone] ?? DEFAULT_BONE_MULT;
}

function getWeaponDamage(weaponHash: string, distance: number): number {
    const w = weaponDamage[weaponHash] ?? { base: DEFAULT_WEAPON_BASE, min: DEFAULT_WEAPON_MIN, effectiveRange: DEFAULT_EFFECTIVE_RANGE };
    const range = w.effectiveRange ?? DEFAULT_EFFECTIVE_RANGE;
    let dmg: number;
    if (distance <= range) {
        dmg = w.base;
    } else {
        dmg = (w.base * range) / distance;
        if (dmg < w.min) dmg = w.min;
    }
    return Math.round(dmg * 10) / 10;
}

mp.events.add("server:PlayerHit", (shooter: PlayerMp, victimId: number, targetBone: string, weaponHash: string) => {
    if (!shooter || !mp.players.exists(shooter)) return;
    const victim = mp.players.at(victimId);
    if (!victim || !mp.players.exists(victim)) return;
    if (shooter.id === victim.id) return;

    const timeSinceLastShot = getTimeSinceLastShot(shooter.id);

    // Combat integrity: fire rate validation
    const fireRateResult = validateFireRate(shooter.id, weaponHash);
    if (!fireRateResult.allowed) return;

    // Combat integrity: duplicate hit guard
    const duplicateResult = validateDuplicateHit(shooter.id, victim.id);
    if (!duplicateResult.allowed) return;

    // FFA / Gun Game: no teams, everyone can damage everyone
    const ffaMatch = getFfaMatchByPlayer(victim);
    const gunGameMatch = getGunGameMatchByPlayer(victim);
    if (ffaMatch || gunGameMatch) {
        if (shooter.dimension !== victim.dimension) return;
    } else {
        // Arena (Hopouts): no team damage
        const match = getMatchByPlayer(victim);
        if (match) {
            const victimTeam = getTeam(match, victim.id);
            const shooterTeam = getTeam(match, shooter.id);
            if (victimTeam && shooterTeam && victimTeam === shooterTeam) return;
            if (shooter.dimension !== victim.dimension) return;
        }
    }

    const shotTime = Date.now() - (shooter.ping / 2);
    const rewindVictimPos = getRewindPosition(victim.id, shotTime);
    const victimPosForDistance = rewindVictimPos ?? victim.position;
    const distance = Utils.distanceToPos(shooter.position, victimPosForDistance);

    // Combat integrity: distance sanity check
    const distanceResult = validateDistance(weaponHash, distance);
    if (!distanceResult.allowed) return;
    const isHead = targetBone === "Head";
    const hitStatus = isHead ? 3 : victim.armour > 0 ? 2 : 1; // 1=health, 2=armour, 3=head (before damage)
    const hitStatusStr = isHead ? "headshot" : victim.armour > 0 ? "armor" : "health";
    const weaponDmg = getWeaponDamage(weaponHash, Math.max(1, distance));
    const boneMult = getBoneMultiplier(targetBone); // Head = 1.5x, no one-shot head
    const finalDamage = Math.round(weaponDmg * boneMult * 10) / 10;

    let damageToShow = finalDamage;
    const hopoutsMatch = !ffaMatch ? getMatchByPlayer(victim) : null;
    // FFA: apply damage (same as arena), on death handleFfaDeath
    if (ffaMatch && ffaMatch.state === "active") {
        const w = weaponDamage[weaponHash] ?? { base: DEFAULT_WEAPON_BASE, min: DEFAULT_WEAPON_MIN };
        const cap = Math.min(25, 8 + w.base * 0.5);
        let dmgLeft = Math.round(finalDamage * 0.75 * 10) / 10;
        if (dmgLeft <= 0) dmgLeft = 1;
        dmgLeft = Math.min(dmgLeft, cap);
        damageToShow = dmgLeft;
        const effectiveHp = Math.max(0, ((victim.getVariable("arenaEffectiveHp") as number) ?? 100) - dmgLeft);
        victim.setVariable("arenaEffectiveHp", effectiveHp);
        if (victim.armour > 0) {
            const toArmour = Math.min(victim.armour, dmgLeft);
            victim.armour = Math.max(0, victim.armour - toArmour);
            dmgLeft -= toArmour;
        }
        if (dmgLeft > 0) {
            victim.health = Math.max(0, victim.health - dmgLeft);
        }
        if (effectiveHp <= 0) {
            recordKill(shooter.id, shooter.name, victim.name, isHead);
            handleFfaDeath(victim, shooter);
        }
        recordDamageToVictim(victim.id, shooter.id, weaponHash, dmgLeft, targetBone);
        recordDamageDealt(shooter.id, victim.id, dmgLeft);
        logSuspiciousShortInterval(shooter.id, shooter.name, victim.name, timeSinceLastShot);
        victim.call("client::player:setVitals", [victim.health, victim.armour]);
        RAGERP.cef.emit(victim, "arena", "damageDirection", { direction: getDamageDirection(victim, shooter) });
    } else if (gunGameMatch && gunGameMatch.state === "active") {
        const w = weaponDamage[weaponHash] ?? { base: DEFAULT_WEAPON_BASE, min: DEFAULT_WEAPON_MIN };
        const cap = Math.min(25, 8 + w.base * 0.5);
        let dmgLeft = Math.round(finalDamage * 0.75 * 10) / 10;
        if (dmgLeft <= 0) dmgLeft = 1;
        dmgLeft = Math.min(dmgLeft, cap);
        damageToShow = dmgLeft;
        const effectiveHp = Math.max(0, ((victim.getVariable("arenaEffectiveHp") as number) ?? 100) - dmgLeft);
        victim.setVariable("arenaEffectiveHp", effectiveHp);
        if (victim.armour > 0) {
            const toArmour = Math.min(victim.armour, dmgLeft);
            victim.armour = Math.max(0, victim.armour - toArmour);
            dmgLeft -= toArmour;
        }
        if (dmgLeft > 0) {
            victim.health = Math.max(0, victim.health - dmgLeft);
        }
        if (effectiveHp <= 0) {
            recordKill(shooter.id, shooter.name, victim.name, isHead);
            handleGunGameDeath(victim, shooter);
        }
        recordDamageToVictim(victim.id, shooter.id, weaponHash, dmgLeft, targetBone);
        recordDamageDealt(shooter.id, victim.id, dmgLeft);
        logSuspiciousShortInterval(shooter.id, shooter.name, victim.name, timeSinceLastShot);
        victim.call("client::player:setVitals", [victim.health, victim.armour]);
        RAGERP.cef.emit(victim, "arena", "damageDirection", { direction: getDamageDirection(victim, shooter) });
    } else if (hopoutsMatch && hopoutsMatch.state === "active") {
        const w = weaponDamage[weaponHash] ?? { base: DEFAULT_WEAPON_BASE, min: DEFAULT_WEAPON_MIN };
        const cap = Math.min(ARENA_CAP_MAX, ARENA_CAP_BASE + w.base * 0.5);
        let dmgLeft = Math.round(finalDamage * ARENA_DAMAGE_MULT * 10) / 10;
        if (dmgLeft <= 0) dmgLeft = 1;
        dmgLeft = Math.min(dmgLeft, cap);
        const damageThisHit = dmgLeft;
        damageToShow = damageThisHit;
        const effectiveHp = Math.max(0, ((victim.getVariable("arenaEffectiveHp") as number) ?? 100) - dmgLeft);
        victim.setVariable("arenaEffectiveHp", effectiveHp);
        if (victim.armour > 0) {
            const toArmour = Math.min(victim.armour, dmgLeft);
            victim.armour = Math.max(0, victim.armour - toArmour);
            dmgLeft -= toArmour;
        }
        if (dmgLeft > 0) {
            victim.health = Math.max(0, victim.health - dmgLeft);
        }
        if (effectiveHp <= 0) {
            recordKill(shooter.id, shooter.name, victim.name, isHead);
            handleArenaDeath(victim, shooter);
        }
        recordDamageToVictim(victim.id, shooter.id, weaponHash, damageThisHit, targetBone);
        recordDamageDealt(shooter.id, victim.id, damageThisHit);
        logSuspiciousShortInterval(shooter.id, shooter.name, victim.name, timeSinceLastShot);
        victim.call("client::player:setVitals", [victim.health, victim.armour]);
        RAGERP.cef.emit(victim, "arena", "damageDirection", { direction: getDamageDirection(victim, shooter) });
    } else {
        // Freeroam: apply damage on server so it actually registers (server-authoritative)
        let dmgLeft = finalDamage;
        if (victim.armour > 0) {
            const toArmour = Math.min(victim.armour, dmgLeft);
            victim.armour = Math.max(0, victim.armour - toArmour);
            dmgLeft -= toArmour;
        }
        if (dmgLeft > 0) {
            victim.health = Math.max(0, victim.health - dmgLeft);
        }
        if (victim.health <= 0) {
            recordKill(shooter.id, shooter.name, victim.name, isHead);
        }
        logSuspiciousShortInterval(shooter.id, shooter.name, victim.name, timeSinceLastShot);
        victim.call("client::player:setVitals", [victim.health, victim.armour]);
    }

    logDamageHit({
        attacker: shooter,
        victim,
        weaponHash,
        damage: finalDamage,
        distance,
        inArena: !!ffaMatch || !!gunGameMatch || !!hopoutsMatch
    });

    shooter.call("client:ShowHitmarker", [damageToShow, victim.position.x, victim.position.y, victim.position.z, hitStatus, hitStatusStr]);
});
