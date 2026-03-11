/**
 * Shooting range - 45 targets with zone-based scoring (1-5 points).
 * /poligon - teleport and start
 */

const TARGET_POSITIONS: [number, number, number, number][] = [
    [817.58141113281, -2171.3816894531, 29.667030334473, 1.4801919460297],
    [819.58141113281, -2171.3816894531, 29.667030334473, 1.4801919460297],
    [821.58141113281, -2171.3816894531, 29.667030334473, 1.4801919460297],
    [823.58141113281, -2171.3816894531, 29.667030334473, 1.4801919460297],
    [825.58141113281, -2171.3816894531, 29.667030334473, 1.4801919460297],
    [817.57416699219, -2191.6252441406, 29.66703414917, 1.9731273651123],
    [819.57416699219, -2191.6252441406, 29.66703414917, 1.9731273651123],
    [821.57416699219, -2191.6252441406, 29.66703414917, 1.9731273651123],
    [823.57416699219, -2191.6252441406, 29.66703414917, 1.9731273651123],
    [825.57416699219, -2191.6252441406, 29.66703414917, 1.9731273651123],
    [826.5860134667969, -2180.5102539063, 29.667032241821, 357.02941894531],
    [824.5860134667969, -2180.5102539063, 29.667032241821, 357.02941894531],
    [822.5860134667969, -2180.5102539063, 29.667032241821, 357.02941894531],
    [820.5860134667969, -2180.5102539063, 29.667032241821, 357.02941894531],
    [818.5760134667969, -2180.5102539063, 29.667032241821, 357.02941894531],
    [816.590134667969, -2180.5102539063, 29.667032241821, 357.02941894531]
];

const TARGET_MODEL = mp.game.joaat("prop_range_target_01");
const TOTAL_TARGETS = 45;

let target: ObjectMp | null = null;
let currentCoords: [number, number, number, number] | null = null;
let targetsLeft = TOTAL_TARGETS;
let isStarted = false;
let points = 0;

function getInterval(): number {
    if (targetsLeft > 20) return 3000;
    if (targetsLeft > 10) return 2500;
    return 2000;
}

function spawnNextTarget(): void {
    if (!isStarted || targetsLeft <= 0) return;

    const random = Math.floor(Math.random() * TARGET_POSITIONS.length);
    currentCoords = TARGET_POSITIONS[random];

    if (target) {
        target.destroy();
        target = null;
    }

    const [x, y, z] = currentCoords;
    target = mp.objects.new(TARGET_MODEL, new mp.Vector3(x, y, z + 1), {
        rotation: new mp.Vector3(0, 0, 2.3),
        alpha: 255,
        dimension: mp.players.local.dimension
    });

    targetsLeft--;

    if (targetsLeft > 0) {
        setTimeout(spawnNextTarget, getInterval());
    } else {
        target.destroy();
        target = null;
        currentCoords = null;
        mp.events.callRemote("FinishedPoligon", points);
        isStarted = false;
    }
}

function getPointsForHit(): number {
    if (!currentCoords) return 0;
    const [cx, cy, cz] = currentCoords;

    if (mp.game.gameplay.hasBulletImpactedInBox(cx + 0.06, cy + 0.12, cz + 0.46, cx - 0.06, cy, cz + 0.6, true, true)) return 5;
    if (mp.game.gameplay.hasBulletImpactedInBox(cx + 0.11, cy + 0.12, cz + 0.41, cx - 0.11, cy, cz + 0.69, true, true)) return 4;
    if (mp.game.gameplay.hasBulletImpactedInBox(cx + 0.16, cy + 0.12, cz + 0.33, cx - 0.16, cy, cz + 0.76, true, true)) return 3;
    if (mp.game.gameplay.hasBulletImpactedInBox(cx + 0.21, cy + 0.12, cz + 0.25, cx - 0.21, cy, cz + 0.85, true, true)) return 2;
    return 1;
}

mp.events.add("client::shootingrange:start", () => {
    isStarted = true;
    targetsLeft = TOTAL_TARGETS;
    points = 0;
    spawnNextTarget();
});

mp.events.add("render", () => {
    if (target && currentCoords && target.hasBeenDamagedBy(mp.players.local.handle, true)) {
        points += getPointsForHit();
        target.destroy();
        target = null;
        currentCoords = null;
    }

    if (isStarted) {
        mp.game.graphics.drawText(`POINTS: ${points}  TARGETS LEFT: ${targetsLeft}`, [0.5, 0.005], {
            font: 7,
            color: [255, 255, 255, 185],
            scale: [1.2, 1.2],
            outline: true
        });
    }
});
