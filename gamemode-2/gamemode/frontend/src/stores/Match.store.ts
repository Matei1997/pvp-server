import { makeAutoObservable } from "mobx";
import EventManager from "utils/EventManager.util";

class MatchStore {
    readyCheckVisible = false;
    mapName = "";
    timeLeft = 10;
    private _timerId: ReturnType<typeof setInterval> | null = null;

    constructor() {
        makeAutoObservable(this);

        EventManager.addHandler("match", "readyCheck", (data: { mapName?: string; timeLeft?: number }) => {
            this.readyCheckVisible = true;
            this.mapName = data.mapName ?? "";
            this.timeLeft = data.timeLeft ?? 10;

            if (this._timerId) clearInterval(this._timerId);
            this._timerId = setInterval(() => {
                this.timeLeft = Math.max(0, this.timeLeft - 1);
                if (this.timeLeft <= 0 && this._timerId) {
                    clearInterval(this._timerId);
                    this._timerId = null;
                }
            }, 1000);
        });

        EventManager.addHandler("arena", "setMatch", () => this.hideReadyCheck());
        EventManager.addHandler("arena", "setLobby", () => this.hideReadyCheck());
    }

    get visible(): boolean {
        return this.readyCheckVisible;
    }

    hideReadyCheck() {
        this.readyCheckVisible = false;
        if (this._timerId) {
            clearInterval(this._timerId);
            this._timerId = null;
        }
    }
}

export const matchStore = new MatchStore();
