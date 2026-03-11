import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { InteractionMenu } from "@classes/Interaction.class";

/**
 * This events are triggered from client-side
 */
mp.events.add("server::vehicle:setTuningMod", (player: PlayerMp, vehicleId: number, modIndex: number, modValue: number) => {
    const vehicle = RAGERP.entities.vehicles.at(vehicleId);
    if (!vehicle || !mp.vehicles.exists(vehicle._vehicle)) return;
    if (!player.vehicle || player.vehicle.id !== vehicle._vehicle.id || player.seat !== 0) return;
    vehicle.setTuningMod(modIndex, modValue);
});

mp.events.add("server::vehicle:setTrunkState", (player: PlayerMp, vehicleid: number, state: boolean) => {
    const vehicle = RAGERP.entities.vehicles.at(vehicleid);
    if (!vehicle || !mp.vehicles.exists(vehicle._vehicle)) return;
    vehicle.setData("trunkState", state);
});

mp.events.add("server::vehicle:setHoodState", (player: PlayerMp, vehicleid: number, state: boolean) => {
    const vehicle = RAGERP.entities.vehicles.at(vehicleid);
    if (!vehicle || mp.vehicles.exists(vehicle._vehicle)) return;
    vehicle.setData("hoodState", state);
});

mp.events.add("server::interaction:vehicle", async (player: PlayerMp, vehicleId: number) => {
    const vehicle = RAGERP.entities.vehicles.at(vehicleId);
    if (!vehicle || !vehicle._vehicle) return;

    player.interactionMenu = new InteractionMenu();

    let interactionData: { id: number; text: string; type: number }[];

    player.vehicle && player.vehicle.id === vehicleId
        ? (interactionData = [
              { id: 0, text: "Toggle Hood", type: 0 },
              { id: 1, text: "Toggle Trunk", type: 1 },
              { id: 2, text: "Lock Vehicle", type: 2 },
              { id: 3, text: `${player.vehicle.engine ? "Turn off Engine" : "Turn on Engine"}`, type: 3 },
              { id: 4, text: "Tune Vehicle", type: 4 }
          ])
        : (interactionData = [
              { id: 0, text: "Toggle Hood", type: 0 },
              { id: 1, text: "Toggle Trunk", type: 1 },
              { id: 2, text: "Lock Vehicle", type: 2 }
          ]);

    const result = await player.interactionMenu.new(player, { isActive: true, items: interactionData });

    if (result === null) return player.interactionMenu?.closeMenu(player);
    switch (result) {
        case 0: {
            vehicle.setData("hoodState", !vehicle.getData("hoodState"));
            break;
        }
        case 1: {
            vehicle.setData("trunkState", !vehicle.getData("trunkState"));
            break;
        }
        case 2: {
            vehicle.setData("locked", !vehicle.getData("locked"));
            break;
        }
        case 3: {
            vehicle.setData("engine", !vehicle.getData("engine"));
            break;
        }
        case 4: {
            RAGERP.cef.startPage(player, "tuner");
            RAGERP.cef.emit(player, "system", "setPage", "tuner");
            RAGERP.cef.emit(player, "tuner", "setData", {
                vehicleId: vehicle._vehicle.id,
                mods: vehicle.getTuningMods()
            });
            break;
        }
    }
    player.interactionMenu?.closeMenu(player);
});

RAGERP.cef.register("tuner", "applyMod", (player: PlayerMp, data: { vehicleId: number; modIndex: number; value: number }) => {
    const vehicle = RAGERP.entities.vehicles.at(data.vehicleId);
    if (!vehicle || !player.vehicle || player.vehicle.id !== vehicle._vehicle.id || player.seat !== 0) return;
    vehicle.setTuningMod(data.modIndex, data.value);
});

RAGERP.cef.register("tuner", "close", (player: PlayerMp) => {
    player.call("client::cef:close");
});

/** Opens the vehicle tuning UI. Must be in driver seat. */
RAGERP.commands.add({
    name: "tune",
    description: "Open the vehicle tuning UI (driver seat only). Or press G on your vehicle and choose 'Tune Vehicle'.",
    run: (player: PlayerMp) => {
        if (!player.vehicle || player.seat !== 0) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You must be in the driver seat to tune.");
        const vehicle = RAGERP.entities.vehicles.at(player.vehicle.id);
        if (!vehicle || !mp.vehicles.exists(vehicle._vehicle)) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "This vehicle cannot be tuned.");
        RAGERP.cef.startPage(player, "tuner");
        RAGERP.cef.emit(player, "system", "setPage", "tuner");
        RAGERP.cef.emit(player, "tuner", "setData", {
            vehicleId: vehicle._vehicle.id,
            mods: vehicle.getTuningMods()
        });
    }
});

RAGERP.commands.add({
    name: "tunemod",
    description: "Set a single mod by index (advanced). Prefer /tune for the tuning UI.",
    run: (player: PlayerMp, _fulltext: string, modIndexStr: string, valueStr: string) => {
        if (!player.vehicle || player.seat !== 0) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You must be in the driver seat.");
        const vehicle = RAGERP.entities.vehicles.at(player.vehicle.id);
        if (!vehicle || !mp.vehicles.exists(vehicle._vehicle)) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "This vehicle cannot be tuned.");
        const modIndex = parseInt(modIndexStr ?? "", 10);
        const value = parseInt(valueStr ?? "-1", 10);
        if (Number.isNaN(modIndex) || Number.isNaN(value)) {
            player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Use /tune to open the tuning UI, or /tunemod <modIndex> <value> (e.g. 0 1 = Spoiler, 55 1 = Window Tint, -1 = stock).");
            return RAGERP.chat.sendSyntaxError(player, "/tunemod <modIndex> <value>");
        }
        vehicle.setTuningMod(modIndex, value);
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Mod ${modIndex} set to ${value}.`);
    }
});
