/**
 * Arena spectator controller: cycle teammates with LEFT/RIGHT, auto-switch when spectated dies.
 * Complements Spectate.class which handles the actual camera.
 */

interface Teammate {
    playerId: number;
    playerName: string;
}

let teammates: Teammate[] = [];
let currentIndex = 0;

function getCurrentTarget(): Teammate | null {
    if (teammates.length === 0) return null;
    const idx = currentIndex % teammates.length;
    return teammates[idx] ?? null;
}

function notifyCefTarget(playerName: string) {
    mp.events.call("client::eventManager", "cef::arena:spectateTargetChanged", { playerName });
}

function switchToIndex(idx: number) {
    if (teammates.length === 0) return;
    currentIndex = ((idx % teammates.length) + teammates.length) % teammates.length;
    const target = getCurrentTarget();
    if (target) {
        mp.events.callRemote("server::arena:spectate:switch", target.playerId);
        notifyCefTarget(target.playerName);
    }
}

mp.events.add("client::arena:spectateTeammates", (dataStr: string) => {
    try {
        const parsed = JSON.parse(dataStr) as Teammate[];
        teammates = Array.isArray(parsed) ? parsed : [];
        currentIndex = 0;
        if (teammates.length > 0) {
            notifyCefTarget(teammates[0].playerName);
        }
    } catch {
        teammates = [];
    }
});

mp.events.add("client::arena:spectateTeammatesUpdated", (dataStr: string) => {
    try {
        const parsed = JSON.parse(dataStr) as Teammate[];
        const newList = Array.isArray(parsed) ? parsed : [];
        const currentTarget = getCurrentTarget();

        if (newList.length === 0) {
            teammates = [];
            mp.events.callRemote("server::spectate:stop");
            mp.events.call("client::eventManager", "cef::arena:spectateStopped", {});
            return;
        }

        const currentInNew = currentTarget && newList.some((t) => t.playerId === currentTarget.playerId);
        if (!currentInNew) {
            teammates = newList;
            currentIndex = 0;
            const first = newList[0];
            if (first) {
                mp.events.callRemote("server::arena:spectate:switch", first.playerId);
                notifyCefTarget(first.playerName);
            }
        } else {
            const newIdx = newList.findIndex((t) => t.playerId === currentTarget!.playerId);
            teammates = newList;
            currentIndex = newIdx >= 0 ? newIdx : 0;
        }
    } catch {
        teammates = [];
    }
});

mp.keys.bind(37, true, () => {
    if (!mp.players.local.getVariable("isSpectating") || teammates.length <= 1) return;
    switchToIndex(currentIndex - 1);
});

mp.keys.bind(39, true, () => {
    if (!mp.players.local.getVariable("isSpectating") || teammates.length <= 1) return;
    switchToIndex(currentIndex + 1);
});
