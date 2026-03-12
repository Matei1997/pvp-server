/**
 * Floating damage numbers (hitmarker) - shows damage dealt at the hit position.
 * Server-driven via client:ShowHitmarker when using damage sync.
 * Cancels default GTA damage for player-vs-player so server controls it.
 * When in arena, also forwards to CEF for overlay damage numbers.
 */

import { Browser } from "@classes/Browser.class";

interface Vec3 {
    x: number;
    y: number;
    z: number;
}

/** 1=health (white), 2=armour (yellow), 3=head (red) */
const HITMARKER_COLORS: Record<number, [number, number, number]> = {
    1: [255, 255, 255],
    2: [255, 220, 80],
    3: [255, 80, 80]
};

interface HitObject {
    amount: number;
    position: Vec3;
    count: number;
    status: number;
}

class HitText {
    private list: HitObject[] = [];

    add(amount: number, position: Vec3, status: number): void {
        this.list.push({ amount, position: { x: position.x, y: position.y, z: position.z }, count: 0, status });
    }

    render(): void {
        for (let i = this.list.length - 1; i >= 0; i--) {
            const element = this.list[i];
            const rgb = HITMARKER_COLORS[element.status] ?? HITMARKER_COLORS[1];
            mp.game.graphics.drawText(element.amount.toString(), [element.position.x, element.position.y, element.position.z + 1.4], {
                font: 2,
                centre: true,
                color: [rgb[0], rgb[1], rgb[2], 155 - element.count],
                scale: [0.3, 0.3],
                outline: true
            });
            element.count += 3;
            element.position.z += 0.03;

            if (element.count > 155) {
                this.list.splice(i, 1);
            }
        }
    }
}

const hits = new HitText();

// Server-driven hitmarker (damage sync). status: 1=health, 2=armour, 3=head. hitStatusStr: "health"|"armor"|"headshot" for CEF.
mp.events.add("client:ShowHitmarker", (damage: number, x: number, y: number, z: number, status: number, hitStatusStr?: string) => {
    hits.add(Math.round(damage), { x, y, z }, status ?? 1);

    if (Browser.currentPage === "arena_hud" && hitStatusStr) {
        const screen = mp.game.graphics.world3dToScreen2d(new mp.Vector3(x, y, z + 1));
        if (screen) {
            mp.events.call("client::eventManager", "cef::arena:damageNumber", {
                damage: Math.round(damage),
                status: hitStatusStr,
                screenX: screen.x,
                screenY: screen.y
            });
        }
    }
});

// Cancel default damage for PvP so server-authoritative sync controls it
mp.events.add("outgoingDamage", (sourceEntity: EntityMp, targetEntity: EntityMp) => {
    if (sourceEntity?.handle !== mp.players.local.handle) return false;
    if (targetEntity?.type === "player") return true; // cancel default
    return false;
});

mp.events.add("render", () => {
    hits.render();
});
