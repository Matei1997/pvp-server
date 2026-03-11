/**
 * Client-side arena zone rendering.
 * Storm = purple wall at zone edge (visibly moving) + filled storm outside safe zone. Sound + FX when outside.
 */

let zoneActive = false;
let zoneCenterX = 0;
let zoneCenterY = 0;
let zoneRadius = 200;
let zoneBlip: number | null = null;
let zonePhase = 0;
let zoneTotalPhases = 0;
let zonePhaseTimeLeft = 0;
let zonePhaseUpdatedAt = 0;
let lastWarnPhase = -1;
let warnUntil = 0;
let stormAlpha = 0;
let lastStormSoundAt = 0;
let stormAmbientSoundId: number | null = null;
let lastWallParticleAt = 0;

const ZONE_SEGMENTS = 128;
const ZONE_WALL_HEIGHT = 65;
const STORM_WARN_SECONDS = 12;
const STORM_FILL_RINGS = 5;       // concentric rings outside wall to "fill" the storm
const STORM_FILL_MAX_RADIUS = 120; // how far out the storm fill extends (from wall)
const WALL_SHIMMER_AMOUNT = 0.8;  // radial wobble so wall looks like it's moving
const STORM_AMBIENT_INTERVAL_MS = 4000;
const WALL_PARTICLE_INTERVAL_MS = 800;

// Purple wall (both faces so it reads as storm boundary)
const WALL_PURPLE = { r: 130, g: 60, b: 200, a: 160 };
const WALL_PURPLE_DARK = { r: 90, g: 40, b: 150, a: 130 };
// Storm fill (area outside safe zone) – purple fog bands
const STORM_FILL = { r: 100, g: 50, b: 160, a: 35 };

mp.events.add("client::arena:requestCollision", (x: number, y: number, z: number) => {
    mp.game.streaming.requestCollisionAtCoord(x, y, z);
});

mp.events.add("client::arena:zoneInit", (...args: any[]) => {
    const arr = Array.isArray(args[0]) ? args[0] : args;
    const cx = arr[0];
    const cy = arr[1];
    const radius = arr[2];
    const safeX = Number(cx);
    const safeY = Number(cy);
    const safeRadius = Number(radius);
    if (!Number.isFinite(safeX) || !Number.isFinite(safeY) || !Number.isFinite(safeRadius) || safeRadius <= 0) {
        return;
    }
    zoneActive = true;
    zoneCenterX = safeX;
    zoneCenterY = safeY;
    zoneRadius = safeRadius;
    zonePhaseUpdatedAt = Date.now();

    if (zoneBlip) {
        try { (mp.game.ui as any).removeBlip(zoneBlip); } catch {}
    }
    zoneBlip = (mp.game.ui as any).addBlipForRadius(safeX, safeY, 0, safeRadius);
    if (zoneBlip) {
        (mp.game.ui as any).setBlipColour(zoneBlip, 3);
        (mp.game.ui as any).setBlipAlpha(zoneBlip, 90);
    }
});

mp.events.add("client::arena:zoneUpdate", (...args: any[]) => {
    const arr = Array.isArray(args[0]) ? args[0] : args;
    const cx = arr[0];
    const cy = arr[1];
    const radius = arr[2];
    const safeX = Number(cx);
    const safeY = Number(cy);
    const safeRadius = Number(radius);
    if (!Number.isFinite(safeX) || !Number.isFinite(safeY) || !Number.isFinite(safeRadius) || safeRadius <= 0) {
        return;
    }
    const phase = arr[3] ?? 0;
    const totalPhases = arr[4] ?? 1;
    const timeLeft = arr[5] ?? 0;
    zoneActive = true;
    zoneCenterX = safeX;
    zoneCenterY = safeY;
    zoneRadius = safeRadius;
    zonePhase = phase;
    zoneTotalPhases = totalPhases;
    zonePhaseTimeLeft = timeLeft;
    zonePhaseUpdatedAt = Date.now();

    if (zonePhaseTimeLeft <= STORM_WARN_SECONDS && lastWarnPhase !== zonePhase) {
        lastWarnPhase = zonePhase;
        warnUntil = Date.now() + 3500;
        mp.game.audio.playSoundFrontend(-1, "TIMER_STOP", "HUD_MINI_GAME_SOUNDSET", true);
    }

    if (zoneBlip) {
        try { (mp.game.ui as any).removeBlip(zoneBlip); } catch {}
    }
    zoneBlip = (mp.game.ui as any).addBlipForRadius(safeX, safeY, 0, safeRadius);
    if (zoneBlip) {
        (mp.game.ui as any).setBlipColour(zoneBlip, 3);
        (mp.game.ui as any).setBlipAlpha(zoneBlip, 90);
    }
});

mp.events.add("client::arena:zoneClear", () => {
    zoneActive = false;
    zonePhase = 0;
    zoneTotalPhases = 0;
    zonePhaseTimeLeft = 0;
    zonePhaseUpdatedAt = 0;
    lastWarnPhase = -1;
    warnUntil = 0;
    stormAlpha = 0;
    lastStormSoundAt = 0;
    lastWallParticleAt = 0;
    if (stormAmbientSoundId !== null) {
        try { mp.game.audio.stopSound(stormAmbientSoundId); } catch {}
        try { mp.game.audio.releaseSoundId(stormAmbientSoundId); } catch {}
        stormAmbientSoundId = null;
    }
    mp.game.graphics.clearTimecycleModifier();
    if (zoneBlip) {
        try { (mp.game.ui as any).removeBlip(zoneBlip); } catch {}
        zoneBlip = null;
    }
});

function drawWallQuad(
    x1: number, y1: number, zBot: number, zTop: number,
    x2: number, y2: number,
    r: number, g: number, b: number, a: number
) {
    mp.game.graphics.drawPoly(x1, y1, zBot, x2, y2, zBot, x2, y2, zTop, r, g, b, a);
    mp.game.graphics.drawPoly(x1, y1, zBot, x2, y2, zTop, x1, y1, zTop, r, g, b, a);
}

/** Draw a filled ring band (storm fill) between inner and outer radius at given Z. */
function drawStormFillBand(innerR: number, outerR: number, z: number, r: number, g: number, b: number, a: number) {
    for (let i = 0; i < ZONE_SEGMENTS; i++) {
        const angle1 = (i / ZONE_SEGMENTS) * Math.PI * 2;
        const angle2 = ((i + 1) / ZONE_SEGMENTS) * Math.PI * 2;
        const x1 = zoneCenterX + Math.cos(angle1) * innerR;
        const y1 = zoneCenterY + Math.sin(angle1) * innerR;
        const x2 = zoneCenterX + Math.cos(angle2) * innerR;
        const y2 = zoneCenterY + Math.sin(angle2) * innerR;
        const xo1 = zoneCenterX + Math.cos(angle1) * outerR;
        const yo1 = zoneCenterY + Math.sin(angle1) * outerR;
        const xo2 = zoneCenterX + Math.cos(angle2) * outerR;
        const yo2 = zoneCenterY + Math.sin(angle2) * outerR;
        mp.game.graphics.drawPoly(x1, y1, z, x2, y2, z, xo2, yo2, z, r, g, b, a);
        mp.game.graphics.drawPoly(x1, y1, z, xo2, yo2, z, xo1, yo1, z, r, g, b, a);
    }
}

mp.events.add("render", () => {
    if (!zoneActive || zoneRadius <= 0) return;

    const now = Date.now();
    const playerZ = mp.players.local.position.z;
    const groundZ = playerZ - 2;
    const topZ = groundZ + ZONE_WALL_HEIGHT;
    const player = mp.players.local;
    const dx = player.position.x - zoneCenterX;
    const dy = player.position.y - zoneCenterY;
    const distSq = dx * dx + dy * dy;
    const isOutside = distSq > (zoneRadius * zoneRadius);

    const pulse = (Math.sin(now / 400) + 1) * 0.5;
    const wallAlpha = Math.floor(WALL_PURPLE.a * (0.88 + pulse * 0.12));
    const wallAlphaDark = Math.floor(WALL_PURPLE_DARK.a * (0.9 + pulse * 0.1));
    // Shimmer: radial wobble so the wall looks like it's moving inward
    const shimmer = Math.sin(now / 200 + 0) * WALL_SHIMMER_AMOUNT;
    const shimmer2 = Math.sin(now / 200 + Math.PI * 0.5) * WALL_SHIMMER_AMOUNT;

    // ---- 1) Storm fill: everything OUTSIDE the safe zone is "filled" with purple storm (concentric rings)
    const bandWidth = STORM_FILL_MAX_RADIUS / STORM_FILL_RINGS;
    for (let k = 0; k < STORM_FILL_RINGS; k++) {
        const innerR = zoneRadius + k * bandWidth;
        const outerR = zoneRadius + (k + 1) * bandWidth;
        const fade = 1 - (k / STORM_FILL_RINGS) * 0.6;
        const a = Math.floor(STORM_FILL.a * fade * (0.7 + pulse * 0.3));
        drawStormFillBand(innerR, outerR, groundZ, STORM_FILL.r, STORM_FILL.g, STORM_FILL.b, a);
        drawStormFillBand(innerR, outerR, topZ * 0.5, STORM_FILL.r, STORM_FILL.g, STORM_FILL.b, Math.floor(a * 0.6));
    }

    // ---- 2) Purple wall at safe zone boundary (with shimmer so it visibly moves)
    for (let i = 0; i < ZONE_SEGMENTS; i++) {
        const angle1 = (i / ZONE_SEGMENTS) * Math.PI * 2;
        const angle2 = ((i + 1) / ZONE_SEGMENTS) * Math.PI * 2;
        const wobble1 = shimmer * Math.sin(angle1 * 4) + shimmer2 * Math.cos(angle1 * 4);
        const wobble2 = shimmer * Math.sin(angle2 * 4) + shimmer2 * Math.cos(angle2 * 4);
        const r1 = zoneRadius + wobble1;
        const r2 = zoneRadius + wobble2;

        const x1 = zoneCenterX + Math.cos(angle1) * r1;
        const y1 = zoneCenterY + Math.sin(angle1) * r1;
        const x2 = zoneCenterX + Math.cos(angle2) * r2;
        const y2 = zoneCenterY + Math.sin(angle2) * r2;

        const glowR1 = zoneRadius + 2.5 + wobble1;
        const glowR2 = zoneRadius + 2.5 + wobble2;
        const xo1 = zoneCenterX + Math.cos(angle1) * glowR1;
        const yo1 = zoneCenterY + Math.sin(angle1) * glowR1;
        const xo2 = zoneCenterX + Math.cos(angle2) * glowR2;
        const yo2 = zoneCenterY + Math.sin(angle2) * glowR2;

        drawWallQuad(x1, y1, groundZ, topZ, x2, y2, WALL_PURPLE.r, WALL_PURPLE.g, WALL_PURPLE.b, wallAlpha);
        drawWallQuad(x2, y2, groundZ, topZ, x1, y1, WALL_PURPLE_DARK.r, WALL_PURPLE_DARK.g, WALL_PURPLE_DARK.b, wallAlphaDark);
        drawWallQuad(xo1, yo1, groundZ, topZ, xo2, yo2, 160, 80, 220, Math.floor(50 + pulse * 20));
    }

    // ---- 3) Outside = in storm: screen FX, sound, ambient
    if (isOutside) {
        stormAlpha = Math.min(140, stormAlpha + 5);
        mp.game.graphics.setTimecycleModifier("MP_Powerplay_blend");
        mp.game.graphics.setTimecycleModifierStrength(0.85);

        if (now - lastStormSoundAt > 2200) {
            lastStormSoundAt = now;
            mp.game.audio.playSoundFrontend(-1, "Beep_Red", "DLC_HEIST_HACKING_SNAKE_SOUNDS", true);
        }
        if (stormAmbientSoundId === null) {
            try {
                stormAmbientSoundId = mp.game.audio.getSoundId();
                mp.game.audio.playSoundFromCoord(
                    stormAmbientSoundId,
                    "Wind",
                    zoneCenterX,
                    zoneCenterY,
                    playerZ,
                    "SCRIPTED_SOUNDSET",
                    false,
                    80,
                    false
                );
            } catch {
                stormAmbientSoundId = null;
            }
        }
        if (now - lastWallParticleAt > WALL_PARTICLE_INTERVAL_MS) {
            lastWallParticleAt = now;
            const angle = ((now * 0.003) % (Math.PI * 2));
            const ax = zoneCenterX + Math.cos(angle) * zoneRadius;
            const ay = zoneCenterY + Math.sin(angle) * zoneRadius;
            try {
                if (!mp.game.streaming.hasNamedPtfxAssetLoaded("core")) {
                    mp.game.streaming.requestNamedPtfxAsset("core");
                }
                if (mp.game.streaming.hasNamedPtfxAssetLoaded("core")) {
                    mp.game.graphics.startParticleFxNonLoopedAtCoord(
                        "exp_grd_bzgas_smoke",
                        ax, ay, groundZ + 2,
                        0, 0, 0,
                        0.5, false, false, false
                    );
                }
            } catch {
                // ignore if ptfx not available
            }
        }
    } else {
        stormAlpha = Math.max(0, stormAlpha - 10);
        if (stormAlpha === 0) {
            mp.game.graphics.clearTimecycleModifier();
        }
        if (stormAmbientSoundId !== null) {
            try { mp.game.audio.stopSound(stormAmbientSoundId); } catch {}
            try { mp.game.audio.releaseSoundId(stormAmbientSoundId); } catch {}
            stormAmbientSoundId = null;
        }
    }

    if (stormAlpha > 0) {
        mp.game.graphics.drawRect(0.5, 0.5, 1, 1, 100, 50, 160, stormAlpha, false);
    }

    if (warnUntil > now) {
        mp.game.graphics.drawText("STORM INCOMING", [0.5, 0.18], {
            font: 4,
            color: [180, 120, 255, 240],
            scale: [0.65, 0.65],
            outline: true,
            centre: true
        });
    }
});
