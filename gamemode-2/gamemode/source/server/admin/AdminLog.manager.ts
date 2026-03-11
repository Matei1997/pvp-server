interface DamageLogEntry {
    timestamp: number;
    attackerId: number;
    attackerName: string;
    victimId: number;
    victimName: string;
    weaponHash: string;
    damage: number;
    distance: number;
    inArena: boolean;
}

interface KillLogEntry {
    timestamp: number;
    killerId: number | null;
    killerName: string | null;
    victimId: number;
    victimName: string;
    reason: number | null;
    inArena: boolean;
}

const MAX_LOG_ENTRIES = 5000;

const damageLogs: DamageLogEntry[] = [];
const killLogs: KillLogEntry[] = [];

function pushBounded<T>(arr: T[], entry: T) {
    arr.push(entry);
    if (arr.length > MAX_LOG_ENTRIES) {
        arr.shift();
    }
}

export function logDamageHit(params: {
    attacker: PlayerMp;
    victim: PlayerMp;
    weaponHash: string;
    damage: number;
    distance: number;
    inArena: boolean;
}) {
    const { attacker, victim, weaponHash, damage, distance, inArena } = params;
    if (!attacker || !victim) return;

    pushBounded(damageLogs, {
        timestamp: Date.now(),
        attackerId: attacker.id,
        attackerName: attacker.name,
        victimId: victim.id,
        victimName: victim.name,
        weaponHash,
        damage,
        distance,
        inArena
    });
}

export function logKill(params: {
    killer: PlayerMp | undefined;
    victim: PlayerMp;
    reason: number | null;
    inArena: boolean;
}) {
    const { killer, victim, reason, inArena } = params;
    if (!victim) return;

    pushBounded(killLogs, {
        timestamp: Date.now(),
        killerId: killer ? killer.id : null,
        killerName: killer ? killer.name : null,
        victimId: victim.id,
        victimName: victim.name,
        reason,
        inArena
    });
}

function matchPlayer(entryPlayerId: number, target: PlayerMp): boolean {
    return entryPlayerId === target.id;
}

export function getRecentDamageLogsFor(player: PlayerMp, limit: number = 20): DamageLogEntry[] {
    const targetId = player.id;
    const relevant = damageLogs.filter(
        (e) => e.attackerId === targetId || e.victimId === targetId
    );
    return relevant.slice(-limit);
}

export function getRecentKillLogsFor(player: PlayerMp, limit: number = 20): KillLogEntry[] {
    const targetId = player.id;
    const relevant = killLogs.filter(
        (e) => (e.killerId !== null && matchPlayer(e.killerId, player)) || e.victimId === targetId
    );
    return relevant.slice(-limit);
}

