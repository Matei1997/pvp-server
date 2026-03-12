/**
 * Match reconnect protection: allow players who disconnect during a match
 * to reconnect within 60 seconds and rejoin the same match.
 */

export type Team = "red" | "blue";

export interface ReconnectSlot {
    characterId: number;
    dimension: number;
    team: Team;
    alive: boolean;
    name: string;
    reconnectDeadline: number;
    timeoutId: ReturnType<typeof setTimeout>;
}

const RECONNECT_WINDOW_MS = 60000;
const slotsByCharacterId = new Map<number, ReconnectSlot>();

export function recordDisconnect(
    characterId: number,
    dimension: number,
    team: Team,
    alive: boolean,
    name: string,
    onExpire: () => void
): void {
    if (slotsByCharacterId.has(characterId)) return;

    const reconnectDeadline = Date.now() + RECONNECT_WINDOW_MS;
    const timeoutId = setTimeout(() => {
        slotsByCharacterId.delete(characterId);
        onExpire();
    }, RECONNECT_WINDOW_MS);

    slotsByCharacterId.set(characterId, {
        characterId,
        dimension,
        team,
        alive,
        name,
        reconnectDeadline,
        timeoutId
    });
}

export function tryReconnect(player: PlayerMp): ReconnectSlot | null {
    const characterId = player.character?.id;
    if (!characterId) return null;

    const slot = slotsByCharacterId.get(characterId);
    if (!slot || Date.now() > slot.reconnectDeadline) {
        if (slot) {
            clearTimeout(slot.timeoutId);
            slotsByCharacterId.delete(characterId);
        }
        return null;
    }

    clearTimeout(slot.timeoutId);
    slotsByCharacterId.delete(characterId);
    return slot;
}

export function hasReconnectSlot(characterId: number): boolean {
    const slot = slotsByCharacterId.get(characterId);
    return !!slot && Date.now() <= slot.reconnectDeadline;
}

export function cancelReconnect(characterId: number): void {
    const slot = slotsByCharacterId.get(characterId);
    if (slot) {
        clearTimeout(slot.timeoutId);
        slotsByCharacterId.delete(characterId);
    }
}
