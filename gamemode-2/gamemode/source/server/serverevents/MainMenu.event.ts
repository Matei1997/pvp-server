import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { joinQueue, joinQueueWithParty } from "@arena/Arena.module";
import { getPartyByPlayer, isLeader } from "@modules/party/PartyManager";
import { getArenaPresets } from "@arena/ArenaPresets.asset";
import { isPlayerInArenaMatch, leaveMatch } from "@arena/ArenaMatch.manager";
import { isPlayerInFfaMatch, leaveFfaMatch } from "@modes/ffa/FfaMatch.manager";
import { joinFfaQueue } from "@modes/ffa/Ffa.module";
import { isPlayerInGunGameMatch, leaveGunGameMatch } from "@modes/gungame/GunGameMatch.manager";
import { joinGunGameQueue } from "@modes/gungame/GunGame.module";
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

RAGERP.cef.register("mainmenu", "requestAdminLevel", (player: PlayerMp) => {
    const level = player?.account?.adminlevel ?? 0;
    RAGERP.cef.emit(player, "mainmenu", "setAdminLevel", { adminLevel: level });
});

RAGERP.cef.register("mainmenu", "requestPlayerList", (player: PlayerMp) => {
    const players = mp.players.toArray().map((p) => ({ id: p.id, name: p.name, ping: p.ping }));
    RAGERP.cef.emit(player, "playerList", "setPlayers", players);
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

    let mode = "hopouts";
    let size: QueueSize = 1;
    let mapId: string | undefined;
    let asParty = false;
    try {
        const parsed = data ? (typeof data === "string" ? JSON.parse(data) : data) : null;
        if (parsed && typeof parsed === "object") {
            if (parsed.mode === "ffa") mode = "ffa";
            if (parsed.mode === "gungame") mode = "gungame";
            if (parsed.size !== undefined) {
                const s = Number(parsed.size);
                if ((QUEUE_SIZES as readonly number[]).includes(s)) size = s as QueueSize;
            }
            if (parsed.map) mapId = String(parsed.map);
            if (parsed.asParty === true) asParty = true;
        }
    } catch {
        /* default */
    }

    if (mode === "ffa") {
        const ok = joinFfaQueue(player);
        if (!ok) {
            RAGERP.cef.emit(player, "mainmenu", "playError", { message: "Could not join FFA queue. You may already be in it." });
        }
        return;
    }

    if (mode === "gungame") {
        const ok = joinGunGameQueue(player);
        if (!ok) {
            RAGERP.cef.emit(player, "mainmenu", "playError", { message: "Could not join Gun Game queue. You may already be in it." });
        }
        return;
    }

    const party = getPartyByPlayer(player);
    const usePartyQueue = asParty && party && isLeader(player);
    const ok = usePartyQueue ? joinQueueWithParty(player, size, mapId) : joinQueue(player, size, mapId);

    if (ok) {
        RAGERP.cef.startPage(player, "arena_lobby");
        RAGERP.cef.emit(player, "system", "setPage", "arena_lobby");
    } else {
        RAGERP.cef.emit(player, "mainmenu", "playError", { message: "Could not join queue. You may already be in it." });
    }
});
