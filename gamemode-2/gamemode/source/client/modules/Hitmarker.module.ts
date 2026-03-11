/**
 * Floating damage numbers (hitmarker) - shows damage dealt at the hit position.
 * Server-driven via client:ShowHitmarker when using damage sync.
 * Cancels default GTA damage for player-vs-player so server controls it.
 */

interface Vec3 {
    x: number;
    y: number;
    z: number;
}

interface HitObject {
    amount: number;
    position: Vec3;
    count: number;
}

class HitText {
    private list: HitObject[] = [];

    add(amount: number, position: Vec3): void {
        this.list.push({ amount, position: { x: position.x, y: position.y, z: position.z }, count: 0 });
    }

    render(): void {
        for (let i = this.list.length - 1; i >= 0; i--) {
            const element = this.list[i];
            mp.game.graphics.drawText(element.amount.toString(), [element.position.x, element.position.y, element.position.z + 1.4], {
                font: 2,
                centre: true,
                color: [255, 255, 255, 155 - element.count],
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

// Server-driven hitmarker (damage sync)
mp.events.add("client:ShowHitmarker", (damage: number, x: number, y: number, z: number, _status: number) => {
    hits.add(Math.round(damage), { x, y, z });
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
