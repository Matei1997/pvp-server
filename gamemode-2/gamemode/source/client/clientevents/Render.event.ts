import { Client } from "@classes/Client.class";
import { Browser } from "@classes/Browser.class";

// INPUT_LOOK_BEHIND = 26 - disable on foot so C is crouch; allow in vehicle for look-behind
const INPUT_LOOK_BEHIND = 26;

mp.events.add("render", () => {
    if (!mp.players.local.getVariable("loggedin")) return;
    mp.game.cam.invalidateIdle();
    mp.game.cam.invalidateVehicleIdle();

    // Disable look-behind when on foot (C = crouch); keep it in vehicle
    if (!mp.players.local.vehicle) {
        mp.game.controls.disableControlAction(0, INPUT_LOOK_BEHIND, true);
    }

    if (mp.players.local.vehicle && mp.players.local.vehicle.getPedInSeat(-1) === mp.players.local.handle) {
        const vehicleSpeed = mp.players.local.vehicle.getSpeed() * 3.6;
        Client.hud.setSpeedometerData("speed", vehicleSpeed);
        Client.hud.setSpeedometerData("gear", mp.players.local.vehicle.gear);

        Client.hud.setSpeedometerData("engine", mp.players.local.vehicle.getIsEngineRunning());
        Client.hud.setSpeedometerData("lights", mp.players.local.vehicle.getLightsState(0, 1).lightsOn);
        Client.hud.setSpeedometerData("locked", mp.players.local.vehicle.getDoorLockStatus() === 2);
    }
    /**
     * Weapon related actions
     */
    if (Browser.currentPage !== "arena_hud") {
        //Disables weapon wheel selection
        mp.game.controls.disableControlAction(2, 37, true);
        mp.game.controls.disableControlAction(32, 157, true); // INPUT_SELECT_WEAPON_UNARMED
        mp.game.controls.disableControlAction(32, 158, true); // INPUT_SELECT_WEAPON_MELEE
        mp.game.controls.disableControlAction(32, 159, true); // INPUT_SELECT_WEAPON_HANDGUN
        mp.game.controls.disableControlAction(32, 160, true); // INPUT_SELECT_WEAPON_SHOTGUN
        mp.game.controls.disableControlAction(32, 161, true); // INPUT_SELECT_WEAPON_SMG
        mp.game.controls.disableControlAction(32, 162, true); // INPUT_SELECT_WEAPON_AUTO_RIFLE
        mp.game.controls.disableControlAction(32, 163, true); // INPUT_SELECT_WEAPON_SNIPER
        mp.game.controls.disableControlAction(32, 164, true); // INPUT_SELECT_WEAPON_HEAVY
        mp.game.controls.disableControlAction(32, 165, true); // INPUT_SELECT_WEAPON_SPECIAL
    }

    //Hides current player's weapon HUD data (like ammo)
    mp.game.hud.hideHudComponentThisFrame(2);
    mp.game.hud.hideHudComponentThisFrame(20);
    const onHudOrArena = Browser.currentPage === "hud" || Browser.currentPage === "arena_hud";
    const returningFromMap = Browser.currentPage === undefined && Browser.lastBasePage === "hud";
    if (onHudOrArena || returningFromMap) {
        mp.game.hud.hideHudComponentThisFrame(3);
        mp.game.hud.hideHudComponentThisFrame(4);
    }

    //------------------------------------------------------//
});

mp.events.add("playerEnterVehicle", (vehicle, seat) => {
    if (seat === -1) {
        Client.hud.showVehicleSpeedometer(true);
    }
});

mp.events.add("playerLeaveVehicle", (vehicle, seat) => {
    Client.hud.showVehicleSpeedometer(false);
});
