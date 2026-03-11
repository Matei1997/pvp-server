import * as fs from "fs";
import * as path from "path";
import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { getArenaPresets, saveArenaPreset } from "@arena/ArenaPresets.asset";
import { IArenaPreset } from "@arena/ArenaPreset.interface";
import { startSoloMatch } from "@arena/Arena.module";

type ArenaMarkType = "center" | "redspawn" | "bluespawn" | "redcar" | "bluecar" | "safenode";

let attachEditorEditing = false;
const ATTACHMENTS_FILE = path.join(process.cwd(), "attachments.txt");

interface ArenaPresetPoints {
    center?: { x: number; y: number; z: number; heading?: number };
    redspawn?: { x: number; y: number; z: number; heading?: number };
    bluespawn?: { x: number; y: number; z: number; heading?: number };
    redcar?: { x: number; y: number; z: number; heading?: number };
    bluecar?: { x: number; y: number; z: number; heading?: number };
    safeNodes: { x: number; y: number; z: number }[];
}

const arenaMarkedPresets: Map<string, ArenaPresetPoints> = new Map();

const ADMIN_DEV = RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX;

RAGERP.commands.add({
    name: "pos",
    description: "Print current position (x, y, z, heading, dimension)",
    adminlevel: ADMIN_DEV,
    run: (player: PlayerMp) => {
        const { x, y, z } = player.position;
        const heading = player.heading;
        const dim = player.dimension;
        player.outputChatBox(`Position: x=${x.toFixed(2)} y=${y.toFixed(2)} z=${z.toFixed(2)} heading=${heading.toFixed(2)} dimension=${dim}`);
        console.log(`[POS] ${player.name}: x=${x} y=${y} z=${z} heading=${heading} dimension=${dim}`);
    }
});

RAGERP.commands.add({
    name: "tp",
    aliases: ["tpc"],
    description: "Teleport to x y z",
    adminlevel: ADMIN_DEV,
    run: (player: PlayerMp, _fulltext: string, x: string, y: string, z: string) => {
        if (!x || !y || !z) return RAGERP.chat.sendSyntaxError(player, "/tp <x> <y> <z>");
        const px = parseFloat(x);
        const py = parseFloat(y);
        const pz = parseFloat(z);
        if (isNaN(px) || isNaN(py) || isNaN(pz)) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid coordinates.");
        player.position = new mp.Vector3(px, py, pz);
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Teleported to ${px.toFixed(1)}, ${py.toFixed(1)}, ${pz.toFixed(1)}`);
    }
});

RAGERP.commands.add({
    name: "anim",
    description: "Play animation: /anim [dict] [name]",
    adminlevel: ADMIN_DEV,
    run: (player: PlayerMp, _fulltext: string, dict: string, name: string) => {
        if (!dict || !name) return RAGERP.chat.sendSyntaxError(player, "/anim [dict] [name]");
        player.playAnimation(dict, name, 1, 1);
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Animation ${dict}/${name} playing.`);
    }
});

RAGERP.commands.add({
    name: "anims",
    description: "Stop current animation",
    adminlevel: ADMIN_DEV,
    run: (player: PlayerMp) => {
        player.stopAnimation();
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Animation stopped.");
    }
});

RAGERP.commands.add({
    name: "giveweapon",
    aliases: ["givewep"],
    description: "Give weapon: /giveweapon [name] (e.g. weapon_pistol)",
    adminlevel: ADMIN_DEV,
    run: (player: PlayerMp, _fulltext: string, weaponName: string) => {
        if (!weaponName || !weaponName.trim()) return RAGERP.chat.sendSyntaxError(player, "/giveweapon [name]");
        const hash = mp.joaat(weaponName.trim().toLowerCase());
        if (hash === 0) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid weapon name.");
        player.giveWeapon(hash, 999);
        const current = (player.getVariable("weaponsOnBody") as number[]) || [];
        if (!current.includes(hash)) {
            current.push(hash);
            player.setVariable("weaponsOnBody", current);
        }
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Weapon ${weaponName} given.`);
    }
});

RAGERP.commands.add({
    name: "d",
    aliases: ["die", "kill"],
    description: "Kill yourself (for testing)",
    adminlevel: ADMIN_DEV,
    run: (player: PlayerMp) => {
        player.health = 0;
        player.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, "You died.");
    }
});

RAGERP.commands.add({
    name: "mydim",
    description: "Set your own dimension (setdim is admin command for others)",
    adminlevel: ADMIN_DEV,
    run: (player: PlayerMp, _fulltext: string, id: string) => {
        if (!id) return RAGERP.chat.sendSyntaxError(player, "/mydim <id>");
        const dim = parseInt(id, 10);
        if (isNaN(dim) || dim < 0) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid dimension ID.");
        player.dimension = dim;
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Dimension set to ${dim}`);
    }
});

const hopoutsMarkCmd = {
    name: "arena_mark",
    aliases: ["hopouts_mark"],
    description: "Mark a point for Hopouts location (e.g. /arena_mark vespucci_canal center)",
    adminlevel: ADMIN_DEV,
    run: (player: PlayerMp, _fulltext: string, presetId: string, markType: string) => {
        if (!presetId || !markType) return RAGERP.chat.sendSyntaxError(player, "/arena_mark <locationId> <center|redspawn|bluespawn|redcar|bluecar|safenode>");
        const type = markType.toLowerCase() as ArenaMarkType;
        const valid: ArenaMarkType[] = ["center", "redspawn", "bluespawn", "redcar", "bluecar", "safenode"];
        if (!valid.includes(type)) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, `Invalid type. Use: ${valid.join(", ")}`);

        let preset = arenaMarkedPresets.get(presetId);
        if (!preset) {
            preset = { safeNodes: [] };
            arenaMarkedPresets.set(presetId, preset);
        }

        const { x, y, z } = player.position;
        const heading = player.heading;

        if (type === "safenode") {
            preset.safeNodes = preset.safeNodes || [];
            preset.safeNodes.push({ x, y, z });
            player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `[${presetId}] safenode #${preset.safeNodes.length} marked`);
        } else {
            const point = { x, y, z, heading };
            if (type === "center") preset.center = point;
            else if (type === "redspawn") preset.redspawn = point;
            else if (type === "bluespawn") preset.bluespawn = point;
            else if (type === "redcar") preset.redcar = point;
            else if (type === "bluecar") preset.bluecar = point;
            player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `[${presetId}] ${type} marked`);
        }
    }
};
RAGERP.commands.add(hopoutsMarkCmd);

RAGERP.commands.add({
    name: "arena_export",
    description: "Export Hopouts location preset as JSON",
    adminlevel: ADMIN_DEV,
    run: (player: PlayerMp, _fulltext: string, presetId: string) => {
        if (!presetId) return RAGERP.chat.sendSyntaxError(player, "/arena_export <presetId>");
        const preset = arenaMarkedPresets.get(presetId);
        if (!preset) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, `No points marked for preset "${presetId}". Use /arena_mark first.`);

        const exportObj = {
            id: presetId,
            center: preset.center,
            redSpawn: preset.redspawn,
            blueSpawn: preset.bluespawn,
            redCar: preset.redcar,
            blueCar: preset.bluecar,
            safeNodes: preset.safeNodes && preset.safeNodes.length > 0 ? preset.safeNodes : undefined
        };

        const json = JSON.stringify(exportObj, null, 2);
        console.log(`\n--- Hopouts location: ${presetId} ---\n${json}\n---`);
        player.outputChatBox(`${RageShared.Enums.STRINGCOLORS.GREEN}[${presetId}] Exported. Check server console for JSON.`);
    }
});

const hopoutsSaveCmd = {
    name: "arena_save",
    aliases: ["hopouts_save"],
    description: "Save Hopouts location (e.g. /arena_save vespucci_canal \"Vespucci Canal\")",
    adminlevel: ADMIN_DEV,
    run: (player: PlayerMp, _fulltext: string, presetId: string, presetName?: string) => {
        if (!presetId) return RAGERP.chat.sendSyntaxError(player, "/arena_save <locationId> [displayName]");
        const preset = arenaMarkedPresets.get(presetId);
        if (!preset) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, `No points marked for preset "${presetId}". Use /arena_mark first.`);
        if (!preset.center || !preset.redspawn || !preset.bluespawn || !preset.redcar || !preset.bluecar) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Mark center, redspawn, bluespawn, redcar, bluecar first.");
        }

        const name = (presetName && presetName.trim().replace(/"/g, "")) || presetId;
        const toSave: IArenaPreset = {
            id: presetId,
            name,
            center: preset.center,
            redSpawn: preset.redspawn,
            blueSpawn: preset.bluespawn,
            redCar: preset.redcar,
            blueCar: preset.bluecar,
            safeNodes: preset.safeNodes && preset.safeNodes.length > 0 ? preset.safeNodes : undefined
        };

        if (saveArenaPreset(toSave)) {
            player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Hopouts location "${name}" saved.`);
        } else {
            player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Failed to save Hopouts location.");
        }
    }
};
RAGERP.commands.add(hopoutsSaveCmd);

RAGERP.commands.add({
    name: "hopouts_locations",
    aliases: ["arena_locations"],
    description: "List available Hopouts locations",
    run: (player: PlayerMp) => {
        const presets = getArenaPresets();
        if (presets.length === 0) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "No Hopouts locations. Use /arena_mark and /arena_save to create.");
        }
        const list = presets.map((p) => `${p.name} (${p.id})`).join(", ");
        player.outputChatBox(`${RageShared.Enums.STRINGCOLORS.GREEN}Hopouts locations: ${list}`);
    }
});

RAGERP.commands.add({
    name: "hopouts_solo",
    aliases: ["arena_solo"],
    description: "Start a solo Hopouts match for testing (no queue)",
    adminlevel: ADMIN_DEV,
    run: (player: PlayerMp, _fulltext: string, presetId?: string) => {
        if (!player.character) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "No character loaded.");
        if (startSoloMatch(player, presetId?.trim() || undefined)) {
            player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Solo Hopouts match started.");
        } else {
            player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Cannot start. Already in match, or no Hopouts locations. Use /arena_mark and /arena_save first.");
        }
    }
});

// Attachments editor (based on https://github.com/1PepeCortez/Attachments-editor)
RAGERP.commands.add({
    name: "attach",
    description: "Start attach editor: /attach [object_name] (e.g. prop_cs_beer_bot_02)",
    adminlevel: ADMIN_DEV,
    run: (player: PlayerMp, _fulltext: string, objectName?: string) => {
        if (attachEditorEditing) return player.outputChatBox("!{#ff0000}Already editing an object!");
        if (!objectName || !objectName.trim()) return player.outputChatBox("!{#ff0000}/attach [object_name]");
        player.call("attachObject", [objectName.trim()]);
        attachEditorEditing = true;
    }
});

mp.events.add("startEditAttachServer", () => {
    attachEditorEditing = true;
});

mp.events.add("finishAttach", (player: PlayerMp, objectJson: string) => {
    attachEditorEditing = false;
    try {
        const data = JSON.parse(objectJson);
        if (data.cancel === true) return;

        const line = `[ '${data.bodyName}', ${data.boneIndex}, '${data.object}', ${data.body}, ${data.x.toFixed(4)}, ${data.y.toFixed(4)}, ${data.z.toFixed(4)}, ${data.rx.toFixed(4)}, ${data.ry.toFixed(4)}, ${data.rz.toFixed(4)} ],\r\n`;
        player.outputChatBox(line);

        fs.appendFile(ATTACHMENTS_FILE, line, (err) => {
            if (err) console.error("[AttachEditor] Failed to save:", err.message);
        });
    } catch {
        // ignore parse errors
    }
});
