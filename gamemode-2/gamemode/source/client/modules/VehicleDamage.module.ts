/**
 * Vehicle damage & breakdown (inspired by alt:V vehicle-damage).
 * - Engine dies when health <= 0 (car won't drive).
 * - Game already shows smoke when engine is damaged (< 400); we just enforce engine-off when dead.
 * - Optional: dampen in-air so cars don't fly forever.
 */

const ENGINE_DEAD_THRESHOLD = 0;
const ENGINE_SMOKING_THRESHOLD = 400;
const AIR_DAMPEN_CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 17, 18, 19, 20, 21, 22]; // cars, bikes, boats; exclude planes(15), helis(16), trains, etc.
const RENDER_TICK_SKIP = 5; // check every 6th frame (~10 Hz)

let tick = 0;

function isPlaneOrHeli(vehicle: VehicleMp): boolean {
    const c = vehicle.getClass();
    return c === 15 || c === 16;
}

function isDriver(vehicle: VehicleMp): boolean {
    return vehicle.getPedInSeat(-1) === mp.players.local.handle;
}

mp.events.add("render", () => {
    const vehicle = mp.players.local.vehicle;
    if (!vehicle || !mp.vehicles.exists(vehicle) || !isDriver(vehicle) || isPlaneOrHeli(vehicle)) return;

    tick++;
    if (tick % (RENDER_TICK_SKIP + 1) !== 0) return;

    let engineHealth: number;
    try {
        engineHealth = vehicle.getEngineHealth();
    } catch {
        return;
    }

    // Engine dead: stop engine so car doesn't keep driving
    if (engineHealth <= ENGINE_DEAD_THRESHOLD) {
        vehicle.setEngineOn(false, false, false);
    }

    // Optional: when in air (cars/bikes), apply extra gravity so they don't float forever
    const inAir = mp.game.entity.isInAir(vehicle.handle);
    if (inAir && AIR_DAMPEN_CLASSES.includes(vehicle.getClass())) {
        const v = vehicle.getVelocity();
        if (v.z > 0) {
            vehicle.setVelocity(v.x, v.y, v.z - 0.15);
        }
    }
});
