/**
 * Death recap: track combat damage per victim for PvP death recap panel.
 * Records damage dealt TO each victim and damage dealt BY each victim.
 * Does NOT change combat logic — only records for UI.
 */

export interface CombatHit {
    victimId: number;
    attackerId: number;
    weaponHash: string;
    damage: number;
    bone: string;
    timestamp: number;
}

export interface DamageDealt {
    damagerId: number;
    targetId: number;
    damage: number;
    timestamp: number;
}

export interface DeathRecapPayload {
    killerId: number;
    killerName: string;
    weaponHash: string;
    weaponName?: string;
    totalDamage: number;
    hits: number;
    headshots: number;
    /** True if the killing blow hit the head. */
    headshot: boolean;
    victimDamageToKiller: number;
}

const MAX_HITS_PER_VICTIM = 30;
const hitsToVictim = new Map<number, CombatHit[]>();
const damageDealtByPlayer = new Map<string, { damage: number }>();

function damageKey(damagerId: number, targetId: number): string {
    return `${damagerId}:${targetId}`;
}

/** Record when attacker damages victim. Call from DamageSync after damage is applied. */
export function recordDamageToVictim(
    victimId: number,
    attackerId: number,
    weaponHash: string,
    damage: number,
    bone: string
): void {
    let list = hitsToVictim.get(victimId);
    if (!list) {
        list = [];
        hitsToVictim.set(victimId, list);
    }
    list.push({
        victimId,
        attackerId,
        weaponHash,
        damage,
        bone,
        timestamp: Date.now()
    });
    if (list.length > MAX_HITS_PER_VICTIM) list.shift();
}

/** Record when damager damages target (for victimDamageToKiller). */
export function recordDamageDealt(damagerId: number, targetId: number, damage: number): void {
    const key = damageKey(damagerId, targetId);
    const existing = damageDealtByPlayer.get(key);
    if (existing) {
        existing.damage += damage;
    } else {
        damageDealtByPlayer.set(key, { damage });
    }
}

/** Build death recap for victim killed by killer. Returns null if no data. */
export function buildDeathRecap(
    victimId: number,
    killerId: number | undefined,
    killerName: string
): DeathRecapPayload | null {
    const hits = hitsToVictim.get(victimId);
    if (!hits || hits.length === 0) {
        if (killerId !== undefined && killerName) {
            return {
                killerId,
                killerName,
                weaponHash: "0",
                totalDamage: 0,
                hits: 0,
                headshots: 0,
                headshot: false,
                victimDamageToKiller: getVictimDamageToKiller(victimId, killerId)
            };
        }
        return null;
    }

    const killerHits = killerId !== undefined ? hits.filter((h) => h.attackerId === killerId) : hits;
    const lastHit = killerHits.length > 0 ? killerHits[killerHits.length - 1] : hits[hits.length - 1];
    const totalDamage = killerHits.reduce((sum, h) => sum + h.damage, 0);
    const headshots = killerHits.filter((h) => h.bone === "Head").length;
    const headshot = lastHit.bone === "Head";

    return {
        killerId: lastHit.attackerId,
        killerName: killerName || "Unknown",
        weaponHash: lastHit.weaponHash,
        totalDamage,
        hits: killerHits.length,
        headshots,
        headshot,
        victimDamageToKiller: getVictimDamageToKiller(victimId, lastHit.attackerId)
    };
}

function getVictimDamageToKiller(victimId: number, killerId: number): number {
    const key = damageKey(victimId, killerId);
    const entry = damageDealtByPlayer.get(key);
    return entry?.damage ?? 0;
}

/** Clear victim data (round end, match end, disconnect). */
export function clearVictim(victimId: number): void {
    hitsToVictim.delete(victimId);
    for (const key of damageDealtByPlayer.keys()) {
        if (key.startsWith(`${victimId}:`) || key.endsWith(`:${victimId}`)) {
            damageDealtByPlayer.delete(key);
        }
    }
}

/** Clear all (match end). */
export function clearAll(): void {
    hitsToVictim.clear();
    damageDealtByPlayer.clear();
}
