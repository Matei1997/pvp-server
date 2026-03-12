/**
 * Minimal lag compensation: per-player position snapshot history.
 * Used to rewind victim position to shot time for distance validation.
 */

export interface PlayerSnapshot {
    t: number;
    pos: { x: number; y: number; z: number };
    dimension: number;
}

const MAX_SNAPSHOTS = 20;
const SNAPSHOT_INTERVAL_MS = 50;

const snapshotsByPlayer = new Map<number, PlayerSnapshot[]>();
let recordingInterval: ReturnType<typeof setInterval> | null = null;

function recordSnapshot(player: PlayerMp): void {
    if (!player || !mp.players.exists(player)) return;

    const snap: PlayerSnapshot = {
        t: Date.now(),
        pos: { x: player.position.x, y: player.position.y, z: player.position.z },
        dimension: player.dimension
    };

    let list = snapshotsByPlayer.get(player.id);
    if (!list) {
        list = [];
        snapshotsByPlayer.set(player.id, list);
    }
    list.push(snap);
    if (list.length > MAX_SNAPSHOTS) list.shift();
}

/**
 * Find the closest snapshot for the victim at or before shotTime.
 * Returns snapshot position or null if none found (caller falls back to current position).
 * Logs debug entry when rewind fails.
 */
export function getRewindPosition(victimId: number, shotTime: number): { x: number; y: number; z: number } | null {
    const list = snapshotsByPlayer.get(victimId);
    if (!list || list.length === 0) {
        console.log(`[SnapshotManager] No snapshots for victim ${victimId}, using current position fallback`);
        return null;
    }

    let best: PlayerSnapshot | null = null;
    let bestDiff = Infinity;
    for (const s of list) {
        if (s.t <= shotTime) {
            const diff = shotTime - s.t;
            if (diff < bestDiff) {
                bestDiff = diff;
                best = s;
            }
        }
    }
    if (!best) {
        console.log(
            `[SnapshotManager] No snapshot at/before shotTime for victim ${victimId} (shotTime=${shotTime}, oldest=${list[0]?.t}), using current position fallback`
        );
        return null;
    }
    return best.pos;
}

/**
 * Remove snapshots when player disconnects.
 */
export function clearPlayerSnapshots(playerId: number): void {
    snapshotsByPlayer.delete(playerId);
}

/**
 * Start the global snapshot recording interval.
 */
export function startSnapshotRecording(): void {
    if (recordingInterval) return;
    recordingInterval = setInterval(() => {
        mp.players.forEach((player) => recordSnapshot(player));
    }, SNAPSHOT_INTERVAL_MS);
}
