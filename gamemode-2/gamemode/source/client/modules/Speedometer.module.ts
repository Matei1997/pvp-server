/**
 * Vehicle speedometer - RPM needle + speed display.
 * Replaces the default HUD speedometer when in a vehicle (driver seat).
 */

import { Client } from "@classes/Client.class";

const SPEEDOMETER_URL = "package://speedometer/index.html";

let speedometerBrowser: BrowserMp | null = null;

function showSpeedometer(): void {
    if (speedometerBrowser) return;
    speedometerBrowser = mp.browsers.new(SPEEDOMETER_URL);
}

function hideSpeedometer(): void {
    if (speedometerBrowser) {
        speedometerBrowser.destroy();
        speedometerBrowser = null;
    }
}

mp.events.add("playerEnterVehicle", (vehicle: VehicleMp, seat: number) => {
    if (seat !== -1) return;
    if (vehicle.getClass() === RageEnums.Vehicle.Classes.CYCLES) return;
    if (!mp.players.local.getVariable("loggedin")) return;

    showSpeedometer();
    Client.hud.showVehicleSpeedometer(false);
});

mp.events.add("playerLeaveVehicle", () => {
    hideSpeedometer();
});

mp.events.add("render", () => {
    const vehicle = mp.players.local.vehicle;
    if (!vehicle || !speedometerBrowser || vehicle.getPedInSeat(-1) !== mp.players.local.handle) return;

    const speed = vehicle.getSpeed() * 3.6;
    const rpm = vehicle.rpm ?? 0;
    const gear = vehicle.gear ?? 0;
    const engine = vehicle.getIsEngineRunning?.() ?? true;
    const lightsState = vehicle.getLightsState?.(0, 1);
    const lights = lightsState?.lightsOn ?? false;
    const locked = vehicle.getDoorLockStatus?.() === 2;

    speedometerBrowser.execute(`setSpeedValue(${speed});`);
    speedometerBrowser.execute(`setRPMValue(${rpm});`);
    speedometerBrowser.execute(`setVehicleState(${gear}, ${engine}, ${lights}, ${locked});`);
});
