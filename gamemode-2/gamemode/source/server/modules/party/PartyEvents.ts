/**
 * Party event handlers. Call these from CEF or commands when UI is added.
 * Wraps PartyManager and can emit to clients.
 */
import {
    createParty,
    invitePlayer,
    acceptInvite,
    declineInvite,
    leaveParty,
    kickMember,
    disbandParty,
    getPartyByPlayer,
    isLeader,
    getPartyById
} from "./PartyManager";
import type { IParty } from "./Party.types";

/** Serialize party for client (no Set in JSON). Includes member names for UI. */
function partyToClient(party: IParty): object {
    const members = party.memberIds.map((id) => {
        const p = mp.players.at(id);
        return { id, name: p && mp.players.exists(p) ? p.name : "Unknown" };
    });
    return {
        partyId: party.partyId,
        leaderId: party.leaderId,
        memberIds: party.memberIds,
        members,
        maxSize: party.maxSize,
        pendingInvites: Array.from(party.pendingInvites)
    };
}

/** Emit party update to all members. Hook for when CEF/emit is wired. */
function emitToParty(party: IParty, event: string, data: unknown): void {
    const payload = JSON.stringify(data);
    party.memberIds.forEach((id) => {
        const p = mp.players.at(id);
        if (p && mp.players.exists(p)) {
            p.call("client::party:emit", [event, payload]);
        }
    });
}

/**
 * Create party. Returns result; emits to creator on success.
 */
export function onPartyCreate(player: PlayerMp): { ok: boolean; reason?: string; party?: object } {
    const result = createParty(player);
    if (result.ok) {
        const party = getPartyByPlayer(player);
        if (party) emitToParty(party, "partyUpdated", partyToClient(party));
        return { ok: true, party: party ? partyToClient(party) : undefined };
    }
    return { ok: false, reason: result.reason };
}

/**
 * Leader invites target. Emits to both on success.
 */
export function onPartyInvite(leader: PlayerMp, target: PlayerMp): { ok: boolean; reason?: string } {
    const result = invitePlayer(leader, target);
    if (result.ok) {
        const party = getPartyByPlayer(leader);
        if (party) {
            emitToParty(party, "partyUpdated", partyToClient(party));
            if (mp.players.exists(target)) {
                target.call("client::party:inviteReceived", [partyToClient(party), leader.name]);
            }
        }
        return { ok: true };
    }
    return { ok: false, reason: result.reason };
}

/**
 * Target accepts invite. Emits to party on success.
 */
export function onPartyAccept(player: PlayerMp, partyId: string): { ok: boolean; reason?: string; party?: object } {
    const result = acceptInvite(player, partyId);
    if (result.ok) {
        const party = getPartyById(partyId);
        if (party) emitToParty(party, "partyUpdated", partyToClient(party));
        const p = getPartyByPlayer(player);
        return { ok: true, party: p ? partyToClient(p) : undefined };
    }
    return { ok: false, reason: result.reason };
}

/**
 * Target declines invite.
 */
export function onPartyDecline(player: PlayerMp, partyId: string): { ok: boolean; reason?: string } {
    const result = declineInvite(player, partyId);
    return result.ok ? { ok: true } : { ok: false, reason: result.reason };
}

/**
 * Player leaves party. Emits to remaining members on success.
 */
export function onPartyLeave(player: PlayerMp): { ok: boolean; reason?: string } {
    const party = getPartyByPlayer(player);
    const result = leaveParty(player);
    if (result.ok && party) {
        const remaining = getPartyById(party.partyId);
        if (remaining) emitToParty(remaining, "partyUpdated", partyToClient(remaining));
        return { ok: true };
    }
    return result.ok ? { ok: true } : { ok: false, reason: result.reason };
}

/**
 * Leader kicks target. Emits to party on success.
 */
export function onPartyKick(leader: PlayerMp, target: PlayerMp): { ok: boolean; reason?: string } {
    const result = kickMember(leader, target);
    if (result.ok) {
        const party = getPartyByPlayer(leader);
        if (party) emitToParty(party, "partyUpdated", partyToClient(party));
        if (mp.players.exists(target)) {
            target.call("client::party:kicked", []);
        }
        return { ok: true };
    }
    return { ok: false, reason: result.reason };
}

/**
 * Leader disbands party. Emits to all former members.
 */
export function onPartyDisband(leader: PlayerMp): { ok: boolean; reason?: string } {
    const party = getPartyByPlayer(leader);
    if (!party || party.leaderId !== leader.id) return { ok: false, reason: "Not party leader" };
    const memberIds = [...party.memberIds];
    const result = disbandParty(party.partyId);
    if (result.ok) {
        memberIds.forEach((id) => {
            const p = mp.players.at(id);
            if (p && mp.players.exists(p)) p.call("client::party:disbanded", []);
        });
        return { ok: true };
    }
    return { ok: false, reason: result.reason };
}

export { getPartyByPlayer, isLeader, getPartyById };
