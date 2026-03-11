/**
 * Streams player position and heading to CEF for custom minimap when in arena.
 */

import { Browser } from "@classes/Browser.class";

const THROTTLE_MS = 80;
let lastSent = 0;

mp.events.add("render", () => {
    if (Browser.currentPage !== "arena_hud") return;

    const now = Date.now();
    if (now - lastSent < THROTTLE_MS) return;

    const player = mp.players.local;
    if (!player || !mp.players.exists(player)) return;

    const pos = player.position;
    const heading = player.getHeading();

    mp.events.call("client::eventManager", "cef::arena:setMinimapData", {
        x: pos.x,
        y: pos.y,
        heading
    });
    lastSent = now;
});
