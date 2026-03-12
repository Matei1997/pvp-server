/**
 * Generic queue infrastructure for matchmaking.
 * Manages player queues per size; mode-specific logic (voting, countdown) stays in modes.
 */

export type QueueSize = number;

const queues = new Map<QueueSize, PlayerMp[]>();
let nextDimension = 1000;

function getOrCreateQueue(size: QueueSize): PlayerMp[] {
    let q = queues.get(size);
    if (!q) {
        q = [];
        queues.set(size, q);
    }
    return q;
}

function getQueueForPlayer(player: PlayerMp): { size: QueueSize; players: PlayerMp[] } | null {
    for (const [size, players] of queues) {
        if (players.some((p) => p.id === player.id)) {
            return { size, players };
        }
    }
    return null;
}

/**
 * Add a player to a queue. Returns true if added.
 */
export function addPlayer(player: PlayerMp, size: QueueSize): boolean {
    if (getQueueForPlayer(player)) return false;
    const q = getOrCreateQueue(size);
    q.push(player);
    return true;
}

/**
 * Add multiple players to a queue (e.g. party). Returns true if all added.
 * If any player is already in a queue, none are added.
 */
export function addPlayers(players: PlayerMp[], size: QueueSize): boolean {
    for (const p of players) {
        if (getQueueForPlayer(p)) return false;
    }
    const q = getOrCreateQueue(size);
    players.forEach((p) => q.push(p));
    return true;
}

/**
 * Remove a player from their queue. Returns true if removed.
 */
export function removePlayer(player: PlayerMp): boolean {
    const found = getQueueForPlayer(player);
    if (!found) return false;
    const idx = found.players.findIndex((p) => p.id === player.id);
    if (idx >= 0) {
        found.players.splice(idx, 1);
        return true;
    }
    return false;
}

/**
 * Remove multiple players from a queue by ID. Used when a party leaves.
 */
export function removePlayers(playerIds: number[], size: QueueSize): void {
    const q = queues.get(size);
    if (!q) return;
    for (let i = q.length - 1; i >= 0; i--) {
        if (playerIds.includes(q[i].id)) q.splice(i, 1);
    }
}

/**
 * Get the queue for a given size.
 */
export function getQueue(size: QueueSize): PlayerMp[] {
    return getOrCreateQueue(size);
}

/**
 * Get the queue a player is in, or null.
 */
export function getQueueForPlayerInfo(player: PlayerMp): { size: QueueSize; players: PlayerMp[] } | null {
    return getQueueForPlayer(player);
}

/**
 * Check if a queue has enough players (size * 2 for 2 teams).
 */
export function isQueueFull(size: QueueSize): boolean {
    const needed = size * 2;
    const q = queues.get(size);
    return q ? q.length >= needed : false;
}

/**
 * Clear a queue.
 */
export function clearQueue(size: QueueSize): void {
    const q = queues.get(size);
    if (q) q.length = 0;
}

/**
 * Allocate a unique dimension ID for a new match.
 */
export function allocateDimension(): number {
    return nextDimension++;
}
