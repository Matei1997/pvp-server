/**
 * Combat integrity: server-side validation safeguards.
 * Does NOT change damage, recoil, or hitmarker logic.
 * Only adds safety validation (reject invalid hits, log suspicious behavior).
 */

/** Minimum ms between shots from same shooter (derived from RPM). Default 100ms = 600 RPM. */
const DEFAULT_MIN_SHOT_INTERVAL_MS = 100;
/** Default max hit distance (m) when weapon unknown. */
const DEFAULT_MAX_DISTANCE_M = 100;

/** Per-weapon RPM (rounds per minute). Used to compute min shot interval. */
const weaponRPM: Record<string, number> = {
    [String(mp.joaat("weapon_pistol"))]: 200,
    [String(mp.joaat("weapon_pistol_mk2"))]: 200,
    [String(mp.joaat("weapon_combatpistol"))]: 220,
    [String(mp.joaat("weapon_heavypistol"))]: 150,
    [String(mp.joaat("weapon_appistol"))]: 350,
    [String(mp.joaat("weapon_pistol50"))]: 140,
    [String(mp.joaat("weapon_microsmg"))]: 550,
    [String(mp.joaat("weapon_smg"))]: 450,
    [String(mp.joaat("weapon_assaultrifle"))]: 400,
    [String(mp.joaat("weapon_assaultrifle_mk2"))]: 400,
    [String(mp.joaat("weapon_carbinerifle"))]: 450,
    [String(mp.joaat("weapon_carbinerifle_mk2"))]: 450,
    [String(mp.joaat("weapon_specialcarbine"))]: 450,
    [String(mp.joaat("weapon_bullpuprifle"))]: 450,
    [String(mp.joaat("weapon_advancedrifle"))]: 500,
    [String(mp.joaat("weapon_sniperrifle"))]: 35,
    [String(mp.joaat("weapon_heavysniper"))]: 30,
    [String(mp.joaat("weapon_heavysniper_mk2"))]: 30,
    [String(mp.joaat("weapon_pumpshotgun"))]: 60,
    [String(mp.joaat("weapon_sawnoffshotgun"))]: 90,
    [String(mp.joaat("weapon_assaultshotgun"))]: 120,
    [String(mp.joaat("weapon_combatshotgun"))]: 100,
    [String(mp.joaat("weapon_mg"))]: 500,
    [String(mp.joaat("weapon_combatmg"))]: 550,
    [String(mp.joaat("weapon_combatpdw"))]: 450,
    [String(mp.joaat("weapon_compactrifle"))]: 450
};

/** Per-weapon max valid hit distance (m). Reject hits beyond this. */
const weaponMaxDistance: Record<string, number> = {
    [String(mp.joaat("weapon_pistol"))]: 120,
    [String(mp.joaat("weapon_pistol_mk2"))]: 120,
    [String(mp.joaat("weapon_combatpistol"))]: 120,
    [String(mp.joaat("weapon_heavypistol"))]: 120,
    [String(mp.joaat("weapon_appistol"))]: 120,
    [String(mp.joaat("weapon_pistol50"))]: 120,
    [String(mp.joaat("weapon_microsmg"))]: 150,
    [String(mp.joaat("weapon_smg"))]: 150,
    [String(mp.joaat("weapon_assaultrifle"))]: 300,
    [String(mp.joaat("weapon_assaultrifle_mk2"))]: 300,
    [String(mp.joaat("weapon_carbinerifle"))]: 300,
    [String(mp.joaat("weapon_carbinerifle_mk2"))]: 300,
    [String(mp.joaat("weapon_specialcarbine"))]: 300,
    [String(mp.joaat("weapon_bullpuprifle"))]: 300,
    [String(mp.joaat("weapon_advancedrifle"))]: 300,
    [String(mp.joaat("weapon_sniperrifle"))]: 400,
    [String(mp.joaat("weapon_heavysniper"))]: 450,
    [String(mp.joaat("weapon_heavysniper_mk2"))]: 450,
    [String(mp.joaat("weapon_pumpshotgun"))]: 80,
    [String(mp.joaat("weapon_sawnoffshotgun"))]: 60,
    [String(mp.joaat("weapon_assaultshotgun"))]: 80,
    [String(mp.joaat("weapon_combatshotgun"))]: 80,
    [String(mp.joaat("weapon_mg"))]: 350,
    [String(mp.joaat("weapon_combatmg"))]: 350,
    [String(mp.joaat("weapon_combatpdw"))]: 150,
    [String(mp.joaat("weapon_compactrifle"))]: 250
};

function getMaxDistanceForWeapon(weaponHash: string): number {
    const explicit = weaponMaxDistance[weaponHash];
    if (explicit !== undefined) return explicit;
    return DEFAULT_MAX_DISTANCE_M;
}

function getMinShotIntervalMs(weaponHash: string): number {
    const rpm = weaponRPM[weaponHash];
    if (!rpm || rpm <= 0) return DEFAULT_MIN_SHOT_INTERVAL_MS;
    return Math.round(60000 / rpm);
}

// --- Fire rate tracking ---
const lastShotTimeByShooter = new Map<number, number>();

// --- Duplicate hit guard: per victim per shooter ---
const lastHitByShooterVictim = new Map<string, number>();
const DUPLICATE_HIT_COOLDOWN_MS = 30;

function hitKey(shooterId: number, victimId: number): string {
    return `${shooterId}:${victimId}`;
}

// --- Suspicious headshot tracking (last 10 kills per shooter) ---
const lastKillsByShooter = new Map<number, { isHead: boolean }[]>();
const KILL_HISTORY_SIZE = 10;
const HEADSHOT_THRESHOLD = 0.9;
const SUSPICIOUS_SHORT_HIT_MS = 25;

export interface ValidationResult {
    allowed: boolean;
    reason?: string;
}

/**
 * Get time since shooter's last shot (ms). Returns -1 if no previous shot.
 */
export function getTimeSinceLastShot(shooterId: number): number {
    const last = lastShotTimeByShooter.get(shooterId);
    if (last === undefined) return -1;
    return Date.now() - last;
}

/**
 * Validate fire rate: reject if shooter hits faster than weapon RPM allows.
 */
export function validateFireRate(shooterId: number, weaponHash: string): ValidationResult {
    const now = Date.now();
    const last = lastShotTimeByShooter.get(shooterId);
    const minInterval = getMinShotIntervalMs(weaponHash);
    if (last !== undefined && now - last < minInterval) {
        return { allowed: false, reason: `fire_rate: hit ${now - last}ms after last (min ${minInterval}ms)` };
    }
    lastShotTimeByShooter.set(shooterId, now);
    return { allowed: true };
}

/**
 * Validate duplicate hit: reject if same shooter->victim hit within cooldown.
 */
export function validateDuplicateHit(shooterId: number, victimId: number): ValidationResult {
    const key = hitKey(shooterId, victimId);
    const now = Date.now();
    const last = lastHitByShooterVictim.get(key);
    if (last !== undefined && now - last < DUPLICATE_HIT_COOLDOWN_MS) {
        return { allowed: false, reason: `duplicate_hit: ${now - last}ms since last (cooldown ${DUPLICATE_HIT_COOLDOWN_MS}ms)` };
    }
    lastHitByShooterVictim.set(key, now);
    return { allowed: true };
}

/**
 * Validate distance: reject if hit beyond weapon max range.
 */
export function validateDistance(weaponHash: string, distance: number): ValidationResult {
    const max = getMaxDistanceForWeapon(weaponHash);
    if (distance > max) {
        return { allowed: false, reason: `distance: ${distance.toFixed(1)}m exceeds max ${max}m` };
    }
    return { allowed: true };
}

/**
 * Record a kill for headshot ratio tracking. Call when a hit results in death.
 * Logs if >90% of last 10 kills were headshots (debug only, no ban).
 */
export function recordKill(shooterId: number, shooterName: string, victimName: string, isHead: boolean): void {
    let history = lastKillsByShooter.get(shooterId);
    if (!history) {
        history = [];
        lastKillsByShooter.set(shooterId, history);
    }
    history.push({ isHead });
    if (history.length > KILL_HISTORY_SIZE) history.shift();

    const headCount = history.filter((h) => h.isHead).length;
    const headRatio = history.length >= 5 ? headCount / history.length : 0;

    if (headRatio > HEADSHOT_THRESHOLD && history.length >= 5) {
        console.warn(
            `[CombatIntegrity] Suspicious headshot ratio: ${shooterName} (${shooterId}) has ${headCount}/${history.length} headshot kills (>${HEADSHOT_THRESHOLD * 100}%)`
        );
    }
}

/**
 * Log suspiciously short time between hits (debug only). Call when a hit is accepted.
 * If time since last shot is < 25ms, something may be wrong (e.g. config bug).
 */
export function logSuspiciousShortInterval(
    shooterId: number,
    shooterName: string,
    victimName: string,
    timeSinceLastShot: number
): void {
    if (timeSinceLastShot > 0 && timeSinceLastShot < SUSPICIOUS_SHORT_HIT_MS) {
        console.warn(
            `[CombatIntegrity] Suspicious short hit interval: ${shooterName} (${shooterId}) hit ${victimName} ${timeSinceLastShot}ms after last shot`
        );
    }
}

/**
 * Called when a player disconnects. Cleans up tracking.
 */
export function clearPlayerCombatTracking(playerId: number): void {
    lastShotTimeByShooter.delete(playerId);
    lastKillsByShooter.delete(playerId);
    const keysToDelete = [...lastHitByShooterVictim.keys()].filter(
        (k) => k.startsWith(`${playerId}:`) || k.endsWith(`:${playerId}`)
    );
    keysToDelete.forEach((k) => lastHitByShooterVictim.delete(k));
}
