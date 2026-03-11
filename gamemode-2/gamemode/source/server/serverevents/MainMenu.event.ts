import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { joinQueue } from "@arena/Arena.module";
import { getArenaPresets } from "@arena/ArenaPresets.asset";
import { isPlayerInArenaMatch, leaveMatch } from "@arena/ArenaMatch.manager";
import { CharacterEntity } from "@entities/Character.entity";
import { QUEUE_SIZES, QueueSize } from "@arena/ArenaConfig";

RAGERP.cef.register("mainmenu", "playFreeroam", async (player: PlayerMp) => {
    if (!player.character) {
        RAGERP.cef.emit(player, "mainmenu", "playError", { message: "No character loaded." });
        return;
    }
    if (isPlayerInArenaMatch(player)) {
        leaveMatch(player, false);
        RAGERP.cef.emit(player, "arena", "leftMatch", null);
    }

    const LEGION_SQUARE = { x: 213.0, y: -810.0, z: 30.73, heading: 160.0 };
    player.dimension = 0;
    player.setVariable("isSpectating", false);
    player.call("client::player:freeze", [false]);
    player.call("client::arena:zoneClear");
    player.call("client::arena:clearTeam");
    player.spawn(new mp.Vector3(LEGION_SQUARE.x, LEGION_SQUARE.y, LEGION_SQUARE.z));
    player.heading = LEGION_SQUARE.heading;
    player.health = 100;
    player.armour = 100;
    player.call("client::player:setVitals", [100, 100]);

    await RAGERP.database.getRepository(CharacterEntity).update(player.character.id, {
        position: LEGION_SQUARE,
        lastlogin: player.character.lastlogin,
        deathState: player.character.deathState,
        cash: player.character.cash
    });

    player.call("client::cef:close");
    RAGERP.cef.emit(player, "system", "setPage", "hud");
});

RAGERP.cef.register("mainmenu", "openSettings", (player: PlayerMp) => {
    RAGERP.cef.startPage(player, "settings");
    RAGERP.cef.emit(player, "system", "setPage", "settings");
});

RAGERP.cef.register("mainmenu", "getArenaMaps", (player: PlayerMp) => {
    const presets = getArenaPresets();
    (RAGERP.cef.emit as Function)(player, "mainmenu", "setArenaMaps", {
        maps: presets.map((p) => ({ id: p.id, name: p.name }))
    });
});

RAGERP.cef.register("mainmenu", "playArena", async (player: PlayerMp, data?: string) => {
    if (!player.character) {
        RAGERP.cef.emit(player, "mainmenu", "playError", { message: "No character loaded." });
        return;
    }

    let size: QueueSize = 1;
    let mapId: string | undefined;
    try {
        const parsed = data ? (typeof data === "string" ? JSON.parse(data) : data) : null;
        if (parsed && typeof parsed === "object" && parsed.size !== undefined) {
            const s = Number(parsed.size);
            if ((QUEUE_SIZES as readonly number[]).includes(s)) size = s as QueueSize;
        }
        if (parsed && typeof parsed === "object" && parsed.map) {
            mapId = String(parsed.map);
        }
    } catch {
        /* default */
    }

    if (joinQueue(player, size, mapId)) {
        RAGERP.cef.startPage(player, "arena_lobby");
        RAGERP.cef.emit(player, "system", "setPage", "arena_lobby");
    } else {
        RAGERP.cef.emit(player, "mainmenu", "playError", { message: "Could not join queue. You may already be in it." });
    }
});
