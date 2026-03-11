import { makeAutoObservable, observable } from "mobx";
import EventManager from "utils/EventManager.util";

export interface PlayerListEntry {
    id: number;
    name: string;
    ping: number;
}

class _PlayerListStore {
    players: PlayerListEntry[] = observable.array([]);

    constructor() {
        makeAutoObservable(this);
        this.createEvents();
    }

    setPlayers(players: PlayerListEntry[]) {
        this.players.splice(0, this.players.length, ...players);
    }

    createEvents() {
        EventManager.addHandler("playerList", "setPlayers", (data: PlayerListEntry[]) => this.setPlayers(data));
        EventManager.stopAddingHandler("playerList");
    }
}

export const playerListStore = new _PlayerListStore();
