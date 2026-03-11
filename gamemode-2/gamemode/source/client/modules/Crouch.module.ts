import { PlayerKeybind } from "@classes/Keybind.class";
import { Browser } from "@classes/Browser.class";

const CROUCH_CLIPSET = "move_ped_crouched";
const C_KEY = 67;
// Blend duration in seconds - higher = slower, more natural transition (ECRP-style)
const CROUCH_BLEND_DURATION = 0.5;
// Re-apply crouch (game overrides when aiming). When aiming we re-apply every frame so crouch+ADS+shoot works.
const CROUCH_REAPPLY_FRAME_SKIP = 3; // when not aiming: every 4th frame
const INPUT_AIM = 25; // Right-click / aim down sights

let clipsetLoaded = false;
let isCrouched = false;
/** When true, stay crouched until next C press (e.g. opened chat with T while crouched, then Enter). */
let crouchLocked = false;
/** Set when crouched and chat opens; when chat closes we lock crouch so release-C doesn't stand. */
let openedChatWhileCrouched = false;
let frameCount = 0;

async function loadClipset(): Promise<boolean> {
    if (clipsetLoaded) return true;
    mp.game.streaming.requestAnimSet(CROUCH_CLIPSET);
    const deadline = Date.now() + 3000;
    while (!mp.game.streaming.hasAnimSetLoaded(CROUCH_CLIPSET) && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 50));
    }
    clipsetLoaded = mp.game.streaming.hasAnimSetLoaded(CROUCH_CLIPSET);
    return clipsetLoaded;
}

function canCrouch(): boolean {
    if (!mp.players.local.getVariable("loggedin") || mp.players.local.getVariable("isDead")) return false;
    if (mp.players.local.vehicle) return false;
    if (Browser.currentPage && Browser.currentPage !== "arena_hud") return false;
    return true;
}

function resetCrouch() {
    if (mp.players.local.vehicle) return;
    isCrouched = false;
    crouchLocked = false;
    openedChatWhileCrouched = false;
    mp.players.local.resetMovementClipset(CROUCH_BLEND_DURATION);
}

function applyCrouch() {
    loadClipset().then((ok) => {
        if (ok) mp.players.local.setMovementClipset(CROUCH_CLIPSET, CROUCH_BLEND_DURATION);
    });
}

function standUp() {
    isCrouched = false;
    crouchLocked = false;
    mp.players.local.resetMovementClipset(CROUCH_BLEND_DURATION);
}

function onCrouchKeyDown() {
    if (!canCrouch()) return;
    if (crouchLocked) {
        standUp();
        return;
    }
    isCrouched = true;
    applyCrouch();
}

function onCrouchKeyUp() {
    if (crouchLocked) return;
    if (!canCrouch()) return;
    standUp();
}

function bindCrouch() {
    PlayerKeybind.addKeybind({ keyCode: C_KEY, up: false }, onCrouchKeyDown, "Crouch hold (C down)");
    PlayerKeybind.addKeybind({ keyCode: C_KEY, up: true }, onCrouchKeyUp, "Crouch release (C up)");
}

function unbindCrouch() {
    PlayerKeybind.removeKeybind(C_KEY, false, onCrouchKeyDown);
    PlayerKeybind.removeKeybind(C_KEY, true, onCrouchKeyUp);
}

bindCrouch();

mp.events.add("playerEnterVehicle", () => {
    resetCrouch();
    unbindCrouch();
});

mp.events.add("playerLeaveVehicle", () => {
    bindCrouch();
});

mp.events.add("render", () => {
    if (mp.players.local.vehicle) return;
    if (!canCrouch()) {
        if (Browser.currentPage === "chat" && isCrouched) openedChatWhileCrouched = true;
        else resetCrouch();
        return;
    }
    // If crouched and chat just opened, remember so we can lock crouch when chat closes (T then Enter = stay crouched)
    if (Browser.currentPage === "chat" && isCrouched) openedChatWhileCrouched = true;
    if (Browser.currentPage !== "chat") {
        if (openedChatWhileCrouched) crouchLocked = true;
        openedChatWhileCrouched = false;
    }
    // Re-apply crouch - game overrides when aiming. While aiming, re-apply every frame so crouch+ADS+shoot works.
    if (isCrouched && clipsetLoaded) {
        const isAiming = mp.game.controls.isControlPressed(0, INPUT_AIM);
        if (isAiming) {
            mp.players.local.setMovementClipset(CROUCH_CLIPSET, 0);
        } else {
            frameCount++;
            if (frameCount % (CROUCH_REAPPLY_FRAME_SKIP + 1) === 0) {
                mp.players.local.setMovementClipset(CROUCH_CLIPSET, 0);
            }
        }
    } else {
        frameCount = 0;
    }
    // Disable native INPUT_DUCK (36) - prevents game from fighting our clipset
    mp.game.controls.disableControlAction(0, 36, true);
});
