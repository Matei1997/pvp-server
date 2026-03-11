import { RAGERP } from "@api";
import { AccountEntity } from "@entities/Account.entity";
import { BanEntity } from "@entities/Ban.entity";
import { RageShared } from "@shared/index";
import { adminTeleports } from "@assets/Admin.asset";
import { NativeMenu } from "@classes/NativeMenu.class";
import { getRecentDamageLogsFor, getRecentKillLogsFor } from "../admin/AdminLog.manager";
import { openReportPanel, openStaffPanel } from "@events/Report.event";
import { startSpectate, stopSpectate } from "@events/Player.event";

RAGERP.commands.add({
    name: "goto",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp, fulltext: string, targetorpos: string) => {
        const showAvailableLocations = () => {
            RAGERP.chat.sendSyntaxError(player, "/goto [player/location]");
            const keys = Object.keys(adminTeleports);
            for (let i = 0; i < keys.length; i += 8) {
                const chunk = keys.slice(i, i + 8);
                player.outputChatBox(`${RageShared.Enums.STRINGCOLORS.YELLOW}Available locations: ${RageShared.Enums.STRINGCOLORS.GREY} ${chunk.join(", ")}`);
            }
        };

        if (!fulltext.length || !targetorpos.length) {
            showAvailableLocations();
            return;
        }

        const targetplayer = mp.players.getPlayerByName(targetorpos);

        if (targetplayer && mp.players.exists(targetplayer)) {
            player.position = targetplayer.position;
            player.dimension = targetplayer.dimension;
            player.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, `You teleported to ${targetplayer.name}`);
        } else {
            const targetpos = adminTeleports[targetorpos];
            if (targetpos) {
                player.position = targetpos;
                player.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, `You teleported to ${targetorpos}`);
            } else {
                showAvailableLocations();
            }
        }
    }
});

RAGERP.commands.add({
    name: "gethere",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp, fulltext: string, target: string) => {
        if (!fulltext.length || !target.length) {
            return RAGERP.chat.sendSyntaxError(player, "/gethere [player]");
        }

        const targetplayer = mp.players.getPlayerByName(target);

        if (!targetplayer || !mp.players.exists(targetplayer)) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Player not found");
        }

        targetplayer.position = player.position;
        targetplayer.dimension = player.dimension;
        targetplayer.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, `${player.name} teleported you to them`);
        player.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, `You teleported ${targetplayer.name} to you`);
    }
});

RAGERP.commands.add({
    name: "giveclothes",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp, fulltext: string, target: string, item: string, comp: string, drawable: string, texture: string) => {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Inventory system has been removed.");
    }
});

RAGERP.commands.add({
    name: "giveitem",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp, fulltext: string, target: string, item: string, count: string) => {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Inventory system has been removed.");
    }
});

RAGERP.commands.add({
    name: "spawnitem",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: async (player: PlayerMp) => {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Inventory system has been removed.");
    }
});

RAGERP.commands.add({
    name: "listplayers",
    aliases: ["players", "online"],
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    description: "List all online players",
    run: (player: PlayerMp) => {
        player.outputChatBox(`${RageShared.Enums.STRINGCOLORS.GREEN}____________[ONLINE PLAYERS]____________`);
        mp.players.forEach((p) => {
            if (p && mp.players.exists(p)) {
                const charName = p.character?.name ?? "N/A";
                player.outputChatBox(`ID ${p.id} | ${p.name} | ${charName} | Ping: ${p.ping} | Dim: ${p.dimension}`);
            }
        });
        player.outputChatBox(`${RageShared.Enums.STRINGCOLORS.GREEN}Total: ${mp.players.length} players`);
    }
});

RAGERP.commands.add({
    name: "setadmin",
    description: "Set a player's admin level (0-6). Need level 6 to use arena_mark/arena_save.",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: async (player: PlayerMp, _fulltext: string, targetName: string, levelStr: string) => {
        if (!targetName || levelStr === undefined) return RAGERP.chat.sendSyntaxError(player, "/setadmin [username] [0-6]");
        const level = parseInt(levelStr, 10);
        if (isNaN(level) || level < 0 || level > 6) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Level must be 0-6.");
        const repo = RAGERP.database.getRepository(AccountEntity);
        const account = await repo.findOne({ where: { username: targetName.toLowerCase() } });
        if (!account) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Account not found.");
        account.adminlevel = level;
        await repo.save(account);
        const target = mp.players.getPlayerByName(targetName);
        if (target && mp.players.exists(target) && target.account) target.account.adminlevel = level;
        if (target && mp.players.exists(target)) target.setVariable("adminLevel", level);
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `${targetName} admin level set to ${level}.`);
    }
});

RAGERP.commands.add({
    name: "esp",
    description: "Toggle ESP overlay: /esp [0=off,1=players,2=all]",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp, _fulltext: string, modeStr: string) => {
        const mode = Math.max(0, Math.min(2, parseInt(modeStr ?? "0", 10) || 0));
        player.call("Admin-ToggleESP", [mode]);
        player.showNotify(
            RageShared.Enums.NotifyType.TYPE_INFO,
            mode > 0 ? `ESP enabled (${mode === 1 ? "players" : "players + vehicles"})` : "ESP disabled"
        );
    }
});

RAGERP.commands.add({
    name: "gm",
    description: "Toggle admin godmode for yourself.",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp) => {
        const current = player.getVariable("AGM") as boolean | undefined;
        const next = !current;
        player.setVariable("AGM", next);
        player.call("Admin-SetGM", [next]);
        player.showNotify(
            RageShared.Enums.NotifyType.TYPE_INFO,
            `Godmode ${next ? "enabled" : "disabled"}`
        );
    }
});

RAGERP.commands.add({
    name: "inv",
    description: "Toggle admin invisibility for yourself.",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp) => {
        const alpha = player.alpha ?? 255;
        const nextAlpha = alpha === 0 ? 255 : 0;
        player.alpha = nextAlpha;
        player.setVariable("invisible", nextAlpha === 0);
        player.showNotify(
            RageShared.Enums.NotifyType.TYPE_INFO,
            `Invisibility ${nextAlpha === 0 ? "enabled" : "disabled"}`
        );
    }
});

RAGERP.commands.add({
    name: "aspec",
    description: "Spectate a player by ID: /aspec [id]",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp, _fulltext: string, targetIdStr: string) => {
        const id = parseInt(targetIdStr ?? "", 10);
        if (isNaN(id)) {
            return RAGERP.chat.sendSyntaxError(player, "/aspec [id]");
        }
        const target = mp.players.at(id);
        if (!target || !mp.players.exists(target)) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Player not found.");
        }
        if (target.id === player.id) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You can't spectate yourself.");
        }
        startSpectate(player, target);
        player.showNotify(
            RageShared.Enums.NotifyType.TYPE_INFO,
            `Now spectating ${target.name} (#${target.id})`
        );
    }
});

RAGERP.commands.add({
    name: "aspecoff",
    description: "Stop spectating.",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp) => {
        if (!player.getVariable("isSpectating")) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You are not spectating.");
        }
        stopSpectate(player);
        player.showNotify(
            RageShared.Enums.NotifyType.TYPE_INFO,
            "Spectate stopped."
        );
    }
});

RAGERP.commands.add({
    name: "admglog",
    description: "Show recent damage logs for a player: /admglog [id]",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp, _fulltext: string, targetIdStr: string) => {
        const id = parseInt(targetIdStr ?? "", 10);
        if (isNaN(id)) {
            return RAGERP.chat.sendSyntaxError(player, "/admglog [id]");
        }
        const target = mp.players.at(id);
        if (!target || !mp.players.exists(target)) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Player not found.");
        }
        const logs = getRecentDamageLogsFor(target, 20);
        if (!logs.length) {
            return player.showNotify(
                RageShared.Enums.NotifyType.TYPE_INFO,
                `No damage logs found for ${target.name}.`
            );
        }
        player.outputChatBox(
            `${RageShared.Enums.STRINGCOLORS.YELLOW}[DMG LOG] Last ${logs.length} hits for ${target.name}:`
        );
        logs.forEach((e) => {
            const when = new Date(e.timestamp).toLocaleTimeString();
            player.outputChatBox(
                `${RageShared.Enums.STRINGCOLORS.GREY}${when} | ${e.attackerName} -> ${e.victimName} | dmg ${e.damage.toFixed(
                    1
                )} | dist ${e.distance.toFixed(1)} | arena: ${e.inArena ? "Y" : "N"}`
            );
        });
    }
});

RAGERP.commands.add({
    name: "akilllog",
    description: "Show recent kill logs for a player: /akilllog [id]",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp, _fulltext: string, targetIdStr: string) => {
        const id = parseInt(targetIdStr ?? "", 10);
        if (isNaN(id)) {
            return RAGERP.chat.sendSyntaxError(player, "/akilllog [id]");
        }
        const target = mp.players.at(id);
        if (!target || !mp.players.exists(target)) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Player not found.");
        }
        const logs = getRecentKillLogsFor(target, 20);
        if (!logs.length) {
            return player.showNotify(
                RageShared.Enums.NotifyType.TYPE_INFO,
                `No kill logs found for ${target.name}.`
            );
        }
        player.outputChatBox(
            `${RageShared.Enums.STRINGCOLORS.YELLOW}[KILL LOG] Last ${logs.length} deaths/kills for ${target.name}:`
        );
        logs.forEach((e) => {
            const when = new Date(e.timestamp).toLocaleTimeString();
            const killer = e.killerName ?? "N/A";
            player.outputChatBox(
                `${RageShared.Enums.STRINGCOLORS.GREY}${when} | ${killer} -> ${e.victimName} | arena: ${
                    e.inArena ? "Y" : "N"
                } | reason: ${e.reason ?? -1}`
            );
        });
    }
});

RAGERP.commands.add({
    name: "report",
    description: "Open report panel to submit or view your reports",
    run: (player: PlayerMp) => {
        if (!player.getVariable?.("loggedin")) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You must be logged in.");
        openReportPanel(player);
    }
});

RAGERP.commands.add({
    name: "reports",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    description: "Open staff reports panel",
    run: (player: PlayerMp) => openStaffPanel(player)
});

