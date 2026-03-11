/**
 * Native compass for freeroam (drawn with mp.game.graphics).
 * Hidden when in arena (Hopouts has its own CEF compass).
 */

import { Browser } from "@classes/Browser.class";

const COMPASS_SHOW = true;
const POS_X = 0.5;
const POS_Y = 0.018;
const WIDTH = 0.22;
const FOV = 180;
const TICKS_BETWEEN = 9;

const BG = { x: 0.11, w: 0.24, h: 0.022, r: 0, g: 0, b: 0, a: 95 };

const CARDINAL = {
    textSize: 0.22,
    textOffset: 0.012,
    color: [255, 255, 255, 200],
    tickW: 0.0008,
    tickH: 0.01
};

const TICK = { w: 0.0008, h: 0.0025, r: 255, g: 255, b: 255, a: 200 };

function getDirection(dgr: number): string {
    dgr = ((dgr % 360) + 360) % 360;
    if (dgr < 22.5 || dgr >= 337.5) return "N";
    if (dgr >= 22.5 && dgr < 67.5) return "NE";
    if (dgr >= 67.5 && dgr < 112.5) return "E";
    if (dgr >= 112.5 && dgr < 157.5) return "S";
    if (dgr >= 157.5 && dgr < 202.5) return "SE";
    if (dgr >= 202.5 && dgr < 247.5) return "SW";
    if (dgr >= 247.5 && dgr < 292.5) return "W";
    return "NW";
}

const centerX = POS_X - WIDTH / 2;

/** Get compass heading from gameplay camera (where the mouse is looking), not player body. */
function getCameraHeadingDeg(): number {
    const cam = mp.cameras.new("gameplay");
    const dir = cam.getDirection();
    const rad = Math.atan2(dir.x, -dir.y);
    let deg = (rad * 180) / Math.PI;
    return ((deg % 360) + 360) % 360;
}

mp.events.add("render", () => {
    if (!COMPASS_SHOW) return;
    if (!mp.players.local.getVariable("loggedin")) return;
    if (mp.players.local.getHealth() <= 0) return;
    if (Browser.currentPage && Browser.currentPage !== "hud") return;

    const player = mp.players.local;
    if (!player || !mp.players.exists(player)) return;

    const headingDeg = getCameraHeadingDeg();
    const playerHeading = 360 - headingDeg;
    const pxPerDegree = WIDTH / FOV;
    let tickDegree = playerHeading - FOV / 2;
    const remainder = TICKS_BETWEEN - (tickDegree % TICKS_BETWEEN);
    let tickPos = centerX + remainder * pxPerDegree;
    tickDegree += remainder;

    mp.game.graphics.drawRect(0.5, POS_Y, BG.w, BG.h, BG.r, BG.g, BG.b, BG.a, false);

    while (tickPos < centerX + WIDTH) {
        if (tickDegree % 90 === 0) {
            mp.game.graphics.drawRect(
                tickPos,
                POS_Y,
                CARDINAL.tickW,
                CARDINAL.tickH,
                255,
                255,
                255,
                255,
                false
            );
            mp.game.graphics.drawText(
                getDirection(tickDegree) + " ",
                [tickPos, POS_Y + CARDINAL.textOffset],
                {
                    font: 4,
                    color: CARDINAL.color as [number, number, number, number],
                    scale: [CARDINAL.textSize, CARDINAL.textSize],
                    outline: true
                }
            );
        } else if (tickDegree % 45 === 0) {
            mp.game.graphics.drawRect(
                tickPos,
                POS_Y,
                TICK.w,
                TICK.h * 2,
                TICK.r,
                TICK.g,
                TICK.b,
                TICK.a,
                false
            );
        } else {
            mp.game.graphics.drawRect(
                tickPos,
                POS_Y,
                TICK.w,
                TICK.h,
                TICK.r,
                TICK.g,
                TICK.b,
                TICK.a,
                false
            );
        }
        tickDegree += TICKS_BETWEEN;
        tickPos += pxPerDegree * TICKS_BETWEEN;
    }
});
