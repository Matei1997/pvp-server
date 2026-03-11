/**
 * Client-side damage sync: hit detection via playerWeaponShot,
 * sends server:PlayerHit (one per bullet via throttle), applies client:GiveDamage from server.
 */

/** One hit per target per 120ms so one bullet doesn't send 10 hits (playerWeaponShot can fire multiple times) */
const HIT_THROTTLE_MS = 120;
const lastHitSent = new Map<number, number>();

interface DamagePart {
    name: string;
    id: number;
    size: number;
}

const PARTS: DamagePart[] = [
    { name: "Head", id: 31086, size: 0.4 },
    { name: "Left_Clavicle", id: 64729, size: 0.25 },
    { name: "Right_Clavicle", id: 10706, size: 0.25 },
    { name: "Upper_Arm Right", id: 40269, size: 0.25 },
    { name: "Upper_Arm Left", id: 45509, size: 0.25 },
    { name: "Lower_Arm Right", id: 28252, size: 0.25 },
    { name: "Lower_Arm Left", id: 61163, size: 0.25 },
    { name: "Spine_1", id: 24816, size: 0.25 },
    { name: "Spine_3", id: 24818, size: 0.25 },
    { name: "Right_Tigh", id: 51826, size: 0.25 },
    { name: "Left_Tigh", id: 58271, size: 0.25 },
    { name: "Right_Calf", id: 36864, size: 0.25 },
    { name: "Left_Calf", id: 63931, size: 0.25 },
    { name: "Right_Food", id: 52301, size: 0.25 },
    { name: "Left_Food", id: 14201, size: 0.25 }
];

function getDistanceFrom(target: PlayerMp, boneId: number, from: { x: number; y: number; z: number }): number {
    const bone = target.getBoneCoords(boneId, 0, 0, 0);
    return mp.game.system.vdist(bone.x, bone.y, bone.z, from.x, from.y, from.z);
}

function getHitBone(position: { x: number; y: number; z: number }, target: PlayerMp): string {
    let bestDist = 10;
    let bestPart: DamagePart | null = null;
    for (const p of PARTS) {
        const d = getDistanceFrom(target, p.id, position);
        if (d < bestDist) {
            bestDist = d;
            bestPart = p;
        }
    }
    if (bestPart && bestDist < (target.vehicle ? bestPart.size + 0.3 : bestPart.size)) return bestPart.name;
    return "Spine_1";
}

mp.events.add("playerWeaponShot", (targetPosition: { x: number; y: number; z: number }, targetEntity: EntityMp) => {
    if (!targetEntity || targetEntity.type !== "player") return;
    const target = targetEntity as PlayerMp;
    if (target === mp.players.local) return;
    if (!mp.players.exists(target)) return;

    const now = Date.now();
    const last = lastHitSent.get(target.remoteId) ?? 0;
    if (now - last < HIT_THROTTLE_MS) return;
    lastHitSent.set(target.remoteId, now);

    const bone = getHitBone(targetPosition, target);
    const weaponHash = mp.players.local.weapon.toString();
    mp.events.callRemote("server:PlayerHit", target.remoteId, bone, weaponHash);
});

mp.events.add("client:GiveDamage", (amount: number, x: number, y: number, z: number) => {
    // spawnProtection removed so freeroam damage applies; use server-side spawn protection if needed
    let remaining = amount;
    const armour = mp.players.local.armour;
    if (armour > 0) {
        const toArmour = Math.min(armour, remaining);
        mp.players.local.armour = Math.max(0, armour - toArmour);
        remaining -= toArmour;
    }
    if (remaining > 0 && mp.players.local.health > 0) {
        mp.players.local.applyDamageTo(remaining, false);
    }
});
