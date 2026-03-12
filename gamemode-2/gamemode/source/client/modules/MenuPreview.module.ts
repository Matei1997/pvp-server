/**
 * Menu preview system: spawns a preview ped with fixed camera for menu screens
 * (loadout, clothing). The UI remains a transparent overlay.
 *
 * - Spawn ped at fixed position
 * - Freeze ped, idle animation
 * - Fixed camera pointing at ped
 * - Rotate ped with mouse input (RMB held)
 */
import { Browser } from "@classes/Browser.class";
import { Client } from "@classes/Client.class";

const PREVIEW_PED_POS = new mp.Vector3(-75.93680572509766, -1410.941162109375, 29.320751190185547 - 1);
const PREVIEW_PED_HEADING = 87.1931381225586;
const PREVIEW_CAM_POS = new mp.Vector3(-79.28535461425781, -1409.435791015625, 29.320751190185547);
const PREVIEW_CAM_FOV = 36;
const ROTATE_SENSITIVITY = 0.4;
const IDLE_ANIM_MALE = { dict: "amb@world_human_stand_impatient@male@no_sign@idle_a", name: "idle_a" };
const IDLE_ANIM_FEMALE = { dict: "amb@world_human_stand_impatient@female@no_sign@idle_a", name: "idle_a" };

let previewPed: PedMp | null = null;
let previewCam: CameraMp | null = null;
let isActive = false;
let lastCursorX = 0;
let didInitRotateCursor = false;

function applyClothesToPed(ped: PedMp, clothes: Record<string, { drawable?: number; texture?: number }> | null): void {
    if (!clothes || !mp.peds.exists(ped)) return;
    const isFemale = ped.model === mp.game.joaat("mp_f_freemode_01");
    ped.setComponentVariation(3, 15, 0, 0);
    ped.setComponentVariation(8, isFemale ? 0 : 15, 0, 0);
    ped.setComponentVariation(11, clothes.tops?.drawable ?? 15, clothes.tops?.texture ?? 0, 0);
    ped.setComponentVariation(1, clothes.masks?.drawable ?? 0, clothes.masks?.texture ?? 0, 0);
    ped.setComponentVariation(4, clothes.pants?.drawable ?? (isFemale ? 15 : 21), clothes.pants?.texture ?? 0, 0);
    ped.setComponentVariation(6, clothes.shoes?.drawable ?? (isFemale ? 35 : 34), clothes.shoes?.texture ?? 0, 0);
    ped.clearProp(0);
    const hatDrawable = clothes.hats?.drawable ?? 0;
    const hatTexture = clothes.hats?.texture ?? 0;
    if (hatDrawable > 0) {
        ped.setPropIndex(0, hatDrawable, hatTexture, true);
    }
}

function requestAnimDict(dict: string): Promise<boolean> {
    return new Promise((resolve) => {
        if (mp.game.streaming.hasAnimDictLoaded(dict)) {
            resolve(true);
            return;
        }
        mp.game.streaming.requestAnimDict(dict);
        const deadline = Date.now() + 2000;
        const inter = setInterval(() => {
            if (mp.game.streaming.hasAnimDictLoaded(dict)) {
                clearInterval(inter);
                resolve(true);
            } else if (Date.now() > deadline) {
                clearInterval(inter);
                resolve(false);
            }
        }, 50);
    });
}

function setLocalPlayerVisible(show: boolean) {
    const player = mp.players.local;
    if (!player || !mp.players.exists(player)) return;
    if (show) {
        player.setAlpha(255);
        player.setVisible(true, false);
        mp.game.entity.setVisible(player.handle, true, false);
        player.setCollision(true, false);
    } else {
        player.setAlpha(0);
        player.setVisible(false, false);
        mp.game.entity.setVisible(player.handle, false, false);
    }
}

async function startPreview() {
    if (isActive) return;
    const player = mp.players.local;
    if (!player || !mp.players.exists(player)) return;

    isActive = true;
    setLocalPlayerVisible(false);

    const modelHash = player.model;
    await Client.requestModel(modelHash).catch(() => {});

    mp.game.streaming.requestCollisionAtCoord(PREVIEW_CAM_POS.x, PREVIEW_CAM_POS.y, PREVIEW_CAM_POS.z);
    mp.game.streaming.requestAdditionalCollisionAtCoord(PREVIEW_CAM_POS.x, PREVIEW_CAM_POS.y, PREVIEW_CAM_POS.z);
    if ((mp.game.streaming as any).loadScene) {
        (mp.game.streaming as any).loadScene(PREVIEW_PED_POS.x, PREVIEW_PED_POS.y, PREVIEW_PED_POS.z);
    }

    previewPed = mp.peds.new(modelHash, PREVIEW_PED_POS, PREVIEW_PED_HEADING, player.dimension);
    if (!previewPed || !mp.peds.exists(previewPed)) {
        stopPreview();
        return;
    }

    previewPed.setBlockingOfNonTemporaryEvents(true);
    previewPed.taskSetBlockingOfNonTemporaryEvents(true);
    previewPed.setInvincible(true);
    previewPed.freezePosition(true);
    previewPed.setCanBeTargetted(false);

    const clothesJson = player.getVariable("clothes");
    if (typeof clothesJson === "string") {
        try {
            const clothes = JSON.parse(clothesJson);
            applyClothesToPed(previewPed, clothes);
        } catch {
            // ignore
        }
    }

    const isFemale = modelHash === mp.game.joaat("mp_f_freemode_01");
    const idleAnim = isFemale ? IDLE_ANIM_FEMALE : IDLE_ANIM_MALE;
    const ok = await requestAnimDict(idleAnim.dict);
    if (ok && previewPed && mp.peds.exists(previewPed)) {
        previewPed.taskPlayAnim(idleAnim.dict, idleAnim.name, 8, -8, -1, 1, 0, false, false, false);
    }

    const targetPos = new mp.Vector3(PREVIEW_PED_POS.x, PREVIEW_PED_POS.y, PREVIEW_PED_POS.z + 1);
    previewCam = mp.cameras.new("menu_preview", PREVIEW_CAM_POS, new mp.Vector3(0, 0, 0), PREVIEW_CAM_FOV);
    previewCam.pointAtCoord(targetPos.x, targetPos.y, targetPos.z);
    previewCam.setActive(true);
    mp.game.cam.renderScriptCams(true, true, 300, true, false, 0);
}

function stopPreview() {
    if (!isActive) return;
    isActive = false;
    didInitRotateCursor = false;

    if (previewCam) {
        previewCam.setActive(false);
        previewCam.destroy();
        previewCam = null;
    }
    if (previewPed && mp.peds.exists(previewPed)) {
        previewPed.destroy();
        previewPed = null;
    }
    mp.game.cam.renderScriptCams(false, true, 300, true, false, 0);
    setLocalPlayerVisible(true);
}

function pointCameraAtPed() {
    if (!previewCam || !previewPed || !mp.peds.exists(previewPed)) return;
    const pos = previewPed.position;
    previewCam.pointAtCoord(pos.x, pos.y, pos.z + 1);
}

mp.events.add("client::mainmenu:scene", (data: any) => {
    const payload = typeof data === "string" ? JSON.parse(data) : data;
    const showPreview = payload?.showPlayer === true;
    Browser.mainMenuClothingActive = showPreview;

    if (showPreview) {
        startPreview();
    } else {
        stopPreview();
    }
});

mp.events.add("render", () => {
    if (!Browser.mainMenuClothingActive || Browser.currentPage !== "mainmenu") {
        didInitRotateCursor = false;
        return;
    }
    if (!Browser.mainMenuClothingRotateHeld) {
        didInitRotateCursor = false;
        return;
    }
    if (!previewPed || !mp.peds.exists(previewPed)) return;

    const [x] = mp.gui.cursor.position;
    if (!didInitRotateCursor) {
        lastCursorX = x;
        didInitRotateCursor = true;
        return;
    }
    const delta = x - lastCursorX;
    const currentHeading = mp.game.entity.getHeading(previewPed.handle);
    mp.game.entity.setHeading(previewPed.handle, currentHeading + delta * ROTATE_SENSITIVITY);
    lastCursorX = x;
    pointCameraAtPed();
});

mp.events.add("render", () => {
    if (!isActive || !previewCam || !previewPed || !mp.peds.exists(previewPed)) return;
    previewCam.setCoord(PREVIEW_CAM_POS.x, PREVIEW_CAM_POS.y, PREVIEW_CAM_POS.z);
    pointCameraAtPed();
});

mp.events.add("client::cef:close", () => {
    Browser.mainMenuClothingActive = false;
    Browser.mainMenuClothingRotateHeld = false;
    stopPreview();
});
