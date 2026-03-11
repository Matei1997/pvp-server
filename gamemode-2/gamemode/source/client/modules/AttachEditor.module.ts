/**
 * Attachments editor - create and edit prop attachments on your character.
 * Based on https://github.com/1PepeCortez/Attachments-editor
 *
 * /attach [object_name] - Start editing (admin only)
 * TAB - Open menu to edit/remove placed objects
 */

const player = mp.players.local;
const ATTACH_TITLE = "!{#4dd374}[ATTACH_EDITOR]!{#FFFFFF}";
const BROWSER_URL = "package://attach_editor/attach_editor.html";

const MODE_MOVE = 0;
const MODE_ROT = 1;
const DEFAULT_CAMERA_FOV = 40;
const INPUT_MOVER = 2;

const keysEditor = {
    R: 0x52, // Change mode
    Enter: 0x0d, // Finish
    Back: 0x08, // Cancel
    K: 0x4b, // Reset (0x20 was wrong - that's Space)
    L: 0x4c, // Change FOV
    TAB: 0x09 // Edit attach menu
};

const keyMovement = {
    Left: 0x25,
    Up: 0x26,
    Right: 0x27,
    Down: 0x28,
    PageUp: 0x21,
    PageDown: 0x22,
    Shift: 0x10,
    AltLeft: 0xa4,
    X: 0x58,
    Y: 0x59,
    Z: 0x5a,
    Space: 0x20
};

interface ObjInfo {
    object: string;
    body: number;
    bodyIndex: number;
    bodyName: string;
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
}

let editObject: ObjectMp | null = null;
let editState = MODE_MOVE;
const objInfo: ObjInfo = {
    object: "",
    body: 0,
    bodyIndex: 0,
    bodyName: "",
    x: 0,
    y: 0,
    z: 0,
    rx: 0,
    ry: 0,
    rz: 0
};

let editInterval: ReturnType<typeof setInterval> | null = null;
let editBrowser: BrowserMp | null = null;
let editCamera: CameraMp | null = null;
const defaultCamera = mp.cameras.new("gameplay");

function finishEdition(remove = false): void {
    mp.game.cam.setGameplayCamRelativeHeading(0);

    if (editCamera) {
        mp.game.cam.renderScriptCams(false, true, 1000, true, false);
        editCamera.destroy();
    }
    if (editInterval) clearInterval(editInterval);

    if (remove && editObject) editObject.destroy();
    editObject = null;
    editInterval = null;
    editCamera = null;

    player.freezePosition(false);
    if (editBrowser) editBrowser.active = false;
}

function setupCamera(boneIndex: number): void {
    const bonePos = player.getWorldPositionOfBone(objInfo.body);
    const playerPos = player.position;
    const forwardX = player.getForwardX();
    const forwardY = player.getForwardY();

    const camX = playerPos.x + forwardX;
    const camY = playerPos.y + forwardY;
    const camZ = bonePos.z;

    editCamera = mp.cameras.new(
        "attach_editor_camera",
        new mp.Vector3(camX, camY, camZ),
        new mp.Vector3(0, 0, 0),
        DEFAULT_CAMERA_FOV
    );
    editCamera.setActive(true);
    editCamera.pointAtPedBone(player.handle, boneIndex, 0, 0, 0, true);
    mp.game.cam.renderScriptCams(true, true, 1000, true, false);

    editInterval = setInterval(editAttachObject, 50);
}

function editAttachObject(): void {
    if (!editObject) return;

    mp.game.invoke("0xC11C18092C5530DC", player.handle, false); // SET_PED_CAN_HEAD_IK
    mp.game.invoke("0x6C3B4D6D13B4C841", player.handle, false); // SET_PED_CAN_ARM_IK
    mp.game.invoke("0xF2B7106D37947CE0", player.handle, false); // SET_PED_CAN_TORSO_IK
    mp.game.invoke("0xBAF20C5432058024", player.handle, false); // SET_PED_CAN_PLAY_GESTURE_ANIMS
    mp.game.invoke("0xF833DDBA3B104D43", player.handle, false, false); // SET_PED_CAN_PLAY_VISEME_ANIMS
    mp.game.invoke("0x6373D1349925A70E", player.handle, false); // SET_PED_CAN_PLAY_AMBIENT_ANIMS
    mp.game.invoke("0x0EB0585D15254740", player.handle, false); // SET_PED_CAN_PLAY_AMBIENT_BASE_ANIMS

    if (mp.keys.isDown(keyMovement.Space)) {
        const dist = editCamera!.getFov() === DEFAULT_CAMERA_FOV ? 1.2 : 2.0;
        const defaultPos = defaultCamera.getCoord();
        const defaultRot = defaultCamera.getRot(5);
        const position = editObject!.getCoords(true);
        const angle = (defaultRot.z * Math.PI) / 180;
        const x = position.x + dist * Math.sin(angle);
        const y = position.y + dist * Math.cos(angle);
        editCamera!.setCoord(x, y, defaultPos.z);
        return;
    }

    const pos = { x: 0, y: 0, z: 0 };
    let speed = 1.0;
    const movement = editState === MODE_ROT ? 1.0 : 0.01;

    if (mp.keys.isDown(keyMovement.Shift)) speed = 2.0;
    if (mp.keys.isDown(keyMovement.Left)) pos.x -= movement;
    if (mp.keys.isDown(keyMovement.Right)) pos.x += movement;
    if (mp.keys.isDown(keyMovement.Up)) pos.y += movement;
    if (mp.keys.isDown(keyMovement.Down)) pos.y -= movement;
    if (mp.keys.isDown(keyMovement.PageUp)) pos.z += movement;
    if (mp.keys.isDown(keyMovement.PageDown)) pos.z -= movement;

    pos.x *= speed;
    pos.y *= speed;
    pos.z *= speed;

    if (editState === MODE_MOVE) {
        objInfo.x += pos.x;
        objInfo.y += pos.y;
        objInfo.z += pos.z;
        editBrowser?.execute(`updateObjectCoords(${objInfo.x}, ${objInfo.y}, ${objInfo.z});`);
    } else {
        objInfo.rx += pos.x;
        objInfo.ry += pos.y;
        objInfo.rz += pos.z;
        editBrowser?.execute(`updateObjectRot(${objInfo.rx}, ${objInfo.ry}, ${objInfo.rz});`);
    }

    if (mp.keys.isDown(keyMovement.AltLeft)) {
        if (mp.keys.isDown(keyMovement.X)) {
            if (editState === MODE_MOVE && objInfo.x !== 0) objInfo.x = 0;
            else if (objInfo.rx !== 0) objInfo.rx = 0;
        }
        if (mp.keys.isDown(keyMovement.Y)) {
            if (editState === MODE_MOVE && objInfo.y !== 0) objInfo.y = 0;
            else if (objInfo.ry !== 0) objInfo.ry = 0;
        }
        if (mp.keys.isDown(keyMovement.Z)) {
            if (editState === MODE_MOVE && objInfo.z !== 0) objInfo.z = 0;
            else if (objInfo.rz !== 0) objInfo.rz = 0;
        }
    }

    editObject!.attachTo(
        player.handle,
        objInfo.body,
        objInfo.x,
        objInfo.y,
        objInfo.z,
        objInfo.rx,
        objInfo.ry,
        objInfo.rz,
        true,
        false,
        false,
        false,
        2,
        true
    );
}

mp.events.add("attachObject", (object: string) => {
    if (editObject) {
        mp.gui.chat.push(`${ATTACH_TITLE} You are already editing an object!`);
        return;
    }

    if (!editBrowser) {
        editBrowser = mp.browsers.new(BROWSER_URL);
    } else {
        editBrowser.execute("setupAttachEditor();");
        editBrowser.active = true;
    }

    editState = MODE_MOVE;
    objInfo.object = object;
    objInfo.x = objInfo.y = objInfo.z = 0;
    objInfo.rx = objInfo.ry = objInfo.rz = 0;

    player.freezePosition(true);
    mp.gui.cursor.show(true, true);
});

mp.events.add("closeEditorAttach", () => {
    player.freezePosition(false);
    if (editBrowser) editBrowser.active = false;
    mp.gui.cursor.show(false, false);
    mp.events.callRemote("finishAttach", JSON.stringify({ cancel: true }));
});

mp.events.add("removeObjectAttach", (objectId: number) => {
    if (objectId === -1) {
        mp.objects.forEach((e) => {
            if ((e as any).attach !== undefined) e.destroy();
        });
        return;
    }

    const obj = mp.objects.at(objectId);
    if (!obj) {
        mp.events.callRemote("finishAttach", JSON.stringify({ cancel: true }));
        return;
    }
    const att = (obj as any).attach;
    if (att) mp.gui.chat.push(`${ATTACH_TITLE} object ${att.objectName} removed!`);
    obj.destroy();
});

mp.events.add("editAttachObject", (objectId: number) => {
    const obj = mp.objects.at(objectId);
    if (!obj) {
        mp.events.callRemote("finishAttach", JSON.stringify({ cancel: true }));
        return;
    }

    mp.gui.cursor.show(false, false);

    const att = (obj as any).attach;
    editObject = obj;
    objInfo.body = att.body;
    objInfo.object = att.objectName;
    objInfo.x = att.pos.x;
    objInfo.y = att.pos.y;
    objInfo.z = att.pos.z;
    objInfo.rx = att.rot.x;
    objInfo.ry = att.rot.y;
    objInfo.rz = att.rot.z;
    objInfo.bodyName = att.boneName;
    objInfo.bodyIndex = att.boneIndex;

    setupCamera(att.boneIndex);
});

mp.events.add("startAttachObject", (boneIndex: number, boneName: string) => {
    mp.gui.chat.push(`${ATTACH_TITLE} You start the attach editor!`);
    mp.gui.cursor.show(false, false);

    const hashModel = mp.game.joaat(objInfo.object);
    const obj = mp.objects.new(hashModel, player.position, {
        rotation: new mp.Vector3(0, 0, 0),
        alpha: 255,
        dimension: player.dimension
    });

    if (!obj || obj.handle === 0) {
        mp.events.callRemote("finishAttach", JSON.stringify({ cancel: true }));
        if (editBrowser) editBrowser.active = false;
        player.freezePosition(false);
        mp.gui.chat.push(`${ATTACH_TITLE} invalid object!`);
        return;
    }

    setTimeout(() => {
        objInfo.bodyName = boneName;
        objInfo.bodyIndex = boneIndex;
        objInfo.body = player.getBoneIndex(boneIndex);
        obj.attachTo(player.handle, objInfo.body, 0, 0, 0, 0, 0, 0, true, false, false, false, 2, true);

        (obj as any).attach = {
            bodyName: boneName,
            body: objInfo.body,
            boneIndex,
            objectName: objInfo.object,
            pos: { x: 0, y: 0, z: 0 },
            rot: { x: 0, y: 0, z: 0 }
        };

        editObject = obj;
        setupCamera(boneIndex);
    }, 200);
});

mp.keys.bind(keysEditor.Enter, true, () => {
    if (!editObject || mp.gui.cursor.visible) return;
    mp.gui.chat.push(`${ATTACH_TITLE} FINISH`);

    const att = (editObject as any).attach;
    att.pos = { x: objInfo.x, y: objInfo.y, z: objInfo.z };
    att.rot = { x: objInfo.rx, y: objInfo.ry, z: objInfo.rz };
    att.editDate = new Date();

    mp.events.callRemote("finishAttach", JSON.stringify(objInfo));
    finishEdition();
});

mp.keys.bind(keysEditor.K, true, () => {
    if (!editObject || mp.gui.cursor.visible) return;
    mp.gui.chat.push(`${ATTACH_TITLE} RESET`);
    objInfo.x = objInfo.y = objInfo.z = 0;
    objInfo.rx = objInfo.ry = objInfo.rz = 0;
});

mp.keys.bind(keysEditor.R, true, () => {
    if (!editObject || mp.gui.cursor.visible) return;
    if (editState === MODE_MOVE) {
        editState = MODE_ROT;
        editBrowser?.execute("changeModeEditor('ROT');");
    } else {
        editState = MODE_MOVE;
        editBrowser?.execute("changeModeEditor('MOVEMENT');");
    }
});

mp.keys.bind(keysEditor.Back, true, () => {
    if (!editObject || mp.gui.cursor.visible) return;
    mp.gui.chat.push(`${ATTACH_TITLE} CANCEL`);
    mp.events.callRemote("finishAttach", JSON.stringify({ cancel: true }));
    finishEdition(true);
});

mp.keys.bind(keysEditor.L, true, () => {
    if (!editObject || mp.gui.cursor.visible) return;
    if (editCamera!.getFov() === DEFAULT_CAMERA_FOV) editCamera!.setFov(DEFAULT_CAMERA_FOV * 2);
    else editCamera!.setFov(DEFAULT_CAMERA_FOV);
});

let attachEditorEnabled = false;

mp.events.add("attachEditor:enable", () => { attachEditorEnabled = true; });
mp.events.add("attachEditor:disable", () => { attachEditorEnabled = false; });

mp.keys.bind(keysEditor.TAB, true, () => {
    if (!attachEditorEnabled) return;
    if (editObject || mp.gui.cursor.visible) return;

    const objects: Array<{ id: number; bodyName: string; objectName: string; editDate?: Date }> = [];
    mp.objects.forEach((e) => {
        const att = (e as any).attach;
        if (!att) return;
        objects.push({
            id: e.id,
            bodyName: att.bodyName,
            objectName: att.objectName,
            editDate: att.editDate
        });
    });

    if (!editBrowser) editBrowser = mp.browsers.new(BROWSER_URL);

    const objectsStr = JSON.stringify(objects).replace(/'/g, "\\'");
    editBrowser.execute(`objectsEdit = JSON.parse('${objectsStr}'); setupListAttachEdit();`);
    editBrowser.active = true;

    player.freezePosition(true);
    mp.gui.cursor.show(true, true);
    mp.events.callRemote("startEditAttachServer");
});

mp.events.add("render", () => {
    if (!editObject || mp.keys.isDown(keyMovement.Space)) return;
    mp.game.controls.disableAllControlActions(0);
    mp.game.controls.disableAllControlActions(1);
    mp.game.controls.disableAllControlActions(INPUT_MOVER);
});

// Attach editor is enabled via "attachEditor:enable" event (admin only)
