/**
 * Local voice (proximity) + team/channel radio. Push-to-talk only.
 * - Hold N: transmit to players within range (proximity). Release = stop.
 * - Hold M: transmit to teammates (Hopouts) or same radio channel (outside Hopouts). Release = stop.
 * We are muted by default; unmute only while N or M is held.
 * CEF is notified when transmitting so the HUD can show an indicator.
 */

import { Browser } from "@classes/Browser.class";

const LOCAL_VOICE_RANGE = 50;
const VOICE_UPDATE_INTERVAL_MS = 500;
const KEY_LOCAL_VOICE = 0x4e; // N
const KEY_RADIO_VOICE = 0x4d; // M

const localListeners = new Set<number>();
const radioListeners = new Set<number>();
let transmittingLocal = false;
let transmittingRadio = false;
let intervalId: ReturnType<typeof setInterval> | null = null;
/** Outside Hopouts: players on same radio channel (from server). */
let radioChannelListeners: number[] = [];

function getDistance(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
    return mp.game.system.vdist(a.x, a.y, a.z, b.x, b.y, b.z);
}

function getProximityRemoteIds(): number[] {
    const local = mp.players.local;
    if (!local || !mp.players.exists(local) || !local.getVariable("loggedin")) return [];
    const pos = local.position;
    const out: number[] = [];
    mp.players.forEachInStreamRange((player: PlayerMp) => {
        if (player === local || !mp.players.exists(player)) return;
        if (player.dimension !== local.dimension) return;
        if (getDistance(pos, player.position) <= LOCAL_VOICE_RANGE) out.push(player.remoteId);
    });
    return out;
}

/** Hopouts: arenaTeammateIds. Outside Hopouts: same radio channel (from server). */
function getRadioRemoteIds(): number[] {
    const local = mp.players.local;
    if (!local || !mp.players.exists(local)) return [];
    const arenaIds = (local.getVariable("arenaTeammateIds") as number[] | undefined) ?? [];
    if (arenaIds.length > 0) {
        return arenaIds.filter((id) => typeof id === "number" && id !== local.remoteId);
    }
    return radioChannelListeners.filter((id) => id !== local.remoteId);
}

function removeListener(remoteId: number): void {
    mp.events.callRemote("server::voice:removeListener", remoteId);
}

function addListener(remoteId: number): void {
    mp.events.callRemote("server::voice:addListener", remoteId);
}

function notifyTransmittingState(): void {
    Browser.processEvent("cef::voice:transmitting", { local: transmittingLocal, radio: transmittingRadio });
}

function setMuted(muted: boolean): void {
    if (mp.voiceChat) mp.voiceChat.muted = muted;
}

function updateTransmitListeners(): void {
    const local = mp.players.local;
    if (!local || !mp.players.exists(local) || !local.getVariable("loggedin")) return;
    if (transmittingRadio) {
        const arenaIds = (local.getVariable("arenaTeammateIds") as number[] | undefined) ?? [];
        if (arenaIds.length === 0) {
            mp.events.callRemote("server::voice:requestRadioListeners");
        }
    }
    const radioIds = new Set(getRadioRemoteIds());

    if (transmittingLocal) {
        const proximity = new Set(getProximityRemoteIds());
        localListeners.forEach((remoteId) => {
            if (!proximity.has(remoteId)) {
                localListeners.delete(remoteId);
                removeListener(remoteId);
            }
        });
        proximity.forEach((remoteId) => {
            if (localListeners.has(remoteId)) return;
            localListeners.add(remoteId);
            addListener(remoteId);
        });
    } else {
        localListeners.forEach((remoteId) => removeListener(remoteId));
        localListeners.clear();
    }

    if (transmittingRadio) {
        radioIds.forEach((remoteId) => {
            if (radioListeners.has(remoteId)) return;
            radioListeners.add(remoteId);
            addListener(remoteId);
        });
        radioListeners.forEach((remoteId) => {
            if (!radioIds.has(remoteId)) {
                radioListeners.delete(remoteId);
                removeListener(remoteId);
            }
        });
    } else {
        radioListeners.forEach((remoteId) => removeListener(remoteId));
        radioListeners.clear();
    }
}

function startInterval(): void {
    if (intervalId != null) return;
    intervalId = setInterval(updateTransmitListeners, VOICE_UPDATE_INTERVAL_MS);
}

function stopInterval(): void {
    if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function onLocalKeyDown(): void {
    if (transmittingLocal) return;
    transmittingLocal = true;
    setMuted(false);
    notifyTransmittingState();
    updateTransmitListeners();
    startInterval();
}

function onLocalKeyUp(): void {
    if (!transmittingLocal) return;
    transmittingLocal = false;
    localListeners.forEach((remoteId) => removeListener(remoteId));
    localListeners.clear();
    if (!transmittingRadio) setMuted(true);
    notifyTransmittingState();
    if (!transmittingRadio && !transmittingLocal) stopInterval();
}

function onRadioKeyDown(): void {
    if (transmittingRadio) return;
    transmittingRadio = true;
    setMuted(false);
    notifyTransmittingState();
    updateTransmitListeners();
    startInterval();
}

function onRadioKeyUp(): void {
    if (!transmittingRadio) return;
    transmittingRadio = false;
    radioListeners.forEach((remoteId) => removeListener(remoteId));
    radioListeners.clear();
    if (!transmittingLocal) setMuted(true);
    notifyTransmittingState();
    if (!transmittingLocal && !transmittingRadio) stopInterval();
}

// Default: muted. Only unmute while holding N or M.
setMuted(true);

// Hold N = local; Hold M = radio. Key down = start transmit, key up = stop.
mp.keys.bind(KEY_LOCAL_VOICE, false, onLocalKeyDown);
mp.keys.bind(KEY_LOCAL_VOICE, true, onLocalKeyUp);
mp.keys.bind(KEY_RADIO_VOICE, false, onRadioKeyDown);
mp.keys.bind(KEY_RADIO_VOICE, true, onRadioKeyUp);

mp.events.add("playerQuit", (player: PlayerMp) => {
    const id = player.remoteId;
    if (localListeners.has(id)) {
        localListeners.delete(id);
        removeListener(id);
    }
    if (radioListeners.has(id)) {
        radioListeners.delete(id);
        removeListener(id);
    }
});

mp.events.add("client::voice:radioListeners", (ids: number[]) => {
    radioChannelListeners = Array.isArray(ids) ? ids : [];
});

// Interval runs only while transmitting (started on key down, stopped when both released).
