import { makeAutoObservable } from "mobx";
import EventManager from "utils/EventManager.util";

interface ChallengeProgress {
    completed: boolean;
    claimed: boolean;
}

interface SeasonRewardEntry {
    claimed: boolean;
}

interface PrestigeStatus {
    canPrestige: boolean;
}

class RankingStore {
    unclaimedChallenges = 0;
    unclaimedSeasonRewards = 0;
    canPrestige = false;

    constructor() {
        makeAutoObservable(this);
        this.setupHandlers();
    }

    private setupHandlers(): void {
        EventManager.addHandler("progression", "setPrestigeStatus", (data: { status: PrestigeStatus | null }) => {
            this.canPrestige = data?.status?.canPrestige ?? false;
        });
    }

    setCanPrestige(value: boolean): void {
        this.canPrestige = value;
    }

    setChallengesData(challenges: ChallengeProgress[]): void {
        this.unclaimedChallenges = challenges.filter((c) => c.completed && !c.claimed).length;
    }

    setRewardsData(rewards: SeasonRewardEntry[]): void {
        this.unclaimedSeasonRewards = rewards.filter((r) => !r.claimed).length;
    }

    fetchBadges(): void {
        EventManager.emitServer("challenges", "getMyChallenges");
        EventManager.emitServer("seasons", "getMyRewards");
        EventManager.emitServer("progression", "getPrestigeStatus");
    }

    get hasBadge(): boolean {
        return this.unclaimedChallenges > 0 || this.unclaimedSeasonRewards > 0 || this.canPrestige;
    }

    get badgeCount(): number {
        return this.unclaimedChallenges + this.unclaimedSeasonRewards + (this.canPrestige ? 1 : 0);
    }
}

export const rankingStore = new RankingStore();
