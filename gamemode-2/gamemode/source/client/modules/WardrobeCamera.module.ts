let wardrobeCam: CameraMp | null = null;
let camActive = false;
let savedHeading = 0;
let savedPosition: Vector3 | null = null;
let wasFrozen = false;
let loadInterval: ReturnType<typeof setInterval> | null = null;

const WARDROBE_PLAYER_POS = new mp.Vector3(-75.93680572509766, -1410.941162109375, 29.320751190185547 - 1);
const WARDROBE_PLAYER_HEADING = 87.1931381225586;
const WARDROBE_CAM_POS = new mp.Vector3(-79.28535461425781, -1409.435791015625, 29.320751190185547);
const WARDROBE_CAM_FOV = 36;

function pointCameraAtPlayer(cam: CameraMp, player: PlayerMp) {
    const target = new mp.Vector3(
        WARDROBE_PLAYER_POS.x,
        WARDROBE_PLAYER_POS.y,
        WARDROBE_PLAYER_POS.z + 1
    );
    cam.pointAtCoord(target.x, target.y, target.z);
}

mp.events.add("client::wardrobeCamera:start", () => {
    if (camActive) return;
    const player = mp.players.local;
    if (!player || !mp.players.exists(player)) return;

    camActive = true;
    savedHeading = player.heading;
    savedPosition = new mp.Vector3(player.position.x, player.position.y, player.position.z);
    wasFrozen = (player as any).isFrozen?.() ?? false;

    player.setAlpha(255);
    player.setVisible(true, false);
    mp.game.entity.setVisible(player.handle, true, false);
    player.setCollision(true, false);

    mp.game.streaming.requestCollisionAtCoord(WARDROBE_CAM_POS.x, WARDROBE_CAM_POS.y, WARDROBE_CAM_POS.z);
    mp.game.streaming.requestAdditionalCollisionAtCoord(WARDROBE_CAM_POS.x, WARDROBE_CAM_POS.y, WARDROBE_CAM_POS.z);
    if ((mp.game.streaming as any).loadScene) {
        (mp.game.streaming as any).loadScene(WARDROBE_PLAYER_POS.x, WARDROBE_PLAYER_POS.y, WARDROBE_PLAYER_POS.z);
    }

    player.setCoords(WARDROBE_PLAYER_POS.x, WARDROBE_PLAYER_POS.y, WARDROBE_PLAYER_POS.z, false, false, false, true);
    player.heading = WARDROBE_PLAYER_HEADING;
    player.clearTasks();
    player.freezePosition(true);

    const startAt = Date.now();
    if (loadInterval) clearInterval(loadInterval);
    loadInterval = setInterval(() => {
        if (!mp.players.exists(player)) return;
        if (player.hasCollisionLoadedAround() || Date.now() - startAt > 2000) {
            if (loadInterval) clearInterval(loadInterval);
            loadInterval = null;
            wardrobeCam = mp.cameras.new("wardrobe_preview", WARDROBE_CAM_POS, new mp.Vector3(0, 0, 0), WARDROBE_CAM_FOV);
            pointCameraAtPlayer(wardrobeCam, player);
            wardrobeCam.setActive(true);
            mp.game.cam.renderScriptCams(true, true, 300, true, false, 0);
        }
    }, 50);
});

mp.events.add("client::wardrobeCamera:stop", () => {
    if (!camActive) return;
    camActive = false;
    const player = mp.players.local;

    if (loadInterval) {
        clearInterval(loadInterval);
        loadInterval = null;
    }
    if (wardrobeCam) {
        wardrobeCam.setActive(false);
        wardrobeCam.destroy();
        wardrobeCam = null;
    }
    mp.game.cam.renderScriptCams(false, true, 300, true, false, 0);

    if (player && mp.players.exists(player)) {
        player.heading = savedHeading;
        if (savedPosition) player.setCoords(savedPosition.x, savedPosition.y, savedPosition.z, false, false, false, false);
        player.freezePosition(wasFrozen);
    }
});

mp.events.add("render", () => {
    if (!camActive || !wardrobeCam) return;
    const player = mp.players.local;
    if (!player || !mp.players.exists(player)) return;
    wardrobeCam.setCoord(WARDROBE_CAM_POS.x, WARDROBE_CAM_POS.y, WARDROBE_CAM_POS.z);
    pointCameraAtPlayer(wardrobeCam, player);
});
