/**
 * In-memory party management.
 * Players form groups; leader can invite/kick. Handles disconnect cleanup.
 */
import { IParty, PartyResult } from "./Party.types";
import { getQueueForPlayerInfo } from "@modules/matchmaking/QueueManager";
import { isPlayerInMatch } from "@modules/matches/MatchManager";

const parties = new Map<string, IParty>();
const playerToParty = new Map<number, string>();
let nextPartyId = 1;

const DEFAULT_MAX_SIZE = 5;

function log(msg: string): void {
    if (process.env.DEBUG_MODE) console.log(`[Party] ${msg}`);
}

function generatePartyId(): string {
    return `party_${nextPartyId++}`;
}

/**
 * Create a new party with the given player as leader.
 */
export function createParty(player: PlayerMp): PartyResult {
    if (playerToParty.has(player.id)) {
        return { ok: false, reason: "Already in a party" };
    }
    const queueInfo = getQueueForPlayerInfo(player);
    if (queueInfo) {
        return { ok: false, reason: "Cannot create party while in queue" };
    }
    if (isPlayerInMatch(player)) {
        return { ok: false, reason: "Cannot create party while in match" };
    }

    const partyId = generatePartyId();
    const party: IParty = {
        partyId,
        leaderId: player.id,
        memberIds: [player.id],
        maxSize: DEFAULT_MAX_SIZE,
        pendingInvites: new Set()
    };
    parties.set(partyId, party);
    playerToParty.set(player.id, partyId);
    log(`Party created: ${partyId} by ${player.name} (${player.id})`);
    return { ok: true };
}

/**
 * Leader invites a target to the party.
 */
export function invitePlayer(leader: PlayerMp, target: PlayerMp): PartyResult {
    const party = getPartyByLeader(leader);
    if (!party) return { ok: false, reason: "Not a party leader" };
    if (party.leaderId !== leader.id) return { ok: false, reason: "Only leader can invite" };
    if (party.memberIds.length >= party.maxSize) return { ok: false, reason: "Party is full" };
    if (party.memberIds.includes(target.id)) return { ok: false, reason: "Player already in party" };
    if (party.pendingInvites.has(target.id)) return { ok: false, reason: "Invite already pending" };
    if (playerToParty.has(target.id)) return { ok: false, reason: "Player is in another party" };
    const targetQueue = getQueueForPlayerInfo(target);
    if (targetQueue) return { ok: false, reason: "Player is in queue" };
    if (isPlayerInMatch(target)) return { ok: false, reason: "Player is in a match" };

    party.pendingInvites.add(target.id);
    return { ok: true };
}

/**
 * Target accepts an invite to a party.
 */
export function acceptInvite(player: PlayerMp, partyId: string): PartyResult {
    const party = parties.get(partyId);
    if (!party) return { ok: false, reason: "Party not found" };
    if (!party.pendingInvites.has(player.id)) return { ok: false, reason: "No pending invite" };
    if (playerToParty.has(player.id)) return { ok: false, reason: "Already in a party" };
    if (party.memberIds.length >= party.maxSize) return { ok: false, reason: "Party is full" };
    const queueInfo = getQueueForPlayerInfo(player);
    if (queueInfo) return { ok: false, reason: "Cannot accept while in queue" };
    if (isPlayerInMatch(player)) return { ok: false, reason: "Cannot accept while in match" };

    party.pendingInvites.delete(player.id);
    party.memberIds.push(player.id);
    playerToParty.set(player.id, partyId);
    return { ok: true };
}

/**
 * Target declines an invite.
 */
export function declineInvite(player: PlayerMp, partyId: string): PartyResult {
    const party = parties.get(partyId);
    if (!party) return { ok: false, reason: "Party not found" };
    if (!party.pendingInvites.has(player.id)) return { ok: false, reason: "No pending invite" };

    party.pendingInvites.delete(player.id);
    return { ok: true };
}

/**
 * Player leaves their party. If leader leaves, next member becomes leader or party disbands.
 */
export function leaveParty(player: PlayerMp): PartyResult {
    const party = getPartyByPlayer(player);
    if (!party) return { ok: false, reason: "Not in a party" };

    const idx = party.memberIds.indexOf(player.id);
    if (idx < 0) return { ok: false, reason: "Not in party members" };

    party.memberIds.splice(idx, 1);
    playerToParty.delete(player.id);

    if (party.memberIds.length === 0) {
        parties.delete(party.partyId);
        log(`Party deleted (empty): ${party.partyId}`);
        return { ok: true };
    }

    if (party.leaderId === player.id) {
        party.leaderId = party.memberIds[0];
        log(`Leader transfer: ${party.partyId} -> ${party.leaderId}`);
    }
    return { ok: true };
}

/**
 * Leader kicks a member.
 */
export function kickMember(leader: PlayerMp, target: PlayerMp): PartyResult {
    const party = getPartyByLeader(leader);
    if (!party) return { ok: false, reason: "Not a party leader" };
    if (party.leaderId !== leader.id) return { ok: false, reason: "Only leader can kick" };
    if (target.id === leader.id) return { ok: false, reason: "Cannot kick yourself" };
    if (!party.memberIds.includes(target.id)) return { ok: false, reason: "Player not in party" };

    party.memberIds = party.memberIds.filter((id) => id !== target.id);
    playerToParty.delete(target.id);

    if (party.memberIds.length === 0) {
        parties.delete(party.partyId);
    }
    return { ok: true };
}

/**
 * Leader disbands the party. All members are removed.
 */
export function disbandParty(partyId: string): PartyResult {
    const party = parties.get(partyId);
    if (!party) return { ok: false, reason: "Party not found" };

    party.memberIds.forEach((id) => playerToParty.delete(id));
    parties.delete(partyId);
    log(`Party disbanded: ${partyId}`);
    return { ok: true };
}

/**
 * Called when a player disconnects. Removes from party, handles leader transfer,
 * invite cleanup, and party deletion. Returns partyId if player was in a party.
 */
export function onPlayerDisconnect(playerId: number): void {
    parties.forEach((party) => {
        party.pendingInvites.delete(playerId);
    });

    const partyId = playerToParty.get(playerId);
    if (!partyId) return;

    const party = parties.get(partyId);
    if (!party) {
        playerToParty.delete(playerId);
        return;
    }

    const idx = party.memberIds.indexOf(playerId);
    if (idx < 0) {
        playerToParty.delete(playerId);
        return;
    }

    party.memberIds.splice(idx, 1);
    playerToParty.delete(playerId);

    if (party.memberIds.length === 0) {
        parties.delete(partyId);
        log(`Party deleted (disconnect): ${partyId}`);
        return;
    }

    if (party.leaderId === playerId) {
        party.leaderId = party.memberIds[0];
        log(`Leader transfer (disconnect): ${partyId} -> ${party.leaderId}`);
    }
}

/**
 * Get the party a player belongs to.
 */
export function getPartyByPlayer(player: PlayerMp): IParty | undefined {
    const partyId = playerToParty.get(player.id);
    return partyId ? parties.get(partyId) : undefined;
}

/**
 * Get party by ID.
 */
export function getPartyById(partyId: string): IParty | undefined {
    return parties.get(partyId);
}

/**
 * Check if player is the leader of their party.
 */
export function isLeader(player: PlayerMp): boolean {
    const party = getPartyByPlayer(player);
    return party ? party.leaderId === player.id : false;
}

/**
 * Get party where player is leader (for invite/kick validation).
 */
function getPartyByLeader(leader: PlayerMp): IParty | undefined {
    const party = getPartyByPlayer(leader);
    return party && party.leaderId === leader.id ? party : undefined;
}

/**
 * Get all member IDs for a party (for queue integration).
 */
export function getPartyMemberIds(partyId: string): number[] {
    const party = parties.get(partyId);
    return party ? [...party.memberIds] : [];
}

/**
 * Check if a party can queue. All members must be eligible (not in queue, not in match, have character).
 */
export function canPartyQueue(partyId: string, size: number): PartyResult {
    const party = parties.get(partyId);
    if (!party) return { ok: false, reason: "Party not found" };
    if (party.memberIds.length > size) return { ok: false, reason: "Party too large for this queue" };
    if (party.memberIds.length < 1) return { ok: false, reason: "Party has no members" };

    for (const id of party.memberIds) {
        const p = mp.players.at(id);
        if (!p || !mp.players.exists(p)) return { ok: false, reason: "A party member is offline" };
        if (!p.character) return { ok: false, reason: "A party member has no character" };
        if (getQueueForPlayerInfo(p)) return { ok: false, reason: "A party member is already in queue" };
        if (isPlayerInMatch(p)) return { ok: false, reason: "A party member is in a match" };
    }
    return { ok: true };
}
