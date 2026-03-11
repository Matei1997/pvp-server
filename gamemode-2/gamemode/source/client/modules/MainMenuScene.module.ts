import { Browser } from "@classes/Browser.class";

let isHidden = false;
let lastCursorX = 0;
let didInitRotateCursor = false;
const ROTATE_SENSITIVITY = 0.4;

function setPlayerVisible(show: boolean) {
    const player = mp.players.local;
    if (!player || !mp.players.exists(player)) return;

    if (show) {
        player.setAlpha(255);
        player.setVisible(true, false);
        mp.game.entity.setVisible(player.handle, true, false);
        player.setCollision(true, false);
        isHidden = false;
    } else {
        player.setAlpha(0);
        player.setVisible(false, false);
        mp.game.entity.setVisible(player.handle, false, false);
        isHidden = true;
    }
}

mp.events.add("client::mainmenu:scene", (data: any) => {
    const payload = typeof data === "string" ? JSON.parse(data) : data;
    const showPlayer = payload?.showPlayer === true;
    Browser.mainMenuClothingActive = showPlayer;
    setPlayerVisible(showPlayer);
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
    const player = mp.players.local;
    if (!player || !mp.players.exists(player)) return;
    const [x] = mp.gui.cursor.position;
    if (!didInitRotateCursor) {
        lastCursorX = x;
        didInitRotateCursor = true;
        return;
    }
    const delta = x - lastCursorX;
    player.heading += delta * ROTATE_SENSITIVITY;
    lastCursorX = x;
});

mp.events.add("client::cef:close", () => {
    Browser.mainMenuClothingActive = false;
    Browser.mainMenuClothingRotateHeld = false;
    if (isHidden) setPlayerVisible(true);
});
