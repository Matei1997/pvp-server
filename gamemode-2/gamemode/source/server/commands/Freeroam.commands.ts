import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { weaponHash } from "@assets/Weapons.assets";

/**
 * Freeroam mode: players can set their own dimension, spawn vehicles, and spawn weapons for FFA.
 */

RAGERP.commands.add({
    name: "freeroam",
    aliases: ["ffa", "fr"],
    description: "Show freeroam commands",
    run: (player: PlayerMp) => {
        player.outputChatBox(`${RageShared.Enums.STRINGCOLORS.GREEN}--- Freeroam / FFA ---`);
        player.outputChatBox(`${RageShared.Enums.STRINGCOLORS.WHITE}/fdim <id> - Set your dimension (private instance)`);
        player.outputChatBox(`${RageShared.Enums.STRINGCOLORS.WHITE}/fveh <model> - Spawn vehicle (e.g. sultan, infernus)`);
        player.outputChatBox(`${RageShared.Enums.STRINGCOLORS.WHITE}/fgun <weapon> - Give weapon (e.g. pistol, assaultrifle)`);
        player.outputChatBox(`${RageShared.Enums.STRINGCOLORS.WHITE}/poligon - Teleport to shooting range`);
    }
});

const SHOOTING_RANGE_POS = new mp.Vector3(821.5705, -2163.812, 29.656);

RAGERP.commands.add({
    name: "poligon",
    aliases: ["shootingrange", "range"],
    description: "Teleport to shooting range (45 targets, Assault Rifle + Carbine Rifle)",
    run: (player: PlayerMp) => {
        if (!player.getVariable("loggedin")) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You must be logged in.");
        const weapons = [weaponHash.assaultrifle, weaponHash.carbinerifle];
        weapons.forEach((w) => player.giveWeaponEx(w, 1000, 30));
        player.setVariable("weaponsOnBody", weapons);
        player.position = SHOOTING_RANGE_POS;
        player.call("client::shootingrange:start");
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Shooting range started! Hit 45 targets.");
    }
});

mp.events.add("FinishedPoligon", (player: PlayerMp, points: number) => {
    player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Shooting range complete! Score: ${points} points`);
});

RAGERP.commands.add({
    name: "fdim",
    aliases: ["dimension"],
    description: "Set your dimension (private instance for you and your group)",
    run: (player: PlayerMp, _fulltext: string, id: string) => {
        if (!player.getVariable("loggedin")) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You must be logged in.");
        if (!id) return RAGERP.chat.sendSyntaxError(player, "/fdim <id>");
        const dim = parseInt(id, 10);
        if (isNaN(dim) || dim < 0) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid dimension ID (use 0 or positive number).");
        player.dimension = dim;
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Dimension set to ${dim}`);
    }
});

RAGERP.commands.add({
    name: "fveh",
    aliases: ["fcar"],
    description: "Spawn a vehicle (e.g. /fveh sultan, /fveh infernus)",
    run: (player: PlayerMp, _fulltext: string, model: string) => {
        if (!player.getVariable("loggedin")) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You must be logged in.");
        if (!model || !model.trim()) return RAGERP.chat.sendSyntaxError(player, "/fveh <model>");

        const modelName = model.trim().toLowerCase().replace(/^vehicle_/, "");
        const hash = mp.joaat(modelName);
        if (hash === 0 || hash === mp.joaat("null")) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, `Unknown vehicle model: ${model}`);
        }

        const vehicle = new RAGERP.entities.vehicles.new(
            RageShared.Vehicles.Enums.VEHICLETYPES.FREEROAM,
            modelName,
            player.position,
            player.heading,
            player.dimension
        );
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Spawned ${modelName}`);
    }
});

RAGERP.commands.add({
    name: "fgun",
    aliases: ["fweapon", "gun", "wep"],
    description: "Give yourself a weapon (e.g. /fgun pistol, /gun assaultrifle)",
    run: (player: PlayerMp, _fulltext: string, weaponName: string) => {
        if (!player.getVariable("loggedin")) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You must be logged in.");
        if (!weaponName || !weaponName.trim()) return RAGERP.chat.sendSyntaxError(player, "/fgun <weapon>");

        const name = weaponName.trim().toLowerCase().replace(/^weapon_/, "").replace(/\s+/g, "_").replace(/-/g, "_");
        const hash = weaponHash[name] ?? mp.joaat(`weapon_${name}`);
        if (!hash || hash === mp.joaat("weapon_unarmed")) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, `Unknown weapon: ${weaponName}. Try: pistol, smg, assaultrifle, shotgun, sniperrifle`);
        }

        const ammo = 999;
        player.giveWeaponEx(hash, ammo, 30);
        const current = (player.getVariable("weaponsOnBody") as number[]) || [];
        if (!current.includes(hash)) {
            current.push(hash);
            player.setVariable("weaponsOnBody", current);
        }
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Gave ${weaponName}`);
    }
});
