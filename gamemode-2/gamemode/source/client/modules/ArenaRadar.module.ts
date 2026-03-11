/**
 * Keep minimap visible and hide GTA native health/armor bars (freeroam + arena).
 * In arena, also set radar zoom.
 */

import { Browser } from "@classes/Browser.class";

const RADAR_ZOOM = 100;
const MINIMAP_SCALEFORM = "minimap";
const SETUP_HEALTH_ARMOUR = "SETUP_HEALTH_ARMOUR";
const HEALTH_TYPE_HIDE = 3; // Golf mode = hides bars

let minimapScaleform: number | null = null;

function ensureMinimapScaleform(): boolean {
    if (minimapScaleform === null) {
        minimapScaleform = mp.game.graphics.requestScaleformMovie(MINIMAP_SCALEFORM);
    }
    return mp.game.graphics.hasScaleformMovieLoaded(minimapScaleform);
}

mp.events.add("render", () => {
    const page = Browser.currentPage;
    const onHud = page === "hud";
    const onArenaHud = page === "arena_hud";
    // When Esc -> map -> Esc, currentPage can be undefined briefly; keep applying if we were on hud
    const shouldApply = onHud || onArenaHud || (page === undefined && Browser.lastBasePage === "hud");
    if (!shouldApply) return;

    // Force minimap to show every frame (fixes it disappearing and reappearing after Escape)
    mp.game.ui.displayRadar(true);

    if (onArenaHud) {
        mp.game.ui.setRadarZoom(RADAR_ZOOM);
    }

    // Hide GTA native health/armor bars below minimap (freeroam + arena + when returning from map)
    if (ensureMinimapScaleform()) {
        const pushed = mp.game.graphics.pushScaleformMovieFunction(minimapScaleform!, SETUP_HEALTH_ARMOUR);
        if (pushed) {
            mp.game.graphics.pushScaleformMovieFunctionParameterInt(HEALTH_TYPE_HIDE);
            mp.game.graphics.popScaleformMovieFunctionVoid();
        }
    }
});
