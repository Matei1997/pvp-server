import { RageShared } from "@shared";
import { weaponList } from "@assets/Weapons.assets";
import { Browser } from "./Browser.class";

export class PlayerHud {
    onlinePlayersCounter: NodeJS.Timeout | null = null;
    weaponInterval: NodeJS.Timeout | null = null;
    zoneInterval: NodeJS.Timeout | null = null;
    /** Last server-authoritative vitals; pushed to CEF every frame when on freeroam HUD (same behavior as reference custom_ui). */
    lastVitals: { health: number; armour: number } = { health: 100, armour: 100 };

    constructor() {
        this.onlinePlayersCounter = setInterval(this.setOnlinePlayers.bind(this), 5_000);
        this.weaponInterval = setInterval(this.trackPlayerWeapon.bind(this), 100);
        this.zoneInterval = setInterval(this.trackPlayerZone.bind(this), 1_000);
        this.setPlayerData("id", mp.players.local.remoteId);

        mp.events.add("playerEnterVehicle", this.playerEnterVehicle.bind(this));
        mp.events.add("playerLeaveVehicle", this.playerExitVehicle.bind(this));
        mp.events.add("render", this.pushVitalsToCefEveryFrame.bind(this));
    }

    /** Push last server vitals to CEF every frame when on freeroam HUD so display stays in sync (like reference custom_ui). */
    private pushVitalsToCefEveryFrame(): void {
        if (!Browser.currentPage || Browser.currentPage !== "hud") return;
        this.setPlayerData("health", this.lastVitals.health);
        this.setPlayerData("armour", this.lastVitals.armour);
    }

    //#region PLAYER RELATED
    public trackPlayerZone() {
        const arename = mp.game.hud.getCurrentAreaNameString();
        const streetName = mp.game.hud.getCurrentStreetNameString();
        Browser.processEvent("cef::hud:setAreaData", { area: arename, street: streetName });
    }

    public trackPlayerWeapon() {
        if (!mp.players.local.getVariable("loggedin") || mp.players.local.isJumping()) return;

        /*
         * Tracks weapon data and sends them to CEF
         */
        const { handle, weapon } = mp.players.local;
        const weaponName = weaponList[weapon];

        // Fix for vehicle ammo disappearance: don't update to "unarmed" if in a vehicle
        // This ensures the last active weapon remains visible on the HUD while stowed in the car
        if (!(mp.players.local.vehicle && weaponName === "weapon_unarmed")) {
            const weaponAmmo = mp.players.local.getAmmoInClip(weapon);
            const maxammo = mp.game.weapon.getAmmoInPed(handle, weapon) - weaponAmmo;
            this.setPlayerData("weapondata", { weapon: weaponName, ammo: weaponAmmo, maxammo: maxammo });
        }

        // Don't send health/armour from engine — they're server-authoritative; server pushes setVitals on damage/spawn so UI stays in sync like native
        this.setPlayerData("name", mp.players.local.name ?? "");
        this.setPlayerData("kills", (mp.players.local.getVariable("freeroamKills") as number) ?? 0);
    }

    /**
     * Sets how many players are online in HUD.
     * @returns void
     */
    public setOnlinePlayers() {
        if (!mp.players.local.getVariable("loggedin")) return;
        return Browser.processEvent("cef::player:setNowPlaying", mp.players.length);
    }
    /**
     * Updates server-authoritative vitals (stored and pushed every frame when on hud).
     */
    public setVitals(health: number, armour: number): void {
        this.lastVitals.health = health;
        this.lastVitals.armour = armour;
        this.setPlayerData("health", health);
        this.setPlayerData("armour", armour);
    }

    /**
     * Changes a player-related HUD parameter (see IPlayerData)
     * @param key which data to change
     * @param value value to set to the data you're about to change
     * @returns void
     */
    public setPlayerData<K extends keyof RageShared.Players.Interfaces.IPlayerData>(key: K, value: RageShared.Players.Interfaces.IPlayerData[K]) {
        return Browser.processEvent("cef::player:setPlayerData", key, value);
    }
    //#endregion

    //#region VEHICLE RELATED

    public playerEnterVehicle(vehicle: VehicleMp, seat: number) {
        if (!mp.players.local.getVariable("loggedin")) return;
        if (seat !== -1) return;
        const vehicleClass = vehicle.getClass();
        if (vehicleClass === RageEnums.Vehicle.Classes.CYCLES) return;
        this.showVehicleSpeedometer(true);
    }
    public playerExitVehicle() {
        if (!mp.players.local.getVariable("loggedin")) return;
        this.showVehicleSpeedometer(false);
    }

    /**
     * Show or hide vehicle speedometer for local player.
     * @param enable Whether to display or not vehicle speedometer
     * @returns void
     */
    public showVehicleSpeedometer(enable: boolean) {
        return this.setSpeedometerData("isActive", enable);
    }

    /**
     * Update a value on vehicle's speedometer
     * @param data Which data to set eg: 'speed'
     * @param value The value to set to the data
     * @returns void;
     */
    public setSpeedometerData<K extends keyof RageShared.Vehicles.Interfaces.SpeedometerData>(data: K, value: RageShared.Vehicles.Interfaces.SpeedometerData[K]) {
        return Browser.processEvent("cef::hud:setVehicleData", { key: data, data: value });
    }
    //#endregion
}
