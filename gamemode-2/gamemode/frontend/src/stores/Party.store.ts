import { makeAutoObservable } from "mobx";
import EventManager from "utils/EventManager.util";

export interface PartyMember {
    id: number;
    name: string;
}

export interface PartyData {
    partyId: string;
    leaderId: number;
    memberIds: number[];
    members: PartyMember[];
    maxSize: number;
    pendingInvites: number[];
}

export interface PendingInvite {
    partyId: string;
    leaderName: string;
    party: PartyData;
}

class PartyStore {
    party: PartyData | null = null;
    pendingInvite: PendingInvite | null = null;

    constructor() {
        makeAutoObservable(this);
        this.setupHandlers();
    }

    private setupHandlers(): void {
        EventManager.addHandler("party", "partyUpdated", (data: PartyData) => {
            this.setParty(data);
            this.pendingInvite = null;
        });

        EventManager.addHandler("party", "inviteReceived", (data: { party: PartyData; leaderName: string }) => {
            this.pendingInvite = {
                partyId: data.party.partyId,
                leaderName: data.leaderName,
                party: data.party
            };
        });

        EventManager.addHandler("party", "kicked", () => {
            this.clearParty();
        });

        EventManager.addHandler("party", "disbanded", () => {
            this.clearParty();
        });
    }

    setParty(party: PartyData | null): void {
        this.party = party;
    }

    clearParty(): void {
        this.party = null;
        this.pendingInvite = null;
    }

    setInvite(invite: PendingInvite | null): void {
        this.pendingInvite = invite;
    }

    get leaderId(): number | null {
        return this.party?.leaderId ?? null;
    }

    get memberIds(): number[] {
        return this.party?.memberIds ?? [];
    }

    get members(): PartyMember[] {
        return this.party?.members ?? [];
    }

    get maxSize(): number {
        return this.party?.maxSize ?? 5;
    }

    isLeader(playerId: number): boolean {
        return this.party?.leaderId === playerId;
    }
}

export const partyStore = new PartyStore();
