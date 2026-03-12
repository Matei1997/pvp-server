/**
 * Party system types.
 * In-memory implementation; no persistence in Phase 5.
 */

export interface IParty {
    partyId: string;
    leaderId: number;
    memberIds: number[];
    maxSize: number;
    /** Player IDs with pending invites (not yet accepted/declined). */
    pendingInvites: Set<number>;
}

export type PartyResult =
    | { ok: true }
    | { ok: false; reason: string };
